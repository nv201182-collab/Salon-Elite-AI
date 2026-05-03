/**
 * Design tokens — APIA Brand, May 2026.
 *
 * Warm cream palette — organic, airy, premium.
 * Inspired by the reference design: sandy/taupe backgrounds, warm caramel accent.
 */
const colors = {
  light: {
    text:               "#1A1210",
    tint:               "#A87845",
    background:         "#FAF8F4",          // warm cream (not pure white)
    foreground:         "#1A1210",
    card:               "#FFFFFF",
    cardForeground:     "#1A1210",
    primary:            "#A87845",          // warm caramel gold
    primaryForeground:  "#FFFFFF",
    secondary:          "#F3EDE5",          // warm light sand
    secondaryForeground:"#1A1210",
    muted:              "#F3EDE5",
    mutedForeground:    "#9E8878",          // warm muted taupe
    accent:             "#A87845",
    accentForeground:   "#FFFFFF",
    destructive:        "#C8384A",
    destructiveForeground: "#FFFFFF",
    border:             "#E5D9CC",          // warm sand border
    input:              "#F3EDE5",
    pink:               "#A87845",          // brand warm gold
    pinkSoft:           "#F3EDE5",
    purple:             "#7A5830",          // deeper warm brown
    purpleSoft:         "#EDE4D8",
    gold:               "#A87845",
    goldDeep:           "#7A5830",
    overlay:            "rgba(30,18,10,0.38)",
    specular:           "rgba(255,255,255,0.96)",
    glassTint:          "rgba(255,252,248,0.88)",  // warm glass tint
  },
  dark: {
    text:               "#F5F0EA",
    tint:               "#C4A06A",
    background:         "#14100C",
    foreground:         "#F5F0EA",
    card:               "#1E1813",
    cardForeground:     "#F5F0EA",
    primary:            "#C4A06A",
    primaryForeground:  "#14100C",
    secondary:          "#2A221A",
    secondaryForeground:"#F5F0EA",
    muted:              "#2A221A",
    mutedForeground:    "#8E7E70",
    accent:             "#C4A06A",
    accentForeground:   "#14100C",
    destructive:        "#D44A5C",
    destructiveForeground: "#FFFFFF",
    border:             "#3A2E24",
    input:              "#2A221A",
    pink:               "#C4A06A",
    pinkSoft:           "#2A221A",
    purple:             "#A88050",
    purpleSoft:         "#2A221A",
    gold:               "#C4A06A",
    goldDeep:           "#A88050",
    overlay:            "rgba(0,0,0,0.65)",
    specular:           "rgba(255,255,255,0.10)",
    glassTint:          "rgba(20,16,12,0.82)",
  },
  radius: 20,
};

export default colors;
