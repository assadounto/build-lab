module Api
  module V1
    class SessionsController < BaseController
      skip_before_action :authenticate!, only: :create

      def create
        user = User.find_by(email: params[:email].to_s.strip.downcase)
        unless user&.authenticate(params[:password].to_s)
          render json: { error: "Invalid credentials" }, status: :unauthorized
          return
        end

        raw_token = SecureRandom.urlsafe_base64(48)
        access_token = user.access_tokens.create!(token_digest: AccessToken.digest(raw_token), expires_at: 7.days.from_now)
        render json: { token: raw_token, expires_at: access_token.expires_at, user: { id: user.id, display_name: user.display_name, role: user.role } }, status: :created
      end

      def show
        render json: { id: current_user.id, display_name: current_user.display_name, role: current_user.role }
      end

      def destroy
        current_access_token.destroy!
        head :no_content
      end
    end
  end
end
