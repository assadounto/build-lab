module Api
  module V1
    class LogEntriesController < BaseController
      def create
        project = current_user.student_projects.find(params[:project_id])
        entry = project.log_entries.create!(body: params.require(:log_entry).permit(:body)[:body], author: current_user)
        render json: { log_entry: { id: entry.id, body: entry.body, created_at: entry.created_at } }, status: :created
      end
    end
  end
end
