/**
 * ask-ai-flights: www.austrian.com's AI flight-finder entry under the flight search
 * (smart-flight-finder-fe, #sff-root; new on 15 homepages on 2026-11-15, austrian-parity-022 to
 * -026): a grey band with www's line ("Flexible dates? Chat with our AI to find your perfect
 * flight options") and its ASK AI FOR FLIGHTS button. On www the button opens the AI agent in a
 * modal from www's own script; here it links to the airline's page that has it (the document's
 * link). Behind the site flag ask-ai-flights (scripts/flags.js, standing order 42): no row, any
 * value but "on" or no answer, and the block takes itself out with its wrapper, so the page is
 * the one it was without it. Content: one cell (or two) with the line and a link, any order.
 */
import { isFlagOn } from '../../scripts/flags.js';

export const ASK_AI_FLAG = 'ask-ai-flights';

/** The block's link (the button) and its line (the block's text without the link's paragraph). */
export function readAskAi(block) {
  const link = block.querySelector('a[href]');
  const rest = block.cloneNode(true);
  const own = rest.querySelector('a[href]');
  if (own) (own.closest('p, li') || own).remove();
  const text = [...rest.querySelectorAll(':scope > div > div')].map((cell) => cell.textContent)
    .join(' ').replace(/\s+/g, ' ').trim();
  return { text, link };
}

export default async function decorate(block) {
  const wrapper = block.parentElement && block.parentElement.classList.contains('ask-ai-flights-wrapper')
    ? block.parentElement : block;
  const { text, link } = readAskAi(block);
  if (!link || !(await isFlagOn(ASK_AI_FLAG))) {
    wrapper.remove();
    return;
  }
  const copy = document.createElement('p');
  copy.className = 'ask-ai-flights-text';
  copy.textContent = text;
  const button = document.createElement('a');
  button.className = 'button secondary ask-ai-flights-button';
  button.href = link.getAttribute('href');
  if (link.title) button.title = link.title;
  const label = document.createElement('span');
  label.textContent = link.textContent.trim();
  button.append(label);
  block.replaceChildren(copy, button);
  block.classList.add('ask-ai-flights-on');
}
