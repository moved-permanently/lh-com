# weather

Custom **weather** block. Purpose: live current weather and multi-day forecast for a destination; the whole widget is hidden when no weather data loads.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, label | value. Rows: Title | Current weather in New York (rendered immediately as the heading); Location | NYC (IATA city or airport code, also 'New York (NYC)'; without a code the block stays hidden); Units | C or F (default C; the live answer carries both). Optional label rows with built-in English/German defaults chosen by the page language: Today label (Today / Heute), Forecast label (Forecast / Vorhersage), Humidity label, Wind label (default: the words of the live answer), Min label (Min / Min.), Max label (Max / Max.). Weather comes at runtime from GET /aircore/weather/{lang}/{code} (e.g. /aircore/weather/de/nyc, as the live AirCore pages load it) via lhFetch (lh-proxy or exactly this recorded request); if neither answers the whole block is hidden, like the source. Day names come with the answer (Today, Tomorrow, Friday). Unknown rows are ignored.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
