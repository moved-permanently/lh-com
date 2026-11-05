import { embedFor } from '../../scripts/media.js';

/*
 * video-banner: www.flytap.com's YouTube banner (Economy Prime, For Life; parity.md R4-9):
 * www's poster in a 380 px frame with 32 px corners, the title over it and a play button (www's
 * text, its play icon); YouTube loads only on play: the player (youtube-nocookie.com, autoplay)
 * takes the frame, the poster and the text make way and the player takes the focus. Without a
 * poster the frame is dark. Content: one row, the poster's cell (optional) and the text's: the
 * title (H3) and the link to the video (its text the button's). README.md.
 */

const node = (tag, className, ...kids) => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  n.append(...kids.filter(Boolean));
  return n;
};

/**
 * @param {Element} block
 */
export default function decorate(block) {
  const link = [...block.querySelectorAll('a[href]')].find((a) => {
    const e = embedFor(a.href);
    return e && e.type === 'youtube';
  });
  if (!link) return;
  const embed = embedFor(link.href);
  const picture = block.querySelector('picture') || block.querySelector('img');
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  const label = link.textContent.trim();
  const title = heading ? heading.textContent.trim() : label;

  const play = node('button', 'video-banner-play', node('span', 'video-banner-play-label', label), node('span', 'video-banner-play-icon'));
  play.type = 'button';
  play.querySelector('.video-banner-play-icon').setAttribute('aria-hidden', 'true');
  const content = node('div', 'video-banner-content', heading, play);
  const posterBox = picture ? node('div', 'video-banner-poster', picture) : null;
  const frame = node('div', 'video-banner-frame', posterBox, content);
  block.classList.toggle('video-banner-no-poster', !picture);

  play.addEventListener('click', () => {
    const src = new URL(embed.src);
    src.searchParams.set('autoplay', '1');
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', src.toString());
    iframe.setAttribute('title', title);
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.className = 'video-banner-player';
    if (posterBox) posterBox.remove();
    content.remove();
    frame.append(iframe);
    block.classList.add('video-banner-playing');
    if (typeof iframe.focus === 'function') iframe.focus();
  }, { once: true });

  block.replaceChildren(frame);
}
