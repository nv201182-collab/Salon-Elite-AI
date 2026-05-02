/**
 * Design tokens — Apple Liquid Glass aesthetic, May 2026.
 *
 * Light mode uses clean whites and cool grays (not warm beige).
 * Gold accent (#C8A064) is kept as the APIA brand colour, used sparingly.
 * Dark mode mirrors iOS 26 dark-surface conventions.
 */
const colors = {
  light: {
    text:               "#1A1A1A",
    tint:               "#C8A064",
    background:         "#FFFFFF",
    foreground:         "#111111",
    card:               "#FFFFFF",
    cardForeground:     "#111111",
    primary:            "#C8A064",
    primaryForeground:  "#FFFFFF",
    secondary:          "#F2F2F7",       // iOS system grouped bg
    secondaryForeground:"#111111",
    muted:              "#F2F2F7",
    mutedForeground:    "#8A8A8E",       // iOS secondaryLabel
    accent:             "#C8A064",
    accentForeground:   "#FFFFFF",
    destructive:        "#C8384A",
    destructiveForeground: "#FFFFFF",
    border:             "#E5E5EA",       // iOS separator
    input:              "#F2F2F7",
    pink:               "#C8A064",       // brand gold (kept for compat)
    pinkSoft:           "#F2F2F7",       // cool light gray (was warm beige)
    purple:             "#A87040",       // darker gold
    purpleSoft:         "#EAEAEF",       // cool gray (was warm tan)
    gold:               "#C8A064",
    goldDeep:           "#A06030",
    overlay:            "rgba(0,0,0,0.36)",
    specular:           "rgba(255,255,255,0.96)",
    glassTint:          "rgba(255,255,255,0.88)",
  },
  dark: {
    text:               "#F5F5F7",
    tint:               "#D4B57A",
    background:         "#111111",
    foreground:         "#F5F5F7",
    card:               "#1C1C1E",       // iOS grouped card
    cardForeground:     "#F5F5F7",
    primary:            "#D4B57A",
    primaryForeground:  "#111111",
    secondary:          "#2C2C2E",
    secondaryForeground:"#F5F5F7",
    muted:              "#2C2C2E",
    mutedForeground:    "#8E8E93",
    accent:             "#D4B57A",
    accentForeground:   "#111111",
    destructive:        "#D44A5C",
    destructiveForeground: "#FFFFFF",
    border:             "#38383A",       // iOS dark separator
    input:              "#2C2C2E",
    pink:               "#D4B57A",
    pinkSoft:           "#2C2C2E",
    purple:             "#B6834E",
    purpleSoft:         "#2C2C2E",
    gold:               "#D4B57A",
    goldDeep:           "#B6834E",
    overlay:            "rgba(0,0,0,0.60)",
    specular:           "rgba(255,255,255,0.12)",
    glassTint:          "rgba(28,28,30,0.80)",
  },
  radius: 20,
};

export default colors;
