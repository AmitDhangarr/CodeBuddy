"use client"
import Link from "next/link";
import { useState } from "react";
import { useThemeStore } from "../../../../store/themeprovider";
export default function RoadmapPage() {
  const { dark, toggleDark } = useThemeStore();
  const [activeFilter, setActiveFilter] = useState("all");
  const [voted, setVoted] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState("idle"); // idle | submitting | success | error
  const [form, setForm] = useState({ title: "", category: "core", description: "", email: "" });
  const [errors, setErrors] = useState({});

  const FORM_CATEGORIES = [
    { value: "core", label: "Core matching" },
    { value: "ai", label: "AI features" },
    { value: "collab", label: "Collaboration" },
    { value: "pro", label: "Pro / Analytics" },
    { value: "platform", label: "Platform" },
    { value: "integrations", label: "Integrations" },
  ];

  const openModal = () => {
    setShowModal(true);
    setFormState("idle");
    setForm({ title: "", category: "core", description: "", email: "" });
    setErrors({});
  };

  const closeModal = () => {
    if (formState === "submitting") return;
    setShowModal(false);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Give your idea a short title.";
    else if (form.title.trim().length < 4) e.title = "Title's too short — give us a bit more.";
    if (!form.description.trim()) e.description = "Tell us what this would solve.";
    else if (form.description.trim().length < 20) e.description = "Add a bit more detail (20+ characters) so we understand the request.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "That email doesn't look right.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setFormState("submitting");
    try {
      // Simulated network request to feature-request intake
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.06) reject(new Error("network"));
          else resolve();
        }, 1100);
      });
      setFormState("success");
    } catch {
      setFormState("error");
    }
  };

  const T = dark ? {
    bg: "#07070f", bg2: "#0d0d1a",
    border: "rgba(255,255,255,0.06)", border2: "rgba(255,255,255,0.11)",
    text: "#e4e4f0", text2: "#8888aa", text3: "#44445a",
    card: "rgba(255,255,255,0.025)", cardHover: "rgba(255,255,255,0.04)",
    shadow: "0 24px 64px rgba(0,0,0,0.55)",
    navBg: "rgba(7,7,15,0.92)",
    surfaceA: "rgba(124,58,237,0.06)", surfaceBorder: "rgba(124,58,237,0.15)",
    aiBg: "rgba(60,40,140,0.12)", aiBorder: "rgba(120,80,255,0.18)",
  } : {
    bg: "#f4f4f8", bg2: "#ffffff",
    border: "rgba(0,0,0,0.07)", border2: "rgba(0,0,0,0.13)",
    text: "#18182c", text2: "#555570", text3: "#9090b0",
    card: "#ffffff", cardHover: "#f7f7fc",
    shadow: "0 20px 60px rgba(0,0,0,0.1)",
    navBg: "rgba(244,244,248,0.95)",
    surfaceA: "rgba(124,58,237,0.05)", surfaceBorder: "rgba(124,58,237,0.15)",
    aiBg: "rgba(124,58,237,0.06)", aiBorder: "rgba(124,58,237,0.18)",
  };

  const STATUS = {
    live:       { label: "Live",        color: "#4ade80", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)"   },
    inprogress: { label: "In Progress", color: "#fb923c", bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.25)"  },
    planned:    { label: "Planned",     color: "#818cf8", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.25)"  },
    exploring:  { label: "Exploring",   color: "#a78bfa", bg: "rgba(124,58,237,0.1)", border: "rgba(124,58,237,0.25)"  },
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)"};border-radius:99px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    .fade-up{animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both}
    .btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:9px 18px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s}
    .btn-ghost:hover{border-color:${T.border2};color:${T.text}}
    .btn-icon{background:transparent;border:1px solid ${T.border};color:${T.text3};padding:8px;border-radius:10px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center}
    .btn-icon:hover{border-color:${T.border2};color:${T.text}}
    .btn-primary{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:11px 24px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 6px 24px rgba(124,58,237,0.28)}
    .btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(124,58,237,0.42)}
    .btn-primary:disabled{opacity:0.6;cursor:not-allowed;transform:none}
    .filter-btn{background:transparent;border:1px solid ${T.border};color:${T.text3};padding:6px 14px;border-radius:99px;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s}
    .filter-btn:hover{border-color:${T.border2};color:${T.text}}
    .filter-btn.active{background:rgba(124,58,237,0.12);border-color:rgba(124,58,237,0.35);color:#a78bfa}
    .roadmap-card{background:${T.card};border:1px solid ${T.border};border-radius:18px;padding:22px;transition:all 0.25s;cursor:default}
    .roadmap-card:hover{background:${T.cardHover};border-color:${T.border2};transform:translateY(-2px);box-shadow:${T.shadow}}
    .vote-btn{background:transparent;border:1px solid ${T.border};border-radius:10px;padding:6px 12px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:5px;color:${T.text3}}
    .vote-btn:hover{border-color:rgba(124,58,237,0.4);color:#a78bfa;background:rgba(124,58,237,0.06)}
    .vote-btn.voted{background:rgba(124,58,237,0.12);border-color:rgba(124,58,237,0.4);color:#a78bfa}
    .timeline-line{position:absolute;left:50%;top:0;bottom:0;width:1px;background:${T.border};transform:translateX(-50%)}
    .modal-overlay{position:fixed;inset:0;background:rgba(5,5,12,0.6);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;animation:fadeUp 0.2s ease both}
    .modal-card{background:${T.bg2};border:1px solid ${T.border2};border-radius:20px;box-shadow:${T.shadow};width:100%;max-width:480px;max-height:90vh;overflow-y:auto}
    .field-label{display:block;font-size:12px;font-weight:700;color:${T.text2};margin-bottom:7px;letter-spacing:0.2px}
    .field-input{width:100%;background:${dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"};border:1px solid ${T.border};border-radius:11px;padding:11px 14px;font-family:inherit;font-size:13px;color:${T.text};outline:none;transition:border-color 0.2s}
    .field-input:focus{border-color:rgba(124,58,237,0.5)}
    .field-input.has-error{border-color:rgba(248,113,113,0.6)}
    .field-input::placeholder{color:${T.text3}}
    select.field-input{cursor:pointer}
    textarea.field-input{resize:vertical;min-height:90px;font-family:inherit;line-height:1.6}
    .field-error{font-size:11px;color:#f87171;margin-top:6px;font-weight:600}
    .field-hint{font-size:11px;color:${T.text3};margin-top:6px}
    @media(max-width:768px){.quarter-grid{grid-template-columns:1fr!important}}
  `;

  const Logo = () => (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill="#1a0a6a"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff"/>
    </svg>
  );

  const items = [
    { id: 1,  quarter: "Q1 2026", icon: "⚡", title: "AI Matching Engine v1",       desc: "Core skill-based matching with complementary gap analysis. The foundation of CodeBuddy.",           status: "live",       category: "core",    votes: 312, tags: ["Matching", "AI"] },
    { id: 2,  quarter: "Q1 2026", icon: "💬", title: "Real-Time Messaging",          desc: "In-app chat with match context always visible. No switching to Discord or Slack.",                    status: "live",       category: "core",    votes: 278, tags: ["Chat"] },
    { id: 3,  quarter: "Q1 2026", icon: "👤", title: "Builder Profiles",             desc: "Rich profiles with skill declarations, project links, availability, and collaboration intent.",       status: "live",       category: "core",    votes: 241, tags: ["Profiles"] },
    { id: 4,  quarter: "Q2 2026", icon: "📁", title: "Project Rooms",                desc: "Shared spaces for matched builders to plan tasks, set milestones, and track progress together.",    status: "inprogress", category: "collab",  votes: 198, tags: ["Collaboration", "Projects"] },
    { id: 5,  quarter: "Q2 2026", icon: "🔮", title: "Match Insights v2",            desc: "Deeper AI explanations — personality signals, work style compatibility, and timezone overlap.",    status: "inprogress", category: "ai",      votes: 183, tags: ["AI", "Matching"] },
    { id: 6,  quarter: "Q2 2026", icon: "📊", title: "Analytics Dashboard",         desc: "See your match history, connection rate, and which skills are attracting the best builders.",       status: "inprogress", category: "pro",     votes: 142, tags: ["Pro", "Analytics"] },
    { id: 7,  quarter: "Q3 2026", icon: "📱", title: "Mobile App (iOS + Android)",  desc: "CodeBuddy in your pocket. Get match notifications and chat on the go.",                            status: "planned",    category: "platform", votes: 389, tags: ["Mobile"] },
    { id: 8,  quarter: "Q3 2026", icon: "🏆", title: "Builder Reputation Score",    desc: "A signal built from shipping history, ghost rate, and peer endorsements — not vanity metrics.",  status: "planned",    category: "core",    votes: 267, tags: ["Trust", "Reputation"] },
    { id: 9,  quarter: "Q3 2026", icon: "🧩", title: "GitHub Integration",          desc: "Connect your GitHub to auto-populate skills from your commit history and starred repos.",          status: "planned",    category: "integrations", votes: 231, tags: ["Integration"] },
    { id: 10, quarter: "Q4 2026", icon: "🌍", title: "Multi-Language Support",      desc: "CodeBuddy in Hindi, Spanish, Mandarin, Arabic, Portuguese, and French.",                           status: "planned",    category: "platform", votes: 174, tags: ["Localization"] },
    { id: 11, quarter: "Q4 2026", icon: "🤖", title: "AI Project Co-Pilot",         desc: "An AI assistant inside project rooms that helps plan sprints, debug decisions, and unblock work.", status: "exploring",  category: "ai",      votes: 456, tags: ["AI", "Pro"] },
    { id: 12, quarter: "Q4 2026", icon: "🎓", title: "Mentor Mode",                 desc: "A dedicated matching path for mentors and mentees with session scheduling and goal tracking.",     status: "exploring",  category: "collab",  votes: 312, tags: ["Mentorship"] },
    { id: 13, quarter: "2027+",   icon: "🌐", title: "Open API",                    desc: "Let builders build on CodeBuddy's matching graph. Public API with OAuth and rate limits.",         status: "exploring",  category: "platform", votes: 198, tags: ["API", "Developers"] },
    { id: 14, quarter: "2027+",   icon: "💰", title: "Builder Bounties",            desc: "Post a paid task or bounty visible to matched builders. Micro-contracts within the platform.",     status: "exploring",  category: "collab",  votes: 267, tags: ["Monetization"] },
  ];

  const categories = ["all", "core", "ai", "collab", "pro", "platform", "integrations"];
  const quarters = ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026", "2027+"];

  const filtered = activeFilter === "all" ? items : items.filter(i => i.category === activeFilter);

  const handleVote = (id) => setVoted(p => ({ ...p, [id]: !p[id] }));

  const StatusBadge = ({ status }) => {
    const s = STATUS[status];
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 99, padding: "3px 10px" }}>
        {status === "live" && <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, animation: "pulse 2s ease-in-out infinite" }} />}
        <span style={{ fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: "0.3px" }}>{s.label}</span>
      </span>
    );
  };

  const stats = [
    { v: items.filter(i => i.status === "live").length,       l: "Shipped",     color: "#4ade80" },
    { v: items.filter(i => i.status === "inprogress").length, l: "In Progress", color: "#fb923c" },
    { v: items.filter(i => i.status === "planned").length,    l: "Planned",     color: "#818cf8" },
    { v: items.filter(i => i.status === "exploring").length,  l: "Exploring",   color: "#a78bfa" },
  ];

  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{css}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-15%", left: "-8%", width: 650, height: 650, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.09)" : "hsla(259,70%,60%,0.045)"} 0%,transparent 65%)` }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-6%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(300,60%,30%,0.06)" : "hsla(300,60%,60%,0.04)"} 0%,transparent 65%)` }} />
      </div>

      <nav style={{ background: T.navBg, backdropFilter: "blur(28px)", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(16px,5vw,32px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Logo />
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: T.text }}>CodeBuddy</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1060, margin: "0 auto", padding: "clamp(32px,6vw,64px) clamp(16px,5vw,32px)" }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 44 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 99, padding: "4px 13px", marginBottom: 18 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.8px", textTransform: "uppercase" }}>Roadmap</span>
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(32px,7vw,52px)", fontWeight: 400, color: T.text, letterSpacing: "-1.5px", lineHeight: 1.08, marginBottom: 14 }}>
            What we're <span style={{ fontStyle: "italic", color: "#a78bfa" }}>building</span>
          </h1>
          <p style={{ fontSize: 14, color: T.text2, maxWidth: 520, lineHeight: 1.7 }}>
            Our public roadmap. Vote on features you want most — the community shapes what we build next. Updated every sprint.
          </p>
        </div>

        {/* Stats strip */}
        <div className="fade-up" style={{ display: "flex", gap: 10, marginBottom: 36, flexWrap: "wrap" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: s.color, letterSpacing: "-1px" }}>{s.v}</span>
              <span style={{ fontSize: 12, color: T.text3, fontWeight: 600 }}>{s.l}</span>
            </div>
          ))}
          <div style={{ background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa" }}>✦ Vote to shape priorities</span>
          </div>
        </div>

        {/* Filters */}
        <div className="fade-up" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 40 }}>
          {categories.map(cat => (
            <button key={cat} className={`filter-btn${activeFilter === cat ? " active" : ""}`} onClick={() => setActiveFilter(cat)}>
              {cat === "all" ? "All features" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Quarters */}
        {quarters.map((q, qi) => {
          const qItems = filtered.filter(i => i.quarter === q);
          if (qItems.length === 0) return null;
          const isCurrentQ = q === "Q2 2026";
          return (
            <div key={q} style={{ marginBottom: 52 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                <div style={{ height: 1, flex: 1, background: T.border }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: isCurrentQ ? "rgba(124,58,237,0.12)" : T.card, border: `1px solid ${isCurrentQ ? "rgba(124,58,237,0.35)" : T.border}`, borderRadius: 99, padding: "6px 16px" }}>
                  {isCurrentQ && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fb923c", animation: "pulse 2s ease-in-out infinite" }} />}
                  <span style={{ fontSize: 12, fontWeight: 700, color: isCurrentQ ? "#fb923c" : T.text3, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    {q}{isCurrentQ ? " · Current" : ""}
                  </span>
                </div>
                <div style={{ height: 1, flex: 1, background: T.border }} />
              </div>

              <div className="quarter-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                {qItems.map((item, i) => (
                  <div key={item.id} className={`roadmap-card fade-up`} style={{ animationDelay: `${i * 0.06}s` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{item.icon}</span>
                        <StatusBadge status={item.status} />
                      </div>
                      <button className={`vote-btn${voted[item.id] ? " voted" : ""}`} onClick={() => handleVote(item.id)}>
                        <span>{voted[item.id] ? "▲" : "△"}</span>
                        <span>{item.votes + (voted[item.id] ? 1 : 0)}</span>
                      </button>
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 6 }}>{item.title}</h3>
                    <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.65, marginBottom: 12 }}>{item.desc}</p>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {item.tags.map(tag => (
                        <span key={tag} style={{ fontSize: 10, color: T.text3, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${T.border}`, borderRadius: 6, padding: "2px 8px", fontWeight: 600 }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Suggest feature CTA */}
        <div className="fade-up" style={{ background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 22, padding: "clamp(28px,6vw,44px)", textAlign: "center", marginTop: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 14 }}>💡</div>
          <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(22px,5vw,34px)", color: T.text, letterSpacing: "-0.8px", marginBottom: 12 }}>
            Have an idea?
          </h2>
          <p style={{ fontSize: 13, color: T.text2, marginBottom: 24, maxWidth: 380, margin: "0 auto 24px", lineHeight: 1.7 }}>
            The best features come from builders who use CodeBuddy every day. Tell us what you're missing.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ padding: "11px 24px" }} onClick={openModal}>Submit a feature request →</button>
            <Link href="/changelog">
              <button className="btn-ghost">View changelog</button>
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 64, paddingTop: 32, borderTop: `1px solid ${T.border}`, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: T.text3 }}>© 2026 CodeBuddy · Built by builders, for builders.</span>
          <div style={{ display: "flex", gap: 12 }}>
            {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Security", "/security"]].map(([l, h]) => (
              <Link key={l} href={h} style={{ fontSize: 12, color: T.text3, textDecoration: "none" }}>{l}</Link>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-card">
            {formState === "success" ? (
              <div style={{ padding: "44px 32px", textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 24 }}>✓</div>
                <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: T.text, marginBottom: 10, letterSpacing: "-0.5px" }}>Request submitted</h3>
                <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.7, maxWidth: 320, margin: "0 auto 26px" }}>
                  Thanks — your idea is in our backlog for review. {form.email.trim() ? "We'll email you if it ships." : "Add an email next time to get notified when it ships."}
                </p>
                <button className="btn-primary" onClick={closeModal}>Done</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "26px 28px 0" }}>
                  <div>
                    <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: T.text, letterSpacing: "-0.5px", marginBottom: 6 }}>Submit a feature request</h3>
                    <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.6 }}>Goes straight to our product team's backlog for review.</p>
                  </div>
                  <button type="button" className="btn-icon" onClick={closeModal} aria-label="Close" style={{ flexShrink: 0 }}>✕</button>
                </div>

                <div style={{ padding: "22px 28px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label className="field-label" htmlFor="fr-title">Title</label>
                    <input
                      id="fr-title"
                      className={`field-input${errors.title ? " has-error" : ""}`}
                      type="text"
                      placeholder="e.g. Filter matches by timezone overlap"
                      value={form.title}
                      maxLength={80}
                      disabled={formState === "submitting"}
                      onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                    />
                    {errors.title ? <div className="field-error">{errors.title}</div> : <div className="field-hint">{form.title.length}/80</div>}
                  </div>

                  <div>
                    <label className="field-label" htmlFor="fr-category">Category</label>
                    <select
                      id="fr-category"
                      className="field-input"
                      value={form.category}
                      disabled={formState === "submitting"}
                      onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    >
                      {FORM_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="fr-desc">What problem would this solve?</label>
                    <textarea
                      id="fr-desc"
                      className={`field-input${errors.description ? " has-error" : ""}`}
                      placeholder="Tell us what's missing and how you'd use it..."
                      value={form.description}
                      maxLength={600}
                      disabled={formState === "submitting"}
                      onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                    {errors.description ? <div className="field-error">{errors.description}</div> : <div className="field-hint">{form.description.length}/600</div>}
                  </div>

                  <div>
                    <label className="field-label" htmlFor="fr-email">Email <span style={{ color: T.text3, fontWeight: 500, textTransform: "none" }}>(optional — to follow up)</span></label>
                    <input
                      id="fr-email"
                      className={`field-input${errors.email ? " has-error" : ""}`}
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      disabled={formState === "submitting"}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                    {errors.email && <div className="field-error">{errors.email}</div>}
                  </div>

                  {formState === "error" && (
                    <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 11, padding: "11px 14px", fontSize: 12, color: "#f87171", fontWeight: 600 }}>
                      Couldn't reach the server — check your connection and try again.
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                    <button type="button" className="btn-ghost" onClick={closeModal} disabled={formState === "submitting"}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={formState === "submitting"} style={{ minWidth: 130 }}>
                      {formState === "submitting" ? "Submitting…" : "Submit request"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}