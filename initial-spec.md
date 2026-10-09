# Project: D&D Illustrated Campaign Chronicle

## Your role

Act as a senior software architect and product designer. Help me develop a comprehensive set of Markdown specification files for a new project.

**Do not implement the application yet.** Our immediate goal is to establish architecture, requirements, data models, user experience, development workflows, and an implementation plan.

Create the specification files in `docs/specs/`, with an index at `docs/specs/README.md`.

Where details haven't been decided, propose sensible defaults. Clearly distinguish confirmed decisions from recommendations and unresolved questions.

I want to review the specifications and refine them with you before development begins.

---

# 1. Project overview

I'm a Dungeon Master running a Dungeons & Dragons campaign using Roll20.

I want to create an illustrated, interactive historical record of our campaign.

The journal should serve two primary purposes:

1. **Visual storytelling:** Illustrations of characters, creatures, locations, magical items, dramatic events, and memorable encounters.
2. **Historical record:** An organized, searchable collection of significant and potentially significant events from our campaign.

I will primarily write the content myself, with AI assistance for illustrations, editing, formatting, and organization.

The application should eventually support several styles of presentation:

- **Field journal:** Chronological session records, sketches, annotations, and discoveries.
- **Letters and documents:** Correspondence, reports, recovered writings, and other in-world artifacts.
- **Illustrated chronicle:** Narrative scenes with artwork, potentially using comic-book-style panels.
- **Campaign compendium:** Entries for NPCs, monsters, locations, magical items, and other notable entities.

These should ideally share a common underlying data model.

Players should be able to browse the journal through a public website, including on mobile devices.

The system should support long-running campaigns with hundreds of entries and potentially thousands of illustrations.

---

# 2. Confirmed technology decisions

These choices are already made. Do not revisit them without identifying a significant technical problem.

| Component | Decision |
|---|---|
| Frontend | React |
| Language | TypeScript |
| Build tooling | Vite |
| AI development assistant | Codex running locally |
| AI artwork generation | Codex's image-generation capability, using my ChatGPT subscription where supported |
| Source control | GitHub |
| Repository visibility | Public |
| Website hosting | GitHub Pages |
| Client-side routing | React Router with HashRouter |
| Image and asset storage | Cloudflare R2 |
| Infrastructure as code | Terraform |
| Terraform state | Cloudflare R2 remote backend from the beginning |
| CI/CD | GitHub Actions |
| Backend application server | None initially |
| Database | None initially |
| Content storage | Markdown with structured metadata |
| Image optimization | Sharp, unless a better alternative emerges |

Prioritize simplicity, maintainability, low costs, and minimal operational overhead.

## Explicitly out of scope

Do not introduce these unless future requirements justify them:

- EC2 or other persistent application servers
- A traditional relational database
- A backend API
- An MCP server or tunnel
- Authentication or user accounts
- A CMS
- Permission systems or role-based access
- Separate public and private DM knowledge
- Separate published and unpublished image-storage systems

All content and artwork may be considered public.

Players accidentally discovering spoilers is acceptable.

A convenient preview process is desirable, but a complicated publication approval workflow is not.

---

# 3. Architecture requirements

## Frontend

Use React, TypeScript, and Vite.

Use HashRouter to avoid GitHub Pages' client-side routing limitations.

The application should support:

- Session browsing
- Individual journal entries
- Chronological navigation
- Search
- Cross-references between entities and events
- Illustrations and galleries
- Responsive layouts
- Multiple journal presentation styles

The application's visual design should evoke a fantasy field journal, illuminated manuscript, or historical archive, while retaining modern usability.

Favor reusable components and data-driven presentation.

## GitHub

Use a public repository containing:

- Application source
- Journal content
- Entity and event metadata
- Image references and manifests
- Image-generation prompts and style guidelines
- Terraform configuration
- GitHub Actions workflows
- Development documentation

Do not commit large original image files by default.

GitHub Actions should build and deploy the site to GitHub Pages.

## Cloudflare R2

Use R2 for generated artwork and other large assets.

Initially use one public asset bucket.

There is no requirement for separate buckets or prefixes based on publication status.

