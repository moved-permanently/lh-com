# Your Project's Title...
Your project's description...

## Environments
- Preview: https://main--lh-com--moved-permanently.aem.page/
- Live: https://main--lh-com--moved-permanently.aem.live/

## Documentation

Before using the aem-boilerplate, we recommend you to go through the documentation on https://www.aem.live/docs/ and more specifically:
1. [Developer Tutorial](https://www.aem.live/developer/tutorial)
2. [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
3. [Web Performance](https://www.aem.live/developer/keeping-it-100)
4. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)

## Authoring conventions (default content)

### Heading styles

Lufthansa sizes headings by class, not by level: an `h3` can be 48px bold (`heading-large`), an
`h2` 28px light (`heading-small`). The level is kept as it is (it is the document outline), and
each level has a default size:

| Level | Default | Size at 1440px |
| --- | --- | --- |
| Heading 1 | `heading-large` | 48px bold |
| Heading 2 | `heading-medium` | 36px light |
| Heading 3, 4 | `heading-copytext-large` | 24px bold |
| Heading 5, 6 | `heading-copytext-medium` | 18px bold |

Any other size is a marker at the end of the heading text, in curly braces:
`Ticket refunds {heading-medium}`. Possible values: `heading-large` (48px bold), `heading-medium`
(36px light), `heading-small` (28px light), `heading-copytext-large` (24px bold),
`heading-copytext-medium` (18px bold), `copytext-large` (body text, 18px regular).
`scripts/scripts.js` removes the marker from the text (and from the heading id) and sets the
class; the styles are in `styles/styles.css`. The importer (`lufthansa-cleanup.js`) writes the
marker only where the live class differs from the level's default.

Why a text marker: Document Authoring keeps no classes on headings, and a section style or a
block would change the whole section or the structure for one heading. The marker is visible
and editable in the document, sits on the heading it applies to, survives copy and paste, and
an author can delete it to get the default size again.

### Small text

The same marker at the end of a paragraph sets its text size: `{copytext-small}` (14px, 13px
on AirCore pages: footnotes, disclaimers, small link lists), `{copytext-medium}` (16px),
`{copytext-large}` (18px, the default size, but with regular instead of bold links). A link
alone in such a paragraph stays a small text link with an arrow instead of a large
navigation link.

### Buttons and links

- Bold link alone in a paragraph: primary (yellow) button. Italic link alone in a paragraph:
  secondary (outlined) button. Bold and italic: dark filled button.
- Plain link alone in a paragraph: navigation link with a large arrow.
- Links in running text get a small arrow before the text (→ on lufthansa.com, ↗ to other
  sites, ↓ to a place on the same page), as on the live site; not on AirCore pages.

### Theme `digital-assistant`

Pages that show the Lufthansa digital assistant on the live site load its stylesheet, which maps
LufthansaHead regular to the bold font file: there every light heading (300) draws bold. The
importer records this as page metadata `Theme: digital-assistant` (`body.digital-assistant`,
styles.css / fonts.css); remove the row to get the light headings.

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Local development

1. Create a new repository based on the `aem-boilerplate` template
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the `lh-com` directory in your favorite IDE and start coding :)
