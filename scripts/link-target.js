/**
 * Page metadata `Links: new-tab`: every link in main opens in a new tab (rel noopener), except
 * links to a place on the same page and mailto/tel links. Pages without it are unchanged.
 */

/**
 * @param {Element} main
 * @param {URL} here the page's own URL
 */
export default function openLinksInNewTab(main, here) {
  main.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href.startsWith('#')) return;
    let url;
    try {
      url = new URL(href, here);
    } catch (e) {
      return;
    }
    if (!/^https?:$/.test(url.protocol)) return;
    if (url.hash && url.origin === here.origin && url.pathname === here.pathname) return;
    a.setAttribute('target', '_blank');
    const rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
    if (!rel.includes('noopener')) rel.push('noopener');
    a.setAttribute('rel', rel.join(' '));
  });
}
