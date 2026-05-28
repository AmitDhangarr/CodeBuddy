"use client"
import Link from "next/link";
import { useState } from "react";

export default function PrivacyPage() {
  const [dark, setDark] = useState(true);
  const [activeSection, setActiveSection] = useState(0);

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

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)"};border-radius:99px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .fade-up{animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both}
    .btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:9px 18px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s}
    .btn-ghost:hover{border-color:${T.border2};color:${T.text}}
    .btn-icon{background:transparent;border:1px solid ${T.border};color:${T.text3};padding:8px;border-radius:10px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center}
    .btn-icon:hover{border-color:${T.border2};color:${T.text}}
    .btn-primary{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:11px 24px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 6px 24px rgba(124,58,237,0.28)}
    .btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(124,58,237,0.42)}
    .nav-link{font-size:14px;color:${T.text3};cursor:pointer;padding:8px 12px;border-radius:10px;transition:all 0.2s;text-decoration:none;display:block;border-left:2px solid transparent}
    .nav-link:hover{color:${T.text};background:${T.surfaceA};border-left-color:rgba(124,58,237,0.3)}
    .nav-link.active{color:#a78bfa;background:${T.surfaceA};border-left-color:#7c3aed}
    .section-block{padding:32px 0;border-bottom:1px solid ${T.border}}
    .section-block:last-child{border-bottom:none}
    @media(max-width:768px){.layout{grid-template-columns:1fr!important}.sidebar{display:none!important}}
  `;

  const Logo = () => (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill="#1a0a6a"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff"/>
    </svg>
  );

  const sections = [
    {
      id: "overview", icon: "🔍", title: "Overview",
      content: (
        <>
          <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.8, marginBottom: 16 }}>
            At CodeBuddy, your privacy is foundational — not an afterthought. This Privacy Policy explains what data we collect, how we use it, and the choices you have. We are committed to transparency and keeping your data safe.
          </p>
          <div style={{ background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", marginBottom: 6, letterSpacing: "1px" }}>✦ TL;DR</div>
            <p style={{ fontSize: 13, color: dark ? "#b0a8d8" : "#6b5b9e", lineHeight: 1.65 }}>We collect only what we need to match you with the right builders. We never sell your data. You can delete your account and all data at any time.</p>
          </div>
        </>
      )
    },
    {
      id: "data-collected", icon: "📦", title: "Data We Collect",
      content: (
        <>
          <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.8, marginBottom: 16 }}>We collect the following categories of information when you use CodeBuddy:</p>
          {[
            { label: "Account Information", detail: "Your name, email address, and password (hashed) when you create an account." },
            { label: "Profile Data", detail: "Skills you have and need, bio, availability, role, and any project links you choose to share." },
            { label: "Usage Data", detail: "Pages visited, features used, match interactions, and session timestamps — used solely to improve matching quality." },
            { label: "Communications", detail: "Messages sent within the platform between matched builders. We do not read your messages except to enforce our Terms of Service." },
            { label: "Device & Technical Data", detail: "IP address, browser type, and device identifiers for security and fraud prevention." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed", marginTop: 6, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.65 }}>{item.detail}</div>
              </div>
            </div>
          ))}
        </>
      )
    },
    {
      id: "how-we-use", icon: "⚙️", title: "How We Use Your Data",
      content: (
        <>
          <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.8, marginBottom: 16 }}>Your data powers the matching engine and nothing else. Specifically, we use your information to:</p>
          {["Generate skill-based compatibility matches between builders", "Personalise the AI match insight explanations you see", "Send account notifications and product updates (you can opt out anytime)", "Detect and prevent fraudulent or abusive activity", "Improve our matching algorithms using aggregated, anonymised signals", "Comply with legal obligations under applicable law"].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0" }}>
              <span style={{ color: "#4ade80", fontSize: 12, marginTop: 2 }}>✓</span>
              <span style={{ fontSize: 13, color: T.text2, lineHeight: 1.65 }}>{item}</span>
            </div>
          ))}
        </>
      )
    },
    {
      id: "sharing", icon: "🤝", title: "Data Sharing",
      content: (
        <>
          <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.8, marginBottom: 16 }}>
            <strong style={{ color: T.text }}>We do not sell your personal data.</strong> Full stop. We share data only in the following limited circumstances:
          </p>
          {[
            { icon: "🔧", label: "Service Providers", detail: "We use trusted third-party services (e.g. cloud hosting, email delivery, analytics) that are contractually bound to protect your data and may not use it for any other purpose." },
            { icon: "⚖️", label: "Legal Requirements", detail: "We may disclose information when required by law, court order, or to protect the safety of our users or the integrity of the platform." },
            { icon: "🔀", label: "Business Transfers", detail: "In the unlikely event of a merger or acquisition, your data may transfer. We will notify you before your data is subject to a different privacy policy." },
          ].map((item, i) => (
            <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 18px", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{item.label}</span>
              </div>
              <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.65 }}>{item.detail}</p>
            </div>
          ))}
        </>
      )
    },
    {
      id: "your-rights", icon: "🛡", title: "Your Rights",
      content: (
        <>
          <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.8, marginBottom: 16 }}>You have full control over your data. You may exercise any of the following rights at any time by contacting us at privacy@codebuddy.dev:</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
            {[
              { icon: "👁", right: "Access", desc: "Request a copy of all personal data we hold about you." },
              { icon: "✏️", right: "Correction", desc: "Update or correct any inaccurate information." },
              { icon: "🗑", right: "Deletion", desc: "Delete your account and all associated data permanently." },
              { icon: "📤", right: "Portability", desc: "Export your profile and match data in a machine-readable format." },
              { icon: "🚫", right: "Objection", desc: "Object to processing your data for specific purposes." },
              { icon: "⏸", right: "Restriction", desc: "Request we limit how we process your data." },
            ].map((item, i) => (
              <div key={i} style={{ background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>{item.right}</div>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </>
      )
    },
    {
      id: "retention", icon: "⏳", title: "Data Retention",
      content: (
        <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.8 }}>
          We retain your account data for as long as your account is active, or as necessary to provide you services. If you delete your account, we will erase your personal data within 30 days, except where we are legally required to retain it (e.g. billing records for up to 7 years). Anonymised, aggregated analytics data may be retained indefinitely as it cannot be linked back to you.
        </p>
      )
    },
    {
      id: "contact", icon: "📬", title: "Contact Us",
      content: (
        <>
          <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.8, marginBottom: 18 }}>Have questions about this policy or your data? Reach our privacy team:</p>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 20px" }}>
            {[["Email", "privacy@codebuddy.dev"], ["Response Time", "Within 72 hours"], ["Headquarters", "Bangalore, India"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
                <span style={{ color: T.text3, fontWeight: 600 }}>{k}</span>
                <span style={{ color: T.text }}>{v}</span>
              </div>
            ))}
          </div>
        </>
      )
    },
  ];

  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{css}</style>

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-18%", left: "-8%", width: 650, height: 650, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.09)" : "hsla(259,70%,60%,0.045)"} 0%,transparent 65%)` }} />
      </div>

      {/* Nav */}
      <nav style={{ background: T.navBg, backdropFilter: "blur(28px)", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(16px,5vw,32px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Logo />
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: T.text }}>CodeBuddy</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn-icon" onClick={() => setDark(p => !p)} style={{ width: 36, height: 36 }}>
            {dark ? "☀" : "🌙"}
          </button>
          <Link href="/signup"><button className="btn-primary" style={{ padding: "8px 18px" }}>Get started →</button></Link>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1060, margin: "0 auto", padding: "clamp(32px,6vw,64px) clamp(16px,5vw,32px)" }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 99, padding: "4px 13px", marginBottom: 18 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.8px", textTransform: "uppercase" }}>Legal</span>
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(32px,7vw,52px)", fontWeight: 400, color: T.text, letterSpacing: "-1.5px", lineHeight: 1.08, marginBottom: 14 }}>
            Privacy <span style={{ fontStyle: "italic", color: "#a78bfa" }}>Policy</span>
          </h1>
          <p style={{ fontSize: 14, color: T.text2 }}>Last updated: <strong style={{ color: T.text }}>June 1, 2026</strong> · Effective immediately</p>
        </div>

        {/* Layout */}
        <div className="layout" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 40 }}>

          {/* Sidebar */}
          <div className="sidebar" style={{ position: "sticky", top: 80, alignSelf: "start" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>On this page</div>
            {sections.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} className={`nav-link${activeSection === i ? " active" : ""}`} onClick={() => setActiveSection(i)}>
                <span style={{ marginRight: 8 }}>{s.icon}</span>{s.title}
              </a>
            ))}
            <div style={{ marginTop: 24, padding: "14px 16px", background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", marginBottom: 6 }}>Questions?</div>
              <p style={{ fontSize: 11, color: T.text3, lineHeight: 1.55 }}>Email us at privacy@codebuddy.dev</p>
            </div>
          </div>

          {/* Content */}
          <div>
            {sections.map((s, i) => (
              <div key={s.id} id={s.id} className="section-block fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(20px,4vw,26px)", fontWeight: 400, color: T.text, letterSpacing: "-0.5px" }}>{s.title}</h2>
                </div>
                {s.content}
              </div>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div style={{ marginTop: 64, paddingTop: 32, borderTop: `1px solid ${T.border}`, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: T.text3 }}>© 2026 CodeBuddy · Built by builders, for builders.</span>
          <div style={{ display: "flex", gap: 12 }}>
            {[["Terms", "/terms"], ["Cookies", "/cookies"], ["Security", "/security"]].map(([l, h]) => (
              <Link key={l} href={h} style={{ fontSize: 12, color: T.text3, textDecoration: "none" }}>{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}