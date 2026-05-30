"use client"
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "../../../../store/themeprovider";
function ChangelogPage() {
  const router = useRouter();
 const { dark, toggleDark } = useThemeStore();
  const [activeFilter, setActiveFilter] = useState("all");
  const [token, setToken] = useState(false);
  const [showSignoutModal, setShowSignoutModal] = useState(false);

  const getToken = async () => {
    const data = await fetch("/api/auth/me");
    const json = await data.json();
    setToken(json.token || false);
  };

  useEffect(() => { getToken(); }, []);

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/signout", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setShowSignoutModal(false);
        setToken(false);
        router.push("/");
      }
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

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
    @keyframes modalIn{from{opacity:0;transform:scale(0.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    .fade-up{animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both}
    .btn-primary{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:11px 24px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 6px 24px rgba(124,58,237,0.28)}
    .btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(124,58,237,0.42)}
    .btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:9px 18px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s}
    .btn-ghost:hover{border-color:${T.border2};color:${T.text}}
    .btn-danger{background:linear-gradient(135deg,#dc2626,#ef4444);border:none;color:white;padding:11px 24px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 6px 24px rgba(220,38,38,0.28)}
    .btn-danger:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(220,38,38,0.42)}
    .btn-icon{background:transparent;border:1px solid ${T.border};color:${T.text3};padding:8px;border-radius:10px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center}
    .btn-icon:hover{border-color:${T.border2};color:${T.text}}
    .landing-nav{background:${T.navBg};backdrop-filter:blur(28px);border-bottom:1px solid ${T.border}}
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease both;backdrop-filter:blur(4px)}
    .modal-box{animation:modalIn 0.28s cubic-bezier(0.16,1,0.3,1) both}
    .entry-card{background:${T.card};border:1px solid ${T.border};border-radius:16px;padding:24px;transition:all 0.25s;margin-bottom:14px}
    .entry-card:hover{background:${T.cardHover};border-color:${T.border2};box-shadow:${T.shadow}}
    .filter-pill{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:6px 16px;border-radius:99px;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s}
    .filter-pill:hover{border-color:${T.border2};color:${T.text}}
    .filter-pill.active{background:rgba(124,58,237,0.12);border-color:rgba(124,58,237,0.35);color:#a78bfa}
    .subscribe-bar{background:${T.surfaceA};border:1px solid ${T.surfaceBorder};border-radius:14px;padding:16px 20px;display:flex;align-items:center;gap:14px;margin-bottom:36px}
    .change-row{display:flex;align-items:flex-start;gap:10px;padding:6px 0}
    .change-dot{width:5px;height:5px;border-radius:50%;margin-top:8px;flex-shrink:0;background:rgba(124,58,237,0.4)}
    @media(max-width:768px){
      .nav-ghost{display:none}
      .entry-meta{flex-direction:column!important;gap:10px!important;align-items:flex-start!important}
    }
    @media(max-width:480px){
      .filter-row{gap:6px!important}
    }
  `;

  const TAGS = {
    new: { label: "New", bg: dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.3)", color: "#a78bfa" },
    improvement: { label: "Improvement", bg: dark ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.07)", border: "rgba(59,130,246,0.28)", color: "#60a5fa" },
    fix: { label: "Fix", bg: dark ? "rgba(34,197,94,0.08)" : "rgba(34,197,94,0.07)", border: "rgba(34,197,94,0.25)", color: "#4ade80" },
    launch: { label: "Launch", bg: dark ? "rgba(251,146,60,0.1)" : "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.28)", color: "#fb923c" },
  };

  const ENTRIES = [
    {
      version: "v1.4.0",
      date: "May 22, 2026",
      title: "AI match insights & skill gap scoring",
      tags: ["new", "improvement"],
      changes: [
        { strong: "Match insight cards", text: " — every match now shows a plain-English AI explanation of why two builders complement each other." },
        { strong: "Skill gap score", text: " — bidirectional skill overlap is now surfaced as a percentage on all profile cards." },
        { strong: "Improved match accuracy", text: " — tuned embedding model reduces false positives by 18% in internal testing." },
        { strong: "Hero match card", text: " redesigned with animated match bar and two-way skill comparison." },
      ],
    },
    {
      version: "v1.3.2",
      date: "May 7, 2026",
      title: "Real-time chat & sign-out flow",
      tags: ["new", "fix"],
      changes: [
        { strong: "In-app messaging", text: " — chat with your matches directly in CodeBuddy, with match context always visible above the thread." },
        { strong: "Sign-out confirmation modal", text: " — added a clear confirmation step before ending a session to prevent accidental logouts." },
        { text: "Fixed: token refresh race condition causing dashboard flicker on slow connections." },
        { text: "Fixed: auth state not updating immediately after sign-in on some Safari versions." },
      ],
    },
    {
      version: "v1.3.0",
      date: "Apr 18, 2026",
      title: "Profile builder & dark mode polish",
      tags: ["improvement", "fix"],
      changes: [
        { strong: "New profile step flow", text: " — multi-step onboarding now saves progress so you can complete your profile across sessions." },
        { text: "Dark/light mode toggle is now sticky across sessions (persisted in user preferences)." },
        { text: "Fixed: skill pills overflowing on narrow mobile screens in Safari." },
        { text: "Fixed: \"Connect →\" button navigating to wrong route for unauthenticated users." },
      ],
    },
    {
      version: "v1.2.0",
      date: "Mar 31, 2026",
      title: "Live builder ticker & community profiles",
      tags: ["new"],
      changes: [
        { strong: "Activity ticker", text: " — top-of-page live feed showing recent matches, projects shipped, and new mentors in real time." },
        { strong: "Community wall", text: " — browse active builders on the landing page before signing up." },
        { text: "Online presence indicator on builder cards (green dot with glow)." },
        { text: "Skills cloud section with 25+ tags, all filterable by match intent." },
      ],
    },
    {
      version: "v1.0.0",
      date: "Mar 1, 2026",
      title: "CodeBuddy public launch 🚀",
      tags: ["launch"],
      changes: [
        { text: "AI-powered skill matching for developers — free tier available at launch." },
        { text: "Sign up, profile creation, and match browsing all live." },
        { text: "Supabase auth with secure cookie-based token flow." },
        { text: "Landing page with hero, stats, features, testimonials, pricing, and FAQ." },
      ],
    },
  ];

  const filtered = activeFilter === "all"
    ? ENTRIES
    : ENTRIES.filter(e => e.tags.includes(activeFilter));

  const Logo = () => (
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill="#1a0a6a" />
      <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff" />
    </svg>
  );

  const Tag = ({ type }) => {
    const t = TAGS[type];
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: t.bg, border: `1px solid ${t.border}`, color: t.color, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: "0.4px" }}>
        {t.label}
      </span>
    );
  };

  const SignoutModal = () => (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowSignoutModal(false); }}>
      <div className="modal-box" style={{ background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 22, padding: "36px 32px", width: "min(380px, calc(100vw - 32px))", boxShadow: T.shadow, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24 }}>🚪</div>
        <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, fontWeight: 400, color: T.text, letterSpacing: "-0.5px", marginBottom: 10 }}>Sign out of CodeBuddy?</h3>
        <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.65, marginBottom: 28, maxWidth: 280, margin: "0 auto 28px" }}>You'll need to sign back in to access your matches and messages.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-ghost" style={{ flex: 1, padding: "11px 0", fontSize: 13 }} onClick={() => setShowSignoutModal(false)}>Cancel</button>
          <button className="btn-danger" style={{ flex: 1, padding: "11px 0", fontSize: 13 }} onClick={handleSignout}>Yes, sign out</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{css}</style>

      {showSignoutModal && <SignoutModal />}

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-18%", left: "-8%", width: 650, height: 650, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.09)" : "hsla(259,70%,60%,0.045)"} 0%,transparent 65%)` }} />
        <div style={{ position: "absolute", bottom: "-12%", right: "-8%", width: 450, height: 450, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(300,60%,30%,0.06)" : "hsla(300,60%,60%,0.03)"} 0%,transparent 65%)` }} />
      </div>

      {/* Nav */}
      <nav className="landing-nav" style={{ position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(16px,5vw,32px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/"><Logo /></Link>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(14px,4vw,18px)", color: T.text, letterSpacing: "-0.3px" }}>CodeBuddy</span>
          </Link>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(40px,8vw,72px) clamp(16px,5vw,32px) clamp(50px,10vw,90px)" }}>

          {/* Header */}
          <div className="fade-up" style={{ marginBottom: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 99, padding: "4px 13px", marginBottom: 18 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.8px", textTransform: "uppercase" }}>Product updates</span>
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(32px,7vw,48px)", fontWeight: 400, color: T.text, letterSpacing: "-1.5px", lineHeight: 1.08, marginBottom: 14 }}>
              Changelog
            </h1>
            <p style={{ fontSize: "clamp(13px,3vw,15px)", color: T.text2, lineHeight: 1.68, maxWidth: 480 }}>
              Every update, fix, and improvement shipped to CodeBuddy. We ship every two weeks.
            </p>
          </div>

          {/* Subscribe bar */}
          <div className="subscribe-bar fade-up" style={{ animationDelay: "0.08s" }}>
            <div style={{ fontSize: 20 }}>📬</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>Stay in the loop</div>
              <div style={{ fontSize: 12, color: T.text2 }}>Get notified when we ship something new.</div>
            </div>
           
              <button className="btn-ghost" style={{ fontSize: 12, padding: "7px 16px", whiteSpace: "nowrap" }}>Subscribe →</button>
           
          </div>

          {/* Filters */}
          <div className="filter-row fade-up" style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap", animationDelay: "0.12s" }}>
            {["all", "new", "improvement", "fix"].map(f => (
              <button
                key={f}
                className={`filter-pill${activeFilter === f ? " active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
            {Object.entries(TAGS).map(([key, val]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.text3 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: val.color }} />
                {val.label}
              </div>
            ))}
          </div>

          {/* Entries */}
          <div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: T.text3, fontSize: 14 }}>
                No entries match this filter.
              </div>
            ) : (
              filtered.map((entry, i) => (
                <div
                  key={entry.version}
                  className="entry-card fade-up"
                  style={{ animationDelay: `${0.15 + i * 0.07}s` }}
                >
                  {/* Meta row */}
                  <div className="entry-meta" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "'Instrument Sans',monospace", fontSize: 12, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.5px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", padding: "3px 10px", borderRadius: 7 }}>
                        {entry.version}
                      </span>
                      <span style={{ fontSize: 12, color: T.text3 }}>{entry.date}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {entry.tags.map(tag => <Tag key={tag} type={tag} />)}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: T.border, marginBottom: 14 }} />

                  {/* Title */}
                  <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(16px,4vw,20px)", fontWeight: 400, color: T.text, letterSpacing: "-0.4px", marginBottom: 14, lineHeight: 1.3 }}>
                    {entry.title}
                  </h2>

                  {/* Changes */}
                  <div>
                    {entry.changes.map((c, j) => (
                      <div key={j} className="change-row">
                        <div className="change-dot" />
                        <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.62 }}>
                          {c.strong && <strong style={{ color: T.text, fontWeight: 600 }}>{c.strong}</strong>}
                          {c.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom CTA */}
          <div style={{ marginTop: 40, padding: "28px 24px", background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 18, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: T.text2, marginBottom: 14 }}>See what's coming next on the product roadmap.</p>
            <Link href="/roadmap">
              <button className="btn-primary" style={{ padding: "10px 22px", fontSize: 13 }}>View Roadmap →</button>
            </Link>
          </div>

        </div>

        {/* Footer */}
        <footer style={{ borderTop: `1px solid ${T.border}`, padding: "24px clamp(16px,5vw,32px)", maxWidth: 760, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 12, color: T.text3 }}>© 2026 CodeBuddy. Built by builders, for builders.</span>
          <div style={{ display: "flex", gap: 20 }}>
            {[["Home", "/"], ["Roadmap", "/roadmap"], ["Dashboard", "/dashboard"]].map(([label, href]) => (
              <Link key={href} href={href} style={{ fontSize: 12, color: T.text3, textDecoration: "none" }}
                onMouseEnter={e => e.target.style.color = T.text}
                onMouseLeave={e => e.target.style.color = T.text3}
              >{label}</Link>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ChangelogPage;