"use client"
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { useThemeStore } from "../../../../store/themeprovider";
import { Mail, Hash, AlertTriangle, Loader2, ArrowRight, ArrowLeft, Check, Eye, EyeOff, ChevronRight, Github, Chrome } from "lucide-react";

const iconSize = (min, max, vw = 3.2) => ({
  width: `clamp(${min}px, ${vw}vw, ${max}px)`,
  height: `clamp(${min}px, ${vw}vw, ${max}px)`,
  flexShrink: 0,
});

const DARK = {
  bg: "#060608", bg2: "#0e0e18", bg3: "#14141f",
  border: "rgba(255,255,255,0.09)", border2: "rgba(255,255,255,0.14)",
  text: "#e2e2ef", text2: "#9090b0", text3: "#555570",
  card: "rgba(255,255,255,0.025)",
  input: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.09)",
  navBg: "rgba(6,6,8,0.9)",
  logoFill: "#1a0a5a",
  otpBg: "rgba(255,255,255,0.05)",
};

const LIGHT = {
  bg: "#f5f5f9", bg2: "#ffffff", bg3: "#eeeef5",
  border: "rgba(0,0,0,0.09)", border2: "rgba(0,0,0,0.16)",
  text: "#1a1a2e", text2: "#555570", text3: "#9090b0",
  card: "#ffffff",
  input: "#ffffff", inputBorder: "rgba(0,0,0,0.12)",
  navBg: "rgba(245,245,249,0.95)",
  logoFill: "#7c3aed",
  otpBg: "#f5f5f9",
};

