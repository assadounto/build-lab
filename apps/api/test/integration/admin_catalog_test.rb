require "test_helper"

class AdminCatalogTest < ActionDispatch::IntegrationTest
  setup do
    @admin = User.create!(email: "admin@example.test", display_name: "Editor", role: "platform_admin", password: "safe-test-password")
    @student = User.create!(email: "viewer@example.test", display_name: "Viewer", role: "student", password: "safe-test-password")
    @admin_token = sign_in(@admin)
    @student_token = sign_in(@student)
  end

  test "only platform admins can manage catalogue content" do
    get "/api/v1/admin/overview"
    assert_response :unauthorized
    get "/api/v1/admin/categories", headers: auth(@student_token)
    assert_response :forbidden
    post "/api/v1/admin/categories", params: { category: { name: "Hidden" } }, headers: auth(@student_token)
    assert_response :forbidden
    get "/api/v1/admin/overview", headers: auth(@admin_token)
    assert_response :success
  end

  test "categories support one nested level and preserve unique slugs" do
    existing_count = CatalogCategory.count
    parent = create_category("Test Materials")
    child = create_category("Test Composites", parent)
    assert_equal parent, CatalogCategory.find(child).parent_id
    post "/api/v1/admin/categories", params: { category: { name: "Further nested", parent_id: child } }, headers: auth(@admin_token)
    assert_response :unprocessable_entity
    post "/api/v1/admin/categories", params: { category: { name: "Test Materials" } }, headers: auth(@admin_token)
    assert_response :unprocessable_entity
    get "/api/v1/catalog/categories"
    assert_response :success
    assert_equal existing_count + 2, response.parsed_body.fetch("categories").length
  end

  test "draft projects and courses are private until publishing" do
    category_id = CatalogCategory.find_by!(slug: "robotics").id
    post "/api/v1/admin/projects", params: { project: { title: "Build a sensor", summary: "A practical sensor build", description: "Design and test a useful device.", level: "SHS", format: "Hybrid", duration: "3 weeks", catalog_category_id: category_id } }, headers: auth(@admin_token)
    assert_response :created
    project_id = response.parsed_body.dig("project", "id")
    project_slug = response.parsed_body.dig("project", "slug")
    assert_equal @admin.id, CatalogProject.find(project_id).created_by_id
    get "/api/v1/catalog/projects"
    assert_not_includes response.parsed_body.fetch("projects").map { |item| item.fetch("slug") }, project_slug
    get "/api/v1/catalog/projects/#{project_slug}"
    assert_response :not_found
    patch "/api/v1/admin/projects/#{project_id}", params: { project: { status: "published" } }, headers: auth(@student_token)
    assert_response :forbidden
    patch "/api/v1/admin/projects/#{project_id}", params: { project: { status: "published" } }, headers: auth(@admin_token)
    assert_response :success
    get "/api/v1/catalog/projects/#{project_slug}"
    assert_response :success
    assert_equal "Robotics", response.parsed_body.dig("project", "category", "name")

    post "/api/v1/admin/courses", params: { course: { title: "Robotics foundations", summary: "Make your first robot", description: "Understand motion and sensors.", level: "Beginner", hours: 6, catalog_category_id: category_id } }, headers: auth(@admin_token)
    assert_response :created
    course_id = response.parsed_body.dig("course", "id")
    patch "/api/v1/admin/courses/#{course_id}", params: { course: { status: "published" } }, headers: auth(@admin_token)
    assert_response :unprocessable_entity
    assert_equal "draft", CatalogCourse.find(course_id).status
    patch "/api/v1/admin/courses/#{course_id}", params: { course: { status: "published", lessons: [{ title: "Motion", summary: "Build with motors" }] } }, headers: auth(@admin_token), as: :json
    assert_response :success
    get "/api/v1/catalog/courses/robotics-foundations"
    assert_response :success
    assert_equal "Motion", response.parsed_body.dig("course", "lessons", 0, "title")
    patch "/api/v1/admin/courses/#{course_id}", params: { course: { status: "draft" } }, headers: auth(@admin_token)
    assert_response :success
    get "/api/v1/catalog/courses/robotics-foundations"
    assert_response :not_found
  end

  test "featured entries are real editable records and public pages respect publication" do
    featured = CatalogProject.find_by!(slug: "solar-rover")
    assert_equal "published", featured.status
    assert featured.brief.fetch("phases").any?
    assert CatalogCourse.find_by!(slug: "electronics-from-zero").catalog_lessons.any?
    get "/api/v1/admin/projects", headers: auth(@admin_token)
    assert_includes response.parsed_body.fetch("projects").map { |item| item.fetch("slug") }, featured.slug

    patch "/api/v1/admin/projects/#{featured.id}", params: { project: { title: "Updated rover build", description: "Updated project description", brief: featured.brief.merge("outcome" => "Updated test outcome") } }, headers: auth(@admin_token), as: :json
    assert_response :success
    get "/api/v1/catalog/projects/solar-rover"
    assert_equal "Updated rover build", response.parsed_body.dig("project", "title")
    assert_equal "Updated test outcome", response.parsed_body.dig("project", "brief", "outcome")
    category = featured.catalog_category
    patch "/api/v1/admin/categories/#{category.id}", params: { category: { name: "Robotics and Automation" } }, headers: auth(@admin_token)
    assert_response :success
    get "/api/v1/catalog/projects/solar-rover"
    assert_equal "Robotics and Automation", response.parsed_body.dig("project", "category", "name")

    course = CatalogCourse.find_by!(slug: "electronics-from-zero")
    patch "/api/v1/admin/courses/#{course.id}", params: { course: { title: "Electronics essentials", lessons: [{ title: "Safety first", summary: "Plan a safe circuit" }] } }, headers: auth(@admin_token), as: :json
    assert_response :success
    get "/api/v1/catalog/courses/electronics-from-zero"
    assert_equal "Electronics essentials", response.parsed_body.dig("course", "title")
    assert_equal "Safety first", response.parsed_body.dig("course", "lessons", 0, "title")

    patch "/api/v1/admin/projects/#{featured.id}", params: { project: { status: "draft" } }, headers: auth(@admin_token)
    assert_response :success
    get "/api/v1/catalog/projects/solar-rover"
    assert_response :not_found
    get "/api/v1/catalog/projects"
    assert_not_includes response.parsed_body.fetch("projects").map { |item| item.fetch("slug") }, "solar-rover"
  end

  private

  def create_category(name, parent_id = nil)
    post "/api/v1/admin/categories", params: { category: { name: name, parent_id: parent_id } }, headers: auth(@admin_token)
    assert_response :created
    response.parsed_body.dig("category", "id")
  end

  def sign_in(user)
    post "/api/v1/session", params: { email: user.email, password: "safe-test-password" }
    response.parsed_body.fetch("token")
  end

  def auth(token)
    { "Authorization" => "Bearer #{token}" }
  end
end
