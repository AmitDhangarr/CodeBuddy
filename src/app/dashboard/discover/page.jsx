"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import UserFullProfile from "../../../components/userProfile.jsx";
import { calculateMatchScore } from "../shared";
import {
  SKILLS_ALL,
  hsl, hsla,
  Avatar, Lbl,
} from "../shared";

const PROFILES_PER_PAGE = 9;

function normalizeProfile(profile) {
  let location = "";
  if (Array.isArray(profile.locations) && profile.locations.length > 0) {
    const loc = profile.locations[0];
    const parts = [loc.city, loc.state, loc.country].filter(Boolean);
    location = parts.join(", ");
  } else if (profile.locations?.city) {
    const parts = [profile.locations.city, profile.locations.state, profile.locations.country].filter(Boolean);
    location = parts.join(", ");
  } else if (profile.location) {
    location = profile.location;
  } else if (profile.city) {
    location = [profile.city, profile.state].filter(Boolean).join(", ");
  }

  const avatar = profile.avatar
    ? profile.avatar
    : (profile.name || "")
      .split(" ")
      .map(w => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return {
    ...profile,
    avatar,
    skillsHave: Array.isArray(profile.skills_have) ? profile.skills_have : [],
    skillsNeed: Array.isArray(profile.skills_need) ? profile.skills_need : [],
    lookingFor: profile.looking_for ?? profile.lookingFor ?? null,
    location,
    projects: Array.isArray(profile.projects) ? profile.projects.length : (profile.projects ?? 0),
    hue: profile.hue ?? ((profile.name?.charCodeAt(0) ?? 0) * 37) % 360,
    online: profile.online ?? false,
    followers: profile.followers ?? 0,
    connectionStatus: profile.isConnected ? "accepted" : null,
    isFavourited: profile.isFavourited ?? false,
  };
}

// ── Status button config ──────────────────────────────────────────────────────
function getStatusConfig(connectionStatus) {
  switch (connectionStatus) {
    case "accepted":
      return {
        label: "✓ Connected",
        style: {
          background: "transparent",
          border: "1px solid rgba(74,222,128,0.35)",
          color: "#4ade80",
        },
        hoverStyle: {
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.35)",
          color: "#f87171",
        },
        hoverLabel: "✕ Disconnect",
      };
    case "pending":
      return {
        label: "⏳ Pending",
        style: {
          background: "transparent",
          border: "1px solid rgba(245,158,11,0.35)",
          color: "#f59e0b",
        },
        hoverStyle: {
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.5)",
          color: "#fbbf24",
        },
        hoverLabel: "✕ Cancel",
      };
    case "blocked":
      return {
        label: "⊘ Blocked",
        style: {
          background: "transparent",
          border: "1px solid rgba(239,68,68,0.35)",
          color: "#f87171",
        },
        hoverStyle: {
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.5)",
          color: "#fca5a5",
        },
        hoverLabel: "↩ Unblock",
      };
    default:
      return {
        label: "Connect",
        style: {
          background: "linear-gradient(135deg,#7c3aed,#a855f7)",
          border: "none",
          color: "white",
          boxShadow: "0 4px 14px rgba(124,58,237,0.28)",
        },
        hoverStyle: null,
        hoverLabel: null,
      };
  }
}

function StatusButton({ connectionStatus, onClick, style: extraStyle = {}, size = "normal" }) {
  const [hovered, setHovered] = useState(false);
  const config = getStatusConfig(connectionStatus);
  const padding = size === "small" ? "6px 14px" : "8px 14px";
  const fontSize = size === "small" ? 12 : 13;

  const currentStyle = hovered && config.hoverStyle ? config.hoverStyle : config.style;
  const currentLabel = hovered && config.hoverLabel ? config.hoverLabel : config.label;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        padding,
        borderRadius: 11,
        cursor: "pointer",
        fontFamily: "'Instrument Sans',sans-serif",
        fontSize,
        fontWeight: 700,
        transition: "all 0.2s",
        ...currentStyle,
        ...extraStyle,
      }}
    >
      {currentLabel}
    </button>
  );
}

