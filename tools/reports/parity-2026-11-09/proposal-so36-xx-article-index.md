# An article index per xx language: proposal (standing order 36, item 3, 2026-11-16)

Proposal only. helix-query.yaml is unchanged. The migration session decides.

## Why

lufthansa.com's article blocks read the language's article index, `/<market>/<lang>/articles/query-index.json`
(scripts/articles.js loadArticles). helix-query.yaml has one for each lufthansa.com language with articles, but none
for xx/it, xx/fr or xx/es: `/xx/<l>/articles/query-index.json` answers 404 for all three. So on those pages:

- every related-articles block that has no authored cards stays empty, and its section is hidden. 18 articles are
  affected. xx/it's allegris-new-york is the exception: its three cards are authored (the order 35 row, live since
  round 465);
- every blog-overview block shows "0 results" (checked as served on lufthansa.turnsthe.page:
  /xx/fr/articles/tags/allegris-inspires shows "Oups. Nous n'avons pas encore écrit de blog sur ce sujet."). In
  www's snapshots that tag page lists 6 articles.

## The definition

Three entries, appended after the existing ones (extend, never replace). Each is `articles-de-en` with the paths
changed: same include/exclude shape, same properties, so the blocks read them as they read every other language's
index.

```yaml
  articles-xx-it:
    include:
      - /xx/it/articles/*/*
    exclude:
      - /xx/it/articles/tags/**
      - /xx/it/articles/authors/**
      - /xx/it/articles/config/**
      # a campaign page (template content on www), not an article
      - /xx/it/articles/highlights/all-it-takes-is-a-yes
      # a campaign page as well (de/en, de/de); kept as in every lufthansa.com index (no such xx document today)
      - /xx/it/articles/highlights/soccer-event-in-north-america
    target: /xx/it/articles/query-index.json
    properties:
      title:
        select: main .article-header h1
        value: textContent(el)
      description:
        select: main .article-header h1 + p
        value: textContent(el)
      image:
        select: head > meta[name="card-image"]
        # Edge Delivery writes it relative (./media_…, the page's folder): kept as written, an
        # https URL's path as before; scripts/articles.js resolves it (brief 338)
        value: match(attribute(el, "content"), "^(?:https:\/\/[^/]+)?((?:[.])?/.*)$")
      image-alt:
        select: head > meta[name="card-image-alt"]
        value: attribute(el, "content")
      page-type:
        select: head > meta[name="page-type"]
        value: attribute(el, "content")
      category:
        select: head > meta[name="category"]
        value: attribute(el, "content")
      tag-ids:
        select: head > meta[name="tag-ids"]
        value: attribute(el, "content")
      author:
        select: head > meta[name="author"]
        value: attribute(el, "content")
      author-id:
        select: head > meta[name="author-id"]
        value: attribute(el, "content")
      publication-date:
        select: head > meta[name="publication-date"]
        value: attribute(el, "content")
      reading-time:
        select: head > meta[name="reading-time"]
        value: attribute(el, "content")
      keywords:
        select: head > meta[name="keywords"]
        value: attribute(el, "content")
      destinations:
        select: head > meta[name="destinations"]
        value: attribute(el, "content")
      tags:
        select: head > meta[property="article:tag"]
        values: attribute(el, "content")
      lastModified:
        select: none
        value: parseTimestamp(headers["last-modified"], "ddd, DD MMM YYYY hh:mm:ss GMT")

  articles-xx-fr:
    include:
      - /xx/fr/articles/*/*
    exclude:
      - /xx/fr/articles/tags/**
      - /xx/fr/articles/authors/**
      - /xx/fr/articles/config/**
      # a campaign page (template content on www), not an article
      - /xx/fr/articles/highlights/all-it-takes-is-a-yes
      # a campaign page as well (de/en, de/de); kept as in every lufthansa.com index (no such xx document today)
      - /xx/fr/articles/highlights/soccer-event-in-north-america
    target: /xx/fr/articles/query-index.json
    properties:
      title:
        select: main .article-header h1
        value: textContent(el)
      description:
        select: main .article-header h1 + p
        value: textContent(el)
      image:
        select: head > meta[name="card-image"]
        # Edge Delivery writes it relative (./media_…, the page's folder): kept as written, an
        # https URL's path as before; scripts/articles.js resolves it (brief 338)
        value: match(attribute(el, "content"), "^(?:https:\/\/[^/]+)?((?:[.])?/.*)$")
      image-alt:
        select: head > meta[name="card-image-alt"]
        value: attribute(el, "content")
      page-type:
        select: head > meta[name="page-type"]
        value: attribute(el, "content")
      category:
        select: head > meta[name="category"]
        value: attribute(el, "content")
      tag-ids:
        select: head > meta[name="tag-ids"]
        value: attribute(el, "content")
      author:
        select: head > meta[name="author"]
        value: attribute(el, "content")
      author-id:
        select: head > meta[name="author-id"]
        value: attribute(el, "content")
      publication-date:
        select: head > meta[name="publication-date"]
        value: attribute(el, "content")
      reading-time:
        select: head > meta[name="reading-time"]
        value: attribute(el, "content")
      keywords:
        select: head > meta[name="keywords"]
        value: attribute(el, "content")
      destinations:
        select: head > meta[name="destinations"]
        value: attribute(el, "content")
      tags:
        select: head > meta[property="article:tag"]
        values: attribute(el, "content")
      lastModified:
        select: none
        value: parseTimestamp(headers["last-modified"], "ddd, DD MMM YYYY hh:mm:ss GMT")

  articles-xx-es:
    include:
      - /xx/es/articles/*/*
    exclude:
      - /xx/es/articles/tags/**
      - /xx/es/articles/authors/**
      - /xx/es/articles/config/**
      # a campaign page (template content on www), not an article
      - /xx/es/articles/highlights/all-it-takes-is-a-yes
      # a campaign page as well (de/en, de/de); kept as in every lufthansa.com index (no such xx document today)
      - /xx/es/articles/highlights/soccer-event-in-north-america
    target: /xx/es/articles/query-index.json
    properties:
      title:
        select: main .article-header h1
        value: textContent(el)
      description:
        select: main .article-header h1 + p
        value: textContent(el)
      image:
        select: head > meta[name="card-image"]
        # Edge Delivery writes it relative (./media_…, the page's folder): kept as written, an
        # https URL's path as before; scripts/articles.js resolves it (brief 338)
        value: match(attribute(el, "content"), "^(?:https:\/\/[^/]+)?((?:[.])?/.*)$")
      image-alt:
        select: head > meta[name="card-image-alt"]
        value: attribute(el, "content")
      page-type:
        select: head > meta[name="page-type"]
        value: attribute(el, "content")
      category:
        select: head > meta[name="category"]
        value: attribute(el, "content")
      tag-ids:
        select: head > meta[name="tag-ids"]
        value: attribute(el, "content")
      author:
        select: head > meta[name="author"]
        value: attribute(el, "content")
      author-id:
        select: head > meta[name="author-id"]
        value: attribute(el, "content")
      publication-date:
        select: head > meta[name="publication-date"]
        value: attribute(el, "content")
      reading-time:
        select: head > meta[name="reading-time"]
        value: attribute(el, "content")
      keywords:
        select: head > meta[name="keywords"]
        value: attribute(el, "content")
      destinations:
        select: head > meta[name="destinations"]
        value: attribute(el, "content")
      tags:
        select: head > meta[property="article:tag"]
        values: attribute(el, "content")
      lastModified:
        select: none
        value: parseTimestamp(headers["last-modified"], "ddd, DD MMM YYYY hh:mm:ss GMT")
```

