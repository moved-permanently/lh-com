/**
 * The travellers window's "Redeem miles" tab (travellers-dialog.js), as www.brusselsairlines.com's
 * and www.swiss.com's flight manager shows it (capture redeem-miles-001: be/en, be/fr, ch/en,
 * ch/de at 1440 and 390, 2026-11-05; the same component, texts and label keys on both,
 * flightmanager.flight.useMiles.*): a headline, then Cash & Miles (three points, "Continue with
 * login", a note, "Become a member") and Book Award Flights (three points, "Search award flights",
 * a note). No fields: two buttons and a link, plain links in this tab.
 * The targets per brand (scripts/brands.js travellersDialog.redeemMiles, {cc}, {ll}, {clientId}
 * filled): the login the replica's own login page (Travel ID returns only to www, so www's
 * authorize link would fail here), the enrolment and the award search as www's.
 */

/** www's texts per language (the labels file flightmanager/<sn|lx>/<ll>). */
export const MILES_LABELS = {
  en: {
    'miles tab label': 'Redeem miles',
    'miles headline': 'Choose from two ways to use your miles.',
    'cash headline': 'Cash & Miles',
    'cash point 1': 'Redeem from just 3,000 miles.',
    'cash point 2': 'Choose freely how many miles you want to use.',
    'cash point 3': 'Available for any travel date.',
    'cash login label': 'Continue with login',
    'cash login description': 'Click the button to proceed to login.',
    'cash note': 'The Cash & Miles payment option will be displayed after you select your flight.',
    'member label': 'Become a member',
    'member description': 'Click the button to sign up.',
    'awards headline': 'Book Award Flights',
    'awards point 1': 'Start redeeming from just 15,000 miles.',
    'awards point 2': 'Redeem miles based on your destination and travel class.',
    'awards point 3': 'Our most popular way to redeem miles worldwide.',
    'awards label': 'Search award flights',
    'awards description': 'Start your award flight search by clicking the button.',
    'awards note': 'You’re being sent to miles-and-more.com to continue.',
  },
  fr: {
    'miles tab label': 'Échanger des Miles',
    'miles headline': 'Vous avez le choix entre deux façons d’utiliser vos Miles.',
    'cash headline': 'Offre Cash & Miles',
    'cash point 1': 'Échangez à partir de 3.000 Miles seulement.',
    'cash point 2': 'Vous êtes libre de choisir le nombre de Miles que vous souhaitez utiliser.',
    'cash point 3': 'Disponible pour toutes les dates de voyage.',
    'cash login label': 'Poursuivre avec la connexion',
    'cash login description': 'Cliquez sur le bouton pour vous connecter.',
    'cash note': 'L’option de paiement de l’offre Cash & Miles s’affichera après le choix de votre vol.',
    'member label': 'Devenir membre',
    'member description': 'Cliquez sur le bouton pour vous inscrire.',
    'awards headline': 'Réserver des Award Flights',
    'awards point 1': 'Commencez à échanger à partir de 15.000 Miles seulement.',
    'awards point 2': 'Échangez des Miles en fonction de votre destination et de votre classe de voyage.',
    'awards point 3': 'Notre façon la plus populaire d’échanger des Miles dans le monde entier.',
    'awards label': 'Recherche de billets Prime',
    'awards description': 'Commencez votre recherche d’Award Flight en cliquant sur le bouton.',
    'awards note': 'Vous allez être renvoyé sur miles-and-more.com pour continuer.',
  },
  de: {
    'miles tab label': 'Meilen einlösen',
    'miles headline': 'Sie haben zwei Möglichkeiten, Ihre Meilen einzulösen.',
    'cash headline': 'Cash & Miles',
    'cash point 1': 'Einlösen schon ab 3.000 Meilen.',
    'cash point 2': 'Wählen Sie flexibel, wie viele Meilen Sie nutzen möchten.',
    'cash point 3': 'Für jedes Reisedatum möglich.',
    'cash login label': 'Weiter mit Login',
    'cash login description': 'Klicken Sie auf den Button, um zum Login-Bereich zu gelangen.',
    'cash note': 'Die Zahlungsoption Cash & Miles wird angezeigt, nachdem Sie Ihren Flug ausgewählt haben.',
    'member label': 'Jetzt anmelden',
    'member description': 'Klicken Sie auf den Button, um sich zu registrieren.',
    'awards headline': 'Prämienflüge buchen',
    'awards point 1': 'Einlösen schon ab 15.000 Meilen.',
    'awards point 2': 'Feste Meilenwerte je nach Strecke und Reiseklasse.',
    'awards point 3': 'Die beliebteste Option zum Meilen-Einlösen weltweit.',
    'awards label': 'Award Flight suchen',
    'awards description': 'Klicken Sie auf den Button, um nach Prämienflügen zu suchen.',
    'awards note': 'Sie werden zu miles-and-more.com weitergeleitet.',
  },
};

