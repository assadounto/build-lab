class CatalogProject < ApplicationRecord
  LEVELS = %w[JHS SHS University Professional].freeze
  FORMATS = %w[Digital Physical Hybrid].freeze
  STATUSES = %w[draft published].freeze

  belongs_to :catalog_category
  belongs_to :created_by, class_name: "User", optional: true

  validates :title, presence: true, length: { maximum: 120 }
  validates :slug, presence: true, uniqueness: true, format: { with: /\A[a-z0-9]+(?:-[a-z0-9]+)*\z/ }, length: { maximum: 130 }
  validates :summary, presence: true, length: { maximum: 240 }
  validates :description, presence: true, length: { maximum: 10_000 }
  validates :duration, presence: true, length: { maximum: 60 }
  validates :level, inclusion: { in: LEVELS }
  validates :format, inclusion: { in: FORMATS }
  validates :status, inclusion: { in: STATUSES }
  validates :image_url, format: { with: /\A(?:\/images\/[a-zA-Z0-9._\/-]+|https:\/\/[a-zA-Z0-9._~:\/?#\[\]@!$&()*+,;=%-]+)\z/ }, allow_blank: true
  validate :brief_is_valid

  def as_catalog_json
    { id: id, title: title, slug: slug, summary: summary, description: description, level: level, format: format, duration: duration, image_url: image_url, status: status, category: catalog_category.as_catalog_json, brief: brief, created_at: created_at }
  end

  private

  def brief_is_valid
    return if brief.blank?
    unless brief.is_a?(Hash) && %w[challenge concept outcome stretch].all? { |key| brief[key].is_a?(String) && brief[key].length <= 2000 } &&
           %w[skills materials criteria].all? { |key| brief[key].is_a?(Array) && brief[key].length <= 20 && brief[key].all? { |value| value.is_a?(String) && value.length <= 500 } } &&
           brief["phases"].is_a?(Array) && brief["phases"].length <= 20 && brief["phases"].all? { |phase| phase.is_a?(Hash) && %w[title detail evidence].all? { |key| phase[key].is_a?(String) && phase[key].length <= 2000 } } &&
           (brief["note"].nil? || brief["note"].is_a?(String) && brief["note"].length <= 2000)
      errors.add(:brief, "has invalid sections")
    end
  end
end
