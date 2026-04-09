'use client'
import { useState} from "react";
function SignUp() {
  const [authTab, setAuthTab] = useState("signup");
  const [formData, setFormData] = useState({ email: "", password: "", confirm: "", name: "", handle: "", bio: "", role: "", lookingFor: "Collaborator", skillsHave: [], skillsNeed: [] });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState("");
  const [dashPage, setDashPage] = useState("");
  const [onboardStep, setOnboardStep] = useState(0);
  const DARK = {
    bg: "#060608", bg2: "#0e0e18", bg3: "#14141f",
    border: "rgba(255,255,255,0.07)", border2: "rgba(255,255,255,0.12)",
    text: "#e2e2ef", text2: "#9090b0", text3: "#555570",
    card: "rgba(255,255,255,0.025)", cardHover: "rgba(255,255,255,0.045)",
    input: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.09)",
    glass: "rgba(6,6,8,0.85)",
    shadow: "0 20px 60px rgba(0,0,0,0.5)",
    msgMe: "linear-gradient(135deg,rgba(124,58,237,0.4),rgba(100,60,200,0.3))",
    msgThem: "rgba(255,255,255,0.06)",
    navBg: "rgba(6,6,8,0.9)",
    skillHaveBg: "rgba(110,224,110,0.1)", skillHaveBorder: "rgba(110,224,110,0.25)", skillHaveText: "#7de87d",
    skillNeedBg: "rgba(120,120,255,0.1)", skillNeedBorder: "rgba(120,120,255,0.25)", skillNeedText: "#9898ff",
    aiBg: "rgba(60,40,140,0.15)", aiBorder: "rgba(120,80,255,0.2)",
    logoFill: "#00DC33",
  };
  const LIGHT = {
    bg: "#f5f5f9", bg2: "#ffffff", bg3: "#eeeef5",
    border: "rgba(0,0,0,0.08)", border2: "rgba(0,0,0,0.15)",
    text: "#1a1a2e", text2: "#555570", text3: "#9090b0",
    card: "#ffffff", cardHover: "#f8f8fc",
    input: "#ffffff", inputBorder: "rgba(0,0,0,0.12)",
    glass: "rgba(245,245,249,0.92)",
    shadow: "0 20px 60px rgba(0,0,0,0.12)",
    msgMe: "linear-gradient(135deg,#7c3aed,#9333ea)",
    msgThem: "#f0f0f8",
    navBg: "rgba(245,245,249,0.95)",
    skillHaveBg: "rgba(34,197,94,0.1)", skillHaveBorder: "rgba(34,197,94,0.3)", skillHaveText: "#16a34a",
    skillNeedBg: "rgba(99,102,241,0.1)", skillNeedBorder: "rgba(99,102,241,0.3)", skillNeedText: "#4f46e5",
    aiBg: "rgba(124,58,237,0.07)", aiBorder: "rgba(124,58,237,0.2)",
    logoFill: "#7c3aed",
  };

  const [dark, setDark] = useState(true);
  const T = dark ? DARK : LIGHT;
  const css = `
     @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
     *{box-sizing:border-box;margin:0;padding:0}
     ::-webkit-scrollbar{width:4px;height:4px}
     ::-webkit-scrollbar-track{background:transparent}
     ::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)"};border-radius:99px}
     input,textarea,select{font-family:'Instrument Sans',sans-serif}
     textarea{resize:none}
     select option{background:${dark ? "#1a1a2e" : "#fff"}}
     @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
     @keyframes fadeIn{from{opacity:0}to{opacity:1}}
     @keyframes spin{to{transform:rotate(360deg)}}
     @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
     @keyframes ticker{0%{opacity:0;transform:translateY(8px)}15%,85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-8px)}}
     .fade-up{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both}
     .fade-in{animation:fadeIn 0.3s ease both}
     .float{animation:float 4s ease-in-out infinite}
     .spin{animation:spin 0.9s linear infinite;display:inline-block}
     .ticker{animation:ticker 3s ease-in-out infinite}
     .card{background:${T.card};border:1px solid ${T.border};border-radius:18px;transition:all 0.25s}
     .card:hover{background:${T.cardHover};border-color:${T.border2};transform:translateY(-2px);box-shadow:${T.shadow}}
     .card-flat{background:${T.card};border:1px solid ${T.border};border-radius:18px}
     .btn-primary{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:11px 24px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;letter-spacing:-0.1px;box-shadow:0 6px 24px rgba(124,58,237,0.3)}
     .btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(124,58,237,0.45)}
     .btn-primary:disabled{opacity:0.5;cursor:not-allowed;transform:none}
     .btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:9px 18px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s}
     .btn-ghost:hover{border-color:${T.border2};color:${T.text}}
     .btn-icon{background:transparent;border:1px solid ${T.border};color:${T.text3};padding:8px;border-radius:10px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center}
     .btn-icon:hover{border-color:${T.border2};color:${T.text}}
     .input{background:${T.input};border:1px solid ${T.inputBorder};color:${T.text};padding:10px 14px;border-radius:11px;font-size:13px;outline:none;transition:all 0.2s;width:100%}
     .input:focus{border-color:rgba(124,58,237,0.6);background:${dark ? "rgba(255,255,255,0.07)" : "rgba(124,58,237,0.04)"}}
     .input::placeholder{color:${T.text3}}
     .select{background:${T.input};border:1px solid ${T.inputBorder};color:${T.text2};padding:8px 12px;border-radius:10px;font-size:12px;font-family:inherit;outline:none;cursor:pointer}
     .nav-btn{background:none;border:none;color:${T.text3};cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;padding:8px 13px;border-radius:10px;display:flex;align-items:center;gap:7px;transition:all 0.2s}
     .nav-btn:hover{color:${T.text};background:${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}}
     .nav-btn.on{color:${dark ? "#e0d8ff" : "#7c3aed"};background:${dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.08)"}}
     .pill{padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600}
     .skill-have{background:${T.skillHaveBg};border:1px solid ${T.skillHaveBorder};color:${T.skillHaveText}}
     .skill-need{background:${T.skillNeedBg};border:1px solid ${T.skillNeedBorder};color:${T.skillNeedText}}
     .skill-chip{padding:6px 13px;border-radius:99px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid ${T.border};background:transparent;color:${T.text3};transition:all 0.15s;font-family:inherit}
     .skill-chip:hover{border-color:rgba(124,58,237,0.4);color:${T.text};background:rgba(124,58,237,0.08)}
     .skill-chip.sel-have{background:${T.skillHaveBg};border-color:${T.skillHaveBorder};color:${T.skillHaveText}}
     .skill-chip.sel-need{background:${T.skillNeedBg};border-color:${T.skillNeedBorder};color:${T.skillNeedText}}
     .tab{background:none;border:none;color:${T.text3};cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;padding:7px 15px;border-radius:8px;transition:all 0.2s}
     .tab:hover{color:${T.text}}
     .tab.on{background:${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"};color:${T.text}}
     .sidebar-item{display:flex;align-items:center;gap:11px;padding:11px 13px;border-radius:13px;cursor:pointer;transition:all 0.2s;border:1px solid transparent}
     .sidebar-item:hover{background:${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}}
     .sidebar-item.on{background:${dark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.07)"};border-color:${T.border}}
     .role-card{background:${T.input};border:1px solid ${T.border};border-radius:14px;padding:14px 18px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:13px}
     .role-card:hover{border-color:rgba(124,58,237,0.3)}
     .role-card.on{background:${dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.07)"};border-color:rgba(124,58,237,0.4)}
     .look-card{background:${T.input};border:1px solid ${T.border};border-radius:14px;padding:15px;cursor:pointer;transition:all 0.2s;text-align:center}
     .look-card:hover{border-color:rgba(124,58,237,0.3)}
     .look-card.on{background:${dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.07)"};border-color:rgba(124,58,237,0.4)}
     .social-btn{background:${T.input};border:1px solid ${T.inputBorder};color:${T.text};padding:10px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:9px;flex:1}
     .social-btn:hover{border-color:${T.border2}}
     .match-track{height:3px;background:${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"};border-radius:99px;overflow:hidden}
     .divider{height:1px;background:${T.border};margin:18px 0}
     .toggle-switch{width:44px;height:24px;border-radius:12px;border:none;cursor:pointer;position:relative;transition:background 0.3s;flex-shrink:0}
     .toggle-thumb{width:18px;height:18px;border-radius:50%;background:white;position:absolute;top:3px;transition:left 0.25s cubic-bezier(0.34,1.56,0.64,1)}
     
     @media (max-width: 768px) {
       .social-btn { font-size: 12px; padding: 9px; }
       .btn-primary, .btn-ghost { font-size: 12px; padding: 9px 16px; }
     }
     @media (max-width: 480px) {
       .card-flat { padding: 20px !important; }
       .social-btn span { display: none; }
       .auth-back-btn { font-size: 12px; }
     }
   `;


  const Err = ({ msg }) => msg ? <div style={{ fontSize: 11, color: "#f87171", marginTop: 5 }}>⚠ {msg}</div> : null;

  const Field = ({ label, id, type = "text", placeholder, value, onChange, error, hint, prefix }) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: T.text3 }}>@</span>}
        <input className="input" id={id} type={type} placeholder={placeholder} value={value}
          onChange={e => { onChange(e.target.value); if (error) clrErr(id); }}
          style={{ paddingLeft: prefix ? "28px" : "14px", borderColor: error ? "rgba(248,113,113,0.5)" : undefined }} />
      </div>
      <Err msg={error} />
      {hint && !error && <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{hint}</div>}
    </div>
  );

  const handleAuth = () => {
    if (!validateAuth()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      if (authTab === "signup") { handleOnboarding(); setOnboardStep(0); }
      else { setView("dashboard"); setDashPage("discover"); }
    }, 1000);
  };

  const handleOnboarding =()=>{
    window.href = "/onboarding";
  }

  const upd = (k, v) => setFormData(p => ({ ...p, [k]: v }));
  const clrErr = k => setErrors(p => { const n = { ...p }; delete n[k]; return n; });

  const validateAuth = () => {
    const e = {};
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";
    if (formData.password.length < 8) e.password = "Min 8 characters";
    if (authTab === "signup" && formData.password !== formData.confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const Logo = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill={T.logoFill}></path>
      <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff"></path>
    </svg>
  );

  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{css}</style>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}><div style={{ position: "absolute", top: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.1)" : "hsla(259,70%,60%,0.06)"} 0%,transparent 65%)` }} /></div>

      <nav style={{ padding: "0 clamp(16px, 5vw, 28px)", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, background: T.navBg, backdropFilter: "blur(20px)" }}>
        <button onClick={() => setView("landing")} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
            <Logo />
          </div>
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(14px, 4vw, 16px)", color: T.text }}>CodeBuddy</span>
        </button>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn-icon" onClick={() => setDark(p => !p)} style={{ width: 34, height: 34 }}>{dark ? "☀️" : "🌙"}</button>
          <button className="auth-back-btn" onClick={() => setView("landing")} style={{ background: "none", border: "none", cursor: "pointer", color: T.text3, fontSize: 13, fontFamily: "inherit" }}>← Back</button>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(20px, 5vw, 40px) 20px", position: "relative", zIndex: 1 }}>
        <div className="fade-up" style={{ width: "100%", maxWidth: 420 }}>
          {/* Tabs */}
          <div style={{ display: "flex", background: T.bg3, borderRadius: 13, padding: 4, marginBottom: 28, border: `1px solid ${T.border}` }}>
            {["signin", "signup"].map(t => (
              <button key={t} onClick={() => setAuthTab(t)} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", fontFamily: "inherit", fontSize: "clamp(12px, 3vw, 13px)", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", background: authTab === t ? (dark ? "rgba(255,255,255,0.07)" : T.bg2) : "transparent", color: authTab === t ? T.text : T.text3, boxShadow: authTab === t ? T.shadow : "none" }}>
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div className="card-flat" style={{ padding: 28 }}>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(20px, 5vw, 24px)", color: T.text, marginBottom: 6 }}>
              {authTab === "signin" ? "Welcome back" : "Create your account"}
            </h2>
            <p style={{ fontSize: "clamp(11px, 3vw, 12px)", color: T.text3, marginBottom: 22 }}>
              {authTab === "signin" ? "Sign in to continue to SkillMatch" : "Join 3,200+ builders on SkillMatch — free forever"}
            </p>

            {/* Social */}
            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              <button className="social-btn"><span>🐙</span> GitHub</button>
              <button className="social-btn"><span>🔵</span> Google</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
              <div className="divider" style={{ flex: 1, margin: 0 }} />
              <span style={{ fontSize: 11, color: T.text3, whiteSpace: "nowrap" }}>or with email</span>
              <div className="divider" style={{ flex: 1, margin: 0 }} />
            </div>

            <Field label="Email" id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={v => upd("email", v)} error={errors.email} />
            <Field label="Password" id="password" type="password" placeholder="••••••••" value={formData.password} onChange={v => upd("password", v)} error={errors.password} hint={authTab === "signup" ? "Min 8 characters" : undefined} />
            {authTab === "signup" && <Field label="Confirm Password" id="confirm" type="password" placeholder="Repeat password" value={formData.confirm} onChange={v => upd("confirm", v)} error={errors.confirm} />}

            {authTab === "signin" && <div style={{ textAlign: "right", marginTop: -10, marginBottom: 16 }}><button style={{ background: "none", border: "none", cursor: "pointer", color: "#7c3aed", fontSize: 12, fontFamily: "inherit" }}>Forgot password?</button></div>}

            {authTab === "signup" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer", fontSize: "clamp(11px, 3vw, 12px)", color: T.text2 }}>
                  <input type="checkbox" style={{ marginTop: 2, accentColor: "#7c3aed" }} />
                  <span>I agree to the <span style={{ color: "#a78bfa" }}>Terms</span> and <span style={{ color: "#a78bfa" }}>Privacy Policy</span></span>
                </label>
              </div>
            )}

            <button className="btn-primary" style={{ width: "100%", padding: 12 }} onClick={handleAuth} disabled={submitting}>
              {submitting ? <span className="spin">⌛</span>  : authTab === "signin" ? "Sign in →" : "Create account →"}
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: "clamp(11px, 3vw, 12px)", color: T.text3 }}>
            {authTab === "signin" ? "Don't have an account?" : "Already have one?"}
            {" "}<button onClick={() => setAuthTab(authTab === "signin" ? "signup" : "signin")} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontFamily: "inherit", fontSize: "clamp(11px, 3vw, 12px)", fontWeight: 600 }}>
              {authTab === "signin" ? "Sign up free" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>

  )
}

export default SignUp;