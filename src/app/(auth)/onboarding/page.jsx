  "use client"
  import { useState } from "react";
  import { useRouter } from "next/navigation";
  import { useSignupStore } from "../../../../store/UsesignupStore";

  // ─── Helpers (module-level so React sees a stable reference) ───────────────

  const hsl = (h, s = 70, l = 60) => `hsl(${h},${s}%,${l}%)`;
  const hsla = (h, s = 70, l = 60, a = 0.12) => `hsla(${h},${s}%,${l}%,${a})`;

  // ─── Sub-components outside OnBoarding ────────────────────────────────────

  const Lbl = ({ children, T }) => (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: T.text3, marginBottom: 7 }}>
      {children}
    </div>
  );

  const Err = ({ msg }) =>
    msg ? <div style={{ fontSize: 11, color: "#f87171", marginTop: 5 }}>⚠ {msg}</div> : null;

  const Field = ({ label, id, type = "text", placeholder, value, onChange, error, hint, prefix, T, clrErr }) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && (
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: T.text3 }}>
            @
          </span>
        )}
        <input
          className="input"
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => { onChange(e.target.value); if (error) clrErr(id); }}
          style={{ paddingLeft: prefix ? "28px" : "14px", borderColor: error ? "rgba(248,113,113,0.5)" : undefined }}
        />
      </div>
      <Err msg={error} />
      {hint && !error && <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{hint}</div>}
    </div>
  );

  const Avatar = ({ u, size = 44, radius = 12, dark }) => (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: hsla(u.hue, 70, 60, dark ? 0.15 : 0.12),
      border: `1.5px solid ${hsla(u.hue, 70, 60, 0.3)}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.3, fontWeight: 700, color: hsl(u.hue),
      flexShrink: 0, fontFamily: "'Instrument Serif',serif"
    }}>
      {u.avatar}
    </div>
  );

  // ─── Logo (stable, no theme dependency) ───────────────────────────────────

  const LogoIcon = ({ dark }) => (
    <div className="ob-logo" style={{
      width: 30, height: 30, borderRadius: 8,
      background: "linear-gradient(135deg,#7c3aed,#a855f7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", flexShrink: 0
    }}>
      <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill={dark ? "#1a0a3a" : "#00DC33"} />
        <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill={dark ? "#a78bfa" : "#ffffff"} />
      </svg>
    </div>
  );

  // ─── Skill list ────────────────────────────────────────────────────────────

  const SKILLS_ALL = [
    "React", "Next.js", "TypeScript", "Node.js", "Python", "Rust", "Go",
    "UI/UX Design", "Figma", "GraphQL", "PostgreSQL", "MongoDB", "Redis",
    "DevOps", "AWS", "Docker", "Machine Learning", "Web3", "Flutter", "Swift",
    "Tailwind CSS", "Vue.js", "Svelte", "Three.js", "Solidity", "Kotlin", "Unity"
  ];

  const STEPS = ["Identity", "Role", "Your Skills", "You Need", "Review"];

  // ─── Main component ────────────────────────────────────────────────────────

  function OnBoarding() {
    const [onboardStep, setOnboardStep] = useState(0);
    const [formData, setFormData] = useState({
      email: "", password: "", confirm: "",
      name: "", handle: "", bio: "",
      role: "", lookingFor: "Collaborator",
      skillsHave: [], skillsNeed: []
    });
    const [errors, setErrors]     = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [dark, setDark]         = useState(true);
    const [skillSearchH, setSkillSearchH] = useState("");
    const [skillSearchN, setSkillSearchN] = useState("");

    const ProfileData = useSignupStore(state => state.formData);
    const updateForm = useSignupStore(state => state.updateForm);
    const router     = useRouter();

    // ── Theme ────────────────────────────────────────────────────────────────

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
      logoBg: "rgba(255,255,255,0.1)",
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
      logoBg: "rgba(0,0,0,0.08)",
    };

    const T = dark ? DARK : LIGHT;

    // ── Global CSS (theme-reactive, safe inside component) ───────────────────

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

      @media (max-width:600px){
        .ob-nav{padding:0 14px !important;height:52px !important}
        .ob-nav-title{font-size:14px !important}
        .ob-logo{width:26px !important;height:26px !important}
        .ob-step-label{display:none}
        .ob-step-text{font-size:11px !important}
        .ob-content{padding:28px 14px !important}
        .ob-step-dots{gap:4px !important;margin-bottom:24px !important}
        .ob-step-dot{width:22px !important;height:22px !important;font-size:10px !important}
        .ob-step-connector{width:12px !important}
        .ob-h2{font-size:22px !important}
        .ob-roles-grid{gap:6px !important}
        .ob-role-card{padding:11px 13px !important}
        .ob-looking-grid{grid-template-columns:repeat(3,1fr) !important;gap:6px !important}
        .ob-look-card{padding:10px 6px !important}
        .ob-look-emoji{font-size:18px !important;margin-bottom:4px !important}
        .ob-look-label{font-size:11px !important}
        .ob-review-card{padding:16px !important}
        .ob-review-header{flex-wrap:wrap;gap:8px !important}
        .ob-skills-grid{max-height:180px !important}
        .ob-nav-actions{gap:5px !important}
        .btn-primary,.btn-ghost{padding:9px 14px !important;font-size:12px !important}
        .input{font-size:14px !important}
      }
      @media (max-width:360px){
        .ob-looking-grid{grid-template-columns:repeat(3,1fr) !important}
        .ob-content{padding:20px 10px !important}
      }
    `;

    // ── Helpers ──────────────────────────────────────────────────────────────

    const upd    = (k, v) => setFormData(p => ({ ...p, [k]: v }));
    const clrErr = k => setErrors(p => { const n = { ...p }; delete n[k]; return n; });

    const toggleSkill = (key, skill) => {
      const cur = formData[key];
      if (cur.includes(skill)) upd(key, cur.filter(s => s !== skill));
      else if (cur.length < 6)  upd(key, [...cur, skill]);
    };

    // ── Submit ───────────────────────────────────────────────────────────────
    
    const handleSubmission = async (formData) => {
      try {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if(res){
          router.push("/");
        }
        
      } catch (err) {
        console.error("Signup error:", err);
      }
    };

    const handleOnboardNext = () => {
      const e = {};
      if (onboardStep === 0 && !formData.name.trim())          e.name       = "Name required";
      if (onboardStep === 0 && !formData.handle.trim())        e.handle     = "Handle required";
      if (onboardStep === 1 && !formData.role)                 e.role       = "Select a role";
      if (onboardStep === 2 && formData.skillsHave.length === 0) e.skillsHave = "Add at least one skill";
      if (onboardStep === 3 && formData.skillsNeed.length === 0) e.skillsNeed = "Add at least one skill";

      setErrors(e);
      if (Object.keys(e).length > 0) return;

      if (onboardStep < 4) {
        setOnboardStep(p => p + 1);
        return;
      }

      // Final step — submit
      setSubmitting(true);
      const payload = {
        name: formData.name,
        handle: formData.handle,
        bio: formData.bio,
        role: formData.role,
        lookingFor: formData.lookingFor,
        skillsHave: formData.skillsHave,
        skillsNeed: formData.skillsNeed,
      };

      updateForm(payload);    
      const latest = useSignupStore.getState().formData;       
      handleSubmission(latest);  

      setTimeout(() => setSubmitting(false), 2000);
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
      <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
        <style>{css}</style>

        {/* Ambient glow */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-10%", right: 0, width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.1)" : "hsla(259,70%,60%,0.05)"} 0%,transparent 65%)` }} />
        </div>

        {/* ── Nav ── */}
        <nav className="ob-nav" style={{ padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, background: T.navBg, backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <LogoIcon dark={dark} />
            <span className="ob-nav-title" style={{ fontFamily: "'Instrument Serif',serif", fontSize: 16, color: T.text }}>CodeBuddy</span>
          </div>
          <div className="ob-nav-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="ob-step-text" style={{ fontSize: 12, color: T.text3 }}>Step {onboardStep + 1} / {STEPS.length}</span>
            <button className="btn-icon" onClick={() => setDark(p => !p)} style={{ width: 34, height: 34 }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </nav>

        {/* ── Progress bar ── */}
        <div style={{ height: 3, background: T.border }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg,#7c3aed,#a855f7)", transition: "width 0.4s cubic-bezier(0.34,1.56,0.64,1)", width: `${(onboardStep / 4) * 100}%` }} />
        </div>

        <div className="ob-content" style={{ maxWidth: 560, margin: "0 auto", padding: "44px 20px", position: "relative", zIndex: 1 }}>

          {/* ── Step dots ── */}
          <div className="ob-step-dots" style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 36 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div className="ob-step-dot" style={{
                  width: 26, height: 26, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, transition: "all 0.3s",
                  background: i < onboardStep ? "linear-gradient(135deg,#7c3aed,#a855f7)" : i === onboardStep ? dark ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.1)" : T.bg3,
                  border: i === onboardStep ? "1px solid rgba(124,58,237,0.5)" : `1px solid ${T.border}`,
                  color: i <= onboardStep ? "#c4a8ff" : T.text3
                }}>
                  {i < onboardStep ? "✓" : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="ob-step-connector" style={{ width: 20, height: 1, background: i < onboardStep ? "rgba(124,58,237,0.5)" : T.border }} />
                )}
              </div>
            ))}
          </div>

          <div className="fade-up" key={onboardStep}>

            {/* ── Step 0 – Identity ── */}
            {onboardStep === 0 && (
              <>
                <h2 className="ob-h2" style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, color: T.text, marginBottom: 6 }}>Set up your profile</h2>
                <p style={{ fontSize: 13, color: T.text3, marginBottom: 28 }}>Tell us who you are so we can find your best matches.</p>

                <Field
                  label="Full name" id="name" placeholder="Aanya Sharma"
                  value={formData.name} onChange={v => upd("name", v)}
                  error={errors.name} T={T} clrErr={clrErr}
                />
                <Field
                  label="Username" id="handle" placeholder="aanya.dev"
                  value={formData.handle} onChange={v => upd("handle", v)}
                  error={errors.handle} prefix="@" T={T} clrErr={clrErr}
                />
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>
                    Short bio <span style={{ color: T.text3, fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    className="input" rows={3}
                    placeholder="I build SaaS tools and love clean TypeScript..."
                    value={formData.bio}
                    onChange={e => upd("bio", e.target.value)}
                  />
                </div>
              </>
            )}

            {/* ── Step 1 – Role ── */}
            {onboardStep === 1 && (
              <>
                <h2 className="ob-h2" style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, color: T.text, marginBottom: 6 }}>What's your role?</h2>
                <p style={{ fontSize: 13, color: T.text3, marginBottom: 22 }}>Helps us show you the most relevant matches.</p>

                <div className="ob-roles-grid" style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {[
                    { v: "Frontend Developer",  i: "🎨", d: "UI, components, design systems" },
                    { v: "Backend Developer",   i: "⚙️", d: "APIs, databases, infrastructure" },
                    { v: "Full Stack Developer",i: "🔧", d: "Both frontend and backend" },
                    { v: "Design Engineer",     i: "✏️", d: "UI/UX, Figma, design systems" },
                    { v: "ML / AI Engineer",    i: "🤖", d: "Models, pipelines, data science" },
                    { v: "Mobile Developer",    i: "📱", d: "iOS, Android, Flutter" },
                    { v: "DevOps Engineer",     i: "☁️", d: "Cloud, CI/CD, infrastructure" },
                  ].map(r => (
                    <div
                      key={r.v}
                      className={`role-card ob-role-card ${formData.role === r.v ? "on" : ""}`}
                      onClick={() => { upd("role", r.v); clrErr("role"); }}
                    >
                      <span style={{ fontSize: 20 }}>{r.i}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: formData.role === r.v ? "#c4a8ff" : T.text }}>{r.v}</div>
                        <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>{r.d}</div>
                      </div>
                      {formData.role === r.v && <span style={{ color: "#7c3aed", fontSize: 15 }}>✓</span>}
                    </div>
                  ))}
                </div>
                <Err msg={errors.role} />

                <div style={{ marginTop: 20 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 10 }}>Looking for</label>
                  <div className="ob-looking-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                    {[
                      { v: "Collaborator", i: "🤝" },
                      { v: "Mentor",       i: "🎓" },
                      { v: "Mentee",       i: "🌱" },
                    ].map(l => (
                      <div
                        key={l.v}
                        className={`look-card ob-look-card ${formData.lookingFor === l.v ? "on" : ""}`}
                        onClick={() => upd("lookingFor", l.v)}
                      >
                        <div className="ob-look-emoji" style={{ fontSize: 22, marginBottom: 6 }}>{l.i}</div>
                        <div className="ob-look-label" style={{ fontSize: 12, fontWeight: 600, color: formData.lookingFor === l.v ? "#c4a8ff" : T.text }}>{l.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Step 2 – Skills you have ── */}
            {onboardStep === 2 && (
              <>
                <h2 className="ob-h2" style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, color: T.text, marginBottom: 6 }}>What can you build?</h2>
                <p style={{ fontSize: 13, color: T.text3, marginBottom: 20 }}>Select up to 6 skills you're strong in.</p>

                {formData.skillsHave.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <Lbl T={T}>Selected ({formData.skillsHave.length}/6)</Lbl>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {formData.skillsHave.map(s => (
                        <span
                          key={s} className="pill skill-have"
                          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                          onClick={() => toggleSkill("skillsHave", s)}
                        >
                          {s} <span style={{ opacity: 0.6, fontSize: 10 }}>✕</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  className="input" placeholder="Search skills..."
                  value={skillSearchH} onChange={e => setSkillSearchH(e.target.value)}
                  style={{ marginBottom: 12 }}
                />
                <div className="ob-skills-grid" style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                  {SKILLS_ALL
                    .filter(s => s.toLowerCase().includes(skillSearchH.toLowerCase()))
                    .map(s => (
                      <button
                        key={s}
                        className={`skill-chip ${formData.skillsHave.includes(s) ? "sel-have" : ""}`}
                        onClick={() => toggleSkill("skillsHave", s)}
                        disabled={!formData.skillsHave.includes(s) && formData.skillsHave.length >= 6}
                      >
                        {s}
                      </button>
                    ))}
                </div>
                <Err msg={errors.skillsHave} />
              </>
            )}

            {/* ── Step 3 – Skills you need ── */}
            {onboardStep === 3 && (
              <>
                <h2 className="ob-h2" style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, color: T.text, marginBottom: 6 }}>What do you need?</h2>
                <p style={{ fontSize: 13, color: T.text3, marginBottom: 20 }}>Select skills you're looking for in a collaborator.</p>

                {formData.skillsNeed.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <Lbl T={T}>Selected ({formData.skillsNeed.length}/6)</Lbl>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {formData.skillsNeed.map(s => (
                        <span
                          key={s} className="pill skill-need"
                          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                          onClick={() => toggleSkill("skillsNeed", s)}
                        >
                          {s} <span style={{ opacity: 0.6, fontSize: 10 }}>✕</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  className="input" placeholder="Search skills..."
                  value={skillSearchN} onChange={e => setSkillSearchN(e.target.value)}
                  style={{ marginBottom: 12 }}
                />
                <div className="ob-skills-grid" style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                  {SKILLS_ALL
                    .filter(s => s.toLowerCase().includes(skillSearchN.toLowerCase()))
                    .map(s => (
                      <button
                        key={s}
                        className={`skill-chip ${formData.skillsNeed.includes(s) ? "sel-need" : ""}`}
                        onClick={() => toggleSkill("skillsNeed", s)}
                        disabled={!formData.skillsNeed.includes(s) && formData.skillsNeed.length >= 6}
                      >
                        {s}
                      </button>
                    ))}
                </div>
                <Err msg={errors.skillsNeed} />
              </>
            )}

            {/* ── Step 4 – Review ── */}
            {onboardStep === 4 && (
              <>
                <h2 className="ob-h2" style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, color: T.text, marginBottom: 6 }}>
                  Looking good, <span style={{ fontStyle: "italic", color: "#a78bfa" }}>{formData.name || "Builder"}</span>!
                </h2>
                <p style={{ fontSize: 13, color: T.text3, marginBottom: 22 }}>Review your profile before we launch matching.</p>

                <div className="card-flat ob-review-card" style={{ padding: 22, marginBottom: 16 }}>
                  <div className="ob-review-header" style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: "linear-gradient(135deg,rgba(124,58,237,0.2),rgba(168,85,247,0.1))",
                      border: "2px solid rgba(124,58,237,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, fontWeight: 700, color: "#c4b5fd", flexShrink: 0
                    }}>
                      {(formData.name || "?")[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{formData.name || "—"}</div>
                      <div style={{ fontSize: 12, color: "#7c3aed", marginTop: 2 }}>@{formData.handle || "—"}</div>
                      {formData.role && <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{formData.role}</div>}
                    </div>
                    {formData.lookingFor && (
                      <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa", flexShrink: 0 }}>
                        Seeking {formData.lookingFor}
                      </span>
                    )}
                  </div>

                  {formData.bio && (
                    <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 14 }}>{formData.bio}</p>
                  )}

                  {formData.skillsHave.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <Lbl T={T}>Has</Lbl>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {formData.skillsHave.map(s => <span key={s} className="pill skill-have">{s}</span>)}
                      </div>
                    </div>
                  )}

                  {formData.skillsNeed.length > 0 && (
                    <div>
                      <Lbl T={T}>Needs</Lbl>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {formData.skillsNeed.map(s => <span key={s} className="pill skill-need">{s}</span>)}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 12, padding: "12px 14px" }}>
                  <p style={{ fontSize: 12, color: dark ? "#b0a8d8" : "#6b5b9e", lineHeight: 1.6 }}>
                    ✦ Once you submit, AI matching starts immediately. You'll see your first matches in seconds.
                  </p>
                </div>
              </>
            )}

            {/* ── Nav buttons ── */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
              {onboardStep > 0
                ? <button className="btn-ghost" onClick={() => setOnboardStep(p => p - 1)}>← Back</button>
                : <div />
              }
              <button className="btn-primary" onClick={handleOnboardNext} disabled={submitting}>
                {submitting ? "Launching..." : (onboardStep === 4 ? "🚀 Launch profile →" : "Continue →")}
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  export default OnBoarding;  