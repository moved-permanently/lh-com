/* eslint-disable import/prefer-default-export, max-len */
/**
 * JSON schemas of the GraphQL feed models (DA structured content, /.da/forms/schemas/<name>).
 * One document per item under /data/...; `dam-path` keeps www's _path where the document path
 * differs (EDS names: lower case, no accents, no "&", "_" as "-"). `order` keeps www's position
 * where www's order is not the document path's.
 */
const str = (title, description, extra = {}) => ({
  type: 'string', title, description, ...extra,
});
const bool = (title, description) => ({ type: 'boolean', title, description });
const list = (title, description, items = { type: 'string' }) => ({
  type: 'array', title, description, items,
});
const damPath = str('AEM path (_path)', 'www\'s /content/dam/... path of the item, sent as _path. Optional for new items: then the document path with /data/ as /content/dam/.', { pattern: '^/content/dam/' });
const order = { type: 'integer', title: 'Order', description: 'Optional. Position among items of the same sort value (www\'s order); lower first.' };
const details = (title) => str(title, 'Path of the companion document with the rich text, under /data/details/.', { pattern: '^/data/details/' });

const AIRLINES = ['LH', 'LX', 'OS', 'SN', 'AZ', '4Y', 'VL', 'EW', 'EN', 'WK'];

