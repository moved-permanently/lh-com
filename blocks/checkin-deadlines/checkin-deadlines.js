import { getLocale, siteOrigin, serviceOrigin } from '../../scripts/locale.js';
import { readConfigRows, pick, toConfigKey } from '../../scripts/block-config.js';
import {
  CHECKIN_CABINS, checkinCountriesRequest, checkinAirportsRequest, checkinDeadlinesRequest,
  mapCheckinCountries, mapCheckinAirports, mapCheckinDeadlines, labelsRequest, fetchRequest,
} from '../../scripts/lh-api.js';
import { markSource, priceRetryDelay } from '../../scripts/lh-data.js';

/* ---------------------------------------------------------------------------------------------
 * Data contract. www's check-in deadline search (.checkindeadlinesearch >
 * .dcep-checkin-deadline-search, React "CheckinDeadlineSearch": 014527fd.chunk.js, its saga
 * 2dd051c3.chunk.js, container a13666a2.chunk.js on www.austrian.com, 2026-11-01) loads
 *   GET /service/api/labels/checkindeadlinesearch/{portal}/{lang}        UI strings
 *   GET /service/api/catalogs/checkin/info/countries                      the country select
 *   GET /service/api/catalogs/checkin/info/airports?country=AT            on a country
 *   GET /service/api/catalogs/checkin/info/deadlines?airport=VIE&isEconomy=true   on Search
 * (isEconomy: the class is ECE). All four are live-only routes of scripts/lh-data.js: on a demo
 * host directly on the brand's www when it answers cross-origin (scripts/locale.js serviceOrigin:
 * Austrian), else www.lufthansa.com, with the price routes' retries and one late try here; on the
 * airline's own host same-origin. Nothing recorded: a failed call shows the link to www's page.
 * ------------------------------------------------------------------------------------------- */

const P = 'checkindeadlinesearch.';
/** Block label → www's label key. */
const LIVE_KEYS = {
  heading: `${P}searchmask.default.headline`,
  'class label': `${P}searchmask.cabinClassGroup.label`,
  'economy label': `${P}searchmask.cabinClassGroup.optionECE`,
  'business label': `${P}searchmask.cabinClassGroup.optionFBE`,
  'country label': `${P}searchmask.countries.label`,
  'airport label': `${P}searchmask.airports.label`,
  'submit label': `${P}searchmask.default.submit`,
  'result heading': `${P}searchresults.default.headline`,
  'off airport heading': `${P}searchresults.default.offAirportHeadline`,
  'on airport heading': `${P}searchresults.default.onAirportHeadline`,
  'no results label': `${P}searchresults.default.noResults`,
  'loading label': `${P}searchresults.default.loading`,
  'loaded label': `${P}searchresults.default.loadingSuccess`,
  'failure label': `${P}searchresults.default.loadingFailure`,
  'service header': `${P}searchresults.airportInfo.serviceNameHeader`,
  'availability header': `${P}searchresults.airportInfo.availabilityHeader`,
  'deadline header': `${P}searchresults.airportInfo.deadlineHeader`,
  'link header': `${P}searchresults.airportInfo.linkHeader`,
  'drop-off deadline header': `${P}searchresults.airportInfo.pickupDeadlineHeader`,
  'drop-off location header': `${P}searchresults.airportInfo.pickupLocationHeader`,
  'terminal label': `${P}searchresults.summary.terminal`,
  'counter label': `${P}searchresults.summary.counter`,
  'deadline label': `${P}searchresults.summary.deadline`,
};
/** The services' names (serviceName) → www's label (014527fd.chunk.js checkinService[…]). */
const SERVICE_KEYS = {
  CIS_Label_31: 'online',
  CIS_Label_32: 'mobile',
  CIS_Label_33: 'automatic',
  CIS_Label_26: 'lateNight',
  CIS_Label_34: 'option1',
  option2: 'option2',
};
Object.entries(SERVICE_KEYS).forEach(([name, key]) => { LIVE_KEYS[`service ${name}`] = `${P}searchresults.serviceNames.${key}`; });
['0', '1', '2'].forEach((n) => { LIVE_KEYS[`availability ${n}`] = `${P}searchresults.availabilityTypes.${n}`; });

/** A service link www fills with the component's checkinLink (data-dcep). */
const OWN_CHECKIN_LINK = 'GET FROM AEM';

