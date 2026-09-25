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
    parent = create_category("Computer Science")
    child = create_category("Cybersecurity", parent)
    assert_equal parent, CatalogCategory.find(child).parent_id
    post "/api/v1/admin/categories", params: { category: { name: "Further nested", parent_id: child } }, headers: auth(@admin_token)
    assert_response :unprocessable_entity
    post "/api/v1/admin/categories", params: { category: { name: "Computer Science" } }, headers: auth(@admin_token)
    assert_response :unprocessable_entity
    get "/api/v1/catalog/categories"
    assert_response :success
    assert_equal 2, response.parsed_body.fetch("categories").length
  end

  test "draft projects and courses are private until publishing" do
    category_id = create_category("Robotics")
    post "/api/v1/admin/projects", params: { project: { title: "Build a sensor", summary: "A practical sensor build", description: "Design and test a useful device.", level: "SHS", format: "Hybrid", duration: "3 weeks", catalog_category_id: category_id } }, headers: auth(@admin_token)
    assert_response :created
    project_id = response.parsed_body.dig("project", "id")
    project_slug = response.parsed_body.dig("project", "slug")
    assert_equal @admin.id, CatalogProject.find(project_id).created_by_id
    get "/api/v1/catalog/projects"
    assert_empty response.parsed_body.fetch("projects")
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
