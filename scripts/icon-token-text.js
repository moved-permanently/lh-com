/**
 * The importer keeps a ":word:" that is no icon of ours as text (tools/importer/icon-tokens.mjs: a
 * WORD JOINER before its closing colon, which Edge Delivery's icon step does not read; www's
 * "Mitarbeiter:innen:" labels, Discover's "Naturliebhaber:innen:"): the joiner goes again in the
 * browser, so the page's text reads as www's (and an app configuration's "dmc:https://" as written).
 * @param {Element} root
 */
// eslint-disable-next-line import/prefer-default-export
export function restoreIconTokenText(root) {
  if (!root || !root.textContent.includes('\u2060')) return;
  // 4: NodeFilter.SHOW_TEXT
  const walker = root.ownerDocument.createTreeWalker(root, 4);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeValue.includes('\u2060')) {
      node.nodeValue = node.nodeValue.replace(/:(#?[a-z_-]+[a-z\d]*)\u2060(?=:)/gi, ':$1');
    }
  }
}
