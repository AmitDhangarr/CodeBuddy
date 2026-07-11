"use client";
import { useState, useEffect } from "react";
import { SKILLS_ALL, MOCK_USERS } from "../dashboard/shared.js";
import Link from "next/link";
import { useThemeStore } from "../../../store/themeprovider";
import { Moon, Sun, UserPlus, MessageSquare, Heart, Sparkles, User, Search, Settings, X, Rocket, MapPin, Folder, Star, ExternalLink, LayoutGrid, List, Eye, ArrowRight } from "lucide-react";

const iconSize = (min, max, vw = 3.2) => ({
  width: `clamp(${min}px, ${vw}vw, ${max}px)`,
  height: `clamp(${min}px, ${vw}vw, ${max}px)`,
  flexShrink: 0,
});

// ── Theme factory ─────────────────────────────────────────────────────────────
function makeTheme(dark) {
  if (dark) return {
    bg: "#07070f",
    card: "#0e0e1c",
    cardBorder: "rgba(255,255,255,0.10)",
    text: "#f0eeff",
    text2: "#a09ac0",
    text3: "#5e587a",
    input: "rgba(255,255,255,0.05)",
    inputBorder: "rgba(255,255,255,0.12)",
    aiBg: "rgba(124,58,237,0.09)",
    aiBorder: "rgba(124,58,237,0.22)",
    skillHaveBg: "rgba(34,197,94,0.08)",
    skillHaveBorder: "rgba(34,197,94,0.22)",
    skillHaveText: "#4ade80",
    skillNeedBg: "rgba(168,85,247,0.08)",
    skillNeedBorder: "rgba(168,85,247,0.22)",
    skillNeedText: "#c084fc",
    toggleTrackOff: "rgba(255,255,255,0.11)",
  }
  return {
    bg: "#f2f1fb",
    card: "#ffffff",
    cardBorder: "rgba(0,0,0,0.10)",
    text: "#1a1830",
    text2: "#5a547a",
    text3: "#a09ac0",
    input: "rgba(0,0,0,0.04)",
    inputBorder: "rgba(0,0,0,0.13)",
    aiBg: "rgba(124,58,237,0.06)",
    aiBorder: "rgba(124,58,237,0.18)",
    skillHaveBg: "rgba(34,197,94,0.07)",
    skillHaveBorder: "rgba(34,197,94,0.22)",
    skillHaveText: "#16a34a",
    skillNeedBg: "rgba(124,58,237,0.07)",
    skillNeedBorder: "rgba(124,58,237,0.22)",
    skillNeedText: "#7c3aed",
    toggleTrackOff: "rgba(0,0,0,0.13)",
  }
}

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
      fontFamily: "'JetBrains Mono',monospace",
    }}>
      {u.emoji || initials(u.name)}
    </div>
  );
}

// ── Inline label ──────────────────────────────────────────────────────────────
function Lbl({ children, T }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, letterSpacing: "1.2px",
      textTransform: "uppercase", color: T.text3, marginBottom: 5,
      fontFamily: "'JetBrains Mono',monospace",
    }}>
      {children}
    </div>
  );
}

// ── Shared button base ────────────────────────────────────────────────────────
const btn = {
  border: "none", cursor: "pointer",
  fontFamily: "'Inter',sans-serif",
  transition: "filter 0.15s ease, border-color 0.15s ease, background 0.15s ease",
};

// ── Theme Toggle ──────────────────────────────────────────────────────────────
function ThemeToggle({ dark, toggleDark, T }) {
  return (
    <button
      className="mig-btn"
      onClick={toggleDark}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        ...btn,
        display: "flex", alignItems: "center", gap: 7,
        background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        border: `1px solid ${T.cardBorder}`,
        borderRadius: 99, padding: "6px 12px 6px 8px",
        color: T.text2, fontSize: 12, fontWeight: 600,
      }}
    >
      <span style={{
        width: 28, height: 16, borderRadius: 8, position: "relative",
        background: dark ? "#7c3aed" : T.toggleTrackOff,
        transition: "background .25s", display: "inline-block", flexShrink: 0,
      }}>
        <span style={{
          position: "absolute", top: 2, left: dark ? 14 : 2,
          width: 12, height: 12, borderRadius: "50%", background: "white",
          transition: "left .22s cubic-bezier(.34,1.56,.64,1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }} />
      </span>
      {dark ? <Moon style={iconSize(13, 15)} /> : <Sun style={iconSize(13, 15)} />}
    </button>
  )
}

