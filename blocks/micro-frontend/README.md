# micro-frontend

Custom **micro-frontend** block. Purpose: one of www.lufthansa.com's micro-frontends on the page (AMS rest A4 part 2), today the trip management (`/{cc}/{ll}/book-and-manage/trip-management`).

## Authoring (Document Authoring)

Model: `standalone`

First row, one cell: the app's name, `trip-management` (the default when the cell is empty), `help-center-web`, `culinary-hub` or `claim-form-entry` (lufthansa.com's compensation claim, `/<cc>/<ll>/support/fast-compensation/compensation-flight-disruptions`). An unknown name renders nothing (but its `Fallback`). Further rows `Name | value` become the app element's `data-` attributes (`Configuration | ...` → `data-configuration`); a value DA shows with an icon (`dmc:https://…` becomes `dmc` + `<span class="icon icon-https">` + `//…`) is read as its text again. `culinary-hub` (Austrian's and Discover's culinaryjourney: rows `Configuration` and `API gateway`, written by the importer from www's element) loads from the brand's www with its design system (Discover: v1.38.0, discover.css). The page needs the metadata `post-handler: true` when other systems post booking data to it (`<page>.mfe.html`, below).

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
- A lufthansa.com page's module app (`help-center-web`, `claim-form-entry`) loads from the page's own `/digitalhangar/` where the host serves it (the turnsthe.page hosts through lh-edge, the airline's own host): www.lufthansa.com sends these scripts without `Access-Control-Allow-Origin`, so a module from there is refused on our hosts (on aem.page the app never loads and its Fallback stays). The brands' apps load from their www, the classic scripts from www.lufthansa.com, as before.
- `claim-form-entry` (2026-11-01): `/digitalhangar/claim-automation/production/claim-form-entry/claim-form-entry-0.11.16.js` (a module, its chunks next to it) on www's design system `mausy-v1.40.1` (the app's `release`). Its APIs, `api.travelid.lufthansa.com/v1/user/me/loginstatus` and `api.miles-and-more.com/claim/v1/bookingdetails`, allow `https://www.lufthansa.com` only (a preflight from aem.page or lufthansa.turnsthe.page: 401 without the header): on our hosts the app loads but cannot look a booking up; on the airline's own host it works.
- The design system version is `DESIGN_SYSTEM_VERSION` at the top of `micro-frontend.js` (`v1.38.0`); the apps and their scripts are in `APPS` there.
- `data-config`: when the block's div has a `data-config` attribute with a JSON object, the element gets the same JSON as its own `data-config` before it is attached (the trip management reads `orderId`, `firstName`, `lastName`, `language` and `country` from it on connect; without it, it takes the market and language from the page path).

## `<page>.mfe.html` (lh-edge)

Other systems hand booking data to the page with `POST <page>.mfe.html` (form fields). lh-edge answers pages with `post-handler: true` with the page and the filtered fields in this block's `data-config` (`tools/workers/lh-edge/src/mfe.js`); other pages answer 403. `GET <page>.mfe.html` answers like the page.

## Supported variations

No variations.
