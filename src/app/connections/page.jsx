"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
const hsl = (h, s = 70, l = 60) => `hsl(${h},${s}%,${l}%)`;
const hsla = (h, s = 70, l = 60, a = 0.12) => `hsla(${h},${s}%,${l}%,${a})`;


const THEME = {
  dark: {
    bg: "#07070f", bg2: "#0d0d1a", bg3: "#111124",
    border: "rgba(255,255,255,0.06)", border2: "rgba(255,255,255,0.11)", border3: "rgba(255,255,255,0.17)",
    text: "#e4e4f0", text2: "#8888aa", text3: "#44445a",
    card: "rgba(255,255,255,0.025)", cardHover: "rgba(255,255,255,0.04)",
    input: "rgba(255,255,255,0.04)", inputBorder: "rgba(255,255,255,0.08)",
    shadow: "0 24px 64px rgba(0,0,0,0.55)",
    skillHaveBg: "rgba(34,197,94,0.08)", skillHaveBorder: "rgba(34,197,94,0.2)", skillHaveText: "#4ade80",
    skillNeedBg: "rgba(99,102,241,0.08)", skillNeedBorder: "rgba(99,102,241,0.22)", skillNeedText: "#818cf8",
    aiBg: "rgba(60,40,140,0.12)", aiBorder: "rgba(120,80,255,0.18)",
    dangerBg: "rgba(239,68,68,0.08)", dangerBorder: "rgba(239,68,68,0.2)", dangerText: "#f87171",
    warnBg: "rgba(245,158,11,0.08)", warnBorder: "rgba(245,158,11,0.2)", warnText: "#fbbf24",
    surfaceA: "rgba(124,58,237,0.06)", surfaceBorder: "rgba(124,58,237,0.15)",
    tabActive: "rgba(124,58,237,0.14)", tabActiveBorder: "rgba(124,58,237,0.4)",
    searchBg: "rgba(255,255,255,0.03)",
  },
  light: {
    bg: "#f4f4f8", bg2: "#ffffff", bg3: "#f0f0f6",
    border: "rgba(0,0,0,0.07)", border2: "rgba(0,0,0,0.13)", border3: "rgba(0,0,0,0.2)",
    text: "#18182c", text2: "#555570", text3: "#9090b0",
    card: "#ffffff", cardHover: "#f7f7fc",
    input: "#ffffff", inputBorder: "rgba(0,0,0,0.1)",
    shadow: "0 20px 60px rgba(0,0,0,0.1)",
    skillHaveBg: "rgba(34,197,94,0.09)", skillHaveBorder: "rgba(34,197,94,0.28)", skillHaveText: "#16a34a",
    skillNeedBg: "rgba(99,102,241,0.09)", skillNeedBorder: "rgba(99,102,241,0.28)", skillNeedText: "#4338ca",
    aiBg: "rgba(124,58,237,0.06)", aiBorder: "rgba(124,58,237,0.18)",
    dangerBg: "rgba(239,68,68,0.07)", dangerBorder: "rgba(239,68,68,0.18)", dangerText: "#dc2626",
    warnBg: "rgba(245,158,11,0.07)", warnBorder: "rgba(245,158,11,0.18)", warnText: "#d97706",
    surfaceA: "rgba(124,58,237,0.05)", surfaceBorder: "rgba(124,58,237,0.15)",
    tabActive: "rgba(124,58,237,0.09)", tabActiveBorder: "rgba(124,58,237,0.35)",
    searchBg: "#ffffff",
  },
};

