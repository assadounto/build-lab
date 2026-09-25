require "test_helper"

class CommunityTest < ActionDispatch::IntegrationTest
  setup do
    @school = School.create!(name: "School A")
    @other_school = School.create!(name: "School B")
    @student = User.create!(email: "student-community@example.test", display_name: "Student", role: "student", password: "safe-test-password")
    @teacher = User.create!(email: "teacher-community@example.test", display_name: "Teacher", role: "teacher", password: "safe-test-password")
    @outsider = User.create!(email: "outsider-community@example.test", display_name: "Outsider", role: "student", password: "safe-test-password")
    SchoolMembership.create!(school: @school, user: @student, role: "student")
    SchoolMembership.create!(school: @school, user: @teacher, role: "teacher")
    SchoolMembership.create!(school: @other_school, user: @outsider, role: "student")
  end

  test "student post stays private until teacher approves, outsiders never see it" do
    post "/api/v1/community_posts", params: { post: { school_id: @school.id, title: "How can we measure local water levels?", body: "Our team wants to build an early flood alarm for nearby homes." } }, headers: auth(@student)
    assert_response :created
    id = response.parsed_body.dig("post", "id")
    assert_equal "pending", response.parsed_body.dig("post", "status")
    get "/api/v1/community_posts", headers: auth(@student)
    assert_empty response.parsed_body.fetch("posts")
    assert_equal id, response.parsed_body.dig("mine_pending", 0, "id")
    patch "/api/v1/community_posts/#{id}/approve", headers: auth(@student)
    assert_response :not_found
    patch "/api/v1/community_posts/#{id}/approve", headers: auth(@teacher)
    assert_response :success
    get "/api/v1/community_posts", headers: auth(@outsider)
    assert_empty response.parsed_body.fetch("posts")
    get "/api/v1/community_posts/#{id}", headers: auth(@outsider)
    assert_response :not_found
  end

  test "student comments wait for teacher approval" do
    item = CommunityPost.create!(school: @school, author: @teacher, title: "Build a rain gauge", body: "Share ideas for measuring rain in our school garden.", status: "approved")
    post "/api/v1/community_posts/#{item.id}/community_comments", params: { comment: { body: "We can use a calibrated bottle." } }, headers: auth(@student)
    assert_response :created
    comment_id = response.parsed_body.dig("comment", "id")
    get "/api/v1/community_posts/#{item.id}", headers: auth(@student)
    assert_empty response.parsed_body.fetch("comments")
    patch "/api/v1/community_posts/#{item.id}/community_comments/#{comment_id}/approve", headers: auth(@teacher)
    assert_response :success
    get "/api/v1/community_posts/#{item.id}", headers: auth(@student)
    assert_equal comment_id, response.parsed_body.dig("comments", 0, "id")
  end

  private

  def auth(user)
    post "/api/v1/session", params: { email: user.email, password: "safe-test-password" }
    { "Authorization" => "Bearer #{response.parsed_body.fetch('token')}" }
  end
end
