# Design specifications

These documents preserve earlier proposals and design decisions, including
retired screens and unimplemented features. They are not a description of the
current app or authorization to implement planned work. Read the
[project README](../../README.md) for current scope and commands, and
[infrastructure notes](../../infra/README.md) for operational status.

Examples are fictional, not established campaign history.

## Specification index

| File                                                         | Purpose                                                |
| ------------------------------------------------------------ | ------------------------------------------------------ |
| [01-product-vision.md](01-product-vision.md)                 | Audience, outcomes, scope, non-goals                   |
| [02-system-architecture.md](02-system-architecture.md)       | Static components, compiler, data flows, routing       |
| [03-data-model.md](03-data-model.md)                         | Records, identity, chronology, sourced claims          |
| [04-content-authoring.md](04-content-authoring.md)           | Markdown/YAML examples and editorial discipline        |
| [05-frontend-ux.md](05-frontend-ux.md)                       | Reader flows, presentation, mobile and accessibility   |
| [06-art-generation.md](06-art-generation.md)                 | Codex capability, references, style, revision loop     |
| [07-asset-management.md](07-asset-management.md)             | Image metadata, variants, hashing, preview, uploads    |
| [08-infrastructure.md](08-infrastructure.md)                 | R2, Terraform backend/bootstrap, locking validation    |
| [09-ci-cd.md](09-ci-cd.md)                                   | Local-to-CI handoff, deployment, credentials, rollback |
| [10-testing-quality.md](10-testing-quality.md)               | Validation, browser checks, performance, accessibility |
| [11-backup-recovery.md](11-backup-recovery.md)               | Independent copies, restore procedures, state safety   |
| [12-development-workflow.md](12-development-workflow.md)     | Local setup, proposed commands, Codex collaboration    |
| [13-implementation-roadmap.md](13-implementation-roadmap.md) | Small milestones, dependencies, acceptance gates       |
| [14-open-questions.md](14-open-questions.md)                 | Decisions to review and recommended defaults           |
