// Data-only secret registry (constitution IV, after FairWins spec 097).
// Payloads live ONLY in GCP Secret Manager — under the chipprbots-mkt- prefix
// (containers Terraform creates) or in a PRE-EXISTING owner-managed container
// marked `preExisting: true` (Terraform only GRANTS access to those);
// this table says what exists, which env var it feeds, its class, and which
// least-privilege profile delivers it. check.js enforces catalogue parity:
// every enabled adapter's credentialEnv must resolve here, and every entry
// here must be claimed by a catalogue row (no orphan credentials).

export const PROJECT_ID = 'chippr-bots-site-wp';
export const SECRET_PREFIX = 'chipprbots-mkt-';

export const REGISTRY = [
  {
    id: 'chipprbots-mkt-wp-app-password',
    env: ['WP_APP_PASSWORD'],
    class: 'password',
    profiles: ['publish'],
    note: 'WordPress Application Password for the marketing service user on chipprbots.com. Blast radius EXCEEDS WordPress: the WP LinkedIn Auto Publish plugin on the site fans posts out to LinkedIn and the ActivityPub plugin federates them (twitter-auto-publish is unhooked for this user by the chippr-marketing-rails must-use plugin), so treat as a distribution credential, not a CMS login.',
  },
  {
    id: 'chipprbots-mkt-mastodon-token',
    env: ['MASTODON_TOKEN'],
    class: 'token',
    profiles: ['publish'],
    note: 'Mastodon access token (write:statuses) for the brand account. No brand account exists yet (PLAN.md §7): the blog already federates as @chipprbots@chipprbots.com via the ActivityPub plugin. Container stays empty (honest not-configured) until that decision lands.',
  },
  {
    id: 'chippr-social-bluesky',
    preExisting: true,
    env: ['BSKY_APP_PASSWORD'],
    class: 'password',
    profiles: ['publish'],
    note: 'Bluesky app password for @chipprbots.com (did:plc:hyckc5a4scdii4oijbouaiug, PDS truffle.us-east.host.bsky.network). PRE-EXISTING owner-managed container (2026-08-23, user-managed replication): Terraform grants secretAccessor via secret_accessor_secrets and never creates it. Verified 2026-09-12 — createSession succeeds against bsky.social and the PDS.',
  },
];

// Deliberately non-secret configuration the publisher also needs; kept here
// so "unclassified env var" is a reportable state, not a shrug.
export const PUBLIC_ENV = [
  'WP_BASE_URL',
  'WP_USERNAME',
  'MASTODON_BASE_URL',
  'BSKY_SERVICE',
  'BSKY_IDENTIFIER',
  'MARKETING_APPROVERS',
];

export function secretsForProfile(profile) {
  const entries = REGISTRY.filter((r) => r.profiles.includes(profile));
  if (entries.length === 0) {
    // A typo must not resolve to "no secrets needed" (spec-097 lesson).
    throw new Error(`unknown secrets profile "${profile}"`);
  }
  return entries;
}
