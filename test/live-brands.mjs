/* eslint-disable max-len, import/extensions -- dev tooling */
/* The brands whose theme is meant to be live (scripts/style-markers.js THEMES[brand].live): each switch comes with its own
   test, test/token-free-<brand>-live.test.mjs, so a brand is live exactly where that file is. The shared tests read the
   list from here and check the rest stays off, without a switch branch having to edit them (the brief after 506: the
   switch branches merge one by one, without conflicts). offThemes: a check of what a theme that is off does, whatever
   is switched. */
import fs from 'node:fs';
import { THEMES } from '../scripts/style-markers.js';

export const BRANDS = ['lufthansa', 'austrian', 'brussels', 'ita', 'swiss', 'tap', 'discover', 'b2b', 'cargo', 'airdolomiti'];

export const LIVE = new Set(fs.readdirSync(new URL('.', import.meta.url))
  .map((f) => (f.match(/^token-free-([a-z0-9]+)-live\.test\.mjs$/) || [])[1]).filter(Boolean));

/** Runs fn with every theme off (THEMES[brand].live false), then puts the switches back. */
export function offThemes(fn) {
  const saved = Object.entries(THEMES).map(([b, t]) => [b, t.live]);
  Object.values(THEMES).forEach((t) => { t.live = false; });
  try { return fn(); } finally { saved.forEach(([b, v]) => { if (v === undefined) delete THEMES[b].live; else THEMES[b].live = v; }); }
}
