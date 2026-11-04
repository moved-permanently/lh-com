/*
 * app-links: the app's links (tools/workers/lh-edge/SDUI.md: textLink_v2 / navigationLink) as
 * authors see them on an app screen document: one arrow link per row; its tracking label (cell
 * 2) as a caption, the title the app shows while the target loads (cell 3, optional) in its title.
 */
import { el, cellText, trackingCaption } from '../../scripts/app-screen.js';

export default function decorate(block) {
  const list = el('ul', 'app-links-list');
  [...block.children].forEach((row) => {
    const [c1, c2, c3] = row.children;
    const src = c1 && c1.querySelector('a[href]');
    if (!src) return;
    const li = el('li');
    const a = el('a', 'app-link');
    a.href = src.getAttribute('href');
    if (cellText(c3)) a.title = cellText(c3);
    a.append(el('span', 'app-link-text', src.textContent.trim()), el('span', 'app-link-arrow'));
    a.lastChild.setAttribute('aria-hidden', 'true');
    li.append(a);
    const caption = trackingCaption(cellText(c2));
    if (caption) li.append(caption);
    list.append(li);
  });
  block.replaceChildren(list);
}
