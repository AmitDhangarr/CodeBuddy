"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient.js";

// ─── Theme ────────────────────────────────────────────────────────────────────
const DARK = {
  bg: "#060608", bg2: "#0e0e18", bg3: "#14141f",
  border: "rgba(255,255,255,0.07)", border2: "rgba(255,255,255,0.12)",
  text: "#e2e2ef", text2: "#9090b0", text3: "#555570",
  card: "rgba(255,255,255,0.025)",
  input: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.09)",
  navBg: "rgba(6,6,8,0.9)",
  otpBg: "rgba(255,255,255,0.05)",
};
const LIGHT = {
  bg: "#f5f5f9", bg2: "#ffffff", bg3: "#eeeef5",
  border: "rgba(0,0,0,0.08)", border2: "rgba(0,0,0,0.15)",
  text: "#1a1a2e", text2: "#555570", text3: "#9090b0",
  card: "#ffffff",
  input: "#ffffff", inputBorder: "rgba(0,0,0,0.12)",
  navBg: "rgba(245,245,249,0.95)",
  otpBg: "#f5f5f9",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  input{font-family:'Instrument Sans',sans-serif}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}
  .fade-up{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both}
  .slide-down{animation:slideDown 0.3s cubic-bezier(0.16,1,0.3,1) both}
  .shake{animation:shake 0.4s ease}
  .spin{animation:spin 0.9s linear infinite;display:inline-block}
  .btn-primary{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:12px 24px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;letter-spacing:-0.1px;box-shadow:0 6px 24px rgba(124,58,237,0.3);width:100%}
  .btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 10px 32px rgba(124,58,237,0.45)}
  .btn-primary:disabled{opacity:0.5;cursor:not-allowed}
  .btn-ghost{background:transparent;border:none;cursor:pointer;font-family:inherit;transition:all 0.2s}
  .btn-secondary{background:transparent;border:1.5px solid rgba(124,58,237,0.35);color:#a78bfa;padding:12px 24px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;width:100%}
  .btn-secondary:hover{background:rgba(124,58,237,0.08);border-color:rgba(124,58,237,0.6)}
  .auth-input{border-radius:11px;font-size:14px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;width:100%;font-family:'Instrument Sans',sans-serif;padding:11px 14px;border-width:1px;border-style:solid}
  .auth-input:focus{border-color:rgba(124,58,237,0.6)!important;box-shadow:0 0 0 3px rgba(124,58,237,0.08)}
  .auth-input::placeholder{opacity:0.45}
  .otp-box{border-radius:11px;font-size:22px;font-weight:700;text-align:center;outline:none;width:48px;height:56px;border-width:1.5px;border-style:solid;transition:border-color 0.2s,transform 0.15s,box-shadow 0.2s;font-family:'Instrument Sans',sans-serif;caret-color:#a855f7}
  .otp-box:focus{border-color:rgba(124,58,237,0.7)!important;transform:scale(1.06);box-shadow:0 0 0 3px rgba(124,58,237,0.12)}
  .eye-btn{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;border-radius:6px;transition:opacity 0.15s;opacity:0.45}
  .eye-btn:hover{opacity:0.9}
  .step-dot{width:8px;height:8px;border-radius:50%;transition:all 0.3s}
  @media(max-width:480px){.otp-box{width:40px;height:48px;font-size:18px}}
`;

const OTP_LEN = 8;

// ─── Sub-components ───────────────────────────────────────────────────────────
const EyeIcon = ({ open, color }) =>
  open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

function OtpInput({ otp, setOtp, inputRefs, T, shaking }) {
  const handleChange = (i, val) => {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...otp]; next[i] = d; setOtp(next);
    if (d && i < OTP_LEN - 1) inputRefs.current[i + 1]?.focus();
  };
  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      if (otp[i]) { const n = [...otp]; n[i] = ""; setOtp(n); }
      else if (i > 0) inputRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < OTP_LEN - 1) inputRefs.current[i + 1]?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
    if (!text) return;
    const next = [...otp]; text.split("").forEach((ch, i) => { next[i] = ch; }); setOtp(next);
    inputRefs.current[Math.min(text.length, OTP_LEN - 1)]?.focus();
  };
  return (
    <div className={shaking ? "shake" : ""} style={{ display: "flex", gap: "clamp(6px,2vw,10px)", justifyContent: "center" }}>
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

function CountdownRing({ seconds, total }) {
  const r = 14, circ = 2 * Math.PI * r;
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(124,58,237,0.12)" strokeWidth="2.5" />
      <circle cx="18" cy="18" r={r} fill="none" stroke="#a855f7" strokeWidth="2.5"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - seconds / total)}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
      <text x="18" y="18" textAnchor="middle" dominantBaseline="central"
        fill="#a855f7" fontSize="10" fontWeight="700" fontFamily="'Instrument Sans',sans-serif"
        style={{ transform: "rotate(90deg)", transformOrigin: "18px 18px" }}>{seconds}</text>
    </svg>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS = ["Email", "OTP", "Reset", "Done"];
function StepBar({ current, T }) {
  const idx = { email: 0, otp: 1, "new-password": 2, success: 3 }[current] ?? 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 26 }}>
      {STEPS.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, flex: i < STEPS.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div className="step-dot" style={{
              background: i < idx ? "#22c55e" : i === idx ? "#a855f7" : T.border2,
              width: i === idx ? 10 : 8, height: i === idx ? 10 : 8,
              boxShadow: i === idx ? "0 0 8px rgba(168,85,247,0.6)" : "none",
            }} />
            <span style={{ fontSize: 9, color: i === idx ? "#a855f7" : i < idx ? "#22c55e" : T.text3, fontWeight: 600, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 1.5, background: i < idx ? "rgba(34,197,94,0.4)" : T.border, borderRadius: 99, marginBottom: 14 }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Validators ───────────────────────────────────────────────────────────────
const validateEmail = (email) => {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";
  return "";
};

const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Must contain at least one uppercase letter";
  if (!/[0-9]/.test(password)) return "Must contain at least one number";
  return "";
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ForgotPasswordFlow({ onBackToSignIn, dark: darkProp = true, initialEmail = "" }) {
  const router = useRouter();
  const [dark, setDark] = useState(darkProp);
  const T = dark ? DARK : LIGHT;

  // views: "email" → "otp" → "new-password" → "success"
  const [view, setView] = useState("email");

  // Email step
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState("");

  // OTP step
  const [otp, setOtp] = useState(Array(OTP_LEN).fill(""));
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  // New password step
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passErrors, setPassErrors] = useState({});

  // Shared
  const [submitting, setSubmitting] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [apiError, setApiError] = useState("");

  const triggerShake = () => { setShaking(true); setTimeout(() => setShaking(false), 450); };

  const maskedEmail = email
    ? email.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 5)) + c)
    : "u*****@example.com";

  // OTP countdown
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

  // ── Handlers ───────────────────────────────────────────────────────────────

  // 1. Send OTP
  async function handleSendOtp() {
    const err = validateEmail(email);
    if (err) { setEmailError(err); triggerShake(); return; }
    setEmailError(""); setApiError(""); setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        setApiError(error.message || "Failed to send code. Please try again.");
        triggerShake();
        return;
      }
      setView("otp");
    } catch (e) {
      setApiError("Network error. Please check your connection.");
      triggerShake();
    } finally {
      setSubmitting(false);
    }
  }

  // 2. Resend OTP
  const handleResendOtp = async () => {
    setOtp(Array(OTP_LEN).fill("")); setOtpError(""); setApiError("");
    setCountdown(59); setCanResend(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(p => { if (p <= 1) { clearInterval(timerRef.current); setCanResend(true); return 0; } return p - 1; });
    }, 1000);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setOtpError("Could not resend. Try again shortly.");
  };

  // 3. Verify OTP
  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < OTP_LEN) { setOtpError(`Please enter all ${OTP_LEN} digits`); triggerShake(); return; }
    setOtpError(""); setApiError(""); setSubmitting(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });
      if (error) {
        setOtpError(
          error.message.includes("expired")
            ? "Code has expired. Please request a new one."
            : error.message.includes("invalid")
            ? "Incorrect code. Double-check and try again."
            : error.message || "Verification failed. Please try again."
        );
        triggerShake();
        return;
      }
      setView("new-password");
    } catch (e) {
      setOtpError("Network error. Please check your connection.");
      triggerShake();
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Update password — calls custom API route that bcrypt-hashes into profiles table
  const handleSetNewPassword = async () => {
    const passErr = validatePassword(newPass);
    const confirmErr = newPass !== confirmPass ? "Passwords don't match" : "";
    setPassErrors({ pass: passErr, confirm: confirmErr });
    if (passErr || confirmErr) { triggerShake(); return; }

    setApiError(""); setSubmitting(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword: newPass }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setApiError(data.message || "Failed to update password. Please try again.");
        triggerShake();
        return;
      }

      setView("success");
    } catch (e) {
      setApiError("Network error. Please check your connection.");
      triggerShake();
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToSignIn = () => {
    if (onBackToSignIn) onBackToSignIn();
    else router.push("/signin");
  };

  // ── Layout helpers ─────────────────────────────────────────────────────────
  const errMsg = (msg) => msg ? (
    <div style={{ fontSize: 11, color: "#f87171", marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="#f87171"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
      {msg}
    </div>
  ) : null;

  const label = (text) => (
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.text2, marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>{text}</label>
  );

  const apiBanner = apiError ? (
    <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#f87171", display: "flex", gap: 8, alignItems: "flex-start" }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}>⚠️</span>
      <span>{apiError}</span>
    </div>
  ) : null;

  // ── View renderers ─────────────────────────────────────────────────────────

  // 1. Email entry
  const renderEmail = () => (
    <div className="slide-down">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>🔐</div>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(22px,5vw,26px)", color: T.text, marginBottom: 8 }}>
          Forgot your password?
        </h1>
        <p style={{ fontSize: 13, color: T.text3, lineHeight: 1.7 }}>
          Enter your email and we'll send a verification code to confirm it's you.
        </p>
      </div>

      {apiBanner}

      <div style={{ marginBottom: 18 }}>
        {label("Email address")}
        <div className={shaking ? "shake" : ""}>
          <input
            className="auth-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailError(""); setApiError(""); }}
            onKeyDown={e => e.key === "Enter" && handleSendOtp()}
            style={{ background: T.input, borderColor: emailError ? "rgba(248,113,113,0.5)" : T.inputBorder, color: T.text }}
            autoFocus
          />
        </div>
        {errMsg(emailError)}
      </div>

      <button className="btn-primary" style={{ padding: 13 }} onClick={handleSendOtp} disabled={submitting}>
        {submitting ? <span className="spin">⌛</span> : "Send verification code →"}
      </button>

      <div style={{ textAlign: "center", marginTop: 18 }}>
        <button className="btn-ghost" onClick={handleGoToSignIn} style={{ fontSize: 12, color: T.text3, display: "inline-flex", alignItems: "center", gap: 5 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to sign in
        </button>
      </div>
    </div>
  );

  // 2. OTP verification — UI fix: "a 8-digit" → "an 8-digit", removed stray space
  const renderOtp = () => (
    <div className="slide-down">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>📬</div>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(20px,5vw,24px)", color: T.text, marginBottom: 8 }}>
          Check your inbox
        </h1>
        <p style={{ fontSize: 12, color: T.text3, lineHeight: 1.7 }}>
          We sent an 8-digit code to <strong style={{ color: T.text }}>{maskedEmail}</strong>. It expires in 10 minutes.
        </p>
      </div>

      <div style={{ marginBottom: 22 }}>
        <OtpInput otp={otp} setOtp={v => { setOtp(v); setOtpError(""); }} inputRefs={otpRefs} T={T} shaking={shaking} />
        {otpError && (
          <div style={{ textAlign: "center", fontSize: 11, color: "#f87171", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f87171"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
            {otpError}
          </div>
        )}
      </div>

      <button className="btn-primary" style={{ padding: 13 }} onClick={handleVerifyOtp}
        disabled={submitting || otp.join("").length < OTP_LEN}>
        {submitting ? <span className="spin">⌛</span> : "Verify code →"}
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 18 }}>
        {canResend ? (
          <button className="btn-ghost" onClick={handleResendOtp} style={{ color: "#a78bfa", fontSize: 12, fontWeight: 600 }}>
            Resend code
          </button>
        ) : (
          <>
            <CountdownRing seconds={countdown} total={59} />
            <span style={{ fontSize: 12, color: T.text3 }}>Resend in {countdown}s</span>
          </>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 14 }}>
        <button className="btn-ghost" onClick={() => { setView("email"); setOtp(Array(OTP_LEN).fill("")); setOtpError(""); setApiError(""); }}
          style={{ fontSize: 12, color: T.text3, display: "inline-flex", alignItems: "center", gap: 5 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          Change email
        </button>
      </div>
    </div>
  );

  // 3. Set new password
  const renderNewPassword = () => (
    <div className="slide-down">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>🔑</div>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(20px,5vw,24px)", color: T.text, marginBottom: 8 }}>
          Set a new password
        </h1>
        <p style={{ fontSize: 12, color: T.text3, lineHeight: 1.7 }}>
          Choose something strong — at least 8 characters, with an uppercase letter and a number.
        </p>
      </div>

      {apiBanner}

      <div style={{ marginBottom: 16 }}>
        {label("New password")}
        <div style={{ position: "relative" }}>
          <input className="auth-input" type={showNew ? "text" : "password"} placeholder="New password…" value={newPass}
            onChange={e => { setNewPass(e.target.value); setPassErrors(p => ({ ...p, pass: "" })); setApiError(""); }}
            style={{ paddingRight: 44, background: T.input, borderColor: passErrors.pass ? "rgba(248,113,113,0.5)" : T.inputBorder, color: T.text }} autoFocus />
          <button className="eye-btn" onClick={() => setShowNew(p => !p)} tabIndex={-1}><EyeIcon open={showNew} color={T.text} /></button>
        </div>
        {errMsg(passErrors.pass)}
        {newPass.length > 0 && (
          <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
            {[
              { check: newPass.length >= 8, label: "8+ chars" },
              { check: /[A-Z]/.test(newPass), label: "Uppercase" },
              { check: /[0-9]/.test(newPass), label: "Number" },
            ].map((item, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: 3, borderRadius: 99, background: item.check ? "#22c55e" : T.border, marginBottom: 4, transition: "background 0.3s" }} />
                <span style={{ fontSize: 9, color: item.check ? "#22c55e" : T.text3, fontWeight: 600 }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 22 }}>
        {label("Confirm new password")}
        <div style={{ position: "relative" }}>
          <input className="auth-input" type={showConfirm ? "text" : "password"} placeholder="Repeat password…" value={confirmPass}
            onChange={e => { setConfirmPass(e.target.value); setPassErrors(p => ({ ...p, confirm: "" })); }}
            style={{ paddingRight: 44, background: T.input, borderColor: passErrors.confirm ? "rgba(248,113,113,0.5)" : (confirmPass && confirmPass === newPass ? "rgba(34,197,94,0.45)" : T.inputBorder), color: T.text }} />
          <button className="eye-btn" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}><EyeIcon open={showConfirm} color={T.text} /></button>
        </div>
        {errMsg(passErrors.confirm)}
        {confirmPass && confirmPass === newPass && !passErrors.confirm && (
          <div style={{ fontSize: 11, color: "#22c55e", marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            Passwords match
          </div>
        )}
      </div>

      <button className="btn-primary" style={{ padding: 13 }} onClick={handleSetNewPassword} disabled={submitting}>
        {submitting ? <span className="spin">⌛</span> : "Update password →"}
      </button>
    </div>
  );

  // 4. Success
  const renderSuccess = () => (
    <div className="slide-down" style={{ textAlign: "center" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
      <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(22px,5vw,26px)", color: T.text, marginBottom: 8 }}>
        Password updated!
      </h1>
      <p style={{ fontSize: 12, color: T.text3, lineHeight: 1.7, marginBottom: 28, maxWidth: 300, margin: "0 auto 28px" }}>
        You're all set. Sign in with your new password to access your account.
      </p>
      <button className="btn-primary" style={{ padding: 13 }} onClick={handleGoToSignIn}>
        Go to sign in →
      </button>
    </div>
  );

  const viewMap = { email: renderEmail, otp: renderOtp, "new-password": renderNewPassword, success: renderSuccess };

  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{CSS}</style>

      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.07)" : "hsla(259,70%,60%,0.05)"} 0%,transparent 65%)` }} />
        <div style={{ position: "absolute", top: "10%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(280,60%,30%,0.05)" : "hsla(280,60%,60%,0.03)"} 0%,transparent 65%)` }} />
      </div>

      {/* Nav */}
      <nav style={{ padding: "0 clamp(16px,5vw,28px)", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, background: T.navBg, backdropFilter: "blur(20px)" }}>
        <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 15, color: T.text2 }}>Account recovery</span>
        <button className="btn-ghost" onClick={() => setDark(p => !p)} style={{ fontSize: 18, lineHeight: 1 }}>
          {dark ? "☀️" : "🌙"}
        </button>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(24px,5vw,48px) 20px", position: "relative", zIndex: 1 }}>
        <div className="fade-up" style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ borderRadius: 20, padding: "28px 28px 26px", background: T.card, border: `1px solid ${T.border}`, boxShadow: dark ? "0 24px 60px rgba(0,0,0,0.4)" : "0 8px 40px rgba(0,0,0,0.08)" }}>
            <StepBar current={view} T={T} />
            {viewMap[view]?.()}
          </div>

          <p style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: T.text3 }}>
            Remember your password?{" "}
            <button className="btn-ghost" onClick={handleGoToSignIn} style={{ color: "#a78bfa", fontWeight: 700, fontSize: 11 }}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}