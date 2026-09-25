class Assignment < ApplicationRecord
  belongs_to :classroom
  belongs_to :created_by, class_name: "User"
  has_many :student_projects, dependent: :nullify
  validates :title, presence: true, length: { minimum: 4, maximum: 100 }
  validates :description, presence: true, length: { minimum: 15, maximum: 1500 }
  validates :category, presence: true, length: { maximum: 80 }

  def assign_to!(student)
    project = student.student_projects.create!(assignment: self, title: title, description: description, category: category, level: classroom.level)
    StudentProject::DEFAULT_STEPS.each_with_index { |step, index| project.milestones.create!(title: step, position: index) }
    project
  end
end
