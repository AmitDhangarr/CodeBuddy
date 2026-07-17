"use client"
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { useSignupStore } from "../../../../store/UsesignupStore";
import { useThemeStore } from "../../../../store/themeprovider";
import { Sparkles, AlertTriangle, Lock, Loader2, ArrowRight, Check, Copy, Eye, EyeOff, Github, Chrome } from "lucide-react";

const iconSize = (min, max, vw = 3.2) => ({
  width: `clamp(${min}px, ${vw}vw, ${max}px)`,
  height: `clamp(${min}px, ${vw}vw, ${max}px)`,
  flexShrink: 0,
});

const DARK = {
  bg: "#060608", bg2: "#0e0e18", bg3: "#14141f",
  border: "rgba(255,255,255,0.09)", border2: "rgba(255,255,255,0.14)",
  text: "#e2e2ef", text2: "#9090b0", text3: "#555570",
  card: "rgba(255,255,255,0.025)", cardHover: "rgba(255,255,255,0.045)",
  input: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.09)",
  navBg: "rgba(6,6,8,0.9)",
  logoFill: "#1a0a3b",
};
const LIGHT = {
  bg: "#f5f5f9", bg2: "#ffffff", bg3: "#eeeef5",
  border: "rgba(0,0,0,0.09)", border2: "rgba(0,0,0,0.16)",
  text: "#1a1a2e", text2: "#555570", text3: "#9090b0",
  card: "#ffffff", cardHover: "#f8f8fc",
  input: "#ffffff", inputBorder: "rgba(0,0,0,0.12)",
  navBg: "rgba(245,245,249,0.95)",
  logoFill: "#7c3aed",
};