const MOCK_CONNECTIONS = {
  pending: [
    { id: 1, name: "Ishaan Verma", handle: "ishaan.rust", role: "Systems Engineer · Delhi", avatar: "IV", hue: 200, bio: "Distributed systems at scale. Building a high-frequency trading infra tool.", skillsHave: ["Rust", "Go", "Redis"], skillsNeed: ["React", "UI/UX"], match: 91, time: "2 min ago", mutual: 3 },
    { id: 2, name: "Kavya Reddy", handle: "kavya.ml", role: "ML Researcher · Hyderabad", avatar: "KR", hue: 320, bio: "Working on diffusion models for code generation. Need frontend wizardry.", skillsHave: ["Python", "PyTorch", "CUDA"], skillsNeed: ["React", "Next.js", "Figma"], match: 87, time: "18 min ago", mutual: 1 },
    { id: 3, name: "Siddharth Jain", handle: "sid.fullstack", role: "Full Stack Dev · Pune", avatar: "SJ", hue: 40, bio: "Ex-Razorpay. Building a B2B SaaS fintech product. Need mobile expertise.", skillsHave: ["Node.js", "TypeScript", "PostgreSQL"], skillsNeed: ["Flutter", "iOS"], match: 79, time: "1 hr ago", mutual: 5 },
  ],
  sent: [
    { id: 4, name: "Nia Okafor", handle: "nia.web3", role: "Blockchain Dev · Lagos", avatar: "NO", hue: 158, bio: "Smart contracts and DeFi protocols. Scaling a DEX on Polygon.", skillsHave: ["Solidity", "Hardhat", "Ethers.js"], skillsNeed: ["React", "GraphQL"], match: 83, time: "3 hr ago", mutual: 2 },
    { id: 5, name: "Yuki Tanaka", handle: "yuki.ios", role: "iOS Engineer · Tokyo", avatar: "YT", hue: 0, bio: "Shipped 4 apps with 500k+ combined downloads. Obsessed with SwiftUI.", skillsHave: ["Swift", "SwiftUI", "CoreML"], skillsNeed: ["Backend", "Node.js"], match: 76, time: "Yesterday", mutual: 0 },
  ],
  connected: [
    { id: 6, name: "Aanya Sharma", handle: "aanya.dev", role: "Full Stack Engineer · Bangalore", avatar: "AS", hue: 259, bio: "Building SaaS tools. Shipped 2 products together with great momentum.", skillsHave: ["React", "Next.js", "Node.js"], skillsNeed: ["UI/UX", "Figma"], match: 94, time: "Connected 3 days ago", mutual: 8, project: "Collab on: Notara" },
    { id: 7, name: "Rohan Mehra", handle: "rohan.ui", role: "Design Engineer · Mumbai", avatar: "RM", hue: 340, bio: "Designer who writes production code. Currently in a project room together.", skillsHave: ["Figma", "React", "Tailwind"], skillsNeed: ["Node.js", "DevOps"], match: 88, time: "Connected 1 week ago", mutual: 4, project: "Collab on: Slate" },
    { id: 8, name: "Priya Nair", handle: "priya.ml", role: "ML Engineer · Chennai", avatar: "PN", hue: 158, bio: "Research to production pipeline. Looking at another project together.", skillsHave: ["Python", "AWS", "Docker"], skillsNeed: ["React", "TypeScript"], match: 82, time: "Connected 2 weeks ago", mutual: 6, project: null },
  ],
  blocked: [
    { id: 9, name: "Anonymous User", handle: "user_9x2k", role: "Unknown role", avatar: "AU", hue: 0, bio: "Blocked after repeated unsolicited messages.", skillsHave: [], skillsNeed: [], match: 0, time: "Blocked 5 days ago", mutual: 0 },
  ],
};

