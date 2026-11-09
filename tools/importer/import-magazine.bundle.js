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
  var __objRest = (source, exclude) => {
    var target = {};
    for (var prop in source)
      if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
        target[prop] = source[prop];
    if (source != null && __getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(source)) {
        if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
          target[prop] = source[prop];
      }
    return target;
  };
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

  // tools/importer/import-magazine.js
  var tmp_bundle_magazine_exports = {};
  __export(tmp_bundle_magazine_exports, {
    assetOf: () => assetOf,
    clean: () => clean,
    commonParent: () => commonParent,
    creditsOf: () => creditsOf,
    default: () => tmp_bundle_magazine_default,
    docName: () => docName,
    isoDate: () => isoDate,
    transformPage: () => transformPage
  });

  // scripts/style-markers.js
  var COLUMN_MARK = "column-(?:(?:start|end)(?:-outer)?|spaced)";
  var styleMarker = (tokens) => new RegExp(`\\s*\\{((?:${tokens})(?: (?:${tokens}))*)\\}\\s*$`);
  var HEADING_TOKENS = `heading-(?:large|medium|small|copytext-large|copytext-medium)|copytext-large|limited-width|${COLUMN_MARK}`;
  var PARAGRAPH_TOKENS = `copytext-(?:small|medium|large)|full-width|limited-width|caption|parallax|narrow|indent-\\d{1,3}|${COLUMN_MARK}`;
  var LIST_TOKENS = `copytext-(?:small|medium|large)|full-width|limited-width|${COLUMN_MARK}`;
  var HEADING_STYLE = styleMarker(HEADING_TOKENS);
  var PARAGRAPH_STYLE = styleMarker(PARAGRAPH_TOKENS);
  var LIST_STYLE = styleMarker(LIST_TOKENS);
  var SEPARATOR = /^\{(spacer|divider)-(\d{1,3})( from-768)?\}$/;
  var VIDEO_SETTINGS = ["autoplay", "muted", "loop", "controls", "round-play-button"];
  var VIDEO_SIZE = "size-\\d{2,5}x\\d{2,5}";
  var VIDEO_MARKER = styleMarker(`${VIDEO_SETTINGS.join("|")}|${VIDEO_SIZE}`);
  var BLANK_LINE = /^\s*\{blank\}\s*$/;
  var APP_SPACER = /^\{spacer:\s*(x-small|small|medium|m-large|large)\s*(,\s*v2)?\s*\}$/i;
  var APP_SMALL = /\s*\{small\}\s*$/;
  var OTHER_TOKENS = "mobile|blank|small|divider|cell-(?:half-start|half-end|three-quarters)";
  var ANY_TOKENS = [HEADING_TOKENS, PARAGRAPH_TOKENS, LIST_TOKENS, VIDEO_SETTINGS.join("|"), VIDEO_SIZE, OTHER_TOKENS].join("|");
  var ANY_MARKER = `\\{\\s*(?:${ANY_TOKENS})(?: (?:${ANY_TOKENS}))*\\s*\\}`;
  var TRAILING_TEXT = new RegExp(`\\s*${ANY_MARKER}\\s*$`);
  var TRAILING_HTML = new RegExp(`\\s*${ANY_MARKER}((?:\\s*</[a-z][a-z0-9]*>)*)\\s*$`, "i");
  var SPACE = { m: 60, l: 120 };
  var DIVIDER_SPACE = 25;
  var HEADING_SIZES = ["heading-large", "heading-medium", "heading-small", "heading-copytext-large", "heading-copytext-medium"];
  function sizeSteps(from, to) {
    const a = HEADING_SIZES.indexOf(from);
    const b = HEADING_SIZES.indexOf(to);
    return a < 0 || b < 0 ? null : b - a;
  }
  var BASE_THEME = {
    headings: {
      h1: "heading-large",
      h2: "heading-medium",
      h3: "heading-copytext-large",
      h4: "heading-copytext-large",
      h5: "heading-copytext-medium",
      h6: "heading-copytext-medium"
    },
    headingChoices: {
      h2: { large: "heading-large", compact: "heading-copytext-large" },
      h3: { large: "heading-medium" }
    },
    // running text: two thirds of the content width from 1025px ('full': the whole width); body
    // text 18px (copytext-large), small print 14px
    text: { width: "limited", size: "copytext-large", small: "copytext-small" },
    separators: { m: SPACE.m, l: SPACE.l, divider: DIVIDER_SPACE },
    // a Lufthansa column view's padding (32px; outside a page section 20px, 40px from 768px) and
    // the space a heading after content gets above it on flow pages once the column views are
    // structure: 32px (the column view's padding; also what the small separators dropped before
    // headings gave: ITA's pass check, tools/reports/token-free/ita-pass-check.md, measured 0 worse)
    columnViews: { padding: 32, outerPadding: [20, 40], headingGap: 32 },
    rules: [],
    live: false
  };
  var THEMES = {
    lufthansa: {
      // the column view carrier: a section of its own per www column view (the collapse writes it
      // from the column marks, ema-adobe's hub transformer on import; styles.css "the column view
      // carrier")
      columnViews: { carrier: "column-view" },
      pageTypes: {
        // Insights articles: a rule above an info box (Columns Media) after any content but a
        // heading; chapters (an H2 / H3 or a bold paragraph) as sections, a rule between them
        article: { rules: ["rule-before-info-box", "ruled-chapters"] },
        // /100-years: no rule of its own (it had sections 60px apart, sections-m; its documents are
        // campaign pages whose sections carry www's own spacing: +9 % on /de/en/100-years with it,
        // lh-com-pass-check.md, ema-adobe's handover item 2)
        // Insights tag pages (/articles/tags/…): the rule above an info box after any content but a
        // heading, as on articles (www: 417 of 505 such Columns Media; the others without)
        "insights-tag": { rules: ["rule-before-info-box"] }
      }
    },
    // Austrian: the paragraph right after the page title is the intro (copytext-large, Portada
    // 18/27); flow pages set their H3s in heading-small (www: 87 % of them)
    austrian: { live: true, rules: ["intro-after-h1"], pageTypes: { flow: { headings: { h3: "heading-small" } } } },
    // Brussels: flow pages set their H3s in heading-small (www: 72 %); a service page's H2s are the
    // default (www: 89 % unmarked, heading-medium; no longer heading-small)
    brussels: { live: true, pageTypes: { flow: { headings: { h3: "heading-small" } } } },
    // ITA: running text over the whole width
    ita: { live: true, text: { width: "full" } },
    // SWISS: flow pages set their H2s in heading-small (www: 63 % of the markets' pages, 79 % of the
    // sub-sites'; the rest mostly unmarked, one step up); the FAQ hub's topic teasers in their groups
    // (a heading right before them starts the group's column view, as its marker did)
    swiss: { live: true, rules: ["teaser-groups"], pageTypes: { flow: { headings: { h2: "heading-small" } } } },
    // Discover: on flow pages the H2s in heading-small (www: 86 %) and a Columns Media a column view
    // of its own (www: 26 of 33 not at a section's start)
    discover: { live: true, pageTypes: { flow: { headings: { h2: "heading-small" }, columnViews: { blocks: ["columns-media"] } } } },
    // Lufthansa Group for Business: on flow pages the H3s in heading-small (www: 82 %); Columns
    // Media, Carousel Images and Quote column views of their own, also at a section's end (www: 558
    // of 789 Columns Media not at a section's start, 749 of 962 with an edge below)
    b2b: {
      live: true,
      pageTypes: {
        flow: { headings: { h3: "heading-small" }, columnViews: { blocks: ["columns-media", "carousel-images", "quote"], endEdge: true } }
      }
    },
    // Air Dolomiti: the base theme (between B2B's and TAP's entries, next to no switch line)
    airdolomiti: {},
    // TAP: the base theme (an entry of its own, so its switch is one line as every brand's)
    tap: { live: true },
    // Lufthansa Cargo: the base theme
    cargo: {}
  };
  var mergeTheme = (a, b) => __spreadProps(__spreadValues(__spreadValues({}, a), b), {
    headings: __spreadValues(__spreadValues({}, a.headings), b.headings || {}),
    headingChoices: __spreadValues(__spreadValues({}, a.headingChoices), b.headingChoices || {}),
    text: __spreadValues(__spreadValues({}, a.text), b.text || {}),
    separators: __spreadValues(__spreadValues({}, a.separators), b.separators || {}),
    columnViews: __spreadValues(__spreadValues({}, a.columnViews), b.columnViews || {}),
    rules: [.../* @__PURE__ */ new Set([...a.rules || [], ...b.rules || []])]
  });
  function themeFor(brand, pageType = "") {
    const own = THEMES[brand || "lufthansa"] || {};
    const _a = own, { pageTypes = {} } = _a, brandTheme = __objRest(_a, ["pageTypes"]);
    let theme = mergeTheme(BASE_THEME, brandTheme);
    if (pageType && pageTypes[pageType]) theme = mergeTheme(theme, pageTypes[pageType]);
    return theme;
  }
  var isThemeLive = (brand) => themeFor(brand || "lufthansa").live === true;
  function pageTypeOf({ path = "", articleHeader = false, themes = "" } = {}) {
    if (articleHeader) return "article";
    if (/^\/[a-z]{2}\/[a-z]{2}\/100-years(\/|$)/.test(path)) return "100-years";
    if (/^\/[a-z]{2}\/[a-z]{2}\/articles\/tags\//.test(path)) return "insights-tag";
    if (/(^|,)\s*flow-spacing\s*(,|$)/.test(themes)) return "flow";
    if (/^\/(?:[a-z]{2}(?:-[a-z]{2})?(?:\/[a-z]{2})?(?:\/homepage)?)?\/?$/.test(path)) return "home";
    return "service";
  }
  var tagOf = (n) => String(n && (n.tagName || n.tag) || "").toLowerCase();
  var kidsOf = (n) => [...n && (n.childNodes || n.children) || []];
  var isTextNode = (n) => n && (n.nodeType === 3 || n.text !== void 0 && !n.tag && !n.tagName);
  var nodeText = (n) => {
    var _a, _b;
    if (!n) return "";
    if (isTextNode(n)) return String((_b = (_a = n.nodeValue) != null ? _a : n.text) != null ? _b : "");
    if (n.nodeType === 8) return "";
    return kidsOf(n).map(nodeText).join("");
  };
  var isElementNode = (n) => n && !isTextNode(n) && n.nodeType !== 8 && !!tagOf(n);
  var meaningful = (n) => kidsOf(n).filter((c) => isTextNode(c) ? nodeText(c).replace(/[\s\u200b]+/g, "") : isElementNode(c));
  function isImageParagraph(p) {
    if (tagOf(p) !== "p" || nodeText(p).replace(/[\s\u200b]+/g, "")) return false;
    const kids = meaningful(p);
    if (kids.length !== 1) return false;
    const [k] = kids;
    const media = (n) => ["picture", "img"].includes(tagOf(n));
    return media(k) || tagOf(k) === "a" && meaningful(k).length === 1 && media(meaningful(k)[0]);
  }
  var NAV_ROLES = ["accessibility", "help", "search", "cart", "login", "locale", "notifications"];
  function readNavRole(text) {
    const t = String(text != null ? text : "").trim().toLowerCase();
    if (!t) return null;
    return NAV_ROLES.find((r) => t === r || t.split(/[\s,/-]+/).includes(r)) || null;
  }

  // blocks/form/form-rules.js
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
    "rules",
    "default"
  ];
  var HEADER_WORDS = {
    label: ["label", "bezeichnung", "beschriftung", "feld", "field", "titel", "title"],
    type: ["type", "typ", "feldtyp", "field-type", "art"],
    name: ["name", "feldname", "field-name", "key", "schluessel", "id"],
    required: ["required", "pflicht", "pflichtfeld", "erforderlich", "mandatory"],
    options: ["options", "optionen", "auswahl", "werte", "values", "choices"],
    help: ["help-text", "help", "hilfetext", "hilfe", "beschreibung", "description", "hinweistext", "hint"],
    placeholder: ["placeholder", "platzhalter"],
    message: [
      "validation-message",
      "required-message",
      "error-message",
      "message",
      "fehlermeldung",
      "pflichtfeld-meldung",
      "meldung"
    ],
    constraint: [
      "constraint-message",
      "format-message",
      "pattern-message",
      "formatfehler",
      "format-meldung"
    ],
    rules: [
      "rules",
      "regeln",
      "validation",
      "validierung",
      "attributes",
      "attribute",
      "settings",
      "einstellungen"
    ],
    // the options chosen at load (scripts/style-markers.js isDefaultChoice), instead of "{selected}"
    default: [
      "default",
      "defaults",
      "vorauswahl",
      "voreinstellung",
      "vorbelegung",
      "standard",
      "preselected"
    ]
  };
  function headerKey(text) {
    return String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function readHeaderTexts(texts) {
    const map = {};
    let hits = 0;
    texts.forEach((text, index) => {
      const key = headerKey(text);
      const column = COLUMNS.find((c) => HEADER_WORDS[c].includes(key));
      if (column && map[column] === void 0) {
        map[column] = index;
        hits += 1;
      }
    });
    return hits >= 2 ? map : null;
  }

  // tools/importer/marker-collapse.mjs
  var BODY_PX = {
    lufthansa: 18,
    cargo: 18,
    b2b: 18,
    ita: 18,
    austrian: 16,
    brussels: 16,
    swiss: 16,
    discover: 16,
    airdolomiti: 16,
    tap: 16
  };
  var TEXT_PX = { "copytext-small": 14, "copytext-medium": 16 };
  var CELL = "cell-(?:half-start|half-end|three-quarters)";
  var KNOWN = `${HEADING_TOKENS}|${PARAGRAPH_TOKENS}|${LIST_TOKENS}|${VIDEO_SETTINGS.join("|")}|${VIDEO_SIZE}|mobile|${CELL}`;
  var TAIL = new RegExp(`\\s*\\{\\s*((?:${KNOWN})(?: (?:${KNOWN}))*)\\s*\\}\\s*$`);
  var COLUMN = /^column-/;
  var SIZE_TOKEN = /^(heading-(?:large|medium|small|copytext-large|copytext-medium)|copytext-(?:small|medium|large))$/;
  var ROLE = new RegExp(`\\s*\\{(${NAV_ROLES.join("|")})\\}\\s*`);
  var SELECTED = /\s*\{selected\}\s*$/i;
  var HEADING = "h1, h2, h3, h4, h5, h6";
  var BLOCK_SKIP = /* @__PURE__ */ new Set(["section-metadata", "metadata"]);
  function newStats() {
    return { theme: {}, carrier: {}, hand: {} };
  }
  var count = (stats, kind, family, n = 1) => {
    stats[kind][family] = (stats[kind][family] || 0) + n;
  };
  function totals(stats) {
    const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
    return { theme: sum(stats.theme), carrier: sum(stats.carrier), hand: sum(stats.hand) };
  }
  var toClass = (s) => String(s || "").trim().toLowerCase().replace(/[^0-9a-z]+/g, "-").replace(/^-+|-+$/g, "");
  var titleOf = (name) => name.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  var WRAPPERS = /* @__PURE__ */ new Set(["DIV", "SECTION", "ARTICLE", "MAIN", "ASIDE", "HEADER", "FOOTER", "NAV"]);
  var BLOCKISH = /* @__PURE__ */ new Set([...WRAPPERS, "P", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "TABLE", "HR", "BLOCKQUOTE", "FIGURE", "PRE", "DL"]);
  function flat(node, out = []) {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3 && !n.nodeValue.trim()) return;
      if (n.nodeType === 8) return;
      const wrapper = n.nodeType === 1 && WRAPPERS.has(n.tagName) && [...n.childNodes].every((c) => c.nodeType === 3 ? !c.nodeValue.trim() : c.nodeType !== 1 || BLOCKISH.has(c.tagName));
      if (wrapper) flat(n, out);
      else out.push(n);
    });
    return out;
  }
  function tableToDiv(main, doc) {
    if (![...main.children].some((n) => n.tagName === "TABLE" || n.tagName === "HR")) return null;
    const kids = flat(main);
    const heads = /* @__PURE__ */ new Map();
    const groups = [[]];
    kids.forEach((n) => {
      if (n.nodeType === 1 && n.tagName === "HR") groups.push([]);
      else groups[groups.length - 1].push(n);
    });
    main.replaceChildren();
    groups.forEach((g) => {
      const section = doc.createElement("div");
      section.dataset.mcSection = "";
      g.forEach((n) => {
        if (n.nodeType === 1 && n.tagName === "TABLE") {
          const rows = [...n.querySelectorAll(":scope > tbody > tr, :scope > thead > tr, :scope > tr")];
          const head = rows.shift();
          const text = head ? head.textContent.trim() : "";
          const m = text.match(/^([^(]*?)\s*(?:\((.*)\))?$/);
          const name = toClass(m ? m[1] : text);
          const opts = m && m[2] ? m[2].split(",").map(toClass).filter(Boolean) : [];
          const block = doc.createElement("div");
          block.className = [name, ...opts].join(" ");
          const tds = rows.map((tr) => [...tr.children]);
          heads.set(block, {
            text,
            name: m ? m[1].trim() : text,
            opts: opts.join(" "),
            table: n,
            tds
          });
          tds.forEach((cells) => {
            const row = doc.createElement("div");
            cells.forEach((td) => {
              const cell = doc.createElement("div");
              cell.append(...td.childNodes);
              row.append(cell);
            });
            block.append(row);
          });
          section.append(block);
        } else {
          if (n.nodeType === 1 && n.tagName === "DIV" && n.className) {
            n.dataset.mcClass = n.className;
            n.removeAttribute("class");
          }
          section.append(n);
        }
      });
      main.append(section);
    });
    return () => {
      const sections = [...main.children];
      main.replaceChildren();
      sections.forEach((section, i) => {
        if (i) main.append(doc.createElement("hr"));
        [...section.childNodes].forEach((n) => {
          if (n.nodeType === 1 && n.tagName === "DIV" && n.classList.length) {
            const [name, ...opts] = [...n.classList];
            const was = heads.get(n);
            const rowsNow = [...n.children];
            if (was && was.opts === opts.join(" ") && rowsNow.length === was.tds.length && rowsNow.every((r, ri) => r.children.length === was.tds[ri].length)) {
              rowsNow.forEach((r, ri) => [...r.children].forEach((c, ci) => was.tds[ri][ci].append(...c.childNodes)));
              main.append(was.table);
              return;
            }
            const label = was && was.opts === opts.join(" ") ? was.text : `${was ? was.name : titleOf(name)}${opts.length ? ` (${opts.join(", ")})` : ""}`;
            const table2 = doc.createElement("table");
            const rows = [...n.children];
            const width = Math.max(1, ...rows.map((r) => r.children.length));
            const head = doc.createElement("tr");
            const th = doc.createElement("th");
            if (width > 1) th.setAttribute("colspan", String(width));
            th.textContent = label;
            head.append(th);
            const thead = doc.createElement("thead");
            thead.append(head);
            const tbody = doc.createElement("tbody");
            rows.forEach((r) => {
              const tr = doc.createElement("tr");
              [...r.children].forEach((c) => {
                const td = doc.createElement("td");
                td.append(...c.childNodes);
                tr.append(td);
              });
              tbody.append(tr);
            });
            table2.append(thead, tbody);
            main.append(table2);
          } else {
            if (n.nodeType === 1 && n.dataset && n.dataset.mcClass !== void 0) {
              n.className = n.dataset.mcClass;
              delete n.dataset.mcClass;
            }
            main.append(n);
          }
        });
      });
    };
  }
  var isBlock = (el) => !!el && el.nodeType === 1 && el.tagName === "DIV" && el.classList.length > 0;
  var blockName = (el) => isBlock(el) ? el.className.trim().split(/\s+/)[0] : "";
  var sectionOf = (el, main) => {
    let n = el;
    while (n && n.parentElement !== main) n = n.parentElement;
    return n;
  };
  var blockOf = (el, main) => {
    for (let n = el.parentElement; n && n !== main; n = n.parentElement) {
      if (n.parentElement && n.parentElement.parentElement === main && isBlock(n)) return n;
    }
    return null;
  };
  var ownContent = (section) => [...section.children].filter((el) => !isBlock(el) || !BLOCK_SKIP.has(blockName(el)));
  var ownText = (section) => [...section.children].filter((el) => !isBlock(el));
  function kvRows(block) {
    const out = {};
    [...block.children].forEach((row) => {
      const [k, v] = row.children;
      if (k && v) out[k.textContent.trim().toLowerCase()] = v;
    });
    return out;
  }
  function sectionStyles(section) {
    const meta = [...section.children].find((c) => blockName(c) === "section-metadata");
    const cell = meta && kvRows(meta).style;
    return cell ? cell.textContent.split(",").map(toClass).filter(Boolean) : [];
  }
  function addSectionStyle(section, style, doc) {
    let meta = [...section.children].find((c) => blockName(c) === "section-metadata");
    if (!meta) {
      meta = doc.createElement("div");
      meta.className = "section-metadata";
      section.append(meta);
    }
    let cell = kvRows(meta).style;
    if (!cell) {
      const row = doc.createElement("div");
      const k = doc.createElement("div");
      k.textContent = "Style";
      cell = doc.createElement("div");
      row.append(k, cell);
      meta.prepend(row);
    }
    const have = cell.textContent.split(",").map((s) => s.trim()).filter(Boolean);
    if (have.map(toClass).includes(style)) return false;
    cell.textContent = [...have, style].join(", ");
    return true;
  }
  function addBlockOption(block, opt) {
    if (block.classList.contains(opt)) return false;
    block.classList.add(opt);
    return true;
  }
  function pageMetaCell(main, key, doc, create = false) {
    const meta = main.querySelector(":scope > div > div.metadata");
    if (!meta) return null;
    const rows = kvRows(meta);
    if (rows[key.toLowerCase()] || !create) return rows[key.toLowerCase()] || null;
    const row = doc.createElement("div");
    const k = doc.createElement("div");
    k.textContent = key;
    const v = doc.createElement("div");
    row.append(k, v);
    meta.append(row);
    return v;
  }
  function splitSection(section, els, doc, styles = []) {
    const next = doc.createElement("div");
    if (section.dataset && "mcSection" in section.dataset) next.dataset.mcSection = "";
    section.after(next);
    next.append(...els);
    sectionStyles(section).forEach((s) => addSectionStyle(next, s, doc));
    styles.forEach((s) => addSectionStyle(next, s, doc));
    return next;
  }
  function splitBefore(section, el, doc) {
    const rest = [];
    for (let n = el; n; n = n.nextSibling) rest.push(n);
    const move = rest.filter((n) => !(n.nodeType === 1 && blockName(n) === "section-metadata"));
    if (!move.some((n) => n.nodeType === 1 || (n.nodeValue || "").trim())) return null;
    if (!ownContent(section).some((n) => !move.includes(n))) return section;
    return splitSection(section, move, doc);
  }
  function splitAfter(section, el, doc) {
    const next = el.nextElementSibling;
    return next && !(blockName(next) === "section-metadata") ? splitBefore(section, next, doc) : null;
  }
  function lastText(el) {
    let last = null;
    const walk = (n) => n.childNodes.forEach((c) => {
      if (c.nodeType === 3) {
        if (c.nodeValue.trim()) last = c;
      } else if (c.nodeType === 1) walk(c);
    });
    walk(el);
    return last;
  }
  function takeTokens(el) {
    const tokens = [];
    for (let guard = 0; guard < 6; guard += 1) {
      const t = lastText(el);
      const m = t && t.nodeValue.match(TAIL);
      if (!m) break;
      tokens.unshift(...m[1].split(/\s+/));
      t.nodeValue = t.nodeValue.slice(0, m.index);
    }
    return tokens;
  }
  function firstText(el) {
    let first = null;
    const walk = (n) => n.childNodes.forEach((c) => {
      if (first) return;
      if (c.nodeType === 3) {
        if (c.nodeValue.trim()) first = c;
      } else if (c.nodeType === 1) walk(c);
    });
    walk(el);
    return first;
  }
  var textOf = (el) => (el.textContent || "").replace(/[\u200b\ufeff]/g, "").replace(/\s+/g, " ").trim();
  var isEmptyP = (el) => el.tagName === "P" && !textOf(el) && !el.querySelector("img, picture, video, iframe, a, br + *");
  function slug(text) {
    return String(text).toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "").replace(/ /g, "-");
  }
  function collapseApp(main, doc, stats) {
    main.querySelectorAll(":scope > div > p").forEach((p) => {
      const raw = textOf(p);
      const sp = raw.match(APP_SPACER);
      if (sp) {
        const b = doc.createElement("div");
        b.className = ["app-spacer", sp[1].toLowerCase(), ...sp[2] ? ["v2"] : []].join(" ");
        b.innerHTML = "<div><div></div></div>";
        p.replaceWith(b);
        count(stats, "carrier", "app");
        return;
      }
      if (/^\{divider\}$/i.test(raw)) {
        const b = doc.createElement("div");
        b.className = "app-divider";
        b.innerHTML = "<div><div></div></div>";
        p.replaceWith(b);
        count(stats, "carrier", "app");
      }
    });
    main.querySelectorAll(":scope > div").forEach((section) => {
      let run = null;
      [...section.children].forEach((el) => {
        const t = el.tagName === "P" && lastText(el);
        if (t && APP_SMALL.test(t.nodeValue)) {
          t.nodeValue = t.nodeValue.replace(APP_SMALL, "");
          if (!run) {
            run = doc.createElement("div");
            run.className = "app-text small";
            run.innerHTML = "<div><div></div></div>";
            el.before(run);
          }
          run.querySelector(":scope > div > div").append(el);
          count(stats, "carrier", "app");
        } else run = null;
      });
    });
  }
  var NOTE_MARK = /\s*\{((?:copytext-(?:small|medium|large)|full-width|limited-width)(?: [a-z-]+)*)\}\s*$/;
  function collapseFormNotes(main, stats) {
    main.querySelectorAll(":scope > div > div.form").forEach((block) => {
      const rows = [...block.children];
      const header = rows.length ? readHeaderTexts([...rows[0].children].map((c) => textOf(c))) : null;
      const labelAt = header && header.label !== void 0 ? header.label : 0;
      const typeAt = header && header.type !== void 0 ? header.type : 1;
      (header ? rows.slice(1) : rows).forEach((row) => {
        if (!/^(note|hinweis)$/i.test(textOf(row.children[typeAt] || { textContent: "" }).trim())) return;
        const cell = row.children[labelAt];
        const paras = cell && cell.querySelector("p") ? [...cell.querySelectorAll("p")] : [cell].filter(Boolean);
        paras.forEach((p) => {
          const last = lastText(p);
          const m = last && last.nodeValue.match(NOTE_MARK);
          if (!m) return;
          last.nodeValue = last.nodeValue.slice(0, m.index);
          if (!last.nodeValue) last.remove();
          m[1].split(" ").forEach((t) => count(stats, "theme", /^copytext-/.test(t) ? "text-size" : "text-width"));
        });
      });
    });
  }
  function collapseForms(main, doc, stats) {
    main.querySelectorAll(":scope > div > div.form").forEach((block) => {
      const rows = [...block.children];
      if (!rows.length) return;
      const header = readHeaderTexts([...rows[0].children].map((c) => textOf(c)));
      const optionsAt = header ? header.options : 4;
      let defaultAt = header ? header.default : 10;
      const body = header ? rows.slice(1) : rows;
      const found = body.map((row) => {
        const cell = row.children[optionsAt];
        if (!cell) return [];
        const picked = [];
        const lines = cell.querySelectorAll("p, li").length ? [...cell.querySelectorAll("p, li")] : [cell];
        lines.forEach((line) => {
          const parts = [...line.childNodes].filter((n) => n.nodeType === 3 && SELECTED.test(n.nodeValue));
          parts.forEach((n) => {
            const own = n.nodeValue.replace(SELECTED, "");
            n.nodeValue = own;
            const text = (own.trim() ? own : textOf(line)).split(/\n/).pop().trim();
            const label = text.includes("=") ? text.slice(text.indexOf("=") + 1).trim() : text;
            if (label) picked.push(label);
          });
        });
        return picked;
      });
      if (!found.some((f) => f.length)) return;
      if (defaultAt === void 0) {
        defaultAt = rows[0].children.length;
        const h = doc.createElement("div");
        h.textContent = "Default";
        rows[0].append(h);
      }
      body.forEach((row, i) => {
        while (row.children.length <= defaultAt) row.append(doc.createElement("div"));
        const cell = row.children[defaultAt];
        if (!found[i].length) return;
        cell.replaceChildren(...found[i].map((l) => {
          const p = doc.createElement("p");
          p.textContent = l;
          return p;
        }));
        count(stats, "carrier", "form", found[i].length);
      });
    });
  }
  function collapseNav(main, doc, stats) {
    main.querySelectorAll(":scope > div > ul").forEach((list) => {
      const items = [...list.children].filter((li) => li.tagName === "LI");
      if (!items.some((li) => ROLE.test(li.textContent))) return;
      const block = doc.createElement("div");
      block.className = "nav-tools";
      items.forEach((li) => {
        const sub = [...li.children].filter((c) => /^(UL|OL)$/.test(c.tagName));
        sub.forEach((s) => s.remove());
        let role = "";
        const walk = (n) => n.childNodes.forEach((c) => {
          if (c.nodeType === 3 && ROLE.test(c.nodeValue)) {
            [, role] = c.nodeValue.match(ROLE);
            c.nodeValue = c.nodeValue.replace(ROLE, " ").replace(/\s+$/, "");
          } else if (c.nodeType === 1) walk(c);
        });
        walk(li);
        const row = doc.createElement("div");
        const item = doc.createElement("div");
        const p = doc.createElement("p");
        p.append(...li.childNodes);
        item.append(p);
        const r = doc.createElement("div");
        if (role && readNavRole(role)) {
          r.textContent = role;
          count(stats, "carrier", "nav");
        }
        const more = doc.createElement("div");
        more.append(...sub);
        row.append(item, r, more);
        block.append(row);
      });
      list.replaceWith(block);
    });
  }
  var VIDEO_LINK = (a) => /\.(mp4|m4v|webm|mov)(?:$|[?#])/i.test(a.getAttribute("href") || "");
  function addFragment(a, part) {
    const href = a.getAttribute("href");
    const at = href.indexOf("#");
    const base = at < 0 ? href : href.slice(0, at);
    const parts = at < 0 ? [] : href.slice(at + 1).split("&").filter(Boolean);
    const key = part.split("=")[0];
    if (parts.some((p) => p.split("=")[0] === key)) return;
    a.setAttribute("href", `${base}#${[...parts, part].join("&")}`);
  }
  function collapseVideos(main, doc, stats, marks) {
    marks.forEach((tokens, el) => {
      const video = tokens.filter((t) => VIDEO_SETTINGS.includes(t) || /^size-\d+x\d+$/.test(t) || t === "mobile");
      if (!video.length) return;
      const a = [...el.querySelectorAll("a[href]")].find(VIDEO_LINK);
      const block = blockOf(el, main);
      if (video.includes("mobile") && block && blockName(block) === "article-header") {
        if (addBlockOption(block, "mobile-video")) count(stats, "carrier", "video");
      } else if (video.includes("mobile")) count(stats, "hand", "video");
      if (!a) {
        if (video.some((t) => t !== "mobile")) count(stats, "hand", "video");
        return;
      }
      const size = video.find((t) => /^size-\d+x\d+$/.test(t));
      if (size) {
        addFragment(a, `size=${size.slice(5)}`);
        count(stats, "carrier", "video");
      }
      const settings = video.filter((t) => VIDEO_SETTINGS.includes(t));
      if (settings.includes("autoplay") && !settings.includes("controls")) {
        if (block && blockName(block) !== "article-header") addBlockOption(block, "background-video");
        else addFragment(a, "background");
        count(stats, "carrier", "video");
      } else if (settings.length) count(stats, "theme", "video");
    });
  }
  function collapseCaptions(main, doc, stats, marks, hand) {
    marks.forEach((tokens, el) => {
      if (!tokens.includes("caption") || el.tagName !== "P") return;
      const onlyLink = el.querySelectorAll("a").length === 1 && textOf(el.querySelector("a")) === textOf(el);
      const prev = el.previousElementSibling;
      if (prev && prev.tagName === "P" && !textOf(prev) && prev.querySelectorAll("picture, img").length - prev.querySelectorAll("picture img").length >= 2) {
        const last = el.lastChild;
        if (last && last.nodeType === 3) last.nodeValue = last.nodeValue.replace(/\s+$/, "");
        count(stats, "theme", "caption");
        return;
      }
      const kids = [...el.childNodes].filter((n) => n.nodeType === 1 || n.nodeValue.trim());
      if (!(kids.length === 1 && kids[0].nodeType === 1 && /^(EM|I)$/.test(kids[0].tagName))) {
        const em = doc.createElement("em");
        em.append(...el.childNodes);
        if (em.lastChild && em.lastChild.nodeType === 3) em.lastChild.nodeValue = em.lastChild.nodeValue.replace(/\s+$/, "");
        el.append(em);
      }
      if (isImageParagraph(el.previousElementSibling) && !onlyLink) count(stats, "carrier", "caption");
      else {
        count(stats, "hand", "caption");
        hand.push(`caption after no image: "${textOf(el).slice(0, 60)}"`);
      }
    });
  }
  function headingWish(theme, level, size) {
    const def = theme.headings[`h${level}`];
    const idx = (s) => s === "copytext-large" ? HEADING_SIZES.length : HEADING_SIZES.indexOf(s);
    const steps = size === "copytext-large" ? idx(size) - idx(def) : sizeSteps(def, size);
    if (steps === null || Math.abs(steps) <= 1) return { kind: "default" };
    const choice = steps < 0 ? "large" : "compact";
    const has = ((theme.headingChoices || {})[`h${level}`] || {})[choice];
    return has ? { kind: "choice", choice } : { kind: "none" };
  }
  function collapseHeadings(main, doc, stats, marks, theme) {
    const wishes = /* @__PURE__ */ new Map();
    marks.forEach((tokens, el) => {
      if (!/^H[1-6]$/.test(el.tagName)) return;
      const size = tokens.find((t) => SIZE_TOKEN.test(t));
      tokens.filter((t) => t === "limited-width").forEach(() => count(stats, "theme", "heading"));
      if (!size) return;
      const w = headingWish(theme, Number(el.tagName[1]), size);
      if (w.kind === "default") count(stats, "theme", "heading");
      else if (w.kind === "none") count(stats, "theme", "heading-no-choice");
      else wishes.set(el, w.choice);
    });
    const blocks = /* @__PURE__ */ new Map();
    const sections = /* @__PURE__ */ new Map();
    wishes.forEach((choice, h) => {
      const block = blockOf(h, main);
      if (block) {
        if (!blocks.has(block)) blocks.set(block, []);
        blocks.get(block).push(choice);
      } else {
        const s = sectionOf(h, main);
        const key = `h${h.tagName[1]}-${choice}`;
        if (!sections.has(s)) sections.set(s, /* @__PURE__ */ new Map());
        sections.get(s).set(key, (sections.get(s).get(key) || 0) + 1);
      }
    });
    blocks.forEach((choices, block) => {
      const all = block.querySelectorAll(HEADING).length;
      const top = ["large", "compact"].map((c) => [c, choices.filter((x) => x === c).length]).sort((a, b) => b[1] - a[1])[0];
      if (top[1] * 2 > all && addBlockOption(block, `title-${top[0]}`)) count(stats, "carrier", "heading", top[1]);
      else count(stats, "theme", "heading-aligned", choices.length);
    });
    const styled = [];
    sections.forEach((keys, section) => {
      keys.forEach((n, key) => {
        const level = key.slice(0, 2).toUpperCase();
        const all = ownText(section).filter((el) => el.tagName === level).length;
        if (n * 2 > all) {
          styled.push([section, key]);
          count(stats, "carrier", "heading", n);
        } else count(stats, "theme", "heading-aligned", n);
      });
    });
    const byKey = /* @__PURE__ */ new Map();
    styled.forEach(([s, k]) => {
      if (!byKey.has(k)) byKey.set(k, []);
      byKey.get(k).push(s);
    });
    byKey.forEach((list, key) => {
      const level = key.slice(0, 2).toUpperCase();
      const withLevel = [...main.children].filter((s) => ownText(s).some((el) => el.tagName === level));
      const row = withLevel.length > 1 && withLevel.every((s) => list.includes(s)) && pageMetaCell(main, "Headings", doc, true);
      if (row) {
        const label = `${level} ${key.slice(3)}`;
        const have = textOf(row).split(",").map((x) => x.trim()).filter(Boolean);
        if (!have.includes(label)) row.textContent = [...have, label].join(", ");
      } else list.forEach((s) => addSectionStyle(s, key, doc));
    });
  }
  var isRunningText = (el) => el.tagName === "P" && !isImageParagraph(el) && !SEPARATOR.test(textOf(el)) && textOf(el) || /^(UL|OL)$/.test(el.tagName);
  function collapseText(main, doc, stats, marks, theme, brand, hand) {
    const body = BODY_PX[brand] || 18;
    const smallIn = /* @__PURE__ */ new Map();
    const wideIn = /* @__PURE__ */ new Map();
    const indents = [];
    const parallax = [];
    marks.forEach((tokens, el) => {
      if (/^H[1-6]$/.test(el.tagName)) return;
      const target = el.tagName === "LI" ? el.parentElement : el;
      const block = blockOf(target, main);
      tokens.forEach((t) => {
        if (/^copytext-/.test(t)) {
          const px = TEXT_PX[t] || body;
          const intro = brand === "austrian" && t === "copytext-large" && target.previousElementSibling && target.previousElementSibling.tagName === "H1";
          if (intro) count(stats, "theme", "text-size");
          else if (Math.abs(px - body) <= 2) count(stats, "theme", "text-size");
          else {
            const key = block || sectionOf(target, main);
            if (!smallIn.has(key)) smallIn.set(key, []);
            smallIn.get(key).push(target);
          }
        } else if (t === "full-width" || t === "limited-width") {
          if (block) {
            count(stats, "theme", "text-width");
            return;
          }
          const wantFull = t === "full-width";
          if (theme.text.width === "full" === wantFull) {
            count(stats, "theme", "text-width");
            return;
          }
          if (!wantFull) {
            count(stats, "theme", "text-width");
            return;
          }
          const s = sectionOf(target, main);
          if (!wideIn.has(s)) wideIn.set(s, []);
          wideIn.get(s).push(target);
        } else if (/^indent-\d+$/.test(t)) indents.push(target);
        else if (t === "parallax") parallax.push(target);
        else if (t === "narrow") {
          const s = sectionOf(target, main);
          if (target.closest("blockquote") && !block && addSectionStyle(s, "narrow", doc)) count(stats, "carrier", "quote");
          else count(stats, block ? "hand" : "theme", "quote");
        }
      });
    });
    smallIn.forEach((els, key) => {
      if (isBlock(key) && key.parentElement && key.parentElement.parentElement === main) {
        const all = [...key.querySelectorAll("p, ul, ol")].filter(isRunningText).length;
        if (els.length * 2 > all && addBlockOption(key, "small-print")) count(stats, "carrier", "text-size", els.length);
        else count(stats, "theme", "text-size", els.length);
        return;
      }
      const section = key;
      const text = ownText(section).filter(isRunningText);
      if (els.length === text.length) {
        addSectionStyle(section, "small-print", doc);
        count(stats, "carrier", "text-size", els.length);
        return;
      }
      const kids = [...section.children].filter((el) => !(isBlock(el) && BLOCK_SKIP.has(blockName(el))));
      const filler = (el) => SEPARATOR.test(textOf(el)) || isEmptyP(el);
      let k = kids.length - 1;
      while (k >= 0 && (els.includes(kids[k]) || !isBlock(kids[k]) && filler(kids[k]))) k -= 1;
      const run = kids.slice(k + 1).filter((el) => els.includes(el));
      if (run.length && run.length < text.length) {
        const first = kids.slice(k + 1).find((el) => els.includes(el));
        const next = splitBefore(section, first, doc);
        if (next) addSectionStyle(next, "small-print", doc);
        count(stats, "carrier", "text-size", run.length);
        count(stats, "theme", "text-size", els.length - run.length);
      } else count(stats, "theme", "text-size", els.length);
    });
    wideIn.forEach((els, section) => {
      const all = ownText(section).filter(isRunningText).length;
      if (els.length * 2 > all) {
        addSectionStyle(section, "wide-text", doc);
        count(stats, "carrier", "text-width", els.length);
      } else count(stats, "theme", "text-width", els.length);
    });
    const BULLET = /^\s*[•·▪‣◦*–—-]\s+/;
    const NUMBER = /^\s*\d{1,2}[.)]\s+/;
    const QUOTE = /^\s*[„“"«‚‘»].*[“”"»‘’«]\s*$/;
    const done = /* @__PURE__ */ new Set();
    indents.forEach((el) => {
      if (done.has(el) || el.tagName !== "P") {
        count(stats, "theme", "indent");
        return;
      }
      const t = textOf(el);
      const kind = BULLET.test(t) && "UL" || NUMBER.test(t) && "OL" || "";
      if (kind) {
        const run = [el];
        for (let n = el.nextElementSibling; n && indents.includes(n) && (kind === "UL" ? BULLET : NUMBER).test(textOf(n)); n = n.nextElementSibling) run.push(n);
        const list = doc.createElement(kind.toLowerCase());
        el.before(list);
        run.forEach((p) => {
          done.add(p);
          const li = doc.createElement("li");
          li.append(...p.childNodes);
          const first = firstText(li);
          if (first) first.nodeValue = first.nodeValue.replace(kind === "UL" ? BULLET : NUMBER, "");
          list.append(li);
          p.remove();
        });
        count(stats, "carrier", "indent", run.length);
      } else if (QUOTE.test(t) && !el.closest("blockquote")) {
        const q = doc.createElement("blockquote");
        el.before(q);
        q.append(el);
        count(stats, "carrier", "indent");
      } else count(stats, "theme", "indent");
    });
    parallax.forEach((el) => {
      if (blockOf(el, main)) {
        count(stats, "hand", "parallax");
        hand.push("parallax in a block");
        return;
      }
      const section = sectionOf(el, main);
      const images = ownText(section).filter((x) => isImageParagraph(x));
      if (images.every((x) => parallax.includes(x))) {
        addSectionStyle(section, "parallax", doc);
        count(stats, "carrier", "parallax");
        return;
      }
      const own = splitBefore(section, el, doc) || section;
      splitAfter(own, el, doc);
      addSectionStyle(own, "parallax", doc);
      count(stats, "carrier", "parallax");
    });
  }
  function collapseCells(main, stats, marks, hand) {
    const blocks = /* @__PURE__ */ new Map();
    marks.forEach((tokens, el) => {
      const cell = tokens.find((t) => /^cell-/.test(t));
      if (!cell) return;
      const block = blockOf(el, main);
      if (!block) {
        count(stats, "hand", "picture");
        hand.push(`a narrow picture outside a block (${cell})`);
        return;
      }
      if (!blocks.has(block)) blocks.set(block, []);
      blocks.get(block).push(cell.slice(5));
    });
    blocks.forEach((kinds, block) => {
      const pictures = [...block.querySelectorAll("p")].filter((p) => p.querySelector("picture, img") && !textOf(p)).length;
      if (new Set(kinds).size === 1 && kinds.length === pictures) {
        addBlockOption(block, `picture-${kinds[0]}`);
        count(stats, "carrier", "picture", kinds.length);
      } else {
        count(stats, "hand", "picture", kinds.length);
        hand.push(`narrow pictures of different kinds in one ${blockName(block)} (${kinds.join(", ")})`);
      }
    });
  }
  function columnPageTheme(main, doc, stats, marks) {
    const hasColumns = [...marks.values()].some((tokens) => tokens.some((t) => COLUMN.test(t)));
    if (hasColumns) {
      const theme = pageMetaCell(main, "Theme", doc, false);
      const values = theme ? textOf(theme).split(",").map((x) => x.trim()).filter(Boolean) : [];
      if (!values.includes("flow-spacing")) {
        const cell = theme || pageMetaCell(main, "Theme", doc, true);
        if (cell) {
          cell.textContent = [...values, "flow-spacing"].join(", ");
          count(stats, "carrier", "column-page");
        }
      }
    }
  }
  function columnViewSections(main, doc, marks, carrier) {
    const used = /* @__PURE__ */ new Set();
    const tokensOf = (el) => marks.get(el) || (/^(UL|OL)$/.test(el.tagName) && el.lastElementChild ? marks.get(el.lastElementChild) : null) || [];
    const isSepP = (el) => !!el && el.tagName === "P" && SEPARATOR.test(textOf(el));
    const add = (section, style) => {
      if (!sectionStyles(section).includes(style)) addSectionStyle(section, style, doc);
    };
    [...main.querySelectorAll(":scope > div")].forEach((section) => {
      const own = ownContent(section);
      const groups = [];
      let depth = 0;
      let cur = null;
      own.forEach((el) => {
        tokensOf(el).filter((t) => /^column-(start|end)/.test(t)).forEach((t) => {
          if (t.startsWith("column-start")) {
            if (depth === 0) cur = { first: el, outer: t === "column-start-outer" };
            depth += 1;
          } else if (depth > 0) {
            depth -= 1;
            if (depth === 0 && cur) {
              cur.last = el;
              groups.push(cur);
              cur = null;
            }
          }
        });
      });
      groups.forEach((g, i) => {
        if (i && groups[i - 1].last === g.first) g.first = g.first.nextElementSibling;
      });
      [...groups].reverse().forEach((g) => {
        if (!g.first || own.indexOf(g.first) < 0 || own.indexOf(g.first) > own.indexOf(g.last)) return;
        let { first } = g;
        while (isSepP(first.previousElementSibling)) first = first.previousElementSibling;
        const more = own.slice(own.indexOf(g.last) + 1).some((el) => !(el.tagName === "P" && isEmptyP(el)));
        const view = ownContent(section)[0] === first ? section : splitBefore(section, first, doc);
        if (!view) return;
        if (more) splitAfter(view, g.last, doc);
        add(view, carrier);
        if (g.outer) add(view, "padded");
        if (more) add(view, "flush");
        used.add(g.first);
        used.add(g.last);
      });
    });
    return used;
  }
  function collapseColumns(main, doc, stats, marks, theme) {
    if (theme.columnViews.carrier) {
      const used = columnViewSections(main, doc, marks, theme.columnViews.carrier);
      marks.forEach((tokens, el) => {
        const host = el.tagName === "LI" && el.parentElement && [...el.parentElement.children].pop() === el ? el.parentElement : el;
        tokens.filter((t) => COLUMN.test(t)).forEach((t) => {
          count(stats, used.has(host) && /^column-(start|end)/.test(t) ? "carrier" : "theme", "column");
        });
      });
      columnPageTheme(main, doc, stats, marks);
      return;
    }
    const outer = /* @__PURE__ */ new Map();
    marks.forEach((tokens, el) => {
      tokens.filter((t) => COLUMN.test(t)).forEach((t) => {
        if (t === "column-start-outer" || t === "column-end-outer") {
          const s = sectionOf(el.tagName === "LI" ? el.parentElement : el, main);
          if (!outer.has(s)) outer.set(s, { start: [], end: [] });
          outer.get(s)[t === "column-start-outer" ? "start" : "end"].push(el.tagName === "LI" ? el.parentElement : el);
        } else count(stats, "theme", "column");
      });
    });
    outer.forEach(({ start, end }, section) => {
      const own = ownContent(section).filter((el) => !(el.tagName === "P" && isEmptyP(el) && !start.includes(el) && !end.includes(el)));
      const spans = start.length === 1 && end.length === 1 && own[0] === start[0] && own[own.length - 1] === end[0];
      if (spans && !sectionStyles(section).includes("padded")) {
        addSectionStyle(section, "padded", doc);
        count(stats, "carrier", "column", 2);
      } else count(stats, "theme", "column", start.length + end.length);
    });
    columnPageTheme(main, doc, stats, marks);
  }
  function isBoldHeading(el) {
    if (!el || el.tagName !== "P") return false;
    const kids = [...el.childNodes].filter((n) => n.nodeType === 1 || (n.nodeValue || "").trim());
    return kids.length === 1 && kids[0].nodeType === 1 && /^(STRONG|B)$/.test(kids[0].tagName) && !!textOf(kids[0]) && !kids[0].querySelector("a, img, picture");
  }
  function collapseSeparators(main, doc, stats, ctx) {
    const { rules } = themeFor(ctx.brand, ctx.pageType);
    const isSep = (el) => !!el && el.tagName === "P" && SEPARATOR.test(textOf(el));
    const parse = (el) => textOf(el).match(SEPARATOR);
    main.querySelectorAll(":scope > div > * p").forEach((p) => {
      if (!isSep(p)) return;
      count(stats, "theme", "separator-in-block");
      p.remove();
    });
    [...main.children].forEach((section) => {
      const kids = [...section.children];
      const runs = [];
      kids.forEach((el, i) => {
        if (!isSep(el)) return;
        if (runs.length && runs[runs.length - 1].end === i - 1) {
          runs[runs.length - 1].els.push(el);
          runs[runs.length - 1].end = i;
        } else runs.push({ els: [el], start: i, end: i });
      });
      runs.forEach((run) => {
        const sec = run.els[0].parentElement;
        const now = [...sec.children];
        const first = now.indexOf(run.els[0]);
        const lastAt = now.indexOf(run.els[run.els.length - 1]);
        const seps = run.els.map(parse);
        const divider = seps.some((m) => m[1] === "divider");
        const px = seps.reduce((a, m) => a + Number(m[2]), 0);
        const tablet = seps.every((m) => m[3]);
        if (!tablet) seps.filter((m) => m[3]).forEach(() => count(stats, "theme", "separator-from-768"));
        let size = null;
        if (!divider && px <= 31) size = "none";
        else if (!divider) size = px < 90 ? "m" : "l";
        const content = (el) => el && !(isBlock(el) && BLOCK_SKIP.has(blockName(el))) && !isSep(el);
        const before = run.els[0].previousElementSibling;
        const after = run.els[run.els.length - 1].nextElementSibling;
        const atStart = !content(before) && now.slice(0, first).every((el) => !content(el));
        const atEnd = now.slice(lastAt + 1).every((el) => !content(el));
        const remove = () => run.els.forEach((el) => el.remove());
        if (size === "none") {
          remove();
          count(stats, "theme", "separator", run.els.length);
          return;
        }
        if (tablet) {
          const b2 = doc.createElement("div");
          b2.className = divider ? "divider from-768" : `spacer${size === "l" ? " l" : ""} from-768`;
          b2.innerHTML = "<div><div></div></div>";
          run.els[0].before(b2);
          remove();
          count(stats, "carrier", "separator-from-768", run.els.length);
          return;
        }
        if (rules.includes("sections-m") && size === "m" && (atStart || atEnd)) {
          remove();
          count(stats, "theme", "separator", run.els.length);
          return;
        }
        if (divider) {
          if (rules.includes("rule-before-info-box") && blockName(after) === "columns-media" && before && !atStart && !/^H[1-6]$/.test(before.tagName)) {
            remove();
            count(stats, "theme", "separator", run.els.length);
            return;
          }
          if (rules.includes("ruled-chapters") && after && (/^H[23]$/.test(after.tagName) || isBoldHeading(after)) && !atStart) {
            const last = run.els[run.els.length - 1];
            splitAfter(sec, last, doc);
            remove();
            count(stats, "theme", "separator", run.els.length);
            return;
          }
        }
        const style = divider ? "divider" : `space-${size}`;
        if (atStart && !atEnd && !sectionStyles(sec).some((s) => /^(space-[ml]|divider)$/.test(s))) {
          addSectionStyle(sec, style, doc);
          remove();
          count(stats, "carrier", "separator", run.els.length);
          return;
        }
        if (atEnd && !atStart && !sectionStyles(sec).some((s) => /^(space-below-[ml]|divider-below)$/.test(s))) {
          addSectionStyle(sec, divider ? "divider-below" : `space-below-${size}`, doc);
          remove();
          count(stats, "carrier", "separator", run.els.length);
          return;
        }
        if (isBlock(after) && !BLOCK_SKIP.has(blockName(after)) && !["space-m", "space-l", "divider-above"].some((o) => after.classList.contains(o))) {
          addBlockOption(after, divider ? "divider-above" : `space-${size}`);
          remove();
          count(stats, "carrier", "separator", run.els.length);
          return;
        }
        const b = doc.createElement("div");
        b.className = divider ? "divider" : `spacer${size === "l" ? " l" : ""}`;
        b.innerHTML = "<div><div></div></div>";
        run.els[0].before(b);
        remove();
        count(stats, "carrier", "separator", run.els.length);
      });
    });
  }
  function collapseBlank(main, stats) {
    main.querySelectorAll("p").forEach((p) => {
      if (BLANK_LINE.test(p.textContent) && p.querySelector(":scope > sub")) {
        p.remove();
        count(stats, "theme", "blank");
      }
    });
  }
  var metaValue = (main, key) => {
    const cell = pageMetaCell(main, key, null);
    return cell ? textOf(cell) : "";
  };
  function collapseMain(main, opts = {}) {
    const doc = opts.document || main.ownerDocument;
    const path = opts.path || "";
    const stats = newStats();
    const hand = [];
    if (!/\{\s*[a-z][a-z0-9 ,:-]*\}/.test(main.textContent || "")) {
      return {
        stats,
        ids: {},
        hand,
        changed: false
      };
    }
    const brand = String(opts.brand || metaValue(main, "brand") || "lufthansa").toLowerCase();
    if (!opts.force && !isThemeLive(brand)) {
      return {
        stats,
        ids: {},
        hand,
        changed: false,
        skipped: true
      };
    }
    const back = tableToDiv(main, doc);
    if (/^\/content\/mobile\//.test(path)) {
      collapseApp(main, doc, stats);
      if (back) back();
      const t2 = totals(stats);
      return {
        stats,
        ids: {},
        hand,
        changed: t2.theme + t2.carrier + t2.hand > 0
      };
    }
    const themes = metaValue(main, "theme");
    const columnPage = /\{[^}]*\bcolumn-(start|end)/.test(main.textContent || "");
    const pageType = pageTypeOf({ path, articleHeader: !!main.querySelector("div.article-header"), themes: columnPage ? `${themes}, flow-spacing` : themes });
    const theme = themeFor(brand, pageType);
    const emptyBefore = new Set([...main.querySelectorAll(":scope > div")].filter((d) => !d.children.length && !textOf(d)));
    if (/\/nav$/.test(path)) collapseNav(main, doc, stats);
    collapseForms(main, doc, stats);
    collapseFormNotes(main, stats);
    collapseBlank(main, stats);
    const marks = /* @__PURE__ */ new Map();
    main.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li").forEach((el) => {
      if (el.closest("div.metadata, div.section-metadata")) return;
      if (el.tagName === "LI" && el.parentElement && [...el.parentElement.children].pop() !== el) return;
      if (el.tagName === "P" && SEPARATOR.test(textOf(el))) return;
      const tokens = takeTokens(el);
      if (tokens.length) marks.set(el, tokens);
    });
    main.querySelectorAll(":scope > div > div[class] > div > div").forEach((cell) => {
      if (cell.querySelector("p, h1, h2, h3, h4, h5, h6, li, div") || !cell.querySelector("a[href]")) return;
      const t2 = lastText(cell);
      const m = t2 && t2.nodeValue.match(TAIL);
      if (!m || !m[1].split(/\s+/).every((k) => VIDEO_SETTINGS.includes(k) || /^size-\d+x\d+$/.test(k))) return;
      marks.set(cell, takeTokens(cell));
    });
    collapseVideos(main, doc, stats, marks);
    collapseCaptions(main, doc, stats, marks, hand);
    collapseHeadings(main, doc, stats, marks, theme);
    collapseColumns(main, doc, stats, marks, theme);
    collapseText(main, doc, stats, marks, theme, brand, hand);
    collapseCells(main, stats, marks, hand);
    marks.forEach((tokens, el) => {
      if (el.isConnected && el.tagName === "P" && isEmptyP(el)) el.remove();
    });
    collapseSeparators(main, doc, stats, { brand, pageType });
    const t = totals(stats);
    const changed = t.theme + t.carrier + t.hand > 0;
    const ids = {};
    if (changed) {
      marks.forEach((tokens, h) => {
        if (!/^H[1-6]$/.test(h.tagName) || !h.id || !h.isConnected) return;
        const suffix = slug(tokens.join(" "));
        const m = h.id.match(new RegExp(`^(.*?)-?${suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(-\\d+)?$`));
        if (!m) return;
        const next = m[1] ? `${m[1]}${m[2] || ""}` : slug(textOf(h)).replace(/^\d+-+/, "");
        if (!next || next === h.id) return;
        ids[h.id] = next;
        h.id = next;
      });
      const seen = /* @__PURE__ */ new Map();
      main.querySelectorAll(HEADING).forEach((h) => {
        if (!h.id) return;
        const base = h.id;
        if (!seen.has(base)) {
          seen.set(base, 0);
          return;
        }
        let n = seen.get(base) + 1;
        while (seen.has(`${base}-${n}`)) n += 1;
        seen.set(base, n);
        h.id = `${base}-${n}`;
        seen.set(h.id, 0);
      });
    }
    if (Object.keys(ids).length) {
      main.querySelectorAll('a[href*="#"]').forEach((a) => {
        const href = a.getAttribute("href");
        const at = href.indexOf("#");
        const page = href.slice(0, at);
        const frag = decodeURIComponent(href.slice(at + 1));
        if (page && page !== path && !page.endsWith(path)) return;
        if (ids[frag]) a.setAttribute("href", `${page}#${ids[frag]}`);
      });
    }
    main.querySelectorAll(":scope > div").forEach((s) => {
      if (!s.children.length && !textOf(s) && !emptyBefore.has(s)) s.remove();
    });
    if (back) back();
    return {
      stats,
      ids,
      hand,
      changed
    };
  }

  // tools/importer/import-magazine.js
  var ORIGIN = "https://www.swiss.com";
  var clean = (s) => String(s || "").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
  function assetOf(src) {
    let p = String(src || "").trim().split(/\s/)[0];
    try {
      p = decodeURIComponent(p);
    } catch (e) {
    }
    p = p.replace(/^https?:\/\/(www\.)?swiss\.com/, "");
    const m = p.match(/^(\/content\/dam\/.+?)\.component\.[^/]*?\.([a-z0-9]+)\/content\//i);
    if (m) return `${m[1]}.${m[2]}`;
    return /^\/content\/dam\/.+\.[a-z0-9]+$/i.test(p) ? p : "";
  }
  var docName = (p) => p.split("/").map((seg) => seg.toLowerCase().replace(/&/g, "-and-").replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-").replace(/^-|-$/g, "")).join("/");
  var MONTHS = {
    de: ["januar", "februar", "m\xE4rz", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "dezember"],
    en: ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
  };
  var iso = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  function isoDate(text) {
    const t = clean(text).toLowerCase();
    let m = t.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (m) return iso(m[3], m[2], m[1]);
    m = t.match(/(\d{1,2})\.(\d{1,2})\.(\d{2})(?!\d)/);
    if (m) return iso(`20${m[3]}`, m[2], m[1]);
    const month = (name) => {
      const all = [...MONTHS.de, ...MONTHS.en];
      const i = all.findIndex((x) => name.startsWith(x.slice(0, 3)));
      return i < 0 ? 0 : i % 12 + 1;
    };
    m = t.match(/(\d{1,2})\.?\s+([a-zäöü]+)\s+(\d{4})/);
    if (m && month(m[2])) return iso(m[3], month(m[2]), m[1]);
    m = t.match(/([a-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
    if (m && month(m[1])) return iso(m[3], month(m[1]), m[2]);
    return "";
  }
  function creditsOf(wrapper) {
    const lines = [...wrapper || []].flatMap((w) => [...w.querySelectorAll("p")]).flatMap((p) => p.innerHTML.split(/<br\s*\/?>/i).map((h) => clean(h.replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&")))).filter(Boolean);
    const dated = lines.find((l) => /publi|veröffentlicht/i.test(l) && isoDate(l)) || lines.find((l) => l.length < 80 && isoDate(l)) || "";
    const by = lines.find((l) => /^[^:]{0,30}\b(text|autor|author)\b[^:]{0,30}:/i.test(l)) || "";
    const author = by.replace(/^[^:]+:\s*/, "").split(/\s+(?:fotos?|photos?|bilder|images?|illustrations?|video)\s*:/i)[0].trim();
    return { date: isoDate(dated), author, lines };
  }
  var table = (document, name, rows) => WebImporter.Blocks.createBlock(document, { name, cells: rows });
  function picture(document, img) {
    var _a;
    if (!img) return null;
    const sources = [...((_a = img.closest("picture")) == null ? void 0 : _a.querySelectorAll("source[srcset]")) || []].map((s) => s.getAttribute("srcset"));
    const asset = [img.getAttribute("src"), img.getAttribute("data-src"), ...sources].map(assetOf).find(Boolean);
    if (!asset) return null;
    const out = document.createElement("img");
    out.setAttribute("src", `${ORIGIN}${encodeURI(asset)}`);
    const alt = clean(img.getAttribute("alt"));
    out.setAttribute("alt", /\.(jpe?g|png|gif|webp)$/i.test(alt) ? "" : alt);
    return out;
  }
  var para = (document, ...nodes) => {
    const p = document.createElement("p");
    nodes.filter(Boolean).forEach((n) => p.append(n));
    return p;
  };
  function imageOf(document, el) {
    var _a, _b;
    const img = picture(document, el.querySelector("img"));
    if (!img) return [];
    const out = [para(document, img)];
    const caption = clean((_a = el.querySelector(".caption-wrapper")) == null ? void 0 : _a.textContent);
    const credit = clean((_b = el.querySelector(".dynamic-image-copyright")) == null ? void 0 : _b.textContent).replace(/^©\s*|\s*©$/g, "");
    if (caption || credit) {
      const em = document.createElement("em");
      em.textContent = [caption, credit ? `\xA9 ${credit}` : ""].filter(Boolean).join(" ");
      out.push(para(document, em));
    }
    return out;
  }
  function teaserOf(el) {
    var _a, _b;
    const a = el.querySelector("a[href]");
    return {
      href: a ? a.getAttribute("href") : "",
      title: clean((_a = el.querySelector("h3, h2")) == null ? void 0 : _a.textContent),
      label: clean((_b = el.querySelector(".teaser-label")) == null ? void 0 : _b.textContent),
      img: el.querySelector("img")
    };
  }
  function cardRows(document, teasers) {
    return teasers.filter((t) => t.href && t.title).map((t) => {
      const content = [];
      if (t.label) content.push(para(document, document.createTextNode(t.label)));
      const h = document.createElement("h3");
      const a = document.createElement("a");
      a.setAttribute("href", t.href);
      a.textContent = t.title;
      h.append(a);
      content.push(h);
      return [picture(document, t.img) || "", content];
    });
  }
  function commonParent(hrefs) {
    const parts = hrefs.filter(Boolean).map((h) => h.replace(/^https?:\/\/[^/]+/, "").split("?")[0].split("/").slice(0, -1));
    if (!parts.length) return "";
    const out = [];
    for (let i = 0; i < parts[0].length; i += 1) {
      if (parts.every((p) => p[i] === parts[0][i])) out.push(parts[0][i]);
      else break;
    }
    return out.join("/");
  }
  function bodyOf(document, body, out) {
    const walk = (node) => {
      [...node.children].forEach((el) => {
        var _a, _b, _c, _d, _e, _f, _g;
        const cls = el.classList;
        if (el.id && /div-inside-pos|tatm-div/.test(el.id)) return;
        if (cls.contains("teasercontainer") || cls.contains("advertisement")) return;
        if (/^(P|H2|H3|H4|H5|H6|UL|OL)$/.test(el.tagName)) {
          if (!clean(el.textContent) && !el.querySelector("img")) return;
          const c = el.cloneNode(true);
          c.removeAttribute("class");
          c.querySelectorAll("[class]").forEach((x) => x.removeAttribute("class"));
          let inner = c.innerHTML;
          for (let k = 0; k < 3; k += 1) {
            inner = inner.replace(/<(i|em|u|span)>(?:\s|&nbsp;)*<\/\1>/gi, " ").replace(/<(i|em|u|span)>\s*<br\s*\/?>\s*<\/\1>/gi, "<br>").replace(/<br\s*\/?>\s*<\/(b|strong|i|em|u|span)>/gi, "</$1><br>");
          }
          const lead = c.tagName === "P" && inner.match(/^\s*(<(b|strong)>[\s\S]*?<\/\2>)\s*<br>\s*([\s\S]*\S[\s\S]*)$/i);
          if (lead) {
            const [, bold, , rest] = lead;
            const head = document.createElement("p");
            head.innerHTML = bold;
            out.push(head);
            inner = rest;
          }
          c.innerHTML = inner;
          c.querySelectorAll("a").forEach((a) => {
            const href = (a.getAttribute("href") || "").trim();
            if (!href) {
              a.replaceWith(...a.childNodes);
              return;
            }
            [...a.attributes].map((x) => x.name).filter((n) => n !== "href").forEach((n) => a.removeAttribute(n));
            const below = href.match(/^(?:https?:\/\/(?:www\.)?swiss\.com)?\/magazine\/.*\/((?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,})$/i);
            if (below && !/\.(html?|pdf|jpe?g|png|gif|svg|webp|mp4|zip|docx?|xlsx?|pptx?|txt|json|xml|ics)$/i.test(below[1])) {
              a.setAttribute("href", `https://${below[1]}`);
              return;
            }
            if (/^(https?:|\/|#|mailto:|tel:)/i.test(href)) return;
            let bare = href;
            try {
              bare = decodeURIComponent(href);
            } catch (e) {
            }
            bare = bare.replace(/[\s\u00AD]+/g, "");
            if (/^[^\s/:@]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(bare)) a.setAttribute("href", `mailto:${bare}`);
            else if (/^(www\.)?[\p{L}0-9-]+(\.[\p{L}0-9-]+)*\.[a-z]{2,}(\/|$)/iu.test(bare)) a.setAttribute("href", `https://${bare}`);
            else a.replaceWith(...a.childNodes);
          });
          out.push(c);
          return;
        }
        if (cls.contains("dynamic-image-component")) {
          out.push(...imageOf(document, el));
          return;
        }
        if (cls.contains("quote") || el.querySelector(":scope > .quote")) {
          const q = cls.contains("quote") ? el : el.querySelector(":scope > .quote");
          const text = clean((_a = q.querySelector(".quote-text")) == null ? void 0 : _a.textContent);
          const who = [clean((_b = q.querySelector(".quote-source-author")) == null ? void 0 : _b.textContent), clean((_c = q.querySelector(".quote-source-description")) == null ? void 0 : _c.textContent)].filter(Boolean).join(", ");
          if (text) out.push(table(document, "quote", [[text, who]]));
          return;
        }
        if (cls.contains("teasercarousel") || cls.contains("image-series")) {
          const rows = [...el.querySelectorAll(".dynamic-image-component")].map((d) => {
            var _a2;
            const img = picture(document, d.querySelector("img"));
            return img ? [img, clean((_a2 = d.querySelector(".caption-wrapper")) == null ? void 0 : _a2.textContent)] : null;
          }).filter(Boolean);
          if (rows.length) out.push(table(document, "carousel-images", rows));
          return;
        }
        if (cls.contains("js-video-component") || cls.contains("video")) {
          const src = ((_d = el.querySelector("iframe")) == null ? void 0 : _d.getAttribute("src")) || "";
          if (/youtube/.test(src)) {
            const a = document.createElement("a");
            const [href] = src.split("?");
            a.setAttribute("href", href);
            a.textContent = href;
            out.push(table(document, "embed", [[a]]));
            const caption = clean((_e = el.querySelector(".video-caption")) == null ? void 0 : _e.textContent);
            if (caption) {
              const em = document.createElement("em");
              em.textContent = caption;
              out.push(para(document, em));
            }
          }
          return;
        }
        if (cls.contains("js-map-component") || cls.contains("map")) {
          const src = ((_f = el.querySelector("iframe")) == null ? void 0 : _f.getAttribute("src")) || "";
          if (/google\.com\/maps\/embed/.test(src)) {
            const a = document.createElement("a");
            a.setAttribute("href", src);
            a.textContent = src;
            out.push(table(document, "embed", [[a]]));
            const caption = clean((_g = el.querySelector(".map-caption")) == null ? void 0 : _g.textContent);
            if (caption) {
              const em = document.createElement("em");
              em.textContent = caption;
              out.push(para(document, em));
            }
          }
          return;
        }
        if (cls.contains("button-component")) {
          const a = el.querySelector("a[href]");
          if (a) {
            const link = document.createElement("a");
            link.setAttribute("href", a.getAttribute("href"));
            link.textContent = clean(a.textContent);
            const strong = document.createElement("strong");
            strong.append(link);
            out.push(para(document, strong));
          }
          return;
        }
        if (cls.contains("teaserlist")) {
          const rows = cardRows(document, [...el.querySelectorAll("article.teaser")].map(teaserOf));
          if (rows.length) out.push(table(document, "carousel-cards (grid)", rows));
          return;
        }
        walk(el);
      });
    };
    walk(body);
  }
  function transformPage(document, wwwPath) {
    var _a, _b, _c, _d, _e, _f;
    const main = document.createElement("div");
    const lang = wwwPath.split("/")[2] || "de";
    const meta = {};
    const intro = document.querySelector(".m-article-intro");
    const crumbs = [...document.querySelectorAll(".cmp-breadcrumb__item-link, .breadcrumb a")].map((a) => clean(a.textContent));
    if (intro) {
      const heroImg = picture(document, document.querySelector(".header-component-wrapper img"));
      const h1 = document.createElement("h1");
      h1.textContent = clean((_a = intro.querySelector("h1")) == null ? void 0 : _a.textContent);
      const lead2 = [...intro.querySelectorAll(".lead p, .lead")].filter((p) => p.tagName === "P").map((p) => para(document, document.createTextNode(clean(p.textContent)))).filter((p) => p.textContent);
      main.append(table(document, "article-header", [[heroImg || ""], [[h1, ...lead2]]]));
      if (lead2.length) meta.description = lead2.map((p) => clean(p.textContent)).join(" ");
      const out = [];
      const body = document.querySelector(".m-article-body");
      if (body) bodyOf(document, body, out);
      out.forEach((n) => main.append(n));
      const credits = creditsOf(document.querySelectorAll(".credits__wrapper"));
      const related = document.querySelector(".js-related-stories");
      if (related) {
        main.append(document.createElement("hr"));
        const h2 = document.createElement("h2");
        h2.textContent = clean((_b = related.querySelector("h2")) == null ? void 0 : _b.textContent).replace(/:$/, "") || (lang === "de" ? "Weitere Beitr\xE4ge" : "More stories");
        main.append(h2, table(document, "related-articles", [[""]]));
      }
      const tags = [...intro.querySelectorAll(".article-tags a")];
      if (tags.length) {
        meta.tags = tags.map((a) => clean(a.textContent).replace(/^#/, "")).join(", ");
        meta["tag-ids"] = tags.map((a) => ((a.getAttribute("href") || "").match(/[?&]tag=([^&]+)/) || [])[1]).filter(Boolean).join(", ");
      }
      const depth = wwwPath.split("/").filter(Boolean).length;
      meta["page-type"] = depth >= 5 ? "article" : "page";
      if (crumbs.length >= 2) meta.category = crumbs[crumbs.length - 1];
      if (credits.date) meta["publication-date"] = credits.date;
      if (credits.author) meta.author = credits.author;
      if (heroImg) {
        meta["card-image"] = heroImg.cloneNode(true);
        meta["card-image-alt"] = heroImg.getAttribute("alt") || h1.textContent;
      }
    } else {
      meta["page-type"] = "overview";
      const stage = document.querySelector(".header-component-wrapper");
      const head = stage && stage.querySelector(".head h1 a[href]");
      if (head) {
        const h1 = document.createElement("h1");
        const a = document.createElement("a");
        a.setAttribute("href", head.getAttribute("href"));
        a.textContent = clean(head.textContent);
        h1.append(a);
        const label = clean((_c = stage.querySelector(".head .tags .teaser-label")) == null ? void 0 : _c.textContent);
        const content = [...label ? [para(document, document.createTextNode(label))] : [], h1];
        main.append(table(document, "hero-card-overlay", [[picture(document, stage.querySelector("img")) || ""], [content]]));
      }
      document.querySelectorAll(".topstoriescarousel, .root > .aem-Grid > .carousel").forEach((c) => {
        var _a2;
        const rows2 = cardRows(document, [...c.querySelectorAll(".swiper-slide")].map(teaserOf));
        if (!rows2.length) return;
        const h2 = document.createElement("h2");
        h2.textContent = clean((_a2 = c.querySelector("h2")) == null ? void 0 : _a2.textContent);
        if (h2.textContent) main.append(h2);
        main.append(table(document, "carousel-cards", rows2));
      });
      const containers = [...document.querySelectorAll("section.teasercontainer, .main-container .teasercontainer:not(.js-related-stories)")];
      containers.forEach((c) => {
        var _a2;
        const teasers = [...c.querySelectorAll("article.teaser")].map(teaserOf).filter((t) => t.href);
        const title2 = clean((_a2 = c.querySelector("h2")) == null ? void 0 : _a2.textContent);
        const own = containers.length === 1 && !title2;
        const path = own ? wwwPath : commonParent(teasers.map((t) => t.href));
        if (!path) return;
        if (title2) {
          const h2 = document.createElement("h2");
          const link = document.createElement("a");
          link.setAttribute("href", path);
          link.textContent = title2;
          h2.append(link);
          main.append(h2);
        }
        const rows2 = [["Path", path], ["Page size", String(own ? 12 : Math.max(teasers.length, 1))], ["Hide filter", "true"]];
        if (!own) rows2.push(["Load more", "false"]);
        main.append(table(document, "blog-overview (grid)", rows2));
      });
      if (!containers.length) {
        const out = [];
        const mc = document.querySelector(".main-container");
        if (mc) bodyOf(document, mc, out);
        out.forEach((n) => main.append(n));
        meta["page-type"] = "page";
      }
    }
    const title = clean((_d = document.querySelector("head > title")) == null ? void 0 : _d.textContent);
    const description = clean((_e = document.querySelector('head > meta[name="description"]')) == null ? void 0 : _e.getAttribute("content"));
    const robots = clean((_f = document.querySelector('head > meta[name="robots"]')) == null ? void 0 : _f.getAttribute("content"));
    const _g = meta, { description: lead } = _g, rest = __objRest(_g, ["description"]);
    const rows = [["Title", title], ["Description", description || lead], ...Object.entries(rest), ["nav", `/magazine/${lang}/nav`], ["footer", `/magazine/${lang}/footer`]];
    if (/noindex/i.test(robots)) rows.push(["Robots", robots]);
    main.append(table(document, "Metadata", rows.filter(([, v]) => v)));
    return main;
  }
  var tmp_bundle_magazine_default = {
    transform: ({ document, params }) => {
      const wwwPath = new URL(params.originalURL).pathname.replace(/\.html?$/, "").replace(/\/$/, "");
      const main = transformPage(document, wwwPath);
      collapseMain(main, { path: docName(wwwPath), brand: "swiss", document });
      return [{
        element: main,
        path: docName(wwwPath),
        report: { title: document.title, template: "magazine" }
      }];
    }
  };
  return __toCommonJS(tmp_bundle_magazine_exports);
})();