## What each index would list

The documents are the DA folders as of 2026-11-16 04:30 CET (read-only lists), all answering 200 on aem.live.
- **articles-xx-it**, 8 rows, 7 of them page-type article (the blocks list those 7):
  - allegris-business-class-shanghai, allegris-business-san-diego, allegris-new-york,
    allegris-premium-economy-san-diego;
  - the-art-of-flying-extra-long-bed, the-art-of-flying-extra-space-seat, the-art-of-flying-suite;
  - fashion-guide is the 8th row: no page-type, so not a post.
  - All under highlights/.
- **articles-xx-fr**, 8 rows, 7 articles: the same seven names as xx/it, plus fashion-guide (no page-type).
- **articles-xx-es**, 5 rows, 4 articles: allegris-business-class-shanghai, allegris-business-san-diego,
  allegris-new-york, and allegris-premium-economy-san-diego-msm-moved (DA's name for www's ..._msm_moved). Plus
  fashion-guide.
  - xx/es's explore-flying and explore-the-world are list pages one level up: the include pattern doesn't match them.
- Every article has a card-image, publication-date, category (highlights) and tag-ids, so the cards get a picture, a
  byline and a title. A row holds a dozen short head values, far below the 100 KB record limit.

## Which blocks it would fill

### related-articles: 18 empty blocks

The picks below come from scripts/articles.js pickRelated, run on these rows (logs/b636/xx-picks.mjs). There are no
tag priorities: /articles/config/tag-priority.json has no xx rows.

