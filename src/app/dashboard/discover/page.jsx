"use client";
export const dynamic = "force-dynamic";
import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { calculateMatchScore } from "../shared";
import {
  SKILLS_ALL,
  hsl, hsla,
  Avatar, Lbl,
} from "../shared";
import {
  MapPin, Folder, Star, Heart, Sparkles, MessageSquare, Ban,
  CheckCircle2, AlertTriangle, Info, Search, Clock, Check,
  LayoutGrid, List, ArrowLeft, ArrowRight, ExternalLink,
} from "lucide-react";

// Responsive icon sizing: scales fluidly between breakpoints instead of a
// fixed pixel size, matching the convention used across the rest of the app.
const iconSize = (min, max, vw = 3) => ({
  width: `clamp(${min}px, ${vw}vw, ${max}px)`,
  height: `clamp(${min}px, ${vw}vw, ${max}px)`,
  flexShrink: 0,
});

const PROFILES_PER_PAGE = 9;
const MOBILE_BREAKPOINT = 640;

const ACTION_TO_STATUS = {
  disconnect: "declined",
  cancel:     "declined",
  block:      "blocked",
  unblock:    "unblocked",
};

// Demo-only ticker items for the running text strip. Purely presentational —
// not wired to real data.
const DEMO_TICKER_ITEMS = [
  "🔥 Sarah Chen has a 92% match score",
  "🤝 Connection received from Alex Kim",
  "⭐ Priya Patel has an 87% match score",
  "🤝 Connection received from Jordan Lee",
  "🔥 Marcus Webb has a 78% match score",
  "🤝 Connection received from Dana Osei",
];

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

function getStatusConfig(connectionStatus) {
  switch (connectionStatus) {
    case "accepted":
      return {
        label: "Connected",
        style: { background: "transparent", border: "1px solid rgba(74,222,128,0.35)", color: "#4ade80" },
        hoverStyle: { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" },
        hoverLabel: "Disconnect",
      };
    case "pending":
      return {
        label: "Pending",
        style: { background: "transparent", border: "1px solid rgba(245,158,11,0.35)", color: "#f59e0b" },
        hoverStyle: { background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.5)", color: "#fbbf24" },
        hoverLabel: " Cancel",
      };
    case "blocked":
      return {
        label: "Blocked",
        style: { background: "transparent", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" },
        hoverStyle: { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.5)", color: "#fca5a5" },
        hoverLabel: "Unblock",
      };
    default:
      return {
        label: "Connect",
        style: { background: "#7c3aed", border: "1px solid #7c3aed", color: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.3)" },
        hoverStyle: { background: "#8b4ff5", border: "1px solid #8b4ff5", color: "white" },
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
      style={{ flex: 1, padding, borderRadius: 8, cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize, fontWeight: 600, transition: "background 0.15s ease,border-color 0.15s ease,color 0.15s ease", ...currentStyle, ...extraStyle }}
    >
      {currentLabel}
    </button>
  );
}

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
    const onMove = (e) => setHeight(Math.max(60, Math.min(220, startH.current + (e.clientY - startY.current))));
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  return (
    <div className="fade-in" style={{ background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 10, marginBottom: 12, position: "relative", overflow: "hidden", height, transition: dragging ? "none" : "height 0.1s" }}>
      <div style={{ padding: "11px 13px", height: "100%", overflow: "auto", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 600, color: "#a78bfa", marginBottom: 5, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.4px" }}>
          <Sparkles style={iconSize(10, 12)} /> AI match insight
        </div>
        <p style={{ fontSize: 11, color: dark ? "#b0a8d8" : "#6b5b9e", lineHeight: 1.6, margin: 0 }}>{text}</p>
      </div>
      <div onMouseDown={onMouseDown} style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 10, cursor: "ns-resize", display: "flex", alignItems: "center", justifyContent: "center", background: dragging ? (dark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.08)") : "transparent", transition: "background 0.15s" }}>
        <div style={{ width: 28, height: 3, borderRadius: 99, background: dark ? "rgba(167,139,250,0.3)" : "rgba(124,58,237,0.2)" }} />
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onChange, T, dark }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 32, paddingBottom: 8, flexWrap: "wrap" }}>
      <button onClick={() => onChange(page - 1)} disabled={page === 1} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, border: `1px solid ${T?.border}`, background: "transparent", color: page === 1 ? T?.text3 : T?.text2, cursor: page === 1 ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, opacity: page === 1 ? 0.4 : 1, transition: "border-color 0.15s,color 0.15s" }}>
        <ArrowLeft style={iconSize(12, 14)} /> Prev
      </button>
      {pages.map((p, i) =>
        p === "…"
          ? <span key={`ellipsis-${i}`} style={{ color: T?.text3, padding: "0 4px", fontSize: 13 }}>…</span>
          : <button key={p} onClick={() => onChange(p)} style={{ width: 34, height: 34, borderRadius: 8, border: p === page ? "1px solid rgba(124,58,237,0.5)" : `1px solid ${T?.border}`, background: p === page ? (dark ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.1)") : "transparent", color: p === page ? "#a78bfa" : T?.text2, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: p === page ? 700 : 500, transition: "border-color 0.15s,color 0.15s" }}>{p}</button>
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, border: `1px solid ${T?.border}`, background: "transparent", color: page === totalPages ? T?.text3 : T?.text2, cursor: page === totalPages ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, opacity: page === totalPages ? 0.4 : 1, transition: "border-color 0.15s,color 0.15s" }}>
        Next <ArrowRight style={iconSize(12, 14)} />
      </button>
      <span style={{ marginLeft: 8, fontSize: 11, color: T?.text3, fontFamily: "'JetBrains Mono',monospace" }}>Page {page} of {totalPages}</span>
    </div>
  );
}

/* simplified — no longer needs to sync a quickView/fullView popup */
function syncUser(id, patch, setProfiles) {
  setProfiles(p => p.map(u => u.id === id ? { ...u, ...patch } : u));
}

async function callConnectionResponse(receiverId, status) {
  const res = await fetch("/api/connection/response", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ receiverId, status }),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error || "Request failed");
  }
  return json;
}

