module Api
  module V1
    class CommunityPostsController < BaseController
      before_action :load_post, only: %i[show approve]

      def index
        school_ids = current_user.school_memberships.pluck(:school_id)
        posts = CommunityPost.includes(:school, :author).where(school_id: school_ids).where(status: "approved").order(created_at: :desc).limit(50)
        own_pending = CommunityPost.includes(:school, :author).where(school_id: school_ids, author: current_user, status: "pending").order(created_at: :desc).limit(20)
        review = current_user.school_memberships.where(role: %w[school_admin teacher]).pluck(:school_id)
        pending = CommunityPost.includes(:school, :author).where(school_id: review, status: "pending").order(created_at: :asc).limit(30)
        render json: { posts: posts.map { |item| post_json(item) }, mine_pending: own_pending.map { |item| post_json(item) }, review_queue: pending.map { |item| post_json(item) } }
      end

      def create
        school = current_user.schools.find(params.require(:post).require(:school_id))
        membership = current_user.school_memberships.find_by!(school: school)
        status = %w[teacher school_admin].include?(membership.role) ? "approved" : "pending"
        post = school.community_posts.create!(params.require(:post).permit(:title, :body).merge(author: current_user, status: status))
        render json: { post: post_json(post) }, status: :created
      end

      def show
        unless @post.status == "approved" || @post.author_id == current_user.id || can_review?(@post.school_id)
          raise ActiveRecord::RecordNotFound
        end
        comments = @post.community_comments.includes(:author).where(status: "approved").order(:created_at)
        render json: { post: post_json(@post), comments: comments.map { |item| { id: item.id, body: item.body, author: item.author.display_name, created_at: item.created_at } } }
      end

      def approve
        raise ActiveRecord::RecordNotFound unless can_review?(@post.school_id)
        @post.update!(status: "approved")
        render json: { post: post_json(@post) }
      end

      private

      def load_post
        @post = CommunityPost.find(params[:id])
        raise ActiveRecord::RecordNotFound unless current_user.school_memberships.exists?(school_id: @post.school_id)
      end

      def can_review?(school_id)
        current_user.school_memberships.exists?(school_id: school_id, role: %w[teacher school_admin])
      end

      def post_json(item)
        { id: item.id, title: item.title, body: item.body, status: item.status, school_id: item.school_id, school: item.school.name, author: item.author.display_name, created_at: item.created_at }
      end
    end
  end
end
