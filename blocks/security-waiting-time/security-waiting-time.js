import { getLocale, LIVE_ORIGIN } from '../../scripts/locale.js';
import { readConfigRows, pick, resolveLabels } from '../../scripts/block-config.js';
import {
  fetchRequest, fetchLabels, pickLabels, fillLabel, mapAirportNames,
  securityWaitingTimeAirportsRequest, securityWaitingTimeRequest,
} from '../../scripts/lh-api.js';
import { markSource, priceRetryDelay } from '../../scripts/lh-data.js';
import { brandWwwHost } from '../../scripts/brand.js';

/*
 * Security waiting times, as www's component (dcep-security-waiting-time; www.lufthansa.com
 * /<cc>/<ll>/prepare-for-your-trip/airport-information/services-at-the-airport/
 * security-waiting-time, ITA's /it/en/book-and-prepare/travel-information/at-the-airport/
 * security-waiting-times, Discover's /de/en/book/travel-information/airport-info/
 * security-check-time-slot): an airport select (GET /service/api/security-waiting-time/airports,
 * named as www's saga asks: POST /service/api/catalogs/airportnames with the codes,
 * {"airports":[{"code":"MUC"},…]}, in the portal's language; a code without a name shows the
 * code), then per terminal (tabs) and area the waiting time
 * ("5 - 10 min"), "open" or "closed", a dot in the area's workload colour and "Last update: 3
 * minutes ago" (GET /service/api/security-waiting-time/<IATA>/security). The page's ?airport=
 * (as www) or the Airport row preselects one. Live or nothing (scripts/lh-data.js handles the
 * routes as the price routes: two retries, then a short backoff): a failed call shows the link to
 * the airline's www page (the Live page row, else this page on the brand's www), never other
 * numbers; one late try per page load once the backoff is over.
 */

