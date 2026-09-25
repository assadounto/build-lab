class CreateLogEntries < ActiveRecord::Migration[7.2]
  def change
    create_table :log_entries do |t|
      t.references :student_project, null: false, foreign_key: true
      t.references :author, null: false, foreign_key: { to_table: :users }
      t.text :body, null: false
      t.timestamps
    end
    add_index :log_entries, [:student_project_id, :created_at]
  end
end
