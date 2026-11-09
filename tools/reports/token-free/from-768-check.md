# Separators shown from 768 px: the carrier and its check (the brief after 512, item 1)

Decision 3 revised (decisions.md). `{spacer-N from-768}` (and `{divider-N from-768}`) is a space www shows from 768 px
only. The collapse now keeps that as the purpose block's option, `Spacer (from-768)`, `Spacer (l, from-768)` or
`Divider (from-768)`. The site draws it as the marker's paragraph (`p.spacer.from-768`, hidden below 768 px by
styles.css). The DA library offers the option, and the tests are test/spacer-from-768-508.test.mjs.

## The two pages

Each page was rendered locally from its previewed document three ways:
- today's markers;
- collapsed with this change;
- collapsed without it (main at fa26e255).

The brand's theme is forced live in the browser only. Heights are main's, in px, with the difference to the marks
render:

| page | width | marks (today) | collapsed, from-768 kept | collapsed, from-768 dropped |
| --- | --- | --- | --- | --- |
| lufthansa.com /de/en/additional-services | 1440 | 5,942 | 5,942 (+0.0 %) | 5,942 (+0.0 %) |
| | 390 | 7,450 | 7,450 (+0.0 %) | 8,060 (+8.2 %) |
| SWISS /ch/de/prepare/baggage/hand-baggage | 1440 | 5,429 | 5,628 (+3.7 %) | 5,628 (+3.7 %) |
| | 390 | 9,550 | 9,811 (+2.7 %) | 9,896 (+3.6 %) |
| SWISS hand-baggage, the six languages | 390 | | +2.5 to +3.3 % | +3.4 to +4.4 % |

- **additional-services** has ten `{spacer-60 from-768}`. Kept, the phone layout is today's. Dropped, they add 610 px
  at 390. ema-adobe's measurement against www shows the same thing: 15.1 to 47.7 % (separators-40-506.md).
- **SWISS carry-on baggage**: of its `{spacer-25 from-768}`, `{spacer-30 from-768}` and `{spacer-80 from-768}`, the
  80 px one now stays off phones (-85 px at 390). The 25 and 30 px ones go, as any separator under 32 px. What is left
  at both widths (+199 px at 1440) is the H3 large section style and the 50 / 100 px separators rounded to M / L
  (swiss-pass-check.md).

## ITA, the first pass

ITA has 51 such markers in 33 documents, on its preview as in the workspace:
- 18 `{spacer-25 from-768}` (go);
- 18 `{spacer-50 from-768}` and 7 `{spacer-60 from-768}` (Spacer (from-768));
- 8 `{spacer-90 from-768}` (Spacer (l, from-768)).

The documents:
- legal/accessibility-statement-app on /be/en, /bg/en, /mt/en, /ve/en, /nl/nl, /br/pt and /jp/ja;
- world-of-ita-airways/discover-ita-airways/fleet/short-haul and …/ita-airways-app on /it/en, /it/it, /fr/fr, /es/es,
  /de/de, /nl/nl, /br/pt, /gr/el and /jp/ja;
- the homepages /it/it, /al/it, /be/it, /ch/it and /xx/it, and homepage-new on /al/it, /be/it and /ch/it.

ITA's carriers written stay 631 (Spacer (from-768) 25, Spacer (l, from-768) 8, plain Spacer blocks 126). The ITA
harness collapses with main at or after this change (harness-pass-ita.md).
