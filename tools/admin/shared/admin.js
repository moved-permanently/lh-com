// Shared code of the admin apps: DA SDK start, the signed-in user, API calls with the editor's
// IMS token, downloads and small DOM helpers. The token is only ever sent to the admin API and to
// DA; it is never written to the page or the console.

// eslint-disable-next-line import/no-unresolved
import DA_SDK from 'https://da.live/nx/utils/sdk.js';
import { errorMessage, hasTool, resolveApiBase } from './helpers.js';

export const API = resolveApiBase(window.location.search, window.location.hostname);
const SDK_TIMEOUT_MS = 10000;

let token = null;

// DA sends a fresh token when the old one is renewed; accept it only from the DA window
window.addEventListener('message', (e) => {
  const fromDa = /^https:\/\/da\.(live|page)$/.test(e.origin) && e.source === window.parent;
  if (fromDa && typeof e.data?.token === 'string' && e.data.token) token = e.data.token;
});

/** Creates an element: h('p', { class: 'x' }, 'text', child). Text is always set as text. */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === false) return;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, String(v));
  });
  children.flat().forEach((c) => {
    if (c === undefined || c === null || c === false) return;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  });
  return el;
}

/** A table from column labels and rows of cell values (strings, numbers or nodes). */
export function table(columns, rows, { caption } = {}) {
  return h(
    'table',
    { class: 'admin-table' },
    caption ? h('caption', {}, caption) : null,
    h('thead', {}, h('tr', {}, columns.map((c) => h('th', { scope: 'col' }, c)))),
    h('tbody', {}, rows.map((r) => h('tr', {}, r.map((v) => h('td', {}, v ?? ''))))),
  );
}

const statusEl = () => document.querySelector('.admin-status');

/** Shows a message in the status area: kind info, success or error. */
export function setStatus(text, kind = 'info') {
  const el = statusEl();
  if (!el) return;
  el.textContent = text || '';
  el.dataset.kind = kind;
  el.hidden = !text;
}

export class ApiError extends Error {
  constructor(status, body) {
    super(errorMessage(status, body));
    this.status = status;
    this.body = body;
  }
}

/** Calls the admin API: path below /_lh-backends (e.g. '/admin/me'). JSON in, JSON out. */
export async function api(path, { method = 'GET', body, raw = false } = {}) {
  const headers = { authorization: `Bearer ${token}` };
  if (body !== undefined) headers['content-type'] = 'application/json';
  let res;
  try {
    res = await fetch(`${API}/_lh-backends${path}`, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, {});
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(res.status, err);
  }
  if (raw) return res;
  return res.status === 204 ? null : res.json();
}

/** Calls the API without a token (the open admin-sync routes). */
export async function openApi(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${API}/_lh-backends${path}`, {
      method,
      headers: body === undefined ? {} : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, {});
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, json);
  return json;
}

/** Saves a Blob as a file. */
export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The editor's current IMS token, for DA calls (admin.da.live). */
export const currentToken = () => token;

/** Calls the DA source API (admin.da.live) with the editor's token. */
export async function daSource(org, site, path, { method = 'GET', body } = {}) {
  const res = await fetch(`https://admin.da.live/source/${org}/${site}${path}`, {
    method, headers: { authorization: `Bearer ${token}` }, body,
  }).catch(() => null);
  if (!res) throw new Error('DA cannot be reached. Check your network and try again.');
  return res;
}

function renderUser(text) {
  const el = document.querySelector('.admin-user');
  if (el) el.textContent = text;
}

/**
 * Starts an app: waits for the DA SDK, reads the signed-in user from /admin/me and checks the
 * tool. Returns { context, actions, user, tools } or null when the app cannot run (the reason is
 * shown). `tool` null: any signed-in user; `optional`: show the user if possible, never block.
 */
export async function start({ tool = null, optional = false } = {}) {
  const sdk = await Promise.race([
    DA_SDK,
    new Promise((resolve) => { setTimeout(() => resolve(null), SDK_TIMEOUT_MS); }),
  ]);
  if (!sdk) {
    setStatus('Open this page from DA (da.live/app/...): it needs your DA sign-in.', 'error');
    return null;
  }
  token = token || sdk.token || null;
  const context = sdk.context || {};
  if (!token) {
    if (optional) {
      return {
        context, actions: sdk.actions, user: null, tools: [],
      };
    }
    setStatus('You are not signed in to DA. Sign in at da.live and open the app again.', 'error');
    return null;
  }
  try {
    const me = await api('/admin/me');
    renderUser(`Signed in as ${me.user?.email || 'unknown user'}`);
    if (!optional && !hasTool(me.tools, tool)) {
      setStatus(errorMessage(403), 'error');
      return null;
    }
    return {
      context, actions: sdk.actions, user: me.user, tools: me.tools || [],
    };
  } catch (err) {
    if (optional) {
      renderUser(sdk.email ? `Signed in to DA as ${sdk.email}` : '');
      return {
        context, actions: sdk.actions, user: null, tools: [],
      };
    }
    setStatus(err.message, 'error');
    return null;
  }
}

/** Runs an async action with a busy state on the button and the error in the status area. */
export async function busy(button, fn) {
  if (button) button.disabled = true;
  try {
    return await fn();
  } catch (err) {
    setStatus(err.message || 'Something went wrong.', 'error');
    return undefined;
  } finally {
    if (button) button.disabled = false;
  }
}

/** Loads a script module from a URL once (SheetJS). */
const loaded = new Map();
export function loadModule(url) {
  if (!loaded.has(url)) loaded.set(url, import(url));
  return loaded.get(url);
}

// SheetJS from its official CDN (https://docs.sheetjs.com/docs/getting-started/installation/standalone)
export const SHEETJS_URL = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs';
