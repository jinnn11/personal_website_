(() => {
  const ENABLE_THEME_SWITCHER = true;
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
    },
    {
      name: "new - Graphite Bloom",
      bg: "#121317", surface: "#1a1d24", accent: [244,114,182],
      text: "#f4f2f7", muted: "#a8a2b3", accentHex: "#f472b6", accentDark: "#ec4899",
      glow: [
        "radial-gradient(ellipse 105% 62% at 50% -12%, rgba(244,114,182,0.11) 0%, transparent 58%)",
        "radial-gradient(ellipse 58% 42% at 78% 18%, rgba(168,85,247,0.06) 0%, transparent 52%)",
        "radial-gradient(ellipse 48% 34% at 18% 42%, rgba(244,114,182,0.035) 0%, transparent 48%)"
      ]
    },
    {
      name: "new - Ink Teal Fade",
      bg: "#0f1719", surface: "#162125", accent: [45,212,191],
      text: "#ebf5f3", muted: "#8fa9a4", accentHex: "#2dd4bf", accentDark: "#14b8a6",
      glow: [
        "radial-gradient(ellipse 108% 60% at 50% -10%, rgba(45,212,191,0.11) 0%, transparent 58%)",
        "radial-gradient(ellipse 55% 40% at 75% 18%, rgba(56,189,248,0.05) 0%, transparent 50%)",
        "linear-gradient(145deg, rgba(45,212,191,0.02) 0%, transparent 38%, rgba(20,184,166,0.03) 100%)"
      ]
    },
    {
      name: "new - Mocha Ember",
      bg: "#161210", surface: "#211b18", accent: [251,146,60],
      text: "#f4eee7", muted: "#b2a094", accentHex: "#fb923c", accentDark: "#ea580c",
      glow: [
        "radial-gradient(ellipse 110% 62% at 50% -8%, rgba(251,146,60,0.11) 0%, transparent 58%)",
        "radial-gradient(ellipse 52% 38% at 72% 24%, rgba(239,68,68,0.05) 0%, transparent 48%)",
        "radial-gradient(ellipse 46% 34% at 24% 42%, rgba(251,146,60,0.03) 0%, transparent 46%)"
      ]
    },
    {
      name: "new - Glacier Violet",
      bg: "#11151d", surface: "#19202b", accent: [167,139,250],
      text: "#eef2f8", muted: "#94a0b2", accentHex: "#a78bfa", accentDark: "#8b5cf6",
      glow: [
        "radial-gradient(ellipse 104% 58% at 50% -10%, rgba(167,139,250,0.12) 0%, transparent 56%)",
        "radial-gradient(ellipse 56% 40% at 80% 20%, rgba(96,165,250,0.06) 0%, transparent 50%)",
        "radial-gradient(ellipse 48% 34% at 20% 38%, rgba(196,181,253,0.04) 0%, transparent 48%)"
      ]
    },
    {
      name: "new - Forest Signal",
      bg: "#101612", surface: "#182019", accent: [132,204,22],
      text: "#eef3ea", muted: "#9ca890", accentHex: "#84cc16", accentDark: "#65a30d",
      glow: [
        "radial-gradient(ellipse 106% 56% at 50% -10%, rgba(132,204,22,0.10) 0%, transparent 55%)",
        "radial-gradient(ellipse 54% 38% at 74% 18%, rgba(34,197,94,0.05) 0%, transparent 48%)",
        "radial-gradient(ellipse 46% 34% at 18% 45%, rgba(163,230,53,0.03) 0%, transparent 46%)"
      ]
    },
    {
      name: "new - Rose Quartz Night",
      bg: "#181317", surface: "#221b20", accent: [244,171,185],
      text: "#f6eff2", muted: "#b4a0a8", accentHex: "#f4abb9", accentDark: "#e8798f",
      glow: [
        "radial-gradient(ellipse 108% 60% at 50% -12%, rgba(244,171,185,0.11) 0%, transparent 56%)",
        "radial-gradient(ellipse 54% 38% at 78% 20%, rgba(232,121,249,0.05) 0%, transparent 48%)",
        "radial-gradient(ellipse 48% 34% at 18% 40%, rgba(251,113,133,0.035) 0%, transparent 46%)"
      ]
    },
    {
      name: "new - Cobalt Current",
      bg: "#0f1520", surface: "#182033", accent: [96,165,250],
      text: "#eef3fb", muted: "#98a6bc", accentHex: "#60a5fa", accentDark: "#3b82f6",
      glow: [
        "radial-gradient(ellipse 106% 60% at 50% -12%, rgba(96,165,250,0.12) 0%, transparent 56%)",
        "radial-gradient(ellipse 55% 40% at 76% 18%, rgba(34,211,238,0.05) 0%, transparent 48%)",
        "linear-gradient(150deg, rgba(96,165,250,0.02) 0%, transparent 42%, rgba(59,130,246,0.03) 100%)"
      ]
    },
    {
      name: "new 2 - Amber Alloy",
      bg: "#141210", surface: "#1f1b17", accent: [245,158,11],
      text: "#f6f1ea", muted: "#b4a596", accentHex: "#f59e0b", accentDark: "#d97706",
      glow: [
        "radial-gradient(ellipse 108% 60% at 50% -12%, rgba(245,158,11,0.12) 0%, transparent 56%)",
        "radial-gradient(ellipse 54% 38% at 76% 20%, rgba(251,191,36,0.05) 0%, transparent 48%)",
        "radial-gradient(ellipse 48% 34% at 22% 42%, rgba(217,119,6,0.03) 0%, transparent 45%)"
      ]
    },
    {
      name: "new 2 - Orchid Haze",
      bg: "#16121a", surface: "#211b27", accent: [217,70,239],
      text: "#f5eef8", muted: "#afa0b7", accentHex: "#d946ef", accentDark: "#c026d3",
      glow: [
        "radial-gradient(ellipse 106% 58% at 50% -10%, rgba(217,70,239,0.12) 0%, transparent 55%)",
        "radial-gradient(ellipse 56% 40% at 80% 22%, rgba(168,85,247,0.06) 0%, transparent 48%)",
        "linear-gradient(145deg, rgba(217,70,239,0.02) 0%, transparent 38%, rgba(192,38,211,0.03) 100%)"
      ]
    },
    {
      name: "new 2 - Deep Sea Glass",
      bg: "#0d1718", surface: "#152123", accent: [34,197,94],
      text: "#ecf5f1", muted: "#93a9a0", accentHex: "#22c55e", accentDark: "#16a34a",
      glow: [
        "radial-gradient(ellipse 108% 58% at 50% -12%, rgba(34,197,94,0.11) 0%, transparent 55%)",
        "radial-gradient(ellipse 54% 38% at 74% 18%, rgba(20,184,166,0.05) 0%, transparent 48%)",
        "radial-gradient(ellipse 48% 34% at 18% 42%, rgba(74,222,128,0.03) 0%, transparent 46%)"
      ]
    },
    {
      name: "new 2 - Merlot Fade",
      bg: "#171012", surface: "#24191d", accent: [244,63,94],
      text: "#f7edf0", muted: "#b6a0a8", accentHex: "#f43f5e", accentDark: "#e11d48",
      glow: [
        "radial-gradient(ellipse 108% 60% at 50% -12%, rgba(244,63,94,0.11) 0%, transparent 56%)",
        "radial-gradient(ellipse 54% 38% at 76% 20%, rgba(251,146,60,0.05) 0%, transparent 48%)",
        "radial-gradient(ellipse 48% 34% at 20% 40%, rgba(190,24,93,0.03) 0%, transparent 46%)"
      ]
    },
    {
      name: "new 2 - Ice Indigo",
      bg: "#10141c", surface: "#171d2a", accent: [129,140,248],
      text: "#eef1f8", muted: "#99a3b8", accentHex: "#818cf8", accentDark: "#6366f1",
      glow: [
        "radial-gradient(ellipse 110% 60% at 50% -10%, rgba(129,140,248,0.12) 0%, transparent 56%)",
        "radial-gradient(ellipse 56% 40% at 78% 18%, rgba(96,165,250,0.05) 0%, transparent 48%)",
        "radial-gradient(ellipse 48% 34% at 18% 42%, rgba(165,180,252,0.035) 0%, transparent 46%)"
      ]
    },
    {
      name: "new 2 - Copper Plum",
      bg: "#171214", surface: "#241b1f", accent: [251,146,60],
      text: "#f6efeb", muted: "#b3a19b", accentHex: "#fb923c", accentDark: "#ea580c",
      glow: [
        "radial-gradient(ellipse 106% 58% at 50% -10%, rgba(251,146,60,0.11) 0%, transparent 55%)",
        "radial-gradient(ellipse 54% 38% at 78% 18%, rgba(192,132,252,0.05) 0%, transparent 48%)",
        "linear-gradient(145deg, rgba(251,146,60,0.02) 0%, transparent 40%, rgba(168,85,247,0.03) 100%)"
      ]
    },
    {
      name: "new 2 - Azure Mist",
      bg: "#0f161b", surface: "#162129", accent: [56,189,248],
      text: "#edf4f8", muted: "#96a9b5", accentHex: "#38bdf8", accentDark: "#0ea5e9",
      glow: [
        "radial-gradient(ellipse 108% 58% at 50% -12%, rgba(56,189,248,0.11) 0%, transparent 55%)",
        "radial-gradient(ellipse 56% 40% at 76% 18%, rgba(45,212,191,0.05) 0%, transparent 48%)",
        "radial-gradient(ellipse 48% 34% at 18% 42%, rgba(125,211,252,0.03) 0%, transparent 46%)"
      ]
    },
    {
      name: "new 2 - Neon Fig",
      bg: "#141118", surface: "#1d1823", accent: [232,121,249],
      text: "#f5eef8", muted: "#ada0b6", accentHex: "#e879f9", accentDark: "#d946ef",
      glow: [
        "radial-gradient(ellipse 108% 58% at 50% -10%, rgba(232,121,249,0.12) 0%, transparent 55%)",
        "radial-gradient(ellipse 54% 38% at 78% 18%, rgba(129,140,248,0.05) 0%, transparent 48%)",
        "radial-gradient(ellipse 48% 34% at 18% 42%, rgba(217,70,239,0.035) 0%, transparent 46%)"
      ]
    },
    {
      name: "new 2 - Olive Ember",
      bg: "#131512", surface: "#1b1f1a", accent: [163,230,53],
      text: "#f1f4ea", muted: "#a7ae96", accentHex: "#a3e635", accentDark: "#84cc16",
      glow: [
        "radial-gradient(ellipse 106% 58% at 50% -10%, rgba(163,230,53,0.10) 0%, transparent 55%)",
        "radial-gradient(ellipse 54% 38% at 76% 22%, rgba(251,146,60,0.04) 0%, transparent 46%)",
        "linear-gradient(150deg, rgba(163,230,53,0.02) 0%, transparent 42%, rgba(132,204,22,0.03) 100%)"
      ]
    },
    {
      name: "new 2 - Coral Ink",
      bg: "#171315", surface: "#221b1d", accent: [251,113,133],
      text: "#f7efef", muted: "#b6a4a6", accentHex: "#fb7185", accentDark: "#f43f5e",
      glow: [
        "radial-gradient(ellipse 108% 60% at 50% -12%, rgba(251,113,133,0.11) 0%, transparent 56%)",
        "radial-gradient(ellipse 54% 38% at 76% 18%, rgba(244,114,182,0.05) 0%, transparent 48%)",
        "radial-gradient(ellipse 48% 34% at 18% 42%, rgba(244,63,94,0.03) 0%, transparent 46%)"
      ]
    },
    {
      name: "new 3 - Slate Mist",
      bg: "#121416", surface: "#1a1d21", accent: [148,163,184],
      text: "#eef2f6", muted: "#98a5b5", accentHex: "#94a3b8", accentDark: "#64748b",
      glow: [
        "radial-gradient(ellipse 104% 58% at 50% -10%, rgba(148,163,184,0.075) 0%, transparent 56%)",
        "radial-gradient(ellipse 52% 36% at 74% 20%, rgba(96,165,250,0.025) 0%, transparent 46%)",
        "linear-gradient(145deg, rgba(148,163,184,0.018) 0%, transparent 42%, rgba(100,116,139,0.03) 100%)"
      ]
    },
    {
      name: "new 3 - Soft Sage",
      bg: "#121413", surface: "#1a1d1b", accent: [134,167,137],
      text: "#eef3ed", muted: "#9aa796", accentHex: "#86a789", accentDark: "#6b8c6f",
      glow: [
        "radial-gradient(ellipse 106% 58% at 50% -12%, rgba(134,167,137,0.075) 0%, transparent 56%)",
        "radial-gradient(ellipse 52% 36% at 78% 18%, rgba(163,177,138,0.024) 0%, transparent 46%)",
        "radial-gradient(ellipse 46% 32% at 20% 42%, rgba(110,140,112,0.03) 0%, transparent 45%)"
      ]
    },
    {
      name: "new 3 - Smoked Blue",
      bg: "#121416", surface: "#1a1d21", accent: [120,144,168],
      text: "#eef2f6", muted: "#98a4b2", accentHex: "#7890a8", accentDark: "#5f748a",
      glow: [
        "radial-gradient(ellipse 108% 58% at 50% -12%, rgba(120,144,168,0.075) 0%, transparent 56%)",
        "radial-gradient(ellipse 54% 38% at 76% 20%, rgba(125,211,252,0.022) 0%, transparent 46%)",
        "linear-gradient(150deg, rgba(120,144,168,0.018) 0%, transparent 42%, rgba(95,116,138,0.03) 100%)"
      ]
    },
    {
      name: "new 3 - Sandstone",
      bg: "#141312", surface: "#1c1a18", accent: [191,161,128],
      text: "#f3eee8", muted: "#ac9f92", accentHex: "#bfa180", accentDark: "#9f7f5d",
      glow: [
        "radial-gradient(ellipse 106% 58% at 50% -10%, rgba(191,161,128,0.075) 0%, transparent 56%)",
        "radial-gradient(ellipse 50% 36% at 74% 18%, rgba(251,191,36,0.022) 0%, transparent 44%)",
        "radial-gradient(ellipse 48% 34% at 22% 42%, rgba(159,127,93,0.03) 0%, transparent 45%)"
      ]
    },
    {
      name: "new 3 - Mauve Ash",
      bg: "#131316", surface: "#1b1a1f", accent: [165,148,180],
      text: "#f1edf4", muted: "#a79bb1", accentHex: "#a594b4", accentDark: "#83718f",
      glow: [
        "radial-gradient(ellipse 106% 58% at 50% -12%, rgba(165,148,180,0.075) 0%, transparent 56%)",
        "radial-gradient(ellipse 54% 38% at 76% 18%, rgba(192,132,252,0.022) 0%, transparent 46%)",
        "linear-gradient(145deg, rgba(165,148,180,0.018) 0%, transparent 40%, rgba(131,113,143,0.03) 100%)"
      ]
    },
    {
      name: "new 3 - Deep Olive",
      bg: "#131412", surface: "#1a1c18", accent: [140,146,108],
      text: "#f0f2ea", muted: "#a3a68f", accentHex: "#8c926c", accentDark: "#727853",
      glow: [
        "radial-gradient(ellipse 108% 58% at 50% -12%, rgba(140,146,108,0.072) 0%, transparent 56%)",
        "radial-gradient(ellipse 54% 36% at 76% 18%, rgba(163,230,53,0.018) 0%, transparent 44%)",
        "radial-gradient(ellipse 46% 32% at 20% 42%, rgba(114,120,83,0.03) 0%, transparent 45%)"
      ]
    },
    {
      name: "new 3 - Fog Rose",
      bg: "#151315", surface: "#1d1a1c", accent: [196,150,162],
      text: "#f4eef1", muted: "#b09ca2", accentHex: "#c496a2", accentDark: "#a56f7e",
      glow: [
        "radial-gradient(ellipse 106% 58% at 50% -12%, rgba(196,150,162,0.075) 0%, transparent 56%)",
        "radial-gradient(ellipse 52% 36% at 78% 18%, rgba(244,171,185,0.022) 0%, transparent 46%)",
        "linear-gradient(150deg, rgba(196,150,162,0.018) 0%, transparent 42%, rgba(165,111,126,0.03) 100%)"
      ]
    },
    {
      name: "new 3 - Dusty Teal",
      bg: "#121415", surface: "#191c1d", accent: [110,154,154],
      text: "#edf3f3", muted: "#96a6a6", accentHex: "#6e9a9a", accentDark: "#517979",
      glow: [
        "radial-gradient(ellipse 108% 58% at 50% -12%, rgba(110,154,154,0.075) 0%, transparent 56%)",
        "radial-gradient(ellipse 54% 38% at 76% 18%, rgba(45,212,191,0.02) 0%, transparent 46%)",
        "radial-gradient(ellipse 46% 32% at 18% 42%, rgba(81,121,121,0.03) 0%, transparent 45%)"
      ]
    },
    {
      name: "new 4 - Midnight Navy",
      bg: "#0c1220", surface: "#121a2c", accent: [147,197,253],
      text: "#f0f4fa", muted: "#a0b4cc", accentHex: "#93c5fd", accentDark: "#60a5fa",
      glow: [
        "radial-gradient(ellipse 100% 55% at 50% -10%, rgba(147,197,253,0.07) 0%, transparent 55%)",
        "radial-gradient(ellipse 50% 35% at 75% 20%, rgba(96,165,250,0.035) 0%, transparent 48%)"
      ]
    },
    {
      name: "new 4 - Executive Gold",
      bg: "#111111", surface: "#1a1a1a", accent: [212,175,55],
      text: "#f2f0ec", muted: "#b0a898", accentHex: "#d4af37", accentDark: "#b8941e",
      glow: [
        "radial-gradient(ellipse 100% 55% at 50% -10%, rgba(212,175,55,0.07) 0%, transparent 55%)",
        "radial-gradient(ellipse 50% 35% at 70% 20%, rgba(180,148,30,0.03) 0%, transparent 48%)"
      ]
    },
    {
      name: "new 4 - Obsidian Blue",
      bg: "#0e1117", surface: "#151a24", accent: [96,165,250],
      text: "#eef2fa", muted: "#9eacc0", accentHex: "#60a5fa", accentDark: "#3b82f6",
      glow: [
        "radial-gradient(ellipse 100% 55% at 50% -10%, rgba(96,165,250,0.08) 0%, transparent 55%)",
        "radial-gradient(ellipse 50% 35% at 75% 18%, rgba(59,130,246,0.04) 0%, transparent 48%)"
      ]
    },
    {
      name: "new 4 - Graphite Pearl",
      bg: "#131313", surface: "#1c1c1c", accent: [209,213,219],
      text: "#f4f4f4", muted: "#a0a4ab", accentHex: "#d1d5db", accentDark: "#9ca3af",
      glow: [
        "radial-gradient(ellipse 100% 55% at 50% -10%, rgba(209,213,219,0.05) 0%, transparent 55%)",
        "radial-gradient(ellipse 50% 35% at 70% 20%, rgba(156,163,175,0.025) 0%, transparent 48%)"
      ]
    },
    {
      name: "new 4 - Deep Ink Cyan",
      bg: "#0b0f14", surface: "#111820", accent: [103,232,249],
      text: "#edf5f8", muted: "#96b8c4", accentHex: "#67e8f9", accentDark: "#22d3ee",
      glow: [
        "radial-gradient(ellipse 100% 55% at 50% -10%, rgba(103,232,249,0.07) 0%, transparent 55%)",
        "radial-gradient(ellipse 50% 35% at 75% 18%, rgba(34,211,238,0.035) 0%, transparent 48%)"
      ]
    },
    {
      name: "new 4 - Onyx Brass",
      bg: "#111110", surface: "#1a1918", accent: [207,176,128],
      text: "#f3f0ea", muted: "#b0a494", accentHex: "#cfb080", accentDark: "#a88b58",
      glow: [
        "radial-gradient(ellipse 100% 55% at 50% -10%, rgba(207,176,128,0.07) 0%, transparent 55%)",
        "radial-gradient(ellipse 50% 35% at 70% 20%, rgba(168,139,88,0.03) 0%, transparent 48%)"
      ]
    },
    {
      name: "new 4 - Carbon Emerald",
      bg: "#0d1210", surface: "#141c18", accent: [52,211,153],
      text: "#ecf5f0", muted: "#92b8a4", accentHex: "#34d399", accentDark: "#10b981",
      glow: [
        "radial-gradient(ellipse 100% 55% at 50% -10%, rgba(52,211,153,0.07) 0%, transparent 55%)",
        "radial-gradient(ellipse 50% 35% at 75% 18%, rgba(16,185,129,0.035) 0%, transparent 48%)"
      ]
    },
    {
      name: "new 4 - Titanium Violet",
      bg: "#100f16", surface: "#181722", accent: [167,139,250],
      text: "#f0eef8", muted: "#a49ebc", accentHex: "#a78bfa", accentDark: "#8b5cf6",
      glow: [
        "radial-gradient(ellipse 100% 55% at 50% -10%, rgba(167,139,250,0.08) 0%, transparent 55%)",
        "radial-gradient(ellipse 50% 35% at 75% 18%, rgba(139,92,246,0.04) 0%, transparent 48%)"
      ]
    }
  ];

  // Build the switcher UI
  const panel = document.getElementById("theme-switcher");
  if (!panel || !ENABLE_THEME_SWITCHER) {
    if (panel) panel.style.display = "none";
    return;
  }
  panel.innerHTML = `
    <style>
      #theme-switcher {
        position: fixed;
        top: 5.5rem;
        right: 1rem;
        z-index: 9999;
        background: rgba(20,20,30,0.92);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        padding: 0.75rem 1rem;
        width: min(260px, calc(100vw - 2rem));
        max-height: calc(100vh - 7rem);
        overflow: auto;
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
        flex-direction: column;
        gap: 0.4rem;
      }
      #theme-switcher .ts-btn {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        width: 100%;
        padding: 0.35rem 0.55rem;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 8px;
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.75);
        font-size: 0.66rem;
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
      @media (max-width: 900px) {
        #theme-switcher {
          top: auto;
          right: 1rem;
          bottom: 1rem;
          max-height: 42vh;
        }
      }
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

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return [h * 360, s, l];
  }

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r, g, b;
    if (h < 60)       { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else              { r = c; g = 0; b = x; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
  }

  // Hand-picked complementary orb color pairs per theme
  const ORB_PALETTES = {
    "Soft Cosmos":           { warm: [253,186,180], cool: [130,220,200] },
    "Dusk Aurora":           { warm: [255,191,105], cool: [107,200,220] },
    "Midnight Garden":       { warm: [240,140,130], cool: [160,140,240] },
    "Steel Sunrise":         { warm: [244,120,160], cool: [100,180,250] },
    "Ocean Depths":          { warm: [250,160,120], cool: [80,230,200] },
    "Velvet Night":          { warm: [240,200,120], cool: [160,150,240] },
    "Slate & Gold":          { warm: [240,120,100], cool: [120,160,200] },
    "Frosted Mint":          { warm: [240,160,130], cool: [150,140,230] },
    "Neon Indigo":           { warm: [248,130,120], cool: [80,210,200] },
    "Ember Smoke":           { warm: [248,180,80],  cool: [120,150,210] },
    "Lunar Silver":          { warm: [220,170,180], cool: [160,200,230] },
    "Electric Lime":         { warm: [240,130,110], cool: [170,130,240] },
    "Royal Amethyst":        { warm: [252,180,130], cool: [100,210,200] },
    "Carbon Copper":         { warm: [230,130,160], cool: [100,190,210] },
    "Arctic Blue":           { warm: [252,170,130], cool: [160,150,230] },
    "Warm Terracotta":       { warm: [230,190,100], cool: [120,190,160] },
    "new - Graphite Bloom":  { warm: [250,190,100], cool: [100,200,210] },
    "new - Ink Teal Fade":   { warm: [240,150,140], cool: [160,140,230] },
    "new - Mocha Ember":     { warm: [240,120,150], cool: [100,170,240] },
    "new - Glacier Violet":  { warm: [250,170,120], cool: [100,210,190] },
    "new - Forest Signal":   { warm: [240,170,80],  cool: [120,160,230] },
    "new - Rose Quartz Night":{ warm: [240,200,110], cool: [130,200,170] },
    "new - Cobalt Current":  { warm: [250,150,120], cool: [100,220,190] },
    "new 2 - Amber Alloy":   { warm: [240,120,140], cool: [80,200,200] },
    "new 2 - Orchid Haze":   { warm: [240,190,90],  cool: [80,210,200] },
    "new 2 - Deep Sea Glass": { warm: [240,140,120], cool: [100,170,240] },
    "new 2 - Merlot Fade":   { warm: [250,180,80],  cool: [80,200,200] },
    "new 2 - Ice Indigo":    { warm: [240,150,150], cool: [100,220,200] },
    "new 2 - Copper Plum":   { warm: [200,130,220], cool: [100,200,200] },
    "new 2 - Azure Mist":    { warm: [250,170,130], cool: [100,230,200] },
    "new 2 - Neon Fig":      { warm: [250,190,100], cool: [80,220,200] },
    "new 2 - Olive Ember":   { warm: [240,140,100], cool: [120,160,230] },
    "new 2 - Coral Ink":     { warm: [240,200,100], cool: [100,200,210] },
    "new 3 - Slate Mist":    { warm: [184,155,165], cool: [140,170,160] },
    "new 3 - Soft Sage":     { warm: [180,150,155], cool: [145,165,185] },
    "new 3 - Smoked Blue":   { warm: [170,145,160], cool: [140,165,145] },
    "new 3 - Sandstone":     { warm: [185,150,150], cool: [135,165,155] },
    "new 3 - Mauve Ash":     { warm: [185,150,160], cool: [140,165,150] },
    "new 3 - Deep Olive":    { warm: [175,150,130], cool: [140,155,170] },
    "new 3 - Fog Rose":      { warm: [190,175,130], cool: [140,170,160] },
    "new 3 - Dusty Teal":    { warm: [170,145,145], cool: [145,145,170] },
    "new 4 - Midnight Navy": { warm: [220,175,150], cool: [140,210,195] },
    "new 4 - Executive Gold": { warm: [200,140,140], cool: [140,165,195] },
    "new 4 - Obsidian Blue": { warm: [220,150,130], cool: [120,205,190] },
    "new 4 - Graphite Pearl": { warm: [200,170,175], cool: [170,200,215] },
    "new 4 - Deep Ink Cyan": { warm: [230,170,140], cool: [160,150,220] },
    "new 4 - Onyx Brass":    { warm: [195,145,145], cool: [135,170,155] },
    "new 4 - Carbon Emerald": { warm: [220,150,130], cool: [155,145,215] },
    "new 4 - Titanium Violet":{ warm: [220,155,145], cool: [120,200,195] }
  };

  function buildOrbColors(accent, themeName) {
    const palette = ORB_PALETTES[themeName];
    const isN3 = themeName && themeName.startsWith("new 3");
    const isN4 = themeName && themeName.startsWith("new 4");
    // Muted/professional themes get softer alphas
    const a1 = isN4 ? 0.18 : isN3 ? 0.20 : 0.30;
    const a2 = isN4 ? 0.12 : isN3 ? 0.14 : 0.20;
    const a3 = isN4 ? 0.10 : isN3 ? 0.12 : 0.18;
    const a4 = isN4 ? 0.06 : isN3 ? 0.08 : 0.12;
    const a5 = isN4 ? 0.08 : isN3 ? 0.10 : 0.14;

    if (palette) {
      const { warm, cool } = palette;
      return {
        orb1: `rgba(${accent[0]},${accent[1]},${accent[2]},${a1})`,
        orb2: `rgba(${warm[0]},${warm[1]},${warm[2]},${a2})`,
        orb3: `rgba(${cool[0]},${cool[1]},${cool[2]},${a3})`,
        orb4: `rgba(${cool[0]},${cool[1]},${cool[2]},${a4})`,
        orb5: `rgba(${warm[0]},${warm[1]},${warm[2]},${a5})`,
        orbBorder: `rgba(${accent[0]},${accent[1]},${accent[2]},0.25)`,
        orbGlow: `rgba(${accent[0]},${accent[1]},${accent[2]},0.15)`
      };
    }
    // Fallback: algorithmic
    const [h, s, l] = rgbToHsl(...accent);
    const warm = hslToRgb((h + 65) % 360, Math.min(s * 1.15, 1), Math.min(l * 1.1, 1));
    const cool = hslToRgb((h + 240) % 360, Math.min(s * 0.8, 1), l);
    return {
      orb1: `rgba(${accent[0]},${accent[1]},${accent[2]},${a1})`,
      orb2: `rgba(${warm[0]},${warm[1]},${warm[2]},${a2})`,
      orb3: `rgba(${cool[0]},${cool[1]},${cool[2]},${a3})`,
      orb4: `rgba(${cool[0]},${cool[1]},${cool[2]},${a4})`,
      orb5: `rgba(${warm[0]},${warm[1]},${warm[2]},${a5})`,
      orbBorder: `rgba(${accent[0]},${accent[1]},${accent[2]},0.25)`,
      orbGlow: `rgba(${accent[0]},${accent[1]},${accent[2]},0.15)`
    };
  }

  function buildThemeGlow(t, { isNew3, isNew4 }) {
    const [ar, ag, ab] = t.accent;
    const baseAlpha = isNew4 ? 0.03 : isNew3 ? 0.04 : 0.05;
    const centerAlpha = isNew4 ? 0.035 : isNew3 ? 0.045 : 0.06;
    const edgeAlpha = isNew4 ? 0.022 : isNew3 ? 0.03 : 0.04;
    const bottomAlpha = isNew4 ? 0.02 : isNew3 ? 0.026 : 0.035;
    const orbAlpha = isNew4 ? 0.03 : isNew3 ? 0.038 : 0.052;
    const orbSoftAlpha = isNew4 ? 0.022 : isNew3 ? 0.028 : 0.038;

    const ambientLayers = [
      `radial-gradient(circle at 52% 35%, rgba(${ar},${ag},${ab},${orbAlpha}) 0%, rgba(${ar},${ag},${ab},${orbSoftAlpha}) 18%, transparent 42%)`,
      `radial-gradient(circle at 16% 20%, rgba(${ar},${ag},${ab},${orbSoftAlpha}) 0%, transparent 25%)`,
      `radial-gradient(circle at 84% 22%, rgba(${ar},${ag},${ab},${orbSoftAlpha}) 0%, transparent 24%)`,
      `radial-gradient(circle at 22% 74%, rgba(${ar},${ag},${ab},${bottomAlpha}) 0%, transparent 22%)`,
      `radial-gradient(circle at 82% 78%, rgba(${ar},${ag},${ab},${bottomAlpha}) 0%, transparent 20%)`,
      `radial-gradient(ellipse 70% 48% at 12% 14%, rgba(${ar},${ag},${ab},${baseAlpha}) 0%, transparent 58%)`,
      `radial-gradient(ellipse 56% 40% at 84% 18%, rgba(${ar},${ag},${ab},${edgeAlpha}) 0%, transparent 54%)`,
      `radial-gradient(ellipse 64% 46% at 52% 38%, rgba(${ar},${ag},${ab},${centerAlpha}) 0%, transparent 58%)`,
      `radial-gradient(ellipse 50% 34% at 18% 62%, rgba(${ar},${ag},${ab},${edgeAlpha}) 0%, transparent 52%)`,
      `radial-gradient(ellipse 58% 42% at 88% 72%, rgba(${ar},${ag},${ab},${bottomAlpha}) 0%, transparent 56%)`,
      `radial-gradient(ellipse 66% 40% at 20% 88%, rgba(${ar},${ag},${ab},${bottomAlpha}) 0%, transparent 58%)`
    ];

    return [...t.glow, ...ambientLayers].join(", ");
  }

  function applyTheme(t, btn) {
    const r = document.documentElement.style;
    const [ar, ag, ab] = t.accent;
    const neutralText = "#f7f7f4";
    const neutralMuted = "#b4b6bd";
    const isNew3 = t.name.startsWith("new 3 -");
    const isNew4 = t.name.startsWith("new 4 -");
    const textColor = (isNew3 || isNew4) ? "#fcfcfa" : neutralText;
    const mutedColor = isNew4 ? "#cdd1d8" : isNew3 ? "#c4c9d1" : neutralMuted;
    const lineAlpha = isNew4 ? 0.12 : isNew3 ? 0.14 : 0.10;
    const lineStrongAlpha = isNew4 ? 0.20 : isNew3 ? 0.24 : 0.18;
    const accentSoftAlpha = (isNew3 || isNew4) ? 0.08 : 0.10;

    // CSS variables
    r.setProperty("--bg", t.bg);
    r.setProperty("--surface", t.surface);
    r.setProperty("--line", `rgba(${ar},${ag},${ab},${lineAlpha})`);
    r.setProperty("--line-strong", `rgba(${ar},${ag},${ab},${lineStrongAlpha})`);
    r.setProperty("--text", textColor);
    r.setProperty("--muted", mutedColor);
    r.setProperty("--accent", t.accentHex);
    r.setProperty("--accent-dark", t.accentDark);
    r.setProperty("--accent-soft", `rgba(${ar},${ag},${ab},${accentSoftAlpha})`);

    // Body background
    document.body.style.background = t.bg;
    r.setProperty("--page-glow", buildThemeGlow(t, { isNew3, isNew4 }));
    document.body.style.backgroundImage = "";

    // Header backdrop
    const hdrInner = document.querySelector(".header-inner");
    if (hdrInner) {
      const [hr, hg, hb] = t.bg.match(/\w{2}/g).map(x => parseInt(x, 16));
      const hdrAlpha = isNew4 ? "0.75" : isNew3 ? "0.68" : "0.55";
      hdrInner.style.background = `rgba(${hr},${hg},${hb},${hdrAlpha})`;
    }

    // Update accent-derived variables
    const a08 = isNew4 ? "0.06" : isNew3 ? "0.06" : "0.08";
    const a15 = isNew4 ? "0.10" : isNew3 ? "0.12" : "0.15";
    r.setProperty("--_accent-08", `rgba(${ar},${ag},${ab},${a08})`);
    r.setProperty("--_accent-15", `rgba(${ar},${ag},${ab},${a15})`);
    r.setProperty("--glass-border-hover", `rgba(${ar},${ag},${ab},${isNew4 ? "0.35" : "0.3"})`);
    r.setProperty("--float-shadow-hover", `0 14px 40px rgba(0,0,0,0.22), 0 0 20px rgba(${ar},${ag},${ab},0.08)`);

    // Hero orb & photo glow colors
    const orbs = buildOrbColors(t.accent, t.name);
    r.setProperty("--orb-1", orbs.orb1);
    r.setProperty("--orb-2", orbs.orb2);
    r.setProperty("--orb-3", orbs.orb3);
    r.setProperty("--orb-4", orbs.orb4);
    r.setProperty("--orb-5", orbs.orb5);
    r.setProperty("--orb-border", orbs.orbBorder);
    r.setProperty("--orb-glow", orbs.orbGlow);

    // Active state
    grid.querySelectorAll(".ts-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  }
})();
