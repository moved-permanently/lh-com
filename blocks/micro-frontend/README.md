# micro-frontend

Custom **micro-frontend** block. Purpose: one of www.lufthansa.com's micro-frontends on the page (AMS rest A4 part 2), today the trip management (`/{cc}/{ll}/book-and-manage/trip-management`).

## Authoring (Document Authoring)

Model: `standalone`

First row, one cell: the app's name, `trip-management` (the default when the cell is empty), `help-center-web` or `culinary-hub`. An unknown name renders nothing (but its `Fallback`). Further rows `Name | value` become the app element's `data-` attributes (`Configuration | ...` → `data-configuration`). The page needs the metadata `post-handler: true` when other systems post booking data to it (`<page>.mfe.html`, below).

Optional row `Fallback | <content>`: normal content in the second cell (headings, text, lists, links, a nested block such as an accordion). Use it where the app can't render on our hosts today (ITA's and Austrian's help-center-web: its data come from the airline's Travel ID service, which refuses them), with the content www shows around the app.

| micro-frontend | |
| --- | --- |
| help-center-web | |
| Fallback | *H1, the help topics, links …* |

## Fallback

- The fallback is shown at once (the page does not wait for the app); the app is mounted next to it, laid out but hidden (`micro-frontend-pending`: `visibility: hidden`, `aria-hidden`, `inert`).
- When the app's element shows something within `FALLBACK_TIMING.wait` (8 s; looked at every 250 ms): a height and text in its shadow root (or one nested in it) or its light DOM, not styles alone (`hasRendered`), it replaces the fallback.
- Otherwise the fallback stays and the app's element is removed (also when its scripts load after the wait).
- Nested blocks in the fallback (direct children with a class, e.g. `accordion`) are decorated and loaded as blocks, each in its own wrapper.
- No `Fallback` row: as before, the block waits for the app and shows its element.

## Behaviour

- Loads from www (cross-origin): the design system stylesheet `/digitalhangar/design-system/releases/<version>/standalone/css/lufthansa.css`, its module `/digitalhangar/design-system/releases/<version>/standalone/packages/maui-design-system.js` and the app's classic script (`/digitalhangar/trip-management/trip-management/trip-management-latest.js`), then renders `<trip-management class="full-width-bg px-0 pb-5">`, as www.
- The design system version is `DESIGN_SYSTEM_VERSION` at the top of `micro-frontend.js` (`v1.38.0`); the apps and their scripts are in `APPS` there.
- `data-config`: when the block's div has a `data-config` attribute with a JSON object, the element gets the same JSON as its own `data-config` before it is attached (the trip management reads `orderId`, `firstName`, `lastName`, `language` and `country` from it on connect; without it, it takes the market and language from the page path).

## `<page>.mfe.html` (lh-edge)

Other systems hand booking data to the page with `POST <page>.mfe.html` (form fields). lh-edge answers pages with `post-handler: true` with the page and the filtered fields in this block's `data-config` (`tools/workers/lh-edge/src/mfe.js`); other pages answer 403. `GET <page>.mfe.html` answers like the page.

## Supported variations

No variations.
