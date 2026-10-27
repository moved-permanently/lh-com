/**
 * The `markets` rule of choice B (AUTHORING.md "Market roots"), shared by the site and lh-edge:
 * on a language version's page (page metadata) and on a section (section metadata), an include
 * list of countries (`de, at`), an exclude list (`-ch, -us`) or empty (every market).
 */

/**
 * Whether a `markets` value allows a country.
 * @param {string} value e.g. 'de, at' or '-de'
 * @param {string} country two-letter code, lower case
 * @returns {boolean}
 */
export function marketAllows(value, country) {
  const items = String(value || '').toLowerCase().split(/[\s,;]+/).filter(Boolean);
  const exclude = items.filter((i) => i.startsWith('-')).map((i) => i.slice(1));
  const include = items.filter((i) => !i.startsWith('-'));
  if (exclude.includes(country)) return false;
  return !include.length || include.includes(country);
}

/** The `markets` value of a section's section metadata in document HTML, or null without one. */
export function sectionMarkets(sectionHtml) {
  const at = sectionHtml.indexOf('<div class="section-metadata">');
  if (at < 0) return null;
  // the section metadata block: to its own closing tag
  const re = /<div\b[^>]*>|<\/div>/g;
  re.lastIndex = at;
  let depth = 0;
  let end = sectionHtml.length;
  let m = re.exec(sectionHtml);
  while (m) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) {
      end = re.lastIndex;
      break;
    }
    m = re.exec(sectionHtml);
  }
  const block = sectionHtml.slice(at, end);
  const row = block.match(/<div><div>(?:<p>)?\s*markets\s*(?:<\/p>)?<\/div><div>(?:<p>)?([^<]*)(?:<\/p>)?<\/div><\/div>/i);
  return row ? row[1].trim() : null;
}

/**
 * Document HTML (a page's <main>, or a .plain.html) without the sections whose `markets`
 * excludes the country. Sections are the top-level <div>s of <main> (of the whole text for
 * .plain.html); HTML without a section metadata block comes back as it is.
 */
export function dropMarketSections(html, country) {
  if (!html.includes('class="section-metadata"')) return html;
  const open = html.indexOf('<main>');
  const start = open < 0 ? 0 : open + '<main>'.length;
  const close = html.lastIndexOf('</main>');
  const end = close < 0 ? html.length : close;
  const drop = [];
  const re = /<div\b[^>]*>|<\/div>/g;
  re.lastIndex = start;
  let depth = 0;
  let sectionStart = -1;
  let m = re.exec(html);
  while (m && m.index < end) {
    if (m[0] === '</div>') {
      depth -= 1;
      if (depth === 0) {
        const value = sectionMarkets(html.slice(sectionStart, re.lastIndex));
        const out = value !== null && !marketAllows(value, country);
        if (out) drop.push([sectionStart, re.lastIndex]);
      }
    } else {
      if (depth === 0) sectionStart = m.index;
      depth += 1;
    }
    m = re.exec(html);
  }
  return drop.reverse().reduce((out, [a, b]) => `${out.slice(0, a)}${out.slice(b)}`, html);
}
