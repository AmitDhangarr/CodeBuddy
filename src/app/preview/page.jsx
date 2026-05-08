"use client";
import { useState, useEffect } from "react";
import { SKILLS_ALL, MOCK_USERS } from "../dashboard/shared.js";
import Link from "next/link";
// ── Self-contained dark theme ─────────────────────────────────────────────────
const T = {
  bg: "#07070f",
  card: "#0e0e1c",
  cardBorder: "rgba(255,255,255,0.07)",
  text: "#f0eeff",
  text2: "#a09ac0",
  text3: "#5e587a",
  input: "rgba(255,255,255,0.05)",
  inputBorder: "rgba(255,255,255,0.09)",
  aiBg: "rgba(124,58,237,0.09)",
  aiBorder: "rgba(124,58,237,0.22)",
  skillHaveBg: "rgba(34,197,94,0.08)",
  skillHaveBorder: "rgba(34,197,94,0.22)",
  skillHaveText: "#4ade80",
  skillNeedBg: "rgba(168,85,247,0.08)",
  skillNeedBorder: "rgba(168,85,247,0.22)",
  skillNeedText: "#c084fc",
};

// ── Static preview scores ─────────────────────────────────────────────────────
const PREVIEW_SCORES = [94, 88, 76, 71, 65, 58, 82, 70, 55, 90];

// ── Helpers ───────────────────────────────────────────────────────────────────
const hsl = (h) => `hsl(${h},65%,62%)`;
const hsla = (h, a) => `hsla(${h},65%,62%,${a})`;

function scoreColor(s) {
  if (s >= 80) return "#4ade80";
  if (s >= 60) return "#a78bfa";
  if (s >= 40) return "#f59e0b";
  return "#f87171";
}

function initials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ── Inline Avatar ─────────────────────────────────────────────────────────────
function Avatar({ u, size = 48, radius = 13 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: `linear-gradient(135deg,hsl(${u.hue},55%,28%),hsl(${u.hue},65%,48%))`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.33, fontWeight: 700, color: "white",
      flexShrink: 0, letterSpacing: "-0.5px",
      border: `1px solid hsla(${u.hue},65%,62%,0.2)`,
      // Use Instrument Sans for avatar initials, matching the first file
      fontFamily: "'Instrument Sans', sans-serif",
    }}>
      {u.emoji || initials(u.name)}
    </div>
  );
}

// ── Inline label ──────────────────────────────────────────────────────────────
function Lbl({ children }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, letterSpacing: "1.2px",
      textTransform: "uppercase", color: T.text3, marginBottom: 5,
      // Instrument Sans for uppercase labels, matching the first file
      fontFamily: "'Instrument Sans', sans-serif",
    }}>
      {children}
    </div>
  );
}

// ── Shared button base ────────────────────────────────────────────────────────
const btn = {
  border: "none", cursor: "pointer",
  // Instrument Sans for all buttons, matching first file's btn style
  fontFamily: "'Instrument Sans', sans-serif",
  transition: "all 0.18s",
};

// ── Auth modal configs ────────────────────────────────────────────────────────
const MODAL_CONFIGS = {
  connect: { icon: "🤝", title: "Connect with Builders", desc: "Sign up to send connection requests and start collaborating with talented builders worldwide." },
  message: { icon: "💬", title: "Send a Message", desc: "Join the community to send direct messages, discuss projects, and build real relationships." },
  like: { icon: "♥", title: "Save Builders", desc: "Create an account to like and bookmark builders you want to revisit later." },
  ai: { icon: "✦", title: "Unlock AI Insights", desc: "Get personalized AI-powered match analysis, skill gap breakdowns, and collaboration recommendations." },
  view: { icon: "👤", title: "Full Profile Access", desc: "Sign up to view complete profiles, portfolios, and project histories from every builder." },
  search: { icon: "🔍", title: "Search & Filter", desc: "Create an account to search by name, role, or skill and filter builders by availability and goals." },
  filter: { icon: "⚙️", title: "Advanced Filters", desc: "Sign up to use skill filters, role filters, online status, and custom sorting options." },
};