const Avatar = ({ u, size = 44, radius = 12, dark }) => (
  <div style={{ width: size, height: size, borderRadius: radius, background: hsla(u.hue, 70, 60, dark ? 0.14 : 0.1), border: `1.5px solid ${hsla(u.hue, 70, 60, 0.28)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.29, fontWeight: 700, color: hsl(u.hue), flexShrink: 0, fontFamily: "'Instrument Serif',serif", letterSpacing: "0.5px" }}>
    {u.avatar}
  </div>
);

const Logo = () => (
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill="#1a0a6a" />
      <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff" />
    </svg>
  );

const MatchBadge = ({ val }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.22)", borderRadius: 99, padding: "3px 10px" }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#a78bfa", display: "block" }} />
    <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 15, color: "#a78bfa", lineHeight: 1 }}>{val}%</span>
  </div>
);

const Pill = ({ label, type }) => {
  const T = THEME.dark;
  const style = type === "have"
    ? { background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }
    : { background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText };
  return <span style={{ ...style, padding: "2px 9px", borderRadius: 99, fontSize: 10, fontWeight: 600 }}>{label}</span>;
};

const ConfirmModal = ({ dark, T, title, message, confirmLabel, confirmDanger = false, onConfirm, onCancel, icon = "⚠️" }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(6px)", animation: "fadeIn 0.18s ease both" }}>
    <div style={{ background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 22, padding: "36px 32px", width: "min(360px, calc(100vw - 32px))", boxShadow: T.shadow, textAlign: "center", animation: "modalIn 0.26s cubic-bezier(0.16,1,0.3,1) both" }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: confirmDanger ? "rgba(239,68,68,0.1)" : "rgba(124,58,237,0.1)", border: `1px solid ${confirmDanger ? "rgba(239,68,68,0.22)" : "rgba(124,58,237,0.22)"}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 22 }}>{icon}</div>
      <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: T.text, marginBottom: 9, letterSpacing: "-0.4px" }}>{title}</h3>
      <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.65, marginBottom: 26 }}>{message}</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 11, color: T.text2, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
        <button onClick={onConfirm} style={{ flex: 1, padding: "10px 0", background: confirmDanger ? "linear-gradient(135deg,#dc2626,#ef4444)" : "linear-gradient(135deg,#7c3aed,#a855f7)", border: "none", borderRadius: 11, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: confirmDanger ? "0 4px 16px rgba(220,38,38,0.28)" : "0 4px 16px rgba(124,58,237,0.28)" }}>{confirmLabel}</button>
      </div>
    </div>
  </div>
);

const EmptyState = ({ T, icon, title, sub }) => (
  <div style={{ textAlign: "center", padding: "64px 24px" }}>
    <div style={{ fontSize: 42, marginBottom: 16 }}>{icon}</div>
    <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, color: T.text, marginBottom: 8, letterSpacing: "-0.4px" }}>{title}</h3>
    <p style={{ fontSize: 13, color: T.text3, lineHeight: 1.65 }}>{sub}</p>
  </div>
);

