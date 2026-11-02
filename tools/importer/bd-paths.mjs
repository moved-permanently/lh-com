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

/** The country root a market-neutral page (/xx/<ll>/x) went to ('de' for /de/en/y), or null. */
export function countryOfRedirect(requested, final) {
  const a = pathOf(requested);
  const b = pathOf(final);
  if (!a || !b || a === b || !/^\/xx\/[a-z]{2}(\/|$)/.test(a)) return null;
  // any page of a country root: from such an exit www sends every market-neutral page to its
  // country's counterpart (the same path, or the counterpart's slug: /xx/en/dcc to
  // /de/en/partner); a session's exit can change under way, so no redirect into a country root
  // counts as www's own alias (a page that keeps doing it is left after the run's sessions)
  const m = b.match(/^\/([a-z]{2})\/[a-z]{2}(\/|$)/);
  return m && m[1] !== 'xx' ? m[1] : null;
}
