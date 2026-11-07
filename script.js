/* Swaminathan Sankaran: portfolio, "8,760" edition.
   One field of 8,760 points, one for every hour of US electricity demand in 2025, draws every
   figure on the page: as you scroll, the same points spring into each chart. Plain JavaScript
   and WebGL (with a 2D-canvas fallback), no dependencies. Chart data: the constants below and
   data.js, which mirror the projects' own results. */
(function () {
  "use strict";

  var doc = document.documentElement;
  var D = window.SITE_DATA;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var N = 8760;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lin(d0, d1, r0, r1) { var m = (r1 - r0) / (d1 - d0); return function (v) { return r0 + (v - d0) * m; }; }
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
  function mix(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function signed(v, d) { return (v < 0 ? "−" : "") + Math.abs(v).toFixed(d); }
  function r1(v) { return Math.round(v * 10) / 10; }

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

  // National error (total absolute error / total demand, 50-operator panel), %
  var YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  var NAT_PUB = [3.4282, 3.2488, 3.4314, 3.7163, 3.7818, 3.8091, 3.6631, 3.6263, 3.692, 4.0822];
  var NAT_COR = [3.3477, 3.2488, 3.4312, 3.7168, 3.7818, 3.8015, 3.5907, 3.4748, 3.4541, 3.4108];

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

  var MATRIX = [
    ["Languages and data", [
      ["Python", [1, 1, 1, 1, 1, 1]],
      ["SQL · PostgreSQL", [0, 0, 1, 0, 0, 0]],
      ["pandas", [1, 0, 1, 0, 0, 0]],
      ["Statistical testing", [1, 0, 0, 0, 0, 0]],
      ["Time series", [1, 0, 0, 0, 0, 0]],
      ["Matplotlib", [1, 0, 0, 0, 0, 0]]
    ]],
    ["Machine learning", [
      ["PyTorch", [0, 1, 0, 1, 1, 0]],
      ["Computer vision", [0, 1, 0, 1, 0, 0]],
      ["Vision-language models", [0, 1, 0, 0, 0, 0]],
      ["LLM evaluation", [0, 0, 0, 0, 1, 0]],
      ["vLLM", [0, 0, 0, 0, 1, 0]],
      ["XGBoost", [0, 0, 1, 0, 0, 1]],
      ["NLP · OCR · T5", [0, 0, 0, 0, 0, 1]],
      ["RAG · embeddings · search", [0, 0, 0, 0, 0, 1]],
      ["DICOM · medical imaging", [0, 0, 0, 1, 0, 0]]
    ]],
    ["MLOps and infrastructure", [
      ["Docker", [0, 0, 1, 0, 0, 1]],
      ["FastAPI", [0, 0, 1, 0, 0, 1]],
      ["Airflow", [0, 0, 1, 0, 0, 0]],
      ["MLflow", [0, 0, 1, 0, 0, 0]],
      ["Monitoring: Evidently, Prometheus, Grafana", [0, 0, 1, 0, 0, 1]],
      ["Kubernetes", [0, 0, 1, 0, 0, 0]],
      ["AWS", [0, 0, 0, 0, 0, 1]]
    ]],
    ["Practice", [
      ["pytest · automated tests", [1, 1, 0, 0, 1, 0]],
      ["Git · GitHub", [1, 1, 1, 1, 1, 0]]
    ]]
  ];
  var PROJECTS = ["Grid audit", "Grounding probes", "Drift MLOps", "CT tamper", "SEC benchmark", "Zolvit"];

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTH_START = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  var SWPP_CHANGE = 126; // 7 May 2025, day index from 1 January

  /* Colors (the two series colors are validated for color-vision deficiency on #06080d) */
  var BG = rgb("#06080d"), PUB = rgb("#e46e2b"), COR = rgb("#1c9ad6"), NEUT = rgb("#97a3b8");
  var INK = rgb("#eef2f8"), DIM = rgb("#2c3444"), DUST = rgb("#8fa0c2"), FLOW = rgb("#6cc0ee");
  var RAMP = ["#15325a", "#1f5b9a", "#2b8bcc", "#6cc0ee", "#d6f1ff"].map(rgb);
  function ramp(t) {
    t = clamp(t, 0, 1) * (RAMP.length - 1);
    var i = Math.min(Math.floor(t), RAMP.length - 2);
    return mix(RAMP[i], RAMP[i + 1], t - i);
  }

  /* Derived data */
  var DEM = D ? D.demand : [];
  var DMIN = Infinity, DMAX = -Infinity, PEAK = 0, LOW = 0;
  DEM.forEach(function (v, i) {
    if (v > DMAX) { DMAX = v; PEAK = i; }
    if (v < DMIN) { DMIN = v; LOW = i; }
  });
  var T0 = Date.UTC(2025, 0, 1); // hour index 0 ends at 2025-01-01 00:00 UTC
  var etHour = null;
  try { etHour = new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: true, timeZone: "America/New_York" }); } catch (e) { etHour = null; }
  function dayLabel(day) {
    var t = new Date(T0 + day * 86400e3);
    return WEEKDAYS[t.getUTCDay()] + " " + t.getUTCDate() + " " + MONTHS[t.getUTCMonth()];
  }
  function hourLabel(i) {
    var t = new Date(T0 + i * 3600e3);
    var hh = t.getUTCHours();
    var s = WEEKDAYS[t.getUTCDay()] + " " + t.getUTCDate() + " " + MONTHS[t.getUTCMonth()] + " 2025";
    var et = etHour ? " (" + etHour.format(t).replace(" AM", " am").replace(" PM", " pm") + " ET)" : "";
    return { day: s, hour: "Hour ending " + (hh < 10 ? "0" : "") + hh + ":00 UTC" + et };
  }

  var OPS = BAS.map(function (r) {
    var c = CORRECTED[r[0]];
    return {
      code: r[0], name: NAMES[r[0]] || r[0], mape: r[1], naive: r[2], skill: r[3],
      mapeC: c ? c[0] : r[1], naiveC: c ? c[1] : r[2], skillC: c ? c[2] : r[3],
      twh: D && D.twh[r[0]] || 0, hot: !!HOT[r[0]], n: 0
    };
  });
  (function allocate() {
    var tot = 0, sum = 0;
    OPS.forEach(function (o) { tot += o.twh; });
    OPS.forEach(function (o) { o.n = Math.max(8, Math.round(N * o.twh / (tot || 1))); sum += o.n; });
    var big = OPS.slice().sort(function (a, b) { return b.n - a.n; });
    for (var k = 0; sum !== N && k < 100000; k++) {
      var s = sum > N ? -1 : 1;
      big[k % 5].n += s; sum += s;
    }
  })();
  var TWH_TOTAL = OPS.reduce(function (s, o) { return s + o.twh; }, 0);

  function median(a) {
    a = a.filter(function (v) { return v != null; }).sort(function (x, y) { return x - y; });
    var n = a.length;
    if (!n) return null;
    return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2;
  }

  /* ------------------------------------------------------------------
     Small DOM helpers: tooltip, toast
     ------------------------------------------------------------------ */

  var tip = $(".tip");
  function showTip(html, x, y) {
    if (!tip) return;
    tip.innerHTML = html;
    tip.hidden = false;
    var r = tip.getBoundingClientRect();
    var left = x + 16, top = y - r.height - 14;
    if (left + r.width > window.innerWidth - 8) left = x - r.width - 16;
    if (left < 8) left = 8;
    if (top < 70) top = y + 20;
    if (top + r.height > window.innerHeight - 8) top = window.innerHeight - r.height - 8;
    tip.style.transform = "translate(" + Math.round(left) + "px," + Math.round(top) + "px)";
  }
  function hideTip() { if (tip) tip.hidden = true; }
  function row(label, value, sw) {
    return '<span class="tip-row"><span>' + (sw ? '<i class="sw" style="background:' + sw + '"></i>' : "") + label + "</span><span>" + value + "</span></span>";
  }

  var toastEl = $(".toast"), toastTimer = 0;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2000);
  }

  /* ------------------------------------------------------------------
     The field: particles, renderer, camera
     ------------------------------------------------------------------ */

  var canvas = $("#field");
  var renderer = null;
  var W = 0, H = 0, DPR = 1;

  function F32() { return new Float32Array(N); }
  var P = {
    x: F32(), y: F32(), z: F32(), vx: F32(), vy: F32(), vz: F32(),
    tx: F32(), ty: F32(), tz: F32(),
    r: F32(), g: F32(), b: F32(), a: F32(), s: F32(), sh: F32(),
    tr: F32(), tg: F32(), tb: F32(), ta: F32(), ts: F32(), tsh: F32(),
    kf: F32(), wake: new Float64Array(N)
  };
  (function () {
    var rand = rng(11);
    for (var i = 0; i < N; i++) P.kf[i] = 0.78 + rand() * 0.44;
  })();

  // Marks: what the current scene wants drawn. Each mark gets one particle.
  var MK = {
    n: 0, x: F32(), y: F32(), z: F32(), r: F32(), g: F32(), b: F32(), a: F32(), s: F32(), sh: F32(),
    d: F32(), grp: new Int32Array(N), key: new Int32Array(N)
  };
  function mReset() { MK.n = 0; }
  function mPush(x, y, z, c, a, s, sh, d, grp, key) {
    if (MK.n >= N) return -1;
    var k = MK.n++;
    MK.x[k] = x; MK.y[k] = y; MK.z[k] = z;
    MK.r[k] = c[0]; MK.g[k] = c[1]; MK.b[k] = c[2]; MK.a[k] = a;
    MK.s[k] = s; MK.sh[k] = sh || 0; MK.d[k] = d || 0;
    MK.grp[k] = grp || 0; MK.key[k] = key == null ? -1 : key;
    return k;
  }
  var GROUPS = {}, groupCount = 1;
  function G(name) { return GROUPS[name] || (GROUPS[name] = groupCount++); }

  var pGroup = new Int32Array(N), pKey = new Int32Array(N);
  var markToP = new Int32Array(N), pIsMark = new Uint8Array(N);
  var dustList = new Int32Array(N), dustN = 0;
  var dustBX = F32(), dustBY = F32(), dustPh = F32();

  // Camera: pivot, rotation and how additive the blending is (0 = glow, 1 = normal)
  var cam = { px: 0, py: 0, pz: 0, yaw: 0, pitch: 0, dist: 1600, add: 0 };
  var camT = { px: 0, py: 0, pz: 0, yaw: 0, pitch: 0, dist: 1600, add: 0 };
  var CAM_KEYS = ["px", "py", "pz", "yaw", "pitch", "dist", "add"];
  var user = { yaw: 0, pitch: 0, vyaw: 0, idleAt: 0 };

  var VS = [
    "attribute vec3 a_pos;",
    "attribute vec4 a_col;",
    "attribute vec2 a_ss;",
    "uniform vec2 u_view;",
    "uniform vec3 u_piv;",
    "uniform vec2 u_rot;",
    "uniform float u_dist;",
    "uniform float u_dpr;",
    "uniform float u_maxp;",
    "varying vec4 v_col;",
    "varying float v_sh;",
    "void main() {",
    "  vec3 p = a_pos - u_piv;",
    "  float cy = cos(u_rot.x), sy = sin(u_rot.x);",
    "  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);",
    "  float cp = cos(u_rot.y), sp = sin(u_rot.y);",
    "  p = vec3(p.x, cp * p.y + sp * p.z, -sp * p.y + cp * p.z);",
    "  float k = u_dist / max(u_dist - p.z, 1.0);",
    "  vec2 s = u_piv.xy + p.xy * k;",
    "  gl_Position = vec4(s.x / u_view.x * 2.0 - 1.0, 1.0 - s.y / u_view.y * 2.0, 0.0, 1.0);",
    "  float sz = a_ss.x * k * u_dpr;",
    "  v_col = a_col;",
    "  if (sz < 1.0) v_col.a *= max(sz, 0.0);",
    "  gl_PointSize = clamp(sz, 1.0, u_maxp);",
    "  v_sh = a_ss.y;",
    "}"
  ].join("\n");
  var FS = [
    "precision mediump float;",
    "varying vec4 v_col;",
    "varying float v_sh;",
    "uniform float u_add;",
    "void main() {",
    "  vec2 c = gl_PointCoord - 0.5;",
    "  float m = 1.0;",
    "  if (v_sh > 0.0) {",
    "    if (abs(c.x) > v_sh * 0.5) discard;",
    "  } else {",
    "    m = 1.0 - smoothstep(0.30, 0.5, length(c));",
    "  }",
    "  float a = v_col.a * m;",
    "  if (a < 0.004) discard;",
    "  gl_FragColor = vec4(v_col.rgb * a, a * u_add);",
    "}"
  ].join("\n");

  function makeGL(cv) {
    var gl = null;
    try {
      gl = cv.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, powerPreference: "high-performance" }) ||
        cv.getContext("experimental-webgl");
    } catch (e) { gl = null; }
    if (!gl) return null;
    function shader(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
      return s;
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    gl.useProgram(prog);
    var aPos = gl.getAttribLocation(prog, "a_pos");
    var aCol = gl.getAttribLocation(prog, "a_col");
    var aSS = gl.getAttribLocation(prog, "a_ss");
    var u = {};
    ["u_view", "u_piv", "u_rot", "u_dist", "u_dpr", "u_maxp", "u_add"].forEach(function (n) { u[n] = gl.getUniformLocation(prog, n); });
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    var data = new Float32Array(N * 9);
    gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 36, 0);
    gl.enableVertexAttribArray(aCol);
    gl.vertexAttribPointer(aCol, 4, gl.FLOAT, false, 36, 12);
    gl.enableVertexAttribArray(aSS);
    gl.vertexAttribPointer(aSS, 2, gl.FLOAT, false, 36, 28);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    var range = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
    var maxp = range && range[1] ? range[1] : 64;
    return {
      kind: "webgl",
      resize: function () {
        cv.width = Math.max(1, Math.round(W * DPR));
        cv.height = Math.max(1, Math.round(H * DPR));
        gl.viewport(0, 0, cv.width, cv.height);
      },
      draw: function () {
        if (gl.isContextLost()) return;
        var d = data;
        for (var i = 0, o = 0; i < N; i++, o += 9) {
          d[o] = P.x[i]; d[o + 1] = P.y[i]; d[o + 2] = P.z[i];
          d[o + 3] = P.r[i]; d[o + 4] = P.g[i]; d[o + 5] = P.b[i]; d[o + 6] = P.a[i];
          d[o + 7] = P.s[i]; d[o + 8] = P.sh[i];
        }
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, d);
        gl.clearColor(BG[0], BG[1], BG[2], 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(u.u_view, W, H);
        gl.uniform3f(u.u_piv, cam.px, cam.py, cam.pz);
        gl.uniform2f(u.u_rot, cam.yaw, cam.pitch);
        gl.uniform1f(u.u_dist, cam.dist);
        gl.uniform1f(u.u_dpr, DPR);
        gl.uniform1f(u.u_maxp, maxp);
        gl.uniform1f(u.u_add, cam.add);
        gl.drawArrays(gl.POINTS, 0, N);
      }
    };
  }

  // CPU projection: the same math as the vertex shader (hit tests, pins, 2D fallback)
  var PJ = { cy: 1, sy: 0, cp: 1, sp: 0 };
  function prepProject() {
    PJ.cy = Math.cos(cam.yaw); PJ.sy = Math.sin(cam.yaw);
    PJ.cp = Math.cos(cam.pitch); PJ.sp = Math.sin(cam.pitch);
  }
  function projectXYZ(x, y, z, out) {
    var px = x - cam.px, py = y - cam.py, pz = z - cam.pz;
    var x1 = PJ.cy * px + PJ.sy * pz, z1 = -PJ.sy * px + PJ.cy * pz;
    var y2 = PJ.cp * py + PJ.sp * z1, z2 = -PJ.sp * py + PJ.cp * z1;
    var k = cam.dist / Math.max(cam.dist - z2, 1);
    out.x = cam.px + x1 * k; out.y = cam.py + y2 * k; out.k = k;
    return out;
  }

  function make2D(cv) {
    var ctx = cv.getContext("2d");
    if (!ctx) return null;
    var cache = {};
    var o = { x: 0, y: 0, k: 1 };
    function style(r, g, b) {
      var key = ((r * 31) | 0) * 1024 + ((g * 31) | 0) * 32 + ((b * 31) | 0);
      return cache[key] || (cache[key] = "rgb(" + Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255) + ")");
    }
    return {
      kind: "2d",
      resize: function () {
        cv.width = Math.max(1, Math.round(W * DPR));
        cv.height = Math.max(1, Math.round(H * DPR));
      },
      draw: function () {
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#06080d";
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = cam.add < 0.5 ? "lighter" : "source-over";
        prepProject();
        for (var i = 0; i < N; i++) {
          var a = P.a[i];
          if (a < 0.01) continue;
          projectXYZ(P.x[i], P.y[i], P.z[i], o);
          var s = P.s[i] * o.k;
          ctx.globalAlpha = a > 1 ? 1 : a;
          ctx.fillStyle = style(P.r[i], P.g[i], P.b[i]);
          if (P.sh[i] > 0) ctx.fillRect(o.x - s * P.sh[i] / 2, o.y - s / 2, s * P.sh[i], s);
          else ctx.fillRect(o.x - s * 0.36, o.y - s * 0.36, s * 0.72, s * 0.72);
        }
      }
    };
  }

  /* Physics: every particle springs toward its target; color and size ease */
  var STIFF = 110, DAMP = 19;
  function physics(dt, now) {
    var moving = 0;
    var fc = 1 - Math.exp(-dt * 7);
    var x = P.x, y = P.y, z = P.z, vx = P.vx, vy = P.vy, vz = P.vz;
    for (var i = 0; i < N; i++) {
      if (now < P.wake[i]) { moving++; continue; }
      if (P.sh[i] !== P.tsh[i]) P.sh[i] = P.tsh[i];
      var kf = P.kf[i], k = STIFF * kf, c = DAMP * Math.sqrt(kf);
      var dx = P.tx[i] - x[i], dy = P.ty[i] - y[i], dz = P.tz[i] - z[i];
      vx[i] += (dx * k - vx[i] * c) * dt;
      vy[i] += (dy * k - vy[i] * c) * dt;
      vz[i] += (dz * k - vz[i] * c) * dt;
      x[i] += vx[i] * dt; y[i] += vy[i] * dt; z[i] += vz[i] * dt;
      var da = P.ta[i] - P.a[i], ds = P.ts[i] - P.s[i];
      P.r[i] += (P.tr[i] - P.r[i]) * fc;
      P.g[i] += (P.tg[i] - P.g[i]) * fc;
      P.b[i] += (P.tb[i] - P.b[i]) * fc;
      P.a[i] += da * fc;
      P.s[i] += ds * fc;
      if (dx * dx + dy * dy + dz * dz > 0.02 || vx[i] * vx[i] + vy[i] * vy[i] + vz[i] * vz[i] > 0.02 || da * da > 1e-6 || ds * ds > 1e-4) moving++;
    }
    return moving;
  }
  function snapAll() {
    for (var i = 0; i < N; i++) {
      P.x[i] = P.tx[i]; P.y[i] = P.ty[i]; P.z[i] = P.tz[i];
      P.vx[i] = P.vy[i] = P.vz[i] = 0;
      P.r[i] = P.tr[i]; P.g[i] = P.tg[i]; P.b[i] = P.tb[i]; P.a[i] = P.ta[i];
      P.s[i] = P.ts[i]; P.sh[i] = P.tsh[i]; P.wake[i] = 0;
    }
    CAM_KEYS.forEach(function (k) { cam[k] = camT[k]; });
  }
  function camStep(dt) {
    var f = 1 - Math.exp(-dt * 3.4), moving = false;
    for (var j = 0; j < CAM_KEYS.length; j++) {
      var k = CAM_KEYS[j], d = camT[k] - cam[k];
      if (Math.abs(d) > (k === "add" || k === "yaw" || k === "pitch" ? 0.0005 : 0.05)) { cam[k] += d * f; moving = true; }
      else cam[k] = camT[k];
    }
    return moving;
  }

  /* Assignment: hand each mark a particle. Particles keep their group (and key) between
     scenes when they can, so a bubble moves as a bubble and an hour stays an hour. */
  function setTarget(i, k, now, noDelay) {
    P.tx[i] = MK.x[k]; P.ty[i] = MK.y[k]; P.tz[i] = MK.z[k];
    P.tr[i] = MK.r[k]; P.tg[i] = MK.g[k]; P.tb[i] = MK.b[k]; P.ta[i] = MK.a[k];
    P.ts[i] = MK.s[k]; P.tsh[i] = MK.sh[k];
    P.wake[i] = noDelay ? 0 : now + MK.d[k];
    pGroup[i] = MK.grp[k]; pKey[i] = MK.key[k];
  }
  function assign(now, noDelay, exclude) {
    var M = MK.n, i, j, k;
    var takenP = new Uint8Array(N), takenM = new Uint8Array(M);
    function link(m, p) { markToP[m] = p; takenM[m] = 1; takenP[p] = 1; }
    function byPX(a, b) { return P.x[a] - P.x[b] || P.y[a] - P.y[b]; }
    function byMX(a, b) { return MK.x[a] - MK.x[b] || MK.y[a] - MK.y[b]; }
    function spread(ms, ps) {
      ms.sort(byMX); ps.sort(byPX);
      var q;
      if (ps.length >= ms.length) {
        for (q = 0; q < ms.length; q++) link(ms[q], ps[Math.floor((q + 0.5) * ps.length / ms.length)]);
      } else {
        for (q = 0; q < ps.length; q++) link(ms[Math.floor((q + 0.5) * ms.length / ps.length)], ps[q]);
      }
    }
    var mByG = {}, pByG = {};
    for (k = 0; k < M; k++) {
      var g = MK.grp[k];
      if (g) (mByG[g] || (mByG[g] = [])).push(k);
    }
    for (i = 0; i < N; i++) {
      var pg = pGroup[i];
      if (pg && mByG[pg]) (pByG[pg] || (pByG[pg] = [])).push(i);
    }
    Object.keys(mByG).forEach(function (gk) {
      var ms = mByG[gk], ps = pByG[gk];
      if (!ps) return;
      var rest = ms;
      if (MK.key[ms[0]] >= 0) {
        var byKey = {};
        ps.forEach(function (p) { if (pKey[p] >= 0) byKey[pKey[p]] = p; });
        rest = [];
        ms.forEach(function (m) {
          var p = byKey[MK.key[m]];
          if (p !== undefined && !takenP[p]) link(m, p); else rest.push(m);
        });
      }
      var freeP = ps.filter(function (p) { return !takenP[p]; });
      if (rest.length && freeP.length) spread(rest, freeP);
    });
    var freeM = [], freeP2 = [];
    for (k = 0; k < M; k++) if (!takenM[k]) freeM.push(k);
    for (i = 0; i < N; i++) if (!takenP[i]) freeP2.push(i);
    if (freeM.length) spread(freeM, freeP2);
    pIsMark.fill(0);
    for (k = 0; k < M; k++) { var p = markToP[k]; setTarget(p, k, now, noDelay); pIsMark[p] = 1; }
    var dl = [];
    for (i = 0; i < N; i++) if (!pIsMark[i]) dl.push(i);
    makeDust(dl, now, noDelay, exclude);
  }

  // Leftover particles become a faint field of dust, kept out of the plot area
  function makeDust(list, now, noDelay, ex) {
    var rand = rng(97), n = list.length, pos = [];
    for (var j = 0; j < n; j++) {
      var x, y, tries = 0;
      do {
        x = -30 + rand() * (W + 60);
        y = -30 + rand() * (H + 60);
        tries++;
      } while (ex && tries < 8 && x > ex.x - 18 && x < ex.x + ex.w + 18 && y > ex.y - 18 && y < ex.y + ex.h + 18);
      pos.push([x, y, (rand() - 0.5) * 260, rand(), rand()]);
    }
    pos.sort(function (a, b) { return a[0] - b[0]; });
    list.sort(function (a, b) { return P.x[a] - P.x[b]; });
    dustN = n;
    for (j = 0; j < n; j++) {
      var i = list[j], q = pos[j], br = q[3] * q[3];
      dustList[j] = i;
      dustBX[i] = q[0]; dustBY[i] = q[1]; dustPh[i] = q[4] * 6.283;
      P.tx[i] = q[0]; P.ty[i] = q[1]; P.tz[i] = q[2];
      P.tr[i] = DUST[0]; P.tg[i] = DUST[1]; P.tb[i] = DUST[2];
      P.ta[i] = 0.07 + 0.26 * br; P.ts[i] = 0.9 + 1.3 * q[3]; P.tsh[i] = 0;
      P.wake[i] = noDelay ? 0 : now + q[4] * 260;
      pGroup[i] = 0; pKey[i] = -1;
    }
  }

  /* ------------------------------------------------------------------
     Overlay (axes and labels), frame (title and legend), pins (3D labels)
     ------------------------------------------------------------------ */

  var svg = $("#overlay");
  var ovLayers = svg ? $$(".ov", svg) : [];
  var hov = null, ovFront = 0, ovTimer = 0;
  if (svg) {
    svg.insertAdjacentHTML("afterbegin", '<defs><marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#7f8a9e"/></marker></defs>');
    svg.insertAdjacentHTML("beforeend", '<g class="hov"></g>');
    hov = $(".hov", svg);
  }
  function showOverlay(markup, delay) {
    if (!ovLayers.length) return;
    ovLayers[ovFront].classList.remove("is-on");
    ovFront = 1 - ovFront;
    var inc = ovLayers[ovFront];
    clearTimeout(ovTimer);
    inc.classList.remove("is-on");
    ovTimer = setTimeout(function () {
      inc.innerHTML = markup || "";
      inc.classList.add("is-on");
    }, delay);
  }
  function setHover(markup) { if (hov) hov.innerHTML = markup || ""; }

  function fx(v) { return Math.round(v * 10) / 10; }
  function T(x, y, s, cls, anchor, extra) {
    return '<text x="' + fx(x) + '" y="' + fx(y) + '"' + (cls ? ' class="' + cls + '"' : "") +
      (anchor ? ' text-anchor="' + anchor + '"' : "") + (extra || "") + ">" + s + "</text>";
  }
  function Ln(x1, y1, x2, y2, cls, extra) {
    return '<line x1="' + fx(x1) + '" y1="' + fx(y1) + '" x2="' + fx(x2) + '" y2="' + fx(y2) + '" class="' + cls + '"' + (extra || "") + "/>";
  }
  function Rc(x, y, w, h, cls, rx) {
    return '<rect x="' + fx(x) + '" y="' + fx(y) + '" width="' + fx(Math.max(0, w)) + '" height="' + fx(Math.max(0, h)) + '" class="' + cls + '"' + (rx ? ' rx="' + rx + '"' : "") + "/>";
  }
  function Ci(x, y, r, extra) {
    return '<circle cx="' + fx(x) + '" cy="' + fx(y) + '" r="' + fx(r) + '"' + (extra || "") + "/>";
  }
  function Pa(d, cls) { return '<path d="' + d + '" class="' + cls + '"/>'; }

  var frameEl = $(".frame");
  var frameTimer = 0;
  function legendHTML(items) {
    return (items || []).map(function (it) {
      if (it[0] === "ramp") return '<li><span>' + it[1] + '</span><span class="key key-ramp"></span><span>' + it[2] + "</span></li>";
      return '<li><span class="key ' + it[0] + '"></span>' + it[1] + "</li>";
    }).join("");
  }
  function fillFrame(el, fr) {
    $(".frame-label", el).textContent = fr.label || "";
    $(".frame-title", el).textContent = fr.title || "";
    $(".frame-sub", el).textContent = fr.sub || "";
    $(".frame-legend", el).innerHTML = legendHTML(fr.legend);
    $(".frame-note", el).textContent = (fr.note || "") + (fr.hero && finePointer ? " Drag to turn it." : "");
  }
  var measureEl = null;
  function frameHeight(fr, width) {
    if (!frameEl || !fr) return 0;
    if (!measureEl) {
      measureEl = frameEl.cloneNode(true);
      measureEl.className = "frame frame-measure";
      document.body.appendChild(measureEl);
    }
    fillFrame(measureEl, fr);
    $(".frame-note", measureEl).textContent = "";
    measureEl.style.width = width + "px";
    return measureEl.offsetHeight;
  }
  function setFrame(fr, g, now) {
    if (!frameEl) return;
    clearTimeout(frameTimer);
    function place() {
      frameEl.classList.toggle("is-hero", !!fr.hero && !g.mobile);
      var st = frameEl.style;
      if (fr.hero && !g.mobile) {
        st.left = "auto"; st.top = "auto"; st.height = "auto";
        st.right = g.gutter + "px"; st.bottom = Math.round(g.H * 0.06) + "px"; st.width = "330px";
      } else {
        var b = fr.wide ? g.frameOpen : g.frameBox;
        st.right = "auto"; st.bottom = "auto";
        st.left = b.x + "px"; st.top = b.y + "px"; st.width = b.w + "px"; st.height = b.h + "px";
      }
    }
    if (!fr) { frameEl.classList.remove("is-on"); return; }
    if (now) {
      place();
      return;
    }
    frameEl.classList.remove("is-on");
    frameTimer = setTimeout(function () {
      fillFrame(frameEl, fr);
      place();
      frameEl.classList.add("is-on");
    }, reduceMotion ? 0 : 240);
  }

  var pinsEl = $(".pins"), pins = [], pinTimer = 0;
  var tmp = { x: 0, y: 0, k: 1 };
  function setPins(list) {
    if (!pinsEl) return;
    clearTimeout(pinTimer);
    pinsEl.innerHTML = "";
    pins = (list || []).map(function (p) {
      var e = document.createElement("div");
      e.className = "pin " + (p.cls || "");
      e.innerHTML = p.html;
      pinsEl.appendChild(e);
      return { el: e, x: p.x, y: p.y, z: p.z, dx: p.dx || 0, dy: p.dy || 0 };
    });
    updatePins();
    pinTimer = setTimeout(function () { pins.forEach(function (p) { p.el.classList.add("is-on"); }); }, reduceMotion ? 0 : 1300);
  }
  function updatePins() {
    if (!pins.length) return;
    prepProject();
    pins.forEach(function (p) {
      projectXYZ(p.x, p.y, p.z, tmp);
      if (p.w == null) p.w = p.el.offsetWidth;
      var flip = tmp.x + p.dx + p.w > W - 8;
      if (flip !== p.flip) { p.flip = flip; p.el.classList.toggle("flip", flip); }
      var x = flip ? tmp.x - p.dx - p.w : tmp.x + p.dx;
      p.el.style.transform = "translate(" + Math.round(x) + "px," + Math.round(tmp.y + p.dy) + "px)";
    });
  }

  /* ------------------------------------------------------------------
     Geometry: where the figure goes at this viewport size
     ------------------------------------------------------------------ */

  function geom(fr) {
    var vw = window.innerWidth;
    var mobile = vw < 900;
    var g = { W: W, H: H, mobile: mobile };
    g.gutter = clamp(vw * 0.05, 20, 72);
    if (mobile) {
      var fh = fr && !fr.hero ? frameHeight(fr, W - 32) : fr ? frameHeight(fr, W - 32) : 44;
      var top = Math.max(96, 58 + fh + 16);
      g.fig = { x: 18, y: top, w: W - 36, h: Math.max(150, H - top - 14) };
      g.frameBox = { x: 16, y: 58, w: W - 32, h: H - 62 };
      g.frameOpen = g.frameBox;
      g.figOpen = g.fig;
      g.hero = { cx: W / 2, cy: top + (H - top) * 0.46, w: W * 0.66, h: H - top };
    } else {
      var col = Math.min(440, vw * 0.34), colOpen = Math.min(520, vw * 0.38);
      var x1 = W - Math.max(40, W * 0.045);
      var x0 = Math.max(g.gutter + col + 64, W * 0.43);
      if (x1 - x0 > 1000) x0 = x1 - 1000;
      var xo = Math.max(g.gutter + colOpen + 64, W * 0.46);
      if (x1 - xo > 1000) xo = x1 - 1000;
      var t0 = Math.max(194 + (H > 900 ? (H - 900) * 0.2 : 0), fr && !fr.hero && !fr.wide ? 84 + frameHeight(fr, x1 - x0) + 22 : 0);
      var b0 = H - 86;
      g.fig = { x: x0, y: t0, w: x1 - x0, h: b0 - t0 };
      g.figOpen = { x: xo, y: t0 - 30, w: x1 - xo, h: b0 - t0 + 30 };
      g.frameBox = { x: x0, y: 84, w: x1 - x0, h: H - 84 - 24 };
      g.frameOpen = { x: xo, y: 84, w: x1 - xo, h: H - 84 - 24 };
      g.hero = { cx: W * 0.62, cy: H * 0.37, w: Math.min(W * 0.6, 1080), h: H };
    }
    return g;
  }

  /* ------------------------------------------------------------------
     Scenes
     ------------------------------------------------------------------ */

  var SC = {};
  var cur = null, curName = "", lay = {}, sceneStart = 0, introPending = true;
  function flatCam(f, add) {
    return { px: f.x + f.w / 2, py: f.y + f.h / 2, pz: 0, yaw: 0, pitch: 0, dist: 1800, add: add == null ? 1 : add };
  }
  function inRect(x, y, r, pad) { pad = pad || 0; return x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad; }

  /* Terrain: every hour of 2025 as a 3D surface */
  function terrain(g, box, opts) {
    var mobile = g.mobile;
    var TW = box.w, TD = TW * (mobile ? 0.56 : 0.42);
    var TH = Math.min(box.h * (mobile ? 0.34 : 0.36), TW * (mobile ? 0.5 : 0.4));
    var cx = box.cx, base = box.cy + TH * 0.45;
    var size = mobile ? 1.35 : 1.85;
    var intro = opts.intro;
    function pos(i) {
      var d = (i / 24) | 0, hr = i % 24;
      return [cx + (d / 364 - 0.5) * TW, base - (DEM[i] - 280) / (DMAX - 280) * TH, (hr / 23 - 0.5) * TD];
    }
    for (var i = 0; i < N; i++) {
      var d = (i / 24) | 0, t = (DEM[i] - DMIN) / (DMAX - DMIN), p = pos(i);
      var delay = intro ? 150 + d / 364 * 1700 + (i % 24) * 5 : (opts.fast ? 0 : d / 364 * 260);
      mPush(p[0], p[1], p[2], ramp(0.05 + 0.95 * t), 0.5 + 0.5 * t, size, 0, delay, G("hours"), i);
    }
    var pk = pos(PEAK), info = hourLabel(PEAK);
    var et = info.hour.match(/\((.*) ET\)/);
    var pinList = [
      { x: pk[0], y: pk[1], z: pk[2], cls: "pin-peak", dy: -6, html: "<strong>" + DMAX.toFixed(1) + " GW</strong> peak<br>29 Jul" + (et ? ", " + et[1] + " ET" : "") }
    ];
    return {
      cam: { px: cx, py: base - TH * 0.55, pz: 0, yaw: opts.yaw, pitch: opts.pitch, dist: Math.max(W, H) * 1.25, add: 0 },
      pins: pinList,
      base: { yaw: opts.yaw, pitch: opts.pitch },
      hit: function (mx, my) {
        prepProject();
        var best = -1, bd = 100;
        for (var k = 0; k < N; k++) {
          var p = markToP[k];
          projectXYZ(P.x[p], P.y[p], P.z[p], tmp);
          var dx = tmp.x - mx, dy = tmp.y - my, dd = dx * dx + dy * dy;
          if (dd < bd) { bd = dd; best = k; }
        }
        if (best < 0) return null;
        var h = MK.key[best], lab = hourLabel(h);
        return { html: "<strong>" + DEM[h].toFixed(1) + " GW</strong>" + lab.day + "<br>" + lab.hour };
      },
      update: function (t) {
        var osc = reduceMotion ? 0 : 0.2 * Math.sin(t * 0.22);
        camT.yaw = opts.yaw + osc + user.yaw;
        camT.pitch = clamp(opts.pitch + user.pitch, 0.05, 1.25);
      }
    };
  }

  SC.terrain = {
    drag: true, continuous: true,
    frame: { hero: true, label: "Fig. 1 · 8,760 points", title: "Every point is one hour of US electricity demand in 2025", legend: [["ramp", r1(DMIN) + " GW", r1(DMAX) + " GW"]], note: "EIA-930 adjusted demand, summed over 53 grid operators. Height and color: demand." },
    layout: function (g) {
      var intro = introPending;
      introPending = false;
      return terrain(g, g.hero, { yaw: -0.62, pitch: 0.5, intro: intro, fast: false });
    }
  };

  SC.finale = {
    drag: true, continuous: true,
    frame: { wide: true, label: "Fig. 1, again", title: "8,760 hours of 2025, one last time", legend: [["ramp", r1(DMIN) + " GW", r1(DMAX) + " GW"]], note: "EIA-930 adjusted demand, summed over 53 grid operators." },
    layout: function (g) {
      var f = g.figOpen;
      var box = g.mobile ? { cx: W * 0.45, cy: g.hero.cy, w: W * 0.58, h: g.hero.h } : { cx: f.x + f.w * 0.5, cy: f.y + f.h * 0.4, w: f.w * 0.94, h: f.h * 1.15 };
      return terrain(g, box, { yaw: 0.58, pitch: 0.46 });
    }
  };

  /* Calendar: the same hours laid flat, days across, hours down */
  SC.calendar = {
    frame: { label: "Fig. 2", title: "2025, hour by hour", sub: "One column per day, one row per hour (UTC). Color is demand.", legend: [["ramp", r1(DMIN) + " GW", r1(DMAX) + " GW"]], note: "EIA-930 adjusted demand, summed over 53 grid operators. 103 missing operator-hours (0.02%) take the same hour a day earlier." },
    layout: function (g) {
      var f = g.fig, left = f.x + (g.mobile ? 30 : 46), right = f.x + f.w - 4;
      var cw = (right - left) / 365, ch = Math.min((f.h - 30) / 24, 24);
      var top = f.y + (f.h - 30 - ch * 24) / 2;
      var size = ch * 1.02, sh = clamp(cw * 1.15 / size, 0.02, 1);
      for (var i = 0; i < N; i++) {
        var d = (i / 24) | 0, hr = i % 24, t = (DEM[i] - DMIN) / (DMAX - DMIN);
        mPush(left + (d + 0.5) * cw, top + (hr + 0.5) * ch, 0, ramp(0.05 + 0.95 * t), 0.96, size, sh, d / 365 * 420 + hr * 4, G("hours"), i);
      }
      var o = "", m;
      var by = top + ch * 24;
      for (m = 0; m < 12; m++) {
        var xm = left + MONTH_START[m] * cw;
        o += Ln(xm, by + 2, xm, by + 7, "ax");
        if (!g.mobile || m % 2 === 0) o += T(xm + 2, by + 19, MONTHS[m]);
      }
      [0, 6, 12, 18].forEach(function (h) {
        o += T(left - 6, top + (h + 0.5) * ch + 3.5, (h < 10 ? "0" : "") + h + "h", "", "end");
      });
      var pd = (PEAK / 24) | 0, ph = PEAK % 24;
      var pxk = left + (pd + 0.5) * cw, pyk = top + (ph + 0.5) * ch;
      o += Ci(pxk, pyk, Math.max(5, ch * 0.6), ' fill="none" stroke="#eef2f8" stroke-width="1.5"');
      o += T(pxk + Math.max(5, ch * 0.6) + 6, pyk + 4, "Peak " + DMAX.toFixed(1) + " GW, 29 Jul", "lab-b halo");
      return {
        cam: flatCam(f, 1), overlay: o, exclude: { x: left - 40, y: top - 24, w: right - left + 44, h: ch * 24 + 50 },
        hit: function (mx, my) {
          var d = Math.floor((mx - left) / cw), hr = Math.floor((my - top) / ch);
          if (d < 0 || d > 364 || hr < 0 || hr > 23) return null;
          var i = d * 24 + hr, lab = hourLabel(i);
          return { html: "<strong>" + DEM[i].toFixed(1) + " GW</strong>" + lab.day + "<br>" + lab.hour,
            draw: Rc(left + d * cw - 1, top + hr * ch - 1, cw + 2, ch + 2, "", 0).replace('class=""', 'fill="none" stroke="#eef2f8" stroke-width="1.2"') };
        }
      };
    }
  };

  /* Chapter numbers drawn with the points */
  var fontsReady = false, textCache = {};
  function sampleText(str, w, h, target) {
    var key = str + "|" + Math.round(w) + "|" + Math.round(h) + "|" + fontsReady;
    if (textCache[key]) return textCache[key];
    var cv = document.createElement("canvas");
    cv.width = Math.max(1, Math.ceil(w)); cv.height = Math.max(1, Math.ceil(h));
    var ctx = cv.getContext("2d");
    try { ctx.fontStretch = "expanded"; } catch (e) { /* not supported */ }
    var size = h * 0.98;
    function setFont(s) { ctx.font = "800 " + Math.round(s) + 'px "Archivo", "Arial Black", sans-serif'; }
    setFont(size);
    var m = ctx.measureText(str);
    if (m.width > w * 0.94) { size *= w * 0.94 / m.width; setFont(size); m = ctx.measureText(str); }
    var asc = m.actualBoundingBoxAscent || size * 0.72, desc = m.actualBoundingBoxDescent || 0;
    if (asc + desc > h * 0.94) { size *= h * 0.94 / (asc + desc); setFont(size); m = ctx.measureText(str); asc = m.actualBoundingBoxAscent || size * 0.72; desc = m.actualBoundingBoxDescent || 0; }
    ctx.fillStyle = "#fff";
    ctx.fillText(str, (w - m.width) / 2, (h + asc - desc) / 2);
    var data = ctx.getImageData(0, 0, cv.width, cv.height).data, filled = 0;
    for (var q = 3; q < data.length; q += 16) if (data[q] > 128) filled += 4;
    var step = Math.max(2.2, Math.sqrt(filled / target)), pts;
    for (var tries = 0; tries < 5; tries++) {
      pts = [];
      for (var y = step / 2; y < h; y += step) {
        for (var x = step / 2; x < w; x += step) {
          if (data[((y | 0) * cv.width + (x | 0)) * 4 + 3] > 128) pts.push(x, y);
        }
      }
      if (pts.length / 2 <= N) break;
      step *= 1.08;
    }
    var res = { pts: pts, step: step };
    textCache[key] = res;
    return res;
  }
  function numberScene(n, label, title) {
    return {
      frame: { wide: true, label: label, title: title },
      layout: function (g) {
        var f = g.figOpen;
        var bw = f.w, bh = Math.min(f.h * 0.86, bw * 0.78);
        var bx = f.x, by = f.y + (f.h - bh) / 2;
        var res = sampleText(n, bw, bh, g.mobile ? 2600 : 5200);
        var pts = res.pts, cnt = pts.length / 2, s = res.step;
        for (var j = 0; j < cnt; j++) {
          var x = pts[2 * j], y = pts[2 * j + 1], t = y / bh;
          var c = mix(FLOW, INK, clamp(t * 1.2, 0, 1));
          mPush(bx + x, by + y, 0, c, 0.92, s * 0.86, 0, (x / bw) * 380 + (j % 7) * 12, G("num"), null);
        }
        return { cam: flatCam(f, 0.35), overlay: "", exclude: { x: bx, y: by, w: bw, h: bh } };
      }
    };
  }
  SC.n1 = numberScene("01", "Project 01 of 05", "Grid forecast audit");
  SC.n2 = numberScene("02", "Project 02 of 05", "Grounding probes");
  SC.n3 = numberScene("03", "Project 03 of 05", "Drift-aware MLOps");
  SC.n4 = numberScene("04", "Project 04 of 05", "CT tamper classification");
  SC.n5 = numberScene("05", "Project 05 of 05 · in progress", "SEC extraction benchmark");

  /* Operators: one bubble per grid operator, sized by demand, placed by skill */
  var opCache = {};
  function opLayout(g, corrected) {
    var f = g.fig;
    var key = [Math.round(f.x), Math.round(f.y), Math.round(f.w), Math.round(f.h)].join(",");
    var cache = opCache[key] || (opCache[key] = {});
    var axisY = f.y + f.h - 20;
    var x = lin(-1.25, 0.95, f.x + 12, f.x + f.w - 14);
    var c = clamp(Math.sqrt(0.15 * f.w * f.h / (Math.PI * N)), 0.8, 2.1);
    var cy = f.y + 40 + (axisY - 30 - f.y - 40) / 2;
    function rad(o) { return c * Math.sqrt(o.n) + 1.2; }
    function place(list, placed) {
      list.forEach(function (o) {
        var X = x(clamp(corrected ? o.skillC : o.skill, -1.25, 0.95)), R = rad(o), best = null, alt = cy, altScore = Infinity;
        for (var s = 0; s < 900; s++) {
          var y = cy + (s % 2 ? 1 : -1) * Math.ceil(s / 2) * 1.5;
          if (y - R < f.y + 34 || y + R > axisY - 14) continue;
          var worst = 0;
          for (var q = 0; q < placed.length; q++) {
            var p = placed[q], dx = p.x - X, dy = p.y - y, need = p.R + R + 1.5, dd = Math.sqrt(dx * dx + dy * dy);
            if (dd < need) worst = Math.max(worst, need - dd);
          }
          if (worst === 0) { best = y; break; }
          if (worst < altScore) { altScore = worst; alt = y; }
        }
        placed.push({ o: o, x: X, y: best == null ? alt : best, R: R });
      });
      return placed;
    }
    if (!cache.pub) {
      var order = OPS.slice().sort(function (a, b) { return b.n - a.n; });
      cache.pub = place(order, []);
    }
    var bubbles = cache.pub;
    if (corrected) {
      if (!cache.cor) {
        var fixed = cache.pub.filter(function (b) { return !b.o.hot; });
        var hot = OPS.filter(function (o) { return o.hot; }).sort(function (a, b) { return b.n - a.n; });
        cache.cor = place(hot, fixed.slice());
      }
      bubbles = cache.cor;
    }
    bubbles.forEach(function (b) {
      var o = b.o, col = o.hot ? (corrected ? COR : PUB) : NEUT, a = o.hot ? 1 : 0.62;
      var delay = corrected ? (o.hot ? 120 : 0) : (b.x - f.x) / f.w * 320;
      for (var k = 0; k < o.n; k++) {
        var r = c * Math.sqrt(k + 0.5), th = k * 2.399963;
        mPush(b.x + r * Math.cos(th), b.y + r * Math.sin(th), 0, col, a, c * 1.2, 0, delay + (k % 9) * 6, G("op:" + o.code), k);
      }
    });
    // Overlay: losing region, axis, tally, labels
    var x0 = x(0), o = "";
    o += Rc(f.x, f.y + 26, x0 - f.x, axisY - f.y - 26, "shade");
    o += Ln(f.x, axisY, f.x + f.w, axisY, "ax");
    o += Ln(x0, f.y + 26, x0, axisY, "zero");
    [-1, -0.5, 0, 0.5].forEach(function (v) {
      o += Ln(x(v), axisY, x(v), axisY + 5, "ax") + T(x(v), axisY + 17, v === 0 ? "0" : signed(v, 1), "", "middle");
    });
    o += T(f.x + f.w, axisY + 17, "skill →", "", "end");
    var lose = OPS.filter(function (q) { return (corrected ? q.skillC : q.skill) < 0; }).length;
    o += T(f.x + 6, f.y + 58, String(lose), "big halo");
    o += T(f.x + 6 + (lose > 9 ? 44 : 26), f.y + 47, "of 53 lose to the", "lab halo");
    o += T(f.x + 6 + (lose > 9 ? 44 : 26), f.y + 62, "naive forecast" + (corrected ? " (19 as published)" : ""), "lab halo");
    o += T(x0 + 6, f.y + 40, "Forecast beats naive →", "halo");
    o += T(x(-1.25) + 2, axisY - 6, "◀ 3 off scale", "halo");
    var hotB = bubbles.filter(function (b) { return b.o.hot; }).sort(function (a, b) { return a.y - b.y; });
    var boxes = [];
    function keep(x, y, text, anchor) {
      var w = text.length * 7.4, x0 = anchor === "end" ? x - w : anchor === "middle" ? x - w / 2 : x;
      boxes.push({ x: x0 - 6, y: y - 16, w: w + 12, h: 22 });
    }
    hotB.forEach(function (b, i) {
      var label = b.o.name + " " + signed(corrected ? b.o.skillC : b.o.skill, 2);
      var up = i === 0, lx = clamp(b.x, f.x + 100, f.x + f.w - 100);
      var ly = up ? b.y - b.R - 12 : b.y + b.R + 22;
      if (up && ly < f.y + 84) { ly = b.y + b.R + 22; up = false; }
      if (!up && ly > axisY - 8) {
        // no room above or below: put the label beside the bubble, on the side with more space
        var left = b.x - f.x > f.x + f.w - b.x;
        o += T(left ? b.x - b.R - 8 : b.x + b.R + 8, b.y + 4, label, "lab-b halo", left ? "end" : "start");
        keep(left ? b.x - b.R - 8 : b.x + b.R + 8, b.y + 4, label, left ? "end" : "start");
        return;
      }
      o += T(lx, ly, label, "lab-b halo", "middle");
      keep(lx, ly, label, "middle");
      o += Ln(b.x, up ? ly + 4 : ly - 14, b.x, up ? b.y - b.R - 1 : b.y + b.R + 1, "leader");
    });
    bubbles.forEach(function (b) {
      if (b.o.hot || b.R <= 22 || g.mobile) return;
      var clash = boxes.some(function (q) { return b.x + 16 > q.x && b.x - 16 < q.x + q.w && b.y + 6 > q.y && b.y - 8 < q.y + q.h; });
      if (!clash) o += T(b.x, b.y + 3.5, b.o.code, "halo", "middle");
    });
    return {
      cam: flatCam(f, 1), overlay: o, exclude: { x: f.x, y: f.y + 20, w: f.w, h: f.h - 20 },
      hit: function (mx, my) {
        for (var q = 0; q < bubbles.length; q++) {
          var b = bubbles[q], dx = mx - b.x, dy = my - b.y;
          if (dx * dx + dy * dy <= (b.R + 3) * (b.R + 3)) {
            var op = b.o, sk = corrected ? op.skillC : op.skill, mp = corrected ? op.mapeC : op.mape, nv = corrected ? op.naiveC : op.naive;
            var html = "<strong>" + op.name + " (" + op.code + ")</strong>" +
              row("Skill" + (corrected ? ", corrected" : ""), signed(sk, 2)) +
              (op.hot && corrected ? row("Skill as published", signed(op.skill, 2)) : "") +
              row("Forecast error", mp.toFixed(2) + "%") + row("Naive error", nv.toFixed(2) + "%") +
              row("2025 demand", op.twh.toFixed(1) + " TWh");
            return { html: html, draw: Ci(b.x, b.y, b.R + 4, ' fill="none" stroke="#eef2f8" stroke-width="1.2"') };
          }
        }
        return null;
      }
    };
  }
  SC.operators = {
    frame: { label: "Fig. 3", title: "Forecast skill by grid operator, 2025, as published", sub: "Bubble area is 2025 demand. Left of zero, a naive forecast that repeats yesterday wins.", legend: [["key-dot key-pub", "California ISO, Southwest Power Pool"], ["key-dot", "Other operators"]], note: "Skill = 1 − (forecast error ÷ naive error) on the same hours. Off the left edge: Puget Sound Energy −5.32, Duke Energy Florida −2.75, Southwestern Power Administration −1.66. Each operator gets at least 8 points so the smallest stay visible." },
    layout: function (g) { return opLayout(g, false); }
  };
  SC.operators2 = {
    frame: { label: "Fig. 3, corrected", title: "Forecast skill by grid operator, 2025, after the three fixes", sub: "Only California ISO and Southwest Power Pool change.", legend: [["key-dot key-cor", "California ISO, Southwest Power Pool, corrected"], ["key-dot", "Other operators"]], note: "Source: grid-forecast-audit, main run and the “All corrections” variant." },
    layout: function (g) { return opLayout(g, true); }
  };

  /* California ISO, an average 2025 day */
  function cr(vals, h) {
    var u = clamp(h - 1, 0, vals.length - 1), i = Math.min(Math.floor(u), vals.length - 2), t = u - i;
    var p0 = vals[Math.max(i - 1, 0)], p1 = vals[i], p2 = vals[i + 1], p3 = vals[Math.min(i + 2, vals.length - 1)];
    var t2 = t * t, t3 = t2 * t;
    return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  }
  var HOUR_TICKS = [[1, "1 am"], [6, "6 am"], [12, "noon"], [18, "6 pm"], [24, "midnight"]];
  function cisoAxes(g) {
    var f = g.fig;
    var x = lin(1, 24, f.x + 40, f.x + f.w - (g.mobile ? 20 : 150));
    var y = lin(19.5, 29.5, f.y + f.h - 26, f.y + 34);
    var o = "";
    [20, 22, 24, 26, 28].forEach(function (v) {
      o += Ln(f.x + 40, y(v), x(24), y(v), "grid") + T(f.x + 34, y(v) + 3.5, v + (v === 28 ? " GW" : ""), "", "end");
    });
    HOUR_TICKS.forEach(function (h) {
      if (g.mobile && h[0] === 1) return;
      o += T(x(h[0]), f.y + f.h - 8, h[1], "", "middle");
    });
    return { x: x, y: y, o: o };
  }
  var CURVE_N = 300;
  function curveMarks(vals, ax, col, a, size, grp, delayFn, shift) {
    for (var j = 0; j < CURVE_N; j++) {
      var h = 1 + 23 * j / (CURVE_N - 1);
      mPush(ax.x(h), ax.y(cr(vals, h)), 0, col, a, size, 0, delayFn ? delayFn(j) : 0, G(grp), j);
    }
    for (var q = 0; q < 24; q++) {
      mPush(ax.x(q + 1), ax.y(vals[q]), 0, col, Math.min(1, a + 0.1), size * 2.3, 0, delayFn ? delayFn(q * 12) : 0, G(grp + "K"), q);
    }
  }
  function cisoHit(ax, f) {
    return function (mx, my) {
      if (!inRect(mx, my, f, 6)) return null;
      var h = Math.round(clamp((mx - ax.x(1)) / (ax.x(24) - ax.x(1)) * 23 + 1, 1, 24)), d = D.cisoDay;
      var lab = h === 12 ? "noon" : h === 24 ? "midnight" : (h % 12) + (h < 12 ? " am" : " pm");
      return {
        html: "<strong>Hour ending " + lab + "</strong>" + row("Demand as published", d.published[h - 1].toFixed(2) + " GW", "#e46e2b") +
          row("Forecast", d.forecast[h - 1].toFixed(2) + " GW", "#97a3b8") + row("Corrected demand", d.corrected[h - 1].toFixed(2) + " GW", "#1c9ad6"),
        draw: Ln(ax.x(h), f.y + 30, ax.x(h), f.y + f.h - 24, "rule")
      };
    };
  }
  SC.ciso = {
    frame: { label: "Fig. 4", title: "California ISO, an average 2025 day", sub: "Mean demand and day-ahead forecast by hour, Pacific time.", legend: [["key-pub", "Demand as published"], ["", "Day-ahead forecast"]], note: "Mean by local hour ending over every 2025 hour with both values (8,661 hours)." },
    layout: function (g) {
      var f = g.fig, ax = cisoAxes(g), d = D.cisoDay;
      curveMarks(d.forecast, ax, NEUT, 0.85, g.mobile ? 1.7 : 2.2, "ciso:fc", function (j) { return j * 1.2; });
      curveMarks(d.published, ax, PUB, 0.95, g.mobile ? 1.9 : 2.5, "ciso:A", function (j) { return 160 + j * 1.2; });
      var o = ax.o, h12 = ax.x(12);
      o += Ln(h12, ax.y(d.published[11]) + 6, h12, ax.y(d.forecast[11]) - 6, "leader", ' marker-end="url(#arrowhead)" marker-start="url(#arrowhead)"');
      o += T(h12 + 8, (ax.y(d.published[11]) + ax.y(d.forecast[11])) / 2 + 4, (d.published[11] - d.forecast[11]).toFixed(1) + " GW gap", "lab-b halo");
      if (!g.mobile) {
        o += T(ax.x(24) + 10, ax.y(d.published[23]) + 4, "Demand as published", "lab halo");
        o += T(ax.x(24) + 10, ax.y(d.forecast[23]) + 14, "Forecast", "lab halo");
      }
      return { cam: flatCam(f, 1), overlay: o, exclude: f, hit: cisoHit(ax, f) };
    }
  };

  // The correction, animated: demand slides back an hour, then the charging drains out
  SC.cisofix = {
    continuous: true,
    frame: { label: "Fig. 4, corrected", title: "California ISO, an average 2025 day, corrected", sub: "Demand moved back an hour, then battery charging taken out.", legend: [["key-ghost", "As published"], ["key-cor", "Corrected demand"], ["", "Day-ahead forecast"]], note: "California ISO’s 2025 error: 8.28% as published, 2.35% corrected." },
    layout: function (g) {
      var f = g.fig, ax = cisoAxes(g), d = D.cisoDay;
      curveMarks(d.forecast, ax, NEUT, 0.85, g.mobile ? 1.7 : 2.2, "ciso:fc");
      curveMarks(d.published, ax, PUB, 0.22, g.mobile ? 1.5 : 1.9, "ciso:ghost", function (j) { return 300 + j; });
      var first = MK.n;
      curveMarks(d.published, ax, PUB, 0.95, g.mobile ? 1.9 : 2.5, "ciso:A");
      var count = MK.n - first;
      var o = ax.o;
      function overlayFor(stage) {
        var s = o;
        var hA = 9.5, hB = 12;
        if (stage >= 1) {
          s += Pa("M" + fx(ax.x(hA + 1)) + "," + fx(ax.y(28.6)) + " L" + fx(ax.x(hA) + 4) + "," + fx(ax.y(28.6)), "arrow");
          s += T(ax.x(hA + 1) + 6, ax.y(28.6) + 4, "① moved back an hour", "lab-b halo");
        }
        if (stage >= 2) {
          s += Pa("M" + fx(ax.x(hB)) + "," + fx(ax.y(d.moved[hB - 1]) + 6) + " L" + fx(ax.x(hB)) + "," + fx(ax.y(d.corrected[hB - 1]) - 8), "arrow");
          s += T(ax.x(hB) + 8, (ax.y(d.moved[hB - 1]) + ax.y(d.corrected[hB - 1])) / 2 + 4, "② battery charging out", "lab-b halo");
        }
        if (stage >= 2 && !g.mobile) {
          s += T(ax.x(24) + 10, ax.y(d.corrected[23]) + 4, "Corrected", "lab halo");
          s += T(ax.x(24) + 10, ax.y(d.published[23]) - 8, "As published", "halo");
        }
        return s;
      }
      // Targets for one point of the moving line at stage time u (0..1 per stage)
      function targetAt(j, isKnot, stage, u) {
        var h = isKnot ? j + 1 : 1 + 23 * j / (CURVE_N - 1);
        if (stage === 0) return [ax.x(h), ax.y(isKnot ? d.published[j] : cr(d.published, h))];
        var h2 = h - 1, wrap = false;
        if (h2 < 1) { h2 += 24; wrap = true; }
        var movedY = ax.y(isKnot ? d.moved[Math.round(h2) - 1] : cr(d.moved, h2));
        if (stage === 1) {
          var e = ease(u);
          var y0 = ax.y(isKnot ? d.published[j] : cr(d.published, h));
          return [lerp(ax.x(h), ax.x(h2), wrap ? (e < 0.5 ? 0 : 1) : e), lerp(y0, movedY, e)];
        }
        var e2 = ease(u);
        var corY = ax.y(isKnot ? d.corrected[Math.round(h2) - 1] : cr(d.corrected, h2));
        return [ax.x(h2), lerp(movedY, corY, e2)];
      }
      var stageShown = -1;
      var res = {
        cam: flatCam(f, 1), overlay: "", exclude: f, hit: cisoHit(ax, f),
        start: 0,
        update: function (t, now) {
          var el = (now - res.start) / 1000;
          var stage, u;
          if (reduceMotion) { stage = 2; u = 1; }
          else if (el < 0.7) { stage = 0; u = 0; }
          else if (el < 2.0) { stage = 1; u = (el - 0.7) / 1.3; }
          else if (el < 2.5) { stage = 1; u = 1; }
          else { stage = 2; u = clamp((el - 2.5) / 1.3, 0, 1); }
          var colT = stage < 2 ? 0 : ease(u);
          var col = mix(PUB, COR, colT);
          for (var k = 0; k < count; k++) {
            var m = first + k, p = markToP[m];
            var isKnot = k >= CURVE_N, j = isKnot ? k - CURVE_N : k;
            var tg = targetAt(j, isKnot, stage, u);
            P.tx[p] = tg[0]; P.ty[p] = tg[1];
            P.tr[p] = col[0]; P.tg[p] = col[1]; P.tb[p] = col[2];
          }
          var want = stage === 0 ? 0 : stage === 1 ? 1 : 2;
          if (want !== stageShown) { stageShown = want; showOverlay(overlayFor(want), 0); }
          res.done = stage === 2 && u >= 1;
        }
      };
      res.replay = function () { res.start = performance.now(); stageShown = -1; res.done = false; kick(); };
      return res;
    }
  };

  /* Southwest Power Pool, daily error through 2025 */
  SC.swpp = {
    frame: { label: "Fig. 5", title: "Southwest Power Pool, daily forecast error, 2025", sub: "Total absolute error ÷ total demand, each day.", legend: [["key-dot", "Before 7 May (both the same)"], ["key-dot key-pub", "As published"], ["key-dot key-cor", "With SPP’s own forecast"]], note: "Scored hours only; days with none are left out." },
    layout: function (g) {
      var f = g.fig, sw = D.dailySWPP;
      var left = f.x + 34, right = f.x + f.w - (g.mobile ? 6 : 112);
      var x = lin(0, 364, left, right), y = lin(0, 24, f.y + f.h - 26, f.y + 30);
      var sz = g.mobile ? 2.4 : 3.4;
      for (var dI = 0; dI < 365; dI++) {
        var p = sw.published[dI], c = sw.corrected[dI], dl = dI / 365 * 500;
        if (dI < SWPP_CHANGE) {
          if (p != null) mPush(x(dI), y(p), 0, NEUT, 0.85, sz, 0, dl, G("sw:pub"), dI);
        } else {
          if (p != null) mPush(x(dI), y(p), 0, PUB, 0.95, sz, 0, dl, G("sw:pub"), dI);
          if (c != null) mPush(x(dI), y(c), 0, COR, 0.95, sz, 0, dl + 120, G("sw:cor"), dI);
        }
      }
      var o = "", xc = x(SWPP_CHANGE);
      [0, 5, 10, 15, 20].forEach(function (v) {
        o += Ln(left, y(v), right, y(v), "grid") + T(left - 6, y(v) + 3.5, v + "%", "", "end");
      });
      for (var m = 0; m < 12; m++) {
        if (g.mobile && m % 2) continue;
        o += T(x(MONTH_START[m]) + 2, f.y + f.h - 8, MONTHS[m]);
      }
      o += Ln(xc, f.y + 18, xc, f.y + f.h - 22, "rule");
      o += g.mobile ? T(xc + 6, f.y + 40, "7 May", "lab-b halo") : T(xc - 8, f.y + 42, "7 May: SWPP’s forecast changes", "lab-b halo", "end");
      var before = median(sw.published.slice(0, SWPP_CHANGE)), after = median(sw.published.slice(SWPP_CHANGE)), afterC = median(sw.corrected.slice(SWPP_CHANGE));
      o += Ln(left, y(before), xc, y(before), "median");
      o += Ln(xc, y(after), right, y(after), "median");
      o += Ln(xc, y(afterC), right, y(afterC), "median");
      if (!g.mobile) {
        o += T(right + 8, y(after) + 4, "Median " + after.toFixed(1) + "%", "lab halo");
        o += T(right + 8, y(afterC) - 2, "Median " + afterC.toFixed(1) + "%", "lab halo");
        o += T(right + 8, y(afterC) + 12, "(SPP’s own)", "halo");
      }
      o += T(left + 6, y(before) - 8, "Median " + before.toFixed(1) + "%", "lab halo");
      return {
        cam: flatCam(f, 1), overlay: o, exclude: f,
        hit: function (mx, my) {
          if (!inRect(mx, my, f, 4)) return null;
          var dI = Math.round(clamp((mx - left) / (right - left) * 364, 0, 364));
          var p = sw.published[dI], c = sw.corrected[dI];
          var html = "<strong>" + dayLabel(dI) + " 2025</strong>" +
            (p == null ? row("No scored hours", "") : dI < SWPP_CHANGE ? row("Daily error", p.toFixed(2) + "%", "#97a3b8") :
              row("As published", p.toFixed(2) + "%", "#e46e2b") + row("SPP’s own forecast", c == null ? "n/a" : c.toFixed(2) + "%", "#1c9ad6"));
          return { html: html, draw: Ln(x(dI), f.y + 30, x(dI), f.y + f.h - 24, "rule") };
        }
      };
    }
  };

  /* National error by year */
  function polyMarks(xs, ys, n, col, a, size, grp, delay) {
    var seg = [], L = 0, i;
    for (i = 0; i < xs.length - 1; i++) {
      var l = Math.hypot(xs[i + 1] - xs[i], ys[i + 1] - ys[i]);
      seg.push(l); L += l;
    }
    for (var j = 0; j < n; j++) {
      var target = L * j / (n - 1), acc = 0;
      for (i = 0; i < seg.length - 1 && acc + seg[i] < target; i++) acc += seg[i];
      var t = seg[i] ? (target - acc) / seg[i] : 0;
      mPush(lerp(xs[i], xs[i + 1], t), lerp(ys[i], ys[i + 1], t), 0, col, a, size, 0, delay + j * 1.5, G(grp), j);
    }
    for (i = 0; i < xs.length; i++) mPush(xs[i], ys[i], 0, col, 1, size * 2.6, 0, delay + i * 40, G(grp + "K"), i);
  }
  SC.national = {
    frame: { label: "Fig. 6", title: "National forecast error by year", sub: "Total absolute error ÷ total demand, 50 operators present every year.", legend: [["key-pub", "As published"], ["key-cor", "All corrections"]], note: "Trend: Mann–Kendall test, Theil–Sen slope. As published +0.061 points a year (p = 0.049); corrected +0.009 (p = 0.721)." },
    layout: function (g) {
      var f = g.fig;
      var left = f.x + 40, right = f.x + f.w - (g.mobile ? 14 : 150);
      var x = lin(2016, 2025, left, right), y = lin(3.1, 4.2, f.y + f.h - 26, f.y + 30);
      var xs = YEARS.map(x);
      polyMarks(xs, NAT_PUB.map(y), 380, PUB, 0.95, g.mobile ? 2 : 2.6, "nat:pub", 0);
      polyMarks(xs, NAT_COR.map(y), 380, COR, 0.95, g.mobile ? 2 : 2.6, "nat:cor", 260);
      var o = "";
      [3.2, 3.4, 3.6, 3.8, 4.0].forEach(function (v) {
        o += Ln(left, y(v), right, y(v), "grid") + T(left - 6, y(v) + 3.5, v.toFixed(1) + "%", "", "end");
      });
      YEARS.forEach(function (yr, i) {
        if (g.mobile && i % 3 && i !== 9) return;
        o += T(x(yr), f.y + f.h - 8, String(yr), "", "middle");
      });
      if (!g.mobile) {
        o += T(right + 12, y(NAT_PUB[9]) + 4, "As published " + NAT_PUB[9].toFixed(2) + "%", "lab-b halo");
        o += T(right + 12, y(NAT_PUB[9]) + 19, "worst of 10 years", "halo");
        o += T(right + 12, y(NAT_COR[9]) + 4, "Corrected " + NAT_COR[9].toFixed(2) + "%", "lab-b halo");
        o += T(right + 12, y(NAT_COR[9]) + 19, "8th-worst", "halo");
      }
      return {
        cam: flatCam(f, 1), overlay: o, exclude: f,
        hit: function (mx, my) {
          if (!inRect(mx, my, f, 4)) return null;
          var i = Math.round(clamp((mx - left) / (right - left) * 9, 0, 9));
          return {
            html: "<strong>" + YEARS[i] + "</strong>" + row("As published", NAT_PUB[i].toFixed(2) + "%", "#e46e2b") + row("All corrections", NAT_COR[i].toFixed(2) + "%", "#1c9ad6"),
            draw: Ln(x(YEARS[i]), f.y + 26, x(YEARS[i]), f.y + f.h - 22, "rule")
          };
        }
      };
    }
  };

  /* Grounding probes: waffles, then 51 empty rings beside a 99.6% waffle */
  function waffleMarks(ox, oy, ww, v, grp, delay0) {
    var cell = ww / 10, pad = cell * 0.09, sub = (cell - 2 * pad) / 3;
    var whole = Math.floor(v + 1e-9), part = Math.round((v - whole) * 9);
    for (var ci = 0; ci < 100; ci++) {
      var col = ci % 10, rowI = 9 - Math.floor(ci / 10);
      for (var q = 0; q < 9; q++) {
        var lit = ci < whole || (ci === whole && q < part);
        mPush(ox + col * cell + pad + (q % 3 + 0.5) * sub, oy + rowI * cell + pad + (Math.floor(q / 3) + 0.5) * sub, 0,
          lit ? INK : DIM, lit ? 0.95 : 0.9, sub * 0.84, 1, delay0 + ci * 5 + q * 3, G(grp), ci * 9 + q);
      }
    }
  }
  SC.waffles = {
    frame: { label: "Fig. 7", title: "Grounding DINO + SAM, share of probes answered correctly", sub: "Each square is 1% of probes.", legend: [["key-sq key-ink", "Correct"], ["key-sq key-dim", "Wrong"]] },
    layout: function (g) {
      var f = g.fig, gap = g.mobile ? 26 : 64;
      var ww = Math.min((f.w - gap) / 2, f.h - 90, 340);
      var total = ww * 2 + gap, x0 = f.x + (f.w - total) / 2, y0 = f.y + (f.h - ww - 64) / 2;
      waffleMarks(x0, y0, ww, 93, "waf0", 0);
      waffleMarks(x0 + ww + gap, y0, ww, 20.7, "waf1", 140);
      var o = "", ly = y0 + ww + 40;
      o += T(x0, ly, "93%", "big halo") + T(x0, ly + 18, "Control prompts", "lab halo");
      o += T(x0 + ww + gap, ly, "20.7%", "big halo") + T(x0 + ww + gap, ly + 18, "Negation prompts", "lab halo");
      return { cam: flatCam(f, 1), overlay: o, exclude: { x: x0 - 10, y: y0 - 10, w: total + 20, h: ww + 80 } };
    }
  };
  SC.rings = {
    frame: { label: "Fig. 8", title: "Spatial queries, and SAM given the true boxes", sub: "Left: one ring per paired spatial query. Right: each square is 1% of probes.", legend: [["key-dot key-dim", "Wrong"], ["key-sq key-ink", "Correct"]] },
    layout: function (g) {
      var f = g.fig, gap = g.mobile ? 22 : 64;
      var ww = Math.min((f.w - gap) / 2.5, f.h - 90, 320);
      var total = ww * 2.5 + gap, x0 = f.x + (f.w - total) / 2, y0 = f.y + (f.h - ww - 64) / 2;
      var cw = ww / 6, rr = cw * 0.32, ringN = g.mobile ? 12 : 16;
      for (var q = 0; q < 51; q++) {
        var cx = x0 + (q % 9 + 0.5) * cw, cy = y0 + (Math.floor(q / 9) + 0.5) * cw;
        for (var k = 0; k < ringN; k++) {
          var th = k / ringN * Math.PI * 2;
          mPush(cx + rr * Math.cos(th), cy + rr * Math.sin(th), 0, NEUT, 0.75, g.mobile ? 1.4 : 1.9, 0, q * 9 + k * 2, G("ring"), q * ringN + k);
        }
      }
      var wx = x0 + ww * 1.5 + gap;
      waffleMarks(wx, y0, ww, 99.6, "waf2", 240);
      var o = "", ly = y0 + ww + 40;
      o += T(x0, ly, "0 of 51", "big halo") + T(x0, ly + 18, g.mobile ? "spatial pairs right" : "paired spatial queries right", "lab halo");
      o += T(wx, ly, "99.6%", "big halo") + T(wx, ly + 18, g.mobile ? "SAM, true boxes" : "SAM given ground-truth boxes", "lab halo");
      return { cam: flatCam(f, 1), overlay: o, exclude: { x: x0 - 10, y: y0 - 10, w: total + 20, h: ww + 80 } };
    }
  };

  /* Drift-aware MLOps: the retraining loop, then before and after */
  var LOOP = [["Serve", "XGBoost + FastAPI"], ["Log", "PostgreSQL"], ["Watch", "Evidently, Prometheus, Grafana"], ["Retrain", "Airflow + MLflow"], ["Gate", "+0.005 PR-AUC, ≤0.03 ROC-AUC lost"], ["Ship", "new model takes over"]];
  SC.loop = {
    continuous: true,
    frame: { label: "Fig. 9", title: "The retraining loop", sub: "Schematic: predictions flow around the loop; a retrained model ships only if it passes the gate." },
    layout: function (g) {
      var f = g.fig, cx = f.x + f.w / 2, cy = f.y + f.h / 2 + 6;
      var R = Math.min(f.w * (g.mobile ? 0.32 : 0.27), f.h * 0.36);
      var flowFirst = MK.n, FLOWN = g.mobile ? 700 : 1100;
      var rand = rng(5);
      var phase = [], jit = [];
      for (var j = 0; j < FLOWN; j++) {
        var th = j / FLOWN * Math.PI * 2;
        phase.push(th); jit.push((rand() - 0.5) * (g.mobile ? 7 : 11));
        mPush(cx + (R + jit[j]) * Math.cos(th), cy + (R + jit[j]) * Math.sin(th), 0, FLOW, 0.35 + rand() * 0.45, g.mobile ? 1.5 : 2, 0, j * 0.6, G("flow"), j);
      }
      var nodeFirst = MK.n, NODE = g.mobile ? 34 : 64, c = g.mobile ? 1.2 : 1.55;
      for (var k = 0; k < 6; k++) {
        var a = -Math.PI / 2 + k * Math.PI / 3, nx = cx + R * Math.cos(a), ny = cy + R * Math.sin(a);
        for (var s = 0; s < NODE; s++) {
          var rr = c * Math.sqrt(s + 0.5), t2 = s * 2.399963;
          mPush(nx + rr * Math.cos(t2), ny + rr * Math.sin(t2), 0, INK, 0.95, c * 1.5, 0, 200 + k * 60, G("node" + k), s);
        }
      }
      var o = "";
      for (k = 0; k < 6; k++) {
        var ang = -Math.PI / 2 + k * Math.PI / 3, lx = cx + (R + (g.mobile ? 26 : 34)) * Math.cos(ang), ly = cy + (R + (g.mobile ? 26 : 34)) * Math.sin(ang);
        var anchor = Math.abs(Math.cos(ang)) < 0.2 ? "middle" : Math.cos(ang) > 0 ? "start" : "end";
        var dy = Math.sin(ang) < -0.5 ? -8 : Math.sin(ang) > 0.5 ? 14 : 4;
        o += T(lx, ly + dy, (k + 1) + "  " + LOOP[k][0], "lab-b halo", anchor);
        if (!g.mobile) o += T(lx, ly + dy + 15, LOOP[k][1], "halo", anchor);
      }
      return {
        cam: flatCam(f, 0.3), overlay: o, exclude: { x: cx - R - 40, y: cy - R - 40, w: 2 * R + 80, h: 2 * R + 80 },
        update: function (t) {
          if (reduceMotion) return;
          var sp = t * 0.3;
          for (var j = 0; j < FLOWN; j++) {
            var p = markToP[flowFirst + j], th = phase[j] + sp, rj = R + jit[j];
            P.tx[p] = cx + rj * Math.cos(th); P.ty[p] = cy + rj * Math.sin(th);
          }
          for (var k = 0; k < 6; k++) {
            var pulse = Math.max(0, Math.sin(t * 1.6 - k * 1.047));
            var sz = c * 1.5 * (1 + 0.45 * pulse * pulse);
            for (var s = 0; s < NODE; s++) P.ts[markToP[nodeFirst + k * NODE + s]] = sz;
          }
        }
      };
    }
  };
  SC.bars = {
    frame: { label: "Fig. 10", title: "Simulated concept shift", sub: "Each column is 0.01.", legend: [["key-sq key-pub", "Before retraining"], ["key-sq key-cor", "After"]] },
    layout: function (g) {
      var f = g.fig, lw = g.mobile ? 0 : 170;
      var x = lin(0, 1, f.x + lw, f.x + f.w - 50);
      var colW = (x(1) - x(0)) / 100, bh = Math.min(colW * 3, 16);
      var mid = f.y + f.h * 0.44, rowsY = [mid - 64, mid + 64];
      var metrics = [["PR-AUC, shifted data", 0.37, 0.89], ["ROC-AUC, historical data", 0.75, 0.75]];
      var o = "";
      metrics.forEach(function (mt, i) {
        var yb = rowsY[i];
        [[mt[1], PUB, -bh * 0.7, "b"], [mt[2], COR, bh * 0.7, "a"]].forEach(function (bar) {
          var cols = Math.round(bar[0] * 100);
          for (var cI = 0; cI < cols; cI++) {
            for (var s = 0; s < 3; s++) {
              mPush(x(0) + (cI + 0.5) * colW, yb + bar[2] + (s - 1) * bh / 3, 0, bar[1], 0.95, Math.min(colW, bh / 3) * 0.86, 1, (bar[3] === "a" ? 300 : 0) + cI * 7, G("bar" + i + bar[3]), cI * 3 + s);
            }
          }
        });
        if (g.mobile) o += T(x(0), yb - bh * 1.4 - 8, mt[0], "lab-b halo");
        else o += T(x(0) - 14, yb + 4, mt[0], "lab-b halo", "end");
        o += T(x(mt[1]) + 8, yb - bh * 0.7 + 4, mt[1].toFixed(2), "lab halo");
        o += T(x(mt[2]) + 8, yb + bh * 0.7 + 4, mt[2].toFixed(2), "lab-b halo");
      });
      var axY = rowsY[1] + bh * 1.4 + 34;
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
        o += Ln(x(v), axY, x(v), axY + 5, "ax") + T(x(v), axY + 18, String(v), "", "middle");
      });
      o += Ln(x(0), axY, x(1), axY, "ax");
      return { cam: flatCam(f, 1), overlay: o, exclude: f };
    }
  };

  /* CT: a schematic stack of 16 slices that folds into one image */
  var CT_SLICES = 16;
  function ctValue(u, v, s) {
    var bx = (u - 0.5) / 0.44, by = (v - 0.52) / 0.36;
    if (bx * bx + by * by > 1) return -1;
    var val = 0.55;
    var lx = (Math.abs(u - 0.5) - 0.17) / 0.12, ly = (v - 0.5) / 0.22;
    if (lx * lx + ly * ly < 1) val = 0.12;
    var nr = 0.075 * Math.sin(Math.PI * (s + 0.5) / CT_SLICES);
    var nx = u - 0.63, ny = v - 0.47;
    if (nx * nx + ny * ny < nr * nr) val = 1;
    return val;
  }
  function ctMarks(g, box, flat) {
    var G2 = g.mobile ? 16 : 22, S = box.s, gapY = S * 0.042;
    for (var sl = 0; sl < CT_SLICES; sl++) {
      for (var q = 0; q < G2 * G2; q++) {
        var ui = q % G2, vi = Math.floor(q / G2);
        var u = (ui + 0.5) / G2, v = (vi + 0.5) / G2;
        var val = ctValue(u, v, sl), edge = ui === 0 || vi === 0 || ui === G2 - 1 || vi === G2 - 1;
        var col = val >= 1 ? mix(INK, PUB, 0.3) : INK, a, x = box.cx + (u - 0.5) * S, y, z;
        if (flat) {
          a = val < 0 ? 0.006 : 0.015 + 0.075 * val;
          y = box.cy + (v - 0.5) * S; z = 0;
        } else {
          a = edge ? 0.5 : val < 0 ? 0.025 : 0.07 + 0.3 * val;
          if (edge) col = FLOW;
          y = box.cy + ((CT_SLICES - 1) / 2 - sl) * gapY; z = (v - 0.5) * S;
        }
        mPush(x, y, z, col, a, S / G2 * (flat ? 0.62 : 0.5), 1, flat ? sl * 55 : sl * 45, G("ct"), sl * G2 * G2 + q);
      }
    }
  }
  SC.slices = {
    continuous: true,
    frame: { label: "Fig. 11", title: "16 CT slices in", sub: "Schematic, not patient data: a suspect region arrives as a stack of slices." },
    layout: function (g) {
      var f = g.fig, sz = Math.min(f.w * 0.62, f.h * 0.8) * (g.mobile ? 0.8 : 0.8);
      var box = { cx: f.x + f.w / 2, cy: f.y + f.h / 2, s: sz };
      ctMarks(g, box, false);
      var gapY = sz * 0.042;
      return {
        cam: { px: box.cx, py: box.cy, pz: 0, yaw: 0.55, pitch: 0.58, dist: Math.max(W, H) * 1.3, add: 0.55 },
        pins: [{ x: box.cx + sz / 2, y: box.cy - (CT_SLICES - 1) / 2 * gapY, z: sz / 2, cls: "pin-axis", dx: 12, dy: -6, html: "16 slices" }],
        exclude: { x: box.cx - sz, y: box.cy - sz, w: 2 * sz, h: 2 * sz },
        update: function (t) {
          camT.yaw = 0.55 + (reduceMotion ? 0 : 0.25 * Math.sin(t * 0.45));
        }
      };
    }
  };
  SC.collapse = {
    frame: { label: "Fig. 11", title: "16 slices in, one image out", sub: "Schematic: the compressor folds the stack into one image for an ImageNet-pretrained ResNet-18." },
    layout: function (g) {
      var f = g.fig, s = Math.min(f.w * (g.mobile ? 0.42 : 0.36), f.h * 0.6);
      var box = { cx: f.x + s / 2 + (g.mobile ? 4 : 20), cy: f.y + f.h / 2, s: s };
      ctMarks(g, box, true);
      var o = "", ax0 = box.cx + s / 2 + 14, mx = f.x + f.w * (g.mobile ? 0.66 : 0.62), bw = g.mobile ? 96 : 150, bh = 56;
      o += Pa("M" + fx(ax0) + "," + fx(box.cy) + " L" + fx(mx - bw / 2 - 8) + "," + fx(box.cy), "arrow");
      o += Rc(mx - bw / 2, box.cy - bh / 2, bw, bh, "box", 10);
      o += T(mx, box.cy - 3, "ResNet-18", "lab-b", "middle") + T(mx, box.cy + 13, g.mobile ? "pretrained" : "ImageNet-pretrained", "", "middle");
      var ox = mx + bw / 2 + 12, ex = f.x + f.w - 6;
      var lx = ex - (g.mobile ? 58 : 74);
      o += Pa("M" + fx(ox) + "," + fx(box.cy - 6) + " L" + fx(lx - 10) + "," + fx(box.cy - 34), "arrow");
      o += Pa("M" + fx(ox) + "," + fx(box.cy + 6) + " L" + fx(lx - 10) + "," + fx(box.cy + 34), "arrow");
      o += T(lx, box.cy - 30, "Real", "lab-b halo") + T(lx, box.cy + 40, "Tampered", "lab-b halo");
      o += T(box.cx, box.cy + s / 2 + 22, "1 image", "lab halo", "middle");
      return { cam: flatCam(f, 0.2), overlay: o, exclude: f };
    }
  };
  SC.auc = {
    frame: { label: "Fig. 12", title: "Peak validation AUC by design", sub: "Best of 15 epochs, 39 patches from held-out scans.", legend: [["key-dot key-ink", "Our design"], ["key-dot", "Other designs"]], note: "0.5 is a coin flip. No separate test set: a small-sample result." },
    layout: function (g) {
      var f = g.fig, lw = g.mobile ? 0 : 230;
      var x = lin(0.5, 1, f.x + lw, f.x + f.w - 50);
      var rowH = Math.min((f.h - 60) / 5, 70), y0 = f.y + Math.max(20, (f.h - 5 * rowH - 50) / 2);
      var o = "";
      CT.forEach(function (d, i) {
        var yy = y0 + (i + 0.5) * rowH + (g.mobile ? 10 : 0), best = !!d[2], col = best ? INK : NEUT;
        for (var j = 0; j < 70; j++) {
          var t = j / 69;
          mPush(lerp(x(0.5), x(d[1]), t), yy, 0, col, best ? 0.5 : 0.3, g.mobile ? 1.4 : 1.7, 0, i * 80 + j * 3, G("aucL" + i), j);
        }
        var cnt = g.mobile ? 40 : 60, c = g.mobile ? 1.15 : 1.45;
        for (var s = 0; s < cnt; s++) {
          var rr = c * Math.sqrt(s + 0.5), th = s * 2.399963;
          mPush(x(d[1]) + rr * Math.cos(th), yy + rr * Math.sin(th), 0, col, 0.98, c * 1.45, 0, i * 80 + 220, G("aucD" + i), s);
        }
        if (g.mobile) o += T(x(0.5), yy - 13, d[0], best ? "lab-b halo" : "lab halo");
        else o += T(x(0.5) - 14, yy + 4, d[0], best ? "lab-b halo" : "lab halo", "end");
        o += T(x(d[1]) + 16, yy + 4, d[1].toFixed(3), best ? "lab-b halo" : "lab halo");
      });
      var ay = y0 + 5 * rowH + (g.mobile ? 22 : 14);
      o += Ln(x(0.5), ay, x(1), ay, "ax");
      [0.5, 0.6, 0.7, 0.8, 0.9, 1].forEach(function (v) {
        o += Ln(x(v), ay, x(v), ay + 5, "ax") + T(x(v), ay + 17, v.toFixed(1), "", "middle");
      });
      o += T(x(0.5), ay + 31, "coin flip", "", g.mobile ? "start" : "middle");
      return { cam: flatCam(f, 1), overlay: o, exclude: f };
    }
  };

  /* SEC benchmark: prompt v1 to v2, with points flowing between them */
  SC.secfig = {
    continuous: true,
    frame: { label: "Fig. 13", title: "Open models: share of 293 figures correct", legend: [["key-dot key-pub", "Prompt v1"], ["key-dot key-cor", "v2: value + unit"]], note: "One A100 per run. Unit slips across open models: 355 → 34." },
    layout: function (g) {
      var f = g.fig, lw = g.mobile ? 0 : 190;
      var x = lin(40, 100, f.x + lw, f.x + f.w - 70);
      var rowH = Math.min((f.h - 60) / 5, 72), y0 = f.y + Math.max(16, (f.h - 5 * rowH - 50) / 2);
      var o = "", streams = [];
      var cnt = g.mobile ? 30 : 46, c = g.mobile ? 1.15 : 1.4;
      SEC.forEach(function (m, i) {
        var yy = y0 + (i + 0.5) * rowH + (g.mobile ? 10 : 0);
        [[m[2], PUB, "v1"], [m[3], COR, "v2"]].forEach(function (pt) {
          for (var s = 0; s < cnt; s++) {
            var rr = c * Math.sqrt(s + 0.5), th = s * 2.399963;
            mPush(x(pt[0]) + rr * Math.cos(th), yy + rr * Math.sin(th), 0, pt[1], 0.98, c * 1.45, 0, i * 70 + (pt[2] === "v2" ? 260 : 0), G("sec" + pt[2] + i), s);
          }
        });
        var first = MK.n, SN = 26;
        for (var j = 0; j < SN; j++) {
          var t = j / SN;
          mPush(lerp(x(m[2]), x(m[3]), t), yy, 0, INK, 0.5, 1.6, 0, 500 + j * 8, G("secS" + i), j);
        }
        streams.push({ first: first, n: SN, x1: x(m[2]), x2: x(m[3]), y: yy });
        var name = m[0] + (m[1] ? " (" + m[1] + ")" : "");
        if (g.mobile) o += T(x(40), yy - 13, name, "lab halo");
        else o += T(x(40) - 14, yy + 4, name, "lab halo", "end");
        var hi = Math.max(m[2], m[3]);
        if (g.mobile) o += T(f.x + f.w, yy - 13, m[2].toFixed(1) + " → " + m[3].toFixed(1) + "%", "lab-b halo", "end");
        else o += T(x(hi) + 14, yy + 4, m[2].toFixed(1) + " → " + m[3].toFixed(1) + "%", "lab-b halo");
      });
      var ay = y0 + 5 * rowH + (g.mobile ? 20 : 12);
      o += Ln(x(40), ay, x(100), ay, "ax");
      [40, 60, 80, 100].forEach(function (v) {
        o += Ln(x(v), ay, x(v), ay + 5, "ax") + T(x(v), ay + 17, v + "%", "", "middle");
      });
      return {
        cam: flatCam(f, 1), overlay: o, exclude: f,
        hit: function (mx, my) {
          for (var i = 0; i < streams.length; i++) {
            var st = streams[i];
            if (Math.abs(my - st.y) < rowH / 2 && mx > f.x - 10) {
              var m = SEC[i];
              return { html: "<strong>" + m[0] + (m[1] ? " (" + m[1] + ")" : "") + "</strong>" + row("Prompt v1", m[2].toFixed(1) + "%", "#e46e2b") + row("v2: value + unit", m[3].toFixed(1) + "%", "#1c9ad6") };
            }
          }
          return null;
        },
        update: function (t) {
          if (reduceMotion) return;
          streams.forEach(function (st) {
            for (var j = 0; j < st.n; j++) {
              var u = (j / st.n + t * 0.35) % 1, p = markToP[st.first + j];
              P.tx[p] = lerp(st.x1, st.x2, u); P.ty[p] = st.y;
              P.ta[p] = 0.6 * Math.sin(Math.PI * u);
            }
          });
        }
      };
    }
  };

  /* Ambient: everything becomes a slow field of dust */
  SC.ambient = { ambient: true, continuous: true, frame: null };
  SC.ambient.layout = function (g) {
    return {
      overlay: "", cam: { px: W / 2, py: H / 2, pz: 0, yaw: 0, pitch: 0, dist: 1800, add: 0 },
      update: function (t) {
        if (reduceMotion || g.mobile) return;
        for (var j = 0; j < dustN; j++) {
          var i = dustList[j], ph = dustPh[i];
          P.tx[i] = dustBX[i] + Math.sin(t * 0.09 + ph) * 16;
          P.ty[i] = dustBY[i] + Math.cos(t * 0.07 + ph * 1.3) * 11;
        }
      }
    };
  };

  /* Portrait: the same points, colored from the photo */
  var photo = { ready: false, failed: false, data: null, w: 0, h: 0 };
  function loadPhoto() {
    var img = new Image();
    img.onload = function () {
      try {
        var cols = 78, rows = 104;
        var cv = document.createElement("canvas");
        cv.width = cols; cv.height = rows;
        var ctx = cv.getContext("2d");
        ctx.drawImage(img, 0, 0, cols, rows);
        photo.data = ctx.getImageData(0, 0, cols, rows).data;
        photo.w = cols; photo.h = rows; photo.ready = true;
        if (curName === "portrait") applyScene(false, true);
      } catch (e) { photo.failed = true; }
    };
    img.onerror = function () { photo.failed = true; };
    img.src = "assets/profile.jpg";
  }
  var pointer = { x: -9999, y: -9999, t: 0 };
  SC.portrait = {
    continuous: true,
    frame: { wide: true, label: "Portrait", title: "Swaminathan Sankaran, in 8,112 of the points", note: "The same field of points, colored from a photo." },
    layout: function (g) {
      if (!photo.ready) return SC.ambient.layout(g);
      var f = g.figOpen;
      var hgt = Math.min(f.h * 1.02, (g.mobile ? f.w * 1.05 : f.w * 1.1) * 4 / 3);
      var wid = hgt * 3 / 4, x0 = f.x + (f.w - wid) / 2, y0 = f.y + (f.h - hgt) / 2 - (g.mobile ? 0 : 10);
      var st = wid / photo.w, first = MK.n;
      for (var q = 0; q < photo.w * photo.h; q++) {
        var cI = q % photo.w, rI = Math.floor(q / photo.w), o4 = q * 4;
        var u = (cI + 0.5) / photo.w, v = (rI + 0.5) / photo.h;
        var ex = (u - 0.5) / 0.5, ey = (v - 0.47) / 0.56, rr = Math.sqrt(ex * ex + ey * ey);
        var mask = clamp((1.02 - rr) / 0.3, 0, 1);
        var col = [photo.data[o4] / 255, photo.data[o4 + 1] / 255, photo.data[o4 + 2] / 255];
        mPush(x0 + (cI + 0.5) * st, y0 + (rI + 0.5) * st, 0, col, 0.06 + 0.92 * mask, st * 0.9, 0, (rI / photo.h) * 600 + (cI % 5) * 15, G("photo"), q);
      }
      var count = MK.n - first;
      return {
        cam: flatCam(f, 1), overlay: "", exclude: { x: x0, y: y0, w: wid, h: hgt },
        update: function (t, now) {
          if (reduceMotion || !finePointer) return;
          var near = now - pointer.t < 1600, R = 70, R2 = R * R;
          for (var k = 0; k < count; k++) {
            var m = first + k, p = markToP[m], bx = MK.x[m], by = MK.y[m];
            if (near) {
              var dx = bx - pointer.x, dy = by - pointer.y, d2 = dx * dx + dy * dy;
              if (d2 < R2) {
                var d = Math.sqrt(d2) || 1, push = (1 - d / R) * (1 - d / R) * 30;
                P.tx[p] = bx + dx / d * push; P.ty[p] = by + dy / d * push;
                continue;
              }
            }
            P.tx[p] = bx; P.ty[p] = by;
          }
        }
      };
    }
  };

  /* ------------------------------------------------------------------
     Running the field
     ------------------------------------------------------------------ */

  var running = false, lastT = 0;
  function frame(now) {
    var dt = Math.min((now - lastT) / 1000, 1 / 30);
    lastT = now;
    var t = now / 1000;
    if (lay.update) lay.update(t, now);
    if (!dragging && user.vyaw) {
      user.yaw += user.vyaw * dt;
      user.vyaw *= Math.exp(-dt * 3);
      if (Math.abs(user.vyaw) < 0.001) user.vyaw = 0;
    }
    var moving = physics(dt, now);
    var camMoving = camStep(dt);
    renderer.draw();
    updatePins();
    var cont = cur && cur.continuous && !reduceMotion && !(lay && lay.done) && !(cur.ambient && geomMobile());
    if (moving || camMoving || cont || dragging || user.vyaw || (lay && lay.update && !lay.done && cur === SC.cisofix)) {
      window.requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }
  function kick() {
    if (running || !renderer) return;
    running = true;
    lastT = performance.now();
    window.requestAnimationFrame(frame);
  }
  function geomMobile() { return window.innerWidth < 900; }

  function applyScene(isResize, keepStart) {
    if (!cur || !renderer) return;
    var g = geom(cur.frame);
    var now = performance.now();
    mReset();
    var res = cur.layout(g) || {};
    lay = res;
    if (!keepStart) sceneStart = now;
    if (res.start != null) res.start = keepStart ? now - 1e5 : now;
    assign(now, isResize || reduceMotion, res.exclude || null);
    if (res.cam) CAM_KEYS.forEach(function (k) { if (res.cam[k] != null) camT[k] = res.cam[k]; });
    if (cur !== SC.terrain && cur !== SC.finale) { user.yaw = 0; user.pitch = 0; user.vyaw = 0; }
    if (reduceMotion) {
      if (res.update) res.update(now / 1000, now + 1e7);
      snapAll();
    }
    if (!(cur === SC.cisofix)) showOverlay(res.overlay || "", isResize || reduceMotion ? 0 : 430);
    setFrame(cur.frame, g, isResize);
    if (!isResize || res.pins) setPins(res.pins || []);
    document.body.classList.toggle("is-ambient", !!cur.ambient || (cur === SC.portrait && !photo.ready));
    canvas.classList.toggle("is-grab", !!cur.drag && finePointer);
    hideTip(); setHover("");
    kick();
  }
  function go(name) {
    if (!SC[name] || name === curName) return;
    curName = name;
    cur = SC[name];
    applyScene(false);
  }

  function resize() {
    if (!renderer) return;
    var r = canvas.getBoundingClientRect();
    var nw = Math.round(r.width), nh = Math.round(r.height);
    var nd = Math.min(window.devicePixelRatio || 1, 2);
    if (nw === W && nh === H && nd === DPR) return;
    W = nw; H = nh; DPR = nd;
    renderer.resize();
    opCache = {};
    if (cur) applyScene(true, true);
    else kick();
  }

  /* Which scene: whichever [data-scene] block crosses the reading line */
  var sceneEls = [];
  function pickScene() {
    var vh = window.innerHeight, line;
    if (geomMobile()) {
      var fh = H || vh * 0.56;
      line = fh + (vh - fh) * 0.42;
    } else line = vh * 0.5;
    for (var i = 0; i < sceneEls.length; i++) {
      var r = sceneEls[i].getBoundingClientRect();
      if (r.top <= line && r.bottom > line) { go(sceneEls[i].getAttribute("data-scene")); return; }
    }
  }

  /* Pointer: hover tooltips, dragging the terrain, pushing the portrait */
  var dragging = false, dragX = 0, dragY = 0, lastDX = 0, lastMoveT = 0;
  function overContent(target) {
    return target && target.closest && target.closest(".card, .block-inner, .split-inner, .hero-inner, .bar, .menu, .colophon, .tip");
  }
  function hover(mx, my, target) {
    if (!lay || !lay.hit || overContent(target)) { hideTip(); setHover(""); return; }
    if (geomMobile() && my > H) { hideTip(); setHover(""); return; }
    var r = lay.hit(mx, my);
    if (!r) { hideTip(); setHover(""); return; }
    showTip(r.html, mx, my);
    setHover(r.draw || "");
  }
  function initPointer() {
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      pointer.x = e.clientX; pointer.y = e.clientY; pointer.t = performance.now();
      if (cur === SC.portrait) kick();
      if (dragging) {
        var dx = e.clientX - dragX, dy = e.clientY - dragY;
        dragX = e.clientX; dragY = e.clientY;
        user.yaw += dx * 0.006;
        user.pitch = clamp(user.pitch + dy * 0.004, -0.5, 0.7);
        lastDX = dx; lastMoveT = performance.now();
        kick();
        return;
      }
      hover(e.clientX, e.clientY, e.target);
    }, { passive: true });
    window.addEventListener("scroll", function () { hideTip(); setHover(""); }, { passive: true });
    canvas.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || !cur || !cur.drag) return;
      dragging = true; dragX = e.clientX; dragY = e.clientY; user.vyaw = 0;
      canvas.classList.add("is-grabbing");
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      hideTip();
      kick();
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      canvas.classList.remove("is-grabbing");
      if (performance.now() - lastMoveT < 80) user.vyaw = lastDX * 0.006 * 40;
      try { canvas.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      kick();
    }
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    // Touch: tap the figure for its numbers
    canvas.addEventListener("click", function (e) {
      if (finePointer || !lay || !lay.hit) return;
      var r = lay.hit(e.clientX, e.clientY);
      if (r) { showTip(r.html, e.clientX, e.clientY); setHover(r.draw || ""); }
      else { hideTip(); setHover(""); }
    });
  }

  function initField() {
    if (!canvas || !D || !DEM.length) { doc.classList.add("no-field"); return; }
    try { renderer = makeGL(canvas); } catch (e) { renderer = null; }
    if (!renderer) renderer = make2D(canvas);
    if (!renderer) { doc.classList.add("no-field"); return; }
    doc.classList.add("has-field");
    canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); }, false);
    canvas.addEventListener("webglcontextrestored", function () {
      try { renderer = makeGL(canvas); renderer.resize(); kick(); } catch (e) { /* stays blank */ }
    }, false);
    var r = canvas.getBoundingClientRect();
    W = Math.round(r.width); H = Math.round(r.height); DPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.resize();
    // Start flat at the terrain's base so the year can rise into place
    var g = geom(), box = g.hero, TW = box.w, TD = TW * (g.mobile ? 0.56 : 0.42);
    for (var i = 0; i < N; i++) {
      var d = (i / 24) | 0, hr = i % 24;
      P.x[i] = box.cx + (d / 364 - 0.5) * TW;
      P.y[i] = box.cy + Math.min(box.h * 0.36, TW * 0.4) * 0.45;
      P.z[i] = (hr / 23 - 0.5) * TD;
      P.a[i] = 0; P.s[i] = 1.6;
      var c = ramp(0.2);
      P.r[i] = c[0]; P.g[i] = c[1]; P.b[i] = c[2];
      pGroup[i] = G("hours"); pKey[i] = i;
    }
    cam.px = camT.px = box.cx; cam.py = camT.py = box.cy;
    cam.yaw = camT.yaw = -0.62; cam.pitch = camT.pitch = 0.5; cam.dist = camT.dist = Math.max(W, H) * 1.25;
    sceneEls = $$("[data-scene]");
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { ticking = false; pickScene(); });
    }, { passive: true });
    var rt = 0;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { resize(); pickScene(); }, 120); });
    initPointer();
    $$("[data-replay]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (curName !== b.getAttribute("data-replay")) return;
        if (lay && lay.replay) lay.replay();
      });
    });
    pickScene();
    if (!cur) go("terrain");
    if (document.fonts && document.fonts.load) {
      document.fonts.load('800 100px "Archivo"').then(function () {
        fontsReady = true;
        if (curName && curName.charAt(0) === "n" && /^n\d$/.test(curName)) applyScene(false, true);
      }).catch(function () { /* fallback font */ });
    }
    loadPhoto();
  }

  /* ------------------------------------------------------------------
     Page furniture: bar, menu, tables, skills, copy, reveal
     ------------------------------------------------------------------ */

  function initBar() {
    var bar = $("[data-bar]"), prog = $(".bar-progress span"), ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.classList.toggle("is-scrolled", y > 10);
      if (prog) prog.style.transform = "scaleX(" + (h > 0 ? clamp(y / h, 0, 1) : 0) + ")";
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
    }, { rootMargin: "-45% 0px -54% 0px" });
    Object.keys(byId).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }

  function initMenu() {
    var dlg = $("#menu");
    if (!dlg) return;
    $$("[data-open-menu]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
      });
    });
    $$("[data-close-menu]", dlg).forEach(function (b) {
      b.addEventListener("click", function () {
        if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open");
      });
    });
  }

  function table(head, rows) {
    return "<table><thead><tr>" + head.map(function (h) { return '<th scope="col">' + h + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) { return "<tr>" + r.map(function (c, i) { return i ? "<td>" + c + "</td>" : '<th scope="row">' + c + "</th>"; }).join("") + "</tr>"; }).join("") +
      "</tbody></table>";
  }
  function initTables() {
    var put = function (name, html) { var el = $('[data-table="' + name + '"]'); if (el) el.innerHTML = html; };
    put("operators", table(["Operator", "Skill", "Corrected", "Error", "Naive", "TWh"], OPS.map(function (o) {
      return [o.name + " (" + o.code + ")", signed(o.skill, 2), o.hot ? signed(o.skillC, 2) : "same", o.mape.toFixed(2) + "%", o.naive.toFixed(2) + "%", o.twh.toFixed(1)];
    })));
    if (D) {
      var d = D.cisoDay;
      put("ciso", table(["Hour ending", "Published", "Forecast", "Corrected"], d.published.map(function (v, i) {
        return [String(i + 1), v.toFixed(2), d.forecast[i].toFixed(2), d.corrected[i].toFixed(2)];
      })));
      var sw = D.dailySWPP, rowsS = [];
      for (var m = 0; m < 12; m++) {
        var a = MONTH_START[m], b = m < 11 ? MONTH_START[m + 1] : 365;
        var mp = median(sw.published.slice(a, b)), mc = median(sw.corrected.slice(a, b));
        rowsS.push([MONTHS[m], mp == null ? "–" : mp.toFixed(2) + "%", mc == null ? "–" : mc.toFixed(2) + "%"]);
      }
      put("swpp", "<p class=\"sr-only\">Median daily error by month.</p>" + table(["Month", "Published, median day", "SPP’s own forecast"], rowsS));
    }
    put("national", table(["Year", "As published", "All corrections"], YEARS.map(function (y, i) {
      return [String(y), NAT_PUB[i].toFixed(2) + "%", NAT_COR[i].toFixed(2) + "%"];
    })));
    put("ct", table(["Design", "Peak validation AUC"], CT.map(function (c) { return [c[0], c[1].toFixed(3)]; })));
    put("sec", table(["Model", "Prompt v1", "v2: value + unit"], SEC.map(function (s) {
      return [s[0] + (s[1] ? " (" + s[1] + ")" : ""), s[2].toFixed(1) + "%", s[3].toFixed(1) + "%"];
    })));
  }

  function initSkills() {
    var body = $("[data-skills-body]"), tableEl = $("[data-skills]");
    if (!body) return;
    var html = "";
    MATRIX.forEach(function (grp) {
      html += '<tr class="group"><th scope="rowgroup" colspan="7">' + grp[0] + "</th></tr>";
      grp[1].forEach(function (sk) {
        html += '<tr><th scope="row">' + sk[0] + "</th>" + sk[1].map(function (v, i) {
          return '<td data-col="' + i + '"><span class="led' + (v ? " is-on" : "") + '" role="img" aria-label="' + (v ? "Used in " : "Not used in ") + PROJECTS[i] + '"></span></td>';
        }).join("") + "</tr>";
      });
    });
    body.innerHTML = html;
    function clear() {
      $$(".is-hot", tableEl).forEach(function (n) { n.classList.remove("is-hot"); });
    }
    tableEl.addEventListener("mouseover", function (e) {
      clear();
      var cell = e.target.closest("td, th");
      if (!cell) return;
      var col = cell.getAttribute("data-col");
      var tr = cell.closest("tr");
      if (col != null) $$('[data-col="' + col + '"]', tableEl).forEach(function (n) { n.classList.add("is-hot"); });
      if (tr && !tr.classList.contains("group") && tr.parentNode === body) tr.classList.add("is-hot");
    });
    tableEl.addEventListener("mouseleave", clear);
  }

  function initCopy() {
    $$("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.getAttribute("data-copy"), hint = $("[data-copy-hint]", btn);
        function done() {
          if (hint) { hint.textContent = "Copied"; setTimeout(function () { hint.textContent = "Copy"; }, 1800); }
          toast("Email copied");
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { window.location.href = "mailto:" + text; });
        } else {
          window.location.href = "mailto:" + text;
        }
      });
    });
  }

  function initReveal() {
    var els = $$(".card, .block-inner, .split-inner");
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    els.forEach(function (e) { e.classList.add("reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  function boot() {
    var y = $("[data-year]");
    if (y) y.textContent = String(new Date().getFullYear());
    initBar();
    initMenu();
    initTables();
    initSkills();
    initCopy();
    initReveal();
    initField();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