export default function Connections({ dark = true, onThemeToggle }) {
  const T = dark ? THEME.dark : THEME.light;
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [data, setData] = useState(MOCK_CONNECTIONS);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = (action, user) => {
    setModal({ action, user });
  };

  const executeAction = () => {
    const { action, user } = modal;
    setModal(null);

    setData(prev => {
      const next = { ...prev };
      if (action === "accept") {
        next.pending = prev.pending.filter(u => u.id !== user.id);
        next.connected = [{ ...user, time: "Connected just now", project: null }, ...prev.connected];
        showToast(`Connected with ${user.name}! 🎉`);
      } else if (action === "decline") {
        next.pending = prev.pending.filter(u => u.id !== user.id);
        showToast(`Request from ${user.name} declined.`, "info");
      } else if (action === "cancel") {
        next.sent = prev.sent.filter(u => u.id !== user.id);
        showToast(`Request to ${user.name} cancelled.`, "info");
      } else if (action === "remove") {
        next.connected = prev.connected.filter(u => u.id !== user.id);
        showToast(`Removed ${user.name} from connections.`, "warn");
      } else if (action === "block") {
        next.connected = prev.connected.filter(u => u.id !== user.id);
        next.pending = prev.pending.filter(u => u.id !== user.id);
        next.blocked = [{ ...user, time: "Blocked just now" }, ...prev.blocked];
        showToast(`${user.name} has been blocked.`, "warn");
      } else if (action === "unblock") {
        next.blocked = prev.blocked.filter(u => u.id !== user.id);
        showToast(`${user.name} has been unblocked.`, "success");
      }
      return next;
    });
  };

  const filtered = (data[activeTab] || []).filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    u.handle.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { key: "pending", label: "Pending", count: data.pending.length },
    { key: "sent", label: "Sent", count: data.sent.length },
    { key: "connected", label: "Connected", count: data.connected.length },
    { key: "blocked", label: "Blocked", count: data.blocked.length },
  ];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)"};border-radius:99px}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes modalIn{from{opacity:0;transform:scale(0.95) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
    @keyframes slideDown{from{opacity:0;max-height:0}to{opacity:1;max-height:200px}}
    .conn-card{background:${T.card};border:1px solid ${T.border};border-radius:18px;padding:20px;transition:all 0.28s;animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both}
    .conn-card:hover{background:${T.cardHover};border-color:${T.border2};box-shadow:${T.shadow}}
    .tab-btn{background:transparent;border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;padding:8px 16px;border-radius:10px;transition:all 0.18s;color:${T.text3}}
    .tab-btn:hover{color:${T.text2};background:${T.surfaceA}}
    .tab-btn.active{color:#a78bfa;background:${T.tabActive};box-shadow:inset 0 0 0 1px ${T.tabActiveBorder}}
    .icon-btn{background:transparent;border:1px solid ${T.border};color:${T.text3};padding:7px 13px;border-radius:10px;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.18s;display:flex;align-items:center;gap:6px;white-space:nowrap}
    .icon-btn:hover{border-color:${T.border2};color:${T.text}}
    .btn-accept{background:linear-gradient(135deg,#059669,#10b981);border:none;color:white;padding:8px 16px;border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 14px rgba(5,150,105,0.28)}
    .btn-accept:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(5,150,105,0.38)}
    .btn-decline{background:transparent;border:1px solid ${T.dangerBorder};color:${T.dangerText};padding:8px 16px;border-radius:10px;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.18s}
    .btn-decline:hover{background:${T.dangerBg};border-color:${T.dangerText}}
    .btn-cancel{background:transparent;border:1px solid ${T.warnBorder};color:${T.warnText};padding:8px 16px;border-radius:10px;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.18s}
    .btn-cancel:hover{background:${T.warnBg}}
    .btn-message{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:8px 16px;border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 14px rgba(124,58,237,0.28)}
    .btn-message:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(124,58,237,0.4)}
    .btn-unblock{background:transparent;border:1px solid rgba(34,197,94,0.3);color:#4ade80;padding:8px 16px;border-radius:10px;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.18s}
    .btn-unblock:hover{background:rgba(34,197,94,0.08)}
    .search-input{width:100%;background:${T.searchBg};border:1px solid ${T.border2};border-radius:12px;padding:10px 14px 10px 38px;font-family:inherit;font-size:13px;color:${T.text};outline:none;transition:border-color 0.2s}
    .search-input:focus{border-color:rgba(124,58,237,0.4)}
    .search-input::placeholder{color:${T.text3}}
    .count-badge{background:rgba(124,58,237,0.15);color:#a78bfa;border-radius:99px;padding:1px 7px;font-size:10px;font-weight:700;min-width:18px;text-align:center}
    .match-bar{height:3px;background:${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"};border-radius:99px;overflow:hidden;margin-bottom:12px}
    .mutual-badge{display:inline-flex;align-items:center;gap:5px;background:${T.surfaceA};border:1px solid ${T.surfaceBorder};border-radius:99px;padding:2px 9px;font-size:10px;color:#a78bfa;font-weight:600}
    @media(max-width:600px){
      .actions-row{flex-wrap:wrap!important}
      .conn-meta{flex-direction:column!important;align-items:flex-start!important;gap:8px!important}
    }
  `;

  const MODAL_CONFIGS = {
    accept: { title: "Accept request?", message: (u) => `Connect with ${u.name} and start collaborating. They'll be notified immediately.`, confirmLabel: "Accept →", confirmDanger: false, icon: "🤝" },
    decline: { title: "Decline request?", message: (u) => `${u.name}'s connection request will be removed. They won't be notified.`, confirmLabel: "Decline", confirmDanger: true, icon: "🙅" },
    cancel: { title: "Cancel request?", message: (u) => `Your pending request to ${u.name} will be withdrawn.`, confirmLabel: "Cancel request", confirmDanger: true, icon: "↩️" },
    remove: { title: "Remove connection?", message: (u) => `You'll be disconnected from ${u.name}. Any shared project rooms will be unaffected.`, confirmLabel: "Remove", confirmDanger: true, icon: "🔗" },
    block: { title: "Block this user?", message: (u) => `${u.name} won't be able to see your profile or send requests. You can unblock anytime.`, confirmLabel: "Block user", confirmDanger: true, icon: "🚫" },
    unblock: { title: "Unblock user?", message: (u) => `${u.name} will be able to find your profile and send connection requests again.`, confirmLabel: "Unblock", confirmDanger: false, icon: "✅" },
  };

  const renderActions = (user) => {
    if (activeTab === "pending") return (
      <div className="actions-row" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn-accept" onClick={() => handleAction("accept", user)}>Accept</button>
        <button className="btn-decline" onClick={() => handleAction("decline", user)}>Decline</button>
        <button className="icon-btn" onClick={() => handleAction("block", user)} title="Block">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><line x1="3.5" y1="3.5" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Block
        </button>
      </div>
    );
    if (activeTab === "sent") return (
      <div className="actions-row" style={{ display: "flex", gap: 8 }}>
        <button className="btn-cancel" onClick={() => handleAction("cancel", user)}>Withdraw request</button>
      </div>
    );
    if (activeTab === "connected") return (
      <div className="actions-row" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn-message">Message</button>
        <button className="icon-btn" onClick={() => handleAction("remove", user)}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Remove
        </button>
        <button className="icon-btn" onClick={() => handleAction("block", user)}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><line x1="3.5" y1="3.5" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Block
        </button>
      </div>
    );
    if (activeTab === "blocked") return (
      <div className="actions-row" style={{ display: "flex", gap: 8 }}>
        <button className="btn-unblock" onClick={() => handleAction("unblock", user)}>Unblock</button>
      </div>
    );
  };

  const EMPTY = {
    pending: { icon: "📭", title: "No pending requests", sub: "When someone wants to connect with you, they'll appear here." },
    sent: { icon: "📤", title: "No sent requests", sub: "Requests you've sent to other builders will show here." },
    connected: { icon: "🤝", title: "No connections yet", sub: "Accept pending requests or find builders in the Discover tab." },
    blocked: { icon: "🔐", title: "No blocked users", sub: "Users you block will appear here. They cannot view your profile." },
  };

  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh", padding: "clamp(20px,4vw,40px) clamp(16px,4vw,32px)" }}>
      <style>{css}</style>
      {/* Nav */}
      <nav style={{ background: T.navBg, backdropFilter: "blur(28px)", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(16px,5vw,32px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Logo />
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: T.text }}>CodeBuddy</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1060, margin: "0 auto", padding: "clamp(32px,6vw,64px) clamp(16px,5vw,32px)" }}></div>

      {modal && modal.action && (() => {
        const cfg = MODAL_CONFIGS[modal.action];
        return (
          <ConfirmModal
            dark={dark} T={T}
            title={cfg.title}
            message={cfg.message(modal.user)}
            confirmLabel={cfg.confirmLabel}
            confirmDanger={cfg.confirmDanger}
            icon={cfg.icon}
            onConfirm={executeAction}
            onCancel={() => setModal(null)}
          />
        );
      })()}

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000, background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 14, padding: "13px 18px", boxShadow: T.shadow, display: "flex", alignItems: "center", gap: 10, animation: "toastIn 0.3s ease both", minWidth: 220, maxWidth: 320 }}>
          <span style={{ fontSize: 16 }}>{toast.type === "success" ? "✅" : toast.type === "warn" ? "⚠️" : "ℹ️"}</span>
          <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{toast.msg}</span>
        </div>
      )}

      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(24px,6vw,34px)", fontWeight: 400, color: T.text, letterSpacing: "-0.8px", lineHeight: 1.1, marginBottom: 6 }}>
              Connections
            </h1>
            <p style={{ fontSize: 13, color: T.text3 }}>Manage your builder network and collaboration requests.</p>
          </div>
          {onThemeToggle && (
            <button onClick={onThemeToggle} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 14px", cursor: "pointer", color: T.text3, fontSize: 18, display: "flex", alignItems: "center" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: 5, overflowX: "auto" }}>
          {TABS.map(tab => (
            <button key={tab.key} className={`tab-btn${activeTab === tab.key ? " active" : ""}`} onClick={() => { setActiveTab(tab.key); setSearch(""); }}>
              {tab.label}
              {tab.count > 0 && <span className="count-badge" style={{ marginLeft: 6 }}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <svg style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: T.text3, pointerEvents: "none" }} width="16" height="16" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M14 14l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input className="search-input" placeholder="Search by name, role, or handle..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.text3, fontSize: 18, lineHeight: 1 }}>×</button>
          )}
        </div>

        {/* Count line */}
        {filtered.length > 0 && (
          <div style={{ marginBottom: 14, fontSize: 12, color: T.text3 }}>
            {filtered.length} {activeTab === "pending" ? "incoming request" : activeTab === "sent" ? "outgoing request" : activeTab}
            {filtered.length !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
          </div>
        )}

        {/* Cards */}
        {filtered.length === 0 ? (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20 }}>
            <EmptyState T={T} {...(search ? { icon: "🔍", title: "No results found", sub: `No ${activeTab} connections match "${search}". Try a different search.` } : EMPTY[activeTab])} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((user, i) => (
              <div key={user.id} className="conn-card" style={{ animationDelay: `${i * 0.06}s` }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <Avatar u={user} size={48} radius={13} dark={dark} />
                    {activeTab === "connected" && (
                      <div style={{ position: "absolute", bottom: -2, right: -2, width: 13, height: 13, borderRadius: "50%", background: "#22c55e", border: `2px solid ${T.bg}`, boxShadow: "0 0 8px rgba(34,197,94,0.5)" }} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="conn-meta" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 5 }}>
                      <div>
                        <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{user.name}</span>
                        <span style={{ fontSize: 12, color: T.text3, marginLeft: 7 }}>@{user.handle}</span>
                      </div>
                      {user.match > 0 && <MatchBadge val={user.match} />}
                      {user.mutual > 0 && (
                        <span className="mutual-badge">
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M8 2a3 3 0 100 6 3 3 0 000-6zM2 13c0-2.5 2.7-4 6-4s6 1.5 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          {user.mutual} mutual
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 12, color: hsl(user.hue, 60, dark ? 65 : 50), fontWeight: 600, marginBottom: 6 }}>{user.role}</div>

                    {user.bio && <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.58, marginBottom: 10 }}>{user.bio}</p>}

                    {user.match > 0 && (
                      <div className="match-bar">
                        <div style={{ height: "100%", width: `${user.match}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: 99, transition: "width 0.8s ease" }} />
                      </div>
                    )}

                    {(user.skillsHave?.length > 0 || user.skillsNeed?.length > 0) && (
                      <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
                        {user.skillsHave?.length > 0 && (
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: T.text3, marginBottom: 5 }}>Has</div>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {user.skillsHave.slice(0, 3).map(s => <Pill key={s} label={s} type="have" />)}
                            </div>
                          </div>
                        )}
                        {user.skillsNeed?.length > 0 && (
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: T.text3, marginBottom: 5 }}>Needs</div>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {user.skillsNeed.slice(0, 2).map(s => <Pill key={s} label={s} type="need" />)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {user.project && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 8, padding: "5px 10px", marginBottom: 12 }}>
                        <span style={{ fontSize: 11, color: "#a78bfa" }}>✦</span>
                        <span style={{ fontSize: 11, color: dark ? "#b0a8d8" : "#6b5b9e", fontWeight: 500 }}>{user.project}</span>
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                      {renderActions(user)}
                      <span style={{ fontSize: 11, color: T.text3 }}>{user.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}