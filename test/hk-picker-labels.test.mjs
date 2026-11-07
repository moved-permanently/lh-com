/* eslint-disable max-len */
/* lufthansa.com's hk pages (xx/hk, hk/hk, cn/hk, tw/hk: path language hk, Traditional Chinese): the flight search's
   passenger picker had no hk entry in PASSENGER_LABELS (zh is Simplified Chinese), so every hk page showed it in
   English. Now an hk entry with www's own wording (www.lufthansa.com/hk/hk/homepage with the picker open,
   2026-11-07 11:38 CET), the fare choices (picker-options.js) in www's wording too; no other language changes.
   www's tabs (旅行詳細資訊 / 兌換哩數) and its promo code field are not part of lufthansa.com's dropdown; the
   group link's text is the document's Group booking row.
   Run: node --max-old-space-size=512 --test test/hk-picker-labels.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/xx/hk/flight-search', search: '', href: 'https://lufthansa.turnsthe.page/xx/hk/flight-search', origin: 'https://lufthansa.turnsthe.page',
};
globalThis.window = window;
globalThis.document = document;
const { PASSENGER_LABELS, passengerSummary, createPassengerPicker } = await import('../blocks/flight-search/passenger-picker.js');
const { PICKER_OPTION_LABELS } = await import('../blocks/flight-search/picker-options.js');
const { getLocale } = await import('../scripts/locale.js');

const placeholders = (s) => (String(s).match(/\{[A-Z]+\}/g) || []).sort().join(',');

test('the hk pages\' path language is hk', () => {
  ['/xx/hk/flight-search', '/hk/hk/homepage', '/cn/hk/homepage', '/tw/hk/homepage'].forEach((p) => assert.equal(getLocale(p).lang, 'hk', p));
});

test('PASSENGER_LABELS.hk: every en key with its placeholders, www\'s Traditional Chinese wording', () => {
  const { hk } = PASSENGER_LABELS;
  assert.ok(hk, 'an hk entry');
  Object.keys(PASSENGER_LABELS.en).forEach((k) => {
    assert.ok(k in hk, k);
    assert.equal(placeholders(hk[k]), placeholders(PASSENGER_LABELS.en[k]), k);
  });
  assert.deepEqual(
    ['passengers label', 'cabin label', 'economy label', 'premium economy label', 'business label', 'first label', 'adults label', 'children label', 'children hint', 'infants label', 'infants hint', 'done label'].map((k) => hk[k]),
    ['調整旅客和預訂艙等選擇。', '旅行艙等', '經濟艙', '優選經濟艙', '商務艙', '頭等', '成人', '兒童', '(2 至 11 歲)', '嬰兒不佔位', '(0 - 23 個月)', '儲存'],
  );
  assert.equal(passengerSummary(hk, 'E', { adults: 1, children: 0, infants: 0 }), '經濟艙, 1 旅客');
  assert.equal(passengerSummary(hk, 'B', { adults: 2, children: 1, infants: 0 }), '商務艙, 3 旅客');
});

test('the fare choices in www\'s hk wording', () => {
  const { hk } = PICKER_OPTION_LABELS;
  assert.deepEqual(
    ['fare label', 'fare question', 'fare default label', 'fare coupon label', 'fare high label'].map((k) => hk[k]),
    ['其他票價選擇', '您想要什麼樣的票價優惠?', '最佳票價優惠', '變更航班次序', '彈性/最高等級預訂艙等以累積更多哩程'],
  );
});

test('the picker on an hk page: www\'s texts, no English', () => {
  const picker = createPassengerPicker({
    labels: { ...PASSENGER_LABELS.hk, ...PICKER_OPTION_LABELS.hk }, cabins: ['E', 'P', 'B', 'F'], value: { adults: 1, cabin: 'E' }, farePreference: true,
  });
  const text = picker.element.textContent;
  assert.match(text, /經濟艙, 1 旅客/);
  ['成人', '兒童', '(2 至 11 歲)', '嬰兒不佔位', '旅行艙等', '優選經濟艙', '其他票價選擇', '儲存'].forEach((t) => assert.ok(text.includes(t), t));
  assert.doesNotMatch(text, /Adults|Children|Infants|Economy|Done/);
});

test('Simplified Chinese (zh) as it was', () => {
  assert.equal(PASSENGER_LABELS.zh['children label'], '儿童');
  assert.equal(PASSENGER_LABELS.zh['traveller summary'], '{CABIN}，{COUNT}位乘客');
  assert.equal(PICKER_OPTION_LABELS.zh['fare label'], '选择其他票价');
});