/** Built-in strings for labels that never load: English www's defaults, German www's os/de. */
const DEFAULT_LABELS = {
  en: {
    heading: 'Deadlines for checking in passengers and baggage',
    'class label': 'Choose your class of service',
    'economy label': 'Economy/Premium Economy Class',
    'business label': 'First/Business Class',
    'country label': 'Choose country',
    'airport label': 'Choose airport',
    'submit label': 'Display check-in data',
    'result heading': 'Airport {AIRPORT_NAME}',
    'off airport heading': 'Off-airport Services',
    'on airport heading': 'On-airport Services',
    'no results label': 'For this airport currently no information is available.',
    'loading label': 'Loading results...',
    'loaded label': 'Results loaded.',
    'failure label': 'Could not load results.',
    'service header': 'Check-in services',
    'availability header': 'available for',
    'deadline header': 'until (in min) prior departure',
    'link header': 'check-in at',
    'drop-off deadline header': 'Bag Drop-Off until (in min)',
    'drop-off location header': 'Bag Drop-Off Location',
    'terminal label': 'Terminal',
    'counter label': 'Check-in counter',
    'deadline label': 'Check-in Deadline (in min)',
    'service CIS_Label_31': 'Online Check-in',
    'service CIS_Label_32': 'Mobile Check-in',
    'service CIS_Label_33': 'Automatic Check-in',
    'service CIS_Label_26': 'Late Night Check-in',
    'service CIS_Label_34': 'Kiosk Check-in',
    'service option2': 'Check-in',
    'availability 0': 'not available',
    'availability 1': 'HON/SEN/FTL customers',
    'availability 2': 'all customers',
  },
  de: {
    heading: 'Check-in Annahmeschlusszeiten',
    'class label': 'Reiseklasse',
    'economy label': 'Economy/Premium Economy',
    'business label': 'Business/First',
    'country label': 'Land',
    'airport label': 'Flughafen',
    'submit label': 'Informationen finden',
    'result heading': 'Flughafen {AIRPORT_NAME}',
    'off airport heading': 'Online Check-in',
    'on airport heading': 'Check-in am Flughafen',
    'no results label': 'Für diesen Flughafen liegen derzeit keine Informationen vor.',
    'loading label': 'Ergebnisse werden geladen',
    'loaded label': 'Ergebnisse wurden geladen',
    'failure label': 'Ergebnisse konnten nicht geladen werden',
    'service header': 'Check-in Typ',
    'availability header': 'Passagiertyp',
    'deadline header': 'Deadline vor Abflug (in Min.)',
    'link header': 'Informationen',
    'drop-off deadline header': 'Gepäckabgabe Deadline vor Abflug (in Min.)',
    'drop-off location header': 'Gepäckannahmeschalter',
    'terminal label': 'Terminal',
    'counter label': 'Check-in Schalter',
    'deadline label': 'Check-in Deadline vor Abflug (in Min.)',
    'service CIS_Label_31': 'Online Check-in',
    'service CIS_Label_32': 'Mobile Check-in',
    'service CIS_Label_33': 'Automatischer Check-in',
    'service CIS_Label_26': 'Vorabend Check-in',
    'service CIS_Label_34': 'Check-in Automaten',
    'service option2': 'Check-in',
    'availability 0': 'nicht verfügbar',
    'availability 1': 'HON/SEN/FTL Passagiere',
    'availability 2': 'Alle Passagiere',
  },
  fr: {
    heading: 'Délai d’enregistrement et heure limite d’enregistrement des bagages',
    'class label': 'Classe de voyage',
    'economy label': 'Economy/Premium Economy Class',
    'business label': 'Business Class/First Class',
    'country label': 'Pays / Région',
    'airport label': 'Aéroport',
    'submit label': 'Afficher',
    'result heading': 'Aéroport {AIRPORT_NAME}',
    'off airport heading': 'Prestations hors aéroport',
    'on airport heading': 'Prestations dans l’aéroport',
    'no results label': 'Il n’y a pas d’information disponible actuellement pour cet aéroport.',
    'loading label': 'Résultats en cours de téléchargement',
    'loaded label': 'Les résultats ont été téléchargés',
    'failure label': 'Les résultats n’ont pas pu être téléchargés',
    'service header': 'Systèmes d’enregistrement',
    'availability header': 'disponible pour',
    'deadline header': 'avant le départ (en min)',
    'link header': 'Enregistrement à',
    'drop-off deadline header': 'Enregistrement des bagages jusqu’à (en minutes)',
    'drop-off location header': 'Lieu d’enregistrement des bagages',
    'terminal label': 'Terminal',
    'counter label': 'Comptoir d’enregistrement',
    'deadline label': 'Limite pour l’enregistrement (en minutes)',
    'service CIS_Label_31': 'Enregistrement',
    'service CIS_Label_32': 'Enregistrement sur téléphone portable',
    'service CIS_Label_33': 'Enregistrement automatique',
    'service CIS_Label_26': 'Enregistrement la veille au soir',
    'service CIS_Label_34': 'Enregistrement par bornes',
    'service option2': 'Enregistrement',
    'availability 0': 'non disponible',
    'availability 1': 'HON/SEN/FTL clients',
    'availability 2': 'tous clients',
  },
  es: {
    heading: 'Tiempos límite de Check-in y para la consigna del equipaje',
    'class label': 'Clase de servicio',
    'economy label': 'Economy/Premium Economy Class',
    'business label': 'Business Class/First Class',
    'country label': 'País/región',
    'airport label': 'Aeropuerto',
    'submit label': 'Mostrar',
    'result heading': 'Aeropuerto {AIRPORT_NAME}',
    'off airport heading': 'Servicios fuera del aeropuerto',
    'on airport heading': 'Servicios en el aeropuerto',
    'no results label': 'Actualmente no hay información disponible para este aeropuerto.',
    'loading label': 'Cargando resultados',
    'loaded label': 'Los resultados se han cargado',
    'failure label': 'Los resultados no se han podido cargar',
    'service header': 'Productos de facturación',
    'availability header': 'disponible para',
    'deadline header': 'antes de la salida del vuelo (en min.)',
    'link header': 'Facturación en',
    'drop-off deadline header': 'Entrega equipajes hasta (min.)',
    'drop-off location header': 'Lugar de entrega de equipajes',
    'terminal label': 'Terminal',
    'counter label': 'Mostrador de facturación',
    'deadline label': 'Tiempo límite para facturar',
    'service CIS_Label_31': 'Facturación Online',
    'service CIS_Label_32': 'Facturación vía teléfono móvil',
    'service CIS_Label_33': 'Facturación automática',
    'service CIS_Label_26': 'Facturación en la víspera',
    'service CIS_Label_34': 'Mostradores automáticos de facturación',
    'service option2': 'Facturación Online',
    'availability 0': 'no disponible',
    'availability 1': 'Clientes HON/SEN/FTL',
    'availability 2': 'Todos los clientes',
  },
  el: {
    heading: 'Προθεσμίες check-in επιβατών και αποσκευών',
    'class label': 'Επιλέξτε θέση ταξιδιού',
    'economy label': 'Economy/Premium Economy Class',
    'business label': 'First/Business Class',
    'country label': 'Επιλέξτε χώρα',
    'airport label': 'Επιλέξτε αεροδρόμιο',
    'submit label': 'Εμφάνιση στοιχείων check-in',
    'result heading': 'Αεροδρόμιο {AIRPORT_NAME}',
    'off airport heading': 'Υπηρεσίες εκτός αεροδρομίου',
    'on airport heading': 'Υπηρεσίες στο αεροδρόμιο',
    'no results label': 'Για αυτό το αεροδρόμιο δεν υπάρχουν προς το παρόν διαθέσιμες πληροφορίες.',
    'loading label': 'Φόρτωση αποτελεσμάτων...',
    'loaded label': 'Τα αποτελέσματα φορτώθηκαν.',
    'failure label': 'Δεν ήταν δυνατή η φόρτωση των αποτελεσμάτων.',
    'service header': 'Υπηρεσίες check-in',
    'availability header': 'διαθέσιμο για',
    'deadline header': 'έως (σε λεπτά) πριν από την αναχώρηση',
    'link header': 'check-in στο',
    'drop-off deadline header': 'Παράδοση αποσκευών έως (σε λεπτά)',
    'drop-off location header': 'Σημείο παράδοσης αποσκευών',
    'terminal label': 'Τερματικός σταθμός',
    'counter label': 'Γκισέ check-in',
    'deadline label': 'Προθεσμία check-in (σε λεπτά)',
    'service CIS_Label_31': 'Ηλεκτρονικό check-in',
    'service CIS_Label_32': 'Check-in μέσω κινητού',
    'service CIS_Label_33': 'Αυτόματο check-in',
    'service CIS_Label_26': 'Check-in το προηγούμενο βράδυ',
    'service CIS_Label_34': 'Check-in σε μηχάνημα αυτοεξυπηρέτησης',
    'service option2': 'Check-in',
    'availability 0': 'μη διαθέσιμο',
    'availability 1': 'Πελάτες HON/SEN/FTL',
    'availability 2': 'όλοι οι πελάτες',
  },
  it: {
    heading: 'Orari limite per il check-in di passeggeri e bagagli',
    'class label': 'Scelga la classe di viaggio',
    'economy label': 'Economy/Premium Economy Class',
    'business label': 'First/Business Class',
    'country label': 'Scelga il paese',
    'airport label': 'Scelga l’aeroporto',
    'submit label': 'Mostra i dati del check-in',
    'result heading': 'Aeroporto {AIRPORT_NAME}',
    'off airport heading': 'Servizi fuori dall’aeroporto',
    'on airport heading': 'Servizi in aeroporto',
    'no results label': 'Per questo aeroporto al momento non sono disponibili informazioni.',
    'loading label': 'Caricamento dei risultati...',
    'loaded label': 'Risultati caricati.',
    'failure label': 'Impossibile caricare i risultati.',
    'service header': 'Servizi di check-in',
    'availability header': 'disponibile per',
    'deadline header': 'fino a (in min) prima della partenza',
    'link header': 'check-in presso',
    'drop-off deadline header': 'Consegna bagagli fino a (in min)',
    'drop-off location header': 'Luogo di consegna bagagli',
    'terminal label': 'Terminal',
    'counter label': 'Banco check-in',
    'deadline label': 'Orario limite check-in (in min)',
    'service CIS_Label_31': 'Check-in online',
    'service CIS_Label_32': 'Check-in da mobile',
    'service CIS_Label_33': 'Check-in automatico',
    'service CIS_Label_26': 'Check-in la sera prima',
    'service CIS_Label_34': 'Check-in al chiosco',
    'service option2': 'Check-in',
    'availability 0': 'non disponibile',
    'availability 1': 'Clienti HON/SEN/FTL',
    'availability 2': 'tutti i clienti',
  },
  ja: {
    heading: '旅客および手荷物のチェックイン締切時刻',
    'class label': '搭乗クラスを選択',
    'economy label': 'エコノミークラス/プレミアムエコノミークラス',
    'business label': 'ファーストクラス/ビジネスクラス',
    'country label': '国を選択',
    'airport label': '空港を選択',
    'submit label': 'チェックイン情報を表示',
    'result heading': '{AIRPORT_NAME}空港',
    'off airport heading': '空港外のサービス',
    'on airport heading': '空港内のサービス',
    'no results label': 'この空港の情報は現在ありません。',
    'loading label': '結果を読み込んでいます...',
    'loaded label': '結果を読み込みました。',
    'failure label': '結果を読み込めませんでした。',
    'service header': 'チェックインサービス',
    'availability header': '対象',
    'deadline header': '出発前（分）まで',
    'link header': 'チェックイン場所',
    'drop-off deadline header': '手荷物預け締切（分）',
    'drop-off location header': '手荷物預け場所',
    'terminal label': 'ターミナル',
    'counter label': 'チェックインカウンター',
    'deadline label': 'チェックイン締切（分）',
    'service CIS_Label_31': 'オンラインチェックイン',
    'service CIS_Label_32': 'モバイルチェックイン',
    'service CIS_Label_33': '自動チェックイン',
    'service CIS_Label_26': '前夜チェックイン',
    'service CIS_Label_34': '自動チェックイン機',
    'service option2': 'チェックイン',
    'availability 0': '利用不可',
    'availability 1': 'HON/SEN/FTLのお客様',
    'availability 2': 'すべてのお客様',
  },
  ko: {
    heading: '승객 및 수하물 체크인 마감 시간',
    'class label': '탑승 클래스 선택',
    'economy label': '이코노미/프리미엄 이코노미 클래스',
    'business label': '퍼스트/비즈니스 클래스',
    'country label': '국가 선택',
    'airport label': '공항 선택',
    'submit label': '체크인 정보 표시',
    'result heading': '{AIRPORT_NAME} 공항',
    'off airport heading': '공항 외 서비스',
    'on airport heading': '공항 내 서비스',
    'no results label': '현재 이 공항에 대한 정보가 없습니다.',
    'loading label': '결과를 불러오는 중...',
    'loaded label': '결과를 불러왔습니다.',
    'failure label': '결과를 불러올 수 없습니다.',
    'service header': '체크인 서비스',
    'availability header': '이용 대상',
    'deadline header': '출발 전까지(분)',
    'link header': '체크인 장소',
    'drop-off deadline header': '수하물 위탁 마감(분)',
    'drop-off location header': '수하물 위탁 장소',
    'terminal label': '터미널',
    'counter label': '체크인 카운터',
    'deadline label': '체크인 마감(분)',
    'service CIS_Label_31': '온라인 체크인',
    'service CIS_Label_32': '모바일 체크인',
    'service CIS_Label_33': '자동 체크인',
    'service CIS_Label_26': '전날 밤 체크인',
    'service CIS_Label_34': '키오스크 체크인',
    'service option2': '체크인',
    'availability 0': '이용 불가',
    'availability 1': 'HON/SEN/FTL 고객',
    'availability 2': '모든 고객',
  },
  nl: {
    heading: 'Uiterste incheck- en bagageafgiftetijden',
    'class label': 'Kies uw reisklasse',
    'economy label': 'Economy/Premium Economy Class',
    'business label': 'First/Business Class',
    'country label': 'Kies een land',
    'airport label': 'Kies een luchthaven',
    'submit label': 'Incheckgegevens tonen',
    'result heading': 'Luchthaven {AIRPORT_NAME}',
    'off airport heading': 'Diensten buiten de luchthaven',
    'on airport heading': 'Diensten op de luchthaven',
    'no results label': 'Voor deze luchthaven is momenteel geen informatie beschikbaar.',
    'loading label': 'Resultaten laden...',
    'loaded label': 'Resultaten geladen.',
    'failure label': 'Resultaten konden niet worden geladen.',
    'service header': 'Incheckdiensten',
    'availability header': 'beschikbaar voor',
    'deadline header': 'tot (in min) voor vertrek',
    'link header': 'inchecken bij',
    'drop-off deadline header': 'Bagage afgeven tot (in min)',
    'drop-off location header': 'Locatie bagage afgeven',
    'terminal label': 'Terminal',
    'counter label': 'Incheckbalie',
    'deadline label': 'Uiterste inchecktijd (in min)',
    'service CIS_Label_31': 'Online inchecken',
    'service CIS_Label_32': 'Mobiel inchecken',
    'service CIS_Label_33': 'Automatisch inchecken',
    'service CIS_Label_26': 'Inchecken de avond ervoor',
    'service CIS_Label_34': 'Inchecken bij de zuil',
    'service option2': 'Inchecken',
    'availability 0': 'niet beschikbaar',
    'availability 1': 'HON/SEN/FTL-klanten',
    'availability 2': 'alle klanten',
  },
  pl: {
    heading: 'Terminy odprawy pasażerów i bagażu',
    'class label': 'Wybierz klasę podróży',
    'economy label': 'Economy/Premium Economy Class',
    'business label': 'First/Business Class',
    'country label': 'Wybierz kraj',
    'airport label': 'Wybierz lotnisko',
    'submit label': 'Pokaż dane odprawy',
    'result heading': 'Lotnisko {AIRPORT_NAME}',
    'off airport heading': 'Usługi poza lotniskiem',
    'on airport heading': 'Usługi na lotnisku',
    'no results label': 'Dla tego lotniska nie ma obecnie żadnych informacji.',
    'loading label': 'Wczytywanie wyników...',
    'loaded label': 'Wyniki wczytane.',
    'failure label': 'Nie udało się wczytać wyników.',
    'service header': 'Usługi odprawy',
    'availability header': 'dostępne dla',
    'deadline header': 'do (w min) przed wylotem',
    'link header': 'odprawa w',
    'drop-off deadline header': 'Nadanie bagażu do (w min)',
    'drop-off location header': 'Miejsce nadania bagażu',
    'terminal label': 'Terminal',
    'counter label': 'Stanowisko odprawy',
    'deadline label': 'Termin odprawy (w min)',
    'service CIS_Label_31': 'Odprawa online',
    'service CIS_Label_32': 'Odprawa mobilna',
    'service CIS_Label_33': 'Odprawa automatyczna',
    'service CIS_Label_26': 'Odprawa wieczorem w przeddzień',
    'service CIS_Label_34': 'Odprawa w kiosku',
    'service option2': 'Odprawa',
    'availability 0': 'niedostępne',
    'availability 1': 'Klienci HON/SEN/FTL',
    'availability 2': 'wszyscy klienci',
  },
  pt: {
    heading: 'Prazos de check-in de passageiros e bagagem',
    'class label': 'Escolha a classe de viagem',
    'economy label': 'Economy/Premium Economy Class',
    'business label': 'First/Business Class',
    'country label': 'Escolha o país',
    'airport label': 'Escolha o aeroporto',
    'submit label': 'Mostrar dados de check-in',
    'result heading': 'Aeroporto {AIRPORT_NAME}',
    'off airport heading': 'Serviços fora do aeroporto',
    'on airport heading': 'Serviços no aeroporto',
    'no results label': 'De momento, não há informações disponíveis para este aeroporto.',
    'loading label': 'A carregar resultados...',
    'loaded label': 'Resultados carregados.',
    'failure label': 'Não foi possível carregar os resultados.',
    'service header': 'Serviços de check-in',
    'availability header': 'disponível para',
    'deadline header': 'até (em min) antes da partida',
    'link header': 'check-in em',
    'drop-off deadline header': 'Entrega de bagagem até (em min)',
    'drop-off location header': 'Local de entrega de bagagem',
    'terminal label': 'Terminal',
    'counter label': 'Balcão de check-in',
    'deadline label': 'Prazo de check-in (em min)',
    'service CIS_Label_31': 'Check-in online',
    'service CIS_Label_32': 'Check-in móvel',
    'service CIS_Label_33': 'Check-in automático',
    'service CIS_Label_26': 'Check-in na véspera à noite',
    'service CIS_Label_34': 'Check-in em quiosque',
    'service option2': 'Check-in',
    'availability 0': 'indisponível',
    'availability 1': 'Clientes HON/SEN/FTL',
    'availability 2': 'todos os clientes',
  },
  ru: {
    heading: 'Сроки регистрации пассажиров и багажа',
    'class label': 'Выберите класс обслуживания',
    'economy label': 'Economy/Premium Economy Class',
    'business label': 'First/Business Class',
    'country label': 'Выберите страну',
    'airport label': 'Выберите аэропорт',
    'submit label': 'Показать данные регистрации',
    'result heading': 'Аэропорт {AIRPORT_NAME}',
    'off airport heading': 'Услуги вне аэропорта',
    'on airport heading': 'Услуги в аэропорту',
    'no results label': 'Для этого аэропорта информация в настоящее время отсутствует.',
    'loading label': 'Загрузка результатов...',
    'loaded label': 'Результаты загружены.',
    'failure label': 'Не удалось загрузить результаты.',
    'service header': 'Услуги регистрации',
    'availability header': 'доступно для',
    'deadline header': 'до (мин.) до вылета',
    'link header': 'регистрация в',
    'drop-off deadline header': 'Сдача багажа до (мин.)',
    'drop-off location header': 'Место сдачи багажа',
    'terminal label': 'Терминал',
    'counter label': 'Стойка регистрации',
    'deadline label': 'Окончание регистрации (мин.)',
    'service CIS_Label_31': 'Онлайн-регистрация',
    'service CIS_Label_32': 'Мобильная регистрация',
    'service CIS_Label_33': 'Автоматическая регистрация',
    'service CIS_Label_26': 'Регистрация накануне вечером',
    'service CIS_Label_34': 'Регистрация в киоске',
    'service option2': 'Регистрация',
    'availability 0': 'недоступно',
    'availability 1': 'Клиенты HON/SEN/FTL',
    'availability 2': 'все клиенты',
  },
  zh: {
    heading: '旅客和行李值机截止时间',
    'class label': '选择舱位等级',
    'economy label': '经济舱/超级经济舱',
    'business label': '头等舱/商务舱',
    'country label': '选择国家/地区',
    'airport label': '选择机场',
    'submit label': '显示值机信息',
    'result heading': '{AIRPORT_NAME}机场',
    'off airport heading': '机场外服务',
    'on airport heading': '机场内服务',
    'no results label': '该机场目前暂无信息。',
    'loading label': '正在加载结果...',
    'loaded label': '结果已加载。',
    'failure label': '无法加载结果。',
    'service header': '值机服务',
    'availability header': '适用对象',
    'deadline header': '起飞前（分钟）截止',
    'link header': '值机地点',
    'drop-off deadline header': '行李托运截止（分钟）',
    'drop-off location header': '行李托运地点',
    'terminal label': '航站楼',
    'counter label': '值机柜台',
    'deadline label': '值机截止时间（分钟）',
    'service CIS_Label_31': '网上值机',
    'service CIS_Label_32': '手机值机',
    'service CIS_Label_33': '自动值机',
    'service CIS_Label_26': '前一晚值机',
    'service CIS_Label_34': '自助值机机',
    'service option2': '值机',
    'availability 0': '不可用',
    'availability 1': 'HON/SEN/FTL 客户',
    'availability 2': '所有客户',
  },
};

