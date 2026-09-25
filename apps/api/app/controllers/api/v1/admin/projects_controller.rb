module Api
  module V1
    module Admin
      class ProjectsController < BaseController
        def index
          render json: { projects: CatalogProject.includes(:catalog_category).order(created_at: :desc).map(&:as_catalog_json) }
        end

        def create
          project = CatalogProject.new(project_params)
          project.created_by = current_user
          project.slug = project.title.to_s.parameterize if project.slug.blank?
          project.save!
          render json: { project: project.as_catalog_json }, status: :created
        end

        def update
          project = CatalogProject.find(params[:id])
          project.update!(project_params)
          render json: { project: project.as_catalog_json }
        end

        private

        def project_params
          params.require(:project).permit(:title, :slug, :summary, :description, :level, :format, :duration, :image_url, :status, :catalog_category_id)
        end
      end
    end
  end
end
