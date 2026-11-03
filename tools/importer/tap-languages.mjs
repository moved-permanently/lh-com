/* eslint-disable no-console -- tooling */
/**
 * TAP's Spanish (es-es) and French (fr-fr) versions with ema-cashub's tools as they are:
 * tap-import.mjs and tap-nav.mjs have texts in pt and en only (tap-import's LABELS, tap-nav's
 * SETUP), so a page with one of www's widgets or a video stops on LABELS.<lang>, and the nav falls
 * back to English. This runs the current version of either tool with the language's entry added
 * in memory, nothing else changed: a copy in the system's temp folder (its root still this
 * repository), started with the arguments given. A tool that has its own entry for the language
 * runs as it is. After an import run, the run's documents of the locale get mergeMarks (below).
 * (Until brief 306: tap-es-es.mjs, Spanish only.)
 *
 * Usage: node tools/importer/tap-languages.mjs <es-es|fr-fr> import <tap-import.mjs arguments>
 *        node tools/importer/tap-languages.mjs <es-es|fr-fr> nav <tap-nav.mjs arguments>
 *          (the locale is passed on to tap-nav.mjs as --locale)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
/**
 * The texts per language, as www's pages of the locale write them: the help tab and its page
 * (es-es "Ayuda", /es-es/ayuda; fr-fr "Aide", /fr-fr/aide), the language switch (the market's
 * other language on www, en-es and en-fr, not on lh-tap: linked on www), the links' wording
 * (fr-fr writes "Voir l'offre", "Voir le catalogue": "Voir sur flytap.com", "Voir la vidéo").
 */
export const TEXTS = {
  es: {
    import: "  es: { onWww: 'Ver en flytap.com', video: 'Ver el vídeo' },",
    nav: "  es: {\n    logoAlt: 'TAP Air Portugal, volver a la página de inicio', menu: 'Menú', help: ['Ayuda', '/ayuda'], other: ['English', 'en-es'], appStore: 'App Store', googlePlay: 'Google Play',\n  },",
  },
  fr: {
    import: "  fr: { onWww: 'Voir sur flytap.com', video: 'Voir la vidéo' },",
    nav: "  fr: {\n    logoAlt: 'TAP Air Portugal, retour à la page d’accueil', menu: 'Menu', help: ['Aide', '/aide'], other: ['English', 'en-fr'], appStore: 'App Store', googlePlay: 'Google Play',\n  },",
  },
};
const ANCHORS = { import: 'const LABELS = {', nav: 'const SETUP = {' };
const FILES = { import: 'tap-import.mjs', nav: 'tap-nav.mjs' };
const LOCALES = { 'es-es': 'es', 'fr-fr': 'fr' };

/** The language of a locale this wrapper handles (es-es: es, fr-fr: fr). */
export function langOfLocale(locale) {
  const lang = LOCALES[locale];
  if (!lang) throw new Error(`tap-languages.mjs: ${locale} is not one of ${Object.keys(LOCALES).join(', ')}`);
  return lang;
}

/** The tool's source with the language's entry (null when it has one of its own). */
export function withLanguage(src, tool, file, lang) {
  const anchor = ANCHORS[tool];
  const start = src.indexOf(anchor);
  if (start < 0) throw new Error(`${FILES[tool]}: ${anchor} not found`);
  const end = src.indexOf('\n};', start);
  if (new RegExp(`\\n\\s+${lang}:\\s*\\{`).test(src.slice(start, end))) return null;
  const rootLine = 'path.dirname(fileURLToPath(import.meta.url))';
  if (!src.includes(rootLine)) throw new Error(`${FILES[tool]}: root line not found`);
  return src
    .replace(anchor, `${anchor}\n${TEXTS[lang][tool]}`)
    .replace(rootLine, `path.dirname(fileURLToPath(${JSON.stringify(pathToFileURL(file).href)}))`)
    .replace(/from '\.\/tap-import\.mjs'/, `from ${JSON.stringify(pathToFileURL(path.join(here, 'tap-import.mjs')).href)}`);
}

/**
 * A bold run right after a bold-italic one (<em><strong>A</strong></em><strong>B</strong>, as
 * TAP's rich text marks a word inside a bold sentence) as one bold run
 * (<strong><em>A</em>B</strong>), and two bold runs that touch as one: the preview printed the
 * first form's marks as literal asterisks ("Cristo morto**,", "compartido*****").
 */
export function mergeMarks(html) {
  return html
    .replace(/<em><strong>((?:(?!<\/?(?:em|strong)>)[^])*?)<\/strong><\/em><strong>/g, '<strong><em>$1</em>')
    .replace(/<\/strong><strong>/g, '');
}

/**
 * Every document of the locale in the import run (runs/<name>-import.json: pages and fragments,
 * also those the run left as they were) with mergeMarks: the paths changed.
 */
function fixMarks(name, locale) {
  const W = path.join(here, '../../content-sites/lh-tap');
  const report = path.join(W, 'runs', `${name}-import.json`);
  if (!fs.existsSync(report)) return [];
  const docs = Object.values(JSON.parse(fs.readFileSync(report, 'utf8'))).filter((r) => !r.skipped).flatMap((r) => [r.doc, ...(r.fragments || [])]);
  return [...new Set(docs)].filter((p) => p.startsWith(`/${locale}/`) || p === `/${locale}`).filter((p) => {
    const f = path.join(W, 'content', `${p}.plain.html`);
    const html = fs.readFileSync(f, 'utf8');
    const out = mergeMarks(html);
    if (out !== html) fs.writeFileSync(f, out);
    return out !== html;
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [locale, tool, ...rest] = process.argv.slice(2);
  if (!FILES[tool]) { console.log('usage: tap-languages.mjs <es-es|fr-fr> import|nav <the tool\'s arguments>'); process.exit(1); }
  const lang = langOfLocale(locale);
  const args = tool === 'nav' && !rest.includes('--locale') ? [...rest, '--locale', locale] : rest;
  const file = path.join(here, FILES[tool]);
  const src = withLanguage(fs.readFileSync(file, 'utf8'), tool, file, lang);
  let run = file;
  if (src) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), `tap-${locale}-`));
    run = path.join(dir, FILES[tool]);
    fs.writeFileSync(run, src);
  } else console.log(`${FILES[tool]} has its own ${lang} texts: run as it is`);
  const r = spawnSync(process.execPath, [run, ...args], { stdio: 'inherit', cwd: path.join(here, '../..') });
  if (r.status === 0 && tool === 'import' && !args.includes('--dry-run')) {
    const name = args.includes('--name') ? args[args.indexOf('--name') + 1] : 'batch';
    const fixed = fixMarks(name, locale);
    console.log(`mergeMarks: ${fixed.length} ${locale} documents${fixed.length ? `: ${fixed.join(', ')}` : ''}`);
  }
  process.exit(r.status ?? 1);
}
