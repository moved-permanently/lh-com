/* eslint-disable max-len, import/extensions -- dev tooling */
/* Air Dolomiti's newsletter strip above the footer (www's CenteredBlock news_letter on the pages
   with the newsletter lazyblock; tools/importer/airdolomiti-import.mjs newsletterStrip): www's
   heading, its line of text and its field's placeholder, read from the rendered page; the field
   as a link to the site's subscription page (the form is there; styles/themes/airdolomiti.css
   draws the link as www's field with the envelope), all in a section of the style newsletter.
   Without the rendered strip: the language's label as the heading, no text, "Email".
   Run: node --max-old-space-size=512 --test test/airdolomiti-newsletter-strip.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { newsletterStrip } from '../tools/importer/airdolomiti-import.mjs';

const rendered = '<main><div class="CenteredBlock_news_letter__lTsCz"><h2 class="CenteredBlock_h3_hedline__Veexv">Iscriviti alla nostra newsletter</h2><div class="RichText_richtext__0_pny CenteredBlock_paragraph__large__HOXvM">Scopri le promozioni ed i vantaggi Air Dolomiti</div><div><div class="CenteredBlock_news_letter__box__KBQwI"><label for="newsletter-email-rh"><span class="sr-only">Indirizzo email per la newsletter</span><input id="newsletter-email-rh" type="email" name="email" placeholder="Email"></label></div></div></div></main>';

test('www\'s strip: heading, text and the field as a link to the subscription page, in a newsletter section', () => {
  assert.deepEqual(newsletterStrip(rendered, { label: 'Iscriviti alla nostra newsletter', href: '/iscrizione-newsletter' }), {
    style: 'newsletter',
    html: '<h2>Iscriviti alla nostra newsletter</h2><p>Scopri le promozioni ed i vantaggi Air Dolomiti</p><p><a href="/iscrizione-newsletter">Email</a></p>',
  });
});

test('without the rendered strip: the label, no text, "Email"', () => {
  assert.deepEqual(newsletterStrip('<main></main>', { label: 'Sign up to our newsletter', href: '/en/newsletter-subscription' }), {
    style: 'newsletter',
    html: '<h2>Sign up to our newsletter</h2><p><a href="/en/newsletter-subscription">Email</a></p>',
  });
});