Prefer a custom domain for public image delivery, if practical.

Use stable asset identifiers independent of storage URLs.

Support local image preview before upload.

Optimize images before publication and retain originals where appropriate.

Consider content-hashed filenames for caching.

Keep the storage provider abstracted behind a small asset-resolution utility.

## Terraform

Manage Cloudflare infrastructure using Terraform.

Use an R2 bucket as the remote Terraform state backend from the start.

Document a one-time bootstrap process for the state bucket, including credential creation and backend initialization.

Keep the state bucket distinct from the application asset bucket.

Do not commit Terraform credentials, state files, or sensitive configuration.

Use environment variables or other secure credential handling.

Determine which resources are best managed through the Cloudflare Terraform provider, and identify any provider limitations.

Verify the current R2 backend compatibility, state-locking behavior, and appropriate protection or recovery options before finalizing the Terraform specification.

---

# 4. Content and data-model requirements

This is an especially important part of the project.

I want historical information to remain useful as the campaign grows.

Avoid treating every session as one enormous unstructured Markdown document.

Explore a model involving:

### Sessions

Real-world gaming sessions, containing dates, summaries, and links to events.

### Events

Individual occurrences within the campaign.

Examples:

- A character discovers an artifact.
- The party meets an NPC.
- A battle occurs.
- An NPC provides a potentially misleading statement.
- A clue is discovered.
- A character makes an important decision.

Events should have stable identifiers and support relationships to other records.

### Entities

Persistent objects that can be referenced across events and sessions.

Possible entity types include:

- Player characters
- NPCs
- Creatures
- Factions
- Locations
- Items
- Historical figures
- Organizations

### Documents

Letters, journals, prophecies, reports, and other in-world material.

### Illustrations

Images associated with events, sessions, characters, documents, or other entities.

Consider whether metadata should include:

- Stable image identifier
- Filename or asset key
- Description
- Alt text
- Associated entities
- Source generation prompt
- Reference images used
- Image-generation date
- Dimensions
- Display variants

Keep the model simple enough that Codex can easily maintain the content.

## Historical accuracy

Codex must never silently invent campaign events and present them as established history.

Distinguish between:

- Established facts
- Statements made by characters
- Rumors or unverified information
- Interpretations of events
- Unknown information

Do not implement access restrictions for these distinctions. They are about preserving an accurate historical record, not hiding content.

Allow older events to gain new relationships or context when later discoveries occur.

Preserve established lore unless explicitly instructed to change it.

---

# 5. AI artwork workflow

Codex should be the primary interface for generating, editing, organizing, and integrating artwork.

Design a workflow where I can:

1. Describe a scene or select an existing journal entry.
2. Have Codex retrieve relevant character, location, and art-style references.
3. Generate an illustration.
4. View the resulting image conveniently.
5. Request revisions.
6. Save the chosen artwork with suitable metadata.
7. Incorporate it into the journal.
8. Publish it to R2 through the normal deployment process.

Investigate the available Codex image-generation capability and document its limitations.

Do not assume image generation is unlimited or that API usage is included in ChatGPT Plus.

## Visual consistency

Include a centralized art-style specification.

Support canonical reference images for recurring characters, locations, and important objects.

Design conventions for image prompts that encourage consistent appearances across sessions.

Consider common artwork formats:

- Character portraits
- Landscape establishing shots
- Action scenes
- Item illustrations
- Document illustrations
- Comic panels
- Maps

Avoid embedding large amounts of text directly into generated illustrations when HTML or CSS overlays would be more reliable.

## Local previews

Use the existing Vite development server for previews.

Consider a lightweight development-only image gallery or studio interface.

Do not introduce a separate preview service unless necessary.

---

# 6. Publishing workflow

Design a simple, preferably one-command publishing workflow.

The intended process is:

1. Validate journal content and references.
2. Optimize newly created images.
3. Upload missing or changed assets to Cloudflare R2.
4. Build the React application.
5. Deploy the static site to GitHub Pages.

The process should be repeatable and idempotent.

Do not upload unchanged images unnecessarily.

Asset uploads must succeed before the website deploying those asset references.

