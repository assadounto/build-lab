class Classroom < ApplicationRecord
  belongs_to :school
  belongs_to :teacher, class_name: "User"
  has_many :classroom_enrollments, dependent: :destroy
  has_many :students, through: :classroom_enrollments
  has_many :assignments, dependent: :destroy
  validates :name, presence: true, length: { maximum: 100 }
  validates :level, inclusion: { in: StudentProject::LEVELS }
  validate :teacher_belongs_to_school

  private

  def teacher_belongs_to_school
    return unless teacher && school
    errors.add(:teacher, "must teach at this school") unless SchoolMembership.exists?(school: school, user: teacher, role: "teacher")
  end
end
