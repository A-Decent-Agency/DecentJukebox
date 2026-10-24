const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { Interface, AbiCoder, id, keccak256 } = require('ethers');
const admin = '0x1111111111111111111111111111111111111111';
const worker = '0x2222222222222222222222222222222222222222';
const moduleAddress = '0x4444444444444444444444444444444444444444';
const hostAddress = '0x5555555555555555555555555555555555555555';
const config = () => ({
  reviewed: true, chainId: 8453, admin, worker,
  token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  router: '0x3333333333333333333333333333333333333333',
  fundIds: Object.fromEntries(['repo', 'pinners', 'playback', 'top10'].map(key => [key, id(key)])),
  gasContributionCapWei: '1000000000000000', workerRegistrar: false,
  songs: [{ songId: id('reviewed-song'), audioURI: 'ipfs://reviewed-fixture-only',
    recipients: [admin, worker], sharesBps: [9000, 1000] }],
});
test('deployment config rejects unsafe identity, routing, secrets and catalog inputs', async () => {
  const { validateConfig } = await import('../scripts/plan-djuke-deployment.mjs');
  assert.equal(validateConfig(config()).worker, worker);
  for (const patch of [
    { reviewed: false }, { chainId: 1 }, { admin: worker }, { worker: 'decentagency.eth' },
    { router: '0x0000000000000000000000000000000000000000' },
    { token: worker }, { workerRegistrar: undefined }, { privateKey: 'not-accepted' },
    { gasContributionCapWei: '-1' }, { gasContributionCapWei: (2n ** 256n).toString() },
    { fundIds: { ...config().fundIds, top10: config().fundIds.repo } },
    { songs: [{ ...config().songs[0], sharesBps: [9000, 999] }] },
    { songs: [{ ...config().songs[0], audioURI: 'https://unreviewed.example/audio' }] },
    { songs: [config().songs[0], config().songs[0]] },
  ]) assert.throws(() => validateConfig({ ...config(), ...patch }));
  assert.throws(() => validateConfig(JSON.parse(readFileSync(resolve(__dirname, '../docs/djuke-deployment.example.json')))));
});
const checkout = process.env.DJUKE_MARKET_CHECKOUT;
test('actual reviewed artifacts encode module, ten host arguments and configuration roles without a signer',
  { skip: !checkout && 'Set DJUKE_MARKET_CHECKOUT to the pinned compiled DecentMarket checkout' }, async () => {
    const { loadArtifacts, createPlan } = await import('../scripts/plan-djuke-deployment.mjs');
    assert.throws(() => loadArtifacts(resolve(__dirname, '..')), /Wrong reviewed DecentMarket commit/);
    const artifacts = loadArtifacts(checkout);
    const initial = config();
    const first = await createPlan(initial, artifacts, 'module');
    assert.equal(first.transactions.length, 1);
    assert.equal(first.transactions[0].data, artifacts.module.bytecode);
    assert.equal(first.transactions[0].to, undefined);
    assert.equal(first.transactions[0].value, '0');
    const withModule = { ...initial, moduleReceipt: { ...first.requiredNextEvidence,
      address: moduleAddress, transactionHash: id('module-receipt') } };
    const second = await createPlan(withModule, artifacts, 'host');
    const types = new Interface(artifacts.host.abi).deploy.inputs.map(input => input.type);
    assert.deepEqual(types, ['address', 'address', 'bytes32', 'bytes32', 'address', 'address',
      'uint256', 'address', 'bytes32', 'bytes32']);
    assert.ok(second.transactions[0].data.startsWith(artifacts.host.bytecode));
    const encoded = `0x${second.transactions[0].data.slice(artifacts.host.bytecode.length)}`;
    const decoded = AbiCoder.defaultAbiCoder().decode(types, encoded);
    assert.deepEqual([...decoded].map(String), second.constructorArguments.map(String));
    assert.equal(decoded[7], moduleAddress);
    const withHost = { ...withModule, hostReceipt: { address: hostAddress, chainId: 8453,
      transactionHash: id('host-receipt'), status: 1 } };
    const third = await createPlan(withHost, artifacts, 'configure');
    const iface = new Interface(artifacts.host.abi);
    const calls = third.transactions.map(tx => iface.parseTransaction(tx));
    assert.deepEqual(calls.map(call => call.name), ['pauseRequests', 'grantRole', 'grantRole', 'registerSong']);
    assert.equal(calls[1].args[0], id('REGISTRAR_ROLE'));
    assert.equal(calls[1].args[1], admin);
    assert.equal(calls[2].args[0], id('FULFILLER_ROLE'));
    assert.equal(calls[2].args[1], worker);
    assert.deepEqual([...calls[3].args[3]], [9000n, 1000n]);
    assert.equal(iface.parseTransaction(third.activationAfterExternalVerification).name, 'resumeRequests');
    assert.ok(third.transactions.every(tx => tx.to === hostAddress && tx.expectedSender === admin && tx.value === '0'));
    assert.equal(third.workerEnvironment.DJUKE_PAYMENTS_ENABLED, 'false');
    const registrar = await createPlan({ ...withHost, workerRegistrar: true }, artifacts, 'configure');
    assert.equal(registrar.transactions[3].label, 'worker-registrar');
    assert.equal(first.artifactHashes.module.runtimeTemplateHash, keccak256(artifacts.module.deployedBytecode));
    await assert.rejects(createPlan(initial, artifacts, 'host'));
    await assert.rejects(createPlan(withModule, artifacts, 'configure'));
    await assert.rejects(createPlan({ ...withModule, moduleReceipt: { ...withModule.moduleReceipt, runtimeCodeHash: id('wrong') } }, artifacts, 'host'));
    await assert.rejects(createPlan({ ...withModule, moduleReceipt: { ...withModule.moduleReceipt, status: 0 } }, artifacts, 'host'));
    await assert.rejects(createPlan(withHost, artifacts, 'host'));
    await assert.rejects(createPlan({ ...withModule, moduleReceipt: { ...withModule.moduleReceipt, chainId: 1 } }, artifacts, 'host'));
    await assert.rejects(createPlan({ ...withHost, hostReceipt: { ...withHost.hostReceipt, address: moduleAddress } }, artifacts, 'configure'));
    const originalBytecode = artifacts.module.bytecode;
    assert.ok(originalBytecode.length > 1000, 'Must exercise a real compiled module, not a stub');
  });
