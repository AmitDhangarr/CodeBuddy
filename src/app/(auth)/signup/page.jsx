'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useSignupStore } from "../../../../store/UsesignupStore";
import { supabase } from "../../../lib/supabaseClient";

// ─── Theme constants (stable, outside component) ─────────────────────────────
const DARK = {
  bg: "#060608", bg2: "#0e0e18", bg3: "#14141f",
  border: "rgba(255,255,255,0.07)", border2: "rgba(255,255,255,0.12)",
  text: "#e2e2ef", text2: "#9090b0", text3: "#555570",
  card: "rgba(255,255,255,0.025)",
  input: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.09)",
  navBg: "rgba(6,6,8,0.9)",
  logoFill: "#00DC33",
};
const LIGHT = {
  bg: "#f5f5f9", bg2: "#ffffff", bg3: "#eeeef5",
  border: "rgba(0,0,0,0.08)", border2: "rgba(0,0,0,0.15)",
  text: "#1a1a2e", text2: "#555570", text3: "#9090b0",
  card: "#ffffff",
  input: "#ffffff", inputBorder: "rgba(0,0,0,0.12)",
  navBg: "rgba(245,245,249,0.95)",
  logoFill: "#7c3aed",
};

// ─── Static CSS (no theme values — those go inline via style prop) ────────────
const STATIC_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{border-radius:99px}
  input,textarea,select{font-family:'Instrument Sans',sans-serif}
  textarea{resize:none}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fade-up{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both}
  .spin{animation:spin 0.9s linear infinite;display:inline-block}
  .btn-primary{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:11px 24px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;letter-spacing:-0.1px;box-shadow:0 6px 24px rgba(124,58,237,0.3)}
  .btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(124,58,237,0.45)}
  .btn-primary:disabled{opacity:0.5;cursor:not-allowed;transform:none}
  .btn-icon{background:transparent;border-radius:10px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center}
  .social-btn{padding:10px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:9px;flex:1}
  .card-flat{border-radius:18px}
  .auth-input{border-radius:11px;font-size:14px;outline:none;transition:border-color 0.2s,background 0.2s;width:100%;font-family:'Instrument Sans',sans-serif;padding:10px 14px;border-width:1px;border-style:solid}
  .auth-input:focus{border-color:rgba(124,58,237,0.6) !important}
  .auth-input::placeholder{opacity:0.5}
  @media (max-width:768px){
    .social-btn{font-size:12px;padding:9px}
    .btn-primary{font-size:12px;padding:9px 16px}
  }
  @media (max-width:480px){
    .social-btn span{display:none}
    .auth-back-btn{font-size:12px}
  }
