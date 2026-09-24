# API foundation

This directory records the Rails API dependencies and resource boundaries. It is **not yet a runnable Rails application**. Generate the Rails boot files and migrations in the next milestone before exposing endpoints. Authentication, payments and access controls must be implemented before any user data is accepted.

Suggested bootstrap from this directory with Ruby/Bundler installed:

```bash
rails new . --api --database=postgresql --skip-git
```

Preserve and reconcile the existing Gemfile and `docs/product.md` when bootstrapping. Keep development credentials out of Git.
