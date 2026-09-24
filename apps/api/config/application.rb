require_relative "boot"
require "rails/all"

Bundler.require(*Rails.groups)

module BuildLabApi
  class Application < Rails::Application
    config.load_defaults 7.2
    config.api_only = true
    config.autoload_lib(ignore: %w[assets tasks])
    config.hosts.clear if Rails.env.development?
  end
end
