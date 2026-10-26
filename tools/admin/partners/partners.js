// Deeplink partners: list, create (the key is shown once), rotate the key, disable and enable.
import {
  api, busy, h, setStatus, start, table,
} from '../shared/admin.js';
import { flagNames, partnerBody } from '../shared/helpers.js';

const content = document.getElementById('content');
let partners = [];
let tenantNames = [];
let modeNames = [];

function keyBox(key, what) {
  const copy = h('button', {
    type: 'button',
    class: 'secondary',
    onclick: async () => {
      try {
        await navigator.clipboard.writeText(key);
        setStatus('Key copied to the clipboard.', 'success');
      } catch {
        setStatus('Copy failed. Select the key and copy it by hand.', 'error');
      }
    },
  }, 'Copy key');
  return h(
    'section',
    { class: 'admin-keybox' },
    h('h2', {}, `${what}: copy the key now`),
    h('p', {}, 'This key is shown only once. Give it to the partner over a secure channel. '
      + 'Afterwards only its fingerprint is visible.'),
    h('p', { class: 'admin-key' }, key),
    h('div', { class: 'admin-actions' }, copy, h('button', {
      type: 'button', onclick: (e) => e.target.closest('section').remove(),
    }, 'I have stored the key')),
  );
}

function checkboxes(legend, name, names, values) {
  if (!names.length) return null;
  return h('fieldset', {}, h('legend', {}, legend), names.map((n) => h(
    'label',
    { class: 'check' },
    h('input', {
      type: 'checkbox', name, value: n, checked: Boolean(values?.[n]),
    }),
    ` ${n}`,
  )));
}

function formValues(form) {
  const fd = new FormData(form);
  const get = (k) => (fd.get(k) ?? '').toString();
  return {
    id: get('id'),
    name: get('name'),
    comment: get('comment'),
    validFrom: get('validFrom'),
    validTo: get('validTo'),
    timestampValidity: get('timestampValidity'),
    encryptAll: fd.has('encryptAll'),
    noEncryptionForBookingFlow: fd.has('noEncryptionForBookingFlow'),
    tenants: fd.getAll('tenants').map(String),
    modes: fd.getAll('modes').map(String),
  };
}

function partnerForm(partner, onDone) {
  const create = !partner;
  const p = partner || {};
  const form = h(
    'form',
    { class: 'admin-form' },
    create ? h('label', {}, 'ID (optional, next number if empty)', h('input', { type: 'text', name: 'id', maxlength: 40 })) : null,
    h('label', {}, 'Name', h('input', {
      type: 'text', name: 'name', required: true, maxlength: 200, value: p.name ?? '',
    })),
    h('label', {}, 'Valid from', h('input', { type: 'date', name: 'validFrom', value: p.validFrom ?? '' })),
    h('label', {}, 'Valid to', h('input', { type: 'date', name: 'validTo', value: p.validTo ?? '' })),
    h('label', {}, 'Link validity in minutes', h('input', {
      type: 'number', name: 'timestampValidity', min: 0, max: 10080, required: true, value: p.timestampValidity ?? 60,
    })),
    h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'encryptAll', checked: Boolean(p.encryptAll) }), ' Encrypt all parameters'),
    h('label', { class: 'check' }, h('input', {
      type: 'checkbox', name: 'noEncryptionForBookingFlow', checked: Boolean(p.noEncryptionForBookingFlow),
    }), ' No encryption in the booking flow'),
    h('label', { class: 'wide' }, 'Comment', h('textarea', { name: 'comment', maxlength: 2000 }, p.comment ?? '')),
    checkboxes('Airlines', 'tenants', tenantNames, p.tenants),
    checkboxes('Allowed link types', 'modes', modeNames, p.modes),
    h(
      'div',
      { class: 'admin-actions wide' },
      h('button', { type: 'submit' }, create ? 'Create partner' : 'Save changes'),
      h('button', { type: 'button', class: 'secondary', onclick: () => onDone(null) }, 'Cancel'),
    ),
  );
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const body = partnerBody(formValues(form), { create, tenantNames, modeNames });
    busy(form.querySelector('button[type=submit]'), async () => {
      if (create) {
        const answer = await api('/admin/partners', { method: 'POST', body });
        setStatus(`Partner ${answer.partner.id} created.`, 'success');
        onDone(keyBox(answer.key, `Partner ${answer.partner.id} created`));
      } else {
        await api(`/admin/partners/${encodeURIComponent(p.id)}`, { method: 'PATCH', body });
        setStatus(`Partner ${p.id} saved.`, 'success');
        onDone(null);
      }
    });
  });
  return form;
}

