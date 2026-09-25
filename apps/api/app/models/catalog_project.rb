class CatalogProject < ApplicationRecord
  LEVELS = %w[JHS SHS University Professional].freeze
  FORMATS = %w[Digital Physical Hybrid].freeze
  STATUSES = %w[draft published].freeze
  RESERVED_SLUGS = %w[solar-rover smart-irrigation portable-solar-charger air-quality attendance-app solar-charger flood-warning line-robot crop-ai footbridge health-monitor secure-chat].freeze

  belongs_to :catalog_category
  belongs_to :created_by, class_name: "User"

  validates :title, presence: true, length: { maximum: 120 }
  validates :slug, presence: true, uniqueness: true, format: { with: /\A[a-z0-9]+(?:-[a-z0-9]+)*\z/ }, length: { maximum: 130 }
  validates :slug, exclusion: { in: RESERVED_SLUGS, message: "is already used by a featured project" }
  validates :summary, presence: true, length: { maximum: 240 }
  validates :description, presence: true, length: { maximum: 10_000 }
  validates :duration, presence: true, length: { maximum: 60 }
  validates :level, inclusion: { in: LEVELS }
  validates :format, inclusion: { in: FORMATS }
  validates :status, inclusion: { in: STATUSES }
  validates :image_url, format: { with: /\A(?:\/images\/[a-zA-Z0-9._\/-]+|https:\/\/[a-zA-Z0-9._~:\/?#\[\]@!$&()*+,;=%-]+)\z/ }, allow_blank: true

  def as_catalog_json
    { id: id, title: title, slug: slug, summary: summary, description: description, level: level, format: format, duration: duration, image_url: image_url, status: status, category: catalog_category.as_catalog_json, created_at: created_at }
  end
end
