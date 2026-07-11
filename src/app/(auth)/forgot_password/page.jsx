"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient.js";
import bcrypt from "bcryptjs";
import { useThemeStore } from "../../../../store/themeprovider";
import {
  Lock, MailCheck, KeyRound, PartyPopper, Loader2, AlertTriangle,
  AlertCircle, ArrowRight, ArrowLeft, Check,
} from "lucide-react";

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

const DARK = {
  bg: "#060608", bg2: "#0e0e18", bg3: "#14141f",
  border: "rgba(255,255,255,0.09)", border2: "rgba(255,255,255,0.14)",
  text: "#e2e2ef", text2: "#9090b0", text3: "#555570",
  card: "rgba(255,255,255,0.025)",
  input: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.11)",
  navBg: "rgba(6,6,8,0.9)",
  otpBg: "rgba(255,255,255,0.05)",
};
const LIGHT = {
  bg: "#f5f5f9", bg2: "#ffffff", bg3: "#eeeef5",
  border: "rgba(0,0,0,0.1)", border2: "rgba(0,0,0,0.16)",
  text: "#1a1a2e", text2: "#555570", text3: "#9090b0",
  card: "#ffffff",
  input: "#ffffff", inputBorder: "rgba(0,0,0,0.13)",
  navBg: "rgba(245,245,249,0.95)",
  otpBg: "#f5f5f9",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  input{font-family:'Inter',sans-serif}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}
  .fade-up{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both}
  .slide-down{animation:slideDown 0.3s cubic-bezier(0.16,1,0.3,1) both}
  .shake{animation:shake 0.4s ease}
  .spin{animation:spin 0.9s linear infinite;display:inline-block}
  .btn-primary{background:#7c3aed;border:1px solid #7c3aed;color:white;padding:12px 24px;border-radius:8px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:filter 0.15s ease;letter-spacing:-0.1px;width:100%}
  .btn-primary:hover:not(:disabled){filter:brightness(1.1)}
  .btn-primary:active:not(:disabled){filter:brightness(0.95)}
  .btn-primary:disabled{opacity:0.5;cursor:not-allowed}
  .btn-ghost{background:transparent;border:none;cursor:pointer;font-family:inherit;transition:filter 0.15s ease}
  .btn-ghost:hover{filter:brightness(1.3)}
  .btn-secondary{background:transparent;border:1px solid rgba(124,58,237,0.35);color:#a78bfa;padding:12px 24px;border-radius:8px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:border-color 0.15s ease,background 0.15s ease;width:100%}
  .btn-secondary:hover{background:rgba(124,58,237,0.08);border-color:rgba(124,58,237,0.6)}
  .auth-input{border-radius:8px;font-size:14px;outline:none;transition:border-color 0.15s ease,box-shadow 0.15s ease;width:100%;font-family:'Inter',sans-serif;padding:11px 14px;border-width:1px;border-style:solid}
  .auth-input:focus{border-color:rgba(124,58,237,0.6)!important;box-shadow:0 0 0 3px rgba(124,58,237,0.08)}
  .auth-input::placeholder{opacity:0.45}
  .otp-wrap {
  background: rgba(124,58,237,0.06);
  border: 1px solid rgba(124,58,237,0.2);
  border-radius: 10px;
  padding: 20px clamp(8px, 3vw, 16px) 16px;
  width: 100%;
}
.otp-label {
  font-size: 9px;
  font-weight: 700;
  font-family: 'JetBrains Mono',monospace;
  color: #7c3aed;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 14px;
}
.otp-row {
  display: flex;
  gap: clamp(4px, 1.4vw, 8px);
  width: 100%;
}
.otp-box {
  border-radius: 8px;
  font-size: clamp(13px, 4.2vw, 22px);
  font-weight: 800;
  text-align: center;
  outline: none;
  flex: 1 1 0;
  min-width: 0;
  aspect-ratio: 1 / 1;
  height: auto;
  border: 1.5px solid rgba(124,58,237,0.3);
  background: rgba(124,58,237,0.1);
  color: #ffffff;
  font-family: 'JetBrains Mono', monospace;
  caret-color: #a855f7;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.otp-box:focus {
  border-color: rgba(124,58,237,0.7) !important;
  box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
}
.otp-box.filled {
  border-color: rgba(124,58,237,0.55);
}
  .eye-btn{
    position: absolute;
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: opacity 0.15s ease;
  }
  .eye-btn:hover{opacity:0.9}
  .step-dot{width:8px;height:8px;border-radius:50%;transition:background 0.15s ease,width 0.15s ease,height 0.15s ease}
`;

const OTP_LEN = 8;

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
    const next = [...otp];
    text.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(text.length, OTP_LEN - 1)]?.focus();
  };

  return (
    <div className="otp-wrap">
      <div className="otp-label">Your verification code</div>
      <div className={`otp-row${shaking ? " shake" : ""}`}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => inputRefs.current[i] = el}
            className={`otp-box${digit ? " filled" : ""}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
          />
        ))}
      </div>
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 11,
        color: T.text3,
        textAlign: "center",
        marginTop: 12
      }}>
        Enter this code from your email
      </p>
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
        fill="#a855f7" fontSize="10" fontWeight="700" fontFamily="'JetBrains Mono',monospace"
        style={{ transform: "rotate(90deg)", transformOrigin: "18px 18px" }}>{seconds}</text>
    </svg>
  );
}

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
            }} />
            <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: i === idx ? "#a855f7" : i < idx ? "#22c55e" : T.text3, fontWeight: 600, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 1.5, background: i < idx ? "rgba(34,197,94,0.4)" : T.border, borderRadius: 6, marginBottom: 14 }} />
          )}
        </div>
      ))}
    </div>
  );
}

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

