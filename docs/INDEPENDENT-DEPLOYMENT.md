# Independent DJuke infrastructure: evidence-bound deployment guide

Independent operation is an authorized goal, **not turnkey or verified here**.
Static hosting alone does not deploy contracts, register songs, fund a worker,
pin media or settle/refund payments. Do not run historical deployment scripts
against production to discover what they do. No transaction command is provided
by this product; stop for operator review and wallet authorization at every
funding/deploy/role/registration/cutover boundary.

## Inspected source locations and limits

Inspected read-only on 2026-10-24:

| Repository / immutable commit | Relevant source |
| --- | --- |
| [DecentEscrow `7b894af72ce57835a9554c64084d856bbe7d61b7`](https://github.com/TheJollyLaMa/DecentEscrow/tree/7b894af72ce57835a9554c64084d856bbe7d61b7) | `README.md`, `contracts/DecentEscrow.sol`, `contracts/DecentEscrow_v0.1.sol` |
| [DecentMarket `094b4acca947437d4a3b1344ddd75441ddb18f2d`](https://github.com/TheJollyLaMa/DecentMarket/tree/094b4acca947437d4a3b1344ddd75441ddb18f2d) | `scripts/deploy_djuke_v05.js`, `deployments/djuke-v05-base.json`, `docs/DJUKE-PLAYLISTS.md`, `hardhat.config.js` |
| [DecentBusking `aa851edda6d3aa08711c66d8e7c480dedca98533`](https://github.com/TheJollyLaMa/DecentBusking/tree/aa851edda6d3aa08711c66d8e7c480dedca98533) | `discord-bot/{README.md,.env.example,config.js,index.js,ipfs-worker.js,djuke.js,djuke-gas.js,checkpoint-mirror-client.js}`, `docs/DJUKE-PLAYLISTS.md` |

The requested `/Users/j/DevTree/DecentEscrow` checkout contains **no deployment
scripts, package/build manifest or DJuke worker**. Its README says the Base escrow
address remains unset pending a Remix migration. It cannot demonstrate a
reproducible Base escrow deployment or serve as the DJuke deployment repository.
**BLOCKED:** obtain a reviewed compiler configuration, dependencies, deployment
script, constructor/role/asset inputs and verification runbook if escrow is a
release prerequisite. No escrow deployment, chain address or compatibility is
inferred from the DJuke record. The product runtime uses DJuke, not this legacy
escrow; keep these separate.

The DJuke source was actually found at
`/Users/j/DevTree/_wt/market-playlist-review`, not the older
`/Users/j/DevTree/DecentMarket` checkout. Use a clean clone at the pinned commit;
do not copy uncommitted files from someone else's worktree.

## 1. Reproduce the contract review, not a production migration

From a new operator-owned checkout (these fetch source and run local tests only):

```sh
git clone https://github.com/TheJollyLaMa/DecentMarket.git djuke-contracts
cd djuke-contracts
git checkout --detach 094b4acca947437d4a3b1344ddd75441ddb18f2d
npm ci
npx hardhat compile
npx hardhat test test/DecentJukeBox_v04_playlist.test.js test/DecentJukeBox_v05_sponsored.test.js
```

The source uses Solidity 0.8.26, Cancun, viaIR for v0.5/module and optimizer
runs 1/200 respectively. Preserve its configuration/lockfile, don't substitute
the legacy root widget dependencies. Upstream additionally documents the local
cross-repository rehearsal:

```sh
BUSKING_WORKTREE=/absolute/path/to/reviewed/DecentBusking DJUKE_REHEARSAL_VERSION=0.5 \
  npx hardhat run scripts/rehearse_djuke_v04_worker.js
```

Use the Busking commit above and install its worker dependencies first (next
section). This rehearsal uses local contracts/mock token/router; it is **not
production delivery evidence**. The upstream fork procedure in
`docs/DJUKE-PLAYLISTS.md` requires empty source lanes and an archive-capable RPC;
its current historical migration assumptions may no longer hold.

### What the exact deploy script does, and why it is NOT generic

`scripts/deploy_djuke_v05.js` SHA-256:
`90b4c5ac753884c122e03844cb33b091889d88fff3a3dd4563b77c49b93dfbea`.
It reads `DBUSK_ENV_FILE`, deployment RPC from `DJUKE_DEPLOY_RPC_URL` or that
file's `BASE_RPC_URL`, and an owner key from that file. It checks actual RPC
chain ID 8453; **even its default read-only mode requires an owner key**.
Do not run it as a key-free preflight. Its live mode has an explicit
`CONFIRM_DEPLOY` gate; this guide intentionally does not invoke it.

It hard-codes the historical v0.4 source, owner, worker, router, Base USDC,
fund IDs and hosted catalog endpoint. It checks drained source queues,
worker balance >= 0.001 ETH, active router funds/approved USDC, reconciled
legacy receipts and exact catalog audio/creator splits. It refuses album
metadata/custom listen prices instead of silently losing them. When authorized,
it pauses the source, deploys `DJukeSponsoredPlaylistModule` then
`DecentJukeBox_v0_5`, grants registrar/fulfiller roles, copies and verifies songs
and writes resumable transaction hashes before confirmation. It does not fund
the worker, deploy/configure the router/escrow, or change hosting.

The tracked `deployments/djuke-v05-base.json` (SHA-256
`bc3e9fe0132b14151282999cfa6b5c209a8e3fee3883bc8b8db28bb462233387`)
records **existing** host `0xf51D2F7892cF9D49e14DF4afDf227a59ee170A51`,
module `0x093d2dbCcBA612d2B2aD9B620cA4d0A03D98fE11`, block **52993982**,
255 songs and deployment transaction
`0x7198f31a89a0d1477feb0872937fe14ba74bc6490e211c256e9f7bf4e99fa2b0`.
This is source provenance, not a fresh RPC/bytecode audit or your deployment.

**BLOCKED for an independent deployment:** no generic v0.5 deployment script
is demonstrated. A reviewed operator-specific script/manifest must replace
these historical assumptions, preserve catalog/album/listen prices and roles,
verify module/host runtime and constructor values, and rehearse from a clean
state. Do not overwrite the historical manifest or replay its transaction IDs.
Explicitly approve admin, registrar, dedicated fulfiller, router/funds,
native USDC, catalog ownership and worker sponsorship. Keep EIP-712 domain
`DecentJukeBox` / `0.2` (not contract release version `0.5`), actual Base chain
ID and new verifying contract bound correctly. Other chains are unsupported by
this frozen widget.

## 2. Prepare the worker in an operator-owned checkout

```sh
git clone https://github.com/TheJollyLaMa/DecentBusking.git djuke-service
cd djuke-service
git checkout --detach aa851edda6d3aa08711c66d8e7c480dedca98533
cd discord-bot
npm ci
cp .env.example .env
# Edit only your ignored local file or hosting secret store, never product source.
```

The worker manifest says Node >=18; use a supported Node version satisfying the
locked dependencies' engines too. FFmpeg/Opus and Discord bot permissions/intents
are required by the worker README. This is a Discord-backed service, not a
demonstrated minimal standalone HTTP worker. A Discord application/token and
appropriate channels remain real prerequisites. Do not assume the root
`npm install` installs the worker. No worker code is vendored by this product.

Configure privately, using `discord-bot/config.js` and `index.js` over stale
v0.4 comments in `.env.example`:

| Variable | Required setup |
| --- | --- |
| `DISCORD_TOKEN`, `JUKEBOX_CHANNEL_ID` | Operator bot/token and upload channel; Message Content intent |
| `IPFS_UPLOAD_PROVIDER` | `pinata` for this paid durable worker path |
| `PINATA_JWT` | Server-only pinning credential; quota and durable retention verified |
| `PUBLIC_WORKER_URL`, `SITE_URL` | Your HTTPS service and actual host URL |
| `IPFS_ALLOWED_ORIGINS` | Exact comma-separated adopter origins; see hosted guide |
| `MINT_OWNER_WALLET`, `DECENT_NFT_CONTRACT_ADDRESS` | Reviewed owner and catalog identity; do not accept example zero/default production identity |
| `BASE_RPC_URL` / `BASE_PUBLIC_RPC_URLS`, optional `ALCHEMY_BASE_URL` | Reviewed Base read/history/transaction RPC routing; secrets server-side |
| `DJUKE_CONTRACT_ADDRESS`, `DJUKE_CONTRACT_VERSION` | Your verified host address, `0.5` |
| `DJUKE_FULFILLER_PRIVATE_KEY` | Dedicated low-balance worker signer with required roles, **not admin/mint owner key** |
| `DJUKE_PAYMENTS_ENABLED` | `false` until staging/cutover approved |
| `DJUKE_PLAYLIST_BATCH_ENABLED`, `DJUKE_PLAYLIST_BATCH_VERSION` | `false` during setup, matching `0.5` when enabled |
| `DJUKE_PLAYLIST_BATCH_ADDRESS` | Same verified address as `DJUKE_CONTRACT_ADDRESS` |
| `DJUKE_PLAYLIST_BATCH_START_BLOCK` | Actual deployment block; blank is invalid, don't copy 52993982 to a new contract |
| `CHECKPOINT_MIRROR_SECRET` | Same dedicated random secret on service + mirror, not wallet key/JWT |
| `JUKE_LOOP_TEXT_CHANNEL_ID`, optional `JUKE_LOOP_VOICE_CHANNEL_ID` | Enable actual JukeLoop playback; validate website/Discord outputs |
| `FFMPEG_PATH`, `IPFS_GATEWAY` | Working media decoder and gateway; documented fallback/retry behavior |
| `PORT` | HTTP port (worker defaults to 10000); hosting health routing must match |

Keep `WORKER_RESERVE_ENABLED` false/unset; launch v0.5 sponsorship uses separately
authorized manual ETH funding, not listener worker-ETH charges or an automatic
treasury refill. Leave unrelated DeVert payment/scheduler features disabled.
For a migration only, preserve verified old-contract receipts via
`DJUKE_LEGACY_PLAYLIST_RECEIPTS`; do not label old charges as new-contract receipts.

The required local mirror runs on an independently persistent machine with
Kubo RPC (normally `http://127.0.0.1:5001`), the same secret and your service URL.
See `discord-bot/checkpoint-mirror-client.js`; from its directory, after private
environment setup, the real script is `npm run checkpoint-mirror`.
`npm start` in `discord-bot/` starts `node index.js`; do not run it before
credentials, bot/channel isolation and payment-disable settings are reviewed.
These are deployment instructions, not commands executed by this PR.

Operate one active production worker per queue unless a separately reviewed
coordination mechanism is demonstrated. Verify mirror acknowledgments, Pinata
checkpoint writes/restoration, actual media fetch/decoder, funded fulfiller
balance, correct registrar/fulfiller roles and `gasWorker()` identity. An offline
mirror blocks new durable checkpoints; do not bypass that safeguard.

## 3. Cutover verification and rollback

With new purchases still disabled, verify `/api/djuke`,
`/api/djuke/playlist-readiness`, `/api/radio`, approved-origin preflight and
signed-profile persistence per [HOSTED-EMBED](HOSTED-EMBED.md). Readiness requires
matching version/address, quote signer, explicit safe deployment start block,
Pinata, mirror and successful worker initialization/role checks; flags alone do
not qualify. Repoint the widget's explicit config only to your verified worker
and contract, with both batch addresses equal. No `.env` or credentials in HTML.

Pause for signatures/funding/deployment review, then stage explicitly authorized
single/replacement/private/live purchases. Verify source EOF + decoder exit +
PCM consumption per resource, ordered songs and main cut-ins, durable three
retries then fourth-failure refund, restart recovery, incremental v0.5 fee
milestones and final settlement, 90/8/2 artist/fund routing, native-value zero
and ordinary wallet network gas. Preserve receipts, checkpoints and legacy
artist-credit/withdrawal access where applicable.

For rollback, stop new purchases (`DJUKE_PAYMENTS_ENABLED=false` and host checkout
flags), preserve funded paid-delivery/refund operations and journals, and drain/
reconcile both paid lanes. Never abandon paid queues, wipe journals, replay
payments, or repoint old receipts to the replacement contract.

**Unmet release evidence:** clean independent contract deployment tooling and
rehearsal; any required escrow procedure; operator identities/routing, media
rights and catalog setup; actual funded worker/mirror recovery; exact-origin
authorization; wallet-approved paid staging and delivery/refunds; recipient ENS
resolution, final immutable archive/artwork/metadata and wallet signatures.
Until those exist, independent production readiness is explicitly **blocked**.
