"use client"
import { useState } from "react";
import Link from "next/link";
import { useThemeStore } from "../../../../store/themeprovider";
const Logo = () => (
  <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill="#1a0a6a" />
    <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff" />
  </svg>
);

const hsl = (h, s = 70, l = 60) => `hsl(${h},${s}%,${l}%)`;
const hsla = (h, s = 70, l = 60, a = 0.12) => `hsla(${h},${s}%,${l}%,${a})`;

const COVERAGE = [
  { outlet: "TechCrunch", date: "May 2026", headline: "CodeBuddy is the developer matchmaking platform India didn't know it needed", type: "Feature", typeHue: 259 },
  { outlet: "YourStory", date: "Apr 2026", headline: "How a Bangalore startup solved the co-founder discovery problem for engineers", type: "Interview", typeHue: 158 },
  { outlet: "The Ken", date: "Mar 2026", headline: "Inside CodeBuddy's AI matching engine: why it works when LinkedIn doesn't", type: "Deep Dive", typeHue: 38 },
  { outlet: "Inc42", date: "Feb 2026", headline: "Seed-stage startup CodeBuddy hits 3,000 developers with zero paid marketing", type: "Profile", typeHue: 340 },
  { outlet: "Product Hunt", date: "Jan 2026", headline: "#1 Product of the Day — 1,200 upvotes on launch", type: "Launch", typeHue: 200 },
  { outlet: "Hacker News", date: "Dec 2025", headline: "Show HN: I built a platform to match developers by skill gaps — 847 projects shipped", type: "Community", typeHue: 290 },
];

const STATS = [
  { v: "3,200+", l: "Active Builders" },
  { v: "40+", l: "Countries" },
  { v: "847", l: "Projects Shipped" },
  { v: "94%", l: "Match Accuracy" },
];

const ASSETS = [
  { name: "Logo Pack (SVG + PNG)", size: "2.4 MB", icon: "🎨", desc: "Dark, light, and icon-only variants in all standard sizes." },
  { name: "Product Screenshots", size: "8.1 MB", icon: "📸", desc: "High-res screenshots of the matching dashboard, profile, and chat." },
  { name: "Brand Guidelines", size: "1.1 MB", icon: "📐", desc: "Color palette, typography, usage rules, and do-not-use examples." },
  { name: "Founder Photos", size: "4.7 MB", icon: "👥", desc: "Hi-res headshots of Vikram Anand and Nisha Kapoor." },
];

const QUOTES = [
  { quote: "CodeBuddy is what happens when you build developer tools for developers, not investors.", source: "TechCrunch", hue: 259 },
  { quote: "The skill-gap matching idea is deceptively simple and surprisingly effective.", source: "The Ken", hue: 38 },
  { quote: "Rare: a platform that actually understands how engineers think and work.", source: "YourStory", hue: 158 },
];

