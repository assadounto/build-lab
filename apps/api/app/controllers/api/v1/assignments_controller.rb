module Api
  module V1
    class AssignmentsController < BaseController
      before_action :load_classroom

      def index
        render json: { assignments: @classroom.assignments.order(created_at: :desc).map { |item| assignment_json(item) } }
      end

      def create
        attrs = params.require(:assignment).permit(:title, :description, :category, :due_on)
        assignment = nil
        Assignment.transaction do
          assignment = @classroom.assignments.create!(attrs.merge(created_by: current_user))
          @classroom.students.find_each { |student| assignment.assign_to!(student) }
        end
        render json: { assignment: assignment_json(assignment) }, status: :created
      end

      private

      def load_classroom
        @classroom = Classroom.find(params[:classroom_id])
        membership = current_user.school_memberships.find_by(school: @classroom.school)
        raise ActiveRecord::RecordNotFound unless membership && (membership.role == "school_admin" || (membership.role == "teacher" && @classroom.teacher_id == current_user.id))
      end

      def assignment_json(item)
        { id: item.id, title: item.title, description: item.description, category: item.category, due_on: item.due_on, classroom_id: item.classroom_id, assigned_count: item.student_projects.count }
      end
    end
  end
end
