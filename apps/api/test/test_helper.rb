ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require_relative "../db/catalog_bootstrap"
CatalogBootstrap.load!

class ActiveSupport::TestCase
  parallelize(workers: 1)
end
