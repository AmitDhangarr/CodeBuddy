'use client'
import Link from "next/link";
import { useState } from "react";
import Footer from "./footer";
function LandingPage() {
  const [authTab, setAuthTab] = useState("");
  const [view, setView] = useState("");
  const [dashPage, setDashPage] = useState("");
  const [onboardStep, setOnboardStep] = useState(0);

  const DARK = {
    bg: "#060608", bg2: "#0e0e18", bg3: "#14141f",
    border: "rgba(255,255,255,0.07)", border2: "rgba(255,255,255,0.12)",
    text: "#e2e2ef", text2: "#9090b0", text3: "#555570",
    card: "rgba(255,255,255,0.025)", cardHover: "rgba(255,255,255,0.045)",
    input: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.09)",
    glass: "rgba(6,6,8,0.85)",
    shadow: "0 20px 60px rgba(0,0,0,0.5)",
    msgMe: "linear-gradient(135deg,rgba(124,58,237,0.4),rgba(100,60,200,0.3))",
    msgThem: "rgba(255,255,255,0.06)",
    navBg: "rgba(6,6,8,0.9)",
    skillHaveBg: "rgba(110,224,110,0.1)", skillHaveBorder: "rgba(110,224,110,0.25)", skillHaveText: "#7de87d",
    skillNeedBg: "rgba(120,120,255,0.1)", skillNeedBorder: "rgba(120,120,255,0.25)", skillNeedText: "#9898ff",
    aiBg: "rgba(60,40,140,0.15)", aiBorder: "rgba(120,80,255,0.2)",
    logoFill: "#00DC33",
  };
  const LIGHT = {
    bg: "#f5f5f9", bg2: "#ffffff", bg3: "#eeeef5",
    border: "rgba(0,0,0,0.08)", border2: "rgba(0,0,0,0.15)",
    text: "#1a1a2e", text2: "#555570", text3: "#9090b0",
    card: "#ffffff", cardHover: "#f8f8fc",
    input: "#ffffff", inputBorder: "rgba(0,0,0,0.12)",
    glass: "rgba(245,245,249,0.92)",
    shadow: "0 20px 60px rgba(0,0,0,0.12)",
    msgMe: "linear-gradient(135deg,#7c3aed,#9333ea)",
    msgThem: "#f0f0f8",
    navBg: "rgba(245,245,249,0.95)",
    skillHaveBg: "rgba(34,197,94,0.1)", skillHaveBorder: "rgba(34,197,94,0.3)", skillHaveText: "#16a34a",
    skillNeedBg: "rgba(99,102,241,0.1)", skillNeedBorder: "rgba(99,102,241,0.3)", skillNeedText: "#4f46e5",
    aiBg: "rgba(124,58,237,0.07)", aiBorder: "rgba(124,58,237,0.2)",
    logoFill: "#7c3aed",
  };

  const [dark, setDark] = useState(true);
  const T = dark ? DARK : LIGHT;
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)"};border-radius:99px}
    input,textarea,select{font-family:'Instrument Sans',sans-serif}
    textarea{resize:none}
    select option{background:${dark ? "#1a1a2e" : "#fff"}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes ticker{0%{opacity:0;transform:translateY(8px)}15%,85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-8px)}}
    .fade-up{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both}
    .fade-in{animation:fadeIn 0.3s ease both}
    .float{animation:float 4s ease-in-out infinite}
    .spin{animation:spin 0.9s linear infinite;display:inline-block}
    .ticker{animation:ticker 3s ease-in-out infinite}
    .card{background:${T.card};border:1px solid ${T.border};border-radius:18px;transition:all 0.25s}
    .card:hover{background:${T.cardHover};border-color:${T.border2};transform:translateY(-2px);box-shadow:${T.shadow}}
    .card-flat{background:${T.card};border:1px solid ${T.border};border-radius:18px}
    .btn-primary{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:11px 24px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;letter-spacing:-0.1px;box-shadow:0 6px 24px rgba(124,58,237,0.3)}
    .btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(124,58,237,0.45)}
    .btn-primary:disabled{opacity:0.5;cursor:not-allowed;transform:none}
    .btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:9px 18px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s}
    .btn-ghost:hover{border-color:${T.border2};color:${T.text}}
    .btn-icon{background:transparent;border:1px solid ${T.border};color:${T.text3};padding:8px;border-radius:10px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center}
    .btn-icon:hover{border-color:${T.border2};color:${T.text}}
    .input{background:${T.input};border:1px solid ${T.inputBorder};color:${T.text};padding:10px 14px;border-radius:11px;font-size:13px;outline:none;transition:all 0.2s;width:100%}
    .input:focus{border-color:rgba(124,58,237,0.6);background:${dark ? "rgba(255,255,255,0.07)" : "rgba(124,58,237,0.04)"}}
    .input::placeholder{color:${T.text3}}
    .select{background:${T.input};border:1px solid ${T.inputBorder};color:${T.text2};padding:8px 12px;border-radius:10px;font-size:12px;font-family:inherit;outline:none;cursor:pointer}
    .nav-btn{background:none;border:none;color:${T.text3};cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;padding:8px 13px;border-radius:10px;display:flex;align-items:center;gap:7px;transition:all 0.2s}
    .nav-btn:hover{color:${T.text};background:${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}}
    .nav-btn.on{color:${dark ? "#e0d8ff" : "#7c3aed"};background:${dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.08)"}}
    .pill{padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600}
    .skill-have{background:${T.skillHaveBg};border:1px solid ${T.skillHaveBorder};color:${T.skillHaveText}}
    .skill-need{background:${T.skillNeedBg};border:1px solid ${T.skillNeedBorder};color:${T.skillNeedText}}
    .skill-chip{padding:6px 13px;border-radius:99px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid ${T.border};background:transparent;color:${T.text3};transition:all 0.15s;font-family:inherit}
    .skill-chip:hover{border-color:rgba(124,58,237,0.4);color:${T.text};background:rgba(124,58,237,0.08)}
    .skill-chip.sel-have{background:${T.skillHaveBg};border-color:${T.skillHaveBorder};color:${T.skillHaveText}}
    .skill-chip.sel-need{background:${T.skillNeedBg};border-color:${T.skillNeedBorder};color:${T.skillNeedText}}
    .tab{background:none;border:none;color:${T.text3};cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;padding:7px 15px;border-radius:8px;transition:all 0.2s}
    .tab:hover{color:${T.text}}
    .tab.on{background:${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"};color:${T.text}}
    .sidebar-item{display:flex;align-items:center;gap:11px;padding:11px 13px;border-radius:13px;cursor:pointer;transition:all 0.2s;border:1px solid transparent}
    .sidebar-item:hover{background:${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}}
    .sidebar-item.on{background:${dark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.07)"};border-color:${T.border}}
    .role-card{background:${T.input};border:1px solid ${T.border};border-radius:14px;padding:14px 18px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:13px}
    .role-card:hover{border-color:rgba(124,58,237,0.3)}
    .role-card.on{background:${dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.07)"};border-color:rgba(124,58,237,0.4)}
    .look-card{background:${T.input};border:1px solid ${T.border};border-radius:14px;padding:15px;cursor:pointer;transition:all 0.2s;text-align:center}
    .look-card:hover{border-color:rgba(124,58,237,0.3)}
    .look-card.on{background:${dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.07)"};border-color:rgba(124,58,237,0.4)}
    .social-btn{background:${T.input};border:1px solid ${T.inputBorder};color:${T.text};padding:10px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:9px;flex:1}
    .social-btn:hover{border-color:${T.border2}}
    .match-track{height:3px;background:${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"};border-radius:99px;overflow:hidden}
    .divider{height:1px;background:${T.border};margin:18px 0}
    .toggle-switch{width:44px;height:24px;border-radius:12px;border:none;cursor:pointer;position:relative;transition:background 0.3s;flex-shrink:0}
    .toggle-thumb{width:18px;height:18px;border-radius:50%;background:white;position:absolute;top:3px;transition:left 0.25s cubic-bezier(0.34,1.56,0.64,1)}
    
    /* Responsive Styles */
    @media (max-width: 768px) {
      .btn-primary, .btn-ghost { font-size: 12px; padding: 9px 16px; }
      .nav-btn { font-size: 12px; padding: 6px 10px; }
    }
    @media (max-width: 480px) {
      .btn-primary, .btn-ghost { font-size: 11px; padding: 8px 14px; }
    }
  `;

  const hsl = (h, s = 70, l = 60) => `hsl(${h},${s}%,${l}%)`;
  const hsla = (h, s = 70, l = 60, a = 0.12) => `hsla(${h},${s}%,${l}%,${a})`;

  const Avatar = ({ u, size = 44, radius = 12 }) => (
    <div style={{ width: size, height: size, borderRadius: radius, background: hsla(u.hue, 70, 60, dark ? 0.15 : 0.12), border: `1.5px solid ${hsla(u.hue, 70, 60, 0.3)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.3, fontWeight: 700, color: hsl(u.hue), flexShrink: 0, fontFamily: "'Instrument Serif',serif" }}>
      {u.avatar}
    </div>
  );

  const OnlineDot = ({ online }) => <div style={{ width: 8, height: 8, borderRadius: "50%", background: online ? "#22c55e" : "#555570", border: `2px solid ${T.bg}`, flexShrink: 0 }} />;

  const MOCK_USERS = [
    { id: 1, name: "Aanya Sharma", handle: "aanya.dev", role: "Full Stack Engineer", avatar: "AS", hue: 259, bio: "I build SaaS tools that people actually want to use. Obsessed with DX, clean APIs, and shipping fast.", skillsHave: ["React", "Next.js", "Node.js", "PostgreSQL"], skillsNeed: ["UI/UX Design", "Figma", "Machine Learning"], lookingFor: "Collaborator", location: "Bangalore, IN", github: "aanya-dev", projects: 3, followers: 128, online: true },
    { id: 2, name: "Rohan Mehra", handle: "rohan.ui", role: "Design Engineer", avatar: "RM", hue: 340, bio: "Designer who writes production code. Built 2 design systems used by 10k+ devs.", skillsHave: ["UI/UX Design", "Figma", "React", "Tailwind CSS"], skillsNeed: ["Node.js", "PostgreSQL", "DevOps"], lookingFor: "Collaborator", location: "Mumbai, IN", github: "rohan-designs", projects: 5, followers: 342, online: true },
    { id: 3, name: "Priya Nair", handle: "priya.ml", role: "ML Engineer", avatar: "PN", hue: 158, bio: "Turning research papers into products. My AI tools have been used in production at 3 startups.", skillsHave: ["Machine Learning", "Python", "AWS", "Docker"], skillsNeed: ["React", "TypeScript", "Next.js"], lookingFor: "Mentor", location: "Hyderabad, IN", github: "priya-ml", projects: 7, followers: 201, online: false },
    { id: 4, name: "Dev Kapoor", handle: "dev.sys", role: "Systems Engineer", avatar: "DK", hue: 38, bio: "Distributed systems, high throughput APIs, and the occasional Rust rant.", skillsHave: ["Rust", "Go", "Docker", "Redis", "AWS"], skillsNeed: ["React", "UI/UX Design", "TypeScript"], lookingFor: "Collaborator", location: "Delhi, IN", github: "dev-systems", projects: 4, followers: 97, online: false },
    { id: 5, name: "Sara Chen", handle: "sara.web3", role: "Web3 Developer", avatar: "SC", hue: 271, bio: "Building the decentralized future, one smart contract at a time. Open to mentoring frontend devs.", skillsHave: ["Web3", "TypeScript", "React", "Solidity"], skillsNeed: ["DevOps", "AWS", "Machine Learning"], lookingFor: "Mentee", location: "Remote", github: "sara-web3", projects: 9, followers: 456, online: true },
    { id: 6, name: "Karan Patel", handle: "karan.mob", role: "Mobile Developer", avatar: "KP", hue: 316, bio: "5 apps, 50k+ downloads. Flutter specialist who crafts delightful mobile experiences.", skillsHave: ["Flutter", "Swift", "Firebase", "Dart"], skillsNeed: ["Machine Learning", "Node.js", "GraphQL"], lookingFor: "Collaborator", location: "Pune, IN", github: "karan-mobile", projects: 6, followers: 183, online: false },
  ];

  const Lbl = ({ children }) => <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: T.text3, marginBottom: 7 }}>{children}</div>;
  const Err = ({ msg }) => msg ? <div style={{ fontSize: 11, color: "#f87171", marginTop: 5 }}>⚠ {msg}</div> : null;

  const Logo = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill={T.logoFill}></path>
      <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff"></path>
    </svg>
  );

  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{css}</style>
      <style>{`
        .feat-card{background:${T.card};border:1px solid ${T.border};border-radius:18px;padding:24px;transition:all 0.3s}
        .feat-card:hover{border-color:rgba(124,58,237,0.3);transform:translateY(-3px);box-shadow:${T.shadow}}
        .landing-nav{background:${T.navBg};backdrop-filter:blur(24px);border-bottom:1px solid ${T.border}}
        
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .feat-card { padding: 18px; }
          .hero-title { font-size: 36px !important; }
          .hero-card { display: none; }
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 28px !important; line-height: 1.15 !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
          .nav-buttons { gap: 4px !important; }
          .nav-buttons .btn-ghost { display: none; }
        }
      `}</style>

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-15%", left: "-5%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.12)" : "hsla(259,70%,60%,0.06)"} 0%,transparent 65%)` }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(300,60%,30%,0.08)" : "hsla(300,60%,60%,0.05)"} 0%,transparent 65%)` }} />
        {dark && <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.025 }} xmlns="http://www.w3.org/2000/svg"><defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#g)" /></svg>}
      </div>

      {/* Nav */}
      <nav className="landing-nav" style={{ position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(16px, 5vw, 32px)", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>
            <Logo />
          </div>
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(14px, 4vw, 18px)", color: T.text, letterSpacing: "-0.3px" }}>CodeBuddy</span>
        </div>
        <div className="nav-buttons" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn-icon" onClick={() => setDark(p => !p)} style={{ width: 38, height: 38 }} title="Toggle theme">
            {dark ? "☀️" : "🌙"}
          </button>
          <Link href={'/signin'}><button className="btn-ghost" style={{ padding: "8px 18px", fontSize: 13 }}>Sign in</button></Link>
          <Link href={'/signup'}><button className="btn-primary" style={{ padding: "8px 18px" }}>Get started free →</button></Link>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Hero */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "clamp(40px, 10vw, 90px) clamp(16px, 5vw, 32px) clamp(30px, 8vw, 70px)" }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 70, alignItems: "center" }}>
            <div className="fade-up">
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 99, padding: "5px 14px", marginBottom: 26 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.5px", textTransform: "uppercase" }}>3,200+ builders online</span>
              </div>
              <h1 className="hero-title" style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(32px, 8vw, 52px)", fontWeight: 400, lineHeight: 1.08, letterSpacing: "-1.5px", color: T.text, marginBottom: 20 }}>
                Find the builder<br />who <span style={{ fontStyle: "italic", color: "#a78bfa" }}>completes</span><br />your stack
              </h1>
              <p style={{ fontSize: "clamp(13px, 3vw, 15px)", color: T.text2, lineHeight: 1.65, marginBottom: 32, maxWidth: 420 }}>SkillMatch pairs developers using AI — matching by what you have and what you need, so you stop searching and start building.</p>
              <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
                <Link href={"/signup"}><button className="btn-primary" style={{ padding: "12px 26px", fontSize: 14 }}>Start matching free →</button></Link>
                <Link href={"/dashboard"}><button className="btn-ghost">Preview dashboard ▶</button></Link>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex" }}>{[259, 340, 158, 38, 271].map((h, i) => <div key={i} style={{ width: 28, height: 28, borderRadius: 8, background: hsla(h, 70, 60, 0.2), border: `2px solid ${hsla(h, 70, 60, 0.4)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: hsl(h), marginLeft: i > 0 ? -7 : 0 }}>{"ASRPDSK"[i * 2]}</div>)}</div>
                <span style={{ fontSize: 12, color: T.text3 }}>Joined by <strong style={{ color: T.text2 }}>847 builders</strong> this month</span>
              </div>
            </div>

            {/* Hero card */}
            <div className="hero-card fade-up float" style={{ animationDelay: "0.15s" }}>
              <div className="card-flat" style={{ padding: 22, boxShadow: T.shadow }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "1px", textTransform: "uppercase" }}>Top match today</span>
                  <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: "#a78bfa" }}>94%</span>
                </div>
                <div style={{ display: "flex", gap: 13, alignItems: "center", marginBottom: 14 }}>
                  <Avatar u={MOCK_USERS[0]} size={50} radius={14} />
                  <div><div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Aanya Sharma</div><div style={{ fontSize: 12, color: hsl(259), fontWeight: 500 }}>Full Stack Engineer · Bangalore</div></div>
                </div>
                <div className="match-track" style={{ marginBottom: 14 }}><div style={{ height: "100%", width: "94%", background: "linear-gradient(90deg,hsl(259,70%,45%),hsl(290,70%,65%))", borderRadius: 99 }} /></div>
                <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 13 }}>Building SaaS tools. Needs UI/UX help, and you have exactly that.</p>
                <div style={{ marginBottom: 10 }}><Lbl>Has</Lbl><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{["React", "Node.js", "PostgreSQL"].map(s => <span key={s} className="pill skill-have">{s}</span>)}</div></div>
                <div style={{ marginBottom: 14 }}><Lbl>Needs</Lbl><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{["UI/UX Design", "Figma"].map(s => <span key={s} className="pill skill-need">{s}</span>)}</div></div>
                <div style={{ background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 12, padding: "11px 13px", marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", marginBottom: 5 }}>✦ AI MATCH INSIGHT</div>
                  <p style={{ fontSize: 11, color: dark ? "#b0a8d8" : "#6b5b9e", lineHeight: 1.5 }}>Your React skills fill Aanya's frontend gap. Her backend depth covers your weakness. Rare two-way match.</p>
                </div>
                <Link href={"/signup"}><button className="btn-primary" style={{ width: "100%" }}>Connect →</button></Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px, 5vw, 32px) clamp(30px, 8vw, 70px)" }}>
          <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {[{ v: "3,200+", l: "Active Builders" }, { v: "94%", l: "Match Accuracy" }, { v: "847", l: "Projects Shipped" }, { v: "40+", l: "Countries" }].map((s, i) => (
              <div key={i} className="card-flat" style={{ padding: "20px 24px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(24px, 6vw, 36px)", color: T.text, letterSpacing: "-1px", lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: "clamp(10px, 2.5vw, 12px)", color: T.text3, marginTop: 7 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px, 5vw, 32px) clamp(40px, 10vw, 90px)" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(28px, 6vw, 40px)", color: T.text, letterSpacing: "-1px", lineHeight: 1.1 }}>Built for builders<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>who ship</span></h2>
          </div>
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              { icon: "⚡", t: "AI-Powered Matching", d: "Our model surfaces builders you'll actually ship with — matched by skills, goals and work style." },
              { icon: "🎯", t: "Skill Gap Pairing", d: "We match by what you have AND what you need, creating two-way complementary partnerships." },
              { icon: "💬", t: "Real-Time Chat", d: "Chat with context — always see why you matched right above every conversation." },
              { icon: "🔮", t: "Match Insights", d: "AI explains every match in plain English so you can decide in seconds, not days." },
              { icon: "🚀", t: "Project Rooms", d: "Spin up a shared space to plan tasks and track progress without leaving the platform." },
              { icon: "🌐", t: "Global Network", d: "3,200+ builders across 40+ countries. Someone's always online and ready to build." },
            ].map((f, i) => (
              <div key={i} className="feat-card fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                <div style={{ fontSize: 26, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 8 }}>{f.t}</h3>
                <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.6 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 clamp(16px, 5vw, 32px) clamp(50px, 12vw, 100px)", textAlign: "center" }}>
          <div style={{ background: dark ? "rgba(124,58,237,0.07)" : "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 24, padding: "clamp(32px, 8vw, 52px) clamp(20px, 6vw, 40px)" }}>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(28px, 6vw, 40px)", color: T.text, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 14 }}>Ready to find your<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>co-builder?</span></h2>
            <p style={{ fontSize: "clamp(12px, 3vw, 14px)", color: T.text2, marginBottom: 30 }}>Free forever for indie builders. No credit card needed.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href={"/signup"}><button className="btn-primary" style={{ padding: "13px 28px", fontSize: 14 }}>Create your profile →</button></Link>
              <Link href={"/dashboard"}><button className="btn-ghost">Preview app</button></Link>
            </div>
          </div>
        </section>
        <Footer/>
      </div>
    </div>
  )
}

export default LandingPage;