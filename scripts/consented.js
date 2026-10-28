/*
 * Loaded once by scripts/consent.js when the visitor accepts a non-necessary category
 * (OneTrust or the fallback banner). Intentionally empty: tagging (the tag manager and www's data
 * layer) is scripts/martech.js's, off by default and on only for a host in consent.js's
 * MARTECH_HOSTS; it waits for the choice itself. Listen to the 'consent.update' event, detail
 * { consented, groups, source }, for the individual OneTrust categories (C0001 necessary, C0002
 * analytics, C0004 personalisation, C0005 advertising).
 */
