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

  // tools/importer/import-flight-status.js
  var tmp_bundle_flight_status_157291_exports = {};
  __export(tmp_bundle_flight_status_157291_exports, {
    default: () => tmp_bundle_flight_status_157291_default
  });

  // tools/importer/parsers/flight-status.js
  function parse(element, { document }) {
    const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style';
    const clean = (s) => (s || "").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const c = node.cloneNode(true);
      c.querySelectorAll(SKIP).forEach((n) => n.remove());
      return clean(c.textContent);
    };
    const attr = (el, n) => clean(el && el.getAttribute(n));
    const before = [];
    const headline = element.querySelector("maui-headline, h1, h2");
    if (headline && visibleText(headline)) {
      const type = (attr(headline, "type") || headline.tagName).toLowerCase();
      const h = document.createElement(/^h[1-6]$/.test(type) ? type : "h1");
      h.textContent = visibleText(headline);
      before.push(h);
    }
    const cells = [];
    const panels = [...element.querySelectorAll('maui-tab-control-panel, maui-tab-control-panel-responsive, [role="tabpanel"]')].filter((p) => !p.parentElement.closest('maui-tab-control-panel, maui-tab-control-panel-responsive, [role="tabpanel"]'));
    const names = panels.map((p) => attr(p, "name") || attr(p, "label")).filter(Boolean);
    if (names.length) cells.push(["Tabs", names.join(", ")]);
    const control = element.querySelector("maui-tab-control, maui-tab-control-responsive");
    const initial = parseInt(attr(control, "initiallyactive"), 10);
    const activePanel = panels.find((p) => p.hasAttribute("active")) || (Number.isInteger(initial) ? panels[initial] : null);
    if (activePanel && (attr(activePanel, "name") || attr(activePanel, "label"))) {
      cells.push(["Active tab", attr(activePanel, "name") || attr(activePanel, "label")]);
    }
    const selects = [...element.querySelectorAll("maui-select, select")];
    const optionValues = (s) => [...s.querySelectorAll("maui-option, option")].map((o) => attr(o, "optionvalue") || attr(o, "value") || visibleText(o)).filter(Boolean);
    const isDateSelect = (s) => {
      const v = optionValues(s);
      return v.length > 0 && v.every((x) => /^\d{4}-\d{2}-\d{2}/.test(x));
    };
    const airlineSelect = selects.find((s) => {
      const v = optionValues(s);
      return v.length > 0 && v.every((x) => /^[A-Z0-9]{2}$/.test(x));
    });
    const dateSelect = selects.find(isDateSelect);
    if (airlineSelect) {
      if (attr(airlineSelect, "buttontriggerlabel")) cells.push(["Airline label", attr(airlineSelect, "buttontriggerlabel")]);
      cells.push(["Airlines", optionValues(airlineSelect).join(", ")]);
      const selectedOpt = airlineSelect.querySelector("maui-option[selected], option[selected]");
      const def = attr(airlineSelect, "selected") || selectedOpt && (attr(selectedOpt, "optionvalue") || attr(selectedOpt, "value"));
      if (def) cells.push(["Default airline", def]);
    }
    const numberInput = [...element.querySelectorAll('maui-input, input[type="text"], input:not([type])')].find((i) => /flight-?number/i.test(`${i.getAttribute("id") || ""} ${i.getAttribute("name") || ""}`)) || element.querySelector(".flightstatus-form-flightnumber maui-input, .flightstatus-form-flightnumber input");
    if (numberInput) {
      const label = attr(numberInput, "label") || attr(numberInput, "placeholder");
      if (label) cells.push(["Flight number label", label]);
      if (attr(numberInput, "errormessage")) cells.push(["Flight number error", attr(numberInput, "errormessage")]);
    }
    if (dateSelect) {
      if (attr(dateSelect, "buttontriggerlabel")) cells.push(["Date label", attr(dateSelect, "buttontriggerlabel")]);
      if (attr(dateSelect, "hint")) cells.push(["Date hint", attr(dateSelect, "hint")]);
      const values = optionValues(dateSelect);
      const selected = attr(dateSelect, "selected") || attr(dateSelect.querySelector("maui-option[selected], option[selected]"), "optionvalue");
      const idx = values.indexOf(selected);
      if (idx >= 0) {
        cells.push(["Days before", String(idx)]);
        cells.push(["Days after", String(values.length - 1 - idx)]);
      }
    }
    const submit = element.querySelector('maui-button[behavior="submit"], maui-button[type="primary"], button[type="submit"]');
    if (submit && visibleText(submit)) cells.push(["Submit label", visibleText(submit)]);
    const block = WebImporter.Blocks.createBlock(document, { name: "flight-status", cells });
    element.replaceWith(...before, block);
  }

  // tools/importer/parsers/columns-media.js
  function parse2(element, { document }) {
    const BLOCK_TAGS = /^(P|UL|OL|H[1-6]|TABLE|DIV|BLOCKQUOTE|PRE|DL)$/;
    const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style, noscript';
    const SKIP_COMPONENTS = '.separator, .sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], .swiper-pagination, .swiper-button-prev, .swiper-button-next, .swiper-notification, .swiper-slide-duplicate, script, style, noscript';
    const MOBILE = ".hidden-lg-up, .hidden-md-up, .d-md-none, .d-lg-none";
    const DESKTOP = ".hidden-md-down, .hidden-sm-down, .d-none.d-md-block, .d-none.d-lg-block";
    const clean = (s) => (s || "").replace(/[​-‍﻿]/g, "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const c = node.cloneNode(true);
      c.querySelectorAll(SKIP).forEach((n) => n.remove());
      return clean(c.textContent);
    };
    const isBroken2 = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src) || /^(data|blob):/i.test(src);
    const isBr2 = (n) => n && n.nodeType === 1 && n.tagName === "BR";
    const isBlank = (n) => n && n.nodeType === 3 && !clean(n.nodeValue);
    const trimBreaks = (el) => {
      while (el.lastChild && (isBr2(el.lastChild) || isBlank(el.lastChild))) el.lastChild.remove();
      while (el.firstChild && (isBr2(el.firstChild) || isBlank(el.firstChild))) el.firstChild.remove();
    };
    const tidy = (el) => {
      el.querySelectorAll(SKIP).forEach((s) => s.remove());
      el.querySelectorAll("em, i, span").forEach((s) => {
        if ([...s.classList].some((c) => /^lh(-|$)/.test(c)) && !clean(s.textContent) && !s.querySelector("img")) s.remove();
      });
      const keep = [...el.classList].filter((c) => /^(copytext-(small|medium|large)|footnote)$/.test(c));
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
      }).filter((np) => clean(np.textContent) || np.querySelector("img"));
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
          if (clean(c.textContent) || c.querySelector("img")) out.push(c);
          return;
        }
        if (isBlank(n) && !run) return;
        if (!run) run = document.createElement("p");
        run.append(n.cloneNode(true));
      });
      flush();
      return out;
    };
    const MAUI = "maui-navigation-link[href], maui-button-link[href], maui-link[href], a[href]";
    const linkPara = (scope) => {
      const m = scope.querySelector(MAUI);
      if (!m) return null;
      const label = visibleText(m) || clean(m.getAttribute("label") || m.getAttribute("aria-label"));
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
    const videoPara = (src, label, settings) => {
      const a = document.createElement("a");
      a.setAttribute("href", src);
      a.textContent = label || src;
      const p = document.createElement("p");
      p.append(a);
      if (settings.length) p.append(` {${settings.join(" ")}}`);
      return p;
    };
    const viewerNodes = (comp) => {
      const host = comp.querySelector("[data-dcep]");
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
      if (poster && !isBroken2(poster)) {
        const img = document.createElement("img");
        img.setAttribute("src", poster);
        img.setAttribute("alt", clean(cfg.alternativeText));
        out.push(img);
      }
      const settings = [];
      if (cfg.autoplay === true || cfg.autoplay === "true") settings.push("autoplay", "muted");
      settings.push("controls", "round-play-button");
      out.push(videoPara(src, clean(cfg.alternativeText), settings));
      return out;
    };
    const mediaNodes = (comp) => {
      const out = [];
      const img = [...comp.querySelectorAll("img")].find((i) => !isBroken2(i.getAttribute("src")) && !i.closest(SKIP_COMPONENTS));
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
        const button = comp.querySelector('[aria-label].moving-image-play-button, .on-image-button[aria-label], [role="button"][aria-label]');
        const settings = button ? [] : ["autoplay", "muted"];
        if (!button && video.hasAttribute("loop")) settings.push("loop");
        if (video.hasAttribute("controls")) settings.push("controls");
        out.push(videoPara(src, clean(button && button.getAttribute("aria-label")), settings));
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
        } else if (cl.contains("videoViewer")) {
          out.push(...viewerNodes(child));
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
      const media = element.classList.contains("videoViewer") ? viewerNodes(element) : mediaNodes(element);
      if (!media.some((n) => n.tagName === "P")) return;
      element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "columns-media", cells: [[media]] }));
      return;
    }
    const floated = element.matches("p") && element.querySelector('img[style*="float"]');
    if (floated) {
      const right = /float:\s*right/i.test(floated.getAttribute("style") || "");
      const pct = parseInt(floated.getAttribute("width") || "", 10);
      const media = [];
      if (!isBroken2(floated.getAttribute("src"))) {
        const img = document.createElement("img");
        img.setAttribute("src", floated.getAttribute("src"));
        img.setAttribute("alt", floated.getAttribute("alt") || "");
        media.push(img);
      }
      const isStop = (el) => !el || !/^(P|UL|OL)$/.test(el.tagName) || el.querySelector('img[style*="float"]') || !clean(el.textContent) && !el.querySelector("img");
      const text = [];
      for (let n = element.nextElementSibling; !isStop(n); n = element.nextElementSibling) {
        n.remove();
        n.querySelectorAll("a.btn-primary[href], a.btn-secondary[href]").forEach((a) => {
          if (a.closest("strong, em, b, i")) return;
          const wrap = document.createElement(a.classList.contains("btn-primary") ? "strong" : "em");
          a.replaceWith(wrap);
          wrap.append(a);
        });
        text.push(n);
      }
      if (!media.length || !text.length) {
        text.reverse().forEach((n) => element.after(n));
        return;
      }
      const floatBlock = WebImporter.Blocks.createBlock(document, {
        name: "columns-media",
        variants: pct > 0 && pct < 100 ? [`ratio-${pct}`] : [],
        cells: [right ? [text, media] : [media, text]]
      });
      element.replaceWith(floatBlock);
      return;
    }
    const articles = [...element.querySelectorAll(".blog-article-container")];
    if (element.classList.contains("blogoverview") && articles.length) {
      const rows = articles.map((art, i) => {
        const media = [];
        const img = [...art.querySelectorAll(".blog-article-image img")].find((x) => !isBroken2(x.getAttribute("src")));
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
        const tags = [...art.querySelectorAll("maui-chip[label]")].map((c) => clean(c.getAttribute("label"))).filter(Boolean);
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
      const row = items.map((it) => finishCell(collect(it, []))).filter((c) => c.length);
      if (row.length) cells.push(row);
      const sliderView = items.some((it) => [...it.querySelectorAll(".column-view > .carousel")].some((c) => c.querySelectorAll(".hidden-md-down .image img").length > 1));
      if (sliderView) variants.push("slider");
    }
    if (!cells.length && !titles.length) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-media", variants, cells });
    const headerText = (t) => clean((t.querySelector("tr") || t).textContent).toLowerCase();
    const previousSameBlock = () => {
      const name = headerText(block);
      const before = [...document.querySelectorAll("table")].filter((t) => !element.contains(t) && t.compareDocumentPosition(element) & 4 && headerText(t) === name);
      const prev = before[before.length - 1];
      if (!prev) return null;
      const range = document.createRange();
      range.setStartAfter(prev);
      range.setEndBefore(element);
      const between = range.cloneContents();
      if (clean(between.textContent)) return null;
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
    element.replaceWith(...titles, block);
  }

  // tools/importer/parsers/accordion-columns.js
  function parse3(element, { document }) {
    const SR_ONLY2 = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"]';
    const ZW = /[​-‍﻿]/g;
    const clean = (s) => (s || "").replace(ZW, "").replace(/\s+/g, " ").trim();
    const visibleText = (node) => {
      if (!node) return "";
      const clone = node.cloneNode(true);
      clone.querySelectorAll(SR_ONLY2).forEach((n) => n.remove());
      return clean(clone.textContent);
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
            const a = li.querySelector("a[href]");
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
          const onlyLinks = links.length && !clean(clone.textContent);
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
              node.textContent = node.textContent.replace(ZW, "");
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
        part.querySelectorAll("h1, h2, h3, h4, h5, h6, .richtext, ul, ol, maui-navigation-link[href], maui-link[href], maui-button-link[href]").forEach((node) => {
          if (node.parentElement && node.parentElement.closest(".richtext, ul, ol") && part.contains(node.parentElement.closest(".richtext, ul, ol"))) return;
          if (/^H[1-6]$/.test(node.tagName)) {
            const text = visibleText(node);
            if (!text) return;
            const h = document.createElement(columns.length ? "h3" : node.tagName);
            h.textContent = text;
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
    const AIRCORE_ICONS = { "2qb66p": "document", "4b3rr0": "currency" };
    const ICON_BY_TITLE = [
      ["document", /document|dokument|papier|visa|einreise|entry/i],
      ["currency", /currenc|währung|waehrung|devise|monnaie|valuta|moneda|divisa|moeda/i]
    ];
    const fingerprint = (s) => {
      let x = 5381;
      for (let i = 0; i < s.length; i += 1) x = (x * 33 ^ s.charCodeAt(i)) >>> 0;
      return x.toString(36);
    };
    const blobToDataUri = (url) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
        xhr.send();
        if (xhr.status && xhr.status !== 200) return "";
        const raw = xhr.responseText;
        let bin = "";
        for (let i = 0; i < raw.length; i += 1) bin += String.fromCharCode(raw.charCodeAt(i) & 255);
        const type = (xhr.getResponseHeader("Content-Type") || "image/svg+xml").split(";")[0];
        return `data:${type};base64,${btoa(bin)}`;
      } catch (e) {
        return "";
      }
    };
    const iconName = (src, title) => {
      const inline = /^(data|blob):/i.test(src);
      if (!inline) {
        return /\.svg/i.test(src) ? src.split("?")[0].split("/").pop().replace(/\.svg$/i, "").toLowerCase() : "";
      }
      const dataUri = src.startsWith("blob:") ? blobToDataUri(src) : src;
      const known = dataUri && AIRCORE_ICONS[fingerprint(dataUri)];
      if (known) return known;
      const byTitle = ICON_BY_TITLE.find(([, re]) => re.test(title));
      return byTitle ? byTitle[0] : "";
    };
    const aircoreItems = [...element.querySelectorAll(":scope > div")].filter((d) => d.querySelector(":scope > .accordion-header"));
    if (aircoreItems.length) {
      const rows = [];
      aircoreItems.forEach((item) => {
        const header = item.querySelector(":scope > .accordion-header");
        const label = header.querySelector("button > span") || header;
        const titleCell = [];
        const icon = label.querySelector("img");
        const iconSrc = icon && icon.getAttribute("src");
        const title = visibleText(label);
        if (iconSrc) {
          const name = iconName(iconSrc, title);
          if (name) {
            titleCell.push(`:${name}: `);
          } else if (!/^(data|blob):/i.test(iconSrc)) {
            const img = document.createElement("img");
            img.src = iconSrc;
            img.alt = clean(icon.getAttribute("alt"));
            titleCell.push(img, " ");
          }
        }
        if (title) titleCell.push(title);
        const panel = item.querySelector(".accordion-panel .inner") || item.querySelector(".accordion-panel");
        let content = [];
        if (panel) {
          const hasBlocks = [...panel.children].some((c) => /^(P|DIV|UL|OL|H[1-6])$/.test(c.tagName));
          if (hasBlocks) {
            content = convertRichText(panel);
          } else {
            const wrap = document.createElement("div");
            const p = document.createElement("p");
            p.innerHTML = panel.innerHTML;
            wrap.append(p);
            content = convertRichText(wrap);
          }
        }
        if (!title && !content.length) return;
        rows.push([titleCell.length ? titleCell : "", content.length ? content : ""]);
      });
      const aircoreBlock = WebImporter.Blocks.createBlock(document, { name: "accordion-columns", cells: rows });
      element.replaceWith(aircoreBlock);
      return;
    }
    let items = [...element.querySelectorAll("maui-collapsible-item")];
    if (!items.length) items = [...element.querySelectorAll(".accordionitem")];
    const options = [];
    if (items.length && !items.some((item) => item.querySelector(".column-view-item"))) options.push("faq");
    if (element.closest("maui-limited-width") || element.querySelector("maui-limited-width maui-collapsible, maui-limited-width .accordionitem")) options.push("limited-width");
    if (element.parentElement && element.parentElement.closest(".column-view-item")) options.push("spaced");
    const blockName = options.length ? `accordion-columns (${options.join(", ")})` : "accordion-columns";
    const cells = [];
    items.forEach((item) => {
      const title = clean(item.getAttribute("headline")) || visibleText(item.querySelector('[slot="headline"], .accordion-headline, summary, h2, h3'));
      const content = convertPanel(item);
      if (!title && !content.length) return;
      cells.push([title, content.length ? content : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: blockName, cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/lufthansa-cleanup.js
  var SCOPE_PATHS = /* @__PURE__ */ new Set(["/at/de/100-years", "/at/de/100-years/cabin-design", "/at/de/100-years/campaigns", "/at/de/100-years/chronicle", "/at/de/100-years/crane", "/at/de/100-years/destinations", "/at/de/100-years/fleet", "/at/de/100-years/global-network", "/at/de/100-years/history", "/at/de/100-years/history/menu-on-board", "/at/de/320", "/at/de/32n", "/at/de/359", "/at/de/744", "/at/de/accessible-travel", "/at/de/additional-services", "/at/de/admission-rules", "/at/de/adressen-weltweit", "/at/de/advance-seat-reservation", "/at/de/advice-for-travellers-with-special-needs-to-and-from-the-usa", "/at/de/affiliatemarketing", "/at/de/all-check-in", "/at/de/alleinreisende-kinder", "/at/de/anmeldung-tiere-frachtraum", "/at/de/arrival-services", "/at/de/articles/authors/florian-tomberg", "/at/de/articles/explore-flying", "/at/de/articles/explore-flying/7-people-who-shaped-lufthansa-history", "/at/de/articles/explore-flying/anniversary-super-crane-special", "/at/de/articles/explore-flying/essentials-future-of-flying", "/at/de/articles/explore-flying/flying-high-christoph-quarch", "/at/de/articles/explore-flying/inflight-entertainment-vr-experience", "/at/de/articles/explore-the-world", "/at/de/articles/explore-the-world/a-perfect-day-barcelona-in-one-day", "/at/de/articles/explore-the-world/a-perfect-day-berlin-in-one-day", "/at/de/articles/explore-the-world/be-picky-barcelona-insider-tips", "/at/de/articles/explore-the-world/be-picky-frankfurt-insider-tips", "/at/de/articles/explore-the-world/eat-see-do-algiers", "/at/de/articles/explore-the-world/eat-see-do-berlin", "/at/de/articles/explore-the-world/essentials-barcelona-facts", "/at/de/articles/explore-the-world/essentials-frankfurt-facts", "/at/de/articles/explore-the-world/in-my-hood-chiswick-london", "/at/de/articles/explore-the-world/in-my-hood-district-zurich", "/at/de/articles/explore-the-world/know-before-you-go-algiers", "/at/de/articles/explore-the-world/know-before-you-go-berlin", "/at/de/articles/explore-the-world/on-the-scene-caspar-plautz-munich", "/at/de/articles/explore-the-world/on-the-scene-food-trends-istanbul", "/at/de/articles/explore-the-world/picture-perfect-austin", "/at/de/articles/explore-the-world/stop-over-tokyo", "/at/de/articles/explore-the-world/what-i-learned-living-in-barcelona", "/at/de/articles/explore-the-world/what-i-learned-living-in-frankfurt", "/at/de/articles/highlights", "/at/de/articles/highlights/all-it-takes-is-a-yes", "/at/de/articles/highlights/allegris-premium-economy-san-diego", "/at/de/articles/tags", "/at/de/articles/tags/allegris", "/at/de/articles/tags/munich", "/at/de/assistenzhunde", "/at/de/automatic-check-in", "/at/de/baggage-irregularities", "/at/de/bedeutsamste-strecken", "/at/de/befoerderungsbedingungen-group", "/at/de/befoerderungsbedingungen-lh", "/at/de/besondere-befoerderungsbedingungen-bus", "/at/de/betreuungsbedarf", "/at/de/bid-upgrade", "/at/de/boarding", "/at/de/boeing787", "/at/de/book-and-manage/additional-services/get-your-guide", "/at/de/book-and-manage/additional-services/travel-insurances", "/at/de/book-and-manage/booking-services/manage-my-bookings", "/at/de/book-and-manage/cancellation-and-refund/refund/refund-form", "/at/de/book-and-manage/digital-self-services/airline-apps", "/at/de/book-and-manage/flights/air-baltic", "/at/de/book-and-manage/flights/ana", "/at/de/book-and-manage/flights/ana/faq", "/at/de/book-and-manage/flights/giftvoucher", "/at/de/book-and-manage/flights/helvetic", "/at/de/book-and-manage/flights/lufthansa-voucher", "/at/de/book-and-manage/flights/wetlease-hub", "/at/de/book-and-manage/pax-receipt", "/at/de/book-and-manage/pax-receipt/invoices-different-countries", "/at/de/book-and-manage/rebook", "/at/de/book-and-manage/rebook/involuntary-rebooking", "/at/de/book-and-manage/rebook/voluntary-rebooking", "/at/de/book-and-manage/stopover", "/at/de/book-and-manage/stopover/bayerischer-hof", "/at/de/book-and-manage/stopover/neuschwanstein", "/at/de/book-and-manage/stopover/zugspitze", "/at/de/business-class", "/at/de/business-class-auf-kurz-und-mittelstrecken", "/at/de/business-services", "/at/de/cancellations-and-refunds", "/at/de/cash-and-miles", "/at/de/check-in-baggage", "/at/de/common", "/at/de/common/accessibility-statement", "/at/de/common/agb-extra-services-at-online-check-in", "/at/de/common/agb-extra-services-at-online-check-in/conditions-seat-reservation", "/at/de/common/compensation-voucher", "/at/de/common/imprint/lufthansa-insights-imprint", "/at/de/common/privacy-statement/privacy-statement-group", "/at/de/common/seatreservation-condtions/seat-reservations", "/at/de/cookie-policy", "/at/de/culinaryjourney", "/at/de/dangerous-dogs", "/at/de/datenerfassung-fuer-die-usa", "/at/de/datenerfassung-fuer-kanada", "/at/de/datenschutz", "/at/de/digital-self-services", "/at/de/digital-travel-companion", "/at/de/digitale-gepaeckservices", "/at/de/discover-lufthansa/carbon-offsetting/climate-protection-projects", "/at/de/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge", "/at/de/discover-lufthansa/carbon-offsetting/faq-saf", "/at/de/discover-lufthansa/carbon-offsetting/saf", "/at/de/discover-lufthansa/flightreservation-priceguarantee", "/at/de/discover-lufthansa/lufthansa-fleet/351", "/at/de/discover-lufthansa/lufthansa-group-airlines/ita-airways", "/at/de/discover-lufthansa/miles-and-more-credit-card", "/at/de/discover-lufthansa/new-onboard-experience", "/at/de/discover-lufthansa/take-off", "/at/de/doctor-on-board", "/at/de/doctor-on-board-news", "/at/de/during-your-trip/internet-overview", "/at/de/during-your-trip/lhg-wifi", "/at/de/economy-class", "/at/de/electronic-bag-tags", "/at/de/entryprocesses", "/at/de/europa-tarife-economy-class", "/at/de/europcar", "/at/de/exclusive-charter", "/at/de/faq-data-security", "/at/de/faq-ejournals", "/at/de/faq-password-security", "/at/de/farealert/best-price-alert", "/at/de/feedback", "/at/de/feedback-past-flight", "/at/de/feedback/feedbackai", "/at/de/fia-valet-service", "/at/de/first-class", "/at/de/first-class-lounges", "/at/de/first-class-personal-assistant", "/at/de/first-class-terminal", "/at/de/first-class-valet-parking-service", "/at/de/fliegen-mit-baby", "/at/de/fliegen-mit-kindern", "/at/de/fliegen-mit-kleinkind", "/at/de/fluege", "/at/de/flughafeninformation", "/at/de/flugplan-und-flugstatus", "/at/de/flugsuche", "/at/de/flugunregelmaessigkeiten", "/at/de/flynet", "/at/de/fmg-valet-parking-service", "/at/de/frankfurt-fair", "/at/de/free2move", "/at/de/freigepaeck-regeln", "/at/de/gefaehrliche-gegenstaende", "/at/de/gepaeck", "/at/de/geschaeftsbedingungen", "/at/de/gesund-reisen", "/at/de/green-fare", "/at/de/group-travel", "/at/de/gruppenreisen-und-charter", "/at/de/handgepaeck", "/at/de/hertz", "/at/de/homepage", "/at/de/hotelangebote", "/at/de/impressum", "/at/de/informationen-zum-datenschutz", "/at/de/kinder-an-bord", "/at/de/kindermenues-an-bord", "/at/de/lounge-begleitung", "/at/de/lounges", "/at/de/lufthansa-am-flughafen-duesseldorf", "/at/de/lufthansa-am-flughafen-frankfurt", "/at/de/lufthansa-am-flughafen-wien", "/at/de/lufthansa-at-berlin-airport", "/at/de/lufthansa-at-zuerich-airport", "/at/de/lufthansa-aviation-group", "/at/de/lufthansa-business-class-on-long-haul-routes", "/at/de/lufthansa-city/culinaryjourney", "/at/de/lufthansa-city/menu-card", "/at/de/lufthansa-express", "/at/de/lufthansa-express-bus", "/at/de/lufthansa-express-rail", "/at/de/lufthansa-firmenkunden", "/at/de/lufthansa-first-class-entertainment", "/at/de/lufthansa-first-class-flotte", "/at/de/lufthansa-first-class-komfort", "/at/de/lufthansa-group-star-alliance-and-partner-airlines", "/at/de/lufthansa-guide-service", "/at/de/lufthansa-reiseklassen", "/at/de/lufthansa-terminal-muenchen", "/at/de/medikamenten-transport", "/at/de/meetings-and-events", "/at/de/meetings-und-events-individuelle-angebotsanfrage", "/at/de/meetings-und-events-teilnehmer", "/at/de/mein-logbuch", "/at/de/meine-buchungen", "/at/de/menues-auf-langstreckenfluegen", "/at/de/menues-reiseklassen", "/at/de/mietwagenangebote", "/at/de/miles-and-more", "/at/de/mit-kindern-am-flughafen", "/at/de/mobility-partner-program-healthcare", "/at/de/munich-fair", "/at/de/nachhaltiger-fliegen", "/at/de/nutzungsbedingungen", "/at/de/nutzungsbedingungen-waehrungsumrechnung", "/at/de/onboard-delights", "/at/de/onboard-delights-faq", "/at/de/online-check-in", "/at/de/online-check-in-info", "/at/de/online-check-in-mit-der-ganzen-familie", "/at/de/overview-flights", "/at/de/overview-manage", "/at/de/overview-special-request", "/at/de/overview-travel-information", "/at/de/partner", "/at/de/passenger-receipt-90", "/at/de/passenger-rights", "/at/de/passengers-using-wheelchairs", "/at/de/passengers-with-sensory-impairment", "/at/de/pre-check-in", "/at/de/premium-economy-class", "/at/de/prepare-for-your-trip/baggage/baggage-conditions", "/at/de/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg", "/at/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay", "/at/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage", "/at/de/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage", "/at/de/prepare-for-your-trip/baggage/electronic-devices-and-batteries", "/at/de/prepare-for-your-trip/baggage/sport-baggage/register-ammunition", "/at/de/prepare-for-your-trip/current-travel-information", "/at/de/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system", "/at/de/prepare-for-your-trip/entry-regulations/immigration-regulations-uk", "/at/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing", "/at/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing", "/at/de/prepare-for-your-trip/special-travel-needs/medical-travel-companions", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion", "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment", "/at/de/prepare-for-your-trip/travel-classes/economy-basic", "/at/de/prepare-for-your-trip/travelling-with-children/child-in-businessclass", "/at/de/prepare-for-your-trip/travelling-with-children/planning-with-kids", "/at/de/rail-and-fly", "/at/de/rail-fly-bedingungen", "/at/de/rechnungsbeleg", "/at/de/refund", "/at/de/register-animal-cabin", "/at/de/reisebueros", "/at/de/reisen-mit-besonderen-anforderungen", "/at/de/rollstuhlbatterien", "/at/de/schengen", "/at/de/secure-flight", "/at/de/security-fast-lanes", "/at/de/sepa-bedingungen", "/at/de/sepa-bedingungen-b", "/at/de/services-am-flughafen", "/at/de/services-am-flughafen-frankfurt", "/at/de/services-am-flughafen-muenchen", "/at/de/services-an-bord", "/at/de/shopping", "/at/de/sicherheit-fuer-kleinkinder-an-bord", "/at/de/sitzplaene", "/at/de/sitzplatzreservierungen-konditionen", "/at/de/sixt", "/at/de/sondermahlzeiten", "/at/de/speisen-und-getraenke", "/at/de/sportgepaeck", "/at/de/sportgepaeck-hinzufuegen", "/at/de/support/contact/passenger-duty-united-kingdom", "/at/de/support/feedback-and-contact-airlines", "/at/de/tiere-als-handgepaeck", "/at/de/tiere-als-uebergepaeck", "/at/de/tips-senior-travellers", "/at/de/travel-expense-management", "/at/de/travel-id-terms-conditions", "/at/de/travelling-with-animals", "/at/de/traveltricks", "/at/de/uebergepaeck", "/at/de/unterhaltung-an-bord", "/at/de/upgrade-business-class-langstrecke", "/at/de/upgrade-first-class", "/at/de/upgrade-in-die-business-class", "/at/de/upgrade-in-die-premium-economy-class", "/at/de/upgrade-informationen", "/at/de/upgrade-premium-economy-class", "/at/de/upgrademoeglichkeiten", "/at/de/upgrades-im-online-check-in", "/at/de/zahlungsmoeglichkeiten-am-flughafen", "/at/de/zeitfenster-sicherheitskontrolle", "/de/de/100-years", "/de/de/100-years/cabin-design", "/de/de/100-years/campaigns", "/de/de/100-years/chronicle", "/de/de/100-years/crane", "/de/de/100-years/destinations", "/de/de/100-years/fleet", "/de/de/100-years/global-network", "/de/de/100-years/history", "/de/de/100-years/history/menu-on-board", "/de/de/320", "/de/de/32n", "/de/de/359", "/de/de/744", "/de/de/accessible-travel", "/de/de/additional-services", "/de/de/admission-rules", "/de/de/adressen-weltweit", "/de/de/advance-seat-reservation", "/de/de/advice-for-travellers-with-special-needs-to-and-from-the-usa", "/de/de/affiliatemarketing", "/de/de/all-check-in", "/de/de/alleinreisende-kinder", "/de/de/anmeldung-tiere-frachtraum", "/de/de/arrival-services", "/de/de/articles/authors/florian-tomberg", "/de/de/articles/explore-flying", "/de/de/articles/explore-flying/7-people-who-shaped-lufthansa-history", "/de/de/articles/explore-flying/anniversary-super-crane-special", "/de/de/articles/explore-flying/essentials-future-of-flying", "/de/de/articles/explore-flying/flying-high-christoph-quarch", "/de/de/articles/explore-flying/inflight-entertainment-vr-experience", "/de/de/articles/explore-the-world", "/de/de/articles/explore-the-world/a-perfect-day-barcelona-in-one-day", "/de/de/articles/explore-the-world/a-perfect-day-berlin-in-one-day", "/de/de/articles/explore-the-world/be-picky-barcelona-insider-tips", "/de/de/articles/explore-the-world/be-picky-frankfurt-insider-tips", "/de/de/articles/explore-the-world/eat-see-do-algiers", "/de/de/articles/explore-the-world/eat-see-do-berlin", "/de/de/articles/explore-the-world/essentials-barcelona-facts", "/de/de/articles/explore-the-world/essentials-frankfurt-facts", "/de/de/articles/explore-the-world/in-my-hood-chiswick-london", "/de/de/articles/explore-the-world/in-my-hood-district-zurich", "/de/de/articles/explore-the-world/know-before-you-go-algiers", "/de/de/articles/explore-the-world/know-before-you-go-berlin", "/de/de/articles/explore-the-world/on-the-scene-caspar-plautz-munich", "/de/de/articles/explore-the-world/on-the-scene-food-trends-istanbul", "/de/de/articles/explore-the-world/picture-perfect-austin", "/de/de/articles/explore-the-world/stop-over-tokyo", "/de/de/articles/explore-the-world/what-i-learned-living-in-barcelona", "/de/de/articles/explore-the-world/what-i-learned-living-in-frankfurt", "/de/de/articles/highlights", "/de/de/articles/highlights/all-it-takes-is-a-yes", "/de/de/articles/highlights/allegris-premium-economy-san-diego", "/de/de/articles/tags", "/de/de/articles/tags/allegris", "/de/de/articles/tags/munich", "/de/de/assistenzhunde", "/de/de/automatic-check-in", "/de/de/baggage-irregularities", "/de/de/bedeutsamste-strecken", "/de/de/befoerderungsbedingungen-group", "/de/de/befoerderungsbedingungen-lh", "/de/de/besondere-befoerderungsbedingungen-bus", "/de/de/betreuungsbedarf", "/de/de/bid-upgrade", "/de/de/boarding", "/de/de/boeing787", "/de/de/book-and-manage/additional-services/get-your-guide", "/de/de/book-and-manage/additional-services/travel-insurances", "/de/de/book-and-manage/booking-services/manage-my-bookings", "/de/de/book-and-manage/cancellation-and-refund/refund/refund-form", "/de/de/book-and-manage/digital-self-services/airline-apps", "/de/de/book-and-manage/flights/air-baltic", "/de/de/book-and-manage/flights/ana", "/de/de/book-and-manage/flights/ana/faq", "/de/de/book-and-manage/flights/giftvoucher", "/de/de/book-and-manage/flights/helvetic", "/de/de/book-and-manage/flights/lufthansa-voucher", "/de/de/book-and-manage/flights/wetlease-hub", "/de/de/book-and-manage/pax-receipt", "/de/de/book-and-manage/pax-receipt/invoices-different-countries", "/de/de/book-and-manage/rebook", "/de/de/book-and-manage/rebook/involuntary-rebooking", "/de/de/book-and-manage/rebook/voluntary-rebooking", "/de/de/book-and-manage/stopover", "/de/de/book-and-manage/stopover/bayerischer-hof", "/de/de/book-and-manage/stopover/neuschwanstein", "/de/de/book-and-manage/stopover/zugspitze", "/de/de/business-class", "/de/de/business-class-auf-kurz-und-mittelstrecken", "/de/de/business-services", "/de/de/cancellations-and-refunds", "/de/de/cash-and-miles", "/de/de/check-in-baggage", "/de/de/common", "/de/de/common/accessibility-statement", "/de/de/common/agb-extra-services-at-online-check-in", "/de/de/common/agb-extra-services-at-online-check-in/conditions-seat-reservation", "/de/de/common/compensation-voucher", "/de/de/common/imprint/lufthansa-insights-imprint", "/de/de/common/privacy-statement/privacy-statement-group", "/de/de/common/seatreservation-condtions/seat-reservations", "/de/de/cookie-policy", "/de/de/culinaryjourney", "/de/de/dangerous-dogs", "/de/de/datenerfassung-fuer-die-usa", "/de/de/datenerfassung-fuer-kanada", "/de/de/datenschutz", "/de/de/digital-self-services", "/de/de/digital-travel-companion", "/de/de/digitale-gepaeckservices", "/de/de/discover-lufthansa/carbon-offsetting/climate-protection-projects", "/de/de/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge", "/de/de/discover-lufthansa/carbon-offsetting/faq-saf", "/de/de/discover-lufthansa/carbon-offsetting/saf", "/de/de/discover-lufthansa/flightreservation-priceguarantee", "/de/de/discover-lufthansa/lufthansa-fleet/351", "/de/de/discover-lufthansa/lufthansa-group-airlines/ita-airways", "/de/de/discover-lufthansa/miles-and-more-credit-card", "/de/de/discover-lufthansa/new-onboard-experience", "/de/de/discover-lufthansa/take-off", "/de/de/doctor-on-board", "/de/de/doctor-on-board-news", "/de/de/during-your-trip/internet-overview", "/de/de/during-your-trip/lhg-wifi", "/de/de/economy-class", "/de/de/electronic-bag-tags", "/de/de/entryprocesses", "/de/de/europa-tarife-economy-class", "/de/de/europcar", "/de/de/exclusive-charter", "/de/de/faq-data-security", "/de/de/faq-ejournals", "/de/de/faq-password-security", "/de/de/farealert/best-price-alert", "/de/de/feedback", "/de/de/feedback-past-flight", "/de/de/feedback/feedbackai", "/de/de/fia-valet-service", "/de/de/first-class", "/de/de/first-class-lounges", "/de/de/first-class-personal-assistant", "/de/de/first-class-terminal", "/de/de/first-class-valet-parking-service", "/de/de/fliegen-mit-baby", "/de/de/fliegen-mit-kindern", "/de/de/fliegen-mit-kleinkind", "/de/de/fluege", "/de/de/flughafeninformation", "/de/de/flugplan-und-flugstatus", "/de/de/flugsuche", "/de/de/flugunregelmaessigkeiten", "/de/de/flynet", "/de/de/fmg-valet-parking-service", "/de/de/frankfurt-fair", "/de/de/free2move", "/de/de/freigepaeck-regeln", "/de/de/gefaehrliche-gegenstaende", "/de/de/gepaeck", "/de/de/geschaeftsbedingungen", "/de/de/gesund-reisen", "/de/de/green-fare", "/de/de/group-travel", "/de/de/gruppenreisen-und-charter", "/de/de/handgepaeck", "/de/de/hertz", "/de/de/homepage", "/de/de/hotelangebote", "/de/de/impressum", "/de/de/informationen-zum-datenschutz", "/de/de/kinder-an-bord", "/de/de/kindermenues-an-bord", "/de/de/lounge-begleitung", "/de/de/lounges", "/de/de/lufthansa-am-flughafen-duesseldorf", "/de/de/lufthansa-am-flughafen-frankfurt", "/de/de/lufthansa-am-flughafen-wien", "/de/de/lufthansa-at-berlin-airport", "/de/de/lufthansa-at-zuerich-airport", "/de/de/lufthansa-aviation-group", "/de/de/lufthansa-business-class-on-long-haul-routes", "/de/de/lufthansa-city/culinaryjourney", "/de/de/lufthansa-city/menu-card", "/de/de/lufthansa-express", "/de/de/lufthansa-express-bus", "/de/de/lufthansa-express-rail", "/de/de/lufthansa-firmenkunden", "/de/de/lufthansa-first-class-entertainment", "/de/de/lufthansa-first-class-flotte", "/de/de/lufthansa-first-class-komfort", "/de/de/lufthansa-group-star-alliance-and-partner-airlines", "/de/de/lufthansa-guide-service", "/de/de/lufthansa-reiseklassen", "/de/de/lufthansa-terminal-muenchen", "/de/de/medikamenten-transport", "/de/de/meetings-and-events", "/de/de/meetings-und-events-individuelle-angebotsanfrage", "/de/de/meetings-und-events-teilnehmer", "/de/de/mein-logbuch", "/de/de/meine-buchungen", "/de/de/menues-auf-langstreckenfluegen", "/de/de/menues-reiseklassen", "/de/de/mietwagenangebote", "/de/de/miles-and-more", "/de/de/mit-kindern-am-flughafen", "/de/de/mobility-partner-program-healthcare", "/de/de/munich-fair", "/de/de/nachhaltiger-fliegen", "/de/de/nutzungsbedingungen", "/de/de/nutzungsbedingungen-waehrungsumrechnung", "/de/de/onboard-delights", "/de/de/onboard-delights-faq", "/de/de/online-check-in", "/de/de/online-check-in-info", "/de/de/online-check-in-mit-der-ganzen-familie", "/de/de/overview-flights", "/de/de/overview-manage", "/de/de/overview-special-request", "/de/de/overview-travel-information", "/de/de/partner", "/de/de/passenger-receipt-90", "/de/de/passenger-rights", "/de/de/passengers-using-wheelchairs", "/de/de/passengers-with-sensory-impairment", "/de/de/pre-check-in", "/de/de/premium-economy-class", "/de/de/prepare-for-your-trip/baggage/baggage-conditions", "/de/de/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg", "/de/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay", "/de/de/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage", "/de/de/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage", "/de/de/prepare-for-your-trip/baggage/electronic-devices-and-batteries", "/de/de/prepare-for-your-trip/baggage/sport-baggage/register-ammunition", "/de/de/prepare-for-your-trip/current-travel-information", "/de/de/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system", "/de/de/prepare-for-your-trip/entry-regulations/immigration-regulations-uk", "/de/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing", "/de/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing", "/de/de/prepare-for-your-trip/special-travel-needs/medical-travel-companions", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion", "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment", "/de/de/prepare-for-your-trip/travel-classes/economy-basic", "/de/de/prepare-for-your-trip/travelling-with-children/child-in-businessclass", "/de/de/prepare-for-your-trip/travelling-with-children/planning-with-kids", "/de/de/rail-and-fly", "/de/de/rail-fly-bedingungen", "/de/de/rechnungsbeleg", "/de/de/refund", "/de/de/register-animal-cabin", "/de/de/reisebueros", "/de/de/reisen-mit-besonderen-anforderungen", "/de/de/rollstuhlbatterien", "/de/de/schengen", "/de/de/secure-flight", "/de/de/security-fast-lanes", "/de/de/sepa-bedingungen", "/de/de/sepa-bedingungen-b", "/de/de/services-am-flughafen", "/de/de/services-am-flughafen-frankfurt", "/de/de/services-am-flughafen-muenchen", "/de/de/services-an-bord", "/de/de/shopping", "/de/de/sicherheit-fuer-kleinkinder-an-bord", "/de/de/sitzplaene", "/de/de/sitzplatzreservierungen-konditionen", "/de/de/sixt", "/de/de/sondermahlzeiten", "/de/de/speisen-und-getraenke", "/de/de/sportgepaeck", "/de/de/sportgepaeck-hinzufuegen", "/de/de/support/contact/passenger-duty-united-kingdom", "/de/de/support/feedback-and-contact-airlines", "/de/de/tiere-als-handgepaeck", "/de/de/tiere-als-uebergepaeck", "/de/de/tips-senior-travellers", "/de/de/travel-expense-management", "/de/de/travel-id-terms-conditions", "/de/de/travelling-with-animals", "/de/de/traveltricks", "/de/de/uebergepaeck", "/de/de/unterhaltung-an-bord", "/de/de/upgrade-business-class-langstrecke", "/de/de/upgrade-first-class", "/de/de/upgrade-in-die-business-class", "/de/de/upgrade-in-die-premium-economy-class", "/de/de/upgrade-informationen", "/de/de/upgrade-premium-economy-class", "/de/de/upgrademoeglichkeiten", "/de/de/upgrades-im-online-check-in", "/de/de/zahlungsmoeglichkeiten-am-flughafen", "/de/de/zeitfenster-sicherheitskontrolle", "/de/en/100-years", "/de/en/100-years/cabin-design", "/de/en/100-years/campaigns", "/de/en/100-years/chronicle", "/de/en/100-years/crane", "/de/en/100-years/destinations", "/de/en/100-years/fleet", "/de/en/100-years/global-network", "/de/en/100-years/history", "/de/en/100-years/history/menu-on-board", "/de/en/320", "/de/en/32n", "/de/en/359", "/de/en/744", "/de/en/accessible-travel", "/de/en/add-sports-baggage", "/de/en/additional-services", "/de/en/addresses-worldwide", "/de/en/admission-rules", "/de/en/advance-seat-reservation", "/de/en/advance-seat-reservations-terms-and-conditions", "/de/en/advice-for-travellers-with-special-needs-to-and-from-the-usa", "/de/en/affiliatemarketing", "/de/en/airport-information", "/de/en/all-check-in", "/de/en/anmeldung-tiere-frachtraum", "/de/en/arrival-services", "/de/en/articles/authors/florian-tomberg", "/de/en/articles/explore-flying", "/de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history", "/de/en/articles/explore-flying/anniversary-super-crane-special", "/de/en/articles/explore-flying/essentials-future-of-flying", "/de/en/articles/explore-flying/flying-high-christoph-quarch", "/de/en/articles/explore-flying/inflight-entertainment-vr-experience", "/de/en/articles/explore-the-world", "/de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day", "/de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day", "/de/en/articles/explore-the-world/be-picky-barcelona-insider-tips", "/de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips", "/de/en/articles/explore-the-world/eat-see-do-algiers", "/de/en/articles/explore-the-world/eat-see-do-berlin", "/de/en/articles/explore-the-world/essentials-barcelona-facts", "/de/en/articles/explore-the-world/essentials-frankfurt-facts", "/de/en/articles/explore-the-world/in-my-hood-chiswick-london", "/de/en/articles/explore-the-world/in-my-hood-district-zurich", "/de/en/articles/explore-the-world/know-before-you-go-algiers", "/de/en/articles/explore-the-world/know-before-you-go-berlin", "/de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich", "/de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul", "/de/en/articles/explore-the-world/picture-perfect-austin", "/de/en/articles/explore-the-world/stop-over-tokyo", "/de/en/articles/explore-the-world/what-i-learned-living-in-barcelona", "/de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt", "/de/en/articles/highlights", "/de/en/articles/highlights/all-it-takes-is-a-yes", "/de/en/articles/highlights/allegris-premium-economy-san-diego", "/de/en/articles/tags", "/de/en/articles/tags/allegris", "/de/en/articles/tags/munich", "/de/en/assistenzhunde", "/de/en/automatic-check-in", "/de/en/baggage", "/de/en/baggage-irregularities", "/de/en/besondere-befoerderungsbedingungen-bus", "/de/en/bid-upgrade", "/de/en/boarding", "/de/en/boeing787", "/de/en/book-and-manage/additional-services/get-your-guide", "/de/en/book-and-manage/additional-services/travel-insurances", "/de/en/book-and-manage/booking-services/manage-my-bookings", "/de/en/book-and-manage/cancellation-and-refund/refund/refund-form", "/de/en/book-and-manage/digital-self-services/airline-apps", "/de/en/book-and-manage/flights/air-baltic", "/de/en/book-and-manage/flights/ana", "/de/en/book-and-manage/flights/ana/faq", "/de/en/book-and-manage/flights/giftvoucher", "/de/en/book-and-manage/flights/helvetic", "/de/en/book-and-manage/flights/lufthansa-voucher", "/de/en/book-and-manage/flights/wetlease-hub", "/de/en/book-and-manage/pax-receipt", "/de/en/book-and-manage/pax-receipt/invoices-different-countries", "/de/en/book-and-manage/rebook", "/de/en/book-and-manage/rebook/involuntary-rebooking", "/de/en/book-and-manage/rebook/voluntary-rebooking", "/de/en/book-and-manage/stopover", "/de/en/book-and-manage/stopover/bayerischer-hof", "/de/en/book-and-manage/stopover/neuschwanstein", "/de/en/book-and-manage/stopover/zugspitze", "/de/en/business-class", "/de/en/business-class-on-short-and-medium-haul", "/de/en/business-services", "/de/en/business-terms-and-conditions", "/de/en/cancellations-and-refunds", "/de/en/carry-on-baggage", "/de/en/cash-and-miles", "/de/en/check-in-baggage", "/de/en/check-in-with-the-family", "/de/en/child-restraint-systems", "/de/en/children-on-board", "/de/en/childrens-menus-on-board", "/de/en/common", "/de/en/common/accessibility-statement", "/de/en/common/agb-extra-services-at-online-check-in", "/de/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation", "/de/en/common/compensation-voucher", "/de/en/common/imprint/lufthansa-insights-imprint", "/de/en/common/privacy-statement/privacy-statement-group", "/de/en/common/seatreservation-condtions/seat-reservations", "/de/en/cookie-policy", "/de/en/culinaryjourney", "/de/en/dangerous-dogs", "/de/en/data-collection-canada", "/de/en/data-collection-usa", "/de/en/data-protection-information", "/de/en/datenschutz", "/de/en/digital-baggage-services", "/de/en/digital-self-services", "/de/en/digital-travel-companion", "/de/en/discover-lufthansa/carbon-offsetting/climate-protection-projects", "/de/en/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge", "/de/en/discover-lufthansa/carbon-offsetting/faq-saf", "/de/en/discover-lufthansa/carbon-offsetting/saf", "/de/en/discover-lufthansa/flightreservation-priceguarantee", "/de/en/discover-lufthansa/lufthansa-fleet/351", "/de/en/discover-lufthansa/lufthansa-group-airlines/ita-airways", "/de/en/discover-lufthansa/miles-and-more-credit-card", "/de/en/discover-lufthansa/new-onboard-experience", "/de/en/discover-lufthansa/take-off", "/de/en/doctor-on-board", "/de/en/doctor-on-board-news", "/de/en/during-your-trip/food-and-beverages/onboard-delights/faq", "/de/en/during-your-trip/internet-overview", "/de/en/during-your-trip/lhg-wifi", "/de/en/economy-class", "/de/en/electronic-bag-tags", "/de/en/entryprocesses", "/de/en/europa-tarife-economy-class", "/de/en/europcar", "/de/en/exclusive-charter", "/de/en/faq-data-security", "/de/en/faq-ejournals", "/de/en/faq-password-security", "/de/en/farealert/best-price-alert", "/de/en/feedback", "/de/en/feedback-past-flight", "/de/en/feedback/feedbackai", "/de/en/fia-valet-service", "/de/en/first-class", "/de/en/first-class-comfort", "/de/en/first-class-lounges", "/de/en/first-class-personal-assistant", "/de/en/first-class-terminal", "/de/en/first-class-valet-parking-service", "/de/en/fliegen-mit-baby", "/de/en/flight-disruptions", "/de/en/flight-search", "/de/en/flights", "/de/en/fly-more-sustainabl", "/de/en/flying-with-small-children", "/de/en/flynet", "/de/en/fmg-valet-parking-service", "/de/en/food-and-beverages", "/de/en/frankfurt-fair", "/de/en/free2move", "/de/en/freigepaeck-regeln", "/de/en/gefaehrliche-gegenstaende", "/de/en/general-conditions-currency-conversion", "/de/en/green-fare", "/de/en/group-travel", "/de/en/group-travel-and-charter", "/de/en/hertz", "/de/en/homepage", "/de/en/hotel-offers", "/de/en/imprint", "/de/en/lh-rentalcar", "/de/en/lounge-companions", "/de/en/lounges", "/de/en/lufthansa-am-flughafen-frankfurt", "/de/en/lufthansa-at-berlin-airport", "/de/en/lufthansa-at-duesseldorf-airport", "/de/en/lufthansa-at-vienna-airport", "/de/en/lufthansa-at-zuerich-airport", "/de/en/lufthansa-aviation-group", "/de/en/lufthansa-business-class-on-long-haul-routes", "/de/en/lufthansa-city/culinaryjourney", "/de/en/lufthansa-city/menu-card", "/de/en/lufthansa-corporate-customers", "/de/en/lufthansa-express", "/de/en/lufthansa-express-bus", "/de/en/lufthansa-express-rail", "/de/en/lufthansa-first-class-entertainment", "/de/en/lufthansa-first-class-fleet", "/de/en/lufthansa-group-star-alliance-and-partner-airlines", "/de/en/lufthansa-guide-service", "/de/en/lufthansa-terminal-muenchen", "/de/en/lufthansa-travel-classes", "/de/en/medikamenten-transport", "/de/en/meetings-and-events", "/de/en/meetings-and-events-delegates", "/de/en/meetings-and-events-organisers", "/de/en/menus-on-long-haul-flights", "/de/en/menus-travel-classes", "/de/en/miles-and-more", "/de/en/mobility-partner-program-healthcare", "/de/en/most-significant-route", "/de/en/munich-fair", "/de/en/my-bookings", "/de/en/my-logbook", "/de/en/onboard-delights", "/de/en/online-check-in", "/de/en/online-check-in-info", "/de/en/overview-flights", "/de/en/overview-manage", "/de/en/overview-special-request", "/de/en/overview-travel-information", "/de/en/partner", "/de/en/passenger-receipt-90", "/de/en/passenger-rights", "/de/en/passengers-using-wheelchairs", "/de/en/passengers-with-sensory-impairment", "/de/en/payment-options-at-the-airport", "/de/en/pre-check-in", "/de/en/premium-economy-class", "/de/en/prepare-for-your-trip/baggage/baggage-conditions", "/de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg", "/de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay", "/de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage", "/de/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage", "/de/en/prepare-for-your-trip/baggage/electronic-devices-and-batteries", "/de/en/prepare-for-your-trip/baggage/sport-baggage/register-ammunition", "/de/en/prepare-for-your-trip/current-travel-information", "/de/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system", "/de/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk", "/de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing", "/de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing", "/de/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion", "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment", "/de/en/prepare-for-your-trip/travel-classes/economy-basic", "/de/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass", "/de/en/prepare-for-your-trip/travelling-with-children/planning-with-kids", "/de/en/rail-and-fly", "/de/en/rail-fly-terms-and-conditions", "/de/en/rechnungsbeleg", "/de/en/refund", "/de/en/register-animal-cabin", "/de/en/schengen", "/de/en/seat-maps", "/de/en/secure-flight", "/de/en/security-check-time-slot", "/de/en/security-fast-lanes", "/de/en/sepa-terms-and-conditions", "/de/en/sepa-terms-and-conditions-b", "/de/en/services-at-frankfurt-airport", "/de/en/services-at-the-airport", "/de/en/services-munich-airport", "/de/en/services-on-board", "/de/en/shopping", "/de/en/sixt", "/de/en/special-meals", "/de/en/special-needs", "/de/en/sports-baggage", "/de/en/support/contact/passenger-duty-united-kingdom", "/de/en/support/feedback-and-contact-airlines", "/de/en/terms-and-conditions-lh", "/de/en/terms-of-service-group", "/de/en/terms-of-use", "/de/en/tiere-als-handgepaeck", "/de/en/tiere-als-uebergepaeck", "/de/en/timetable-and-flight-status", "/de/en/tips-senior-travellers", "/de/en/travel-agencies", "/de/en/travel-expense-management", "/de/en/travel-id-terms-conditions", "/de/en/travelling-healthy", "/de/en/travelling-with-animals", "/de/en/travelling-with-children", "/de/en/travelling-with-special-requirements", "/de/en/traveltricks", "/de/en/uebergepaeck", "/de/en/unaccompanied-minors", "/de/en/unterhaltung-an-bord", "/de/en/upgrade-business-class-long-haul", "/de/en/upgrade-first-class", "/de/en/upgrade-info", "/de/en/upgrade-options", "/de/en/upgrade-premium-economy-class", "/de/en/upgrade-to-business-class", "/de/en/upgrade-to-premium-economy-class", "/de/en/upgrades-at-online-check-in", "/de/en/wheelchair-batteries", "/de/en/with-children-at-the-airport", "/gb/en/100-years", "/gb/en/100-years/cabin-design", "/gb/en/100-years/campaigns", "/gb/en/100-years/chronicle", "/gb/en/100-years/crane", "/gb/en/100-years/destinations", "/gb/en/100-years/fleet", "/gb/en/100-years/global-network", "/gb/en/100-years/history", "/gb/en/100-years/history/menu-on-board", "/gb/en/320", "/gb/en/32n", "/gb/en/359", "/gb/en/744", "/gb/en/accessible-travel", "/gb/en/add-sports-baggage", "/gb/en/additional-services", "/gb/en/addresses-worldwide", "/gb/en/admission-rules", "/gb/en/advance-seat-reservation", "/gb/en/advance-seat-reservations-terms-and-conditions", "/gb/en/advice-for-travellers-with-special-needs-to-and-from-the-usa", "/gb/en/affiliatemarketing", "/gb/en/airport-information", "/gb/en/all-check-in", "/gb/en/anmeldung-tiere-frachtraum", "/gb/en/arrival-services", "/gb/en/articles/authors/florian-tomberg", "/gb/en/articles/explore-flying", "/gb/en/articles/explore-flying/7-people-who-shaped-lufthansa-history", "/gb/en/articles/explore-flying/anniversary-super-crane-special", "/gb/en/articles/explore-flying/essentials-future-of-flying", "/gb/en/articles/explore-flying/flying-high-christoph-quarch", "/gb/en/articles/explore-flying/inflight-entertainment-vr-experience", "/gb/en/articles/explore-the-world", "/gb/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day", "/gb/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day", "/gb/en/articles/explore-the-world/be-picky-barcelona-insider-tips", "/gb/en/articles/explore-the-world/be-picky-frankfurt-insider-tips", "/gb/en/articles/explore-the-world/eat-see-do-algiers", "/gb/en/articles/explore-the-world/eat-see-do-berlin", "/gb/en/articles/explore-the-world/essentials-barcelona-facts", "/gb/en/articles/explore-the-world/essentials-frankfurt-facts", "/gb/en/articles/explore-the-world/in-my-hood-chiswick-london", "/gb/en/articles/explore-the-world/in-my-hood-district-zurich", "/gb/en/articles/explore-the-world/know-before-you-go-algiers", "/gb/en/articles/explore-the-world/know-before-you-go-berlin", "/gb/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich", "/gb/en/articles/explore-the-world/on-the-scene-food-trends-istanbul", "/gb/en/articles/explore-the-world/picture-perfect-austin", "/gb/en/articles/explore-the-world/stop-over-tokyo", "/gb/en/articles/explore-the-world/what-i-learned-living-in-barcelona", "/gb/en/articles/explore-the-world/what-i-learned-living-in-frankfurt", "/gb/en/articles/highlights", "/gb/en/articles/highlights/all-it-takes-is-a-yes", "/gb/en/articles/highlights/allegris-premium-economy-san-diego", "/gb/en/articles/tags", "/gb/en/articles/tags/allegris", "/gb/en/articles/tags/munich", "/gb/en/assistenzhunde", "/gb/en/automatic-check-in", "/gb/en/baggage", "/gb/en/baggage-irregularities", "/gb/en/besondere-befoerderungsbedingungen-bus", "/gb/en/bid-upgrade", "/gb/en/boarding", "/gb/en/boeing787", "/gb/en/book-and-manage/additional-services/get-your-guide", "/gb/en/book-and-manage/additional-services/travel-insurances", "/gb/en/book-and-manage/booking-services/manage-my-bookings", "/gb/en/book-and-manage/cancellation-and-refund/refund/refund-form", "/gb/en/book-and-manage/digital-self-services/airline-apps", "/gb/en/book-and-manage/flights/air-baltic", "/gb/en/book-and-manage/flights/ana", "/gb/en/book-and-manage/flights/ana/faq", "/gb/en/book-and-manage/flights/giftvoucher", "/gb/en/book-and-manage/flights/helvetic", "/gb/en/book-and-manage/flights/lufthansa-voucher", "/gb/en/book-and-manage/flights/wetlease-hub", "/gb/en/book-and-manage/pax-receipt", "/gb/en/book-and-manage/pax-receipt/invoices-different-countries", "/gb/en/book-and-manage/rebook", "/gb/en/book-and-manage/rebook/involuntary-rebooking", "/gb/en/book-and-manage/rebook/voluntary-rebooking", "/gb/en/book-and-manage/stopover", "/gb/en/book-and-manage/stopover/bayerischer-hof", "/gb/en/book-and-manage/stopover/neuschwanstein", "/gb/en/book-and-manage/stopover/zugspitze", "/gb/en/business-class", "/gb/en/business-class-on-short-and-medium-haul", "/gb/en/business-services", "/gb/en/business-terms-and-conditions", "/gb/en/cancellations-and-refunds", "/gb/en/carry-on-baggage", "/gb/en/cash-and-miles", "/gb/en/check-in-baggage", "/gb/en/check-in-with-the-family", "/gb/en/child-restraint-systems", "/gb/en/children-on-board", "/gb/en/childrens-menus-on-board", "/gb/en/common", "/gb/en/common/accessibility-statement", "/gb/en/common/agb-extra-services-at-online-check-in", "/gb/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation", "/gb/en/common/compensation-voucher", "/gb/en/common/imprint/lufthansa-insights-imprint", "/gb/en/common/privacy-statement/privacy-statement-group", "/gb/en/common/seatreservation-condtions/seat-reservations", "/gb/en/cookie-policy", "/gb/en/culinaryjourney", "/gb/en/dangerous-dogs", "/gb/en/data-collection-canada", "/gb/en/data-collection-usa", "/gb/en/data-protection-information", "/gb/en/datenschutz", "/gb/en/digital-baggage-services", "/gb/en/digital-self-services", "/gb/en/digital-travel-companion", "/gb/en/discover-lufthansa/carbon-offsetting/climate-protection-projects", "/gb/en/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge", "/gb/en/discover-lufthansa/carbon-offsetting/faq-saf", "/gb/en/discover-lufthansa/carbon-offsetting/saf", "/gb/en/discover-lufthansa/flightreservation-priceguarantee", "/gb/en/discover-lufthansa/lufthansa-fleet/351", "/gb/en/discover-lufthansa/lufthansa-group-airlines/ita-airways", "/gb/en/discover-lufthansa/miles-and-more-credit-card", "/gb/en/discover-lufthansa/new-onboard-experience", "/gb/en/discover-lufthansa/take-off", "/gb/en/doctor-on-board", "/gb/en/doctor-on-board-news", "/gb/en/during-your-trip/food-and-beverages/onboard-delights/faq", "/gb/en/during-your-trip/internet-overview", "/gb/en/during-your-trip/lhg-wifi", "/gb/en/economy-class", "/gb/en/electronic-bag-tags", "/gb/en/entryprocesses", "/gb/en/europa-tarife-economy-class", "/gb/en/europcar", "/gb/en/exclusive-charter", "/gb/en/faq-data-security", "/gb/en/faq-ejournals", "/gb/en/faq-password-security", "/gb/en/farealert/best-price-alert", "/gb/en/feedback", "/gb/en/feedback-past-flight", "/gb/en/feedback/feedbackai", "/gb/en/fia-valet-service", "/gb/en/first-class", "/gb/en/first-class-comfort", "/gb/en/first-class-lounges", "/gb/en/first-class-personal-assistant", "/gb/en/first-class-terminal", "/gb/en/first-class-valet-parking-service", "/gb/en/fliegen-mit-baby", "/gb/en/flight-disruptions", "/gb/en/flight-search", "/gb/en/flights", "/gb/en/fly-more-sustainabl", "/gb/en/flying-with-small-children", "/gb/en/flynet", "/gb/en/fmg-valet-parking-service", "/gb/en/food-and-beverages", "/gb/en/frankfurt-fair", "/gb/en/free2move", "/gb/en/freigepaeck-regeln", "/gb/en/gefaehrliche-gegenstaende", "/gb/en/general-conditions-currency-conversion", "/gb/en/green-fare", "/gb/en/group-travel", "/gb/en/group-travel-and-charter", "/gb/en/hertz", "/gb/en/homepage", "/gb/en/hotel-offers", "/gb/en/imprint", "/gb/en/lh-rentalcar", "/gb/en/lounge-companions", "/gb/en/lounges", "/gb/en/lufthansa-am-flughafen-frankfurt", "/gb/en/lufthansa-at-berlin-airport", "/gb/en/lufthansa-at-duesseldorf-airport", "/gb/en/lufthansa-at-vienna-airport", "/gb/en/lufthansa-at-zuerich-airport", "/gb/en/lufthansa-aviation-group", "/gb/en/lufthansa-business-class-on-long-haul-routes", "/gb/en/lufthansa-city/culinaryjourney", "/gb/en/lufthansa-city/menu-card", "/gb/en/lufthansa-corporate-customers", "/gb/en/lufthansa-express", "/gb/en/lufthansa-express-bus", "/gb/en/lufthansa-express-rail", "/gb/en/lufthansa-first-class-entertainment", "/gb/en/lufthansa-first-class-fleet", "/gb/en/lufthansa-group-star-alliance-and-partner-airlines", "/gb/en/lufthansa-guide-service", "/gb/en/lufthansa-terminal-muenchen", "/gb/en/lufthansa-travel-classes", "/gb/en/medikamenten-transport", "/gb/en/meetings-and-events", "/gb/en/meetings-and-events-delegates", "/gb/en/meetings-and-events-organisers", "/gb/en/menus-on-long-haul-flights", "/gb/en/menus-travel-classes", "/gb/en/miles-and-more", "/gb/en/mobility-partner-program-healthcare", "/gb/en/most-significant-route", "/gb/en/munich-fair", "/gb/en/my-bookings", "/gb/en/my-logbook", "/gb/en/onboard-delights", "/gb/en/online-check-in", "/gb/en/online-check-in-info", "/gb/en/overview-flights", "/gb/en/overview-manage", "/gb/en/overview-special-request", "/gb/en/overview-travel-information", "/gb/en/partner", "/gb/en/passenger-receipt-90", "/gb/en/passenger-rights", "/gb/en/passengers-using-wheelchairs", "/gb/en/passengers-with-sensory-impairment", "/gb/en/payment-options-at-the-airport", "/gb/en/pre-check-in", "/gb/en/premium-economy-class", "/gb/en/prepare-for-your-trip/baggage/baggage-conditions", "/gb/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg", "/gb/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay", "/gb/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage", "/gb/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage", "/gb/en/prepare-for-your-trip/baggage/electronic-devices-and-batteries", "/gb/en/prepare-for-your-trip/baggage/sport-baggage/register-ammunition", "/gb/en/prepare-for-your-trip/current-travel-information", "/gb/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system", "/gb/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk", "/gb/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing", "/gb/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing", "/gb/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion", "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment", "/gb/en/prepare-for-your-trip/travel-classes/economy-basic", "/gb/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass", "/gb/en/prepare-for-your-trip/travelling-with-children/planning-with-kids", "/gb/en/rail-and-fly", "/gb/en/rail-fly-terms-and-conditions", "/gb/en/rechnungsbeleg", "/gb/en/refund", "/gb/en/register-animal-cabin", "/gb/en/schengen", "/gb/en/seat-maps", "/gb/en/secure-flight", "/gb/en/security-check-time-slot", "/gb/en/security-fast-lanes", "/gb/en/sepa-terms-and-conditions", "/gb/en/sepa-terms-and-conditions-b", "/gb/en/services-at-frankfurt-airport", "/gb/en/services-at-the-airport", "/gb/en/services-munich-airport", "/gb/en/services-on-board", "/gb/en/shopping", "/gb/en/sixt", "/gb/en/special-meals", "/gb/en/special-needs", "/gb/en/sports-baggage", "/gb/en/support/contact/passenger-duty-united-kingdom", "/gb/en/support/feedback-and-contact-airlines", "/gb/en/terms-and-conditions-lh", "/gb/en/terms-of-service-group", "/gb/en/terms-of-use", "/gb/en/tiere-als-handgepaeck", "/gb/en/tiere-als-uebergepaeck", "/gb/en/timetable-and-flight-status", "/gb/en/tips-senior-travellers", "/gb/en/travel-agencies", "/gb/en/travel-expense-management", "/gb/en/travel-id-terms-conditions", "/gb/en/travelling-healthy", "/gb/en/travelling-with-animals", "/gb/en/travelling-with-children", "/gb/en/travelling-with-special-requirements", "/gb/en/traveltricks", "/gb/en/uebergepaeck", "/gb/en/unaccompanied-minors", "/gb/en/unterhaltung-an-bord", "/gb/en/upgrade-business-class-long-haul", "/gb/en/upgrade-first-class", "/gb/en/upgrade-info", "/gb/en/upgrade-options", "/gb/en/upgrade-premium-economy-class", "/gb/en/upgrade-to-business-class", "/gb/en/upgrade-to-premium-economy-class", "/gb/en/upgrades-at-online-check-in", "/gb/en/wheelchair-batteries", "/gb/en/with-children-at-the-airport", "/lhg/at/de", "/lhg/at/de/dest/c/grossbritannien", "/lhg/at/de/dest/c/indien", "/lhg/at/de/dest/c/italien", "/lhg/at/de/dest/c/japan", "/lhg/at/de/dest/c/spanien", "/lhg/at/de/dest/c/usa", "/lhg/at/de/dest/co/europa", "/lhg/at/de/dest/co/nord-und-suedamerika", "/lhg/at/de/dest/cy/amman", "/lhg/at/de/dest/cy/barcelona", "/lhg/at/de/dest/cy/lissabon", "/lhg/at/de/dest/cy/london", "/lhg/at/de/dest/cy/los-angeles", "/lhg/at/de/dest/cy/new-york", "/lhg/at/de/dest/cy/palma-de-mallorca", "/lhg/at/de/dest/cy/paris", "/lhg/at/de/dest/cy/rom", "/lhg/at/de/dest/cy/tokio", "/lhg/de/de", "/lhg/de/de/dest/c/grossbritannien", "/lhg/de/de/dest/c/indien", "/lhg/de/de/dest/c/italien", "/lhg/de/de/dest/c/japan", "/lhg/de/de/dest/c/spanien", "/lhg/de/de/dest/c/usa", "/lhg/de/de/dest/co/europa", "/lhg/de/de/dest/co/nord-und-suedamerika", "/lhg/de/de/dest/cy/amman", "/lhg/de/de/dest/cy/barcelona", "/lhg/de/de/dest/cy/lissabon", "/lhg/de/de/dest/cy/london", "/lhg/de/de/dest/cy/los-angeles", "/lhg/de/de/dest/cy/new-york", "/lhg/de/de/dest/cy/new-york/business-class", "/lhg/de/de/dest/cy/palma-de-mallorca", "/lhg/de/de/dest/cy/paris", "/lhg/de/de/dest/cy/rom", "/lhg/de/de/dest/cy/tokio", "/lhg/de/de/dest/cy/tokio/business-class", "/lhg/de/de/from/cy/berlin", "/lhg/de/de/from/cy/frankfurt", "/lhg/de/de/from/cy/muenchen", "/lhg/de/de/o-d/c-c/deutschland-spanien", "/lhg/de/de/o-d/c-c/deutschland-usa", "/lhg/de/de/o-d/cy-cy/berlin-rom", "/lhg/de/de/o-d/cy-cy/frankfurt-amman", "/lhg/de/de/o-d/cy-cy/frankfurt-london", "/lhg/de/de/o-d/cy-cy/frankfurt-new-york", "/lhg/de/de/o-d/cy-cy/frankfurt-tokio", "/lhg/de/de/o-d/cy-cy/hamburg-palma-de-mallorca", "/lhg/de/de/o-d/cy-cy/muenchen-barcelona", "/lhg/de/de/o-d/cy-cy/muenchen-los-angeles", "/lhg/de/de/o-d/cy-cy/muenchen-new-york", "/lhg/de/en", "/lhg/de/en/dest/c/india", "/lhg/de/en/dest/c/italy", "/lhg/de/en/dest/c/japan", "/lhg/de/en/dest/c/spain", "/lhg/de/en/dest/c/united-kingdom", "/lhg/de/en/dest/c/usa", "/lhg/de/en/dest/co/europe", "/lhg/de/en/dest/co/north-and-south-america", "/lhg/de/en/dest/cy/amman", "/lhg/de/en/dest/cy/barcelona", "/lhg/de/en/dest/cy/lisbon", "/lhg/de/en/dest/cy/london", "/lhg/de/en/dest/cy/los-angeles", "/lhg/de/en/dest/cy/new-york", "/lhg/de/en/dest/cy/new-york/business-class", "/lhg/de/en/dest/cy/palma-de-mallorca", "/lhg/de/en/dest/cy/paris", "/lhg/de/en/dest/cy/rome", "/lhg/de/en/dest/cy/tokyo", "/lhg/de/en/dest/cy/tokyo/business-class", "/lhg/de/en/from/cy/berlin", "/lhg/de/en/from/cy/frankfurt", "/lhg/de/en/from/cy/munich", "/lhg/de/en/o-d/c-c/germany-spain", "/lhg/de/en/o-d/c-c/germany-usa", "/lhg/de/en/o-d/cy-cy/berlin-rome", "/lhg/de/en/o-d/cy-cy/frankfurt-amman", "/lhg/de/en/o-d/cy-cy/frankfurt-london", "/lhg/de/en/o-d/cy-cy/frankfurt-new-york", "/lhg/de/en/o-d/cy-cy/frankfurt-tokyo", "/lhg/de/en/o-d/cy-cy/hamburg-palma-de-mallorca", "/lhg/de/en/o-d/cy-cy/munich-barcelona", "/lhg/de/en/o-d/cy-cy/munich-los-angeles", "/lhg/de/en/o-d/cy-cy/munich-new-york", "/lhg/gb/en", "/lhg/gb/en/dest/c/india", "/lhg/gb/en/dest/c/italy", "/lhg/gb/en/dest/c/japan", "/lhg/gb/en/dest/c/spain", "/lhg/gb/en/dest/c/usa", "/lhg/gb/en/dest/co/europe", "/lhg/gb/en/dest/co/north-and-south-america", "/lhg/gb/en/dest/cy/amman", "/lhg/gb/en/dest/cy/barcelona", "/lhg/gb/en/dest/cy/lisbon", "/lhg/gb/en/dest/cy/los-angeles", "/lhg/gb/en/dest/cy/new-york", "/lhg/gb/en/dest/cy/palma-de-mallorca", "/lhg/gb/en/dest/cy/paris", "/lhg/gb/en/dest/cy/rome", "/lhg/gb/en/dest/cy/tokyo", "/lhg/gb/en/o-d/cy-cy/frankfurt-london"]);
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
    // AirCore (/lhg/) header incl. the inline slide-in mega-menu
    "header.header-content-nav",
    ".header-navigation-flyout-slide-in",
    // global footer (becomes the per-locale footer fragment)
    "footer",
    "#footer",
    ".footer-area",
    ".footer-logos",
    ".commonfooter",
    // AirCore footer bands (payment/follow-us, search + language, logo); normally inside footer#footer
    "footer .footer-brand-links",
    ".above-footer-container",
    ".secondary-footer-container",
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
    // global modals that never hold page content: location/language pickers, login, AirCore
    // loaders/spinners, UI sound effects. Content modals (fare conditions, the fleet seat-map
    // .lightbox-modal) stay until afterTransform because parsers read them.
    "maui-modal.country-language-selector-modal",
    "maui-modal.one-id-login__modal",
    ".language-selection-modal",
    ".loader",
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
  var EMBED_URL = /(youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|brightcove|players\.|maps\.google|google\.com\/maps|lufthansa\.com)/i;
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
  var BREADCRUMB_SOURCES = 'maui-breadcrumb, nav.breadcrumb, nav[aria-label*="readcrumb"], .breadcrumbs';
  var BREADCRUMB_ATTR = "data-lh-import-breadcrumb";
  var BREADCRUMB_MAP = { "/at/de/additional-services": [["Home", "/at/de/homepage"], ["Extra Services", "/at/de/additional-services"]], "/at/de/befoerderungsbedingungen-group": [["Home", "/at/de/homepage"], ["Bef\xF6rderungsbedingungen der Lufthansa Group-Airlines", "/at/de/befoerderungsbedingungen-group"]], "/at/de/book-and-manage/flights/ana": [["Home", "/at/de/homepage"], ["Flugsuche", "/at/de/flugsuche"], ["ANA", "/at/de/book-and-manage/flights/ana"]], "/at/de/business-class": [["Home", "/at/de/homepage"], ["Reiseklassen", "/at/de/lufthansa-reiseklassen"], ["Business Class", "/at/de/business-class"]], "/at/de/common/agb-extra-services-at-online-check-in": [["Home", "/at/de/homepage"], ["AGB Lufthansa Services im Online Check-in", "/at/de/common/agb-extra-services-at-online-check-in"]], "/at/de/first-class": [["Home", "/at/de/homepage"], ["Reiseklassen", "/at/de/lufthansa-reiseklassen"], ["First Class", "/at/de/first-class"]], "/at/de/homepage": [["Home", "/at/de/homepage"]], "/at/de/lufthansa-reiseklassen": [["Home", "/at/de/homepage"], ["Reiseklassen", "/at/de/lufthansa-reiseklassen"]], "/at/de/nachhaltiger-fliegen": [["Home", "/at/de/homepage"], ["Nachhaltiger fliegen", "/at/de/nachhaltiger-fliegen"]], "/at/de/support/contact": [["Home", "/at/de/homepage"], ["Kontakt", "/at/de/support/contact"]], "/de/de/additional-services": [["Home", "/de/de/homepage"], ["Extra Services", "/de/de/additional-services"]], "/de/de/befoerderungsbedingungen-group": [["Home", "/de/de/homepage"], ["Bef\xF6rderungsbedingungen der Lufthansa Group-Airlines", "/de/de/befoerderungsbedingungen-group"]], "/de/de/book-and-manage/flights/ana": [["Home", "/de/de/homepage"], ["Flugsuche", "/de/de/flugsuche"], ["ANA", "/de/de/book-and-manage/flights/ana"]], "/de/de/business-class": [["Home", "/de/de/homepage"], ["Reiseklassen", "/de/de/lufthansa-reiseklassen"], ["Business Class", "/de/de/business-class"]], "/de/de/common/agb-extra-services-at-online-check-in": [["Home", "/de/de/homepage"], ["AGB Lufthansa Services im Online Check-in", "/de/de/common/agb-extra-services-at-online-check-in"]], "/de/de/first-class": [["Home", "/de/de/homepage"], ["Reiseklassen", "/de/de/lufthansa-reiseklassen"], ["First Class", "/de/de/first-class"]], "/de/de/homepage": [["Home", "/de/de/homepage"]], "/de/de/lufthansa-reiseklassen": [["Home", "/de/de/homepage"], ["Reiseklassen", "/de/de/lufthansa-reiseklassen"]], "/de/de/nachhaltiger-fliegen": [["Home", "/de/de/homepage"], ["Nachhaltiger fliegen", "/de/de/nachhaltiger-fliegen"]], "/de/de/support/contact": [["Home", "/de/de/homepage"], ["Kontakt", "/de/de/support/contact"]], "/de/en/additional-services": [["Home", "/de/en/homepage"], ["Extra services", "/de/en/additional-services"]], "/de/en/book-and-manage/flights/ana": [["Home", "/de/en/homepage"], ["Flight search", "/de/en/flight-search"], ["ANA", "/de/en/book-and-manage/flights/ana"]], "/de/en/business-class": [["Home", "/de/en/homepage"], ["Travel classes", "/de/en/lufthansa-travel-classes"], ["Business Class", "/de/en/business-class"]], "/de/en/common/agb-extra-services-at-online-check-in": [["Home", "/de/en/homepage"], ["T&Cs of Lufthansa Online Check-in Services", "/de/en/common/agb-extra-services-at-online-check-in"]], "/de/en/discover-lufthansa/campaigns": [["Home", "/de/en/homepage"], ["Campaigns", "/de/en/discover-lufthansa/campaigns"]], "/de/en/first-class": [["Home", "/de/en/homepage"], ["Travel classes", "/de/en/lufthansa-travel-classes"], ["First Class", "/de/en/first-class"]], "/de/en/fly-more-sustainabl": [["Home", "/de/en/homepage"], ["Fly more sustainably", "/de/en/fly-more-sustainabl"]], "/de/en/homepage": [["Home", "/de/en/homepage"]], "/de/en/lufthansa-travel-classes": [["Home", "/de/en/homepage"], ["Travel classes", "/de/en/lufthansa-travel-classes"]], "/de/en/support/contact": [["Home", "/de/en/homepage"], ["Contact", "/de/en/support/contact"]], "/de/en/terms-of-service-group": [["Home", "/de/en/homepage"], ["Conditions of Carriage of Lufthansa Group Airlines", "/de/en/terms-of-service-group"]], "/gb/en/additional-services": [["Home", "/gb/en/homepage"], ["Extra services", "/gb/en/additional-services"]], "/gb/en/book-and-manage/flights/ana": [["Home", "/gb/en/homepage"], ["Flight search", "/gb/en/flight-search"], ["ANA", "/gb/en/book-and-manage/flights/ana"]], "/gb/en/business-class": [["Home", "/gb/en/homepage"], ["Travel classes", "/gb/en/lufthansa-travel-classes"], ["Business Class", "/gb/en/business-class"]], "/gb/en/common/agb-extra-services-at-online-check-in": [["Home", "/gb/en/homepage"], ["T&Cs of Lufthansa Online Check-in Services", "/gb/en/common/agb-extra-services-at-online-check-in"]], "/gb/en/discover-lufthansa/campaigns": [["Home", "/gb/en/homepage"], ["Campaigns", "/gb/en/discover-lufthansa/campaigns"]], "/gb/en/first-class": [["Home", "/gb/en/homepage"], ["Travel classes", "/gb/en/lufthansa-travel-classes"], ["First Class", "/gb/en/first-class"]], "/gb/en/fly-more-sustainabl": [["Home", "/gb/en/homepage"], ["Fly more sustainably", "/gb/en/fly-more-sustainabl"]], "/gb/en/homepage": [["Home", "/gb/en/homepage"]], "/gb/en/lufthansa-travel-classes": [["Home", "/gb/en/homepage"], ["Travel classes", "/gb/en/lufthansa-travel-classes"]], "/gb/en/support/contact": [["Home", "/gb/en/homepage"], ["Contact", "/gb/en/support/contact"]], "/gb/en/terms-of-service-group": [["Home", "/gb/en/homepage"], ["Conditions of Carriage of Lufthansa Group Airlines", "/gb/en/terms-of-service-group"]], "/lhg/de/de": [["Reiseziele", "/lhg/de/de"]], "/lhg/de/de/dest/co/asien": [["Reiseziele", "/lhg/de/de"], ["Flug Asien", "/lhg/de/de/dest/co/asien"]], "/lhg/de/en": [["Travel destinations", "/lhg/de/en"]], "/lhg/de/en/dest/c/france": [["Travel destinations", "/lhg/de/en"], ["Flight Europe", "/lhg/de/en/dest/co/europe"], ["Flight France", "/lhg/de/en/dest/c/france"]], "/lhg/de/en/dest/c/jordan": [["Travel destinations", "/lhg/de/en"], ["Flight Asia", "/lhg/de/en/dest/co/asia"], ["Flight Jordan", "/lhg/de/en/dest/c/jordan"]], "/lhg/de/en/dest/c/portugal": [["Travel destinations", "/lhg/de/en"], ["Flight Europe", "/lhg/de/en/dest/co/europe"], ["Flight Portugal", "/lhg/de/en/dest/c/portugal"]], "/lhg/de/en/dest/co/asia": [["Travel destinations", "/lhg/de/en"], ["Flight Asia", "/lhg/de/en/dest/co/asia"]], "/lhg/de/en/from": [["Flights from Germany", "/lhg/de/en/from"]], "/xx/de/homepage": [["Home", "/xx/de/homepage"]] };
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
      const wrapper = source.closest(".breadcrumb-wrapper, .maui-breadcrumb") || source;
      if (crumbs.length && !trail) trail = crumbs.map((c) => [c.label, c.href || null]);
      wrapper.remove();
    });
    document.querySelectorAll(".breadcrumb-wrapper, .breadcrumb").forEach((el) => {
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
    const market = (pagePath || "").match(/^\/(?:lhg\/)?([a-z]{2})\//);
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
      const holder = q.closest(".wrapper") && q.closest(".wrapper").children.length === 1 ? q.closest(".wrapper") : q;
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
  var MEDIA = 'img, picture, video, audio, iframe, svg, object, embed, canvas, input, select, textarea, button, form, hr, maui-icon, [style*="background-image"]';
  var VIDEO_CONFIG = '[data-dcep*="videoSrc"]';
  function isEmpty(el) {
    if (el.textContent.replace(/\u00A0/g, " ").trim()) return false;
    return !el.matches(VIDEO_CONFIG) && !el.querySelector(`${MEDIA}, ${VIDEO_CONFIG}`);
  }
  var SEPARATOR_COMMENT = "lh-separator";
  var SEPARATOR_MIN_SPACE = 50;
  function separatorInfo(sep) {
    const hr = sep.querySelector(".hr") || sep;
    const line = hr.classList.contains("hr") && !hr.classList.contains("hr-no-layout");
    const m = (hr.getAttribute("style") || "").match(/margin-bottom:\s*(-?[\d.]+)px/i);
    const space = m ? Math.round(parseFloat(m[1])) : 25;
    const tokens = [`${line ? "divider" : "spacer"}-${Math.max(space, 0)}`];
    if (hr.classList.contains("hidden-sm-down")) tokens.push("from-768");
    return { keep: line || space >= SEPARATOR_MIN_SPACE, marker: tokens.join(" ") };
  }
  function markSeparators(document) {
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
      const keep = infos.some((i) => i.keep) || afterGrey(run[0]);
      run.forEach((sep, i) => {
        if (!sep.isConnected) return;
        if (keep) sep.replaceWith(document.createComment(`${SEPARATOR_COMMENT} ${infos[i].marker}`));
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
  function removeEmptyComponents(document) {
    markSeparators(document);
    document.querySelectorAll('.dcep-react-wrapper, [id="root"], [id$="-root"], ppfi-web-component').forEach((el) => {
      if (el.isConnected && isEmpty(el)) el.remove();
    });
    const scope = document.querySelector(".container-content, .contentpage, main") || document.body;
    [...scope.querySelectorAll('div.section, div[class*="-container"], div[class^="dcep-"]')].reverse().forEach((el) => {
      if (el.isConnected && isEmpty(el)) el.remove();
    });
  }
  function removeAirCoreLeftovers(document) {
    document.querySelectorAll(".language-selection-modal").forEach((m) => {
      const modal = m.closest(".modal") || m;
      if (modal.isConnected) modal.remove();
    });
    document.querySelectorAll(".info-banner, #contentInfo").forEach((banner) => {
      if (!banner.isConnected || !isEmpty(banner)) return;
      const parent = banner.parentElement;
      banner.remove();
      if (parent && parent.tagName === "DIV" && !parent.matches("main, #content, .contentpage") && isEmpty(parent)) {
        parent.remove();
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
  function convertClassButtons(document) {
    document.querySelectorAll("a.btn-primary[href], a.btn-secondary[href]").forEach((a) => {
      if (a.closest("strong, em, b, i, table")) return;
      const wrap = document.createElement(a.classList.contains("btn-primary") ? "strong" : "em");
      a.replaceWith(wrap);
      wrap.append(a);
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
  function isBroken(url) {
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
      if (url && !isBroken(url)) candidates.push({ url, w: w || transformWidth(url) });
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
  var PAGE_PATH = /^\/(?:[a-z]{2}\/[a-z]{2}|lhg\/[a-z]{2}\/[a-z]{2})(?:\/|$)/;
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
    const pagePath = pathname.replace(/^\/content\/lh(?=\/)/, "");
    if (LOCALE_ROOT.test(pagePath) && SCOPE_PATHS.has(`${pagePath}/homepage`)) {
      return `${pagePath}/homepage${u.search}${u.hash}`;
    }
    if (PAGE_PATH.test(pagePath) && SCOPE_PATHS.has(pagePath)) {
      return `${pagePath}${u.search}${u.hash}`;
    }
    return `${LIVE_ORIGIN}${u.pathname}${u.search}${u.hash}`;
  }
  function rewriteLinks(document, payload) {
    const origins = sourceOrigins(payload);
    document.querySelectorAll("[href]").forEach((el) => {
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
  function convertClassHeadings(document) {
    document.querySelectorAll("p.h1, p.h2, p.h3, p.h4, p.h5, p.h6").forEach((p) => {
      if (!cleanText(p)) return;
      const level = [1, 2, 3, 4, 5, 6].find((n) => p.classList.contains(`h${n}`));
      const h = document.createElement(`h${level}`);
      if (level === 3) h.className = "heading-small";
      h.append(...p.childNodes);
      p.replaceWith(h);
    });
  }
  function markHeadingStyles(document) {
    let marked = 0;
    document.querySelectorAll(HEADING).forEach((h) => {
      const style = HEADING_STYLES.find((c) => h.classList.contains(c));
      if (!style || style === HEADING_DEFAULTS[h.tagName] || !cleanText(h) || /\{[a-z-]+\}\s*$/.test(h.textContent)) return;
      h.append(document.createTextNode(` {${style}}`));
      marked += 1;
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
      const tokens = [style, isFull(p) ? "full-width" : null].filter(Boolean);
      if (!tokens.length) return;
      p.append(document.createTextNode(` {${tokens.join(" ")}}`));
      marked += 1;
    });
    document.querySelectorAll("ul, ol").forEach((list) => {
      if (!isFull(list)) return;
      const items = [...list.children].filter((li) => li.tagName === "LI");
      const last = items[items.length - 1];
      if (!last || marker(last)) return;
      last.append(document.createTextNode(" {full-width}"));
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
  function detectTheme(document) {
    if (document.querySelector('link[href*="/digitalassistant/"][href$=".css"]')) {
      document.documentElement.setAttribute(THEME_ATTR, "digital-assistant");
    }
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
      const pagePath = currentPagePath(document, payload);
      detectTheme(document);
      convertBreadcrumbs(document, pagePath);
      convertFeedbackQuestionnaires(document);
      removeAll(document, CHROME_SELECTORS);
      removeAirCoreLeftovers(document);
      removeTracking(document);
      removeScreenReaderOnly(document);
      removeMobileDuplicates(document);
      rewriteAnchors(document, pagePath);
      convertJumpLinks(document);
      removeEmptyComponents(document);
      normalizeImages(document, true);
    }
    if (hookName === "afterTransform") {
      removeOverlays(document);
      removeAll(document, ["script", "noscript", "style", "link", 'iframe[src*="cookielaw"]']);
      convertMauiLinks(document);
      convertClassButtons(document);
      unwrapLinksWithoutHref(document);
      removeIconsAndZeroWidth(document);
      splitBrParagraphs(document);
      convertSeparators(document);
      normalizeImages(document, false);
      rewriteLinks(document, payload);
      stripTrackingAttributes(document);
      convertClassHeadings(document);
      markHeadingStyles(document);
      convertCaptions(document);
      markParagraphStyles(document);
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
  var REGION_STOP = '.section-content, .container-content, .column-view-item, [class*="col-"], .contentpage, main, body';
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
  var SPACER = /^\{(spacer|divider)-\d{1,3}( from-768)?\}$/;
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
          start.setAttribute(SOURCE_STYLE, style);
          region.before(start);
          region.after(createBreak(document));
        });
      });
      const padded = (s) => !!s.querySelector(":scope > div > .section-padding-y-regular");
      const grey = (s) => !!s.querySelector(":scope > .container-gray");
      const aemSections = [...document.querySelectorAll(".container-content > .section")].filter((s) => (s.textContent || "").replace(/[\s\u00a0\u200b]/g, "") || s.querySelector(MEDIA2));
      aemSections.forEach((s, i) => {
        if (!i) return;
        const hr = createBreak(document);
        if (padded(s) && !grey(s) && padded(aemSections[i - 1])) hr.setAttribute(SOURCE_STYLE, "padded");
        s.before(hr);
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

  // tools/importer/import-flight-status.js
  var PAGE_TEMPLATE = {
    "name": "flight-status",
    "description": "Timetable and flight status",
    "urls": [
      "https://www.lufthansa.com/de/en/timetable-and-flight-status"
    ],
    "blocks": [
      {
        "name": "flight-status",
        "instances": [
          ".flightstatustimetable"
        ]
      },
      {
        "name": "columns-media",
        "instances": [
          ".onecolumn .twocolumn:not(:has(.column-view-item > .image + .headline))",
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
        "name": "Flight status",
        "selector": [
          ".container-content > .section .section-content > .text:has(+ .flightstatustimetable), .container-content > .section .section-content > .flightstatustimetable"
        ],
        "style": null,
        "blocks": [
          "flight-status"
        ],
        "defaultContent": [
          ".container-content > .section .section-content > .text:has(+ .flightstatustimetable)"
        ]
      },
      {
        "id": "section-2",
        "name": "My bookings teaser",
        "selector": [
          ".container-content > .section .section-content > .text:has(+ .link), .container-content > .section .section-content > .text + .link"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".container-content > .section .section-content > .text:has(+ .link)",
          ".container-content > .section .section-content > .text + .link"
        ]
      },
      {
        "id": "section-3",
        "name": "App, airport information and time slot",
        "selector": [
          ".container-content > .section .section-content > .onecolumn .twocolumn"
        ],
        "style": null,
        "blocks": [
          "columns-media"
        ],
        "defaultContent": []
      },
      {
        "id": "section-4",
        "name": "Advice about text messaging in the USA and Canada",
        "selector": [
          ".container-content > .section .section-content > .onecolumn .column-view-item > .headline:has(+ .accordion), .container-content > .section .section-content > .onecolumn .column-view-item > .accordion",
          ".container-content > .section .section-content > .onecolumn .column-view-item > .separator + .headline, .container-content > .section .section-content > .onecolumn .column-view-item > .accordion"
        ],
        "style": null,
        "blocks": [
          "accordion-columns"
        ],
        "defaultContent": [
          ".container-content > .section .section-content > .onecolumn .column-view-item > .headline:has(+ .accordion)"
        ]
      }
    ]
  };
  var parsers = {
    "flight-status": parse,
    "columns-media": parse2,
    "accordion-columns": parse3
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
  var tmp_bundle_flight_status_157291_default = {
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
  return __toCommonJS(tmp_bundle_flight_status_157291_exports);
})();
