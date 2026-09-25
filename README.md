# BuildLab

An engineering and computer science learning platform for JHS, SHS and university students. Learners discover projects, study practical lessons, document builds and collaborate with teams. Schools can assign and review projects.

## Repository

- `apps/web`: Next.js web app for students and schools
- `apps/api`: Rails API for authenticated student projects, milestones and build logs
- `docs`: product and architecture notes

## Run the web app

```bash
cd apps/web
npm install
npm run dev
```

Start the Rails API as described in `apps/api/README.md`, then run Next.js with `RAILS_API_URL=http://localhost:3001`. Open `http://localhost:3000`. Catalogue screens use sample data in `apps/web/lib/sample-data.ts`. Provisioned student accounts can sign in and save projects, milestones and build notes to PostgreSQL through the web server. Earlier browser-only projects can be imported from the studio. School administrators can invite teachers and learners, set up classes, and teachers can assign work and see progress at `/schools/dashboard`.

The responsive light-mode interface covers project discovery, course previews, the student studio, project creation, school onboarding, teacher dashboards and a school community. Original generated hero photos live in `apps/web/public/images`. Project and course catalogues use sample data. The community uses school-scoped Rails records: student posts and replies require teacher approval before classmates see them.

Run the web typecheck and build with `cd apps/web && npm install && npm run typecheck && npm run build`. Run API integration tests with `cd apps/api && TEST_DATABASE_URL=postgres://localhost/buildlab_test bin/rails db:test:prepare test`. CI runs these checks on the draft PR.

## Next implementation milestones

1. Add reliable invitation delivery and account recovery, plus school privacy and safeguarding review.
2. Add full lessons, course enrollments, project evidence uploads and mentor review. Current course pages are free topic previews, not full courses.
3. Add verified course purchases and richer reporting. There is no checkout or payment collection yet.

See `docs/product.md` for scope and data rules.
