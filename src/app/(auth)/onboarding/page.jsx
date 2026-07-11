"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignupStore } from "../../../../store/UsesignupStore";
import { useThemeStore } from "../../../../store/themeprovider";
import {
  validateHandle,
  validateBio,
  validatePincode,
  validateGithubUrl,
  LIMITS,
} from "../../../lib/validation";
import {
  AlertTriangle, X, Star, Check, Github, Palette, Settings2, Wrench,
  PenTool, Bot, Smartphone, Cloud, Handshake, GraduationCap, Sprout,
  MapPin, Link2, Sparkles, PartyPopper, Rocket, ArrowLeft, ArrowRight,
  Loader2, Plus,
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

const hsl  = (h, s = 70, l = 60) => `hsl(${h},${s}%,${l}%)`;
const hsla = (h, s = 70, l = 60, a = 0.12) => `hsla(${h},${s}%,${l}%,${a})`;

function getGithubValidationError(url, { required = false } = {}) {
  const err = validateGithubUrl(url, { required });
  return err || null;
}

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman & Nicobar Islands","Chandigarh","Dadra & Nagar Haveli","Daman & Diu",
  "Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry"
];

const MAJOR_CITIES = {
  "Maharashtra":      ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Solapur"],
  "Karnataka":        ["Bengaluru","Mysuru","Mangaluru","Hubballi","Belagavi"],
  "Tamil Nadu":       ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem"],
  "Telangana":        ["Hyderabad","Warangal","Nizamabad","Karimnagar"],
  "Delhi":            ["New Delhi","Dwarka","Rohini","Noida (NCR)","Gurugram (NCR)"],
  "Uttar Pradesh":    ["Lucknow","Kanpur","Agra","Varanasi","Prayagraj","Noida"],
  "Gujarat":          ["Ahmedabad","Surat","Vadodara","Rajkot","Gandhinagar"],
  "West Bengal":      ["Kolkata","Howrah","Durgapur","Siliguri","Asansol"],
  "Rajasthan":        ["Jaipur","Jodhpur","Udaipur","Kota","Bikaner"],
  "Madhya Pradesh":   ["Bhopal","Indore","Gwalior","Jabalpur","Ujjain"],
  "Punjab":           ["Chandigarh","Ludhiana","Amritsar","Jalandhar","Patiala"],
  "Haryana":          ["Gurugram","Faridabad","Rohtak","Hisar","Panipat"],
  "Kerala":           ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kollam"],
  "Andhra Pradesh":   ["Visakhapatnam","Vijayawada","Guntur","Tirupati","Kakinada"],
  "Bihar":            ["Patna","Gaya","Bhagalpur","Muzaffarpur"],
  "Assam":            ["Guwahati","Silchar","Dibrugarh","Jorhat"],
  "Odisha":           ["Bhubaneswar","Cuttack","Rourkela","Berhampur"],
  "Jharkhand":        ["Ranchi","Jamshedpur","Dhanbad","Bokaro"],
  "Uttarakhand":      ["Dehradun","Haridwar","Roorkee","Haldwani","Rishikesh"],
  "Himachal Pradesh": ["Shimla","Manali","Dharamsala","Solan"],
  "Chhattisgarh":     ["Raipur","Bhilai","Bilaspur","Durg"],
  "Goa":              ["Panaji","Margao","Vasco da Gama","Mapusa"],
};

const PROJECT_STATES = ["Active", "Completed", "Archived", "In Progress", "Paused", "Open Source"];

const Lbl = ({ children, T }) => (
  <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "1px", textTransform: "uppercase", color: T.text3, marginBottom: 7 }}>
    {children}
  </div>
);

const Err = ({ msg }) =>
  msg ? (
    <div style={{ fontSize: 11, color: "#f87171", marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
      <AlertTriangle style={iconSize(11, 11)} />
      {msg}
    </div>
  ) : null;

const Field = ({ label, id, type = "text", placeholder, value, onChange, error, hint, prefix, T, clrErr, required }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>
      {label}
      {required && <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>}
    </label>
    <div style={{ position: "relative" }}>
      {prefix && (
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: T.text3 }}>
          {prefix}
        </span>
      )}
      <input
        className="input"
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => { onChange(e.target.value); if (error && clrErr) clrErr(id); }}
        style={{ paddingLeft: prefix ? "28px" : "14px", borderColor: error ? "rgba(248,113,113,0.5)" : undefined }}
      />
    </div>
    <Err msg={error} />
    {hint && !error && <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{hint}</div>}
  </div>
);

const LogoIcon = ({ dark }) => (
  <div className="ob-logo" style={{
    width: 30, height: 30, borderRadius: 8,
    background: "#7c3aed",
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden", flexShrink: 0
  }}>
    <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill={dark ? "#1a0a3a" : "#1a0a3a"} />
      <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill={dark ? "#a78bfa" : "#ffffff"} />
    </svg>
  </div>
);

const SKILLS_ALL = [
  "React","Next.js","TypeScript","Node.js","Python","Rust","Go",
  "UI/UX Design","Figma","GraphQL","PostgreSQL","MongoDB","Redis",
  "DevOps","AWS","Docker","Machine Learning","Web3","Flutter","Swift",
  "Tailwind CSS","Vue.js","Svelte","Three.js","Solidity","Kotlin","Unity",
  "Django","FastAPI","Express.js","Prisma","Firebase","Supabase","Redis","tRPC"
];

const STEPS = ["Identity", "Role", "Your Skills", "You Need", "Location", "Projects", "Review"];

const emptyProject = () => ({
  id: Date.now() + Math.random(),
  name: "",
  description: "",
  githubUrl: "",
  branch: "main",
  stars: "",
  skills: [],
  state: "Active",
  skillSearch: "",
});

