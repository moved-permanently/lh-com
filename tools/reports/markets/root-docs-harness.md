# The market roots' documents, for the local import harness

Status of 2026-11-06: **lists and commands only; nothing run, uploaded or published.** Bulk content
runs locally (Ben 2026-11-05), and this is more than a handful of documents: the harness runs
`root-docs-commands.sh` from the repo root, on main from the commit "feat(markets): Italian, Greek, Japanese, Korean and Polish rows" on,
with the language versions' documents in `content/` (`xx/it`, `xx/el`, `xx/ja`, `xx/ko`, `xx/pl`,
`xx/hk`, `xx/zh`, `xx/pt`, `xx/ru`) and the roots' imported documents. Both steps write only
`content/<root>/…` and upload with `da-upload.mjs` (preview, no publish).

## A: the seven new roots' nav and footer (14 documents, `root-navs-17-21.txt`)

ch/it, it/it, cy/el, gr/el, jp/ja, kr/ko, pl/pl from their language version's
(`root-docs.mjs --from xx/<ll> --to <root> --doc nav --doc footer`), as by/ru's, kz/ru's and ru/ru's
came from xx/ru's: links into the version made the root's, the label the root's (the rows'
names). Until then each root shows its version's nav and label on preview ("その他の国 | 日本語" on
jp/ja/homepage; checked 2026-11-06 on the local server with the rows). The upload is allowed
by da-upload's locale rule (`/<cc>/<ll>/nav|footer` of a table root) once the rows are on main.

## B: every language root's homepage and own pages, linked into their root again (46 documents, `root-own-links.txt`)

The roots' homepages and own pages were imported before their roots had rows, so
`root-docs.mjs --own-root` left their links into their own root on www ("until the root has locale
rows", ja.md and the others). It was not run again after the rows: on preview, 2026-11-06, none of
the 19 roots' homepages (it, el, ja, ko, pl, and hk's, zh's, pt's and ru's) has a relative link
into its root; each has 20-25 www links into it. A dry run on the documents this workspace has
(`--dry`): ao/pt/homepage 8 links made relative, by/ru 12, cn/hk 8; 3 each stay on www (no
document). The 19 homepages and the 27 own pages `tools/importer/sites/lh-com.json` lists.

## Already done (item 6 of the brief)

- **hk's and zh's root navs and footers** (cn/hk, hk/hk, tw/hk; cn/zh, hk/zh, tw/zh) and **pt's
  and ru's** (ao/pt, br/pt, pt/pt; by/ru, kz/ru, ru/ru): all 24 answer 200 in DA and on preview,
  each with its root's label and 55-59 links into its own root, none into the version or another
  root (checked 2026-11-06).
- **pt's and ru's confirmation pages**: xx/pt's 7 of `13-pt-confirmations.txt` and xx/ru's 7 of
  `14-ru-confirmations.txt` answer 200 on preview (xx/pt's eighth, de/en's
  `register-sporting-firearm/confirmation` path, is a www 404; xx/pt's form goes to
  `register-sporting-firearm1/confirmation`, which is there). `14-ru-ru-ru-confirmations.txt` was the
  fallback for ru/ru as the version; xx/ru is, so ru/ru has none of its own.
- **Still missing on preview: the own confirmations** of xx/hk (2), xx/zh, xx/it, xx/el (the lists
  `15-hk`, `16-zh`, `17-it`, `18-el-confirmations-own.txt`) and now xx/ja, xx/ko, xx/pl (`19-ja`,
  `20-ko`, `21-pl-confirmations-own.txt`, on main): each version's ammunition form links one that
  answers 404 until it is captured and imported.

## Run by the local import harness (2026-11-06, 01:58-02:24 CET)

- **Inputs**: main at c41ea1fa (the rows of bf9a13a3); `content/` filled from Document Authoring
  just before the run: the 70 documents of the 19 roots and the 2,370 documents of xx/it, xx/el,
  xx/ja, xx/ko, xx/pl, xx/hk, xx/zh, xx/pt and xx/ru. The 26 `root-docs.mjs` commands of
  `root-docs-commands.sh` ran as written; the two `da-upload.mjs` lines ran as one upload of the
  changed documents.
- **A, 14 of 14 written**: each nav has 59 or 60 links into its own root and each footer 17, the root's label,
  no link into xx/<ll> or another root; 5 (nav) and 7 (footer) www links moved to www's same root.
  None existed in DA before.
- **B, 46 run, 25 changed**: the 19 homepages had 7 to 12 links each made relative (by/ru, kz/ru,
  ru/ru 12; kr/ko and br/pt 7; the others 8), 2 to 5 stay on www (no document: for example
  `payment-options`, `discover-lufthansa/allegris`, `book-and-manage/offers-and-destination`);
  six own pages changed too (it/it's two offers, pt/pt's two companion offers, kr/ko's
  `korea-customer-info`, br/pt's `pix`). The other 21 own pages have no link into their root that
  the replica serves, so they came out unchanged and were not uploaded again. Only `href`s changed
  (and a Parent row's link text in four offers).
- **Upload**: the 39 changed documents (14 A, 25 B) uploaded and previewed, 0 problems. All 60
  read back: preview 200 and DA's text equal to the local document, 60 of 60.
- **Render on preview, 1440 px, all 19 roots' homepages**: each shows its own label in the menu's
  country and language row ("Japan | 日本語", "Polska | Polski", ...) and links into its own root
  (header 55 to 61, main 8 to 15); the www links left in the main are the targets without a document.
- **Not published.** Backup of the 46 B documents' DA sources before the run (private notes).
