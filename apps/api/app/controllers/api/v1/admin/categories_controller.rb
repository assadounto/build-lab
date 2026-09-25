module Api
  module V1
    module Admin
      class CategoriesController < BaseController
        def index
          render json: { categories: CatalogCategory.order(:name).map(&:as_catalog_json) }
        end

        def create
          category = CatalogCategory.new(category_params)
          category.slug = category.name.to_s.parameterize if category.slug.blank?
          category.save!
          render json: { category: category.as_catalog_json }, status: :created
        end

        def update
          category = CatalogCategory.find(params[:id])
          category.update!(category_params)
          render json: { category: category.as_catalog_json }
        end

        private

        def category_params
          params.require(:category).permit(:name, :slug, :parent_id)
        end
      end
    end
  end
end
