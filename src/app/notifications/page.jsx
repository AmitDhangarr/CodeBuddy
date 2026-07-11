"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Users, Star, MessageSquare, Sparkles, Trash2, CheckCircle2, Info, Sun, Moon,
  Check, PartyPopper, Handshake, Bell, ArrowRight,
} from "lucide-react";

const iconSize = (min, max, vw = 3.2) => ({
  width: `clamp(${min}px, ${vw}vw, ${max}px)`,
  height: `clamp(${min}px, ${vw}vw, ${max}px)`,
  flexShrink: 0,
});

const RADIUS = { control: 8, pill: 6, card: 10, modal: 14 };
const ACCENT = "#7c3aed";

const hsl = (h, s = 70, l = 60) => `hsl(${h},${s}%,${l}%)`;
const hsla = (h, s = 70, l = 60, a = 0.12) => `hsla(${h},${s}%,${l}%,${a})`;

const THEME = {
  dark: {
    bg: "#07070f", bg2: "#0d0d1a", bg3: "#111124",
    navBg: "rgba(7,7,15,0.85)",
    border: "rgba(255,255,255,0.1)", border2: "rgba(255,255,255,0.14)", border3: "rgba(255,255,255,0.18)",
    text: "#e4e4f0", text2: "#8888aa", text3: "#44445a",
    card: "rgba(255,255,255,0.025)", cardHover: "rgba(255,255,255,0.04)",
    unreadBg: "rgba(124,58,237,0.06)", unreadBorder: "rgba(124,58,237,0.18)",
    tabActive: "rgba(124,58,237,0.14)", tabActiveBorder: "rgba(124,58,237,0.4)",
    surfaceA: "rgba(124,58,237,0.06)", surfaceBorder: "rgba(139,92,246,0.18)",
    dangerBg: "rgba(239,68,68,0.08)", dangerBorder: "rgba(239,68,68,0.2)", dangerText: "#f87171",
    successBg: "rgba(34,197,94,0.08)", successBorder: "rgba(34,197,94,0.2)", successText: "#4ade80",
  },
  light: {
    bg: "#f4f4f8", bg2: "#ffffff", bg3: "#f0f0f6",
    navBg: "rgba(244,244,248,0.85)",
    border: "rgba(0,0,0,0.09)", border2: "rgba(0,0,0,0.13)", border3: "rgba(0,0,0,0.2)",
    text: "#18182c", text2: "#555570", text3: "#9090b0",
    card: "#ffffff", cardHover: "#f7f7fc",
    unreadBg: "rgba(124,58,237,0.05)", unreadBorder: "rgba(124,58,237,0.15)",
    tabActive: "rgba(124,58,237,0.09)", tabActiveBorder: "rgba(124,58,237,0.35)",
    surfaceA: "rgba(124,58,237,0.05)", surfaceBorder: "rgba(124,58,237,0.15)",
    dangerBg: "rgba(239,68,68,0.07)", dangerBorder: "rgba(239,68,68,0.18)", dangerText: "#dc2626",
    successBg: "rgba(34,197,94,0.07)", successBorder: "rgba(34,197,94,0.18)", successText: "#16a34a",
  },
};

const NOTIFICATION_TYPES = {
  connection: { Icon: Users, color: 259, label: "Connection" },
  endorsement: { Icon: Star, color: 38, label: "Endorsement" },
  message: { Icon: MessageSquare, color: 200, label: "Message" },
  match: { Icon: Sparkles, color: 280, label: "Match" },
};

