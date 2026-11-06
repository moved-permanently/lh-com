/* The excat plugin's strip-scripts.js, which the importers run over each snapshot. It is outside
   git: the excat marketplace's checkout (EXCAT_MARKETPLACE, default
   /home/node/.excat-marketplaces/excat-marketplace). Loaded when it is there; without it (a clean
   clone on another machine) the importers still import for their pure functions (the tests), and
   stripScripts says what is missing when it is called (test/importers-without-plugin.test.mjs). */
import fs from 'node:fs';
import path from 'node:path';

export const EXCAT_MARKETPLACE = process.env.EXCAT_MARKETPLACE || '/home/node/.excat-marketplaces/excat-marketplace';
export const STRIP_SCRIPTS = path.join(EXCAT_MARKETPLACE, 'excat/skills/excat-scrape-webpage/scripts/strip-scripts.js');
export const hasStripScripts = fs.existsSync(STRIP_SCRIPTS);

const missing = () => {
  throw new Error(`stripScripts: ${STRIP_SCRIPTS} is not on this machine (the excat plugin)`);
};

export const { stripScripts } = hasStripScripts
  ? await import(STRIP_SCRIPTS)
  : { stripScripts: missing };
