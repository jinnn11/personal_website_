(() => {
  const themes = [
    {
      name: "Soft Cosmos",
      bg: "#1c1926", surface: "#252233", accent: [196,181,253],
      text: "#f0ecf5", muted: "#a49bb8", accentHex: "#c4b5fd", accentDark: "#a78bfa",
      glow: [
        "radial-gradient(ellipse 100% 60% at 50% -10%, rgba(196,181,253,0.09) 0%, transparent 60%)",
        "radial-gradient(ellipse 60% 45% at 75% 15%, rgba(244,163,220,0.05) 0%, transparent 55%)",
        "radial-gradient(ellipse 55% 40% at 20% 40%, rgba(165,148,249,0.04) 0%, transparent 50%)"
      ]
    },
    {
      name: "Dusk Aurora",
      bg: "#1a1a2e", surface: "#222240", accent: [255,107,107],
      text: "#f0eef5", muted: "#9a95ad", accentHex: "#ff6b6b", accentDark: "#e85d5d",
      glow: [
        "radial-gradient(ellipse 100% 60% at 50% -10%, rgba(255,107,107,0.09) 0%, transparent 60%)",
        "radial-gradient(ellipse 60% 45% at 75% 10%, rgba(167,107,255,0.05) 0%, transparent 55%)",
        "radial-gradient(ellipse 55% 40% at 25% 35%, rgba(255,169,107,0.04) 0%, transparent 50%)"
      ]
    },
    {
      name: "Midnight Garden",
      bg: "#141e27", surface: "#1b2a35", accent: [45,212,191],
      text: "#e6f0ed", muted: "#8aa8a0", accentHex: "#2dd4bf", accentDark: "#14b8a6",
      glow: [
        "radial-gradient(ellipse 100% 60% at 50% -10%, rgba(45,212,191,0.09) 0%, transparent 60%)",
        "radial-gradient(ellipse 60% 45% at 80% 15%, rgba(34,197,158,0.05) 0%, transparent 55%)",
        "radial-gradient(ellipse 55% 40% at 15% 45%, rgba(56,189,248,0.035) 0%, transparent 50%)"
      ]
    },
    {
      name: "Steel Sunrise",
      bg: "#1b1b22", surface: "#242430", accent: [251,146,60],
      text: "#f0ede8", muted: "#a49e94", accentHex: "#fb923c", accentDark: "#f97316",
      glow: [
        "radial-gradient(ellipse 110% 65% at 50% -10%, rgba(251,146,60,0.10) 0%, transparent 65%)",
        "radial-gradient(ellipse 70% 45% at 65% 25%, rgba(244,63,94,0.05) 0%, transparent 55%)",
        "linear-gradient(160deg, rgba(251,146,60,0.03) 0%, transparent 45%, rgba(244,63,94,0.02) 100%)"
      ]
    },
    {
      name: "Ocean Depths",
      bg: "#0f1a24", surface: "#162231", accent: [56,189,248],
      text: "#e6eff5", muted: "#8aa4b8", accentHex: "#38bdf8", accentDark: "#0ea5e9",
      glow: [
        "radial-gradient(ellipse 100% 60% at 50% -10%, rgba(56,189,248,0.10) 0%, transparent 60%)",
        "radial-gradient(ellipse 60% 45% at 75% 20%, rgba(14,165,233,0.06) 0%, transparent 55%)",
        "radial-gradient(ellipse 50% 40% at 20% 50%, rgba(34,211,238,0.035) 0%, transparent 50%)"
      ]
    },
    {
      name: "Velvet Night",
      bg: "#1a1418", surface: "#251e22", accent: [240,166,202],
      text: "#f2ecef", muted: "#b0a0a8", accentHex: "#f0a6ca", accentDark: "#e88ab8",
      glow: [
        "radial-gradient(ellipse 100% 60% at 50% -10%, rgba(240,166,202,0.09) 0%, transparent 60%)",
        "radial-gradient(ellipse 60% 45% at 80% 15%, rgba(232,138,184,0.05) 0%, transparent 55%)",
        "radial-gradient(ellipse 55% 40% at 15% 40%, rgba(212,160,180,0.035) 0%, transparent 50%)"
      ]
    },
    {
      name: "Slate & Gold",
      bg: "#101114", surface: "#181a1f", accent: [234,179,8],
      text: "#ededed", muted: "#8e8e96", accentHex: "#eab308", accentDark: "#ca8a04",
      glow: [
        "radial-gradient(ellipse 100% 60% at 50% -10%, rgba(234,179,8,0.08) 0%, transparent 60%)",
        "radial-gradient(ellipse 60% 45% at 70% 20%, rgba(234,179,8,0.04) 0%, transparent 55%)"
      ]
    },
    {
      name: "Frosted Mint",
      bg: "#161d1e", surface: "#1e2a2b", accent: [94,234,212],
      text: "#e8f4f0", muted: "#8fb8ad", accentHex: "#5eead4", accentDark: "#2dd4bf",
      glow: [
        "radial-gradient(ellipse 100% 55% at 50% -10%, rgba(94,234,212,0.10) 0%, transparent 55%)",
        "radial-gradient(ellipse 55% 40% at 30% 30%, rgba(52,211,153,0.05) 0%, transparent 50%)",
        "radial-gradient(ellipse 60% 40% at 80% 50%, rgba(167,243,208,0.03) 0%, transparent 50%)"
      ]
    },
    {
      name: "Neon Indigo",
      bg: "#12111e", surface: "#1a1930", accent: [129,140,248],
      text: "#edeef5", muted: "#9496b8", accentHex: "#818cf8", accentDark: "#6366f1",
      glow: [
        "radial-gradient(ellipse 90% 55% at 50% -10%, rgba(129,140,248,0.12) 0%, transparent 55%)",
        "radial-gradient(ellipse 50% 40% at 80% 20%, rgba(167,139,250,0.06) 0%, transparent 50%)",
        "radial-gradient(ellipse 45% 35% at 15% 35%, rgba(99,102,241,0.04) 0%, transparent 50%)"
      ]
    },
    {
      name: "Ember Smoke",
      bg: "#1a1514", surface: "#261f1d", accent: [248,113,113],
      text: "#f2ece8", muted: "#b09a92", accentHex: "#f87171", accentDark: "#ef4444",
      glow: [
        "radial-gradient(ellipse 100% 55% at 50% -10%, rgba(248,113,113,0.10) 0%, transparent 55%)",
        "radial-gradient(ellipse 55% 40% at 70% 20%, rgba(251,146,60,0.05) 0%, transparent 50%)",
        "radial-gradient(ellipse 50% 35% at 25% 45%, rgba(220,38,38,0.03) 0%, transparent 50%)"
      ]
    },
    {
      name: "Lunar Silver",
      bg: "#171719", surface: "#222225", accent: [209,213,219],
      text: "#f3f4f6", muted: "#9ca3af", accentHex: "#d1d5db", accentDark: "#9ca3af",
      glow: [
        "radial-gradient(ellipse 110% 60% at 50% -10%, rgba(209,213,219,0.07) 0%, transparent 60%)",
        "radial-gradient(ellipse 55% 40% at 75% 25%, rgba(156,163,175,0.04) 0%, transparent 50%)"
      ]
    },
    {
      name: "Electric Lime",
      bg: "#141816", surface: "#1d221e", accent: [163,230,53],
      text: "#eef2e8", muted: "#98a88e", accentHex: "#a3e635", accentDark: "#84cc16",
      glow: [
        "radial-gradient(ellipse 100% 55% at 50% -10%, rgba(163,230,53,0.09) 0%, transparent 55%)",
        "radial-gradient(ellipse 55% 40% at 70% 20%, rgba(132,204,22,0.05) 0%, transparent 50%)",
        "radial-gradient(ellipse 50% 35% at 25% 40%, rgba(190,242,100,0.03) 0%, transparent 50%)"
      ]
    },
    {
      name: "Royal Amethyst",
      bg: "#18141e", surface: "#231d2c", accent: [192,132,252],
      text: "#f0ecf5", muted: "#a898b8", accentHex: "#c084fc", accentDark: "#a855f7",
      glow: [
        "radial-gradient(ellipse 95% 55% at 50% -10%, rgba(192,132,252,0.11) 0%, transparent 55%)",
        "radial-gradient(ellipse 55% 40% at 80% 20%, rgba(168,85,247,0.06) 0%, transparent 50%)",
        "radial-gradient(ellipse 50% 35% at 20% 35%, rgba(232,121,249,0.04) 0%, transparent 50%)"
      ]
    },
    {
      name: "Carbon Copper",
      bg: "#161312", surface: "#211c1a", accent: [232,147,90],
      text: "#ede8e3", muted: "#9c9088", accentHex: "#e8935a", accentDark: "#d97a3e",
      glow: [
        "radial-gradient(ellipse 100% 55% at 50% -10%, rgba(232,147,90,0.10) 0%, transparent 55%)",
        "radial-gradient(ellipse 55% 40% at 75% 20%, rgba(217,122,62,0.05) 0%, transparent 50%)",
        "radial-gradient(ellipse 50% 35% at 20% 45%, rgba(180,120,80,0.03) 0%, transparent 50%)"
      ]
    },
    {
      name: "Arctic Blue",
      bg: "#131820", surface: "#1a2030", accent: [125,211,252],
      text: "#e8edf5", muted: "#8294ab", accentHex: "#7dd3fc", accentDark: "#38bdf8",
      glow: [
        "radial-gradient(ellipse 100% 60% at 50% -10%, rgba(125,211,252,0.10) 0%, transparent 60%)",
        "radial-gradient(ellipse 55% 40% at 75% 20%, rgba(56,189,248,0.05) 0%, transparent 55%)",
        "radial-gradient(ellipse 50% 35% at 20% 40%, rgba(186,230,253,0.03) 0%, transparent 50%)"
      ]
    },
    {
      name: "Warm Terracotta",
      bg: "#1a1615", surface: "#262020", accent: [225,138,118],
      text: "#f2ece8", muted: "#b09890", accentHex: "#e18a76", accentDark: "#c87260",
      glow: [
        "radial-gradient(ellipse 100% 55% at 50% -10%, rgba(225,138,118,0.10) 0%, transparent 55%)",
        "radial-gradient(ellipse 55% 40% at 70% 25%, rgba(200,114,96,0.05) 0%, transparent 50%)",
        "radial-gradient(ellipse 50% 35% at 25% 40%, rgba(180,100,80,0.03) 0%, transparent 50%)"
      ]
    }
  ];

  // Build the switcher UI
  const panel = document.getElementById("theme-switcher");
  panel.innerHTML = `
    <style>
      #theme-switcher {
        position: fixed;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        background: rgba(20,20,30,0.92);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        padding: 0.75rem 1rem;
        max-width: 95vw;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      }
      #theme-switcher .ts-label {
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: rgba(255,255,255,0.4);
        margin-bottom: 0.5rem;
        text-align: center;
      }
      #theme-switcher .ts-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        justify-content: center;
      }
      #theme-switcher .ts-btn {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.35rem 0.65rem;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 8px;
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.75);
        font-size: 0.7rem;
        font-family: inherit;
        cursor: pointer;
        transition: all 150ms ease;
        white-space: nowrap;
      }
      #theme-switcher .ts-btn:hover {
        background: rgba(255,255,255,0.1);
        color: #fff;
        border-color: rgba(255,255,255,0.2);
        transform: translateY(-1px);
      }
      #theme-switcher .ts-btn.active {
        border-color: rgba(255,255,255,0.35);
        background: rgba(255,255,255,0.12);
        color: #fff;
      }
      #theme-switcher .ts-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      #theme-switcher .ts-close {
        position: absolute;
        top: 0.4rem;
        right: 0.6rem;
        background: none;
        border: none;
        color: rgba(255,255,255,0.3);
        font-size: 1rem;
        cursor: pointer;
        padding: 0.2rem;
        line-height: 1;
      }
      #theme-switcher .ts-close:hover { color: #fff; }
    </style>
    <button class="ts-close" title="Close">&times;</button>
    <div class="ts-label">Theme Switcher (temporary)</div>
    <div class="ts-grid"></div>
  `;

  const grid = panel.querySelector(".ts-grid");
  const closeBtn = panel.querySelector(".ts-close");

  closeBtn.addEventListener("click", () => { panel.style.display = "none"; });

  themes.forEach((t, i) => {
    const btn = document.createElement("button");
    btn.className = "ts-btn";
    btn.innerHTML = `<span class="ts-dot" style="background:${t.accentHex}"></span>${t.name}`;
    btn.addEventListener("click", () => applyTheme(t, btn));
    grid.appendChild(btn);
  });

  function applyTheme(t, btn) {
    const r = document.documentElement.style;
    const [ar, ag, ab] = t.accent;

    // CSS variables
    r.setProperty("--bg", t.bg);
    r.setProperty("--surface", t.surface);
    r.setProperty("--line", `rgba(${ar},${ag},${ab},0.10)`);
    r.setProperty("--line-strong", `rgba(${ar},${ag},${ab},0.18)`);
    r.setProperty("--text", t.text);
    r.setProperty("--muted", t.muted);
    r.setProperty("--accent", t.accentHex);
    r.setProperty("--accent-dark", t.accentDark);
    r.setProperty("--accent-soft", `rgba(${ar},${ag},${ab},0.10)`);

    // Body background
    document.body.style.background = t.bg;
    document.body.style.backgroundImage = t.glow.join(", ");

    // Header backdrop
    const hdr = document.querySelector(".site-header");
    if (hdr) {
      const [hr, hg, hb] = t.bg.match(/\w{2}/g).map(x => parseInt(x, 16));
      hdr.style.background = `rgba(${hr},${hg},${hb},0.28)`;
    }

    // Update hardcoded border colors via CSS variable overrides
    r.setProperty("--_accent-08", `rgba(${ar},${ag},${ab},0.08)`);
    r.setProperty("--_accent-15", `rgba(${ar},${ag},${ab},0.15)`);

    // Active state
    grid.querySelectorAll(".ts-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  }
})();