// ── Auth Modal ────────────────────────────────────────────────────────────────
function AuthModal({ type, userName, onClose }) {
  const cfg = MODAL_CONFIGS[type] || MODAL_CONFIGS.connect;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#0e0e1c",
          border: "1px solid rgba(124,58,237,0.32)",
          borderRadius: 24, padding: "36px 32px",
          width: "100%", maxWidth: 400, position: "relative",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.08)",
          // Instrument Sans as root font for modal, matching first file
          fontFamily: "'Instrument Sans', sans-serif",
        }}
      >
        <button onClick={onClose} style={{ ...btn, position: "absolute", top: 14, right: 16, background: "transparent", color: T.text3, fontSize: 20, lineHeight: 1 }}>✕</button>

        <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(124,58,237,0.14)", border: "1px solid rgba(124,58,237,0.28)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 20 }}>
          {cfg.icon}
        </div>

        {/* Instrument Serif for modal title, matching first file's heading style */}
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: T.text, marginBottom: 8, letterSpacing: "-0.3px" }}>{cfg.title}</div>
        <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.65, marginBottom: 20 }}>{cfg.desc}</p>

        {userName && (
          <div style={{ background: "rgba(124,58,237,0.09)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 10, padding: "9px 14px", fontSize: 12, color: "#a78bfa", marginBottom: 22, display: "flex", gap: 8, alignItems: "center" }}>
            <span>✦</span><span>{cfg.title} · {userName}</span>
          </div>
        )}

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: T.text3, marginBottom: 12 }}>Get started — it's free</div>

        <Link href={"/signup"}><button style={{ ...btn, width: "100%", padding: 13, background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "white", borderRadius: 13, fontSize: 14, fontWeight: 700, marginBottom: 10, boxShadow: "0 6px 22px rgba(124,58,237,0.38)" }}>
          🚀 Create Free Account
        </button></Link>

        <div style={{ position: "relative", textAlign: "center", fontSize: 12, color: T.text3, margin: "4px 0 10px" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.07)" }} />
          <span style={{ position: "relative", background: "#0e0e1c", padding: "0 12px" }}>or</span>
        </div>

        <Link href={"/signin"}><button style={{ ...btn, width: "100%", padding: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.09)", color: T.text2, borderRadius: 13, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          Log In to Existing Account
        </button>
        </Link>
        <div style={{ textAlign: "center", fontSize: 12, color: T.text3 }}>
          By signing up you agree to our{" "}
          <span style={{ color: "#a78bfa", cursor: "pointer", fontWeight: 600 }}>Terms</span>{" & "}
          <span style={{ color: "#a78bfa", cursor: "pointer", fontWeight: 600 }}>Privacy Policy</span>
        </div>
      </div>
    </div>
  );
}

