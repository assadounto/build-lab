Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*ENV.fetch("WEB_ORIGINS", "http://localhost:3000").split(",").map(&:strip))
    resource "/api/*", headers: %w[Authorization Content-Type], methods: %i[get post patch delete options]
  end
end
