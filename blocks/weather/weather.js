import { getLocale, LIVE_ORIGIN } from '../../scripts/locale.js';
import { lhFetch, markSource } from '../../scripts/lh-data.js';
import {
  readConfigRows, pick, resolveLabels, parseAirportCode,
} from '../../scripts/block-config.js';

/* ---------------------------------------------------------------------------------------------
 * Data contract. Request building and response mapping live here so the recorded responses
 * from the live site only require changes in this section.
 * ------------------------------------------------------------------------------------------- */

/**
 * Weather of one city as the live AirCore destination pages load it:
 * GET /aircore/weather/{lang}/{code}, e.g. /aircore/weather/de/nyc (lower-case city code).
 * @param {{location: string}} config
 * @param {Object} locale result of getLocale()
 * @returns {{route: string, method: string}}
 */
export function weatherRequest({ location }, locale) {
  return {
    route: `/aircore/weather/${encodeURIComponent(locale.lang)}/${encodeURIComponent(location.toLowerCase())}`,
    method: 'GET',
  };
}

/** Live icon template seen in the flight status widget config (weatherData.weatherIconUrl). */
const WEATHER_ICON_TEMPLATE = '/content/dam/lh/icons/wetter_icons/lh-icon_weather-ppfi_{SYMBOL}.svg';

/** Icon URL from a URL, a path or a weather symbol code. */
function weatherIconUrl(icon) {
  if (icon === undefined || icon === null || icon === '') return '';
  const value = String(icon);
  const path = /[/.]/.test(value) ? value : WEATHER_ICON_TEMPLATE.replace('{SYMBOL}', encodeURIComponent(value));
  try {
    return new URL(path, LIVE_ORIGIN).toString();
  } catch (e) {
    return '';
  }
}

function toNumber(...values) {
  const hit = values.find((v) => v !== undefined && v !== null && v !== '' && !Number.isNaN(Number(v)));
  return hit === undefined ? null : Number(hit);
}

function toUnit(value) {
  const text = String(value || '').toLowerCase();
  if (/^f|fahrenheit|imperial/.test(text)) return 'F';
  return 'C';
}

/**
 * The live answer: one entry per day, then one with the current conditions and labels.
 * [{"iata":"NYC","date":"2026-10-21","max_celsius":"16","max_fahrenheit":"61","min_celsius":"7",
 *   "min_fahrenheit":"45","symbol":"0","day_word":"Today","symbol_word":"Sunny",
 *   "symbol_path":"/aircore/cache/weather-0.svg"}, ...,
 *  {"iata":"NYC","humidity":"77","wind_direction":"N","wind_speed":"17","with":"with",
 *   "humidity_word":"Humidity","wind_word":"Wind","temperature_word":"Temperature"}]
 *  (day entries also carry "month":"Oct","day":"21")
 * → { unit, current: { temp, condition, icon, humidity, wind, windDirection }, days: [{ date,
 *   name, month, day, min, max, condition, icon }], labels: { 'humidity label', 'wind label',
 *   'wind with label' } }; null without days.
 * Both units come with the answer, so the requested one is used as is.
 */
function mapLiveWeather(data, unit) {
  const suffix = unit === 'F' ? 'fahrenheit' : 'celsius';
  const num = (v) => (v === undefined || v === null || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
  const days = data.filter((d) => d && d.date).map((d) => {
    const day = String(d.date).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return {
      date: day ? new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3])) : null,
      name: d.day_word || '',
      // short month word of the answer ("Oct", "Okt") for the live "21 Oct." / "21. Okt."
      month: d.month || '',
      day: d.day || '',
      min: num(d[`min_${suffix}`]),
      max: num(d[`max_${suffix}`]),
      condition: d.symbol_word || '',
      icon: weatherIconUrl(d.symbol_path || ''),
    };
  }).filter((d) => d.min !== null || d.max !== null);
  if (!days.length) return null;
  const extra = data.find((d) => d && !d.date
    && (d.humidity !== undefined || d.wind_speed !== undefined)) || {};
  const [today] = days;
  const labels = {};
  if (extra.humidity_word) labels['humidity label'] = extra.humidity_word;
  if (extra.wind_word) labels['wind label'] = extra.wind_word;
  if (extra.with) labels['wind with label'] = extra.with;
  return {
    unit,
    current: {
      temp: today.max,
      condition: today.condition,
      icon: today.icon,
      humidity: num(extra.humidity),
      wind: num(extra.wind_speed),
      windDirection: extra.wind_direction || '',
    },
    days,
    labels,
  };
}

/**
 * Maps the weather response to
 * { unit, current: { temp, condition, icon, humidity, wind }, days: [{ date, min, max,
 * condition, icon }] }. Tolerates flat and nested shapes; returns null without usable data.
 */
