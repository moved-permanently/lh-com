# Functions table

Which interactive functions of each Lufthansa Group airline's website work on its replica: 39 functions by 6 airlines.
`functions.json` is the only file to edit. `render.mjs` makes three views from it:

| view | file | where it goes |
|---|---|---|
| table in git | `functions.md` (committed) | GitHub |
| page | `out/page.html` (not committed) | DA `/migration-status/functions`, published at https://lufthansa.turnsthe.page/migration-status/functions |
| Slack canvas | `out/canvas.html` (not committed) | canvas "Lufthansa POC: functions by brand" in the Lufthansa channel |

Never edit the page in DA or the canvas in Slack: the next update overwrites both.

## functions.json

- `updated` (YYYY-MM-DD) and `change`: the date and one or two sentences on what changed. Both show at the top of the page and
  the canvas.
- `legend`: label and note for each status.
- `footnotes`: canvas notes by key, for the account team, 1-2 sentences. A cell points to one with `footnote`; the canvas
  numbers them in order of first use and puts the number on the cell.
- `brands`: `id`, `name`, `host` (the replica), `www` (the airline's current site, for the PageSpeed "before" link), `note`.
- `functions`: `id`, `name`, `short` (optional, for → cells), `about` (what the function is; hover text of its name), and
  `cells` with one entry per brand id:
  - `status`: one of the codes below
  - `note`: hover text, one plain sentence for Lufthansa readers; required in every cell, "–" cells too
  - `see`: the function id a → cell points to
  - `footnote`: a key of `footnotes`; required on ⏳ and 💬, and worth adding on 🪏 cells that matter
  - `page`: optional path on the brand's replica where the function is (the page lists it with PageSpeed links)
  - `evidence`: the brief, commit, report or check the cell rests on; never rendered

| code | symbol | meaning |
|---|---|---|
| `done` | ✅ | works on our replica |
| `wip` | 🪏 | planned or in progress |
| `elsewhere` | 🌊 | covered elsewhere: the link goes to a system that stays |
| `stays` | 💬 | stays on the old platform by decision |
| `lh` | ⏳ | needs LH (Lufthansa or the airline has to change something) |
| `see` | → | covered in another row |
| `none` | – | the airline has no such function |

This repository is public: no names of people, no conversations with Lufthansa, no audit or decompiled material, no internal
host names, in any field.

`node render.mjs --check` fails on an unknown status, a missing note, label or about, a ⏳ or 💬 cell without a footnote, an
unknown footnote key, a → cell without a target or with a target that doesn't exist, a function without a cell for every
brand, `:name:` text (Edge Delivery turns it into an icon) and a `functions.md` that doesn't match `functions.json`.

## Routine

Run it after each change that moves a cell: function work done and checked, a publish that puts a function live on a brand,
an answer from Lufthansa, a decision, a new brand (a new entry in `brands`, a cell in every function, and the brand list in
the last test of `render.test.mjs`). Several changes in one round go into one update.

1. Edit `functions.json`: status, note, footnote, evidence, page; set `updated` and `change`.
2. Render and check:

   ```sh
   node tools/reports/functions/render.mjs
   node tools/reports/functions/render.mjs --check
   node --test tools/reports/functions/render.test.mjs
   npm run lint
   ```

3. Commit `functions.json` and `functions.md` and push to main.
4. Page: `tools/reports/functions/publish.sh` uploads `out/page.html` to DA, previews, publishes and then checks
   `.plain.html` on aem.page and aem.live (`render.mjs --verify`): every titled item link is there (one per cell, function,
   airline and legend symbol), the heading anchors the cells link to exist, and the page shows the new `updated` date.
   The page is gated on lufthansa.turnsthe.page (IMS sign-in), so the check reads the aem.page and aem.live hosts.
5. Canvas: paste `out/canvas.html` into the canvas (below), then check it with a screenshot.
6. Log one line: what changed, the commit, the publish time.

Drift check: the `updated` date on the page and on the canvas must equal `functions.json`; if not, run steps 4 and 5 again.
Rollback: `git revert` the commit, then steps 2 to 5.

## Updating the canvas

The canvas is https://adobe.enterprise.slack.com/docs/T025FJ55H/F0CDX2PEBJM (file F0CDX2PEBJM), a tab in the Lufthansa
channel; the channel has view access only. The Slack API tokens at hand can't write canvases, so it is updated in the Slack
web client in a browser tab signed in to Slack:

1. Open https://app.slack.com/client/T06DUTYDQ/C0AHV3WAJMT, then the canvas tab "Lufthansa POC: functions by brand".
2. Click into the canvas text.
3. Press Meta+A twice, then Backspace. This empties the canvas, title included; Meta+A once selects only a section.
4. Click the empty title line.
5. In the page, dispatch a paste with the HTML of `out/canvas.html`, on the node the selection is in (its parent element
   when it is a text node; the editor root ignores the event). Put only `text/html` on it: with a `text/plain` part as
   well, Slack pastes the plain text, and the table, links and list are lost.

   ```js
   const html = /* contents of out/canvas.html */;
   const sel = getSelection();
   const node = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
   const data = new DataTransfer();
   data.setData('text/html', html);
   node.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
   ```

   `node -p 'JSON.stringify(require("fs").readFileSync("tools/reports/functions/out/canvas.html", "utf8"))'` prints the
   HTML as a JavaScript string to put in place of the comment.

6. The first `<h1>` becomes the canvas title; tables, links, bold and lists come through.
7. Check the result with a screenshot of the canvas, not with the DOM: in a background tab the editor DOM keeps stale
   sections. Scroll through it: title and date, legend, the table (it scrolls sideways for Cargo and Air Dolomiti),
   totals and the numbered notes.
8. If Slack asks "Set yourself to active?", answer it first; the dialog sits over the canvas tab.
