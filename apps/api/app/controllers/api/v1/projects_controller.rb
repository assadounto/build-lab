module Api
  module V1
    class ProjectsController < BaseController
      before_action :require_student!, only: :create

      def index
        projects = current_user.student_projects.order(created_at: :desc).limit(100)
        render json: { projects: projects.map { |project| project_json(project) } }
      end

      def show
        project = current_user.student_projects.includes(:milestones, :log_entries).find(params[:id])
        render json: { project: project_json(project, include_children: true) }
      end

      def create
        project = nil
        StudentProject.transaction do
          project = current_user.student_projects.create!(project_params)
          StudentProject::DEFAULT_STEPS.each_with_index do |title, position|
            project.milestones.create!(title: title, position: position)
          end
        end
        render json: { project: project_json(project, include_children: true) }, status: :created
      end

      private

      def project_params
        params.require(:project).permit(:title, :description, :level, :category, :template_slug)
      end

      def require_student!
        return if current_user.role == "student"
        render json: { error: "Student account required" }, status: :forbidden
      end
    end
  end
end
