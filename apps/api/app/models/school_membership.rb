class SchoolMembership < ApplicationRecord
  belongs_to :school
  belongs_to :user
  validates :role, inclusion: { in: %w[school_admin teacher student] }
  validates :user_id, uniqueness: { scope: :school_id }
end
