class User < ApplicationRecord
  has_secure_password

  ROLES = %w[student teacher mentor school_admin platform_admin].freeze

  has_many :student_projects, foreign_key: :owner_id, dependent: :destroy, inverse_of: :owner
  has_many :access_tokens, dependent: :destroy
  has_many :school_memberships, dependent: :destroy
  has_many :schools, through: :school_memberships
  has_many :classroom_enrollments, foreign_key: :student_id, dependent: :destroy
  has_many :teaching_classrooms, class_name: "Classroom", foreign_key: :teacher_id, dependent: :restrict_with_error

  before_validation { self.email = email&.strip&.downcase }
  validates :email, presence: true, uniqueness: { case_sensitive: false }, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :display_name, presence: true, length: { maximum: 100 }
  validates :role, inclusion: { in: ROLES }
  validates :password, length: { minimum: 12 }, if: -> { password.present? }
end
