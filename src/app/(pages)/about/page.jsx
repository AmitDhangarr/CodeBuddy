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

const Avatar = ({ hue, initials, size = 56, radius = 16, dark }) => (
  <div style={{ width: size, height: size, borderRadius: radius, background: hsla(hue, 70, 60, dark ? 0.14 : 0.1), border: `1.5px solid ${hsla(hue, 70, 60, 0.3)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.3, fontWeight: 700, color: hsl(hue), flexShrink: 0, fontFamily: "'Instrument Serif',serif" }}>
    {initials}
  </div>
);

export default function About() {
   const { dark, toggleDark } = useThemeStore();

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
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    .fade-up{animation:fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both}
    .btn-primary{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:11px 24px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 6px 24px rgba(124,58,237,0.28)}
    .btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(124,58,237,0.42)}
    .btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:9px 18px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s}
    .btn-ghost:hover{border-color:${T.border2};color:${T.text}}
    .btn-icon{background:transparent;border:1px solid ${T.border};color:${T.text3};padding:8px;border-radius:10px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center}
    .btn-icon:hover{border-color:${T.border2};color:${T.text}}
    .card{background:${T.card};border:1px solid ${T.border};border-radius:18px;transition:all 0.28s}
    .card:hover{background:${T.cardHover};border-color:${T.border2};transform:translateY(-2px);box-shadow:${T.shadow}}
    .landing-nav{background:${T.navBg};backdrop-filter:blur(28px);border-bottom:1px solid ${T.border}}
    @media(max-width:768px){
      .team-grid{grid-template-columns:repeat(2,1fr)!important}
      .values-grid{grid-template-columns:1fr!important}
      .hero-stats{grid-template-columns:repeat(2,1fr)!important}
    }
    @media(max-width:480px){
      .nav-ghost{display:none}
      .team-grid{grid-template-columns:1fr!important}
    }
  `;

  const TEAM = [
    { name: "Vikram Anand", role: "CEO & Co-founder", initials: "VA", hue: 259, bio: "Ex-Stripe engineer. Built 3 startups before CodeBuddy. Obsessed with developer communities." },
    { name: "Nisha Kapoor", role: "CTO & Co-founder", initials: "NK", hue: 340, bio: "MIT CS grad. Led ML infrastructure at Swiggy. Architected the matching engine from scratch." },
    { name: "Arjun Das", role: "Head of Design", initials: "AD", hue: 38, bio: "Ex-Figma designer. Believes great dev tools should feel like art. Prototypes everything twice." },
    { name: "Sanya Mehta", role: "Head of Growth", initials: "SM", hue: 158, bio: "Growth at Razorpay and Notion India. Grew our waitlist from 0 to 12k in 60 days." },
    { name: "Rahul Verma", role: "Lead Engineer", initials: "RV", hue: 200, bio: "Full-stack at heart, Rust enthusiast. Ships features faster than most teams ship plans." },
    { name: "Priya Iyer", role: "Community Lead", initials: "PI", hue: 290, bio: "Built developer communities at GitHub India. Knows every builder on the platform personally." },
  ];

  const VALUES = [
    { icon: "🛠", title: "Builders first", desc: "Every decision starts with one question: does this help someone ship faster? We're developers ourselves, and we build for ourselves." },
    { icon: "✦", title: "Honest algorithms", desc: "Our matching is explainable. We never hide why two people were paired. Transparency is a feature, not an afterthought." },
    { icon: "🌏", title: "Global, local", desc: "CodeBuddy started in India but belongs to every developer on Earth. Timezone-aware, language-sensitive, globally ambitious." },
    { icon: "🔮", title: "Complement, don't compete", desc: "We believe the best products are built by people with different skills who trust each other — not solo heroes or homogeneous teams." },
    { icon: "📖", title: "Learn in public", desc: "We share our metrics, our mistakes, and our roadmap. A community that watches us grow holds us accountable." },
    { icon: "🚀", title: "Ship or nothing", desc: "Features that don't ship don't exist. We move fast, break less, and celebrate every launch — big or tiny." },
  ];

  const MILESTONES = [
    { year: "Jan 2024", event: "CodeBuddy idea born after two engineers couldn't find each other online", marker: "💡" },
    { year: "Apr 2024", event: "Private beta launched with 80 hand-picked builders from Twitter/X", marker: "🧪" },
    { year: "Jul 2024", event: "AI matching engine v1 ships — 40% higher connection rate overnight", marker: "✦" },
    { year: "Oct 2024", event: "1,000 active users milestone. First 10 projects shipped by matched pairs", marker: "🎉" },
    { year: "Jan 2025", event: "Seed round closed. Team grows to 8. Mobile app enters beta", marker: "💰" },
    { year: "Now 2026", event: "3,200+ builders, 40+ countries, 847 shipped projects and counting", marker: "🚀" },
  ];

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
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "clamp(60px,12vw,110px) clamp(16px,5vw,32px) clamp(40px,8vw,72px)", textAlign: "center" }}>
          <div className="fade-up">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 99, padding: "4px 13px", marginBottom: 24 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.8px", textTransform: "uppercase" }}>Our Story</span>
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(36px,9vw,68px)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-2px", color: T.text, marginBottom: 24, maxWidth: 720, margin: "0 auto 24px" }}>
              Built by builders,<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>for builders</span>
            </h1>
            <p style={{ fontSize: "clamp(14px,3vw,17px)", color: T.text2, lineHeight: 1.72, maxWidth: 560, margin: "0 auto 40px" }}>
              We started CodeBuddy because we kept seeing the same problem — brilliant developers who couldn't find each other. The internet is huge, but the developer-to-developer connection layer was broken.
            </p>
          </div>

          {/* Stats */}
          <div className="hero-stats fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, maxWidth: 760, margin: "0 auto", animationDelay: "0.15s" }}>
            {[
              { v: "2024", l: "Founded" },
              { v: "3,200+", l: "Builders" },
              { v: "40+", l: "Countries" },
              { v: "847", l: "Shipped" },
            ].map((s, i) => (
              <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 12px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(22px,5vw,32px)", color: T.text, letterSpacing: "-1px" }}>{s.v}</div>
                <div style={{ fontSize: 11, color: T.text3, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── MISSION ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(50px,10vw,80px)" }}>
          <div style={{ background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 24, padding: "clamp(32px,6vw,56px) clamp(24px,5vw,56px)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "50%", left: "60%", transform: "translate(-50%,-50%)", width: 500, height: 300, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,50%,0.07)" : "hsla(259,70%,60%,0.05)"} 0%,transparent 65%)`, pointerEvents: "none" }} />
            <div style={{ position: "relative", maxWidth: 620 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 16 }}>Our Mission</div>
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(24px,5vw,38px)", fontWeight: 400, color: T.text, letterSpacing: "-0.8px", lineHeight: 1.12, marginBottom: 20 }}>
                Make developer collaboration as easy as<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>writing a function.</span>
              </h2>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.75 }}>
                The best software in the world was never built alone. But finding the right co-builder — someone who fills your skill gaps, shares your work ethic, and wants to ship — has always been frustratingly hard. We're fixing that, one matched pair at a time.
              </p>
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(50px,10vw,80px)" }}>
          <SectionHead eyebrow="Values" title={<>What we<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>believe</span></>} sub="Six principles that guide every product decision we make." />
          <div className="values-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {VALUES.map((v, i) => (
              <div key={i} className="card fade-up" style={{ padding: "24px 22px", animationDelay: `${i * 0.07}s` }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{v.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 8 }}>{v.title}</h3>
                <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.68 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(50px,10vw,80px)" }}>
          <SectionHead eyebrow="Timeline" title={<>How we got<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>here</span></>} />
          <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
            <div style={{ position: "absolute", left: 19, top: 0, bottom: 0, width: 1, background: `linear-gradient(to bottom, rgba(124,58,237,0.4), rgba(124,58,237,0.05))` }} />
            {MILESTONES.map((m, i) => (
              <div key={i} className="fade-up" style={{ display: "flex", gap: 24, marginBottom: 28, animationDelay: `${i * 0.1}s` }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, zIndex: 1 }}>
                  {m.marker}
                </div>
                <div style={{ paddingTop: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 5 }}>{m.year}</div>
                  <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.62 }}>{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TEAM ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(50px,10vw,80px)" }}>
          <SectionHead eyebrow="Team" title={<>The builders<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>behind CodeBuddy</span></>} sub="A small team that moves fast, ships constantly, and genuinely cares about developers." />
          <div className="team-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {TEAM.map((t, i) => (
              <div key={i} className="card fade-up" style={{ padding: "24px", animationDelay: `${i * 0.08}s`, textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                  <Avatar hue={t.hue} initials={t.initials} size={60} radius={16} dark={dark} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: hsl(t.hue), fontWeight: 600, marginBottom: 10 }}>{t.role}</div>
                <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.62 }}>{t.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(60px,12vw,100px)" }}>
          <div style={{ background: dark ? "rgba(124,58,237,0.07)" : "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 26, padding: "clamp(36px,8vw,60px) clamp(24px,6vw,44px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 300, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,50%,0.08)" : "hsla(259,70%,60%,0.06)"} 0%,transparent 65%)`, pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(26px,6vw,42px)", color: T.text, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 14 }}>
                Join the builders<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>already shipping.</span>
              </h2>
              <p style={{ fontSize: 14, color: T.text2, marginBottom: 32, maxWidth: 380, margin: "0 auto 32px" }}>Free forever. No credit card. Just find the person who completes your stack.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/signup"><button className="btn-primary" style={{ padding: "13px 30px", fontSize: 14 }}>Create your profile →</button></Link>
                <Link href="/careers"><button className="btn-ghost">Join our team</button></Link>
              </div>
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
              {["Blog", "Careers", "Press", "Privacy", "Terms"].map(l => (
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