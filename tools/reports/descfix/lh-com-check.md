# description-fix on lufthansa.com: the 125 pages read on preview (brief 490, 2026-11-08)

- **Read:** `<meta name="description">` of each page on main--lh-com--moved-permanently.aem.page (all 125 answered 200; og:description and twitter:description the same text on every page).
- **Weak: 29.** A better description from the page's own text, in its language, at most 160 characters, for 26 of them in `lh-com-better.tsv` (path, description); 3 without (below). **Fine: 96.**
- The 33q/73g/744/74p fleet pages' seat-map captions ("Sample illustration Airbus A330-300 (8 First / 30 Business …)") count as fine: they name the aircraft and its cabins, what the page is about.
- hk upstream: the document's link to the Hong Kong airport page has "連結將在新瀏覽器標籤中開啟" (opens in a new browser tab) as its text, www's screen-reader text for the link; the import of lufthansa.com's local pages (ema-lufthansa's info template), not the description.

## The fallback after this round's change (description-fix.mjs, isWeak)

Run on the 125 pages' preview text: 106 descriptions as on preview (the 96 fine and 10 weak), 19 others, all among the weak: the 12 companion-special pages their heading ("Save up to 40% in Business Class", "Companion Special First Class"), the voucher terms and FlyNet their h1, nordamerika-angebote its offer heading, help alliance (de, en) its first paragraph, Jarallah its next paragraph, the Polish hotlines its note on the lines' costs. The 10 it cannot tell (the organiser's address, the leaked link text, the side notes, the long legal paragraphs, the help teaser) stay for the TSV or an author. The TSV's descriptions are better than the fallback's headings: use the TSV for these 125.

- The importer's cleanup (`tools/importer/transformers/lufthansa-cleanup.js`, its description from the first text paragraph when www has none) has its own copy of the old rules: a re-import writes the weak paragraphs again until it uses description-fix.mjs's `paragraphText` (not changed here: the brief kept the change to description-fix.mjs).

| # | Path | Description on preview | Verdict |
| --- | --- | --- | --- |
| 1 | /ae/en/companion-special-business-class | * Minimum two adults need to be booked | weak: a footnote |
| 2 | /ae/en/companion-special-premium-economy-class | * Minimum two adults need to be booked | weak: a footnote |
| 3 | /ae/en/promotion-code-information | The following terms and conditions apply to the redemption of vouchers: | weak: a lead-in to a list (ends with a colon) |
| 4 | /at/de/33q | Beispieldarstellung Airbus A330-300 (8 First / 30 Business / 21 Premium Economy / 177 Economy) | fine |
| 5 | /at/de/book-and-manage/offers-and-destination/nordamerika-angebote | Buchungszeitraum: 30.09.2019 - 04.11.2019 | weak: a date line only (the booking period) |
| 6 | /at/de/inspiredby | Auf einer emotionalen Reise durch das weite Russland entdeckt die Berliner Schauspielerin Emilia Schürle mit #inspiredby HEIMWEH ihre Wurzel… | fine |
| 7 | /at/en/book-and-manage/offers-and-destination/europe-offers1 | Don't miss out our Europe Deals - One-way flights from Vienna to European Hot Spots from 39€ only! | fine |
| 8 | /at/en/companion-special-business-class-eu | * Minimum two adults need to be booked | weak: a footnote |
| 9 | /at/en/companion-special-first-class | * Minimum of two adults need to be booked | weak: a footnote |
| 10 | /at/en/oneway-fares | Book even more affordable flights with our Economy one way fare within Europe now | fine |
| 11 | /ca/en/local-page/lufthansa-student-fares | To access the additional benefits, you must be logged into your Travel ID account and have your student status verified through Lufthansa’s … | weak: a side condition, not the page's subject |
| 12 | /ch/en/companion-special-first-class | * Minimum two adults need to be booked | weak: a footnote |
| 13 | /ch/en/companion-special-premium-economy-class | * Minimum two adults need to be booked | weak: a footnote |
| 14 | /ch/fr/companion-special-first-class | * Deux adultes minimum doivent faire partie de la réservation | weak: a footnote |
| 15 | /ch/fr/companion-special-premium-economy-class | * Deux adultes minimum doivent faire partie de la réservation | weak: a footnote |
| 16 | /cn/en/local-page/cn-en-tarmac-delay | Lufthansa German Airlines Tarmac Delay Contingency Plan In Mainland China | fine |
| 17 | /cn/en/local-page/cnypromocode26 | ¥666 discount available for Economy or Premium Economy fares. Copy the code and apply it at the cart-CNY666 | fine |
| 18 | /cn/en/visa-mastercard-with-unionpay | Please note that you can also pay with Visa and MasterCard credit cards via WeChat Pay (desktop only) and Alipay. | weak: a side note, not the page's subject (UnionPay) |
| 19 | /cn/zh/local-page/cn-ewallet-payment | 2019年1月26日起，汉莎航空正式开通中国最受欢迎的电子支付方式。从北京、上海、南京、沈阳和青岛搭乘汉莎航空出港的旅客，可使用支付宝或微信支付在机场支付升舱、改签、行李超重/超大/超件及携带宠物所产生的额外费用。 | fine |
| 20 | /cn/zh/local-page/cnypromocode26 | 经济舱或优选经济舱票价可享¥666折扣。复制优惠码并在付款页面使用：CNY666 | fine |
| 21 | /cn/zh/local-page/tarmac-delay-contingency-plan | 汉莎航空在中国大陆的停机坪延误应急计划 | fine |
| 22 | /cn/zh/visa-mastercard-with-unionpay | 您也可以将您的Visa和万事达信用卡添加到微信支付(仅限桌面客户端)和支付宝，并通过这些选项付款。 | weak: a side note, not the page's subject (UnionPay) |
| 23 | /content/mobile/lh/de/articles/help-alliance-leading-self-determined-lives | 19. Juni 2025 \| 5 min read \| Lufthansa Editorial Team | weak: a date and byline |
| 24 | /content/mobile/lh/de/content-pages/100-years-of-lufthansa | Begleiten Sie uns auf einer faszinierenden Reise und lernen Sie eine Ikone der Luftfahrt neu kennen. | fine |
| 25 | /content/mobile/lh/de/homepage | Die Lufthansa Crew nimmt Sie mit zu ihren Lieblingszielen und verrät Insider-Tipps, spannende Trends und besondere Orte, die Ihre Reise unve… | fine |
| 26 | /content/mobile/lh/en/articles/help-alliance-leading-self-determined-lives | 19. June 2025 \| 5 min read \| Lufthansa Editorial Team | weak: a date and byline |
| 27 | /content/mobile/lh/en/content-pages/100-years-of-lufthansa | Join us on a fascinating journey and discover new stories about an icon of aviation. | fine |
| 28 | /content/mobile/lh/en/homepage | The Lufthansa crew shares their favorite destinations, insider tips, travel trends, and remarkable places to help make your next trip unforg… | fine |
| 29 | /de/de/33q | Beispieldarstellung Airbus A330-300 (8 First / 30 Business / 21 Premium Economy / 177 Economy) | fine |
| 30 | /de/de/inspiredby | Auf einer emotionalen Reise durch das weite Russland entdeckt die Berliner Schauspielerin Emilia Schürle mit #inspiredby HEIMWEH ihre Wurzel… | fine |
| 31 | /de/de/special-offers | Buchen Sie jetzt unsere Flüge in der Economy Class zu attraktiven Preisen. | fine |
| 32 | /de/en/33q | Sample illustration Airbus A330-300 (8 First / 30 Business / 21 Premium Economy / 177 Economy) | fine |
| 33 | /de/en/flight-frankfurt-ivalo | Discover Finnish Lapland – as of November 4, Lufthansa can fly you to this fascinating dream destination every Saturday from Frankfurt. | fine |
| 34 | /de/en/flight-frankfurt-kuusamo | A snowy paradise for fans of winter sports - Lufthansa can fly you from Frankfurt to Kuusamo every Saturday from November 4. | fine |
| 35 | /es/es/local-page/form-submission-error | Ha ocurrido un error al enviar el formulario. Por favor, inténtelo de nuevo. | fine |
| 36 | /gb/en/33q | Sample illustration Airbus A330-300 (8 First / 30 Business / 21 Premium Economy / 177 Economy) | fine |
| 37 | /gb/en/companion-special-business-class | * Minimum two adults need to be booked | weak: a footnote |
| 38 | /gb/en/grouptravel | Lufthansa knows that arranging group travel can sometimes be challenging and our partners and support team will make it as easy as possible. | fine |
| 39 | /gr/el/invoice-request-greece-el | Εάν επιθυμείτε την έκδοση τιμολόγιου παρακαλούμε όπως συμπληρώσετε την παρακάτω φόρμα και πατήστε ‘’Αποστολή’’. Το τιμολόγιο θα σας αποσταλε… | fine |
| 40 | /hk/hk/local-page/companion-deal | 在漢莎網站預訂雙人同行機票時，即可享受令人難以置信的優惠。 搭乘時尚和舒適的漢莎航空商務艙到歐洲的，雙人僅需26,600港幣。 或者，搭乘最好的款待和美食的漢莎航空頭等艙，雙人僅需54,500港幣. | fine |
| 41 | /hk/hk/local-page/hk-black-friday-deals | 藉助我們在黑色星期五所特別推出的經濟艙彈性特惠票價，您可以自由更改旅行計劃，無需支付額外費用。 | fine |
| 42 | /hk/hk/local-page/one-way-special-fare | 針對希望從香港飛往歐洲的旅客，我們提供單程特惠票價。特惠票價在特定日期提供，由漢莎航空飛往法蘭克福以及瑞士國際航空公司飛往蘇黎世，並將提供便捷的轉機服務。 | fine |
| 43 | /hk/hk/local-page/upstream-hkg-hk | 計劃從澳門、深圳或其他港口出發到歐洲？漢莎航空集團與香港國際機場（HKIA）合作，在大灣區八個主要港口推出口岸預辦登機服務（UCI）。持有有效船票並已確認由香港出發的漢莎航空或瑞士國際航空機票的乘客，可享用此一站式服務。連結將在新瀏覽器標籤中開啟 | weak: ends with a link's "opens in a new browser tab" text (the document's link has that as its text) |
| 44 | /il/en/updated-cancellation-and-change-of-tickets | Lufthansa Group allows cancellation and change of tickets from Israel free of charge | fine |
| 45 | /in/en/local-page/new-destinations | Building on its robust presence in India, these new frequencies will cater to your needs with our signature flying experience. | fine |
| 46 | /in/en/local-page/new-destinations-india | Introducing new routes from Hyderabad to Frankfurt from January 2024 and Bengaluru to Munich in November 2023! | fine |
| 47 | /in/en/local-page/raffle-north-america-in/terms-and-conditions-in | Organiser: Lufthansa German Airlines 2nd Floor, Novotel Pullman Corporate Tower, Aerocity New Delhi – 110 033 India | weak: the organiser's address |
| 48 | /in/en/welcome-back-a380 | The A380 flies again – from Delhi to Munich | fine |
| 49 | /ir/en/local-page/new-payment-option | From now on, booking flights directly on LH.com or Lufthansa app is possible. | fine |
| 50 | /ir/en/tehran-frankfurt-restart | Lufthansa will be operating an A330 or A340 with a three class product, Economy, Premium Economy and Business Class. | fine |
| 51 | /it/en/first-class-chauffeur-service | Please note: this service is no longer available. No bookings for transfer service with chauffeur will be accepted. | fine |
| 52 | /it/en/invoice-italy | This request is valid for tickets issued on the Italian platform in Euro currency. | fine |
| 53 | /it/it/fattura | La presente richiesta è valida solo per biglietti acquistati sulla piattaforma italiana Lufthansa in valuta Euro. | fine |
| 54 | /it/it/first-class-servizio-chauffeur | Attenzione! Il servizio non è più disponibile, pertanto non si accettano ulteriori prenotazioni di transfer. | fine |
| 55 | /jo/en/local-page/amm-relaunch-offer | Mark the relaunch with special fares on Lufthansa-operated flights from Amman to Europe and North America. | fine |
| 56 | /jp/ja/local-page/information-for-customers | 航空燃油価格の変動に基づき、燃油特別追加運賃を設定しています。 | fine |
| 57 | /jp/ja/local-page/lufthansa-ana | ルフトハンザとANAで、シームレスな旅をお楽しみください。ルフトハンザとANAの提携により、日本とヨーロッパを結ぶフライトの選択肢が広がります。 | fine |
| 58 | /jp/ja/local-page/schedule-for-japan-routes | 日本発着便は下記のスケジュールで運航予定です。なお、運航スケジュールは予告なく変更となる場合がございます。（2026年10月26日更新） | fine |
| 59 | /jp/ja/local-page/student-offer-error | 申し訳ありません。エラーが発生しました。恐れ入りますがもう一度お試しください。 | fine |
| 60 | /jp/ja/local-page/student-offer-thanks | お申し込みありがとうございます。 | fine |
| 61 | /kr/en/local-page/naverpay-points | Visit romantic Christmas markets, enjoy your year-end shopping or welcome the new year in Europe. | fine |
| 62 | /kr/ko/local-page/korea-customer-info | 보다 편리한 서비스 제공을 위해 루프트한자 한국 고객을 위한 유용한 정보를 하기와 같이 정리하여 안내하오니 이용에 참고하시기 바랍니다. | fine |
| 63 | /kr/ko/local-page/muc-citypass | 가장 매력적인 뮌헨을 만날 수 있는 가을과 겨울, 지금 루프트한자와 함께 뮌헨으로 떠나세요! | fine |
| 64 | /kr/ko/local-page/naverpay-points | 유럽에서 로맨틱한 크리스마켓을 방문하거나 연말 쇼핑을 즐기고 여유있게 혹은 조금 색다르게 한 해를 맞이해보세요. | fine |
| 65 | /kr/ko/premiumoffers | 현대적 기종인 B747-8 및 A350-900과 함께 한국 노선에서 루프트한자의 프리미엄 프로덕트를 경험하세요. | fine |
| 66 | /kw/en/local-page/jarallah | The offer can also be applied on the below list of services provided by Jarallah, | weak: a fragment leading into a list (ends with a comma) |
| 67 | /kz/ru/companion-business | Специальное предложение для компаньона позволит вам совершить перелет по выбранному направлению с другим пассажиром и сэкономить: Забронируй… | fine |
| 68 | /kz/ru/companion-premium | Специальное предложение для компаньона позволит вам совершить перелет по выбранному направлению с другим пассажиром и сэкономить: Забронируй… | fine |
| 69 | /mk/de/munich-mountains | Vom Flughafen München gelangen Sie zuverlässig und bequem in zahlreiche Wandergebiete. Unsere attraktiven Partnerangebote und Services sorge… | fine |
| 70 | /mk/de/wandergebiete | Ob Garmisch-Partenkirchen, Kitzbühel, Zillertal oder Wilder Kaiser-Brixental – von München sind die schönsten Wandergebiete Deutschlands und… | fine |
| 71 | /mk/en/hiking-areas | Whether it’s Garmisch-Partenkirchen, Kitzbühel, Zillertal or Wilder Kaiser-Brixental, from Munich the most beautiful hiking areas in Germany… | fine |
| 72 | /my/en/local-page/kul-promo-code-oct26 | Save an extra MYR 450 on your next flight with promo code KULDEAL | fine |
| 73 | /pt/en/book-and-manage/offers-and-destination/ofertas-especiais | Take advantage of our special offers for different destinations across Europe in Economy Class and Business Class. Start your reservation be… | fine |
| 74 | /pt/pt/book-and-manage/offers-and-destination/ofertas-especiais | Aproveite nossas ofertas especiais para destinos em toda a Europa na Economy Class e Business Class. Comece a sua reserva a seguir! | fine |
| 75 | /pt/pt/companion-special-business-class | * É necessário reservar no mínimo dois adultos | weak: a footnote |
| 76 | /pt/pt/companion-special-first-class | * É necessário reservar no mínimo dois adultos | weak: a footnote |
| 77 | /pt/pt/companion-special-premium-economy-class | * É necessário reservar no mínimo dois adultos | weak: a footnote |
| 78 | /ru/ru/north-america-offers | Специальное предложение вам совершить перелет по выбранному направлению и сэкономить. | fine |
| 79 | /sa/en/local-page/companion-special-riyadh-munich-2025 | Take your friend, spouse or another family member to Munich and save 25% in our Economy Class. | fine |
| 80 | /sg/en/local-page/corporate-offer-sg | Lufthansa is extending corporate discounts to the intercontinental network of Lufthansa Group. | fine |
| 81 | /th/en/local-page/promocode-th-europe3000 | Use promo code EUROPE3000 and enjoy THB 3,000 off your next booking. | fine |
| 82 | /tw/hk/double-11-tw | 今年 11月11日，漢莎航空為您提供最佳的經濟艙優惠。 | fine |
| 83 | /xx/de/33q | Beispieldarstellung Airbus A330-300 (8 First / 30 Business / 21 Premium Economy / 177 Economy) | fine |
| 84 | /xx/de/inspiredby | Auf einer emotionalen Reise durch das weite Russland entdeckt die Berliner Schauspielerin Emilia Schürle mit #inspiredby HEIMWEH ihre Wurzel… | fine |
| 85 | /xx/el/culinaryjourney | Το Κέντρο Εξυπηρέτησης είναι εδώ για να σας βοηθήσει. | weak: the help teaser at the page's end (the page is an app, its only text); nothing else on the page to write a description from: one for an author |
| 86 | /xx/el/during-your-trip/food-and-beverages/onboard-delights/faq | Εδώ, θα βρείτε διευκρινίσεις για όλα τα σημαντικά θέματα που αφορούν την εκ των προτέρων παραγγελία φαγητού. | fine |
| 87 | /xx/en/33q | Sample illustration Airbus A330-300 (8 First / 30 Business / 21 Premium Economy / 177 Economy) | fine |
| 88 | /xx/en/flynet-hotspot | 1. Turn on your notebook or mobile device, enable Wi-Fi and connect to the Telekom FlyNet® network. | weak: a numbered step |
| 89 | /xx/es/33q | Ejemplo de configuración del Airbus A330-300 (8 First / 30 Business / 21 Premium Economy / 177 Economy) | fine |
| 90 | /xx/es/culinaryjourney | Nuestro centro de atención al cliente está a su disposición para ayudarle. | weak: the help teaser at the page's end (the page is an app, its only text); nothing else on the page to write a description from: one for an author |
| 91 | /xx/es/onboard-delights-faq | Aquí encontrará las aclaraciones a todas las cuestiones de interés en torno a la reserva previa de menús. | fine |
| 92 | /xx/fr/onboard-delights-faq | Vous trouverez ici tout ce qu’il faut savoir sur la précommande de menus. | fine |
| 93 | /xx/hk/book-and-manage/additional-services/get-your-guide | 想在世界各地尋找難忘旅遊經驗，GetYourGuide 是您的最佳選擇。我們擁有超過 60,000 種體驗，皆經過專家在當地測試和規劃。因此，不論是計畫內或計畫外的探索，您都不會錯過任何難忘的時刻。 | fine |
| 94 | /xx/hk/feedback-past-flight | 感謝您抽出寶貴時間聯絡我們，並表達您的疑慮。 請填寫表格，以便我們快速處理您的問詢。在提交問詢前，請檢查並填寫您的資訊。 | fine |
| 95 | /xx/it/onboard-delights-faq | Qui trova le risposte alle principali domande sul preordine dei pasti. | fine |
| 96 | /xx/ja/book-and-manage/additional-services/get-your-guide | GetYourGuideは、世界中の忘れられない旅の体験を探すには最高の場所です。現地で実際に体験した専門家によって厳選された6万以上の旅行体験がそろい、計画を立てていても無計画でも、忘れられない発見を一つも逃すことはありません。 | fine |
| 97 | /xx/ja/discover-lufthansa/lufthansa-fleet/33q | エアバスA330-300の座席構成の一例（8 ファースト / 30 ビジネス / 21 プレミアムエコノミー / 177 エコノミー） | fine |
| 98 | /xx/ja/feedback-past-flight | お困りごとについてお問い合わせいただきありがとうございます。 迅速に対応するために、こちらのフォームに内容をご記入ください。すべての情報を入力したことを確認してから送信してください。 | fine |
| 99 | /xx/ja/onboard-delights-faq | こちらで、お食事の事前注文に関する重要な情報をご案内します。 | fine |
| 100 | /xx/ja/secure-flight | 米国運輸保安局（TSA）は、49 U.S.C. section 114 （合衆国法典第49巻第114条）、Intelligence Reform and Terrorism Prevention Act of 2004（2004年制定の情報改革およびテロ予防法）、および49 C.… | weak: a whole legal paragraph (about 400 characters) |
| 101 | /xx/ko/744 | 보잉 B747-400 샘플 도면(비즈니스 67석 / 프리미엄 이코노미 32석 / 이코노미 272석) | fine |
| 102 | /xx/ko/74p | 보잉 B747-400 샘플 도면(비즈니스 67석 / 프리미엄 이코노미 32석 / 이코노미 272석) | fine |
| 103 | /xx/ko/during-your-trip/food-and-beverages/onboard-delights/faq | 기내식 사전 주문과 관련된 주요 토픽에 대한 설명을 여기에서 확인할 수 있습니다. | fine |
| 104 | /xx/ko/feedback-past-flight | 귀한 시간 내어 문의해 주셔서 감사합니다. 문의 사항을 신속하게 처리할 수 있도록 양식을 작성해 주세요. 문의를 제출하기 전에 정보를 확인하고 작성하세요. | fine |
| 105 | /xx/pl/33q | Przykładowy plan Airbusa A330-300 (8 w Klasie Pierwszej / 30 w Klasie Biznes / 21 w Klasie Ekonomicznej Premium / 177 w Klasie Ekonomicznej) | fine |
| 106 | /xx/pl/73g | Przykładowy plan B737-700 (20 w Klasie Biznes / 66 w Klasie Ekonomicznej) | fine |
| 107 | /xx/pl/744 | Przykładowy plan - B747-400 (67 w Klasie Biznes / 32 w Klasie Ekonomicznej Premium / 272 w Klasie Ekonomicznej) | fine |
| 108 | /xx/pl/74p | Przykładowy plan - B747-400 (67 w Klasie Biznes / 32 w Klasie Ekonomicznej Premium / 272 w Klasie Ekonomicznej) | fine |
| 109 | /xx/pl/during-your-trip/food-and-beverages/onboard-delights/faq | Tutaj można znaleźć wyjaśnienia wszystkich ważnych tematów dotyczących posiłków na pokładzie. | fine |
| 110 | /xx/pl/support/contact/hotlines | Niemcy | weak: a single word (the first country of the hotline list) |
| 111 | /xx/pt/33q | Esquema de exemplo do Airbus A330-300 (8 First / 30 Business / 21 Premium Economy / 177 Economy) | fine |
| 112 | /xx/pt/culinaryjourney | A nossa Central de Reservas está aqui para o(a) ajudar. | weak: the help teaser at the page's end (the page is an app, its only text); nothing else on the page to write a description from: one for an author |
| 113 | /xx/pt/onboard-delights-faq | Encontre aqui todas as explicações relativas aos temas mais importantes sobre a pré-encomenda de refeições. | fine |
| 114 | /xx/ru/73g | Стандартная схема B737-700 (20 мест бизнес-класса / 66 мест экономического класса) | fine |
| 115 | /xx/ru/744 | Стандартная схема B747-400 (67 мест бизнес-класса / 32 места премиум-эконом-класса / 272 места экономического класса) | fine |
| 116 | /xx/ru/74p | Стандартная схема B747-400 (67 мест бизнес-класса / 32 места премиум-эконом-класса / 272 места экономического класса) | fine |
| 117 | /xx/ru/during-your-trip/food-and-beverages/onboard-delights/faq | Здесь вы найдете всю важную информацию о предварительном заказе питания. | fine |
| 118 | /xx/ru/feedback-past-flight | Благодарим вас за обращение. Заполните эту форму, чтобы мы могли быстро обработать ваш запрос. Заполните и проверьте информацию перед отправ… | fine |
| 119 | /xx/zh/33q | 空中客车A330-300图例（8个头等舱座位/30个商务舱座位/21个优选经济舱座位/177个经济舱座位） | fine |
| 120 | /xx/zh/73g | 波音737-700图例说明（20个商务舱座位/66个经济舱座位） | fine |
| 121 | /xx/zh/744 | 波音747-400图例说明（67个商务舱座位/32个优选经济舱座位/272个经济舱座位） | fine |
| 122 | /xx/zh/74p | 波音747-400图例说明（67个商务舱座位/32个优选经济舱座位/272个经济舱座位） | fine |
| 123 | /xx/zh/book-and-manage/additional-services/get-your-guide | GetYourGuide 是一款优质旅行平台，助您悦享全球难忘的旅行体验。我们拥有超过 60,000 项体验，由专家实地测试规划，无论是缜密计划还是随性而至，均可让您乐享难忘的探索体验。 | fine |
| 124 | /xx/zh/feedback-past-flight | 感谢您抽出宝贵时间联系我们，并表达您的疑虑。 请填写表格，以便我们快速处理您的问询。在提交问询前，请检查并填写您的信息。 | fine |
| 125 | /xx/zh/secure-flight | 美国运输安全管理局（TSA）根据 2004 年情报改革及防恐法案 49 U.S.C. 第 114 条和 49 C.F.R. 的 1540 和 1560 部分之授权，可要求您提供全名、出生日期和性别，以供检查监察名单之用。您也可提供您的旅客护照辨识号码（如有）。如不提供您的全名、出… | weak: a whole legal paragraph (about 300 characters) |
