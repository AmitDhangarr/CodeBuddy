"use client"
import { useState } from "react";
import Link from "next/link";

const Logo = () => (
  <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill="#1a0a6a" />
    <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff" />
  </svg>
);

const hsl = (h, s = 70, l = 60) => `hsl(${h},${s}%,${l}%)`;
const hsla = (h, s = 70, l = 60, a = 0.12) => `hsla(${h},${s}%,${l}%,${a})`;

const JOBS = [
  { id: 1, title: "Senior Backend Engineer", dept: "Engineering", deptHue: 38, type: "Full-time", location: "Remote · India", desc: "Own the core matching pipeline. You'll work on the Rust services that power millions of match events per day.", skills: ["Rust", "PostgreSQL", "Redis", "Distributed Systems"] },
  { id: 2, title: "ML Engineer — Matching", dept: "Engineering", deptHue: 38, type: "Full-time", location: "Remote · Anywhere", desc: "Improve match quality using embeddings, graph signals, and behavioral feedback loops. Research-to-production.", skills: ["Python", "PyTorch", "MLflow", "Graph ML"] },
  { id: 3, title: "Product Designer", dept: "Design", deptHue: 340, type: "Full-time", location: "Remote · India", desc: "Shape the CodeBuddy experience end-to-end. You'll own flows from first match to shipped project.", skills: ["Figma", "Prototyping", "User Research", "Motion"] },
  { id: 4, title: "Growth Engineer", dept: "Growth", deptHue: 200, type: "Full-time", location: "Remote · India", desc: "Bridge product and distribution. Build experiments, referral loops, and activation funnels that actually work.", skills: ["React", "Analytics", "A/B Testing", "SQL"] },
  { id: 5, title: "Developer Advocate", dept: "Community", deptHue: 158, type: "Full-time", location: "Remote · Global", desc: "Be the face of CodeBuddy in developer communities. Write, speak, build demos, and grow our builder network.", skills: ["Public Speaking", "Writing", "Open Source", "Social"] },
  { id: 6, title: "Frontend Engineer", dept: "Engineering", deptHue: 38, type: "Full-time", location: "Remote · India", desc: "Build beautiful, fast UIs in Next.js. You care about performance, accessibility, and pixel-level craft.", skills: ["React", "Next.js", "TypeScript", "CSS"] },
];

const BENEFITS = [
  { icon: "🌏", title: "Fully remote", desc: "Work from anywhere. We have team members from Bangalore to Berlin. Time zones respected." },
  { icon: "📈", title: "Meaningful equity", desc: "We're early. The equity you get today has real upside. We share cap table details openly." },
  { icon: "🏖", title: "Unlimited PTO", desc: "Take the time you need. We track output, not hours. Minimum 15 days encouraged per year." },
  { icon: "🛠", title: "Best-in-class tools", desc: "Whatever you need to do your best work. MacBook Pro, $800 home office budget, any software." },
  { icon: "📚", title: "Learning budget", desc: "₹60,000/year for courses, books, conferences, or anything that makes you a better builder." },
  { icon: "💬", title: "Async by default", desc: "No unnecessary standups. We write things down, share context generously, and respect deep work." },
];

const DEPTS = ["All", "Engineering", "Design", "Growth", "Community"];

