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

  // tools/importer/import-homepage.js
  var tmp_bundle_homepage_450922_exports = {};
  __export(tmp_bundle_homepage_450922_exports, {
    default: () => tmp_bundle_homepage_450922_default
  });

  // tools/importer/parsers/flash-teaser.js
  var ALERTS = ["irreg", "tech-outage"];
  function wwwMessages(element) {
    const el = element.querySelector(".dcep-flash-teaser[data-dcep]");
    if (!el) return [];
    try {
      const data = JSON.parse(el.getAttribute("data-dcep"));
      return Array.isArray(data.flashTeaserMessages) ? data.flashTeaserMessages : [];
    } catch (e) {
      return [];
    }
  }
  function parse(element, { document }) {
    const types = wwwMessages(element).map((m) => String(m && m.type || "").trim().toLowerCase());
    const promotionsOnly = types.length > 0 && types.includes("promo") && !types.some((t) => ALERTS.includes(t));
    const cells = promotionsOnly ? [["Types", "promo"]] : [];
    const block = WebImporter.Blocks.createBlock(document, { name: "flash-teaser", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/flight-search-picker.js
  var TEXTS = {
    en: {
      "Children label": "Children",
      "Children hint": "(2-11 years)",
      "Infants label": "Infants without seat",
      "Infants hint": "(0-23 months)",
      group: "Group bookings for 10 or more passengers."
    },
    de: {
      "Children label": "Kinder",
      "Children hint": "(2-11 Jahre)",
      "Infants label": "Kleinkinder ohne Sitzplatz",
      "Infants hint": "(0-23 Monate)",
      // www's traveller line: "Economy, 1 Reisende(r)" (the block's default: "1 Reisender")
      "Traveller summary": "{CABIN}, {COUNT} Reisende(r)",
      group: "Gruppenbuchungen f\xFCr zehn oder mehr Passagiere."
    }
  };
  function groupTravelPath(url, root = "") {
    let p = String(url || "").trim();
    if (!p) return "";
    try {
      p = new URL(p, "https://www.lufthansa.com").pathname;
    } catch (e) {
      return "";
    }
    const gc = p.match(/^\/content\/[a-z0-9-]+\/gc\/[a-z]{2}(\/.*)?$/);
    if (gc) {
      if (!/^\/[a-z]{2}\/[a-z]{2}$/.test(root)) return "";
      p = `${root}${gc[1] || ""}`;
    }
    p = p.replace(/^\/content\/[a-z0-9-]+\/markets(?=\/)/, "").replace(/\.html$/, "").replace(/(.)\/$/, "$1");
    if (/^\/[a-z]{2}\/[a-z]{2}$/.test(p)) return `${p}/group-travel`;
    return p.replace(/^(\/[a-z]{2}\/[a-z]{2})\/book-and-manage\/group-travel$/, "$1/group-travel");
  }
  var YOUNG_ADULTS = { "gb/en": "GB", "gb/de": "GB", "de/de": "GB" };
  function pickerRows({
    lang,
    groupBookingsUrl,
    labels = null,
    groupText = "",
    root = ""
  } = {}) {
    const recorded = TEXTS[lang] || (lang ? {} : TEXTS.en);
    const t = labels ? __spreadValues(__spreadValues({}, TEXTS[lang] || {}), labels) : recorded;
    const market = String(groupBookingsUrl || "").match(/\/markets\/([a-z]{2})\/([a-z]{2})\//);
    const young = market && YOUNG_ADULTS[`${market[1]}/${market[2]}`];
    const rows = [["Passenger picker", "yes"], ["Adults hint", ""]];
    if (young) rows.push(["Young adults", young]);
    Object.entries(t).forEach(([k, v]) => {
      if (k !== "group") rows.push([k, v]);
    });
    const href = groupTravelPath(groupBookingsUrl, root);
    const text = groupText || recorded.group;
    if (href && text) rows.push(["Group booking", { href, text }]);
    rows.push(["Fare preference", "yes"]);
    return rows;
  }
  var LABEL_KEYS = {
    "Children label": "common.booking.children.label",
    "Children hint": "common.booking.children.hint",
    "Infants label": "common.booking.infants.label",
    "Infants hint": "common.booking.infants.hint"
  };
  function pageBookingLabels(html) {
    const out = {};
    Object.entries(LABEL_KEYS).forEach(([row, key]) => {
      const m = String(html || "").match(new RegExp(`"${key.replace(/\./g, "\\.")}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
      if (!m) return;
      try {
        out[row] = JSON.parse(`"${m[1]}"`).replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
      } catch (e) {
      }
    });
    return Object.keys(out).length === 4 ? out : null;
  }

  // tools/importer/parsers/flight-search.js
  function parse2(element, { document, url, params } = {}) {
    const SR_ONLY2 = ".sr-only, .visually-hidden, maui-screen-reader-label";
    const clean3 = (s) => (s || "").replace(/[​-‍﻿]/g, "").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const clone = node.cloneNode(true);
      clone.querySelectorAll(SR_ONLY2).forEach((n) => n.remove());
      return clean3(clone.textContent);
    };
    const attr = (node, name2) => clean3(node ? node.getAttribute(name2) : "");
    let props = {};
    const propsHost = element.querySelector("[data-dcep]") || (element.hasAttribute("data-dcep") ? element : null);
    if (propsHost) {
      try {
        props = JSON.parse(propsHost.getAttribute("data-dcep")) || {};
      } catch (e) {
        props = {};
      }
    }
    const cells = [];
    const addRow = (key, value) => {
      if (value === null || value === void 0) return;
      if (typeof value === "string" && !value) return;
      cells.push([key, value]);
    };
    const tabs = [...element.querySelectorAll('.tab-nav .tab-link, .tab-nav [role="tab"]')].filter((t, i, all) => all.indexOf(t) === i).map((t) => visibleText(t) || attr(t, "aria-label")).filter(Boolean);
    addRow("Tabs", [...new Set(tabs)].join(", "));
    const tripWrapper = element.querySelector(".triptype-dropdown-wrapper");
    const tripButton = tripWrapper && tripWrapper.querySelector("button.dropdown-button, button");
    const selectedTrip = visibleText(tripButton && (tripButton.querySelector(".dropdown-content") || tripButton));
    let tripTypes = tripWrapper ? [...tripWrapper.querySelectorAll('ul li, [role="option"]')].map(visibleText).filter(Boolean) : [];
    if (!tripTypes.length && selectedTrip) tripTypes = [selectedTrip];
    addRow("Trip types", [...new Set(tripTypes)].join(", "));
    if (tripTypes.length > 1) addRow("Default trip type", selectedTrip);
    addRow("Traveller label", visibleText(element.querySelector(".travel-details-opener")));
    if (element.querySelector(".travel-details-opener")) {
      let labels = null;
      try {
        labels = JSON.parse(document.body.getAttribute("data-lh-booking-labels") || "null");
      } catch (e) {
        labels = null;
      }
      if (!labels) {
        const state = [...document.querySelectorAll("script")].map((sc) => sc.textContent).find((t) => t.includes("common.booking.children.label"));
        labels = state ? pageBookingLabels(state) : null;
      }
      const groupLink = element.querySelector(".group-booking-link") || document.querySelector(".travel-details .group-booking-link, .group-booking-link");
      const groupText = groupLink ? visibleText(groupLink) : "";
      const groupUrl = groupLink && groupLink.getAttribute("href") || props.groupBookingsUrl;
      let root = "";
      try {
        root = (new URL(params && params.originalURL || url || "", "https://www.lufthansa.com").pathname.match(/^\/[a-z]{2}\/[a-z]{2}(?=\/|$)/) || [""])[0];
      } catch (e) {
        root = "";
      }
      const market = String(props.groupBookingsUrl || "").match(/\/markets\/[a-z]{2}\/([a-z]{2})(?=[/.]|$)/);
      const lang = root && root.slice(4) || market && market[1] || clean3(document.documentElement.getAttribute("lang")).slice(0, 2);
      pickerRows({
        lang,
        groupBookingsUrl: groupUrl,
        labels,
        groupText,
        root
      }).forEach(([key, value]) => {
        if (value === "") {
          cells.push([key, ""]);
          return;
        }
        if (typeof value === "string") {
          addRow(key, value);
          return;
        }
        const a = document.createElement("a");
        a.href = value.href;
        a.textContent = value.text;
        addRow(key, a);
      });
    }
    addRow("Nonstop label", visibleText(element.querySelector(".btn-nonstop-only .custom-control-description")));
    const airportFields = [...element.querySelectorAll(".autocomplete-airport")];
    const originField = element.querySelector(".retracted-field-origin .autocomplete-airport") || airportFields[0];
    const destinationField = airportFields.find((f) => f !== originField);
    const fieldValue = (field) => attr(field && field.querySelector('input:not([type="hidden"])'), "value");
    const withCode = (value) => /\([A-Za-z]{3}\)/.test(value) || /^[A-Za-z]{3}$/.test(value) ? value : "";
    addRow("Default origin", withCode(clean3(props.prefilledOrigin)) || withCode(fieldValue(originField)));
    addRow("Default destination", withCode(clean3(props.prefilledDestination)) || withCode(fieldValue(destinationField)));
    const picture = (src) => {
      if (!/^\/content\/dam\//.test(clean3(src))) return null;
      const pic = document.createElement("picture");
      const img = document.createElement("img");
      img.src = `https://www.lufthansa.com${encodeURI(decodeURI(clean3(src)))}`;
      img.alt = "";
      pic.append(img);
      return pic;
    };
    addRow("Background image", picture(props.backgroundImageL));
    addRow("Background image mobile", picture(props.backgroundImageS));
    if (/^[A-Za-z]$/.test(clean3(props.prefilledCabinClass))) addRow("Cabin", clean3(props.prefilledCabinClass).toUpperCase());
    const wwf = element.querySelector(".flma-where-we-fly-wrapper [href]");
    if (wwf && visibleText(wwf)) {
      const a = document.createElement("a");
      a.href = wwf.getAttribute("href");
      a.textContent = visibleText(wwf);
      addRow("Where we fly", a);
    }
    const activeLabel = visibleText(element.querySelector('.tab-nav .tab-link.tab-active, .tab-nav [role="tab"][aria-selected="true"]'));
    if (tabs.length > 1 && activeLabel && activeLabel !== tabs[0]) addRow("Active tab", activeLabel);
    const hotel = element.querySelector('.tab-content[id$="-hotel-section"], [role="tabpanel"][id$="-hotel-section"]');
    if (hotel) {
      const [location, checkIn, checkOut] = [...hotel.querySelectorAll("maui-input")];
      addRow("Location label", attr(location, "label"));
      addRow("Location hint", attr(location, "hint"));
      addRow("Location error", attr(location, "errormessage"));
      addRow("Check-in label", attr(checkIn, "label"));
      addRow("Check-in hint", attr(checkIn, "hint"));
      addRow("Check-out label", attr(checkOut, "label"));
      addRow("Check-out hint", attr(checkOut, "hint"));
      addRow("Hotel footnote", visibleText(hotel.querySelector(".footnote")));
      addRow("Hotel submit label", visibleText(hotel.querySelector('maui-button[behavior="submit"], button[type="submit"]')));
      addRow("Hotel external note", visibleText(hotel.querySelector('maui-tooltip [slot="box"]')));
      addRow("Close label", attr(hotel.querySelector(".btn-close [aria-label]"), "aria-label"));
    }
    const standalone = element.querySelector(".flm-standalone") && !element.querySelector(".flma-hp-evolution-design");
    const name = standalone ? "flight-search (standalone)" : "flight-search";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-card-overlay.js
  function parse3(element, { document }) {
    const SR_ONLY2 = ".sr-only, .visually-hidden, maui-screen-reader-label";
    const clean3 = (s) => (s || "").replace(/[​-‍﻿]/g, "").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const clone = node.cloneNode(true);
      clone.querySelectorAll(SR_ONLY2).forEach((n) => n.remove());
      return clean3(clone.textContent);
    };
    const isBroken3 = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src);
    const cells = [];
    const stage = element.querySelector(".stage-teaser");
    const stageLink = stage && stage.querySelector("a.stage-teaser-link[href]");
    if (stageLink) {
      const img2 = [...stage.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")));
      let imageCell = "";
      if (img2) {
        imageCell = document.createElement("img");
        imageCell.src = img2.getAttribute("src");
        imageCell.alt = img2.getAttribute("alt") || "";
      }
      const content2 = [];
      const heading = visibleText(stage.querySelector(".stage-teaser-headline"));
      if (heading) {
        const h2 = document.createElement("h2");
        h2.textContent = heading;
        content2.push(h2);
      }
      const sub = visibleText(stage.querySelector(".stage-teaser-subheadline"));
      if (sub) {
        const p = document.createElement("p");
        p.textContent = sub;
        content2.push(p);
      }
      const label = visibleText(stage.querySelector("maui-button-mimic")) || heading;
      if (label) {
        const p = document.createElement("p");
        const em = document.createElement("em");
        const a = document.createElement("a");
        a.href = stageLink.getAttribute("href");
        a.textContent = label;
        em.append(a);
        p.append(em);
        content2.push(p);
      }
      element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "hero-card-overlay", cells: [[imageCell], [content2]] }));
      return;
    }
    const img = [...element.querySelectorAll(".mst-bg-img img, .moving-image img, img")].find((i) => !isBroken3(i.getAttribute("src")) && !i.closest(".mst-card"));
    if (img) {
      const image = document.createElement("img");
      image.src = img.getAttribute("src");
      image.alt = img.getAttribute("alt") || "";
      cells.push([image]);
    }
    const card = element.querySelector(".mst-card") || element;
    const content = [];
    const eyebrowText = visibleText(card.querySelector(".mst-title"));
    if (eyebrowText) {
      const p = document.createElement("p");
      p.textContent = eyebrowText;
      content.push(p);
    }
    const headingSource = card.querySelector(".display-text, h1, h2, h3");
    const headingText2 = visibleText(headingSource);
    if (headingText2) {
      const h = document.createElement(headingSource && /^H[1-3]$/.test(headingSource.tagName) ? headingSource.tagName : "h2");
      h.textContent = headingText2;
      content.push(h);
    }
    card.querySelectorAll(".mst-text, .mst-description, .mst-card p").forEach((t) => {
      const text = visibleText(t);
      if (text && text !== eyebrowText && text !== headingText2) {
        const p = document.createElement("p");
        p.textContent = text;
        content.push(p);
      }
    });
    const seen = /* @__PURE__ */ new Set();
    card.querySelectorAll("maui-navigation-link[href], maui-button-link[href], maui-button[href], maui-link-button[href], a[href]").forEach((l) => {
      if ([...seen].some((s) => s.contains(l))) return;
      const label = visibleText(l);
      const href = l.getAttribute("href");
      if (!label || !href) return;
      seen.add(l);
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      const type = (l.getAttribute("type") || "").toLowerCase();
      let wrapped = a;
      if (l.matches("maui-button-link, maui-button") && (type === "secondary" || type === "primary")) {
        wrapped = document.createElement(type === "secondary" ? "em" : "strong");
        wrapped.append(a);
      }
      p.append(wrapped);
      content.push(p);
    });
    if (content.length) cells.push([content]);
    let teaser = {};
    const propsHost = element.matches("[data-dcep]") ? element : element.querySelector("[data-dcep]");
    try {
      teaser = (JSON.parse(propsHost ? propsHost.getAttribute("data-dcep") : "{}") || {}).promotionTeaser || {};
    } catch (e) {
      teaser = {};
    }
    const trigger = card.querySelector('.termsandcondition, maui-link-button[variant="dialog"]');
    const terms = teaser.termsAndConditions || {};
    const triggerLabel = visibleText(trigger);
    if (triggerLabel && terms.content) {
      const conditions = [];
      const title = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = triggerLabel;
      title.append(strong);
      conditions.push(title);
      if (clean3(terms.headline)) {
        const headline = document.createElement("p");
        const b = document.createElement("strong");
        b.textContent = clean3(terms.headline);
        headline.append(b);
        conditions.push(headline);
      }
      const holder = document.createElement("div");
      holder.innerHTML = terms.content;
      holder.querySelectorAll("p, li").forEach((node) => {
        if (!visibleText(node)) return;
        const p = document.createElement("p");
        p.innerHTML = node.innerHTML;
        conditions.push(p);
      });
      cells.push(["Conditions", conditions]);
    }
    const variants = [];
    if (card.classList.contains("align-self-end") || clean3(teaser.alignment).toLowerCase() === "right") variants.push("right");
    if (teaser.displayImageOnMobile === false) variants.push("no mobile image");
    if (card.classList.contains("non-inverted") || teaser.isInverted === false) variants.push("light");
    const name = variants.length ? `Hero Card Overlay (${variants.join(", ")})` : "hero-card-overlay";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/fare-teaser.js
  function parse4(element, { document }) {
    const SR_ONLY2 = ".sr-only, .visually-hidden, maui-screen-reader-label";
    const clean3 = (s) => (s || "").replace(/[​-‍﻿]/g, "").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const clone = node.cloneNode(true);
      clone.querySelectorAll(SR_ONLY2).forEach((n) => n.remove());
      return clean3(clone.textContent);
    };
    const attr = (node, name) => clean3(node ? node.getAttribute(name) : "");
    const code = (v) => /^[A-Za-z]{3}$/.test(clean3(v)) ? clean3(v).toUpperCase() : "";
    let props = {};
    const propsHost = element.querySelector("[data-dcep]") || (element.hasAttribute("data-dcep") ? element : null);
    if (propsHost) {
      try {
        props = JSON.parse(propsHost.getAttribute("data-dcep")) || {};
      } catch (e) {
        props = {};
      }
    }
    const routes = [...element.querySelectorAll(".fareteaser-recommendation")].map((card) => {
      const link = card.querySelector("a[href]");
      let params = new URLSearchParams();
      let url = null;
      if (link) {
        try {
          url = new URL(link.getAttribute("href"), "https://www.lufthansa.com/");
          params = url.searchParams;
        } catch (e) {
        }
      }
      return {
        url,
        origin: code(params.get("OriginCode")),
        originName: visibleText(card.querySelector(".fareteaser-recommendation-origin")),
        destination: code(params.get("DestinationCode")),
        destinationName: visibleText(card.querySelector(".fareteaser-recommendation-destination")),
        tripDuration: clean3(params.get("TripDuration")),
        cabin: clean3(params.get("Cabin"))
      };
    });
    const manual = Array.isArray(props.fareTeaserManualTravels) ? props.fareTeaserManualTravels : [];
    const named = (c, name) => c ? name ? `${name} (${c})` : c : "";
    const cells = [];
    const addRow = (key, value) => {
      if (value === null || value === void 0) return;
      if (typeof value === "string" && !value) return;
      if (Array.isArray(value) && !value.length) return;
      cells.push([key, value]);
    };
    const originCode = code(manual[0] && manual[0].origin) || (routes.find((r) => r.origin) || {}).origin || "";
    const originRoute = routes.find((r) => r.origin === originCode && r.originName);
    addRow("Origin", named(originCode, originRoute && originRoute.originName));
    const destCodes = manual.length ? manual.map((t) => code(t.destination)).filter(Boolean) : routes.map((r) => r.destination).filter(Boolean);
    const origins = [...new Set(manual.map((t) => code(t.origin)).filter(Boolean))];
    let destinations;
    if (origins.length > 1) {
      destinations = manual.filter((t) => code(t.origin) && code(t.destination)).map((t) => {
        const o = code(t.origin);
        const d = code(t.destination);
        const r = routes.find((x) => x.origin === o && x.destination === d) || routes.find((x) => x.destination === d) || {};
        const originName = (routes.find((x) => x.origin === o && x.originName) || {}).originName;
        return `${named(o, originName)} - ${named(d, r.destinationName)}`;
      });
    } else {
      destinations = [...new Set(destCodes)].map((c) => {
        const r = routes.find((x) => x.destination === c);
        return named(c, r && r.destinationName);
      });
    }
    addRow("Destinations", destinations.join(", "));
    const firstRoute = routes.find((r) => r.url) || {};
    addRow("Trip duration", clean3(String(props.tripDuration || "")) || firstRoute.tripDuration || "");
    addRow("Cabin", clean3(props.cabin) || firstRoute.cabin || "");
    const tripType = clean3(props.tripType).toUpperCase();
    if (tripType === "O") addRow("Trip type", "One way");
    const months = clean3(String(props.travelMonths || "")).split(/\s*,\s*/).filter((m) => /^(?:[1-9]|1[0-2])$/.test(m));
    addRow("Travel months", months.join(","));
    addRow("Price label", attr(element.querySelector("maui-price-display[label]"), "label"));
    if (firstRoute.url && !/^\/[a-z]{2}\/[a-z]{2}\/book-and-manage\/destination$/.test(firstRoute.url.pathname.replace(/\.html$/, ""))) {
      let pattern = `${firstRoute.url.origin}${firstRoute.url.pathname}${firstRoute.url.search}`;
      const swap = (value, token) => {
        if (value) pattern = pattern.split(`=${encodeURIComponent(value)}`).join(`=${token}`);
      };
      swap(firstRoute.origin, "{origin}");
      swap(firstRoute.destination, "{destination}");
      swap(firstRoute.tripDuration, "{duration}");
      swap(firstRoute.cabin, "{cabin}");
      if (pattern.includes("{origin}") || pattern.includes("{destination}")) addRow("Link", pattern);
    }
    const conditions = [];
    const footerText = clean3(props.footerText);
    if (footerText) {
      const p = document.createElement("p");
      p.textContent = footerText;
      conditions.push(p);
    }
    const trigger = element.querySelector(".disclaimerandconditions maui-link-button, .disclaimerandconditions button, .disclaimerandconditions a");
    const triggerLabel = visibleText(trigger);
    const triggerHref = trigger && trigger.getAttribute("href");
    if (triggerLabel) {
      const p = document.createElement("p");
      if (triggerHref && !triggerHref.startsWith("#")) {
        const a = document.createElement("a");
        a.href = triggerHref;
        a.textContent = triggerLabel;
        p.append(a);
      } else {
        const strong = document.createElement("strong");
        strong.textContent = triggerLabel;
        p.append(strong);
      }
      conditions.push(p);
    }
    if (trigger) {
      const dialogs = [...document.querySelectorAll("maui-modal")].filter((m) => !element.contains(m) && m.querySelector(":scope > .richtext") && !m.querySelector("maui-button, maui-button-link, form, input"));
      const owners = [...document.querySelectorAll(".disclaimerandconditions")].map((d) => d.closest('[class*="fareteaser"].section, .section') || d).filter((o, i, all) => all.indexOf(o) === i);
      const index = Math.max(0, owners.findIndex((o) => o === element || o.contains(element) || element.contains(o)));
      const dialog = dialogs[Math.min(index, dialogs.length - 1)];
      if (dialog) {
        dialog.querySelectorAll(".richtext p, .richtext li").forEach((node) => {
          const text = visibleText(node);
          if (!text) return;
          const p = document.createElement("p");
          p.innerHTML = node.innerHTML;
          p.querySelectorAll(SR_ONLY2).forEach((n) => n.remove());
          conditions.push(p);
        });
      }
    }
    addRow("Conditions", conditions);
    const headline = element.querySelector("maui-headline, h2, h3");
    const headingText2 = visibleText(headline) || clean3(props.headline);
    const block = WebImporter.Blocks.createBlock(document, { name: "fare-teaser", cells });
    if (headingText2) {
      const type = attr(headline, "type").toLowerCase();
      const level = /^h[1-6]$/.test(type) ? type : headline && /^H[1-6]$/.test(headline.tagName) ? headline.tagName.toLowerCase() : "h2";
      const heading = document.createElement(level);
      heading.textContent = headingText2;
      element.replaceWith(heading, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/cards-icon-text.js
  function parse5(element, { document }) {
    const clean3 = (s) => (s || "").replace(/[​-‍﻿]/g, "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
    const modules = [...element.querySelectorAll(".icon-module")];
    if (modules.length) {
      const cards = [];
      modules.forEach((m) => {
        const img = m.querySelector("img.icon-module__icon");
        if (!img || !img.getAttribute("src")) return;
        const icon = document.createElement("img");
        icon.src = img.getAttribute("src");
        icon.alt = clean3(img.getAttribute("alt"));
        const text = [];
        const title = clean3((m.querySelector(".icon-module__heading") || {}).textContent);
        if (title) {
          const h3 = document.createElement("h3");
          h3.textContent = title;
          text.push(h3);
        }
        const description = clean3((m.querySelector(".icon-module__description") || {}).textContent);
        if (description) {
          const p = document.createElement("p");
          p.textContent = description;
          text.push(p);
        }
        const cta = m.querySelector("a.icon-module__cta[href]");
        if (cta) {
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.href = cta.getAttribute("href");
          a.textContent = clean3(cta.textContent) || title;
          p.append(a);
          text.push(p);
        }
        if (text.length) cards.push([icon, text]);
      });
      if (cards.length) {
        const title = element.querySelector(":scope > .column-view > div:not(.row) > :is(h1, h2, h3, h4, h5, h6)");
        if (title && clean3(title.textContent)) element.before(title);
        element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "cards-icon-text", variants: ["stacked"], cells: cards }));
      }
      return;
    }
    const partners = [...element.querySelectorAll("a.teaser.partner")];
    if (!partners.length) return;
    const rows = [];
    partners.forEach((card) => {
      let iconCell = "";
      const img = card.querySelector("img.icon-svg, .image-wrapper img, img");
      const src = img && img.getAttribute("src");
      if (src && !/^(data|blob):/i.test(src)) {
        iconCell = document.createElement("img");
        iconCell.src = src;
        iconCell.alt = clean3(img.getAttribute("alt"));
      }
      const content = [];
      const title = clean3((card.querySelector(".teaser-heading-text") || card.querySelector(".teaser-heading, h1, h2, h3, h4, h5, h6") || {}).textContent);
      const href = card.getAttribute("href");
      if (title) {
        const h3 = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.textContent = title;
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        content.push(h3);
      }
      card.querySelectorAll(".teaser-description p").forEach((d) => {
        const t = clean3(d.textContent);
        if (!t || content.some((c) => c.textContent === t)) return;
        const p = document.createElement("p");
        p.textContent = t;
        content.push(p);
      });
      const more = [];
      const item = card.closest(".column-view-item");
      const teaserComp = item && [...item.children].find((c) => c.contains(card));
      if (item && teaserComp) {
        let after = false;
        [...item.children].forEach((comp) => {
          if (comp === teaserComp) {
            after = true;
            return;
          }
          if (!after) return;
          if (comp.classList.contains("text")) {
            comp.querySelectorAll(".richtext > p, .richtext > ul, .richtext > ol").forEach((n) => {
              const c = n.cloneNode(true);
              c.querySelectorAll(".sr-only, .visually-hidden, maui-screen-reader-label").forEach((x) => x.remove());
              if (clean3(c.textContent)) more.push(c);
            });
          } else if (comp.classList.contains("link")) {
            comp.querySelectorAll("maui-button-link[href], maui-navigation-link[href], maui-link[href], a[href]").forEach((m) => {
              const c = m.cloneNode(true);
              c.querySelectorAll(".sr-only, .visually-hidden, maui-screen-reader-label").forEach((x) => x.remove());
              const label = clean3(c.textContent) || clean3(m.getAttribute("label"));
              if (!label) return;
              const a = document.createElement("a");
              a.href = m.getAttribute("href");
              a.textContent = label;
              const para = document.createElement("p");
              const type = m.tagName === "MAUI-BUTTON-LINK" ? m.getAttribute("type") : null;
              if (type === "primary" || type === "secondary") {
                const wrap = document.createElement(type === "primary" ? "strong" : "em");
                wrap.append(a);
                para.append(wrap);
              } else {
                para.append(a);
              }
              more.push(para);
            });
          }
        });
      }
      if (!iconCell && !content.length && !more.length) return;
      rows.push([iconCell, content.length ? content : "", more.length ? more : ""]);
    });
    if (!rows.some((r) => r[2])) rows.forEach((r) => r.pop());
    const columnTitle = element.querySelector(":scope > .column-view > div:not(.row) > :is(h1, h2, h3, h4, h5, h6)");
    if (columnTitle && clean3(columnTitle.textContent)) element.before(columnTitle);
    const variants = element.matches(".fourcolumn") ? ["partner", "four-up"] : ["partner"];
    element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "cards-icon-text", variants, cells: rows }));
  }

  // tools/importer/parsers/video-sizes.js
  var video_sizes_default = {
    "/content/dam/four_y/videos/checkinvideo_de.mp4": [
      1920,
      1080
    ],
    "/content/dam/four_y/videos/checkinvideo_en.mp4": [
      1920,
      1080
    ],
    "/content/dam/four_y/videos/ocean_blue_video_v06.mp4": [
      1920,
      1150
    ],
    "/content/dam/lh/video/2024-muc-arrival-de.mp4": [
      1920,
      1080
    ],
    "/content/dam/lh/video/2024-muc-arrival-en.mp4": [
      1920,
      1080
    ],
    "/content/dam/lh/video/2024-muc-transfer-de.mp4": [
      1920,
      1080
    ],
    "/content/dam/lh/video/2024-muc-transfer-en.mp4": [
      1920,
      1080
    ],
    "/content/dam/lh/videos/100-years/crane/260316_lh_100y_muc_cube_moving_img_crane.mp4": [
      1920,
      1080
    ],
    "/content/dam/lh/videos/100-years/destinations/260415_LH100_60sec_16x9_ENG_Webmix_v01.mp4": [
      1920,
      1080
    ],
    "/content/dam/lh/videos/100-years/destinations/iconoclast_lufthansa100_60sec_16x9_DE_titled_master_webmix.mp4": [
      1920,
      1080
    ],
    "/content/dam/lh/videos/discover-lufthansa/new-onboard-experience/LH_OBX_2026_CulinarySpa_98s_ECO-PE-BUS_FIRST_1920x1080_DE_Agentur.mp4": [
      1920,
      1080
    ],
    "/content/dam/lh/videos/discover-lufthansa/new-onboard-experience/LH_OBX_2026_CulinarySpa_98s_ECO-PE-BUS_FIRST_1920x1080_EN.mp4": [
      1920,
      1080
    ],
    "/content/dam/lh/videos/prepare-for-your-trip/all-check-in/check-in-baggage/lh-bagdrop-self-check-in.mp4": [
      1920,
      1080
    ],
    "/content/dam/lh/videos/prepare-for-your-trip/baggage/carry-on-baggage/2026-lha-how-to-stow-de.mp4": [
      1920,
      1080
    ],
    "/content/dam/lh/videos/prepare-for-your-trip/baggage/carry-on-baggage/260721 LHA How to stow EN_7691080.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/art-design-fr/lh_art_clara_shanghai_90sec.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/art-design-france-2026/Lufthansa_ArtDesign_20_FRA_Antoine_E1_Master_Clean_260323_18h30.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/art-design-france-2026/Lufthansa_ArtDesign_2_0_FRA_Antoine_E2_Master_Clean_V02_260408_14h30.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/art-design-france-2026/Lufthansa_ArtDesign_2_0_FRA_Antoine_E3_Master_Clean_V1_260430.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/art-design-france-2026/Lufthansa_ArtDesign_2_0_FRA_Antoine_E4_Master_Clean_V1_260430.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/art-design-france-2026/Lufthansa_ArtDesign_2_0_UK_Jacob_E3_Master_Clean_V1_260430.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/art-design-it-2026/Lufthansa_ArtDesign_2_0_ITA_Elena_E1_Master_Clean_V2_260330_16h.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/art-design-it-2026/Lufthansa_ArtDesign_2_0_ITA_Elena_E2_Master_Clean_V01_260330_15h.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/art-design-it-2026/Lufthansa_ArtDesign_2_0_ITA_Elena_E3_Master_Clean_V1_260430.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/art-design-it-2026/Lufthansa_ArtDesign_2_0_ITA_Elena_E4_Master_Clean_V1_260430.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/art-design-italy/lh_art_italy_antonio_90sec.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/art-design-spain/lh_art_design_san_diego_diego_blanco_60sec.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/art-design-uk-2026/Lufthansa_ArtDesign_2_0_UK_Jacob_E1_Master_clean_V2_260401_13h.mp4": [
      3840,
      2160
    ],
    "/content/dam/video/c3/art-design-uk-2026/Lufthansa_ArtDesign_2_0_UK_Jacob_E2_Master_clean_V01_260401_13h.mp4": [
      3840,
      2160
    ],
    "/content/dam/video/c3/art-design-uk-2026/Lufthansa_ArtDesign_2_0_UK_Jacob_E4_Master_Clean_V1_260430.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/art-design-uk/lh_art_uk_san_diego_daniel_frost_90sec.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/campaigns/allegris-fashion/lh_fashion_france_mexico.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/campaigns/allegris-fashion/lh_fashion_italy_tokio_en.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/campaigns/allegris-fashion/lh_fashion_spain_johannesburg_en.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/campaigns/allegris-fashion/lh_fashion_uk_bengaluru_ov.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/campaigns/blog-allegris/01_video/allegris_master_en.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/campaigns/summer-push/01_video/lh_com_summerpush_anthem_en_16x9.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/c3/tag-pages/allegris/lh_allegris_20s_16x9.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/dbb/20-years-fct/241125_20_fct_de.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/nutcracker/ground-experience/2025-lh-pets-en.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/travel-briefing/chat-assistant-rebooking-lh/2025-chat-assistant-rebooking-de.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/travel-briefing/chat-assistant-rebooking-lh/2025-chat-assistant-rebooking-en.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/travel-briefing/chat-assistant-refund-lh/2025-lh-chat-assistant-refund-de.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/travel-briefing/chat-assistant-refund-lh/2025-lh-chat-assistant-refund-en.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/travel-briefing/damaged-baggage-lh/2025-lh-damaged-baggage-de.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/travel-briefing/damaged-baggage-lh/2025-lh-damaged-baggage-en.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/travel-briefing/delayed-baggage-lh/2025-lh-delayed-baggage-de.mp4": [
      1920,
      1080
    ],
    "/content/dam/video/travel-briefing/delayed-baggage-lh/2025-lh-delayed-baggage-en.mp4": [
      1920,
      1080
    ]
  };

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
  function videoSizeToken(src) {
    const path = String(src || "").trim().replace(/^https?:\/\/[^/]+/, "").split("/").map((seg) => {
      try {
        return decodeURIComponent(seg);
      } catch (e) {
        return seg;
      }
    }).join("/");
    const size = video_sizes_default[path];
    return size ? `size-${size[0]}x${size[1]}` : "";
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
    const size = videoSizeToken(src);
    if (size) settings.push(size);
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
    if (/^www\.(lufthansa|swiss)-inflightentertainment\.com$/.test(url.hostname) && /\/widgets\/?$/.test(url.pathname)) return url.href;
    if (url.protocol === "https:" && url.hostname === "www.google.com" && url.pathname === "/maps/embed" && url.searchParams.get("pb")) return url.href;
    if (url.hostname === "box.media-carrier.de" && url.protocol === "https:" && /^\/(home)?\/?$/.test(url.pathname)) return url.href;
    if (url.hostname === "lhg-network.com" && url.protocol === "https:" && url.pathname === "/") return url.href;
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

  // tools/importer/parsers/carousel-cards.js
  function parse6(element, { document }) {
    const SR_ONLY2 = ".sr-only, .visually-hidden, maui-screen-reader-label";
    const clean3 = (s) => (s || "").replace(/[​-‍﻿]/g, "").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const clone = node.cloneNode(true);
      clone.querySelectorAll(SR_ONLY2).forEach((n) => n.remove());
      return clean3(clone.textContent);
    };
    const isBroken3 = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src);
    const para = (text) => {
      const p = document.createElement("p");
      p.textContent = text;
      return p;
    };
    const loginCards = [...element.querySelectorAll(".login-oneid-card")];
    if (loginCards.length) {
      const intro = [];
      const form = element.querySelector(".dcep-login-form") || element;
      form.querySelectorAll(".richtext").forEach((rt) => {
        if (rt.closest(".login-oneid-card, maui-modal")) return;
        rt.querySelectorAll(":scope > p").forEach((p) => {
          const t = visibleText(p);
          if (t) intro.push(para(t));
        });
      });
      const rows = [];
      loginCards.forEach((card) => {
        const content = [];
        const headline = card.querySelector("maui-headline, h1, h2, h3, h4, h5, h6");
        const title = visibleText(headline);
        if (title) {
          const type = (headline.getAttribute("type") || headline.tagName).toLowerCase();
          const h = document.createElement(/^h[3-6]$/.test(type) ? type : "h3");
          h.textContent = title;
          content.push(h);
        }
        card.querySelectorAll(".richtext > p").forEach((p) => {
          const t = visibleText(p);
          if (t) content.push(para(t));
        });
        const BUTTONS = "maui-button-link, maui-button, a[href]";
        [...card.querySelectorAll(BUTTONS)].filter((b) => !b.parentElement.closest(BUTTONS)).forEach((btn) => {
          const label = visibleText(btn) || clean3(btn.getAttribute("label"));
          if (!label) return;
          const a = document.createElement("a");
          a.href = btn.getAttribute("href") || "#booking-code";
          a.textContent = label;
          const primary = btn.getAttribute("type") === "primary";
          const wrap = document.createElement(primary ? "strong" : "em");
          wrap.append(a);
          const p = document.createElement("p");
          p.append(wrap);
          content.push(p);
        });
        if (content.length) rows.push(["", content]);
      });
      const block2 = WebImporter.Blocks.createBlock(document, { name: "carousel-cards", variants: ["grid"], cells: rows });
      element.replaceWith(...intro, block2);
      return;
    }
    const viewers = [...element.querySelectorAll(".swiper-slide .videoViewer")].filter((v) => !v.closest(".swiper-slide-duplicate"));
    if (viewers.length && !element.querySelector("a.teaser, .wide-teaser, .compact-teaser")) {
      const rows = viewers.map((v) => viewerNodes(v, document)).filter((n) => n.length).map((n) => [n]);
      if (rows.length) element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "carousel-cards", variants: ["four-up"], cells: rows }));
      return;
    }
    const authors = [...element.querySelectorAll("a.author-slider-link")].filter((a) => !a.closest(".swiper-slide-duplicate"));
    if (authors.length) {
      const rows = authors.map((card) => {
        const img = [...card.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")));
        let imageCell = "";
        if (img) {
          imageCell = document.createElement("img");
          imageCell.src = img.getAttribute("src");
          imageCell.alt = img.getAttribute("alt") || "";
        }
        const content = [];
        const name = visibleText(card.querySelector(".author-name"));
        if (name) {
          const h = document.createElement("h3");
          const a = document.createElement("a");
          a.href = card.getAttribute("href");
          a.textContent = name;
          h.append(a);
          content.push(h);
        }
        const description = visibleText(card.querySelector(".author-description"));
        if (description) content.push(para(description));
        return imageCell || content.length ? [imageCell, content.length ? content : ""] : null;
      }).filter(Boolean);
      if (rows.length) element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "carousel-cards", variants: ["four-up", "authors"], cells: rows }));
      return;
    }
    if (element.matches(".authorslider") || element.querySelector(":scope > .dcep-author-slider")) {
      element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "carousel-cards", variants: ["four-up", "authors"], cells: [] }));
      return;
    }
    if (!element.querySelector(".wide-teaser, .compact-teaser") && element.querySelector(".teaser a.teaser, a.teaser.card")) {
      const MOBILE = ".hidden-lg-up, .hidden-md-up, .d-md-none, .d-lg-none";
      const hasDesktopTwin = !!element.querySelector(".hidden-md-down a.teaser, .hidden-sm-down a.teaser");
      const isArticle = !!element.closest(".article-details-page, .article-content");
      const view = element.querySelector(":scope > .column-view") || element.querySelector(".column-view") || element;
      const titles = [];
      [...element.matches(".carousel") && view === element ? [] : view.children].filter((d) => !d.classList.contains("row") && !d.classList.contains("carousel")).forEach((d) => d.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
        const t = visibleText(h);
        if (!t) return;
        const out = document.createElement(h.tagName.toLowerCase());
        out.textContent = t;
        const size = [...h.classList].find((c) => /^heading-/.test(c));
        if (size) out.className = size;
        titles.push(out);
      }));
      const cards = [...element.querySelectorAll("a.teaser")].filter((a) => !a.closest(".swiper-slide-duplicate") && !(hasDesktopTwin && a.closest(MOBILE)));
      const rows = [];
      cards.forEach((card) => {
        const img = [...card.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")));
        let imageCell = "";
        if (img) {
          const image = document.createElement("img");
          image.src = img.getAttribute("src");
          image.alt = img.getAttribute("alt") || "";
          imageCell = image;
        }
        const href = card.getAttribute("href");
        const content = [];
        const headingEl = card.querySelector(".teaser-heading, h1, h2, h3, h4, h5, h6");
        const heading = visibleText(headingEl);
        if (heading) {
          const level = headingEl && /^H[3-6]$/.test(headingEl.tagName) ? headingEl.tagName.toLowerCase() : "h3";
          const h = document.createElement(level);
          if (href) {
            const a = document.createElement("a");
            a.href = href;
            a.textContent = heading;
            h.append(a);
          } else {
            h.textContent = heading;
          }
          content.push(h);
        }
        const description = visibleText(card.querySelector(".teaser-description"));
        if (description) content.push(para(description));
        const cta = card.hasAttribute("data-import-cta") && visibleText(card.querySelector(".teaser-link-text"));
        if (cta && href) {
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.href = href;
          a.textContent = cta;
          p.append(a);
          content.push(p);
        }
        if (!imageCell && !content.length) return;
        rows.push([imageCell, content.length ? content : ""]);
      });
      let variants = [];
      if (isArticle) variants = ["article"];
      else if (element.querySelector(".swiper-multi-slide")) variants = ["four-up"];
      else if (element.matches(".fourcolumn")) variants = ["grid", "four-up"];
      else if (element.matches(".twocolumn, [data-import-two-up]")) variants = ["grid", "two-up"];
      else if (!element.matches(".carousel")) variants = ["grid"];
      const swiperDropped = element.matches("[data-lh-swiper-below-lg]") || !!element.querySelector("[data-lh-swiper-below-lg]");
      if (variants[0] === "grid" && variants.length === 1 && (hasDesktopTwin && element.querySelector(".hidden-lg-up a.teaser") || swiperDropped || element.hasAttribute("data-import-phone-slider"))) variants.push("phone-slider");
      else if (variants.join(" ") === "grid four-up" && element.hasAttribute("data-import-phone-slider")) variants.push("phone-slider");
      if (variants.includes("phone-slider") && element.querySelector(".experiencefragment .teaser, .cmp-experiencefragment .teaser")) variants.push("fragment-slides");
      const block2 = WebImporter.Blocks.createBlock(document, { name: "carousel-cards", variants, cells: rows });
      element.replaceWith(...titles, block2);
      return;
    }
    const teasers = [...element.querySelectorAll(".wide-teaser, .compact-teaser")].filter((t) => !t.closest(".swiper-slide-duplicate"));
    const cells = [];
    teasers.forEach((teaser) => {
      const wide = teaser.classList.contains("wide-teaser");
      const img = [...teaser.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")));
      let imageCell = "";
      if (img) {
        const image = document.createElement("img");
        image.src = img.getAttribute("src");
        image.alt = img.getAttribute("alt") || "";
        imageCell = image;
      }
      const content = [];
      const body = teaser.querySelector(".teaser-body") || teaser;
      const eyebrow = visibleText(body.querySelector(".teaser-title"));
      if (eyebrow) content.push(para(eyebrow));
      const headline = visibleText(body.querySelector(".teaser-headline, h2, h3, h4, h5"));
      if (headline) {
        const h = document.createElement("h3");
        h.textContent = headline;
        content.push(h);
      }
      const description = visibleText(body.querySelector(".teaser-description"));
      if (description) content.push(para(description));
      const cardLink = teaser.querySelector("a.wide-teaser-link[href], a.compact-teaser-link[href], a[href]");
      const mimic = body.querySelector(".teaser-link maui-link-mimic, .teaser-link a, maui-link-mimic");
      const ctaLabel = visibleText(mimic);
      const href = mimic && mimic.getAttribute("href") && mimic.getAttribute("href") !== "#" ? mimic.getAttribute("href") : cardLink && cardLink.getAttribute("href");
      if (href && href !== "#") {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = ctaLabel || headline || eyebrow;
        const p = document.createElement("p");
        p.append(a);
        content.push(p);
      }
      if (!imageCell && !content.length) return;
      cells.push([imageCell, content.length ? content : "", wide ? "wide" : "compact"]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/destination-finder.js
  function parseGrid(element, finder, document) {
    const SR_ONLY2 = ".sr-only, .visually-hidden, maui-screen-reader-label";
    const clean3 = (s) => (s || "").replace(/[​-‍﻿]/g, "").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const clone = node.cloneNode(true);
      clone.querySelectorAll(SR_ONLY2).forEach((n) => n.remove());
      return clean3(clone.textContent);
    };
    const para = (text) => {
      const p = document.createElement("p");
      p.textContent = text;
      return p;
    };
    const linkPara = (href, label) => {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      p.append(a);
      return p;
    };
    let props = {};
    try {
      props = JSON.parse(finder.getAttribute("data-dcep") || "{}") || {};
    } catch (e) {
      props = {};
    }
    const value = (v) => v === null || v === void 0 ? "" : clean3(String(v));
    const cells = [];
    const addRow = (key, v) => {
      if (v === null || v === void 0) return;
      if (typeof v === "string" && !v) return;
      if (Array.isArray(v) && !v.length) return;
      cells.push([key, v]);
    };
    addRow("Trip duration", value(props.tripDuration));
    addRow("Highlighted offers", value(props.maxHighlightedOffers));
    addRow("Highlight priority", value(props.priorityOfHighlightingOffers).split(",").map((s) => s.trim()).filter(Boolean).join(", "));
    const sds = finder.querySelector('.df-sds-link-button[href], maui-button-link[icon="ai"][href]');
    const sdsHref = value(props.aiSearchUrl) || sds && sds.getAttribute("href");
    const sdsLabel = visibleText(sds) || sds && clean3(sds.getAttribute("label"));
    if (sdsHref && sdsLabel) addRow("Smart search", [linkPara(sdsHref, sdsLabel)]);
    const redirect = value(props.baseRedirectUrl);
    if (redirect) addRow("Destination page", [linkPara(redirect, redirect.replace(/^.*\//, "") || redirect)]);
    if (/^[A-Za-z]{3}$/.test(value(props.preselectedOrigin))) addRow("Default origin", value(props.preselectedOrigin).toUpperCase());
    const copies = [...finder.querySelectorAll("maui-copy")].filter((c) => !c.closest("maui-card, .df-filters, maui-modal"));
    const disclaimerNode = copies.find((c) => /^\*/.test(visibleText(c)));
    const disclaimer = visibleText(disclaimerNode) || clean3((finder.querySelector("maui-price-display[conditions]") || { getAttribute: () => "" }).getAttribute("conditions"));
    if (disclaimer) addRow("Disclaimer", [para(disclaimer)]);
    const trigger = finder.querySelector(".disclaimerandconditions maui-link-button, .disclaimerandconditions button, .disclaimerandconditions a");
    const triggerLabel = visibleText(trigger);
    if (triggerLabel) {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = triggerLabel;
      p.append(strong);
      addRow("Conditions", [p]);
    }
    const out = [];
    const headline = finder.querySelector('maui-headline[type="h1"]') || finder.querySelector("maui-headline");
    const headingText2 = visibleText(headline);
    if (headingText2) {
      const h1 = document.createElement("h1");
      h1.textContent = headingText2;
      out.push(h1);
    }
    out.push(WebImporter.Blocks.createBlock(document, { name: "Destination Finder (grid)", cells }));
    element.replaceWith(...out);
  }
  function parse7(element, { document }) {
    const grid = element.matches(".dcep-destination-finder") ? element : element.querySelector(".dcep-destination-finder");
    if (grid) {
      parseGrid(element, grid, document);
      return;
    }
    const SR_ONLY2 = ".sr-only, .visually-hidden, maui-screen-reader-label";
    const clean3 = (s) => (s || "").replace(/[​-‍﻿]/g, "").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const clone = node.cloneNode(true);
      clone.querySelectorAll(SR_ONLY2).forEach((n) => n.remove());
      return clean3(clone.textContent);
    };
    const attr = (node, name) => clean3(node ? node.getAttribute(name) : "");
    const code = (v) => /^[A-Za-z]{3}$/.test(clean3(v)) ? clean3(v).toUpperCase() : "";
    const isBroken3 = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src);
    const para = (text) => {
      const p = document.createElement("p");
      p.textContent = text;
      return p;
    };
    const linkPara = (href, label) => {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      p.append(a);
      return p;
    };
    const queryOf = (href) => {
      try {
        return new URL(href, "https://www.lufthansa.com/").searchParams;
      } catch (e) {
        return new URLSearchParams();
      }
    };
    let props = {};
    const propsHost = element.querySelector("[data-dcep]") || (element.hasAttribute("data-dcep") ? element : null);
    if (propsHost) {
      try {
        props = JSON.parse(propsHost.getAttribute("data-dcep")) || {};
      } catch (e) {
        props = {};
      }
    }
    const cells = [];
    const addRow = (key, value) => {
      if (value === null || value === void 0) return;
      if (typeof value === "string" && !value) return;
      if (Array.isArray(value) && !value.length) return;
      cells.push([key, value]);
    };
    const headline = element.querySelector(".inlinetextdropdown maui-headline, .fareteaser-recommendation-headline maui-headline, maui-headline");
    let headingText2 = "";
    if (headline) {
      const clone = headline.cloneNode(true);
      clone.querySelectorAll(`.inlinetextautocomplete, .selectable, input, label, button, ${SR_ONLY2}`).forEach((n) => n.remove());
      headingText2 = clean3(clone.textContent);
    }
    addRow("Heading", headingText2);
    const originInput = element.querySelector('.inlinetextautocomplete input:not([type="hidden"]), .autocomplete-airport input:not([type="hidden"])');
    const cards = [...element.querySelectorAll(".swiper-slide a.ftde-card[href], a.ftde-card[href]")].filter((a, i, all) => all.indexOf(a) === i);
    const destinationCards = cards.filter((a) => a.getAttribute("data-testid") !== "destination-finder-card" && a.querySelector("maui-price-display, .ftde-card-price"));
    const firstQuery = destinationCards.length ? queryOf(destinationCards[0].getAttribute("href")) : new URLSearchParams();
    const originCode = code(props.preselectedOrigin) || code(firstQuery.get("OriginCode"));
    const originName = attr(originInput, "value") || visibleText(element.querySelector(".inlinetextautocomplete-measure"));
    if (originCode) addRow("Default origin", originName && !code(originName) ? `${originName} (${originCode})` : originCode);
    const originLabel = visibleText(element.querySelector(".inlinetextautocomplete label, .autocomplete-airport label")) || attr(originInput, "placeholder");
    addRow("Origin input label", originLabel);
    const chips = [...element.querySelectorAll(".trip-type-chips maui-chip, maui-chip-list maui-chip")].filter((c, i, all) => all.indexOf(c) === i).map((c) => attr(c, "label") || visibleText(c)).filter(Boolean);
    const tripTypes = [...new Set(chips)];
    addRow("Trip types", tripTypes.join(", "));
    if (props.isOneWayDefault === true && tripTypes[1]) addRow("Default trip type", tripTypes[1]);
    addRow("Trip duration", clean3(firstQuery.get("TripDuration")));
    if (props.airlineWhitelistingEnabled === true) addRow("Airline whitelist", "yes");
    addRow("Price label", attr(element.querySelector("maui-price-display[label]"), "label"));
    const finder = cards.find((a) => a.getAttribute("data-testid") === "destination-finder-card") || cards.find((a) => !a.querySelector("maui-price-display, .ftde-card-price"));
    if (finder) {
      const content = [];
      const img = [...finder.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")));
      if (img) {
        const image = document.createElement("img");
        image.src = img.getAttribute("src");
        image.alt = img.getAttribute("alt") || "";
        content.push(image);
      }
      const copy = visibleText(finder.querySelector("maui-copy, p"));
      if (copy) content.push(para(copy));
      const nav = finder.querySelector("maui-navigation-link[href], maui-button-link[href]");
      const label = visibleText(nav) || attr(finder, "aria-label");
      const href = nav && nav.getAttribute("href") || finder.getAttribute("href");
      if (href && label) content.push(linkPara(href, label));
      addRow("Finder card", content);
    }
    const cta = element.querySelector(".ftde-footer-cta maui-button-link[href], .ftde-footer-cta a[href], .recommender-footer maui-button-link[href]");
    if (cta && visibleText(cta)) addRow("CTA", [linkPara(cta.getAttribute("href"), visibleText(cta))]);
    const disclaimerNode = element.querySelector(".recommender-footer .disclaimer maui-copy, .recommender-footer .disclaimer p");
    const disclaimer = visibleText(disclaimerNode) || attr(element.querySelector("maui-price-display[conditions]"), "conditions");
    if (disclaimer) addRow("Disclaimer", [para(disclaimer)]);
    const conditions = [];
    const trigger = element.querySelector(".disclaimerandconditions maui-link-button, .disclaimerandconditions button, .disclaimerandconditions a");
    const triggerLabel = visibleText(trigger);
    const triggerHref = trigger && trigger.getAttribute("href");
    if (triggerLabel) {
      if (triggerHref && !triggerHref.startsWith("#")) {
        conditions.push(linkPara(triggerHref, triggerLabel));
      } else {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = triggerLabel;
        p.append(strong);
        conditions.push(p);
      }
    }
    if (trigger) {
      const dialogs = [...document.querySelectorAll("maui-modal")].filter((m) => !element.contains(m) && m.querySelector(":scope > .richtext") && !m.querySelector("maui-button, maui-button-link, form, input"));
      const owners = [...document.querySelectorAll(".disclaimerandconditions")].map((d) => d.closest('[class*="fareteaser"].section, .section') || d).filter((o, i, all) => all.indexOf(o) === i);
      const index = Math.max(0, owners.findIndex((o) => o === element || o.contains(element) || element.contains(o)));
      const dialog = dialogs[Math.min(index, dialogs.length - 1)];
      if (dialog) {
        dialog.querySelectorAll(".richtext p, .richtext li").forEach((node) => {
          if (!visibleText(node)) return;
          const p = document.createElement("p");
          p.innerHTML = node.innerHTML;
          p.querySelectorAll(SR_ONLY2).forEach((n) => n.remove());
          conditions.push(p);
        });
      }
    }
    addRow("Conditions", conditions);
    const block = WebImporter.Blocks.createBlock(document, { name: "destination-finder", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon.js
  function parse8(element, { document }) {
    const SR_ONLY2 = ".sr-only, .visually-hidden, maui-screen-reader-label";
    const clean3 = (s) => (s || "").replace(/[​-‍﻿]/g, "").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const clone = node.cloneNode(true);
      clone.querySelectorAll(SR_ONLY2).forEach((n) => n.remove());
      return clean3(clone.textContent);
    };
    const isBroken3 = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src);
    let tiles = [...element.querySelectorAll(".icon-teaser")];
    if (!tiles.length) tiles = [...element.querySelectorAll("a.teaser.usp")];
    if (!tiles.length) tiles = [...element.querySelectorAll("li, .teasericon")];
    const usp = tiles.length > 0 && tiles[0].matches("a.teaser.usp");
    let variants = [];
    if (usp) variants = element.matches(".fourcolumn") ? ["usp", "four-up"] : ["usp"];
    const view = element.querySelector(":scope > .column-view");
    const own = element.classList.contains("column") && element.children.length === 1 && !!view && !!element.parentElement && element.parentElement.classList.contains("section-content") && [...element.parentElement.children].every((c) => c === element || !(c.textContent || "").trim() || /^\{(?:spacer|divider)-\d{1,3}(?: from-768)?\}$/.test((c.textContent || "").trim()));
    const titled = view && [...view.children].some((c) => !c.matches(".row, .carousel") && c.querySelector("h1, h2, h3, h4, h5, h6"));
    if (own && !titled && !element.closest(".container-gray, .article-details-page") && !view.classList.contains("container-gray")) variants.push("padded");
    const cells = [];
    tiles.forEach((tile) => {
      const link = tile.matches("a[href]") ? tile : tile.querySelector("a[href]");
      const label = visibleText(tile.querySelector(".headline, .teaser-headline, h3, h4")) || visibleText(link);
      let iconCell = "";
      const mauiIcon = tile.querySelector('maui-icon[use], [class*="icon-"][use]');
      const iconName = mauiIcon ? clean3(mauiIcon.getAttribute("use")).toLowerCase().replace(/[^a-z0-9-]/g, "-") : "";
      if (iconName) {
        iconCell = `:${iconName}:`;
      } else {
        const img = [...tile.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")));
        if (img) {
          const image = document.createElement("img");
          image.src = img.getAttribute("src");
          image.alt = img.getAttribute("alt") || "";
          iconCell = image;
        }
      }
      if (!label && !iconCell) return;
      let labelCell = label;
      if (link && label) {
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        if (link.getAttribute("title")) a.title = link.getAttribute("title");
        a.textContent = label;
        labelCell = a;
      }
      cells.push([iconCell, labelCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-icon", variants, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-logos.js
  function parse9(element, { document }) {
    const SR_ONLY2 = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"]';
    const clean3 = (s) => (s || "").replace(/[​-‍﻿]/g, "").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const clone = node.cloneNode(true);
      clone.querySelectorAll(SR_ONLY2).forEach((n) => n.remove());
      return clean3(clone.textContent);
    };
    const isBroken3 = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src);
    let columns = [...element.querySelectorAll(".column-view-item")];
    if (!columns.length) columns = [...element.querySelectorAll(".imagelinklist, .link-list")];
    const row = [];
    columns.forEach((column) => {
      const content = [];
      const headingSource = column.querySelector("h1, h2, h3, h4, h5, h6, .headline");
      const headingText2 = visibleText(headingSource);
      if (headingText2) {
        const tag = headingSource && /^H[1-6]$/.test(headingSource.tagName) ? headingSource.tagName : "h3";
        const h = document.createElement(tag);
        h.textContent = headingText2;
        content.push(h);
      }
      const ul = document.createElement("ul");
      const items = [...column.querySelectorAll("li")];
      const linkSources = items.length ? items.map((li) => li.querySelector("maui-navigation-link[href], a[href], [href]") || li) : [...column.querySelectorAll("maui-navigation-link[href], a[href]")];
      linkSources.forEach((source) => {
        const href = source.getAttribute && source.getAttribute("href");
        const img = [...source.querySelectorAll("img")].find((i) => !isBroken3(i.getAttribute("src")));
        const label = visibleText(source);
        if (!img && !label) return;
        const li = document.createElement("li");
        let item;
        if (img) {
          item = document.createElement("img");
          item.src = img.getAttribute("src");
          item.alt = clean3(img.getAttribute("alt")) || clean3(img.getAttribute("title")) || label;
        } else {
          item = document.createTextNode(label);
        }
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          const title = img && (clean3(img.getAttribute("title")) || clean3(img.getAttribute("alt")));
          if (title) a.title = title;
          a.append(item);
          li.append(a);
        } else {
          li.append(item);
        }
        ul.append(li);
      });
      if (ul.children.length) content.push(ul);
      if (content.length) row.push(content);
    });
    const cells = row.length ? [row] : [];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-logos", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-columns.js
  function parse10(element, { document }) {
    const SR_ONLY2 = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"]';
    const ZW2 = /[​-‍﻿]/g;
    const clean3 = (s) => (s || "").replace(ZW2, "").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const clone = node.cloneNode(true);
      clone.querySelectorAll(SR_ONLY2).forEach((n) => n.remove());
      return clean3(clone.textContent);
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
    const dropIcons = (root) => root.querySelectorAll("em.lh, i.lh").forEach((n) => {
      if (clean3(n.textContent)) n.replaceWith(...n.childNodes);
      else n.remove();
    });
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
            const LINKS = "a[href], maui-navigation-link[href], maui-link[href], maui-button-link[href]";
            const rest = li.cloneNode(true);
            rest.querySelectorAll(`${LINKS}, ${SR_ONLY2}, ul, ol`).forEach((n) => n.remove());
            if (link && clean3(rest.textContent)) {
              const c = li.cloneNode(true);
              c.querySelectorAll(`${SR_ONLY2}, ul, ol, br`).forEach((n) => n.remove());
              dropIcons(c);
              c.querySelectorAll(LINKS).forEach((x) => {
                const l = makeLink(x);
                if (l) x.replaceWith(l);
                else x.replaceWith(...x.childNodes);
              });
              c.querySelectorAll("span, font").forEach((n) => n.replaceWith(...n.childNodes));
              item.innerHTML = c.innerHTML.replace(ZW2, "").replace(/\s+/g, " ").trim();
            } else if (link) item.append(link);
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
          const onlyLinks = links.length && !clean3(clone.textContent);
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
            p.querySelectorAll(SR_ONLY2).forEach((n) => n.remove());
            dropIcons(p);
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
    const convertTable = (node) => {
      const table = document.createElement("table");
      const rowEls = [...node.querySelectorAll("maui-table-row, tr")].filter((r) => !r.parentElement.closest("maui-table-row, tr"));
      rowEls.forEach((rowEl) => {
        const head = !!rowEl.closest("maui-table-head, thead");
        const tr = document.createElement("tr");
        [...rowEl.querySelectorAll("maui-table-cell, td, th")].filter((c) => c.closest("maui-table-row, tr") === rowEl).forEach((cellEl) => {
          const cell = document.createElement(head ? "th" : "td");
          const wrap = document.createElement("div");
          [...cellEl.childNodes].forEach((n) => wrap.append(n.cloneNode(true)));
          const nodes = convertRichText(wrap);
          if (nodes.length === 1 && nodes[0].tagName === "P") cell.append(...nodes[0].childNodes);
          else if (nodes.length) cell.append(...nodes);
          else cell.textContent = visibleText(cellEl);
          tr.append(cell);
        });
        if (tr.children.length) table.append(tr);
      });
      if (!table.children.length) return [];
      const caption = visibleText(node.querySelector("maui-table-caption, caption"));
      if (!caption) return [table];
      const p = document.createElement("p");
      p.textContent = caption;
      return [p, table];
    };
    const convertImage = (node) => {
      const img = node.querySelector("img");
      const src = img && (img.getAttribute("src") || img.getAttribute("data-src"));
      if (!src || /^(data|blob):/i.test(src)) return [];
      const picture = document.createElement("picture");
      const out = document.createElement("img");
      out.setAttribute("src", src);
      out.setAttribute("alt", clean3(img.getAttribute("alt")));
      picture.append(out);
      const p = document.createElement("p");
      p.append(picture);
      return [p];
    };
    const PANEL_NODES = "h1, h2, h3, h4, h5, h6, .richtext, ul, ol, maui-navigation-link[href], maui-link[href], maui-button-link[href], .videoViewer, .video:has(> .video-player iframe), .iframe:has(> .iframe-wrapper iframe), div.table:has(maui-table, table)";
    const panelColumns = (panel) => {
      const columns = [...panel.querySelectorAll(".column-view-item")].filter((c) => !c.parentElement.closest(".column-view-item"));
      if (!columns.length) return [];
      const outside = [...panel.querySelectorAll(PANEL_NODES)].some((n) => !columns.some((c) => c.contains(n)) && (visibleText(n) || n.querySelector("img, iframe")));
      return outside ? [] : columns;
    };
    const VIEWS = ".twocolumn, .threecolumn, .fourcolumn";
    const viewItems = (view) => [...view.querySelectorAll(".column-view-item")].filter((c) => c.closest(VIEWS) === view);
    const isImageGrid = (view) => {
      const items2 = viewItems(view);
      return items2.length >= 2 && items2.every((c) => c.querySelector(".image img") && !c.querySelector("maui-table, table, ul, ol, h1, h2, h3, h4, h5, h6, .accordion"));
    };
    const convertGrid = (view) => {
      const table = document.createElement("table");
      const tr = document.createElement("tr");
      viewItems(view).forEach((item) => {
        const td = document.createElement("td");
        item.querySelectorAll(".image:has(img)").forEach((img) => td.append(...convertImage(img)));
        item.querySelectorAll(".richtext").forEach((rt) => td.append(...convertRichText(rt)));
        tr.append(td);
      });
      table.append(tr);
      return [table];
    };
    const isFacts = (view) => {
      const items2 = viewItems(view);
      return view.matches(".threecolumn, .fourcolumn") && items2.length >= 2 && items2.every((it) => it.querySelector("h1, h2, h3, h4, h5, h6") && !it.querySelector("img, table, maui-table, ul, ol"));
    };
    const factsOf = (item) => [...item.querySelectorAll(VIEWS)].filter((v) => v.parentElement.closest(".column-view-item") === item && isFacts(v));
    const isMediaRow = (view) => {
      const items2 = viewItems(view);
      if (!view.matches(".twocolumn") || items2.length !== 2) return false;
      const pictured = items2.filter((it) => it.querySelector(".image img"));
      const other = items2.find((it) => !pictured.includes(it));
      return pictured.length === 1 && !other.querySelector("maui-table, table, .accordion") && factsOf(other).length > 0;
    };
    const factsTable = (view) => {
      const table = document.createElement("table");
      const tr = document.createElement("tr");
      viewItems(view).forEach((item) => {
        const td = document.createElement("td");
        const heading = item.querySelector("h1, h2, h3, h4, h5, h6");
        const h = document.createElement(heading.tagName.toLowerCase());
        h.textContent = visibleText(heading);
        td.append(h);
        item.querySelectorAll(".richtext").forEach((rt) => td.append(...convertRichText(rt)));
        tr.append(td);
      });
      table.append(tr);
      return table;
    };
    const convertMediaRow = (view) => {
      const out = [];
      const title = view.querySelector(":scope > .column-view > div:not(.row) :is(h1, h2, h3, h4, h5, h6)");
      if (title && visibleText(title)) {
        const h = document.createElement(title.tagName.toLowerCase());
        h.textContent = visibleText(title);
        out.push(h);
      }
      const table = document.createElement("table");
      const tr = document.createElement("tr");
      viewItems(view).forEach((item) => {
        const td = document.createElement("td");
        const facts = factsOf(item);
        const rest = item.cloneNode(true);
        factsOf(rest).forEach((v) => v.remove());
        td.append(...convertPanel(rest), ...facts.map(factsTable));
        rest.querySelectorAll('maui-button-link[href]:is([type="primary"], [type="secondary"])').forEach((m) => {
          const a = [...td.querySelectorAll("p > a:only-child")].find((l) => l.getAttribute("href") === m.getAttribute("href") && l.textContent === visibleText(m));
          if (!a) return;
          const wrap = document.createElement(m.getAttribute("type") === "primary" ? "strong" : "em");
          a.replaceWith(wrap);
          wrap.append(a);
        });
        tr.append(td);
      });
      table.append(tr);
      out.push(table);
      return out;
    };
    const convertPanel = (panel) => {
      const content = [];
      const columns = panelColumns(panel);
      const parts = columns.length ? columns : [panel];
      const selector = columns.length ? PANEL_NODES : `${PANEL_NODES}, .image:has(img), ${VIEWS}`;
      const grids = /* @__PURE__ */ new Set();
      parts.forEach((part) => {
        part.querySelectorAll(selector).forEach((node) => {
          if ([...grids].some((g) => g.contains(node))) return;
          if (!columns.length && node.matches(VIEWS)) {
            if (!node.parentElement.closest(VIEWS) && isMediaRow(node)) {
              grids.add(node);
              content.push(...convertMediaRow(node));
              return;
            }
            if (!node.parentElement.closest(VIEWS) && isImageGrid(node)) {
              grids.add(node);
              content.push(...convertGrid(node));
            }
            return;
          }
          if (node.parentElement && node.parentElement.closest(".richtext, ul, ol") && part.contains(node.parentElement.closest(".richtext, ul, ol"))) return;
          if (node.parentElement && node.parentElement.closest(".videoViewer, .video-player, .iframe-wrapper, div.table")) return;
          if (node.matches("div.table")) {
            content.push(...convertTable(node));
          } else if (node.matches(".image")) {
            content.push(...convertImage(node));
          } else if (node.matches(".videoViewer")) {
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
              img.setAttribute("alt", clean3(icon.getAttribute("alt")));
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
    if (items.length && !items.some((item) => panelColumns(item).length)) options.push("faq");
    if (element.closest("maui-limited-width") || element.querySelector("maui-limited-width maui-collapsible, maui-limited-width .accordionitem")) options.push("limited-width");
    const columnItem = element.parentElement && element.parentElement.closest(".column-view-item");
    const columnView = columnItem && columnItem.closest(".column-view");
    const columnCount = columnView ? [...columnView.querySelectorAll(".column-view-item")].filter((it) => it.closest(".column-view") === columnView).length : 0;
    const aloneInColumn = !!columnItem && [...columnItem.children].filter((c) => c !== element && !c.contains(element) && !c.matches(".separator") && (clean3(c.textContent) || c.querySelector("img, video, iframe"))).length === 0;
    if (aloneInColumn && columnCount > 1) options.push("column");
    else if (columnItem) options.push("spaced");
    const cells = [];
    const expanded = [];
    items.forEach((item) => {
      const title = clean3(item.getAttribute("headline")) || visibleText(item.querySelector('[slot="headline"], .accordion-headline, summary, h2, h3'));
      const content = convertPanel(item);
      if (!title && !content.length) return;
      cells.push([title, content.length ? content : ""]);
      if (item.hasAttribute("expanded")) expanded.push(cells.length);
    });
    if (expanded.length && expanded.length <= 9 && expanded.every((k, i) => k === i + 1)) {
      options.push(expanded.length === 1 ? "open-first" : `open-${expanded.length}`);
    } else {
      expanded.forEach((k) => options.push(`open-item-${k}`));
    }
    const blockName2 = options.length ? `accordion-columns (${options.join(", ")})` : "accordion-columns";
    const block = WebImporter.Blocks.createBlock(document, { name: blockName2, cells });
    element.replaceWith(block);
  }

  // scripts/style-markers.js
  var COLUMN_MARK = "column-(?:(?:start|end)(?:-outer)?|spaced)";
  var styleMarker = (tokens) => new RegExp(`\\s*\\{((?:${tokens})(?: (?:${tokens}))*)\\}\\s*$`);
  var HEADING_TOKENS = `heading-(?:large|medium|small|copytext-large|copytext-medium)|copytext-large|limited-width|${COLUMN_MARK}`;
  var PARAGRAPH_TOKENS = `copytext-(?:small|medium|large)|full-width|limited-width|caption|parallax|narrow|indent-\\d{1,3}|${COLUMN_MARK}`;
  var LIST_TOKENS = `copytext-(?:small|medium|large)|full-width|limited-width|links-(?:horizontal|responsive|vertical)|${COLUMN_MARK}`;
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
  var SEPARATOR_TEXT = /^\s*\{(?:spacer|divider)-\d{1,3}(?: from-768)?\}\s*$/;
  var isSeparatorText = (s) => SEPARATOR_TEXT.test(s) || APP_SPACER.test(s.trim());
  var TRAILING_TEXT = new RegExp(`\\s*${ANY_MARKER}\\s*$`);
  var TRAILING_HTML = new RegExp(`\\s*${ANY_MARKER}((?:\\s*</[a-z][a-z0-9]*>)*)\\s*$`, "i");
  function stripStyleMarkers(text) {
    let s = String(text != null ? text : "");
    if (isSeparatorText(s)) return "";
    for (let prev = null; prev !== s; ) {
      prev = s;
      s = s.replace(TRAILING_TEXT, "");
    }
    return s;
  }
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
      h3: { large: "heading-medium" },
      // an H4 two steps over its default too (www's heading-medium card titles: B2B's Joint
      // Ventures, the brief after d9cf2340; without it the collapse dropped the size)
      h4: { large: "heading-medium" }
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
      // page titles in heading-medium (www's smaller H1: 168 of the 6,826 census
      // documents' first H1s, 85 later H1s; brief 582, the switch plan's B3): one step from
      // the H1 default, which the collapse would take, so a choice of their own the collapse
      // keeps (section style H1 compact)
      headingChoices: { h1: { compact: "heading-medium" } },
      nearChoices: { h1: { "heading-medium": "compact" } },
      pageTypes: {
        // flow pages (the info pages; a page with column marks is one): an H3 in heading-small is
        // a choice of its own (H3 large draws heading-small here, not heading-medium): www's H3s
        // there are heading-small 924 times, unmarked 432, heading-medium 106 (the 1,862 published
        // column-mark documents, standing order 3); the collapse took the H3 default before (bold
        // 24px for www's light 28px). nearChoices replaces the brand's, so the H1's again
        flow: {
          headingChoices: { h3: { large: "heading-small" } },
          nearChoices: { h1: { "heading-medium": "compact" }, h3: { "heading-small": "large" } }
        },
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
    // textSpacers: a spacer of 31 px or less between two text elements (www's empty paragraph,
    // nbsp-guard.mjs emptyParagraphSpacers) stays as {spacer-N} in the collapse (standing order 5
    // of 2026-11-11, item 1; import time only, nothing served reads it)
    brussels: {
      live: true,
      textSpacers: true,
      pageTypes: { flow: { headings: { h3: "heading-small" } } }
    },
    // ITA: running text over the whole width
    // ITA: a section's H2 right before a teaser grid in heading-small (www's column view; DA: 923 of
    // 1,029 H2s before Carousel Cards, every one of 67 before Cards Icon; rows-for-ema-test row 1)
    ita: {
      live: true,
      text: { width: "full" },
      headingsBefore: { "carousel-cards": { h2: "heading-small" }, "cards-icon": { h2: "heading-small" } }
    },
    // SWISS: flow pages set their H2s in heading-small (www: 63 % of the markets' pages, 79 % of the
    // sub-sites'; the rest mostly unmarked, one step up); the FAQ hub's topic teasers in their groups
    // (a heading right before them starts the group's column view, as its marker did)
    swiss: { live: true, rules: ["teaser-groups"], pageTypes: { flow: { headings: { h2: "heading-small" } } } },
    // Discover: on flow pages the H2s in heading-small (www: 86 %) and a Columns Media a column view
    // of its own (www: 26 of 33 not at a section's start)
    // componentSpacers: a separator of 31 px or less between two components (www's .hr, 30 px + 1)
    // stays as {spacer-N} in the collapse (rows-for-ema-test.md row 4; import time only)
    discover: {
      live: true,
      componentSpacers: true,
      // keepSizes: a heading size the collapse keeps as its marker, which the page reads as the class
      // (www's heading-copytext-large, 16 / 18 px bold: rows-for-ema-test.md row 3)
      keepSizes: ["heading-copytext-large"],
      pageTypes: { flow: { headings: { h2: "heading-small" }, columnViews: { blocks: ["columns-media"] } } }
    },
    // Lufthansa Group for Business: on flow pages the H3s in heading-small (www: 82 %); Columns
    // Media, Carousel Images and Quote column views of their own, also at a section's end (www: 558
    // of 789 Columns Media not at a section's start, 749 of 962 with an edge below)
    b2b: {
      live: true,
      // a title in heading-small (www's airline pages: 21 first H1s of the census, 20 later ones),
      // two steps under the H1 default, which the collapse dropped (section style H1 compact)
      headingChoices: { h1: { compact: "heading-small" } },
      pageTypes: {
        // a heading right before such a block opens its column view (www: 81 of 105 marked so, the
        // brief after 550 narrows it); in a grey band no edge above a block right after a heading
        // (www: none of 146 bands has column marks; travel-id's and contact's headings sit on it)
        flow: {
          headings: { h3: "heading-small" },
          columnViews: {
            blocks: ["columns-media", "carousel-images", "quote"],
            endEdge: true,
            startAtHeading: true,
            bandHeadings: true,
            sidebarNoView: true,
            startAfterLogo: true
          }
        }
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

  // tools/importer/description-rules.js
  var clean2 = (s) => String(s || "").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
  var DATE_ONLY = new RegExp("^\\(?(?:\\d{1,2}\\.?\\s+\\p{L}+\\.?|\\p{L}+\\.?\\s+\\d{1,2},?)\\s+\\d{4}\\)?$", "u");
  var VIDEO_PATH = /^(?:https?:\/\/\S+|\/\S+)\.(?:mp4|webm|mov|m4v)(?:\?\S*)?$|^(?:https?:\/\/[^\s/]+)?\/content\/dam\/\S+$/i;
  var HAN_KANA = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
  var HANGUL = new RegExp("\\p{Script=Hangul}", "u");
  var FOOTNOTE = /^(?:[*†‡¹²³⁴⁵⁶⁷⁸⁹]|\(\d{1,2}\)\s)/u;
  var DATES = "\\d{1,2}\\.\\d{1,2}\\.\\d{2,4}|\\d{4}-\\d{2}-\\d{2}|\\d{1,2}\\.?\\s+\\p{L}+\\.?,?\\s+\\d{4}|\\p{L}+\\.?\\s+\\d{1,2},?\\s+\\d{4}|\\d{4}\\s?\u5E74\\s?\\d{1,2}\\s?\u6708\\s?\\d{1,2}\\s?\u65E5";
  var DATE = new RegExp(DATES, "gu");
  var DATE_AT_END = new RegExp(`(?:${DATES})[)\uFF09]?$`, "u");
  var PRICE = /(?:[€$£¥₩]|\b(?:EUR|USD|CHF|GBP|CNY|HKD|KRW|MYR|THB|INR|JPY)\b)\s?\d[\d.,]*|\d[\d.,]*\s?(?:[€$£¥₩]|\b(?:EUR|USD|CHF|GBP|CNY|HKD|KRW|MYR|THB|INR|JPY)\b)/gu;
  var LEAD_IN = /(?:[:：,，;；–—-]|…|\.\.\.)$/u;
  var STEP = new RegExp("^\\d{1,2}[.)]\\s*(?!\\p{L}+\\.?,?\\s+\\d{4})\\p{L}", "u");
  var SALUTATION = new RegExp("^(?:dear|sehr geehrte[rs]?|liebe[rs]?|geachte|ch\xE8re?s?|cher|madame|monsieur|gentile|egregi[oa]|estimad[oa]|prezad[oa]|car[oa]|\u03B1\u03B3\u03B1\u03C0\u03B7\u03C4\\p{L}*|\u0443\u0432\u0430\u0436\u0430\u0435\u043C\\p{L}*|\u0434\u043E\u0440\u043E\u0433\\p{L}*)(?!\\p{L})|^(?:\u304A\u5BA2\u69D8\u3078|\u62DD\u5553|\u4EB2\u7231\u7684|\u89AA\u611B\u7684|\uCE5C\uC560\uD558\uB294)", "iu");
  var CRUMB = /\s[›»>]\s/u;
  var words = (s) => s.split(" ").filter((t) => new RegExp("\\p{L}", "u").test(t)).length;
  function isWeak(text) {
    if (FOOTNOTE.test(text) || LEAD_IN.test(text) || STEP.test(text)) return true;
    const chars = text.replace(/\s/g, "");
    if ((chars.match(new RegExp("\\p{L}", "gu")) || []).length < chars.length * 0.4) return true;
    const end = text.match(DATE_AT_END);
    if (end) {
      const rest = text.slice(0, end.index).trim();
      if (!rest || /[,:，：、|–-]$/u.test(rest)) return true;
    }
    const cjk = HAN_KANA.test(text);
    if (SALUTATION.test(text) && (cjk ? [...chars].length <= 12 : words(text) <= 6)) return true;
    if (CRUMB.test(text) && words(text) <= 8) return true;
    if (cjk) return [...chars].length < 6;
    if (words(text) < (HANGUL.test(text) ? 3 : 4)) return true;
    const dated = text.replace(DATE, " ").replace(PRICE, " ");
    if (dated === text) return false;
    return / \| /.test(text) || words(clean2(dated)) < 3;
  }
  var textLines = (el) => {
    const c = el.cloneNode(true);
    c.querySelectorAll("br").forEach((br) => br.replaceWith(c.ownerDocument.createTextNode("\n")));
    return c.textContent.split("\n").map((l) => clean2(stripStyleMarkers(clean2(l)))).filter(Boolean);
  };
  function paragraphText(p) {
    const lines = textLines(p);
    const text = clean2(stripStyleMarkers(lines.join(" ")));
    if (!text) return "";
    if (VIDEO_PATH.test(text) || DATE_ONLY.test(text) || isWeak(text)) return "";
    if (lines.length > 1 && lines.every(isWeak)) return "";
    const links = [...p.querySelectorAll("a")];
    if (links.length && clean2(links.map((a) => a.textContent).join(" ")) === text) return "";
    return text;
  }
  function firstTextParagraph(root, skip = "div.metadata, div.section-metadata") {
    const first = (sel) => [...root.querySelectorAll(sel)].filter((x) => !x.closest(skip)).find((x) => paragraphText(x));
    const p = first("p") || first("h1") || first("h2");
    return p ? paragraphText(p) : "";
  }

  // tools/importer/transformers/lufthansa-cleanup.js
  var SCOPE_PATHS = /* @__PURE__ */ new Set(["/at/de/100-years", "/at/de/100-years/cabin-design", "/at/de/100-years/campaigns", "/at/de/100-years/chronicle", "/at/de/100-years/crane", "/at/de/100-years/destinations", "/at/de/100-years/fleet", "/at/de/100-years/global-network", "/at/de/100-years/history", "/at/de/100-years/history/menu-on-board", "/at/de/320", "/at/de/32n", "/at/de/359", "/at/de/744", "/at/de/accessible-travel", "/at/de/additional-services", "/at/de/admission-rules", "/at/de/adressen-weltweit", "/at/de/advance-seat-reservation", "/at/de/advice-for-travellers-with-special-needs-to-and-from-the-usa", "/at/de/affiliatemarketing", "/at/de/all-check-in", "/at/de/alleinreisende-kinder", "/at/de/anmeldung-tiere-frachtraum", "/at/de/arrival-services", "/at/de/articles", "/at/de/articles/authors", "/at/de/articles/authors/alexandra-mikamo", "/at/de/articles/authors/florian-schwebel", "/at/de/articles/authors/florian-tomberg", "/at/de/articles/authors/julia-buth", "/at/de/articles/authors/till-weisbrod", "/at/de/articles/explore-flying", "/at/de/articles/explore-flying/7-people-who-shaped-lufthansa-history", "/at/de/articles/explore-flying/a-girl-named-lufthansa", "/at/de/articles/explore-flying/aircraft-lights-explained", "/at/de/articles/explore-flying/allegris-business-class-dirk-nowitzki", "/at/de/articles/explore-flying/allegris-exclusive-first-class-loungewear", "/at/de/articles/explore-flying/allegris-first-class-innovations", "/at/de/articles/explore-flying/allegris-first-class-reasons-for-allegris-first-class", "/at/de/articles/explore-flying/allegris-fox", "/at/de/articles/explore-flying/anniversary-super-crane-special", "/at/de/articles/explore-flying/art-basel-miami-beach-stefan-marx", "/at/de/articles/explore-flying/best-airport-restaurants", "/at/de/articles/explore-flying/business-class-culinary-journey-with-johann-lafer", "/at/de/articles/explore-flying/celebrating-20-years-of-excellence", "/at/de/articles/explore-flying/cockpit-collaboration", "/at/de/articles/explore-flying/come-fly-with-me-lufthansa-allegris", "/at/de/articles/explore-flying/culinary-craftsmanship-smoked-fish-for-first-and-business-class", "/at/de/articles/explore-flying/essentials-future-of-flying", "/at/de/articles/explore-flying/essentials-lufthansa-facts", "/at/de/articles/explore-flying/essentials-surprising-lufthansa-numbers", "/at/de/articles/explore-flying/everyone-wants-to-fly-with-the-cranes", "/at/de/articles/explore-flying/female-pilots", "/at/de/articles/explore-flying/first-class-culinary-inspiration-journey-tokyo", "/at/de/articles/explore-flying/first-class-reimagined", "/at/de/articles/explore-flying/first-class-terminal-architecture", "/at/de/articles/explore-flying/flying-high-christoph-quarch", "/at/de/articles/explore-flying/flying-high-meta-city", "/at/de/articles/explore-flying/future-of-flying", "/at/de/articles/explore-flying/help-alliance-engagement-in-tanzania", "/at/de/articles/explore-flying/help-alliance-taking-off-for-a-good-cause", "/at/de/articles/explore-flying/hon-circle-event", "/at/de/articles/explore-flying/how-to-become-a-flight-attendant", "/at/de/articles/explore-flying/how-to-become-a-pilot", "/at/de/articles/explore-flying/inflight-entertainment-vr-experience", "/at/de/articles/explore-flying/inside-lufthansa-lh-allegris", "/at/de/articles/explore-flying/interview-livery-iconic-moments", "/at/de/articles/explore-flying/livery-iconic-moments", "/at/de/articles/explore-flying/lufthansa-allegris-first-class", "/at/de/articles/explore-flying/lufthansa-allegris-welcome-to-the-future-of-aviation", "/at/de/articles/explore-flying/lufthansa-classics", "/at/de/articles/explore-flying/lufthansa-fleet-our-aircrafts", "/at/de/articles/explore-flying/lufthansa-group-wifi", "/at/de/articles/explore-flying/lufthansa-help-alliance-i-fly-for-campaign", "/at/de/articles/explore-flying/lufthansa-in-the-spotlight", "/at/de/articles/explore-flying/lufthansa-innovation-hub-future-of-flying", "/at/de/articles/explore-flying/lufthansa-insights-art", "/at/de/articles/explore-flying/lufthansa-lounges", "/at/de/articles/explore-flying/lufthansa-orchestra-channel-aid-live-in-concert", "/at/de/articles/explore-flying/lufthansa-uniforms-history", "/at/de/articles/explore-flying/meet-the-makers-innovations-for-individual-well-being", "/at/de/articles/explore-flying/meet-the-makers-lufthansa-allegris-business-class", "/at/de/articles/explore-flying/meet-the-makers-lufthansa-allegris-first-class", "/at/de/articles/explore-flying/meet-the-makers-the-manufactures-of-the-first-class-suites", "/at/de/articles/explore-flying/new-lufthansa-lounge-newark-interview", "/at/de/articles/explore-flying/oktoberfest-traditional-bavarian-attire", "/at/de/articles/explore-flying/pride-diversifly-queer-employee-network-lufthansa-group", "/at/de/articles/explore-flying/queer-travel-safer-trips", "/at/de/articles/explore-flying/responsibility-lufthansa", "/at/de/articles/explore-flying/things-you-always-wanted-to-know-about-flying", "/at/de/articles/explore-flying/time-travel-ki-aviation", "/at/de/articles/explore-flying/travel-trends", "/at/de/articles/explore-flying/vacation-packing-list", "/at/de/articles/explore-flying/welcome-to-my-world-alexandra-maria-lara", "/at/de/articles/explore-flying/welcome-to-my-world-bridget-finn", "/at/de/articles/explore-flying/welcome-to-my-world-elyas-mbarek", "/at/de/articles/explore-flying/welcome-to-my-world-emilia-schuele", "/at/de/articles/explore-flying/welcome-to-my-world-karolina-kurkova", "/at/de/articles/explore-flying/welcome-to-my-world-karoline-herfurth", "/at/de/articles/explore-flying/welcome-to-my-world-lexie-alford", "/at/de/articles/explore-flying/what-does-luxury-mean-today", "/at/de/articles/explore-flying/what-the-hack-anti-jetlag-tips", "/at/de/articles/explore-flying/what-the-hack-best-seats", "/at/de/articles/explore-flying/what-the-hack-travel-gadgets", "/at/de/articles/explore-flying/what-the-hack-travel-hacks", "/at/de/articles/explore-flying/what-the-hack-travel-with-kids", "/at/de/articles/explore-flying/what-the-hack-waiting-time-at-the-airport", "/at/de/articles/explore-flying/what-the-hack-what-is-the-etiquette-of-traveling", "/at/de/articles/explore-flying/yes-stories-the-fascination-of-skydiving", "/at/de/articles/explore-flying/yes-stories-the-two-worlds-of-kaye-ree", "/at/de/articles/explore-flying/yes-stories-thorsten-buss", "/at/de/articles/explore-flying/yes-stories-tom-rees", "/at/de/articles/explore-the-world", "/at/de/articles/explore-the-world/a-perfect-day-amsterdam-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-art-basel-miami-beach-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-athens-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-bangkok-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-barcelona-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-beijing-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-bengaluru-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-berlin-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-boston-on-one-day", "/at/de/articles/explore-the-world/a-perfect-day-budapest-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-buenos-aires-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-cape-town-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-charlotte-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-chicago-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-copenhagen-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-dublin-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-frankfurt-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-hamburg", "/at/de/articles/explore-the-world/a-perfect-day-helsinki-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-hong-kong-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-houston-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-istanbul-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-johannesburg-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-la-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-lisbon-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-london-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-madrid-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-malaga-on-one-day", "/at/de/articles/explore-the-world/a-perfect-day-mallorca-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-mexico-city-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-miami-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-milan-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-mumbai-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-munich-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-ny-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-oslo-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-paris-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-porto-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-prague-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-rio-de-janeiro-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-rome-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-san-francisco-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-seoul-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-shanghai-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-singapore-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-stockholm-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-tokyo-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-toronto-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-vienna-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-washington-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-zurich-in-one-day", "/at/de/articles/explore-the-world/a-perfect-nairobi-city-in-one-day", "/at/de/articles/explore-the-world/art-basel-miami-beach-fun-facts", "/at/de/articles/explore-the-world/be-picky-amsterdam-insider-tips", "/at/de/articles/explore-the-world/be-picky-athens-insider-tips", "/at/de/articles/explore-the-world/be-picky-bangkok-insider-tips", "/at/de/articles/explore-the-world/be-picky-barcelona-insider-tips", "/at/de/articles/explore-the-world/be-picky-bengaluru", "/at/de/articles/explore-the-world/be-picky-budapest-insider-tips", "/at/de/articles/explore-the-world/be-picky-buenos-aires-insider-tips", "/at/de/articles/explore-the-world/be-picky-cape-town-insider-tips", "/at/de/articles/explore-the-world/be-picky-charlotte-insider-tips", "/at/de/articles/explore-the-world/be-picky-chicago-insider-tips", "/at/de/articles/explore-the-world/be-picky-copenhagen", "/at/de/articles/explore-the-world/be-picky-dublin-insider-tips", "/at/de/articles/explore-the-world/be-picky-frankfurt-insider-tips", "/at/de/articles/explore-the-world/be-picky-helsinkis-insider-tips", "/at/de/articles/explore-the-world/be-picky-hong-kong-insider-tips", "/at/de/articles/explore-the-world/be-picky-istanbul-insider-tips", "/at/de/articles/explore-the-world/be-picky-johannesburg-insider-tipps", "/at/de/articles/explore-the-world/be-picky-la-insider-tips", "/at/de/articles/explore-the-world/be-picky-lisbon", "/at/de/articles/explore-the-world/be-picky-little-italy-in-vancouver", "/at/de/articles/explore-the-world/be-picky-london-insider-tips", "/at/de/articles/explore-the-world/be-picky-madrid", "/at/de/articles/explore-the-world/be-picky-mallorca-insider-tips", "/at/de/articles/explore-the-world/be-picky-mexico-city-insider-tips", "/at/de/articles/explore-the-world/be-picky-mexico-city-insidertipps", "/at/de/articles/explore-the-world/be-picky-miami-insider-tips", "/at/de/articles/explore-the-world/be-picky-milan-insider-tips", "/at/de/articles/explore-the-world/be-picky-mumbai-insider-tips", "/at/de/articles/explore-the-world/be-picky-munich-insider-tip-anika-landsteiner", "/at/de/articles/explore-the-world/be-picky-ny-insider-tips", "/at/de/articles/explore-the-world/be-picky-oslo-insider-tips", "/at/de/articles/explore-the-world/be-picky-paris-insider-tips", "/at/de/articles/explore-the-world/be-picky-prague-insider-tips", "/at/de/articles/explore-the-world/be-picky-rio-de-janeiro-insider-tips", "/at/de/articles/explore-the-world/be-picky-rome-insider-tips", "/at/de/articles/explore-the-world/be-picky-san-francisco-insider-tips", "/at/de/articles/explore-the-world/be-picky-seoul-insider-tips", "/at/de/articles/explore-the-world/be-picky-shanghai-insider-tips", "/at/de/articles/explore-the-world/be-picky-singapore-insider-tips", "/at/de/articles/explore-the-world/be-picky-stockholm", "/at/de/articles/explore-the-world/be-picky-tokyo-insider-tips", "/at/de/articles/explore-the-world/be-picky-toronto-insider-tips", "/at/de/articles/explore-the-world/be-picky-vienna-insider-tips", "/at/de/articles/explore-the-world/be-picky-washington-insider-tips", "/at/de/articles/explore-the-world/be-picky-zurich-insider-tips", "/at/de/articles/explore-the-world/copenhagen-what-i-have-learned", "/at/de/articles/explore-the-world/eat-see-do-algiers", "/at/de/articles/explore-the-world/eat-see-do-almaty", "/at/de/articles/explore-the-world/eat-see-do-amman", "/at/de/articles/explore-the-world/eat-see-do-atlanta", "/at/de/articles/explore-the-world/eat-see-do-beijing", "/at/de/articles/explore-the-world/eat-see-do-berlin", "/at/de/articles/explore-the-world/eat-see-do-bilbao", "/at/de/articles/explore-the-world/eat-see-do-bogota", "/at/de/articles/explore-the-world/eat-see-do-boston", "/at/de/articles/explore-the-world/eat-see-do-cagliari", "/at/de/articles/explore-the-world/eat-see-do-cairo", "/at/de/articles/explore-the-world/eat-see-do-casablanca", "/at/de/articles/explore-the-world/eat-see-do-catania", "/at/de/articles/explore-the-world/eat-see-do-chennai", "/at/de/articles/explore-the-world/eat-see-do-dallas", "/at/de/articles/explore-the-world/eat-see-do-denver", "/at/de/articles/explore-the-world/eat-see-do-detroit", "/at/de/articles/explore-the-world/eat-see-do-dubai", "/at/de/articles/explore-the-world/eat-see-do-edinburgh", "/at/de/articles/explore-the-world/eat-see-do-faro", "/at/de/articles/explore-the-world/eat-see-do-gothenburg", "/at/de/articles/explore-the-world/eat-see-do-hamburg", "/at/de/articles/explore-the-world/eat-see-do-houston", "/at/de/articles/explore-the-world/eat-see-do-hyderabad", "/at/de/articles/explore-the-world/eat-see-do-kuala-lumpur", "/at/de/articles/explore-the-world/eat-see-do-larnaca", "/at/de/articles/explore-the-world/eat-see-do-ljubljana", "/at/de/articles/explore-the-world/eat-see-do-malaga", "/at/de/articles/explore-the-world/eat-see-do-manchester", "/at/de/articles/explore-the-world/eat-see-do-marseille", "/at/de/articles/explore-the-world/eat-see-do-minneapolis-st-paul", "/at/de/articles/explore-the-world/eat-see-do-nairobi", "/at/de/articles/explore-the-world/eat-see-do-nice", "/at/de/articles/explore-the-world/eat-see-do-olbia", "/at/de/articles/explore-the-world/eat-see-do-porto", "/at/de/articles/explore-the-world/eat-see-do-raleigh-durham", "/at/de/articles/explore-the-world/eat-see-do-riga", "/at/de/articles/explore-the-world/eat-see-do-riyadh", "/at/de/articles/explore-the-world/eat-see-do-san-diego", "/at/de/articles/explore-the-world/eat-see-do-seattle", "/at/de/articles/explore-the-world/eat-see-do-st-louis", "/at/de/articles/explore-the-world/eat-see-do-tallinn", "/at/de/articles/explore-the-world/eat-see-do-tbilisi", "/at/de/articles/explore-the-world/eat-see-do-tel-aviv", "/at/de/articles/explore-the-world/eat-see-do-thessaloniki", "/at/de/articles/explore-the-world/eat-see-do-tirana", "/at/de/articles/explore-the-world/eat-see-do-tunis", "/at/de/articles/explore-the-world/eat-see-do-valletta", "/at/de/articles/explore-the-world/eat-see-do-venice", "/at/de/articles/explore-the-world/eat-see-do-vilnius", "/at/de/articles/explore-the-world/eat-see-do-zagreb", "/at/de/articles/explore-the-world/essentials-amsterdam-facts", "/at/de/articles/explore-the-world/essentials-athens-facts", "/at/de/articles/explore-the-world/essentials-bangkok-facts", "/at/de/articles/explore-the-world/essentials-barcelona-facts", "/at/de/articles/explore-the-world/essentials-beijing-facts", "/at/de/articles/explore-the-world/essentials-bengaluru-facts", "/at/de/articles/explore-the-world/essentials-boston-facts", "/at/de/articles/explore-the-world/essentials-budapest-facts", "/at/de/articles/explore-the-world/essentials-buenos-aires-facts", "/at/de/articles/explore-the-world/essentials-cape-town-facts", "/at/de/articles/explore-the-world/essentials-charlotte-facts", "/at/de/articles/explore-the-world/essentials-chicago-facts", "/at/de/articles/explore-the-world/essentials-copenhagen-facts", "/at/de/articles/explore-the-world/essentials-dublin-facts", "/at/de/articles/explore-the-world/essentials-facts-vancouver", "/at/de/articles/explore-the-world/essentials-frankfurt-facts", "/at/de/articles/explore-the-world/essentials-helsinki-facts", "/at/de/articles/explore-the-world/essentials-hong-kong-facts", "/at/de/articles/explore-the-world/essentials-istanbul-facts", "/at/de/articles/explore-the-world/essentials-johannesburg-facts", "/at/de/articles/explore-the-world/essentials-la-facts", "/at/de/articles/explore-the-world/essentials-lisbon-facts", "/at/de/articles/explore-the-world/essentials-london-facts", "/at/de/articles/explore-the-world/essentials-madrid-facts", "/at/de/articles/explore-the-world/essentials-mallorca-facts", "/at/de/articles/explore-the-world/essentials-mexico-city-facts", "/at/de/articles/explore-the-world/essentials-miami-facts", "/at/de/articles/explore-the-world/essentials-milan-facts", "/at/de/articles/explore-the-world/essentials-mumbai-facts", "/at/de/articles/explore-the-world/essentials-munich-facts", "/at/de/articles/explore-the-world/essentials-ny-facts", "/at/de/articles/explore-the-world/essentials-oslo-facts", "/at/de/articles/explore-the-world/essentials-paris-facts", "/at/de/articles/explore-the-world/essentials-prague-facts", "/at/de/articles/explore-the-world/essentials-rio-de-janeiro-facts", "/at/de/articles/explore-the-world/essentials-rome-facts", "/at/de/articles/explore-the-world/essentials-san-francisco-facts", "/at/de/articles/explore-the-world/essentials-seoul-facts", "/at/de/articles/explore-the-world/essentials-shanghai-facts", "/at/de/articles/explore-the-world/essentials-singapore-facts", "/at/de/articles/explore-the-world/essentials-stockholm-facts", "/at/de/articles/explore-the-world/essentials-tokyo-facts", "/at/de/articles/explore-the-world/essentials-toronto-facts", "/at/de/articles/explore-the-world/essentials-vienna-facts", "/at/de/articles/explore-the-world/essentials-washington-facts", "/at/de/articles/explore-the-world/essentials-zurich-facts", "/at/de/articles/explore-the-world/experience-art-live", "/at/de/articles/explore-the-world/experience-nature", "/at/de/articles/explore-the-world/in-my-hood-apgujeong-seoul", "/at/de/articles/explore-the-world/in-my-hood-arroios-lissabon", "/at/de/articles/explore-the-world/in-my-hood-back-bay-boston", "/at/de/articles/explore-the-world/in-my-hood-bandra-mumbai", "/at/de/articles/explore-the-world/in-my-hood-chiswick-london", "/at/de/articles/explore-the-world/in-my-hood-citta-studi-milan", "/at/de/articles/explore-the-world/in-my-hood-city-centre-cape-town", "/at/de/articles/explore-the-world/in-my-hood-comercial-drive-vancouver", "/at/de/articles/explore-the-world/in-my-hood-coyoacan-mexico-city", "/at/de/articles/explore-the-world/in-my-hood-creative-quarter-dublin", "/at/de/articles/explore-the-world/in-my-hood-district-helsinki", "/at/de/articles/explore-the-world/in-my-hood-district-houston", "/at/de/articles/explore-the-world/in-my-hood-district-malaga", "/at/de/articles/explore-the-world/in-my-hood-district-nairobi", "/at/de/articles/explore-the-world/in-my-hood-district-porto", "/at/de/articles/explore-the-world/in-my-hood-district-viii-budapest", "/at/de/articles/explore-the-world/in-my-hood-district-zurich", "/at/de/articles/explore-the-world/in-my-hood-gamlebyen-oslo", "/at/de/articles/explore-the-world/in-my-hood-geylang-singapur", "/at/de/articles/explore-the-world/in-my-hood-gulou-beijing", "/at/de/articles/explore-the-world/in-my-hood-hollywood-road-hong-kong", "/at/de/articles/explore-the-world/in-my-hood-indiranagar-bengaluru", "/at/de/articles/explore-the-world/in-my-hood-ipanema-rio-de-janeiro", "/at/de/articles/explore-the-world/in-my-hood-japantown-san-francisco", "/at/de/articles/explore-the-world/in-my-hood-kadikoey-istanbul", "/at/de/articles/explore-the-world/in-my-hood-kampung-attap-kuala-lumpur", "/at/de/articles/explore-the-world/in-my-hood-kreuzberg-berlin", "/at/de/articles/explore-the-world/in-my-hood-larchmont-la", "/at/de/articles/explore-the-world/in-my-hood-le-sentier-paris", "/at/de/articles/explore-the-world/in-my-hood-mallorca", "/at/de/articles/explore-the-world/in-my-hood-metaxourgeio-athens", "/at/de/articles/explore-the-world/in-my-hood-mount-pleasant-washington", "/at/de/articles/explore-the-world/in-my-hood-munich-sendling", "/at/de/articles/explore-the-world/in-my-hood-nice-ouest", "/at/de/articles/explore-the-world/in-my-hood-noord-amsterdam", "/at/de/articles/explore-the-world/in-my-hood-ny-brooklyn", "/at/de/articles/explore-the-world/in-my-hood-osterbro-kopenhagen", "/at/de/articles/explore-the-world/in-my-hood-palermo-buenos-aires", "/at/de/articles/explore-the-world/in-my-hood-plaza-midwood-charlotte", "/at/de/articles/explore-the-world/in-my-hood-poblenou-barcelona", "/at/de/articles/explore-the-world/in-my-hood-rome-pigneto-rome", "/at/de/articles/explore-the-world/in-my-hood-rosebank-johannesburg", "/at/de/articles/explore-the-world/in-my-hood-sachsenhausen-frankfurt", "/at/de/articles/explore-the-world/in-my-hood-salamanca-madrid", "/at/de/articles/explore-the-world/in-my-hood-schanzenviertel-hamburg", "/at/de/articles/explore-the-world/in-my-hood-schaumburg-chicago", "/at/de/articles/explore-the-world/in-my-hood-seventh-district-vienna", "/at/de/articles/explore-the-world/in-my-hood-shinjuku-tokyo", "/at/de/articles/explore-the-world/in-my-hood-song-wat-road-bangkok", "/at/de/articles/explore-the-world/in-my-hood-south-beach-miami", "/at/de/articles/explore-the-world/in-my-hood-the-bund-shanghai", "/at/de/articles/explore-the-world/in-my-hood-toronto-summerhill", "/at/de/articles/explore-the-world/in-my-hood-vasastaden-stockholm", "/at/de/articles/explore-the-world/in-my-hood-vrsovice-prague", "/at/de/articles/explore-the-world/in-my-hood-west-seattle-seattle", "/at/de/articles/explore-the-world/know-before-you-go-algiers", "/at/de/articles/explore-the-world/know-before-you-go-almaty", "/at/de/articles/explore-the-world/know-before-you-go-amman", "/at/de/articles/explore-the-world/know-before-you-go-atlanta", "/at/de/articles/explore-the-world/know-before-you-go-beijing", "/at/de/articles/explore-the-world/know-before-you-go-berlin", "/at/de/articles/explore-the-world/know-before-you-go-bilbao", "/at/de/articles/explore-the-world/know-before-you-go-bogota", "/at/de/articles/explore-the-world/know-before-you-go-boston", "/at/de/articles/explore-the-world/know-before-you-go-cagliari", "/at/de/articles/explore-the-world/know-before-you-go-cairo", "/at/de/articles/explore-the-world/know-before-you-go-casablanca", "/at/de/articles/explore-the-world/know-before-you-go-catania", "/at/de/articles/explore-the-world/know-before-you-go-chennai", "/at/de/articles/explore-the-world/know-before-you-go-dallas", "/at/de/articles/explore-the-world/know-before-you-go-denver", "/at/de/articles/explore-the-world/know-before-you-go-detroit", "/at/de/articles/explore-the-world/know-before-you-go-dubai", "/at/de/articles/explore-the-world/know-before-you-go-edinburgh", "/at/de/articles/explore-the-world/know-before-you-go-faro", "/at/de/articles/explore-the-world/know-before-you-go-gothenburg", "/at/de/articles/explore-the-world/know-before-you-go-hamburg", "/at/de/articles/explore-the-world/know-before-you-go-houston", "/at/de/articles/explore-the-world/know-before-you-go-hyderabad", "/at/de/articles/explore-the-world/know-before-you-go-kuala-lumpur", "/at/de/articles/explore-the-world/know-before-you-go-larnaca", "/at/de/articles/explore-the-world/know-before-you-go-ljubljana", "/at/de/articles/explore-the-world/know-before-you-go-malaga", "/at/de/articles/explore-the-world/know-before-you-go-manchester", "/at/de/articles/explore-the-world/know-before-you-go-marseille", "/at/de/articles/explore-the-world/know-before-you-go-minneapolis-st-paul", "/at/de/articles/explore-the-world/know-before-you-go-nairobi", "/at/de/articles/explore-the-world/know-before-you-go-nice", "/at/de/articles/explore-the-world/know-before-you-go-olbia", "/at/de/articles/explore-the-world/know-before-you-go-porto", "/at/de/articles/explore-the-world/know-before-you-go-raleigh-durham", "/at/de/articles/explore-the-world/know-before-you-go-riga", "/at/de/articles/explore-the-world/know-before-you-go-riyadh", "/at/de/articles/explore-the-world/know-before-you-go-san-diego", "/at/de/articles/explore-the-world/know-before-you-go-seattle", "/at/de/articles/explore-the-world/know-before-you-go-st-louis", "/at/de/articles/explore-the-world/know-before-you-go-tallinn", "/at/de/articles/explore-the-world/know-before-you-go-tbilisi", "/at/de/articles/explore-the-world/know-before-you-go-tel-aviv", "/at/de/articles/explore-the-world/know-before-you-go-thessaloniki", "/at/de/articles/explore-the-world/know-before-you-go-tirana", "/at/de/articles/explore-the-world/know-before-you-go-tunis", "/at/de/articles/explore-the-world/know-before-you-go-valletta", "/at/de/articles/explore-the-world/know-before-you-go-venice", "/at/de/articles/explore-the-world/know-before-you-go-vilnius", "/at/de/articles/explore-the-world/know-before-you-go-zagreb", "/at/de/articles/explore-the-world/my-experiences-in-vancouver", "/at/de/articles/explore-the-world/new-shopping", "/at/de/articles/explore-the-world/next-level-gaming", "/at/de/articles/explore-the-world/on-the-scene-architecture-copenhagen", "/at/de/articles/explore-the-world/on-the-scene-art-and-pubs-dublin", "/at/de/articles/explore-the-world/on-the-scene-art-johannesburg", "/at/de/articles/explore-the-world/on-the-scene-bar-basso-milan", "/at/de/articles/explore-the-world/on-the-scene-bookstores-buenos-aires", "/at/de/articles/explore-the-world/on-the-scene-braamfontein-johannesburg", "/at/de/articles/explore-the-world/on-the-scene-brunch-restaurants-la", "/at/de/articles/explore-the-world/on-the-scene-caspar-plautz-munich", "/at/de/articles/explore-the-world/on-the-scene-chicago-beer", "/at/de/articles/explore-the-world/on-the-scene-creative-architecture-prague", "/at/de/articles/explore-the-world/on-the-scene-culinary-trip-washington", "/at/de/articles/explore-the-world/on-the-scene-fashion-and-culture-budapest", "/at/de/articles/explore-the-world/on-the-scene-food-mumbai", "/at/de/articles/explore-the-world/on-the-scene-food-trends-amsterdam", "/at/de/articles/explore-the-world/on-the-scene-food-trends-bengaluru", "/at/de/articles/explore-the-world/on-the-scene-food-trends-istanbul", "/at/de/articles/explore-the-world/on-the-scene-hidden-gems-seoul", "/at/de/articles/explore-the-world/on-the-scene-humor-vienna", "/at/de/articles/explore-the-world/on-the-scene-listening-bars-toronto", "/at/de/articles/explore-the-world/on-the-scene-lunch-mexico-city", "/at/de/articles/explore-the-world/on-the-scene-mallorca", "/at/de/articles/explore-the-world/on-the-scene-music-cape-town", "/at/de/articles/explore-the-world/on-the-scene-samba-rio-de-janeiro", "/at/de/articles/explore-the-world/on-the-scene-san-francisco-fashion", "/at/de/articles/explore-the-world/on-the-scene-shanghai-art-scene", "/at/de/articles/explore-the-world/on-the-scene-shopping-barcelona", "/at/de/articles/explore-the-world/on-the-scene-shopping-lisbon", "/at/de/articles/explore-the-world/on-the-scene-shopping-tokyo", "/at/de/articles/explore-the-world/on-the-scene-sports-miami", "/at/de/articles/explore-the-world/on-the-scene-stockholm", "/at/de/articles/explore-the-world/on-the-scene-street-art-charlotte", "/at/de/articles/explore-the-world/on-the-scene-street-art-london", "/at/de/articles/explore-the-world/on-the-scene-streetart-athens", "/at/de/articles/explore-the-world/on-the-scene-super-bros-frankfurt", "/at/de/articles/explore-the-world/on-the-scene-supper-clubs-ny", "/at/de/articles/explore-the-world/on-the-scene-techno-sound-rome", "/at/de/articles/explore-the-world/on-the-scene-tips-oslo", "/at/de/articles/explore-the-world/on-the-scene-topic-bangkok", "/at/de/articles/explore-the-world/on-the-scene-topic-helsinki", "/at/de/articles/explore-the-world/on-the-scene-topic-zurich", "/at/de/articles/explore-the-world/on-the-scene-trends-madrid", "/at/de/articles/explore-the-world/on-the-scene-urban-farming-singapore", "/at/de/articles/explore-the-world/on-the-scene-vancouver-donuts", "/at/de/articles/explore-the-world/on-the-scene-wellness-cuisine-hong-kong", "/at/de/articles/explore-the-world/perfect-day-nice-cote-dazur", "/at/de/articles/explore-the-world/perfect-day-seattle", "/at/de/articles/explore-the-world/perfect-day-tips-vancouver", "/at/de/articles/explore-the-world/picture-perfect-austin", "/at/de/articles/explore-the-world/picture-perfect-beijing", "/at/de/articles/explore-the-world/picture-perfect-bogota", "/at/de/articles/explore-the-world/picture-perfect-boston", "/at/de/articles/explore-the-world/picture-perfect-cairo", "/at/de/articles/explore-the-world/picture-perfect-elevator-boys", "/at/de/articles/explore-the-world/picture-perfect-hyderabad", "/at/de/articles/explore-the-world/picture-perfect-la", "/at/de/articles/explore-the-world/picture-perfect-ny", "/at/de/articles/explore-the-world/picture-perfect-riad", "/at/de/articles/explore-the-world/picture-perfect-singapore", "/at/de/articles/explore-the-world/sao-paulo-sights", "/at/de/articles/explore-the-world/stop-over-bangkok", "/at/de/articles/explore-the-world/stop-over-beijing", "/at/de/articles/explore-the-world/stop-over-boston", "/at/de/articles/explore-the-world/stop-over-buenos-aires", "/at/de/articles/explore-the-world/stop-over-charlotte", "/at/de/articles/explore-the-world/stop-over-hong-kong", "/at/de/articles/explore-the-world/stop-over-johannesburg", "/at/de/articles/explore-the-world/stop-over-los-angeles", "/at/de/articles/explore-the-world/stop-over-mexico-city", "/at/de/articles/explore-the-world/stop-over-seoul", "/at/de/articles/explore-the-world/stop-over-singapore", "/at/de/articles/explore-the-world/stop-over-tokyo", "/at/de/articles/explore-the-world/stop-over-washington", "/at/de/articles/explore-the-world/team-sport", "/at/de/articles/explore-the-world/what-i-learned-living-in-amsterdam", "/at/de/articles/explore-the-world/what-i-learned-living-in-athens", "/at/de/articles/explore-the-world/what-i-learned-living-in-bangkok", "/at/de/articles/explore-the-world/what-i-learned-living-in-barcelona", "/at/de/articles/explore-the-world/what-i-learned-living-in-bengaluru", "/at/de/articles/explore-the-world/what-i-learned-living-in-boston", "/at/de/articles/explore-the-world/what-i-learned-living-in-budapest", "/at/de/articles/explore-the-world/what-i-learned-living-in-buenos-aires", "/at/de/articles/explore-the-world/what-i-learned-living-in-cape-town", "/at/de/articles/explore-the-world/what-i-learned-living-in-charlotte", "/at/de/articles/explore-the-world/what-i-learned-living-in-chicago", "/at/de/articles/explore-the-world/what-i-learned-living-in-dublin", "/at/de/articles/explore-the-world/what-i-learned-living-in-frankfurt", "/at/de/articles/explore-the-world/what-i-learned-living-in-helsinki", "/at/de/articles/explore-the-world/what-i-learned-living-in-hong-kong", "/at/de/articles/explore-the-world/what-i-learned-living-in-istanbul", "/at/de/articles/explore-the-world/what-i-learned-living-in-johannesburg", "/at/de/articles/explore-the-world/what-i-learned-living-in-la", "/at/de/articles/explore-the-world/what-i-learned-living-in-lisbon", "/at/de/articles/explore-the-world/what-i-learned-living-in-london", "/at/de/articles/explore-the-world/what-i-learned-living-in-madrid", "/at/de/articles/explore-the-world/what-i-learned-living-in-mallorca", "/at/de/articles/explore-the-world/what-i-learned-living-in-mexico-city", "/at/de/articles/explore-the-world/what-i-learned-living-in-miami", "/at/de/articles/explore-the-world/what-i-learned-living-in-milan", "/at/de/articles/explore-the-world/what-i-learned-living-in-mumbai", "/at/de/articles/explore-the-world/what-i-learned-living-in-munich", "/at/de/articles/explore-the-world/what-i-learned-living-in-ny", "/at/de/articles/explore-the-world/what-i-learned-living-in-oslo", "/at/de/articles/explore-the-world/what-i-learned-living-in-paris", "/at/de/articles/explore-the-world/what-i-learned-living-in-prague", "/at/de/articles/explore-the-world/what-i-learned-living-in-rio-de-janeiro", "/at/de/articles/explore-the-world/what-i-learned-living-in-rome", "/at/de/articles/explore-the-world/what-i-learned-living-in-san-francisco", "/at/de/articles/explore-the-world/what-i-learned-living-in-seoul", "/at/de/articles/explore-the-world/what-i-learned-living-in-shanghai", "/at/de/articles/explore-the-world/what-i-learned-living-in-singapore", "/at/de/articles/explore-the-world/what-i-learned-living-in-stockholm", "/at/de/articles/explore-the-world/what-i-learned-living-in-tokyo", "/at/de/articles/explore-the-world/what-i-learned-living-in-toronto", "/at/de/articles/explore-the-world/what-i-learned-living-in-vienna", "/at/de/articles/explore-the-world/what-i-learned-living-in-washington", "/at/de/articles/explore-the-world/what-i-learned-living-in-zurich", "/at/de/articles/highlights", "/at/de/articles/highlights-european-championship", "/at/de/articles/highlights-european-championship/european-championship-2024-great-hope", "/at/de/articles/highlights-european-championship/european-championship-2024-locations", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-andrich", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-anton", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-baumann", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-beier", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-fuellkrug", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-kimmich", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-kroos", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-mittelstaedt", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-raum", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-tah", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-ter-stegen", "/at/de/articles/highlights-european-championship/european-championship-2024-player-videos-undav", "/at/de/articles/highlights-european-championship/european-championship-2024-quiz", "/at/de/articles/highlights-european-championship/european-championship-2024-thank-you", "/at/de/articles/highlights-european-championship/hungary-with-pride-and-passion", "/at/de/articles/highlights-european-championship/lose-like-the-germans", "/at/de/articles/highlights-european-championship/meet-the-germans", "/at/de/articles/highlights-european-championship/scotland-with-heart-and-energy", "/at/de/articles/highlights-european-championship/swiss-passion-meets-precision", "/at/de/articles/highlights/all-it-takes-is-a-yes", "/at/de/articles/highlights/allegris-a-new-flight-experience", "/at/de/articles/highlights/allegris-business-class-shanghai", "/at/de/articles/highlights/allegris-business-san-diego", "/at/de/articles/highlights/allegris-destinations", "/at/de/articles/highlights/allegris-dirk-nowitzki", "/at/de/articles/highlights/allegris-essentials", "/at/de/articles/highlights/allegris-experiences", "/at/de/articles/highlights/allegris-new-york", "/at/de/articles/highlights/allegris-premium-economy-san-diego", "/at/de/articles/highlights/allegris-travel-hacks", "/at/de/articles/highlights/allegris-typologies", "/at/de/articles/highlights/austin-texas-city-of-live-music", "/at/de/articles/highlights/chisinau-winter", "/at/de/articles/highlights/dfb-partnership-diversity-success", "/at/de/articles/highlights/exclusive-first-class-tracksuit", "/at/de/articles/highlights/fashion-footprints-new-york", "/at/de/articles/highlights/hyderabad-city-of-pearls-and-programmers", "/at/de/articles/highlights/johannesburg-winter", "/at/de/articles/highlights/minneapolis-best-winter-activities", "/at/de/articles/highlights/minneapolis-winter", "/at/de/articles/highlights/new-york-fashion-week", "/at/de/articles/highlights/raleigh-nc-winter", "/at/de/articles/highlights/rome-art-and-culture", "/at/de/articles/highlights/sao-paulo-carnival-brazil-largest-street-carnival", "/at/de/articles/highlights/seattle-winter", "/at/de/articles/highlights/shanghai-best-restaurants-and-traditional-chinese-dishes", "/at/de/articles/highlights/sports-experiences-rio-de-janeiro", "/at/de/articles/highlights/stefan-marx-travel-hacks", "/at/de/articles/highlights/the-art-of-flying-extra-long-bed", "/at/de/articles/highlights/the-art-of-flying-extra-space-seat", "/at/de/articles/highlights/the-art-of-flying-suite", "/at/de/articles/highlights/vancouver-winter", "/at/de/articles/tags", "/at/de/articles/tags/algiers", "/at/de/articles/tags/allegris", "/at/de/articles/tags/allegris-inspires", "/at/de/articles/tags/almaty", "/at/de/articles/tags/amman", "/at/de/articles/tags/amsterdam", "/at/de/articles/tags/art", "/at/de/articles/tags/art-basel-miami-beach", "/at/de/articles/tags/athens", "/at/de/articles/tags/atlanta", "/at/de/articles/tags/bangkok", "/at/de/articles/tags/barcelona", "/at/de/articles/tags/be-picky", "/at/de/articles/tags/beijing", "/at/de/articles/tags/bengaluru", "/at/de/articles/tags/berlin", "/at/de/articles/tags/bilbao", "/at/de/articles/tags/bogota", "/at/de/articles/tags/boston", "/at/de/articles/tags/budapest", "/at/de/articles/tags/buenos-aires", "/at/de/articles/tags/cagliari", "/at/de/articles/tags/cairo", "/at/de/articles/tags/cape-town", "/at/de/articles/tags/casablanca", "/at/de/articles/tags/catania", "/at/de/articles/tags/charlotte", "/at/de/articles/tags/chennai", "/at/de/articles/tags/chicago", "/at/de/articles/tags/copenhagen", "/at/de/articles/tags/dallas", "/at/de/articles/tags/denver", "/at/de/articles/tags/detroit", "/at/de/articles/tags/dubai", "/at/de/articles/tags/dublin", "/at/de/articles/tags/eat-see-do", "/at/de/articles/tags/edinburgh", "/at/de/articles/tags/essentials", "/at/de/articles/tags/faro", "/at/de/articles/tags/fly-with-me", "/at/de/articles/tags/flying-high", "/at/de/articles/tags/food", "/at/de/articles/tags/frankfurt", "/at/de/articles/tags/frequent-flyers", "/at/de/articles/tags/future-of-flying", "/at/de/articles/tags/gothenburg", "/at/de/articles/tags/hamburg", "/at/de/articles/tags/helsinki", "/at/de/articles/tags/history", "/at/de/articles/tags/hong-kong", "/at/de/articles/tags/houston", "/at/de/articles/tags/hyderabad", "/at/de/articles/tags/in-my-hood", "/at/de/articles/tags/inside-lufthansa", "/at/de/articles/tags/istanbul", "/at/de/articles/tags/johannesburg", "/at/de/articles/tags/know-before-you-go", "/at/de/articles/tags/kuala-lumpur", "/at/de/articles/tags/larnaca", "/at/de/articles/tags/lisbon", "/at/de/articles/tags/ljubljana", "/at/de/articles/tags/london", "/at/de/articles/tags/los-angeles", "/at/de/articles/tags/madrid", "/at/de/articles/tags/malaga", "/at/de/articles/tags/mallorca", "/at/de/articles/tags/manchester", "/at/de/articles/tags/marseille", "/at/de/articles/tags/mexico-city", "/at/de/articles/tags/miami", "/at/de/articles/tags/milan", "/at/de/articles/tags/minneapolis-st-paul", "/at/de/articles/tags/mumbai", "/at/de/articles/tags/munich", "/at/de/articles/tags/music", "/at/de/articles/tags/my-world", "/at/de/articles/tags/nairobi", "/at/de/articles/tags/new-york", "/at/de/articles/tags/nice", "/at/de/articles/tags/olbia", "/at/de/articles/tags/on-the-scene", "/at/de/articles/tags/oslo", "/at/de/articles/tags/paris", "/at/de/articles/tags/perfect-day", "/at/de/articles/tags/picture-perfect", "/at/de/articles/tags/porto", "/at/de/articles/tags/prague", "/at/de/articles/tags/raleigh-durham", "/at/de/articles/tags/riga", "/at/de/articles/tags/rio-de-janeiro", "/at/de/articles/tags/riyadh", "/at/de/articles/tags/rome", "/at/de/articles/tags/san-diego", "/at/de/articles/tags/san-francisco", "/at/de/articles/tags/seattle", "/at/de/articles/tags/seoul", "/at/de/articles/tags/shanghai", "/at/de/articles/tags/shopping", "/at/de/articles/tags/singapore", "/at/de/articles/tags/sport", "/at/de/articles/tags/st-louis", "/at/de/articles/tags/stockholm", "/at/de/articles/tags/stop-over", "/at/de/articles/tags/tallinn", "/at/de/articles/tags/tbilisi", "/at/de/articles/tags/team-stories", "/at/de/articles/tags/tel-aviv", "/at/de/articles/tags/thessaloniki", "/at/de/articles/tags/tirana", "/at/de/articles/tags/tokyo", "/at/de/articles/tags/toronto", "/at/de/articles/tags/tunis", "/at/de/articles/tags/valletta", "/at/de/articles/tags/vancouver", "/at/de/articles/tags/venice", "/at/de/articles/tags/vienna", "/at/de/articles/tags/vilnius", "/at/de/articles/tags/washington-dc", "/at/de/articles/tags/what-i-learned", "/at/de/articles/tags/what-the-hack", "/at/de/articles/tags/yes-stories", "/at/de/articles/tags/zagreb", "/at/de/articles/tags/zurich", "/at/de/assistenzhunde", "/at/de/automatic-check-in", "/at/de/baggage-irregularities", "/at/de/bedeutsamste-strecken", "/at/de/befoerderungsbedingungen-group", "/at/de/befoerderungsbedingungen-lh", "/at/de/besondere-befoerderungsbedingungen-bus", "/at/de/betreuungsbedarf", "/at/de/bid-upgrade", "/at/de/boarding", "/at/de/boeing787", "/at/de/book-and-manage/additional-services/get-your-guide", "/at/de/book-and-manage/additional-services/travel-insurances", "/at/de/book-and-manage/booking-services/manage-my-bookings", "/at/de/book-and-manage/cancellation-and-refund/refund/confirmation", "/at/de/book-and-manage/cancellation-and-refund/refund/refund-form", "/at/de/book-and-manage/destination", "/at/de/book-and-manage/digital-self-services/airline-apps", "/at/de/book-and-manage/flights/air-baltic", "/at/de/book-and-manage/flights/ana", "/at/de/book-and-manage/flights/ana/faq", "/at/de/book-and-manage/flights/giftvoucher", "/at/de/book-and-manage/flights/helvetic", "/at/de/book-and-manage/flights/lufthansa-voucher", "/at/de/book-and-manage/flights/wetlease-hub", "/at/de/book-and-manage/passenger-receipt-90days/confirmation", "/at/de/book-and-manage/pax-receipt", "/at/de/book-and-manage/pax-receipt/invoices-different-countries", "/at/de/book-and-manage/rebook", "/at/de/book-and-manage/rebook/involuntary-rebooking", "/at/de/book-and-manage/rebook/voluntary-rebooking", "/at/de/book-and-manage/stopover", "/at/de/book-and-manage/stopover/bayerischer-hof", "/at/de/book-and-manage/stopover/neuschwanstein", "/at/de/book-and-manage/stopover/zugspitze", "/at/de/book-and-manage/trip-management", "/at/de/business-class", "/at/de/business-class-auf-kurz-und-mittelstrecken", "/at/de/business-services", "/at/de/cancellations-and-refunds", "/at/de/cash-and-miles", "/at/de/check-in-baggage", "/at/de/check-in-deadlines", "/at/de/common", "/at/de/common/accessibility-statement", "/at/de/common/agb-extra-services-at-online-check-in", "/at/de/common/agb-extra-services-at-online-check-in/conditions-seat-reservation", "/at/de/common/baggage-conditions", "/at/de/common/compensation-voucher", "/at/de/common/imprint/lufthansa-insights-imprint", "/at/de/common/privacy-statement/privacy-statement-group", "/at/de/common/seatreservation-condtions/seat-reservations", "/at/de/cookie-policy", "/at/de/culinaryjourney", "/at/de/dangerous-dogs", "/at/de/datenerfassung-fuer-die-usa", "/at/de/datenerfassung-fuer-kanada", "/at/de/datenschutz", "/at/de/digital-self-services", "/at/de/digital-travel-companion", "/at/de/digitale-gepaeckservices", "/at/de/discover-lufthansa/carbon-offsetting/climate-protection-projects", "/at/de/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge", "/at/de/discover-lufthansa/carbon-offsetting/faq-saf", "/at/de/discover-lufthansa/carbon-offsetting/saf", "/at/de/discover-lufthansa/flightreservation-priceguarantee", "/at/de/discover-lufthansa/lufthansa-fleet/351", "/at/de/discover-lufthansa/lufthansa-group-airlines/ita-airways", "/at/de/discover-lufthansa/miles-and-more-credit-card", "/at/de/discover-lufthansa/new-onboard-experience", "/at/de/discover-lufthansa/register-newsletter", "/at/de/discover-lufthansa/take-off", "/at/de/doctor-on-board", "/at/de/doctor-on-board-news", "/at/de/during-your-trip/internet-overview", "/at/de/during-your-trip/lhg-wifi", "/at/de/economy-class", "/at/de/electronic-bag-tags", "/at/de/entryprocesses", "/at/de/europa-tarife-economy-class", "/at/de/europcar", "/at/de/event/esorics-2027", "/at/de/exclusive-charter", "/at/de/faq-data-security", "/at/de/faq-ejournals", "/at/de/faq-password-security", "/at/de/farealert/best-price-alert", "/at/de/feedback", "/at/de/feedback-past-flight", "/at/de/feedback/feedbackai", "/at/de/fia-valet-service", "/at/de/first-class", "/at/de/first-class-lounges", "/at/de/first-class-personal-assistant", "/at/de/first-class-terminal", "/at/de/first-class-valet-parking-service", "/at/de/fliegen-mit-baby", "/at/de/fliegen-mit-kindern", "/at/de/fliegen-mit-kleinkind", "/at/de/fluege", "/at/de/flughafeninformation", "/at/de/flugplan-und-flugstatus", "/at/de/flugsuche", "/at/de/flugunregelmaessigkeiten", "/at/de/flynet", "/at/de/fmg-valet-parking-service", "/at/de/frankfurt-fair", "/at/de/free2move", "/at/de/freigepaeck-regeln", "/at/de/gefaehrliche-gegenstaende", "/at/de/gepaeck", "/at/de/geschaeftsbedingungen", "/at/de/gesund-reisen", "/at/de/good-for-train", "/at/de/green-fare", "/at/de/group-travel", "/at/de/gruppenreisen-und-charter", "/at/de/handgepaeck", "/at/de/help-and-contact", "/at/de/hertz", "/at/de/homepage", "/at/de/hotelangebote", "/at/de/impressum", "/at/de/informationen-zum-datenschutz", "/at/de/kinder-an-bord", "/at/de/kindermenues-an-bord", "/at/de/local-page/black-friday", "/at/de/lounge-begleitung", "/at/de/lounges", "/at/de/lufthansa-am-flughafen-duesseldorf", "/at/de/lufthansa-am-flughafen-frankfurt", "/at/de/lufthansa-am-flughafen-wien", "/at/de/lufthansa-at-berlin-airport", "/at/de/lufthansa-at-zuerich-airport", "/at/de/lufthansa-aviation-group", "/at/de/lufthansa-business-class-on-long-haul-routes", "/at/de/lufthansa-city/culinaryjourney", "/at/de/lufthansa-city/menu-card", "/at/de/lufthansa-ejournals", "/at/de/lufthansa-express", "/at/de/lufthansa-express-bus", "/at/de/lufthansa-express-rail", "/at/de/lufthansa-firmenkunden", "/at/de/lufthansa-first-class-entertainment", "/at/de/lufthansa-first-class-flotte", "/at/de/lufthansa-first-class-komfort", "/at/de/lufthansa-group-star-alliance-and-partner-airlines", "/at/de/lufthansa-guide-service", "/at/de/lufthansa-reiseklassen", "/at/de/lufthansa-terminal-muenchen", "/at/de/medikamenten-transport", "/at/de/meetings-and-events", "/at/de/meetings-und-events-individuelle-angebotsanfrage", "/at/de/meetings-und-events-teilnehmer", "/at/de/mein-logbuch", "/at/de/meine-buchungen", "/at/de/menues-auf-langstreckenfluegen", "/at/de/menues-reiseklassen", "/at/de/mietwagenangebote", "/at/de/miles-and-more", "/at/de/mit-kindern-am-flughafen", "/at/de/mobility-partner-program-healthcare", "/at/de/munich-fair", "/at/de/nachhaltiger-fliegen", "/at/de/nutzungsbedingungen", "/at/de/nutzungsbedingungen-waehrungsumrechnung", "/at/de/onboard-delights", "/at/de/onboard-delights-faq", "/at/de/online-check-in", "/at/de/online-check-in-info", "/at/de/online-check-in-mit-der-ganzen-familie", "/at/de/overview-flights", "/at/de/overview-manage", "/at/de/overview-special-request", "/at/de/overview-travel-information", "/at/de/partner", "/at/de/passenger-receipt-90", "/at/de/passenger-rights", "/at/de/passengers-using-wheelchairs", "/at/de/passengers-with-sensory-impairment", "/at/de/pre-check-in", "/at/de/premium-economy-class", "/at/de/prepare-for-your-trip/airport-information/services-at-the-airport/security-waiting-time", "/at/de/prepare-for-your-trip/baggage/baggage-conditions", "/at/de/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg", "/at/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay", "/at/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage", "/at/de/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage", "/at/de/prepare-for-your-trip/baggage/electronic-devices-and-batteries", "/at/de/prepare-for-your-trip/baggage/sport-baggage/register-ammunition", "/at/de/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation", "/at/de/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation", "/at/de/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation", "/at/de/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation", "/at/de/prepare-for-your-trip/current-travel-information", "/at/de/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system", "/at/de/prepare-for-your-trip/entry-regulations/immigration-regulations-uk", "/at/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing", "/at/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing", "/at/de/prepare-for-your-trip/special-travel-needs/medical-travel-companions", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment", "/at/de/prepare-for-your-trip/travel-classes/economy-basic", "/at/de/prepare-for-your-trip/travelling-with-children/child-in-businessclass", "/at/de/prepare-for-your-trip/travelling-with-children/planning-with-kids", "/at/de/rail-and-fly", "/at/de/rail-fly-bedingungen", "/at/de/rechnungsbeleg", "/at/de/refund", "/at/de/register-animal-cabin", "/at/de/reisebueros", "/at/de/reisen-mit-besonderen-anforderungen", "/at/de/rollstuhlbatterien", "/at/de/schengen", "/at/de/secure-flight", "/at/de/security-fast-lanes", "/at/de/sepa-bedingungen", "/at/de/sepa-bedingungen-b", "/at/de/services-am-flughafen", "/at/de/services-am-flughafen-frankfurt", "/at/de/services-am-flughafen-muenchen", "/at/de/services-an-bord", "/at/de/shopping", "/at/de/sicherheit-fuer-kleinkinder-an-bord", "/at/de/sitzplaene", "/at/de/sitzplatzreservierungen-konditionen", "/at/de/sixt", "/at/de/sondermahlzeiten", "/at/de/speisen-und-getraenke", "/at/de/sportgepaeck", "/at/de/sportgepaeck-hinzufuegen", "/at/de/support/contact/contact-form-confirmation", "/at/de/support/contact/passenger-duty-united-kingdom", "/at/de/support/fast-compensation/compensation-flight-disruptions", "/at/de/support/feedback-and-contact-airlines", "/at/de/support/search/search-result", "/at/de/support/support", "/at/de/tiere-als-handgepaeck", "/at/de/tiere-als-uebergepaeck", "/at/de/tips-senior-travellers", "/at/de/travel-briefing", "/at/de/travel-expense-management", "/at/de/travel-id-terms-conditions", "/at/de/travelling-with-animals", "/at/de/traveltricks", "/at/de/uebergepaeck", "/at/de/unterhaltung-an-bord", "/at/de/upgrade-business-class-langstrecke", "/at/de/upgrade-first-class", "/at/de/upgrade-in-die-business-class", "/at/de/upgrade-in-die-premium-economy-class", "/at/de/upgrade-informationen", "/at/de/upgrade-premium-economy-class", "/at/de/upgrademoeglichkeiten", "/at/de/upgrades-im-online-check-in", "/at/de/zahlungsmoeglichkeiten-am-flughafen", "/at/de/zeitfenster-sicherheitskontrolle", "/content/lh/markets/de/en/during-your-trip/lounges/loungenet", "/content/lh/markets/de/en/during-your-trip/lounges/loungenet/fra-first-class-lounge-b", "/content/lh/markets/de/en/during-your-trip/lounges/loungenet/muc-first-class-lounge", "/de/de/100-years", "/de/de/100-years/cabin-design", "/de/de/100-years/campaigns", "/de/de/100-years/chronicle", "/de/de/100-years/crane", "/de/de/100-years/destinations", "/de/de/100-years/fleet", "/de/de/100-years/global-network", "/de/de/100-years/history", "/de/de/100-years/history/menu-on-board", "/de/de/320", "/de/de/32n", "/de/de/359", "/de/de/744", "/de/de/accessible-travel", "/de/de/additional-services", "/de/de/admission-rules", "/de/de/adressen-weltweit", "/de/de/advance-seat-reservation", "/de/de/advice-for-travellers-with-special-needs-to-and-from-the-usa", "/de/de/affiliatemarketing", "/de/de/all-check-in", "/de/de/alleinreisende-kinder", "/de/de/anmeldung-tiere-frachtraum", "/de/de/arrival-services", "/de/de/articles", "/de/de/articles/authors", "/de/de/articles/authors/alexandra-mikamo", "/de/de/articles/authors/florian-schwebel", "/de/de/articles/authors/florian-tomberg", "/de/de/articles/authors/julia-buth", "/de/de/articles/authors/till-weisbrod", "/de/de/articles/explore-flying", "/de/de/articles/explore-flying/7-people-who-shaped-lufthansa-history", "/de/de/articles/explore-flying/a-girl-named-lufthansa", "/de/de/articles/explore-flying/aircraft-lights-explained", "/de/de/articles/explore-flying/allegris-business-class-dirk-nowitzki", "/de/de/articles/explore-flying/allegris-exclusive-first-class-loungewear", "/de/de/articles/explore-flying/allegris-first-class-innovations", "/de/de/articles/explore-flying/allegris-first-class-reasons-for-allegris-first-class", "/de/de/articles/explore-flying/allegris-fox", "/de/de/articles/explore-flying/anniversary-super-crane-special", "/de/de/articles/explore-flying/art-basel-miami-beach-stefan-marx", "/de/de/articles/explore-flying/best-airport-restaurants", "/de/de/articles/explore-flying/business-class-culinary-journey-with-johann-lafer", "/de/de/articles/explore-flying/celebrating-20-years-of-excellence", "/de/de/articles/explore-flying/cockpit-collaboration", "/de/de/articles/explore-flying/come-fly-with-me-lufthansa-allegris", "/de/de/articles/explore-flying/culinary-craftsmanship-smoked-fish-for-first-and-business-class", "/de/de/articles/explore-flying/essentials-future-of-flying", "/de/de/articles/explore-flying/essentials-lufthansa-facts", "/de/de/articles/explore-flying/essentials-surprising-lufthansa-numbers", "/de/de/articles/explore-flying/everyone-wants-to-fly-with-the-cranes", "/de/de/articles/explore-flying/female-pilots", "/de/de/articles/explore-flying/first-class-culinary-inspiration-journey-tokyo", "/de/de/articles/explore-flying/first-class-reimagined", "/de/de/articles/explore-flying/first-class-terminal-architecture", "/de/de/articles/explore-flying/flying-high-christoph-quarch", "/de/de/articles/explore-flying/flying-high-meta-city", "/de/de/articles/explore-flying/future-of-flying", "/de/de/articles/explore-flying/help-alliance-engagement-in-tanzania", "/de/de/articles/explore-flying/help-alliance-taking-off-for-a-good-cause", "/de/de/articles/explore-flying/hon-circle-event", "/de/de/articles/explore-flying/how-to-become-a-flight-attendant", "/de/de/articles/explore-flying/how-to-become-a-pilot", "/de/de/articles/explore-flying/inflight-entertainment-vr-experience", "/de/de/articles/explore-flying/inside-lufthansa-lh-allegris", "/de/de/articles/explore-flying/interview-livery-iconic-moments", "/de/de/articles/explore-flying/livery-iconic-moments", "/de/de/articles/explore-flying/lufthansa-allegris-first-class", "/de/de/articles/explore-flying/lufthansa-allegris-welcome-to-the-future-of-aviation", "/de/de/articles/explore-flying/lufthansa-classics", "/de/de/articles/explore-flying/lufthansa-fleet-our-aircrafts", "/de/de/articles/explore-flying/lufthansa-group-wifi", "/de/de/articles/explore-flying/lufthansa-help-alliance-i-fly-for-campaign", "/de/de/articles/explore-flying/lufthansa-in-the-spotlight", "/de/de/articles/explore-flying/lufthansa-innovation-hub-future-of-flying", "/de/de/articles/explore-flying/lufthansa-insights-art", "/de/de/articles/explore-flying/lufthansa-lounges", "/de/de/articles/explore-flying/lufthansa-orchestra-channel-aid-live-in-concert", "/de/de/articles/explore-flying/lufthansa-uniforms-history", "/de/de/articles/explore-flying/meet-the-makers-innovations-for-individual-well-being", "/de/de/articles/explore-flying/meet-the-makers-lufthansa-allegris-business-class", "/de/de/articles/explore-flying/meet-the-makers-lufthansa-allegris-first-class", "/de/de/articles/explore-flying/meet-the-makers-the-manufactures-of-the-first-class-suites", "/de/de/articles/explore-flying/new-lufthansa-lounge-newark-interview", "/de/de/articles/explore-flying/oktoberfest-traditional-bavarian-attire", "/de/de/articles/explore-flying/pride-diversifly-queer-employee-network-lufthansa-group", "/de/de/articles/explore-flying/queer-travel-safer-trips", "/de/de/articles/explore-flying/responsibility-lufthansa", "/de/de/articles/explore-flying/things-you-always-wanted-to-know-about-flying", "/de/de/articles/explore-flying/time-travel-ki-aviation", "/de/de/articles/explore-flying/travel-trends", "/de/de/articles/explore-flying/vacation-packing-list", "/de/de/articles/explore-flying/welcome-to-my-world-alexandra-maria-lara", "/de/de/articles/explore-flying/welcome-to-my-world-bridget-finn", "/de/de/articles/explore-flying/welcome-to-my-world-elyas-mbarek", "/de/de/articles/explore-flying/welcome-to-my-world-emilia-schuele", "/de/de/articles/explore-flying/welcome-to-my-world-karolina-kurkova", "/de/de/articles/explore-flying/welcome-to-my-world-karoline-herfurth", "/de/de/articles/explore-flying/welcome-to-my-world-lexie-alford", "/de/de/articles/explore-flying/what-does-luxury-mean-today", "/de/de/articles/explore-flying/what-the-hack-anti-jetlag-tips", "/de/de/articles/explore-flying/what-the-hack-best-seats", "/de/de/articles/explore-flying/what-the-hack-travel-gadgets", "/de/de/articles/explore-flying/what-the-hack-travel-hacks", "/de/de/articles/explore-flying/what-the-hack-travel-with-kids", "/de/de/articles/explore-flying/what-the-hack-waiting-time-at-the-airport", "/de/de/articles/explore-flying/what-the-hack-what-is-the-etiquette-of-traveling", "/de/de/articles/explore-flying/yes-stories-the-fascination-of-skydiving", "/de/de/articles/explore-flying/yes-stories-the-two-worlds-of-kaye-ree", "/de/de/articles/explore-flying/yes-stories-thorsten-buss", "/de/de/articles/explore-flying/yes-stories-tom-rees", "/de/de/articles/explore-the-world", "/de/de/articles/explore-the-world/a-perfect-day-amsterdam-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-art-basel-miami-beach-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-athens-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-bangkok-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-barcelona-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-beijing-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-bengaluru-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-berlin-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-boston-on-one-day", "/de/de/articles/explore-the-world/a-perfect-day-budapest-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-buenos-aires-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-cape-town-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-charlotte-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-chicago-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-copenhagen-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-dublin-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-frankfurt-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-hamburg", "/de/de/articles/explore-the-world/a-perfect-day-helsinki-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-hong-kong-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-houston-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-istanbul-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-johannesburg-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-la-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-lisbon-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-london-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-madrid-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-malaga-on-one-day", "/de/de/articles/explore-the-world/a-perfect-day-mallorca-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-mexico-city-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-miami-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-milan-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-mumbai-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-munich-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-ny-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-oslo-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-paris-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-porto-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-prague-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-rio-de-janeiro-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-rome-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-san-francisco-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-seoul-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-shanghai-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-singapore-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-stockholm-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-tokyo-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-toronto-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-vienna-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-washington-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-zurich-in-one-day", "/de/de/articles/explore-the-world/a-perfect-nairobi-city-in-one-day", "/de/de/articles/explore-the-world/art-basel-miami-beach-fun-facts", "/de/de/articles/explore-the-world/be-picky-amsterdam-insider-tips", "/de/de/articles/explore-the-world/be-picky-athens-insider-tips", "/de/de/articles/explore-the-world/be-picky-bangkok-insider-tips", "/de/de/articles/explore-the-world/be-picky-barcelona-insider-tips", "/de/de/articles/explore-the-world/be-picky-bengaluru", "/de/de/articles/explore-the-world/be-picky-budapest-insider-tips", "/de/de/articles/explore-the-world/be-picky-buenos-aires-insider-tips", "/de/de/articles/explore-the-world/be-picky-cape-town-insider-tips", "/de/de/articles/explore-the-world/be-picky-charlotte-insider-tips", "/de/de/articles/explore-the-world/be-picky-chicago-insider-tips", "/de/de/articles/explore-the-world/be-picky-copenhagen", "/de/de/articles/explore-the-world/be-picky-dublin-insider-tips", "/de/de/articles/explore-the-world/be-picky-frankfurt-insider-tips", "/de/de/articles/explore-the-world/be-picky-helsinkis-insider-tips", "/de/de/articles/explore-the-world/be-picky-hong-kong-insider-tips", "/de/de/articles/explore-the-world/be-picky-istanbul-insider-tips", "/de/de/articles/explore-the-world/be-picky-johannesburg-insider-tipps", "/de/de/articles/explore-the-world/be-picky-la-insider-tips", "/de/de/articles/explore-the-world/be-picky-lisbon", "/de/de/articles/explore-the-world/be-picky-little-italy-in-vancouver", "/de/de/articles/explore-the-world/be-picky-london-insider-tips", "/de/de/articles/explore-the-world/be-picky-madrid", "/de/de/articles/explore-the-world/be-picky-mallorca-insider-tips", "/de/de/articles/explore-the-world/be-picky-mexico-city-insider-tips", "/de/de/articles/explore-the-world/be-picky-mexico-city-insidertipps", "/de/de/articles/explore-the-world/be-picky-miami-insider-tips", "/de/de/articles/explore-the-world/be-picky-milan-insider-tips", "/de/de/articles/explore-the-world/be-picky-mumbai-insider-tips", "/de/de/articles/explore-the-world/be-picky-munich-insider-tip-anika-landsteiner", "/de/de/articles/explore-the-world/be-picky-ny-insider-tips", "/de/de/articles/explore-the-world/be-picky-oslo-insider-tips", "/de/de/articles/explore-the-world/be-picky-paris-insider-tips", "/de/de/articles/explore-the-world/be-picky-prague-insider-tips", "/de/de/articles/explore-the-world/be-picky-rio-de-janeiro-insider-tips", "/de/de/articles/explore-the-world/be-picky-rome-insider-tips", "/de/de/articles/explore-the-world/be-picky-san-francisco-insider-tips", "/de/de/articles/explore-the-world/be-picky-seoul-insider-tips", "/de/de/articles/explore-the-world/be-picky-shanghai-insider-tips", "/de/de/articles/explore-the-world/be-picky-singapore-insider-tips", "/de/de/articles/explore-the-world/be-picky-stockholm", "/de/de/articles/explore-the-world/be-picky-tokyo-insider-tips", "/de/de/articles/explore-the-world/be-picky-toronto-insider-tips", "/de/de/articles/explore-the-world/be-picky-vienna-insider-tips", "/de/de/articles/explore-the-world/be-picky-washington-insider-tips", "/de/de/articles/explore-the-world/be-picky-zurich-insider-tips", "/de/de/articles/explore-the-world/copenhagen-what-i-have-learned", "/de/de/articles/explore-the-world/eat-see-do-algiers", "/de/de/articles/explore-the-world/eat-see-do-almaty", "/de/de/articles/explore-the-world/eat-see-do-amman", "/de/de/articles/explore-the-world/eat-see-do-atlanta", "/de/de/articles/explore-the-world/eat-see-do-beijing", "/de/de/articles/explore-the-world/eat-see-do-berlin", "/de/de/articles/explore-the-world/eat-see-do-bilbao", "/de/de/articles/explore-the-world/eat-see-do-bogota", "/de/de/articles/explore-the-world/eat-see-do-boston", "/de/de/articles/explore-the-world/eat-see-do-cagliari", "/de/de/articles/explore-the-world/eat-see-do-cairo", "/de/de/articles/explore-the-world/eat-see-do-casablanca", "/de/de/articles/explore-the-world/eat-see-do-catania", "/de/de/articles/explore-the-world/eat-see-do-chennai", "/de/de/articles/explore-the-world/eat-see-do-dallas", "/de/de/articles/explore-the-world/eat-see-do-denver", "/de/de/articles/explore-the-world/eat-see-do-detroit", "/de/de/articles/explore-the-world/eat-see-do-dubai", "/de/de/articles/explore-the-world/eat-see-do-edinburgh", "/de/de/articles/explore-the-world/eat-see-do-faro", "/de/de/articles/explore-the-world/eat-see-do-gothenburg", "/de/de/articles/explore-the-world/eat-see-do-hamburg", "/de/de/articles/explore-the-world/eat-see-do-houston", "/de/de/articles/explore-the-world/eat-see-do-hyderabad", "/de/de/articles/explore-the-world/eat-see-do-kuala-lumpur", "/de/de/articles/explore-the-world/eat-see-do-larnaca", "/de/de/articles/explore-the-world/eat-see-do-ljubljana", "/de/de/articles/explore-the-world/eat-see-do-malaga", "/de/de/articles/explore-the-world/eat-see-do-manchester", "/de/de/articles/explore-the-world/eat-see-do-marseille", "/de/de/articles/explore-the-world/eat-see-do-minneapolis-st-paul", "/de/de/articles/explore-the-world/eat-see-do-nairobi", "/de/de/articles/explore-the-world/eat-see-do-nice", "/de/de/articles/explore-the-world/eat-see-do-olbia", "/de/de/articles/explore-the-world/eat-see-do-porto", "/de/de/articles/explore-the-world/eat-see-do-raleigh-durham", "/de/de/articles/explore-the-world/eat-see-do-riga", "/de/de/articles/explore-the-world/eat-see-do-riyadh", "/de/de/articles/explore-the-world/eat-see-do-san-diego", "/de/de/articles/explore-the-world/eat-see-do-seattle", "/de/de/articles/explore-the-world/eat-see-do-st-louis", "/de/de/articles/explore-the-world/eat-see-do-tallinn", "/de/de/articles/explore-the-world/eat-see-do-tbilisi", "/de/de/articles/explore-the-world/eat-see-do-tel-aviv", "/de/de/articles/explore-the-world/eat-see-do-thessaloniki", "/de/de/articles/explore-the-world/eat-see-do-tirana", "/de/de/articles/explore-the-world/eat-see-do-tunis", "/de/de/articles/explore-the-world/eat-see-do-valletta", "/de/de/articles/explore-the-world/eat-see-do-venice", "/de/de/articles/explore-the-world/eat-see-do-vilnius", "/de/de/articles/explore-the-world/eat-see-do-zagreb", "/de/de/articles/explore-the-world/essentials-amsterdam-facts", "/de/de/articles/explore-the-world/essentials-athens-facts", "/de/de/articles/explore-the-world/essentials-bangkok-facts", "/de/de/articles/explore-the-world/essentials-barcelona-facts", "/de/de/articles/explore-the-world/essentials-beijing-facts", "/de/de/articles/explore-the-world/essentials-bengaluru-facts", "/de/de/articles/explore-the-world/essentials-boston-facts", "/de/de/articles/explore-the-world/essentials-budapest-facts", "/de/de/articles/explore-the-world/essentials-buenos-aires-facts", "/de/de/articles/explore-the-world/essentials-cape-town-facts", "/de/de/articles/explore-the-world/essentials-charlotte-facts", "/de/de/articles/explore-the-world/essentials-chicago-facts", "/de/de/articles/explore-the-world/essentials-copenhagen-facts", "/de/de/articles/explore-the-world/essentials-dublin-facts", "/de/de/articles/explore-the-world/essentials-facts-vancouver", "/de/de/articles/explore-the-world/essentials-frankfurt-facts", "/de/de/articles/explore-the-world/essentials-helsinki-facts", "/de/de/articles/explore-the-world/essentials-hong-kong-facts", "/de/de/articles/explore-the-world/essentials-istanbul-facts", "/de/de/articles/explore-the-world/essentials-johannesburg-facts", "/de/de/articles/explore-the-world/essentials-la-facts", "/de/de/articles/explore-the-world/essentials-lisbon-facts", "/de/de/articles/explore-the-world/essentials-london-facts", "/de/de/articles/explore-the-world/essentials-madrid-facts", "/de/de/articles/explore-the-world/essentials-mallorca-facts", "/de/de/articles/explore-the-world/essentials-mexico-city-facts", "/de/de/articles/explore-the-world/essentials-miami-facts", "/de/de/articles/explore-the-world/essentials-milan-facts", "/de/de/articles/explore-the-world/essentials-mumbai-facts", "/de/de/articles/explore-the-world/essentials-munich-facts", "/de/de/articles/explore-the-world/essentials-ny-facts", "/de/de/articles/explore-the-world/essentials-oslo-facts", "/de/de/articles/explore-the-world/essentials-paris-facts", "/de/de/articles/explore-the-world/essentials-prague-facts", "/de/de/articles/explore-the-world/essentials-rio-de-janeiro-facts", "/de/de/articles/explore-the-world/essentials-rome-facts", "/de/de/articles/explore-the-world/essentials-san-francisco-facts", "/de/de/articles/explore-the-world/essentials-seoul-facts", "/de/de/articles/explore-the-world/essentials-shanghai-facts", "/de/de/articles/explore-the-world/essentials-singapore-facts", "/de/de/articles/explore-the-world/essentials-stockholm-facts", "/de/de/articles/explore-the-world/essentials-tokyo-facts", "/de/de/articles/explore-the-world/essentials-toronto-facts", "/de/de/articles/explore-the-world/essentials-vienna-facts", "/de/de/articles/explore-the-world/essentials-washington-facts", "/de/de/articles/explore-the-world/essentials-zurich-facts", "/de/de/articles/explore-the-world/experience-art-live", "/de/de/articles/explore-the-world/experience-nature", "/de/de/articles/explore-the-world/in-my-hood-apgujeong-seoul", "/de/de/articles/explore-the-world/in-my-hood-arroios-lissabon", "/de/de/articles/explore-the-world/in-my-hood-back-bay-boston", "/de/de/articles/explore-the-world/in-my-hood-bandra-mumbai", "/de/de/articles/explore-the-world/in-my-hood-chiswick-london", "/de/de/articles/explore-the-world/in-my-hood-citta-studi-milan", "/de/de/articles/explore-the-world/in-my-hood-city-centre-cape-town", "/de/de/articles/explore-the-world/in-my-hood-comercial-drive-vancouver", "/de/de/articles/explore-the-world/in-my-hood-coyoacan-mexico-city", "/de/de/articles/explore-the-world/in-my-hood-creative-quarter-dublin", "/de/de/articles/explore-the-world/in-my-hood-district-helsinki", "/de/de/articles/explore-the-world/in-my-hood-district-houston", "/de/de/articles/explore-the-world/in-my-hood-district-malaga", "/de/de/articles/explore-the-world/in-my-hood-district-nairobi", "/de/de/articles/explore-the-world/in-my-hood-district-porto", "/de/de/articles/explore-the-world/in-my-hood-district-viii-budapest", "/de/de/articles/explore-the-world/in-my-hood-district-zurich", "/de/de/articles/explore-the-world/in-my-hood-gamlebyen-oslo", "/de/de/articles/explore-the-world/in-my-hood-geylang-singapur", "/de/de/articles/explore-the-world/in-my-hood-gulou-beijing", "/de/de/articles/explore-the-world/in-my-hood-hollywood-road-hong-kong", "/de/de/articles/explore-the-world/in-my-hood-indiranagar-bengaluru", "/de/de/articles/explore-the-world/in-my-hood-ipanema-rio-de-janeiro", "/de/de/articles/explore-the-world/in-my-hood-japantown-san-francisco", "/de/de/articles/explore-the-world/in-my-hood-kadikoey-istanbul", "/de/de/articles/explore-the-world/in-my-hood-kampung-attap-kuala-lumpur", "/de/de/articles/explore-the-world/in-my-hood-kreuzberg-berlin", "/de/de/articles/explore-the-world/in-my-hood-larchmont-la", "/de/de/articles/explore-the-world/in-my-hood-le-sentier-paris", "/de/de/articles/explore-the-world/in-my-hood-mallorca", "/de/de/articles/explore-the-world/in-my-hood-metaxourgeio-athens", "/de/de/articles/explore-the-world/in-my-hood-mount-pleasant-washington", "/de/de/articles/explore-the-world/in-my-hood-munich-sendling", "/de/de/articles/explore-the-world/in-my-hood-nice-ouest", "/de/de/articles/explore-the-world/in-my-hood-noord-amsterdam", "/de/de/articles/explore-the-world/in-my-hood-ny-brooklyn", "/de/de/articles/explore-the-world/in-my-hood-osterbro-kopenhagen", "/de/de/articles/explore-the-world/in-my-hood-palermo-buenos-aires", "/de/de/articles/explore-the-world/in-my-hood-plaza-midwood-charlotte", "/de/de/articles/explore-the-world/in-my-hood-poblenou-barcelona", "/de/de/articles/explore-the-world/in-my-hood-rome-pigneto-rome", "/de/de/articles/explore-the-world/in-my-hood-rosebank-johannesburg", "/de/de/articles/explore-the-world/in-my-hood-sachsenhausen-frankfurt", "/de/de/articles/explore-the-world/in-my-hood-salamanca-madrid", "/de/de/articles/explore-the-world/in-my-hood-schanzenviertel-hamburg", "/de/de/articles/explore-the-world/in-my-hood-schaumburg-chicago", "/de/de/articles/explore-the-world/in-my-hood-seventh-district-vienna", "/de/de/articles/explore-the-world/in-my-hood-shinjuku-tokyo", "/de/de/articles/explore-the-world/in-my-hood-song-wat-road-bangkok", "/de/de/articles/explore-the-world/in-my-hood-south-beach-miami", "/de/de/articles/explore-the-world/in-my-hood-the-bund-shanghai", "/de/de/articles/explore-the-world/in-my-hood-toronto-summerhill", "/de/de/articles/explore-the-world/in-my-hood-vasastaden-stockholm", "/de/de/articles/explore-the-world/in-my-hood-vrsovice-prague", "/de/de/articles/explore-the-world/in-my-hood-west-seattle-seattle", "/de/de/articles/explore-the-world/know-before-you-go-algiers", "/de/de/articles/explore-the-world/know-before-you-go-almaty", "/de/de/articles/explore-the-world/know-before-you-go-amman", "/de/de/articles/explore-the-world/know-before-you-go-atlanta", "/de/de/articles/explore-the-world/know-before-you-go-beijing", "/de/de/articles/explore-the-world/know-before-you-go-berlin", "/de/de/articles/explore-the-world/know-before-you-go-bilbao", "/de/de/articles/explore-the-world/know-before-you-go-bogota", "/de/de/articles/explore-the-world/know-before-you-go-boston", "/de/de/articles/explore-the-world/know-before-you-go-cagliari", "/de/de/articles/explore-the-world/know-before-you-go-cairo", "/de/de/articles/explore-the-world/know-before-you-go-casablanca", "/de/de/articles/explore-the-world/know-before-you-go-catania", "/de/de/articles/explore-the-world/know-before-you-go-chennai", "/de/de/articles/explore-the-world/know-before-you-go-dallas", "/de/de/articles/explore-the-world/know-before-you-go-denver", "/de/de/articles/explore-the-world/know-before-you-go-detroit", "/de/de/articles/explore-the-world/know-before-you-go-dubai", "/de/de/articles/explore-the-world/know-before-you-go-edinburgh", "/de/de/articles/explore-the-world/know-before-you-go-faro", "/de/de/articles/explore-the-world/know-before-you-go-gothenburg", "/de/de/articles/explore-the-world/know-before-you-go-hamburg", "/de/de/articles/explore-the-world/know-before-you-go-houston", "/de/de/articles/explore-the-world/know-before-you-go-hyderabad", "/de/de/articles/explore-the-world/know-before-you-go-kuala-lumpur", "/de/de/articles/explore-the-world/know-before-you-go-larnaca", "/de/de/articles/explore-the-world/know-before-you-go-ljubljana", "/de/de/articles/explore-the-world/know-before-you-go-malaga", "/de/de/articles/explore-the-world/know-before-you-go-manchester", "/de/de/articles/explore-the-world/know-before-you-go-marseille", "/de/de/articles/explore-the-world/know-before-you-go-minneapolis-st-paul", "/de/de/articles/explore-the-world/know-before-you-go-nairobi", "/de/de/articles/explore-the-world/know-before-you-go-nice", "/de/de/articles/explore-the-world/know-before-you-go-olbia", "/de/de/articles/explore-the-world/know-before-you-go-porto", "/de/de/articles/explore-the-world/know-before-you-go-raleigh-durham", "/de/de/articles/explore-the-world/know-before-you-go-riga", "/de/de/articles/explore-the-world/know-before-you-go-riyadh", "/de/de/articles/explore-the-world/know-before-you-go-san-diego", "/de/de/articles/explore-the-world/know-before-you-go-seattle", "/de/de/articles/explore-the-world/know-before-you-go-st-louis", "/de/de/articles/explore-the-world/know-before-you-go-tallinn", "/de/de/articles/explore-the-world/know-before-you-go-tbilisi", "/de/de/articles/explore-the-world/know-before-you-go-tel-aviv", "/de/de/articles/explore-the-world/know-before-you-go-thessaloniki", "/de/de/articles/explore-the-world/know-before-you-go-tirana", "/de/de/articles/explore-the-world/know-before-you-go-tunis", "/de/de/articles/explore-the-world/know-before-you-go-valletta", "/de/de/articles/explore-the-world/know-before-you-go-venice", "/de/de/articles/explore-the-world/know-before-you-go-vilnius", "/de/de/articles/explore-the-world/know-before-you-go-zagreb", "/de/de/articles/explore-the-world/my-experiences-in-vancouver", "/de/de/articles/explore-the-world/new-shopping", "/de/de/articles/explore-the-world/next-level-gaming", "/de/de/articles/explore-the-world/on-the-scene-architecture-copenhagen", "/de/de/articles/explore-the-world/on-the-scene-art-and-pubs-dublin", "/de/de/articles/explore-the-world/on-the-scene-art-johannesburg", "/de/de/articles/explore-the-world/on-the-scene-bar-basso-milan", "/de/de/articles/explore-the-world/on-the-scene-bookstores-buenos-aires", "/de/de/articles/explore-the-world/on-the-scene-braamfontein-johannesburg", "/de/de/articles/explore-the-world/on-the-scene-brunch-restaurants-la", "/de/de/articles/explore-the-world/on-the-scene-caspar-plautz-munich", "/de/de/articles/explore-the-world/on-the-scene-chicago-beer", "/de/de/articles/explore-the-world/on-the-scene-creative-architecture-prague", "/de/de/articles/explore-the-world/on-the-scene-culinary-trip-washington", "/de/de/articles/explore-the-world/on-the-scene-fashion-and-culture-budapest", "/de/de/articles/explore-the-world/on-the-scene-food-mumbai", "/de/de/articles/explore-the-world/on-the-scene-food-trends-amsterdam", "/de/de/articles/explore-the-world/on-the-scene-food-trends-bengaluru", "/de/de/articles/explore-the-world/on-the-scene-food-trends-istanbul", "/de/de/articles/explore-the-world/on-the-scene-hidden-gems-seoul", "/de/de/articles/explore-the-world/on-the-scene-humor-vienna", "/de/de/articles/explore-the-world/on-the-scene-listening-bars-toronto", "/de/de/articles/explore-the-world/on-the-scene-lunch-mexico-city", "/de/de/articles/explore-the-world/on-the-scene-mallorca", "/de/de/articles/explore-the-world/on-the-scene-music-cape-town", "/de/de/articles/explore-the-world/on-the-scene-samba-rio-de-janeiro", "/de/de/articles/explore-the-world/on-the-scene-san-francisco-fashion", "/de/de/articles/explore-the-world/on-the-scene-shanghai-art-scene", "/de/de/articles/explore-the-world/on-the-scene-shopping-barcelona", "/de/de/articles/explore-the-world/on-the-scene-shopping-lisbon", "/de/de/articles/explore-the-world/on-the-scene-shopping-tokyo", "/de/de/articles/explore-the-world/on-the-scene-sports-miami", "/de/de/articles/explore-the-world/on-the-scene-stockholm", "/de/de/articles/explore-the-world/on-the-scene-street-art-charlotte", "/de/de/articles/explore-the-world/on-the-scene-street-art-london", "/de/de/articles/explore-the-world/on-the-scene-streetart-athens", "/de/de/articles/explore-the-world/on-the-scene-super-bros-frankfurt", "/de/de/articles/explore-the-world/on-the-scene-supper-clubs-ny", "/de/de/articles/explore-the-world/on-the-scene-techno-sound-rome", "/de/de/articles/explore-the-world/on-the-scene-tips-oslo", "/de/de/articles/explore-the-world/on-the-scene-topic-bangkok", "/de/de/articles/explore-the-world/on-the-scene-topic-helsinki", "/de/de/articles/explore-the-world/on-the-scene-topic-zurich", "/de/de/articles/explore-the-world/on-the-scene-trends-madrid", "/de/de/articles/explore-the-world/on-the-scene-urban-farming-singapore", "/de/de/articles/explore-the-world/on-the-scene-vancouver-donuts", "/de/de/articles/explore-the-world/on-the-scene-wellness-cuisine-hong-kong", "/de/de/articles/explore-the-world/perfect-day-nice-cote-dazur", "/de/de/articles/explore-the-world/perfect-day-seattle", "/de/de/articles/explore-the-world/perfect-day-tips-vancouver", "/de/de/articles/explore-the-world/picture-perfect-austin", "/de/de/articles/explore-the-world/picture-perfect-beijing", "/de/de/articles/explore-the-world/picture-perfect-bogota", "/de/de/articles/explore-the-world/picture-perfect-boston", "/de/de/articles/explore-the-world/picture-perfect-cairo", "/de/de/articles/explore-the-world/picture-perfect-elevator-boys", "/de/de/articles/explore-the-world/picture-perfect-hyderabad", "/de/de/articles/explore-the-world/picture-perfect-la", "/de/de/articles/explore-the-world/picture-perfect-ny", "/de/de/articles/explore-the-world/picture-perfect-riad", "/de/de/articles/explore-the-world/picture-perfect-singapore", "/de/de/articles/explore-the-world/sao-paulo-sights", "/de/de/articles/explore-the-world/stop-over-bangkok", "/de/de/articles/explore-the-world/stop-over-beijing", "/de/de/articles/explore-the-world/stop-over-boston", "/de/de/articles/explore-the-world/stop-over-buenos-aires", "/de/de/articles/explore-the-world/stop-over-charlotte", "/de/de/articles/explore-the-world/stop-over-hong-kong", "/de/de/articles/explore-the-world/stop-over-johannesburg", "/de/de/articles/explore-the-world/stop-over-los-angeles", "/de/de/articles/explore-the-world/stop-over-mexico-city", "/de/de/articles/explore-the-world/stop-over-seoul", "/de/de/articles/explore-the-world/stop-over-singapore", "/de/de/articles/explore-the-world/stop-over-tokyo", "/de/de/articles/explore-the-world/stop-over-washington", "/de/de/articles/explore-the-world/team-sport", "/de/de/articles/explore-the-world/what-i-learned-living-in-amsterdam", "/de/de/articles/explore-the-world/what-i-learned-living-in-athens", "/de/de/articles/explore-the-world/what-i-learned-living-in-bangkok", "/de/de/articles/explore-the-world/what-i-learned-living-in-barcelona", "/de/de/articles/explore-the-world/what-i-learned-living-in-bengaluru", "/de/de/articles/explore-the-world/what-i-learned-living-in-boston", "/de/de/articles/explore-the-world/what-i-learned-living-in-budapest", "/de/de/articles/explore-the-world/what-i-learned-living-in-buenos-aires", "/de/de/articles/explore-the-world/what-i-learned-living-in-cape-town", "/de/de/articles/explore-the-world/what-i-learned-living-in-charlotte", "/de/de/articles/explore-the-world/what-i-learned-living-in-chicago", "/de/de/articles/explore-the-world/what-i-learned-living-in-dublin", "/de/de/articles/explore-the-world/what-i-learned-living-in-frankfurt", "/de/de/articles/explore-the-world/what-i-learned-living-in-helsinki", "/de/de/articles/explore-the-world/what-i-learned-living-in-hong-kong", "/de/de/articles/explore-the-world/what-i-learned-living-in-istanbul", "/de/de/articles/explore-the-world/what-i-learned-living-in-johannesburg", "/de/de/articles/explore-the-world/what-i-learned-living-in-la", "/de/de/articles/explore-the-world/what-i-learned-living-in-lisbon", "/de/de/articles/explore-the-world/what-i-learned-living-in-london", "/de/de/articles/explore-the-world/what-i-learned-living-in-madrid", "/de/de/articles/explore-the-world/what-i-learned-living-in-mallorca", "/de/de/articles/explore-the-world/what-i-learned-living-in-mexico-city", "/de/de/articles/explore-the-world/what-i-learned-living-in-miami", "/de/de/articles/explore-the-world/what-i-learned-living-in-milan", "/de/de/articles/explore-the-world/what-i-learned-living-in-mumbai", "/de/de/articles/explore-the-world/what-i-learned-living-in-munich", "/de/de/articles/explore-the-world/what-i-learned-living-in-ny", "/de/de/articles/explore-the-world/what-i-learned-living-in-oslo", "/de/de/articles/explore-the-world/what-i-learned-living-in-paris", "/de/de/articles/explore-the-world/what-i-learned-living-in-prague", "/de/de/articles/explore-the-world/what-i-learned-living-in-rio-de-janeiro", "/de/de/articles/explore-the-world/what-i-learned-living-in-rome", "/de/de/articles/explore-the-world/what-i-learned-living-in-san-francisco", "/de/de/articles/explore-the-world/what-i-learned-living-in-seoul", "/de/de/articles/explore-the-world/what-i-learned-living-in-shanghai", "/de/de/articles/explore-the-world/what-i-learned-living-in-singapore", "/de/de/articles/explore-the-world/what-i-learned-living-in-stockholm", "/de/de/articles/explore-the-world/what-i-learned-living-in-tokyo", "/de/de/articles/explore-the-world/what-i-learned-living-in-toronto", "/de/de/articles/explore-the-world/what-i-learned-living-in-vienna", "/de/de/articles/explore-the-world/what-i-learned-living-in-washington", "/de/de/articles/explore-the-world/what-i-learned-living-in-zurich", "/de/de/articles/highlights", "/de/de/articles/highlights-european-championship", "/de/de/articles/highlights-european-championship/european-championship-2024-great-hope", "/de/de/articles/highlights-european-championship/european-championship-2024-locations", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-andrich", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-anton", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-baumann", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-beier", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-fuellkrug", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-kimmich", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-kroos", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-mittelstaedt", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-raum", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-tah", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-ter-stegen", "/de/de/articles/highlights-european-championship/european-championship-2024-player-videos-undav", "/de/de/articles/highlights-european-championship/european-championship-2024-quiz", "/de/de/articles/highlights-european-championship/european-championship-2024-thank-you", "/de/de/articles/highlights-european-championship/hungary-with-pride-and-passion", "/de/de/articles/highlights-european-championship/lose-like-the-germans", "/de/de/articles/highlights-european-championship/meet-the-germans", "/de/de/articles/highlights-european-championship/scotland-with-heart-and-energy", "/de/de/articles/highlights-european-championship/swiss-passion-meets-precision", "/de/de/articles/highlights/all-it-takes-is-a-yes", "/de/de/articles/highlights/allegris-a-new-flight-experience", "/de/de/articles/highlights/allegris-business-class-shanghai", "/de/de/articles/highlights/allegris-business-san-diego", "/de/de/articles/highlights/allegris-destinations", "/de/de/articles/highlights/allegris-dirk-nowitzki", "/de/de/articles/highlights/allegris-essentials", "/de/de/articles/highlights/allegris-experiences", "/de/de/articles/highlights/allegris-new-york", "/de/de/articles/highlights/allegris-premium-economy-san-diego", "/de/de/articles/highlights/allegris-travel-hacks", "/de/de/articles/highlights/allegris-typologies", "/de/de/articles/highlights/austin-texas-city-of-live-music", "/de/de/articles/highlights/chisinau-winter", "/de/de/articles/highlights/dfb-partnership-diversity-success", "/de/de/articles/highlights/exclusive-first-class-tracksuit", "/de/de/articles/highlights/fashion-footprints-new-york", "/de/de/articles/highlights/hyderabad-city-of-pearls-and-programmers", "/de/de/articles/highlights/johannesburg-winter", "/de/de/articles/highlights/minneapolis-best-winter-activities", "/de/de/articles/highlights/minneapolis-winter", "/de/de/articles/highlights/new-york-fashion-week", "/de/de/articles/highlights/raleigh-nc-winter", "/de/de/articles/highlights/rome-art-and-culture", "/de/de/articles/highlights/sao-paulo-carnival-brazil-largest-street-carnival", "/de/de/articles/highlights/seattle-winter", "/de/de/articles/highlights/shanghai-best-restaurants-and-traditional-chinese-dishes", "/de/de/articles/highlights/soccer-event-in-north-america", "/de/de/articles/highlights/sports-experiences-rio-de-janeiro", "/de/de/articles/highlights/stefan-marx-travel-hacks", "/de/de/articles/highlights/the-art-of-flying-extra-long-bed", "/de/de/articles/highlights/the-art-of-flying-extra-space-seat", "/de/de/articles/highlights/the-art-of-flying-suite", "/de/de/articles/highlights/vancouver-winter", "/de/de/articles/tags", "/de/de/articles/tags/algiers", "/de/de/articles/tags/allegris", "/de/de/articles/tags/allegris-inspires", "/de/de/articles/tags/almaty", "/de/de/articles/tags/amman", "/de/de/articles/tags/amsterdam", "/de/de/articles/tags/art", "/de/de/articles/tags/art-basel-miami-beach", "/de/de/articles/tags/athens", "/de/de/articles/tags/atlanta", "/de/de/articles/tags/bangkok", "/de/de/articles/tags/barcelona", "/de/de/articles/tags/be-picky", "/de/de/articles/tags/beijing", "/de/de/articles/tags/bengaluru", "/de/de/articles/tags/berlin", "/de/de/articles/tags/bilbao", "/de/de/articles/tags/bogota", "/de/de/articles/tags/boston", "/de/de/articles/tags/budapest", "/de/de/articles/tags/buenos-aires", "/de/de/articles/tags/cagliari", "/de/de/articles/tags/cairo", "/de/de/articles/tags/cape-town", "/de/de/articles/tags/casablanca", "/de/de/articles/tags/catania", "/de/de/articles/tags/charlotte", "/de/de/articles/tags/chennai", "/de/de/articles/tags/chicago", "/de/de/articles/tags/copenhagen", "/de/de/articles/tags/dallas", "/de/de/articles/tags/denver", "/de/de/articles/tags/detroit", "/de/de/articles/tags/dubai", "/de/de/articles/tags/dublin", "/de/de/articles/tags/eat-see-do", "/de/de/articles/tags/edinburgh", "/de/de/articles/tags/essentials", "/de/de/articles/tags/faro", "/de/de/articles/tags/fly-with-me", "/de/de/articles/tags/flying-high", "/de/de/articles/tags/food", "/de/de/articles/tags/frankfurt", "/de/de/articles/tags/frequent-flyers", "/de/de/articles/tags/future-of-flying", "/de/de/articles/tags/gothenburg", "/de/de/articles/tags/hamburg", "/de/de/articles/tags/helsinki", "/de/de/articles/tags/history", "/de/de/articles/tags/hong-kong", "/de/de/articles/tags/houston", "/de/de/articles/tags/hyderabad", "/de/de/articles/tags/in-my-hood", "/de/de/articles/tags/inside-lufthansa", "/de/de/articles/tags/istanbul", "/de/de/articles/tags/johannesburg", "/de/de/articles/tags/know-before-you-go", "/de/de/articles/tags/kuala-lumpur", "/de/de/articles/tags/larnaca", "/de/de/articles/tags/lisbon", "/de/de/articles/tags/ljubljana", "/de/de/articles/tags/london", "/de/de/articles/tags/los-angeles", "/de/de/articles/tags/madrid", "/de/de/articles/tags/malaga", "/de/de/articles/tags/mallorca", "/de/de/articles/tags/manchester", "/de/de/articles/tags/marseille", "/de/de/articles/tags/mexico-city", "/de/de/articles/tags/miami", "/de/de/articles/tags/milan", "/de/de/articles/tags/minneapolis-st-paul", "/de/de/articles/tags/mumbai", "/de/de/articles/tags/munich", "/de/de/articles/tags/music", "/de/de/articles/tags/my-world", "/de/de/articles/tags/nairobi", "/de/de/articles/tags/new-york", "/de/de/articles/tags/nice", "/de/de/articles/tags/olbia", "/de/de/articles/tags/on-the-scene", "/de/de/articles/tags/oslo", "/de/de/articles/tags/paris", "/de/de/articles/tags/perfect-day", "/de/de/articles/tags/picture-perfect", "/de/de/articles/tags/porto", "/de/de/articles/tags/prague", "/de/de/articles/tags/raleigh-durham", "/de/de/articles/tags/riga", "/de/de/articles/tags/rio-de-janeiro", "/de/de/articles/tags/riyadh", "/de/de/articles/tags/rome", "/de/de/articles/tags/san-diego", "/de/de/articles/tags/san-francisco", "/de/de/articles/tags/seattle", "/de/de/articles/tags/seoul", "/de/de/articles/tags/shanghai", "/de/de/articles/tags/shopping", "/de/de/articles/tags/singapore", "/de/de/articles/tags/sport", "/de/de/articles/tags/st-louis", "/de/de/articles/tags/stockholm", "/de/de/articles/tags/stop-over", "/de/de/articles/tags/tallinn", "/de/de/articles/tags/tbilisi", "/de/de/articles/tags/team-stories", "/de/de/articles/tags/tel-aviv", "/de/de/articles/tags/thessaloniki", "/de/de/articles/tags/tirana", "/de/de/articles/tags/tokyo", "/de/de/articles/tags/toronto", "/de/de/articles/tags/tunis", "/de/de/articles/tags/valletta", "/de/de/articles/tags/vancouver", "/de/de/articles/tags/venice", "/de/de/articles/tags/vienna", "/de/de/articles/tags/vilnius", "/de/de/articles/tags/washington-dc", "/de/de/articles/tags/what-i-learned", "/de/de/articles/tags/what-the-hack", "/de/de/articles/tags/yes-stories", "/de/de/articles/tags/zagreb", "/de/de/articles/tags/zurich", "/de/de/assistenzhunde", "/de/de/automatic-check-in", "/de/de/baggage-irregularities", "/de/de/bedeutsamste-strecken", "/de/de/befoerderungsbedingungen-group", "/de/de/befoerderungsbedingungen-lh", "/de/de/besondere-befoerderungsbedingungen-bus", "/de/de/betreuungsbedarf", "/de/de/bid-upgrade", "/de/de/boarding", "/de/de/boeing787", "/de/de/book-and-manage/additional-services/get-your-guide", "/de/de/book-and-manage/additional-services/travel-insurances", "/de/de/book-and-manage/booking-services/manage-my-bookings", "/de/de/book-and-manage/cancellation-and-refund/refund/confirmation", "/de/de/book-and-manage/cancellation-and-refund/refund/refund-form", "/de/de/book-and-manage/destination", "/de/de/book-and-manage/digital-self-services/airline-apps", "/de/de/book-and-manage/flights/air-baltic", "/de/de/book-and-manage/flights/ana", "/de/de/book-and-manage/flights/ana/faq", "/de/de/book-and-manage/flights/giftvoucher", "/de/de/book-and-manage/flights/helvetic", "/de/de/book-and-manage/flights/lufthansa-voucher", "/de/de/book-and-manage/flights/wetlease-hub", "/de/de/book-and-manage/passenger-receipt-90days/confirmation", "/de/de/book-and-manage/pax-receipt", "/de/de/book-and-manage/pax-receipt/invoices-different-countries", "/de/de/book-and-manage/rebook", "/de/de/book-and-manage/rebook/involuntary-rebooking", "/de/de/book-and-manage/rebook/voluntary-rebooking", "/de/de/book-and-manage/stopover", "/de/de/book-and-manage/stopover/bayerischer-hof", "/de/de/book-and-manage/stopover/neuschwanstein", "/de/de/book-and-manage/stopover/zugspitze", "/de/de/book-and-manage/trip-management", "/de/de/business-class", "/de/de/business-class-auf-kurz-und-mittelstrecken", "/de/de/business-services", "/de/de/cancellations-and-refunds", "/de/de/cash-and-miles", "/de/de/check-in-baggage", "/de/de/check-in-deadlines", "/de/de/common", "/de/de/common/accessibility-statement", "/de/de/common/agb-extra-services-at-online-check-in", "/de/de/common/agb-extra-services-at-online-check-in/conditions-seat-reservation", "/de/de/common/baggage-conditions", "/de/de/common/compensation-voucher", "/de/de/common/imprint/lufthansa-insights-imprint", "/de/de/common/privacy-statement/privacy-statement-group", "/de/de/common/seatreservation-condtions/seat-reservations", "/de/de/cookie-policy", "/de/de/culinaryjourney", "/de/de/dangerous-dogs", "/de/de/datenerfassung-fuer-die-usa", "/de/de/datenerfassung-fuer-kanada", "/de/de/datenschutz", "/de/de/digital-self-services", "/de/de/digital-travel-companion", "/de/de/digitale-gepaeckservices", "/de/de/discover-lufthansa/carbon-offsetting/climate-protection-projects", "/de/de/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge", "/de/de/discover-lufthansa/carbon-offsetting/faq-saf", "/de/de/discover-lufthansa/carbon-offsetting/saf", "/de/de/discover-lufthansa/flightreservation-priceguarantee", "/de/de/discover-lufthansa/lufthansa-fleet/351", "/de/de/discover-lufthansa/lufthansa-group-airlines/ita-airways", "/de/de/discover-lufthansa/miles-and-more-credit-card", "/de/de/discover-lufthansa/new-onboard-experience", "/de/de/discover-lufthansa/register-newsletter", "/de/de/discover-lufthansa/take-off", "/de/de/doctor-on-board", "/de/de/doctor-on-board-news", "/de/de/during-your-trip/internet-overview", "/de/de/during-your-trip/lhg-wifi", "/de/de/economy-class", "/de/de/electronic-bag-tags", "/de/de/entryprocesses", "/de/de/europa-tarife-economy-class", "/de/de/europcar", "/de/de/event/dghm-2026", "/de/de/exclusive-charter", "/de/de/faq-data-security", "/de/de/faq-ejournals", "/de/de/faq-password-security", "/de/de/farealert/best-price-alert", "/de/de/feedback", "/de/de/feedback-past-flight", "/de/de/feedback/feedbackai", "/de/de/fia-valet-service", "/de/de/first-class", "/de/de/first-class-lounges", "/de/de/first-class-personal-assistant", "/de/de/first-class-terminal", "/de/de/first-class-valet-parking-service", "/de/de/fliegen-mit-baby", "/de/de/fliegen-mit-kindern", "/de/de/fliegen-mit-kleinkind", "/de/de/fluege", "/de/de/flughafeninformation", "/de/de/flugplan-und-flugstatus", "/de/de/flugsuche", "/de/de/flugunregelmaessigkeiten", "/de/de/flynet", "/de/de/fmg-valet-parking-service", "/de/de/frankfurt-fair", "/de/de/free2move", "/de/de/freigepaeck-regeln", "/de/de/gefaehrliche-gegenstaende", "/de/de/gepaeck", "/de/de/geschaeftsbedingungen", "/de/de/gesund-reisen", "/de/de/good-for-train", "/de/de/green-fare", "/de/de/group-travel", "/de/de/gruppenreisen-und-charter", "/de/de/handgepaeck", "/de/de/help-and-contact", "/de/de/hertz", "/de/de/homepage", "/de/de/hotelangebote", "/de/de/impressum", "/de/de/informationen-zum-datenschutz", "/de/de/kinder-an-bord", "/de/de/kindermenues-an-bord", "/de/de/local-page/south-africa-winter-promotion", "/de/de/lounge-begleitung", "/de/de/lounges", "/de/de/lufthansa-am-flughafen-duesseldorf", "/de/de/lufthansa-am-flughafen-frankfurt", "/de/de/lufthansa-am-flughafen-wien", "/de/de/lufthansa-at-berlin-airport", "/de/de/lufthansa-at-zuerich-airport", "/de/de/lufthansa-aviation-group", "/de/de/lufthansa-business-class-on-long-haul-routes", "/de/de/lufthansa-city/culinaryjourney", "/de/de/lufthansa-city/menu-card", "/de/de/lufthansa-ejournals", "/de/de/lufthansa-express", "/de/de/lufthansa-express-bus", "/de/de/lufthansa-express-rail", "/de/de/lufthansa-firmenkunden", "/de/de/lufthansa-first-class-entertainment", "/de/de/lufthansa-first-class-flotte", "/de/de/lufthansa-first-class-komfort", "/de/de/lufthansa-group-star-alliance-and-partner-airlines", "/de/de/lufthansa-guide-service", "/de/de/lufthansa-reiseklassen", "/de/de/lufthansa-terminal-muenchen", "/de/de/medikamenten-transport", "/de/de/meetings-and-events", "/de/de/meetings-und-events-individuelle-angebotsanfrage", "/de/de/meetings-und-events-teilnehmer", "/de/de/mein-logbuch", "/de/de/meine-buchungen", "/de/de/menues-auf-langstreckenfluegen", "/de/de/menues-reiseklassen", "/de/de/mietwagenangebote", "/de/de/miles-and-more", "/de/de/mit-kindern-am-flughafen", "/de/de/mobility-partner-program-healthcare", "/de/de/munich-fair", "/de/de/nachhaltiger-fliegen", "/de/de/nutzungsbedingungen", "/de/de/nutzungsbedingungen-waehrungsumrechnung", "/de/de/onboard-delights", "/de/de/onboard-delights-faq", "/de/de/online-check-in", "/de/de/online-check-in-info", "/de/de/online-check-in-mit-der-ganzen-familie", "/de/de/overview-flights", "/de/de/overview-manage", "/de/de/overview-special-request", "/de/de/overview-travel-information", "/de/de/partner", "/de/de/passenger-receipt-90", "/de/de/passenger-rights", "/de/de/passengers-using-wheelchairs", "/de/de/passengers-with-sensory-impairment", "/de/de/pre-check-in", "/de/de/premium-economy-class", "/de/de/prepare-for-your-trip/airport-information/services-at-the-airport/security-waiting-time", "/de/de/prepare-for-your-trip/baggage/baggage-conditions", "/de/de/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg", "/de/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay", "/de/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage", "/de/de/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage", "/de/de/prepare-for-your-trip/baggage/electronic-devices-and-batteries", "/de/de/prepare-for-your-trip/baggage/sport-baggage/register-ammunition", "/de/de/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation", "/de/de/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation", "/de/de/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation", "/de/de/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation", "/de/de/prepare-for-your-trip/current-travel-information", "/de/de/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system", "/de/de/prepare-for-your-trip/entry-regulations/immigration-regulations-uk", "/de/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing", "/de/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing", "/de/de/prepare-for-your-trip/special-travel-needs/medical-travel-companions", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment", "/de/de/prepare-for-your-trip/travel-classes/economy-basic", "/de/de/prepare-for-your-trip/travelling-with-children/child-in-businessclass", "/de/de/prepare-for-your-trip/travelling-with-children/planning-with-kids", "/de/de/rail-and-fly", "/de/de/rail-fly-bedingungen", "/de/de/rechnungsbeleg", "/de/de/refund", "/de/de/register-animal-cabin", "/de/de/reisebueros", "/de/de/reisen-mit-besonderen-anforderungen", "/de/de/rollstuhlbatterien", "/de/de/schengen", "/de/de/secure-flight", "/de/de/security-fast-lanes", "/de/de/sepa-bedingungen", "/de/de/sepa-bedingungen-b", "/de/de/services-am-flughafen", "/de/de/services-am-flughafen-frankfurt", "/de/de/services-am-flughafen-muenchen", "/de/de/services-an-bord", "/de/de/shopping", "/de/de/sicherheit-fuer-kleinkinder-an-bord", "/de/de/sitzplaene", "/de/de/sitzplatzreservierungen-konditionen", "/de/de/sixt", "/de/de/sondermahlzeiten", "/de/de/speisen-und-getraenke", "/de/de/sportgepaeck", "/de/de/sportgepaeck-hinzufuegen", "/de/de/support/contact/contact-form-confirmation", "/de/de/support/contact/passenger-duty-united-kingdom", "/de/de/support/fast-compensation/compensation-flight-disruptions", "/de/de/support/feedback-and-contact-airlines", "/de/de/support/search/search-result", "/de/de/support/support", "/de/de/tiere-als-handgepaeck", "/de/de/tiere-als-uebergepaeck", "/de/de/tips-senior-travellers", "/de/de/travel-briefing", "/de/de/travel-expense-management", "/de/de/travel-id-terms-conditions", "/de/de/travelling-with-animals", "/de/de/traveltricks", "/de/de/uebergepaeck", "/de/de/unterhaltung-an-bord", "/de/de/upgrade-business-class-langstrecke", "/de/de/upgrade-first-class", "/de/de/upgrade-in-die-business-class", "/de/de/upgrade-in-die-premium-economy-class", "/de/de/upgrade-informationen", "/de/de/upgrade-premium-economy-class", "/de/de/upgrademoeglichkeiten", "/de/de/upgrades-im-online-check-in", "/de/de/zahlungsmoeglichkeiten-am-flughafen", "/de/de/zeitfenster-sicherheitskontrolle", "/de/en/100-years", "/de/en/100-years/cabin-design", "/de/en/100-years/campaigns", "/de/en/100-years/chronicle", "/de/en/100-years/crane", "/de/en/100-years/destinations", "/de/en/100-years/fleet", "/de/en/100-years/global-network", "/de/en/100-years/history", "/de/en/100-years/history/menu-on-board", "/de/en/320", "/de/en/32n", "/de/en/359", "/de/en/744", "/de/en/accessible-travel", "/de/en/add-sports-baggage", "/de/en/additional-services", "/de/en/addresses-worldwide", "/de/en/admission-rules", "/de/en/advance-seat-reservation", "/de/en/advance-seat-reservations-terms-and-conditions", "/de/en/advice-for-travellers-with-special-needs-to-and-from-the-usa", "/de/en/affiliatemarketing", "/de/en/airport-information", "/de/en/all-check-in", "/de/en/anmeldung-tiere-frachtraum", "/de/en/arrival-services", "/de/en/articles", "/de/en/articles/authors", "/de/en/articles/authors/alexandra-mikamo", "/de/en/articles/authors/florian-schwebel", "/de/en/articles/authors/florian-tomberg", "/de/en/articles/authors/julia-buth", "/de/en/articles/authors/till-weisbrod", "/de/en/articles/explore-flying", "/de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history", "/de/en/articles/explore-flying/a-girl-named-lufthansa", "/de/en/articles/explore-flying/aircraft-lights-explained", "/de/en/articles/explore-flying/allegris-business-class-dirk-nowitzki", "/de/en/articles/explore-flying/allegris-exclusive-first-class-loungewear", "/de/en/articles/explore-flying/allegris-first-class-innovations", "/de/en/articles/explore-flying/allegris-first-class-reasons-for-allegris-first-class", "/de/en/articles/explore-flying/allegris-fox", "/de/en/articles/explore-flying/anniversary-super-crane-special", "/de/en/articles/explore-flying/art-basel-miami-beach-stefan-marx", "/de/en/articles/explore-flying/best-airport-restaurants", "/de/en/articles/explore-flying/business-class-culinary-journey-with-johann-lafer", "/de/en/articles/explore-flying/celebrating-20-years-of-excellence", "/de/en/articles/explore-flying/cockpit-collaboration", "/de/en/articles/explore-flying/come-fly-with-me-lufthansa-allegris", "/de/en/articles/explore-flying/culinary-craftsmanship-smoked-fish-for-first-and-business-class", "/de/en/articles/explore-flying/essentials-future-of-flying", "/de/en/articles/explore-flying/essentials-lufthansa-facts", "/de/en/articles/explore-flying/essentials-surprising-lufthansa-numbers", "/de/en/articles/explore-flying/everyone-wants-to-fly-with-the-cranes", "/de/en/articles/explore-flying/female-pilots", "/de/en/articles/explore-flying/first-class-culinary-inspiration-journey-tokyo", "/de/en/articles/explore-flying/first-class-reimagined", "/de/en/articles/explore-flying/first-class-terminal-architecture", "/de/en/articles/explore-flying/flying-high-christoph-quarch", "/de/en/articles/explore-flying/flying-high-meta-city", "/de/en/articles/explore-flying/future-of-flying", "/de/en/articles/explore-flying/help-alliance-engagement-in-tanzania", "/de/en/articles/explore-flying/help-alliance-taking-off-for-a-good-cause", "/de/en/articles/explore-flying/hon-circle-event", "/de/en/articles/explore-flying/how-to-become-a-flight-attendant", "/de/en/articles/explore-flying/how-to-become-a-pilot", "/de/en/articles/explore-flying/inflight-entertainment-vr-experience", "/de/en/articles/explore-flying/inside-lufthansa-lh-allegris", "/de/en/articles/explore-flying/interview-livery-iconic-moments", "/de/en/articles/explore-flying/livery-iconic-moments", "/de/en/articles/explore-flying/lufthansa-allegris-first-class", "/de/en/articles/explore-flying/lufthansa-allegris-welcome-to-the-future-of-aviation", "/de/en/articles/explore-flying/lufthansa-classics", "/de/en/articles/explore-flying/lufthansa-fleet-our-aircrafts", "/de/en/articles/explore-flying/lufthansa-group-wifi", "/de/en/articles/explore-flying/lufthansa-help-alliance-i-fly-for-campaign", "/de/en/articles/explore-flying/lufthansa-in-the-spotlight", "/de/en/articles/explore-flying/lufthansa-innovation-hub-future-of-flying", "/de/en/articles/explore-flying/lufthansa-insights-art", "/de/en/articles/explore-flying/lufthansa-lounges", "/de/en/articles/explore-flying/lufthansa-orchestra-channel-aid-live-in-concert", "/de/en/articles/explore-flying/lufthansa-uniforms-history", "/de/en/articles/explore-flying/meet-the-makers-innovations-for-individual-well-being", "/de/en/articles/explore-flying/meet-the-makers-lufthansa-allegris-business-class", "/de/en/articles/explore-flying/meet-the-makers-lufthansa-allegris-first-class", "/de/en/articles/explore-flying/meet-the-makers-the-manufactures-of-the-first-class-suites", "/de/en/articles/explore-flying/new-lufthansa-lounge-newark-interview", "/de/en/articles/explore-flying/oktoberfest-traditional-bavarian-attire", "/de/en/articles/explore-flying/pride-diversifly-queer-employee-network-lufthansa-group", "/de/en/articles/explore-flying/queer-travel-safer-trips", "/de/en/articles/explore-flying/responsibility-lufthansa", "/de/en/articles/explore-flying/things-you-always-wanted-to-know-about-flying", "/de/en/articles/explore-flying/time-travel-ki-aviation", "/de/en/articles/explore-flying/travel-trends", "/de/en/articles/explore-flying/vacation-packing-list", "/de/en/articles/explore-flying/welcome-to-my-world-alexandra-maria-lara", "/de/en/articles/explore-flying/welcome-to-my-world-bridget-finn", "/de/en/articles/explore-flying/welcome-to-my-world-elyas-mbarek", "/de/en/articles/explore-flying/welcome-to-my-world-emilia-schuele", "/de/en/articles/explore-flying/welcome-to-my-world-karolina-kurkova", "/de/en/articles/explore-flying/welcome-to-my-world-karoline-herfurth", "/de/en/articles/explore-flying/welcome-to-my-world-lexie-alford", "/de/en/articles/explore-flying/what-does-luxury-mean-today", "/de/en/articles/explore-flying/what-the-hack-anti-jetlag-tips", "/de/en/articles/explore-flying/what-the-hack-best-seats", "/de/en/articles/explore-flying/what-the-hack-travel-gadgets", "/de/en/articles/explore-flying/what-the-hack-travel-hacks", "/de/en/articles/explore-flying/what-the-hack-travel-with-kids", "/de/en/articles/explore-flying/what-the-hack-waiting-time-at-the-airport", "/de/en/articles/explore-flying/what-the-hack-what-is-the-etiquette-of-traveling", "/de/en/articles/explore-flying/yes-stories-the-fascination-of-skydiving", "/de/en/articles/explore-flying/yes-stories-the-two-worlds-of-kaye-ree", "/de/en/articles/explore-flying/yes-stories-thorsten-buss", "/de/en/articles/explore-flying/yes-stories-tom-rees", "/de/en/articles/explore-the-world", "/de/en/articles/explore-the-world/a-perfect-day-amsterdam-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-art-basel-miami-beach-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-athens-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-bangkok-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-beijing-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-bengaluru-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-boston-on-one-day", "/de/en/articles/explore-the-world/a-perfect-day-budapest-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-buenos-aires-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-cape-town-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-charlotte-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-chicago-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-copenhagen-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-dublin-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-frankfurt-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-hamburg", "/de/en/articles/explore-the-world/a-perfect-day-helsinki-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-hong-kong-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-houston-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-istanbul-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-johannesburg-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-la-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-lisbon-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-london-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-madrid-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-malaga-on-one-day", "/de/en/articles/explore-the-world/a-perfect-day-mallorca-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-mexico-city-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-miami-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-milan-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-mumbai-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-munich-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-ny-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-oslo-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-paris-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-porto-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-prague-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-rio-de-janeiro-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-rome-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-san-francisco-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-seoul-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-shanghai-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-singapore-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-stockholm-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-tokyo-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-toronto-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-vienna-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-washington-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-zurich-in-one-day", "/de/en/articles/explore-the-world/a-perfect-nairobi-city-in-one-day", "/de/en/articles/explore-the-world/art-basel-miami-beach-fun-facts", "/de/en/articles/explore-the-world/be-picky-amsterdam-insider-tips", "/de/en/articles/explore-the-world/be-picky-athens-insider-tips", "/de/en/articles/explore-the-world/be-picky-bangkok-insider-tips", "/de/en/articles/explore-the-world/be-picky-barcelona-insider-tips", "/de/en/articles/explore-the-world/be-picky-bengaluru", "/de/en/articles/explore-the-world/be-picky-budapest-insider-tips", "/de/en/articles/explore-the-world/be-picky-buenos-aires-insider-tips", "/de/en/articles/explore-the-world/be-picky-cape-town-insider-tips", "/de/en/articles/explore-the-world/be-picky-charlotte-insider-tips", "/de/en/articles/explore-the-world/be-picky-chicago-insider-tips", "/de/en/articles/explore-the-world/be-picky-copenhagen", "/de/en/articles/explore-the-world/be-picky-dublin-insider-tips", "/de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips", "/de/en/articles/explore-the-world/be-picky-helsinkis-insider-tips", "/de/en/articles/explore-the-world/be-picky-hong-kong-insider-tips", "/de/en/articles/explore-the-world/be-picky-istanbul-insider-tips", "/de/en/articles/explore-the-world/be-picky-johannesburg-insider-tipps", "/de/en/articles/explore-the-world/be-picky-la-insider-tips", "/de/en/articles/explore-the-world/be-picky-lisbon", "/de/en/articles/explore-the-world/be-picky-little-italy-in-vancouver", "/de/en/articles/explore-the-world/be-picky-london-insider-tips", "/de/en/articles/explore-the-world/be-picky-madrid", "/de/en/articles/explore-the-world/be-picky-mallorca-insider-tips", "/de/en/articles/explore-the-world/be-picky-mexico-city-insider-tips", "/de/en/articles/explore-the-world/be-picky-miami-insider-tips", "/de/en/articles/explore-the-world/be-picky-milan-insider-tips", "/de/en/articles/explore-the-world/be-picky-mumbai-insider-tips", "/de/en/articles/explore-the-world/be-picky-munich-insider-tip-anika-landsteiner", "/de/en/articles/explore-the-world/be-picky-ny-insider-tips", "/de/en/articles/explore-the-world/be-picky-oslo-insider-tips", "/de/en/articles/explore-the-world/be-picky-paris-insider-tips", "/de/en/articles/explore-the-world/be-picky-prague-insider-tips", "/de/en/articles/explore-the-world/be-picky-rio-de-janeiro-insider-tips", "/de/en/articles/explore-the-world/be-picky-rome-insider-tips", "/de/en/articles/explore-the-world/be-picky-san-francisco-insider-tips", "/de/en/articles/explore-the-world/be-picky-seoul-insider-tips", "/de/en/articles/explore-the-world/be-picky-shanghai-insider-tips", "/de/en/articles/explore-the-world/be-picky-singapore-insider-tips", "/de/en/articles/explore-the-world/be-picky-stockholm", "/de/en/articles/explore-the-world/be-picky-tokyo-insider-tips", "/de/en/articles/explore-the-world/be-picky-toronto-insider-tips", "/de/en/articles/explore-the-world/be-picky-vienna-insider-tips", "/de/en/articles/explore-the-world/be-picky-washington-insider-tips", "/de/en/articles/explore-the-world/be-picky-zurich-insider-tips", "/de/en/articles/explore-the-world/copenhagen-what-i-have-learned", "/de/en/articles/explore-the-world/eat-see-do-algiers", "/de/en/articles/explore-the-world/eat-see-do-almaty", "/de/en/articles/explore-the-world/eat-see-do-amman", "/de/en/articles/explore-the-world/eat-see-do-atlanta", "/de/en/articles/explore-the-world/eat-see-do-beijing", "/de/en/articles/explore-the-world/eat-see-do-berlin", "/de/en/articles/explore-the-world/eat-see-do-bilbao", "/de/en/articles/explore-the-world/eat-see-do-bogota", "/de/en/articles/explore-the-world/eat-see-do-boston", "/de/en/articles/explore-the-world/eat-see-do-cagliari", "/de/en/articles/explore-the-world/eat-see-do-cairo", "/de/en/articles/explore-the-world/eat-see-do-casablanca", "/de/en/articles/explore-the-world/eat-see-do-catania", "/de/en/articles/explore-the-world/eat-see-do-chennai", "/de/en/articles/explore-the-world/eat-see-do-dallas", "/de/en/articles/explore-the-world/eat-see-do-denver", "/de/en/articles/explore-the-world/eat-see-do-detroit", "/de/en/articles/explore-the-world/eat-see-do-dubai", "/de/en/articles/explore-the-world/eat-see-do-edinburgh", "/de/en/articles/explore-the-world/eat-see-do-faro", "/de/en/articles/explore-the-world/eat-see-do-gothenburg", "/de/en/articles/explore-the-world/eat-see-do-hamburg", "/de/en/articles/explore-the-world/eat-see-do-houston", "/de/en/articles/explore-the-world/eat-see-do-hyderabad", "/de/en/articles/explore-the-world/eat-see-do-kuala-lumpur", "/de/en/articles/explore-the-world/eat-see-do-larnaca", "/de/en/articles/explore-the-world/eat-see-do-ljubljana", "/de/en/articles/explore-the-world/eat-see-do-malaga", "/de/en/articles/explore-the-world/eat-see-do-manchester", "/de/en/articles/explore-the-world/eat-see-do-marseille", "/de/en/articles/explore-the-world/eat-see-do-minneapolis-st-paul", "/de/en/articles/explore-the-world/eat-see-do-nairobi", "/de/en/articles/explore-the-world/eat-see-do-nice", "/de/en/articles/explore-the-world/eat-see-do-olbia", "/de/en/articles/explore-the-world/eat-see-do-porto", "/de/en/articles/explore-the-world/eat-see-do-raleigh-durham", "/de/en/articles/explore-the-world/eat-see-do-riga", "/de/en/articles/explore-the-world/eat-see-do-riyadh", "/de/en/articles/explore-the-world/eat-see-do-san-diego", "/de/en/articles/explore-the-world/eat-see-do-seattle", "/de/en/articles/explore-the-world/eat-see-do-st-louis", "/de/en/articles/explore-the-world/eat-see-do-tallinn", "/de/en/articles/explore-the-world/eat-see-do-tbilisi", "/de/en/articles/explore-the-world/eat-see-do-tel-aviv", "/de/en/articles/explore-the-world/eat-see-do-thessaloniki", "/de/en/articles/explore-the-world/eat-see-do-tirana", "/de/en/articles/explore-the-world/eat-see-do-tunis", "/de/en/articles/explore-the-world/eat-see-do-valletta", "/de/en/articles/explore-the-world/eat-see-do-venice", "/de/en/articles/explore-the-world/eat-see-do-vilnius", "/de/en/articles/explore-the-world/eat-see-do-zagreb", "/de/en/articles/explore-the-world/essentials-amsterdam-facts", "/de/en/articles/explore-the-world/essentials-athens-facts", "/de/en/articles/explore-the-world/essentials-bangkok-facts", "/de/en/articles/explore-the-world/essentials-barcelona-facts", "/de/en/articles/explore-the-world/essentials-beijing-facts", "/de/en/articles/explore-the-world/essentials-bengaluru-facts", "/de/en/articles/explore-the-world/essentials-boston-facts", "/de/en/articles/explore-the-world/essentials-budapest-facts", "/de/en/articles/explore-the-world/essentials-buenos-aires-facts", "/de/en/articles/explore-the-world/essentials-cape-town-facts", "/de/en/articles/explore-the-world/essentials-charlotte-facts", "/de/en/articles/explore-the-world/essentials-chicago-facts", "/de/en/articles/explore-the-world/essentials-copenhagen-facts", "/de/en/articles/explore-the-world/essentials-dublin-facts", "/de/en/articles/explore-the-world/essentials-facts-vancouver", "/de/en/articles/explore-the-world/essentials-frankfurt-facts", "/de/en/articles/explore-the-world/essentials-helsinki-facts", "/de/en/articles/explore-the-world/essentials-hong-kong-facts", "/de/en/articles/explore-the-world/essentials-istanbul-facts", "/de/en/articles/explore-the-world/essentials-johannesburg-facts", "/de/en/articles/explore-the-world/essentials-la-facts", "/de/en/articles/explore-the-world/essentials-lisbon-facts", "/de/en/articles/explore-the-world/essentials-london-facts", "/de/en/articles/explore-the-world/essentials-madrid-facts", "/de/en/articles/explore-the-world/essentials-mallorca-facts", "/de/en/articles/explore-the-world/essentials-mexico-city-facts", "/de/en/articles/explore-the-world/essentials-miami-facts", "/de/en/articles/explore-the-world/essentials-milan-facts", "/de/en/articles/explore-the-world/essentials-mumbai-facts", "/de/en/articles/explore-the-world/essentials-munich-facts", "/de/en/articles/explore-the-world/essentials-ny-facts", "/de/en/articles/explore-the-world/essentials-oslo-facts", "/de/en/articles/explore-the-world/essentials-paris-facts", "/de/en/articles/explore-the-world/essentials-prague-facts", "/de/en/articles/explore-the-world/essentials-rio-de-janeiro-facts", "/de/en/articles/explore-the-world/essentials-rome-facts", "/de/en/articles/explore-the-world/essentials-san-francisco-facts", "/de/en/articles/explore-the-world/essentials-seoul-facts", "/de/en/articles/explore-the-world/essentials-shanghai-facts", "/de/en/articles/explore-the-world/essentials-singapore-facts", "/de/en/articles/explore-the-world/essentials-stockholm-facts", "/de/en/articles/explore-the-world/essentials-tokyo-facts", "/de/en/articles/explore-the-world/essentials-toronto-facts", "/de/en/articles/explore-the-world/essentials-vienna-facts", "/de/en/articles/explore-the-world/essentials-washington-facts", "/de/en/articles/explore-the-world/essentials-zurich-facts", "/de/en/articles/explore-the-world/experience-art-live", "/de/en/articles/explore-the-world/experience-nature", "/de/en/articles/explore-the-world/in-my-hood-apgujeong-seoul", "/de/en/articles/explore-the-world/in-my-hood-arroios-lissabon", "/de/en/articles/explore-the-world/in-my-hood-back-bay-boston", "/de/en/articles/explore-the-world/in-my-hood-bandra-mumbai", "/de/en/articles/explore-the-world/in-my-hood-chiswick-london", "/de/en/articles/explore-the-world/in-my-hood-citta-studi-milan", "/de/en/articles/explore-the-world/in-my-hood-city-centre-cape-town", "/de/en/articles/explore-the-world/in-my-hood-comercial-drive-vancouver", "/de/en/articles/explore-the-world/in-my-hood-coyoacan-mexico-city", "/de/en/articles/explore-the-world/in-my-hood-creative-quarter-dublin", "/de/en/articles/explore-the-world/in-my-hood-district-helsinki", "/de/en/articles/explore-the-world/in-my-hood-district-houston", "/de/en/articles/explore-the-world/in-my-hood-district-malaga", "/de/en/articles/explore-the-world/in-my-hood-district-nairobi", "/de/en/articles/explore-the-world/in-my-hood-district-porto", "/de/en/articles/explore-the-world/in-my-hood-district-viii-budapest", "/de/en/articles/explore-the-world/in-my-hood-district-zurich", "/de/en/articles/explore-the-world/in-my-hood-gamlebyen-oslo", "/de/en/articles/explore-the-world/in-my-hood-geylang-singapur", "/de/en/articles/explore-the-world/in-my-hood-gulou-beijing", "/de/en/articles/explore-the-world/in-my-hood-hollywood-road-hong-kong", "/de/en/articles/explore-the-world/in-my-hood-indiranagar-bengaluru", "/de/en/articles/explore-the-world/in-my-hood-ipanema-rio-de-janeiro", "/de/en/articles/explore-the-world/in-my-hood-japantown-san-francisco", "/de/en/articles/explore-the-world/in-my-hood-kadikoey-istanbul", "/de/en/articles/explore-the-world/in-my-hood-kampung-attap-kuala-lumpur", "/de/en/articles/explore-the-world/in-my-hood-kreuzberg-berlin", "/de/en/articles/explore-the-world/in-my-hood-larchmont-la", "/de/en/articles/explore-the-world/in-my-hood-le-sentier-paris", "/de/en/articles/explore-the-world/in-my-hood-mallorca", "/de/en/articles/explore-the-world/in-my-hood-metaxourgeio-athens", "/de/en/articles/explore-the-world/in-my-hood-mount-pleasant-washington", "/de/en/articles/explore-the-world/in-my-hood-munich-sendling", "/de/en/articles/explore-the-world/in-my-hood-nice-ouest", "/de/en/articles/explore-the-world/in-my-hood-noord-amsterdam", "/de/en/articles/explore-the-world/in-my-hood-ny-brooklyn", "/de/en/articles/explore-the-world/in-my-hood-osterbro-kopenhagen", "/de/en/articles/explore-the-world/in-my-hood-palermo-buenos-aires", "/de/en/articles/explore-the-world/in-my-hood-plaza-midwood-charlotte", "/de/en/articles/explore-the-world/in-my-hood-poblenou-barcelona", "/de/en/articles/explore-the-world/in-my-hood-rome-pigneto-rome", "/de/en/articles/explore-the-world/in-my-hood-rosebank-johannesburg", "/de/en/articles/explore-the-world/in-my-hood-sachsenhausen-frankfurt", "/de/en/articles/explore-the-world/in-my-hood-salamanca-madrid", "/de/en/articles/explore-the-world/in-my-hood-schanzenviertel-hamburg", "/de/en/articles/explore-the-world/in-my-hood-schaumburg-chicago", "/de/en/articles/explore-the-world/in-my-hood-seventh-district-vienna", "/de/en/articles/explore-the-world/in-my-hood-shinjuku-tokyo", "/de/en/articles/explore-the-world/in-my-hood-song-wat-road-bangkok", "/de/en/articles/explore-the-world/in-my-hood-south-beach-miami", "/de/en/articles/explore-the-world/in-my-hood-the-bund-shanghai", "/de/en/articles/explore-the-world/in-my-hood-toronto-summerhill", "/de/en/articles/explore-the-world/in-my-hood-vasastaden-stockholm", "/de/en/articles/explore-the-world/in-my-hood-vrsovice-prague", "/de/en/articles/explore-the-world/in-my-hood-west-seattle-seattle", "/de/en/articles/explore-the-world/know-before-you-go-algiers", "/de/en/articles/explore-the-world/know-before-you-go-almaty", "/de/en/articles/explore-the-world/know-before-you-go-amman", "/de/en/articles/explore-the-world/know-before-you-go-atlanta", "/de/en/articles/explore-the-world/know-before-you-go-beijing", "/de/en/articles/explore-the-world/know-before-you-go-berlin", "/de/en/articles/explore-the-world/know-before-you-go-bilbao", "/de/en/articles/explore-the-world/know-before-you-go-bogota", "/de/en/articles/explore-the-world/know-before-you-go-boston", "/de/en/articles/explore-the-world/know-before-you-go-cagliari", "/de/en/articles/explore-the-world/know-before-you-go-cairo", "/de/en/articles/explore-the-world/know-before-you-go-casablanca", "/de/en/articles/explore-the-world/know-before-you-go-catania", "/de/en/articles/explore-the-world/know-before-you-go-chennai", "/de/en/articles/explore-the-world/know-before-you-go-dallas", "/de/en/articles/explore-the-world/know-before-you-go-denver", "/de/en/articles/explore-the-world/know-before-you-go-detroit", "/de/en/articles/explore-the-world/know-before-you-go-dubai", "/de/en/articles/explore-the-world/know-before-you-go-edinburgh", "/de/en/articles/explore-the-world/know-before-you-go-faro", "/de/en/articles/explore-the-world/know-before-you-go-gothenburg", "/de/en/articles/explore-the-world/know-before-you-go-hamburg", "/de/en/articles/explore-the-world/know-before-you-go-houston", "/de/en/articles/explore-the-world/know-before-you-go-hyderabad", "/de/en/articles/explore-the-world/know-before-you-go-kuala-lumpur", "/de/en/articles/explore-the-world/know-before-you-go-larnaca", "/de/en/articles/explore-the-world/know-before-you-go-ljubljana", "/de/en/articles/explore-the-world/know-before-you-go-malaga", "/de/en/articles/explore-the-world/know-before-you-go-manchester", "/de/en/articles/explore-the-world/know-before-you-go-marseille", "/de/en/articles/explore-the-world/know-before-you-go-minneapolis-st-paul", "/de/en/articles/explore-the-world/know-before-you-go-nairobi", "/de/en/articles/explore-the-world/know-before-you-go-nice", "/de/en/articles/explore-the-world/know-before-you-go-olbia", "/de/en/articles/explore-the-world/know-before-you-go-porto", "/de/en/articles/explore-the-world/know-before-you-go-raleigh-durham", "/de/en/articles/explore-the-world/know-before-you-go-riga", "/de/en/articles/explore-the-world/know-before-you-go-riyadh", "/de/en/articles/explore-the-world/know-before-you-go-san-diego", "/de/en/articles/explore-the-world/know-before-you-go-seattle", "/de/en/articles/explore-the-world/know-before-you-go-st-louis", "/de/en/articles/explore-the-world/know-before-you-go-tallinn", "/de/en/articles/explore-the-world/know-before-you-go-tbilisi", "/de/en/articles/explore-the-world/know-before-you-go-tel-aviv", "/de/en/articles/explore-the-world/know-before-you-go-thessaloniki", "/de/en/articles/explore-the-world/know-before-you-go-tirana", "/de/en/articles/explore-the-world/know-before-you-go-tunis", "/de/en/articles/explore-the-world/know-before-you-go-valletta", "/de/en/articles/explore-the-world/know-before-you-go-venice", "/de/en/articles/explore-the-world/know-before-you-go-vilnius", "/de/en/articles/explore-the-world/know-before-you-go-zagreb", "/de/en/articles/explore-the-world/my-experiences-in-vancouver", "/de/en/articles/explore-the-world/new-shopping", "/de/en/articles/explore-the-world/next-level-gaming", "/de/en/articles/explore-the-world/on-the-scene-architecture-copenhagen", "/de/en/articles/explore-the-world/on-the-scene-art-and-pubs-dublin", "/de/en/articles/explore-the-world/on-the-scene-art-johannesburg", "/de/en/articles/explore-the-world/on-the-scene-bar-basso-milan", "/de/en/articles/explore-the-world/on-the-scene-bookstores-buenos-aires", "/de/en/articles/explore-the-world/on-the-scene-braamfontein-johannesburg", "/de/en/articles/explore-the-world/on-the-scene-brunch-restaurants-la", "/de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich", "/de/en/articles/explore-the-world/on-the-scene-chicago-beer", "/de/en/articles/explore-the-world/on-the-scene-creative-architecture-prague", "/de/en/articles/explore-the-world/on-the-scene-culinary-trip-washington", "/de/en/articles/explore-the-world/on-the-scene-fashion-and-culture-budapest", "/de/en/articles/explore-the-world/on-the-scene-food-mumbai", "/de/en/articles/explore-the-world/on-the-scene-food-trends-amsterdam", "/de/en/articles/explore-the-world/on-the-scene-food-trends-bengaluru", "/de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul", "/de/en/articles/explore-the-world/on-the-scene-hidden-gems-seoul", "/de/en/articles/explore-the-world/on-the-scene-humor-vienna", "/de/en/articles/explore-the-world/on-the-scene-listening-bars-toronto", "/de/en/articles/explore-the-world/on-the-scene-lunch-mexico-city", "/de/en/articles/explore-the-world/on-the-scene-mallorca", "/de/en/articles/explore-the-world/on-the-scene-music-cape-town", "/de/en/articles/explore-the-world/on-the-scene-samba-rio-de-janeiro", "/de/en/articles/explore-the-world/on-the-scene-san-francisco-fashion", "/de/en/articles/explore-the-world/on-the-scene-shanghai-art-scene", "/de/en/articles/explore-the-world/on-the-scene-shopping-barcelona", "/de/en/articles/explore-the-world/on-the-scene-shopping-lisbon", "/de/en/articles/explore-the-world/on-the-scene-shopping-tokyo", "/de/en/articles/explore-the-world/on-the-scene-sports-miami", "/de/en/articles/explore-the-world/on-the-scene-stockholm", "/de/en/articles/explore-the-world/on-the-scene-street-art-charlotte", "/de/en/articles/explore-the-world/on-the-scene-street-art-london", "/de/en/articles/explore-the-world/on-the-scene-streetart-athens", "/de/en/articles/explore-the-world/on-the-scene-super-bros-frankfurt", "/de/en/articles/explore-the-world/on-the-scene-supper-clubs-ny", "/de/en/articles/explore-the-world/on-the-scene-techno-sound-rome", "/de/en/articles/explore-the-world/on-the-scene-tips-oslo", "/de/en/articles/explore-the-world/on-the-scene-topic-bangkok", "/de/en/articles/explore-the-world/on-the-scene-topic-helsinki", "/de/en/articles/explore-the-world/on-the-scene-topic-zurich", "/de/en/articles/explore-the-world/on-the-scene-trends-madrid", "/de/en/articles/explore-the-world/on-the-scene-urban-farming-singapore", "/de/en/articles/explore-the-world/on-the-scene-vancouver-donuts", "/de/en/articles/explore-the-world/on-the-scene-wellness-cuisine-hong-kong", "/de/en/articles/explore-the-world/perfect-day-nice-cote-dazur", "/de/en/articles/explore-the-world/perfect-day-seattle", "/de/en/articles/explore-the-world/perfect-day-tips-vancouver", "/de/en/articles/explore-the-world/picture-perfect-austin", "/de/en/articles/explore-the-world/picture-perfect-beijing", "/de/en/articles/explore-the-world/picture-perfect-bogota", "/de/en/articles/explore-the-world/picture-perfect-boston", "/de/en/articles/explore-the-world/picture-perfect-cairo", "/de/en/articles/explore-the-world/picture-perfect-elevator-boys", "/de/en/articles/explore-the-world/picture-perfect-hyderabad", "/de/en/articles/explore-the-world/picture-perfect-la", "/de/en/articles/explore-the-world/picture-perfect-ny", "/de/en/articles/explore-the-world/picture-perfect-riad", "/de/en/articles/explore-the-world/picture-perfect-singapore", "/de/en/articles/explore-the-world/sao-paulo-sights", "/de/en/articles/explore-the-world/stop-over-bangkok", "/de/en/articles/explore-the-world/stop-over-beijing", "/de/en/articles/explore-the-world/stop-over-boston", "/de/en/articles/explore-the-world/stop-over-buenos-aires", "/de/en/articles/explore-the-world/stop-over-charlotte", "/de/en/articles/explore-the-world/stop-over-hong-kong", "/de/en/articles/explore-the-world/stop-over-johannesburg", "/de/en/articles/explore-the-world/stop-over-los-angeles", "/de/en/articles/explore-the-world/stop-over-mexico-city", "/de/en/articles/explore-the-world/stop-over-seoul", "/de/en/articles/explore-the-world/stop-over-singapore", "/de/en/articles/explore-the-world/stop-over-tokyo", "/de/en/articles/explore-the-world/stop-over-washington", "/de/en/articles/explore-the-world/team-sport", "/de/en/articles/explore-the-world/what-i-learned-living-in-amsterdam", "/de/en/articles/explore-the-world/what-i-learned-living-in-athens", "/de/en/articles/explore-the-world/what-i-learned-living-in-bangkok", "/de/en/articles/explore-the-world/what-i-learned-living-in-barcelona", "/de/en/articles/explore-the-world/what-i-learned-living-in-bengaluru", "/de/en/articles/explore-the-world/what-i-learned-living-in-boston", "/de/en/articles/explore-the-world/what-i-learned-living-in-budapest", "/de/en/articles/explore-the-world/what-i-learned-living-in-buenos-aires", "/de/en/articles/explore-the-world/what-i-learned-living-in-cape-town", "/de/en/articles/explore-the-world/what-i-learned-living-in-charlotte", "/de/en/articles/explore-the-world/what-i-learned-living-in-chicago", "/de/en/articles/explore-the-world/what-i-learned-living-in-dublin", "/de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt", "/de/en/articles/explore-the-world/what-i-learned-living-in-helsinki", "/de/en/articles/explore-the-world/what-i-learned-living-in-hong-kong", "/de/en/articles/explore-the-world/what-i-learned-living-in-istanbul", "/de/en/articles/explore-the-world/what-i-learned-living-in-johannesburg", "/de/en/articles/explore-the-world/what-i-learned-living-in-la", "/de/en/articles/explore-the-world/what-i-learned-living-in-lisbon", "/de/en/articles/explore-the-world/what-i-learned-living-in-london", "/de/en/articles/explore-the-world/what-i-learned-living-in-madrid", "/de/en/articles/explore-the-world/what-i-learned-living-in-mallorca", "/de/en/articles/explore-the-world/what-i-learned-living-in-mexico-city", "/de/en/articles/explore-the-world/what-i-learned-living-in-miami", "/de/en/articles/explore-the-world/what-i-learned-living-in-milan", "/de/en/articles/explore-the-world/what-i-learned-living-in-mumbai", "/de/en/articles/explore-the-world/what-i-learned-living-in-munich", "/de/en/articles/explore-the-world/what-i-learned-living-in-ny", "/de/en/articles/explore-the-world/what-i-learned-living-in-oslo", "/de/en/articles/explore-the-world/what-i-learned-living-in-paris", "/de/en/articles/explore-the-world/what-i-learned-living-in-prague", "/de/en/articles/explore-the-world/what-i-learned-living-in-rio-de-janeiro", "/de/en/articles/explore-the-world/what-i-learned-living-in-rome", "/de/en/articles/explore-the-world/what-i-learned-living-in-san-francisco", "/de/en/articles/explore-the-world/what-i-learned-living-in-seoul", "/de/en/articles/explore-the-world/what-i-learned-living-in-shanghai", "/de/en/articles/explore-the-world/what-i-learned-living-in-singapore", "/de/en/articles/explore-the-world/what-i-learned-living-in-stockholm", "/de/en/articles/explore-the-world/what-i-learned-living-in-tokyo", "/de/en/articles/explore-the-world/what-i-learned-living-in-toronto", "/de/en/articles/explore-the-world/what-i-learned-living-in-vienna", "/de/en/articles/explore-the-world/what-i-learned-living-in-washington", "/de/en/articles/explore-the-world/what-i-learned-living-in-zurich", "/de/en/articles/highlights", "/de/en/articles/highlights-european-championship", "/de/en/articles/highlights-european-championship/european-championship-2024-great-hope", "/de/en/articles/highlights-european-championship/european-championship-2024-locations", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-andrich", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-anton", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-baumann", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-beier", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-fuellkrug", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-kimmich", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-kroos", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-mittelstaedt", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-raum", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-tah", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-ter-stegen", "/de/en/articles/highlights-european-championship/european-championship-2024-player-videos-undav", "/de/en/articles/highlights-european-championship/european-championship-2024-quiz", "/de/en/articles/highlights-european-championship/european-championship-2024-thank-you", "/de/en/articles/highlights-european-championship/hungary-with-pride-and-passion", "/de/en/articles/highlights-european-championship/lose-like-the-germans", "/de/en/articles/highlights-european-championship/meet-the-germans", "/de/en/articles/highlights-european-championship/scotland-with-heart-and-energy", "/de/en/articles/highlights-european-championship/swiss-passion-meets-precision", "/de/en/articles/highlights/all-it-takes-is-a-yes", "/de/en/articles/highlights/allegris-a-new-flight-experience", "/de/en/articles/highlights/allegris-business-class-shanghai", "/de/en/articles/highlights/allegris-business-san-diego", "/de/en/articles/highlights/allegris-destinations", "/de/en/articles/highlights/allegris-dirk-nowitzki", "/de/en/articles/highlights/allegris-essentials", "/de/en/articles/highlights/allegris-experiences", "/de/en/articles/highlights/allegris-new-york", "/de/en/articles/highlights/allegris-premium-economy-san-diego", "/de/en/articles/highlights/allegris-travel-hacks", "/de/en/articles/highlights/allegris-typologies", "/de/en/articles/highlights/art-and-travel-delhi-berlin", "/de/en/articles/highlights/austin-texas-city-of-live-music", "/de/en/articles/highlights/chisinau-winter", "/de/en/articles/highlights/dfb-partnership-diversity-success", "/de/en/articles/highlights/exclusive-first-class-tracksuit", "/de/en/articles/highlights/fashion-footprints-new-york", "/de/en/articles/highlights/hyderabad-city-of-pearls-and-programmers", "/de/en/articles/highlights/johannesburg-winter", "/de/en/articles/highlights/minneapolis-best-winter-activities", "/de/en/articles/highlights/minneapolis-winter", "/de/en/articles/highlights/mumbai-nyc-art-journey", "/de/en/articles/highlights/mumbai-san-francisco-art-journey", "/de/en/articles/highlights/mumbai-uk-art-journey", "/de/en/articles/highlights/new-york-fashion-week", "/de/en/articles/highlights/raleigh-nc-winter", "/de/en/articles/highlights/rome-art-and-culture", "/de/en/articles/highlights/sao-paulo-carnival-brazil-largest-street-carnival", "/de/en/articles/highlights/seattle-winter", "/de/en/articles/highlights/shanghai-best-restaurants-and-traditional-chinese-dishes", "/de/en/articles/highlights/soccer-event-in-north-america", "/de/en/articles/highlights/sports-experiences-rio-de-janeiro", "/de/en/articles/highlights/stefan-marx-travel-hacks", "/de/en/articles/highlights/the-art-of-flying-extra-long-bed", "/de/en/articles/highlights/the-art-of-flying-extra-space-seat", "/de/en/articles/highlights/the-art-of-flying-suite", "/de/en/articles/highlights/vancouver-winter", "/de/en/articles/tags", "/de/en/articles/tags/algiers", "/de/en/articles/tags/allegris", "/de/en/articles/tags/allegris-inspires", "/de/en/articles/tags/almaty", "/de/en/articles/tags/amman", "/de/en/articles/tags/amsterdam", "/de/en/articles/tags/art", "/de/en/articles/tags/art-basel-miami-beach", "/de/en/articles/tags/athens", "/de/en/articles/tags/atlanta", "/de/en/articles/tags/bangkok", "/de/en/articles/tags/barcelona", "/de/en/articles/tags/be-picky", "/de/en/articles/tags/beijing", "/de/en/articles/tags/bengaluru", "/de/en/articles/tags/berlin", "/de/en/articles/tags/bilbao", "/de/en/articles/tags/bogota", "/de/en/articles/tags/boston", "/de/en/articles/tags/budapest", "/de/en/articles/tags/buenos-aires", "/de/en/articles/tags/cagliari", "/de/en/articles/tags/cairo", "/de/en/articles/tags/cape-town", "/de/en/articles/tags/casablanca", "/de/en/articles/tags/catania", "/de/en/articles/tags/charlotte", "/de/en/articles/tags/chennai", "/de/en/articles/tags/chicago", "/de/en/articles/tags/copenhagen", "/de/en/articles/tags/dallas", "/de/en/articles/tags/denver", "/de/en/articles/tags/detroit", "/de/en/articles/tags/dubai", "/de/en/articles/tags/dublin", "/de/en/articles/tags/eat-see-do", "/de/en/articles/tags/edinburgh", "/de/en/articles/tags/essentials", "/de/en/articles/tags/faro", "/de/en/articles/tags/fly-with-me", "/de/en/articles/tags/flying-high", "/de/en/articles/tags/food", "/de/en/articles/tags/frankfurt", "/de/en/articles/tags/frequent-flyers", "/de/en/articles/tags/future-of-flying", "/de/en/articles/tags/gothenburg", "/de/en/articles/tags/hamburg", "/de/en/articles/tags/helsinki", "/de/en/articles/tags/history", "/de/en/articles/tags/hong-kong", "/de/en/articles/tags/houston", "/de/en/articles/tags/hyderabad", "/de/en/articles/tags/in-my-hood", "/de/en/articles/tags/inside-lufthansa", "/de/en/articles/tags/istanbul", "/de/en/articles/tags/johannesburg", "/de/en/articles/tags/know-before-you-go", "/de/en/articles/tags/kuala-lumpur", "/de/en/articles/tags/larnaca", "/de/en/articles/tags/lisbon", "/de/en/articles/tags/ljubljana", "/de/en/articles/tags/london", "/de/en/articles/tags/los-angeles", "/de/en/articles/tags/madrid", "/de/en/articles/tags/malaga", "/de/en/articles/tags/mallorca", "/de/en/articles/tags/manchester", "/de/en/articles/tags/marseille", "/de/en/articles/tags/mexico-city", "/de/en/articles/tags/miami", "/de/en/articles/tags/milan", "/de/en/articles/tags/minneapolis-st-paul", "/de/en/articles/tags/mumbai", "/de/en/articles/tags/munich", "/de/en/articles/tags/music", "/de/en/articles/tags/my-world", "/de/en/articles/tags/nairobi", "/de/en/articles/tags/new-york", "/de/en/articles/tags/nice", "/de/en/articles/tags/olbia", "/de/en/articles/tags/on-the-scene", "/de/en/articles/tags/oslo", "/de/en/articles/tags/paris", "/de/en/articles/tags/perfect-day", "/de/en/articles/tags/picture-perfect", "/de/en/articles/tags/porto", "/de/en/articles/tags/prague", "/de/en/articles/tags/raleigh-durham", "/de/en/articles/tags/riga", "/de/en/articles/tags/rio-de-janeiro", "/de/en/articles/tags/riyadh", "/de/en/articles/tags/rome", "/de/en/articles/tags/san-diego", "/de/en/articles/tags/san-francisco", "/de/en/articles/tags/seattle", "/de/en/articles/tags/seoul", "/de/en/articles/tags/shanghai", "/de/en/articles/tags/shopping", "/de/en/articles/tags/singapore", "/de/en/articles/tags/sport", "/de/en/articles/tags/st-louis", "/de/en/articles/tags/stockholm", "/de/en/articles/tags/stop-over", "/de/en/articles/tags/tallinn", "/de/en/articles/tags/tbilisi", "/de/en/articles/tags/team-stories", "/de/en/articles/tags/tel-aviv", "/de/en/articles/tags/thessaloniki", "/de/en/articles/tags/tirana", "/de/en/articles/tags/tokyo", "/de/en/articles/tags/toronto", "/de/en/articles/tags/tunis", "/de/en/articles/tags/valletta", "/de/en/articles/tags/vancouver", "/de/en/articles/tags/venice", "/de/en/articles/tags/vienna", "/de/en/articles/tags/vilnius", "/de/en/articles/tags/washington-dc", "/de/en/articles/tags/what-i-learned", "/de/en/articles/tags/what-the-hack", "/de/en/articles/tags/yes-stories", "/de/en/articles/tags/zagreb", "/de/en/articles/tags/zurich", "/de/en/assistenzhunde", "/de/en/automatic-check-in", "/de/en/baggage", "/de/en/baggage-irregularities", "/de/en/besondere-befoerderungsbedingungen-bus", "/de/en/bid-upgrade", "/de/en/boarding", "/de/en/boeing787", "/de/en/book-and-manage/additional-services/get-your-guide", "/de/en/book-and-manage/additional-services/travel-insurances", "/de/en/book-and-manage/booking-services/manage-my-bookings", "/de/en/book-and-manage/cancellation-and-refund/refund/refund-form", "/de/en/book-and-manage/destination", "/de/en/book-and-manage/digital-self-services/airline-apps", "/de/en/book-and-manage/flights/air-baltic", "/de/en/book-and-manage/flights/ana", "/de/en/book-and-manage/flights/ana/faq", "/de/en/book-and-manage/flights/giftvoucher", "/de/en/book-and-manage/flights/helvetic", "/de/en/book-and-manage/flights/lufthansa-voucher", "/de/en/book-and-manage/flights/wetlease-hub", "/de/en/book-and-manage/passenger-receipt-90days/confirmation", "/de/en/book-and-manage/pax-receipt", "/de/en/book-and-manage/pax-receipt/invoices-different-countries", "/de/en/book-and-manage/rebook", "/de/en/book-and-manage/rebook/involuntary-rebooking", "/de/en/book-and-manage/rebook/voluntary-rebooking", "/de/en/book-and-manage/stopover", "/de/en/book-and-manage/stopover/bayerischer-hof", "/de/en/book-and-manage/stopover/neuschwanstein", "/de/en/book-and-manage/stopover/zugspitze", "/de/en/book-and-manage/trip-management", "/de/en/business-class", "/de/en/business-class-on-short-and-medium-haul", "/de/en/business-services", "/de/en/business-terms-and-conditions", "/de/en/cancellations-and-refunds", "/de/en/carry-on-baggage", "/de/en/cash-and-miles", "/de/en/check-in-baggage", "/de/en/check-in-deadlines", "/de/en/check-in-with-the-family", "/de/en/child-restraint-systems", "/de/en/children-on-board", "/de/en/childrens-menus-on-board", "/de/en/common", "/de/en/common/accessibility-statement", "/de/en/common/agb-extra-services-at-online-check-in", "/de/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation", "/de/en/common/baggage-conditions", "/de/en/common/compensation-voucher", "/de/en/common/imprint/lufthansa-insights-imprint", "/de/en/common/privacy-statement/privacy-statement-group", "/de/en/common/seatreservation-condtions/seat-reservations", "/de/en/cookie-policy", "/de/en/culinaryjourney", "/de/en/dangerous-dogs", "/de/en/data-collection-canada", "/de/en/data-collection-usa", "/de/en/data-protection-information", "/de/en/datenschutz", "/de/en/digital-baggage-services", "/de/en/digital-self-services", "/de/en/digital-travel-companion", "/de/en/discover-lufthansa/carbon-offsetting/climate-protection-projects", "/de/en/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge", "/de/en/discover-lufthansa/carbon-offsetting/faq-saf", "/de/en/discover-lufthansa/carbon-offsetting/saf", "/de/en/discover-lufthansa/flightreservation-priceguarantee", "/de/en/discover-lufthansa/lufthansa-fleet/351", "/de/en/discover-lufthansa/lufthansa-group-airlines/ita-airways", "/de/en/discover-lufthansa/miles-and-more-credit-card", "/de/en/discover-lufthansa/new-onboard-experience", "/de/en/discover-lufthansa/register-newsletter", "/de/en/discover-lufthansa/take-off", "/de/en/doctor-on-board", "/de/en/doctor-on-board-news", "/de/en/during-your-trip/food-and-beverages/onboard-delights/faq", "/de/en/during-your-trip/internet-overview", "/de/en/during-your-trip/lhg-wifi", "/de/en/economy-class", "/de/en/electronic-bag-tags", "/de/en/entryprocesses", "/de/en/europa-tarife-economy-class", "/de/en/europcar", "/de/en/event/dghm-2026", "/de/en/exclusive-charter", "/de/en/faq-data-security", "/de/en/faq-ejournals", "/de/en/faq-password-security", "/de/en/farealert/best-price-alert", "/de/en/feedback", "/de/en/feedback-past-flight", "/de/en/feedback/feedbackai", "/de/en/fia-valet-service", "/de/en/first-class", "/de/en/first-class-comfort", "/de/en/first-class-lounges", "/de/en/first-class-personal-assistant", "/de/en/first-class-terminal", "/de/en/first-class-valet-parking-service", "/de/en/fliegen-mit-baby", "/de/en/flight-disruptions", "/de/en/flight-search", "/de/en/flights", "/de/en/fly-more-sustainabl", "/de/en/flying-with-small-children", "/de/en/flynet", "/de/en/fmg-valet-parking-service", "/de/en/food-and-beverages", "/de/en/frankfurt-fair", "/de/en/free2move", "/de/en/freigepaeck-regeln", "/de/en/gefaehrliche-gegenstaende", "/de/en/general-conditions-currency-conversion", "/de/en/good-for-train", "/de/en/green-fare", "/de/en/group-travel", "/de/en/group-travel-and-charter", "/de/en/help-and-contact", "/de/en/hertz", "/de/en/homepage", "/de/en/hotel-offers", "/de/en/imprint", "/de/en/lh-rentalcar", "/de/en/local-page/south-africa-winter-promotion", "/de/en/lounge-companions", "/de/en/lounges", "/de/en/lufthansa-am-flughafen-frankfurt", "/de/en/lufthansa-at-berlin-airport", "/de/en/lufthansa-at-duesseldorf-airport", "/de/en/lufthansa-at-vienna-airport", "/de/en/lufthansa-at-zuerich-airport", "/de/en/lufthansa-aviation-group", "/de/en/lufthansa-business-class-on-long-haul-routes", "/de/en/lufthansa-city/culinaryjourney", "/de/en/lufthansa-city/menu-card", "/de/en/lufthansa-corporate-customers", "/de/en/lufthansa-ejournals", "/de/en/lufthansa-express", "/de/en/lufthansa-express-bus", "/de/en/lufthansa-express-rail", "/de/en/lufthansa-first-class-entertainment", "/de/en/lufthansa-first-class-fleet", "/de/en/lufthansa-group-star-alliance-and-partner-airlines", "/de/en/lufthansa-guide-service", "/de/en/lufthansa-terminal-muenchen", "/de/en/lufthansa-travel-classes", "/de/en/medikamenten-transport", "/de/en/meetings-and-events", "/de/en/meetings-and-events-delegates", "/de/en/meetings-and-events-organisers", "/de/en/menus-on-long-haul-flights", "/de/en/menus-travel-classes", "/de/en/miles-and-more", "/de/en/mobility-partner-program-healthcare", "/de/en/most-significant-route", "/de/en/munich-fair", "/de/en/my-bookings", "/de/en/my-logbook", "/de/en/onboard-delights", "/de/en/online-check-in", "/de/en/online-check-in-info", "/de/en/overview-flights", "/de/en/overview-manage", "/de/en/overview-special-request", "/de/en/overview-travel-information", "/de/en/partner", "/de/en/passenger-receipt-90", "/de/en/passenger-rights", "/de/en/passengers-using-wheelchairs", "/de/en/passengers-with-sensory-impairment", "/de/en/payment-options-at-the-airport", "/de/en/pre-check-in", "/de/en/premium-economy-class", "/de/en/prepare-for-your-trip/airport-information/services-at-the-airport/security-waiting-time", "/de/en/prepare-for-your-trip/baggage/baggage-conditions", "/de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg", "/de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay", "/de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage", "/de/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage", "/de/en/prepare-for-your-trip/baggage/electronic-devices-and-batteries", "/de/en/prepare-for-your-trip/baggage/sport-baggage/register-ammunition", "/de/en/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation", "/de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation", "/de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation", "/de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation", "/de/en/prepare-for-your-trip/current-travel-information", "/de/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system", "/de/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk", "/de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing", "/de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing", "/de/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment", "/de/en/prepare-for-your-trip/travel-classes/economy-basic", "/de/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass", "/de/en/prepare-for-your-trip/travelling-with-children/planning-with-kids", "/de/en/rail-and-fly", "/de/en/rail-fly-terms-and-conditions", "/de/en/rechnungsbeleg", "/de/en/refund", "/de/en/register-animal-cabin", "/de/en/schengen", "/de/en/seat-maps", "/de/en/secure-flight", "/de/en/security-check-time-slot", "/de/en/security-fast-lanes", "/de/en/sepa-terms-and-conditions", "/de/en/sepa-terms-and-conditions-b", "/de/en/services-at-frankfurt-airport", "/de/en/services-at-the-airport", "/de/en/services-munich-airport", "/de/en/services-on-board", "/de/en/shopping", "/de/en/sixt", "/de/en/special-meals", "/de/en/special-needs", "/de/en/sports-baggage", "/de/en/support/contact/contact-form-confirmation", "/de/en/support/contact/passenger-duty-united-kingdom", "/de/en/support/fast-compensation/compensation-flight-disruptions", "/de/en/support/feedback-and-contact-airlines", "/de/en/support/search/search-result", "/de/en/support/support", "/de/en/terms-and-conditions-lh", "/de/en/terms-of-service-group", "/de/en/terms-of-use", "/de/en/tiere-als-handgepaeck", "/de/en/tiere-als-uebergepaeck", "/de/en/timetable-and-flight-status", "/de/en/tips-senior-travellers", "/de/en/travel-agencies", "/de/en/travel-briefing", "/de/en/travel-expense-management", "/de/en/travel-id-terms-conditions", "/de/en/travelling-healthy", "/de/en/travelling-with-animals", "/de/en/travelling-with-children", "/de/en/travelling-with-special-requirements", "/de/en/traveltricks", "/de/en/uebergepaeck", "/de/en/unaccompanied-minors", "/de/en/unterhaltung-an-bord", "/de/en/upgrade-business-class-long-haul", "/de/en/upgrade-first-class", "/de/en/upgrade-info", "/de/en/upgrade-options", "/de/en/upgrade-premium-economy-class", "/de/en/upgrade-to-business-class", "/de/en/upgrade-to-premium-economy-class", "/de/en/upgrades-at-online-check-in", "/de/en/wheelchair-batteries", "/de/en/with-children-at-the-airport", "/gb/en/100-years", "/gb/en/100-years/cabin-design", "/gb/en/100-years/campaigns", "/gb/en/100-years/chronicle", "/gb/en/100-years/crane", "/gb/en/100-years/destinations", "/gb/en/100-years/fleet", "/gb/en/100-years/global-network", "/gb/en/100-years/history", "/gb/en/100-years/history/menu-on-board", "/gb/en/320", "/gb/en/32n", "/gb/en/359", "/gb/en/744", "/gb/en/accessible-travel", "/gb/en/add-sports-baggage", "/gb/en/additional-services", "/gb/en/addresses-worldwide", "/gb/en/admission-rules", "/gb/en/advance-seat-reservation", "/gb/en/advance-seat-reservations-terms-and-conditions", "/gb/en/advice-for-travellers-with-special-needs-to-and-from-the-usa", "/gb/en/affiliatemarketing", "/gb/en/airport-information", "/gb/en/all-check-in", "/gb/en/anmeldung-tiere-frachtraum", "/gb/en/arrival-services", "/gb/en/articles", "/gb/en/articles/authors", "/gb/en/articles/authors/alexandra-mikamo", "/gb/en/articles/authors/florian-schwebel", "/gb/en/articles/authors/florian-tomberg", "/gb/en/articles/authors/julia-buth", "/gb/en/articles/authors/till-weisbrod", "/gb/en/articles/explore-flying", "/gb/en/articles/explore-flying/7-people-who-shaped-lufthansa-history", "/gb/en/articles/explore-flying/a-girl-named-lufthansa", "/gb/en/articles/explore-flying/aircraft-lights-explained", "/gb/en/articles/explore-flying/allegris-business-class-dirk-nowitzki", "/gb/en/articles/explore-flying/allegris-exclusive-first-class-loungewear", "/gb/en/articles/explore-flying/allegris-first-class-innovations", "/gb/en/articles/explore-flying/allegris-first-class-reasons-for-allegris-first-class", "/gb/en/articles/explore-flying/allegris-fox", "/gb/en/articles/explore-flying/anniversary-super-crane-special", "/gb/en/articles/explore-flying/art-basel-miami-beach-stefan-marx", "/gb/en/articles/explore-flying/best-airport-restaurants", "/gb/en/articles/explore-flying/business-class-culinary-journey-with-johann-lafer", "/gb/en/articles/explore-flying/celebrating-20-years-of-excellence", "/gb/en/articles/explore-flying/cockpit-collaboration", "/gb/en/articles/explore-flying/come-fly-with-me-lufthansa-allegris", "/gb/en/articles/explore-flying/culinary-craftsmanship-smoked-fish-for-first-and-business-class", "/gb/en/articles/explore-flying/essentials-future-of-flying", "/gb/en/articles/explore-flying/essentials-lufthansa-facts", "/gb/en/articles/explore-flying/essentials-surprising-lufthansa-numbers", "/gb/en/articles/explore-flying/everyone-wants-to-fly-with-the-cranes", "/gb/en/articles/explore-flying/female-pilots", "/gb/en/articles/explore-flying/first-class-culinary-inspiration-journey-tokyo", "/gb/en/articles/explore-flying/first-class-reimagined", "/gb/en/articles/explore-flying/first-class-terminal-architecture", "/gb/en/articles/explore-flying/flying-high-christoph-quarch", "/gb/en/articles/explore-flying/flying-high-meta-city", "/gb/en/articles/explore-flying/future-of-flying", "/gb/en/articles/explore-flying/help-alliance-engagement-in-tanzania", "/gb/en/articles/explore-flying/help-alliance-taking-off-for-a-good-cause", "/gb/en/articles/explore-flying/hon-circle-event", "/gb/en/articles/explore-flying/how-to-become-a-flight-attendant", "/gb/en/articles/explore-flying/how-to-become-a-pilot", "/gb/en/articles/explore-flying/inflight-entertainment-vr-experience", "/gb/en/articles/explore-flying/inside-lufthansa-lh-allegris", "/gb/en/articles/explore-flying/interview-livery-iconic-moments", "/gb/en/articles/explore-flying/livery-iconic-moments", "/gb/en/articles/explore-flying/lufthansa-allegris-first-class", "/gb/en/articles/explore-flying/lufthansa-allegris-welcome-to-the-future-of-aviation", "/gb/en/articles/explore-flying/lufthansa-classics", "/gb/en/articles/explore-flying/lufthansa-fleet-our-aircrafts", "/gb/en/articles/explore-flying/lufthansa-group-wifi", "/gb/en/articles/explore-flying/lufthansa-help-alliance-i-fly-for-campaign", "/gb/en/articles/explore-flying/lufthansa-in-the-spotlight", "/gb/en/articles/explore-flying/lufthansa-innovation-hub-future-of-flying", "/gb/en/articles/explore-flying/lufthansa-insights-art", "/gb/en/articles/explore-flying/lufthansa-lounges", "/gb/en/articles/explore-flying/lufthansa-orchestra-channel-aid-live-in-concert", "/gb/en/articles/explore-flying/lufthansa-uniforms-history", "/gb/en/articles/explore-flying/meet-the-makers-innovations-for-individual-well-being", "/gb/en/articles/explore-flying/meet-the-makers-lufthansa-allegris-business-class", "/gb/en/articles/explore-flying/meet-the-makers-lufthansa-allegris-first-class", "/gb/en/articles/explore-flying/meet-the-makers-the-manufactures-of-the-first-class-suites", "/gb/en/articles/explore-flying/new-lufthansa-lounge-newark-interview", "/gb/en/articles/explore-flying/oktoberfest-traditional-bavarian-attire", "/gb/en/articles/explore-flying/pride-diversifly-queer-employee-network-lufthansa-group", "/gb/en/articles/explore-flying/queer-travel-safer-trips", "/gb/en/articles/explore-flying/responsibility-lufthansa", "/gb/en/articles/explore-flying/things-you-always-wanted-to-know-about-flying", "/gb/en/articles/explore-flying/time-travel-ki-aviation", "/gb/en/articles/explore-flying/travel-trends", "/gb/en/articles/explore-flying/vacation-packing-list", "/gb/en/articles/explore-flying/welcome-to-my-world-alexandra-maria-lara", "/gb/en/articles/explore-flying/welcome-to-my-world-bridget-finn", "/gb/en/articles/explore-flying/welcome-to-my-world-elyas-mbarek", "/gb/en/articles/explore-flying/welcome-to-my-world-emilia-schuele", "/gb/en/articles/explore-flying/welcome-to-my-world-karolina-kurkova", "/gb/en/articles/explore-flying/welcome-to-my-world-karoline-herfurth", "/gb/en/articles/explore-flying/welcome-to-my-world-lexie-alford", "/gb/en/articles/explore-flying/what-does-luxury-mean-today", "/gb/en/articles/explore-flying/what-the-hack-anti-jetlag-tips", "/gb/en/articles/explore-flying/what-the-hack-best-seats", "/gb/en/articles/explore-flying/what-the-hack-travel-gadgets", "/gb/en/articles/explore-flying/what-the-hack-travel-hacks", "/gb/en/articles/explore-flying/what-the-hack-travel-with-kids", "/gb/en/articles/explore-flying/what-the-hack-waiting-time-at-the-airport", "/gb/en/articles/explore-flying/what-the-hack-what-is-the-etiquette-of-traveling", "/gb/en/articles/explore-flying/yes-stories-the-fascination-of-skydiving", "/gb/en/articles/explore-flying/yes-stories-the-two-worlds-of-kaye-ree", "/gb/en/articles/explore-flying/yes-stories-thorsten-buss", "/gb/en/articles/explore-flying/yes-stories-tom-rees", "/gb/en/articles/explore-the-world", "/gb/en/articles/explore-the-world/a-perfect-day-amsterdam-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-art-basel-miami-beach-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-athens-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-bangkok-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-beijing-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-bengaluru-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-boston-on-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-budapest-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-buenos-aires-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-cape-town-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-charlotte-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-chicago-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-copenhagen-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-dublin-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-frankfurt-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-hamburg", "/gb/en/articles/explore-the-world/a-perfect-day-helsinki-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-hong-kong-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-houston-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-istanbul-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-johannesburg-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-la-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-lisbon-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-london-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-madrid-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-malaga-on-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-mallorca-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-mexico-city-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-miami-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-milan-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-mumbai-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-munich-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-ny-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-oslo-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-paris-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-porto-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-prague-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-rio-de-janeiro-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-rome-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-san-francisco-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-seoul-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-shanghai-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-singapore-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-stockholm-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-tokyo-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-toronto-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-vienna-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-washington-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-zurich-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-nairobi-city-in-one-day", "/gb/en/articles/explore-the-world/art-basel-miami-beach-fun-facts", "/gb/en/articles/explore-the-world/be-picky-amsterdam-insider-tips", "/gb/en/articles/explore-the-world/be-picky-athens-insider-tips", "/gb/en/articles/explore-the-world/be-picky-bangkok-insider-tips", "/gb/en/articles/explore-the-world/be-picky-barcelona-insider-tips", "/gb/en/articles/explore-the-world/be-picky-bengaluru", "/gb/en/articles/explore-the-world/be-picky-budapest-insider-tips", "/gb/en/articles/explore-the-world/be-picky-buenos-aires-insider-tips", "/gb/en/articles/explore-the-world/be-picky-cape-town-insider-tips", "/gb/en/articles/explore-the-world/be-picky-charlotte-insider-tips", "/gb/en/articles/explore-the-world/be-picky-chicago-insider-tips", "/gb/en/articles/explore-the-world/be-picky-copenhagen", "/gb/en/articles/explore-the-world/be-picky-dublin-insider-tips", "/gb/en/articles/explore-the-world/be-picky-frankfurt-insider-tips", "/gb/en/articles/explore-the-world/be-picky-helsinkis-insider-tips", "/gb/en/articles/explore-the-world/be-picky-hong-kong-insider-tips", "/gb/en/articles/explore-the-world/be-picky-istanbul-insider-tips", "/gb/en/articles/explore-the-world/be-picky-johannesburg-insider-tipps", "/gb/en/articles/explore-the-world/be-picky-la-insider-tips", "/gb/en/articles/explore-the-world/be-picky-lisbon", "/gb/en/articles/explore-the-world/be-picky-little-italy-in-vancouver", "/gb/en/articles/explore-the-world/be-picky-london-insider-tips", "/gb/en/articles/explore-the-world/be-picky-madrid", "/gb/en/articles/explore-the-world/be-picky-mallorca-insider-tips", "/gb/en/articles/explore-the-world/be-picky-mexico-city-insider-tips", "/gb/en/articles/explore-the-world/be-picky-miami-insider-tips", "/gb/en/articles/explore-the-world/be-picky-milan-insider-tips", "/gb/en/articles/explore-the-world/be-picky-mumbai-insider-tips", "/gb/en/articles/explore-the-world/be-picky-munich-insider-tip-anika-landsteiner", "/gb/en/articles/explore-the-world/be-picky-ny-insider-tips", "/gb/en/articles/explore-the-world/be-picky-oslo-insider-tips", "/gb/en/articles/explore-the-world/be-picky-paris-insider-tips", "/gb/en/articles/explore-the-world/be-picky-prague-insider-tips", "/gb/en/articles/explore-the-world/be-picky-rio-de-janeiro-insider-tips", "/gb/en/articles/explore-the-world/be-picky-rome-insider-tips", "/gb/en/articles/explore-the-world/be-picky-san-francisco-insider-tips", "/gb/en/articles/explore-the-world/be-picky-seoul-insider-tips", "/gb/en/articles/explore-the-world/be-picky-shanghai-insider-tips", "/gb/en/articles/explore-the-world/be-picky-singapore-insider-tips", "/gb/en/articles/explore-the-world/be-picky-stockholm", "/gb/en/articles/explore-the-world/be-picky-tokyo-insider-tips", "/gb/en/articles/explore-the-world/be-picky-toronto-insider-tips", "/gb/en/articles/explore-the-world/be-picky-vienna-insider-tips", "/gb/en/articles/explore-the-world/be-picky-washington-insider-tips", "/gb/en/articles/explore-the-world/be-picky-zurich-insider-tips", "/gb/en/articles/explore-the-world/copenhagen-what-i-have-learned", "/gb/en/articles/explore-the-world/eat-see-do-algiers", "/gb/en/articles/explore-the-world/eat-see-do-almaty", "/gb/en/articles/explore-the-world/eat-see-do-amman", "/gb/en/articles/explore-the-world/eat-see-do-atlanta", "/gb/en/articles/explore-the-world/eat-see-do-beijing", "/gb/en/articles/explore-the-world/eat-see-do-berlin", "/gb/en/articles/explore-the-world/eat-see-do-bilbao", "/gb/en/articles/explore-the-world/eat-see-do-bogota", "/gb/en/articles/explore-the-world/eat-see-do-boston", "/gb/en/articles/explore-the-world/eat-see-do-cagliari", "/gb/en/articles/explore-the-world/eat-see-do-cairo", "/gb/en/articles/explore-the-world/eat-see-do-casablanca", "/gb/en/articles/explore-the-world/eat-see-do-catania", "/gb/en/articles/explore-the-world/eat-see-do-chennai", "/gb/en/articles/explore-the-world/eat-see-do-dallas", "/gb/en/articles/explore-the-world/eat-see-do-denver", "/gb/en/articles/explore-the-world/eat-see-do-detroit", "/gb/en/articles/explore-the-world/eat-see-do-dubai", "/gb/en/articles/explore-the-world/eat-see-do-edinburgh", "/gb/en/articles/explore-the-world/eat-see-do-faro", "/gb/en/articles/explore-the-world/eat-see-do-gothenburg", "/gb/en/articles/explore-the-world/eat-see-do-hamburg", "/gb/en/articles/explore-the-world/eat-see-do-houston", "/gb/en/articles/explore-the-world/eat-see-do-hyderabad", "/gb/en/articles/explore-the-world/eat-see-do-kuala-lumpur", "/gb/en/articles/explore-the-world/eat-see-do-larnaca", "/gb/en/articles/explore-the-world/eat-see-do-ljubljana", "/gb/en/articles/explore-the-world/eat-see-do-malaga", "/gb/en/articles/explore-the-world/eat-see-do-manchester", "/gb/en/articles/explore-the-world/eat-see-do-marseille", "/gb/en/articles/explore-the-world/eat-see-do-minneapolis-st-paul", "/gb/en/articles/explore-the-world/eat-see-do-nairobi", "/gb/en/articles/explore-the-world/eat-see-do-nice", "/gb/en/articles/explore-the-world/eat-see-do-olbia", "/gb/en/articles/explore-the-world/eat-see-do-porto", "/gb/en/articles/explore-the-world/eat-see-do-raleigh-durham", "/gb/en/articles/explore-the-world/eat-see-do-riga", "/gb/en/articles/explore-the-world/eat-see-do-riyadh", "/gb/en/articles/explore-the-world/eat-see-do-san-diego", "/gb/en/articles/explore-the-world/eat-see-do-seattle", "/gb/en/articles/explore-the-world/eat-see-do-st-louis", "/gb/en/articles/explore-the-world/eat-see-do-tallinn", "/gb/en/articles/explore-the-world/eat-see-do-tbilisi", "/gb/en/articles/explore-the-world/eat-see-do-tel-aviv", "/gb/en/articles/explore-the-world/eat-see-do-thessaloniki", "/gb/en/articles/explore-the-world/eat-see-do-tirana", "/gb/en/articles/explore-the-world/eat-see-do-tunis", "/gb/en/articles/explore-the-world/eat-see-do-valletta", "/gb/en/articles/explore-the-world/eat-see-do-venice", "/gb/en/articles/explore-the-world/eat-see-do-vilnius", "/gb/en/articles/explore-the-world/eat-see-do-zagreb", "/gb/en/articles/explore-the-world/essentials-amsterdam-facts", "/gb/en/articles/explore-the-world/essentials-athens-facts", "/gb/en/articles/explore-the-world/essentials-bangkok-facts", "/gb/en/articles/explore-the-world/essentials-barcelona-facts", "/gb/en/articles/explore-the-world/essentials-beijing-facts", "/gb/en/articles/explore-the-world/essentials-bengaluru-facts", "/gb/en/articles/explore-the-world/essentials-boston-facts", "/gb/en/articles/explore-the-world/essentials-budapest-facts", "/gb/en/articles/explore-the-world/essentials-buenos-aires-facts", "/gb/en/articles/explore-the-world/essentials-cape-town-facts", "/gb/en/articles/explore-the-world/essentials-charlotte-facts", "/gb/en/articles/explore-the-world/essentials-chicago-facts", "/gb/en/articles/explore-the-world/essentials-copenhagen-facts", "/gb/en/articles/explore-the-world/essentials-dublin-facts", "/gb/en/articles/explore-the-world/essentials-facts-vancouver", "/gb/en/articles/explore-the-world/essentials-frankfurt-facts", "/gb/en/articles/explore-the-world/essentials-helsinki-facts", "/gb/en/articles/explore-the-world/essentials-hong-kong-facts", "/gb/en/articles/explore-the-world/essentials-istanbul-facts", "/gb/en/articles/explore-the-world/essentials-johannesburg-facts", "/gb/en/articles/explore-the-world/essentials-la-facts", "/gb/en/articles/explore-the-world/essentials-lisbon-facts", "/gb/en/articles/explore-the-world/essentials-london-facts", "/gb/en/articles/explore-the-world/essentials-madrid-facts", "/gb/en/articles/explore-the-world/essentials-mallorca-facts", "/gb/en/articles/explore-the-world/essentials-mexico-city-facts", "/gb/en/articles/explore-the-world/essentials-miami-facts", "/gb/en/articles/explore-the-world/essentials-milan-facts", "/gb/en/articles/explore-the-world/essentials-mumbai-facts", "/gb/en/articles/explore-the-world/essentials-munich-facts", "/gb/en/articles/explore-the-world/essentials-ny-facts", "/gb/en/articles/explore-the-world/essentials-oslo-facts", "/gb/en/articles/explore-the-world/essentials-paris-facts", "/gb/en/articles/explore-the-world/essentials-prague-facts", "/gb/en/articles/explore-the-world/essentials-rio-de-janeiro-facts", "/gb/en/articles/explore-the-world/essentials-rome-facts", "/gb/en/articles/explore-the-world/essentials-san-francisco-facts", "/gb/en/articles/explore-the-world/essentials-seoul-facts", "/gb/en/articles/explore-the-world/essentials-shanghai-facts", "/gb/en/articles/explore-the-world/essentials-singapore-facts", "/gb/en/articles/explore-the-world/essentials-stockholm-facts", "/gb/en/articles/explore-the-world/essentials-tokyo-facts", "/gb/en/articles/explore-the-world/essentials-toronto-facts", "/gb/en/articles/explore-the-world/essentials-vienna-facts", "/gb/en/articles/explore-the-world/essentials-washington-facts", "/gb/en/articles/explore-the-world/essentials-zurich-facts", "/gb/en/articles/explore-the-world/experience-art-live", "/gb/en/articles/explore-the-world/experience-nature", "/gb/en/articles/explore-the-world/in-my-hood-apgujeong-seoul", "/gb/en/articles/explore-the-world/in-my-hood-arroios-lissabon", "/gb/en/articles/explore-the-world/in-my-hood-back-bay-boston", "/gb/en/articles/explore-the-world/in-my-hood-bandra-mumbai", "/gb/en/articles/explore-the-world/in-my-hood-chiswick-london", "/gb/en/articles/explore-the-world/in-my-hood-citta-studi-milan", "/gb/en/articles/explore-the-world/in-my-hood-city-centre-cape-town", "/gb/en/articles/explore-the-world/in-my-hood-comercial-drive-vancouver", "/gb/en/articles/explore-the-world/in-my-hood-coyoacan-mexico-city", "/gb/en/articles/explore-the-world/in-my-hood-creative-quarter-dublin", "/gb/en/articles/explore-the-world/in-my-hood-district-helsinki", "/gb/en/articles/explore-the-world/in-my-hood-district-houston", "/gb/en/articles/explore-the-world/in-my-hood-district-malaga", "/gb/en/articles/explore-the-world/in-my-hood-district-nairobi", "/gb/en/articles/explore-the-world/in-my-hood-district-porto", "/gb/en/articles/explore-the-world/in-my-hood-district-viii-budapest", "/gb/en/articles/explore-the-world/in-my-hood-district-zurich", "/gb/en/articles/explore-the-world/in-my-hood-gamlebyen-oslo", "/gb/en/articles/explore-the-world/in-my-hood-geylang-singapur", "/gb/en/articles/explore-the-world/in-my-hood-gulou-beijing", "/gb/en/articles/explore-the-world/in-my-hood-hollywood-road-hong-kong", "/gb/en/articles/explore-the-world/in-my-hood-indiranagar-bengaluru", "/gb/en/articles/explore-the-world/in-my-hood-ipanema-rio-de-janeiro", "/gb/en/articles/explore-the-world/in-my-hood-japantown-san-francisco", "/gb/en/articles/explore-the-world/in-my-hood-kadikoey-istanbul", "/gb/en/articles/explore-the-world/in-my-hood-kampung-attap-kuala-lumpur", "/gb/en/articles/explore-the-world/in-my-hood-kreuzberg-berlin", "/gb/en/articles/explore-the-world/in-my-hood-larchmont-la", "/gb/en/articles/explore-the-world/in-my-hood-le-sentier-paris", "/gb/en/articles/explore-the-world/in-my-hood-mallorca", "/gb/en/articles/explore-the-world/in-my-hood-metaxourgeio-athens", "/gb/en/articles/explore-the-world/in-my-hood-mount-pleasant-washington", "/gb/en/articles/explore-the-world/in-my-hood-munich-sendling", "/gb/en/articles/explore-the-world/in-my-hood-nice-ouest", "/gb/en/articles/explore-the-world/in-my-hood-noord-amsterdam", "/gb/en/articles/explore-the-world/in-my-hood-ny-brooklyn", "/gb/en/articles/explore-the-world/in-my-hood-osterbro-kopenhagen", "/gb/en/articles/explore-the-world/in-my-hood-palermo-buenos-aires", "/gb/en/articles/explore-the-world/in-my-hood-plaza-midwood-charlotte", "/gb/en/articles/explore-the-world/in-my-hood-poblenou-barcelona", "/gb/en/articles/explore-the-world/in-my-hood-rome-pigneto-rome", "/gb/en/articles/explore-the-world/in-my-hood-rosebank-johannesburg", "/gb/en/articles/explore-the-world/in-my-hood-sachsenhausen-frankfurt", "/gb/en/articles/explore-the-world/in-my-hood-salamanca-madrid", "/gb/en/articles/explore-the-world/in-my-hood-schanzenviertel-hamburg", "/gb/en/articles/explore-the-world/in-my-hood-schaumburg-chicago", "/gb/en/articles/explore-the-world/in-my-hood-seventh-district-vienna", "/gb/en/articles/explore-the-world/in-my-hood-shinjuku-tokyo", "/gb/en/articles/explore-the-world/in-my-hood-song-wat-road-bangkok", "/gb/en/articles/explore-the-world/in-my-hood-south-beach-miami", "/gb/en/articles/explore-the-world/in-my-hood-the-bund-shanghai", "/gb/en/articles/explore-the-world/in-my-hood-toronto-summerhill", "/gb/en/articles/explore-the-world/in-my-hood-vasastaden-stockholm", "/gb/en/articles/explore-the-world/in-my-hood-vrsovice-prague", "/gb/en/articles/explore-the-world/in-my-hood-west-seattle-seattle", "/gb/en/articles/explore-the-world/know-before-you-go-algiers", "/gb/en/articles/explore-the-world/know-before-you-go-almaty", "/gb/en/articles/explore-the-world/know-before-you-go-amman", "/gb/en/articles/explore-the-world/know-before-you-go-atlanta", "/gb/en/articles/explore-the-world/know-before-you-go-beijing", "/gb/en/articles/explore-the-world/know-before-you-go-berlin", "/gb/en/articles/explore-the-world/know-before-you-go-bilbao", "/gb/en/articles/explore-the-world/know-before-you-go-bogota", "/gb/en/articles/explore-the-world/know-before-you-go-boston", "/gb/en/articles/explore-the-world/know-before-you-go-cagliari", "/gb/en/articles/explore-the-world/know-before-you-go-cairo", "/gb/en/articles/explore-the-world/know-before-you-go-casablanca", "/gb/en/articles/explore-the-world/know-before-you-go-catania", "/gb/en/articles/explore-the-world/know-before-you-go-chennai", "/gb/en/articles/explore-the-world/know-before-you-go-dallas", "/gb/en/articles/explore-the-world/know-before-you-go-denver", "/gb/en/articles/explore-the-world/know-before-you-go-detroit", "/gb/en/articles/explore-the-world/know-before-you-go-dubai", "/gb/en/articles/explore-the-world/know-before-you-go-edinburgh", "/gb/en/articles/explore-the-world/know-before-you-go-faro", "/gb/en/articles/explore-the-world/know-before-you-go-gothenburg", "/gb/en/articles/explore-the-world/know-before-you-go-hamburg", "/gb/en/articles/explore-the-world/know-before-you-go-houston", "/gb/en/articles/explore-the-world/know-before-you-go-hyderabad", "/gb/en/articles/explore-the-world/know-before-you-go-kuala-lumpur", "/gb/en/articles/explore-the-world/know-before-you-go-larnaca", "/gb/en/articles/explore-the-world/know-before-you-go-ljubljana", "/gb/en/articles/explore-the-world/know-before-you-go-malaga", "/gb/en/articles/explore-the-world/know-before-you-go-manchester", "/gb/en/articles/explore-the-world/know-before-you-go-marseille", "/gb/en/articles/explore-the-world/know-before-you-go-minneapolis-st-paul", "/gb/en/articles/explore-the-world/know-before-you-go-nairobi", "/gb/en/articles/explore-the-world/know-before-you-go-nice", "/gb/en/articles/explore-the-world/know-before-you-go-olbia", "/gb/en/articles/explore-the-world/know-before-you-go-porto", "/gb/en/articles/explore-the-world/know-before-you-go-raleigh-durham", "/gb/en/articles/explore-the-world/know-before-you-go-riga", "/gb/en/articles/explore-the-world/know-before-you-go-riyadh", "/gb/en/articles/explore-the-world/know-before-you-go-san-diego", "/gb/en/articles/explore-the-world/know-before-you-go-seattle", "/gb/en/articles/explore-the-world/know-before-you-go-st-louis", "/gb/en/articles/explore-the-world/know-before-you-go-tallinn", "/gb/en/articles/explore-the-world/know-before-you-go-tbilisi", "/gb/en/articles/explore-the-world/know-before-you-go-tel-aviv", "/gb/en/articles/explore-the-world/know-before-you-go-thessaloniki", "/gb/en/articles/explore-the-world/know-before-you-go-tirana", "/gb/en/articles/explore-the-world/know-before-you-go-tunis", "/gb/en/articles/explore-the-world/know-before-you-go-valletta", "/gb/en/articles/explore-the-world/know-before-you-go-venice", "/gb/en/articles/explore-the-world/know-before-you-go-vilnius", "/gb/en/articles/explore-the-world/know-before-you-go-zagreb", "/gb/en/articles/explore-the-world/my-experiences-in-vancouver", "/gb/en/articles/explore-the-world/new-shopping", "/gb/en/articles/explore-the-world/next-level-gaming", "/gb/en/articles/explore-the-world/on-the-scene-architecture-copenhagen", "/gb/en/articles/explore-the-world/on-the-scene-art-and-pubs-dublin", "/gb/en/articles/explore-the-world/on-the-scene-art-johannesburg", "/gb/en/articles/explore-the-world/on-the-scene-bar-basso-milan", "/gb/en/articles/explore-the-world/on-the-scene-bookstores-buenos-aires", "/gb/en/articles/explore-the-world/on-the-scene-braamfontein-johannesburg", "/gb/en/articles/explore-the-world/on-the-scene-brunch-restaurants-la", "/gb/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich", "/gb/en/articles/explore-the-world/on-the-scene-chicago-beer", "/gb/en/articles/explore-the-world/on-the-scene-creative-architecture-prague", "/gb/en/articles/explore-the-world/on-the-scene-culinary-trip-washington", "/gb/en/articles/explore-the-world/on-the-scene-fashion-and-culture-budapest", "/gb/en/articles/explore-the-world/on-the-scene-food-mumbai", "/gb/en/articles/explore-the-world/on-the-scene-food-trends-amsterdam", "/gb/en/articles/explore-the-world/on-the-scene-food-trends-bengaluru", "/gb/en/articles/explore-the-world/on-the-scene-food-trends-istanbul", "/gb/en/articles/explore-the-world/on-the-scene-hidden-gems-seoul", "/gb/en/articles/explore-the-world/on-the-scene-humor-vienna", "/gb/en/articles/explore-the-world/on-the-scene-listening-bars-toronto", "/gb/en/articles/explore-the-world/on-the-scene-lunch-mexico-city", "/gb/en/articles/explore-the-world/on-the-scene-mallorca", "/gb/en/articles/explore-the-world/on-the-scene-music-cape-town", "/gb/en/articles/explore-the-world/on-the-scene-samba-rio-de-janeiro", "/gb/en/articles/explore-the-world/on-the-scene-san-francisco-fashion", "/gb/en/articles/explore-the-world/on-the-scene-shanghai-art-scene", "/gb/en/articles/explore-the-world/on-the-scene-shopping-barcelona", "/gb/en/articles/explore-the-world/on-the-scene-shopping-lisbon", "/gb/en/articles/explore-the-world/on-the-scene-shopping-tokyo", "/gb/en/articles/explore-the-world/on-the-scene-sports-miami", "/gb/en/articles/explore-the-world/on-the-scene-stockholm", "/gb/en/articles/explore-the-world/on-the-scene-street-art-charlotte", "/gb/en/articles/explore-the-world/on-the-scene-street-art-london", "/gb/en/articles/explore-the-world/on-the-scene-streetart-athens", "/gb/en/articles/explore-the-world/on-the-scene-super-bros-frankfurt", "/gb/en/articles/explore-the-world/on-the-scene-supper-clubs-ny", "/gb/en/articles/explore-the-world/on-the-scene-techno-sound-rome", "/gb/en/articles/explore-the-world/on-the-scene-tips-oslo", "/gb/en/articles/explore-the-world/on-the-scene-topic-bangkok", "/gb/en/articles/explore-the-world/on-the-scene-topic-helsinki", "/gb/en/articles/explore-the-world/on-the-scene-topic-zurich", "/gb/en/articles/explore-the-world/on-the-scene-trends-madrid", "/gb/en/articles/explore-the-world/on-the-scene-urban-farming-singapore", "/gb/en/articles/explore-the-world/on-the-scene-vancouver-donuts", "/gb/en/articles/explore-the-world/on-the-scene-wellness-cuisine-hong-kong", "/gb/en/articles/explore-the-world/perfect-day-nice-cote-dazur", "/gb/en/articles/explore-the-world/perfect-day-seattle", "/gb/en/articles/explore-the-world/perfect-day-tips-vancouver", "/gb/en/articles/explore-the-world/picture-perfect-austin", "/gb/en/articles/explore-the-world/picture-perfect-beijing", "/gb/en/articles/explore-the-world/picture-perfect-bogota", "/gb/en/articles/explore-the-world/picture-perfect-boston", "/gb/en/articles/explore-the-world/picture-perfect-cairo", "/gb/en/articles/explore-the-world/picture-perfect-elevator-boys", "/gb/en/articles/explore-the-world/picture-perfect-hyderabad", "/gb/en/articles/explore-the-world/picture-perfect-la", "/gb/en/articles/explore-the-world/picture-perfect-ny", "/gb/en/articles/explore-the-world/picture-perfect-riad", "/gb/en/articles/explore-the-world/picture-perfect-singapore", "/gb/en/articles/explore-the-world/sao-paulo-sights", "/gb/en/articles/explore-the-world/stop-over-bangkok", "/gb/en/articles/explore-the-world/stop-over-beijing", "/gb/en/articles/explore-the-world/stop-over-boston", "/gb/en/articles/explore-the-world/stop-over-buenos-aires", "/gb/en/articles/explore-the-world/stop-over-charlotte", "/gb/en/articles/explore-the-world/stop-over-hong-kong", "/gb/en/articles/explore-the-world/stop-over-johannesburg", "/gb/en/articles/explore-the-world/stop-over-los-angeles", "/gb/en/articles/explore-the-world/stop-over-mexico-city", "/gb/en/articles/explore-the-world/stop-over-seoul", "/gb/en/articles/explore-the-world/stop-over-singapore", "/gb/en/articles/explore-the-world/stop-over-tokyo", "/gb/en/articles/explore-the-world/stop-over-washington", "/gb/en/articles/explore-the-world/team-sport", "/gb/en/articles/explore-the-world/what-i-learned-living-in-amsterdam", "/gb/en/articles/explore-the-world/what-i-learned-living-in-athens", "/gb/en/articles/explore-the-world/what-i-learned-living-in-bangkok", "/gb/en/articles/explore-the-world/what-i-learned-living-in-barcelona", "/gb/en/articles/explore-the-world/what-i-learned-living-in-bengaluru", "/gb/en/articles/explore-the-world/what-i-learned-living-in-boston", "/gb/en/articles/explore-the-world/what-i-learned-living-in-budapest", "/gb/en/articles/explore-the-world/what-i-learned-living-in-buenos-aires", "/gb/en/articles/explore-the-world/what-i-learned-living-in-cape-town", "/gb/en/articles/explore-the-world/what-i-learned-living-in-charlotte", "/gb/en/articles/explore-the-world/what-i-learned-living-in-chicago", "/gb/en/articles/explore-the-world/what-i-learned-living-in-dublin", "/gb/en/articles/explore-the-world/what-i-learned-living-in-frankfurt", "/gb/en/articles/explore-the-world/what-i-learned-living-in-helsinki", "/gb/en/articles/explore-the-world/what-i-learned-living-in-hong-kong", "/gb/en/articles/explore-the-world/what-i-learned-living-in-istanbul", "/gb/en/articles/explore-the-world/what-i-learned-living-in-johannesburg", "/gb/en/articles/explore-the-world/what-i-learned-living-in-la", "/gb/en/articles/explore-the-world/what-i-learned-living-in-lisbon", "/gb/en/articles/explore-the-world/what-i-learned-living-in-london", "/gb/en/articles/explore-the-world/what-i-learned-living-in-madrid", "/gb/en/articles/explore-the-world/what-i-learned-living-in-mallorca", "/gb/en/articles/explore-the-world/what-i-learned-living-in-mexico-city", "/gb/en/articles/explore-the-world/what-i-learned-living-in-miami", "/gb/en/articles/explore-the-world/what-i-learned-living-in-milan", "/gb/en/articles/explore-the-world/what-i-learned-living-in-mumbai", "/gb/en/articles/explore-the-world/what-i-learned-living-in-munich", "/gb/en/articles/explore-the-world/what-i-learned-living-in-ny", "/gb/en/articles/explore-the-world/what-i-learned-living-in-oslo", "/gb/en/articles/explore-the-world/what-i-learned-living-in-paris", "/gb/en/articles/explore-the-world/what-i-learned-living-in-prague", "/gb/en/articles/explore-the-world/what-i-learned-living-in-rio-de-janeiro", "/gb/en/articles/explore-the-world/what-i-learned-living-in-rome", "/gb/en/articles/explore-the-world/what-i-learned-living-in-san-francisco", "/gb/en/articles/explore-the-world/what-i-learned-living-in-seoul", "/gb/en/articles/explore-the-world/what-i-learned-living-in-shanghai", "/gb/en/articles/explore-the-world/what-i-learned-living-in-singapore", "/gb/en/articles/explore-the-world/what-i-learned-living-in-stockholm", "/gb/en/articles/explore-the-world/what-i-learned-living-in-tokyo", "/gb/en/articles/explore-the-world/what-i-learned-living-in-toronto", "/gb/en/articles/explore-the-world/what-i-learned-living-in-vienna", "/gb/en/articles/explore-the-world/what-i-learned-living-in-washington", "/gb/en/articles/explore-the-world/what-i-learned-living-in-zurich", "/gb/en/articles/highlights", "/gb/en/articles/highlights-european-championship", "/gb/en/articles/highlights-european-championship/european-championship-2024-great-hope", "/gb/en/articles/highlights-european-championship/european-championship-2024-locations", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-andrich", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-anton", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-baumann", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-beier", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-fuellkrug", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-kimmich", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-kroos", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-mittelstaedt", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-raum", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-tah", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-ter-stegen", "/gb/en/articles/highlights-european-championship/european-championship-2024-player-videos-undav", "/gb/en/articles/highlights-european-championship/european-championship-2024-quiz", "/gb/en/articles/highlights-european-championship/european-championship-2024-thank-you", "/gb/en/articles/highlights-european-championship/hungary-with-pride-and-passion", "/gb/en/articles/highlights-european-championship/lose-like-the-germans", "/gb/en/articles/highlights-european-championship/meet-the-germans", "/gb/en/articles/highlights-european-championship/scotland-with-heart-and-energy", "/gb/en/articles/highlights-european-championship/swiss-passion-meets-precision", "/gb/en/articles/highlights/all-it-takes-is-a-yes", "/gb/en/articles/highlights/allegris-a-new-flight-experience", "/gb/en/articles/highlights/allegris-business-class-shanghai", "/gb/en/articles/highlights/allegris-business-san-diego", "/gb/en/articles/highlights/allegris-destinations", "/gb/en/articles/highlights/allegris-dirk-nowitzki", "/gb/en/articles/highlights/allegris-essentials", "/gb/en/articles/highlights/allegris-experiences", "/gb/en/articles/highlights/allegris-new-york", "/gb/en/articles/highlights/allegris-premium-economy-san-diego", "/gb/en/articles/highlights/allegris-travel-hacks", "/gb/en/articles/highlights/allegris-typologies", "/gb/en/articles/highlights/art-and-travel-delhi-berlin", "/gb/en/articles/highlights/austin-texas-city-of-live-music", "/gb/en/articles/highlights/chisinau-winter", "/gb/en/articles/highlights/dfb-partnership-diversity-success", "/gb/en/articles/highlights/exclusive-first-class-tracksuit", "/gb/en/articles/highlights/fashion-footprints-new-york", "/gb/en/articles/highlights/hyderabad-city-of-pearls-and-programmers", "/gb/en/articles/highlights/johannesburg-winter", "/gb/en/articles/highlights/minneapolis-best-winter-activities", "/gb/en/articles/highlights/minneapolis-winter", "/gb/en/articles/highlights/mumbai-nyc-art-journey", "/gb/en/articles/highlights/mumbai-san-francisco-art-journey", "/gb/en/articles/highlights/mumbai-uk-art-journey", "/gb/en/articles/highlights/new-york-fashion-week", "/gb/en/articles/highlights/raleigh-nc-winter", "/gb/en/articles/highlights/rome-art-and-culture", "/gb/en/articles/highlights/sao-paulo-carnival-brazil-largest-street-carnival", "/gb/en/articles/highlights/seattle-winter", "/gb/en/articles/highlights/shanghai-best-restaurants-and-traditional-chinese-dishes", "/gb/en/articles/highlights/sports-experiences-rio-de-janeiro", "/gb/en/articles/highlights/stefan-marx-travel-hacks", "/gb/en/articles/highlights/the-art-of-flying-extra-long-bed", "/gb/en/articles/highlights/the-art-of-flying-extra-space-seat", "/gb/en/articles/highlights/the-art-of-flying-suite", "/gb/en/articles/highlights/vancouver-winter", "/gb/en/articles/tags", "/gb/en/articles/tags/algiers", "/gb/en/articles/tags/allegris", "/gb/en/articles/tags/allegris-inspires", "/gb/en/articles/tags/almaty", "/gb/en/articles/tags/amman", "/gb/en/articles/tags/amsterdam", "/gb/en/articles/tags/art", "/gb/en/articles/tags/art-basel-miami-beach", "/gb/en/articles/tags/athens", "/gb/en/articles/tags/atlanta", "/gb/en/articles/tags/bangkok", "/gb/en/articles/tags/barcelona", "/gb/en/articles/tags/be-picky", "/gb/en/articles/tags/beijing", "/gb/en/articles/tags/bengaluru", "/gb/en/articles/tags/berlin", "/gb/en/articles/tags/bilbao", "/gb/en/articles/tags/bogota", "/gb/en/articles/tags/boston", "/gb/en/articles/tags/budapest", "/gb/en/articles/tags/buenos-aires", "/gb/en/articles/tags/cagliari", "/gb/en/articles/tags/cairo", "/gb/en/articles/tags/cape-town", "/gb/en/articles/tags/casablanca", "/gb/en/articles/tags/catania", "/gb/en/articles/tags/charlotte", "/gb/en/articles/tags/chicago", "/gb/en/articles/tags/copenhagen", "/gb/en/articles/tags/dallas", "/gb/en/articles/tags/denver", "/gb/en/articles/tags/detroit", "/gb/en/articles/tags/dubai", "/gb/en/articles/tags/dublin", "/gb/en/articles/tags/eat-see-do", "/gb/en/articles/tags/edinburgh", "/gb/en/articles/tags/essentials", "/gb/en/articles/tags/faro", "/gb/en/articles/tags/fly-with-me", "/gb/en/articles/tags/flying-high", "/gb/en/articles/tags/food", "/gb/en/articles/tags/frankfurt", "/gb/en/articles/tags/frequent-flyers", "/gb/en/articles/tags/future-of-flying", "/gb/en/articles/tags/gothenburg", "/gb/en/articles/tags/hamburg", "/gb/en/articles/tags/helsinki", "/gb/en/articles/tags/history", "/gb/en/articles/tags/hong-kong", "/gb/en/articles/tags/houston", "/gb/en/articles/tags/hyderabad", "/gb/en/articles/tags/in-my-hood", "/gb/en/articles/tags/inside-lufthansa", "/gb/en/articles/tags/istanbul", "/gb/en/articles/tags/johannesburg", "/gb/en/articles/tags/know-before-you-go", "/gb/en/articles/tags/kuala-lumpur", "/gb/en/articles/tags/larnaca", "/gb/en/articles/tags/lisbon", "/gb/en/articles/tags/ljubljana", "/gb/en/articles/tags/london", "/gb/en/articles/tags/los-angeles", "/gb/en/articles/tags/madrid", "/gb/en/articles/tags/malaga", "/gb/en/articles/tags/mallorca", "/gb/en/articles/tags/manchester", "/gb/en/articles/tags/marseille", "/gb/en/articles/tags/mexico-city", "/gb/en/articles/tags/miami", "/gb/en/articles/tags/milan", "/gb/en/articles/tags/minneapolis-st-paul", "/gb/en/articles/tags/mumbai", "/gb/en/articles/tags/munich", "/gb/en/articles/tags/music", "/gb/en/articles/tags/my-world", "/gb/en/articles/tags/nairobi", "/gb/en/articles/tags/new-york", "/gb/en/articles/tags/nice", "/gb/en/articles/tags/olbia", "/gb/en/articles/tags/on-the-scene", "/gb/en/articles/tags/oslo", "/gb/en/articles/tags/paris", "/gb/en/articles/tags/perfect-day", "/gb/en/articles/tags/picture-perfect", "/gb/en/articles/tags/porto", "/gb/en/articles/tags/prague", "/gb/en/articles/tags/raleigh-durham", "/gb/en/articles/tags/riga", "/gb/en/articles/tags/rio-de-janeiro", "/gb/en/articles/tags/riyadh", "/gb/en/articles/tags/rome", "/gb/en/articles/tags/san-diego", "/gb/en/articles/tags/san-francisco", "/gb/en/articles/tags/seattle", "/gb/en/articles/tags/seoul", "/gb/en/articles/tags/shanghai", "/gb/en/articles/tags/shopping", "/gb/en/articles/tags/singapore", "/gb/en/articles/tags/sport", "/gb/en/articles/tags/st-louis", "/gb/en/articles/tags/stockholm", "/gb/en/articles/tags/stop-over", "/gb/en/articles/tags/tallinn", "/gb/en/articles/tags/tbilisi", "/gb/en/articles/tags/team-stories", "/gb/en/articles/tags/tel-aviv", "/gb/en/articles/tags/thessaloniki", "/gb/en/articles/tags/tirana", "/gb/en/articles/tags/tokyo", "/gb/en/articles/tags/toronto", "/gb/en/articles/tags/tunis", "/gb/en/articles/tags/valletta", "/gb/en/articles/tags/vancouver", "/gb/en/articles/tags/venice", "/gb/en/articles/tags/vienna", "/gb/en/articles/tags/vilnius", "/gb/en/articles/tags/washington-dc", "/gb/en/articles/tags/what-i-learned", "/gb/en/articles/tags/what-the-hack", "/gb/en/articles/tags/yes-stories", "/gb/en/articles/tags/zagreb", "/gb/en/articles/tags/zurich", "/gb/en/assistenzhunde", "/gb/en/automatic-check-in", "/gb/en/baggage", "/gb/en/baggage-irregularities", "/gb/en/besondere-befoerderungsbedingungen-bus", "/gb/en/bid-upgrade", "/gb/en/boarding", "/gb/en/boeing787", "/gb/en/book-and-manage/additional-services/get-your-guide", "/gb/en/book-and-manage/additional-services/travel-insurances", "/gb/en/book-and-manage/booking-services/manage-my-bookings", "/gb/en/book-and-manage/cancellation-and-refund/refund/refund-form", "/gb/en/book-and-manage/destination", "/gb/en/book-and-manage/digital-self-services/airline-apps", "/gb/en/book-and-manage/flights/air-baltic", "/gb/en/book-and-manage/flights/ana", "/gb/en/book-and-manage/flights/ana/faq", "/gb/en/book-and-manage/flights/giftvoucher", "/gb/en/book-and-manage/flights/helvetic", "/gb/en/book-and-manage/flights/lufthansa-voucher", "/gb/en/book-and-manage/flights/wetlease-hub", "/gb/en/book-and-manage/passenger-receipt-90days/confirmation", "/gb/en/book-and-manage/pax-receipt", "/gb/en/book-and-manage/pax-receipt/invoices-different-countries", "/gb/en/book-and-manage/rebook", "/gb/en/book-and-manage/rebook/involuntary-rebooking", "/gb/en/book-and-manage/rebook/voluntary-rebooking", "/gb/en/book-and-manage/stopover", "/gb/en/book-and-manage/stopover/bayerischer-hof", "/gb/en/book-and-manage/stopover/neuschwanstein", "/gb/en/book-and-manage/stopover/zugspitze", "/gb/en/book-and-manage/trip-management", "/gb/en/business-class", "/gb/en/business-class-on-short-and-medium-haul", "/gb/en/business-services", "/gb/en/business-terms-and-conditions", "/gb/en/cancellations-and-refunds", "/gb/en/carry-on-baggage", "/gb/en/cash-and-miles", "/gb/en/check-in-baggage", "/gb/en/check-in-deadlines", "/gb/en/check-in-with-the-family", "/gb/en/child-restraint-systems", "/gb/en/children-on-board", "/gb/en/childrens-menus-on-board", "/gb/en/common", "/gb/en/common/accessibility-statement", "/gb/en/common/agb-extra-services-at-online-check-in", "/gb/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation", "/gb/en/common/baggage-conditions", "/gb/en/common/compensation-voucher", "/gb/en/common/imprint/lufthansa-insights-imprint", "/gb/en/common/privacy-statement/privacy-statement-group", "/gb/en/common/seatreservation-condtions/seat-reservations", "/gb/en/cookie-policy", "/gb/en/culinaryjourney", "/gb/en/dangerous-dogs", "/gb/en/data-collection-canada", "/gb/en/data-collection-usa", "/gb/en/data-protection-information", "/gb/en/datenschutz", "/gb/en/digital-baggage-services", "/gb/en/digital-self-services", "/gb/en/digital-travel-companion", "/gb/en/discover-lufthansa/carbon-offsetting/climate-protection-projects", "/gb/en/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge", "/gb/en/discover-lufthansa/carbon-offsetting/faq-saf", "/gb/en/discover-lufthansa/carbon-offsetting/saf", "/gb/en/discover-lufthansa/flightreservation-priceguarantee", "/gb/en/discover-lufthansa/lufthansa-fleet/351", "/gb/en/discover-lufthansa/lufthansa-group-airlines/ita-airways", "/gb/en/discover-lufthansa/miles-and-more-credit-card", "/gb/en/discover-lufthansa/new-onboard-experience", "/gb/en/discover-lufthansa/register-newsletter", "/gb/en/discover-lufthansa/take-off", "/gb/en/doctor-on-board", "/gb/en/doctor-on-board-news", "/gb/en/during-your-trip/food-and-beverages/onboard-delights/faq", "/gb/en/during-your-trip/internet-overview", "/gb/en/during-your-trip/lhg-wifi", "/gb/en/economy-class", "/gb/en/electronic-bag-tags", "/gb/en/entryprocesses", "/gb/en/europa-tarife-economy-class", "/gb/en/europcar", "/gb/en/exclusive-charter", "/gb/en/faq-data-security", "/gb/en/faq-ejournals", "/gb/en/faq-password-security", "/gb/en/farealert/best-price-alert", "/gb/en/feedback", "/gb/en/feedback-past-flight", "/gb/en/feedback/feedbackai", "/gb/en/fia-valet-service", "/gb/en/first-class", "/gb/en/first-class-comfort", "/gb/en/first-class-lounges", "/gb/en/first-class-personal-assistant", "/gb/en/first-class-terminal", "/gb/en/first-class-valet-parking-service", "/gb/en/fliegen-mit-baby", "/gb/en/flight-disruptions", "/gb/en/flight-search", "/gb/en/flights", "/gb/en/fly-more-sustainabl", "/gb/en/flying-with-small-children", "/gb/en/flynet", "/gb/en/fmg-valet-parking-service", "/gb/en/food-and-beverages", "/gb/en/frankfurt-fair", "/gb/en/free2move", "/gb/en/freigepaeck-regeln", "/gb/en/gefaehrliche-gegenstaende", "/gb/en/general-conditions-currency-conversion", "/gb/en/good-for-train", "/gb/en/green-fare", "/gb/en/group-travel", "/gb/en/group-travel-and-charter", "/gb/en/help-and-contact", "/gb/en/hertz", "/gb/en/homepage", "/gb/en/hotel-offers", "/gb/en/imprint", "/gb/en/lh-rentalcar", "/gb/en/local-page/ski-campaign-2026", "/gb/en/lounge-companions", "/gb/en/lounges", "/gb/en/lufthansa-am-flughafen-frankfurt", "/gb/en/lufthansa-at-berlin-airport", "/gb/en/lufthansa-at-duesseldorf-airport", "/gb/en/lufthansa-at-vienna-airport", "/gb/en/lufthansa-at-zuerich-airport", "/gb/en/lufthansa-aviation-group", "/gb/en/lufthansa-business-class-on-long-haul-routes", "/gb/en/lufthansa-city/culinaryjourney", "/gb/en/lufthansa-city/menu-card", "/gb/en/lufthansa-corporate-customers", "/gb/en/lufthansa-ejournals", "/gb/en/lufthansa-express", "/gb/en/lufthansa-express-bus", "/gb/en/lufthansa-express-rail", "/gb/en/lufthansa-first-class-entertainment", "/gb/en/lufthansa-first-class-fleet", "/gb/en/lufthansa-group-star-alliance-and-partner-airlines", "/gb/en/lufthansa-guide-service", "/gb/en/lufthansa-terminal-muenchen", "/gb/en/lufthansa-travel-classes", "/gb/en/medikamenten-transport", "/gb/en/meetings-and-events", "/gb/en/meetings-and-events-delegates", "/gb/en/meetings-and-events-organisers", "/gb/en/menus-on-long-haul-flights", "/gb/en/menus-travel-classes", "/gb/en/miles-and-more", "/gb/en/mobility-partner-program-healthcare", "/gb/en/most-significant-route", "/gb/en/munich-fair", "/gb/en/my-bookings", "/gb/en/my-logbook", "/gb/en/onboard-delights", "/gb/en/online-check-in", "/gb/en/online-check-in-info", "/gb/en/overview-flights", "/gb/en/overview-manage", "/gb/en/overview-special-request", "/gb/en/overview-travel-information", "/gb/en/partner", "/gb/en/passenger-receipt-90", "/gb/en/passenger-rights", "/gb/en/passengers-using-wheelchairs", "/gb/en/passengers-with-sensory-impairment", "/gb/en/payment-options-at-the-airport", "/gb/en/pre-check-in", "/gb/en/premium-economy-class", "/gb/en/prepare-for-your-trip/airport-information/services-at-the-airport/security-waiting-time", "/gb/en/prepare-for-your-trip/baggage/baggage-conditions", "/gb/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg", "/gb/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay", "/gb/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage", "/gb/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage", "/gb/en/prepare-for-your-trip/baggage/electronic-devices-and-batteries", "/gb/en/prepare-for-your-trip/baggage/sport-baggage/register-ammunition", "/gb/en/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation", "/gb/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation", "/gb/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation", "/gb/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation", "/gb/en/prepare-for-your-trip/current-travel-information", "/gb/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system", "/gb/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk", "/gb/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing", "/gb/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing", "/gb/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment", "/gb/en/prepare-for-your-trip/travel-classes/economy-basic", "/gb/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass", "/gb/en/prepare-for-your-trip/travelling-with-children/planning-with-kids", "/gb/en/rail-and-fly", "/gb/en/rail-fly-terms-and-conditions", "/gb/en/rechnungsbeleg", "/gb/en/refund", "/gb/en/register-animal-cabin", "/gb/en/schengen", "/gb/en/seat-maps", "/gb/en/secure-flight", "/gb/en/security-check-time-slot", "/gb/en/security-fast-lanes", "/gb/en/sepa-terms-and-conditions", "/gb/en/sepa-terms-and-conditions-b", "/gb/en/services-at-frankfurt-airport", "/gb/en/services-at-the-airport", "/gb/en/services-munich-airport", "/gb/en/services-on-board", "/gb/en/shopping", "/gb/en/sixt", "/gb/en/special-meals", "/gb/en/special-needs", "/gb/en/sports-baggage", "/gb/en/support/contact/contact-form-confirmation", "/gb/en/support/contact/passenger-duty-united-kingdom", "/gb/en/support/fast-compensation/compensation-flight-disruptions", "/gb/en/support/feedback-and-contact-airlines", "/gb/en/support/search/search-result", "/gb/en/support/support", "/gb/en/terms-and-conditions-lh", "/gb/en/terms-of-service-group", "/gb/en/terms-of-use", "/gb/en/tiere-als-handgepaeck", "/gb/en/tiere-als-uebergepaeck", "/gb/en/timetable-and-flight-status", "/gb/en/tips-senior-travellers", "/gb/en/travel-agencies", "/gb/en/travel-briefing", "/gb/en/travel-expense-management", "/gb/en/travel-id-terms-conditions", "/gb/en/travelling-healthy", "/gb/en/travelling-with-animals", "/gb/en/travelling-with-children", "/gb/en/travelling-with-special-requirements", "/gb/en/traveltricks", "/gb/en/uebergepaeck", "/gb/en/unaccompanied-minors", "/gb/en/unterhaltung-an-bord", "/gb/en/upgrade-business-class-long-haul", "/gb/en/upgrade-first-class", "/gb/en/upgrade-info", "/gb/en/upgrade-options", "/gb/en/upgrade-premium-economy-class", "/gb/en/upgrade-to-business-class", "/gb/en/upgrade-to-premium-economy-class", "/gb/en/upgrades-at-online-check-in", "/gb/en/wheelchair-batteries", "/gb/en/with-children-at-the-airport", "/us/en/ccpa", "/us/en/dnsmpi"]);
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
  var EMBED_URL = /(youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|brightcove|players\.|maps\.google|google\.com\/maps|lufthansa\.com|lufthansa-inflightentertainment\.com|swiss-inflightentertainment\.com|box\.media-carrier\.de|lhg-network\.com)/i;
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
  var ENTITY_TEXT = /&(#\d{1,7}|#x[0-9a-f]{1,6}|[a-z][a-z0-9]{1,31});/gi;
  var MARKUP_ENTITY = /^(amp|lt|gt|quot|apos|#0*(38|60|62|34|39)|#x0*(26|3c|3e|22|27))$/i;
  function decodeEntityText(document) {
    const cache = /* @__PURE__ */ new Map();
    const Parser = typeof DOMParser !== "undefined" ? DOMParser : document.defaultView && document.defaultView.DOMParser;
    const parser = Parser ? new Parser() : null;
    const scratch = document.createElement("div");
    const decode = (entity) => {
      if (!cache.has(entity)) {
        let text;
        if (parser) {
          text = parser.parseFromString(`<!doctype html><html><body><p>${entity}</p></body></html>`, "text/html").querySelector("p").textContent;
        } else {
          scratch.innerHTML = entity;
          text = scratch.textContent;
        }
        cache.set(entity, text && text !== entity ? text : null);
      }
      return cache.get(entity);
    };
    const decodeString = (value, keepMarkup) => String(value).replace(ENTITY_TEXT, (m, name) => {
      if (keepMarkup && MARKUP_ENTITY.test(name)) return m;
      const c = decode(m);
      return c === null ? m : c;
    });
    const walk = (node) => {
      if (node.nodeType === 3) {
        if (node.data.includes("&")) {
          const next = decodeString(node.data, false);
          if (next !== node.data) node.data = next;
        }
        return;
      }
      if (node.nodeType !== 1) return;
      [...node.attributes].forEach((a) => {
        if (!a.value.includes("&")) return;
        const next = decodeString(a.value, true);
        if (next !== a.value) node.setAttribute(a.name, next);
      });
      const tag = node.tagName.toLowerCase();
      if (tag === "script" || tag === "style") return;
      [...node.childNodes].forEach(walk);
    };
    const top = document.documentElement || document;
    if (typeof top.normalize === "function") top.normalize();
    walk(top);
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
  var OFFER_IMAGE = "data-lh-offer-image";
  function removeTracking(document) {
    document.querySelectorAll("iframe").forEach((f) => {
      const src = f.getAttribute("src") || "";
      if (!src || isHiddenFrame(f) || TRACKING_URL.test(src) || !EMBED_URL.test(src)) f.remove();
    });
    document.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (img.hasAttribute(OFFER_IMAGE)) {
        img.removeAttribute(OFFER_IMAGE);
        return;
      }
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
      if (!trigger) {
        const item = tip.closest("li");
        tip.remove();
        if (item && !item.textContent.trim() && !item.querySelector("img, picture, svg, a, [href]")) item.remove();
        return;
      }
      if (trigger.tagName === "A" || trigger.hasAttribute("href") || trigger.querySelector("[href]")) {
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
  var WIDGET_CONFIG = ".dcep-poi-mapping[data-dcep], .dcep-meili-car-rental[data-dcep], .dcep-flash-teaser, .messagecenterwrapper, .dcep-blog-overview[data-dcep], .dcep-author-slider, .dcep-blog-cookie[data-dcep], .dcep-sticky-price[data-dcep], .dcep-search-results-aem, [data-import-keep], culinary-hub";
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
  function afterNestedView(run) {
    const prev = run[0].previousElementSibling;
    const next = run[run.length - 1].nextElementSibling;
    return !!prev && !!next && prev.matches(FLOW_COLUMN) && next.matches(".headline") && !!run[0].parentElement && run[0].parentElement.matches(".column-view-item");
  }
  function pictureBeforeGrey(run) {
    const prev = run[0].previousElementSibling;
    const next = run[run.length - 1].nextElementSibling;
    return !!prev && !!next && prev.matches(".image:not(:has(video, .videoViewer))") && (next.matches(".container-gray") || !!next.querySelector(".container-gray"));
  }
  function missingSeparatorMarkers(run, flow, template) {
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
    if (template === "campaign" && run.length === 1 && prev && next && prev.matches(".text")) {
      if (next.matches(".image:not(:has(video, .videoViewer))")) return [infos[0].marker];
      if (next.matches(".carousel")) return [infos[0].marker.replace(/^spacer-\d+/, `spacer-${Math.max(spaces[0] - 24, 0)}`)];
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
  var CELL_ITEM = ":is(.twocolumn, .threecolumn, .fourcolumn) > .column-view > .row > .column-view-item";
  var CELL_TEXT = ".text, .link, .headline";
  var CELL_SPACER = "lh-cell-spacer";
  function isLufthansaPage(payload) {
    const url = payload && (payload.params && payload.params.originalURL || payload.url) || "";
    try {
      return /(^|\.)lufthansa\.com$/.test(new URL(url).hostname);
    } catch (e) {
      return false;
    }
  }
  function isBrusselsPage(payload) {
    const url = payload && (payload.params && payload.params.originalURL || payload.url) || "";
    try {
      return /(^|\.)brusselsairlines\.com$/.test(new URL(url).hostname);
    } catch (e) {
      return false;
    }
  }
  function isDiscoverPage(payload) {
    const url = payload && (payload.params && payload.params.originalURL || payload.url) || "";
    try {
      return /(^|\.)discover-airlines\.com$/.test(new URL(url).hostname);
    } catch (e) {
      return false;
    }
  }
  var DISCOVER_SEPARATOR_SPACE = 30;
  function discoverSized(sep, marker) {
    const inline = separatorInline(sep);
    return marker.replace(/^(spacer|divider)-\d+/, `$1-${Math.max(inline === null ? DISCOVER_SEPARATOR_SPACE : inline, 0)}`);
  }
  function discoverMarkers(run) {
    if (!run[0].previousElementSibling || !run[run.length - 1].nextElementSibling) return null;
    return run.map((sep) => discoverSized(sep, separatorInfo(sep).marker));
  }
  var SEPARATED = "data-lh-separated";
  function betweenColumnViews(run) {
    const prev = run[0].previousElementSibling;
    const next = run[run.length - 1].nextElementSibling;
    return run.length === 1 && separatorInline(run[0]) === null && !separatorInfo(run[0]).keep && !!prev && !!next && prev.matches(FLOW_COLUMN) && next.matches(FLOW_COLUMN) ? next : null;
  }
  function lhBetweenColumnViews(run) {
    if (run.length !== 1) return null;
    const inline = separatorInline(run[0]);
    if (inline === null || inline < 10 || separatorInfo(run[0]).keep) return null;
    const prev = run[0].previousElementSibling;
    const next = run[0].nextElementSibling;
    return !!prev && !!next && prev.matches(FLOW_COLUMN) && next.matches(FLOW_COLUMN) ? next : null;
  }
  var EMPTY_FIRST = "data-lh-empty-first";
  function isEmptyParagraph(p) {
    return !!p && p.tagName === "P" && !p.textContent.replace(/\u00A0/g, " ").trim() && !p.querySelector("img, br");
  }
  function markEmptyFirstParagraphs(document) {
    document.querySelectorAll(`${CELL_ITEM} > .text`).forEach((comp) => {
      const rich = comp.querySelector(":scope > .richtext");
      if (rich && isEmptyParagraph(rich.firstElementChild)) comp.setAttribute(EMPTY_FIRST, "");
    });
  }
  function markNoteSpacers(document) {
    document.querySelectorAll(`${CELL_ITEM} > .text`).forEach((comp) => {
      const prev = comp.previousElementSibling;
      if (!prev || !prev.matches(CELL_TEXT)) return;
      const rich = comp.querySelector(":scope > .richtext");
      const first = rich && rich.firstElementChild;
      const empty = isEmptyParagraph(first);
      if (!empty && !comp.hasAttribute(EMPTY_FIRST)) return;
      comp.removeAttribute(EMPTY_FIRST);
      if (!rich || ![...rich.children].some((c) => !isEmptyParagraph(c) && c.textContent.trim())) return;
      if (empty) first.remove();
      const div = document.createElement("div");
      div.className = CELL_SPACER;
      div.textContent = "{spacer-24}";
      comp.before(div);
    });
  }
  function endsTextCell(run) {
    const first = run[0];
    const item = first.parentElement;
    if (!item || !item.matches(CELL_ITEM) || run[run.length - 1].nextElementSibling) return false;
    const prev = first.previousElementSibling;
    return !!prev && prev.matches(CELL_TEXT) && run.every((sep) => separatorInline(sep) === null);
  }
  function inTextCell(run) {
    const first = run[0];
    const last = run[run.length - 1];
    const item = first.parentElement;
    if (!item || !item.matches(CELL_ITEM)) return false;
    const prev = first.previousElementSibling;
    const next = last.nextElementSibling;
    return !!prev && !!next && prev.matches(CELL_TEXT) && next.matches(CELL_TEXT);
  }
  function markSeparators(document, keepInFlow, payload) {
    const template = (payload && payload.template || {}).name;
    const fillGaps = !SEPARATOR_AS_IS_TEMPLATES.includes(template);
    const cellSpacers = isLufthansaPage(payload);
    if (cellSpacers) markNoteSpacers(document);
    const brussels = isBrusselsPage(payload);
    const discover = isDiscoverPage(payload);
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
      if (cellSpacers && inTextCell(run) && run.every((sep) => separatorSpace(sep) >= 10)) {
        run.forEach((sep, i) => {
          const div = document.createElement("div");
          div.className = CELL_SPACER;
          div.textContent = `{${infos[i].marker}}`;
          sep.replaceWith(div);
        });
        return;
      }
      if (brussels && endsTextCell(run)) {
        const div = document.createElement("div");
        div.className = CELL_SPACER;
        div.textContent = "{spacer-0}";
        run[0].replaceWith(div);
        run.slice(1).forEach((sep) => sep.remove());
        return;
      }
      const separated = brussels && betweenColumnViews(run) || cellSpacers && lhBetweenColumnViews(run);
      if (separated) separated.setAttribute(SEPARATED, "true");
      let markers = null;
      if (infos.some((i) => i.keep) || afterGrey(run[0]) || keepInFlow && inFlow(run) || template === "hub" && (afterNestedView(run) || pictureBeforeGrey(run))) {
        markers = infos.map((i) => i.marker);
      } else if (discover) {
        markers = discoverMarkers(run);
      } else if (fillGaps) {
        markers = missingSeparatorMarkers(run, keepInFlow, template);
      }
      if (discover && markers) markers = markers.map((m, i) => m ? discoverSized(run[i], m) : m);
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
  var QUOTE_SPACERS = { before: ["spacer-0", "spacer-14 from-768"], after: ["spacer-53", "spacer-17 from-768"] };
  function aemNeighbour(aem, dir) {
    let n = aem[dir];
    while (n && !(n.classList.contains("section") && (cleanText(n) || n.querySelector("img, picture, video, iframe")))) n = n[dir];
    return n;
  }
  var paddedAem = (n) => !!n && !!n.querySelector(":scope > div > .section-padding-y-regular");
  function spacerParagraphs(document, tokens) {
    return tokens.map((t) => {
      const sp = document.createElement("p");
      sp.textContent = `{${t}}`;
      return sp;
    });
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
      const holder = quote.closest(".authorquote") || quote;
      const aem = !quote.closest(".article-details-page") && holder.closest(".container-content > .section");
      const content = aem && holder.closest(".section-content");
      const alone = content && [...content.children].every((c) => c === holder || !cleanText(c));
      const padded = (dir) => paddedAem(aemNeighbour(aem, dir));
      holder.replaceWith(
        ...alone && padded("previousElementSibling") ? spacerParagraphs(document, QUOTE_SPACERS.before) : [],
        bq,
        ...alone && padded("nextElementSibling") ? spacerParagraphs(document, QUOTE_SPACERS.after) : []
      );
      converted += 1;
    });
    return converted;
  }
  function padCarouselSections(document) {
    let padded = 0;
    document.querySelectorAll(".container-content > .section .section-content > .carousel").forEach((carousel) => {
      if (!carousel.querySelector(".swiper-single-slide")) return;
      const content = carousel.parentElement;
      const aem = content.closest(".container-content > .section");
      if (!paddedAem(aem) || ![...content.children].every((c) => c === carousel || !cleanText(c))) return;
      const next = aemNeighbour(aem, "nextElementSibling");
      if (!next || paddedAem(next) || next.querySelector(".container-gray")) return;
      carousel.after(...spacerParagraphs(document, ["spacer-43", "spacer-17 from-768"]));
      padded += 1;
    });
    return padded;
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
  var COLUMN_MARK_TEMPLATES = ["info", "fleet", "legal", "app-entry"];
  var COLUMN_ATTR = "data-lh-column";
  var COLUMN_KINDS = ".onecolumn, .twocolumn, .threecolumn, .fourcolumn";
  function columnMarksEnabled(payload) {
    const template = payload && payload.template || {};
    return COLUMN_MARK_TEMPLATES.includes(template.name) || COLUMN_MARK_TEMPLATES.includes(template.base);
  }
  function isOwnColumnView(el) {
    return !!el && el.matches(`:is(${COLUMN_KINDS}).column`) && el.children.length === 1 && el.firstElementChild.classList.contains("column-view");
  }
  function markColumnViews(document, payload) {
    const template = payload && payload.template || {};
    const instances = (template.blocks || []).flatMap((b) => (b.instances || []).map((sel) => [b.name, sel]));
    const blockOf2 = (el) => {
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
      const block = blockOf2(root);
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
    const ownEnds = /* @__PURE__ */ new Map();
    inViewSlideshows(roots);
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
        const end = own(`column-end${suffix}${spaced ? " column-spaced" : ""}`);
        root.append(end);
        ownEnds.set(end, end.textContent);
      }
      placed += 1;
    });
    dropNestedOuterEnds(ownEnds);
    roots.forEach((root) => root.removeAttribute(COLUMN_ATTR));
    return placed;
  }
  function inViewSlideshows(roots) {
    roots.forEach((root) => {
      root.querySelectorAll("table").forEach((table) => {
        const head = table.querySelector("tr > th, tr > td");
        const name = head ? cleanText(head) : "";
        const m = name.match(/^carousel[- ]lightbox\s*(?:\(([^)]*)\))?$/i);
        if (!m) return;
        const opts = (m[1] || "").split(",").map((o) => o.trim()).filter(Boolean);
        if (opts.includes("in-view")) return;
        head.textContent = `${name.replace(/\s*\(.*$/, "")} (${[...opts, "in-view"].join(", ")})`;
      });
    });
  }
  function dropNestedOuterEnds(ownEnds) {
    ownEnds.forEach((token, inner) => {
      if (token !== "{column-end-outer}" || !inner.isConnected) return;
      let el = inner;
      while (el.parentElement) {
        let next = el.nextElementSibling;
        while (next && !cleanText(next) && !next.querySelector("img, picture, table, video, iframe")) next = next.nextElementSibling;
        if (next) {
          if (ownEnds.get(next) === token && next.parentElement.contains(inner)) inner.remove();
          return;
        }
        el = el.parentElement;
      }
    });
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
          if (mobile.querySelector('.swiper-slide, [class*="swiper"]') || mobile.closest(".carousel")) twin.setAttribute("data-lh-swiper-below-lg", "");
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
  function ensureDescription(document) {
    const { head } = document;
    if (!head) return;
    const content = (sel) => {
      const m = head.querySelector(sel);
      return m ? (m.getAttribute("content") || "").replace(/\s+/g, " ").trim() : "";
    };
    const own = head.querySelector('meta[name="description"]');
    if (own && content('meta[name="description"]')) return;
    let description = content('meta[property="og:description"]') || content('meta[name="og:description"]') || content('meta[name="twitter:description"]') || content('meta[property="twitter:description"]');
    if (!description) {
      const root = document.querySelector(".container-content") || document.querySelector("main") || document.body;
      description = firstTextParagraph(root, "header, footer, nav, .header, .footer, .lightbox-modal");
    }
    if (!description) return;
    const meta = own || document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute("content", description);
    if (!own) head.append(meta);
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
        const linkPath = normalizePath(u.pathname).replace(/^\/content\/lh(?=\/)/, "");
        if (linkPath !== pagePath && aliasPath(linkPath) !== pagePath) return;
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
  var LINK_LIST_LAYOUTS = ["horizontal", "responsive", "vertical"];
  var LINK_LIST_LINK = "maui-navigation-link[href], maui-link[href], a[href], maui-button-link[href]";
  function markLinkLists(document, payload) {
    if (!isLufthansaPage(payload)) return 0;
    let marked = 0;
    document.querySelectorAll(".imagelinklist .link-list > ul").forEach((ul) => {
      const layout = LINK_LIST_LAYOUTS.find((c) => ul.classList.contains(c));
      if (!layout || ul.closest(".accordion, maui-collapsible, footer, header")) return;
      const items = [...ul.children].filter((li) => li.tagName === "LI");
      const links = [];
      const ok = items.every((li) => {
        const found = [...li.querySelectorAll(LINK_LIST_LINK)].filter((l) => !l.parentElement.closest(LINK_LIST_LINK));
        const rest = li.cloneNode(true);
        rest.querySelectorAll(`${LINK_LIST_LINK}, [slot="box"]`).forEach((l) => l.remove());
        if (cleanText(rest) || rest.querySelector("img, picture, svg, video, iframe, input, button")) return false;
        if (!found.length) return true;
        if (found.length > 1) return false;
        links.push(found[0]);
        return true;
      });
      if (!ok || !links.length) return;
      const pageLink = (l) => l.tagName === "MAUI-NAVIGATION-LINK" && ["hyper", "external"].includes(l.getAttribute("variant")) && !l.querySelector("img, picture, svg") && cleanText(l);
      if (!links.every(pageLink)) return;
      links[links.length - 1].closest("li").append(` {links-${layout}}`);
      ul.setAttribute("data-lh-links", layout);
      marked += 1;
    });
    return marked;
  }
  var CELL_TEXT_TOKEN = /^(?:copytext-(?:small|medium|large)|full-width|limited-width|caption|parallax|narrow|indent-\d{1,3}|column-(?:(?:start|end)(?:-outer)?|spaced))$/;
  var TRAILING_TOKENS = /\s*\{([a-z0-9 -]+)\}\s*$/;
  function dropLoneCellMarkers(document, payload) {
    if (!isLufthansaPage(payload)) return 0;
    let dropped = 0;
    document.querySelectorAll("table").forEach((table) => {
      const name = cleanText(table.querySelector("tr > th, tr > td") || table).toLowerCase();
      if (/^(section )?metadata$/.test(name) || /^form\b/.test(name)) return;
      table.querySelectorAll(":scope > tbody > tr > td, :scope > tr > td").forEach((td) => {
        const els = [...td.children];
        const bare = [...td.childNodes].some((c) => c.nodeType === 3 && c.nodeValue.trim());
        let holder = null;
        if (els.length === 1 && els[0].tagName === "P" && !bare) [holder] = els;
        else if (!els.length && bare) holder = td;
        if (!holder || holder.querySelector("img, picture, video, iframe")) return;
        const walker = document.createTreeWalker(holder, 4);
        let last = null;
        for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.nodeValue.trim()) last = n;
        const m = last && last.nodeValue.match(TRAILING_TOKENS);
        if (!m || !m[1].trim().split(/\s+/).every((t) => CELL_TEXT_TOKEN.test(t))) return;
        last.nodeValue = last.nodeValue.slice(0, m.index);
        dropped += 1;
      });
    });
    return dropped;
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
  function removeEmptyLinks(document) {
    document.querySelectorAll("a[href]").forEach((a) => {
      if (a.textContent.replace(/[\u200B-\u200D\uFEFF\s]/g, "")) return;
      if (a.querySelector("img, picture, svg, video, iframe")) return;
      if ((a.getAttribute("aria-label") || "").trim() || (a.getAttribute("title") || "").trim()) return;
      a.remove();
    });
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
  var ALIASES = {
    "prepare-for-your-trip/travel-classes/business-class": "business-class",
    "book-and-manage/digital-self-services/digital-travel-companion": "digital-travel-companion",
    "during-your-trip/internet-on-board": "flynet",
    "prepare-for-your-trip/baggage/free-baggage": "freigepaeck-regeln",
    "during-your-trip/lounges": "lounges"
  };
  function aliasPath(pagePath) {
    const m = (pagePath || "").match(/^(\/[a-z]{2}\/[a-z]{2})\/(.+)$/);
    const alias = m && ALIASES[m[2]] && `${m[1]}/${ALIASES[m[2]]}`;
    return alias && SCOPE_PATHS.has(alias) ? alias : null;
  }
  function rewriteHref(href, origins) {
    const raw = (href || "").trim().replace(/^\/\/content\//, "/content/");
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
    const alias = PAGE_PATH.test(pagePath) && aliasPath(pagePath);
    if (alias) return `${alias}${u.search}${u.hash}`;
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
      if (el.hasAttribute("data-own-link")) {
        el.removeAttribute("data-own-link");
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
  function oneMainHeading(document, payload) {
    const template = (payload && payload.template || {}).name;
    if (!isLufthansaPage(payload) || !["info", "campaign"].includes(template)) return;
    const headings = [...document.querySelectorAll(HEADING)].filter((h) => cleanText(h));
    const relevel = (h, tag) => {
      const size = HEADING_STYLES.find((c) => h.classList.contains(c)) || HEADING_DEFAULTS[h.tagName];
      const next = document.createElement(tag);
      [...h.attributes].forEach((a) => next.setAttribute(a.name, a.value));
      next.append(...h.childNodes);
      const last = [...next.childNodes].reverse().find((n) => n.nodeType === 3 && n.nodeValue.trim());
      const marker = last && last.nodeValue.match(/\{([a-z0-9 -]+)\}\s*$/);
      if (marker && !/(^| )(heading-|copytext-large)/.test(marker[1])) {
        last.nodeValue = last.nodeValue.replace(/\{([a-z0-9 -]+)\}(\s*)$/, `{${size} $1}$2`);
      } else if (!marker && !HEADING_STYLES.some((c) => next.classList.contains(c))) {
        next.classList.add(size);
      }
      h.replaceWith(next);
    };
    const h1s = headings.filter((h) => h.tagName === "H1");
    if (!h1s.length && headings.length) relevel(headings[0], "h1");
    h1s.slice(1).forEach((h) => relevel(h, "h2"));
  }
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
  function markEmptyHeadlines(document, payload) {
    if ((payload && payload.template || {}).name !== "insights") return;
    document.querySelectorAll(".headline").forEach((headline) => {
      const h = headline.querySelector("h1, h2, h3, h4, h5, h6");
      if (!h || headline.children.length !== 1 || h.textContent.replace(/[\s\u00A0]+/g, "") !== "") return;
      headline.replaceWith(document.createComment(`${SEPARATOR_COMMENT} spacer-42`));
    });
  }
  function convertOfferCards(document) {
    document.querySelectorAll("section.vt-comm551-offers").forEach((sec) => {
      const text = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
      const cells = [...sec.querySelectorAll(".vt-comm551-offers__card[href]")].map((card) => {
        const title = text(card.querySelector(".vt-comm551-offers__title"));
        const copy = text(card.querySelector(".vt-comm551-offers__text"));
        const src = card.querySelector("img") && card.querySelector("img").getAttribute("src");
        let image = "";
        if (src) {
          image = document.createElement("img");
          image.setAttribute("src", src);
          image.setAttribute("alt", "");
          image.setAttribute(OFFER_IMAGE, "");
        }
        const body = document.createElement("div");
        const h3 = document.createElement("h3");
        h3.textContent = title;
        body.append(h3);
        if (copy) {
          const p2 = document.createElement("p");
          p2.textContent = copy;
          body.append(p2);
        }
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", card.getAttribute("href"));
        a.textContent = title;
        p.append(a);
        body.append(p);
        return [image, body];
      }).filter(([, body]) => text(body.querySelector("h3")));
      if (!cells.length) {
        sec.remove();
        return;
      }
      const band = document.createElement("div");
      band.className = "container-gray";
      const headline = text(sec.querySelector(".vt-comm551-offers__headline"));
      if (headline) {
        const holder = document.createElement("div");
        holder.className = "headline section";
        const h2 = document.createElement("h2");
        h2.textContent = headline;
        holder.append(h2);
        band.append(holder);
      }
      band.append(WebImporter.Blocks.createBlock(document, { name: "Cards Icon Text (mini)", cells }));
      const content = document.createElement("div");
      content.className = "section-content container-fluid section-regular";
      content.append(band);
      sec.replaceWith(content);
    });
  }
  function convertFooterDisclaimer(document, pagePath) {
    const box = document.querySelector(".footer-disclaimer");
    if (!box) return;
    const text = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
    const note = text(box.querySelector(".disclaimer-text"));
    const modal = box.querySelector("maui-modal");
    const label = (modal && modal.getAttribute("label") ? modal.getAttribute("label").replace(/\s+/g, " ").trim() : "") || text(box.querySelector("maui-link-button"));
    const base = (String(pagePath || "").match(/^\/([a-z]{2})\/([a-z]{2})(?=\/|$)/) || [])[0];
    const slug2 = label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || (base || "").split("/")[2] || "";
    const out = [];
    if (note) {
      const p = document.createElement("p");
      p.className = "copytext-small";
      p.textContent = note;
      out.push(p);
    }
    if (modal && label && base) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.setAttribute("href", `${base}/fragments/modals/${slug2}`);
      a.setAttribute("data-own-link", "");
      a.textContent = label;
      p.append(a);
      out.push(p);
    }
    (box.closest(".footerdisclaimer") || box).replaceWith(...out);
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
    if (hookName === "onLoad") {
      markEmptyFirstParagraphs(document);
      return;
    }
    if (hookName === "beforeTransform") {
      decodeEntityText(document);
      ensureDescription(document);
      const titleEl = document.querySelector("title");
      if (titleEl) titleEl.textContent = titleEl.textContent.replace(/(\s*\|\s*Lufthansa)+\s*$/, " | Lufthansa");
      const pagePath = currentPagePath(document, payload);
      convertFooterDisclaimer(document, pagePath);
      convertOfferCards(document);
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
      markLinkLists(document, payload);
      convertAuthorQuotes(document);
      padCarouselSections(document);
      restoreMovingImages(document);
      markParallaxImages(document);
      markEmptyHeadlines(document, payload);
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
      removeEmptyLinks(document);
      splitBrParagraphs(document);
      convertSeparators(document);
      normalizeImages(document, false);
      rewriteLinks(document, payload);
      stripTrackingAttributes(document);
      oneMainHeading(document, payload);
      markHeadingStyles(document);
      convertCaptions(document);
      markParagraphStyles(document);
      placeColumnMarks(document);
      dropLoneCellMarkers(document, payload);
      addPageMetadata(document, payload);
    }
  }

  // tools/importer/transformers/lufthansa-sections.js
  var MARKER = "data-excat-section-id";
  var BREAK = "data-excat-section-break";
  var FIRST = "data-excat-section-first";
  var SOURCE_STYLE = "data-excat-section-source-style";
  var TAB = "data-excat-section-tab";
  var TABS = "data-excat-section-tabs";
  var TAB_MARK = /^@@tab@@(\d+)@@(.*?)@@/;
  var END_MARK = /^@@tabs-end@@/;
  var FOLLOWING = 4;
  var TAB_PANEL = "maui-tab-control-panel-responsive";
  var TAB_COLUMNS = ".twocolumn, .threecolumn, .fourcolumn, .accordion";
  var TAB_CONTENT = `${TAB_COLUMNS}, .sidebar, .videoViewer, .video`;
  var SOURCE_STYLES = [[".container-gray", "grey"], [".image-wrapper.full-width-bg", "full-bleed"]];
  var STYLE_SKIP = ".sticky-price-wrapper, .dcep-sticky-price";
  var REGION_STOP = '.section-content, .container-content, .author-details-page, .column-view-item, [class*="col-"], .contentpage, maui-tab-control-panel-responsive, main, body';
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
  function meaningful2(el) {
    return !!((el.textContent || "").replace(/[\s\u00a0\u200b]/g, "") || el.querySelector(MEDIA2));
  }
  function titledColumnView(el) {
    if (!ownColumnView(el) || el.firstElementChild.classList.contains("container-gray")) return false;
    return [...el.firstElementChild.children].some((d) => !d.matches(".row, .carousel") && d.querySelector("h1, h2, h3, h4, h5, h6") && meaningful2(d));
  }
  var SEPARATOR_NODE = (n) => n.nodeType === 8 && /^lh-separator /.test(n.nodeValue || "");
  function firstComponent(node) {
    for (let n = node; n; n = n.nextSibling) {
      if (SEPARATOR_NODE(n) || n.nodeType === 1 && (meaningful2(n) || n.matches(".separator"))) return n;
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
      else if (ownColumnView(column) && column.parentElement && column.parentElement.matches('.column-view-item, [class*="col-"]')) styles.push("in-column");
    } else {
      const content = grey.querySelector(".section-content");
      const parts = content ? [...content.children].filter(meaningful2) : [];
      if (parts.length && parts.every(ownColumnView)) {
        styles.push(content.classList.contains("section-padding-y-regular") ? "column-view" : "column-band");
      }
    }
    const aem = region.closest(".container-content > .section");
    if (aem && !aem.querySelector(":scope > .mb-default")) styles.push("flush");
    const whole = !!aem && (region === aem || grey.parentElement === aem);
    if (whole && aem.querySelector(":scope > .mb-default")) {
      let next = aem.nextElementSibling;
      while (next && !meaningful2(next)) next = next.nextElementSibling;
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
  function spacersBetween(document, from, to) {
    const range = document.createRange();
    range.setStartAfter(from);
    range.setEndBefore(to);
    return [...range.cloneContents().querySelectorAll("p")].some((p) => /^\{(?:spacer|divider)-\d/.test(p.textContent.trim()));
  }
  var isGrey = (hr) => !!hr && (hr.getAttribute(SOURCE_STYLE) || "").split(" ").includes("grey");
  function dropEmptyBreaks(document, root) {
    const breaks = [...document.querySelectorAll(`hr[${BREAK}]`)].filter((hr) => !hr.closest("table"));
    let prev = null;
    let before = null;
    breaks.forEach((hr) => {
      if (contentBetween(document, root, prev, hr)) {
        before = prev;
        prev = hr;
        return;
      }
      if (prev && isGrey(before) && isGrey(hr) && !prev.hasAttribute(SOURCE_STYLE) && !prev.hasAttribute(MARKER) && spacersBetween(document, prev, hr)) {
        prev.setAttribute(SOURCE_STYLE, "gap");
        before = prev;
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
      if (hr.hasAttribute(TAB)) prev.setAttribute(TAB, hr.getAttribute(TAB));
      if (hr.hasAttribute(TABS)) prev.setAttribute(TABS, hr.getAttribute(TABS));
      hr.remove();
    });
  }
  function markPanelBreaks(document) {
    document.querySelectorAll(TAB_PANEL).forEach((panel) => {
      const own = panel.previousElementSibling;
      if (!own || !own.matches(`hr[${TAB}]`)) return;
      panel.querySelectorAll(`hr[${BREAK}]`).forEach((hr) => {
        if (!hr.hasAttribute(TAB)) hr.setAttribute(TAB, own.getAttribute(TAB));
      });
    });
    let set = null;
    document.querySelectorAll(`hr[${BREAK}], p`).forEach((node) => {
      if (node.tagName === "P") {
        const line = (node.textContent || "").trim();
        const m = line.match(TAB_MARK);
        if (!m && !END_MARK.test(line)) return;
        if (set && set.broken) (node.closest(".text") || node).before(createBreak(document));
        set = m ? { tabs: m[1], tab: m[2].trim() } : null;
        return;
      }
      if (!set) return;
      set.broken = true;
      if (node.hasAttribute(TAB)) return;
      node.setAttribute(TAB, set.tab);
      node.setAttribute(TABS, set.tabs);
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
      const paddedBreaks = /* @__PURE__ */ new Map();
      const pageUrl = payload && (payload.params && payload.params.originalURL || payload.url) || "";
      const lufthansa = /^https?:\/\/([^/]+\.)?lufthansa\.com(\/|$)/.test(pageUrl);
      const isStage = (s) => !!s.querySelector(":scope > div > .section-content > .inspirationteaser");
      const loneQuote = (s) => {
        const content = s.querySelector(":scope > div > .section-content");
        const kids = content ? [...content.children] : [];
        const empty = (c) => !(c.textContent || "").replace(/\{spacer-[^}]*\}/g, "").trim();
        return kids.some((c) => c.matches(".authorquote")) && kids.every((c) => c.matches(".authorquote") || empty(c));
      };
      aemSections.forEach((s, i) => {
        if (!i || !padded(s) || grey(s)) return;
        const before = aemSections[i - 1];
        const next = aemSections[i + 1];
        const stageBeforePadded = isStage(s) && !!next && padded(next) && !grey(next);
        if (!padded(before) && (!lufthansa || stageBeforePadded || isStage(before) || grey(before) || loneQuote(before))) return;
        const hr = createBreak(document);
        hr.setAttribute(SOURCE_STYLE, "padded");
        s.before(hr);
        paddedBreaks.set(s, hr);
        const prev = aemSections[i - 1];
        const own = paddedBreaks.get(prev);
        if (!own || prev.querySelector(`hr[${BREAK}]`)) return;
        const gap = prev.querySelector(":scope > .mb-default") ? "spaced" : "flush";
        own.setAttribute(SOURCE_STYLE, `${own.getAttribute(SOURCE_STYLE)} ${gap}`);
      });
      if (template.name === "fleet" || template.base === "fleet") {
        aemSections.forEach((s, i) => {
          const prev = aemSections[i - 1];
          const own = prev && paddedBreaks.get(prev);
          if (!own || padded(s) || grey(s) || isStage(s) || s.querySelector(`hr[${BREAK}]`) || prev.querySelector(`hr[${BREAK}]`)) return;
          s.before(createBreak(document));
          const gap = prev.querySelector(":scope > .mb-default") ? "spaced" : "flush";
          if (!/ (spaced|flush)$/.test(own.getAttribute(SOURCE_STYLE))) own.setAttribute(SOURCE_STYLE, `${own.getAttribute(SOURCE_STYLE)} ${gap}`);
        });
      }
      const first = aemSections[0];
      if ((template.name === "info" || template.base === "info") && first && padded(first) && !grey(first) && first.querySelector("h1") && !first.querySelector(".inspirationteaser, .stage")) {
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
      if (lufthansa && (["fleet", "info"].includes(template.name) || ["fleet", "info"].includes(template.base))) {
        aemSections.forEach((s, i) => {
          const next = aemSections[i + 1];
          const after = aemSections[i + 2];
          if (!stage(s) || !next || !after || !padded(next) || grey(next) || stage(next) || padded(after) || grey(after) || stage(after)) return;
          if (!next.querySelector(":scope > .mb-default")) return;
          const hr = next.previousElementSibling;
          if (!hr || !hr.hasAttribute(BREAK) || hr.getAttribute(SOURCE_STYLE)) return;
          hr.setAttribute(SOURCE_STYLE, "padded spaced");
          const own = s.previousElementSibling;
          if (own && own.hasAttribute(BREAK)) own.setAttribute(SOURCE_STYLE, own.getAttribute(SOURCE_STYLE).split(" ").filter((x) => x !== "before-padded").join(" "));
          if (!(after.previousElementSibling && after.previousElementSibling.hasAttribute(BREAK)) && !after.querySelector(`hr[${BREAK}]`)) after.before(createBreak(document));
        });
      }
      const blockSelectors = (template.blocks || []).flatMap((b) => b.instances || []);
      const taken = (el) => blockSelectors.some((sel) => {
        try {
          return !!el.closest(sel);
        } catch (e) {
          return false;
        }
      });
      document.querySelectorAll("maui-tab-control-responsive").forEach((control) => {
        const panels = [...control.querySelectorAll(TAB_PANEL)].filter((p) => p.closest("maui-tab-control-responsive") === control);
        const tabUrl = payload && (payload.params && payload.params.originalURL || payload.url) || "";
        const content = /^https?:\/\/www\.brusselsairlines\.com\//.test(tabUrl) ? `${TAB_CONTENT}, .table` : TAB_CONTENT;
        if (!panels.length || taken(control) || !panels.some((p) => p.querySelector(content))) return;
        panels.forEach((panel, i) => {
          const hr = createBreak(document);
          hr.setAttribute(TAB, (panel.getAttribute("name") || "").trim() || `Tab ${i + 1}`);
          panel.before(hr);
        });
        control.after(createBreak(document));
      });
      markPanelBreaks(document);
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
      const marked = [...document.querySelectorAll(`hr[${MARKER}], hr[${SOURCE_STYLE}], hr[${TAB}]`)].filter((hr) => !hr.closest("table"));
      marked.reverse().forEach((marker) => {
        const style = styleOf(marker);
        const tab = marker.getAttribute(TAB);
        const tabs = marker.getAttribute(TABS);
        if (style || tab) {
          const meta = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: __spreadValues(__spreadValues(__spreadValues({}, style ? { style } : {}), tab ? { Tab: tab } : {}), tab && tabs ? { Tabs: tabs } : {})
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
        [MARKER, SOURCE_STYLE, TAB, TABS, BREAK].forEach((attr) => hr.removeAttribute(attr));
      });
    }
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
  var HEADING2 = "h1, h2, h3, h4, h5, h6";
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
            const table = doc.createElement("table");
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
            table.append(thead, tbody);
            main.append(table);
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
    if (steps === null) return { kind: "default" };
    if (Math.abs(steps) <= 1) {
      const near = ((theme.nearChoices || {})[`h${level}`] || {})[size];
      const kept = near && ((theme.headingChoices || {})[`h${level}`] || {})[near];
      return kept ? { kind: "choice", choice: near } : { kind: "default" };
    }
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
      if ((theme.keepSizes || []).includes(size)) {
        el.append(doc.createTextNode(` {${size}}`));
        count(stats, "carrier", "heading-kept", 1);
        return;
      }
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
      const all = block.querySelectorAll(HEADING2).length;
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
      const blank = (a, b) => own.slice(own.indexOf(a), own.indexOf(b) + 1).every((x) => x.tagName === "P" && isEmptyP(x) || isSepP(x));
      let outerOf = false;
      own.forEach((el, i) => {
        tokensOf(el).filter((t) => /^column-(start|end)/.test(t)).forEach((t) => {
          if (t.startsWith("column-start")) {
            if (depth === 0) {
              outerOf = t === "column-start-outer";
              cur = { first: el, outer: outerOf };
            } else if (cur && i > 0 && cur.first !== el && !blank(cur.first, own[i - 1])) {
              cur.last = own[i - 1];
              groups.push(cur);
              cur = { first: el, outer: false };
            }
            depth += 1;
          } else if (depth > 0) {
            depth -= 1;
            if (depth === 0 && cur) {
              cur.last = el;
              groups.push(cur);
              cur = null;
            } else if (cur && own[i + 1]) {
              cur.last = el;
              groups.push(cur);
              cur = { first: own[i + 1], outer: outerOf };
            }
          }
        });
      });
      for (let i = groups.length - 1; i > 0; i -= 1) {
        if (groups[i].first && groups[i].last && blank(groups[i].first, groups[i].last)) {
          groups[i - 1].last = groups[i].last;
          groups.splice(i, 1);
        }
      }
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
    const { rules, textSpacers = false, componentSpacers = false } = themeFor(ctx.brand, ctx.pageType);
    const isSep = (el) => !!el && el.tagName === "P" && SEPARATOR.test(textOf(el));
    const parse11 = (el) => textOf(el).match(SEPARATOR);
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
        const seps = run.els.map(parse11);
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
        const prose = (el) => !!el && isRunningText(el) && !/^\s*\{[^}]*\}\s*$/.test(textOf(el));
        if (size === "none" && textSpacers && !tablet && prose(before) && prose(after)) {
          const keep = doc.createElement("p");
          keep.textContent = `{spacer-${px}}`;
          run.els[0].before(keep);
          remove();
          count(stats, "carrier", "text-spacer", run.els.length);
          return;
        }
        if (size === "none" && componentSpacers && !tablet && !atStart && !atEnd && content(before) && content(after)) {
          const keep = doc.createElement("p");
          keep.textContent = `{spacer-${px}}`;
          run.els[0].before(keep);
          remove();
          count(stats, "carrier", "component-spacer", run.els.length);
          return;
        }
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
  var BRAND_HOSTS = [
    [/(^|\.)austrian\.com$/, "austrian"],
    [/(^|\.)brusselsairlines\.com$/, "brussels"],
    [/(^|\.)ita-airways\.com$/, "ita"],
    [/(^|\.)swiss\.com$/, "swiss"],
    [/(^|\.)flytap\.com$/, "tap"],
    [/(^|\.)discover\.com$/, "discover"],
    [/(^|\.)lufthansa-cargo\.com$/, "cargo"],
    [/(^|\.)airdolomiti\.(it|eu|de)$/, "airdolomiti"],
    [/(^|\.)lufthansagroup\.com$/, "b2b"]
  ];
  var brandOfHost = (host) => (BRAND_HOSTS.find(([re]) => re.test(String(host || ""))) || [null, "lufthansa"])[1];
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
      main.querySelectorAll(HEADING2).forEach((h) => {
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

  // tools/importer/nbsp-guard.mjs
  var NBSP_STAND_IN = "\u2007";
  var NBSP_ALL = /\u00a0/g;
  var NBSP_BLANK = /^[\s\u00a0]*$/;
  var NBSP_SKIP_TAGS = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);
  var HEADING_TAGS = /* @__PURE__ */ new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);
  var SPACE_RUN = /(?: |\u00a0|\u2007|&nbsp;|&#160;|&#xa0;|&#8199;|&#x2007;|&numsp;)+/gi;
  var HAS_NB = /\u00a0|\u2007|&nbsp;|&#160;|&#xa0;|&#8199;|&#x2007;|&numsp;/i;
  var headingText = (text) => String(text).replace(SPACE_RUN, (run) => HAS_NB.test(run) ? " " : run);
  function guardNbsp(root) {
    const visit = (el, inHeading) => {
      if (!el || NBSP_SKIP_TAGS.has(el.tagName) || NBSP_BLANK.test(el.textContent || "")) return;
      const heading = inHeading || HEADING_TAGS.has(el.tagName);
      [...el.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          if (!n.nodeValue.includes("\xA0")) return;
          n.nodeValue = heading ? headingText(n.nodeValue) : n.nodeValue.replace(NBSP_ALL, NBSP_STAND_IN);
        } else if (n.nodeType === 1) visit(n, heading);
      });
    };
    visit(root, false);
    return root;
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    "name": "homepage",
    "description": "Market homepage: stage with flight search, fare teasers, offers and service teasers",
    "urls": [
      "https://www.lufthansa.com/de/en/homepage"
    ],
    "blocks": [
      {
        "name": "flash-teaser",
        "instances": [
          ".flashteasercore:has(> .dcep-flash-teaser)"
        ]
      },
      {
        "name": "flight-search",
        "instances": [
          ".redesignedflightmanager"
        ]
      },
      {
        "name": "hero-card-overlay",
        "instances": [
          ".mainstageteaser",
          ".b2b-stage"
        ]
      },
      {
        "name": "fare-teaser",
        "instances": [
          ".fareteaserstatic"
        ]
      },
      {
        "name": "cards-icon-text",
        "instances": [
          ".b2b-iconmodules"
        ]
      },
      {
        "name": "carousel-cards",
        "instances": [
          ".carousel"
        ]
      },
      {
        "name": "destination-finder",
        "instances": [
          ".fareteaserdynamicevo"
        ]
      },
      {
        "name": "cards-icon",
        "instances": [
          ".teaserwrapper"
        ]
      },
      {
        "name": "columns-logos",
        "instances": [
          ".twocolumn"
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
        "name": "Flight search",
        "selector": [
          ".container-content > .section:has(.redesignedflightmanager)"
        ],
        "style": null,
        "blocks": [
          "flight-search"
        ],
        "defaultContent": []
      },
      {
        "id": "section-2",
        "name": "Main stage teaser",
        "selector": [
          ".container-content > .section:has(.mainstageteaser)"
        ],
        "style": null,
        "blocks": [
          "hero-card-overlay"
        ],
        "defaultContent": []
      },
      {
        "id": "section-3",
        "name": "Winter deals fare teaser",
        "selector": [
          ".container-content > .section:has(.fareteaserstatic)"
        ],
        "style": null,
        "blocks": [
          "fare-teaser"
        ],
        "defaultContent": [
          ".container-content > .section:has(.fareteaserstatic) maui-headline"
        ]
      },
      {
        "id": "section-4",
        "name": "Current topics and news",
        "selector": [
          ".container-content > .section:has(.carousel)"
        ],
        "style": null,
        "blocks": [
          "carousel-cards"
        ],
        "defaultContent": [
          ".container-content > .section:has(.carousel) h2.headline:not(.sr-only)"
        ]
      },
      {
        "id": "section-5",
        "name": "Flight offers from (destination finder)",
        "selector": [
          ".container-content > .section:has(.fareteaserdynamicevo)"
        ],
        "style": null,
        "blocks": [
          "destination-finder"
        ],
        "defaultContent": []
      },
      {
        "id": "section-6",
        "name": "Looking for more than just a flight?",
        "selector": [
          ".container-content > .section:has(.teaserwrapper)"
        ],
        "style": null,
        "blocks": [
          "cards-icon"
        ],
        "defaultContent": [
          ".container-content > .section:has(.teaserwrapper) h2.headline:not(.sr-only)"
        ]
      },
      {
        "id": "section-7",
        "name": "Payment options and Follow us",
        "selector": [
          ".container-content > .section:has(.twocolumn)"
        ],
        "style": null,
        "blocks": [
          "columns-logos"
        ],
        "defaultContent": []
      },
      {
        "id": "section-8",
        "name": "Popular destinations",
        "selector": [
          ".container-content > .section:has(.accordion)"
        ],
        "style": null,
        "blocks": [
          "accordion-columns"
        ],
        "defaultContent": []
      }
    ]
  };
  var parsers = {
    "flash-teaser": parse,
    "flight-search": parse2,
    "hero-card-overlay": parse3,
    "fare-teaser": parse4,
    "cards-icon-text": parse5,
    "carousel-cards": parse6,
    "destination-finder": parse7,
    "cards-icon": parse8,
    "columns-logos": parse9,
    "accordion-columns": parse10
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
  var tmp_bundle_homepage_450922_default = {
    // before helix-importer's preprocessing (which drops empty paragraphs): the transformers' onLoad
    onLoad: ({ document }) => {
      executeTransformers("onLoad", document.body, { document });
      guardNbsp(document.body);
    },
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
      try {
        collapseMain(main, { path, brand: brandOfHost(new URL(params.originalURL).hostname), document });
      } catch (e) {
        console.error("marker-collapse failed:", e);
      }
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(tmp_bundle_homepage_450922_exports);
})();
