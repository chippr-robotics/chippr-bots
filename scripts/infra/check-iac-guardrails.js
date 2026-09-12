#!/usr/bin/env node
/**
 * IaC guardrail gate for chippr-bots (issue #169), ported from the FairWins estate's gate and cut
 * to the rules that are true HERE. The GCP project `chippr-bots-site-wp` is SHARED — a public
 * WordPress VM, FairWins, clearpath-*, fukuii-*, kings-edge-* — and the two facts a generic linter
 * cannot know are: authoritative IAM strips other workloads' access silently, and some resources
 * (secret payloads, state buckets) are unrecoverable.
 *
 * ONE OF TWO LAYERS. The other is the applying identity not holding project-wide IAM admin; this
 * gate is what makes the mistake visible in review before it reaches the API.
 *
 * Textual HCL scan (brace-aware, comment-stripped) — no Terraform binary, no network. Rules:
 *   G-01 no *_iam_policy            G-02 no *_iam_binding          G-03 google_project is an input
 *   G-04 no secret VERSION resource G-05 project_service safe      G-06 protected types prevent_destroy
 *   G-08 no env literals in modules G-09 no provider in a module   G-10 owned-name allow-list
 *   G-12 roots need a gcs backend   G-13 roots need a lockfile     G-16 external modules SHA/tag-pinned
 * Warnings never fail the build: G-13 is a WARNING until the first `terraform init` commits the
 * lockfile (no terraform binary exists in the authoring environment; the first applier commits it).
 *
 * Usage: node scripts/infra/check-iac-guardrails.js [--root <dir>] [--json]
 */
const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..", "..");

const PROTECTED_TYPES = new Set([
  "google_kms_key_ring",
  "google_kms_crypto_key",
  "google_secret_manager_secret",
  "google_compute_address",
  "google_storage_bucket",
  "google_artifact_registry_repository",
]);

/** Every literal GCP resource NAME must match something this repository owns (allow-list). */
const OWNED_NAME_PATTERNS = [
  /^chippr-bots[-_]/, // state bucket, pool, service accounts
  /^chipprbots-mkt-/, // marketing secret containers (mirrors marketing/secrets/registry.js)
  /^github-oidc$/, // the pool provider
];
const NAME_ATTRIBUTES = ["name", "secret_id", "account_id", "workload_identity_pool_id", "workload_identity_pool_provider_id"];
const FOREIGN_MARKERS = ["clearpath-", "fukuii-", "kings-edge-", "default-allow-", "fairwins-"];
const ENVIRONMENT_LITERALS = ["chippr-bots-site-wp", "us-central1-a", "us-central1"];
const LOCAL_STATE_ALLOWED = new Set(["bootstrap"]);

// ── HCL scanning ───────────────────────────────────────────────────────────────────────────────

function stripComments(src) {
  let out = "";
  let i = 0;
  let inString = false;
  let inBlock = false;
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (inBlock) {
      if (c === "*" && n === "/") { out += "  "; i += 2; inBlock = false; continue; }
      out += c === "\n" ? "\n" : " "; i += 1; continue;
    }
    if (inString) {
      out += c;
      if (c === "\\") { out += n === undefined ? "" : n; i += 2; continue; }
      if (c === '"') inString = false;
      i += 1; continue;
    }
    if (c === '"') { inString = true; out += c; i += 1; continue; }
    if (c === "/" && n === "*") { out += "  "; i += 2; inBlock = true; continue; }
    if (c === "#" || (c === "/" && n === "/")) {
      while (i < src.length && src[i] !== "\n") { out += " "; i += 1; }
      continue;
    }
    out += c; i += 1;
  }
  return out;
}

function lineAt(src, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < src.length; i += 1) if (src[i] === "\n") line += 1;
  return line;
}

