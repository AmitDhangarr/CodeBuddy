"use client";
import { useState } from "react";

/* ─── Minimal inline stand-ins for shared constants ──────────────────────── */
const SKILLS_ALL = [
  "React","Vue","Angular","TypeScript","JavaScript","Python","Rust","Go","Swift",
  "Kotlin","GraphQL","Node.js","Django","FastAPI","PostgreSQL","MongoDB","Redis",
  "Docker","Kubernetes","AWS","GCP","Figma","Three.js","Web3","ML/AI","DevOps",
  "Solidity","Unity","Flutter","Svelte","TailwindCSS",
];

const Lbl = ({ T, children }) => (
  <span style={{ fontSize: 12, fontWeight: 600, color: T.text2 }}>{children}</span>
);

/* ─── Minimal theme token builder (mirrors your existing light/dark tokens) ─ */
function makeTheme(dark) {
  return dark
    ? {
        text:            "#e2e2ef",
        text2:           "#a0a0b8",
        text3:           "#606078",
        border:          "rgba(255,255,255,0.08)",
        input:           "rgba(255,255,255,0.04)",
        inputBorder:     "rgba(255,255,255,0.12)",
        skillHaveBg:     "rgba(124,58,237,0.12)",
        skillHaveBorder: "rgba(124,58,237,0.3)",
        skillHaveText:   "#a78bfa",
        skillNeedBg:     "rgba(236,72,153,0.1)",
        skillNeedBorder: "rgba(236,72,153,0.25)",
        skillNeedText:   "#f472b6",
      }
    : {
        text:            "#1a1a2e",
        text2:           "#4a4a6a",
        text3:           "#8888aa",
        border:          "rgba(0,0,0,0.08)",
        input:           "rgba(0,0,0,0.03)",
        inputBorder:     "rgba(0,0,0,0.12)",
        skillHaveBg:     "rgba(124,58,237,0.07)",
        skillHaveBorder: "rgba(124,58,237,0.2)",
        skillHaveText:   "#7c3aed",
        skillNeedBg:     "rgba(236,72,153,0.06)",
        skillNeedBorder: "rgba(236,72,153,0.18)",
        skillNeedText:   "#db2777",
      };
}

/* ─── Sidebar sections ────────────────────────────────────────────────────── */
const SETTING_SECTIONS = [
  { id: "account",       icon: "👤", l: "Account" },
  { id: "profile",       icon: "✏️",  l: "Profile" },
  { id: "skills",        icon: "⚡",  l: "Skills" },
  { id: "appearance",    icon: "🎨", l: "Appearance" },
  { id: "notifications", icon: "🔔", l: "Notifications" },
  { id: "privacy",       icon: "🔒", l: "Privacy" },
  { id: "integrations",  icon: "🔗", l: "Integrations" },
];

/* ─── Integration platform definitions ───────────────────────────────────── */
const PLATFORMS = [
  {
    key:         "github",
    icon:        "GH",
    l:           "GitHub",
    d:           "Import repos & show contribution stats",
    color:       "#6e40c9",
    placeholder: "https://github.com/yourusername",
    domains:     ["github.com"],
  },
  {
    key:         "twitter",
    icon:        "𝕏",
    l:           "Twitter / X",
    d:           "Share your matches and projects",
    color:       "#1d9bf0",
    placeholder: "https://twitter.com/yourhandle",
    domains:     ["twitter.com", "x.com"],
  },
  {
    key:         "linkedin",
    icon:        "in",
    l:           "LinkedIn",
    d:           "Import your professional background",
    color:       "#0a66c2",
    placeholder: "https://linkedin.com/in/yourprofile",
    domains:     ["linkedin.com"],
  },
];

/* ─── URL validator ───────────────────────────────────────────────────────── */
function validatePlatformUrl(val, domains) {
  if (!val.trim()) return "Please enter a URL.";
  let u;
  try { u = new URL(val.trim()); } catch { return "Enter a valid URL starting with https://"; }
  if (!["http:", "https:"].includes(u.protocol)) return "URL must start with https://";
  const host = u.hostname.replace(/^www\./, "");
  if (!domains.includes(host)) return `URL must be from ${domains.join(" or ")}.`;
  return "";
}

