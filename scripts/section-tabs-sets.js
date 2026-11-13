/**
 * The tab sets scripts/section-tabs.js has built, by their panels and parts, and their removal for
 * a block that shows the same sections its own way (TAP's FAQ picker, TAP row 151). No other
 * import, so a block can use it without the page's scripts.
 */

const built = new WeakMap();

/**
 * Records a built set (section-tabs.js).
 * @param {{nav: Element, tabs: Array<{toggle: Element, panel: Element, parts: Element[]}>,
 *   removed: boolean}} set
 */
export function registerSet(set) {
  set.tabs.forEach(({ panel, parts }) => [panel, ...parts].forEach((x) => built.set(x, set)));
}

/**
 * Removes the tab sets the given sections are panels or parts of: their tab list, the toggles, the
 * panels' roles, labels and classes; every panel and part shown again, and a later media change
 * leaves them alone (the set's render checks `removed`). A page's other sets stay.
 * @param {Element[]} sections
 */
export function removeSectionTabs(sections) {
  const sets = new Set((sections || []).map((s) => s && built.get(s)).filter(Boolean));
  sets.forEach((set) => {
    set.removed = true;
    set.nav.remove();
    set.tabs.forEach(({ toggle, panel, parts }) => {
      toggle.remove();
      [panel, ...parts].forEach((x) => {
        built.delete(x);
        x.classList.remove('section-tab-panel', 'section-tab-part', 'section-tab-always', 'section-tab-closed');
        x.removeAttribute('role');
        x.removeAttribute('aria-labelledby');
        x.hidden = false;
        [...x.children].forEach((c) => { c.hidden = false; });
      });
    });
  });
}
