module Api
  module V1
    module Catalog
      class CategoriesController < BaseController
        def index
          render json: { categories: CatalogCategory.order(:name).map(&:as_catalog_json) }
        end
      end
    end
  end
end
