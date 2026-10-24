# Hosted-service embed and origin onboarding

This mode serves the static DJuke module on your host and uses the separately
operated DecentBusking worker/contracts. It is not an iframe, worker deployment,
or unlimited hosted-service entitlement. No wallet signature is needed to browse.
The supported chain in this frozen product is **Base mainnet, 8453**; do not
substitute a chain, bridged token, older DJuke version or arbitrary service.

## 1. Host assets and the shared session

Use a reviewed product commit, run `npm run verify:source` and `npm test`, and
serve `widget.js` **and the entire relative `vendor/busking/` tree** with JS MIME
types. `widget.js` alone is not a bundle. Keep LICENSE/NOTICE and attribution.
For a local unsigned preview use the README's Python server on port 8793.
Production uses HTTPS. Avoid `file:` and opaque/sandbox origins.

Use the README's complete mount example. The host loads one DecentHead v2
(the demo pins commit `072a5206489d0e4a3f2576c56f8debb729d933c9`) and supplies
ethers v6. Keep its Base chain configuration and wallet/IPFS session; do not add
a second wallet connection button, provider, IPFS login, or header. Injecting
`options.config` does not rewrite the host's globals. `ipfsUploadServiceUrl` is
the worker base URL, despite its historical upload-oriented name.

Current hosted example (not a fresh chain verification):

| Setting | Value |
| --- | --- |
| `ipfsUploadServiceUrl` | `https://decentbusking.onrender.com` |
| `djukeContractAddress`, `djukePlaylistBatchAddress` | `0xf51D2F7892cF9D49e14DF4afDf227a59ee170A51` |
| `djukeContractVersion`, `djukePlaylistBatchVersion` | `0.5` |
| `djukePlaylistBatchEnabled`, `djukePlaylistRadioReady` | `true` only after worker staging validation |
| Native Base USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

`djukePlaylistRadioReady: true` is an integration input, **not readiness evidence**:
the widget also reads the worker readiness endpoint. Keep it false during setup.
On SPA disposal call `destroy()` once; it is idempotent. Preserve browser local
storage for Personal Play recovery. Do not confuse a static IPFS gateway with
durable media pinning. Configure CSP for the exact header/ethers dependencies,
worker `connect-src`, media gateway `media-src`/`connect-src`, and host scripts
and styles; account for the widget's shadow-root style and demo inline scripts.
Do not solve a failed CSP by globally allowing all sources.

## 2. Ask the worker operator to approve the exact origin

Send the operator: production and staging **origins** (scheme + hostname + port,
no URL path), product/source commits, public worker URL, expected contract/version,
support contact and requested profile/playlist capabilities. Origins
`https://example.org` and `https://www.example.org` differ; localhost and
127.0.0.1 differ; a GitHub Pages repository path is not an origin.

At frozen Busking commit `aa851edda6d3aa08711c66d8e7c480dedca98533`:

- `discord-bot/config.js` builds `allowedOrigins` from comma-separated
  `IPFS_ALLOWED_ORIGINS` plus `new URL(SITE_URL).origin`.
- `discord-bot/ipfs-worker.js` checks that set for CORS and creator-profile
  mutations. This is the source of truth; there is no demonstrated separate
  `PROFILE_ALLOWED_ORIGINS` variable. The operator must review both CORS and
  signed-profile authorization, not merely permit public reads.
- Profile authorizations bind the browser origin, wallet and fresh signed
  content. Never reuse a signature from another origin or ask for wallet keys.

The operator updates its private service environment, deploys the reviewed worker
and confirms the new origin is effective. This PR does not change that environment.
Public GETs often return `Access-Control-Allow-Origin: *`; a working catalog is
**not** proof that saving playlists is allowed.

For this product's release, request the Agency Pages origin
`https://a-decent-agency.github.io` (the `/DecentJukebox/` repository path is
excluded), plus each **actual browser origin** used to serve
`djuke.decentagency.eth`, for example `https://djuke.decentagency.eth.limo` when
using that gateway. The ENS name alone is not a browser-origin approval; direct
`.eth`, `.eth.link`, gateway/subdomain and custom-domain hosts must each be
verified and approved if used. Do not assume a contenthash update permits them.
Preflight each signed mutation route actually consumed by the widget:

- `POST /api/creator/playlists` — save an original playlist.
- `POST /api/creator/playlists/copy` — save an attributed copy.
- `POST /api/creator/profile` — profile mutation if provided by the shared host.

All are under `https://decentbusking.onrender.com`; send `OPTIONS` with the
real `Origin`, requested method `POST` and requested header `content-type`
to each endpoint, then verify wallet-authorized mutations on the approved origin.
The first two routes are DJuke's exact signed POST boundaries; do not replace
their test with a public GET. **No current production approval is demonstrated
by this PR's tests:** browser validation is unsigned/public browsing only, and
native tests inject synthetic services. The parent/operator performs deployment
probes; this PR never modifies Render configuration.

## 3. Verify from the real origin, without buying playback

These read-only requests inspect health and CORS; no signing or funds:

```sh
curl --fail --silent --show-error https://decentbusking.onrender.com/api/djuke
curl --fail --silent --show-error https://decentbusking.onrender.com/api/djuke/playlist-readiness
curl --fail --silent --show-error https://decentbusking.onrender.com/api/radio
curl --silent --show-error --include --request OPTIONS \
  --header 'Origin: https://YOUR-APP.example' \
  --header 'Access-Control-Request-Method: POST' \
  --header 'Access-Control-Request-Headers: content-type' \
  https://decentbusking.onrender.com/api/creator/profile
```

Replace the example origin with the exact approved host. Verify a matching
allow-origin response and permitted methods/headers, not HTTP status alone.
Repeat with an unapproved origin and verify it is not permitted.
From browser devtools on your actual host, verify catalog identity, zero
catalog read errors, readiness `ready: true` with the expected contract, and
radio availability. Inspect error output instead of treating HTTP 200 as delivery.
No fake empty catalog or fabricated readiness response may qualify production.

Then test keyboard/theming/reduced motion, search, draft ordering/removal, receipt
visibility and mount/unmount; disconnected checkout stays disabled, no connect
request occurs on mount, and the host alone controls switching to Base.
Save to Profile requires a **human-reviewed message signature**: pause for it.
Verify saving, refreshing and copying a revision on the permitted origin,
disconnect/reconnect, and rejection from the unapproved origin.
Do not call that signature a payment or grant unlimited wallet authorization.

## 4. Paid staging and release gate — still blocked

Only with separately approved wallet actions, test a single/replacement, Personal
Play/recovery without repurchase, and ordered Play Live. Capture Base receipts,
actual per-resource EOF/PCM worker evidence, exact artist/fund transfers, retry
and refund/fee reconciliation. A queued purchase or browser screenshot is not
delivery. Retain existing approvals/receipts and all recovery records when
disabling new purchases for an incident; never delete checkpoints to make a
queue appear empty.

Record the exact host origin, reviewed worker/product commits, operator approval,
checks and transaction/evidence links before declaring adoption verified.
**Current blocker:** this product PR does not demonstrate operator approval or
signed-profile/paid tests from a new adopter origin. No hosted SLA is asserted.
See [independent setup](INDEPENDENT-DEPLOYMENT.md) if you operate your own worker.
