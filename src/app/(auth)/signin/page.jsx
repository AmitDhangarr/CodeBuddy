"use client"
import { useState, useCallback, useRef } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useThemeStore } from "../../../../store/themeprovider";
import { validateLoginForm, validateSignupForm } from "../../../lib/validation";
import { useSignupStore } from "../../../../store/UsesignupStore";
import { Github, AlertTriangle, AlertCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

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

const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29A11.96 11.96 0 000 12c0 1.93.46 3.76 1.29 5.38l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
  </svg>
);

const DARK = {
  bg: "#060608", bg2: "#0e0e18", bg3: "#14141f",
  border: "rgba(255,255,255,0.09)", border2: "rgba(255,255,255,0.14)",
  text: "#e2e2ef", text2: "#9090b0", text3: "#555570",
  card: "rgba(255,255,255,0.025)", cardHover: "rgba(255,255,255,0.045)",
  input: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.11)",
  shadow: "none",
  navBg: "rgba(6,6,8,0.9)",
  skillHaveBg: "rgba(110,224,110,0.1)", skillHaveBorder: "rgba(110,224,110,0.25)", skillHaveText: "#7de87d",
  skillNeedBg: "rgba(120,120,255,0.1)", skillNeedBorder: "rgba(120,120,255,0.25)", skillNeedText: "#9898ff",
  logoFill: "#1a0a6a",
};
const LIGHT = {
  bg: "#f5f5f9", bg2: "#ffffff", bg3: "#eeeef5",
  border: "rgba(0,0,0,0.1)", border2: "rgba(0,0,0,0.16)",
  text: "#1a1a2e", text2: "#555570", text3: "#9090b0",
  card: "#ffffff", cardHover: "#f8f8fc",
  input: "#ffffff", inputBorder: "rgba(0,0,0,0.13)",
  shadow: "none",
  navBg: "rgba(245,245,249,0.95)",
  skillHaveBg: "rgba(34,197,94,0.1)", skillHaveBorder: "rgba(34,197,94,0.3)", skillHaveText: "#16a34a",
  skillNeedBg: "rgba(99,102,241,0.1)", skillNeedBorder: "rgba(99,102,241,0.3)", skillNeedText: "#4f46e5",
  logoFill: "#7c3aed",
};

const STATIC_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{border-radius:99px}
  input,textarea,select{font-family:'Inter',sans-serif}
  textarea{resize:none}

  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}

  @keyframes slideInFromRight{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
  @keyframes slideInFromLeft{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}

  .slide-in-right{animation:slideInFromRight 0.28s cubic-bezier(0.16,1,0.3,1) both}
  .slide-in-left{animation:slideInFromLeft 0.28s cubic-bezier(0.16,1,0.3,1) both}

  .fade-up{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both}
  .fade-in{animation:fadeIn 0.3s ease both}
  .spin{animation:spin 0.9s linear infinite;display:inline-block}

  .btn-primary{background:#7c3aed;border:1px solid #7c3aed;color:white;padding:11px 24px;border-radius:8px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:filter 0.15s ease;letter-spacing:-0.1px}
  .btn-primary:hover{filter:brightness(1.1)}
  .btn-primary:active{filter:brightness(0.95)}
  .btn-primary:disabled{opacity:0.5;cursor:not-allowed}
  .btn-icon{background:transparent;border-radius:8px;cursor:pointer;transition:filter 0.15s ease;display:flex;align-items:center;justify-content:center}
  .social-btn{padding:10px;border-radius:8px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:border-color 0.15s ease,background 0.15s ease;display:flex;align-items:center;justify-content:center;gap:9px;flex:1}
  .social-btn:hover{filter:brightness(1.08)}
  .divider{height:1px;margin:18px 0}
  .card-flat{border-radius:10px}

  .auth-input{border-radius:8px;font-size:14px;outline:none;transition:border-color 0.15s ease,background 0.15s ease;width:100%;font-family:'Inter',sans-serif;padding:10px 14px;border-width:1px;border-style:solid}
  .auth-input:focus{border-color:rgba(124,58,237,0.6) !important}
  .auth-input::placeholder{opacity:0.5}

  .eye-btn{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;border-radius:6px;transition:opacity 0.15s;opacity:0.45}
  .eye-btn:hover{opacity:0.9}

  @keyframes shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-6px)}30%{transform:translateX(6px)}45%{transform:translateX(-5px)}60%{transform:translateX(5px)}75%{transform:translateX(-3px)}90%{transform:translateX(3px)}}
  .shake{animation:shake 0.45s cubic-bezier(0.36,0.07,0.19,0.97) both}

  @keyframes errBannerIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
  .auth-err-banner{animation:errBannerIn 0.2s ease both;border-radius:8px;padding:10px 14px;font-size:12px;font-weight:500;display:flex;align-items:center;gap:8px;margin-bottom:14px;border-width:1px;border-style:solid}

  .tab-indicator{position:absolute;top:4px;bottom:4px;border-radius:8px;transition:left 0.2s ease,width 0.2s ease}

  @media (max-width:768px){
    .social-btn{font-size:12px;padding:9px}
    .btn-primary{font-size:12px;padding:9px 16px}
  }
  @media (max-width:480px){
    .social-btn span{display:none}
    .auth-back-btn{font-size:12px}
  }
