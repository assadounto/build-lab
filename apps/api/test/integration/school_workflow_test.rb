require "test_helper"

class SchoolWorkflowTest < ActionDispatch::IntegrationTest
  setup do
    @school = School.create!(name: "Accra Academy")
    @admin = User.create!(email: "admin@example.test", display_name: "Admin", role: "school_admin", password: "safe-test-password")
    @teacher = User.create!(email: "teacher@example.test", display_name: "Teacher", role: "teacher", password: "safe-test-password")
    @outsider = User.create!(email: "outsider@example.test", display_name: "Outsider", role: "teacher", password: "safe-test-password")
    SchoolMembership.create!(school: @school, user: @admin, role: "school_admin")
    SchoolMembership.create!(school: @school, user: @teacher, role: "teacher")
    @admin_token = sign_in(@admin)
    @teacher_token = sign_in(@teacher)
    @outsider_token = sign_in(@outsider)
  end

  test "admin provisions student and teacher assigns work only within school" do
    post "/api/v1/schools/#{@school.id}/invitations", params: { invitation: { email: "learner@example.test", display_name: "Learner", role: "student" } }, headers: auth(@admin_token)
    assert_response :created
    code = response.parsed_body.fetch("activation_code")

    post "/api/v1/invitations/accept", params: { invitation: { code: code, password: "new-safe-password" } }
    assert_response :created
    learner = User.find_by!(email: "learner@example.test")

    post "/api/v1/invitations/accept", params: { invitation: { code: code, password: "new-safe-password" } }
    assert_response :unprocessable_entity

    post "/api/v1/schools/#{@school.id}/classrooms", params: { classroom: { name: "SHS 1 Science", level: "SHS", teacher_id: @teacher.id } }, headers: auth(@admin_token)
    assert_response :created
    classroom_id = response.parsed_body.dig("classroom", "id")

    post "/api/v1/classrooms/#{classroom_id}/enrollments", params: { student_id: learner.id }, headers: auth(@teacher_token)
    assert_response :created

    post "/api/v1/classrooms/#{classroom_id}/assignments", params: { assignment: { title: "Water alarm", description: "Build and test a low-cost flood alarm", category: "Electronics" } }, headers: auth(@teacher_token)
    assert_response :created
    assert_equal 1, StudentProject.where(owner: learner).count

    get "/api/v1/classrooms/#{classroom_id}/progress", headers: auth(@teacher_token)
    assert_response :success
    assert_equal learner.id, response.parsed_body.dig("assignments", 0, "students", 0, "student_id")

    get "/api/v1/classrooms/#{classroom_id}/progress", headers: auth(@outsider_token)
    assert_response :not_found
  end

  test "teacher cannot create invitations or classes" do
    post "/api/v1/schools/#{@school.id}/invitations", params: { invitation: { email: "child@example.test", display_name: "Child", role: "student" } }, headers: auth(@teacher_token)
    assert_response :forbidden
    post "/api/v1/schools/#{@school.id}/classrooms", params: { classroom: { name: "SHS 2", level: "SHS", teacher_id: @teacher.id } }, headers: auth(@teacher_token)
    assert_response :forbidden
  end

  private

  def sign_in(user)
    post "/api/v1/session", params: { email: user.email, password: "safe-test-password" }
    response.parsed_body.fetch("token")
  end

  def auth(token)
    { "Authorization" => "Bearer #{token}" }
  end
end
