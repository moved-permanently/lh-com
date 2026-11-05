# feedback

Custom block. Purpose: the "Was this information helpful? Yes / No" question of the live pages (the feedback-eye questionnaire web component, e.g. on /de/de/fluege).

## Authoring (Document Authoring)

Model: `standalone`

Two rows (or two cells in one row). Row 1: the question. Row 2: the answers, as paragraphs, list items or comma-separated text. An optional row 3: a note shown between the question and the answers (www.swiss.com's contact page: "Please note that your feedback will not be answered, but it will help to improve our service."). Without a question or answers the block is removed.

Imported by `tools/importer/transformers/lufthansa-cleanup.js` (convertFeedbackQuestionnaire) from the rendered questionnaire (maui-label + maui-segmented-control-item); questionnaires that rendered nothing are dropped.

## Behaviour

The question as a label over the answers as one segmented control; choosing an answer marks it. Render-only: nothing is sent (the live widget posts to the Travel ID feedback API and then shows a second page that is not captured).

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