/* ══════════════════════════════════════════════════════════════════════════
   SETTINGS TAB
══════════════════════════════════════════════════════════════════════════ */
export default function SettingsTab({
  dark: darkProp,
  setDark: setDarkProp,
  currentUser: currentUserProp,
  setCurrentUser: setCurrentUserProp,
  setDashPage,
}) {
  /* Allow the component to run standalone (no props required) */
  const [_dark, _setDark]               = useState(false);
  const [_currentUser, _setCurrentUser] = useState({
    name: "Alex Chen", handle: "alexchen", bio: "Full-stack dev building cool things.",
    location: "San Francisco", github: "alexchen", skillsHave: ["React","TypeScript","Node.js"],
    skillsNeed: ["Rust","ML/AI"], lookingFor: "Collaborator",
  });

  const dark         = darkProp         ?? _dark;
  const setDark      = setDarkProp      ?? _setDark;
  const currentUser  = currentUserProp  ?? _currentUser;
  const setCurrentUser = setCurrentUserProp ?? _setCurrentUser;

  const T = makeTheme(dark);

  /* ── Per-tab state ── */
  const [settingsTab, setSettingsTab] = useState("account");
  const [saved,       setSaved]       = useState(false);
  const [formData,    setFormData]    = useState({ email: "you@example.com", password: "" });

  const [notifPrefs,  setNotifPrefs]  = useState({
    match: true, connect: true, message: true, digest: false, views: false,
  });
  const [privacyPrefs, setPrivacyPrefs] = useState({
    publicProfile: true, onlineStatus: true, discoverable: true, showLocation: false,
  });

  /* ── Integrations state (updated shape) ── */
  const [integrations, setIntegrations] = useState({
    github:   { connected: false, connecting: false, url: "", inputVal: "", error: "" },
    twitter:  { connected: false, connecting: false, url: "", inputVal: "", error: "" },
    linkedin: { connected: false, connecting: false, url: "", inputVal: "", error: "" },
  });

  const updInt = (key, patch) =>
    setIntegrations(p => ({ ...p, [key]: { ...p[key], ...patch } }));

  /* Integration handlers */
  const intOpen       = (key) => updInt(key, { connecting: true,  inputVal: "", error: "" });
  const intCancel     = (key) => updInt(key, { connecting: false, inputVal: "", error: "" });
  const intConfirm    = (key, domains) => {
    const s   = integrations[key];
    const err = validatePlatformUrl(s.inputVal, domains);
    if (err) { updInt(key, { error: err }); return; }
    updInt(key, { connected: true, connecting: false, url: s.inputVal.trim() });
  };
  const intDisconnect = (key) =>
    updInt(key, { connected: false, url: "", inputVal: "", error: "" });

  /* ── Helpers ── */
  const upd = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const profileCompletion = (() => {
    let s = 0;
    if (currentUser.name)                   s += 15;
    if (currentUser.bio?.length > 20)       s += 15;
    if (currentUser.location)               s += 10;
    if (currentUser.skillsHave?.length >= 2) s += 20;
    if (currentUser.skillsNeed?.length >= 1) s += 15;
    if (currentUser.lookingFor)             s += 15;
    if (currentUser.github)                 s += 10;
    return s;
  })();

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  /* ── Sub-components ── */
  const Toggle = ({ on, onToggle }) => (
    <button
      onClick={onToggle}
      aria-pressed={on}
      style={{
        width: 44, height: 24, borderRadius: 12, border: "none",
        cursor: "pointer", position: "relative",
        background: on ? "#7c3aed" : dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        transition: "background 0.3s", flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: "white",
        position: "absolute", top: 3, left: on ? 23 : 3,
        transition: "left 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }} />
    </button>
  );

  const Field = ({ label, id, type = "text", placeholder, value, onChange, prefix }) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {prefix && (
          <span style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            fontSize: 13, color: T.text3, zIndex: 1,
          }}>{prefix}</span>
        )}
        <input
          id={id} type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text,
            borderRadius: 11, fontSize: 13, outline: "none",
            padding: `10px ${prefix ? "14px 10px 38px" : "14px"}`,
            width: "100%", fontFamily: "inherit", boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
        />
      </div>
    </div>
  );

  /* ── Shared card / button styles ── */
  const cardStyle = {
    background: dark ? "rgba(255,255,255,0.03)" : "#ffffff",
    border:     `1px solid ${T.border}`,
    borderRadius: 16,
  };

  const primaryBtn = (extra = {}) => ({
    padding: "10px 22px",
    background: saved ? "rgba(34,197,94,0.15)" : "linear-gradient(135deg,#7c3aed,#a855f7)",
    border: saved ? "1px solid rgba(34,197,94,0.35)" : "none",
    color:  saved ? "#4ade80" : "white",
    borderRadius: 11, cursor: "pointer", fontFamily: "inherit",
    fontSize: 13, fontWeight: 700, transition: "all 0.3s",
    boxShadow: saved ? "none" : "0 4px 14px rgba(124,58,237,0.25)",
    ...extra,
  });

  /* ══════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{
      maxWidth: 700, margin: "0 auto",
      fontFamily: "'Inter',system-ui,sans-serif",
      color: T.text,
    }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
        <h1 style={{ fontFamily: "'Georgia',serif", fontSize: 26, color: T.text, margin: 0 }}>
          Settings
        </h1>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: T.text3, marginBottom: 5 }}>
            Profile {profileCompletion}% complete
          </div>
          <div style={{
            width: 160, height: 4,
            background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
            borderRadius: 99, overflow: "hidden",
          }}>
            <div style={{
              height: "100%", width: `${profileCompletion}%`,
              background: profileCompletion >= 80 ? "#4ade80" : profileCompletion >= 50 ? "#a78bfa" : "#f59e0b",
              borderRadius: 99, transition: "width 0.6s",
            }} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16 }}>

        {/* ── Sidebar ── */}
        <div style={{ ...cardStyle, width: 180, flexShrink: 0, padding: 10 }}>
          {SETTING_SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSettingsTab(s.id)}
              style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "11px 13px", borderRadius: 13, cursor: "pointer",
                transition: "all 0.2s",
                border: `1px solid ${settingsTab === s.id ? T.border : "transparent"}`,
                background: settingsTab === s.id
                  ? dark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.07)"
                  : "transparent",
                width: "100%", fontFamily: "inherit", marginBottom: 2,
              }}
            >
              <span style={{ fontSize: 15 }}>{s.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: settingsTab === s.id ? T.text : T.text3 }}>
                {s.l}
              </span>
            </button>
          ))}
        </div>

        {/* ── Content panel ── */}
        <div style={{ ...cardStyle, flex: 1, padding: 22 }} key={settingsTab}>

          {/* ══ ACCOUNT ══════════════════════════════════════════════════ */}
          {settingsTab === "account" && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 18 }}>Account Settings</h2>
              <Field label="Email Address" id="s_email" type="email" value={formData.email} onChange={v => upd("email", v)} />
              <Field label="New Password" id="s_pass" type="password" placeholder="Enter new password…" value={formData.password} onChange={v => upd("password", v)} />

              <div style={{ height: 1, background: T.border, margin: "20px 0" }} />

              {[
                { l: "Two-factor auth",       d: "Add an extra layer of account security",          on: true  },
                { l: "Login notifications",   d: "Get notified when you sign in on a new device",  on: false },
              ].map((n, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "13px 0", borderBottom: i === 0 ? `1px solid ${T.border}` : "none",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{n.l}</div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{n.d}</div>
                  </div>
                  <Toggle on={n.on} onToggle={() => {}} />
                </div>
              ))}

              <div style={{ height: 1, background: T.border, margin: "20px 0" }} />
              <button onClick={handleSave} style={primaryBtn()}>
                {saved ? "✓ Saved!" : "Save Changes"}
              </button>
            </>
          )}

          {/* ══ PROFILE ══════════════════════════════════════════════════ */}
          {settingsTab === "profile" && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 18 }}>Edit Profile</h2>
              <Field label="Full Name" id="s_name" value={currentUser.name} onChange={v => setCurrentUser(p => ({ ...p, name: v }))} />
              <Field label="Username" id="s_handle" value={currentUser.handle} onChange={v => setCurrentUser(p => ({ ...p, handle: v }))} prefix="@" />

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Bio</label>
                <textarea
                  rows={3} value={currentUser.bio}
                  onChange={e => setCurrentUser(p => ({ ...p, bio: e.target.value }))}
                  style={{
                    background: T.input, border: `1px solid ${T.inputBorder}`,
                    color: T.text, borderRadius: 11, fontSize: 13, outline: "none",
                    padding: "10px 14px", width: "100%", fontFamily: "inherit",
                    resize: "vertical", boxSizing: "border-box",
                  }}
                />
                <div style={{ fontSize: 10, color: T.text3, marginTop: 4, textAlign: "right" }}>
                  {currentUser.bio?.length ?? 0}/160 chars
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Location" id="s_loc" value={currentUser.location || ""} placeholder="City, Country" onChange={v => setCurrentUser(p => ({ ...p, location: v }))} />
                <Field label="GitHub" id="s_github" value={currentUser.github || ""} placeholder="username" onChange={v => setCurrentUser(p => ({ ...p, github: v }))} prefix="github.com/" />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 10 }}>Looking for</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Collaborator", "Mentor", "Mentee", "Co-founder"].map(l => (
                    <button
                      key={l}
                      onClick={() => setCurrentUser(p => ({ ...p, lookingFor: l }))}
                      style={{
                        padding: "8px 16px", borderRadius: 10,
                        border: `1px solid ${currentUser.lookingFor === l ? "rgba(124,58,237,0.5)" : T.border}`,
                        background: currentUser.lookingFor === l
                          ? dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.07)"
                          : "transparent",
                        color: currentUser.lookingFor === l ? "#a78bfa" : T.text3,
                        cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600,
                        transition: "all 0.2s",
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { handleSave(); setDashPage?.("profile"); }}
                style={primaryBtn()}
              >
                {saved ? "✓ Saved!" : "Save & View Profile →"}
              </button>
            </>
          )}

          {/* ══ SKILLS ════════════════════════════════════════════════════ */}
          {settingsTab === "skills" && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>Your Skills</h2>
              <p style={{ fontSize: 12, color: T.text3, marginBottom: 22 }}>
                Updating skills recalculates all match scores in real-time.
              </p>

              {/* Skills Have */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <Lbl T={T}>Skills I Have</Lbl>
                  <span style={{ fontSize: 11, color: currentUser.skillsHave?.length >= 6 ? "#f87171" : T.text3 }}>
                    {currentUser.skillsHave?.length ?? 0}/6
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                  {currentUser.skillsHave?.map(s => (
                    <span
                      key={s}
                      onClick={() => setCurrentUser(p => ({ ...p, skillsHave: p.skillsHave.filter(x => x !== s) }))}
                      style={{
                        padding: "5px 11px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                        background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`,
                        color: T.skillHaveText, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      {s} <span style={{ opacity: 0.6, fontSize: 10 }}>✕</span>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {SKILLS_ALL.filter(s => !currentUser.skillsHave?.includes(s)).slice(0, 15).map(s => (
                    <button
                      key={s}
                      disabled={(currentUser.skillsHave?.length ?? 0) >= 6}
                      onClick={() => setCurrentUser(p => ({ ...p, skillsHave: [...p.skillsHave, s] }))}
                      style={{
                        padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                        cursor: (currentUser.skillsHave?.length ?? 0) < 6 ? "pointer" : "not-allowed",
                        border: `1px solid ${T.border}`, background: "transparent", color: T.text3,
                        transition: "all 0.15s", fontFamily: "inherit",
                        opacity: (currentUser.skillsHave?.length ?? 0) >= 6 ? 0.4 : 1,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: 1, background: T.border, margin: "0 0 20px" }} />

              {/* Skills Need */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <Lbl T={T}>Skills I Need</Lbl>
                  <span style={{ fontSize: 11, color: currentUser.skillsNeed?.length >= 6 ? "#f87171" : T.text3 }}>
                    {currentUser.skillsNeed?.length ?? 0}/6
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                  {currentUser.skillsNeed?.map(s => (
                    <span
                      key={s}
                      onClick={() => setCurrentUser(p => ({ ...p, skillsNeed: p.skillsNeed.filter(x => x !== s) }))}
                      style={{
                        padding: "5px 11px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                        background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`,
                        color: T.skillNeedText, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      {s} <span style={{ opacity: 0.6, fontSize: 10 }}>✕</span>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {SKILLS_ALL.filter(s => !currentUser.skillsNeed?.includes(s)).slice(0, 15).map(s => (
                    <button
                      key={s}
                      disabled={(currentUser.skillsNeed?.length ?? 0) >= 6}
                      onClick={() => setCurrentUser(p => ({ ...p, skillsNeed: [...p.skillsNeed, s] }))}
                      style={{
                        padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                        cursor: (currentUser.skillsNeed?.length ?? 0) < 6 ? "pointer" : "not-allowed",
                        border: `1px solid ${T.border}`, background: "transparent", color: T.text3,
                        transition: "all 0.15s", fontFamily: "inherit",
                        opacity: (currentUser.skillsNeed?.length ?? 0) >= 6 ? 0.4 : 1,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══ APPEARANCE ════════════════════════════════════════════════ */}
          {settingsTab === "appearance" && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 18 }}>Appearance</h2>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 0", borderBottom: `1px solid ${T.border}`, marginBottom: 20,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Dark Mode</div>
                  <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>Easier on the eyes at night</div>
                </div>
                <Toggle on={dark} onToggle={() => setDark(p => !p)} />
              </div>

              <div style={{ fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 12 }}>Theme</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { l: "Dark",  bg: "#060608", card: "rgba(255,255,255,0.04)", text: "#e2e2ef", accent: "#7c3aed" },
                  { l: "Light", bg: "#f5f5f9", card: "#ffffff",                text: "#1a1a2e", accent: "#7c3aed" },
                ].map(theme => (
                  <div
                    key={theme.l}
                    onClick={() => setDark(theme.l === "Dark")}
                    style={{
                      borderRadius: 14, background: theme.bg,
                      border: `2px solid ${(dark && theme.l === "Dark") || (!dark && theme.l === "Light") ? "#7c3aed" : T.border}`,
                      cursor: "pointer", overflow: "hidden", transition: "border-color 0.2s",
                    }}
                  >
                    <div style={{ padding: 12 }}>
                      <div style={{ height: 6, width: "60%", borderRadius: 3, background: theme.accent, marginBottom: 8 }} />
                      <div style={{ display: "flex", gap: 6 }}>
                        {[0, 1].map(i => (
                          <div key={i} style={{
                            flex: 1, height: 40, borderRadius: 8, background: theme.card,
                            border: `1px solid rgba(${theme.l === "Dark" ? "255,255,255,0.07" : "0,0,0,0.07"})`,
                          }} />
                        ))}
                      </div>
                    </div>
                    <div style={{
                      padding: "8px 12px",
                      borderTop: `1px solid rgba(${theme.l === "Dark" ? "255,255,255,0.06" : "0,0,0,0.06"})`,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: theme.text }}>{theme.l}</span>
                      {(dark && theme.l === "Dark") || (!dark && theme.l === "Light")
                        ? <span style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700 }}>✓ Active</span>
                        : null}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ══ NOTIFICATIONS ════════════════════════════════════════════ */}
          {settingsTab === "notifications" && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 18 }}>Notification Preferences</h2>
              {[
                { key: "match",   l: "New match found",     d: "When AI finds a high-scoring match" },
                { key: "connect", l: "Connection requests",  d: "When someone wants to connect" },
                { key: "message", l: "Messages",             d: "When you receive a new message" },
                { key: "digest",  l: "Weekly digest",        d: "Summary of your top matches" },
                { key: "views",   l: "Profile views",        d: "When someone views your profile" },
              ].map((n, i, arr) => (
                <div key={n.key} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 0",
                  borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{n.l}</div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{n.d}</div>
                  </div>
                  <Toggle on={notifPrefs[n.key]} onToggle={() => setNotifPrefs(p => ({ ...p, [n.key]: !p[n.key] }))} />
                </div>
              ))}
            </>
          )}

          {/* ══ PRIVACY ══════════════════════════════════════════════════ */}
          {settingsTab === "privacy" && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 18 }}>Privacy</h2>
              {[
                { key: "publicProfile", l: "Public profile",     d: "Anyone can see your profile" },
                { key: "onlineStatus",  l: "Show online status",  d: "Let others see when you're active" },
                { key: "discoverable",  l: "Discoverable",        d: "Appear in match results" },
                { key: "showLocation",  l: "Show location",       d: "Display your city on your profile" },
              ].map((n, i, arr) => (
                <div key={n.key} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 0",
                  borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{n.l}</div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{n.d}</div>
                  </div>
                  <Toggle on={privacyPrefs[n.key]} onToggle={() => setPrivacyPrefs(p => ({ ...p, [n.key]: !p[n.key] }))} />
                </div>
              ))}

              <div style={{ height: 1, background: T.border, margin: "20px 0" }} />

              <div style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 14, padding: "16px 18px",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171", marginBottom: 4 }}>Danger Zone</div>
                <div style={{ fontSize: 12, color: T.text2, marginBottom: 14 }}>
                  These actions are permanent and cannot be undone.
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["Sign out", "Delete account"].map(label => (
                    <button
                      key={label}
                      style={{
                        padding: "8px 16px", background: "transparent",
                        border: "1px solid rgba(239,68,68,0.3)", color: "#f87171",
                        borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                        fontSize: 12, fontWeight: 600,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══ INTEGRATIONS ══════════════════════════════════════════════
              Updated: Connect → enter & validate URL → Connect / Cancel
              After connecting: shows URL + green badge + Disconnect button
          ══════════════════════════════════════════════════════════════ */}
          {settingsTab === "integrations" && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>
                Connected Accounts
              </h2>
              <p style={{ fontSize: 12, color: T.text3, marginBottom: 22 }}>
                Link your accounts to import data and share your work.
              </p>

              {PLATFORMS.map(int => {
                const s = integrations[int.key];
                const liveError   = s.inputVal ? validatePlatformUrl(s.inputVal, int.domains) : "";
                const isValidLive = s.inputVal && !liveError;

                return (
                  <div
                    key={int.key}
                    style={{
                      border: `1px solid ${s.connecting ? (dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)") : T.border}`,
                      borderRadius: 14, padding: "16px 18px", marginBottom: 10,
                      background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                      transition: "border-color 0.2s",
                    }}
                  >
                    {/* ── Top row ── */}
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      {/* Icon */}
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: s.connected ? `${int.color}22` : dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                        border: `1px solid ${s.connected ? `${int.color}44` : T.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700,
                        color: s.connected ? int.color : T.text3,
                        transition: "all 0.2s",
                      }}>
                        {int.icon}
                      </div>

                      {/* Label + status */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{int.l}</div>
                        <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{int.d}</div>
                        {s.connected && (
                          <div style={{
                            fontSize: 10, color: T.text3, marginTop: 3,
                            fontFamily: "monospace", opacity: 0.7,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {s.url}
                          </div>
                        )}
                        {s.connected && (
                          <div style={{ fontSize: 11, color: "#4ade80", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 8 }}>●</span> Connected
                          </div>
                        )}
                      </div>

                      {/* Action button */}
                      {s.connected ? (
                        <button
                          onClick={() => intDisconnect(int.key)}
                          style={{
                            padding: "7px 16px", background: "transparent",
                            border: "1px solid rgba(239,68,68,0.3)", color: "#f87171",
                            borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                            fontSize: 12, fontWeight: 700, flexShrink: 0, transition: "all 0.2s",
                          }}
                        >
                          Disconnect
                        </button>
                      ) : s.connecting ? (
                        /* Cancel shown in top row for quick escape */
                        <button
                          onClick={() => intCancel(int.key)}
                          style={{
                            padding: "7px 14px",
                            background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                            border: `1px solid ${T.border}`, color: T.text2,
                            borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                            fontSize: 12, flexShrink: 0,
                          }}
                        >
                          ✕ Cancel
                        </button>
                      ) : (
                        <button
                          onClick={() => intOpen(int.key)}
                          style={{
                            padding: "7px 16px",
                            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                            border: "none", color: "white",
                            borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                            fontSize: 12, fontWeight: 700, flexShrink: 0, transition: "all 0.2s",
                            boxShadow: "0 2px 8px rgba(124,58,237,0.25)",
                          }}
                        >
                          Connect
                        </button>
                      )}
                    </div>

                    {/* ── URL input form (expands when connecting) ── */}
                    {s.connecting && (
                      <div style={{
                        marginTop: 14, paddingTop: 14,
                        borderTop: `1px solid ${T.border}`,
                      }}>
                        <label style={{
                          display: "block", fontSize: 11, fontWeight: 600,
                          color: T.text2, marginBottom: 6,
                        }}>
                          Platform URL
                        </label>

                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          {/* Input + feedback */}
                          <div style={{ flex: 1 }}>
                            <input
                              type="url"
                              autoFocus
                              placeholder={int.placeholder}
                              value={s.inputVal}
                              onChange={e => updInt(int.key, { inputVal: e.target.value, error: "" })}
                              onKeyDown={e => {
                                if (e.key === "Enter")  intConfirm(int.key, int.domains);
                                if (e.key === "Escape") intCancel(int.key);
                              }}
                              style={{
                                width: "100%", padding: "9px 12px", boxSizing: "border-box",
                                background: T.input,
                                border: `1px solid ${
                                  s.error      ? "#f87171"
                                  : isValidLive ? "#4ade80"
                                  : T.inputBorder
                                }`,
                                color: T.text, borderRadius: 10,
                                fontSize: 12, fontFamily: "inherit", outline: "none",
                                transition: "border-color 0.2s",
                              }}
                            />

                            {/* Inline validation feedback */}
                            {s.error && (
                              <div style={{
                                fontSize: 11, color: "#f87171", marginTop: 5,
                                display: "flex", alignItems: "center", gap: 4,
                              }}>
                                ⚠ {s.error}
                              </div>
                            )}
                            {!s.error && isValidLive && (
                              <div style={{
                                fontSize: 11, color: "#4ade80", marginTop: 5,
                                display: "flex", alignItems: "center", gap: 4,
                              }}>
                                ✓ Looks good
                              </div>
                            )}
                            {!s.error && !isValidLive && s.inputVal && (
                              <div style={{ fontSize: 11, color: T.text3, marginTop: 5 }}>
                                e.g. {int.placeholder}
                              </div>
                            )}
                          </div>

                          {/* Confirm */}
                          <button
                            onClick={() => intConfirm(int.key, int.domains)}
                            style={{
                              padding: "9px 16px", flexShrink: 0,
                              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                              border: "none", color: "white",
                              borderRadius: 10, cursor: "pointer",
                              fontFamily: "inherit", fontSize: 12, fontWeight: 700,
                              boxShadow: "0 2px 8px rgba(124,58,237,0.2)",
                            }}
                          >
                            Connect
                          </button>

                          {/* Cancel */}
                          <button
                            onClick={() => intCancel(int.key)}
                            style={{
                              padding: "9px 14px", flexShrink: 0, background: "transparent",
                              border: `1px solid ${T.border}`, color: T.text2,
                              borderRadius: 10, cursor: "pointer",
                              fontFamily: "inherit", fontSize: 12,
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

        </div>{/* /content panel */}
      </div>{/* /flex row */}
    </div>
  );
}