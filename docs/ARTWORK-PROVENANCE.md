# DJuke screenshot / draft artwork provenance

These are **actual browser screenshots**, not renders of an invented token,
mock UI or proof of paid playback. They are local release inputs only; nothing
was uploaded/pinned, minted, listed or announced.

## Capture

- Capture date: **2026-10-24**, approximately **10:03–10:06 UTC**.
- Page: dedicated new browser page at `http://127.0.0.1:18793/widget.html`,
  served from this owned product worktree. No shared Canopy page was used.
- Capture viewport: **780 × 652**, reduced-motion emulation enabled.
- Widget source: DecentBusking
  `aa851edda6d3aa08711c66d8e7c480dedca98533` (includes main `045c625`/#274).
- `widget.html` SHA-256:
  `8de3f939755a41fd3ad2ca712e670f41748d8c6ff2a85b6e24717c8ee45fbda1`.
- Public module entry `widget.js` SHA-256:
  `564b610113ceb83f8e37ea4bbd77b3dd6d2105334a2db4cd3dcee680fef9371f`.
- Host: real DecentHead v2.0.0 at immutable
  `072a5206489d0e4a3f2576c56f8debb729d933c9`; ethers v6.17.0.
- Public API reads only: 255 catalog songs plus selection placeholder; live
  single price **0.25 USDC**, zero paid queue items at observation. Catalog
  contents and service availability are time-specific, not guaranteed.
- Wallet remained **disconnected**, no injected wallet detected, one host
  header. A public catalog song was selected and added to an unsigned local
  one-song draft. No Save, payment, wallet-connect or upload action was used.

## Files and attribution

| File | SHA-256 | Use |
| --- | --- | --- |
| `assets/djuke-controls.png` | `3e4469283e718753714a4463c82eca12374b8f9993e01214d8ea743e5068e347` | Preferred draft artwork candidate: actual widget, pricing and song controls |
| `assets/djuke-widget.png` | `7a73f7c8488be27e542ab7fe054ecc1ec388cbea4c3cf55957763a04c3d0f79f` | Supporting host-integration screenshot: one Head and disconnected wallet |

Screenshot compilation/UI credit: **The Jolly LaMa / A Decent Agency and
DecentBusking contributors**, 2026; original project creative content is
**CC BY 4.0**, with code under **Apache-2.0**. Preserve root and vendored NOTICE/
LICENSE files. The header screenshot includes upstream DecentHead artwork and
third-party brand symbols; those retain their original rights and are not
newly relicensed by this screenshot. Prefer the controls-only candidate for a
reviewed supporter image, or obtain any additional permissions required by the
steward. No historical Gumroad 3D art or legacy music asset was copied into
these draft screenshots. Song titles/artist attribution are public UI labels,
not grants of music/media rights.

## Browser checks performed

The real standalone demo loaded a single DecentHead and reported its existing
disconnected session. Catalog/price/status controls rendered from the live
read-only service. Selecting/adding one draft song worked without login.
On the same dedicated page, three actual mount/destroy cycles on a separate
probe element using the real shared Head session ended with **zero active
Head subscriptions**, **zero shadow nodes**, one host header and an unchanged
disconnected wallet. No wallet account, chain switch, signature or transaction
was requested.

Native verification: product `node --test test/*.test.cjs`: **8/8 pass**;
`node scripts/vendor-busking.mjs --check`: **14 byte-preserved source files**;
upstream scoped DJuke + #274 EOF/PCM/retry + personal recovery/listens suite:
**98/98 pass**. Synthetic mounted handlers exercise single, replacement,
Save authorization, private checkout/recovery/no-pay resume and live playlist
checkout, including exact receipt/refund presentation.

This evidence does **not** verify a permitted production clone origin for
signed profile writes, live paid delivery, chain mutation, final release
archive, ENS ownership, final artwork clearance or a minted supporter edition.
The review/freeze/archive/license/pinning/signature gates remain in
[SUPPORTER-RELEASE.md](SUPPORTER-RELEASE.md).
