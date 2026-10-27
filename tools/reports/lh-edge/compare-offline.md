# Offline page list on https://lhedge.bbird.live vs www (brief 80 part 4)

2026-10-27, after the deploy of c16472b.

- `/content/lh/markets/de/en/homepage.csi-offline.json`: 200 `application/json`,
  `cache-control: no-cache, no-store, must-revalidate`; keys `targetPage`, `resources` as www's
  recording (`tools/source-export/feeds/ams-rest/selectors/csi-offline-full.json`);
  `targetPage` `https://lhedge.bbird.live/de/en/homepage`; 113 resources, root-relative (head scripts,
  styles, manifest, favicon; fonts and lazy styles; header, footer and the block code of the page;
  its images).
- `/de/en/homepage.csi-offline.json` (short form): 404, as www.
- `/content/lh/markets/de/en/nothing.csi-offline.json`: 404.

Deliberate differences: the resources are the replica's (Edge Delivery scripts, blocks and media),
not www's AEM client libraries; `targetPage` uses https and the public host (www: `http://www.lufthansa.com`);
www's list starts with an empty string, the replica's does not.
