/**
 * A paragraph whose whole text is bold (<p><strong>Why request it in advance?</strong></p>,
 * with no plain text beside the bold) gets p.bold-lead. CSS cannot tell such a lead-in from a
 * bold label in front of plain text ("<strong>E-mail:</strong> address"), because selectors
 * do not see text nodes.
 * Air Dolomiti's accordion text pages run a lead-in straight into its answer
 * (styles/themes/airdolomiti.css).
 * No other brand reads the class. Paragraphs of sections only, as content: main > div > p.
 */

/** True when the node holds text that is not inside <strong> or <b>. */
function hasPlainText(node) {
  return [...node.childNodes].some((c) => {
    if (c.nodeType === 3) return c.nodeValue.trim() !== '';
    if (c.nodeType !== 1) return false;
    return !/^(STRONG|B)$/i.test(c.nodeName) && hasPlainText(c);
  });
}

/**
 * Marks bold-only paragraphs (p.bold-lead).
 * @param {Element} main
 */
export default function markBoldLeads(main) {
  main.querySelectorAll(':scope > div > p').forEach((p) => {
    if (!p.textContent.trim() || !p.querySelector('strong, b') || hasPlainText(p)) return;
    p.classList.add('bold-lead');
  });
}
