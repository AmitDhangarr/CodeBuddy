'use client'
import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"

// ─── Theme ─────────────────────────────────────────────────────────────────
const T = {
  bg: "#07070f", bg2: "#0d0d1a",
  border: "rgba(255,255,255,0.06)", border2: "rgba(255,255,255,0.11)",
  text: "#e4e4f0", text2: "#8888aa", text3: "#44445a",
  card: "rgba(255,255,255,0.025)", cardHover: "rgba(255,255,255,0.042)",
  input: "rgba(255,255,255,0.04)", inputBorder: "rgba(255,255,255,0.08)",
  shadow: "0 24px 64px rgba(0,0,0,0.55)",
  navBg: "rgba(7,7,15,0.93)",
  surfaceA: "rgba(124,58,237,0.06)", surfaceBorder: "rgba(124,58,237,0.15)",
}

// ─── Plan data ──────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "free", name: "Free", tagline: "Start matching, zero cost",
    monthly: 0, yearly: 0, color: "#4ade80",
    colorBg: "rgba(74,222,128,0.08)", colorBorder: "rgba(74,222,128,0.2)",
    cta: "Get started free", ctaStyle: "ghost",
    features: {
      "Connections": "Up to 3 active", "AI Match Insights": "3 per day",
      "Real-time Messaging": true, "Match Score": true, "Profile Badge": "Basic",
      "Skill Filters": "Standard", "Project Rooms": false, "Priority Matching": false,
      "Analytics Dashboard": false, "Custom Profile URL": false, "API Access": false,
      "Team Members": false, "Dedicated Support": false, "SLA Guarantee": false,
    }
  },
  {
    id: "pro", name: "Pro", tagline: "For builders who ship seriously",
    monthly: 499, yearly: 399, color: "#a78bfa",
    colorBg: "rgba(167,139,250,0.08)", colorBorder: "rgba(167,139,250,0.25)",
    cta: "Start Pro — 14 days free", ctaStyle: "primary", badge: "Most Popular",
    features: {
      "Connections": "Unlimited", "AI Match Insights": "Unlimited",
      "Real-time Messaging": true, "Match Score": true, "Profile Badge": "Pro verified",
      "Skill Filters": "Advanced + saved", "Project Rooms": true, "Priority Matching": true,
      "Analytics Dashboard": true, "Custom Profile URL": true, "API Access": false,
      "Team Members": false, "Dedicated Support": "Email", "SLA Guarantee": false,
    }
  },
  {
    id: "team", name: "Team", tagline: "Build your founding team",
    monthly: 1999, yearly: 1599, color: "#38bdf8",
    colorBg: "rgba(56,189,248,0.08)", colorBorder: "rgba(56,189,248,0.2)",
    cta: "Start Team trial", ctaStyle: "ghost",
    features: {
      "Connections": "Unlimited", "AI Match Insights": "Unlimited",
      "Real-time Messaging": true, "Match Score": true, "Profile Badge": "Team verified",
      "Skill Filters": "Advanced + saved", "Project Rooms": "Unlimited", "Priority Matching": true,
      "Analytics Dashboard": "Advanced", "Custom Profile URL": true, "API Access": "Beta",
      "Team Members": "Up to 5", "Dedicated Support": "Priority email", "SLA Guarantee": false,
    }
  },
  {
    id: "enterprise", name: "Enterprise", tagline: "For organizations at scale",
    monthly: null, yearly: null, color: "#f59e0b",
    colorBg: "rgba(245,158,11,0.08)", colorBorder: "rgba(245,158,11,0.2)",
    cta: "Talk to us", ctaStyle: "ghost",
    features: {
      "Connections": "Unlimited", "AI Match Insights": "Unlimited",
      "Real-time Messaging": true, "Match Score": true, "Profile Badge": "Enterprise",
      "Skill Filters": "Custom", "Project Rooms": "Unlimited", "Priority Matching": true,
      "Analytics Dashboard": "Custom", "Custom Profile URL": true, "API Access": "Full",
      "Team Members": "Unlimited", "Dedicated Support": "24/7 dedicated", "SLA Guarantee": "99.9%",
    }
  }
]

const FEATURE_ROWS = Object.keys(PLANS[0].features)

const FAQS = [
  { q: "Can I switch plans anytime?", a: "Yes — upgrades take effect immediately, downgrades apply at end of billing cycle. We prorate unused time." },
  { q: "What happens when my free trial ends?", a: "After 14 days you move to Free automatically. No surprise charges, no card required for trial." },
  { q: "Is there a refund policy?", a: "30-day full refund on Pro and Team plans, no questions asked. Email support@codebuddy.dev." },
  { q: "How does AI matching work per plan?", a: "Same engine for all plans — Free users get 3 AI insights/day, Pro & Team get unlimited with priority queue." },
  { q: "Can I use CodeBuddy for my startup's hiring?", a: "CodeBuddy is built for collaboration. Team plan is ideal for finding co-founders or early teammates." },
  { q: "Do you offer student discounts?", a: "Yes — verified students get 50% off Pro. Apply with your .edu email at support@codebuddy.dev." },
]

const TESTIMONIALS = [
  { name: "Meera Joshi", role: "Indie Hacker", plan: "Pro", avatar: "MJ", hue: 271, quote: "Upgraded to Pro after my first match turned into a shipped product. The unlimited AI insights alone are worth it." },
  { name: "Alex Kim", role: "Design Engineer", plan: "Free → Pro", avatar: "AK", hue: 210, quote: "Started free, hit my 3-match limit in 2 days. Went Pro and never looked back. ROI is insane for ₹499/mo." },
  { name: "TechCorp India", role: "Team of 4", plan: "Team", avatar: "TC", hue: 38, quote: "Built our entire founding engineering team through CodeBuddy's Team plan. Worth every rupee." },
]

// ─── Payment data ───────────────────────────────────────────────────────────
const UPI_APPS = [
  { id: "gpay",     label: "Google Pay",    icon: "G",  color: "#4285f4", bg: "#e8f0fe" },
  { id: "phonepe",  label: "PhonePe",       icon: "Ph", color: "#5f259f", bg: "#ede7f6" },
  { id: "paytm",    label: "Paytm",         icon: "P",  color: "#00baf2", bg: "#e0f7fa" },
  { id: "bhim",     label: "BHIM",          icon: "B",  color: "#1a6dff", bg: "#e3f2fd" },
  { id: "amazon",   label: "Amazon Pay",    icon: "A",  color: "#ff9900", bg: "#fff8e1" },
  { id: "mobikwik", label: "MobiKwik",      icon: "M",  color: "#22c55e", bg: "#e8f5e9" },
  { id: "whatsapp", label: "WhatsApp Pay",  icon: "W",  color: "#25d366", bg: "#e8f5e9" },
  { id: "cred",     label: "CRED",          icon: "C",  color: "#d4a843", bg: "#fff8e1" },
]