// www's texts (labels/securitywaitingtime/lh/en and /lh/de: securityWaitingTime.default.default.*,
// 2026-11-01); Italian for ITA's Italian pages whose labels don't load
const DEFAULT_LABELS = {
  en: {
    'select label': 'Select Airport',
    'last update label': 'Last update',
    'open label': 'open',
    'closed label': 'closed',
    'minutes label': 'min',
    'error label': 'Problems with getting the data',
    'status label': '{TERMINAL_NAME}, {WORKLOAD, select, CLOSED {Area {AREA_NAME}, Security gate is closed.} OPEN {Area {AREA_NAME}, Security gate is open.} other {Area {AREA_NAME}, Estimated wait time {MIN_TIME} to {MAX_TIME} minutes.}}',
    'live page label': 'Security waiting times on {HOST}',
  },
  de: {
    'select label': 'Flughafen auswählen',
    'last update label': 'Letzte Aktualisierung',
    'open label': 'offen',
    'closed label': 'geschlossen',
    'minutes label': 'Min',
    'error label': 'Probleme beim Abrufen der Daten',
    'status label': '{TERMINAL_NAME}, {WORKLOAD, select, CLOSED {Bereich {AREA_NAME}, Die Sicherheitskontrolle ist geschlossen.} OPEN {Bereich {AREA_NAME}, Die Sicherheitskontrolle ist geöffnet.} other {Bereich {AREA_NAME}, Geschätzte Wartezeit {MIN_TIME} bis {MAX_TIME} Minuten.}}',
    'live page label': 'Wartezeiten an der Sicherheitskontrolle auf {HOST}',
  },
  it: {
    'select label': 'Seleziona aeroporto',
    'last update label': 'Ultimo aggiornamento',
    'open label': 'aperto',
    'closed label': 'chiuso',
    'minutes label': 'min',
    'error label': 'Problemi nel recupero dei dati',
    'status label': '{TERMINAL_NAME}, {WORKLOAD, select, CLOSED {Area {AREA_NAME}, il controllo di sicurezza è chiuso.} OPEN {Area {AREA_NAME}, il controllo di sicurezza è aperto.} other {Area {AREA_NAME}, tempo di attesa stimato da {MIN_TIME} a {MAX_TIME} minuti.}}',
    'live page label': 'Tempi di attesa ai controlli di sicurezza su {HOST}',
  },
  fr: {
    'select label': 'Sélectionner un aéroport',
    'last update label': 'Dernière mise à jour',
    'open label': 'ouverte',
    'closed label': 'fermée',
    'minutes label': 'min',
    'error label': 'Problèmes d\'obtention des données',
    'status label': '{TERMINAL_NAME}, {WORKLOAD, select, CLOSED {Zone {AREA_NAME}, Porte de sécurité fermée.} OPEN {Zone {AREA_NAME}, Porte de sécurité ouverte.} other {Zone {AREA_NAME}, temps d’attente estimé de {MIN_TIME} à {MAX_TIME} minutes.}}',
    'live page label': 'Temps d’attente au contrôle de sécurité sur {HOST}',
  },
  es: {
    'select label': 'Seleccionar aeropuerto',
    'last update label': 'Última actualización',
    'open label': 'abierta',
    'closed label': 'cerrada',
    'minutes label': 'min',
    'error label': 'Problemas para obtener los datos',
    'status label': '{TERMINAL_NAME}, {WORKLOAD, select, CLOSED {Área {AREA_NAME}, La puerta de seguridad está cerrada.} OPEN {Área {AREA_NAME}, La puerta de seguridad está abierta.} other {Área {AREA_NAME}, Tiempo de espera estimado: de {MIN_TIME} a {MAX_TIME} minutos.}}',
    'live page label': 'Tiempos de espera en el control de seguridad en {HOST}',
  },
  el: {
    'select label': 'Επιλέξτε αεροδρόμιο',
    'last update label': 'Τελευταία ενημέρωση',
    'open label': 'ανοιχτή',
    'closed label': 'κλειστή',
    'minutes label': 'λεπ.',
    'error label': 'Πρόβλημα κατά τη λήψη των δεδομένων',
    'status label': '{TERMINAL_NAME}, {WORKLOAD, select, CLOSED {Ζώνη {AREA_NAME}, ο έλεγχος ασφαλείας είναι κλειστός.} OPEN {Ζώνη {AREA_NAME}, ο έλεγχος ασφαλείας είναι ανοιχτός.} other {Ζώνη {AREA_NAME}, εκτιμώμενος χρόνος αναμονής {MIN_TIME} έως {MAX_TIME} λεπτά.}}',
    'live page label': 'Χρόνοι αναμονής στον έλεγχο ασφαλείας στο {HOST}',
  },
  ja: {
    'select label': '空港を選択',
    'last update label': '最終更新',
    'open label': '開放中',
    'closed label': '閉鎖中',
    'minutes label': '分',
    'error label': 'データの取得に問題が発生しました',
    'status label': '{TERMINAL_NAME}、{WORKLOAD, select, CLOSED {エリア{AREA_NAME}、保安検査場は閉鎖中です。} OPEN {エリア{AREA_NAME}、保安検査場は開いています。} other {エリア{AREA_NAME}、予想待ち時間は{MIN_TIME}～{MAX_TIME}分です。}}',
    'live page label': '{HOST}の保安検査待ち時間',
  },
  ko: {
    'select label': '공항 선택',
    'last update label': '최종 업데이트',
    'open label': '운영 중',
    'closed label': '운영 중지',
    'minutes label': '분',
    'error label': '데이터를 가져오는 데 문제가 발생했습니다',
    'status label': '{TERMINAL_NAME}, {WORKLOAD, select, CLOSED {구역 {AREA_NAME}, 보안 검색대가 닫혀 있습니다.} OPEN {구역 {AREA_NAME}, 보안 검색대가 열려 있습니다.} other {구역 {AREA_NAME}, 예상 대기 시간 {MIN_TIME}~{MAX_TIME}분.}}',
    'live page label': '{HOST}의 보안 검색 대기 시간',
  },
  nl: {
    'select label': 'Luchthaven kiezen',
    'last update label': 'Laatste update',
    'open label': 'geopend',
    'closed label': 'gesloten',
    'minutes label': 'min',
    'error label': 'Problemen bij het ophalen van de gegevens',
    'status label': '{TERMINAL_NAME}, {WORKLOAD, select, CLOSED {Zone {AREA_NAME}, de beveiligingscontrole is gesloten.} OPEN {Zone {AREA_NAME}, de beveiligingscontrole is open.} other {Zone {AREA_NAME}, geschatte wachttijd {MIN_TIME} tot {MAX_TIME} minuten.}}',
    'live page label': 'Wachttijden bij de beveiliging op {HOST}',
  },
  pl: {
    'select label': 'Wybierz lotnisko',
    'last update label': 'Ostatnia aktualizacja',
    'open label': 'otwarta',
    'closed label': 'zamknięta',
    'minutes label': 'min',
    'error label': 'Problem z pobraniem danych',
    'status label': '{TERMINAL_NAME}, {WORKLOAD, select, CLOSED {Strefa {AREA_NAME}, kontrola bezpieczeństwa jest zamknięta.} OPEN {Strefa {AREA_NAME}, kontrola bezpieczeństwa jest otwarta.} other {Strefa {AREA_NAME}, szacowany czas oczekiwania od {MIN_TIME} do {MAX_TIME} minut.}}',
    'live page label': 'Czas oczekiwania na kontrolę bezpieczeństwa na {HOST}',
  },
  pt: {
    'select label': 'Selecionar aeroporto',
    'last update label': 'Última atualização',
    'open label': 'aberta',
    'closed label': 'fechada',
    'minutes label': 'min',
    'error label': 'Problemas ao obter os dados',
    'status label': '{TERMINAL_NAME}, {WORKLOAD, select, CLOSED {Zona {AREA_NAME}, o controlo de segurança está fechado.} OPEN {Zona {AREA_NAME}, o controlo de segurança está aberto.} other {Zona {AREA_NAME}, tempo de espera estimado de {MIN_TIME} a {MAX_TIME} minutos.}}',
    'live page label': 'Tempos de espera no controlo de segurança em {HOST}',
  },
  ru: {
    'select label': 'Выберите аэропорт',
    'last update label': 'Последнее обновление',
    'open label': 'открыт',
    'closed label': 'закрыт',
    'minutes label': 'мин',
    'error label': 'Не удалось получить данные',
    'status label': '{TERMINAL_NAME}, {WORKLOAD, select, CLOSED {Зона {AREA_NAME}, пункт досмотра закрыт.} OPEN {Зона {AREA_NAME}, пункт досмотра открыт.} other {Зона {AREA_NAME}, ожидаемое время ожидания от {MIN_TIME} до {MAX_TIME} минут.}}',
    'live page label': 'Время ожидания досмотра на {HOST}',
  },
  zh: {
    'select label': '选择机场',
    'last update label': '最近更新',
    'open label': '开放',
    'closed label': '关闭',
    'minutes label': '分钟',
    'error label': '获取数据时出现问题',
    'status label': '{TERMINAL_NAME}，{WORKLOAD, select, CLOSED {{AREA_NAME}区域，安检口已关闭。} OPEN {{AREA_NAME}区域，安检口已开放。} other {{AREA_NAME}区域，预计等候时间为 {MIN_TIME} 至 {MAX_TIME} 分钟。}}',
    'live page label': '{HOST} 上的安检等候时间',
  },
};
const LIVE_LABELS = {
  'select label': 'securityWaitingTime.default.default.selectAirport',
  'last update label': 'securityWaitingTime.default.default.lastUpdate',
  'open label': 'securityWaitingTime.default.default.securityGateOpen',
  'closed label': 'securityWaitingTime.default.default.securityGateClosed',
  'minutes label': 'securityWaitingTime.default.default.securityGateMinutesAbbrev',
  'error label': 'securityWaitingTime.default.default.airportDataMissing',
  'status label': 'securityWaitingTime.default.default.srSecurityGateStatus',
};
const BUNDLE = 'securitywaitingtime';

