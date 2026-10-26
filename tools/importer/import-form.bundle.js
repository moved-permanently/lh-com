/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-form.js
  var tmp_bundle_form_695937_exports = {};
  __export(tmp_bundle_form_695937_exports, {
    default: () => tmp_bundle_form_695937_default
  });

  // tools/importer/parsers/form-core.js
  var HEADER = [
    "Label",
    "Type",
    "Name",
    "Required",
    "Options",
    "Help text",
    "Placeholder",
    "Validation message",
    "Constraint message",
    "Rules"
  ];
  var COLUMNS = [
    "label",
    "type",
    "name",
    "required",
    "options",
    "help",
    "placeholder",
    "message",
    "constraint",
    "rules"
  ];
  var FORM_IDS = {
    "anmeldung-tiere-frachtraum": "anmeldung-tiere-frachtraum",
    "refund-form": "refund-form",
    "feedback-past-flight": "feedback-past-flight",
    "register-ammunition": "register-ammunition",
    "register-animal-cabin": "register-animal-cabin",
    "special-needs": "special-needs",
    betreuungsbedarf: "special-needs",
    "add-sports-baggage": "add-sports-baggage",
    "sportgepaeck-hinzufuegen": "add-sports-baggage",
    "group-travel": "group-travel",
    "passenger-receipt-90": "passenger-receipt-90"
  };
  var ERROR_PAGE = "/error.html";
  function parse(element, { document, url, params }) {
    const form = element.matches("form") ? element : element.querySelector("form.cmp-form");
    if (!form) return;
    const clean2 = (s) => String(s || "").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
    const text = (el) => el ? clean2(el.textContent) : "";
    const attr = (el, name) => el ? clean2(el.getAttribute(name)) : "";
    const has = (el, name) => !!el && el.hasAttribute(name) && el.getAttribute(name) !== "false";
    const rows = [];
    const done = /* @__PURE__ */ new Set();
    const cell = (value) => {
      if (value == null || value === "") return "";
      if (typeof value !== "string" && !Array.isArray(value)) return value;
      const lines = (Array.isArray(value) ? value : [value]).map((l) => String(l)).filter((l) => l !== "");
      if (!lines.length) return "";
      const nodes = [];
      lines.forEach((l, i) => {
        if (i) nodes.push(document.createElement("br"));
        nodes.push(document.createTextNode(l));
      });
      return nodes;
    };
    const add = (row) => rows.push(COLUMNS.map((c) => cell(row[c])));
    const wrapperOf = (field) => field.closest(".cmp-form-text, [data-cmp-type]");
    const requiredOf = (field, wrapper) => {
      if (has(field, "required") || wrapper && has(wrapper, "data-cmp-required")) return "yes";
      return attr(field, "optional");
    };
    const messageOf = (field, wrapper, fieldFirst) => {
      const own = attr(field, "data-customerror");
      const wrap = attr(wrapper, "data-cmp-required-message");
      return fieldFirst ? own || wrap : wrap || own;
    };
    let repeatSuffix = null;
    const nameOf = (field) => {
      const n = attr(field, "name");
      return repeatSuffix && n.endsWith(repeatSuffix) ? n.slice(0, -repeatSuffix.length) : n;
    };
    function textField(field, type) {
      const wrapper = wrapperOf(field);
      const rules = [];
      const pattern = attr(field, "pattern") || attr(wrapper, "data-cmp-pattern");
      if (pattern) rules.push(`pattern=${pattern}`);
      const maxlength = attr(field, "maxlength");
      if (maxlength) rules.push(`maxlength=${maxlength}`);
      const inputmode = attr(field, "inputmode");
      if (inputmode && inputmode !== "text") rules.push(`inputmode=${inputmode}`);
      if (attr(field, "type") === "pnr") rules.push("uppercase");
      return {
        label: attr(field, "label"),
        type,
        name: nameOf(field),
        required: requiredOf(field, wrapper),
        help: attr(field, "hint"),
        message: messageOf(field, wrapper, false),
        constraint: attr(wrapper, "data-cmp-constraint-message"),
        rules
      };
    }
    function input(field) {
      const t = attr(field, "type");
      add(textField(field, t === "email" ? "email" : t === "tel" ? "tel" : "text"));
    }
    function date(masked) {
      const field = masked.querySelector("maui-input");
      if (!field) return;
      const row = textField(field, "date");
      const mask = attr(masked, "mask");
      row.rules = mask ? [`mask=${mask}`] : [];
      add(row);
    }
    function street(box) {
      const field = box.querySelector('input:not([type="hidden"])');
      if (!field) return;
      const wrapper = wrapperOf(box);
      add({
        label: text(box.querySelector("label")) || attr(field, "placeholder"),
        type: "text",
        name: nameOf(field),
        required: requiredOf(field, wrapper),
        message: messageOf(field, wrapper, false),
        constraint: attr(wrapper, "data-cmp-constraint-message")
      });
    }
    function textarea(field) {
      const wrapper = wrapperOf(field);
      const rowCount = attr(field, "rows");
      add({
        label: attr(field, "label"),
        type: "textarea",
        name: nameOf(field),
        required: requiredOf(field, wrapper),
        help: attr(field, "hint"),
        message: attr(wrapper, "data-cmp-required-message") || attr(field, "errormessage") || attr(field, "customerrormessage"),
        constraint: attr(wrapper, "data-cmp-constraint-message"),
        rules: rowCount ? [`rows=${rowCount}`] : []
      });
    }
    function select(field) {
      const wrapper = wrapperOf(field);
      const options = [...field.querySelectorAll("maui-option")].filter((o) => !o.hasAttribute("disabled")).map((o) => `${clean2(o.getAttribute("optionvalue") || "")}=${text(o)}${o.hasAttribute("selected") ? " {selected}" : ""}`);
      add({
        label: attr(field, "buttontriggerlabel") || attr(field, "label"),
        type: "select",
        name: nameOf(field),
        required: requiredOf(field, wrapper),
        options,
        help: attr(field, "hint"),
        message: messageOf(field, wrapper, true)
      });
    }
    function region(box) {
      const field = box.querySelector("maui-select");
      if (!field) return;
      const country = box.closest(".countrydropdown");
      const countrySelect = country && country.querySelector("maui-select.forms-country-dropdown-select");
      add({
        label: attr(field, "buttontriggerlabel"),
        type: "region",
        name: nameOf(field),
        required: has(box, "data-cmp-required") || has(field, "required") ? "yes" : "",
        placeholder: attr(field, "data-empty-option"),
        message: attr(field, "data-customerror") || attr(box, "data-cmp-required-message"),
        rules: countrySelect ? [`country=${nameOf(countrySelect)}`] : []
      });
    }
    function radio(group) {
      const wrapper = wrapperOf(group);
      const radios = [...group.querySelectorAll("maui-radio")];
      const required = has(group, "required") || radios.some((r) => has(r, "required")) || wrapper && has(wrapper, "data-cmp-required");
      add({
        label: attr(group, "label"),
        type: "radio",
        name: nameOf(group) || nameOf(radios[0] || group),
        required: required ? "yes" : attr(group, "optional"),
        options: radios.map((r) => `${clean2(r.getAttribute("value") || "")}=${text(r) || attr(r, "label")}`),
        help: attr(group, "hint"),
        message: messageOf(group, wrapper, true) || attr(radios[0], "data-customerror")
      });
    }
    function checkbox(box) {
      const boxes = [...box.querySelectorAll("maui-checkbox")];
      if (!boxes.length) return;
      const wrapper = box.matches("[data-cmp-type]") ? box : wrapperOf(box);
      const targets = [...new Set(boxes.map((b) => attr(b, "data-target")).filter(Boolean))];
      const required = boxes.some((b) => has(b, "required")) || wrapper && has(wrapper, "data-cmp-required");
      const heading = box.querySelector(".form-group-headline");
      add({
        label: text(heading),
        type: "checkbox",
        name: nameOf(boxes[0]),
        required: required ? "yes" : "",
        options: boxes.map((b) => `${clean2(b.getAttribute("value") || "")}=${attr(b, "label") || text(b) || attr(b, "data-aria-label")}`),
        message: attr(boxes[0], "data-customerror") || attr(wrapper, "data-cmp-required-message"),
        rules: targets.length ? [`toggles=${targets.join(", ")}`] : []
      });
    }
    function stepper(field) {
      const wrapper = wrapperOf(field);
      const rules = [];
      ["min", "max"].forEach((k) => {
        if (attr(field, k)) rules.push(`${k}=${attr(field, k)}`);
      });
      if (attr(field, "selected")) rules.push(`value=${attr(field, "selected")}`);
      add({
        label: attr(field, "label"),
        type: "stepper",
        name: nameOf(field),
        required: requiredOf(field, wrapper),
        help: attr(field, "hint"),
        message: attr(wrapper, "data-cmp-required-message") || attr(field, "errormessage"),
        rules
      });
    }
    function autocomplete(field) {
      const wrapper = wrapperOf(field);
      add({
        label: attr(field, "buttontriggerlabel") || attr(field, "label"),
        type: "autocomplete",
        name: nameOf(field),
        required: requiredOf(field, wrapper),
        help: attr(field, "hint"),
        message: attr(field, "data-customerror") || attr(wrapper, "data-cmp-required-message") || attr(field, "errormessage")
      });
    }
    function file(zone) {
      let config2 = {};
      try {
        config2 = JSON.parse(zone.getAttribute("data-forms-filedrop") || "{}") || {};
      } catch (e) {
        config2 = {};
      }
      const hidden = zone.querySelector('input[name$="-fileIds"]');
      const optional = config2.optional === true || config2.optional === "true";
      const rules = [];
      if (config2.acceptedFiles) rules.push(`accept=${clean2(config2.acceptedFiles)}`);
      if (config2.maxFiles) rules.push(`max-files=${clean2(config2.maxFiles)}`);
      if (config2.maxFileSize) rules.push(`max-size=${clean2(config2.maxFileSize)}`);
      if (config2.notAllowedCharacters) rules.push(`not-allowed=${clean2(config2.notAllowedCharacters)}`);
      add({
        label: text(zone.querySelector(".filedrop-desc > div:first-child")),
        type: "file",
        name: hidden ? attr(hidden, "name").replace(/-fileIds$/, "") : "",
        required: optional ? text(zone.querySelector(".hint")) || "optional" : "yes",
        help: text(zone.querySelector("p.footnote, #forms-filedrop-hint")),
        placeholder: text(zone.querySelector("maui-button")),
        message: clean2(config2.requiredError),
        rules
      });
    }
    function note(rt) {
      const div = document.createElement("div");
      const clone = rt.cloneNode(true);
      clone.querySelectorAll(".sr-only, .visually-hidden, script, style").forEach((n) => n.remove());
      clone.querySelectorAll("table").forEach((t) => {
        const cells2 = t.querySelectorAll("td, th");
        if (cells2.length === 1) t.replaceWith(...cells2[0].childNodes);
      });
      div.append(...clone.childNodes);
      if (!clean2(div.textContent) && !div.querySelector("img, a[href]")) return;
      const content = [...div.childNodes].filter((n) => n.nodeType === 1 || clean2(n.textContent));
      rows.push(COLUMNS.map((c) => c === "label" ? content : c === "type" ? cell("note") : ""));
    }
    function fieldset(sub) {
      const fs = sub.querySelector(":scope > fieldset") || sub.querySelector("fieldset");
      const name = (sub.id || "").replace(/^subsection-/, "");
      if (!fs) return;
      const hidden = sub.classList.contains("collapse") || sub.classList.contains("d-none");
      add({ label: text(fs.querySelector("legend")), type: "fieldset", name, rules: hidden ? ["hidden"] : [] });
      [...fs.children].forEach((c) => {
        if (c.tagName !== "LEGEND") visit(c);
      });
      add({ type: "end" });
    }
    function repeatable(sub) {
      const sets = [...sub.querySelectorAll(":scope > fieldset")];
      if (!sets.length) return;
      const n = sets.length;
      const legend = text(sets[0].querySelector("legend"));
      const add_ = text(sub.querySelector(".forms-repeat-add"));
      const removeBtn = sub.querySelector("button.forms-repeat-hide[aria-label], .forms-repeat-hide[aria-label]");
      const remainingEl = sub.querySelector("p.forms-repeat-remaining, .forms-repeat-remaining");
      let remaining = "";
      if (remainingEl) {
        const counter = remainingEl.querySelector(".forms-repeat-counter");
        if (counter) {
          const c = remainingEl.cloneNode(true);
          c.querySelector(".forms-repeat-counter").replaceWith(document.createTextNode("{n}"));
          remaining = text(c);
        } else {
          const t = text(remainingEl);
          const re = new RegExp(`(^|[^0-9])${n - 1}(?![0-9])`);
          remaining = re.test(t) ? t.replace(re, "$1{n}") : t;
        }
      }
      const rules = [`repeat=${n}`];
      if (add_) rules.push(`add=${add_}`);
      if (removeBtn) rules.push(`remove=${attr(removeBtn, "aria-label")}`);
      if (remaining) rules.push(`remaining=${remaining}`);
      add({
        label: legend.replace(/(\d+)(?!.*\d)/, "{n}"),
        type: "fieldset",
        name: (sub.id || "").replace(/^subsection-/, ""),
        rules
      });
      repeatSuffix = "_1";
      [...sets[0].children].forEach((c) => {
        if (c.tagName === "LEGEND" || c.matches(".forms-repeat-hide, button")) return;
        visit(c);
      });
      repeatSuffix = null;
      add({ type: "end" });
    }
    function visit(el) {
      if (!el || el.nodeType !== 1) return;
      if (el.matches("input, template, script, style, .forms-repeat-add, .forms-repeat-remaining, .forms-repeat-hide")) return;
      if (el.matches(".form-section") && el.querySelector(":scope .form-section-headline")) {
        const description = el.querySelector(".form-section-description");
        const help = description ? document.createElement("div") : null;
        if (help) help.append(...description.cloneNode(true).childNodes);
        rows.push(COLUMNS.map((c) => {
          if (c === "label") return cell(text(el.querySelector(".form-section-headline")));
          if (c === "type") return cell("step");
          if (c === "help") return help && clean2(help.textContent) ? [...help.childNodes] : "";
          return "";
        }));
        const content = el.querySelector(".form-section-content") || el;
        [...content.children].forEach(visit);
        return;
      }
      if (el.matches('div.forms-repeatable-section[id^="subsection-"]')) {
        repeatable(el);
        return;
      }
      if (el.matches('div[id^="subsection-"]')) {
        fieldset(el);
        return;
      }
      if (el.matches(".richtext")) {
        note(el);
        return;
      }
      if (el.matches('[data-cmp-type="checkbox"]')) {
        checkbox(el);
        return;
      }
      if (el.matches(".forms-region-dropdown-wrapper")) {
        region(el);
        return;
      }
      if (el.matches("maui-radio-group")) {
        radio(el);
        return;
      }
      if (el.matches("maui-select")) {
        select(el);
        return;
      }
      if (el.matches("maui-masked-input")) {
        date(el);
        return;
      }
      if (el.matches("maui-textarea")) {
        textarea(el);
        return;
      }
      if (el.matches("maui-stepper")) {
        stepper(el);
        return;
      }
      if (el.matches("maui-autocomplete")) {
        autocomplete(el);
        return;
      }
      if (el.matches(".streetAddress")) {
        street(el);
        return;
      }
      if (el.matches("maui-input")) {
        input(el);
        return;
      }
      if (el.matches("section.forms-filedrop")) {
        file(el);
        return;
      }
      if (el.matches("maui-checkbox") && !done.has(el.parentElement)) {
        done.add(el.parentElement);
        checkbox(el.parentElement);
        return;
      }
      if (el.matches('#submit-btn, maui-button[behavior="submit"], button[type="submit"]')) {
        add({ label: text(el) || attr(el, "label"), type: "submit" });
        return;
      }
      [...el.children].forEach(visit);
    }
    [...form.children].forEach(visit);
    const pathOf = (u) => {
      try {
        return new URL(u, "https://www.lufthansa.com/").pathname;
      } catch (e) {
        return "";
      }
    };
    const pageName = (p) => String(p || "").replace(/\/+$/, "").split("/").pop().replace(/\.html?$/, "");
    const formId = FORM_IDS[pageName(pathOf(params && params.originalURL || url || ""))] || FORM_IDS[pageName(pathOf(form.getAttribute("action") || ""))] || "";
    const redirect = attr(form.querySelector('input[name=":redirect"]'), "value");
    const target = pathOf(redirect).match(/^\/content\/lh\/markets(\/[a-z]{2}\/[a-z]{2}\/.+?)(?:\.html)?$/);
    const link = (href) => {
      const a = document.createElement("a");
      a.setAttribute("href", href);
      a.textContent = href;
      return [a];
    };
    const config = (name, value) => rows.push(COLUMNS.map((c) => {
      if (c === "label") return value;
      if (c === "type") return cell("config");
      if (c === "name") return cell(name);
      return "";
    }));
    if (formId) config("form", cell(formId));
    if (target) config("success", link(target[1]));
    config("error", link(ERROR_PAGE));
    const cells = [HEADER, ...rows];
    const block = WebImporter.Blocks.createBlock(document, { name: "Form", variants: ["core"], cells });
    form.replaceWith(block);
  }

  // tools/importer/parsers/hero-campaign.js
  function parse2(element, { document }) {
    const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style';
    const clean2 = (s) => (s || "").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const c = node.cloneNode(true);
      c.querySelectorAll(SKIP).forEach((n) => n.remove());
      return clean2(c.textContent);
    };
    const isBroken3 = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src) || /^(data|blob):/i.test(src);
    const isBr2 = (n) => n && n.nodeType === 1 && n.tagName === "BR";
    const isBlank = (n) => n && n.nodeType === 3 && !clean2(n.nodeValue);
    const trimBreaks = (el) => {
      while (el.lastChild && (isBr2(el.lastChild) || isBlank(el.lastChild))) el.lastChild.remove();
      while (el.firstChild && (isBr2(el.firstChild) || isBlank(el.firstChild))) el.firstChild.remove();
    };
    const info = element.querySelector(".campaign-information") || element;
    const media = [];
    const img = [...element.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")) && !info.contains(i));
    if (img) {
      const image = document.createElement("img");
      image.setAttribute("src", img.getAttribute("src"));
      image.setAttribute("alt", img.getAttribute("alt") || "");
      media.push(image);
    }
    const video = element.querySelector("video[src], video source[src]");
    if (video) {
      const src = video.getAttribute("src");
      const a = document.createElement("a");
      a.setAttribute("href", src);
      a.textContent = src;
      const p = document.createElement("p");
      p.append(a);
      media.push(p);
    }
    const text = [];
    const HEADINGS = "h1, h2, h3, h4, h5, h6";
    const heading = [...info.querySelectorAll(HEADINGS)].find((h) => h.matches(".headline:not(.subheadline)")) || [...info.querySelectorAll(HEADINGS)].find((h) => !h.matches(".subheadline"));
    if (heading && visibleText(heading)) {
      const h = document.createElement(heading.tagName.toLowerCase());
      h.textContent = visibleText(heading);
      text.push(h);
    }
    info.querySelectorAll(".subheadline").forEach((sub) => {
      const t = visibleText(sub);
      if (!t || sub === heading) return;
      const p = document.createElement("p");
      p.textContent = t;
      text.push(p);
    });
    info.querySelectorAll(".information .richtext, .information").forEach((rt) => {
      if (rt.classList.contains("information") && rt.querySelector(".richtext")) return;
      [...rt.children].forEach((n) => {
        if (n.matches(SKIP)) return;
        const c = n.cloneNode(true);
        c.querySelectorAll(SKIP).forEach((s) => s.remove());
        c.removeAttribute("class");
        if (c.tagName === "P") trimBreaks(c);
        if (!clean2(c.textContent) && !c.querySelector("img")) return;
        text.push(c);
      });
    });
    info.querySelectorAll("maui-button-link[href], maui-navigation-link[href], maui-link[href]").forEach((m) => {
      if (m.closest(".richtext")) return;
      const label = visibleText(m) || clean2(m.getAttribute("label"));
      if (!label) return;
      const a = document.createElement("a");
      a.setAttribute("href", m.getAttribute("href"));
      a.textContent = label;
      const p = document.createElement("p");
      const type = m.tagName === "MAUI-BUTTON-LINK" ? m.getAttribute("type") : null;
      if (type === "primary" || type === "secondary") {
        const wrap = document.createElement(type === "primary" ? "strong" : "em");
        wrap.append(a);
        p.append(wrap);
      } else {
        p.append(a);
      }
      text.push(p);
    });
    const cells = [];
    if (media.length) cells.push([media]);
    if (text.length) cells.push([text]);
    const teaser = element.querySelector(".cms-inspiration-teaser") || element;
    const variants = [];
    if (info.classList.contains("alignment-right")) variants.push("right");
    if (info.classList.contains("uplift-animation") || teaser.classList.contains("inspiration-teaser-uplift-animation")) variants.push("card");
    if (teaser.classList.contains("inspiration-teaser-narrow")) variants.push("narrow");
    if (teaser.classList.contains("inspiration-teaser-regular")) variants.push("regular");
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-campaign", variants, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/form.js
  function parse3(element, { document }) {
    const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style';
    const clean2 = (s) => (s || "").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const c = node.cloneNode(true);
      c.querySelectorAll(SKIP).forEach((n) => n.remove());
      return clean2(c.textContent);
    };
    const attr = (el, ...names) => {
      for (const n of names) {
        const v = clean2(el.getAttribute(n));
        if (v) return v;
      }
      return "";
    };
    const GENERIC_NAMES = /^(select|input|textarea|checkbox|radio|field|maui-[a-z-]+)(-?\d+)?$/i;
    const nameOf = (el) => {
      const n = attr(el, "name") || attr(el, "id");
      return n && !GENERIC_NAMES.test(n) ? n : "";
    };
    const isRequired = (el) => el.hasAttribute("required") || el.getAttribute("aria-required") === "true";
    const labelFor = (el) => {
      const id = el.getAttribute("id");
      if (id) {
        try {
          const l = element.querySelector(`label[for="${CSS.escape(id)}"]`);
          if (l && visibleText(l)) return visibleText(l);
        } catch (e) {
        }
      }
      const wrap = el.closest("label");
      if (wrap && visibleText(wrap)) return visibleText(wrap);
      return attr(el, "label", "aria-label", "buttontriggerlabel", "placeholder");
    };
    const optionsCell = (opts) => {
      if (!opts.length) return "";
      if (opts.length === 1) return opts[0];
      return opts.map((o) => {
        const p = document.createElement("p");
        p.textContent = o;
        return p;
      });
    };
    const HEADER2 = ["Label", "Type", "Name", "Required", "Options", "Help text", "Placeholder"];
    const cells = [HEADER2];
    const row = (r) => cells.push([r.label || "", r.type, r.name || "", r.required ? "yes" : "", r.options || "", r.help || "", r.placeholder || ""]);
    const FIELD = 'maui-select, select, maui-input, maui-textarea, textarea, input:not([type="hidden"]):not([type="submit"]):not([type="button"]), maui-checkbox, maui-radio-group, maui-radio-button-group, button[type="submit"], maui-button[type="submit"]';
    const fieldRows = (scope) => {
      const out = [];
      const radioGroups = /* @__PURE__ */ new Set();
      [...scope.querySelectorAll(FIELD)].forEach((f) => {
        if (f.parentElement && f.parentElement.closest("maui-select, maui-input, maui-textarea, maui-checkbox, maui-radio-group, maui-radio-button-group")) return;
        const tag = f.tagName.toLowerCase();
        if (tag === "maui-select" || tag === "select") {
          const opts = [...f.querySelectorAll("maui-option, option")].map((o) => {
            const text = visibleText(o);
            const value = attr(o, "optionvalue", "value");
            if (!text && !value) return "";
            return value && value !== text ? `${value}=${text}` : text;
          }).filter(Boolean);
          const trigger = attr(f, "buttontriggerlabel", "placeholder");
          out.push({ label: labelFor(f) || trigger, type: "select", name: nameOf(f), required: isRequired(f), options: optionsCell(opts), placeholder: trigger, help: attr(f, "hint") });
        } else if (tag === "maui-textarea" || tag === "textarea") {
          out.push({ label: labelFor(f), type: "textarea", name: nameOf(f), required: isRequired(f), placeholder: attr(f, "placeholder"), help: attr(f, "hint") });
        } else if (tag === "maui-checkbox") {
          out.push({ label: visibleText(f) || labelFor(f), type: "checkbox", name: nameOf(f), required: isRequired(f) });
        } else if (tag === "maui-radio-group" || tag === "maui-radio-button-group") {
          const opts = [...f.querySelectorAll('maui-radio-button, maui-radio, input[type="radio"]')].map((o) => {
            const text = visibleText(o) || attr(o, "label");
            const value = attr(o, "value");
            return value && value !== text ? `${value}=${text}` : text;
          }).filter(Boolean);
          out.push({ label: attr(f, "label", "legend") || labelFor(f), type: "radio", name: nameOf(f), required: isRequired(f), options: optionsCell(opts) });
        } else if (tag === "button" || tag === "maui-button") {
          out.push({ label: visibleText(f), type: "submit" });
        } else {
          const type = (attr(f, "type") || "text").toLowerCase();
          if (type === "radio") {
            const group = attr(f, "name");
            if (radioGroups.has(group)) return;
            radioGroups.add(group);
            const radios = group ? [...scope.querySelectorAll(`input[type="radio"][name="${group}"]`)] : [f];
            const opts = radios.map((r) => {
              const t = labelFor(r);
              const v = attr(r, "value");
              return v && v !== t ? `${v}=${t}` : t;
            }).filter(Boolean);
            const fieldset = f.closest("fieldset");
            out.push({ label: visibleText(fieldset && fieldset.querySelector("legend")), type: "radio", name: group, required: isRequired(f), options: optionsCell(opts) });
            return;
          }
          const known = ["text", "email", "tel", "number", "date", "file", "checkbox"];
          out.push({ label: labelFor(f), type: known.includes(type) ? type : "text", name: nameOf(f), required: isRequired(f), placeholder: attr(f, "placeholder"), help: attr(f, "hint") });
        }
      });
      return out;
    };
    const feedbackApp = element.matches(".dcep-feedback-form") || element.querySelector(".dcep-feedback-form");
    let topicSelect = null;
    const sections = [...element.querySelectorAll(".form-section")].filter((s) => !s.parentElement.closest(".form-section"));
    if (sections.length) {
      sections.forEach((section) => {
        const headline = visibleText(section.querySelector(".form-section-headline"));
        const help = visibleText(section.querySelector(".form-section-description"));
        const fields = fieldRows(section);
        if (!headline && !help && !fields.length) return;
        if (headline || help) row({ label: headline, type: "step", help });
        fields.forEach((f) => {
          if (feedbackApp && f.type === "select" && !topicSelect) {
            topicSelect = f;
            if (!f.name) f.name = "topic";
          }
          row(f);
        });
      });
    } else {
      fieldRows(element).forEach(row);
    }
    if (topicSelect) row({ type: "feedback-modules", name: topicSelect.name });
    const block = WebImporter.Blocks.createBlock(document, { name: "form", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/media-nodes.js
  var ZW = /[​-‍﻿]/g;
  var clean = (s) => (s || "").replace(ZW, "").replace(/\s+/g, " ").trim();
  var isBroken = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src);
  function videoPara(document, src, label, settings) {
    const a = document.createElement("a");
    a.setAttribute("href", src);
    a.textContent = label || src;
    const p = document.createElement("p");
    p.append(a);
    if (settings.length) p.append(` {${settings.join(" ")}}`);
    return p;
  }
  function viewerNodes(comp, document) {
    const host = comp.matches("[data-dcep]") ? comp : comp.querySelector("[data-dcep]");
    let cfg = {};
    try {
      cfg = JSON.parse(host.getAttribute("data-dcep"));
    } catch (e) {
      cfg = {};
    }
    const video = comp.querySelector("video[src], video source[src]");
    const src = clean(cfg.videoSrc || video && video.getAttribute("src"));
    if (!src) return [];
    const out = [];
    const posterImg = comp.querySelector(".vjs-poster img[src]");
    const poster = clean(cfg.thumbnailSrc || posterImg && posterImg.getAttribute("src"));
    if (poster && !isBroken(poster)) {
      const img = document.createElement("img");
      img.setAttribute("src", poster);
      img.setAttribute("alt", clean(cfg.alternativeText));
      out.push(img);
    }
    const settings = [];
    if (cfg.autoplay === true || cfg.autoplay === "true") settings.push("autoplay", "muted");
    settings.push("controls", "round-play-button");
    out.push(videoPara(document, src, clean(cfg.alternativeText), settings));
    return out;
  }
  function embedUrl(comp) {
    const iframe = comp.matches("iframe") ? comp : comp.querySelector("iframe[src]");
    if (!iframe) return "";
    let url;
    try {
      url = new URL(iframe.getAttribute("src"), "https://www.lufthansa.com/");
    } catch (e) {
      return "";
    }
    if (/(^|\.)youtube(-nocookie)?\.com$/.test(url.hostname)) {
      const m = url.pathname.match(/^\/embed\/([\w-]+)/);
      if (!m) return "";
      const out = new URL(`https://www.youtube-nocookie.com/embed/${m[1]}`);
      const start = parseInt(url.searchParams.get("start") || "", 10);
      if (start > 0) out.searchParams.set("start", start);
      return out.href;
    }
    if (url.hostname === "www.lufthansa-inflightentertainment.com" && /\/widgets\/?$/.test(url.pathname)) return url.href;
    return "";
  }
  function embedNodes(comp, document) {
    const href = embedUrl(comp);
    if (!href) return [];
    const a = document.createElement("a");
    a.setAttribute("href", href);
    a.textContent = href;
    const p = document.createElement("p");
    p.append(a);
    return [p];
  }

  // tools/importer/parsers/columns-media.js
  function parse4(element, { document }) {
    const BLOCK_TAGS = /^(P|UL|OL|H[1-6]|TABLE|DIV|BLOCKQUOTE|PRE|DL)$/;
    const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style, noscript';
    const SKIP_COMPONENTS = '.separator, .sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], .swiper-pagination, .swiper-button-prev, .swiper-button-next, .swiper-notification, .swiper-slide-duplicate, script, style, noscript';
    const MOBILE = ".hidden-lg-up, .hidden-md-up, .d-md-none, .d-lg-none";
    const DESKTOP = ".hidden-md-down, .hidden-sm-down, .d-none.d-md-block, .d-none.d-lg-block";
    const clean2 = (s) => (s || "").replace(/[​-‍﻿]/g, "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const c = node.cloneNode(true);
      c.querySelectorAll(SKIP).forEach((n) => n.remove());
      return clean2(c.textContent);
    };
    const ARTICLE = !!element.closest(".article-details-page");
    const isBroken3 = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src) || /^(data|blob):/i.test(src);
    const isBr2 = (n) => n && n.nodeType === 1 && n.tagName === "BR";
    const isBlank = (n) => n && n.nodeType === 3 && !clean2(n.nodeValue);
    const trimBreaks = (el) => {
      while (el.lastChild && (isBr2(el.lastChild) || isBlank(el.lastChild))) el.lastChild.remove();
      while (el.firstChild && (isBr2(el.firstChild) || isBlank(el.firstChild))) el.firstChild.remove();
    };
    const tidy = (el) => {
      el.querySelectorAll(SKIP).forEach((s) => s.remove());
      el.querySelectorAll("em, i, span").forEach((s) => {
        if ([...s.classList].some((c) => /^lh(-|$)/.test(c)) && !clean2(s.textContent) && !s.querySelector("img")) s.remove();
      });
      const keep = [...el.classList].filter((c) => /^(copytext-(small|medium|large)|footnote|limited-width)$/.test(c));
      el.removeAttribute("class");
      if (keep.length) el.className = keep.join(" ");
      return el;
    };
    const splitParagraph = (p) => {
      const groups = [[]];
      const nodes = [...p.childNodes];
      for (let i = 0; i < nodes.length; i += 1) {
        if (isBr2(nodes[i])) {
          let j = i + 1;
          while (j < nodes.length && isBlank(nodes[j])) j += 1;
          if (isBr2(nodes[j])) {
            while (j < nodes.length && (isBr2(nodes[j]) || isBlank(nodes[j]))) j += 1;
            groups.push([]);
            i = j - 1;
            continue;
          }
        }
        groups[groups.length - 1].push(nodes[i]);
      }
      return groups.map((g) => {
        const np = document.createElement("p");
        if (p.className) np.className = p.className;
        g.forEach((n) => np.append(n));
        trimBreaks(np);
        return np;
      }).filter((np) => clean2(np.textContent) || np.querySelector("img"));
    };
    const richNodes = (scope) => {
      const rt = scope.querySelector(".richtext") || scope;
      const out = [];
      let run = null;
      const pushP = (p) => {
        tidy(p);
        out.push(...splitParagraph(p));
      };
      const flush = () => {
        if (run) pushP(run);
        run = null;
      };
      [...rt.childNodes].forEach((n) => {
        if (n.nodeType === 8) return;
        if (n.nodeType === 1 && n.matches(SKIP)) return;
        if (n.nodeType === 1 && BLOCK_TAGS.test(n.tagName)) {
          flush();
          const c = n.cloneNode(true);
          if (c.tagName === "P") {
            pushP(c);
            return;
          }
          tidy(c);
          if (clean2(c.textContent) || c.querySelector("img")) out.push(c);
          return;
        }
        if (isBlank(n) && !run) return;
        if (!run) run = document.createElement("p");
        run.append(n.cloneNode(true));
      });
      flush();
      if (rt.classList && rt.classList.contains("limited-width")) {
        out.forEach((n) => {
          if (/^(P|UL|OL)$/.test(n.tagName)) n.classList.add("limited-width");
        });
      }
      return out;
    };
    const MAUI = "maui-navigation-link[href], maui-button-link[href], maui-link[href], a[href]";
    const linkPara = (scope) => {
      const m = scope.querySelector(MAUI);
      if (!m) return null;
      const label = visibleText(m) || clean2(m.getAttribute("label") || m.getAttribute("aria-label"));
      const href = m.getAttribute("href");
      if (!label || !href) return null;
      const a = document.createElement("a");
      a.setAttribute("href", href);
      a.textContent = label;
      const p = document.createElement("p");
      const type = m.tagName === "MAUI-BUTTON-LINK" ? m.getAttribute("type") : null;
      if (type === "primary" || type === "secondary") {
        const wrap = document.createElement(type === "primary" ? "strong" : "em");
        wrap.append(a);
        p.append(wrap);
      } else {
        p.append(a);
      }
      return p;
    };
    const keepHeadingStyle = (from, to) => {
      if (!from || !/^H[1-6]$/.test(to.tagName)) return;
      const style = [...from.classList].find((c) => /^heading-/.test(c));
      if (style) to.className = style;
    };
    const headingFrom = (scope) => {
      const h = scope.matches("h1, h2, h3, h4, h5, h6") ? scope : scope.querySelector("h1, h2, h3, h4, h5, h6");
      const text = visibleText(h || scope);
      if (!text) return null;
      const isLabel = h && /(^|\s)copytext/.test(h.getAttribute("class") || "");
      const out = document.createElement(h && !isLabel ? h.tagName.toLowerCase() : "p");
      out.textContent = text;
      keepHeadingStyle(h, out);
      return out;
    };
    const videoPara2 = (src, label, settings) => {
      const a = document.createElement("a");
      a.setAttribute("href", src);
      a.textContent = label || src;
      const p = document.createElement("p");
      p.append(a);
      if (settings.length) p.append(` {${settings.join(" ")}}`);
      return p;
    };
    const viewerNodes2 = (comp) => {
      const host = comp.querySelector("[data-dcep]");
      let cfg = {};
      try {
        cfg = JSON.parse(host.getAttribute("data-dcep"));
      } catch (e) {
        cfg = {};
      }
      const video = comp.querySelector("video[src], video source[src]");
      const src = clean2(cfg.videoSrc || video && video.getAttribute("src"));
      if (!src) return [];
      const out = [];
      const posterImg = comp.querySelector(".vjs-poster img[src]");
      const poster = clean2(cfg.thumbnailSrc || posterImg && posterImg.getAttribute("src"));
      if (poster && !isBroken3(poster)) {
        const img = document.createElement("img");
        img.setAttribute("src", poster);
        img.setAttribute("alt", clean2(cfg.alternativeText));
        out.push(img);
      }
      const settings = [];
      if (cfg.autoplay === true || cfg.autoplay === "true") settings.push("autoplay", "muted");
      settings.push("controls", "round-play-button");
      out.push(videoPara2(src, clean2(cfg.alternativeText), settings));
      return out;
    };
    const captionPara = (comp) => {
      if (!ARTICLE) return null;
      const fc = comp.querySelector("figcaption");
      const text = fc && visibleText(fc.querySelector("maui-caption") || fc);
      if (!text) return null;
      const p = document.createElement("p");
      p.textContent = `${text} {caption}`;
      return p;
    };
    const mediaNodes = (comp) => {
      const out = mediaOnly(comp);
      const caption = out.length && captionPara(comp);
      if (caption) out.push(caption);
      return out;
    };
    const mediaOnly = (comp) => {
      const out = [];
      const img = [...comp.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")) && !i.closest(SKIP_COMPONENTS));
      const video = comp.querySelector("video[src], video source[src]");
      let image = null;
      if (img) {
        image = document.createElement("img");
        image.setAttribute("src", img.getAttribute("src"));
        image.setAttribute("alt", img.getAttribute("alt") || "");
      }
      if (video) {
        const src = video.getAttribute("src");
        if (image) out.push(image);
        const moving = !!video.closest(".dcep-moving-image");
        const button = !moving && comp.querySelector('[aria-label].moving-image-play-button, .on-image-button[aria-label], [role="button"][aria-label]');
        const settings = button ? [] : ["autoplay", "muted"];
        if (!button && (moving || video.hasAttribute("loop"))) settings.push("loop");
        if (video.hasAttribute("controls")) settings.push("controls");
        out.push(videoPara2(src, clean2(button && button.getAttribute("aria-label")), settings));
        return out;
      }
      if (!image) return out;
      const link = img.closest("a[href]");
      if (link && comp.contains(link)) {
        const a = document.createElement("a");
        a.setAttribute("href", link.getAttribute("href"));
        a.append(image);
        out.push(a);
      } else {
        out.push(image);
      }
      return out;
    };
    const teaserNodes = (teaser) => {
      const out = [];
      const h = teaser.querySelector(".teaser-heading") || teaser.querySelector("h1, h2, h3, h4, h5, h6");
      const title = h && visibleText(h.querySelector(".teaser-heading-text") || h);
      const icon = h && [...h.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")));
      if (title) {
        const heading = document.createElement(/^H[1-6]$/.test(h.tagName) ? h.tagName.toLowerCase() : "h3");
        if (icon) {
          const img = document.createElement("img");
          img.setAttribute("src", icon.getAttribute("src"));
          img.setAttribute("alt", icon.getAttribute("alt") || "");
          heading.append(img);
        }
        heading.append(title);
        keepHeadingStyle(h, heading);
        out.push(heading);
      }
      const desc = teaser.querySelector(".teaser-description");
      if (desc) {
        const paras = [...desc.querySelectorAll("p")].filter((d) => visibleText(d));
        const nodes = paras.flatMap((d) => splitParagraph(tidy(d.cloneNode(true))));
        if (!nodes.length && visibleText(desc)) {
          nodes.push(document.createElement("p"));
          nodes[0].textContent = visibleText(desc);
        }
        nodes.forEach((d) => {
          d.className = "copytext-medium";
          out.push(d);
        });
      }
      return out;
    };
    const collect = (node, out) => {
      [...node.children].forEach((child) => {
        if (child.matches(SKIP_COMPONENTS)) return;
        if (child.matches(MOBILE) && child.parentElement && child.parentElement.querySelector(`:scope > :is(${DESKTOP})`)) return;
        const cl = child.classList;
        if (cl.contains("headline")) {
          const h = headingFrom(child);
          if (h) out.push(h);
        } else if (cl.contains("text") && child.querySelector(".richtext")) {
          out.push(...richNodes(child));
        } else if (cl.contains("link") && child.querySelector(MAUI)) {
          const p = linkPara(child);
          if (p) out.push(p);
        } else if (cl.contains("image") && child.querySelector("img, video")) {
          out.push(...mediaNodes(child));
        } else if (child.parentElement.classList.contains("column-view") && !child.matches(".row, .carousel") && child.querySelector("h1, h2, h3, h4, h5, h6")) {
          child.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((t) => {
            const h = headingFrom(t);
            if (h) out.push(h);
          });
        } else if (child.matches("a.teaser:not([href])")) {
          out.push(...teaserNodes(child));
        } else if (cl.contains("videoViewer")) {
          out.push(...viewerNodes2(child));
        } else if (cl.contains("video") && child.querySelector(":scope > .video-player iframe") || cl.contains("iframe") && child.querySelector(":scope > .iframe-wrapper iframe")) {
          embedNodes(child, document).forEach((n) => {
            n.setAttribute("data-lh-embed", "");
            out.push(n);
          });
        } else {
          collect(child, out);
        }
      });
      return out;
    };
    const finishCell = (nodes) => {
      const inline = (n) => n.tagName === "IMG" || n.tagName === "A";
      if (nodes.every(inline) || !nodes.some(inline)) return nodes;
      const out = [];
      let p = null;
      nodes.forEach((n) => {
        if (inline(n)) {
          if (!p) {
            p = document.createElement("p");
            out.push(p);
          }
          p.append(n);
        } else {
          p = null;
          out.push(n);
        }
      });
      return out;
    };
    if (element.matches(".videoViewer, .image")) {
      if (!element.isConnected || !element.parentElement || element.parentElement.closest("table, .inspirationteaser, .stage, .carousel, .slideshow, .accordion, .teaser")) return;
      const media = element.classList.contains("videoViewer") ? viewerNodes2(element) : mediaNodes(element);
      if (!media.some((n) => n.tagName === "P")) return;
      element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "columns-media", cells: [[media]] }));
      return;
    }
    const articles = [...element.querySelectorAll(".blog-article-container")];
    if (element.classList.contains("blogoverview") && articles.length) {
      const rows = articles.map((art, i) => {
        const media = [];
        const img = [...art.querySelectorAll(".blog-article-image img")].find((x) => !isBroken3(x.getAttribute("src")));
        if (img) {
          const image = document.createElement("img");
          image.setAttribute("src", img.getAttribute("src"));
          image.setAttribute("alt", img.getAttribute("alt") || "");
          const link = img.closest("a[href]");
          if (link) {
            const a = document.createElement("a");
            a.setAttribute("href", link.getAttribute("href"));
            a.append(image);
            media.push(a);
          } else media.push(image);
        }
        const text = [];
        const tags = [...art.querySelectorAll("maui-chip[label]")].map((c) => clean2(c.getAttribute("label"))).filter(Boolean);
        if (tags.length) {
          const ul = document.createElement("ul");
          tags.forEach((t) => {
            const li = document.createElement("li");
            li.textContent = t;
            ul.append(li);
          });
          text.push(ul);
        }
        const title = art.querySelector(".article-title");
        if (title && visibleText(title)) {
          const h = document.createElement("h2");
          h.className = "heading-small";
          const titleLink = title.closest("a[href]");
          if (titleLink) {
            const a = document.createElement("a");
            a.setAttribute("href", titleLink.getAttribute("href"));
            a.textContent = visibleText(title);
            h.append(a);
          } else h.textContent = visibleText(title);
          text.push(h);
        }
        const info = [...art.querySelectorAll(".blog-article-details-info > div")].map(visibleText).filter((t) => t && t !== "|");
        if (info.length) {
          const p = document.createElement("p");
          const b = document.createElement("strong");
          b.textContent = info.join(" | ");
          p.append(b);
          text.push(p);
        }
        art.querySelectorAll(".blog-article-details > p").forEach((p) => {
          if (!visibleText(p)) return;
          const desc = tidy(p.cloneNode(true));
          desc.className = "copytext-medium";
          text.push(desc);
        });
        const more = art.querySelector(".blog-article-details-link");
        const moreP = more && linkPara(more);
        if (moreP) text.push(moreP);
        if (!text.length) return null;
        if (!media.length) return [text];
        return i % 2 === 0 ? [text, media] : [media, text];
      }).filter(Boolean);
      if (!rows.length) return;
      element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "columns-media", variants: ["media-first"], cells: rows }));
      return;
    }
    const titles = [];
    const cells = [];
    let variants = [];
    if (element.classList.contains("sidebar") || element.querySelector(":scope > .airem-sidebar")) {
      variants = ["sidebar"];
      const media = element.querySelector(".sidebar-content");
      const text = element.querySelector(".sidebar-aside");
      const row = [media ? finishCell(collect(media, [])) : [], text ? finishCell(collect(text, [])) : []];
      if (row.some((c) => c.length)) cells.push(row.map((c) => c.length ? c : ""));
      const item = element.parentElement;
      const sideView = item && item.classList.contains("column-view-item") && item.children.length === 1 && item.parentElement && item.parentElement.classList.contains("row") && item.parentElement.children.length === 1 && item.parentElement.parentElement;
      const oneColumn = sideView && sideView.classList.contains("column-view") && sideView.parentElement;
      const ownSidebar = !!oneColumn && oneColumn.matches(".onecolumn.column") && oneColumn.children.length === 1 && !!oneColumn.parentElement && oneColumn.parentElement.classList.contains("section-content") && !oneColumn.hasAttribute("data-lh-column") && !ARTICLE && !element.closest(".container-gray");
      if (ownSidebar) {
        variants.push("padded");
        const meaningful2 = (el) => !!clean2(el.textContent) || !!el.querySelector("img, picture, video, iframe");
        const isLast = [...oneColumn.parentElement.children].filter(meaningful2).pop() === oneColumn;
        const aem = oneColumn.closest(".container-content > .section");
        let next = aem && aem.nextElementSibling;
        while (next && !(next.classList.contains("section") && meaningful2(next))) next = next.nextElementSibling;
        if (isLast && next && next.querySelector(":scope > div > .section-padding-y-regular") && !next.querySelector(":scope > .container-gray")) variants.push("before-padded");
      }
    } else {
      const view = element.querySelector(":scope > .column-view") || element.querySelector(".column-view") || element;
      [...view.children].filter((d) => !d.classList.contains("row") && !d.classList.contains("carousel")).forEach((d) => {
        d.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
          const t = visibleText(h);
          if (!t) return;
          const out = document.createElement(h.tagName.toLowerCase());
          out.textContent = t;
          keepHeadingStyle(h, out);
          titles.push(out);
        });
      });
      const items = [...view.querySelectorAll(".column-view-item")].filter((it) => it.closest(".column-view") === view && !it.closest(MOBILE));
      const collected = items.map((it) => finishCell(collect(it, [])));
      const hasEmbed = collected.some((c) => c.some((n) => n.matches && n.matches("p[data-lh-embed]")));
      const NESTED = ["twocolumn", "threecolumn", "fourcolumn"];
      const nestedView = element.matches(".threecolumn, .fourcolumn") && items.map((it) => [...it.children].find((c) => NESTED.some((k) => c.classList.contains(k)) && c.querySelector(".image img") && !c.querySelector(".text, .headline, .link, .teaser"))).find(Boolean);
      if (nestedView) variants.push(`nested-${NESTED.findIndex((k) => nestedView.classList.contains(k)) + 2}`);
      const filled = collected.filter((c) => c.length);
      const isImage = (n) => n.nodeType === 1 && !clean2(n.textContent) && (n.matches("img, picture") || !!n.querySelector("img, picture")) && !n.querySelector("video, iframe");
      const loneImage = items.length > 1 && filled.length === 1 && filled[0].every(isImage);
      const row = (hasEmbed || nestedView || loneImage) && filled.length ? collected.map((c) => c.length ? c : "") : filled;
      if (row.length) cells.push(row);
      const sliderView = items.some((it) => [...it.querySelectorAll(".column-view > .carousel")].some((c) => c.querySelectorAll(".hidden-md-down .image img").length > 1));
      if (sliderView) variants.push("slider");
      const stacked = (ARTICLE || !sliderView) && items.some((it) => [...it.querySelectorAll(".image")].filter((img) => img.closest(".column-view-item") === it && !img.parentElement.closest(".image") && img.querySelector("img, video")).length > 1);
      if (stacked) variants.push("stacked");
      const textItem = (it) => !!it.querySelector(".headline, .text");
      if (!sliderView && view.querySelector(":scope > .carousel") && items.length > 1 && items.some(textItem) && items.some((it) => !textItem(it) && it.querySelector(".image img"))) {
        variants.push("cell-slider");
      }
      const own = element.classList.contains("column") && element.children.length === 1 && element.firstElementChild === view && !!element.parentElement && element.parentElement.classList.contains("section-content");
      if (own && !titles.length && !ARTICLE && !element.closest(".container-gray") && !view.classList.contains("container-gray")) variants.push("padded");
    }
    if (!cells.length && !titles.length) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-media", variants, cells });
    const headerText = (t) => clean2((t.querySelector("tr") || t).textContent).toLowerCase();
    const previousSameBlock = () => {
      const name = headerText(block);
      const before = [...document.querySelectorAll("table")].filter((t) => !element.contains(t) && t.compareDocumentPosition(element) & 4 && headerText(t) === name);
      const prev = before[before.length - 1];
      if (!prev) return null;
      const range = document.createRange();
      range.setStartAfter(prev);
      range.setEndBefore(element);
      const between = range.cloneContents();
      if (clean2(between.textContent)) return null;
      if (between.querySelector("img, picture, video, iframe, hr, table, h1, h2, h3, h4, h5, h6, form, input")) return null;
      return prev;
    };
    if (!titles.length && cells.length) {
      const prev = previousSameBlock();
      if (prev) {
        const rows = [...block.querySelectorAll("tr")].slice(1);
        const lastRow = [...prev.querySelectorAll("tr")].pop();
        rows.forEach((r) => lastRow.parentNode.append(r));
        element.remove();
        return;
      }
    }
    const column = element.getAttribute("data-lh-column");
    if (column) {
      const wrap = document.createElement("div");
      wrap.setAttribute("data-lh-column", column);
      wrap.append(...titles, block);
      element.replaceWith(wrap);
      return;
    }
    element.replaceWith(...titles, block);
  }

  // tools/importer/parsers/accordion-columns.js
  function parse5(element, { document }) {
    const SR_ONLY2 = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"]';
    const ZW2 = /[​-‍﻿]/g;
    const clean2 = (s) => (s || "").replace(ZW2, "").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const clone = node.cloneNode(true);
      clone.querySelectorAll(SR_ONLY2).forEach((n) => n.remove());
      return clean2(clone.textContent);
    };
    const makeLink = (source) => {
      const label = visibleText(source);
      const href = source.getAttribute("href");
      if (!label || !href) return null;
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      return a;
    };
    const convertRichText = (root) => {
      const out = [];
      [...root.children].forEach((child) => {
        if (child.matches(SR_ONLY2)) return;
        if (child.tagName === "MAUI-TOOLTIP") {
          out.push(...convertRichText(child));
          return;
        }
        if (/^MAUI-.*LINK$/.test(child.tagName) && child.getAttribute("href")) {
          const link = makeLink(child);
          if (link) {
            const p = document.createElement("p");
            p.append(link);
            out.push(p);
          }
          return;
        }
        const tag = child.tagName;
        if (/^H[1-6]$/.test(tag)) {
          const text = visibleText(child);
          if (text) {
            const h = document.createElement(tag);
            h.textContent = text;
            out.push(h);
          }
          return;
        }
        if (tag === "UL" || tag === "OL") {
          const list = document.createElement(tag);
          child.querySelectorAll(":scope > li").forEach((li) => {
            const item = document.createElement("li");
            const a = li.querySelector("a[href], maui-navigation-link[href], maui-link[href], maui-button-link[href]");
            const link = a && makeLink(a);
            if (link) item.append(link);
            else if (visibleText(li)) item.textContent = visibleText(li);
            if (item.childNodes.length) list.append(item);
          });
          if (list.children.length) out.push(list);
          return;
        }
        if (tag === "P" || tag === "DIV") {
          const links = [...child.querySelectorAll("a[href]")];
          const clone = child.cloneNode(true);
          clone.querySelectorAll("a, br").forEach((n) => n.remove());
          clone.querySelectorAll(SR_ONLY2).forEach((n) => n.remove());
          const onlyLinks = links.length && !clean2(clone.textContent);
          if (onlyLinks) {
            const list = document.createElement("ul");
            links.forEach((l) => {
              const link = makeLink(l);
              if (!link) return;
              const li = document.createElement("li");
              li.append(link);
              list.append(li);
            });
            if (list.children.length) out.push(list);
            return;
          }
          if (tag === "DIV") {
            out.push(...convertRichText(child));
            return;
          }
          const text = visibleText(child);
          if (text) {
            const p = document.createElement("p");
            p.innerHTML = child.innerHTML;
            p.querySelectorAll(`${SR_ONLY2}, em.lh, i.lh`).forEach((n) => n.remove());
            p.querySelectorAll("a[href]").forEach((a) => {
              const link = makeLink(a);
              if (link) a.replaceWith(link);
            });
            const walker = document.createTreeWalker(p, 4);
            let node = walker.nextNode();
            while (node) {
              node.textContent = node.textContent.replace(ZW2, "");
              node = walker.nextNode();
            }
            out.push(p);
          }
        }
      });
      return out;
    };
    const convertPanel = (panel) => {
      const content = [];
      const columns = [...panel.querySelectorAll(".column-view-item")];
      const parts = columns.length ? columns : [panel];
      parts.forEach((part) => {
        part.querySelectorAll("h1, h2, h3, h4, h5, h6, .richtext, ul, ol, maui-navigation-link[href], maui-link[href], maui-button-link[href], .videoViewer, .video:has(> .video-player iframe), .iframe:has(> .iframe-wrapper iframe)").forEach((node) => {
          if (node.parentElement && node.parentElement.closest(".richtext, ul, ol") && part.contains(node.parentElement.closest(".richtext, ul, ol"))) return;
          if (node.parentElement && node.parentElement.closest(".videoViewer, .video-player, .iframe-wrapper")) return;
          if (node.matches(".videoViewer")) {
            content.push(...viewerNodes(node, document));
          } else if (node.matches(".video, .iframe")) {
            content.push(...embedNodes(node, document));
          } else if (/^H[1-6]$/.test(node.tagName)) {
            const text = visibleText(node);
            if (!text) return;
            const h = document.createElement(columns.length ? "h3" : node.tagName);
            const icon = node.closest("a.teaser") && node.querySelector("img");
            const src = icon && icon.getAttribute("src");
            if (src && !/^(data|blob):/i.test(src) && !/(^|\/)undefined(\.transform|$|\/)/.test(src)) {
              const img = document.createElement("img");
              img.setAttribute("src", src);
              img.setAttribute("alt", clean2(icon.getAttribute("alt")));
              h.append(img);
            }
            h.append(text);
            content.push(h);
          } else if (node.matches(".richtext")) {
            content.push(...convertRichText(node));
          } else {
            const wrap = document.createElement("div");
            wrap.append(node.cloneNode(true));
            content.push(...convertRichText(wrap));
          }
        });
      });
      return content;
    };
    let items = [...element.querySelectorAll("maui-collapsible-item")];
    if (!items.length) items = [...element.querySelectorAll(".accordionitem")];
    const options = [];
    if (items.length && !items.some((item) => item.querySelector(".column-view-item"))) options.push("faq");
    if (element.closest("maui-limited-width") || element.querySelector("maui-limited-width maui-collapsible, maui-limited-width .accordionitem")) options.push("limited-width");
    const columnItem = element.parentElement && element.parentElement.closest(".column-view-item");
    const columnView = columnItem && columnItem.closest(".column-view");
    const columnCount = columnView ? [...columnView.querySelectorAll(".column-view-item")].filter((it) => it.closest(".column-view") === columnView).length : 0;
    const aloneInColumn = !!columnItem && [...columnItem.children].filter((c) => c !== element && !c.contains(element) && !c.matches(".separator") && (clean2(c.textContent) || c.querySelector("img, video, iframe"))).length === 0;
    if (aloneInColumn && columnCount > 1) options.push("column");
    else if (columnItem) options.push("spaced");
    const blockName = options.length ? `accordion-columns (${options.join(", ")})` : "accordion-columns";
    const cells = [];
    items.forEach((item) => {
      const title = clean2(item.getAttribute("headline")) || visibleText(item.querySelector('[slot="headline"], .accordion-headline, summary, h2, h3'));
      const content = convertPanel(item);
      if (!title && !content.length) return;
      cells.push([title, content.length ? content : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: blockName, cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/lufthansa-cleanup.js
  var SCOPE_PATHS = /* @__PURE__ */ new Set(["/at/de/100-years", "/at/de/100-years/cabin-design", "/at/de/100-years/campaigns", "/at/de/100-years/chronicle", "/at/de/100-years/crane", "/at/de/100-years/destinations", "/at/de/100-years/fleet", "/at/de/100-years/global-network", "/at/de/100-years/history", "/at/de/100-years/history/menu-on-board", "/at/de/320", "/at/de/32n", "/at/de/359", "/at/de/744", "/at/de/accessible-travel", "/at/de/additional-services", "/at/de/admission-rules", "/at/de/adressen-weltweit", "/at/de/advance-seat-reservation", "/at/de/advice-for-travellers-with-special-needs-to-and-from-the-usa", "/at/de/affiliatemarketing", "/at/de/all-check-in", "/at/de/alleinreisende-kinder", "/at/de/anmeldung-tiere-frachtraum", "/at/de/arrival-services", "/at/de/articles", "/at/de/articles/authors", "/at/de/articles/authors/alexandra-mikamo", "/at/de/articles/authors/florian-schwebel", "/at/de/articles/authors/florian-tomberg", "/at/de/articles/authors/julia-buth", "/at/de/articles/authors/till-weisbrod", "/at/de/articles/explore-flying", "/at/de/articles/explore-flying/7-people-who-shaped-lufthansa-history", "/at/de/articles/explore-flying/a-girl-named-lufthansa", "/at/de/articles/explore-flying/aircraft-lights-explained", "/at/de/articles/explore-flying/allegris-business-class-dirk-nowitzki", "/at/de/articles/explore-flying/allegris-exclusive-first-class-loungewear", "/at/de/articles/explore-flying/allegris-first-class-innovations", "/at/de/articles/explore-flying/allegris-first-class-reasons-for-allegris-first-class", "/at/de/articles/explore-flying/allegris-fox", "/at/de/articles/explore-flying/anniversary-super-crane-special", "/at/de/articles/explore-flying/art-basel-miami-beach-stefan-marx", "/at/de/articles/explore-flying/best-airport-restaurants", "/at/de/articles/explore-flying/business-class-culinary-journey-with-johann-lafer", "/at/de/articles/explore-flying/celebrating-20-years-of-excellence", "/at/de/articles/explore-flying/cockpit-collaboration", "/at/de/articles/explore-flying/come-fly-with-me-lufthansa-allegris", "/at/de/articles/explore-flying/culinary-craftsmanship-smoked-fish-for-first-and-business-class", "/at/de/articles/explore-flying/essentials-future-of-flying", "/at/de/articles/explore-flying/essentials-lufthansa-facts", "/at/de/articles/explore-flying/essentials-surprising-lufthansa-numbers", "/at/de/articles/explore-flying/everyone-wants-to-fly-with-the-cranes", "/at/de/articles/explore-flying/female-pilots", "/at/de/articles/explore-flying/first-class-culinary-inspiration-journey-tokyo", "/at/de/articles/explore-flying/first-class-reimagined", "/at/de/articles/explore-flying/first-class-terminal-architecture", "/at/de/articles/explore-flying/flying-high-christoph-quarch", "/at/de/articles/explore-flying/flying-high-meta-city", "/at/de/articles/explore-flying/future-of-flying", "/at/de/articles/explore-flying/help-alliance-engagement-in-tanzania", "/at/de/articles/explore-flying/help-alliance-taking-off-for-a-good-cause", "/at/de/articles/explore-flying/hon-circle-event", "/at/de/articles/explore-flying/how-to-become-a-flight-attendant", "/at/de/articles/explore-flying/how-to-become-a-pilot", "/at/de/articles/explore-flying/inflight-entertainment-vr-experience", "/at/de/articles/explore-flying/inside-lufthansa-lh-allegris", "/at/de/articles/explore-flying/interview-livery-iconic-moments", "/at/de/articles/explore-flying/livery-iconic-moments", "/at/de/articles/explore-flying/lufthansa-allegris-first-class", "/at/de/articles/explore-flying/lufthansa-allegris-welcome-to-the-future-of-aviation", "/at/de/articles/explore-flying/lufthansa-classics", "/at/de/articles/explore-flying/lufthansa-fleet-our-aircrafts", "/at/de/articles/explore-flying/lufthansa-group-wifi", "/at/de/articles/explore-flying/lufthansa-help-alliance-i-fly-for-campaign", "/at/de/articles/explore-flying/lufthansa-in-the-spotlight", "/at/de/articles/explore-flying/lufthansa-innovation-hub-future-of-flying", "/at/de/articles/explore-flying/lufthansa-insights-art", "/at/de/articles/explore-flying/lufthansa-lounges", "/at/de/articles/explore-flying/lufthansa-orchestra-channel-aid-live-in-concert", "/at/de/articles/explore-flying/lufthansa-uniforms-history", "/at/de/articles/explore-flying/meet-the-makers-innovations-for-individual-well-being", "/at/de/articles/explore-flying/meet-the-makers-lufthansa-allegris-business-class", "/at/de/articles/explore-flying/meet-the-makers-lufthansa-allegris-first-class", "/at/de/articles/explore-flying/meet-the-makers-the-manufactures-of-the-first-class-suites", "/at/de/articles/explore-flying/new-lufthansa-lounge-newark-interview", "/at/de/articles/explore-flying/oktoberfest-traditional-bavarian-attire", "/at/de/articles/explore-flying/pride-diversifly-queer-employee-network-lufthansa-group", "/at/de/articles/explore-flying/queer-travel-safer-trips", "/at/de/articles/explore-flying/responsibility-lufthansa", "/at/de/articles/explore-flying/things-you-always-wanted-to-know-about-flying", "/at/de/articles/explore-flying/time-travel-ki-aviation", "/at/de/articles/explore-flying/travel-trends", "/at/de/articles/explore-flying/vacation-packing-list", "/at/de/articles/explore-flying/welcome-to-my-world-alexandra-maria-lara", "/at/de/articles/explore-flying/welcome-to-my-world-bridget-finn", "/at/de/articles/explore-flying/welcome-to-my-world-elyas-mbarek", "/at/de/articles/explore-flying/welcome-to-my-world-emilia-schuele", "/at/de/articles/explore-flying/welcome-to-my-world-karolina-kurkova", "/at/de/articles/explore-flying/welcome-to-my-world-karoline-herfurth", "/at/de/articles/explore-flying/welcome-to-my-world-lexie-alford", "/at/de/articles/explore-flying/what-does-luxury-mean-today", "/at/de/articles/explore-flying/what-the-hack-anti-jetlag-tips", "/at/de/articles/explore-flying/what-the-hack-best-seats", "/at/de/articles/explore-flying/what-the-hack-travel-gadgets", "/at/de/articles/explore-flying/what-the-hack-travel-hacks", "/at/de/articles/explore-flying/what-the-hack-travel-with-kids", "/at/de/articles/explore-flying/what-the-hack-waiting-time-at-the-airport", "/at/de/articles/explore-flying/what-the-hack-what-is-the-etiquette-of-traveling", "/at/de/articles/explore-flying/yes-stories-the-fascination-of-skydiving", "/at/de/articles/explore-flying/yes-stories-the-two-worlds-of-kaye-ree", "/at/de/articles/explore-flying/yes-stories-thorsten-buss", "/at/de/articles/explore-flying/yes-stories-tom-rees", "/at/de/articles/explore-the-world", "/at/de/articles/explore-the-world/a-perfect-day-amsterdam-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-art-basel-miami-beach-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-athens-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-bangkok-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-barcelona-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-beijing-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-bengaluru-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-berlin-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-boston-on-one-day", "/at/de/articles/explore-the-world/a-perfect-day-budapest-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-buenos-aires-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-cape-town-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-charlotte-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-chicago-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-copenhagen-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-dublin-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-frankfurt-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-hamburg", "/at/de/articles/explore-the-world/a-perfect-day-helsinki-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-hong-kong-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-houston-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-istanbul-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-johannesburg-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-la-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-lisbon-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-london-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-madrid-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-malaga-on-one-day", "/at/de/articles/explore-the-world/a-perfect-day-mallorca-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-mexico-city-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-miami-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-milan-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-mumbai-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-munich-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-ny-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-oslo-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-paris-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-porto-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-prague-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-rio-de-janeiro-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-rome-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-san-francisco-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-seoul-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-shanghai-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-singapore-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-stockholm-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-tokyo-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-toronto-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-vienna-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-washington-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-zurich-in-one-day", "/at/de/articles/explore-the-world/a-perfect-nairobi-city-in-one-day", "/at/de/articles/explore-the-world/art-basel-miami-beach-fun-facts", "/at/de/articles/explore-the-world/be-picky-amsterdam-insider-tips", "/at/de/articles/explore-the-world/be-picky-athens-insider-tips", "/at/de/articles/explore-the-world/be-picky-bangkok-insider-tips", "/at/de/articles/explore-the-world/be-picky-barcelona-insider-tips", "/at/de/articles/explore-the-world/be-picky-bengaluru", "/at/de/articles/explore-the-world/be-picky-budapest-insider-tips", "/at/de/articles/explore-the-world/be-picky-buenos-aires-insider-tips", "/at/de/articles/explore-the-world/be-picky-cape-town-insider-tips", "/at/de/articles/explore-the-world/be-picky-charlotte-insider-tips", "/at/de/articles/explore-the-world/be-picky-chicago-insider-tips", "/at/de/articles/explore-the-world/be-picky-copenhagen", "/at/de/articles/explore-the-world/be-picky-dublin-insider-tips", "/at/de/articles/explore-the-world/be-picky-frankfurt-insider-tips", "/at/de/articles/explore-the-world/be-picky-helsinkis-insider-tips", "/at/de/articles/explore-the-world/be-picky-hong-kong-insider-tips", "/at/de/articles/explore-the-world/be-picky-istanbul-insider-tips", "/at/de/articles/explore-the-world/be-picky-johannesburg-insider-tipps", "/at/de/articles/explore-the-world/be-picky-la-insider-tips", "/at/de/articles/explore-the-world/be-picky-lisbon", "/at/de/articles/explore-the-world/be-picky-little-italy-in-vancouver", "/at/de/articles/explore-the-world/be-picky-london-insider-tips", "/at/de/articles/explore-the-world/be-picky-madrid", "/at/de/articles/explore-the-world/be-picky-mallorca-insider-tips", "/at/de/articles/explore-the-world/be-picky-mexico-city-insider-tips", "/at/de/articles/explore-the-world/be-picky-mexico-city-insidertipps", "/at/de/articles/explore-the-world/be-picky-miami-insider-tips", "/at/de/articles/explore-the-world/be-picky-milan-insider-tips", "/at/de/articles/explore-the-world/be-picky-mumbai-insider-tips", "/at/de/articles/explore-the-world/be-picky-munich-insider-tip-anika-landsteiner", "/at/de/articles/explore-the-world/be-picky-ny-insider-tips", "/at/de/articles/explore-the-world/be-picky-oslo-insider-tips", "/at/de/articles/explore-the-world/be-picky-paris-insider-tips", "/at/de/articles/explore-the-world/be-picky-prague-insider-tips", "/at/de/articles/explore-the-world/be-picky-rio-de-janeiro-insider-tips", "/at/de/articles/explore-the-world/be-picky-rome-insider-tips", "/at/de/articles/explore-the-world/be-picky-san-francisco-insider-tips", "/at/de/articles/explore-the-world/be-picky-seoul-insider-tips", "/at/de/articles/explore-the-world/be-picky-shanghai-insider-tips", "/at/de/articles/explore-the-world/be-picky-singapore-insider-tips", "/at/de/articles/explore-the-world/be-picky-stockholm", "/at/de/articles/explore-the-world/be-picky-tokyo-insider-tips", "/at/de/articles/explore-the-world/be-picky-toronto-insider-tips", "/at/de/articles/explore-the-world/be-picky-vienna-insider-tips", "/at/de/articles/explore-the-world/be-picky-washington-insider-tips", "/at/de/articles/explore-the-world/be-picky-zurich-insider-tips", "/at/de/articles/explore-the-world/copenhagen-what-i-have-learned", "/at/de/articles/explore-the-world/eat-see-do-algiers", "/at/de/articles/explore-the-world/eat-see-do-almaty", "/at/de/articles/explore-the-world/eat-see-do-amman", "/at/de/articles/explore-the-world/eat-see-do-atlanta", "/at/de/articles/explore-the-world/eat-see-do-beijing", "/at/de/articles/explore-the-world/eat-see-do-berlin", "/at/de/articles/explore-the-world/eat-see-do-bilbao", "/at/de/articles/explore-the-world/eat-see-do-bogota", "/at/de/articles/explore-the-world/eat-see-do-boston", "/at/de/articles/explore-the-world/eat-see-do-cagliari", "/at/de/articles/explore-the-world/eat-see-do-cairo", "/at/de/articles/explore-the-world/eat-see-do-casablanca", "/at/de/articles/explore-the-world/eat-see-do-catania", "/at/de/articles/explore-the-world/eat-see-do-chennai", "/at/de/articles/explore-the-world/eat-see-do-dallas", "/at/de/articles/explore-the-world/eat-see-do-denver", "/at/de/articles/explore-the-world/eat-see-do-detroit", "/at/de/articles/explore-the-world/eat-see-do-dubai", "/at/de/articles/explore-the-world/eat-see-do-edinburgh", "/at/de/articles/explore-the-world/eat-see-do-faro", "/at/de/articles/explore-the-world/eat-see-do-gothenburg", "/at/de/articles/explore-the-world/eat-see-do-hamburg", "/at/de/articles/explore-the-world/eat-see-do-houston", "/at/de/articles/explore-the-world/eat-see-do-hyderabad", "/at/de/articles/explore-the-world/eat-see-do-kuala-lumpur", "/at/de/articles/explore-the-world/eat-see-do-larnaca", "/at/de/articles/explore-the-world/eat-see-do-ljubljana", "/at/de/articles/explore-the-world/eat-see-do-malaga", "/at/de/articles/explore-the-world/eat-see-do-manchester", "/at/de/articles/explore-the-world/eat-see-do-marseille", "/at/de/articles/explore-the-world/eat-see-do-minneapolis-st-paul", "/at/de/articles/explore-the-world/eat-see-do-nairobi", "/at/de/articles/explore-the-world/eat-see-do-nice", "/at/de/articles/explore-the-world/eat-see-do-olbia", "/at/de/articles/explore-the-world/eat-see-do-porto", "/at/de/articles/explore-the-world/eat-see-do-raleigh-durham", "/at/de/articles/explore-the-world/eat-see-do-riga", "/at/de/articles/explore-the-world/eat-see-do-riyadh", "/at/de/articles/explore-the-world/eat-see-do-san-diego", "/at/de/articles/explore-the-world/eat-see-do-seattle", "/at/de/articles/explore-the-world/eat-see-do-st-louis", "/at/de/articles/explore-the-world/eat-see-do-tallinn", "/at/de/articles/explore-the-world/eat-see-do-tbilisi", "/at/de/articles/explore-the-world/eat-see-do-tel-aviv", "/at/de/articles/explore-the-world/eat-see-do-thessaloniki", "/at/de/articles/explore-the-world/eat-see-do-tirana", "/at/de/articles/explore-the-world/eat-see-do-tunis", "/at/de/articles/explore-the-world/eat-see-do-valletta", "/at/de/articles/explore-the-world/eat-see-do-venice", "/at/de/articles/explore-the-world/eat-see-do-vilnius", "/at/de/articles/explore-the-world/eat-see-do-zagreb", "/at/de/articles/explore-the-world/essentials-amsterdam-facts", "/at/de/articles/explore-the-world/essentials-athens-facts", "/at/de/articles/explore-the-world/essentials-bangkok-facts", "/at/de/articles/explore-the-world/essentials-barcelona-facts", "/at/de/articles/explore-the-world/essentials-beijing-facts", "/at/de/articles/explore-the-world/essentials-bengaluru-facts", "/at/de/articles/explore-the-world/essentials-boston-facts", "/at/de/articles/explore-the-world/essentials-budapest-facts", "/at/de/articles/explore-the-world/essentials-buenos-aires-facts", "/at/de/articles/explore-the-world/essentials-cape-town-facts", "/at/de/articles/explore-the-world/essentials-charlotte-facts", "/at/de/articles/explore-the-world/essentials-chicago-facts", "/at/de/articles/explore-the-world/essentials-copenhagen-facts", "/at/de/articles/explore-the-world/essentials-dublin-facts", "/at/de/articles/explore-the-world/essentials-facts-vancouver", "/at/de/articles/explore-the-world/essentials-frankfurt-facts", "/at/de/articles/explore-the-world/essentials-helsinki-facts", "/at/de/articles/explore-the-world/essentials-hong-kong-facts", "/at/de/articles/explore-the-world/essentials-istanbul-facts", "/at/de/articles/explore-the-world/essentials-johannesburg-facts", "/at/de/articles/explore-the-world/essentials-la-facts", "/at/de/articles/explore-the-world/essentials-lisbon-facts", "/at/de/articles/explore-the-world/essentials-london-facts", "/at/de/articles/explore-the-world/essentials-madrid-facts", "/at/de/articles/explore-the-world/essentials-mallorca-facts", "/at/de/articles/explore-the-world/essentials-mexico-city-facts", "/at/de/articles/explore-the-world/essentials-miami-facts", "/at/de/articles/explore-the-world/essentials-milan-facts", "/at/de/articles/explore-the-world/essentials-mumbai-facts", "/at/de/articles/explore-the-world/essentials-munich-facts", "/at/de/articles/explore-the-world/essentials-ny-facts", "/at/de/articles/explore-the-world/essentials-oslo-facts", "/at/de/articles/explore-the-world/essentials-paris-facts", "/at/de/articles/explore-the-world/essentials-prague-facts", "/at/de/articles/explore-the-world/essentials-rio-de-janeiro-facts", "/at/de/articles/explore-the-world/essentials-rome-facts", "/at/de/articles/explore-the-world/essentials-san-francisco-facts", "/at/de/articles/explore-the-world/essentials-seoul-facts", "/at/de/articles/explore-the-world/essentials-shanghai-facts", "/at/de/articles/explore-the-world/essentials-singapore-facts", "/at/de/articles/explore-the-world/essentials-stockholm-facts", "/at/de/articles/explore-the-world/essentials-tokyo-facts", "/at/de/articles/explore-the-world/essentials-toronto-facts", "/at/de/articles/explore-the-world/essentials-vienna-facts", "/at/de/articles/explore-the-world/essentials-washington-facts", "/at/de/articles/explore-the-world/essentials-zurich-facts", "/at/de/articles/explore-the-world/experience-art-live", "/at/de/articles/explore-the-world/experience-nature", "/at/de/articles/explore-the-world/in-my-hood-apgujeong-seoul", "/at/de/articles/explore-the-world/in-my-hood-arroios-lissabon", "/at/de/articles/explore-the-world/in-my-hood-back-bay-boston", "/at/de/articles/explore-the-world/in-my-hood-bandra-mumbai", "/at/de/articles/explore-the-world/in-my-hood-chiswick-london", "/at/de/articles/explore-the-world/in-my-hood-citta-studi-milan", "/at/de/articles/explore-the-world/in-my-hood-city-centre-cape-town", "/at/de/articles/explore-the-world/in-my-hood-comercial-drive-vancouver", "/at/de/articles/explore-the-world/in-my-hood-coyoacan-mexico-city", "/at/de/articles/explore-the-world/in-my-hood-creative-quarter-dublin", "/at/de/articles/explore-the-world/in-my-hood-district-helsinki", "/at/de/articles/explore-the-world/in-my-hood-district-houston", "/at/de/articles/explore-the-world/in-my-hood-district-malaga", "/at/de/articles/explore-the-world/in-my-hood-district-nairobi", "/at/de/articles/explore-the-world/in-my-hood-district-porto", "/at/de/articles/explore-the-world/in-my-hood-district-viii-budapest", "/at/de/articles/explore-the-world/in-my-hood-district-zurich", "/at/de/articles/explore-the-world/in-my-hood-gamlebyen-oslo", "/at/de/articles/explore-the-world/in-my-hood-geylang-singapur", "/at/de/articles/explore-the-world/in-my-hood-gulou-beijing", "/at/de/articles/explore-the-world/in-my-hood-hollywood-road-hong-kong", "/at/de/articles/explore-the-world/in-my-hood-indiranagar-bengaluru", "/at/de/articles/explore-the-world/in-my-hood-ipanema-rio-de-janeiro", "/at/de/articles/explore-the-world/in-my-hood-japantown-san-francisco", "/at/de/articles/explore-the-world/in-my-hood-kadikoey-istanbul", "/at/de/articles/explore-the-world/in-my-hood-kampung-attap-kuala-lumpur", "/at/de/articles/explore-the-world/in-my-hood-kreuzberg-berlin", "/at/de/articles/explore-the-world/in-my-hood-larchmont-la", "/at/de/articles/explore-the-world/in-my-hood-le-sentier-paris", "/at/de/articles/explore-the-world/in-my-hood-mallorca", "/at/de/articles/explore-the-world/in-my-hood-metaxourgeio-athens", "/at/de/articles/explore-the-world/in-my-hood-mount-pleasant-washington", "/at/de/articles/explore-the-world/in-my-hood-munich-sendling", "/at/de/articles/explore-the-world/in-my-hood-nice-ouest", "/at/de/articles/explore-the-world/in-my-hood-noord-amsterdam", "/at/de/articles/explore-the-world/in-my-hood-ny-brooklyn", "/at/de/articles/explore-the-world/in-my-hood-osterbro-kopenhagen", "/at/de/articles/explore-the-world/in-my-hood-palermo-buenos-aires", "/at/de/articles/explore-the-world/in-my-hood-plaza-midwood-charlotte", "/at/de/articles/explore-the-world/in-my-hood-poblenou-barcelona", "/at/de/articles/explore-the-world/in-my-hood-rome-pigneto-rome", "/at/de/articles/explore-the-world/in-my-hood-rosebank-johannesburg", "/at/de/articles/explore-the-world/in-my-hood-sachsenhausen-frankfurt", "/at/de/articles/explore-the-world/in-my-hood-salamanca-madrid", "/at/de/articles/explore-the-world/in-my-hood-schanzenviertel-hamburg", "/at/de/articles/explore-the-world/in-my-hood-schaumburg-chicago", "/at/de/articles/explore-the-world/in-my-hood-seventh-district-vienna", "/at/de/articles/explore-the-world/in-my-hood-shinjuku-tokyo", "/at/de/articles/explore-the-world/in-my-hood-song-wat-road-bangkok", "/at/de/articles/explore-the-world/in-my-hood-south-beach-miami", "/at/de/articles/explore-the-world/in-my-hood-the-bund-shanghai", "/at/de/articles/explore-the-world/in-my-hood-toronto-summerhill", "/at/de/articles/explore-the-world/in-my-hood-vasastaden-stockholm", "/at/de/articles/explore-the-world/in-my-hood-vrsovice-prague", "/at/de/articles/explore-the-world/in-my-hood-west-seattle-seattle", "/at/de/articles/explore-the-world/know-before-you-go-algiers", "/at/de/articles/explore-the-world/know-before-you-go-almaty", "/at/de/articles/explore-the-world/know-before-you-go-amman", "/at/de/articles/explore-the-world/know-before-you-go-atlanta", "/at/de/articles/explore-the-world/know-before-you-go-beijing", "/at/de/articles/explore-the-world/know-before-you-go-berlin", "/at/de/articles/explore-the-world/know-before-you-go-bilbao", "/at/de/articles/explore-the-world/know-before-you-go-bogota", "/at/de/articles/explore-the-world/know-before-you-go-boston", "/at/de/articles/explore-the-world/know-before-you-go-cagliari", "/at/de/articles/explore-the-world/know-before-you-go-cairo", "/at/de/articles/explore-the-world/know-before-you-go-casablanca", "/at/de/articles/explore-the-world/know-before-you-go-catania", "/at/de/articles/explore-the-world/know-before-you-go-chennai", "/at/de/articles/explore-the-world/know-before-you-go-dallas", "/at/de/articles/explore-the-world/know-before-you-go-denver", "/at/de/articles/explore-the-world/know-before-you-go-detroit", "/at/de/articles/explore-the-world/know-before-you-go-dubai", "/at/de/articles/explore-the-world/know-before-you-go-edinburgh", "/at/de/articles/explore-the-world/know-before-you-go-faro", "/at/de/articles/explore-the-world/know-before-you-go-gothenburg", "/at/de/articles/explore-the-world/know-before-you-go-hamburg", "/at/de/articles/explore-the-world/know-before-you-go-houston", "/at/de/articles/explore-the-world/know-before-you-go-hyderabad", "/at/de/articles/explore-the-world/know-before-you-go-kuala-lumpur", "/at/de/articles/explore-the-world/know-before-you-go-larnaca", "/at/de/articles/explore-the-world/know-before-you-go-ljubljana", "/at/de/articles/explore-the-world/know-before-you-go-malaga", "/at/de/articles/explore-the-world/know-before-you-go-manchester", "/at/de/articles/explore-the-world/know-before-you-go-marseille", "/at/de/articles/explore-the-world/know-before-you-go-minneapolis-st-paul", "/at/de/articles/explore-the-world/know-before-you-go-nairobi", "/at/de/articles/explore-the-world/know-before-you-go-nice", "/at/de/articles/explore-the-world/know-before-you-go-olbia", "/at/de/articles/explore-the-world/know-before-you-go-porto", "/at/de/articles/explore-the-world/know-before-you-go-raleigh-durham", "/at/de/articles/explore-the-world/know-before-you-go-riga", "/at/de/articles/explore-the-world/know-before-you-go-riyadh", "/at/de/articles/explore-the-world/know-before-you-go-san-diego", "/at/de/articles/explore-the-world/know-before-you-go-seattle", "/at/de/articles/explore-the-world/know-before-you-go-st-louis", "/at/de/articles/explore-the-world/know-before-you-go-tallinn", "/at/de/articles/explore-the-world/know-before-you-go-tbilisi", "/at/de/articles/explore-the-world/know-before-you-go-tel-aviv", "/at/de/articles/explore-the-world/know-before-you-go-thessaloniki", "/at/de/articles/explore-the-world/know-before-you-go-tirana", "/at/de/articles/explore-the-world/know-before-you-go-tunis", "/at/de/articles/explore-the-world/know-before-you-go-valletta", "/at/de/articles/explore-the-world/know-before-you-go-venice", "/at/de/articles/explore-the-world/know-before-you-go-vilnius", "/at/de/articles/explore-the-world/know-before-you-go-zagreb", "/at/de/articles/explore-the-world/my-experiences-in-vancouver", "/at/de/articles/explore-the-world/new-shopping", "/at/de/articles/explore-the-world/next-level-gaming", "/at/de/articles/explore-the-world/on-the-scene-architecture-copenhagen", "/at/de/articles/explore-the-world/on-the-scene-art-and-pubs-dublin", "/at/de/articles/explore-the-world/on-the-scene-art-johannesburg", "/at/de/articles/explore-the-world/on-the-scene-bar-basso-milan", "/at/de/articles/explore-the-world/on-the-scene-bookstores-buenos-aires", "/at/de/articles/explore-the-world/on-the-scene-braamfontein-johannesburg", "/at/de/articles/explore-the-world/on-the-scene-brunch-restaurants-la", "/at/de/articles/explore-the-world/on-the-scene-caspar-plautz-munich", "/at/de/articles/explore-the-world/on-the-scene-chicago-beer", "/at/de/articles/explore-the-world/on-the-scene-creative-architecture-prague", "/at/de/articles/explore-the-world/on-the-scene-culinary-trip-washington", "/at/de/articles/explore-the-world/on-the-scene-fashion-and-culture-budapest", "/at/de/articles/explore-the-world/on-the-scene-food-mumbai", "/at/de/articles/explore-the-world/on-the-scene-food-trends-amsterdam", "/at/de/articles/explore-the-world/on-the-scene-food-trends-bengaluru", "/at/de/articles/explore-the-world/on-the-scene-food-trends-istanbul", "/at/de/articles/explore-the-world/on-the-scene-hidden-gems-seoul", "/at/de/articles/explore-the-world/on-the-scene-humor-vienna", "/at/de/articles/explore-the-world/on-the-scene-listening-bars-toronto", "/at/de/articles/explore-the-world/on-the-scene-lunch-mexico-city", "/at/de/articles/explore-the-world/on-the-scene-mallorca", "/at/de/articles/explore-the-world/on-the-scene-music-cape-town", "/at/de/articles/explore-the-world/on-the-scene-samba-rio-de-janeiro", "/at/de/articles/explore-the-world/on-the-scene-san-francisco-fashion", "/at/de/articles/explore-the-world/on-the-scene-shanghai-art-scene", "/at/de/articles/explore-the-world/on-the-scene-shopping-barcelona", "/at/de/articles/explore-the-world/on-the-scene-shopping-lisbon", "/at/de/articles/explore-the-world/on-the-scene-shopping-tokyo", "/at/de/articles/explore-the-world/on-the-scene-sports-miami", "/at/de/articles/explore-the-world/on-the-scene-stockholm", "/at/de/articles/explore-the-world/on-the-scene-street-art-charlotte", "/at/de/articles/explore-the-world/on-the-scene-street-art-london", "/at/de/articles/explore-the-world/on-the-scene-streetart-athens", "/at/de/articles/explore-the-world/on-the-scene-super-bros-frankfurt", "/at/de/articles/explore-the-world/on-the-scene-supper-clubs-ny", "/at/de/articles/explore-the-world/on-the-scene-techno-sound-rome", "/at/de/articles/explore-the-world/on-the-scene-tips-oslo", "/at/de/articles/explore-the-world/on-the-scene-topic-bangkok", "/at/de/articles/explore-the-world/on-the-scene-topic-helsinki", "/at/de/articles/explore-the-world/on-the-scene-topic-zurich", "/at/de/articles/explore-the-world/on-the-scene-trends-madrid", "/at/de/articles/explore-the-world/on-the-scene-urban-farming-singapore", "/at/de/articles/explore-the-world/on-the-scene-vancouver-donuts", "/at/de/articles/explore-the-world/on-the-scene-wellness-cuisine-hong-kong", "/at/de/articles/explore-the-world/perfect-day-nice-cote-dazur", "/at/de/articles/explore-the-world/perfect-day-seattle", "/at/de/articles/explore-the-world/perfect-day-tips-vancouver", "/at/de/articles/explore-the-world/picture-perfect-austin", "/at/de/articles/explore-the-world/picture-perfect-beijing", "/at/de/articles/explore-the-world/picture-perfect-bogota", "/at/de/articles/explore-the-world/picture-perfect-boston", "/at/de/articles/explore-the-world/picture-perfect-cairo", "/at/de/articles/explore-the-world/picture-perfect-elevator-boys", "/at/de/articles/explore-the-world/picture-perfect-hyderabad", "/at/de/articles/explore-the-world/picture-perfect-la", "/at/de/articles/explore-the-world/picture-perfect-ny", "/at/de/articles/explore-the-world/picture-perfect-riad", "/at/de/articles/explore-the-world/picture-perfect-singapore", "/at/de/articles/explore-the-world/sao-paulo-sights", "/at/de/articles/explore-the-world/stop-over-bangkok", "/at/de/articles/explore-the-world/stop-over-beijing", "/at/de/articles/explore-the-world/stop-over-boston", "/at/de/articles/explore-the-world/stop-over-buenos-aires", "/at/de/articles/explore-the-world/stop-over-charlotte", "/at/de/articles/explore-the-world/stop-over-hong-kong", "/at/de/articles/explore-the-world/stop-over-johannesburg", "/at/de/articles/explore-the-world/stop-over-los-angeles", "/at/de/articles/explore-the-world/stop-over-mexico-city", "/at/de/articles/explore-the-world/stop-over-seoul", "/at/de/articles/explore-the-world/stop-over-singapore", "/at/de/articles/explore-the-world/stop-over-tokyo", "/at/de/articles/explore-the-world/stop-over-washington", "/at/de/articles/explore-the-world/team-sport", "/at/de/articles/explore-the-world/what-i-learned-living-in-amsterdam", "/at/de/articles/explore-the-world/what-i-learned-living-in-athens", "/at/de/articles/explore-the-world/what-i-learned-living-in-bangkok", "/at/de/articles/explore-the-world/what-i-learned-living-in-barcelona", "/at/de/articles/explore-the-world/what-i-learned-living-in-bengaluru", "/at/de/articles/explore-the-world/what-i-learned-living-in-boston", "/at/de/articles/explore-the-world/what-i-learned-living-in-budapest", "/at/de/articles/explore-the-world/what-i-learned-living-in-buenos-aires", "/at/de/articles/explore-the-world/what-i-learned-living-in-cape-town", "/at/de/articles/explore-the-world/what-i-learned-living-in-charlotte", "/at/de/articles/explore-the-world/what-i-learned-living-in-chicago", "/at/de/articles/explore-the-world/what-i-learned-living-in-dublin", "/at/de/articles/explore-the-world/what-i-learned-living-in-frankfurt", "/at/de/articles/explore-the-world/what-i-learned-living-in-helsinki", "/at/de/articles/explore-the-world/what-i-learned-living-in-hong-kong", "/at/de/articles/explore-the-world/what-i-learned-living-in-istanbul", "/at/de/articles/explore-the-world/what-i-learned-living-in-johannesburg", "/at/de/articles/explore-the-world/what-i-learned-living-in-la", "/at/de/articles/explore-the-world/what-i-learned-living-in-lisbon", "/at/de/articles/explore-the-world/what-i-learned-living-in-london", "/at/de/articles/explore-the-world/what-i-learned-living-in-madrid", "/at/de/articles/explore-the-world/what-i-learned-living-in-mallorca", "/at/de/articles/explore-the-world/what-i-learned-living-in-mexico-city", "/at/de/articles/explore-the-world/what-i-learned-living-in-miami", "/at/de/articles/explore-the-world/what-i-learned-living-in-milan", "/at/de/articles/explore-the-world/what-i-learned-living-in-mumbai", "/at/de/articles/explore-the-world/what-i-learned-living-in-munich", "/at/de/articles/explore-the-world/what-i-learned-living-in-ny", "/at/de/articles/explore-the-world/what-i-learned-living-in-oslo", "/at/de/articles/explore-the-world/what-i-learned-living-in-paris", "/at/de/articles/explore-the-world/what-i-learned-living-in-prague", "/at/de/articles/explore-the-world/what-i-learned-living-in-rio-de-janeiro", "/at/de/articles/explore-the-world/what-i-learned-living-in-rome", "/at/de/articles/explore-the-world/what-i-learned-living-in-san-francisco", "/at/de/articles/explore-the-world/what-i-learned-living-in-seoul", "/at/de/articles/explore-the-world/what-i-learned-living-in-shanghai", "/at/de/articles/explore-the-world/what-i-learned-living-in-singapore", "/at/de/articles/explore-the-world/what-i-learned-living-in-stockholm", "/at/de/articles/explore-the-world/what-i-learned-living-in-tokyo", "/at/de/articles/explore-the-world/what-i-learned-living-in-toronto", "/at/de/articles/explore-the-world/what-i-learned-living-in-vienna", "/at/de/articles/explore-the-world/what-i-learned-living-in-washington", "/at/de/articles/explore-the-world/what-i-learned-living-in-zurich", "/at/de/articles/highlights", "/at/de/articles/highlights-european-championship", "/at/de/articles/highlights-european-championship/european-championship-2024-great-hope", "/at/de/articles/highlights-european-championship/european-championship-2024-locations", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-andrich", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-anton", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-baumann", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-beier", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-fuellkrug", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-kimmich", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-kroos", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-mittelstaedt", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-raum", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-tah", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-ter-stegen", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-undav", "/at/de/articles/highlights-european-championship/european-championship-2024-quiz", "/at/de/articles/highlights-european-championship/european-championship-2024-thank-you", "/at/de/articles/highlights-european-championship/hungary-with-pride-and-passion", "/at/de/articles/highlights-european-championship/lose-like-the-germans", "/at/de/articles/highlights-european-championship/meet-the-germans", "/at/de/articles/highlights-european-championship/scotland-with-heart-and-energy", "/at/de/articles/highlights-european-championship/swiss-passion-meets-precision", "/at/de/articles/highlights/all-it-takes-is-a-yes", "/at/de/articles/highlights/allegris-a-new-flight-experience", "/at/de/articles/highlights/allegris-business-class-shanghai", "/at/de/articles/highlights/allegris-business-san-diego", "/at/de/articles/highlights/allegris-destinations", "/at/de/articles/highlights/allegris-dirk-nowitzki", "/at/de/articles/highlights/allegris-essentials", "/at/de/articles/highlights/allegris-experiences", "/at/de/articles/highlights/allegris-new-york", "/at/de/articles/highlights/allegris-premium-economy-san-diego", "/at/de/articles/highlights/allegris-travel-hacks", "/at/de/articles/highlights/allegris-typologies", "/at/de/articles/highlights/austin-texas-city-of-live-music", "/at/de/articles/highlights/chisinau-winter", "/at/de/articles/highlights/dfb-partnership-diversity-success", "/at/de/articles/highlights/exclusive-first-class-tracksuit", "/at/de/articles/highlights/fashion-footprints-new-york", "/at/de/articles/highlights/hyderabad-city-of-pearls-and-programmers", "/at/de/articles/highlights/johannesburg-winter", "/at/de/articles/highlights/minneapolis-best-winter-activities", "/at/de/articles/highlights/minneapolis-winter", "/at/de/articles/highlights/new-york-fashion-week", "/at/de/articles/highlights/raleigh-nc-winter", "/at/de/articles/highlights/rome-art-and-culture", "/at/de/articles/highlights/sao-paulo-carnival-brazil-largest-street-carnival", "/at/de/articles/highlights/seattle-winter", "/at/de/articles/highlights/shanghai-best-restaurants-and-traditional-chinese-dishes", "/at/de/articles/highlights/sports-experiences-rio-de-janeiro", "/at/de/articles/highlights/stefan-marx-travel-hacks", "/at/de/articles/highlights/the-art-of-flying-extra-long-bed", "/at/de/articles/highlights/the-art-of-flying-extra-space-seat", "/at/de/articles/highlights/the-art-of-flying-suite", "/at/de/articles/highlights/vancouver-winter", "/at/de/articles/tags", "/at/de/articles/tags/algiers", "/at/de/articles/tags/allegris", "/at/de/articles/tags/allegris-inspires", "/at/de/articles/tags/almaty", "/at/de/articles/tags/amman", "/at/de/articles/tags/amsterdam", "/at/de/articles/tags/art", "/at/de/articles/tags/art-basel-miami-beach", "/at/de/articles/tags/athens", "/at/de/articles/tags/atlanta", "/at/de/articles/tags/bangkok", "/at/de/articles/tags/barcelona", "/at/de/articles/tags/be-picky", "/at/de/articles/tags/beijing", "/at/de/articles/tags/bengaluru", "/at/de/articles/tags/berlin", "/at/de/articles/tags/bilbao", "/at/de/articles/tags/bogota", "/at/de/articles/tags/boston", "/at/de/articles/tags/budapest", "/at/de/articles/tags/buenos-aires", "/at/de/articles/tags/cagliari", "/at/de/articles/tags/cairo", "/at/de/articles/tags/cape-town", "/at/de/articles/tags/casablanca", "/at/de/articles/tags/catania", "/at/de/articles/tags/charlotte", "/at/de/articles/tags/chennai", "/at/de/articles/tags/chicago", "/at/de/articles/tags/copenhagen", "/at/de/articles/tags/dallas", "/at/de/articles/tags/denver", "/at/de/articles/tags/detroit", "/at/de/articles/tags/dubai", "/at/de/articles/tags/dublin", "/at/de/articles/tags/eat-see-do", "/at/de/articles/tags/edinburgh", "/at/de/articles/tags/essentials", "/at/de/articles/tags/faro", "/at/de/articles/tags/fly-with-me", "/at/de/articles/tags/flying-high", "/at/de/articles/tags/food", "/at/de/articles/tags/frankfurt", "/at/de/articles/tags/frequent-flyers", "/at/de/articles/tags/future-of-flying", "/at/de/articles/tags/gothenburg", "/at/de/articles/tags/hamburg", "/at/de/articles/tags/helsinki", "/at/de/articles/tags/history", "/at/de/articles/tags/hong-kong", "/at/de/articles/tags/houston", "/at/de/articles/tags/hyderabad", "/at/de/articles/tags/in-my-hood", "/at/de/articles/tags/inside-lufthansa", "/at/de/articles/tags/istanbul", "/at/de/articles/tags/johannesburg", "/at/de/articles/tags/know-before-you-go", "/at/de/articles/tags/kuala-lumpur", "/at/de/articles/tags/larnaca", "/at/de/articles/tags/lisbon", "/at/de/articles/tags/ljubljana", "/at/de/articles/tags/london", "/at/de/articles/tags/los-angeles", "/at/de/articles/tags/madrid", "/at/de/articles/tags/malaga", "/at/de/articles/tags/mallorca", "/at/de/articles/tags/manchester", "/at/de/articles/tags/marseille", "/at/de/articles/tags/mexico-city", "/at/de/articles/tags/miami", "/at/de/articles/tags/milan", "/at/de/articles/tags/minneapolis-st-paul", "/at/de/articles/tags/mumbai", "/at/de/articles/tags/munich", "/at/de/articles/tags/music", "/at/de/articles/tags/my-world", "/at/de/articles/tags/nairobi", "/at/de/articles/tags/new-york", "/at/de/articles/tags/nice", "/at/de/articles/tags/olbia", "/at/de/articles/tags/on-the-scene", "/at/de/articles/tags/oslo", "/at/de/articles/tags/paris", "/at/de/articles/tags/perfect-day", "/at/de/articles/tags/picture-perfect", "/at/de/articles/tags/porto", "/at/de/articles/tags/prague", "/at/de/articles/tags/raleigh-durham", "/at/de/articles/tags/riga", "/at/de/articles/tags/rio-de-janeiro", "/at/de/articles/tags/riyadh", "/at/de/articles/tags/rome", "/at/de/articles/tags/san-diego", "/at/de/articles/tags/san-francisco", "/at/de/articles/tags/seattle", "/at/de/articles/tags/seoul", "/at/de/articles/tags/shanghai", "/at/de/articles/tags/shopping", "/at/de/articles/tags/singapore", "/at/de/articles/tags/sport", "/at/de/articles/tags/st-louis", "/at/de/articles/tags/stockholm", "/at/de/articles/tags/stop-over", "/at/de/articles/tags/tallinn", "/at/de/articles/tags/tbilisi", "/at/de/articles/tags/team-stories", "/at/de/articles/tags/tel-aviv", "/at/de/articles/tags/thessaloniki", "/at/de/articles/tags/tirana", "/at/de/articles/tags/tokyo", "/at/de/articles/tags/toronto", "/at/de/articles/tags/tunis", "/at/de/articles/tags/valletta", "/at/de/articles/tags/vancouver", "/at/de/articles/tags/venice", "/at/de/articles/tags/vienna", "/at/de/articles/tags/vilnius", "/at/de/articles/tags/washington-dc", "/at/de/articles/tags/what-i-learned", "/at/de/articles/tags/what-the-hack", "/at/de/articles/tags/yes-stories", "/at/de/articles/tags/zagreb", "/at/de/articles/tags/zurich", "/at/de/assistenzhunde", "/at/de/automatic-check-in", "/at/de/baggage-irregularities", "/at/de/bedeutsamste-strecken", "/at/de/befoerderungsbedingungen-group", "/at/de/befoerderungsbedingungen-lh", "/at/de/besondere-befoerderungsbedingungen-bus", "/at/de/betreuungsbedarf", "/at/de/bid-upgrade", "/at/de/boarding", "/at/de/boeing787", "/at/de/book-and-manage/additional-services/get-your-guide", "/at/de/book-and-manage/additional-services/travel-insurances", "/at/de/book-and-manage/booking-services/manage-my-bookings", "/at/de/book-and-manage/cancellation-and-refund/refund/confirmation", "/at/de/book-and-manage/cancellation-and-refund/refund/refund-form", "/at/de/book-and-manage/destination", "/at/de/book-and-manage/digital-self-services/airline-apps", "/at/de/book-and-manage/flights/air-baltic", "/at/de/book-and-manage/flights/ana", "/at/de/book-and-manage/flights/ana/faq", "/at/de/book-and-manage/flights/giftvoucher", "/at/de/book-and-manage/flights/helvetic", "/at/de/book-and-manage/flights/lufthansa-voucher", "/at/de/book-and-manage/flights/wetlease-hub", "/at/de/book-and-manage/passenger-receipt-90days/confirmation", "/at/de/book-and-manage/pax-receipt", "/at/de/book-and-manage/pax-receipt/invoices-different-countries", "/at/de/book-and-manage/rebook", "/at/de/book-and-manage/rebook/involuntary-rebooking", "/at/de/book-and-manage/rebook/voluntary-rebooking", "/at/de/book-and-manage/stopover", "/at/de/book-and-manage/stopover/bayerischer-hof", "/at/de/book-and-manage/stopover/neuschwanstein", "/at/de/book-and-manage/stopover/zugspitze", "/at/de/business-class", "/at/de/business-class-auf-kurz-und-mittelstrecken", "/at/de/business-services", "/at/de/cancellations-and-refunds", "/at/de/cash-and-miles", "/at/de/check-in-baggage", "/at/de/common", "/at/de/common/accessibility-statement", "/at/de/common/agb-extra-services-at-online-check-in", "/at/de/common/agb-extra-services-at-online-check-in/conditions-seat-reservation", "/at/de/common/baggage-conditions", "/at/de/common/compensation-voucher", "/at/de/common/imprint/lufthansa-insights-imprint", "/at/de/common/privacy-statement/privacy-statement-group", "/at/de/common/seatreservation-condtions/seat-reservations", "/at/de/cookie-policy", "/at/de/culinaryjourney", "/at/de/dangerous-dogs", "/at/de/datenerfassung-fuer-die-usa", "/at/de/datenerfassung-fuer-kanada", "/at/de/datenschutz", "/at/de/digital-self-services", "/at/de/digital-travel-companion", "/at/de/digitale-gepaeckservices", "/at/de/discover-lufthansa/carbon-offsetting/climate-protection-projects", "/at/de/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge", "/at/de/discover-lufthansa/carbon-offsetting/faq-saf", "/at/de/discover-lufthansa/carbon-offsetting/saf", "/at/de/discover-lufthansa/flightreservation-priceguarantee", "/at/de/discover-lufthansa/lufthansa-fleet/351", "/at/de/discover-lufthansa/lufthansa-group-airlines/ita-airways", "/at/de/discover-lufthansa/miles-and-more-credit-card", "/at/de/discover-lufthansa/new-onboard-experience", "/at/de/discover-lufthansa/take-off", "/at/de/doctor-on-board", "/at/de/doctor-on-board-news", "/at/de/during-your-trip/internet-overview", "/at/de/during-your-trip/lhg-wifi", "/at/de/economy-class", "/at/de/electronic-bag-tags", "/at/de/entryprocesses", "/at/de/europa-tarife-economy-class", "/at/de/europcar", "/at/de/event/esorics-2027", "/at/de/exclusive-charter", "/at/de/faq-data-security", "/at/de/faq-ejournals", "/at/de/faq-password-security", "/at/de/farealert/best-price-alert", "/at/de/feedback", "/at/de/feedback-past-flight", "/at/de/feedback/feedbackai", "/at/de/fia-valet-service", "/at/de/first-class", "/at/de/first-class-lounges", "/at/de/first-class-personal-assistant", "/at/de/first-class-terminal", "/at/de/first-class-valet-parking-service", "/at/de/fliegen-mit-baby", "/at/de/fliegen-mit-kindern", "/at/de/fliegen-mit-kleinkind", "/at/de/fluege", "/at/de/flughafeninformation", "/at/de/flugplan-und-flugstatus", "/at/de/flugsuche", "/at/de/flugunregelmaessigkeiten", "/at/de/flynet", "/at/de/fmg-valet-parking-service", "/at/de/frankfurt-fair", "/at/de/free2move", "/at/de/freigepaeck-regeln", "/at/de/gefaehrliche-gegenstaende", "/at/de/gepaeck", "/at/de/geschaeftsbedingungen", "/at/de/gesund-reisen", "/at/de/good-for-train", "/at/de/green-fare", "/at/de/group-travel", "/at/de/gruppenreisen-und-charter", "/at/de/handgepaeck", "/at/de/help-and-contact", "/at/de/hertz", "/at/de/homepage", "/at/de/hotelangebote", "/at/de/impressum", "/at/de/informationen-zum-datenschutz", "/at/de/kinder-an-bord", "/at/de/kindermenues-an-bord", "/at/de/local-page/black-friday", "/at/de/lounge-begleitung", "/at/de/lounges", "/at/de/lufthansa-am-flughafen-duesseldorf", "/at/de/lufthansa-am-flughafen-frankfurt", "/at/de/lufthansa-am-flughafen-wien", "/at/de/lufthansa-at-berlin-airport", "/at/de/lufthansa-at-zuerich-airport", "/at/de/lufthansa-aviation-group", "/at/de/lufthansa-business-class-on-long-haul-routes", "/at/de/lufthansa-city/culinaryjourney", "/at/de/lufthansa-city/menu-card", "/at/de/lufthansa-express", "/at/de/lufthansa-express-bus", "/at/de/lufthansa-express-rail", "/at/de/lufthansa-firmenkunden", "/at/de/lufthansa-first-class-entertainment", "/at/de/lufthansa-first-class-flotte", "/at/de/lufthansa-first-class-komfort", "/at/de/lufthansa-group-star-alliance-and-partner-airlines", "/at/de/lufthansa-guide-service", "/at/de/lufthansa-reiseklassen", "/at/de/lufthansa-terminal-muenchen", "/at/de/medikamenten-transport", "/at/de/meetings-and-events", "/at/de/meetings-und-events-individuelle-angebotsanfrage", "/at/de/meetings-und-events-teilnehmer", "/at/de/mein-logbuch", "/at/de/meine-buchungen", "/at/de/menues-auf-langstreckenfluegen", "/at/de/menues-reiseklassen", "/at/de/mietwagenangebote", "/at/de/miles-and-more", "/at/de/mit-kindern-am-flughafen", "/at/de/mobility-partner-program-healthcare", "/at/de/munich-fair", "/at/de/nachhaltiger-fliegen", "/at/de/nutzungsbedingungen", "/at/de/nutzungsbedingungen-waehrungsumrechnung", "/at/de/onboard-delights", "/at/de/onboard-delights-faq", "/at/de/online-check-in", "/at/de/online-check-in-info", "/at/de/online-check-in-mit-der-ganzen-familie", "/at/de/overview-flights", "/at/de/overview-manage", "/at/de/overview-special-request", "/at/de/overview-travel-information", "/at/de/partner", "/at/de/passenger-receipt-90", "/at/de/passenger-rights", "/at/de/passengers-using-wheelchairs", "/at/de/passengers-with-sensory-impairment", "/at/de/pre-check-in", "/at/de/premium-economy-class", "/at/de/prepare-for-your-trip/baggage/baggage-conditions", "/at/de/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg", "/at/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay", "/at/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage", "/at/de/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage", "/at/de/prepare-for-your-trip/baggage/electronic-devices-and-batteries", "/at/de/prepare-for-your-trip/baggage/sport-baggage/register-ammunition", "/at/de/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation", "/at/de/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation", "/at/de/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation", "/at/de/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation", "/at/de/prepare-for-your-trip/current-travel-information", "/at/de/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system", "/at/de/prepare-for-your-trip/entry-regulations/immigration-regulations-uk", "/at/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing", "/at/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing", "/at/de/prepare-for-your-trip/special-travel-needs/medical-travel-companions", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment", "/at/de/prepare-for-your-trip/travel-classes/economy-basic", "/at/de/prepare-for-your-trip/travelling-with-children/child-in-businessclass", "/at/de/prepare-for-your-trip/travelling-with-children/planning-with-kids", "/at/de/rail-and-fly", "/at/de/rail-fly-bedingungen", "/at/de/rechnungsbeleg", "/at/de/refund", "/at/de/register-animal-cabin", "/at/de/reisebueros", "/at/de/reisen-mit-besonderen-anforderungen", "/at/de/rollstuhlbatterien", "/at/de/schengen", "/at/de/secure-flight", "/at/de/security-fast-lanes", "/at/de/sepa-bedingungen", "/at/de/sepa-bedingungen-b", "/at/de/services-am-flughafen", "/at/de/services-am-flughafen-frankfurt", "/at/de/services-am-flughafen-muenchen", "/at/de/services-an-bord", "/at/de/shopping", "/at/de/sicherheit-fuer-kleinkinder-an-bord", "/at/de/sitzplaene", "/at/de/sitzplatzreservierungen-konditionen", "/at/de/sixt", "/at/de/sondermahlzeiten", "/at/de/speisen-und-getraenke", "/at/de/sportgepaeck", "/at/de/sportgepaeck-hinzufuegen", "/at/de/support/contact/contact-form-confirmation", "/at/de/support/contact/passenger-duty-united-kingdom", "/at/de/support/feedback-and-contact-airlines", "/at/de/support/support", "/at/de/tiere-als-handgepaeck", "/at/de/tiere-als-uebergepaeck", "/at/de/tips-senior-travellers", "/at/de/travel-briefing", "/at/de/travel-expense-management", "/at/de/travel-id-terms-conditions", "/at/de/travelling-with-animals", "/at/de/traveltricks", "/at/de/uebergepaeck", "/at/de/unterhaltung-an-bord", "/at/de/upgrade-business-class-langstrecke", "/at/de/upgrade-first-class", "/at/de/upgrade-in-die-business-class", "/at/de/upgrade-in-die-premium-economy-class", "/at/de/upgrade-informationen", "/at/de/upgrade-premium-economy-class", "/at/de/upgrademoeglichkeiten", "/at/de/upgrades-im-online-check-in", "/at/de/zahlungsmoeglichkeiten-am-flughafen", "/at/de/zeitfenster-sicherheitskontrolle", "/content/lh/markets/de/en/during-your-trip/lounges/loungenet", "/content/lh/markets/de/en/during-your-trip/lounges/loungenet/fra-first-class-lounge-b", "/content/lh/markets/de/en/during-your-trip/lounges/loungenet/muc-first-class-lounge", "/de/de/100-years", "/de/de/100-years/cabin-design", "/de/de/100-years/campaigns", "/de/de/100-years/chronicle", "/de/de/100-years/crane", "/de/de/100-years/destinations", "/de/de/100-years/fleet", "/de/de/100-years/global-network", "/de/de/100-years/history", "/de/de/100-years/history/menu-on-board", "/de/de/320", "/de/de/32n", "/de/de/359", "/de/de/744", "/de/de/accessible-travel", "/de/de/additional-services", "/de/de/admission-rules", "/de/de/adressen-weltweit", "/de/de/advance-seat-reservation", "/de/de/advice-for-travellers-with-special-needs-to-and-from-the-usa", "/de/de/affiliatemarketing", "/de/de/all-check-in", "/de/de/alleinreisende-kinder", "/de/de/anmeldung-tiere-frachtraum", "/de/de/arrival-services", "/de/de/articles", "/de/de/articles/authors", "/de/de/articles/authors/alexandra-mikamo", "/de/de/articles/authors/florian-schwebel", "/de/de/articles/authors/florian-tomberg", "/de/de/articles/authors/julia-buth", "/de/de/articles/authors/till-weisbrod", "/de/de/articles/explore-flying", "/de/de/articles/explore-flying/7-people-who-shaped-lufthansa-history", "/de/de/articles/explore-flying/a-girl-named-lufthansa", "/de/de/articles/explore-flying/aircraft-lights-explained", "/de/de/articles/explore-flying/allegris-business-class-dirk-nowitzki", "/de/de/articles/explore-flying/allegris-exclusive-first-class-loungewear", "/de/de/articles/explore-flying/allegris-first-class-innovations", "/de/de/articles/explore-flying/allegris-first-class-reasons-for-allegris-first-class", "/de/de/articles/explore-flying/allegris-fox", "/de/de/articles/explore-flying/anniversary-super-crane-special", "/de/de/articles/explore-flying/art-basel-miami-beach-stefan-marx", "/de/de/articles/explore-flying/best-airport-restaurants", "/de/de/articles/explore-flying/business-class-culinary-journey-with-johann-lafer", "/de/de/articles/explore-flying/celebrating-20-years-of-excellence", "/de/de/articles/explore-flying/cockpit-collaboration", "/de/de/articles/explore-flying/come-fly-with-me-lufthansa-allegris", "/de/de/articles/explore-flying/culinary-craftsmanship-smoked-fish-for-first-and-business-class", "/de/de/articles/explore-flying/essentials-future-of-flying", "/de/de/articles/explore-flying/essentials-lufthansa-facts", "/de/de/articles/explore-flying/essentials-surprising-lufthansa-numbers", "/de/de/articles/explore-flying/everyone-wants-to-fly-with-the-cranes", "/de/de/articles/explore-flying/female-pilots", "/de/de/articles/explore-flying/first-class-culinary-inspiration-journey-tokyo", "/de/de/articles/explore-flying/first-class-reimagined", "/de/de/articles/explore-flying/first-class-terminal-architecture", "/de/de/articles/explore-flying/flying-high-christoph-quarch", "/de/de/articles/explore-flying/flying-high-meta-city", "/de/de/articles/explore-flying/future-of-flying", "/de/de/articles/explore-flying/help-alliance-engagement-in-tanzania", "/de/de/articles/explore-flying/help-alliance-taking-off-for-a-good-cause", "/de/de/articles/explore-flying/hon-circle-event", "/de/de/articles/explore-flying/how-to-become-a-flight-attendant", "/de/de/articles/explore-flying/how-to-become-a-pilot", "/de/de/articles/explore-flying/inflight-entertainment-vr-experience", "/de/de/articles/explore-flying/inside-lufthansa-lh-allegris", "/de/de/articles/explore-flying/interview-livery-iconic-moments", "/de/de/articles/explore-flying/livery-iconic-moments", "/de/de/articles/explore-flying/lufthansa-allegris-first-class", "/de/de/articles/explore-flying/lufthansa-allegris-welcome-to-the-future-of-aviation", "/de/de/articles/explore-flying/lufthansa-classics", "/de/de/articles/explore-flying/lufthansa-fleet-our-aircrafts", "/de/de/articles/explore-flying/lufthansa-group-wifi", "/de/de/articles/explore-flying/lufthansa-help-alliance-i-fly-for-campaign", "/de/de/articles/explore-flying/lufthansa-in-the-spotlight", "/de/de/articles/explore-flying/lufthansa-innovation-hub-future-of-flying", "/de/de/articles/explore-flying/lufthansa-insights-art", "/de/de/articles/explore-flying/lufthansa-lounges", "/de/de/articles/explore-flying/lufthansa-orchestra-channel-aid-live-in-concert", "/de/de/articles/explore-flying/lufthansa-uniforms-history", "/de/de/articles/explore-flying/meet-the-makers-innovations-for-individual-well-being", "/de/de/articles/explore-flying/meet-the-makers-lufthansa-allegris-business-class", "/de/de/articles/explore-flying/meet-the-makers-lufthansa-allegris-first-class", "/de/de/articles/explore-flying/meet-the-makers-the-manufactures-of-the-first-class-suites", "/de/de/articles/explore-flying/new-lufthansa-lounge-newark-interview", "/de/de/articles/explore-flying/oktoberfest-traditional-bavarian-attire", "/de/de/articles/explore-flying/pride-diversifly-queer-employee-network-lufthansa-group", "/de/de/articles/explore-flying/queer-travel-safer-trips", "/de/de/articles/explore-flying/responsibility-lufthansa", "/de/de/articles/explore-flying/things-you-always-wanted-to-know-about-flying", "/de/de/articles/explore-flying/time-travel-ki-aviation", "/de/de/articles/explore-flying/travel-trends", "/de/de/articles/explore-flying/vacation-packing-list", "/de/de/articles/explore-flying/welcome-to-my-world-alexandra-maria-lara", "/de/de/articles/explore-flying/welcome-to-my-world-bridget-finn", "/de/de/articles/explore-flying/welcome-to-my-world-elyas-mbarek", "/de/de/articles/explore-flying/welcome-to-my-world-emilia-schuele", "/de/de/articles/explore-flying/welcome-to-my-world-karolina-kurkova", "/de/de/articles/explore-flying/welcome-to-my-world-karoline-herfurth", "/de/de/articles/explore-flying/welcome-to-my-world-lexie-alford", "/de/de/articles/explore-flying/what-does-luxury-mean-today", "/de/de/articles/explore-flying/what-the-hack-anti-jetlag-tips", "/de/de/articles/explore-flying/what-the-hack-best-seats", "/de/de/articles/explore-flying/what-the-hack-travel-gadgets", "/de/de/articles/explore-flying/what-the-hack-travel-hacks", "/de/de/articles/explore-flying/what-the-hack-travel-with-kids", "/de/de/articles/explore-flying/what-the-hack-waiting-time-at-the-airport", "/de/de/articles/explore-flying/what-the-hack-what-is-the-etiquette-of-traveling", "/de/de/articles/explore-flying/yes-stories-the-fascination-of-skydiving", "/de/de/articles/explore-flying/yes-stories-the-two-worlds-of-kaye-ree", "/de/de/articles/explore-flying/yes-stories-thorsten-buss", "/de/de/articles/explore-flying/yes-stories-tom-rees", "/de/de/articles/explore-the-world", "/de/de/articles/explore-the-world/a-perfect-day-amsterdam-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-art-basel-miami-beach-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-athens-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-bangkok-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-barcelona-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-beijing-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-bengaluru-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-berlin-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-boston-on-one-day", "/de/de/articles/explore-the-world/a-perfect-day-budapest-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-buenos-aires-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-cape-town-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-charlotte-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-chicago-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-copenhagen-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-dublin-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-frankfurt-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-hamburg", "/de/de/articles/explore-the-world/a-perfect-day-helsinki-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-hong-kong-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-houston-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-istanbul-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-johannesburg-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-la-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-lisbon-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-london-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-madrid-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-malaga-on-one-day", "/de/de/articles/explore-the-world/a-perfect-day-mallorca-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-mexico-city-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-miami-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-milan-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-mumbai-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-munich-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-ny-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-oslo-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-paris-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-porto-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-prague-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-rio-de-janeiro-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-rome-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-san-francisco-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-seoul-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-shanghai-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-singapore-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-stockholm-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-tokyo-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-toronto-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-vienna-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-washington-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-zurich-in-one-day", "/de/de/articles/explore-the-world/a-perfect-nairobi-city-in-one-day", "/de/de/articles/explore-the-world/art-basel-miami-beach-fun-facts", "/de/de/articles/explore-the-world/be-picky-amsterdam-insider-tips", "/de/de/articles/explore-the-world/be-picky-athens-insider-tips", "/de/de/articles/explore-the-world/be-picky-bangkok-insider-tips", "/de/de/articles/explore-the-world/be-picky-barcelona-insider-tips", "/de/de/articles/explore-the-world/be-picky-bengaluru", "/de/de/articles/explore-the-world/be-picky-budapest-insider-tips", "/de/de/articles/explore-the-world/be-picky-buenos-aires-insider-tips", "/de/de/articles/explore-the-world/be-picky-cape-town-insider-tips", "/de/de/articles/explore-the-world/be-picky-charlotte-insider-tips", "/de/de/articles/explore-the-world/be-picky-chicago-insider-tips", "/de/de/articles/explore-the-world/be-picky-copenhagen", "/de/de/articles/explore-the-world/be-picky-dublin-insider-tips", "/de/de/articles/explore-the-world/be-picky-frankfurt-insider-tips", "/de/de/articles/explore-the-world/be-picky-helsinkis-insider-tips", "/de/de/articles/explore-the-world/be-picky-hong-kong-insider-tips", "/de/de/articles/explore-the-world/be-picky-istanbul-insider-tips", "/de/de/articles/explore-the-world/be-picky-johannesburg-insider-tipps", "/de/de/articles/explore-the-world/be-picky-la-insider-tips", "/de/de/articles/explore-the-world/be-picky-lisbon", "/de/de/articles/explore-the-world/be-picky-little-italy-in-vancouver", "/de/de/articles/explore-the-world/be-picky-london-insider-tips", "/de/de/articles/explore-the-world/be-picky-madrid", "/de/de/articles/explore-the-world/be-picky-mallorca-insider-tips", "/de/de/articles/explore-the-world/be-picky-mexico-city-insider-tips", "/de/de/articles/explore-the-world/be-picky-mexico-city-insidertipps", "/de/de/articles/explore-the-world/be-picky-miami-insider-tips", "/de/de/articles/explore-the-world/be-picky-milan-insider-tips", "/de/de/articles/explore-the-world/be-picky-mumbai-insider-tips", "/de/de/articles/explore-the-world/be-picky-munich-insider-tip-anika-landsteiner", "/de/de/articles/explore-the-world/be-picky-ny-insider-tips", "/de/de/articles/explore-the-world/be-picky-oslo-insider-tips", "/de/de/articles/explore-the-world/be-picky-paris-insider-tips", "/de/de/articles/explore-the-world/be-picky-prague-insider-tips", "/de/de/articles/explore-the-world/be-picky-rio-de-janeiro-insider-tips", "/de/de/articles/explore-the-world/be-picky-rome-insider-tips", "/de/de/articles/explore-the-world/be-picky-san-francisco-insider-tips", "/de/de/articles/explore-the-world/be-picky-seoul-insider-tips", "/de/de/articles/explore-the-world/be-picky-shanghai-insider-tips", "/de/de/articles/explore-the-world/be-picky-singapore-insider-tips", "/de/de/articles/explore-the-world/be-picky-stockholm", "/de/de/articles/explore-the-world/be-picky-tokyo-insider-tips", "/de/de/articles/explore-the-world/be-picky-toronto-insider-tips", "/de/de/articles/explore-the-world/be-picky-vienna-insider-tips", "/de/de/articles/explore-the-world/be-picky-washington-insider-tips", "/de/de/articles/explore-the-world/be-picky-zurich-insider-tips", "/de/de/articles/explore-the-world/copenhagen-what-i-have-learned", "/de/de/articles/explore-the-world/eat-see-do-algiers", "/de/de/articles/explore-the-world/eat-see-do-almaty", "/de/de/articles/explore-the-world/eat-see-do-amman", "/de/de/articles/explore-the-world/eat-see-do-atlanta", "/de/de/articles/explore-the-world/eat-see-do-beijing", "/de/de/articles/explore-the-world/eat-see-do-berlin", "/de/de/articles/explore-the-world/eat-see-do-bilbao", "/de/de/articles/explore-the-world/eat-see-do-bogota", "/de/de/articles/explore-the-world/eat-see-do-boston", "/de/de/articles/explore-the-world/eat-see-do-cagliari", "/de/de/articles/explore-the-world/eat-see-do-cairo", "/de/de/articles/explore-the-world/eat-see-do-casablanca", "/de/de/articles/explore-the-world/eat-see-do-catania", "/de/de/articles/explore-the-world/eat-see-do-chennai", "/de/de/articles/explore-the-world/eat-see-do-dallas", "/de/de/articles/explore-the-world/eat-see-do-denver", "/de/de/articles/explore-the-world/eat-see-do-detroit", "/de/de/articles/explore-the-world/eat-see-do-dubai", "/de/de/articles/explore-the-world/eat-see-do-edinburgh", "/de/de/articles/explore-the-world/eat-see-do-faro", "/de/de/articles/explore-the-world/eat-see-do-gothenburg", "/de/de/articles/explore-the-world/eat-see-do-hamburg", "/de/de/articles/explore-the-world/eat-see-do-houston", "/de/de/articles/explore-the-world/eat-see-do-hyderabad", "/de/de/articles/explore-the-world/eat-see-do-kuala-lumpur", "/de/de/articles/explore-the-world/eat-see-do-larnaca", "/de/de/articles/explore-the-world/eat-see-do-ljubljana", "/de/de/articles/explore-the-world/eat-see-do-malaga", "/de/de/articles/explore-the-world/eat-see-do-manchester", "/de/de/articles/explore-the-world/eat-see-do-marseille", "/de/de/articles/explore-the-world/eat-see-do-minneapolis-st-paul", "/de/de/articles/explore-the-world/eat-see-do-nairobi", "/de/de/articles/explore-the-world/eat-see-do-nice", "/de/de/articles/explore-the-world/eat-see-do-olbia", "/de/de/articles/explore-the-world/eat-see-do-porto", "/de/de/articles/explore-the-world/eat-see-do-raleigh-durham", "/de/de/articles/explore-the-world/eat-see-do-riga", "/de/de/articles/explore-the-world/eat-see-do-riyadh", "/de/de/articles/explore-the-world/eat-see-do-san-diego", "/de/de/articles/explore-the-world/eat-see-do-seattle", "/de/de/articles/explore-the-world/eat-see-do-st-louis", "/de/de/articles/explore-the-world/eat-see-do-tallinn", "/de/de/articles/explore-the-world/eat-see-do-tbilisi", "/de/de/articles/explore-the-world/eat-see-do-tel-aviv", "/de/de/articles/explore-the-world/eat-see-do-thessaloniki", "/de/de/articles/explore-the-world/eat-see-do-tirana", "/de/de/articles/explore-the-world/eat-see-do-tunis", "/de/de/articles/explore-the-world/eat-see-do-valletta", "/de/de/articles/explore-the-world/eat-see-do-venice", "/de/de/articles/explore-the-world/eat-see-do-vilnius", "/de/de/articles/explore-the-world/eat-see-do-zagreb", "/de/de/articles/explore-the-world/essentials-amsterdam-facts", "/de/de/articles/explore-the-world/essentials-athens-facts", "/de/de/articles/explore-the-world/essentials-bangkok-facts", "/de/de/articles/explore-the-world/essentials-barcelona-facts", "/de/de/articles/explore-the-world/essentials-beijing-facts", "/de/de/articles/explore-the-world/essentials-bengaluru-facts", "/de/de/articles/explore-the-world/essentials-boston-facts", "/de/de/articles/explore-the-world/essentials-budapest-facts", "/de/de/articles/explore-the-world/essentials-buenos-aires-facts", "/de/de/articles/explore-the-world/essentials-cape-town-facts", "/de/de/articles/explore-the-world/essentials-charlotte-facts", "/de/de/articles/explore-the-world/essentials-chicago-facts", "/de/de/articles/explore-the-world/essentials-copenhagen-facts", "/de/de/articles/explore-the-world/essentials-dublin-facts", "/de/de/articles/explore-the-world/essentials-facts-vancouver", "/de/de/articles/explore-the-world/essentials-frankfurt-facts", "/de/de/articles/explore-the-world/essentials-helsinki-facts", "/de/de/articles/explore-the-world/essentials-hong-kong-facts", "/de/de/articles/explore-the-world/essentials-istanbul-facts", "/de/de/articles/explore-the-world/essentials-johannesburg-facts", "/de/de/articles/explore-the-world/essentials-la-facts", "/de/de/articles/explore-the-world/essentials-lisbon-facts", "/de/de/articles/explore-the-world/essentials-london-facts", "/de/de/articles/explore-the-world/essentials-madrid-facts", "/de/de/articles/explore-the-world/essentials-mallorca-facts", "/de/de/articles/explore-the-world/essentials-mexico-city-facts", "/de/de/articles/explore-the-world/essentials-miami-facts", "/de/de/articles/explore-the-world/essentials-milan-facts", "/de/de/articles/explore-the-world/essentials-mumbai-facts", "/de/de/articles/explore-the-world/essentials-munich-facts", "/de/de/articles/explore-the-world/essentials-ny-facts", "/de/de/articles/explore-the-world/essentials-oslo-facts", "/de/de/articles/explore-the-world/essentials-paris-facts", "/de/de/articles/explore-the-world/essentials-prague-facts", "/de/de/articles/explore-the-world/essentials-rio-de-janeiro-facts", "/de/de/articles/explore-the-world/essentials-rome-facts", "/de/de/articles/explore-the-world/essentials-san-francisco-facts", "/de/de/articles/explore-the-world/essentials-seoul-facts", "/de/de/articles/explore-the-world/essentials-shanghai-facts", "/de/de/articles/explore-the-world/essentials-singapore-facts", "/de/de/articles/explore-the-world/essentials-stockholm-facts", "/de/de/articles/explore-the-world/essentials-tokyo-facts", "/de/de/articles/explore-the-world/essentials-toronto-facts", "/de/de/articles/explore-the-world/essentials-vienna-facts", "/de/de/articles/explore-the-world/essentials-washington-facts", "/de/de/articles/explore-the-world/essentials-zurich-facts", "/de/de/articles/explore-the-world/experience-art-live", "/de/de/articles/explore-the-world/experience-nature", "/de/de/articles/explore-the-world/in-my-hood-apgujeong-seoul", "/de/de/articles/explore-the-world/in-my-hood-arroios-lissabon", "/de/de/articles/explore-the-world/in-my-hood-back-bay-boston", "/de/de/articles/explore-the-world/in-my-hood-bandra-mumbai", "/de/de/articles/explore-the-world/in-my-hood-chiswick-london", "/de/de/articles/explore-the-world/in-my-hood-citta-studi-milan", "/de/de/articles/explore-the-world/in-my-hood-city-centre-cape-town", "/de/de/articles/explore-the-world/in-my-hood-comercial-drive-vancouver", "/de/de/articles/explore-the-world/in-my-hood-coyoacan-mexico-city", "/de/de/articles/explore-the-world/in-my-hood-creative-quarter-dublin", "/de/de/articles/explore-the-world/in-my-hood-district-helsinki", "/de/de/articles/explore-the-world/in-my-hood-district-houston", "/de/de/articles/explore-the-world/in-my-hood-district-malaga", "/de/de/articles/explore-the-world/in-my-hood-district-nairobi", "/de/de/articles/explore-the-world/in-my-hood-district-porto", "/de/de/articles/explore-the-world/in-my-hood-district-viii-budapest", "/de/de/articles/explore-the-world/in-my-hood-district-zurich", "/de/de/articles/explore-the-world/in-my-hood-gamlebyen-oslo", "/de/de/articles/explore-the-world/in-my-hood-geylang-singapur", "/de/de/articles/explore-the-world/in-my-hood-gulou-beijing", "/de/de/articles/explore-the-world/in-my-hood-hollywood-road-hong-kong", "/de/de/articles/explore-the-world/in-my-hood-indiranagar-bengaluru", "/de/de/articles/explore-the-world/in-my-hood-ipanema-rio-de-janeiro", "/de/de/articles/explore-the-world/in-my-hood-japantown-san-francisco", "/de/de/articles/explore-the-world/in-my-hood-kadikoey-istanbul", "/de/de/articles/explore-the-world/in-my-hood-kampung-attap-kuala-lumpur", "/de/de/articles/explore-the-world/in-my-hood-kreuzberg-berlin", "/de/de/articles/explore-the-world/in-my-hood-larchmont-la", "/de/de/articles/explore-the-world/in-my-hood-le-sentier-paris", "/de/de/articles/explore-the-world/in-my-hood-mallorca", "/de/de/articles/explore-the-world/in-my-hood-metaxourgeio-athens", "/de/de/articles/explore-the-world/in-my-hood-mount-pleasant-washington", "/de/de/articles/explore-the-world/in-my-hood-munich-sendling", "/de/de/articles/explore-the-world/in-my-hood-nice-ouest", "/de/de/articles/explore-the-world/in-my-hood-noord-amsterdam", "/de/de/articles/explore-the-world/in-my-hood-ny-brooklyn", "/de/de/articles/explore-the-world/in-my-hood-osterbro-kopenhagen", "/de/de/articles/explore-the-world/in-my-hood-palermo-buenos-aires", "/de/de/articles/explore-the-world/in-my-hood-plaza-midwood-charlotte", "/de/de/articles/explore-the-world/in-my-hood-poblenou-barcelona", "/de/de/articles/explore-the-world/in-my-hood-rome-pigneto-rome", "/de/de/articles/explore-the-world/in-my-hood-rosebank-johannesburg", "/de/de/articles/explore-the-world/in-my-hood-sachsenhausen-frankfurt", "/de/de/articles/explore-the-world/in-my-hood-salamanca-madrid", "/de/de/articles/explore-the-world/in-my-hood-schanzenviertel-hamburg", "/de/de/articles/explore-the-world/in-my-hood-schaumburg-chicago", "/de/de/articles/explore-the-world/in-my-hood-seventh-district-vienna", "/de/de/articles/explore-the-world/in-my-hood-shinjuku-tokyo", "/de/de/articles/explore-the-world/in-my-hood-song-wat-road-bangkok", "/de/de/articles/explore-the-world/in-my-hood-south-beach-miami", "/de/de/articles/explore-the-world/in-my-hood-the-bund-shanghai", "/de/de/articles/explore-the-world/in-my-hood-toronto-summerhill", "/de/de/articles/explore-the-world/in-my-hood-vasastaden-stockholm", "/de/de/articles/explore-the-world/in-my-hood-vrsovice-prague", "/de/de/articles/explore-the-world/in-my-hood-west-seattle-seattle", "/de/de/articles/explore-the-world/know-before-you-go-algiers", "/de/de/articles/explore-the-world/know-before-you-go-almaty", "/de/de/articles/explore-the-world/know-before-you-go-amman", "/de/de/articles/explore-the-world/know-before-you-go-atlanta", "/de/de/articles/explore-the-world/know-before-you-go-beijing", "/de/de/articles/explore-the-world/know-before-you-go-berlin", "/de/de/articles/explore-the-world/know-before-you-go-bilbao", "/de/de/articles/explore-the-world/know-before-you-go-bogota", "/de/de/articles/explore-the-world/know-before-you-go-boston", "/de/de/articles/explore-the-world/know-before-you-go-cagliari", "/de/de/articles/explore-the-world/know-before-you-go-cairo", "/de/de/articles/explore-the-world/know-before-you-go-casablanca", "/de/de/articles/explore-the-world/know-before-you-go-catania", "/de/de/articles/explore-the-world/know-before-you-go-chennai", "/de/de/articles/explore-the-world/know-before-you-go-dallas", "/de/de/articles/explore-the-world/know-before-you-go-denver", "/de/de/articles/explore-the-world/know-before-you-go-detroit", "/de/de/articles/explore-the-world/know-before-you-go-dubai", "/de/de/articles/explore-the-world/know-before-you-go-edinburgh", "/de/de/articles/explore-the-world/know-before-you-go-faro", "/de/de/articles/explore-the-world/know-before-you-go-gothenburg", "/de/de/articles/explore-the-world/know-before-you-go-hamburg", "/de/de/articles/explore-the-world/know-before-you-go-houston", "/de/de/articles/explore-the-world/know-before-you-go-hyderabad", "/de/de/articles/explore-the-world/know-before-you-go-kuala-lumpur", "/de/de/articles/explore-the-world/know-before-you-go-larnaca", "/de/de/articles/explore-the-world/know-before-you-go-ljubljana", "/de/de/articles/explore-the-world/know-before-you-go-malaga", "/de/de/articles/explore-the-world/know-before-you-go-manchester", "/de/de/articles/explore-the-world/know-before-you-go-marseille", "/de/de/articles/explore-the-world/know-before-you-go-minneapolis-st-paul", "/de/de/articles/explore-the-world/know-before-you-go-nairobi", "/de/de/articles/explore-the-world/know-before-you-go-nice", "/de/de/articles/explore-the-world/know-before-you-go-olbia", "/de/de/articles/explore-the-world/know-before-you-go-porto", "/de/de/articles/explore-the-world/know-before-you-go-raleigh-durham", "/de/de/articles/explore-the-world/know-before-you-go-riga", "/de/de/articles/explore-the-world/know-before-you-go-riyadh", "/de/de/articles/explore-the-world/know-before-you-go-san-diego", "/de/de/articles/explore-the-world/know-before-you-go-seattle", "/de/de/articles/explore-the-world/know-before-you-go-st-louis", "/de/de/articles/explore-the-world/know-before-you-go-tallinn", "/de/de/articles/explore-the-world/know-before-you-go-tbilisi", "/de/de/articles/explore-the-world/know-before-you-go-tel-aviv", "/de/de/articles/explore-the-world/know-before-you-go-thessaloniki", "/de/de/articles/explore-the-world/know-before-you-go-tirana", "/de/de/articles/explore-the-world/know-before-you-go-tunis", "/de/de/articles/explore-the-world/know-before-you-go-valletta", "/de/de/articles/explore-the-world/know-before-you-go-venice", "/de/de/articles/explore-the-world/know-before-you-go-vilnius", "/de/de/articles/explore-the-world/know-before-you-go-zagreb", "/de/de/articles/explore-the-world/my-experiences-in-vancouver", "/de/de/articles/explore-the-world/new-shopping", "/de/de/articles/explore-the-world/next-level-gaming", "/de/de/articles/explore-the-world/on-the-scene-architecture-copenhagen", "/de/de/articles/explore-the-world/on-the-scene-art-and-pubs-dublin", "/de/de/articles/explore-the-world/on-the-scene-art-johannesburg", "/de/de/articles/explore-the-world/on-the-scene-bar-basso-milan", "/de/de/articles/explore-the-world/on-the-scene-bookstores-buenos-aires", "/de/de/articles/explore-the-world/on-the-scene-braamfontein-johannesburg", "/de/de/articles/explore-the-world/on-the-scene-brunch-restaurants-la", "/de/de/articles/explore-the-world/on-the-scene-caspar-plautz-munich", "/de/de/articles/explore-the-world/on-the-scene-chicago-beer", "/de/de/articles/explore-the-world/on-the-scene-creative-architecture-prague", "/de/de/articles/explore-the-world/on-the-scene-culinary-trip-washington", "/de/de/articles/explore-the-world/on-the-scene-fashion-and-culture-budapest", "/de/de/articles/explore-the-world/on-the-scene-food-mumbai", "/de/de/articles/explore-the-world/on-the-scene-food-trends-amsterdam", "/de/de/articles/explore-the-world/on-the-scene-food-trends-bengaluru", "/de/de/articles/explore-the-world/on-the-scene-food-trends-istanbul", "/de/de/articles/explore-the-world/on-the-scene-hidden-gems-seoul", "/de/de/articles/explore-the-world/on-the-scene-humor-vienna", "/de/de/articles/explore-the-world/on-the-scene-listening-bars-toronto", "/de/de/articles/explore-the-world/on-the-scene-lunch-mexico-city", "/de/de/articles/explore-the-world/on-the-scene-mallorca", "/de/de/articles/explore-the-world/on-the-scene-music-cape-town", "/de/de/articles/explore-the-world/on-the-scene-samba-rio-de-janeiro", "/de/de/articles/explore-the-world/on-the-scene-san-francisco-fashion", "/de/de/articles/explore-the-world/on-the-scene-shanghai-art-scene", "/de/de/articles/explore-the-world/on-the-scene-shopping-barcelona", "/de/de/articles/explore-the-world/on-the-scene-shopping-lisbon", "/de/de/articles/explore-the-world/on-the-scene-shopping-tokyo", "/de/de/articles/explore-the-world/on-the-scene-sports-miami", "/de/de/articles/explore-the-world/on-the-scene-stockholm", "/de/de/articles/explore-the-world/on-the-scene-street-art-charlotte", "/de/de/articles/explore-the-world/on-the-scene-street-art-london", "/de/de/articles/explore-the-world/on-the-scene-streetart-athens", "/de/de/articles/explore-the-world/on-the-scene-super-bros-frankfurt", "/de/de/articles/explore-the-world/on-the-scene-supper-clubs-ny", "/de/de/articles/explore-the-world/on-the-scene-techno-sound-rome", "/de/de/articles/explore-the-world/on-the-scene-tips-oslo", "/de/de/articles/explore-the-world/on-the-scene-topic-bangkok", "/de/de/articles/explore-the-world/on-the-scene-topic-helsinki", "/de/de/articles/explore-the-world/on-the-scene-topic-zurich", "/de/de/articles/explore-the-world/on-the-scene-trends-madrid", "/de/de/articles/explore-the-world/on-the-scene-urban-farming-singapore", "/de/de/articles/explore-the-world/on-the-scene-vancouver-donuts", "/de/de/articles/explore-the-world/on-the-scene-wellness-cuisine-hong-kong", "/de/de/articles/explore-the-world/perfect-day-nice-cote-dazur", "/de/de/articles/explore-the-world/perfect-day-seattle", "/de/de/articles/explore-the-world/perfect-day-tips-vancouver", "/de/de/articles/explore-the-world/picture-perfect-austin", "/de/de/articles/explore-the-world/picture-perfect-beijing", "/de/de/articles/explore-the-world/picture-perfect-bogota", "/de/de/articles/explore-the-world/picture-perfect-boston", "/de/de/articles/explore-the-world/picture-perfect-cairo", "/de/de/articles/explore-the-world/picture-perfect-elevator-boys", "/de/de/articles/explore-the-world/picture-perfect-hyderabad", "/de/de/articles/explore-the-world/picture-perfect-la", "/de/de/articles/explore-the-world/picture-perfect-ny", "/de/de/articles/explore-the-world/picture-perfect-riad", "/de/de/articles/explore-the-world/picture-perfect-singapore", "/de/de/articles/explore-the-world/sao-paulo-sights", "/de/de/articles/explore-the-world/stop-over-bangkok", "/de/de/articles/explore-the-world/stop-over-beijing", "/de/de/articles/explore-the-world/stop-over-boston", "/de/de/articles/explore-the-world/stop-over-buenos-aires", "/de/de/articles/explore-the-world/stop-over-charlotte", "/de/de/articles/explore-the-world/stop-over-hong-kong", "/de/de/articles/explore-the-world/stop-over-johannesburg", "/de/de/articles/explore-the-world/stop-over-los-angeles", "/de/de/articles/explore-the-world/stop-over-mexico-city", "/de/de/articles/explore-the-world/stop-over-seoul", "/de/de/articles/explore-the-world/stop-over-singapore", "/de/de/articles/explore-the-world/stop-over-tokyo", "/de/de/articles/explore-the-world/stop-over-washington", "/de/de/articles/explore-the-world/team-sport", "/de/de/articles/explore-the-world/what-i-learned-living-in-amsterdam", "/de/de/articles/explore-the-world/what-i-learned-living-in-athens", "/de/de/articles/explore-the-world/what-i-learned-living-in-bangkok", "/de/de/articles/explore-the-world/what-i-learned-living-in-barcelona", "/de/de/articles/explore-the-world/what-i-learned-living-in-bengaluru", "/de/de/articles/explore-the-world/what-i-learned-living-in-boston", "/de/de/articles/explore-the-world/what-i-learned-living-in-budapest", "/de/de/articles/explore-the-world/what-i-learned-living-in-buenos-aires", "/de/de/articles/explore-the-world/what-i-learned-living-in-cape-town", "/de/de/articles/explore-the-world/what-i-learned-living-in-charlotte", "/de/de/articles/explore-the-world/what-i-learned-living-in-chicago", "/de/de/articles/explore-the-world/what-i-learned-living-in-dublin", "/de/de/articles/explore-the-world/what-i-learned-living-in-frankfurt", "/de/de/articles/explore-the-world/what-i-learned-living-in-helsinki", "/de/de/articles/explore-the-world/what-i-learned-living-in-hong-kong", "/de/de/articles/explore-the-world/what-i-learned-living-in-istanbul", "/de/de/articles/explore-the-world/what-i-learned-living-in-johannesburg", "/de/de/articles/explore-the-world/what-i-learned-living-in-la", "/de/de/articles/explore-the-world/what-i-learned-living-in-lisbon", "/de/de/articles/explore-the-world/what-i-learned-living-in-london", "/de/de/articles/explore-the-world/what-i-learned-living-in-madrid", "/de/de/articles/explore-the-world/what-i-learned-living-in-mallorca", "/de/de/articles/explore-the-world/what-i-learned-living-in-mexico-city", "/de/de/articles/explore-the-world/what-i-learned-living-in-miami", "/de/de/articles/explore-the-world/what-i-learned-living-in-milan", "/de/de/articles/explore-the-world/what-i-learned-living-in-mumbai", "/de/de/articles/explore-the-world/what-i-learned-living-in-munich", "/de/de/articles/explore-the-world/what-i-learned-living-in-ny", "/de/de/articles/explore-the-world/what-i-learned-living-in-oslo", "/de/de/articles/explore-the-world/what-i-learned-living-in-paris", "/de/de/articles/explore-the-world/what-i-learned-living-in-prague", "/de/de/articles/explore-the-world/what-i-learned-living-in-rio-de-janeiro", "/de/de/articles/explore-the-world/what-i-learned-living-in-rome", "/de/de/articles/explore-the-world/what-i-learned-living-in-san-francisco", "/de/de/articles/explore-the-world/what-i-learned-living-in-seoul", "/de/de/articles/explore-the-world/what-i-learned-living-in-shanghai", "/de/de/articles/explore-the-world/what-i-learned-living-in-singapore", "/de/de/articles/explore-the-world/what-i-learned-living-in-stockholm", "/de/de/articles/explore-the-world/what-i-learned-living-in-tokyo", "/de/de/articles/explore-the-world/what-i-learned-living-in-toronto", "/de/de/articles/explore-the-world/what-i-learned-living-in-vienna", "/de/de/articles/explore-the-world/what-i-learned-living-in-washington", "/de/de/articles/explore-the-world/what-i-learned-living-in-zurich", "/de/de/articles/highlights", "/de/de/articles/highlights-european-championship", "/de/de/articles/highlights-european-championship/european-championship-2024-great-hope", "/de/de/articles/highlights-european-championship/european-championship-2024-locations", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-andrich", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-anton", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-baumann", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-beier", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-fuellkrug", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-kimmich", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-kroos", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-mittelstaedt", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-raum", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-tah", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-ter-stegen", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-undav", "/de/de/articles/highlights-european-championship/european-championship-2024-quiz", "/de/de/articles/highlights-european-championship/european-championship-2024-thank-you", "/de/de/articles/highlights-european-championship/hungary-with-pride-and-passion", "/de/de/articles/highlights-european-championship/lose-like-the-germans", "/de/de/articles/highlights-european-championship/meet-the-germans", "/de/de/articles/highlights-european-championship/scotland-with-heart-and-energy", "/de/de/articles/highlights-european-championship/swiss-passion-meets-precision", "/de/de/articles/highlights/all-it-takes-is-a-yes", "/de/de/articles/highlights/allegris-a-new-flight-experience", "/de/de/articles/highlights/allegris-business-class-shanghai", "/de/de/articles/highlights/allegris-business-san-diego", "/de/de/articles/highlights/allegris-destinations", "/de/de/articles/highlights/allegris-dirk-nowitzki", "/de/de/articles/highlights/allegris-essentials", "/de/de/articles/highlights/allegris-experiences", "/de/de/articles/highlights/allegris-new-york", "/de/de/articles/highlights/allegris-premium-economy-san-diego", "/de/de/articles/highlights/allegris-travel-hacks", "/de/de/articles/highlights/allegris-typologies", "/de/de/articles/highlights/austin-texas-city-of-live-music", "/de/de/articles/highlights/chisinau-winter", "/de/de/articles/highlights/dfb-partnership-diversity-success", "/de/de/articles/highlights/exclusive-first-class-tracksuit", "/de/de/articles/highlights/fashion-footprints-new-york", "/de/de/articles/highlights/hyderabad-city-of-pearls-and-programmers", "/de/de/articles/highlights/johannesburg-winter", "/de/de/articles/highlights/minneapolis-best-winter-activities", "/de/de/articles/highlights/minneapolis-winter", "/de/de/articles/highlights/new-york-fashion-week", "/de/de/articles/highlights/raleigh-nc-winter", "/de/de/articles/highlights/rome-art-and-culture", "/de/de/articles/highlights/sao-paulo-carnival-brazil-largest-street-carnival", "/de/de/articles/highlights/seattle-winter", "/de/de/articles/highlights/shanghai-best-restaurants-and-traditional-chinese-dishes", "/de/de/articles/highlights/soccer-event-in-north-america", "/de/de/articles/highlights/sports-experiences-rio-de-janeiro", "/de/de/articles/highlights/stefan-marx-travel-hacks", "/de/de/articles/highlights/the-art-of-flying-extra-long-bed", "/de/de/articles/highlights/the-art-of-flying-extra-space-seat", "/de/de/articles/highlights/the-art-of-flying-suite", "/de/de/articles/highlights/vancouver-winter", "/de/de/articles/tags", "/de/de/articles/tags/algiers", "/de/de/articles/tags/allegris", "/de/de/articles/tags/allegris-inspires", "/de/de/articles/tags/almaty", "/de/de/articles/tags/amman", "/de/de/articles/tags/amsterdam", "/de/de/articles/tags/art", "/de/de/articles/tags/art-basel-miami-beach", "/de/de/articles/tags/athens", "/de/de/articles/tags/atlanta", "/de/de/articles/tags/bangkok", "/de/de/articles/tags/barcelona", "/de/de/articles/tags/be-picky", "/de/de/articles/tags/beijing", "/de/de/articles/tags/bengaluru", "/de/de/articles/tags/berlin", "/de/de/articles/tags/bilbao", "/de/de/articles/tags/bogota", "/de/de/articles/tags/boston", "/de/de/articles/tags/budapest", "/de/de/articles/tags/buenos-aires", "/de/de/articles/tags/cagliari", "/de/de/articles/tags/cairo", "/de/de/articles/tags/cape-town", "/de/de/articles/tags/casablanca", "/de/de/articles/tags/catania", "/de/de/articles/tags/charlotte", "/de/de/articles/tags/chennai", "/de/de/articles/tags/chicago", "/de/de/articles/tags/copenhagen", "/de/de/articles/tags/dallas", "/de/de/articles/tags/denver", "/de/de/articles/tags/detroit", "/de/de/articles/tags/dubai", "/de/de/articles/tags/dublin", "/de/de/articles/tags/eat-see-do", "/de/de/articles/tags/edinburgh", "/de/de/articles/tags/essentials", "/de/de/articles/tags/faro", "/de/de/articles/tags/fly-with-me", "/de/de/articles/tags/flying-high", "/de/de/articles/tags/food", "/de/de/articles/tags/frankfurt", "/de/de/articles/tags/frequent-flyers", "/de/de/articles/tags/future-of-flying", "/de/de/articles/tags/gothenburg", "/de/de/articles/tags/hamburg", "/de/de/articles/tags/helsinki", "/de/de/articles/tags/history", "/de/de/articles/tags/hong-kong", "/de/de/articles/tags/houston", "/de/de/articles/tags/hyderabad", "/de/de/articles/tags/in-my-hood", "/de/de/articles/tags/inside-lufthansa", "/de/de/articles/tags/istanbul", "/de/de/articles/tags/johannesburg", "/de/de/articles/tags/know-before-you-go", "/de/de/articles/tags/kuala-lumpur", "/de/de/articles/tags/larnaca", "/de/de/articles/tags/lisbon", "/de/de/articles/tags/ljubljana", "/de/de/articles/tags/london", "/de/de/articles/tags/los-angeles", "/de/de/articles/tags/madrid", "/de/de/articles/tags/malaga", "/de/de/articles/tags/mallorca", "/de/de/articles/tags/manchester", "/de/de/articles/tags/marseille", "/de/de/articles/tags/mexico-city", "/de/de/articles/tags/miami", "/de/de/articles/tags/milan", "/de/de/articles/tags/minneapolis-st-paul", "/de/de/articles/tags/mumbai", "/de/de/articles/tags/munich", "/de/de/articles/tags/music", "/de/de/articles/tags/my-world", "/de/de/articles/tags/nairobi", "/de/de/articles/tags/new-york", "/de/de/articles/tags/nice", "/de/de/articles/tags/olbia", "/de/de/articles/tags/on-the-scene", "/de/de/articles/tags/oslo", "/de/de/articles/tags/paris", "/de/de/articles/tags/perfect-day", "/de/de/articles/tags/picture-perfect", "/de/de/articles/tags/porto", "/de/de/articles/tags/prague", "/de/de/articles/tags/raleigh-durham", "/de/de/articles/tags/riga", "/de/de/articles/tags/rio-de-janeiro", "/de/de/articles/tags/riyadh", "/de/de/articles/tags/rome", "/de/de/articles/tags/san-diego", "/de/de/articles/tags/san-francisco", "/de/de/articles/tags/seattle", "/de/de/articles/tags/seoul", "/de/de/articles/tags/shanghai", "/de/de/articles/tags/shopping", "/de/de/articles/tags/singapore", "/de/de/articles/tags/sport", "/de/de/articles/tags/st-louis", "/de/de/articles/tags/stockholm", "/de/de/articles/tags/stop-over", "/de/de/articles/tags/tallinn", "/de/de/articles/tags/tbilisi", "/de/de/articles/tags/team-stories", "/de/de/articles/tags/tel-aviv", "/de/de/articles/tags/thessaloniki", "/de/de/articles/tags/tirana", "/de/de/articles/tags/tokyo", "/de/de/articles/tags/toronto", "/de/de/articles/tags/tunis", "/de/de/articles/tags/valletta", "/de/de/articles/tags/vancouver", "/de/de/articles/tags/venice", "/de/de/articles/tags/vienna", "/de/de/articles/tags/vilnius", "/de/de/articles/tags/washington-dc", "/de/de/articles/tags/what-i-learned", "/de/de/articles/tags/what-the-hack", "/de/de/articles/tags/yes-stories", "/de/de/articles/tags/zagreb", "/de/de/articles/tags/zurich", "/de/de/assistenzhunde", "/de/de/automatic-check-in", "/de/de/baggage-irregularities", "/de/de/bedeutsamste-strecken", "/de/de/befoerderungsbedingungen-group", "/de/de/befoerderungsbedingungen-lh", "/de/de/besondere-befoerderungsbedingungen-bus", "/de/de/betreuungsbedarf", "/de/de/bid-upgrade", "/de/de/boarding", "/de/de/boeing787", "/de/de/book-and-manage/additional-services/get-your-guide", "/de/de/book-and-manage/additional-services/travel-insurances", "/de/de/book-and-manage/booking-services/manage-my-bookings", "/de/de/book-and-manage/cancellation-and-refund/refund/confirmation", "/de/de/book-and-manage/cancellation-and-refund/refund/refund-form", "/de/de/book-and-manage/destination", "/de/de/book-and-manage/digital-self-services/airline-apps", "/de/de/book-and-manage/flights/air-baltic", "/de/de/book-and-manage/flights/ana", "/de/de/book-and-manage/flights/ana/faq", "/de/de/book-and-manage/flights/giftvoucher", "/de/de/book-and-manage/flights/helvetic", "/de/de/book-and-manage/flights/lufthansa-voucher", "/de/de/book-and-manage/flights/wetlease-hub", "/de/de/book-and-manage/passenger-receipt-90days/confirmation", "/de/de/book-and-manage/pax-receipt", "/de/de/book-and-manage/pax-receipt/invoices-different-countries", "/de/de/book-and-manage/rebook", "/de/de/book-and-manage/rebook/involuntary-rebooking", "/de/de/book-and-manage/rebook/voluntary-rebooking", "/de/de/book-and-manage/stopover", "/de/de/book-and-manage/stopover/bayerischer-hof", "/de/de/book-and-manage/stopover/neuschwanstein", "/de/de/book-and-manage/stopover/zugspitze", "/de/de/business-class", "/de/de/business-class-auf-kurz-und-mittelstrecken", "/de/de/business-services", "/de/de/cancellations-and-refunds", "/de/de/cash-and-miles", "/de/de/check-in-baggage", "/de/de/common", "/de/de/common/accessibility-statement", "/de/de/common/agb-extra-services-at-online-check-in", "/de/de/common/agb-extra-services-at-online-check-in/conditions-seat-reservation", "/de/de/common/baggage-conditions", "/de/de/common/compensation-voucher", "/de/de/common/imprint/lufthansa-insights-imprint", "/de/de/common/privacy-statement/privacy-statement-group", "/de/de/common/seatreservation-condtions/seat-reservations", "/de/de/cookie-policy", "/de/de/culinaryjourney", "/de/de/dangerous-dogs", "/de/de/datenerfassung-fuer-die-usa", "/de/de/datenerfassung-fuer-kanada", "/de/de/datenschutz", "/de/de/digital-self-services", "/de/de/digital-travel-companion", "/de/de/digitale-gepaeckservices", "/de/de/discover-lufthansa/carbon-offsetting/climate-protection-projects", "/de/de/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge", "/de/de/discover-lufthansa/carbon-offsetting/faq-saf", "/de/de/discover-lufthansa/carbon-offsetting/saf", "/de/de/discover-lufthansa/flightreservation-priceguarantee", "/de/de/discover-lufthansa/lufthansa-fleet/351", "/de/de/discover-lufthansa/lufthansa-group-airlines/ita-airways", "/de/de/discover-lufthansa/miles-and-more-credit-card", "/de/de/discover-lufthansa/new-onboard-experience", "/de/de/discover-lufthansa/take-off", "/de/de/doctor-on-board", "/de/de/doctor-on-board-news", "/de/de/during-your-trip/internet-overview", "/de/de/during-your-trip/lhg-wifi", "/de/de/economy-class", "/de/de/electronic-bag-tags", "/de/de/entryprocesses", "/de/de/europa-tarife-economy-class", "/de/de/europcar", "/de/de/event/dghm-2026", "/de/de/exclusive-charter", "/de/de/faq-data-security", "/de/de/faq-ejournals", "/de/de/faq-password-security", "/de/de/farealert/best-price-alert", "/de/de/feedback", "/de/de/feedback-past-flight", "/de/de/feedback/feedbackai", "/de/de/fia-valet-service", "/de/de/first-class", "/de/de/first-class-lounges", "/de/de/first-class-personal-assistant", "/de/de/first-class-terminal", "/de/de/first-class-valet-parking-service", "/de/de/fliegen-mit-baby", "/de/de/fliegen-mit-kindern", "/de/de/fliegen-mit-kleinkind", "/de/de/fluege", "/de/de/flughafeninformation", "/de/de/flugplan-und-flugstatus", "/de/de/flugsuche", "/de/de/flugunregelmaessigkeiten", "/de/de/flynet", "/de/de/fmg-valet-parking-service", "/de/de/frankfurt-fair", "/de/de/free2move", "/de/de/freigepaeck-regeln", "/de/de/gefaehrliche-gegenstaende", "/de/de/gepaeck", "/de/de/geschaeftsbedingungen", "/de/de/gesund-reisen", "/de/de/good-for-train", "/de/de/green-fare", "/de/de/group-travel", "/de/de/gruppenreisen-und-charter", "/de/de/handgepaeck", "/de/de/help-and-contact", "/de/de/hertz", "/de/de/homepage", "/de/de/hotelangebote", "/de/de/impressum", "/de/de/informationen-zum-datenschutz", "/de/de/kinder-an-bord", "/de/de/kindermenues-an-bord", "/de/de/local-page/south-africa-winter-promotion", "/de/de/lounge-begleitung", "/de/de/lounges", "/de/de/lufthansa-am-flughafen-duesseldorf", "/de/de/lufthansa-am-flughafen-frankfurt", "/de/de/lufthansa-am-flughafen-wien", "/de/de/lufthansa-at-berlin-airport", "/de/de/lufthansa-at-zuerich-airport", "/de/de/lufthansa-aviation-group", "/de/de/lufthansa-business-class-on-long-haul-routes", "/de/de/lufthansa-city/culinaryjourney", "/de/de/lufthansa-city/menu-card", "/de/de/lufthansa-express", "/de/de/lufthansa-express-bus", "/de/de/lufthansa-express-rail", "/de/de/lufthansa-firmenkunden", "/de/de/lufthansa-first-class-entertainment", "/de/de/lufthansa-first-class-flotte", "/de/de/lufthansa-first-class-komfort", "/de/de/lufthansa-group-star-alliance-and-partner-airlines", "/de/de/lufthansa-guide-service", "/de/de/lufthansa-reiseklassen", "/de/de/lufthansa-terminal-muenchen", "/de/de/medikamenten-transport", "/de/de/meetings-and-events", "/de/de/meetings-und-events-individuelle-angebotsanfrage", "/de/de/meetings-und-events-teilnehmer", "/de/de/mein-logbuch", "/de/de/meine-buchungen", "/de/de/menues-auf-langstreckenfluegen", "/de/de/menues-reiseklassen", "/de/de/mietwagenangebote", "/de/de/miles-and-more", "/de/de/mit-kindern-am-flughafen", "/de/de/mobility-partner-program-healthcare", "/de/de/munich-fair", "/de/de/nachhaltiger-fliegen", "/de/de/nutzungsbedingungen", "/de/de/nutzungsbedingungen-waehrungsumrechnung", "/de/de/onboard-delights", "/de/de/onboard-delights-faq", "/de/de/online-check-in", "/de/de/online-check-in-info", "/de/de/online-check-in-mit-der-ganzen-familie", "/de/de/overview-flights", "/de/de/overview-manage", "/de/de/overview-special-request", "/de/de/overview-travel-information", "/de/de/partner", "/de/de/passenger-receipt-90", "/de/de/passenger-rights", "/de/de/passengers-using-wheelchairs", "/de/de/passengers-with-sensory-impairment", "/de/de/pre-check-in", "/de/de/premium-economy-class", "/de/de/prepare-for-your-trip/baggage/baggage-conditions", "/de/de/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg", "/de/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay", "/de/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage", "/de/de/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage", "/de/de/prepare-for-your-trip/baggage/electronic-devices-and-batteries", "/de/de/prepare-for-your-trip/baggage/sport-baggage/register-ammunition", "/de/de/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation", "/de/de/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation", "/de/de/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation", "/de/de/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation", "/de/de/prepare-for-your-trip/current-travel-information", "/de/de/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system", "/de/de/prepare-for-your-trip/entry-regulations/immigration-regulations-uk", "/de/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing", "/de/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing", "/de/de/prepare-for-your-trip/special-travel-needs/medical-travel-companions", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment", "/de/de/prepare-for-your-trip/travel-classes/economy-basic", "/de/de/prepare-for-your-trip/travelling-with-children/child-in-businessclass", "/de/de/prepare-for-your-trip/travelling-with-children/planning-with-kids", "/de/de/rail-and-fly", "/de/de/rail-fly-bedingungen", "/de/de/rechnungsbeleg", "/de/de/refund", "/de/de/register-animal-cabin", "/de/de/reisebueros", "/de/de/reisen-mit-besonderen-anforderungen", "/de/de/rollstuhlbatterien", "/de/de/schengen", "/de/de/secure-flight", "/de/de/security-fast-lanes", "/de/de/sepa-bedingungen", "/de/de/sepa-bedingungen-b", "/de/de/services-am-flughafen", "/de/de/services-am-flughafen-frankfurt", "/de/de/services-am-flughafen-muenchen", "/de/de/services-an-bord", "/de/de/shopping", "/de/de/sicherheit-fuer-kleinkinder-an-bord", "/de/de/sitzplaene", "/de/de/sitzplatzreservierungen-konditionen", "/de/de/sixt", "/de/de/sondermahlzeiten", "/de/de/speisen-und-getraenke", "/de/de/sportgepaeck", "/de/de/sportgepaeck-hinzufuegen", "/de/de/support/contact/contact-form-confirmation", "/de/de/support/contact/passenger-duty-united-kingdom", "/de/de/support/feedback-and-contact-airlines", "/de/de/support/support", "/de/de/tiere-als-handgepaeck", "/de/de/tiere-als-uebergepaeck", "/de/de/tips-senior-travellers", "/de/de/travel-briefing", "/de/de/travel-expense-management", "/de/de/travel-id-terms-conditions", "/de/de/travelling-with-animals", "/de/de/traveltricks", "/de/de/uebergepaeck", "/de/de/unterhaltung-an-bord", "/de/de/upgrade-business-class-langstrecke", "/de/de/upgrade-first-class", "/de/de/upgrade-in-die-business-class", "/de/de/upgrade-in-die-premium-economy-class", "/de/de/upgrade-informationen", "/de/de/upgrade-premium-economy-class", "/de/de/upgrademoeglichkeiten", "/de/de/upgrades-im-online-check-in", "/de/de/zahlungsmoeglichkeiten-am-flughafen", "/de/de/zeitfenster-sicherheitskontrolle", "/de/en/100-years", "/de/en/100-years/cabin-design", "/de/en/100-years/campaigns", "/de/en/100-years/chronicle", "/de/en/100-years/crane", "/de/en/100-years/destinations", "/de/en/100-years/fleet", "/de/en/100-years/global-network", "/de/en/100-years/history", "/de/en/100-years/history/menu-on-board", "/de/en/320", "/de/en/32n", "/de/en/359", "/de/en/744", "/de/en/accessible-travel", "/de/en/add-sports-baggage", "/de/en/additional-services", "/de/en/addresses-worldwide", "/de/en/admission-rules", "/de/en/advance-seat-reservation", "/de/en/advance-seat-reservations-terms-and-conditions", "/de/en/advice-for-travellers-with-special-needs-to-and-from-the-usa", "/de/en/affiliatemarketing", "/de/en/airport-information", "/de/en/all-check-in", "/de/en/anmeldung-tiere-frachtraum", "/de/en/arrival-services", "/de/en/articles", "/de/en/articles/authors", "/de/en/articles/authors/alexandra-mikamo", "/de/en/articles/authors/florian-schwebel", "/de/en/articles/authors/florian-tomberg", "/de/en/articles/authors/julia-buth", "/de/en/articles/authors/till-weisbrod", "/de/en/articles/explore-flying", "/de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history", "/de/en/articles/explore-flying/a-girl-named-lufthansa", "/de/en/articles/explore-flying/aircraft-lights-explained", "/de/en/articles/explore-flying/allegris-business-class-dirk-nowitzki", "/de/en/articles/explore-flying/allegris-exclusive-first-class-loungewear", "/de/en/articles/explore-flying/allegris-first-class-innovations", "/de/en/articles/explore-flying/allegris-first-class-reasons-for-allegris-first-class", "/de/en/articles/explore-flying/allegris-fox", "/de/en/articles/explore-flying/anniversary-super-crane-special", "/de/en/articles/explore-flying/art-basel-miami-beach-stefan-marx", "/de/en/articles/explore-flying/best-airport-restaurants", "/de/en/articles/explore-flying/business-class-culinary-journey-with-johann-lafer", "/de/en/articles/explore-flying/celebrating-20-years-of-excellence", "/de/en/articles/explore-flying/cockpit-collaboration", "/de/en/articles/explore-flying/come-fly-with-me-lufthansa-allegris", "/de/en/articles/explore-flying/culinary-craftsmanship-smoked-fish-for-first-and-business-class", "/de/en/articles/explore-flying/essentials-future-of-flying", "/de/en/articles/explore-flying/essentials-lufthansa-facts", "/de/en/articles/explore-flying/essentials-surprising-lufthansa-numbers", "/de/en/articles/explore-flying/everyone-wants-to-fly-with-the-cranes", "/de/en/articles/explore-flying/female-pilots", "/de/en/articles/explore-flying/first-class-culinary-inspiration-journey-tokyo", "/de/en/articles/explore-flying/first-class-reimagined", "/de/en/articles/explore-flying/first-class-terminal-architecture", "/de/en/articles/explore-flying/flying-high-christoph-quarch", "/de/en/articles/explore-flying/flying-high-meta-city", "/de/en/articles/explore-flying/future-of-flying", "/de/en/articles/explore-flying/help-alliance-engagement-in-tanzania", "/de/en/articles/explore-flying/help-alliance-taking-off-for-a-good-cause", "/de/en/articles/explore-flying/hon-circle-event", "/de/en/articles/explore-flying/how-to-become-a-flight-attendant", "/de/en/articles/explore-flying/how-to-become-a-pilot", "/de/en/articles/explore-flying/inflight-entertainment-vr-experience", "/de/en/articles/explore-flying/inside-lufthansa-lh-allegris", "/de/en/articles/explore-flying/interview-livery-iconic-moments", "/de/en/articles/explore-flying/livery-iconic-moments", "/de/en/articles/explore-flying/lufthansa-allegris-first-class", "/de/en/articles/explore-flying/lufthansa-allegris-welcome-to-the-future-of-aviation", "/de/en/articles/explore-flying/lufthansa-classics", "/de/en/articles/explore-flying/lufthansa-fleet-our-aircrafts", "/de/en/articles/explore-flying/lufthansa-group-wifi", "/de/en/articles/explore-flying/lufthansa-help-alliance-i-fly-for-campaign", "/de/en/articles/explore-flying/lufthansa-in-the-spotlight", "/de/en/articles/explore-flying/lufthansa-innovation-hub-future-of-flying", "/de/en/articles/explore-flying/lufthansa-insights-art", "/de/en/articles/explore-flying/lufthansa-lounges", "/de/en/articles/explore-flying/lufthansa-orchestra-channel-aid-live-in-concert", "/de/en/articles/explore-flying/lufthansa-uniforms-history", "/de/en/articles/explore-flying/meet-the-makers-innovations-for-individual-well-being", "/de/en/articles/explore-flying/meet-the-makers-lufthansa-allegris-business-class", "/de/en/articles/explore-flying/meet-the-makers-lufthansa-allegris-first-class", "/de/en/articles/explore-flying/meet-the-makers-the-manufactures-of-the-first-class-suites", "/de/en/articles/explore-flying/new-lufthansa-lounge-newark-interview", "/de/en/articles/explore-flying/oktoberfest-traditional-bavarian-attire", "/de/en/articles/explore-flying/pride-diversifly-queer-employee-network-lufthansa-group", "/de/en/articles/explore-flying/queer-travel-safer-trips", "/de/en/articles/explore-flying/responsibility-lufthansa", "/de/en/articles/explore-flying/things-you-always-wanted-to-know-about-flying", "/de/en/articles/explore-flying/time-travel-ki-aviation", "/de/en/articles/explore-flying/travel-trends", "/de/en/articles/explore-flying/vacation-packing-list", "/de/en/articles/explore-flying/welcome-to-my-world-alexandra-maria-lara", "/de/en/articles/explore-flying/welcome-to-my-world-bridget-finn", "/de/en/articles/explore-flying/welcome-to-my-world-elyas-mbarek", "/de/en/articles/explore-flying/welcome-to-my-world-emilia-schuele", "/de/en/articles/explore-flying/welcome-to-my-world-karolina-kurkova", "/de/en/articles/explore-flying/welcome-to-my-world-karoline-herfurth", "/de/en/articles/explore-flying/welcome-to-my-world-lexie-alford", "/de/en/articles/explore-flying/what-does-luxury-mean-today", "/de/en/articles/explore-flying/what-the-hack-anti-jetlag-tips", "/de/en/articles/explore-flying/what-the-hack-best-seats", "/de/en/articles/explore-flying/what-the-hack-travel-gadgets", "/de/en/articles/explore-flying/what-the-hack-travel-hacks", "/de/en/articles/explore-flying/what-the-hack-travel-with-kids", "/de/en/articles/explore-flying/what-the-hack-waiting-time-at-the-airport", "/de/en/articles/explore-flying/what-the-hack-what-is-the-etiquette-of-traveling", "/de/en/articles/explore-flying/yes-stories-the-fascination-of-skydiving", "/de/en/articles/explore-flying/yes-stories-the-two-worlds-of-kaye-ree", "/de/en/articles/explore-flying/yes-stories-thorsten-buss", "/de/en/articles/explore-flying/yes-stories-tom-rees", "/de/en/articles/explore-the-world", "/de/en/articles/explore-the-world/a-perfect-day-amsterdam-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-art-basel-miami-beach-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-athens-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-bangkok-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-beijing-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-bengaluru-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-boston-on-one-day", "/de/en/articles/explore-the-world/a-perfect-day-budapest-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-buenos-aires-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-cape-town-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-charlotte-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-chicago-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-copenhagen-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-dublin-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-frankfurt-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-hamburg", "/de/en/articles/explore-the-world/a-perfect-day-helsinki-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-hong-kong-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-houston-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-istanbul-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-johannesburg-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-la-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-lisbon-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-london-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-madrid-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-malaga-on-one-day", "/de/en/articles/explore-the-world/a-perfect-day-mallorca-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-mexico-city-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-miami-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-milan-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-mumbai-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-munich-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-ny-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-oslo-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-paris-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-porto-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-prague-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-rio-de-janeiro-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-rome-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-san-francisco-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-seoul-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-shanghai-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-singapore-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-stockholm-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-tokyo-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-toronto-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-vienna-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-washington-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-zurich-in-one-day", "/de/en/articles/explore-the-world/a-perfect-nairobi-city-in-one-day", "/de/en/articles/explore-the-world/art-basel-miami-beach-fun-facts", "/de/en/articles/explore-the-world/be-picky-amsterdam-insider-tips", "/de/en/articles/explore-the-world/be-picky-athens-insider-tips", "/de/en/articles/explore-the-world/be-picky-bangkok-insider-tips", "/de/en/articles/explore-the-world/be-picky-barcelona-insider-tips", "/de/en/articles/explore-the-world/be-picky-bengaluru", "/de/en/articles/explore-the-world/be-picky-budapest-insider-tips", "/de/en/articles/explore-the-world/be-picky-buenos-aires-insider-tips", "/de/en/articles/explore-the-world/be-picky-cape-town-insider-tips", "/de/en/articles/explore-the-world/be-picky-charlotte-insider-tips", "/de/en/articles/explore-the-world/be-picky-chicago-insider-tips", "/de/en/articles/explore-the-world/be-picky-copenhagen", "/de/en/articles/explore-the-world/be-picky-dublin-insider-tips", "/de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips", "/de/en/articles/explore-the-world/be-picky-helsinkis-insider-tips", "/de/en/articles/explore-the-world/be-picky-hong-kong-insider-tips", "/de/en/articles/explore-the-world/be-picky-istanbul-insider-tips", "/de/en/articles/explore-the-world/be-picky-johannesburg-insider-tipps", "/de/en/articles/explore-the-world/be-picky-la-insider-tips", "/de/en/articles/explore-the-world/be-picky-lisbon", "/de/en/articles/explore-the-world/be-picky-little-italy-in-vancouver", "/de/en/articles/explore-the-world/be-picky-london-insider-tips", "/de/en/articles/explore-the-world/be-picky-madrid", "/de/en/articles/explore-the-world/be-picky-mallorca-insider-tips", "/de/en/articles/explore-the-world/be-picky-mexico-city-insider-tips", "/de/en/articles/explore-the-world/be-picky-miami-insider-tips", "/de/en/articles/explore-the-world/be-picky-milan-insider-tips", "/de/en/articles/explore-the-world/be-picky-mumbai-insider-tips", "/de/en/articles/explore-the-world/be-picky-munich-insider-tip-anika-landsteiner", "/de/en/articles/explore-the-world/be-picky-ny-insider-tips", "/de/en/articles/explore-the-world/be-picky-oslo-insider-tips", "/de/en/articles/explore-the-world/be-picky-paris-insider-tips", "/de/en/articles/explore-the-world/be-picky-prague-insider-tips", "/de/en/articles/explore-the-world/be-picky-rio-de-janeiro-insider-tips", "/de/en/articles/explore-the-world/be-picky-rome-insider-tips", "/de/en/articles/explore-the-world/be-picky-san-francisco-insider-tips", "/de/en/articles/explore-the-world/be-picky-seoul-insider-tips", "/de/en/articles/explore-the-world/be-picky-shanghai-insider-tips", "/de/en/articles/explore-the-world/be-picky-singapore-insider-tips", "/de/en/articles/explore-the-world/be-picky-stockholm", "/de/en/articles/explore-the-world/be-picky-tokyo-insider-tips", "/de/en/articles/explore-the-world/be-picky-toronto-insider-tips", "/de/en/articles/explore-the-world/be-picky-vienna-insider-tips", "/de/en/articles/explore-the-world/be-picky-washington-insider-tips", "/de/en/articles/explore-the-world/be-picky-zurich-insider-tips", "/de/en/articles/explore-the-world/copenhagen-what-i-have-learned", "/de/en/articles/explore-the-world/eat-see-do-algiers", "/de/en/articles/explore-the-world/eat-see-do-almaty", "/de/en/articles/explore-the-world/eat-see-do-amman", "/de/en/articles/explore-the-world/eat-see-do-atlanta", "/de/en/articles/explore-the-world/eat-see-do-beijing", "/de/en/articles/explore-the-world/eat-see-do-berlin", "/de/en/articles/explore-the-world/eat-see-do-bilbao", "/de/en/articles/explore-the-world/eat-see-do-bogota", "/de/en/articles/explore-the-world/eat-see-do-boston", "/de/en/articles/explore-the-world/eat-see-do-cagliari", "/de/en/articles/explore-the-world/eat-see-do-cairo", "/de/en/articles/explore-the-world/eat-see-do-casablanca", "/de/en/articles/explore-the-world/eat-see-do-catania", "/de/en/articles/explore-the-world/eat-see-do-chennai", "/de/en/articles/explore-the-world/eat-see-do-dallas", "/de/en/articles/explore-the-world/eat-see-do-denver", "/de/en/articles/explore-the-world/eat-see-do-detroit", "/de/en/articles/explore-the-world/eat-see-do-dubai", "/de/en/articles/explore-the-world/eat-see-do-edinburgh", "/de/en/articles/explore-the-world/eat-see-do-faro", "/de/en/articles/explore-the-world/eat-see-do-gothenburg", "/de/en/articles/explore-the-world/eat-see-do-hamburg", "/de/en/articles/explore-the-world/eat-see-do-houston", "/de/en/articles/explore-the-world/eat-see-do-hyderabad", "/de/en/articles/explore-the-world/eat-see-do-kuala-lumpur", "/de/en/articles/explore-the-world/eat-see-do-larnaca", "/de/en/articles/explore-the-world/eat-see-do-ljubljana", "/de/en/articles/explore-the-world/eat-see-do-malaga", "/de/en/articles/explore-the-world/eat-see-do-manchester", "/de/en/articles/explore-the-world/eat-see-do-marseille", "/de/en/articles/explore-the-world/eat-see-do-minneapolis-st-paul", "/de/en/articles/explore-the-world/eat-see-do-nairobi", "/de/en/articles/explore-the-world/eat-see-do-nice", "/de/en/articles/explore-the-world/eat-see-do-olbia", "/de/en/articles/explore-the-world/eat-see-do-porto", "/de/en/articles/explore-the-world/eat-see-do-raleigh-durham", "/de/en/articles/explore-the-world/eat-see-do-riga", "/de/en/articles/explore-the-world/eat-see-do-riyadh", "/de/en/articles/explore-the-world/eat-see-do-san-diego", "/de/en/articles/explore-the-world/eat-see-do-seattle", "/de/en/articles/explore-the-world/eat-see-do-st-louis", "/de/en/articles/explore-the-world/eat-see-do-tallinn", "/de/en/articles/explore-the-world/eat-see-do-tbilisi", "/de/en/articles/explore-the-world/eat-see-do-tel-aviv", "/de/en/articles/explore-the-world/eat-see-do-thessaloniki", "/de/en/articles/explore-the-world/eat-see-do-tirana", "/de/en/articles/explore-the-world/eat-see-do-tunis", "/de/en/articles/explore-the-world/eat-see-do-valletta", "/de/en/articles/explore-the-world/eat-see-do-venice", "/de/en/articles/explore-the-world/eat-see-do-vilnius", "/de/en/articles/explore-the-world/eat-see-do-zagreb", "/de/en/articles/explore-the-world/essentials-amsterdam-facts", "/de/en/articles/explore-the-world/essentials-athens-facts", "/de/en/articles/explore-the-world/essentials-bangkok-facts", "/de/en/articles/explore-the-world/essentials-barcelona-facts", "/de/en/articles/explore-the-world/essentials-beijing-facts", "/de/en/articles/explore-the-world/essentials-bengaluru-facts", "/de/en/articles/explore-the-world/essentials-boston-facts", "/de/en/articles/explore-the-world/essentials-budapest-facts", "/de/en/articles/explore-the-world/essentials-buenos-aires-facts", "/de/en/articles/explore-the-world/essentials-cape-town-facts", "/de/en/articles/explore-the-world/essentials-charlotte-facts", "/de/en/articles/explore-the-world/essentials-chicago-facts", "/de/en/articles/explore-the-world/essentials-copenhagen-facts", "/de/en/articles/explore-the-world/essentials-dublin-facts", "/de/en/articles/explore-the-world/essentials-facts-vancouver", "/de/en/articles/explore-the-world/essentials-frankfurt-facts", "/de/en/articles/explore-the-world/essentials-helsinki-facts", "/de/en/articles/explore-the-world/essentials-hong-kong-facts", "/de/en/articles/explore-the-world/essentials-istanbul-facts", "/de/en/articles/explore-the-world/essentials-johannesburg-facts", "/de/en/articles/explore-the-world/essentials-la-facts", "/de/en/articles/explore-the-world/essentials-lisbon-facts", "/de/en/articles/explore-the-world/essentials-london-facts", "/de/en/articles/explore-the-world/essentials-madrid-facts", "/de/en/articles/explore-the-world/essentials-mallorca-facts", "/de/en/articles/explore-the-world/essentials-mexico-city-facts", "/de/en/articles/explore-the-world/essentials-miami-facts", "/de/en/articles/explore-the-world/essentials-milan-facts", "/de/en/articles/explore-the-world/essentials-mumbai-facts", "/de/en/articles/explore-the-world/essentials-munich-facts", "/de/en/articles/explore-the-world/essentials-ny-facts", "/de/en/articles/explore-the-world/essentials-oslo-facts", "/de/en/articles/explore-the-world/essentials-paris-facts", "/de/en/articles/explore-the-world/essentials-prague-facts", "/de/en/articles/explore-the-world/essentials-rio-de-janeiro-facts", "/de/en/articles/explore-the-world/essentials-rome-facts", "/de/en/articles/explore-the-world/essentials-san-francisco-facts", "/de/en/articles/explore-the-world/essentials-seoul-facts", "/de/en/articles/explore-the-world/essentials-shanghai-facts", "/de/en/articles/explore-the-world/essentials-singapore-facts", "/de/en/articles/explore-the-world/essentials-stockholm-facts", "/de/en/articles/explore-the-world/essentials-tokyo-facts", "/de/en/articles/explore-the-world/essentials-toronto-facts", "/de/en/articles/explore-the-world/essentials-vienna-facts", "/de/en/articles/explore-the-world/essentials-washington-facts", "/de/en/articles/explore-the-world/essentials-zurich-facts", "/de/en/articles/explore-the-world/experience-art-live", "/de/en/articles/explore-the-world/experience-nature", "/de/en/articles/explore-the-world/in-my-hood-apgujeong-seoul", "/de/en/articles/explore-the-world/in-my-hood-arroios-lissabon", "/de/en/articles/explore-the-world/in-my-hood-back-bay-boston", "/de/en/articles/explore-the-world/in-my-hood-bandra-mumbai", "/de/en/articles/explore-the-world/in-my-hood-chiswick-london", "/de/en/articles/explore-the-world/in-my-hood-citta-studi-milan", "/de/en/articles/explore-the-world/in-my-hood-city-centre-cape-town", "/de/en/articles/explore-the-world/in-my-hood-comercial-drive-vancouver", "/de/en/articles/explore-the-world/in-my-hood-coyoacan-mexico-city", "/de/en/articles/explore-the-world/in-my-hood-creative-quarter-dublin", "/de/en/articles/explore-the-world/in-my-hood-district-helsinki", "/de/en/articles/explore-the-world/in-my-hood-district-houston", "/de/en/articles/explore-the-world/in-my-hood-district-malaga", "/de/en/articles/explore-the-world/in-my-hood-district-nairobi", "/de/en/articles/explore-the-world/in-my-hood-district-porto", "/de/en/articles/explore-the-world/in-my-hood-district-viii-budapest", "/de/en/articles/explore-the-world/in-my-hood-district-zurich", "/de/en/articles/explore-the-world/in-my-hood-gamlebyen-oslo", "/de/en/articles/explore-the-world/in-my-hood-geylang-singapur", "/de/en/articles/explore-the-world/in-my-hood-gulou-beijing", "/de/en/articles/explore-the-world/in-my-hood-hollywood-road-hong-kong", "/de/en/articles/explore-the-world/in-my-hood-indiranagar-bengaluru", "/de/en/articles/explore-the-world/in-my-hood-ipanema-rio-de-janeiro", "/de/en/articles/explore-the-world/in-my-hood-japantown-san-francisco", "/de/en/articles/explore-the-world/in-my-hood-kadikoey-istanbul", "/de/en/articles/explore-the-world/in-my-hood-kampung-attap-kuala-lumpur", "/de/en/articles/explore-the-world/in-my-hood-kreuzberg-berlin", "/de/en/articles/explore-the-world/in-my-hood-larchmont-la", "/de/en/articles/explore-the-world/in-my-hood-le-sentier-paris", "/de/en/articles/explore-the-world/in-my-hood-mallorca", "/de/en/articles/explore-the-world/in-my-hood-metaxourgeio-athens", "/de/en/articles/explore-the-world/in-my-hood-mount-pleasant-washington", "/de/en/articles/explore-the-world/in-my-hood-munich-sendling", "/de/en/articles/explore-the-world/in-my-hood-nice-ouest", "/de/en/articles/explore-the-world/in-my-hood-noord-amsterdam", "/de/en/articles/explore-the-world/in-my-hood-ny-brooklyn", "/de/en/articles/explore-the-world/in-my-hood-osterbro-kopenhagen", "/de/en/articles/explore-the-world/in-my-hood-palermo-buenos-aires", "/de/en/articles/explore-the-world/in-my-hood-plaza-midwood-charlotte", "/de/en/articles/explore-the-world/in-my-hood-poblenou-barcelona", "/de/en/articles/explore-the-world/in-my-hood-rome-pigneto-rome", "/de/en/articles/explore-the-world/in-my-hood-rosebank-johannesburg", "/de/en/articles/explore-the-world/in-my-hood-sachsenhausen-frankfurt", "/de/en/articles/explore-the-world/in-my-hood-salamanca-madrid", "/de/en/articles/explore-the-world/in-my-hood-schanzenviertel-hamburg", "/de/en/articles/explore-the-world/in-my-hood-schaumburg-chicago", "/de/en/articles/explore-the-world/in-my-hood-seventh-district-vienna", "/de/en/articles/explore-the-world/in-my-hood-shinjuku-tokyo", "/de/en/articles/explore-the-world/in-my-hood-song-wat-road-bangkok", "/de/en/articles/explore-the-world/in-my-hood-south-beach-miami", "/de/en/articles/explore-the-world/in-my-hood-the-bund-shanghai", "/de/en/articles/explore-the-world/in-my-hood-toronto-summerhill", "/de/en/articles/explore-the-world/in-my-hood-vasastaden-stockholm", "/de/en/articles/explore-the-world/in-my-hood-vrsovice-prague", "/de/en/articles/explore-the-world/in-my-hood-west-seattle-seattle", "/de/en/articles/explore-the-world/know-before-you-go-algiers", "/de/en/articles/explore-the-world/know-before-you-go-almaty", "/de/en/articles/explore-the-world/know-before-you-go-amman", "/de/en/articles/explore-the-world/know-before-you-go-atlanta", "/de/en/articles/explore-the-world/know-before-you-go-beijing", "/de/en/articles/explore-the-world/know-before-you-go-berlin", "/de/en/articles/explore-the-world/know-before-you-go-bilbao", "/de/en/articles/explore-the-world/know-before-you-go-bogota", "/de/en/articles/explore-the-world/know-before-you-go-boston", "/de/en/articles/explore-the-world/know-before-you-go-cagliari", "/de/en/articles/explore-the-world/know-before-you-go-cairo", "/de/en/articles/explore-the-world/know-before-you-go-casablanca", "/de/en/articles/explore-the-world/know-before-you-go-catania", "/de/en/articles/explore-the-world/know-before-you-go-chennai", "/de/en/articles/explore-the-world/know-before-you-go-dallas", "/de/en/articles/explore-the-world/know-before-you-go-denver", "/de/en/articles/explore-the-world/know-before-you-go-detroit", "/de/en/articles/explore-the-world/know-before-you-go-dubai", "/de/en/articles/explore-the-world/know-before-you-go-edinburgh", "/de/en/articles/explore-the-world/know-before-you-go-faro", "/de/en/articles/explore-the-world/know-before-you-go-gothenburg", "/de/en/articles/explore-the-world/know-before-you-go-hamburg", "/de/en/articles/explore-the-world/know-before-you-go-houston", "/de/en/articles/explore-the-world/know-before-you-go-hyderabad", "/de/en/articles/explore-the-world/know-before-you-go-kuala-lumpur", "/de/en/articles/explore-the-world/know-before-you-go-larnaca", "/de/en/articles/explore-the-world/know-before-you-go-ljubljana", "/de/en/articles/explore-the-world/know-before-you-go-malaga", "/de/en/articles/explore-the-world/know-before-you-go-manchester", "/de/en/articles/explore-the-world/know-before-you-go-marseille", "/de/en/articles/explore-the-world/know-before-you-go-minneapolis-st-paul", "/de/en/articles/explore-the-world/know-before-you-go-nairobi", "/de/en/articles/explore-the-world/know-before-you-go-nice", "/de/en/articles/explore-the-world/know-before-you-go-olbia", "/de/en/articles/explore-the-world/know-before-you-go-porto", "/de/en/articles/explore-the-world/know-before-you-go-raleigh-durham", "/de/en/articles/explore-the-world/know-before-you-go-riga", "/de/en/articles/explore-the-world/know-before-you-go-riyadh", "/de/en/articles/explore-the-world/know-before-you-go-san-diego", "/de/en/articles/explore-the-world/know-before-you-go-seattle", "/de/en/articles/explore-the-world/know-before-you-go-st-louis", "/de/en/articles/explore-the-world/know-before-you-go-tallinn", "/de/en/articles/explore-the-world/know-before-you-go-tbilisi", "/de/en/articles/explore-the-world/know-before-you-go-tel-aviv", "/de/en/articles/explore-the-world/know-before-you-go-thessaloniki", "/de/en/articles/explore-the-world/know-before-you-go-tirana", "/de/en/articles/explore-the-world/know-before-you-go-tunis", "/de/en/articles/explore-the-world/know-before-you-go-valletta", "/de/en/articles/explore-the-world/know-before-you-go-venice", "/de/en/articles/explore-the-world/know-before-you-go-vilnius", "/de/en/articles/explore-the-world/know-before-you-go-zagreb", "/de/en/articles/explore-the-world/my-experiences-in-vancouver", "/de/en/articles/explore-the-world/new-shopping", "/de/en/articles/explore-the-world/next-level-gaming", "/de/en/articles/explore-the-world/on-the-scene-architecture-copenhagen", "/de/en/articles/explore-the-world/on-the-scene-art-and-pubs-dublin", "/de/en/articles/explore-the-world/on-the-scene-art-johannesburg", "/de/en/articles/explore-the-world/on-the-scene-bar-basso-milan", "/de/en/articles/explore-the-world/on-the-scene-bookstores-buenos-aires", "/de/en/articles/explore-the-world/on-the-scene-braamfontein-johannesburg", "/de/en/articles/explore-the-world/on-the-scene-brunch-restaurants-la", "/de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich", "/de/en/articles/explore-the-world/on-the-scene-chicago-beer", "/de/en/articles/explore-the-world/on-the-scene-creative-architecture-prague", "/de/en/articles/explore-the-world/on-the-scene-culinary-trip-washington", "/de/en/articles/explore-the-world/on-the-scene-fashion-and-culture-budapest", "/de/en/articles/explore-the-world/on-the-scene-food-mumbai", "/de/en/articles/explore-the-world/on-the-scene-food-trends-amsterdam", "/de/en/articles/explore-the-world/on-the-scene-food-trends-bengaluru", "/de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul", "/de/en/articles/explore-the-world/on-the-scene-hidden-gems-seoul", "/de/en/articles/explore-the-world/on-the-scene-humor-vienna", "/de/en/articles/explore-the-world/on-the-scene-listening-bars-toronto", "/de/en/articles/explore-the-world/on-the-scene-lunch-mexico-city", "/de/en/articles/explore-the-world/on-the-scene-mallorca", "/de/en/articles/explore-the-world/on-the-scene-music-cape-town", "/de/en/articles/explore-the-world/on-the-scene-samba-rio-de-janeiro", "/de/en/articles/explore-the-world/on-the-scene-san-francisco-fashion", "/de/en/articles/explore-the-world/on-the-scene-shanghai-art-scene", "/de/en/articles/explore-the-world/on-the-scene-shopping-barcelona", "/de/en/articles/explore-the-world/on-the-scene-shopping-lisbon", "/de/en/articles/explore-the-world/on-the-scene-shopping-tokyo", "/de/en/articles/explore-the-world/on-the-scene-sports-miami", "/de/en/articles/explore-the-world/on-the-scene-stockholm", "/de/en/articles/explore-the-world/on-the-scene-street-art-charlotte", "/de/en/articles/explore-the-world/on-the-scene-street-art-london", "/de/en/articles/explore-the-world/on-the-scene-streetart-athens", "/de/en/articles/explore-the-world/on-the-scene-super-bros-frankfurt", "/de/en/articles/explore-the-world/on-the-scene-supper-clubs-ny", "/de/en/articles/explore-the-world/on-the-scene-techno-sound-rome", "/de/en/articles/explore-the-world/on-the-scene-tips-oslo", "/de/en/articles/explore-the-world/on-the-scene-topic-bangkok", "/de/en/articles/explore-the-world/on-the-scene-topic-helsinki", "/de/en/articles/explore-the-world/on-the-scene-topic-zurich", "/de/en/articles/explore-the-world/on-the-scene-trends-madrid", "/de/en/articles/explore-the-world/on-the-scene-urban-farming-singapore", "/de/en/articles/explore-the-world/on-the-scene-vancouver-donuts", "/de/en/articles/explore-the-world/on-the-scene-wellness-cuisine-hong-kong", "/de/en/articles/explore-the-world/perfect-day-nice-cote-dazur", "/de/en/articles/explore-the-world/perfect-day-seattle", "/de/en/articles/explore-the-world/perfect-day-tips-vancouver", "/de/en/articles/explore-the-world/picture-perfect-austin", "/de/en/articles/explore-the-world/picture-perfect-beijing", "/de/en/articles/explore-the-world/picture-perfect-bogota", "/de/en/articles/explore-the-world/picture-perfect-boston", "/de/en/articles/explore-the-world/picture-perfect-cairo", "/de/en/articles/explore-the-world/picture-perfect-elevator-boys", "/de/en/articles/explore-the-world/picture-perfect-hyderabad", "/de/en/articles/explore-the-world/picture-perfect-la", "/de/en/articles/explore-the-world/picture-perfect-ny", "/de/en/articles/explore-the-world/picture-perfect-riad", "/de/en/articles/explore-the-world/picture-perfect-singapore", "/de/en/articles/explore-the-world/sao-paulo-sights", "/de/en/articles/explore-the-world/stop-over-bangkok", "/de/en/articles/explore-the-world/stop-over-beijing", "/de/en/articles/explore-the-world/stop-over-boston", "/de/en/articles/explore-the-world/stop-over-buenos-aires", "/de/en/articles/explore-the-world/stop-over-charlotte", "/de/en/articles/explore-the-world/stop-over-hong-kong", "/de/en/articles/explore-the-world/stop-over-johannesburg", "/de/en/articles/explore-the-world/stop-over-los-angeles", "/de/en/articles/explore-the-world/stop-over-mexico-city", "/de/en/articles/explore-the-world/stop-over-seoul", "/de/en/articles/explore-the-world/stop-over-singapore", "/de/en/articles/explore-the-world/stop-over-tokyo", "/de/en/articles/explore-the-world/stop-over-washington", "/de/en/articles/explore-the-world/team-sport", "/de/en/articles/explore-the-world/what-i-learned-living-in-amsterdam", "/de/en/articles/explore-the-world/what-i-learned-living-in-athens", "/de/en/articles/explore-the-world/what-i-learned-living-in-bangkok", "/de/en/articles/explore-the-world/what-i-learned-living-in-barcelona", "/de/en/articles/explore-the-world/what-i-learned-living-in-bengaluru", "/de/en/articles/explore-the-world/what-i-learned-living-in-boston", "/de/en/articles/explore-the-world/what-i-learned-living-in-budapest", "/de/en/articles/explore-the-world/what-i-learned-living-in-buenos-aires", "/de/en/articles/explore-the-world/what-i-learned-living-in-cape-town", "/de/en/articles/explore-the-world/what-i-learned-living-in-charlotte", "/de/en/articles/explore-the-world/what-i-learned-living-in-chicago", "/de/en/articles/explore-the-world/what-i-learned-living-in-dublin", "/de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt", "/de/en/articles/explore-the-world/what-i-learned-living-in-helsinki", "/de/en/articles/explore-the-world/what-i-learned-living-in-hong-kong", "/de/en/articles/explore-the-world/what-i-learned-living-in-istanbul", "/de/en/articles/explore-the-world/what-i-learned-living-in-johannesburg", "/de/en/articles/explore-the-world/what-i-learned-living-in-la", "/de/en/articles/explore-the-world/what-i-learned-living-in-lisbon", "/de/en/articles/explore-the-world/what-i-learned-living-in-london", "/de/en/articles/explore-the-world/what-i-learned-living-in-madrid", "/de/en/articles/explore-the-world/what-i-learned-living-in-mallorca", "/de/en/articles/explore-the-world/what-i-learned-living-in-mexico-city", "/de/en/articles/explore-the-world/what-i-learned-living-in-miami", "/de/en/articles/explore-the-world/what-i-learned-living-in-milan", "/de/en/articles/explore-the-world/what-i-learned-living-in-mumbai", "/de/en/articles/explore-the-world/what-i-learned-living-in-munich", "/de/en/articles/explore-the-world/what-i-learned-living-in-ny", "/de/en/articles/explore-the-world/what-i-learned-living-in-oslo", "/de/en/articles/explore-the-world/what-i-learned-living-in-paris", "/de/en/articles/explore-the-world/what-i-learned-living-in-prague", "/de/en/articles/explore-the-world/what-i-learned-living-in-rio-de-janeiro", "/de/en/articles/explore-the-world/what-i-learned-living-in-rome", "/de/en/articles/explore-the-world/what-i-learned-living-in-san-francisco", "/de/en/articles/explore-the-world/what-i-learned-living-in-seoul", "/de/en/articles/explore-the-world/what-i-learned-living-in-shanghai", "/de/en/articles/explore-the-world/what-i-learned-living-in-singapore", "/de/en/articles/explore-the-world/what-i-learned-living-in-stockholm", "/de/en/articles/explore-the-world/what-i-learned-living-in-tokyo", "/de/en/articles/explore-the-world/what-i-learned-living-in-toronto", "/de/en/articles/explore-the-world/what-i-learned-living-in-vienna", "/de/en/articles/explore-the-world/what-i-learned-living-in-washington", "/de/en/articles/explore-the-world/what-i-learned-living-in-zurich", "/de/en/articles/highlights", "/de/en/articles/highlights-european-championship", "/de/en/articles/highlights-european-championship/european-championship-2024-great-hope", "/de/en/articles/highlights-european-championship/european-championship-2024-locations", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-andrich", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-anton", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-baumann", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-beier", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-fuellkrug", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-kimmich", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-kroos", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-mittelstaedt", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-raum", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-tah", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-ter-stegen", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-undav", "/de/en/articles/highlights-european-championship/european-championship-2024-quiz", "/de/en/articles/highlights-european-championship/european-championship-2024-thank-you", "/de/en/articles/highlights-european-championship/hungary-with-pride-and-passion", "/de/en/articles/highlights-european-championship/lose-like-the-germans", "/de/en/articles/highlights-european-championship/meet-the-germans", "/de/en/articles/highlights-european-championship/scotland-with-heart-and-energy", "/de/en/articles/highlights-european-championship/swiss-passion-meets-precision", "/de/en/articles/highlights/all-it-takes-is-a-yes", "/de/en/articles/highlights/allegris-a-new-flight-experience", "/de/en/articles/highlights/allegris-business-class-shanghai", "/de/en/articles/highlights/allegris-business-san-diego", "/de/en/articles/highlights/allegris-destinations", "/de/en/articles/highlights/allegris-dirk-nowitzki", "/de/en/articles/highlights/allegris-essentials", "/de/en/articles/highlights/allegris-experiences", "/de/en/articles/highlights/allegris-new-york", "/de/en/articles/highlights/allegris-premium-economy-san-diego", "/de/en/articles/highlights/allegris-travel-hacks", "/de/en/articles/highlights/allegris-typologies", "/de/en/articles/highlights/art-and-travel-delhi-berlin", "/de/en/articles/highlights/austin-texas-city-of-live-music", "/de/en/articles/highlights/chisinau-winter", "/de/en/articles/highlights/dfb-partnership-diversity-success", "/de/en/articles/highlights/exclusive-first-class-tracksuit", "/de/en/articles/highlights/fashion-footprints-new-york", "/de/en/articles/highlights/hyderabad-city-of-pearls-and-programmers", "/de/en/articles/highlights/johannesburg-winter", "/de/en/articles/highlights/minneapolis-best-winter-activities", "/de/en/articles/highlights/minneapolis-winter", "/de/en/articles/highlights/mumbai-nyc-art-journey", "/de/en/articles/highlights/mumbai-san-francisco-art-journey", "/de/en/articles/highlights/mumbai-uk-art-journey", "/de/en/articles/highlights/new-york-fashion-week", "/de/en/articles/highlights/raleigh-nc-winter", "/de/en/articles/highlights/rome-art-and-culture", "/de/en/articles/highlights/sao-paulo-carnival-brazil-largest-street-carnival", "/de/en/articles/highlights/seattle-winter", "/de/en/articles/highlights/shanghai-best-restaurants-and-traditional-chinese-dishes", "/de/en/articles/highlights/soccer-event-in-north-america", "/de/en/articles/highlights/sports-experiences-rio-de-janeiro", "/de/en/articles/highlights/stefan-marx-travel-hacks", "/de/en/articles/highlights/the-art-of-flying-extra-long-bed", "/de/en/articles/highlights/the-art-of-flying-extra-space-seat", "/de/en/articles/highlights/the-art-of-flying-suite", "/de/en/articles/highlights/vancouver-winter", "/de/en/articles/tags", "/de/en/articles/tags/algiers", "/de/en/articles/tags/allegris", "/de/en/articles/tags/allegris-inspires", "/de/en/articles/tags/almaty", "/de/en/articles/tags/amman", "/de/en/articles/tags/amsterdam", "/de/en/articles/tags/art", "/de/en/articles/tags/art-basel-miami-beach", "/de/en/articles/tags/athens", "/de/en/articles/tags/atlanta", "/de/en/articles/tags/bangkok", "/de/en/articles/tags/barcelona", "/de/en/articles/tags/be-picky", "/de/en/articles/tags/beijing", "/de/en/articles/tags/bengaluru", "/de/en/articles/tags/berlin", "/de/en/articles/tags/bilbao", "/de/en/articles/tags/bogota", "/de/en/articles/tags/boston", "/de/en/articles/tags/budapest", "/de/en/articles/tags/buenos-aires", "/de/en/articles/tags/cagliari", "/de/en/articles/tags/cairo", "/de/en/articles/tags/cape-town", "/de/en/articles/tags/casablanca", "/de/en/articles/tags/catania", "/de/en/articles/tags/charlotte", "/de/en/articles/tags/chennai", "/de/en/articles/tags/chicago", "/de/en/articles/tags/copenhagen", "/de/en/articles/tags/dallas", "/de/en/articles/tags/denver", "/de/en/articles/tags/detroit", "/de/en/articles/tags/dubai", "/de/en/articles/tags/dublin", "/de/en/articles/tags/eat-see-do", "/de/en/articles/tags/edinburgh", "/de/en/articles/tags/essentials", "/de/en/articles/tags/faro", "/de/en/articles/tags/fly-with-me", "/de/en/articles/tags/flying-high", "/de/en/articles/tags/food", "/de/en/articles/tags/frankfurt", "/de/en/articles/tags/frequent-flyers", "/de/en/articles/tags/future-of-flying", "/de/en/articles/tags/gothenburg", "/de/en/articles/tags/hamburg", "/de/en/articles/tags/helsinki", "/de/en/articles/tags/history", "/de/en/articles/tags/hong-kong", "/de/en/articles/tags/houston", "/de/en/articles/tags/hyderabad", "/de/en/articles/tags/in-my-hood", "/de/en/articles/tags/inside-lufthansa", "/de/en/articles/tags/istanbul", "/de/en/articles/tags/johannesburg", "/de/en/articles/tags/know-before-you-go", "/de/en/articles/tags/kuala-lumpur", "/de/en/articles/tags/larnaca", "/de/en/articles/tags/lisbon", "/de/en/articles/tags/ljubljana", "/de/en/articles/tags/london", "/de/en/articles/tags/los-angeles", "/de/en/articles/tags/madrid", "/de/en/articles/tags/malaga", "/de/en/articles/tags/mallorca", "/de/en/articles/tags/manchester", "/de/en/articles/tags/marseille", "/de/en/articles/tags/mexico-city", "/de/en/articles/tags/miami", "/de/en/articles/tags/milan", "/de/en/articles/tags/minneapolis-st-paul", "/de/en/articles/tags/mumbai", "/de/en/articles/tags/munich", "/de/en/articles/tags/music", "/de/en/articles/tags/my-world", "/de/en/articles/tags/nairobi", "/de/en/articles/tags/new-york", "/de/en/articles/tags/nice", "/de/en/articles/tags/olbia", "/de/en/articles/tags/on-the-scene", "/de/en/articles/tags/oslo", "/de/en/articles/tags/paris", "/de/en/articles/tags/perfect-day", "/de/en/articles/tags/picture-perfect", "/de/en/articles/tags/porto", "/de/en/articles/tags/prague", "/de/en/articles/tags/raleigh-durham", "/de/en/articles/tags/riga", "/de/en/articles/tags/rio-de-janeiro", "/de/en/articles/tags/riyadh", "/de/en/articles/tags/rome", "/de/en/articles/tags/san-diego", "/de/en/articles/tags/san-francisco", "/de/en/articles/tags/seattle", "/de/en/articles/tags/seoul", "/de/en/articles/tags/shanghai", "/de/en/articles/tags/shopping", "/de/en/articles/tags/singapore", "/de/en/articles/tags/sport", "/de/en/articles/tags/st-louis", "/de/en/articles/tags/stockholm", "/de/en/articles/tags/stop-over", "/de/en/articles/tags/tallinn", "/de/en/articles/tags/tbilisi", "/de/en/articles/tags/team-stories", "/de/en/articles/tags/tel-aviv", "/de/en/articles/tags/thessaloniki", "/de/en/articles/tags/tirana", "/de/en/articles/tags/tokyo", "/de/en/articles/tags/toronto", "/de/en/articles/tags/tunis", "/de/en/articles/tags/valletta", "/de/en/articles/tags/vancouver", "/de/en/articles/tags/venice", "/de/en/articles/tags/vienna", "/de/en/articles/tags/vilnius", "/de/en/articles/tags/washington-dc", "/de/en/articles/tags/what-i-learned", "/de/en/articles/tags/what-the-hack", "/de/en/articles/tags/yes-stories", "/de/en/articles/tags/zagreb", "/de/en/articles/tags/zurich", "/de/en/assistenzhunde", "/de/en/automatic-check-in", "/de/en/baggage", "/de/en/baggage-irregularities", "/de/en/besondere-befoerderungsbedingungen-bus", "/de/en/bid-upgrade", "/de/en/boarding", "/de/en/boeing787", "/de/en/book-and-manage/additional-services/get-your-guide", "/de/en/book-and-manage/additional-services/travel-insurances", "/de/en/book-and-manage/booking-services/manage-my-bookings", "/de/en/book-and-manage/cancellation-and-refund/refund/refund-form", "/de/en/book-and-manage/destination", "/de/en/book-and-manage/digital-self-services/airline-apps", "/de/en/book-and-manage/flights/air-baltic", "/de/en/book-and-manage/flights/ana", "/de/en/book-and-manage/flights/ana/faq", "/de/en/book-and-manage/flights/giftvoucher", "/de/en/book-and-manage/flights/helvetic", "/de/en/book-and-manage/flights/lufthansa-voucher", "/de/en/book-and-manage/flights/wetlease-hub", "/de/en/book-and-manage/passenger-receipt-90days/confirmation", "/de/en/book-and-manage/pax-receipt", "/de/en/book-and-manage/pax-receipt/invoices-different-countries", "/de/en/book-and-manage/rebook", "/de/en/book-and-manage/rebook/involuntary-rebooking", "/de/en/book-and-manage/rebook/voluntary-rebooking", "/de/en/book-and-manage/stopover", "/de/en/book-and-manage/stopover/bayerischer-hof", "/de/en/book-and-manage/stopover/neuschwanstein", "/de/en/book-and-manage/stopover/zugspitze", "/de/en/business-class", "/de/en/business-class-on-short-and-medium-haul", "/de/en/business-services", "/de/en/business-terms-and-conditions", "/de/en/cancellations-and-refunds", "/de/en/carry-on-baggage", "/de/en/cash-and-miles", "/de/en/check-in-baggage", "/de/en/check-in-with-the-family", "/de/en/child-restraint-systems", "/de/en/children-on-board", "/de/en/childrens-menus-on-board", "/de/en/common", "/de/en/common/accessibility-statement", "/de/en/common/agb-extra-services-at-online-check-in", "/de/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation", "/de/en/common/baggage-conditions", "/de/en/common/compensation-voucher", "/de/en/common/imprint/lufthansa-insights-imprint", "/de/en/common/privacy-statement/privacy-statement-group", "/de/en/common/seatreservation-condtions/seat-reservations", "/de/en/cookie-policy", "/de/en/culinaryjourney", "/de/en/dangerous-dogs", "/de/en/data-collection-canada", "/de/en/data-collection-usa", "/de/en/data-protection-information", "/de/en/datenschutz", "/de/en/digital-baggage-services", "/de/en/digital-self-services", "/de/en/digital-travel-companion", "/de/en/discover-lufthansa/carbon-offsetting/climate-protection-projects", "/de/en/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge", "/de/en/discover-lufthansa/carbon-offsetting/faq-saf", "/de/en/discover-lufthansa/carbon-offsetting/saf", "/de/en/discover-lufthansa/flightreservation-priceguarantee", "/de/en/discover-lufthansa/lufthansa-fleet/351", "/de/en/discover-lufthansa/lufthansa-group-airlines/ita-airways", "/de/en/discover-lufthansa/miles-and-more-credit-card", "/de/en/discover-lufthansa/new-onboard-experience", "/de/en/discover-lufthansa/take-off", "/de/en/doctor-on-board", "/de/en/doctor-on-board-news", "/de/en/during-your-trip/food-and-beverages/onboard-delights/faq", "/de/en/during-your-trip/internet-overview", "/de/en/during-your-trip/lhg-wifi", "/de/en/economy-class", "/de/en/electronic-bag-tags", "/de/en/entryprocesses", "/de/en/europa-tarife-economy-class", "/de/en/europcar", "/de/en/event/dghm-2026", "/de/en/exclusive-charter", "/de/en/faq-data-security", "/de/en/faq-ejournals", "/de/en/faq-password-security", "/de/en/farealert/best-price-alert", "/de/en/feedback", "/de/en/feedback-past-flight", "/de/en/feedback/feedbackai", "/de/en/fia-valet-service", "/de/en/first-class", "/de/en/first-class-comfort", "/de/en/first-class-lounges", "/de/en/first-class-personal-assistant", "/de/en/first-class-terminal", "/de/en/first-class-valet-parking-service", "/de/en/fliegen-mit-baby", "/de/en/flight-disruptions", "/de/en/flight-search", "/de/en/flights", "/de/en/fly-more-sustainabl", "/de/en/flying-with-small-children", "/de/en/flynet", "/de/en/fmg-valet-parking-service", "/de/en/food-and-beverages", "/de/en/frankfurt-fair", "/de/en/free2move", "/de/en/freigepaeck-regeln", "/de/en/gefaehrliche-gegenstaende", "/de/en/general-conditions-currency-conversion", "/de/en/good-for-train", "/de/en/green-fare", "/de/en/group-travel", "/de/en/group-travel-and-charter", "/de/en/help-and-contact", "/de/en/hertz", "/de/en/homepage", "/de/en/hotel-offers", "/de/en/imprint", "/de/en/lh-rentalcar", "/de/en/local-page/south-africa-winter-promotion", "/de/en/lounge-companions", "/de/en/lounges", "/de/en/lufthansa-am-flughafen-frankfurt", "/de/en/lufthansa-at-berlin-airport", "/de/en/lufthansa-at-duesseldorf-airport", "/de/en/lufthansa-at-vienna-airport", "/de/en/lufthansa-at-zuerich-airport", "/de/en/lufthansa-aviation-group", "/de/en/lufthansa-business-class-on-long-haul-routes", "/de/en/lufthansa-city/culinaryjourney", "/de/en/lufthansa-city/menu-card", "/de/en/lufthansa-corporate-customers", "/de/en/lufthansa-express", "/de/en/lufthansa-express-bus", "/de/en/lufthansa-express-rail", "/de/en/lufthansa-first-class-entertainment", "/de/en/lufthansa-first-class-fleet", "/de/en/lufthansa-group-star-alliance-and-partner-airlines", "/de/en/lufthansa-guide-service", "/de/en/lufthansa-terminal-muenchen", "/de/en/lufthansa-travel-classes", "/de/en/medikamenten-transport", "/de/en/meetings-and-events", "/de/en/meetings-and-events-delegates", "/de/en/meetings-and-events-organisers", "/de/en/menus-on-long-haul-flights", "/de/en/menus-travel-classes", "/de/en/miles-and-more", "/de/en/mobility-partner-program-healthcare", "/de/en/most-significant-route", "/de/en/munich-fair", "/de/en/my-bookings", "/de/en/my-logbook", "/de/en/onboard-delights", "/de/en/online-check-in", "/de/en/online-check-in-info", "/de/en/overview-flights", "/de/en/overview-manage", "/de/en/overview-special-request", "/de/en/overview-travel-information", "/de/en/partner", "/de/en/passenger-receipt-90", "/de/en/passenger-rights", "/de/en/passengers-using-wheelchairs", "/de/en/passengers-with-sensory-impairment", "/de/en/payment-options-at-the-airport", "/de/en/pre-check-in", "/de/en/premium-economy-class", "/de/en/prepare-for-your-trip/baggage/baggage-conditions", "/de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg", "/de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay", "/de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage", "/de/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage", "/de/en/prepare-for-your-trip/baggage/electronic-devices-and-batteries", "/de/en/prepare-for-your-trip/baggage/sport-baggage/register-ammunition", "/de/en/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation", "/de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation", "/de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation", "/de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation", "/de/en/prepare-for-your-trip/current-travel-information", "/de/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system", "/de/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk", "/de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing", "/de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing", "/de/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment", "/de/en/prepare-for-your-trip/travel-classes/economy-basic", "/de/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass", "/de/en/prepare-for-your-trip/travelling-with-children/planning-with-kids", "/de/en/rail-and-fly", "/de/en/rail-fly-terms-and-conditions", "/de/en/rechnungsbeleg", "/de/en/refund", "/de/en/register-animal-cabin", "/de/en/schengen", "/de/en/seat-maps", "/de/en/secure-flight", "/de/en/security-check-time-slot", "/de/en/security-fast-lanes", "/de/en/sepa-terms-and-conditions", "/de/en/sepa-terms-and-conditions-b", "/de/en/services-at-frankfurt-airport", "/de/en/services-at-the-airport", "/de/en/services-munich-airport", "/de/en/services-on-board", "/de/en/shopping", "/de/en/sixt", "/de/en/special-meals", "/de/en/special-needs", "/de/en/sports-baggage", "/de/en/support/contact/contact-form-confirmation", "/de/en/support/contact/passenger-duty-united-kingdom", "/de/en/support/feedback-and-contact-airlines", "/de/en/support/support", "/de/en/terms-and-conditions-lh", "/de/en/terms-of-service-group", "/de/en/terms-of-use", "/de/en/tiere-als-handgepaeck", "/de/en/tiere-als-uebergepaeck", "/de/en/timetable-and-flight-status", "/de/en/tips-senior-travellers", "/de/en/travel-agencies", "/de/en/travel-briefing", "/de/en/travel-expense-management", "/de/en/travel-id-terms-conditions", "/de/en/travelling-healthy", "/de/en/travelling-with-animals", "/de/en/travelling-with-children", "/de/en/travelling-with-special-requirements", "/de/en/traveltricks", "/de/en/uebergepaeck", "/de/en/unaccompanied-minors", "/de/en/unterhaltung-an-bord", "/de/en/upgrade-business-class-long-haul", "/de/en/upgrade-first-class", "/de/en/upgrade-info", "/de/en/upgrade-options", "/de/en/upgrade-premium-economy-class", "/de/en/upgrade-to-business-class", "/de/en/upgrade-to-premium-economy-class", "/de/en/upgrades-at-online-check-in", "/de/en/wheelchair-batteries", "/de/en/with-children-at-the-airport", "/gb/en/100-years", "/gb/en/100-years/cabin-design", "/gb/en/100-years/campaigns", "/gb/en/100-years/chronicle", "/gb/en/100-years/crane", "/gb/en/100-years/destinations", "/gb/en/100-years/fleet", "/gb/en/100-years/global-network", "/gb/en/100-years/history", "/gb/en/100-years/history/menu-on-board", "/gb/en/320", "/gb/en/32n", "/gb/en/359", "/gb/en/744", "/gb/en/accessible-travel", "/gb/en/add-sports-baggage", "/gb/en/additional-services", "/gb/en/addresses-worldwide", "/gb/en/admission-rules", "/gb/en/advance-seat-reservation", "/gb/en/advance-seat-reservations-terms-and-conditions", "/gb/en/advice-for-travellers-with-special-needs-to-and-from-the-usa", "/gb/en/affiliatemarketing", "/gb/en/airport-information", "/gb/en/all-check-in", "/gb/en/anmeldung-tiere-frachtraum", "/gb/en/arrival-services", "/gb/en/articles", "/gb/en/articles/authors", "/gb/en/articles/authors/alexandra-mikamo", "/gb/en/articles/authors/florian-schwebel", "/gb/en/articles/authors/florian-tomberg", "/gb/en/articles/authors/julia-buth", "/gb/en/articles/authors/till-weisbrod", "/gb/en/articles/explore-flying", "/gb/en/articles/explore-flying/7-people-who-shaped-lufthansa-history", "/gb/en/articles/explore-flying/a-girl-named-lufthansa", "/gb/en/articles/explore-flying/aircraft-lights-explained", "/gb/en/articles/explore-flying/allegris-business-class-dirk-nowitzki", "/gb/en/articles/explore-flying/allegris-exclusive-first-class-loungewear", "/gb/en/articles/explore-flying/allegris-first-class-innovations", "/gb/en/articles/explore-flying/allegris-first-class-reasons-for-allegris-first-class", "/gb/en/articles/explore-flying/allegris-fox", "/gb/en/articles/explore-flying/anniversary-super-crane-special", "/gb/en/articles/explore-flying/art-basel-miami-beach-stefan-marx", "/gb/en/articles/explore-flying/best-airport-restaurants", "/gb/en/articles/explore-flying/business-class-culinary-journey-with-johann-lafer", "/gb/en/articles/explore-flying/celebrating-20-years-of-excellence", "/gb/en/articles/explore-flying/cockpit-collaboration", "/gb/en/articles/explore-flying/come-fly-with-me-lufthansa-allegris", "/gb/en/articles/explore-flying/culinary-craftsmanship-smoked-fish-for-first-and-business-class", "/gb/en/articles/explore-flying/essentials-future-of-flying", "/gb/en/articles/explore-flying/essentials-lufthansa-facts", "/gb/en/articles/explore-flying/essentials-surprising-lufthansa-numbers", "/gb/en/articles/explore-flying/everyone-wants-to-fly-with-the-cranes", "/gb/en/articles/explore-flying/female-pilots", "/gb/en/articles/explore-flying/first-class-culinary-inspiration-journey-tokyo", "/gb/en/articles/explore-flying/first-class-reimagined", "/gb/en/articles/explore-flying/first-class-terminal-architecture", "/gb/en/articles/explore-flying/flying-high-christoph-quarch", "/gb/en/articles/explore-flying/flying-high-meta-city", "/gb/en/articles/explore-flying/future-of-flying", "/gb/en/articles/explore-flying/help-alliance-engagement-in-tanzania", "/gb/en/articles/explore-flying/help-alliance-taking-off-for-a-good-cause", "/gb/en/articles/explore-flying/hon-circle-event", "/gb/en/articles/explore-flying/how-to-become-a-flight-attendant", "/gb/en/articles/explore-flying/how-to-become-a-pilot", "/gb/en/articles/explore-flying/inflight-entertainment-vr-experience", "/gb/en/articles/explore-flying/inside-lufthansa-lh-allegris", "/gb/en/articles/explore-flying/interview-livery-iconic-moments", "/gb/en/articles/explore-flying/livery-iconic-moments", "/gb/en/articles/explore-flying/lufthansa-allegris-first-class", "/gb/en/articles/explore-flying/lufthansa-allegris-welcome-to-the-future-of-aviation", "/gb/en/articles/explore-flying/lufthansa-classics", "/gb/en/articles/explore-flying/lufthansa-fleet-our-aircrafts", "/gb/en/articles/explore-flying/lufthansa-group-wifi", "/gb/en/articles/explore-flying/lufthansa-help-alliance-i-fly-for-campaign", "/gb/en/articles/explore-flying/lufthansa-in-the-spotlight", "/gb/en/articles/explore-flying/lufthansa-innovation-hub-future-of-flying", "/gb/en/articles/explore-flying/lufthansa-insights-art", "/gb/en/articles/explore-flying/lufthansa-lounges", "/gb/en/articles/explore-flying/lufthansa-orchestra-channel-aid-live-in-concert", "/gb/en/articles/explore-flying/lufthansa-uniforms-history", "/gb/en/articles/explore-flying/meet-the-makers-innovations-for-individual-well-being", "/gb/en/articles/explore-flying/meet-the-makers-lufthansa-allegris-business-class", "/gb/en/articles/explore-flying/meet-the-makers-lufthansa-allegris-first-class", "/gb/en/articles/explore-flying/meet-the-makers-the-manufactures-of-the-first-class-suites", "/gb/en/articles/explore-flying/new-lufthansa-lounge-newark-interview", "/gb/en/articles/explore-flying/oktoberfest-traditional-bavarian-attire", "/gb/en/articles/explore-flying/pride-diversifly-queer-employee-network-lufthansa-group", "/gb/en/articles/explore-flying/queer-travel-safer-trips", "/gb/en/articles/explore-flying/responsibility-lufthansa", "/gb/en/articles/explore-flying/things-you-always-wanted-to-know-about-flying", "/gb/en/articles/explore-flying/time-travel-ki-aviation", "/gb/en/articles/explore-flying/travel-trends", "/gb/en/articles/explore-flying/vacation-packing-list", "/gb/en/articles/explore-flying/welcome-to-my-world-alexandra-maria-lara", "/gb/en/articles/explore-flying/welcome-to-my-world-bridget-finn", "/gb/en/articles/explore-flying/welcome-to-my-world-elyas-mbarek", "/gb/en/articles/explore-flying/welcome-to-my-world-emilia-schuele", "/gb/en/articles/explore-flying/welcome-to-my-world-karolina-kurkova", "/gb/en/articles/explore-flying/welcome-to-my-world-karoline-herfurth", "/gb/en/articles/explore-flying/welcome-to-my-world-lexie-alford", "/gb/en/articles/explore-flying/what-does-luxury-mean-today", "/gb/en/articles/explore-flying/what-the-hack-anti-jetlag-tips", "/gb/en/articles/explore-flying/what-the-hack-best-seats", "/gb/en/articles/explore-flying/what-the-hack-travel-gadgets", "/gb/en/articles/explore-flying/what-the-hack-travel-hacks", "/gb/en/articles/explore-flying/what-the-hack-travel-with-kids", "/gb/en/articles/explore-flying/what-the-hack-waiting-time-at-the-airport", "/gb/en/articles/explore-flying/what-the-hack-what-is-the-etiquette-of-traveling", "/gb/en/articles/explore-flying/yes-stories-the-fascination-of-skydiving", "/gb/en/articles/explore-flying/yes-stories-the-two-worlds-of-kaye-ree", "/gb/en/articles/explore-flying/yes-stories-thorsten-buss", "/gb/en/articles/explore-flying/yes-stories-tom-rees", "/gb/en/articles/explore-the-world", "/gb/en/articles/explore-the-world/a-perfect-day-amsterdam-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-art-basel-miami-beach-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-athens-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-bangkok-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-beijing-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-bengaluru-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-boston-on-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-budapest-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-buenos-aires-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-cape-town-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-charlotte-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-chicago-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-copenhagen-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-dublin-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-frankfurt-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-hamburg", "/gb/en/articles/explore-the-world/a-perfect-day-helsinki-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-hong-kong-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-houston-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-istanbul-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-johannesburg-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-la-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-lisbon-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-london-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-madrid-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-malaga-on-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-mallorca-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-mexico-city-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-miami-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-milan-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-mumbai-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-munich-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-ny-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-oslo-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-paris-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-porto-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-prague-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-rio-de-janeiro-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-rome-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-san-francisco-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-seoul-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-shanghai-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-singapore-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-stockholm-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-tokyo-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-toronto-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-vienna-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-washington-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-zurich-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-nairobi-city-in-one-day", "/gb/en/articles/explore-the-world/art-basel-miami-beach-fun-facts", "/gb/en/articles/explore-the-world/be-picky-amsterdam-insider-tips", "/gb/en/articles/explore-the-world/be-picky-athens-insider-tips", "/gb/en/articles/explore-the-world/be-picky-bangkok-insider-tips", "/gb/en/articles/explore-the-world/be-picky-barcelona-insider-tips", "/gb/en/articles/explore-the-world/be-picky-bengaluru", "/gb/en/articles/explore-the-world/be-picky-budapest-insider-tips", "/gb/en/articles/explore-the-world/be-picky-buenos-aires-insider-tips", "/gb/en/articles/explore-the-world/be-picky-cape-town-insider-tips", "/gb/en/articles/explore-the-world/be-picky-charlotte-insider-tips", "/gb/en/articles/explore-the-world/be-picky-chicago-insider-tips", "/gb/en/articles/explore-the-world/be-picky-copenhagen", "/gb/en/articles/explore-the-world/be-picky-dublin-insider-tips", "/gb/en/articles/explore-the-world/be-picky-frankfurt-insider-tips", "/gb/en/articles/explore-the-world/be-picky-helsinkis-insider-tips", "/gb/en/articles/explore-the-world/be-picky-hong-kong-insider-tips", "/gb/en/articles/explore-the-world/be-picky-istanbul-insider-tips", "/gb/en/articles/explore-the-world/be-picky-johannesburg-insider-tipps", "/gb/en/articles/explore-the-world/be-picky-la-insider-tips", "/gb/en/articles/explore-the-world/be-picky-lisbon", "/gb/en/articles/explore-the-world/be-picky-little-italy-in-vancouver", "/gb/en/articles/explore-the-world/be-picky-london-insider-tips", "/gb/en/articles/explore-the-world/be-picky-madrid", "/gb/en/articles/explore-the-world/be-picky-mallorca-insider-tips", "/gb/en/articles/explore-the-world/be-picky-mexico-city-insider-tips", "/gb/en/articles/explore-the-world/be-picky-miami-insider-tips", "/gb/en/articles/explore-the-world/be-picky-milan-insider-tips", "/gb/en/articles/explore-the-world/be-picky-mumbai-insider-tips", "/gb/en/articles/explore-the-world/be-picky-munich-insider-tip-anika-landsteiner", "/gb/en/articles/explore-the-world/be-picky-ny-insider-tips", "/gb/en/articles/explore-the-world/be-picky-oslo-insider-tips", "/gb/en/articles/explore-the-world/be-picky-paris-insider-tips", "/gb/en/articles/explore-the-world/be-picky-prague-insider-tips", "/gb/en/articles/explore-the-world/be-picky-rio-de-janeiro-insider-tips", "/gb/en/articles/explore-the-world/be-picky-rome-insider-tips", "/gb/en/articles/explore-the-world/be-picky-san-francisco-insider-tips", "/gb/en/articles/explore-the-world/be-picky-seoul-insider-tips", "/gb/en/articles/explore-the-world/be-picky-shanghai-insider-tips", "/gb/en/articles/explore-the-world/be-picky-singapore-insider-tips", "/gb/en/articles/explore-the-world/be-picky-stockholm", "/gb/en/articles/explore-the-world/be-picky-tokyo-insider-tips", "/gb/en/articles/explore-the-world/be-picky-toronto-insider-tips", "/gb/en/articles/explore-the-world/be-picky-vienna-insider-tips", "/gb/en/articles/explore-the-world/be-picky-washington-insider-tips", "/gb/en/articles/explore-the-world/be-picky-zurich-insider-tips", "/gb/en/articles/explore-the-world/copenhagen-what-i-have-learned", "/gb/en/articles/explore-the-world/eat-see-do-algiers", "/gb/en/articles/explore-the-world/eat-see-do-almaty", "/gb/en/articles/explore-the-world/eat-see-do-amman", "/gb/en/articles/explore-the-world/eat-see-do-atlanta", "/gb/en/articles/explore-the-world/eat-see-do-beijing", "/gb/en/articles/explore-the-world/eat-see-do-berlin", "/gb/en/articles/explore-the-world/eat-see-do-bilbao", "/gb/en/articles/explore-the-world/eat-see-do-bogota", "/gb/en/articles/explore-the-world/eat-see-do-boston", "/gb/en/articles/explore-the-world/eat-see-do-cagliari", "/gb/en/articles/explore-the-world/eat-see-do-cairo", "/gb/en/articles/explore-the-world/eat-see-do-casablanca", "/gb/en/articles/explore-the-world/eat-see-do-catania", "/gb/en/articles/explore-the-world/eat-see-do-chennai", "/gb/en/articles/explore-the-world/eat-see-do-dallas", "/gb/en/articles/explore-the-world/eat-see-do-denver", "/gb/en/articles/explore-the-world/eat-see-do-detroit", "/gb/en/articles/explore-the-world/eat-see-do-dubai", "/gb/en/articles/explore-the-world/eat-see-do-edinburgh", "/gb/en/articles/explore-the-world/eat-see-do-faro", "/gb/en/articles/explore-the-world/eat-see-do-gothenburg", "/gb/en/articles/explore-the-world/eat-see-do-hamburg", "/gb/en/articles/explore-the-world/eat-see-do-houston", "/gb/en/articles/explore-the-world/eat-see-do-hyderabad", "/gb/en/articles/explore-the-world/eat-see-do-kuala-lumpur", "/gb/en/articles/explore-the-world/eat-see-do-larnaca", "/gb/en/articles/explore-the-world/eat-see-do-ljubljana", "/gb/en/articles/explore-the-world/eat-see-do-malaga", "/gb/en/articles/explore-the-world/eat-see-do-manchester", "/gb/en/articles/explore-the-world/eat-see-do-marseille", "/gb/en/articles/explore-the-world/eat-see-do-minneapolis-st-paul", "/gb/en/articles/explore-the-world/eat-see-do-nairobi", "/gb/en/articles/explore-the-world/eat-see-do-nice", "/gb/en/articles/explore-the-world/eat-see-do-olbia", "/gb/en/articles/explore-the-world/eat-see-do-porto", "/gb/en/articles/explore-the-world/eat-see-do-raleigh-durham", "/gb/en/articles/explore-the-world/eat-see-do-riga", "/gb/en/articles/explore-the-world/eat-see-do-riyadh", "/gb/en/articles/explore-the-world/eat-see-do-san-diego", "/gb/en/articles/explore-the-world/eat-see-do-seattle", "/gb/en/articles/explore-the-world/eat-see-do-st-louis", "/gb/en/articles/explore-the-world/eat-see-do-tallinn", "/gb/en/articles/explore-the-world/eat-see-do-tbilisi", "/gb/en/articles/explore-the-world/eat-see-do-tel-aviv", "/gb/en/articles/explore-the-world/eat-see-do-thessaloniki", "/gb/en/articles/explore-the-world/eat-see-do-tirana", "/gb/en/articles/explore-the-world/eat-see-do-tunis", "/gb/en/articles/explore-the-world/eat-see-do-valletta", "/gb/en/articles/explore-the-world/eat-see-do-venice", "/gb/en/articles/explore-the-world/eat-see-do-vilnius", "/gb/en/articles/explore-the-world/eat-see-do-zagreb", "/gb/en/articles/explore-the-world/essentials-amsterdam-facts", "/gb/en/articles/explore-the-world/essentials-athens-facts", "/gb/en/articles/explore-the-world/essentials-bangkok-facts", "/gb/en/articles/explore-the-world/essentials-barcelona-facts", "/gb/en/articles/explore-the-world/essentials-beijing-facts", "/gb/en/articles/explore-the-world/essentials-bengaluru-facts", "/gb/en/articles/explore-the-world/essentials-boston-facts", "/gb/en/articles/explore-the-world/essentials-budapest-facts", "/gb/en/articles/explore-the-world/essentials-buenos-aires-facts", "/gb/en/articles/explore-the-world/essentials-cape-town-facts", "/gb/en/articles/explore-the-world/essentials-charlotte-facts", "/gb/en/articles/explore-the-world/essentials-chicago-facts", "/gb/en/articles/explore-the-world/essentials-copenhagen-facts", "/gb/en/articles/explore-the-world/essentials-dublin-facts", "/gb/en/articles/explore-the-world/essentials-facts-vancouver", "/gb/en/articles/explore-the-world/essentials-frankfurt-facts", "/gb/en/articles/explore-the-world/essentials-helsinki-facts", "/gb/en/articles/explore-the-world/essentials-hong-kong-facts", "/gb/en/articles/explore-the-world/essentials-istanbul-facts", "/gb/en/articles/explore-the-world/essentials-johannesburg-facts", "/gb/en/articles/explore-the-world/essentials-la-facts", "/gb/en/articles/explore-the-world/essentials-lisbon-facts", "/gb/en/articles/explore-the-world/essentials-london-facts", "/gb/en/articles/explore-the-world/essentials-madrid-facts", "/gb/en/articles/explore-the-world/essentials-mallorca-facts", "/gb/en/articles/explore-the-world/essentials-mexico-city-facts", "/gb/en/articles/explore-the-world/essentials-miami-facts", "/gb/en/articles/explore-the-world/essentials-milan-facts", "/gb/en/articles/explore-the-world/essentials-mumbai-facts", "/gb/en/articles/explore-the-world/essentials-munich-facts", "/gb/en/articles/explore-the-world/essentials-ny-facts", "/gb/en/articles/explore-the-world/essentials-oslo-facts", "/gb/en/articles/explore-the-world/essentials-paris-facts", "/gb/en/articles/explore-the-world/essentials-prague-facts", "/gb/en/articles/explore-the-world/essentials-rio-de-janeiro-facts", "/gb/en/articles/explore-the-world/essentials-rome-facts", "/gb/en/articles/explore-the-world/essentials-san-francisco-facts", "/gb/en/articles/explore-the-world/essentials-seoul-facts", "/gb/en/articles/explore-the-world/essentials-shanghai-facts", "/gb/en/articles/explore-the-world/essentials-singapore-facts", "/gb/en/articles/explore-the-world/essentials-stockholm-facts", "/gb/en/articles/explore-the-world/essentials-tokyo-facts", "/gb/en/articles/explore-the-world/essentials-toronto-facts", "/gb/en/articles/explore-the-world/essentials-vienna-facts", "/gb/en/articles/explore-the-world/essentials-washington-facts", "/gb/en/articles/explore-the-world/essentials-zurich-facts", "/gb/en/articles/explore-the-world/experience-art-live", "/gb/en/articles/explore-the-world/experience-nature", "/gb/en/articles/explore-the-world/in-my-hood-apgujeong-seoul", "/gb/en/articles/explore-the-world/in-my-hood-arroios-lissabon", "/gb/en/articles/explore-the-world/in-my-hood-back-bay-boston", "/gb/en/articles/explore-the-world/in-my-hood-bandra-mumbai", "/gb/en/articles/explore-the-world/in-my-hood-chiswick-london", "/gb/en/articles/explore-the-world/in-my-hood-citta-studi-milan", "/gb/en/articles/explore-the-world/in-my-hood-city-centre-cape-town", "/gb/en/articles/explore-the-world/in-my-hood-comercial-drive-vancouver", "/gb/en/articles/explore-the-world/in-my-hood-coyoacan-mexico-city", "/gb/en/articles/explore-the-world/in-my-hood-creative-quarter-dublin", "/gb/en/articles/explore-the-world/in-my-hood-district-helsinki", "/gb/en/articles/explore-the-world/in-my-hood-district-houston", "/gb/en/articles/explore-the-world/in-my-hood-district-malaga", "/gb/en/articles/explore-the-world/in-my-hood-district-nairobi", "/gb/en/articles/explore-the-world/in-my-hood-district-porto", "/gb/en/articles/explore-the-world/in-my-hood-district-viii-budapest", "/gb/en/articles/explore-the-world/in-my-hood-district-zurich", "/gb/en/articles/explore-the-world/in-my-hood-gamlebyen-oslo", "/gb/en/articles/explore-the-world/in-my-hood-geylang-singapur", "/gb/en/articles/explore-the-world/in-my-hood-gulou-beijing", "/gb/en/articles/explore-the-world/in-my-hood-hollywood-road-hong-kong", "/gb/en/articles/explore-the-world/in-my-hood-indiranagar-bengaluru", "/gb/en/articles/explore-the-world/in-my-hood-ipanema-rio-de-janeiro", "/gb/en/articles/explore-the-world/in-my-hood-japantown-san-francisco", "/gb/en/articles/explore-the-world/in-my-hood-kadikoey-istanbul", "/gb/en/articles/explore-the-world/in-my-hood-kampung-attap-kuala-lumpur", "/gb/en/articles/explore-the-world/in-my-hood-kreuzberg-berlin", "/gb/en/articles/explore-the-world/in-my-hood-larchmont-la", "/gb/en/articles/explore-the-world/in-my-hood-le-sentier-paris", "/gb/en/articles/explore-the-world/in-my-hood-mallorca", "/gb/en/articles/explore-the-world/in-my-hood-metaxourgeio-athens", "/gb/en/articles/explore-the-world/in-my-hood-mount-pleasant-washington", "/gb/en/articles/explore-the-world/in-my-hood-munich-sendling", "/gb/en/articles/explore-the-world/in-my-hood-nice-ouest", "/gb/en/articles/explore-the-world/in-my-hood-noord-amsterdam", "/gb/en/articles/explore-the-world/in-my-hood-ny-brooklyn", "/gb/en/articles/explore-the-world/in-my-hood-osterbro-kopenhagen", "/gb/en/articles/explore-the-world/in-my-hood-palermo-buenos-aires", "/gb/en/articles/explore-the-world/in-my-hood-plaza-midwood-charlotte", "/gb/en/articles/explore-the-world/in-my-hood-poblenou-barcelona", "/gb/en/articles/explore-the-world/in-my-hood-rome-pigneto-rome", "/gb/en/articles/explore-the-world/in-my-hood-rosebank-johannesburg", "/gb/en/articles/explore-the-world/in-my-hood-sachsenhausen-frankfurt", "/gb/en/articles/explore-the-world/in-my-hood-salamanca-madrid", "/gb/en/articles/explore-the-world/in-my-hood-schanzenviertel-hamburg", "/gb/en/articles/explore-the-world/in-my-hood-schaumburg-chicago", "/gb/en/articles/explore-the-world/in-my-hood-seventh-district-vienna", "/gb/en/articles/explore-the-world/in-my-hood-shinjuku-tokyo", "/gb/en/articles/explore-the-world/in-my-hood-song-wat-road-bangkok", "/gb/en/articles/explore-the-world/in-my-hood-south-beach-miami", "/gb/en/articles/explore-the-world/in-my-hood-the-bund-shanghai", "/gb/en/articles/explore-the-world/in-my-hood-toronto-summerhill", "/gb/en/articles/explore-the-world/in-my-hood-vasastaden-stockholm", "/gb/en/articles/explore-the-world/in-my-hood-vrsovice-prague", "/gb/en/articles/explore-the-world/in-my-hood-west-seattle-seattle", "/gb/en/articles/explore-the-world/know-before-you-go-algiers", "/gb/en/articles/explore-the-world/know-before-you-go-almaty", "/gb/en/articles/explore-the-world/know-before-you-go-amman", "/gb/en/articles/explore-the-world/know-before-you-go-atlanta", "/gb/en/articles/explore-the-world/know-before-you-go-beijing", "/gb/en/articles/explore-the-world/know-before-you-go-berlin", "/gb/en/articles/explore-the-world/know-before-you-go-bilbao", "/gb/en/articles/explore-the-world/know-before-you-go-bogota", "/gb/en/articles/explore-the-world/know-before-you-go-boston", "/gb/en/articles/explore-the-world/know-before-you-go-cagliari", "/gb/en/articles/explore-the-world/know-before-you-go-cairo", "/gb/en/articles/explore-the-world/know-before-you-go-casablanca", "/gb/en/articles/explore-the-world/know-before-you-go-catania", "/gb/en/articles/explore-the-world/know-before-you-go-chennai", "/gb/en/articles/explore-the-world/know-before-you-go-dallas", "/gb/en/articles/explore-the-world/know-before-you-go-denver", "/gb/en/articles/explore-the-world/know-before-you-go-detroit", "/gb/en/articles/explore-the-world/know-before-you-go-dubai", "/gb/en/articles/explore-the-world/know-before-you-go-edinburgh", "/gb/en/articles/explore-the-world/know-before-you-go-faro", "/gb/en/articles/explore-the-world/know-before-you-go-gothenburg", "/gb/en/articles/explore-the-world/know-before-you-go-hamburg", "/gb/en/articles/explore-the-world/know-before-you-go-houston", "/gb/en/articles/explore-the-world/know-before-you-go-hyderabad", "/gb/en/articles/explore-the-world/know-before-you-go-kuala-lumpur", "/gb/en/articles/explore-the-world/know-before-you-go-larnaca", "/gb/en/articles/explore-the-world/know-before-you-go-ljubljana", "/gb/en/articles/explore-the-world/know-before-you-go-malaga", "/gb/en/articles/explore-the-world/know-before-you-go-manchester", "/gb/en/articles/explore-the-world/know-before-you-go-marseille", "/gb/en/articles/explore-the-world/know-before-you-go-minneapolis-st-paul", "/gb/en/articles/explore-the-world/know-before-you-go-nairobi", "/gb/en/articles/explore-the-world/know-before-you-go-nice", "/gb/en/articles/explore-the-world/know-before-you-go-olbia", "/gb/en/articles/explore-the-world/know-before-you-go-porto", "/gb/en/articles/explore-the-world/know-before-you-go-raleigh-durham", "/gb/en/articles/explore-the-world/know-before-you-go-riga", "/gb/en/articles/explore-the-world/know-before-you-go-riyadh", "/gb/en/articles/explore-the-world/know-before-you-go-san-diego", "/gb/en/articles/explore-the-world/know-before-you-go-seattle", "/gb/en/articles/explore-the-world/know-before-you-go-st-louis", "/gb/en/articles/explore-the-world/know-before-you-go-tallinn", "/gb/en/articles/explore-the-world/know-before-you-go-tbilisi", "/gb/en/articles/explore-the-world/know-before-you-go-tel-aviv", "/gb/en/articles/explore-the-world/know-before-you-go-thessaloniki", "/gb/en/articles/explore-the-world/know-before-you-go-tirana", "/gb/en/articles/explore-the-world/know-before-you-go-tunis", "/gb/en/articles/explore-the-world/know-before-you-go-valletta", "/gb/en/articles/explore-the-world/know-before-you-go-venice", "/gb/en/articles/explore-the-world/know-before-you-go-vilnius", "/gb/en/articles/explore-the-world/know-before-you-go-zagreb", "/gb/en/articles/explore-the-world/my-experiences-in-vancouver", "/gb/en/articles/explore-the-world/new-shopping", "/gb/en/articles/explore-the-world/next-level-gaming", "/gb/en/articles/explore-the-world/on-the-scene-architecture-copenhagen", "/gb/en/articles/explore-the-world/on-the-scene-art-and-pubs-dublin", "/gb/en/articles/explore-the-world/on-the-scene-art-johannesburg", "/gb/en/articles/explore-the-world/on-the-scene-bar-basso-milan", "/gb/en/articles/explore-the-world/on-the-scene-bookstores-buenos-aires", "/gb/en/articles/explore-the-world/on-the-scene-braamfontein-johannesburg", "/gb/en/articles/explore-the-world/on-the-scene-brunch-restaurants-la", "/gb/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich", "/gb/en/articles/explore-the-world/on-the-scene-chicago-beer", "/gb/en/articles/explore-the-world/on-the-scene-creative-architecture-prague", "/gb/en/articles/explore-the-world/on-the-scene-culinary-trip-washington", "/gb/en/articles/explore-the-world/on-the-scene-fashion-and-culture-budapest", "/gb/en/articles/explore-the-world/on-the-scene-food-mumbai", "/gb/en/articles/explore-the-world/on-the-scene-food-trends-amsterdam", "/gb/en/articles/explore-the-world/on-the-scene-food-trends-bengaluru", "/gb/en/articles/explore-the-world/on-the-scene-food-trends-istanbul", "/gb/en/articles/explore-the-world/on-the-scene-hidden-gems-seoul", "/gb/en/articles/explore-the-world/on-the-scene-humor-vienna", "/gb/en/articles/explore-the-world/on-the-scene-listening-bars-toronto", "/gb/en/articles/explore-the-world/on-the-scene-lunch-mexico-city", "/gb/en/articles/explore-the-world/on-the-scene-mallorca", "/gb/en/articles/explore-the-world/on-the-scene-music-cape-town", "/gb/en/articles/explore-the-world/on-the-scene-samba-rio-de-janeiro", "/gb/en/articles/explore-the-world/on-the-scene-san-francisco-fashion", "/gb/en/articles/explore-the-world/on-the-scene-shanghai-art-scene", "/gb/en/articles/explore-the-world/on-the-scene-shopping-barcelona", "/gb/en/articles/explore-the-world/on-the-scene-shopping-lisbon", "/gb/en/articles/explore-the-world/on-the-scene-shopping-tokyo", "/gb/en/articles/explore-the-world/on-the-scene-sports-miami", "/gb/en/articles/explore-the-world/on-the-scene-stockholm", "/gb/en/articles/explore-the-world/on-the-scene-street-art-charlotte", "/gb/en/articles/explore-the-world/on-the-scene-street-art-london", "/gb/en/articles/explore-the-world/on-the-scene-streetart-athens", "/gb/en/articles/explore-the-world/on-the-scene-super-bros-frankfurt", "/gb/en/articles/explore-the-world/on-the-scene-supper-clubs-ny", "/gb/en/articles/explore-the-world/on-the-scene-techno-sound-rome", "/gb/en/articles/explore-the-world/on-the-scene-tips-oslo", "/gb/en/articles/explore-the-world/on-the-scene-topic-bangkok", "/gb/en/articles/explore-the-world/on-the-scene-topic-helsinki", "/gb/en/articles/explore-the-world/on-the-scene-topic-zurich", "/gb/en/articles/explore-the-world/on-the-scene-trends-madrid", "/gb/en/articles/explore-the-world/on-the-scene-urban-farming-singapore", "/gb/en/articles/explore-the-world/on-the-scene-vancouver-donuts", "/gb/en/articles/explore-the-world/on-the-scene-wellness-cuisine-hong-kong", "/gb/en/articles/explore-the-world/perfect-day-nice-cote-dazur", "/gb/en/articles/explore-the-world/perfect-day-seattle", "/gb/en/articles/explore-the-world/perfect-day-tips-vancouver", "/gb/en/articles/explore-the-world/picture-perfect-austin", "/gb/en/articles/explore-the-world/picture-perfect-beijing", "/gb/en/articles/explore-the-world/picture-perfect-bogota", "/gb/en/articles/explore-the-world/picture-perfect-boston", "/gb/en/articles/explore-the-world/picture-perfect-cairo", "/gb/en/articles/explore-the-world/picture-perfect-elevator-boys", "/gb/en/articles/explore-the-world/picture-perfect-hyderabad", "/gb/en/articles/explore-the-world/picture-perfect-la", "/gb/en/articles/explore-the-world/picture-perfect-ny", "/gb/en/articles/explore-the-world/picture-perfect-riad", "/gb/en/articles/explore-the-world/picture-perfect-singapore", "/gb/en/articles/explore-the-world/sao-paulo-sights", "/gb/en/articles/explore-the-world/stop-over-bangkok", "/gb/en/articles/explore-the-world/stop-over-beijing", "/gb/en/articles/explore-the-world/stop-over-boston", "/gb/en/articles/explore-the-world/stop-over-buenos-aires", "/gb/en/articles/explore-the-world/stop-over-charlotte", "/gb/en/articles/explore-the-world/stop-over-hong-kong", "/gb/en/articles/explore-the-world/stop-over-johannesburg", "/gb/en/articles/explore-the-world/stop-over-los-angeles", "/gb/en/articles/explore-the-world/stop-over-mexico-city", "/gb/en/articles/explore-the-world/stop-over-seoul", "/gb/en/articles/explore-the-world/stop-over-singapore", "/gb/en/articles/explore-the-world/stop-over-tokyo", "/gb/en/articles/explore-the-world/stop-over-washington", "/gb/en/articles/explore-the-world/team-sport", "/gb/en/articles/explore-the-world/what-i-learned-living-in-amsterdam", "/gb/en/articles/explore-the-world/what-i-learned-living-in-athens", "/gb/en/articles/explore-the-world/what-i-learned-living-in-bangkok", "/gb/en/articles/explore-the-world/what-i-learned-living-in-barcelona", "/gb/en/articles/explore-the-world/what-i-learned-living-in-bengaluru", "/gb/en/articles/explore-the-world/what-i-learned-living-in-boston", "/gb/en/articles/explore-the-world/what-i-learned-living-in-budapest", "/gb/en/articles/explore-the-world/what-i-learned-living-in-buenos-aires", "/gb/en/articles/explore-the-world/what-i-learned-living-in-cape-town", "/gb/en/articles/explore-the-world/what-i-learned-living-in-charlotte", "/gb/en/articles/explore-the-world/what-i-learned-living-in-chicago", "/gb/en/articles/explore-the-world/what-i-learned-living-in-dublin", "/gb/en/articles/explore-the-world/what-i-learned-living-in-frankfurt", "/gb/en/articles/explore-the-world/what-i-learned-living-in-helsinki", "/gb/en/articles/explore-the-world/what-i-learned-living-in-hong-kong", "/gb/en/articles/explore-the-world/what-i-learned-living-in-istanbul", "/gb/en/articles/explore-the-world/what-i-learned-living-in-johannesburg", "/gb/en/articles/explore-the-world/what-i-learned-living-in-la", "/gb/en/articles/explore-the-world/what-i-learned-living-in-lisbon", "/gb/en/articles/explore-the-world/what-i-learned-living-in-london", "/gb/en/articles/explore-the-world/what-i-learned-living-in-madrid", "/gb/en/articles/explore-the-world/what-i-learned-living-in-mallorca", "/gb/en/articles/explore-the-world/what-i-learned-living-in-mexico-city", "/gb/en/articles/explore-the-world/what-i-learned-living-in-miami", "/gb/en/articles/explore-the-world/what-i-learned-living-in-milan", "/gb/en/articles/explore-the-world/what-i-learned-living-in-mumbai", "/gb/en/articles/explore-the-world/what-i-learned-living-in-munich", "/gb/en/articles/explore-the-world/what-i-learned-living-in-ny", "/gb/en/articles/explore-the-world/what-i-learned-living-in-oslo", "/gb/en/articles/explore-the-world/what-i-learned-living-in-paris", "/gb/en/articles/explore-the-world/what-i-learned-living-in-prague", "/gb/en/articles/explore-the-world/what-i-learned-living-in-rio-de-janeiro", "/gb/en/articles/explore-the-world/what-i-learned-living-in-rome", "/gb/en/articles/explore-the-world/what-i-learned-living-in-san-francisco", "/gb/en/articles/explore-the-world/what-i-learned-living-in-seoul", "/gb/en/articles/explore-the-world/what-i-learned-living-in-shanghai", "/gb/en/articles/explore-the-world/what-i-learned-living-in-singapore", "/gb/en/articles/explore-the-world/what-i-learned-living-in-stockholm", "/gb/en/articles/explore-the-world/what-i-learned-living-in-tokyo", "/gb/en/articles/explore-the-world/what-i-learned-living-in-toronto", "/gb/en/articles/explore-the-world/what-i-learned-living-in-vienna", "/gb/en/articles/explore-the-world/what-i-learned-living-in-washington", "/gb/en/articles/explore-the-world/what-i-learned-living-in-zurich", "/gb/en/articles/highlights", "/gb/en/articles/highlights-european-championship", "/gb/en/articles/highlights-european-championship/european-championship-2024-great-hope", "/gb/en/articles/highlights-european-championship/european-championship-2024-locations", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-andrich", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-anton", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-baumann", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-beier", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-fuellkrug", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-kimmich", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-kroos", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-mittelstaedt", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-raum", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-tah", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-ter-stegen", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-undav", "/gb/en/articles/highlights-european-championship/european-championship-2024-quiz", "/gb/en/articles/highlights-european-championship/european-championship-2024-thank-you", "/gb/en/articles/highlights-european-championship/hungary-with-pride-and-passion", "/gb/en/articles/highlights-european-championship/lose-like-the-germans", "/gb/en/articles/highlights-european-championship/meet-the-germans", "/gb/en/articles/highlights-european-championship/scotland-with-heart-and-energy", "/gb/en/articles/highlights-european-championship/swiss-passion-meets-precision", "/gb/en/articles/highlights/all-it-takes-is-a-yes", "/gb/en/articles/highlights/allegris-a-new-flight-experience", "/gb/en/articles/highlights/allegris-business-class-shanghai", "/gb/en/articles/highlights/allegris-business-san-diego", "/gb/en/articles/highlights/allegris-destinations", "/gb/en/articles/highlights/allegris-dirk-nowitzki", "/gb/en/articles/highlights/allegris-essentials", "/gb/en/articles/highlights/allegris-experiences", "/gb/en/articles/highlights/allegris-new-york", "/gb/en/articles/highlights/allegris-premium-economy-san-diego", "/gb/en/articles/highlights/allegris-travel-hacks", "/gb/en/articles/highlights/allegris-typologies", "/gb/en/articles/highlights/art-and-travel-delhi-berlin", "/gb/en/articles/highlights/austin-texas-city-of-live-music", "/gb/en/articles/highlights/chisinau-winter", "/gb/en/articles/highlights/dfb-partnership-diversity-success", "/gb/en/articles/highlights/exclusive-first-class-tracksuit", "/gb/en/articles/highlights/fashion-footprints-new-york", "/gb/en/articles/highlights/hyderabad-city-of-pearls-and-programmers", "/gb/en/articles/highlights/johannesburg-winter", "/gb/en/articles/highlights/minneapolis-best-winter-activities", "/gb/en/articles/highlights/minneapolis-winter", "/gb/en/articles/highlights/mumbai-nyc-art-journey", "/gb/en/articles/highlights/mumbai-san-francisco-art-journey", "/gb/en/articles/highlights/mumbai-uk-art-journey", "/gb/en/articles/highlights/new-york-fashion-week", "/gb/en/articles/highlights/raleigh-nc-winter", "/gb/en/articles/highlights/rome-art-and-culture", "/gb/en/articles/highlights/sao-paulo-carnival-brazil-largest-street-carnival", "/gb/en/articles/highlights/seattle-winter", "/gb/en/articles/highlights/shanghai-best-restaurants-and-traditional-chinese-dishes", "/gb/en/articles/highlights/sports-experiences-rio-de-janeiro", "/gb/en/articles/highlights/stefan-marx-travel-hacks", "/gb/en/articles/highlights/the-art-of-flying-extra-long-bed", "/gb/en/articles/highlights/the-art-of-flying-extra-space-seat", "/gb/en/articles/highlights/the-art-of-flying-suite", "/gb/en/articles/highlights/vancouver-winter", "/gb/en/articles/tags", "/gb/en/articles/tags/algiers", "/gb/en/articles/tags/allegris", "/gb/en/articles/tags/allegris-inspires", "/gb/en/articles/tags/almaty", "/gb/en/articles/tags/amman", "/gb/en/articles/tags/amsterdam", "/gb/en/articles/tags/art", "/gb/en/articles/tags/art-basel-miami-beach", "/gb/en/articles/tags/athens", "/gb/en/articles/tags/atlanta", "/gb/en/articles/tags/bangkok", "/gb/en/articles/tags/barcelona", "/gb/en/articles/tags/be-picky", "/gb/en/articles/tags/beijing", "/gb/en/articles/tags/bengaluru", "/gb/en/articles/tags/berlin", "/gb/en/articles/tags/bilbao", "/gb/en/articles/tags/bogota", "/gb/en/articles/tags/boston", "/gb/en/articles/tags/budapest", "/gb/en/articles/tags/buenos-aires", "/gb/en/articles/tags/cagliari", "/gb/en/articles/tags/cairo", "/gb/en/articles/tags/cape-town", "/gb/en/articles/tags/casablanca", "/gb/en/articles/tags/catania", "/gb/en/articles/tags/charlotte", "/gb/en/articles/tags/chicago", "/gb/en/articles/tags/copenhagen", "/gb/en/articles/tags/dallas", "/gb/en/articles/tags/denver", "/gb/en/articles/tags/detroit", "/gb/en/articles/tags/dubai", "/gb/en/articles/tags/dublin", "/gb/en/articles/tags/eat-see-do", "/gb/en/articles/tags/edinburgh", "/gb/en/articles/tags/essentials", "/gb/en/articles/tags/faro", "/gb/en/articles/tags/fly-with-me", "/gb/en/articles/tags/flying-high", "/gb/en/articles/tags/food", "/gb/en/articles/tags/frankfurt", "/gb/en/articles/tags/frequent-flyers", "/gb/en/articles/tags/future-of-flying", "/gb/en/articles/tags/gothenburg", "/gb/en/articles/tags/hamburg", "/gb/en/articles/tags/helsinki", "/gb/en/articles/tags/history", "/gb/en/articles/tags/hong-kong", "/gb/en/articles/tags/houston", "/gb/en/articles/tags/hyderabad", "/gb/en/articles/tags/in-my-hood", "/gb/en/articles/tags/inside-lufthansa", "/gb/en/articles/tags/istanbul", "/gb/en/articles/tags/johannesburg", "/gb/en/articles/tags/know-before-you-go", "/gb/en/articles/tags/kuala-lumpur", "/gb/en/articles/tags/larnaca", "/gb/en/articles/tags/lisbon", "/gb/en/articles/tags/ljubljana", "/gb/en/articles/tags/london", "/gb/en/articles/tags/los-angeles", "/gb/en/articles/tags/madrid", "/gb/en/articles/tags/malaga", "/gb/en/articles/tags/mallorca", "/gb/en/articles/tags/manchester", "/gb/en/articles/tags/marseille", "/gb/en/articles/tags/mexico-city", "/gb/en/articles/tags/miami", "/gb/en/articles/tags/milan", "/gb/en/articles/tags/minneapolis-st-paul", "/gb/en/articles/tags/mumbai", "/gb/en/articles/tags/munich", "/gb/en/articles/tags/music", "/gb/en/articles/tags/my-world", "/gb/en/articles/tags/nairobi", "/gb/en/articles/tags/new-york", "/gb/en/articles/tags/nice", "/gb/en/articles/tags/olbia", "/gb/en/articles/tags/on-the-scene", "/gb/en/articles/tags/oslo", "/gb/en/articles/tags/paris", "/gb/en/articles/tags/perfect-day", "/gb/en/articles/tags/picture-perfect", "/gb/en/articles/tags/porto", "/gb/en/articles/tags/prague", "/gb/en/articles/tags/raleigh-durham", "/gb/en/articles/tags/riga", "/gb/en/articles/tags/rio-de-janeiro", "/gb/en/articles/tags/riyadh", "/gb/en/articles/tags/rome", "/gb/en/articles/tags/san-diego", "/gb/en/articles/tags/san-francisco", "/gb/en/articles/tags/seattle", "/gb/en/articles/tags/seoul", "/gb/en/articles/tags/shanghai", "/gb/en/articles/tags/shopping", "/gb/en/articles/tags/singapore", "/gb/en/articles/tags/sport", "/gb/en/articles/tags/st-louis", "/gb/en/articles/tags/stockholm", "/gb/en/articles/tags/stop-over", "/gb/en/articles/tags/tallinn", "/gb/en/articles/tags/tbilisi", "/gb/en/articles/tags/team-stories", "/gb/en/articles/tags/tel-aviv", "/gb/en/articles/tags/thessaloniki", "/gb/en/articles/tags/tirana", "/gb/en/articles/tags/tokyo", "/gb/en/articles/tags/toronto", "/gb/en/articles/tags/tunis", "/gb/en/articles/tags/valletta", "/gb/en/articles/tags/vancouver", "/gb/en/articles/tags/venice", "/gb/en/articles/tags/vienna", "/gb/en/articles/tags/vilnius", "/gb/en/articles/tags/washington-dc", "/gb/en/articles/tags/what-i-learned", "/gb/en/articles/tags/what-the-hack", "/gb/en/articles/tags/yes-stories", "/gb/en/articles/tags/zagreb", "/gb/en/articles/tags/zurich", "/gb/en/assistenzhunde", "/gb/en/automatic-check-in", "/gb/en/baggage", "/gb/en/baggage-irregularities", "/gb/en/besondere-befoerderungsbedingungen-bus", "/gb/en/bid-upgrade", "/gb/en/boarding", "/gb/en/boeing787", "/gb/en/book-and-manage/additional-services/get-your-guide", "/gb/en/book-and-manage/additional-services/travel-insurances", "/gb/en/book-and-manage/booking-services/manage-my-bookings", "/gb/en/book-and-manage/cancellation-and-refund/refund/refund-form", "/gb/en/book-and-manage/destination", "/gb/en/book-and-manage/digital-self-services/airline-apps", "/gb/en/book-and-manage/flights/air-baltic", "/gb/en/book-and-manage/flights/ana", "/gb/en/book-and-manage/flights/ana/faq", "/gb/en/book-and-manage/flights/giftvoucher", "/gb/en/book-and-manage/flights/helvetic", "/gb/en/book-and-manage/flights/lufthansa-voucher", "/gb/en/book-and-manage/flights/wetlease-hub", "/gb/en/book-and-manage/passenger-receipt-90days/confirmation", "/gb/en/book-and-manage/pax-receipt", "/gb/en/book-and-manage/pax-receipt/invoices-different-countries", "/gb/en/book-and-manage/rebook", "/gb/en/book-and-manage/rebook/involuntary-rebooking", "/gb/en/book-and-manage/rebook/voluntary-rebooking", "/gb/en/book-and-manage/stopover", "/gb/en/book-and-manage/stopover/bayerischer-hof", "/gb/en/book-and-manage/stopover/neuschwanstein", "/gb/en/book-and-manage/stopover/zugspitze", "/gb/en/business-class", "/gb/en/business-class-on-short-and-medium-haul", "/gb/en/business-services", "/gb/en/business-terms-and-conditions", "/gb/en/cancellations-and-refunds", "/gb/en/carry-on-baggage", "/gb/en/cash-and-miles", "/gb/en/check-in-baggage", "/gb/en/check-in-with-the-family", "/gb/en/child-restraint-systems", "/gb/en/children-on-board", "/gb/en/childrens-menus-on-board", "/gb/en/common", "/gb/en/common/accessibility-statement", "/gb/en/common/agb-extra-services-at-online-check-in", "/gb/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation", "/gb/en/common/baggage-conditions", "/gb/en/common/compensation-voucher", "/gb/en/common/imprint/lufthansa-insights-imprint", "/gb/en/common/privacy-statement/privacy-statement-group", "/gb/en/common/seatreservation-condtions/seat-reservations", "/gb/en/cookie-policy", "/gb/en/culinaryjourney", "/gb/en/dangerous-dogs", "/gb/en/data-collection-canada", "/gb/en/data-collection-usa", "/gb/en/data-protection-information", "/gb/en/datenschutz", "/gb/en/digital-baggage-services", "/gb/en/digital-self-services", "/gb/en/digital-travel-companion", "/gb/en/discover-lufthansa/carbon-offsetting/climate-protection-projects", "/gb/en/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge", "/gb/en/discover-lufthansa/carbon-offsetting/faq-saf", "/gb/en/discover-lufthansa/carbon-offsetting/saf", "/gb/en/discover-lufthansa/flightreservation-priceguarantee", "/gb/en/discover-lufthansa/lufthansa-fleet/351", "/gb/en/discover-lufthansa/lufthansa-group-airlines/ita-airways", "/gb/en/discover-lufthansa/miles-and-more-credit-card", "/gb/en/discover-lufthansa/new-onboard-experience", "/gb/en/discover-lufthansa/take-off", "/gb/en/doctor-on-board", "/gb/en/doctor-on-board-news", "/gb/en/during-your-trip/food-and-beverages/onboard-delights/faq", "/gb/en/during-your-trip/internet-overview", "/gb/en/during-your-trip/lhg-wifi", "/gb/en/economy-class", "/gb/en/electronic-bag-tags", "/gb/en/entryprocesses", "/gb/en/europa-tarife-economy-class", "/gb/en/europcar", "/gb/en/exclusive-charter", "/gb/en/faq-data-security", "/gb/en/faq-ejournals", "/gb/en/faq-password-security", "/gb/en/farealert/best-price-alert", "/gb/en/feedback", "/gb/en/feedback-past-flight", "/gb/en/feedback/feedbackai", "/gb/en/fia-valet-service", "/gb/en/first-class", "/gb/en/first-class-comfort", "/gb/en/first-class-lounges", "/gb/en/first-class-personal-assistant", "/gb/en/first-class-terminal", "/gb/en/first-class-valet-parking-service", "/gb/en/fliegen-mit-baby", "/gb/en/flight-disruptions", "/gb/en/flight-search", "/gb/en/flights", "/gb/en/fly-more-sustainabl", "/gb/en/flying-with-small-children", "/gb/en/flynet", "/gb/en/fmg-valet-parking-service", "/gb/en/food-and-beverages", "/gb/en/frankfurt-fair", "/gb/en/free2move", "/gb/en/freigepaeck-regeln", "/gb/en/gefaehrliche-gegenstaende", "/gb/en/general-conditions-currency-conversion", "/gb/en/good-for-train", "/gb/en/green-fare", "/gb/en/group-travel", "/gb/en/group-travel-and-charter", "/gb/en/help-and-contact", "/gb/en/hertz", "/gb/en/homepage", "/gb/en/hotel-offers", "/gb/en/imprint", "/gb/en/lh-rentalcar", "/gb/en/local-page/ski-campaign-2026", "/gb/en/lounge-companions", "/gb/en/lounges", "/gb/en/lufthansa-am-flughafen-frankfurt", "/gb/en/lufthansa-at-berlin-airport", "/gb/en/lufthansa-at-duesseldorf-airport", "/gb/en/lufthansa-at-vienna-airport", "/gb/en/lufthansa-at-zuerich-airport", "/gb/en/lufthansa-aviation-group", "/gb/en/lufthansa-business-class-on-long-haul-routes", "/gb/en/lufthansa-city/culinaryjourney", "/gb/en/lufthansa-city/menu-card", "/gb/en/lufthansa-corporate-customers", "/gb/en/lufthansa-express", "/gb/en/lufthansa-express-bus", "/gb/en/lufthansa-express-rail", "/gb/en/lufthansa-first-class-entertainment", "/gb/en/lufthansa-first-class-fleet", "/gb/en/lufthansa-group-star-alliance-and-partner-airlines", "/gb/en/lufthansa-guide-service", "/gb/en/lufthansa-terminal-muenchen", "/gb/en/lufthansa-travel-classes", "/gb/en/medikamenten-transport", "/gb/en/meetings-and-events", "/gb/en/meetings-and-events-delegates", "/gb/en/meetings-and-events-organisers", "/gb/en/menus-on-long-haul-flights", "/gb/en/menus-travel-classes", "/gb/en/miles-and-more", "/gb/en/mobility-partner-program-healthcare", "/gb/en/most-significant-route", "/gb/en/munich-fair", "/gb/en/my-bookings", "/gb/en/my-logbook", "/gb/en/onboard-delights", "/gb/en/online-check-in", "/gb/en/online-check-in-info", "/gb/en/overview-flights", "/gb/en/overview-manage", "/gb/en/overview-special-request", "/gb/en/overview-travel-information", "/gb/en/partner", "/gb/en/passenger-receipt-90", "/gb/en/passenger-rights", "/gb/en/passengers-using-wheelchairs", "/gb/en/passengers-with-sensory-impairment", "/gb/en/payment-options-at-the-airport", "/gb/en/pre-check-in", "/gb/en/premium-economy-class", "/gb/en/prepare-for-your-trip/baggage/baggage-conditions", "/gb/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg", "/gb/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay", "/gb/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage", "/gb/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage", "/gb/en/prepare-for-your-trip/baggage/electronic-devices-and-batteries", "/gb/en/prepare-for-your-trip/baggage/sport-baggage/register-ammunition", "/gb/en/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation", "/gb/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation", "/gb/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation", "/gb/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation", "/gb/en/prepare-for-your-trip/current-travel-information", "/gb/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system", "/gb/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk", "/gb/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing", "/gb/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing", "/gb/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment", "/gb/en/prepare-for-your-trip/travel-classes/economy-basic", "/gb/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass", "/gb/en/prepare-for-your-trip/travelling-with-children/planning-with-kids", "/gb/en/rail-and-fly", "/gb/en/rail-fly-terms-and-conditions", "/gb/en/rechnungsbeleg", "/gb/en/refund", "/gb/en/register-animal-cabin", "/gb/en/schengen", "/gb/en/seat-maps", "/gb/en/secure-flight", "/gb/en/security-check-time-slot", "/gb/en/security-fast-lanes", "/gb/en/sepa-terms-and-conditions", "/gb/en/sepa-terms-and-conditions-b", "/gb/en/services-at-frankfurt-airport", "/gb/en/services-at-the-airport", "/gb/en/services-munich-airport", "/gb/en/services-on-board", "/gb/en/shopping", "/gb/en/sixt", "/gb/en/special-meals", "/gb/en/special-needs", "/gb/en/sports-baggage", "/gb/en/support/contact/contact-form-confirmation", "/gb/en/support/contact/passenger-duty-united-kingdom", "/gb/en/support/feedback-and-contact-airlines", "/gb/en/support/support", "/gb/en/terms-and-conditions-lh", "/gb/en/terms-of-service-group", "/gb/en/terms-of-use", "/gb/en/tiere-als-handgepaeck", "/gb/en/tiere-als-uebergepaeck", "/gb/en/timetable-and-flight-status", "/gb/en/tips-senior-travellers", "/gb/en/travel-agencies", "/gb/en/travel-briefing", "/gb/en/travel-expense-management", "/gb/en/travel-id-terms-conditions", "/gb/en/travelling-healthy", "/gb/en/travelling-with-animals", "/gb/en/travelling-with-children", "/gb/en/travelling-with-special-requirements", "/gb/en/traveltricks", "/gb/en/uebergepaeck", "/gb/en/unaccompanied-minors", "/gb/en/unterhaltung-an-bord", "/gb/en/upgrade-business-class-long-haul", "/gb/en/upgrade-first-class", "/gb/en/upgrade-info", "/gb/en/upgrade-options", "/gb/en/upgrade-premium-economy-class", "/gb/en/upgrade-to-business-class", "/gb/en/upgrade-to-premium-economy-class", "/gb/en/upgrades-at-online-check-in", "/gb/en/wheelchair-batteries", "/gb/en/with-children-at-the-airport", "/us/en/ccpa", "/us/en/dnsmpi"]);
  var LIVE_ORIGIN = "https://www.lufthansa.com";
  var SOURCE_HOSTS = ["www.lufthansa.com", "lufthansa.com", "localhost", "127.0.0.1"];
  var CHROME_SELECTORS = [
    // global header / navigation (becomes the per-locale nav fragment)
    "header",
    "#header",
    ".header-and-flyout",
    ".sticky-header-placeholder",
    ".commonheader",
    ".dcep-header-flyout",
    ".dcep-header-quick-action-links",
    // global footer (becomes the per-locale footer fragment)
    "footer",
    "#footer",
    ".footer-area",
    ".footer-logos",
    ".commonfooter",
    // the Cognigy chat assistant window, open in some snapshots (body > div > div > .webchat-root
    // #webchatWindow: "Lufthansa Chat Assistant / Hi, I'm Elisa", /de/en/overview-travel-information)
    ".webchat-root",
    // skip links, a11y live regions, AEM placeholders (breadcrumbs: convertBreadcrumbs)
    ".skiplinks",
    ".skip-links",
    "#sr-log",
    "#a11y-status-message",
    "[data-live-announcer]",
    ".cq-placeholder",
    '[class*="cq-placeholder"]',
    // OneTrust cookie consent
    "#onetrust-consent-sdk",
    "#onetrust-banner-sdk",
    "#onetrust-pc-sdk",
    "#onetrust-style",
    "#ot-sdk-btn-floating",
    ".onetrust-pc-dark-filter",
    ".optanon-alert-box-wrapper",
    // Cloudflare Turnstile pre-clearance
    "#turnstile-preclearance-frame",
    // global modals that never hold page content: location/language pickers, login, UI sound
    // effects. Content modals (fare conditions, the fleet seat-map
    // .lightbox-modal) stay until afterTransform because parsers read them.
    "maui-modal.country-language-selector-modal",
    "maui-modal.one-id-login__modal",
    'audio[id^="uifx"]',
    // Tealium / utag, Monetate, Quantum Metric and other trackers
    '[id^="utag_"]',
    '[id^="utag-"]',
    '[id^="monetate"]',
    '[class^="monetate"]',
    '[id^="mt_"]',
    "#QuantumMetricFeedbackLink",
    '[id^="batBeacon"]',
    // non-content tags
    "script",
    "noscript",
    "style",
    "link",
    "template"
  ];
  var TRACKING_URL = /(utag|tealium|tiqcdn|monetate|quantummetric|doubleclick|googletagmanager|google-analytics|googleadservices|facebook\.com\/tr|bat\.bing|demdex|omtrdc|\/b\/ss\/|adsrvr|criteo|cookielaw|onetrust|optanon|challenges\.cloudflare|shop\.lufthansa\.com\/preclearance|hotjar|contentsquare|linkedin\.com\/px|pinterest\.com\/ct|t\.co\/i\/adsct)/i;
  var EMBED_URL = /(youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|brightcove|players\.|maps\.google|google\.com\/maps|lufthansa\.com|lufthansa-inflightentertainment\.com)/i;
  function keepSubpageNavHeader(document, payload) {
    const template = payload && payload.template || {};
    if (!(template.blocks || []).some((b) => b.name === "subpage-nav")) return;
    document.querySelectorAll(".container-subnav nav.subpage > header").forEach((header) => {
      const div = document.createElement("div");
      div.className = "subpage-header";
      div.append(...header.childNodes);
      header.replaceWith(div);
    });
  }
  function removeAll(root, selectors) {
    selectors.forEach((sel) => {
      let nodes = [];
      try {
        nodes = [...root.querySelectorAll(sel)];
      } catch (e) {
        return;
      }
      nodes.forEach((n) => n.remove());
    });
  }
  function isHiddenFrame(el) {
    const w = el.getAttribute("width");
    const h = el.getAttribute("height");
    const style = (el.getAttribute("style") || "").replace(/\s/g, "").toLowerCase();
    return w === "0" || w === "1" || h === "0" || h === "1" || style.includes("visibility:hidden") || style.includes("display:none") || /(^|;)width:[01]px/.test(style) || /(^|;)height:[01]px/.test(style) || style.includes("top:-50000px");
  }
  function removeTracking(document) {
    document.querySelectorAll("iframe").forEach((f) => {
      const src = f.getAttribute("src") || "";
      if (!src || isHiddenFrame(f) || TRACKING_URL.test(src) || !EMBED_URL.test(src)) f.remove();
    });
    document.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (TRACKING_URL.test(src) || isHiddenFrame(img) && !img.closest(".container-content")) img.remove();
      else if (isHiddenFrame(img) && /^(https?:)?\/\//.test(src) && !/\/content\/dam\//.test(src)) img.remove();
    });
  }
  var BREADCRUMB_SOURCES = 'maui-breadcrumb, nav[aria-label*="readcrumb"], .breadcrumbs';
  var BREADCRUMB_ATTR = "data-lh-import-breadcrumb";
  var BREADCRUMB_MAP = { "/at/de/additional-services": [["Home", "/at/de/homepage"], ["Extra Services", "/at/de/additional-services"]], "/at/de/befoerderungsbedingungen-group": [["Home", "/at/de/homepage"], ["Bef\xF6rderungsbedingungen der Lufthansa Group-Airlines", "/at/de/befoerderungsbedingungen-group"]], "/at/de/book-and-manage/flights/ana": [["Home", "/at/de/homepage"], ["Flugsuche", "/at/de/flugsuche"], ["ANA", "/at/de/book-and-manage/flights/ana"]], "/at/de/business-class": [["Home", "/at/de/homepage"], ["Reiseklassen", "/at/de/lufthansa-reiseklassen"], ["Business Class", "/at/de/business-class"]], "/at/de/common/agb-extra-services-at-online-check-in": [["Home", "/at/de/homepage"], ["AGB Lufthansa Services im Online Check-in", "/at/de/common/agb-extra-services-at-online-check-in"]], "/at/de/first-class": [["Home", "/at/de/homepage"], ["Reiseklassen", "/at/de/lufthansa-reiseklassen"], ["First Class", "/at/de/first-class"]], "/at/de/homepage": [["Home", "/at/de/homepage"]], "/at/de/lufthansa-reiseklassen": [["Home", "/at/de/homepage"], ["Reiseklassen", "/at/de/lufthansa-reiseklassen"]], "/at/de/nachhaltiger-fliegen": [["Home", "/at/de/homepage"], ["Nachhaltiger fliegen", "/at/de/nachhaltiger-fliegen"]], "/at/de/support/contact": [["Home", "/at/de/homepage"], ["Kontakt", "/at/de/support/contact"]], "/de/de/additional-services": [["Home", "/de/de/homepage"], ["Extra Services", "/de/de/additional-services"]], "/de/de/befoerderungsbedingungen-group": [["Home", "/de/de/homepage"], ["Bef\xF6rderungsbedingungen der Lufthansa Group-Airlines", "/de/de/befoerderungsbedingungen-group"]], "/de/de/book-and-manage/flights/ana": [["Home", "/de/de/homepage"], ["Flugsuche", "/de/de/flugsuche"], ["ANA", "/de/de/book-and-manage/flights/ana"]], "/de/de/business-class": [["Home", "/de/de/homepage"], ["Reiseklassen", "/de/de/lufthansa-reiseklassen"], ["Business Class", "/de/de/business-class"]], "/de/de/common/agb-extra-services-at-online-check-in": [["Home", "/de/de/homepage"], ["AGB Lufthansa Services im Online Check-in", "/de/de/common/agb-extra-services-at-online-check-in"]], "/de/de/first-class": [["Home", "/de/de/homepage"], ["Reiseklassen", "/de/de/lufthansa-reiseklassen"], ["First Class", "/de/de/first-class"]], "/de/de/homepage": [["Home", "/de/de/homepage"]], "/de/de/lufthansa-reiseklassen": [["Home", "/de/de/homepage"], ["Reiseklassen", "/de/de/lufthansa-reiseklassen"]], "/de/de/nachhaltiger-fliegen": [["Home", "/de/de/homepage"], ["Nachhaltiger fliegen", "/de/de/nachhaltiger-fliegen"]], "/de/de/support/contact": [["Home", "/de/de/homepage"], ["Kontakt", "/de/de/support/contact"]], "/de/en/additional-services": [["Home", "/de/en/homepage"], ["Extra services", "/de/en/additional-services"]], "/de/en/book-and-manage/flights/ana": [["Home", "/de/en/homepage"], ["Flight search", "/de/en/flight-search"], ["ANA", "/de/en/book-and-manage/flights/ana"]], "/de/en/business-class": [["Home", "/de/en/homepage"], ["Travel classes", "/de/en/lufthansa-travel-classes"], ["Business Class", "/de/en/business-class"]], "/de/en/common/agb-extra-services-at-online-check-in": [["Home", "/de/en/homepage"], ["T&Cs of Lufthansa Online Check-in Services", "/de/en/common/agb-extra-services-at-online-check-in"]], "/de/en/discover-lufthansa/campaigns": [["Home", "/de/en/homepage"], ["Campaigns", "/de/en/discover-lufthansa/campaigns"]], "/de/en/first-class": [["Home", "/de/en/homepage"], ["Travel classes", "/de/en/lufthansa-travel-classes"], ["First Class", "/de/en/first-class"]], "/de/en/fly-more-sustainabl": [["Home", "/de/en/homepage"], ["Fly more sustainably", "/de/en/fly-more-sustainabl"]], "/de/en/homepage": [["Home", "/de/en/homepage"]], "/de/en/lufthansa-travel-classes": [["Home", "/de/en/homepage"], ["Travel classes", "/de/en/lufthansa-travel-classes"]], "/de/en/support/contact": [["Home", "/de/en/homepage"], ["Contact", "/de/en/support/contact"]], "/de/en/terms-of-service-group": [["Home", "/de/en/homepage"], ["Conditions of Carriage of Lufthansa Group Airlines", "/de/en/terms-of-service-group"]], "/gb/en/additional-services": [["Home", "/gb/en/homepage"], ["Extra services", "/gb/en/additional-services"]], "/gb/en/book-and-manage/flights/ana": [["Home", "/gb/en/homepage"], ["Flight search", "/gb/en/flight-search"], ["ANA", "/gb/en/book-and-manage/flights/ana"]], "/gb/en/business-class": [["Home", "/gb/en/homepage"], ["Travel classes", "/gb/en/lufthansa-travel-classes"], ["Business Class", "/gb/en/business-class"]], "/gb/en/common/agb-extra-services-at-online-check-in": [["Home", "/gb/en/homepage"], ["T&Cs of Lufthansa Online Check-in Services", "/gb/en/common/agb-extra-services-at-online-check-in"]], "/gb/en/discover-lufthansa/campaigns": [["Home", "/gb/en/homepage"], ["Campaigns", "/gb/en/discover-lufthansa/campaigns"]], "/gb/en/first-class": [["Home", "/gb/en/homepage"], ["Travel classes", "/gb/en/lufthansa-travel-classes"], ["First Class", "/gb/en/first-class"]], "/gb/en/fly-more-sustainabl": [["Home", "/gb/en/homepage"], ["Fly more sustainably", "/gb/en/fly-more-sustainabl"]], "/gb/en/homepage": [["Home", "/gb/en/homepage"]], "/gb/en/lufthansa-travel-classes": [["Home", "/gb/en/homepage"], ["Travel classes", "/gb/en/lufthansa-travel-classes"]], "/gb/en/support/contact": [["Home", "/gb/en/homepage"], ["Contact", "/gb/en/support/contact"]], "/gb/en/terms-of-service-group": [["Home", "/gb/en/homepage"], ["Conditions of Carriage of Lufthansa Group Airlines", "/gb/en/terms-of-service-group"]], "/xx/de/homepage": [["Home", "/xx/de/homepage"]] };
  function convertBreadcrumbs(document, pagePath) {
    let trail = null;
    const sources = [...document.querySelectorAll(BREADCRUMB_SOURCES)].filter((el, i, all) => !all.some((other) => other !== el && other.contains(el)));
    sources.forEach((source) => {
      if (!source.isConnected) return;
      const items = [];
      const mauiItems = [...source.querySelectorAll("maui-breadcrumb-item")];
      if (mauiItems.length) {
        mauiItems.forEach((item) => items.push({ label: cleanText(item) || item.getAttribute("label") || "", href: item.getAttribute("href") }));
      } else {
        source.querySelectorAll("li").forEach((li) => {
          const link = li.querySelector("a[href]");
          items.push({ label: cleanText(link || li), href: link ? link.getAttribute("href") : null });
        });
      }
      const crumbs = items.filter((c) => c.label);
      const wrapper = source.closest(".maui-breadcrumb") || source;
      if (crumbs.length && !trail) trail = crumbs.map((c) => [c.label, c.href || null]);
      wrapper.remove();
    });
    document.querySelectorAll(".breadcrumb").forEach((el) => {
      if (el.isConnected && !el.querySelector("table")) el.remove();
    });
    let hidden = false;
    if (!trail && pagePath && BREADCRUMB_MAP[pagePath]) {
      trail = BREADCRUMB_MAP[pagePath];
      hidden = true;
    }
    if (!trail) return 0;
    const og = document.querySelector('meta[property="og:title"], meta[name="og:title"]');
    const title = document.querySelector("title");
    const defaultLabel = cleanText({ textContent: og && og.getAttribute("content") || title && title.textContent || "" });
    document.documentElement.setAttribute(BREADCRUMB_ATTR, JSON.stringify({ trail, hidden, defaultLabel }));
    return 1;
  }
  function breadcrumbMetadataRows(document, payload, pagePath) {
    const raw = document.documentElement.getAttribute(BREADCRUMB_ATTR);
    if (!raw) return [];
    document.documentElement.removeAttribute(BREADCRUMB_ATTR);
    const { trail, hidden, defaultLabel } = JSON.parse(raw);
    const origins = sourceOrigins(payload);
    const market = (pagePath || "").match(/^\/([a-z]{2})\//);
    const resolve = (href) => {
      if (!href) return null;
      const h = market ? href.replace(/^((?:https?:)?\/\/[^/]+)?\/xx\/([a-z]{2})(?=\/|$)/, (m, host, ll) => `${host || ""}/${market[1]}/${ll}`) : href;
      return rewriteHref(h, origins) || h;
    };
    const crumbs = trail.map(([label, href]) => ({ label, href: resolve(href) }));
    const own = crumbs.pop();
    const parents = crumbs.filter((c) => c.href);
    const rows = [];
    if (parents.length) {
      const chain = [parents.pop()];
      while (!chain[0].href.startsWith("/") && parents.length) chain.unshift(parents.pop());
      const cell = document.createElement("div");
      chain.forEach((c) => {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", c.href);
        a.textContent = c.href;
        p.append(a);
        cell.append(p);
      });
      rows.push(["Parent", cell]);
      const outside = chain.filter((c) => !c.href.startsWith("/"));
      if (outside.length) rows.push(["Parent title", outside.map((c) => c.label).join(" > ")]);
      if (hidden) rows.push(["Breadcrumb", "hidden"]);
    }
    if (own && own.label && own.label !== defaultLabel) rows.push(["Breadcrumb title", own.label]);
    return rows;
  }
  function convertFeedbackQuestionnaires(document) {
    document.querySelectorAll("feedback-questionnaire").forEach((q) => {
      const label = q.querySelector("maui-label, label, legend");
      const question = label ? cleanText(label) : "";
      const answers = [...q.querySelectorAll('maui-segmented-control-item, [role="radio"]')].map(cleanText).filter(Boolean);
      const wrap = q.closest(".wrapper");
      const holder = wrap && wrap.children.length === 1 && cleanText(wrap) === cleanText(q) ? wrap : q;
      if (!question || !answers.length) {
        holder.remove();
        return;
      }
      const ul = document.createElement("ul");
      answers.forEach((t) => {
        const li = document.createElement("li");
        li.textContent = t;
        ul.append(li);
      });
      const p = document.createElement("p");
      p.textContent = question;
      holder.replaceWith(WebImporter.Blocks.createBlock(document, { name: "Feedback", cells: [[p], [ul]] }));
    });
  }
  var SR_ONLY = ".sr-only, .visually-hidden, .ot-sr-only, .screenreader-only, .sr-only-focusable, maui-screen-reader-label";
  function removeScreenReaderOnly(document) {
    document.querySelectorAll("maui-tooltip").forEach((tip) => {
      const trigger = tip.querySelector('[slot="trigger"]');
      if (trigger && (trigger.tagName === "A" || trigger.hasAttribute("href") || trigger.querySelector("[href]"))) {
        tip.querySelectorAll(':scope > [slot="box"]').forEach((box) => box.remove());
      }
    });
    document.querySelectorAll(SR_ONLY).forEach((el) => {
      if (!el.isConnected) return;
      const control = el.closest("a, button, [href]");
      if (control && control !== el) {
        const clone = control.cloneNode(true);
        clone.querySelectorAll(SR_ONLY).forEach((s) => s.remove());
        const hasVisible = clone.textContent.trim() || clone.querySelector("img, svg, picture");
        if (!hasVisible) {
          el.replaceWith(document.createTextNode(el.textContent.trim()));
          return;
        }
      }
      el.remove();
    });
  }
  function unwrapSingleCellTables(document) {
    let unwrapped = 0;
    [...document.querySelectorAll("table")].reverse().forEach((table) => {
      if (!table.isConnected || table.querySelector("table")) return;
      const cells = table.querySelectorAll("td, th");
      if (cells.length !== 1 || table.querySelectorAll("tr").length !== 1) return;
      table.replaceWith(...cells[0].childNodes);
      unwrapped += 1;
    });
    return unwrapped;
  }
  var MEDIA = 'img, picture, video, audio, iframe, svg, object, embed, canvas, input, select, textarea, button, form, hr, maui-icon, [style*="background-image"]';
  var VIDEO_CONFIG = '[data-dcep*="videoSrc"]';
  var WIDGET_CONFIG = ".dcep-poi-mapping[data-dcep], .dcep-meili-car-rental[data-dcep], .dcep-flash-teaser, .messagecenterwrapper, .dcep-blog-overview[data-dcep], .dcep-author-slider, .dcep-blog-cookie[data-dcep], .dcep-sticky-price[data-dcep]";
  function isEmpty(el) {
    if (el.textContent.replace(/\u00A0/g, " ").trim()) return false;
    return !el.matches(`${VIDEO_CONFIG}, ${WIDGET_CONFIG}`) && !el.querySelector(`${MEDIA}, ${VIDEO_CONFIG}, ${WIDGET_CONFIG}`);
  }
  var SEPARATOR_COMMENT = "lh-separator";
  var SEPARATOR_MIN_SPACE = 50;
  function separatorInfo(sep) {
    const hr = sep.querySelector(".hr") || sep;
    const line = hr.classList.contains("hr") && !hr.classList.contains("hr-no-layout");
    const m = (hr.getAttribute("style") || "").match(/margin-bottom:\s*(-?[\d.]+)px\s*(?:;|!|$)/i);
    const space = m ? Math.round(parseFloat(m[1])) : 25;
    const tokens = [`${line ? "divider" : "spacer"}-${Math.max(space, 0)}`];
    if (hr.classList.contains("hidden-sm-down")) tokens.push("from-768");
    return { keep: line || space >= SEPARATOR_MIN_SPACE, marker: tokens.join(" ") };
  }
  var FLOW_COMPONENT = ".text, .headline, .link, .footnote, .image:not(:has(video, .videoViewer)), .onecolumn, .twocolumn, .threecolumn, .fourcolumn";
  var FLOW_COLUMN = ".twocolumn, .threecolumn, .fourcolumn";
  function inFlow(run) {
    const prev = run[0].previousElementSibling;
    const next = run[run.length - 1].nextElementSibling;
    if (run.some((sep) => separatorSpace(sep) < 10)) return false;
    if (!next || !next.matches(FLOW_COMPONENT)) return false;
    if (prev && !prev.matches(FLOW_COMPONENT)) return false;
    return !(prev && prev.matches(FLOW_COLUMN) && next.matches(FLOW_COLUMN));
  }
  var SEPARATOR_AS_IS_TEMPLATES = ["homepage", "flight-status"];
  function separatorInline(sep) {
    const hr = sep.querySelector(".hr") || sep;
    const m = (hr.getAttribute("style") || "").match(/margin-bottom:\s*(-?[\d.]+)px\s*(?:;|!|$)/i);
    return m ? Math.round(parseFloat(m[1])) : null;
  }
  function separatorSpace(sep) {
    const inline = separatorInline(sep);
    return inline === null ? 25 : inline;
  }
  function isUntitledColumnView(el) {
    if (!el || !el.matches(FLOW_COLUMN)) return false;
    const view = el.querySelector(":scope > .column-view");
    if (!view) return false;
    return ![...view.children].some((d) => !d.matches(".row, .carousel") && d.querySelector(HEADING) && cleanText(d));
  }
  function isBlockComponent(el) {
    return !!el && !el.matches(`${FLOW_COMPONENT}, .separator`);
  }
  function missingSeparatorMarkers(run, flow) {
    const first = run[0];
    const last = run[run.length - 1];
    const parent = first.parentElement;
    if (!parent || !parent.matches(".section-content")) return null;
    const infos = run.map(separatorInfo);
    const spaces = run.map(separatorSpace);
    if (spaces.some((n) => n < 10)) return null;
    const prev = first.previousElementSibling;
    const next = last.nextElementSibling;
    if (prev && !next && prev.matches(".inspirationteaser")) {
      return run.map((sep, n) => {
        const inline = separatorInline(sep);
        const space = inline === null ? n === run.length - 1 ? 0 : 25 : inline;
        return infos[n].marker.replace(/^(spacer|divider)-\d+/, `$1-${Math.max(space, 0)}`);
      });
    }
    if (prev && prev.matches(".sidebar")) {
      if (run.length !== 1 || !next || next.matches(".sidebar")) return null;
      const extra = spaces[0] - 25;
      return extra > 0 ? [infos[0].marker.replace(/^spacer-\d+/, `spacer-${extra}`)] : null;
    }
    if (prev && next && isBlockComponent(prev) && (isBlockComponent(next) || isUntitledColumnView(next))) {
      return infos.map((i) => i.marker);
    }
    if (prev && !next && prev.matches(".headline")) {
      const aem = parent.closest(".container-content > .section");
      if (!aem || !aem.querySelector(":scope > .mb-default")) return null;
      let after = aem.nextElementSibling;
      while (after && isEmpty(after)) after = after.nextElementSibling;
      if (!after || !after.matches(".section")) return null;
      if (after.querySelector(":scope > .container-gray, :scope > div > .section-padding-y-regular")) return null;
      const content = after.querySelector(":scope > div > .section-content");
      const start = content && content.firstElementChild;
      if (!isBlockComponent(start) || start.matches(".container-gray") || start.querySelector(".container-gray")) return null;
      const end = flow ? "spacer-24" : "spacer-0";
      return infos.map((i, n) => n === run.length - 1 ? i.marker.replace(/^spacer-\d+/, end) : i.marker);
    }
    return null;
  }
  function markSeparators(document, keepInFlow, payload) {
    const template = (payload && payload.template || {}).name;
    const fillGaps = !SEPARATOR_AS_IS_TEMPLATES.includes(template);
    const runs = [];
    document.querySelectorAll(".separator").forEach((sep) => {
      const last = runs[runs.length - 1];
      if (last && last[last.length - 1].nextElementSibling === sep) last.push(sep);
      else runs.push([sep]);
    });
    const afterGrey = (sep) => {
      const prev = sep.previousElementSibling;
      return !!prev && (prev.matches(".container-gray") || !!prev.querySelector(".container-gray"));
    };
    runs.forEach((run) => {
      const infos = run.map(separatorInfo);
      let markers = null;
      if (infos.some((i) => i.keep) || afterGrey(run[0]) || keepInFlow && inFlow(run)) {
        markers = infos.map((i) => i.marker);
      } else if (fillGaps) {
        markers = missingSeparatorMarkers(run, keepInFlow);
      }
      run.forEach((sep, i) => {
        if (!sep.isConnected) return;
        if (markers && markers[i]) sep.replaceWith(document.createComment(`${SEPARATOR_COMMENT} ${markers[i]}`));
        else sep.remove();
      });
    });
  }
  function convertSeparators(document) {
    const found = [];
    const walker = document.createTreeWalker(document.body, 128);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.nodeValue.startsWith(`${SEPARATOR_COMMENT} `)) found.push(n);
    }
    found.forEach((c) => {
      const parent = c.parentElement;
      if (!parent || parent.closest("table")) {
        c.remove();
        return;
      }
      const p = document.createElement("p");
      p.textContent = `{${c.nodeValue.slice(SEPARATOR_COMMENT.length + 1).trim()}}`;
      const textBlock = parent.closest("p, li, h1, h2, h3, h4, h5, h6");
      if (textBlock) {
        textBlock.after(p);
        c.remove();
      } else {
        c.replaceWith(p);
      }
    });
    return found.length;
  }
  function convertAuthorQuotes(document) {
    let converted = 0;
    document.querySelectorAll(".dcep-author-quote").forEach((quote) => {
      const bq = document.createElement("blockquote");
      bq.className = "authorquote";
      [".quote-text", ".subline-text"].forEach((sel) => {
        const src = quote.querySelector(sel);
        if (!src || !cleanText(src)) return;
        const paras = [...src.querySelectorAll("p")].filter((p2) => cleanText(p2));
        if (paras.length) {
          bq.append(...paras);
          return;
        }
        const p = document.createElement("p");
        p.append(...src.childNodes);
        bq.append(p);
      });
      if (!bq.children.length) return;
      if (!quote.closest(".article-details-page") && quote.closest(".section-narrow")) {
        bq.firstElementChild.append(document.createTextNode(" {narrow}"));
      }
      (quote.closest(".authorquote") || quote).replaceWith(bq);
      converted += 1;
    });
    return converted;
  }
  function restoreMovingImages(document) {
    let restored = 0;
    document.querySelectorAll(".dcep-moving-image[data-dcep]").forEach((comp) => {
      if (comp.querySelector("img, video")) return;
      let cfg;
      try {
        cfg = JSON.parse(comp.getAttribute("data-dcep")) || {};
      } catch (e) {
        return;
      }
      const src = String(cfg.imageUrl || "").trim();
      if (!src || /(^|\/)undefined(\.transform|$|\/)/.test(src)) return;
      const img = document.createElement("img");
      img.setAttribute("src", new URL(src.replace(/lh-dcep-transform-width-\d+/, "lh-dcep-transform-width-2560"), `${LIVE_ORIGIN}/`).href);
      img.setAttribute("alt", String(cfg.alt || "").trim());
      comp.append(img);
      restored += 1;
    });
    return restored;
  }
  function markParallaxImages(document) {
    let marked = 0;
    document.querySelectorAll(".dcep-moving-image[data-dcep]").forEach((comp) => {
      if (!/"isParallaxEnabled"\s*:\s*true/.test(comp.getAttribute("data-dcep") || "")) return;
      if (comp.closest("table, .column-view-item, .sidebar, .carousel, .teaser")) return;
      const img = comp.querySelector("img");
      if (!img) return;
      img.after(document.createTextNode(" {parallax}"));
      marked += 1;
    });
    return marked;
  }
  function removeEmptyComponents(document, keepInFlow, payload) {
    markSeparators(document, keepInFlow, payload);
    document.querySelectorAll('.dcep-react-wrapper, [id="root"], [id$="-root"], ppfi-web-component').forEach((el) => {
      if (el.isConnected && isEmpty(el)) el.remove();
    });
    const scope = document.querySelector(".container-content, .contentpage, main") || document.body;
    [...scope.querySelectorAll('div.section, div[class*="-container"], div[class^="dcep-"]')].reverse().forEach((el) => {
      if (el.isConnected && !el.closest("form.cmp-form") && isEmpty(el)) el.remove();
    });
  }
  var COLUMN_MARK_TEMPLATES = ["info"];
  var COLUMN_ATTR = "data-lh-column";
  var COLUMN_KINDS = ".onecolumn, .twocolumn, .threecolumn, .fourcolumn";
  function columnMarksEnabled(payload) {
    const template = payload && payload.template || {};
    return COLUMN_MARK_TEMPLATES.includes(template.name);
  }
  function isOwnColumnView(el) {
    return !!el && el.matches(`:is(${COLUMN_KINDS}).column`) && el.children.length === 1 && el.firstElementChild.classList.contains("column-view");
  }
  function markColumnViews(document, payload) {
    const template = payload && payload.template || {};
    const instances = (template.blocks || []).flatMap((b) => (b.instances || []).map((sel) => [b.name, sel]));
    const blockOf = (el) => {
      const hit = instances.find(([, sel]) => {
        try {
          return el.matches(sel);
        } catch (e) {
          return false;
        }
      });
      return hit ? hit[0] : null;
    };
    const titled = (view) => [...view.children].some((d) => !d.matches(".row, .carousel") && d.querySelector(HEADING) && cleanText(d));
    let marked = 0;
    const mark = (root, kind, nested) => {
      if (!isOwnColumnView(root) || root.closest(".article-details-page")) return false;
      const view = root.firstElementChild;
      if (view.classList.contains("container-gray")) return false;
      const parent = root.parentElement;
      if (!nested && root.closest(".container-gray") && parent.matches(".section-content") && [...parent.children].filter((c) => !isEmpty(c)).length === 1) return false;
      const block = blockOf(root);
      if (block && block !== "columns-media") return false;
      if (block && kind === "sc" && !nested && !titled(view)) return false;
      root.setAttribute(COLUMN_ATTR, kind);
      marked += 1;
      return !block;
    };
    const aemSections = [...document.querySelectorAll(".container-content > .section")].filter((s) => !isEmpty(s) && !s.querySelector(".container-subnav"));
    const lastAem = aemSections[aemSections.length - 1];
    const endsSpacedPage = (root) => {
      const aem = root.closest(".container-content > .section");
      if (!aem || aem !== lastAem || !aem.querySelector(":scope > .mb-default")) return false;
      let next = root.nextElementSibling;
      while (next && isEmpty(next)) next = next.nextElementSibling;
      return !next;
    };
    document.querySelectorAll(`:is(.section-content, .container-content) > :is(${COLUMN_KINDS})`).forEach((root) => {
      const kind = root.parentElement.matches(".section-content") ? "sc" : "cc";
      const flattened = mark(root, kind, false);
      if (kind === "sc" && root.getAttribute(COLUMN_ATTR) === "sc" && endsSpacedPage(root)) root.setAttribute(COLUMN_ATTR, "sc-spaced");
      if (!flattened) return;
      root.querySelectorAll(`.column-view-item > :is(${COLUMN_KINDS})`).forEach((inner) => {
        if (inner.parentElement.closest(".column-view") === root.firstElementChild) mark(inner, kind, true);
      });
    });
    return marked;
  }
  var COLUMN_LEAF = "p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote, pre, picture, img, video, iframe, form";
  var COLUMN_INLINE = "p, h1, h2, h3, h4, h5, h6, ul, ol";
  var TRAILING_MARKER = /\{([a-z0-9 -]+)\}\s*$/;
  function addMarkerToken(el, token) {
    const target = el.matches("ul, ol") ? [...el.children].filter((li) => li.tagName === "LI").pop() : el;
    if (!target) return false;
    const walker = el.ownerDocument.createTreeWalker(target, 4);
    let last = null;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.nodeValue.trim()) last = n;
    const m = last && last.nodeValue.match(TRAILING_MARKER);
    if (m) {
      const tokens = m[1].trim().split(/\s+/);
      if (tokens.includes(token)) return false;
      last.nodeValue = `${last.nodeValue.slice(0, m.index)}{${[...tokens, token].join(" ")}}`;
      return true;
    }
    target.append(el.ownerDocument.createTextNode(` {${token}}`));
    return true;
  }
  function placeColumnMarks(document) {
    const roots = [...document.querySelectorAll(`[${COLUMN_ATTR}]`)];
    let placed = 0;
    roots.forEach((root) => {
      const suffix = root.getAttribute(COLUMN_ATTR) === "cc" ? "-outer" : "";
      const spaced = root.getAttribute(COLUMN_ATTR) === "sc-spaced";
      const leaves = [...root.querySelectorAll(COLUMN_LEAF)].filter((el) => {
        const up = el.parentElement && el.parentElement.closest(COLUMN_LEAF);
        if (up && root.contains(up)) return false;
        return el.matches("table, picture, img, video, iframe, form") || !!cleanText(el) || !!el.querySelector(MEDIA);
      });
      if (!leaves.length) return;
      const inline = (el) => el.matches(COLUMN_INLINE) && !/^\{(spacer|divider|column)-/.test(cleanText(el));
      const own = (token) => {
        const p = document.createElement("p");
        p.textContent = `{${token}}`;
        return p;
      };
      const first = leaves[0];
      const last = leaves[leaves.length - 1];
      if (!(inline(first) && addMarkerToken(first, `column-start${suffix}`))) root.prepend(own(`column-start${suffix}`));
      if (inline(last) && addMarkerToken(last, `column-end${suffix}`)) {
        if (spaced) addMarkerToken(last, "column-spaced");
      } else {
        root.append(own(`column-end${suffix}${spaced ? " column-spaced" : ""}`));
      }
      placed += 1;
    });
    roots.forEach((root) => root.removeAttribute(COLUMN_ATTR));
    return placed;
  }
  var MOBILE_COPY = ".hidden-lg-up, .hidden-md-up, .d-md-none, .d-lg-none, .visible-xs";
  var DESKTOP_COPY = ".hidden-md-down, .hidden-sm-down, .d-none.d-md-block, .d-none.d-lg-block, .d-none.d-md-flex, .d-none.d-lg-flex";
  function assetKey(url) {
    return (url || "").trim().split(/\s/)[0].replace(/\.transform\/.*$/, "").replace(/[?#].*$/, "");
  }
  function copySignature(el) {
    const text = el.textContent.replace(/[\u200B\uFEFF]/g, "").replace(/\s+/g, " ").trim();
    const imgs = [...el.querySelectorAll("img")].map((i) => assetKey(i.getAttribute("src") || i.getAttribute("data-src") || i.getAttribute("srcset"))).filter(Boolean).sort();
    const hrefs = [...el.querySelectorAll("[href]")].map((a) => a.getAttribute("href")).sort();
    if (!text && !imgs.length && !hrefs.length) return "";
    return `${text}|${imgs.join(",")}|${hrefs.join(",")}`;
  }
  function removeMobileDuplicates(document) {
    let removed = 0;
    [...document.querySelectorAll(MOBILE_COPY)].forEach((mobile) => {
      if (!mobile.isConnected) return;
      const sig = copySignature(mobile);
      if (!sig) return;
      let scope = mobile.parentElement;
      for (let level = 0; scope && level < 3; level += 1, scope = scope.parentElement) {
        const twin = [...scope.querySelectorAll(DESKTOP_COPY)].find((d) => d !== mobile && !d.contains(mobile) && !mobile.contains(d) && copySignature(d) === sig);
        if (twin) {
          mobile.remove();
          removed += 1;
          return;
        }
      }
    });
    return removed;
  }
  function headingId(text) {
    return (text || "").trim().toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, "").replace(/ /g, "-");
  }
  var HEADING = "h1, h2, h3, h4, h5, h6";
  function cleanText(el) {
    return el.textContent.replace(/[\u200B\uFEFF]/g, "").replace(/\s+/g, " ").trim();
  }
  function headingForTarget(target) {
    if (target.matches(HEADING)) return target;
    const inner = target.querySelector(HEADING);
    if (inner && cleanText(inner) && cleanText(target).startsWith(cleanText(inner))) return inner;
    if (!cleanText(target)) {
      const next = target.nextElementSibling;
      if (next && next.matches(HEADING)) return next;
      const nextInner = next && next.querySelector(HEADING);
      if (nextInner && cleanText(next).startsWith(cleanText(nextInner))) return nextInner;
    }
    return null;
  }
  function currentPagePath(document, payload) {
    const params = payload && payload.params || {};
    const candidates = [params.originalURL, payload && payload.url];
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) candidates.push(canonical.getAttribute("href"));
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) candidates.push(ogUrl.getAttribute("content"));
    for (const c of candidates) {
      try {
        if (c) return normalizePath(new URL(c, `${LIVE_ORIGIN}/`).pathname);
      } catch (e) {
      }
    }
    return null;
  }
  function rewriteAnchors(document, pagePath) {
    const ids = /* @__PURE__ */ new Map();
    const used = /* @__PURE__ */ new Map();
    document.querySelectorAll(HEADING).forEach((h) => {
      const base = headingId(cleanText(h));
      if (!base) return;
      const n = used.get(base) || 0;
      used.set(base, n + 1);
      ids.set(h, n ? `${base}-${n}` : base);
    });
    let rewritten = 0;
    document.querySelectorAll('[href*="#"]').forEach((link) => {
      const href = (link.getAttribute("href") || "").trim();
      const hashAt = href.indexOf("#");
      const fragment = href.slice(hashAt + 1);
      if (!fragment || fragment.startsWith("/") || fragment.startsWith("!")) return;
      if (hashAt > 0) {
        let u;
        try {
          u = new URL(href, `${LIVE_ORIGIN}/`);
        } catch (e) {
          return;
        }
        if (!SOURCE_HOSTS.includes(u.hostname) || !pagePath || u.search) return;
        if (normalizePath(u.pathname).replace(/^\/content\/lh(?=\/)/, "") !== pagePath) return;
      }
      let target = null;
      try {
        target = document.getElementById(decodeURIComponent(fragment));
      } catch (e) {
        return;
      }
      if (!target) return;
      const heading = headingForTarget(target);
      const id = heading && ids.get(heading);
      if (!id) return;
      link.setAttribute("href", `#${id}`);
      rewritten += 1;
    });
    return rewritten;
  }
  var JUMP_LINK = '[variant="anchor-down"][href]';
  function onlyJumpLinks(el) {
    const links = [...el.querySelectorAll("[href]")];
    if (!links.length || !links.every((l) => l.matches(JUMP_LINK))) return null;
    const rest = el.cloneNode(true);
    rest.querySelectorAll("[href]").forEach((l) => l.remove());
    if (cleanText(rest) || rest.querySelector("img, picture, video, iframe, input, select, button")) return null;
    return links;
  }
  function jumpLinksBlock(document, links, variants) {
    const cells = links.map((l) => {
      const a = document.createElement("a");
      a.setAttribute("href", l.getAttribute("href"));
      a.textContent = cleanText(l) || l.getAttribute("label") || l.getAttribute("aria-label") || "";
      return [a];
    }).filter(([a]) => a.textContent);
    return WebImporter.Blocks.createBlock(document, { name: "Jump Links", variants, cells });
  }
  function convertJumpLinks(document) {
    let converted = 0;
    document.querySelectorAll(".imagelinklist").forEach((list) => {
      const links = list.isConnected && onlyJumpLinks(list);
      if (!links) return;
      list.replaceChildren(jumpLinksBlock(document, links, []));
      converted += 1;
    });
    document.querySelectorAll(".twocolumn, .threecolumn, .fourcolumn").forEach((col) => {
      const view = col.isConnected && col.querySelector(":scope > .column-view");
      const links = view && onlyJumpLinks(view);
      if (!links || links.length < 2) return;
      col.replaceWith(jumpLinksBlock(document, links, ["columns"]));
      converted += 1;
    });
    return converted;
  }
  var MAUI_LINK = "maui-button-link[href], maui-navigation-link[href], maui-link[href]";
  function convertMauiLinks(document) {
    const links = [...document.querySelectorAll(MAUI_LINK)].reverse();
    links.forEach((el) => {
      const a = document.createElement("a");
      a.setAttribute("href", el.getAttribute("href"));
      const title = el.getAttribute("title");
      if (title) a.setAttribute("title", title);
      if (el.querySelector("img, picture, svg")) {
        while (el.firstChild) a.append(el.firstChild);
      } else {
        a.textContent = cleanText(el) || el.getAttribute("label") || el.getAttribute("aria-label") || "";
      }
      let replacement = a;
      const type = el.tagName === "MAUI-BUTTON-LINK" ? el.getAttribute("type") : null;
      if ((type === "primary" || type === "secondary") && !el.closest("strong, em")) {
        replacement = document.createElement(type === "primary" ? "strong" : "em");
        replacement.append(a);
      }
      el.replaceWith(replacement);
    });
    return links.length;
  }
  function unwrapLinksWithoutHref(document) {
    document.querySelectorAll("a:not([href])").forEach((a) => {
      if (a.closest("table") && !a.querySelector("img, picture")) return;
      if (!a.childNodes.length) return;
      a.replaceWith(...a.childNodes);
    });
  }
  function removeIconsAndZeroWidth(document) {
    let icons = 0;
    document.querySelectorAll('em.lh, i.lh, span.lh, em[class*="lh-"], i[class*="lh-"], span[class*="lh-arrow"]').forEach((el) => {
      if (!el.isConnected || ![...el.classList].some((c) => /^lh-/.test(c))) return;
      if (cleanText(el) || el.querySelector("img, svg, picture, input")) return;
      el.remove();
      icons += 1;
    });
    let zw = 0;
    const walker = document.createTreeWalker(
      document.body,
      4
      /* NodeFilter.SHOW_TEXT */
    );
    const empty = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (/[\u200B\uFEFF]/.test(node.nodeValue)) {
        node.nodeValue = node.nodeValue.replace(/[\u200B\uFEFF]/g, "");
        zw += 1;
        if (!node.nodeValue) empty.push(node);
      }
    }
    empty.forEach((n) => n.remove());
    return { icons, zw };
  }
  function isBr(node) {
    return node && node.nodeType === 1 && node.tagName === "BR";
  }
  function isBlankText(node) {
    return node && node.nodeType === 3 && !node.nodeValue.replace(/\u00A0/g, " ").trim();
  }
  function splitBrParagraphs(document) {
    let added = 0;
    [...document.querySelectorAll("p")].forEach((p) => {
      if (p.closest("table") || !p.querySelector("br")) return;
      const groups = [[]];
      const nodes = [...p.childNodes];
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (isBr(node)) {
          let j = i + 1;
          while (j < nodes.length && isBlankText(nodes[j])) j += 1;
          if (isBr(nodes[j])) {
            while (j < nodes.length && (isBr(nodes[j]) || isBlankText(nodes[j]))) j += 1;
            groups.push([]);
            i = j - 1;
            continue;
          }
        }
        groups[groups.length - 1].push(node);
      }
      if (groups.length < 2) return;
      const parts = groups.map((group) => {
        while (group.length && (isBr(group[0]) || isBlankText(group[0]))) group.shift();
        while (group.length && (isBr(group[group.length - 1]) || isBlankText(group[group.length - 1]))) group.pop();
        return group;
      }).filter((group) => group.length);
      if (parts.length < 2) {
        nodes.forEach((n) => {
          if (!parts.length || !parts[0].includes(n)) n.remove();
        });
        return;
      }
      const paras = parts.map((group) => {
        const np = document.createElement("p");
        if (p.className) np.className = p.className;
        group.forEach((n) => np.append(n));
        return np;
      });
      p.replaceWith(...paras);
      added += paras.length - 1;
    });
    return added;
  }
  function parseSrcset(srcset) {
    if (!srcset) return [];
    return srcset.split(/,(?=\s*(?:\/|https?:|\.\.?\/|[a-z0-9_-]+\.transform))/i).map((part) => {
      const m = part.trim().match(/^(.*?)(?:\s+(\d+(?:\.\d+)?)([wx]))?$/);
      if (!m || !m[1]) return null;
      return { url: m[1].trim(), w: m[2] ? parseFloat(m[2]) * (m[3] === "x" ? 1e3 : 1) : 0 };
    }).filter(Boolean);
  }
  function transformWidth(url) {
    const m = url.match(/lh-dcep-transform-width-(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }
  function isBroken2(url) {
    return !url || /(^|\/)undefined(\.transform|$|\/)/.test(url) || url === "about:blank";
  }
  function absoluteImageUrl(url) {
    if (!url || url.startsWith("data:") || url.startsWith("blob:")) return url;
    let u;
    try {
      u = new URL(url, `${LIVE_ORIGIN}/`);
    } catch (e) {
      return url;
    }
    if (url.startsWith("./") || url.startsWith("../")) return url;
    if (SOURCE_HOSTS.includes(u.hostname)) {
      const pathname = encodeURI(safeDecode(u.pathname));
      return `${LIVE_ORIGIN}${pathname}${u.search}`;
    }
    return u.href;
  }
  function safeDecode(s) {
    try {
      return decodeURI(s);
    } catch (e) {
      return s;
    }
  }
  function bestImageSource(img, keepInline) {
    const candidates = [];
    const add = (url, w) => {
      if (url && !isBroken2(url)) candidates.push({ url, w: w || transformWidth(url) });
    };
    const picture = img.closest("picture");
    if (picture) {
      picture.querySelectorAll("source").forEach((s) => {
        const media = (s.getAttribute("media") || "").match(/min-width:\s*(\d+)/);
        const mediaW = media ? parseInt(media[1], 10) : 0;
        parseSrcset(s.getAttribute("srcset") || s.getAttribute("data-srcset")).forEach((c) => add(c.url, c.w || mediaW));
      });
    }
    parseSrcset(img.getAttribute("srcset")).forEach((c) => add(c.url, c.w));
    parseSrcset(img.getAttribute("data-srcset")).forEach((c) => add(c.url, c.w));
    const src = img.getAttribute("src");
    const dataSrc = img.getAttribute("data-src") || img.getAttribute("data-lazy-src");
    add(dataSrc, 0);
    const inline = src && /^(data|blob):/i.test(src);
    if (src && !inline) add(src, 0);
    if (!candidates.length) return inline && keepInline ? src : null;
    candidates.sort((a, b) => b.w - a.w);
    return candidates[0].url;
  }
  function normalizeImages(document, keepInline) {
    document.querySelectorAll("img").forEach((img) => {
      const best = bestImageSource(img, keepInline);
      if (!best) {
        const pic = img.closest("picture");
        img.remove();
        if (pic && !pic.querySelector("img")) pic.remove();
        return;
      }
      img.setAttribute("src", absoluteImageUrl(best));
      ["srcset", "data-srcset", "data-src", "data-lazy-src", "sizes", "loading"].forEach((a) => img.removeAttribute(a));
      const picture = img.closest("picture");
      if (picture) picture.querySelectorAll("source").forEach((s) => s.remove());
    });
  }
  function normalizePath(p) {
    let out = safeDecode(p || "/");
    out = out.replace(/\.html$/, "").replace(/\/+$/, "");
    return out.startsWith("/") ? out : `/${out}`;
  }
  function sourceOrigins(payload) {
    const origins = /* @__PURE__ */ new Set();
    const params = payload && payload.params || {};
    [payload && payload.url, params.originalURL].forEach((u) => {
      try {
        if (u) origins.add(new URL(u).host);
      } catch (e) {
      }
    });
    return origins;
  }
  var PAGE_PATH = /^\/[a-z]{2}\/[a-z]{2}(?:\/|$)/;
  var MARKET_PATH = /^\/content\/lh\/markets\/[a-z]{2}\/[a-z]{2}(?:\/|$)/;
  var LOCALE_ROOT = /^\/[a-z]{2}\/[a-z]{2}$/;
  function rewriteHref(href, origins) {
    const raw = (href || "").trim();
    if (!raw || raw.startsWith("#") || /^(mailto|tel|javascript|data|sms):/i.test(raw)) return null;
    const isProtocolRelative = raw.startsWith("//");
    const isAbsolute = /^[a-z][a-z0-9+.-]*:/i.test(raw) || isProtocolRelative;
    let u;
    try {
      u = new URL(raw, `${LIVE_ORIGIN}/`);
    } catch (e) {
      return null;
    }
    if (isAbsolute && !SOURCE_HOSTS.includes(u.hostname) && !origins.has(u.host)) return null;
    if (!/^https?:$/.test(u.protocol)) return null;
    const pathname = normalizePath(u.pathname);
    if (MARKET_PATH.test(pathname) && SCOPE_PATHS.has(pathname)) {
      return `${pathname}${u.search}${u.hash}`;
    }
    const pagePath = pathname.replace(/^\/content\/lh(?:\/markets)?(?=\/[a-z]{2}\/[a-z]{2}(?:\/|$))/, "").replace(/^\/content\/lh(?=\/)/, "");
    if (LOCALE_ROOT.test(pagePath) && SCOPE_PATHS.has(`${pagePath}/homepage`)) {
      return `${pagePath}/homepage${u.search}${u.hash}`;
    }
    if (PAGE_PATH.test(pagePath) && SCOPE_PATHS.has(pagePath)) {
      return `${pagePath}${u.search}${u.hash}`;
    }
    return `${LIVE_ORIGIN}${u.pathname}${u.search}${u.hash}`;
  }
  var TAG_DOT = /^(?:https?:\/\/[^/]+)?(?:\/content\/lh\/markets)?(\/[a-z]{2}\/[a-z]{2}\/articles\/tags\/[^/?#.]+)\.(?:html)?$/;
  function rewriteLinks(document, payload) {
    const origins = sourceOrigins(payload);
    document.querySelectorAll("[href]").forEach((el) => {
      if (el.hasAttribute("data-live-link")) {
        el.removeAttribute("data-live-link");
        return;
      }
      const dot = (el.getAttribute("href") || "").trim().match(TAG_DOT);
      if (dot && el.tagName === "A") {
        if (SCOPE_PATHS.has(dot[1])) el.setAttribute("href", dot[1]);
        else el.replaceWith(...el.childNodes);
        return;
      }
      const next = rewriteHref(el.getAttribute("href"), origins);
      if (next !== null && next !== el.getAttribute("href")) el.setAttribute("href", next);
    });
  }
  var TRACKING_ATTR = /^(on[a-z]+|data-(identifier-track|track[a-z-]*|tracking[a-z-]*|analytics[a-z-]*|qm-[a-z-]*|gtm[a-z-]*|utag[a-z-]*|monetate[a-z-]*|optanon[a-z-]*|testid))$/i;
  function stripTrackingAttributes(document) {
    document.querySelectorAll("*").forEach((el) => {
      [...el.attributes].forEach((a) => {
        if (TRACKING_ATTR.test(a.name)) el.removeAttribute(a.name);
      });
    });
  }
  var HEADING_STYLES = ["heading-large", "heading-medium", "heading-small", "heading-copytext-large", "heading-copytext-medium", "copytext-large"];
  var HEADING_DEFAULTS = {
    H1: "heading-large",
    H2: "heading-medium",
    H3: "heading-copytext-large",
    H4: "heading-copytext-large",
    H5: "heading-copytext-medium",
    H6: "heading-copytext-medium"
  };
  var HEADING_NOT_DEFAULT = ".twocolumn, .threecolumn, .fourcolumn, .accordion, .teaser, .sidebar, .article-details-page, form, fieldset, table";
  function markHeadingStyles(document) {
    let marked = 0;
    document.querySelectorAll(HEADING).forEach((h) => {
      if (!cleanText(h)) return;
      const style = HEADING_STYLES.find((c) => h.classList.contains(c));
      if (style && style !== HEADING_DEFAULTS[h.tagName] && !/\{[a-z-]+\}\s*$/.test(h.textContent)) {
        h.append(document.createTextNode(` {${style}}`));
        marked += 1;
      }
      if (h.classList.contains("limited-width") && !h.closest(HEADING_NOT_DEFAULT) && addMarkerToken(h, "limited-width")) marked += 1;
    });
    return marked;
  }
  function markParagraphStyles(document) {
    let marked = 0;
    document.querySelectorAll("div.disclaimer > p").forEach((p) => p.classList.add("copytext-small"));
    document.querySelectorAll('p > span[style*="font-size"]').forEach((span) => {
      const p = span.parentElement;
      const m = (span.getAttribute("style") || "").match(/font-size:\s*([\d.]+)(pt|px)/i);
      if (!m || cleanText(span) !== cleanText(p)) return;
      const px = parseFloat(m[1]) * (m[2].toLowerCase() === "pt" ? 4 / 3 : 1);
      if (px < 15) p.classList.add("copytext-small");
    });
    const FULL_SCOPE = ".richtext:not(.limited-width)";
    const NOT_DEFAULT = ".twocolumn, .threecolumn, .fourcolumn, .accordion, .teaser, .sidebar, .article-details-page, form, fieldset, table, .disclaimer";
    const isFull = (el) => {
      const rt = el.closest(FULL_SCOPE);
      return !!rt && el.parentElement === rt && !rt.closest(NOT_DEFAULT);
    };
    const marker = (el) => /\{[a-z -]+\}\s*$/.test(el.textContent);
    document.querySelectorAll("p").forEach((p) => {
      if (!cleanText(p) || marker(p)) return;
      let style = p.classList.contains("footnote") ? "copytext-small" : ["copytext-small", "copytext-medium", "copytext-large"].find((c) => p.classList.contains(c));
      if (style === "copytext-large" && !p.querySelector("a[href]")) style = null;
      const width = isFull(p) && "full-width" || p.classList.contains("limited-width") && "limited-width" || null;
      const m = !p.closest("table") && p.closest(".richtext") && (p.getAttribute("style") || "").match(/margin-left:\s*(\d{1,3})(?:\.\d+)?px/i);
      const indent = m && +m[1] > 0 ? `indent-${m[1]}` : null;
      const tokens = [style, width, indent].filter(Boolean);
      if (!tokens.length) return;
      p.append(document.createTextNode(` {${tokens.join(" ")}}`));
      marked += 1;
    });
    document.querySelectorAll("ul, ol").forEach((list) => {
      const width = isFull(list) && "full-width" || list.classList.contains("limited-width") && "limited-width";
      if (!width) return;
      const items = [...list.children].filter((li) => li.tagName === "LI");
      const last = items[items.length - 1];
      if (!last || marker(last)) return;
      last.append(document.createTextNode(` {${width}}`));
      marked += 1;
    });
    return marked;
  }
  function convertCaptions(document) {
    let converted = 0;
    document.querySelectorAll("figcaption").forEach((fc) => {
      if (fc.closest("table")) return;
      if (!cleanText(fc)) {
        fc.remove();
        return;
      }
      const inner = fc.querySelector("maui-caption") || fc;
      const p = document.createElement("p");
      p.append(...inner.childNodes);
      p.append(document.createTextNode(" {caption}"));
      const figure = fc.closest("figure");
      if (figure) {
        fc.remove();
        figure.after(p);
      } else {
        fc.replaceWith(p);
      }
      converted += 1;
    });
    return converted;
  }
  var THEME_ATTR = "data-lh-import-theme";
  function addTheme(document, theme) {
    const root = document.documentElement;
    const themes = (root.getAttribute(THEME_ATTR) || "").split(",").map((t) => t.trim()).filter(Boolean);
    if (!themes.includes(theme)) themes.push(theme);
    root.setAttribute(THEME_ATTR, themes.join(", "));
  }
  function detectTheme(document) {
    if (document.querySelector('link[href*="/digitalassistant/"][href$=".css"]')) {
      addTheme(document, "digital-assistant");
    }
  }
  function markFlowSpacing(document) {
    addTheme(document, "flow-spacing");
  }
  function addPageMetadata(document, payload) {
    const rows = [];
    const theme = document.documentElement.getAttribute(THEME_ATTR);
    if (theme) {
      document.documentElement.removeAttribute(THEME_ATTR);
      rows.push(["Theme", theme]);
    }
    rows.push(...breadcrumbMetadataRows(document, payload, currentPagePath(document, payload)));
    if (!rows.length) return;
    const existing = [...document.querySelectorAll("table")].find((t) => {
      const first = t.querySelector("tr");
      return first && cleanText(first) === "Metadata";
    });
    if (existing) {
      rows.forEach(([name, value]) => {
        const tr = document.createElement("tr");
        [name, value].forEach((v) => {
          const td = document.createElement("td");
          if (typeof v === "string") td.textContent = v;
          else td.append(...v.childNodes);
          tr.append(td);
        });
        (existing.querySelector("tbody") || existing).append(tr);
      });
      return;
    }
    const meta = WebImporter.Blocks.getMetadata(document);
    rows.forEach(([name, value]) => {
      meta[name] = value;
    });
    const head = document.head;
    if (head) {
      [
        "description",
        "og:image",
        "og:image:alt",
        "og:title",
        "og:description",
        "twitter:title",
        "twitter:description",
        "twitter:image",
        "twitter:image:alt"
      ].forEach((n) => {
        head.querySelectorAll(`meta[name="${n}"], meta[property="${n}"]`).forEach((m) => m.remove());
      });
      head.querySelectorAll("title").forEach((t) => t.remove());
    }
    document.body.append(WebImporter.Blocks.getMetadataBlock(document, meta));
  }
  function removeOverlays(document) {
    document.querySelectorAll('maui-modal, .react-modal, .modal, .lightbox-modal, [role="dialog"]').forEach((m) => {
      if (m.isConnected && !m.closest(".container-content")) m.remove();
    });
    const content = document.querySelector(".contentpage-wrapper, .contentpage, main");
    if (content) {
      [...document.body.children].forEach((child) => {
        if (child === content || child.contains(content) || child.tagName === "HR") return;
        if (child.tagName === "TABLE") return;
        if (isEmpty(child)) child.remove();
      });
    }
  }
  function transform(hookName, element, payload) {
    const document = payload && payload.document || element.ownerDocument || element;
    if (hookName === "beforeTransform") {
      const titleEl = document.querySelector("title");
      if (titleEl) titleEl.textContent = titleEl.textContent.replace(/(\s*\|\s*Lufthansa)+\s*$/, " | Lufthansa");
      const pagePath = currentPagePath(document, payload);
      detectTheme(document);
      convertBreadcrumbs(document, pagePath);
      convertFeedbackQuestionnaires(document);
      keepSubpageNavHeader(document, payload);
      removeAll(document, CHROME_SELECTORS);
      removeTracking(document);
      removeScreenReaderOnly(document);
      unwrapSingleCellTables(document);
      removeMobileDuplicates(document);
      rewriteAnchors(document, pagePath);
      convertJumpLinks(document);
      convertAuthorQuotes(document);
      restoreMovingImages(document);
      markParallaxImages(document);
      const flow = columnMarksEnabled(payload);
      if (flow) {
        markColumnViews(document, payload);
        markFlowSpacing(document);
      }
      removeEmptyComponents(document, flow, payload);
      normalizeImages(document, true);
    }
    if (hookName === "afterTransform") {
      removeOverlays(document);
      removeAll(document, ["script", "noscript", "style", "link", 'iframe[src*="cookielaw"]', ".dcep-blog-cookie"]);
      convertMauiLinks(document);
      unwrapLinksWithoutHref(document);
      removeIconsAndZeroWidth(document);
      splitBrParagraphs(document);
      convertSeparators(document);
      normalizeImages(document, false);
      rewriteLinks(document, payload);
      stripTrackingAttributes(document);
      markHeadingStyles(document);
      convertCaptions(document);
      markParagraphStyles(document);
      placeColumnMarks(document);
      addPageMetadata(document, payload);
    }
  }

  // tools/importer/transformers/lufthansa-sections.js
  var MARKER = "data-excat-section-id";
  var BREAK = "data-excat-section-break";
  var FIRST = "data-excat-section-first";
  var SOURCE_STYLE = "data-excat-section-source-style";
  var FOLLOWING = 4;
  var SOURCE_STYLES = [[".container-gray", "grey"], [".image-wrapper.full-width-bg", "full-bleed"]];
  var STYLE_SKIP = ".sticky-price-wrapper, .dcep-sticky-price";
  var REGION_STOP = '.section-content, .container-content, .author-details-page, .column-view-item, [class*="col-"], .contentpage, main, body';
  var MEDIA2 = "img, picture, video, iframe, svg, table, input, select, textarea, button";
  function nextBreak(document, marker) {
    const after = (list) => [...list].find((hr) => hr !== marker && marker.compareDocumentPosition(hr) & FOLLOWING && !hr.closest("table"));
    return after(document.querySelectorAll(`hr[${BREAK}]`)) || after(document.querySelectorAll("hr"));
  }
  function findSectionElement(document, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = document.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function hasStyle(section) {
    const { style } = section;
    if (Array.isArray(style)) return style.filter(Boolean).length > 0;
    return typeof style === "string" && style.trim() !== "";
  }
  function styleValue(section) {
    return Array.isArray(section.style) ? section.style.filter(Boolean).join(", ") : section.style.trim();
  }
  function createBreak(document) {
    const hr = document.createElement("hr");
    hr.setAttribute(BREAK, "");
    return hr;
  }
  function styledRegions(document, template, source) {
    const blockSelectors = (template.blocks || []).flatMap((b) => b.instances || []);
    const insideBlock = (el) => blockSelectors.some((sel) => {
      try {
        return !!(el.parentElement && el.parentElement.closest(sel));
      } catch (e) {
        return false;
      }
    });
    const regions = [];
    document.querySelectorAll(source).forEach((match) => {
      if (match.closest(STYLE_SKIP) || match.parentElement && match.parentElement.closest(source)) return;
      let region = match;
      while (region.parentElement && !region.parentElement.matches(REGION_STOP)) region = region.parentElement;
      if (!region.parentElement || region.matches("main, body") || insideBlock(region)) return;
      if (regions.some((r) => r.contains(region) || region.contains(r))) return;
      regions.push(region);
    });
    return regions;
  }
  function ownColumnView(el) {
    return !!el && el.classList.contains("column") && el.children.length === 1 && el.firstElementChild.classList.contains("column-view");
  }
  function meaningful(el) {
    return !!((el.textContent || "").replace(/[\s\u00a0\u200b]/g, "") || el.querySelector(MEDIA2));
  }
  function titledColumnView(el) {
    if (!ownColumnView(el) || el.firstElementChild.classList.contains("container-gray")) return false;
    return [...el.firstElementChild.children].some((d) => !d.matches(".row, .carousel") && d.querySelector("h1, h2, h3, h4, h5, h6") && meaningful(d));
  }
  var SEPARATOR_NODE = (n) => n.nodeType === 8 && /^lh-separator /.test(n.nodeValue || "");
  function firstComponent(node) {
    for (let n = node; n; n = n.nextSibling) {
      if (SEPARATOR_NODE(n) || n.nodeType === 1 && (meaningful(n) || n.matches(".separator"))) return n;
    }
    return null;
  }
  function greyStyles(region, template) {
    const grey = region.matches(".container-gray") ? region : region.querySelector(".container-gray");
    const styles = [];
    if (!grey) return styles;
    if (grey.classList.contains("column-view")) {
      const column = grey.parentElement;
      if (ownColumnView(column) && column.parentElement && column.parentElement.classList.contains("section-content")) styles.push("column-band");
    } else {
      const content = grey.querySelector(".section-content");
      const parts = content ? [...content.children].filter(meaningful) : [];
      if (parts.length && parts.every(ownColumnView)) {
        styles.push(content.classList.contains("section-padding-y-regular") ? "column-view" : "column-band");
      }
    }
    const aem = region.closest(".container-content > .section");
    if (aem && !aem.querySelector(":scope > .mb-default")) styles.push("flush");
    const whole = !!aem && (region === aem || grey.parentElement === aem);
    if (whole && aem.querySelector(":scope > .mb-default")) {
      let next = aem.nextElementSibling;
      while (next && !meaningful(next)) next = next.nextElementSibling;
      const inner = next && next.matches(".section") ? next.firstElementChild : null;
      const content = inner && inner.querySelector(":scope > .section-content");
      const first = content && firstComponent(content.firstChild);
      if (first && first.nodeType === 1 && !inner.matches(".container-gray") && !content.classList.contains("section-padding-y-regular") && first.matches(".headline, .text") && !first.querySelector(".container-gray")) styles.push("spaced");
    } else if (!whole && region.parentElement && region.parentElement.matches(".section-content") && template.name !== "info") {
      const next = firstComponent(region.nextSibling);
      if (next && next.nodeType === 1 && titledColumnView(next)) styles.push("before-column");
    }
    return styles;
  }
  var SPACER = /^\{(?:(spacer|divider)-\d{1,3}( from-768)?|column-(?:start|end)(?:-outer)?)\}$/;
  function contentBetween(document, root, from, to) {
    const range = document.createRange();
    if (from) range.setStartAfter(from);
    else range.setStart(root, 0);
    range.setEndBefore(to);
    const frag = range.cloneContents();
    frag.querySelectorAll("p").forEach((p) => {
      if (SPACER.test(p.textContent.trim())) p.remove();
    });
    if ((frag.textContent || "").replace(/[\s ​]/g, "")) return true;
    return !!frag.querySelector(MEDIA2);
  }
  function dropEmptyBreaks(document, root) {
    const breaks = [...document.querySelectorAll(`hr[${BREAK}]`)].filter((hr) => !hr.closest("table"));
    let prev = null;
    breaks.forEach((hr) => {
      if (contentBetween(document, root, prev, hr)) {
        prev = hr;
        return;
      }
      if (!prev) {
        hr.setAttribute(FIRST, "true");
        prev = hr;
        return;
      }
      [MARKER, SOURCE_STYLE].forEach((attr) => {
        if (!hr.hasAttribute(attr)) return;
        const merged = [prev.getAttribute(attr), hr.getAttribute(attr)].filter(Boolean).join(" ");
        prev.setAttribute(attr, merged);
      });
      hr.remove();
    });
  }
  function transform2(hookName, element, payload) {
    const template = payload && payload.template || {};
    const sections = Array.isArray(template.sections) ? template.sections : [];
    const useSections = sections.length >= 2 || sections.length === 1 && hasStyle(sections[0]);
    const document = payload && payload.document || element.ownerDocument || element;
    if (hookName === "beforeTransform") {
      if (useSections) {
        for (let i = sections.length - 1; i >= 0; i -= 1) {
          const section = sections[i];
          const el = findSectionElement(document, section);
          if (!el) continue;
          const styled = hasStyle(section);
          if (i === 0 && !styled) continue;
          const hr = createBreak(document);
          if (styled) hr.setAttribute(MARKER, section.id);
          if (i === 0) hr.setAttribute(FIRST, "true");
          el.parentNode.insertBefore(hr, el);
        }
      }
      SOURCE_STYLES.forEach(([source, style]) => {
        styledRegions(document, template, source).forEach((region) => {
          const start = createBreak(document);
          start.setAttribute(SOURCE_STYLE, [style, ...style === "grey" ? greyStyles(region, template) : []].join(" "));
          region.before(start);
          region.after(createBreak(document));
        });
      });
      const padded = (s) => !!s.querySelector(":scope > div > .section-padding-y-regular");
      const grey = (s) => !!s.querySelector(":scope > .container-gray");
      const aemSections = [...document.querySelectorAll(".container-content > .section")].filter((s) => (s.textContent || "").replace(/[\s\u00a0\u200b]/g, "") || s.querySelector(MEDIA2));
      aemSections.forEach((s, i) => {
        if (!i || !padded(s) || grey(s) || !padded(aemSections[i - 1])) return;
        const hr = createBreak(document);
        hr.setAttribute(SOURCE_STYLE, "padded");
        s.before(hr);
      });
      const first = aemSections[0];
      if (template.name === "info" && first && padded(first) && !grey(first) && first.querySelector("h1") && !first.querySelector(".inspirationteaser, .stage")) {
        const hr = createBreak(document);
        hr.setAttribute(SOURCE_STYLE, "padded");
        first.before(hr);
      }
      const stage = (s) => !!s.querySelector(":scope > div > .section-content > .inspirationteaser");
      aemSections.forEach((s, i) => {
        if (!stage(s)) return;
        const next = aemSections[i + 1];
        const styles = ["stage"];
        if (!s.querySelector(":scope > .mb-default")) styles.push("flush");
        if (next && padded(next) && !grey(next)) styles.push("before-padded");
        const start = createBreak(document);
        start.setAttribute(SOURCE_STYLE, styles.join(" "));
        s.before(start);
        if (next) next.before(createBreak(document));
      });
    }
    if (hookName === "afterTransform") {
      dropEmptyBreaks(document, element);
      const styleOf = (hr) => {
        const styles = [];
        (hr.getAttribute(MARKER) || "").split(" ").filter(Boolean).forEach((id) => {
          const section = sections.find((s) => s.id === id);
          if (section && hasStyle(section)) styles.push(styleValue(section));
        });
        (hr.getAttribute(SOURCE_STYLE) || "").split(" ").filter(Boolean).forEach((style) => {
          if (!styles.some((s) => s.split(/,\s*/).includes(style))) styles.unshift(style);
        });
        return styles.join(", ");
      };
      const marked = [...document.querySelectorAll(`hr[${MARKER}], hr[${SOURCE_STYLE}]`)].filter((hr) => !hr.closest("table"));
      marked.reverse().forEach((marker) => {
        const style = styleOf(marker);
        if (style) {
          const meta = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style }
          });
          const next = nextBreak(document, marker);
          if (next) next.parentNode.insertBefore(meta, next);
          else element.appendChild(meta);
        }
      });
      document.querySelectorAll(`hr[${BREAK}]`).forEach((hr) => {
        if (hr.getAttribute(FIRST) === "true") {
          hr.remove();
          return;
        }
        [MARKER, SOURCE_STYLE, BREAK].forEach((attr) => hr.removeAttribute(attr));
      });
    }
  }

  // tools/importer/import-form.js
  var PAGE_TEMPLATE = {
    "name": "form",
    "description": "Feedback, refund and registration forms (render only, never submit)",
    "urls": [
      "https://www.lufthansa.com/de/en/feedback"
    ],
    "blocks": [
      {
        "name": "form-core",
        "instances": [
          "form.cmp-form"
        ]
      },
      {
        "name": "hero-campaign",
        "instances": [
          ".inspirationteaser"
        ]
      },
      {
        "name": "form",
        "instances": [
          ".feedbackforms"
        ]
      },
      {
        "name": "columns-media",
        "instances": [
          ':is(.section-content, .container-content) > .twocolumn:not(:has(.table, .teaser, .poimapping, .stage, .slideshow, .accordion, .onecolumn, .twocolumn, .threecolumn, .fourcolumn, .sidebar, .experiencefragment, .video, .carousel, .tabs, form, .messagecenterwrapper, .authorquote, iframe, maui-navigation-link[variant="anchor-down"]))',
          ':is(.section-content, .container-content) > :is(.threecolumn, .fourcolumn):not(:has(.table, .teaser, .poimapping, .stage, .slideshow, .accordion, .onecolumn, .twocolumn, .threecolumn, .fourcolumn, .sidebar, .experiencefragment, .video, .carousel, .tabs, form, .messagecenterwrapper, .authorquote, iframe, maui-navigation-link[variant="anchor-down"]))',
          ':is(.section-content, .container-content) > .onecolumn > .column-view > .row > .column-view-item > :is(.twocolumn, .threecolumn, .fourcolumn):not(:has(.table, .teaser, .poimapping, .stage, .slideshow, .accordion, .onecolumn, .twocolumn, .threecolumn, .fourcolumn, .sidebar, .experiencefragment, .video, .carousel, .tabs, form, .messagecenterwrapper, .authorquote, iframe, maui-navigation-link[variant="anchor-down"]))',
          ".videoViewer, .image:has(video)"
        ]
      },
      {
        "name": "accordion-columns",
        "instances": [
          ".accordion"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "name": "Title and contact-route link list",
        "selector": [
          ".contentpage > .container-fluid:has(> h1), .container-content .section-content > .onecolumn:nth-child(1), .container-content .section-content > .onecolumn:nth-child(2), .container-content .section-content > .onecolumn:nth-child(3), .container-content .section-content > .onecolumn:nth-child(4), .container-content .section-content > .onecolumn:has(.feedbackforms) .column-view > div:has(> #formular), .container-content .section-content > .onecolumn:has(.feedbackforms) .column-view-item > .text"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".contentpage > .container-fluid > h1",
          ".container-content .section-content > .onecolumn:nth-child(1)",
          ".container-content .section-content > .onecolumn:nth-child(2)",
          ".container-content .section-content > .onecolumn:nth-child(3)",
          ".container-content .section-content > .onecolumn:nth-child(4)",
          ".container-content .section-content > .onecolumn:has(.feedbackforms) .column-view > div:has(> #formular)",
          ".container-content .section-content > .onecolumn:has(.feedbackforms) .column-view-item > .text"
        ]
      },
      {
        "id": "section-2",
        "name": "Topic selection form (grey band)",
        "selector": [
          ".container-content .section-content > .onecolumn:has(.feedbackforms) .feedbackforms"
        ],
        "style": null,
        "blocks": [
          "form"
        ],
        "defaultContent": []
      },
      {
        "id": "section-3",
        "name": "Please note and more contact options",
        "selector": [
          ".container-content .section-content > .onecolumn:nth-child(6), .container-content .section-content > .onecolumn:has(.accordion)"
        ],
        "style": null,
        "blocks": [
          "accordion-columns"
        ],
        "defaultContent": [
          ".container-content .section-content > .onecolumn:nth-child(6)",
          ".container-content .section-content > .onecolumn:has(.accordion) .column-view-item > .headline"
        ]
      }
    ]
  };
  var parsers = {
    "form-core": parse,
    "hero-campaign": parse2,
    "form": parse3,
    "columns-media": parse4,
    "accordion-columns": parse5
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var tmp_bundle_form_695937_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(tmp_bundle_form_695937_exports);
})();
