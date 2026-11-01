/*
 * eSIM Widget: Air Dolomiti's eSIM plans (Breeze), behind the site flag esim-widget
 * (scripts/embeds.js). Rows: the attributes of www's <breeze-widget>
 * (www.airdolomiti.it/en/extra-services/plans-esim, 2026-11-01: widget-token, products, currency,
 * max-rows, max-rows-mobile and the colours), then the page's link to www's eSIM page: all the
 * page shows with the flag off. Flag on: as www, the <breeze-widget> with those attributes and
 * Breeze's embed.js (the brand's script, scripts/brands.js embeds) with the page's nonce, no
 * consent wait (www loads it after the page is interactive, before any choice). The widget
 * replaces the link once it shows plans; it fetches its products, countries and currencies from
 * widgets.breezesim.com with the token and posts impressions there. A token Breeze refuses for
 * the host (403 from localhost, 2026-11-01), a script that fails or no plans within 15 s: the link.
 */
import {
  embedWanted, loadEmbedScript, splitEmbedBlock, waitFor,
} from '../../scripts/embeds.js';

const TAG = 'breeze-widget';

async function mountWidget(block, fallback, settings, config) {
  const attributes = Object.entries(settings)
    .filter(([name, value]) => /^[a-z][a-z0-9-]*$/.test(name) && !name.startsWith('on') && value);
  const names = attributes.map(([name]) => name);
  if (!names.includes('widget-token') || !names.includes('products')) return;
  const frame = document.createElement('div');
  frame.className = 'esim-widget-frame';
  frame.setAttribute('hidden', '');
  const widget = document.createElement(TAG);
  attributes.forEach(([name, value]) => widget.setAttribute(name, value));
  frame.append(widget);
  block.prepend(frame);
  try {
    await loadEmbedScript(config.script);
  } catch (e) {
    frame.remove();
    return;
  }
  // the widget replaces the link once it shows plans (its product cards, .card in its open shadow
  // root); where Breeze refuses the token it shows its error state (.error-state, a retry button)
  // and the link stays
  const plans = await waitFor(() => widget.shadowRoot && widget.shadowRoot.querySelector('.card'), 150);
  if (!plans) {
    frame.remove();
    return;
  }
  frame.removeAttribute('hidden');
  fallback.setAttribute('hidden', '');
}

/** @param {Element} block */
export default function decorate(block) {
  const { settings, fallback } = splitEmbedBlock(block, 'esim-widget');
  // the flag is read after the block shows its link: the page never waits for it
  embedWanted('esim-widget').then((config) => {
    if (config) mountWidget(block, fallback, settings, config);
  });
}
