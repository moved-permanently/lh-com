# Bright Data snapshots in ema-adobe's workspace (brief 493)

tools/importer/bd-snapshots/ holds the HTML the first imports read: www.lufthansa.com 3,397 pages
(228 roots, 2026-10-21 to 2026-11-03) and www.discover-airlines.com 562 pages (9 roots,
2026-10-27 to 2026-11-01). bd-session's page folders (tools/source-export/pages: cleaned.html,
metadata.json, screenshots) and recapture HTML go with the lufthansa.com pages. 391 lufthansa.com pages
are in an lh-snapshots archive already (the R2 drop's 104 manifests, lh-deliveries.json). The other
3,568 are packed into lh-bd-ema-001 to -016, kept in the workspace (logs/b493/bd-archives, outside
git) and not uploaded.

Inside each archive: manifest.json first (per page: url, host, path, capture time, each file with
bytes and sha256), then bd-snapshots/<host>/<path>.html, source-export/pages/<path>/… and
source-export/recapture/<path>.html.

| Archive | MB | Pages | Roots | Captured | sha256 |
| --- | --- | --- | --- | --- | --- |
| lh-bd-ema-001.tar.gz | 477.3 | 355 | ae/de … bg/de (24) | 2026-10-22 – 2026-11-02 | `c393266ef89e55ada3b7f05a4eff6dfb6d85a45f7239649eccb367476a203cbe` |
| lh-bd-ema-002.tar.gz | 367.7 | 139 | bg/de … cn/de (23) | 2026-10-27 – 2026-11-02 | `b7be697ac66622f8d3757dad55e93b339f1b9752d69a8a3a2e40bfe6860fa088` |
| lh-bd-ema-003.tar.gz | 371.0 | 176 | cn/en … de/de (15) | 2026-10-22 – 2026-11-02 | `ee3c6d9d3d876e909b490fe5abf740678e0c2a014dc8e78e733fc5ccb4e390f0` |
| lh-bd-ema-004.tar.gz | 271.6 | 175 | de/de … de/en (2) | 2026-10-21 – 2026-11-01 | `a95c9ae587dca4c94217f18e92e148042e6813ab218390fddd3b8aa0843f3d2c` |
| lh-bd-ema-005.tar.gz | 226.8 | 138 | de/en … de/en (1) | 2026-10-21 – 2026-11-01 | `3b4e0355a607c0fd3482de85cb3b34d73e1d998f203ec96a363c90260931ea71` |
| lh-bd-ema-006.tar.gz | 273.7 | 137 | de/en … es/en (17) | 2026-10-21 – 2026-11-02 | `659ff65ffeb9936567b3b12ba1396e07fd2965a7e808b5b69eeddeff4ee459c2` |
| lh-bd-ema-007.tar.gz | 368.5 | 226 | es/es … fr/fr (8) | 2026-10-27 – 2026-11-02 | `073a989263b8bae7667305adab22acbbbe9b8ab3cdfe8a4c30b89cf83a4211f9` |
| lh-bd-ema-008.tar.gz | 478.3 | 402 | fr/fr … ie/en (20) | 2026-10-22 – 2026-11-02 | `4440292e37c3009ffdb6aae2113a30d75ff3b087a47f2b08006d9f195a055cc3` |
| lh-bd-ema-009.tar.gz | 415.9 | 152 | ie/en … lhg (29) | 2026-10-22 – 2026-11-02 | `9c6edf96edb4710ce3b52a02cf34328fd5d02cd9cc356caa942be8df4985519f` |
| lh-bd-ema-010.tar.gz | 474.7 | 191 | lhg … mx/es (26) | 2026-10-21 – 2026-11-02 | `5f36efb3ddef1dae3f87388608f209b283e35fa4a227b1e5b6618ee65c58115e` |
| lh-bd-ema-011.tar.gz | 367.4 | 120 | mx/es … ro/de (28) | 2026-10-29 – 2026-11-02 | `5d160edd31bd93b446bb7ff50594150696a42e575526b4512796985318038b98` |
| lh-bd-ema-012.tar.gz | 360.3 | 116 | ro/en … tw/en (26) | 2026-10-29 – 2026-11-02 | `a91a1c3b7b67c86a335c3b55a058428513fb26cd75659ec29148c6d085fcf0a7` |
| lh-bd-ema-013.tar.gz | 369.2 | 268 | tw/en … xx/es (15) | 2026-10-25 – 2026-11-03 | `3be896d978230bff410233e9e9c7a3ebfba6012f53737282c10b4cce651d3bd6` |
| lh-bd-ema-014.tar.gz | 372.9 | 289 | xx/es … xx/fr (2) | 2026-10-27 – 2026-11-03 | `76f05ad6d722a9d04ede65b1e9675f4de67bf6132c97a117bcec4193d374cf1a` |
| lh-bd-ema-015.tar.gz | 152.7 | 122 | xx/fr … za/en (3) | 2026-10-29 – 2026-11-03 | `82586d80a93a7e0f249a874684903485979017bd340cf1d295197696873147d7` |
| lh-bd-ema-016.tar.gz | 18.0 | 562 | discover:ca/en … discover:xx/fr (9) | 2026-10-27 – 2026-11-01 | `b9f49f3217966009e23b67fd748f072134ea48029c1c941e900680f7870a0ebc` |

Total: 16 archives, 3568 pages, 5366 MB.

## Per host and root

| Host | Root | Pages | MB (with page folders) | In lh-snapshots | First capture | Last capture |
| --- | --- | --- | --- | --- | --- | --- |
| www.discover-airlines.com | ca/en | 4 | 0.9 | 0 | 2026-10-30T07:54 | 2026-10-30T07:55 |
| www.discover-airlines.com | ca/fr | 4 | 0.9 | 0 | 2026-10-30T07:58 | 2026-10-30T09:57 |
| www.discover-airlines.com | de/de | 195 | 43.4 | 0 | 2026-10-27T08:44 | 2026-11-01T18:12 |
| www.discover-airlines.com | de/en | 173 | 38.3 | 0 | 2026-10-27T08:43 | 2026-11-01T18:14 |
| www.discover-airlines.com | us/de | 5 | 1.2 | 0 | 2026-10-29T17:46 | 2026-10-30T07:57 |
| www.discover-airlines.com | us/en | 4 | 0.9 | 0 | 2026-10-30T07:53 | 2026-10-30T07:54 |
| www.discover-airlines.com | xx/de | 6 | 1.4 | 0 | 2026-10-29T17:47 | 2026-11-01T18:13 |
| www.discover-airlines.com | xx/en | 5 | 1.1 | 0 | 2026-10-30T07:55 | 2026-11-01T18:13 |
| www.discover-airlines.com | xx/fr | 166 | 36.8 | 0 | 2026-10-30T08:28 | 2026-11-01T18:13 |
| www.lufthansa.com | ae/de | 4 | 18.3 | 0 | 2026-10-27T21:26 | 2026-10-27T23:22 |
| www.lufthansa.com | ae/en | 9 | 27.0 | 0 | 2026-10-27T14:24 | 2026-10-27T21:28 |
| www.lufthansa.com | al/de | 5 | 10.4 | 0 | 2026-10-27T21:29 | 2026-10-27T23:24 |
| www.lufthansa.com | al/en | 4 | 10.2 | 0 | 2026-10-27T21:31 | 2026-10-28T00:12 |
| www.lufthansa.com | am/de | 4 | 10.3 | 0 | 2026-10-27T21:33 | 2026-10-27T23:09 |
| www.lufthansa.com | am/en | 4 | 18.1 | 0 | 2026-10-27T21:34 | 2026-10-27T21:36 |
| www.lufthansa.com | ao/de | 4 | 15.5 | 0 | 2026-10-31T16:14 | 2026-10-31T16:16 |
| www.lufthansa.com | ao/en | 4 | 15.5 | 0 | 2026-10-31T16:16 | 2026-10-31T16:17 |
| www.lufthansa.com | ar/de | 4 | 18.6 | 0 | 2026-10-31T16:18 | 2026-10-31T16:19 |
| www.lufthansa.com | ar/en | 4 | 18.4 | 0 | 2026-10-31T16:20 | 2026-10-31T16:21 |
| www.lufthansa.com | ar/es | 8 | 27.9 | 0 | 2026-10-27T14:30 | 2026-11-02T22:25 |
| www.lufthansa.com | ar/fr | 4 | 11.8 | 0 | 2026-11-02T12:05 | 2026-11-02T12:19 |
| www.lufthansa.com | at/de | 313 | 403.1 | 73 | 2026-10-22T06:23 | 2026-11-01T17:34 |
| www.lufthansa.com | at/en | 7 | 28.0 | 0 | 2026-10-27T22:09 | 2026-10-27T22:14 |
| www.lufthansa.com | au/de | 4 | 10.2 | 0 | 2026-10-27T22:15 | 2026-10-27T23:10 |
| www.lufthansa.com | au/en | 6 | 18.0 | 0 | 2026-10-27T22:17 | 2026-10-27T22:20 |
| www.lufthansa.com | az/de | 6 | 19.4 | 0 | 2026-10-27T22:21 | 2026-10-28T00:13 |
| www.lufthansa.com | az/en | 5 | 21.4 | 0 | 2026-10-27T22:23 | 2026-10-27T22:26 |
| www.lufthansa.com | ba/de | 4 | 18.5 | 0 | 2026-10-27T22:27 | 2026-10-27T23:14 |
| www.lufthansa.com | ba/en | 4 | 18.3 | 0 | 2026-10-27T22:29 | 2026-10-27T22:31 |
| www.lufthansa.com | be/de | 7 | 15.9 | 0 | 2026-10-27T14:45 | 2026-10-31T17:19 |
| www.lufthansa.com | be/en | 6 | 26.1 | 0 | 2026-10-31T16:23 | 2026-10-31T16:25 |
| www.lufthansa.com | be/fr | 7 | 16.0 | 0 | 2026-10-27T14:28 | 2026-11-02T12:20 |
| www.lufthansa.com | bg/de | 4 | 20.1 | 0 | 2026-10-27T22:32 | 2026-10-27T23:16 |
| www.lufthansa.com | bg/en | 6 | 21.6 | 0 | 2026-10-27T22:34 | 2026-10-27T22:37 |
| www.lufthansa.com | bh/de | 4 | 15.4 | 0 | 2026-10-27T22:38 | 2026-10-27T23:18 |
| www.lufthansa.com | bh/en | 5 | 15.9 | 0 | 2026-10-27T22:40 | 2026-10-27T22:43 |
| www.lufthansa.com | br/de | 4 | 10.3 | 0 | 2026-10-31T16:26 | 2026-10-31T16:27 |
| www.lufthansa.com | br/en | 4 | 18.6 | 0 | 2026-10-31T16:28 | 2026-10-31T16:29 |
| www.lufthansa.com | br/es | 4 | 17.7 | 0 | 2026-11-02T22:03 | 2026-11-02T22:09 |
| www.lufthansa.com | by/de | 4 | 9.5 | 0 | 2026-10-31T16:30 | 2026-10-31T17:21 |
| www.lufthansa.com | by/en | 4 | 9.1 | 0 | 2026-10-31T16:32 | 2026-10-31T16:33 |
| www.lufthansa.com | ca/de | 4 | 17.7 | 0 | 2026-10-31T16:33 | 2026-10-31T16:35 |
| www.lufthansa.com | ca/en | 8 | 16.8 | 0 | 2026-10-27T14:42 | 2026-10-31T17:30 |
| www.lufthansa.com | ca/es | 4 | 17.6 | 0 | 2026-11-02T22:03 | 2026-11-02T22:11 |
| www.lufthansa.com | ca/fr | 9 | 27.1 | 1 | 2026-10-27T14:28 | 2026-11-02T12:21 |
| www.lufthansa.com | cd/de | 4 | 14.0 | 0 | 2026-10-27T22:43 | 2026-10-27T23:19 |
| www.lufthansa.com | cd/en | 4 | 13.9 | 0 | 2026-10-27T22:45 | 2026-10-27T22:47 |
| www.lufthansa.com | ch/de | 20 | 60.3 | 0 | 2026-10-27T14:26 | 2026-10-27T19:12 |
| www.lufthansa.com | ch/en | 19 | 75.1 | 0 | 2026-10-27T14:25 | 2026-10-27T19:11 |
| www.lufthansa.com | ch/fr | 7 | 34.0 | 0 | 2026-10-27T14:29 | 2026-11-02T12:22 |
| www.lufthansa.com | cl/de | 4 | 14.1 | 0 | 2026-10-31T16:38 | 2026-10-31T16:39 |
| www.lufthansa.com | cl/en | 4 | 13.9 | 0 | 2026-10-31T16:40 | 2026-10-31T16:41 |
| www.lufthansa.com | cl/es | 7 | 19.5 | 0 | 2026-10-27T14:31 | 2026-11-02T22:12 |
| www.lufthansa.com | cl/fr | 4 | 12.2 | 0 | 2026-11-02T12:08 | 2026-11-02T12:23 |
| www.lufthansa.com | cn/de | 4 | 17.5 | 0 | 2026-10-31T16:41 | 2026-10-31T16:43 |
| www.lufthansa.com | cn/en | 18 | 47.3 | 0 | 2026-10-31T16:43 | 2026-10-31T16:49 |
| www.lufthansa.com | co/de | 4 | 17.9 | 0 | 2026-10-31T16:50 | 2026-10-31T16:52 |
| www.lufthansa.com | co/en | 4 | 17.9 | 0 | 2026-10-31T16:52 | 2026-10-31T16:54 |
| www.lufthansa.com | co/es | 7 | 23.0 | 0 | 2026-10-27T14:31 | 2026-11-02T22:13 |
| www.lufthansa.com | co/fr | 4 | 11.0 | 0 | 2026-11-02T12:09 | 2026-11-02T12:25 |
| www.lufthansa.com | content | 3 | 6.3 | 0 | 2026-10-25T05:46 | 2026-10-25T05:48 |
| www.lufthansa.com | cr/de | 4 | 18.0 | 0 | 2026-10-31T16:54 | 2026-10-31T16:55 |
| www.lufthansa.com | cr/en | 4 | 17.8 | 0 | 2026-10-31T16:56 | 2026-10-31T16:57 |
| www.lufthansa.com | cr/es | 4 | 17.0 | 0 | 2026-11-02T22:03 | 2026-11-02T22:14 |
| www.lufthansa.com | cr/fr | 4 | 12.3 | 0 | 2026-11-02T12:11 | 2026-11-02T12:28 |
| www.lufthansa.com | cy/de | 4 | 10.4 | 0 | 2026-10-31T19:19 | 2026-10-31T20:43 |
| www.lufthansa.com | cy/en | 4 | 10.2 | 0 | 2026-10-31T19:21 | 2026-10-31T20:44 |
| www.lufthansa.com | cz/de | 4 | 13.9 | 0 | 2026-10-27T23:29 | 2026-10-27T23:32 |
| www.lufthansa.com | cz/en | 4 | 21.8 | 0 | 2026-10-27T23:33 | 2026-10-27T23:36 |
| www.lufthansa.com | de/de | 313 | 770.5 | 54 | 2026-10-21T20:00 | 2026-11-01T17:34 |
| www.lufthansa.com | de/en | 312 | 830.6 | 100 | 2026-10-21T19:53 | 2026-11-01T17:34 |
| www.lufthansa.com | dk/de | 7 | 15.7 | 0 | 2026-10-27T14:27 | 2026-10-27T23:36 |
| www.lufthansa.com | dk/en | 5 | 24.9 | 0 | 2026-10-27T23:38 | 2026-10-27T23:41 |
| www.lufthansa.com | dz/de | 4 | 10.2 | 0 | 2026-10-31T19:22 | 2026-10-31T20:38 |
| www.lufthansa.com | dz/en | 4 | 17.5 | 0 | 2026-10-31T19:24 | 2026-10-31T19:25 |
| www.lufthansa.com | dz/fr | 5 | 16.9 | 0 | 2026-11-02T12:12 | 2026-11-02T12:30 |
| www.lufthansa.com | ec/de | 4 | 10.7 | 0 | 2026-10-31T19:26 | 2026-10-31T20:39 |
| www.lufthansa.com | ec/en | 4 | 12.0 | 0 | 2026-10-31T19:28 | 2026-10-31T19:29 |
| www.lufthansa.com | ec/es | 4 | 11.6 | 0 | 2026-11-02T22:04 | 2026-11-02T22:15 |
| www.lufthansa.com | ee/de | 4 | 19.8 | 0 | 2026-10-27T23:42 | 2026-10-27T23:43 |
| www.lufthansa.com | ee/en | 4 | 19.6 | 0 | 2026-10-27T23:44 | 2026-10-27T23:46 |
| www.lufthansa.com | eg/de | 4 | 9.9 | 0 | 2026-10-27T23:47 | 2026-10-27T23:48 |
| www.lufthansa.com | eg/en | 17 | 33.4 | 0 | 2026-10-27T23:49 | 2026-10-27T23:57 |
| www.lufthansa.com | er/de | 4 | 9.3 | 0 | 2026-10-27T23:58 | 2026-10-28T05:03 |
| www.lufthansa.com | er/en | 4 | 30.2 | 0 | 2026-10-28T00:04 | 2026-10-28T00:22 |
| www.lufthansa.com | es/de | 4 | 19.6 | 0 | 2026-10-31T19:30 | 2026-10-31T19:31 |
| www.lufthansa.com | es/en | 5 | 24.9 | 0 | 2026-10-31T19:32 | 2026-10-31T19:34 |
| www.lufthansa.com | es/es | 17 | 42.7 | 7 | 2026-11-02T22:04 | 2026-11-02T22:28 |
| www.lufthansa.com | et/de | 4 | 10.5 | 0 | 2026-10-28T00:24 | 2026-10-28T00:26 |
| www.lufthansa.com | et/en | 4 | 10.4 | 0 | 2026-10-28T00:28 | 2026-10-28T01:05 |
| www.lufthansa.com | fi/de | 4 | 10.5 | 0 | 2026-10-28T00:30 | 2026-10-28T00:32 |
| www.lufthansa.com | fi/en | 6 | 22.5 | 0 | 2026-10-28T00:33 | 2026-10-28T00:39 |
| www.lufthansa.com | fr/de | 4 | 23.0 | 0 | 2026-10-31T19:35 | 2026-10-31T19:37 |
| www.lufthansa.com | fr/en | 6 | 27.3 | 0 | 2026-10-31T19:37 | 2026-10-31T19:40 |
| www.lufthansa.com | fr/fr | 283 | 556.6 | 13 | 2026-10-27T23:02 | 2026-11-02T21:57 |
| www.lufthansa.com | gb/de | 4 | 21.3 | 0 | 2026-10-28T00:39 | 2026-10-28T00:53 |
| www.lufthansa.com | gb/en | 311 | 395.9 | 73 | 2026-10-22T09:48 | 2026-11-01T17:34 |
| www.lufthansa.com | ge/de | 4 | 10.4 | 0 | 2026-10-28T00:55 | 2026-10-28T01:06 |
| www.lufthansa.com | ge/en | 4 | 10.4 | 0 | 2026-10-28T00:56 | 2026-10-28T01:05 |
| www.lufthansa.com | gq/de | 4 | 11.6 | 0 | 2026-10-31T19:40 | 2026-10-31T19:42 |
| www.lufthansa.com | gq/en | 4 | 11.5 | 0 | 2026-10-31T19:42 | 2026-10-31T19:43 |
| www.lufthansa.com | gq/fr | 4 | 11.5 | 0 | 2026-11-02T12:13 | 2026-11-02T12:41 |
| www.lufthansa.com | gr/de | 4 | 20.4 | 0 | 2026-10-31T19:44 | 2026-10-31T19:45 |
| www.lufthansa.com | gr/en | 4 | 20.8 | 0 | 2026-10-31T19:46 | 2026-10-31T19:48 |
| www.lufthansa.com | hk/de | 4 | 18.5 | 0 | 2026-10-31T19:48 | 2026-10-31T19:52 |
| www.lufthansa.com | hk/en | 16 | 42.7 | 0 | 2026-10-31T19:52 | 2026-10-31T19:57 |
| www.lufthansa.com | hr/de | 4 | 19.3 | 0 | 2026-10-28T00:59 | 2026-10-28T01:07 |
| www.lufthansa.com | hr/en | 4 | 10.5 | 0 | 2026-10-28T01:01 | 2026-10-28T01:03 |
| www.lufthansa.com | hu/de | 4 | 21.3 | 0 | 2026-10-28T05:07 | 2026-10-28T05:52 |
| www.lufthansa.com | hu/en | 4 | 21.0 | 0 | 2026-10-28T05:14 | 2026-10-28T05:20 |
| www.lufthansa.com | id/de | 4 | 12.3 | 0 | 2026-10-28T05:21 | 2026-10-28T05:53 |
| www.lufthansa.com | id/en | 4 | 12.2 | 0 | 2026-10-28T05:28 | 2026-10-28T05:32 |
| www.lufthansa.com | ie/de | 4 | 10.5 | 0 | 2026-10-28T05:35 | 2026-10-28T08:22 |
| www.lufthansa.com | ie/en | 4 | 20.8 | 0 | 2026-10-28T05:42 | 2026-10-28T05:59 |
| www.lufthansa.com | il/de | 4 | 21.0 | 0 | 2026-10-28T06:00 | 2026-10-28T06:05 |
| www.lufthansa.com | il/en | 8 | 25.7 | 0 | 2026-10-28T06:07 | 2026-10-28T07:14 |
| www.lufthansa.com | in/de | 4 | 18.7 | 0 | 2026-10-28T06:20 | 2026-10-28T06:24 |
| www.lufthansa.com | in/en | 9 | 19.0 | 0 | 2026-10-28T06:26 | 2026-10-28T06:36 |
| www.lufthansa.com | iq/de | 4 | 13.7 | 0 | 2026-10-28T06:38 | 2026-10-28T08:02 |
| www.lufthansa.com | iq/en | 4 | 13.6 | 0 | 2026-10-28T06:44 | 2026-10-28T07:17 |
| www.lufthansa.com | ir/de | 4 | 10.0 | 0 | 2026-10-28T06:50 | 2026-10-28T07:21 |
| www.lufthansa.com | ir/en | 6 | 18.5 | 0 | 2026-10-28T07:24 | 2026-10-28T08:03 |
| www.lufthansa.com | is/de | 4 | 10.1 | 0 | 2026-10-28T07:29 | 2026-10-28T08:16 |
| www.lufthansa.com | is/en | 4 | 17.9 | 0 | 2026-10-28T07:31 | 2026-10-28T08:14 |
| www.lufthansa.com | it/de | 4 | 22.3 | 0 | 2026-10-31T19:58 | 2026-10-31T20:00 |
| www.lufthansa.com | it/en | 4 | 23.2 | 0 | 2026-10-31T20:01 | 2026-10-31T20:03 |
| www.lufthansa.com | it/it | 2 | 5.7 | 1 | 2026-10-27T23:03 | 2026-10-27T23:05 |
| www.lufthansa.com | jo/de | 4 | 18.2 | 0 | 2026-10-28T07:32 | 2026-10-28T07:33 |
| www.lufthansa.com | jo/en | 5 | 19.8 | 0 | 2026-10-28T07:34 | 2026-10-28T08:15 |
| www.lufthansa.com | jp/de | 4 | 18.5 | 0 | 2026-10-31T20:04 | 2026-10-31T20:06 |
| www.lufthansa.com | jp/en | 4 | 18.6 | 0 | 2026-10-31T20:06 | 2026-10-31T20:08 |
| www.lufthansa.com | ke/de | 4 | 10.5 | 0 | 2026-10-28T07:36 | 2026-10-28T08:17 |
| www.lufthansa.com | ke/en | 4 | 18.3 | 0 | 2026-10-28T07:37 | 2026-10-28T07:39 |
| www.lufthansa.com | kr/de | 4 | 10.5 | 0 | 2026-11-02T02:43 | 2026-11-02T02:45 |
| www.lufthansa.com | kr/en | 4 | 10.3 | 0 | 2026-11-02T02:47 | 2026-11-02T04:22 |
| www.lufthansa.com | kw/de | 4 | 17.5 | 0 | 2026-10-28T18:03 | 2026-10-28T18:05 |
| www.lufthansa.com | kw/en | 5 | 18.4 | 0 | 2026-10-28T18:05 | 2026-10-28T18:07 |
| www.lufthansa.com | kz/de | 4 | 18.0 | 0 | 2026-11-02T02:51 | 2026-11-02T04:17 |
| www.lufthansa.com | kz/en | 4 | 10.1 | 0 | 2026-11-02T02:52 | 2026-11-02T04:23 |
| www.lufthansa.com | lb/de | 4 | 18.4 | 0 | 2026-10-28T18:07 | 2026-10-28T18:09 |
| www.lufthansa.com | lb/en | 4 | 18.7 | 0 | 2026-10-28T18:10 | 2026-10-28T18:11 |
| www.lufthansa.com | lhg | 107 | 316.2 | 0 | 2026-10-21T18:55 | 2026-10-22T14:54 |
| www.lufthansa.com | lt/de | 4 | 19.2 | 0 | 2026-10-28T18:12 | 2026-10-28T18:14 |
| www.lufthansa.com | lt/en | 4 | 19.0 | 0 | 2026-10-28T18:14 | 2026-10-28T18:16 |
| www.lufthansa.com | lu/de | 4 | 11.4 | 0 | 2026-11-02T02:54 | 2026-11-02T02:55 |
| www.lufthansa.com | lu/en | 5 | 22.5 | 0 | 2026-11-02T02:55 | 2026-11-02T02:57 |
| www.lufthansa.com | lu/fr | 4 | 10.6 | 0 | 2026-11-02T12:14 | 2026-11-02T12:33 |
| www.lufthansa.com | lv/de | 5 | 21.2 | 0 | 2026-10-28T18:17 | 2026-10-28T18:18 |
| www.lufthansa.com | lv/en | 4 | 19.1 | 0 | 2026-10-28T18:19 | 2026-10-28T18:21 |
| www.lufthansa.com | ly/de | 4 | 9.4 | 0 | 2026-10-28T18:21 | 2026-10-28T18:22 |
| www.lufthansa.com | ly/en | 4 | 9.3 | 0 | 2026-10-28T18:23 | 2026-10-28T18:24 |
| www.lufthansa.com | ma/de | 4 | 18.1 | 0 | 2026-11-02T02:58 | 2026-11-02T02:59 |
| www.lufthansa.com | ma/en | 4 | 18.4 | 0 | 2026-11-02T03:00 | 2026-11-02T03:01 |
| www.lufthansa.com | ma/fr | 4 | 18.1 | 0 | 2026-11-02T12:14 | 2026-11-02T12:35 |
| www.lufthansa.com | md/de | 4 | 17.5 | 0 | 2026-10-28T18:25 | 2026-10-28T18:26 |
| www.lufthansa.com | md/en | 4 | 17.4 | 0 | 2026-10-28T18:27 | 2026-10-28T18:28 |
| www.lufthansa.com | mk/de | 17 | 44.7 | 1 | 2026-10-28T18:29 | 2026-10-29T03:01 |
| www.lufthansa.com | mk/en | 9 | 32.0 | 1 | 2026-10-28T19:43 | 2026-10-29T03:01 |
| www.lufthansa.com | mt/de | 4 | 10.5 | 0 | 2026-10-28T20:19 | 2026-10-28T20:20 |
| www.lufthansa.com | mt/en | 4 | 10.5 | 0 | 2026-10-28T20:21 | 2026-10-28T20:22 |
| www.lufthansa.com | mu/de | 4 | 10.4 | 0 | 2026-10-28T20:23 | 2026-10-28T20:25 |
| www.lufthansa.com | mu/en | 4 | 10.4 | 0 | 2026-10-28T20:26 | 2026-10-28T20:28 |
| www.lufthansa.com | mv/de | 4 | 10.4 | 0 | 2026-10-28T20:29 | 2026-10-28T20:30 |
| www.lufthansa.com | mv/en | 4 | 12.5 | 0 | 2026-10-28T20:31 | 2026-10-28T20:34 |
| www.lufthansa.com | mx/de | 4 | 18.6 | 0 | 2026-11-02T03:02 | 2026-11-02T03:03 |
| www.lufthansa.com | mx/en | 4 | 18.4 | 0 | 2026-11-02T03:03 | 2026-11-02T03:05 |
| www.lufthansa.com | mx/es | 4 | 18.4 | 0 | 2026-11-02T22:06 | 2026-11-02T22:19 |
| www.lufthansa.com | my/de | 4 | 15.7 | 0 | 2026-10-29T01:26 | 2026-10-29T01:33 |
| www.lufthansa.com | my/en | 5 | 20.6 | 0 | 2026-10-29T01:33 | 2026-10-29T01:35 |
| www.lufthansa.com | ng/de | 4 | 17.2 | 0 | 2026-10-29T01:36 | 2026-10-29T01:37 |
| www.lufthansa.com | ng/en | 4 | 17.3 | 0 | 2026-10-29T01:38 | 2026-10-29T01:39 |
| www.lufthansa.com | nl/de | 4 | 22.5 | 0 | 2026-10-29T01:40 | 2026-10-29T01:42 |
| www.lufthansa.com | nl/en | 4 | 22.8 | 0 | 2026-10-29T01:42 | 2026-10-29T01:44 |
| www.lufthansa.com | no/de | 4 | 22.0 | 0 | 2026-10-29T01:45 | 2026-10-29T01:46 |
| www.lufthansa.com | no/en | 5 | 23.4 | 0 | 2026-10-29T01:47 | 2026-10-29T01:49 |
| www.lufthansa.com | nz/de | 4 | 16.6 | 0 | 2026-10-29T01:49 | 2026-10-29T01:51 |
| www.lufthansa.com | nz/en | 5 | 17.9 | 0 | 2026-10-29T01:51 | 2026-10-29T01:52 |
| www.lufthansa.com | om/de | 4 | 15.8 | 0 | 2026-10-29T01:53 | 2026-10-29T01:54 |
| www.lufthansa.com | om/en | 4 | 15.5 | 0 | 2026-10-29T01:55 | 2026-10-29T01:56 |
| www.lufthansa.com | pa/de | 4 | 14.4 | 0 | 2026-11-02T03:05 | 2026-11-02T03:07 |
| www.lufthansa.com | pa/en | 4 | 14.3 | 0 | 2026-11-02T03:07 | 2026-11-02T03:08 |
| www.lufthansa.com | pa/es | 4 | 14.1 | 0 | 2026-11-02T22:06 | 2026-11-02T22:20 |
| www.lufthansa.com | pe/de | 4 | 13.3 | 0 | 2026-11-02T03:09 | 2026-11-02T03:10 |
| www.lufthansa.com | pe/en | 4 | 13.3 | 0 | 2026-11-02T03:10 | 2026-11-02T03:11 |
| www.lufthansa.com | pe/es | 4 | 13.1 | 0 | 2026-11-02T22:07 | 2026-11-02T22:21 |
| www.lufthansa.com | ph/de | 4 | 15.5 | 0 | 2026-10-29T01:56 | 2026-10-29T01:57 |
| www.lufthansa.com | ph/en | 4 | 15.4 | 0 | 2026-10-29T01:58 | 2026-10-29T01:59 |
| www.lufthansa.com | pl/de | 4 | 21.2 | 0 | 2026-11-02T03:12 | 2026-11-02T03:13 |
| www.lufthansa.com | pl/en | 4 | 21.9 | 0 | 2026-11-02T03:14 | 2026-11-02T03:15 |
| www.lufthansa.com | pt/de | 4 | 20.3 | 0 | 2026-11-02T03:16 | 2026-11-02T03:17 |
| www.lufthansa.com | pt/en | 11 | 26.2 | 0 | 2026-11-02T03:18 | 2026-11-02T03:24 |
| www.lufthansa.com | qa/de | 4 | 9.3 | 0 | 2026-10-29T02:02 | 2026-10-29T02:03 |
| www.lufthansa.com | qa/en | 4 | 9.3 | 0 | 2026-10-29T02:03 | 2026-10-29T02:05 |
| www.lufthansa.com | ro/de | 4 | 19.9 | 0 | 2026-10-29T02:05 | 2026-10-29T02:07 |
| www.lufthansa.com | ro/en | 4 | 19.5 | 0 | 2026-10-29T02:08 | 2026-10-29T02:10 |
| www.lufthansa.com | rs/de | 4 | 19.7 | 0 | 2026-10-29T02:11 | 2026-10-29T02:13 |
| www.lufthansa.com | rs/en | 4 | 14.4 | 0 | 2026-10-29T02:13 | 2026-10-29T02:15 |
| www.lufthansa.com | ru/de | 4 | 9.3 | 0 | 2026-11-02T03:25 | 2026-11-02T03:26 |
| www.lufthansa.com | ru/en | 4 | 9.6 | 0 | 2026-11-02T03:26 | 2026-11-02T03:28 |
| www.lufthansa.com | sa/de | 4 | 10.2 | 0 | 2026-10-29T07:11 | 2026-10-29T07:12 |
| www.lufthansa.com | sa/en | 6 | 12.6 | 0 | 2026-10-29T07:13 | 2026-10-31T17:23 |
| www.lufthansa.com | sd/de | 4 | 34.0 | 0 | 2026-10-29T07:17 | 2026-10-29T08:18 |
| www.lufthansa.com | sd/en | 4 | 35.0 | 0 | 2026-10-29T07:18 | 2026-10-29T07:21 |
| www.lufthansa.com | se/de | 4 | 21.7 | 0 | 2026-10-29T07:21 | 2026-10-29T07:23 |
| www.lufthansa.com | se/en | 8 | 43.2 | 0 | 2026-10-29T07:23 | 2026-10-29T07:27 |
| www.lufthansa.com | sg/de | 4 | 18.8 | 0 | 2026-10-29T07:28 | 2026-10-29T07:29 |
| www.lufthansa.com | sg/en | 7 | 22.0 | 0 | 2026-10-29T07:30 | 2026-10-29T07:32 |
| www.lufthansa.com | si/de | 4 | 19.2 | 0 | 2026-10-29T07:32 | 2026-10-29T07:34 |
| www.lufthansa.com | si/en | 4 | 19.0 | 0 | 2026-10-29T07:34 | 2026-10-29T07:36 |
| www.lufthansa.com | sk/de | 4 | 18.1 | 0 | 2026-10-29T07:37 | 2026-10-29T07:38 |
| www.lufthansa.com | sk/en | 4 | 18.0 | 0 | 2026-10-29T07:38 | 2026-10-29T07:40 |
| www.lufthansa.com | th/de | 4 | 18.9 | 0 | 2026-10-29T07:40 | 2026-10-29T07:42 |
| www.lufthansa.com | th/en | 6 | 21.1 | 0 | 2026-10-29T07:42 | 2026-10-29T07:44 |
| www.lufthansa.com | tn/de | 4 | 10.9 | 0 | 2026-11-02T07:09 | 2026-11-02T07:16 |
| www.lufthansa.com | tn/en | 4 | 18.6 | 0 | 2026-11-02T07:17 | 2026-11-02T07:21 |
| www.lufthansa.com | tn/fr | 4 | 18.7 | 0 | 2026-11-02T12:15 | 2026-11-02T12:37 |
| www.lufthansa.com | tr/de | 4 | 18.7 | 0 | 2026-10-29T07:45 | 2026-10-29T07:46 |
| www.lufthansa.com | tr/en | 7 | 21.8 | 0 | 2026-10-29T07:47 | 2026-10-29T07:49 |
| www.lufthansa.com | tw/de | 4 | 15.0 | 0 | 2026-11-02T07:23 | 2026-11-02T07:26 |
| www.lufthansa.com | tw/en | 4 | 14.8 | 0 | 2026-11-02T07:28 | 2026-11-02T07:32 |
| www.lufthansa.com | ua/de | 4 | 9.4 | 0 | 2026-10-29T07:49 | 2026-10-29T07:50 |
| www.lufthansa.com | ua/en | 4 | 9.3 | 0 | 2026-10-29T07:51 | 2026-10-29T07:52 |
| www.lufthansa.com | us/de | 6 | 19.0 | 0 | 2026-11-02T07:33 | 2026-11-02T07:41 |
| www.lufthansa.com | us/en | 20 | 45.5 | 0 | 2026-10-25T18:41 | 2026-11-02T07:52 |
| www.lufthansa.com | us/es | 5 | 20.0 | 1 | 2026-11-02T22:07 | 2026-11-02T22:23 |
| www.lufthansa.com | us/fr | 4 | 20.3 | 0 | 2026-11-02T12:16 | 2026-11-02T12:40 |
| www.lufthansa.com | ve/de | 4 | 9.4 | 0 | 2026-11-02T07:53 | 2026-11-02T07:54 |
| www.lufthansa.com | ve/en | 4 | 9.3 | 0 | 2026-11-02T07:55 | 2026-11-02T07:56 |
| www.lufthansa.com | ve/es | 4 | 9.1 | 0 | 2026-11-02T22:07 | 2026-11-02T22:25 |
| www.lufthansa.com | vn/de | 4 | 13.6 | 0 | 2026-10-29T07:55 | 2026-10-29T07:56 |
| www.lufthansa.com | vn/en | 4 | 13.3 | 0 | 2026-10-29T07:57 | 2026-10-29T07:58 |
| www.lufthansa.com | xx/de | 53 | 78.0 | 1 | 2026-11-02T19:21 | 2026-11-02T19:39 |
| www.lufthansa.com | xx/en | 57 | 74.9 | 1 | 2026-10-27T16:50 | 2026-11-02T19:21 |
| www.lufthansa.com | xx/es | 279 | 556.0 | 32 | 2026-11-02T21:58 | 2026-11-03T02:10 |
| www.lufthansa.com | xx/fr | 284 | 579.8 | 32 | 2026-10-27T22:59 | 2026-11-03T07:28 |
| www.lufthansa.com | za/de | 4 | 18.7 | 0 | 2026-10-29T07:58 | 2026-10-29T08:00 |
| www.lufthansa.com | za/en | 4 | 13.5 | 0 | 2026-10-29T08:00 | 2026-10-29T08:03 |
