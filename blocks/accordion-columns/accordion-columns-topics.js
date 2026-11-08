/*
 * accordion-columns' finder (options tabs and filter: www.lufthansa-cargo.com's Support & Contact,
 * brief 482): a panel's topics (each heading, its one-line description and its links) as www draws
 * them. From 1025px a list of the topics (title and line) and the chosen topic's links beside it in
 * a panel of their own, the first chosen, one always chosen; on phones an accordion of the same
 * topics, the first open, a second click closes it. Each topic is a heading holding a button
 * (aria-expanded, aria-controls) and the region after it with its links; the region repeats the
 * title for the panel beside the list (hidden from screen readers: the button names it).
 */

let topicsCount = 0;

/**
 * @param {HTMLDetailsElement} item an accordion-columns item
 * @param {MediaQueryList} media the tab bar's media query (from 1025px)
 */
export default function buildTopics(item, media) {
  const intro = item.querySelector(':scope > .accordion-columns-panel > .accordion-columns-intro');
  if (!intro) return null;
  const nodes = [...intro.children];
  // only a panel that is topics throughout (a heading first)
  if (!nodes.length || !/^H[2-6]$/.test(nodes[0].tagName)) return null;
  const groups = [];
  nodes.forEach((n) => {
    const last = groups[groups.length - 1];
    if (/^H[2-6]$/.test(n.tagName)) groups.push({ heading: n, line: null, rest: [] });
    // the line: a paragraph without links right after the heading
    else if (n.tagName === 'P' && !last.line && !last.rest.length && !n.querySelector('a')) last.line = n;
    else last.rest.push(n);
  });
  if (groups.length < 2) return null;
  topicsCount += 1;
  const id = `accordion-columns-topics-${topicsCount}`;
  const box = document.createElement('div');
  box.className = 'accordion-columns-topics';
  box.style.setProperty('--topics', String(groups.length));
  const topics = groups.map(({ heading, line, rest }, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'accordion-columns-topic';
    button.id = `${id}-topic-${i + 1}`;
    const title = document.createElement('span');
    title.className = 'accordion-columns-topic-title';
    title.textContent = heading.textContent.trim();
    button.append(title);
    if (line) {
      const text = document.createElement('span');
      text.className = 'accordion-columns-topic-text';
      text.textContent = line.textContent.trim();
      button.append(text);
    }
    const head = document.createElement(heading.tagName.toLowerCase());
    head.className = 'accordion-columns-topic-heading';
    head.append(button);
    const region = document.createElement('div');
    region.className = 'accordion-columns-topic-panel';
    region.id = `${id}-panel-${i + 1}`;
    region.setAttribute('role', 'region');
    region.setAttribute('aria-labelledby', button.id);
    button.setAttribute('aria-controls', region.id);
    const copy = document.createElement('p');
    copy.className = 'accordion-columns-topic-panel-title';
    copy.setAttribute('aria-hidden', 'true');
    copy.textContent = title.textContent;
    region.append(copy, ...rest);
    box.append(head, region);
    return { button, region };
  });
  intro.replaceChildren(box);

  let chosen = 0;
  const show = () => topics.forEach(({ button, region }, i) => {
    button.setAttribute('aria-expanded', String(i === chosen));
    region.hidden = i !== chosen;
  });
  topics.forEach(({ button }, i) => button.addEventListener('click', () => {
    // from 1025px one topic is always chosen; on phones a second click closes it
    chosen = i === chosen && !media.matches ? -1 : i;
    show();
  }));
  const mode = () => {
    if (media.matches && chosen < 0) chosen = 0;
    show();
  };
  mode();
  if (media.addEventListener) media.addEventListener('change', mode);
  return box;
}
