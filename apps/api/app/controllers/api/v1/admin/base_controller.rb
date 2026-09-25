module Api
  module V1
    module Admin
      class BaseController < Api::V1::BaseController
        before_action :require_platform_admin!

        private

        def require_platform_admin!
          render json: { error: "Platform admin access required" }, status: :forbidden unless current_user.role == "platform_admin"
        end
      end
    end
  end
end
