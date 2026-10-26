// Article assistant (DA library plugin): keyword suggestions for the open document and a draft
// article from a short brief. It reads the last saved version of the document.
import {
  api, busy, daSource, h, setStatus, start,
} from '../shared/admin.js';
import { articleHtml, languageFromPath } from '../shared/helpers.js';

const content = document.getElementById('content');
const MAX_TEXT = 50000;

/** Title, description and text of a DA document (HTML as stored in DA). */
function readDocument(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  let description = '';
  doc.querySelectorAll('div.metadata > div').forEach((row) => {
    const [key, value] = row.children;
    if (key && value && key.textContent.trim().toLowerCase() === 'description') description = value.textContent.trim();
  });
  doc.querySelectorAll('div.metadata').forEach((m) => m.remove());
  const title = doc.querySelector('h1')?.textContent.trim() || '';
  if (!description) description = doc.querySelector('p')?.textContent.trim() || '';
  const text = (doc.body.textContent || '').replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT);
  return { title, description, text };
}

function insertButtons(app, words) {
  return h('ul', {}, words.map((w) => h('li', {}, `${w} `, h('button', {
    type: 'button', class: 'secondary', onclick: () => app.actions.sendText(w),
  }, 'Insert'))));
}

(async function init() {
  const app = await start({ tool: 'articles' });
  if (!app) return;
  const { org } = app.context;
  const site = app.context.repo || app.context.site;
  const path = app.context.path || '';
  const language = h('input', {
    type: 'text', name: 'language', value: languageFromPath(path), pattern: '[a-z]{2}', maxlength: 5, size: 4,
  });
  const keywordsOut = h('div', {});
  const draftOut = h('div', {});
  const prompt = h('textarea', { name: 'prompt', maxlength: 4000, placeholder: 'What should the article be about?' });
  const tenant = h('input', {
    type: 'text', name: 'tenant', maxlength: 10, size: 6, placeholder: 'LH',
  });

  const suggest = async () => {
    if (!path) throw new Error('Open a document first.');
    const res = await daSource(org, site, `${path.replace(/\.html$/, '')}.html`);
    if (!res.ok) throw new Error(`The document could not be read from DA (status ${res.status}). Save it and try again.`);
    const docText = readDocument(await res.text());
    if (!docText.title || !docText.description || !docText.text) {
      throw new Error('The document needs a heading, a description (or a first paragraph) and some text.');
    }
    const r = await api('/admin/articles/generate-keywords', { method: 'POST', body: { language: language.value.trim(), ...docText } });
    if (!prompt.value) prompt.value = docText.title;
    keywordsOut.replaceChildren(
      h('h3', {}, 'Keywords'),
      r.keywords?.length ? insertButtons(app, r.keywords) : h('p', { class: 'admin-note' }, 'No keywords suggested.'),
      h('h3', {}, 'Destinations'),
      r.destinations?.length ? insertButtons(app, r.destinations) : h('p', { class: 'admin-note' }, 'No destinations found.'),
    );
    setStatus('');
  };

  const draft = async () => {
    if (!prompt.value.trim()) throw new Error('Write a short brief first.');
    const body = { language: language.value.trim(), prompt: prompt.value.trim() };
    if (tenant.value.trim()) body.tenant = tenant.value.trim().toUpperCase();
    const r = await api('/admin/articles/generate-article', { method: 'POST', body });
    draftOut.replaceChildren(
      h('h3', {}, r.title || 'Draft'),
      r.description ? h('p', { class: 'admin-note' }, r.description) : '',
      ...String(r.text || '').split(/\n\s*\n/).filter(Boolean).map((p) => h('p', {}, p)),
      h('div', { class: 'admin-actions' }, h('button', {
        type: 'button',
        onclick: () => {
          app.actions.sendHTML(articleHtml(r));
          setStatus('Draft inserted at the cursor. Check every sentence before publishing.', 'success');
        },
      }, 'Insert draft into the document')),
    );
    setStatus('');
  };

  content.append(
    h('p', { class: 'admin-note' }, path ? `Document: ${path}` : 'No document open.'),
    h('div', { class: 'admin-form' }, h('label', {}, 'Language', language), h('label', {}, 'Airline (optional)', tenant)),
    h('div', { class: 'admin-actions' }, h('button', { type: 'button', onclick: (e) => busy(e.target, suggest) }, 'Suggest keywords')),
    keywordsOut,
    h('h2', {}, 'Draft an article'),
    h('label', { class: 'wide' }, 'Brief', prompt),
    h('div', { class: 'admin-actions' }, h('button', { type: 'button', onclick: (e) => busy(e.target, draft) }, 'Write draft')),
    draftOut,
  );
}());
