#!/usr/bin/env node
/**
 * A gate that silently passes everything is worse than no gate — it gets cited as evidence. Every
 * rule gets a fixture that MUST be rejected; the real infra tree MUST be accepted.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { check } = require("../check-iac-guardrails.js");

function withTree(files, fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "iac-"));
  for (const [name, content] of Object.entries(files)) {
    const p = path.join(root, name);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  }
  try {
    return fn(check(root));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}
const rules = (res) => new Set(res.violations.map((v) => v.rule));
const ROOT_OK = 'terraform {\n  backend "gcs" {\n    bucket = "b"\n    prefix = "p"\n  }\n}\n';

const CASES = [
  ["G-01", { "env/main.tf": ROOT_OK + 'resource "google_project_iam_policy" "x" {\n  project = var.p\n}\n' }],
  ["G-02", { "env/main.tf": ROOT_OK + 'resource "google_project_iam_binding" "x" {\n  project = var.p\n  role = "roles/viewer"\n}\n' }],
  ["G-03", { "env/main.tf": ROOT_OK + 'resource "google_project" "x" {\n  name = "chippr-bots-x"\n}\n' }],
  ["G-04", { "env/main.tf": ROOT_OK + 'resource "google_secret_manager_secret_version" "x" {\n  secret_data = "oops"\n}\n' }],
  ["G-05", { "env/main.tf": ROOT_OK + 'resource "google_project_service" "x" {\n  service = "iam.googleapis.com"\n}\n' }],
  ["G-06", { "env/main.tf": ROOT_OK + 'resource "google_secret_manager_secret" "x" {\n  secret_id = "chipprbots-mkt-a"\n}\n' }],
  ["G-08", { "modules/m/main.tf": 'resource "google_service_account" "x" {\n  project = "chippr-bots-site-wp"\n  account_id = var.id\n}\n' }],
  ["G-09", { "modules/m/main.tf": 'provider "google" {\n  project = var.p\n}\n' }],
  ["G-10", { "env/main.tf": ROOT_OK + 'resource "google_service_account" "x" {\n  account_id = "fukuii-node"\n}\n' }],
  ["G-12", { "env/main.tf": 'terraform {\n  required_version = "~> 1.15.0"\n}\n' }],
  ["G-16", { "env/main.tf": ROOT_OK + 'module "m" {\n  source = "git::https://github.com/chippr-robotics/chippr-tf-modules.git//modules/x?ref=main"\n}\n' }],
];

for (const [rule, files] of CASES) {
  test(`${rule} fires`, () => {
    withTree(files, (res) => assert.ok(rules(res).has(rule), `${rule} did not fire; raised: ${[...rules(res)].join(", ") || "none"}`));
  });
}

test("G-13 is a warning, not a violation, until the lockfile is committed", () => {
  withTree({ "env/main.tf": ROOT_OK }, (res) => {
    assert.deepStrictEqual(res.violations, []);
    assert.ok(res.warnings.some((w) => w.rule === "G-13"));
  });
});

test("bootstrap may use local state", () => {
  withTree({ "bootstrap/main.tf": 'terraform {\n  required_version = "~> 1.15.0"\n}\n' }, (res) => {
    assert.ok(!rules(res).has("G-12"));
  });
});

test("the real infra tree is accepted", () => {
  const res = check(path.resolve(__dirname, "..", "..", "..", "infra", "terraform"));
  assert.deepStrictEqual(res.violations, [], res.violations.map((v) => `${v.rule} ${v.file}:${v.line} ${v.message}`).join("\n"));
});
