/*
 * The menu's Tab order with a panel open (header.js buildFlyout), as www's: the open panel's links
 * right after its tab, then the next tab and the menu's tools (in the DOM the panels follow the
 * whole main column). Shift+Tab goes back the same way; the order wraps (the menu is modal).
 */

/**
 * The focus order of the menu.
 * @param {Element[]} nodes the menu's focusable elements in DOM order (shown ones only)
 * @param {Element|null} tab the open panel's tab
 * @param {Element|null} panel the open panel
 * @returns {Element[]} the panel's elements moved right after its tab; DOM order without an open
 *   panel or while its tab is not shown (phones: the panel replaces the list)
 */
export function panelTabOrder(nodes, tab, panel) {
  if (!tab || !panel) return nodes;
  const inPanel = nodes.filter((n) => panel.contains(n));
  const rest = nodes.filter((n) => !panel.contains(n));
  const at = rest.indexOf(tab);
  if (at < 0) return nodes;
  rest.splice(at + 1, 0, ...inPanel);
  return rest;
}

/**
 * The element Tab (or Shift+Tab) moves to.
 * @param {Element[]} order panelTabOrder's
 * @param {Element} current the focused element
 * @param {boolean} back Shift+Tab
 * @returns {Element|null} null for an empty order
 */
export function nextInOrder(order, current, back) {
  if (!order.length) return null;
  const at = order.indexOf(current);
  if (at < 0) return back ? order[order.length - 1] : order[0];
  return order[(at + (back ? -1 : 1) + order.length) % order.length];
}
