"use client"
import Link from "next/link";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSignupStore } from "../../store/UsesignupStore";
function LandingPage() {
 const formData = useSignupStore((state) => state.formData);

  const [dark, setDark] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const [matchStep, setMatchStep] = useState(0);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [ticker, setTicker] = useState(0);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const tickerItems = [
    "Aanya matched with Rohan · 2 min ago",
    "Sara shipped a project · 5 min ago",
    "Dev joined as Rust mentor · 8 min ago",
    "Priya found her co-founder · 12 min ago",
    "Karan matched with ML engineer · 15 min ago",
  ];
  const phrases = ["your missing backend", "the UI/UX to your logic", "your ML specialist", "the DevOps to your frontend"];

  useEffect(() => {
    const id = setInterval(() => setTicker(t => (t + 1) % tickerItems.length), 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setMatchStep(s => (s + 1) % 4), 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const phrase = phrases[phraseIdx];
    if (!deleting && charIdx < phrase.length) {
      const id = setTimeout(() => setCharIdx(c => c + 1), 55);
      return () => clearTimeout(id);
    } else if (!deleting && charIdx === phrase.length) {
      const id = setTimeout(() => setDeleting(true), 1800);
      return () => clearTimeout(id);
    } else if (deleting && charIdx > 0) {
      const id = setTimeout(() => setCharIdx(c => c - 1), 28);
      return () => clearTimeout(id);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setPhraseIdx(i => (i + 1) % phrases.length);
    }
  }, [charIdx, deleting, phraseIdx]);

  const T = dark ? {
    bg: "#07070f", bg2: "#0d0d1a",
    border: "rgba(255,255,255,0.06)", border2: "rgba(255,255,255,0.11)",
    text: "#e4e4f0", text2: "#8888aa", text3: "#44445a",
    card: "rgba(255,255,255,0.025)", cardHover: "rgba(255,255,255,0.04)",
    input: "rgba(255,255,255,0.04)", inputBorder: "rgba(255,255,255,0.08)",
    shadow: "0 24px 64px rgba(0,0,0,0.55)",
    navBg: "rgba(7,7,15,0.92)",
    skillHaveBg: "rgba(34,197,94,0.08)", skillHaveBorder: "rgba(34,197,94,0.2)", skillHaveText: "#4ade80",
    skillNeedBg: "rgba(99,102,241,0.08)", skillNeedBorder: "rgba(99,102,241,0.22)", skillNeedText: "#818cf8",
    aiBg: "rgba(60,40,140,0.12)", aiBorder: "rgba(120,80,255,0.18)",
    logoFill: "#00DC33",
    surfaceA: "rgba(124,58,237,0.06)", surfaceBorder: "rgba(124,58,237,0.15)",
  } : {
    bg: "#f4f4f8", bg2: "#ffffff",
    border: "rgba(0,0,0,0.07)", border2: "rgba(0,0,0,0.13)",
    text: "#18182c", text2: "#555570", text3: "#9090b0",
    card: "#ffffff", cardHover: "#f7f7fc",
    input: "#ffffff", inputBorder: "rgba(0,0,0,0.1)",
    shadow: "0 20px 60px rgba(0,0,0,0.1)",
    navBg: "rgba(244,244,248,0.95)",
    skillHaveBg: "rgba(34,197,94,0.09)", skillHaveBorder: "rgba(34,197,94,0.28)", skillHaveText: "#16a34a",
    skillNeedBg: "rgba(99,102,241,0.09)", skillNeedBorder: "rgba(99,102,241,0.28)", skillNeedText: "#4338ca",
    aiBg: "rgba(124,58,237,0.06)", aiBorder: "rgba(124,58,237,0.18)",
    logoFill: "#7c3aed",
    surfaceA: "rgba(124,58,237,0.05)", surfaceBorder: "rgba(124,58,237,0.15)",
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)"};border-radius:99px}
    input,textarea{font-family:'Instrument Sans',sans-serif}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    @keyframes tickerFade{0%{opacity:0;transform:translateY(6px)}15%,85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-6px)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
    .fade-up{animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both}
    .float{animation:float 5s ease-in-out infinite}
    .btn-primary{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:11px 24px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 6px 24px rgba(124,58,237,0.28)}
    .btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(124,58,237,0.42)}
    .btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:9px 18px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s}
    .btn-ghost:hover{border-color:${T.border2};color:${T.text}}
    .btn-icon{background:transparent;border:1px solid ${T.border};color:${T.text3};padding:8px;border-radius:10px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center}
    .btn-icon:hover{border-color:${T.border2};color:${T.text}}
    .card{background:${T.card};border:1px solid ${T.border};border-radius:18px;transition:all 0.28s}
    .card:hover{background:${T.cardHover};border-color:${T.border2};transform:translateY(-2px);box-shadow:${T.shadow}}
    .card-flat{background:${T.card};border:1px solid ${T.border};border-radius:18px}
    .feat-card{background:${T.card};border:1px solid ${T.border};border-radius:18px;padding:26px;transition:all 0.3s}
    .feat-card:hover{border-color:rgba(124,58,237,0.3);transform:translateY(-3px);box-shadow:${T.shadow}}
    .pill{padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600}
    .skill-have{background:${T.skillHaveBg};border:1px solid ${T.skillHaveBorder};color:${T.skillHaveText}}
    .skill-need{background:${T.skillNeedBg};border:1px solid ${T.skillNeedBorder};color:${T.skillNeedText}}
    .match-track{height:3px;background:${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"};border-radius:99px;overflow:hidden}
    .divider{height:1px;background:${T.border};margin:20px 0}
    .landing-nav{background:${T.navBg};backdrop-filter:blur(28px);border-bottom:1px solid ${T.border}}
    .faq-item{border:1px solid ${T.border};border-radius:14px;overflow:hidden;transition:border-color 0.2s;margin-bottom:10px}
    .faq-item:hover{border-color:${T.border2}}
    .faq-btn{width:100%;background:none;border:none;color:${T.text};padding:18px 20px;text-align:left;cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;display:flex;justify-content:space-between;align-items:center;gap:12px}
    .testimonial-card{background:${T.card};border:1px solid ${T.border};border-radius:20px;padding:28px;transition:all 0.3s;cursor:default}
    .testimonial-card.active{border-color:rgba(124,58,237,0.25);background:${dark ? "rgba(124,58,237,0.05)" : "rgba(124,58,237,0.03)"}}
    .howit-step{background:${T.card};border:1px solid ${T.border};border-radius:16px;padding:22px;transition:all 0.3s;cursor:default}
    .howit-step.active{border-color:rgba(124,58,237,0.35);background:${dark ? "rgba(124,58,237,0.07)" : "rgba(124,58,237,0.04)"}}
    .skill-tag{padding:6px 12px;border-radius:99px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid ${T.border};background:transparent;color:${T.text3};transition:all 0.15s;font-family:inherit}
    .skill-tag:hover{border-color:rgba(124,58,237,0.4);color:${T.text};background:rgba(124,58,237,0.08)}
    .pricing-card{background:${T.card};border:1px solid ${T.border};border-radius:22px;padding:28px;transition:all 0.3s;position:relative}
    .pricing-card.featured{border-color:rgba(124,58,237,0.4);background:${dark ? "rgba(124,58,237,0.07)" : "rgba(124,58,237,0.04)"}}
    .pricing-card:hover{transform:translateY(-3px);box-shadow:${T.shadow}}
    .check-item{display:flex;align-items:center;gap:10px;font-size:13px;color:${T.text2};padding:5px 0}
    @media(max-width:768px){
      .hero-grid{grid-template-columns:1fr!important;gap:44px!important}
      .stats-grid{grid-template-columns:repeat(2,1fr)!important}
      .features-grid{grid-template-columns:1fr!important}
      .hero-card{display:none}
      .pricing-grid{grid-template-columns:1fr!important}
      .steps-grid{grid-template-columns:1fr!important}
      .testi-grid{grid-template-columns:1fr!important}
      .footer-grid{grid-template-columns:1fr 1fr!important}
    }
    @media(max-width:480px){
      .nav-ghost{display:none}
      .stats-grid{grid-template-columns:1fr!important}
    }
  `;

  const hsl = (h, s = 70, l = 60) => `hsl(${h},${s}%,${l}%)`;
  const hsla = (h, s = 70, l = 60, a = 0.12) => `hsla(${h},${s}%,${l}%,${a})`;

  const Avatar = ({ u, size = 44, radius = 12 }) => (
    <div style={{ width: size, height: size, borderRadius: radius, background: hsla(u.hue, 70, 60, dark ? 0.14 : 0.1), border: `1.5px solid ${hsla(u.hue, 70, 60, 0.28)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.3, fontWeight: 700, color: hsl(u.hue), flexShrink: 0, fontFamily: "'Instrument Serif',serif" }}>
      {u.avatar}
    </div>
  );

  const USERS = [
    { id: 1, name: "Aanya Sharma", handle: "aanya.dev", role: "Full Stack Engineer", avatar: "AS", hue: 259, bio: "Building SaaS tools. Needs UI/UX help, and you have exactly that.", skillsHave: ["React", "Next.js", "Node.js"], skillsNeed: ["UI/UX Design", "Figma"], online: true },
    { id: 2, name: "Rohan Mehra", handle: "rohan.ui", role: "Design Engineer", avatar: "RM", hue: 340, bio: "Designer who writes production code. Built 2 design systems.", skillsHave: ["Figma", "React", "Tailwind"], skillsNeed: ["Node.js", "DevOps"], online: true },
    { id: 3, name: "Priya Nair", handle: "priya.ml", role: "ML Engineer", avatar: "PN", hue: 158, bio: "Turning research papers into production products.", skillsHave: ["Python", "AWS", "Docker"], skillsNeed: ["React", "TypeScript"], online: false },
    { id: 4, name: "Dev Kapoor", handle: "dev.sys", role: "Systems Engineer", avatar: "DK", hue: 38, bio: "Distributed systems and high-throughput APIs.", skillsHave: ["Rust", "Go", "Redis"], skillsNeed: ["React", "UI/UX"], online: false },
  ];

  const TESTIMONIALS = [
    { id: 0, name: "Meera Joshi", role: "Indie Hacker · Pune", avatar: "MJ", hue: 271, quote: "Found my co-builder in 48 hours. We shipped our MVP in 3 weeks. The skill matching is eerily accurate — CodeBuddy knew we'd work well together before we did.", project: "Shipped: Notara (2.4k users)" },
    { id: 1, name: "Alex Kim", role: "Frontend Dev · Seoul", avatar: "AK", hue: 210, quote: "As a designer-developer hybrid, I always struggled to find backend partners. CodeBuddy matched me with someone who perfectly complemented my React skills. We're now business partners.", project: "Shipped: Slate Analytics" },
    { id: 2, name: "Fatima Al-Hassan", role: "ML Engineer · Dubai", avatar: "FA", hue: 158, quote: "The AI match insight is genuinely useful. It explained exactly why my skills complemented my match's. Felt like talking to a smart recruiter who actually understood code.", project: "Shipped: VisionFlow AI" },
    { id: 3, name: "Arjun Reddy", role: "Systems Dev · Hyderabad", avatar: "AR", hue: 38, quote: "I've tried every networking platform. CodeBuddy is the only one that gets that developers want to BUILD, not network. My match and I talk code from day one.", project: "Shipped: FastRoute (OSS)" },
  ];

  const FAQS = [
    { q: "How does the AI matching actually work?", a: "We analyze your skill profile, past projects, availability, and collaboration style. Our model finds builders whose skills complement yours — filling your gaps and vice versa. The match percentage reflects bidirectional skill overlap and compatibility signals." },
    { q: "Is CodeBuddy really free?", a: "Yes — the core matching experience, messaging, and up to 3 active connections are free forever. We offer Pro and Team plans for builders who need more concurrent connections, analytics, and priority matching." },
    { q: "Can I use it to find a mentor, not just a collaborator?", a: "Absolutely. When creating your profile you choose your intent: Collaborator, Mentor, Mentee, or Co-founder. The matching engine surfaces people who want the same kind of relationship you do." },
    { q: "What if I don't have many skills yet?", a: "You don't need to be a senior engineer. Many of our most successful matches are between a junior developer wanting to learn and an experienced builder who wants to mentor. Just be honest about where you are." },
    { q: "How is this different from LinkedIn or GitHub?", a: "LinkedIn is for jobs. GitHub is for code. CodeBuddy is specifically for finding a builder who ships with you. Everything — profiles, matching, chat — is designed around what you can build together, not your employment history." },
  ];

  const SKILLS_CLOUD = ["React", "Next.js", "Node.js", "Python", "Rust", "Go", "Flutter", "Swift", "AWS", "Docker", "Kubernetes", "PostgreSQL", "MongoDB", "GraphQL", "TypeScript", "Figma", "Tailwind", "Machine Learning", "Solidity", "Firebase", "Redis", "Web3", "DevOps", "iOS", "Android"];

  const Logo = () => (
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill={T.logoFill} />
      <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff" />
    </svg>
  );

  const CheckIcon = ({ color = "#a78bfa" }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7.5" stroke={color} strokeOpacity="0.3" />
      <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const Lbl = ({ children }) => <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: T.text3, marginBottom: 6 }}>{children}</div>;

  const SectionWrap = ({ children, style = {} }) => (
    <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(50px,11vw,90px)", ...style }}>
      {children}
    </section>
  );

  const SectionHead = ({ eyebrow, title, sub }) => (
    <div style={{ textAlign: "center", marginBottom: 52 }}>
      {eyebrow && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 99, padding: "4px 13px", marginBottom: 18 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.8px", textTransform: "uppercase" }}>{eyebrow}</span>
        </div>
      )}
      <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(28px,6vw,42px)", fontWeight: 400, color: T.text, letterSpacing: "-1px", lineHeight: 1.08, marginBottom: sub ? 14 : 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: "clamp(13px,3vw,15px)", color: T.text2, maxWidth: 520, margin: "0 auto", lineHeight: 1.65 }}>{sub}</p>}
    </div>
  );

  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{css}</style>

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-18%", left: "-8%", width: 650, height: 650, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.11)" : "hsla(259,70%,60%,0.055)"} 0%,transparent 65%)` }} />
        <div style={{ position: "absolute", bottom: "-12%", right: "-8%", width: 550, height: 550, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(300,60%,30%,0.07)" : "hsla(300,60%,60%,0.04)"} 0%,transparent 65%)` }} />
        {dark && <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.018 }} xmlns="http://www.w3.org/2000/svg"><defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#g)" /></svg>}
      </div>

      {/* Live ticker bar */}
      <div style={{ background: dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.07)", borderBottom: `1px solid ${T.surfaceBorder}`, padding: "7px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, position: "relative", zIndex: 99 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 7px #22c55e", flexShrink: 0, animation: "pulse 2s ease-in-out infinite" }} />
        <div style={{ height: 18, overflow: "hidden", position: "relative" }}>
          <div key={ticker} style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", animation: "tickerFade 3s ease-in-out both" }}>
            {tickerItems[ticker]}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="landing-nav" style={{ position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(16px,5vw,32px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo />
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(14px,4vw,18px)", color: T.text, letterSpacing: "-0.3px" }}>CodeBuddy</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn-icon" onClick={() => setDark(p => !p)} style={{ width: 36, height: 36 }} title="Toggle theme">
            {dark ? "☀️" : "🌙"}
          </button>
          <Link href="/signin"><button className="btn-ghost nav-ghost" style={{ padding: "7px 16px", fontSize: 13 }}>Sign in</button></Link>
          <Link href="/signup"><button className="btn-primary" style={{ padding: "8px 18px" }}>Get started →</button></Link>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── HERO ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "clamp(44px,10vw,96px) clamp(16px,5vw,32px) clamp(30px,8vw,72px)" }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>
            <div className="fade-up">
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 99, padding: "5px 14px", marginBottom: 24 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.5px", textTransform: "uppercase" }}>3,200+ builders online</span>
              </div>
              <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(32px,8vw,54px)", fontWeight: 400, lineHeight: 1.07, letterSpacing: "-1.8px", color: T.text, marginBottom: 20 }}>
                Find<br />
                <span style={{ fontStyle: "italic", color: "#a78bfa" }}>
                  {phrases[phraseIdx].slice(0, charIdx)}
                  <span style={{ animation: "blink 1s step-end infinite", color: "#a78bfa" }}>|</span>
                </span>
              </h1>
              <p style={{ fontSize: "clamp(13px,3vw,15px)", color: T.text2, lineHeight: 1.68, marginBottom: 32, maxWidth: 420 }}>
                CodeBuddy matches developers by what you have <em>and</em> what you need. Stop searching. Start building.
              </p>
              <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
                <Link href="/signup"><button className="btn-primary" style={{ padding: "12px 26px", fontSize: 14 }}>Start matching free →</button></Link>
                <Link href="/preview"><button className="btn-ghost">Preview dashboard</button></Link>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex" }}>
                  {[259, 340, 158, 38, 271].map((h, i) => (
                    <div key={i} style={{ width: 30, height: 30, borderRadius: 9, background: hsla(h, 70, 60, 0.18), border: `2px solid ${T.bg}`, outline: `1.5px solid ${hsla(h, 70, 60, 0.32)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: hsl(h), marginLeft: i > 0 ? -9 : 0, zIndex: 5 - i }}>
                      {"ASRPDSK"[i * 2]}
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: 12, color: T.text3 }}>Joined by <strong style={{ color: T.text2 }}>847 builders</strong> this month</span>
              </div>
            </div>

            {/* Hero match card */}
            <div className="hero-card fade-up float" style={{ animationDelay: "0.18s" }}>
              <div className="card-flat" style={{ padding: 22, boxShadow: T.shadow }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "1px", textTransform: "uppercase" }}>Top match today</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                    <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: "#a78bfa" }}>94%</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 13, alignItems: "center", marginBottom: 14 }}>
                  <Avatar u={USERS[0]} size={50} radius={14} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Aanya Sharma</div>
                    <div style={{ fontSize: 12, color: hsl(259), fontWeight: 500 }}>Full Stack Engineer · Bangalore</div>
                  </div>
                </div>
                <div className="match-track" style={{ marginBottom: 14 }}>
                  <div style={{ height: "100%", width: "94%", background: "linear-gradient(90deg,hsl(259,70%,45%),hsl(290,70%,65%))", borderRadius: 99 }} />
                </div>
                <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 14 }}>Building SaaS tools. Needs UI/UX help, and you have exactly that.</p>
                <div style={{ marginBottom: 10 }}>
                  <Lbl>Has</Lbl>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{["React", "Node.js", "PostgreSQL"].map(s => <span key={s} className="pill skill-have">{s}</span>)}</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <Lbl>Needs</Lbl>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{["UI/UX Design", "Figma"].map(s => <span key={s} className="pill skill-need">{s}</span>)}</div>
                </div>
                <div style={{ background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 12, padding: "11px 13px", marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", marginBottom: 5 }}>✦ AI MATCH INSIGHT</div>
                  <p style={{ fontSize: 11, color: dark ? "#b0a8d8" : "#6b5b9e", lineHeight: 1.55 }}>Your React skills fill Aanya's frontend gap. Her backend depth covers your weakness. Rare two-way match.</p>
                </div>
                <Link href="/signup"><button className="btn-primary" style={{ width: "100%" }}>Connect →</button></Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <SectionWrap>
          <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {[
              { v: "3,200+", l: "Active Builders", icon: "👥" },
              { v: "94%", l: "Match Accuracy", icon: "🎯" },
              { v: "847", l: "Projects Shipped", icon: "🚀" },
              { v: "40+", l: "Countries", icon: "🌐" },
            ].map((s, i) => (
              <div key={i} className="card-flat" style={{ padding: "22px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(24px,6vw,38px)", color: T.text, letterSpacing: "-1.2px", lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 12, color: T.text3, marginTop: 7, fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </SectionWrap>

        {/* ── HOW IT WORKS ── */}
        <SectionWrap>
          <SectionHead eyebrow="The Process" title={<>Three steps to<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>your perfect match</span></>} sub="From profile to partner in minutes. No cold outreach, no black-box algorithms." />
          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {[
              { n: "01", icon: "🛠", t: "Build your profile", d: "List what you know and what you need. Add projects, availability, and collaboration style." },
              { n: "02", icon: "✦", t: "AI matches you", d: "Our model scans thousands of builders and surfaces the ones who fill your exact skill gaps." },
              { n: "03", icon: "💬", t: "Review insights", d: "See why each match works before you reach out. AI explains compatibility in plain English." },
              { n: "04", icon: "🚀", t: "Start building", d: "Connect, chat, and move into a shared project room — all without leaving the platform." },
            ].map((s, i) => (
              <div key={i} className={`howit-step fade-up${matchStep === i ? " active" : ""}`} style={{ animationDelay: `${i * 0.09}s` }} onClick={() => setMatchStep(i)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: matchStep === i ? "#a78bfa" : T.text3, letterSpacing: "1px", fontFamily: "monospace" }}>{s.n}</span>
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 8 }}>{s.t}</h3>
                <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.62 }}>{s.d}</p>
                {matchStep === i && <div style={{ marginTop: 14, height: 2, background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: 99 }} />}
              </div>
            ))}
          </div>
        </SectionWrap>

        {/* ── SKILL CLOUD ── */}
        <SectionWrap>
          <SectionHead eyebrow="Skills" title={<>Find matches across<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>every stack</span></>} sub="From frontend to infrastructure, machine learning to mobile — if you code it, we match it." />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 700, margin: "0 auto" }}>
            {SKILLS_CLOUD.map((s, i) => (
              <button key={s} className="skill-tag fade-up" style={{ animationDelay: `${i * 0.03}s` }} onMouseEnter={() => setHoveredSkill(s)} onMouseLeave={() => setHoveredSkill(null)}>
                {s}
              </button>
            ))}
          </div>
        </SectionWrap>

        {/* ── LIVE PROFILES ── */}
        <SectionWrap>
          <SectionHead eyebrow="Community" title={<>Builders ready to<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>ship with you</span></>} sub="Real builders, real skills. See who's online and ready to collaborate right now." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
            {USERS.map((u, i) => (
              <div key={u.id} className="card fade-up" style={{ padding: 20, animationDelay: `${i * 0.08}s` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <Avatar u={u} size={44} radius={12} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: hsl(u.hue), fontWeight: 600 }}>{u.role}</div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: u.online ? "#22c55e" : T.text3, boxShadow: u.online ? "0 0 8px #22c55e" : "none", flexShrink: 0 }} />
                </div>
                <p style={{ fontSize: 12, color: T.text2, marginBottom: 12, lineHeight: 1.55 }}>{u.bio}</p>
                <div style={{ marginBottom: 8 }}>
                  <Lbl>Has</Lbl>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{u.skillsHave.slice(0, 2).map(s => <span key={s} className="pill skill-have">{s}</span>)}</div>
                </div>
                <div>
                  <Lbl>Needs</Lbl>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{u.skillsNeed.slice(0, 2).map(s => <span key={s} className="pill skill-need">{s}</span>)}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <Link href="/signup"><button className="btn-ghost">See all 3,200+ builders →</button></Link>
          </div>
        </SectionWrap>

        {/* ── FEATURES ── */}
        <SectionWrap>
          <SectionHead eyebrow="Features" title={<>Built for builders<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>who ship</span></>} />
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              { icon: "⚡", t: "AI-Powered Matching", d: "Our model surfaces builders you'll actually ship with — matched by skills, goals and work style.", badge: "Core" },
              { icon: "🎯", t: "Skill Gap Pairing", d: "We match by what you have AND what you need, creating two-way complementary partnerships.", badge: null },
              { icon: "💬", t: "Real-Time Chat", d: "Chat with context — always see why you matched right above every conversation.", badge: null },
              { icon: "🔮", t: "Match Insights", d: "AI explains every match in plain English so you can decide in seconds, not days.", badge: "AI" },
              { icon: "🚀", t: "Project Rooms", d: "Spin up a shared space to plan tasks and track progress without leaving the platform.", badge: null },
              { icon: "🌐", t: "Global Network", d: "3,200+ builders across 40+ countries. Someone's always online and ready to build.", badge: null },
            ].map((f, i) => (
              <div key={i} className="feat-card fade-up" style={{ animationDelay: `${i * 0.07}s`, position: "relative" }}>
                {f.badge && (
                  <div style={{ position: "absolute", top: 20, right: 20, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 99, padding: "2px 9px", fontSize: 9, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.5px", textTransform: "uppercase" }}>{f.badge}</div>
                )}
                <div style={{ fontSize: 26, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 8 }}>{f.t}</h3>
                <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.62 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </SectionWrap>

        {/* ── TESTIMONIALS ── */}
        <SectionWrap>
          <SectionHead eyebrow="Stories" title={<>Builders who found<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>their people</span></>} sub="Don't take our word for it. Hear from builders who've shipped something real." />
          <div className="testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={t.id} className={`testimonial-card fade-up${activeTestimonial === i ? " active" : ""}`} style={{ animationDelay: `${i * 0.08}s` }} onMouseEnter={() => setActiveTestimonial(i)}>
                <div style={{ fontSize: 28, color: "#7c3aed", marginBottom: 14, fontFamily: "Georgia,serif", opacity: 0.5 }}>"</div>
                <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.72, marginBottom: 18, fontStyle: "italic" }}>{t.quote}</p>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <Avatar u={t} size={40} radius={10} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: T.text3 }}>{t.role}</div>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, borderRadius: 99, padding: "4px 10px" }}>
                    <span style={{ fontSize: 10, color: T.skillHaveText }}>✓</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: T.skillHaveText }}>{t.project}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionWrap>

        {/* ── PRICING ── */}
        <SectionWrap>
          <SectionHead eyebrow="Pricing" title={<>Simple, honest<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>pricing</span></>} sub="Start free. Upgrade when you need more. No hidden fees, no algorithmic throttling." />
          <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              {
                name: "Free", price: "₹0", period: "forever",
                desc: "For builders just getting started.",
                features: ["Up to 3 active connections", "AI match insights", "Real-time messaging", "Basic profile", "Community access"],
                cta: "Get started →", featured: false,
              },
              {
                name: "Pro", price: "₹499", period: "per month",
                desc: "For serious builders who ship regularly.",
                features: ["Unlimited connections", "Priority AI matching", "Project rooms", "Analytics dashboard", "Advanced filters", "Custom profile badge"],
                cta: "Start Pro →", featured: true,
              },
              {
                name: "Team", price: "₹1,999", period: "per month",
                desc: "For startups building a founding team.",
                features: ["Everything in Pro", "Up to 5 team members", "Shared project spaces", "Team skill overview", "Invite-only discovery", "Dedicated support"],
                cta: "Contact us →", featured: false,
              },
            ].map((p, i) => (
              <div key={i} className={`pricing-card fade-up${p.featured ? " featured" : ""}`} style={{ animationDelay: `${i * 0.09}s` }}>
                {p.featured && (
                  <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "white", fontSize: 9, fontWeight: 700, padding: "4px 14px", borderRadius: "0 0 10px 10px", letterSpacing: "1px", textTransform: "uppercase" }}>Most Popular</div>
                )}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: p.featured ? "#a78bfa" : T.text3, marginBottom: 10, textTransform: "uppercase", letterSpacing: "1px" }}>{p.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                    <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.text, letterSpacing: "-1.5px" }}>{p.price}</span>
                    <span style={{ fontSize: 12, color: T.text3 }}>/{p.period}</span>
                  </div>
                  <p style={{ fontSize: 12, color: T.text2 }}>{p.desc}</p>
                </div>
                <div style={{ height: 1, background: T.border, margin: "16px 0" }} />
                <div style={{ marginBottom: 22 }}>
                  {p.features.map(f => (
                    <div key={f} className="check-item">
                      <CheckIcon color={p.featured ? "#a78bfa" : "#4ade80"} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/pricing">
                  <button className={p.featured ? "btn-primary" : "btn-ghost"} style={{ width: "100%", display: "block", textAlign: "center" }}>{p.cta}</button>
                </Link>
              </div>
            ))}
          </div>
        </SectionWrap>

        {/* ── FAQ ── */}
        <SectionWrap>
          <SectionHead eyebrow="FAQ" title={<>Common<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>questions</span></>} sub="Everything you need to know before you start matching." />
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            {FAQS.map((f, i) => (
              <div key={i} className="faq-item">
                <button className="faq-btn" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <span style={{ color: T.text3, fontSize: 18, transition: "transform 0.25s", transform: activeFaq === i ? "rotate(45deg)" : "none", flexShrink: 0, lineHeight: 1 }}>+</span>
                </button>
                {activeFaq === i && (
                  <div style={{ padding: "0 20px 18px", fontSize: 13, color: T.text2, lineHeight: 1.72, animation: "fadeUp 0.25s ease both" }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionWrap>

        {/* ── CTA ── */}
        <SectionWrap>
          <div style={{ background: dark ? "rgba(124,58,237,0.07)" : "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 26, padding: "clamp(36px,8vw,60px) clamp(24px,6vw,44px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 300, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,50%,0.08)" : "hsla(259,70%,60%,0.06)"} 0%,transparent 65%)`, pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>🚀</div>
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(28px,6vw,44px)", color: T.text, letterSpacing: "-1.2px", lineHeight: 1.08, marginBottom: 14 }}>
                Ready to find your<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>co-builder?</span>
              </h2>
              <p style={{ fontSize: "clamp(12px,3vw,14px)", color: T.text2, marginBottom: 32, maxWidth: 420, margin: "0 auto 32px" }}>
                Free forever for indie builders. No credit card. No cold DMs. Just the person who completes your stack.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/signup"><button className="btn-primary" style={{ padding: "13px 30px", fontSize: 14 }}>Create your profile →</button></Link>
                <Link href="/preview"><button className="btn-ghost">Preview app</button></Link>
              </div>
              <p style={{ marginTop: 20, fontSize: 11, color: T.text3 }}>✓ Free forever &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Setup in 2 min</p>
            </div>
          </div>
        </SectionWrap>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: `1px solid ${T.border}`, padding: "clamp(32px,6vw,52px) clamp(16px,5vw,32px)", maxWidth: 1060, margin: "0 auto" }}>
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 44 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <Logo />
                <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: T.text }}>CodeBuddy</span>
              </div>
              <p style={{ fontSize: 13, color: T.text3, lineHeight: 1.65, maxWidth: 240 }}>Matching developers by skills so they can stop searching and start building.</p>
              <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                {["𝕏", "GH", "in"].map((s, i) => (
                  <button key={i} className="btn-icon" style={{ width: 34, height: 34, fontSize: 12, fontWeight: 700 }}>{s}</button>
                ))}
              </div>
            </div>
            {[
              { h: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { h: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { h: "Legal", links: ["Privacy", "Terms", "Cookies", "Security"] },
            ].map(col => (
              <div key={col.h}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 14 }}>{col.h}</div>
                {col.links.map(l => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <a href="#" style={{ fontSize: 13, color: T.text3, textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => e.target.style.color = T.text}
                      onMouseLeave={e => e.target.style.color = T.text3}
                    >{l}</a>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: T.border, margin: "0 0 20px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 12, color: T.text3 }}>© 2025 CodeBuddy. Built by builders, for builders.</span>
            <span style={{ fontSize: 12, color: T.text3 }}>Made with ♥ in India</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;