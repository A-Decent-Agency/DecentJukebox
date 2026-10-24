import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ContractFactory, Interface, getAddress, id, keccak256, ZeroAddress, ZeroHash } from 'ethers';

export const MARKET_COMMIT = '094b4acca947437d4a3b1344ddd75441ddb18f2d';
export const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const hash = value => assert.match(value, /^0x[0-9a-fA-F]{64}$/, 'Expected bytes32');
function address(value) {
  assert.equal(typeof value, 'string', 'Expected address, not ENS or key');
  const result = getAddress(value);
  assert.notEqual(result, ZeroAddress, 'Zero address forbidden');
  return result;
}
function exactKeys(value, keys) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'Expected object');
  for (const key of Object.keys(value)) assert.ok(keys.includes(key), `Unknown field: ${key}`);
}
export function validateConfig(input) {
  exactKeys(input, ['reviewed', 'chainId', 'admin', 'worker', 'token', 'router', 'fundIds',
    'gasContributionCapWei', 'workerRegistrar', 'songs', 'moduleReceipt', 'hostReceipt']);
  assert.equal(input.reviewed, true, 'Operator must review config');
  assert.equal(input.chainId, 8453, 'Base mainnet only');
  const config = { ...input };
  for (const field of ['admin', 'worker', 'token', 'router']) config[field] = address(input[field]);
  assert.equal(config.token, USDC, 'Native Base USDC required');
  assert.notEqual(config.admin, config.worker, 'Admin and worker must differ');
  assert.equal(typeof input.workerRegistrar, 'boolean', 'Explicit workerRegistrar required');
  assert.match(input.gasContributionCapWei, /^[1-9][0-9]*$/, 'Positive decimal gas cap required');
  assert.ok(BigInt(input.gasContributionCapWei) < 2n ** 256n, 'Gas cap overflows uint256');
  exactKeys(input.fundIds, ['repo', 'pinners', 'playback', 'top10']);
  const funds = ['repo', 'pinners', 'playback', 'top10'].map(key => {
    hash(input.fundIds[key]);
    assert.notEqual(input.fundIds[key].toLowerCase(), ZeroHash, 'Zero fund forbidden');
    return input.fundIds[key].toLowerCase();
  });
  assert.equal(new Set(funds).size, 4, 'All fund IDs must differ');
  assert.ok(Array.isArray(input.songs) && input.songs.length <= 1000, 'Explicit songs array required (max 1000)');
  const seen = new Set();
  config.songs = input.songs.map(song => {
    exactKeys(song, ['songId', 'audioURI', 'recipients', 'sharesBps']);
    hash(song.songId);
    assert.notEqual(song.songId.toLowerCase(), ZeroHash, 'Zero song forbidden');
    assert.ok(!seen.has(song.songId.toLowerCase()), 'Duplicate song');
    seen.add(song.songId.toLowerCase());
    assert.match(song.audioURI, /^ipfs:\/\/[^\s/?#]+(?:\/[^\s?#]*)?$/, 'Reviewed IPFS audio URI required');
    assert.ok(Array.isArray(song.recipients) && song.recipients.length > 0 && song.recipients.length <= 20);
    const recipients = song.recipients.map(address);
    assert.equal(new Set(recipients).size, recipients.length, 'Duplicate recipient');
    assert.ok(Array.isArray(song.sharesBps) && song.sharesBps.length === recipients.length);
    assert.ok(song.sharesBps.every(value => Number.isInteger(value) && value > 0 && value <= 10000));
    assert.equal(song.sharesBps.reduce((a, b) => a + b, 0), 10000, 'Shares must total 10000');
    return { ...song, recipients };
  });
  return config;
}

export function loadArtifacts(checkout) {
  checkout = resolve(checkout);
  const git = (...args) => execFileSync('git', ['-C', checkout, ...args], { encoding: 'utf8' }).trim();
  assert.equal(git('rev-parse', 'HEAD'), MARKET_COMMIT, 'Wrong reviewed DecentMarket commit');
  for (const file of ['package.json', 'package-lock.json', 'hardhat.config.js']) {
    assert.equal(readFileSync(resolve(checkout, file), 'utf8').trim(), git('show', `${MARKET_COMMIT}:${file}`),
      `Modified ${file}`);
  }
  assert.equal(read(resolve(checkout, 'node_modules/@openzeppelin/contracts/package.json')).version,
    read(resolve(checkout, 'package-lock.json')).packages['node_modules/@openzeppelin/contracts'].version,
    'Installed OpenZeppelin version must match reviewed lockfile');
  const artifacts = {};
  for (const [kind, sourceName, contractName, runs] of [
    ['module', 'contracts/DJukeSponsoredPlaylistModule.sol', 'DJukeSponsoredPlaylistModule', 200],
    ['host', 'contracts/DecentJukeBox_v0.5.sol', 'DecentJukeBox_v0_5', 1],
  ]) {
    const base = resolve(checkout, 'artifacts', sourceName, contractName);
    const artifact = read(`${base}.json`);
    const buildPath = resolve(dirname(base), read(`${base}.dbg.json`).buildInfo);
    assert.ok(relative(resolve(checkout, 'artifacts/build-info'), buildPath).match(/^[^./][^/]*\.json$/),
      'Build info must be inside artifacts/build-info');
    const build = read(buildPath);
    assert.equal(build.solcVersion, '0.8.26');
    assert.equal(build.input.settings.evmVersion, 'cancun');
    assert.equal(build.input.settings.viaIR, true);
    assert.deepEqual(build.input.settings.optimizer, { enabled: true, runs });
    for (const [source, value] of Object.entries(build.input.sources)) {
      assert.ok(source.startsWith('contracts/') || source.startsWith('@openzeppelin/contracts/'), 'Unexpected source');
      assert.ok(!source.split('/').includes('..'), 'Invalid source path');
      const expected = source.startsWith('contracts/') ? git('show', `${MARKET_COMMIT}:${source}`)
        : readFileSync(resolve(checkout, 'node_modules', source), 'utf8').trim();
      assert.equal(value.content.trim(), expected, `Build input mismatch: ${source}`);
      if (source.startsWith('contracts/')) assert.equal(readFileSync(resolve(checkout, source), 'utf8').trim(), expected,
        `Modified contract: ${source}`);
    }
    const compiled = build.output.contracts[sourceName][contractName];
    assert.equal(artifact.sourceName, sourceName);
    assert.equal(artifact.contractName, contractName);
    assert.deepEqual(artifact.abi, compiled.abi);
    assert.equal(artifact.bytecode, `0x${compiled.evm.bytecode.object}`);
    assert.equal(artifact.deployedBytecode, `0x${compiled.evm.deployedBytecode.object}`);
    for (const field of ['bytecode', 'deployedBytecode']) assert.match(artifact[field], /^0x(?:[0-9a-fA-F]{2})+$/);
    assert.ok((artifact.deployedBytecode.length - 2) / 2 <= 24576, 'EIP-170 size exceeded');
    artifacts[kind] = artifact;
  }
  return artifacts;
}
function receipt(value, expectedRuntimeHash) {
  exactKeys(value, ['address', 'chainId', 'transactionHash', 'status', 'runtimeCodeHash', 'workerGasSponsored']);
  const result = address(value.address);
  assert.equal(value.chainId, 8453);
  hash(value.transactionHash);
  assert.notEqual(value.transactionHash.toLowerCase(), ZeroHash);
  assert.equal(value.status, 1, 'Successful confirmed receipt required');
  if (expectedRuntimeHash) {
    assert.equal(value.runtimeCodeHash, expectedRuntimeHash, 'Module runtime hash mismatch');
    assert.equal(value.workerGasSponsored, true, 'Sponsored module read required');
  }
  return result;
}
export async function createPlan(input, artifacts, stage) {
  const config = validateConfig(input);
  assert.ok(['module', 'host', 'configure'].includes(stage), 'Stage must be module, host or configure');
  const plan = { schemaVersion: 1, status: 'unsigned-offline-operator-plan', stage, chainId: 8453,
    sourceCommit: MARKET_COMMIT, transactions: [],
    artifactHashes: Object.fromEntries(Object.entries(artifacts).map(([key, value]) =>
      [key, { initCodeHash: keccak256(value.bytecode), runtimeTemplateHash: keccak256(value.deployedBytecode) }])),
    warnings: ['No RPC, signer, nonce, gas estimate or broadcast. Receipt fields are operator attestations, not independently verified.',
      'Verify RPC chain, receipt confirmations, runtime code, router/funds/roles, catalog rights and worker funding before signing.',
      'Host starts unpaused. Keep worker/browser payments disabled; execute configure pause first and resume only after validation.',
      'No historical migration, escrow deployment, primary-sale redirection, NFT admin grant or listener purchase is included.'] };
  const tx = (label, transaction, sender = config.admin) => ({
    label, chainId: 8453, expectedSender: sender, value: '0', ...transaction,
  });
  const moduleRuntimeHash = keccak256(artifacts.module.deployedBytecode);
  if (stage === 'module') {
    assert.ok(!config.moduleReceipt && !config.hostReceipt, 'Module stage requires a fresh config without receipts');
    const deploy = await new ContractFactory(artifacts.module.abi, artifacts.module.bytecode).getDeployTransaction();
    plan.transactions.push(tx('deploy-sponsored-module', { data: deploy.data }));
    plan.requiredNextEvidence = { address: 'CONFIRMED_MODULE_ADDRESS', chainId: 8453,
      transactionHash: 'CONFIRMED_DEPLOY_TX_HASH', status: 1, runtimeCodeHash: moduleRuntimeHash, workerGasSponsored: true };
    return plan;
  }
  const module = receipt(config.moduleReceipt, moduleRuntimeHash);
  assert.ok(![config.admin, config.worker, config.router, config.token].includes(module), 'Module address collision');
  const args = [config.token, config.router, config.fundIds.repo, config.fundIds.pinners,
    config.admin, config.worker, config.gasContributionCapWei, module, config.fundIds.playback, config.fundIds.top10];
  if (stage === 'host') {
    assert.ok(!config.hostReceipt, 'Host deployment already attested; use configure');
    const deploy = await new ContractFactory(artifacts.host.abi, artifacts.host.bytecode).getDeployTransaction(...args);
    plan.constructorArguments = args;
    plan.transactions.push(tx('deploy-djuke-host', { data: deploy.data }));
    return plan;
  }
  const host = receipt(config.hostReceipt);
  assert.ok(![module, config.admin, config.worker, config.router, config.token].includes(host), 'Host address collision');
  const abi = new Interface(artifacts.host.abi);
  const call = (label, method, args) => tx(label, { to: host, data: abi.encodeFunctionData(method, args) });
  plan.transactions.push(call('pause-before-configuration', 'pauseRequests', []),
    call('admin-registrar', 'grantRole', [id('REGISTRAR_ROLE'), config.admin]),
    call('worker-fulfiller', 'grantRole', [id('FULFILLER_ROLE'), config.worker]));
  if (config.workerRegistrar) plan.transactions.push(call('worker-registrar', 'grantRole', [id('REGISTRAR_ROLE'), config.worker]));
  for (const song of config.songs) plan.transactions.push(call(`register-${song.songId}`, 'registerSong',
    [song.songId, song.audioURI, song.recipients, song.sharesBps]));
  plan.activationAfterExternalVerification = call('resume-only-after-staging-approval', 'resumeRequests', []);
  plan.workerEnvironment = { DJUKE_CONTRACT_ADDRESS: host, DJUKE_CONTRACT_VERSION: '0.5',
    DJUKE_PAYMENTS_ENABLED: 'false', DJUKE_PLAYLIST_BATCH_ENABLED: 'false',
    DJUKE_PLAYLIST_BATCH_VERSION: '0.5', DJUKE_PLAYLIST_BATCH_ADDRESS: host,
    DJUKE_PLAYLIST_BATCH_START_BLOCK: 'REPLACE_WITH_CONFIRMED_HOST_DEPLOYMENT_BLOCK' };
  return plan;
}

async function main() {
  const options = {};
  const args = process.argv.slice(2);
  assert.equal(args.length, 6, 'Usage: node scripts/plan-djuke-deployment.mjs --market PATH --config FILE --stage module|host|configure');
  for (let i = 0; i < args.length; i += 2) {
    assert.ok(['--market', '--config', '--stage'].includes(args[i]) && !options[args[i]], 'Unknown/duplicate option');
    options[args[i]] = args[i + 1];
  }
  const plan = await createPlan(read(resolve(options['--config'])), loadArtifacts(options['--market']), options['--stage']);
  console.log(JSON.stringify(plan, null, 2));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(`Deployment plan rejected: ${error.message}`); process.exitCode = 1; });
}
