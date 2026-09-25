module Api
  module V1
    class InvitationsController < BaseController
      skip_before_action :authenticate!, only: :accept

      def create
        school = current_user.schools.find(params[:school_id])
        unless SchoolMembership.exists?(school: school, user: current_user, role: "school_admin")
          render json: { error: "School administrator required" }, status: :forbidden
          return
        end
        attributes = params.require(:invitation).permit(:email, :display_name, :role)
        if User.exists?(email: attributes[:email].to_s.strip.downcase)
          render json: { error: "This email already has an account" }, status: :unprocessable_entity
          return
        end
        code = SecureRandom.urlsafe_base64(32)
        invitation = school.school_invitations.create!(attributes.merge(created_by: current_user, token_digest: AccessToken.digest(code), expires_at: 72.hours.from_now))
        render json: { invitation: { id: invitation.id, email: invitation.email, role: invitation.role, expires_at: invitation.expires_at }, activation_code: code }, status: :created
      end

      def accept
        attributes = params.require(:invitation).permit(:code, :password)
        code = attributes[:code].to_s
        if code.length < 30 || code.length > 100
          render json: { error: "Invitation is invalid or expired" }, status: :unprocessable_entity
          return
        end
        invitation = SchoolInvitation.find_by(token_digest: AccessToken.digest(code))
        unless invitation
          render json: { error: "Invitation is invalid or expired" }, status: :unprocessable_entity
          return
        end
        user = nil
        SchoolInvitation.transaction do
          invitation.lock!
          unless invitation.accepted_at.nil? && invitation.expires_at.future?
            render json: { error: "Invitation is invalid or expired" }, status: :unprocessable_entity
            raise ActiveRecord::Rollback
          end
          user = User.create!(email: invitation.email, display_name: invitation.display_name, role: invitation.role, password: attributes[:password])
          SchoolMembership.create!(school: invitation.school, user: user, role: invitation.role)
          invitation.update!(accepted_at: Time.current)
        end
        render json: { user: { id: user.id, display_name: user.display_name }, school: invitation.school.name }, status: :created if user
      end
    end
  end
end
