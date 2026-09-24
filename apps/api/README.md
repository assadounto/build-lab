# API foundation

This is the first runnable Rails API foundation. It stores student projects, milestones and build-log text in PostgreSQL. Requests use bearer tokens; projects are scoped to their owner. The web studio is still browser-local and is **not connected to this API yet**.

With Ruby 3.3, Bundler and PostgreSQL installed:

```bash
bundle install
DATABASE_URL=postgres://localhost/buildlab_development bin/rails db:create db:migrate
DATABASE_URL=postgres://localhost/buildlab_development bin/rails server -p 3001
```

Create a development-only student account in `bin/rails console`:

```ruby
User.create!(email: "student@example.test", display_name: "Student", role: "student", password: "choose-a-password")
```

`POST /api/v1/session` with email and password returns a bearer token. `GET /api/v1/me` verifies it. See `docs/api-contract.md` for project routes. Run integration tests with `TEST_DATABASE_URL=postgres://localhost/buildlab_test bin/rails db:test:prepare test`.

There is deliberately no public registration yet. School-managed access for minors, teacher permissions, rate limiting for login, secure token storage on the web client, payments and uploads must be completed before production use. Keep credentials out of Git.
