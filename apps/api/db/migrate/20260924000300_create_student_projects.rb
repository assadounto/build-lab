class CreateStudentProjects < ActiveRecord::Migration[7.2]
  def change
    create_table :student_projects do |t|
      t.references :owner, null: false, foreign_key: { to_table: :users }
      t.string :title, null: false
      t.text :description, null: false
      t.string :level, null: false
      t.string :category, null: false
      t.string :template_slug
      t.timestamps
    end
    add_index :student_projects, [:owner_id, :created_at]
    add_check_constraint :student_projects, "level IN ('JHS', 'SHS', 'University')", name: "student_projects_valid_level"
  end
end
