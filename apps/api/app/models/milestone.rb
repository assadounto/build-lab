class Milestone < ApplicationRecord
  belongs_to :student_project
  validates :title, presence: true, length: { maximum: 140 }
  validates :position, presence: true, numericality: { greater_than_or_equal_to: 0 }
end
