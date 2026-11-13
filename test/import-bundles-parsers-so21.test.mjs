/* The import bundles carry the parser changes of bce9cab4 (carousel-images: every figure picture of a slide in its
   image cell) and 1f6b6a94 (accordion-columns: a table cell of inline content keeps its bold, line breaks and links).
   The bulk import runs tools/importer/import-<template>.bundle.js, not the parser sources, so a parser change reaches
   an import only after node tools/importer/build-bundles.mjs (standing order 21, item 1).
   Run: node --test test/import-bundles-parsers-so21.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const dir = new URL('../tools/importer/', import.meta.url);
const bundles = fs.readdirSync(dir).filter((f) => /^import-.+\.bundle\.js$/.test(f));
const read = (f) => fs.readFileSync(new URL(f, dir), 'utf8');

const changes = [
  ['carousel-images', 'const more = [...slide.querySelectorAll("figure img")]', 'figure img'],
  ['accordion-columns', 'const inlineNodes = (root) =>', 'const inlineNodes = (root) =>'],
];

changes.forEach(([parser, bundled, source]) => {
  test(`every bundle with the ${parser} parser carries its current code`, () => {
    assert.ok(fs.readFileSync(new URL(`parsers/${parser}.js`, dir), 'utf8').includes(source), 'the source has the change');
    const withParser = bundles.filter((f) => read(f).includes(`// tools/importer/parsers/${parser}.js`));
    assert.ok(withParser.length > 0, `no bundle includes ${parser}`);
    withParser.forEach((f) => assert.ok(read(f).includes(bundled), f));
  });
});
