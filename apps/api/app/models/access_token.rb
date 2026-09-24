class AccessToken < ApplicationRecord
  belongs_to :user

  validates :token_digest, presence: true, uniqueness: true
  validates :expires_at, presence: true

  def self.digest(raw_token)
    Digest::SHA256.hexdigest(raw_token)
  end
end
