class CatalogCategory < ApplicationRecord
  belongs_to :parent, class_name: "CatalogCategory", optional: true
  has_many :subcategories, class_name: "CatalogCategory", foreign_key: :parent_id, dependent: :restrict_with_error
  has_many :catalog_projects, dependent: :restrict_with_error
  has_many :catalog_courses, dependent: :restrict_with_error

  validates :name, presence: true, length: { maximum: 80 }
  validates :slug, presence: true, uniqueness: true, format: { with: /\A[a-z0-9]+(?:-[a-z0-9]+)*\z/ }, length: { maximum: 100 }
  validate :parent_is_top_level

  def as_catalog_json
    { id: id, name: name, slug: slug, parent_id: parent_id }
  end

  private

  def parent_is_top_level
    errors.add(:parent, "must be a top-level category") if parent && (parent == self || parent.parent_id.present?)
    errors.add(:parent, "cannot be set while this category has subcategories") if parent && subcategories.exists?
  end
end
