# lh-app

Widget for the login and profile apps of lufthansa.com (travel cockpit, bookings, profile, Miles & More account) and of the brand sites on www's platform (Austrian, Discover, ITA). The apps are the airlines' own web components; the widget loads them from `config.scriptOrigin` (www.lufthansa.com, or the brand's www), mounts them as the live page does, and renders the login gate where live shows it. No bundle of theirs is copied into this repo.

## Referencing an app

One paragraph per app containing only a link whose text is its href (site-relative):

```
/widgets/lh-app/lh-app.html?app=<name>[&<param>=<value>...]
```

`buildWidgetAutoBlocks` (scripts/scripts.js) turns it into a widget; query parameters become `data-*` attributes (URL-decoded).

| parameter | meaning |
| --- | --- |
| `app` (required) | a key of `apps` in `lh-app.json` |
| `id` | element id / `id` property, where live sets one (`hero-banner` 1, `my-trips` 2 or 1, `past-trips` 2, `upgrade-alert` upgrade-alert); overrides the app's default |
| `class` | class attribute of the element (`upcoming-trips show-one` for my-trips on the travel cockpit) |
| `variant` | accepted for `fare-alert-overview` (live `compact`); that app renders nothing in any case |
| `version` | a version number (`3.0.19`) that replaces the one in the app's script name, where one page of a site loads another version than the rest (ITA's `/bookinglist`: upgrade-alert 3.0.19) |

Values live derives from the market (`X-Language-Country` of the account statement, the airport-services version) come from `locales` in `lh-app.json`, by page locale; authors do not write them.

## Apps

| app | element | logged out, any host | lufthansa.com host |
| --- | --- | --- | --- |
| `login-gate` | gate | gate text + "Log in now" | gate until loginstatus answers 200, then nothing |
| `account-statement` | gate | gate | as login-gate; logged-in view not built (see below) |
| `fare-alert-overview` | none | nothing | nothing; logged-in view not built |
| `hero-banner` | `hero-banner-react` | mounted (h1 + subline) | mounted |
| `web-self-service` | `web-self-service` | mounted ("Self services") | mounted |
| `sfad-frontend` | `sfad-frontend` | mounted (renders nothing) | mounted |
| `airport-services` | `airport-services` | not loaded | mounted |
| `upgrade-alert` | `upgrade-alert` | not loaded | mounted |
| `my-trips`, `past-trips`, `sdui-profile`, `sdui-statement` | `my-trips`, `past-trips`, `sdui-react` | not loaded | mounted when logged in |
| `web-student-verification-cug`, `personal-documents` | the same names | not loaded | mounted when logged in (`my-account/cug-verification`, `my-account/travel-documents`) |
| `star-alliance` | `star-alliance` | not loaded | mounted when logged in (`profile/travel-insights/star-alliance-upgrade`) |
| `personal-information`, `communication-settings`, `flight-preferences`, `frequent-flyer-program`, `mfa-security`, `payment-methods`, `travel-partners` | gate | gate | as login-gate; logged-in view not built (the `my-account` sub-pages) |
| `best-price-alert` | prompt | headline, text and "Login & Registration" (the app's own labels) | as logged out; logged-in view not built |

`account-statement`, `fare-alert-overview`, `best-price-alert` and the `my-account` sub-page apps are part of live's dcep app bundle, which cannot be loaded on its own. Logged out they behave like live (gate / nothing / prompt); their logged-in views need a rebuild.

## Hosts and the login check

- `config.loginHosts` (`lufthansa.com`): on that host or a subdomain the widget asks Travel ID once per page view (`GET {travelIdApi}{loginStatusPath}`, cookies included; shared by all widgets of the page). 200 = logged in: gates render nothing, login apps mount and get the www profile (`config.profileApi`) as `state`. Anything else = logged out.
- A brand site: its own www domain instead (`austrian.com`, `discover-airlines.com`, `ita-airways.com`) and its own Travel ID; never lufthansa.com's.
- Any other host (aem.page, aem.live, turnsthe.page, localhost): logged out without a request. Only apps whose `loggedOut` is `public` are loaded; they were checked to make no Travel ID request while logged out. `lufthansa-host` apps load only on the site's login hosts (airport-services and upgrade-alert are module scripts, which www.lufthansa.com does not serve cross-origin).

The logged-in path has only been tested with a mocked Travel ID (a lufthansa.com hostname mapped to the dev server), not against the real one.

## lh-app.json

- `config`: `loginHosts`, `scriptOrigin` (prefix of every script path; `""` loads from the page's own host, e.g. when a lufthansa.com host routes `/digitalhangar/`), `travelIdApi`, `loginStatusPath`, `profileApi`, `authorize` (URL, client, redirect URI, scope and fixed parameters of the login link; `state`, `country` and `lang` are added per page), `maui` (design system for apps that need it), `portal` (page meta tags the components read), `labels` (gate texts used when the common labels cannot be loaded).
- `apps.<name>`: `tag`, `script` (path with version), `module` (load as ES module), `wrapper` (mounted like live's `dcep-react-wrapper`: allow-listed attributes, `data-public-endpoint` only when `loginRequired` is false, properties once the element is defined), `loginRequired`, `loggedOut` (`public` / `lufthansa-host`; default: only when logged in), `schema`, `id`, `attributes` (`{travelIdApi}`, `{scriptOrigin}` and `{languageCountry}`, e.g. `en-at`, are replaced), `locales` (per-locale overrides of any of these, `attributes` merged), `view` (`gate` / `none` for apps without a web component; `prompt` with `prompt.bundle` and the label keys of its headline, text and button).
- `brands.<brand>`: the brand sites (page metadata `brand`, `scripts/brand.js`). Their entry replaces `config`'s values it names (`authorize`, `maui`, `portal` and `labels` per language merged), adds `themeClass` (the body class, live's `maui-theme-os`, `-four_y`, `-az`), and its `apps` are merged over `apps`. Lufthansa's `locales` overrides do not apply on a brand site (their keys are lufthansa.com's roots). A brand without an entry (Cargo, Air Dolomiti, ...) gets Lufthansa's config.

Another Travel ID environment or host needs only `config` changes.

## Bumping a component version

1. Find the version live uses: the `<script src="/digitalhangar/...">` next to the component in the live page HTML (versions differ per locale, e.g. airport-services 1.0.22 in English, 1.1.1 in German).
2. Change `script` in `lh-app.json` (or the locale override).
3. Check the page on a non-lufthansa.com host with the browser's network panel: an app marked `public` must make no request to `api.travelid.lufthansa.com` while logged out; otherwise set its `loggedOut` to `lufthansa-host`.
