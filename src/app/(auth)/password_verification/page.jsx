'use client'
import { useState, useCallback, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
// ─── Theme constants ─────────────────────────────────────────────────────────
const DARK = {
 bg: "#060608", bg2: "#0e0e18", bg3: "#14141f",
 border: "rgba(255,255,255,0.07)", border2: "rgba(255,255,255,0.12)",
 text: "#e2e2ef", text2: "#9090b0", text3: "#555570",
 card: "rgba(255,255,255,0.025)",
 input: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.09)",
 navBg: "rgba(6,6,8,0.9)",
 logoFill: "#00DC33",
 otpBg: "rgba(255,255,255,0.05)",
};
const LIGHT = {
 bg: "#f5f5f9", bg2: "#ffffff", bg3: "#eeeef5",
 border: "rgba(0,0,0,0.08)", border2: "rgba(0,0,0,0.15)",
 text: "#1a1a2e", text2: "#555570", text3: "#9090b0",
 card: "#ffffff",
 input: "#ffffff", inputBorder: "rgba(0,0,0,0.12)",
 navBg: "rgba(245,245,249,0.95)",
 logoFill: "#7c3aed",
 otpBg: "#f5f5f9",
};

const STATIC_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{border-radius:99px;background:rgba(124,58,237,0.3)}
  input{font-family:'Instrument Sans',sans-serif}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes countdown{from{stroke-dashoffset:0}to{stroke-dashoffset:100}}
  .fade-up{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both}
  .fade-in{animation:fadeIn 0.3s ease both}
  .slide-down{animation:slideDown 0.3s cubic-bezier(0.16,1,0.3,1) both}
  .shake{animation:shake 0.4s ease}
  .spin{animation:spin 0.9s linear infinite;display:inline-block}
  .btn-primary{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:12px 24px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;letter-spacing:-0.1px;box-shadow:0 6px 24px rgba(124,58,237,0.3)}
  .btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(124,58,237,0.45)}
  .btn-primary:disabled{opacity:0.5;cursor:not-allowed;transform:none}
  .btn-ghost{background:transparent;border:none;cursor:pointer;font-family:inherit;transition:all 0.2s}
  .btn-icon{background:transparent;border-radius:10px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center}
  .method-btn{border-radius:13px;padding:14px 16px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:12px;width:100%;text-align:left;font-family:inherit}
  .method-btn:hover{transform:translateY(-1px)}
  .auth-input{border-radius:11px;font-size:14px;outline:none;transition:border-color 0.2s;width:100%;font-family:'Instrument Sans',sans-serif;padding:10px 14px;border-width:1px;border-style:solid}
  .auth-input:focus{border-color:rgba(124,58,237,0.6) !important}
  .auth-input::placeholder{opacity:0.5}
  .otp-box{border-radius:11px;font-size:22px;font-weight:700;text-align:center;outline:none;width:48px;height:54px;border-width:1.5px;border-style:solid;transition:border-color 0.2s,transform 0.15s;font-family:'Instrument Sans',sans-serif;caret-color:#a855f7}
  .otp-box:focus{border-color:rgba(124,58,237,0.7) !important;transform:scale(1.06)}
  .tab-pill{border:none;border-radius:9px;padding:8px 16px;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s}
  @media(max-width:480px){.otp-box{width:40px;height:48px;font-size:18px}}
`;

const Logo = ({ fill }) => (
 <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill={fill} />
  <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff" />
 </svg>
);

const EyeIcon = ({ open, color }) => open ? (
 <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
 </svg>
) : (
 <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
 </svg>
);

// ─── OTP Box array ────────────────────────────────────────────────────────────
const OTP_LEN = 6;

function OtpInput({ otp, setOtp, inputRefs, T }) {
 const handleChange = (i, val) => {
  const d = val.replace(/\D/g, "").slice(-1);
  const next = [...otp];
  next[i] = d;
  setOtp(next);
  if (d && i < OTP_LEN - 1) inputRefs.current[i + 1]?.focus();
 };

 const handleKeyDown = (i, e) => {
  if (e.key === "Backspace") {
   if (otp[i]) {
    const next = [...otp];
    next[i] = "";
    setOtp(next);
   } else if (i > 0) {
    inputRefs.current[i - 1]?.focus();
   }
  }
  if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
  if (e.key === "ArrowRight" && i < OTP_LEN - 1) inputRefs.current[i + 1]?.focus();
 };

 const handlePaste = (e) => {
  e.preventDefault();
  const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
  if (!text) return;
  const next = [...otp];
  text.split("").forEach((ch, i) => { next[i] = ch; });
  setOtp(next);
  const focusIdx = Math.min(text.length, OTP_LEN - 1);
  inputRefs.current[focusIdx]?.focus();
 };

 return (
  <div style={{ display: "flex", gap: "clamp(6px,2vw,10px)", justifyContent: "center" }}>
   {otp.map((digit, i) => (
    <input
     key={i}
     ref={el => inputRefs.current[i] = el}
     className="otp-box"
     type="text"
     inputMode="numeric"
     maxLength={1}
     value={digit}
     onChange={e => handleChange(i, e.target.value)}
     onKeyDown={e => handleKeyDown(i, e)}
     onPaste={i === 0 ? handlePaste : undefined}
     style={{
      background: T.otpBg,
      borderColor: digit ? "rgba(124,58,237,0.55)" : T.inputBorder,
      color: T.text,
     }}
    />
   ))}
  </div>
 );
}

// ─── Countdown ring ───────────────────────────────────────────────────────────
function CountdownRing({ seconds, total, color }) {
 const r = 14;
 const circ = 2 * Math.PI * r;
 const offset = circ * (1 - seconds / total);
 return (
  <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
   <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(124,58,237,0.12)" strokeWidth="2.5" />
   <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="2.5"
    strokeDasharray={circ} strokeDashoffset={offset}
    strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
   <text x="18" y="18" textAnchor="middle" dominantBaseline="central"
    fill={color} fontSize="10" fontWeight="700" fontFamily="'Instrument Sans',sans-serif"
    style={{ transform: "rotate(90deg)", transformOrigin: "18px 18px" }}>
    {seconds}
   </text>
  </svg>
 );
}



const VIEWS = ["verify", "forgot", "otp", "reset", "success"];

export default function PasswordVerify() {

 const [email, setemail] = useState();

 // getuser
 const handleUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
   console.error(error);
   return;
  }

  setemail(data.user.email);
 };

 useEffect(() => {
  handleUser();
 }, [])

 console.log(email);
 

 const router = useRouter();
 const [dark, setDark] = useState(true);
 const [view, setView] = useState("verify");
 const [password, setPassword] = useState("");
 const [showPass, setShowPass] = useState(false);
 const [error, setError] = useState("");
 const [submitting, setSubmitting] = useState(false);
 const [shaking, setShaking] = useState(false);

 // Forgot flow
 const [forgotMethod, setForgotMethod] = useState(null); // "email" | "otp"
 const [resetEmail, setResetEmail] = useState("");
 const [emailSent, setEmailSent] = useState(false);

 // OTP flow
 const [otp, setOtp] = useState(Array(OTP_LEN).fill(""));
 const [otpError, setOtpError] = useState("");
 const [countdown, setCountdown] = useState(59);
 const [canResend, setCanResend] = useState(false);
 const otpRefs = useRef([]);
 const timerRef = useRef(null);

 // Reset password
 const [newPass, setNewPass] = useState("");
 const [newConfirm, setNewConfirm] = useState("");
 const [showNew, setShowNew] = useState(false);
 const [showNewC, setShowNewC] = useState(false);
 const [resetError, setResetError] = useState({});

 const T = dark ? DARK : LIGHT;

 // Provider (mock — in real app from session)
 const provider = "Google";
 const maskedEmail = "u*****@gmail.com";

 // OTP countdown
 useEffect(() => {
  if (view !== "otp") return;
  setCountdown(59);
  setCanResend(false);
  clearInterval(timerRef.current);
  timerRef.current = setInterval(() => {
   setCountdown(p => {
    if (p <= 1) { clearInterval(timerRef.current); setCanResend(true); return 0; }
    return p - 1;
   });
  }, 1000);
  return () => clearInterval(timerRef.current);
 }, [view]);

 useEffect(() => {
  if (view === "otp") setTimeout(() => otpRefs.current[0]?.focus(), 200);
 }, [view]);

 const triggerShake = () => {
  setShaking(true);
  setTimeout(() => setShaking(false), 450);
 };

 // ── Verify password ───────────────────────────────────────────────────────
 const handleVerify = () => {
  if (!password) { setError("Please enter your password"); triggerShake(); return; }
  setSubmitting(true);
  setTimeout(() => {
   setSubmitting(false);
   // mock: wrong if < 6 chars
   if (password.length < 6) { setError("Incorrect password. Try again."); triggerShake(); return; }
   router.push("/dashboard");
  }, 900);
 };

 // ── Send reset email ──────────────────────────────────────────────────────
 const handleSendEmail = () => {
  if (!resetEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { return; }
  setSubmitting(true);
  setTimeout(() => { setSubmitting(false); setEmailSent(true); }, 900);
 };

 // ── Send OTP ──────────────────────────────────────────────────────────────
 const handleSendOtp = () => {
  setSubmitting(true);
  setTimeout(() => { setSubmitting(false); setView("otp"); }, 800);
 };

 const handleResendOtp = () => {
  setOtp(Array(OTP_LEN).fill(""));
  setOtpError("");
  setCountdown(59);
  setCanResend(false);
  clearInterval(timerRef.current);
  timerRef.current = setInterval(() => {
   setCountdown(p => {
    if (p <= 1) { clearInterval(timerRef.current); setCanResend(true); return 0; }
    return p - 1;
   });
  }, 1000);
  setTimeout(() => otpRefs.current[0]?.focus(), 100);
 };

 // ── Verify OTP ────────────────────────────────────────────────────────────
 const handleVerifyOtp = () => {
  const code = otp.join("");
  if (code.length < OTP_LEN) { setOtpError("Enter all 6 digits"); return; }
  setSubmitting(true);
  setTimeout(() => {
   setSubmitting(false);
   // mock: 123456 = valid
   if (code !== "123456") { setOtpError("Incorrect code. Try again."); triggerShake(); return; }
   setView("reset");
  }, 900);
 };

 // ── Reset password ────────────────────────────────────────────────────────
 const handleReset = () => {
  const e = {};
  if (newPass.length < 8) e.pass = "Min 8 characters";
  if (newPass !== newConfirm) e.confirm = "Passwords don't match";
  setResetError(e);
  if (Object.keys(e).length) return;
  setSubmitting(true);
  setTimeout(() => { setSubmitting(false); setView("success"); }, 1000);
 };

 // ─────────────────────────────────────────────────────────────────────────
 const card = (children) => (
  <div style={{ borderRadius: 18, padding: "28px 28px 24px", background: T.card, border: `1px solid ${T.border}` }}>
   {children}
  </div>
 );

 const heading = (title, sub) => (
  <div style={{ marginBottom: 22 }}>
   <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(20px,5vw,24px)", color: T.text, marginBottom: 5 }}>{title}</h1>
   {sub && <p style={{ fontSize: 12, color: T.text3, lineHeight: 1.6 }}>{sub}</p>}
  </div>
 );

 const errMsg = (msg) => msg ? <div style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>⚠ {msg}</div> : null;

 const backBtn = (to, label = "← Back") => (
  <button className="btn-ghost" onClick={() => { setView(to); setError(""); setOtpError(""); setForgotMethod(null); setEmailSent(false); }}
   style={{ color: T.text3, fontSize: 12, marginTop: 14, display: "block", margin: "14px auto 0" }}>
   {label}
  </button>
 );

 // ─── VIEWS ────────────────────────────────────────────────────────────────
 const renderVerify = () => card(
  <>
   {/* Provider chip */}
   <div style={{ display: "flex", alignItems: "center", gap: 7, background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${T.border}`, borderRadius: 99, padding: "5px 13px 5px 8px", fontSize: 12, color: T.text2, width: "fit-content", marginBottom: 18 }}>
    <span style={{ fontSize: 15 }}>{provider === "Google" ? "🔵" : "⚫"}</span>
    <span>Signed in via <strong style={{ color: T.text }}>{provider}</strong></span>
   </div>

   {heading("Confirm your password", "For your security, verify your password before continuing.")}

   <div style={{ marginBottom: 18 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Password</label>
    <div className={shaking ? "shake" : ""} style={{ position: "relative" }}>
     <input
      className="auth-input"
      type={showPass ? "text" : "password"}
      placeholder="Enter your password…"
      value={password}
      onChange={e => { setPassword(e.target.value); setError(""); }}
      onKeyDown={e => e.key === "Enter" && handleVerify()}
      style={{ paddingRight: 44, background: T.input, borderColor: error ? "rgba(248,113,113,0.5)" : T.inputBorder, color: T.text }}
      autoFocus
     />
     <button className="btn-icon" onClick={() => setShowPass(p => !p)}
      style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 28, height: 28 }}>
      <EyeIcon open={showPass} color={T.text3} />
     </button>
    </div>
    {errMsg(error)}
   </div>

   <button className="btn-primary" style={{ width: "100%", padding: 13 }} onClick={handleVerify} disabled={submitting}>
    {submitting ? <span className="spin">⌛</span> : "Verify & continue →"}
   </button>

   <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 8 }}>
    <button className="btn-ghost" onClick={() => setView("forgot")} style={{ color: "#a78bfa", fontSize: 12, fontWeight: 600 }}>
     Forgot password?
    </button>
    <button className="btn-ghost" onClick={() => { setForgotMethod("otp"); setView("forgot"); }} style={{ color: T.text3, fontSize: 12 }}>
     Use OTP instead
    </button>
   </div>
  </>
 );

 const renderForgot = () => card(
  <>
   {heading("Recover your account", "How would you like to verify your identity?")}

   {!forgotMethod ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
     {/* Method: email link */}
     <button className="method-btn" onClick={() => setForgotMethod("email")}
      style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${T.border}`, color: T.text }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(124,58,237,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📧</div>
      <div>
       <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>Email reset link</div>
       <div style={{ fontSize: 11, color: T.text3 }}>We'll send a link to your inbox</div>
      </div>
      <svg style={{ marginLeft: "auto", flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
     </button>

     {/* Method: OTP */}
     <button className="method-btn" onClick={() => { setForgotMethod("otp"); }}
      style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${T.border}`, color: T.text }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(124,58,237,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🔢</div>
      <div>
       <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>One-time code (OTP)</div>
       <div style={{ fontSize: 11, color: T.text3 }}>6-digit code sent to your phone / email</div>
      </div>
      <svg style={{ marginLeft: "auto", flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
     </button>
    </div>
   ) : forgotMethod === "email" ? (
    <div className="slide-down">
     {emailSent ? (
      <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
       <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
       <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 6 }}>Check your inbox</div>
       <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.6 }}>We sent a reset link to <strong style={{ color: T.text }}>{resetEmail || maskedEmail}</strong>. It expires in 15 minutes.</div>
       <button className="btn-ghost" style={{ color: "#a78bfa", fontSize: 12, marginTop: 14, fontWeight: 600 }} onClick={() => { setEmailSent(false); setResetEmail(""); }}>
        Didn't get it? Try again
       </button>
      </div>
     ) : (
      <>
       <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Your email address</label>
        <input
         className="auth-input"
         type="email"
         placeholder={maskedEmail}
         value={resetEmail}
         onChange={e => setResetEmail(e.target.value)}
         style={{ background: T.input, borderColor: T.inputBorder, color: T.text }}
         autoFocus
        />
       </div>
       <button className="btn-primary" style={{ width: "100%", padding: 13 }} onClick={handleSendEmail} disabled={submitting}>
        {submitting ? <span className="spin">⌛</span> : "Send reset link →"}
       </button>
      </>
     )}
     <button className="btn-ghost" onClick={() => setForgotMethod(null)} style={{ color: T.text3, fontSize: 12, marginTop: 14, display: "block", margin: "14px auto 0" }}>
      ← Other options
     </button>
    </div>
   ) : (
    /* OTP option */
    <div className="slide-down">
     <div style={{ background: dark ? "rgba(124,58,237,0.07)" : "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 11, padding: "12px 14px", marginBottom: 18, fontSize: 12, color: T.text2, lineHeight: 1.6 }}>
      We'll send a 6-digit code to <strong style={{ color: T.text }}>{maskedEmail}</strong>
     </div>
     <button className="btn-primary" style={{ width: "100%", padding: 13 }} onClick={handleSendOtp} disabled={submitting}>
      {submitting ? <span className="spin">⌛</span> : "Send OTP →"}
     </button>
     <button className="btn-ghost" onClick={() => setForgotMethod(null)} style={{ color: T.text3, fontSize: 12, marginTop: 14, display: "block", margin: "14px auto 0" }}>
      ← Other options
     </button>
    </div>
   )}

   {backBtn("verify")}
  </>
 );

 const renderOtp = () => card(
  <>
   {heading("Enter your code", `We sent a 6-digit code to ${maskedEmail}. It expires in 10 minutes.`)}

   <div style={{ marginBottom: 20 }}>
    <div className={shaking ? "shake" : ""}>
     <OtpInput otp={otp} setOtp={v => { setOtp(v); setOtpError(""); }} inputRefs={otpRefs} T={T} />
    </div>
    {otpError && <div style={{ textAlign: "center", fontSize: 11, color: "#f87171", marginTop: 10 }}>⚠ {otpError}</div>}
   </div>

   <button className="btn-primary" style={{ width: "100%", padding: 13 }} onClick={handleVerifyOtp} disabled={submitting || otp.join("").length < OTP_LEN}>
    {submitting ? <span className="spin">⌛</span> : "Verify code →"}
   </button>

   {/* Resend */}
   <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 18 }}>
    {canResend ? (
     <button className="btn-ghost" onClick={handleResendOtp} style={{ color: "#a78bfa", fontSize: 12, fontWeight: 600 }}>
      Resend code
     </button>
    ) : (
     <>
      <CountdownRing seconds={countdown} total={59} color="#a855f7" />
      <span style={{ fontSize: 12, color: T.text3 }}>Resend in {countdown}s</span>
     </>
    )}
   </div>

   <div style={{ textAlign: "center", marginTop: 4, fontSize: 11, color: T.text3 }}>
    Hint: use <code style={{ color: "#a78bfa", background: "rgba(124,58,237,0.1)", padding: "1px 5px", borderRadius: 4 }}>123456</code> to demo
   </div>

   {backBtn("forgot")}
  </>
 );

 const renderReset = () => card(
  <>
   {heading("Set a new password", "Choose something strong — you won't be asked for it immediately after.")}

   <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>New password</label>
    <div style={{ position: "relative" }}>
     <input className="auth-input" type={showNew ? "text" : "password"} placeholder="New password…" value={newPass}
      onChange={e => { setNewPass(e.target.value); setResetError(p => { const n = { ...p }; delete n.pass; return n; }); }}
      style={{ paddingRight: 44, background: T.input, borderColor: resetError.pass ? "rgba(248,113,113,0.5)" : T.inputBorder, color: T.text }} autoFocus />
     <button className="btn-icon" onClick={() => setShowNew(p => !p)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 28, height: 28 }}>
      <EyeIcon open={showNew} color={T.text3} />
     </button>
    </div>
    {errMsg(resetError.pass)}
   </div>

   <div style={{ marginBottom: 20 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Confirm new password</label>
    <div style={{ position: "relative" }}>
     <input className="auth-input" type={showNewC ? "text" : "password"} placeholder="Repeat…" value={newConfirm}
      onChange={e => { setNewConfirm(e.target.value); setResetError(p => { const n = { ...p }; delete n.confirm; return n; }); }}
      style={{ paddingRight: 44, background: T.input, borderColor: resetError.confirm ? "rgba(248,113,113,0.5)" : (newConfirm && newConfirm === newPass ? "rgba(34,197,94,0.45)" : T.inputBorder), color: T.text }} />
     <button className="btn-icon" onClick={() => setShowNewC(p => !p)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 28, height: 28 }}>
      <EyeIcon open={showNewC} color={T.text3} />
     </button>
    </div>
    {errMsg(resetError.confirm)}
    {newConfirm && newConfirm === newPass && !resetError.confirm && (
     <div style={{ fontSize: 11, color: "#22c55e", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
      Passwords match
     </div>
    )}
   </div>

   <button className="btn-primary" style={{ width: "100%", padding: 13 }} onClick={handleReset} disabled={submitting}>
    {submitting ? <span className="spin">⌛</span> : "Update password →"}
   </button>
  </>
 );

 const renderSuccess = () => card(
  <div style={{ textAlign: "center", padding: "12px 0" }}>
   <div style={{ fontSize: 48, marginBottom: 14 }}>🎉</div>
   <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: T.text, marginBottom: 6 }}>Password updated!</h1>
   <p style={{ fontSize: 12, color: T.text3, marginBottom: 22, lineHeight: 1.6 }}>You're all set. You can now sign in with your new password.</p>
   <button className="btn-primary" style={{ padding: "12px 32px" }} onClick={() => router.push("/dashboard")}>
    Go to dashboard →
   </button>
  </div>
 );

 const viewMap = { verify: renderVerify, forgot: renderForgot, otp: renderOtp, reset: renderReset, success: renderSuccess };

 // Progress dots
 const steps = ["verify", "forgot", "otp", "reset", "success"];
 const stepIdx = steps.indexOf(view);

 return (
  <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
   <style>{STATIC_CSS}</style>

   <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
    <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.07)" : "hsla(259,70%,60%,0.05)"} 0%,transparent 65%)` }} />
   </div>

   <nav style={{ padding: "0 clamp(16px,5vw,28px)", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, background: T.navBg, backdropFilter: "blur(20px)" }}>
    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
     <Logo fill={T.logoFill} />
     <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 16, color: T.text }}>CodeBuddy</span>
    </Link>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
     <button className="btn-icon" onClick={() => setDark(p => !p)} style={{ width: 34, height: 34, border: `1px solid ${T.border}`, color: T.text3, background: "transparent" }}>
      {dark ? "☀️" : "🌙"}
     </button>
     <button className="btn-ghost" onClick={() => router.back()} style={{ color: T.text3, fontSize: 13, padding: "4px 8px" }}>← Back</button>
    </div>
   </nav>

   <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(24px,5vw,48px) 20px", position: "relative", zIndex: 1 }}>
    <div className="fade-up" style={{ width: "100%", maxWidth: 420 }}>
     {viewMap[view]?.()}
    </div>
   </div>
  </div>
 );
}