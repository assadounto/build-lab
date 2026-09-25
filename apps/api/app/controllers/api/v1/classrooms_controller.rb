module Api
  module V1
    class ClassroomsController < BaseController
      before_action :load_classroom, only: %i[show progress]

      def index
        school = current_user.schools.find(params[:school_id])
        membership = current_user.school_memberships.find_by!(school: school)
        raise ActiveRecord::RecordNotFound unless %w[school_admin teacher].include?(membership.role)
        classrooms = school.classrooms.includes(:teacher).order(:name)
        classrooms = classrooms.where(teacher: current_user) unless membership.role == "school_admin"
        render json: { classrooms: classrooms.map { |room| classroom_json(room) } }
      end

      def create
        school = current_user.schools.find(params[:school_id])
        unless current_user.school_memberships.exists?(school: school, role: "school_admin")
          render json: { error: "School administrator required" }, status: :forbidden
          return
        end
        attributes = params.require(:classroom).permit(:name, :level, :teacher_id)
        teacher = school.school_memberships.find_by!(user_id: attributes[:teacher_id], role: "teacher").user
        classroom = school.classrooms.create!(name: attributes[:name], level: attributes[:level], teacher: teacher)
        render json: { classroom: classroom_json(classroom) }, status: :created
      end

      def show
        render json: { classroom: classroom_json(@classroom), students: @classroom.students.order(:display_name).map { |user| { id: user.id, display_name: user.display_name, email: user.email } } }
      end

      def progress
        assignments = @classroom.assignments.includes(student_projects: [:milestones, :owner]).order(created_at: :desc)
        render json: { assignments: assignments.map { |assignment| {
          id: assignment.id, title: assignment.title, due_on: assignment.due_on,
          students: assignment.student_projects.map { |project| { student_id: project.owner_id, name: project.owner.display_name, project_id: project.id, completed: project.milestones.count(&:done), total: project.milestones.size } }
        } } }
      end

      private

      def load_classroom
        @classroom = Classroom.find(params[:id])
        membership = current_user.school_memberships.find_by(school: @classroom.school)
        raise ActiveRecord::RecordNotFound unless membership && (membership.role == "school_admin" || (membership.role == "teacher" && @classroom.teacher_id == current_user.id))
      end

      def classroom_json(room)
        { id: room.id, name: room.name, level: room.level, school_id: room.school_id, teacher: { id: room.teacher_id, display_name: room.teacher.display_name }, student_count: room.classroom_enrollments.count }
      end
    end
  end
end
