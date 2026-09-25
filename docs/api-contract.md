# Student project API contract (next milestone)

The Rails endpoints below implement owner-scoped project persistence. The web app calls Rails through server routes, storing the opaque Rails token in an HTTP-only, same-site cookie. A client-supplied owner ID never authorizes access. Earlier browser-only projects can be imported after sign-in.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/v1/projects` | List projects the current learner can access |
| POST | `/api/v1/projects` | Create custom project or project with a template slug; all currently use default milestones |
| GET | `/api/v1/projects/:id` | Read project, milestones and log entries |
| PATCH | `/api/v1/projects/:id/milestones/:id` | Set milestone completion |
| POST | `/api/v1/projects/:id/log_entries` | Add text to the build log |

Current persistence: users, access tokens, schools, memberships, classrooms, invitations, assignments, student projects, milestones and build log entries. Project and assignment creation use transactions. School administrators issue one-time activation codes; teachers see progress only for their assigned classes. Project templates, team memberships, teacher feedback and file uploads are still pending. School projects and minors' logs remain private by default.

School routes: `GET /api/v1/schools`, `GET /api/v1/schools/:id/members`, `GET/POST /api/v1/schools/:id/classrooms`, `POST /api/v1/schools/:id/invitations`, `POST /api/v1/invitations/accept`, `GET /api/v1/classrooms/:id`, `POST /api/v1/classrooms/:id/enrollments`, `GET/POST /api/v1/classrooms/:id/assignments`, and `GET /api/v1/classrooms/:id/progress`.
