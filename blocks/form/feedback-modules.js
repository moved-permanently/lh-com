import { getLocale } from '../../scripts/locale.js';
import { lhFetch } from '../../scripts/lh-data.js';

/*
 * Topic-dependent sections of the lufthansa.com feedback form (dcep-feedback-form). The live
 * app reads which modules a topic shows from /service/api/catalogs/feedbackForm (topic catID ->
 * module letters, e.g. 109 -> A, O, F) and every text from /service/api/labels/feedbackform
 * (plus labels/common for the salutations and the file picker). The module layouts below
 * mirror the live app's module components (fields, order, optional flags); no text is
 * written here: a module whose headline label is missing is not shown.
 *
 * Not rendered: F (no component on the live site either), C/D/N (flight data with airline
 * and airport catalogs), E/Q/R/S (refund and voucher forms) and the address and phone part
 * of B/P (countries catalog), none of which the current topics use.
 */

const FB = 'feedbackform.';

/** Module letter -> section definition. Field: [type, name, label key, required, extra]. */
const MODULES = {
  A: {
    headline: 'moduleA.common.headline',
    description: 'moduleA.common.subheadline',
    fields: [['textarea', 'feedback-text', 'moduleA.form.comment.label', true, { help: 'moduleA.form.comment.hint' }]],
  },
  // contact data (B with address and phone, O without, P with optional phone)
  O: {
    headline: 'moduleB.common.headline',
    description: 'moduleB.common.subheadline',
    fields: [
      ['select', 'salutation', 'moduleB.form.salutation.label', true, { options: 'salutations' }],
      ['text', 'first-name', 'moduleB.form.firstName.label', true],
      ['text', 'last-name', 'moduleB.form.lastName.label', true],
      ['email', 'email', 'moduleB.form.email.label', true],
      ['email', 'email-repeat', 'moduleB.form.emailRepeat.label', true],
      ['text', 'miles-and-more', 'moduleB.form.customerMilesAndMoreLabel', false],
    ],
  },
  G: {
    headline: 'moduleG.common.headline',
    description: 'moduleG.common.subheadline',
    fields: [
      ['radio', 'booking-flag', '', false, {
        options: [['booking', 'moduleG.form.BookingFlagTicket'], ['fileKey', 'moduleG.form.BookingFlagFileKey']],
        checked: 'booking',
        controls: 'booking-value',
      }],
      ['text', 'booking-value', 'moduleG.form.BookingFlagTicket', true],
    ],
  },
  H: {
    headline: 'moduleH.common.headline',
    description: 'moduleH.common.subheadline',
    fields: [['text', 'feedback-id', 'moduleH.form.BrowserLabel', false]],
  },
  I: {
    headline: 'moduleI.common.headline',
    description: 'moduleI.common.subheadline',
    fields: [['file', 'attachments', 'common.fileupload.default.selectFile', false, {
      help: 'moduleI.form.filehint', accept: 'config.attachment.fileType', multiple: true,
    }]],
  },
  J: {
    headline: 'moduleJ.common.headline',
    description: 'moduleJ.common.subheadline',
    fields: [
      ['text', 'browser', 'moduleJ.form.BrowserLabel', false],
      ['text', 'operating-system', 'moduleJ.form.OpSysLabel', false],
    ],
  },
  L: {
    headline: 'FeedbackFormL.common.headline',
    description: 'FeedbackFormL.common.description',
    fields: [['text', 'baggage-id', 'FeedbackFormL.form.baggageId.label', false]],
  },
  M: {
    headline: 'moduleM.common.headline',
    description: 'moduleM.common.subheadline',
    fields: [
      ['text', 'account-holder', 'moduleM.form.AccountHolderLabel', false],
      ['text', 'bank-name', 'moduleM.form.BankNameLabel', false],
      ['text', 'iban', 'moduleM.form.IbanLabel', false],
      ['text', 'bic', 'moduleM.form.BicLabel', false],
    ],
  },
};
MODULES.B = MODULES.O;
MODULES.P = MODULES.O;

