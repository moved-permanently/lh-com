/**
 * The passenger picker's lufthansa.com options, each by its own row (none without it):
 * - `Young adults`: www's "Young Adults (12-15 years)" stepper, on the roots its row names
 *   (`GB`, a list of countries) or everywhere (`yes`); handed off as B15 after the adults.
 * - `Fare preference`: www's "Alternative fare selection" (best price, coupon, high); handed off
 *   as farePreference after the cabin, none for best price (www sends none either).
 * - a hint row left empty, or without its value cell (`Children hint`): no hint (the adults
 *   have none by default, passenger-picker.js).
 * The handoff's additions live here, not in scripts/shop-handoff.js: a visitor with that script
 * cached from before still hands off what the picker shows.
 */

import { cleanText, resolveLabels, toConfigKey } from '../../scripts/block-config.js';

/** www's texts (labels of its flightmanager and common bundles), per language. */
export const PICKER_OPTION_LABELS = {
  en: {
    'young adults label': 'Young Adults',
    'young adults hint': '(12-15 years)',
    'fare label': 'Alternative fare selection',
    'fare question': 'Which fare benefits do you prefer?',
    'fare default label': 'Best price offers',
    'fare coupon label': 'Change the sequence of my flights',
    'fare high label': 'Flexibility/highest booking class to collect more miles',
    'fare applied': 'Your fare selection is active.',
  },
  de: {
    'young adults label': 'Junge Erwachsene',
    'young adults hint': '(12-15 Jahre)',
    'fare label': 'Alternative Tarifoptionen',
    'fare question': 'Welche Tarifvorteile sind Ihnen wichtiger?',
    'fare default label': 'Bestpreisangebote',
    'fare coupon label': 'Reihenfolge meiner Flüge ändern',
    'fare high label': 'Flexibilität bzw. höchste Buchungsklasse, um mehr Meilen zu sammeln',
    'fare applied': 'Der ausgewählte Tarif wurde übernommen.',
  },
  pt: {
    'young adults label': 'Jovens adultos',
    'young adults hint': '(12-15 anos)',
    'fare label': 'Seleção de tarifa alternativa',
    'fare question': 'Que vantagens tarifárias prefere?',
    'fare default label': 'Ofertas ao melhor preço',
    'fare coupon label': 'Alterar a sequência dos meus voos',
    'fare high label': 'Flexibilidade/classe de reserva mais alta para acumular mais milhas',
    'fare applied': 'A sua seleção de tarifa está ativa.',
  },
  ru: {
    'young adults label': 'Молодые люди',
    'young adults hint': '(12–15 лет)',
    'fare label': 'Выбор другого тарифа',
    'fare question': 'Какие преимущества тарифа для вас важнее?',
    'fare default label': 'Предложения по лучшей цене',
    'fare coupon label': 'Изменить последовательность моих перелётов',
    'fare high label': 'Гибкость / более высокий класс бронирования для накопления большего числа миль',
    'fare applied': 'Выбранный тариф применён.',
  },
  hk: {
    'young adults label': '青少年',
    'young adults hint': '（12–15 歲）',
    // the wording of www (hk/hk/homepage, 2026-11-07)
    'fare label': '其他票價選擇',
    'fare question': '您想要什麼樣的票價優惠?',
    'fare default label': '最佳票價優惠',
    'fare coupon label': '變更航班次序',
    'fare high label': '彈性/最高等級預訂艙等以累積更多哩程',
    'fare applied': '已套用您選擇的票價。',
  },
  zh: {
    'young adults label': '青少年',
    'young adults hint': '（12–15 岁）',
    'fare label': '选择其他票价',
    'fare question': '您更希望享受哪些票价优惠？',
    'fare default label': '最优价格',
    'fare coupon label': '更改我的航班顺序',
    'fare high label': '灵活性/更高订座舱位，可累积更多里程',
    'fare applied': '您选择的票价已生效。',
  },
  it: {
    'young adults label': 'Giovani adulti',
    'young adults hint': '(12-15 anni)',
    'fare label': 'Selezione tariffaria alternativa',
    'fare question': 'Quali vantaggi tariffari preferisce?',
    'fare default label': 'Offerte al miglior prezzo',
    'fare coupon label': 'Modificare la sequenza dei miei voli',
    'fare high label': 'Flessibilità/classe di prenotazione più alta per accumulare più miglia',
    'fare applied': 'La sua selezione tariffaria è attiva.',
  },
  el: {
    'young adults label': 'Νεαροί ενήλικες',
    'young adults hint': '(12-15 ετών)',
    'fare label': 'Επιλογή εναλλακτικού ναύλου',
    'fare question': 'Ποια πλεονεκτήματα ναύλου προτιμάτε;',
    'fare default label': 'Προσφορές στην καλύτερη τιμή',
    'fare coupon label': 'Αλλαγή της σειράς των πτήσεών μου',
    'fare high label': 'Ευελιξία/υψηλότερη κατηγορία κράτησης για συλλογή περισσότερων μιλίων',
    'fare applied': 'Η επιλογή ναύλου σας είναι ενεργή.',
  },
  ja: {
    'young adults label': '青少年',
    'young adults hint': '（12～15歳）',
    'fare label': '別の運賃を選択',
    'fare question': 'どの運賃特典をご希望ですか？',
    'fare default label': '最安値の運賃',
    'fare coupon label': 'フライトの順序を変更する',
    'fare high label': '柔軟性／より多くのマイルを貯められる上位の予約クラス',
    'fare applied': '選択した運賃が適用されています。',
  },
  ko: {
    'young adults label': '청소년',
    'young adults hint': '(12-15세)',
    'fare label': '다른 운임 선택',
    'fare question': '어떤 운임 혜택을 원하십니까?',
    'fare default label': '최저가 운임',
    'fare coupon label': '항공편 순서 변경',
    'fare high label': '유연성/더 많은 마일 적립을 위한 상위 예약 클래스',
    'fare applied': '선택하신 운임이 적용되었습니다.',
  },
  pl: {
    'young adults label': 'Młodzież',
    'young adults hint': '(12-15 lat)',
    'fare label': 'Wybór alternatywnej taryfy',
    'fare question': 'Które korzyści taryfowe są dla Ciebie ważniejsze?',
    'fare default label': 'Oferty w najlepszej cenie',
    'fare coupon label': 'Zmień kolejność moich lotów',
    'fare high label': 'Elastyczność/najwyższa klasa rezerwacyjna, aby zbierać więcej mil',
    'fare applied': 'Wybrana taryfa jest aktywna.',
  },
};

