require "test_helper"

class StudentProjectsTest < ActionDispatch::IntegrationTest
  setup do
    @student = User.create!(email: "student@example.test", display_name: "Student", role: "student", password: "safe-test-password")
    @other = User.create!(email: "other@example.test", display_name: "Other", role: "student", password: "safe-test-password")
    @student_token = sign_in(@student)
    @other_token = sign_in(@other)
  end

  test "student can create and update only their own project" do
    post "/api/v1/projects", params: { project: { title: "Water alarm", description: "Detect rising water levels near our school", level: "SHS", category: "Electrical" } }, headers: auth(@student_token)
    assert_response :created
    project_id = response.parsed_body.dig("project", "id")
    milestone_id = response.parsed_body.dig("project", "milestones", 0, "id")
    assert_equal 6, response.parsed_body.dig("project", "milestones").size

    patch "/api/v1/projects/#{project_id}/milestones/#{milestone_id}", params: { done: true }, headers: auth(@student_token), as: :json
    assert_response :success
    assert response.parsed_body.dig("milestone", "done")

    post "/api/v1/projects/#{project_id}/log_entries", params: { log_entry: { body: "I tested the sensor in a bucket." } }, headers: auth(@student_token)
    assert_response :created

    get "/api/v1/projects/#{project_id}", headers: auth(@other_token)
    assert_response :not_found
    patch "/api/v1/projects/#{project_id}/milestones/#{milestone_id}", params: { done: false }, headers: auth(@other_token), as: :json
    assert_response :not_found
    post "/api/v1/projects/#{project_id}/log_entries", params: { log_entry: { body: "Tampered note" } }, headers: auth(@other_token)
    assert_response :not_found
  end

  test "anonymous requests cannot list projects" do
    get "/api/v1/projects"
    assert_response :unauthorized
  end

  test "owner field from request cannot reassign project" do
    post "/api/v1/projects", params: { project: { title: "Solar charger", description: "A charger for our classroom phones", level: "SHS", category: "Electrical", owner_id: @other.id } }, headers: auth(@student_token)
    assert_response :created
    assert_equal @student.id, StudentProject.find(response.parsed_body.dig("project", "id")).owner_id
  end

  private

  def sign_in(user)
    post "/api/v1/session", params: { email: user.email, password: "safe-test-password" }
    assert_response :created
    response.parsed_body.fetch("token")
  end

  def auth(token)
    { "Authorization" => "Bearer #{token}" }
  end
end
