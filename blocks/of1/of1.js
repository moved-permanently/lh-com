import { decorateMain } from '../../scripts/scripts.js';
import { loadSections, readBlockConfig } from '../../scripts/aem.js';
// lh-com: where OF1's API answers (the three host kinds, of1-hosts.js)
import { of1HostKind, of1ApiBase, of1DemoLinks } from './of1-hosts.js';

const DEFAULT_WORKER_URL = 'https://of1-gen-web-service.franklin-prod.workers.dev';

/**
 * Legacy EDS decoration hook — passed to the SDK for non-template-routed
 * section events that need block decoration.
 */
async function decorateAndLoad(sectionHtml) {
  const tempMain = document.createElement('main');
  tempMain.innerHTML = `<div>${sectionHtml}</div>`;
  decorateMain(tempMain);
  await loadSections(tempMain);
  return Array.from(tempMain.querySelectorAll(':scope > div'));
}

/** lh-com: the note on hosts without OF1's API route (aem.page, aem.live, local). */
function renderHostNote(block) {
  const note = document.createElement('div');
  note.className = 'of1-host-note';
  const heading = document.createElement('h2');
  heading.textContent = 'This page works on the demo host';
  const text = document.createElement('p');
  text.textContent = 'The generative page needs the OF1 API, which this host does not route. Open it here:';
  const list = document.createElement('ul');
  of1DemoLinks().forEach((href) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = href;
    link.textContent = new URL(href).host;
    item.append(link);
    list.append(item);
  });
  note.append(heading, text, list);
  block.append(note);
}

export default async function decorate(block) {
  const config = readBlockConfig(block);

  // lh-com: no API route on this host: a note instead of a page that fails
  if (of1HostKind(window.location.hostname) === 'none') {
    block.textContent = '';
    renderHostNote(block);
    return;
  }
  // lh-com: on the lh-edge hosts the API answers on the page's own origin
  const apiBase = of1ApiBase();
  if (apiBase) config['api-base'] = apiBase;

  if (!config['api-endpoint']) {
    config['api-endpoint'] = DEFAULT_WORKER_URL;
  }
  if (!config.domain) {
    const host = window.location.hostname;
    const metaDomain = document.querySelector('meta[name="domain"]')?.content;
    if (metaDomain && metaDomain.includes('--')) {
      config.domain = metaDomain;
    } else if (host.endsWith('.aem.page') || host.endsWith('.aem.live')) {
      config.domain = host.replace(/\.aem\.(page|live)$/, '');
    } else {
      config.domain = metaDomain || host;
    }
  }

  if (!document.querySelector('meta[name="domain"]')) {
    const meta = document.createElement('meta');
    meta.name = 'domain';
    meta.content = config.domain;
    document.head.appendChild(meta);
  }

  block.textContent = '';

  // Load the OF1 client SDK from the worker
  const sdkUrl = `${config['api-endpoint']}/sdk/of1-client.js`;
  const { init } = await import(/* webpackIgnore: true */ sdkUrl);
  await init(block, config, { decorateAndLoad });
}
