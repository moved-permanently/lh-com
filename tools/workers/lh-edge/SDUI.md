# App screens (server-driven UI)

The Lufthansa app reads its "Lufthansa Insights" screens and the home screen as JSON: v1 `/content/mobile/lh/<lang>/....sdui` (the hub `articles` and everything linked from it) and v2 `....v2.sdui` (the home screen `homepage` and the screens linked from it; a Lufthansa service reads them from the site and rewrites the links of the form `https://<host>/content/mobile/lh/<lang>/....v2.sdui` to itself). lh-edge renders both versions from **one Document Authoring document per screen** at the same path (`/content/mobile/lh/<lang>/articles/...`, `/content/mobile/lh/<lang>/homepage`) and the query index `/content/mobile/lh/query-index.json` (`helix-query.yaml`, index `app-screens`). No SDUI for web pages.

## The document

**Sections** are the screen's columns (v2 `column`, padding `SPACING_FOUR` left and right). Section Metadata `Spacing`: `medium` or `large` (default `large`) — the space the app puts between the items. A section that holds only one image (the hero image of an article or the hub) or only the home screen's service slot sits directly in the screen body, outside the columns. v1 has no columns: it lists all items in order, framed by a `LARGE` spacer at the start and the end (`M_LARGE` on a container screen).

**Default content**

| In the document | v1 | v2 |
| --- | --- | --- |
| Heading 1 (the screen headline, plain text) | `copyText` HEADLINE EXTRA_LARGE (container screen: HEADLINE, no size) | `mainHeadline` HEADING_XL bold (container screen: HEADING_XXL) |
| Heading 2 (a section headline) | `copyText` HEADLINE EXTRA_LARGE | `mainHeadline` HEADING_L bold |
| Heading 3 | `copyText` HEADLINE MEDIUM | `copyText` HEADLINE MEDIUM |
| Paragraph (bold, italic, line breaks) | `copyText` BODY MEDIUM, its HTML | the same |
| Paragraph ending in `{small}` | `copyText` BODY SMALL | the same |
| Bulleted list | one `copyText` BODY MEDIUM with `<ul><li>…</li></ul>` | the same |
| Image **linked to its DAM URL** (`https://www.lufthansa.com/content/dam/…`), alt text = description | `image` url (the link, on the public host), `contentDescription` (the alt text) | the same |
| `{spacer: x-small}`, `{spacer: medium}`, `{spacer: m-large}`, `{spacer: large}` | `spacer` | `spacer` |
| `{spacer: medium, v2}` | – | `spacer` (a space only the v2 screen has, e.g. after an article's intro) |

The image's link matters, not the image: Edge Delivery copies images into its media bus, but the app gets www's DAM renditions (`…jpg.transform/lh-dcep-transform-width-1440/img.jpg`, served from the public host). An image without a link is sent with its media URL.

**Blocks**

| Block | Rows | v1 / v2 |
| --- | --- | --- |
| `app-links` | one row per link: the link (text + target), the tracking label, optionally the title the app shows while it loads (default: the target screen's title from the index, else the link text) | `textLink_v2` / `navigationLink` HYPERLINK. A target under `/content/mobile/` opens that screen (`getAndShowViewDefinition`, absolute URL on the public host with the suffix of the current screen); any other URL is a web link (v1 `showWebScreen` providerId `externalBrowser`, v2 `openUrl` target `SELF`, as www today; `SDUI_WEB_LINKS = "solo"` sends `AIR_EM` and the `<page>.solo.continue` URL instead) |
| `app-offer` | Title, Description, Link text, Image (DAM URL), Link, Tracking, optional Initial title | `offerBox_v2` (with the "redirect opportunity" display tracking) / `offerBox` |
| `app-article-list` | Category (the category screen), Link text ("Read article"), Tracking ("article") | one offer box per article of the category from the index (headline, description, teaser image), newest `Date` first, then `Order`; v2 tracking has `ga_hs_order` (position) |
| `app-service` | Service, Auxiliary data, Tenant, Market, Language | v2 only: `sduiServiceIntegration`, passed through unchanged |
| `app-teaser-slider` | Title; one row per card: headline + text, image (DAM URL), link (text = the title the app shows while it loads), tracking label | v1 only: `teaserSlider` PRIMARY with `cardItem_v2` cards (the home screen's "Discover further topics") |

Tracking keys and categories follow from the item (`link button click`, `offer box click`, `blog overview click`, `sm teaser click`); the document holds only the labels.

**Metadata**: `Title` (the screen title; v1 `title`, v2 `metadata.title`), `Robots` (`noindex, nofollow`), `SDUI type` (`container` for the home screen: v1 `CONTAINER`, v2 body padding top/bottom `NONE`). Articles: `Description` and `Teaser image` (their offer box in the category list), `Category` (the category screen), `Date` (ISO, from the date line), `Order` (the position among articles of the same date; www's order).

## Example: `/content/mobile/lh/en/articles/europe`

```
<div>
  <p>{spacer: medium}</p>
  app-links:          | All categories → /content/mobile/lh/en/articles | blog_link_blog_overview_150926 |
  app-article-list:   | Category  | /content/mobile/lh/en/articles/europe |
                      | Link text | Read article |
                      | Tracking  | article |
  <p>{spacer: medium}</p>
  app-links:          | All categories → /content/mobile/lh/en/articles | blog_link_blog_overview_150926 |
</div>
metadata:             | Title | Europe |  | Robots | noindex, nofollow |
```

An article (`…/a-perfect-day-in-frankfurt`): section 1 the hero image; section 2 (Spacing medium) the h1, the date line `{small}`, the intro, `{spacer: medium, v2}`, the text with images, links (app-links: "More about Europe", "All categories", the web link "Flight search to Frankfurt") and spacers; section 3 the app-offer "Ready to discover the world?" and the closing links; metadata with Description, Teaser image, Category `/content/mobile/lh/en/articles/europe`, Date `2025-10-09`, Order `1`.

## Import

`tools/importer/sdui-import.mjs` wrote the 66 documents once from www's recorded answers (`tools/source-export/feeds/sdui/`): the structure from v2, the v1-only teaser slider, the spacers only v2 has (by aligning both versions), the article metadata from the category lists. `tools/workers/lh-edge/compare-sdui.mjs` compares (`--local`: the documents, `--origin <aem.page>`: the previewed documents, `--host`: lh-edge).
