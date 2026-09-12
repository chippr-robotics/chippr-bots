import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isLegalTransition, effectiveState, STATES, TRANSITIONS } from '../src/states.js';
import { validateMeta } from '../src/item.js';

test('every transition target is a known state', () => {
  for (const [from, tos] of Object.entries(TRANSITIONS)) {
    assert.ok(STATES.includes(from), from);
    for (const to of tos) assert.ok(STATES.includes(to), `${from} -> ${to}`);
  }
});

test('terminal states have no exits; approved can retract but never silently un-approve', () => {
  assert.deepEqual(TRANSITIONS['rejected'], []);
  assert.deepEqual(TRANSITIONS['retracted'], []);
  assert.ok(isLegalTransition('approved', 'retracted'));
  assert.ok(isLegalTransition('approved', 'in-review'));
  assert.ok(!isLegalTransition('approved', 'drafted'));
  assert.ok(!isLegalTransition('idea', 'approved'));
});

test('published is derived from the primary-channel receipt, never stored', () => {
  const meta = { state: 'approved' };
  assert.equal(effectiveState(meta, {}), 'approved');
  assert.equal(effectiveState(meta, { wordpress: { status: 'ok' } }), 'published');
  assert.equal(effectiveState({ state: 'in-review' }, { wordpress: { status: 'ok' } }), 'in-review');
});

test('approved meta requires an approval artifact', () => {
  const base = { slug: 's-1', state: 'approved', platforms: ['wordpress'] };
  assert.ok(validateMeta('s-1', base).some((e) => /approved items/.test(e)));
  assert.equal(
    validateMeta('s-1', { ...base, review: { preApproved: true, batch: 'b' } }).length,
    0,
  );
  assert.equal(validateMeta('s-1', { ...base, review: { pr: 12 } }).length, 0);
});
