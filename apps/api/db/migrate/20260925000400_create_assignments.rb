class CreateAssignments < ActiveRecord::Migration[7.2]
  def change
    create_table :assignments do |t|
      t.references :classroom, null: false, foreign_key: true
      t.references :created_by, null: false, foreign_key: { to_table: :users }
      t.string :title, null: false
      t.text :description, null: false
      t.string :category, null: false
      t.date :due_on
      t.timestamps
    end
    add_reference :student_projects, :assignment, foreign_key: true
    add_index :student_projects, [:assignment_id, :owner_id], unique: true, where: "assignment_id IS NOT NULL", name: "index_unique_assignment_student_project"
  end
end