/** The picker's hints a document can leave out. */
const HINTS = ['adults hint', 'young adults hint', 'children hint', 'infants hint'];

const YES = /^(y|yes|true|ja|si|sì|oui|1)$/i;

/** Whether a row's value turns its option on for the locale: yes, or a list with its country. */
function shows(entry, locale) {
  if (!entry || !entry.text) return false;
  if (YES.test(entry.text)) return true;
  const country = String(locale.country || '').toUpperCase();
  return Boolean(country) && entry.list.some((c) => c.toUpperCase() === country);
}

/**
 * The block's picker options.
 * @param {Element} block the authored block (its rows, read before decoration)
 * @param {Object} config result of readConfigRows
 * @param {Object} locale result of getLocale()
 * @returns {{youngAdults: boolean, farePreference: boolean, labels: Object<string, string>}}
 *   labels: the options' texts (only when an option is on) and the hints left out ('')
 */
export function readPickerOptions(block, config, locale) {
  const youngAdults = shows(config['young-adults'], locale);
  const farePreference = shows(config['fare-preference'], locale);
  const labels = youngAdults || farePreference
    ? resolveLabels(PICKER_OPTION_LABELS, config, locale.lang) : {};
  // a row without its value cell is not in config (readConfigRows skips it)
  const keyOnly = [...block.children]
    .filter((row) => row.children.length === 1)
    .map((row) => toConfigKey(cleanText(row.children[0])));
  HINTS.forEach((hint) => {
    const key = toConfigKey(hint);
    // an empty value cell: in config with no text
    if (config[key] ? !config[key].text : keyOnly.includes(key)) labels[hint] = '';
  });
  return { youngAdults, farePreference, labels };
}

/** The shop's fare preferences: best price (sent as none), coupon, high. */
export const FARE_PREFERENCES = [['DEFAULT', 'fare default label'], ['COUPON', 'fare coupon label'], ['HIGH', 'fare high label']];

/**
 * The handoff with the picker's young adults and fare preference, as www sends them: B15 after
 * the adults (before the children and infants), farePreference right after the cabin; the
 * travellers window's access code as universalCode after them (the name of www's form field
 * flightQuery.universalCode), only when filled. Nothing to add, or not the shop's search (Air
 * Dolomiti's): the same handoff.
 * @param {{action: string, fields: Object<string, string>}} handoff result of buildShopHandoff
 * @param {Object} [value] the picker's value
 */
export function applyPickerChoices(handoff, value) {
  const young = Math.max(0, parseInt((value || {}).youngAdults, 10) || 0);
  const fare = (value || {}).farePreference;
  const preference = FARE_PREFERENCES.some(([code]) => code === fare) && fare !== 'DEFAULT' ? fare : '';
  // the travellers window's access code (travellers-dialog.js), as www's form names it
  const universal = String((value || {}).universalCode || '').trim();
  if (!young && !preference && !universal) return handoff;
  let search;
  try {
    search = JSON.parse(handoff.fields.search);
  } catch (e) {
    return handoff;
  }
  if (!search || !Array.isArray(search.travelers) || !search.cabin) return handoff;
  const adults = search.travelers.filter((t) => t.passengerTypeCode === 'ADT');
  const others = search.travelers.filter((t) => t.passengerTypeCode !== 'ADT');
  const travelers = [
    ...adults,
    ...Array.from({ length: young }, () => ({ discounts: [], passengerTypeCode: 'B15' })),
    ...others,
  ];
  const next = Object.fromEntries(Object.entries(search).flatMap(([key, v]) => {
    if (key === 'travelers') return [[key, travelers]];
    if (key === 'cabin') {
      return [[key, v], ...(preference ? [['farePreference', preference]] : []),
        ...(universal ? [['universalCode', universal]] : [])];
    }
    return [[key, v]];
  }));
  return { ...handoff, fields: { ...handoff.fields, search: JSON.stringify(next) } };
}
