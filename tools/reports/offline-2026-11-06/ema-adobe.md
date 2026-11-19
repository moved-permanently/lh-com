

## Standing order 62 (2026-11-19, about 17:55 to 23:00 CET): the held documents, the collapse fix, the watch on DA's source

Order 61 left nothing finished unpushed. Kept out of git: logs/b661, logs/b662 and the /tmp worktrees. The optional
plugins stayed off. Details are in [lufthansa-switch-plan-923.md](../token-free/lufthansa-switch-plan-923.md) §16.

1. **DA's source as the reference.** The prediction collapsed the served copy, which has no Metadata block and carries its
   section styles as classes.
   - The collapse copies a section's Section Metadata styles to every part it splits off, but never its classes.
   - With DA's source as the input, that difference made two tool faults visible.
2. **The 9 held documents.** I read DA's source (read only, about 17:40 CET), swapped the pictures for the served copy's
   (DA's point at www's DAM), collapsed it and rendered it on our host. The comparison was the marked page as served.
   - **Fixed in the tool** (ca73778; tests in test/collapse-held-so62.test.mjs):
     - a block title option no longer resizes an unmarked heading of another level. Instead the block takes the new
       level-scoped options h2-large, h2-compact, h2-small, h3-large or h4-large. This fixes lhg-wifi, first-class and
       tips-senior-travellers;
     - split parts no longer copy padded or flush. This fixes free2move and digital-self-services.
   - **READY in delta-so62-held-other.txt:**
     - digital-self-services, first-class, free2move, lounges, lhg-wifi, meetings-and-events and unterhaltung-an-bord
       collapse with ca73778 as they are. lounges and meetings-and-events were count-only differences.
     - tips-senior-travellers needs one insert after the collapse: H2 small on its view section.
     - All 8 draw like their marked pages: heading sizes equal, heights within 1.8 % at 1440 and 390.
   - **Still held, accepted:** travel-insurances. Its footnotes can only be a Small print section outside the padded box:
     +3.8 % at 1440, and further from www than today (18.66 against 10.23 %).
   - **32n:** helper B's count-only call was right. Its live copy is what DA's source collapses to (0.00 %). The 72 px in
     §15 came from my prediction, so no row is needed.
3. **Batches 01-04 already on live.**
   - I rebuilt their pre-batch source from order 60's census copy: section classes turned back into Section Metadata, and
     Theme and Headings taken from the served head. On the 18 documents watched, the rebuilt source collapses to the live
     copies' carriers.
   - 29 documents collapse differently with ca73778; 22 of them are on live. These 22 are READY to run again from their
     pre-batch DA version.
   - The new collapse adds no heading difference on any of them and removes some (all-check-in, online-check-in,
     flight-disruptions).
   - Over all 7,706 documents of batches 01-26, 362 collapse differently with the fix.
4. **The watch** (switch-watch-so61.txt). DA's own reads have answered 401 since about 18:00 UTC. For the carrier check I
   therefore compare with the rebuilt source collapsed with the batch's tool.
   - Batch 03: 6 marked documents (the held ones). 10 rendered as predicted, except A2's accepted doctor-on-board-news.
   - Batch 04: 3 held. 8 rendered as predicted, except A2's accepted upgrades-at-online-check-in 1440.
   - Batch 05: 0 marked; 10 rendered, nothing off.
   - The carriers of every rendered document equal what DA's source collapses to.
   - Batches 06-26 are still to come. logs/b662/watch2-loop.sh watches them every 30 minutes for 16 hours and pushes a
     line per batch through push-merge.
   - The final gate (§15) waits for batch 26.
5. **Tool commit:** ca73778 (collapse fix, block options, the 14 import bundles).
   - Full suite on its tree: lh-edge 73, site 1,312 files, none failing.
   - 12-host smoke before and after: all exit 0.

- **Pushed** (main): ca73778, 980324a (delta-so62-held-other), 29a76bd and 9e2d39b (watch, §16), and this section's commit.
- **Full suite on main 9e2d39b.** lh-edge 73 files, site 1,315 files, none failing.
- **Left out of git.** logs/b662 (DA reads, rebuilt sources, collapses, renders) and the /tmp worktrees.
- **DA read access.** From about 18:00 UTC admin.da.live answers 401, so the opt-in looks off. Turning on "Allow LLM to use
  my Adobe credentials for admin.hlx.page and Document Authoring uploads" in Settings → LLM Permissions would let the watch
  read DA's source again.
