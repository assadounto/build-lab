class CreateCommunityPosts < ActiveRecord::Migration[7.2]
  def change
    create_table :community_posts do |t|
      t.references :school, null: false, foreign_key: true
      t.references :author, null: false, foreign_key: { to_table: :users }
      t.string :title, null: false
      t.text :body, null: false
      t.string :status, null: false, default: "pending"
      t.timestamps
    end
    add_index :community_posts, [:school_id, :status, :created_at]
    add_check_constraint :community_posts, "status IN ('pending', 'approved', 'rejected')", name: "community_posts_valid_status"

    create_table :community_comments do |t|
      t.references :community_post, null: false, foreign_key: true
      t.references :author, null: false, foreign_key: { to_table: :users }
      t.text :body, null: false
      t.string :status, null: false, default: "pending"
      t.timestamps
    end
    add_index :community_comments, [:community_post_id, :status, :created_at], name: "index_community_comments_for_feed"
    add_check_constraint :community_comments, "status IN ('pending', 'approved', 'rejected')", name: "community_comments_valid_status"
  end
end