function mapWeather(data, requestedUnit = 'C') {
  if (Array.isArray(data)) return mapLiveWeather(data, requestedUnit);
  if (!data || typeof data !== 'object') return null;
  const root = data.weather || data.data || data;
  const unit = toUnit(root.unit || root.units || root.temperatureUnit || data.unit);
  const currentSource = root.current || root.today || root.now || root.currentWeather || root;
  const temperature = [currentSource.temperature, currentSource.temp]
    .find((t) => t && typeof t === 'object') || {};
  const textOf = (item) => {
    const condition = item.condition || item.weather || item.description || item.text || item.summary || '';
    if (typeof condition === 'object') return condition.text || condition.description || condition.label || '';
    return String(condition);
  };
  const iconOf = (item) => {
    const condition = typeof item.condition === 'object' && item.condition ? item.condition : {};
    return weatherIconUrl(item.icon || item.iconUrl || item.symbol || item.symbolCode
      || condition.icon || condition.symbol);
  };
  const current = {
    temp: toNumber(
      temperature.value,
      temperature.current,
      currentSource.temp,
      currentSource.temperature,
      currentSource.currentTemperature,
    ),
    condition: textOf(currentSource),
    icon: iconOf(currentSource),
    humidity: toNumber(currentSource.humidity, currentSource.relativeHumidity),
    wind: toNumber(currentSource.wind && typeof currentSource.wind === 'object'
      ? currentSource.wind.speed : currentSource.wind, currentSource.windSpeed),
  };
  const list = root.days || root.forecast || root.daily || root.forecasts || [];
  const days = (Array.isArray(list) ? list : []).map((item) => {
    const temp = item.temperature && typeof item.temperature === 'object' ? item.temperature : {};
    const rawDate = item.date || item.day || item.dt || item.time || item.validDate;
    let date = null;
    if (rawDate !== undefined && rawDate !== null) {
      const day = typeof rawDate === 'string' && rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      let parsed;
      // a plain date is a local calendar day, not UTC midnight
      if (day) parsed = new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]));
      else if (typeof rawDate === 'number' && rawDate < 1e12) parsed = new Date(rawDate * 1000);
      else parsed = new Date(rawDate);
      date = Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    return {
      date,
      min: toNumber(temp.min, item.min, item.minTemp, item.tempMin, item.temperatureMin, item.low),
      max: toNumber(temp.max, item.max, item.maxTemp, item.tempMax, item.temperatureMax, item.high),
      condition: textOf(item),
      icon: iconOf(item),
    };
  }).filter((d) => d.min !== null || d.max !== null);
  if (current.temp === null && !days.length) return null;
  return { unit, current, days };
}

/**
 * Loads and maps the weather of one location. Recorded answers count only for this exact
 * request: another city's weather is never shown.
 * @returns {Promise<{weather: Object|null, source: string}>}
 */
export async function loadWeather({ location, unit = 'C' }, locale) {
  try {
    const request = weatherRequest({ location }, locale);
    const { data, source } = await lhFetch(request.route, {
      method: request.method, market: locale.key, exact: true,
    });
    return { weather: mapWeather(data, unit), source };
  } catch (e) {
    return { weather: null, source: 'none' };
  }
}

/* ------------------------------------------------------------------------------------------- */