export default function Press() {
 const { dark, toggleDark } = useThemeStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const T = dark ? {
    bg: "#07070f", bg2: "#0d0d1a",
    border: "rgba(255,255,255,0.06)", border2: "rgba(255,255,255,0.11)",
    text: "#e4e4f0", text2: "#8888aa", text3: "#44445a",
    card: "rgba(255,255,255,0.025)", cardHover: "rgba(255,255,255,0.04)",
    navBg: "rgba(7,7,15,0.92)",
    shadow: "0 24px 64px rgba(0,0,0,0.55)",
    surfaceA: "rgba(124,58,237,0.06)", surfaceBorder: "rgba(124,58,237,0.15)",
    aiBg: "rgba(60,40,140,0.12)", aiBorder: "rgba(120,80,255,0.18)",
  } : {
    bg: "#f4f4f8", bg2: "#ffffff",
    border: "rgba(0,0,0,0.07)", border2: "rgba(0,0,0,0.13)",
    text: "#18182c", text2: "#555570", text3: "#9090b0",
    card: "#ffffff", cardHover: "#f7f7fc",
    navBg: "rgba(244,244,248,0.95)",
    shadow: "0 20px 60px rgba(0,0,0,0.1)",
    surfaceA: "rgba(124,58,237,0.05)", surfaceBorder: "rgba(124,58,237,0.15)",
    aiBg: "rgba(124,58,237,0.06)", aiBorder: "rgba(124,58,237,0.18)",
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)"};border-radius:99px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    .fade-up{animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both}
    .btn-primary{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:11px 24px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 6px 24px rgba(124,58,237,0.28)}
    .btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(124,58,237,0.42)}
    .btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:9px 18px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s}
    .btn-ghost:hover{border-color:${T.border2};color:${T.text}}
    .btn-icon{background:transparent;border:1px solid ${T.border};color:${T.text3};padding:8px;border-radius:10px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center}
    .btn-icon:hover{border-color:${T.border2};color:${T.text}}
    .landing-nav{background:${T.navBg};backdrop-filter:blur(28px);border-bottom:1px solid ${T.border}}
    .coverage-card{background:${T.card};border:1px solid ${T.border};border-radius:18px;padding:22px;transition:all 0.28s;cursor:pointer}
    .coverage-card:hover{background:${T.cardHover};border-color:${T.border2};transform:translateY(-2px);box-shadow:${T.shadow}}
    .asset-card{background:${T.card};border:1px solid ${T.border};border-radius:16px;padding:20px;transition:all 0.25s;display:flex;align-items:center;gap:16px;cursor:pointer}
    .asset-card:hover{background:${T.cardHover};border-color:rgba(124,58,237,0.28);box-shadow:${T.shadow}}
    .boilerplate-box{background:${T.card};border:1px solid ${T.border};border-radius:16px;padding:22px;font-size:13px;color:${T.text2};line-height:1.75;position:relative}
    .copy-btn{position:absolute;top:14px;right:14px;background:${T.surfaceA};border:1px solid ${T.surfaceBorder};color:#a78bfa;padding:5px 12px;border-radius:8px;font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;transition:all 0.15s}
    .copy-btn:hover{background:rgba(124,58,237,0.15)}
    .quote-card{background:${T.card};border:1px solid ${T.border};border-radius:18px;padding:24px;transition:all 0.28s}
    .quote-card:hover{border-color:rgba(124,58,237,0.25);background:${dark ? "rgba(124,58,237,0.04)" : "rgba(124,58,237,0.02)"}}
    @media(max-width:768px){
      .coverage-grid{grid-template-columns:1fr!important}
      .assets-grid{grid-template-columns:1fr!important}
      .stats-row{grid-template-columns:repeat(2,1fr)!important}
      .quotes-grid{grid-template-columns:1fr!important}
    }
    @media(max-width:480px){.nav-ghost{display:none}}
  `;

  const boilerplate = `CodeBuddy is a developer matchmaking platform that pairs engineers by complementary skill sets. Founded in Bangalore in 2024, CodeBuddy uses AI to surface builders who fill each other's skill gaps — turning a problem that used to take months into a match that takes minutes. The platform has 3,200+ active builders across 40+ countries, with 847 projects shipped by matched pairs. CodeBuddy is free for indie developers, with Pro and Team plans for serious builders.`;

  const SectionHead = ({ eyebrow, title, sub }) => (
    <div style={{ textAlign: "center", marginBottom: 48 }}>
      {eyebrow && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 99, padding: "4px 13px", marginBottom: 18 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.8px", textTransform: "uppercase" }}>{eyebrow}</span>
        </div>
      )}
      <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(26px,6vw,40px)", fontWeight: 400, color: T.text, letterSpacing: "-1px", lineHeight: 1.08, marginBottom: sub ? 14 : 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: "clamp(13px,3vw,15px)", color: T.text2, maxWidth: 500, margin: "0 auto", lineHeight: 1.65 }}>{sub}</p>}
    </div>
  );

  const TypeBadge = ({ type, hue }) => (
    <span style={{ padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: hsla(hue, 70, 60, dark ? 0.12 : 0.09), border: `1px solid ${hsla(hue, 70, 60, 0.28)}`, color: hsl(hue) }}>
      {type}
    </span>
  );

  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{css}</style>

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-18%", left: "-8%", width: 650, height: 650, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.11)" : "hsla(259,70%,60%,0.055)"} 0%,transparent 65%)` }} />
        <div style={{ position: "absolute", bottom: "-12%", right: "-8%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(300,60%,30%,0.07)" : "hsla(300,60%,60%,0.04)"} 0%,transparent 65%)` }} />
        {dark && <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.018 }} xmlns="http://www.w3.org/2000/svg"><defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#g)" /></svg>}
      </div>

      {/* Nav */}
      <nav className="landing-nav" style={{ position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(16px,5vw,32px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Logo />
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: T.text, letterSpacing: "-0.3px" }}>CodeBuddy</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── HERO ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "clamp(60px,12vw,110px) clamp(16px,5vw,32px) clamp(36px,7vw,60px)", textAlign: "center" }}>
          <div className="fade-up">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 99, padding: "4px 13px", marginBottom: 22 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.8px", textTransform: "uppercase" }}>Press & Media</span>
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(34px,9vw,62px)", fontWeight: 400, lineHeight: 1.06, letterSpacing: "-1.8px", color: T.text, marginBottom: 20 }}>
              Everything you need<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>to cover CodeBuddy.</span>
            </h1>
            <p style={{ fontSize: "clamp(13px,3vw,16px)", color: T.text2, lineHeight: 1.72, maxWidth: 500, margin: "0 auto 32px" }}>
              Assets, boilerplate, key stats, and press contact — all in one place. We respond to press inquiries within 24 hours.
            </p>
            <a href="mailto:press@codebuddy.dev">
              <button className="btn-primary" style={{ padding: "12px 28px", fontSize: 14 }}>Contact press team →</button>
            </a>
          </div>
        </section>

        {/* ── KEY STATS ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(44px,9vw,72px)" }}>
          <div className="stats-row fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, animationDelay: "0.1s" }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "22px 16px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(24px,5vw,36px)", color: T.text, letterSpacing: "-1px", lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 11, color: T.text3, marginTop: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOILERPLATE ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(44px,9vw,72px)" }}>
          <SectionHead eyebrow="About CodeBuddy" title={<>Standard<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>boilerplate</span></>} sub="Use this text in articles and publications. You may shorten it; please don't alter factual claims." />
          <div className="boilerplate-box" style={{ maxWidth: 700, margin: "0 auto" }}>
            <button className="copy-btn" onClick={() => handleCopy(boilerplate)}>
              {copied ? "Copied ✓" : "Copy text"}
            </button>
            {boilerplate}
          </div>
        </section>

        {/* ── PRESS QUOTES ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(44px,9vw,72px)" }}>
          <SectionHead eyebrow="What they're saying" title={<>Quotes from<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>the press</span></>} />
          <div className="quotes-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {QUOTES.map((q, i) => (
              <div key={i} className="quote-card fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div style={{ fontSize: 32, color: "#7c3aed", marginBottom: 12, fontFamily: "Georgia,serif", opacity: 0.4, lineHeight: 1 }}>"</div>
                <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.72, fontStyle: "italic", marginBottom: 16 }}>{q.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: hsla(q.hue, 70, 60, dark ? 0.14 : 0.1), border: `1px solid ${hsla(q.hue, 70, 60, 0.28)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📰</div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: hsl(q.hue) }}>{q.source}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRESS COVERAGE ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(44px,9vw,72px)" }}>
          <SectionHead eyebrow="Coverage" title={<>CodeBuddy in<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>the news</span></>} sub="Recent mentions and features across the developer and startup press." />
          <div className="coverage-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {COVERAGE.map((c, i) => (
              <div key={i} className="coverage-card fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: T.text, letterSpacing: "-0.3px" }}>{c.outlet}</span>
                    <TypeBadge type={c.type} hue={c.typeHue} />
                  </div>
                  <span style={{ fontSize: 11, color: T.text3 }}>{c.date}</span>
                </div>
                <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.6, fontStyle: "italic" }}>"{c.headline}"</p>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 4, color: "#a78bfa", fontSize: 12, fontWeight: 600 }}>
                  Read article <span style={{ fontSize: 14 }}>→</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BRAND ASSETS ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(44px,9vw,72px)" }}>
          <SectionHead eyebrow="Brand Kit" title={<>Download our<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>brand assets</span></>} sub="All assets are pre-cleared for press use. Please follow our brand guidelines." />
          <div className="assets-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {ASSETS.map((a, i) => (
              <div key={i} className="asset-card fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {a.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: T.text2, marginBottom: 6 }}>{a.desc}</div>
                  <span style={{ fontSize: 11, color: T.text3 }}>{a.size}</span>
                </div>
                <button className="btn-ghost" style={{ padding: "7px 14px", fontSize: 12, whiteSpace: "nowrap", flexShrink: 0 }}>Download ↓</button>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRESS CONTACT ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(60px,12vw,100px)" }}>
          <div style={{ background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 24, padding: "clamp(32px,6vw,52px)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 14 }}>Press Contact</div>
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(22px,4vw,32px)", fontWeight: 400, color: T.text, letterSpacing: "-0.5px", lineHeight: 1.15, marginBottom: 14 }}>
                Need something<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>specific?</span>
              </h2>
              <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.72, marginBottom: 22 }}>
                We're happy to arrange interviews with our founders, provide additional data, or commission exclusive demos. We reply to all press inquiries within 24 hours.
              </p>
              <a href="mailto:press@codebuddy.dev">
                <button className="btn-primary" style={{ padding: "11px 24px" }}>press@codebuddy.dev →</button>
              </a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Press contact", value: "press@codebuddy.dev" },
                { label: "Founder interviews", value: "Vikram Anand, CEO" },
                { label: "Technical briefings", value: "Nisha Kapoor, CTO" },
                { label: "Response time", value: "Within 24 hours" },
                { label: "Press kit updated", value: "May 2026" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: i < 4 ? `1px solid ${T.border}` : "none" }}>
                  <span style={{ fontSize: 12, color: T.text3 }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: `1px solid ${T.border}`, padding: "clamp(28px,5vw,44px) clamp(16px,5vw,32px)", maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <Logo />
              <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 16, color: T.text }}>CodeBuddy</span>
            </Link>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {["About", "Blog", "Careers", "PrivacyPolicy", "Terms"].map(l => (
                <Link key={l} href={`/${l.toLowerCase()}`} style={{ fontSize: 13, color: T.text3, textDecoration: "none" }}>{l}</Link>
              ))}
            </div>
            <span style={{ fontSize: 12, color: T.text3 }}>© 2026 CodeBuddy · Made with ♥ in India</span>
          </div>
        </footer>
      </div>
    </div>
  );
}