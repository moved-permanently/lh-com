/*
 * app-service: the home screen's service slot (tools/workers/lh-edge/SDUI.md:
 * sduiServiceIntegration, v2 only), which the app fills itself: a labelled slot naming its
 * Service, Tenant, Market and Language for authors. The Auxiliary data goes to the app unchanged.
 */
import { el, keyValues, cellText } from '../../scripts/app-screen.js';

export default function decorate(block) {
  const kv = keyValues(block);
  const slot = el('div', 'app-service-slot');
  slot.append(el('p', 'app-service-label', 'Service slot: filled by the app'));
  const dl = el('dl');
  [['Service', 'service'], ['Tenant', 'tenant'], ['Market', 'market'], ['Language', 'language']].forEach(([label, key]) => {
    dl.append(el('dt', '', label), el('dd', '', cellText(kv[key]) || '–'));
  });
  slot.append(dl);
  block.replaceChildren(slot);
}
