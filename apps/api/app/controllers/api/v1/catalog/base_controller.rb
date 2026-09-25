module Api
  module V1
    module Catalog
      class BaseController < ApplicationController
        rescue_from ActiveRecord::RecordNotFound do
          render json: { error: "Resource not found" }, status: :not_found
        end
      end
    end
  end
end
