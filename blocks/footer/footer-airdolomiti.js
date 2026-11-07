/**
 * Air Dolomiti's footer columns in www's phone order (brief 448, parity A8): below 930px www's
 * phone footer (FooterMobile) lists the company links, Contacts, Passenger Assistance, Routes,
 * Travel tips and Legal info; its desktop footer (and the footer documents) Contacts, Travel tips,
 * Routes, Passenger Assistance, Legal info. The columns move in the DOM, not by CSS order, so the
 * Tab order is the order on screen; from 930px they are back in the documents' order, which the
 * desktop grid places by position (styles/themes/airdolomiti.css).
 */

// the documents' columns (company, Contacts, Travel tips, Routes, Passenger Assistance, Legal
// info) in www's phone order
export const PHONE_ORDER = [0, 1, 4, 3, 2, 5];

/**
 * @param {Element} block the footer block
 * @param {MediaQueryList} [phone] below 930px
 */
export default function orderFooterColumns(block, phone = window.matchMedia('(width < 930px)')) {
  const wrap = block.querySelector('.footer-columns');
  const columns = wrap ? [...wrap.children].filter((c) => c.classList.contains('footer-column')) : [];
  if (columns.length !== PHONE_ORDER.length) return;
  const apply = () => {
    const order = phone.matches ? PHONE_ORDER : PHONE_ORDER.map((_, i) => i);
    order.forEach((i) => wrap.append(columns[i]));
  };
  apply();
  phone.addEventListener('change', apply);
}