// ── Grid Card ─────────────────────────────────────────────────────────────────
function GridCard({ u, i, openAuth }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.cardBorder}`,
      borderRadius: 18, padding: 20,
      position: "relative", overflow: "hidden",
      transition: "border-color 0.2s, transform 0.2s",
      // Instrument Sans as base font for all card text
      fontFamily: "'Instrument Sans', sans-serif",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.28)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.cardBorder; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ position: "absolute", top: -20, right: -20, width: 110, height: 110, borderRadius: "50%", background: `radial-gradient(circle,${hsla(u.hue, 0.07)} 0%,transparent 70%)`, pointerEvents: "none" }} />
      <div onClick={() => openAuth("view", u.name)} style={{ position: "absolute", inset: 0, zIndex: 1, cursor: "pointer", borderRadius: 18 }} />

      {/* Top row */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12, position: "relative", zIndex: 2 }}>
        <div style={{ position: "relative" }}>
          <Avatar u={u} size={48} radius={13} />
          <div style={{ position: "absolute", bottom: -1, right: -1, width: 9, height: 9, borderRadius: "50%", background: u.online ? "#22c55e" : "#3a3a50", border: "2px solid #0e0e1c" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>@{u.handle}</div>
          <div style={{ fontSize: 11, color: hsl(u.hue), fontWeight: 600, marginTop: 2 }}>{u.role}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {/* Instrument Serif for match score number, matching first file */}
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: scoreColor(u.matchScore), lineHeight: 1 }}>{u.matchScore}%</div>
          <div style={{ fontSize: 9, color: T.text3, marginTop: 1 }}>match</div>
        </div>
      </div>

      {/* Match bar */}
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginBottom: 12, position: "relative", zIndex: 2 }}>
        <div style={{ height: "100%", width: `${u.matchScore}%`, background: `linear-gradient(90deg,hsl(${u.hue},65%,40%),hsl(${u.hue},75%,62%))`, borderRadius: 99 }} />
      </div>

      <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.6, marginBottom: 12, position: "relative", zIndex: 2 }}>{u.bio}</p>

      <div style={{ marginBottom: 8, position: "relative", zIndex: 2 }}>
        <Lbl>Has</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {u.skillsHave.map(s => (
            <span key={s} style={{ padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText, fontFamily: "'Instrument Sans', sans-serif" }}>{s}</span>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12, position: "relative", zIndex: 2 }}>
        <Lbl>Needs</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {u.skillsNeed.map(s => (
            <span key={s} style={{ padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText, fontFamily: "'Instrument Sans', sans-serif" }}>{s}</span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", position: "relative", zIndex: 2 }}>
        <span style={{ fontSize: 11, color: T.text3 }}>📍 {u.location}</span>
        <span style={{ fontSize: 11, color: T.text3 }}>📁 {u.projects} projects</span>
        <span style={{ fontSize: 11, color: T.text3 }}>★ {u.followers}</span>
      </div>

      <div style={{ marginBottom: 14, position: "relative", zIndex: 2 }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: hsla(u.hue, 0.12), border: `1px solid ${hsla(u.hue, 0.25)}`, color: hsl(u.hue), fontFamily: "'Instrument Sans', sans-serif" }}>
          Seeking {u.lookingFor}
        </span>
      </div>

      <div style={{ display: "flex", gap: 6, position: "relative", zIndex: 3 }}>
        <button onClick={() => openAuth("connect", u.name)} style={{ ...btn, flex: 1, padding: "9px", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "white", borderRadius: 11, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
          Connect
        </button>
        <button onClick={() => openAuth("like", u.name)} style={{ ...btn, padding: "9px 11px", background: "transparent", border: `1px solid ${T.cardBorder}`, color: T.text3, borderRadius: 10, fontSize: 15 }}>♡</button>
        <button onClick={() => openAuth("ai", u.name)} style={{ ...btn, padding: "9px 11px", background: "transparent", border: `1px solid ${T.cardBorder}`, color: T.text3, borderRadius: 10, fontSize: 13 }}>✦</button>
        <button onClick={() => openAuth("message", u.name)} style={{ ...btn, padding: "9px 11px", background: "transparent", border: `1px solid ${T.cardBorder}`, color: T.text3, borderRadius: 10, fontSize: 13 }}>💬</button>
        <button onClick={() => openAuth("view", u.name)} style={{ ...btn, padding: "9px 11px", background: "transparent", border: `1px solid ${T.cardBorder}`, color: T.text3, borderRadius: 10, fontSize: 13 }}>↗</button>
      </div>
    </div>
  );
}

// ── List Card ─────────────────────────────────────────────────────────────────
function ListCard({ u, i, openAuth }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.cardBorder}`,
      borderRadius: 14, padding: "14px 18px",
      display: "flex", gap: 14, alignItems: "center", position: "relative",
      transition: "border-color 0.2s",
      // Instrument Sans as base font for list card
      fontFamily: "'Instrument Sans', sans-serif",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(124,58,237,0.25)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = T.cardBorder}
    >
      <div onClick={() => openAuth("view", u.name)} style={{ position: "absolute", inset: 0, zIndex: 1, cursor: "pointer", borderRadius: 14 }} />

      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar u={u} size={42} radius={11} />
        <div style={{ position: "absolute", bottom: -1, right: -1, width: 8, height: 8, borderRadius: "50%", background: u.online ? "#22c55e" : "#3a3a50", border: "2px solid #0e0e1c" }} />
      </div>

      <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{u.name}</span>
          <span style={{ fontSize: 11, color: hsl(u.hue), fontWeight: 600 }}>{u.role}</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: hsla(u.hue, 0.1), border: `1px solid ${hsla(u.hue, 0.22)}`, color: hsl(u.hue) }}>{u.lookingFor}</span>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {u.skillsHave.slice(0, 3).map(s => <span key={s} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }}>{s}</span>)}
          {u.skillsNeed.slice(0, 2).map(s => <span key={s} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText }}>{s}</span>)}
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0, position: "relative", zIndex: 2 }}>
        {/* Instrument Serif for match score in list card, matching first file */}
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: scoreColor(u.matchScore), lineHeight: 1 }}>{u.matchScore}%</div>
        <div style={{ fontSize: 10, color: T.text3 }}>match</div>
      </div>

      <div style={{ display: "flex", gap: 6, flexShrink: 0, position: "relative", zIndex: 3 }}>
        <button onClick={() => openAuth("connect", u.name)} style={{ ...btn, padding: "7px 14px", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "white", borderRadius: 9, fontSize: 12, fontWeight: 700 }}>Connect</button>
        <button onClick={() => openAuth("message", u.name)} style={{ ...btn, padding: "7px 10px", background: "transparent", border: `1px solid ${T.cardBorder}`, color: T.text3, borderRadius: 9, fontSize: 12 }}>💬</button>
        <button onClick={() => openAuth("view", u.name)} style={{ ...btn, padding: "7px 10px", background: "transparent", border: `1px solid ${T.cardBorder}`, color: T.text3, borderRadius: 9, fontSize: 12 }}>↗</button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DiscoverTab() {
  const [view, setView] = useState("grid");
  const [authModal, setAuthModal] = useState(null);

  // ── Font injection matching the first file's approach ──────────────────────
  // The first file loads Instrument Sans + Instrument Serif via its global CSS.
  // Here we inject them the same way since the css string was never applied.
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = "https://fonts.googleapis.com";
    document.head.appendChild(link);

    const link2 = document.createElement("link");
    link2.rel = "preconnect";
    link2.href = "https://fonts.gstatic.com";
    link2.crossOrigin = "anonymous";
    document.head.appendChild(link2);

    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = "https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap";
    document.head.appendChild(fontLink);

    // Global resets + animations matching the first file's css string
    const style = document.createElement("style");
    style.setAttribute("data-discover-preview", "1");
    style.textContent = `
      [data-discover-preview-root] * { box-sizing: border-box; }
      [data-discover-preview-root] input,
      [data-discover-preview-root] textarea,
      [data-discover-preview-root] select,
      [data-discover-preview-root] button { font-family: 'Instrument Sans', sans-serif; }
      [data-discover-preview-root] ::-webkit-scrollbar { width: 4px; }
      [data-discover-preview-root] ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
      @keyframes discoverFadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes discoverFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      .discover-fade-up { animation: discoverFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(link2);
      document.head.removeChild(fontLink);
      document.head.removeChild(style);
    };
  }, []);

  const users = MOCK_USERS.map((u, i) => ({
    ...u,
    matchScore: PREVIEW_SCORES[i % PREVIEW_SCORES.length],
  }));

  const openAuth = (type, userName) => setAuthModal({ type, userName });
  const closeAuth = () => setAuthModal(null);
  const avgMatch = Math.round(users.reduce((a, u) => a + u.matchScore, 0) / users.length);

  return (
    <div
      data-discover-preview-root
      style={{
        background: T.bg,
        minHeight: "100vh",
        padding: "24px 20px",
        // Instrument Sans as the root font — same as first file's fontFamily on its root div
        fontFamily: "'Instrument Sans', sans-serif",
        boxSizing: "border-box",
      }}
    >

      {/* ── Preview Banner ── */}
      <div style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 14, padding: "11px 16px", marginBottom: 22, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 13, color: T.text2 }}>
        <span style={{ fontSize: 15 }}>👀</span>
        <span><strong style={{ color: "#a78bfa" }}>Preview Mode</strong> — You're browsing as a guest. Sign up to connect, message, and get AI insights.</span>
        <button onClick={() => openAuth("connect")} style={{ ...btn, marginLeft: "auto", padding: "7px 16px", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "white", borderRadius: 9, fontSize: 12, fontWeight: 700, flexShrink: 0, boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
          Sign Up Free →
        </button>
      </div>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, gap: 14, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#7c3aed", marginBottom: 7, display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", display: "inline-block" }} />
            Live Matching
          </div>
          {/* Instrument Serif for main heading — matches first file exactly */}
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, color: T.text, letterSpacing: "-0.8px", lineHeight: 1.1, margin: 0, fontWeight: 400 }}>Discover Builders</h1>
          <p style={{ fontSize: 13, color: T.text3, marginTop: 5 }}>{users.length} builders ranked by match score</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["grid", "list"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ ...btn, padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, background: view === v ? "rgba(124,58,237,0.15)" : "transparent", border: `1px solid ${view === v ? "rgba(124,58,237,0.4)" : T.cardBorder}`, color: view === v ? "#a78bfa" : T.text3 }}>
              {v === "grid" ? "⊞ Grid" : "≡ List"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 180px", minWidth: 140 }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.text3, fontSize: 13, pointerEvents: "none" }}>🔍</span>
          <input
            placeholder="Search name, role, skill…"
            readOnly
            onClick={() => openAuth("search")}
            style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text2, borderRadius: 11, fontSize: 13, outline: "none", padding: "9px 14px 9px 34px", width: "100%", cursor: "pointer", boxSizing: "border-box" }}
          />
        </div>
        {[
          { label: "All Skills", opts: ["All Skills", ...SKILLS_ALL] },
          { label: "All Roles", opts: ["All Roles", "Collaborator", "Mentor", "Mentee"] },
          { label: "Sort: Match %", opts: ["Sort: Match %", "Sort: Followers", "Sort: Projects", "Sort: Online First"] },
        ].map(({ label, opts }) => (
          <select key={label} onClick={() => openAuth("filter")} onChange={e => { e.target.selectedIndex = 0; openAuth("filter"); }}
            style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text2, padding: "9px 12px", borderRadius: 10, fontSize: 12, outline: "none", cursor: "pointer" }}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <button onClick={() => openAuth("filter")} style={{ ...btn, padding: "8px 13px", borderRadius: 10, fontSize: 12, fontWeight: 600, background: "transparent", border: `1px solid ${T.cardBorder}`, color: T.text3 }}>
          ● Online only
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { v: String(users.length), l: "Showing" },
          { v: "3,204", l: "Total builders" },
          { v: String(MOCK_USERS.filter(u => u.online).length), l: "Active now" },
          { v: `${avgMatch}%`, l: "Avg match" },
        ].map((s, i) => (
          <div key={i} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 12, padding: "10px 18px", display: "flex", gap: 10, alignItems: "center" }}>
            {/* Instrument Serif for stat numbers — matches first file's stat row */}
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 21, color: T.text, fontWeight: 400 }}>{s.v}</span>
            <span style={{ fontSize: 11, color: T.text3 }}>{s.l}</span>
          </div>
        ))}
      </div>

      {/* ── Cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: view === "list" ? "1fr" : "repeat(auto-fill,minmax(300px,1fr))",
        gap: view === "list" ? 10 : 16,
      }}>
        {users.map((u, i) =>
          view === "list"
            ? <ListCard key={u.id} u={u} i={i} openAuth={openAuth} />
            : <GridCard key={u.id} u={u} i={i} openAuth={openAuth} />
        )}
      </div>

      {/* ── Auth Modal ── */}
      {authModal && (
        <AuthModal type={authModal.type} userName={authModal.userName} onClose={closeAuth} />
      )}
    </div>
  );
}