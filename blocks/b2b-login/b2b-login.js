import { readConfigRows, resolveLabels } from '../../scripts/block-config.js';
import { loadSession, pageRoot, sameHostPath } from '../../scripts/b2b-session.js';

/*
 * Lufthansa Group for Business' sign-in (the pages /<root>/login and /<root>/login-internal):
 * a plain HTML form (POST /<cc>/<ll>/j_security_check; without script lh-backends answers with
 * redirects) that the script sends with j_validate=true and follows to the answer's redirectURL.
 * The answers it reads are the brief's contract (README.md).
 */

/** Built-in texts (the rows override them; the documents carry the page's own). */
const TEXTS = {
  en: {
    'user name label': 'User name',
    'password label': 'Password',
    'show password': 'Show password',
    'hide password': 'Hide password',
    'forgotten password': 'Forgotten Password',
    'submit label': 'Login',
    'invalid login': 'The user name or password is not correct.',
    'no rights': 'This account has no access to Lufthansa Group for Business.',
    'backend error': 'The login is not available at the moment. Please try again later.',
    'login failed': 'The login did not work. Please check your details and try again.',
  },
  de: {
    'user name label': 'Benutzername',
    'password label': 'Passwort',
    'show password': 'Passwort anzeigen',
    'hide password': 'Passwort verbergen',
    'forgotten password': 'Passwort vergessen',
    'submit label': 'Anmelden',
    'invalid login': 'Benutzername oder Passwort ist nicht korrekt.',
    'no rights': 'Dieses Konto hat keinen Zugang zu Lufthansa Group for Business.',
    'backend error': 'Die Anmeldung ist im Moment nicht möglich. Bitte versuchen Sie es später noch einmal.',
    'login failed': 'Die Anmeldung hat nicht geklappt. Bitte prüfen Sie Ihre Angaben und versuchen Sie es noch einmal.',
  },
};

let count = 0;

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === null || v === undefined || v === false) return;
    if (k === 'className') node.className = v;
    else node.setAttribute(k, v === true ? '' : v);
  });
  children.forEach((c) => { if (c !== null && c !== undefined) node.append(c); });
  return node;
}

/** The answer's error text key: null when it is a success. */
async function outcome(resp) {
  if (resp.headers.get('auth_status') === 'NOT_AUTHORIZED') return { error: 'no rights' };
  if (resp.headers.get('login_status') === 'backend-not-available') return { error: 'backend error' };
  let data = null;
  try {
    data = await resp.json();
  } catch (e) {
    data = null;
  }
  if (resp.status === 200 && data && !data.error) return { data };
  if (resp.status === 403 && data && data.error === 'invalid-login') return { error: 'invalid login' };
  return { error: 'backend error' };
}

export default function decorate(block) {
  const config = readConfigRows(block);
  const { lang, root } = pageRoot();
  const t = resolveLabels(TEXTS, config, lang);
  const staff = /^staff$/i.test((config.type && config.type.text) || '');
  const params = new URLSearchParams(window.location.search);
  // where the backend sends the visitor after the sign-in: the page's ?redirect= (this host only)
  const resource = sameHostPath(params.get('redirect') || '');
  const forgotten = (config['forgotten-password'] && config['forgotten-password'].link)
    ? config['forgotten-password'].link.getAttribute('href')
    : `https://business.lufthansagroup.com/${root}/forgotten-password`;

  count += 1;
  const id = (name) => `b2b-login-${count}-${name}`;
  const message = el('p', { className: 'b2b-login-message', role: 'alert' });
  message.hidden = true;
  const show = (key) => {
    message.textContent = t[key];
    message.hidden = false;
  };

  const user = el('input', {
    id: id('user'), name: 'j_username', type: 'text', autocomplete: 'username', required: true, autocapitalize: 'none', spellcheck: 'false',
  });
  const pass = el('input', {
    id: id('pass'), name: 'j_password', type: 'password', autocomplete: 'current-password', required: true,
  });
  const toggle = el('button', {
    type: 'button', className: 'b2b-login-toggle', 'aria-controls': id('pass'), 'aria-pressed': 'false',
  }, t['show password']);
  toggle.addEventListener('click', () => {
    const visible = pass.getAttribute('type') === 'password';
    pass.setAttribute('type', visible ? 'text' : 'password');
    toggle.setAttribute('aria-pressed', String(visible));
    toggle.textContent = visible ? t['hide password'] : t['show password'];
  });
  const submit = el('button', { type: 'submit', className: 'button primary b2b-login-submit' }, t['submit label']);
  const form = el(
    'form',
    { className: 'b2b-login-form', method: 'post', action: `/${root}/j_security_check` },
    message,
    el('div', { className: 'b2b-login-field' }, el('label', { for: id('user') }, t['user name label']), user),
    el('div', { className: 'b2b-login-field' }, el('label', { for: id('pass') }, t['password label']), el('div', { className: 'b2b-login-password' }, pass, toggle)),
    el('input', { type: 'hidden', name: 'loginType', value: staff ? 'DESMON' : 'EXT' }),
    resource ? el('input', { type: 'hidden', name: 'resource', value: resource }) : null,
    el('p', { className: 'b2b-login-forgotten' }, el('a', { href: forgotten }, t['forgotten password'])),
    el('p', { className: 'b2b-login-actions' }, submit),
  );

  // back on this page after a sign-in without script, with an ?error=
  if (params.get('error')) show('login failed');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    message.hidden = true;
    submit.disabled = true;
    const body = new URLSearchParams();
    [...form.querySelectorAll('input[name]')].forEach((i) => body.append(i.name, i.value));
    body.set('j_validate', 'true');
    try {
      const resp = await fetch(form.getAttribute('action'), {
        method: 'POST',
        body,
        credentials: 'same-origin',
        headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' },
      });
      const { data, error: key } = await outcome(resp);
      if (key) {
        show(key);
        return;
      }
      let target = sameHostPath(data && data.redirectURL) || resource;
      if (!target) {
        const session = await loadSession();
        const who = session && (session.company || session.experts);
        target = sameHostPath(who && who.home) || `/${root}/home`;
      }
      window.location.assign(target);
    } catch (err) {
      show('backend error');
    } finally {
      submit.disabled = false;
    }
  });

  block.replaceChildren(form);
}
