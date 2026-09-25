class CatalogCourse < ApplicationRecord
  LEVELS = %w[Beginner Intermediate Advanced].freeze
  STATUSES = %w[draft published].freeze
  RESERVED_SLUGS = %w[electronics-from-zero solar-energy-essentials arduino-for-makers design-with-cad].freeze

  belongs_to :catalog_category
  belongs_to :created_by, class_name: "User"
  has_many :catalog_lessons, -> { order(:position) }, dependent: :destroy, inverse_of: :catalog_course

  validates :title, presence: true, length: { maximum: 120 }
  validates :slug, presence: true, uniqueness: true, format: { with: /\A[a-z0-9]+(?:-[a-z0-9]+)*\z/ }, length: { maximum: 130 }
  validates :slug, exclusion: { in: RESERVED_SLUGS, message: "is already used by a featured course" }
  validates :summary, presence: true, length: { maximum: 240 }
  validates :description, presence: true, length: { maximum: 10_000 }
  validates :level, inclusion: { in: LEVELS }
  validates :hours, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 500 }
  validates :status, inclusion: { in: STATUSES }
  validates :image_url, format: { with: /\A(?:\/images\/[a-zA-Z0-9._\/-]+|https:\/\/[a-zA-Z0-9._~:\/?#\[\]@!$&()*+,;=%-]+)\z/ }, allow_blank: true
  validate :has_lessons_when_published

  def as_catalog_json
    { id: id, title: title, slug: slug, summary: summary, description: description, level: level, hours: hours, image_url: image_url, status: status, category: catalog_category.as_catalog_json, lessons: catalog_lessons.map(&:as_catalog_json), created_at: created_at }
  end

  private

  def has_lessons_when_published
    errors.add(:catalog_lessons, "must include at least one topic before publishing") if status == "published" && catalog_lessons.empty?
  end
end
