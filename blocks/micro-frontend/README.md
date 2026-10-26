# micro-frontend

Custom **micro-frontend** block. Purpose: one of www.lufthansa.com's micro-frontends on the page (AMS rest A4 part 2), today the trip management (`/{cc}/{ll}/book-and-manage/trip-management`).

## Authoring (Document Authoring)

Model: `standalone`

One cell: the app's name, `trip-management` (the default when the cell is empty). An unknown name renders nothing. The page needs the metadata `post-handler: true` when other systems post booking data to it (`<page>.mfe.html`, below).

## Behaviour

- Loads from www (cross-origin): the design system stylesheet `/digitalhangar/design-system/releases/<version>/standalone/css/lufthansa.css`, its module `/digitalhangar/design-system/releases/<version>/standalone/packages/maui-design-system.js` and the app's classic script (`/digitalhangar/trip-management/trip-management/trip-management-latest.js`), then renders `<trip-management class="full-width-bg px-0 pb-5">`, as www.
- The design system version is `DESIGN_SYSTEM_VERSION` at the top of `micro-frontend.js` (`v1.38.0`); the apps and their scripts are in `APPS` there.
- `data-config`: when the block's div has a `data-config` attribute with a JSON object, the element gets the same JSON as its own `data-config` before it is attached (the trip management reads `orderId`, `firstName`, `lastName`, `language` and `country` from it on connect; without it, it takes the market and language from the page path).

## `<page>.mfe.html` (lh-edge)

Other systems hand booking data to the page with `POST <page>.mfe.html` (form fields). lh-edge answers pages with `post-handler: true` with the page and the filtered fields in this block's `data-config` (`tools/workers/lh-edge/src/mfe.js`); other pages answer 403. `GET <page>.mfe.html` answers like the page.

## Supported variations

No variations.
