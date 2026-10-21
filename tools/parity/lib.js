/**
 * Small helpers shared by the parity scripts (capture, compare, run-batch).
 */
const fs = require('fs');
const path = require('path');
const { parseArgs } = require('util');

const ROOT = path.resolve(__dirname, '../..');
const DEFAULT_STATE = path.join(ROOT, 'tools/reports/parity/state');

/**
 * Parses --key value options; exits with usage on unknown options or missing required ones.
 * @param {Object} options util.parseArgs option spec (all strings unless type is given)
 * @param {string[]} required names that must be present
 * @param {string} usage usage line printed on error
 */
function getArgs(options, required, usage) {
  let values;
  try {
    ({ values } = parseArgs({ options, strict: true, allowPositionals: false }));
  } catch (e) {
    process.stderr.write(`${e.message}\nusage: ${usage}\n`);
    process.exit(2);
  }
  const missing = required.filter((k) => values[k] === undefined);
  if (missing.length) {
    process.stderr.write(`missing --${missing.join(', --')}\nusage: ${usage}\n`);
    process.exit(2);
  }
  return values;
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Writes JSON via tmp file + rename so a crash never leaves a half-written file. */
function writeJsonAtomic(file, data) {
  mkdirp(path.dirname(file));
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`);
  fs.renameSync(tmp, file);
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return fallback;
  }
}

function appendJsonl(file, data) {
  mkdirp(path.dirname(file));
  fs.appendFileSync(file, `${JSON.stringify(data)}\n`);
}

function rmSafe(file) {
  try {
    fs.unlinkSync(file);
  } catch (e) {
    // already gone
  }
}

module.exports = {
  ROOT, DEFAULT_STATE, getArgs, mkdirp, writeJsonAtomic, readJson, appendJsonl, rmSafe,
};
