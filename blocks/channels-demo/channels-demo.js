/*
 * Channels demo: the same page in several channels at phone width, side by side.
 * One row per channel: label | link to the page. Each row renders as a labelled 390px-wide
 * frame of the linked page with an "open" link under it. Rows without a usable link are
 * skipped; a missing label falls back to the link's host.
 */

import { isDemoHost } from '../../scripts/demo.js';

const FRAME_WIDTH = 390;
const FRAME_HEIGHT = 780;

function rowParts(row) {
  const cells = [...row.children];
  const link = row.querySelector('a[href]');
  if (!link) return null;
  const labelCell = cells.find((c) => !c.contains(link)) || null;
  let href;
  try {
    href = new URL(link.getAttribute('href'), window.location.href).href;
  } catch (e) {
    return null;
  }
  const label = (labelCell ? labelCell.textContent : '').replace(/\s+/g, ' ').trim()
    || new URL(href).hostname;
  return { label, href };
}

export default function decorate(block) {
  // a demo of the channels: nothing on a production host
  if (!isDemoHost()) {
    block.replaceChildren();
    return;
  }
  const items = [...block.children].map(rowParts).filter(Boolean);
  const list = document.createElement('ul');
  list.className = 'channels-demo-list';
  items.forEach(({ label, href }, i) => {
    const li = document.createElement('li');
    li.className = 'channels-demo-item';
    const id = `channels-demo-label-${i + 1}`;

    const heading = document.createElement('p');
    heading.className = 'channels-demo-label';
    heading.id = id;
    heading.textContent = label;

    const frame = document.createElement('iframe');
    frame.className = 'channels-demo-frame';
    frame.src = href;
    frame.title = label;
    frame.width = String(FRAME_WIDTH);
    frame.height = String(FRAME_HEIGHT);
    frame.loading = 'lazy';
    frame.setAttribute('aria-describedby', id);

    const open = document.createElement('a');
    open.className = 'channels-demo-open';
    open.href = href;
    open.target = '_blank';
    open.rel = 'noopener';
    open.textContent = href.replace(/^https?:\/\//, '');

    li.append(heading, frame, open);
    list.append(li);
  });
  block.replaceChildren(list);
}
