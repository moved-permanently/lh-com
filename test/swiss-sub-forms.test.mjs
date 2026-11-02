/* eslint-disable max-len, import/extensions -- the importer modules are .mjs */
/* SWISS's sub-sites' forms and links (tools/importer/swiss-sub-import.mjs): a form's :redirect, a
   sub-site page (www.swiss.com/corporate/<ll>/...-success.html), as its success row; www's broken
   links to /<sub-site>/null/<ll>.html (medical services' header image) unwrapped.
   Run: node --max-old-space-size=512 --test test/swiss-sub-forms.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { withSubSuccess, withoutNullLinks } from '../tools/importer/swiss-sub-import.mjs';

const empty = '<div></div>'.repeat(7);
const SUCCESS = '/corporate/de/media/media-request-form/media-request-form-success';

test('withSubSuccess: the form\'s :redirect (a sub-site page) as its success row, before the form row; once; without a redirect, or a main site one, as it is', () => {
  const formRow = `<div><div>swiss-media-request-form</div><div>config</div><div>form</div>${empty}</div>`;
  const doc = `<div class="form core"><div><div>Send</div><div>submit</div></div>${formRow}</div>`;
  const html = `<form><input type="hidden" name=":redirect" value="${SUCCESS}.html"></form>`;
  const out = withSubSuccess(doc, html);
  const success = `<div><div><a href="${SUCCESS}">${SUCCESS}</a></div><div>config</div><div>success</div>${empty}</div>`;
  assert.ok(out.includes(`${success}${formRow}`), out);
  assert.equal(withSubSuccess(out, html), out, 'once');
  assert.equal(withSubSuccess(doc, '<form></form>'), doc);
  assert.equal(withSubSuccess(doc, '<input name=":redirect" value="/content/lx/markets/ch/en/x.html">'), doc, 'the main site\'s redirects: swiss-import.mjs successOf');
  assert.equal(withSubSuccess('<div><p>no form</p></div>', html), '<div><p>no form</p></div>');
});

test('swiss-sub-dam.mjs withDaImages: www\'s sub-site-prefixed DAM paths (/corporate/content/dam/...) as the file\'s own, the og logo (/<sub-site>/etc/designs/dcep/logo-lx-og.jpg) as the main site\'s copy', async () => {
  const { withDaImages, DA_CONTENT, filesOf } = await import('../tools/importer/swiss-sub-dam.mjs');
  const { edsDamPath } = await import('../scripts/dam-path.js');
  const doc = '<img src="https://www.swiss.com/corporate/content/dam/lx/images/offers/fallback/generic-stage.jpg"><img src="https://www.swiss.com/medicalservices/etc/designs/dcep/logo-lx-og.jpg" alt="">';
  assert.equal(withDaImages(doc), `<img src="${DA_CONTENT}${edsDamPath('/content/dam/lx/images/offers/fallback/generic-stage.jpg')}"><img src="${DA_CONTENT}/content/dam/lx/images/local_images/logo-lx-og.jpg" alt="">`);
  const files = [...filesOf([{ p: '/corporate/en/a', doc, snap: '' }]).values()].map((x) => x.www).sort();
  assert.deepEqual(files, ['/content/dam/lx/images/local_images/logo-lx-og.jpg', '/content/dam/lx/images/offers/fallback/generic-stage.jpg']);
});

test('swiss-sub-nav.mjs subFooterDocument: the main site\'s footer document plus the sub-sites\' Star Alliance link (www: a maui-navigation-link in the sub-footer\'s third column)', async () => {
  const { parseHTML } = await import('linkedom');
  const { subFooterDocument } = await import('../tools/importer/swiss-sub-nav.mjs');
  const { document } = parseHTML(`<html><body><footer><div class="subfooter"><div class="grid-col-1"><a class="logo" href="https://www.swiss.com"><img src="/etc/designs/lx/clientlib-all/vite/img/swiss-logo.svg" alt="logo, back to homepage"></a>
<a class="lhg-logo" href="https://www.lufthansagroup.com"><img src="/content/dam/lx/icons/lhg.svg" alt="Member of Lufthansa Group"></a></div>
<div class="swiss-site-navigation grid-col-2"><ul><li><a href="/ch/de/terms-conditions/imprint">Impressum</a></li></ul></div>
<div class="grid-col-3"><maui-navigation-link href="https://www.staralliance.com/"><div class="sr-only">Star Alliance</div><img src="/etc/designs/lx/clientlib-all/vite/img/star-alliance.svg" alt="Homepage"></maui-navigation-link></div></div></footer></body></html>`);
  const doc = subFooterDocument(document, new Set());
  assert.ok(doc.includes('<li><a href="https://www.staralliance.com/" title="Star Alliance">:star-alliance:</a></li>'), doc);
  assert.equal((doc.match(/:star-alliance:/g) || []).length, 1);
  const logoRow = doc.split('\n<div>').find((s) => s.includes('lhg.svg'));
  assert.ok(logoRow.includes(':star-alliance:'), 'in the logo row');
});

test('withoutNullLinks: www\'s links to /<sub-site>/null/<ll>.html unwrapped, the content stays', () => {
  const doc = '<p><a href="https://www.swiss.com/medicalservices/null/de.html"><picture><img src="x.jpg"></picture></a></p><a href="/medicalservices/de/contact">ok</a>';
  assert.equal(withoutNullLinks(doc), '<p><picture><img src="x.jpg"></picture></p><a href="/medicalservices/de/contact">ok</a>');
});
