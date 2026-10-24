import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const blockers = [
  'Parent verified hosted signed-write OPTIONS 204; actual signed-profile mutations and wallet-approved paid staging/delivery remain pending.',
  'Unsigned independent deployment planner is available; real deployment confirmations, operator-reviewed routing and staged activation remain external gates.',
  'Requested DecentEscrow checkout has no demonstrated deploy/build procedure.',
  'Worker funding, roles, durable mirror recovery and independent routing are not verified by offline checks.',
  'Personal mint/royalty recipient verification and unconfirmed primary-sales routing remain pending; Agency controls ENS only.',
  'Final release commit/tag, pinned archive/artwork/metadata, duplicate-mint review and human wallet signatures remain pending.',
];

try {
  assert.ok(process.argv.slice(2).every(arg => arg === '--offline'), 'Only --offline is supported');
  const source = json('sources/busking.json');
  const inputs = json('docs/supporter-release-inputs.json');
  const metadata = json('docs/supporter-metadata.draft.json');
  assert.equal(inputs.status, 'unsigned-unminted-unreleased-draft');
  assert.equal(inputs.sourceCommit, source.commit);
  assert.equal(metadata.source_commit, inputs.sourceCommit);
  assert.equal(inputs.chainId, 8453);
  assert.equal(inputs.usdcAddress.toLowerCase(), '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913');
  assert.equal(inputs.editions, 1000);
  assert.equal(inputs.unitPriceUsdc, '10');
  assert.equal(inputs.unitPriceUnits, '10000000');
  assert.equal(inputs.royaltyBps, 1000);
  assert.equal(metadata.seller_fee_basis_points, inputs.royaltyBps);
  assert.equal(inputs.royaltyRecipientEns, 'thejollylama.eth');
  assert.equal(inputs.saleRecipientEns, null);
  assert.equal(inputs.primarySalesRoutingStatus, 'unconfirmed-existing-escrow-retains-proceeds');
  assert.equal(metadata.fee_recipient_ens, inputs.royaltyRecipientEns);
  const intendedRecipient = '0x807061DF657A7697c04045dA7d16D941861cAABc';
  assert.equal(inputs.royaltyRecipient, intendedRecipient);
  assert.equal(inputs.initialEditionRecipient, intendedRecipient);
  assert.equal(inputs.initialEditionRecipientEns, 'thejollylama.eth');
  assert.equal(inputs.recipientIntentStatus, 'approved-intent-unverified-onchain-unminted');
  assert.deepEqual(inputs.recipientResolution, { ens: 'thejollylama.eth', address: intendedRecipient,
    chainId: 1, blockNumber: null, evidenceSource: 'steward-correction-recheck-before-signing', refreshBeforeSigning: true });
  assert.deepEqual(inputs.nftAdminGrant, { role: 'DEFAULT_ADMIN_ROLE', intendedGrantee: null,
    status: 'withdrawn-not-required-personal-admin-mints', preserveExistingAdmin: true });
  assert.equal(metadata.fee_recipient, intendedRecipient);
  assert.equal(metadata.initial_edition_recipient, intendedRecipient);
  assert.equal(metadata.recipient_intent_status, inputs.recipientIntentStatus);
  assert.equal(metadata.refresh_recipient_before_signing, true);
  for (const field of ['saleRecipient', 'tag', 'releaseCommit',
    'archiveCid', 'artworkCid', 'metadataCid', 'tokenId', 'listingId', 'mintTransactionHash']) {
    assert.equal(inputs[field], null, `${field}: this preflight supports unsigned drafts only`);
  }
  for (const field of ['image', 'release_tag', 'release_commit', 'archive_cid']) {
    assert.equal(metadata[field], null, `metadata ${field} must stay unsigned/unpinned`);
  }
  const artwork = readFileSync(resolve(root, inputs.artworkCandidate));
  assert.equal(createHash('sha256').update(artwork).digest('hex'), inputs.artworkSha256);
  for (const doc of ['HOSTED-EMBED.md', 'INDEPENDENT-DEPLOYMENT.md', 'SUPPORTER-RELEASE.md']) {
    assert.ok(readFileSync(resolve(root, 'docs', doc), 'utf8').length > 100);
  }
  process.stdout.write(execFileSync(process.execPath, ['scripts/vendor-busking.mjs', '--check'],
    { cwd: root, encoding: 'utf8' }));
  console.log('PASS: offline draft terms, artwork hash, docs and immutable source inventory. No network, keys or signatures used.');
  console.log('RELEASE BLOCKED:\n' + blockers.map(item => `- ${item}`).join('\n'));
  if (!process.argv.includes('--offline')) process.exitCode = 2;
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
}
