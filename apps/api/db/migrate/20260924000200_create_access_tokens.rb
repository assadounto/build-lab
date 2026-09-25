class CreateAccessTokens < ActiveRecord::Migration[7.2]
  def change
    create_table :access_tokens do |t|
      t.references :user, null: false, foreign_key: true
      t.string :token_digest, null: false
      t.datetime :expires_at, null: false
      t.timestamps
    end
    add_index :access_tokens, :token_digest, unique: true
    add_index :access_tokens, :expires_at
  end
end