const STATIC_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{border-radius:99px;background:rgba(124,58,237,0.3)}
  input,textarea{font-family:'Inter',sans-serif}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
  .fade-up{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both}
  .slide-in{animation:slideIn 0.25s ease both}
  .spin{animation:spin 0.9s linear infinite;display:inline-block}
  .btn-primary{background:#7c3aed;border:1px solid #7c3aed;color:white;padding:12px 24px;border-radius:8px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:filter 0.15s ease;letter-spacing:-0.1px}
  .btn-primary:hover{filter:brightness(1.1)}
  .btn-primary:active{filter:brightness(0.95)}
  .btn-primary:disabled{opacity:0.5;cursor:not-allowed;filter:none}
  .btn-icon{background:transparent;border-radius:8px;cursor:pointer;transition:filter 0.15s ease;display:flex;align-items:center;justify-content:center}
  .auth-input{border-radius:8px;font-size:14px;outline:none;transition:border-color 0.15s ease,background 0.15s ease;width:100%;font-family:'Inter',sans-serif;padding:10px 14px;border-width:1px;border-style:solid}
  .auth-input:focus{border-color:rgba(124,58,237,0.6) !important}
  .auth-input::placeholder{opacity:0.5}
  .strength-bar{height:3px;border-radius:6px;transition:background 0.15s ease}
  .req-item{display:flex;align-items:center;gap:7px;font-size:11px;transition:color 0.15s ease}
  .suggest-btn{background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.25);color:#a78bfa;padding:7px 14px;border-radius:8px;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:filter 0.15s ease;white-space:nowrap;display:inline-flex;align-items:center;gap:6px}
  .suggest-btn:hover{filter:brightness(1.1)}
  .copy-btn{background:transparent;border:none;cursor:pointer;padding:5px;border-radius:6px;transition:background 0.15s ease;display:flex;align-items:center}
  .copy-btn:hover{background:rgba(124,58,237,0.15)}
  @media(max-width:480px){.btn-primary{font-size:12px;padding:10px 16px}}
`;

const Logo = ({ fill }) => (
  <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill={fill} />
    <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff" />
  </svg>
);

const checks = [
  { id: "len", label: "At least 8 characters", test: p => p.length >= 8 },
  { id: "upper", label: "Uppercase letter", test: p => /[A-Z]/.test(p) },
  { id: "lower", label: "Lowercase letter", test: p => /[a-z]/.test(p) },
  { id: "digit", label: "Number", test: p => /\d/.test(p) },
  { id: "symbol", label: "Special character (!@#$…)", test: p => /[^A-Za-z0-9]/.test(p) },
];

const strengthMeta = [
  { label: "Too weak", color: "#ef4444" },
  { label: "Weak", color: "#f97316" },
  { label: "Fair", color: "#eab308" },
  { label: "Good", color: "#22c55e" },
  { label: "Strong", color: "#a855f7" },
];

function getStrength(p) {
  return checks.filter(c => c.test(p)).length;
}

const CHARS = {
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lower: "abcdefghijkmnopqrstuvwxyz",
  digit: "23456789",
  symbol: "!@#$%^&*-_+=?",
};
function suggestPassword() {
  const pool = [
    CHARS.upper[Math.floor(Math.random() * CHARS.upper.length)],
    CHARS.upper[Math.floor(Math.random() * CHARS.upper.length)],
    CHARS.lower[Math.floor(Math.random() * CHARS.lower.length)],
    CHARS.lower[Math.floor(Math.random() * CHARS.lower.length)],
    CHARS.lower[Math.floor(Math.random() * CHARS.lower.length)],
    CHARS.digit[Math.floor(Math.random() * CHARS.digit.length)],
    CHARS.digit[Math.floor(Math.random() * CHARS.digit.length)],
    CHARS.symbol[Math.floor(Math.random() * CHARS.symbol.length)],
    CHARS.symbol[Math.floor(Math.random() * CHARS.symbol.length)],
    ...Array.from({ length: 4 }, () => CHARS.lower[Math.floor(Math.random() * CHARS.lower.length)]),
  ];
  return pool.sort(() => Math.random() - 0.5).join("");
}

const CheckIcon = ({ done, color }) => done ? (
  <Check style={{ ...iconSize(12, 13), color }} strokeWidth={2.5} />
) : (
  <svg style={iconSize(12, 13)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
  </svg>
);

export default function PasswordSetup() {

  const [email, setemail] = useState();
  const updateForm = useSignupStore((state) => state.updateForm);

  const GetUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      setemail(data.user.email);
      if (error) {
        console.error(error);
      }
    } catch (error) {
      console.log(error);
    }

  }

  useEffect(() => {
    GetUser();
  }, [email])

  const router = useRouter();
  const { dark, toggleDark } = useThemeStore();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const T = dark ? DARK : LIGHT;
  const strength = getStrength(password);
  const meta = strengthMeta[Math.max(0, strength - 1)] || strengthMeta[0];

  const handleSuggest = useCallback(() => {
    const p = suggestPassword();
    setPassword(p);
    setConfirm(p);
    setShowPass(true);
    setErrors({});
  }, []);

  const handleCopy = useCallback(async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [password]);

  const handleSave = () => {
    const e = {};
    if (strength < 3) e.password = "Please choose a stronger password";
    if (password !== confirm) e.confirm = "Passwords don't match";
    if (!password) e.password = "Password is required";
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    updateForm({
      email: email,
      password: password,
    });

    setTimeout(() => {
      setSubmitting(false);
      setSaved(true);
      setTimeout(() => router.push("/onboarding"), 1200);
    }, 1100);
  };

  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const p = localStorage.getItem("Oauth");
    localStorage.removeItem("Oauth");
    setProvider(p);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{STATIC_CSS}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.08)" : "hsla(259,70%,60%,0.05)"} 0%,transparent 65%)` }} />
      </div>

      <nav style={{ padding: "0 clamp(16px,5vw,28px)", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, background: T.navBg, backdropFilter: "blur(20px)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <Logo fill={T.logoFill} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px", color: T.text }}>CodeBuddy</span>
        </Link>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(24px,5vw,48px) 20px", position: "relative", zIndex: 1 }}>
        <div className="fade-up" style={{ width: "100%", maxWidth: 420 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 13px 5px 8px", fontSize: 12, color: T.text2 }}>
              {provider === "Google" ? <Chrome style={iconSize(14, 15)} /> : <Github style={iconSize(14, 15)} />}
              <span>Signed in via <strong style={{ color: T.text }}>{provider}</strong></span>
            </div>
          </div>

          <div style={{ borderRadius: 10, padding: "28px 28px 24px", background: T.card, border: `1px solid ${T.border}` }}>

            <div style={{ marginBottom: 22 }}>
              <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: "clamp(20px,5vw,24px)", letterSpacing: "-1px", color: T.text, marginBottom: 5 }}>
                Set up your password
              </h1>
              <p style={{ fontSize: 12, color: T.text3, lineHeight: 1.6 }}>
                Add a password so you can also sign in with email. This keeps your account secure even if {provider} access changes.
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.text2 }}>New password</label>
                <button className="suggest-btn" onClick={handleSuggest} title="Generate strong password">
                  <Sparkles style={iconSize(12, 13)} /> Suggest strong password
                </button>
              </div>

              <div style={{ position: "relative" }}>
                <input
                  className="auth-input"
                  type={showPass ? "text" : "password"}
                  placeholder="Choose a password…"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => { const n = { ...p }; delete n.password; return n; }); }}
                  style={{ paddingRight: 80, background: T.input, borderColor: errors.password ? "rgba(248,113,113,0.5)" : T.inputBorder, color: T.text, letterSpacing: showPass ? "normal" : password ? "0.08em" : "normal" }}
                />
                <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 4 }}>
                  {password && (
                    <button className="copy-btn" onClick={handleCopy} title={copied ? "Copied!" : "Copy password"}>
                      {copied
                        ? <Check style={{ ...iconSize(13, 14), color: "#22c55e" }} strokeWidth={2.5} />
                        : <Copy style={{ ...iconSize(13, 14), color: T.text3 }} strokeWidth={2} />
                      }
                    </button>
                  )}
                  <button className="copy-btn" onClick={() => setShowPass(p => !p)} title={showPass ? "Hide" : "Show"}>
                    {showPass ? <EyeOff style={{ ...iconSize(15, 16), color: T.text3 }} /> : <Eye style={{ ...iconSize(15, 16), color: T.text3 }} />}
                  </button>
                </div>
              </div>

              {errors.password && <div style={{ fontSize: 11, color: "#f87171", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}><AlertTriangle style={iconSize(11, 12)} /> {errors.password}</div>}

              {password && (
                <div className="slide-in" style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="strength-bar" style={{ flex: 1, background: i <= strength ? meta.color : (dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)") }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: meta.color, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{meta.label}</div>
                </div>
              )}

              {password && (
                <div className="slide-in" style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 5 }}>
                  {checks.map(c => {
                    const done = c.test(password);
                    return (
                      <div key={c.id} className="req-item" style={{ color: done ? "#22c55e" : T.text3 }}>
                        <CheckIcon done={done} color={done ? "#22c55e" : T.text3} />
                        <span>{c.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Confirm password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="auth-input"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password…"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setErrors(p => { const n = { ...p }; delete n.confirm; return n; }); }}
                  style={{ paddingRight: 44, background: T.input, borderColor: errors.confirm ? "rgba(248,113,113,0.5)" : (confirm && confirm === password) ? "rgba(34,197,94,0.45)" : T.inputBorder, color: T.text, letterSpacing: showConfirm ? "normal" : confirm ? "0.08em" : "normal" }}
                />
                <button className="copy-btn" onClick={() => setShowConfirm(p => !p)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}>
                  {showConfirm ? <EyeOff style={{ ...iconSize(15, 16), color: T.text3 }} /> : <Eye style={{ ...iconSize(15, 16), color: T.text3 }} />}
                </button>
              </div>
              {errors.confirm && <div style={{ fontSize: 11, color: "#f87171", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}><AlertTriangle style={iconSize(11, 12)} /> {errors.confirm}</div>}
              {confirm && confirm === password && !errors.confirm && (
                <div style={{ fontSize: 11, color: "#22c55e", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
                  <Check style={iconSize(12, 13)} strokeWidth={2.5} />
                  Passwords match
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 9, alignItems: "flex-start", background: dark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.06)", border: `1px solid rgba(124,58,237,0.18)`, borderRadius: 10, padding: "10px 12px", marginBottom: 20 }}>
              <Lock style={{ ...iconSize(13, 14), color: "#a78bfa", marginTop: 1 }} />
              <p style={{ fontSize: 11, color: T.text2, lineHeight: 1.6 }}>
                Your password is hashed and never stored in plain text. We recommend saving it in a password manager.
              </p>
            </div>

            <button
              className="btn-primary"
              style={{ width: "100%", padding: 13, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              onClick={handleSave}
              disabled={submitting || saved}
            >
              {saved
                ? <><Check style={iconSize(14, 15)} strokeWidth={2.5} /> Saved! Redirecting…</>
                : submitting
                  ? <><Loader2 className="spin" style={iconSize(14, 15)} /> Saving…</>
                  : <>Save password <ArrowRight style={iconSize(13, 14)} /></>
              }
            </button>

            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button
                onClick={() => router.push("/dashboard")}
                style={{ background: "none", border: "none", cursor: "pointer", color: T.text3, fontSize: 12, fontFamily: "inherit" }}
              >
                Skip for now — I'll use {provider} only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}