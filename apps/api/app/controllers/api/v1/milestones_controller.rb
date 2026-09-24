module Api
  module V1
    class MilestonesController < BaseController
      def update
        project = current_user.student_projects.find(params[:project_id])
        milestone = project.milestones.find(params[:id])
        unless params.key?(:done) && [true, false].include?(params[:done])
          render json: { error: "done must be a boolean" }, status: :unprocessable_entity
          return
        end
        milestone.update!(done: params[:done])
        render json: { milestone: { id: milestone.id, title: milestone.title, position: milestone.position, done: milestone.done } }
      end
    end
  end
end