const INITIAL_NOTIFICATIONS = [
  {
    id: 1, type: "match", read: false,
    title: "New high-confidence match found",
    body: "Ishaan Verma (Rust, Go) is a 91% match — complementing your frontend stack perfectly.",
    user: { name: "Ishaan Verma", avatar: "IV", hue: 200 },
    time: "2 min ago", cta: "View match",
  },
  {
    id: 2, type: "connection", read: false,
    title: "Kavya Reddy sent a connection request",
    body: "ML Researcher working on diffusion models for code generation. Wants your React expertise.",
    user: { name: "Kavya Reddy", avatar: "KR", hue: 320 },
    time: "18 min ago", cta: "Review request",
  },
  {
    id: 3, type: "endorsement", read: false,
    title: "Aanya Sharma endorsed your React skill",
    body: "\"One of the best React developers I've collaborated with. Shipped production features fast.\"",
    user: { name: "Aanya Sharma", avatar: "AS", hue: 259 },
    time: "1 hr ago", cta: "See profile",
  },
  {
    id: 4, type: "message", read: false,
    title: "New message from Rohan Mehra",
    body: "Hey! I finished the Figma wireframes for the dashboard. Can you review when you get a chance?",
    user: { name: "Rohan Mehra", avatar: "RM", hue: 340 },
    time: "2 hr ago", cta: "Reply",
  },
  {
    id: 5, type: "match", read: true,
    title: "3 new builders match your profile",
    body: "Nia Okafor (Solidity · 83%), Yuki Tanaka (Swift · 76%), Dev Kapoor (Rust · 74%) are waiting.",
    user: null,
    time: "5 hr ago", cta: "View all matches",
  },
  {
    id: 6, type: "endorsement", read: true,
    title: "Priya Nair endorsed your TypeScript skill",
    body: "\"Clean, typed code. A pleasure to review PRs from.\"",
    user: { name: "Priya Nair", avatar: "PN", hue: 158 },
    time: "Yesterday", cta: "See profile",
  },
  {
    id: 7, type: "connection", read: true,
    title: "Siddharth Jain accepted your request",
    body: "You're now connected! Start a conversation or open a project room together.",
    user: { name: "Siddharth Jain", avatar: "SJ", hue: 40 },
    time: "Yesterday", cta: "Send message",
  },
  {
    id: 8, type: "message", read: true,
    title: "Aanya Sharma sent you a file",
    body: "Shared design.figma (3.2 MB) in your project room — Notara Dashboard.",
    user: { name: "Aanya Sharma", avatar: "AS", hue: 259 },
    time: "2 days ago", cta: "View file",
  },
  {
    id: 9, type: "endorsement", read: true,
    title: "Rohan Mehra endorsed your UI/UX skill",
    body: "\"Exceptional visual instinct. Turns requirements into elegant interfaces every time.\"",
    user: { name: "Rohan Mehra", avatar: "RM", hue: 340 },
    time: "3 days ago", cta: "See profile",
  },
  {
    id: 10, type: "match", read: true,
    title: "Weekly match digest ready",
    body: "You received 7 new match suggestions this week based on your updated skill profile.",
    user: null,
    time: "4 days ago", cta: "View digest",
  },
];

const Logo = () => (
  <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill="#1a0a6a" />
    <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff" />
  </svg>
);

