"use client";
import { useState, useCallback, useEffect } from "react";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateHandle,
  validateBio,
  validatePlatformUrl,
} from "../../../lib/validation";
import {
  User, Pencil, Wrench, Palette, Bell, Lock, Link2,
  Github, Twitter, Linkedin, AlertTriangle, CheckCircle2, X,
  ChevronLeft, ChevronRight,
} from "lucide-react";

const iconSize = (min, max, vw = 3) => ({
  width: `clamp(${min}px, ${vw}vw, ${max}px)`,
  height: `clamp(${min}px, ${vw}vw, ${max}px)`,
  flexShrink: 0,
});

const BIO_MAX_LEN = 160;
const MOBILE_BREAKPOINT = 640;
const TABS_PER_PAGE = 3;

const SKILLS_ALL = [
  "React", "Vue", "Angular", "TypeScript", "JavaScript", "Python", "Rust", "Go", "Swift",
  "Kotlin", "GraphQL", "Node.js", "Django", "FastAPI", "PostgreSQL", "MongoDB", "Redis",
  "Docker", "Kubernetes", "AWS", "GCP", "Figma", "Three.js", "Web3", "ML/AI", "DevOps",
  "Solidity", "Unity", "Flutter", "Svelte", "TailwindCSS",
];

const Lbl = ({ T, children }) => (
  <span style={{ fontSize: 12, fontWeight: 600, color: T.text2 }}>{children}</span>
);

function makeTheme(dark) {
  return dark
    ? {
      text: "#ededf2",
      text2: "#a0a0a8",
      text3: "#57575f",
      border: "rgba(255,255,255,0.09)",
      border2: "rgba(255,255,255,0.16)",
      input: "rgba(255,255,255,0.04)",
      inputBorder: "rgba(255,255,255,0.1)",
      skillHaveBg: "rgba(124,58,237,0.12)",
      skillHaveBorder: "rgba(124,58,237,0.3)",
      skillHaveText: "#a78bfa",
      skillNeedBg: "rgba(236,72,153,0.1)",
      skillNeedBorder: "rgba(236,72,153,0.25)",
      skillNeedText: "#f472b6",
    }
    : {
      text: "#111116",
      text2: "#5a5a66",
      text3: "#a0a0aa",
      border: "rgba(0,0,0,0.09)",
      border2: "rgba(0,0,0,0.16)",
      input: "rgba(0,0,0,0.03)",
      inputBorder: "rgba(0,0,0,0.12)",
      skillHaveBg: "rgba(124,58,237,0.07)",
      skillHaveBorder: "rgba(124,58,237,0.2)",
      skillHaveText: "#7c3aed",
      skillNeedBg: "rgba(236,72,153,0.06)",
      skillNeedBorder: "rgba(236,72,153,0.18)",
      skillNeedText: "#db2777",
    };
}

const SETTING_SECTIONS = [
  { id: "account", Icon: User,     l: "Account" },
  { id: "profile", Icon: Pencil,   l: "Profile" },
  { id: "skills", Icon: Wrench,    l: "Skills" },
  { id: "appearance", Icon: Palette, l: "Appearance" },
  { id: "notifications", Icon: Bell, l: "Notifications" },
  { id: "privacy", Icon: Lock,     l: "Privacy" },
  { id: "integrations", Icon: Link2, l: "Integrations" },
];

const PLATFORMS = [
  {
    key: "github",
    Icon: Github,
    l: "GitHub",
    d: "Import repos & show contribution stats",
    color: "#6e40c9",
    placeholder: "https://github.com/yourusername",
    domains: ["github.com"],
  },
  {
    key: "twitter",
    Icon: Twitter,
    l: "Twitter / X",
    d: "Share your matches and projects",
    color: "#1d9bf0",
    placeholder: "https://twitter.com/yourhandle",
    domains: ["twitter.com", "x.com"],
  },
  {
    key: "linkedin",
    Icon: Linkedin,
    l: "LinkedIn",
    d: "Import your professional background",
    color: "#0a66c2",
    placeholder: "https://linkedin.com/in/yourprofile",
    domains: ["linkedin.com"],
  },
];

