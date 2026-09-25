module Api
  module V1
    class EnrollmentsController < BaseController
      def create
        classroom = Classroom.find(params[:classroom_id])
        membership = current_user.school_memberships.find_by(school: classroom.school)
        raise ActiveRecord::RecordNotFound unless membership && (membership.role == "school_admin" || (membership.role == "teacher" && classroom.teacher_id == current_user.id))
        student = classroom.school.school_memberships.find_by!(user_id: params.require(:student_id), role: "student").user
        ClassroomEnrollment.transaction do
          classroom.classroom_enrollments.create!(student: student)
          classroom.assignments.find_each { |assignment| assignment.assign_to!(student) }
        end
        render json: { student: { id: student.id, display_name: student.display_name } }, status: :created
      end
    end
  end
end
