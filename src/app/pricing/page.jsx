'use client'
import { useState,useEffect } from "react";
import Link from "next/link";

const T = {
  bg: "#07070f", bg2: "#0d0d1a",
  border: "rgba(255,255,255,0.06)", border2: "rgba(255,255,255,0.11)",
  text: "#e4e4f0", text2: "#8888aa", text3: "#44445a",
  card: "rgba(255,255,255,0.025)", cardHover: "rgba(255,255,255,0.042)",
  input: "rgba(255,255,255,0.04)", inputBorder: "rgba(255,255,255,0.08)",
  shadow: "0 24px 64px rgba(0,0,0,0.55)",
  navBg: "rgba(7,7,15,0.93)",
  surfaceA: "rgba(124,58,237,0.06)", surfaceBorder: "rgba(124,58,237,0.15)",
};

const PLANS = [
  {
    id: "free",
    name: "Free",
    tagline: "Start matching, zero cost",
    monthly: 0,
    yearly: 0,
    color: "#4ade80",
    colorBg: "rgba(74,222,128,0.08)",
    colorBorder: "rgba(74,222,128,0.2)",
    cta: "Get started free",
    ctaStyle: "ghost",
    features: {
      "Connections": "Up to 3 active",
      "AI Match Insights": "3 per day",
      "Real-time Messaging": true,
      "Match Score": true,
      "Profile Badge": "Basic",
      "Skill Filters": "Standard",
      "Project Rooms": false,
      "Priority Matching": false,
      "Analytics Dashboard": false,
      "Custom Profile URL": false,
      "API Access": false,
      "Team Members": false,
      "Dedicated Support": false,
      "SLA Guarantee": false,
    }
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For builders who ship seriously",
    monthly: 499,
    yearly: 399,
    color: "#a78bfa",
    colorBg: "rgba(167,139,250,0.08)",
    colorBorder: "rgba(167,139,250,0.25)",
    cta: "Start Pro — 14 days free",
    ctaStyle: "primary",
    badge: "Most Popular",
    features: {
      "Connections": "Unlimited",
      "AI Match Insights": "Unlimited",
      "Real-time Messaging": true,
      "Match Score": true,
      "Profile Badge": "Pro verified",
      "Skill Filters": "Advanced + saved",
      "Project Rooms": true,
      "Priority Matching": true,
      "Analytics Dashboard": true,
      "Custom Profile URL": true,
      "API Access": false,
      "Team Members": false,
      "Dedicated Support": "Email",
      "SLA Guarantee": false,
    }
  },
  {
    id: "team",
    name: "Team",
    tagline: "Build your founding team",
    monthly: 1999,
    yearly: 1599,
    color: "#38bdf8",
    colorBg: "rgba(56,189,248,0.08)",
    colorBorder: "rgba(56,189,248,0.2)",
    cta: "Start Team trial",
    ctaStyle: "ghost",
    features: {
      "Connections": "Unlimited",
      "AI Match Insights": "Unlimited",
      "Real-time Messaging": true,
      "Match Score": true,
      "Profile Badge": "Team verified",
      "Skill Filters": "Advanced + saved",
      "Project Rooms": "Unlimited",
      "Priority Matching": true,
      "Analytics Dashboard": "Advanced",
      "Custom Profile URL": true,
      "API Access": "Beta",
      "Team Members": "Up to 5",
      "Dedicated Support": "Priority email",
      "SLA Guarantee": false,
    }
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For organizations at scale",
    monthly: null,
    yearly: null,
    color: "#f59e0b",
    colorBg: "rgba(245,158,11,0.08)",
    colorBorder: "rgba(245,158,11,0.2)",
    cta: "Talk to us",
    ctaStyle: "ghost",
    features: {
      "Connections": "Unlimited",
      "AI Match Insights": "Unlimited",
      "Real-time Messaging": true,
      "Match Score": true,
      "Profile Badge": "Enterprise",
      "Skill Filters": "Custom",
      "Project Rooms": "Unlimited",
      "Priority Matching": true,
      "Analytics Dashboard": "Custom",
      "Custom Profile URL": true,
      "API Access": "Full",
      "Team Members": "Unlimited",
      "Dedicated Support": "24/7 dedicated",
      "SLA Guarantee": "99.9%",
    }
  }
];

