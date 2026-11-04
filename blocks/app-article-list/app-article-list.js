/*
 * app-article-list: the app's list of a category's articles (tools/workers/lh-edge/SDUI.md) as
 * authors see it on an app screen document: one offer box per article of the Category from the
 * app screens' index (/content/mobile/lh/query-index.json: headline, description, teaser image),
 * newest Date first, then Order, as lh-edge sorts them; the Link text as each box's button; the
 * tracking label once, as a caption.
 */
import {
  el, keyValues, cellText, cellHref, offerBox, articlesOf, loadScreenIndex, trackingCaption,
} from '../../scripts/app-screen.js';

export default async function decorate(block) {
  const kv = keyValues(block);
  const category = cellHref(kv.category);
  const textLink = cellText(kv['link-text']);
  const label = cellText(kv.tracking);
  const list = el('div', 'app-article-list-items');
  block.replaceChildren(list);
  const caption = trackingCaption(label);
  if (caption) block.append(caption);
  let rows = [];
  try {
    rows = articlesOf(await loadScreenIndex(), category);
  } catch (e) {
    rows = [];
  }
  if (!rows.length) {
    list.append(el('p', 'app-article-list-empty', `No articles of ${category || 'this category'} in the app screens' index yet.`));
    return;
  }
  rows.forEach((r) => list.append(offerBox({
    title: r.headline || r.title,
    description: r.description,
    textLink,
    image: r.image,
    href: r.path,
  })));
}
