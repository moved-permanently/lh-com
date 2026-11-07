/* eslint-disable max-len, no-continue, no-restricted-syntax, object-curly-newline -- dev tooling */
// Token list diff for evidence files: common prefix and suffix trimmed, LCS on the middle when it is small enough,
// else a multiset difference (order ignored). Returns [{op: '=', '-', '+', t}] for the middle part only.
export function diffTokens(a, b, maxCells = 4e6) {
  let s = 0;
  while (s < a.length && s < b.length && a[s] === b[s]) s += 1;
  let ea = a.length;
  let eb = b.length;
  while (ea > s && eb > s && a[ea - 1] === b[eb - 1]) { ea -= 1; eb -= 1; }
  const ma = a.slice(s, ea);
  const mb = b.slice(s, eb);
  const out = [];
  if (ma.length * mb.length <= maxCells) {
    const n = ma.length;
    const m = mb.length;
    const w = m + 1;
    const L = new Uint32Array((n + 1) * w);
    for (let i = n - 1; i >= 0; i -= 1) {
      for (let j = m - 1; j >= 0; j -= 1) {
        L[i * w + j] = ma[i] === mb[j] ? L[(i + 1) * w + j + 1] + 1 : Math.max(L[(i + 1) * w + j], L[i * w + j + 1]);
      }
    }
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (ma[i] === mb[j]) { out.push({ op: '=', t: ma[i] }); i += 1; j += 1; } else if (L[(i + 1) * w + j] >= L[i * w + j + 1]) { out.push({ op: '-', t: ma[i] }); i += 1; } else { out.push({ op: '+', t: mb[j] }); j += 1; }
    }
    while (i < n) { out.push({ op: '-', t: ma[i] }); i += 1; }
    while (j < m) { out.push({ op: '+', t: mb[j] }); j += 1; }
    return { start: s, ops: out, exact: true };
  }
  const count = new Map();
  ma.forEach((t) => count.set(t, (count.get(t) || 0) + 1));
  mb.forEach((t) => count.set(t, (count.get(t) || 0) - 1));
  for (const [t, c] of count) {
    if (c > 0) for (let k = 0; k < c; k += 1) out.push({ op: '-', t });
    if (c < 0) for (let k = 0; k < -c; k += 1) out.push({ op: '+', t });
  }
  return { start: s, ops: out, exact: false };
}

/** A short human summary of a diff: what only one side has, by kind (text, links, images, components). */
export function summarise(ops, { max = 4, len = 90 } = {}) {
  const side = { '-': { text: [], link: [], media: [], el: [], attr: [] }, '+': { text: [], link: [], media: [], el: [], attr: [] } };
  ops.filter((o) => o.op !== '=').forEach(({ op, t }) => {
    const s = side[op];
    if (t.startsWith('"')) s.text.push(t.slice(1, -1));
    else if (t.startsWith('@href=')) s.link.push(t.slice(6));
    else if (/^@(src|srcset|poster|data-src)=/.test(t)) s.media.push(t.replace(/^@[a-z-]+=/, ''));
    else if (t.startsWith('<')) s.el.push(t);
    else s.attr.push(t);
  });
  const q = (arr) => arr.slice(0, max).map((x) => `"${x.length > len ? `${x.slice(0, len)}…` : x}"`).join(', ') + (arr.length > max ? ` (+${arr.length - max})` : '');
  const parts = [];
  const kinds = [['text', 'text'], ['link', 'links'], ['media', 'media'], ['el', 'elements'], ['attr', 'attributes']];
  for (const [k, label] of kinds) {
    const r = side['+'][k];
    const v = side['-'][k];
    if (!r.length && !v.length) continue;
    const bits = [];
    if (r.length) bits.push(`root only ${r.length}: ${q(r)}`);
    if (v.length) bits.push(`version only ${v.length}: ${q(v)}`);
    parts.push(`${label}: ${bits.join('; ')}`);
  }
  return {
    text: parts.join(' | '),
    counts: Object.fromEntries(['-', '+'].map((o) => [o === '+' ? 'rootOnly' : 'versionOnly', Object.fromEntries(Object.entries(side[o]).map(([k, v]) => [k, v.length]))])),
  };
}
