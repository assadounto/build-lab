class CreateSchoolsAndMemberships < ActiveRecord::Migration[7.2]
  def change
    create_table :schools do |t|
      t.string :name, null: false
      t.timestamps
    end

    create_table :school_memberships do |t|
      t.references :school, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :role, null: false
      t.timestamps
    end
    add_index :school_memberships, [:school_id, :user_id], unique: true
    add_check_constraint :school_memberships, "role IN ('school_admin', 'teacher', 'student')", name: "school_memberships_valid_role"
  end
end
