# weather

Custom **weather** block. Purpose: live current weather and multi-day forecast for a destination; the whole widget is hidden when no weather data loads.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, label | value. Rows: Title | Current weather in New York (rendered immediately as the heading); Location | NYC (IATA city or airport code, also 'New York (NYC)'; without a code the block stays hidden); Units | C or F (default C; values are converted when the service answers in the other unit). Optional label rows with built-in English/German defaults chosen by the page language: Today label (Today / Heute), Forecast label (Forecast / Vorhersage), Humidity label (Humidity / Luftfeuchtigkeit), Wind label (Wind / Wind), Min label (Min / Min.), Max label (Max / Max.). Weather comes at runtime from GET /aircore/weather/{code}?lang={lang} via lhFetch (lh-proxy or recorded data); if neither answers the whole block is hidden, like the source. Day names and dates are formatted with Intl for the page locale. Unknown rows are ignored..

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
