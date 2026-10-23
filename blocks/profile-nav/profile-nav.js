/**
 * Profile sub-navigation (live: maui-sub-navigation above the profile pages): one cell with a
 * list of links; the link to the current page is the active tab. From 1024px a row of tabs,
 * below a dropdown showing the active tab.
 */
const normalize = (path) => path.replace(/\.html$/, '').replace(/\/$/, '');

let count = 0;

export default function decorate(block) {
  const links = [...block.querySelectorAll('a[href]')];
  const here = normalize(window.location.pathname);
  count += 1;
  const list = document.createElement('ul');
  list.id = `profile-nav-list-${count}`;
  let active;
  links.forEach((a) => {
    const li = document.createElement('li');
    const link = a.cloneNode(true);
    link.removeAttribute('title');
    if (!active && normalize(new URL(link.href, window.location).pathname) === here) {
      link.setAttribute('aria-current', 'page');
      active = link;
    }
    li.append(link);
    list.append(li);
  });

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'profile-nav-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', list.id);
  toggle.textContent = (active || links[0] || { textContent: '' }).textContent.trim();

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'secondary');
  nav.append(toggle, list);
  block.replaceChildren(nav);

  const close = () => toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', String(toggle.getAttribute('aria-expanded') !== 'true'));
  });
  nav.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      close();
      toggle.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) close();
  });
}
