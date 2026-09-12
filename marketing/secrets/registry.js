// Data-only secret registry (constitution IV, after FairWins spec 097).
// Payloads live ONLY in GCP Secret Manager under the chipprbots-mkt- prefix;
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
    note: 'WordPress Application Password for the marketing service user on chipprbots.com. Blast radius EXCEEDS WordPress: Jetpack Social fans posts out to LinkedIn and the ActivityPub plugin federates them, so treat as a distribution credential, not a CMS login.',
  },
  {
    id: 'chipprbots-mkt-mastodon-token',
    env: ['MASTODON_TOKEN'],
    class: 'token',
    profiles: ['publish'],
    note: 'Mastodon access token (write:statuses) for the brand account.',
  },
  {
    id: 'chipprbots-mkt-bsky-app-password',
    env: ['BSKY_APP_PASSWORD'],
    class: 'password',
    profiles: ['publish'],
    note: 'Bluesky app password for the brand account on bsky.social.',
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