const FieldMsg = ({ error, success }) => {
  if (error) return (
    <div style={{ fontSize: 11, color: "#f87171", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
      <AlertTriangle style={iconSize(11, 13)} /> {error}
    </div>
  );
  if (success) return (
    <div style={{ fontSize: 11, color: "#4ade80", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
      <CheckCircle2 style={iconSize(11, 13)} /> {success}
    </div>
  );
  return null;
};

const Banner = ({ error, success, onDismiss }) => {
  if (!error && !success) return null;
  const isErr = !!error;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 14px", borderRadius: 8, marginBottom: 18,
      background: isErr ? "rgba(239,68,68,0.1)" : "rgba(74,222,128,0.1)",
      border: `1px solid ${isErr ? "rgba(239,68,68,0.3)" : "rgba(74,222,128,0.3)"}`,
      fontSize: 12, fontWeight: 600,
      color: isErr ? "#f87171" : "#4ade80",
      flexWrap: "wrap", gap: 8,
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {isErr ? <AlertTriangle style={iconSize(13, 15)} /> : <CheckCircle2 style={iconSize(13, 15)} />}
        {isErr ? error : success}
      </span>
      <button onClick={onDismiss} style={{
        background: "transparent", border: "none", cursor: "pointer",
        color: "inherit", display: "flex", padding: 0,
      }}><X style={iconSize(13, 15)} /></button>
    </div>
  );
};

const Field = ({ T, label, id, type = "text", placeholder, value, onChange, prefix, error, maxLength }) => (
  <div style={{ marginBottom: 16 }}>
    <label
      htmlFor={id}
      style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}
    >
      {label}
    </label>
    <div
      className="field-wrap"
      style={{
        display: "flex", alignItems: "stretch",
        background: T.input,
        border: `1px solid ${error ? "#f87171" : T.inputBorder}`,
        borderRadius: 8, overflow: "hidden",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    >
      {prefix && (
        <span style={{
          display: "flex", alignItems: "center",
          padding: "10px 0 10px 14px",
          fontSize: 13, color: T.text3, whiteSpace: "nowrap", userSelect: "none",
        }}>{prefix}</span>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        autoComplete={type === "password" ? "new-password" : type === "email" ? "email" : "off"}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        style={{
          background: "transparent",
          border: "none",
          color: T.text,
          fontSize: 13, outline: "none",
          padding: prefix ? "10px 14px 10px 6px" : "10px 14px",
          flex: 1, minWidth: 0, fontFamily: "'Inter',sans-serif", boxSizing: "border-box",
        }}
      />
    </div>
    <div id={error ? `${id}-error` : undefined}>
      <FieldMsg error={error} />
    </div>
  </div>
);

const Toggle = ({ on, onToggle, dark }) => (
  <button
    onClick={onToggle}
    aria-pressed={on}
    style={{
      width: 44, height: 24, borderRadius: 12, border: "none",
      cursor: "pointer", position: "relative",
      background: on ? "#7c3aed" : dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      transition: "background 0.2s", flexShrink: 0,
    }}
  >
    <div style={{
      width: 18, height: 18, borderRadius: "50%", background: "white",
      position: "absolute", top: 3, left: on ? 23 : 3,
      transition: "left 0.2s cubic-bezier(0.34,1.56,0.64,1)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
    }} />
  </button>
);

export default function SettingsTab({
  dark: darkProp,
  setDark: setDarkProp,
  currentUser: currentUserProp,
  setCurrentUser: setCurrentUserProp,
  setDashPage,
}) {
  const [_dark, _setDark] = useState(false);
  const [_currentUser, _setCurrentUser] = useState({
    name: "Alex Chen", handle: "alexchen", bio: "Full-stack dev building cool things.",
    location: "San Francisco", github: "alexchen", skillsHave: ["React", "TypeScript", "Node.js"],
    skillsNeed: ["Rust", "ML/AI"], lookingFor: "Collaborator",
  });

  const dark = darkProp ?? _dark;
  const setDark = setDarkProp ?? _setDark;
  const currentUser = currentUserProp ?? _currentUser;
  const setCurrentUser = setCurrentUserProp ?? _setCurrentUser;

  const T = makeTheme(dark);

  const [settingsTab, setSettingsTab] = useState("account");

  // Responsive: track whether we're on a mobile-width viewport so the
  // sidebar can switch from a full vertical list to a paginated tab bar.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Which "page" of tabs is showing on mobile (arrows step through pages
  // instead of letting the row scroll/drag, so tabs are always fully visible).
  const [tabPage, setTabPage] = useState(0);
  const totalPages = Math.ceil(SETTING_SECTIONS.length / TABS_PER_PAGE);

  // Keep the visible page in sync with whichever tab is active (covers the
  // initial render, resizing into mobile, and programmatic tab changes).
  useEffect(() => {
    if (!isMobile) return;
    const idx = SETTING_SECTIONS.findIndex(s => s.id === settingsTab);
    if (idx >= 0) setTabPage(Math.floor(idx / TABS_PER_PAGE));
  }, [settingsTab, isMobile]);

  const visibleSections = isMobile
    ? SETTING_SECTIONS.slice(tabPage * TABS_PER_PAGE, tabPage * TABS_PER_PAGE + TABS_PER_PAGE)
    : SETTING_SECTIONS;

  const goPrevPage = () => setTabPage(p => Math.max(0, p - 1));
  const goNextPage = () => setTabPage(p => Math.min(totalPages - 1, p + 1));

  const [bannerErr, setBannerErr] = useState("");
  const [bannerOk, setBannerOk] = useState("");

  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

  useEffect(() => {
    const userEmail = currentUserProp?.email ?? currentUser?.email;
    if (userEmail) {
      setEmail(userEmail);
      setOriginalEmail(userEmail);
    }
  }, [currentUserProp?.email, currentUser?.email]);

  const [profileErrors, setProfileErrors] = useState({ name: "", handle: "", bio: "" });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState({
    match: true, connect: true, message: true, digest: false, views: false,
  });
  const [privacyPrefs, setPrivacyPrefs] = useState({
    publicProfile: true, onlineStatus: true, discoverable: true, showLocation: false,
  });

  const [integrations, setIntegrations] = useState({
    github: { connected: false, connecting: false, url: "", inputVal: "", error: "" },
    twitter: { connected: false, connecting: false, url: "", inputVal: "", error: "" },
    linkedin: { connected: false, connecting: false, url: "", inputVal: "", error: "" },
  });

  const updInt = (key, patch) =>
    setIntegrations(p => ({ ...p, [key]: { ...p[key], ...patch } }));

  const showErr = (msg) => { setBannerErr(msg); setBannerOk(""); };
  const showOk = (msg) => { setBannerOk(msg); setBannerErr(""); };
  const clearBanner = () => { setBannerErr(""); setBannerOk(""); };

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const switchTab = (id) => {
    setSettingsTab(id);
    clearBanner();
    setFieldErrors({ email: "", password: "" });
    setProfileErrors({ name: "", handle: "", bio: "" });
    setSaved(false);
  };

  const fakeApiCall = () =>
    new Promise((res) => setTimeout(res, 700));

  const handleAccountUpdate = async () => {
    const trimmedEmail = email.trim();
    const emailChanged = trimmedEmail !== originalEmail;
    const emailErr = emailChanged ? validateEmail(trimmedEmail) : "";
    const passErr = password ? validatePassword(password, { required: true }) : "";
    setFieldErrors({ email: emailErr, password: passErr });
    if (emailErr || passErr) return;
    if (!emailChanged && !password) {
      showErr("No changes to save.");
      return;
    }

    setLoading(true);
    clearBanner();
    try {
      const payload = {};
      if (emailChanged) payload.newEmail = trimmedEmail;
      if (password) payload.newPassword = password;

      const res = await fetch("/api/settings/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showErr(data.message || `Error ${res.status}: Failed to update account.`);
      } else {
        if (emailChanged) setOriginalEmail(trimmedEmail);
        setPassword("");
        showOk("Account updated successfully.");
        flashSaved();
      }
    } catch {
      showErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    const nameErr = validateName(currentUser.name);
    const handleErr = validateHandle(currentUser.handle);
    const bioErr = validateBio(currentUser.bio);
    setProfileErrors({ name: nameErr, handle: handleErr, bio: bioErr });
    if (nameErr || handleErr || bioErr) return;

    setLoading(true);
    clearBanner();
    try {
      const res = await fetch("/api/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: currentUser.name,
          handle: currentUser.handle,
          bio: currentUser.bio,
          location: currentUser.location,
          looking_for: currentUser.lookingFor,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showErr(data.message || `Error ${res.status}: Failed to update profile.`);
      } else {
        showOk("Profile saved successfully.");
        flashSaved();
        setDashPage?.("profile");
      }
    } catch {
      showErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkillsUpdate = async () => {
    if (!currentUser.skillsHave?.length) {
      showErr("Please select at least one skill you have.");
      return;
    }

    setLoading(true);
    clearBanner();
    try {
      const res = await fetch("/api/settings/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillHave: currentUser.skillsHave,
          skillNeed: currentUser.skillsNeed,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showErr(data.message || `Error ${res.status}: Failed to update skills.`);
      } else {
        showOk("Skills updated. Match scores are being recalculated.");
        flashSaved();
      }
    } catch {
      showErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAppearanceToggle = (newDark) => {
    setDark(newDark);
  };

  const handleNotificationsUpdate = async () => {
    setLoading(true);
    clearBanner();
    await fakeApiCall();
    showOk("Notification preferences saved.");
    flashSaved();
    setLoading(false);
  };

  const handlePrivacyUpdate = async () => {
    setLoading(true);
    clearBanner();
    try {
      const res = await fetch("/api/settings/privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacyPreferences: privacyPrefs }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showErr(data.message || `Error ${res.status}: Failed to save privacy settings.`);
      } else {
        showOk("Privacy settings saved.");
        flashSaved();
      }
    } catch {
      showErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrationUpdate = async () => {
    setLoading(true);
    clearBanner();
    try {
      const res = await fetch("/api/settings/integration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github: integrations.github.url,
          x: integrations.twitter.url,
          linkedin: integrations.linkedin.url,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showErr(data.message || `Error ${res.status}: Failed to save integrations.`);
      } else {
        showOk("Integrations saved.");
        flashSaved();
      }
    } catch {
      showErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const intOpen = (key) => updInt(key, { connecting: true, inputVal: "", error: "" });
  const intCancel = (key) => updInt(key, { connecting: false, inputVal: "", error: "" });
  const intConfirm = (key, domains) => {
    const s = integrations[key];
    const trimmed = s.inputVal.trim();
    const err = validatePlatformUrl(trimmed, domains);
    if (err) { updInt(key, { error: err }); return; }
    updInt(key, { connected: true, connecting: false, url: trimmed, error: "" });
  };
  const intDisconnect = (key) =>
    updInt(key, { connected: false, url: "", inputVal: "", error: "" });

  const profileCompletion = (() => {
    let s = 0;
    if (currentUser.name) s += 15;
    if (currentUser.bio?.length > 20) s += 15;
    if (currentUser.location) s += 15;
    if (currentUser.skillsHave?.length >= 2) s += 20;
    if (currentUser.skillsNeed?.length >= 1) s += 15;
    if (currentUser.lookingFor) s += 20;
    return s;
  })();

  const cardStyle = {
    background: dark ? "rgba(255,255,255,0.03)" : "#ffffff",
    border: `1px solid ${T.border}`,
    borderRadius: 10,
  };

  const primaryBtn = (extra = {}) => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "10px 22px",
    background: saved ? "rgba(34,197,94,0.15)" : "#7c3aed",
    border: saved ? "1px solid rgba(34,197,94,0.35)" : "1px solid #7c3aed",
    color: saved ? "#4ade80" : "white",
    borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif",
    fontSize: 13, fontWeight: 700, transition: "background 0.2s,border-color 0.2s,color 0.2s",
    opacity: loading ? 0.7 : 1,
    width: "100%",
    justifyContent: "center",
    boxSizing: "border-box",
    ...extra,
  });

  const bioLen = currentUser.bio?.length ?? 0;

  // Shared renderer for a single sidebar tab button so desktop (vertical
  // list) and mobile (paginated row) stay visually consistent.
  const renderTabButton = (s) => (
    <button
      key={s.id}
      className={isMobile ? "settings-tab-btn settings-tab-btn--mobile" : "settings-tab-btn"}
      onClick={() => switchTab(s.id)}
      aria-current={settingsTab === s.id ? "true" : undefined}
      style={
        isMobile
          ? {
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "11px 8px", borderRadius: 8, cursor: "pointer", minWidth: 0,
            border: `1px solid ${settingsTab === s.id ? T.border : "transparent"}`,
            background: settingsTab === s.id
              ? dark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.07)"
              : "transparent",
            fontFamily: "'Inter',sans-serif",
          }
          : {
            display: "flex", alignItems: "center", gap: 11,
            padding: "11px 13px", borderRadius: 8, cursor: "pointer",
            transition: "border-color 0.15s,background 0.15s",
            border: `1px solid ${settingsTab === s.id ? T.border : "transparent"}`,
            background: settingsTab === s.id
              ? dark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.07)"
              : "transparent",
            fontFamily: "'Inter',sans-serif", marginBottom: 2,
          }
      }
    >
      <s.Icon style={{ ...iconSize(14, 16), color: settingsTab === s.id ? T.text : T.text3, flexShrink: 0 }} />
      <span style={{
        fontSize: isMobile ? 12 : 13, fontWeight: isMobile ? 600 : 500,
        color: settingsTab === s.id ? T.text : T.text3,
        minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {s.l}
      </span>
    </button>
  );

  return (
    <div style={{
      maxWidth: 700, margin: "0 auto",
      fontFamily: "'Inter',sans-serif",
      color: T.text,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .field-wrap:focus-within {
          border-color: rgba(124,58,237,0.6) !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
        }
        .settings-header {
          display: flex; justify-content: space-between; align-items: flex-end;
          flex-wrap: wrap; gap: 14px; margin-bottom: 22px;
        }
        .settings-progress { width: 160px; }
        .settings-layout { display: flex; gap: 16px; align-items: flex-start; }
        .settings-sidebar {
          width: 180px; flex-shrink: 0; padding: 10px;
        }
        .settings-tab-btn { width: 100%; }
        .settings-content { flex: 1; min-width: 0; padding: 22px; box-sizing: border-box; }
        .int-top-row { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
        .int-top-row-actions { flex-shrink: 0; margin-left: auto; }
        .int-input-row { display: flex; gap: 8px; align-items: flex-start; flex-wrap: wrap; }
        .int-input-field { flex: 1; min-width: 180px; }
        .int-input-btn { flex-shrink: 0; }
        .settings-save-btn { width: auto; }
        .settings-sidebar-mobile { display: flex; align-items: stretch; gap: 6px; width: 100%; }
        .settings-tabs-row { display: flex; gap: 6px; flex: 1; min-width: 0; }
        .settings-tab-btn--mobile { flex: 1; min-width: 0; }
        .settings-page-arrow {
          flex-shrink: 0; width: 30px; border-radius: 8px; border: none;
          display: flex; align-items: center; justify-content: center;
          background: transparent; cursor: pointer;
        }
        .settings-page-arrow:disabled { opacity: 0.3; cursor: not-allowed; }
        @media (max-width: 640px) {
          .settings-layout { flex-direction: column; }
          .settings-sidebar {
            width: 100%; padding: 8px;
          }
          .settings-content { padding: 16px; }
          .settings-progress { width: min(160px, 60vw); }
        }
      `}</style>

      <div className="settings-header">
        <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 24, color: T.text, margin: 0, letterSpacing: "-0.4px" }}>
          Settings
        </h1>
        <div className="settings-progress">
          <div style={{ fontSize: 11, color: T.text3, marginBottom: 5 }}>
            Profile <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{profileCompletion}%</span> complete
          </div>
          <div style={{
            width: "100%", height: 4,
            background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
            borderRadius: 99, overflow: "hidden",
          }}>
            <div style={{
              height: "100%", width: `${profileCompletion}%`,
              background: profileCompletion >= 80 ? "#4ade80" : profileCompletion >= 50 ? "#a78bfa" : "#f59e0b",
              borderRadius: 99, transition: "width 0.5s",
            }} />
          </div>
        </div>
      </div>

      <div className="settings-layout">

        <div className="settings-sidebar" style={cardStyle}>
          {isMobile ? (
            <div className="settings-sidebar-mobile">
              <button
                type="button"
                className="settings-page-arrow"
                onClick={goPrevPage}
                disabled={tabPage === 0}
                aria-label="Show previous tabs"
                style={{ color: T.text3 }}
              >
                <ChevronLeft style={iconSize(16, 18)} />
              </button>
              <div className="settings-tabs-row">
                {visibleSections.map(renderTabButton)}
              </div>
              <button
                type="button"
                className="settings-page-arrow"
                onClick={goNextPage}
                disabled={tabPage === totalPages - 1}
                aria-label="Show more tabs"
                style={{ color: T.text3 }}
              >
                <ChevronRight style={iconSize(16, 18)} />
              </button>
            </div>
          ) : (
            SETTING_SECTIONS.map(renderTabButton)
          )}
        </div>

        <div className="settings-content" style={cardStyle}>

          {settingsTab === "account" && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginTop: 0 }}>Account Settings</h2>
              <Banner error={bannerErr} success={bannerOk} onDismiss={clearBanner} />

              <Field
                T={T}
                label="Email Address"
                id="s_email"
                type="email"
                value={email}
                onChange={v => {
                  setEmail(v);
                  if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: "" }));
                }}
                error={fieldErrors.email}
              />
              <Field
                T={T}
                label="New Password"
                id="s_pass"
                type="password"
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={v => {
                  setPassword(v);
                  if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: "" }));
                }}
                error={fieldErrors.password}
              />
              {!fieldErrors.password && password && (
                <div style={{ fontSize: 11, color: T.text3, marginBottom: 12, marginLeft: 2 }}>
                  Tip: 8+ chars, one uppercase letter, one number.
                </div>
              )}
              <button onClick={handleAccountUpdate} disabled={loading} style={primaryBtn({ marginTop: 4 })} className="settings-save-btn">
                {loading ? "Saving…" : saved ? <><CheckCircle2 style={iconSize(13, 15)} /> Saved!</> : "Save Changes"}
              </button>
            </>
          )}

          {settingsTab === "profile" && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginTop: 0, marginBottom: 18 }}>Edit Profile</h2>
              <Banner error={bannerErr} success={bannerOk} onDismiss={clearBanner} />

              <Field
                T={T}
                label="Full Name"
                id="s_name"
                value={currentUser.name}
                onChange={v => {
                  setCurrentUser(p => ({ ...p, name: v }));
                  if (profileErrors.name) setProfileErrors(p => ({ ...p, name: "" }));
                }}
                error={profileErrors.name}
              />
              <Field
                T={T}
                label="Username"
                id="s_handle"
                value={currentUser.handle}
                onChange={v => {
                  setCurrentUser(p => ({ ...p, handle: v }));
                  if (profileErrors.handle) setProfileErrors(p => ({ ...p, handle: "" }));
                }}
                prefix="@"
                error={profileErrors.handle}
              />

              <div style={{ marginBottom: 18 }}>
                <label
                  htmlFor="s_bio"
                  style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}
                >
                  Bio
                </label>
                <textarea
                  id="s_bio"
                  rows={3}
                  maxLength={BIO_MAX_LEN}
                  value={currentUser.bio}
                  onChange={e => {
                    setCurrentUser(p => ({ ...p, bio: e.target.value }));
                    if (profileErrors.bio) setProfileErrors(p => ({ ...p, bio: "" }));
                  }}
                  aria-invalid={!!profileErrors.bio}
                  aria-describedby={profileErrors.bio ? "s_bio-error" : undefined}
                  style={{
                    background: T.input,
                    border: `1px solid ${profileErrors.bio ? "#f87171" : T.inputBorder}`,
                    color: T.text, borderRadius: 8, fontSize: 13, outline: "none",
                    padding: "10px 14px", width: "100%", fontFamily: "'Inter',sans-serif",
                    resize: "vertical", boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <div id={profileErrors.bio ? "s_bio-error" : undefined}>
                    <FieldMsg error={profileErrors.bio} />
                  </div>
                  <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: bioLen > BIO_MAX_LEN - 20 ? "#f59e0b" : T.text3, marginLeft: "auto" }}>
                    {bioLen}/{BIO_MAX_LEN}
                  </span>
                </div>
              </div>

              <Field
                T={T}
                label="Location" id="s_loc"
                value={currentUser.location || ""}
                placeholder="City, Country"
                onChange={v => setCurrentUser(p => ({ ...p, location: v }))}
              />

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 10 }}>Looking for</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Collaborator", "Mentor", "Mentee", "Co-founder"].map(l => (
                    <button
                      key={l}
                      onClick={() => setCurrentUser(p => ({ ...p, lookingFor: l }))}
                      style={{
                        padding: "8px 16px", borderRadius: 8,
                        border: `1px solid ${currentUser.lookingFor === l ? "rgba(124,58,237,0.5)" : T.border}`,
                        background: currentUser.lookingFor === l
                          ? dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.07)"
                          : "transparent",
                        color: currentUser.lookingFor === l ? "#a78bfa" : T.text3,
                        cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600,
                        transition: "border-color 0.15s,color 0.15s,background 0.15s",
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleProfileUpdate} disabled={loading} style={primaryBtn()} className="settings-save-btn">
                {loading ? "Saving…" : saved ? <><CheckCircle2 style={iconSize(13, 15)} /> Saved!</> : "Save"}
              </button>
            </>
          )}

          {settingsTab === "skills" && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginTop: 0, marginBottom: 6 }}>Your Skills</h2>
              <p style={{ fontSize: 12, color: T.text3, marginBottom: 16 }}>
                Updating skills recalculates all match scores in real-time.
              </p>
              <Banner error={bannerErr} success={bannerOk} onDismiss={clearBanner} />

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <Lbl T={T}>Skills I Have</Lbl>
                  <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: currentUser.skillsHave?.length >= 6 ? "#f87171" : T.text3 }}>
                    {currentUser.skillsHave?.length ?? 0}/6
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                  {currentUser.skillsHave?.map(s => (
                    <span
                      key={s}
                      onClick={() => setCurrentUser(p => ({ ...p, skillsHave: p.skillsHave.filter(x => x !== s) }))}
                      style={{ padding: "5px 11px", borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                    >
                      {s} <X style={{ ...iconSize(9, 11), opacity: 0.6 }} />
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {SKILLS_ALL.filter(s => !currentUser.skillsHave?.includes(s)).slice(0, 15).map(s => (
                    <button
                      key={s}
                      disabled={(currentUser.skillsHave?.length ?? 0) >= 6}
                      onClick={() => setCurrentUser(p => ({ ...p, skillsHave: [...p.skillsHave, s] }))}
                      style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", cursor: (currentUser.skillsHave?.length ?? 0) < 6 ? "pointer" : "not-allowed", border: `1px solid ${T.border}`, background: "transparent", color: T.text3, transition: "border-color 0.15s,color 0.15s", opacity: (currentUser.skillsHave?.length ?? 0) >= 6 ? 0.4 : 1 }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: 1, background: T.border, margin: "0 0 20px" }} />

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <Lbl T={T}>Skills I Need</Lbl>
                  <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: currentUser.skillsNeed?.length >= 6 ? "#f87171" : T.text3 }}>
                    {currentUser.skillsNeed?.length ?? 0}/6
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                  {currentUser.skillsNeed?.map(s => (
                    <span
                      key={s}
                      onClick={() => setCurrentUser(p => ({ ...p, skillsNeed: p.skillsNeed.filter(x => x !== s) }))}
                      style={{ padding: "5px 11px", borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                    >
                      {s} <X style={{ ...iconSize(9, 11), opacity: 0.6 }} />
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {SKILLS_ALL.filter(s => !currentUser.skillsNeed?.includes(s)).slice(0, 15).map(s => (
                    <button
                      key={s}
                      disabled={(currentUser.skillsNeed?.length ?? 0) >= 6}
                      onClick={() => setCurrentUser(p => ({ ...p, skillsNeed: [...p.skillsNeed, s] }))}
                      style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", cursor: (currentUser.skillsNeed?.length ?? 0) < 6 ? "pointer" : "not-allowed", border: `1px solid ${T.border}`, background: "transparent", color: T.text3, transition: "border-color 0.15s,color 0.15s", opacity: (currentUser.skillsNeed?.length ?? 0) >= 6 ? 0.4 : 1 }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ height: 1, background: T.border, margin: "20px 0" }} />
              <button onClick={handleSkillsUpdate} disabled={loading} style={primaryBtn()} className="settings-save-btn">
                {loading ? "Saving…" : saved ? <><CheckCircle2 style={iconSize(13, 15)} /> Saved!</> : "Save Changes"}
              </button>
            </>
          )}

          {settingsTab === "appearance" && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginTop: 0, marginBottom: 18 }}>Appearance</h2>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${T.border}`, marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Dark Mode</div>
                  <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>Easier on the eyes at night</div>
                </div>
                <Toggle
                  on={dark}
                  dark={dark}
                  onToggle={() => handleAppearanceToggle(!dark)}
                />
              </div>

              <div style={{ fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 12 }}>Theme</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { l: "Dark", isDark: true, bg: "#0a0a0f", card: "rgba(255,255,255,0.04)", text: "#ededf2", accent: "#7c3aed" },
                  { l: "Light", isDark: false, bg: "#fafafa", card: "#ffffff", text: "#111116", accent: "#7c3aed" },
                ].map(theme => {
                  const isActive = dark === theme.isDark;
                  return (
                    <div
                      key={theme.l}
                      onClick={() => handleAppearanceToggle(theme.isDark)}
                      style={{ borderRadius: 10, background: theme.bg, border: `1px solid ${isActive ? "#7c3aed" : T.border}`, cursor: "pointer", overflow: "hidden", transition: "border-color 0.15s" }}
                    >
                      <div style={{ padding: 12 }}>
                        <div style={{ height: 6, width: "60%", borderRadius: 3, background: theme.accent, marginBottom: 8 }} />
                        <div style={{ display: "flex", gap: 6 }}>
                          {[0, 1].map(i => (
                            <div key={i} style={{ flex: 1, height: 40, borderRadius: 6, background: theme.card, border: `1px solid rgba(${theme.isDark ? "255,255,255,0.07" : "0,0,0,0.07"})` }} />
                          ))}
                        </div>
                      </div>
                      <div style={{ padding: "8px 12px", borderTop: `1px solid rgba(${theme.isDark ? "255,255,255,0.06" : "0,0,0,0.06"})`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: theme.text }}>{theme.l}</span>
                        {isActive && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: "#a78bfa", fontWeight: 700 }}><CheckCircle2 style={iconSize(10, 12)} /> Active</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 16, fontSize: 11, color: T.text3 }}>
                Changes apply instantly — no save needed.
              </div>
            </>
          )}

          {settingsTab === "notifications" && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginTop: 0, marginBottom: 4 }}>Notification Preferences</h2>
              <div style={{ fontSize: 11, color: T.text3, marginBottom: 16, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.25)", padding: "2px 8px", borderRadius: 6, fontWeight: 700, fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>
                  DEMO
                </span>
                Preferences are saved locally for preview purposes.
              </div>
              <Banner error={bannerErr} success={bannerOk} onDismiss={clearBanner} />
              {[
                { key: "match", l: "New match found", d: "When AI finds a high-scoring match" },
                { key: "connect", l: "Connection requests", d: "When someone wants to connect" },
                { key: "message", l: "Messages", d: "When you receive a new message" },
                { key: "digest", l: "Weekly digest", d: "Summary of your top matches" },
                { key: "views", l: "Profile views", d: "When someone views your profile" },
              ].map((n, i, arr) => (
                <div key={n.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{n.l}</div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{n.d}</div>
                  </div>
                  <Toggle on={notifPrefs[n.key]} dark={dark} onToggle={() => setNotifPrefs(p => ({ ...p, [n.key]: !p[n.key] }))} />
                </div>
              ))}
              <div style={{ height: 1, background: T.border, margin: "20px 0" }} />
              <button onClick={handleNotificationsUpdate} disabled={loading} style={primaryBtn()} className="settings-save-btn">
                {loading ? "Saving…" : saved ? <><CheckCircle2 style={iconSize(13, 15)} /> Saved!</> : "Save Preferences"}
              </button>
            </>
          )}

          {settingsTab === "privacy" && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginTop: 0, marginBottom: 18 }}>Privacy</h2>
              <Banner error={bannerErr} success={bannerOk} onDismiss={clearBanner} />
              {[
                { key: "publicProfile", l: "Public profile", d: "Anyone can see your profile" },
                { key: "onlineStatus", l: "Show online status", d: "Let others see when you're active" },
                { key: "discoverable", l: "Discoverable", d: "Appear in match results" },
                { key: "showLocation", l: "Show location", d: "Display your city on your profile" },
              ].map((n, i, arr) => (
                <div key={n.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{n.l}</div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{n.d}</div>
                  </div>
                  <Toggle on={privacyPrefs[n.key]} dark={dark} onToggle={() => setPrivacyPrefs(p => ({ ...p, [n.key]: !p[n.key] }))} />
                </div>
              ))}
              <div style={{ height: 1, background: T.border, margin: "20px 0" }} />
              <button onClick={handlePrivacyUpdate} disabled={loading} style={primaryBtn()} className="settings-save-btn">
                {loading ? "Saving…" : saved ? <><CheckCircle2 style={iconSize(13, 15)} /> Saved!</> : "Save Changes"}
              </button>
            </>
          )}

          {settingsTab === "integrations" && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginTop: 0, marginBottom: 6 }}>Connected Accounts</h2>
              <p style={{ fontSize: 12, color: T.text3, marginBottom: 16 }}>
                Link your accounts to import data and share your work.
              </p>
              <Banner error={bannerErr} success={bannerOk} onDismiss={clearBanner} />

              {PLATFORMS.map(int => {
                const s = integrations[int.key];
                const liveVal = s.inputVal.trim();
                const liveError = liveVal ? validatePlatformUrl(liveVal, int.domains) : "";
                const isValidLive = liveVal && !liveError;

                return (
                  <div key={int.key} style={{ border: `1px solid ${s.connecting ? T.border2 : T.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 10, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)", transition: "border-color 0.15s" }}>

                    <div className="int-top-row">
                      <div style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0, background: s.connected ? `${int.color}22` : dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${s.connected ? `${int.color}44` : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: s.connected ? int.color : T.text3, transition: "border-color 0.15s,color 0.15s" }}>
                        <int.Icon style={iconSize(16, 18)} />
                      </div>
                      <div style={{ flex: "1 1 160px", minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{int.l}</div>
                        <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{int.d}</div>
                        {s.connected && (
                          <div style={{ fontSize: 10, color: T.text3, marginTop: 3, fontFamily: "'JetBrains Mono',monospace", opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {s.url}
                          </div>
                        )}
                        {s.connected && (
                          <div style={{ fontSize: 11, color: "#4ade80", marginTop: 3, display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} /> Connected
                          </div>
                        )}
                      </div>
                      <div className="int-top-row-actions">
                        {s.connected ? (
                          <button onClick={() => intDisconnect(int.key)} style={{ padding: "7px 16px", background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", borderRadius: 8, cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, flexShrink: 0, transition: "border-color 0.15s" }}>
                            Disconnect
                          </button>
                        ) : s.connecting ? (
                          <button onClick={() => intCancel(int.key)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${T.border}`, color: T.text2, borderRadius: 8, cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: 12, flexShrink: 0 }}>
                            <X style={iconSize(11, 13)} /> Cancel
                          </button>
                        ) : (
                          <button onClick={() => intOpen(int.key)} style={{ padding: "7px 16px", background: "#7c3aed", border: "1px solid #7c3aed", color: "white", borderRadius: 8, cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, flexShrink: 0, transition: "filter 0.15s" }}>
                            Connect
                          </button>
                        )}
                      </div>
                    </div>

                    {s.connecting && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
                        <label htmlFor={`int_${int.key}`} style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Platform URL</label>
                        <div className="int-input-row">
                          <div className="int-input-field">
                            <input
                              id={`int_${int.key}`}
                              type="url"
                              autoFocus
                              placeholder={int.placeholder}
                              value={s.inputVal}
                              onChange={e => updInt(int.key, { inputVal: e.target.value, error: "" })}
                              onKeyDown={e => {
                                if (e.key === "Enter") intConfirm(int.key, int.domains);
                                if (e.key === "Escape") intCancel(int.key);
                              }}
                              aria-invalid={!!s.error}
                              aria-describedby={s.error ? `int_${int.key}_error` : undefined}
                              style={{ width: "100%", padding: "9px 12px", boxSizing: "border-box", background: T.input, border: `1px solid ${s.error ? "#f87171" : isValidLive ? "#4ade80" : T.inputBorder}`, color: T.text, borderRadius: 8, fontSize: 12, fontFamily: "'Inter',sans-serif", outline: "none", transition: "border-color 0.15s" }}
                            />
                            {s.error && <div id={`int_${int.key}_error`} style={{ fontSize: 11, color: "#f87171", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}><AlertTriangle style={iconSize(11, 13)} /> {s.error}</div>}
                            {!s.error && isValidLive && <div style={{ fontSize: 11, color: "#4ade80", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 style={iconSize(11, 13)} /> Looks good</div>}
                            {!s.error && !isValidLive && s.inputVal && <div style={{ fontSize: 11, color: T.text3, marginTop: 5 }}>e.g. {int.placeholder}</div>}
                          </div>
                          <button className="int-input-btn" onClick={() => intConfirm(int.key, int.domains)} style={{ padding: "9px 16px", background: "#7c3aed", border: "1px solid #7c3aed", color: "white", borderRadius: 8, cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700 }}>
                            Connect
                          </button>
                          <button className="int-input-btn" onClick={() => intCancel(int.key)} style={{ padding: "9px 14px", background: "transparent", border: `1px solid ${T.border}`, color: T.text2, borderRadius: 8, cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: 12 }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {Object.values(integrations).some(i => i.connected) && (
                <button onClick={handleIntegrationUpdate} disabled={loading} style={primaryBtn({ marginTop: 6 })} className="settings-save-btn">
                  {loading ? "Saving" : saved ? <><CheckCircle2 style={iconSize(13, 15)} /> Saved</> : "Save Integrations"}
                </button>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}