Avoid deleting remote assets automatically.

Ideally, running something like `npm run publish` should perform the necessary steps or trigger the appropriate CI/CD process.

Document the credentials and environment variables required for local development and GitHub Actions.

Prefer short-lived or narrowly scoped credentials where practical.

The public website should not require Cloudflare credentials in the browser.

---

# 7. Backup and recovery

Keep this lightweight.

GitHub provides source control and history.

R2 provides remote asset storage.

I don't want an elaborate backup infrastructure, but I do want protection from accidentally losing hundreds of illustrations.

Propose a minimal backup and recovery strategy covering:

- Git repository history
- Original generated artwork
- Published artwork
- Terraform state
- Accidental deletion
- Rebuilding the website from source

Investigate whether R2 supports suitable object versioning or recovery mechanisms.

If not, recommend a simple alternative, such as periodic synchronization to an independent local disk or other storage.

Distinguish redundancy from actual independent backups.

---

# 8. Specification files to create

Create the following files:

| File | Contents |
|---|---|
| `README.md` | Specification index, decisions, and current status |
| `01-product-vision.md` | Goals, audience, use cases, non-goals |
| `02-system-architecture.md` | Components, architecture diagrams, data flows |
| `03-data-model.md` | Sessions, events, entities, documents, relationships |
| `04-content-authoring.md` | Markdown formats, schemas, editorial rules |
| `05-frontend-ux.md` | Navigation, layouts, journal styles, responsive behavior |
| `06-art-generation.md` | Codex image workflow, style references, consistency |
| `07-asset-management.md` | Storage structure, manifests, optimization, caching |
| `08-infrastructure.md` | Cloudflare R2, Terraform, remote state, bootstrap |
| `09-ci-cd.md` | GitHub Actions, validation, asset upload, publishing |
| `10-testing-quality.md` | Validation, automated tests, performance, accessibility |
| `11-backup-recovery.md` | Minimal data preservation and disaster recovery |
| `12-development-workflow.md` | Local setup, Codex usage, development commands |
| `13-implementation-roadmap.md` | Milestones, dependencies, acceptance criteria |
| `14-open-questions.md` | Unresolved decisions and recommended defaults |

You may create additional files if a topic genuinely needs its own specification, but avoid unnecessary fragmentation.

## Specification quality

For each specification:

- Explain the goal.
- Document confirmed decisions.
- Recommend an implementation approach.
- Explain meaningful tradeoffs.
- Identify dependencies.
- Define acceptance criteria where appropriate.
- Link to related specifications.
- Clearly distinguish MVP requirements from later enhancements.

Use Mermaid diagrams where they improve clarity.

Prefer concrete examples, especially for content schemas and workflow definitions.

Keep specifications consistent with one another.

Avoid repetitive or generic architecture prose.

---

# 9. Implementation philosophy

This is a personal project, not an enterprise platform.

Prioritize:

1. A compelling journal experience.
2. Easy content creation through Codex.
3. Consistency across campaign history.
4. Convenient image generation and revision.
5. Simple, inexpensive hosting.
6. Low maintenance overhead.
7. Incremental development.

Avoid building generalized infrastructure for hypothetical future requirements.

Prefer well-supported libraries over custom infrastructure where appropriate.

Keep dependencies minimal.

Design for a few players today, while allowing the campaign history to grow substantially over time.

---

# 10. Instructions for this Codex session

**Your immediate deliverable is the specification set, not application code.**

Start by:

1. Inspecting the current repository, if files already exist.
2. Identifying any existing project conventions that should be preserved.
3. Creating the initial specification structure.
4. Writing the architecture and product specifications.
5. Drafting the remaining specification files with concrete recommendations.
6. Checking the specifications for contradictions and missing dependencies.
7. Summarizing the major architectural decisions and unresolved questions.

Do not run Terraform apply, provision infrastructure, generate paid images, or deploy anything during this specification phase.

Where current provider behavior matters, consult authoritative documentation rather than relying on assumptions.

Once the specification set exists, present a concise summary of what you created and the most important decisions I should review before proceeding to implementation.

