'use client'
import Link from "next/link";
import { useState } from "react";

export const useTheme = (defaultDark = true) => {
  const [dark, setDark] = useState(defaultDark);
  const T = dark ? {
    bg: "#07070f", bg2: "#0d0d1a",
    border: "rgba(255,255,255,0.06)", border2: "rgba(255,255,255,0.11)",
    text: "#e4e4f0", text2: "#8888aa", text3: "#44445a",
    card: "rgba(255,255,255,0.025)", cardHover: "rgba(255,255,255,0.04)",
    shadow: "0 24px 64px rgba(0,0,0,0.55)",
    navBg: "rgba(7,7,15,0.92)",
    logoFill: "#00DC33",
    surfaceA: "rgba(124,58,237,0.06)", surfaceBorder: "rgba(124,58,237,0.15)",
    aiBg: "rgba(60,40,140,0.12)", aiBorder: "rgba(120,80,255,0.18)",
    skillHaveBg: "rgba(34,197,94,0.08)", skillHaveBorder: "rgba(34,197,94,0.2)", skillHaveText: "#4ade80",
    skillNeedBg: "rgba(99,102,241,0.08)", skillNeedBorder: "rgba(99,102,241,0.22)", skillNeedText: "#818cf8",
  } : {
    bg: "#f4f4f8", bg2: "#ffffff",
    border: "rgba(0,0,0,0.07)", border2: "rgba(0,0,0,0.13)",
    text: "#18182c", text2: "#555570", text3: "#9090b0",
    card: "#ffffff", cardHover: "#f7f7fc",
    shadow: "0 20px 60px rgba(0,0,0,0.1)",
    navBg: "rgba(244,244,248,0.95)",
    logoFill: "#7c3aed",
    surfaceA: "rgba(124,58,237,0.05)", surfaceBorder: "rgba(124,58,237,0.15)",
    aiBg: "rgba(124,58,237,0.06)", aiBorder: "rgba(124,58,237,0.18)",
    skillHaveBg: "rgba(34,197,94,0.09)", skillHaveBorder: "rgba(34,197,94,0.28)", skillHaveText: "#16a34a",
    skillNeedBg: "rgba(99,102,241,0.09)", skillNeedBorder: "rgba(99,102,241,0.28)", skillNeedText: "#4338ca",
  };
  return { dark, setDark, T };
};

export const Logo = ({ fill = "#00DC33" }) => (
  <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill={fill} />
    <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff" />
  </svg>
);

export const PageShell = ({ T, dark, setDark, children, activePage = "" }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
  ];
  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <nav style={{ background: T.navBg, backdropFilter: "blur(28px)", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(16px,5vw,32px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Logo fill={T.logoFill} />
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: T.text, letterSpacing: "-0.3px" }}>CodeBuddy</span>
        </Link>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} style={{ fontSize: 13, fontWeight: 600, color: activePage === l.label ? "#a78bfa" : T.text2, textDecoration: "none", padding: "6px 12px", borderRadius: 8, background: activePage === l.label ? T.surfaceA : "transparent", transition: "all 0.2s", display: "none" }} className="nav-desktop">{l.label}</Link>
          ))}
          <button onClick={() => setDark(p => !p)} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.text3, padding: 8, borderRadius: 10, cursor: "pointer", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>{dark ? "☀️" : "🌙"}</button>
          <Link href="/signin"><button style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.text2, padding: "7px 16px", borderRadius: 11, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Sign in</button></Link>
          <Link href="/signup"><button style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", border: "none", color: "white", padding: "8px 18px", borderRadius: 11, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Get started →</button></Link>
        </div>
      </nav>
      {children}
      <Footer T={T} />
    </div>
  );
};

export const Footer = ({ T }) => (
  <footer style={{ borderTop: `1px solid ${T.border}`, padding: "clamp(32px,6vw,52px) clamp(16px,5vw,32px)", maxWidth: 1060, margin: "0 auto" }}>
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 44 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Logo fill={T.logoFill} />
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: T.text }}>CodeBuddy</span>
        </div>
        <p style={{ fontSize: 13, color: T.text3, lineHeight: 1.65, maxWidth: 240 }}>Matching developers by skills so they can stop searching and start building.</p>
      </div>
      {[
        { h: "Product", links: [["Features","/features"],["Pricing","/pricing"],["Changelog","/changelog"],["Roadmap","/roadmap"]] },
        { h: "Company", links: [["About","/about"],["Blog","/blog"],["Careers","/careers"],["Press","/press"]] },
        { h: "Legal", links: [["Privacy","/privacy"],["Terms","/terms"],["Cookies","/cookies"],["Security","/security"]] },
      ].map(col => (
        <div key={col.h}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 14 }}>{col.h}</div>
          {col.links.map(([l, href]) => (
            <div key={l} style={{ marginBottom: 10 }}>
              <Link href={href} style={{ fontSize: 13, color: T.text3, textDecoration: "none" }}>{l}</Link>
            </div>
          ))}
        </div>
      ))}
    </div>
    <div style={{ height: 1, background: T.border, marginBottom: 20 }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
      <span style={{ fontSize: 12, color: T.text3 }}>© 2025 CodeBuddy. Built by builders, for builders.</span>
      <span style={{ fontSize: 12, color: T.text3 }}>Made with ♥ in India</span>
    </div>
  </footer>
);

export const SectionHead = ({ T, eyebrow, title, sub }) => (
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

export const BASE_CSS = (dark, T) => `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)"};border-radius:99px}
  a{color:inherit;text-decoration:none}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  .fade-up{animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both}
  .float{animation:float 5s ease-in-out infinite}
  .btn-primary{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:11px 24px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 6px 24px rgba(124,58,237,0.28)}
  .btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(124,58,237,0.42)}
  .btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:9px 18px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s}
  .btn-ghost:hover{border-color:${T.border2};color:${T.text}}
  .card{background:${T.card};border:1px solid ${T.border};border-radius:18px;transition:all 0.28s}
  .card:hover{background:${T.cardHover};border-color:${T.border2};transform:translateY(-2px);box-shadow:${T.shadow}}
  .card-flat{background:${T.card};border:1px solid ${T.border};border-radius:18px}
  .nav-desktop{display:none}
  @media(min-width:768px){.nav-desktop{display:block!important}}
  @media(max-width:768px){
    .footer-cols{grid-template-columns:1fr 1fr!important}
    .two-col{grid-template-columns:1fr!important}
    .three-col{grid-template-columns:1fr!important}
    .four-col{grid-template-columns:repeat(2,1fr)!important}
  }
  @media(max-width:480px){
    .four-col{grid-template-columns:1fr!important}
  }
`;