const ProjectCard = ({ project, index, isFirst, T, dark, onChange, onRemove, errors }) => {
  const upd = (k, v) => onChange({ ...project, [k]: v });

  const toggleSkill = (skill) => {
    const cur = project.skills;
    if (cur.includes(skill)) upd("skills", cur.filter(s => s !== skill));
    else if (cur.length < 8) upd("skills", [...cur, skill]);
  };

  const filteredSkills = SKILLS_ALL.filter(s =>
    s.toLowerCase().includes((project.skillSearch || "").toLowerCase())
  );

  const handleGithubBlur = () => {
    if (!project.githubUrl.trim()) return;
    const err = getGithubValidationError(project.githubUrl);
    if (err) onChange({ ...project, _githubErr: err });
    else onChange({ ...project, _githubErr: null });
  };

  const githubError = errors?.githubUrl || project._githubErr || null;

  return (
    <div style={{
      background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      border: `1px solid ${isFirst ? "rgba(124,58,237,0.3)" : T.border}`,
      borderRadius: 10,
      padding: "18px 18px 14px",
      marginBottom: 14,
      position: "relative",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", padding: "2px 8px", borderRadius: 6,
            background: isFirst ? "rgba(124,58,237,0.15)" : dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            color: isFirst ? "#c4a8ff" : T.text3,
            border: `1px solid ${isFirst ? "rgba(124,58,237,0.3)" : T.border}`,
            textTransform: "uppercase", letterSpacing: "0.8px",
            display: "inline-flex", alignItems: "center", gap: 4
          }}>
            {isFirst ? <><Star style={iconSize(10, 10)} fill="#c4a8ff" /> Required</> : `Project ${index + 1}`}
          </span>
        </div>
        {!isFirst && (
          <button
            onClick={onRemove}
            style={{ background: "none", border: "none", color: T.text3, cursor: "pointer", lineHeight: 1, padding: 4, display: "flex" }}
            title="Remove project"
          ><X style={iconSize(14, 14)} /></button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 10, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, display: "block", marginBottom: 5 }}>
            Project name {isFirst && <span style={{ color: "#f87171" }}>*</span>}
          </label>
          <input
            className="input"
            placeholder="e.g. DevMatch API"
            value={project.name}
            onChange={e => upd("name", e.target.value)}
            style={{ borderColor: errors?.name ? "rgba(248,113,113,0.5)" : undefined }}
          />
          <Err msg={errors?.name} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, display: "block", marginBottom: 5 }}>State</label>
          <select
            className="input select"
            value={project.state}
            onChange={e => upd("state", e.target.value)}
            style={{ width: "100%", height: 40 }}
          >
            {PROJECT_STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, display: "block", marginBottom: 5 }}>Short description</label>
        <textarea
          className="input"
          rows={2}
          placeholder="What does this project do? Who is it for?"
          value={project.description}
          onChange={e => upd("description", e.target.value)}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 80px", gap: 10, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, display: "block", marginBottom: 5 }}>
            GitHub URL {isFirst && <span style={{ color: "#f87171" }}>*</span>}
          </label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", display: "flex" }}>
              <Github style={iconSize(14, 14)} color={T.text3} />
            </span>
            <input
              className="input"
              placeholder="github.com/user/repo"
              value={project.githubUrl}
              onChange={e => {
                upd("githubUrl", e.target.value);
                if (project._githubErr) onChange({ ...project, githubUrl: e.target.value, _githubErr: null });
              }}
              onBlur={handleGithubBlur}
              style={{
                paddingLeft: 30,
                borderColor: githubError ? "rgba(248,113,113,0.5)" : undefined
              }}
            />
          </div>
          <Err msg={githubError} />
          {!githubError && project.githubUrl.trim() && (
            <div style={{ fontSize: 11, color: "#4ade80", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <Check style={iconSize(11, 11)} strokeWidth={2.5} /> Valid GitHub URL
            </div>
          )}
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, display: "block", marginBottom: 5 }}>Branch</label>
          <input
            className="input"
            placeholder="main"
            value={project.branch}
            onChange={e => upd("branch", e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, display: "flex", alignItems: "center", gap: 3, marginBottom: 5 }}>
            <Star style={iconSize(10, 10)} /> Stars
          </label>
          <input
            className="input"
            type="number"
            min="0"
            placeholder="0"
            value={project.stars}
            onChange={e => upd("stars", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, display: "block", marginBottom: 5 }}>
          Skills used <span style={{ color: T.text3, fontWeight: 400 }}>({project.skills.length}/8)</span>
        </label>
        {project.skills.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
            {project.skills.map(s => (
              <span
                key={s}
                onClick={() => toggleSkill(s)}
                style={{
                  padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)",
                  color: "#c4a8ff", cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                }}
              >
                {s} <X style={{ ...iconSize(9, 9), opacity: 0.6 }} />
              </span>
            ))}
          </div>
        )}
        <input
          className="input"
          placeholder="Search skills…"
          value={project.skillSearch || ""}
          onChange={e => upd("skillSearch", e.target.value)}
          style={{ marginBottom: 6, fontSize: 12, padding: "7px 12px" }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, maxHeight: 100, overflowY: "auto" }}>
          {filteredSkills.map(s => {
            const isSelected = project.skills.includes(s);
            const isMaxed = !isSelected && project.skills.length >= 8;
            return (
              <button
                key={s}
                className={`skill-chip ${isSelected ? "sel-have" : ""}`}
                onClick={() => !isMaxed && toggleSkill(s)}
                disabled={isMaxed && !isSelected}
                style={{ fontSize: 11, padding: "4px 10px" }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function OnBoarding() {
  const [onboardStep, setOnboardStep] = useState(0);
  const [formData, setFormData] = useState({
    email: "", password: "", confirm: "",
    name: "", handle: "", bio: "",
    role: "", lookingFor: "Collaborator",
    skillsHave: [], skillsNeed: [],
    state: "", city: "", pincode: "", remote: false,
    projects: [emptyProject()],
  });
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
   const { dark, toggleDark } = useThemeStore();
  const [skillSearchH, setSkillSearchH] = useState("");
  const [skillSearchN, setSkillSearchN] = useState("");
  const [apiError, setApiError]     = useState("");
  const [apiSuccess, setApiSuccess] = useState(false);

  const ProfileData = useSignupStore(state => state.formData);
  const updateForm  = useSignupStore(state => state.updateForm);
  const router      = useRouter();

  const DARK = {
    bg: "#060608", bg2: "#0e0e18", bg3: "#14141f",
    border: "rgba(255,255,255,0.09)", border2: "rgba(255,255,255,0.14)",
    text: "#e2e2ef", text2: "#9090b0", text3: "#555570",
    card: "rgba(255,255,255,0.025)", cardHover: "rgba(255,255,255,0.045)",
    input: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.11)",
    glass: "rgba(6,6,8,0.85)",
    shadow: "none",
    msgMe: "#7c3aed",
    msgThem: "rgba(255,255,255,0.06)",
    navBg: "rgba(6,6,8,0.9)",
    skillHaveBg: "rgba(110,224,110,0.1)", skillHaveBorder: "rgba(110,224,110,0.25)", skillHaveText: "#7de87d",
    skillNeedBg: "rgba(120,120,255,0.1)", skillNeedBorder: "rgba(120,120,255,0.25)", skillNeedText: "#9898ff",
    aiBg: "rgba(60,40,140,0.15)", aiBorder: "rgba(120,80,255,0.2)",
    logoBg: "rgba(255,255,255,0.1)",
    mutedChip: "rgba(255,255,255,0.02)", mutedChipText: "rgba(255,255,255,0.18)",
  };
  const LIGHT = {
    bg: "#f5f5f9", bg2: "#ffffff", bg3: "#eeeef5",
    border: "rgba(0,0,0,0.1)", border2: "rgba(0,0,0,0.16)",
    text: "#1a1a2e", text2: "#555570", text3: "#9090b0",
    card: "#ffffff", cardHover: "#f8f8fc",
    input: "#ffffff", inputBorder: "rgba(0,0,0,0.13)",
    glass: "rgba(245,245,249,0.92)",
    shadow: "none",
    msgMe: "#7c3aed",
    msgThem: "#f0f0f8",
    navBg: "rgba(245,245,249,0.95)",
    skillHaveBg: "rgba(34,197,94,0.1)", skillHaveBorder: "rgba(34,197,94,0.3)", skillHaveText: "#16a34a",
    skillNeedBg: "rgba(99,102,241,0.1)", skillNeedBorder: "rgba(99,102,241,0.3)", skillNeedText: "#4f46e5",
    aiBg: "rgba(124,58,237,0.07)", aiBorder: "rgba(124,58,237,0.2)",
    logoBg: "rgba(0,0,0,0.08)",
    mutedChip: "rgba(0,0,0,0.02)", mutedChipText: "rgba(0,0,0,0.2)",
  };

  const T = dark ? DARK : LIGHT;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)"};border-radius:99px}
    input,textarea,select{font-family:'Inter',sans-serif}
    textarea{resize:none}
    select option{background:${dark ? "#1a1a2e" : "#fff"}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
    .fade-up{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both}
    .fade-in{animation:fadeIn 0.3s ease both}
    .float{animation:float 4s ease-in-out infinite}
    .spin{animation:spin 0.9s linear infinite;display:inline-block}
    .slide-down{animation:slideDown 0.35s cubic-bezier(0.16,1,0.3,1) both}
    .pulse{animation:pulse 1.8s ease-in-out infinite}
    .card{background:${T.card};border:1px solid ${T.border};border-radius:10px;transition:border-color 0.15s ease,background 0.15s ease}
    .card:hover{background:${T.cardHover};border-color:rgba(139,92,246,0.22)}
    .card-flat{background:${T.card};border:1px solid ${T.border};border-radius:10px}
    .btn-primary{background:#7c3aed;border:1px solid #7c3aed;color:white;padding:11px 24px;border-radius:8px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:filter 0.15s ease;letter-spacing:-0.1px}
    .btn-primary:hover{filter:brightness(1.1)}
    .btn-primary:active{filter:brightness(0.95)}
    .btn-primary:disabled{opacity:0.5;cursor:not-allowed}
    .btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:9px 18px;border-radius:8px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:border-color 0.15s ease,color 0.15s ease}
    .btn-ghost:hover{border-color:${T.border2};color:${T.text}}
    .btn-icon{background:transparent;border:1px solid ${T.border};color:${T.text3};padding:8px;border-radius:8px;cursor:pointer;transition:border-color 0.15s ease,color 0.15s ease;display:flex;align-items:center;justify-content:center}
    .btn-icon:hover{border-color:${T.border2};color:${T.text}}
    .input{background:${T.input};border:1px solid ${T.inputBorder};color:${T.text};padding:10px 14px;border-radius:8px;font-size:13px;outline:none;transition:border-color 0.15s ease,background 0.15s ease;width:100%}
    .input:focus{border-color:rgba(124,58,237,0.6);background:${dark ? "rgba(255,255,255,0.07)" : "rgba(124,58,237,0.04)"}}
    .input::placeholder{color:${T.text3}}
    .select{background:${T.input};border:1px solid ${T.inputBorder};color:${T.text};padding:8px 12px;border-radius:8px;font-size:13px;font-family:inherit;outline:none;cursor:pointer}
    .nav-btn{background:none;border:none;color:${T.text3};cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;padding:8px 13px;border-radius:8px;display:flex;align-items:center;gap:7px;transition:color 0.15s ease,background 0.15s ease}
    .nav-btn:hover{color:${T.text};background:${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}}
    .pill{padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600}
    .skill-have{background:${T.skillHaveBg};border:1px solid ${T.skillHaveBorder};color:${T.skillHaveText}}
    .skill-need{background:${T.skillNeedBg};border:1px solid ${T.skillNeedBorder};color:${T.skillNeedText}}
    .skill-chip{padding:6px 13px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid ${T.border};background:transparent;color:${T.text3};transition:border-color 0.15s ease,color 0.15s ease,background 0.15s ease;font-family:inherit}
    .skill-chip:hover:not(:disabled){border-color:rgba(124,58,237,0.4);color:${T.text};background:rgba(124,58,237,0.08)}
    .skill-chip:disabled{cursor:not-allowed;background:${T.mutedChip};border-color:${T.border};color:${T.mutedChipText};opacity:0.5}
    .skill-chip.sel-have{background:${T.skillHaveBg};border-color:${T.skillHaveBorder};color:${T.skillHaveText}}
    .skill-chip.sel-need{background:${T.skillNeedBg};border-color:${T.skillNeedBorder};color:${T.skillNeedText}}
    .skill-chip.conflict{cursor:not-allowed;background:${T.mutedChip};border-color:${T.border};color:${T.mutedChipText};opacity:0.4;text-decoration:line-through}
    .role-card{background:${T.input};border:1px solid ${T.border};border-radius:10px;padding:14px 18px;cursor:pointer;transition:border-color 0.15s ease;display:flex;align-items:center;gap:13px}
    .role-card:hover{border-color:rgba(124,58,237,0.3)}
    .role-card.on{background:${dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.07)"};border-color:rgba(124,58,237,0.4)}
    .look-card{background:${T.input};border:1px solid ${T.border};border-radius:10px;padding:15px;cursor:pointer;transition:border-color 0.15s ease;text-align:center}
    .look-card:hover{border-color:rgba(124,58,237,0.3)}
    .look-card.on{background:${dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.07)"};border-color:rgba(124,58,237,0.4)}
    .banner-error{background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.22);border-radius:10px;padding:14px 16px;display:flex;align-items:flex-start;gap:11px;margin-top:16px}
    .banner-success{background:rgba(110,224,110,0.07);border:1px solid rgba(110,224,110,0.22);border-radius:10px;padding:14px 16px;display:flex;align-items:flex-start;gap:11px;margin-top:16px}
    .state-chip{padding:6px 12px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid ${T.border};background:transparent;color:${T.text3};transition:border-color 0.15s ease,color 0.15s ease;font-family:inherit}
    .state-chip:hover{border-color:rgba(124,58,237,0.4);color:${T.text}}
    .state-chip.on{background:rgba(124,58,237,0.12);border-color:rgba(124,58,237,0.4);color:#c4a8ff}
    .toggle-wrap{display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px 14px;border-radius:8px;border:1px solid ${T.border};background:${T.input};transition:border-color 0.15s ease}
    .toggle-wrap:hover{border-color:rgba(124,58,237,0.3)}
    @media(max-width:600px){
      .ob-nav{padding:0 14px !important;height:52px !important}
      .ob-nav-title{font-size:14px !important}
      .ob-logo{width:26px !important;height:26px !important}
      .ob-step-label{display:none}
      .ob-step-text{font-size:11px !important}
      .ob-content{padding:28px 14px !important}
      .ob-step-dots{gap:4px !important;margin-bottom:24px !important}
      .ob-step-dot{width:22px !important;height:22px !important;font-size:10px !important}
      .ob-step-connector{width:8px !important}
      .ob-h2{font-size:22px !important}
      .ob-roles-grid{gap:6px !important}
      .ob-skills-grid{max-height:180px !important}
      .ob-nav-actions{gap:5px !important}
      .btn-primary,.btn-ghost{padding:9px 14px !important;font-size:12px !important}
      .input{font-size:14px !important}
      .proj-meta-grid{grid-template-columns:1fr !important}
    }
  `;

  const upd    = (k, v) => setFormData(p => ({ ...p, [k]: v }));
  const clrErr = k => setErrors(p => { const n = { ...p }; delete n[k]; return n; });

  const toggleSkill = (key, skill) => {
    const cur = formData[key];
    if (cur.includes(skill)) upd(key, cur.filter(s => s !== skill));
    else if (cur.length < 6) upd(key, [...cur, skill]);
  };

  const updateProject = (id, updated) =>
    upd("projects", formData.projects.map(p => p.id === id ? updated : p));
  const removeProject = (id) =>
    upd("projects", formData.projects.filter(p => p.id !== id));
  const addProject = () => {
    if (formData.projects.length >= 5) return;
    upd("projects", [...formData.projects, emptyProject()]);
  };

  const citiesForState = MAJOR_CITIES[formData.state] || [];

  const handleSubmission = async (payload) => {
    setApiError("");
    setApiSuccess(false);
    try {
      const res  = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setApiError(
          res.status === 409 ? json.error || "An account with this email or handle already exists." :
          res.status === 400 ? json.error || "Invalid data. Please review your details and try again." :
          json.error || "Something went wrong on our end. Please try again shortly."
        );
        setSubmitting(false);
        return;
      }
      setApiSuccess(true);
      setSubmitting(false);
      setTimeout(() => router.push("/signin?account=created"), 2800);
    } catch (err) {
      console.error("Signup error:", err);
      setApiError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  const handleOnboardNext = () => {
    const e = {};

    if (onboardStep === 0) {
      if (!formData.name.trim()) e.name = "Name required";
      const handleErr = validateHandle(formData.handle);
      if (handleErr) e.handle = handleErr;
      const bioErr = validateBio(formData.bio);
      if (bioErr) e.bio = bioErr;
    }
    if (onboardStep === 1 && !formData.role)                   e.role       = "Select a role";
    if (onboardStep === 2 && formData.skillsHave.length === 0) e.skillsHave = "Add at least one skill";
    if (onboardStep === 3 && formData.skillsNeed.length === 0) e.skillsNeed = "Add at least one skill";

    if (onboardStep === 4) {
      if (!formData.state) e.state = "Select a state";
      const pinErr = validatePincode(formData.pincode);
      if (pinErr) e.pincode = pinErr;
    }

    if (onboardStep === 5) {
      const first = formData.projects[0];
      if (!first.name.trim()) e["proj_0_name"] = "Project name required";

      if (!first.githubUrl.trim()) {
        e["proj_0_githubUrl"] = "GitHub URL required";
      } else {
        const urlErr = getGithubValidationError(first.githubUrl, { required: true });
        if (urlErr) e["proj_0_githubUrl"] = urlErr;
      }

      formData.projects.slice(1).forEach((proj, idx) => {
        if (proj.githubUrl.trim()) {
          const urlErr = getGithubValidationError(proj.githubUrl);
          if (urlErr) e[`proj_${idx + 1}_githubUrl`] = urlErr;
        }
      });
    }

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    if (onboardStep < STEPS.length - 1) {
      setOnboardStep(p => p + 1);
      return;
    }

    setSubmitting(true);
    setApiError("");
    setApiSuccess(false);

    const storeData = useSignupStore.getState().formData;
    const payload = {
      email:      storeData.email,
      password:   storeData.password,
      name:       formData.name,
      handle:     formData.handle,
      bio:        formData.bio,
      role:       formData.role,
      lookingFor: formData.lookingFor,
      skillsHave: formData.skillsHave,
      skillsNeed: formData.skillsNeed,
      location: {
        state:   formData.state,
        city:    formData.city,
        pincode: formData.pincode,
        remote:  formData.remote,
      },
      projects: formData.projects.map(({ skillSearch, _githubErr, ...rest }) => ({
        ...rest,
        githubUrl: rest.githubUrl && !rest.githubUrl.startsWith("http")
          ? "https://" + rest.githubUrl
          : rest.githubUrl,
      })),
    };

    updateForm(payload);
    handleSubmission(payload);
  };

  const headingStyle = { fontFamily: "'Inter',sans-serif", fontWeight: 700, letterSpacing: "-1.4px" };

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{css}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-10%", right: 0, width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.1)" : "hsla(259,70%,60%,0.05)"} 0%,transparent 65%)` }} />
      </div>

      <nav className="ob-nav" style={{ padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, background: T.navBg, backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <LogoIcon dark={dark} />
          <span className="ob-nav-title" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, letterSpacing: "-0.4px", fontSize: 16, color: T.text }}>CodeBuddy</span>
        </div>
        <div className="ob-nav-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="ob-step-text" style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: T.text3 }}>Step {onboardStep + 1} / {STEPS.length}</span>
        </div>
      </nav>

      <div style={{ height: 3, background: T.border }}>
        <div style={{ height: "100%", background: "#7c3aed", transition: "width 0.3s ease", width: `${(onboardStep / (STEPS.length - 1)) * 100}%` }} />
      </div>

      <div className="ob-content" style={{ maxWidth: 580, margin: "0 auto", padding: "44px 20px", position: "relative", zIndex: 1 }}>

        <div className="ob-step-dots" style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 36 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div className="ob-step-dot" style={{
                width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", transition: "background 0.15s ease,border-color 0.15s ease",
                background: i < onboardStep ? "#7c3aed" : i === onboardStep ? dark ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.1)" : T.bg3,
                border: i === onboardStep ? "1px solid rgba(124,58,237,0.5)" : `1px solid ${T.border}`,
                color: i <= onboardStep ? "#c4a8ff" : T.text3
              }}>
                {i < onboardStep ? <Check style={iconSize(12, 12)} strokeWidth={3} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className="ob-step-connector" style={{ width: 14, height: 1, background: i < onboardStep ? "rgba(124,58,237,0.5)" : T.border }} />
              )}
            </div>
          ))}
        </div>

        <div className="fade-up" key={onboardStep}>

          {onboardStep === 0 && (
            <>
              <h2 className="ob-h2" style={{ ...headingStyle, fontSize: 28, color: T.text, marginBottom: 6 }}>Set up your profile</h2>
              <p style={{ fontSize: 13, color: T.text3, marginBottom: 28 }}>Tell us who you are so we can find your best matches.</p>
              <Field label="Full name" id="name" placeholder="Aanya Sharma" value={formData.name} onChange={v => upd("name", v)} error={errors.name} T={T} clrErr={clrErr} required />
              <Field label="Username" id="handle" placeholder="aanya.dev" value={formData.handle} onChange={v => upd("handle", v)} error={errors.handle} prefix="@" T={T} clrErr={clrErr} required />
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Short bio <span style={{ color: T.text3, fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  id="bio"
                  className="input"
                  rows={3}
                  maxLength={LIMITS.BIO_MAX}
                  placeholder="I build SaaS tools and love clean TypeScript..."
                  value={formData.bio}
                  onChange={e => upd("bio", e.target.value)}
                  style={{ borderColor: errors.bio ? "rgba(248,113,113,0.5)" : undefined }}
                />
                <Err msg={errors.bio} />
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: T.text3, marginTop: 4, textAlign: "right" }}>{formData.bio.length}/{LIMITS.BIO_MAX}</div>
              </div>
            </>
          )}

          {onboardStep === 1 && (
            <>
              <h2 className="ob-h2" style={{ ...headingStyle, fontSize: 28, color: T.text, marginBottom: 6 }}>What's your role?</h2>
              <p style={{ fontSize: 13, color: T.text3, marginBottom: 22 }}>Helps us show you the most relevant matches.</p>
              <div className="ob-roles-grid" style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {[
                  { v: "Frontend Developer",   Icon: Palette,     d: "UI, components, design systems" },
                  { v: "Backend Developer",    Icon: Settings2,   d: "APIs, databases, infrastructure" },
                  { v: "Full Stack Developer", Icon: Wrench,      d: "Both frontend and backend" },
                  { v: "Design Engineer",      Icon: PenTool,     d: "UI/UX, Figma, design systems" },
                  { v: "ML / AI Engineer",     Icon: Bot,         d: "Models, pipelines, data science" },
                  { v: "Mobile Developer",     Icon: Smartphone,  d: "iOS, Android, Flutter" },
                  { v: "DevOps Engineer",      Icon: Cloud,       d: "Cloud, CI/CD, infrastructure" },
                ].map(r => (
                  <div key={r.v} className={`role-card ob-role-card ${formData.role === r.v ? "on" : ""}`} onClick={() => { upd("role", r.v); clrErr("role"); }}>
                    <r.Icon style={{ ...iconSize(18, 22), color: formData.role === r.v ? "#c4a8ff" : T.text2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: formData.role === r.v ? "#c4a8ff" : T.text }}>{r.v}</div>
                      <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>{r.d}</div>
                    </div>
                    {formData.role === r.v && <Check style={{ ...iconSize(15, 15), color: "#7c3aed" }} strokeWidth={2.5} />}
                  </div>
                ))}
              </div>
              <Err msg={errors.role} />
              <div style={{ marginTop: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 10 }}>Looking for</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {[{ v: "Collaborator", Icon: Handshake }, { v: "Mentor", Icon: GraduationCap }, { v: "Mentee", Icon: Sprout }].map(l => (
                    <div key={l.v} className={`look-card ${formData.lookingFor === l.v ? "on" : ""}`} onClick={() => upd("lookingFor", l.v)}>
                      <l.Icon style={{ ...iconSize(20, 24), marginBottom: 6, color: formData.lookingFor === l.v ? "#c4a8ff" : T.text2 }} />
                      <div style={{ fontSize: 12, fontWeight: 600, color: formData.lookingFor === l.v ? "#c4a8ff" : T.text }}>{l.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {onboardStep === 2 && (
            <>
              <h2 className="ob-h2" style={{ ...headingStyle, fontSize: 28, color: T.text, marginBottom: 6 }}>What can you build?</h2>
              <p style={{ fontSize: 13, color: T.text3, marginBottom: 20 }}>Select up to 6 skills you're strong in.</p>
              {formData.skillsHave.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Lbl T={T}>Selected ({formData.skillsHave.length}/6)</Lbl>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {formData.skillsHave.map(s => (
                      <span key={s} className="pill skill-have" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }} onClick={() => toggleSkill("skillsHave", s)}>
                        {s} <X style={{ ...iconSize(9, 9), opacity: 0.6 }} />
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <input className="input" placeholder="Search skills..." value={skillSearchH} onChange={e => setSkillSearchH(e.target.value)} style={{ marginBottom: 8 }} />
              <div className="ob-skills-grid" style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                {SKILLS_ALL.filter(s => s.toLowerCase().includes(skillSearchH.toLowerCase())).map(s => {
                  const isConflict = formData.skillsNeed.includes(s);
                  const isSelected = formData.skillsHave.includes(s);
                  const isMaxed    = !isSelected && formData.skillsHave.length >= 6;
                  return (
                    <button key={s} className={`skill-chip ${isSelected ? "sel-have" : ""} ${isConflict && !isSelected ? "conflict" : ""}`} onClick={() => !isConflict && toggleSkill("skillsHave", s)} disabled={isConflict || isMaxed}>
                      {s}
                    </button>
                  );
                })}
              </div>
              <Err msg={errors.skillsHave} />
            </>
          )}

          {onboardStep === 3 && (
            <>
              <h2 className="ob-h2" style={{ ...headingStyle, fontSize: 28, color: T.text, marginBottom: 6 }}>What do you need?</h2>
              <p style={{ fontSize: 13, color: T.text3, marginBottom: 20 }}>Select skills you're looking for in a collaborator.</p>
              {formData.skillsNeed.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Lbl T={T}>Selected ({formData.skillsNeed.length}/6)</Lbl>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {formData.skillsNeed.map(s => (
                      <span key={s} className="pill skill-need" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }} onClick={() => toggleSkill("skillsNeed", s)}>
                        {s} <X style={{ ...iconSize(9, 9), opacity: 0.6 }} />
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <input className="input" placeholder="Search skills..." value={skillSearchN} onChange={e => setSkillSearchN(e.target.value)} style={{ marginBottom: 8 }} />
              <div className="ob-skills-grid" style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                {SKILLS_ALL.filter(s => s.toLowerCase().includes(skillSearchN.toLowerCase())).map(s => {
                  const isConflict = formData.skillsHave.includes(s);
                  const isSelected = formData.skillsNeed.includes(s);
                  const isMaxed    = !isSelected && formData.skillsNeed.length >= 6;
                  return (
                    <button key={s} className={`skill-chip ${isSelected ? "sel-need" : ""} ${isConflict && !isSelected ? "conflict" : ""}`} onClick={() => !isConflict && toggleSkill("skillsNeed", s)} disabled={isConflict || isMaxed}>
                      {s}
                    </button>
                  );
                })}
              </div>
              <Err msg={errors.skillsNeed} />
            </>
          )}

          {onboardStep === 4 && (
            <>
              <h2 className="ob-h2" style={{ ...headingStyle, fontSize: 28, color: T.text, marginBottom: 6 }}>Where are you based?</h2>
              <p style={{ fontSize: 13, color: T.text3, marginBottom: 24 }}>Helps surface nearby collaborators and local meetups.</p>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 8 }}>
                  State / UT <span style={{ color: "#f87171" }}>*</span>
                </label>
                <select
                  className="input select"
                  value={formData.state}
                  onChange={e => { upd("state", e.target.value); upd("city", ""); clrErr("state"); }}
                  style={{ width: "100%" }}
                >
                  <option value="">— Select state —</option>
                  {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <Err msg={errors.state} />
              </div>

              {formData.state && (
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 8 }}>
                    City <span style={{ color: T.text3, fontWeight: 400 }}>(optional)</span>
                  </label>
                  {citiesForState.length > 0 ? (
                    <>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                        {citiesForState.map(c => (
                          <button
                            key={c}
                            className={`state-chip ${formData.city === c ? "on" : ""}`}
                            onClick={() => upd("city", formData.city === c ? "" : c)}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                      <input
                        className="input"
                        placeholder="Or type another city…"
                        value={citiesForState.includes(formData.city) ? "" : formData.city}
                        onChange={e => upd("city", e.target.value)}
                        style={{ fontSize: 12, padding: "8px 12px" }}
                      />
                    </>
                  ) : (
                    <input
                      className="input"
                      placeholder="Enter your city"
                      value={formData.city}
                      onChange={e => upd("city", e.target.value)}
                    />
                  )}
                </div>
              )}

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>
                  PIN code <span style={{ color: T.text3, fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  className="input"
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 110001"
                  value={formData.pincode}
                  onChange={e => upd("pincode", e.target.value.replace(/\D/g, ""))}
                  style={{ maxWidth: 160, borderColor: errors.pincode ? "rgba(248,113,113,0.5)" : undefined }}
                />
                <Err msg={errors.pincode} />
              </div>

              <label className="toggle-wrap" style={{ display: "flex" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Open to remote collaboration</div>
                  <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>Work with developers from anywhere in India</div>
                </div>
                <div
                  onClick={() => upd("remote", !formData.remote)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                    background: formData.remote ? "#7c3aed" : dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)",
                    position: "relative", transition: "background 0.15s ease", flexShrink: 0
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%", background: "white",
                    position: "absolute", top: 3,
                    left: formData.remote ? 23 : 3,
                    transition: "left 0.2s ease",
                  }} />
                </div>
              </label>

              <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: 10, background: T.aiBg, border: `1px solid ${T.aiBorder}`, display: "flex", gap: 8 }}>
                <MapPin style={{ ...iconSize(13, 13), color: dark ? "#b0a8d8" : "#6b5b9e", flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: dark ? "#b0a8d8" : "#6b5b9e", lineHeight: 1.6 }}>
                  Location is used only for matching and discovery — your exact address is never shared.
                </p>
              </div>
            </>
          )}

          {onboardStep === 5 && (
            <>
              <h2 className="ob-h2" style={{ ...headingStyle, fontSize: 28, color: T.text, marginBottom: 6 }}>Showcase your work</h2>
              <p style={{ fontSize: 13, color: T.text3, marginBottom: 8 }}>Add projects to show collaborators what you've built.</p>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "9px 12px", borderRadius: 8, background: dark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.05)", border: `1px solid ${dark ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.15)"}` }}>
                <Star style={{ ...iconSize(13, 13), color: dark ? "#c4a8ff" : "#7c3aed" }} />
                <span style={{ fontSize: 12, color: dark ? "#c4a8ff" : "#7c3aed" }}>
                  The first project is <strong>required</strong> — it anchors your profile in search results.
                </span>
              </div>

              {formData.projects.map((proj, idx) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  index={idx}
                  isFirst={idx === 0}
                  T={T}
                  dark={dark}
                  onChange={(updated) => updateProject(proj.id, updated)}
                  onRemove={() => removeProject(proj.id)}
                  errors={{
                    name:      errors[`proj_${idx}_name`],
                    githubUrl: errors[`proj_${idx}_githubUrl`],
                  }}
                />
              ))}

              {formData.projects.length < 5 && (
                <button
                  onClick={addProject}
                  style={{
                    width: "100%", padding: "12px", border: `1.5px dashed ${T.border2}`,
                    borderRadius: 8, background: "transparent", color: T.text3,
                    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    transition: "border-color 0.15s ease,color 0.15s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)"; e.currentTarget.style.color = T.text; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.color = T.text3; }}
                >
                  <Plus style={iconSize(13, 13)} />
                  Add another project
                  <span style={{ fontSize: 11, opacity: 0.6, fontFamily: "'JetBrains Mono',monospace" }}>({formData.projects.length}/5)</span>
                </button>
              )}
            </>
          )}

          {onboardStep === 6 && (
            <>
              <h2 className="ob-h2" style={{ ...headingStyle, fontSize: 28, color: T.text, marginBottom: 6 }}>
                Looking good, <span style={{ color: "#a78bfa" }}>{formData.name || "Builder"}</span>!
              </h2>
              <p style={{ fontSize: 13, color: T.text3, marginBottom: 22 }}>Review your profile before we launch matching.</p>

              <div className="card-flat" style={{ padding: 22, marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ width: 52, height: 52, borderRadius: 10, background: "rgba(124,58,237,0.15)", border: "2px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "#c4b5fd", flexShrink: 0 }}>
                    {(formData.name || "?")[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{formData.name || "—"}</div>
                    <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: "#7c3aed", marginTop: 2 }}>@{formData.handle || "—"}</div>
                    {formData.role && <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{formData.role}</div>}
                  </div>
                  {formData.lookingFor && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa", flexShrink: 0 }}>
                      Seeking {formData.lookingFor}
                    </span>
                  )}
                </div>

                {formData.bio && <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 14 }}>{formData.bio}</p>}

                {(formData.state || formData.city) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, fontSize: 12, color: T.text2 }}>
                    <MapPin style={iconSize(13, 13)} />
                    <span>{[formData.city, formData.state].filter(Boolean).join(", ")}</span>
                    {formData.pincode && <span style={{ color: T.text3, fontFamily: "'JetBrains Mono',monospace" }}>— {formData.pincode}</span>}
                    {formData.remote && (
                      <span style={{ padding: "1px 7px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: "rgba(110,224,110,0.1)", border: "1px solid rgba(110,224,110,0.25)", color: "#7de87d", display: "inline-flex", alignItems: "center", gap: 3 }}>
                        Remote <Check style={iconSize(9, 9)} strokeWidth={3} />
                      </span>
                    )}
                  </div>
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

              {formData.projects.filter(p => p.name).length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <Lbl T={T}>Projects ({formData.projects.filter(p => p.name).length})</Lbl>
                  {formData.projects.filter(p => p.name).map((proj, i) => (
                    <div key={proj.id} style={{
                      background: dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)",
                      border: `1px solid ${T.border}`,
                      borderRadius: 10, padding: "12px 14px", marginBottom: 8
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{proj.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 6, background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", color: T.text3 }}>{proj.state}</span>
                        {proj.stars && (
                          <span style={{ fontSize: 11, color: "#fbbf24", display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <Star style={iconSize(10, 10)} fill="#fbbf24" /> {proj.stars}
                          </span>
                        )}
                        {i === 0 && (
                          <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 6, background: "rgba(124,58,237,0.12)", color: "#c4a8ff", border: "1px solid rgba(124,58,237,0.25)", display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <Star style={iconSize(9, 9)} fill="#c4a8ff" /> Primary
                          </span>
                        )}
                      </div>
                      {proj.description && <p style={{ fontSize: 11, color: T.text3, marginBottom: 6, lineHeight: 1.5 }}>{proj.description}</p>}
                      {proj.githubUrl && (
                        <div style={{ fontSize: 11, color: dark ? "#7c9aff" : "#3b5bdb", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                          <Link2 style={iconSize(11, 11)} /> {proj.githubUrl} {proj.branch && <span style={{ color: T.text3 }}>({proj.branch})</span>}
                        </div>
                      )}
                      {proj.skills.length > 0 && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                          {proj.skills.map(s => (
                            <span key={s} style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#c4a8ff" }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!apiSuccess && (
                <div style={{ background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 10, padding: "12px 14px", display: "flex", gap: 8 }}>
                  <Sparkles style={{ ...iconSize(13, 13), color: dark ? "#b0a8d8" : "#6b5b9e", flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 12, color: dark ? "#b0a8d8" : "#6b5b9e", lineHeight: 1.6 }}>
                    Once you submit, AI matching starts immediately. You'll see your first matches in seconds.
                  </p>
                </div>
              )}

              {apiError && (
                <div className="banner-error slide-down">
                  <AlertTriangle style={{ ...iconSize(17, 17), flexShrink: 0, color: "#f87171" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171", marginBottom: 3 }}>
                      {apiError.toLowerCase().includes("already exists") ? "Account already exists" : "Something went wrong"}
                    </div>
                    <div style={{ fontSize: 12, color: dark ? "#fca5a5" : "#b91c1c", lineHeight: 1.55 }}>{apiError}</div>
                    {apiError.toLowerCase().includes("already exists") && (
                      <button onClick={() => router.push("/signin")} style={{ marginTop: 8, background: "none", border: "none", padding: 0, fontSize: 12, fontWeight: 700, color: "#f87171", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        Sign in to your existing account <ArrowRight style={iconSize(11, 11)} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {apiSuccess && (
                <div className="banner-success slide-down">
                  <PartyPopper style={{ ...iconSize(17, 17), flexShrink: 0, color: "#7de87d" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#7de87d", marginBottom: 3 }}>
                      Welcome to CodeBuddy, {formData.name}!
                    </div>
                    <div style={{ fontSize: 12, color: dark ? "#bbf7d0" : "#15803d", lineHeight: 1.55 }}>
                      Your developer profile is live and matching has begun. Taking you to sign in…
                    </div>
                    <div style={{ marginTop: 10, height: 2, borderRadius: 99, background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 99, background: "#4ade80", animation: "progressBar 2.8s linear forwards" }} />
                    </div>
                    <style>{`@keyframes progressBar{from{width:0%}to{width:100%}}`}</style>
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
            {onboardStep > 0 ? (
              <button className="btn-ghost" onClick={() => { setOnboardStep(p => p - 1); setApiError(""); setApiSuccess(false); }} disabled={submitting || apiSuccess} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <ArrowLeft style={iconSize(12, 12)} /> Back
              </button>
            ) : <div />}

            {!apiSuccess && (
              <button className="btn-primary" onClick={handleOnboardNext} disabled={submitting}>
                {submitting
                  ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Loader2 className="spin" style={iconSize(14, 14)} /> Creating profile…</span>
                  : onboardStep === STEPS.length - 1
                    ? <BtnLabel Icon={Rocket}>Launch profile</BtnLabel>
                    : <BtnLabel>Continue</BtnLabel>
                }
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default OnBoarding;