// ── Block button (three-dot menu) ─────────────────────────────────────────────
function BlockMenu({ u, onBlock, T, dark }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          padding: "8px 10px", background: "transparent",
          border: `1px solid ${T.border}`, color: T.text3,
          borderRadius: 10, cursor: "pointer", fontSize: 13,
          fontFamily: "inherit", transition: "all 0.2s",
        }}
      >⋯</button>
      {open && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", right: 0,
          background: dark ? "#1a1a2e" : "#fff",
          border: `1px solid ${T.border}`, borderRadius: 12,
          padding: "6px", zIndex: 50, minWidth: 140,
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
        }}>
          <button
            onClick={() => { onBlock(u); setOpen(false); }}
            style={{
              display: "block", width: "100%", padding: "8px 12px",
              background: "transparent", border: "none", color: "#f87171",
              cursor: "pointer", fontFamily: "inherit", fontSize: 12,
              fontWeight: 600, textAlign: "left", borderRadius: 8,
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            {u.connectionStatus === "blocked" ? "↩ Unblock" : "⊘ Block"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Resizable AI insight box ──────────────────────────────────────────────────
function ResizableAIBox({ text, dark, T }) {
  const [height, setHeight] = useState(80);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const startH = useRef(0);

  const onMouseDown = (e) => {
    e.preventDefault();
    startY.current = e.clientY;
    startH.current = height;
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const delta = e.clientY - startY.current;
      setHeight(Math.max(60, Math.min(220, startH.current + delta)));
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  return (
    <div
      className="fade-in"
      style={{
        background: T.aiBg, border: `1px solid ${T.aiBorder}`,
        borderRadius: 12, marginBottom: 12, position: "relative",
        overflow: "hidden", height, transition: dragging ? "none" : "height 0.1s",
      }}
    >
      <div style={{ padding: "11px 13px", height: "100%", overflow: "auto", boxSizing: "border-box" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", marginBottom: 5 }}>✦ AI MATCH INSIGHT</div>
        <p style={{ fontSize: 11, color: dark ? "#b0a8d8" : "#6b5b9e", lineHeight: 1.6, margin: 0 }}>{text}</p>
      </div>
      {/* Drag handle */}
      <div
        onMouseDown={onMouseDown}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: 10, cursor: "ns-resize", display: "flex",
          alignItems: "center", justifyContent: "center",
          background: dragging ? (dark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.08)") : "transparent",
          transition: "background 0.15s",
        }}
      >
        <div style={{ width: 28, height: 3, borderRadius: 99, background: dark ? "rgba(167,139,250,0.3)" : "rgba(124,58,237,0.2)" }} />
      </div>
    </div>
  );
}

// ── Pagination controls ───────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange, T, dark }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 32, paddingBottom: 8 }}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        style={{
          padding: "7px 14px", borderRadius: 10, border: `1px solid ${T.border}`,
          background: "transparent", color: page === 1 ? T.text3 : T.text2,
          cursor: page === 1 ? "not-allowed" : "pointer", fontFamily: "inherit",
          fontSize: 13, fontWeight: 600, opacity: page === 1 ? 0.4 : 1,
          transition: "all 0.2s",
        }}
      >← Prev</button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} style={{ color: T.text3, padding: "0 4px", fontSize: 13 }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: p === page ? "1px solid rgba(124,58,237,0.5)" : `1px solid ${T.border}`,
              background: p === page
                ? dark ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.1)"
                : "transparent",
              color: p === page ? "#a78bfa" : T.text2,
              cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: p === page ? 700 : 500,
              transition: "all 0.2s",
            }}
          >{p}</button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        style={{
          padding: "7px 14px", borderRadius: 10, border: `1px solid ${T.border}`,
          background: "transparent", color: page === totalPages ? T.text3 : T.text2,
          cursor: page === totalPages ? "not-allowed" : "pointer", fontFamily: "inherit",
          fontSize: 13, fontWeight: 600, opacity: page === totalPages ? 0.4 : 1,
          transition: "all 0.2s",
        }}
      >Next →</button>

      <span style={{ marginLeft: 8, fontSize: 11, color: T.text3 }}>Page {page} of {totalPages}</span>
    </div>
  );
}

