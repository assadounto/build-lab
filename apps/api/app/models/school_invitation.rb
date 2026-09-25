class SchoolInvitation < ApplicationRecord
  belongs_to :school
  belongs_to :created_by, class_name: "User"
  before_validation { self.email = email&.strip&.downcase }
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :display_name, presence: true, length: { maximum: 100 }
  validates :role, inclusion: { in: %w[student teacher] }
  validates :token_digest, presence: true, uniqueness: true
  validates :expires_at, presence: true
end
