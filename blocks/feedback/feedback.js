import { cleanText } from '../../scripts/block-config.js';

/**
 * Answer options of the authored block: list items, else paragraphs, else the comma-separated
 * text of the answers cell.
 * @param {Element} cell
 * @returns {string[]}
 */
function readOptions(cell) {
  if (!cell) return [];
  const items = [...cell.querySelectorAll('li, p')].map(cleanText).filter(Boolean);
  if (items.length) return items;
  return cleanText(cell).split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * "Was this information helpful? Yes No" (live: the feedback-eye questionnaire, a maui-label
 * over a maui-segmented-control). Row 1: the question; row 2: the answers. Render-only: the
 * choice is shown as selected, nothing is sent.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const cells = rows.flatMap((row) => [...row.children]);
  const question = cells[0] ? cleanText(cells[0]) : '';
  const options = readOptions(cells[1]);
  if (!question || !options.length) {
    block.remove();
    return;
  }
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'feedback-question';
  const legend = document.createElement('legend');
  legend.className = 'feedback-label';
  legend.textContent = question;
  const control = document.createElement('div');
  control.className = 'feedback-options';
  const name = `feedback-${Math.random().toString(36).slice(2, 8)}`;
  options.forEach((label) => {
    const option = document.createElement('label');
    option.className = 'feedback-option';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = name;
    input.value = label;
    option.append(input, document.createTextNode(label));
    control.append(option);
  });
  fieldset.append(legend, control);
  block.replaceChildren(fieldset);
}
