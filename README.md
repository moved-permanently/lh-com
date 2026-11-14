# search-data

Generated, do not edit. The site search's prebuilt data for lh-edge (`tools/workers/lh-edge/src/search-data.js`
on main): per live locale the searchable pages, their words and where the words stand, and the texts for the
excerpts, built from the locale's search index by `tools/workers/lh-edge/build-search-data.mjs`.

Built by the GitHub Action `.github/workflows/search-data.yaml` (every 10 minutes, or by hand: Actions,
"Search data", Run workflow); it replaces this branch (one commit) only when the data changed. lh-edge uses
a locale's data only while it matches the live search index; otherwise it reads the index as before.
Format 1, scoring code 17701113b9b6b15e.
