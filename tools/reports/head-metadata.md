# Page head metadata: live vs preview

Generated 2026-10-24T04:34:51.269Z from the live snapshots (tools/importer/bd-snapshots) and the
preview heads of 1279 scope pages (pages.csv, 4 locales, and the AirCore pages).
Filled by `tools/importer/head-metadata.mjs` (post-import step), uploaded to DA and previewed.

## Summary

| field | pages that were missing it |
| --- | --- |
| Description | 200 |
| og:description | 20 |
| og:title | 4 |
| Keywords | 4 |
| Robots | 4 |
| Canonical | 1 |
| Image | 56 |
| **pages changed** | **261** |
| preview head matches live after the change | 259 of 261 |

Notes:
- Description: where live has no description, an empty row (rendered `content=""`), else EDS
  makes one from the first paragraph (it did, e.g. a video URL on 100-years/cabin-design).
- og:title / og:description rows only where live differs from its title / description.
- Image: the live og:image (sets og:image and twitter:image); the preview serves it from the
  media bus, so the URL differs, the image is the same.
- No hreflang rows. Title, og:title and canonical matched live on every other page.

## Robots values not copied (115: differ from "index,follow,NOODP" without "noindex")

| robots on live | pages |
| --- | --- |
| `no index, no follow` | 8: /de/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage, /de/de/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage, /at/de/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage, /gb/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage, /de/de/exclusive-charter, /at/de/exclusive-charter, /de/de/sepa-bedingungen, /at/de/sepa-bedingungen |
| `index, follow` | 107: /lhg/de/en, /lhg/de/de, /lhg/at/de, /lhg/gb/en, /lhg/de/en/dest/co/europe, /lhg/de/de/dest/co/europa, /lhg/at/de/dest/co/europa, /lhg/gb/en/dest/co/europe, /lhg/de/en/dest/co/north-and-south-america, /lhg/de/de/dest/co/nord-und-suedamerika, /lhg/at/de/dest/co/nord-und-suedamerika, /lhg/gb/en/dest/co/north-and-south-america, /lhg/de/en/dest/c/usa, /lhg/de/de/dest/c/usa, /lhg/at/de/dest/c/usa, /lhg/gb/en/dest/c/usa, /lhg/de/en/dest/c/spain, /lhg/de/de/dest/c/spanien, /lhg/at/de/dest/c/spanien, /lhg/gb/en/dest/c/spain, /lhg/de/en/dest/c/italy, /lhg/de/de/dest/c/italien, /lhg/at/de/dest/c/italien, /lhg/gb/en/dest/c/italy, /lhg/de/en/dest/c/japan, /lhg/de/de/dest/c/japan, /lhg/at/de/dest/c/japan, /lhg/gb/en/dest/c/japan, /lhg/de/en/dest/c/india, /lhg/de/de/dest/c/indien, /lhg/at/de/dest/c/indien, /lhg/gb/en/dest/c/india, /lhg/de/en/dest/c/united-kingdom, /lhg/de/de/dest/c/grossbritannien, /lhg/at/de/dest/c/grossbritannien, /lhg/de/en/dest/cy/new-york, /lhg/de/de/dest/cy/new-york, /lhg/at/de/dest/cy/new-york, /lhg/gb/en/dest/cy/new-york, /lhg/de/en/dest/cy/los-angeles, /lhg/de/de/dest/cy/los-angeles, /lhg/at/de/dest/cy/los-angeles, /lhg/gb/en/dest/cy/los-angeles, /lhg/de/en/dest/cy/barcelona, /lhg/de/de/dest/cy/barcelona, /lhg/at/de/dest/cy/barcelona, /lhg/gb/en/dest/cy/barcelona, /lhg/de/en/dest/cy/rome, /lhg/de/de/dest/cy/rom, /lhg/at/de/dest/cy/rom, /lhg/gb/en/dest/cy/rome, /lhg/de/en/dest/cy/tokyo, /lhg/de/de/dest/cy/tokio, /lhg/at/de/dest/cy/tokio, /lhg/gb/en/dest/cy/tokyo, /lhg/de/en/dest/cy/london, /lhg/de/de/dest/cy/london, /lhg/at/de/dest/cy/london, /lhg/de/en/dest/cy/paris, /lhg/de/de/dest/cy/paris, /lhg/at/de/dest/cy/paris, /lhg/gb/en/dest/cy/paris, /lhg/de/en/dest/cy/amman, /lhg/de/de/dest/cy/amman, /lhg/at/de/dest/cy/amman, /lhg/gb/en/dest/cy/amman, /lhg/de/en/dest/cy/palma-de-mallorca, /lhg/de/de/dest/cy/palma-de-mallorca, /lhg/at/de/dest/cy/palma-de-mallorca, /lhg/gb/en/dest/cy/palma-de-mallorca, /lhg/de/en/dest/cy/lisbon, /lhg/de/de/dest/cy/lissabon, /lhg/at/de/dest/cy/lissabon, /lhg/gb/en/dest/cy/lisbon, /lhg/de/en/from/cy/frankfurt, /lhg/de/de/from/cy/frankfurt, /lhg/de/en/from/cy/munich, /lhg/de/de/from/cy/muenchen, /lhg/de/en/from/cy/berlin, /lhg/de/de/from/cy/berlin, /lhg/de/en/o-d/c-c/germany-usa, /lhg/de/de/o-d/c-c/deutschland-usa, /lhg/de/en/o-d/c-c/germany-spain, /lhg/de/de/o-d/c-c/deutschland-spanien, /lhg/de/en/o-d/cy-cy/frankfurt-new-york, /lhg/de/de/o-d/cy-cy/frankfurt-new-york, /lhg/de/en/o-d/cy-cy/munich-los-angeles, /lhg/de/de/o-d/cy-cy/muenchen-los-angeles, /lhg/de/en/o-d/cy-cy/frankfurt-tokyo, /lhg/de/de/o-d/cy-cy/frankfurt-tokio, /lhg/de/en/o-d/cy-cy/munich-barcelona, /lhg/de/de/o-d/cy-cy/muenchen-barcelona, /lhg/de/en/o-d/cy-cy/frankfurt-london, /lhg/de/de/o-d/cy-cy/frankfurt-london, /lhg/gb/en/o-d/cy-cy/frankfurt-london, /lhg/de/en/o-d/cy-cy/berlin-rome, /lhg/de/de/o-d/cy-cy/berlin-rom, /lhg/de/en/o-d/cy-cy/frankfurt-amman, /lhg/de/de/o-d/cy-cy/frankfurt-amman, /lhg/de/en/o-d/cy-cy/munich-new-york, /lhg/de/de/o-d/cy-cy/muenchen-new-york, /lhg/de/en/o-d/cy-cy/hamburg-palma-de-mallorca, /lhg/de/de/o-d/cy-cy/hamburg-palma-de-mallorca, /lhg/de/en/dest/cy/new-york/business-class, /lhg/de/de/dest/cy/new-york/business-class, /lhg/de/en/dest/cy/tokyo/business-class, /lhg/de/de/dest/cy/tokio/business-class |

