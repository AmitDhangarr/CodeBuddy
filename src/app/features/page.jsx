'use client'
import Link from "next/link";
import { useState } from "react";

const Logo = ({ fill = "#1a0a6a" }) => (
  <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
    <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill={fill}/>
    <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#fff"/>
  </svg>
);

export default function FeaturesPage() {
  const [dark, setDark] = useState(true);
  const [activeFeature, setActiveFeature] = useState(0);

  const T = dark ? {
    bg:"#07070f",bg2:"#0d0d1a",border:"rgba(255,255,255,0.06)",border2:"rgba(255,255,255,0.11)",
    text:"#e4e4f0",text2:"#8888aa",text3:"#44445a",card:"rgba(255,255,255,0.025)",cardHover:"rgba(255,255,255,0.04)",
    shadow:"0 24px 64px rgba(0,0,0,0.55)",navBg:"rgba(7,7,15,0.92)",logoFill:"#1a0a6a",
    surfaceA:"rgba(124,58,237,0.06)",surfaceBorder:"rgba(124,58,237,0.15)",
    aiBg:"rgba(60,40,140,0.12)",aiBorder:"rgba(120,80,255,0.18)",
  } : {
    bg:"#f4f4f8",bg2:"#ffffff",border:"rgba(0,0,0,0.07)",border2:"rgba(0,0,0,0.13)",
    text:"#18182c",text2:"#555570",text3:"#9090b0",card:"#ffffff",cardHover:"#f7f7fc",
    shadow:"0 20px 60px rgba(0,0,0,0.1)",navBg:"rgba(244,244,248,0.95)",logoFill:"#7c3aed",
    surfaceA:"rgba(124,58,237,0.05)",surfaceBorder:"rgba(124,58,237,0.15)",
    aiBg:"rgba(124,58,237,0.06)",aiBorder:"rgba(124,58,237,0.18)",
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:${dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.12)"};border-radius:99px}
    a{color:inherit;text-decoration:none}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes glow{0%,100%{opacity:0.5}50%{opacity:1}}
    .fade-up{animation:fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both}
    .float{animation:float 6s ease-in-out infinite}
    .btn-primary{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:11px 24px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 6px 24px rgba(124,58,237,0.28)}
    .btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(124,58,237,0.42)}
    .btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:9px 18px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s}
    .btn-ghost:hover{border-color:${T.border2};color:${T.text}}
    .feature-tab{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:10px 18px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;text-align:left;width:100%}
    .feature-tab.active{background:${T.surfaceA};border-color:rgba(124,58,237,0.35);color:#a78bfa}
    .feature-tab:hover:not(.active){border-color:${T.border2};color:${T.text}}
    .comparison-row:nth-child(even){background:${dark?"rgba(255,255,255,0.015)":"rgba(0,0,0,0.02)"}}
    @media(max-width:768px){
      .features-layout{grid-template-columns:1fr!important;gap:32px!important}
      .compare-grid{grid-template-columns:1fr!important}
      .stats-row{grid-template-columns:repeat(2,1fr)!important}
      .integrations-grid{grid-template-columns:repeat(2,1fr)!important}
    }
    @media(max-width:480px){
      .stats-row{grid-template-columns:1fr!important}
    }
  `;

  const FEATURES = [
    {
      icon: "✦", label: "AI Matching", color: "#a78bfa",
      title: "Eerily accurate skill matching",
      desc: "Our AI doesn't just look at what you know — it analyses your collaboration style, timezone, project goals, and how you communicate. The result is matches that feel handpicked.",
      points: ["Bidirectional skill gap analysis", "Work style compatibility scoring", "Timezone-aware recommendations", "Project type alignment", "Communication preference matching"],
      visual: { type: "match", score: 94, user1: { name: "You", skills: ["React", "TypeScript", "Next.js"] }, user2: { name: "Aanya S.", skills: ["Node.js", "PostgreSQL", "AWS"] } }
    },
    {
      icon: "🎯", label: "Skill Profiles", color: "#4ade80",
      title: "Profiles built for builders",
      desc: "No endorsements theater. No keyword stuffing. Your profile shows what you're actually building, the skills you have, and the gaps you're looking to fill — honestly.",
      points: ["Tech stack with proficiency levels", "'Have' vs 'Need' skill separation", "Live project portfolio links", "Availability & timezone display", "Collaboration intent (mentor/partner/co-founder)"],
      visual: { type: "profile" }
    },
    {
      icon: "💬", label: "Smart Chat", color: "#60a5fa",
      title: "Context-aware messaging",
      desc: "Every conversation starts with context — why you matched, what you each bring, and what you could build together. No more awkward cold-start messages.",
      points: ["Match context pinned to every chat", "Code snippet sharing built-in", "Voice message support", "File and project asset sharing", "Read receipts & typing indicators"],
      visual: { type: "chat" }
    },
    {
      icon: "🚀", label: "Project Rooms", color: "#f59e0b",
      title: "Ship together, in one place",
      desc: "Once you connect, spin up a shared project room with a task board, shared notes, and a team timeline — everything you need to go from idea to shipped.",
      points: ["Kanban task board", "Shared markdown notes", "Milestone tracking", "File storage (2 GB free)", "Invite collaborators"],
      visual: { type: "project" }
    },
    {
      icon: "🔮", label: "Match Insights", color: "#f472b6",
      title: "AI explains every match",
      desc: "Instead of a mystery score, you see a plain-English breakdown of why two builders complement each other. Make informed decisions in seconds.",
      points: ["Plain-English compatibility summary", "Skill overlap visualisation", "Potential project ideas", "Predicted collaboration style", "Red flags flagged honestly"],
      visual: { type: "insight" }
    },
    {
      icon: "🌐", label: "Discovery", color: "#34d399",
      title: "Find builders your way",
      desc: "Browse by skill, filter by availability, search by project type, or let the AI surface the best matches automatically. Discovery is yours to control.",
      points: ["Advanced skill-based search", "Availability filters", "Project type filters", "Location & timezone filters", "Saved search alerts"],
      visual: { type: "discovery" }
    },
  ];

  const af = FEATURES[activeFeature];

  const MockCard = ({ feature }) => {
    if (feature.visual.type === "match") return (
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "1px", textTransform: "uppercase" }}>Match Result</span>
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 32, color: "#a78bfa" }}>94%</span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
          {[feature.visual.user1, feature.visual.user2].map((u, i) => (
            <div key={i} style={{ flex: 1, background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>{u.name}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {u.skills.map(s => <span key={s} style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 600, color: "#a78bfa" }}>{s}</span>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 3, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)", borderRadius: 99, overflow: "hidden", marginBottom: 14 }}>
          <div style={{ height: "100%", width: "94%", background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: 99 }} />
        </div>
        <div style={{ background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 12, padding: "11px 13px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", marginBottom: 5 }}>✦ AI INSIGHT</div>
          <p style={{ fontSize: 11, color: dark ? "#b0a8d8" : "#6b5b9e", lineHeight: 1.55 }}>Your React skills fill Aanya's frontend gap. Her backend depth covers yours. Rare two-way complementary match.</p>
        </div>
      </div>
    );
    if (feature.visual.type === "chat") return (
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 10, padding: 10, marginBottom: 4 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#a78bfa", marginBottom: 4 }}>✦ WHY YOU MATCHED</div>
          <p style={{ fontSize: 11, color: dark ? "#b0a8d8" : "#6b5b9e" }}>Your React + UI skills complement Rohan's backend perfectly.</p>
        </div>
        {[
          { me: false, text: "Hey! Saw your SaaS project — I can help with the frontend architecture 👋" },
          { me: true, text: "That's perfect timing, I'm stuck on the dashboard design." },
          { me: false, text: "I've built 3 dashboards in Next.js. Want to hop on a call?" },
          { me: true, text: "Yes! When works for you?" },
        ].map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.me ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "80%", background: m.me ? "linear-gradient(135deg,#7c3aed,#a855f7)" : (dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"), borderRadius: m.me ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "9px 13px", fontSize: 12, color: m.me ? "white" : T.text, lineHeight: 1.5 }}>{m.text}</div>
          </div>
        ))}
      </div>
    );
    if (feature.visual.type === "project") return (
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>SaaS Dashboard · Sprint 2</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#4ade80", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 99, padding: "2px 8px" }}>Active</span>
        </div>
        {[
          { col: "Todo", color: "#60a5fa", tasks: ["API rate limiting", "Mobile nav"] },
          { col: "In Progress", color: "#f59e0b", tasks: ["Dashboard charts", "Auth flow"] },
          { col: "Done", color: "#4ade80", tasks: ["DB schema", "Login page"] },
        ].map(col => (
          <div key={col.col} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: col.color, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 7 }}>{col.col}</div>
            {col.tasks.map(t => (
              <div key={t} style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${T.border}`, borderRadius: 9, padding: "8px 11px", marginBottom: 5, fontSize: 12, color: T.text2 }}>{t}</div>
            ))}
          </div>
        ))}
      </div>
    );
    return (
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 24 }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>{feature.icon}</div>
        <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: T.text, marginBottom: 10 }}>{feature.title}</h3>
        <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.65 }}>Interactive preview of {feature.label} coming soon.</p>
        <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {feature.points.slice(0, 3).map(p => (
            <span key={p} style={{ background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 99, padding: "4px 10px", fontSize: 11, color: "#a78bfa" }}>{p}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{css}</style>

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.09)" : "hsla(259,70%,60%,0.045)"} 0%,transparent 65%)` }} />
      </div>

      {/* Nav */}
      <nav style={{ background: T.navBg, backdropFilter: "blur(28px)", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(16px,5vw,32px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo fill={T.logoFill} />
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: T.text }}>CodeBuddy</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Hero */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "clamp(44px,10vw,96px) clamp(16px,5vw,32px) clamp(30px,8vw,64px)", textAlign: "center" }}>
          <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 99, padding: "4px 14px", marginBottom: 22 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "1px", textTransform: "uppercase" }}>Everything you need</span>
          </div>
          <h1 className="fade-up" style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(32px,8vw,58px)", fontWeight: 400, lineHeight: 1.06, letterSpacing: "-2px", color: T.text, marginBottom: 20, animationDelay: "0.05s" }}>
            Built for builders<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>who ship things</span>
          </h1>
          <p className="fade-up" style={{ fontSize: "clamp(13px,3vw,16px)", color: T.text2, lineHeight: 1.68, marginBottom: 36, maxWidth: 520, margin: "0 auto 36px", animationDelay: "0.1s" }}>
            Every feature in CodeBuddy is designed around one goal: getting you from "I need a co-builder" to "we're shipping" in the least time possible.
          </p>
          <div className="fade-up" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", animationDelay: "0.15s" }}>
            <Link href="/signup"><button className="btn-primary" style={{ padding: "12px 26px", fontSize: 14 }}>Start for free →</button></Link>
            <Link href="/pricing"><button className="btn-ghost">See pricing</button></Link>
          </div>
        </section>

        {/* Interactive features */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(50px,10vw,80px)" }}>
          <div className="features-layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>
            {/* Tabs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, position: "sticky", top: 80 }}>
              {FEATURES.map((f, i) => (
                <button key={i} className={`feature-tab${activeFeature === i ? " active" : ""}`} onClick={() => setActiveFeature(i)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{f.icon}</span>
                    <span>{f.label}</span>
                  </div>
                </button>
              ))}
            </div>
            {/* Content */}
            <div>
              <div className="fade-up" key={activeFeature} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 22, padding: "clamp(24px,4vw,36px)", marginBottom: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }} className="features-layout">
                  <div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 99, padding: "3px 11px", marginBottom: 16 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#a78bfa", letterSpacing: "1px", textTransform: "uppercase" }}>{af.label}</span>
                    </div>
                    <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(20px,4vw,28px)", color: T.text, letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: 14 }}>{af.title}</h2>
                    <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.7, marginBottom: 22 }}>{af.desc}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {af.points.map((p, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: T.text2 }}>
                          <span style={{ color: af.color, fontSize: 15 }}>✓</span>{p}
                        </div>
                      ))}
                    </div>
                  </div>
                  <MockCard feature={af} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(50px,10vw,80px)" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(26px,5vw,38px)", color: T.text, letterSpacing: "-1px", marginBottom: 10 }}>
              How we compare to<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>the alternatives</span>
            </h2>
          </div>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ padding: "16px 20px", fontSize: 12, fontWeight: 700, color: T.text3, textTransform: "uppercase", letterSpacing: "0.8px" }}>Feature</div>
              {["CodeBuddy", "LinkedIn", "GitHub"].map((h, i) => (
                <div key={h} style={{ padding: "16px 20px", textAlign: "center", fontSize: 12, fontWeight: 700, color: i === 0 ? "#a78bfa" : T.text3, background: i === 0 ? T.surfaceA : "transparent" }}>{h}</div>
              ))}
            </div>
            {[
              ["Skill-based matching", true, false, false],
              ["AI match explanations", true, false, false],
              ["Bidirectional skill gaps", true, false, false],
              ["Project rooms", true, false, true],
              ["Co-founder matching", true, false, false],
              ["Mentor/mentee mode", true, false, false],
              ["Free tier available", true, true, true],
              ["Built for builders", true, false, true],
            ].map(([label, cb, li, gh], i) => (
              <div key={i} className="comparison-row" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", borderBottom: i < 7 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ padding: "14px 20px", fontSize: 13, color: T.text2 }}>{label}</div>
                {[cb, li, gh].map((has, j) => (
                  <div key={j} style={{ padding: "14px 20px", textAlign: "center", background: j === 0 ? T.surfaceA : "transparent" }}>
                    <span style={{ fontSize: 16, color: has ? (j === 0 ? "#a78bfa" : "#4ade80") : (dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)") }}>{has ? "✓" : "✕"}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(50px,10vw,80px)" }}>
          <div className="stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {[
              { v: "< 5 min", l: "To set up your profile", icon: "⚡" },
              { v: "94%", l: "Match accuracy rate", icon: "🎯" },
              { v: "48h", l: "Average time to first match", icon: "🤝" },
              { v: "3.2k+", l: "Active builders", icon: "👥" },
            ].map((s, i) => (
              <div key={i} className="fade-up" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "24px 22px", textAlign: "center", animationDelay: `${i * 0.07}s` }}>
                <div style={{ fontSize: 22, marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(22px,5vw,34px)", color: T.text, letterSpacing: "-1px", lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 12, color: T.text3, marginTop: 7, fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(50px,10vw,80px)" }}>
          <div style={{ background: dark ? "rgba(124,58,237,0.07)" : "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 26, padding: "clamp(36px,8vw,60px) clamp(24px,6vw,44px)", textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(26px,5vw,40px)", color: T.text, letterSpacing: "-1px", marginBottom: 14 }}>
              Ready to try every feature<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>for free?</span>
            </h2>
            <p style={{ fontSize: 14, color: T.text2, marginBottom: 28, maxWidth: 380, margin: "0 auto 28px" }}>No credit card. No commitment. Just you and your next co-builder.</p>
            <Link href="/signup"><button className="btn-primary" style={{ padding: "13px 30px", fontSize: 14 }}>Create your free profile →</button></Link>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: `1px solid ${T.border}`, padding: "clamp(32px,6vw,52px) clamp(16px,5vw,32px)", maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Logo fill={T.logoFill} />
              <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 16, color: T.text }}>CodeBuddy</span>
            </Link>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[["Features","/features"],["Pricing","/pricing"],["About","/about"],["Privacy","/privacypolicy"],["Terms","/terms"]].map(([l,h]) => (
                <Link key={l} href={h} style={{ fontSize: 12, color: T.text3 }}>{l}</Link>
              ))}
            </div>
            <span style={{ fontSize: 12, color: T.text3 }}>© 2026 CodeBuddy</span>
          </div>
        </footer>
      </div>
    </div>
  );
}