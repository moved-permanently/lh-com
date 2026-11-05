/**
 * Accessible airport autocomplete (ARIA 1.2 combobox with a listbox popup).
 * Used by flight-search and destination-finder. It knows nothing about the API: the block
 * passes fetchSuggestions(term) returning [{ code, name, label }]. Optional (booking-box): minChars
 * (0: the list opens on focus, as www.flytap.com's: filtered to the field's text, then to what is
 * typed, none for an empty field), renderOption(airport, li) and display(airport) for the option's
 * content and the field's text; without them as before.
 */

let comboboxCount = 0;

const DEBOUNCE_MS = 250;
const MIN_CHARS = 2;

/**
 * Text shown in the input for an airport.
 * @param {{code: string, name?: string}} airport
 * @returns {string}
 */
export function airportDisplay(airport) {
  if (!airport || !airport.code) return '';
  return airport.name ? `${airport.name} (${airport.code})` : airport.code;
}

/**
 * Creates an airport combobox.
 * @param {Object} options
 * @param {string} options.label visible label
 * @param {string} [options.name] form field name
 * @param {string} [options.placeholder]
 * @param {{code: string, name?: string}} [options.value] initial airport
 * @param {function(string): Promise<Array<{code: string, name?: string, label?: string}>>}
 *   options.fetchSuggestions
 * @param {function({code: string, name?: string}|null): void} [options.onChange]
 * @param {string} [options.noResultsLabel] announced when nothing matches
 * @param {number} [options.minChars] characters before a search (default 2; 0: on focus too,
 *   with the field's text)
 * @param {function(Object, HTMLLIElement): void} [options.renderOption] fills an option (default:
 *   its label, else "name (code)")
 * @param {function(Object): string} [options.display] the field's text (default airportDisplay)
 * @returns {{element: HTMLElement, input: HTMLInputElement, getValue: function,
 *   setValue: function, focus: function}}
 */
export function createAirportCombobox({
  label, name, placeholder, value, fetchSuggestions, onChange, noResultsLabel = '',
  minChars = MIN_CHARS, renderOption, display = airportDisplay,
}) {
  comboboxCount += 1;
  const id = `airport-combobox-${comboboxCount}`;
  let current = value && value.code ? { ...value } : null;
  let options = [];
  let active = -1;
  let timer;
  let requestId = 0;

  const wrapper = document.createElement('div');
  wrapper.className = 'airport-combobox';

  const labelEl = document.createElement('label');
  labelEl.htmlFor = `${id}-input`;
  labelEl.textContent = label || '';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = `${id}-input`;
  if (name) input.name = name;
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', `${id}-listbox`);
  if (placeholder) input.placeholder = placeholder;
  input.value = display(current);

  const listbox = document.createElement('ul');
  listbox.id = `${id}-listbox`;
  listbox.setAttribute('role', 'listbox');
  if (label) listbox.setAttribute('aria-label', label);
  listbox.hidden = true;

  const status = document.createElement('span');
  status.className = 'airport-combobox-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  wrapper.append(labelEl, input, listbox, status);

  function close() {
    listbox.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  }

  function setActive(index) {
    const items = [...listbox.children];
    items.forEach((li, i) => li.setAttribute('aria-selected', i === index ? 'true' : 'false'));
    active = index;
    if (items[index]) {
      input.setAttribute('aria-activedescendant', items[index].id);
      items[index].scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function setValue(airport, { silent = false } = {}) {
    current = airport && airport.code ? { ...airport } : null;
    input.value = display(current);
    wrapper.dataset.code = current ? current.code : '';
    if (!silent && onChange) onChange(current);
  }

  function select(index) {
    const airport = options[index];
    if (!airport) return;
    setValue(airport);
    close();
  }

  function render(list) {
    options = list;
    listbox.replaceChildren(...list.map((airport, i) => {
      const li = document.createElement('li');
      li.id = `${id}-option-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.dataset.code = airport.code;
      if (renderOption) renderOption(airport, li);
      else li.textContent = airport.label || airportDisplay(airport);
      // mousedown keeps focus in the input so blur does not close the list first
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        select(i);
      });
      return li;
    }));
    const open = list.length > 0;
    listbox.hidden = !open;
    input.setAttribute('aria-expanded', open ? 'true' : 'false');
    status.textContent = open ? '' : noResultsLabel;
    active = -1;
  }

  async function search(term) {
    requestId += 1;
    const mine = requestId;
    let list = [];
    try {
      list = (await fetchSuggestions(term)) || [];
    } catch (e) {
      list = [];
    }
    if (mine === requestId && document.activeElement === input) {
      render(list.filter((a) => a && a.code));
    }
  }

  input.addEventListener('input', () => {
    clearTimeout(timer);
    const term = input.value.trim();
    // nothing typed: no list (minChars 0 as www.flytap.com: no airport list for an empty field)
    if (!term || term.length < minChars) {
      render([]);
      status.textContent = '';
      return;
    }
    timer = setTimeout(() => search(term), DEBOUNCE_MS);
  });

  input.addEventListener('keydown', (e) => {
    const count = options.length;
    if (e.key === 'ArrowDown' && count) {
      e.preventDefault();
      if (listbox.hidden) render(options);
      setActive((active + 1) % count);
    } else if (e.key === 'ArrowUp' && count) {
      e.preventDefault();
      setActive(active <= 0 ? count - 1 : active - 1);
    } else if (e.key === 'Enter' && !listbox.hidden && active >= 0) {
      e.preventDefault();
      select(active);
    } else if (e.key === 'Escape') {
      close();
    }
  });

  input.addEventListener('focus', () => {
    input.select();
    // minChars 0: the list as soon as the field has the focus, filtered to the field's text (its
    // value's "Lisboa, Portugal"), as www.flytap.com's; an empty field none
    const term = input.value.trim();
    if (minChars === 0 && term) search(term);
  });

  input.addEventListener('blur', () => {
    close();
    // typed text that was not picked from the list: keep a typed code, otherwise restore
    const typed = input.value.trim();
    if (/^[A-Za-z]{3}$/.test(typed)) {
      if (!current || current.code !== typed.toUpperCase()) setValue({ code: typed.toUpperCase() });
    } else if (!typed) {
      setValue(null);
    } else {
      input.value = display(current);
    }
  });

  wrapper.dataset.code = current ? current.code : '';

  return {
    element: wrapper,
    input,
    getValue: () => current,
    setValue,
    focus: () => input.focus(),
  };
}
