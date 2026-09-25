# API foundation

This Rails API stores student projects, milestones, build logs, school membership, classes, invitations and assignments in PostgreSQL. Requests use bearer tokens; student projects are scoped to their owner, and class management is scoped to the school administrator or assigned teacher. The Next.js studio calls this API through its server routes.

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

`POST /api/v1/session` with email and password returns a bearer token. `GET /api/v1/me` verifies it. See `docs/api-contract.md` for project routes. Run integration tests with `RAILS_ENV=test TEST_DATABASE_URL=postgres://localhost/buildlab_test bin/rails db:migrate test`.

Bootstrap a school and its first administrator in `bin/rails console`:

```ruby
school = School.create!(name: "Your School")
admin = User.create!(email: "admin@example.test", display_name: "School Admin", role: "school_admin", password: "choose-a-long-password")
SchoolMembership.create!(school: school, user: admin, role: "school_admin")
```

The administrator can then create teacher and student invitations at `/schools/dashboard`. Activation codes are returned once, expire after 72 hours and are entered at `/activate`. Share them privately through an approved school channel. Teachers can assign projects; assigned students see their own project in the studio.

There is deliberately no public registration yet. Email delivery, account recovery, school safeguarding and privacy rules, login rate limits, payments and uploads must be completed before production use. Keep credentials out of Git.
