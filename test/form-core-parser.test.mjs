/* The core form import parser (tools/importer/parsers/form-core.js): a link of its own between
   the fields (Discover's contact forms: "Vollmacht herunterladen (PDF)" in an external-link
   tooltip) becomes a note row with the link; the tooltip's box text is no row. A linkedom page
   and a createBlock stand-in, no network. Run: node --test test/*.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import parse from '../tools/importer/parsers/form-core.js';

globalThis.WebImporter = {
  Blocks: {
    createBlock(doc, { cells }) {
      const t = doc.createElement('table');
      t.setAttribute('data-name', 'form');
      cells.forEach((row) => {
        const tr = doc.createElement('tr');
        row.forEach((c) => {
          const td = doc.createElement('td');
          if (Array.isArray(c)) c.forEach((n) => td.append(n)); else if (c) td.append(typeof c === 'string' ? doc.createTextNode(c) : c);
          tr.append(td);
        });
        t.append(tr);
      });
      return t;
    },
  },
};

test('a stand-alone maui link between the fields becomes a note row with the link', () => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="form-wrapper"><form class="cmp-form" action="/x">
    <div class="richtext"><p>Für einen Antrag im Namen einer anderen Person benötigen wir eine Vollmacht.</p></div>
    <div class="maui-link"><maui-tooltip><maui-navigation-link href="/content/dam/four_y/pdfs/legal/4y_power-of-attorney_de.pdf" slot="trigger">Vollmacht herunterladen (PDF)<span class="sr-only">Neuer Tab</span><maui-screen-reader-label>, externe Website</maui-screen-reader-label></maui-navigation-link><div slot="box" class="popover-box-tooltip">Sie verlassen diese Website</div></maui-tooltip></div>
  </form></div></main></body></html>`);
  parse(document.querySelector('.form-wrapper'), { document, url: 'https://www.discover-airlines.com/de/de/x' });
  const rows = [...document.querySelectorAll('table[data-name] tr')];
  const notes = rows.filter((tr) => tr.children[1] && tr.children[1].textContent.trim() === 'note');
  assert.equal(notes.length, 2);
  assert.match(notes[0].children[0].textContent, /Vollmacht\./);
  const link = notes[1].children[0].querySelector('a');
  assert.equal(link.getAttribute('href'), '/content/dam/four_y/pdfs/legal/4y_power-of-attorney_de.pdf');
  assert.equal(link.textContent, 'Vollmacht herunterladen (PDF)');
  assert.ok(!document.querySelector('table[data-name]').textContent.includes('Sie verlassen diese Website'));
});

const LI = (n, required) => `<li class="file-upload-wrapper row py-0 mb-5"><div class="col-12 d-flex"><div class="input" data-cmp-required-message="Please attach proof of the right to canel your ticket."><div class="input-wrapper"><div class="position-relative"><label for="File_upload-${n}">File upload</label><div class="input-border-wrapper"><input id="File_upload-name-${n}" name="File_upload-name-${n}" placeholder="File upload" class="forms-file-name" type="text" value="" tabindex="-1"></div>
  <input accept="PDF, JPEG,Image" class="forms-file-upload forms-input-enhancer" id="File_upload-${n}" type="file"${required ? ' required' : ''} data-forms-file-upload="{&quot;portal&quot;:&quot;lh&quot;, &quot;maximumFileSize&quot;: 8000000, &quot;fileSizeErrorMessage&quot;: &quot;Maximum size violation&quot;}"><input name="File_upload-id-${n}" class="forms-file-id" data-fieldname="File_upload"></div></div></div>
  <div class="d-inline-flex"><div class="file-delete"><button class="btn-link" type="button"><span class="sr-only">Delete ${n}</span></button></div></div></div>
  <div class="col-12"><button class="btn forms-file-select-btn" type="button"><span>Browse</span></button><button class="btn forms-file-upload-btn" type="button"><span>Upload</span></button></div></li>`;

test('www\'s older file inputs (il/en\'s cancellation form: five numbered uploads) become one file row with their rules', () => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="form-wrapper"><form class="cmp-form" action="https://www.lufthansa.com/content/lh/markets/il/en/cancellation-refund-webform.html">
    <div id="subsection-Personel_details"><fieldset><legend>Mandatory details</legend>
      <div class="richtext"><p>Document references</p></div>
      <div class="upload"><ul class="list-unstyled forms-repeatable-section">${[1, 2, 3, 4, 5].map((n) => LI(n, n === 1)).join('')}</ul></div>
    </fieldset></div>
    <maui-button id="submit-btn" behavior="submit">Send</maui-button>
  </form></div></main></body></html>`);
  parse(document.querySelector('.form-wrapper'), { document, url: 'https://www.lufthansa.com/il/en/cancellation-refund-webform' });
  const rows = [...document.querySelectorAll('table[data-name] tr')].map((tr) => [...tr.children].map((td) => td.innerHTML));
  const files = rows.filter((r) => r[1] === 'file');
  assert.equal(files.length, 1);
  assert.deepEqual(files[0], ['File upload', 'file', 'File_upload', 'yes', '', '', 'Browse', 'Please attach proof of the right to canel your ticket.', '',
    'accept=application/pdf, image/jpeg, image/jpg, image/png<br>max-files=5<br>max-size=8000000<br>not-allowed=#$%^*()[]']);
  assert.deepEqual(rows.map((r) => r[1]), ['Type', 'fieldset', 'note', 'file', 'end', 'submit', 'config', 'config']);
  assert.deepEqual(rows.find((r) => r[2] === 'form'), ['cancellation-refund-webform', 'config', 'form', '', '', '', '', '', '', '']);
  assert.ok(!document.querySelector('table[data-name]').textContent.includes('Delete 1'));
});

test('the market roots\' form pages get their lh-forms id; www\'s empty mk/en/support/refund none', () => {
  [['bg/en/local-page/invoice-request-bg', 'invoice-request-bg'], ['mk/de/formular-notfallkontakt', 'formular-notfallkontakt'], ['mk/en/support/refund', null],
    // brief 446
    ['pl/en/invoice-request-poland', 'invoice-request-poland'], ['gr/el/invoice-request-greece-el', 'invoice-request-greece'],
    ['de/de/prepare-for-your-trip/all-check-in/group-check-in-counter', 'group-check-in-counter'],
    ['xx/pt/prepare-for-your-trip/baggage/sport-baggage/register-ammunition1', 'register-ammunition'], ['kr/en/local-page/naverpay-points', null]].forEach(([path, id]) => {
    const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="form-wrapper"><form class="cmp-form" action="https://www.lufthansa.com/content/lh/markets/${path}.html"><maui-button id="submit-btn" behavior="submit">Send</maui-button></form></div></main></body></html>`);
    parse(document.querySelector('.form-wrapper'), { document, url: `https://www.lufthansa.com/${path}` });
    const form = [...document.querySelectorAll('table[data-name] tr')].find((tr) => tr.children[2] && tr.children[2].textContent === 'form');
    assert.equal(form ? form.children[0].textContent : null, id, path);
  });
});

// Austrian's cn/zh forms (ema-cashub's survey, tools/reports/form-date-masks.tsv): www's masked
// date inputs with mask="0000-00-00" (digit slots, no D/M/Y), their hint " - YYYY-MM-DD"; the
// form block's mask rule needs D/M/Y slots, so the field never validated
const masked = (mask, hint) => `<maui-masked-input variant="custom" custom-locale="zh-cn" mask="${mask}" value=""><maui-input id="form-text-1" label="日期" placeholder="日期" hint="${hint}" name="flightdate" type="text"></maui-input></maui-masked-input>`;
const maskOfField = (mask, hint) => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="form-wrapper"><form class="cmp-form" action="https://www.austrian.com/content/aua/markets/cn/zh/emergency-contact.html">${masked(mask, hint)}<maui-button id="submit-btn" behavior="submit">提交</maui-button></form></div></main></body></html>`);
  parse(document.querySelector('.form-wrapper'), { document, url: 'https://www.austrian.com/cn/zh/emergency-contact' });
  const row = [...document.querySelectorAll('table[data-name] tr')].map((tr) => [...tr.children].map((td) => td.textContent)).find((r) => r[1] === 'date');
  return row ? row[9] : null;
};

test('a date mask without D/M/Y slots (www\'s "0000-00-00") takes the order of the hint\'s pattern and the mask\'s separators and lengths', () => {
  assert.equal(maskOfField('0000-00-00', ' - YYYY-MM-DD'), 'mask=YYYY-MM-DD');
  // the hint written with slashes, the mask (what the field accepts) with hyphens
  assert.equal(maskOfField('0000-00-00', ' - YYYY/MM/DD'), 'mask=YYYY-MM-DD');
  // the other roots' masks as they are
  assert.equal(maskOfField('DD.MM.YYYY', ' - DD.MM.YYYY'), 'mask=DD.MM.YYYY');
  assert.equal(maskOfField('YYYY/MM/DD', ''), 'mask=YYYY/MM/DD');
  // no pattern to take: as before
  assert.equal(maskOfField('0000-00-00', ''), 'mask=0000-00-00');
});
