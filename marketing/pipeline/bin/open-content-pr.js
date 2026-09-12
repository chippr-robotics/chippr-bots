#!/usr/bin/env node
// Opens the PR for the pushed content/** branch as github-actions[bot].
// Invoked by .github/workflows/marketing-content-pr.yml; all inputs are env:
//   GITHUB_REPOSITORY GITHUB_TOKEN HEAD_BRANCH [BASE_BRANCH] [PUSHER]
//   [MARKETING_APPROVERS] COMMIT_MESSAGE_FILE
import { readFile } from 'node:fs/promises';
import { openContentPr } from '../src/contentPr.js';

const file = process.env.COMMIT_MESSAGE_FILE;
const commitMessage = file ? await readFile(file, 'utf8') : '';

const result = await openContentPr({
  env: process.env,
  commitMessage,
  log: (line) => console.log(`[content-pr] ${line}`),
});
console.log(JSON.stringify(result, null, 2));
