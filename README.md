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

Open `http://localhost:3000`. Catalogue screens use sample data in `apps/web/lib/sample-data.ts`. Students can create a project, check milestones and add build log notes. This prototype stores those projects only in the current browser's local storage; there are no accounts or cross-device sync yet.

## Next implementation milestones

1. Connect the studio UI to authenticated Rails project endpoints, with secure session handling.
2. Build school-managed learner access and teacher assignment workflows.
3. Add lessons, course enrollments, project evidence uploads and mentor review.
4. Add verified course purchases and reporting.

See `docs/product.md` for scope and data rules.
