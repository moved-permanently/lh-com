/* eslint-disable */
/* global WebImporter */

/**
 * Insights pages without www's AEM sections (the template's own transformer, page-templates.json
 * insights "transformers"; brief 488): www's highlights and tags pages (/articles/highlights/
 * all-it-takes-is-a-yes, /articles/tags/munich) put their components straight into
 * .container-content. There a component has no margin above (a headline none), a text paragraph
 * 2.4rem below, an image 4rem below, and a column view .column-view's 2rem / 1rem (4rem / 2rem
 * from 768px) plus its items' 1rem / 2rem: not our section and wrapper gaps. Such a page gets
 * "Theme: insights-flow" (the cleanup's page-metadata theme attribute); styles.css spaces it.
 * Not www's articles (.article-details-page) nor an author page.
 */
const THEME_ATTR = 'data-lh-import-theme';
const THEME = 'insights-flow';

export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;
  const document = (payload && payload.document) || element.ownerDocument || element;
  if (document.querySelector('.article-details-page, .author-details-page')) return;
  const content = document.querySelector('.container-content');
  if (!content || content.querySelector(':scope > .section') || !content.querySelector(':scope > .text, :scope > .headline')) return;
  const root = document.documentElement;
  const themes = (root.getAttribute(THEME_ATTR) || '').split(',').map((t) => t.trim()).filter(Boolean);
  if (!themes.includes(THEME)) themes.push(THEME);
  root.setAttribute(THEME_ATTR, themes.join(', '));
}
