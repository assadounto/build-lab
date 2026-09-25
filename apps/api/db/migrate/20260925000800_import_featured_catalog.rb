require_relative "../catalog_bootstrap"

class ImportFeaturedCatalog < ActiveRecord::Migration[7.2]
  def up
    change_column_null :catalog_projects, :created_by_id, true
    change_column_null :catalog_courses, :created_by_id, true
    add_column :catalog_projects, :brief, :jsonb, null: false, default: {}
    add_column :catalog_courses, :related_project_slug, :string

    CatalogBootstrap.load!
  end

  def down
    raise ActiveRecord::IrreversibleMigration, "Featured catalogue entries may have been edited by administrators"
  end
end