function extractBlocks(stripped) {
  const blocks = [];
  const header = /(^|\n)\s*([a-zA-Z_][a-zA-Z0-9_]*)((?:\s+"[^"]*")*)\s*\{/g;
  let m;
  while ((m = header.exec(stripped)) !== null) {
    const kind = m[2];
    const labels = (m[3].match(/"[^"]*"/g) || []).map((s) => s.slice(1, -1));
    const openIdx = stripped.indexOf("{", m.index + m[0].length - 1);
    let depth = 0;
    let i = openIdx;
    let inString = false;
    for (; i < stripped.length; i += 1) {
      const c = stripped[i];
      if (inString) { if (c === "\\") i += 1; else if (c === '"') inString = false; continue; }
      if (c === '"') inString = true;
      else if (c === "{") depth += 1;
      else if (c === "}") { depth -= 1; if (depth === 0) break; }
    }
    blocks.push({ kind, labels, body: stripped.slice(openIdx + 1, i), line: lineAt(stripped, m.index + (m[1] ? m[1].length : 0)) });
    header.lastIndex = m.index + m[0].length;
  }
  return blocks;
}

function nestedBlock(body, name) {
  const found = extractBlocks(`\n${body}`).find((b) => b.kind === name && b.labels.length === 0);
  return found ? found.body : null;
}

function attr(body, name) {
  const m = body.match(new RegExp(`(^|\\n)\\s*${name}\\s*=\\s*([^\\n]*)`));
  return m ? m[2].trim() : null;
}

const SKIP = new Set([".git", "node_modules", ".terraform"]);
function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(path.join(dir, e.name), acc); }
    else if (e.name.endsWith(".tf")) acc.push(path.join(dir, e.name));
  }
  return acc;
}

// ── the gate ───────────────────────────────────────────────────────────────────────────────────