export default function Careers() {
  const [dark, setDark] = useState(true);
  const [activeDept, setActiveDept] = useState("All");
  const [openJob, setOpenJob] = useState(null);

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
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .fade-up{animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both}
    .btn-primary{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:11px 24px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 6px 24px rgba(124,58,237,0.28)}
    .btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(124,58,237,0.42)}
    .btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:9px 18px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s}
    .btn-ghost:hover{border-color:${T.border2};color:${T.text}}
    .btn-icon{background:transparent;border:1px solid ${T.border};color:${T.text3};padding:8px;border-radius:10px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center}
    .btn-icon:hover{border-color:${T.border2};color:${T.text}}
    .landing-nav{background:${T.navBg};backdrop-filter:blur(28px);border-bottom:1px solid ${T.border}}
    .job-card{background:${T.card};border:1px solid ${T.border};border-radius:18px;padding:22px 24px;transition:all 0.25s;cursor:pointer}
    .job-card:hover{background:${T.cardHover};border-color:rgba(124,58,237,0.28);transform:translateY(-2px);box-shadow:${T.shadow}}
    .job-card.open{border-color:rgba(124,58,237,0.35);background:${dark ? "rgba(124,58,237,0.05)" : "rgba(124,58,237,0.03)"}}
    .dept-pill{padding:5px 13px;border-radius:99px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid ${T.border};background:transparent;color:${T.text3};transition:all 0.15s;font-family:inherit}
    .dept-pill:hover{border-color:rgba(124,58,237,0.35);color:${T.text};background:rgba(124,58,237,0.08)}
    .dept-pill.active{background:rgba(124,58,237,0.15);border-color:rgba(124,58,237,0.4);color:#a78bfa}
    .skill-chip{padding:4px 10px;border-radius:99px;font-size:10px;font-weight:600;background:${T.surfaceA};border:1px solid ${T.surfaceBorder};color:#a78bfa}
    .benefit-card{background:${T.card};border:1px solid ${T.border};border-radius:18px;padding:24px;transition:all 0.28s}
    .benefit-card:hover{background:${T.cardHover};border-color:${T.border2};transform:translateY(-2px);box-shadow:${T.shadow}}
    @media(max-width:768px){
      .benefits-grid{grid-template-columns:repeat(2,1fr)!important}
      .perks-list{grid-template-columns:1fr!important}
    }
    @media(max-width:480px){
      .nav-ghost{display:none}
      .benefits-grid{grid-template-columns:1fr!important}
    }
  `;

  const filtered = activeDept === "All" ? JOBS : JOBS.filter(j => j.dept === activeDept);

  const DeptBadge = ({ dept, hue }) => (
    <span style={{ padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: hsla(hue, 70, 60, dark ? 0.12 : 0.09), border: `1px solid ${hsla(hue, 70, 60, 0.28)}`, color: hsl(hue) }}>
      {dept}
    </span>
  );

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
          <button className="btn-icon" onClick={() => setDark(p => !p)} style={{ width: 36, height: 36 }}>
            {dark ? "☀" : "🌙"}
          </button>
          <Link href="/signin"><button className="btn-ghost nav-ghost" style={{ padding: "7px 16px", fontSize: 13 }}>Sign in</button></Link>
          <Link href="/signup"><button className="btn-primary" style={{ padding: "8px 18px" }}>Get started →</button></Link>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── HERO ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "clamp(60px,12vw,110px) clamp(16px,5vw,32px) clamp(40px,8vw,72px)", textAlign: "center" }}>
          <div className="fade-up">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 99, padding: "4px 13px", marginBottom: 22 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 7px #22c55e" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.8px", textTransform: "uppercase" }}>6 open roles · Actively hiring</span>
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(36px,9vw,64px)", fontWeight: 400, lineHeight: 1.06, letterSpacing: "-2px", color: T.text, marginBottom: 20 }}>
              Build the future of<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>developer collaboration.</span>
            </h1>
            <p style={{ fontSize: "clamp(13px,3vw,16px)", color: T.text2, lineHeight: 1.72, maxWidth: 520, margin: "0 auto 36px" }}>
              We're a small team with a big mission: make it effortless for developers to find each other and build together. If that excites you, we want to hear from you.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-primary" style={{ padding: "12px 26px", fontSize: 14 }} onClick={() => document.getElementById("jobs").scrollIntoView({ behavior: "smooth" })}>
                See open roles →
              </button>
              <Link href="/about"><button className="btn-ghost">About the team</button></Link>
            </div>
          </div>
        </section>

        {/* ── CULTURE BLURB ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(50px,10vw,80px)" }}>
          <div style={{ background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 22, padding: "clamp(28px,5vw,48px)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 14 }}>How we work</div>
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(20px,4vw,30px)", fontWeight: 400, color: T.text, letterSpacing: "-0.5px", lineHeight: 1.18, marginBottom: 14 }}>
                Small team.<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>Outsized impact.</span>
              </h2>
              <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.72 }}>
                We're 8 people building a product used by 3,200+ developers. Every person owns a real surface area. There's no committee approval for good ideas — you ship them.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["You own problems, not tickets", "Ship fast, iterate in public", "Write first, meet rarely", "Hire for craft and curiosity", "Everyone talks to users"].map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#a78bfa", flexShrink: 0 }}>✦</div>
                  <span style={{ fontSize: 13, color: T.text2 }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BENEFITS ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(50px,10vw,80px)" }}>
          <SectionHead eyebrow="Benefits" title={<>What you get at<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>CodeBuddy</span></>} sub="We believe great work requires great conditions. Here's what we offer every team member." />
          <div className="benefits-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {BENEFITS.map((b, i) => (
              <div key={i} className="benefit-card fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{b.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 8 }}>{b.title}</h3>
                <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.68 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── OPEN ROLES ── */}
        <section id="jobs" style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(50px,10vw,80px)" }}>
          <SectionHead eyebrow="Open Roles" title={<>Find your<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>place on the team</span></>} sub="All roles are fully remote. We welcome applicants from anywhere in the world." />

          {/* Dept filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {DEPTS.map(d => (
              <button key={d} className={`dept-pill${activeDept === d ? " active" : ""}`} onClick={() => setActiveDept(d)}>{d}</button>
            ))}
          </div>

          {/* Jobs list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((job, i) => (
              <div key={job.id} className={`job-card fade-up${openJob === job.id ? " open" : ""}`} style={{ animationDelay: `${i * 0.06}s` }} onClick={() => setOpenJob(openJob === job.id ? null : job.id)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <DeptBadge dept={job.dept} hue={job.deptHue} />
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{job.title}</h3>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, color: T.text3 }}>{job.location}</span>
                    <span style={{ fontSize: 12, color: T.text3, background: T.card, border: `1px solid ${T.border}`, borderRadius: 99, padding: "3px 9px" }}>{job.type}</span>
                    <span style={{ color: T.text3, fontSize: 18, transition: "transform 0.25s", transform: openJob === job.id ? "rotate(45deg)" : "none", lineHeight: 1 }}>+</span>
                  </div>
                </div>

                {openJob === job.id && (
                  <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${T.border}`, animation: "fadeUp 0.25s ease both" }}>
                    <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.72, marginBottom: 16 }}>{job.desc}</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                      {job.skills.map(s => <span key={s} className="skill-chip">{s}</span>)}
                    </div>
                    <button className="btn-primary" style={{ padding: "10px 22px", fontSize: 13 }}>Apply for this role →</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: T.text3, fontSize: 14 }}>
              No open roles in {activeDept} right now — but we're always growing. Send us a note.
            </div>
          )}
        </section>

        {/* ── GENERAL APPLICATION ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(60px,12vw,100px)" }}>
          <div style={{ background: dark ? "rgba(124,58,237,0.07)" : "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 26, padding: "clamp(36px,7vw,56px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 300, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,50%,0.08)" : "hsla(259,70%,60%,0.06)"} 0%,transparent 65%)`, pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>👋</div>
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(22px,5vw,36px)", color: T.text, letterSpacing: "-0.8px", lineHeight: 1.12, marginBottom: 12 }}>
                Don't see your role?<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>Reach out anyway.</span>
              </h2>
              <p style={{ fontSize: 13, color: T.text2, marginBottom: 28, maxWidth: 400, margin: "0 auto 28px", lineHeight: 1.68 }}>
                We occasionally hire for roles we haven't posted yet. If you're exceptional and care deeply about developer tools, send us a note.
              </p>
              <a href="mailto:careers@codebuddy.dev">
                <button className="btn-primary" style={{ padding: "13px 28px", fontSize: 14 }}>Say hello →</button>
              </a>
              <p style={{ marginTop: 16, fontSize: 11, color: T.text3 }}>careers@codebuddy.dev · We reply to everyone</p>
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
              {["About", "Blog", "Press", "Privacy", "Terms"].map(l => (
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