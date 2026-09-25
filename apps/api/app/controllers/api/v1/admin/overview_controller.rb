module Api
  module V1
    module Admin
      class OverviewController < BaseController
        def show
          render json: { categories: CatalogCategory.where(parent_id: nil).count, subcategories: CatalogCategory.where.not(parent_id: nil).count,
                         projects: { total: CatalogProject.count, published: CatalogProject.where(status: "published").count },
                         courses: { total: CatalogCourse.count, published: CatalogCourse.where(status: "published").count } }
        end
      end
    end
  end
end