`;

const EyeIcon = ({ open, color }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const Logo = ({ fill }) => (
  <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill={fill} />
    <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff" />
  </svg>
);

const ErrMsg = ({ msg }) =>
  msg ? (
    <div style={{ fontSize: 11, color: "#f87171", marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
      <AlertTriangle style={iconSize(11, 11)} />
      {msg}
    </div>
  ) : null;

const Field = ({ label, id, type = "text", placeholder, value, onChange, error, hint, prefix, T, showToggle, showPassword, onTogglePassword }) => (
  <div style={{ marginBottom: 18 }}>
    <label htmlFor={id} style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>{label}</label>
    <div style={{ position: "relative" }}>
      {prefix && (
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: T.text3, pointerEvents: "none" }}>@</span>
      )}
      <input
        className="auth-input"
        id={id}
        type={showToggle ? (showPassword ? "text" : "password") : type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : "off"}
        style={{
          paddingLeft: prefix ? "28px" : "14px",
          paddingRight: showToggle ? "38px" : "14px",
          background: T.input,
          borderColor: error ? "rgba(248,113,113,0.5)" : T.inputBorder,
          color: T.text,
        }}
      />
      {showToggle && (
        <button
          type="button"
          className="eye-btn"
          onClick={onTogglePassword}
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <EyeIcon open={showPassword} color={T.text} />
        </button>
      )}
    </div>
    <ErrMsg msg={error} />
    {hint && !error && <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{hint}</div>}
  </div>
);

function Signin() {
  const router = useRouter();
   const { dark, toggleDark } = useThemeStore();
  const [authTab, setAuthTab] = useState("signin");
  const [slideDir, setSlideDir] = useState(null);
  const [formData, setFormData] = useState({ email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cardShake, setCardShake] = useState(false);
  const updateForm = useSignupStore((state) => state.updateForm);

  const cardRef = useRef(null);
  const T = dark ? DARK : LIGHT;

  const upd = useCallback((k, v) => {
    setFormData(p => ({ ...p, [k]: v }));
    setErrors(p => { const n = { ...p }; delete n[k]; return n; });
    setAuthError(null);
  }, []);

  const triggerShake = () => {
    setCardShake(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setCardShake(true));
    });
    setTimeout(() => setCardShake(false), 500);
  };

  const switchTab = (t) => {
    if (t === authTab) return;
    setSlideDir(t === "signup" ? "right" : "left");
    setAuthTab(t);
    setErrors({});
    setAuthError(null);
    setShowPassword(false);
    setShowConfirm(false);
    setTimeout(() => setSlideDir(null), 300);
  };

  const handleTabMouseLeave = (t) => {
    if (t === "signup") router.push("/signup");
    if (t === "signin") router.push("/signin");
  };

  const handleSubmission = async (formData) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Auth error:", err);
      return { success: false, message: "Network error. Please check your connection." };
    }
  };

  const validateAuth = () => {
    const e =
      authTab === "signup"
        ? validateSignupForm({ ...formData, termsAccepted })
        : validateLoginForm(formData);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAuth = async (e) => {
    e?.preventDefault?.();
    if (!validateAuth()) return;

    if (authTab === "signup") {
      updateForm({
        email: formData.email,
        password: formData.password,
        confirm: formData.confirm,
      });
      router.push("/onboarding");
      return;
    }

    setSubmitting(true);
    setAuthError(null);

    const result = await handleSubmission({
      email: formData.email.trim(),
      password: formData.password,
    });

    if (result?.success === true) {
      setTimeout(() => {
        setSubmitting(false);
        router.push("/dashboard");
      }, 800);
      return;
    }

    setSubmitting(false);
    const msg = result?.message || "Something went wrong. Please try again.";

    if (/invalid.*(login|credentials|password|email)/i.test(msg) || /wrong.*password/i.test(msg)) {
      setErrors(p => ({ ...p, password: "Incorrect password" }));
    } else if (/user.*not.*found|no.*account|email.*not.*exist/i.test(msg)) {
      setErrors(p => ({ ...p, email: "No account found with this email" }));
    } else if (/email.*not.*confirmed/i.test(msg)) {
      setAuthError("Please confirm your email before signing in.");
    } else {
      setAuthError(msg);
    }

    triggerShake();
  };

  const handleOAuthGoogle = async () => {
    localStorage.setItem("Oauth", "Google");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/password_verification` },
    });
  };

  const handleOAuthGithub = async () => {
    localStorage.setItem("Oauth", "Github");
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/password_verification` },
    });
  };

  const tabIndicatorStyle = {
    left: authTab === "signin" ? "4px" : "calc(50% + 2px)",
    width: "calc(50% - 6px)",
    background: dark ? "rgba(255,255,255,0.07)" : "#ffffff",
    boxShadow: dark ? "none" : "0 1px 4px rgba(0,0,0,0.08)",
  };

  const slideClass = slideDir === "right" ? "slide-in-right" : slideDir === "left" ? "slide-in-left" : "";

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{STATIC_CSS}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.1)" : "hsla(259,70%,60%,0.06)"} 0%,transparent 65%)` }} />
      </div>

      <nav style={{ padding: "0 clamp(16px,5vw,28px)", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, background: T.navBg, backdropFilter: "blur(20px)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <Logo fill={T.logoFill} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, letterSpacing: "-0.3px", fontSize: "clamp(14px,4vw,16px)", color: T.text }}>CodeBuddy</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="auth-back-btn"
            onClick={() => router.back()}
            style={{ background: "none", border: "none", cursor: "pointer", color: T.text3, fontSize: 13, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            <ArrowLeft style={iconSize(12, 12)} /> Back
          </button>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(20px,5vw,40px) 20px", position: "relative", zIndex: 1 }}>
        <div className="fade-up" style={{ width: "100%", maxWidth: 420 }}>

          <div style={{ position: "relative", display: "flex", background: T.bg3, borderRadius: 10, padding: 4, marginBottom: 28, border: `1px solid ${T.border}` }}>
            <div className="tab-indicator" style={tabIndicatorStyle} />
            {["signin", "signup"].map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                onMouseLeave={() => handleTabMouseLeave(t)}
                style={{
                  flex: 1, padding: "9px", borderRadius: 8, border: "none",
                  fontFamily: "inherit", fontSize: "clamp(12px,3vw,13px)", fontWeight: 600,
                  cursor: "pointer", transition: "color 0.15s ease",
                  background: "transparent",
                  color: authTab === t ? T.text : T.text3,
                  position: "relative", zIndex: 1,
                }}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div
            ref={cardRef}
            className={`card-flat ${cardShake ? "shake" : ""}`}
            style={{ padding: 28, background: T.card, border: `1px solid ${T.border}`, overflow: "hidden" }}
          >
            <div key={authTab} className={slideClass} style={{ overflow: "hidden" }}>
              <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, letterSpacing: "-1px", fontSize: "clamp(20px,5vw,24px)", color: T.text, marginBottom: 6 }}>
                {authTab === "signin" ? "Welcome back" : "Create your account"}
              </h2>
              <p style={{ fontSize: "clamp(11px,3vw,12px)", color: T.text3, marginBottom: 22 }}>
                {authTab === "signin" ? "Sign in to continue to CodeBuddy" : "Join 3,200+ builders on CodeBuddy — free forever"}
              </p>

              <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                <button className="social-btn" onClick={handleOAuthGithub} style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text }}>
                  <Github style={iconSize(15, 16)} />
                  <span>GitHub</span>
                </button>
                <button className="social-btn" onClick={handleOAuthGoogle} style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text }}>
                  <GoogleIcon style={iconSize(15, 16)} />
                  <span>Google</span>
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
                <div style={{ flex: 1, height: 1, background: T.border }} />
                <span style={{ fontSize: 11, color: T.text3, whiteSpace: "nowrap" }}>or with email</span>
                <div style={{ flex: 1, height: 1, background: T.border }} />
              </div>

              {authError && (
                <div
                  className="auth-err-banner"
                  style={{
                    background: "rgba(248,113,113,0.08)",
                    borderColor: "rgba(248,113,113,0.25)",
                    color: "#f87171",
                  }}
                >
                  <AlertCircle style={{ ...iconSize(14, 14), flexShrink: 0 }} />
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuth} noValidate>
              <Field
                label="Email" id="email" type="email" placeholder="you@example.com"
                value={formData.email} onChange={v => upd("email", v)} error={errors.email} T={T}
              />
              <Field
                label="Password" id="password" type="password" placeholder="••••••••"
                value={formData.password} onChange={v => upd("password", v)}
                error={errors.password && errors.password.trim() ? errors.password : undefined}
                hint={authTab === "signup" ? "Min 8 chars, 1 uppercase, 1 number" : undefined}
                T={T}
                showToggle={true}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(p => !p)}
              />
              {authTab === "signup" && (
                <Field
                  label="Confirm Password" id="confirm" type="password" placeholder="Repeat password"
                  value={formData.confirm} onChange={v => upd("confirm", v)} error={errors.confirm}
                  T={T}
                  showToggle={true}
                  showPassword={showConfirm}
                  onTogglePassword={() => setShowConfirm(p => !p)}
                />
              )}

              {authTab === "signin" && (
                <div style={{ textAlign: "right", marginTop: -10, marginBottom: 16 }}>
                  <button onClick={()=> router.push("/forgot_password")} style={{ background: "none", border: "none", cursor: "pointer", color: "#7c3aed", fontSize: 12, fontFamily: "inherit" }}>
                    Forgot password?
                  </button>
                </div>
              )}

              {authTab === "signup" && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer", fontSize: "clamp(11px,3vw,12px)", color: T.text2 }}>
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(ev) => {
                        setTermsAccepted(ev.target.checked);
                        setErrors((p) => { const n = { ...p }; delete n.terms; return n; });
                      }}
                      style={{ marginTop: 2, accentColor: "#7c3aed" }}
                    />
                    <span>
                      I agree to the{" "}
                      <Link href="/terms" style={{ color: "#a78bfa" }}>Terms</Link>
                      {" "}and{" "}
                      <Link href="/privacypolicy" style={{ color: "#a78bfa" }}>Privacy Policy</Link>
                    </span>
                  </label>
                  <ErrMsg msg={errors.terms} />
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: "100%", padding: 12 }} disabled={submitting}>
                {submitting ? <Loader2 className="spin" style={iconSize(15, 15)} /> : <BtnLabel>{authTab === "signin" ? "Sign in" : "Create account"}</BtnLabel>}
              </button>
              </form>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: "clamp(11px,3vw,12px)", color: T.text3 }}>
            {authTab === "signin" ? "Don't have an account?" : "Already have one?"}
            {" "}
            <button
              onClick={() => switchTab(authTab === "signin" ? "signup" : "signin")}
              style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontFamily: "inherit", fontSize: "clamp(11px,3vw,12px)", fontWeight: 600 }}
            >
              {authTab === "signin" ? "Sign up free" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;