/**
 * The block's strings: an authored row of the label's name, else www's label, else the built-in
 * one of the language (English for the others).
 * @param {Object<string, string>} live www's labels (labels/checkindeadlinesearch)
 * @param {Object} config result of readConfigRows
 * @param {string} lang page language
 */
export function checkinLabels(live, config, lang) {
  const defaults = DEFAULT_LABELS[lang] || DEFAULT_LABELS.en;
  return Object.fromEntries(Object.keys(DEFAULT_LABELS.en).map((key) => {
    const authored = config[toConfigKey(key)];
    if (authored && authored.text) return [key, authored.text];
    const value = live && LIVE_KEYS[key] && live[LIVE_KEYS[key]];
    if (typeof value === 'string' && value.trim()) return [key, value.trim()];
    return [key, defaults[key] || DEFAULT_LABELS.en[key]];
  }));
}

/** A link www may give: http(s) or a path; anything else is no link. */
const safeHref = (href) => (/^(https?:\/\/|\/)/i.test(String(href || '').trim()) ? String(href).trim() : '');

/**
 * The rows of a services table as www's (014527fd.chunk.js): the service's name from the labels,
 * who it is available for, the deadline, the link (GET FROM AEM: the page's check-in link; else
 * www's link; else its text), the bag drop-off deadline and location. A service www has no label
 * for and that carries nothing else (Brussels' CIS_Label_35) is left out.
 * @param {Array} services mapCheckinDeadlines' offAirport or atAirport
 * @param {Object<string, string>} labels checkinLabels
 * @param {string} checkinLink the Check-in link row
 */
