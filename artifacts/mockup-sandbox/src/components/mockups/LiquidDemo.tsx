/**
 * APIA — Liquid Glass Tab Bar Demo  (Phase 1, isolated)
 *
 * Apple "Liquid Glass" material — iOS 26 / WWDC 2025:
 *  • backdrop-filter blur(40px) saturate(200%)
 *  • Specular radial-gradient highlight (fake light refraction)
 *  • Inset top / bottom border for the light/shadow edges
 *  • SVG <feGaussianBlur> + <feColorMatrix> goo filter → organic merge
 *  • Framer Motion layoutId: blob morphs between tab positions
 *  • AnimatePresence: old blob stays alive so FM can animate FROM its pos
 *  • whileTap scale press, label fade-in only for active tab
 */

import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Home, MessageCircle, Sparkles, User } from "lucide-react";
import { useState } from "react";

/* ─── Tabs ──────────────────────────────────────────────────── */
const TABS = [
  { id: "home",    Icon: Home,          label: "Главная"  },
  { id: "search",  Icon: Sparkles,      label: "Лента"    },
  { id: "learn",   Icon: BookOpen,      label: "Обучение" },
  { id: "chat",    Icon: MessageCircle, label: "Чаты"     },
  { id: "profile", Icon: User,          label: "Профиль"  },
];

/* ─── Colorful cards (so blur has something vivid to blur) ──── */
const CARDS = [
  { bg: "linear-gradient(135deg,#FF6B9D,#C44DFF)", title: "Эфемерная техника", sub: "Розовый × Фиолетовый" },
  { bg: "linear-gradient(135deg,#4D79FF,#00C6FF)", title: "Холодный блонд",    sub: "Синий × Голубой"     },
  { bg: "linear-gradient(135deg,#00C9A7,#00D4FF)", title: "Изумрудная укладка",sub: "Бирюза × Голубой"    },
  { bg: "linear-gradient(135deg,#FF8C42,#FF4D6D)", title: "Медный балаяж",     sub: "Оранжевый × Коралл"  },
  { bg: "linear-gradient(135deg,#A855F7,#EC4899)", title: "Неоновые концы",    sub: "Сирень × Малина"     },
  { bg: "linear-gradient(135deg,#10B981,#3B82F6)", title: "Матча-тонировка",   sub: "Зелёный × Синий"     },
];

/* ─── Spring configs ─────────────────────────────────────────── */
const BLOB_SPRING = { type: "spring" as const, stiffness: 420, damping: 28, mass: 0.9  };
const ICON_SPRING = { type: "spring" as const, stiffness: 500, damping: 30              };
const TAP_SPRING  = { type: "spring" as const, stiffness: 600, damping: 25              };

/* ─── Liquid Glass material styles (shared) ──────────────────── */
const GLASS: React.CSSProperties = {
  backdropFilter: "blur(40px) saturate(200%) brightness(1.06)",
  WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.06)",
  background: "rgba(255,255,255,0.22)",
  border: "1px solid rgba(255,255,255,0.58)",
  boxShadow: [
    "0 8px 40px rgba(0,0,0,0.18)",
    "0 1px 2px rgba(0,0,0,0.10)",
    "inset 0 1.5px 0 rgba(255,255,255,0.58)",   // top light edge
    "inset 0 -1px 0 rgba(255,255,255,0.12)",    // bottom shadow edge
  ].join(", "),
};

const BLOB_GLASS: React.CSSProperties = {
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  background: "rgba(255,255,255,0.44)",
  border: "1px solid rgba(255,255,255,0.75)",
  boxShadow: "0 2px 16px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.72)",
};

