import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Ellipse, Line, Polygon, G, Text as SvgText } from "react-native-svg";

/**
 * Точное воспроизведение логотипа APIA:
 * - Крупные буквы A P I A с широким кернингом
 * - «I» — вертикальная линия с золотым ромбом вместо точки
 * - Пчела в правом верхнем углу (золотая)
 * - Подстрока ARCHITECTURE • PEOPLE • INTELLIGENCE • ACTION
 */
export function ApiaLogo({ width = 320 }: { width?: number }) {
  const h = width * 0.55;
  const scale = width / 320;

  return (
    <Svg width={width} height={h} viewBox="0 0 320 176">
      {/* Пчела — верхний правый угол */}
      <BeeSvg x={228} y={-2} scale={0.72} />

      {/* Буква A (левая) */}
      <SvgText
        x="0" y="110"
        fontSize="108"
        fontWeight="300"
        letterSpacing="2"
        fill="#141210"
        fontFamily="sans-serif"
      >
        A
      </SvgText>

      {/* Буква P */}
      <SvgText
        x="78" y="110"
        fontSize="108"
        fontWeight="300"
        letterSpacing="2"
        fill="#141210"
        fontFamily="sans-serif"
      >
        P
      </SvgText>

      {/* Буква I — тонкая линия + золотой ромб */}
      {/* Вертикальная линия */}
      <Path d="M167,14 L167,110" stroke="#141210" strokeWidth="5" strokeLinecap="round" />
      {/* Золотой ромб (вместо точки сверху) */}
      <Polygon
        points="167,2 175,11 167,20 159,11"
        fill="#B78F4E"
      />

      {/* Буква A (правая) */}
      <SvgText
        x="185" y="110"
        fontSize="108"
        fontWeight="300"
        letterSpacing="2"
        fill="#141210"
        fontFamily="sans-serif"
      >
        A
      </SvgText>

      {/* Подстрока */}
      <SvgText
        x="160" y="140"
        fontSize="8.5"
        fontWeight="400"
        letterSpacing="1.4"
        fill="#9A9088"
        fontFamily="sans-serif"
        textAnchor="middle"
      >
        ARCHITECTURE
      </SvgText>
      <SvgText x="160" y="140" fontSize="8.5" fill="#B78F4E" fontFamily="sans-serif">
        {/* dots handled below */}
      </SvgText>

      {/* Подстрока целиком */}
      <TaglineSvg />
    </Svg>
  );
}

function TaglineSvg() {
  const words = ["ARCHITECTURE", "PEOPLE", "INTELLIGENCE", "ACTION"];
  const dotColor = "#B78F4E";
  const textColor = "#9A9088";
  const fontSize = 7.5;
  const letterSpacing = 1.2;

  // Позиции рассчитаны вручную для viewBox 320
  const positions: { type: "word" | "dot"; x: number; text?: string }[] = [
    { type: "word", x: 8, text: "ARCHITECTURE" },
    { type: "dot", x: 96 },
    { type: "word", x: 103, text: "PEOPLE" },
    { type: "dot", x: 143 },
    { type: "word", x: 150, text: "INTELLIGENCE" },
    { type: "dot", x: 234 },
    { type: "word", x: 241, text: "ACTION" },
  ];

  return (
    <G>
      {positions.map((p, i) =>
        p.type === "dot" ? (
          <Ellipse key={i} cx={p.x} cy={138} rx={1.5} ry={1.5} fill={dotColor} />
        ) : (
          <SvgText
            key={i}
            x={p.x}
            y={142}
            fontSize={fontSize}
            letterSpacing={letterSpacing}
            fill={textColor}
            fontFamily="sans-serif"
          >
            {p.text}
          </SvgText>
        )
      )}
    </G>
  );
}

function BeeSvg({ x, y, scale: s }: { x: number; y: number; scale: number }) {
  const gold = "#B78F4E";
  const dark = "#3A2A10";
  const wingFill = "#C9A070";

  return (
    <G transform={`translate(${x},${y}) scale(${s})`}>
      {/* Крылья (позади тела) */}
      {/* Верхнее левое крыло */}
      <Ellipse cx="-18" cy="22" rx="18" ry="10" fill={wingFill} opacity="0.55" transform="rotate(-30,-18,22)" />
      {/* Верхнее правое крыло */}
      <Ellipse cx="18" cy="22" rx="18" ry="10" fill={wingFill} opacity="0.55" transform="rotate(30,18,22)" />
      {/* Нижнее левое крыло */}
      <Ellipse cx="-14" cy="34" rx="12" ry="7" fill={wingFill} opacity="0.4" transform="rotate(-20,-14,34)" />
      {/* Нижнее правое крыло */}
      <Ellipse cx="14" cy="34" rx="12" ry="7" fill={wingFill} opacity="0.4" transform="rotate(20,14,34)" />

      {/* Тело */}
      <Ellipse cx="0" cy="42" rx="10" ry="18" fill={gold} />
      {/* Полоски */}
      <Path d="M-9,36 Q0,34 9,36" stroke={dark} strokeWidth="3.5" fill="none" />
      <Path d="M-10,42 Q0,40 10,42" stroke={dark} strokeWidth="3.5" fill="none" />
      <Path d="M-9,48 Q0,46 9,48" stroke={dark} strokeWidth="3.5" fill="none" />

      {/* Голова */}
      <Ellipse cx="0" cy="22" rx="9" ry="9" fill={gold} />

      {/* Усики */}
      <Path d="M-4,14 Q-14,4 -18,-2" stroke={dark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M4,14 Q14,4 18,-2" stroke={dark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Кончики усиков */}
      <Ellipse cx="-18" cy="-2" rx="2" ry="2" fill={dark} />
      <Ellipse cx="18" cy="-2" rx="2" ry="2" fill={dark} />
    </G>
  );
}
