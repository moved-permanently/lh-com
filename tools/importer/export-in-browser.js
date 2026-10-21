/* eslint-disable no-console, no-await-in-loop */
/**
 * Optional exporter: paste into the DevTools console of a www.lufthansa.com tab that has
 * passed Cloudflare (cookie dialog answered). A button appears at the top left; click it and
 * choose tools/importer/export-urls.txt. URLs are fetched same-origin, one every DELAY_MS,
 * and saved as export-NNNN.ndjson downloads every CHUNK responses. Progress is kept in
 * localStorage, so reloading the tab and pasting again resumes. It stops at the first
 * Cloudflare block instead of retrying.
 * Put the downloads in tools/source-export/bundles/ and run
 * `node tools/importer/serve-export.mjs --unpack`.
 */
(() => {
  const DELAY_MS = 2500;
  const CHUNK = 100;
  const STATE = 'lh-export-progress';

  const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
  const toBase64 = (buf) => {
    let s = '';
    new Uint8Array(buf).forEach((b) => { s += String.fromCharCode(b); });
    return btoa(s);
  };
  const save = (lines, n) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([`${lines.join('\n')}\n`], { type: 'application/x-ndjson' }));
    a.download = `export-${String(n).padStart(4, '0')}.ndjson`;
    a.click();
  };

  async function run(urls) {
    const state = JSON.parse(localStorage.getItem(STATE) || '{"next":0,"chunk":0}');
    let lines = [];
    for (let i = state.next; i < urls.length; i += 1) {
      const url = urls[i];
      const kind = /sitemap/.test(url) ? 'sitemap' : (/\.model\.json$/.test(url) && 'model') || 'page';
      const resp = await fetch(url, { credentials: 'include' });
      const type = resp.headers.get('content-type') || '';
      if ((resp.status === 403 || resp.status === 503) && type.includes('text/html')) {
        if (lines.length) save(lines, state.chunk);
        console.error(`Blocked by Cloudflare at ${url} (${resp.status}). Stopped; paste again later to resume.`);
        return;
      }
      const gz = url.endsWith('.gz') && !type.includes('xml');
      lines.push(JSON.stringify({
        kind,
        url,
        status: resp.status,
        contentType: type,
        base64: gz,
        text: gz ? toBase64(await resp.arrayBuffer()) : await resp.text(),
        fetchedAt: new Date().toISOString(),
      }));
      state.next = i + 1;
      if (lines.length >= CHUNK || state.next === urls.length) {
        save(lines, state.chunk);
        state.chunk += 1;
        lines = [];
      }
      localStorage.setItem(STATE, JSON.stringify(state));
      console.log(`${state.next}/${urls.length} ${resp.status} ${url}`);
      await sleep(DELAY_MS);
    }
    console.log('Export complete.');
  }

  const input = Object.assign(document.createElement('input'), { type: 'file', accept: '.txt' });
  const button = Object.assign(document.createElement('button'), { textContent: 'Choose export-urls.txt' });
  button.style.cssText = 'position:fixed;top:8px;left:8px;z-index:2147483647;padding:8px 12px';
  button.addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    button.remove();
    const urls = (await input.files[0].text()).split(/\r?\n/).map((u) => u.trim()).filter(Boolean);
    run(urls);
  });
  document.body.append(button);
})();
