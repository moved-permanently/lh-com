/*
 * Loaded once by scripts/consent.js when the visitor accepts a non-necessary category
 * (OneTrust or the fallback banner). Intentionally empty: the replica loads no analytics,
 * tagging or personalisation scripts (no Tealium, Monetate, Google, Quantum Metric).
 * Listen to the 'consent.update' event, detail { consented, groups, source }, for the
 * individual OneTrust categories (C0001 necessary, C0002 analytics, C0004 personalisation,
 * C0005 advertising).
 */
