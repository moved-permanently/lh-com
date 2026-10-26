// App services (DA library plugin): lists the services an app screen can embed, from the site's
// index of the SDUI service documents, and inserts or copies the id of the chosen one (the
// Service row of an app-service block). Read-only; services are edited as documents in DA.
// eslint-disable-next-line import/no-unresolved
import DA_SDK from 'https://da.live/nx/utils/sdk.js';
import { h, setStatus, table } from '../shared/admin.js';
import { SERVICES_INDEX, filterServices, serviceList } from './services.js';

const content = document.getElementById('content');
const SDK_TIMEOUT_MS = 10000;

async function loadServices() {
  const res = await fetch(`${SERVICES_INDEX}?limit=1000`, { cache: 'no-store' }).catch(() => null);
  if (!res) throw new Error('The service list cannot be reached. Check your network and try again.');
  if (res.status === 404) throw new Error('This site has no app services yet.');
  if (!res.ok) throw new Error(`The service list could not be read (status ${res.status}).`);
  return serviceList(await res.json());
}

(async function init() {
  const sdkPromise = Promise.race([
    DA_SDK,
    new Promise((resolve) => { setTimeout(() => resolve(null), SDK_TIMEOUT_MS); }),
  ]);
  const picked = h('input', {
    type: 'text', readonly: true, class: 'wide', 'aria-label': 'Chosen service id', hidden: true,
  });
  const filter = h('input', {
    type: 'search', name: 'filter', placeholder: 'Filter by name, type or id', 'aria-label': 'Filter services',
  });
  const list = h('div', {});
  content.append(
    h('p', { class: 'admin-note' }, 'Pick the service for the Service row of an app-service block.'),
    h('div', { class: 'admin-form' }, h('label', {}, 'Filter', filter), picked),
    list,
  );

  let services = [];
  try {
    services = await loadServices();
  } catch (err) {
    setStatus(err.message, 'error');
    return;
  }
  if (!services.length) {
    setStatus('The service list is empty.', 'warning');
    return;
  }
  const sdk = await sdkPromise;
  const sendText = sdk?.actions?.sendText;

  const copy = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      picked.hidden = true;
      setStatus(`Copied ${id}`, 'success');
    } catch {
      picked.value = id;
      picked.hidden = false;
      picked.select();
      setStatus('Copy the selected id with Ctrl+C (Cmd+C on a Mac).', 'info');
    }
  };
  const insert = (id) => {
    sendText(id);
    setStatus(`Inserted ${id} at the cursor.`, 'success');
  };

  const draw = () => {
    const shown = filterServices(services, filter.value);
    list.replaceChildren(
      h('p', {}, `${shown.length} of ${services.length} services.`),
      table(['Service', 'Type', 'Details', 'Id', ''], shown.map((s) => [
        h('span', {}, s.name, s.description ? h('br') : null, s.description ? h('small', {}, s.description) : null),
        s.type,
        s.detail,
        h('code', {}, s.id),
        h(
          'span',
          {},
          sendText ? h('button', { type: 'button', onclick: () => insert(s.id) }, 'Insert') : null,
          ' ',
          h('button', { type: 'button', class: 'secondary', onclick: () => copy(s.id) }, 'Copy id'),
        ),
      ])),
    );
  };
  filter.addEventListener('input', draw);
  if (!sendText) setStatus('Open this list from the DA library to insert ids; copying works here too.', 'info');
  draw();
}());
