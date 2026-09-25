class CreateCatalog < ActiveRecord::Migration[7.2]
  def change
    create_table :catalog_categories do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.references :parent, foreign_key: { to_table: :catalog_categories }
      t.timestamps
    end
    add_index :catalog_categories, :slug, unique: true

    create_table :catalog_projects do |t|
      t.string :title, null: false
      t.string :slug, null: false
      t.string :summary, null: false
      t.text :description, null: false
      t.string :level, null: false
      t.string :format, null: false
      t.string :duration, null: false
      t.string :image_url
      t.string :status, null: false, default: "draft"
      t.references :catalog_category, null: false, foreign_key: true
      t.references :created_by, null: false, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :catalog_projects, :slug, unique: true
    add_index :catalog_projects, [:status, :created_at]
    add_check_constraint :catalog_projects, "status IN ('draft', 'published')", name: "catalog_projects_valid_status"

    create_table :catalog_courses do |t|
      t.string :title, null: false
      t.string :slug, null: false
      t.string :summary, null: false
      t.text :description, null: false
      t.string :level, null: false
      t.integer :hours, null: false
      t.string :image_url
      t.string :status, null: false, default: "draft"
      t.references :catalog_category, null: false, foreign_key: true
      t.references :created_by, null: false, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :catalog_courses, :slug, unique: true
    add_index :catalog_courses, [:status, :created_at]
    add_check_constraint :catalog_courses, "status IN ('draft', 'published')", name: "catalog_courses_valid_status"
    add_check_constraint :catalog_courses, "hours > 0", name: "catalog_courses_positive_hours"

    create_table :catalog_lessons do |t|
      t.references :catalog_course, null: false, foreign_key: true
      t.string :title, null: false
      t.text :summary, null: false
      t.integer :position, null: false
      t.timestamps
    end
    add_index :catalog_lessons, [:catalog_course_id, :position], unique: true
  end
end
