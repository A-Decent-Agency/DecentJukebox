const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

test('vendored source inventory matches the immutable Busking commit', () => {
  const root = resolve(__dirname, '..');
  const output = execFileSync(process.execPath, ['scripts/vendor-busking.mjs', '--check'], { cwd: root, encoding: 'utf8' });
  assert.match(output, /Verified 15 source files at 948289670ed43678ea0dcaeafd8ea487bd78a2b0/);
});
test('public entry is a plain ES module and supporter inputs remain unsigned drafts', async () => {
  const { mount } = await import('../widget.js');
  assert.equal(typeof mount, 'function');
  const draft = JSON.parse(readFileSync(resolve(__dirname, '../docs/supporter-release-inputs.json'), 'utf8'));
  assert.equal(draft.status, 'unsigned-unminted-unreleased-draft');
  assert.equal(draft.editions, 100);
  assert.equal(draft.unitPriceUsdc, '10');
  assert.equal(draft.royaltyBps, 1000);
  assert.equal(draft.chainId, 8453);
  assert.equal(draft.royaltyRecipientEns, 'thejollylama.eth');
  assert.equal(draft.saleRecipientEns, null);
  assert.equal(draft.saleRecipient, null);
  assert.equal(draft.primarySalesRoutingStatus, 'unconfirmed-existing-escrow-retains-proceeds');
  assert.equal(draft.royaltyRecipient, '0x807061DF657A7697c04045dA7d16D941861cAABc');
  assert.equal(draft.initialEditionRecipient, draft.royaltyRecipient);
  assert.equal(draft.recipientResolution.blockNumber, null);
  assert.equal(draft.recipientResolution.refreshBeforeSigning, true);
  assert.equal(draft.nftAdminGrant.preserveExistingAdmin, true);
  assert.equal(draft.nftAdminGrant.intendedGrantee, null);
  assert.equal(draft.nftAdminGrant.status, 'withdrawn-not-required-personal-admin-mints');
  for (const field of ['tag', 'archiveCid', 'tokenId', 'listingId', 'mintTransactionHash']) assert.equal(draft[field], null);
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
test('release renderer root mounts the real widget and preserves the historical app', () => {
  const root = resolve(__dirname, '..');
  const index = readFileSync(resolve(root, 'index.html'), 'utf8');
  assert.equal(index, readFileSync(resolve(root, 'widget.html'), 'utf8'));
  assert.match(index, /import \{ mount \} from '\.\/widget\.js'/);
  assert.match(index, /const widget = mount\(/);
  assert.equal((index.match(/<decent-header>/g) || []).length, 1);
  assert.doesNotMatch(index, /http-equiv=["']refresh|<iframe/i);
  assert.ok(readFileSync(resolve(root, 'public/index.html'), 'utf8').length > 100);
  assert.ok(JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).files.includes('index.html'));
});
test('supporter callers pin both kit references and require explicit notifier opt-in', () => {
  const root = resolve(__dirname, '..');
  const pin = 'a0f3bdebcbb5ded8437446797fcba28272af8098';
  for (const [caller, reusable] of [['release', 'prepare'], ['announce', 'announce']]) {
    const workflow = readFileSync(resolve(root, `.github/workflows/supporter-${caller}.yml`), 'utf8');
    assert.ok(workflow.includes(`uses: TheJollyLaMa/DecentHead/.github/workflows/product-supporter-${reusable}.yml@${pin}`));
    assert.ok(workflow.includes(`head_ref: ${pin}`));
    assert.equal((workflow.match(new RegExp(pin, 'g')) || []).length, 2);
    assert.doesNotMatch(workflow, /DECENTHEAD_SHA|secrets:\s*inherit|@main|@master/);
    if (caller === 'release') {
      assert.ok(workflow.includes('PINATA_JWT: ${{ secrets.PINATA_JWT }}'));
      assert.match(workflow, /product_name: DJuke/);
      assert.match(workflow, /quantity: '100'/);
    } else {
      assert.ok(workflow.includes("if: ${{ vars.SUPPORTER_DISCORD_ENABLED == 'true' }}"));
      assert.ok(workflow.includes('DISCORD_SUPPORTER_WEBHOOK: ${{ secrets.DISCORD_SUPPORTER_WEBHOOK }}'));
    }
  }
});