// ── Running ticker strip ────────────────────────────────────────────────────
// Demo-only left-to-right marquee sitting just above the search/filter bar.
// Content is duplicated back-to-back and animated from -50% to 0% so it
// reads as continuously entering from the left edge and exiting to the right.
function LiveTicker({ T, dark }) {
  const text = DEMO_TICKER_ITEMS.join("   •   ");
  return (
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        background: dark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.06)",
        border: `1px solid ${T?.border}`,
        borderRadius: 8,
        padding: "8px 0",
        marginBottom: 14,
        maxWidth: "100%",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          animation: "marqueeLTR 22s linear infinite",
          willChange: "transform",
        }}
      >
        <span
          style={{
            paddingRight: 48,
            fontSize: "clamp(11px, 2.8vw, 13px)",
            fontWeight: 600,
            color: "#a78bfa",
            fontFamily: "'JetBrains Mono',monospace",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
        <span
          aria-hidden="true"
          style={{
            paddingRight: 48,
            fontSize: "clamp(11px, 2.8vw, 13px)",
            fontWeight: 600,
            color: "#a78bfa",
            fontFamily: "'JetBrains Mono',monospace",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}

// ── View Profile Confirm Modal ──────────────────────────────────────────────
// Rendered through a portal straight into document.body so it always
// positions correctly relative to the real viewport — independent of any
// parent's transform/animation/scroll container. It anchors itself next to
// the button that was clicked (via `anchor`, a getBoundingClientRect() snapshot)
// rather than jumping to the dead-center of the page.
const MODAL_WIDTH = 380;
const MODAL_MAX_HEIGHT = 480;
const MODAL_MARGIN = 16; // gap from viewport edges and from the anchor button
const ANIM_MS = 220; // must match the CSS animation durations below

function ViewProfileModal({ user, anchor, T, dark, onClose, onLearnMore, onConnect }) {
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState(null);
  const [renderedUser, setRenderedUser] = useState(null);   // kept during close animation
  const [renderedAnchor, setRenderedAnchor] = useState(null); // snapshot so it doesn't null out mid-exit
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  // Keep rendering the last user/anchor while the close animation plays,
  // instead of unmounting (or re-centering) instantly the moment `user`
  // becomes null.
  useEffect(() => {
    if (user) {
      setRenderedUser(user);
      setRenderedAnchor(anchor);
      setClosing(false);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    } else if (renderedUser) {
      setClosing(true);
      closeTimer.current = setTimeout(() => {
        setRenderedUser(null);
        setRenderedAnchor(null);
        setClosing(false);
      }, ANIM_MS);
    }
    return () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Lock background scroll while modal is open or closing
  useEffect(() => {
    if (!renderedUser) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, [renderedUser]);

  // Compute a position next to the clicked button, clamped so the card
  // never overflows the viewport. Runs after mount so we can measure the
  // card's real height (it varies with content).
  useEffect(() => {
    if (!renderedUser || !renderedAnchor) { setPos(null); return; }

    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cardH = Math.min(cardRef.current?.offsetHeight ?? 320, MODAL_MAX_HEIGHT);
      const cardW = Math.min(MODAL_WIDTH, vw - MODAL_MARGIN * 2);

      // Prefer placing it just below the button; flip above if no room.
      let top = renderedAnchor.buttonRect.bottom + MODAL_MARGIN;
      if (top + cardH > vh - MODAL_MARGIN) {
        top = renderedAnchor.buttonRect.top - cardH - MODAL_MARGIN;
      }
      top = Math.max(MODAL_MARGIN, Math.min(top, Math.max(MODAL_MARGIN, vh - cardH - MODAL_MARGIN)));

      // Center horizontally on the button, clamped within the viewport.
      let left = renderedAnchor.x - cardW / 2;
      left = Math.max(MODAL_MARGIN, Math.min(left, Math.max(MODAL_MARGIN, vw - cardW - MODAL_MARGIN)));

      setPos({ top, left, cardW });
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [renderedUser, renderedAnchor]);

  if (!renderedUser || !mounted) return null;

  const user_ = renderedUser;

  // Fallback to centered if we have no anchor (e.g. triggered without a click event)
  const usingAnchor = !!renderedAnchor && !!pos;
  const anim = closing
    ? (usingAnchor ? "popOut" : "modalOut")
    : (usingAnchor ? "popIn" : "modalIn");

  const modal = (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        width: "100vw", height: "100vh",
        zIndex: 10000,
        background: "rgba(0,0,0,0.45)",
        animation: `${closing ? "overlayOut" : "overlayIn"} ${ANIM_MS}ms ease both`,
      }}
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          ...(usingAnchor
            ? { top: pos.top, left: pos.left }
            : { top: "50%", left: "50%" }),
          transformOrigin: usingAnchor ? "top center" : "center center",
          background: dark ? "#111116" : "#fff",
          border: `1px solid ${T?.border}`,
          borderRadius: 14,
          padding: "28px 26px",
          width: usingAnchor ? pos.cardW : MODAL_WIDTH,
          maxWidth: `calc(100vw - ${MODAL_MARGIN * 2}px)`,
          maxHeight: `min(${MODAL_MAX_HEIGHT}px, calc(100vh - ${MODAL_MARGIN * 2}px))`,
          overflowY: "auto",
          boxSizing: "border-box",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          fontFamily: "'Inter',sans-serif",
          animation: `${anim} ${ANIM_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both`,
          textAlign: "center",
          visibility: usingAnchor || !anchor ? "visible" : "hidden", // avoid a flash at (0,0) before pos is computed
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, flexShrink: 0 }}>
          <Avatar u={user_} size={64} radius={14} T={T} dark={dark} />
        </div>

        <div
          style={{
            fontSize: 18, fontWeight: 700, color: T?.text, marginBottom: 4,
            width: "100%", wordBreak: "break-word", overflowWrap: "break-word",
            fontFamily: "'Inter',sans-serif",
          }}
        >
          {user_.name}
        </div>
        <div
          style={{
            fontSize: 13, color: hsl(user_.hue), fontWeight: 500, marginBottom: 16,
            width: "100%", wordBreak: "break-word", overflowWrap: "break-word",
          }}
        >
          {user_.role}
        </div>

        <p
          style={{
            fontSize: 14, color: T?.text2, lineHeight: 1.6, marginBottom: 22,
            width: "100%", wordBreak: "break-word", overflowWrap: "break-word",
          }}
        >
          Do you want to know more about <strong style={{ color: T?.text }}>{user_.name}</strong>?
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", width: "100%" }}>
          <button
            onClick={onClose}
            style={{
              flex: "1 1 90px", minWidth: 0, padding: "10px 12px", borderRadius: 8,
              border: `1px solid ${T?.border}`, background: "transparent",
              color: T?.text3, cursor: "pointer", fontFamily: "'Inter',sans-serif",
              fontSize: 13, fontWeight: 600, transition: "border-color 0.15s,color 0.15s", whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConnect(user_)}
            style={{
              flex: "1 1 90px", minWidth: 0, padding: "10px 12px", borderRadius: 8,
              border: `1px solid ${T?.border}`, background: "transparent",
              color: T?.text2, cursor: "pointer", fontFamily: "'Inter',sans-serif",
              fontSize: 13, fontWeight: 700, transition: "border-color 0.15s,color 0.15s", whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis",
            }}
          >
            Connect
          </button>
          <button
            onClick={() => onLearnMore(user_)}
            style={{
              flex: "1 1 90px", minWidth: 0, padding: "10px 12px", borderRadius: 8,
              border: "1px solid #7c3aed", cursor: "pointer", fontFamily: "'Inter',sans-serif",
              fontSize: 13, fontWeight: 700, color: "white",
              background: "#7c3aed",
              boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
              transition: "filter 0.15s", whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis",
            }}
          >
            Learn More
          </button>
        </div>
      </div>

      <style>{`
        @keyframes overlayIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes overlayOut { from { opacity:1; } to { opacity:0; } }
        @keyframes modalIn    { from { opacity:0; transform:translate(-50%,-50%) scale(0.95); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }
        @keyframes modalOut   { from { opacity:1; transform:translate(-50%,-50%) scale(1); } to { opacity:0; transform:translate(-50%,-50%) scale(0.95); } }
        @keyframes popIn      { from { opacity:0; transform:scale(0.94) translateY(-8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes popOut     { from { opacity:1; transform:scale(1) translateY(0); } to { opacity:0; transform:scale(0.94) translateY(-8px); } }
      `}</style>
    </div>
  );

  return createPortal(modal, document.body);
}

export default function DiscoverTab({
  T, dark,
  currentUser,
  connected, onSeedConnected,
  liked, setLiked, onSeedLiked,
  onMessage,
  onViewProfile, // parent decides how to navigate to a real profile page — called with the user's id
}) {
  const [filterSkill, setFilterSkill]   = useState("All");
  const [filterLooking, setFilterLooking] = useState("All");
  const [filterOnline, setFilterOnline] = useState(false);
  const [searchQ, setSearchQ]           = useState("");
  const [sortBy, setSortBy]             = useState("match");
  const [aiLoading, setAiLoading]       = useState(null);
  const [aiText, setAiText]             = useState({});
  const [view, setView]                 = useState("grid");
  const [profiles, setProfiles]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState(null);
  const [page, setPage]                 = useState(1);
  const [toast, setToast]               = useState(null);
  const [confirmUser, setConfirmUser]   = useState(null); // user pending the "view profile" confirm modal
  const [confirmAnchor, setConfirmAnchor] = useState(null); // viewport position of the button that opened the modal
  const [isMobile, setIsMobile]         = useState(false);

  // Track viewport width so list mode can be disabled on mobile and the
  // grid/list toggle can hide the list option there.
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // List mode isn't available on mobile — force grid whenever we cross into
  // the mobile breakpoint (e.g. resizing down, or rotating a device).
  useEffect(() => {
    if (isMobile && view === "list") setView("grid");
  }, [isMobile, view]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

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

  useEffect(() => { setPage(1); }, [filterSkill, filterLooking, filterOnline, searchQ, sortBy]);

  const handleConnect = async (user) => {
    if (user.connectionStatus === "blocked") return;

    const prev = user.connectionStatus;

    if (prev === "accepted" || prev === "pending") {
      const action = prev === "accepted" ? "disconnect" : "cancel";
      syncUser(user.id, { connectionStatus: null }, setProfiles);
      try {
        await callConnectionResponse(user.id, ACTION_TO_STATUS[action]);
        showToast(
          action === "disconnect"
            ? `Disconnected from ${user.name}.`
            : `Request to ${user.name} cancelled.`,
          "info"
        );
      } catch (err) {
        syncUser(user.id, { connectionStatus: prev }, setProfiles);
        showToast(err.message || "Something went wrong.", "warn");
      }
      return;
    }

    syncUser(user.id, { connectionStatus: "pending" }, setProfiles);
    try {
      const res = await fetch("/api/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const json = await res.json();
      const status = json.action === "added" ? "pending" : null;
      syncUser(user.id, { connectionStatus: status }, setProfiles);
      if (status === "pending") showToast(`Request sent to ${user.name}!`);
    } catch {
      syncUser(user.id, { connectionStatus: prev }, setProfiles);
      showToast("Failed to send request.", "warn");
    }
  };

  const handleBlock = async (user) => {
    const prevStatus = user.connectionStatus;
    const isBlocked = prevStatus === "blocked";
    const next = isBlocked ? null : "blocked";
    const status = isBlocked ? ACTION_TO_STATUS.unblock : ACTION_TO_STATUS.block;

    syncUser(user.id, { connectionStatus: next }, setProfiles);

    try {
      await callConnectionResponse(user.id, status);
      showToast(
        isBlocked ? `${user.name} has been unblocked.` : `${user.name} has been blocked.`,
        isBlocked ? "success" : "warn"
      );
    } catch (err) {
      syncUser(user.id, { connectionStatus: prevStatus }, setProfiles);
      showToast(err.message || "Something went wrong.", "warn");
    }
  };

  const handleFavourite = async (user) => {
    const wasFav = user.isFavourited;
    syncUser(user.id, { isFavourited: !wasFav }, setProfiles);
    setLiked(p => ({ ...p, [user.id]: !wasFav }));
    try {
      const res = await fetch("/api/favourites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: user.id }),
      });
      const json = await res.json();
      const newFav = json.action === "added";
      syncUser(user.id, { isFavourited: newFav }, setProfiles);
      setLiked(p => ({ ...p, [user.id]: newFav }));
    } catch {
      syncUser(user.id, { isFavourited: wasFav }, setProfiles);
      setLiked(p => ({ ...p, [user.id]: wasFav }));
    }
  };

  // Opens the confirm modal anchored to wherever the "view profile" button
  // was clicked, instead of navigating immediately
  const handleRequestViewProfile = useCallback((user, e) => {
    if (e?.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      setConfirmAnchor({
        x: rect.left + rect.width / 2,
        y: rect.top, // top of the button — modal will sit just above/below it
        buttonRect: rect,
      });
    } else {
      setConfirmAnchor(null);
    }
    setConfirmUser(user);
  }, []);

  // "Learn More" inside the modal — carries the user's id up to the parent
  const handleLearnMore = useCallback((user) => {
    setConfirmUser(null);
    setConfirmAnchor(null);
    onViewProfile?.(user.id);
  }, [onViewProfile]);

  // "Connect" inside the modal — reuses the existing connect flow
  const handleModalConnect = useCallback((user) => {
    setConfirmUser(null);
    setConfirmAnchor(null);
    handleConnect(user);
  }, [handleConnect]);

  const rankedUsers = profiles
    .map(u => ({ ...u, matchScore: u.matchScore ?? 0 }))
    .sort((a, b) => {
      if (sortBy === "match")     return b.matchScore - a.matchScore;
      if (sortBy === "followers") return b.followers - a.followers;
      if (sortBy === "projects")  return b.projects - a.projects;
      if (sortBy === "online")    return (b.online ? 1 : 0) - (a.online ? 1 : 0);
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
  const paginated  = filtered.slice((page - 1) * PROFILES_PER_PAGE, page * PROFILES_PER_PAGE);
  const effectiveView = isMobile ? "grid" : view;

  const scoreColor = (score) => {
    if (score >= 80) return "#4ade80";
    if (score >= 60) return "#a78bfa";
    if (score >= 40) return "#f59e0b";
    return hsl(0, 60, 60);
  };

  const btn = { border: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "background 0.15s,border-color 0.15s,color 0.15s" };

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

  return (
    <div className="fade-up" style={{ fontFamily: "'Inter',sans-serif" }}>
      {/* Global toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: dark ? "#111116" : "#fff",
          border: `1px solid ${toast.type === "warn" ? "rgba(245,158,11,0.3)" : toast.type === "info" ? "rgba(99,102,241,0.3)" : "rgba(34,197,94,0.3)"}`,
          borderRadius: 10, padding: "12px 16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", gap: 10,
          animation: "toastIn 0.25s ease both", minWidth: 220, maxWidth: "calc(100vw - 40px)",
        }}>
          <span style={{ color: toast.type === "success" ? "#4ade80" : toast.type === "warn" ? "#f59e0b" : "#818cf8", display: "flex" }}>
            {toast.type === "success"
              ? <CheckCircle2 style={iconSize(16, 18)} />
              : toast.type === "warn"
                ? <AlertTriangle style={iconSize(16, 18)} />
                : <Info style={iconSize(16, 18)} />}
          </span>
          <span style={{ fontSize: 13, color: dark ? "#ededf2" : "#111116", fontWeight: 500 }}>{toast.msg}</span>
        </div>
      )}

      {/* View profile confirm modal */}
      <ViewProfileModal
        user={confirmUser}
        anchor={confirmAnchor}
        T={T}
        dark={dark}
        onClose={() => { setConfirmUser(null); setConfirmAnchor(null); }}
        onLearnMore={handleLearnMore}
        onConnect={handleModalConnect}
      />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, gap: 14, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "#7c3aed", marginBottom: 6, fontFamily: "'JetBrains Mono',monospace", display: "flex", alignItems: "center" }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#22c55e", marginRight: 7, animation: "blink 1.4s ease-in-out infinite" }} />
            <span style={{ animation: "blink 1.4s ease-in-out infinite" }}>Live Matching</span>
          </div>
          <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 26, color: T?.text, letterSpacing: "-0.6px", lineHeight: 1.15 }}>Discover Builders</h1>
          <p style={{ fontSize: 13, color: T?.text3, marginTop: 4 }}><span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{filtered.length}</span> builders ranked by your match score</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { v: "grid", Icon: LayoutGrid },
            // List mode is desktop-only — hidden entirely on mobile.
            ...(isMobile ? [] : [{ v: "list", Icon: List }]),
          ].map(({ v, Icon }) => (
            <button key={v} onClick={() => setView(v)} style={{ ...btn, display: "flex", alignItems: "center", justifyContent: "center", padding: "7px 12px", borderRadius: 8, background: effectiveView === v ? (dark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.1)") : "transparent", border: `1px solid ${effectiveView === v ? "rgba(124,58,237,0.4)" : T?.border}`, color: effectiveView === v ? "#a78bfa" : T?.text3 }}>
              <Icon style={iconSize(14, 16)} />
            </button>
          ))}
        </div>
      </div>

      {/* Running ticker — demo only, sits just above the search bar */}
      <LiveTicker T={T} dark={dark} />

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 180px", minWidth: 140 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T?.text3, display: "flex", pointerEvents: "none" }}>
            <Search style={iconSize(13, 15)} />
          </span>
          <input aria-label="Search developers" placeholder="Search name, role, skill…" value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ background: T?.input, border: `1px solid ${T?.inputBorder}`, color: T?.text, borderRadius: 8, fontSize: 13, outline: "none", padding: "9px 14px 9px 32px", width: "100%", fontFamily: "'Inter',sans-serif" }} />
        </div>
        <select aria-label="Filter by skill" value={filterSkill} onChange={e => setFilterSkill(e.target.value)} style={{ background: T?.input, border: `1px solid ${T?.inputBorder}`, color: T?.text2, padding: "8px 12px", borderRadius: 8, fontSize: 12, fontFamily: "'Inter',sans-serif", outline: "none", cursor: "pointer" }}>
          <option value="All">All Skills</option>
          {SKILLS_ALL.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select aria-label="Filter by looking for" value={filterLooking} onChange={e => setFilterLooking(e.target.value)} style={{ background: T?.input, border: `1px solid ${T?.inputBorder}`, color: T?.text2, padding: "8px 12px", borderRadius: 8, fontSize: 12, fontFamily: "'Inter',sans-serif", outline: "none", cursor: "pointer" }}>
          <option value="All">All Roles</option>
          <option>Collaborator</option><option>Mentor</option><option>Mentee</option>
        </select>
        <select aria-label="Sort developers" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: T?.input, border: `1px solid ${T?.inputBorder}`, color: T?.text2, padding: "8px 12px", borderRadius: 8, fontSize: 12, fontFamily: "'Inter',sans-serif", outline: "none", cursor: "pointer" }}>
          <option value="match">Sort: Match %</option>
          <option value="followers">Sort: Followers</option>
          <option value="projects">Sort: Projects</option>
          <option value="online">Sort: Online First</option>
        </select>
        <button onClick={() => setFilterOnline(p => !p)} style={{ ...btn, display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: filterOnline ? (dark ? "rgba(34,197,94,0.12)" : "rgba(34,197,94,0.08)") : "transparent", border: `1px solid ${filterOnline ? "rgba(34,197,94,0.35)" : T?.border}`, color: filterOnline ? "#4ade80" : T?.text3 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: filterOnline ? "#22c55e" : T?.text3, flexShrink: 0 }} />
          Online only
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
          <div key={i} style={{ background: T?.card, border: `1px solid ${T?.border}`, borderRadius: 10, padding: "10px 18px", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 18, color: T?.text }}>{s.v}</span>
            <span style={{ fontSize: 11, color: T?.text3 }}>{s.l}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T?.text3 }}>
          <div style={{ display: "inline-flex", marginBottom: 14, animation: "spin 1s linear infinite", color: "#a78bfa" }}>
            <Sparkles style={iconSize(24, 28)} />
          </div>
          <div style={{ fontSize: 14, color: T?.text2 }}>Finding your best matches…</div>
        </div>
      ) : fetchError ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T?.text3 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, color: "#f87171" }}>
            <AlertTriangle style={iconSize(32, 38)} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#f87171", marginBottom: 6 }}>Failed to load profiles</div>
          <div style={{ fontSize: 13 }}>{fetchError}</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T?.text3 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Search style={iconSize(32, 38)} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: T?.text2, marginBottom: 6 }}>No builders found</div>
          <div style={{ fontSize: 13 }}>Try adjusting your filters</div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: effectiveView === "list" ? "1fr" : "repeat(auto-fill,minmax(280px,1fr))", gap: effectiveView === "list" ? 10 : 16, alignItems: "start" }}>
            {paginated.map((u, i) => (
              effectiveView === "list"
                ? <ListCard key={u.id} u={u} i={i} T={T} dark={dark} onConnect={handleConnect} onBlock={handleBlock} liked={liked} setLiked={setLiked} aiText={aiText} aiLoading={aiLoading} handleAI={handleAI} onMessage={onMessage} scoreColor={scoreColor} onViewProfile={handleRequestViewProfile} setProfiles={setProfiles} />
                : <GridCard key={u.id} u={u} i={i} T={T} dark={dark} onConnect={handleConnect} onBlock={handleBlock} liked={liked} setLiked={setLiked} aiText={aiText} aiLoading={aiLoading} handleAI={handleAI} onMessage={onMessage} scoreColor={scoreColor} onViewProfile={handleRequestViewProfile} onFavourite={handleFavourite} setProfiles={setProfiles} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} T={T} dark={dark} />
        </>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes blink   { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        @keyframes marqueeLTR { from { transform: translateX(-50%); } to { transform: translateX(0%); } }

        @media (max-width: ${MOBILE_BREAKPOINT}px) {
          .card { padding: 14px !important; }
        }
      `}</style>
    </div>
  );
}

// ── Grid Card ─────────────────────────────────────────────────────────────────
function GridCard({ u, i, T, dark, onConnect, onBlock, liked, setLiked, aiText, aiLoading, handleAI, onMessage, scoreColor, onViewProfile, onFavourite }) {
  const isFav = u.isFavourited;
  return (
    <div className="card fade-up" style={{ padding: 20, position: "relative", overflow: "hidden", animationDelay: `${i * 0.06}s`, cursor: "default", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle,${hsla(u.hue, 70, 60, dark ? 0.08 : 0.05)} 0%,transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ position: "relative" }}>
          <Avatar u={u} size={48} radius={10} T={T} dark={dark} />
          <div style={{ position: "absolute", bottom: -1, right: -1, width: 8, height: 8, borderRadius: "50%", background: u.online ? "#22c55e" : "#57575f", border: `2px solid ${dark ? "#0a0a0f" : "#fafafa"}` }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T?.text }}>{u.name}</div>
          <div style={{ fontSize: 11, color: T?.text3, marginTop: 1 }}>@{u.handle}</div>
          <div style={{ fontSize: 11, color: hsl(u.hue), fontWeight: 500, marginTop: 2 }}>{u.role}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 20, color: scoreColor(u.matchScore), lineHeight: 1 }}>{u.matchScore}%</div>
          <div style={{ fontSize: 9, color: T?.text3, marginTop: 1 }}>match</div>
        </div>
      </div>
      <div style={{ height: 3, background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)", borderRadius: 99, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ height: "100%", width: `${u.matchScore}%`, background: `linear-gradient(90deg,hsl(${u.hue},70%,45%),hsl(${u.hue},80%,65%))`, borderRadius: 99, transition: "width 1s" }} />
      </div>
      <p style={{ fontSize: 12, color: T?.text2, lineHeight: 1.55, marginBottom: 12 }}>{u.bio}</p>
      <div style={{ marginBottom: 8 }}>
        <Lbl T={T}>Has</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {u.skillsHave.map(s => <span key={s} style={{ padding: "3px 9px", borderRadius: 6, fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }}>{s}</span>)}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <Lbl T={T}>Needs</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {u.skillsNeed.map(s => <span key={s} style={{ padding: "3px 9px", borderRadius: 6, fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText }}>{s}</span>)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: T?.text3 }}><MapPin style={iconSize(11, 13)} /> {u.location || "Location not set"}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: T?.text3 }}><Folder style={iconSize(11, 13)} /> <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{u.projects}</span> projects</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: T?.text3 }}><Star style={iconSize(11, 13)} /> <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{u.followers}</span></span>
      </div>
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", padding: "3px 10px", borderRadius: 6, background: hsla(u.hue, 70, 60, dark ? 0.12 : 0.08), border: `1px solid ${hsla(u.hue, 70, 60, 0.25)}`, color: hsl(u.hue) }}>Seeking {u.lookingFor}</span>
      </div>

      {aiText[u.id] && <ResizableAIBox text={aiText[u.id]} dark={dark} T={T} />}

      <div style={{ display: "flex", gap: 6, marginTop: "auto", flexWrap: "wrap" }}>
        <StatusButton connectionStatus={u.connectionStatus} onClick={() => onConnect(u)} />
        <button onClick={() => onFavourite(u)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 10px", background: "transparent", border: `1px solid ${isFav ? "rgba(248,113,113,0.3)" : T?.border}`, color: isFav ? "#f87171" : T?.text3, borderRadius: 8, cursor: "pointer", transition: "border-color 0.15s,color 0.15s" }}>
          <Heart style={{ ...iconSize(13, 15), fill: isFav ? "#f87171" : "none" }} />
        </button>
        <button onClick={() => handleAI(u)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 10px", background: aiText[u.id] ? (dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.08)") : "transparent", border: `1px solid ${aiText[u.id] ? "rgba(124,58,237,0.3)" : T?.border}`, color: aiText[u.id] ? "#a78bfa" : T?.text3, borderRadius: 8, cursor: "pointer", transition: "border-color 0.15s,color 0.15s" }}>
          <Sparkles style={{ ...iconSize(13, 15), animation: aiLoading === u.id ? "spin 0.9s linear infinite" : "none" }} />
        </button>
        <button onClick={() => onMessage(u)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 10px", background: "transparent", border: `1px solid ${T?.border}`, color: T?.text3, borderRadius: 8, cursor: "pointer" }}>
          <MessageSquare style={iconSize(13, 15)} />
        </button>
        <button onClick={() => onBlock(u)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 10px", background: "transparent", border: `1px solid ${u.connectionStatus === "blocked" ? "rgba(239,68,68,0.3)" : T?.border}`, color: u.connectionStatus === "blocked" ? "#f87171" : T?.text3, borderRadius: 8, cursor: "pointer" }}>
          <Ban style={iconSize(13, 15)} />
        </button>
        {/* Opens the confirm modal — parent decides navigation once the user picks "Learn More" */}
        <button onClick={(e) => onViewProfile?.(u, e)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 10px", background: "transparent", border: `1px solid ${T?.border}`, color: T?.text3, borderRadius: 8, cursor: "pointer" }}>
          <ExternalLink style={iconSize(13, 15)} />
        </button>
      </div>
    </div>
  );
}

// ── List Card (desktop only — not rendered on mobile) ──────────────────────
function ListCard({ u, i, T, dark, onConnect, onBlock, liked, setLiked, aiText, aiLoading, handleAI, onMessage, scoreColor, onViewProfile }) {
  return (
    <div className="card fade-up" style={{ padding: "14px 18px", display: "flex", gap: 14, alignItems: "center", animationDelay: `${i * 0.04}s`, flexWrap: "wrap" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar u={u} size={42} radius={9} T={T} dark={dark} />
        <div style={{ position: "absolute", bottom: -1, right: -1, width: 7, height: 7, borderRadius: "50%", background: u.online ? "#22c55e" : "#57575f", border: `2px solid ${dark ? "#0a0a0f" : "#fafafa"}` }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T?.text }}>{u.name}</span>
          <span style={{ fontSize: 11, color: hsl(u.hue), fontWeight: 600 }}>{u.role}</span>
          <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", padding: "2px 8px", borderRadius: 6, background: hsla(u.hue, 70, 60, dark ? 0.1 : 0.07), border: `1px solid ${hsla(u.hue, 70, 60, 0.22)}`, color: hsl(u.hue) }}>{u.lookingFor}</span>
          {u.connectionStatus && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", padding: "2px 8px", borderRadius: 6, background: u.connectionStatus === "accepted" ? "rgba(74,222,128,0.08)" : u.connectionStatus === "pending" ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${u.connectionStatus === "accepted" ? "rgba(74,222,128,0.25)" : u.connectionStatus === "pending" ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"}`, color: u.connectionStatus === "accepted" ? "#4ade80" : u.connectionStatus === "pending" ? "#f59e0b" : "#f87171" }}>
              {u.connectionStatus === "accepted"
                ? <><Check style={iconSize(9, 11)} /> Connected</>
                : u.connectionStatus === "pending"
                  ? <><Clock style={iconSize(9, 11)} /> Pending</>
                  : <><Ban style={iconSize(9, 11)} /> Blocked</>}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {u.skillsHave.slice(0, 3).map(s => <span key={s} style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }}>{s}</span>)}
          {u.skillsNeed.slice(0, 2).map(s => <span key={s} style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText }}>{s}</span>)}
        </div>
        <div style={{ marginTop: 4 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: T?.text3 }}><MapPin style={iconSize(11, 13)} /> {u.location || "Location not set"}</span>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 18, color: scoreColor(u.matchScore), lineHeight: 1 }}>{u.matchScore}%</div>
        <div style={{ fontSize: 10, color: T?.text3 }}>match</div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <StatusButton connectionStatus={u.connectionStatus} onClick={() => onConnect(u)} size="small" extraStyle={{ flex: "none", padding: "6px 14px" }} />
        <button onClick={() => onBlock(u)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 10px", background: "transparent", border: `1px solid ${u.connectionStatus === "blocked" ? "rgba(239,68,68,0.3)" : T?.border}`, color: u.connectionStatus === "blocked" ? "#f87171" : T?.text3, borderRadius: 8, cursor: "pointer" }}>
          <Ban style={iconSize(12, 14)} />
        </button>
        <button onClick={() => onMessage(u)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 10px", background: "transparent", border: `1px solid ${T?.border}`, color: T?.text3, borderRadius: 8, cursor: "pointer" }}>
          <MessageSquare style={iconSize(12, 14)} />
        </button>
        <button onClick={(e) => onViewProfile?.(u, e)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 10px", background: "transparent", border: `1px solid ${T?.border}`, color: T?.text3, borderRadius: 8, cursor: "pointer" }}>
          <ExternalLink style={iconSize(12, 14)} />
        </button>
      </div>
    </div>
  );
}