```
== /xx/it/articles/query-index.json: 8 rows, 7 with page-type article
/xx/it/articles/highlights/allegris-business-class-shanghai	empty	the-art-of-flying-extra-long-bed, the-art-of-flying-extra-space-seat, the-art-of-flying-suite
/xx/it/articles/highlights/allegris-business-san-diego	empty	the-art-of-flying-extra-long-bed, the-art-of-flying-extra-space-seat, the-art-of-flying-suite
/xx/it/articles/highlights/allegris-new-york	authored	authored:allegris-premium-economy-san-diego, authored:allegris-business-san-diego, authored:allegris-typologies
/xx/it/articles/highlights/allegris-premium-economy-san-diego	empty	the-art-of-flying-extra-long-bed, the-art-of-flying-extra-space-seat, the-art-of-flying-suite
/xx/it/articles/highlights/the-art-of-flying-extra-long-bed	empty	the-art-of-flying-extra-space-seat, the-art-of-flying-suite, allegris-business-class-shanghai
/xx/it/articles/highlights/the-art-of-flying-extra-space-seat	empty	the-art-of-flying-extra-long-bed, the-art-of-flying-suite, allegris-business-class-shanghai
/xx/it/articles/highlights/the-art-of-flying-suite	empty	the-art-of-flying-extra-long-bed, the-art-of-flying-extra-space-seat, allegris-business-class-shanghai
== /xx/fr/articles/query-index.json: 8 rows, 7 with page-type article
/xx/fr/articles/highlights/allegris-business-class-shanghai	empty	allegris-premium-economy-san-diego, allegris-business-san-diego, the-art-of-flying-extra-long-bed
/xx/fr/articles/highlights/allegris-business-san-diego	empty	allegris-business-class-shanghai, allegris-premium-economy-san-diego, the-art-of-flying-extra-long-bed
/xx/fr/articles/highlights/allegris-new-york	empty	the-art-of-flying-extra-long-bed, the-art-of-flying-extra-space-seat, the-art-of-flying-suite
/xx/fr/articles/highlights/allegris-premium-economy-san-diego	empty	allegris-business-class-shanghai, allegris-business-san-diego, the-art-of-flying-extra-long-bed
/xx/fr/articles/highlights/the-art-of-flying-extra-long-bed	empty	the-art-of-flying-extra-space-seat, the-art-of-flying-suite, allegris-business-class-shanghai
/xx/fr/articles/highlights/the-art-of-flying-extra-space-seat	empty	the-art-of-flying-extra-long-bed, the-art-of-flying-suite, allegris-business-class-shanghai
/xx/fr/articles/highlights/the-art-of-flying-suite	empty	the-art-of-flying-extra-long-bed, the-art-of-flying-extra-space-seat, allegris-business-class-shanghai
== /xx/es/articles/query-index.json: 5 rows, 4 with page-type article
/xx/es/articles/highlights/allegris-business-class-shanghai	empty	allegris-business-san-diego, allegris-premium-economy-san-diego-msm-moved, allegris-new-york
/xx/es/articles/highlights/allegris-business-san-diego	empty	allegris-business-class-shanghai, allegris-premium-economy-san-diego-msm-moved, allegris-new-york
/xx/es/articles/highlights/allegris-new-york	empty	allegris-business-class-shanghai, allegris-business-san-diego, allegris-premium-economy-san-diego-msm-moved
/xx/es/articles/highlights/allegris-premium-economy-san-diego-msm-moved	empty	allegris-business-class-shanghai, allegris-business-san-diego, allegris-new-york
```

Against www's snapshots of the xx/fr and xx/es articles (11 articles; none of xx/it is saved): 17 of www's 30 cards
are the same article. www draws its third card at random. The block always draws 3 cards (www 2 or 3), so the
height matches www's section. The cards differ where www links an article of another market (gc/en's
allegris-typologies), or the newest of the category instead of a tagged one.

xx/it's allegris-new-york keeps its three authored cards; with authored rows the block picks none.

### blog-overview: 10 blocks

These lists would show the language's articles instead of "0 results":
- /xx/it/articles/highlights and /xx/it/articles/tags/allegris-inspires;
- /xx/fr/articles/highlights, /xx/fr/articles/tags/allegris, /xx/fr/articles/tags/allegris-inspires and
  /xx/fr/articles/tags/art;
- /xx/es/articles/highlights, /xx/es/articles/explore-flying, /xx/es/articles/explore-the-world and
  /xx/es/articles/tags/allegris-inspires.

Compared with the article lists in www's snapshots:
- xx/fr tags/allegris (www 3: shanghai, premium-economy-san-diego, business-san-diego): the same 3 by tag;
- xx/fr tags/allegris-inspires and tags/art (www 6): ours would show 7, the six plus xx/fr's allegris-new-york. Our
  copy is tagged articles:art and articles:allegris-inspires, and www's list does not show it. A one-cell row on
  that document's tag-ids would close the gap, if wanted, after the index;
- xx/es tags/allegris-inspires (www 4): the same 4.

The highlights pages' lists are drawn by script on www and are not in the snapshots, so they can't be compared.

### carousel-cards authors: unchanged

The two author sliders on xx/es's explore pages read the authors index (`/xx/es/articles/authors/query-index.json`).
No xx language has an authors folder, so they stay as they are.

## How it would be gated

An index fills only on publish or an index job, so it can't be measured before then.
1. After the change is merged, the helper runs the index job for the three paths, or republishes the 34 documents of the three article folders.
2. Then check each `/xx/<l>/articles/query-index.json` for 8 / 8 / 5 rows.
3. Render the 18 articles and 10 list pages, with and without, at 1440 and 390 on our host:
   - nothing breaks: no sideways scroll, failed picture, overlap or missing H1;
   - list each page's height change;
   - re-measure the recorded one, xx/it allegris-new-york (14.0 / 14.0 % today; it has authored cards, so no change
     expected).
4. The xx/fr and xx/es articles have no recording; their gate is the no-breakage render and the card count against
   www's snapshots above.

helix-query.yaml serves every site of this repository. Paths under /xx/<l>/articles exist only in lh-com's content,
so the other sites' indexes don't change.
