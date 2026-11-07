/* eslint-disable max-len, no-continue, no-nested-ternary, no-restricted-syntax, object-curly-newline -- dev tooling */
// market-diff verdict: the decision tree that tells whether a market root's page differs from the language version's page,
// on the page facts of a profile (lib/aem-html.mjs or lib/tap-next.mjs pageFacts). Used by bin/md-compare.mjs and
// bin/md-selftest.mjs, so the self-test checks exactly what the inventory runs.
//
// The visible projection of a page (with any market root in links and widget settings counted as the page's own):
//   text     every text run joined, all whitespace removed (markup inside a sentence, a <br> or <span>, does not count)
//   media    image, video and icon references (src, srcset, poster, <use href>), sorted
//   links    link targets (href, form action), sorted
//   attrs    attributes a visitor reads (the profile's VISIBLE_ATTR: alt, title, labels, values ...), sorted
//   widgets  app widgets: custom elements outside the maui design system (<feedback-questionnaire>), sorted
// Decision, first match wins:
//   differs/content     text or media differ
//   differs/links       a link target differs (linkDiff: counts of tel, mailto, external, internal)
//   differs/attributes  a visible attribute differs
//   differs/meta        title or meta description differs
//   differs/widget      a widget's settings (data-* attributes, market codes and ids masked) differ, or an app widget is
//                       on one side only
//   same/same           equal as they are
//   same/links-root     equal once links into another market root count as the page's own
//   same/markup         only the markup around the same text, media, links and attributes differs
import crypto from 'node:crypto';

const LINK_ATTR = /^@(href|action|formaction)=/;
const MEDIA_ATTR = /^@(src|srcset|poster|use)=/;
export const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

/** The visible projection of a token list; visibleAttr: the profile's VISIBLE_ATTR. */
export function visible(tokens, visibleAttr) {
  const text = [];
  const links = [];
  const media = [];
  const attrs = [];
  const widgets = [];
  for (const t of tokens) {
    if (t.startsWith('"')) text.push(t.slice(1, -1));
    else if (/^<[a-z][a-z0-9]*-/.test(t) && !t.startsWith('<maui-')) widgets.push(t.replace(/\..*$/, '>').replace(/>>$/, '>'));
    else if (LINK_ATTR.test(t)) links.push(t.replace(/^@[a-z]+=/, ''));
    else if (MEDIA_ATTR.test(t)) media.push(t.replace(/^@[a-z]+=/, ''));
    else if (visibleAttr.test(t)) attrs.push(t);
  }
  return {
    text: text.join('').replace(/[\s\u00a0\u202f]+/g, ''),
    links: links.sort(),
    media: media.sort(),
    attrs: attrs.sort(),
    widgets: widgets.sort(),
  };
}

/** What kind of links differ between two sorted link lists: tel, mailto, external (another host), internal. */
export function linkKinds(la, lb, host = '') {
  const count = new Map();
  la.forEach((l) => count.set(l, (count.get(l) || 0) + 1));
  lb.forEach((l) => count.set(l, (count.get(l) || 0) - 1));
  const kinds = {};
  for (const [l, c] of count) {
    if (!c) continue;
    let k = 'internal';
    if (/^tel:/i.test(l)) k = 'tel';
    else if (/^mailto:/i.test(l)) k = 'mailto';
    else if (/^(https?:)?\/\//i.test(l) && !(host && l.includes(`//${host}`))) k = 'external';
    kinds[k] = (kinds[k] || 0) + Math.abs(c);
  }
  return kinds;
}

/**
 * Verdict for one pair. a: the version page's facts, b: the root page's facts (pageFacts of the profile).
 * Returns { verdict, cls, linkDiff?, va, vb, contentEq, configEq, versionHash, rootHash }.
 */
export function decide(a, b, { visibleAttr, host = '' }) {
  const contentEq = eq(a.content, b.content);
  const metaEq = a.title === b.title && a.description === b.description;
  const configEq = eq(a.config, b.config);
  const configAnyEq = configEq || eq(a.configAny || [], b.configAny || []);
  const anyEq = contentEq || eq(a.contentAny, b.contentAny);
  const va = visible(a.contentAny, visibleAttr);
  const vb = visible(b.contentAny, visibleAttr);
  const out = { va, vb, contentEq, configEq };
  if (va.text !== vb.text || !eq(va.media, vb.media)) Object.assign(out, { verdict: 'differs', cls: 'content' });
  else if (!eq(va.links, vb.links)) Object.assign(out, { verdict: 'differs', cls: 'links', linkDiff: linkKinds(va.links, vb.links, host) });
  else if (!eq(va.attrs, vb.attrs)) Object.assign(out, { verdict: 'differs', cls: 'attributes' });
  else if (!metaEq) Object.assign(out, { verdict: 'differs', cls: 'meta' });
  else if (!configAnyEq || !eq(va.widgets, vb.widgets)) Object.assign(out, { verdict: 'differs', cls: 'widget' });
  else Object.assign(out, { verdict: 'same', cls: (contentEq && configEq) ? 'same' : (anyEq ? 'links-root' : 'markup') });
  // fingerprints of what a visitor gets: roots with the same rootHash show the same page (md-report.mjs's variants)
  const fp = (f, v) => crypto.createHash('sha1').update([f.title, f.description, v.text, '|', ...v.media, '|', ...v.links, '|',
    ...v.attrs, '|', ...v.widgets, '|', ...(f.configAny || f.config)].join('\n')).digest('hex').slice(0, 12);
  out.versionHash = fp(a, va);
  out.rootHash = fp(b, vb);
  return out;
}
