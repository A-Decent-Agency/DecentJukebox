# Clone, adapt and support DJuke

Reuse the existing [DecentJukebox repository](https://github.com/A-Decent-Agency/DecentJukebox),
not a duplicate product or supporter token. Need: an independently embeddable,
customizable jukebox with explicit payment consent and teardown.
The receiving implementation is `widget.js` → `vendor/busking/js/djuke-widget.mjs`;
`sources/busking.json` pins DecentBusking
`948289670ed43678ea0dcaeafd8ea487bd78a2b0`. Reuse/adapt this existing closure,
not the historical `public/` application or a new shared extraction.

## Clone and customize

Follow [clone/preview and the mount example](../README.md#clone-and-preview).
No build/install is needed for static preview. Change the mount title and
`--djuke-*` CSS variables; retain accessible song, price, split and receipt controls.
Use one existing DecentHead session and call the returned `destroy()` when
disposing the host route. Mount must not connect, switch chains or request a
signature. Payments/profile writes require explicit user action.

A clone is a frontend, not independent infrastructure. Choose
[hosted-service onboarding](HOSTED-EMBED.md) or
[independent deployment](INDEPENDENT-DEPLOYMENT.md). Exact-origin approval,
Base contracts, worker funding/media delivery, storage and recovery are separate
operator responsibilities. Keep unavailable/error states; do not mock successful
checkout. Never copy secrets or put signing keys in frontend configuration.

## Existing ENS and supporter evidence

Published release: [v0.2.0](https://github.com/A-Decent-Agency/DecentJukebox/releases/tag/v0.2.0),
source commit `935cd49aaf2aca4197a67b7f2f1a8dbb563661c8`.
The following are public release snapshots, inspected 2026-11-02, not a fresh
RPC verification or a promise of present stock:

- [Mint/ENS evidence](https://github.com/A-Decent-Agency/DecentJukebox/releases/download/v0.2.0/supporter-mint-evidence.json),
  verified `2026-10-24T19:50:25.400Z`: **100** minted editions, token **72** on Base;
  ENS **`djuke.decentagency.eth`**, owner
  `0xcAeEd8422fB5682C298B7F0971906d446fFd4e7a`, resolver
  `0xF29100983E058B709F3D539b0c765937B804AC15`, contenthash for site
  `bafybeigsij2lmbgkuctllu6xdrb6w4hk5cmrbih2pxl4fzrj45s45eandm`.
- [Later listing evidence](https://github.com/A-Decent-Agency/DecentJukebox/releases/download/v0.2.0/supporter-listing-evidence.json),
  verified `2026-10-24T19:59:23.565Z`: listing **2**, initially **99**
  editions at **10 native Base USDC**, one personal reserve.
  Proceeds are **retained in community escrow**, not automatically paid to
  the minting/royalty wallet. Secondary royalty: **1,000 bps (10%)**.

Existing NFT: `0xe63EC9f8228720bAAC2fD528C0A6d06B3Dc5439B`.
Escrow: `0x31b07b83e99A9bdF379bf40225b8A80d3804C89d`.
[Support the existing listing](https://thejollylama.github.io/DecentHead/supporter/buy.html?chainId=8453&escrow=0x31b07b83e99A9bdF379bf40225b8A80d3804C89d&listingId=2).
Verify chain, token, active listing, current quantity, price and destination in
the wallet before buying. Support buys no financial return, music rights,
unlimited service or mandatory license; do not mint/register another token.
The earlier mint snapshot's “not listed” status predates the later listing.
Draft JSON, old release prose and offline preflight do not override these receipts.

## Validation and support

For all local tests, first `npm ci --ignore-scripts --no-audit --no-fund`;
then `npm test`, `npm run verify:source` and `npm run preflight:offline`.
The artifact-decoding test additionally requires the reviewed compiled Market
checkout documented in the independent guide. Synthetic lifecycle/payment
tests and offline provenance checks do not prove live paid delivery.

[Report product issues](https://github.com/A-Decent-Agency/DecentJukebox/issues)
with version, host origin, browser, visible error and public transaction hash;
never include recovery phrases, secrets or private profile exports.
Retain Apache-2.0 code, CC-BY-4.0 original creative-content attribution and
upstream LICENSE/NOTICE. Artist recordings have separate rights.
