import React from "react";

const POSTS = [
  { id: 1, name: "Алина Соколова", spec: "Колорист", time: "2 ч", likes: 47, comments: 12, image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80", tags: ["окрашивание", "блонд"], caption: "Холодный пепельный блонд. Тонировка через два пигмента." },
  { id: 2, name: "Мария Белова", spec: "Стилист", time: "5 ч", likes: 63, comments: 8, image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&q=80", tags: ["укладка", "стрижка"], caption: "Авторская укладка. Текстура без лака.", isVideo: true },
];

const STORIES = [
  { name: "Алина", color: "#C8A064" },
  { name: "Мария", color: "#B8956A" },
  { name: "Ксения", color: "#D4A574" },
  { name: "Игорь", color: "#A67C52" },
  { name: "Юлия", color: "#C49A6C" },
];

const TABS = [
  { icon: "◫", label: "Лента" },
  { icon: "⌂", label: "Главная" },
  { icon: "✦", label: "Обучение" },
  { icon: "✉", label: "Чаты" },
  { icon: "◉", label: "Профиль" },
];

export function LightVariant() {
  return (
    <div
      className="relative overflow-hidden flex flex-col"
      style={{
        width: 390,
        height: 844,
        background: "linear-gradient(160deg, #F8F3EC 0%, #F2EAD8 35%, #EDE0C8 65%, #F5EDD9 100%)",
        fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, system-ui, sans-serif",
      }}
    >
      {/* Subtle background orbs */}
      <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,160,100,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 120, left: -80, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,165,116,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-2 pb-1" style={{ fontSize: 12, fontWeight: 600, color: "#3D2E1C", letterSpacing: 0 }}>
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <svg width="17" height="12" viewBox="0 0 17 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="#3D2E1C" opacity="0.35"/><rect x="4" y="2" width="3" height="10" rx="1" fill="#3D2E1C" opacity="0.5"/><rect x="8" y="0" width="3" height="12" rx="1" fill="#3D2E1C" opacity="0.75"/><rect x="12" y="0" width="3" height="12" rx="1" fill="#3D2E1C"/><rect x="16.5" y="3.5" width="2" height="5" rx="1" fill="#3D2E1C" opacity="0.4"/></svg>
          <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 2.5C10.5 2.5 12.7 3.6 14.2 5.3L15.5 3.8C13.6 1.7 11 0.5 8 0.5C5 0.5 2.4 1.7 0.5 3.8L1.8 5.3C3.3 3.6 5.5 2.5 8 2.5Z" fill="#3D2E1C" opacity="0.4"/><path d="M8 5.5C9.8 5.5 11.3 6.2 12.5 7.4L13.8 5.9C12.2 4.4 10.2 3.5 8 3.5C5.8 3.5 3.8 4.4 2.2 5.9L3.5 7.4C4.7 6.2 6.2 5.5 8 5.5Z" fill="#3D2E1C" opacity="0.65"/><circle cx="8" cy="10" r="1.8" fill="#3D2E1C"/></svg>
          <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#3D2E1C" strokeOpacity="0.35"/><rect x="2" y="2" width="17" height="8" rx="2" fill="#3D2E1C"/><path d="M23 4.5V7.5C23.8 7.2 24.5 6.5 24.5 6C24.5 5.5 23.8 4.8 23 4.5Z" fill="#3D2E1C" opacity="0.4"/></svg>
        </div>
      </div>

      {/* Glass header */}
      <div
        className="mx-4 mb-3 flex items-center justify-between px-5 py-3 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.52)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.7)",
          boxShadow: "0 4px 24px rgba(160,120,70,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5, color: "#1A1209" }}>APIA</div>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#C8A064", fontWeight: 500, marginTop: 1 }}>ARCHITECTURE · PEOPLE · INTELLIGENCE</div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(200,160,100,0.15)", border: "1px solid rgba(200,160,100,0.3)" }}
          >
            <span style={{ fontSize: 14, color: "#C8A064" }}>🔔</span>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(200,160,100,0.15)", border: "1px solid rgba(200,160,100,0.3)" }}
          >
            <span style={{ fontSize: 14, color: "#C8A064" }}>⊕</span>
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
                background: `linear-gradient(135deg, ${s.color}40, ${s.color}20)`,
                border: `2px solid ${s.color}`,
                boxShadow: `0 0 0 2px rgba(255,255,255,0.8), 0 2px 8px ${s.color}30`,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.name[0]}</span>
            </div>
            <span style={{ fontSize: 10, color: "#6B5940", fontWeight: 400 }}>{s.name.slice(0, 5)}</span>
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
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(20px) saturate(160%)",
              WebkitBackdropFilter: "blur(20px) saturate(160%)",
              border: "1px solid rgba(255,255,255,0.75)",
              boxShadow: "0 8px 32px rgba(160,120,70,0.1), 0 1px 0 rgba(255,255,255,0.9) inset",
            }}
          >
            {/* Author row */}
            <div className="flex items-center gap-3 px-4 pt-3 pb-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, #C8A06440, #C8A06420)`, border: "1.5px solid #C8A064" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#C8A064" }}>{post.name[0]}</span>
              </div>
              <div className="flex-1">
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1209", letterSpacing: -0.2 }}>{post.name}</div>
                <div style={{ fontSize: 10, color: "#8B7355", letterSpacing: 0.2 }}>{post.spec} · {post.time}</div>
              </div>
              {post.isVideo && (
                <div className="px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: "rgba(200,160,100,0.15)", border: "1px solid rgba(200,160,100,0.4)" }}>
                  <span style={{ fontSize: 9, color: "#C8A064" }}>▶</span>
                  <span style={{ fontSize: 9, fontWeight: 600, color: "#C8A064" }}>ВИДЕО</span>
                </div>
              )}
            </div>

            {/* Media */}
            <div className="relative mx-3 mb-2 rounded-2xl overflow-hidden" style={{ height: 160 }}>
              <img src={post.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {post.isVideo && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.25)" }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.92)", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
                    <span style={{ fontSize: 18, color: "#1A1209", marginLeft: 2 }}>▶</span>
                  </div>
                </div>
              )}
              {/* Image glass overlay for tags */}
              <div className="absolute bottom-2 left-2 flex gap-1.5">
                {post.tags.map((t, i) => (
                  <div key={i} className="px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)", fontSize: 9, color: "#3D2E1C", fontWeight: 500 }}>#{t}</div>
                ))}
              </div>
            </div>

            {/* Caption */}
            <div className="px-4 pb-2" style={{ fontSize: 12, color: "#4A3825", lineHeight: 1.5 }}>{post.caption}</div>

            {/* Actions */}
            <div
              className="flex items-center gap-4 px-4 py-2.5 mx-3 mb-3 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.4)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.6)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 14, color: "#C8A064" }}>♡</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#6B5940" }}>{post.likes}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 14, color: "#8B7355" }}>💬</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#6B5940" }}>{post.comments}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 14, color: "#8B7355" }}>↗</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#6B5940" }}>Поделиться</span>
              </div>
              <div className="flex-1" />
              <span style={{ fontSize: 14, color: "#8B7355" }}>◻</span>
            </div>
          </div>
        ))}
      </div>

      {/* Floating glass tab bar */}
      <div className="absolute bottom-6 left-6 right-6" style={{ zIndex: 50 }}>
        <div
          className="flex items-center py-3 px-2 rounded-3xl"
          style={{
            background: "rgba(255,255,255,0.62)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255,255,255,0.85)",
            boxShadow: "0 8px 32px rgba(160,120,70,0.15), 0 1px 0 rgba(255,255,255,1) inset, 0 -1px 0 rgba(0,0,0,0.04) inset",
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
                    background: "linear-gradient(90deg, #C8A064, #D4B57A)",
                    boxShadow: "0 0 8px rgba(200,160,100,0.6)",
                  }}
                />
              )}
              <span style={{ fontSize: 18, color: i === 0 ? "#C8A064" : "#9B8B73" }}>{tab.icon}</span>
              <span style={{ fontSize: 9, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? "#C8A064" : "#9B8B73", letterSpacing: 0.2 }}>{tab.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
