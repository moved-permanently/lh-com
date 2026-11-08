/* eslint-disable */
/* global WebImporter */

/**
 * Hub pages from server HTML (brief 506 item 5): the market-diff run's www HTML is the server's,
 * no script run, so www's JavaScript components have only their configuration there. A Hero
 * Banner (.dcep-hero-banner, /speisen-und-getraenke, /lufthansa-reiseklassen) carries all its
 * panes in its data-dcep JSON; www's script renders them as .hero-container > .hero-item. Without
 * them the cleanup drops the empty component (beforeTransform) before the hero-banner parser sees
 * it. onLoad builds the panes from the JSON in www's rendered markup, so the cleanup and the parser
 * read it as from a browser capture: overlaySubHeadline the tab label, overlayTitle the headline,
 * overlayDescription the text, overlayButtonText / overlayButtonLinkTarget the button (secondary,
 * as every rendered one), movingImage the picture (and the renditions' srcset www's script writes),
 * transparentOverlay the overlay. A capture with rendered panes is left alone. First of the hub
 * template's transformers: campaign-sections' onLoad converts the separators of the AEM sections
 * that aren't empty (the hero's is until its panes are there).
 */
const RENDITIONS = [2560, 1440, 720, 360];

function buildPanes(document, host) {
  let props = {};
  try { props = JSON.parse(host.getAttribute('data-dcep') || '{}') || {}; } catch (e) { return; }
  const panes = Array.isArray(props.panes) ? props.panes : [];
  if (!panes.length) return;
  const clean = (s) => (typeof s === 'string' ? s.replace(/\s+/g, ' ').trim() : '');
  const overlay = clean(props.transparentOverlay);
  const container = document.createElement('div');
  container.className = 'hero-container';
  panes.forEach((pane) => {
    const item = document.createElement('div');
    item.className = 'hero-item';
    const label = clean(pane.overlaySubHeadline);
    if (label) {
      const h2 = document.createElement('h2');
      h2.className = 'hero-subheading';
      const button = document.createElement('button');
      button.className = 'hero-accordion-header-button';
      button.textContent = label;
      h2.append(button);
      item.append(h2);
    }
    const media = pane.movingImage || {};
    if (clean(media.imageUrl)) {
      const wrap = document.createElement('div');
      wrap.className = 'moving-image';
      const box = document.createElement('div');
      box.className = 'w-100 h-100 object-cover';
      const figure = document.createElement('figure');
      const img = document.createElement('img');
      img.setAttribute('src', clean(media.imageUrl));
      // the renditions www's script writes (the import takes the largest)
      const ext = (clean(media.imageUrl).match(/\.([a-z0-9]+)$/i) || [null, 'jpg'])[1].toLowerCase();
      img.setAttribute('srcset', RENDITIONS.map((w) => `${clean(media.imageUrl)}.transform/lh-dcep-transform-width-${w}/img.${ext} ${w}w`).join(','));
      img.setAttribute('alt', clean(media.alt));
      figure.append(img);
      box.append(figure);
      wrap.append(box);
      item.append(wrap);
    }
    if (/^#[0-9a-f]{3,8}$/i.test(overlay)) {
      const ov = document.createElement('div');
      ov.className = 'transparent-overlay';
      ov.setAttribute('style', `--transparent-overlay-color: ${overlay}`);
      item.append(ov);
    }
    const contents = document.createElement('div');
    contents.className = 'hero-items-contents';
    if (clean(pane.overlayTitle)) {
      const h3 = document.createElement('h3');
      h3.className = 'hero-header';
      h3.textContent = clean(pane.overlayTitle);
      contents.append(h3);
    }
    // the paragraph is there when empty too (as www renders it)
    const p = document.createElement('p');
    p.className = 'hero-paragraph';
    p.textContent = clean(pane.overlayDescription);
    contents.append(p);
    if (clean(pane.overlayButtonText) && clean(pane.overlayButtonLinkTarget)) {
      const btn = document.createElement('maui-button-link');
      btn.className = 'hero-button';
      btn.setAttribute('href', clean(pane.overlayButtonLinkTarget));
      btn.setAttribute('label', clean(pane.overlayButtonText));
      btn.setAttribute('type', 'secondary');
      btn.textContent = clean(pane.overlayButtonText);
      contents.append(btn);
    }
    // www's order: the label, the contents, then the picture and the overlay
    const label2 = item.querySelector('.hero-subheading');
    if (label2) label2.after(contents); else item.prepend(contents);
    container.append(item);
  });
  // www's wrappers: .px-0.full-width-bg > the (empty) intro animation, .hero-banner > .hero-container
  const outer = document.createElement('div');
  outer.className = 'px-0 full-width-bg';
  const intro = document.createElement('div');
  intro.className = 'hero-banner-intro-animation';
  const h1 = document.createElement('h1');
  h1.className = 'animated-text';
  intro.append(h1);
  const banner = document.createElement('div');
  banner.className = 'hero-banner';
  banner.append(container);
  outer.append(intro, banner);
  host.append(outer);
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'onLoad') return;
  const document = (payload && payload.document) || element.ownerDocument || element;
  document.querySelectorAll('.dcep-hero-banner[data-dcep]').forEach((host) => {
    if (!host.querySelector('.hero-item')) buildPanes(document, host);
  });
}
