/*
 * Newsletter Form: Lufthansa Cargo's Dynamics 365 Customer Insights form, behind the site flag
 * newsletter-form (scripts/embeds.js). Rows: Form ID | Form API URL | Cached Form URL (the
 * data-form-id, data-form-api-url and data-cached-form-url of www.lufthansa-cargo.com's
 * /en/ci/newsletter form, 2026-11-01), then the page's link to www's form: all the page shows with
 * the flag off. Flag on: as www, the container with the three attributes and Microsoft's
 * FormLoader.bundle.js (the brand's script, scripts/brands.js embeds) with the page's nonce; no
 * consent wait (www loads it before Usercentrics). The form replaces the link while Dynamics shows
 * it; its refusal box (a host not allowed for external form hosting, today every host but
 * www.lufthansa-cargo.com; meant for the form's admin: not shown) brings the link back. On
 * success Dynamics sends the visitor to the confirmation page set in the form
 * (lufthansa-cargo.com's).
 */
import { embedWanted, loadEmbedScript, splitEmbedBlock } from '../../scripts/embeds.js';

const FORM_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Whether an authored URL is an https URL on the brand's Dynamics host. */
function isFormUrl(text, formHost) {
  try {
    const url = new URL(text);
    return url.protocol === 'https:' && url.hostname.endsWith(formHost);
  } catch (e) {
    return false;
  }
}

async function mountForm(block, fallback, settings, config) {
  const id = settings['form-id'];
  const api = settings['form-api-url'];
  const cached = settings['cached-form-url'];
  if (!FORM_ID.test(id || '') || !isFormUrl(api, config.formHost)
    || !isFormUrl(cached, config.formHost)) return;
  const box = document.createElement('div');
  box.dataset.formId = id;
  box.dataset.formApiUrl = api;
  box.dataset.cachedFormUrl = cached;
  block.prepend(box);
  // the link while there is no form: Dynamics renders the cached form first and, on a host it
  // doesn't allow, replaces it with its refusal box (meant for the form's admin: hidden)
  box.setAttribute('hidden', '');
  const observer = new MutationObserver(() => {
    const form = Boolean(box.querySelector('form'));
    fallback.toggleAttribute('hidden', form);
    box.toggleAttribute('hidden', !form);
  });
  observer.observe(box, { childList: true, subtree: true });
  try {
    await loadEmbedScript(config.script);
  } catch (e) {
    observer.disconnect();
    box.remove();
  }
}

/** @param {Element} block */
export default function decorate(block) {
  const { settings, fallback } = splitEmbedBlock(block, 'newsletter-form');
  // the flag is read after the block shows its link: the page never waits for it
  embedWanted('newsletter-form').then((config) => {
    if (config) mountForm(block, fallback, settings, config);
  });
}
