/* eslint-disable no-console */
/**
 * Post-import step: the homepage stage by date. Moves the imported stage of each market homepage
 * (the hero-card-overlay section, live .mainstageteaser) into the locale's stage promotions
 * document /{cc}/{ll}/fragments/stage-promotions, one section per promotion with a Section
 * Metadata table (Promotion, Start, End), and puts a stage-promotions block linking that
 * document in its place. The block shows the promotion that is active at page view
 * (blocks/stage-promotions). The promotions come from tools/importer/stage-promotions.json:
 * 'homepage-stage' is the imported stage, { card } a stage built from an existing teaser card of
 * the same homepage (carousel-cards row with that title).
 *
 * Run after the homepage import (and head-metadata.mjs), before postprocess-media.mjs and the
 * upload. A homepage that holds no hero-card-overlay any more (already done) is left as it is.
 * Usage: node tools/importer/stage-promotions.mjs [--locale de/en] [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const dry = argv.includes('--dry');
const only = argv.includes('--locale') ? argv[argv.indexOf('--locale') + 1] : null;
const config = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/stage-promotions.json'), 'utf8'));
const file = (p) => path.join(root, 'content', `${p}.plain.html`);

/** Top-level elements of an HTML string (by tag nesting depth), as strings. */
function topLevel(html, tag = 'div') {
  const out = [];
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g');
  let depth = 0;
  let start = 0;
  let m = re.exec(html);
  while (m) {
    if (!m[1]) {
      if (depth === 0) start = m.index;
      depth += 1;
    } else {
      depth -= 1;
      if (depth === 0) out.push(html.slice(start, m.index + m[0].length));
    }
    m = re.exec(html);
  }
  return out;
}

const inner = (html) => html.replace(/^<div\b[^>]*>/, '').replace(/<\/div>$/, '');
const text = (html) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function sectionMetadata(p) {
  const rows = [['Promotion', p.name], ['Start', p.start || ''], ['End', p.end || '']]
    .map(([k, v]) => `<div><div>${k}</div><div>${escape(v)}</div></div>`).join('');
  return `<div class="section-metadata">${rows}</div>`;
}

/** A hero-card-overlay stage from a carousel-cards row of the homepage (by its title). */
function stageFromCard(homepage, title) {
  const blocks = [...homepage.matchAll(/<div class="carousel-cards[^"]*">/g)]
    .map((m) => topLevel(homepage.slice(m.index))[0]);
  const row = blocks.flatMap((b) => topLevel(inner(b))).find((r) => {
    const h = r.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/);
    return h && text(h[1]) === title;
  });
  if (!row) return null;
  const [mediaCell, bodyCell] = topLevel(inner(row));
  const picture = (mediaCell.match(/<picture>[\s\S]*?<\/picture>/) || [''])[0];
  // the card title (h3) is the stage heading (h2, as the live stage)
  const body = inner(bodyCell).replace(/<h[1-6]( [^>]*)?>([\s\S]*?)<\/h[1-6]>/, '<h2$1>$2</h2>');
  return `<div class="hero-card-overlay"><div><div>${picture}</div></div><div><div>${body}</div></div></div>`;
}

Object.entries(config.locales).forEach(([locale, promotions]) => {
  if (only && only !== locale) return;
  const homePath = `/${locale}/homepage`;
  const fragmentPath = `/${locale}/fragments/stage-promotions`;
  if (!fs.existsSync(file(homePath))) {
    console.log(`${homePath}: not imported, skipped`);
    return;
  }
  const homepage = fs.readFileSync(file(homePath), 'utf8');
  const sections = topLevel(homepage);
  const stageIndex = sections.findIndex((s) => s.includes('class="hero-card-overlay'));
  if (stageIndex < 0) {
    console.log(`${homePath}: no stage section (already moved to ${fragmentPath})`);
    return;
  }
  const stage = inner(sections[stageIndex]);
  const built = promotions.map((p) => {
    const content = p.source === 'homepage-stage' ? stage : stageFromCard(homepage, p.source.card);
    if (!content) throw new Error(`${locale}: no teaser card "${p.source.card}" on the homepage`);
    return `<div>${content}${sectionMetadata(p)}</div>`;
  });
  const link = `<div><div class="stage-promotions"><div><div><a href="${fragmentPath}">${fragmentPath}</a></div></div></div></div>`;
  const next = homepage.replace(sections[stageIndex], link);
  if (!dry) {
    fs.mkdirSync(path.dirname(file(fragmentPath)), { recursive: true });
    fs.writeFileSync(file(fragmentPath), `${built.join('\n')}\n`);
    fs.writeFileSync(file(homePath), next);
  }
  console.log(`${homePath}: stage -> ${fragmentPath} (${promotions.map((p) => p.name).join(', ')})`);
});
