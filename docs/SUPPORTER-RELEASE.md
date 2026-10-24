# Unsigned DJuke supporter release checklist (S11 / S12)

**Released and pinned; not minted or listed.** The public
[v0.1.0 release](https://github.com/A-Decent-Agency/DecentJukebox/releases/tag/v0.1.0)
has frozen source/site/art/metadata assets. The local draft JSON remains unsigned
planning input, not the frozen manifest or on-chain evidence. Related:
[DecentBusking #245](https://github.com/TheJollyLaMa/DecentBusking/issues/245).

Prepared parameters: 1,000 ERC-1155 editions × 10 native USDC on **Base (8453)**,
royalty **1,000 bps (10%)**. The steward corrected the wallet split:
**thejollylama.eth**, `0x807061DF657A7697c04045dA7d16D941861cAABc`, handles
supporter registration/minting, initial editions and royalties.
**decentagency.eth**, `0xcAeEd8422fB5682C298B7F0971906d446fFd4e7a`, controls
only the widget ENS subnames on Ethereum. The proposed Agency NFT-admin grant
is withdrawn: do not sign it. Keep the existing personal NFT admin.
These are unsigned intentions, not on-chain configuration. Refresh ENS and
Base role state immediately before signing; no `CREATOR` override is required.
Primary-sales routing is **unconfirmed**: the existing escrow retains proceeds;
these inputs do not redirect them to either wallet. Stop before stock transfer
or listing until the proceeds route is explicitly approved.
Support maintenance and infrastructure, not financial return.

Deployment/adoption evidence: [hosted checklist](HOSTED-EMBED.md) and
[independent infrastructure guide](INDEPENDENT-DEPLOYMENT.md).
`npm run preflight:offline` validates draft terms and local provenance;
`npm run preflight` deliberately exits 2 until release evidence is supplied.
Offline success is not deploy, origin, funding, delivery or royalty verification.

The follow-up unsigned independent deployment path is implemented in
`scripts/plan-djuke-deployment.mjs`: module creation, confirmed-module host
creation, then role/song/configuration calldata from actual pinned Market ABIs.
See [operator commands and review boundaries](INDEPENDENT-DEPLOYMENT.md#key-free-independent-operator-path-module--host--configuration).
It never connects to an RPC or holds a key. 13 product tests including real
artifact decoding passed with `DJUKE_MARKET_CHECKOUT` set; the upstream local
worker rehearsal passed with zero real Base transactions. Actual deployment,
funding, actual signed writes, signatures and paid audio evidence remain gates.

Parent deployment probes subsequently verified **204 signed-write OPTIONS** for
Agency Pages, `https://djuke.decentagency.eth.limo` and
`https://dvert.decentagency.eth.limo`. This is deployed CORS/preflight evidence,
not proof of an actual wallet-signed mutation or paid delivery. No Render
configuration was changed by this product PR. Subsequent v0.1.0 preparation
passed with configured Pinata authorization; its public manifest is authoritative.

## Historical local verification (before v0.1.0 publication)

- `npm run verify:source`: all 14 frozen files match Busking
  `aa851edda6d3aa08711c66d8e7c480dedca98533`; vendored modules unchanged.
- `npm test`: 9 tests pass, including mounted synthetic checkout/recovery,
  teardown/cancellation and fail-closed release preflight.
- `npm run preflight:offline`: validates unsigned terms, screenshot SHA-256 and
  source inventory. `npm run preflight` exits 2 as expected: release blocked.
- Integrated browser served `widget.html` on `http://127.0.0.1:18793`:
  one header and one widget, live public catalog with 255 songs (256 select
  options including placeholder), connected queue status, disconnected checkout/
  profile-save/Play Live disabled. No injected wallet, signatures or purchases.
  Port 8793 was already occupied by another process; it was not stopped.
- After adding the pinned kit callers/root entry, `npm test` passes **11/11**.
  A fresh dedicated integrated browser page at the product root
  `/?release-check=djuke-kit-20261024` mounts the actual widget and header,
  connects to the public queue, and filters the real catalog to
  “Smart contract jukebox — joseacabrerav” through its search control.
  Checkout remains disconnected/disabled. Neither preparation nor notification
  workflow was dispatched; credentials, IPFS pins and production origin approval
  are not established by these checks.

This is unsigned browsing only, not adopter-origin permission, transaction,
audio delivery, production deployment or independent-worker evidence.

Source standards:
- [DecentHead S12 adopting guide](https://github.com/TheJollyLaMa/DecentHead/blob/072a5206489d0e4a3f2576c56f8debb729d933c9/docs/ADOPTING.md#widget-host-api).
- [DecentHead supporter release procedure](https://github.com/TheJollyLaMa/DecentHead/blob/072a5206489d0e4a3f2576c56f8debb729d933c9/docs/SUPPORTER-RELEASES.md).

## Prepared release notes

The DJuke product now exports a plain `mount(element, options)` module with
isolated theming, accessible/reduced-motion controls and lifecycle teardown.
It retains real platform-backed single/song replacement, ordered drafts,
immutable profile playlist save/copy/discovery, Personal Play with durable local
recovery and Play Live with receipts under Profile → Playlists. It reuses the
host's DecentHead wallet/IPFS sessions, never a second header/login.

Exact reused Busking code: `aa851edda6d3aa08711c66d8e7c480dedca98533`.
The integrated upstream source was subsequently merged in
[#282](https://github.com/TheJollyLaMa/DecentBusking/pull/282), merge commit
`abb78288f1cd8c1ff19f5163d1004f4b0c563f52`. This records upstream integration;
the product's immutable manifest/inventory remain pinned to the reviewed freeze
above, not silently refreshed to that merge.
`sources/busking.json` and `vendor/busking/INVENTORY.json` identify every file and
SHA-256. This is newer than `045c625` and retains #274's per-resource EOF/PCM
evidence fixes. Worker code is **not bundled** or represented as self-hosted:
canonical queue reads, signed quote service, USDC contracts, worker balance,
durable mirror/retry/refund/settlement, CORS/profile origin approval and gateway/
pinning infrastructure remain deployment dependencies.

## Gates requiring separate authorization

### Pinned reusable preparation and announcement

The product callers `.github/workflows/supporter-{release,announce}.yml` use
DecentHead **`3b2a72f7f8c49fb2af89ea7df2ead8e338e0e870`** in both `uses:`
and `head_ref`. Source:
[SUPPORTER-PRODUCTS.md](https://github.com/TheJollyLaMa/DecentHead/blob/3b2a72f7f8c49fb2af89ea7df2ead8e338e0e870/docs/SUPPORTER-PRODUCTS.md).
The reviewed kit renders `PRODUCT_URL` at the product root, so `index.html`
mounts the actual widget (byte-identical to `widget.html`), not the historical
app, a redirect or a directory listing.

After verification and parent release approval, publishing a GitHub release
triggers preparation, or an operator dispatches **Prepare Supporter DNFT** with
its published tag. It renders/pins the tagged source, runnable site, artwork and
metadata, freezes `supporter-release.json` as a release asset and opens a steward
mint issue. It submits no blockchain transaction, but **does pin files and write
release assets/issues**. Do not trigger it merely to test credentials.
Existing frozen releases must not be re-prepared; use a new reviewed version.
These local draft JSON files remain unsigned planning inputs, not proof that
the kit's generated metadata/contract mint/listing will match every approved
term. Review frozen metadata, 1,000 editions, 10 USDC price, 10% royalty and
recipient routing before the steward signs anything.

The parent/operator configured `PINATA_JWT` in repository secrets; preparation
succeeded. Set `SUPPORTER_ENS_NAME=djuke.decentagency.eth` only after name
control is verified, and optionally credential-free `SUPPORTER_ENS_RPC_URL`.
No credential is copied here. `DISCORD_SUPPORTER_WEBHOOK` is needed only when
announcement is deliberately enabled. **Default notifier is disabled**: the
announce job runs only if `SUPPORTER_DISCORD_ENABLED` is exactly `true`.
Keep that variable unset/false during preparation and until public evidence and
notification are approved.

The announcement caller accepts tag/public `mint_evidence` JSON, checks the Base
mint/listing and, when ENS is configured, gates delivery on the pinned ENS site.
It does not mint, grant roles or alter primary sales routing. Its evidence
registration step also remains gated by the notifier opt-in, as in the pinned
template. Adding the caller is not an authorized notification or proof of ENS
ownership, current Agency admin status, live site deployment or primary routing.

- [ ] Review both source extraction PR and standalone product PR; no automatic merge.
- [ ] Verify native tests and mounted synthetic checkout tests; verify main still
  contains #274 evidence/retry fixes. A screenshot is not paid-delivery evidence.
- [ ] Obtain host-origin approval/CORS and signed-profile allowlist support from
  the platform steward; test a permitted staging host before public adoption.
- [ ] Review exact production contract/version, Base USDC, royalty/fund recipients,
  service funding, gateway availability and incident/support responsibilities.
- [ ] Freeze reviewed product commit and separately approve a release tag/version.
  Recheck provenance hashes from a clean clone; produce deterministic archive.
- [ ] Review the rendered screenshot and artwork attribution in ARTWORK-PROVENANCE;
  replace it if the final reviewed UI differs. Verify source/artwork licenses.
- [ ] Set final release tag/commit, release notes, repository, license, archive
  CID, approved artwork URI, metadata URI and royalty recipient in draft inputs.
  CID fields stay null until real files are approved and separately pinned.
- [ ] Review mint/register history to avoid duplicate registration/edition mint.
- [ ] Obtain explicit steward wallet signatures for any mint/register/list steps.
  Workers must not sign, move funds or automate these authorizations.
- [ ] Separately approve distribution/listing (1,000 × 10 USDC, Base, 1,000 bps).
- [ ] Only after verified receipts, approve release publication and announcements.

No marketplace URL, minted token ID, purchase, return, ENS registration/contenthash
update, archive pin or wallet transaction is claimed. Display case is **DJuke**;
DNS/ENS normalization is `djuke.decentagency.eth`. The label does not prove name
ownership or a deployed DNS/IPFS endpoint.