const BANKS = [
  { id: "sbi",      name: "State Bank of India",    abbr: "SBI",  color: "#1a6dff" },
  { id: "hdfc",     name: "HDFC Bank",              abbr: "HDFC", color: "#0073ce" },
  { id: "icici",    name: "ICICI Bank",             abbr: "ICICI",color: "#f16522" },
  { id: "axis",     name: "Axis Bank",              abbr: "AXIS", color: "#97144d" },
  { id: "kotak",    name: "Kotak Mahindra",         abbr: "KMB",  color: "#e31837" },
  { id: "pnb",      name: "Punjab National Bank",   abbr: "PNB",  color: "#c6922a" },
  { id: "bob",      name: "Bank of Baroda",         abbr: "BOB",  color: "#ff6b00" },
  { id: "canara",   name: "Canara Bank",            abbr: "CAN",  color: "#004b87" },
  { id: "union",    name: "Union Bank of India",    abbr: "UBI",  color: "#004b8d" },
  { id: "yes",      name: "Yes Bank",               abbr: "YES",  color: "#00c0f3" },
  { id: "indusind", name: "IndusInd Bank",          abbr: "IND",  color: "#e6232a" },
  { id: "federal",  name: "Federal Bank",           abbr: "FED",  color: "#1b3a6b" },
  { id: "idfc",     name: "IDFC First Bank",        abbr: "IDF",  color: "#9b1b30" },
  { id: "rbl",      name: "RBL Bank",               abbr: "RBL",  color: "#006eb0" },
  { id: "au",       name: "AU Small Finance Bank",  abbr: "AU",   color: "#f7941d" },
]

const WALLETS = [
  { id: "paytm",      label: "Paytm",        icon: "P",  color: "#00baf2" },
  { id: "phonepe",    label: "PhonePe",      icon: "Ph", color: "#5f259f" },
  { id: "amazon",     label: "Amazon Pay",   icon: "A",  color: "#ff9900" },
  { id: "freecharge", label: "Freecharge",   icon: "F",  color: "#22c55e" },
  { id: "mobikwik",   label: "MobiKwik",     icon: "M",  color: "#00aff0" },
  { id: "airtel",     label: "Airtel Money", icon: "Ai", color: "#e40000" },
]

const BNPL = [
  { id: "lazypay",   label: "LazyPay",      icon: "L",  color: "#7c3aed" },
  { id: "simpl",     label: "Simpl",        icon: "S",  color: "#6366f1" },
  { id: "zestmoney", label: "ZestMoney",    icon: "Z",  color: "#ff6b35" },
  { id: "ola",       label: "Ola Money",    icon: "O",  color: "#0f6af5" },
  { id: "flipkart",  label: "Flipkart Pay", icon: "F",  color: "#2874f0" },
  { id: "snapmint",  label: "Snapmint",     icon: "Sn", color: "#00bcd4" },
]

const EMI_TENURES = [
  { months: 3,  rate: 0,   label: "No-cost EMI" },
  { months: 6,  rate: 0,   label: "No-cost EMI" },
  { months: 9,  rate: 1.5, label: "1.5% p.a." },
  { months: 12, rate: 2,   label: "2% p.a." },
  { months: 18, rate: 2.5, label: "2.5% p.a." },
  { months: 24, rate: 3,   label: "3% p.a." },
]

const METHOD_TABS = [
  { id: "upi",        label: "UPI",         emoji: "📱" },
  { id: "card",       label: "Card",        emoji: "💳" },
  { id: "netbanking", label: "Net Banking", emoji: "🏦" },
  { id: "wallet",     label: "Wallets",     emoji: "👛" },
  { id: "emi",        label: "EMI",         emoji: "📅" },
  { id: "bnpl",       label: "BNPL",        emoji: "⏳" },
]

const PROC_STEPS = [
  { label: "Initiating secure connection",  sub: "TLS 1.3 encrypted tunnel" },
  { label: "Verifying payment credentials", sub: "Checking with issuing bank" },
  { label: "RBI 2FA authentication",        sub: "Second-factor verification" },
  { label: "Debiting your account",         sub: "Processing with NPCI/Visa/MC" },
  { label: "Activating your subscription",  sub: "CodeBuddy servers" },
]

// ─── Helpers ────────────────────────────────────────────────────────────────
const gstOf  = (p) => Math.round(p * 0.18)
const totalOf = (p) => p + gstOf(p)
const fmtCard = (v) => v.replace(/\D/g,"").substring(0,16).replace(/(.{4})/g,"$1 ").trim()
const fmtExp  = (v) => { const d=v.replace(/\D/g,"").substring(0,4); return d.length>=2?d.slice(0,2)+" / "+d.slice(2):d }
const fmtDate = (d) => d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})
const genTxId = () => "CB"+Math.random().toString(36).slice(2,8).toUpperCase()

const hsl  = (h,s=70,l=60) => `hsl(${h},${s}%,${l}%)`
const hsla = (h,s=70,l=60,a=0.15) => `hsla(${h},${s}%,${l}%,${a})`

// ─── Global CSS ─────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:99px}

