class CatalogLesson < ApplicationRecord
  belongs_to :catalog_course

  validates :title, presence: true, length: { maximum: 120 }
  validates :summary, presence: true, length: { maximum: 1000 }
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  def as_catalog_json
    { id: id, title: title, summary: summary, position: position }
  end
end
