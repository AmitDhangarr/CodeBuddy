"use client"
import Link from "next/link";
import { useState } from "react";
import { useThemeStore } from "../../../../store/themeprovider";
export default function SecurityPage() {
 const { dark, toggleDark } = useThemeStore();
  const [reportExpanded, setReportExpanded] = useState(false);
  const [formState, setFormState] = useState({ type: "", description: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  const T = dark ? {
    bg: "#07070f", bg2: "#0d0d1a",
    border: "rgba(255,255,255,0.06)", border2: "rgba(255,255,255,0.11)",
    text: "#e4e4f0", text2: "#8888aa", text3: "#44445a",
    card: "rgba(255,255,255,0.025)",
    shadow: "0 24px 64px rgba(0,0,0,0.55)",
    navBg: "rgba(7,7,15,0.92)",
    surfaceA: "rgba(124,58,237,0.06)", surfaceBorder: "rgba(124,58,237,0.15)",
    aiBg: "rgba(60,40,140,0.12)", aiBorder: "rgba(120,80,255,0.18)",
    greenBg: "rgba(34,197,94,0.08)", greenBorder: "rgba(34,197,94,0.2)", greenText: "#4ade80",
    input: "rgba(255,255,255,0.04)", inputBorder: "rgba(255,255,255,0.08)",
  } : {
    bg: "#f4f4f8", bg2: "#ffffff",
    border: "rgba(0,0,0,0.07)", border2: "rgba(0,0,0,0.13)",
    text: "#18182c", text2: "#555570", text3: "#9090b0",
    card: "#ffffff",
    shadow: "0 20px 60px rgba(0,0,0,0.1)",
    navBg: "rgba(244,244,248,0.95)",
    surfaceA: "rgba(124,58,237,0.05)", surfaceBorder: "rgba(124,58,237,0.15)",
    aiBg: "rgba(124,58,237,0.06)", aiBorder: "rgba(124,58,237,0.18)",
    greenBg: "rgba(34,197,94,0.09)", greenBorder: "rgba(34,197,94,0.28)", greenText: "#16a34a",
    input: "#ffffff", inputBorder: "rgba(0,0,0,0.1)",
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
    .section-block{padding:32px 0;border-bottom:1px solid ${T.border}}
    .section-block:last-child{border-bottom:none}
    .nav-link{font-size:14px;color:${T.text3};cursor:pointer;padding:8px 12px;border-radius:10px;transition:all 0.2s;text-decoration:none;display:block;border-left:2px solid transparent}
    .nav-link:hover{color:${T.text};background:${T.surfaceA};border-left-color:rgba(124,58,237,0.3)}
    .sec-input{width:100%;background:${T.input};border:1px solid ${T.inputBorder};border-radius:10px;padding:11px 14px;color:${T.text};font-family:'Instrument Sans',sans-serif;font-size:13px;outline:none;transition:border-color 0.2s;resize:vertical}
    .sec-input:focus{border-color:rgba(124,58,237,0.5)}
    .sec-input::placeholder{color:${T.text3}}
    .sec-select{width:100%;background:${T.input};border:1px solid ${T.inputBorder};border-radius:10px;padding:11px 14px;color:${T.text};font-family:'Instrument Sans',sans-serif;font-size:13px;outline:none;appearance:none;cursor:pointer}
    .status-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;animation:pulse 2.5s ease-in-out infinite;flex-shrink:0}
    @media(max-width:768px){.layout{grid-template-columns:1fr!important}.sidebar{display:none!important}.pillar-grid{grid-template-columns:1fr!important}}
  `;

  const Logo = () => (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill="#1a0a6a"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff"/>
    </svg>
  );

  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  const pillars = [
    { icon: "🔐", title: "Encryption at Rest", desc: "All user data, profile information, and messages are encrypted at rest using AES-256. Database access is restricted and audited." },
    { icon: "🛡", title: "TLS in Transit", desc: "All communication between your browser and CodeBuddy servers is encrypted via TLS 1.3. No data is transmitted over unencrypted channels." },
    { icon: "🔑", title: "Password Security", desc: "Passwords are hashed using bcrypt with a high work factor. We never store plaintext passwords. Breached password detection runs at sign-up." },
    { icon: "🧱", title: "Infrastructure", desc: "Hosted on Supabase (Postgres) and Vercel with automatic patching, DDoS protection, and isolated compute environments." },
    { icon: "👁", title: "Access Controls", desc: "Role-based access control limits who on our team can access what. All internal access is logged and reviewed quarterly." },
    { icon: "🚨", title: "Incident Response", desc: "We maintain a written incident response plan. Material breaches are disclosed to affected users within 72 hours of discovery." },
  ];

  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{css}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "30%", right: "-8%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.09)" : "hsla(259,70%,60%,0.045)"} 0%,transparent 65%)` }} />
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

        <div className="fade-up" style={{ marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 99, padding: "4px 13px", marginBottom: 18 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.8px", textTransform: "uppercase" }}>Trust & Safety</span>
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(32px,7vw,52px)", fontWeight: 400, color: T.text, letterSpacing: "-1.5px", lineHeight: 1.08, marginBottom: 14 }}>
            Security at <span style={{ fontStyle: "italic", color: "#a78bfa" }}>CodeBuddy</span>
          </h1>
          <p style={{ fontSize: 14, color: T.text2 }}>Last updated: <strong style={{ color: T.text }}>June 1, 2026</strong></p>
        </div>

        {/* System status banner */}
        <div className="fade-up" style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 14, padding: "14px 20px", marginBottom: 40, display: "flex", alignItems: "center", gap: 12 }}>
          <div className="status-dot" />
          <span style={{ fontSize: 13, fontWeight: 600, color: T.greenText }}>All systems operational</span>
          <span style={{ fontSize: 12, color: T.text3, marginLeft: 4 }}>· Last checked May 28, 2026 at 12:00 UTC</span>
          <a href="https://status.codebuddy.dev" target="_blank" rel="noreferrer" style={{ marginLeft: "auto", fontSize: 12, color: "#a78bfa", textDecoration: "none" }}>View status page ↗</a>
        </div>

        <div className="layout" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 40 }}>

          <div className="sidebar" style={{ position: "sticky", top: 80, alignSelf: "start" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>On this page</div>
            {[["🏛", "Security Pillars"], ["🔍", "Vulnerability Disclosure"], ["📋", "Responsible Disclosure"], ["📬", "Report a Vulnerability"]].map(([icon, label]) => (
              <a key={label} href="#" className="nav-link">
                <span style={{ marginRight: 8 }}>{icon}</span>{label}
              </a>
            ))}
            <div style={{ marginTop: 24, padding: "14px 16px", background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", marginBottom: 6 }}>🔒 Secure contact</div>
              <p style={{ fontSize: 11, color: T.text3, lineHeight: 1.55 }}>security@codebuddy.dev</p>
            </div>
          </div>

          <div>
            {/* Pillars */}
            <div className="section-block fade-up">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 22 }}>🏛</span>
                <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(20px,4vw,26px)", fontWeight: 400, color: T.text, letterSpacing: "-0.5px" }}>Security Pillars</h2>
              </div>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.8, marginBottom: 20 }}>Security is built into every layer of CodeBuddy — not bolted on. Here's how we protect your data and your identity:</p>
              <div className="pillar-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                {pillars.map((p, i) => (
                  <div key={i} className="fade-up" style={{ animationDelay: `${i * 0.05}s`, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 18px", transition: "border-color 0.2s" }}>
                    <div style={{ fontSize: 22, marginBottom: 10 }}>{p.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 6 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.65 }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vulnerability Disclosure */}
            <div className="section-block fade-up" style={{ animationDelay: "0.1s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 22 }}>🔍</span>
                <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(20px,4vw,26px)", fontWeight: 400, color: T.text, letterSpacing: "-0.5px" }}>Vulnerability Disclosure</h2>
              </div>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.8, marginBottom: 16 }}>We believe the security community makes the internet safer for everyone. If you discover a vulnerability in CodeBuddy, we want to hear from you.</p>
              <div style={{ background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", marginBottom: 6, letterSpacing: "1px" }}>✦ OUR COMMITMENT</div>
                <p style={{ fontSize: 13, color: dark ? "#b0a8d8" : "#6b5b9e", lineHeight: 1.65 }}>We will acknowledge your report within 48 hours, keep you updated on our progress, and credit you publicly (if you wish) when the vulnerability is patched. We will not pursue legal action against researchers who act in good faith.</p>
              </div>
            </div>

            {/* Responsible Disclosure */}
            <div className="section-block fade-up" style={{ animationDelay: "0.14s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 22 }}>📋</span>
                <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(20px,4vw,26px)", fontWeight: 400, color: T.text, letterSpacing: "-0.5px" }}>Responsible Disclosure Guidelines</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "✓ In scope", items: ["Authentication & authorization issues", "Data exposure or PII leakage", "Remote code execution or injection", "Broken access controls between users", "XSS in authenticated flows"], color: T.greenText, bg: T.greenBg, border: T.greenBorder },
                  { label: "✗ Out of scope", items: ["Social engineering or phishing attacks", "Physical security issues", "Denial of service (DoS/DDoS)", "Automated scanning without prior approval", "Vulnerabilities in third-party services we don't control"], color: "#f87171", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
                ].map((section, si) => (
                  <div key={si} style={{ background: section.bg, border: `1px solid ${section.border}`, borderRadius: 14, padding: "16px 18px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: section.color, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>{section.label}</div>
                    {section.items.map((item, i) => (
                      <div key={i} style={{ fontSize: 13, color: T.text2, padding: "4px 0", display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: section.color, marginTop: 1 }}>→</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Report Form */}
            <div className="section-block fade-up" style={{ animationDelay: "0.18s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 22 }}>📬</span>
                <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(20px,4vw,26px)", fontWeight: 400, color: T.text, letterSpacing: "-0.5px" }}>Report a Vulnerability</h2>
              </div>
              {!submitted ? (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Vulnerability Type</label>
                    <select className="sec-select" value={formState.type} onChange={e => setFormState(p => ({ ...p, type: e.target.value }))} required>
                      <option value="" disabled>Select a type...</option>
                      <option>Authentication / Authorization</option>
                      <option>Data Exposure / PII Leak</option>
                      <option>Injection (SQL, XSS, etc.)</option>
                      <option>Broken Access Control</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Description & Steps to Reproduce</label>
                    <textarea className="sec-input" rows={5} placeholder="Describe the vulnerability and how to reproduce it. Include URLs, affected endpoints, or screenshots if possible." value={formState.description} onChange={e => setFormState(p => ({ ...p, description: e.target.value }))} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Your Email (optional, for follow-up)</label>
                    <input className="sec-input" type="email" placeholder="researcher@example.com" value={formState.email} onChange={e => setFormState(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button type="submit" className="btn-primary" style={{ padding: "11px 24px" }}>Submit report →</button>
                    <span style={{ fontSize: 11, color: T.text3 }}>Or email directly: security@codebuddy.dev</span>
                  </div>
                </form>
              ) : (
                <div style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 14, padding: "28px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.greenText, marginBottom: 8 }}>Report received</div>
                  <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.65 }}>Thank you for helping keep CodeBuddy safe. We'll acknowledge your report within 48 hours.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 64, paddingTop: 32, borderTop: `1px solid ${T.border}`, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: T.text3 }}>© 2026 CodeBuddy · Built by builders, for builders.</span>
          <div style={{ display: "flex", gap: 12 }}>
            {[["Privacy", "/privacypolicy"], ["Terms", "/terms"], ["Cookies", "/cookies"]].map(([l, h]) => (
              <Link key={l} href={h} style={{ fontSize: 12, color: T.text3, textDecoration: "none" }}>{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}