export function serviceRows(services, labels, checkinLink) {
  return (services || []).map((s) => {
    let link = null;
    if (s.link === OWN_CHECKIN_LINK) {
      const href = safeHref(checkinLink);
      if (href) link = { href, text: s.linkText || checkinLink };
    } else if (safeHref(s.link)) {
      link = { href: safeHref(s.link), text: s.linkText || s.link };
    }
    return {
      name: labels[`service ${s.service}`] || '',
      availability: labels[`availability ${s.availability}`] || '',
      deadline: s.deadline || '',
      link,
      linkText: s.linkText || '',
      dropOffDeadline: s.dropOffDeadline || '',
      dropOffLocation: s.dropOffLocation || '',
    };
  }).filter((r) => r.name || r.deadline || r.link || r.linkText
    || r.dropOffDeadline || r.dropOffLocation);
}

/**
 * Settings of an authored block: the check-in link (www's data-dcep checkinLink, for the service
 * links www marks GET FROM AEM) and the link shown when www cannot be reached (default: www's page
 * of the same path, named with the heading label).
 */
export function readCheckinSettings(config) {
  const row = (key) => pick(config, key) || {};
  const checkin = row('check-in-link');
  const fallback = row('fallback');
  return {
    checkinLink: safeHref((checkin.link && checkin.link.getAttribute('href')) || checkin.text),
    fallback: fallback.link && safeHref(fallback.link.getAttribute('href'))
      ? { href: safeHref(fallback.link.getAttribute('href')), text: fallback.link.textContent.trim() }
      : null,
  };
}

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

