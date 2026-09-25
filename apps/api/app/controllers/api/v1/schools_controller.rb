module Api
  module V1
    class SchoolsController < BaseController
      def index
        memberships = current_user.school_memberships.includes(:school).order(:id)
        render json: { schools: memberships.map { |member| { id: member.school_id, name: member.school.name, role: member.role } } }
      end

      def members
        school = current_user.schools.find(params[:id])
        membership = current_user.school_memberships.find_by!(school: school)
        raise ActiveRecord::RecordNotFound unless %w[school_admin teacher].include?(membership.role)
        members = school.school_memberships.includes(:user).where(role: %w[teacher student]).order(:id)
        render json: { members: members.map { |item| { id: item.user_id, display_name: item.user.display_name, email: item.user.email, role: item.role } } }
      end
    end
  end
end