/* ─── Component ──────────────────────────────────────────────── */
export function LiquidDemo() {
  const [active, setActive] = useState<string>("home");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #FF6B9D 0%, #C44DFF 18%, #4D79FF 38%, #00C6FF 55%, #00C9A7 72%, #10B981 88%, #3B82F6 100%)",
        fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, system-ui, sans-serif",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* ══ SVG Goo filter — placed ONCE, referenced by id ══════ */}
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <defs>
          <filter id="liquid-goo" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* ══ Scrollable content — vivid cards so blur is obvious ══ */}
      <div style={{ paddingBottom: 140, paddingTop: 28, paddingLeft: 16, paddingRight: 16 }}>
        <h1
          style={{
            textAlign: "center", color: "rgba(255,255,255,0.96)",
            fontSize: 22, fontWeight: 700, letterSpacing: -0.5,
            marginBottom: 6, textShadow: "0 2px 12px rgba(0,0,0,0.3)",
          }}
        >
          Liquid Glass · Demo
        </h1>
        <p
          style={{
            textAlign: "center", color: "rgba(255,255,255,0.72)",
            fontSize: 13, marginBottom: 24,
            textShadow: "0 1px 6px rgba(0,0,0,0.2)",
          }}
        >
          Нажимай на вкладки — наблюдай за морфингом
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {CARDS.map((card, i) => (
            <div
              key={i}
              style={{
                borderRadius: 20, padding: "20px 16px",
                background: card.bg,
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                minHeight: 120, display: "flex",
                flexDirection: "column", justifyContent: "flex-end",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 3, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
                {card.title}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.82)", textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
                {card.sub}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, textAlign: "center", color: "rgba(255,255,255,0.48)", fontSize: 11 }}>
          ↕ Прокрути — стекло блюрит контент позади
        </div>
      </div>

      {/* ══ Floating Liquid Glass Tab Bar ════════════════════════ */}
      <div
        style={{
          position: "fixed", bottom: 24,
          left: "50%", transform: "translateX(-50%)",
          width: "calc(100% - 32px)", maxWidth: 480,
          zIndex: 100,
        }}
      >
        {/* Outer glass pill */}
        <div
          style={{
            position: "relative",
            borderRadius: 40, height: 70,
            overflow: "hidden",
            ...GLASS,
          }}
        >
          {/* Specular highlight — top-left radial gradient, fake refraction */}
          <div
            style={{
              position: "absolute", inset: 0,
              pointerEvents: "none", zIndex: 3,
              background: "radial-gradient(ellipse 75% 60% at 15% 10%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.10) 45%, transparent 70%)",
              borderRadius: 40,
            }}
          />

          {/* Inner container with GOO filter applied
              Both the active blob AND the icons live here so
              they merge/separate like liquid mercury               */}
          <div
            style={{
              position: "relative", height: "100%",
              display: "flex", alignItems: "center",
              padding: "0 4px",
              filter: "url(#liquid-goo)",
              zIndex: 1,
            }}
          >
            {/* ── Active blob: AnimatePresence + layoutId ─────── */}
            {/*    Each tab has its own key so React unmounts/mounts */}
            {/*    between tabs; layoutId tells FM they're the same  */}
            {/*    "logical" shape → FM animates from old to new pos  */}
            <AnimatePresence>
              {TABS.map((tab, i) =>
                tab.id === active ? (
                  <motion.div
                    key={tab.id}
                    layoutId="activeTab"
                    transition={BLOB_SPRING}
                    style={{
                      position: "absolute",
                      top: 7, bottom: 7,
                      left: `calc(${i * (100 / TABS.length)}% + 4px)`,
                      width: `calc(${100 / TABS.length}% - 8px)`,
                      borderRadius: 999,
                      zIndex: 0,
                      ...BLOB_GLASS,
                    }}
                  />
                ) : null
              )}
            </AnimatePresence>

            {/* ── Tab buttons ─────────────────────────────────── */}
            {TABS.map((tab) => {
              const isActive = tab.id === active;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  whileTap={{ scale: 0.86, transition: TAP_SPRING }}
                  style={{
                    flex: 1, display: "flex",
                    flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 2, height: "100%",
                    background: "transparent", border: "none",
                    cursor: "pointer", position: "relative",
                    zIndex: 1, padding: 0, outline: "none",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {/* Icon */}
                  <motion.div
                    animate={{
                      scale:   isActive ? 1.15 : 0.9,
                      opacity: isActive ? 1    : 0.46,
                    }}
                    transition={ICON_SPRING}
                  >
                    <tab.Icon
                      size={isActive ? 22 : 20}
                      strokeWidth={isActive ? 2.2 : 1.7}
                      color={isActive ? "#1C1C1E" : "rgba(28,28,30,0.52)"}
                    />
                  </motion.div>

                  {/* Label — only for active tab, fades in with slight delay */}
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.span
                        key="lbl"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{
                          opacity: 1, y: 0,
                          transition: { delay: 0.09, duration: 0.2, ease: "easeOut" },
                        }}
                        exit={{ opacity: 0, y: 3, transition: { duration: 0.1 } }}
                        style={{
                          fontSize: 9, fontWeight: 600,
                          color: "#1C1C1E", letterSpacing: 0.2,
                          lineHeight: 1, userSelect: "none",
                          pointerEvents: "none",
                        }}
                      >
                        {tab.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* iOS-style home indicator */}
        <div
          style={{
            width: 130, height: 4, borderRadius: 2,
            background: "rgba(255,255,255,0.5)",
            margin: "10px auto 0",
          }}
        />
      </div>
    </div>
  );
}

export default LiquidDemo;
