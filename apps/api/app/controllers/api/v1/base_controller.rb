module Api
  module V1
    class BaseController < ApplicationController
      before_action :authenticate!
      rescue_from ActiveRecord::RecordNotFound, with: :not_found
      rescue_from ActiveRecord::RecordInvalid, with: :invalid_record

      private

      attr_reader :current_user, :current_access_token

      def authenticate!
        raw_token = request.authorization.to_s.match(/\ABearer ([A-Za-z0-9_-]+)\z/)&.captures&.first
        token = AccessToken.includes(:user).find_by(token_digest: AccessToken.digest(raw_token)) if raw_token.present?
        unless token && token.expires_at.future?
          render json: { error: "Authentication required" }, status: :unauthorized
          return
        end
        @current_access_token = token
        @current_user = token.user
      end

      def not_found
        render json: { error: "Resource not found" }, status: :not_found
      end

      def invalid_record(error)
        render json: { error: "Validation failed", details: error.record.errors.full_messages }, status: :unprocessable_entity
      end

      def project_json(project, include_children: false)
        data = { id: project.id, title: project.title, description: project.description, level: project.level, category: project.category, template_slug: project.template_slug, created_at: project.created_at }
        if include_children
          data[:milestones] = project.milestones.map { |step| { id: step.id, title: step.title, position: step.position, done: step.done } }
          data[:log_entries] = project.log_entries.map { |entry| { id: entry.id, body: entry.body, created_at: entry.created_at } }
        end
        data
      end
    end
  end
end
