module Api
  module V1
    class CommunityCommentsController < BaseController
      def index
        post = CommunityPost.find(params[:community_post_id])
        membership = current_user.school_memberships.find_by!(school_id: post.school_id)
        raise ActiveRecord::RecordNotFound unless %w[teacher school_admin].include?(membership.role)
        pending = post.community_comments.includes(:author).where(status: "pending").order(:created_at)
        render json: { comments: pending.map { |item| { id: item.id, body: item.body, author: item.author.display_name, created_at: item.created_at } } }
      end

      def create
        post = CommunityPost.find(params[:community_post_id])
        membership = current_user.school_memberships.find_by!(school_id: post.school_id)
        raise ActiveRecord::RecordNotFound unless post.status == "approved"
        status = %w[teacher school_admin].include?(membership.role) ? "approved" : "pending"
        comment = post.community_comments.create!(body: params.require(:comment).permit(:body)[:body], author: current_user, status: status)
        render json: { comment: { id: comment.id, body: comment.body, status: comment.status, author: current_user.display_name, created_at: comment.created_at } }, status: :created
      end

      def approve
        post = CommunityPost.find(params[:community_post_id])
        membership = current_user.school_memberships.find_by!(school_id: post.school_id)
        raise ActiveRecord::RecordNotFound unless %w[teacher school_admin].include?(membership.role)
        comment = post.community_comments.find(params[:id])
        comment.update!(status: "approved")
        render json: { comment: { id: comment.id, status: comment.status } }
      end
    end
  end
end
