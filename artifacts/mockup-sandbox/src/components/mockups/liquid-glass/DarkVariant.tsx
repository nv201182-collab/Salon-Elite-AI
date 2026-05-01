import React from "react";

const POSTS = [
  { id: 1, name: "Алина Соколова", spec: "Колорист", time: "2 ч", likes: 47, comments: 12, image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80", tags: ["окрашивание", "блонд"], caption: "Холодный пепельный блонд. Тонировка через два пигмента." },
  { id: 2, name: "Мария Белова", spec: "Стилист", time: "5 ч", likes: 63, comments: 8, image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&q=80", tags: ["укладка", "стрижка"], caption: "Авторская укладка. Текстура без лака.", isVideo: true },
];

const STORIES = [
  { name: "Алина", color: "#D4B57A" },
  { name: "Мария", color: "#C8A064" },
  { name: "Ксения", color: "#E0C48A" },
  { name: "Игорь", color: "#B8956A" },
  { name: "Юлия", color: "#DCBA80" },
];

const TABS = [
  { icon: "◫", label: "Лента" },
  { icon: "⌂", label: "Главная" },
  { icon: "✦", label: "Обучение" },
  { icon: "✉", label: "Чаты" },
  { icon: "◉", label: "Профиль" },
];

export function DarkVariant() {
  return (
    <div
      className="relative overflow-hidden flex flex-col"
      style={{
        width: 390,
        height: 844,
        background: "linear-gradient(160deg, #1A1612 0%, #1E1A14 40%, #221C16 70%, #1A1510 100%)",
        fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, system-ui, sans-serif",
      }}
    >
      {/* Deep background orbs */}
      <div style={{ position: "absolute", top: -60, right: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,181,122,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 140, left: -100, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,160,100,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "40%", right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(224,196,138,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-2 pb-1" style={{ fontSize: 12, fontWeight: 600, color: "#F5EDD9", letterSpacing: 0 }}>
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <svg width="17" height="12" viewBox="0 0 17 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="#F5EDD9" opacity="0.35"/><rect x="4" y="2" width="3" height="10" rx="1" fill="#F5EDD9" opacity="0.5"/><rect x="8" y="0" width="3" height="12" rx="1" fill="#F5EDD9" opacity="0.75"/><rect x="12" y="0" width="3" height="12" rx="1" fill="#F5EDD9"/><rect x="16.5" y="3.5" width="2" height="5" rx="1" fill="#F5EDD9" opacity="0.4"/></svg>
          <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 2.5C10.5 2.5 12.7 3.6 14.2 5.3L15.5 3.8C13.6 1.7 11 0.5 8 0.5C5 0.5 2.4 1.7 0.5 3.8L1.8 5.3C3.3 3.6 5.5 2.5 8 2.5Z" fill="#F5EDD9" opacity="0.4"/><path d="M8 5.5C9.8 5.5 11.3 6.2 12.5 7.4L13.8 5.9C12.2 4.4 10.2 3.5 8 3.5C5.8 3.5 3.8 4.4 2.2 5.9L3.5 7.4C4.7 6.2 6.2 5.5 8 5.5Z" fill="#F5EDD9" opacity="0.65"/><circle cx="8" cy="10" r="1.8" fill="#F5EDD9"/></svg>
          <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#F5EDD9" strokeOpacity="0.35"/><rect x="2" y="2" width="17" height="8" rx="2" fill="#F5EDD9"/><path d="M23 4.5V7.5C23.8 7.2 24.5 6.5 24.5 6C24.5 5.5 23.8 4.8 23 4.5Z" fill="#F5EDD9" opacity="0.4"/></svg>
        </div>
      </div>

      {/* Glass header */}
      <div
        className="mx-4 mb-3 flex items-center justify-between px-5 py-3 rounded-2xl"
        style={{
          background: "rgba(40,32,22,0.65)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          border: "1px solid rgba(212,181,122,0.18)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5, color: "#F5EDD9" }}>APIA</div>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#D4B57A", fontWeight: 500, marginTop: 1 }}>ARCHITECTURE · PEOPLE · INTELLIGENCE</div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(212,181,122,0.12)", border: "1px solid rgba(212,181,122,0.25)" }}
          >
            <span style={{ fontSize: 14, color: "#D4B57A" }}>🔔</span>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(212,181,122,0.12)", border: "1px solid rgba(212,181,122,0.25)" }}
          >
            <span style={{ fontSize: 14, color: "#D4B57A" }}>⊕</span>
          </div>
        </div>
      </div>

      {/* Stories */}
      <div className="flex gap-3 px-4 mb-3 overflow-hidden">
        {STORIES.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${s.color}25, ${s.color}12)`,
                border: `2px solid ${s.color}`,
                boxShadow: `0 0 0 2px rgba(30,24,16,0.9), 0 2px 12px ${s.color}40`,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.name[0]}</span>
            </div>
            <span style={{ fontSize: 10, color: "#A09070", fontWeight: 400 }}>{s.name.slice(0, 5)}</span>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-hidden flex flex-col gap-3 px-4">
        {POSTS.map((post) => (
          <div
            key={post.id}
            className="rounded-3xl overflow-hidden"
            style={{
              background: "rgba(40,32,22,0.60)",
              backdropFilter: "blur(24px) saturate(160%)",
              WebkitBackdropFilter: "blur(24px) saturate(160%)",
              border: "1px solid rgba(212,181,122,0.15)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Author row */}
            <div className="flex items-center gap-3 px-4 pt-3 pb-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, #D4B57A25, #D4B57A12)`, border: "1.5px solid #D4B57A" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#D4B57A" }}>{post.name[0]}</span>
              </div>
              <div className="flex-1">
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F5EDD9", letterSpacing: -0.2 }}>{post.name}</div>
                <div style={{ fontSize: 10, color: "#A09070", letterSpacing: 0.2 }}>{post.spec} · {post.time}</div>
              </div>
              {post.isVideo && (
                <div className="px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: "rgba(212,181,122,0.12)", border: "1px solid rgba(212,181,122,0.3)" }}>
                  <span style={{ fontSize: 9, color: "#D4B57A" }}>▶</span>
                  <span style={{ fontSize: 9, fontWeight: 600, color: "#D4B57A" }}>ВИДЕО</span>
                </div>
              )}
            </div>

            {/* Media */}
            <div className="relative mx-3 mb-2 rounded-2xl overflow-hidden" style={{ height: 155 }}>
              <img src={post.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.88 }} />
              {post.isVideo && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(8px)" }}>
                    <span style={{ fontSize: 18, color: "#F5EDD9", marginLeft: 2 }}>▶</span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 flex gap-1.5">
                {post.tags.map((t, i) => (
                  <div key={i} className="px-2 py-0.5 rounded-full" style={{ background: "rgba(30,24,16,0.72)", backdropFilter: "blur(8px)", fontSize: 9, color: "#D4B57A", fontWeight: 500, border: "1px solid rgba(212,181,122,0.2)" }}>#{t}</div>
                ))}
              </div>
            </div>

            {/* Caption */}
            <div className="px-4 pb-2" style={{ fontSize: 12, color: "#C8B898", lineHeight: 1.5 }}>{post.caption}</div>

            {/* Glass action bar */}
            <div
              className="flex items-center gap-4 px-4 py-2.5 mx-3 mb-3 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 14, color: "#D4B57A" }}>♡</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#A09070" }}>{post.likes}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 14, color: "#786454" }}>💬</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#A09070" }}>{post.comments}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 14, color: "#786454" }}>↗</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#A09070" }}>Поделиться</span>
              </div>
              <div className="flex-1" />
              <span style={{ fontSize: 14, color: "#786454" }}>◻</span>
            </div>
          </div>
        ))}
      </div>

      {/* Floating dark glass tab bar */}
      <div className="absolute bottom-6 left-6 right-6" style={{ zIndex: 50 }}>
        <div
          className="flex items-center py-3 px-2 rounded-3xl"
          style={{
            background: "rgba(30,24,14,0.75)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(212,181,122,0.2)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.07) inset",
          }}
        >
          {TABS.map((tab, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 relative py-0.5">
              {i === 0 && (
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2"
                  style={{
                    width: 28,
                    height: 3,
                    borderRadius: 2,
                    background: "linear-gradient(90deg, #D4B57A, #E8CC90)",
                    boxShadow: "0 0 10px rgba(212,181,122,0.8)",
                  }}
                />
              )}
              <span style={{ fontSize: 18, color: i === 0 ? "#D4B57A" : "#5A4E3E" }}>{tab.icon}</span>
              <span style={{ fontSize: 9, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? "#D4B57A" : "#5A4E3E", letterSpacing: 0.2 }}>{tab.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
