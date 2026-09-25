class StudentProject < ApplicationRecord
  LEVELS = %w[JHS SHS University].freeze
  PROJECT_LEVELS = (LEVELS + ["Professional"]).freeze
  DEFAULT_STEPS = ["Understand the problem", "Research and plan", "Design your solution", "Build the first version", "Test and improve", "Present your project"].freeze
  PROFESSIONAL_STEPS = ["Define scope and success criteria", "Research requirements and constraints", "Design the solution and work plan", "Build the first prototype", "Validate and iterate", "Document results and hand over"].freeze

  belongs_to :owner, class_name: "User"
  belongs_to :assignment, optional: true
  has_many :milestones, -> { order(:position) }, dependent: :destroy, inverse_of: :student_project
  has_many :log_entries, -> { order(created_at: :desc) }, dependent: :destroy, inverse_of: :student_project

  validates :title, presence: true, length: { minimum: 4, maximum: 100 }
  validates :description, presence: true, length: { minimum: 15, maximum: 1500 }
  validates :category, presence: true, length: { maximum: 80 }
  validates :level, inclusion: { in: PROJECT_LEVELS }
  validates :template_slug, length: { maximum: 100 }, allow_nil: true
end