export default function ForgotPasswordFlow({ onBackToSignIn, dark: darkProp = true, initialEmail = "" }) {
  const router = useRouter();
   const { dark, toggleDark } = useThemeStore();
  const T = dark ? DARK : LIGHT;

  const [view, setView] = useState("email");

  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState("");

  const [otp, setOtp] = useState(Array(OTP_LEN).fill(""));
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passErrors, setPassErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [apiError, setApiError] = useState("");

  const triggerShake = () => { setShaking(true); setTimeout(() => setShaking(false), 450); };

  const maskedEmail = email
    ? email.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 5)) + c)
    : "u*****@example.com";

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

  async function handleSendOtp() {
    const err = validateEmail(email);
    if (err) { setEmailError(err); triggerShake(); return; }
    setEmailError(""); setApiError(""); setSubmitting(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .single();

      if (profileError || !profile) {
        setEmailError("No account found with this email address.");
        triggerShake();
        setSubmitting(false);
        return;
      }

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

  const handleSetNewPassword = async () => {
    const passErr = validatePassword(newPass);
    const confirmErr = newPass !== confirmPass ? "Passwords don't match" : "";
    setPassErrors({ pass: passErr, confirm: confirmErr });
    if (passErr || confirmErr) { triggerShake(); return; }

    setApiError(""); setSubmitting(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({ password: newPass });
      if (authError) {
        setApiError(authError.message || "Failed to update password.");
        triggerShake();
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPass, salt);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ password: hashedPassword })
        .eq("email", email);

      if (profileError) {
        setApiError("Password updated but profile sync failed: " + profileError.message);
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

  const errMsg = (msg) => msg ? (
    <div style={{ fontSize: 11, color: "#f87171", marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
      <AlertCircle style={iconSize(11, 11)} color="#f87171" fill="#f87171" />
      {msg}
    </div>
  ) : null;

  const label = (text) => (
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.text2, marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>{text}</label>
  );

  const apiBanner = apiError ? (
    <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#f87171", display: "flex", gap: 8, alignItems: "flex-start" }}>
      <AlertTriangle style={{ ...iconSize(13, 13), marginTop: 1 }} />
      <span>{apiError}</span>
    </div>
  ) : null;

  const renderEmail = () => (
    <div className="slide-down">
      <div style={{ marginBottom: 28 }}>
        <Lock style={{ ...iconSize(30, 36), marginBottom: 14, color: "#a78bfa" }} />
        <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, letterSpacing: "-1.2px", fontSize: "clamp(22px,5vw,26px)", color: T.text, marginBottom: 8 }}>
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
        {submitting ? <Loader2 className="spin" style={iconSize(15, 15)} /> : <BtnLabel>Send verification code</BtnLabel>}
      </button>

      <div style={{ textAlign: "center", marginTop: 18 }}>
        <button className="btn-ghost" onClick={handleGoToSignIn} style={{ fontSize: 12, color: T.text3, display: "inline-flex", alignItems: "center", gap: 5 }}>
          <ArrowLeft style={iconSize(12, 12)} />
          Back to sign in
        </button>
      </div>
    </div>
  );

  const renderOtp = () => (
    <div className="slide-down">
      <div style={{ marginBottom: 24 }}>
        <MailCheck style={{ ...iconSize(30, 36), marginBottom: 14, color: "#a78bfa" }} />
        <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, letterSpacing: "-1.1px", fontSize: "clamp(20px,5vw,24px)", color: T.text, marginBottom: 8 }}>
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
            <AlertCircle style={iconSize(11, 11)} color="#f87171" fill="#f87171" />
            {otpError}
          </div>
        )}
      </div>

      <button className="btn-primary" style={{ padding: 13 }} onClick={handleVerifyOtp}
        disabled={submitting || otp.join("").length < OTP_LEN}>
        {submitting ? <Loader2 className="spin" style={iconSize(15, 15)} /> : <BtnLabel>Verify code</BtnLabel>}
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 18 }}>
        {canResend ? (
          <button className="btn-ghost" onClick={handleResendOtp} style={{ color: "#a78bfa", fontSize: 12, fontWeight: 600 }}>
            Resend code
          </button>
        ) : (
          <>
            <CountdownRing seconds={countdown} total={59} />
            <span style={{ fontSize: 12, color: T.text3, fontFamily: "'JetBrains Mono',monospace" }}>Resend in {countdown}s</span>
          </>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 14 }}>
        <button className="btn-ghost" onClick={() => { setView("email"); setOtp(Array(OTP_LEN).fill("")); setOtpError(""); setApiError(""); }}
          style={{ fontSize: 12, color: T.text3, display: "inline-flex", alignItems: "center", gap: 5 }}>
          <ArrowLeft style={iconSize(12, 12)} />
          Change email
        </button>
      </div>
    </div>
  );

  const renderNewPassword = () => (
    <div className="slide-down">
      <div style={{ marginBottom: 24 }}>
        <KeyRound style={{ ...iconSize(30, 36), marginBottom: 14, color: "#a78bfa" }} />
        <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, letterSpacing: "-1.1px", fontSize: "clamp(20px,5vw,24px)", color: T.text, marginBottom: 8 }}>
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
          <button className="eye-btn" onClick={() => setShowNew(p => !p)} tabIndex={-1} type="button"><EyeIcon open={showNew} color={T.text} /></button>
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
                <div style={{ height: 3, borderRadius: 6, background: item.check ? "#22c55e" : T.border, marginBottom: 4, transition: "background 0.3s" }} />
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
          <button className="eye-btn" onClick={() => setShowConfirm(p => !p)} tabIndex={-1} type="button"><EyeIcon open={showConfirm} color={T.text} /></button>
        </div>
        {errMsg(passErrors.confirm)}
        {confirmPass && confirmPass === newPass && !passErrors.confirm && (
          <div style={{ fontSize: 11, color: "#22c55e", marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
            <Check style={iconSize(12, 12)} color="#22c55e" strokeWidth={2.5} />
            Passwords match
          </div>
        )}
      </div>

      <button className="btn-primary" style={{ padding: 13 }} onClick={handleSetNewPassword} disabled={submitting}>
        {submitting ? <Loader2 className="spin" style={iconSize(15, 15)} /> : <BtnLabel>Update password</BtnLabel>}
      </button>
    </div>
  );

  const renderSuccess = () => (
    <div className="slide-down" style={{ textAlign: "center" }}>
      <PartyPopper style={{ ...iconSize(40, 48), marginBottom: 16, color: "#a78bfa" }} />
      <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, letterSpacing: "-1.2px", fontSize: "clamp(22px,5vw,26px)", color: T.text, marginBottom: 8 }}>
        Password updated!
      </h1>
      <p style={{ fontSize: 12, color: T.text3, lineHeight: 1.7, marginBottom: 28, maxWidth: 300, margin: "0 auto 28px" }}>
        You're all set. Sign in with your new password to access your account.
      </p>
      <button className="btn-primary" style={{ padding: 13 }} onClick={handleGoToSignIn}>
        <BtnLabel>Go to sign in</BtnLabel>
      </button>
    </div>
  );

  const viewMap = { email: renderEmail, otp: renderOtp, "new-password": renderNewPassword, success: renderSuccess };

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{CSS}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.07)" : "hsla(259,70%,60%,0.05)"} 0%,transparent 65%)` }} />
        <div style={{ position: "absolute", top: "10%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(280,60%,30%,0.05)" : "hsla(280,60%,60%,0.03)"} 0%,transparent 65%)` }} />
      </div>

      <nav style={{ padding: "0 clamp(16px,5vw,28px)", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, background: T.navBg, backdropFilter: "blur(20px)" }}>
        <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, letterSpacing: "-0.3px", fontSize: 15, color: T.text2 }}>Account recovery</span>

      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(24px,5vw,48px) 20px", position: "relative", zIndex: 1 }}>
        <div className="fade-up" style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ borderRadius: 10, padding: "28px 28px 26px", background: T.card, border: `1px solid ${T.border}` }}>
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