/* eslint-disable max-len -- tooling */
/**
 * A Template row in the import's Metadata table (standing order 30: lufthansa.com's legal pages get Template legal, so
 * aem.js gives their body the class legal and styles.css can scope the legal pages' own spacing). The Metadata table is
 * the last table whose first cell reads Metadata (WebImporter.rules.createMetadata). Returns whether a row was added;
 * a table with a Template row already, or no Metadata table, changes nothing.
 * @param {Element} main
 * @param {Document} document
 * @param {string} name
 */
export default function addTemplateRow(main, document, name) {
  const tables = [...main.querySelectorAll('table')];
  const meta = tables.reverse().find((t) => /^metadata$/i.test(((t.querySelector('th, td') || {}).textContent || '').trim()));
  if (!meta) return false;
  const rows = [...meta.querySelectorAll('tr')];
  if (rows.some((tr) => /^template$/i.test(((tr.children[0] || {}).textContent || '').trim()))) return false;
  const tr = document.createElement('tr');
  const key = document.createElement('td');
  key.textContent = 'Template';
  const value = document.createElement('td');
  value.textContent = name;
  tr.append(key, value);
  const last = rows[rows.length - 1];
  if (last) last.after(tr); else meta.append(tr);
  return true;
}
