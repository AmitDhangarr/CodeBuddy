"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hsl, hsla, calculateMatchScore, Avatar, Lbl } from "../shared";
import ProjectPage from "../../../components/projectpage";
import {
  Handshake, Sparkles, Send, Zap, Eye, Star, FolderGit2, Wrench,
  Search, MapPin, AlertTriangle, Rocket, Github, X, Plus, ArrowRight,
} from "lucide-react";

// Responsive icon sizing: scales fluidly between breakpoints instead of a
// fixed pixel size, matching the convention used across the rest of the app.
const iconSize = (min, max, vw = 3) => ({
  width: `clamp(${min}px, ${vw}vw, ${max}px)`,
  height: `clamp(${min}px, ${vw}vw, ${max}px)`,
  flexShrink: 0,
});

/* ─── helpers ────────────────────────────────────────────────────────────── */
const ENDORSEMENTS = [
  { skill: "React",      note: "One of the cleanest React codebases I've worked with." },
  { skill: "TypeScript", note: "Incredibly thorough with types. Made our codebase bulletproof." },
];

const ACTIVITY_FEED = [
  { a: "Connected with",    t: "Rohan Mehra",      time: "2h ago", hue: 340, Icon: Handshake },
  { a: "New 89% match —",   t: "Sara Chen",         time: "5h ago", hue: 271, Icon: Sparkles  },
  { a: "Sent request to",   t: "Priya Nair",        time: "1d ago", hue: 158, Icon: Send       },
  { a: "Updated skills:",   t: "Added TypeScript",  time: "2d ago", hue: 259, Icon: Zap        },
  { a: "Viewed by",         t: "Dev Kapoor",        time: "3d ago", hue: 38,  Icon: Eye        },
  { a: "Project starred by",t: "Aanya Sharma",      time: "5d ago", hue: 259, Icon: Star       },
];

const PROJECT_STATES = ["Active", "Building", "Archived"];

const SKILL_SUGGESTIONS = [
  "React","TypeScript","Python","Node.js","LangChain","Next.js",
  "Rust","Go","Supabase","PostgreSQL","TailwindCSS","GraphQL",
  "Vue.js","Svelte","Docker","AWS","MongoDB","Redis","FastAPI","Prisma",
];

function validateGithubUrl(url) {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();
  const pattern = /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;
  if (!pattern.test(trimmed)) return "Enter a valid GitHub repo URL (e.g. github.com/user/repo)";
  return null;
}

function nameInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function mapProject(p) {
  return {
    id:     p.id,
    n:      p.name ?? p.title ?? "Untitled Project",
    d:      p.description ?? "",
    tags:   Array.isArray(p.skills_used) ? p.skills_used : (Array.isArray(p.tags) ? p.tags : []),
    stars:  p.stars ?? 0,
    forks:  p.forks ?? 0,
    status: p.state ?? p.status ?? "Building",
    url:    p.github_url ?? p.url ?? "#",
    branch: p.branch ?? "main",
    img:    p.emoji ?? "🗂",
    sort:   p.sort_order ?? 0,
  };
}

function resolveLocation(loc) {
  if (!loc) return "Remote";
  if (typeof loc === "string") return loc;
  if (Array.isArray(loc)) {
    const first = loc[0];
    if (!first) return "Remote";
    return [first.city, first.state].filter(Boolean).join(", ") || "Remote";
  }
  const { city, state, country } = loc;
  return [city, state ?? country].filter(Boolean).join(", ") || "Remote";
}

const BLANK_FORM = {
  name:        "",
  description: "",
  github_url:  "",
  branch:      "main",
  state:       "Building",
  skills_used: [],
  stars:       "",
};

