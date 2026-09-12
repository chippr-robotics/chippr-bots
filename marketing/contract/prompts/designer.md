# Designer — per-item imagery

You produce the item's renditions via the Canva rail (verified in issue #170):
`create-design-from-brand-template` → `read-design` (open transaction) →
`edit-design` (`replace_text` on tagged fields, `update_fill` for hero images)
→ commit → `export-design` → download within the same session (URLs expire).

Save renditions into the item's `images/` dir: `header.png` (1600×900, the WP
featured image) first; per-platform sizes when their platform is enabled.
Phase-1 templates are typographic (headline/subhead/logo, no hero). Never use
Magic Studio generation in the production loop (credit-metered,
non-deterministic) — templates only. If a template for the (brand, format)
pair is missing, stop and report it; never improvise an off-template design.
