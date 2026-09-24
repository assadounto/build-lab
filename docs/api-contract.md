# Student project API contract (next milestone)

The browser storage prototype defines the user flow. The Rails endpoints below now implement owner-scoped project persistence. Connect the web app after secure session handling is implemented. A client-supplied owner ID never authorizes access.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/v1/projects` | List projects the current learner can access |
| POST | `/api/v1/projects` | Create custom project or project with a template slug; all currently use default milestones |
| GET | `/api/v1/projects/:id` | Read project, milestones and log entries |
| PATCH | `/api/v1/projects/:id/milestones/:id` | Set milestone completion |
| POST | `/api/v1/projects/:id/log_entries` | Add text to the build log |

Current persistence: user, access token, student project, milestone and build log entry. Project creation uses a transaction and creates six milestones. School memberships, project templates, team memberships, teacher review and file uploads are still pending. Do not make school projects or minors' logs public by default.
