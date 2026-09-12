# marketing/

The Chippr Robotics marketing department — an agent team that automates the
blog → image → review → publish → distribute flow for every Chippr project.

**Start with [PLAN.md](./PLAN.md)** — the founding plan: landscape review (WordPress on
`chipprbots.com`, Canva, seven social platforms, the ~78-post FairWins content backlog),
the agent roster, architecture, phased rollout, budget, and open decisions.

Nothing in this directory joins the legacy Yarn-v1 workspace under `packages/` — it is
(will be) a self-contained modern workspace with its own lockfile and toolchain.

| Stage | Human? | What happens |
|---|---|---|
| topic → draft → images | agents | Strategist / Writer / Designer (Canva brand templates) |
| review | **yes — the one gate** | PR review on the content item |
| publish → distribute | deterministic worker | WordPress REST, then Mastodon / Bluesky / X / IG / TikTok adapters; LinkedIn via Jetpack Social |
