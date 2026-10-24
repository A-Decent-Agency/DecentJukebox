# Unsigned DJuke supporter release checklist (S11 / S12)

**Not minted. Not listed. Not released.** No token/listing ID or archive CID
exists in these draft inputs. No tags, release automation or chain actions are
authorized by this implementation PR. Related:
[DecentBusking #245](https://github.com/TheJollyLaMa/DecentBusking/issues/245).

Prepared parameters: 1,000 ERC-1155 editions × 10 native USDC on **Base (8453)**,
royalty **1,000 bps (10%)**. Royalty recipient requires steward review; it is
intentionally unset. Support maintenance and infrastructure, not financial return.

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
`sources/busking.json` and `vendor/busking/INVENTORY.json` identify every file and
SHA-256. This is newer than `045c625` and retains #274's per-resource EOF/PCM
evidence fixes. Worker code is **not bundled** or represented as self-hosted:
canonical queue reads, signed quote service, USDC contracts, worker balance,
durable mirror/retry/refund/settlement, CORS/profile origin approval and gateway/
pinning infrastructure remain deployment dependencies.

## Gates requiring separate authorization

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
