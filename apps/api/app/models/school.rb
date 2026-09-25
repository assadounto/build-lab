class School < ApplicationRecord
  has_many :school_memberships, dependent: :destroy
  has_many :users, through: :school_memberships
  has_many :classrooms, dependent: :destroy
  has_many :school_invitations, dependent: :destroy
  validates :name, presence: true, length: { maximum: 150 }
end
