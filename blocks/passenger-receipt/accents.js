/*
 * www's accented-character tables of the passenger receipt form (www.lufthansa.com's
 * passenger-receipt-portal script, 2026-11-06): on leaving a name field its letters are replaced
 * by these, by the table whose name is the page language (www compares it with the language,
 * e.g. de; "default" otherwise). Pairs in www's order; a character listed twice takes the later
 * (www builds a map from the list). Generated from the captured script; not edited by hand.
 */
/** The default table: [accented, plain], ... */
export const DEFAULT_ACCENTS = [
  ['/', ' '],
  ['.', ' '],
  [',', ' '],
  ['#', ' '],
  ['&', ' '],
  ['-', ' '],
  ['Š', 'S'],
  ['Œ', 'OE'],
  ['Ž', 'Z'],
  ['š', 's'],
  ['œ', 'oe'],
  ['ž', 'z'],
  ['Ÿ', 'Y'],
  ['Ÿ', 'z'],
  ['£', 'L'],
  ['¥', 'A'],
  ['ª', 'a'],
  ['¯', 'Z'],
  ['³', 'l'],
  ['¹', 'a'],
  ['¿', 'z'],
  ['À', 'A'],
  ['à', 'a'],
  ['Á', 'A'],
  ['á', 'a'],
  ['Â', 'A'],
  ['â', 'a'],
  ['Ã', 'A'],
  ['ã', 'a'],
  ['Ä', 'A'],
  ['ä', 'a'],
  ['Å', 'A'],
  ['å', 'a'],
  ['Æ', 'AE'],
  ['æ', 'ae'],
  ['Ç', 'C'],
  ['ç', 'c'],
  ['È', 'E'],
  ['è', 'e'],
  ['É', 'E'],
  ['é', 'e'],
  ['Ê', 'E'],
  ['ê', 'e'],
  ['Ë', 'E'],
  ['ë', 'e'],
  ['Ì', 'I'],
  ['ì', 'i'],
  ['Í', 'I'],
  ['í', 'i'],
  ['Î', 'I'],
  ['î', 'i'],
  ['Ï', 'I'],
  ['ï', 'i'],
  ['Ñ', 'N'],
  ['ñ', 'n'],
  ['Ò', 'O'],
  ['ò', 'o'],
  ['Ó', 'O'],
  ['ó', 'o'],
  ['Ô', 'O'],
  ['ô', 'o'],
  ['Õ', 'O'],
  ['õ', 'o'],
  ['Ö', 'O'],
  ['ö', 'o'],
  ['Ø', 'O'],
  ['ø', 'o'],
  ['ß', 'ss'],
  ['Ù', 'U'],
  ['ù', 'u'],
  ['Ú', 'U'],
  ['ú', 'u'],
  ['Û', 'U'],
  ['û', 'u'],
  ['Ü', 'U'],
  ['ü', 'u'],
  ['Ý', 'Y'],
  ['ý', 'y'],
  ['ÿ', 'y'],
  ['Ð', 'D'],
  ['ð', 'd'],
  ['Þ', 'TH'],
  ['þ', 'th'],
];

/** Per table name (www's language list, lower case): changed pairs and removed characters. */
export const ACCENT_TABLES = {
  ar: { set: [['\u008F', 'Z']], drop: [] },
  de: { set: [['\u008F', 'Z'], ['Ä', 'AE'], ['ä', 'ae'], ['Ö', 'OE'], ['ö', 'oe'], ['Ü', 'UE'], ['ü', 'ue']], drop: [] },
  ch: { set: [['\u008F', 'Z'], ['Ä', 'AE'], ['ä', 'ae'], ['Ö', 'OE'], ['ö', 'oe'], ['Ü', 'UE'], ['ü', 'ue']], drop: [] },
  at: { set: [['\u008F', 'Z'], ['Ä', 'AE'], ['ä', 'ae'], ['Ö', 'OE'], ['ö', 'oe'], ['Ü', 'UE'], ['ü', 'ue']], drop: [] },
  gb: { set: [['\u008F', 'Z']], drop: ['Š', 'ž', 'ª', 'Ï'] },
  es: { set: [['\u008F', 'Z'], ['ª', '']], drop: [] },
  fr: { set: [['\u008F', 'Z']], drop: [] },
  it: { set: [['\u008F', 'Z']], drop: [] },
  jp: { set: [['\u008F', 'Z']], drop: [] },
  nl: { set: [['\u008F', 'Z']], drop: [] },
  ru: { set: [['\u008F', 'Z']], drop: [] },
};

/** The table of a page language: { accented: plain }. */
export function accentMap(lang) {
  const map = Object.fromEntries(DEFAULT_ACCENTS);
  const own = ACCENT_TABLES[String(lang || '').toLowerCase()];
  if (!own) return map;
  own.drop.forEach((c) => { delete map[c]; });
  own.set.forEach(([a, b]) => { map[a] = b; });
  return map;
}

/** A name with the accented characters of the language's table replaced, as www. */
export function convertAccents(value, lang) {
  const map = accentMap(lang);
  return String(value).replace(/./gu, (c) => (c in map ? map[c] : c));
}
