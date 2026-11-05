/* eslint-disable max-len, import/extensions -- dev tooling */
/* Air Dolomiti's newsletter strip above the footer (www's CenteredBlock news_letter on the pages
   with the newsletter lazyblock; tools/importer/airdolomiti-import.mjs newsletterStrip): www's
   heading and its line of text, read from the rendered page, then the block newsletter-signup
   (blocks/newsletter-signup: the email field and its button open the site's sign-up page with the
   address filled in) with the sign-up page, www's placeholder, the field's name for screen readers
   (www's sr-only text) and the button's (the heading), all in a section of the style newsletter.
   Without the rendered strip: the language's label as the heading, no text, "Email".
   The sign-up page's form (newsletterRows): the email row takes the address from the page
   address (Rules prefill=email); the other rows as before.
   Run: node --max-old-space-size=512 --test test/airdolomiti-newsletter-strip.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { newsletterStrip, newsletterRows } from '../tools/importer/airdolomiti-import.mjs';

const rendered = '<main><div class="CenteredBlock_news_letter__lTsCz"><h2 class="CenteredBlock_h3_hedline__Veexv">Iscriviti alla nostra newsletter</h2><div class="RichText_richtext__0_pny CenteredBlock_paragraph__large__HOXvM">Scopri le promozioni ed i vantaggi Air Dolomiti</div><div><div class="CenteredBlock_news_letter__box__KBQwI"><label for="newsletter-email-rh"><span class="sr-only">Indirizzo email per la newsletter</span><input id="newsletter-email-rh" type="email" name="email" placeholder="Email"></label></div></div></div></main>';

test('www\'s strip: heading, text and the newsletter-signup block to the sign-up page, in a newsletter section', () => {
  assert.deepEqual(newsletterStrip(rendered, { label: 'Iscriviti alla nostra newsletter', href: '/iscrizione-newsletter' }), {
    style: 'newsletter',
    html: '<h2>Iscriviti alla nostra newsletter</h2><p>Scopri le promozioni ed i vantaggi Air Dolomiti</p>',
    block: {
      name: 'newsletter-signup',
      rows: [
        ['Sign-up page', '<a href="/iscrizione-newsletter">/iscrizione-newsletter</a>'],
        ['Placeholder', 'Email'],
        ['Field label', 'Indirizzo email per la newsletter'],
        ['Button label', 'Iscriviti alla nostra newsletter'],
      ],
    },
  });
});

test('without the rendered strip: the label, no text, "Email"', () => {
  assert.deepEqual(newsletterStrip('<main></main>', { label: 'Sign up to our newsletter', href: '/en/newsletter-subscription' }), {
    style: 'newsletter',
    html: '<h2>Sign up to our newsletter</h2>',
    block: {
      name: 'newsletter-signup',
      rows: [
        ['Sign-up page', '<a href="/en/newsletter-subscription">/en/newsletter-subscription</a>'],
        ['Placeholder', 'Email'],
        ['Field label', 'Sign up to our newsletter'],
        ['Button label', 'Sign up to our newsletter'],
      ],
    },
  });
});

test('the sign-up form: the email row with prefill=email in a Rules column', () => {
  const rows = newsletterRows({
    email: 'Email', consent: 'Acconsento', language: 'Lingua', languages: '<p>it=Italiano{selected}</p>', submit: 'Iscriviti', form: 'airdolomiti-iscrizione-newsletter', success: '/iscrizione-newsletter-conferma',
  });
  assert.deepEqual(rows[0], ['Label', 'Type', 'Name', 'Required', 'Options', 'Rules']);
  assert.deepEqual(rows[1], ['Email', 'email', 'email', 'yes', '', 'prefill=email']);
  assert.ok(rows.slice(2).every((r) => r.length === 6 && r[5] === ''), 'the other rows without rules');
  assert.deepEqual(rows.map((r) => r[1]).slice(1), ['email', 'checkbox', 'select', 'submit', 'config', 'config']);
});
