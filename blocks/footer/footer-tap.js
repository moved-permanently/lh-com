/*
 * The footer on brand tap (TAP Air Portugal), as www.flytap.com's (/en-pt, 2026-11-04): two
 * rounded cards side by side, the link columns in the first (three quarters), a side card with
 * the logo, "Follow us" and its icons, "TAP App" and its store badges; under them a rounded
 * copyright bar with the note and, when the footer document has it, Star Alliance's logo at the
 * right. Built from the decorated footer (footer.js): its columns, badges, note and logo row.
 * The look: styles/themes/tap.css.
 */

/** the social icons www draws as outline glyphs (24 px, #424045) */
export const TAP_SOCIAL_ICONS = ['facebook', 'instagram', 'linkedin', 'youtube', 'tiktok'];

const div = (className, ...children) => {
  const e = document.createElement('div');
  e.className = className;
  e.append(...children.filter(Boolean));
  return e;
};

/**
 * @param {Element} block the decorated footer block
 */
export default function layoutTapFooter(block) {
  const inner = block.querySelector('.footer-inner');
  if (!inner) return;
  const columns = inner.querySelector(':scope > .footer-columns');
  const badges = inner.querySelector(':scope > .footer-badges');
  const note = inner.querySelector(':scope > .footer-note');
  const logos = block.querySelector(':scope > .footer-logos');
  const logoLinks = logos ? [...logos.querySelectorAll('li > a')] : [];
  const star = logoLinks.find((a) => a.classList.contains('footer-logo-star-alliance'));
  const home = logoLinks.find((a) => a !== star);

  // www's outline social glyphs (icons/tap-*.svg) for lh-com's round ones
  if (badges) {
    badges.querySelectorAll('img[data-icon-name]').forEach((img) => {
      const name = img.dataset.iconName;
      if (!TAP_SOCIAL_ICONS.includes(name)) return;
      img.src = `${window.hlx?.codeBasePath || ''}/icons/tap-${name}.svg`;
      img.classList.add('footer-tap-icon');
    });
  }
  const side = div('footer-tap-side', home ? div('footer-tap-logo', home) : null, badges);
  const bar = div('footer-tap-bar', note, star ? div('footer-tap-partner', star) : null);
  inner.querySelectorAll(':scope > .footer-divider').forEach((hr) => hr.remove());
  inner.classList.add('footer-tap');
  inner.replaceChildren(div('footer-tap-links', columns), side, bar);
  if (logos) logos.remove();
}
