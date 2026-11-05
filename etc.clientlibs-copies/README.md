# etc.clientlibs-copies

Copies of www files below `/etc.clientlibs/` that www refuses to serve to other sites. The folder mirrors
www's path: `https://www.swiss.com/etc.clientlibs/<path>` is `etc.clientlibs-copies/<path>` here, the same
convention as `digitalhangar-copies/` for `/digitalhangar/`. lh-edge can answer the www path from this copy.

## SWISS magazine serif: Pensum Pro

Read 2026-11-05 from www.swiss.com with curl (browser User-Agent, Referer https://www.swiss.com/).

| file | source | bytes | sha256 |
|---|---|---|---|
| `swissstoryhub/clientlibs/clientlib-site/resources/fonts/Pensum-Pro-Regular.woff2` | https://www.swiss.com/etc.clientlibs/swissstoryhub/clientlibs/clientlib-site/resources/fonts/Pensum-Pro-Regular.woff2 | 60408 | f67132d955319f6af8e98e28ce0de7799c2059d70b7ea6c127d9d4e4de2cf337 |
| `swissstoryhub/clientlibs/clientlib-site/resources/fonts/Pensum-Pro-Regular.woff` | https://www.swiss.com/etc.clientlibs/swissstoryhub/clientlibs/clientlib-site/resources/fonts/Pensum-Pro-Regular.woff | 89376 | aca1f8400e86dbe1f1a57b80b0e0d2090eb127a65a7284ad7ab8051fe7e2c881 |

These are the only Pensum Pro files the magazine uses. Its stylesheet
`/etc.clientlibs/swissstoryhub/clientlibs/clientlib-site.75aa8d3c1e405044e292889dd29789ae.css` declares one face,
with no weight, style or unicode-range:

```
@font-face{font-family:PensumPro;src:url(clientlib-site/resources/fonts/Pensum-Pro-Regular.woff) format("woff"),url(clientlib-site/resources/fonts/Pensum-Pro-Regular.woff2) format("woff2")}
```
