/**
 * The capture's redirect checks (bd-session.mjs --same-path): www answers some pages from another
 * URL, an alias or by the visitor's country (from a German exit every market-neutral /xx/<ll> page
 * but the homepage goes to /de/<ll>, brief 267). Only the page asked for is saved.
 */

const pathOf = (u) => {
  try {
    const { protocol, pathname } = new URL(u);
    if (!/^https?:$/.test(protocol)) return null;
    return pathname.replace(/\/+$/, '').toLowerCase();
  } catch (e) {
    return null;
  }
};

/** The page a navigation ended on when it is another than the one asked for, else null. */
export function redirectedTo(requested, final) {
  const a = pathOf(requested);
  const b = pathOf(final);
  if (b === null) return String(final);
  return a === b ? null : new URL(final).pathname;
}

/** The country a market-neutral page (/xx/<ll>/x) went to ('de' for /de/en/x), or null. */
export function countryOfRedirect(requested, final) {
  const a = pathOf(requested);
  const b = pathOf(final);
  if (!a || !b || a === b || !/^\/xx\/[a-z]{2}(\/|$)/.test(a)) return null;
  // the same page in a country root (the exit's country); another page there is www's own alias
  const m = b.match(/^\/([a-z]{2})\/[a-z]{2}(\/.*|$)/);
  const rest = a.replace(/^\/xx\/[a-z]{2}/, '');
  return m && m[1] !== 'xx' && m[2] === rest ? m[1] : null;
}