const STATIC_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{border-radius:99px;background:rgba(124,58,237,0.3)}
  input{font-family:'Inter',sans-serif}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  .fade-up{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both}
  .fade-in{animation:fadeIn 0.3s ease both}
  .slide-down{animation:slideDown 0.3s cubic-bezier(0.16,1,0.3,1) both}
  .shake{animation:shake 0.4s ease}
  .spin{animation:spin 0.9s linear infinite;display:inline-block}
  .btn-primary{background:#7c3aed;border:1px solid #7c3aed;color:white;padding:12px 24px;border-radius:8px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:filter 0.15s ease;letter-spacing:-0.1px;display:inline-flex;align-items:center;justify-content:center;gap:8px}
  .btn-primary:hover{filter:brightness(1.1)}
  .btn-primary:active{filter:brightness(0.95)}
  .btn-primary:disabled{opacity:0.5;cursor:not-allowed;filter:none}
  .btn-ghost{background:transparent;border:none;cursor:pointer;font-family:inherit;transition:filter 0.15s ease;display:inline-flex;align-items:center;gap:5px}
  .btn-ghost:hover{filter:brightness(1.3)}
  .btn-icon{background:transparent;border-radius:8px;cursor:pointer;transition:filter 0.15s ease;display:flex;align-items:center;justify-content:center}
  .method-btn{border-radius:8px;padding:14px 16px;cursor:pointer;transition:border-color 0.15s ease,background 0.15s ease;display:flex;align-items:center;gap:12px;width:100%;text-align:left;font-family:inherit}
  .method-btn:hover{border-color:rgba(139,92,246,0.22) !important}
  .auth-input{border-radius:8px;font-size:14px;outline:none;transition:border-color 0.15s ease;width:100%;font-family:'Inter',sans-serif;padding:10px 14px;border-width:1px;border-style:solid}
  .auth-input:focus{border-color:rgba(124,58,237,0.6) !important}
  .auth-input::placeholder{opacity:0.5}
  .otp-box{border-radius:8px;font-size:22px;font-weight:700;text-align:center;outline:none;width:48px;height:54px;border-width:1.5px;border-style:solid;transition:border-color 0.15s ease;font-family:'JetBrains Mono',monospace;caret-color:#a855f7}
  .otp-box:focus{border-color:rgba(124,58,237,0.7) !important}
  @media(max-width:480px){.otp-box{width:40px;height:48px;font-size:18px}}
  .eye-btn{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;border-radius:6px;transition:opacity 0.15s ease;opacity:0.45}
  .eye-btn:hover{opacity:0.9}
`;

const Logo = ({ fill }) => (
  <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill={fill} />
    <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff" />
  </svg>
);

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
      if (otp[i]) { const next = [...otp]; next[i] = ""; setOtp(next); }
      else if (i > 0) inputRefs.current[i - 1]?.focus();
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
    inputRefs.current[Math.min(text.length, OTP_LEN - 1)]?.focus();
  };
  return (
    <div style={{ display: "flex", gap: "clamp(6px,2vw,10px)", justifyContent: "center" }}>
      {otp.map((digit, i) => (
        <input key={i} ref={el => inputRefs.current[i] = el} className="otp-box" type="text"
          inputMode="numeric" maxLength={1} value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          style={{ background: T.otpBg, borderColor: digit ? "rgba(124,58,237,0.55)" : T.inputBorder, color: T.text }}
        />
      ))}
    </div>
  );
}

function CountdownRing({ seconds, total, color }) {
  const r = 14, circ = 2 * Math.PI * r;
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(124,58,237,0.12)" strokeWidth="2.5" />
      <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="2.5"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - seconds / total)}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
      <text x="18" y="18" textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize="10" fontWeight="700" fontFamily="'JetBrains Mono',monospace"
        style={{ transform: "rotate(90deg)", transformOrigin: "18px 18px" }}>{seconds}</text>
    </svg>
  );
}

export default function PasswordVerify() {
  const router = useRouter();
  const { dark, toggleDark } = useThemeStore();
  const [view, setView] = useState("verify");

  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data?.user?.email) setEmail(data.user.email);
    });
  }, []);

  const [provider, setProvider] = useState(null);
  useEffect(() => {
    const p = localStorage.getItem("Oauth");
    localStorage.removeItem("Oauth");
    setProvider(p);
  }, []);

  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shaking, setShaking] = useState(false);

  const [forgotMethod, setForgotMethod] = useState(null);
  const [resetEmail, setResetEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const [otp, setOtp] = useState(Array(OTP_LEN).fill(""));
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  const [newPass, setNewPass] = useState("");
  const [newConfirm, setNewConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showNewC, setShowNewC] = useState(false);
  const [resetError, setResetError] = useState({});

  const T = dark ? DARK : LIGHT;
  const maskedEmail = email ? email.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(b.length) + c) : "u*****@gmail.com";

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 450);
  };

  useEffect(() => {
    if (view !== "otp") return;
    setCountdown(59); setCanResend(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(p => { if (p <= 1) { clearInterval(timerRef.current); setCanResend(true); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [view]);

  useEffect(() => {
    if (view === "otp") setTimeout(() => otpRefs.current[0]?.focus(), 200);
  }, [view]);

  const callAuthApi = async (payload) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Auth error:", err);
      return { success: false, message: "Network error. Please check your connection." };
    }
  };

  const handleVerify = async () => {
    if (!password) { setError("Please enter your password"); triggerShake(); return; }
    setSubmitting(true);
    setError("");

    const result = await callAuthApi({ email, password });

    setSubmitting(false);

    if (result?.success === true) {
      router.push("/dashboard");
    } else {
      const msg = result?.message || "Incorrect password. Try again.";
      if (/invalid.*(login|credentials|password)/i.test(msg) || /wrong/i.test(msg)) {
        setError("Incorrect password. Try again.");
      } else {
        setError(msg);
      }
      triggerShake();
    }
  };

  const handleSendEmail = () => {
    if (!resetEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setEmailSent(true); }, 900);
  };

  const handleSendOtp = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setView("otp"); }, 800);
  };

  const handleResendOtp = () => {
    setOtp(Array(OTP_LEN).fill("")); setOtpError("");
    setCountdown(59); setCanResend(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(p => { if (p <= 1) { clearInterval(timerRef.current); setCanResend(true); return 0; } return p - 1; });
    }, 1000);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleVerifyOtp = () => {
    const code = otp.join("");
    if (code.length < OTP_LEN) { setOtpError("Enter all 6 digits"); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      if (code !== "123456") { setOtpError("Incorrect code. Try again."); triggerShake(); return; }
      setView("reset");
    }, 900);
  };

  const handleReset = () => {
    const e = {};
    if (newPass.length < 8) e.pass = "Min 8 characters";
    if (newPass !== newConfirm) e.confirm = "Passwords don't match";
    setResetError(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setView("success"); }, 1000);
  };

  const card = (children) => (
    <div style={{ borderRadius: 10, padding: "28px 28px 24px", background: T.card, border: `1px solid ${T.border}` }}>
      {children}
    </div>
  );

  const heading = (title, sub) => (
    <div style={{ marginBottom: 22 }}>
      <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: "clamp(20px,5vw,24px)", letterSpacing: "-1px", color: T.text, marginBottom: 5 }}>{title}</h1>
      {sub && <p style={{ fontSize: 12, color: T.text3, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );

  const errMsg = (msg) => msg ? <div style={{ fontSize: 11, color: "#f87171", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}><AlertTriangle style={iconSize(11, 12)} /> {msg}</div> : null;

  const backBtn = (to, label = "Back") => (
    <button className="btn-ghost"
      onClick={() => { setView(to); setError(""); setOtpError(""); setForgotMethod(null); setEmailSent(false); }}
      style={{ color: T.text3, fontSize: 12, marginTop: 14, display: "flex", margin: "14px auto 0" }}>
      <ArrowLeft style={iconSize(11, 12)} /> {label}
    </button>
  );

  const renderVerify = () => card(
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 7, background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 13px 5px 8px", fontSize: 12, color: T.text2, width: "fit-content", marginBottom: 18 }}>
        {provider === "Google" ? <Chrome style={iconSize(14, 15)} /> : <Github style={iconSize(14, 15)} />}
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
          <button className="eye-btn" onClick={() => setShowPass(p => !p)} tabIndex={-1} aria-label={showPass ? "Hide" : "Show"}>
            {showPass ? <EyeOff style={{ ...iconSize(15, 16), color: T.text }} /> : <Eye style={{ ...iconSize(15, 16), color: T.text }} />}
          </button>
        </div>
        {errMsg(error)}
      </div>

      <button className="btn-primary" style={{ width: "100%", padding: 13 }} onClick={handleVerify} disabled={submitting}>
        {submitting ? <Loader2 className="spin" style={iconSize(14, 15)} /> : <>Verify & continue <ArrowRight style={iconSize(13, 14)} /></>}
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 8 }}>
        <button className="btn-ghost" onClick={() => router.push("/forgot_password")} style={{ color: "#a78bfa", fontSize: 12, fontWeight: 600 }}>
          Forgot password?
        </button>
      </div>
    </>
  );

  const renderForgot = () => card(
    <>
      {heading("Recover your account", "How would you like to verify your identity?")}
      {!forgotMethod ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="method-btn" onClick={() => setForgotMethod("email")}
            style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${T.border}`, color: T.text }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: "rgba(124,58,237,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Mail style={{ ...iconSize(16, 18), color: "#a78bfa" }} /></div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>Email reset link</div>
              <div style={{ fontSize: 11, color: T.text3 }}>We'll send a link to your inbox</div>
            </div>
            <ChevronRight style={{ marginLeft: "auto", flexShrink: 0, ...iconSize(13, 14), color: T.text3 }} strokeWidth={2} />
          </button>
          <button className="method-btn" onClick={() => setForgotMethod("otp")}
            style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${T.border}`, color: T.text }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: "rgba(124,58,237,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Hash style={{ ...iconSize(16, 18), color: "#a78bfa" }} /></div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>One-time code (OTP)</div>
              <div style={{ fontSize: 11, color: T.text3 }}>6-digit code sent to your phone / email</div>
            </div>
            <ChevronRight style={{ marginLeft: "auto", flexShrink: 0, ...iconSize(13, 14), color: T.text3 }} strokeWidth={2} />
          </button>
        </div>
      ) : forgotMethod === "email" ? (
        <div className="slide-down">
          {emailSent ? (
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Mail style={{ ...iconSize(32, 40), color: "#a78bfa" }} /></div>
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
                <input className="auth-input" type="email" placeholder={maskedEmail} value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  style={{ background: T.input, borderColor: T.inputBorder, color: T.text }} autoFocus />
              </div>
              <button className="btn-primary" style={{ width: "100%", padding: 13 }} onClick={handleSendEmail} disabled={submitting}>
                {submitting ? <Loader2 className="spin" style={iconSize(14, 15)} /> : <>Send reset link <ArrowRight style={iconSize(13, 14)} /></>}
              </button>
            </>
          )}
          <button className="btn-ghost" onClick={() => setForgotMethod(null)} style={{ color: T.text3, fontSize: 12, marginTop: 14, display: "flex", margin: "14px auto 0" }}>
            <ArrowLeft style={iconSize(11, 12)} /> Other options
          </button>
        </div>
      ) : (
        <div className="slide-down">
          <div style={{ background: dark ? "rgba(124,58,237,0.07)" : "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 10, padding: "12px 14px", marginBottom: 18, fontSize: 12, color: T.text2, lineHeight: 1.6 }}>
            We'll send a 6-digit code to <strong style={{ color: T.text }}>{maskedEmail}</strong>
          </div>
          <button className="btn-primary" style={{ width: "100%", padding: 13 }} onClick={handleSendOtp} disabled={submitting}>
            {submitting ? <Loader2 className="spin" style={iconSize(14, 15)} /> : <>Send OTP <ArrowRight style={iconSize(13, 14)} /></>}
          </button>
          <button className="btn-ghost" onClick={() => setForgotMethod(null)} style={{ color: T.text3, fontSize: 12, marginTop: 14, display: "flex", margin: "14px auto 0" }}>
            <ArrowLeft style={iconSize(11, 12)} /> Other options
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
        {otpError && <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 5, fontSize: 11, color: "#f87171", marginTop: 10 }}><AlertTriangle style={iconSize(11, 12)} /> {otpError}</div>}
      </div>
      <button className="btn-primary" style={{ width: "100%", padding: 13 }} onClick={handleVerifyOtp} disabled={submitting || otp.join("").length < OTP_LEN}>
        {submitting ? <Loader2 className="spin" style={iconSize(14, 15)} /> : <>Verify code <ArrowRight style={iconSize(13, 14)} /></>}
      </button>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 18 }}>
        {canResend ? (
          <button className="btn-ghost" onClick={handleResendOtp} style={{ color: "#a78bfa", fontSize: 12, fontWeight: 600 }}>Resend code</button>
        ) : (
          <>
            <CountdownRing seconds={countdown} total={59} color="#a855f7" />
            <span style={{ fontSize: 12, color: T.text3 }}>Resend in {countdown}s</span>
          </>
        )}
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
          <button className="eye-btn" onClick={() => setShowNew(p => !p)} tabIndex={-1}>{showNew ? <EyeOff style={{ ...iconSize(15, 16), color: T.text }} /> : <Eye style={{ ...iconSize(15, 16), color: T.text }} />}</button>
        </div>
        {errMsg(resetError.pass)}
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Confirm new password</label>
        <div style={{ position: "relative" }}>
          <input className="auth-input" type={showNewC ? "text" : "password"} placeholder="Repeat…" value={newConfirm}
            onChange={e => { setNewConfirm(e.target.value); setResetError(p => { const n = { ...p }; delete n.confirm; return n; }); }}
            style={{ paddingRight: 44, background: T.input, borderColor: resetError.confirm ? "rgba(248,113,113,0.5)" : (newConfirm && newConfirm === newPass ? "rgba(34,197,94,0.45)" : T.inputBorder), color: T.text }} />
          <button className="eye-btn" onClick={() => setShowNewC(p => !p)} tabIndex={-1}>{showNewC ? <EyeOff style={{ ...iconSize(15, 16), color: T.text }} /> : <Eye style={{ ...iconSize(15, 16), color: T.text }} />}</button>
        </div>
        {errMsg(resetError.confirm)}
        {newConfirm && newConfirm === newPass && !resetError.confirm && (
          <div style={{ fontSize: 11, color: "#22c55e", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
            <Check style={iconSize(12, 13)} strokeWidth={2.5} />
            Passwords match
          </div>
        )}
      </div>
      <button className="btn-primary" style={{ width: "100%", padding: 13 }} onClick={handleReset} disabled={submitting}>
        {submitting ? <Loader2 className="spin" style={iconSize(14, 15)} /> : <>Update password <ArrowRight style={iconSize(13, 14)} /></>}
      </button>
    </>
  );

  const renderSuccess = () => card(
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Check style={{ ...iconSize(28, 32), color: "#22c55e" }} strokeWidth={2.5} />
        </div>
      </div>
      <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 24, letterSpacing: "-1px", color: T.text, marginBottom: 6 }}>Password updated!</h1>
      <p style={{ fontSize: 12, color: T.text3, marginBottom: 22, lineHeight: 1.6 }}>You're all set. You can now sign in with your new password.</p>
      <button className="btn-primary" style={{ padding: "12px 32px" }} onClick={() => router.push("/dashboard")}>
        Go to dashboard <ArrowRight style={iconSize(13, 14)} />
      </button>
    </div>
  );

  const viewMap = { verify: renderVerify, forgot: renderForgot, otp: renderOtp, reset: renderReset, success: renderSuccess };

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{STATIC_CSS}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.07)" : "hsla(259,70%,60%,0.05)"} 0%,transparent 65%)` }} />
      </div>

      <nav style={{ padding: "0 clamp(16px,5vw,28px)", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, background: T.navBg, backdropFilter: "blur(20px)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <Logo fill={T.logoFill} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px", color: T.text }}>CodeBuddy</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn-ghost" onClick={() => router.back()} style={{ color: T.text3, fontSize: 13, padding: "4px 8px" }}><ArrowLeft style={iconSize(12, 13)} /> Back</button>
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