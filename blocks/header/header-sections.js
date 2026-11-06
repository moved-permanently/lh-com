/*
 * The nav document's sections by their content (blocks/header/header.js): the brand (the logo),
 * the quick actions, the mega menu (items with sub lists) and the tools (items with icons); the
 * authored order is the fallback.
 */

function hasIconTokens(section) {
  return Boolean(section.querySelector('span.icon')) || /(^|\s):[a-z0-9-]+:/.test(section.textContent);
}

/**
 * Whether a section's own top-level items carry icons (the tools: ":help: Support & Contact"); a
 * mega menu's links and its note may carry icons too (Lufthansa Cargo's locks, brief 422).
 */
function hasToolIcons(section) {
  const clone = section.cloneNode(true);
  clone.querySelectorAll('li ul, li ol').forEach((l) => l.remove());
  const list = clone.querySelector('ul, ol');
  return Boolean(list) && hasIconTokens(list);
}

/** Finds the nav sections by content; the authored order is the fallback. */
export default function classifySections(fragment) {
  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const tools = sections.find(hasToolIcons) || sections.find(hasIconTokens) || sections[3];
  const menu = sections.find((s) => s !== tools && s.querySelector('li > ul, li > ol')) || sections[2];
  const brand = sections.find((s) => s !== tools && s !== menu && s.querySelector('img'))
    || sections[0];
  // a nav without quick actions (e.g. FlyNet) must not show the menu as quick actions
  const quick = sections.find((s) => ![tools, menu, brand].includes(s) && s.querySelector('a[href]'))
    || (![tools, menu, brand].includes(sections[1]) ? sections[1] : null);
  return {
    brand, quick, menu, tools,
  };
}
