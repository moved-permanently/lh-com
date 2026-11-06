/*
 * A section beside the one before it (every brand): a section with the section style
 * sidebar-aside joins the section before it, as www.ita-airways.com's info pages show their
 * "Quick Links" beside the accordions (airem-sidebar: sidebar-content, sidebar-aside). Its wrappers
 * move into a div.section-aside at the end of that section (still inside a section, so loadSection
 * loads its blocks), the section gets with-aside and the aside's block containers; the number of
 * the section's other children is its --section-aside-rows (its grid's rows: styles.css). Without
 * a section before it the aside stays a section of its own. After a tab panel in parts (sections
 * with the same Tab label and set, scripts/section-tabs.js: www.swiss.com's grey box inside a
 * panel, then the panel's other content) the parts join the panel's first section first, each in a
 * div.section-part with its own section styles, so the aside stands beside all of them.
 */

/** A section's style classes (its metadata's Style): not its own, not its blocks' containers. */
const styleClasses = (section) => [...section.classList]
  .filter((c) => c !== 'section' && c !== 'with-aside' && !c.endsWith('-container'));

/**
 * A tab panel in parts ending with the section: the parts in the panel's first section, each in a
 * div.section-part with its style classes (the first section keeps none of its own).
 * @param {Element} last the section before the aside
 * @returns {Element} the section the aside joins
 */
function joinPanelParts(last) {
  const { tab, tabs = '' } = last.dataset;
  if (!tab) return last;
  const parts = [last];
  let prev = last.previousElementSibling;
  while (prev && prev.classList.contains('section') && !prev.classList.contains('sidebar-aside')
    && prev.dataset.tab === tab && (prev.dataset.tabs || '') === tabs) {
    parts.unshift(prev);
    prev = prev.previousElementSibling;
  }
  if (parts.length < 2) return last;
  const [first] = parts;
  const firstStyles = styleClasses(first);
  parts.forEach((sec) => {
    const part = document.createElement('div');
    part.className = ['section-part', ...styleClasses(sec)].join(' ');
    part.append(...sec.children);
    [...sec.classList].filter((c) => c.endsWith('-container')).forEach((c) => first.classList.add(c));
    first.append(part);
    if (sec !== first) sec.remove();
  });
  firstStyles.forEach((c) => first.classList.remove(c));
  return first;
}

/**
 * @param {Element} main
 */
export default function joinAsideSections(main) {
  main.querySelectorAll(':scope > .section.sidebar-aside').forEach((section) => {
    const before = section.previousElementSibling;
    if (!before || !before.classList.contains('section') || before.classList.contains('sidebar-aside')) return;
    const host = joinPanelParts(before);
    const aside = document.createElement('div');
    aside.className = 'section-aside';
    aside.append(...section.children);
    host.style.setProperty('--section-aside-rows', String(host.children.length));
    host.classList.add('with-aside');
    [...section.classList].filter((c) => c.endsWith('-container')).forEach((c) => host.classList.add(c));
    host.append(aside);
    section.remove();
  });
}
