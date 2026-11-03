/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
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
  var import_magazine_exports = {};
  __export(import_magazine_exports, {
    assetOf: () => assetOf,
    clean: () => clean,
    commonParent: () => commonParent,
    creditsOf: () => creditsOf,
    default: () => import_magazine_default,
    docName: () => docName,
    isoDate: () => isoDate,
    transformPage: () => transformPage
  });
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
  var import_magazine_default = {
    transform: ({ document, params }) => {
      const wwwPath = new URL(params.originalURL).pathname.replace(/\.html?$/, "").replace(/\/$/, "");
      const main = transformPage(document, wwwPath);
      return [{
        element: main,
        path: docName(wwwPath),
        report: { title: document.title, template: "magazine" }
      }];
    }
  };
  return __toCommonJS(import_magazine_exports);
})();
