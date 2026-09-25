# BuildLab

An engineering and computer science learning platform for JHS, SHS and university students. Learners discover projects, study practical lessons, document builds and collaborate with teams. Schools can assign and review projects.

## Repository

- `apps/web`: Next.js web app for students and schools
- `apps/api`: Rails API for authenticated student projects, milestones, build logs and the platform catalogue
- `docs`: product and architecture notes

## Run the web app

```bash
cd apps/web
npm install
npm run dev
```

Start the Rails API as described in `apps/api/README.md`, then run Next.js with `RAILS_API_URL=http://localhost:3001`. Open `http://localhost:3000`. Provisioned student accounts can sign in and save projects, milestones and build notes to PostgreSQL through the web server. Earlier browser-only projects can be imported from the studio. School administrators can invite teachers and learners, set up classes, and teachers can assign work and see progress at `/schools/dashboard`.

Platform administrators sign in and open `/admin` to create disciplines and subcategories, project briefs and course topic outlines. The Rails migration imports the original 13 categories, 12 projects with complete briefs, and 4 courses with topic outlines from `apps/api/db/catalog_bootstrap.json` into PostgreSQL. It skips matching slugs to preserve existing admin content. New content starts as a draft unless published explicitly. The home, catalogue and detail pages read published database records; editing or unpublishing a featured entry changes those pages too. Only a `platform_admin` account can call the admin API. To provision the first administrator in a trusted Rails console, create a user with `role: "platform_admin"` and a strong password, for example `User.create!(email: "admin@example.com", display_name: "Admin", role: "platform_admin", password: ENV.fetch("INITIAL_ADMIN_PASSWORD"))`. Set `INITIAL_ADMIN_PASSWORD` in the shell before opening the console; do not commit it. The admin editor supports outlines and previews; full lessons, checkout and purchases are future work.

The responsive light-mode interface covers project discovery, course previews, the student studio, project creation, school onboarding, teacher dashboards, a platform admin workspace and a school community. Original generated hero photos live in `apps/web/public/images`. All catalogue entries are stored in PostgreSQL. The community uses school-scoped Rails records: student posts and replies require teacher approval before classmates see them.

Run the web typecheck and build with `cd apps/web && npm install && npm run typecheck && npm run build`. Run API integration tests with `cd apps/api && RAILS_ENV=test TEST_DATABASE_URL=postgres://localhost/buildlab_test bin/rails db:migrate test`. CI runs these checks on the draft PR.

## Next implementation milestones

1. Add reliable invitation delivery and account recovery, plus school privacy and safeguarding review.
2. Add full lessons, course enrollments, project evidence uploads and mentor review. Current course pages are free topic previews, not full courses.
3. Add verified course purchases and richer reporting. There is no checkout or payment collection yet.

See `docs/product.md` for scope and data rules.
