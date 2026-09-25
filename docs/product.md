# Product foundation

BuildLab serves JHS, SHS and university learners across engineering and computer science. Projects can be digital, physical or hybrid. Each pathway should state the age level, prerequisites, tools, safety notes, lessons, milestones, evidence of work and expected outcome. The UI currently displays sample content only.

## Roles

- Student: discover, learn, create a project, join teams, submit evidence and receive feedback.
- Teacher: create classes, assign projects, review submissions and manage student teams.
- School administrator: manage school membership and see aggregate outcomes.
- Mentor: review work assigned to them; no blanket access to minors' profiles.
- Platform administrator: moderate content and manage catalogue and transactions.

## Domain boundaries

`School` owns classes and memberships. `ProjectTemplate` defines a reusable learning path. `StudentProject` is a learner's or team's instance of that path; custom student projects can start without a template. `Course`, `Lesson` and `Enrollment` handle paid/free learning. `Submission` stores milestone evidence; `Feedback` belongs to a submission. `Purchase` grants access only after verified payment confirmation.

School content, teams and submissions require API-side authorization. Underage learners should use school-managed access and restrictive profile visibility. Public project showcase is a separate, moderated action.

## First release

Working discovery and catalogue, real accounts, student project workspace, teacher assignment and review, and one-time course checkout. Start with responsive web. Real-time chat, certificates and apps can follow proven usage.
