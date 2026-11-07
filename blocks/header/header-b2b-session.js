/*
 * The Login menu on Lufthansa Group for Business (scripts/brands.js b2b header.session 'b2b'): who
 * is signed in on the host (lh-backends' GET /service/secured/api/b2bneo/session, cookies host-only
 * and HttpOnly). With a company or an eXperts session the menu's Login item (the item with the
 * sign-in links) shows the name and, under each signed-in side's heading of the nav document, the
 * member home and Log out; signed out, or the session unknown, the menu as it is.
 */
import {
  companyLogoutUrl, EXPERTS_LOGOUT_PATH, loadSession, pageRoot, personName,
} from '../../scripts/b2b-session.js';

export { loadSession };

const TEXTS = {
  en: { home: 'Member area', logout: 'Log out' },
  de: { home: 'Mitgliederbereich', logout: 'Abmelden' },
};

const pathOf = (a) => {
  try {
    return new URL(a.getAttribute('href') || '', window.location.origin).pathname;
  } catch (e) {
    return '';
  }
};
// (the staff sign-in: the document login-internal, www's login_internal)
const isCompanyLogin = (a) => /^\/[a-z]{2}\/[a-z]{2}\/login(?:[-_]internal)?$/.test(pathOf(a));
const isExpertsLogin = (a) => pathOf(a) === '/service/secured/api/experts/login';

function link(href, text) {
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.textContent = text;
  return a;
}

/**
 * The menu's items with the signed-in Login item.
 * @param {Array} items the nav document's menu (header.js readMenu): {label, link, groups}
 * @param {{company: Object|null, experts: Object|null}|null} session
 * @param {{lang: string, root: string}} [where] the page's language and root
 */
export function withSession(items, session, where = pageRoot()) {
  if (!session || (!session.company && !session.experts)) return items;
  const isLogin = (a) => isCompanyLogin(a) || isExpertsLogin(a);
  const index = items.findIndex((i) => i.groups.some((g) => g.links.some(isLogin)));
  if (index < 0) return items;
  const item = items[index];
  const t = TEXTS[where.lang] || TEXTS.en;
  const groupOf = (test) => item.groups.find((g) => g.links.some(test));
  const groups = [];
  if (session.company) {
    const g = groupOf(isCompanyLogin);
    groups.push({
      label: g ? g.label : '',
      links: [link(session.company.home || `/${where.root}/home`, t.home), link(companyLogoutUrl(where.root), t.logout)],
    });
  }
  if (session.experts) {
    const g = groupOf(isExpertsLogin);
    groups.push({
      label: g ? g.label : '',
      links: [link(session.experts.home || `/${where.root}/experts-members`, t.home), link(EXPERTS_LOGOUT_PATH, t.logout)],
    });
  }
  // company: firstName and lastName; eXperts: name and surname (the brief's contract)
  const label = personName(session.company) || personName(session.experts) || item.label;
  return items.map((x, i) => (i === index ? { ...item, label, groups } : x));
}
