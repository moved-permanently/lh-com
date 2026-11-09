/* eslint-disable */
/* global WebImporter */
import { viewerNodes } from './media-nodes.js';

/**
 * Parser for carousel-cards (Lufthansa ".carousel" / ".new-carousel" swiper of teasers).
 *
 * Output: one row per teaser, 3 columns:
 *   cell 1: image
 *   cell 2: optional eyebrow <p>, heading <h3>, optional description <p>, CTA link
 *   cell 3: width token, "wide" (source .wide-teaser) or "compact" (source .compact-teaser)
 *
 * Repeating unit: .wide-teaser / .compact-teaser (one per swiper slide; a slide can also hold
 * an empty compactteaser placeholder, so slides themselves are not used). The whole card is a
 * link on the source; the CTA label is a <maui-link-mimic href="#">, so the CTA is rebuilt from
 * the card link's href and the mimic's label.
 * Swiper's own prev/next aria-labels are library defaults, not authored text, so no label rows
 * are emitted (the block uses its locale defaults).
 *
 * Teaser cards of the source (a.teaser.card: ".threecolumn" / ".fourcolumn" column views,
 * ".carousel" swipers of them): 2 columns per row (image | heading linked to the card target,
 * description). The card's ".teaser-link-text" is display:none on live and is not imported (a card
 * marked data-import-cta, a brand whose www shows it: Austrian, keeps it as a link paragraph).
 * Heading level as in the source (h3-h6; h1/h2 card titles become h3). The column title is
 * emitted as default content before the table, with its size class (h2.heading-small, which
 * the cleanup marks as {heading-small}); a swiper copy below lg is skipped when the
 * desktop grid is present. Options: column views "grid" (cards in rows, stacked on mobile;
 * ".fourcolumn" adds "four-up", ".twocolumn" "two-up"); a ".swiper-multi-slide" carousel "four-up" (4 per view);
 * inside an insights article (.article-details-page) "article" (cards in the article column).
 *
 * Video viewers in a multi-slide swiper (".carousel" > .swiper-multi-slide > .videoViewer,
 * /articles/tags/munich 'Dive Deeper'): carousel "four-up", one row per video, one cell: poster
 * image + link to the .mp4 with "{controls round-play-button}" (the block shows the video card).
 *
 * Login cards (".loginform" .login-oneid-card: title, text, button): text-only rows in a
 * "grid" block; the intro paragraph is default content before it. maui-button-link primary =
 * bold link (yellow button); the booking code maui-button opens a dialog on live that the
 * replica does not have: italic link (outlined button) to "#booking-code".
 */