/** UI strings that are not visible authored content; any can be overridden by a block row. */
const DEFAULT_LABELS = {
  en: {
    'today label': 'Today',
    'forecast label': 'Forecast',
    'humidity label': 'Humidity',
    'wind label': 'Wind',
    'wind with label': 'with',
  },
  de: {
    'today label': 'heute',
    'forecast label': 'Vorhersage',
    'humidity label': 'Luftfeuchtigkeit',
    'wind label': 'Wind',
    'wind with label': 'mit',
  },
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function convert(value, from, to) {
  if (value === null) return null;
  if (from === to) return value;
  return to === 'F' ? (value * 9) / 5 + 32 : ((value - 32) * 5) / 9;
}

/** "16" in the page language (rounded), without unit */
function formatNumber(value, locale) {
  return new Intl.NumberFormat(`${locale.lang}-${locale.country.toUpperCase()}`, {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function iconImage(src, alt, size) {
  if (!src) return null;
  const img = el('img');
  img.src = src;
  img.alt = alt || '';
  img.loading = 'lazy';
  img.width = size;
  img.height = size;
  return img;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

/** Live day date: "21 Oct." (en), "21. Okt." (de), from the answer's day/month words. */
function formatDay(day, locale) {
  if (day.day && day.month) {
    return locale.lang === 'de' ? `${day.day}. ${day.month}.` : `${day.day} ${day.month}.`;
  }
  if (!day.date) return '';
  const tag = `${locale.lang}-${locale.country.toUpperCase()}`;
  return new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'short' }).format(day.date);
}

/** One "label / value" pair of the current conditions (live .w-today-additional > div). */
function conditionItem(label, value) {
  const item = el('div', 'weather-additional-item');
  item.append(el('dt', 'weather-label', label), el('dd', '', value));
  return item;
}

/*
 * Live AirCore markup (.weather.weather-wrapper):
 *  .w-today: [condition word (bold) above the 130px symbol] [Wind "N with 17 km/h"]
 *            [Humidity "77%"]  (no current temperature)
 *  .w-forecast: per day name, "21 Oct.", 64px symbol, "7 / 16 °C" (min / max)
 */
function renderWeather(weather, unit, labels, locale) {
  const convertTemp = (value) => convert(value, weather.unit, unit);
  const fragment = document.createDocumentFragment();
  const [first] = weather.days;
  const { current } = weather;

  const condition = current.condition || (first && first.condition) || '';
  const icon = current.icon || (first && first.icon) || '';
  const today = el('div', 'weather-today');
  const now = el('div', 'weather-current');
  if (condition) now.append(el('p', 'weather-label weather-condition', condition));
  const img = iconImage(icon, condition, 130);
  if (img) now.append(img);
  if (now.children.length) today.append(now);
  const extra = el('dl', 'weather-additional');
  if (current.wind !== null) {
    const speed = `${formatNumber(current.wind, locale)} km/h`;
    extra.append(conditionItem(
      labels['wind label'],
      current.windDirection ? `${current.windDirection} ${labels['wind with label']} ${speed}` : speed,
    ));
  }
  if (current.humidity !== null) {
    extra.append(conditionItem(labels['humidity label'], `${formatNumber(current.humidity, locale)}%`));
  }
  if (extra.children.length) today.append(extra);
  if (today.children.length) fragment.append(today);

  if (weather.days.length) {
    const list = el('ul', 'weather-days');
    list.setAttribute('aria-label', labels['forecast label']);
    const nowDate = new Date();
    weather.days.forEach((day) => {
      const li = el('li', 'weather-day');
      let name = '';
      // the live day words ("Today", "Tomorrow", "Friday") come localized with the answer
      if (day.name) name = day.name;
      else if (day.date) {
        const tag = `${locale.lang}-${locale.country.toUpperCase()}`;
        name = isSameDay(day.date, nowDate) ? labels['today label']
          : new Intl.DateTimeFormat(tag, { weekday: 'long' }).format(day.date);
      }
      li.append(el('span', 'weather-label weather-day-name', name));
      const date = formatDay(day, locale);
      if (date) li.append(el('span', 'weather-day-date', date));
      const dayImg = iconImage(day.icon, day.condition, 64);
      if (dayImg) li.append(dayImg);
      else if (day.condition) li.append(el('span', 'weather-condition', day.condition));
      // live: "7 / 16 °C" (min / max)
      const values = [day.min, day.max].filter((v) => v !== null)
        .map((v) => formatNumber(convertTemp(v), locale));
      li.append(el('span', 'weather-range', `${values.join(' / ')} °${unit}`));
      list.append(li);
    });
    const forecast = el('div', 'weather-forecast');
    forecast.append(list);
    fragment.append(forecast);
  }
  return fragment;
}

export default async function decorate(block) {
  const locale = getLocale();
  const config = readConfigRows(block);
  const text = (...keys) => (pick(config, ...keys) || {}).text || '';

  const title = text('title', 'heading');
  const location = parseAirportCode(text('location', 'destination', 'city')) || '';
  const unit = toUnit(text('units', 'unit'));

  const content = [];
  if (title) content.push(el('h2', 'weather-title', title));
  const data = el('div', 'weather-data');
  data.hidden = true;
  content.push(data);
  block.replaceChildren(...content);

  // like the source: the whole widget stays hidden when no weather loads
  const unavailable = () => {
    block.classList.add('weather-unavailable');
    block.removeAttribute('aria-busy');
  };
  if (!location) {
    unavailable();
    return;
  }

  block.setAttribute('aria-busy', 'true');
  const { weather, source } = await loadWeather({ location, unit }, locale);
  markSource(block, { weather: source }, ['weather']);
  if (!weather) {
    unavailable();
    return;
  }
  // labels of the answer (humidity_word, wind_word) unless authored
  const defaults = DEFAULT_LABELS[locale.lang] || DEFAULT_LABELS.en;
  const labels = resolveLabels({
    [locale.lang]: { ...defaults, ...(weather.labels || {}) },
  }, config, locale.lang);
  data.replaceChildren(renderWeather(weather, unit, labels, locale));
  data.hidden = false;
  block.removeAttribute('aria-busy');
  block.classList.add('weather-loaded');
}