/** Resolves the ICU select of the submit label: {FORMID, select, VOUC {...} other {...}}. */
export function icuSelect(text, key, value) {
  const head = new RegExp(`^\\{\\s*${key}\\s*,\\s*select\\s*,`);
  const source = (text || '').trim();
  if (!head.test(source)) return source;
  const cases = {};
  const body = source.replace(head, '');
  const re = /([\w-]+)\s*\{([^{}]*)\}/g;
  let m = re.exec(body);
  while (m) {
    cases[m[1]] = m[2].trim();
    m = re.exec(body);
  }
  return cases[value] ?? cases.other ?? '';
}

let dataPromise;

/**
 * Loads the topic catalog and the labels of the page's market (live, else recorded).
 * @returns {Promise<{topics: Map<string, {formId: string, modules: string[]}>,
 *   labels: Object<string, string>, sources: Object<string, string>}>}
 */
export function loadFeedbackData() {
  if (!dataPromise) {
    const { lang } = getLocale();
    const get = (route) => lhFetch(route).then(
      (r) => ({ data: r.data, source: r.source }),
      () => ({ data: null, source: 'none' }),
    );
    dataPromise = Promise.all([
      get('/service/api/catalogs/feedbackForm'),
      get(`/service/api/labels/feedbackform/lh/${lang}`),
      get(`/service/api/labels/common/lh/${lang}`),
    ]).then(([catalog, labels, common]) => {
      const topics = new Map();
      const items = catalog.data?.categories?.listitems || [];
      items.forEach((item) => {
        const id = item?.value?.catID;
        if (!id) return;
        topics.set(String(id), {
          formId: item.value.formID || '',
          modules: (item.categories?.listitems || []).map((m) => m.label).filter(Boolean),
        });
      });
      return {
        topics,
        labels: { ...(common.data || {}), ...(labels.data || {}) },
        sources: {
          'catalogs/feedbackForm': catalog.source,
          'labels/feedbackform': labels.source,
          'labels/common': common.source,
        },
      };
    });
  }
  return dataPromise;
}

/** Numbered labels key[0], key[1], ... in order. */
function labelList(labels, key) {
  const out = [];
  for (let i = 0; labels[`${key}[${i}]`]; i += 1) out.push(labels[`${key}[${i}]`]);
  return out;
}

/**
 * The sections a topic shows, as plain definitions for the form block.
 * @returns {{steps: Array<{title: string, description: string, fields: Array<Object>}>,
 *   submit: string}}
 */
export function topicSections(data, topicId) {
  const topic = data.topics.get(String(topicId));
  if (!topic) return { steps: [], submit: '' };
  const { labels } = data;
  const t = (key) => (key ? (labels[key.startsWith('common.') ? key : FB + key] || '').trim() : '');
  const steps = [];
  const seen = new Set();
  topic.modules.forEach((letter) => {
    const module = MODULES[letter];
    if (!module || seen.has(module) || !t(module.headline)) return;
    seen.add(module);
    const fields = module.fields.map(([type, name, labelKey, required, extra = {}]) => {
      let options = [];
      if (extra.options === 'salutations') {
        options = labelList(labels, 'common.user.salutation.placeholder').map((l) => [l, l]);
      } else if (Array.isArray(extra.options)) {
        options = extra.options.map(([value, key]) => [value, t(key)]).filter(([, l]) => l);
      }
      return {
        type,
        name,
        label: t(labelKey),
        required,
        options,
        help: t(extra.help),
        accept: t(extra.accept),
        multiple: !!extra.multiple,
        checked: extra.checked,
        controls: extra.controls,
      };
    }).filter((f) => f.label || f.options.length);
    steps.push({ title: t(module.headline), description: t(module.description), fields });
  });
  return { steps, submit: icuSelect(t('page.default.submit'), 'FORMID', topic.formId) };
}
