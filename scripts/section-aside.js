/*
 * A section beside the one before it (every brand): a section with the section style
 * sidebar-aside joins the section before it, as www.ita-airways.com's info pages show their
 * "Quick Links" beside the accordions (airem-sidebar: sidebar-content, sidebar-aside). Its wrappers
 * move into a div.section-aside at the end of that section (still inside a section, so loadSection
 * loads its blocks), the section gets with-aside and the aside's block containers; the number of
 * the section's other children is its --section-aside-rows (its grid's rows: styles.css). Without
 * a section before it the aside stays a section of its own.
 */

/**
 * @param {Element} main
 */
export default function joinAsideSections(main) {
  main.querySelectorAll(':scope > .section.sidebar-aside').forEach((section) => {
    const host = section.previousElementSibling;
    if (!host || !host.classList.contains('section') || host.classList.contains('sidebar-aside')) return;
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
