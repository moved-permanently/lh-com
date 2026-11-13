/* eslint-disable max-len, import/extensions */
/* The brief after 539 (the Austrian collapse pass, tools/reports/token-free/austrian-pass-result.md): the collapse writes
   a no-break space as &#160;, linkedom splits a text node at an entity ("Familie", " ", "– und"), and the loss check took
   a list sign ("- ", "– ", "1. ") from the start of every text node, so the dash after the no-break space went and the
   check reported a loss that is not one: /at/de, /pl/pl, /ru/ru travelling-with-animals and /pl/pl/online-check-in (the
   texts below are theirs). The list sign is now read from the start of a run of sibling text nodes (the text as written),
   not from a piece an entity split off. A list sign at a paragraph's start still goes, and a dash that is really lost is
   still reported. Run: node --max-old-space-size=256 --test test/collapse-loss-nbsp-dash-539.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { lossProblems } from '../tools/importer/collapse-loss-check.mjs';

const NB = String.fromCharCode(0xa0);
const FOUR = [
  ['/at/de/plan/special-requirements/travelling-with-animals', 'Ihr Haustier ist Teil Ihrer Familie', '– und natürlich manchmal auch Teil Ihrer Reisepläne.'],
  ['/pl/pl/plan/special-requirements/travelling-with-animals', 'Twój pupil jest członkiem rodziny', '– i oczywiście czasami również towarzyszy Ci w podróży.'],
  ['/ru/ru/plan/special-requirements/travelling-with-animals', 'Ваш питомец', '— часть вашей семьи.'],
  ['/pl/pl/online-check-in', 'Zaloguj się za pomocą istniejącego Travel ID', '– lub utwórz go w kilka sekund – aby kontynuować odprawę online.'],
];

test('a dash after a no-break space the collapse wrote as &#160; is no loss (the four Austrian documents)', () => {
  FOUR.forEach(([p, head, tail]) => {
    const before = `<div><h1>Title</h1><p>${head}${NB}${tail}</p></div>`;
    const after = `<div><h1>Title</h1><p>${head}&#160;${tail}</p></div>`;
    assert.deepEqual(lossProblems(before, after), [], p);
    assert.deepEqual(lossProblems(before, after.replace('&#160;', '&nbsp;')), [], `${p} (&nbsp;)`);
  });
});

test('a list sign at a paragraph\'s start still goes (the collapse makes it a list); a lost dash is still reported', () => {
  assert.deepEqual(lossProblems('<div><p>- Erstens</p><p>- Zweitens</p></div>', '<div><ul><li>Erstens</li><li>Zweitens</li></ul></div>'), []);
  assert.deepEqual(lossProblems('<div><p>1. Erstens</p></div>', '<div><ol><li>Erstens</li></ol></div>'), []);
  assert.equal(lossProblems(`<div><p>Familie${NB}– und</p></div>`, '<div><p>Familie und</p></div>').length, 1);
});
