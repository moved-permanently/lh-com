/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the Help Center app of /{cc}/{ll}/support/support (`.help-center-container`,
 * Angular, #help-center-web): the search card (headline "How can we help you?", subline) and
 * the topic list "Select your request" (maui-collapsible-item first-level topics with
 * maui-navigation-link entries, some grouped in a second level). The app's search and the
 * entries' targets run in its JavaScript (the entries have no href), so the topic list becomes
 * an accordion-columns faq block whose entries are text, each topic ending with a link to the
 * Help Center on www.lufthansa.com (the page's live URL), where the entries work.
 * Output: h1 + subline paragraph (default content), h2 "Select your request", the block.
 */
export default function parse(element, { document, url }) {
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
  const card = element.querySelector('.topic-search-card-head');
  const out = [];
  if (card) {
    const heads = [...card.querySelectorAll('maui-headline')];
    if (heads[0]) {
      const h1 = document.createElement('h1');
      h1.textContent = clean(heads[0].textContent);
      out.push(h1);
    }
    if (heads[1]) {
      const p = document.createElement('p');
      p.textContent = clean(heads[1].textContent);
      out.push(p);
    }
  }
  const list = element.querySelector('.topic-selection-topic-list-container');
  const live = (() => {
    try {
      const u = new URL((url || '').replace(/^http:\/\/localhost:\d+/, 'https://www.lufthansa.com'));
      return `https://www.lufthansa.com${u.pathname.replace(/\.html$/, '')}`;
    } catch (e) {
      return 'https://www.lufthansa.com/';
    }
  })();
  if (list) {
    const title = list.querySelector(':scope > maui-headline');
    if (title) {
      const h2 = document.createElement('h2');
      h2.textContent = clean(title.textContent);
      out.push(h2);
    }
    const rows = [...list.querySelectorAll('maui-collapsible-item.first-level-collapsible')].map((topic) => {
      const header = topic.querySelector(':scope > .collapsible-header');
      const name = clean(header ? header.textContent : '');
      const ul = document.createElement('ul');
      const group = topic.querySelector(':scope > maui-collapsible');
      [...(group ? group.children : [])].forEach((entry) => {
        if (entry.tagName.toLowerCase() === 'maui-navigation-link') {
          const li = document.createElement('li');
          li.textContent = clean(entry.textContent);
          ul.append(li);
        } else if (entry.tagName.toLowerCase() === 'maui-collapsible-item') {
          const sub = clean((entry.querySelector(':scope > .collapsible-header') || {}).textContent);
          const li = document.createElement('li');
          li.textContent = sub;
          const inner = document.createElement('ul');
          entry.querySelectorAll(':scope > maui-collapsible > maui-navigation-link').forEach((l) => {
            const li2 = document.createElement('li');
            li2.textContent = clean(l.textContent);
            inner.append(li2);
          });
          if (inner.children.length) li.append(inner);
          ul.append(li);
        }
      });
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = live;
      a.setAttribute('data-live-link', '');
      a.textContent = name;
      p.append(a);
      return [name, [ul, p]];
    }).filter(([name]) => name);
    if (rows.length) out.push(WebImporter.Blocks.createBlock(document, { name: 'accordion-columns', variants: ['faq'], cells: rows }));
  }
  if (!out.length) return;
  // the feedback questionnaire of the app (already a Feedback block, cleanup) follows the list
  element.querySelectorAll('table').forEach((t) => out.push(t));
  element.replaceWith(...out);
}