`;

// ─── Static sub-components ────────────────────────────────────────────────────
const Logo = ({ fill }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill={fill} />
    <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff" />
  </svg>
);

const ErrMsg = ({ msg }) =>
  msg ? <div style={{ fontSize: 11, color: "#f87171", marginTop: 5 }}>⚠ {msg}</div> : null;

const Field = ({ label, id, type = "text", placeholder, value, onChange, error, hint, prefix, T }) => (
  <div style={{ marginBottom: 18 }}>
    <label htmlFor={id} style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>{label}</label>
    <div style={{ position: "relative" }}>
      {prefix && (
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: T.text3, pointerEvents: "none" }}>@</span>
      )}
      <input
        className="auth-input"
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={type === "password" ? "new-password" : type === "email" ? "email" : "off"}
        style={{
          paddingLeft: prefix ? "28px" : "14px",
          background: T.input,
          borderColor: error ? "rgba(248,113,113,0.5)" : T.inputBorder,
          color: T.text,
        }}
      />
    </div>
    <ErrMsg msg={error} />
    {hint && !error && <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{hint}</div>}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
function SignUp() {
  const router = useRouter();
  const updateForm = useSignupStore(state => state.updateForm);

  const [dark, setDark] = useState(true);
  const [authTab, setAuthTab] = useState("signup");
  const [formData, setFormData] = useState({ email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const T = dark ? DARK : LIGHT;

  const upd = useCallback((k, v) => {
    setFormData(p => ({ ...p, [k]: v }));
    setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  }, []);

  const validateAuth = () => {
    const e = {};
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";
    if (formData.password.length < 8) e.password = "Min 8 characters";
    if (authTab === "signup" && formData.password !== formData.confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAuth = () => {
    if (!validateAuth()) return;
    setSubmitting(true);
    updateForm({ email: formData.email, password: formData.password });
    // Navigate immediately; reset submitting after navigation
    router.push("/onboarding");
    setTimeout(() => setSubmitting(false), 1000);
  };

  const handleOAuthGithub = async () => {
    await supabase.auth.signInWithOAuth({ provider: "github" });
  };

  const handleOAuthGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const HandleTabChange = () => {
    if (authTab === "signup") {
      router.push("/signup");
    }
    if (authTab === "signin") {
      router.push("/signin");
    }
  }
  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{STATIC_CSS}</style>

      {/* Background glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.1)" : "hsla(259,70%,60%,0.06)"} 0%,transparent 65%)` }} />
      </div>

      {/* Nav */}
      <nav style={{ padding: "0 clamp(16px,5vw,28px)", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, background: T.navBg, backdropFilter: "blur(20px)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <Logo fill={T.logoFill} />
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(14px,4vw,16px)", color: T.text }}>CodeBuddy</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="btn-icon"
            onClick={() => setDark(p => !p)}
            style={{ width: 34, height: 34, border: `1px solid ${T.border}`, color: T.text3, background: "transparent" }}
            aria-label="Toggle theme"
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <button
            className="auth-back-btn"
            onClick={() => router.back()}
            style={{ background: "none", border: "none", cursor: "pointer", color: T.text3, fontSize: 13, fontFamily: "inherit" }}
          >
            ← Back
          </button>
        </div>
      </nav>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(20px,5vw,40px) 20px", position: "relative", zIndex: 1 }}>
        <div className="fade-up" style={{ width: "100%", maxWidth: 420 }}>

          {/* Tabs */}
          <div style={{ display: "flex", background: T.bg3, borderRadius: 13, padding: 4, marginBottom: 28, border: `1px solid ${T.border}` }}>
            {["signin", "signup"].map(t => (
              <button
                key={t}
                onClick={() => { setAuthTab(t); setErrors({}); }}
                onMouseLeave={HandleTabChange}
                style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", fontFamily: "inherit", fontSize: "clamp(12px,3vw,13px)", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", background: authTab === t ? (dark ? "rgba(255,255,255,0.07)" : T.bg2) : "transparent", color: authTab === t ? T.text : T.text3 }}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Card */}
          <div className="card-flat" style={{ padding: 28, background: T.card, border: `1px solid ${T.border}` }}>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(20px,5vw,24px)", color: T.text, marginBottom: 6 }}>
              {authTab === "signin" ? "Welcome back" : "Create your account"}
            </h2>
            <p style={{ fontSize: "clamp(11px,3vw,12px)", color: T.text3, marginBottom: 22 }}>
              {authTab === "signin" ? "Sign in to continue to CodeBuddy" : "Join 3,200+ builders on CodeBuddy — free forever"}
            </p>

            {/* Social buttons */}
            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              <button className="social-btn" onClick={handleOAuthGithub} style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text }}>
                <span><i class="fa-brands fa-github"></i></span>
                <span>GitHub</span>
              </button>
              <button className="social-btn" onClick={handleOAuthGoogle} style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text }}>
                <span><i class="fa-brands fa-google"></i></span>
                <span>Google</span>
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <span style={{ fontSize: 11, color: T.text3, whiteSpace: "nowrap" }}>or with email</span>
              <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>

            <Field label="Email" id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={v => upd("email", v)} error={errors.email} T={T} />
            <Field label="Password" id="password" type="password" placeholder="••••••••" value={formData.password} onChange={v => upd("password", v)} error={errors.password} hint={authTab === "signup" ? "Min 8 characters" : undefined} T={T} />
            {authTab === "signup" && (
              <Field label="Confirm Password" id="confirm" type="password" placeholder="Repeat password" value={formData.confirm} onChange={v => upd("confirm", v)} error={errors.confirm} T={T} />
            )}

            {authTab === "signin" && (
              <div style={{ textAlign: "right", marginTop: -10, marginBottom: 16 }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#7c3aed", fontSize: 12, fontFamily: "inherit" }}>Forgot password?</button>
              </div>
            )}

            {authTab === "signup" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer", fontSize: "clamp(11px,3vw,12px)", color: T.text2 }}>
                  <input type="checkbox" style={{ marginTop: 2, accentColor: "#7c3aed" }} />
                  <span>I agree to the <span style={{ color: "#a78bfa" }}>Terms</span> and <span style={{ color: "#a78bfa" }}>Privacy Policy</span></span>
                </label>
              </div>
            )}

            <button className="btn-primary" style={{ width: "100%", padding: 12 }} onClick={handleAuth} disabled={submitting}>
              {submitting ? <span className="spin">⌛</span> : authTab === "signin" ? "Sign in →" : "Create account →"}
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: "clamp(11px,3vw,12px)", color: T.text3 }}>
            {authTab === "signin" ? "Don't have an account?" : "Already have one?"}
            {" "}
            <button
              onClick={() => { setAuthTab(authTab === "signin" ? "signup" : "signin"); setErrors({}); }}
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

export default SignUp;