const fill = (template, values) => Object.entries(values)
  .reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), template || '');

/**
 * The tab's texts and targets for a page, or null (no tab: a brand without redeemMiles, or a
 * language without www's texts).
 * @param {{country: string, lang: string}} locale
 * @param {Object} [brand] the brand's scripts/brands.js entry
 */
export function milesOptions(locale, brand) {
  const setting = brand && brand.travellersDialog && brand.travellersDialog.redeemMiles;
  if (!setting || !MILES_LABELS[locale.lang]) return null;
  const values = {
    cc: locale.country,
    ll: locale.lang,
    clientId: (brand.travelId && brand.travelId.clientId) || '',
  };
  return {
    labels: MILES_LABELS[locale.lang],
    login: fill(setting.login, values),
    member: fill(setting.member, values),
    awards: fill(setting.awards, values),
    awardsStyle: setting.awardsStyle || 'secondary',
  };
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * The tab's panel content.
 * @param {Object} options milesOptions() result
 * @param {(part: string) => string} id the window's id maker
 * @returns {Element}
 */
export function buildMilesPanel(options, id) {
  const { labels } = options;
  const wrap = el('div', 'flight-search-miles');
  wrap.append(el('h3', 'flight-search-miles-headline', labels['miles headline']));
  const grid = el('div', 'flight-search-miles-grid');
  const describe = (link, key) => {
    const sr = el('span', 'flight-search-travellers-sr-only', labels[key]);
    sr.id = id(key.replace(/\s+/g, '-'));
    link.setAttribute('aria-describedby', sr.id);
    return sr;
  };
  const column = (name, className) => {
    const col = el('div', `flight-search-miles-column ${className}`);
    col.append(el('h4', 'flight-search-miles-title', labels[`${name} headline`]));
    const points = el('ul', 'flight-search-miles-points');
    [1, 2, 3].forEach((n) => points.append(el('li', '', labels[`${name} point ${n}`])));
    col.append(points);
    return col;
  };

  const cash = column('cash', 'flight-search-miles-cash');
  const login = el('a', 'flight-search-miles-login button primary', labels['cash login label']);
  login.href = options.login;
  const loginWrap = el('p', 'flight-search-miles-action');
  loginWrap.append(login, describe(login, 'cash login description'));
  const member = el('a', 'flight-search-miles-member', labels['member label']);
  member.href = options.member;
  const memberWrap = el('p', 'flight-search-miles-more');
  memberWrap.append(member, describe(member, 'member description'));
  cash.append(loginWrap, el('p', 'flight-search-miles-note', labels['cash note']), memberWrap);

  const awards = column('awards', 'flight-search-miles-awards');
  const search = el('a', `flight-search-miles-awards-link button ${options.awardsStyle}`);
  search.href = options.awards;
  const icon = el('span', 'flight-search-miles-awards-icon');
  icon.setAttribute('aria-hidden', 'true');
  search.append(icon, el('span', 'flight-search-miles-awards-text', labels['awards label']));
  const searchWrap = el('p', 'flight-search-miles-action');
  searchWrap.append(search, describe(search, 'awards description'));
  awards.append(searchWrap, el('p', 'flight-search-miles-note', labels['awards note']));

  grid.append(cash, awards);
  wrap.append(grid);
  return wrap;
}
