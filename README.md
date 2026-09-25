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

The student studio and school workspace share a premium light-mode layout. The solar rover hero uses a generated project image stored at `apps/web/public/images/solar-rover-studio.webp`.

## Next implementation milestones

1. Add reliable invitation delivery and account recovery, plus school privacy and safeguarding review.
2. Add lessons, course enrollments, project evidence uploads and mentor review.
3. Add verified course purchases and richer reporting.

See `docs/product.md` for scope and data rules.