const Avatar = ({ u, size = 38, dark }) => (
  <div style={{ width: size, height: size, borderRadius: RADIUS.card, background: hsla(u.hue, 70, 60, dark ? 0.14 : 0.1), border: `1px solid ${hsla(u.hue, 70, 60, 0.28)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.3, fontWeight: 700, color: hsl(u.hue), flexShrink: 0, fontFamily: "'JetBrains Mono',monospace" }}>
    {u.avatar}
  </div>
);

const TypeIcon = ({ type, dark }) => {
  const cfg = NOTIFICATION_TYPES[type];
  return (
    <div style={{ width: 30, height: 30, borderRadius: RADIUS.control, background: hsla(cfg.color, 70, 60, dark ? 0.14 : 0.1), border: `1px solid ${hsla(cfg.color, 70, 60, 0.28)}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <cfg.Icon style={{ ...iconSize(13, 14, 2), color: hsl(cfg.color) }} />
    </div>
  );
};

const SystemAvatar = ({ type, dark }) => {
  const cfg = NOTIFICATION_TYPES[type];
  return (
    <div style={{ width: 38, height: 38, borderRadius: RADIUS.card, background: hsla(cfg.color, 70, 60, dark ? 0.14 : 0.1), border: `1px solid ${hsla(cfg.color, 70, 60, 0.28)}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <cfg.Icon style={{ ...iconSize(16, 18, 2.4), color: hsl(cfg.color) }} />
    </div>
  );
};

const ConfirmModal = ({ T, title, message, confirmLabel, onConfirm, onCancel }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(6px)", animation: "fadeIn 0.18s ease both" }}>
    <div style={{ background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: RADIUS.modal, padding: "36px 32px", width: "min(360px, calc(100vw - 32px))", textAlign: "center", animation: "modalIn 0.26s cubic-bezier(0.16,1,0.3,1) both" }}>
      <div style={{ width: 52, height: 52, borderRadius: RADIUS.card, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <Trash2 style={{ ...iconSize(20, 22, 3), color: "#ef4444" }} />
      </div>
      <h3 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 20, color: T.text, marginBottom: 9, letterSpacing: "-0.5px" }}>{title}</h3>
      <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.65, marginBottom: 26 }}>{message}</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", background: "transparent", border: `1px solid ${T.border}`, borderRadius: RADIUS.control, color: T.text2, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>Cancel</button>
        <button
          onClick={onConfirm}
          style={{ flex: 1, padding: "10px 0", background: "#dc2626", border: "1px solid #dc2626", borderRadius: RADIUS.control, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "filter 0.15s ease" }}
          onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.filter = ""; }}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default function Notifications({ dark = true, onThemeToggle }) {
  const T = dark ? THEME.dark : THEME.light;
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const FILTERS = [
    { key: "all", label: "All", count: notifications.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "match", label: "Matches", count: notifications.filter(n => n.type === "match").length },
    { key: "connection", label: "Connections", count: notifications.filter(n => n.type === "connection").length },
    { key: "endorsement", label: "Endorsements", count: notifications.filter(n => n.type === "endorsement").length },
    { key: "message", label: "Messages", count: notifications.filter(n => n.type === "message").length },
  ];

  const filtered = notifications.filter(n => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.read;
    return n.type === activeFilter;
  });

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast("All notifications marked as read");
  };

  const deleteOne = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast("Notification removed.", "info");
  };

  const clearAll = () => {
    const target = activeFilter === "all" ? notifications : filtered;
    const ids = new Set(target.map(n => n.id));
    setNotifications(prev => prev.filter(n => !ids.has(n.id)));
    setModal(null);
    showToast(`${ids.size} notification${ids.size !== 1 ? "s" : ""} cleared.`, "info");
  };

  const TYPE_COLORS = {
    connection: { bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.22)", text: "#818cf8", label: "Connection" },
    endorsement: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.22)", text: "#fbbf24", label: "Endorsement" },
    message: { bg: "rgba(14,165,233,0.1)", border: "rgba(14,165,233,0.22)", text: "#38bdf8", label: "Message" },
    match: { bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.22)", text: "#a78bfa", label: "Match" },
  };

  const EMPTY_ICONS = { unread: PartyPopper, match: Sparkles, connection: Handshake, endorsement: Star, message: MessageSquare, all: Bell };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)"};border-radius:99px}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes modalIn{from{opacity:0;transform:scale(0.95) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.85)}}
    .notif-card{background:${T.card};border:1px solid ${T.border};border-radius:${RADIUS.card}px;padding:18px;transition:background 0.15s ease,border-color 0.15s ease;animation:fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both;position:relative;overflow:hidden}
    .notif-card:hover{background:${T.cardHover};border-color:${dark ? "rgba(139,92,246,0.22)" : "rgba(139,92,246,0.2)"}}
    .notif-card.unread{background:${T.unreadBg};border-color:${T.unreadBorder}}
    .notif-card.unread::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:${ACCENT};border-radius:2px 0 0 2px}
    .tab-btn{background:transparent;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:12px;font-weight:600;padding:7px 13px;border-radius:${RADIUS.control}px;transition:color 0.15s ease,background 0.15s ease;color:${T.text3};white-space:nowrap}
    .tab-btn:hover{color:${T.text2};background:${T.surfaceA}}
    .tab-btn.active{color:#a78bfa;background:${T.tabActive};box-shadow:inset 0 0 0 1px ${T.tabActiveBorder}}
    .count-badge{background:rgba(124,58,237,0.15);color:#a78bfa;border-radius:${RADIUS.pill}px;padding:1px 7px;font-size:10px;font-weight:700;font-family:'JetBrains Mono',monospace}
    .unread-dot{width:7px;height:7px;border-radius:50%;background:${ACCENT};flex-shrink:0;animation:pulse 2s ease-in-out infinite}
    .action-btn{background:transparent;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:11px;font-weight:600;padding:5px 10px;border-radius:${RADIUS.control}px;transition:color 0.15s ease,background 0.15s ease;display:flex;align-items:center;gap:5px}
    .action-btn.read{color:${T.text3}}
    .action-btn.read:hover{color:${T.text};background:${T.surfaceA}}
    .action-btn.delete{color:${T.text3}}
    .action-btn.delete:hover{color:${dark ? "#f87171" : "#dc2626"};background:${T.dangerBg}}
    .header-btn{background:transparent;border:1px solid ${T.border};color:${T.text3};padding:7px 14px;border-radius:${RADIUS.control}px;font-family:'Inter',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:border-color 0.15s ease,color 0.15s ease;display:flex;align-items:center;gap:6px}
    .header-btn:hover{border-color:${T.border2};color:${T.text}}
    .header-btn.danger:hover{border-color:${T.dangerBorder};color:${T.dangerText};background:${T.dangerBg}}
    .cta-link{background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:12px;font-weight:700;color:#a78bfa;padding:0;transition:opacity 0.15s ease;display:inline-flex;align-items:center;gap:4px}
    .cta-link:hover{opacity:0.75;text-decoration:underline}
    .type-pill{padding:2px 8px;border-radius:${RADIUS.pill}px;font-size:10px;font-weight:700;letter-spacing:0.3px;border:1px solid}
    @media(max-width:600px){
      .notif-actions{flex-wrap:wrap!important;gap:6px!important}
      .filter-tabs{gap:4px!important}
      .filter-tabs .tab-btn{padding:6px 10px!important;font-size:11px!important}
      .header-actions{flex-wrap:wrap!important;gap:8px!important}
    }
    @media(max-width:480px){
      .count-label{display:none}
    }
  `;

  const groupedByDay = (list) => {
    const groups = {};
    list.forEach(n => {
      const day = n.time.includes("min") || n.time.includes("hr") ? "Today" :
        n.time.includes("Yesterday") ? "Yesterday" : "Older";
      if (!groups[day]) groups[day] = [];
      groups[day].push(n);
    });
    return groups;
  };

  const groups = groupedByDay(filtered);
  const dayOrder = ["Today", "Yesterday", "Older"];
  const EmptyIcon = EMPTY_ICONS[activeFilter] || Bell;

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{css}</style>

      <nav style={{ background: T.navBg, backdropFilter: "blur(28px)", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(16px,5vw,32px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Logo />
          <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 17, color: T.text }}>CodeBuddy</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        </div>
      </nav>

      {modal && (
        <ConfirmModal
          T={T}
          title={modal.title}
          message={modal.message}
          confirmLabel={modal.confirmLabel}
          onConfirm={modal.onConfirm}
          onCancel={() => setModal(null)}
        />
      )}

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000, background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: RADIUS.card, padding: "13px 18px", display: "flex", alignItems: "center", gap: 10, animation: "toastIn 0.3s ease both", maxWidth: 300 }}>
          {toast.type === "success" ? <CheckCircle2 style={{ ...iconSize(15, 16, 2), color: "#4ade80" }} /> : <Info style={{ ...iconSize(15, 16, 2), color: "#818cf8" }} />}
          <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{toast.msg}</span>
        </div>
      )}

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(28px,4vw,40px) clamp(16px,4vw,32px)" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: "clamp(24px,6vw,34px)", color: T.text, letterSpacing: "-1px", lineHeight: 1.1 }}>
                    Notifications
                  </h1>
                  {unreadCount > 0 && (
                    <div style={{ background: ACCENT, borderRadius: RADIUS.pill, padding: "3px 10px", fontSize: 12, fontWeight: 700, color: "white", lineHeight: 1, fontFamily: "'JetBrains Mono',monospace" }}>
                      {unreadCount} new
                    </div>
                  )}
                </div>
                <p style={{ fontSize: 13, color: T.text3 }}>
                  {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}.` : "You're all caught up!"}
                </p>
              </div>
            </div>

            <div className="header-actions" style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
              {onThemeToggle && (
                <button onClick={onThemeToggle} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: RADIUS.control, padding: "7px 12px", cursor: "pointer", color: T.text3, display: "flex", alignItems: "center" }}>
                  {dark ? <Sun style={iconSize(15, 16, 2)} /> : <Moon style={iconSize(15, 16, 2)} />}
                </button>
              )}
              {unreadCount > 0 && (
                <button className="header-btn" onClick={markAllRead}>
                  <Check style={iconSize(13, 14, 2)} />
                  <span>Mark all read</span>
                </button>
              )}
              {filtered.length > 0 && (
                <button className="header-btn danger" onClick={() =>
                  setModal({
                    title: "Clear notifications?",
                    message: `This will permanently remove ${activeFilter === "all" ? "all" : `${filtered.length}`} notification${filtered.length !== 1 ? "s" : ""}. This cannot be undone.`,
                    confirmLabel: "Clear all",
                    onConfirm: clearAll,
                  })
                }>
                  <Trash2 style={iconSize(13, 14, 2)} />
                  <span>Clear {activeFilter !== "all" ? "filtered" : "all"}</span>
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(TYPE_COLORS).map(([type, cfg]) => {
              const cnt = notifications.filter(n => n.type === type && !n.read).length;
              if (cnt === 0) return null;
              return (
                <div key={type} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: RADIUS.pill, padding: "4px 11px", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: cfg.text, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{cnt} {cfg.label}{cnt !== 1 ? "s" : ""}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="filter-tabs" style={{ display: "flex", gap: 4, marginBottom: 20, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: RADIUS.card, padding: 5, overflowX: "auto" }}>
          {FILTERS.map(f => (
            <button key={f.key} className={`tab-btn${activeFilter === f.key ? " active" : ""}`} onClick={() => setActiveFilter(f.key)}>
              {f.label}
              {f.count > 0 && (
                <span className="count-badge" style={{ marginLeft: 5 }}>{f.count}</span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: RADIUS.card, padding: "64px 24px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: RADIUS.card, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.16)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <EmptyIcon style={{ ...iconSize(22, 26, 3.5), color: "#a78bfa" }} />
            </div>
            <h3 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 18, color: T.text, marginBottom: 8, letterSpacing: "-0.4px" }}>
              {activeFilter === "unread" ? "All caught up!" : `No ${activeFilter === "all" ? "" : activeFilter + " "}notifications`}
            </h3>
            <p style={{ fontSize: 13, color: T.text3, lineHeight: 1.65, maxWidth: 300, margin: "0 auto" }}>
              {activeFilter === "unread" ? "You've read everything. Check back later for updates." : "New notifications will appear here when they arrive."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {dayOrder.filter(d => groups[d]).map(day => (
              <div key={day}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: T.text3, fontFamily: "'JetBrains Mono',monospace" }}>{day}</span>
                  <div style={{ flex: 1, height: "1px", background: T.border }} />
                  <span style={{ fontSize: 11, color: T.text3, fontFamily: "'JetBrains Mono',monospace" }}>{groups[day].length}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {groups[day].map((notif, i) => {
                    const typeCfg = TYPE_COLORS[notif.type];
                    const isHovered = hoveredId === notif.id;
                    return (
                      <div
                        key={notif.id}
                        className={`notif-card${!notif.read ? " unread" : ""}`}
                        style={{ animationDelay: `${i * 0.05}s` }}
                        onMouseEnter={() => setHoveredId(notif.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            {notif.user
                              ? <Avatar u={notif.user} size={38} dark={dark} />
                              : <SystemAvatar type={notif.type} dark={dark} />
                            }
                            {notif.user && (
                              <div style={{ position: "absolute", bottom: -4, right: -4 }}>
                                <TypeIcon type={notif.type} dark={dark} />
                              </div>
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.4, flex: 1 }}>{notif.title}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                <span className="type-pill" style={{ background: typeCfg.bg, borderColor: typeCfg.border, color: typeCfg.text }}>{typeCfg.label}</span>
                                {!notif.read && <span className="unread-dot" />}
                              </div>
                            </div>

                            <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.62, marginBottom: 12 }}>{notif.body}</p>

                            <div className="notif-actions" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                <button className="cta-link">{notif.cta}<ArrowRight style={iconSize(10, 11, 2)} /></button>
                                <span style={{ color: T.border3, fontSize: 10 }}>·</span>
                                {!notif.read && (
                                  <button className="action-btn read" onClick={() => markRead(notif.id)}>
                                    <Check style={iconSize(11, 12, 2)} />
                                    Mark read
                                  </button>
                                )}
                                {notif.read && (
                                  <span style={{ fontSize: 11, color: T.text3, display: "flex", alignItems: "center", gap: 4 }}>
                                    <Check style={iconSize(10, 11, 2)} />
                                    Read
                                  </span>
                                )}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 11, color: T.text3, fontFamily: "'JetBrains Mono',monospace" }}>{notif.time}</span>
                                <button
                                  className="action-btn delete"
                                  onClick={() => deleteOne(notif.id)}
                                  title="Remove notification"
                                  style={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.15s ease, color 0.15s ease, background 0.15s ease" }}
                                >
                                  <Trash2 style={iconSize(12, 13, 2)} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 32, padding: "20px 0", borderTop: `1px solid ${T.border}` }}>
            <p style={{ fontSize: 12, color: T.text3 }}>
              Showing {filtered.length} of {notifications.length} notifications
              {unreadCount > 0 && ` · ${unreadCount} unread`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}