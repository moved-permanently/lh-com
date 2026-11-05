/*
 * newsletter-signup: the newsletter strip's field (Air Dolomiti's strip above the footer, as
 * www.airdolomiti.it's CenteredBlock news_letter): an email field and a button that open the
 * site's own sign-up page with the address filled in (?email=, read by the sign-up form's
 * prefill=email row). Nothing is sent from the strip: the sign-up page's form does the sending.
 * An empty or malformed address stays in the field, which reports itself.
 *
 * Rows: Sign-up page (a link to the page), Placeholder, Field label (the field's name for screen
 * readers), Button label (the button's). Without a sign-up page the block shows nothing.
 */

let count = 0;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function readRows(block) {
  const rows = {};
  [...block.children].forEach((row) => {
    const [key, value] = row.children;
    if (!key || !value) return;
    rows[key.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')] = value;
  });
  return rows;
}

/**
 * The sign-up page's address with the email in its query (other parameters kept).
 * @param {string} href the sign-up page (relative or absolute)
 * @param {string} email the address
 * @returns {string}
 */
export function signupUrl(href, email) {
  const [base, query = ''] = href.split('?');
  const params = new URLSearchParams(query);
  params.set('email', email);
  return `${base}?${params.toString()}`;
}

/**
 * @param {Element} block
 * @param {{navigate?: Function}} [opts] navigate(url): opens the page (the window's by default)
 */
export default function decorate(block, { navigate = (url) => window.location.assign(url) } = {}) {
  const rows = readRows(block);
  const link = rows['sign-up-page'] && rows['sign-up-page'].querySelector('a[href]');
  const text = (k) => (rows[k] ? rows[k].textContent.trim() : '');
  block.textContent = '';
  if (!link) return;
  count += 1;
  const id = `newsletter-signup-${count}`;
  const form = el('form', 'newsletter-signup-form');
  form.noValidate = true;
  const label = el('label', 'newsletter-signup-label', text('field-label') || text('placeholder') || 'Email');
  label.setAttribute('for', id);
  const input = el('input', 'newsletter-signup-input');
  input.type = 'email';
  input.id = id;
  input.name = 'email';
  input.required = true;
  input.setAttribute('autocomplete', 'email');
  if (text('placeholder')) input.setAttribute('placeholder', text('placeholder'));
  const button = el('button', 'newsletter-signup-submit');
  button.type = 'submit';
  button.setAttribute('aria-label', text('button-label') || label.textContent);
  form.append(label, input, button);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!email || !input.checkValidity()) {
      input.reportValidity();
      input.focus();
      return;
    }
    navigate(signupUrl(link.getAttribute('href'), email));
  });
  block.append(form);
}