/**
 * The airports' names as www's widget asks for them (its saga translateAirports, 2026-11-01): POST
 * /service/api/catalogs/airportnames with the codes; the GET without codes answers one airport
 * only (lh-com Frankfurt, ITA Rome).
 */
const airportNamesRequest = (codes) => ({
  method: 'POST',
  route: '/service/api/catalogs/airportnames',
  body: { airports: codes.map((code) => ({ code })) },
});
// www's badge types (SWT-<workload>): the dot's colour (CSS)
const WORKLOADS = ['LOW', 'MEDIUM', 'FULL', 'OPEN', 'CLOSED'];

let instances = 0;

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

/**
 * A label in ICU's select form ("{WORKLOAD, select, CLOSED {…} OPEN {…} other {…}}", www's
 * srSecurityGateStatus) with its values: the matching branch, then the {NAME} placeholders.
 */
export function formatStatus(template, values) {
  const text = String(template || '');
  const head = /\{([A-Z_]+), select,/.exec(text);
  if (!head) return fillLabel(text, values);
  // the options after "select,": KEY {branch} pairs, braces nested
  let i = head.index + head[0].length;
  const options = {};
  while (i < text.length && text[i] !== '}') {
    const key = /^\s*([A-Za-z_]+)\s*\{/.exec(text.slice(i));
    if (!key) break;
    let depth = 1;
    let j = i + key[0].length;
    const start = j;
    while (j < text.length && depth) {
      if (text[j] === '{') depth += 1;
      if (text[j] === '}') depth -= 1;
      j += 1;
    }
    options[key[1]] = text.slice(start, j - 1);
    i = j;
    while (text[i] === ' ') i += 1;
  }
  const branch = options[values[head[1]]] ?? options.other ?? '';
  return fillLabel(text.slice(0, head.index) + branch + text.slice(i + 1), values);
}

/** The time of a lastupdate (ISO text, or epoch seconds / milliseconds), else null. */
function updateTime(value) {
  if (typeof value === 'number') return value < 1e12 ? value * 1000 : value;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : null;
}

/** "3 minutes ago" in the page's language (www: moment's fromNow). */
export function sinceText(time, lang, now = Date.now()) {
  if (time === null) return '';
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  const sec = Math.round((time - now) / 1000);
  const abs = Math.abs(sec);
  if (abs < 60) return rtf.format(sec, 'second');
  if (abs < 3600) return rtf.format(Math.round(sec / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(sec / 3600), 'hour');
  return rtf.format(Math.round(sec / 86400), 'day');
}

function badgeText(area, labels) {
  if (area.workload === 'CLOSED') return labels['closed label'];
  if (area.workload === 'OPEN') return labels['open label'];
  return `${area.minTime} - ${area.maxTime} ${labels['minutes label']}`;
}

function renderArea(area, terminal, labels, lang) {
  const li = el('li', 'security-waiting-time-area');
  const workload = String(area.workload || '').toUpperCase();
  li.dataset.workload = WORKLOADS.includes(workload) ? workload : 'OTHER';
  const since = sinceText(updateTime(area.lastupdate), lang);
  const update = since ? `${labels['last update label']}: ${since}` : '';
  const status = formatStatus(labels['status label'], {
    TERMINAL_NAME: terminal.name,
    AREA_NAME: area.name,
    WORKLOAD: workload,
    MIN_TIME: area.minTime,
    MAX_TIME: area.maxTime,
  });
  li.append(el('span', 'security-waiting-time-sr', update ? `${status} ${update}` : status));
  const visual = el('div', 'security-waiting-time-visual');
  visual.setAttribute('aria-hidden', 'true');
  const details = el('div', 'security-waiting-time-details');
  details.append(el('span', 'security-waiting-time-area-name', area.name));
  if (update) details.append(el('span', 'security-waiting-time-update', update));
  visual.append(el('span', 'security-waiting-time-badge', badgeText({ ...area, workload }, labels)), details);
  li.append(visual);
  return li;
}

/**
 * The terminals: a tab per terminal (WAI-ARIA tabs), one terminal too (as www: its name is the
 * tab, Frankfurt's "Terminal 1").
 */
function renderTerminals(terminals, labels, lang, uid) {
  const wrap = el('div', 'security-waiting-time-terminals');
  const panels = terminals.map((terminal, i) => {
    const panel = el('div', 'security-waiting-time-panel');
    panel.id = `${uid}-panel-${i + 1}`;
    const list = el('ul', 'security-waiting-time-areas');
    (terminal.areas || []).forEach((area) => list.append(renderArea(area, terminal, labels, lang)));
    panel.append(list);
    return panel;
  });
  if (terminals.length) {
    const bar = el('div', 'security-waiting-time-tabs');
    bar.setAttribute('role', 'tablist');
    const tabs = terminals.map((terminal, i) => {
      const tab = el('button', 'security-waiting-time-tab', terminal.name);
      tab.type = 'button';
      tab.id = `${uid}-tab-${i + 1}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panels[i].id);
      panels[i].setAttribute('role', 'tabpanel');
      panels[i].setAttribute('aria-labelledby', tab.id);
      return tab;
    });
    const select = (index, focus) => {
      tabs.forEach((tab, i) => {
        const on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
      });
      if (focus) tabs[index].focus();
    };
    tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i, false)));
    bar.addEventListener('keydown', (e) => {
      const current = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
      const keys = {
        ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: tabs.length - 1,
      };
      if (!(e.key in keys)) return;
      e.preventDefault();
      select((keys[e.key] + tabs.length) % tabs.length, true);
    });
    bar.append(...tabs);
    wrap.append(bar);
    select(0, false);
  }
  wrap.append(...panels);
  return wrap;
}

/**
 * The airline's www page: the Live page row, else this page on the brand's www (lh-com:
 * www.lufthansa.com).
 */
function livePage(config) {
  const row = pick(config, 'live-page');
  const href = row && row.link ? row.link.getAttribute('href') : (row && row.text) || '';
  if (href) return new URL(href, LIVE_ORIGIN).href;
  const host = brandWwwHost();
  return `${host ? `https://${host}` : LIVE_ORIGIN}${window.location.pathname}`;
}

export default async function decorate(block) {
  instances += 1;
  const uid = `security-waiting-time-${instances}`;
  const locale = getLocale();
  const config = readConfigRows(block);
  let labels = resolveLabels(DEFAULT_LABELS, config, locale.lang);
  const page = livePage(config);
  const authoredAirport = ((pick(config, 'airport') || {}).text || '').trim().toUpperCase();
  const preselected = (new URLSearchParams(window.location.search).get('airport') || authoredAirport)
    .trim().toUpperCase();

  const fallback = () => {
    const p = el('p', 'security-waiting-time-fallback');
    const host = new URL(page).hostname.replace(/^www\./, '');
    const a = el('a', '', fillLabel(labels['live page label'], { HOST: host }));
    a.href = page;
    p.append(a);
    return p;
  };
  const sources = {};
  const mark = (primary) => markSource(block, sources, [primary]);

  const labelsPromise = fetchLabels([BUNDLE], locale).then((live) => {
    sources[`labels/${BUNDLE}`] = live.sources[BUNDLE];
    // live labels between the built-in texts and the authored rows
    const builtIn = DEFAULT_LABELS[locale.lang] || DEFAULT_LABELS.en;
    labels = resolveLabels({
      [locale.lang]: { ...builtIn, ...pickLabels(live.labels, LIVE_LABELS) },
    }, config, locale.lang);
  });
  // no names (the call failed, after lh-data's retry of a direct route): the codes, as before
  const loadNames = (codes) => fetchRequest(airportNamesRequest(codes), locale, { exact: true })
    .then(({ data }) => new Map(mapAirportNames(data).map((a) => [a.code, a.name])))
    .catch(() => new Map());
  const loadAirports = () => fetchRequest(securityWaitingTimeAirportsRequest(), locale)
    .then(({ data, source }) => {
      sources.airports = source;
      return ((data && data.airports) || []).filter((c) => /^[A-Z]{3}$/.test(c));
    })
    .catch(() => {
      sources.airports = 'none';
      return null;
    });

  const result = el('div', 'security-waiting-time-result');
  result.setAttribute('aria-live', 'polite');
  let requestId = 0;
  let lateWaitDone = false;
  const showWaitingTimes = async (code) => {
    requestId += 1;
    const mine = requestId;
    if (!code) {
      result.replaceChildren();
      return;
    }
    result.setAttribute('aria-busy', 'true');
    const request = securityWaitingTimeRequest(code);
    const data = await fetchRequest(request, locale)
      .then((r) => {
        sources.waitingTimes = r.source;
        return r.data;
      })
      .catch(() => {
        sources.waitingTimes = 'none';
        return null;
      });
    if (mine !== requestId) return;
    result.removeAttribute('aria-busy');
    const terminals = ((data && data.terminals) || []).filter((t) => t && Array.isArray(t.areas));
    mark('waitingTimes');
    if (!terminals.length) {
      // www: airportDataMissing; here also the airline's page, never other numbers
      const error = el('p', 'security-waiting-time-error', labels['error label']);
      error.setAttribute('role', 'alert');
      result.replaceChildren(error, fallback());
      if (!data && !lateWaitDone) {
        // one late try per page load once the backoff is over (scripts/lh-data.js)
        lateWaitDone = true;
        const delay = priceRetryDelay([request.route]);
        setTimeout(() => { if (mine === requestId) showWaitingTimes(code); }, delay);
      }
      return;
    }
    result.replaceChildren(renderTerminals(terminals, labels, locale.lang, `${uid}-${code}`));
  };

  const buildForm = async (codes) => {
    const names = await loadNames(codes);
    const form = el('div', 'security-waiting-time-form');
    const label = el('label', 'security-waiting-time-label', labels['select label']);
    const select = el('select', 'security-waiting-time-select');
    select.id = `${uid}-airport`;
    select.name = 'airport';
    label.setAttribute('for', select.id);
    const placeholder = el('option', '', labels['select label']);
    placeholder.value = '';
    select.append(placeholder);
    codes.forEach((code) => {
      const option = el('option', '', names.get(code) || code);
      option.value = code;
      select.append(option);
    });
    select.addEventListener('change', () => showWaitingTimes(select.value));
    form.append(label, select);
    block.replaceChildren(form, result);
    if (preselected && codes.includes(preselected)) {
      select.value = preselected;
      await showWaitingTimes(preselected);
    }
  };

  block.setAttribute('aria-busy', 'true');
  const [codes] = await Promise.all([loadAirports(), labelsPromise]);
  block.removeAttribute('aria-busy');
  mark('airports');
  if (codes && codes.length) {
    await buildForm(codes);
    return;
  }
  // no airports (the call failed): the airline's page; one late try once the backoff is over
  block.replaceChildren(fallback());
  const { route } = securityWaitingTimeAirportsRequest();
  setTimeout(async () => {
    const late = await loadAirports();
    mark('airports');
    if (late && late.length) await buildForm(late);
  }, priceRetryDelay([route]));
}
