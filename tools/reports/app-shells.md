# Login and profile pages ("app shells")

How the login and profile pages of the four locales are built, per page and component. These pages have to keep working unchanged when the site is served from a lufthansa.com host or subdomain; on any other host they show the logged-out state without contacting Travel ID. Code: `widgets/lh-app` (see its README), `blocks/profile-nav`, `blocks/profile-tabs`.

Legend: **gate** = "Please log in to view this page" / "Bitte loggen Sie sich ein." with a small yellow "Log in now" / "Jetzt einloggen" button to the Travel ID authorize URL (`state` = page path, `country`/`lang` from the locale). **LH host** = lufthansa.com or a subdomain.

## Pages

| page | de/en, gb/en | de/de, at/de |
| --- | --- | --- |
| login | `/{cc}/en/login` | `/{cc}/de/anmeldung` |
| travel cockpit | `/{cc}/{ll}/profile/travel-cockpit` | same |
| bookings | `/{cc}/{ll}/profile/bookinglist` | same |
| profile | `/{cc}/{ll}/profile/my-account` | same |
| Miles & More account | `/{cc}/{ll}/profile/account-statement` | same |
| account activation | `/{cc}/en/validate-mail-token` | `/{cc}/de/travel-id-aktivieren` |

`profile/login` and `profile/account-activation` redirect to the login and activation pages (redirects sheet).

### Login, account activation

Plain content, no widget. The Travel ID card links to the authorize URL with `state` = the login page path; the booking-code card links to manage-my-bookings (live opens a modal whose form only works with live's dcep backend). The activation page shows the heading; live's `dcep-validate-mail-token` only shows a loader without a token.

### All four profile pages

`profile-nav` block alone in the first section (Overview / Bookings / Profile / Miles & More; Übersicht / Buchungen / Profil / Miles & More), active tab from the current path.

### Travel cockpit

| live component | widget link | any host, logged out | LH host |
| --- | --- | --- | --- |
| `dcep-forced-login` | `app=login-gate` | gate | gate, or nothing when logged in |
| `hero-banner-react` 1.26.4 | `app=hero-banner&id=1` | mounted: "Travel Cockpit" + subline (makes no Travel ID call) | mounted; personalized when logged in |
| `dcep-forced-login` | `app=login-gate` | gate | as above |
| `my-trips` 0.17.8 | `app=my-trips&id=2&class=upcoming-trips show-one` | not loaded | mounted when logged in |
| `airport-services` 1.0.22 (en) / 1.1.1 (de) | `app=airport-services` | not loaded (renders nothing on live; module script that www does not serve cross-origin) | mounted |
| `dcep-fare-alert-profile-overview` compact | `app=fare-alert-overview&variant=compact` | nothing (as live) | nothing; logged-in view needs a rebuild |
| `web-self-service` 2.0.0 | `app=web-self-service` | mounted: "Self services" link groups | mounted |

Then the authored teaser row ("Discover further topics", de: "Das könnte Sie auch interessieren").

### Bookings

| live component | widget link | any host, logged out | LH host |
| --- | --- | --- | --- |
| `upgrade-alert` 3.0.18 (public endpoint) | `app=upgrade-alert&id=upgrade-alert` | not loaded (renders nothing on live; module script) | mounted |
| `sfad-frontend` latest | `app=sfad-frontend` | mounted, renders nothing (no Travel ID call while logged out) | mounted |
| tab control Upcoming / Past (Bevorstehend / Vergangen), `#upcoming` / `#past` | `profile-tabs` block | tabs with deep links | same |
| per tab: `dcep-forced-login` + `my-trips` 0.17.8 / `past-trips` 1.4.7 | `app=login-gate`, `app=my-trips&id=1` / `app=past-trips&id=2` | gate | gate or the app |

### Profile

| live component | widget link | any host, logged out | LH host |
| --- | --- | --- | --- |
| `dcep-forced-login` | `app=login-gate` | gate | gate or nothing |
| `sdui-react` 0.78.3, `/ui-services/v1/me/profile` | `app=sdui-profile` | not loaded | mounted when logged in |

### Miles & More account

| live component | widget link | any host, logged out | LH host |
| --- | --- | --- | --- |
| `dcep-account-statement` | `app=account-statement` | gate (live shows its own gate here) | gate when logged out; logged-in view needs a rebuild (dcep bundle) |
| `dcep-forced-login` | `app=login-gate` | gate | gate or nothing |
| `sdui-react` 0.99.1, statement table, `X-Language-Country` en-de / en-gb / de-de / de-at, id `test6` in English | `app=sdui-statement` | not loaded | mounted when logged in |

Then the authored Help Alliance section, accordion and teasers.

## What only works on a lufthansa.com host

- The login check and every logged-in view. Travel ID authenticates by its own cookie and answers cross-origin only to origins it allowlists (today `https://www.lufthansa.com`); the LH host has to be added there.
- The OAuth return: the authorize URL's `redirect_uri` is `https://www.lufthansa.com`, so after login the visitor lands on www, not on the EDS host, until Lufthansa registers another redirect URI for the client.
- The profile passed to the apps as `state` comes from `www.lufthansa.com/service/secured/api/core/user/profile` (cookie `dcep.user`), requested relative to the page; on a host other than www that route has to be routed to Lufthansa's AEM.
- Module scripts (airport-services, upgrade-alert, sdui-statement) need CORS from `config.scriptOrigin`; www sends none. On a subdomain either set `scriptOrigin` to `""` and route `/digitalhangar/` to Lufthansa, or have www send CORS headers.
- Not built: logged-in views of `account-statement` and `fare-alert-overview`; the event bus and silent single sign-on of live's dcep app.

Tested: logged out on localhost (no request to `api.travelid.lufthansa.com`, gates, tabs, deep links, 1440/768/390); the LH-host branch only with a mocked Travel ID.
