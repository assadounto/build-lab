class ClassroomEnrollment < ApplicationRecord
  belongs_to :classroom
  belongs_to :student, class_name: "User"
  validates :student_id, uniqueness: { scope: :classroom_id }
  validate :student_belongs_to_school

  private

  def student_belongs_to_school
    return unless classroom && student
    errors.add(:student, "must be enrolled at this school") unless SchoolMembership.exists?(school: classroom.school, user: student, role: "student")
  end
end
