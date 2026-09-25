class LogEntry < ApplicationRecord
  belongs_to :student_project
  belongs_to :author, class_name: "User"
  validates :body, presence: true, length: { minimum: 3, maximum: 2000 }
end
