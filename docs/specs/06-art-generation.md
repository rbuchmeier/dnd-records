# Art generation

## Goal and decisions

Make Codex a convenient collaborator for consistent illustrations, with original files and prompts preserved independently of the conversation.

**Confirmed:** Use Codex's image capability with the ChatGPT subscription where supported; preview and revise locally; retain canonical references; avoid large text embedded in artwork. No images are generated during this specification phase.

**Verified 2026-10-08:** Official guidance supports generating/editing images in Codex surfaces, including references and the `$imagegen` skill. Built-in generation consumes Codex usage allowance. This session exposes a native image-generation tool, but no generation or account quota test has been performed. [Official image-generation documentation](https://learn.chatgpt.com/docs/image-generation).

Usage is limited and varies with image size/quality; API-key image requests use API billing rather than included ChatGPT usage. A ChatGPT subscription must not be treated as an unlimited API entitlement. Do not pin this project to an image model name or assume all interfaces expose identical controls. Verify the active tool and account allowance when generation begins. [Codex usage and pricing](https://learn.chatgpt.com/docs/pricing).

## Recommended authoring loop

1. Identify an event/record and the purpose of the illustration. Extract only established visual facts, attributed uncertainty, and explicit DM instructions.
2. Read `art/style-guide.md`, relevant entity records, and selected canonical reference images. Inspect images themselves, not just filenames. Summarize unknown visual details before making them recurring canon.
3. Save a prompt draft with record IDs and exact reference image keys/hashes. Specify composition and what must stay consistent. Decorative choices are visual interpretation, not new campaign events.
4. Generate one candidate using the available subscription-supported tool. Store the result promptly under `.local/art/<img-id>/r<revision>/`; chat history and temporary output URLs are not durable storage.
5. Show the candidate in the conversation viewer and, once available, the Vite page that will use it. Check face, clothing, recurring objects, scene facts, framing, and mobile crop.
6. Request targeted edits using the actual previous image and canonical references. Record revision instructions; retain the chosen earlier image until a replacement is selected.
7. On selection, write `content/illustrations/<img-id>.yaml`, preserve the original, write meaningful alt text, and associate records. `selectedRevision` increases; the stable `img-` ID remains.
8. Run asset preparation/publication as specified in [07](07-asset-management.md) and [09](09-ci-cd.md). Generation is an interactive authoring step, never a side effect of deployment.

Recommended MVP fallback if the native capability is unavailable: save the prompt and allow a manually supplied image through the identical pipeline. API generation is optional, explicitly chosen paid work; do not silently fall back, add a browser API key, or make ordinary development depend on an OpenAI key.

## Central art direction: broad direction and proposed details

The broad direction is medieval/high fantasy, centered on dramatic comic panels for the Campaign Chronicle. The specific technique, palette, and recurring visual rules below remain recommendations to refine in the design preview. During implementation, seed `art/style-guide.md` from the accepted details, then keep that file authoritative.

- Ink contours and restrained watercolor washes on a warm, lightly textured ground; readable silhouettes and expressive faces.
- Palette: warm paper, charcoal, muted moss, slate blue, with small gold or rust accents. Interface text stays crisp HTML, not scanned-looking text.
- Grounded fantasy materials and practical clothing. Keep recurring body proportions, skin/fur tone, scars, equipment, and insignia tied to reference records.
- Avoid decorative clutter at the focal point. Art may be atmospheric; clues and maps that players must read need deliberate, verified geometry and HTML/SVG labels.
- Use a small shared reference set and a style version, initially `chronicle-v1`. A style update does not require regenerating all historical images.

An entity's ordered `illustrationIds` supplies references. **Recommended convention:** first image is the current canonical visual reference; additional images provide angles and context. A prompt records which exact image revision was used, so later changes do not rewrite provenance. A dedicated `canonicalReferenceIds` field can be added later if the ordering convention proves unclear.

## Prompt record and example

Store selected prompts as `art/prompts/<img-id>-r<revision>.md`. Include style version, linked event/entities, exact reference keys and SHA-256 values, generator/tool/model when exposed, date, intended format, allowed decorative inventions, revision instructions, and known limitations. Unknown model metadata stays null; never guess it. Image manifests link this file using `promptPath`.

Fictional example, not campaign history:

```text
Purpose: landscape opener for evt-001-bell-warning.
References: ent-reed-ford; ent-bell-keeper; chronicle-v1.
Image 1 defines the keeper's appearance; image 2 defines the ford layout.
Show the keeper beside the bell at dusk, addressing figures at the edge of frame.
Preserve the keeper's face, cloak, and bell shape from the references.
Ink and muted watercolor; leave calm sky space for an HTML title overlay.
Do not depict the bridge collapsing: the source records only a warning.
No lettering, speech bubbles, or new plot objects.
```

## Formats and limitations

| Use | Recommended framing | Editorial check |
|---|---|---|
| Character portrait | Square or 3:4 | Reference identity and unobscured face |
| Establishing shot | 3:2 or 16:9 | Geography and focal point survive mobile rendering |
| Action scene | 3:2 | Who did what is supported by the event |
| Item | Square, quiet or transparent background | Distinctive construction and markings |
| Document illustration | Portrait | Exact transcription remains searchable HTML |
| Comic panel | Individual panel image | Reading order and caption remain in markup |
| Map | Broad image plus separately verified labels | Decorative image is not authoritative geography |

Ratios are composition targets; supported pixel dimensions/transparency depend on the tool. Do not upscale solely to meet a target. Reference images improve guidance but do not guarantee identity or exact layout. Review each result; prompts alone cannot reproduce identical pixels. API controls are documented separately and must not be assumed available in the native tool. [Image API guide](https://developers.openai.com/api/docs/guides/image-generation).

## Scope, tradeoffs, and acceptance

MVP needs the conversation viewer plus illustrations in the existing Vite reader. A development-only `#/studio` gallery with candidates, references, and revision comparisons is later convenience, not a separate service or CMS. File changes remain under Codex/author control.

Preserving selected originals and prompt snapshots costs a little storage but protects consistency and recovery. Discarded candidates may stay local; back them up only if worth retaining. Never discard the only copy of selected artwork.

Dependencies: [model](03-data-model.md), [editorial rules](04-content-authoring.md), [assets](07-asset-management.md), [backup](11-backup-recovery.md). Acceptance: author generates or imports one image, previews it, revises it, selects it, traces its source/reference revisions, and publishes it without adding image binaries or API credentials to Git. No artwork detail becomes established lore without DM direction.
