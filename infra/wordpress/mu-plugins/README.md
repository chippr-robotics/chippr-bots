# WordPress must-use plugins (source of truth)

Files here are deployed by hand to `/var/www/html/wp-content/mu-plugins/` on the chipprbots.com host
(`docs/runbooks/marketing-secrets.md` §1b). A must-use plugin cannot be deactivated from wp-admin,
which is the point: the pipeline's per-rail behaviour must not depend on a checkbox.

| File | Does |
|---|---|
| `chippr-marketing-rails.php` | For posts authored by `marketing-bot` only: unhooks `twitter-auto-publish` on `transition_post_status` (X is omitted from the pipeline for now). LinkedIn auto-publish is left alone — it is the delegated LinkedIn rail. |
