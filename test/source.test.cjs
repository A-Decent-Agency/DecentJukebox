const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

test('vendored source inventory matches the immutable Busking commit', () => {
  const root = resolve(__dirname, '..');
  const output = execFileSync(process.execPath, ['scripts/vendor-busking.mjs', '--check'], { cwd: root, encoding: 'utf8' });
  assert.match(output, /Verified 14 source files at [0-9a-f]{40}/);
});
test('public entry is a plain ES module and supporter inputs remain unsigned drafts', async () => {
  const { mount } = await import('../widget.js');
  assert.equal(typeof mount, 'function');
  const draft = JSON.parse(readFileSync(resolve(__dirname, '../docs/supporter-release-inputs.json'), 'utf8'));
  assert.equal(draft.status, 'unsigned-unminted-unreleased-draft');
  assert.equal(draft.editions, 1000);
  assert.equal(draft.unitPriceUsdc, '10');
  assert.equal(draft.royaltyBps, 1000);
  assert.equal(draft.chainId, 8453);
  assert.equal(draft.royaltyRecipientEns, 'decentagency.eth');
  assert.equal(draft.saleRecipientEns, null);
  assert.equal(draft.saleRecipient, null);
  assert.equal(draft.primarySalesRoutingStatus, 'unconfirmed-existing-escrow-retains-proceeds');
  for (const field of ['tag', 'archiveCid', 'tokenId', 'listingId', 'mintTransactionHash', 'royaltyRecipient']) assert.equal(draft[field], null);
});
test('offline preflight validates unsigned inputs but does not claim release readiness', () => {
  const { spawnSync } = require('node:child_process');
  const cwd = resolve(__dirname, '..');
  const offline = spawnSync(process.execPath, ['scripts/release-preflight.mjs', '--offline'], { cwd, encoding: 'utf8' });
  assert.equal(offline.status, 0, offline.stderr);
  assert.match(offline.stdout, /PASS: offline/);
  assert.match(offline.stdout, /RELEASE BLOCKED/);
  const release = spawnSync(process.execPath, ['scripts/release-preflight.mjs'], { cwd, encoding: 'utf8' });
  assert.equal(release.status, 2, release.stderr);
  assert.match(release.stdout, /DecentEscrow/);
  const invalid = spawnSync(process.execPath, ['scripts/release-preflight.mjs', '--deploy'], { cwd, encoding: 'utf8' });
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Only --offline/);
});
