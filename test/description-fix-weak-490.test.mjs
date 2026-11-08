/* eslint-disable max-len, import/extensions, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Brief 490: description-fix.mjs's fallback (the first real text paragraph) took weak paragraphs on lufthansa.com's 125
   pages without a description on www: a footnote ("* Minimum two adults need to be booked" on the companion-special
   pages), a single word ("Niemcy", the first country of /xx/pl/support/contact/hotlines), a date line ("Buchungszeitraum:
   30.09.2019 - 04.11.2019", "19. June 2025 | 5 min read | Lufthansa Editorial Team"), a lead-in ending with a colon or a
   comma, a numbered step. The fallback skips them and takes the next paragraph; nothing left: no Description.
   Run: node --max-old-space-size=256 --test test/description-fix-weak-490.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { fixDescription, firstTextParagraph } from '../tools/importer/description-fix.mjs';

test('footnotes skipped (an asterisk, a dagger, a superscript or (1) first)', () => {
  const main = '<p>* Minimum two adults need to be booked {copytext-small full-width}</p><p>*Preisangabe in €. Die angezeigten Preise können variieren.</p><p>† Subject to availability on the selected flights</p><p>¹ Valid for bookings made online</p><p>(1) Only for Miles &amp; More members</p><p>Travel in pairs or as a group of up to 6 adults and save.</p>';
  assert.equal(firstTextParagraph(main), 'Travel in pairs or as a group of up to 6 adults and save.');
});

test('a single word, two words, a phone or opening-hours line skipped; a short sentence in Japanese or Chinese kept', () => {
  const main = '<p>Niemcy</p><p>+49 (0) 69 867 99400Pn.–Pt. 08:00–22:00</p><p>Szwajcaria+41 (0) 22 761 4522Pn.–Pt. 08:00–22:00</p><p>Indie (bezpłatne)</p><p>Wszystkie linie telefoniczne są częścią lokalnych sieci stacjonarnych.</p>';
  assert.equal(firstTextParagraph(main), 'Wszystkie linie telefoniczne są częścią lokalnych sieci stacjonarnych.');
  assert.equal(firstTextParagraph('<p>エラー</p><p>お申し込みありがとうございます。</p>'), 'お申し込みありがとうございます。');
  assert.equal(firstTextParagraph('<p>汉莎航空在中国大陆的停机坪延误应急计划</p>'), '汉莎航空在中国大陆的停机坪延误应急计划');
});

test('date and price lines skipped (a labelled period, a byline with a date, a price alone); a sentence opening with a date kept', () => {
  const main = '<p>Buchungszeitraum: 30.09.2019 - 04.11.2019</p><p>Reisezeitraum: 30.09.2019 – 30.06.2020</p><p>19. June 2025 | 5 min read | Lufthansa Editorial Team {small}</p><p>ab 39 €</p><p>from EUR 1,249.00</p><p>Promotion period: November 20, 2025 – November 30, 2025</p><p>4. November 2026: Lufthansa flies to Ivalo every Saturday.</p>';
  assert.equal(firstTextParagraph(main), '4. November 2026: Lufthansa flies to Ivalo every Saturday.');
});

test('a lead-in (a colon, a comma, a dash at the end), a text cut off (an ellipsis or a hyphen) and a numbered step skipped', () => {
  const main = '<p>The following terms and conditions apply to the redemption of vouchers: {full-width}</p><p>The offer can also be applied on the below list of services provided by Jarallah, {full-width}</p><p>Our partners at a glance –</p><p>Das Sitzplatzangebot ist begrenzt und mög…</p><p>Book your flight to the Mediterra-</p><p>1. Turn on your notebook or mobile device, enable Wi-Fi and connect to the network. {full-width}</p><p>2) Open your Internet browser and select the HotSpot service.</p><p>Online in five steps with FlyNet on board.</p>';
  assert.equal(firstTextParagraph(main), 'Online in five steps with FlyNet on board.');
});

test('a paragraph of short lines (conditions or phone lines one per line) skipped; a line break reads as a space', () => {
  const main = '<p>Minimumaufenthalt: 6 Tage<br>Maximalaufenthalt: 3 Monate<br>Nicht umtauschbar<br>Nicht erstattbar</p><p>Premium Economy Class</p><p>Благодарим вас за обращение.<br>Заполните эту форму, чтобы мы могли быстро обработать ваш запрос.</p>';
  assert.equal(firstTextParagraph(main), 'Благодарим вас за обращение. Заполните эту форму, чтобы мы могли быстро обработать ваш запрос.');
});

test('every paragraph weak: the first heading that is not (h1, else h2), its marker removed', () => {
  const main = '<div><h1>Offers</h1><h1>Save up to 40% in Business Class {heading-small}</h1><h2>That\'s how the deal works {column-start-outer}</h2><ul><li>Travel in pairs</li></ul><p>* Minimum two adults need to be booked {copytext-small full-width}</p></div>';
  assert.equal(firstTextParagraph(main), 'Save up to 40% in Business Class');
  const steps = '<div><h1>FlyNet</h1><h2>Online in 5 steps with FlyNet® – this is how it works:</h2><h2>Your FlyNet® connection on board</h2><p>1. Turn on your notebook or mobile device and connect.</p></div>';
  assert.equal(firstTextParagraph(steps), 'Your FlyNet® connection on board');
  const r = fixDescription(`<body><main>${main}<div><div class="metadata"><div><div><p>Title</p></div><div><p>Offers</p></div></div></div></div></main></body>`);
  assert.equal(r.source, 'paragraph');
  assert.equal(r.description, 'Save up to 40% in Business Class');
});

test('only weak paragraphs and headings: no Description, the document unchanged', () => {
  const html = '<body><main><div><h1>Infolinie</h1><p>Niemcy</p><p>* Minimum two adults need to be booked</p><p>Buchungszeitraum: 30.09.2019 - 04.11.2019</p></div><div><div class="metadata"><div><div><p>Title</p></div><div><p>Infolinie</p></div></div></div></div></main></body>';
  const r = fixDescription(html);
  assert.equal(r.source, null);
  assert.equal(r.html, html);
});