function check(tfRoot) {
  const violations = [];
  const warnings = [];
  const rel = (f) => path.relative(REPO, f) || f;
  const fail = (rule, file, line, message) => violations.push({ rule, file: rel(file), line, message });
  const warn = (rule, file, line, message) => warnings.push({ rule, file: rel(file), line, message });

  const tfFiles = walk(tfRoot);
  for (const file of tfFiles) {
    const src = stripComments(fs.readFileSync(file, "utf8"));
    const blocks = extractBlocks(src);
    const inModule = file.split(path.sep).join("/").includes("/modules/");

    for (const block of blocks) {
      const [type, name] = block.labels;
      if (block.kind === "provider" && inModule) fail("G-09", file, block.line, "provider block inside a module");
      if (block.kind === "module") {
        const raw = attr(block.body, "source");
        const lit = raw && raw.match(/^"([^"]*)"$/);
        if (lit && !lit[1].startsWith("./") && !lit[1].startsWith("../")) {
          const ref = lit[1].match(/[?&]ref=([^&]+)$/);
          if (!ref) fail("G-16", file, block.line, `module "${block.labels[0]}" external source has no ?ref= pin`);
          else if (!/^[0-9a-f]{40}$/.test(ref[1]) && !/^v\d+\.\d+\.\d+$/.test(ref[1])) {
            fail("G-16", file, block.line, `module "${block.labels[0]}" pinned to "${ref[1]}", which is not immutable — use a 40-char SHA or a semver tag`);
          }
        }
      }
      if (block.kind !== "resource" || !type) continue;

      if (/_iam_policy$/.test(type)) fail("G-01", file, block.line, `${type} is AUTHORITATIVE for the whole policy on its target — use ${type.replace(/_iam_policy$/, "_iam_member")}`);
      if (/_iam_binding$/.test(type)) fail("G-02", file, block.line, `${type} is AUTHORITATIVE for that role — it strips it from every other principal in a SHARED project; use ${type.replace(/_iam_binding$/, "_iam_member")}`);
      if (type === "google_project") fail("G-03", file, block.line, "the project is an input (var.project_id), never a managed resource");
      if (type === "google_secret_manager_secret_version") fail("G-04", file, block.line, "a secret version resource writes the payload into state in plaintext — manage containers and bindings only");
      if (type === "google_project_service") {
        for (const a of ["disable_on_destroy", "disable_dependent_services"]) {
          if (attr(block.body, a) !== "false") fail("G-05", file, block.line, `google_project_service must set ${a} = false — the API set is shared with other workloads`);
        }
      }
      if (PROTECTED_TYPES.has(type)) {
        const lc = nestedBlock(block.body, "lifecycle");
        if (!lc || attr(lc, "prevent_destroy") !== "true") fail("G-06", file, block.line, `${type}.${name} is unrecoverable and must carry lifecycle { prevent_destroy = true }`);
      }
      for (const marker of FOREIGN_MARKERS) {
        if (block.body.includes(`"${marker}`)) fail("G-10", file, block.line, `references "${marker}" — a workload this repository does not own`);
      }
      if (type.startsWith("google_")) {
        for (const key of NAME_ATTRIBUTES) {
          const raw = attr(block.body, key);
          const lit = raw && raw.match(/^"([^"$]*)"$/);
          if (!lit) continue;
          if (!OWNED_NAME_PATTERNS.some((re) => re.test(lit[1]))) {
            fail("G-10", file, block.line, `${type}.${name} declares ${key} = "${lit[1]}", not a name this repository owns — the project is SHARED, so unrecognised names are rejected by default`);
          }
        }
      }
    }

    if (inModule) {
      src.split("\n").forEach((text, idx) => {
        for (const lit of ENVIRONMENT_LITERALS) {
          if (text.includes(`"${lit}"`) || text.includes(`"${lit}-`)) { fail("G-08", file, idx + 1, `hardcoded "${lit}" inside a module`); break; }
        }
      });
    }
    for (const block of blocks) {
      if (block.kind === "data" && block.labels[0] === "google_secret_manager_secret_version") {
        warn("G-04", file, block.line, "secret value read via data source — data-source results ARE written to state; keep this countable");
      }
    }
  }

  // Roots: a directory with a `terraform {}` block outside modules/.
  const roots = new Set(tfFiles
    .filter((f) => !f.split(path.sep).join("/").includes("/modules/"))
    .filter((f) => extractBlocks(stripComments(fs.readFileSync(f, "utf8"))).some((b) => b.kind === "terraform"))
    .map((f) => path.dirname(f)));
  for (const dir of roots) {
    const dirName = path.basename(dir);
    const bodies = fs.readdirSync(dir).filter((n) => n.endsWith(".tf")).map((n) => stripComments(fs.readFileSync(path.join(dir, n), "utf8"))).join("\n");
    const hasBackend = /backend\s+"gcs"/.test(bodies);
    if (!hasBackend && !LOCAL_STATE_ALLOWED.has(dirName)) fail("G-12", path.join(dir, "backend.tf"), 1, `root "${dirName}" has no backend "gcs" block`);
    if (hasBackend && !fs.existsSync(path.join(dir, ".terraform.lock.hcl"))) {
      warn("G-13", path.join(dir, ".terraform.lock.hcl"), 1, `root "${dirName}" has no committed .terraform.lock.hcl — commit it from the first \`terraform init\` so every machine resolves the same provider versions`);
    }
  }
  return { violations, warnings };
}

function main(argv) {
  const rootIdx = argv.indexOf("--root");
  const root = rootIdx === -1 ? path.join(REPO, "infra", "terraform") : path.resolve(argv[rootIdx + 1]);
  const { violations, warnings } = check(root);
  if (argv.includes("--json")) {
    process.stdout.write(`${JSON.stringify({ violations, warnings }, null, 2)}\n`);
  } else {
    for (const w of warnings) console.warn(`  WARN ${w.rule}  ${w.file}:${w.line}  ${w.message}`);
    if (violations.length === 0) console.log(`iac guardrails: PASS (${warnings.length} warning(s))`);
    else {
      console.error(`\niac guardrails: ${violations.length} violation(s)\n`);
      for (const v of violations) console.error(`  ${v.rule}  ${v.file}:${v.line}\n        ${v.message}\n`);
    }
  }
  return violations.length === 0 ? 0 : 1;
}

if (require.main === module) process.exit(main(process.argv.slice(2)));
module.exports = { check, stripComments, extractBlocks, attr, nestedBlock };