export const SCHEMAS = {
  'lh-whatsnew': {
    type: 'object',
    title: 'What\'s new (Lufthansa app)',
    description: 'One release note of the app in one language: /data/lufthansa-group/mobileapp/whats-new/LANGUAGE/NAME. The long text is a companion document under /data/details/lufthansa-group/mobileapp/whats-new/.',
    required: ['release-version', 'date', 'headline', 'tenants', 'platforms'],
    properties: {
      'dam-path': damPath,
      'release-version': str('Release version', 'App release, for example 638.0.'),
      date: str('Date', 'Release date, YYYY-MM-DD. Lists are sorted by it, newest first.', { pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
      'activation-date': str('Activation date', 'Start pop-ups show from this time on, e.g. 2025-12-17T09:22:00.000+01:00.'),
      headline: str('Headline', 'Title of the note.'),
      'short-text': str('Short text', 'Plain text teaser.'),
      'long-text': details('Long text document'),
      tenants: list('Tenants (airlines)', 'Apps that show the note.', { type: 'string', enum: ['lh', 'lx', 'os', 'sn', 'ita', 'lhg'] }),
      platforms: list('Platforms', 'android, ios.', { type: 'string', enum: ['android', 'ios'] }),
      'early-access': bool('Early access', 'Only for early-access users (tag mobile-app:early-access).'),
      'start-popup': bool('Start pop-up', 'Shown as a pop-up when the app starts (tag mobile-app:start-popup).'),
      'feature-flag': str('Feature flag', 'Name of the app feature flag, e.g. expressWayV2Enabled.'),
      image: str('Image', 'Generic image, DAM path /content/dam/...'),
      'image-lh': str('Image Lufthansa', 'DAM path'),
      'image-lx': str('Image SWISS', 'DAM path'),
      'image-sn': str('Image Brussels Airlines', 'DAM path'),
      'image-os': str('Image Austrian', 'DAM path'),
      'image-az': str('Image ITA Airways', 'DAM path'),
      order,
    },
  },
  'lh-benefit-item': {
    type: 'object',
    title: 'Upgrade benefit (benefit card)',
    description: 'One benefit of an upgrade: /data/lufthansa-group/ancillary/upgrade/benefitcard/benefititems/LANGUAGE/NAME.',
    required: ['id', 'airline', 'label'],
    properties: {
      id: str('ID', 'Benefit id, e.g. business-class-meal.'),
      icon: str('Icon', 'Icon name, e.g. menu-premium.'),
      airline: str('Airline', 'Two-letter code.', { enum: AIRLINES }),
      'flight-type': str('Flight type', 'short-haul or long-haul.', { enum: ['short-haul', 'long-haul'] }),
      label: str('Label', 'Text of the benefit.'),
      'upgrade-class': list('Upgrade classes', 'e.g. Business, Premium Economy.'),
      order,
    },
  },
  'lh-allegris-aircraft': {
    type: 'object',
    title: 'Allegris aircraft',
    description: 'One aircraft version with the Allegris cabin: /data/lufthansa-group/ancillary/allegris-upgrade/aircraft/NAME.',
    required: ['airline', 'acv'],
    properties: {
      airline: str('Airline', 'Two-letter code.', { enum: AIRLINES }),
      acv: str('Aircraft version (ACV)', 'e.g. 77B.'),
      'display-badge': bool('Display badge', 'Show the Allegris badge.'),
      order,
    },
  },
  'lh-travel-regulation': {
    type: 'object',
    title: 'Travel regulation',
    description: 'Entry rules for one country in one variation: /data/content-fragments/travelready-infohub/COUNTRY/VARIATION (variation master, de, fr, ...). Destination and transit texts are companion documents under /data/details/content-fragments/travelready-infohub/.',
    required: ['country', 'variation'],
    properties: {
      country: str('Country', 'Two-letter country code (folder), e.g. ca.'),
      variation: str('Variation', 'master, or the language of the variation (de, fr, ...).'),
      destination: details('Destination text document'),
      transit: details('Transit text document'),
      created: str('Created', 'Optional. Sent as jcr:created (www\'s value); else the last change.'),
      modified: str('Modified', 'Optional. Sent as cq:lastModified (www\'s value); else the last change.'),
      order,
    },
  },
  'lh-ancillary': {
    type: 'object',
    title: 'Ancillary service (Trip Management catalog)',
    description: 'One service of the Trip Management catalog with one entry per airline variation: /data/lufthansa-group/ancillary/tmc/catalog/NAME.',
    required: ['name', 'variations'],
    properties: {
      name: str('Service name', 'e.g. BidUpgrade.'),
      order,
      variations: list('Variations', 'master and one per airline (lh, lx, os, sn, az, yy).', {
        type: 'object',
        title: 'Variation',
        properties: {
          variation: str('Variation', 'master, lh, lx, os, sn, az, yy.'),
          enabled: bool('Enabled', 'Offer the service.'),
          'redirect-base-url': str('Redirect URL', 'Base URL of the partner page.'),
          'image-url': str('Image URL', 'Absolute image URL.'),
          localization: list('Texts per locale', 'One entry per locale.', {
            type: 'object',
            title: 'Locale',
            properties: {
              locale: str('Locale', 'e.g. de, en.'),
              title: str('Title', ''),
              description: str('Description', ''),
              'text-link': str('Link text', ''),
            },
          }),
          properties: list('Properties', 'Name, type and value; key-like values stay blank.', {
            type: 'object',
            title: 'Property',
            properties: {
              name: str('Name', ''),
              type: str('Type', 'STRING'),
              value: str('Value', ''),
            },
          }),
        },
      }),
    },
  },
  'lh-sdui-service': {
    type: 'object',
    title: 'SDUI service',
    description: 'One service of the app\'s server-driven UI orchestrator: /data/content-fragments/orchestrator-services/sdui-services/NAME.',
    required: ['service-type'],
    properties: {
      'dam-path': damPath,
      description: str('Description', 'Plain text.'),
      'service-type': str('Service type', 'SDK or HTTP.', { enum: ['SDK', 'HTTP'] }),
      framework: str('Framework', 'SPRING, VANILLA (SDK services).'),
      url: str('URL', 'HTTP services.'),
      'provider-class-name': str('Provider class', 'SDK services.'),
      'service-is-cacheable': bool('Cacheable', ''),
      'caching-time': { type: 'integer', title: 'Caching time', description: 'Seconds.' },
      order,
    },
  },
  'lh-b2b-flag': {
    type: 'object',
    title: 'B2B Neo feature flag',
    description: 'One feature flag of the B2B portal: /data/hcl/content-fragments/NAME.',
    required: ['flag-key'],
    properties: {
      'dam-path': damPath,
      'flag-key': str('Flag key', 'e.g. navigationFlag.'),
      enabled: bool('Enabled', ''),
      name: str('Name', ''),
      description: str('Description', 'Plain text; paragraphs separated by an empty line. Sent as html, markdown, plaintext and json.'),
      scope: str('Scope', 'e.g. global.'),
      markets: list('Markets', 'Empty: all.'),
      'user-segments': list('User segments', 'Empty: all.'),
      'start-date': str('Start', 'e.g. 2026-02-13T10:05:00.000+01:00.'),
      'end-date': str('End', ''),
      order,
    },
  },
};