// ── Full Profile Modal ────────────────────────────────────────────────────────
function FullProfileModal({ user, onClose, T, dark, onConnect, onFavourite, onMessage, onBlock, scoreColor }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
        zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: dark ? "#0e0e18" : "#fff",
          border: `1px solid ${T.border}`, borderRadius: 24,
          width: "100%", maxWidth: 560, maxHeight: "90vh",
          overflowY: "auto", position: "relative",
          animation: "slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header banner */}
        <div style={{
          height: 90, borderRadius: "24px 24px 0 0", overflow: "hidden",
          background: `linear-gradient(135deg, hsl(${user.hue},60%,${dark ? "15%" : "88%"}), hsl(${(user.hue + 60) % 360},50%,${dark ? "10%" : "92%"}))`,
          position: "relative",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(circle at 70% 50%, ${hsla(user.hue, 80, 60, 0.2)}, transparent 70%)`,
          }} />
          <button onClick={onClose} style={{
            position: "absolute", top: 12, right: 12,
            width: 32, height: 32, borderRadius: "50%",
            background: dark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.6)",
            border: "none", cursor: "pointer", fontSize: 16, color: T.text,
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}>✕</button>
        </div>

        <div style={{ padding: "0 28px 28px" }}>
          {/* Avatar & name row */}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginTop: -28, marginBottom: 20 }}>
            <div style={{ border: `3px solid ${dark ? "#0e0e18" : "#fff"}`, borderRadius: 18, flexShrink: 0 }}>
              <Avatar u={user} size={64} radius={15} T={T} dark={dark} />
            </div>
            <div style={{ flex: 1, paddingBottom: 4 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.text, fontFamily: "'Instrument Serif',serif", lineHeight: 1.2 }}>{user.name}</div>
              <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>@{user.handle} · {user.role}</div>
            </div>
            <div style={{ textAlign: "right", paddingBottom: 4 }}>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 34, color: scoreColor(user.matchScore), lineHeight: 1 }}>{user.matchScore}%</div>
              <div style={{ fontSize: 10, color: T.text3 }}>match</div>
            </div>
          </div>

          {/* Match bar */}
          <div style={{ height: 4, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)", borderRadius: 99, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ height: "100%", width: `${user.matchScore}%`, background: `linear-gradient(90deg,hsl(${user.hue},70%,45%),hsl(${user.hue},80%,65%))`, borderRadius: 99 }} />
          </div>

          {/* Status chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            <span style={{ fontSize: 11, color: user.online ? "#4ade80" : T.text3, fontWeight: 600 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: user.online ? "#22c55e" : "#555570", marginRight: 5, boxShadow: user.online ? "0 0 6px #22c55e" : "none" }} />
              {user.online ? "Online now" : "Offline"}
            </span>
            <span style={{ fontSize: 11, color: T.text3 }}>📍 {user.location || "Location not set"}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 99, background: hsla(user.hue, 70, 60, dark ? 0.12 : 0.08), border: `1px solid ${hsla(user.hue, 70, 60, 0.25)}`, color: hsl(user.hue) }}>Seeking {user.lookingFor}</span>
          </div>

          {/* Bio */}
          <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.7, marginBottom: 20 }}>{user.bio}</p>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, marginBottom: 20, background: T.border, borderRadius: 14, overflow: "hidden" }}>
            {[{ v: user.projects, l: "Projects" }, { v: user.followers, l: "Followers" }, { v: user.matchScore + "%", l: "Match Score" }].map((s, i) => (
              <div key={i} style={{ background: dark ? "#0e0e18" : "#fff", padding: "14px 0", textAlign: "center" }}>
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: T.text }}>{s.v}</div>
                <div style={{ fontSize: 11, color: T.text3, marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 14, padding: 14 }}>
              <Lbl T={T}>Skills</Lbl>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {user.skillsHave.map(s => <span key={s} style={{ padding: "4px 10px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }}>{s}</span>)}
              </div>
            </div>
            <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 14, padding: 14 }}>
              <Lbl T={T}>Needs</Lbl>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {user.skillsNeed.map(s => <span key={s} style={{ padding: "4px 10px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText }}>{s}</span>)}
              </div>
            </div>
          </div>

          {/* Connection status indicator */}
          {user.connectionStatus && (
            <div style={{
              padding: "10px 14px", borderRadius: 12, marginBottom: 16,
              background: user.connectionStatus === "accepted" ? "rgba(74,222,128,0.06)" : user.connectionStatus === "pending" ? "rgba(245,158,11,0.06)" : user.connectionStatus === "blocked" ? "rgba(239,68,68,0.06)" : "transparent",
              border: `1px solid ${user.connectionStatus === "accepted" ? "rgba(74,222,128,0.2)" : user.connectionStatus === "pending" ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}`,
              fontSize: 12, color: user.connectionStatus === "accepted" ? "#4ade80" : user.connectionStatus === "pending" ? "#f59e0b" : "#f87171",
              fontWeight: 600,
            }}>
              {user.connectionStatus === "accepted" ? "✓ You are connected with this builder" : user.connectionStatus === "pending" ? "⏳ Connection request sent — awaiting response" : "⊘ This user is blocked"}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <StatusButton connectionStatus={user.connectionStatus} onClick={() => onConnect(user)} extraStyle={{ flex: 1 }} />
            <button onClick={() => onFavourite(user)} style={{
              padding: "8px 14px", background: "transparent",
              border: `1px solid ${user.isFavourited ? "rgba(248,113,113,0.3)" : T.border}`,
              color: user.isFavourited ? "#f87171" : T.text3,
              borderRadius: 11, cursor: "pointer", fontSize: 14, transition: "all 0.2s",
            }}>{user.isFavourited ? "♥" : "♡"}</button>
            <button onClick={() => { onMessage(user); onClose(); }} style={{
              padding: "8px 16px", background: "transparent",
              border: `1px solid ${T.border}`, color: T.text2,
              borderRadius: 11, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
            }}>💬 Message</button>
            <button onClick={() => { onBlock(user); }} style={{
              padding: "8px 12px", background: "transparent",
              border: `1px solid ${user.connectionStatus === "blocked" ? "rgba(239,68,68,0.4)" : T.border}`,
              color: user.connectionStatus === "blocked" ? "#f87171" : T.text3,
              borderRadius: 11, cursor: "pointer", fontSize: 13, transition: "all 0.2s",
            }}>⊘</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DiscoverTab({
  T, dark,
  currentUser,
  connected, onSeedConnected,
  liked, setLiked, onSeedLiked,
  onMessage,
}) {
  const [filterSkill, setFilterSkill] = useState("All");
  const [filterLooking, setFilterLooking] = useState("All");
  const [filterOnline, setFilterOnline] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [aiLoading, setAiLoading] = useState(null);
  const [aiText, setAiText] = useState({});
  const [quickView, setQuickView] = useState(null);       // compact modal
  const [fullView, setFullView] = useState(null);          // full profile modal
  const [view, setView] = useState("grid");
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchProfiles() {
      try {
        setLoading(true);
        setFetchError(null);
        const res = await fetch("/api/profiles");
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const json = await res.json();
        if (json.error) throw new Error(json.error);

        const normalized = json.profiles.map(normalizeProfile);
        setProfiles(normalized);

        const initialConnected = {};
        const initialLiked = {};
        json.profiles.forEach((p) => {
          if (p.isConnected) initialConnected[p.id] = true;
          if (p.isFavourited) initialLiked[p.id] = true;
        });
        onSeedConnected?.(initialConnected);
        onSeedLiked?.(initialLiked);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [filterSkill, filterLooking, filterOnline, searchQ, sortBy]);

  const handleConnect = async (user) => {
    if (user.connectionStatus === "blocked") return;
    const prev = user.connectionStatus;
    const next = prev ? null : "pending";
    setProfiles(p => p.map(x => x.id === user.id ? { ...x, connectionStatus: next } : x));
    if (quickView?.id === user.id) setQuickView(v => v ? { ...v, connectionStatus: next } : v);
    if (fullView?.id === user.id) setFullView(v => v ? { ...v, connectionStatus: next } : v);

    try {
      const res = await fetch("/api/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: user.id }),
      });
      const json = await res.json();
      const status = json.action === "added" ? "pending" : null;
      setProfiles(p => p.map(x => x.id === user.id ? { ...x, connectionStatus: status } : x));
      if (quickView?.id === user.id) setQuickView(v => v ? { ...v, connectionStatus: status } : v);
      if (fullView?.id === user.id) setFullView(v => v ? { ...v, connectionStatus: status } : v);
    } catch {
      setProfiles(p => p.map(x => x.id === user.id ? { ...x, connectionStatus: prev } : x));
      if (quickView?.id === user.id) setQuickView(v => v ? { ...v, connectionStatus: prev } : v);
      if (fullView?.id === user.id) setFullView(v => v ? { ...v, connectionStatus: prev } : v);
    }
  };

  const handleBlock = (user) => {
    const isBlocked = user.connectionStatus === "blocked";
    const next = isBlocked ? null : "blocked";
    setProfiles(p => p.map(x => x.id === user.id ? { ...x, connectionStatus: next } : x));
    if (quickView?.id === user.id) setQuickView(v => v ? { ...v, connectionStatus: next } : v);
    if (fullView?.id === user.id) setFullView(v => v ? { ...v, connectionStatus: next } : v);
  };

  const handleFavourite = async (user) => {
    const wasFav = user.isFavourited;
    setProfiles(p => p.map(x => x.id === user.id ? { ...x, isFavourited: !wasFav } : x));
    setLiked(p => ({ ...p, [user.id]: !wasFav }));
    if (quickView?.id === user.id) setQuickView(v => v ? { ...v, isFavourited: !wasFav } : v);
    if (fullView?.id === user.id) setFullView(v => v ? { ...v, isFavourited: !wasFav } : v);

    try {
      const res = await fetch("/api/favourites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: user.id }),
      });
      const json = await res.json();
      const newFav = json.action === "added";
      setProfiles(p => p.map(x => x.id === user.id ? { ...x, isFavourited: newFav } : x));
      setLiked(p => ({ ...p, [user.id]: newFav }));
    } catch {
      setProfiles(p => p.map(x => x.id === user.id ? { ...x, isFavourited: wasFav } : x));
      setLiked(p => ({ ...p, [user.id]: wasFav }));
    }
  };

  const rankedUsers = profiles
    .map(u => ({ ...u, matchScore: u.matchScore ?? 0 }))
    .sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore;
      if (sortBy === "followers") return b.followers - a.followers;
      if (sortBy === "projects") return b.projects - a.projects;
      if (sortBy === "online") return (b.online ? 1 : 0) - (a.online ? 1 : 0);
      return 0;
    });

  const filtered = rankedUsers.filter(u => {
    if (filterOnline && !u.online) return false;
    const sk = filterSkill === "All" || u.skillsHave.includes(filterSkill) || u.skillsNeed.includes(filterSkill);
    const lk = filterLooking === "All" || u.lookingFor === filterLooking;
    const sq = !searchQ
      || u.name.toLowerCase().includes(searchQ.toLowerCase())
      || u.role.toLowerCase().includes(searchQ.toLowerCase())
      || u.skillsHave.some(s => s.toLowerCase().includes(searchQ.toLowerCase()));
    return sk && lk && sq;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PROFILES_PER_PAGE));
  const paginated = filtered.slice((page - 1) * PROFILES_PER_PAGE, page * PROFILES_PER_PAGE);

  const scoreColor = (score) => {
    if (score >= 80) return "#4ade80";
    if (score >= 60) return "#a78bfa";
    if (score >= 40) return "#f59e0b";
    return hsl(0, 60, 60);
  };

  const btn = {
    border: "none", cursor: "pointer",
    fontFamily: "'Instrument Sans',sans-serif",
    transition: "all 0.2s",
  };

  const handleAIAPI = async (prompt) => {
    const res = await fetch("/api/ai_insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    return res.json();
  };

  const handleAI = useCallback(async (user) => {
    if (aiLoading === user.id) return;
    setAiLoading(user.id);
    try {
      const data = await handleAIAPI(
        `Give a very short match insight for two builders.
        Me: skills=${currentUser?.skillsHave?.join(", ")}, needs=${currentUser?.skillsNeed?.join(", ")}.
        Them: name=${user.name}, skills=${user.skillsHave?.join(", ")}, needs=${user.skillsNeed?.join(", ")}, projects=${user.projects}, looking for=${user.lookingFor}.`
      );
      setAiText(p => ({ ...p, [user.id]: data.response }));
    } catch {
      setAiText(p => ({ ...p, [user.id]: "Could not load insight." }));
    } finally {
      setAiLoading(null);
    }
  }, [currentUser, aiLoading]);

  const openQuickView = (u) => { setQuickView(u); };
  const openFullView = (u) => { setFullView(u); setQuickView(null); };

  return (
    <div className="fade-up">
      {/* Header */}
      {fullView && (
        <UserFullProfile
          user={fullView}
          currentUser={currentUser}
          T={T}
          dark={dark}
          onClose={() => setFullView(null)}
          onConnect={handleConnect}
          onFavourite={handleFavourite}
          onMessage={onMessage}
          onBlock={handleBlock}
          scoreColor={scoreColor}
          calculateMatchScore={calculateMatchScore}
          Avatar={Avatar}
          Lbl={Lbl}
          hsl={hsl}
          hsla={hsla}
        />
      )}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, gap: 14, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#7c3aed", marginBottom: 6 }}>
            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", marginRight: 7, verticalAlign: "middle" }} />
            Live Matching
          </div>

          <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, color: T.text, letterSpacing: "-0.8px", lineHeight: 1.1 }}>Discover Builders</h1>
          <p style={{ fontSize: 13, color: T.text3, marginTop: 4 }}>{filtered.length} builders ranked by your match score</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["grid", "list"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ ...btn, padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, background: view === v ? dark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.1)" : "transparent", border: `1px solid ${view === v ? "rgba(124,58,237,0.4)" : T.border}`, color: view === v ? "#a78bfa" : T.text3 }}>
              {v === "grid" ? <i class="fa-solid fa-bars"></i>: <i className="fa-solid fa-list"></i>}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 180px", minWidth: 140 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.text3, fontSize: 14, pointerEvents: "none" }}><i class="fa-solid fa-magnifying-glass"></i></span>
          <input placeholder="Search name, role, skill…" value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text, borderRadius: 11, fontSize: 13, outline: "none", padding: "9px 14px 9px 32px", width: "100%", fontFamily: "inherit" }} />
        </div>
        <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)} style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text2, padding: "8px 12px", borderRadius: 10, fontSize: 12, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
          <option value="All">All Skills</option>
          {SKILLS_ALL.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterLooking} onChange={e => setFilterLooking(e.target.value)} style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text2, padding: "8px 12px", borderRadius: 10, fontSize: 12, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
          <option value="All">All Roles</option>
          <option>Collaborator</option><option>Mentor</option><option>Mentee</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text2, padding: "8px 12px", borderRadius: 10, fontSize: 12, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
          <option value="match">Sort: Match %</option>
          <option value="followers">Sort: Followers</option>
          <option value="projects">Sort: Projects</option>
          <option value="online">Sort: Online First</option>
        </select>
        <button onClick={() => setFilterOnline(p => !p)} style={{ ...btn, padding: "7px 13px", borderRadius: 10, fontSize: 12, fontWeight: 600, background: filterOnline ? dark ? "rgba(34,197,94,0.12)" : "rgba(34,197,94,0.08)" : "transparent", border: `1px solid ${filterOnline ? "rgba(34,197,94,0.35)" : T.border}`, color: filterOnline ? "#4ade80" : T.text3 }}>
          ● Online only
        </button>
      </div>

      {/* Stats strip */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { v: String(filtered.length), l: "Total matches" },
          { v: `${page}/${totalPages}`, l: "Pages" },
          { v: String(profiles.filter(u => u.online).length), l: "Active now" },
          { v: `${Math.round(filtered.reduce((a, u) => a + u.matchScore, 0) / Math.max(filtered.length, 1))}%`, l: "Avg match" },
        ].map((s, i) => (
          <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 18px", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, color: T.text }}>{s.v}</span>
            <span style={{ fontSize: 11, color: T.text3 }}>{s.l}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T.text3 }}>
          <div style={{ fontSize: 28, marginBottom: 14, animation: "spin 1s linear infinite", display: "inline-block" }}>✦</div>
          <div style={{ fontSize: 14, color: T.text2 }}>Finding your best matches…</div>
        </div>
      ) : fetchError ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T.text3 }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>⚠️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#f87171", marginBottom: 6 }}>Failed to load profiles</div>
          <div style={{ fontSize: 13 }}>{fetchError}</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T.text3 }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}><i className="fa-solid fa-magnifying-glass"></i></div>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.text2, marginBottom: 6 }}>No builders found</div>
          <div style={{ fontSize: 13 }}>Try adjusting your filters</div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: view === "list" ? "1fr" : "repeat(auto-fill,minmax(300px,1fr))", gap: view === "list" ? 10 : 16, alignItems: "start" }}>
            {paginated.map((u, i) => (
              view === "list"
                ? <ListCard key={u.id} u={u} i={i} T={T} dark={dark} onConnect={handleConnect} onBlock={handleBlock} liked={liked} setLiked={setLiked} aiText={aiText} aiLoading={aiLoading} handleAI={handleAI} onMessage={onMessage} scoreColor={scoreColor} setQuickView={openQuickView} setProfiles={setProfiles} />
                : <GridCard key={u.id} u={u} i={i} T={T} dark={dark} onConnect={handleConnect} onBlock={handleBlock} liked={liked} setLiked={setLiked} aiText={aiText} aiLoading={aiLoading} handleAI={handleAI} onMessage={onMessage} scoreColor={scoreColor} setQuickView={openQuickView} onFavourite={handleFavourite} setProfiles={setProfiles} />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} T={T} dark={dark} />
        </>
      )}

      {/* Quick View Modal (compact) — centered with "See Full Profile" button */}
      {quickView && (
        <div
          onClick={() => setQuickView(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
            zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: dark ? "#0e0e18" : "#fff",
              border: `1px solid ${T.border}`, borderRadius: 22, padding: 28,
              width: "100%", maxWidth: 460, maxHeight: "85vh", overflowY: "auto",
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
              animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18 }}>
              <Avatar u={quickView} size={60} radius={16} T={T} dark={dark} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: "'Instrument Serif',serif" }}>{quickView.name}</div>
                <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>@{quickView.handle} · {quickView.role}</div>
                <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>📍 {quickView.location || "Location not set"}</div>
                <div style={{ fontSize: 11, color: quickView.online ? "#22c55e" : T.text3, marginTop: 4, fontWeight: 600 }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: quickView.online ? "#22c55e" : "#555570", marginRight: 5 }} />
                  {quickView.online ? "Online now" : "Away"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 30, color: scoreColor(quickView.matchScore), lineHeight: 1 }}>{quickView.matchScore}%</div>
                <div style={{ fontSize: 10, color: T.text3 }}>match</div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.65, marginBottom: 16 }}>{quickView.bio}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 12, padding: 12 }}>
                <Lbl T={T}>Skills</Lbl>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {quickView.skillsHave.map(s => <span key={s} style={{ padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }}>{s}</span>)}
                </div>
              </div>
              <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 12, padding: 12 }}>
                <Lbl T={T}>Needs</Lbl>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {quickView.skillsNeed.map(s => <span key={s} style={{ padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText }}>{s}</span>)}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 18, marginBottom: 16, padding: "12px 0", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
              {[{ v: quickView.projects, l: "Projects" }, { v: quickView.followers, l: "Followers" }, { v: quickView.matchScore + "%", l: "Match" }].map((s, i) => (
                <div key={i} style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: T.text }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <StatusButton connectionStatus={quickView.connectionStatus} onClick={() => { handleConnect(quickView); }} />
              <button onClick={() => { onMessage(quickView); setQuickView(null); }} style={{ padding: "11px 18px", borderRadius: 11, background: "transparent", border: `1px solid ${T.border}`, color: T.text2, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>💬 Message</button>
            </div>

            {/* See Full Profile button */}
            <button
              onClick={() => openFullView(quickView)}
              style={{
                width: "100%", padding: "10px", borderRadius: 11,
                background: "transparent",
                border: `1px solid ${T.border}`,
                color: T.text2, fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)"; e.currentTarget.style.color = "#a78bfa"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text2; }}
            >
              ↗ See Full Profile
            </button>
          </div>
        </div>
      )}

      {/* Full Profile Modal */}
      {fullView && (
        <FullProfileModal
          user={fullView}
          onClose={() => setFullView(null)}
          T={T}
          dark={dark}
          onConnect={handleConnect}
          onFavourite={handleFavourite}
          onMessage={onMessage}
          onBlock={handleBlock}
          scoreColor={scoreColor}
        />
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Grid Card ─────────────────────────────────────────────────────────────────
function GridCard({ u, i, T, dark, onConnect, onBlock, liked, setLiked, aiText, aiLoading, handleAI, onMessage, scoreColor, setQuickView, onFavourite, setProfiles }) {
  const isFav = u.isFavourited;

  return (
    <div className="card fade-up" style={{ padding: 20, position: "relative", overflow: "hidden", animationDelay: `${i * 0.06}s`, cursor: "default", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle,${hsla(u.hue, 70, 60, dark ? 0.08 : 0.05)} 0%,transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ position: "relative" }}>
          <Avatar u={u} size={48} radius={13} T={T} dark={dark} />
          <div style={{ position: "absolute", bottom: -1, right: -1, width: 8, height: 8, borderRadius: "50%", background: u.online ? "#22c55e" : "#555570", border: `2px solid ${dark ? "#060608" : "#f5f5f9"}` }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{u.name}</div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>@{u.handle}</div>
          <div style={{ fontSize: 11, color: hsl(u.hue), fontWeight: 500, marginTop: 2 }}>{u.role}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: scoreColor(u.matchScore), lineHeight: 1 }}>{u.matchScore}%</div>
          <div style={{ fontSize: 9, color: T.text3, marginTop: 1 }}>match</div>
        </div>
      </div>
      <div style={{ height: 3, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)", borderRadius: 99, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ height: "100%", width: `${u.matchScore}%`, background: `linear-gradient(90deg,hsl(${u.hue},70%,45%),hsl(${u.hue},80%,65%))`, borderRadius: 99, transition: "width 1s" }} />
      </div>
      <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>{u.bio}</p>
      <div style={{ marginBottom: 8 }}>
        <Lbl T={T}>Has</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {u.skillsHave.map(s => <span key={s} style={{ padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }}>{s}</span>)}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <Lbl T={T}>Needs</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {u.skillsNeed.map(s => <span key={s} style={{ padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText }}>{s}</span>)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: T.text3 }}>📍 {u.location || "Location not set"}</span>
        <span style={{ fontSize: 11, color: T.text3 }}>📁 {u.projects} projects</span>
        <span style={{ fontSize: 11, color: T.text3 }}>★ {u.followers}</span>
      </div>
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: hsla(u.hue, 70, 60, dark ? 0.12 : 0.08), border: `1px solid ${hsla(u.hue, 70, 60, 0.25)}`, color: hsl(u.hue) }}>Seeking {u.lookingFor}</span>
      </div>

      {/* Resizable AI insight */}
      {aiText[u.id] && <ResizableAIBox text={aiText[u.id]} dark={dark} T={T} />}

      <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
        <StatusButton connectionStatus={u.connectionStatus} onClick={() => onConnect(u)} />
        <button onClick={() => onFavourite(u)} style={{ padding: "8px 10px", background: "transparent", border: `1px solid ${isFav ? "rgba(248,113,113,0.3)" : T.border}`, color: isFav ? "#f87171" : T.text3, borderRadius: 10, cursor: "pointer", fontSize: 14, transition: "all 0.2s" }}>
          {isFav ? "♥" : "♡"}
        </button>
        <button onClick={() => handleAI(u)} style={{ padding: "8px 10px", background: aiText[u.id] ? dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.08)" : "transparent", border: `1px solid ${aiText[u.id] ? "rgba(124,58,237,0.3)" : T.border}`, color: aiText[u.id] ? "#a78bfa" : T.text3, borderRadius: 10, cursor: "pointer", fontSize: 13, transition: "all 0.2s" }}>
          {aiLoading === u.id ? <span style={{ display: "inline-block", animation: "spin 0.9s linear infinite" }}>✦</span> : "✦"}
        </button>
        <button onClick={() => onMessage(u)} style={{ padding: "8px 10px", background: "transparent", border: `1px solid ${T.border}`, color: T.text3, borderRadius: 10, cursor: "pointer", fontSize: 13 }}>💬</button>
        <button onClick={() => setQuickView(u)} style={{ padding: "8px 10px", background: "transparent", border: `1px solid ${T.border}`, color: T.text3, borderRadius: 10, cursor: "pointer", fontSize: 13 }}>↗</button>
      </div>
    </div>
  );
}

// ── List Card ─────────────────────────────────────────────────────────────────
function ListCard({ u, i, T, dark, onConnect, onBlock, liked, setLiked, aiText, aiLoading, handleAI, onMessage, scoreColor, setQuickView, setProfiles }) {
  return (
    <div className="card fade-up" style={{ padding: "14px 18px", display: "flex", gap: 14, alignItems: "center", animationDelay: `${i * 0.04}s` }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar u={u} size={42} radius={11} T={T} dark={dark} />
        <div style={{ position: "absolute", bottom: -1, right: -1, width: 7, height: 7, borderRadius: "50%", background: u.online ? "#22c55e" : "#555570", border: `2px solid ${dark ? "#060608" : "#f5f5f9"}` }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{u.name}</span>
          <span style={{ fontSize: 11, color: hsl(u.hue), fontWeight: 600 }}>{u.role}</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: hsla(u.hue, 70, 60, dark ? 0.1 : 0.07), border: `1px solid ${hsla(u.hue, 70, 60, 0.22)}`, color: hsl(u.hue) }}>{u.lookingFor}</span>
          {/* Inline status badge for list view */}
          {u.connectionStatus && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
              background: u.connectionStatus === "accepted" ? "rgba(74,222,128,0.08)" : u.connectionStatus === "pending" ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${u.connectionStatus === "accepted" ? "rgba(74,222,128,0.25)" : u.connectionStatus === "pending" ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"}`,
              color: u.connectionStatus === "accepted" ? "#4ade80" : u.connectionStatus === "pending" ? "#f59e0b" : "#f87171",
            }}>
              {u.connectionStatus === "accepted" ? "✓ Connected" : u.connectionStatus === "pending" ? "⏳ Pending" : "⊘ Blocked"}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {u.skillsHave.slice(0, 3).map(s => <span key={s} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }}>{s}</span>)}
          {u.skillsNeed.slice(0, 2).map(s => <span key={s} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText }}>{s}</span>)}
        </div>
        <div style={{ marginTop: 4 }}>
          <span style={{ fontSize: 11, color: T.text3 }}>📍 {u.location || "Location not set"}</span>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: scoreColor(u.matchScore), lineHeight: 1 }}>{u.matchScore}%</div>
        <div style={{ fontSize: 10, color: T.text3 }}>match</div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <StatusButton connectionStatus={u.connectionStatus} onClick={() => onConnect(u)} size="small" extraStyle={{ flex: "none", padding: "6px 14px" }} />
        <button onClick={() => onMessage(u)} style={{ padding: "6px 10px", background: "transparent", border: `1px solid ${T.border}`, color: T.text3, borderRadius: 9, cursor: "pointer", fontSize: 12 }}>💬</button>
        <button onClick={() => setQuickView(u)} style={{ padding: "6px 10px", background: "transparent", border: `1px solid ${T.border}`, color: T.text3, borderRadius: 9, cursor: "pointer", fontSize: 12 }}>↗</button>
      </div>
    </div>
  );
}