/*
 * Newsroom: Lufthansa Cargo's Mynewsdesk newsroom, behind the site flag newsroom
 * (scripts/embeds.js, brief 422). Rows: Newsroom | the newsroom's address (www's
 * hosted_newsroom.js host of the page: the English newsroom lufthansa-cargo-ag-com, the German
 * lufthansa-cargo-ag), then the page's link to the newsroom: all the page shows with the flag off.
 * Flag on, a host of the brand's (scripts/brands.js embeds.newsroom.hosts) and the visitor's
 * consent to third-party content (the brand's group, C0005: www waits for its consent manager): as
 * www, a #mnd-script element and the newsroom's own hosted_newsroom.js with the page's nonce; the
 * script writes the newsroom's iframe after #mnd-script, sizes it and follows its pages in the
 * address's hash. The link goes while the iframe is there; a withdrawn consent takes it away.
 */
import { embedWanted, loadEmbedScript, splitEmbedBlock } from '../../scripts/embeds.js';
import { getStoredConsent } from '../../scripts/consent.js';

/** The newsroom's host from the authored address when it is one of the brand's, else ''. */
function newsroomHost(text, hosts) {
  try {
    const url = new URL(text);
    return url.protocol === 'https:' && hosts.includes(url.hostname) ? url.hostname : '';
  } catch (e) {
    return '';
  }
}

/** Calls back whether the visitor's choice has the group: the stored one, then each new one. */
function watchConsent(group, callback) {
  const stored = getStoredConsent();
  callback(Boolean(stored && stored.groups.includes(group)));
  window.addEventListener('consent.update', (e) => {
    callback(Boolean(e.detail && (e.detail.groups || []).includes(group)));
  });
}

function mountNewsroom(block, fallback, host, config) {
  let mounted = null;
  const unmount = () => {
    if (!mounted) return;
    mounted.observer.disconnect();
    block.querySelectorAll('#mnd-script, #mnd-iframe').forEach((el) => el.remove());
    fallback.removeAttribute('hidden');
    mounted = null;
  };
  const mount = () => {
    if (mounted || document.getElementById('mnd-script')) return;
    const holder = document.createElement('div');
    holder.id = 'mnd-script';
    block.prepend(holder);
    // the link while there is no newsroom: Mynewsdesk's script puts its iframe after #mnd-script
    const observer = new MutationObserver(() => {
      fallback.toggleAttribute('hidden', Boolean(block.querySelector('#mnd-iframe')));
    });
    observer.observe(block, { childList: true });
    mounted = { observer };
    loadEmbedScript(`https://${host}${config.script}`, { parent: holder }).catch(unmount);
  };
  watchConsent(config.consent, (given) => (given ? mount() : unmount()));
}

/** @param {Element} block */
export default function decorate(block) {
  const { settings, fallback } = splitEmbedBlock(block, 'newsroom');
  // the flag is read after the block shows its link: the page never waits for it
  embedWanted('newsroom').then((config) => {
    const host = config && newsroomHost(settings.newsroom, config.hosts || []);
    if (host) mountNewsroom(block, fallback, host, config);
  });
}
