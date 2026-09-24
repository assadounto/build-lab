# BuildLab

An engineering and computer science learning platform for JHS, SHS and university students. Learners discover projects, study practical lessons, document builds and collaborate with teams. Schools can assign and review projects.

## Repository

- `apps/web`: Next.js web app for students and schools
- `apps/api`: Rails API foundation for persisted content and memberships
- `docs`: product and architecture notes

## Run the web app

```bash
cd apps/web
npm install
npm run dev
```

Open `http://localhost:3000`. Catalogue screens use sample data in `apps/web/lib/sample-data.ts`. Students can create a project, check milestones and add build log notes. This prototype stores those projects only in the current browser's local storage; there are no accounts or cross-device sync yet.

## Next implementation milestones

1. Finish the Rails application bootstrap and migrations for users, schools, courses, projects, teams and submissions.
2. Add authentication and server-enforced student, teacher, mentor and admin permissions.
3. Replace sample content with API endpoints and add project creation, uploads and progress persistence.
4. Add verified payments and teacher assignment workflows.

See `docs/product.md` for scope and data rules.