/** www renders the explanation as HTML: kept are text, line breaks, emphasis and safe links. */
function appendRich(parent, html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const copy = (from, to) => [...from.childNodes].forEach((n) => {
    if (n.nodeType === 3) { to.append(document.createTextNode(n.textContent)); return; }
    if (n.nodeType !== 1) return;
    const tag = n.tagName.toLowerCase();
    if (tag === 'br') { to.append(document.createElement('br')); return; }
    if (['strong', 'b', 'em', 'i', 'p', 'span'].includes(tag)) {
      const keep = document.createElement(tag === 'p' ? 'span' : tag);
      copy(n, keep);
      to.append(keep);
      return;
    }
    if (tag === 'a' && safeHref(n.getAttribute('href'))) {
      const a = document.createElement('a');
      a.href = safeHref(n.getAttribute('href'));
      copy(n, a);
      to.append(a);
      return;
    }
    copy(n, to);
  });
  copy(tpl.content || tpl, parent);
}

let uid = 0;

/** A labelled select of the form (www's floating label: the label sits on the field). */
function field(name, id) {
  const wrap = el('div', `checkin-deadlines-field checkin-deadlines-${name}`);
  const label = el('label', 'checkin-deadlines-label');
  label.htmlFor = id;
  const box = el('div', 'checkin-deadlines-select');
  const select = el('select');
  select.id = id;
  select.name = name;
  select.required = true;
  box.append(select);
  wrap.append(label, box);
  return { wrap, label, select };
}