// ── Auth modal configs ────────────────────────────────────────────────────────
const MODAL_CONFIGS = {
  connect: { Icon: UserPlus, title: "Connect with Builders", desc: "Sign up to send connection requests and start collaborating with talented builders worldwide." },
  message: { Icon: MessageSquare, title: "Send a Message", desc: "Join the community to send direct messages, discuss projects, and build real relationships." },
  like: { Icon: Heart, filled: true, title: "Save Builders", desc: "Create an account to like and bookmark builders you want to revisit later." },
  ai: { Icon: Sparkles, title: "Unlock AI Insights", desc: "Get personalized AI-powered match analysis, skill gap breakdowns, and collaboration recommendations." },
  view: { Icon: User, title: "Full Profile Access", desc: "Sign up to view complete profiles, portfolios, and project histories from every builder." },
  search: { Icon: Search, title: "Search & Filter", desc: "Create an account to search by name, role, or skill and filter builders by availability and goals." },
  filter: { Icon: Settings, title: "Advanced Filters", desc: "Sign up to use skill filters, role filters, online status, and custom sorting options." },
};

// ── Auth Modal ────────────────────────────────────────────────────────────────
function AuthModal({ type, userName, onClose, T }) {
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
          background: T.card,
          border: `1px solid rgba(124,58,237,0.32)`,
          borderRadius: 14, padding: "36px 32px",
          width: "100%", maxWidth: 400, position: "relative",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          fontFamily: "'Inter',sans-serif",
        }}
      >
        <button className="mig-btn" onClick={onClose} style={{ ...btn, position: "absolute", top: 14, right: 16, background: "transparent", color: T.text3, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X style={iconSize(16, 18)} />
        </button>

        <div style={{ width: 56, height: 56, borderRadius: 10, background: "rgba(124,58,237,0.14)", border: "1px solid rgba(124,58,237,0.28)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <cfg.Icon style={iconSize(24, 27)} color="#a78bfa" fill={cfg.filled ? "#a78bfa" : "none"} />
        </div>

        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 24, color: T.text, marginBottom: 8, letterSpacing: "-0.5px" }}>{cfg.title}</div>
        <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.65, marginBottom: 20 }}>{cfg.desc}</p>

        {userName && (
          <div style={{ background: "rgba(124,58,237,0.09)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 8, padding: "9px 14px", fontSize: 12, color: "#a78bfa", marginBottom: 22, display: "flex", gap: 8, alignItems: "center" }}>
            <Sparkles style={iconSize(12, 14)} /><span>{cfg.title} · {userName}</span>
          </div>
        )}

        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: T.text3, marginBottom: 12 }}>Get started — it's free</div>

        <Link href={"/signup"}>
          <button className="mig-btn" style={{ ...btn, width: "100%", padding: 13, background: "#7c3aed", border: "1px solid #7c3aed", color: "white", borderRadius: 8, fontSize: 14, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Rocket style={iconSize(15, 17)} /> Create Free Account
          </button>
        </Link>

        <div style={{ position: "relative", textAlign: "center", fontSize: 12, color: T.text3, margin: "4px 0 10px" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: T.cardBorder }} />
          <span style={{ position: "relative", background: T.card, padding: "0 12px" }}>or</span>
        </div>

        <Link href={"/signin"}>
          <button className="mig-btn" style={{ ...btn, width: "100%", padding: 12, background: "transparent", border: `1px solid ${T.cardBorder}`, color: T.text2, borderRadius: 8, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
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
function GridCard({ u, i, openAuth, T }) {
  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.cardBorder}`,
        borderRadius: 10, padding: 20,
        position: "relative", overflow: "hidden",
        transition: "border-color 0.15s ease",
        fontFamily: "'Inter',sans-serif",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "rgba(124,58,237,0.26)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = T.cardBorder;
      }}
    >
      <div style={{ position: "absolute", top: -20, right: -20, width: 110, height: 110, borderRadius: "50%", background: `radial-gradient(circle,${hsla(u.hue, 0.07)} 0%,transparent 70%)`, pointerEvents: "none" }} />
      <div onClick={() => openAuth("view", u.name)} style={{ position: "absolute", inset: 0, zIndex: 1, cursor: "pointer", borderRadius: 10 }} />

      {/* Top row */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12, position: "relative", zIndex: 2 }}>
        <div style={{ position: "relative" }}>
          <Avatar u={u} size={48} radius={13} />
          <div style={{ position: "absolute", bottom: -1, right: -1, width: 9, height: 9, borderRadius: "50%", background: u.online ? "#22c55e" : T.text3, border: `2px solid ${T.card}` }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>@{u.handle}</div>
          <div style={{ fontSize: 11, color: hsl(u.hue), fontWeight: 600, marginTop: 2 }}>{u.role}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 26, color: scoreColor(u.matchScore), lineHeight: 1 }}>{u.matchScore}%</div>
          <div style={{ fontSize: 9, color: T.text3, marginTop: 1 }}>match</div>
        </div>
      </div>

      {/* Match bar */}
      <div style={{ height: 3, background: T.input, borderRadius: 99, overflow: "hidden", marginBottom: 12, position: "relative", zIndex: 2 }}>
        <div style={{ height: "100%", width: `${u.matchScore}%`, background: `linear-gradient(90deg,hsl(${u.hue},65%,40%),hsl(${u.hue},75%,62%))`, borderRadius: 99 }} />
      </div>

      <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.6, marginBottom: 12, position: "relative", zIndex: 2 }}>{u.bio}</p>

      <div style={{ marginBottom: 8, position: "relative", zIndex: 2 }}>
        <Lbl T={T}>Has</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {u.skill_have?.map(s => (
            <span key={s} style={{ fontFamily: "'JetBrains Mono',monospace", padding: "3px 9px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }}>{s}</span>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12, position: "relative", zIndex: 2 }}>
        <Lbl T={T}>Needs</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {u.skillsNeed.map(s => (
            <span key={s} style={{ fontFamily: "'JetBrains Mono',monospace", padding: "3px 9px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText }}>{s}</span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", position: "relative", zIndex: 2 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: T.text3 }}><MapPin style={iconSize(11, 13)} /> {u.location}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: T.text3 }}><Folder style={iconSize(11, 13)} /> {u.projects} projects</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: T.text3 }}><Star style={iconSize(11, 13)} /> {u.followers}</span>
      </div>

      <div style={{ marginBottom: 14, position: "relative", zIndex: 2 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: hsla(u.hue, 0.12), border: `1px solid ${hsla(u.hue, 0.25)}`, color: hsl(u.hue) }}>
          Seeking {u.lookingFor}
        </span>
      </div>

      <div style={{ display: "flex", gap: 6, position: "relative", zIndex: 3 }}>
        <button className="mig-btn" onClick={() => openAuth("connect", u.name)} style={{ ...btn, flex: 1, padding: "9px", background: "#7c3aed", border: "1px solid #7c3aed", color: "white", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
          Connect
        </button>
        <button className="mig-btn" onClick={() => openAuth("like", u.name)} style={{ ...btn, padding: "9px 11px", background: "transparent", border: `1px solid ${T.cardBorder}`, color: T.text3, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><Heart style={iconSize(14, 16)} fill="none" /></button>
        <button className="mig-btn" onClick={() => openAuth("ai", u.name)} style={{ ...btn, padding: "9px 11px", background: "transparent", border: `1px solid ${T.cardBorder}`, color: T.text3, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><Sparkles style={iconSize(13, 15)} /></button>
        <button className="mig-btn" onClick={() => openAuth("message", u.name)} style={{ ...btn, padding: "9px 11px", background: "transparent", border: `1px solid ${T.cardBorder}`, color: T.text3, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><MessageSquare style={iconSize(13, 15)} /></button>
        <button className="mig-btn" onClick={() => openAuth("view", u.name)} style={{ ...btn, padding: "9px 11px", background: "transparent", border: `1px solid ${T.cardBorder}`, color: T.text3, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><ExternalLink style={iconSize(13, 15)} /></button>
      </div>
    </div>
  );
}

// ── List Card ─────────────────────────────────────────────────────────────────
function ListCard({ u, i, openAuth, T }) {
  return (
    <div
      style={{
        background: T.card, border: `1px solid ${T.cardBorder}`,
        borderRadius: 10, padding: "14px 18px",
        display: "flex", gap: 14, alignItems: "center", position: "relative",
        transition: "border-color 0.15s ease",
        fontFamily: "'Inter',sans-serif",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "rgba(124,58,237,0.24)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = T.cardBorder;
      }}
    >
      <div onClick={() => openAuth("view", u.name)} style={{ position: "absolute", inset: 0, zIndex: 1, cursor: "pointer", borderRadius: 10 }} />

      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar u={u} size={42} radius={11} />
        <div style={{ position: "absolute", bottom: -1, right: -1, width: 8, height: 8, borderRadius: "50%", background: u.online ? "#22c55e" : T.text3, border: `2px solid ${T.card}` }} />
      </div>

      <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{u.name}</span>
          <span style={{ fontSize: 11, color: hsl(u.hue), fontWeight: 600 }}>{u.role}</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: hsla(u.hue, 0.1), border: `1px solid ${hsla(u.hue, 0.22)}`, color: hsl(u.hue) }}>{u.lookingFor}</span>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {u.skill_have?.slice(0, 3).map(s => <span key={s} style={{ fontFamily: "'JetBrains Mono',monospace", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }}>{s}</span>)}
          {u.skillsNeed.slice(0, 2).map(s => <span key={s} style={{ fontFamily: "'JetBrains Mono',monospace", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText }}>{s}</span>)}
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0, position: "relative", zIndex: 2 }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 22, color: scoreColor(u.matchScore), lineHeight: 1 }}>{u.matchScore}%</div>
        <div style={{ fontSize: 10, color: T.text3 }}>match</div>
      </div>

      <div style={{ display: "flex", gap: 6, flexShrink: 0, position: "relative", zIndex: 3 }}>
        <button className="mig-btn" onClick={() => openAuth("connect", u.name)} style={{ ...btn, padding: "7px 14px", background: "#7c3aed", border: "1px solid #7c3aed", color: "white", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Connect</button>
        <button className="mig-btn" onClick={() => openAuth("message", u.name)} style={{ ...btn, padding: "7px 10px", background: "transparent", border: `1px solid ${T.cardBorder}`, color: T.text3, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><MessageSquare style={iconSize(12, 14)} /></button>
        <button className="mig-btn" onClick={() => openAuth("view", u.name)} style={{ ...btn, padding: "7px 10px", background: "transparent", border: `1px solid ${T.cardBorder}`, color: T.text3, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><ExternalLink style={iconSize(12, 14)} /></button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DiscoverTab() {
  const { dark, toggleDark } = useThemeStore()

  // Derive reactive theme from store value
  const T = makeTheme(dark)

  const [view, setView] = useState("grid");
  const [authModal, setAuthModal] = useState(null);

  // Font injection
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
    fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap";
    document.head.appendChild(fontLink);

    const style = document.createElement("style");
    style.setAttribute("data-discover-preview", "1");
    style.textContent = `
      [data-discover-preview-root] * { box-sizing: border-box; }
      [data-discover-preview-root] input,
      [data-discover-preview-root] textarea,
      [data-discover-preview-root] select,
      [data-discover-preview-root] button { font-family: 'Inter', sans-serif; }
      [data-discover-preview-root] ::-webkit-scrollbar { width: 4px; }
      [data-discover-preview-root] ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 6px; }
      [data-discover-preview-root] .mig-btn:hover { filter: brightness(1.1); }
      [data-discover-preview-root] .mig-btn:active { filter: brightness(0.95); }
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
        fontFamily: "'Inter',sans-serif",
        boxSizing: "border-box",
        transition: "background .3s, color .3s",
      }}
    >

      {/* ── Preview Banner ── */}
      <div style={{ background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 10, padding: "11px 16px", marginBottom: 22, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 13, color: T.text2 }}>
        <Eye style={iconSize(15, 17)} />
        <span><strong style={{ color: "#a78bfa" }}>Preview Mode</strong> — You're browsing as a guest. Sign up to connect, message, and get AI insights.</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {/* ── Theme Toggle in banner ── */}
          <ThemeToggle dark={dark} toggleDark={toggleDark} T={T} />
          <button className="mig-btn" onClick={() => openAuth("connect")} style={{ ...btn, padding: "7px 16px", background: "#7c3aed", border: "1px solid #7c3aed", color: "white", borderRadius: 8, fontSize: 12, fontWeight: 700, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
            Sign Up Free <ArrowRight style={iconSize(12, 14)} />
          </button>
        </div>
      </div>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, gap: 14, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#7c3aed", marginBottom: 7, display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", display: "inline-block" }} />
            Live Matching
          </div>
          <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 30, color: T.text, letterSpacing: "-1px", lineHeight: 1.1, margin: 0 }}>Discover Builders</h1>
          <p style={{ fontSize: 13, color: T.text3, marginTop: 5 }}>{users.length} builders ranked by match score</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["grid", "list"].map(v => (
            <button className="mig-btn" key={v} onClick={() => setView(v)} style={{ ...btn, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: view === v ? "rgba(124,58,237,0.15)" : "transparent", border: `1px solid ${view === v ? "rgba(124,58,237,0.4)" : T.cardBorder}`, color: view === v ? "#a78bfa" : T.text3, display: "inline-flex", alignItems: "center", gap: 6 }}>
              {v === "grid" ? <><LayoutGrid style={iconSize(12, 14)} /> Grid</> : <><List style={iconSize(12, 14)} /> List</>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 180px", minWidth: 140 }}>
          <Search style={{ ...iconSize(13, 15), position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.text3, pointerEvents: "none" }} />
          <input
            placeholder="Search name, role, skill…"
            readOnly
            onClick={() => openAuth("search")}
            style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text2, borderRadius: 8, fontSize: 13, outline: "none", padding: "9px 14px 9px 34px", width: "100%", cursor: "pointer", boxSizing: "border-box" }}
          />
        </div>
        {[
          { label: "All Skills", opts: ["All Skills", ...SKILLS_ALL] },
          { label: "All Roles", opts: ["All Roles", "Collaborator", "Mentor", "Mentee"] },
          { label: "Sort: Match %", opts: ["Sort: Match %", "Sort: Followers", "Sort: Projects", "Sort: Online First"] },
        ].map(({ label, opts }) => (
          <select
            key={label}
            onClick={() => openAuth("filter")}
            onChange={e => { e.target.selectedIndex = 0; openAuth("filter"); }}
            style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text2, padding: "9px 12px", borderRadius: 8, fontSize: 12, outline: "none", cursor: "pointer" }}
          >
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <button
          className="mig-btn"
          onClick={() => openAuth("filter")}
          style={{ ...btn, padding: "8px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "transparent", border: `1px solid ${T.cardBorder}`, color: T.text3, display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", flexShrink: 0 }} />
          Online only
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
          <div key={i} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: "10px 18px", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 21, color: T.text }}>{s.v}</span>
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
            ? <ListCard key={u.id} u={u} i={i} openAuth={openAuth} T={T} />
            : <GridCard key={u.id} u={u} i={i} openAuth={openAuth} T={T} />
        )}
      </div>

      {/* ── Auth Modal ── */}
      {authModal && (
        <AuthModal type={authModal.type} userName={authModal.userName} onClose={closeAuth} T={T} />
      )}
    </div>
  );
}