# Fixtures recorded from www.lufthansa.com

`www-message-center-2026-10-25.json` was recorded on 2026-10-25 at 08:05 UTC with same-origin GET requests in a
browser tab on www.lufthansa.com. All of it is public:

- `queries`: status, response headers and body of the six persisted queries under
  `/graphql/execute.json/Message-Center/` (`lhgIrregMessageList`, `lhgTechOutageMessageList`,
  `lhgMessageListWithCalendar`, `outage-b2b`, `CTI_Pages_for_APP`, `CTI%20Pages%20for%20tenants`).
- `labels`: the flash teaser label bundles `/service/api/labels/flashteaser/lh/{en,de}`.
- `homepages`: the `.dcep-flash-teaser` element of the de/en, de/de, at/de and gb/en homepages (the messages
  are in its `data-dcep` JSON).
- `cti`: the message items (`[id^="message-center-item-"]`) of the four current travel information pages.

The worker's output for the same messages is compared with these responses field by field.
