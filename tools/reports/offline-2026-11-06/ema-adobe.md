

## Standing order 65 (2026-11-20, about 06:40 to 13:00 CET): the sweeps' proposals, the final gate

Order 64 left nothing unpushed. Kept out of git: logs/b665 (the live copies of all 26 batches, the trials, captures and probes),
logs/b664. Plugins stayed off, as asked.

**How each proposal was gated** (as in order 64).
- **Full reach:** read from the live copies of batches 01-26, fetched read only from our aem.live host: 7,707 documents, 6,543
  switched on live.
- **Breakage check:** each reached page-width drawn on lufthansa.turnsthe.page as served and with the rule in the same run,
  with order 63's checks plus heading spill and the nav over the title.
- **www gate:** the reached page-widths with a www recording, captured as served and with the rule. A page-width read
  further is captured again before it counts.
- **Push:** through push-merge (the tests that read the stylesheets or import the changed scripts, stylelint, whole-repo lint
  exit 0 with no errors). Then the md5 check.

**Item 1, the proposals.**

- **1a. P1, held.** The 48px is not above the split-out column view, as the proposal put it, but below it.
  - On faq-data-security, the view and its text start at the same place in both copies. The split-out view is the page's
    last section and keeps the section gap (48px) above the footer. The marked page had none: styles.css's marked rule
    "a page whose content ends with a column view" keys on the {column-end} mark ending the last section, and the
    carriers have no such rule. So the 48px is real: faq-data-security 1440 went 0.97 -> 9.20 % with the switch.
  - First try, the carrier form of the marked rule (a non-grey, non-flush column view ending the page, or right before a
    closing Subpage Nav, keeps no gap): 1,048 documents; against www 192 page-widths, sum 1,735.79 -> 1,583.50, but 82
    closer and 49 further.
  - Second, narrower try: only pages of two sections (the first, then the view: the collapse's split of one marked
    section): 277 documents; 52 page-widths, 34 closer, 9 further (payment-options-at-the-airport +2.57 / +2.55,
    rail-fly-terms-and-conditions +1.68 / +2.35, faq-baggage-delay 1440 +2.29, services-at-frankfurt-airport 390 +1.33,
    lufthansa-aviation-group 390 +0.79).
  - The reason, read on their marked copies: the marked theme drew three endings, and the collapsed document carries none
    of them.
    - {column-end} or {column-end-outer} last: no gap (airline-apps, business-terms: these land on today's figure exactly).
    - {column-end column-spaced}: 24px (rail-fly, services-at-frankfurt-airport). The collapse dropped column-spaced
      without a carrier.
    - A Spacer from-768 after the view (payment-options).
  - Held. What would close it is in the collapse: a carrier where the marked range ended the page (the section style
    flush already means no gap below), one for column-spaced's 24px, then rows for the documents.
  - faq-data-security's and faq-password-security's www captures read 900px (the viewport only) in this run. The page
    itself draws normally (1,372 / 1,604px read alone), so those were failed captures; not counted.
- **1b. P3, c685975.** In a divider-below section that ends with a Columns Media, no take-back above the closing divider.
  - Reach: 30 documents (air-baltic and pre-check-in in each tree, visual-impairment, smart-bags), 60 page-widths. Nothing
    new flagged, no sideways scroll; the divider and what follows sit 16px lower. The 3 served captures that failed,
    read again alone: no fault.
  - www (de/en air-baltic and visual-impairment, 4 page-widths): 22.99 -> 22.05, none further (air-baltic 1440 -0.88).
- **1c. Rule 3, 2798d6d, the narrower second try.** The text after an icon heading in a padded Columns Media at 16px / 1.5.
  - First try (every Columns Media): /de/en/carry-on-baggage 1440 further against www, +8.71, and +1.32 on a second capture.
    Its icon cards are a link-list Columns Media (the baggage allowances).
  - Narrower (padded only): 70 documents, 140 page-widths, nothing new flagged, no sideways scroll. Heights move only where
    the text was 18px: the seat terms -12 to -45 (1440) and -30 to -150px (390); sitzplatzreservierungen-konditionen -45 /
    -114; the rail briefing -30 to -33 / -183 to -225.
  - www (8 page-widths): 85.88 -> 75.66, none further (advance-seat-reservations-terms-and-conditions 390 -7.49, 1440 -2.73;
    carry-on-baggage unchanged).
  - Not closed (ema-cashub's sweep-so82): the seat terms' 1440 card row pitch, 260px against www's 236 (the icon heading's
    12px padding).
- **1d. Rule 2's H2 form, a0a22f2.** Below 768px a German H2 breaks a word longer than the column too.
  - Reach: the 10 German documents with an H2 wider than its box at 390 (order 64's scan of all 1,982; batches 15-23 hold no
    German pages). The 9 spills at 390 are gone, nothing new flagged, no sideways scroll, 7 heights +31px; 1440 unchanged.
  - www: no reached page is recorded. On the 53 German phone recordings of switched pages it moves nothing (694.95 ->
    695.01, capture noise; no height moved).
- **1e. A Spacer step XXL for {spacer-400}, a4bc3af.** A near-value step of lufthansa.com and a Spacer block option xxl
  (scripts/style-markers.js); the collapse writes a Spacer block xxl for {spacer-400} where it stands. 14 import bundles
  were rebuilt.
  - Only separators of 248px or more round to it: the 13 {spacer-400} documents of the census (12 confirmation copies and
    es/es form-submission-error). {spacer-150} (84 documents) stays L.
  - Test copy (xx/pt's confirmation page, its marked copy collapsed with this tool, drawn as main with this code):

    | | text to footer | page 1440 / 390 |
    | --- | --- | --- |
    | as served (space-below-l) | 145px | 1,216 / 1,488 |
    | first try, 400px | 425px | 1,496 / 1,768 |
    | second try, 375px | 400px | 1,471 / 1,743 |
    | www | 400px | about 1,471 / 1,721-1,743 |

    At 400px the last paragraph's own 25px came on top, so the step draws 375. Nothing else moved: only xxl Spacers draw
    differently, and no live document has one yet. ema-cashub writes the rows for the switched copies.
  - lh-edge bundles style-markers.js, so its deploy ran. 12-host smoke before and after: every host answers the same
    against order 61's baseline but for content hashes of republished pages and sitemaps. This morning's before-run had
    429s on two hosts (lufthansa, swiss-cn), which now answer 200.

**The md5 check (item 3).** After each push, every changed served file on main--lh-com--moved-permanently.aem.live and on
lufthansa.turnsthe.page against origin/main matched within 1-3 checks, about 30 seconds apart:
- a0a22f2: styles.css ca1f8897….
- c685975 + a4bc3af: styles.css 1fc9aba6… and scripts/style-markers.js c7443a90….
- 2798d6d: styles.css 468844d8….

None differed. Tests and import bundles are not served (.hlxignore).

**The final gate (item 2)** (plan 923 §15.1). Batch 26's state commit was on main at 07:50 UTC; at 07:55 its 207 documents
read 0 markers on live. No new rule started after that (all five proposals were through by 07:09), and the gate ran:
logs/b664/final-gate.sh, inputs outside /tmp.
- **Census of batches 01-26 on live:** 7,707 documents read, none missing, no errors. 7,637 switched; 70 still marked, the
  held documents (0-2 a batch in 01-13, 5-8 in 14-25, 0 in 26).
- **The carrier check:** 7,552 of the 7,637 switched documents carry what DA's source collapses to: the same section styles, blocks and options. The reference is the rebuilt pre-batch source collapsed with ca73778 (logs/b663/eq62), because DA's own reads answer 401. The other 85 are listed in tools/reports/parity-2026-11-09/final-gate-carriers-so65.txt, to check against DA's source once it reads again:
  - 10 were collapsed before the fix (order 62's 362);
  - 2 carry a later row's option (gb/en phone-slider);
  - 41 differ only in heading-size section styles the reference writes and the live copy has not (the reference's Headings come from the served head);
  - 32 differ in sections or blocks (e.g. digital-travel-companion, vacation-packing-list, 100-years/destinations).
- **The 670 recorded page-widths** as served, against www (07:55-08:48 UTC). One failed capture was taken again (at/de
  services-am-flughafen 390: 900px, then 7.47).

  | | today | order 60 predicted | live |
  | --- | --- | --- | --- |
  | sum of % off www | 4,361.78 | 5,347.48 | 5,346.62 |
  | median | 5.63 | 6.71 | 6.80 |
  | worse than today by more than 0.5 | - | 313 | 298 |
  | failing (not explained by www) | - | 303 | 277 |
  | better than today by more than 0.5 | - | 63 | 66 |

  - Against the prediction: 50 page-widths closer, 34 further. The furthest are additional-services in four trees
    (+5.1 to +6.6: §15's stage video frame, the same on a second capture) and miles-and-more in four trees (+3.8 to +4.5:
    no rule of orders 64-65 reaches it; not located).
  - Against the accepted list: 275 of the 277 failing are on §14.7's list. A2's doctor-on-board-news 390 is accepted with
    A2 (named in the batch 03 watch).
  - **One is further than the accepted list:** /de/en/tiere-als-handgepaeck 390, today 4.52, predicted 5.02 (the border),
    live 5.32 on two captures. No rule of orders 64-65 reaches it; whether it joins the list is your decision.
- **The accepted list as it stands after tonight's rules:** 275 of §14.7's 303 still fail, plus A2's doctor-on-board-news
  390. 28 no longer fail: the de/en confirmation pages at both widths, secure-flight 390, lhg-wifi, the first-class service
  pages at 390, upgrade-info 390, all-check-in, frankfurt-fair 390 and others; §15.1 names them all. B2's two no longer
  count.
- Listed for later, not taken (ema-cashub's sweep-so82):
  - the seat terms' 1440 card row pitch (260 against www's 236px);
  - the "experience" articles' related teasers, which are default content where www draws a four-column view (a block,
    not a rule).

- **Full suite** on main 2798d6d (all of this order's code; 07:12-07:33 UTC, no browser beside it): lh-edge 73 files, site
  1,320 files, none failing.
- **Pushed** (main): a0a22f2, c685975, a4bc3af, 2798d6d, and this section's commit.

## Standing order 64 (2026-11-20, about 02:10 to 10:00 CET): four lufthansa.com rules from the sweeps, the final gate ready

Order 63 left nothing unpushed. Kept out of git: logs/b664 (the live copies, scans, trial and www-gate captures, the final
gate's runner) and logs/b663. Plugins stayed off, as asked. My watch loop's renders of batch 07 and later were stopped at the
start; batches 01-06 stay mine (batch 06's watch line: 2b0ef27, carriers 10 of 10 as DA's source collapses).

**How each rule was gated.**
- **Full reach.** Read from the live copies of the switched batches 01-14, all on live: 4,200 documents fetched read only from
  our aem.live host, 11 still marked (held).
- **Breakage check.** Every reached page-width drawn on lufthansa.turnsthe.page as served and with the rule, in the same run,
  with order 63's checks plus heading spill and the nav over the title.
- **www gate.** The reached page-widths with a www recording, captured as served and with the rule (compare.js), at most 3
  pages at once.
- **Push.** Through push-merge: 529 test files, the ones that read the stylesheets; stylelint; whole-repo lint exit 0 with no
  errors.

1. **ema-cashub's Rule 1, d633ef1.** From 768px, the Subpage Nav's section, as the last section after a grey band, keeps no
   pull-up margin.
   - Reach: 25 documents, 50 page-widths. The nav over the title on 13 page-widths before the rule, 0 with it.
   - Nothing new flagged, no sideways scroll, no height moved.
   - www: 12 page-widths, 90.60 -> 89.72, none further; the four upgrade pages at 1440 are 0.20-0.22 closer.
   - The first push failed one test: lh-com-flights-tail-so29 pins its @media block, so the rule now has a block of its own.
2. **ema-cashub's Rule 2, d68141c, the narrow form.** Below 768px, a German H1 breaks a word longer than the column, without
   hyphens.
   - Scan: all 1,982 German switched documents at 390. 28 have an H1 wider than its box.
   - With the rule: the 28 spills are gone, nothing new flagged, no sideways scroll. 18 titles gain a line and 14 heights
     grow 39-40px.
   - The form: none of the 28 has a www recording. The drop's 53 German phone recordings of switched pages are other pages,
     and on them neither form moves anything. So it is the narrow form, as the order says (the wide form moved 21 heights
     on the 28).
   - www: 53 page-widths, 695.11 -> 695.10.
   - Not reached: German H2s wider than the column on 10 documents (100-years/fleet, the bus and LH conditions,
     rail-fly-bedingungen, accessibility-statement; de/de and at/de). fluege's two flags (+65 and +1,036px) are the
     destination finder's screen-reader headings: 1px boxes with clip-path inset(50%), never drawn. The H2 spills are for
     ema-cashub's H2 form.
3. **"Dive Deeper", 50441c1.** An H2 with one paragraph before a four-up Carousel Cards, outside an h2-small section, draws as
   .heading-large.
   - Predictor: 40 of 40 such headings were {heading-large} before the switch. The 8 in h2-small sections keep that style.
   - Reach: 40 documents, 80 page-widths. No sideways scroll; every heading is back at 48 / 36px.
   - The only flag added is that size beside the 36 / 28px siblings, the marked copies' draw; order 63 flagged it on them.
   - www (munich, the one recorded document): 32.72 -> 32.34, 1440 0.57 closer. The recording draws the headline large and
     bold over two lines, as the rule does.
4. **"Explore more" / "Mehr entdecken", da91d70.** An H2 right before an overlay Cards Teaser draws as .heading-small.
   - Predictor: 514 of 514 such headings were {heading-small}, none unmarked.
   - Reach: 524 documents, 1,048 page-widths. 447 already draw small through their section's h2-small; 148 heights move
     9-11px.
   - No sideways scroll, no failure (3 page-widths read again alone). The only flag added is that size, the marked draw.
   - www: 26 page-widths with 50441c1 live, 250.23 -> 247.66, none further.
   - Before 50441c1 was live, munich 1440 read +0.69. With both rules it reads 13.41 -> 13.10: the two headings must be
     measured together.
   - Neither heading rule needed a second try.
- **The other two sweep files**, read at every push:
  - ema-lufthansa's sweep-so52 "PROPOSED" lines name a signature, not a rule: documents whose sections gained column-view,
    wide-text, flush and so on draw 2-8 % off their marked copy (29-42 documents a batch), with the cause not located. They
    are the collapse's carrier differences that §14.7 accepts. There is nothing to gate until a cause and a structural form
    are named.
  - ema-test's sweep-so69 proposes nothing for lufthansa.com.

**The md5 check (item 3).** After each push, styles.css as served on main--lh-com--moved-permanently.aem.live and on
lufthansa.turnsthe.page against origin/main:
- d633ef1 (1e71c449…), d68141c (185734e8…), 50441c1 (4ade4846…) and da91d70 / 2b0ef27 (55e2fbcf…) matched on both hosts
  within 1-3 checks, about 30 seconds apart. None differed.
- The test file and the watch list are not served (.hlxignore).

**The final gate (item 4), ready.** `bash logs/b664/final-gate.sh check` reads "inputs ready": every input is outside /tmp.
- The carrier check's two sets are rebuilt in logs/b663/eq62 (the fix and before it). 362 documents collapse differently, as
  in order 62.
- All 670 recordings are on disk.
- order 61's live gate has a copy with a fresh output folder (logs/b664/final/live). The old one would have skipped batches
  01-02's rows from order 61.
- `nohup bash logs/b664/final-gate.sh run &` does three things:
  - the live census of batches 01-26;
  - the carriers of every switched document against DA's source collapsed;
  - beside them, the 670 page-widths against www (about 90 minutes at 3 pages).
- Its table includes this order's four rules, so it reads against §14.8's prediction with them.

- **Full suite** on main 2b0ef27, which has all four rules (04:54-05:18 UTC, no browser beside it): lh-edge 73 files,
  site 1,318 files, none failing.
- **Pushed** (main): d633ef1, d68141c, 50441c1, da91d70, 2b0ef27, and this section's commit.

## Standing order 63 (2026-11-19/20, about 20:45 to 02:00 CET): the breakage sweep of the switched batches

Order 62 left nothing finished unpushed. Kept out of git: logs/b663 (the sweep's rows, renders' logs, the rebuilt collapse
sets), logs/b662 and the /tmp worktrees. The optional plugins stayed off: this session offered the edge-delivery-services
plugin, and I didn't enable it.

- **travel-insurances** is off plan 923 §16's accepted list. It counts with §14.7's accepted page-width differences, and its
  row in delta-so62-held-other.txt is DONE (9b46457).
1. **The sweep** ([sweep-so63-ema-adobe.txt](../parity-2026-11-09/sweep-so63-ema-adobe.txt), one part per batch).
   - Batches 01-06, with the rerun batch's 31 documents among them: 1,796 documents at 1440 and 390, 3,592 page-widths,
     each also drawn with its marked copy (order 60's census copy as main). At most 3 pages at once on our host.
   - Rendering follows the parity captures. With headless Chrome's own user agent, embeds never drew: /xx/ru/sixt read
     1,658 px at 390 instead of 4,954, with no sideways scroll. The first rows of batch 01, drawn that way, were set aside
     and batch 01 was swept again from the start.
   - Every flagged page-width was rendered once more. 3 flags didn't come back (two marked copies drawn at 900 px once, one
     card picture), so they count as capture artefacts.
   - **Faults per batch.** 01: 0. 02: 0. 03: 4 on 2 documents. 04: 2 on 1 document. 05: 0. 06: 0. No capture failed.
     - By kind: heading size out of line 2 (/de/en/homepage, both widths), empty section 2 (/de/en/culinaryjourney, both
       widths) and empty column 2 (/de/en/passengers-with-sensory-impairment 1440).
     - Every one is on the marked copy too, so none is the switch's.
   - **Later batches.** logs/b663/sweep-loop.sh sweeps each batch once it is on live (census at most 10 marked) and pushes
     its part and a watch line through push-merge. Batches 07-13 were on main at 00:22 UTC; they come next, about 35 minutes
     each.
2. **Rules and rows.** No fault reached 3 documents, so no rule was pushed. The three are listed in
   [delta-so63-com-faults.txt](../parity-2026-11-09/delta-so63-com-faults.txt), checked on the served copies against the
   census copy. There are no rows for the helper: each is the document's own content (cards, an app that loads from www,
   layout cells) and draws the same as before the switch.
3. **A size change the checks don't count.** On 80 documents of 01-06 the marked copy draws a heading at another size than
   its siblings, and the switched page doesn't. These are the size markers in default content with no carrier (§13 item
   3, held). Two of them share a place, and a structural rule could reach them:
   - the tag pages' **"Explore more"** H2 {heading-small} right before the Cards Teaser (overlay), 28 -> 36 px. It is on
     268 tag pages of the 26 batches;
   - **"Dive Deeper With Our Interest-based Episode"** H2 {heading-large} right before the Carousel Cards, 48 -> 36 px, on
     20 pages.
   - I didn't gate a rule tonight. Its full reach is about 1,000 renders against www's recordings, which doesn't fit the
     order's hours. Both are ready to try as trial CSS on their reached rows in the next order.
4. **The order 62 watch** stopped at 19:13 UTC, before batch 06 was live, so batches 06 and 07 have no watch line yet.
   - It runs again and waits for the sweep. The service restart at 21:25 UTC wiped /tmp, including the old-main worktree
     and the collapsed sets its carrier check reads. logs/b663/rebuild-eq62.sh rebuilds them into logs/b663/eq62 (outside
     /tmp) once no browser runs.
   - It and the later sweeps share one render lock, so our host never draws more than 3 pages.
   - The final gate (§15) comes after batch 26 as its own order.

- **Pushed** (main): 9b46457 (§16, travel-insurances), and this section's commit with the sweep report and the rows file.
- **Full suite** on main c5aa275 (00:04-00:22 UTC, no browser beside it): lh-edge 73 files, site 1,317 files, none failing.
- **DA read access.** admin.da.live has answered 401 since about 18:00 UTC. Turning on "Allow LLM to use my Adobe
  credentials for admin.hlx.page and Document Authoring uploads" in Settings → LLM Permissions would let the watch read
  DA's source again.

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
