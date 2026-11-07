/* eslint-disable max-len -- dev tooling */
// market-diff file helper: the committed lists (tools/market-diff/lists/) are gzipped to keep the repository small.
import fs from 'node:fs';
import zlib from 'node:zlib';

/** A text file's content; a name ending in .gz is gunzipped. */
export default function readText(file) {
  const buf = fs.readFileSync(file);
  return (file.endsWith('.gz') ? zlib.gunzipSync(buf) : buf).toString('utf8');
}
