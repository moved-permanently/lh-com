// Cloudflare Workers code: worker globals (caches, fetch, Request, ...), plus
// Node for the node:test suites. Inherits airbnb-base from the repo root.
module.exports = {
  env: {
    es2022: true,
    serviceworker: true,
  },
  rules: {
    'import/extensions': ['error', { js: 'always', mjs: 'always' }],
  },
  overrides: [
    {
      files: ['**/test/**/*.js', '**/test/**/*.mjs'],
      env: { node: true },
    },
  ],
};