const option = (value, text) => {
  const o = el('option', '', text);
  o.value = value;
  return o;
};

/** The summary table (terminal, counter, deadline and explanation) of one check-in info. */
function summaryTable(info, labels, airportLabel) {
  const table = el('table', 'checkin-deadlines-summary');
  table.append(el('caption', 'checkin-deadlines-sr-only', airportLabel));
  const body = el('tbody');
  [['terminal label', info.terminal], ['counter label', info.counter], ['deadline label', info.deadline]]
    .forEach(([key, value], i) => {
      const tr = el('tr');
      const th = el('th', '', labels[key]);
      th.scope = 'row';
      const td = el('td', '', value);
      if (i === 2 && info.explanation) {
        td.append(document.createElement('br'));
        const span = el('span', 'checkin-deadlines-explanation');
        appendRich(span, info.explanation);
        td.append(span);
      }
      tr.append(th, td);
      body.append(tr);
    });
  table.append(body);
  return table;
}

/** A services table (www's maui-table: six columns, scrolling sideways on a narrow screen). */
function servicesTable(heading, rows, labels) {
  const section = el('div', 'checkin-deadlines-services');
  section.append(el('h3', '', heading));
  const wrap = el('div', 'checkin-deadlines-table-wrap');
  wrap.tabIndex = 0;
  wrap.setAttribute('role', 'region');
  wrap.setAttribute('aria-label', heading);
  const table = el('table', 'checkin-deadlines-table');
  const head = el('thead');
  const headRow = el('tr');
  ['service header', 'availability header', 'deadline header', 'link header', 'drop-off deadline header', 'drop-off location header']
    .forEach((key) => {
      const th = el('th', '', labels[key]);
      th.scope = 'col';
      headRow.append(th);
    });
  head.append(headRow);
  const body = el('tbody');
  rows.forEach((r) => {
    const tr = el('tr');
    const linkCell = el('td');
    if (r.link) {
      const a = el('a', '', r.link.text);
      a.href = r.link.href;
      linkCell.append(a);
    } else {
      linkCell.textContent = r.linkText;
    }
    tr.append(el('td', '', r.name), el('td', '', r.availability), el('td', '', r.deadline), linkCell, el('td', '', r.dropOffDeadline), el('td', '', r.dropOffLocation));
    body.append(tr);
  });
  table.append(head, body);
  wrap.append(table);
  section.append(wrap);
  return section;
}

