class CommunityPost < ApplicationRecord
  belongs_to :school
  belongs_to :author, class_name: "User"
  has_many :community_comments, dependent: :destroy
  validates :title, presence: true, length: { minimum: 5, maximum: 140 }
  validates :body, presence: true, length: { minimum: 20, maximum: 3000 }
  validates :status, inclusion: { in: %w[pending approved rejected] }
end
