class CommunityComment < ApplicationRecord
  belongs_to :community_post
  belongs_to :author, class_name: "User"
  validates :body, presence: true, length: { minimum: 3, maximum: 1000 }
  validates :status, inclusion: { in: %w[pending approved rejected] }
end