@keyframes fadeUp  {from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn  {from{opacity:0}to{opacity:1}}
@keyframes scaleIn {from{opacity:0;transform:scale(.93) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes spin    {to{transform:rotate(360deg)}}
@keyframes pulse3  {0%,100%{opacity:1}50%{opacity:.35}}
@keyframes shimmer {0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes pop     {0%{transform:scale(.7)}60%{transform:scale(1.12)}100%{transform:scale(1)}}
@keyframes successRing{0%{box-shadow:0 0 0 0 rgba(74,222,128,.5)}100%{box-shadow:0 0 0 18px rgba(74,222,128,0)}}

.fade-up{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both}

/* ── Plan cards ── */
.plan-card{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);border-radius:22px;padding:28px;transition:all .3s;position:relative;overflow:hidden}
.plan-card:hover{border-color:rgba(124,58,237,.3);transform:translateY(-4px);box-shadow:0 24px 64px rgba(0,0,0,.55)}
.plan-card.featured{border-color:rgba(167,139,250,.35);background:rgba(167,139,250,.05)}

/* ── Buttons ── */
.btn-primary{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:#fff;padding:13px 24px;border-radius:11px;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;box-shadow:0 6px 24px rgba(124,58,237,.28);width:100%}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(124,58,237,.42)}
.btn-ghost{background:transparent;border:1px solid rgba(255,255,255,0.11);color:#8888aa;padding:13px 24px;border-radius:11px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;width:100%}
.btn-ghost:hover{border-color:rgba(255,255,255,.22);color:#e4e4f0}
.btn-sm-ghost{background:transparent;border:1px solid rgba(255,255,255,.11);color:#8888aa;padding:8px 16px;border-radius:9px;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}
.btn-sm-ghost:hover{border-color:rgba(255,255,255,.22);color:#e4e4f0}
.btn-danger{background:linear-gradient(135deg,#ef4444,#dc2626);border:none;color:#fff;padding:11px 0;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;flex:1}

/* ── FAQ ── */
.faq-item{border:1px solid rgba(255,255,255,.06);border-radius:14px;overflow:hidden;margin-bottom:10px;transition:border-color .2s}
.faq-item:hover{border-color:rgba(255,255,255,.11)}
.faq-btn{width:100%;background:none;border:none;color:#e4e4f0;padding:18px 20px;text-align:left;cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;display:flex;justify-content:space-between;align-items:center;gap:12px}
.feature-row{display:grid;grid-template-columns:220px repeat(4,1fr);border-bottom:1px solid rgba(255,255,255,.06);transition:background .15s}
.feature-row:hover{background:rgba(255,255,255,.015)}
.feature-cell{padding:13px 16px;font-size:12px;display:flex;align-items:center;justify-content:center;text-align:center}
.feature-cell:first-child{justify-content:flex-start;text-align:left;color:#8888aa;font-weight:500}

/* ── Modal overlay ── */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);animation:fadeIn .2s ease}
.modal-box{background:#0d0d1a;border:1px solid rgba(255,255,255,.11);border-radius:26px;width:min(520px,calc(100vw - 32px));box-shadow:0 32px 80px rgba(0,0,0,.8);overflow:hidden;animation:scaleIn .3s cubic-bezier(.16,1,.3,1) both;max-height:90vh;overflow-y:auto}

/* ── Payment method tabs ── */
.pay-method-tab{flex:1;padding:9px 4px;border:none;background:transparent;color:#8888aa;font-size:11px;font-weight:700;cursor:pointer;border-radius:9px;transition:all .2s;font-family:inherit;text-align:center;white-space:nowrap}
.pay-method-tab.active{background:#7c3aed;color:#fff;box-shadow:0 2px 12px rgba(124,58,237,.35)}
.pay-method-tab:not(.active):hover{background:rgba(255,255,255,.06);color:#e4e4f0}

/* ── Payment input ── */
.pay-input{width:100%;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);border-radius:11px;padding:11px 14px;font-size:14px;color:#e4e4f0;font-family:inherit;outline:none;transition:border-color .2s,box-shadow .2s}
.pay-input:focus{border-color:rgba(167,139,250,.55);box-shadow:0 0 0 3px rgba(124,58,237,.12)}
.pay-input.error{border-color:rgba(239,68,68,.6)!important}
.pay-input::placeholder{color:#44445a}
.pay-label{font-size:10px;font-weight:700;color:#44445a;letter-spacing:.7px;text-transform:uppercase;margin-bottom:6px}

/* ── UPI app tiles ── */
.upi-tile{background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.07);border-radius:13px;padding:10px 6px;text-align:center;cursor:pointer;transition:all .2s;font-size:10px;font-weight:700;color:#8888aa}
.upi-tile:hover,.upi-tile.sel{border-color:rgba(167,139,250,.5);background:rgba(167,139,250,.08);color:#a78bfa}
.upi-tile.sel{box-shadow:0 0 0 2px rgba(124,58,237,.3)}

/* ── Bank / Wallet / BNPL tiles ── */
.bank-row{background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.07);border-radius:11px;padding:10px 14px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:all .2s;font-size:12px;color:#8888aa;font-weight:600}
.bank-row:hover,.bank-row.sel{border-color:rgba(167,139,250,.5);color:#a78bfa;background:rgba(167,139,250,.06)}
.bank-row.sel{box-shadow:0 0 0 2px rgba(124,58,237,.25)}
.wallet-tile{background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.07);border-radius:13px;padding:12px 8px;text-align:center;cursor:pointer;transition:all .2s;font-size:11px;font-weight:700;color:#8888aa}
.wallet-tile:hover,.wallet-tile.sel{border-color:rgba(167,139,250,.5);background:rgba(167,139,250,.08);color:#a78bfa}
.wallet-tile.sel{box-shadow:0 0 0 2px rgba(124,58,237,.3)}
.emi-tile{background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.07);border-radius:12px;padding:12px;cursor:pointer;transition:all .2s;text-align:center}
.emi-tile:hover,.emi-tile.sel{border-color:rgba(167,139,250,.5);background:rgba(167,139,250,.07)}
.emi-tile.sel{box-shadow:0 0 0 2px rgba(124,58,237,.3)}

/* ── Stepper dots ── */
.step-dot{width:8px;height:8px;border-radius:50%;transition:all .3s}

/* ── Processing step rows ── */
.proc-row{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:9px;transition:all .35s;font-size:12px;color:#44445a}
.proc-row.active{background:rgba(167,139,250,.08);color:#a78bfa}
.proc-row.done{background:rgba(74,222,128,.06);color:#4ade80}

/* ── Success popup extras ── */
.success-check-circle{width:72px;height:72px;border-radius:50%;background:rgba(74,222,128,.12);border:2px solid rgba(74,222,128,.35);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;animation:pop .45s cubic-bezier(.34,1.56,.64,1) .1s both, successRing 1s ease .55s}
.rcpt-row{display:flex;justify-content:space-between;font-size:12px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);color:#8888aa}
.rcpt-row:last-child{border-bottom:none;font-size:14px;font-weight:700;color:#e4e4f0;padding-top:10px}
.rcpt-row span:last-child{color:#e4e4f0}

/* ── Validation error text ── */
.err-text{font-size:10px;color:#f87171;margin-top:-10px;margin-bottom:12px}

/* ── Responsive ── */
@media(max-width:768px){
  .plans-grid{grid-template-columns:1fr!important}
  .comparison-table{display:none!important}
  .hero-title{font-size:36px!important}
  .testi-grid{grid-template-columns:1fr!important}
  .modal-box{border-radius:20px}
}
@media(max-width:480px){
  .hero-title{font-size:28px!important}
}
`

// ─── Logo SVG ────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill="#1a0a6a"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="white"/>
    </svg>
  )
}

// ─── CheckMark for comparison table ─────────────────────────────────────────
function CheckMark({ val }) {
  if (val === true)  return <span style={{ fontSize: 15, color: "#4ade80" }}>✓</span>
  if (val === false) return <span style={{ fontSize: 15, color: T.text3 }}>—</span>
  return <span style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{val}</span>
}

// ════════════════════════════════════════════════════════════════════════════
// MODAL STEP 1 — Proceed to Payment confirmation
// ════════════════════════════════════════════════════════════════════════════
function StepProceed({ plan, yearly, onNext, onClose }) {
  const price = yearly ? plan.yearly : plan.monthly
  const g     = gstOf(price)
  const tot   = totalOf(price)

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: plan.color, boxShadow: `0 0 8px ${plan.color}` }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: plan.color, textTransform: "uppercase", letterSpacing: 1 }}>{plan.name} plan</span>
            </div>
            <div style={{ fontSize: 13, color: T.text2 }}>Review your order</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.text3, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "24px 28px 28px" }}>
        {/* Plan highlight */}
        <div style={{ background: plan.colorBg, border: `1px solid ${plan.colorBorder}`, borderRadius: 16, padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: T.text, letterSpacing: -1, lineHeight: 1 }}>
                ₹{price}<span style={{ fontSize: 13, color: T.text3, fontFamily: "inherit", letterSpacing: 0 }}>/mo</span>
              </div>
              <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>Billed {yearly ? "yearly" : "monthly"}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: T.text3 }}>+₹{g} GST</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginTop: 2 }}>₹{tot} total</div>
            </div>
          </div>
        </div>

        {/* What's included */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: ".7px", textTransform: "uppercase", marginBottom: 10 }}>What's included</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
            {Object.entries(plan.features).filter(([,v]) => v !== false).slice(0, 8).map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: T.text2 }}>
                <span style={{ color: plan.color, fontSize: 11, flexShrink: 0 }}>✦</span>
                <span>{typeof v === "string" ? v : k}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trial note */}
        {plan.id === "pro" && (
          <div style={{ background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 11, padding: "10px 14px", fontSize: 12, color: "#4ade80", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            🎁 14-day free trial — no charge until trial ends
          </div>
        )}

        {/* Trust strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 11, color: T.text3, marginBottom: 22, flexWrap: "wrap" }}>
          <span>🔒 SSL secured</span>
          <span>🛡 Razorpay</span>
          <span>↩ 30-day refund</span>
          <span>✕ Cancel anytime</span>
        </div>

        <button className="btn-primary" onClick={onNext} style={{ fontSize: 15 }}>
          Proceed to Payment →
        </button>
        <button onClick={onClose} style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: T.text3, fontSize: 12, cursor: "pointer", fontFamily: "inherit", padding: "8px 0" }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// MODAL STEP 2 — Choose payment method
// ════════════════════════════════════════════════════════════════════════════
function StepMethod({ plan, yearly, method, setMethod, onNext, onBack, onClose }) {
  const price = yearly ? plan.yearly : plan.monthly
  const tot   = totalOf(price)

  return (
    <div>
      <div style={{ padding: "22px 28px 18px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={onBack} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border2}`, color: T.text2, width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Choose payment method</div>
              <div style={{ fontSize: 11, color: T.text2 }}>₹{tot} · {plan.name} plan</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.text3, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
      </div>

      <div style={{ padding: "20px 28px 28px" }}>
        {/* Method tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 8 }}>
          {METHOD_TABS.map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              style={{
                padding: "14px 8px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
                border: method === m.id ? `2px solid rgba(124,58,237,.6)` : `1.5px solid ${T.border2}`,
                background: method === m.id ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.03)",
                color: method === m.id ? "#a78bfa" : T.text2,
                fontSize: 12, fontWeight: 700, transition: "all .2s",
                boxShadow: method === m.id ? "0 0 0 3px rgba(124,58,237,0.12)" : "none",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 5 }}>{m.emoji}</div>
              {m.label}
            </button>
          ))}
        </div>

        {/* Method descriptions */}
        <div style={{ background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 11, padding: "10px 14px", fontSize: 11, color: T.text2, marginBottom: 22 }}>
          {method === "upi"        && "Pay instantly via Google Pay, PhonePe, Paytm, BHIM or any UPI VPA"}
          {method === "card"       && "Visa, Mastercard, RuPay, Amex & Diners — all cards with 3D Secure"}
          {method === "netbanking" && "Direct debit from 15+ Indian banks via net banking portal"}
          {method === "wallet"     && "Pay from your Paytm, PhonePe, Amazon Pay or other wallet balance"}
          {method === "emi"        && "Split into easy monthly instalments — no-cost EMI available on 3 & 6 months"}
          {method === "bnpl"       && "Buy now, pay later with LazyPay, Simpl, ZestMoney & more"}
        </div>

        <button className="btn-primary" onClick={onNext} style={{ fontSize: 15 }}>
          Continue with {METHOD_TABS.find(m => m.id === method)?.label} →
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// MODAL STEP 3 — Payment details (per method)
// ════════════════════════════════════════════════════════════════════════════
function StepDetails({ plan, yearly, method, onPay, onBack, onClose }) {
  const price = yearly ? plan.yearly : plan.monthly
  const g     = gstOf(price)
  const tot   = totalOf(price)

  // UPI state
  const [selUpi,   setSelUpi]   = useState(null)
  const [upiId,    setUpiId]    = useState("")
  const [upiErr,   setUpiErr]   = useState("")

  // Card state
  const [cName,    setCName]    = useState("")
  const [cNum,     setCNum]     = useState("")
  const [cExp,     setCExp]     = useState("")
  const [cCvv,     setCCvv]     = useState("")
  const [cErr,     setCErr]     = useState({})

  // Bank
  const [selBank,  setSelBank]  = useState(null)
  const [bankQ,    setBankQ]    = useState("")

  // Wallet
  const [selWal,   setSelWal]   = useState(null)

  // EMI
  const [selEmi,   setSelEmi]   = useState(null)
  const [emiCard,  setEmiCard]  = useState("")

  // BNPL
  const [selBnpl,  setSelBnpl]  = useState(null)
  const [bnplPh,   setBnplPh]   = useState("")
  const [bnplErr,  setBnplErr]  = useState("")

  const validate = () => {
    if (method === "upi") {
      if (!selUpi && !upiId.includes("@")) { setUpiErr("Select a UPI app or enter a valid UPI ID (e.g. name@upi)"); return false }
      setUpiErr("")
      return true
    }
    if (method === "card") {
      const errs = {}
      if (!cName.trim())                          errs.name = "Cardholder name is required"
      if (cNum.replace(/\s/g,"").length < 16)    errs.num  = "Enter a valid 16-digit card number"
      if (!cExp.includes("/") || cExp.length < 7) errs.exp  = "Enter expiry in MM / YY format"
      if (cCvv.length < 3)                        errs.cvv  = "Enter valid CVV"
      setCErr(errs)
      return Object.keys(errs).length === 0
    }
    if (method === "netbanking") {
      if (!selBank) { alert("Please select a bank"); return false }
      return true
    }
    if (method === "wallet") {
      if (!selWal) { alert("Please select a wallet"); return false }
      return true
    }
    if (method === "emi") {
      if (!selEmi) { alert("Please choose an EMI tenure"); return false }
      if (emiCard.replace(/\s/g,"").length < 16) { alert("Enter a valid card number for EMI"); return false }
      return true
    }
    if (method === "bnpl") {
      if (!selBnpl) { alert("Please select a BNPL provider"); return false }
      if (bnplPh.replace(/\D/g,"").length < 10) { setBnplErr("Enter a valid 10-digit mobile number"); return false }
      setBnplErr("")
      return true
    }
    return true
  }

  const handlePay = () => {
    if (!validate()) return
    const methodLabel =
      method === "upi"        ? (selUpi ? UPI_APPS.find(u => u.id === selUpi)?.label : upiId) + " (UPI)"
      : method === "card"     ? "Debit/Credit Card"
      : method === "netbanking" ? BANKS.find(b => b.id === selBank)?.name + " (Net Banking)"
      : method === "wallet"   ? WALLETS.find(w => w.id === selWal)?.label + " Wallet"
      : method === "emi"      ? `EMI — ${selEmi} months`
      : BNPL.find(b => b.id === selBnpl)?.label + " (BNPL)"
    onPay({ methodLabel, price, gst: g, total: tot })
  }

  const filteredBanks = BANKS.filter(b =>
    b.name.toLowerCase().includes(bankQ.toLowerCase()) || b.abbr.toLowerCase().includes(bankQ.toLowerCase())
  )

  const Inp = ({ label, id, value, onChange, placeholder, type="text", maxLength, error, children }) => (
    <div style={{ marginBottom: 16 }}>
      <div className="pay-label">{label}</div>
      <input
        id={id}
        className={`pay-input${error ? " error" : ""}`}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
      />
      {error && <div className="err-text">{error}</div>}
      {children}
    </div>
  )

  return (
    <div>
      <div style={{ padding: "22px 28px 18px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={onBack} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border2}`, color: T.text2, width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                {METHOD_TABS.find(m => m.id === method)?.emoji}&nbsp; {METHOD_TABS.find(m => m.id === method)?.label} Details
              </div>
              <div style={{ fontSize: 11, color: T.text2 }}>₹{tot} · {plan.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.text3, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
      </div>

      <div style={{ padding: "20px 28px 8px" }}>

        {/* ── UPI ── */}
        {method === "upi" && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: ".6px", textTransform: "uppercase", marginBottom: 10 }}>Select UPI app</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
              {UPI_APPS.map(u => (
                <div key={u.id} className={`upi-tile${selUpi === u.id ? " sel" : ""}`} onClick={() => { setSelUpi(u.id); setUpiId("") }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: u.color + "22", border: `1px solid ${u.color}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 5px", fontSize: 12, fontWeight: 700, color: u.color }}>{u.icon}</div>
                  {u.label}
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", fontSize: 11, color: T.text3, margin: "12px 0 14px", position: "relative" }}>
              <span style={{ background: T.bg2, padding: "0 10px", position: "relative", zIndex: 1 }}>or enter UPI ID manually</span>
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: T.border2 }} />
            </div>
            <div className="pay-label">UPI ID / VPA</div>
            <input
              className={`pay-input${upiErr ? " error" : ""}`}
              placeholder="yourname@upi  ·  9876543210@paytm"
              value={upiId}
              onChange={e => { setUpiId(e.target.value); setSelUpi(null); setUpiErr("") }}
              style={{ marginBottom: 6 }}
            />
            {upiErr && <div className="err-text">{upiErr}</div>}
            <div style={{ fontSize: 10, color: T.text3, marginBottom: 16 }}>Supported: @paytm · @oksbi · @ybl · @upi · @axl · @okhdfcbank</div>
            <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.18)", borderRadius: 10, padding: "10px 14px", fontSize: 11, color: "#4ade80", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              🛡 Instant & zero-fee · Processed via NPCI UPI rails
            </div>
          </div>
        )}

        {/* ── CARD ── */}
        {method === "card" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {[["VISA","#1a1f71"],["Mastercard","#eb001b"],["RuPay","#118a2d"],["Amex","#016fcb"],["Diners","#004b87"]].map(([b,c]) => (
                <span key={b} style={{ background: c + "18", border: `1px solid ${c}44`, borderRadius: 7, padding: "4px 11px", fontSize: 10, fontWeight: 700, color: c }}>{b}</span>
              ))}
            </div>
            <Inp label="Cardholder name" id="c-name" value={cName} onChange={e => { setCName(e.target.value); setCErr(p => ({...p,name:""})) }} placeholder="Rohan Mehta" error={cErr.name} />
            <Inp label="Card number" id="c-num" value={cNum} onChange={e => { setCNum(fmtCard(e.target.value)); setCErr(p => ({...p,num:""})) }} placeholder="4242 4242 4242 4242" maxLength={19} error={cErr.num} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Inp label="Expiry" id="c-exp" value={cExp} onChange={e => { setCExp(fmtExp(e.target.value)); setCErr(p => ({...p,exp:""})) }} placeholder="MM / YY" maxLength={7} error={cErr.exp} />
              <Inp label="CVV" id="c-cvv" value={cCvv} onChange={e => { setCCvv(e.target.value); setCErr(p => ({...p,cvv:""})) }} placeholder="•••" type="password" maxLength={4} error={cErr.cvv} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.text2, cursor: "pointer", marginBottom: 16 }}>
              <input type="checkbox" defaultChecked style={{ accentColor: "#7c3aed" }} />
              Save card securely for future payments
            </label>
            <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border2}`, borderRadius: 10, padding: "10px 14px", fontSize: 11, color: T.text3, marginBottom: 4 }}>
              🔒 3D Secure authentication · Your card data is never stored on our servers
            </div>
          </div>
        )}

        {/* ── NET BANKING ── */}
        {method === "netbanking" && (
          <div>
            <input className="pay-input" placeholder="🔍  Search bank..." value={bankQ} onChange={e => setBankQ(e.target.value)} style={{ marginBottom: 10 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto", paddingRight: 2 }}>
              {filteredBanks.map(b => (
                <div key={b.id} className={`bank-row${selBank === b.id ? " sel" : ""}`} onClick={() => setSelBank(b.id)}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: b.color + "22", color: b.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{b.abbr.slice(0,3)}</div>
                  <span style={{ flex: 1 }}>{b.name}</span>
                  {selBank === b.id && <span style={{ color: "#a78bfa", fontSize: 14 }}>✓</span>}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginTop: 10, marginBottom: 4 }}>You'll be redirected to your bank's net banking portal</div>
          </div>
        )}

        {/* ── WALLET ── */}
        {method === "wallet" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
              {WALLETS.map(w => (
                <div key={w.id} className={`wallet-tile${selWal === w.id ? " sel" : ""}`} onClick={() => setSelWal(w.id)}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: w.color + "22", border: `1px solid ${w.color}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontSize: 13, fontWeight: 700, color: w.color }}>{w.icon}</div>
                  {w.label}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: T.text3, background: "rgba(255,255,255,0.03)", borderRadius: 9, padding: "10px 13px", marginBottom: 4 }}>
              ℹ You'll be redirected to your wallet app to authorize the payment
            </div>
          </div>
        )}

        {/* ── EMI ── */}
        {method === "emi" && (
          <div>
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 12 }}>Choose tenure · No-cost EMI on 3 & 6 months</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
              {EMI_TENURES.map(t => {
                const emi = Math.round(((yearly ? plan.yearly : plan.monthly) * 12 * (1 + t.rate / 100)) / t.months)
                return (
                  <div key={t.months} className={`emi-tile${selEmi === t.months ? " sel" : ""}`} onClick={() => setSelEmi(t.months)}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#a78bfa" }}>{t.months}<span style={{ fontSize: 11, color: T.text3 }}>mo</span></div>
                    <div style={{ fontSize: 11, color: T.text2, marginTop: 2 }}>₹{emi.toLocaleString("en-IN")}/mo</div>
                    <div style={{ fontSize: 9, color: selEmi === t.months ? "#4ade80" : T.text3, marginTop: 2, fontWeight: 700 }}>{t.label}</div>
                  </div>
                )
              })}
            </div>
            <div className="pay-label">Card number for EMI</div>
            <input className="pay-input" placeholder="4242 4242 4242 4242" value={emiCard} onChange={e => setEmiCard(fmtCard(e.target.value))} maxLength={19} style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 4 }}>Partners: HDFC · ICICI · SBI · Axis · Kotak · AMEX</div>
          </div>
        )}

        {/* ── BNPL ── */}
        {method === "bnpl" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
              {BNPL.map(b => (
                <div key={b.id} className={`wallet-tile${selBnpl === b.id ? " sel" : ""}`} onClick={() => setSelBnpl(b.id)}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: b.color + "22", border: `1px solid ${b.color}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontSize: 12, fontWeight: 700, color: b.color }}>{b.icon}</div>
                  {b.label}
                </div>
              ))}
            </div>
            <div className="pay-label">Registered mobile number</div>
            <input className={`pay-input${bnplErr ? " error" : ""}`} placeholder="+91 98765 43210" value={bnplPh} onChange={e => { setBnplPh(e.target.value); setBnplErr("") }} style={{ marginBottom: 6 }} />
            {bnplErr && <div className="err-text">{bnplErr}</div>}
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 4 }}>OTP will be sent to verify your BNPL account</div>
          </div>
        )}

        {/* Order mini-summary + pay button */}
        <div style={{ borderTop: `1px solid ${T.border}`, margin: "16px 0 0", padding: "16px 0 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.text2, marginBottom: 4 }}>
            <span>₹{price} base + ₹{g} GST</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: T.text }}>₹{tot}</span>
          </div>
          <button className="btn-primary" onClick={handlePay} style={{ marginTop: 12, fontSize: 15 }}>
            Pay ₹{tot} securely 🔒
          </button>
          <div style={{ textAlign: "center", fontSize: 10, color: T.text3, marginTop: 8, paddingBottom: 20 }}>
            256-bit SSL · Your data is encrypted · Razorpay PCI-DSS
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// MODAL STEP 4 — Processing with live timer
// ════════════════════════════════════════════════════════════════════════════
function StepProcessing({ payData, onDone }) {
  const [pct,     setPct]     = useState(3)
  const [stepIdx, setStepIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const ref = useRef(null)
  const elRef = useRef(null)

  useEffect(() => {
    elRef.current = setInterval(() => setElapsed(p => p + 1), 1000)
    const targets = [18, 38, 62, 84, 100]
    let cur = 3, step = 0
    ref.current = setInterval(() => {
      cur = Math.min(cur + Math.random() * 5 + 2, targets[step])
      setPct(Math.round(cur))
      if (cur >= targets[step] && step < PROC_STEPS.length - 1) {
        step++
        setStepIdx(step)
      }
      if (cur >= 100) {
        clearInterval(ref.current)
        clearInterval(elRef.current)
        setTimeout(onDone, 800)
      }
    }, 220)
    return () => { clearInterval(ref.current); clearInterval(elRef.current) }
  }, [onDone])

  return (
    <div style={{ padding: "36px 28px", textAlign: "center" }}>
      {/* Animated spinner ring */}
      <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 22px" }}>
        <div style={{ width: 80, height: 80, border: "3px solid rgba(167,139,250,0.12)", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "spin .75s linear infinite" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>{pct}%</div>
      </div>

      <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, fontWeight: 400, color: T.text, marginBottom: 6 }}>Processing payment…</h3>
      <div style={{ fontSize: 12, color: T.text2, marginBottom: 4 }}>{payData.methodLabel}</div>
      <div style={{ fontSize: 11, color: T.text3, marginBottom: 20 }}>⏱ {elapsed}s elapsed · do not close this window</div>

      {/* Progress bar */}
      <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#7c3aed,#a78bfa,#38bdf8)", backgroundSize: "200% 100%", animation: "shimmer 2s linear infinite", borderRadius: 99, transition: "width .4s ease" }} />
      </div>

      {/* Step list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left", marginBottom: 20 }}>
        {PROC_STEPS.map((s, i) => {
          const done   = i < stepIdx
          const active = i === stepIdx
          return (
            <div key={i} className={`proc-row${done ? " done" : active ? " active" : ""}`}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${done ? "#4ade80" : active ? "#a78bfa" : T.text3}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: done ? "#4ade80" : active ? "#a78bfa" : T.text3, flexShrink: 0 }}>
                {done ? "✓" : active ? <span style={{ animation: "spin .8s linear infinite", display: "inline-block" }}>◌</span> : "·"}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 10, opacity: .65 }}>{s.sub}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Security badges */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 10, color: T.text3, flexWrap: "wrap" }}>
        <span>🔒 SSL encrypted</span>
        <span>🛡 Razorpay PCI-DSS</span>
        <span>🏦 RBI compliant</span>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// MODAL STEP 5 — Success popup
// ════════════════════════════════════════════════════════════════════════════
function StepSuccess({ plan, yearly, payData, onClose }) {
  const now  = new Date()
  const next = new Date(now)
  yearly ? next.setFullYear(next.getFullYear() + 1) : next.setMonth(next.getMonth() + 1)
  const txId = useRef(genTxId()).current

  const rows = [
    { label: "Transaction ID",  val: `#${txId}` },
    { label: "Date & time",     val: now.toLocaleString("en-IN") },
    { label: "Plan activated",  val: plan.name, color: plan.color },
    { label: "Payment method",  val: payData.methodLabel },
    { label: "Base + GST",      val: `₹${payData.price} + ₹${payData.gst}` },
    { label: "Next billing",    val: fmtDate(next) },
    { label: "Total charged",   val: `₹${payData.total}`, color: "#4ade80" },
  ]

  return (
    <div style={{ padding: "32px 28px 28px", textAlign: "center" }}>
      {/* Animated check */}
      <div className="success-check-circle">
        <span style={{ fontSize: 30, animation: "pop .4s cubic-bezier(.34,1.56,.64,1) .2s both", display: "inline-block" }}>✅</span>
      </div>

      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, color: T.text, letterSpacing: "-.5px", marginBottom: 6 }}>
        Payment successful!
      </h2>
      <p style={{ fontSize: 14, color: T.text2, marginBottom: 22 }}>
        Welcome to CodeBuddy{" "}
        <span style={{ color: plan.color, fontWeight: 700 }}>{plan.name}</span> 🎉
      </p>

      {/* Receipt */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border2}`, borderRadius: 14, padding: 16, marginBottom: 20, textAlign: "left" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", letterSpacing: ".8px", textTransform: "uppercase", marginBottom: 10 }}>🧾 Payment receipt</div>
        {rows.map(r => (
          <div key={r.label} className="rcpt-row">
            <span>{r.label}</span>
            <span style={r.color ? { color: r.color } : {}}>{r.val}</span>
          </div>
        ))}
      </div>

      {/* Unlocked features */}
      <div style={{ background: plan.colorBg, border: `1px solid ${plan.colorBorder}`, borderRadius: 12, padding: 14, marginBottom: 22, textAlign: "left" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: plan.color, marginBottom: 8 }}>✦ Now unlocked on your account</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
          {Object.entries(plan.features).filter(([,v]) => v !== false).map(([k, v]) => (
            <div key={k} style={{ fontSize: 11, color: T.text2, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#4ade80", fontSize: 10 }}>✓</span>
              {typeof v === "string" ? v : k}
            </div>
          ))}
        </div>
      </div>

      <button className="btn-primary" onClick={onClose} style={{ fontSize: 15, marginBottom: 10 }}>
        Go to Dashboard →
      </button>
      <button onClick={onClose} style={{ background: "none", border: "none", color: T.text3, fontSize: 12, cursor: "pointer", fontFamily: "inherit", width: "100%", padding: "6px 0" }}>
        Close
      </button>
      <div style={{ fontSize: 10, color: T.text3, marginTop: 10 }}>
        Receipt emailed · Questions? support@codebuddy.dev
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// PAYMENT MODAL ORCHESTRATOR
// ════════════════════════════════════════════════════════════════════════════
function PaymentModal({ plan, yearly, onClose }) {
  // steps: "proceed" → "method" → "details" → "processing" → "success"
  const [step,      setStep]    = useState("proceed")
  const [method,    setMethod]  = useState("upi")
  const [payData,   setPayData] = useState(null)
  const handleDone = useCallback(() => setStep("success"), [])

  const closeOnOverlay = (e) => { if (e.target === e.currentTarget) onClose() }

  return (
    <div className="modal-overlay" onClick={closeOnOverlay}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {/* Step progress bar (not shown during processing/success) */}
        {!["processing","success"].includes(step) && (
          <div style={{ height: 3, background: T.border }}>
            <div style={{
              height: "100%", borderRadius: 99, transition: "width .4s ease",
              background: "linear-gradient(90deg,#7c3aed,#a78bfa)",
              width: step === "proceed" ? "33%" : step === "method" ? "66%" : "100%",
            }} />
          </div>
        )}

        {step === "proceed" && (
          <StepProceed plan={plan} yearly={yearly} onNext={() => setStep("method")} onClose={onClose} />
        )}
        {step === "method" && (
          <StepMethod plan={plan} yearly={yearly} method={method} setMethod={setMethod} onNext={() => setStep("details")} onBack={() => setStep("proceed")} onClose={onClose} />
        )}
        {step === "details" && (
          <StepDetails plan={plan} yearly={yearly} method={method} onPay={(d) => { setPayData(d); setStep("processing") }} onBack={() => setStep("method")} onClose={onClose} />
        )}
        {step === "processing" && payData && (
          <StepProcessing payData={payData} onDone={handleDone} />
        )}
        {step === "success" && payData && (
          <StepSuccess plan={plan} yearly={yearly} payData={payData} onClose={onClose} />
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN PRICING PAGE  (all original sections preserved)
// ════════════════════════════════════════════════════════════════════════════
const tickerItems = [
  "Aanya matched with Rohan · 2 min ago",
  "Sara shipped a project · 5 min ago",
  "Dev joined as Rust mentor · 8 min ago",
  "Priya found her co-founder · 12 min ago",
  "Karan matched with ML engineer · 15 min ago",
]

export default function PricingPage() {
  const [yearly,          setYearly]          = useState(false)
  const [activeFaq,       setActiveFaq]       = useState(null)
  const [ticker,          setTicker]          = useState(0)
  const [dark,            setDark]            = useState(true)
  const [token,           setToken]           = useState(false)
  const [showSignout,     setShowSignout]      = useState(false)
  // Payment modal
  const [modalPlan,       setModalPlan]       = useState(null)

  // Ticker rotation
  useEffect(() => {
    const id = setInterval(() => setTicker(p => (p + 1) % tickerItems.length), 3200)
    return () => clearInterval(id)
  }, [])

  // Auth check
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(j => setToken(j.token || false)).catch(() => {})
  }, [])

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/signout", { method: "POST" })
      const d   = await res.json()
      if (d.success) { setShowSignout(false); setToken(false) }
    } catch {}
  }

  const handlePlanClick = (plan) => {
    if (plan.monthly === null) { alert("Redirecting to sales team..."); return }
    if (plan.monthly === 0)   { alert("Creating your free account..."); return }
    setModalPlan(plan)
  }

  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{CSS}</style>

      {/* ── PAYMENT MODAL ── */}
      {modalPlan && (
        <PaymentModal plan={modalPlan} yearly={yearly} onClose={() => setModalPlan(null)} />
      )}

      {/* ── SIGN OUT MODAL ── */}
      {showSignout && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowSignout(false) }}>
          <div className="modal-box" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "36px 32px", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24 }}>🚪</div>
              <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, fontWeight: 400, color: T.text, marginBottom: 10 }}>Sign out of CodeBuddy?</h3>
              <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.65, marginBottom: 28 }}>You'll need to sign back in to access your matches and messages.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-sm-ghost" style={{ flex: 1, padding: "11px 0", fontSize: 13 }} onClick={() => setShowSignout(false)}>Cancel</button>
                <button className="btn-danger" onClick={handleSignout}>Yes, sign out</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Ambient glows ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-18%", left: "-8%", width: 650, height: 650, borderRadius: "50%", background: "radial-gradient(circle,hsla(259,70%,35%,0.11) 0%,transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: "-12%", right: "-8%", width: 550, height: 550, borderRadius: "50%", background: "radial-gradient(circle,hsla(300,60%,30%,0.07) 0%,transparent 65%)" }} />
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.018 }} xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>
      </div>

      {/* ── Ticker bar ── */}
      <div style={{ background: "rgba(124,58,237,0.1)", borderBottom: `1px solid ${T.surfaceBorder}`, padding: "7px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, position: "relative", zIndex: 99 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 7px #22c55e", flexShrink: 0, animation: "pulse3 2s ease-in-out infinite" }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa" }}>{tickerItems[ticker]}</span>
      </div>

      {/* ── Nav ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(16px,5vw,32px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", background: T.navBg, backdropFilter: "blur(10px)", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo />
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(14px,4vw,18px)", color: T.text, letterSpacing: "-.3px" }}>CodeBuddy</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── HERO ── */}
        <section style={{ maxWidth: 800, margin: "0 auto", padding: "clamp(50px,10vw,96px) clamp(16px,5vw,32px) 0", textAlign: "center" }}>
          <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 99, padding: "5px 14px", marginBottom: 24 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: ".8px", textTransform: "uppercase" }}>Simple Pricing</span>
          </div>
          <h1 className="fade-up hero-title" style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(36px,7vw,62px)", fontWeight: 400, letterSpacing: "-2px", lineHeight: 1.06, color: T.text, marginBottom: 18, animationDelay: ".05s" }}>
            Invest in the person<br />who <span style={{ fontStyle: "italic", color: "#a78bfa" }}>ships with you</span>
          </h1>
          <p className="fade-up" style={{ fontSize: "clamp(14px,3vw,16px)", color: T.text2, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 36px", animationDelay: ".1s" }}>
            Start free, upgrade when you're ready. Every plan includes core matching. No hidden fees, no dark patterns.
          </p>

          {/* Billing toggle */}
          <div className="fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 52, animationDelay: ".15s" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: !yearly ? T.text : T.text3 }}>Monthly</span>
            <button onClick={() => setYearly(p => !p)} style={{ width: 52, height: 28, borderRadius: 14, border: "none", cursor: "pointer", background: yearly ? "#7c3aed" : T.border2, position: "relative", transition: "background .3s" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: yearly ? 27 : 3, transition: "left .25s cubic-bezier(.34,1.56,.64,1)", boxShadow: "0 1px 4px rgba(0,0,0,.3)" }} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: yearly ? T.text : T.text3 }}>
              Yearly
              <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}>Save 20%</span>
            </span>
          </div>
        </section>

        {/* ── PLAN CARDS ── */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) 80px" }}>
          <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {PLANS.map((plan, i) => (
              <div
                key={plan.id}
                className={`plan-card fade-up${plan.id === "pro" ? " featured" : ""}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Glow blob */}
                <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: `radial-gradient(circle,${plan.colorBg.replace("0.08","0.15")} 0%,transparent 70%)`, pointerEvents: "none" }} />

                {plan.badge && (
                  <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "white", fontSize: 9, fontWeight: 700, padding: "4px 14px", borderRadius: "0 0 10px 10px", letterSpacing: "1px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {plan.badge}
                  </div>
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

                {/* Features */}
                <div style={{ marginBottom: 22, display: "flex", flexDirection: "column", gap: 9 }}>
                  {Object.entries(plan.features).slice(0, 7).map(([feat, val]) => (
                    <div key={feat} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                      {val === true  ? <span style={{ color: "#4ade80", fontSize: 13, flexShrink: 0 }}>✓</span>
                       : val === false ? <span style={{ color: T.text3, fontSize: 13, flexShrink: 0 }}>—</span>
                       : <span style={{ color: plan.color, fontSize: 13, flexShrink: 0 }}>✦</span>}
                      <span style={{ color: val === false ? T.text3 : T.text2 }}>
                        {feat}: {typeof val === "string" ? <strong style={{ color: T.text }}>{val}</strong> : ""}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  className={plan.ctaStyle === "primary" ? "btn-primary" : "btn-ghost"}
                  onClick={() => handlePlanClick(plan)}
                  style={{ textAlign: "center" }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURE COMPARISON TABLE ── */}
        <section className="comparison-table" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(28px,5vw,40px)", color: T.text, letterSpacing: "-1px" }}>
              Full feature <span style={{ fontStyle: "italic", color: "#a78bfa" }}>comparison</span>
            </h2>
          </div>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "220px repeat(4,1fr)", background: "rgba(124,58,237,0.05)", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ padding: "16px" }} />
              {PLANS.map(plan => (
                <div key={plan.id} style={{ padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: plan.color, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ fontSize: 13, color: T.text2 }}>
                    {plan.monthly !== null ? (yearly ? `₹${plan.yearly}` : plan.monthly === 0 ? "Free" : `₹${plan.monthly}`) : "Custom"}/mo
                  </div>
                </div>
              ))}
            </div>
            {/* Rows */}
            {FEATURE_ROWS.map((feat, i) => (
              <div key={feat} className="feature-row" style={{ gridTemplateColumns: "220px repeat(4,1fr)", borderBottom: i < FEATURE_ROWS.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div className="feature-cell" style={{ justifyContent: "flex-start" }}>{feat}</div>
                {PLANS.map(plan => (
                  <div key={plan.id} className="feature-cell">
                    <CheckMark val={plan.features[feat]} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(26px,5vw,38px)", color: T.text, letterSpacing: "-1px" }}>
              Builders who <span style={{ fontStyle: "italic", color: "#a78bfa" }}>upgraded</span>
            </h2>
          </div>
          <div className="testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="fade-up" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24, animationDelay: `${i * 0.08}s` }}>
                <div style={{ fontSize: 26, color: "#7c3aed", marginBottom: 12, fontFamily: "Georgia,serif", opacity: .5 }}>"</div>
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
                <span style={{ color: T.text3, fontSize: 18, transition: "transform .25s", transform: activeFaq === i ? "rotate(45deg)" : "none", flexShrink: 0 }}>+</span>
              </button>
              {activeFaq === i && (
                <div style={{ padding: "0 20px 18px", fontSize: 13, color: T.text2, lineHeight: 1.75, animation: "fadeUp .25s ease both" }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* ── ENTERPRISE CTA ── */}
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) 100px" }}>
          <div style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.07),rgba(124,58,237,0.07))", border: "1px solid rgba(245,158,11,0.18)", borderRadius: 26, padding: "clamp(36px,6vw,56px) clamp(24px,5vw,52px)", display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>Enterprise</div>
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(24px,5vw,36px)", color: T.text, letterSpacing: "-.8px", lineHeight: 1.1, marginBottom: 12 }}>
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
              <button style={{ marginTop: 8, background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", color: "white", padding: "12px 24px", borderRadius: 11, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, boxShadow: "0 6px 20px rgba(245,158,11,0.28)", transition: "all .2s" }}>
                Talk to sales →
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
