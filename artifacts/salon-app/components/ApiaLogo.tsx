import React from "react";
import { View } from "react-native";
import Svg, { Path, Ellipse, Polygon, G, Text as SvgText } from "react-native-svg";

/**
 * APIA brand mark — thin geometric lettering, gold I-diamond, bee above.
 * At width ≤ 140 only the wordmark + bee are shown (no tagline).
 * At width > 140 the full tagline is shown below.
 */
export function ApiaLogo({ width = 200 }: { width?: number }) {
  const compact = width <= 140;
  const h = compact ? width * 0.52 : width * 0.60;

  return (
    <View style={{ width, height: h }}>
      <Svg width={width} height={h} viewBox={compact ? "0 0 200 104" : "0 0 320 192"}>
        {compact ? <CompactMark /> : <FullMark />}
      </Svg>
    </View>
  );
}

/** Wordmark only: "APIA" + bee, viewBox 200×104 */
function CompactMark() {
  return (
    <G>
      <BeeSvg x={138} y={0} s={0.55} />

      {/* A */}
      <SvgText x="0" y="74" fontSize="78" fontWeight="200" letterSpacing="1" fill="#1A1210" fontFamily="serif">A</SvgText>
      {/* P */}
      <SvgText x="55" y="74" fontSize="78" fontWeight="200" letterSpacing="1" fill="#1A1210" fontFamily="serif">P</SvgText>
      {/* I — vertical stroke + diamond */}
      <Path d="M114,10 L114,74" stroke="#1A1210" strokeWidth="3.5" strokeLinecap="round" />
      <Polygon points="114,2 121,10 114,18 107,10" fill="#B78F4E" />
      {/* A */}
      <SvgText x="126" y="74" fontSize="78" fontWeight="200" letterSpacing="1" fill="#1A1210" fontFamily="serif">A</SvgText>
    </G>
  );
}

/** Full mark: wordmark + tagline, viewBox 320×192 */
function FullMark() {
  return (
    <G>
      <BeeSvg x={228} y={0} s={0.70} />

      {/* A */}
      <SvgText x="0" y="110" fontSize="108" fontWeight="200" letterSpacing="2" fill="#1A1210" fontFamily="serif">A</SvgText>
      {/* P */}
      <SvgText x="78" y="110" fontSize="108" fontWeight="200" letterSpacing="2" fill="#1A1210" fontFamily="serif">P</SvgText>
      {/* I — vertical stroke + diamond */}
      <Path d="M167,14 L167,110" stroke="#1A1210" strokeWidth="5" strokeLinecap="round" />
      <Polygon points="167,2 175,11 167,20 159,11" fill="#B78F4E" />
      {/* A */}
      <SvgText x="185" y="110" fontSize="108" fontWeight="200" letterSpacing="2" fill="#1A1210" fontFamily="serif">A</SvgText>

      <TaglineSvg />
    </G>
  );
}

function TaglineSvg() {
  const dotColor = "#B78F4E";
  const textColor = "#9A9088";
  const fs = 7.5;
  const ls = 1.2;
  const positions: { type: "word" | "dot"; x: number; text?: string }[] = [
    { type: "word", x: 8,   text: "ARCHITECTURE" },
    { type: "dot",  x: 96 },
    { type: "word", x: 103, text: "PEOPLE" },
    { type: "dot",  x: 143 },
    { type: "word", x: 150, text: "INTELLIGENCE" },
    { type: "dot",  x: 234 },
    { type: "word", x: 241, text: "ACTION" },
  ];
  return (
    <G>
      {positions.map((p, i) =>
        p.type === "dot" ? (
          <Ellipse key={i} cx={p.x} cy={138} rx={1.5} ry={1.5} fill={dotColor} />
        ) : (
          <SvgText key={i} x={p.x} y={142} fontSize={fs} letterSpacing={ls} fill={textColor} fontFamily="sans-serif">
            {p.text}
          </SvgText>
        )
      )}
    </G>
  );
}

function BeeSvg({ x, y, s }: { x: number; y: number; s: number }) {
  const gold = "#B78F4E";
  const dark = "#3A2A10";
  const wing = "#C9A070";
  return (
    <G transform={`translate(${x},${y}) scale(${s})`}>
      {/* Wings (behind body) */}
      <Ellipse cx="-18" cy="22" rx="18" ry="10" fill={wing} opacity="0.55" transform="rotate(-30,-18,22)" />
      <Ellipse cx="18"  cy="22" rx="18" ry="10" fill={wing} opacity="0.55" transform="rotate(30,18,22)"  />
      <Ellipse cx="-14" cy="34" rx="12" ry="7"  fill={wing} opacity="0.40" transform="rotate(-20,-14,34)" />
      <Ellipse cx="14"  cy="34" rx="12" ry="7"  fill={wing} opacity="0.40" transform="rotate(20,14,34)"   />
      {/* Body */}
      <Ellipse cx="0" cy="42" rx="10" ry="18" fill={gold} />
      <Path d="M-9,36 Q0,34 9,36"  stroke={dark} strokeWidth="3.5" fill="none" />
      <Path d="M-10,42 Q0,40 10,42" stroke={dark} strokeWidth="3.5" fill="none" />
      <Path d="M-9,48 Q0,46 9,48"  stroke={dark} strokeWidth="3.5" fill="none" />
      {/* Head */}
      <Ellipse cx="0" cy="22" rx="9" ry="9" fill={gold} />
      {/* Antennae */}
      <Path d="M-4,14 Q-14,4 -18,-2" stroke={dark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M4,14 Q14,4 18,-2"    stroke={dark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Ellipse cx="-18" cy="-2" rx="2" ry="2" fill={dark} />
      <Ellipse cx="18"  cy="-2" rx="2" ry="2" fill={dark} />
    </G>
  );
}