const FEATURE_ROWS = Object.keys(PLANS[0].features);

const FAQS = [
  { q: "Can I switch plans anytime?", a: "Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately, and downgrades apply at the end of your billing cycle. We'll prorate any unused time." },
  { q: "What happens when my free trial ends?", a: "Your Pro trial runs for 14 days with full access. After that, you'll be automatically moved to the Free plan unless you add payment details. No surprise charges." },
  { q: "Is there a refund policy?", a: "We offer a 30-day full refund on Pro and Team plans, no questions asked. Just email us at support@codebuddy.dev." },
  { q: "How does the AI matching work on each plan?", a: "All plans use the same underlying AI matching engine. The difference is frequency — Free users get 3 AI insights per day, while Pro and Team users get unlimited insights and priority queue placement." },
  { q: "Can I use CodeBuddy for my startup's hiring?", a: "CodeBuddy is designed for collaboration, not traditional hiring. For building a co-founder or early team, the Team plan is ideal. Enterprise plans support custom workflows for larger organizations." },
  { q: "Do you offer student discounts?", a: "Yes — verified students get 50% off the Pro plan. Apply with your .edu email at support@codebuddy.dev." },
];

const TESTIMONIALS = [
  { name: "Meera Joshi", role: "Indie Hacker", plan: "Pro", avatar: "MJ", hue: 271, quote: "Upgraded to Pro after my first match turned into a shipped product. The unlimited AI insights alone are worth it." },
  { name: "Alex Kim", role: "Design Engineer", plan: "Free → Pro", avatar: "AK", hue: 210, quote: "Started free, hit my 3-match limit in 2 days. Went Pro and never looked back. ROI is insane for $499/mo." },
  { name: "TechCorp India", role: "Team of 4", plan: "Team", avatar: "TC", hue: 38, quote: "Built our entire founding engineering team through CodeBuddy's Team plan. Worth every rupee." },
];

 const tickerItems = [
    "Aanya matched with Rohan · 2 min ago",
    "Sara shipped a project · 5 min ago",
    "Dev joined as Rust mentor · 8 min ago",
    "Priya found her co-founder · 12 min ago",
    "Karan matched with ML engineer · 15 min ago",
  ];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
   const [ticker, setTicker] = useState(0);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [dark, setDark] = useState(true);
  const [token, settoken] = useState(false);
  const [showSignoutModal, setShowSignoutModal] = useState(false);

  const getToken = async () => {
    const data = await fetch("/api/auth/me");
    const json = await data.json();

    settoken(json.token || false);
  };

  useEffect(() => {
    getToken();
  }, [])



  const handleSignout = async () => {
    try {
      const res = await fetch("/api/signout", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        setShowSignoutModal(false);
        settoken(false);
        router.push("/");
      }
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };



  const hsl = (h, s = 70, l = 60) => `hsl(${h},${s}%,${l}%)`;
  const hsla = (h, s = 70, l = 60, a = 0.15) => `hsla(${h},${s}%,${l}%,${a})`;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:99px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
    .fade-up{animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both}
    .plan-card{background:${T.card};border:1px solid ${T.border};border-radius:22px;padding:28px;transition:all 0.3s;position:relative;overflow:hidden}
    .plan-card:hover{border-color:rgba(124,58,237,0.3);transform:translateY(-4px);box-shadow:${T.shadow}}
    .plan-card.featured{border-color:rgba(167,139,250,0.35);background:rgba(167,139,250,0.05)}
    .btn-primary{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:13px 24px;border-radius:11px;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 6px 24px rgba(124,58,237,0.28);width:100%}
    .btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(124,58,237,0.42)}
    .btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:13px 24px;border-radius:11px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;width:100%}
    .btn-ghost:hover{border-color:${T.border2};color:${T.text}}
    .faq-item{border:1px solid ${T.border};border-radius:14px;overflow:hidden;transition:border-color 0.2s;margin-bottom:10px}
    .faq-item:hover{border-color:${T.border2}}
    .faq-btn{width:100%;background:none;border:none;color:${T.text};padding:18px 20px;text-align:left;cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;display:flex;justify-content:space-between;align-items:center;gap:12px}
    .feature-row{display:grid;grid-template-columns:220px repeat(4,1fr);border-bottom:1px solid ${T.border};transition:background 0.15s}
    .feature-row:hover{background:rgba(255,255,255,0.015)}
    .feature-cell{padding:13px 16px;font-size:12px;display:flex;align-items:center;justify-content:center;text-align:center}
    .feature-cell:first-child{justify-content:flex-start;text-align:left;color:${T.text2};font-weight:500}
    @media(max-width:768px){
      .plans-grid{grid-template-columns:1fr!important}
      .comparison-table{display:none!important}
      .hero-title{font-size:36px!important}
      .billing-toggle{flex-direction:column!important;align-items:center!important}
    }
    @media(max-width:480px){
      .hero-title{font-size:28px!important}
      .testi-grid{grid-template-columns:1fr!important}
    }
  `;

   const SignoutModal = () => (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowSignoutModal(false); }}>
      <div className="modal-box" style={{ background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 22, padding: "36px 32px", width: "min(380px, calc(100vw - 32px))", boxShadow: T.shadow, textAlign: "center" }}>

        {/* Icon */}
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24 }}>
          🚪
        </div>

        {/* Title */}
        <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, fontWeight: 400, color: T.text, letterSpacing: "-0.5px", marginBottom: 10 }}>
          Sign out of CodeBuddy?
        </h3>

        {/* Subtitle */}
        <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.65, marginBottom: 28, maxWidth: 280, margin: "0 auto 28px" }}>
          You'll need to sign back in to access your matches and messages.
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-ghost"
            style={{ flex: 1, padding: "11px 0", fontSize: 13 }}
            onClick={() => setShowSignoutModal(false)}
          >
            Cancel
          </button>
          <button
            className="btn-danger"
            style={{ flex: 1, padding: "11px 0", fontSize: 13 }}
            onClick={handleSignout}
          >
            Yes, sign out
          </button>
        </div>
      </div>
    </div>
  );

  const Logo = () => (
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill={dark ? "#1a0a6a" : "#1a0a6a"} />
      <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff" />
    </svg>
  );


  const CheckMark = ({ val }) => {
    if (val === true) return <span style={{ fontSize: 15, color: "#4ade80" }}>✓</span>;
    if (val === false) return <span style={{ fontSize: 15, color: T.text3 }}>—</span>;
    return <span style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{val}</span>;
  };

  return (
   <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{css}</style>

      {/* ── SIGN OUT MODAL ── */}
      {showSignoutModal && <SignoutModal />}

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
            {dark ? <i class="fa-regular fa-sun"></i> : <i class="fa-regular fa-moon"></i>}
          </button>

          {/* Sign in / Sign out */}
          {!token
            ? <Link href="/signin"><button className="btn-ghost nav-ghost" style={{ padding: "7px 16px", fontSize: 13 }}>Sign in</button></Link>
            : <button className="btn-ghost nav-ghost" style={{ padding: "7px 16px", fontSize: 13, color: "#f87171", borderColor: "rgba(248,113,113,0.25)" }} onClick={() => setShowSignoutModal(true)}>Sign out</button>
          }

          {/* Get started / Dashboard */}
          {!token
            ? <Link href="/signup"><button className="btn-primary" style={{ padding: "8px 18px" }}>Get started →</button></Link>
            : <Link href="/dashboard"><button className="btn-primary" style={{ padding: "8px 18px" }}>Dashboard →</button></Link>
          }
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>
     {/* ── Hero ── */}
        <section style={{ maxWidth: 800, margin: "0 auto", padding: "clamp(50px,10vw,96px) clamp(16px,5vw,32px) 0", textAlign: "center" }}>
          <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 99, padding: "5px 14px", marginBottom: 24 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.8px", textTransform: "uppercase" }}>Simple Pricing</span>
          </div>
          <h1 className="fade-up hero-title" style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(36px,7vw,62px)", fontWeight: 400, letterSpacing: "-2px", lineHeight: 1.06, color: T.text, marginBottom: 18, animationDelay: "0.05s" }}>
            Invest in the person<br />who <span style={{ fontStyle: "italic", color: "#a78bfa" }}>ships with you</span>
          </h1>
          <p className="fade-up" style={{ fontSize: "clamp(14px,3vw,16px)", color: T.text2, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 36px", animationDelay: "0.1s" }}>
            Start free, upgrade when you're ready. Every plan includes core matching. No hidden fees, no dark patterns.
          </p>

          {/* Billing toggle */}
          <div className="fade-up billing-toggle" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 52, animationDelay: "0.15s" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: !yearly ? T.text : T.text3 }}>Monthly</span>
            <button onClick={() => setYearly(p => !p)} style={{ width: 52, height: 28, borderRadius: 14, border: "none", cursor: "pointer", background: yearly ? "#7c3aed" : T.border2, position: "relative", transition: "background 0.3s" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: yearly ? 27 : 3, transition: "left 0.25s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: yearly ? T.text : T.text3 }}>
              Yearly
              <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}>Save 20%</span>
            </span>
          </div>
        </section>

        {/* ── Plans ── */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) 80px" }}>
          <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {PLANS.map((plan, i) => (
              <div key={plan.id} className={`plan-card fade-up${plan.id === "pro" ? " featured" : ""}`} style={{ animationDelay: `${i * 0.08}s` }} onMouseEnter={() => setHoveredPlan(plan.id)} onMouseLeave={() => setHoveredPlan(null)}>
                {/* Glow */}
                <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: `radial-gradient(circle,${plan.colorBg.replace("0.08", "0.15")} 0%,transparent 70%)`, pointerEvents: "none" }} />

                {plan.badge && (
                  <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "white", fontSize: 9, fontWeight: 700, padding: "4px 14px", borderRadius: "0 0 10px 10px", letterSpacing: "1px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{plan.badge}</div>
                )}

                <div style={{ marginBottom: 20, paddingTop: plan.badge ? 12 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: plan.color, boxShadow: `0 0 8px ${plan.color}` }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: plan.color, textTransform: "uppercase", letterSpacing: "1px" }}>{plan.name}</span>
                  </div>
                  <p style={{ fontSize: 12, color: T.text3, marginBottom: 16, lineHeight: 1.5 }}>{plan.tagline}</p>

                  {plan.monthly !== null ? (
                    <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 42, color: T.text, letterSpacing: "-2px", lineHeight: 1 }}>
                        ₹{yearly ? plan.yearly : plan.monthly}
                      </span>
                      <span style={{ fontSize: 12, color: T.text3 }}>/mo</span>
                    </div>
                  ) : (
                    <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.text, letterSpacing: "-1.5px", lineHeight: 1, marginBottom: 4 }}>Custom</div>
                  )}

                  {plan.monthly !== null && yearly && plan.yearly > 0 && (
                    <div style={{ fontSize: 11, color: "#4ade80", fontWeight: 600 }}>₹{(plan.monthly - plan.yearly) * 12} saved/year</div>
                  )}
                  {plan.monthly === 0 && <div style={{ fontSize: 11, color: T.text3 }}>Free forever</div>}
                </div>

                <div style={{ height: 1, background: T.border, margin: "0 0 18px" }} />

                {/* Key features */}
                <div style={{ marginBottom: 22, display: "flex", flexDirection: "column", gap: 9 }}>
                  {Object.entries(plan.features).slice(0, 7).map(([feat, val]) => (
                    <div key={feat} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                      {val === true ? <span style={{ color: "#4ade80", fontSize: 13, flexShrink: 0 }}>✓</span>
                        : val === false ? <span style={{ color: T.text3, fontSize: 13, flexShrink: 0 }}>—</span>
                          : <span style={{ color: plan.color, fontSize: 13, flexShrink: 0 }}>✦</span>}
                      <span style={{ color: val === false ? T.text3 : T.text2 }}>
                        {feat}: {typeof val === "string" ? <strong style={{ color: T.text }}>{val}</strong> : ""}
                      </span>
                    </div>
                  ))}
                </div>

                <button className={plan.ctaStyle === "primary" ? "btn-primary" : "btn-ghost"} style={{ textAlign: "center" }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature Comparison Table ── */}
        <section className="comparison-table" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(28px,5vw,40px)", color: T.text, letterSpacing: "-1px" }}>
              Full feature <span style={{ fontStyle: "italic", color: "#a78bfa" }}>comparison</span>
            </h2>
          </div>

          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "220px repeat(4,1fr)", background: "rgba(124,58,237,0.05)", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ padding: "16px 16px" }} />
              {PLANS.map(plan => (
                <div key={plan.id} style={{ padding: "16px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: plan.color, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ fontSize: 13, color: T.text2 }}>
                    {plan.monthly !== null ? (yearly ? `₹${plan.yearly}` : plan.monthly === 0 ? "Free" : `₹${plan.monthly}`) : "Custom"}/mo
                  </div>
                </div>
              ))}
            </div>

            {/* Rows */}
            {FEATURE_ROWS.map((feat, i) => (
              <div key={feat} className="feature-row" style={{ display: "grid", gridTemplateColumns: "220px repeat(4,1fr)", borderBottom: i < FEATURE_ROWS.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div className="feature-cell" style={{ justifyContent: "flex-start", color: T.text2, fontWeight: 500 }}>{feat}</div>
                {PLANS.map(plan => (
                  <div key={plan.id} className="feature-cell">
                    <CheckMark val={plan.features[feat]} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── Social Proof ── */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(26px,5vw,38px)", color: T.text, letterSpacing: "-1px" }}>
              Builders who <span style={{ fontStyle: "italic", color: "#a78bfa" }}>upgraded</span>
            </h2>
          </div>
          <div className="testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="fade-up" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24, animationDelay: `${i * 0.08}s` }}>
                <div style={{ fontSize: 26, color: "#7c3aed", marginBottom: 12, fontFamily: "Georgia,serif", opacity: 0.5 }}>"</div>
                <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.72, fontStyle: "italic", marginBottom: 18 }}>{t.quote}</p>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: hsla(t.hue, 70, 60, 0.15), border: `1.5px solid ${hsla(t.hue, 70, 60, 0.3)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: hsl(t.hue), fontFamily: "'Instrument Serif',serif" }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: T.text3 }}>{t.role}</div>
                  </div>
                  <div style={{ marginLeft: "auto", padding: "3px 9px", borderRadius: 99, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", fontSize: 10, fontWeight: 700, color: "#a78bfa" }}>{t.plan}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(26px,5vw,38px)", color: T.text, letterSpacing: "-1px" }}>
              Pricing <span style={{ fontStyle: "italic", color: "#a78bfa" }}>FAQ</span>
            </h2>
          </div>
          {FAQS.map((f, i) => (
            <div key={i} className="faq-item">
              <button className="faq-btn" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                <span>{f.q}</span>
                <span style={{ color: T.text3, fontSize: 18, transition: "transform 0.25s", transform: activeFaq === i ? "rotate(45deg)" : "none", flexShrink: 0 }}>+</span>
              </button>
              {activeFaq === i && (
                <div style={{ padding: "0 20px 18px", fontSize: 13, color: T.text2, lineHeight: 1.75, animation: "fadeUp 0.25s ease both" }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* ── Enterprise CTA ── */}
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) 100px" }}>
          <div style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.07),rgba(124,58,237,0.07))", border: "1px solid rgba(245,158,11,0.18)", borderRadius: 26, padding: "clamp(36px,6vw,56px) clamp(24px,5vw,52px)", display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>Enterprise</div>
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(24px,5vw,36px)", color: T.text, letterSpacing: "-0.8px", lineHeight: 1.1, marginBottom: 12 }}>
                Building a whole<br /><span style={{ fontStyle: "italic", color: "#f59e0b" }}>organization?</span>
              </h2>
              <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.65, maxWidth: 380 }}>
                Custom contracts, dedicated infrastructure, SSO, advanced analytics, and an account manager who actually picks up the phone.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
              {["Custom matching models", "Dedicated infrastructure", "SSO & SAML", "Custom SLA", "White-label option"].map(f => (
                <div key={f} style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 13, color: T.text2 }}>
                  <span style={{ color: "#f59e0b", fontSize: 12 }}>✓</span> {f}
                </div>
              ))}
              <button style={{ marginTop: 8, background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", color: "white", padding: "12px 24px", borderRadius: 11, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, boxShadow: "0 6px 20px rgba(245,158,11,0.28)", transition: "all 0.2s" }}>
                Talk to sales →
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}