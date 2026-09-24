# Student project API contract (next milestone)

The browser storage prototype defines the user flow. Replace it with these authenticated Rails endpoints once accounts and authorization are ready. All project lookup and mutations must be scoped to the current user or an authorized school/team membership; accepting a client-supplied owner ID is not sufficient.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/v1/projects` | List projects the current learner can access |
| POST | `/api/v1/projects` | Create custom project or start a published project template |
| GET | `/api/v1/projects/:id` | Read project, milestones and log entries |
| PATCH | `/api/v1/projects/:id/milestones/:id` | Set milestone completion |
| POST | `/api/v1/projects/:id/log_entries` | Add text to the build log |

Required persistence: user, school membership, project template, student project, project membership, milestone, build log entry. Validate length and ownership in Rails. Use database transactions when starting a template project with milestones. Do not make school projects or minors' logs public by default. Add file upload and teacher review endpoints only after access rules are implemented and tested.