"no index, no follow" is not a valid robots directive (crawlers ignore it), so these pages are
indexable on live; they keep the site default here as well.

## Pages

| page | missing | live value | preview after |
| --- | --- | --- | --- |
| /de/en/book-and-manage/booking-services/manage-my-bookings | Description | Description:  | ok |
| /de/de/book-and-manage/booking-services/manage-my-bookings | Description | Description:  | ok |
| /at/de/book-and-manage/booking-services/manage-my-bookings | Description | Description:  | ok |
| /gb/en/book-and-manage/booking-services/manage-my-bookings | Description | Description:  | ok |
| /de/de/100-years | og:title | og:title: 100 Jahre Lufthansa | ok |
| /at/de/100-years | og:title | og:title: 100 Jahre Lufthansa | ok |
| /de/en/100-years/cabin-design | Description | Description:  | ok |
| /gb/en/100-years/cabin-design | Description | Description:  | ok |
| /de/en/book-and-manage/stopover/bayerischer-hof | Description, og:description | Description: <br>og:description: Discover Hotel Bayerischer Hof, Munich's legendary 5-star hotel. Enjoy… | ok |
| /de/de/book-and-manage/stopover/bayerischer-hof | Description, og:description | Description: <br>og:description: Entdecken Sie das Hotel Bayerischer Hof, Münchens legendäres 5-Sterne-… | ok |
| /at/de/book-and-manage/stopover/bayerischer-hof | Description, og:description | Description: <br>og:description: Entdecken Sie das Hotel Bayerischer Hof, Münchens legendäres 5-Sterne-… | ok |
| /gb/en/book-and-manage/stopover/bayerischer-hof | Description, og:description | Description: <br>og:description: Discover Hotel Bayerischer Hof, Munich's legendary 5-star hotel. Enjoy… | ok |
| /de/en/culinaryjourney | Description | Description:  | ok |
| /gb/en/culinaryjourney | Description | Description:  | ok |
| /de/en/discover-lufthansa/take-off | Description | Description:  | ok |
| /de/de/discover-lufthansa/take-off | Description | Description:  | ok |
| /at/de/discover-lufthansa/take-off | Description | Description:  | ok |
| /gb/en/discover-lufthansa/take-off | Description | Description:  | ok |
| /de/en/lufthansa-city/culinaryjourney | Description | Description:  | ok |
| /de/de/lufthansa-city/culinaryjourney | Description | Description:  | ok |
| /at/de/lufthansa-city/culinaryjourney | Description | Description:  | ok |
| /gb/en/lufthansa-city/culinaryjourney | Description | Description:  | ok |
| /de/en/744 | Description | Description:  | ok |
| /de/de/744 | Description | Description:  | ok |
| /at/de/744 | Description | Description:  | ok |
| /gb/en/744 | Description | Description:  | ok |
| /de/en/book-and-manage/cancellation-and-refund/refund/refund-form | Description | Description:  | ok |
| /gb/en/book-and-manage/cancellation-and-refund/refund/refund-form | Description | Description:  | ok |
| /de/en/farealert/best-price-alert | Description | Description:  | ok |
| /de/de/farealert/best-price-alert | Description | Description:  | ok |
| /at/de/farealert/best-price-alert | Description | Description:  | ok |
| /gb/en/farealert/best-price-alert | Description | Description:  | ok |
| /de/en/feedback | Description, og:description, Robots | Description: <br>og:description: Use our feedback and contact forms to submit requests for compensation…<br>Robots: noindex,nofollow | ok |
| /de/de/feedback | Robots | Robots: noindex,nofollow | ok |
| /at/de/feedback | Robots | Robots: noindex,nofollow | ok |
| /gb/en/feedback | Description, og:description, Robots | Description: <br>og:description: Use our feedback and contact forms to submit requests for compensation…<br>Robots: noindex,nofollow | ok |
| /de/en/feedback-past-flight | Description | Description:  | ok |
| /de/de/feedback-past-flight | Description | Description:  | ok |
| /at/de/feedback-past-flight | Description | Description:  | ok |
| /gb/en/feedback-past-flight | Description | Description:  | ok |
| /de/en/feedback/feedbackai | Description | Description:  | ok |
| /de/de/feedback/feedbackai | Description | Description:  | ok |
| /at/de/feedback/feedbackai | Description | Description:  | ok |
| /gb/en/feedback/feedbackai | Description | Description:  | ok |
| /de/de/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage | Description | Description:  | ok |
| /at/de/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage | Description | Description:  | ok |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-ammunition | Description | Description:  | ok |
| /de/de/prepare-for-your-trip/baggage/sport-baggage/register-ammunition | Description | Description:  | ok |
| /at/de/prepare-for-your-trip/baggage/sport-baggage/register-ammunition | Description | Description:  | ok |
| /gb/en/prepare-for-your-trip/baggage/sport-baggage/register-ammunition | Description | Description:  | ok |
| /de/en/baggage | Keywords | Keywords: pick-up service, baggage service, suitcase delivery, bag-free travel, … | ok |
| /de/de/gepaeck | Keywords | Keywords: Gepäckabholung, Remote Bag Drop, Gepäckservice, Abholservice, Reisen o… | differs |
| /at/de/gepaeck | Keywords | Keywords: Gepäckabholung, Remote Bag Drop, Gepäckservice, Abholservice, Reisen o… | differs |
| /gb/en/baggage | Keywords | Keywords: pick-up service, baggage service, suitcase delivery, bag-free travel, … | ok |
| /de/en/meetings-and-events | Description | Description:  | ok |
| /de/de/meetings-and-events | Description | Description:  | ok |
| /at/de/meetings-and-events | Description | Description:  | ok |
| /gb/en/meetings-and-events | Description | Description:  | ok |
| /de/en/addresses-worldwide | Description | Description:  | ok |
| /de/de/adressen-weltweit | Description | Description:  | ok |
| /at/de/adressen-weltweit | Description | Description:  | ok |
| /gb/en/addresses-worldwide | Description | Description:  | ok |
| /de/en/book-and-manage/additional-services/get-your-guide | Description | Description:  | ok |
| /de/de/book-and-manage/additional-services/get-your-guide | Description | Description:  | ok |
| /at/de/book-and-manage/additional-services/get-your-guide | Description | Description:  | ok |
| /gb/en/book-and-manage/additional-services/get-your-guide | Description | Description:  | ok |
| /de/en/book-and-manage/flights/ana | Description | Description:  | ok |
| /de/de/book-and-manage/flights/ana | Description | Description:  | ok |
| /at/de/book-and-manage/flights/ana | Description | Description:  | ok |
| /gb/en/book-and-manage/flights/ana | Description | Description:  | ok |
| /de/en/book-and-manage/flights/ana/faq | Description | Description:  | ok |
| /de/de/book-and-manage/flights/ana/faq | Description | Description:  | ok |
| /at/de/book-and-manage/flights/ana/faq | Description | Description:  | ok |
| /gb/en/book-and-manage/flights/ana/faq | Description | Description:  | ok |
| /de/en/book-and-manage/flights/lufthansa-voucher | Description | Description:  | ok |
| /de/de/book-and-manage/flights/lufthansa-voucher | Description | Description:  | ok |
| /at/de/book-and-manage/flights/lufthansa-voucher | Description | Description:  | ok |
| /gb/en/book-and-manage/flights/lufthansa-voucher | Description | Description:  | ok |
| /de/en/business-services | Description | Description:  | ok |
| /de/de/business-services | Description | Description:  | ok |
| /at/de/business-services | Description | Description:  | ok |
| /gb/en/business-services | Description | Description:  | ok |
| /de/en/during-your-trip/food-and-beverages/onboard-delights/faq | Description | Description:  | ok |
| /de/de/onboard-delights-faq | Description | Description:  | ok |
| /at/de/onboard-delights-faq | Description | Description:  | ok |
| /gb/en/during-your-trip/food-and-beverages/onboard-delights/faq | Description | Description:  | ok |
| /de/en/exclusive-charter | Description | Description:  | ok |
| /gb/en/exclusive-charter | Description | Description:  | ok |
| /de/en/free2move | Description | Description:  | ok |
| /de/de/free2move | Description | Description:  | ok |
| /at/de/free2move | Description | Description:  | ok |
| /gb/en/free2move | Description | Description:  | ok |
| /de/en/lufthansa-corporate-customers | Description | Description:  | ok |
| /de/de/lufthansa-firmenkunden | Description | Description:  | ok |
| /at/de/lufthansa-firmenkunden | Description | Description:  | ok |
| /gb/en/lufthansa-corporate-customers | Description | Description:  | ok |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg | Description | Description:  | ok |
| /de/de/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg | Description | Description:  | ok |
| /at/de/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg | Description | Description:  | ok |
| /gb/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg | Description | Description:  | ok |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay | Description | Description:  | ok |
| /de/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay | Description | Description:  | ok |
| /at/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay | Description | Description:  | ok |
| /gb/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay | Description | Description:  | ok |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage | Description | Description:  | ok |
| /de/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage | Description | Description:  | ok |
| /at/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage | Description | Description:  | ok |
| /gb/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage | Description | Description:  | ok |
| /de/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system | Description | Description:  | ok |
| /de/de/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system | Description | Description:  | ok |
| /at/de/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system | Description | Description:  | ok |
| /gb/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system | Description | Description:  | ok |
| /de/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk | Description | Description:  | ok |
| /de/de/prepare-for-your-trip/entry-regulations/immigration-regulations-uk | Description | Description:  | ok |
| /at/de/prepare-for-your-trip/entry-regulations/immigration-regulations-uk | Description | Description:  | ok |
| /gb/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk | Description | Description:  | ok |
| /de/en/prepare-for-your-trip/travel-classes/economy-basic | Description | Description:  | ok |
| /de/de/prepare-for-your-trip/travel-classes/economy-basic | Description | Description:  | ok |
| /at/de/prepare-for-your-trip/travel-classes/economy-basic | Description | Description:  | ok |
| /gb/en/prepare-for-your-trip/travel-classes/economy-basic | Description | Description:  | ok |
| /de/de/rechnungsbeleg | Canonical | Canonical: https://www.lufthansa.com/xx/de/book-and-manage/pax-receipt | ok |
| /de/en/schengen | Description | Description:  | ok |
| /gb/en/schengen | Description | Description:  | ok |
| /de/en/secure-flight | Description | Description:  | ok |
| /de/de/secure-flight | Description | Description:  | ok |
| /at/de/secure-flight | Description | Description:  | ok |
| /gb/en/secure-flight | Description | Description:  | ok |
| /de/en/security-check-time-slot | Description | Description:  | ok |
| /gb/en/security-check-time-slot | Description | Description:  | ok |
| /de/en/support/contact/passenger-duty-united-kingdom | Description | Description:  | ok |
| /de/de/support/contact/passenger-duty-united-kingdom | Description | Description:  | ok |
| /at/de/support/contact/passenger-duty-united-kingdom | Description | Description:  | ok |
| /gb/en/support/contact/passenger-duty-united-kingdom | Description | Description:  | ok |
| /de/en/articles/authors/florian-tomberg | Description | Description:  | ok |
| /de/de/articles/authors/florian-tomberg | Description | Description:  | ok |
| /at/de/articles/authors/florian-tomberg | Description | Description:  | ok |
| /gb/en/articles/authors/florian-tomberg | Description | Description:  | ok |
| /de/de/articles/explore-flying/7-people-who-shaped-lufthansa-history | Image | Image: https://www.lufthansa.com/content/dam/lufthansa-group/images/local_ima… | ok |
| /at/de/articles/explore-flying/7-people-who-shaped-lufthansa-history | Image | Image: https://www.lufthansa.com/content/dam/lufthansa-group/images/local_ima… | ok |
| /de/en/articles/explore-flying/anniversary-super-crane-special | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /de/de/articles/explore-flying/anniversary-super-crane-special | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /at/de/articles/explore-flying/anniversary-super-crane-special | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /gb/en/articles/explore-flying/anniversary-super-crane-special | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /de/de/articles/explore-flying/essentials-future-of-flying | Image | Image: https://www.lufthansa.com/content/dam/lufthansa-group/images/local_ima… | ok |
| /at/de/articles/explore-flying/essentials-future-of-flying | Image | Image: https://www.lufthansa.com/content/dam/lufthansa-group/images/local_ima… | ok |
| /de/en/articles/explore-flying/flying-high-christoph-quarch | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /de/de/articles/explore-flying/flying-high-christoph-quarch | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /at/de/articles/explore-flying/flying-high-christoph-quarch | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /gb/en/articles/explore-flying/flying-high-christoph-quarch | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /de/en/articles/explore-flying/inflight-entertainment-vr-experience | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /de/de/articles/explore-flying/inflight-entertainment-vr-experience | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /at/de/articles/explore-flying/inflight-entertainment-vr-experience | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /gb/en/articles/explore-flying/inflight-entertainment-vr-experience | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /de/de/articles/explore-the-world | og:description | og:description: Mit unserem Travel Blog zeigen wir Ihnen neue Perspektiven auf die Wel… | ok |
| /at/de/articles/explore-the-world | og:description | og:description: Mit unserem Travel Blog zeigen wir Ihnen neue Perspektiven auf die Wel… | ok |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | Image | Image: https://www.lufthansa.com/content/dam/lh/article-images/europe/lh_blog… | ok |
| /de/de/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | og:description, Image | og:description: Von köstlichen Tapas bis zu einem Spaziergang am Strand von Barcelonet…<br>Image: https://www.lufthansa.com/content/dam/lh/article-images/europe/lh_blog… | ok |
| /at/de/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | og:description, Image | og:description: Von köstlichen Tapas bis zu einem Spaziergang am Strand von Barcelonet…<br>Image: https://www.lufthansa.com/content/dam/lh/article-images/europe/lh_blog… | ok |
| /gb/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | Image | Image: https://www.lufthansa.com/content/dam/lh/article-images/europe/lh_blog… | ok |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | og:description | og:description: Jeroen Mosselman shares his perfect day in Berlin: Kreuzberg, Brandenb… | ok |
| /de/de/articles/explore-the-world/a-perfect-day-berlin-in-one-day | og:description, Image | og:description: Jeroen Mosselman zeigt Berlin an einem Tag: Kreuzberg, Brandenburger T…<br>Image: https://www.lufthansa.com/content/dam/lufthansa-group/images/local_ima… | ok |
| /at/de/articles/explore-the-world/a-perfect-day-berlin-in-one-day | og:description, Image | og:description: Jeroen Mosselman zeigt Berlin an einem Tag: Kreuzberg, Brandenburger T…<br>Image: https://www.lufthansa.com/content/dam/lufthansa-group/images/local_ima… | ok |
| /gb/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | og:description | og:description: Jeroen Mosselman shares his perfect day in Berlin: Kreuzberg, Brandenb… | ok |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | Image | Image: https://www.lufthansa.com/content/dam/lh/article-images/europe/lh_blog… | ok |
| /de/de/articles/explore-the-world/be-picky-barcelona-insider-tips | Image | Image: https://www.lufthansa.com/content/dam/lh/article-images/europe/lh_blog… | ok |
| /at/de/articles/explore-the-world/be-picky-barcelona-insider-tips | Image | Image: https://www.lufthansa.com/content/dam/lh/article-images/europe/lh_blog… | ok |
| /gb/en/articles/explore-the-world/be-picky-barcelona-insider-tips | Image | Image: https://www.lufthansa.com/content/dam/lh/article-images/europe/lh_blog… | ok |
| /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips | Image | Image: https://www.lufthansa.com/content/dam/lh/article-images/europe/lh_blog… | ok |
| /de/de/articles/explore-the-world/be-picky-frankfurt-insider-tips | Image | Image: https://www.lufthansa.com/content/dam/lh/article-images/europe/lh_blog… | ok |
| /at/de/articles/explore-the-world/be-picky-frankfurt-insider-tips | Image | Image: https://www.lufthansa.com/content/dam/lh/article-images/europe/lh_blog… | ok |
| /gb/en/articles/explore-the-world/be-picky-frankfurt-insider-tips | Image | Image: https://www.lufthansa.com/content/dam/lh/article-images/europe/lh_blog… | ok |
| /de/de/articles/explore-the-world/eat-see-do-algiers | Image | Image: https://www.lufthansa.com/content/dam/lufthansa-group/images/local_ima… | ok |
| /at/de/articles/explore-the-world/eat-see-do-algiers | Image | Image: https://www.lufthansa.com/content/dam/lufthansa-group/images/local_ima… | ok |
| /de/en/articles/explore-the-world/eat-see-do-berlin | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /de/de/articles/explore-the-world/eat-see-do-berlin | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /at/de/articles/explore-the-world/eat-see-do-berlin | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /gb/en/articles/explore-the-world/eat-see-do-berlin | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /de/en/articles/explore-the-world/in-my-hood-district-zurich | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /de/de/articles/explore-the-world/in-my-hood-district-zurich | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /at/de/articles/explore-the-world/in-my-hood-district-zurich | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /gb/en/articles/explore-the-world/in-my-hood-district-zurich | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /de/de/articles/explore-the-world/know-before-you-go-algiers | Image | Image: https://www.lufthansa.com/content/dam/lufthansa-group/images/local_ima… | ok |
| /at/de/articles/explore-the-world/know-before-you-go-algiers | Image | Image: https://www.lufthansa.com/content/dam/lufthansa-group/images/local_ima… | ok |
| /de/en/articles/explore-the-world/know-before-you-go-berlin | Image | Image: https://www.lufthansa.com/content/dam/lufthansa-group/images/local_ima… | ok |
| /gb/en/articles/explore-the-world/know-before-you-go-berlin | Image | Image: https://www.lufthansa.com/content/dam/lufthansa-group/images/local_ima… | ok |
| /de/en/articles/explore-the-world/picture-perfect-austin | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /de/de/articles/explore-the-world/picture-perfect-austin | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /at/de/articles/explore-the-world/picture-perfect-austin | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /gb/en/articles/explore-the-world/picture-perfect-austin | Image | Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /de/en/articles/explore-the-world/stop-over-tokyo | Description, Image | Description: <br>Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /de/de/articles/explore-the-world/stop-over-tokyo | Description, Image | Description: <br>Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /at/de/articles/explore-the-world/stop-over-tokyo | Description, Image | Description: <br>Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /gb/en/articles/explore-the-world/stop-over-tokyo | Description, Image | Description: <br>Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /de/en/articles/highlights | Description, og:description | Description: <br>og:description: Nothing is more exciting than the present. Here you can discover what … | ok |
| /de/de/articles/highlights | Description | Description:  | ok |
| /at/de/articles/highlights | Description | Description:  | ok |
| /gb/en/articles/highlights | Description, og:description | Description: <br>og:description: Nothing is more exciting than the present. Here you can discover what … | ok |
| /de/en/articles/highlights/allegris-premium-economy-san-diego | Description, og:description, Image | Description: <br>og:description: Art above the clouds: Inspired by the comfort of the Lufthansa Allegri…<br>Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /de/de/articles/highlights/allegris-premium-economy-san-diego | Description, og:description, Image | Description: <br>og:description: Kunst über den Wolken: Inspiriert vom Komfort der Lufthansa Allegris K…<br>Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /at/de/articles/highlights/allegris-premium-economy-san-diego | Description, og:description, Image | Description: <br>og:description: Kunst über den Wolken: Inspiriert vom Komfort der Lufthansa Allegris K…<br>Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /gb/en/articles/highlights/allegris-premium-economy-san-diego | Description, og:description, Image | Description: <br>og:description: Art above the clouds: Inspired by the comfort of the Lufthansa Allegri…<br>Image: https://www.lufthansa.com/etc/designs/dcep/logo-lh-og.jpg | ok |
| /de/en/articles/tags/allegris | Description | Description:  | ok |
| /de/de/articles/tags/allegris | Description | Description:  | ok |
| /at/de/articles/tags/allegris | Description | Description:  | ok |
| /gb/en/articles/tags/allegris | Description | Description:  | ok |
| /de/en/besondere-befoerderungsbedingungen-bus | Description | Description:  | ok |
| /de/de/besondere-befoerderungsbedingungen-bus | Description | Description:  | ok |
| /at/de/besondere-befoerderungsbedingungen-bus | Description | Description:  | ok |
| /gb/en/besondere-befoerderungsbedingungen-bus | Description | Description:  | ok |
| /de/en/business-terms-and-conditions | Description | Description:  | ok |
| /de/de/geschaeftsbedingungen | Description | Description:  | ok |
| /at/de/geschaeftsbedingungen | Description | Description:  | ok |
| /gb/en/business-terms-and-conditions | Description | Description:  | ok |
| /de/en/common | Description | Description:  | ok |
| /de/de/common | Description | Description:  | ok |
| /at/de/common | Description | Description:  | ok |
| /gb/en/common | Description | Description:  | ok |
| /de/de/common/accessibility-statement | Description | Description:  | ok |
| /at/de/common/accessibility-statement | Description | Description:  | ok |
| /de/en/common/agb-extra-services-at-online-check-in | Description | Description:  | ok |
| /de/de/common/agb-extra-services-at-online-check-in | Description | Description:  | ok |
| /at/de/common/agb-extra-services-at-online-check-in | Description | Description:  | ok |
| /gb/en/common/agb-extra-services-at-online-check-in | Description | Description:  | ok |
| /de/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation | Description | Description:  | ok |
| /de/de/common/agb-extra-services-at-online-check-in/conditions-seat-reservation | Description | Description:  | ok |
| /at/de/common/agb-extra-services-at-online-check-in/conditions-seat-reservation | Description | Description:  | ok |
| /gb/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation | Description | Description:  | ok |
| /de/en/common/imprint/lufthansa-insights-imprint | Description | Description:  | ok |
| /de/de/common/imprint/lufthansa-insights-imprint | Description | Description:  | ok |
| /at/de/common/imprint/lufthansa-insights-imprint | Description | Description:  | ok |
| /gb/en/common/imprint/lufthansa-insights-imprint | Description | Description:  | ok |
| /de/en/common/privacy-statement/privacy-statement-group | Description | Description:  | ok |
| /de/de/common/privacy-statement/privacy-statement-group | Description | Description:  | ok |
| /at/de/common/privacy-statement/privacy-statement-group | Description | Description:  | ok |
| /gb/en/common/privacy-statement/privacy-statement-group | Description | Description:  | ok |
| /de/en/data-protection-information | Description | Description:  | ok |
| /gb/en/data-protection-information | Description | Description:  | ok |
| /de/en/datenschutz | Description | Description:  | ok |
| /gb/en/datenschutz | Description | Description:  | ok |
| /de/en/faq-data-security | Description | Description:  | ok |
| /de/de/faq-data-security | Description | Description:  | ok |
| /at/de/faq-data-security | Description | Description:  | ok |
| /gb/en/faq-data-security | Description | Description:  | ok |
| /de/de/nutzungsbedingungen-waehrungsumrechnung | Description | Description:  | ok |
| /at/de/nutzungsbedingungen-waehrungsumrechnung | Description | Description:  | ok |
| /de/de/prepare-for-your-trip/baggage/baggage-conditions | Description | Description:  | ok |
| /at/de/prepare-for-your-trip/baggage/baggage-conditions | Description | Description:  | ok |
| /de/en/rail-fly-terms-and-conditions | Description | Description:  | ok |
| /de/de/rail-fly-bedingungen | Description, og:title | Description: <br>og:title: Nutzungsbedingungen für  RAIL&FLY-Online-Tickets | ok |
| /at/de/rail-fly-bedingungen | Description, og:title | Description: <br>og:title: Nutzungsbedingungen für  RAIL&FLY-Online-Tickets | ok |
| /gb/en/rail-fly-terms-and-conditions | Description | Description:  | ok |
| /de/en/sepa-terms-and-conditions | Description | Description:  | ok |
| /gb/en/sepa-terms-and-conditions | Description | Description:  | ok |
| /de/en/sepa-terms-and-conditions-b | Description | Description:  | ok |
| /de/de/sepa-bedingungen-b | Description | Description:  | ok |
| /at/de/sepa-bedingungen-b | Description | Description:  | ok |
| /gb/en/sepa-terms-and-conditions-b | Description | Description:  | ok |
| /de/en/terms-of-use | Description | Description:  | ok |
| /de/de/nutzungsbedingungen | Description | Description:  | ok |
| /at/de/nutzungsbedingungen | Description | Description:  | ok |
| /gb/en/terms-of-use | Description | Description:  | ok |
