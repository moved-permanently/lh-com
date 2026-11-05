/**
 * Skip links as www's on the Group airlines' sites (brief 370): first in the body, out of sight
 * until one has the focus (styles/styles.css .skip-link), to the navigation, the main content and
 * the footer. www's wording per brand and language from its pages (the 404 captures of brief 342,
 * 2026-11-01): [navigation, main content, footer]; www's fourth, "Go to search", is left out (the
 * replicas have no search field there). Brands without an entry get none: Cargo's www has none,
 * TAP's header draws its own (blocks/header/header-tap.js), Lufthansa, B2B and Air Dolomiti not
 * looked at. A language www has none for: English.
 */
export const SKIP_LINK_TEXTS = {
  austrian: {
    en: ['Go to navigation', 'Go to main content', 'Go to end of page'],
    de: ['Zur Navigation', 'Zum Seiteninhalt', 'Zum Seitenende'],
    el: ['Μετάβαση στην πλοήγηση', 'Μετάβαση στο βασικό περιεχόμενο', 'Μετάβαση στο τέλος της σελίδας'],
    es: ['Ir a la navegación', 'Ir al contenido principal', 'Ir al final de la página'],
    fr: ['Aller à la navigation', 'Aller au contenu principal', 'Aller à la fin de la page'],
    it: ['Andare alla pagina di navigazione', 'Andare al contenuto principale', 'Andare alla fine della pagina'],
    ja: ['ナビゲーションヘ', 'メインの内容へ', '最終ページへ'],
    pl: ['Przejdź do nawigacji', 'Przejdź do głównej treści', 'Przejdź do końca strony'],
    ru: ['Перейти к навигации', 'Перейти к основному содержанию', 'Перейти к концу страницы'],
    zh: ['转至导航', '转至主要内容', '转至页面末尾'],
  },
  brussels: {
    en: ['Go to navigation', 'Go to main content', 'Go to footer'],
    de: ['Zur Navigation', 'Zum Seiteninhalt', 'Zum Footer'],
    es: ['Ir a la navegación', 'Ir al contenido principal', 'Ir al pie de página'],
    fr: ['Allez à la navigation', 'Allez au menu principal', 'Allez au bas de page'],
    it: ['Vai alla navigazione', 'Vai al contenuto principale', 'Vai al piè di pagina'],
    nl: ['Naar navigatie', 'Naar hoofdcontent', 'Naar footer'],
  },
  discover: {
    en: ['Go to navigation', 'Go to main content', 'Go to footer'],
    de: ['Zur Navigation', 'Zum Seiteninhalt', 'Zum Footer'],
    fr: ['Allez à la navigation', 'Allez au menu principal', 'Allez au bas de page'],
  },
  ita: {
    en: ['Go to navigation', 'Go to main content', 'Go to footer'],
    de: ['Zur Navigation', 'Zum Seiteninhalt', 'Zum Footer'],
    el: ['Μετάβαση στην πλοήγηση', 'Μετάβαση στο κύριο περιεχόμενο', 'Μετάβαση στο υποσέλιδο'],
    es: ['Ir a la navegación', 'Ir al contenido principal', 'Ir al pie de página'],
    fr: ['Allez à la navigation', 'Allez au menu principal', 'Allez au bas de page'],
    it: ['Vai alla navigazione', 'Vai al contenuto principale', 'Vai al piè di pagina'],
    ja: ['メニューへ移動', '主要ページへ移動', 'ページ下へ移動'],
    nl: ['Ga naar navigatie', 'Ga naar de inhoud', 'Ga naar de voettekst'],
    pt: ['Ir para navegação', 'Ir para o conteúdo principal', 'Ir para rodapé'],
  },
  swiss: {
    en: ['Go to navigation', 'Go to main content', 'Go to footer'],
    de: ['Zur Navigation', 'Zum Seiteninhalt', 'Zum Footer'],
    el: ['Μετάβαση στην πλοήγηση', 'Μετάβαση στο κύριο περιεχόμενο', 'Μετάβαση στο υποσέλιδο'],
    es: ['Ir a la navegación', 'Ir al contenido principal', 'Ir al pie de página'],
    fr: ['Allez à la navigation', 'Allez au menu principal', 'Allez au bas de page'],
    it: ['Vai alla navigazione', 'Vai al contenuto principale', 'Vai al piè di pagina'],
    ja: ['メニューへ移動', '主要ページへ移動', 'ページ下へ移動'],
    // kr/ko: www's Korean root has them in English
    ko: ['Go to navigation', 'Go to main content', 'Go to footer'],
    pt: ['Ir para navegação', 'Ir para o conteúdo principal', 'Ir para rodapé'],
    ru: ['К навигации', 'К основному содержанию', 'К нижнему колонтитулу'],
    zh: ['转到导航', '转到主要内容', '转到页脚'],
  },
};

/** The element's id, or `name` (`name-skip` when another element holds it) given to it. */
function targetId(doc, element, name) {
  if (element.id) return element.id;
  element.id = doc.getElementById(name) ? `${name}-skip` : name;
  return element.id;
}

/**
 * Adds the brand's skip links first in the body, once per page.
 * @param {Document} doc
 * @param {string} brand the page's brand metadata (swiss, austrian …)
 * @param {string} lang the page's language tag (de, fr-BE …)
 * @returns {Element|null} the links' box, or null (no texts for the brand, no main, added before)
 */
export function addSkipLinks(doc, brand, lang) {
  const texts = SKIP_LINK_TEXTS[String(brand || '').trim().toLowerCase()];
  const main = doc.querySelector('main');
  if (!texts || !main || doc.querySelector('.skip-links')) return null;
  const [nav, content, end] = texts[String(lang || '').split('-')[0].toLowerCase()] || texts.en;
  const footer = doc.querySelector('body > footer');
  const box = doc.createElement('div');
  box.className = 'skip-links';
  [[nav, 'nav'], [content, targetId(doc, main, 'main')], [end, footer && targetId(doc, footer, 'footer')]]
    .forEach(([text, id]) => {
      if (!id) return;
      const a = doc.createElement('a');
      a.className = 'skip-link';
      a.href = `#${id}`;
      a.textContent = text;
      // the target takes the focus: tabindex -1 for it, gone when the focus moves on (kept, a click
      // on main's text would focus main and close what is open there); no ring (styles.css)
      a.addEventListener('click', () => {
        const target = doc.getElementById(id);
        if (!target || target.hasAttribute('tabindex')) return;
        target.setAttribute('tabindex', '-1');
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      });
      box.append(a);
    });
  doc.body.prepend(box);
  return box;
}
