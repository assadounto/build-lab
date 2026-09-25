class CreateMilestones < ActiveRecord::Migration[7.2]
  def change
    create_table :milestones do |t|
      t.references :student_project, null: false, foreign_key: true
      t.string :title, null: false
      t.integer :position, null: false
      t.boolean :done, null: false, default: false
      t.timestamps
    end
    add_index :milestones, [:student_project_id, :position], unique: true
  end
end