export default function parse(element, { document }) {
  const SR_ONLY = '.sr-only, .visually-hidden, maui-screen-reader-label';
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    if (!node) return '';
    const clone = node.cloneNode(true);
    clone.querySelectorAll(SR_ONLY).forEach((n) => n.remove());
    return clean(clone.textContent);
  };
  const isBroken = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src);
  const para = (text) => {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
  };

  // my-bookings login strip: bordered text cards with a button each
  const loginCards = [...element.querySelectorAll('.login-oneid-card')];
  if (loginCards.length) {
    const intro = [];
    const form = element.querySelector('.dcep-login-form') || element;
    form.querySelectorAll('.richtext').forEach((rt) => {
      if (rt.closest('.login-oneid-card, maui-modal')) return;
      rt.querySelectorAll(':scope > p').forEach((p) => {
        const t = visibleText(p);
        if (t) intro.push(para(t));
      });
    });
    const rows = [];
    loginCards.forEach((card) => {
      const content = [];
      const headline = card.querySelector('maui-headline, h1, h2, h3, h4, h5, h6');
      const title = visibleText(headline);
      if (title) {
        const type = (headline.getAttribute('type') || headline.tagName).toLowerCase();
        const h = document.createElement(/^h[3-6]$/.test(type) ? type : 'h3');
        h.textContent = title;
        content.push(h);
      }
      card.querySelectorAll('.richtext > p').forEach((p) => {
        const t = visibleText(p);
        if (t) content.push(para(t));
      });
      const BUTTONS = 'maui-button-link, maui-button, a[href]';
      [...card.querySelectorAll(BUTTONS)].filter((b) => !b.parentElement.closest(BUTTONS)).forEach((btn) => {
        const label = visibleText(btn) || clean(btn.getAttribute('label'));
        if (!label) return;
        const a = document.createElement('a');
        a.href = btn.getAttribute('href') || '#booking-code';
        a.textContent = label;
        const primary = btn.getAttribute('type') === 'primary';
        const wrap = document.createElement(primary ? 'strong' : 'em');
        wrap.append(a);
        const p = document.createElement('p');
        p.append(wrap);
        content.push(p);
      });
      if (content.length) rows.push(['', content]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-cards', variants: ['grid'], cells: rows });
    element.replaceWith(...intro, block);
    return;
  }

  // video viewers in a multi-slide swiper: video cards, four per view
  const viewers = [...element.querySelectorAll('.swiper-slide .videoViewer')]
    .filter((v) => !v.closest('.swiper-slide-duplicate'));
  if (viewers.length && !element.querySelector('a.teaser, .wide-teaser, .compact-teaser')) {
    const rows = viewers.map((v) => viewerNodes(v, document)).filter((n) => n.length).map((n) => [n]);
    if (rows.length) element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'carousel-cards', variants: ['four-up'], cells: rows }));
    return;
  }

  // Insights author slider (".authorslider": a swiper of author cards, four per view at 1440):
  // carousel "four-up" + "authors", image | author name (h3 linked to the author page), description
  const authors = [...element.querySelectorAll('a.author-slider-link')]
    .filter((a) => !a.closest('.swiper-slide-duplicate'));
  if (authors.length) {
    const rows = authors.map((card) => {
      const img = [...card.querySelectorAll('img')].find((i) => !isBroken(i.getAttribute('src')));
      let imageCell = '';
      if (img) {
        imageCell = document.createElement('img');
        imageCell.src = img.getAttribute('src');
        imageCell.alt = img.getAttribute('alt') || '';
      }
      const content = [];
      const name = visibleText(card.querySelector('.author-name'));
      if (name) {
        const h = document.createElement('h3');
        const a = document.createElement('a');
        a.href = card.getAttribute('href');
        a.textContent = name;
        h.append(a);
        content.push(h);
      }
      const description = visibleText(card.querySelector('.author-description'));
      if (description) content.push(para(description));
      return imageCell || content.length ? [imageCell, content.length ? content : ''] : null;
    }).filter(Boolean);
    if (rows.length) element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'carousel-cards', variants: ['four-up', 'authors'], cells: rows }));
    return;
  }

  // an author slider the snapshot caught before it rendered ("Loading...", /de/de/articles/
  // explore-flying): the empty block, which lists the authors of the author index
  if (element.matches('.authorslider') || element.querySelector(':scope > .dcep-author-slider')) {
    element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'carousel-cards', variants: ['four-up', 'authors'], cells: [] }));
    return;
  }

  // Teaser cards (a.teaser.card) in column views (desktop grid, swiper copy below lg) or in a
  // swiper. Homepage ".carousel" markup (.wide-teaser / .compact-teaser) is handled further down.
  if (!element.querySelector('.wide-teaser, .compact-teaser') && element.querySelector('.teaser a.teaser, a.teaser.card')) {
    const MOBILE = '.hidden-lg-up, .hidden-md-up, .d-md-none, .d-lg-none';
    const hasDesktopTwin = !!element.querySelector('.hidden-md-down a.teaser, .hidden-sm-down a.teaser');

    const isArticle = !!element.closest('.article-details-page, .article-content');
    // column title (".column-view > div:not(.row)") is default content before the block; a
    // swiper (".carousel") has none: its children are the slides (card titles stay in the cards)
    const view = element.querySelector(':scope > .column-view') || element.querySelector('.column-view') || element;
    const titles = [];
    [...(element.matches('.carousel') && view === element ? [] : view.children)]
      .filter((d) => !d.classList.contains('row') && !d.classList.contains('carousel'))
      .forEach((d) => d.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
        const t = visibleText(h);
        if (!t) return;
        const out = document.createElement(h.tagName.toLowerCase());
        out.textContent = t;
        // the size class (h2.heading-small) becomes the cleanup's heading marker when it is not
        // the level's default ("This may also be of interest to you": 28px light, not 36px)
        const size = [...h.classList].find((c) => /^heading-/.test(c));
        if (size) out.className = size;
        titles.push(out);
      }));

    const cards = [...element.querySelectorAll('a.teaser')]
      .filter((a) => !a.closest('.swiper-slide-duplicate') && !(hasDesktopTwin && a.closest(MOBILE)));
    const rows = [];
    cards.forEach((card) => {
      const img = [...card.querySelectorAll('img')].find((i) => !isBroken(i.getAttribute('src')));
      let imageCell = '';
      if (img) {
        const image = document.createElement('img');
        image.src = img.getAttribute('src');
        image.alt = img.getAttribute('alt') || '';
        imageCell = image;
      }
      const href = card.getAttribute('href');
      const content = [];
      const headingEl = card.querySelector('.teaser-heading, h1, h2, h3, h4, h5, h6');
      const heading = visibleText(headingEl);
      if (heading) {
        // the card is the link; .teaser-link-text is display:none on live (not imported)
        const level = headingEl && /^H[3-6]$/.test(headingEl.tagName) ? headingEl.tagName.toLowerCase() : 'h3';
        const h = document.createElement(level);
        if (href) {
          const a = document.createElement('a');
          a.href = href;
          a.textContent = heading;
          h.append(a);
        } else {
          h.textContent = heading;
        }
        content.push(h);
      }
      const description = visibleText(card.querySelector('.teaser-description'));
      if (description) content.push(para(description));
      // a brand whose www shows the card's link line (Austrian: the import marks its cards with
      // data-import-cta, austrian-import.mjs withTeaserCta): the line as a link after the description
      const cta = card.hasAttribute('data-import-cta') && visibleText(card.querySelector('.teaser-link-text'));
      if (cta && href) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = href;
        a.textContent = cta;
        p.append(a);
        content.push(p);
      }
      if (!imageCell && !content.length) return;
      rows.push([imageCell, content.length ? content : '']);
    });

    // articles: three cards in the article column; column views: cards in rows (".fourcolumn"
    // four per row); a multi-slide swiper: carousel with four cards per view
    let variants = [];
    if (isArticle) variants = ['article'];
    else if (element.querySelector('.swiper-multi-slide')) variants = ['four-up'];
    else if (element.matches('.fourcolumn')) variants = ['grid', 'four-up'];
    // (a three-column view marked data-import-two-up: a brand's converted two-column one, Austrian)
    else if (element.matches('.twocolumn, [data-import-two-up]')) variants = ['grid', 'two-up'];
    else if (!element.matches('.carousel')) variants = ['grid'];
    // www's three-card views hold the cards twice: a grid for lg (.hidden-md-down) and a swiper
    // below it (.hidden-lg-up); the swiper only on phones and tablets: option phone-slider
    // (/de/en/doctor-on-board-news, medical-travel-companions, miles-and-more)
    // (or a view marked data-import-phone-slider: its swiper copy the same as the grid, which the
    // cleanup's removeMobileDuplicates drops before this parser; Austrian marks it), or the grid
    // that drop flagged (data-lh-swiper-below-lg: an initialized swiper copy, lh-snapshots-085's
    // miles-and-more, brief after 488)
    const swiperDropped = element.matches('[data-lh-swiper-below-lg]') || !!element.querySelector('[data-lh-swiper-below-lg]');
    if (variants[0] === 'grid' && variants.length === 1 && ((hasDesktopTwin && element.querySelector('.hidden-lg-up a.teaser')) || swiperDropped || element.hasAttribute('data-import-phone-slider'))) variants.push('phone-slider');
    // a four-column view a brand importer marked (Brussels' inflight-services, the brief after 510):
    // phone-slider as well, four-up kept for its rows from 1025 px; unmarked ones stay grid four-up
    else if (variants.join(' ') === 'grid four-up' && element.hasAttribute('data-import-phone-slider')) variants.push('phone-slider');
    // its cards experience fragments (.experiencefragment > … > .aem-Grid > .teaser, miles-and-more's
    // "This might also interest you"): each of www's slides 30px taller than its teaser, the dots that
    // much lower (brief 506; the block's CSS per brand): option fragment-slides
    if (variants.includes('phone-slider') && element.querySelector('.experiencefragment .teaser, .cmp-experiencefragment .teaser')) variants.push('fragment-slides');
    const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-cards', variants, cells: rows });
    element.replaceWith(...titles, block);
    return;
  }

  const teasers = [...element.querySelectorAll('.wide-teaser, .compact-teaser')]
    .filter((t) => !t.closest('.swiper-slide-duplicate'));

  const cells = [];
  teasers.forEach((teaser) => {
    const wide = teaser.classList.contains('wide-teaser');

    // Image.
    const img = [...teaser.querySelectorAll('img')].find((i) => !isBroken(i.getAttribute('src')));
    let imageCell = '';
    if (img) {
      const image = document.createElement('img');
      image.src = img.getAttribute('src');
      image.alt = img.getAttribute('alt') || '';
      imageCell = image;
    }

    // Text.
    const content = [];
    const body = teaser.querySelector('.teaser-body') || teaser;
    const eyebrow = visibleText(body.querySelector('.teaser-title'));
    if (eyebrow) content.push(para(eyebrow));
    const headline = visibleText(body.querySelector('.teaser-headline, h2, h3, h4, h5'));
    if (headline) {
      const h = document.createElement('h3');
      h.textContent = headline;
      content.push(h);
    }
    const description = visibleText(body.querySelector('.teaser-description'));
    if (description) content.push(para(description));

    // CTA: card link href + link mimic label.
    const cardLink = teaser.querySelector('a.wide-teaser-link[href], a.compact-teaser-link[href], a[href]');
    const mimic = body.querySelector('.teaser-link maui-link-mimic, .teaser-link a, maui-link-mimic');
    const ctaLabel = visibleText(mimic);
    const href = (mimic && mimic.getAttribute('href') && mimic.getAttribute('href') !== '#')
      ? mimic.getAttribute('href')
      : cardLink && cardLink.getAttribute('href');
    if (href && href !== '#') {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = ctaLabel || headline || eyebrow;
      const p = document.createElement('p');
      p.append(a);
      content.push(p);
    }

    if (!imageCell && !content.length) return;
    cells.push([imageCell, content.length ? content : '', wide ? 'wide' : 'compact']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-cards', cells });
  element.replaceWith(block);
}
