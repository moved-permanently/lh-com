#!/bin/sh
# The market roots' documents for the local import harness (main with "feat(markets): Italian, Greek, Japanese, Korean and Polish rows": the it, el, ja, ko and
# pl rows). Run from the repo root with the language versions' documents in content/. Nothing is
# published. tools/reports/markets/root-docs-harness.md says why.
set -e
# A: the seven new roots' nav and footer from their language versions (14 documents)
node tools/markets/root-docs.mjs --from xx/it --to ch/it --doc nav --doc footer
node tools/markets/root-docs.mjs --from xx/it --to it/it --doc nav --doc footer
node tools/markets/root-docs.mjs --from xx/el --to cy/el --doc nav --doc footer
node tools/markets/root-docs.mjs --from xx/el --to gr/el --doc nav --doc footer
node tools/markets/root-docs.mjs --from xx/ja --to jp/ja --doc nav --doc footer
node tools/markets/root-docs.mjs --from xx/ko --to kr/ko --doc nav --doc footer
node tools/markets/root-docs.mjs --from xx/pl --to pl/pl --doc nav --doc footer
node tools/importer/da-upload.mjs --site lh-com --list tools/reports/markets/root-navs-17-21.txt
# B: every language root's homepage and own pages, links into the root made relative where the
# replica serves them (46 documents)
node tools/markets/root-docs.mjs --own-root ch/it --page /ch/it/homepage
node tools/markets/root-docs.mjs --own-root it/it --page /it/it/homepage --page /it/it/book-and-manage/offers-and-destination/generic-offer-chicago --page /it/it/book-and-manage/offers-and-destination/generic-offer-miami
node tools/markets/root-docs.mjs --own-root cy/el --page /cy/el/homepage
node tools/markets/root-docs.mjs --own-root gr/el --page /gr/el/homepage
node tools/markets/root-docs.mjs --own-root jp/ja --page /jp/ja/homepage --page /jp/ja/local-page/information-for-customers --page /jp/ja/local-page/information-for-customers/japan-fuel-surcharge --page /jp/ja/local-page/student-offer-error --page /jp/ja/local-page/student-offer-thanks
node tools/markets/root-docs.mjs --own-root kr/ko --page /kr/ko/homepage --page /kr/ko/local-page/klook --page /kr/ko/local-page/korea-customer-info --page /kr/ko/local-page/muc-citypass
node tools/markets/root-docs.mjs --own-root pl/pl --page /pl/pl/homepage
node tools/markets/root-docs.mjs --own-root cn/hk --page /cn/hk/homepage
node tools/markets/root-docs.mjs --own-root hk/hk --page /hk/hk/homepage --page /hk/hk/local-page/hk-black-friday-deals --page /hk/hk/local-page/upstream-hkg-hk
node tools/markets/root-docs.mjs --own-root tw/hk --page /tw/hk/homepage
node tools/markets/root-docs.mjs --own-root cn/zh --page /cn/zh/homepage --page /cn/zh/irreg-handling-plan --page /cn/zh/local-page/cn-ewallet-payment --page /cn/zh/local-page/promocode-100-anniversary-1 --page /cn/zh/wechat-profile
node tools/markets/root-docs.mjs --own-root hk/zh --page /hk/zh/homepage
node tools/markets/root-docs.mjs --own-root tw/zh --page /tw/zh/homepage
node tools/markets/root-docs.mjs --own-root ao/pt --page /ao/pt/homepage
node tools/markets/root-docs.mjs --own-root br/pt --page /br/pt/homepage --page /br/pt/local-page/lufthansa-in-brazil/anac-report --page /br/pt/local-page/lufthansa-in-brazil/carrying-values --page /br/pt/local-page/lufthansa-in-brazil/international-transit-in-gru --page /br/pt/local-page/lufthansa-in-brazil/online-tickets-cancellation --page /br/pt/local-page/lufthansa-in-brazil/sac --page /br/pt/pix
node tools/markets/root-docs.mjs --own-root pt/pt --page /pt/pt/homepage --page /pt/pt/book-and-manage/offers-and-destination/companion-special-business --page /pt/pt/book-and-manage/offers-and-destination/companion-special-premium-economy --page /pt/pt/fatura
node tools/markets/root-docs.mjs --own-root by/ru --page /by/ru/homepage
node tools/markets/root-docs.mjs --own-root kz/ru --page /kz/ru/homepage --page /kz/ru/companion-business --page /kz/ru/companion-premium
node tools/markets/root-docs.mjs --own-root ru/ru --page /ru/ru/homepage --page /ru/ru/local-page/current-flight-information-ru
node tools/importer/da-upload.mjs --site lh-com --list tools/reports/markets/root-own-links.txt