/* ══════════════════════════════════════════════════════════════════════════
  PROFILE TAB
══════════════════════════════════════════════════════════════════════════ */
export default function ProfileTab({
  T, dark,
  currentUser, setCurrentUser,
  setDashPage,
  convos, setActiveConvo,
}) {
  const router = useRouter();

  const [profileTab,    setProfileTab]    = useState("projects");
  const [openProjectId, setOpenProjectId] = useState(null);
  const [showAddForm,   setShowAddForm]   = useState(false);
  const [form,          setForm]          = useState(BLANK_FORM);
  const [skillInput,    setSkillInput]    = useState("");
  const [skillSearch,   setSkillSearch]   = useState("");
  const [saving,        setSaving]        = useState(false);
  const [saveError,     setSaveError]     = useState(null);
  const [formErrors,    setFormErrors]    = useState({});

  const [availability, setAvailability] = useState({
    mon: true, tue: true, wed: false, thu: true, fri: false, sat: false, sun: false,
  });

  const [apiProfile,  setApiProfile]  = useState(null);
  const [projects,    setProjects]    = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile
        const res  = await fetch("/api/profile");
        const json = await res.json();
        if (!json.success || !json.profile) throw new Error(json.message ?? "Failed to load profile");

        const p = json.profile;
        setApiProfile(p);

        const mapped = (p.projects ?? []).map(mapProject).sort((a, b) => a.sort - b.sort);
        setProjects(mapped);

        setCurrentUser(prev => ({
          ...prev,
          name:       p.name        ?? prev.name,
          handle:     p.handle      ?? prev.handle,
          role:       p.role        ?? prev.role,
          bio:        p.bio         ?? prev.bio,
          skillsHave: p.skills_have ?? prev.skillsHave ?? [],
          skillsNeed: p.skills_need ?? prev.skillsNeed ?? [],
          lookingFor: p.looking_for ?? prev.lookingFor,
          location:   resolveLocation(p.locations),
          projects:   mapped.length,
        }));

        // Fetch connections from dedicated endpoint
        const connRes  = await fetch("/api/connections");
        const connJson = await connRes.json();
        if (connJson?.data) {
          const connected = connJson.data.filter(
            c => c.status === "connected" || c.status === "accepted"
          );
          setConnections(connected);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function validateForm() {
    const e = {};
    if (!form.name.trim()) e.name = "Project name is required";
    const urlErr = validateGithubUrl(form.github_url);
    if (urlErr) e.github_url = urlErr;
    return e;
  }

  async function handleAddProject(ev) {
    ev.preventDefault();

    if (!apiProfile?.id) {
      setSaveError("Your profile hasn't finished loading yet. Please try again in a moment.");
      return;
    }

    const e = validateForm();
    if (Object.keys(e).length > 0) { setFormErrors(e); return; }
    setFormErrors({});
    setSaving(true);
    setSaveError(null);

    const rawUrl = form.github_url.trim();
    const normUrl = rawUrl && !rawUrl.startsWith("http")
      ? "https://" + rawUrl
      : rawUrl;

    try {
      const res  = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId:   apiProfile.id,
          name:        form.name.trim(),
          description: form.description.trim(),
          github_url:  normUrl,
          branch:      form.branch.trim() || "main",
          state:       form.state,
          skills_used: form.skills_used,
          stars:       form.stars ? Number(form.stars) : 0,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? json.message ?? "Failed to save project");

      const newProj = mapProject(json.project ?? {
        ...form,
        github_url:  normUrl,
        id:          crypto.randomUUID(),
        sort_order:  projects.length + 1,
        stars:       form.stars ? Number(form.stars) : 0,
      });
      setProjects(prev => [newProj, ...prev]);
      setCurrentUser(prev => ({ ...prev, projects: (prev.projects ?? 0) + 1 }));
      setForm(BLANK_FORM);
      setSkillInput("");
      setSkillSearch("");
      setShowAddForm(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function addSkill(s) {
    const trimmed = s.trim();
    if (!trimmed || form.skills_used.includes(trimmed)) return;
    setForm(f => ({ ...f, skills_used: [...f.skills_used, trimmed] }));
    setSkillInput("");
  }

  function removeSkill(s) {
    setForm(f => ({ ...f, skills_used: f.skills_used.filter(x => x !== s) }));
  }

  if (openProjectId) {
    return (
      <ProjectPage
        projectId={openProjectId}
        onBack={() => setOpenProjectId(null)}
        T={T}
        dark={dark}
        currentUser={currentUser}
      />
    );
  }

  /* ── derived ── */
  const totalConnections = connections.length;
  const totalStars       = projects.reduce((s, p) => s + (p.stars ?? 0), 0);
  const profileViews     = apiProfile?.profile_views ?? 248;
  const initials         = nameInitials(currentUser?.name);

  const Sk = ({ w = "100%", h = 14, r = 8, mb = 0 }) => (
    <div style={{
      width: w, height: h, borderRadius: r, marginBottom: mb,
      background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      animation: "pulse 1.6s ease-in-out infinite",
    }} />
  );

  const inp = (hasErr) => ({
    width: "100%", borderRadius: 8, padding: "9px 12px",
    background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    border: `1px solid ${hasErr ? "rgba(248,113,113,0.5)" : T?.border}`,
    color: T?.text, fontSize: 13, fontFamily: "'Inter',sans-serif",
    outline: "none", boxSizing: "border-box",
  });

  const stateColors = {
    Active:   { bg: "rgba(34,197,94,.15)",   border: "rgba(34,197,94,.4)",   color: "#4ade80" },
    Building: { bg: "rgba(245,158,11,.15)",  border: "rgba(245,158,11,.4)",  color: "#fbbf24" },
    Archived: { bg: "rgba(148,163,184,.15)", border: "rgba(148,163,184,.4)", color: "#94a3b8" },
  };

  const filteredSuggestions = SKILL_SUGGESTIONS.filter(
    s => !form.skills_used.includes(s) &&
        (skillSearch === "" || s.toLowerCase().includes(skillSearch.toLowerCase()))
  );

  /* ══════════════════════════════════════════════════════════════════════
    RENDER
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="fade-up profile-tab-root" style={{ maxWidth: 720, margin: "0 auto", fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slide-down { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .proj-card:hover { border-color:rgba(139,92,246,.3); cursor:pointer; }
        .proj-card { transition:border-color .15s ease; }
        .add-form { animation: slide-down .2s ease both; }
        .pp-inp:focus { border-color: rgba(124,58,237,.5) !important; }
        .skill-tag-rm:hover { opacity:.7; }
        .state-chip-btn:hover { border-color:rgba(124,58,237,.4) !important; color:${T?.text} !important; }
        .skill-quick-btn:hover { border-color:rgba(124,58,237,.35) !important; background:rgba(124,58,237,.07) !important; color:${T?.text} !important; }
        .conn-card:hover { border-color:${T?.border2} !important; }
        .conn-card { transition: border-color .15s ease; }

        /* ── mobile responsiveness ───────────────────────────────────── */
        @media (max-width: 640px) {
          .profile-tab-root { padding: 0 4px; }
          .card-flat { padding: 16px !important; border-radius: 12px !important; }

          .profile-header-row { flex-wrap: wrap; }
          .profile-header-avatar { width: 56px !important; height: 56px !important; }
          .profile-edit-btn { width: 100%; justify-content: center; margin-top: 4px; }

          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; row-gap: 16px; }
          .stats-grid > div:nth-child(2n) { border-right: none !important; }
          .stats-grid > div:nth-child(1),
          .stats-grid > div:nth-child(2) { border-bottom: 1px solid ${T?.border}; padding-bottom: 12px; }

          .skills-row { grid-template-columns: 1fr !important; }

          .activity-overview-grid { grid-template-columns: repeat(2, 1fr) !important; }

          .form-row-name-stars { grid-template-columns: 1fr !important; }
          .form-row-url-branch { grid-template-columns: 1fr !important; }

          .form-actions-row { flex-direction: column-reverse; }
          .form-actions-row button { width: 100%; justify-content: center; }

          .conn-actions-row { flex-direction: column; }
          .conn-actions-row button { width: 100%; }

          .profile-tabs-row { gap: 2px !important; }
          .profile-tabs-row button { padding: 7px 11px !important; font-size: 12px !important; }
        }
      `}</style>

      {/* error banner */}
      {error && (
        <div style={{
          padding:"10px 16px", borderRadius:10, marginBottom:14,
          background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)",
          fontSize:12, color:"#f87171", display:"flex", gap:8, alignItems:"center",
        }}>
          <AlertTriangle style={iconSize(13, 15)} /> {error}
          <button onClick={() => window.location.reload()} style={{
            marginLeft:"auto", fontSize:11, color:"#f87171",
            background:"transparent", border:"none", cursor:"pointer", fontFamily:"'Inter',sans-serif",
          }}>Retry</button>
        </div>
      )}

      {/* ══ PROFILE CARD ══ */}
      <div className="card-flat" style={{ padding:24, marginBottom:16, position:"relative", overflow:"hidden" }}>
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          background: dark
            ? "linear-gradient(135deg,rgba(139,92,246,.06),transparent 60%)"
            : "linear-gradient(135deg,rgba(124,58,237,.04),transparent 60%)",
        }} />

        <div className="profile-header-row" style={{ display:"flex", gap:20, alignItems:"flex-start", position:"relative" }}>
          <div className="profile-header-avatar" style={{
            width:70, height:70, borderRadius:14, flexShrink:0,
            background:"rgba(124,58,237,.14)",
            border:"1px solid rgba(124,58,237,.3)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize: initials.length > 1 ? 22 : 28,
            fontWeight:700, color:"#c4b5fd",
            fontFamily:"'JetBrains Mono',monospace",
            letterSpacing:"-0.5px",
          }}>
            {loading ? "…" : initials}
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            {loading ? (
              <>
                <Sk w="180px" h={22} mb={8} />
                <Sk w="120px" h={13} mb={10} />
                <Sk w="90%"   h={13} mb={5} />
                <Sk w="70%"   h={13} />
              </>
            ) : (
              <>
                <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:22, color:T?.text, letterSpacing:"-0.4px" }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize:12, color:T?.text3, marginTop:3 }}>
                  @{currentUser.handle} · {currentUser.role}
                </div>
                <p style={{ fontSize:13, color:T?.text2, marginTop:8, lineHeight:1.6, maxWidth:460 }}>
                  {currentUser.bio}
                </p>
                <div style={{ display:"flex", gap:7, marginTop:12, flexWrap:"wrap" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600, background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.25)", color:"#4ade80" }}>
                    <span style={{ width:5, height:5, borderRadius:"50%", background:"#4ade80", flexShrink:0 }} />
                    Open to Collaborate
                  </span>
                  {currentUser.skillsNeed?.[0] && (
                    <span style={{ padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600, background:"rgba(245,158,11,.1)", border:"1px solid rgba(245,158,11,.25)", color:"#f59e0b" }}>
                      Seeking {currentUser.skillsNeed[0]}
                    </span>
                  )}
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600, background:T?.skillNeedBg, border:`1px solid ${T?.skillNeedBorder}`, color:T?.skillNeedText }}>
                    <MapPin style={iconSize(11, 13)} /> {currentUser.location}
                  </span>
                </div>
              </>
            )}
          </div>

          <button className="profile-edit-btn" onClick={() => setDashPage("settings")} style={{
            display:"inline-flex", alignItems:"center", gap:6,
            background:"transparent", border:`1px solid ${T?.border}`,
            color:T?.text2, padding:"7px 16px", borderRadius:8,
            cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:600, flexShrink:0,
          }}>Edit <ArrowRight style={iconSize(11, 13)} /></button>
        </div>

        {/* stats row */}
        <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", marginTop:22, paddingTop:18, borderTop:`1px solid ${T?.border}` }}>
          {[
            { v: loading ? "—" : String(totalConnections), l:"Connections" },
            { v: loading ? "—" : String(projects.length),  l:"Projects" },
            { v: loading ? "—" : String(totalStars),        l:"Total Stars" },
            { v: loading ? "—" : String(profileViews),      l:"Profile Views" },
          ].map((s,i) => (
            <div key={i} style={{ textAlign:"center", borderRight: i < 3 ? `1px solid ${T?.border}` : "none" }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:20, color:T?.text }}>{s.v}</div>
              <div style={{ fontSize:11, color:T?.text3, marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ SKILLS ROW ══ */}
      <div className="skills-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        <div className="card-flat" style={{ padding:16 }}>
          <Lbl T={T}>Skills I Have</Lbl>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:10 }}>
            {loading
              ? [80,60,70].map((w,i) => <Sk key={i} w={`${w}px`} h={24} r={6} />)
              : (currentUser.skillsHave ?? []).map(s => (
                <span key={s} style={{ padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600, fontFamily:"'JetBrains Mono',monospace", background:T?.skillHaveBg, border:`1px solid ${T?.skillHaveBorder}`, color:T?.skillHaveText }}>{s}</span>
              ))
            }
          </div>
        </div>
        <div className="card-flat" style={{ padding:16 }}>
          <Lbl T={T}>Skills I Need</Lbl>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:10 }}>
            {loading
              ? [65,75].map((w,i) => <Sk key={i} w={`${w}px`} h={24} r={6} />)
              : (currentUser.skillsNeed ?? []).map(s => (
                <span key={s} style={{ padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600, fontFamily:"'JetBrains Mono',monospace", background:T?.skillNeedBg, border:`1px solid ${T?.skillNeedBorder}`, color:T?.skillNeedText }}>{s}</span>
              ))
            }
          </div>
        </div>
      </div>

      {/* ══ AVAILABILITY ══ */}
      <div className="card-flat" style={{ padding:16, marginBottom:14 }}>
        <Lbl T={T}>Weekly Availability</Lbl>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
          {Object.entries(availability).map(([day,on]) => (
            <button key={day} onClick={() => setAvailability(p => ({ ...p, [day]:!p[day] }))} style={{
              padding:"6px 12px", borderRadius:8,
              border:`1px solid ${on ? "rgba(34,197,94,.35)" : T?.border}`,
              background: on ? (dark ? "rgba(34,197,94,.1)" : "rgba(34,197,94,.08)") : "transparent",
              color: on ? "#4ade80" : T?.text3,
              cursor:"pointer", fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, transition:"border-color .15s,color .15s,background .15s", textTransform:"capitalize",
            }}>
              {day.slice(0,3).toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ fontSize:11, color:T?.text3, marginTop:10 }}>
          Available <span style={{ fontFamily:"'JetBrains Mono',monospace" }}>{Object.values(availability).filter(Boolean).length}</span> days/week
        </div>
      </div>

      {/* ══ ANALYTICS OVERVIEW ══ */}
      <div className="card-flat" style={{ padding:16, marginBottom:14 }}>
        <Lbl T={T}>Activity Overview</Lbl>
        <div className="activity-overview-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:12 }}>
          {[
            {
              Icon:Handshake, label:"Connections", value: loading ? "—" : String(totalConnections),
              sub:"accepted", color:"#4ade80", bg:"rgba(34,197,94,.08)", border:"rgba(34,197,94,.2)",
            },
            {
              Icon:FolderGit2, label:"Projects", value: loading ? "—" : String(projects.length),
              sub:"total", color:"#a78bfa", bg:"rgba(124,58,237,.08)", border:"rgba(124,58,237,.2)",
            },
            {
              Icon:Star, label:"Stars", value: loading ? "—" : String(totalStars),
              sub:"across projects", color:"#fbbf24", bg:"rgba(245,158,11,.08)", border:"rgba(245,158,11,.2)",
            },
            {
              Icon:Eye, label:"Profile Views", value: loading ? "—" : String(profileViews),
              sub:"all time", color:"#60a5fa", bg:"rgba(59,130,246,.08)", border:"rgba(59,130,246,.2)",
            },
            {
              Icon:Wrench, label:"Skills", value: loading ? "—" : String((currentUser.skillsHave ?? []).length),
              sub:"have listed", color:"#34d399", bg:"rgba(52,211,153,.08)", border:"rgba(52,211,153,.2)",
            },
            {
              Icon:Search, label:"Seeking", value: loading ? "—" : String((currentUser.skillsNeed ?? []).length),
              sub:"skills needed", color:"#f472b6", bg:"rgba(244,114,182,.08)", border:"rgba(244,114,182,.2)",
            },
          ].map((item, i) => (
            <div key={i} style={{
              padding:"12px 14px", borderRadius:10,
              background:item.bg, border:`1px solid ${item.border}`,
              display:"flex", flexDirection:"column", gap:4,
            }}>
              <div style={{ color:item.color }}><item.Icon style={iconSize(16, 18)} /></div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:20, color:item.color, lineHeight:1 }}>{item.value}</div>
              <div style={{ fontSize:11, fontWeight:700, color:T?.text }}>{item.label}</div>
              <div style={{ fontSize:10, color:T?.text3 }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="card-flat" style={{ padding:20 }}>
        <div className="profile-tabs-row" style={{ display:"flex", gap:4, marginBottom:18, borderBottom:`1px solid ${T?.border}`, paddingBottom:12, overflowX:"auto" }}>
          {["projects","endorsements","activity","connections"].map(t => (
            <button key={t} onClick={() => setProfileTab(t)} style={{
              background: profileTab===t ? (dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)") : "none",
              border:"none", color: profileTab===t ? T?.text : T?.text3,
              cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:500,
              padding:"7px 15px", borderRadius:8, transition:"background .15s,color .15s",
              whiteSpace:"nowrap", textTransform:"capitalize",
            }}>
              {t}
              {t==="projects"    && !loading && <span style={{ marginLeft:5, fontSize:10, opacity:.6, fontFamily:"'JetBrains Mono',monospace" }}>({projects.length})</span>}
              {t==="connections" && !loading && <span style={{ marginLeft:5, fontSize:10, opacity:.6, fontFamily:"'JetBrains Mono',monospace" }}>({totalConnections})</span>}
            </button>
          ))}
        </div>

        {/* ── PROJECTS tab ── */}
        {profileTab === "projects" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {loading
              ? Array.from({ length:2 }).map((_,i) => (
                  <div key={i} style={{ padding:16, borderRadius:10, border:`1px solid ${T?.border}`, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)" }}>
                    <Sk w="60%" h={16} mb={10} />
                    <Sk w="100%" h={12} mb={5} />
                    <Sk w="80%"  h={12} mb={12} />
                    <div style={{ display:"flex", gap:5 }}>
                      {[50,55,45].map((w,j) => <Sk key={j} w={`${w}px`} h={20} r={6} />)}
                    </div>
                  </div>
                ))
              : projects.length === 0 && !showAddForm
                ? (
                  <div style={{ textAlign:"center", padding:"32px 0", color:T?.text3, fontSize:13 }}>
                    No projects yet — add your first one below.
                  </div>
                )
                : projects.map((p,i) => (
                  <div key={p.id ?? i} className="proj-card" onClick={() => setOpenProjectId(p.id)} style={{
                    padding:16,
                    background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)",
                    borderRadius:10, border:`1px solid ${T?.border}`,
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8, gap:8, flexWrap:"wrap" }}>
                      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                        <span style={{ fontSize:22 }}>{p.img}</span>
                        <div>
                          <div style={{ fontSize:14, fontWeight:700, color:T?.text }}>{p.n}</div>
                          <div style={{ fontSize:11, color:T?.text3, marginTop:1, wordBreak:"break-all" }}>
                            {p.url && p.url !== "#"
                              ? p.url.replace("https://","")
                              : `github.com/${currentUser.handle}/${p.n.toLowerCase().replace(/ /g,"-")}`
                            }
                          </div>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
                        <span style={{
                          fontSize:10, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", padding:"2px 9px", borderRadius:6,
                          background: ["Live","Active"].includes(p.status) ? "rgba(34,197,94,.1)" : "rgba(245,158,11,.1)",
                          border:`1px solid ${["Live","Active"].includes(p.status) ? "rgba(34,197,94,.25)" : "rgba(245,158,11,.25)"}`,
                          color: ["Live","Active"].includes(p.status) ? "#4ade80" : "#fbbf24",
                        }}>{p.status}</span>
                        <span style={{ display:"inline-flex", alignItems:"center", gap:3, fontSize:11, color:T?.text3 }}>
                          <Star style={iconSize(10, 12)} /> <span style={{ fontFamily:"'JetBrains Mono',monospace" }}>{p.stars}</span>
                        </span>
                        <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, color:"#a78bfa", fontWeight:600 }}>
                          View <ArrowRight style={iconSize(10, 12)} />
                        </span>
                      </div>
                    </div>
                    {p.d && <p style={{ fontSize:12, color:T?.text2, lineHeight:1.55, marginBottom:10 }}>{p.d}</p>}
                    {p.tags.length > 0 && (
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                        {p.tags.map(tag => (
                          <span key={tag} style={{ padding:"2px 9px", borderRadius:6, fontSize:10, fontWeight:600, fontFamily:"'JetBrains Mono',monospace", background: dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)", color:T?.text2 }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
            }

            {/* ══ ADD PROJECT FORM ══ */}
            {showAddForm && (
              <div className="add-form" style={{
                borderRadius:14, border:`1px solid rgba(124,58,237,.3)`,
                background: dark ? "rgba(124,58,237,.06)" : "rgba(124,58,237,.03)",
                overflow:"hidden",
              }}>
                <div style={{
                  padding:"14px 20px", borderBottom:`1px solid ${T?.border}`,
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                }}>
                  <span style={{
                    display:"inline-flex", alignItems:"center", gap:5,
                    fontSize:10, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", padding:"2px 9px", borderRadius:6,
                    background:"rgba(124,58,237,.15)", border:"1px solid rgba(124,58,237,.3)",
                    color:"#c4a8ff", textTransform:"uppercase", letterSpacing:".8px",
                  }}><Star style={iconSize(10, 11)} /> New Project</span>
                  <button onClick={() => { setShowAddForm(false); setForm(BLANK_FORM); setSaveError(null); setFormErrors({}); }} style={{
                    background:"transparent", border:"none", color:T?.text3,
                    cursor:"pointer", display:"flex", padding:0,
                  }}><X style={iconSize(16, 18)} /></button>
                </div>

                <form onSubmit={handleAddProject} style={{ padding:"20px 20px 18px", display:"flex", flexDirection:"column", gap:16 }}>
                  <div className="form-row-name-stars" style={{ display:"grid", gridTemplateColumns:"1fr 160px", gap:10 }}>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:T?.text3, letterSpacing:".04em", display:"block", marginBottom:5, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>
                        Project Name <span style={{ color:"#f87171" }}>*</span>
                      </label>
                      <input
                        required className="pp-inp"
                        placeholder="AI Chat Engine"
                        value={form.name}
                        onChange={e => {
                          setForm(f => ({ ...f, name: e.target.value }));
                          if (formErrors.name) setFormErrors(p => ({ ...p, name: undefined }));
                        }}
                        style={inp(!!formErrors.name)}
                      />
                      {formErrors.name && <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#f87171", marginTop:4 }}><AlertTriangle style={iconSize(10, 12)} /> {formErrors.name}</div>}
                    </div>
                    <div>
                      <label style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, fontWeight:700, color:T?.text3, letterSpacing:".04em", marginBottom:5, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}><Star style={iconSize(10, 11)} /> Stars</label>
                      <input
                        className="pp-inp" type="number" min="0" placeholder="0"
                        value={form.stars}
                        onChange={e => setForm(f => ({ ...f, stars: e.target.value }))}
                        style={inp(false)}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:T?.text3, letterSpacing:".04em", display:"block", marginBottom:5, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>Short Description</label>
                    <textarea
                      className="pp-inp"
                      placeholder="What does this project do? Who is it for?"
                      rows={2}
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      style={{ ...inp(false), resize:"vertical", lineHeight:1.55 }}
                    />
                  </div>

                  <div className="form-row-url-branch" style={{ display:"grid", gridTemplateColumns:"1fr 110px", gap:10 }}>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:T?.text3, letterSpacing:".04em", display:"block", marginBottom:5, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>GitHub URL</label>
                      <div style={{ position:"relative" }}>
                        <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:T?.text3, display:"flex" }}>
                          <Github style={iconSize(13, 15)} />
                        </span>
                        <input
                          className="pp-inp"
                          placeholder="github.com/user/repo"
                          value={form.github_url}
                          onChange={e => {
                            setForm(f => ({ ...f, github_url: e.target.value }));
                            if (formErrors.github_url) setFormErrors(p => ({ ...p, github_url: undefined }));
                          }}
                          style={{ ...inp(!!formErrors.github_url), paddingLeft:30 }}
                        />
                      </div>
                      {formErrors.github_url && <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#f87171", marginTop:4 }}><AlertTriangle style={iconSize(10, 12)} /> {formErrors.github_url}</div>}
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:T?.text3, letterSpacing:".04em", display:"block", marginBottom:5, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>Branch</label>
                      <input
                        className="pp-inp" placeholder="main"
                        value={form.branch}
                        onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
                        style={inp(false)}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:T?.text3, letterSpacing:".04em", display:"block", marginBottom:8, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>State</label>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {PROJECT_STATES.map(s => {
                        const sc = stateColors[s] ?? stateColors.Building;
                        const on = form.state === s;
                        return (
                          <button key={s} type="button" className="state-chip-btn"
                            onClick={() => setForm(f => ({ ...f, state: s }))}
                            style={{
                              padding:"6px 16px", borderRadius:6, fontSize:11, fontWeight:700,
                              cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"border-color .15s,color .15s,background .15s",
                              background: on ? sc.bg : "transparent",
                              border: on ? `1px solid ${sc.border}` : `1px solid ${T?.border}`,
                              color: on ? sc.color : T?.text3,
                            }}>{s}</button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:T?.text3, letterSpacing:".04em", display:"block", marginBottom:5, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>
                      Skills Used <span style={{ color:T?.text3, fontWeight:400, textTransform:"none" }}>(<span style={{ fontFamily:"'JetBrains Mono',monospace" }}>{form.skills_used.length}/8</span>)</span>
                    </label>
                    {form.skills_used.length > 0 && (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
                        {form.skills_used.map(s => (
                          <span key={s} style={{
                            display:"inline-flex", alignItems:"center", gap:5,
                            padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600, fontFamily:"'JetBrains Mono',monospace",
                            background:"rgba(124,58,237,.12)", border:"1px solid rgba(124,58,237,.3)", color:"#c4b5fd",
                          }}>
                            {s}
                            <button type="button" className="skill-tag-rm" onClick={() => removeSkill(s)} style={{
                              background:"transparent", border:"none", color:"#c4b5fd",
                              cursor:"pointer", display:"flex", padding:0,
                            }}><X style={iconSize(10, 12)} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div style={{ display:"flex", gap:6 }}>
                      <input
                        className="pp-inp"
                        placeholder="Search or type a skill, then press Enter…"
                        value={skillInput || skillSearch}
                        onChange={e => { setSkillInput(e.target.value); setSkillSearch(e.target.value); }}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (skillInput.trim()) addSkill(skillInput); } }}
                        style={{ ...inp(false), flex:1 }}
                      />
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:8, maxHeight:100, overflowY:"auto" }}>
                      {filteredSuggestions.map(s => {
                        const maxed = form.skills_used.length >= 8;
                        return (
                          <button key={s} type="button" className="skill-quick-btn"
                            onClick={() => !maxed && addSkill(s)}
                            disabled={maxed}
                            style={{
                              display:"inline-flex", alignItems:"center", gap:3,
                              padding:"4px 11px", borderRadius:6, fontSize:10, fontWeight:600,
                              background:"transparent", border:`1px solid ${T?.border}`,
                              color:T?.text3, cursor: maxed ? "not-allowed" : "pointer",
                              fontFamily:"'Inter',sans-serif", transition:"border-color .15s,background .15s,color .15s", opacity: maxed ? .4 : 1,
                            }}><Plus style={iconSize(9, 11)} /> {s}</button>
                        );
                      })}
                    </div>
                  </div>

                  {saveError && (
                    <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#f87171", padding:"8px 12px", borderRadius:8, background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)" }}>
                      <AlertTriangle style={iconSize(13, 15)} /> {saveError}
                    </div>
                  )}

                  <div className="form-actions-row" style={{ display:"flex", gap:8, justifyContent:"flex-end", paddingTop:4 }}>
                    <button type="button" onClick={() => { setShowAddForm(false); setForm(BLANK_FORM); setSaveError(null); setFormErrors({}); }} style={{
                      padding:"9px 18px", background:"transparent", border:`1px solid ${T?.border}`,
                      color:T?.text2, borderRadius:8, cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:600,
                    }}>Cancel</button>
                    <button type="submit" disabled={saving || !form.name.trim()} style={{
                      display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6,
                      padding:"9px 22px",
                      background: form.name.trim() ? "#7c3aed" : (dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"),
                      border: form.name.trim() ? "1px solid #7c3aed" : "1px solid transparent", borderRadius:8,
                      color: form.name.trim() ? "#fff" : T?.text3,
                      cursor: form.name.trim() ? "pointer" : "default",
                      fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:700, transition:"filter .15s",
                    }}>
                      {saving ? "Saving…" : <>Add Project <Rocket style={iconSize(12, 14)} /></>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!showAddForm && (
              <button onClick={() => setShowAddForm(true)} style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6,
                padding:"12px", background:"transparent",
                border:`2px dashed ${T?.border}`, color:T?.text3,
                borderRadius:10, cursor:"pointer", fontFamily:"'Inter',sans-serif",
                fontSize:13, fontWeight:600, transition:"border-color .15s,color .15s",
              }}>
                <Plus style={iconSize(13, 15)} /> Add project
              </button>
            )}
          </div>
        )}

        {/* ── ENDORSEMENTS tab ── */}
        {profileTab === "endorsements" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {loading
              ? Array.from({ length:2 }).map((_,i) => (
                  <div key={i} style={{ padding:16, borderRadius:10, border:`1px solid ${T?.border}`, display:"flex", gap:14 }}>
                    <Sk w="38px" h={38} r={8} />
                    <div style={{ flex:1 }}>
                      <Sk w="50%" h={13} mb={8} />
                      <Sk w="100%" h={12} mb={4} />
                      <Sk w="80%"  h={12} />
                    </div>
                  </div>
                ))
              : ENDORSEMENTS.map((e,i) => (
                <div key={i} style={{ padding:16, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)", borderRadius:10, border:`1px solid ${T?.border}`, display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div style={{ width:38, height:38, borderRadius:8, flexShrink:0, background: dark ? "rgba(124,58,237,.15)" : "rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, color:"#a78bfa", fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>
                    {e.skill[0]}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6, flexWrap:"wrap" }}>
                      <span style={{ fontSize:11, color:T?.text3 }}>endorsed you for</span>
                      <span style={{ fontSize:11, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", padding:"2px 9px", borderRadius:6, background:T?.skillHaveBg, border:`1px solid ${T?.skillHaveBorder}`, color:T?.skillHaveText }}>{e.skill}</span>
                    </div>
                    <p style={{ fontSize:12, color:T?.text2, fontStyle:"italic", lineHeight:1.55 }}>"{e.note}"</p>
                  </div>
                </div>
              ))
            }
            <div style={{ textAlign:"center", padding:"20px", color:T?.text3, fontSize:12 }}>
              Connect with more builders to get skill endorsements
            </div>
          </div>
        )}

        {/* ── ACTIVITY tab ── */}
        {profileTab === "activity" && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {loading
              ? Array.from({ length:4 }).map((_,i) => (
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 13px", borderRadius:8, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)" }}>
                    <Sk w="32px" h={32} r={8} />
                    <Sk w="60%" h={13} />
                    <Sk w="40px" h={11} />
                  </div>
                ))
              : ACTIVITY_FEED.map((a,i) => (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 13px", borderRadius:8, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)" }}>
                  <div style={{ width:32, height:32, borderRadius:8, flexShrink:0, background:`hsla(${a.hue},70%,60%,${dark?.1:.08})`, display:"flex", alignItems:"center", justifyContent:"center", color:hsl(a.hue) }}>
                    <a.Icon style={iconSize(14, 16)} />
                  </div>
                  <span style={{ fontSize:12, color:T?.text2, flex:1, minWidth:0 }}>
                    {a.a} <span style={{ color:T?.text, fontWeight:600 }}>{a.t}</span>
                  </span>
                  <span style={{ fontSize:10, color:T?.text3, fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>{a.time}</span>
                </div>
              ))
            }
          </div>
        )}

        {/* ── CONNECTIONS tab ── */}
        {profileTab === "connections" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {loading
              ? Array.from({ length:3 }).map((_,i) => (
                  <div key={i} style={{
                    display:"flex", gap:12, alignItems:"center",
                    padding:"12px 14px", borderRadius:10,
                    border:`1px solid ${T?.border}`,
                    background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)",
                  }}>
                    <Sk w="40px" h={40} r={10} />
                    <div style={{ flex:1 }}>
                      <Sk w="55%" h={13} mb={6} />
                      <Sk w="40%" h={11} mb={6} />
                      <Sk w="70%" h={11} />
                    </div>
                  </div>
                ))
              : connections.length === 0
                ? (
                  <div style={{ textAlign:"center", padding:"32px 0", color:T?.text3, fontSize:13 }}>
                    No connections yet. Start matching to connect with builders!
                  </div>
                )
                : <>
                    {connections.slice(0, 5).map((conn, i) => {
                      const name       = conn.name    ?? `User #${String(conn.to_user_id ?? conn.from_user_id ?? i).slice(0,8)}`;
                      const handle     = conn.handle  ?? String(conn.to_user_id ?? conn.from_user_id ?? i).slice(0,8);
                      const role       = conn.role    ?? conn.status ?? "Builder";
                      const bio        = conn.bio     ?? null;
                      const hue        = conn.hue != null
                        ? conn.hue
                        : (String(conn.to_user_id ?? conn.from_user_id ?? i)
                            .split("").reduce((a,c) => a + c.charCodeAt(0), 0)) % 360;
                      const skillsHave = conn.skillsHave ?? conn.skills_have ?? [];
                      const skillsNeed = conn.skillsNeed ?? conn.skills_need ?? [];
                      const match      = conn.match ?? 0;
                      const connInitials = name.trim().split(/\s+/).filter(Boolean)
                        .slice(0,2).map(p => p[0].toUpperCase()).join("") || "?";
                      const otherUserId = conn.to_user_id ?? conn.from_user_id ?? conn.id;

                      return (
                        <div key={conn.id ?? i} className="conn-card" style={{
                          display:"flex", gap:12, alignItems:"flex-start",
                          padding:"14px 16px", borderRadius:10,
                          border:`1px solid ${T?.border}`,
                          background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)",
                        }}>
                          {/* Avatar */}
                          <div style={{
                            width:40, height:40, borderRadius:10, flexShrink:0,
                            background:`hsla(${hue},65%,60%,${dark?.15:.1})`,
                            border:`1px solid hsla(${hue},65%,60%,.3)`,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:14, fontWeight:700,
                            color:`hsl(${hue},55%,${dark?72:44}%)`,
                            fontFamily:"'JetBrains Mono',monospace",
                            position:"relative",
                          }}>
                            {connInitials}
                            <div style={{
                              position:"absolute", bottom:-2, right:-2,
                              width:11, height:11, borderRadius:"50%",
                              background:"#22c55e",
                              border:`2px solid ${dark ? "#0a0a0f" : "#fafafa"}`,
                            }} />
                          </div>

                          {/* Info */}
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 }}>
                              <span style={{ fontSize:14, fontWeight:700, color:T?.text }}>{name}</span>
                              <span style={{ fontSize:11, color:T?.text3 }}>@{handle}</span>
                              {match > 0 && (
                                <div style={{
                                  display:"flex", alignItems:"center", gap:4,
                                  background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.22)",
                                  borderRadius:6, padding:"2px 8px",
                                }}>
                                  <span style={{ width:4, height:4, borderRadius:"50%", background:"#a78bfa", display:"block" }} />
                                  <span style={{ fontSize:11, color:"#a78bfa", fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{match}%</span>
                                </div>
                              )}
                            </div>

                            <div style={{ fontSize:11, fontWeight:600, color:`hsl(${hue},55%,${dark?65:50}%)`, marginBottom: bio ? 6 : 8 }}>
                              {role}
                            </div>

                            {bio && (
                              <p style={{
                                fontSize:11, color:T?.text2, lineHeight:1.55, marginBottom:8,
                                overflow:"hidden", display:"-webkit-box",
                                WebkitLineClamp:2, WebkitBoxOrient:"vertical",
                              }}>{bio}</p>
                            )}

                            {(skillsHave.length > 0 || skillsNeed.length > 0) && (
                              <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:10 }}>
                                {skillsHave.slice(0,3).map(s => (
                                  <span key={s} style={{
                                    padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:600, fontFamily:"'JetBrains Mono',monospace",
                                    background:T?.skillHaveBg, border:`1px solid ${T?.skillHaveBorder}`, color:T?.skillHaveText,
                                  }}>{s}</span>
                                ))}
                                {skillsNeed.slice(0,2).map(s => (
                                  <span key={s} style={{
                                    padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:600, fontFamily:"'JetBrains Mono',monospace",
                                    background:T?.skillNeedBg, border:`1px solid ${T?.skillNeedBorder}`, color:T?.skillNeedText,
                                  }}>{s}</span>
                                ))}
                              </div>
                            )}

                            <div className="conn-actions-row" style={{ display:"flex", gap:7 }}>
                              <button
                                onClick={() => setDashPage?.("messages")}
                                style={{
                                  padding:"6px 14px",
                                  background:"#7c3aed",
                                  border:"1px solid #7c3aed", borderRadius:8, color:"#fff",
                                  cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:700,
                                  transition:"filter .15s",
                                }}>
                                Message
                              </button>
                              <button
                                onClick={() => router.push(`/discover/profile/${otherUserId}`)}
                                style={{
                                  padding:"6px 12px", background:"transparent",
                                  border:`1px solid ${T?.border}`, color:T?.text2,
                                  borderRadius:8, cursor:"pointer",
                                  fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:600,
                                }}>
                                View profile
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {connections.length > 5 && (
                      <button
                        onClick={() => router.push("/connections")}
                        style={{
                          display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6,
                          padding:"11px", background:"transparent",
                          border:`2px dashed ${T?.border}`, color:T?.text3,
                          borderRadius:10, cursor:"pointer", fontFamily:"'Inter',sans-serif",
                          fontSize:12, fontWeight:600, transition:"border-color .15s,color .15s",
                        }}>
                        <span style={{ fontFamily:"'JetBrains Mono',monospace" }}>+{connections.length - 5}</span> more connections <ArrowRight style={iconSize(11, 13)} />
                      </button>
                    )}
                  </>
            }
          </div>
        )}
      </div>
    </div>
  );
}