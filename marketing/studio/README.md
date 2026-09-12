# studio/ — Canva rail

`templates.json` is the registry the Designer agent reads: `(brand, format) → brand template id`.
Every template carries three tagged text fields — `brand`, `headline`, `subhead` — so one
procedure fills any of them.

## Per-item procedure (the rail verified in #170)

1. `create-design-from-brand-template` with the id for `(item.meta.brand, format)`.
2. `read-design` with `open_transaction: true` → note each tagged element's `locator_id`
   (`dataFieldLabel` = `brand` / `headline` / `subhead`).
3. `edit-design` → `replace_text` on those locators: brand wordmark, the post title, the subtitle.
   Validate the returned thumbnail (a three-line headline must not overlap the subhead — the
   headline is bottom-anchored so it grows upward).
4. `edit-design` `finalize: commit`.
5. `get-export-formats` → `export-design` PNG at the format's size → download **in the same
   session** (URLs expire in hours) → save as `images/header.png` (blog-header) or
   `images/og.png` (og-card) in the item dir.

Phase-1 masters are typographic on purpose (no hero image); Phase 2 adds a tagged image element
and fills it with `update_fill` from a Grok-generated asset uploaded via `upload-asset-from-url`.

## Facts learned authoring these

- `publish-brand-template` **succeeds server-side but returns "Not allowed to access brand
  template"** on its post-publish read with this connector's scopes — the template exists (verify
  with `search-brand-templates` / `get-brand-template-dataset`). Publishing also **consumes the
  source design** (it is "not found" afterwards). Instantiate the template to keep working.
- `resize-design` from a master scales type proportionally and preserves tags — good enough to
  bootstrap a sibling size, then retitle and publish.
- Field tagging (`update_autofill_field`) works on this plan tier; the dataset autofill *job* API
  does not — the rail never uses it.
