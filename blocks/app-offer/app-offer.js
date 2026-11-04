/*
 * app-offer: the app's offer box (tools/workers/lh-edge/SDUI.md: offerBox_v2 / offerBox) as authors
 * see it on an app screen document: the picture (the DAM URL), title, description and the link
 * text as its button to the link; the tracking label as a caption. The app's JSON comes from the
 * document itself (lh-edge), not from this rendering.
 */
import {
  keyValues, cellText, cellHref, cellImage, offerBox,
} from '../../scripts/app-screen.js';

export default function decorate(block) {
  const kv = keyValues(block);
  block.replaceChildren(offerBox({
    title: cellText(kv.title),
    description: cellText(kv.description),
    textLink: cellText(kv['link-text']),
    image: cellImage(kv.image),
    href: cellHref(kv.link),
    label: cellText(kv.tracking),
  }));
}
