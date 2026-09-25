module Api
  module V1
    module Catalog
      class ProjectsController < BaseController
        def index
          render json: { projects: CatalogProject.includes(:catalog_category).where(status: "published").order(created_at: :desc).limit(200).map(&:as_catalog_json) }
        end

        def show
          project = CatalogProject.includes(:catalog_category).where(status: "published").find_by!(slug: params[:slug])
          render json: { project: project.as_catalog_json }
        end
      end
    end
  end
end