function rotateForm(p, onDone) {
  const today = new Date().toISOString().slice(0, 10);
  const form = h(
    'form',
    { class: 'admin-form' },
    h('p', { class: 'wide' }, `New key for partner ${p.id}. The current key stays valid until the new one starts.`),
    h('label', {}, 'New key valid from', h('input', {
      type: 'date', name: 'keyValidFrom', required: true, min: today, value: today,
    })),
    h(
      'div',
      { class: 'admin-actions wide' },
      h('button', { type: 'submit' }, 'Create new key'),
      h('button', { type: 'button', class: 'secondary', onclick: () => onDone(null) }, 'Cancel'),
    ),
  );
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const keyValidFrom = new FormData(form).get('keyValidFrom');
    busy(form.querySelector('button[type=submit]'), async () => {
      const answer = await api(`/admin/partners/${encodeURIComponent(p.id)}/rotate-key`, { method: 'POST', body: { keyValidFrom } });
      setStatus(`New key for partner ${p.id} created; it is valid from ${keyValidFrom}.`, 'success');
      onDone(keyBox(answer.key, `New key for partner ${p.id}`));
    });
  });
  return form;
}

let render;

function openPanel(build) {
  const panel = document.getElementById('panel');
  panel.replaceChildren(build(async (after) => {
    panel.replaceChildren();
    await render();
    if (after) document.getElementById('panel').append(after);
  }));
}

function row(p) {
  const toggle = h('button', {
    type: 'button',
    class: p.disabled ? 'secondary' : 'danger',
    onclick: (e) => busy(e.target, async () => {
      const action = p.disabled ? 'enable' : 'disable';
      // eslint-disable-next-line no-alert
      if (!p.disabled && !window.confirm(`Disable partner ${p.id}? Its links stop working at once.`)) return;
      await api(`/admin/partners/${encodeURIComponent(p.id)}/${action}`, { method: 'POST' });
      setStatus(`Partner ${p.id} ${action}d.`, 'success');
      await render();
    }),
  }, p.disabled ? 'Enable' : 'Disable');
  return [
    p.id,
    p.name,
    p.validFrom || '',
    p.validTo || '',
    h('code', {}, p.keyFingerprint || ''),
    p.keyInUse === 'backup' ? `previous key until ${p.keyValidFrom}` : 'current',
    p.disabled ? 'disabled' : 'active',
    h(
      'div',
      { class: 'admin-actions' },
      h('button', { type: 'button', class: 'secondary', onclick: () => openPanel((done) => partnerForm(p, done)) }, 'Edit'),
      h('button', { type: 'button', class: 'secondary', onclick: () => openPanel((done) => rotateForm(p, done)) }, 'New key'),
      toggle,
    ),
  ];
}

render = async () => {
  const answer = await api('/admin/partners');
  partners = answer.partners || [];
  tenantNames = flagNames(partners, 'tenants');
  modeNames = flagNames(partners, 'modes');
  const list = document.getElementById('list');
  list.replaceChildren(partners.length
    ? table(['ID', 'Name', 'Valid from', 'Valid to', 'Key fingerprint', 'Key in use', 'Status', ''], partners.map(row))
    : h('p', { class: 'admin-note' }, 'No partners yet.'));
};

(async function init() {
  const app = await start({ tool: 'partners' });
  if (!app) return;
  content.append(
    h('div', { class: 'admin-actions' }, h('button', {
      type: 'button', onclick: () => openPanel((done) => partnerForm(null, done)),
    }, 'New partner')),
    h('div', { id: 'panel' }),
    h('div', { id: 'list' }),
  );
  await busy(null, render);
}());
