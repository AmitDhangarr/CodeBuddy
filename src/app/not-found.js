"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import { useThemeStore } from "../../store/themeprovider";
import {
  Sun, Moon, ArrowRight, Search, Home,
} from "lucide-react";

// Responsive icon sizing: scales fluidly between breakpoints instead of
// a fixed pixel size, so icons shrink gracefully on small screens.
const iconSize = (min, max, vw = 3.2) => ({
  width: `clamp(${min}px, ${vw}vw, ${max}px)`,
  height: `clamp(${min}px, ${vw}vw, ${max}px)`,
  flexShrink: 0,
});

const BtnLabel = ({ children, Icon = ArrowRight, min = 11, max = 14 }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
    {children}
    <Icon style={iconSize(min, max)} />
  </span>
);

function NotFoundPage() {
  const { dark, toggleDark } = useThemeStore();
  const [charIdx, setCharIdx] = useState(0);
  const code = "404";

  useEffect(() => {
    if (charIdx < code.length) {
      const id = setTimeout(() => setCharIdx(c => c + 1), 140);
      return () => clearTimeout(id);
    }
  }, [charIdx]);

  const T = dark ? {
    bg: "#0a0a0f", bg2: "#111116",
    border: "rgba(255,255,255,0.09)", border2: "rgba(255,255,255,0.16)",
    text: "#ededf2", text2: "#96969f", text3: "#57575f",
    card: "#111116", cardHover: "#141419",
    shadow: "0 1px 2px rgba(0,0,0,0.4)",
    navBg: "rgba(10,10,15,0.9)",
    aiBg: "rgba(139,92,246,0.06)", aiBorder: "rgba(139,92,246,0.2)",
    logoFill: "#1a0a3b",
    surfaceA: "rgba(139,92,246,0.06)", surfaceBorder: "rgba(139,92,246,0.18)",
  } : {
    bg: "#fafafa", bg2: "#ffffff",
    border: "rgba(0,0,0,0.09)", border2: "rgba(0,0,0,0.16)",
    text: "#111116", text2: "#5a5a66", text3: "#a0a0aa",
    card: "#ffffff", cardHover: "#f7f7f9",
    shadow: "0 1px 2px rgba(0,0,0,0.06)",
    navBg: "rgba(250,250,250,0.92)",
    aiBg: "rgba(124,58,237,0.05)", aiBorder: "rgba(124,58,237,0.18)",
    logoFill: "#7c3aed",
    surfaceA: "rgba(124,58,237,0.05)", surfaceBorder: "rgba(124,58,237,0.16)",
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.14)"};border-radius:99px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
    @keyframes drift{0%{transform:translate(0,0) rotate(0deg)}50%{transform:translate(14px,-10px) rotate(4deg)}100%{transform:translate(0,0) rotate(0deg)}}
    .fade-up{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both}
    .btn-primary{background:#7c3aed;border:1px solid #7c3aed;color:white;padding:11px 24px;border-radius:8px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:filter 0.15s ease;box-shadow:${T.shadow}}
    .btn-primary:hover{filter:brightness(1.1)}
    .btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:10px 22px;border-radius:8px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:border-color 0.15s ease,color 0.15s ease,background 0.15s ease}
    .btn-ghost:hover{border-color:${T.border2};color:${T.text};background:${dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"}}
    .btn-icon{background:transparent;border:1px solid ${T.border};color:${T.text3};padding:8px;border-radius:8px;cursor:pointer;transition:border-color 0.15s ease,color 0.15s ease;display:flex;align-items:center;justify-content:center}
    .btn-icon:hover{border-color:${T.border2};color:${T.text}}
    .landing-nav{background:${T.navBg};backdrop-filter:blur(20px);border-bottom:1px solid ${T.border}}
  `;

  const Logo = () => (
    <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill={T.logoFill} />
      <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff" />
    </svg>
  );

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{css}</style>

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-18%", left: "-8%", width: 650, height: 650, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.09)" : "hsla(259,70%,60%,0.04)"} 0%,transparent 65%)` }} />
        <div style={{ position: "absolute", bottom: "-12%", right: "-8%", width: 550, height: 550, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(280,60%,30%,0.06)" : "hsla(280,60%,60%,0.03)"} 0%,transparent 65%)` }} />
        {dark && <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.015 }} xmlns="http://www.w3.org/2000/svg"><defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#g)" /></svg>}
      </div>

      {/* Nav */}
      <nav className="landing-nav" style={{ position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(16px,5vw,32px)", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo />
            <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: "clamp(14px,4vw,17px)", color: T.text, letterSpacing: "-0.3px" }}>CodeBuddy</span>
          </div>
        </Link>
        <button className="btn-icon" onClick={() => toggleDark(p => !p)} style={{ width: 34, height: 34 }} title="Toggle theme">
          {dark ? <Sun style={iconSize(14, 16)} /> : <Moon style={iconSize(14, 16)} />}
        </button>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>
        <section style={{ maxWidth: 620, margin: "0 auto", padding: "clamp(60px,12vw,120px) clamp(16px,5vw,32px) clamp(40px,9vw,80px)", textAlign: "center" }}>

          <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: dark ? "rgba(139,92,246,0.1)" : "rgba(124,58,237,0.06)", border: "1px solid rgba(139,92,246,0.22)", borderRadius: 6, padding: "5px 12px", marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", animation: "pulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", letterSpacing: "0.4px", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace" }}>Route not found</span>
          </div>

          <div className="fade-up" style={{ animationDelay: "0.05s", position: "relative", marginBottom: 12 }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(72px,20vw,140px)", lineHeight: 1, letterSpacing: "-4px", color: T.text }}>
              {code.slice(0, charIdx)}
              <span style={{ animation: "blink 1s step-end infinite", color: "#a78bfa" }}>|</span>
            </div>
            <div style={{ position: "absolute", top: "8%", right: "8%", animation: "drift 5s ease-in-out infinite", color: "#a78bfa", opacity: 0.55 }}>
              <Search style={iconSize(22, 30)} />
            </div>
          </div>

          <h1 className="fade-up" style={{ animationDelay: "0.1s", fontFamily: "'Inter',sans-serif", fontSize: "clamp(20px,4.5vw,28px)", fontWeight: 700, letterSpacing: "-0.6px", color: T.text, marginBottom: 14 }}>
            This page didn't find its match
          </h1>
          <p className="fade-up" style={{ animationDelay: "0.15s", fontSize: "clamp(13px,3vw,15px)", color: T.text2, lineHeight: 1.68, marginBottom: 32, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
            The link you followed may be broken, or the page may have moved. Even our matching algorithm can't pair you with something that isn't there.
          </p>

          <div className="fade-up" style={{ animationDelay: "0.2s", display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <Link href="/"><button className="btn-primary"><BtnLabel Icon={Home} min={13} max={15}>Back to home</BtnLabel></button></Link>
          </div>

          <div className="fade-up" style={{ animationDelay: "0.25s", background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 8, padding: "12px 16px", display: "inline-block" }}>
            <span style={{ fontSize: 11, color: dark ? "#b0a8d8" : "#6b5b9e", fontFamily: "'JetBrains Mono',monospace" }}>
              error_code: <strong style={{ color: "#a78bfa" }}>404_PAGE_NOT_FOUND</strong>
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default NotFoundPage;