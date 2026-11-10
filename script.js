/* Swaminathan Sankaran: portfolio, editorial edition.
   Plain JavaScript, no dependencies. Every chart is drawn from the data below,
   which mirrors the projects' published results. */
(function () {
  "use strict";

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function svgEl(tag, attrs, parent) {
    var el = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(el);
    return el;
  }
  function el(tag, cls, parent, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    if (parent) parent.appendChild(node);
    return node;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function signed(v, d) { return (v < 0 ? "−" : "") + Math.abs(v).toFixed(d); }
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };
  function onVisible(node, cb, opts) {
    if (!node) return;
    if (!("IntersectionObserver" in window)) { cb(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.disconnect(); cb(); }
      });
    }, opts || { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
    io.observe(node);
  }

  /* ------------------------------------------------------------------
     Data
     ------------------------------------------------------------------ */

  // Grid forecast audit, 2025, as published: [EIA code, MAPE %, naive MAPE %, skill]
  var BAS = [
    ["PSEI", 29.9049, 4.7289, -5.3238], ["FPC", 23.2704, 6.2053, -2.7503], ["SPA", 101.4097, 38.1198, -1.6562],
    ["WAUW", 14.138, 6.902, -1.0486], ["PACW", 11.361, 5.5707, -1.0394], ["WACM", 19.9486, 9.7915, -1.0394],
    ["NEVP", 7.7398, 3.9701, -0.9478], ["WALC", 12.0319, 6.3564, -0.8929], ["AZPS", 10.2142, 5.6874, -0.7966],
    ["SWPP", 7.774, 4.3541, -0.7931], ["CISO", 8.279, 4.7073, -0.7771], ["GVL", 10.9044, 6.9359, -0.5755],
    ["DOPD", 6.4796, 4.2228, -0.5344], ["PNM", 6.3807, 4.3273, -0.4746], ["LDWP", 11.6992, 9.0305, -0.2955],
    ["PSCO", 7.5433, 6.5697, -0.1483], ["IPCO", 5.0149, 4.5068, -0.1127], ["PACE", 4.1102, 3.9436, -0.0423],
    ["LGEE", 7.727, 7.6854, -0.0055], ["HST", 6.483, 7.3342, 0.1156], ["SEC", 10.8528, 13.7273, 0.2143],
    ["FMPP", 4.2672, 5.5236, 0.2267], ["SRP", 3.935, 5.3122, 0.259], ["TEC", 4.5327, 6.1618, 0.2643],
    ["GCPD", 2.0311, 2.7631, 0.2649], ["PJM", 3.442, 4.9755, 0.3073], ["FPL", 3.2513, 4.792, 0.3221],
    ["SCL", 3.3912, 5.0268, 0.3254], ["SCEG", 4.8928, 7.3999, 0.3387], ["JEA", 4.7153, 7.4036, 0.3629],
    ["MISO", 2.3799, 4.1818, 0.4301], ["BPAT", 1.9959, 3.535, 0.4351], ["ERCO", 2.4606, 4.5232, 0.456],
    ["TAL", 4.1594, 7.7153, 0.4609], ["CHPD", 2.9739, 5.5505, 0.4642], ["TEPC", 2.5106, 4.7664, 0.4733],
    ["IID", 3.4716, 6.7227, 0.4847], ["CPLW", 4.2226, 8.3336, 0.4926], ["EPE", 3.1258, 6.1831, 0.4945],
    ["SC", 3.3982, 6.8435, 0.5035], ["NWMT", 2.2954, 4.6579, 0.5074], ["CPLE", 4.2792, 8.9397, 0.5213],
    ["NYIS", 2.6998, 5.76, 0.5313], ["TIDC", 3.0633, 6.7831, 0.5477], ["BANC", 2.3991, 5.4915, 0.5633],
    ["TPWR", 2.24, 5.4114, 0.5861], ["AVA", 1.7156, 4.5599, 0.6237], ["DUK", 2.5733, 7.0798, 0.6371],
    ["TVA", 2.3129, 6.599, 0.6495], ["ISNE", 2.5221, 7.9906, 0.6844], ["PGE", 1.4253, 4.7077, 0.6972],
    ["SOCO", 1.2162, 6.1144, 0.8014], ["AECI", 1.5473, 8.158, 0.8105]
  ];
  // "All corrections" variant: only these two operators change in 2025
  var CORRECTED = { CISO: [2.3516, 5.3289, 0.5594], SWPP: [2.0415, 4.3547, 0.5381] };
  var NAMES = {
    AECI: "Associated Electric Cooperative", AVA: "Avista", AZPS: "Arizona Public Service",
    BANC: "Balancing Authority of Northern California", BPAT: "Bonneville Power Administration",
    CHPD: "Chelan County PUD", CISO: "California ISO", CPLE: "Duke Energy Progress East",
    CPLW: "Duke Energy Progress West", DOPD: "Douglas County PUD", DUK: "Duke Energy Carolinas",
    EPE: "El Paso Electric", ERCO: "ERCOT (Texas)", FMPP: "Florida Municipal Power Pool",
    FPC: "Duke Energy Florida", FPL: "Florida Power & Light", GCPD: "Grant County PUD",
    GVL: "Gainesville Regional Utilities", HST: "City of Homestead", IID: "Imperial Irrigation District",
    IPCO: "Idaho Power", ISNE: "ISO New England", JEA: "JEA", LDWP: "Los Angeles Dept. of Water and Power",
    LGEE: "LG&E and KU", MISO: "Midcontinent ISO", NEVP: "Nevada Power", NWMT: "NorthWestern Energy",
    NYIS: "New York ISO", PACE: "PacifiCorp East", PACW: "PacifiCorp West", PGE: "Portland General Electric",
    PJM: "PJM Interconnection", PNM: "Public Service Co. of New Mexico", PSCO: "Public Service Co. of Colorado",
    PSEI: "Puget Sound Energy", SC: "Santee Cooper", SCEG: "Dominion Energy South Carolina",
    SCL: "Seattle City Light", SEC: "Seminole Electric Cooperative", SOCO: "Southern Company",
    SPA: "Southwestern Power Administration", SRP: "Salt River Project", SWPP: "Southwest Power Pool",
    TAL: "City of Tallahassee", TEC: "Tampa Electric", TEPC: "Tucson Electric Power",
    TIDC: "Turlock Irrigation District", TPWR: "Tacoma Power", TVA: "Tennessee Valley Authority",
    WACM: "WAPA Rocky Mountain", WALC: "WAPA Desert Southwest", WAUW: "WAPA Upper Great Plains West"
  };
  var HOT = { CISO: "California ISO", SWPP: "Southwest Power Pool" };

  // National error (total absolute error / total demand, 50-operator panel) and two operators' MAPE, %
  var YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  var NAT_PUB = [3.4282, 3.2488, 3.4314, 3.7163, 3.7818, 3.8091, 3.6631, 3.6263, 3.692, 4.0822];
  var NAT_COR = [3.3477, 3.2488, 3.4312, 3.7168, 3.7818, 3.8015, 3.5907, 3.4748, 3.4541, 3.4108];
  var CISO_PUB = [3.2826, 1.8743, 1.9777, 3.5923, 2.4475, 2.0865, 3.4935, 5.4737, 6.9935, 8.279];
  var CISO_COR = [1.9046, 1.8743, 1.9747, 3.6033, 2.4474, 1.9303, 2.1989, 2.5284, 2.1778, 2.3516];
  var SWPP_PUB = [2.5839, 3.3458, 3.2465, 3.4443, 4.0468, 3.6895, 3.721, 2.9489, 2.0169, 7.774];
  var SWPP_COR = [2.5839, 3.3458, 3.2465, 3.4443, 4.0468, 3.6895, 3.721, 2.9489, 2.0169, 2.0415];

  var CT = [
    ["3D-to-2D compressor + ResNet-18", 0.957, true],
    ["Depth statistics + ResNet-18", 0.86],
    ["2.5D ResNet-18", 0.789],
    ["Models Genesis U-Net", 0.729],
    ["Small 3D CNN", 0.657]
  ];
  var SEC = [
    ["Llama-3.1-8B", "", 44.4, 85.0],
    ["Qwen3-8B", "no thinking", 67.9, 88.7],
    ["Qwen3-8B", "thinking", 70.0, 90.1],
    ["Gemma-3-12B", "", 71.7, 88.4],
    ["gpt-oss-20b", "", 94.5, 94.2]
  ];

  // Fig. 1 readout: Apple's release for the quarter ended March 29, 2025 (validation set), Llama-3.1-8B's
  // replies under each prompt, graded against the 10-Q's XBRL values.
  // [10-Q value, v1 reply, v1 correct, v2 value, v2 unit, v2 value as printed]
  var READ = [
    ["95,359,000,000", "95359", false, "95359", "millions", "95,359"],
    ["24,780,000,000", "24780", false, "24780", "millions", "24,780"],
    ["1.65", "1.65", true, "1.65", "", ""]
  ];
  var READ_SUM = [
    "",
    "2 of 3 wrong: asked for raw dollars, it dropped the “millions”, so revenue and net income came out a million times too small.",
    "3 of 3 right: it copies each figure and names the unit, and code does the multiplying."
  ];
  var READ_ALT = [
    "",
    "Prompt v1, asking for raw dollars: Llama-3.1-8B replied 95359 for total net sales and 24780 for net income, a million times smaller than the 10-Q’s 95,359,000,000 and 24,780,000,000, and 1.65 for diluted EPS, which matches.",
    "Prompt v2, value plus unit: Llama-3.1-8B replied 95359 and 24780 in millions, which code converts to 95,359,000,000 and 24,780,000,000, both matching the 10-Q, and 1.65 for diluted EPS, which matches."
  ];

  var PROJECTS = ["SEC benchmark", "Grid audit", "Grounding probes", "Drift MLOps", "CT tamper", "Zolvit"];
  var MATRIX = [
    ["Languages and data", [
      ["Python", [1, 1, 1, 1, 1, 1]],
      ["SQL · PostgreSQL", [0, 0, 0, 1, 0, 0]],
      ["pandas", [0, 1, 0, 1, 0, 0]],
      ["Statistical testing", [0, 1, 0, 0, 0, 0]],
      ["Time series", [0, 1, 0, 0, 0, 0]],
      ["Matplotlib", [0, 1, 0, 0, 0, 0]]
    ]],
    ["Machine learning", [
      ["PyTorch", [1, 0, 1, 0, 1, 0]],
      ["Computer vision", [0, 0, 1, 0, 1, 0]],
      ["Vision-language models", [0, 0, 1, 0, 0, 0]],
      ["LLM evaluation", [1, 0, 0, 0, 0, 0]],
      ["vLLM", [1, 0, 0, 0, 0, 0]],
      ["XGBoost", [0, 0, 0, 1, 0, 1]],
      ["NLP · OCR · T5", [0, 0, 0, 0, 0, 1]],
      ["RAG · embeddings · search", [0, 0, 0, 0, 0, 1]],
      ["DICOM · medical imaging", [0, 0, 0, 0, 1, 0]]
    ]],
    ["MLOps and infrastructure", [
      ["Docker", [0, 0, 0, 1, 0, 1]],
      ["FastAPI", [0, 0, 0, 1, 0, 1]],
      ["Airflow", [0, 0, 0, 1, 0, 0]],
      ["MLflow", [0, 0, 0, 1, 0, 0]],
      ["Monitoring: Evidently, Prometheus, Grafana", [0, 0, 0, 1, 0, 1]],
      ["Kubernetes", [0, 0, 0, 1, 0, 0]],
      ["AWS", [0, 0, 0, 0, 0, 1]]
    ]],
    ["Practice", [
      ["pytest · automated tests", [1, 1, 1, 0, 0, 0]],
      ["Git · GitHub", [1, 1, 1, 1, 1, 0]]
    ]]
  ];

  /* ------------------------------------------------------------------
     Tooltip and toast
     ------------------------------------------------------------------ */

  var tip = $(".tip");
  function showTip(html, x, y) {
    if (!tip) return;
    tip.innerHTML = html;
    tip.hidden = false;
    var r = tip.getBoundingClientRect();
    var left = x + 14;
    var top = y - r.height - 12;
    if (left + r.width > window.innerWidth - 8) left = x - r.width - 14;
    if (left < 8) left = 8;
    if (top < 72) top = y + 18;
    tip.style.transform = "translate(" + Math.round(left) + "px," + Math.round(top) + "px)";
  }
  function hideTip() { if (tip) tip.hidden = true; }

  var toastEl = $(".toast");
  var toastTimer = 0;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2000);
  }

  /* ------------------------------------------------------------------
     Theme: day (light) and night (dark) editions
     ------------------------------------------------------------------ */

  function initEdition() {
    var btn = $("[data-edition-toggle]");
    if (!btn) return;
    var meta = $('meta[name="theme-color"]');
    function sync() {
      var dark = doc.getAttribute("data-theme") === "dark";
      $(".edition-label", btn).textContent = dark ? "Day" : "Night";
      btn.setAttribute("aria-label", dark ? "Switch to the day edition (light theme)" : "Switch to the night edition (dark theme)");
      if (meta) meta.setAttribute("content", dark ? "#14130f" : "#f4efe6");
    }
    function apply(theme) {
      doc.setAttribute("data-theme", theme);
      store.set("edition", theme);
      sync();
    }
    btn.addEventListener("click", function () {
      var next = doc.getAttribute("data-theme") === "dark" ? "light" : "dark";
      if (!document.startViewTransition || reduceMotion) { apply(next); return; }
      var r = btn.getBoundingClientRect();
      var x = r.left + r.width / 2;
      var y = r.top + r.height / 2;
      var end = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      var t = document.startViewTransition(function () { apply(next); });
      t.ready.then(function () {
        doc.animate(
          { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + end + "px at " + x + "px " + y + "px)"] },
          { duration: 750, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)", pseudoElement: "::view-transition-new(root)" }
        );
      }).catch(function () { /* transition skipped */ });
    });
    sync();

    // Paper colors for printing, whichever edition is showing
    var shown = null;
    window.addEventListener("beforeprint", function () {
      shown = doc.getAttribute("data-theme");
      doc.setAttribute("data-theme", "light");
    });
    window.addEventListener("afterprint", function () {
      if (shown) doc.setAttribute("data-theme", shown);
      shown = null;
    });
  }

  /* ------------------------------------------------------------------
     Masthead: scrolled state, progress, active section
     ------------------------------------------------------------------ */

  function initMasthead() {
    var head = $("[data-masthead]");
    var bar = $(".masthead-progress span");
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY;
      if (head) head.classList.toggle("is-scrolled", y > 8);
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = "scaleX(" + (h > 0 ? clamp(y / h, 0, 1) : 0) + ")";
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();

    var links = $$(".nav a");
    if (!("IntersectionObserver" in window) || !links.length) return;
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-active"); });
        var a = byId[e.target.id];
        if (a) a.classList.add("is-active");
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(byId).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }

  /* ------------------------------------------------------------------
     Index dialog (menu on small screens)
     ------------------------------------------------------------------ */

  function initIndex() {
    var dlg = $("#index-dialog");
    var open = $("[data-open-index]");
    if (!dlg || !open || typeof dlg.showModal !== "function") return;
    open.addEventListener("click", function () { dlg.showModal(); });
    $$("[data-close-index]", dlg).forEach(function (n) {
      n.addEventListener("click", function () { dlg.close(); });
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  }

  /* ------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------ */

  function initReveal() {
    var targets = $$(".section-head, .finding-head, .fig-one, .finding-copy, .plate, .ledger, .on-file, .cv-row, .matrix-wrap, .also, .about-photo, .about-copy, .contact-title, .contact-sub, .contact-actions, .contact-links");
    if (!("IntersectionObserver" in window) || reduceMotion) return;
    targets.forEach(function (t) { t.classList.add("reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ------------------------------------------------------------------
     Fig. 2: every operator's 2025 skill, as published and corrected
     ------------------------------------------------------------------ */

  function initSwarm() {
    var host = $('[data-chart="swarm"]');
    if (!host) return;
    var countEl = $("[data-fig1-count]");
    var captionEl = $("[data-fig1-caption]");
    var buttons = $$("[data-fig1-state]");
    var XMIN = -2, XMAX = 1;
    var state = "published";
    var touched = false;
    var W = 0, H = 0, R = 6, m = null;
    var pos = {};        // code -> {x, y} currently drawn
    var target = {};     // code -> {x, y}
    var order = [];      // codes sorted by drawn x
    var focusIdx = -1;
    var anim = 0;

    var svg = svgEl("svg", { class: "chart-svg", "aria-hidden": "true" }, host);
    var gZone = svgEl("g", null, svg);
    var gAxis = svgEl("g", null, svg);
    var gArrow = svgEl("g", null, svg);
    var gDots = svgEl("g", null, svg);
    var gLabels = svgEl("g", null, svg);

    var dots = {};
    BAS.forEach(function (b) {
      var c = svgEl("circle", { class: "swarm-dot" + (HOT[b[0]] ? " is-hot" : ""), r: R }, gDots);
      dots[b[0]] = c;
    });
    // Draw the two highlighted operators last so they sit on top
    Object.keys(HOT).forEach(function (k) { gDots.appendChild(dots[k]); });

    var ghosts = {};
    Object.keys(HOT).forEach(function (k) {
      ghosts[k] = svgEl("circle", { class: "swarm-ghost", r: R + 1, opacity: 0 }, gArrow);
    });
    var arrow = svgEl("path", { class: "swarm-arrow", opacity: 0 }, gArrow);
    var arrowHead = svgEl("path", { class: "swarm-arrow-head", opacity: 0 }, gArrow);
    var labels = {};
    Object.keys(HOT).forEach(function (k, i) {
      var g = svgEl("g", { class: "swarm-label" }, gLabels);
      var line = svgEl("line", { class: "leader" }, g);
      var t1 = svgEl("text", { class: "t-text t-ink t-strong halo" }, g);
      var t2 = svgEl("text", { class: "t-text halo" }, g);
      labels[k] = { g: g, line: line, name: t1, val: t2, above: i === 0 };
    });

    function skillOf(b, which) {
      return which === "corrected" && CORRECTED[b[0]] ? CORRECTED[b[0]][2] : b[3];
    }
    function X(v) { return m.l + (v - XMIN) / (XMAX - XMIN) * (W - m.l - m.r); }

    function layout(which) {
      var cy = m.t + (H - m.t - m.b) / 2;
      var gap = R * 2 + 1.6;
      var pts = BAS.map(function (b) { return { code: b[0], v: skillOf(b, which) }; });
      var off = pts.filter(function (p) { return p.v < XMIN; }).sort(function (a, b) { return a.v - b.v; });
      var vis = pts.filter(function (p) { return p.v >= XMIN; });
      vis.sort(function (a, b) {
        var ha = HOT[a.code] ? 0 : 1, hb = HOT[b.code] ? 0 : 1;
        return ha - hb || a.v - b.v;
      });
      var placed = [];
      var out = {};
      vis.forEach(function (p) {
        var x = X(p.v), y = cy;
        for (var k = 0; k < 400; k++) {
          var dy = k === 0 ? 0 : Math.ceil(k / 2) * (k % 2 ? -1 : 1);
          var yy = cy + dy;
          var ok = true;
          for (var j = 0; j < placed.length; j++) {
            var q = placed[j];
            var dx = q.x - x, dyy = q.y - yy;
            if (dx * dx + dyy * dyy < gap * gap) { ok = false; break; }
          }
          if (ok) { y = yy; break; }
        }
        placed.push({ x: x, y: y });
        out[p.code] = { x: x, y: y, v: p.v };
      });
      off.forEach(function (p, i) {
        out[p.code] = { x: m.l - 26, y: cy + (i - (off.length - 1) / 2) * (gap + 6), v: p.v, off: true };
      });
      return out;
    }

    function drawStatic() {
      gZone.textContent = "";
      gAxis.textContent = "";
      var top = m.t - 4, bottom = H - m.b;
      svgEl("rect", { class: "bad-zone", x: X(XMIN), y: 0, width: X(0) - X(XMIN), height: bottom }, gZone);
      svgEl("line", { class: "zero-line", x1: X(0), x2: X(0), y1: 0, y2: bottom }, gZone);
      var small = W < 600;
      var t1 = svgEl("text", { x: X(0) - 10, y: 18, "text-anchor": "end" }, gZone);
      t1.textContent = small ? "← LOSES TO NAIVE" : "← LOSES TO THE NAIVE FORECAST";
      var t2 = svgEl("text", { x: X(0) + 10, y: 18 }, gZone);
      t2.textContent = small ? "BEATS IT →" : "BEATS IT →";
      var ticks = small ? [-2, -1, 0, 1] : [-2, -1.5, -1, -0.5, 0, 0.5, 1];
      ticks.forEach(function (v) {
        svgEl("line", { class: "gridline", x1: X(v), x2: X(v), y1: bottom, y2: bottom + 5 }, gAxis);
        var t = svgEl("text", { x: X(v), y: bottom + 18, "text-anchor": "middle" }, gAxis);
        t.textContent = v === 0 ? "0" : signed(v, v % 1 ? 1 : 0);
      });
      if (!small) {
        var lab = svgEl("text", { x: W - m.r, y: bottom - 8, "text-anchor": "end" }, gAxis);
        lab.textContent = "SKILL";
      }
      // Off-scale marker
      var offText = svgEl("text", { x: m.l - 26, y: bottom - 8, "text-anchor": "middle" }, gAxis);
      offText.textContent = "OFF SCALE";
      svgEl("line", { class: "gridline", x1: m.l - 8, x2: m.l - 8, y1: top + 30, y2: bottom - 22, "stroke-dasharray": "2 3" }, gAxis);
      top = top; // keep linter quiet about reassignment
    }

    function placeLabels() {
      Object.keys(HOT).forEach(function (k) {
        var L = labels[k], p = pos[k];
        if (!p) return;
        var small = W < 600;
        var ly = L.above ? m.t + 22 : H - m.b - 24;
        var anchorX = clamp(p.x, m.l + 70, W - m.r - 70);
        var b = BAS.filter(function (r) { return r[0] === k; })[0];
        var v = state === "corrected" && anim === 0 ? CORRECTED[k][2] : (anim ? null : b[3]);
        L.line.setAttribute("x1", p.x);
        L.line.setAttribute("x2", p.x);
        L.line.setAttribute("y1", L.above ? ly + 6 : ly - 16);
        L.line.setAttribute("y2", L.above ? p.y - R - 3 : p.y + R + 3);
        L.name.setAttribute("x", anchorX);
        L.name.setAttribute("y", L.above ? ly - 10 : ly);
        L.name.setAttribute("text-anchor", "middle");
        L.name.textContent = small && k === "SWPP" ? "SW Power Pool" : HOT[k];
        L.val.setAttribute("x", anchorX);
        L.val.setAttribute("y", L.above ? ly + 4 : ly + 14);
        L.val.setAttribute("text-anchor", "middle");
        L.val.textContent = v == null ? "" : "skill " + signed(v, 2);
      });
    }

    function drawDots() {
      BAS.forEach(function (b) {
        var p = pos[b[0]];
        var c = dots[b[0]];
        c.setAttribute("cx", p.x.toFixed(1));
        c.setAttribute("cy", p.y.toFixed(1));
        c.setAttribute("r", HOT[b[0]] ? R + 1.5 : R);
        c.classList.toggle("swarm-off", !!p.off);
      });
      placeLabels();
    }

    function drawArrow(show) {
      var a = pos.CISO, b = pos.SWPP;
      var from = target.__pub;
      if (!from) return;
      Object.keys(HOT).forEach(function (k) {
        var clash = Object.keys(pos).some(function (o) {
          if (HOT[o] || o.indexOf("__") === 0) return false;
          return Math.hypot(pos[o].x - from[k].x, pos[o].y - from[k].y) < R * 2;
        });
        ghosts[k].setAttribute("cx", from[k].x);
        ghosts[k].setAttribute("cy", from[k].y);
        ghosts[k].setAttribute("r", R + 1.5);
        ghosts[k].setAttribute("opacity", show && !clash ? 1 : 0);
      });
      var x1 = (from.CISO.x + from.SWPP.x) / 2;
      var x2 = (a.x + b.x) / 2;
      var yTop = m.t + 30;
      var y1 = Math.min(from.CISO.y, from.SWPP.y) - R - 6;
      var y2 = Math.min(a.y, b.y) - R - 10;
      var cx = (x1 + x2) / 2;
      arrow.setAttribute("d", "M" + x1 + "," + y1 + " Q" + cx + "," + (yTop - 10) + " " + x2 + "," + y2);
      var ang = Math.atan2(y2 - (yTop - 10), x2 - cx);
      var s = 6;
      var p1 = [x2 - s * Math.cos(ang - 0.45), y2 - s * Math.sin(ang - 0.45)];
      var p2 = [x2 - s * Math.cos(ang + 0.45), y2 - s * Math.sin(ang + 0.45)];
      arrowHead.setAttribute("d", "M" + x2 + "," + y2 + " L" + p1[0] + "," + p1[1] + " L" + p2[0] + "," + p2[1] + " Z");
      arrow.setAttribute("opacity", show ? 1 : 0);
      arrowHead.setAttribute("opacity", show ? 1 : 0);
    }

    function measure() {
      W = host.clientWidth;
      H = host.clientHeight;
      var small = W < 600;
      R = small ? 3.5 : 6;
      m = { l: small ? 54 : 74, r: small ? 10 : 16, t: 34, b: 28 };
    }

    function render() {
      measure();
      if (!W || !H) return;
      drawStatic();
      target.__pub = layout("published");
      target.__cor = layout("corrected");
      var t = state === "corrected" ? target.__cor : target.__pub;
      pos = {};
      Object.keys(t).forEach(function (k) { pos[k] = { x: t[k].x, y: t[k].y, off: t[k].off }; });
      drawDots();
      drawArrow(state === "corrected");
      sortOrder();
    }

    function sortOrder() {
      order = BAS.map(function (b) { return b[0]; }).sort(function (a, b) {
        return pos[a].x - pos[b].x || pos[a].y - pos[b].y;
      });
    }

    function setCount(to) {
      if (!countEl) return;
      var from = parseInt(countEl.textContent, 10);
      countEl.classList.toggle("is-cor", to !== 19);
      if (reduceMotion || from === to) { countEl.textContent = String(to); return; }
      var stepDir = to > from ? 1 : -1;
      var n = from;
      var iv = setInterval(function () {
        n += stepDir;
        countEl.textContent = String(n);
        if (n === to) clearInterval(iv);
      }, 260);
    }

    function setState(next, fromUser) {
      if (fromUser) touched = true;
      if (next === state) return;
      state = next;
      buttons.forEach(function (b) {
        var on = b.getAttribute("data-fig1-state") === next;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      Object.keys(HOT).forEach(function (k) { dots[k].classList.toggle("is-fixed", next === "corrected"); });
      setCount(next === "corrected" ? 17 : 19);
      if (captionEl) {
        captionEl.innerHTML = next === "corrected"
          ? "<strong>Corrected.</strong> With its demand moved back an hour and battery charging taken out, California ISO scores 0.56. With its forecast replaced by SPP\u2019s own from 7 May, Southwest Power Pool scores 0.54. Both now beat the naive forecast."
          : "<strong>As published.</strong> California ISO and Southwest Power Pool both lose to the naive forecast. Press <em>Corrected</em> to apply the three data fixes explained below.";
      }
      var dest = next === "corrected" ? target.__cor : target.__pub;
      var start = {};
      Object.keys(pos).forEach(function (k) { start[k] = { x: pos[k].x, y: pos[k].y, off: pos[k].off }; });
      cancelAnimationFrame(anim);
      drawArrow(false);
      if (reduceMotion) {
        Object.keys(dest).forEach(function (k) { pos[k] = { x: dest[k].x, y: dest[k].y, off: dest[k].off }; });
        anim = 0;
        drawDots();
        drawArrow(next === "corrected");
        sortOrder();
        return;
      }
      var t0 = performance.now();
      var DUR = 1300;
      function tick(now) {
        var t = clamp((now - t0) / DUR, 0, 1);
        var e = easeInOut(t);
        Object.keys(dest).forEach(function (k) {
          var s = start[k], d = dest[k];
          // the corrected operators travel on an arc
          var lift = HOT[k] ? Math.sin(Math.PI * e) * -(H * 0.18) : 0;
          pos[k] = { x: lerp(s.x, d.x, e), y: lerp(s.y, d.y, e) + lift, off: d.off };
        });
        drawDots();
        if (t < 1) { anim = requestAnimationFrame(tick); }
        else {
          anim = 0;
          drawDots();
          drawArrow(next === "corrected");
          sortOrder();
        }
      }
      anim = requestAnimationFrame(tick);
    }

    buttons.forEach(function (b) {
      b.addEventListener("click", function () { setState(b.getAttribute("data-fig1-state"), true); });
    });

    // Hover, touch and keyboard
    function tipFor(code) {
      var b = BAS.filter(function (r) { return r[0] === code; })[0];
      var corr = state === "corrected" && CORRECTED[code];
      var mape = corr ? CORRECTED[code][0] : b[1];
      var naive = corr ? CORRECTED[code][1] : b[2];
      var sk = corr ? CORRECTED[code][2] : b[3];
      return "<strong>" + NAMES[code] + "</strong>" +
        "Skill " + signed(sk, 2) + (sk < 0 ? ", loses to naive" : ", beats naive") +
        (sk < XMIN ? " (off scale)" : "") +
        '<br><span class="tip-mono">' + code + " · error " + mape.toFixed(2) + "% · naive " + naive.toFixed(2) + "%</span>" +
        (corr ? '<br><span class="tip-mono">Corrected value</span>' : "");
    }
    function focusDot(code, clientX, clientY) {
      BAS.forEach(function (b) { dots[b[0]].classList.toggle("is-focus", b[0] === code); });
      if (!code) { hideTip(); return; }
      var r = host.getBoundingClientRect();
      var p = pos[code];
      showTip(tipFor(code), clientX != null ? clientX : r.left + p.x, clientY != null ? clientY : r.top + p.y);
    }
    function nearest(clientX, clientY) {
      var r = host.getBoundingClientRect();
      var x = clientX - r.left, y = clientY - r.top;
      var best = null, bd = 18 * 18;
      Object.keys(pos).forEach(function (k) {
        if (k.indexOf("__") === 0) return;
        var dx = pos[k].x - x, dy = pos[k].y - y, d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = k; }
      });
      return best;
    }
    host.addEventListener("pointermove", function (e) {
      if (anim) return;
      var k = nearest(e.clientX, e.clientY);
      focusDot(k, e.clientX, e.clientY);
      if (k) focusIdx = order.indexOf(k);
    });
    host.addEventListener("pointerleave", function () { focusDot(null); });
    host.addEventListener("keydown", function (e) {
      var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (e.key in keys) {
        e.preventDefault();
        focusIdx = focusIdx < 0 ? (keys[e.key] > 0 ? 0 : order.length - 1) : clamp(focusIdx + keys[e.key], 0, order.length - 1);
        focusDot(order[focusIdx]);
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        focusIdx = e.key === "Home" ? 0 : order.length - 1;
        focusDot(order[focusIdx]);
      } else if (e.key === "Escape") {
        focusDot(null);
      }
    });
    host.addEventListener("blur", function () { focusDot(null); });

    // Table
    var table = $('[data-table="swarm"]');
    if (table) {
      var rows = BAS.slice().sort(function (a, b) { return a[3] - b[3]; }).map(function (b) {
        var c = CORRECTED[b[0]];
        return "<tr><td>" + NAMES[b[0]] + " (" + b[0] + ")</td><td>" + signed(b[3], 2) + "</td><td>" + (c ? signed(c[2], 2) : "same") +
          "</td><td>" + b[1].toFixed(2) + "</td><td>" + (c ? c[0].toFixed(2) : "same") + "</td><td>" + b[2].toFixed(2) + "</td></tr>";
      }).join("");
      table.innerHTML = "<table><thead><tr><th>Operator</th><th>Skill, published</th><th>Skill, corrected</th><th>Error %, published</th><th>Error %, corrected</th><th>Naive error %, published</th></tr></thead><tbody>" + rows + "</tbody></table>";
    }

    render();
    if ("ResizeObserver" in window) {
      var lastW = 0;
      new ResizeObserver(function () {
        if (Math.abs(host.clientWidth - lastW) < 1) return;
        lastW = host.clientWidth;
        cancelAnimationFrame(anim);
        anim = 0;
        render();
      }).observe(host);
    }

    // Play the correction once when the figure is first seen
    if (!reduceMotion) {
      onVisible(host, function () {
        setTimeout(function () { if (!touched) setState("corrected", false); }, 1500);
      }, { threshold: 0.6 });
    }
  }

  /* ------------------------------------------------------------------
     Fig. 3: scroll-driven line chart for Finding 02
     ------------------------------------------------------------------ */

  function initScrolly() {
    var host = $('[data-chart="scrolly"]');
    if (!host) return;
    var cards = $$(".step .step-card");
    var titleEl = $("[data-scene-title]");
    var subEl = $("[data-scene-sub]");
    var labelEl = $("[data-scene-label]");
    var statusEl = $("[data-scene-status]");
    var legendCor = $('[data-legend="cor"]');

    var SCENES = [
      {
        title: "National forecast error by year", sub: "Total absolute error ÷ total demand, 50 operators present every year, %",
        y: [3, 4.4], ticks: [3, 3.5, 4], pub: NAT_PUB, cor: null, shades: [],
        ends: { pub: "4.08%" }, callout: [["pub", "As published: +0.061 points a year"], ["", "Mann–Kendall p = 0.049, 2025 the worst year"]],
        calloutShort: [["pub", "+0.061 a year, p = 0.049"], ["", "2025: the worst year"]],
        aria: "National forecast error by year as published, rising from 3.43 percent in 2016 to 4.08 percent in 2025, the worst of the ten years."
      },
      {
        title: "California ISO forecast error by year", sub: "MAPE, %. Shaded: EIA-930 has its demand an hour late",
        y: [0, 9], ticks: [0, 2, 4, 6, 8], pub: CISO_PUB, cor: CISO_COR,
        shades: [[2016, 2016.7, ""], [2022.45, 2025.92, "Demand an hour late", "Hour late"]],
        ends: { pub: "8.28%", cor: "2.35%" }, callout: [],
        aria: "California ISO forecast error by year. As published it climbs from 3.49 percent in 2022 to 8.28 percent in 2025, inside the span where its demand runs an hour late. Corrected, it stays near 2 percent and is 2.35 percent in 2025."
      },
      {
        title: "Southwest Power Pool forecast error by year", sub: "MAPE, %. Shaded: its forecast no longer matches SPP\u2019s own",
        y: [0, 9], ticks: [0, 2, 4, 6, 8], pub: SWPP_PUB, cor: SWPP_COR,
        shades: [[2025.35, 2026, "Forecast changes", "Changes"]],
        ends: { pub: "7.77%", cor: "2.04%" }, callout: [],
        aria: "Southwest Power Pool forecast error by year: between 2.0 and 4.0 percent through 2024, then 7.77 percent in 2025 as published and 2.04 percent with SPP\u2019s own forecast swapped in from 7 May."
      },
      {
        title: "National forecast error, as published and corrected", sub: "Total absolute error ÷ total demand, 50 operators present every year, %",
        y: [3, 4.4], ticks: [3, 3.5, 4], pub: NAT_PUB, cor: NAT_COR, shades: [],
        ends: { pub: "4.08%", cor: "3.41%" },
        callout: [["pub", "As published: +0.061 a year, p = 0.049"], ["cor", "Corrected: +0.009 a year, p = 0.721"]],
        calloutShort: [["pub", "+0.061 a year, p = 0.049"], ["cor", "+0.009 a year, p = 0.721"]],
        aria: "National forecast error by year, as published and corrected. As published, 2025 is 4.08 percent, the worst year. Corrected, 2025 is 3.41 percent, 8th-worst of ten, and the trend is flat."
      },
      {
        title: "National forecast error, as published and corrected", sub: "Total absolute error ÷ total demand, 50 operators present every year, %",
        y: [3, 4.4], ticks: [3, 3.5, 4], pub: NAT_PUB, cor: NAT_COR, shades: [],
        ends: { pub: "4.08%", cor: "3.41%" },
        callout: [["cor", "Corrections added after the"], ["", "pre-registered results"]], dashed: true,
        calloutShort: [["cor", "Added after the"], ["", "pre-registered results"]],
        aria: "National forecast error by year, as published and corrected. The corrections were added after the pre-registered results."
      }
    ];

    var svg = svgEl("svg", { class: "chart-svg", "aria-hidden": "true" }, host);
    var gGrid = svgEl("g", null, svg);
    var gShade = svgEl("g", null, svg);
    var gX = svgEl("g", null, svg);
    var gLines = svgEl("g", null, svg);
    var pathCor = svgEl("path", { class: "line-cor" }, gLines);
    var pathPub = svgEl("path", { class: "line-pub" }, gLines);
    var gPts = svgEl("g", null, svg);
    var ptsCor = YEARS.map(function () { return svgEl("circle", { class: "pt-cor", r: 3.5 }, gPts); });
    var ptsPub = YEARS.map(function () { return svgEl("circle", { class: "pt-pub", r: 3.5 }, gPts); });
    var gNotes = svgEl("g", null, svg);

    var W = 0, H = 0, m = null;
    var idx = 0;
    var cur = { y0: 3, y1: 4.4, pub: NAT_PUB.slice(), cor: NAT_PUB.slice(), corA: 0 };
    var anim = 0;

    function measure() {
      W = host.clientWidth;
      H = host.clientHeight;
      m = { l: 40, r: W < 520 ? 52 : 64, t: 12, b: 26 };
    }
    function X(t) { return m.l + (t - 2016) / 10 * (W - m.l - m.r); }
    function Y(v, st) { return m.t + (1 - (v - st.y0) / (st.y1 - st.y0)) * (H - m.t - m.b); }
    function linePath(vals, st) {
      return vals.map(function (v, i) { return (i ? "L" : "M") + X(YEARS[i] + 0.5).toFixed(1) + "," + Y(v, st).toFixed(1); }).join(" ");
    }

    function drawFrame(st, sc, tickAlpha) {
      gGrid.textContent = "";
      sc.ticks.forEach(function (v) {
        var y = Y(v, st);
        if (y < m.t - 2 || y > H - m.b + 2) return;
        svgEl("line", { class: "gridline", x1: m.l, x2: W - m.r, y1: y, y2: y, opacity: tickAlpha }, gGrid);
        var t = svgEl("text", { x: m.l - 8, y: y + 4, "text-anchor": "end", opacity: tickAlpha }, gGrid);
        t.textContent = (sc.y[1] < 5 ? v.toFixed(1) : String(v)) + "%";
      });
      svgEl("line", { class: "baseline", x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b }, gGrid);
      pathPub.setAttribute("d", linePath(st.pub, st));
      pathCor.setAttribute("d", linePath(st.cor, st));
      pathCor.setAttribute("opacity", st.corA);
      YEARS.forEach(function (yr, i) {
        ptsPub[i].setAttribute("cx", X(yr + 0.5));
        ptsPub[i].setAttribute("cy", Y(st.pub[i], st));
        ptsCor[i].setAttribute("cx", X(yr + 0.5));
        ptsCor[i].setAttribute("cy", Y(st.cor[i], st));
        ptsCor[i].setAttribute("opacity", st.corA);
      });
    }

    function drawAxis() {
      gX.textContent = "";
      var small = W < 520;
      YEARS.forEach(function (yr) {
        if (small && yr % 3 !== 1 && yr !== 2025) return;
        var t = svgEl("text", { x: X(yr + 0.5), y: H - m.b + 17, "text-anchor": "middle" }, gX);
        t.textContent = small ? "’" + String(yr).slice(2) : String(yr);
      });
    }

    function drawShades(sc) {
      gShade.textContent = "";
      sc.shades.forEach(function (s) {
        var x1 = X(s[0]), x2 = X(s[1]);
        svgEl("rect", { class: "shade note-in", x: x1, y: m.t, width: Math.max(1, x2 - x1), height: H - m.t - m.b }, gShade);
        if (s[2]) {
          var text = (W < 520 && s[3] ? s[3] : s[2]).toUpperCase();
          var inside = x2 - x1 >= text.length * 6.8 + 12;
          var t = svgEl("text", { class: "note-in", x: inside ? x1 + 6 : x1 - 6, y: m.t + 14, "text-anchor": inside ? "start" : "end" }, gShade);
          t.textContent = text;
        }
      });
    }

    function drawNotes(sc, st) {
      gNotes.textContent = "";
      var last = YEARS.length - 1;
      var xEnd = X(YEARS[last] + 0.5) + 9;
      var yPub = Y(st.pub[last], st), yCor = Y(st.cor[last], st);
      if (sc.cor && Math.abs(yPub - yCor) < 16) {
        var mid = (yPub + yCor) / 2;
        if (yPub < yCor) { yPub = mid - 8; yCor = mid + 8; } else { yPub = mid + 8; yCor = mid - 8; }
      }
      if (sc.ends.pub) {
        var tp = svgEl("text", { class: "t-text t-ink t-strong note-in halo", x: xEnd, y: yPub + 4 }, gNotes);
        tp.textContent = sc.ends.pub;
      }
      if (sc.ends.cor && sc.cor) {
        var tc = svgEl("text", { class: "t-text t-ink t-strong note-in halo", x: xEnd, y: yCor + 4 }, gNotes);
        tc.textContent = sc.ends.cor;
      }
      var lines = W < 520 && sc.calloutShort ? sc.calloutShort : sc.callout;
      lines.forEach(function (c, i) {
        var y = m.t + 16 + i * 18;
        var x = m.l + 12;
        if (c[0]) {
          svgEl("line", { class: (c[0] === "pub" ? "line-pub" : "line-cor" + (sc.dashed ? " is-dashed" : "")) + " note-in", x1: x, x2: x + 14, y1: y - 4, y2: y - 4 }, gNotes);
        }
        var t = svgEl("text", { class: "t-text note-in", x: x + (c[0] ? 20 : 20), y: y }, gNotes);
        t.textContent = c[1];
      });
    }

    function setHeader(sc, i) {
      if (titleEl) titleEl.textContent = sc.title;
      if (subEl) subEl.textContent = sc.sub;
      if (labelEl) labelEl.textContent = "Fig. 3 · Step " + (i + 1) + " of " + SCENES.length;
      if (legendCor) legendCor.classList.toggle("is-off", !sc.cor);
      host.setAttribute("aria-label", sc.aria);
      pathCor.classList.toggle("is-dashed", !!sc.dashed);
      if (statusEl) statusEl.textContent = "Step " + (i + 1) + " of " + SCENES.length + ": " + sc.aria;
    }

    function targetState(sc) {
      return { y0: sc.y[0], y1: sc.y[1], pub: sc.pub.slice(), cor: (sc.cor || sc.pub).slice(), corA: sc.cor ? 1 : 0 };
    }

    function full() {
      measure();
      if (!W || !H) return;
      var sc = SCENES[idx];
      drawAxis();
      drawShades(sc);
      drawFrame(cur, sc, 1);
      drawNotes(sc, cur);
    }

    function go(i) {
      if (i === idx) return;
      var from = { y0: cur.y0, y1: cur.y1, pub: cur.pub.slice(), cor: cur.cor.slice(), corA: cur.corA };
      idx = i;
      var sc = SCENES[i];
      var to = targetState(sc);
      setHeader(sc, i);
      gNotes.textContent = "";
      gShade.textContent = "";
      cancelAnimationFrame(anim);
      if (reduceMotion) {
        cur = to;
        full();
        return;
      }
      var t0 = performance.now();
      var DUR = 950;
      function tick(now) {
        var t = clamp((now - t0) / DUR, 0, 1);
        var e = easeInOut(t);
        cur = {
          y0: lerp(from.y0, to.y0, e), y1: lerp(from.y1, to.y1, e),
          pub: from.pub.map(function (v, k) { return lerp(v, to.pub[k], e); }),
          cor: from.cor.map(function (v, k) { return lerp(v, to.cor[k], e); }),
          corA: lerp(from.corA, to.corA, e)
        };
        drawFrame(cur, sc, 0.25 + 0.75 * e);
        if (t < 1) anim = requestAnimationFrame(tick);
        else { anim = 0; cur = to; full(); }
      }
      anim = requestAnimationFrame(tick);
    }

    // Table
    var table = $('[data-table="scrolly"]');
    if (table) {
      var rows = YEARS.map(function (yr, i) {
        return "<tr><td>" + yr + "</td><td>" + NAT_PUB[i].toFixed(2) + "</td><td>" + NAT_COR[i].toFixed(2) + "</td><td>" + CISO_PUB[i].toFixed(2) +
          "</td><td>" + CISO_COR[i].toFixed(2) + "</td><td>" + SWPP_PUB[i].toFixed(2) + "</td><td>" + SWPP_COR[i].toFixed(2) + "</td></tr>";
      }).join("");
      table.innerHTML = "<table><thead><tr><th>Year</th><th>National, published</th><th>National, corrected</th><th>California ISO, published</th><th>California ISO, corrected</th><th>SWPP, published</th><th>SWPP, corrected</th></tr></thead><tbody>" + rows +
        '</tbody></table><p class="plate-note">National: total absolute error ÷ total demand over the 50 operators present every year. Operators: MAPE. Corrected = the audit\u2019s “All corrections” variant. All values in %.</p>';
    }

    setHeader(SCENES[0], 0);
    full();
    if ("ResizeObserver" in window) {
      var lastW = 0, lastH = 0;
      new ResizeObserver(function () {
        if (Math.abs(host.clientWidth - lastW) < 1 && Math.abs(host.clientHeight - lastH) < 1) return;
        lastW = host.clientWidth;
        lastH = host.clientHeight;
        if (!anim) full();
      }).observe(host);
    }

    // Steps
    var steps = $$(".step");
    function activate(i) {
      steps.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
      go(i);
    }
    if (!("IntersectionObserver" in window)) { activate(0); return; }
    var io = null;
    function observe() {
      if (io) io.disconnect();
      var narrow = window.matchMedia("(max-width: 899px)").matches;
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) activate(cards.indexOf(e.target));
        });
      }, { rootMargin: narrow ? "-55% 0px -25% 0px" : "-46% 0px -46% 0px" });
      cards.forEach(function (c) { io.observe(c); });
    }
    observe();
    steps[0].classList.add("is-active");
    window.matchMedia("(max-width: 899px)").addEventListener("change", observe);
  }

  /* ------------------------------------------------------------------
     Fig. 4: waffles and the 51 misses
     ------------------------------------------------------------------ */

  function initWaffles() {
    $$(".waffle").forEach(function (w) {
      var v = parseFloat(w.getAttribute("data-waffle"));
      var full = Math.floor(v), frac = v - full;
      for (var i = 0; i < 100; i++) {
        var row = Math.floor(i / 10), col = i % 10;
        var rank = (9 - row) * 10 + col; // fill from the bottom row up
        var cell = el("i", null, w);
        if (rank < full) cell.className = "on";
        else if (rank === full && frac > 0.001) { cell.className = "on"; cell.style.setProperty("--f", frac.toFixed(3)); }
        cell.style.setProperty("--delay", (rank * 9) + "ms");
      }
    });
    $$(".zero-dots").forEach(function (z) {
      var n = parseInt(z.getAttribute("data-zero"), 10);
      for (var i = 0; i < n; i++) {
        var d = el("i", null, z);
        d.style.setProperty("--delay", (i * 16) + "ms");
      }
    });
    var plate = $("#finding-probes .plate");
    if (reduceMotion) { if (plate) plate.classList.add("is-in"); return; }
    onVisible(plate, function () { plate.classList.add("is-in"); });
  }

  /* ------------------------------------------------------------------
     Fig. 5: the retraining loop, with a runner that lights each stage
     ------------------------------------------------------------------ */

  function initLoop() {
    var host = $('[data-chart="loop"]');
    if (!host) return;
    var track = $(".loop-track", host);
    var steps = $$(".loop-step", host);
    var path = null, runner = null, halo = null, len = 0, raf = 0, last = 0, dist = 0, visible = false;

    function center(n) {
      var hb = host.getBoundingClientRect(), r = n.getBoundingClientRect();
      return [r.left - hb.left + r.width / 2, r.top - hb.top + r.height / 2];
    }
    function rounded(pts, rad) {
      var n = pts.length, d = "";
      for (var i = 0; i < n; i++) {
        var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
        var d1 = Math.hypot(p0[0] - p1[0], p0[1] - p1[1]), d2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
        var r = Math.min(rad, d1 / 2, d2 / 2);
        var a = [p1[0] + (p0[0] - p1[0]) / d1 * r, p1[1] + (p0[1] - p1[1]) / d1 * r];
        var b = [p1[0] + (p2[0] - p1[0]) / d2 * r, p1[1] + (p2[1] - p1[1]) / d2 * r];
        d += (i === 0 ? "M" : "L") + a[0].toFixed(1) + "," + a[1].toFixed(1) + " Q" + p1[0].toFixed(1) + "," + p1[1].toFixed(1) + " " + b[0].toFixed(1) + "," + b[1].toFixed(1) + " ";
      }
      return d + "Z";
    }
    function build() {
      var hb = host.getBoundingClientRect();
      track.setAttribute("viewBox", "0 0 " + hb.width + " " + hb.height);
      track.textContent = "";
      var pts = steps.map(center);
      path = svgEl("path", { class: "track", d: rounded(pts, 26) }, track);
      len = path.getTotalLength();
      // direction chevrons midway between stages
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i], b = pts[(i + 1) % pts.length];
        var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        var ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
        svgEl("path", { class: "chev", d: "M-3.5,-4.5 L1.5,0 L-3.5,4.5", transform: "translate(" + mx.toFixed(1) + "," + my.toFixed(1) + ") rotate(" + ang.toFixed(1) + ")" }, track);
      }
      if (!reduceMotion) {
        halo = svgEl("circle", { class: "runner-halo", r: 9 }, track);
        runner = svgEl("circle", { class: "runner", r: 4.5 }, track);
        place();
      }
    }
    function place() {
      if (!runner || !len) return;
      var p = path.getPointAtLength(dist % len);
      runner.setAttribute("cx", p.x);
      runner.setAttribute("cy", p.y);
      halo.setAttribute("cx", p.x);
      halo.setAttribute("cy", p.y);
      var hb = host.getBoundingClientRect();
      steps.forEach(function (s) {
        var r = s.getBoundingClientRect();
        var inside = p.x >= r.left - hb.left && p.x <= r.right - hb.left && p.y >= r.top - hb.top && p.y <= r.bottom - hb.top;
        s.classList.toggle("is-active", inside);
      });
    }
    function frame(now) {
      raf = 0;
      if (!visible) return;
      var dt = last ? Math.min(64, now - last) : 16;
      last = now;
      dist += dt * 0.085;
      place();
      raf = requestAnimationFrame(frame);
    }
    build();
    if ("ResizeObserver" in window) new ResizeObserver(function () { build(); }).observe(host);
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    }).observe(host);
  }

  /* ------------------------------------------------------------------
     Fig. 5b, 6, 1: before/after bars, CT slices and dot plot, SEC scorecard
     ------------------------------------------------------------------ */

  function initSmallFigures() {
    // Drift before/after
    var ba = $('[data-chart="drift"]');
    if (ba) {
      if (reduceMotion) ba.classList.add("is-in");
      else onVisible(ba, function () { ba.classList.add("is-in"); });
    }

    // CT: 16 slices collapse into one image
    var stack = $('[data-chart="stack"]');
    if (stack) {
      var slices = $(".stack-slices", stack);
      for (var k = 15; k >= 0; k--) {
        var s = el("i", null, slices);
        s.style.setProperty("--k", String(k));
      }
      if (reduceMotion) stack.classList.add("is-in");
      else onVisible(stack, function () { setTimeout(function () { stack.classList.add("is-in"); }, 250); });
    }

    // CT dot plot, 0.5 to 1.0
    var dp = $('[data-chart="ct"]');
    if (dp) {
      CT.forEach(function (row, i) {
        var r = el("div", "dp-row" + (row[2] ? " is-top" : ""), dp);
        el("p", "dp-name", r, row[0]);
        var trk = el("div", "dp-track", r);
        var x = ((row[1] - 0.5) / 0.5 * 100).toFixed(1) + "%";
        trk.style.setProperty("--x", x);
        trk.style.setProperty("--delay", (i * 90) + "ms");
        el("span", "dp-stem", trk);
        el("span", "dp-dot", trk);
        el("p", "dp-val", r, row[1].toFixed(3));
      });
      var ax = el("div", "dp-axis", dp);
      el("span", null, ax);
      var sc = el("div", "dp-axis-scale", ax);
      [["0.5", 0], ["0.75", 50], ["1.0", 100]].forEach(function (t) {
        var lab = el("span", null, sc, t[0]);
        lab.style.left = t[1] + "%";
      });
      el("span", null, ax);
      if (reduceMotion) dp.classList.add("is-in");
      else onVisible(dp, function () { dp.classList.add("is-in"); });
      var ctTable = $('[data-table="ct"]');
      if (ctTable) {
        ctTable.innerHTML = "<table><thead><tr><th>Design</th><th>Peak validation AUC</th></tr></thead><tbody>" +
          CT.map(function (r) { return "<tr><td>" + r[0] + "</td><td>" + r[1].toFixed(3) + "</td></tr>"; }).join("") + "</tbody></table>";
      }
    }

    // SEC scorecard, 40% to 100%
    var card = $('[data-chart="sec"]');
    if (card) {
      SEC.forEach(function (row, i) {
        var r = el("div", "sc-row", card);
        var name = el("p", "sc-name", r, row[0]);
        if (row[1]) el("span", null, name, row[1]);
        var trk = el("div", "sc-track", r);
        var p1 = (row[2] - 40) / 60 * 100, p2 = (row[3] - 40) / 60 * 100;
        trk.style.setProperty("--p1", p1.toFixed(1) + "%");
        trk.style.setProperty("--p2", p2.toFixed(1) + "%");
        trk.style.setProperty("--a", Math.min(p1, p2).toFixed(1) + "%");
        trk.style.setProperty("--w", Math.abs(p2 - p1).toFixed(1) + "%");
        trk.style.setProperty("--delay", (i * 110) + "ms");
        el("span", "sc-link", trk);
        el("span", "sc-dot sc-v1", trk);
        el("span", "sc-dot sc-v2", trk);
        var d = el("p", "sc-delta", r);
        d.innerHTML = '<span class="text-muted">' + row[2].toFixed(1) + "</span> → <strong>" + row[3].toFixed(1) + "</strong>";
      });
      var ax2 = el("div", "sc-axis", card);
      el("span", null, ax2);
      var sc2 = el("div", "sc-axis-scale", ax2);
      [["40%", 0], ["60%", 100 / 3], ["80%", 200 / 3], ["100%", 100]].forEach(function (t) {
        var lab = el("span", null, sc2, t[0]);
        lab.style.left = t[1].toFixed(2) + "%";
      });
      el("span", null, ax2);
      if (reduceMotion) card.classList.add("is-in");
      else onVisible(card, function () { card.classList.add("is-in"); });
      var secTable = $('[data-table="sec"]');
      if (secTable) {
        secTable.innerHTML = "<table><thead><tr><th>Model</th><th>Prompt v1, %</th><th>v2: value + unit, %</th></tr></thead><tbody>" +
          SEC.map(function (r) { return "<tr><td>" + r[0] + (r[1] ? " (" + r[1] + ")" : "") + "</td><td>" + r[2].toFixed(1) + "</td><td>" + r[3].toFixed(1) + "</td></tr>"; }).join("") +
          "</tbody></table>";
      }
    }
  }

  /* ------------------------------------------------------------------
     Fig. 1 readout: one release read under two prompts. Rows are read,
     the reply is typed, then checked against the 10-Q; it alternates
     v1 and v2 while on screen until a tab is pressed.
     ------------------------------------------------------------------ */

  function initReadout() {
    var host = $('[data-chart="readout"]');
    if (!host) return;
    var fig = host.closest("figure") || host.parentNode;
    var tabs = $$(".rd-tab", fig);
    var rows = $$(".rd-row", host);
    var sum = $(".rd-sum", host);
    var timers = [], ver = 1, auto = !reduceMotion, visible = false;

    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function stop() { timers.forEach(clearTimeout); timers = []; }

    function setup(v) {
      ver = v;
      host.setAttribute("data-v", String(v));
      host.setAttribute("aria-label", READ_ALT[v]);
      tabs.forEach(function (t) {
        t.setAttribute("aria-pressed", t.getAttribute("data-v") === String(v) ? "true" : "false");
      });
      rows.forEach(function (r, i) {
        var d = READ[i], ok = v === 2 || d[2];
        var rep = $(".rd-reply", r), chk = $(".rd-check", r);
        rep.textContent = "";
        chk.textContent = "";
        el("span", "rd-typed", rep);
        if (v === 2 && d[4]) {
          el("span", "rd-unit", rep, d[4]);
          var conv = el("span", "rd-conv", rep);
          el("span", "rd-eq", conv, "= ");
          el("span", "rd-conv-num", conv, d[5]);
        }
        el("span", "rd-ans", chk, d[0]);
        el("span", "rd-chip " + (ok ? "is-ok" : "is-bad"), chk, ok ? "✓ match" : "✗ unit slip");
        r.className = "rd-row" + (ok ? "" : " is-bad");
      });
      sum.textContent = READ_SUM[v];
      sum.classList.remove("is-on");
    }

    // The end state, without motion
    function finish(v) {
      stop();
      setup(v);
      rows.forEach(function (r, i) {
        var d = READ[i];
        $(".rd-typed", r).textContent = v === 1 ? d[1] : d[3];
        var num = $(".rd-conv-num", r);
        if (num) num.textContent = d[5] + ",000,000";
        ["is-reading", "is-unit", "is-conv", "is-checked"].forEach(function (c) { r.classList.add(c); });
      });
      sum.classList.add("is-on");
    }

    function play(v) {
      stop();
      setup(v);
      var t = 300;
      rows.forEach(function (r, i) {
        var d = READ[i];
        var text = v === 1 ? d[1] : d[3];
        var typed = $(".rd-typed", r);
        later(function () { r.classList.add("is-reading"); }, t);
        t += 480;
        later(function () { r.classList.add("is-typing"); }, t);
        for (var c = 1; c <= text.length; c++) {
          (function (n, at) {
            later(function () { typed.textContent = text.slice(0, n); }, at);
          })(c, t + c * 75);
        }
        t += text.length * 75 + 180;
        later(function () { r.classList.remove("is-typing"); }, t);
        if (v === 2 && d[4]) {
          later(function () { r.classList.add("is-unit"); }, t);
          t += 420;
          var num = $(".rd-conv-num", r);
          later(function () { r.classList.add("is-conv"); }, t);
          // multiply by a million in two steps: 95,359 -> 95,359,000 -> 95,359,000,000
          [1, 2].forEach(function (k) {
            later(function () { num.textContent = d[5] + (k === 1 ? ",000" : ",000,000"); }, t + k * 200);
          });
          t += 520;
        }
        later(function () { r.classList.add("is-checked"); }, t);
        t += 620;
      });
      later(function () { sum.classList.add("is-on"); }, t);
      t += 4200;
      if (auto) later(function () { if (auto && visible) play(ver === 1 ? 2 : 1); }, t);
    }

    finish(1);
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        auto = false;
        var v = parseInt(t.getAttribute("data-v"), 10);
        if (reduceMotion) finish(v);
        else play(v);
      });
    });
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      var now = entries[0].isIntersecting;
      if (now === visible) return;
      visible = now;
      if (visible && auto) play(ver);
      else if (!visible) finish(ver);
    }, { threshold: 0.35 }).observe(host);
  }

  /* ------------------------------------------------------------------
     Skills matrix
     ------------------------------------------------------------------ */

  function initMatrix() {
    var body = $("[data-matrix-body]");
    var table = $("[data-matrix]");
    if (!body || !table) return;
    var html = "";
    MATRIX.forEach(function (group) {
      html += '<tr class="group"><th scope="colgroup" colspan="7">' + group[0] + "</th></tr>";
      group[1].forEach(function (row) {
        html += '<tr><th scope="row">' + row[0] + "</th>";
        row[1].forEach(function (on, c) {
          html += '<td data-col="' + c + '">' + (on
            ? '<span class="mdot" aria-hidden="true"></span><span class="sr-only">Used in ' + PROJECTS[c] + "</span>"
            : '<span class="mnone" aria-hidden="true"></span><span class="sr-only">Not used in ' + PROJECTS[c] + "</span>") + "</td>";
        });
        html += "</tr>";
      });
    });
    body.innerHTML = html;
    var current = -1;
    function mark(col) {
      if (col === current) return;
      current = col;
      $$("[data-col]", table).forEach(function (n) {
        n.classList.toggle("is-col", col >= 0 && n.getAttribute("data-col") === String(col));
      });
    }
    table.addEventListener("pointerover", function (e) {
      var cell = e.target.closest("[data-col]");
      mark(cell ? parseInt(cell.getAttribute("data-col"), 10) : -1);
    });
    table.addEventListener("pointerleave", function () { mark(-1); });
  }

  /* ------------------------------------------------------------------
     Copy email, year
     ------------------------------------------------------------------ */

  function initCopy() {
    $$("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var value = btn.getAttribute("data-copy");
        var hint = $("[data-copy-hint]", btn);
        function done(ok) {
          if (hint) {
            hint.textContent = ok ? "Copied" : "Copy failed";
            setTimeout(function () { hint.textContent = "Copy"; }, 1800);
          }
          toast(ok ? "Email address copied" : "Couldn\u2019t copy. The address is " + value);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(function () { done(true); }, function () { done(false); });
        } else {
          var ta = document.createElement("textarea");
          ta.value = value;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          var ok = false;
          try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
          ta.remove();
          done(ok);
        }
      });
    });
    var year = $("[data-year]");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------ */

  function boot() {
    initEdition();
    initMasthead();
    initIndex();
    initReveal();
    initSwarm();
    initScrolly();
    initWaffles();
    initLoop();
    initSmallFigures();
    initReadout();
    initMatrix();
    initCopy();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
