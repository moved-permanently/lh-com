# weather

Custom **weather** block. Purpose: live current weather and multi-day forecast for a destination; the whole widget is hidden when no weather data loads.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, label | value. Rows: Title | Current weather in New York (rendered immediately as the heading); Location | NYC (IATA city or airport code, also 'New York (NYC)'; without a code the block stays hidden); Units | C or F (default C; the live answer carries both). Optional label rows with built-in English/German defaults chosen by the page language: Today label (Today / heute, only when the answer has no day words), Forecast label (Forecast / Vorhersage, the accessible name of the day list, not shown), Humidity label, Wind label, Wind with label (with / mit; defaults: the words of the live answer). Weather comes at runtime from GET /aircore/weather/{lang}/{code} (e.g. /aircore/weather/de/nyc, as the live AirCore pages load it) via lhFetch (lh-proxy or exactly this recorded request); if neither answers the whole block is hidden, like the source. Day names come with the answer (Today, Tomorrow, Friday). Unknown rows are ignored (the former Min label / Max label rows included).

## Behaviour

As the live AirCore widget: the condition word of today (bold, "Sunny") above its 130px symbol, then Wind ("N with 17 km/h") and Humidity ("77%"), side by side from 1025px, stacked next to the symbol below; no current temperature. Forecast per day: day word, date "21 Oct." / "21. Okt." (the answer's day and month words), 64px symbol (92px high), "7 / 16 °C" (min / max); the row scrolls sideways when it does not fit.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