/**
 * Loads and decorates the block. Rows (all optional): Check-in link | https://wci.austrian.com/…
 * (www's checkinLink), Fallback | <link to www's page>, any label ("Submit label | Search").
 * @param {Element} block
 */
export default async function decorate(block) {
  const locale = getLocale();
  const config = readConfigRows(block);
  const settings = readCheckinSettings(config);
  const origin = serviceOrigin();
  const call = (request) => fetchRequest(request, locale, { exact: true, origin });
  let labels = checkinLabels({}, config, locale.lang);
  const sources = {};
  let primary = ['countries'];
  const state = {
    countries: [], airports: [], search: 0, airportsFor: '',
  };
  uid += 1;
  const id = `checkin-deadlines-${uid}`;

  const form = el('form', 'checkin-deadlines-form');
  form.noValidate = true;
  const cabin = field('cabin', `${id}-cabin`);
  const country = field('country', `${id}-country`);
  const airport = field('airport', `${id}-airport`);
  const submit = el('button', 'checkin-deadlines-submit button primary');
  submit.type = 'submit';
  const actions = el('div', 'checkin-deadlines-actions');
  actions.append(submit);
  form.append(cabin.wrap, country.wrap, airport.wrap, actions);
  const status = el('p', 'checkin-deadlines-sr-only');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const results = el('div', 'checkin-deadlines-results');
  const message = el('p', 'checkin-deadlines-message');
  message.hidden = true;
  const fallback = el('p', 'checkin-deadlines-fallback');
  fallback.hidden = true;
  const fallbackLink = el('a');
  fallback.append(fallbackLink);
  block.replaceChildren(form, status, results, message, fallback);

  const setFallback = (show) => {
    const link = settings.fallback || { href: `${siteOrigin()}${window.location.pathname}`, text: labels.heading };
    fallbackLink.href = link.href;
    fallbackLink.textContent = link.text;
    fallback.hidden = !show;
  };
  const setMessage = (text) => {
    message.textContent = text || '';
    message.hidden = !text;
  };
  const valid = () => Boolean(cabin.select.value && country.select.value && airport.select.value);
  const updateSubmit = () => { submit.disabled = !valid(); };

  const relabel = () => {
    cabin.label.textContent = labels['class label'];
    country.label.textContent = labels['country label'];
    airport.label.textContent = labels['airport label'];
    submit.textContent = labels['submit label'];
    const chosen = cabin.select.value || CHECKIN_CABINS[0];
    cabin.select.replaceChildren(...CHECKIN_CABINS.map((c) => option(c, labels[c === 'ECE' ? 'economy label' : 'business label'])));
    cabin.select.value = chosen;
    if (!settings.fallback) setFallback(!fallback.hidden);
  };
  const fillCountries = () => {
    const chosen = country.select.value;
    country.select.replaceChildren(option('', ''), ...state.countries.map((c) => option(c.code, c.name)));
    country.select.value = chosen;
    country.select.disabled = !state.countries.length;
  };
  const fillAirports = () => {
    const chosen = airport.select.value;
    airport.select.replaceChildren(option('', ''), ...state.airports.map((a) => option(a.code, a.name)));
    airport.select.value = state.airports.some((a) => a.code === chosen) ? chosen : '';
    airport.select.disabled = !state.airports.length;
    updateSubmit();
  };

  // one late try per failed call (lh-data's price backoff decides when)
  const later = (route, fn) => {
    setTimeout(fn, priceRetryDelay([route]));
  };

  const loadLabels = async () => {
    try {
      const { data } = await call(labelsRequest('checkindeadlinesearch', locale));
      if (!data || typeof data !== 'object') throw new Error('no labels');
      labels = checkinLabels(data, config, locale.lang);
      sources.labels = 'live';
      relabel();
      return true;
    } catch (e) {
      sources.labels = sources.labels || 'none';
      return false;
    }
  };
  const loadCountries = async () => {
    try {
      const { data } = await call(checkinCountriesRequest());
      state.countries = mapCheckinCountries(data);
      if (!state.countries.length) throw new Error('no countries');
      sources.countries = 'live';
      fillCountries();
      form.hidden = false;
      setFallback(false);
      return true;
    } catch (e) {
      sources.countries = 'none';
      form.hidden = true;
      setFallback(true);
      return false;
    }
  };
  const loadAirports = async (code, late = false) => {
    state.airportsFor = code;
    state.airports = [];
    fillAirports();
    if (!code) return;
    const request = checkinAirportsRequest(code);
    try {
      const { data } = await call(request);
      if (state.airportsFor !== code) return;
      state.airports = mapCheckinAirports(data);
      sources.airports = 'live';
      fillAirports();
      setMessage('');
      setFallback(false);
    } catch (e) {
      if (state.airportsFor !== code) return;
      sources.airports = 'none';
      setMessage(labels['failure label']);
      setFallback(true);
      if (!late) {
        later(request.route, () => { if (state.airportsFor === code) loadAirports(code, true); });
      }
    }
  };

  const showResults = (infos, airportName) => {
    results.replaceChildren();
    setMessage('');
    if (!infos.length) {
      setMessage(labels['no results label']);
      return;
    }
    const heading = labels['result heading'].replace('{AIRPORT_NAME}', airportName);
    results.append(el('h2', 'checkin-deadlines-heading', heading));
    infos.forEach((info) => {
      const box = el('div', 'checkin-deadlines-info');
      box.append(summaryTable(info, labels, heading));
      [['off airport heading', info.offAirport], ['on airport heading', info.atAirport]].forEach(([key, services]) => {
        const rows = serviceRows(services, labels, settings.checkinLink);
        if (rows.length) box.append(servicesTable(labels[key], rows, labels));
      });
      results.append(box);
    });
  };
  const search = async (query, searchId, late = false) => {
    const request = checkinDeadlinesRequest(query);
    try {
      const { data } = await call(request);
      if (searchId !== state.search) return;
      sources.deadlines = 'live';
      showResults(mapCheckinDeadlines(data), query.airportName);
      setFallback(false);
      status.textContent = labels['loaded label'];
    } catch (e) {
      if (searchId !== state.search) return;
      sources.deadlines = 'none';
      results.replaceChildren();
      setMessage(labels['failure label']);
      setFallback(true);
      status.textContent = labels['failure label'];
      if (!late) {
        later(request.route, () => {
          if (searchId === state.search) search(query, searchId, true);
        });
      }
    } finally {
      if (searchId === state.search) {
        results.removeAttribute('aria-busy');
        markSource(block, sources, primary);
      }
    }
  };

  cabin.select.addEventListener('change', updateSubmit);
  country.select.addEventListener('change', () => loadAirports(country.select.value));
  airport.select.addEventListener('change', updateSubmit);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!valid()) return;
    state.search += 1;
    primary = ['deadlines'];
    const chosen = state.airports.find((a) => a.code === airport.select.value);
    status.textContent = labels['loading label'];
    results.setAttribute('aria-busy', 'true');
    search({
      airport: airport.select.value,
      cabin: cabin.select.value,
      airportName: chosen ? chosen.name : airport.select.value,
    }, state.search);
  });

  relabel();
  fillCountries();
  fillAirports();
  const [labelsOk, countriesOk] = await Promise.all([loadLabels(), loadCountries()]);
  markSource(block, sources, primary);
  if (!labelsOk) later(labelsRequest('checkindeadlinesearch', locale).route, () => loadLabels());
  if (!countriesOk) {
    later(checkinCountriesRequest().route, async () => {
      if (await loadCountries() && primary[0] === 'countries') markSource(block, sources, primary);
    });
  }
}
