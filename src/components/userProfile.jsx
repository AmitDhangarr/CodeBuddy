"use client";
/**
 * UserFullProfile
 * ──────────────────────────────────────────────────────────────
 * Full-screen overlay that mirrors ProfileTab layout but renders
 * live data for any user selected in the Discover tab.
 *
 * Props:
 *   user          – normalised profile object from DiscoverTab
 *   currentUser   – logged-in user (for match score context)
 *   T             – theme token object
 *   dark          – boolean
 *   onClose       – () => void
 *   onConnect     – (user) => void
 *   onFavourite   – (user) => void
 *   onMessage     – (user) => void
 *   onBlock       – (user) => void
 *   scoreColor    – (score: number) => cssColor
 *   calculateMatchScore – (a, b) => number   (from shared)
 *   Avatar        – component  (from shared)
 *   Lbl           – component  (from shared)
 *   hsl           – fn (from shared)
 *   hsla          – fn (from shared)
 */

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── tiny helpers (safe if shared imports aren't threaded through) ─────── */
const _hsl  = (h, s = 70, l = 55) => `hsl(${h},${s}%,${l}%)`;
const _hsla = (h, s = 70, l = 55, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

function _Avatar({ u, size = 48, radius = 14, dark }) {
  const isEmoji = u.avatar && u.avatar.length <= 2 && /\p{Emoji}/u.test(u.avatar);
  const isInitials = !isEmoji;
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: `linear-gradient(135deg,${_hsla(u.hue, 60, dark ? 22 : 78, 1)},${_hsla(u.hue, 50, dark ? 15 : 85, 1)})`,
      border: `1.5px solid ${_hsla(u.hue, 60, 55, 0.3)}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: isEmoji ? size * 0.5 : size * 0.38,
      fontWeight: 700, color: _hsl(u.hue, 55, dark ? 75 : 35),
      fontFamily: "'Instrument Serif',serif",
      boxShadow: `0 4px 16px ${_hsla(u.hue, 60, 50, 0.15)}`,
    }}>
      {u.avatar || u.name?.[0] || "?"}
    </div>
  );
}

function _Lbl({ T, children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: T.text3, marginBottom: 8 }}>
      {children}
    </div>
  );
}

/* ─── Status button (self-contained) ───────────────────────────────────── */
function StatusButton({ connectionStatus, onClick, extraStyle = {} }) {
  const [hov, setHov] = useState(false);
  const cfg = {
    null: { label: "Connect", style: { background: "linear-gradient(135deg,#7c3aed,#a855f7)", border: "none", color: "#fff", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }, hoverLabel: null, hoverStyle: null },
    pending: { label: "⏳ Pending", style: { background: "transparent", border: "1px solid rgba(245,158,11,0.35)", color: "#f59e0b" }, hoverLabel: "✕ Cancel", hoverStyle: { background: "rgba(245,158,11,0.08)" } },
    accepted: { label: "✓ Connected", style: { background: "transparent", border: "1px solid rgba(74,222,128,0.35)", color: "#4ade80" }, hoverLabel: "✕ Disconnect", hoverStyle: { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" } },
    blocked: { label: "⊘ Blocked", style: { background: "transparent", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" }, hoverLabel: "↩ Unblock", hoverStyle: { background: "rgba(239,68,68,0.08)" } },
  }[connectionStatus] ?? { label: "Connect", style: { background: "linear-gradient(135deg,#7c3aed,#a855f7)", border: "none", color: "#fff", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }, hoverLabel: null, hoverStyle: null };

  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        padding: "9px 20px", borderRadius: 11, cursor: "pointer",
        fontFamily: "'Instrument Sans',sans-serif", fontSize: 13, fontWeight: 700,
        transition: "all 0.2s",
        ...(hov && cfg.hoverStyle ? { ...cfg.style, ...cfg.hoverStyle } : cfg.style),
        ...extraStyle,
      }}
    >
      {hov && cfg.hoverLabel ? cfg.hoverLabel : cfg.label}
    </button>
  );
}

/* ─── Resizable AI box ──────────────────────────────────────────────────── */
function ResizableAIBox({ text, dark, T }) {
  const [h, setH] = useState(90);
  const [drag, setDrag] = useState(false);
  const startY = useRef(0), startH = useRef(0);

  useEffect(() => {
    if (!drag) return;
    const mv = (e) => setH(Math.max(60, Math.min(260, startH.current + (e.clientY - startY.current))));
    const up = () => setDrag(false);
    window.addEventListener("mousemove", mv);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
  }, [drag]);

  return (
    <div style={{
      background: dark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.04)",
      border: `1px solid ${dark ? "rgba(124,58,237,0.22)" : "rgba(124,58,237,0.15)"}`,
      borderRadius: 13, height: h, position: "relative", overflow: "hidden",
      transition: drag ? "none" : "height 0.1s",
    }}>
      <div style={{ padding: "12px 14px", height: "100%", overflowY: "auto", boxSizing: "border-box" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", marginBottom: 6, letterSpacing: "1px" }}>✦ AI MATCH INSIGHT</div>
        <p style={{ fontSize: 12, color: dark ? "#b0a8d8" : "#6b5b9e", lineHeight: 1.65, margin: 0 }}>{text}</p>
      </div>
      <div
        onMouseDown={(e) => { e.preventDefault(); startY.current = e.clientY; startH.current = h; setDrag(true); }}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 12,
          cursor: "ns-resize", display: "flex", alignItems: "center", justifyContent: "center",
          background: drag ? (dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.07)") : "transparent",
        }}
      >
        <div style={{ width: 32, height: 3, borderRadius: 99, background: dark ? "rgba(167,139,250,0.3)" : "rgba(124,58,237,0.2)" }} />
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function UserFullProfile({
  user,
  currentUser,
  T, dark,
  onClose,
  onConnect,
  onFavourite,
  onMessage,
  onBlock,
  scoreColor: _scoreColor,
  calculateMatchScore,
  /* allow caller to pass shared helpers or fall back to built-ins */
  Avatar: AvatarProp,
  Lbl: LblProp,
  hsl: hslProp,
  hsla: hslaProp,
}) {
  const Avatar = AvatarProp || _Avatar;
  const Lbl    = LblProp    || _Lbl;
  const hsl    = hslProp    || _hsl;
  const hsla   = hslaProp   || _hsla;
  const scoreColor = _scoreColor || ((s) => s >= 80 ? "#4ade80" : s >= 60 ? "#a78bfa" : s >= 40 ? "#f59e0b" : "#f87171");

  const [tab, setTab] = useState("projects");
  const [aiText, setAiText] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [localUser, setLocalUser] = useState(user);

  // Keep local copy in sync with parent updates (connect/fav/block)
  useEffect(() => { setLocalUser(user); }, [user]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Esc to close
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  // Derived data from the user object
  const u = localUser;
  const heatmap = Array.from({ length: 35 }, (_, i) => ({
    day: i,
    count: ((u.id?.charCodeAt?.(i % (u.id?.length || 1)) ?? i) + i) % 5,
  }));
  const heatColor = (c) => {
    if (c === 0) return dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    if (c === 1) return dark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.1)";
    if (c === 2) return dark ? "rgba(124,58,237,0.3)"  : "rgba(124,58,237,0.2)";
    if (c === 3) return dark ? "rgba(124,58,237,0.5)"  : "rgba(124,58,237,0.35)";
    return           dark ? "rgba(124,58,237,0.75)"  : "rgba(124,58,237,0.6)";
  };

  const projects = Array.isArray(u.projectsList) && u.projectsList.length
    ? u.projectsList
    : Array.from({ length: Math.max(1, typeof u.projects === "number" ? Math.min(u.projects, 4) : 2) }, (_, i) => ({
        n: [`AI ${u.role} Tool`, `${u.name.split(" ")[0]}'s CLI`, "Open Source Lib", "Dev Dashboard"][i] ?? `Project ${i + 1}`,
        d: `A project by ${u.name} showcasing ${(u.skillsHave || []).slice(0, 2).join(" & ") || "their work"}.`,
        tags: (u.skillsHave || []).slice(0, 3),
        stars: ((u.followers ?? 10) + i * 7) % 80,
        forks: ((u.followers ?? 4) + i * 3) % 24,
        status: i === 0 ? "Live" : "Building",
        img: ["🗂", "🎨", "🔧", "📦"][i] ?? "📁",
      }));

  const endorsements = Array.isArray(u.endorsements) && u.endorsements.length
    ? u.endorsements
    : (u.skillsHave || []).slice(0, 2).map((skill, i) => ({
        fromName: ["A collaborator", "A mentor"][i] ?? "A peer",
        fromInitial: ["AC", "MK"][i] ?? "PX",
        fromHue: [200, 340][i] ?? 120,
        skill,
        note: `${u.name} demonstrates exceptional proficiency in ${skill}. A true expert worth collaborating with.`,
      }));

  const activity = Array.isArray(u.activity) && u.activity.length
    ? u.activity
    : [
        { a: "Joined", t: "SkillMatch Network", time: "recently", hue: 259, icon: "✦" },
        { a: "Added skill:", t: (u.skillsHave || ["React"])[0], time: "recently", hue: 158, icon: "⚡" },
        { a: "Seeking", t: (u.skillsNeed || ["a collaborator"])[0], time: "now", hue: 38, icon: "🔍" },
        { a: "Looking for", t: u.lookingFor ?? "Collaborator", time: "now", hue: u.hue, icon: "🤝" },
      ];

  const connections = Array.isArray(u.connections) ? u.connections : [];

  const matchScore = u.matchScore ?? (calculateMatchScore ? calculateMatchScore(currentUser ?? {}, u) : 0);

  const handleAI = useCallback(async () => {
    if (aiLoading || aiText) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai_insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Give a concise collaboration insight for two builders.
Me: skills=${currentUser?.skillsHave?.join(", ")}, needs=${currentUser?.skillsNeed?.join(", ")}.
Them: name=${u.name}, skills=${u.skillsHave?.join(", ")}, needs=${u.skillsNeed?.join(", ")}, projects=${u.projects}, looking for=${u.lookingFor}.
Keep it 2-3 sentences, be specific and encouraging.`,
        }),
      });
      const data = await res.json();
      setAiText(data.response ?? "Could not load insight.");
    } catch {
      setAiText("Could not load insight.");
    } finally {
      setAiLoading(false);
    }
  }, [aiLoading, aiText, currentUser, u]);

  const wrapConnect  = () => { onConnect?.(u);   setLocalUser(prev => ({ ...prev, connectionStatus: prev.connectionStatus ? null : "pending" })); };
  const wrapFavourite = () => { onFavourite?.(u); setLocalUser(prev => ({ ...prev, isFavourited: !prev.isFavourited })); };
  const wrapBlock    = () => { onBlock?.(u);      setLocalUser(prev => ({ ...prev, connectionStatus: prev.connectionStatus === "blocked" ? null : "blocked" })); };

  return (
    <>
      <style>{`
        @keyframes fpSlideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fpFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .fp-scroll::-webkit-scrollbar { width: 5px; }
        .fp-scroll::-webkit-scrollbar-track { background: transparent; }
        .fp-scroll::-webkit-scrollbar-thumb { background: ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"}; border-radius: 99px; }
        .fp-tab-btn:hover { background: ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)"} !important; }
        .fp-proj-card:hover { border-color: ${hsla(u.hue, 60, 55, 0.35)} !important; transform: translateY(-1px); }
        .fp-action-btn:hover { opacity: 0.85; }
      `}</style>

      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(10px)",
          zIndex: 600,
          animation: "fpFadeIn 0.2s ease",
        }}
      />

      {/* ── Panel ── */}
      <div
        className="fp-scroll"
        style={{
          position: "fixed",
          top: 0, right: 0, bottom: 0,
          width: "min(680px, 100vw)",
          background: dark ? "#09090f" : "#f7f7fc",
          borderLeft: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)"}`,
          zIndex: 601,
          overflowY: "auto",
          animation: "fpSlideUp 0.28s cubic-bezier(0.34,1.4,0.64,1)",
          boxShadow: "-24px 0 80px rgba(0,0,0,0.35)",
        }}
      >
        {/* ── Banner ── */}
        <div style={{
          height: 130, position: "relative", overflow: "hidden",
          background: `linear-gradient(135deg, hsl(${u.hue},55%,${dark ? "13%" : "82%"}), hsl(${(u.hue + 70) % 360},45%,${dark ? "9%" : "88%"}))`,
          flexShrink: 0,
        }}>
          {/* Ambient orb */}
          <div style={{
            position: "absolute", right: -40, top: -40, width: 200, height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${hsla(u.hue, 80, 65, 0.22)}, transparent 70%)`,
          }} />
          <div style={{
            position: "absolute", left: 60, bottom: -30, width: 140, height: 140,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${hsla((u.hue + 120) % 360, 70, 60, 0.12)}, transparent 70%)`,
          }} />

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 14, right: 16,
              width: 34, height: 34, borderRadius: "50%",
              background: dark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.55)",
              border: "none", cursor: "pointer", fontSize: 17,
              color: T.text, display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)", transition: "all 0.2s",
            }}
          >✕</button>

          {/* Online dot */}
          <div style={{
            position: "absolute", top: 14, left: 16,
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 99,
            background: dark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.55)",
            backdropFilter: "blur(4px)",
            fontSize: 11, fontWeight: 700,
            color: u.online ? "#4ade80" : (dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.35)"),
          }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: u.online ? "#22c55e" : "#555570", boxShadow: u.online ? "0 0 6px #22c55e" : "none" }} />
            {u.online ? "Online now" : "Offline"}
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ padding: "0 28px 40px" }}>

          {/* Avatar + name row (overlapping banner) */}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginTop: -36, marginBottom: 22 }}>
            <div style={{ border: `3px solid ${dark ? "#09090f" : "#f7f7fc"}`, borderRadius: 20, flexShrink: 0 }}>
              <Avatar u={u} size={72} radius={18} T={T} dark={dark} />
            </div>
            <div style={{ flex: 1, paddingBottom: 6 }}>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: T.text, lineHeight: 1.15, letterSpacing: "-0.4px" }}>{u.name}</div>
              <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>@{u.handle} · {u.role}</div>
              <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>📍 {u.location || "Location not set"}</div>
            </div>
            <div style={{ textAlign: "right", paddingBottom: 6 }}>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: scoreColor(matchScore), lineHeight: 1 }}>{matchScore}%</div>
              <div style={{ fontSize: 10, color: T.text3 }}>match score</div>
            </div>
          </div>

          {/* Match bar */}
          <div style={{ height: 4, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)", borderRadius: 99, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ height: "100%", width: `${matchScore}%`, background: `linear-gradient(90deg,hsl(${u.hue},70%,40%),hsl(${u.hue},80%,65%))`, borderRadius: 99, transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)" }} />
          </div>

          {/* Status chips */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
            <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}>● Open to Collaborate</span>
            {u.lookingFor && <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: `${hsla(u.hue, 70, 60, dark ? 0.12 : 0.08)}`, border: `1px solid ${hsla(u.hue, 70, 60, 0.25)}`, color: hsl(u.hue) }}>Seeking {u.lookingFor}</span>}
            {u.connectionStatus && (
              <span style={{
                padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                background: u.connectionStatus === "accepted" ? "rgba(74,222,128,0.08)" : u.connectionStatus === "pending" ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${u.connectionStatus === "accepted" ? "rgba(74,222,128,0.25)" : u.connectionStatus === "pending" ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"}`,
                color: u.connectionStatus === "accepted" ? "#4ade80" : u.connectionStatus === "pending" ? "#f59e0b" : "#f87171",
              }}>
                {u.connectionStatus === "accepted" ? "✓ Connected" : u.connectionStatus === "pending" ? "⏳ Request Sent" : "⊘ Blocked"}
              </span>
            )}
          </div>

          {/* Bio */}
          <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.72, marginBottom: 22 }}>{u.bio || "No bio provided."}</p>

          {/* Stats row */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)",
            background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)",
            borderRadius: 16, border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
            overflow: "hidden", marginBottom: 22,
          }}>
            {[
              { v: typeof u.projects === "number" ? u.projects : Array.isArray(u.projects) ? u.projects.length : "—", l: "Projects" },
              { v: u.followers ?? "—", l: "Followers" },
              { v: matchScore + "%", l: "Match" },
              { v: u.online ? "Now" : "Away", l: "Status" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "16px 8px", textAlign: "center",
                borderRight: i < 3 ? `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}` : "none",
              }}>
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: T.text, lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
            <div style={{ background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: 14, padding: 16, border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
              <Lbl T={T}>Skills</Lbl>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {(u.skillsHave || []).map(s => (
                  <span key={s} style={{ padding: "4px 10px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }}>{s}</span>
                ))}
                {!(u.skillsHave || []).length && <span style={{ fontSize: 11, color: T.text3 }}>None listed</span>}
              </div>
            </div>
            <div style={{ background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: 14, padding: 16, border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
              <Lbl T={T}>Needs</Lbl>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {(u.skillsNeed || []).map(s => (
                  <span key={s} style={{ padding: "4px 10px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText }}>{s}</span>
                ))}
                {!(u.skillsNeed || []).length && <span style={{ fontSize: 11, color: T.text3 }}>None listed</span>}
              </div>
            </div>
          </div>

          {/* AI Insight */}
          {aiText ? (
            <div style={{ marginBottom: 22 }}>
              <ResizableAIBox text={aiText} dark={dark} T={T} />
            </div>
          ) : (
            <button
              onClick={handleAI}
              disabled={aiLoading}
              style={{
                width: "100%", marginBottom: 22, padding: "10px",
                borderRadius: 12, border: `1px dashed ${dark ? "rgba(124,58,237,0.35)" : "rgba(124,58,237,0.3)"}`,
                background: dark ? "rgba(124,58,237,0.04)" : "rgba(124,58,237,0.03)",
                color: "#a78bfa", cursor: aiLoading ? "wait" : "pointer",
                fontFamily: "'Instrument Sans',sans-serif", fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s",
              }}
            >
              {aiLoading
                ? <><span style={{ display: "inline-block", animation: "spin 0.9s linear infinite" }}>✦</span> Generating insight…</>
                : <>✦ Generate AI Match Insight</>}
            </button>
          )}

          {/* Activity heatmap */}
          <div style={{ background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: 14, padding: 16, border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, marginBottom: 22 }}>
            <Lbl T={T}>Activity (last 5 weeks)</Lbl>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
              {["M","T","W","T","F","S","S"].map((d, i) => (
                <div key={i} style={{ fontSize: 9, color: T.text3, textAlign: "center", marginBottom: 2 }}>{d}</div>
              ))}
              {heatmap.map((cell, i) => (
                <div key={i} title={`${cell.count} contributions`} style={{ height: 14, borderRadius: 3, background: heatColor(cell.count), cursor: "default", transition: "transform 0.1s" }} />
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: 16, border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, overflow: "hidden" }}>
            {/* Tab bar */}
            <div style={{ display: "flex", gap: 2, padding: "10px 10px 0", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
              {["projects", "endorsements", "activity", "connections"].map(t => (
                <button
                  key={t}
                  className="fp-tab-btn"
                  onClick={() => setTab(t)}
                  style={{
                    background: tab === t ? (dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)") : "transparent",
                    border: "none", color: tab === t ? T.text : T.text3,
                    cursor: "pointer", fontFamily: "inherit", fontSize: 12,
                    fontWeight: tab === t ? 700 : 500,
                    padding: "8px 14px", borderRadius: "8px 8px 0 0",
                    transition: "all 0.2s", textTransform: "capitalize",
                    borderBottom: tab === t ? `2px solid ${hsl(u.hue, 65, 58)}` : "2px solid transparent",
                  }}
                >{t}</button>
              ))}
            </div>

            <div style={{ padding: 18 }}>

              {/* Projects tab */}
              {tab === "projects" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {projects.map((p, i) => (
                    <div key={i} className="fp-proj-card" style={{
                      padding: 16, background: dark ? "rgba(255,255,255,0.02)" : "#fff",
                      borderRadius: 13, border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
                      transition: "all 0.2s", cursor: "default",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <span style={{ fontSize: 22 }}>{p.img ?? "📁"}</span>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{p.n}</div>
                            <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>github.com/{u.handle ?? "user"}/{p.n.toLowerCase().replace(/ /g, "-")}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: p.status === "Live" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${p.status === "Live" ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)"}`, color: p.status === "Live" ? "#4ade80" : "#fbbf24" }}>{p.status ?? "Active"}</span>
                          <span style={{ fontSize: 11, color: T.text3 }}>★ {p.stars ?? 0}</span>
                          <span style={{ fontSize: 11, color: T.text3 }}>⑂ {p.forks ?? 0}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 10 }}>{p.d}</p>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {(p.tags || []).map(tag => (
                          <span key={tag} style={{ padding: "2px 9px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: T.text2 }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Endorsements tab */}
              {tab === "endorsements" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {endorsements.map((e, i) => (
                    <div key={i} style={{ padding: 16, background: dark ? "rgba(255,255,255,0.02)" : "#fff", borderRadius: 13, border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`, display: "flex", gap: 14, alignItems: "flex-start" }}>
                      {/* endorser avatar */}
                      {e.from
                        ? <Avatar u={e.from} size={38} radius={10} T={T} dark={dark} />
                        : (
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: _hsla(e.fromHue ?? u.hue, 60, dark ? 22 : 78), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: _hsl(e.fromHue ?? u.hue, 55, dark ? 75 : 35), flexShrink: 0 }}>
                            {e.fromInitial ?? "??"}
                          </div>
                        )
                      }
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{e.from?.name?.split(" ")[0] ?? e.fromName ?? "A collaborator"}</span>
                          <span style={{ fontSize: 11, color: T.text3 }}>endorsed for</span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }}>{e.skill}</span>
                        </div>
                        <p style={{ fontSize: 12, color: T.text2, fontStyle: "italic", lineHeight: 1.55 }}>"{e.note}"</p>
                      </div>
                    </div>
                  ))}
                  <div style={{ textAlign: "center", padding: "16px", color: T.text3, fontSize: 12 }}>
                    Connect with {u.name.split(" ")[0]} to exchange endorsements
                  </div>
                </div>
              )}

              {/* Activity tab */}
              {tab === "activity" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {activity.map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 13px", background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: 11 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: _hsla(a.hue, 70, 60, dark ? 0.1 : 0.08), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{a.icon}</div>
                      <span style={{ fontSize: 12, color: T.text2, flex: 1 }}>{a.a} <span style={{ color: T.text, fontWeight: 600 }}>{a.t}</span></span>
                      <span style={{ fontSize: 10, color: T.text3 }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Connections tab */}
              {tab === "connections" && (
                connections.length ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {connections.map((c, i) => (
                      <div key={c.id ?? i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", background: dark ? "rgba(255,255,255,0.02)" : "#fff", borderRadius: 13, border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}` }}>
                        <Avatar u={c} size={36} radius={10} T={T} dark={dark} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{c.name?.split(" ")[0]}</div>
                          <div style={{ fontSize: 10, color: T.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "32px 20px", color: T.text3 }}>
                    <div style={{ fontSize: 30, marginBottom: 10 }}>🤝</div>
                    <div style={{ fontSize: 13, color: T.text2, fontWeight: 600 }}>No connections visible yet</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Connect to see mutual network</div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* ── Sticky action bar ── */}
        <div style={{
          position: "sticky", bottom: 0,
          background: dark ? "rgba(9,9,15,0.92)" : "rgba(247,247,252,0.92)",
          backdropFilter: "blur(14px)",
          borderTop: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
          padding: "14px 28px",
          display: "flex", gap: 10, alignItems: "center",
        }}>
          <StatusButton
            connectionStatus={u.connectionStatus}
            onClick={wrapConnect}
            extraStyle={{ flex: 1 }}
          />
          <button
            onClick={wrapFavourite}
            className="fp-action-btn"
            style={{
              padding: "9px 14px", borderRadius: 11, cursor: "pointer",
              fontFamily: "inherit", fontSize: 16, transition: "all 0.2s",
              background: "transparent",
              border: `1px solid ${u.isFavourited ? "rgba(248,113,113,0.35)" : dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"}`,
              color: u.isFavourited ? "#f87171" : T.text3,
            }}
          >{u.isFavourited ? "♥" : "♡"}</button>
          <button
            onClick={() => { onMessage?.(u); }}
            className="fp-action-btn"
            style={{
              padding: "9px 18px", borderRadius: 11, cursor: "pointer",
              fontFamily: "inherit", fontSize: 13, fontWeight: 600,
              background: "transparent",
              border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"}`,
              color: T.text2, transition: "all 0.2s",
            }}
          >💬 Message</button>
          <button
            onClick={wrapBlock}
            className="fp-action-btn"
            style={{
              padding: "9px 12px", borderRadius: 11, cursor: "pointer",
              fontFamily: "inherit", fontSize: 13, transition: "all 0.2s",
              background: "transparent",
              border: `1px solid ${u.connectionStatus === "blocked" ? "rgba(239,68,68,0.4)" : dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"}`,
              color: u.connectionStatus === "blocked" ? "#f87171" : T.text3,
            }}
            title={u.connectionStatus === "blocked" ? "Unblock" : "Block"}
          >⊘</button>
        </div>
      </div>
    </>
  );
}