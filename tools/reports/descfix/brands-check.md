# description-fix on the brand sites: the 289 pages read on preview (brief 494, 2026-11-08)

- **Read:** `<meta name="description">` of each page in `brand-paths/<site>.txt` on main--<site>--moved-permanently.aem.page (all 289 answered 200; og:description and twitter:description the same text on every page), and lh-swiss's held /in/en/local-page/termsandconditions.
- **Weak** as on lufthansa.com (490): a footnote, a single word or a name, a date line or byline, a lead-in ending with a colon, a numbered heading, a side note rather than the page's subject; and, new here, a letter's salutation (SWISS's form success pages), a thank-you line whose next line says what follows, a first paragraph repeating the page title (the CJK ones), a breadcrumb, a heading and paragraph run together, and over 200 characters (B2B's news ledes; lufthansa.com's two over 200 were weak on 490 too). A better description from the page's own text, in its language, at most 160 characters, in `<site>-better.tsv` (path, description).
- **Text in another language on the page itself:** SWISS's rent-a-plane success pages in es, ja, pt, ru and zh and general/technical-support success in ru carry www's German text; their descriptions are that German text. B2B's /de/de/program/experts/on-board/meals-on-board/eurowings has English text about travel classes (counted fine: it is the page's text). /es/es/fly-friday22 on lh-swiss is English (fine, the page's text).
- **lufthansa.com, the same case as the CJK titles:** /cn/en/local-page/cn-en-tarmac-delay and /cn/zh/local-page/tarmac-delay-contingency-plan repeat their title too (fine on 490): `lh-com-better-494.tsv` (2).

## The rules after this round (description-rules.js, shared by description-fix.mjs and the importer)

- Run on every page's preview text: no page counted fine changes; of the weak, the rules now give another description on lh-austrian 1, lh-b2b 2, lh-brussels 14, lh-ita 2, lh-swiss 37 (the salutations, datelines, lead-ins, "Discover India", the breadcrumb); lufthansa.com's as on 490 (19). The over-200 ledes, the titles repeated in a paragraph, the side notes and thank-you lines stay for the TSVs: the TSVs' descriptions are better than the rules' for every listed page.
- The importer: lufthansa-cleanup.js (all 14 import bundles with it, rebuilt; the brand importers run them) takes the same rules. On lh-swiss's 70 pages with a www capture (content-sites/lh-swiss/snapshots) the importer's description and description-fix.mjs's on the preview text are the same on 65; on 5 technical-support success pages www has the thanks and the reply line in one paragraph (a line break), the imported document in two: the importer takes both lines, description-fix.mjs the first.

| Site | Pages | Weak | Better (TSV) | Fine |
| --- | --- | --- | --- | --- |
| lh-austrian | 32 | 5 | 5 | 27 |
| lh-b2b | 85 | 26 | 26 | 59 |
| lh-brussels | 35 | 15 | 15 | 20 |
| lh-cargo | 1 | 0 | 0 | 1 |
| lh-discover | 22 | 0 | 0 | 22 |
| lh-ita | 11 | 5 | 5 | 6 |
| lh-swiss | 103 + 1 held | 49 + 1 | 50 | 54 |
| all | 289 + 1 held | 100 + 1 | 101 | 189 |

## lh-austrian

| # | Path | Description on preview | Verdict |
| --- | --- | --- | --- |
| 1 | /at/de/local-page/feels-like-flying/os401crewstory | Eine Austrian Original Story von Maya O., Ground Services | weak: a byline |
| 2 | /at/de/local-page/feels-like-flying/os401firstflightalone | Ein riesiges Dankeschön an die tolle und nette Crew der OS 401 von Wien nach Barcelona. | fine |
| 3 | /at/de/plan/special-requirements/healthy-travel/doctor-on-board/doctor-on-board-news | Informieren Sie sich hier über alle wichtigen News und relevanten Entwicklungen zum Thema medizinische Versorgung an Bord. | fine |
| 4 | /at/en/plan/special-requirements/healthy-travel/doctor-on-board/doctor-on-board-news | Here you can read all the latest news and relevant developments concerning medical care on board. | fine |
| 5 | /cn/en/local-page/cnypromocode26 | ¥666 discount available for Economy or Premium Economy fares. Copy the code and apply it at the cart-CNY666 | fine |
| 6 | /cn/zh/green-fare | 航空旅行连接不同的人群、文化与经济，是全球化世界中不可或缺的一部分。在创造社会与经济价值的同时，航空业也必须致力于进一步降低其对气候和环境的影响。为推动实现低排放、更可持续的航空业，奥地利航空及汉莎航空集团投资于全新节能飞机，支持使用可持续航空燃料 (SAF)，并不断提升运营效率… | fine |
| 7 | /cn/zh/legal | 您可以在此找到存在法律通知的所有主题领域。点击相应图标可以跳转到相关领域。 | fine |
| 8 | /cn/zh/legal/terms-and-conditions | 对于奥地利航空的航班（代码为“OS”），奥地利航空为签约合作伙伴，且奥地利航空公司的一般承运条款及细则 (GCC) 适用。 | fine |
| 9 | /cn/zh/local-page/cn-zh-tarmac-contingency-plan | 奥地利航空中国大陆停机坪延误应急计划 | weak: repeats the page title; the next paragraph describes the page |
| 10 | /cn/zh/local-page/cnypromocode26 | 经济舱或优选经济舱票价可享¥666折扣。复制优惠码并在付款页面使用：CNY666 | fine |
| 11 | /es/es/fly/check-in/private-check-in-counter/confirmation-private-check-in-counter | Le notificaremos si es posible confirmar su solicitud en un plazo de 7 días. | fine |
| 12 | /es/es/legal | Aquí puede encontrar todas las áreas del tema donde hay avisos legales. Haga clic en el icono correspondiente para ir al área asociada. | fine |
| 13 | /fr/fr/fly/check-in/private-check-in-counter/confirmation-private-check-in-counter | Nous vous répondrons dans un délai de 7 jours pour vous indiquer si votre demande peut être confirmée. | fine |
| 14 | /fr/fr/legal | Vous trouverez ici tous les domaines du sujet où il existe des mentions légales. Cliquez sur l’icône correspondante pour accéder au domaine … | fine |
| 15 | /fr/fr/legal/voucher-conditions/austrian-voucher | Date de la dernière mise à jour : 15 septembre 2026 | weak: a date line (the last update) |
| 16 | /gr/el/fly/check-in/private-check-in-counter/confirmation-private-check-in-counter | Θα λάβετε απάντηση εντός 7 ημερών για το εάν το αίτημά σας μπορεί να επιβεβαιωθεί. | fine |
| 17 | /gr/el/legal | Εδώ μπορείτε να βρείτε όλους τους τομείς του θέματος όπου υφίστανται νομικές επισημάνσεις. Κάντε κλικ στο αντίστοιχο εικονίδιο για να μεταβε… | fine |
| 18 | /it/it/fly/check-in/private-check-in-counter/confirmation-private-check-in-counter | Le comunicheremo entro 7 giorni se la sua richiesta può essere confermata. | fine |
| 19 | /it/it/legal | Qui può trovare tutte le aree tematiche cui sono presenti avvisi legali. Per andare all’area associata faccia clic sulla rispettiva icona. | fine |
| 20 | /jp/ja/book/flights/information-for-customers | 航空燃油価格の変動に基づき、燃油特別追加運賃を設定しています。 | fine |
| 21 | /jp/ja/book/flights/international-surcharge | 弊社では、国土交通省の認可の下、所定の日本発航空運賃に加え、下記表のとおり「燃油特別付加運賃（インターナショナルサーチャージ）」のご負担をお客様にお願いしています。 | fine |
| 22 | /jp/ja/fly/check-in/private-check-in-counter/confirmation-private-check-in-counter | 7日以内に、お客様のリクエストを確定できるかどうかのお返事を差し上げます。 | fine |
| 23 | /jp/ja/green-fare | 空の旅は人や文化、経済を結びつけるものであり、グローバル化した世界において不可欠な要素です。この社会的・経済的価値は、航空業界が気候や環境に与える影響をさらに低減させるという目標と両立するものでなければなりません。より排出量が少なく、よりサステナブルな航空輸送を推進するため、オー… | weak: too long (over 200 characters): search results cut it |
| 24 | /jp/ja/legal | こちらでは、法的通知に関するすべての領域を網羅しています。各アイコンをクリックして関連トピックに移動してください。 | fine |
| 25 | /jp/ja/legal/terms-and-conditions | オーストリア航空の航空会社コード（OS）を持つフライトは、オーストリア航空がお客様の契約相手となり、Austrian Airlines AGの一般運送約款（GCC）が適用されます。 | fine |
| 26 | /jp/ja/offers-destinations | エコノミークラス特別オファーでヨーロッパのご旅行をご予約ください2026年10月31日までの期間限定で、ヨーロッパへの特別運賃をご提供中しています。旅行期間は2026年10月1日から2027年4月27日*まで。この機会に、ヨーロッパへの旅を計画してみませんか。 | weak: a heading and a paragraph run together |
| 27 | /pl/pl/fly/check-in/private-check-in-counter/confirmation-private-check-in-counter | W ciągu siedmiu dni powiadomimy Cię, czy Twoja prośba może zostać spełniona. | fine |
| 28 | /pl/pl/legal | Tutaj znajdziesz przegląd wszystkich obszarów tematycznych, dla których opracowano informacje prawne. Kliknij właściwą ikonę, aby zobaczyć p… | fine |
| 29 | /pl/pl/legal/terms-and-conditions | W przypadku rejsów Austrian (kod „OS”) stroną umowy są linie lotnicze Austrian Airlines i obowiązują Ogólne warunki przewozu (OWP) Austrian … | fine |
| 30 | /ru/ru/fly/check-in/private-check-in-counter/confirmation-private-check-in-counter | В течение 7 дней вы получите ответ о том, можно ли подтвердить ваш запрос. | fine |
| 31 | /ru/ru/legal | Здесь содержатся все предметные области, в которых существуют правовые уведомления. Нажмите на соответствующий значок для перехода в соответ… | fine |
| 32 | /ru/ru/legal/terms-and-conditions | На рейсах авиакомпании Austrian (код OS) стороной договора является Austrian Airlines и действуют Общие правила и условия перевозки (GCC) Au… | fine |

## lh-b2b

| # | Path | Description on preview | Verdict |
| --- | --- | --- | --- |
| 1 | /at/de/program/partner-plus-benefit/25-years-partner-plus-benefit | 2026 ist ein besonderes Jahr: Wir feiern nicht nur das 100-jährige Jubiläum der Gründung der ersten Lufthansa, sondern als Lufthansa Group f… | weak: too long (over 200 characters): search results cut it |
| 2 | /ch/en/program/experts/on-board | Explore our on board products and services across Lufthansa Group airlines. | fine |
| 3 | /ch/en/program/experts/on-board/travel-classes-and-booking/discover-airlines | Find out more about our different travel classes on our Airbus A330s on long-haul and our A320s on short- and medium-haul flights. | fine |
| 4 | /de/de/about-us | Lufthansa Group for Business ist die dedizierte B2B-Plattform der Lufthansa Group. Sie wurde für Unternehmen jeder Größe, Geschäftsreisende,… | fine |
| 5 | /de/de/allegris/video-gallery | Mehr Komfort, mehr Privatsphäre – und eine Vielzahl an Möglichkeiten, Reisen ganz individuell zu gestalten. Das ist Lufthansa Allegris. | fine |
| 6 | /de/de/common/terms-of-use | Veröffentlicht durch: | weak: a lead-in ("Veröffentlicht durch:") |
| 7 | /de/de/news/2026-summer-schedule-adjustments-through-the-end-of-june-now-im | Im Zuge der angekündigten Anpassungen des Sommerflugplans 2026 ist nun der neue Lufthansa Group Flugplan für Juni fertiggestellt und in den … | fine |
| 8 | /de/de/news/celebrating-shared-stories | 2026 ist ein besonderes Jahr: Lufthansa feiert das 100-jährige Jubiläum der Gründung der ersten Lufthansa im Jahr 1926. Für uns als Lufthans… | weak: too long (over 200 characters): search results cut it |
| 9 | /de/de/news/lh-new-era-of-flying-more-choice-more-comfort-2026 | FOX – die „Future Onboard Experience“ – ist die umfassendste Neugestaltung des Bordangebots von Lufthansa in den letzten Jahren. Das Konzept… | weak: too long (over 200 characters): search results cut it |
| 10 | /de/de/news/lufthansa-group-adjusts-refund-fees-and-largely-restores-famil | Hinweis: Die zum Zeitpunkt der Veröffentlichung als „Green Fares“ bezeichneten Tarife heißen heute „Impact Fares“. | weak: a side note (the fares' new name) |
| 11 | /de/de/news/nxt-100y | In dieser NXT-Episode reflektiert Frank Naeve, SVP Global Sales & Distribution, wie 100 Jahre Lufthansa Geschichte die Zukunft des Reisens p… | weak: too long (over 200 characters): search results cut it |
| 12 | /de/de/news/premium-is-in-the-detail-a-new-lufthansa-long-haul-experience-i | Im Jubiläumsjahr hat Lufthansa das Erlebnis an Bord von Grund auf neu gedacht – um Gästen ein noch komfortableres Reisen auf der Langstrecke… | weak: too long (over 200 characters): search results cut it |
| 13 | /de/de/partner-plus-benefit-raffle-terms-and-conditions | Veranstalter des PartnerPlusBenefit Jubiläumsgewinnspiels zum 25-jährigen Bestehen ist die Deutsche Lufthansa AG, Venloer Straße 151–153, 50… | fine |
| 14 | /de/de/partner-plus-benefit-raffle-thank-you | Vielen Dank für Ihre Teilnahme am Gewinnspiel zum 25-jährigen Jubiläum von PartnerPlusBenefit. | fine |
| 15 | /de/de/program/experts/at-the-airport/arrival-departure | Ihre Kund:innen können mit unseren Mobilitätspartnern entspannt zum Flughafen reisen – und von dort nahtlos weiter zu ihrem weltweiten Traum… | fine |
| 16 | /de/de/program/experts/at-the-airport/hubs/munich-airport | Der Flughafen München (MUC) ist mit rund 42 Millionen Passagieren pro Jahr der zweitgrößte Flughafen Deutschlands sowie das zweitgrößte Luft… | fine |
| 17 | /de/de/program/experts/baggage/carry-on-baggage | Bitte beachten Sie, dass diese Regelungen nicht für Flüge mit Eurowings gelten. Informationen zu Handgepäck bei Eurowings finden Sie hier. | weak: a side note (not for Eurowings) |
| 18 | /de/de/program/experts/baggage/dangerous-goods | Informationen zur Anmeldung bzw. Buchung von Schusswaffen und Munition finden Sie in der eXperts Member Area. | fine |
| 19 | /de/de/program/experts/baggage/excess-and-sports-baggage | Für Über- und Sondergepäck fallen Pauschalpreise an. Dies gilt auch für Sportgepäck, das die Freigepäckbegrenzungen überschreitet. | fine |
| 20 | /de/de/program/experts/baggage/free-baggage | Größe, Gewicht und Anzahl des erlaubten Freigepäcks und Handgepäcks richten sich nach verschiedenen Kriterien. | fine |
| 21 | /de/de/program/experts/news/archive | Hier finden Sie ältere Meldungen unserer Produkt & Service News. | fine |
| 22 | /de/de/program/experts/news/how-cargo-drives-progress-with-frank-naeve | Zusätzliche Verbindungen, neue Flugzeuge und ein innovatives Bordprodukt – in der aktuellen Ausgabe von Lufthansa Group NXT zeigt Frank Naev… | weak: too long (over 200 characters): search results cut it |
| 23 | /de/de/program/experts/news/lufthansa-dreamliner-receives-special-livery-to-mark-centennial | (01.10.2025) Lufthansa präsentiert zum 100-jährigen Gründungsjubiläum 2026 eine ikonische Sonderlackierung. Ab Dezember 2025 trägt eine Boei… | weak: too long (over 200 characters): search results cut it |
| 24 | /de/de/program/experts/news/premium-is-in-the-detail-a-new-lufthansa-long-haul-experience-i | Im Jubiläumsjahr hat Lufthansa das Erlebnis an Bord von Grund auf neu gedacht – um Gästen ein noch komfortableres Reisen auf der Langstrecke… | weak: too long (over 200 characters): search results cut it |
| 25 | /de/de/program/experts/on-board/entertainment-on-board | Bitte wählen Sie eine Airline, um mehr über das Unterhaltungsangebot an Bord zu erfahren. | fine |
| 26 | /de/de/program/experts/on-board/fleet-seatmaps | Bitte wählen Sie eine Airline, um die Sitzpläne abzurufen sowie weitere Informationen zur Flotte zu erhalten. | fine |
| 27 | /de/de/program/experts/on-board/meals-on-board | Bitte wählen Sie eine Airline, um mehr über das kulinarische Angebot an Bord zu erfahren. | fine |
| 28 | /de/de/program/experts/on-board/meals-on-board/eurowings | Whether it’s Economy or Business – Find out everything you need to know about our travel classes here. | fine |
| 29 | /de/de/program/experts/on-board/travel-classes | Bitte wählen Sie eine Airline, um mehr über die Reiseklassen zu erfahren. | fine |
| 30 | /de/de/program/experts/on-board/travel-classes/brussels-airlines/business-class | In der Business Class genießen Fluggäste erstklassigen Service und Komfort. Es erwarten sie Lounge-Zugang, Priority-Boarding, zusätzliches F… | fine |
| 31 | /de/de/program/experts/on-board/travel-classes/discover-airlines | Entdecken Sie hier die verschiedenen Reiseklassen auf unseren Langstreckenflugzeugen, dem Airbus A330, und auf unseren Kurz- und Mittelstrec… | fine |
| 32 | /de/de/program/experts/on-board/travel-classes/eurowings | Mit den Tarifen BASIC, SMART und BIZclass bietet Eurowings für jeden Reiseanlass die passende Option. | fine |
| 33 | /de/de/program/experts/programs-and-groups/group-travel | Für Details zu Book-a-Group und zu Eurowings GDS-Gruppenbuchungen besuchen Sie bitte die eXperts Member Area. | fine |
| 34 | /de/de/program/experts/special-assistance-and-services/accessible-travel | Detaillierte Informationen zur Buchung und Anmeldung von Fluggästen, die auf einen Rollstuhl angewiesen sind, finden Sie in der eXperts Memb… | fine |
| 35 | /de/de/program/experts/special-assistance-and-services/animals | Detaillierte Informationen zur Buchung und Anmeldung von Tieren (PETC und AVIH) im Reisebüro finden Sie in der eXperts Member Area. | fine |
| 36 | /de/de/program/experts/special-assistance-and-services/special-meals | Detaillierte Hinweise zur Buchung von Sondermahlzeiten inklusive der entsprechenden Meal Codes finden Sie in der eXperts Member Area. | fine |
| 37 | /de/de/program/experts/special-assistance-and-services/unaccompanied-minors | Detaillierte Information zur Buchung und Anmeldung von alleinreisenden Kindern im Reisebüro finden Sie in der eXperts Member Area. | fine |
| 38 | /de/de/program/partner-plus-benefit/25-years-partner-plus-benefit | 2026 ist ein besonderes Jahr: Wir feiern nicht nur das 100-jährige Jubiläum der Gründung der ersten Lufthansa, sondern als Lufthansa Group f… | weak: too long (over 200 characters): search results cut it |
| 39 | /de/de/program/partner-plus-benefit/cash-and-points | PartnerPlusBenefit*, das kostenlose Firmenbonusprogramm der Lufthansa Group, bietet zahlreiche Vorteile für Unternehmen rund um den Geschäft… | fine |
| 40 | /de/de/travel-solutions/lufthansa-group-wifi | Entdecken Sie Lufthansa Group Wi-Fi – powered by Starlink. Jede Reise verbindet Menschen. Sei es mit einem Geschäftstermin, Familie und Freu… | weak: too long (over 200 characters): search results cut it |
| 41 | /de/en/allegris/video-gallery | Lufthansa Allegris › Inside Sessions | weak: a breadcrumb |
| 42 | /de/en/news/celebrating-shared-stories | 2026 is a special year: Lufthansa is celebrating 100 years since the founding of the first Lufthansa in 1926. For us at Lufthansa Group for … | weak: too long (over 200 characters): search results cut it |
| 43 | /de/en/news/europes-most-connected-hub-network | The airlines of the Lufthansa Group operate Europe’s most comprehensive hub network, a strategic advantage for everyone seeking reliability,… | fine |
| 44 | /de/en/news/lh-new-era-of-flying-more-choice-more-comfort-2026 | FOX – the Future Onboard Experience – is Lufthansa's most comprehensive transformation of the on board product in recent years. Now live acr… | weak: too long (over 200 characters): search results cut it |
| 45 | /de/en/news/lufthansa-group-adjusts-refund-fees-and-largely-restores-famil | Note: At the time of publication, these fares were known as “Green Fares.” They are now called “Impact Fares.” | weak: a side note (the fares' new name) |
| 46 | /de/en/news/nxt-100y | In this NXT episode, Frank Naeve, SVP Global Sales & Distribution, reflects on how 100 years of Lufthansa history continue to shape the futu… | weak: too long (over 200 characters): search results cut it |
| 47 | /de/en/news/premium-is-in-the-detail-a-new-lufthansa-long-haul-experience-i | In its anniversary year, Lufthansa has completely reimagined the onboard experience to make long-haul travel even more comfortable. More per… | weak: too long (over 200 characters): search results cut it |
| 48 | /de/en/partner-plus-benefit-raffle-terms-and-conditions | The organizer of the PartnerPlusBenefit 25-Year Anniversary Raffle is Deutsche Lufthansa AG, Venloer Strasse 151-153, 50672 Cologne, Germany… | fine |
| 49 | /de/en/partner-plus-benefit-raffle-thank-you | Thank you for taking part in the PartnerPlusBenefit 25-Year Anniversary Raffle. | fine |
| 50 | /de/en/program/experts/baggage/dangerous-goods | You can find information on the registration or booking of firearms and ammunition in the eXperts member area. | fine |
| 51 | /de/en/program/experts/baggage/excess-and-sports-baggage | For excess and special baggage, flat rates apply. This is also the case for sports baggage that exceeds the free baggage allowance. | fine |
| 52 | /de/en/program/experts/news/how-cargo-drives-progress-with-frank-naeve | Additional connections, new aircraft and an innovative onboard experience – in the latest edition of Lufthansa Group NXT, Frank Naeve shares… | weak: too long (over 200 characters): search results cut it |
| 53 | /de/en/program/experts/news/lufthansa-dreamliner-receives-special-livery-to-mark-centennial | Lufthansa is presenting an iconic special livery to mark its 100th anniversary in 2026. Starting in December, a new Boeing 787-9 will proudl… | weak: too long (over 200 characters): search results cut it |
| 54 | /de/en/program/experts/news/premium-is-in-the-detail-a-new-lufthansa-long-haul-experience-i | In its anniversary year, Lufthansa has completely reimagined the onboard experience to make long-haul travel even more comfortable. More per… | weak: too long (over 200 characters): search results cut it |
| 55 | /de/en/program/experts/on-board | Explore our on board products and services across Lufthansa Group airlines. | fine |
| 56 | /de/en/program/experts/on-board/travel-classes-and-booking/airdolomiti | Whether it’s Economy or Business Class – Find out everything you need to know about our travel classes here. | fine |
| 57 | /de/en/program/experts/on-board/travel-classes-and-booking/brussels-airlines | Whether it’s Economy, Premium Economy, or Business Class-Find out everything you need to know about our travel classes here. | fine |
| 58 | /de/en/program/experts/on-board/travel-classes-and-booking/discover-airlines | Find out more about our different travel classes on our Airbus A330s on long-haul and our A320s on short- and medium-haul flights. | fine |
| 59 | /de/en/program/experts/on-board/travel-classes-and-booking/eurowings | Whether it’s Economy or Business – Find out everything you need to know about our travel classes here. | fine |
| 60 | /de/en/program/experts/programs-and-groups | Find the perfect solution for your agency or customers with the help of our programs and tools. | fine |
| 61 | /de/en/program/experts/special-assistance-and-services | Passengers with special needs: we have provided some important information on accessible travel. Find out here about our services for passen… | fine |
| 62 | /de/en/program/partner-plus-benefit/25-years-partner-plus-benefit | 2026 is a special year: not only are we celebrating the 100th anniversary of the founding of the first Lufthansa, but as Lufthansa Group for… | weak: too long (over 200 characters): search results cut it |
| 63 | /de/en/program/partner-plus-benefit/cash-and-points | PartnerPlusBenefit*, the Lufthansa Group’s free corporate bonus program, offers numerous benefits for companies related to everyday business… | fine |
| 64 | /de/en/travel-solutions/lufthansa-group-wifi | Meet Lufthansa Group Wi-Fi, powered by Starlink: Every journey connects people to something: a business meeting, a holiday, friends, family … | weak: too long (over 200 characters): search results cut it |
| 65 | /xx/de/allegris/video-gallery | Mehr Komfort, mehr Privatsphäre – und eine Vielzahl an Möglichkeiten, Reisen ganz individuell zu gestalten. Das ist Lufthansa Allegris. | fine |
| 66 | /xx/de/program/experts/baggage/dangerous-goods | Informationen zur Anmeldung bzw. Buchung von Schusswaffen und Munition finden Sie in der eXperts Member Area. | fine |
| 67 | /xx/de/program/experts/baggage/free-baggage | Größe, Gewicht und Anzahl des erlaubten Freigepäcks und Handgepäcks richten sich nach verschiedenen Kriterien. | fine |
| 68 | /xx/de/program/experts/on-board/entertainment-on-board | Bitte wählen Sie eine Airline, um mehr über das Unterhaltungsangebot an Bord zu erfahren. | fine |
| 69 | /xx/de/program/experts/on-board/fleet-seatmaps | Bitte wählen Sie eine Airline, um die Sitzpläne abzurufen sowie weitere Informationen zur Flotte zu erhalten. | fine |
| 70 | /xx/de/program/experts/on-board/meals-on-board | Bitte wählen Sie eine Airline, um mehr über das kulinarische Angebot an Bord zu erfahren. | fine |
| 71 | /xx/de/program/experts/on-board/travel-classes/discover-airlines | Entdecken Sie hier die verschiedenen Reiseklassen auf unseren Langstreckenflugzeugen, dem Airbus A330, und auf unseren Kurz- und Mittelstrec… | fine |
| 72 | /xx/de/program/experts/special-assistance-and-services/accessible-travel | Detaillierte Informationen zur Buchung und Anmeldung von Fluggästen, die auf einen Rollstuhl angewiesen sind, finden Sie in der eXperts Memb… | fine |
| 73 | /xx/de/program/experts/special-assistance-and-services/animals | Detaillierte Informationen zur Buchung und Anmeldung von Tieren (PETC und AVIH) im Reisebüro finden Sie in der eXperts Member Area. | fine |
| 74 | /xx/de/program/experts/special-assistance-and-services/special-meals | Detaillierte Hinweise zur Buchung von Sondermahlzeiten inklusive der entsprechenden Meal Codes finden Sie in der eXperts Member Area. | fine |
| 75 | /xx/de/program/experts/special-assistance-and-services/unaccompanied-minors | Detaillierte Information zur Buchung und Anmeldung von alleinreisenden Kindern im Reisebüro finden Sie in der eXperts Member Area. | fine |
| 76 | /xx/de/program/partner-plus-benefit/25-years-partner-plus-benefit | 2026 ist ein besonderes Jahr: Wir feiern nicht nur das 100-jährige Jubiläum der Gründung der ersten Lufthansa, sondern als Lufthansa Group f… | weak: too long (over 200 characters): search results cut it |
| 77 | /xx/de/program/partner-plus-benefit/cash-and-points | PartnerPlusBenefit*, das kostenlose Firmenbonusprogramm der Lufthansa Group, bietet zahlreiche Vorteile für Unternehmen rund um den Geschäft… | fine |
| 78 | /xx/en/partner-plus-benefit-raffle-terms-and-conditions | The organizer of the PartnerPlusBenefit 25-Year Anniversary Raffle is Deutsche Lufthansa AG, Venloer Strasse 151-153, 50672 Cologne, Germany… | fine |
| 79 | /xx/en/program/experts/baggage/dangerous-goods | You can find information on the registration or booking of firearms and ammunition in the eXperts member area. | fine |
| 80 | /xx/en/program/experts/on-board/travel-classes-and-booking/airdolomiti | Whether it’s Economy or Business Class – Find out everything you need to know about our travel classes here. | fine |
| 81 | /xx/en/program/experts/on-board/travel-classes-and-booking/discover-airlines | Find out more about our different travel classes on our Airbus A330s on long-haul and our A320s on short- and medium-haul flights. | fine |
| 82 | /xx/en/program/experts/programs-and-groups | Find the perfect solution for your agency or customers with the help of our programs and tools. | fine |
| 83 | /xx/en/program/experts/special-assistance-and-services | Passengers with special needs: we have provided some important information on accessible travel. Find out here about our services for passen… | fine |
| 84 | /xx/en/program/partner-plus-benefit/25-years-partner-plus-benefit | 2026 is a special year: not only are we celebrating the 100th anniversary of the founding of the first Lufthansa, but as Lufthansa Group for… | weak: too long (over 200 characters): search results cut it |
| 85 | /xx/en/program/partner-plus-benefit/cash-and-points | PartnerPlusBenefit*, the Lufthansa Group’s free corporate bonus program, offers numerous benefits for companies related to everyday business… | fine |

## lh-brussels

| # | Path | Description on preview | Verdict |
| --- | --- | --- | --- |
| 1 | /be/en/book-a-flight/groups-and-charter/groups/group-travel-request | This web form is for private groups only. We invite travel agents to book via our B2B solution or contact a consolidator. | fine |
| 2 | /be/en/contact/local-offices | Please note that service fees may apply for tickets purchased via the Service Centre and ticket desks. We are available 24/7 in English | weak: a side note (service fees), not the page's subject |
| 3 | /be/en/extra-services/travel-insurances | Residents of Austria, Belgium, Germany, Spain, France, Italy, the Netherlands & Portugal only: | weak: a lead-in to a list (ends with a colon) |
| 4 | /be/en/extra-services/upgrades/terms-and-conditions-upgrade | Fixed price upgrade in online check-in can be obtained under the following conditions: | weak: a lead-in to a list (ends with a colon) |
| 5 | /be/en/farealert/unsubscribe-failure | Either the link was invalid or a technical error occured. Please go back to the email and try to click on the link again. | fine |
| 6 | /be/en/farealert/unsubscribe-success | We will send you no more emails for this subscription. It can take up to 24 hours until this becomes effective. | fine |
| 7 | /be/en/local-page/chase-the-sun-across-spain | Spain is Europe's most-loved summer destination for good reason. Warm evenings, world-class food, iconic architecture, and beaches that stre… | fine |
| 8 | /be/en/local-page/offers | Discover our latest promotions, lowest fares and last-minute deals. | fine |
| 9 | /be/en/special-care/families-and-children/baby-and-child-equipment/child-restraint-devices | Child Restraint Devices (CRDs) are accepted on board Brussels Airlines flights with the following labels: | weak: a lead-in to a list (ends with a colon) |
| 10 | /be/fr/extra-services/travel-insurances | Uniquement pour les personnes résidant en Autriche, en Belgique, en Allemagne, en Espagne, en France, en Italie, aux Pays-Bas et au Portugal… | weak: a lead-in to a list (ends with a colon) |
| 11 | /be/fr/extra-services/upgrades/terms-and-conditions-upgrade | Les réservations de surclassement à prix fixe lors de l’enregistrement en ligne peuvent être obtenues aux conditions suivantes : | weak: a lead-in to a list (ends with a colon) |
| 12 | /be/fr/farealert/unsubscribe-failure | Le lien n’était pas valide ou une erreur technique s’est produite. Consultez à nouveau l’e-mail et essayez de cliquer à nouveau sur le lien. | fine |
| 13 | /be/fr/farealert/unsubscribe-success | Nous ne vous enverrons plus d’e-mail pour cet abonnement. La désinscription peut prendre jusqu'à 24 heures. | fine |
| 14 | /be/fr/local-page/offers | Découvrez nos dernières promotions, nos tarifs les plus bas et nos offres de dernière minute. | fine |
| 15 | /be/fr/special-care/families-and-children/baby-and-child-equipment/child-restraint-devices | Les dispositifs de retenue pour enfants (DRE) suivants sont acceptés à bord des vols Brussels Airlines : | weak: a lead-in to a list (ends with a colon) |
| 16 | /be/nl/extra-services/upgrades/terms-and-conditions-upgrade | Een upgrade tegen een vaste prijs bij het online inchecken kan worden verkregen onder de volgende voorwaarden: | weak: a lead-in to a list (ends with a colon) |
| 17 | /be/nl/farealert/unsubscribe-failure | De link was ongeldig of er is een technische fout opgetreden. Probeer het nog eens door op de link in de e-mail te klikken. | fine |
| 18 | /be/nl/farealert/unsubscribe-success | We sturen je geen e-mails meer voor deze Best price alert. Het kan tot 24 uur duren voordat dit van kracht wordt. | fine |
| 19 | /be/nl/local-page/offers | Ontdek onze nieuwste deals, laagste tarieven en last-minute aanbiedingen. | fine |
| 20 | /be/nl/special-care/families-and-children/baby-and-child-equipment/child-restraint-devices | Kinderbeveiligingssystemen met de volgende labels zijn toegestaan aan boord van de vluchten van Brussels Airlines: | weak: a lead-in to a list (ends with a colon) |
| 21 | /bf/en/local-page/an-unforgettable-reunion | Ophélia and Lionel are two ambitious students from Benin who have chosen to study in France. | fine |
| 22 | /bf/fr/contact/feedback/general/loyalty-programs | Consultez le site Miles & More pour en savoir plus sur le programme, l’inscription à celui-ci et la réclamation rétroactive de miles. | fine |
| 23 | /bf/fr/local-page/retrouvailles-inoubliables | Ophélia et Lionel sont deux étudiants béninois ambitieux qui ont choisi de poursuivre leurs études en France. | fine |
| 24 | /cm/en/local-page/an-unforgettable-reunion | Ophélia and Lionel are two ambitious students from Benin who have chosen to study in France. | fine |
| 25 | /cm/fr/local-page/retrouvailles-inoubliables | Ophélia et Lionel sont deux étudiants béninois ambitieux qui ont choisi de poursuivre leurs études en France. | fine |
| 26 | /de/de/extra-services/upgrades/terms-and-conditions-upgrade | Festpreis-Upgrades beim Online Check-in sind unter den folgenden Voraussetzungen erhältlich: | weak: a lead-in to a list (ends with a colon) |
| 27 | /de/de/farealert/unsubscribe-failure | Möglicherweise war der Link ungültig oder ein technischer Fehler ist aufgetreten. Bitte versuchen Sie nochmal, den Link in der E-Mail anzukl… | fine |
| 28 | /de/de/farealert/unsubscribe-success | Sie erhalten keine E-Mails mehr für diesen Best price alert. Es kann bis zu 24 Stunden dauern, bis Ihre Abmeldung wirksam wird. | fine |
| 29 | /de/de/special-care/families-and-children/baby-and-child-equipment/child-restraint-devices | Kinder-Rückhalteeinrichtungen mit folgenden Merkmalen sind an Bord von Brussels-Airlines-Flügen genehmigt: | weak: a lead-in to a list (ends with a colon) |
| 30 | /es/es/extra-services/upgrades/terms-and-conditions-upgrade | El upgrade a precio fijo en la facturación online se puede obtener bajo las siguientes condiciones: | weak: a lead-in to a list (ends with a colon) |
| 31 | /es/es/special-care/families-and-children/baby-and-child-equipment/child-restraint-devices | A bordo de los vuelos de Brussels Airlines se aceptan sistemas de retención infantil (SRI) con las siguientes etiquetas: | weak: a lead-in to a list (ends with a colon) |
| 32 | /it/it/extra-services/upgrades/terms-and-conditions-upgrade | È possibile ottenere un upgrade a prezzo fisso con il check-in online alle seguenti condizioni: | weak: a lead-in to a list (ends with a colon) |
| 33 | /it/it/farealert/unsubscribe-failure | Il link non era valido oppure si è verificato un errore tecnico. | fine |
| 34 | /it/it/farealert/unsubscribe-success | Non ti invieremo più email per questo abbonamento. Possono essere necessarie fino a 24 ore affinché la modifica diventi effettiva. | fine |
| 35 | /it/it/special-care/families-and-children/baby-and-child-equipment/child-restraint-devices | I Dispositivi di Ritenuta per Bambini (DRB) vengono accettati a bordo dei voli Brussels Airlines se presentano le seguenti etichette: | weak: a lead-in to a list (ends with a colon) |

## lh-cargo

| # | Path | Description on preview | Verdict |
| --- | --- | --- | --- |
| 1 | /de/ci/environmental | Wir sind in der ganzen Welt unterwegs – und zu Hause. Deshalb gehören globale Verantwortung und nachhaltiges, zukunftsgerichtetes Handeln zu… | fine |

## lh-discover

| # | Path | Description on preview | Verdict |
| --- | --- | --- | --- |
| 1 | /de/de/book/assistance-requirements/accessible-travel/register-assistance-requirements-online/error | Beim Absenden des Formulars ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut. | fine |
| 2 | /de/de/book/baggage/sports-baggage-and-special-baggage/add-sports-baggage/error | Beim Absenden des Formulars ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut. | fine |
| 3 | /de/de/book/baggage/sports-baggage-and-special-baggage/register-ammunition/error | Beim Absenden des Formulars ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut. | fine |
| 4 | /de/de/book/baggage/sports-baggage-and-special-baggage/register-hunting-firearm/error | Beim Absenden des Formulars ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut. | fine |
| 5 | /de/de/book/baggage/sports-baggage-and-special-baggage/register-sporting-firearm/error | Beim Absenden des Formulars ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut. | fine |
| 6 | /de/de/book/special-requests/pets/animal-cargo-hold/register-animal-cargo-hold/error | Beim Absenden des Formulars ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut. | fine |
| 7 | /de/de/book/special-requests/pets/animal-in-cabin/register-animal-cabin/error | Beim Absenden des Formulars ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut. | fine |
| 8 | /de/de/my-bookings/manage/customer-service/contact-form/error | Beim Absenden des Formulars ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut. | fine |
| 9 | /de/en/book/baggage/sports-baggage-and-special-baggage/add-sports-baggage/error | An error occurred during submission of the form. Please try again. | fine |
| 10 | /de/en/book/baggage/sports-baggage-and-special-baggage/register-ammunition/error | An error occurred during submission of the form. Please try again. | fine |
| 11 | /de/en/book/baggage/sports-baggage-and-special-baggage/register-hunting-firearm/error | An error occurred during submission of the form. Please try again. | fine |
| 12 | /de/en/book/baggage/sports-baggage-and-special-baggage/register-sporting-firearm/error | An error occurred during submission of the form. Please try again. | fine |
| 13 | /de/en/book/special-requests/pets/animal-cargo-hold/register-animal-cargo-hold/error | An error occurred during submission of the form. Please try again. | fine |
| 14 | /de/en/cancun-promotion | Fly with Discover Airlines to Cancun in Premium Economy Class from €999 or in Business Class from €1,999. Book by 30 September 2026. | fine |
| 15 | /de/en/my-bookings/manage/customer-service/contact-form/error | An error occurred while submitting the form. Please try again. | fine |
| 16 | /xx/fr/book/assistance-requirements/accessible-travel/register-assistance-requirements-online/error | Une erreur s’est produite lors de la soumission du formulaire. Veuillez réessayer. | fine |
| 17 | /xx/fr/book/baggage/sports-baggage-and-special-baggage/add-sports-baggage/error | Une erreur s’est produite lors de la soumission du formulaire. Veuillez réessayer. | fine |
| 18 | /xx/fr/book/baggage/sports-baggage-and-special-baggage/register-ammunition/error | Une erreur s’est produite lors de la soumission du formulaire. Veuillez réessayer. | fine |
| 19 | /xx/fr/book/baggage/sports-baggage-and-special-baggage/register-hunting-firearm/error | Une erreur s’est produite lors de la soumission du formulaire. Veuillez réessayer. | fine |
| 20 | /xx/fr/book/baggage/sports-baggage-and-special-baggage/register-sporting-firearm/error | Une erreur s’est produite lors de la soumission du formulaire. Veuillez réessayer. | fine |
| 21 | /xx/fr/book/special-requests/pets/animal-cargo-hold/register-animal-cargo-hold/error | Une erreur s’est produite lors de la soumission du formulaire. Veuillez réessayer. | fine |
| 22 | /xx/fr/my-bookings/manage/customer-service/contact-form/error | Une erreur s’est produite lors de la soumission du formulaire. Veuillez réessayer. | fine |

## lh-ita

| # | Path | Description on preview | Verdict |
| --- | --- | --- | --- |
| 1 | /bg/en/legal/group-travel-terms-and-conditions | Required group size: At least ten people travelling together on the same outbound and return flights. | fine |
| 2 | /it/it/local-page/carta-giovani-nazionale-sconto15 | *Lo sconto si applica esclusivamente sulla componente tariffaria (supplementi e tasse escluse). | weak: a footnote |
| 3 | /it/it/local-page/mete-estive | Grecia, Spagna e Francia: scegli tra tante destinazioni per il 2027! | fine |
| 4 | /it/it/local-page/policlinico-gemelli | Sconto dell’8% sui voli ITA Airways dall’Italia verso tutte le destinazioni, per viaggi in classe Economy (tariffa Light esclusa), Premium E… | fine |
| 5 | /it/it/local-page/privacy-survey | INFORMATIVA PRIVACY (ART. 13 Reg. EU 2016/679 e D.Lgs. 196/03 e ss.mm. ii D.Lgs. 101/2018) | weak: a title in capitals with its legal references |
| 6 | /jp/ja/book-and-prepare/offers/territorial-continuity/alghero | アルゲーロへ、ミラノ・リナーテ空港やローマ・フィウミチーノ空港から向かいましょう。息をのむ絶景、白砂のビーチ、澄み切った海、豊かな歴史・芸術遺産を誇るサルデーニャ島への旅を満喫するチャンスです。 ローマかミラノでの乗り継ぎが便利。イタリアや海外各地、どこからでもアルゲーロにアクセ… | weak: too long (over 200 characters): search results cut it |
| 7 | /jp/ja/legal/data-protection-overview/data-protection-ita | 最終更新：2025年1月21日 | weak: a date line (the last update) |
| 8 | /jp/ja/spring-offer | 春の心地よい気候の中、4月と5月にイタリアやヨーロッパへの特別な旅を計画してみませんか。 歴史と現代が調和する永遠の都ローマから、数々の魅力的な目的地へと旅が広がります。 | fine |
| 9 | /mt/en/legal/group-travel-terms-and-conditions | Required group size: At least ten people travelling together on the same outbound and return flights. | fine |
| 10 | /nl/nl/spring-offer | Profiteer van de lente en plan vooruit een onvergetelijke Italiaanse vakantie in april en mei. | fine |
| 11 | /us/en/book-and-prepare/other-requests/accessible-travel-us/disability-in-air-travel | OBTAINING A COPY OF 14 CFR PART 382, NONDISCRIMINATION ON THE BASIS OF DISABILITY IN AIR TRAVEL | weak: a section title in capitals |

## lh-swiss

| # | Path | Description on preview | Verdict |
| --- | --- | --- | --- |
| 1 | /at/en/local-page/group-travel/condition-group-travel | Minimum group size required: at least ten people who travel there and back together. | fine |
| 2 | /br/pt/customer-support/flight-voucher/flight-voucher-portal | Pode fazer início de sessão com a sua Travel ID ou com o seu código de reserva. | fine |
| 3 | /ca/en/local-page/swiss-student-fares | To access the additional benefits, you must be logged into your Travel ID account and have your student status verified through SWISS's plat… | weak: a side condition, not the page's subject |
| 4 | /ch/de/book-and-manage/corporate-customers/group-travel-and-charter/group-travel/condition-group-travel | Erforderliche Gruppengröße: Mindestens zehn Personen, die gemeinsam hin- und zurückreisen. | fine |
| 5 | /ch/de/book-and-manage/corporate-customers/group-travel-and-charter/group-travel/group-travel-request-success | Vielen Dank für Ihre Anfrage. | weak: a thank-you line; the next line says what follows |
| 6 | /ch/de/book-and-manage/corporate-customers/group-travel-and-charter/rent-a-plane/rent-a-plane-success | Sehr geehrte Damen und Herren | weak: a letter's salutation |
| 7 | /ch/de/customer-support/contact-us/general-request/general-request-success | Sehr geehrte Kundin Sehr geehrter Kunde | weak: a letter's salutation |
| 8 | /ch/de/customer-support/contact-us/technical-support/technical-support-success | Sehr geehrte Kundin | weak: a letter's salutation |
| 9 | /ch/de/customer-support/faq/help-3d-secure | Anlässlich der neuen EU Richtlinie für Zahlungen haben wir unsere Sicherheitsstandards erhöht. Damit garantieren wir, dass online Zahlungen … | fine |
| 10 | /ch/de/local-page/group-travel/condition-group-travel | Erforderliche Gruppengröße: Mindestens zehn Personen, die gemeinsam hin- und zurückreisen. | fine |
| 11 | /ch/de/local-page/montreux-jazz-festival-2023/merci-pour-votre-participation | Die Gewinner werden nach der Verlosung via E-Mail kontaktiert. | fine |
| 12 | /ch/el/book-and-manage/corporate-customers/company-offers/corporate-contracts/company-offers-contact-form/company-offers-contact-form-success | Ευχαριστούμε για τις πληροφορίες σας. | weak: a thank-you line; the next line says what follows |
| 13 | /ch/el/book-and-manage/corporate-customers/group-travel-and-charter/group-travel/group-travel-request-success | Σας ευχαριστούμε για το αίτημά σας. | weak: a thank-you line; the next line says what follows |
| 14 | /ch/el/book-and-manage/corporate-customers/group-travel-and-charter/rent-a-plane/rent-a-plane-success | Αγαπητοί κυρίες και κύριοι | weak: a letter's salutation |
| 15 | /ch/el/customer-support/contact-us/general-request/general-request-success | Αγαπητέ πελάτη, | weak: a letter's salutation |
| 16 | /ch/el/customer-support/contact-us/technical-support/technical-support-success | Αγαπητέ πελάτη, | weak: a letter's salutation |
| 17 | /ch/el/terms-conditions/terms-conditions | Διαβάστε προσεκτικά τους παρόντες όρους και προϋποθέσεις χρήσης και τις νομικές πληροφορίες (εφεξής «Όροι και Προϋποθέσεις Χρήσης») προτού χ… | fine |
| 18 | /ch/en/book-and-manage/corporate-customers/group-travel-and-charter/group-travel/condition-group-travel | Minimum group sizes: Minimum ten people who travel there and back together. | fine |
| 19 | /ch/en/book-and-manage/corporate-customers/group-travel-and-charter/group-travel/group-travel-request-success | Thank you for your request. | weak: a thank-you line; the next line says what follows |
| 20 | /ch/en/book-and-manage/corporate-customers/group-travel-and-charter/rent-a-plane/rent-a-plane-success | Dear customer, | weak: a letter's salutation |
| 21 | /ch/en/customer-support/contact-us/general-request/general-request-success | Dear Customer, | weak: a letter's salutation |
| 22 | /ch/en/customer-support/contact-us/technical-support/technical-support-success | Dear Customer, | weak: a letter's salutation |
| 23 | /ch/en/local-page/48h-a-athenes2 | Explore the best of Athens in 48 hours with this comprehensive itinerary, perfect for first-time visitors and history lovers alike. | fine |
| 24 | /ch/en/local-page/gewinnspiel-zermatt-unplugged-2024 | To share the joy of music with you, SWISS is giving away 2x2 tickets for Zermatt Unplugged 2024. | fine |
| 25 | /ch/en/local-page/gewinnspiel-zermatt-unplugged-2024/terms-and-conditions | The raffle is organised by Swiss International Air Lines AG (hereinafter "SWISS"). | fine |
| 26 | /ch/en/local-page/montreux-jazz-festival-2026/merci-pour-votre-participation | Winners will be contacted by e-mail following the draw. | fine |
| 27 | /ch/en/local-page/newsletter-sustainability/thank-you-for-your-subscription | Your subscription to our sustainability news has been successfully received. | fine |
| 28 | /ch/en/local-page/swiss-nati-women/conditions1 | Switzerland - Israel match on 13 October 2026 in Sion | fine |
| 29 | /ch/en/various/gva-2022-inspiration | Thank you for your confirmation. In the coming weeks you will receive our inspiring ideas and best offers for a summer getaway. | fine |
| 30 | /ch/es/book-and-manage/corporate-customers/group-travel-and-charter/group-travel/group-travel-request-success | Muchas gracias por su solicitud. | weak: a thank-you line; the next line says what follows |
| 31 | /ch/es/book-and-manage/corporate-customers/group-travel-and-charter/rent-a-plane/rent-a-plane-success | Sehr geehrte Damen und Herren | weak: a letter's salutation |
| 32 | /ch/es/customer-support/contact-us/general-request/general-request-success | Estimado/a cliente: | weak: a letter's salutation |
| 33 | /ch/es/customer-support/contact-us/technical-support/technical-support-success | Estimado/a cliente: | weak: a letter's salutation |
| 34 | /ch/es/customer-support/travel-and-corona/free-neighbouring-seat | A veces todos necesitamos un poco más espacio. Reserve el asiento contiguo desde 40 CHF y disfrute de ese pequeño lujo . | fine |
| 35 | /ch/es/terms-conditions/terms-conditions | Lea minuciosamente las presentes instrucciones de uso y las indicaciones legales (en adelante, "condiciones de uso") antes de utilizar el si… | fine |
| 36 | /ch/fr/customer-support/contact-us/general-request/general-request-success | Chère Madame, Cher Monsieur, | weak: a letter's salutation |
| 37 | /ch/fr/customer-support/contact-us/technical-support/technical-support-success | Chère Madame, | weak: a letter's salutation |
| 38 | /ch/fr/local-page/montreux-jazz-festival-2026/merci-pour-votre-participation | Les gagnants seront contactés par e-mail à la suite du tirage au sort. | fine |
| 39 | /ch/fr/local-page/newsletter-sustainability/merci-pour-votre-participation | Nous avons bien pris en compte votre inscription à nos actualités liées au développement durable. | fine |
| 40 | /ch/fr/local-page/swiss-nati-women/conditions | Concours match Suisse - Israël du 13 octobre 2026 à Sion | fine |
| 41 | /ch/fr/local-page/swiss-nati-women/conditions1 | Concours match Suisse - Irlande du Nord du 3 mars 2026 à Lausanne | fine |
| 42 | /ch/fr/terms-conditions/terms-conditions | Avant d’utiliser ce site Internet, veuillez lire attentivement ces Conditions générales d’utilisation et informations juridiques (désignées … | fine |
| 43 | /ch/it/customer-support/contact-us/general-request/general-request-success | Gentile Signora Egregio Signore | weak: a letter's salutation |
| 44 | /ch/it/customer-support/contact-us/technical-support/technical-support-success | Gentile Signora | weak: a letter's salutation |
| 45 | /ch/ja/book-and-manage/conditions/affiliate-partner-program-conditions | パブリッシャーとなる方は、ウェブサイトをお持ちでなければなりません。Ｅメールでのお申込みだけでは受諾されません。 | fine |
| 46 | /ch/ja/book-and-manage/conditions/compensation-voucher-conditions | SWISSの補償バウチャー（以下「補償バウチャー」といいます）は、Swiss International Air Lines AG, Malzgasse 15, CH-4052 Basel（以下「SWISS」といいます）のオファーです。補償バウチャーは、EU規定261/2004、… | fine |
| 47 | /ch/ja/book-and-manage/conditions/redemption-of-multiple-vouchers | swiss.comでフライトを予約する際、「お支払い情報」の段階で、お持ちのバウチャーにより、支払いオプションとして「バウチャー」を選択することができます。その後、予約ごとに最大3枚のバウチャーをご利用いただけるようになります。それらのバウチャーは、種類や金額が異なっていても問題… | fine |
| 48 | /ch/ja/book-and-manage/corporate-customers/company-offers/corporate-contracts/company-offers-contact-form | 企業、事業者、団体のお客様向けお問い合わせフォーム | weak: repeats the page title; the next paragraph describes the page |
| 49 | /ch/ja/book-and-manage/corporate-customers/group-travel-and-charter/rent-a-plane/rent-a-plane-success | Sehr geehrte Damen und Herren | weak: a letter's salutation |
| 50 | /ch/ja/customer-support/contact-us/feedback-past-flight | お困りごとについてお問い合わせをいただきありがとうございます。 迅速な対応をさせていただくために、内容をフォームにご記入ください。すべての情報を入力したことを確認してから送信してください。 | fine |
| 51 | /ch/ja/customer-support/contact-us/general-request/general-request-success | お客様へ | weak: a letter's salutation |
| 52 | /ch/ja/customer-support/contact-us/technical-support/technical-support-success | お客様へ | weak: a letter's salutation |
| 53 | /ch/ja/customer-support/passenger-duty-united-kingdom | 2015年5月1日およびそれ以降の英国の空港からのすべての出発便について、英国航空機旅客税(APD)は、エコノミークラスにご搭乗される、2歳から11歳までのお子様には適用されていません。この情報に関して、弊社の予約システムは、すでに更新されており、航空機旅客税は課金されません。 | fine |
| 54 | /ch/ja/customer-support/travel-and-corona/free-neighbouring-seat | もう少しスペースが欲しい場合の便利なサービスです。CHF 40からお隣の座席を予約するだけで、さらに快適な空の旅をお楽しみいただけます。 | fine |
| 55 | /ch/ja/fly/airport/lounges/house-rules | チューリッヒ／ジュネーブ、2026年3月1日 | weak: a dateline (place and date) |
| 56 | /ch/ja/terms-conditions/terms-conditions | 当ウェブサイトをご利用になる前に、以下の利用規約と法律上の注意事項（以下「本規約」と言う。）をよくお読みください。 | fine |
| 57 | /ch/pt/book-and-manage/corporate-customers/group-travel-and-charter/group-travel/group-travel-request-success | Agradecemos por sua solicitação. | weak: a thank-you line; the next line says what follows |
| 58 | /ch/pt/book-and-manage/corporate-customers/group-travel-and-charter/rent-a-plane/rent-a-plane-success | Sehr geehrte Damen und Herren | weak: a letter's salutation |
| 59 | /ch/pt/customer-support/contact-us/general-request/general-request-success | Prezado/a cliente | weak: a letter's salutation |
| 60 | /ch/ru/book-and-manage/corporate-customers/group-travel-and-charter/group-travel/group-travel-request-success | Благодарим вас за запрос. | weak: a thank-you line; the next line says what follows |
| 61 | /ch/ru/book-and-manage/corporate-customers/group-travel-and-charter/rent-a-plane/rent-a-plane-success | Sehr geehrte Damen und Herren | weak: a letter's salutation |
| 62 | /ch/ru/customer-support/contact-us/general-request/general-request-success | Sehr geehrte Kundin Sehr geehrter Kunde | weak: a letter's salutation |
| 63 | /ch/ru/customer-support/contact-us/technical-support/technical-support-success | Sehr geehrte Kundin | weak: a letter's salutation |
| 64 | /ch/ru/customer-support/travel-and-corona/free-neighbouring-seat | Иногда нужно просто немного больше места. Подарите себе чуть больше комфорта и просто зарезервируйте соседнее место по цене от 40 CHF. | fine |
| 65 | /ch/ru/terms-conditions/terms-conditions | Перед началом пользования сайтом, внимательно прочтите настоящие Условия использования и правовые указания (далее - Условия). | fine |
| 66 | /ch/zh/book-and-manage/conditions/compensation-voucher-conditions | 瑞航补偿机票代金券（下称“补偿机票代金券”）是瑞士国际航空公司 (Swiss International Air Lines)(Malzgasse 15, CH-4052 Basel)（下称“瑞航”）提供的优惠。补偿机票代金券是根据欧盟理事会第 261/2004 号规则和旅客在航… | fine |
| 67 | /ch/zh/book-and-manage/conditions/redemption-of-multiple-vouchers | 手头准备好机票代金券后，您在 swiss.com 上预订航班时，可以在“您的付款信息”步骤选择“机票代金券”付款选项。然后您将可为每个预订兑换最多三张机票代金券。这些机票代金券的类型和价值可以不同。 | fine |
| 68 | /ch/zh/book-and-manage/corporate-customers/company-offers/corporate-contracts/company-offers-contact-form | 公司、企业和组织 – 联系表单 | weak: repeats the page title; the next paragraph describes the page |
| 69 | /ch/zh/book-and-manage/corporate-customers/group-travel-and-charter/rent-a-plane/rent-a-plane-success | Sehr geehrte Damen und Herren | weak: a letter's salutation |
| 70 | /ch/zh/customer-support/contact-us/feedback-past-flight | 感谢您抽出宝贵的时间向我们告知您的疑虑。 请填妥此表格，以便我们可以迅速处理您的询问。在提交询问之前，请核对并完整填写您的信息。 | fine |
| 71 | /ch/zh/customer-support/passenger-duty-united-kingdom | 自 2015 年 5 月 1 日起，凡 2 到 11 岁的儿童乘坐从英国机场起飞的经济舱，均免收英国机场离境税 (APD)。我们的订票系统已针对此信息进行更新，将不再收取离境税。 | fine |
| 72 | /ch/zh/customer-support/travel-and-corona/free-neighbouring-seat | 有时您需要的就是多一点点空间。只需 40 瑞士法郎起，即可预订相邻座位，让自己享受一点额外的舒适。 | fine |
| 73 | /ch/zh/fly/airport/lounges/house-rules | 苏黎世/日内瓦，2026 年 3 月 1 日 | weak: a dateline (place and date) |
| 74 | /ch/zh/prepare/special-care/accessible-travel/accessible-travel-form/accessible-travel-form-success | 非常感谢。我们已获取您的输入信息。正常情况下，我们会在当日与您联系。如果您于星期日发出询问请求，我们将在接下来的星期一与您联系。 | fine |
| 75 | /ch/zh/terms-conditions/terms-conditions | 在使用该网站之前，请务必仔细阅读下述使用条款和法律声明（以下简称“使用条款”）。 | fine |
| 76 | /cn/en/local-page/cnypromocode26 | Discover India | weak: two words (a flight-search box's eyebrow) |
| 77 | /cn/en/local-page/promocode-pe-business-lx-in | Save up to CNY 400 with promo code UPCLASS | fine |
| 78 | /cn/zh/local-page/cnypromocode26 | Discover India | weak: two words (a flight-search box's eyebrow) |
| 79 | /cn/zh/local-page/lx-cn-zh-tarmac-delay-contingency-plan | 瑞航中国大陆停机坪延误应急计划 | weak: repeats the page title; the next paragraph describes the page |
| 80 | /corporate/en/company/about-us/procurement/contact-corporate-procurement | We appreciate your interest in SWISS corporate procurement. To ensure a prompt and meaningful response, please provide relevant information … | fine |
| 81 | /dk/en/companion-special-2024 | Travel with a partner and save up to 30% on Premium Economy, 40% on Business and 50% on First Class tickets. | fine |
| 82 | /es/en/fly-friday22 | Looking to escape the winter or welcome in the spring elsewhere? | fine |
| 83 | /es/es/fly-friday22 | Looking to escape the winter or welcome in the spring elsewhere? | fine |
| 84 | /gb/en/companion-special-2024 | Travel with a partner and save up to 30% on Premium Economy, 40% on Business and 50% on First Class tickets. | fine |
| 85 | /hk/zh/compensation/flight-voucher/terms-of-use | 1. 一般规定 | weak: a numbered heading |
| 86 | /hr/en/fly-friday22 | Looking to escape the winter or welcome in the spring elsewhere? | fine |
| 87 | /kr/ko/book-and-manage/corporate-customers/company-offers/corporate-contracts/company-offers-contact-form | 기업, 사업체 및 기관 - 문의 양식 | weak: repeats the page title; the next paragraph describes the page |
| 88 | /kr/ko/book-and-manage/corporate-customers/group-travel-and-charter/group-travel/condition-group-travel | 최소 단체 규모: 함께 여행하고 귀국하는 최소 10인. | fine |
| 89 | /kr/ko/book-and-manage/corporate-customers/group-travel-and-charter/rent-a-plane/rent-a-plane-success | 친애하는 고객님께, | weak: a letter's salutation |
| 90 | /kr/ko/customer-support/contact-us/feedback-past-flight | 귀한 시간 내어 문의해 주셔서 감사합니다. 문의 사항을 신속하게 처리할 수 있도록 양식을 작성해 주세요. 문의를 제출하기 전에 정보를 확인하고 작성하세요. | fine |
| 91 | /kr/ko/customer-support/contact-us/general-request/general-request-success | 친애하는 고객님께, | weak: a letter's salutation |
| 92 | /kr/ko/local-page/hyundai26-application/hyundai26-application-thankyou | 감사합니다! | weak: a single word ("Thank you!") |
| 93 | /kr/ko/local-page/korea-customer-info | 보다 편리한 서비스 제공을 위해 스위스 항공 한국 고객을 위한 유용한 정보를 하기와 같이 정리하여 안내하오니 이용에 참고하시기 바랍니다. | fine |
| 94 | /kr/ko/offers | 스위스 항공 (SWISS)과 함께하는 프리미엄 유럽 여행 | fine |
| 95 | /kr/ko/terms-conditions/terms-conditions | 이 웹사이트를 이용하기 전에 이 이용 약관과 법적 정보(이하 ‘이용 약관’)를 주의 깊게 읽어보시기 바랍니다. | fine |
| 96 | /lu/fr/fly-friday22 | Envie de fuir l’hiver ou de savourer l'arrivée du printemps ailleurs? | fine |
| 97 | /medicalservices/de/aviation/before-the-flight/fear-of-flying | Obschon das Fliegen zu den sichersten Transportarten gehört, ist die Flugangst ein recht häufiges Problem. Wir empfehlen Ihnen folgende Mass… | weak: a lead-in to a list (ends with a colon) |
| 98 | /medicalservices/de/aviation/before-the-flight/the-medif-form-and-medical-certificates | In folgenden Fällen empfiehlt SWISS, dass Reisende ein ärztliches Zeugnis zu Handen der Flughafenbehörden mitführen: | weak: a lead-in to a list (ends with a colon) |
| 99 | /medicalservices/de/contact | SWISS Medical Services | weak: three words (the name) |
| 100 | /medicalservices/en/contact | SWISS Medical Services | weak: three words (the name) |
| 101 | /no/en/companion-special-2024 | Travel with a partner and save up to 30% on Premium Economy, 40% on Business and 50% on First Class tickets. | fine |
| 102 | /se/en/companion-special-2024 | Travel with a partner and save up to 30% on Premium Economy, 40% on Business and 50% on First Class tickets. | fine |
| 103 | /th/en/local-page/promo-code-th-europe3000-lx | Use promo code EUROPE3000 and enjoy THB 3,000 off your next booking. | fine |
| held | /in/en/local-page/termsandconditions | Here comes the “#FlyWithJazz Contest” to be hosted on https://www.facebook.com/flyswiss.in {full-width} | weak: held by the harness: names a Facebook URL, its style marker included |
