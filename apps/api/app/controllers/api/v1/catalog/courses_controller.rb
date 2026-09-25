module Api
  module V1
    module Catalog
      class CoursesController < BaseController
        def index
          render json: { courses: CatalogCourse.includes(:catalog_category, :catalog_lessons).where(status: "published").order(created_at: :desc).limit(200).map(&:as_catalog_json) }
        end

        def show
          course = CatalogCourse.includes(:catalog_category, :catalog_lessons).where(status: "published").find_by!(slug: params[:slug])
          render json: { course: course.as_catalog_json }
        end
      end
    end
  end
end
