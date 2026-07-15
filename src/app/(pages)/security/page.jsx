"use client"
import Link from "next/link";
import { useState } from "react";
import { useThemeStore } from "../../../../store/themeprovider";
import {
  Lock, Shield, Key, Server, Eye, ShieldAlert, Landmark, Search, ClipboardList,
  Mail, Sparkles, CheckCircle2, XCircle, ArrowRight, ExternalLink, ChevronDown, AlertCircle,
} from "lucide-react";

const VULN_REPORT_API_URL = "/api/security_vulnerabilites";

const VULN_TYPES = [
  "Authentication / Authorization",
  "Data Exposure / PII Leak",
  "Injection (SQL, XSS, etc.)",
  "Broken Access Control",
  "Other",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_DESCRIPTION_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 5000;

const iconSize = (min, max, vw = 3.2) => ({
  width: `clamp(${min}px, ${vw}vw, ${max}px)`,
  height: `clamp(${min}px, ${vw}vw, ${max}px)`,
  flexShrink: 0,
});

const RADIUS = { control: 8, pill: 6, card: 10, modal: 14 };
const ACCENT = "#7c3aed";
const ERROR_COLOR = "#f87171";

const BtnLabel = ({ children, Icon = ArrowRight, min = 11, max = 14 }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
    {children}
    <Icon style={iconSize(min, max)} />
  </span>
);

function validateReport({ type, description, email }) {
  const errors = {};

  if (!VULN_TYPES.includes(type)) {
    errors.type = "Please select a vulnerability type.";
  }

  const trimmedDescription = description.trim();
  if (trimmedDescription.length === 0) {
    errors.description = "Please describe the vulnerability.";
  } else if (trimmedDescription.length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `Please provide at least ${MIN_DESCRIPTION_LENGTH} characters (currently ${trimmedDescription.length}).`;
  } else if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description is too long (max ${MAX_DESCRIPTION_LENGTH} characters).`;
  }

  const trimmedEmail = email.trim();
  if (trimmedEmail.length > 0 && !EMAIL_RE.test(trimmedEmail)) {
    errors.email = "Please enter a valid email address.";
  }

  return errors;
}

export default function SecurityPage() {
  const { dark, toggleDark } = useThemeStore();
  const [reportExpanded, setReportExpanded] = useState(false);
  const [formState, setFormState] = useState({ type: "", description: "", email: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [submitError, setSubmitError] = useState("");

  const T = dark ? {
    bg: "#07070f", bg2: "#0d0d1a",
    border: "rgba(255,255,255,0.1)", border2: "rgba(255,255,255,0.14)",
    text: "#e4e4f0", text2: "#8888aa", text3: "#44445a",
    card: "rgba(255,255,255,0.025)",
    navBg: "rgba(7,7,15,0.92)",
    surfaceA: "rgba(124,58,237,0.06)", surfaceBorder: "rgba(139,92,246,0.18)",
    aiBg: "rgba(60,40,140,0.12)", aiBorder: "rgba(139,92,246,0.18)",
    greenBg: "rgba(34,197,94,0.08)", greenBorder: "rgba(34,197,94,0.2)", greenText: "#4ade80",
    input: "rgba(255,255,255,0.04)", inputBorder: "rgba(255,255,255,0.14)",
  } : {
    bg: "#f4f4f8", bg2: "#ffffff",
    border: "rgba(0,0,0,0.09)", border2: "rgba(0,0,0,0.13)",
    text: "#18182c", text2: "#555570", text3: "#9090b0",
    card: "#ffffff",
    navBg: "rgba(244,244,248,0.95)",
    surfaceA: "rgba(124,58,237,0.05)", surfaceBorder: "rgba(124,58,237,0.15)",
    aiBg: "rgba(124,58,237,0.06)", aiBorder: "rgba(124,58,237,0.18)",
    greenBg: "rgba(34,197,94,0.09)", greenBorder: "rgba(34,197,94,0.28)", greenText: "#16a34a",
    input: "#ffffff", inputBorder: "rgba(0,0,0,0.12)",
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)"};border-radius:99px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    .fade-up{animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both}
    .btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:9px 18px;border-radius:${RADIUS.control}px;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:border-color 0.15s ease,color 0.15s ease}
    .btn-ghost:hover{border-color:${T.border2};color:${T.text}}
    .btn-icon{background:transparent;border:1px solid ${T.border};color:${T.text3};padding:8px;border-radius:${RADIUS.control}px;cursor:pointer;transition:border-color 0.15s ease,color 0.15s ease;display:flex;align-items:center;justify-content:center}
    .btn-icon:hover{border-color:${T.border2};color:${T.text}}
    .btn-primary{background:${ACCENT};border:1px solid ${ACCENT};color:white;padding:11px 24px;border-radius:${RADIUS.control}px;font-family:'Inter',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:filter 0.15s ease}
    .btn-primary:hover{filter:brightness(1.1)}
    .btn-primary:disabled{opacity:0.6;cursor:not-allowed;filter:none}
    .section-block{padding:32px 0;border-bottom:1px solid ${T.border}}
    .section-block:last-child{border-bottom:none}
    .nav-link{font-size:14px;color:${T.text3};cursor:pointer;padding:8px 12px;border-radius:${RADIUS.control}px;transition:color 0.15s ease,background 0.15s ease,border-color 0.15s ease;text-decoration:none;display:flex;align-items:center;gap:8px;border-left:2px solid transparent;background:none;border-top:none;border-right:none;border-bottom:none;width:100%;text-align:left;font-family:'Inter',sans-serif}
    .nav-link:hover{color:${T.text};background:${T.surfaceA};border-left-color:rgba(124,58,237,0.3)}
    .sec-input{width:100%;background:${T.input};border:1px solid ${T.inputBorder};border-radius:${RADIUS.control}px;padding:11px 14px;color:${T.text};font-family:'Inter',sans-serif;font-size:13px;outline:none;transition:border-color 0.15s ease;resize:vertical}
    .sec-input:focus{border-color:rgba(124,58,237,0.5)}
    .sec-input::placeholder{color:${T.text3}}
    .sec-input.has-error{border-color:${ERROR_COLOR}}
    .sec-select{width:100%;background:${T.input};border:1px solid ${T.inputBorder};border-radius:${RADIUS.control}px;padding:11px 40px 11px 14px;color:${T.text};font-family:'Inter',sans-serif;font-size:13px;outline:none;appearance:none;-webkit-appearance:none;-moz-appearance:none;cursor:pointer;transition:border-color 0.15s ease}
    .sec-select:focus{border-color:rgba(124,58,237,0.5)}
    .sec-select.has-error{border-color:${ERROR_COLOR}}
    .sec-select:invalid{color:${T.text3}}
    .select-wrap{position:relative}
    .select-chevron{position:absolute;right:14px;top:50%;transform:translateY(-50%);pointer-events:none;color:${T.text3}}
    .field-error{display:flex;align-items:center;gap:5px;font-size:11.5px;color:${ERROR_COLOR};margin-top:6px}
    .char-count{font-size:11px;color:${T.text3};text-align:right;margin-top:4px}
    .status-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;animation:pulse 2.5s ease-in-out infinite;flex-shrink:0}
    @media(max-width:768px){.layout{grid-template-columns:1fr!important}.sidebar{display:none!important}.pillar-grid{grid-template-columns:1fr!important}}
  `;

  const Logo = () => (
    <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill="#1a0a6a"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff"/>
    </svg>
  );

  const updateField = (key) => (e) => {
    const value = e.target.value;
    setFormState((p) => ({ ...p, [key]: value }));
    // Clear that field's error as soon as the user starts fixing it
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitStatus === "submitting") return;

    const errors = validateReport(formState);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitStatus("idle");
      setSubmitError("");
      return;
    }

    setSubmitStatus("submitting");
    setSubmitError("");
    try {
      const res = await fetch(VULN_REPORT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formState.type,
          description: formState.description.trim(),
          email: formState.email.trim(),
          submittedAt: new Date().toISOString(),
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok || result?.success === false) {
        // result.error may sometimes come back as an object (e.g. a raw
        // Supabase error) instead of a string — guard against that so we
        // never end up throwing/displaying "[object Object]".
        const rawError = result?.error;
        const errorMessage =
          typeof rawError === "string"
            ? rawError
            : rawError?.message || `Request failed with status ${res.status}`;
        throw new Error(errorMessage);
      }

      setSubmitted(true);
      setSubmitStatus("idle");
    } catch (err) {
      setSubmitStatus("error");
      setSubmitError(err.message || "Something went wrong. Please try again or email us directly.");
    }
  };

  const scrollToSection = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pillars = [
    { Icon: Lock, title: "Encryption at Rest", desc: "All user data, profile information, and messages are encrypted at rest using AES-256. Database access is restricted and audited." },
    { Icon: Shield, title: "TLS in Transit", desc: "All communication between your browser and CodeBuddy servers is encrypted via TLS 1.3. No data is transmitted over unencrypted channels." },
    { Icon: Key, title: "Password Security", desc: "Passwords are hashed using bcrypt with a high work factor. We never store plaintext passwords. Breached password detection runs at sign-up." },
    { Icon: Server, title: "Infrastructure", desc: "Hosted on Supabase (Postgres) and Vercel with automatic patching, DDoS protection, and isolated compute environments." },
    { Icon: Eye, title: "Access Controls", desc: "Role-based access control limits who on our team can access what. All internal access is logged and reviewed quarterly." },
    { Icon: ShieldAlert, title: "Incident Response", desc: "We maintain a written incident response plan. Material breaches are disclosed to affected users within 72 hours of discovery." },
  ];

  const sidebarLinks = [
    [Landmark, "Security Pillars", "pillars"],
    [Search, "Vulnerability Disclosure", "disclosure"],
    [ClipboardList, "Responsible Disclosure", "guidelines"],
    [Mail, "Report a Vulnerability", "report"],
  ];

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{css}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "30%", right: "-8%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.09)" : "hsla(259,70%,60%,0.045)"} 0%,transparent 65%)` }} />
      </div>

      <nav style={{ background: T.navBg, backdropFilter: "blur(28px)", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(16px,5vw,32px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Logo />
          <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 17, color: T.text }}>CodeBuddy</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1060, margin: "0 auto", padding: "clamp(32px,6vw,64px) clamp(16px,5vw,32px)" }}>

        <div className="fade-up" style={{ marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: RADIUS.pill, padding: "4px 13px", marginBottom: 18 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace" }}>Trust & Safety</span>
          </div>
          <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: "clamp(32px,7vw,52px)", color: T.text, letterSpacing: "-1.4px", lineHeight: 1.08, marginBottom: 14 }}>
            Security at <span style={{ color: "#a78bfa" }}>CodeBuddy</span>
          </h1>
          <p style={{ fontSize: 14, color: T.text2 }}>Last updated: <strong style={{ color: T.text }}>June 1, 2026</strong></p>
        </div>

        <div className="fade-up" style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: RADIUS.card, padding: "14px 20px", marginBottom: 40, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div className="status-dot" />
          <span style={{ fontSize: 13, fontWeight: 600, color: T.greenText }}>All systems operational</span>
          <span style={{ fontSize: 12, color: T.text3, marginLeft: 4 }}>· Last checked May 28, 2026 at 12:00 UTC</span>
          <a href="https://status.codebuddy.dev" target="_blank" rel="noreferrer" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#a78bfa", textDecoration: "none" }}>
            View status page <ExternalLink style={iconSize(11, 12, 2)} />
          </a>
        </div>

        <div className="layout" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 40 }}>

          <div className="sidebar" style={{ position: "sticky", top: 80, alignSelf: "start" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12, fontFamily: "'JetBrains Mono',monospace" }}>On this page</div>
            {sidebarLinks.map(([Icon, label, id]) => (
              <a key={label} href={`#${id}`} className="nav-link" onClick={scrollToSection(id)}>
                <Icon style={iconSize(13, 14, 2)} />{label}
              </a>
            ))}
            <div style={{ marginTop: 24, padding: "14px 16px", background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: RADIUS.card }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#a78bfa", marginBottom: 6 }}>
                <Lock style={iconSize(11, 12, 2)} /> Secure contact
              </div>
              <p style={{ fontSize: 11, color: T.text3, lineHeight: 1.55 }}>
                <a href="mailto:security@codebuddy.dev" style={{ color: "inherit", textDecoration: "none" }}>security@codebuddy.dev</a>
              </p>
            </div>
          </div>

          <div>
            <div id="pillars" className="section-block fade-up" style={{ scrollMarginTop: 80 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <Landmark style={{ ...iconSize(19, 21, 3), color: "#a78bfa" }} />
                <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: "clamp(20px,4vw,26px)", color: T.text, letterSpacing: "-0.5px" }}>Security Pillars</h2>
              </div>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.8, marginBottom: 20 }}>Security is built into every layer of CodeBuddy — not bolted on. Here's how we protect your data and your identity:</p>
              <div className="pillar-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                {pillars.map((p, i) => (
                  <div key={i} className="fade-up" style={{ animationDelay: `${i * 0.05}s`, background: T.card, border: `1px solid ${T.border}`, borderRadius: RADIUS.card, padding: "18px 18px" }}>
                    <div style={{ width: 38, height: 38, borderRadius: RADIUS.control, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                      <p.Icon style={{ ...iconSize(17, 18, 2.6), color: "#a78bfa" }} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 6 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.65 }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div id="disclosure" className="section-block fade-up" style={{ animationDelay: "0.1s", scrollMarginTop: 80 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <Search style={{ ...iconSize(19, 21, 3), color: "#a78bfa" }} />
                <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: "clamp(20px,4vw,26px)", color: T.text, letterSpacing: "-0.5px" }}>Vulnerability Disclosure</h2>
              </div>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.8, marginBottom: 16 }}>We believe the security community makes the internet safer for everyone. If you discover a vulnerability in CodeBuddy, we want to hear from you.</p>
              <div style={{ background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: RADIUS.card, padding: "16px 18px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, color: "#a78bfa", marginBottom: 6, letterSpacing: "1px", fontFamily: "'JetBrains Mono',monospace" }}>
                  <Sparkles style={iconSize(11, 12, 2)} /> OUR COMMITMENT
                </div>
                <p style={{ fontSize: 13, color: dark ? "#b0a8d8" : "#6b5b9e", lineHeight: 1.65 }}>We will acknowledge your report within 48 hours, keep you updated on our progress, and credit you publicly (if you wish) when the vulnerability is patched. We will not pursue legal action against researchers who act in good faith.</p>
              </div>
            </div>

            <div id="guidelines" className="section-block fade-up" style={{ animationDelay: "0.14s", scrollMarginTop: 80 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <ClipboardList style={{ ...iconSize(19, 21, 3), color: "#a78bfa" }} />
                <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: "clamp(20px,4vw,26px)", color: T.text, letterSpacing: "-0.5px" }}>Responsible Disclosure Guidelines</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "In scope", Icon: CheckCircle2, items: ["Authentication & authorization issues", "Data exposure or PII leakage", "Remote code execution or injection", "Broken access controls between users", "XSS in authenticated flows"], color: T.greenText, bg: T.greenBg, border: T.greenBorder },
                  { label: "Out of scope", Icon: XCircle, items: ["Social engineering or phishing attacks", "Physical security issues", "Denial of service (DoS/DDoS)", "Automated scanning without prior approval", "Vulnerabilities in third-party services we don't control"], color: "#f87171", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
                ].map((section, si) => (
                  <div key={si} style={{ background: section.bg, border: `1px solid ${section.border}`, borderRadius: RADIUS.card, padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: section.color, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "'JetBrains Mono',monospace" }}>
                      <section.Icon style={iconSize(13, 14, 2)} />{section.label}
                    </div>
                    {section.items.map((item, i) => (
                      <div key={i} style={{ fontSize: 13, color: T.text2, padding: "4px 0", display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <ArrowRight style={{ ...iconSize(12, 13, 2), color: section.color, marginTop: 2 }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div id="report" className="section-block fade-up" style={{ animationDelay: "0.18s", scrollMarginTop: 80 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <Mail style={{ ...iconSize(19, 21, 3), color: "#a78bfa" }} />
                <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: "clamp(20px,4vw,26px)", color: T.text, letterSpacing: "-0.5px" }}>Report a Vulnerability</h2>
              </div>
              {!submitted ? (
                <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: 6, fontFamily: "'JetBrains Mono',monospace" }}>Vulnerability Type</label>
                    <div className="select-wrap">
                      <select
                        className={`sec-select${fieldErrors.type ? " has-error" : ""}`}
                        value={formState.type}
                        onChange={updateField("type")}
                        aria-invalid={!!fieldErrors.type}
                      >
                        <option value="" disabled>Select a type...</option>
                        {VULN_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <ChevronDown className="select-chevron" style={iconSize(14, 16, 2.4)} />
                    </div>
                    {fieldErrors.type && (
                      <div className="field-error"><AlertCircle style={iconSize(12, 13, 2)} />{fieldErrors.type}</div>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: 6, fontFamily: "'JetBrains Mono',monospace" }}>Description & Steps to Reproduce</label>
                    <textarea
                      className={`sec-input${fieldErrors.description ? " has-error" : ""}`}
                      rows={5}
                      maxLength={MAX_DESCRIPTION_LENGTH}
                      placeholder="Describe the vulnerability and how to reproduce it. Include URLs, affected endpoints, or screenshots if possible."
                      value={formState.description}
                      onChange={updateField("description")}
                      aria-invalid={!!fieldErrors.description}
                    />
                    <div className="char-count">{formState.description.trim().length}/{MAX_DESCRIPTION_LENGTH}</div>
                    {fieldErrors.description && (
                      <div className="field-error"><AlertCircle style={iconSize(12, 13, 2)} />{fieldErrors.description}</div>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: 6, fontFamily: "'JetBrains Mono',monospace" }}>Your Email (optional, for follow-up)</label>
                    <input
                      className={`sec-input${fieldErrors.email ? " has-error" : ""}`}
                      type="email"
                      placeholder="researcher@example.com"
                      value={formState.email}
                      onChange={updateField("email")}
                      aria-invalid={!!fieldErrors.email}
                    />
                    {fieldErrors.email && (
                      <div className="field-error"><AlertCircle style={iconSize(12, 13, 2)} />{fieldErrors.email}</div>
                    )}
                  </div>

                  {submitStatus === "error" && (
                    <div style={{ fontSize: 12, color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: RADIUS.control, padding: "9px 12px" }}>
                      {submitError}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <button type="submit" className="btn-primary" style={{ padding: "11px 24px" }} disabled={submitStatus === "submitting"}>
                      {submitStatus === "submitting" ? "Submitting..." : <BtnLabel>Submit report</BtnLabel>}
                    </button>
                    <span style={{ fontSize: 11, color: T.text3 }}>Or email directly: security@codebuddy.dev</span>
                  </div>
                </form>
              ) : (
                <div style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: RADIUS.card, padding: "28px 24px", textAlign: "center" }}>
                  <CheckCircle2 style={{ ...iconSize(30, 34, 5), color: T.greenText, margin: "0 auto 12px", display: "block" }} />
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