/* The "Tours and activities" icon (brief 318): 107 homepages in DA write :tours-and-activities:
   (the zh, hk, ru, pt, es and fr versions and their market roots, many en and de market roots), 132
   write :ttours-and-activities: (de/en among them; fb850f2's misspelt file name). Both names
   load the same icon; the misspelt file stays for the documents that use it.
   Run: node --max-old-space-size=512 --test test/icon-tours-and-activities.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('icons/tours-and-activities.svg is there, the same icon as icons/ttours-and-activities.svg (which stays)', () => {
  const misspelt = fs.readFileSync('icons/ttours-and-activities.svg');
  assert.ok(fs.existsSync('icons/tours-and-activities.svg'), 'icons/tours-and-activities.svg');
  assert.ok(fs.readFileSync('icons/tours-and-activities.svg').equals(misspelt));
  assert.match(misspelt.toString(), /^<svg[\s>]/);
});
