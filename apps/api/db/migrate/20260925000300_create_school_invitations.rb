class CreateSchoolInvitations < ActiveRecord::Migration[7.2]
  def change
    create_table :school_invitations do |t|
      t.references :school, null: false, foreign_key: true
      t.references :created_by, null: false, foreign_key: { to_table: :users }
      t.string :email, null: false
      t.string :display_name, null: false
      t.string :role, null: false
      t.string :token_digest, null: false
      t.datetime :expires_at, null: false
      t.datetime :accepted_at
      t.timestamps
    end
    add_index :school_invitations, :token_digest, unique: true
    add_check_constraint :school_invitations, "role IN ('student', 'teacher')", name: "school_invitations_valid_role"
  end
end
