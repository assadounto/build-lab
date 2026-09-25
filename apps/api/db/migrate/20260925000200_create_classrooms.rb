class CreateClassrooms < ActiveRecord::Migration[7.2]
  def change
    create_table :classrooms do |t|
      t.references :school, null: false, foreign_key: true
      t.references :teacher, null: false, foreign_key: { to_table: :users }
      t.string :name, null: false
      t.string :level, null: false
      t.timestamps
    end

    create_table :classroom_enrollments do |t|
      t.references :classroom, null: false, foreign_key: true
      t.references :student, null: false, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :classroom_enrollments, [:classroom_id, :student_id], unique: true, name: "index_unique_classroom_students"
    add_check_constraint :classrooms, "level IN ('JHS', 'SHS', 'University')", name: "classrooms_valid_level"
  end
end
