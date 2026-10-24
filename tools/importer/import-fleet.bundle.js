/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-fleet.js
  var tmp_bundle_fleet_131377_exports = {};
  __export(tmp_bundle_fleet_131377_exports, {
    default: () => tmp_bundle_fleet_131377_default
  });

  // tools/importer/parsers/aem-path-map.js
  var AEM_PATHS = {
    "/at/de/discover-lufthansa/lufthansa-fleet/320": "/at/de/320",
    "/at/de/discover-lufthansa/lufthansa-fleet/32N": "/at/de/32n",
    "/at/de/discover-lufthansa/lufthansa-fleet/359": "/at/de/359",
    "/at/de/discover-lufthansa/lufthansa-fleet/744": "/at/de/744",
    "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs": "/at/de/accessible-travel",
    "/at/de/book-and-manage/additional-services": "/at/de/additional-services",
    "/at/de/during-your-trip/lounges/admission-rules": "/at/de/admission-rules",
    "/at/de/support/contact/adresses": "/at/de/adressen-weltweit",
    "/at/de/book-and-manage/advance-seat-reservation": "/at/de/advance-seat-reservation",
    "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/advice-special-needs-usa": "/at/de/advice-for-travellers-with-special-needs-to-and-from-the-usa",
    "/at/de/business-services/affiliate-marketing": "/at/de/affiliatemarketing",
    "/at/de/prepare-for-your-trip/all-check-in": "/at/de/all-check-in",
    "/at/de/prepare-for-your-trip/travelling-with-children/unaccompanied-minors": "/at/de/alleinreisende-kinder",
    "/at/de/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold": "/at/de/anmeldung-tiere-frachtraum",
    "/at/de/prepare-for-your-trip/airport-information/services-at-the-airport/arrival-services": "/at/de/arrival-services",
    "/at/de/prepare-for-your-trip/baggage/travelling-with-animals/assistance-dogs": "/at/de/assistenzhunde",
    "/at/de/prepare-for-your-trip/all-check-in/automatic-check-in": "/at/de/automatic-check-in",
    "/at/de/prepare-for-your-trip/baggage/baggage-irregularities": "/at/de/baggage-irregularities",
    "/at/de/book-and-manage/timetable-and-flight-status/most-significant-route": "/at/de/bedeutsamste-strecken",
    "/at/de/common/terms-and-conditions": "/at/de/befoerderungsbedingungen-group",
    "/at/de/common/terms-and-conditions/terms-of-service": "/at/de/befoerderungsbedingungen-lh",
    "/at/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus/terms-of-transport": "/at/de/besondere-befoerderungsbedingungen-bus",
    "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form": "/at/de/betreuungsbedarf",
    "/at/de/prepare-for-your-trip/travel-classes/upgrade-options/bid-upgrade": "/at/de/bid-upgrade",
    "/at/de/prepare-for-your-trip/airport-information/services-at-the-airport/boarding": "/at/de/boarding",
    "/at/de/discover-lufthansa/lufthansa-fleet/787": "/at/de/boeing787",
    "/at/de/prepare-for-your-trip/travel-classes/business-class/business-class-short-haul": "/at/de/business-class-auf-kurz-und-mittelstrecken",
    "/at/de/prepare-for-your-trip/travel-classes/business-class": "/at/de/business-class",
    "/at/de/book-and-manage/cancellation-and-refund": "/at/de/cancellations-and-refunds",
    "/at/de/common/payment-options/cash-and-miles": "/at/de/cash-and-miles",
    "/at/de/prepare-for-your-trip/all-check-in/check-in-baggage": "/at/de/check-in-baggage",
    "/at/de/common/privacy-statement/cookie-policy": "/at/de/cookie-policy",
    "/at/de/during-your-trip/food-and-beverages/culinary-journey": "/at/de/culinaryjourney",
    "/at/de/prepare-for-your-trip/baggage/travelling-with-animals/dangerous-dogs": "/at/de/dangerous-dogs",
    "/at/de/prepare-for-your-trip/entry-regulations/data-collection-usa": "/at/de/datenerfassung-fuer-die-usa",
    "/at/de/prepare-for-your-trip/entry-regulations/data-collection-canada": "/at/de/datenerfassung-fuer-kanada",
    "/at/de/common/privacy-statement": "/at/de/datenschutz",
    "/at/de/book-and-manage/digital-self-services": "/at/de/digital-self-services",
    "/at/de/book-and-manage/digital-self-services/digital-travel-companion": "/at/de/digital-travel-companion",
    "/at/de/prepare-for-your-trip/baggage/digital-baggage-services": "/at/de/digitale-gepaeckservices",
    "/at/de/prepare-for-your-trip/special-travel-needs/doctor-on-board/doctor-on-board-news": "/at/de/doctor-on-board-news",
    "/at/de/prepare-for-your-trip/special-travel-needs/doctor-on-board": "/at/de/doctor-on-board",
    "/at/de/prepare-for-your-trip/travel-classes/economy-class": "/at/de/economy-class",
    "/at/de/prepare-for-your-trip/baggage/digital-baggage-services/electronic-bag-tags": "/at/de/electronic-bag-tags",
    "/at/de/prepare-for-your-trip/entry-regulations": "/at/de/entryprocesses",
    "/at/de/prepare-for-your-trip/travel-classes/europe-fares": "/at/de/europa-tarife-economy-class",
    "/at/de/discover-lufthansa/partners/rental-cars/europcar": "/at/de/europcar",
    "/at/de/book-and-manage/exclusive-charter": "/at/de/exclusive-charter",
    "/at/de/common/faq-data-security": "/at/de/faq-data-security",
    "/at/de/support/faq/faq-ejournals": "/at/de/faq-ejournals",
    "/at/de/common/faq-password-security": "/at/de/faq-password-security",
    "/at/de/support/feedback-past-flight": "/at/de/feedback-past-flight",
    "/at/de/support/feedback": "/at/de/feedback",
    "/at/de/prepare-for-your-trip/airport-information/frankfurt-airport/valet-parking-service": "/at/de/fia-valet-service",
    "/at/de/prepare-for-your-trip/travel-classes/first-class/first-class-lounges": "/at/de/first-class-lounges",
    "/at/de/prepare-for-your-trip/travel-classes/first-class/personal-assistant": "/at/de/first-class-personal-assistant",
    "/at/de/prepare-for-your-trip/travel-classes/first-class/first-class-terminal": "/at/de/first-class-terminal",
    "/at/de/prepare-for-your-trip/travel-classes/first-class/valet-parking-service": "/at/de/first-class-valet-parking-service",
    "/at/de/prepare-for-your-trip/travel-classes/first-class": "/at/de/first-class",
    "/at/de/prepare-for-your-trip/travelling-with-children/kids-babys-on-board/flying-with-babies": "/at/de/fliegen-mit-baby",
    "/at/de/prepare-for-your-trip/travelling-with-children": "/at/de/fliegen-mit-kindern",
    "/at/de/prepare-for-your-trip/travelling-with-children/kids-babys-on-board/flying-with-small-kids": "/at/de/fliegen-mit-kleinkind",
    "/at/de/book-and-manage/offers-and-destination": "/at/de/fluege",
    "/at/de/prepare-for-your-trip/airport-information": "/at/de/flughafeninformation",
    "/at/de/book-and-manage/timetable-and-flight-status": "/at/de/flugplan-und-flugstatus",
    "/at/de/book-and-manage/flights": "/at/de/flugsuche",
    "/at/de/book-and-manage/timetable-and-flight-status/flight-disruptions": "/at/de/flugunregelmaessigkeiten",
    "/at/de/during-your-trip/internet-on-board": "/at/de/flynet",
    "/at/de/prepare-for-your-trip/airport-information/munich-airport/valet-parking-service": "/at/de/fmg-valet-parking-service",
    "/at/de/prepare-for-your-trip/airport-information/frankfurt-airport/frankfurt-trade-fair": "/at/de/frankfurt-fair",
    "/at/de/book-and-manage/additional-services/share-now": "/at/de/free2move",
    "/at/de/prepare-for-your-trip/baggage/free-baggage": "/at/de/freigepaeck-regeln",
    "/at/de/prepare-for-your-trip/baggage/dangerous-goods": "/at/de/gefaehrliche-gegenstaende",
    "/at/de/prepare-for-your-trip/baggage": "/at/de/gepaeck",
    "/at/de/common/business-conditions": "/at/de/geschaeftsbedingungen",
    "/at/de/prepare-for-your-trip/special-travel-needs/travelling-healthy": "/at/de/gesund-reisen",
    "/at/de/prepare-for-your-trip/travel-classes/green-fare": "/at/de/green-fare",
    "/at/de/book-and-manage/group-travel": "/at/de/group-travel",
    "/at/de/book-and-manage/group-travel-and-charter": "/at/de/gruppenreisen-und-charter",
    "/at/de/prepare-for-your-trip/baggage/carry-on-baggage": "/at/de/handgepaeck",
    "/at/de/discover-lufthansa/partners/rental-cars/hertz": "/at/de/hertz",
    "/at/de/discover-lufthansa/partners/hotel": "/at/de/hotelangebote",
    "/at/de/common/imprint": "/at/de/impressum",
    "/at/de/common/privacy-statement/info": "/at/de/informationen-zum-datenschutz",
    "/at/de/prepare-for-your-trip/travelling-with-children/kids-babys-on-board": "/at/de/kinder-an-bord",
    "/at/de/during-your-trip/food-and-beverages/childrens-menus": "/at/de/kindermenues-an-bord",
    "/at/de/during-your-trip/lounges/lounge-companions": "/at/de/lounge-begleitung",
    "/at/de/during-your-trip/lounges": "/at/de/lounges",
    "/at/de/prepare-for-your-trip/airport-information/duesseldorf-airport": "/at/de/lufthansa-am-flughafen-duesseldorf",
    "/at/de/prepare-for-your-trip/airport-information/frankfurt-airport": "/at/de/lufthansa-am-flughafen-frankfurt",
    "/at/de/prepare-for-your-trip/airport-information/vienna-airport": "/at/de/lufthansa-am-flughafen-wien",
    "/at/de/prepare-for-your-trip/airport-information/berlin-airport": "/at/de/lufthansa-at-berlin-airport",
    "/at/de/prepare-for-your-trip/airport-information/zuerich-airport": "/at/de/lufthansa-at-zuerich-airport",
    "/at/de/discover-lufthansa/lufthansa-aviation-group": "/at/de/lufthansa-aviation-group",
    "/at/de/prepare-for-your-trip/travel-classes/business-class/business-class-long-haul": "/at/de/lufthansa-business-class-on-long-haul-routes",
    "/at/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus": "/at/de/lufthansa-express-bus",
    "/at/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail": "/at/de/lufthansa-express-rail",
    "/at/de/prepare-for-your-trip/getting-to-and-from-the-airport": "/at/de/lufthansa-express",
    "/at/de/business-services/for-corporate-customers": "/at/de/lufthansa-firmenkunden",
    "/at/de/prepare-for-your-trip/travel-classes/first-class/entertainment": "/at/de/lufthansa-first-class-entertainment",
    "/at/de/prepare-for-your-trip/travel-classes/first-class/fleet": "/at/de/lufthansa-first-class-flotte",
    "/at/de/prepare-for-your-trip/travel-classes/first-class/comfort": "/at/de/lufthansa-first-class-komfort",
    "/at/de/discover-lufthansa/lufthansa-group-airlines": "/at/de/lufthansa-group-star-alliance-and-partner-airlines",
    "/at/de/prepare-for-your-trip/airport-information/services-at-the-airport/guide-service": "/at/de/lufthansa-guide-service",
    "/at/de/prepare-for-your-trip/travel-classes": "/at/de/lufthansa-reiseklassen",
    "/at/de/prepare-for-your-trip/airport-information/munich-airport": "/at/de/lufthansa-terminal-muenchen",
    "/at/de/book-and-manage/additional-services/medication-transport": "/at/de/medikamenten-transport",
    "/at/de/business-services/for-corporate-customers/meetings-and-events": "/at/de/meetings-and-events",
    "/at/de/business-services/for-corporate-customers/meetings-and-events/organizer": "/at/de/meetings-und-events-individuelle-angebotsanfrage",
    "/at/de/business-services/for-corporate-customers/meetings-and-events/participant": "/at/de/meetings-und-events-teilnehmer",
    "/at/de/prepare-for-your-trip/travelling-with-children/kids-babys-on-board/my-logbook": "/at/de/mein-logbuch",
    "/at/de/book-and-manage/view-and-amend-flight-details": "/at/de/meine-buchungen",
    "/at/de/during-your-trip/food-and-beverages/menus-long-haul": "/at/de/menues-auf-langstreckenfluegen",
    "/at/de/during-your-trip/food-and-beverages/menus-travelclasses": "/at/de/menues-reiseklassen",
    "/at/de/discover-lufthansa/partners/rental-cars": "/at/de/mietwagenangebote",
    "/at/de/discover-lufthansa/miles-and-more": "/at/de/miles-and-more",
    "/at/de/prepare-for-your-trip/travelling-with-children/airport-with-kids": "/at/de/mit-kindern-am-flughafen",
    "/at/de/prepare-for-your-trip/special-travel-needs/mobility-partner-program-healthcare": "/at/de/mobility-partner-program-healthcare",
    "/at/de/prepare-for-your-trip/airport-information/munich-airport/munich-trade-fair": "/at/de/munich-fair",
    "/at/de/discover-lufthansa/carbon-offsetting": "/at/de/nachhaltiger-fliegen",
    "/at/de/common/terms-and-conditions/terms-currency-conversion": "/at/de/nutzungsbedingungen-waehrungsumrechnung",
    "/at/de/common/terms-of-use": "/at/de/nutzungsbedingungen",
    "/at/de/during-your-trip/food-and-beverages/onboard-delights/faq": "/at/de/onboard-delights-faq",
    "/at/de/during-your-trip/food-and-beverages/onboard-delights": "/at/de/onboard-delights",
    "/at/de/prepare-for-your-trip/all-check-in/online-check-in-info": "/at/de/online-check-in-info",
    "/at/de/prepare-for-your-trip/travelling-with-children/airport-with-kids/online-family-check-in": "/at/de/online-check-in-mit-der-ganzen-familie",
    "/at/de/prepare-for-your-trip/check-in": "/at/de/online-check-in",
    "/at/de/book-and-manage/overview-flights": "/at/de/overview-flights",
    "/at/de/book-and-manage/booking-services": "/at/de/overview-manage",
    "/at/de/book-and-manage/overview-special-request": "/at/de/overview-special-request",
    "/at/de/book-and-manage/overview-travel-information": "/at/de/overview-travel-information",
    "/at/de/discover-lufthansa/partners": "/at/de/partner",
    "/at/de/book-and-manage/passenger-receipt-90days": "/at/de/passenger-receipt-90",
    "/at/de/common/passenger-rights": "/at/de/passenger-rights",
    "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/passengers-using-wheelchairs": "/at/de/passengers-using-wheelchairs",
    "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/passengers-with-sensory-impairment": "/at/de/passengers-with-sensory-impairment",
    "/at/de/prepare-for-your-trip/all-check-in/pre-check-in": "/at/de/pre-check-in",
    "/at/de/prepare-for-your-trip/travel-classes/premium-economy-class": "/at/de/premium-economy-class",
    "/at/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-fly": "/at/de/rail-and-fly",
    "/at/de/common/rail-fly-conditions": "/at/de/rail-fly-bedingungen",
    "/at/de/book-and-manage/passenger-receipt": "/at/de/rechnungsbeleg",
    "/at/de/book-and-manage/cancellation-and-refund/refund": "/at/de/refund",
    "/at/de/prepare-for-your-trip/baggage/travelling-with-animals/register-animal": "/at/de/register-animal-cabin",
    "/at/de/business-services/for-travel-agencies": "/at/de/reisebueros",
    "/at/de/prepare-for-your-trip/special-travel-needs": "/at/de/reisen-mit-besonderen-anforderungen",
    "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/passengers-using-wheelchairs/wheelchair-batteries": "/at/de/rollstuhlbatterien",
    "/at/de/prepare-for-your-trip/entry-regulations/entering-schengen": "/at/de/schengen",
    "/at/de/prepare-for-your-trip/entry-regulations/secure-flight": "/at/de/secure-flight",
    "/at/de/prepare-for-your-trip/airport-information/services-at-the-airport/security-fast-lanes": "/at/de/security-fast-lanes",
    "/at/de/common/sepa-conditions-b": "/at/de/sepa-bedingungen-b",
    "/at/de/common/sepa-conditions": "/at/de/sepa-bedingungen",
    "/at/de/prepare-for-your-trip/airport-information/frankfurt-airport/services-at-frankfurt-airport": "/at/de/services-am-flughafen-frankfurt",
    "/at/de/prepare-for-your-trip/airport-information/munich-airport/services-at-munich-airport": "/at/de/services-am-flughafen-muenchen",
    "/at/de/prepare-for-your-trip/airport-information/services-at-the-airport": "/at/de/services-am-flughafen",
    "/at/de/during-your-trip/in-flight-services-at-a-glance": "/at/de/services-an-bord",
    "/at/de/during-your-trip/in-flight-services-at-a-glance/shopping": "/at/de/shopping",
    "/at/de/prepare-for-your-trip/travelling-with-children/kids-babys-on-board/security-on-board": "/at/de/sicherheit-fuer-kleinkinder-an-bord",
    "/at/de/discover-lufthansa/lufthansa-fleet": "/at/de/sitzplaene",
    "/at/de/common/seatreservation-condtions": "/at/de/sitzplatzreservierungen-konditionen",
    "/at/de/discover-lufthansa/partners/rental-cars/sixt": "/at/de/sixt",
    "/at/de/during-your-trip/food-and-beverages/special-meals": "/at/de/sondermahlzeiten",
    "/at/de/during-your-trip/food-and-beverages": "/at/de/speisen-und-getraenke",
    "/at/de/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage": "/at/de/sportgepaeck-hinzufuegen",
    "/at/de/prepare-for-your-trip/baggage/sport-baggage": "/at/de/sportgepaeck",
    "/at/de/prepare-for-your-trip/baggage/travelling-with-animals/animals-hand-luggage": "/at/de/tiere-als-handgepaeck",
    "/at/de/prepare-for-your-trip/baggage/travelling-with-animals/animals-excess-baggage": "/at/de/tiere-als-uebergepaeck",
    "/at/de/prepare-for-your-trip/special-travel-needs/tips-senior-travellers": "/at/de/tips-senior-travellers",
    "/at/de/business-services/for-corporate-customers/travel-expense-management": "/at/de/travel-expense-management",
    "/at/de/profile/travel-id/travel-id-terms-conditions": "/at/de/travel-id-terms-conditions",
    "/at/de/prepare-for-your-trip/baggage/travelling-with-animals": "/at/de/travelling-with-animals",
    "/at/de/discover-lufthansa/campaigns/traveltricks": "/at/de/traveltricks",
    "/at/de/prepare-for-your-trip/baggage/excess-baggage": "/at/de/uebergepaeck",
    "/at/de/during-your-trip/entertainment-on-board": "/at/de/unterhaltung-an-bord",
    "/at/de/prepare-for-your-trip/travel-classes/upgrade-options/business-upgrade-long-haul": "/at/de/upgrade-business-class-langstrecke",
    "/at/de/prepare-for-your-trip/travel-classes/upgrade-options/first-upgrade-long-haul": "/at/de/upgrade-first-class",
    "/at/de/prepare-for-your-trip/travel-classes/upgrade-options/business-upgrade-short-haul": "/at/de/upgrade-in-die-business-class",
    "/at/de/prepare-for-your-trip/travel-classes/upgrade-options/premium-economy-upgrade": "/at/de/upgrade-in-die-premium-economy-class",
    "/at/de/prepare-for-your-trip/travel-classes/upgrade-options/upgrade-information": "/at/de/upgrade-informationen",
    "/at/de/prepare-for-your-trip/travel-classes/upgrade-options/premium-economy-upgrade-long-haul": "/at/de/upgrade-premium-economy-class",
    "/at/de/prepare-for-your-trip/travel-classes/upgrade-options": "/at/de/upgrademoeglichkeiten",
    "/at/de/prepare-for-your-trip/travel-classes/upgrade-options/fixed-price-upgrade-in-online-check-in": "/at/de/upgrades-im-online-check-in",
    "/at/de/common/payment-options/payment-at-airports": "/at/de/zahlungsmoeglichkeiten-am-flughafen",
    "/at/de/prepare-for-your-trip/airport-information/services-at-the-airport/security-control-service": "/at/de/zeitfenster-sicherheitskontrolle",
    "/de/de/discover-lufthansa/lufthansa-fleet/320": "/de/de/320",
    "/de/de/discover-lufthansa/lufthansa-fleet/32N": "/de/de/32n",
    "/de/de/discover-lufthansa/lufthansa-fleet/359": "/de/de/359",
    "/de/de/discover-lufthansa/lufthansa-fleet/744": "/de/de/744",
    "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs": "/de/de/accessible-travel",
    "/de/de/book-and-manage/additional-services": "/de/de/additional-services",
    "/de/de/during-your-trip/lounges/admission-rules": "/de/de/admission-rules",
    "/de/de/support/contact/adresses": "/de/de/adressen-weltweit",
    "/de/de/book-and-manage/advance-seat-reservation": "/de/de/advance-seat-reservation",
    "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/advice-special-needs-usa": "/de/de/advice-for-travellers-with-special-needs-to-and-from-the-usa",
    "/de/de/business-services/affiliate-marketing": "/de/de/affiliatemarketing",
    "/de/de/prepare-for-your-trip/all-check-in": "/de/de/all-check-in",
    "/de/de/prepare-for-your-trip/travelling-with-children/unaccompanied-minors": "/de/de/alleinreisende-kinder",
    "/de/de/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold": "/de/de/anmeldung-tiere-frachtraum",
    "/de/de/prepare-for-your-trip/airport-information/services-at-the-airport/arrival-services": "/de/de/arrival-services",
    "/de/de/prepare-for-your-trip/baggage/travelling-with-animals/assistance-dogs": "/de/de/assistenzhunde",
    "/de/de/prepare-for-your-trip/all-check-in/automatic-check-in": "/de/de/automatic-check-in",
    "/de/de/prepare-for-your-trip/baggage/baggage-irregularities": "/de/de/baggage-irregularities",
    "/de/de/book-and-manage/timetable-and-flight-status/most-significant-route": "/de/de/bedeutsamste-strecken",
    "/de/de/common/terms-and-conditions": "/de/de/befoerderungsbedingungen-group",
    "/de/de/common/terms-and-conditions/terms-of-service": "/de/de/befoerderungsbedingungen-lh",
    "/de/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus/terms-of-transport": "/de/de/besondere-befoerderungsbedingungen-bus",
    "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form": "/de/de/betreuungsbedarf",
    "/de/de/prepare-for-your-trip/travel-classes/upgrade-options/bid-upgrade": "/de/de/bid-upgrade",
    "/de/de/prepare-for-your-trip/airport-information/services-at-the-airport/boarding": "/de/de/boarding",
    "/de/de/discover-lufthansa/lufthansa-fleet/787": "/de/de/boeing787",
    "/de/de/prepare-for-your-trip/travel-classes/business-class/business-class-short-haul": "/de/de/business-class-auf-kurz-und-mittelstrecken",
    "/de/de/prepare-for-your-trip/travel-classes/business-class": "/de/de/business-class",
    "/de/de/book-and-manage/cancellation-and-refund": "/de/de/cancellations-and-refunds",
    "/de/de/common/payment-options/cash-and-miles": "/de/de/cash-and-miles",
    "/de/de/prepare-for-your-trip/all-check-in/check-in-baggage": "/de/de/check-in-baggage",
    "/de/de/common/privacy-statement/cookie-policy": "/de/de/cookie-policy",
    "/de/de/during-your-trip/food-and-beverages/culinary-journey": "/de/de/culinaryjourney",
    "/de/de/prepare-for-your-trip/baggage/travelling-with-animals/dangerous-dogs": "/de/de/dangerous-dogs",
    "/de/de/prepare-for-your-trip/entry-regulations/data-collection-usa": "/de/de/datenerfassung-fuer-die-usa",
    "/de/de/prepare-for-your-trip/entry-regulations/data-collection-canada": "/de/de/datenerfassung-fuer-kanada",
    "/de/de/common/privacy-statement": "/de/de/datenschutz",
    "/de/de/book-and-manage/digital-self-services": "/de/de/digital-self-services",
    "/de/de/book-and-manage/digital-self-services/digital-travel-companion": "/de/de/digital-travel-companion",
    "/de/de/prepare-for-your-trip/baggage/digital-baggage-services": "/de/de/digitale-gepaeckservices",
    "/de/de/prepare-for-your-trip/special-travel-needs/doctor-on-board/doctor-on-board-news": "/de/de/doctor-on-board-news",
    "/de/de/prepare-for-your-trip/special-travel-needs/doctor-on-board": "/de/de/doctor-on-board",
    "/de/de/prepare-for-your-trip/travel-classes/economy-class": "/de/de/economy-class",
    "/de/de/prepare-for-your-trip/baggage/digital-baggage-services/electronic-bag-tags": "/de/de/electronic-bag-tags",
    "/de/de/prepare-for-your-trip/entry-regulations": "/de/de/entryprocesses",
    "/de/de/prepare-for-your-trip/travel-classes/europe-fares": "/de/de/europa-tarife-economy-class",
    "/de/de/discover-lufthansa/partners/rental-cars/europcar": "/de/de/europcar",
    "/de/de/book-and-manage/exclusive-charter": "/de/de/exclusive-charter",
    "/de/de/common/faq-data-security": "/de/de/faq-data-security",
    "/de/de/support/faq/faq-ejournals": "/de/de/faq-ejournals",
    "/de/de/common/faq-password-security": "/de/de/faq-password-security",
    "/de/de/support/feedback-past-flight": "/de/de/feedback-past-flight",
    "/de/de/support/feedback": "/de/de/feedback",
    "/de/de/prepare-for-your-trip/airport-information/frankfurt-airport/valet-parking-service": "/de/de/fia-valet-service",
    "/de/de/prepare-for-your-trip/travel-classes/first-class/first-class-lounges": "/de/de/first-class-lounges",
    "/de/de/prepare-for-your-trip/travel-classes/first-class/personal-assistant": "/de/de/first-class-personal-assistant",
    "/de/de/prepare-for-your-trip/travel-classes/first-class/first-class-terminal": "/de/de/first-class-terminal",
    "/de/de/prepare-for-your-trip/travel-classes/first-class/valet-parking-service": "/de/de/first-class-valet-parking-service",
    "/de/de/prepare-for-your-trip/travel-classes/first-class": "/de/de/first-class",
    "/de/de/prepare-for-your-trip/travelling-with-children/kids-babys-on-board/flying-with-babies": "/de/de/fliegen-mit-baby",
    "/de/de/prepare-for-your-trip/travelling-with-children": "/de/de/fliegen-mit-kindern",
    "/de/de/prepare-for-your-trip/travelling-with-children/kids-babys-on-board/flying-with-small-kids": "/de/de/fliegen-mit-kleinkind",
    "/de/de/book-and-manage/offers-and-destination": "/de/de/fluege",
    "/de/de/prepare-for-your-trip/airport-information": "/de/de/flughafeninformation",
    "/de/de/book-and-manage/timetable-and-flight-status": "/de/de/flugplan-und-flugstatus",
    "/de/de/book-and-manage/flights": "/de/de/flugsuche",
    "/de/de/book-and-manage/timetable-and-flight-status/flight-disruptions": "/de/de/flugunregelmaessigkeiten",
    "/de/de/during-your-trip/internet-on-board": "/de/de/flynet",
    "/de/de/prepare-for-your-trip/airport-information/munich-airport/valet-parking-service": "/de/de/fmg-valet-parking-service",
    "/de/de/prepare-for-your-trip/airport-information/frankfurt-airport/frankfurt-trade-fair": "/de/de/frankfurt-fair",
    "/de/de/book-and-manage/additional-services/share-now": "/de/de/free2move",
    "/de/de/prepare-for-your-trip/baggage/free-baggage": "/de/de/freigepaeck-regeln",
    "/de/de/prepare-for-your-trip/baggage/dangerous-goods": "/de/de/gefaehrliche-gegenstaende",
    "/de/de/prepare-for-your-trip/baggage": "/de/de/gepaeck",
    "/de/de/common/business-conditions": "/de/de/geschaeftsbedingungen",
    "/de/de/prepare-for-your-trip/special-travel-needs/travelling-healthy": "/de/de/gesund-reisen",
    "/de/de/prepare-for-your-trip/travel-classes/green-fare": "/de/de/green-fare",
    "/de/de/book-and-manage/group-travel": "/de/de/group-travel",
    "/de/de/book-and-manage/group-travel-and-charter": "/de/de/gruppenreisen-und-charter",
    "/de/de/prepare-for-your-trip/baggage/carry-on-baggage": "/de/de/handgepaeck",
    "/de/de/discover-lufthansa/partners/rental-cars/hertz": "/de/de/hertz",
    "/de/de/discover-lufthansa/partners/hotel": "/de/de/hotelangebote",
    "/de/de/common/imprint": "/de/de/impressum",
    "/de/de/common/privacy-statement/info": "/de/de/informationen-zum-datenschutz",
    "/de/de/prepare-for-your-trip/travelling-with-children/kids-babys-on-board": "/de/de/kinder-an-bord",
    "/de/de/during-your-trip/food-and-beverages/childrens-menus": "/de/de/kindermenues-an-bord",
    "/de/de/during-your-trip/lounges/lounge-companions": "/de/de/lounge-begleitung",
    "/de/de/during-your-trip/lounges": "/de/de/lounges",
    "/de/de/prepare-for-your-trip/airport-information/duesseldorf-airport": "/de/de/lufthansa-am-flughafen-duesseldorf",
    "/de/de/prepare-for-your-trip/airport-information/frankfurt-airport": "/de/de/lufthansa-am-flughafen-frankfurt",
    "/de/de/prepare-for-your-trip/airport-information/vienna-airport": "/de/de/lufthansa-am-flughafen-wien",
    "/de/de/prepare-for-your-trip/airport-information/berlin-airport": "/de/de/lufthansa-at-berlin-airport",
    "/de/de/prepare-for-your-trip/airport-information/zuerich-airport": "/de/de/lufthansa-at-zuerich-airport",
    "/de/de/discover-lufthansa/lufthansa-aviation-group": "/de/de/lufthansa-aviation-group",
    "/de/de/prepare-for-your-trip/travel-classes/business-class/business-class-long-haul": "/de/de/lufthansa-business-class-on-long-haul-routes",
    "/de/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus": "/de/de/lufthansa-express-bus",
    "/de/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail": "/de/de/lufthansa-express-rail",
    "/de/de/prepare-for-your-trip/getting-to-and-from-the-airport": "/de/de/lufthansa-express",
    "/de/de/business-services/for-corporate-customers": "/de/de/lufthansa-firmenkunden",
    "/de/de/prepare-for-your-trip/travel-classes/first-class/entertainment": "/de/de/lufthansa-first-class-entertainment",
    "/de/de/prepare-for-your-trip/travel-classes/first-class/fleet": "/de/de/lufthansa-first-class-flotte",
    "/de/de/prepare-for-your-trip/travel-classes/first-class/comfort": "/de/de/lufthansa-first-class-komfort",
    "/de/de/discover-lufthansa/lufthansa-group-airlines": "/de/de/lufthansa-group-star-alliance-and-partner-airlines",
    "/de/de/prepare-for-your-trip/airport-information/services-at-the-airport/guide-service": "/de/de/lufthansa-guide-service",
    "/de/de/prepare-for-your-trip/travel-classes": "/de/de/lufthansa-reiseklassen",
    "/de/de/prepare-for-your-trip/airport-information/munich-airport": "/de/de/lufthansa-terminal-muenchen",
    "/de/de/book-and-manage/additional-services/medication-transport": "/de/de/medikamenten-transport",
    "/de/de/business-services/for-corporate-customers/meetings-and-events": "/de/de/meetings-and-events",
    "/de/de/business-services/for-corporate-customers/meetings-and-events/organizer": "/de/de/meetings-und-events-individuelle-angebotsanfrage",
    "/de/de/business-services/for-corporate-customers/meetings-and-events/participant": "/de/de/meetings-und-events-teilnehmer",
    "/de/de/prepare-for-your-trip/travelling-with-children/kids-babys-on-board/my-logbook": "/de/de/mein-logbuch",
    "/de/de/book-and-manage/view-and-amend-flight-details": "/de/de/meine-buchungen",
    "/de/de/during-your-trip/food-and-beverages/menus-long-haul": "/de/de/menues-auf-langstreckenfluegen",
    "/de/de/during-your-trip/food-and-beverages/menus-travelclasses": "/de/de/menues-reiseklassen",
    "/de/de/discover-lufthansa/partners/rental-cars": "/de/de/mietwagenangebote",
    "/de/de/discover-lufthansa/miles-and-more": "/de/de/miles-and-more",
    "/de/de/prepare-for-your-trip/travelling-with-children/airport-with-kids": "/de/de/mit-kindern-am-flughafen",
    "/de/de/prepare-for-your-trip/special-travel-needs/mobility-partner-program-healthcare": "/de/de/mobility-partner-program-healthcare",
    "/de/de/prepare-for-your-trip/airport-information/munich-airport/munich-trade-fair": "/de/de/munich-fair",
    "/de/de/discover-lufthansa/carbon-offsetting": "/de/de/nachhaltiger-fliegen",
    "/de/de/common/terms-and-conditions/terms-currency-conversion": "/de/de/nutzungsbedingungen-waehrungsumrechnung",
    "/de/de/common/terms-of-use": "/de/de/nutzungsbedingungen",
    "/de/de/during-your-trip/food-and-beverages/onboard-delights/faq": "/de/de/onboard-delights-faq",
    "/de/de/during-your-trip/food-and-beverages/onboard-delights": "/de/de/onboard-delights",
    "/de/de/prepare-for-your-trip/all-check-in/online-check-in-info": "/de/de/online-check-in-info",
    "/de/de/prepare-for-your-trip/travelling-with-children/airport-with-kids/online-family-check-in": "/de/de/online-check-in-mit-der-ganzen-familie",
    "/de/de/prepare-for-your-trip/check-in": "/de/de/online-check-in",
    "/de/de/book-and-manage/overview-flights": "/de/de/overview-flights",
    "/de/de/book-and-manage/booking-services": "/de/de/overview-manage",
    "/de/de/book-and-manage/overview-special-request": "/de/de/overview-special-request",
    "/de/de/book-and-manage/overview-travel-information": "/de/de/overview-travel-information",
    "/de/de/discover-lufthansa/partners": "/de/de/partner",
    "/de/de/book-and-manage/passenger-receipt-90days": "/de/de/passenger-receipt-90",
    "/de/de/common/passenger-rights": "/de/de/passenger-rights",
    "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/passengers-using-wheelchairs": "/de/de/passengers-using-wheelchairs",
    "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/passengers-with-sensory-impairment": "/de/de/passengers-with-sensory-impairment",
    "/de/de/prepare-for-your-trip/all-check-in/pre-check-in": "/de/de/pre-check-in",
    "/de/de/prepare-for-your-trip/travel-classes/premium-economy-class": "/de/de/premium-economy-class",
    "/de/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-fly": "/de/de/rail-and-fly",
    "/de/de/common/rail-fly-conditions": "/de/de/rail-fly-bedingungen",
    "/de/de/book-and-manage/cancellation-and-refund/refund": "/de/de/refund",
    "/de/de/prepare-for-your-trip/baggage/travelling-with-animals/register-animal": "/de/de/register-animal-cabin",
    "/de/de/business-services/for-travel-agencies": "/de/de/reisebueros",
    "/de/de/prepare-for-your-trip/special-travel-needs": "/de/de/reisen-mit-besonderen-anforderungen",
    "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/passengers-using-wheelchairs/wheelchair-batteries": "/de/de/rollstuhlbatterien",
    "/de/de/prepare-for-your-trip/entry-regulations/entering-schengen": "/de/de/schengen",
    "/de/de/prepare-for-your-trip/entry-regulations/secure-flight": "/de/de/secure-flight",
    "/de/de/prepare-for-your-trip/airport-information/services-at-the-airport/security-fast-lanes": "/de/de/security-fast-lanes",
    "/de/de/common/sepa-conditions-b": "/de/de/sepa-bedingungen-b",
    "/de/de/common/sepa-conditions": "/de/de/sepa-bedingungen",
    "/de/de/prepare-for-your-trip/airport-information/frankfurt-airport/services-at-frankfurt-airport": "/de/de/services-am-flughafen-frankfurt",
    "/de/de/prepare-for-your-trip/airport-information/munich-airport/services-at-munich-airport": "/de/de/services-am-flughafen-muenchen",
    "/de/de/prepare-for-your-trip/airport-information/services-at-the-airport": "/de/de/services-am-flughafen",
    "/de/de/during-your-trip/in-flight-services-at-a-glance": "/de/de/services-an-bord",
    "/de/de/during-your-trip/in-flight-services-at-a-glance/shopping": "/de/de/shopping",
    "/de/de/prepare-for-your-trip/travelling-with-children/kids-babys-on-board/security-on-board": "/de/de/sicherheit-fuer-kleinkinder-an-bord",
    "/de/de/discover-lufthansa/lufthansa-fleet": "/de/de/sitzplaene",
    "/de/de/common/seatreservation-condtions": "/de/de/sitzplatzreservierungen-konditionen",
    "/de/de/discover-lufthansa/partners/rental-cars/sixt": "/de/de/sixt",
    "/de/de/during-your-trip/food-and-beverages/special-meals": "/de/de/sondermahlzeiten",
    "/de/de/during-your-trip/food-and-beverages": "/de/de/speisen-und-getraenke",
    "/de/de/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage": "/de/de/sportgepaeck-hinzufuegen",
    "/de/de/prepare-for-your-trip/baggage/sport-baggage": "/de/de/sportgepaeck",
    "/de/de/prepare-for-your-trip/baggage/travelling-with-animals/animals-hand-luggage": "/de/de/tiere-als-handgepaeck",
    "/de/de/prepare-for-your-trip/baggage/travelling-with-animals/animals-excess-baggage": "/de/de/tiere-als-uebergepaeck",
    "/de/de/prepare-for-your-trip/special-travel-needs/tips-senior-travellers": "/de/de/tips-senior-travellers",
    "/de/de/business-services/for-corporate-customers/travel-expense-management": "/de/de/travel-expense-management",
    "/de/de/profile/travel-id/travel-id-terms-conditions": "/de/de/travel-id-terms-conditions",
    "/de/de/prepare-for-your-trip/baggage/travelling-with-animals": "/de/de/travelling-with-animals",
    "/de/de/discover-lufthansa/campaigns/traveltricks": "/de/de/traveltricks",
    "/de/de/prepare-for-your-trip/baggage/excess-baggage": "/de/de/uebergepaeck",
    "/de/de/during-your-trip/entertainment-on-board": "/de/de/unterhaltung-an-bord",
    "/de/de/prepare-for-your-trip/travel-classes/upgrade-options/business-upgrade-long-haul": "/de/de/upgrade-business-class-langstrecke",
    "/de/de/prepare-for-your-trip/travel-classes/upgrade-options/first-upgrade-long-haul": "/de/de/upgrade-first-class",
    "/de/de/prepare-for-your-trip/travel-classes/upgrade-options/business-upgrade-short-haul": "/de/de/upgrade-in-die-business-class",
    "/de/de/prepare-for-your-trip/travel-classes/upgrade-options/premium-economy-upgrade": "/de/de/upgrade-in-die-premium-economy-class",
    "/de/de/prepare-for-your-trip/travel-classes/upgrade-options/upgrade-information": "/de/de/upgrade-informationen",
    "/de/de/prepare-for-your-trip/travel-classes/upgrade-options/premium-economy-upgrade-long-haul": "/de/de/upgrade-premium-economy-class",
    "/de/de/prepare-for-your-trip/travel-classes/upgrade-options": "/de/de/upgrademoeglichkeiten",
    "/de/de/prepare-for-your-trip/travel-classes/upgrade-options/fixed-price-upgrade-in-online-check-in": "/de/de/upgrades-im-online-check-in",
    "/de/de/common/payment-options/payment-at-airports": "/de/de/zahlungsmoeglichkeiten-am-flughafen",
    "/de/de/prepare-for-your-trip/airport-information/services-at-the-airport/security-control-service": "/de/de/zeitfenster-sicherheitskontrolle",
    "/de/en/discover-lufthansa/lufthansa-fleet/320": "/de/en/320",
    "/de/en/discover-lufthansa/lufthansa-fleet/32N": "/de/en/32n",
    "/de/en/discover-lufthansa/lufthansa-fleet/359": "/de/en/359",
    "/de/en/discover-lufthansa/lufthansa-fleet/744": "/de/en/744",
    "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs": "/de/en/accessible-travel",
    "/de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage": "/de/en/add-sports-baggage",
    "/de/en/book-and-manage/additional-services": "/de/en/additional-services",
    "/de/en/support/contact/adresses": "/de/en/addresses-worldwide",
    "/de/en/during-your-trip/lounges/admission-rules": "/de/en/admission-rules",
    "/de/en/book-and-manage/advance-seat-reservation": "/de/en/advance-seat-reservation",
    "/de/en/common/seatreservation-condtions": "/de/en/advance-seat-reservations-terms-and-conditions",
    "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/advice-special-needs-usa": "/de/en/advice-for-travellers-with-special-needs-to-and-from-the-usa",
    "/de/en/business-services/affiliate-marketing": "/de/en/affiliatemarketing",
    "/de/en/prepare-for-your-trip/airport-information": "/de/en/airport-information",
    "/de/en/prepare-for-your-trip/all-check-in": "/de/en/all-check-in",
    "/de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold": "/de/en/anmeldung-tiere-frachtraum",
    "/de/en/prepare-for-your-trip/airport-information/services-at-the-airport/arrival-services": "/de/en/arrival-services",
    "/de/en/prepare-for-your-trip/baggage/travelling-with-animals/assistance-dogs": "/de/en/assistenzhunde",
    "/de/en/prepare-for-your-trip/all-check-in/automatic-check-in": "/de/en/automatic-check-in",
    "/de/en/prepare-for-your-trip/baggage/baggage-irregularities": "/de/en/baggage-irregularities",
    "/de/en/prepare-for-your-trip/baggage": "/de/en/baggage",
    "/de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus/terms-of-transport": "/de/en/besondere-befoerderungsbedingungen-bus",
    "/de/en/prepare-for-your-trip/travel-classes/upgrade-options/bid-upgrade": "/de/en/bid-upgrade",
    "/de/en/prepare-for-your-trip/airport-information/services-at-the-airport/boarding": "/de/en/boarding",
    "/de/en/discover-lufthansa/lufthansa-fleet/787": "/de/en/boeing787",
    "/de/en/prepare-for-your-trip/travel-classes/business-class/business-class-short-haul": "/de/en/business-class-on-short-and-medium-haul",
    "/de/en/prepare-for-your-trip/travel-classes/business-class": "/de/en/business-class",
    "/de/en/common/business-conditions": "/de/en/business-terms-and-conditions",
    "/de/en/book-and-manage/cancellation-and-refund": "/de/en/cancellations-and-refunds",
    "/de/en/prepare-for-your-trip/baggage/carry-on-baggage": "/de/en/carry-on-baggage",
    "/de/en/common/payment-options/cash-and-miles": "/de/en/cash-and-miles",
    "/de/en/prepare-for-your-trip/all-check-in/check-in-baggage": "/de/en/check-in-baggage",
    "/de/en/prepare-for-your-trip/travelling-with-children/airport-with-kids/online-family-check-in": "/de/en/check-in-with-the-family",
    "/de/en/prepare-for-your-trip/travelling-with-children/kids-babys-on-board/security-on-board": "/de/en/child-restraint-systems",
    "/de/en/prepare-for-your-trip/travelling-with-children/kids-babys-on-board": "/de/en/children-on-board",
    "/de/en/during-your-trip/food-and-beverages/childrens-menus": "/de/en/childrens-menus-on-board",
    "/de/en/common/privacy-statement/cookie-policy": "/de/en/cookie-policy",
    "/de/en/during-your-trip/food-and-beverages/culinary-journey": "/de/en/culinaryjourney",
    "/de/en/prepare-for-your-trip/baggage/travelling-with-animals/dangerous-dogs": "/de/en/dangerous-dogs",
    "/de/en/prepare-for-your-trip/entry-regulations/data-collection-canada": "/de/en/data-collection-canada",
    "/de/en/prepare-for-your-trip/entry-regulations/data-collection-usa": "/de/en/data-collection-usa",
    "/de/en/common/privacy-statement/info": "/de/en/data-protection-information",
    "/de/en/common/privacy-statement": "/de/en/datenschutz",
    "/de/en/prepare-for-your-trip/baggage/digital-baggage-services": "/de/en/digital-baggage-services",
    "/de/en/book-and-manage/digital-self-services": "/de/en/digital-self-services",
    "/de/en/book-and-manage/digital-self-services/digital-travel-companion": "/de/en/digital-travel-companion",
    "/de/en/prepare-for-your-trip/special-travel-needs/doctor-on-board/doctor-on-board-news": "/de/en/doctor-on-board-news",
    "/de/en/prepare-for-your-trip/special-travel-needs/doctor-on-board": "/de/en/doctor-on-board",
    "/de/en/prepare-for-your-trip/travel-classes/economy-class": "/de/en/economy-class",
    "/de/en/prepare-for-your-trip/baggage/digital-baggage-services/electronic-bag-tags": "/de/en/electronic-bag-tags",
    "/de/en/prepare-for-your-trip/entry-regulations": "/de/en/entryprocesses",
    "/de/en/prepare-for-your-trip/travel-classes/europe-fares": "/de/en/europa-tarife-economy-class",
    "/de/en/discover-lufthansa/partners/rental-cars/europcar": "/de/en/europcar",
    "/de/en/book-and-manage/exclusive-charter": "/de/en/exclusive-charter",
    "/de/en/common/faq-data-security": "/de/en/faq-data-security",
    "/de/en/support/faq/faq-ejournals": "/de/en/faq-ejournals",
    "/de/en/common/faq-password-security": "/de/en/faq-password-security",
    "/de/en/support/feedback-past-flight": "/de/en/feedback-past-flight",
    "/de/en/support/feedback": "/de/en/feedback",
    "/de/en/prepare-for-your-trip/airport-information/frankfurt-airport/valet-parking-service": "/de/en/fia-valet-service",
    "/de/en/prepare-for-your-trip/travel-classes/first-class/comfort": "/de/en/first-class-comfort",
    "/de/en/prepare-for-your-trip/travel-classes/first-class/first-class-lounges": "/de/en/first-class-lounges",
    "/de/en/prepare-for-your-trip/travel-classes/first-class/personal-assistant": "/de/en/first-class-personal-assistant",
    "/de/en/prepare-for-your-trip/travel-classes/first-class/first-class-terminal": "/de/en/first-class-terminal",
    "/de/en/prepare-for-your-trip/travel-classes/first-class/valet-parking-service": "/de/en/first-class-valet-parking-service",
    "/de/en/prepare-for-your-trip/travel-classes/first-class": "/de/en/first-class",
    "/de/en/prepare-for-your-trip/travelling-with-children/kids-babys-on-board/flying-with-babies": "/de/en/fliegen-mit-baby",
    "/de/en/book-and-manage/timetable-and-flight-status/flight-disruptions": "/de/en/flight-disruptions",
    "/de/en/book-and-manage/flights": "/de/en/flight-search",
    "/de/en/book-and-manage/offers-and-destination": "/de/en/flights",
    "/de/en/discover-lufthansa/carbon-offsetting": "/de/en/fly-more-sustainabl",
    "/de/en/prepare-for-your-trip/travelling-with-children/kids-babys-on-board/flying-with-small-kids": "/de/en/flying-with-small-children",
    "/de/en/during-your-trip/internet-on-board": "/de/en/flynet",
    "/de/en/prepare-for-your-trip/airport-information/munich-airport/valet-parking-service": "/de/en/fmg-valet-parking-service",
    "/de/en/during-your-trip/food-and-beverages": "/de/en/food-and-beverages",
    "/de/en/prepare-for-your-trip/airport-information/frankfurt-airport/frankfurt-trade-fair": "/de/en/frankfurt-fair",
    "/de/en/book-and-manage/additional-services/share-now": "/de/en/free2move",
    "/de/en/prepare-for-your-trip/baggage/free-baggage": "/de/en/freigepaeck-regeln",
    "/de/en/prepare-for-your-trip/baggage/dangerous-goods": "/de/en/gefaehrliche-gegenstaende",
    "/de/en/common/terms-and-conditions/terms-currency-conversion": "/de/en/general-conditions-currency-conversion",
    "/de/en/prepare-for-your-trip/travel-classes/green-fare": "/de/en/green-fare",
    "/de/en/book-and-manage/group-travel-and-charter": "/de/en/group-travel-and-charter",
    "/de/en/book-and-manage/group-travel": "/de/en/group-travel",
    "/de/en/discover-lufthansa/partners/rental-cars/hertz": "/de/en/hertz",
    "/de/en/discover-lufthansa/partners/hotel": "/de/en/hotel-offers",
    "/de/en/common/imprint": "/de/en/imprint",
    "/de/en/discover-lufthansa/partners/rental-cars": "/de/en/lh-rentalcar",
    "/de/en/during-your-trip/lounges/lounge-companions": "/de/en/lounge-companions",
    "/de/en/during-your-trip/lounges": "/de/en/lounges",
    "/de/en/prepare-for-your-trip/airport-information/frankfurt-airport": "/de/en/lufthansa-am-flughafen-frankfurt",
    "/de/en/prepare-for-your-trip/airport-information/berlin-airport": "/de/en/lufthansa-at-berlin-airport",
    "/de/en/prepare-for-your-trip/airport-information/duesseldorf-airport": "/de/en/lufthansa-at-duesseldorf-airport",
    "/de/en/prepare-for-your-trip/airport-information/vienna-airport": "/de/en/lufthansa-at-vienna-airport",
    "/de/en/prepare-for-your-trip/airport-information/zuerich-airport": "/de/en/lufthansa-at-zuerich-airport",
    "/de/en/discover-lufthansa/lufthansa-aviation-group": "/de/en/lufthansa-aviation-group",
    "/de/en/prepare-for-your-trip/travel-classes/business-class/business-class-long-haul": "/de/en/lufthansa-business-class-on-long-haul-routes",
    "/de/en/business-services/for-corporate-customers": "/de/en/lufthansa-corporate-customers",
    "/de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus": "/de/en/lufthansa-express-bus",
    "/de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail": "/de/en/lufthansa-express-rail",
    "/de/en/prepare-for-your-trip/getting-to-and-from-the-airport": "/de/en/lufthansa-express",
    "/de/en/prepare-for-your-trip/travel-classes/first-class/entertainment": "/de/en/lufthansa-first-class-entertainment",
    "/de/en/prepare-for-your-trip/travel-classes/first-class/fleet": "/de/en/lufthansa-first-class-fleet",
    "/de/en/discover-lufthansa/lufthansa-group-airlines": "/de/en/lufthansa-group-star-alliance-and-partner-airlines",
    "/de/en/prepare-for-your-trip/airport-information/services-at-the-airport/guide-service": "/de/en/lufthansa-guide-service",
    "/de/en/prepare-for-your-trip/airport-information/munich-airport": "/de/en/lufthansa-terminal-muenchen",
    "/de/en/prepare-for-your-trip/travel-classes": "/de/en/lufthansa-travel-classes",
    "/de/en/book-and-manage/additional-services/medication-transport": "/de/en/medikamenten-transport",
    "/de/en/business-services/for-corporate-customers/meetings-and-events/participant": "/de/en/meetings-and-events-delegates",
    "/de/en/business-services/for-corporate-customers/meetings-and-events/organizer": "/de/en/meetings-and-events-organisers",
    "/de/en/business-services/for-corporate-customers/meetings-and-events": "/de/en/meetings-and-events",
    "/de/en/during-your-trip/food-and-beverages/menus-long-haul": "/de/en/menus-on-long-haul-flights",
    "/de/en/during-your-trip/food-and-beverages/menus-travelclasses": "/de/en/menus-travel-classes",
    "/de/en/discover-lufthansa/miles-and-more": "/de/en/miles-and-more",
    "/de/en/prepare-for-your-trip/special-travel-needs/mobility-partner-program-healthcare": "/de/en/mobility-partner-program-healthcare",
    "/de/en/book-and-manage/timetable-and-flight-status/most-significant-route": "/de/en/most-significant-route",
    "/de/en/prepare-for-your-trip/airport-information/munich-airport/munich-trade-fair": "/de/en/munich-fair",
    "/de/en/book-and-manage/view-and-amend-flight-details": "/de/en/my-bookings",
    "/de/en/prepare-for-your-trip/travelling-with-children/kids-babys-on-board/my-logbook": "/de/en/my-logbook",
    "/de/en/during-your-trip/food-and-beverages/onboard-delights": "/de/en/onboard-delights",
    "/de/en/prepare-for-your-trip/all-check-in/online-check-in-info": "/de/en/online-check-in-info",
    "/de/en/prepare-for-your-trip/check-in": "/de/en/online-check-in",
    "/de/en/book-and-manage/overview-flights": "/de/en/overview-flights",
    "/de/en/book-and-manage/booking-services": "/de/en/overview-manage",
    "/de/en/book-and-manage/overview-special-request": "/de/en/overview-special-request",
    "/de/en/book-and-manage/overview-travel-information": "/de/en/overview-travel-information",
    "/de/en/discover-lufthansa/partners": "/de/en/partner",
    "/de/en/book-and-manage/passenger-receipt-90days": "/de/en/passenger-receipt-90",
    "/de/en/common/passenger-rights": "/de/en/passenger-rights",
    "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/passengers-using-wheelchairs": "/de/en/passengers-using-wheelchairs",
    "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/passengers-with-sensory-impairment": "/de/en/passengers-with-sensory-impairment",
    "/de/en/common/payment-options/payment-at-airports": "/de/en/payment-options-at-the-airport",
    "/de/en/prepare-for-your-trip/all-check-in/pre-check-in": "/de/en/pre-check-in",
    "/de/en/prepare-for-your-trip/travel-classes/premium-economy-class": "/de/en/premium-economy-class",
    "/de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-fly": "/de/en/rail-and-fly",
    "/de/en/common/rail-fly-conditions": "/de/en/rail-fly-terms-and-conditions",
    "/de/en/book-and-manage/passenger-receipt": "/de/en/rechnungsbeleg",
    "/de/en/book-and-manage/cancellation-and-refund/refund": "/de/en/refund",
    "/de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal": "/de/en/register-animal-cabin",
    "/de/en/prepare-for-your-trip/entry-regulations/entering-schengen": "/de/en/schengen",
    "/de/en/discover-lufthansa/lufthansa-fleet": "/de/en/seat-maps",
    "/de/en/prepare-for-your-trip/entry-regulations/secure-flight": "/de/en/secure-flight",
    "/de/en/prepare-for-your-trip/airport-information/services-at-the-airport/security-control-service": "/de/en/security-check-time-slot",
    "/de/en/prepare-for-your-trip/airport-information/services-at-the-airport/security-fast-lanes": "/de/en/security-fast-lanes",
    "/de/en/common/sepa-conditions-b": "/de/en/sepa-terms-and-conditions-b",
    "/de/en/common/sepa-conditions": "/de/en/sepa-terms-and-conditions",
    "/de/en/prepare-for-your-trip/airport-information/frankfurt-airport/services-at-frankfurt-airport": "/de/en/services-at-frankfurt-airport",
    "/de/en/prepare-for-your-trip/airport-information/services-at-the-airport": "/de/en/services-at-the-airport",
    "/de/en/prepare-for-your-trip/airport-information/munich-airport/services-at-munich-airport": "/de/en/services-munich-airport",
    "/de/en/during-your-trip/in-flight-services-at-a-glance": "/de/en/services-on-board",
    "/de/en/during-your-trip/in-flight-services-at-a-glance/shopping": "/de/en/shopping",
    "/de/en/discover-lufthansa/partners/rental-cars/sixt": "/de/en/sixt",
    "/de/en/during-your-trip/food-and-beverages/special-meals": "/de/en/special-meals",
    "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form": "/de/en/special-needs",
    "/de/en/prepare-for-your-trip/baggage/sport-baggage": "/de/en/sports-baggage",
    "/de/en/common/terms-and-conditions/terms-of-service": "/de/en/terms-and-conditions-lh",
    "/de/en/common/terms-and-conditions": "/de/en/terms-of-service-group",
    "/de/en/common/terms-of-use": "/de/en/terms-of-use",
    "/de/en/prepare-for-your-trip/baggage/travelling-with-animals/animals-hand-luggage": "/de/en/tiere-als-handgepaeck",
    "/de/en/prepare-for-your-trip/baggage/travelling-with-animals/animals-excess-baggage": "/de/en/tiere-als-uebergepaeck",
    "/de/en/book-and-manage/timetable-and-flight-status": "/de/en/timetable-and-flight-status",
    "/de/en/prepare-for-your-trip/special-travel-needs/tips-senior-travellers": "/de/en/tips-senior-travellers",
    "/de/en/business-services/for-travel-agencies": "/de/en/travel-agencies",
    "/de/en/business-services/for-corporate-customers/travel-expense-management": "/de/en/travel-expense-management",
    "/de/en/profile/travel-id/travel-id-terms-conditions": "/de/en/travel-id-terms-conditions",
    "/de/en/prepare-for-your-trip/special-travel-needs/travelling-healthy": "/de/en/travelling-healthy",
    "/de/en/prepare-for-your-trip/baggage/travelling-with-animals": "/de/en/travelling-with-animals",
    "/de/en/prepare-for-your-trip/travelling-with-children": "/de/en/travelling-with-children",
    "/de/en/prepare-for-your-trip/special-travel-needs": "/de/en/travelling-with-special-requirements",
    "/de/en/discover-lufthansa/campaigns/traveltricks": "/de/en/traveltricks",
    "/de/en/prepare-for-your-trip/baggage/excess-baggage": "/de/en/uebergepaeck",
    "/de/en/prepare-for-your-trip/travelling-with-children/unaccompanied-minors": "/de/en/unaccompanied-minors",
    "/de/en/during-your-trip/entertainment-on-board": "/de/en/unterhaltung-an-bord",
    "/de/en/prepare-for-your-trip/travel-classes/upgrade-options/business-upgrade-long-haul": "/de/en/upgrade-business-class-long-haul",
    "/de/en/prepare-for-your-trip/travel-classes/upgrade-options/first-upgrade-long-haul": "/de/en/upgrade-first-class",
    "/de/en/prepare-for-your-trip/travel-classes/upgrade-options/upgrade-information": "/de/en/upgrade-info",
    "/de/en/prepare-for-your-trip/travel-classes/upgrade-options": "/de/en/upgrade-options",
    "/de/en/prepare-for-your-trip/travel-classes/upgrade-options/premium-economy-upgrade-long-haul": "/de/en/upgrade-premium-economy-class",
    "/de/en/prepare-for-your-trip/travel-classes/upgrade-options/business-upgrade-short-haul": "/de/en/upgrade-to-business-class",
    "/de/en/prepare-for-your-trip/travel-classes/upgrade-options/premium-economy-upgrade": "/de/en/upgrade-to-premium-economy-class",
    "/de/en/prepare-for-your-trip/travel-classes/upgrade-options/fixed-price-upgrade-in-online-check-in": "/de/en/upgrades-at-online-check-in",
    "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/passengers-using-wheelchairs/wheelchair-batteries": "/de/en/wheelchair-batteries",
    "/de/en/prepare-for-your-trip/travelling-with-children/airport-with-kids": "/de/en/with-children-at-the-airport",
    "/gb/en/discover-lufthansa/lufthansa-fleet/320": "/gb/en/320",
    "/gb/en/discover-lufthansa/lufthansa-fleet/32N": "/gb/en/32n",
    "/gb/en/discover-lufthansa/lufthansa-fleet/359": "/gb/en/359",
    "/gb/en/discover-lufthansa/lufthansa-fleet/744": "/gb/en/744",
    "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs": "/gb/en/accessible-travel",
    "/gb/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage": "/gb/en/add-sports-baggage",
    "/gb/en/book-and-manage/additional-services": "/gb/en/additional-services",
    "/gb/en/support/contact/adresses": "/gb/en/addresses-worldwide",
    "/gb/en/during-your-trip/lounges/admission-rules": "/gb/en/admission-rules",
    "/gb/en/book-and-manage/advance-seat-reservation": "/gb/en/advance-seat-reservation",
    "/gb/en/common/seatreservation-condtions": "/gb/en/advance-seat-reservations-terms-and-conditions",
    "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/advice-special-needs-usa": "/gb/en/advice-for-travellers-with-special-needs-to-and-from-the-usa",
    "/gb/en/business-services/affiliate-marketing": "/gb/en/affiliatemarketing",
    "/gb/en/prepare-for-your-trip/airport-information": "/gb/en/airport-information",
    "/gb/en/prepare-for-your-trip/all-check-in": "/gb/en/all-check-in",
    "/gb/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold": "/gb/en/anmeldung-tiere-frachtraum",
    "/gb/en/prepare-for-your-trip/airport-information/services-at-the-airport/arrival-services": "/gb/en/arrival-services",
    "/gb/en/prepare-for-your-trip/baggage/travelling-with-animals/assistance-dogs": "/gb/en/assistenzhunde",
    "/gb/en/prepare-for-your-trip/all-check-in/automatic-check-in": "/gb/en/automatic-check-in",
    "/gb/en/prepare-for-your-trip/baggage/baggage-irregularities": "/gb/en/baggage-irregularities",
    "/gb/en/prepare-for-your-trip/baggage": "/gb/en/baggage",
    "/gb/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus/terms-of-transport": "/gb/en/besondere-befoerderungsbedingungen-bus",
    "/gb/en/prepare-for-your-trip/travel-classes/upgrade-options/bid-upgrade": "/gb/en/bid-upgrade",
    "/gb/en/prepare-for-your-trip/airport-information/services-at-the-airport/boarding": "/gb/en/boarding",
    "/gb/en/discover-lufthansa/lufthansa-fleet/787": "/gb/en/boeing787",
    "/gb/en/prepare-for-your-trip/travel-classes/business-class/business-class-short-haul": "/gb/en/business-class-on-short-and-medium-haul",
    "/gb/en/prepare-for-your-trip/travel-classes/business-class": "/gb/en/business-class",
    "/gb/en/common/business-conditions": "/gb/en/business-terms-and-conditions",
    "/gb/en/book-and-manage/cancellation-and-refund": "/gb/en/cancellations-and-refunds",
    "/gb/en/prepare-for-your-trip/baggage/carry-on-baggage": "/gb/en/carry-on-baggage",
    "/gb/en/common/payment-options/cash-and-miles": "/gb/en/cash-and-miles",
    "/gb/en/prepare-for-your-trip/all-check-in/check-in-baggage": "/gb/en/check-in-baggage",
    "/gb/en/prepare-for-your-trip/travelling-with-children/airport-with-kids/online-family-check-in": "/gb/en/check-in-with-the-family",
    "/gb/en/prepare-for-your-trip/travelling-with-children/kids-babys-on-board/security-on-board": "/gb/en/child-restraint-systems",
    "/gb/en/prepare-for-your-trip/travelling-with-children/kids-babys-on-board": "/gb/en/children-on-board",
    "/gb/en/during-your-trip/food-and-beverages/childrens-menus": "/gb/en/childrens-menus-on-board",
    "/gb/en/common/privacy-statement/cookie-policy": "/gb/en/cookie-policy",
    "/gb/en/during-your-trip/food-and-beverages/culinary-journey": "/gb/en/culinaryjourney",
    "/gb/en/prepare-for-your-trip/baggage/travelling-with-animals/dangerous-dogs": "/gb/en/dangerous-dogs",
    "/gb/en/prepare-for-your-trip/entry-regulations/data-collection-canada": "/gb/en/data-collection-canada",
    "/gb/en/prepare-for-your-trip/entry-regulations/data-collection-usa": "/gb/en/data-collection-usa",
    "/gb/en/common/privacy-statement/info": "/gb/en/data-protection-information",
    "/gb/en/common/privacy-statement": "/gb/en/datenschutz",
    "/gb/en/prepare-for-your-trip/baggage/digital-baggage-services": "/gb/en/digital-baggage-services",
    "/gb/en/book-and-manage/digital-self-services": "/gb/en/digital-self-services",
    "/gb/en/book-and-manage/digital-self-services/digital-travel-companion": "/gb/en/digital-travel-companion",
    "/gb/en/prepare-for-your-trip/special-travel-needs/doctor-on-board/doctor-on-board-news": "/gb/en/doctor-on-board-news",
    "/gb/en/prepare-for-your-trip/special-travel-needs/doctor-on-board": "/gb/en/doctor-on-board",
    "/gb/en/prepare-for-your-trip/travel-classes/economy-class": "/gb/en/economy-class",
    "/gb/en/prepare-for-your-trip/baggage/digital-baggage-services/electronic-bag-tags": "/gb/en/electronic-bag-tags",
    "/gb/en/prepare-for-your-trip/entry-regulations": "/gb/en/entryprocesses",
    "/gb/en/prepare-for-your-trip/travel-classes/europe-fares": "/gb/en/europa-tarife-economy-class",
    "/gb/en/discover-lufthansa/partners/rental-cars/europcar": "/gb/en/europcar",
    "/gb/en/book-and-manage/exclusive-charter": "/gb/en/exclusive-charter",
    "/gb/en/common/faq-data-security": "/gb/en/faq-data-security",
    "/gb/en/support/faq/faq-ejournals": "/gb/en/faq-ejournals",
    "/gb/en/common/faq-password-security": "/gb/en/faq-password-security",
    "/gb/en/support/feedback-past-flight": "/gb/en/feedback-past-flight",
    "/gb/en/support/feedback": "/gb/en/feedback",
    "/gb/en/prepare-for-your-trip/airport-information/frankfurt-airport/valet-parking-service": "/gb/en/fia-valet-service",
    "/gb/en/prepare-for-your-trip/travel-classes/first-class/comfort": "/gb/en/first-class-comfort",
    "/gb/en/prepare-for-your-trip/travel-classes/first-class/first-class-lounges": "/gb/en/first-class-lounges",
    "/gb/en/prepare-for-your-trip/travel-classes/first-class/personal-assistant": "/gb/en/first-class-personal-assistant",
    "/gb/en/prepare-for-your-trip/travel-classes/first-class/first-class-terminal": "/gb/en/first-class-terminal",
    "/gb/en/prepare-for-your-trip/travel-classes/first-class/valet-parking-service": "/gb/en/first-class-valet-parking-service",
    "/gb/en/prepare-for-your-trip/travel-classes/first-class": "/gb/en/first-class",
    "/gb/en/prepare-for-your-trip/travelling-with-children/kids-babys-on-board/flying-with-babies": "/gb/en/fliegen-mit-baby",
    "/gb/en/book-and-manage/timetable-and-flight-status/flight-disruptions": "/gb/en/flight-disruptions",
    "/gb/en/book-and-manage/flights": "/gb/en/flight-search",
    "/gb/en/book-and-manage/offers-and-destination": "/gb/en/flights",
    "/gb/en/discover-lufthansa/carbon-offsetting": "/gb/en/fly-more-sustainabl",
    "/gb/en/prepare-for-your-trip/travelling-with-children/kids-babys-on-board/flying-with-small-kids": "/gb/en/flying-with-small-children",
    "/gb/en/during-your-trip/internet-on-board": "/gb/en/flynet",
    "/gb/en/prepare-for-your-trip/airport-information/munich-airport/valet-parking-service": "/gb/en/fmg-valet-parking-service",
    "/gb/en/during-your-trip/food-and-beverages": "/gb/en/food-and-beverages",
    "/gb/en/prepare-for-your-trip/airport-information/frankfurt-airport/frankfurt-trade-fair": "/gb/en/frankfurt-fair",
    "/gb/en/book-and-manage/additional-services/share-now": "/gb/en/free2move",
    "/gb/en/prepare-for-your-trip/baggage/free-baggage": "/gb/en/freigepaeck-regeln",
    "/gb/en/prepare-for-your-trip/baggage/dangerous-goods": "/gb/en/gefaehrliche-gegenstaende",
    "/gb/en/common/terms-and-conditions/terms-currency-conversion": "/gb/en/general-conditions-currency-conversion",
    "/gb/en/prepare-for-your-trip/travel-classes/green-fare": "/gb/en/green-fare",
    "/gb/en/book-and-manage/group-travel-and-charter": "/gb/en/group-travel-and-charter",
    "/gb/en/book-and-manage/group-travel": "/gb/en/group-travel",
    "/gb/en/discover-lufthansa/partners/rental-cars/hertz": "/gb/en/hertz",
    "/gb/en/discover-lufthansa/partners/hotel": "/gb/en/hotel-offers",
    "/gb/en/common/imprint": "/gb/en/imprint",
    "/gb/en/discover-lufthansa/partners/rental-cars": "/gb/en/lh-rentalcar",
    "/gb/en/during-your-trip/lounges/lounge-companions": "/gb/en/lounge-companions",
    "/gb/en/during-your-trip/lounges": "/gb/en/lounges",
    "/gb/en/prepare-for-your-trip/airport-information/frankfurt-airport": "/gb/en/lufthansa-am-flughafen-frankfurt",
    "/gb/en/prepare-for-your-trip/airport-information/berlin-airport": "/gb/en/lufthansa-at-berlin-airport",
    "/gb/en/prepare-for-your-trip/airport-information/duesseldorf-airport": "/gb/en/lufthansa-at-duesseldorf-airport",
    "/gb/en/prepare-for-your-trip/airport-information/vienna-airport": "/gb/en/lufthansa-at-vienna-airport",
    "/gb/en/prepare-for-your-trip/airport-information/zuerich-airport": "/gb/en/lufthansa-at-zuerich-airport",
    "/gb/en/discover-lufthansa/lufthansa-aviation-group": "/gb/en/lufthansa-aviation-group",
    "/gb/en/prepare-for-your-trip/travel-classes/business-class/business-class-long-haul": "/gb/en/lufthansa-business-class-on-long-haul-routes",
    "/gb/en/business-services/for-corporate-customers": "/gb/en/lufthansa-corporate-customers",
    "/gb/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus": "/gb/en/lufthansa-express-bus",
    "/gb/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail": "/gb/en/lufthansa-express-rail",
    "/gb/en/prepare-for-your-trip/getting-to-and-from-the-airport": "/gb/en/lufthansa-express",
    "/gb/en/prepare-for-your-trip/travel-classes/first-class/entertainment": "/gb/en/lufthansa-first-class-entertainment",
    "/gb/en/prepare-for-your-trip/travel-classes/first-class/fleet": "/gb/en/lufthansa-first-class-fleet",
    "/gb/en/discover-lufthansa/lufthansa-group-airlines": "/gb/en/lufthansa-group-star-alliance-and-partner-airlines",
    "/gb/en/prepare-for-your-trip/airport-information/services-at-the-airport/guide-service": "/gb/en/lufthansa-guide-service",
    "/gb/en/prepare-for-your-trip/airport-information/munich-airport": "/gb/en/lufthansa-terminal-muenchen",
    "/gb/en/prepare-for-your-trip/travel-classes": "/gb/en/lufthansa-travel-classes",
    "/gb/en/book-and-manage/additional-services/medication-transport": "/gb/en/medikamenten-transport",
    "/gb/en/business-services/for-corporate-customers/meetings-and-events/participant": "/gb/en/meetings-and-events-delegates",
    "/gb/en/business-services/for-corporate-customers/meetings-and-events/organizer": "/gb/en/meetings-and-events-organisers",
    "/gb/en/business-services/for-corporate-customers/meetings-and-events": "/gb/en/meetings-and-events",
    "/gb/en/during-your-trip/food-and-beverages/menus-long-haul": "/gb/en/menus-on-long-haul-flights",
    "/gb/en/during-your-trip/food-and-beverages/menus-travelclasses": "/gb/en/menus-travel-classes",
    "/gb/en/discover-lufthansa/miles-and-more": "/gb/en/miles-and-more",
    "/gb/en/prepare-for-your-trip/special-travel-needs/mobility-partner-program-healthcare": "/gb/en/mobility-partner-program-healthcare",
    "/gb/en/book-and-manage/timetable-and-flight-status/most-significant-route": "/gb/en/most-significant-route",
    "/gb/en/prepare-for-your-trip/airport-information/munich-airport/munich-trade-fair": "/gb/en/munich-fair",
    "/gb/en/book-and-manage/view-and-amend-flight-details": "/gb/en/my-bookings",
    "/gb/en/prepare-for-your-trip/travelling-with-children/kids-babys-on-board/my-logbook": "/gb/en/my-logbook",
    "/gb/en/during-your-trip/food-and-beverages/onboard-delights": "/gb/en/onboard-delights",
    "/gb/en/prepare-for-your-trip/all-check-in/online-check-in-info": "/gb/en/online-check-in-info",
    "/gb/en/prepare-for-your-trip/check-in": "/gb/en/online-check-in",
    "/gb/en/book-and-manage/overview-flights": "/gb/en/overview-flights",
    "/gb/en/book-and-manage/booking-services": "/gb/en/overview-manage",
    "/gb/en/book-and-manage/overview-special-request": "/gb/en/overview-special-request",
    "/gb/en/book-and-manage/overview-travel-information": "/gb/en/overview-travel-information",
    "/gb/en/discover-lufthansa/partners": "/gb/en/partner",
    "/gb/en/book-and-manage/passenger-receipt-90days": "/gb/en/passenger-receipt-90",
    "/gb/en/common/passenger-rights": "/gb/en/passenger-rights",
    "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/passengers-using-wheelchairs": "/gb/en/passengers-using-wheelchairs",
    "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/passengers-with-sensory-impairment": "/gb/en/passengers-with-sensory-impairment",
    "/gb/en/common/payment-options/payment-at-airports": "/gb/en/payment-options-at-the-airport",
    "/gb/en/prepare-for-your-trip/all-check-in/pre-check-in": "/gb/en/pre-check-in",
    "/gb/en/prepare-for-your-trip/travel-classes/premium-economy-class": "/gb/en/premium-economy-class",
    "/gb/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-fly": "/gb/en/rail-and-fly",
    "/gb/en/common/rail-fly-conditions": "/gb/en/rail-fly-terms-and-conditions",
    "/gb/en/book-and-manage/passenger-receipt": "/gb/en/rechnungsbeleg",
    "/gb/en/book-and-manage/cancellation-and-refund/refund": "/gb/en/refund",
    "/gb/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal": "/gb/en/register-animal-cabin",
    "/gb/en/prepare-for-your-trip/entry-regulations/entering-schengen": "/gb/en/schengen",
    "/gb/en/discover-lufthansa/lufthansa-fleet": "/gb/en/seat-maps",
    "/gb/en/prepare-for-your-trip/entry-regulations/secure-flight": "/gb/en/secure-flight",
    "/gb/en/prepare-for-your-trip/airport-information/services-at-the-airport/security-control-service": "/gb/en/security-check-time-slot",
    "/gb/en/prepare-for-your-trip/airport-information/services-at-the-airport/security-fast-lanes": "/gb/en/security-fast-lanes",
    "/gb/en/common/sepa-conditions-b": "/gb/en/sepa-terms-and-conditions-b",
    "/gb/en/common/sepa-conditions": "/gb/en/sepa-terms-and-conditions",
    "/gb/en/prepare-for-your-trip/airport-information/frankfurt-airport/services-at-frankfurt-airport": "/gb/en/services-at-frankfurt-airport",
    "/gb/en/prepare-for-your-trip/airport-information/services-at-the-airport": "/gb/en/services-at-the-airport",
    "/gb/en/prepare-for-your-trip/airport-information/munich-airport/services-at-munich-airport": "/gb/en/services-munich-airport",
    "/gb/en/during-your-trip/in-flight-services-at-a-glance": "/gb/en/services-on-board",
    "/gb/en/during-your-trip/in-flight-services-at-a-glance/shopping": "/gb/en/shopping",
    "/gb/en/discover-lufthansa/partners/rental-cars/sixt": "/gb/en/sixt",
    "/gb/en/during-your-trip/food-and-beverages/special-meals": "/gb/en/special-meals",
    "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form": "/gb/en/special-needs",
    "/gb/en/prepare-for-your-trip/baggage/sport-baggage": "/gb/en/sports-baggage",
    "/gb/en/common/terms-and-conditions/terms-of-service": "/gb/en/terms-and-conditions-lh",
    "/gb/en/common/terms-and-conditions": "/gb/en/terms-of-service-group",
    "/gb/en/common/terms-of-use": "/gb/en/terms-of-use",
    "/gb/en/prepare-for-your-trip/baggage/travelling-with-animals/animals-hand-luggage": "/gb/en/tiere-als-handgepaeck",
    "/gb/en/prepare-for-your-trip/baggage/travelling-with-animals/animals-excess-baggage": "/gb/en/tiere-als-uebergepaeck",
    "/gb/en/book-and-manage/timetable-and-flight-status": "/gb/en/timetable-and-flight-status",
    "/gb/en/prepare-for-your-trip/special-travel-needs/tips-senior-travellers": "/gb/en/tips-senior-travellers",
    "/gb/en/business-services/for-travel-agencies": "/gb/en/travel-agencies",
    "/gb/en/business-services/for-corporate-customers/travel-expense-management": "/gb/en/travel-expense-management",
    "/gb/en/profile/travel-id/travel-id-terms-conditions": "/gb/en/travel-id-terms-conditions",
    "/gb/en/prepare-for-your-trip/special-travel-needs/travelling-healthy": "/gb/en/travelling-healthy",
    "/gb/en/prepare-for-your-trip/baggage/travelling-with-animals": "/gb/en/travelling-with-animals",
    "/gb/en/prepare-for-your-trip/travelling-with-children": "/gb/en/travelling-with-children",
    "/gb/en/prepare-for-your-trip/special-travel-needs": "/gb/en/travelling-with-special-requirements",
    "/gb/en/discover-lufthansa/campaigns/traveltricks": "/gb/en/traveltricks",
    "/gb/en/prepare-for-your-trip/baggage/excess-baggage": "/gb/en/uebergepaeck",
    "/gb/en/prepare-for-your-trip/travelling-with-children/unaccompanied-minors": "/gb/en/unaccompanied-minors",
    "/gb/en/during-your-trip/entertainment-on-board": "/gb/en/unterhaltung-an-bord",
    "/gb/en/prepare-for-your-trip/travel-classes/upgrade-options/business-upgrade-long-haul": "/gb/en/upgrade-business-class-long-haul",
    "/gb/en/prepare-for-your-trip/travel-classes/upgrade-options/first-upgrade-long-haul": "/gb/en/upgrade-first-class",
    "/gb/en/prepare-for-your-trip/travel-classes/upgrade-options/upgrade-information": "/gb/en/upgrade-info",
    "/gb/en/prepare-for-your-trip/travel-classes/upgrade-options": "/gb/en/upgrade-options",
    "/gb/en/prepare-for-your-trip/travel-classes/upgrade-options/premium-economy-upgrade-long-haul": "/gb/en/upgrade-premium-economy-class",
    "/gb/en/prepare-for-your-trip/travel-classes/upgrade-options/business-upgrade-short-haul": "/gb/en/upgrade-to-business-class",
    "/gb/en/prepare-for-your-trip/travel-classes/upgrade-options/premium-economy-upgrade": "/gb/en/upgrade-to-premium-economy-class",
    "/gb/en/prepare-for-your-trip/travel-classes/upgrade-options/fixed-price-upgrade-in-online-check-in": "/gb/en/upgrades-at-online-check-in",
    "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/passengers-using-wheelchairs/wheelchair-batteries": "/gb/en/wheelchair-batteries",
    "/gb/en/prepare-for-your-trip/travelling-with-children/airport-with-kids": "/gb/en/with-children-at-the-airport"
  };

  // tools/importer/parsers/aem-paths.js
  var CLASSES = /^\/([a-z]{2})\/([a-z]{2})\/prepare-for-your-trip\/travel-classes\/(first-class|business-class|premium-economy-class|economy-class)$/;
  var CLASSES_HUB = /^\/([a-z]{2})\/([a-z]{2})\/prepare-for-your-trip\/travel-classes$/;
  var FLYNET = /^\/([a-z]{2})\/([a-z]{2})\/during-your-trip\/internet-on-board$/;
  function publicPath(href) {
    const raw = (href || "").trim();
    const m = raw.match(/^(?:https?:\/\/www\.lufthansa\.com)?(\/[^?#]*)([?#].*)?$/);
    if (!m) return raw;
    let path = m[1].replace(/^\/content\/lh\/markets(?=\/)/, "").replace(/\.html$/, "").replace(/\/$/, "");
    const rest = m[2] || "";
    let x = path.match(CLASSES);
    if (x) path = `/${x[1]}/${x[2]}/${x[3]}`;
    else if (x = path.match(CLASSES_HUB)) path = `/${x[1]}/${x[2]}/${x[2] === "de" ? "lufthansa-reiseklassen" : "lufthansa-travel-classes"}`;
    else if (x = path.match(FLYNET)) path = `/${x[1]}/${x[2]}/flynet`;
    else if (Object.prototype.hasOwnProperty.call(AEM_PATHS, path)) path = AEM_PATHS[path];
    return `${path || "/"}${rest}`;
  }

  // tools/importer/parsers/subpage-nav.js
  function parse(element, { document }) {
    const clean2 = (s) => (s || "").replace(/[​-‍﻿]/g, "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
    const text = (el) => {
      if (!el) return "";
      const c = el.cloneNode(true);
      c.querySelectorAll("maui-icon, i, .sr-only, .visually-hidden, maui-screen-reader-label").forEach((n) => n.remove());
      return clean2(c.textContent);
    };
    const nav = element.matches("nav.subpage") ? element : element.querySelector("nav.subpage");
    if (!nav) return;
    const head = nav.querySelector(".subpage-header, header");
    const eyebrow = text(head && head.querySelector("span"));
    const title = text(head && head.querySelector("h1, h2, h3, h4, h5, h6"));
    const ul = document.createElement("ul");
    nav.querySelectorAll("li").forEach((item) => {
      const link = item.querySelector("a[href]");
      const label = text(link || item);
      if (!label) return;
      const li = document.createElement("li");
      if (link && !item.classList.contains("active")) {
        const a = document.createElement("a");
        a.setAttribute("href", publicPath(link.getAttribute("href")));
        a.textContent = label;
        li.append(a);
      } else {
        const strong = document.createElement("strong");
        strong.textContent = label;
        li.append(strong);
      }
      ul.append(li);
    });
    if (!ul.children.length) {
      element.remove();
      return;
    }
    const cell = [];
    if (eyebrow) {
      const p = document.createElement("p");
      p.textContent = eyebrow;
      cell.push(p);
    }
    if (title) {
      const h = document.createElement("h2");
      h.textContent = title;
      cell.push(h);
    }
    cell.push(ul);
    const block = WebImporter.Blocks.createBlock(document, { name: "subpage-nav", cells: [[cell]] });
    const hr = document.createElement("hr");
    hr.setAttribute("data-excat-section-break", "");
    element.replaceWith(hr, block);
  }

  // tools/importer/parsers/hero-campaign.js
  function parse2(element, { document }) {
    const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style';
    const clean2 = (s) => (s || "").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const c = node.cloneNode(true);
      c.querySelectorAll(SKIP).forEach((n) => n.remove());
      return clean2(c.textContent);
    };
    const isBroken3 = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src) || /^(data|blob):/i.test(src);
    const isBr2 = (n) => n && n.nodeType === 1 && n.tagName === "BR";
    const isBlank = (n) => n && n.nodeType === 3 && !clean2(n.nodeValue);
    const trimBreaks = (el) => {
      while (el.lastChild && (isBr2(el.lastChild) || isBlank(el.lastChild))) el.lastChild.remove();
      while (el.firstChild && (isBr2(el.firstChild) || isBlank(el.firstChild))) el.firstChild.remove();
    };
    const info = element.querySelector(".campaign-information") || element;
    const media = [];
    const img = [...element.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")) && !info.contains(i));
    if (img) {
      const image = document.createElement("img");
      image.setAttribute("src", img.getAttribute("src"));
      image.setAttribute("alt", img.getAttribute("alt") || "");
      media.push(image);
    }
    const video = element.querySelector("video[src], video source[src]");
    if (video) {
      const src = video.getAttribute("src");
      const a = document.createElement("a");
      a.setAttribute("href", src);
      a.textContent = src;
      const p = document.createElement("p");
      p.append(a);
      media.push(p);
    }
    const text = [];
    const HEADINGS = "h1, h2, h3, h4, h5, h6";
    const heading = [...info.querySelectorAll(HEADINGS)].find((h) => h.matches(".headline:not(.subheadline)")) || [...info.querySelectorAll(HEADINGS)].find((h) => !h.matches(".subheadline"));
    if (heading && visibleText(heading)) {
      const h = document.createElement(heading.tagName.toLowerCase());
      h.textContent = visibleText(heading);
      text.push(h);
    }
    info.querySelectorAll(".subheadline").forEach((sub) => {
      const t = visibleText(sub);
      if (!t || sub === heading) return;
      const p = document.createElement("p");
      p.textContent = t;
      text.push(p);
    });
    info.querySelectorAll(".information .richtext, .information").forEach((rt) => {
      if (rt.classList.contains("information") && rt.querySelector(".richtext")) return;
      [...rt.children].forEach((n) => {
        if (n.matches(SKIP)) return;
        const c = n.cloneNode(true);
        c.querySelectorAll(SKIP).forEach((s) => s.remove());
        c.removeAttribute("class");
        if (c.tagName === "P") trimBreaks(c);
        if (!clean2(c.textContent) && !c.querySelector("img")) return;
        text.push(c);
      });
    });
    info.querySelectorAll("maui-button-link[href], maui-navigation-link[href], maui-link[href]").forEach((m) => {
      if (m.closest(".richtext")) return;
      const label = visibleText(m) || clean2(m.getAttribute("label"));
      if (!label) return;
      const a = document.createElement("a");
      a.setAttribute("href", m.getAttribute("href"));
      a.textContent = label;
      const p = document.createElement("p");
      const type = m.tagName === "MAUI-BUTTON-LINK" ? m.getAttribute("type") : null;
      if (type === "primary" || type === "secondary") {
        const wrap = document.createElement(type === "primary" ? "strong" : "em");
        wrap.append(a);
        p.append(wrap);
      } else {
        p.append(a);
      }
      text.push(p);
    });
    const cells = [];
    if (media.length) cells.push([media]);
    if (text.length) cells.push([text]);
    const teaser = element.querySelector(".cms-inspiration-teaser") || element;
    const variants = [];
    if (info.classList.contains("alignment-right")) variants.push("right");
    if (info.classList.contains("uplift-animation") || teaser.classList.contains("inspiration-teaser-uplift-animation")) variants.push("card");
    if (teaser.classList.contains("inspiration-teaser-narrow")) variants.push("narrow");
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-campaign", variants, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-lightbox.js
  function parse3(element, { document }) {
    const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style';
    const clean2 = (s) => (s || "").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const c = node.cloneNode(true);
      c.querySelectorAll(SKIP).forEach((n) => n.remove());
      return clean2(c.textContent);
    };
    const isBroken3 = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src) || /^(data|blob):/i.test(src);
    const imageOf = (img) => {
      const out = document.createElement("img");
      out.setAttribute("src", img.getAttribute("src"));
      out.setAttribute("alt", img.getAttribute("alt") || "");
      return out;
    };
    const trigger = element.querySelector('[data-target^="#"], [data-bs-target^="#"], [href^="#lightbox"]');
    const targetId = trigger && (trigger.getAttribute("data-target") || trigger.getAttribute("data-bs-target") || trigger.getAttribute("href"));
    let modal = null;
    if (targetId && targetId.length > 1) {
      try {
        modal = document.getElementById(decodeURIComponent(targetId.slice(1)));
      } catch (e) {
        modal = null;
      }
    }
    if (!modal) modal = element.querySelector(".lightbox-modal") || document.querySelector(".lightbox-modal");
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    const intro = [];
    const column = element.closest(".column-view-item");
    const layout = column && column.closest(".twocolumn, .threecolumn, .fourcolumn");
    if (column && layout && column.parentElement && column.parentElement.children.length > 1) {
      let part = element;
      while (part.parentElement && part.parentElement !== column) part = part.parentElement;
      const before = [];
      for (let n = part.previousElementSibling; n; n = n.previousElementSibling) before.unshift(n);
      before.forEach((comp) => {
        const nodes = [...comp.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol")].filter((n) => !n.parentElement.closest("p, ul, ol, h1, h2, h3, h4, h5, h6"));
        if (!nodes.length || comp.querySelector("img, picture, video, iframe, form, table")) return;
        nodes.forEach((n) => {
          const text = visibleText(n);
          if (!text) return;
          let out;
          if (/^H[1-6]$/.test(n.tagName)) {
            out = document.createElement(n.tagName.toLowerCase());
            out.textContent = text;
          } else {
            out = n.cloneNode(true);
            out.querySelectorAll(SKIP).forEach((x) => x.remove());
            out.removeAttribute("class");
          }
          intro.push(out);
        });
        comp.remove();
      });
    }
    if (intro.length) cells.push([intro]);
    if (modal) {
      modal.querySelectorAll(".swiper-slide").forEach((slide) => {
        if (slide.classList.contains("swiper-slide-duplicate")) return;
        const img = [...slide.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")));
        if (!img || seen.has(img.getAttribute("src"))) return;
        seen.add(img.getAttribute("src"));
        const caption = slide.querySelector(".lightbox-description");
        let captionCell = "";
        if (caption && visibleText(caption)) {
          const blocks = [...caption.querySelectorAll("p, ul, ol, h1, h2, h3, h4, h5, h6")];
          if (blocks.length) {
            captionCell = blocks.filter((b) => !b.parentElement.closest("p, ul, ol")).map((b) => {
              const c = b.cloneNode(true);
              c.querySelectorAll(SKIP).forEach((s) => s.remove());
              c.removeAttribute("class");
              return c;
            });
          } else {
            const p = document.createElement("p");
            p.textContent = visibleText(caption);
            captionCell = [p];
          }
        }
        cells.push([imageOf(img), captionCell]);
      });
    }
    if (cells.length === (intro.length ? 1 : 0)) {
      const img = [...element.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")));
      if (img) cells.push([imageOf(img), ""]);
    }
    const close = modal && visibleText(modal.querySelector(".modal-close-button-text, .lightbox-close"));
    if (close && cells.length > (intro.length ? 1 : 0)) cells.push(["Close label", close]);
    let half = false;
    if (column && layout && column.parentElement) {
      const row = column.parentElement;
      if (!row.hasAttribute("data-lh-slideshows")) {
        row.setAttribute("data-lh-slideshows", [...row.children].filter((c) => c.querySelector(".slideshow")).length);
      }
      half = Number(row.getAttribute("data-lh-slideshows")) > 1;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-lightbox", variants: half ? ["half"] : [], cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-striped.js
  function parse4(element, { document }) {
    const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style';
    const clean2 = (s) => (s || "").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
    const cellContent = (cell) => {
      const c = cell.cloneNode(true);
      c.querySelectorAll(SKIP).forEach((n) => n.remove());
      const nodes = [...c.childNodes].filter((n) => n.nodeType !== 8);
      if (!clean2(c.textContent) && !c.querySelector("img")) return "";
      if (nodes.every((n) => n.nodeType === 3)) return clean2(c.textContent);
      return nodes;
    };
    const rowEls = [...element.querySelectorAll("maui-table-row, tr")].filter((r) => !r.parentElement.closest("maui-table-row, tr"));
    let rows = rowEls.map((r) => [...r.children].filter((c) => /^(MAUI-TABLE-CELL|MAUI-TABLE-HEADER-CELL|MAUI-TABLE-HEAD-CELL|TD|TH)$/.test(c.tagName) || c.getAttribute("role") === "cell" || c.getAttribute("role") === "columnheader" || c.getAttribute("role") === "rowheader").map(cellContent));
    rows = rows.filter((cells2) => cells2.some((c) => c !== ""));
    const width = Math.max(1, ...rows.map((r) => r.length));
    const cells = rows.map((r) => r.length < width ? [...r, ...Array(width - r.length).fill("")] : r);
    const before = [];
    const caption = element.querySelector("maui-table-caption, caption");
    if (caption && clean2(caption.textContent)) {
      const p = document.createElement("p");
      p.textContent = clean2(caption.textContent);
      before.push(p);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "table-striped", cells });
    element.replaceWith(...before, block);
  }

  // tools/importer/parsers/media-nodes.js
  var ZW = /[​-‍﻿]/g;
  var clean = (s) => (s || "").replace(ZW, "").replace(/\s+/g, " ").trim();
  var isBroken = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src);
  function videoPara(document, src, label, settings) {
    const a = document.createElement("a");
    a.setAttribute("href", src);
    a.textContent = label || src;
    const p = document.createElement("p");
    p.append(a);
    if (settings.length) p.append(` {${settings.join(" ")}}`);
    return p;
  }
  function viewerNodes(comp, document) {
    const host = comp.matches("[data-dcep]") ? comp : comp.querySelector("[data-dcep]");
    let cfg = {};
    try {
      cfg = JSON.parse(host.getAttribute("data-dcep"));
    } catch (e) {
      cfg = {};
    }
    const video = comp.querySelector("video[src], video source[src]");
    const src = clean(cfg.videoSrc || video && video.getAttribute("src"));
    if (!src) return [];
    const out = [];
    const posterImg = comp.querySelector(".vjs-poster img[src]");
    const poster = clean(cfg.thumbnailSrc || posterImg && posterImg.getAttribute("src"));
    if (poster && !isBroken(poster)) {
      const img = document.createElement("img");
      img.setAttribute("src", poster);
      img.setAttribute("alt", clean(cfg.alternativeText));
      out.push(img);
    }
    const settings = [];
    if (cfg.autoplay === true || cfg.autoplay === "true") settings.push("autoplay", "muted");
    settings.push("controls", "round-play-button");
    out.push(videoPara(document, src, clean(cfg.alternativeText), settings));
    return out;
  }
  function embedUrl(comp) {
    const iframe = comp.matches("iframe") ? comp : comp.querySelector("iframe[src]");
    if (!iframe) return "";
    let url;
    try {
      url = new URL(iframe.getAttribute("src"), "https://www.lufthansa.com/");
    } catch (e) {
      return "";
    }
    if (/(^|\.)youtube(-nocookie)?\.com$/.test(url.hostname)) {
      const m = url.pathname.match(/^\/embed\/([\w-]+)/);
      if (!m) return "";
      const out = new URL(`https://www.youtube-nocookie.com/embed/${m[1]}`);
      const start = parseInt(url.searchParams.get("start") || "", 10);
      if (start > 0) out.searchParams.set("start", start);
      return out.href;
    }
    if (url.hostname === "www.lufthansa-inflightentertainment.com" && /\/widgets\/?$/.test(url.pathname)) return url.href;
    return "";
  }
  function embedNodes(comp, document) {
    const href = embedUrl(comp);
    if (!href) return [];
    const a = document.createElement("a");
    a.setAttribute("href", href);
    a.textContent = href;
    const p = document.createElement("p");
    p.append(a);
    return [p];
  }

  // tools/importer/parsers/carousel-cards.js
  function parse5(element, { document }) {
    const SR_ONLY2 = ".sr-only, .visually-hidden, maui-screen-reader-label";
    const clean2 = (s) => (s || "").replace(/[​-‍﻿]/g, "").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const clone = node.cloneNode(true);
      clone.querySelectorAll(SR_ONLY2).forEach((n) => n.remove());
      return clean2(clone.textContent);
    };
    const isBroken3 = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src);
    const para = (text) => {
      const p = document.createElement("p");
      p.textContent = text;
      return p;
    };
    const loginCards = [...element.querySelectorAll(".login-oneid-card")];
    if (loginCards.length) {
      const intro = [];
      const form = element.querySelector(".dcep-login-form") || element;
      form.querySelectorAll(".richtext").forEach((rt) => {
        if (rt.closest(".login-oneid-card, maui-modal")) return;
        rt.querySelectorAll(":scope > p").forEach((p) => {
          const t = visibleText(p);
          if (t) intro.push(para(t));
        });
      });
      const rows = [];
      loginCards.forEach((card) => {
        const content = [];
        const headline = card.querySelector("maui-headline, h1, h2, h3, h4, h5, h6");
        const title = visibleText(headline);
        if (title) {
          const type = (headline.getAttribute("type") || headline.tagName).toLowerCase();
          const h = document.createElement(/^h[3-6]$/.test(type) ? type : "h3");
          h.textContent = title;
          content.push(h);
        }
        card.querySelectorAll(".richtext > p").forEach((p) => {
          const t = visibleText(p);
          if (t) content.push(para(t));
        });
        const BUTTONS = "maui-button-link, maui-button, a[href]";
        [...card.querySelectorAll(BUTTONS)].filter((b) => !b.parentElement.closest(BUTTONS)).forEach((btn) => {
          const label = visibleText(btn) || clean2(btn.getAttribute("label"));
          if (!label) return;
          const a = document.createElement("a");
          a.href = btn.getAttribute("href") || "#booking-code";
          a.textContent = label;
          const primary = btn.getAttribute("type") === "primary";
          const wrap = document.createElement(primary ? "strong" : "em");
          wrap.append(a);
          const p = document.createElement("p");
          p.append(wrap);
          content.push(p);
        });
        if (content.length) rows.push(["", content]);
      });
      const block2 = WebImporter.Blocks.createBlock(document, { name: "carousel-cards", variants: ["grid"], cells: rows });
      element.replaceWith(...intro, block2);
      return;
    }
    const viewers = [...element.querySelectorAll(".swiper-slide .videoViewer")].filter((v) => !v.closest(".swiper-slide-duplicate"));
    if (viewers.length && !element.querySelector("a.teaser, .wide-teaser, .compact-teaser")) {
      const rows = viewers.map((v) => viewerNodes(v, document)).filter((n) => n.length).map((n) => [n]);
      if (rows.length) element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "carousel-cards", variants: ["four-up"], cells: rows }));
      return;
    }
    const authors = [...element.querySelectorAll("a.author-slider-link")].filter((a) => !a.closest(".swiper-slide-duplicate"));
    if (authors.length) {
      const rows = authors.map((card) => {
        const img = [...card.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")));
        let imageCell = "";
        if (img) {
          imageCell = document.createElement("img");
          imageCell.src = img.getAttribute("src");
          imageCell.alt = img.getAttribute("alt") || "";
        }
        const content = [];
        const name = visibleText(card.querySelector(".author-name"));
        if (name) {
          const h = document.createElement("h3");
          const a = document.createElement("a");
          a.href = card.getAttribute("href");
          a.textContent = name;
          h.append(a);
          content.push(h);
        }
        const description = visibleText(card.querySelector(".author-description"));
        if (description) content.push(para(description));
        return imageCell || content.length ? [imageCell, content.length ? content : ""] : null;
      }).filter(Boolean);
      if (rows.length) element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "carousel-cards", variants: ["four-up", "authors"], cells: rows }));
      return;
    }
    if (!element.querySelector(".wide-teaser, .compact-teaser") && element.querySelector(".teaser a.teaser, a.teaser.card")) {
      const MOBILE = ".hidden-lg-up, .hidden-md-up, .d-md-none, .d-lg-none";
      const hasDesktopTwin = !!element.querySelector(".hidden-md-down a.teaser, .hidden-sm-down a.teaser");
      const isArticle = !!element.closest(".article-details-page, .article-content");
      const view = element.querySelector(":scope > .column-view") || element.querySelector(".column-view") || element;
      const titles = [];
      [...element.matches(".carousel") && view === element ? [] : view.children].filter((d) => !d.classList.contains("row") && !d.classList.contains("carousel")).forEach((d) => d.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
        const t = visibleText(h);
        if (!t) return;
        const out = document.createElement(h.tagName.toLowerCase());
        out.textContent = t;
        const size = [...h.classList].find((c) => /^heading-/.test(c));
        if (size) out.className = size;
        titles.push(out);
      }));
      const cards = [...element.querySelectorAll("a.teaser")].filter((a) => !a.closest(".swiper-slide-duplicate") && !(hasDesktopTwin && a.closest(MOBILE)));
      const rows = [];
      cards.forEach((card) => {
        const img = [...card.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")));
        let imageCell = "";
        if (img) {
          const image = document.createElement("img");
          image.src = img.getAttribute("src");
          image.alt = img.getAttribute("alt") || "";
          imageCell = image;
        }
        const href = card.getAttribute("href");
        const content = [];
        const headingEl = card.querySelector(".teaser-heading, h1, h2, h3, h4, h5, h6");
        const heading = visibleText(headingEl);
        if (heading) {
          const level = headingEl && /^H[3-6]$/.test(headingEl.tagName) ? headingEl.tagName.toLowerCase() : "h3";
          const h = document.createElement(level);
          if (href) {
            const a = document.createElement("a");
            a.href = href;
            a.textContent = heading;
            h.append(a);
          } else {
            h.textContent = heading;
          }
          content.push(h);
        }
        const description = visibleText(card.querySelector(".teaser-description"));
        if (description) content.push(para(description));
        if (!imageCell && !content.length) return;
        rows.push([imageCell, content.length ? content : ""]);
      });
      let variants = [];
      if (isArticle) variants = ["article"];
      else if (element.querySelector(".swiper-multi-slide")) variants = ["four-up"];
      else if (element.matches(".fourcolumn")) variants = ["grid", "four-up"];
      else if (element.matches(".twocolumn")) variants = ["grid", "two-up"];
      else if (!element.matches(".carousel")) variants = ["grid"];
      const block2 = WebImporter.Blocks.createBlock(document, { name: "carousel-cards", variants, cells: rows });
      element.replaceWith(...titles, block2);
      return;
    }
    const teasers = [...element.querySelectorAll(".wide-teaser, .compact-teaser")].filter((t) => !t.closest(".swiper-slide-duplicate"));
    const cells = [];
    teasers.forEach((teaser) => {
      const wide = teaser.classList.contains("wide-teaser");
      const img = [...teaser.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")));
      let imageCell = "";
      if (img) {
        const image = document.createElement("img");
        image.src = img.getAttribute("src");
        image.alt = img.getAttribute("alt") || "";
        imageCell = image;
      }
      const content = [];
      const body = teaser.querySelector(".teaser-body") || teaser;
      const eyebrow = visibleText(body.querySelector(".teaser-title"));
      if (eyebrow) content.push(para(eyebrow));
      const headline = visibleText(body.querySelector(".teaser-headline, h2, h3, h4, h5"));
      if (headline) {
        const h = document.createElement("h3");
        h.textContent = headline;
        content.push(h);
      }
      const description = visibleText(body.querySelector(".teaser-description"));
      if (description) content.push(para(description));
      const cardLink = teaser.querySelector("a.wide-teaser-link[href], a.compact-teaser-link[href], a[href]");
      const mimic = body.querySelector(".teaser-link maui-link-mimic, .teaser-link a, maui-link-mimic");
      const ctaLabel = visibleText(mimic);
      const href = mimic && mimic.getAttribute("href") && mimic.getAttribute("href") !== "#" ? mimic.getAttribute("href") : cardLink && cardLink.getAttribute("href");
      if (href && href !== "#") {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = ctaLabel || headline || eyebrow;
        const p = document.createElement("p");
        p.append(a);
        content.push(p);
      }
      if (!imageCell && !content.length) return;
      cells.push([imageCell, content.length ? content : "", wide ? "wide" : "compact"]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  function parse6(element, { document }) {
    const BLOCK_TAGS = /^(P|UL|OL|H[1-6]|TABLE|DIV|BLOCKQUOTE|PRE|DL)$/;
    const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style, noscript';
    const SKIP_COMPONENTS = '.separator, .sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], .swiper-pagination, .swiper-button-prev, .swiper-button-next, .swiper-notification, .swiper-slide-duplicate, script, style, noscript';
    const MOBILE = ".hidden-lg-up, .hidden-md-up, .d-md-none, .d-lg-none";
    const DESKTOP = ".hidden-md-down, .hidden-sm-down, .d-none.d-md-block, .d-none.d-lg-block";
    const clean2 = (s) => (s || "").replace(/[​-‍﻿]/g, "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const c = node.cloneNode(true);
      c.querySelectorAll(SKIP).forEach((n) => n.remove());
      return clean2(c.textContent);
    };
    const ARTICLE = !!element.closest(".article-details-page");
    const isBroken3 = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src) || /^(data|blob):/i.test(src);
    const isBr2 = (n) => n && n.nodeType === 1 && n.tagName === "BR";
    const isBlank = (n) => n && n.nodeType === 3 && !clean2(n.nodeValue);
    const trimBreaks = (el) => {
      while (el.lastChild && (isBr2(el.lastChild) || isBlank(el.lastChild))) el.lastChild.remove();
      while (el.firstChild && (isBr2(el.firstChild) || isBlank(el.firstChild))) el.firstChild.remove();
    };
    const tidy = (el) => {
      el.querySelectorAll(SKIP).forEach((s) => s.remove());
      el.querySelectorAll("em, i, span").forEach((s) => {
        if ([...s.classList].some((c) => /^lh(-|$)/.test(c)) && !clean2(s.textContent) && !s.querySelector("img")) s.remove();
      });
      const keep = [...el.classList].filter((c) => /^(copytext-(small|medium|large)|footnote|limited-width)$/.test(c));
      el.removeAttribute("class");
      if (keep.length) el.className = keep.join(" ");
      return el;
    };
    const splitParagraph = (p) => {
      const groups = [[]];
      const nodes = [...p.childNodes];
      for (let i = 0; i < nodes.length; i += 1) {
        if (isBr2(nodes[i])) {
          let j = i + 1;
          while (j < nodes.length && isBlank(nodes[j])) j += 1;
          if (isBr2(nodes[j])) {
            while (j < nodes.length && (isBr2(nodes[j]) || isBlank(nodes[j]))) j += 1;
            groups.push([]);
            i = j - 1;
            continue;
          }
        }
        groups[groups.length - 1].push(nodes[i]);
      }
      return groups.map((g) => {
        const np = document.createElement("p");
        if (p.className) np.className = p.className;
        g.forEach((n) => np.append(n));
        trimBreaks(np);
        return np;
      }).filter((np) => clean2(np.textContent) || np.querySelector("img"));
    };
    const richNodes = (scope) => {
      const rt = scope.querySelector(".richtext") || scope;
      const out = [];
      let run = null;
      const pushP = (p) => {
        tidy(p);
        out.push(...splitParagraph(p));
      };
      const flush = () => {
        if (run) pushP(run);
        run = null;
      };
      [...rt.childNodes].forEach((n) => {
        if (n.nodeType === 8) return;
        if (n.nodeType === 1 && n.matches(SKIP)) return;
        if (n.nodeType === 1 && BLOCK_TAGS.test(n.tagName)) {
          flush();
          const c = n.cloneNode(true);
          if (c.tagName === "P") {
            pushP(c);
            return;
          }
          tidy(c);
          if (clean2(c.textContent) || c.querySelector("img")) out.push(c);
          return;
        }
        if (isBlank(n) && !run) return;
        if (!run) run = document.createElement("p");
        run.append(n.cloneNode(true));
      });
      flush();
      if (rt.classList && rt.classList.contains("limited-width")) {
        out.forEach((n) => {
          if (/^(P|UL|OL)$/.test(n.tagName)) n.classList.add("limited-width");
        });
      }
      return out;
    };
    const MAUI = "maui-navigation-link[href], maui-button-link[href], maui-link[href], a[href]";
    const linkPara = (scope) => {
      const m = scope.querySelector(MAUI);
      if (!m) return null;
      const label = visibleText(m) || clean2(m.getAttribute("label") || m.getAttribute("aria-label"));
      const href = m.getAttribute("href");
      if (!label || !href) return null;
      const a = document.createElement("a");
      a.setAttribute("href", href);
      a.textContent = label;
      const p = document.createElement("p");
      const type = m.tagName === "MAUI-BUTTON-LINK" ? m.getAttribute("type") : null;
      if (type === "primary" || type === "secondary") {
        const wrap = document.createElement(type === "primary" ? "strong" : "em");
        wrap.append(a);
        p.append(wrap);
      } else {
        p.append(a);
      }
      return p;
    };
    const keepHeadingStyle = (from, to) => {
      if (!from || !/^H[1-6]$/.test(to.tagName)) return;
      const style = [...from.classList].find((c) => /^heading-/.test(c));
      if (style) to.className = style;
    };
    const headingFrom = (scope) => {
      const h = scope.matches("h1, h2, h3, h4, h5, h6") ? scope : scope.querySelector("h1, h2, h3, h4, h5, h6");
      const text = visibleText(h || scope);
      if (!text) return null;
      const isLabel = h && /(^|\s)copytext/.test(h.getAttribute("class") || "");
      const out = document.createElement(h && !isLabel ? h.tagName.toLowerCase() : "p");
      out.textContent = text;
      keepHeadingStyle(h, out);
      return out;
    };
    const videoPara2 = (src, label, settings) => {
      const a = document.createElement("a");
      a.setAttribute("href", src);
      a.textContent = label || src;
      const p = document.createElement("p");
      p.append(a);
      if (settings.length) p.append(` {${settings.join(" ")}}`);
      return p;
    };
    const viewerNodes2 = (comp) => {
      const host = comp.querySelector("[data-dcep]");
      let cfg = {};
      try {
        cfg = JSON.parse(host.getAttribute("data-dcep"));
      } catch (e) {
        cfg = {};
      }
      const video = comp.querySelector("video[src], video source[src]");
      const src = clean2(cfg.videoSrc || video && video.getAttribute("src"));
      if (!src) return [];
      const out = [];
      const posterImg = comp.querySelector(".vjs-poster img[src]");
      const poster = clean2(cfg.thumbnailSrc || posterImg && posterImg.getAttribute("src"));
      if (poster && !isBroken3(poster)) {
        const img = document.createElement("img");
        img.setAttribute("src", poster);
        img.setAttribute("alt", clean2(cfg.alternativeText));
        out.push(img);
      }
      const settings = [];
      if (cfg.autoplay === true || cfg.autoplay === "true") settings.push("autoplay", "muted");
      settings.push("controls", "round-play-button");
      out.push(videoPara2(src, clean2(cfg.alternativeText), settings));
      return out;
    };
    const captionPara = (comp) => {
      if (!ARTICLE) return null;
      const fc = comp.querySelector("figcaption");
      const text = fc && visibleText(fc.querySelector("maui-caption") || fc);
      if (!text) return null;
      const p = document.createElement("p");
      p.textContent = `${text} {caption}`;
      return p;
    };
    const mediaNodes = (comp) => {
      const out = mediaOnly(comp);
      const caption = out.length && captionPara(comp);
      if (caption) out.push(caption);
      return out;
    };
    const mediaOnly = (comp) => {
      const out = [];
      const img = [...comp.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")) && !i.closest(SKIP_COMPONENTS));
      const video = comp.querySelector("video[src], video source[src]");
      let image = null;
      if (img) {
        image = document.createElement("img");
        image.setAttribute("src", img.getAttribute("src"));
        image.setAttribute("alt", img.getAttribute("alt") || "");
      }
      if (video) {
        const src = video.getAttribute("src");
        if (image) out.push(image);
        const moving = !!video.closest(".dcep-moving-image");
        const button = !moving && comp.querySelector('[aria-label].moving-image-play-button, .on-image-button[aria-label], [role="button"][aria-label]');
        const settings = button ? [] : ["autoplay", "muted"];
        if (!button && (moving || video.hasAttribute("loop"))) settings.push("loop");
        if (video.hasAttribute("controls")) settings.push("controls");
        out.push(videoPara2(src, clean2(button && button.getAttribute("aria-label")), settings));
        return out;
      }
      if (!image) return out;
      const link = img.closest("a[href]");
      if (link && comp.contains(link)) {
        const a = document.createElement("a");
        a.setAttribute("href", link.getAttribute("href"));
        a.append(image);
        out.push(a);
      } else {
        out.push(image);
      }
      return out;
    };
    const teaserNodes = (teaser) => {
      const out = [];
      const h = teaser.querySelector(".teaser-heading") || teaser.querySelector("h1, h2, h3, h4, h5, h6");
      const title = h && visibleText(h.querySelector(".teaser-heading-text") || h);
      const icon = h && [...h.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")));
      if (title) {
        const heading = document.createElement(/^H[1-6]$/.test(h.tagName) ? h.tagName.toLowerCase() : "h3");
        if (icon) {
          const img = document.createElement("img");
          img.setAttribute("src", icon.getAttribute("src"));
          img.setAttribute("alt", icon.getAttribute("alt") || "");
          heading.append(img);
        }
        heading.append(title);
        keepHeadingStyle(h, heading);
        out.push(heading);
      }
      const desc = teaser.querySelector(".teaser-description");
      if (desc) {
        const paras = [...desc.querySelectorAll("p")].filter((d) => visibleText(d));
        const nodes = paras.flatMap((d) => splitParagraph(tidy(d.cloneNode(true))));
        if (!nodes.length && visibleText(desc)) {
          nodes.push(document.createElement("p"));
          nodes[0].textContent = visibleText(desc);
        }
        nodes.forEach((d) => {
          d.className = "copytext-medium";
          out.push(d);
        });
      }
      return out;
    };
    const collect = (node, out) => {
      [...node.children].forEach((child) => {
        if (child.matches(SKIP_COMPONENTS)) return;
        if (child.matches(MOBILE) && child.parentElement && child.parentElement.querySelector(`:scope > :is(${DESKTOP})`)) return;
        const cl = child.classList;
        if (cl.contains("headline")) {
          const h = headingFrom(child);
          if (h) out.push(h);
        } else if (cl.contains("text") && child.querySelector(".richtext")) {
          out.push(...richNodes(child));
        } else if (cl.contains("link") && child.querySelector(MAUI)) {
          const p = linkPara(child);
          if (p) out.push(p);
        } else if (cl.contains("image") && child.querySelector("img, video")) {
          out.push(...mediaNodes(child));
        } else if (child.matches("a.teaser:not([href])")) {
          out.push(...teaserNodes(child));
        } else if (cl.contains("videoViewer")) {
          out.push(...viewerNodes2(child));
        } else if (cl.contains("video") && child.querySelector(":scope > .video-player iframe") || cl.contains("iframe") && child.querySelector(":scope > .iframe-wrapper iframe")) {
          embedNodes(child, document).forEach((n) => {
            n.setAttribute("data-lh-embed", "");
            out.push(n);
          });
        } else {
          collect(child, out);
        }
      });
      return out;
    };
    const finishCell = (nodes) => {
      const inline = (n) => n.tagName === "IMG" || n.tagName === "A";
      if (nodes.every(inline) || !nodes.some(inline)) return nodes;
      const out = [];
      let p = null;
      nodes.forEach((n) => {
        if (inline(n)) {
          if (!p) {
            p = document.createElement("p");
            out.push(p);
          }
          p.append(n);
        } else {
          p = null;
          out.push(n);
        }
      });
      return out;
    };
    if (element.matches(".videoViewer, .image")) {
      if (!element.isConnected || !element.parentElement || element.parentElement.closest("table, .inspirationteaser, .stage, .carousel, .slideshow, .accordion, .teaser")) return;
      const media = element.classList.contains("videoViewer") ? viewerNodes2(element) : mediaNodes(element);
      if (!media.some((n) => n.tagName === "P")) return;
      element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "columns-media", cells: [[media]] }));
      return;
    }
    const floated = element.matches("p") && element.querySelector('img[style*="float"]');
    if (floated) {
      const right = /float:\s*right/i.test(floated.getAttribute("style") || "");
      const pct = parseInt(floated.getAttribute("width") || "", 10);
      const media = [];
      if (!isBroken3(floated.getAttribute("src"))) {
        const img = document.createElement("img");
        img.setAttribute("src", floated.getAttribute("src"));
        img.setAttribute("alt", floated.getAttribute("alt") || "");
        media.push(img);
      }
      const isStop = (el) => !el || !/^(P|UL|OL)$/.test(el.tagName) || el.querySelector('img[style*="float"]') || !clean2(el.textContent) && !el.querySelector("img");
      const text = [];
      for (let n = element.nextElementSibling; !isStop(n); n = element.nextElementSibling) {
        n.remove();
        n.querySelectorAll("a.btn-primary[href], a.btn-secondary[href]").forEach((a) => {
          if (a.closest("strong, em, b, i")) return;
          const wrap = document.createElement(a.classList.contains("btn-primary") ? "strong" : "em");
          a.replaceWith(wrap);
          wrap.append(a);
        });
        text.push(n);
      }
      if (!media.length || !text.length) {
        text.reverse().forEach((n) => element.after(n));
        return;
      }
      const floatBlock = WebImporter.Blocks.createBlock(document, {
        name: "columns-media",
        variants: pct > 0 && pct < 100 ? [`ratio-${pct}`] : [],
        cells: [right ? [text, media] : [media, text]]
      });
      element.replaceWith(floatBlock);
      return;
    }
    const articles = [...element.querySelectorAll(".blog-article-container")];
    if (element.classList.contains("blogoverview") && articles.length) {
      const rows = articles.map((art, i) => {
        const media = [];
        const img = [...art.querySelectorAll(".blog-article-image img")].find((x) => !isBroken3(x.getAttribute("src")));
        if (img) {
          const image = document.createElement("img");
          image.setAttribute("src", img.getAttribute("src"));
          image.setAttribute("alt", img.getAttribute("alt") || "");
          const link = img.closest("a[href]");
          if (link) {
            const a = document.createElement("a");
            a.setAttribute("href", link.getAttribute("href"));
            a.append(image);
            media.push(a);
          } else media.push(image);
        }
        const text = [];
        const tags = [...art.querySelectorAll("maui-chip[label]")].map((c) => clean2(c.getAttribute("label"))).filter(Boolean);
        if (tags.length) {
          const ul = document.createElement("ul");
          tags.forEach((t) => {
            const li = document.createElement("li");
            li.textContent = t;
            ul.append(li);
          });
          text.push(ul);
        }
        const title = art.querySelector(".article-title");
        if (title && visibleText(title)) {
          const h = document.createElement("h2");
          h.className = "heading-small";
          const titleLink = title.closest("a[href]");
          if (titleLink) {
            const a = document.createElement("a");
            a.setAttribute("href", titleLink.getAttribute("href"));
            a.textContent = visibleText(title);
            h.append(a);
          } else h.textContent = visibleText(title);
          text.push(h);
        }
        const info = [...art.querySelectorAll(".blog-article-details-info > div")].map(visibleText).filter((t) => t && t !== "|");
        if (info.length) {
          const p = document.createElement("p");
          const b = document.createElement("strong");
          b.textContent = info.join(" | ");
          p.append(b);
          text.push(p);
        }
        art.querySelectorAll(".blog-article-details > p").forEach((p) => {
          if (!visibleText(p)) return;
          const desc = tidy(p.cloneNode(true));
          desc.className = "copytext-medium";
          text.push(desc);
        });
        const more = art.querySelector(".blog-article-details-link");
        const moreP = more && linkPara(more);
        if (moreP) text.push(moreP);
        if (!text.length) return null;
        if (!media.length) return [text];
        return i % 2 === 0 ? [text, media] : [media, text];
      }).filter(Boolean);
      if (!rows.length) return;
      element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "columns-media", variants: ["media-first"], cells: rows }));
      return;
    }
    const titles = [];
    const cells = [];
    let variants = [];
    if (element.classList.contains("sidebar") || element.querySelector(":scope > .airem-sidebar")) {
      variants = ["sidebar"];
      const media = element.querySelector(".sidebar-content");
      const text = element.querySelector(".sidebar-aside");
      const row = [media ? finishCell(collect(media, [])) : [], text ? finishCell(collect(text, [])) : []];
      if (row.some((c) => c.length)) cells.push(row.map((c) => c.length ? c : ""));
      const item = element.parentElement;
      const sideView = item && item.classList.contains("column-view-item") && item.children.length === 1 && item.parentElement && item.parentElement.classList.contains("row") && item.parentElement.children.length === 1 && item.parentElement.parentElement;
      const oneColumn = sideView && sideView.classList.contains("column-view") && sideView.parentElement;
      const ownSidebar = !!oneColumn && oneColumn.matches(".onecolumn.column") && oneColumn.children.length === 1 && !!oneColumn.parentElement && oneColumn.parentElement.classList.contains("section-content") && !oneColumn.hasAttribute("data-lh-column") && !ARTICLE && !element.closest(".container-gray");
      if (ownSidebar) {
        variants.push("padded");
        const meaningful2 = (el) => !!clean2(el.textContent) || !!el.querySelector("img, picture, video, iframe");
        const isLast = [...oneColumn.parentElement.children].filter(meaningful2).pop() === oneColumn;
        const aem = oneColumn.closest(".container-content > .section");
        let next = aem && aem.nextElementSibling;
        while (next && !(next.classList.contains("section") && meaningful2(next))) next = next.nextElementSibling;
        if (isLast && next && next.querySelector(":scope > div > .section-padding-y-regular") && !next.querySelector(":scope > .container-gray")) variants.push("before-padded");
      }
    } else {
      const view = element.querySelector(":scope > .column-view") || element.querySelector(".column-view") || element;
      [...view.children].filter((d) => !d.classList.contains("row") && !d.classList.contains("carousel")).forEach((d) => {
        d.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
          const t = visibleText(h);
          if (!t) return;
          const out = document.createElement(h.tagName.toLowerCase());
          out.textContent = t;
          keepHeadingStyle(h, out);
          titles.push(out);
        });
      });
      const items = [...view.querySelectorAll(".column-view-item")].filter((it) => it.closest(".column-view") === view && !it.closest(MOBILE));
      const collected = items.map((it) => finishCell(collect(it, [])));
      const hasEmbed = collected.some((c) => c.some((n) => n.matches && n.matches("p[data-lh-embed]")));
      const NESTED = ["twocolumn", "threecolumn", "fourcolumn"];
      const nestedView = element.matches(".threecolumn, .fourcolumn") && items.map((it) => [...it.children].find((c) => NESTED.some((k) => c.classList.contains(k)) && c.querySelector(".image img") && !c.querySelector(".text, .headline, .link, .teaser"))).find(Boolean);
      if (nestedView) variants.push(`nested-${NESTED.findIndex((k) => nestedView.classList.contains(k)) + 2}`);
      const row = (hasEmbed || nestedView) && collected.some((c) => c.length) ? collected.map((c) => c.length ? c : "") : collected.filter((c) => c.length);
      if (row.length) cells.push(row);
      const sliderView = items.some((it) => [...it.querySelectorAll(".column-view > .carousel")].some((c) => c.querySelectorAll(".hidden-md-down .image img").length > 1));
      if (sliderView) variants.push("slider");
      const stacked = (ARTICLE || !sliderView) && items.some((it) => [...it.querySelectorAll(".image")].filter((img) => img.closest(".column-view-item") === it && !img.parentElement.closest(".image") && img.querySelector("img, video")).length > 1);
      if (stacked) variants.push("stacked");
      const textItem = (it) => !!it.querySelector(".headline, .text");
      if (!sliderView && view.querySelector(":scope > .carousel") && items.length > 1 && items.some(textItem) && items.some((it) => !textItem(it) && it.querySelector(".image img"))) {
        variants.push("cell-slider");
      }
      const own = element.classList.contains("column") && element.children.length === 1 && element.firstElementChild === view && !!element.parentElement && element.parentElement.classList.contains("section-content");
      if (own && !titles.length && !ARTICLE && !element.closest(".container-gray") && !view.classList.contains("container-gray")) variants.push("padded");
    }
    if (!cells.length && !titles.length) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-media", variants, cells });
    const headerText = (t) => clean2((t.querySelector("tr") || t).textContent).toLowerCase();
    const previousSameBlock = () => {
      const name = headerText(block);
      const before = [...document.querySelectorAll("table")].filter((t) => !element.contains(t) && t.compareDocumentPosition(element) & 4 && headerText(t) === name);
      const prev = before[before.length - 1];
      if (!prev) return null;
      const range = document.createRange();
      range.setStartAfter(prev);
      range.setEndBefore(element);
      const between = range.cloneContents();
      if (clean2(between.textContent)) return null;
      if (between.querySelector("img, picture, video, iframe, hr, table, h1, h2, h3, h4, h5, h6, form, input")) return null;
      return prev;
    };
    if (!titles.length && cells.length) {
      const prev = previousSameBlock();
      if (prev) {
        const rows = [...block.querySelectorAll("tr")].slice(1);
        const lastRow = [...prev.querySelectorAll("tr")].pop();
        rows.forEach((r) => lastRow.parentNode.append(r));
        element.remove();
        return;
      }
    }
    const column = element.getAttribute("data-lh-column");
    if (column) {
      const wrap = document.createElement("div");
      wrap.setAttribute("data-lh-column", column);
      wrap.append(...titles, block);
      element.replaceWith(wrap);
      return;
    }
    element.replaceWith(...titles, block);
  }

  // tools/importer/transformers/lufthansa-cleanup.js
  var SCOPE_PATHS = /* @__PURE__ */ new Set(["/at/de/100-years", "/at/de/100-years/cabin-design", "/at/de/100-years/campaigns", "/at/de/100-years/chronicle", "/at/de/100-years/crane", "/at/de/100-years/destinations", "/at/de/100-years/fleet", "/at/de/100-years/global-network", "/at/de/100-years/history", "/at/de/100-years/history/menu-on-board", "/at/de/320", "/at/de/32n", "/at/de/359", "/at/de/744", "/at/de/accessible-travel", "/at/de/additional-services", "/at/de/admission-rules", "/at/de/adressen-weltweit", "/at/de/advance-seat-reservation", "/at/de/advice-for-travellers-with-special-needs-to-and-from-the-usa", "/at/de/affiliatemarketing", "/at/de/all-check-in", "/at/de/alleinreisende-kinder", "/at/de/anmeldung-tiere-frachtraum", "/at/de/arrival-services", "/at/de/articles/authors/florian-tomberg", "/at/de/articles/explore-flying", "/at/de/articles/explore-flying/7-people-who-shaped-lufthansa-history", "/at/de/articles/explore-flying/anniversary-super-crane-special", "/at/de/articles/explore-flying/essentials-future-of-flying", "/at/de/articles/explore-flying/flying-high-christoph-quarch", "/at/de/articles/explore-flying/inflight-entertainment-vr-experience", "/at/de/articles/explore-the-world", "/at/de/articles/explore-the-world/a-perfect-day-barcelona-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-berlin-in-one-day", "/at/de/articles/explore-the-world/be-picky-barcelona-insider-tips", "/at/de/articles/explore-the-world/be-picky-frankfurt-insider-tips", "/at/de/articles/explore-the-world/eat-see-do-algiers", "/at/de/articles/explore-the-world/eat-see-do-berlin", "/at/de/articles/explore-the-world/essentials-barcelona-facts", "/at/de/articles/explore-the-world/essentials-frankfurt-facts", "/at/de/articles/explore-the-world/in-my-hood-chiswick-london", "/at/de/articles/explore-the-world/in-my-hood-district-zurich", "/at/de/articles/explore-the-world/know-before-you-go-algiers", "/at/de/articles/explore-the-world/know-before-you-go-berlin", "/at/de/articles/explore-the-world/on-the-scene-caspar-plautz-munich", "/at/de/articles/explore-the-world/on-the-scene-food-trends-istanbul", "/at/de/articles/explore-the-world/picture-perfect-austin", "/at/de/articles/explore-the-world/stop-over-tokyo", "/at/de/articles/explore-the-world/what-i-learned-living-in-barcelona", "/at/de/articles/explore-the-world/what-i-learned-living-in-frankfurt", "/at/de/articles/highlights", "/at/de/articles/highlights/all-it-takes-is-a-yes", "/at/de/articles/highlights/allegris-premium-economy-san-diego", "/at/de/articles/tags", "/at/de/articles/tags/allegris", "/at/de/articles/tags/munich", "/at/de/assistenzhunde", "/at/de/automatic-check-in", "/at/de/baggage-irregularities", "/at/de/bedeutsamste-strecken", "/at/de/befoerderungsbedingungen-group", "/at/de/befoerderungsbedingungen-lh", "/at/de/besondere-befoerderungsbedingungen-bus", "/at/de/betreuungsbedarf", "/at/de/bid-upgrade", "/at/de/boarding", "/at/de/boeing787", "/at/de/book-and-manage/additional-services/get-your-guide", "/at/de/book-and-manage/additional-services/travel-insurances", "/at/de/book-and-manage/booking-services/manage-my-bookings", "/at/de/book-and-manage/cancellation-and-refund/refund/refund-form", "/at/de/book-and-manage/digital-self-services/airline-apps", "/at/de/book-and-manage/flights/air-baltic", "/at/de/book-and-manage/flights/ana", "/at/de/book-and-manage/flights/ana/faq", "/at/de/book-and-manage/flights/giftvoucher", "/at/de/book-and-manage/flights/helvetic", "/at/de/book-and-manage/flights/lufthansa-voucher", "/at/de/book-and-manage/flights/wetlease-hub", "/at/de/book-and-manage/pax-receipt", "/at/de/book-and-manage/pax-receipt/invoices-different-countries", "/at/de/book-and-manage/rebook", "/at/de/book-and-manage/rebook/involuntary-rebooking", "/at/de/book-and-manage/rebook/voluntary-rebooking", "/at/de/book-and-manage/stopover", "/at/de/book-and-manage/stopover/bayerischer-hof", "/at/de/book-and-manage/stopover/neuschwanstein", "/at/de/book-and-manage/stopover/zugspitze", "/at/de/business-class", "/at/de/business-class-auf-kurz-und-mittelstrecken", "/at/de/business-services", "/at/de/cancellations-and-refunds", "/at/de/cash-and-miles", "/at/de/check-in-baggage", "/at/de/common", "/at/de/common/accessibility-statement", "/at/de/common/agb-extra-services-at-online-check-in", "/at/de/common/agb-extra-services-at-online-check-in/conditions-seat-reservation", "/at/de/common/compensation-voucher", "/at/de/common/imprint/lufthansa-insights-imprint", "/at/de/common/privacy-statement/privacy-statement-group", "/at/de/common/seatreservation-condtions/seat-reservations", "/at/de/cookie-policy", "/at/de/culinaryjourney", "/at/de/dangerous-dogs", "/at/de/datenerfassung-fuer-die-usa", "/at/de/datenerfassung-fuer-kanada", "/at/de/datenschutz", "/at/de/digital-self-services", "/at/de/digital-travel-companion", "/at/de/digitale-gepaeckservices", "/at/de/discover-lufthansa/carbon-offsetting/climate-protection-projects", "/at/de/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge", "/at/de/discover-lufthansa/carbon-offsetting/faq-saf", "/at/de/discover-lufthansa/carbon-offsetting/saf", "/at/de/discover-lufthansa/flightreservation-priceguarantee", "/at/de/discover-lufthansa/lufthansa-fleet/351", "/at/de/discover-lufthansa/lufthansa-group-airlines/ita-airways", "/at/de/discover-lufthansa/miles-and-more-credit-card", "/at/de/discover-lufthansa/new-onboard-experience", "/at/de/discover-lufthansa/take-off", "/at/de/doctor-on-board", "/at/de/doctor-on-board-news", "/at/de/during-your-trip/internet-overview", "/at/de/during-your-trip/lhg-wifi", "/at/de/economy-class", "/at/de/electronic-bag-tags", "/at/de/entryprocesses", "/at/de/europa-tarife-economy-class", "/at/de/europcar", "/at/de/exclusive-charter", "/at/de/faq-data-security", "/at/de/faq-ejournals", "/at/de/faq-password-security", "/at/de/farealert/best-price-alert", "/at/de/feedback", "/at/de/feedback-past-flight", "/at/de/feedback/feedbackai", "/at/de/fia-valet-service", "/at/de/first-class", "/at/de/first-class-lounges", "/at/de/first-class-personal-assistant", "/at/de/first-class-terminal", "/at/de/first-class-valet-parking-service", "/at/de/fliegen-mit-baby", "/at/de/fliegen-mit-kindern", "/at/de/fliegen-mit-kleinkind", "/at/de/fluege", "/at/de/flughafeninformation", "/at/de/flugplan-und-flugstatus", "/at/de/flugsuche", "/at/de/flugunregelmaessigkeiten", "/at/de/flynet", "/at/de/fmg-valet-parking-service", "/at/de/frankfurt-fair", "/at/de/free2move", "/at/de/freigepaeck-regeln", "/at/de/gefaehrliche-gegenstaende", "/at/de/gepaeck", "/at/de/geschaeftsbedingungen", "/at/de/gesund-reisen", "/at/de/green-fare", "/at/de/group-travel", "/at/de/gruppenreisen-und-charter", "/at/de/handgepaeck", "/at/de/hertz", "/at/de/homepage", "/at/de/hotelangebote", "/at/de/impressum", "/at/de/informationen-zum-datenschutz", "/at/de/kinder-an-bord", "/at/de/kindermenues-an-bord", "/at/de/lounge-begleitung", "/at/de/lounges", "/at/de/lufthansa-am-flughafen-duesseldorf", "/at/de/lufthansa-am-flughafen-frankfurt", "/at/de/lufthansa-am-flughafen-wien", "/at/de/lufthansa-at-berlin-airport", "/at/de/lufthansa-at-zuerich-airport", "/at/de/lufthansa-aviation-group", "/at/de/lufthansa-business-class-on-long-haul-routes", "/at/de/lufthansa-city/culinaryjourney", "/at/de/lufthansa-city/menu-card", "/at/de/lufthansa-express", "/at/de/lufthansa-express-bus", "/at/de/lufthansa-express-rail", "/at/de/lufthansa-firmenkunden", "/at/de/lufthansa-first-class-entertainment", "/at/de/lufthansa-first-class-flotte", "/at/de/lufthansa-first-class-komfort", "/at/de/lufthansa-group-star-alliance-and-partner-airlines", "/at/de/lufthansa-guide-service", "/at/de/lufthansa-reiseklassen", "/at/de/lufthansa-terminal-muenchen", "/at/de/medikamenten-transport", "/at/de/meetings-and-events", "/at/de/meetings-und-events-individuelle-angebotsanfrage", "/at/de/meetings-und-events-teilnehmer", "/at/de/mein-logbuch", "/at/de/meine-buchungen", "/at/de/menues-auf-langstreckenfluegen", "/at/de/menues-reiseklassen", "/at/de/mietwagenangebote", "/at/de/miles-and-more", "/at/de/mit-kindern-am-flughafen", "/at/de/mobility-partner-program-healthcare", "/at/de/munich-fair", "/at/de/nachhaltiger-fliegen", "/at/de/nutzungsbedingungen", "/at/de/nutzungsbedingungen-waehrungsumrechnung", "/at/de/onboard-delights", "/at/de/onboard-delights-faq", "/at/de/online-check-in", "/at/de/online-check-in-info", "/at/de/online-check-in-mit-der-ganzen-familie", "/at/de/overview-flights", "/at/de/overview-manage", "/at/de/overview-special-request", "/at/de/overview-travel-information", "/at/de/partner", "/at/de/passenger-receipt-90", "/at/de/passenger-rights", "/at/de/passengers-using-wheelchairs", "/at/de/passengers-with-sensory-impairment", "/at/de/pre-check-in", "/at/de/premium-economy-class", "/at/de/prepare-for-your-trip/baggage/baggage-conditions", "/at/de/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg", "/at/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay", "/at/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage", "/at/de/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage", "/at/de/prepare-for-your-trip/baggage/electronic-devices-and-batteries", "/at/de/prepare-for-your-trip/baggage/sport-baggage/register-ammunition", "/at/de/prepare-for-your-trip/current-travel-information", "/at/de/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system", "/at/de/prepare-for-your-trip/entry-regulations/immigration-regulations-uk", "/at/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing", "/at/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing", "/at/de/prepare-for-your-trip/special-travel-needs/medical-travel-companions", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment", "/at/de/prepare-for-your-trip/travel-classes/economy-basic", "/at/de/prepare-for-your-trip/travelling-with-children/child-in-businessclass", "/at/de/prepare-for-your-trip/travelling-with-children/planning-with-kids", "/at/de/rail-and-fly", "/at/de/rail-fly-bedingungen", "/at/de/rechnungsbeleg", "/at/de/refund", "/at/de/register-animal-cabin", "/at/de/reisebueros", "/at/de/reisen-mit-besonderen-anforderungen", "/at/de/rollstuhlbatterien", "/at/de/schengen", "/at/de/secure-flight", "/at/de/security-fast-lanes", "/at/de/sepa-bedingungen", "/at/de/sepa-bedingungen-b", "/at/de/services-am-flughafen", "/at/de/services-am-flughafen-frankfurt", "/at/de/services-am-flughafen-muenchen", "/at/de/services-an-bord", "/at/de/shopping", "/at/de/sicherheit-fuer-kleinkinder-an-bord", "/at/de/sitzplaene", "/at/de/sitzplatzreservierungen-konditionen", "/at/de/sixt", "/at/de/sondermahlzeiten", "/at/de/speisen-und-getraenke", "/at/de/sportgepaeck", "/at/de/sportgepaeck-hinzufuegen", "/at/de/support/contact/passenger-duty-united-kingdom", "/at/de/support/feedback-and-contact-airlines", "/at/de/tiere-als-handgepaeck", "/at/de/tiere-als-uebergepaeck", "/at/de/tips-senior-travellers", "/at/de/travel-expense-management", "/at/de/travel-id-terms-conditions", "/at/de/travelling-with-animals", "/at/de/traveltricks", "/at/de/uebergepaeck", "/at/de/unterhaltung-an-bord", "/at/de/upgrade-business-class-langstrecke", "/at/de/upgrade-first-class", "/at/de/upgrade-in-die-business-class", "/at/de/upgrade-in-die-premium-economy-class", "/at/de/upgrade-informationen", "/at/de/upgrade-premium-economy-class", "/at/de/upgrademoeglichkeiten", "/at/de/upgrades-im-online-check-in", "/at/de/zahlungsmoeglichkeiten-am-flughafen", "/at/de/zeitfenster-sicherheitskontrolle", "/de/de/100-years", "/de/de/100-years/cabin-design", "/de/de/100-years/campaigns", "/de/de/100-years/chronicle", "/de/de/100-years/crane", "/de/de/100-years/destinations", "/de/de/100-years/fleet", "/de/de/100-years/global-network", "/de/de/100-years/history", "/de/de/100-years/history/menu-on-board", "/de/de/320", "/de/de/32n", "/de/de/359", "/de/de/744", "/de/de/accessible-travel", "/de/de/additional-services", "/de/de/admission-rules", "/de/de/adressen-weltweit", "/de/de/advance-seat-reservation", "/de/de/advice-for-travellers-with-special-needs-to-and-from-the-usa", "/de/de/affiliatemarketing", "/de/de/all-check-in", "/de/de/alleinreisende-kinder", "/de/de/anmeldung-tiere-frachtraum", "/de/de/arrival-services", "/de/de/articles/authors/florian-tomberg", "/de/de/articles/explore-flying", "/de/de/articles/explore-flying/7-people-who-shaped-lufthansa-history", "/de/de/articles/explore-flying/anniversary-super-crane-special", "/de/de/articles/explore-flying/essentials-future-of-flying", "/de/de/articles/explore-flying/flying-high-christoph-quarch", "/de/de/articles/explore-flying/inflight-entertainment-vr-experience", "/de/de/articles/explore-the-world", "/de/de/articles/explore-the-world/a-perfect-day-barcelona-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-berlin-in-one-day", "/de/de/articles/explore-the-world/be-picky-barcelona-insider-tips", "/de/de/articles/explore-the-world/be-picky-frankfurt-insider-tips", "/de/de/articles/explore-the-world/eat-see-do-algiers", "/de/de/articles/explore-the-world/eat-see-do-berlin", "/de/de/articles/explore-the-world/essentials-barcelona-facts", "/de/de/articles/explore-the-world/essentials-frankfurt-facts", "/de/de/articles/explore-the-world/in-my-hood-chiswick-london", "/de/de/articles/explore-the-world/in-my-hood-district-zurich", "/de/de/articles/explore-the-world/know-before-you-go-algiers", "/de/de/articles/explore-the-world/know-before-you-go-berlin", "/de/de/articles/explore-the-world/on-the-scene-caspar-plautz-munich", "/de/de/articles/explore-the-world/on-the-scene-food-trends-istanbul", "/de/de/articles/explore-the-world/picture-perfect-austin", "/de/de/articles/explore-the-world/stop-over-tokyo", "/de/de/articles/explore-the-world/what-i-learned-living-in-barcelona", "/de/de/articles/explore-the-world/what-i-learned-living-in-frankfurt", "/de/de/articles/highlights", "/de/de/articles/highlights/all-it-takes-is-a-yes", "/de/de/articles/highlights/allegris-premium-economy-san-diego", "/de/de/articles/tags", "/de/de/articles/tags/allegris", "/de/de/articles/tags/munich", "/de/de/assistenzhunde", "/de/de/automatic-check-in", "/de/de/baggage-irregularities", "/de/de/bedeutsamste-strecken", "/de/de/befoerderungsbedingungen-group", "/de/de/befoerderungsbedingungen-lh", "/de/de/besondere-befoerderungsbedingungen-bus", "/de/de/betreuungsbedarf", "/de/de/bid-upgrade", "/de/de/boarding", "/de/de/boeing787", "/de/de/book-and-manage/additional-services/get-your-guide", "/de/de/book-and-manage/additional-services/travel-insurances", "/de/de/book-and-manage/booking-services/manage-my-bookings", "/de/de/book-and-manage/cancellation-and-refund/refund/refund-form", "/de/de/book-and-manage/digital-self-services/airline-apps", "/de/de/book-and-manage/flights/air-baltic", "/de/de/book-and-manage/flights/ana", "/de/de/book-and-manage/flights/ana/faq", "/de/de/book-and-manage/flights/giftvoucher", "/de/de/book-and-manage/flights/helvetic", "/de/de/book-and-manage/flights/lufthansa-voucher", "/de/de/book-and-manage/flights/wetlease-hub", "/de/de/book-and-manage/pax-receipt", "/de/de/book-and-manage/pax-receipt/invoices-different-countries", "/de/de/book-and-manage/rebook", "/de/de/book-and-manage/rebook/involuntary-rebooking", "/de/de/book-and-manage/rebook/voluntary-rebooking", "/de/de/book-and-manage/stopover", "/de/de/book-and-manage/stopover/bayerischer-hof", "/de/de/book-and-manage/stopover/neuschwanstein", "/de/de/book-and-manage/stopover/zugspitze", "/de/de/business-class", "/de/de/business-class-auf-kurz-und-mittelstrecken", "/de/de/business-services", "/de/de/cancellations-and-refunds", "/de/de/cash-and-miles", "/de/de/check-in-baggage", "/de/de/common", "/de/de/common/accessibility-statement", "/de/de/common/agb-extra-services-at-online-check-in", "/de/de/common/agb-extra-services-at-online-check-in/conditions-seat-reservation", "/de/de/common/compensation-voucher", "/de/de/common/imprint/lufthansa-insights-imprint", "/de/de/common/privacy-statement/privacy-statement-group", "/de/de/common/seatreservation-condtions/seat-reservations", "/de/de/cookie-policy", "/de/de/culinaryjourney", "/de/de/dangerous-dogs", "/de/de/datenerfassung-fuer-die-usa", "/de/de/datenerfassung-fuer-kanada", "/de/de/datenschutz", "/de/de/digital-self-services", "/de/de/digital-travel-companion", "/de/de/digitale-gepaeckservices", "/de/de/discover-lufthansa/carbon-offsetting/climate-protection-projects", "/de/de/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge", "/de/de/discover-lufthansa/carbon-offsetting/faq-saf", "/de/de/discover-lufthansa/carbon-offsetting/saf", "/de/de/discover-lufthansa/flightreservation-priceguarantee", "/de/de/discover-lufthansa/lufthansa-fleet/351", "/de/de/discover-lufthansa/lufthansa-group-airlines/ita-airways", "/de/de/discover-lufthansa/miles-and-more-credit-card", "/de/de/discover-lufthansa/new-onboard-experience", "/de/de/discover-lufthansa/take-off", "/de/de/doctor-on-board", "/de/de/doctor-on-board-news", "/de/de/during-your-trip/internet-overview", "/de/de/during-your-trip/lhg-wifi", "/de/de/economy-class", "/de/de/electronic-bag-tags", "/de/de/entryprocesses", "/de/de/europa-tarife-economy-class", "/de/de/europcar", "/de/de/exclusive-charter", "/de/de/faq-data-security", "/de/de/faq-ejournals", "/de/de/faq-password-security", "/de/de/farealert/best-price-alert", "/de/de/feedback", "/de/de/feedback-past-flight", "/de/de/feedback/feedbackai", "/de/de/fia-valet-service", "/de/de/first-class", "/de/de/first-class-lounges", "/de/de/first-class-personal-assistant", "/de/de/first-class-terminal", "/de/de/first-class-valet-parking-service", "/de/de/fliegen-mit-baby", "/de/de/fliegen-mit-kindern", "/de/de/fliegen-mit-kleinkind", "/de/de/fluege", "/de/de/flughafeninformation", "/de/de/flugplan-und-flugstatus", "/de/de/flugsuche", "/de/de/flugunregelmaessigkeiten", "/de/de/flynet", "/de/de/fmg-valet-parking-service", "/de/de/frankfurt-fair", "/de/de/free2move", "/de/de/freigepaeck-regeln", "/de/de/gefaehrliche-gegenstaende", "/de/de/gepaeck", "/de/de/geschaeftsbedingungen", "/de/de/gesund-reisen", "/de/de/green-fare", "/de/de/group-travel", "/de/de/gruppenreisen-und-charter", "/de/de/handgepaeck", "/de/de/hertz", "/de/de/homepage", "/de/de/hotelangebote", "/de/de/impressum", "/de/de/informationen-zum-datenschutz", "/de/de/kinder-an-bord", "/de/de/kindermenues-an-bord", "/de/de/lounge-begleitung", "/de/de/lounges", "/de/de/lufthansa-am-flughafen-duesseldorf", "/de/de/lufthansa-am-flughafen-frankfurt", "/de/de/lufthansa-am-flughafen-wien", "/de/de/lufthansa-at-berlin-airport", "/de/de/lufthansa-at-zuerich-airport", "/de/de/lufthansa-aviation-group", "/de/de/lufthansa-business-class-on-long-haul-routes", "/de/de/lufthansa-city/culinaryjourney", "/de/de/lufthansa-city/menu-card", "/de/de/lufthansa-express", "/de/de/lufthansa-express-bus", "/de/de/lufthansa-express-rail", "/de/de/lufthansa-firmenkunden", "/de/de/lufthansa-first-class-entertainment", "/de/de/lufthansa-first-class-flotte", "/de/de/lufthansa-first-class-komfort", "/de/de/lufthansa-group-star-alliance-and-partner-airlines", "/de/de/lufthansa-guide-service", "/de/de/lufthansa-reiseklassen", "/de/de/lufthansa-terminal-muenchen", "/de/de/medikamenten-transport", "/de/de/meetings-and-events", "/de/de/meetings-und-events-individuelle-angebotsanfrage", "/de/de/meetings-und-events-teilnehmer", "/de/de/mein-logbuch", "/de/de/meine-buchungen", "/de/de/menues-auf-langstreckenfluegen", "/de/de/menues-reiseklassen", "/de/de/mietwagenangebote", "/de/de/miles-and-more", "/de/de/mit-kindern-am-flughafen", "/de/de/mobility-partner-program-healthcare", "/de/de/munich-fair", "/de/de/nachhaltiger-fliegen", "/de/de/nutzungsbedingungen", "/de/de/nutzungsbedingungen-waehrungsumrechnung", "/de/de/onboard-delights", "/de/de/onboard-delights-faq", "/de/de/online-check-in", "/de/de/online-check-in-info", "/de/de/online-check-in-mit-der-ganzen-familie", "/de/de/overview-flights", "/de/de/overview-manage", "/de/de/overview-special-request", "/de/de/overview-travel-information", "/de/de/partner", "/de/de/passenger-receipt-90", "/de/de/passenger-rights", "/de/de/passengers-using-wheelchairs", "/de/de/passengers-with-sensory-impairment", "/de/de/pre-check-in", "/de/de/premium-economy-class", "/de/de/prepare-for-your-trip/baggage/baggage-conditions", "/de/de/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg", "/de/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay", "/de/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage", "/de/de/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage", "/de/de/prepare-for-your-trip/baggage/electronic-devices-and-batteries", "/de/de/prepare-for-your-trip/baggage/sport-baggage/register-ammunition", "/de/de/prepare-for-your-trip/current-travel-information", "/de/de/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system", "/de/de/prepare-for-your-trip/entry-regulations/immigration-regulations-uk", "/de/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing", "/de/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing", "/de/de/prepare-for-your-trip/special-travel-needs/medical-travel-companions", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment", "/de/de/prepare-for-your-trip/travel-classes/economy-basic", "/de/de/prepare-for-your-trip/travelling-with-children/child-in-businessclass", "/de/de/prepare-for-your-trip/travelling-with-children/planning-with-kids", "/de/de/rail-and-fly", "/de/de/rail-fly-bedingungen", "/de/de/rechnungsbeleg", "/de/de/refund", "/de/de/register-animal-cabin", "/de/de/reisebueros", "/de/de/reisen-mit-besonderen-anforderungen", "/de/de/rollstuhlbatterien", "/de/de/schengen", "/de/de/secure-flight", "/de/de/security-fast-lanes", "/de/de/sepa-bedingungen", "/de/de/sepa-bedingungen-b", "/de/de/services-am-flughafen", "/de/de/services-am-flughafen-frankfurt", "/de/de/services-am-flughafen-muenchen", "/de/de/services-an-bord", "/de/de/shopping", "/de/de/sicherheit-fuer-kleinkinder-an-bord", "/de/de/sitzplaene", "/de/de/sitzplatzreservierungen-konditionen", "/de/de/sixt", "/de/de/sondermahlzeiten", "/de/de/speisen-und-getraenke", "/de/de/sportgepaeck", "/de/de/sportgepaeck-hinzufuegen", "/de/de/support/contact/passenger-duty-united-kingdom", "/de/de/support/feedback-and-contact-airlines", "/de/de/tiere-als-handgepaeck", "/de/de/tiere-als-uebergepaeck", "/de/de/tips-senior-travellers", "/de/de/travel-expense-management", "/de/de/travel-id-terms-conditions", "/de/de/travelling-with-animals", "/de/de/traveltricks", "/de/de/uebergepaeck", "/de/de/unterhaltung-an-bord", "/de/de/upgrade-business-class-langstrecke", "/de/de/upgrade-first-class", "/de/de/upgrade-in-die-business-class", "/de/de/upgrade-in-die-premium-economy-class", "/de/de/upgrade-informationen", "/de/de/upgrade-premium-economy-class", "/de/de/upgrademoeglichkeiten", "/de/de/upgrades-im-online-check-in", "/de/de/zahlungsmoeglichkeiten-am-flughafen", "/de/de/zeitfenster-sicherheitskontrolle", "/de/en/100-years", "/de/en/100-years/cabin-design", "/de/en/100-years/campaigns", "/de/en/100-years/chronicle", "/de/en/100-years/crane", "/de/en/100-years/destinations", "/de/en/100-years/fleet", "/de/en/100-years/global-network", "/de/en/100-years/history", "/de/en/100-years/history/menu-on-board", "/de/en/320", "/de/en/32n", "/de/en/359", "/de/en/744", "/de/en/accessible-travel", "/de/en/add-sports-baggage", "/de/en/additional-services", "/de/en/addresses-worldwide", "/de/en/admission-rules", "/de/en/advance-seat-reservation", "/de/en/advance-seat-reservations-terms-and-conditions", "/de/en/advice-for-travellers-with-special-needs-to-and-from-the-usa", "/de/en/affiliatemarketing", "/de/en/airport-information", "/de/en/all-check-in", "/de/en/anmeldung-tiere-frachtraum", "/de/en/arrival-services", "/de/en/articles/authors/florian-tomberg", "/de/en/articles/explore-flying", "/de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history", "/de/en/articles/explore-flying/anniversary-super-crane-special", "/de/en/articles/explore-flying/essentials-future-of-flying", "/de/en/articles/explore-flying/flying-high-christoph-quarch", "/de/en/articles/explore-flying/inflight-entertainment-vr-experience", "/de/en/articles/explore-the-world", "/de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day", "/de/en/articles/explore-the-world/be-picky-barcelona-insider-tips", "/de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips", "/de/en/articles/explore-the-world/eat-see-do-algiers", "/de/en/articles/explore-the-world/eat-see-do-berlin", "/de/en/articles/explore-the-world/essentials-barcelona-facts", "/de/en/articles/explore-the-world/essentials-frankfurt-facts", "/de/en/articles/explore-the-world/in-my-hood-chiswick-london", "/de/en/articles/explore-the-world/in-my-hood-district-zurich", "/de/en/articles/explore-the-world/know-before-you-go-algiers", "/de/en/articles/explore-the-world/know-before-you-go-berlin", "/de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich", "/de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul", "/de/en/articles/explore-the-world/picture-perfect-austin", "/de/en/articles/explore-the-world/stop-over-tokyo", "/de/en/articles/explore-the-world/what-i-learned-living-in-barcelona", "/de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt", "/de/en/articles/highlights", "/de/en/articles/highlights/all-it-takes-is-a-yes", "/de/en/articles/highlights/allegris-premium-economy-san-diego", "/de/en/articles/tags", "/de/en/articles/tags/allegris", "/de/en/articles/tags/munich", "/de/en/assistenzhunde", "/de/en/automatic-check-in", "/de/en/baggage", "/de/en/baggage-irregularities", "/de/en/besondere-befoerderungsbedingungen-bus", "/de/en/bid-upgrade", "/de/en/boarding", "/de/en/boeing787", "/de/en/book-and-manage/additional-services/get-your-guide", "/de/en/book-and-manage/additional-services/travel-insurances", "/de/en/book-and-manage/booking-services/manage-my-bookings", "/de/en/book-and-manage/cancellation-and-refund/refund/refund-form", "/de/en/book-and-manage/digital-self-services/airline-apps", "/de/en/book-and-manage/flights/air-baltic", "/de/en/book-and-manage/flights/ana", "/de/en/book-and-manage/flights/ana/faq", "/de/en/book-and-manage/flights/giftvoucher", "/de/en/book-and-manage/flights/helvetic", "/de/en/book-and-manage/flights/lufthansa-voucher", "/de/en/book-and-manage/flights/wetlease-hub", "/de/en/book-and-manage/pax-receipt", "/de/en/book-and-manage/pax-receipt/invoices-different-countries", "/de/en/book-and-manage/rebook", "/de/en/book-and-manage/rebook/involuntary-rebooking", "/de/en/book-and-manage/rebook/voluntary-rebooking", "/de/en/book-and-manage/stopover", "/de/en/book-and-manage/stopover/bayerischer-hof", "/de/en/book-and-manage/stopover/neuschwanstein", "/de/en/book-and-manage/stopover/zugspitze", "/de/en/business-class", "/de/en/business-class-on-short-and-medium-haul", "/de/en/business-services", "/de/en/business-terms-and-conditions", "/de/en/cancellations-and-refunds", "/de/en/carry-on-baggage", "/de/en/cash-and-miles", "/de/en/check-in-baggage", "/de/en/check-in-with-the-family", "/de/en/child-restraint-systems", "/de/en/children-on-board", "/de/en/childrens-menus-on-board", "/de/en/common", "/de/en/common/accessibility-statement", "/de/en/common/agb-extra-services-at-online-check-in", "/de/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation", "/de/en/common/compensation-voucher", "/de/en/common/imprint/lufthansa-insights-imprint", "/de/en/common/privacy-statement/privacy-statement-group", "/de/en/common/seatreservation-condtions/seat-reservations", "/de/en/cookie-policy", "/de/en/culinaryjourney", "/de/en/dangerous-dogs", "/de/en/data-collection-canada", "/de/en/data-collection-usa", "/de/en/data-protection-information", "/de/en/datenschutz", "/de/en/digital-baggage-services", "/de/en/digital-self-services", "/de/en/digital-travel-companion", "/de/en/discover-lufthansa/carbon-offsetting/climate-protection-projects", "/de/en/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge", "/de/en/discover-lufthansa/carbon-offsetting/faq-saf", "/de/en/discover-lufthansa/carbon-offsetting/saf", "/de/en/discover-lufthansa/flightreservation-priceguarantee", "/de/en/discover-lufthansa/lufthansa-fleet/351", "/de/en/discover-lufthansa/lufthansa-group-airlines/ita-airways", "/de/en/discover-lufthansa/miles-and-more-credit-card", "/de/en/discover-lufthansa/new-onboard-experience", "/de/en/discover-lufthansa/take-off", "/de/en/doctor-on-board", "/de/en/doctor-on-board-news", "/de/en/during-your-trip/food-and-beverages/onboard-delights/faq", "/de/en/during-your-trip/internet-overview", "/de/en/during-your-trip/lhg-wifi", "/de/en/economy-class", "/de/en/electronic-bag-tags", "/de/en/entryprocesses", "/de/en/europa-tarife-economy-class", "/de/en/europcar", "/de/en/exclusive-charter", "/de/en/faq-data-security", "/de/en/faq-ejournals", "/de/en/faq-password-security", "/de/en/farealert/best-price-alert", "/de/en/feedback", "/de/en/feedback-past-flight", "/de/en/feedback/feedbackai", "/de/en/fia-valet-service", "/de/en/first-class", "/de/en/first-class-comfort", "/de/en/first-class-lounges", "/de/en/first-class-personal-assistant", "/de/en/first-class-terminal", "/de/en/first-class-valet-parking-service", "/de/en/fliegen-mit-baby", "/de/en/flight-disruptions", "/de/en/flight-search", "/de/en/flights", "/de/en/fly-more-sustainabl", "/de/en/flying-with-small-children", "/de/en/flynet", "/de/en/fmg-valet-parking-service", "/de/en/food-and-beverages", "/de/en/frankfurt-fair", "/de/en/free2move", "/de/en/freigepaeck-regeln", "/de/en/gefaehrliche-gegenstaende", "/de/en/general-conditions-currency-conversion", "/de/en/green-fare", "/de/en/group-travel", "/de/en/group-travel-and-charter", "/de/en/hertz", "/de/en/homepage", "/de/en/hotel-offers", "/de/en/imprint", "/de/en/lh-rentalcar", "/de/en/lounge-companions", "/de/en/lounges", "/de/en/lufthansa-am-flughafen-frankfurt", "/de/en/lufthansa-at-berlin-airport", "/de/en/lufthansa-at-duesseldorf-airport", "/de/en/lufthansa-at-vienna-airport", "/de/en/lufthansa-at-zuerich-airport", "/de/en/lufthansa-aviation-group", "/de/en/lufthansa-business-class-on-long-haul-routes", "/de/en/lufthansa-city/culinaryjourney", "/de/en/lufthansa-city/menu-card", "/de/en/lufthansa-corporate-customers", "/de/en/lufthansa-express", "/de/en/lufthansa-express-bus", "/de/en/lufthansa-express-rail", "/de/en/lufthansa-first-class-entertainment", "/de/en/lufthansa-first-class-fleet", "/de/en/lufthansa-group-star-alliance-and-partner-airlines", "/de/en/lufthansa-guide-service", "/de/en/lufthansa-terminal-muenchen", "/de/en/lufthansa-travel-classes", "/de/en/medikamenten-transport", "/de/en/meetings-and-events", "/de/en/meetings-and-events-delegates", "/de/en/meetings-and-events-organisers", "/de/en/menus-on-long-haul-flights", "/de/en/menus-travel-classes", "/de/en/miles-and-more", "/de/en/mobility-partner-program-healthcare", "/de/en/most-significant-route", "/de/en/munich-fair", "/de/en/my-bookings", "/de/en/my-logbook", "/de/en/onboard-delights", "/de/en/online-check-in", "/de/en/online-check-in-info", "/de/en/overview-flights", "/de/en/overview-manage", "/de/en/overview-special-request", "/de/en/overview-travel-information", "/de/en/partner", "/de/en/passenger-receipt-90", "/de/en/passenger-rights", "/de/en/passengers-using-wheelchairs", "/de/en/passengers-with-sensory-impairment", "/de/en/payment-options-at-the-airport", "/de/en/pre-check-in", "/de/en/premium-economy-class", "/de/en/prepare-for-your-trip/baggage/baggage-conditions", "/de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg", "/de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay", "/de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage", "/de/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage", "/de/en/prepare-for-your-trip/baggage/electronic-devices-and-batteries", "/de/en/prepare-for-your-trip/baggage/sport-baggage/register-ammunition", "/de/en/prepare-for-your-trip/current-travel-information", "/de/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system", "/de/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk", "/de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing", "/de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing", "/de/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment", "/de/en/prepare-for-your-trip/travel-classes/economy-basic", "/de/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass", "/de/en/prepare-for-your-trip/travelling-with-children/planning-with-kids", "/de/en/rail-and-fly", "/de/en/rail-fly-terms-and-conditions", "/de/en/rechnungsbeleg", "/de/en/refund", "/de/en/register-animal-cabin", "/de/en/schengen", "/de/en/seat-maps", "/de/en/secure-flight", "/de/en/security-check-time-slot", "/de/en/security-fast-lanes", "/de/en/sepa-terms-and-conditions", "/de/en/sepa-terms-and-conditions-b", "/de/en/services-at-frankfurt-airport", "/de/en/services-at-the-airport", "/de/en/services-munich-airport", "/de/en/services-on-board", "/de/en/shopping", "/de/en/sixt", "/de/en/special-meals", "/de/en/special-needs", "/de/en/sports-baggage", "/de/en/support/contact/passenger-duty-united-kingdom", "/de/en/support/feedback-and-contact-airlines", "/de/en/terms-and-conditions-lh", "/de/en/terms-of-service-group", "/de/en/terms-of-use", "/de/en/tiere-als-handgepaeck", "/de/en/tiere-als-uebergepaeck", "/de/en/timetable-and-flight-status", "/de/en/tips-senior-travellers", "/de/en/travel-agencies", "/de/en/travel-expense-management", "/de/en/travel-id-terms-conditions", "/de/en/travelling-healthy", "/de/en/travelling-with-animals", "/de/en/travelling-with-children", "/de/en/travelling-with-special-requirements", "/de/en/traveltricks", "/de/en/uebergepaeck", "/de/en/unaccompanied-minors", "/de/en/unterhaltung-an-bord", "/de/en/upgrade-business-class-long-haul", "/de/en/upgrade-first-class", "/de/en/upgrade-info", "/de/en/upgrade-options", "/de/en/upgrade-premium-economy-class", "/de/en/upgrade-to-business-class", "/de/en/upgrade-to-premium-economy-class", "/de/en/upgrades-at-online-check-in", "/de/en/wheelchair-batteries", "/de/en/with-children-at-the-airport", "/gb/en/100-years", "/gb/en/100-years/cabin-design", "/gb/en/100-years/campaigns", "/gb/en/100-years/chronicle", "/gb/en/100-years/crane", "/gb/en/100-years/destinations", "/gb/en/100-years/fleet", "/gb/en/100-years/global-network", "/gb/en/100-years/history", "/gb/en/100-years/history/menu-on-board", "/gb/en/320", "/gb/en/32n", "/gb/en/359", "/gb/en/744", "/gb/en/accessible-travel", "/gb/en/add-sports-baggage", "/gb/en/additional-services", "/gb/en/addresses-worldwide", "/gb/en/admission-rules", "/gb/en/advance-seat-reservation", "/gb/en/advance-seat-reservations-terms-and-conditions", "/gb/en/advice-for-travellers-with-special-needs-to-and-from-the-usa", "/gb/en/affiliatemarketing", "/gb/en/airport-information", "/gb/en/all-check-in", "/gb/en/anmeldung-tiere-frachtraum", "/gb/en/arrival-services", "/gb/en/articles/authors/florian-tomberg", "/gb/en/articles/explore-flying", "/gb/en/articles/explore-flying/7-people-who-shaped-lufthansa-history", "/gb/en/articles/explore-flying/anniversary-super-crane-special", "/gb/en/articles/explore-flying/essentials-future-of-flying", "/gb/en/articles/explore-flying/flying-high-christoph-quarch", "/gb/en/articles/explore-flying/inflight-entertainment-vr-experience", "/gb/en/articles/explore-the-world", "/gb/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day", "/gb/en/articles/explore-the-world/be-picky-barcelona-insider-tips", "/gb/en/articles/explore-the-world/be-picky-frankfurt-insider-tips", "/gb/en/articles/explore-the-world/eat-see-do-algiers", "/gb/en/articles/explore-the-world/eat-see-do-berlin", "/gb/en/articles/explore-the-world/essentials-barcelona-facts", "/gb/en/articles/explore-the-world/essentials-frankfurt-facts", "/gb/en/articles/explore-the-world/in-my-hood-chiswick-london", "/gb/en/articles/explore-the-world/in-my-hood-district-zurich", "/gb/en/articles/explore-the-world/know-before-you-go-algiers", "/gb/en/articles/explore-the-world/know-before-you-go-berlin", "/gb/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich", "/gb/en/articles/explore-the-world/on-the-scene-food-trends-istanbul", "/gb/en/articles/explore-the-world/picture-perfect-austin", "/gb/en/articles/explore-the-world/stop-over-tokyo", "/gb/en/articles/explore-the-world/what-i-learned-living-in-barcelona", "/gb/en/articles/explore-the-world/what-i-learned-living-in-frankfurt", "/gb/en/articles/highlights", "/gb/en/articles/highlights/all-it-takes-is-a-yes", "/gb/en/articles/highlights/allegris-premium-economy-san-diego", "/gb/en/articles/tags", "/gb/en/articles/tags/allegris", "/gb/en/articles/tags/munich", "/gb/en/assistenzhunde", "/gb/en/automatic-check-in", "/gb/en/baggage", "/gb/en/baggage-irregularities", "/gb/en/besondere-befoerderungsbedingungen-bus", "/gb/en/bid-upgrade", "/gb/en/boarding", "/gb/en/boeing787", "/gb/en/book-and-manage/additional-services/get-your-guide", "/gb/en/book-and-manage/additional-services/travel-insurances", "/gb/en/book-and-manage/booking-services/manage-my-bookings", "/gb/en/book-and-manage/cancellation-and-refund/refund/refund-form", "/gb/en/book-and-manage/digital-self-services/airline-apps", "/gb/en/book-and-manage/flights/air-baltic", "/gb/en/book-and-manage/flights/ana", "/gb/en/book-and-manage/flights/ana/faq", "/gb/en/book-and-manage/flights/giftvoucher", "/gb/en/book-and-manage/flights/helvetic", "/gb/en/book-and-manage/flights/lufthansa-voucher", "/gb/en/book-and-manage/flights/wetlease-hub", "/gb/en/book-and-manage/pax-receipt", "/gb/en/book-and-manage/pax-receipt/invoices-different-countries", "/gb/en/book-and-manage/rebook", "/gb/en/book-and-manage/rebook/involuntary-rebooking", "/gb/en/book-and-manage/rebook/voluntary-rebooking", "/gb/en/book-and-manage/stopover", "/gb/en/book-and-manage/stopover/bayerischer-hof", "/gb/en/book-and-manage/stopover/neuschwanstein", "/gb/en/book-and-manage/stopover/zugspitze", "/gb/en/business-class", "/gb/en/business-class-on-short-and-medium-haul", "/gb/en/business-services", "/gb/en/business-terms-and-conditions", "/gb/en/cancellations-and-refunds", "/gb/en/carry-on-baggage", "/gb/en/cash-and-miles", "/gb/en/check-in-baggage", "/gb/en/check-in-with-the-family", "/gb/en/child-restraint-systems", "/gb/en/children-on-board", "/gb/en/childrens-menus-on-board", "/gb/en/common", "/gb/en/common/accessibility-statement", "/gb/en/common/agb-extra-services-at-online-check-in", "/gb/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation", "/gb/en/common/compensation-voucher", "/gb/en/common/imprint/lufthansa-insights-imprint", "/gb/en/common/privacy-statement/privacy-statement-group", "/gb/en/common/seatreservation-condtions/seat-reservations", "/gb/en/cookie-policy", "/gb/en/culinaryjourney", "/gb/en/dangerous-dogs", "/gb/en/data-collection-canada", "/gb/en/data-collection-usa", "/gb/en/data-protection-information", "/gb/en/datenschutz", "/gb/en/digital-baggage-services", "/gb/en/digital-self-services", "/gb/en/digital-travel-companion", "/gb/en/discover-lufthansa/carbon-offsetting/climate-protection-projects", "/gb/en/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge", "/gb/en/discover-lufthansa/carbon-offsetting/faq-saf", "/gb/en/discover-lufthansa/carbon-offsetting/saf", "/gb/en/discover-lufthansa/flightreservation-priceguarantee", "/gb/en/discover-lufthansa/lufthansa-fleet/351", "/gb/en/discover-lufthansa/lufthansa-group-airlines/ita-airways", "/gb/en/discover-lufthansa/miles-and-more-credit-card", "/gb/en/discover-lufthansa/new-onboard-experience", "/gb/en/discover-lufthansa/take-off", "/gb/en/doctor-on-board", "/gb/en/doctor-on-board-news", "/gb/en/during-your-trip/food-and-beverages/onboard-delights/faq", "/gb/en/during-your-trip/internet-overview", "/gb/en/during-your-trip/lhg-wifi", "/gb/en/economy-class", "/gb/en/electronic-bag-tags", "/gb/en/entryprocesses", "/gb/en/europa-tarife-economy-class", "/gb/en/europcar", "/gb/en/exclusive-charter", "/gb/en/faq-data-security", "/gb/en/faq-ejournals", "/gb/en/faq-password-security", "/gb/en/farealert/best-price-alert", "/gb/en/feedback", "/gb/en/feedback-past-flight", "/gb/en/feedback/feedbackai", "/gb/en/fia-valet-service", "/gb/en/first-class", "/gb/en/first-class-comfort", "/gb/en/first-class-lounges", "/gb/en/first-class-personal-assistant", "/gb/en/first-class-terminal", "/gb/en/first-class-valet-parking-service", "/gb/en/fliegen-mit-baby", "/gb/en/flight-disruptions", "/gb/en/flight-search", "/gb/en/flights", "/gb/en/fly-more-sustainabl", "/gb/en/flying-with-small-children", "/gb/en/flynet", "/gb/en/fmg-valet-parking-service", "/gb/en/food-and-beverages", "/gb/en/frankfurt-fair", "/gb/en/free2move", "/gb/en/freigepaeck-regeln", "/gb/en/gefaehrliche-gegenstaende", "/gb/en/general-conditions-currency-conversion", "/gb/en/green-fare", "/gb/en/group-travel", "/gb/en/group-travel-and-charter", "/gb/en/hertz", "/gb/en/homepage", "/gb/en/hotel-offers", "/gb/en/imprint", "/gb/en/lh-rentalcar", "/gb/en/lounge-companions", "/gb/en/lounges", "/gb/en/lufthansa-am-flughafen-frankfurt", "/gb/en/lufthansa-at-berlin-airport", "/gb/en/lufthansa-at-duesseldorf-airport", "/gb/en/lufthansa-at-vienna-airport", "/gb/en/lufthansa-at-zuerich-airport", "/gb/en/lufthansa-aviation-group", "/gb/en/lufthansa-business-class-on-long-haul-routes", "/gb/en/lufthansa-city/culinaryjourney", "/gb/en/lufthansa-city/menu-card", "/gb/en/lufthansa-corporate-customers", "/gb/en/lufthansa-express", "/gb/en/lufthansa-express-bus", "/gb/en/lufthansa-express-rail", "/gb/en/lufthansa-first-class-entertainment", "/gb/en/lufthansa-first-class-fleet", "/gb/en/lufthansa-group-star-alliance-and-partner-airlines", "/gb/en/lufthansa-guide-service", "/gb/en/lufthansa-terminal-muenchen", "/gb/en/lufthansa-travel-classes", "/gb/en/medikamenten-transport", "/gb/en/meetings-and-events", "/gb/en/meetings-and-events-delegates", "/gb/en/meetings-and-events-organisers", "/gb/en/menus-on-long-haul-flights", "/gb/en/menus-travel-classes", "/gb/en/miles-and-more", "/gb/en/mobility-partner-program-healthcare", "/gb/en/most-significant-route", "/gb/en/munich-fair", "/gb/en/my-bookings", "/gb/en/my-logbook", "/gb/en/onboard-delights", "/gb/en/online-check-in", "/gb/en/online-check-in-info", "/gb/en/overview-flights", "/gb/en/overview-manage", "/gb/en/overview-special-request", "/gb/en/overview-travel-information", "/gb/en/partner", "/gb/en/passenger-receipt-90", "/gb/en/passenger-rights", "/gb/en/passengers-using-wheelchairs", "/gb/en/passengers-with-sensory-impairment", "/gb/en/payment-options-at-the-airport", "/gb/en/pre-check-in", "/gb/en/premium-economy-class", "/gb/en/prepare-for-your-trip/baggage/baggage-conditions", "/gb/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg", "/gb/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay", "/gb/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage", "/gb/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage", "/gb/en/prepare-for-your-trip/baggage/electronic-devices-and-batteries", "/gb/en/prepare-for-your-trip/baggage/sport-baggage/register-ammunition", "/gb/en/prepare-for-your-trip/current-travel-information", "/gb/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system", "/gb/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk", "/gb/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing", "/gb/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing", "/gb/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment", "/gb/en/prepare-for-your-trip/travel-classes/economy-basic", "/gb/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass", "/gb/en/prepare-for-your-trip/travelling-with-children/planning-with-kids", "/gb/en/rail-and-fly", "/gb/en/rail-fly-terms-and-conditions", "/gb/en/rechnungsbeleg", "/gb/en/refund", "/gb/en/register-animal-cabin", "/gb/en/schengen", "/gb/en/seat-maps", "/gb/en/secure-flight", "/gb/en/security-check-time-slot", "/gb/en/security-fast-lanes", "/gb/en/sepa-terms-and-conditions", "/gb/en/sepa-terms-and-conditions-b", "/gb/en/services-at-frankfurt-airport", "/gb/en/services-at-the-airport", "/gb/en/services-munich-airport", "/gb/en/services-on-board", "/gb/en/shopping", "/gb/en/sixt", "/gb/en/special-meals", "/gb/en/special-needs", "/gb/en/sports-baggage", "/gb/en/support/contact/passenger-duty-united-kingdom", "/gb/en/support/feedback-and-contact-airlines", "/gb/en/terms-and-conditions-lh", "/gb/en/terms-of-service-group", "/gb/en/terms-of-use", "/gb/en/tiere-als-handgepaeck", "/gb/en/tiere-als-uebergepaeck", "/gb/en/timetable-and-flight-status", "/gb/en/tips-senior-travellers", "/gb/en/travel-agencies", "/gb/en/travel-expense-management", "/gb/en/travel-id-terms-conditions", "/gb/en/travelling-healthy", "/gb/en/travelling-with-animals", "/gb/en/travelling-with-children", "/gb/en/travelling-with-special-requirements", "/gb/en/traveltricks", "/gb/en/uebergepaeck", "/gb/en/unaccompanied-minors", "/gb/en/unterhaltung-an-bord", "/gb/en/upgrade-business-class-long-haul", "/gb/en/upgrade-first-class", "/gb/en/upgrade-info", "/gb/en/upgrade-options", "/gb/en/upgrade-premium-economy-class", "/gb/en/upgrade-to-business-class", "/gb/en/upgrade-to-premium-economy-class", "/gb/en/upgrades-at-online-check-in", "/gb/en/wheelchair-batteries", "/gb/en/with-children-at-the-airport", "/lhg/at/de", "/lhg/at/de/dest/c/grossbritannien", "/lhg/at/de/dest/c/indien", "/lhg/at/de/dest/c/italien", "/lhg/at/de/dest/c/japan", "/lhg/at/de/dest/c/spanien", "/lhg/at/de/dest/c/usa", "/lhg/at/de/dest/co/europa", "/lhg/at/de/dest/co/nord-und-suedamerika", "/lhg/at/de/dest/cy/amman", "/lhg/at/de/dest/cy/barcelona", "/lhg/at/de/dest/cy/lissabon", "/lhg/at/de/dest/cy/london", "/lhg/at/de/dest/cy/los-angeles", "/lhg/at/de/dest/cy/new-york", "/lhg/at/de/dest/cy/palma-de-mallorca", "/lhg/at/de/dest/cy/paris", "/lhg/at/de/dest/cy/rom", "/lhg/at/de/dest/cy/tokio", "/lhg/de/de", "/lhg/de/de/dest/c/grossbritannien", "/lhg/de/de/dest/c/indien", "/lhg/de/de/dest/c/italien", "/lhg/de/de/dest/c/japan", "/lhg/de/de/dest/c/spanien", "/lhg/de/de/dest/c/usa", "/lhg/de/de/dest/co/europa", "/lhg/de/de/dest/co/nord-und-suedamerika", "/lhg/de/de/dest/cy/amman", "/lhg/de/de/dest/cy/barcelona", "/lhg/de/de/dest/cy/lissabon", "/lhg/de/de/dest/cy/london", "/lhg/de/de/dest/cy/los-angeles", "/lhg/de/de/dest/cy/new-york", "/lhg/de/de/dest/cy/new-york/business-class", "/lhg/de/de/dest/cy/palma-de-mallorca", "/lhg/de/de/dest/cy/paris", "/lhg/de/de/dest/cy/rom", "/lhg/de/de/dest/cy/tokio", "/lhg/de/de/dest/cy/tokio/business-class", "/lhg/de/de/from/cy/berlin", "/lhg/de/de/from/cy/frankfurt", "/lhg/de/de/from/cy/muenchen", "/lhg/de/de/o-d/c-c/deutschland-spanien", "/lhg/de/de/o-d/c-c/deutschland-usa", "/lhg/de/de/o-d/cy-cy/berlin-rom", "/lhg/de/de/o-d/cy-cy/frankfurt-amman", "/lhg/de/de/o-d/cy-cy/frankfurt-london", "/lhg/de/de/o-d/cy-cy/frankfurt-new-york", "/lhg/de/de/o-d/cy-cy/frankfurt-tokio", "/lhg/de/de/o-d/cy-cy/hamburg-palma-de-mallorca", "/lhg/de/de/o-d/cy-cy/muenchen-barcelona", "/lhg/de/de/o-d/cy-cy/muenchen-los-angeles", "/lhg/de/de/o-d/cy-cy/muenchen-new-york", "/lhg/de/en", "/lhg/de/en/dest/c/india", "/lhg/de/en/dest/c/italy", "/lhg/de/en/dest/c/japan", "/lhg/de/en/dest/c/spain", "/lhg/de/en/dest/c/united-kingdom", "/lhg/de/en/dest/c/usa", "/lhg/de/en/dest/co/europe", "/lhg/de/en/dest/co/north-and-south-america", "/lhg/de/en/dest/cy/amman", "/lhg/de/en/dest/cy/barcelona", "/lhg/de/en/dest/cy/lisbon", "/lhg/de/en/dest/cy/london", "/lhg/de/en/dest/cy/los-angeles", "/lhg/de/en/dest/cy/new-york", "/lhg/de/en/dest/cy/new-york/business-class", "/lhg/de/en/dest/cy/palma-de-mallorca", "/lhg/de/en/dest/cy/paris", "/lhg/de/en/dest/cy/rome", "/lhg/de/en/dest/cy/tokyo", "/lhg/de/en/dest/cy/tokyo/business-class", "/lhg/de/en/from/cy/berlin", "/lhg/de/en/from/cy/frankfurt", "/lhg/de/en/from/cy/munich", "/lhg/de/en/o-d/c-c/germany-spain", "/lhg/de/en/o-d/c-c/germany-usa", "/lhg/de/en/o-d/cy-cy/berlin-rome", "/lhg/de/en/o-d/cy-cy/frankfurt-amman", "/lhg/de/en/o-d/cy-cy/frankfurt-london", "/lhg/de/en/o-d/cy-cy/frankfurt-new-york", "/lhg/de/en/o-d/cy-cy/frankfurt-tokyo", "/lhg/de/en/o-d/cy-cy/hamburg-palma-de-mallorca", "/lhg/de/en/o-d/cy-cy/munich-barcelona", "/lhg/de/en/o-d/cy-cy/munich-los-angeles", "/lhg/de/en/o-d/cy-cy/munich-new-york", "/lhg/gb/en", "/lhg/gb/en/dest/c/india", "/lhg/gb/en/dest/c/italy", "/lhg/gb/en/dest/c/japan", "/lhg/gb/en/dest/c/spain", "/lhg/gb/en/dest/c/usa", "/lhg/gb/en/dest/co/europe", "/lhg/gb/en/dest/co/north-and-south-america", "/lhg/gb/en/dest/cy/amman", "/lhg/gb/en/dest/cy/barcelona", "/lhg/gb/en/dest/cy/lisbon", "/lhg/gb/en/dest/cy/los-angeles", "/lhg/gb/en/dest/cy/new-york", "/lhg/gb/en/dest/cy/palma-de-mallorca", "/lhg/gb/en/dest/cy/paris", "/lhg/gb/en/dest/cy/rome", "/lhg/gb/en/dest/cy/tokyo", "/lhg/gb/en/o-d/cy-cy/frankfurt-london"]);
  var LIVE_ORIGIN = "https://www.lufthansa.com";
  var SOURCE_HOSTS = ["www.lufthansa.com", "lufthansa.com", "localhost", "127.0.0.1"];
  var CHROME_SELECTORS = [
    // global header / navigation (becomes the per-locale nav fragment)
    "header",
    "#header",
    ".header-and-flyout",
    ".sticky-header-placeholder",
    ".commonheader",
    ".dcep-header-flyout",
    ".dcep-header-quick-action-links",
    // AirCore (/lhg/) header incl. the inline slide-in mega-menu
    "header.header-content-nav",
    ".header-navigation-flyout-slide-in",
    // global footer (becomes the per-locale footer fragment)
    "footer",
    "#footer",
    ".footer-area",
    ".footer-logos",
    ".commonfooter",
    // AirCore "wrong geolocation" banner (snapshots of AT/GB pages recorded from a German IP:
    // "Sie sind in Deutschland ... [Land wechseln] [Auf Seite bleiben]", fixed at the top, and its
    // 98px placeholder); not page content
    ".geobanner-sticky-wrapper",
    ".geobanner-placeholder",
    ".wrong-geolocation-banner",
    // AirCore footer bands (payment/follow-us, search + language, logo); normally inside footer#footer
    "footer .footer-brand-links",
    ".above-footer-container",
    ".secondary-footer-container",
    // the Cognigy chat assistant window, open in some snapshots (body > div > div > .webchat-root
    // #webchatWindow: "Lufthansa Chat Assistant / Hi, I'm Elisa", /de/en/overview-travel-information)
    ".webchat-root",
    // skip links, a11y live regions, AEM placeholders (breadcrumbs: convertBreadcrumbs)
    ".skiplinks",
    ".skip-links",
    "#sr-log",
    "#a11y-status-message",
    "[data-live-announcer]",
    ".cq-placeholder",
    '[class*="cq-placeholder"]',
    // OneTrust cookie consent
    "#onetrust-consent-sdk",
    "#onetrust-banner-sdk",
    "#onetrust-pc-sdk",
    "#onetrust-style",
    "#ot-sdk-btn-floating",
    ".onetrust-pc-dark-filter",
    ".optanon-alert-box-wrapper",
    // Cloudflare Turnstile pre-clearance
    "#turnstile-preclearance-frame",
    // global modals that never hold page content: location/language pickers, login, AirCore
    // loaders/spinners, UI sound effects. Content modals (fare conditions, the fleet seat-map
    // .lightbox-modal) stay until afterTransform because parsers read them.
    "maui-modal.country-language-selector-modal",
    "maui-modal.one-id-login__modal",
    ".language-selection-modal",
    ".loader",
    'audio[id^="uifx"]',
    // Tealium / utag, Monetate, Quantum Metric and other trackers
    '[id^="utag_"]',
    '[id^="utag-"]',
    '[id^="monetate"]',
    '[class^="monetate"]',
    '[id^="mt_"]',
    "#QuantumMetricFeedbackLink",
    '[id^="batBeacon"]',
    // non-content tags
    "script",
    "noscript",
    "style",
    "link",
    "template"
  ];
  var TRACKING_URL = /(utag|tealium|tiqcdn|monetate|quantummetric|doubleclick|googletagmanager|google-analytics|googleadservices|facebook\.com\/tr|bat\.bing|demdex|omtrdc|\/b\/ss\/|adsrvr|criteo|cookielaw|onetrust|optanon|challenges\.cloudflare|shop\.lufthansa\.com\/preclearance|hotjar|contentsquare|linkedin\.com\/px|pinterest\.com\/ct|t\.co\/i\/adsct)/i;
  var EMBED_URL = /(youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|brightcove|players\.|maps\.google|google\.com\/maps|lufthansa\.com|lufthansa-inflightentertainment\.com)/i;
  function keepSubpageNavHeader(document, payload) {
    const template = payload && payload.template || {};
    if (!(template.blocks || []).some((b) => b.name === "subpage-nav")) return;
    document.querySelectorAll(".container-subnav nav.subpage > header").forEach((header) => {
      const div = document.createElement("div");
      div.className = "subpage-header";
      div.append(...header.childNodes);
      header.replaceWith(div);
    });
  }
  function removeAll(root, selectors) {
    selectors.forEach((sel) => {
      let nodes = [];
      try {
        nodes = [...root.querySelectorAll(sel)];
      } catch (e) {
        return;
      }
      nodes.forEach((n) => n.remove());
    });
  }
  function isHiddenFrame(el) {
    const w = el.getAttribute("width");
    const h = el.getAttribute("height");
    const style = (el.getAttribute("style") || "").replace(/\s/g, "").toLowerCase();
    return w === "0" || w === "1" || h === "0" || h === "1" || style.includes("visibility:hidden") || style.includes("display:none") || /(^|;)width:[01]px/.test(style) || /(^|;)height:[01]px/.test(style) || style.includes("top:-50000px");
  }
  function removeTracking(document) {
    document.querySelectorAll("iframe").forEach((f) => {
      const src = f.getAttribute("src") || "";
      if (!src || isHiddenFrame(f) || TRACKING_URL.test(src) || !EMBED_URL.test(src)) f.remove();
    });
    document.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (TRACKING_URL.test(src) || isHiddenFrame(img) && !img.closest(".container-content")) img.remove();
      else if (isHiddenFrame(img) && /^(https?:)?\/\//.test(src) && !/\/content\/dam\//.test(src)) img.remove();
    });
  }
  var BREADCRUMB_SOURCES = 'maui-breadcrumb, nav.breadcrumb, nav[aria-label*="readcrumb"], .breadcrumbs';
  var BREADCRUMB_ATTR = "data-lh-import-breadcrumb";
  var BREADCRUMB_MAP = { "/at/de/additional-services": [["Home", "/at/de/homepage"], ["Extra Services", "/at/de/additional-services"]], "/at/de/befoerderungsbedingungen-group": [["Home", "/at/de/homepage"], ["Bef\xF6rderungsbedingungen der Lufthansa Group-Airlines", "/at/de/befoerderungsbedingungen-group"]], "/at/de/book-and-manage/flights/ana": [["Home", "/at/de/homepage"], ["Flugsuche", "/at/de/flugsuche"], ["ANA", "/at/de/book-and-manage/flights/ana"]], "/at/de/business-class": [["Home", "/at/de/homepage"], ["Reiseklassen", "/at/de/lufthansa-reiseklassen"], ["Business Class", "/at/de/business-class"]], "/at/de/common/agb-extra-services-at-online-check-in": [["Home", "/at/de/homepage"], ["AGB Lufthansa Services im Online Check-in", "/at/de/common/agb-extra-services-at-online-check-in"]], "/at/de/first-class": [["Home", "/at/de/homepage"], ["Reiseklassen", "/at/de/lufthansa-reiseklassen"], ["First Class", "/at/de/first-class"]], "/at/de/homepage": [["Home", "/at/de/homepage"]], "/at/de/lufthansa-reiseklassen": [["Home", "/at/de/homepage"], ["Reiseklassen", "/at/de/lufthansa-reiseklassen"]], "/at/de/nachhaltiger-fliegen": [["Home", "/at/de/homepage"], ["Nachhaltiger fliegen", "/at/de/nachhaltiger-fliegen"]], "/at/de/support/contact": [["Home", "/at/de/homepage"], ["Kontakt", "/at/de/support/contact"]], "/de/de/additional-services": [["Home", "/de/de/homepage"], ["Extra Services", "/de/de/additional-services"]], "/de/de/befoerderungsbedingungen-group": [["Home", "/de/de/homepage"], ["Bef\xF6rderungsbedingungen der Lufthansa Group-Airlines", "/de/de/befoerderungsbedingungen-group"]], "/de/de/book-and-manage/flights/ana": [["Home", "/de/de/homepage"], ["Flugsuche", "/de/de/flugsuche"], ["ANA", "/de/de/book-and-manage/flights/ana"]], "/de/de/business-class": [["Home", "/de/de/homepage"], ["Reiseklassen", "/de/de/lufthansa-reiseklassen"], ["Business Class", "/de/de/business-class"]], "/de/de/common/agb-extra-services-at-online-check-in": [["Home", "/de/de/homepage"], ["AGB Lufthansa Services im Online Check-in", "/de/de/common/agb-extra-services-at-online-check-in"]], "/de/de/first-class": [["Home", "/de/de/homepage"], ["Reiseklassen", "/de/de/lufthansa-reiseklassen"], ["First Class", "/de/de/first-class"]], "/de/de/homepage": [["Home", "/de/de/homepage"]], "/de/de/lufthansa-reiseklassen": [["Home", "/de/de/homepage"], ["Reiseklassen", "/de/de/lufthansa-reiseklassen"]], "/de/de/nachhaltiger-fliegen": [["Home", "/de/de/homepage"], ["Nachhaltiger fliegen", "/de/de/nachhaltiger-fliegen"]], "/de/de/support/contact": [["Home", "/de/de/homepage"], ["Kontakt", "/de/de/support/contact"]], "/de/en/additional-services": [["Home", "/de/en/homepage"], ["Extra services", "/de/en/additional-services"]], "/de/en/book-and-manage/flights/ana": [["Home", "/de/en/homepage"], ["Flight search", "/de/en/flight-search"], ["ANA", "/de/en/book-and-manage/flights/ana"]], "/de/en/business-class": [["Home", "/de/en/homepage"], ["Travel classes", "/de/en/lufthansa-travel-classes"], ["Business Class", "/de/en/business-class"]], "/de/en/common/agb-extra-services-at-online-check-in": [["Home", "/de/en/homepage"], ["T&Cs of Lufthansa Online Check-in Services", "/de/en/common/agb-extra-services-at-online-check-in"]], "/de/en/discover-lufthansa/campaigns": [["Home", "/de/en/homepage"], ["Campaigns", "/de/en/discover-lufthansa/campaigns"]], "/de/en/first-class": [["Home", "/de/en/homepage"], ["Travel classes", "/de/en/lufthansa-travel-classes"], ["First Class", "/de/en/first-class"]], "/de/en/fly-more-sustainabl": [["Home", "/de/en/homepage"], ["Fly more sustainably", "/de/en/fly-more-sustainabl"]], "/de/en/homepage": [["Home", "/de/en/homepage"]], "/de/en/lufthansa-travel-classes": [["Home", "/de/en/homepage"], ["Travel classes", "/de/en/lufthansa-travel-classes"]], "/de/en/support/contact": [["Home", "/de/en/homepage"], ["Contact", "/de/en/support/contact"]], "/de/en/terms-of-service-group": [["Home", "/de/en/homepage"], ["Conditions of Carriage of Lufthansa Group Airlines", "/de/en/terms-of-service-group"]], "/gb/en/additional-services": [["Home", "/gb/en/homepage"], ["Extra services", "/gb/en/additional-services"]], "/gb/en/book-and-manage/flights/ana": [["Home", "/gb/en/homepage"], ["Flight search", "/gb/en/flight-search"], ["ANA", "/gb/en/book-and-manage/flights/ana"]], "/gb/en/business-class": [["Home", "/gb/en/homepage"], ["Travel classes", "/gb/en/lufthansa-travel-classes"], ["Business Class", "/gb/en/business-class"]], "/gb/en/common/agb-extra-services-at-online-check-in": [["Home", "/gb/en/homepage"], ["T&Cs of Lufthansa Online Check-in Services", "/gb/en/common/agb-extra-services-at-online-check-in"]], "/gb/en/discover-lufthansa/campaigns": [["Home", "/gb/en/homepage"], ["Campaigns", "/gb/en/discover-lufthansa/campaigns"]], "/gb/en/first-class": [["Home", "/gb/en/homepage"], ["Travel classes", "/gb/en/lufthansa-travel-classes"], ["First Class", "/gb/en/first-class"]], "/gb/en/fly-more-sustainabl": [["Home", "/gb/en/homepage"], ["Fly more sustainably", "/gb/en/fly-more-sustainabl"]], "/gb/en/homepage": [["Home", "/gb/en/homepage"]], "/gb/en/lufthansa-travel-classes": [["Home", "/gb/en/homepage"], ["Travel classes", "/gb/en/lufthansa-travel-classes"]], "/gb/en/support/contact": [["Home", "/gb/en/homepage"], ["Contact", "/gb/en/support/contact"]], "/gb/en/terms-of-service-group": [["Home", "/gb/en/homepage"], ["Conditions of Carriage of Lufthansa Group Airlines", "/gb/en/terms-of-service-group"]], "/lhg/at/de": [["Reiseziele", "/lhg/at/de"]], "/lhg/at/de/dest/c/frankreich": [["Reiseziele", "/lhg/at/de"], ["Flug Europa", "/lhg/at/de/dest/co/europa"], ["Flug Frankreich", "/lhg/at/de/dest/c/frankreich"]], "/lhg/at/de/dest/c/jordanien": [["Reiseziele", "/lhg/at/de"], ["Flug Asien", "/lhg/at/de/dest/co/asien"], ["Flug Jordanien", "/lhg/at/de/dest/c/jordanien"]], "/lhg/at/de/dest/c/portugal": [["Reiseziele", "/lhg/at/de"], ["Flug Europa", "/lhg/at/de/dest/co/europa"], ["Flug Portugal", "/lhg/at/de/dest/c/portugal"]], "/lhg/at/de/dest/co/asien": [["Reiseziele", "/lhg/at/de"], ["Flug Asien", "/lhg/at/de/dest/co/asien"]], "/lhg/de/de": [["Reiseziele", "/lhg/de/de"]], "/lhg/de/de/dest/c/frankreich": [["Reiseziele", "/lhg/de/de"], ["Flug Europa", "/lhg/de/de/dest/co/europa"], ["Flug Frankreich", "/lhg/de/de/dest/c/frankreich"]], "/lhg/de/de/dest/c/jordanien": [["Reiseziele", "/lhg/de/de"], ["Flug Asien", "/lhg/de/de/dest/co/asien"], ["Flug Jordanien", "/lhg/de/de/dest/c/jordanien"]], "/lhg/de/de/dest/c/portugal": [["Reiseziele", "/lhg/de/de"], ["Flug Europa", "/lhg/de/de/dest/co/europa"], ["Flug Portugal", "/lhg/de/de/dest/c/portugal"]], "/lhg/de/de/dest/co/asien": [["Reiseziele", "/lhg/de/de"], ["Flug Asien", "/lhg/de/de/dest/co/asien"]], "/lhg/de/de/from": [["Fl\xFCge ab Deutschland", "/lhg/de/de/from"]], "/lhg/de/en": [["Travel destinations", "/lhg/de/en"]], "/lhg/de/en/dest/c/france": [["Travel destinations", "/lhg/de/en"], ["Flight Europe", "/lhg/de/en/dest/co/europe"], ["Flight France", "/lhg/de/en/dest/c/france"]], "/lhg/de/en/dest/c/jordan": [["Travel destinations", "/lhg/de/en"], ["Flight Asia", "/lhg/de/en/dest/co/asia"], ["Flight Jordan", "/lhg/de/en/dest/c/jordan"]], "/lhg/de/en/dest/c/portugal": [["Travel destinations", "/lhg/de/en"], ["Flight Europe", "/lhg/de/en/dest/co/europe"], ["Flight Portugal", "/lhg/de/en/dest/c/portugal"]], "/lhg/de/en/dest/co/asia": [["Travel destinations", "/lhg/de/en"], ["Flight Asia", "/lhg/de/en/dest/co/asia"]], "/lhg/de/en/from": [["Flights from Germany", "/lhg/de/en/from"]], "/lhg/gb/en": [["Travel destinations", "/lhg/gb/en"]], "/lhg/gb/en/dest/c/france": [["Travel destinations", "/lhg/gb/en"], ["Flight Europe", "/lhg/gb/en/dest/co/europe"], ["Flight France", "/lhg/gb/en/dest/c/france"]], "/lhg/gb/en/dest/c/jordan": [["Travel destinations", "/lhg/gb/en"], ["Flight Asia", "/lhg/gb/en/dest/co/asia"], ["Flight Jordan", "/lhg/gb/en/dest/c/jordan"]], "/lhg/gb/en/dest/c/portugal": [["Travel destinations", "/lhg/gb/en"], ["Flight Europe", "/lhg/gb/en/dest/co/europe"], ["Flight Portugal", "/lhg/gb/en/dest/c/portugal"]], "/lhg/gb/en/dest/co/asia": [["Travel destinations", "/lhg/gb/en"], ["Flight Asia", "/lhg/gb/en/dest/co/asia"]], "/xx/de/homepage": [["Home", "/xx/de/homepage"]] };
  function convertBreadcrumbs(document, pagePath) {
    let trail = null;
    const sources = [...document.querySelectorAll(BREADCRUMB_SOURCES)].filter((el, i, all) => !all.some((other) => other !== el && other.contains(el)));
    sources.forEach((source) => {
      if (!source.isConnected) return;
      const items = [];
      const mauiItems = [...source.querySelectorAll("maui-breadcrumb-item")];
      if (mauiItems.length) {
        mauiItems.forEach((item) => items.push({ label: cleanText(item) || item.getAttribute("label") || "", href: item.getAttribute("href") }));
      } else {
        source.querySelectorAll("li").forEach((li) => {
          const link = li.querySelector("a[href]");
          items.push({ label: cleanText(link || li), href: link ? link.getAttribute("href") : null });
        });
      }
      const crumbs = items.filter((c) => c.label);
      const wrapper = source.closest(".breadcrumb-wrapper, .maui-breadcrumb") || source;
      if (crumbs.length && !trail) trail = crumbs.map((c) => [c.label, c.href || null]);
      wrapper.remove();
    });
    document.querySelectorAll(".breadcrumb-wrapper, .breadcrumb").forEach((el) => {
      if (el.isConnected && !el.querySelector("table")) el.remove();
    });
    let hidden = false;
    if (!trail && pagePath && BREADCRUMB_MAP[pagePath]) {
      trail = BREADCRUMB_MAP[pagePath];
      hidden = true;
    }
    if (!trail) return 0;
    const og = document.querySelector('meta[property="og:title"], meta[name="og:title"]');
    const title = document.querySelector("title");
    const defaultLabel = cleanText({ textContent: og && og.getAttribute("content") || title && title.textContent || "" });
    document.documentElement.setAttribute(BREADCRUMB_ATTR, JSON.stringify({ trail, hidden, defaultLabel }));
    return 1;
  }
  function breadcrumbMetadataRows(document, payload, pagePath) {
    const raw = document.documentElement.getAttribute(BREADCRUMB_ATTR);
    if (!raw) return [];
    document.documentElement.removeAttribute(BREADCRUMB_ATTR);
    const { trail, hidden, defaultLabel } = JSON.parse(raw);
    const origins = sourceOrigins(payload);
    const market = (pagePath || "").match(/^\/(?:lhg\/)?([a-z]{2})\//);
    const resolve = (href) => {
      if (!href) return null;
      const h = market ? href.replace(/^((?:https?:)?\/\/[^/]+)?\/xx\/([a-z]{2})(?=\/|$)/, (m, host, ll) => `${host || ""}/${market[1]}/${ll}`) : href;
      return rewriteHref(h, origins) || h;
    };
    const crumbs = trail.map(([label, href]) => ({ label, href: resolve(href) }));
    const own = crumbs.pop();
    const parents = crumbs.filter((c) => c.href);
    const rows = [];
    if (parents.length) {
      const chain = [parents.pop()];
      while (!chain[0].href.startsWith("/") && parents.length) chain.unshift(parents.pop());
      const cell = document.createElement("div");
      chain.forEach((c) => {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", c.href);
        a.textContent = c.href;
        p.append(a);
        cell.append(p);
      });
      rows.push(["Parent", cell]);
      const outside = chain.filter((c) => !c.href.startsWith("/"));
      if (outside.length) rows.push(["Parent title", outside.map((c) => c.label).join(" > ")]);
      if (hidden) rows.push(["Breadcrumb", "hidden"]);
    }
    if (own && own.label && own.label !== defaultLabel) rows.push(["Breadcrumb title", own.label]);
    return rows;
  }
  function convertFeedbackQuestionnaires(document) {
    document.querySelectorAll("feedback-questionnaire").forEach((q) => {
      const label = q.querySelector("maui-label, label, legend");
      const question = label ? cleanText(label) : "";
      const answers = [...q.querySelectorAll('maui-segmented-control-item, [role="radio"]')].map(cleanText).filter(Boolean);
      const holder = q.closest(".wrapper") && q.closest(".wrapper").children.length === 1 ? q.closest(".wrapper") : q;
      if (!question || !answers.length) {
        holder.remove();
        return;
      }
      const ul = document.createElement("ul");
      answers.forEach((t) => {
        const li = document.createElement("li");
        li.textContent = t;
        ul.append(li);
      });
      const p = document.createElement("p");
      p.textContent = question;
      holder.replaceWith(WebImporter.Blocks.createBlock(document, { name: "Feedback", cells: [[p], [ul]] }));
    });
  }
  var SR_ONLY = ".sr-only, .visually-hidden, .ot-sr-only, .screenreader-only, .sr-only-focusable, maui-screen-reader-label";
  function removeScreenReaderOnly(document) {
    document.querySelectorAll("maui-tooltip").forEach((tip) => {
      const trigger = tip.querySelector('[slot="trigger"]');
      if (trigger && (trigger.tagName === "A" || trigger.hasAttribute("href") || trigger.querySelector("[href]"))) {
        tip.querySelectorAll(':scope > [slot="box"]').forEach((box) => box.remove());
      }
    });
    document.querySelectorAll(SR_ONLY).forEach((el) => {
      if (!el.isConnected) return;
      const control = el.closest("a, button, [href]");
      if (control && control !== el) {
        const clone = control.cloneNode(true);
        clone.querySelectorAll(SR_ONLY).forEach((s) => s.remove());
        const hasVisible = clone.textContent.trim() || clone.querySelector("img, svg, picture");
        if (!hasVisible) {
          el.replaceWith(document.createTextNode(el.textContent.trim()));
          return;
        }
      }
      el.remove();
    });
  }
  function unwrapSingleCellTables(document) {
    let unwrapped = 0;
    [...document.querySelectorAll("table")].reverse().forEach((table) => {
      if (!table.isConnected || table.querySelector("table")) return;
      const cells = table.querySelectorAll("td, th");
      if (cells.length !== 1 || table.querySelectorAll("tr").length !== 1) return;
      table.replaceWith(...cells[0].childNodes);
      unwrapped += 1;
    });
    return unwrapped;
  }
  var MEDIA = 'img, picture, video, audio, iframe, svg, object, embed, canvas, input, select, textarea, button, form, hr, maui-icon, [style*="background-image"]';
  var VIDEO_CONFIG = '[data-dcep*="videoSrc"]';
  var WIDGET_CONFIG = ".dcep-poi-mapping[data-dcep], .dcep-meili-car-rental[data-dcep]";
  function isEmpty(el) {
    if (el.textContent.replace(/\u00A0/g, " ").trim()) return false;
    return !el.matches(`${VIDEO_CONFIG}, ${WIDGET_CONFIG}`) && !el.querySelector(`${MEDIA}, ${VIDEO_CONFIG}, ${WIDGET_CONFIG}`);
  }
  var SEPARATOR_COMMENT = "lh-separator";
  var SEPARATOR_MIN_SPACE = 50;
  function separatorInfo(sep) {
    const hr = sep.querySelector(".hr") || sep;
    const line = hr.classList.contains("hr") && !hr.classList.contains("hr-no-layout");
    const m = (hr.getAttribute("style") || "").match(/margin-bottom:\s*(-?[\d.]+)px/i);
    const space = m ? Math.round(parseFloat(m[1])) : 25;
    const tokens = [`${line ? "divider" : "spacer"}-${Math.max(space, 0)}`];
    if (hr.classList.contains("hidden-sm-down")) tokens.push("from-768");
    return { keep: line || space >= SEPARATOR_MIN_SPACE, marker: tokens.join(" ") };
  }
  var FLOW_COMPONENT = ".text, .headline, .link, .footnote, .image:not(:has(video, .videoViewer)), .onecolumn, .twocolumn, .threecolumn, .fourcolumn";
  var FLOW_COLUMN = ".twocolumn, .threecolumn, .fourcolumn";
  function inFlow(run) {
    const prev = run[0].previousElementSibling;
    const next = run[run.length - 1].nextElementSibling;
    const space = (sep) => {
      const hr = sep.querySelector(".hr") || sep;
      const m = (hr.getAttribute("style") || "").match(/margin-bottom:\s*(-?[\d.]+)px/i);
      return m ? Math.round(parseFloat(m[1])) : 25;
    };
    if (run.some((sep) => space(sep) < 10)) return false;
    if (!next || !next.matches(FLOW_COMPONENT)) return false;
    if (prev && !prev.matches(FLOW_COMPONENT)) return false;
    return !(prev && prev.matches(FLOW_COLUMN) && next.matches(FLOW_COLUMN));
  }
  function markSeparators(document, keepInFlow) {
    const runs = [];
    document.querySelectorAll(".separator").forEach((sep) => {
      const last = runs[runs.length - 1];
      if (last && last[last.length - 1].nextElementSibling === sep) last.push(sep);
      else runs.push([sep]);
    });
    const afterGrey = (sep) => {
      const prev = sep.previousElementSibling;
      return !!prev && (prev.matches(".container-gray") || !!prev.querySelector(".container-gray"));
    };
    runs.forEach((run) => {
      const infos = run.map(separatorInfo);
      const keep = infos.some((i) => i.keep) || afterGrey(run[0]) || keepInFlow && inFlow(run);
      run.forEach((sep, i) => {
        if (!sep.isConnected) return;
        if (keep) sep.replaceWith(document.createComment(`${SEPARATOR_COMMENT} ${infos[i].marker}`));
        else sep.remove();
      });
    });
  }
  function convertSeparators(document) {
    const found = [];
    const walker = document.createTreeWalker(document.body, 128);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.nodeValue.startsWith(`${SEPARATOR_COMMENT} `)) found.push(n);
    }
    found.forEach((c) => {
      const parent = c.parentElement;
      if (!parent || parent.closest("table")) {
        c.remove();
        return;
      }
      const p = document.createElement("p");
      p.textContent = `{${c.nodeValue.slice(SEPARATOR_COMMENT.length + 1).trim()}}`;
      const textBlock = parent.closest("p, li, h1, h2, h3, h4, h5, h6");
      if (textBlock) {
        textBlock.after(p);
        c.remove();
      } else {
        c.replaceWith(p);
      }
    });
    return found.length;
  }
  function convertAuthorQuotes(document) {
    let converted = 0;
    document.querySelectorAll(".dcep-author-quote").forEach((quote) => {
      const bq = document.createElement("blockquote");
      bq.className = "authorquote";
      [".quote-text", ".subline-text"].forEach((sel) => {
        const src = quote.querySelector(sel);
        if (!src || !cleanText(src)) return;
        const paras = [...src.querySelectorAll("p")].filter((p2) => cleanText(p2));
        if (paras.length) {
          bq.append(...paras);
          return;
        }
        const p = document.createElement("p");
        p.append(...src.childNodes);
        bq.append(p);
      });
      if (!bq.children.length) return;
      if (!quote.closest(".article-details-page") && quote.closest(".section-narrow")) {
        bq.firstElementChild.append(document.createTextNode(" {narrow}"));
      }
      (quote.closest(".authorquote") || quote).replaceWith(bq);
      converted += 1;
    });
    return converted;
  }
  function markParallaxImages(document) {
    let marked = 0;
    document.querySelectorAll(".dcep-moving-image[data-dcep]").forEach((comp) => {
      if (!/"isParallaxEnabled"\s*:\s*true/.test(comp.getAttribute("data-dcep") || "")) return;
      if (comp.closest("table, .column-view-item, .sidebar, .carousel, .teaser")) return;
      const img = comp.querySelector("img");
      if (!img) return;
      img.after(document.createTextNode(" {parallax}"));
      marked += 1;
    });
    return marked;
  }
  function removeEmptyComponents(document, keepInFlow) {
    markSeparators(document, keepInFlow);
    document.querySelectorAll('.dcep-react-wrapper, [id="root"], [id$="-root"], ppfi-web-component').forEach((el) => {
      if (el.isConnected && isEmpty(el)) el.remove();
    });
    const scope = document.querySelector(".container-content, .contentpage, main") || document.body;
    [...scope.querySelectorAll('div.section, div[class*="-container"], div[class^="dcep-"]')].reverse().forEach((el) => {
      if (el.isConnected && !el.closest("form.cmp-form") && isEmpty(el)) el.remove();
    });
  }
  var COLUMN_MARK_TEMPLATES = ["info"];
  var COLUMN_ATTR = "data-lh-column";
  var COLUMN_KINDS = ".onecolumn, .twocolumn, .threecolumn, .fourcolumn";
  function columnMarksEnabled(payload) {
    const template = payload && payload.template || {};
    return COLUMN_MARK_TEMPLATES.includes(template.name);
  }
  function isOwnColumnView(el) {
    return !!el && el.matches(`:is(${COLUMN_KINDS}).column`) && el.children.length === 1 && el.firstElementChild.classList.contains("column-view");
  }
  function markColumnViews(document, payload) {
    const template = payload && payload.template || {};
    const instances = (template.blocks || []).flatMap((b) => (b.instances || []).map((sel) => [b.name, sel]));
    const blockOf = (el) => {
      const hit = instances.find(([, sel]) => {
        try {
          return el.matches(sel);
        } catch (e) {
          return false;
        }
      });
      return hit ? hit[0] : null;
    };
    const titled = (view) => [...view.children].some((d) => !d.matches(".row, .carousel") && d.querySelector(HEADING) && cleanText(d));
    let marked = 0;
    const mark = (root, kind, nested) => {
      if (!isOwnColumnView(root) || root.closest(".article-details-page")) return false;
      const view = root.firstElementChild;
      if (view.classList.contains("container-gray")) return false;
      const parent = root.parentElement;
      if (!nested && root.closest(".container-gray") && parent.matches(".section-content") && [...parent.children].filter((c) => !isEmpty(c)).length === 1) return false;
      const block = blockOf(root);
      if (block && block !== "columns-media") return false;
      if (block && kind === "sc" && !nested && !titled(view)) return false;
      root.setAttribute(COLUMN_ATTR, kind);
      marked += 1;
      return !block;
    };
    document.querySelectorAll(`:is(.section-content, .container-content) > :is(${COLUMN_KINDS})`).forEach((root) => {
      const kind = root.parentElement.matches(".section-content") ? "sc" : "cc";
      if (!mark(root, kind, false)) return;
      root.querySelectorAll(`.column-view-item > :is(${COLUMN_KINDS})`).forEach((inner) => {
        if (inner.parentElement.closest(".column-view") === root.firstElementChild) mark(inner, kind, true);
      });
    });
    return marked;
  }
  var COLUMN_LEAF = "p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote, pre, picture, img, video, iframe, form";
  var COLUMN_INLINE = "p, h1, h2, h3, h4, h5, h6, ul, ol";
  var TRAILING_MARKER = /\{([a-z0-9 -]+)\}\s*$/;
  function addMarkerToken(el, token) {
    const target = el.matches("ul, ol") ? [...el.children].filter((li) => li.tagName === "LI").pop() : el;
    if (!target) return false;
    const walker = el.ownerDocument.createTreeWalker(target, 4);
    let last = null;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.nodeValue.trim()) last = n;
    const m = last && last.nodeValue.match(TRAILING_MARKER);
    if (m) {
      const tokens = m[1].trim().split(/\s+/);
      if (tokens.includes(token)) return false;
      last.nodeValue = `${last.nodeValue.slice(0, m.index)}{${[...tokens, token].join(" ")}}`;
      return true;
    }
    target.append(el.ownerDocument.createTextNode(` {${token}}`));
    return true;
  }
  function placeColumnMarks(document) {
    const roots = [...document.querySelectorAll(`[${COLUMN_ATTR}]`)];
    let placed = 0;
    roots.forEach((root) => {
      const suffix = root.getAttribute(COLUMN_ATTR) === "cc" ? "-outer" : "";
      const leaves = [...root.querySelectorAll(COLUMN_LEAF)].filter((el) => {
        const up = el.parentElement && el.parentElement.closest(COLUMN_LEAF);
        if (up && root.contains(up)) return false;
        return el.matches("table, picture, img, video, iframe, form") || !!cleanText(el) || !!el.querySelector(MEDIA);
      });
      if (!leaves.length) return;
      const inline = (el) => el.matches(COLUMN_INLINE) && !/^\{(spacer|divider|column)-/.test(cleanText(el));
      const own = (token) => {
        const p = document.createElement("p");
        p.textContent = `{${token}}`;
        return p;
      };
      const first = leaves[0];
      const last = leaves[leaves.length - 1];
      if (!(inline(first) && addMarkerToken(first, `column-start${suffix}`))) root.prepend(own(`column-start${suffix}`));
      if (!(inline(last) && addMarkerToken(last, `column-end${suffix}`))) root.append(own(`column-end${suffix}`));
      placed += 1;
    });
    roots.forEach((root) => root.removeAttribute(COLUMN_ATTR));
    return placed;
  }
  function removeAirCoreLeftovers(document) {
    document.querySelectorAll(".language-selection-modal").forEach((m) => {
      const modal = m.closest(".modal") || m;
      if (modal.isConnected) modal.remove();
    });
    document.querySelectorAll(".info-banner, #contentInfo").forEach((banner) => {
      if (!banner.isConnected || !isEmpty(banner)) return;
      const parent = banner.parentElement;
      banner.remove();
      if (parent && parent.tagName === "DIV" && !parent.matches("main, #content, .contentpage") && isEmpty(parent)) {
        parent.remove();
      }
    });
  }
  var MOBILE_COPY = ".hidden-lg-up, .hidden-md-up, .d-md-none, .d-lg-none, .visible-xs";
  var DESKTOP_COPY = ".hidden-md-down, .hidden-sm-down, .d-none.d-md-block, .d-none.d-lg-block, .d-none.d-md-flex, .d-none.d-lg-flex";
  function assetKey(url) {
    return (url || "").trim().split(/\s/)[0].replace(/\.transform\/.*$/, "").replace(/[?#].*$/, "");
  }
  function copySignature(el) {
    const text = el.textContent.replace(/[\u200B\uFEFF]/g, "").replace(/\s+/g, " ").trim();
    const imgs = [...el.querySelectorAll("img")].map((i) => assetKey(i.getAttribute("src") || i.getAttribute("data-src") || i.getAttribute("srcset"))).filter(Boolean).sort();
    const hrefs = [...el.querySelectorAll("[href]")].map((a) => a.getAttribute("href")).sort();
    if (!text && !imgs.length && !hrefs.length) return "";
    return `${text}|${imgs.join(",")}|${hrefs.join(",")}`;
  }
  function removeMobileDuplicates(document) {
    let removed = 0;
    [...document.querySelectorAll(MOBILE_COPY)].forEach((mobile) => {
      if (!mobile.isConnected) return;
      const sig = copySignature(mobile);
      if (!sig) return;
      let scope = mobile.parentElement;
      for (let level = 0; scope && level < 3; level += 1, scope = scope.parentElement) {
        const twin = [...scope.querySelectorAll(DESKTOP_COPY)].find((d) => d !== mobile && !d.contains(mobile) && !mobile.contains(d) && copySignature(d) === sig);
        if (twin) {
          mobile.remove();
          removed += 1;
          return;
        }
      }
    });
    return removed;
  }
  function headingId(text) {
    return (text || "").trim().toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, "").replace(/ /g, "-");
  }
  var HEADING = "h1, h2, h3, h4, h5, h6";
  function cleanText(el) {
    return el.textContent.replace(/[\u200B\uFEFF]/g, "").replace(/\s+/g, " ").trim();
  }
  function headingForTarget(target) {
    if (target.matches(HEADING)) return target;
    const inner = target.querySelector(HEADING);
    if (inner && cleanText(inner) && cleanText(target).startsWith(cleanText(inner))) return inner;
    if (!cleanText(target)) {
      const next = target.nextElementSibling;
      if (next && next.matches(HEADING)) return next;
      const nextInner = next && next.querySelector(HEADING);
      if (nextInner && cleanText(next).startsWith(cleanText(nextInner))) return nextInner;
    }
    return null;
  }
  function currentPagePath(document, payload) {
    const params = payload && payload.params || {};
    const candidates = [params.originalURL, payload && payload.url];
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) candidates.push(canonical.getAttribute("href"));
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) candidates.push(ogUrl.getAttribute("content"));
    for (const c of candidates) {
      try {
        if (c) return normalizePath(new URL(c, `${LIVE_ORIGIN}/`).pathname);
      } catch (e) {
      }
    }
    return null;
  }
  function rewriteAnchors(document, pagePath) {
    const ids = /* @__PURE__ */ new Map();
    const used = /* @__PURE__ */ new Map();
    document.querySelectorAll(HEADING).forEach((h) => {
      const base = headingId(cleanText(h));
      if (!base) return;
      const n = used.get(base) || 0;
      used.set(base, n + 1);
      ids.set(h, n ? `${base}-${n}` : base);
    });
    let rewritten = 0;
    document.querySelectorAll('[href*="#"]').forEach((link) => {
      const href = (link.getAttribute("href") || "").trim();
      const hashAt = href.indexOf("#");
      const fragment = href.slice(hashAt + 1);
      if (!fragment || fragment.startsWith("/") || fragment.startsWith("!")) return;
      if (hashAt > 0) {
        let u;
        try {
          u = new URL(href, `${LIVE_ORIGIN}/`);
        } catch (e) {
          return;
        }
        if (!SOURCE_HOSTS.includes(u.hostname) || !pagePath || u.search) return;
        if (normalizePath(u.pathname).replace(/^\/content\/lh(?=\/)/, "") !== pagePath) return;
      }
      let target = null;
      try {
        target = document.getElementById(decodeURIComponent(fragment));
      } catch (e) {
        return;
      }
      if (!target) return;
      const heading = headingForTarget(target);
      const id = heading && ids.get(heading);
      if (!id) return;
      link.setAttribute("href", `#${id}`);
      rewritten += 1;
    });
    return rewritten;
  }
  var JUMP_LINK = '[variant="anchor-down"][href]';
  function onlyJumpLinks(el) {
    const links = [...el.querySelectorAll("[href]")];
    if (!links.length || !links.every((l) => l.matches(JUMP_LINK))) return null;
    const rest = el.cloneNode(true);
    rest.querySelectorAll("[href]").forEach((l) => l.remove());
    if (cleanText(rest) || rest.querySelector("img, picture, video, iframe, input, select, button")) return null;
    return links;
  }
  function jumpLinksBlock(document, links, variants) {
    const cells = links.map((l) => {
      const a = document.createElement("a");
      a.setAttribute("href", l.getAttribute("href"));
      a.textContent = cleanText(l) || l.getAttribute("label") || l.getAttribute("aria-label") || "";
      return [a];
    }).filter(([a]) => a.textContent);
    return WebImporter.Blocks.createBlock(document, { name: "Jump Links", variants, cells });
  }
  function convertJumpLinks(document) {
    let converted = 0;
    document.querySelectorAll(".imagelinklist").forEach((list) => {
      const links = list.isConnected && onlyJumpLinks(list);
      if (!links) return;
      list.replaceChildren(jumpLinksBlock(document, links, []));
      converted += 1;
    });
    document.querySelectorAll(".twocolumn, .threecolumn, .fourcolumn").forEach((col) => {
      const view = col.isConnected && col.querySelector(":scope > .column-view");
      const links = view && onlyJumpLinks(view);
      if (!links || links.length < 2) return;
      col.replaceWith(jumpLinksBlock(document, links, ["columns"]));
      converted += 1;
    });
    return converted;
  }
  var MAUI_LINK = "maui-button-link[href], maui-navigation-link[href], maui-link[href]";
  function convertMauiLinks(document) {
    const links = [...document.querySelectorAll(MAUI_LINK)].reverse();
    links.forEach((el) => {
      const a = document.createElement("a");
      a.setAttribute("href", el.getAttribute("href"));
      const title = el.getAttribute("title");
      if (title) a.setAttribute("title", title);
      if (el.querySelector("img, picture, svg")) {
        while (el.firstChild) a.append(el.firstChild);
      } else {
        a.textContent = cleanText(el) || el.getAttribute("label") || el.getAttribute("aria-label") || "";
      }
      let replacement = a;
      const type = el.tagName === "MAUI-BUTTON-LINK" ? el.getAttribute("type") : null;
      if ((type === "primary" || type === "secondary") && !el.closest("strong, em")) {
        replacement = document.createElement(type === "primary" ? "strong" : "em");
        replacement.append(a);
      }
      el.replaceWith(replacement);
    });
    return links.length;
  }
  function unwrapLinksWithoutHref(document) {
    document.querySelectorAll("a:not([href])").forEach((a) => {
      if (a.closest("table") && !a.querySelector("img, picture")) return;
      if (!a.childNodes.length) return;
      a.replaceWith(...a.childNodes);
    });
  }
  function convertClassButtons(document) {
    document.querySelectorAll("a.btn-primary[href], a.btn-secondary[href]").forEach((a) => {
      if (a.closest("strong, em, b, i, table")) return;
      const wrap = document.createElement(a.classList.contains("btn-primary") ? "strong" : "em");
      a.replaceWith(wrap);
      wrap.append(a);
    });
  }
  function removeIconsAndZeroWidth(document) {
    let icons = 0;
    document.querySelectorAll('em.lh, i.lh, span.lh, em[class*="lh-"], i[class*="lh-"], span[class*="lh-arrow"]').forEach((el) => {
      if (!el.isConnected || ![...el.classList].some((c) => /^lh-/.test(c))) return;
      if (cleanText(el) || el.querySelector("img, svg, picture, input")) return;
      el.remove();
      icons += 1;
    });
    let zw = 0;
    const walker = document.createTreeWalker(
      document.body,
      4
      /* NodeFilter.SHOW_TEXT */
    );
    const empty = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (/[\u200B\uFEFF]/.test(node.nodeValue)) {
        node.nodeValue = node.nodeValue.replace(/[\u200B\uFEFF]/g, "");
        zw += 1;
        if (!node.nodeValue) empty.push(node);
      }
    }
    empty.forEach((n) => n.remove());
    return { icons, zw };
  }
  function isBr(node) {
    return node && node.nodeType === 1 && node.tagName === "BR";
  }
  function isBlankText(node) {
    return node && node.nodeType === 3 && !node.nodeValue.replace(/\u00A0/g, " ").trim();
  }
  function splitBrParagraphs(document) {
    let added = 0;
    [...document.querySelectorAll("p")].forEach((p) => {
      if (p.closest("table") || !p.querySelector("br")) return;
      const groups = [[]];
      const nodes = [...p.childNodes];
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (isBr(node)) {
          let j = i + 1;
          while (j < nodes.length && isBlankText(nodes[j])) j += 1;
          if (isBr(nodes[j])) {
            while (j < nodes.length && (isBr(nodes[j]) || isBlankText(nodes[j]))) j += 1;
            groups.push([]);
            i = j - 1;
            continue;
          }
        }
        groups[groups.length - 1].push(node);
      }
      if (groups.length < 2) return;
      const parts = groups.map((group) => {
        while (group.length && (isBr(group[0]) || isBlankText(group[0]))) group.shift();
        while (group.length && (isBr(group[group.length - 1]) || isBlankText(group[group.length - 1]))) group.pop();
        return group;
      }).filter((group) => group.length);
      if (parts.length < 2) {
        nodes.forEach((n) => {
          if (!parts.length || !parts[0].includes(n)) n.remove();
        });
        return;
      }
      const paras = parts.map((group) => {
        const np = document.createElement("p");
        if (p.className) np.className = p.className;
        group.forEach((n) => np.append(n));
        return np;
      });
      p.replaceWith(...paras);
      added += paras.length - 1;
    });
    return added;
  }
  function parseSrcset(srcset) {
    if (!srcset) return [];
    return srcset.split(/,(?=\s*(?:\/|https?:|\.\.?\/|[a-z0-9_-]+\.transform))/i).map((part) => {
      const m = part.trim().match(/^(.*?)(?:\s+(\d+(?:\.\d+)?)([wx]))?$/);
      if (!m || !m[1]) return null;
      return { url: m[1].trim(), w: m[2] ? parseFloat(m[2]) * (m[3] === "x" ? 1e3 : 1) : 0 };
    }).filter(Boolean);
  }
  function transformWidth(url) {
    const m = url.match(/lh-dcep-transform-width-(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }
  function isBroken2(url) {
    return !url || /(^|\/)undefined(\.transform|$|\/)/.test(url) || url === "about:blank";
  }
  function absoluteImageUrl(url) {
    if (!url || url.startsWith("data:") || url.startsWith("blob:")) return url;
    let u;
    try {
      u = new URL(url, `${LIVE_ORIGIN}/`);
    } catch (e) {
      return url;
    }
    if (url.startsWith("./") || url.startsWith("../")) return url;
    if (SOURCE_HOSTS.includes(u.hostname)) {
      const pathname = encodeURI(safeDecode(u.pathname));
      return `${LIVE_ORIGIN}${pathname}${u.search}`;
    }
    return u.href;
  }
  function safeDecode(s) {
    try {
      return decodeURI(s);
    } catch (e) {
      return s;
    }
  }
  function bestImageSource(img, keepInline) {
    const candidates = [];
    const add = (url, w) => {
      if (url && !isBroken2(url)) candidates.push({ url, w: w || transformWidth(url) });
    };
    const picture = img.closest("picture");
    if (picture) {
      picture.querySelectorAll("source").forEach((s) => {
        const media = (s.getAttribute("media") || "").match(/min-width:\s*(\d+)/);
        const mediaW = media ? parseInt(media[1], 10) : 0;
        parseSrcset(s.getAttribute("srcset") || s.getAttribute("data-srcset")).forEach((c) => add(c.url, c.w || mediaW));
      });
    }
    parseSrcset(img.getAttribute("srcset")).forEach((c) => add(c.url, c.w));
    parseSrcset(img.getAttribute("data-srcset")).forEach((c) => add(c.url, c.w));
    const src = img.getAttribute("src");
    const dataSrc = img.getAttribute("data-src") || img.getAttribute("data-lazy-src");
    add(dataSrc, 0);
    const inline = src && /^(data|blob):/i.test(src);
    if (src && !inline) add(src, 0);
    if (!candidates.length) return inline && keepInline ? src : null;
    candidates.sort((a, b) => b.w - a.w);
    return candidates[0].url;
  }
  function normalizeImages(document, keepInline) {
    document.querySelectorAll("img").forEach((img) => {
      const best = bestImageSource(img, keepInline);
      if (!best) {
        const pic = img.closest("picture");
        img.remove();
        if (pic && !pic.querySelector("img")) pic.remove();
        return;
      }
      img.setAttribute("src", absoluteImageUrl(best));
      ["srcset", "data-srcset", "data-src", "data-lazy-src", "sizes", "loading"].forEach((a) => img.removeAttribute(a));
      const picture = img.closest("picture");
      if (picture) picture.querySelectorAll("source").forEach((s) => s.remove());
    });
  }
  function normalizePath(p) {
    let out = safeDecode(p || "/");
    out = out.replace(/\.html$/, "").replace(/\/+$/, "");
    return out.startsWith("/") ? out : `/${out}`;
  }
  function sourceOrigins(payload) {
    const origins = /* @__PURE__ */ new Set();
    const params = payload && payload.params || {};
    [payload && payload.url, params.originalURL].forEach((u) => {
      try {
        if (u) origins.add(new URL(u).host);
      } catch (e) {
      }
    });
    return origins;
  }
  var PAGE_PATH = /^\/(?:[a-z]{2}\/[a-z]{2}|lhg\/[a-z]{2}\/[a-z]{2})(?:\/|$)/;
  var LOCALE_ROOT = /^\/[a-z]{2}\/[a-z]{2}$/;
  function rewriteHref(href, origins) {
    const raw = (href || "").trim();
    if (!raw || raw.startsWith("#") || /^(mailto|tel|javascript|data|sms):/i.test(raw)) return null;
    const isProtocolRelative = raw.startsWith("//");
    const isAbsolute = /^[a-z][a-z0-9+.-]*:/i.test(raw) || isProtocolRelative;
    let u;
    try {
      u = new URL(raw, `${LIVE_ORIGIN}/`);
    } catch (e) {
      return null;
    }
    if (isAbsolute && !SOURCE_HOSTS.includes(u.hostname) && !origins.has(u.host)) return null;
    if (!/^https?:$/.test(u.protocol)) return null;
    const pathname = normalizePath(u.pathname);
    const pagePath = pathname.replace(/^\/content\/lh(?=\/)/, "");
    if (LOCALE_ROOT.test(pagePath) && SCOPE_PATHS.has(`${pagePath}/homepage`)) {
      return `${pagePath}/homepage${u.search}${u.hash}`;
    }
    if (PAGE_PATH.test(pagePath) && SCOPE_PATHS.has(pagePath)) {
      return `${pagePath}${u.search}${u.hash}`;
    }
    return `${LIVE_ORIGIN}${u.pathname}${u.search}${u.hash}`;
  }
  function rewriteLinks(document, payload) {
    const origins = sourceOrigins(payload);
    document.querySelectorAll("[href]").forEach((el) => {
      if (el.hasAttribute("data-live-link")) {
        el.removeAttribute("data-live-link");
        return;
      }
      const next = rewriteHref(el.getAttribute("href"), origins);
      if (next !== null && next !== el.getAttribute("href")) el.setAttribute("href", next);
    });
  }
  var TRACKING_ATTR = /^(on[a-z]+|data-(identifier-track|track[a-z-]*|tracking[a-z-]*|analytics[a-z-]*|qm-[a-z-]*|gtm[a-z-]*|utag[a-z-]*|monetate[a-z-]*|optanon[a-z-]*|testid))$/i;
  function stripTrackingAttributes(document) {
    document.querySelectorAll("*").forEach((el) => {
      [...el.attributes].forEach((a) => {
        if (TRACKING_ATTR.test(a.name)) el.removeAttribute(a.name);
      });
    });
  }
  var HEADING_STYLES = ["heading-large", "heading-medium", "heading-small", "heading-copytext-large", "heading-copytext-medium", "copytext-large"];
  var HEADING_DEFAULTS = {
    H1: "heading-large",
    H2: "heading-medium",
    H3: "heading-copytext-large",
    H4: "heading-copytext-large",
    H5: "heading-copytext-medium",
    H6: "heading-copytext-medium"
  };
  function convertClassHeadings(document) {
    document.querySelectorAll("p.h1, p.h2, p.h3, p.h4, p.h5, p.h6").forEach((p) => {
      if (!cleanText(p)) return;
      const level = [1, 2, 3, 4, 5, 6].find((n) => p.classList.contains(`h${n}`));
      const h = document.createElement(`h${level}`);
      if (level === 3) h.className = "heading-small";
      h.append(...p.childNodes);
      p.replaceWith(h);
    });
  }
  function markHeadingStyles(document) {
    let marked = 0;
    document.querySelectorAll(HEADING).forEach((h) => {
      const style = HEADING_STYLES.find((c) => h.classList.contains(c));
      if (!style || style === HEADING_DEFAULTS[h.tagName] || !cleanText(h) || /\{[a-z-]+\}\s*$/.test(h.textContent)) return;
      h.append(document.createTextNode(` {${style}}`));
      marked += 1;
    });
    return marked;
  }
  function markParagraphStyles(document) {
    let marked = 0;
    document.querySelectorAll("div.disclaimer > p").forEach((p) => p.classList.add("copytext-small"));
    document.querySelectorAll('p > span[style*="font-size"]').forEach((span) => {
      const p = span.parentElement;
      const m = (span.getAttribute("style") || "").match(/font-size:\s*([\d.]+)(pt|px)/i);
      if (!m || cleanText(span) !== cleanText(p)) return;
      const px = parseFloat(m[1]) * (m[2].toLowerCase() === "pt" ? 4 / 3 : 1);
      if (px < 15) p.classList.add("copytext-small");
    });
    const FULL_SCOPE = ".richtext:not(.limited-width)";
    const NOT_DEFAULT = ".twocolumn, .threecolumn, .fourcolumn, .accordion, .teaser, .sidebar, .article-details-page, form, fieldset, table, .disclaimer";
    const isFull = (el) => {
      const rt = el.closest(FULL_SCOPE);
      return !!rt && el.parentElement === rt && !rt.closest(NOT_DEFAULT);
    };
    const marker = (el) => /\{[a-z -]+\}\s*$/.test(el.textContent);
    document.querySelectorAll("p").forEach((p) => {
      if (!cleanText(p) || marker(p)) return;
      let style = p.classList.contains("footnote") ? "copytext-small" : ["copytext-small", "copytext-medium", "copytext-large"].find((c) => p.classList.contains(c));
      if (style === "copytext-large" && !p.querySelector("a[href]")) style = null;
      const width = isFull(p) && "full-width" || p.classList.contains("limited-width") && "limited-width" || null;
      const m = !p.closest("table") && p.closest(".richtext") && (p.getAttribute("style") || "").match(/margin-left:\s*(\d{1,3})(?:\.\d+)?px/i);
      const indent = m && +m[1] > 0 ? `indent-${m[1]}` : null;
      const tokens = [style, width, indent].filter(Boolean);
      if (!tokens.length) return;
      p.append(document.createTextNode(` {${tokens.join(" ")}}`));
      marked += 1;
    });
    document.querySelectorAll("ul, ol").forEach((list) => {
      const width = isFull(list) && "full-width" || list.classList.contains("limited-width") && "limited-width";
      if (!width) return;
      const items = [...list.children].filter((li) => li.tagName === "LI");
      const last = items[items.length - 1];
      if (!last || marker(last)) return;
      last.append(document.createTextNode(` {${width}}`));
      marked += 1;
    });
    return marked;
  }
  function convertCaptions(document) {
    let converted = 0;
    document.querySelectorAll("figcaption").forEach((fc) => {
      if (fc.closest("table")) return;
      if (!cleanText(fc)) {
        fc.remove();
        return;
      }
      const inner = fc.querySelector("maui-caption") || fc;
      const p = document.createElement("p");
      p.append(...inner.childNodes);
      p.append(document.createTextNode(" {caption}"));
      const figure = fc.closest("figure");
      if (figure) {
        fc.remove();
        figure.after(p);
      } else {
        fc.replaceWith(p);
      }
      converted += 1;
    });
    return converted;
  }
  var THEME_ATTR = "data-lh-import-theme";
  function detectTheme(document) {
    if (document.querySelector('link[href*="/digitalassistant/"][href$=".css"]')) {
      document.documentElement.setAttribute(THEME_ATTR, "digital-assistant");
    }
  }
  function addPageMetadata(document, payload) {
    const rows = [];
    const theme = document.documentElement.getAttribute(THEME_ATTR);
    if (theme) {
      document.documentElement.removeAttribute(THEME_ATTR);
      rows.push(["Theme", theme]);
    }
    rows.push(...breadcrumbMetadataRows(document, payload, currentPagePath(document, payload)));
    if (!rows.length) return;
    const existing = [...document.querySelectorAll("table")].find((t) => {
      const first = t.querySelector("tr");
      return first && cleanText(first) === "Metadata";
    });
    if (existing) {
      rows.forEach(([name, value]) => {
        const tr = document.createElement("tr");
        [name, value].forEach((v) => {
          const td = document.createElement("td");
          if (typeof v === "string") td.textContent = v;
          else td.append(...v.childNodes);
          tr.append(td);
        });
        (existing.querySelector("tbody") || existing).append(tr);
      });
      return;
    }
    const meta = WebImporter.Blocks.getMetadata(document);
    rows.forEach(([name, value]) => {
      meta[name] = value;
    });
    const head = document.head;
    if (head) {
      [
        "description",
        "og:image",
        "og:image:alt",
        "og:title",
        "og:description",
        "twitter:title",
        "twitter:description",
        "twitter:image",
        "twitter:image:alt"
      ].forEach((n) => {
        head.querySelectorAll(`meta[name="${n}"], meta[property="${n}"]`).forEach((m) => m.remove());
      });
      head.querySelectorAll("title").forEach((t) => t.remove());
    }
    document.body.append(WebImporter.Blocks.getMetadataBlock(document, meta));
  }
  function removeOverlays(document) {
    document.querySelectorAll('maui-modal, .react-modal, .modal, .lightbox-modal, [role="dialog"]').forEach((m) => {
      if (m.isConnected && !m.closest(".container-content")) m.remove();
    });
    const content = document.querySelector(".contentpage-wrapper, .contentpage, main");
    if (content) {
      [...document.body.children].forEach((child) => {
        if (child === content || child.contains(content) || child.tagName === "HR") return;
        if (child.tagName === "TABLE") return;
        if (isEmpty(child)) child.remove();
      });
    }
  }
  function transform(hookName, element, payload) {
    const document = payload && payload.document || element.ownerDocument || element;
    if (hookName === "beforeTransform") {
      const pagePath = currentPagePath(document, payload);
      detectTheme(document);
      convertBreadcrumbs(document, pagePath);
      convertFeedbackQuestionnaires(document);
      keepSubpageNavHeader(document, payload);
      removeAll(document, CHROME_SELECTORS);
      removeAirCoreLeftovers(document);
      removeTracking(document);
      removeScreenReaderOnly(document);
      unwrapSingleCellTables(document);
      removeMobileDuplicates(document);
      rewriteAnchors(document, pagePath);
      convertJumpLinks(document);
      convertAuthorQuotes(document);
      markParallaxImages(document);
      const columnMarks = columnMarksEnabled(payload) && markColumnViews(document, payload) > 0;
      removeEmptyComponents(document, columnMarks);
      normalizeImages(document, true);
    }
    if (hookName === "afterTransform") {
      removeOverlays(document);
      removeAll(document, ["script", "noscript", "style", "link", 'iframe[src*="cookielaw"]']);
      convertMauiLinks(document);
      convertClassButtons(document);
      unwrapLinksWithoutHref(document);
      removeIconsAndZeroWidth(document);
      splitBrParagraphs(document);
      convertSeparators(document);
      normalizeImages(document, false);
      rewriteLinks(document, payload);
      stripTrackingAttributes(document);
      convertClassHeadings(document);
      markHeadingStyles(document);
      convertCaptions(document);
      markParagraphStyles(document);
      placeColumnMarks(document);
      addPageMetadata(document, payload);
    }
  }

  // tools/importer/transformers/lufthansa-sections.js
  var MARKER = "data-excat-section-id";
  var BREAK = "data-excat-section-break";
  var FIRST = "data-excat-section-first";
  var SOURCE_STYLE = "data-excat-section-source-style";
  var FOLLOWING = 4;
  var SOURCE_STYLES = [[".container-gray", "grey"], [".image-wrapper.full-width-bg", "full-bleed"]];
  var STYLE_SKIP = ".sticky-price-wrapper, .dcep-sticky-price";
  var REGION_STOP = '.section-content, .container-content, .author-details-page, .column-view-item, [class*="col-"], .contentpage, main, body';
  var MEDIA2 = "img, picture, video, iframe, svg, table, input, select, textarea, button";
  function nextBreak(document, marker) {
    const after = (list) => [...list].find((hr) => hr !== marker && marker.compareDocumentPosition(hr) & FOLLOWING && !hr.closest("table"));
    return after(document.querySelectorAll(`hr[${BREAK}]`)) || after(document.querySelectorAll("hr"));
  }
  function findSectionElement(document, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = document.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function hasStyle(section) {
    const { style } = section;
    if (Array.isArray(style)) return style.filter(Boolean).length > 0;
    return typeof style === "string" && style.trim() !== "";
  }
  function styleValue(section) {
    return Array.isArray(section.style) ? section.style.filter(Boolean).join(", ") : section.style.trim();
  }
  function createBreak(document) {
    const hr = document.createElement("hr");
    hr.setAttribute(BREAK, "");
    return hr;
  }
  function styledRegions(document, template, source) {
    const blockSelectors = (template.blocks || []).flatMap((b) => b.instances || []);
    const insideBlock = (el) => blockSelectors.some((sel) => {
      try {
        return !!(el.parentElement && el.parentElement.closest(sel));
      } catch (e) {
        return false;
      }
    });
    const regions = [];
    document.querySelectorAll(source).forEach((match) => {
      if (match.closest(STYLE_SKIP) || match.parentElement && match.parentElement.closest(source)) return;
      let region = match;
      while (region.parentElement && !region.parentElement.matches(REGION_STOP)) region = region.parentElement;
      if (!region.parentElement || region.matches("main, body") || insideBlock(region)) return;
      if (regions.some((r) => r.contains(region) || region.contains(r))) return;
      regions.push(region);
    });
    return regions;
  }
  function ownColumnView(el) {
    return !!el && el.classList.contains("column") && el.children.length === 1 && el.firstElementChild.classList.contains("column-view");
  }
  function meaningful(el) {
    return !!((el.textContent || "").replace(/[\s\u00a0\u200b]/g, "") || el.querySelector(MEDIA2));
  }
  function greyStyles(region) {
    const grey = region.matches(".container-gray") ? region : region.querySelector(".container-gray");
    const styles = [];
    if (!grey) return styles;
    if (grey.classList.contains("column-view")) {
      const column = grey.parentElement;
      if (ownColumnView(column) && column.parentElement && column.parentElement.classList.contains("section-content")) styles.push("column-band");
    } else {
      const content = grey.querySelector(".section-content");
      const parts = content ? [...content.children].filter(meaningful) : [];
      if (parts.length === 1 && ownColumnView(parts[0])) {
        styles.push(content.classList.contains("section-padding-y-regular") ? "column-view" : "column-band");
      }
    }
    const aem = region.closest(".container-content > .section");
    if (aem && !aem.querySelector(":scope > .mb-default")) styles.push("flush");
    return styles;
  }
  var SPACER = /^\{(?:(spacer|divider)-\d{1,3}( from-768)?|column-(?:start|end)(?:-outer)?)\}$/;
  function contentBetween(document, root, from, to) {
    const range = document.createRange();
    if (from) range.setStartAfter(from);
    else range.setStart(root, 0);
    range.setEndBefore(to);
    const frag = range.cloneContents();
    frag.querySelectorAll("p").forEach((p) => {
      if (SPACER.test(p.textContent.trim())) p.remove();
    });
    if ((frag.textContent || "").replace(/[\s ​]/g, "")) return true;
    return !!frag.querySelector(MEDIA2);
  }
  function dropEmptyBreaks(document, root) {
    const breaks = [...document.querySelectorAll(`hr[${BREAK}]`)].filter((hr) => !hr.closest("table"));
    let prev = null;
    breaks.forEach((hr) => {
      if (contentBetween(document, root, prev, hr)) {
        prev = hr;
        return;
      }
      if (!prev) {
        hr.setAttribute(FIRST, "true");
        prev = hr;
        return;
      }
      [MARKER, SOURCE_STYLE].forEach((attr) => {
        if (!hr.hasAttribute(attr)) return;
        const merged = [prev.getAttribute(attr), hr.getAttribute(attr)].filter(Boolean).join(" ");
        prev.setAttribute(attr, merged);
      });
      hr.remove();
    });
  }
  function transform2(hookName, element, payload) {
    const template = payload && payload.template || {};
    const sections = Array.isArray(template.sections) ? template.sections : [];
    const useSections = sections.length >= 2 || sections.length === 1 && hasStyle(sections[0]);
    const document = payload && payload.document || element.ownerDocument || element;
    if (hookName === "beforeTransform") {
      if (useSections) {
        for (let i = sections.length - 1; i >= 0; i -= 1) {
          const section = sections[i];
          const el = findSectionElement(document, section);
          if (!el) continue;
          const styled = hasStyle(section);
          if (i === 0 && !styled) continue;
          const hr = createBreak(document);
          if (styled) hr.setAttribute(MARKER, section.id);
          if (i === 0) hr.setAttribute(FIRST, "true");
          el.parentNode.insertBefore(hr, el);
        }
      }
      SOURCE_STYLES.forEach(([source, style]) => {
        styledRegions(document, template, source).forEach((region) => {
          const start = createBreak(document);
          start.setAttribute(SOURCE_STYLE, [style, ...style === "grey" ? greyStyles(region) : []].join(" "));
          region.before(start);
          region.after(createBreak(document));
        });
      });
      const padded = (s) => !!s.querySelector(":scope > div > .section-padding-y-regular");
      const grey = (s) => !!s.querySelector(":scope > .container-gray");
      const aemSections = [...document.querySelectorAll(".container-content > .section")].filter((s) => (s.textContent || "").replace(/[\s\u00a0\u200b]/g, "") || s.querySelector(MEDIA2));
      aemSections.forEach((s, i) => {
        if (!i || !padded(s) || grey(s) || !padded(aemSections[i - 1])) return;
        const hr = createBreak(document);
        hr.setAttribute(SOURCE_STYLE, "padded");
        s.before(hr);
      });
      const first = aemSections[0];
      if (template.name === "info" && first && padded(first) && !grey(first) && first.querySelector("h1") && !first.querySelector(".inspirationteaser, .stage")) {
        const hr = createBreak(document);
        hr.setAttribute(SOURCE_STYLE, "padded");
        first.before(hr);
      }
      const stage = (s) => !!s.querySelector(":scope > div > .section-content > .inspirationteaser");
      aemSections.forEach((s, i) => {
        if (!stage(s)) return;
        const next = aemSections[i + 1];
        const styles = ["stage"];
        if (!s.querySelector(":scope > .mb-default")) styles.push("flush");
        if (next && padded(next) && !grey(next)) styles.push("before-padded");
        const start = createBreak(document);
        start.setAttribute(SOURCE_STYLE, styles.join(" "));
        s.before(start);
        if (next) next.before(createBreak(document));
      });
    }
    if (hookName === "afterTransform") {
      dropEmptyBreaks(document, element);
      const styleOf = (hr) => {
        const styles = [];
        (hr.getAttribute(MARKER) || "").split(" ").filter(Boolean).forEach((id) => {
          const section = sections.find((s) => s.id === id);
          if (section && hasStyle(section)) styles.push(styleValue(section));
        });
        (hr.getAttribute(SOURCE_STYLE) || "").split(" ").filter(Boolean).forEach((style) => {
          if (!styles.some((s) => s.split(/,\s*/).includes(style))) styles.unshift(style);
        });
        return styles.join(", ");
      };
      const marked = [...document.querySelectorAll(`hr[${MARKER}], hr[${SOURCE_STYLE}]`)].filter((hr) => !hr.closest("table"));
      marked.reverse().forEach((marker) => {
        const style = styleOf(marker);
        if (style) {
          const meta = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style }
          });
          const next = nextBreak(document, marker);
          if (next) next.parentNode.insertBefore(meta, next);
          else element.appendChild(meta);
        }
      });
      document.querySelectorAll(`hr[${BREAK}]`).forEach((hr) => {
        if (hr.getAttribute(FIRST) === "true") {
          hr.remove();
          return;
        }
        [MARKER, SOURCE_STYLE, BREAK].forEach((attr) => hr.removeAttribute(attr));
      });
    }
  }

  // tools/importer/import-fleet.js
  var PAGE_TEMPLATE = {
    "name": "fleet",
    "description": "Aircraft type and seat-map pages",
    "urls": [
      "https://www.lufthansa.com/de/en/359"
    ],
    "blocks": [
      {
        "name": "subpage-nav",
        "instances": [
          ".container-subnav:has(nav.subpage)"
        ]
      },
      {
        "name": "hero-campaign",
        "instances": [
          ".inspirationteaser"
        ]
      },
      {
        "name": "carousel-lightbox",
        "instances": [
          ".slideshow"
        ]
      },
      {
        "name": "table-striped",
        "instances": [
          "div.table:has(.cms-table-maui-wrapper)"
        ]
      },
      {
        "name": "carousel-cards",
        "instances": [
          ".carousel:has(a.teaser.card)"
        ]
      },
      {
        "name": "columns-media",
        "instances": [
          ".sidebar:not(:has(.twocolumn, .threecolumn, .fourcolumn, .onecolumn, .poimapping, .messagecenterwrapper, .videoViewer, .teaser, .imagelinklist, .authorquote, .accordion, .table))",
          ':is(.section-content, .container-content) > .twocolumn:not(:has(.table, .teaser, .poimapping, .stage, .slideshow, .accordion, .onecolumn, .twocolumn, .threecolumn, .fourcolumn, .sidebar, .experiencefragment, .video, .carousel, .tabs, form, .messagecenterwrapper, .authorquote, iframe, maui-navigation-link[variant="anchor-down"]))',
          ':is(.section-content, .container-content) > :is(.threecolumn, .fourcolumn):not(:has(.table, .teaser, .poimapping, .stage, .slideshow, .accordion, .onecolumn, .twocolumn, .threecolumn, .fourcolumn, .sidebar, .experiencefragment, .video, .carousel, .tabs, form, .messagecenterwrapper, .authorquote, iframe, maui-navigation-link[variant="anchor-down"]))',
          ':is(.section-content, .container-content) > .onecolumn > .column-view > .row > .column-view-item > :is(.twocolumn, .threecolumn, .fourcolumn):not(:has(.table, .teaser, .poimapping, .stage, .slideshow, .accordion, .onecolumn, .twocolumn, .threecolumn, .fourcolumn, .sidebar, .experiencefragment, .video, .carousel, .tabs, form, .messagecenterwrapper, .authorquote, iframe, maui-navigation-link[variant="anchor-down"]))',
          ".videoViewer, .image:has(video)"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "name": "Page title and aircraft image",
        "selector": [
          ".contentpage > h1, .contentpage .container-content > .image"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".contentpage > h1",
          ".contentpage .container-content > .image"
        ]
      },
      {
        "id": "section-2",
        "name": "Seat map (lightbox slideshow)",
        "selector": [
          ".contentpage .container-content > .onecolumn:has(.slideshow)"
        ],
        "style": null,
        "blocks": [
          "carousel-lightbox"
        ],
        "defaultContent": [
          ".contentpage .container-content > .onecolumn:has(.slideshow) div.headline"
        ]
      },
      {
        "id": "section-3",
        "name": "Seat maps to download",
        "selector": [
          ".contentpage .container-content > .onecolumn:has(.link .maui-link)"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".contentpage .container-content > .onecolumn:has(.link .maui-link) div.headline",
          ".contentpage .container-content > .onecolumn:has(.link .maui-link) div.link"
        ]
      },
      {
        "id": "section-4",
        "name": "Technical data",
        "selector": [
          ".contentpage .container-content > .onecolumn:has(.table)"
        ],
        "style": null,
        "blocks": [
          "table-striped"
        ],
        "defaultContent": [
          ".contentpage .container-content > .onecolumn:has(.table) div.headline"
        ]
      }
    ]
  };
  var parsers = {
    "subpage-nav": parse,
    "hero-campaign": parse2,
    "carousel-lightbox": parse3,
    "table-striped": parse4,
    "carousel-cards": parse5,
    "columns-media": parse6
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var tmp_bundle_fleet_131377_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(tmp_bundle_fleet_131377_exports);
})();
