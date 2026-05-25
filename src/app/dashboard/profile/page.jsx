"use client";
import { useState, useEffect } from "react";
import { hsl, hsla, calculateMatchScore, Avatar, Lbl } from "../shared";
import ProjectPage from "../../../components/projectpage";

/* ─── helpers ────────────────────────────────────────────────────────────── */
const ENDORSEMENTS = [
  { skill: "React",      note: "One of the cleanest React codebases I've worked with." },
  { skill: "TypeScript", note: "Incredibly thorough with types. Made our codebase bulletproof." },
];

const ACTIVITY_FEED = [
  { a: "Connected with",    t: "Rohan Mehra",      time: "2h ago", hue: 340, icon: "🤝" },
  { a: "New 89% match —",   t: "Sara Chen",         time: "5h ago", hue: 271, icon: "✦"  },
  { a: "Sent request to",   t: "Priya Nair",        time: "1d ago", hue: 158, icon: "📨" },
  { a: "Updated skills:",   t: "Added TypeScript",  time: "2d ago", hue: 259, icon: "⚡" },
  { a: "Viewed by",         t: "Dev Kapoor",        time: "3d ago", hue: 38,  icon: "👁" },
  { a: "Project starred by",t: "Aanya Sharma",      time: "5d ago", hue: 259, icon: "★"  },
];

const PROJECT_STATES = ["Active", "Building", "Archived"];

const SKILL_SUGGESTIONS = [
  "React","TypeScript","Python","Node.js","LangChain","Next.js",
  "Rust","Go","Supabase","PostgreSQL","TailwindCSS","GraphQL",
  "Vue.js","Svelte","Docker","AWS","MongoDB","Redis","FastAPI","Prisma",
];

/* ── GitHub URL validator ── */
function validateGithubUrl(url) {
  if (!url || !url.trim()) return null; // optional field
  const trimmed = url.trim();
  // Accept github.com/user/repo or https://github.com/user/repo
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

function buildStreak(projects = [], connectionCount = 0) {
  const base = (connectionCount % 4) + 1;
  return Array.from({ length: 35 }, (_, i) => {
    const projectBoost = projects.filter((_, pi) => (pi * 7 + base) % 35 === i).length;
    return { day: i, count: Math.min(4, ((i * base + projectBoost * 2) % 5)) };
  });
}

function buildWeekStreak(projects = [], connectionCount = 0) {
  const base = (connectionCount % 4) + 1;
  return ["M","T","W","T","F","S","S"].map((label, i) => ({
    label,
    count: Math.min(4, ((i * base + projects.length) % 5)),
  }));
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

/* ── blank form state ── */
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
  const [streak,      setStreak]      = useState([]);
  const [weekStreak,  setWeekStreak]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res  = await fetch("/api/profile");
        const json = await res.json();
        if (!json.success || !json.profile) throw new Error(json.message ?? "Failed to load profile");

        const p = json.profile;
        setApiProfile(p);

        const mapped = (p.projects ?? []).map(mapProject).sort((a, b) => a.sort - b.sort);
        setProjects(mapped);

        const accepted = [
          ...(p.connections_from ?? []).filter(c => c.status === "accepted"),
          ...(p.connections_to   ?? []).filter(c => c.status === "accepted"),
        ];
        setConnections(accepted);
        setStreak(buildStreak(mapped, accepted.length));
        setWeekStreak(buildWeekStreak(mapped, accepted.length));

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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── validate form ── */
  function validateForm() {
    const e = {};
    if (!form.name.trim()) e.name = "Project name is required";
    const urlErr = validateGithubUrl(form.github_url);
    if (urlErr) e.github_url = urlErr;
    return e;
  }

  /* ── submit new project ── */
  async function handleAddProject(ev) {
    ev.preventDefault();
    const e = validateForm();
    if (Object.keys(e).length > 0) { setFormErrors(e); return; }
    setFormErrors({});
    setSaving(true);
    setSaveError(null);

    // Normalise URL — ensure https:// prefix
    const rawUrl = form.github_url.trim();
    const normUrl = rawUrl && !rawUrl.startsWith("http")
      ? "https://" + rawUrl
      : rawUrl;

    try {
      const res  = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
      if (!json.success) throw new Error(json.message ?? "Failed to save project");

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

  /* ── route to project page ── */
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
  const initials         = nameInitials(currentUser.name);

  const heatColor = (c) => {
    if (c === 0) return dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    if (c === 1) return dark ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.12)";
    if (c === 2) return dark ? "rgba(124,58,237,0.35)" : "rgba(124,58,237,0.25)";
    if (c === 3) return dark ? "rgba(124,58,237,0.55)" : "rgba(124,58,237,0.42)";
    return dark ? "rgba(124,58,237,0.78)" : "rgba(124,58,237,0.65)";
  };

  const currentStreak = (() => {
    let max = 0, cur = 0;
    [...streak].reverse().forEach(cell => {
      if (cell.count > 0) { cur++; max = Math.max(max, cur); }
      else cur = 0;
    });
    return max;
  })();

  const Sk = ({ w = "100%", h = 14, r = 8, mb = 0 }) => (
    <div style={{
      width: w, height: h, borderRadius: r, marginBottom: mb,
      background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      animation: "pulse 1.6s ease-in-out infinite",
    }} />
  );

  /* shared input style */
  const inp = (hasErr) => ({
    width: "100%", borderRadius: 10, padding: "9px 12px",
    background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    border: `1px solid ${hasErr ? "rgba(248,113,113,0.5)" : T.border}`,
    color: T.text, fontSize: 13, fontFamily: "inherit",
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
    <div className="fade-up" style={{ maxWidth: 720, margin: "0 auto" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slide-down { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .proj-card:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(124,58,237,.12); cursor:pointer; }
        .proj-card { transition:transform .2s, box-shadow .2s; }
        .add-form { animation: slide-down .25s ease both; }
        .pp-inp:focus { border-color: rgba(124,58,237,.5) !important; }
        .skill-tag-rm:hover { opacity:.7; }
        .state-chip-btn:hover { border-color:rgba(124,58,237,.4) !important; color:${T.text} !important; }
        .skill-quick-btn:hover { border-color:rgba(124,58,237,.35) !important; background:rgba(124,58,237,.07) !important; color:${T.text} !important; }
      `}</style>

      {/* error banner */}
      {error && (
        <div style={{
          padding:"10px 16px", borderRadius:12, marginBottom:14,
          background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)",
          fontSize:12, color:"#f87171", display:"flex", gap:8, alignItems:"center",
        }}>
          ⚠ {error}
          <button onClick={() => window.location.reload()} style={{
            marginLeft:"auto", fontSize:11, color:"#f87171",
            background:"transparent", border:"none", cursor:"pointer", fontFamily:"inherit",
          }}>Retry</button>
        </div>
      )}

      {/* ══ PROFILE CARD ══ */}
      <div className="card-flat" style={{ padding:24, marginBottom:16, position:"relative", overflow:"hidden" }}>
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          background: dark
            ? "linear-gradient(135deg,rgba(124,58,237,.07),transparent 60%)"
            : "linear-gradient(135deg,rgba(124,58,237,.04),transparent 60%)",
        }} />

        <div style={{ display:"flex", gap:20, alignItems:"flex-start", position:"relative" }}>
          <div style={{
            width:70, height:70, borderRadius:20, flexShrink:0,
            background:"linear-gradient(135deg,rgba(124,58,237,.25),rgba(168,85,247,.12))",
            border:"2px solid rgba(124,58,237,.35)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize: initials.length > 1 ? 22 : 28,
            fontWeight:700, color:"#c4b5fd",
            fontFamily:"'Instrument Serif',serif",
            boxShadow:"0 8px 24px rgba(124,58,237,.18)",
            letterSpacing:"-1px",
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
                <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:24, color:T.text, letterSpacing:"-0.5px" }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize:12, color:T.text3, marginTop:3 }}>
                  @{currentUser.handle} · {currentUser.role}
                </div>
                <p style={{ fontSize:13, color:T.text2, marginTop:8, lineHeight:1.6, maxWidth:460 }}>
                  {currentUser.bio}
                </p>
                <div style={{ display:"flex", gap:7, marginTop:12, flexWrap:"wrap" }}>
                  <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.25)", color:"#4ade80" }}>
                    ● Open to Collaborate
                  </span>
                  {currentUser.skillsNeed?.[0] && (
                    <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:"rgba(245,158,11,.1)", border:"1px solid rgba(245,158,11,.25)", color:"#f59e0b" }}>
                      Seeking {currentUser.skillsNeed[0]}
                    </span>
                  )}
                  <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:T.skillNeedBg, border:`1px solid ${T.skillNeedBorder}`, color:T.skillNeedText }}>
                    📍 {currentUser.location}
                  </span>
                </div>
              </>
            )}
          </div>

          <button onClick={() => setDashPage("settings")} style={{
            background:"transparent", border:`1px solid ${T.border}`,
            color:T.text2, padding:"7px 16px", borderRadius:10,
            cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:600, flexShrink:0,
          }}>Edit →</button>
        </div>

        {/* stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", marginTop:22, paddingTop:18, borderTop:`1px solid ${T.border}` }}>
          {[
            { v: loading ? "—" : String(totalConnections), l:"Connections" },
            { v: loading ? "—" : String(projects.length),  l:"Projects" },
            { v: loading ? "—" : String(totalStars),        l:"Total Stars" },
            { v: loading ? "—" : String(profileViews),      l:"Profile Views" },
          ].map((s,i) => (
            <div key={i} style={{ textAlign:"center", borderRight: i < 3 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:22, color:T.text }}>{s.v}</div>
              <div style={{ fontSize:11, color:T.text3, marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ SKILLS ROW ══ */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        <div className="card-flat" style={{ padding:16 }}>
          <Lbl T={T}>Skills I Have</Lbl>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:10 }}>
            {loading
              ? [80,60,70].map((w,i) => <Sk key={i} w={`${w}px`} h={24} r={99} />)
              : (currentUser.skillsHave ?? []).map(s => (
                <span key={s} style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:T.skillHaveBg, border:`1px solid ${T.skillHaveBorder}`, color:T.skillHaveText }}>{s}</span>
              ))
            }
          </div>
        </div>
        <div className="card-flat" style={{ padding:16 }}>
          <Lbl T={T}>Skills I Need</Lbl>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:10 }}>
            {loading
              ? [65,75].map((w,i) => <Sk key={i} w={`${w}px`} h={24} r={99} />)
              : (currentUser.skillsNeed ?? []).map(s => (
                <span key={s} style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:T.skillNeedBg, border:`1px solid ${T.skillNeedBorder}`, color:T.skillNeedText }}>{s}</span>
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
              border:`1px solid ${on ? "rgba(34,197,94,.35)" : T.border}`,
              background: on ? (dark ? "rgba(34,197,94,.1)" : "rgba(34,197,94,.08)") : "transparent",
              color: on ? "#4ade80" : T.text3,
              cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:700, transition:"all .2s", textTransform:"capitalize",
            }}>
              {day.slice(0,3).toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ fontSize:11, color:T.text3, marginTop:10 }}>
          Available {Object.values(availability).filter(Boolean).length} days/week
        </div>
      </div>

      {/* ══ WEEK STREAK BARS ══ */}
      <div className="card-flat" style={{ padding:16, marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <Lbl T={T}>This Week's Activity</Lbl>
          <span style={{ fontSize:11, color:T.text3 }}>
            {loading ? "—" : `${weekStreak.filter(d => d.count > 0).length} / 7 active days`}
          </span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"flex-end", height:48 }}>
          {loading
            ? Array.from({ length:7 }).map((_,i) => (
                <div key={i} style={{ flex:1, borderRadius:6, background: dark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)", animation:"pulse 1.6s ease-in-out infinite", animationDelay:`${i*60}ms`, height:"100%" }} />
              ))
            : weekStreak.map((d,i) => (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, height:"100%" }}>
                  <div style={{ flex:1, width:"100%", background: dark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)", borderRadius:6, overflow:"hidden", display:"flex", alignItems:"flex-end" }}>
                    <div style={{
                      width:"100%",
                      height:`${[0,25,50,75,100][d.count]}%`,
                      background: d.count === 0 ? "transparent" : "linear-gradient(180deg,#a855f7,#7c3aed)",
                      borderRadius:4,
                      transition:"height .5s cubic-bezier(.34,1.56,.64,1)",
                      transitionDelay:`${i*60}ms`,
                    }} />
                  </div>
                  <span style={{ fontSize:9, color:T.text3, fontWeight:700 }}>{d.label}</span>
                </div>
              ))
          }
        </div>
      </div>

      {/* ══ 5-WEEK HEATMAP ══ */}
      <div className="card-flat" style={{ padding:16, marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <Lbl T={T}>Activity streak (last 5 weeks)</Lbl>
          <div style={{ display:"flex", gap:14 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:18, color:"#a78bfa" }}>{loading ? "—" : currentStreak}</div>
              <div style={{ fontSize:10, color:T.text3 }}>day streak</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:18, color:T.text }}>{loading ? "—" : streak.filter(c => c.count > 0).length}</div>
              <div style={{ fontSize:10, color:T.text3 }}>active days</div>
            </div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:4 }}>
          {["M","T","W","T","F","S","S"].map((d,i) => (
            <div key={i} style={{ fontSize:9, color:T.text3, textAlign:"center" }}>{d}</div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
          {loading
            ? Array.from({ length:35 }).map((_,i) => (
                <div key={i} style={{ height:14, borderRadius:3, background: dark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)", animation:"pulse 1.6s ease-in-out infinite", animationDelay:`${i*30}ms` }} />
              ))
            : streak.map((cell,i) => (
                <div key={i} title={`${cell.count} contribution${cell.count!==1?"s":""}`}
                  style={{ height:14, borderRadius:3, background:heatColor(cell.count), cursor:"default" }} />
              ))
          }
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:10, justifyContent:"flex-end" }}>
          <span style={{ fontSize:10, color:T.text3 }}>Less</span>
          {[0,1,2,3,4].map(c => (
            <div key={c} style={{ width:10, height:10, borderRadius:2, background:heatColor(c) }} />
          ))}
          <span style={{ fontSize:10, color:T.text3 }}>More</span>
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="card-flat" style={{ padding:20 }}>
        <div style={{ display:"flex", gap:4, marginBottom:18, borderBottom:`1px solid ${T.border}`, paddingBottom:12, overflowX:"auto" }}>
          {["projects","endorsements","activity","connections"].map(t => (
            <button key={t} onClick={() => setProfileTab(t)} style={{
              background: profileTab===t ? (dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)") : "none",
              border:"none", color: profileTab===t ? T.text : T.text3,
              cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:500,
              padding:"7px 15px", borderRadius:8, transition:"all .2s",
              whiteSpace:"nowrap", textTransform:"capitalize",
            }}>
              {t}
              {t==="projects"    && !loading && <span style={{ marginLeft:5, fontSize:10, opacity:.6 }}>({projects.length})</span>}
              {t==="connections" && !loading && <span style={{ marginLeft:5, fontSize:10, opacity:.6 }}>({totalConnections})</span>}
            </button>
          ))}
        </div>

        {/* ── PROJECTS tab ── */}
        {profileTab === "projects" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {loading
              ? Array.from({ length:2 }).map((_,i) => (
                  <div key={i} style={{ padding:16, borderRadius:13, border:`1px solid ${T.border}`, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)" }}>
                    <Sk w="60%" h={16} mb={10} />
                    <Sk w="100%" h={12} mb={5} />
                    <Sk w="80%"  h={12} mb={12} />
                    <div style={{ display:"flex", gap:5 }}>
                      {[50,55,45].map((w,j) => <Sk key={j} w={`${w}px`} h={20} r={99} />)}
                    </div>
                  </div>
                ))
              : projects.length === 0 && !showAddForm
                ? (
                  <div style={{ textAlign:"center", padding:"32px 0", color:T.text3, fontSize:13 }}>
                    No projects yet — add your first one below.
                  </div>
                )
                : projects.map((p,i) => (
                  <div key={p.id ?? i} className="proj-card" onClick={() => setOpenProjectId(p.id)} style={{
                    padding:16,
                    background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)",
                    borderRadius:13, border:`1px solid ${T.border}`,
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8, gap:8, flexWrap:"wrap" }}>
                      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                        <span style={{ fontSize:22 }}>{p.img}</span>
                        <div>
                          <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{p.n}</div>
                          <div style={{ fontSize:11, color:T.text3, marginTop:1 }}>
                            {p.url && p.url !== "#"
                              ? p.url.replace("https://","")
                              : `github.com/${currentUser.handle}/${p.n.toLowerCase().replace(/ /g,"-")}`
                            }
                          </div>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
                        <span style={{
                          fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:99,
                          background: ["Live","Active"].includes(p.status) ? "rgba(34,197,94,.1)" : "rgba(245,158,11,.1)",
                          border:`1px solid ${["Live","Active"].includes(p.status) ? "rgba(34,197,94,.25)" : "rgba(245,158,11,.25)"}`,
                          color: ["Live","Active"].includes(p.status) ? "#4ade80" : "#fbbf24",
                        }}>{p.status}</span>
                        <span style={{ fontSize:11, color:T.text3 }}>★ {p.stars}</span>
                        <span style={{ fontSize:11, color:"#a78bfa", fontWeight:600 }}>View →</span>
                      </div>
                    </div>
                    {p.d && <p style={{ fontSize:12, color:T.text2, lineHeight:1.55, marginBottom:10 }}>{p.d}</p>}
                    {p.tags.length > 0 && (
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                        {p.tags.map(tag => (
                          <span key={tag} style={{ padding:"2px 9px", borderRadius:99, fontSize:10, fontWeight:600, background: dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)", color:T.text2 }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
            }

            {/* ══ ADD PROJECT FORM (onboarding-style) ══ */}
            {showAddForm && (
              <div className="add-form" style={{
                borderRadius:16, border:`1px solid rgba(124,58,237,.3)`,
                background: dark ? "rgba(124,58,237,.06)" : "rgba(124,58,237,.03)",
                overflow:"hidden",
              }}>
                {/* Header */}
                <div style={{
                  padding:"14px 20px",
                  borderBottom:`1px solid ${T.border}`,
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{
                      fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:99,
                      background:"rgba(124,58,237,.15)", border:"1px solid rgba(124,58,237,.3)",
                      color:"#c4a8ff", textTransform:"uppercase", letterSpacing:".8px",
                    }}>★ New Project</span>
                  </div>
                  <button onClick={() => { setShowAddForm(false); setForm(BLANK_FORM); setSaveError(null); setFormErrors({}); }} style={{
                    background:"transparent", border:"none", color:T.text3,
                    cursor:"pointer", fontSize:20, lineHeight:1, padding:0,
                  }}>×</button>
                </div>

                <form onSubmit={handleAddProject} style={{ padding:"20px 20px 18px", display:"flex", flexDirection:"column", gap:16 }}>

                  {/* Name + State row */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 160px", gap:10 }}>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:T.text3, letterSpacing:".04em", display:"block", marginBottom:5, textTransform:"uppercase" }}>
                        Project Name <span style={{ color:"#f87171" }}>*</span>
                      </label>
                      <input
                        required
                        className="pp-inp"
                        placeholder="AI Chat Engine"
                        value={form.name}
                        onChange={e => {
                          setForm(f => ({ ...f, name: e.target.value }));
                          if (formErrors.name) setFormErrors(p => ({ ...p, name: undefined }));
                        }}
                        style={inp(!!formErrors.name)}
                      />
                      {formErrors.name && <div style={{ fontSize:11, color:"#f87171", marginTop:4 }}>⚠ {formErrors.name}</div>}
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:T.text3, letterSpacing:".04em", display:"block", marginBottom:5, textTransform:"uppercase" }}>
                        ⭐ Stars
                      </label>
                      <input
                        className="pp-inp"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={form.stars}
                        onChange={e => setForm(f => ({ ...f, stars: e.target.value }))}
                        style={inp(false)}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:T.text3, letterSpacing:".04em", display:"block", marginBottom:5, textTransform:"uppercase" }}>
                      Short Description
                    </label>
                    <textarea
                      className="pp-inp"
                      placeholder="What does this project do? Who is it for?"
                      rows={2}
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      style={{ ...inp(false), resize:"vertical", lineHeight:1.55 }}
                    />
                  </div>

                  {/* GitHub URL + Branch */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 110px", gap:10 }}>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:T.text3, letterSpacing:".04em", display:"block", marginBottom:5, textTransform:"uppercase" }}>
                        GitHub URL
                      </label>
                      <div style={{ position:"relative" }}>
                        <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:12 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={T.text3}>
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.83.58C20.57 21.79 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                          </svg>
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
                      {formErrors.github_url && <div style={{ fontSize:11, color:"#f87171", marginTop:4 }}>⚠ {formErrors.github_url}</div>}
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:T.text3, letterSpacing:".04em", display:"block", marginBottom:5, textTransform:"uppercase" }}>
                        Branch
                      </label>
                      <input
                        className="pp-inp"
                        placeholder="main"
                        value={form.branch}
                        onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
                        style={inp(false)}
                      />
                    </div>
                  </div>

                  {/* State chips */}
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:T.text3, letterSpacing:".04em", display:"block", marginBottom:8, textTransform:"uppercase" }}>
                      State
                    </label>
                    <div style={{ display:"flex", gap:6 }}>
                      {PROJECT_STATES.map(s => {
                        const sc = stateColors[s] ?? stateColors.Building;
                        const on = form.state === s;
                        return (
                          <button
                            key={s} type="button"
                            className="state-chip-btn"
                            onClick={() => setForm(f => ({ ...f, state: s }))}
                            style={{
                              padding:"6px 16px", borderRadius:99, fontSize:11, fontWeight:700,
                              cursor:"pointer", fontFamily:"inherit", transition:"all .15s",
                              background: on ? sc.bg : "transparent",
                              border: on ? `1px solid ${sc.border}` : `1px solid ${T.border}`,
                              color: on ? sc.color : T.text3,
                            }}
                          >{s}</button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skills Used */}
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:T.text3, letterSpacing:".04em", display:"block", marginBottom:5, textTransform:"uppercase" }}>
                      Skills Used <span style={{ color:T.text3, fontWeight:400, textTransform:"none" }}>({form.skills_used.length}/8)</span>
                    </label>

                    {/* Selected tags */}
                    {form.skills_used.length > 0 && (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
                        {form.skills_used.map(s => (
                          <span key={s} style={{
                            display:"inline-flex", alignItems:"center", gap:5,
                            padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600,
                            background:"rgba(124,58,237,.12)", border:"1px solid rgba(124,58,237,.3)", color:"#c4b5fd",
                          }}>
                            {s}
                            <button type="button" className="skill-tag-rm" onClick={() => removeSkill(s)} style={{
                              background:"transparent", border:"none", color:"#c4b5fd",
                              cursor:"pointer", fontSize:13, lineHeight:1, padding:0,
                            }}>×</button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Search + custom input */}
                    <div style={{ display:"flex", gap:6 }}>
                      <input
                        className="pp-inp"
                        placeholder="Search or type a skill, then press Enter…"
                        value={skillInput || skillSearch}
                        onChange={e => {
                          setSkillInput(e.target.value);
                          setSkillSearch(e.target.value);
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (skillInput.trim()) addSkill(skillInput);
                          }
                        }}
                        style={{ ...inp(false), flex:1 }}
                      />
                    </div>

                    {/* Filtered suggestion chips */}
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:8, maxHeight:100, overflowY:"auto" }}>
                      {filteredSuggestions.map(s => {
                        const maxed = form.skills_used.length >= 8;
                        return (
                          <button
                            key={s} type="button"
                            className="skill-quick-btn"
                            onClick={() => !maxed && addSkill(s)}
                            disabled={maxed}
                            style={{
                              padding:"4px 11px", borderRadius:99, fontSize:10, fontWeight:600,
                              background:"transparent", border:`1px solid ${T.border}`,
                              color: maxed ? T.text3 : T.text3,
                              cursor: maxed ? "not-allowed" : "pointer",
                              fontFamily:"inherit", transition:"all .15s",
                              opacity: maxed ? .4 : 1,
                            }}
                          >+ {s}</button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Save error */}
                  {saveError && (
                    <div style={{ fontSize:12, color:"#f87171", padding:"8px 12px", borderRadius:9, background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)" }}>
                      ⚠ {saveError}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display:"flex", gap:8, justifyContent:"flex-end", paddingTop:4 }}>
                    <button type="button" onClick={() => { setShowAddForm(false); setForm(BLANK_FORM); setSaveError(null); setFormErrors({}); }} style={{
                      padding:"9px 18px", background:"transparent", border:`1px solid ${T.border}`,
                      color:T.text2, borderRadius:10, cursor:"pointer", fontFamily:"inherit",
                      fontSize:12, fontWeight:600,
                    }}>Cancel</button>
                    <button type="submit" disabled={saving || !form.name.trim()} style={{
                      padding:"9px 22px",
                      background: form.name.trim() ? "linear-gradient(135deg,#7c3aed,#a855f7)" : (dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"),
                      border:"none", borderRadius:10,
                      color: form.name.trim() ? "#fff" : T.text3,
                      cursor: form.name.trim() ? "pointer" : "default",
                      fontFamily:"inherit", fontSize:12, fontWeight:700, transition:"all .2s",
                    }}>
                      {saving ? "Saving…" : "🚀 Add Project"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* + Add project trigger */}
            {!showAddForm && (
              <button onClick={() => setShowAddForm(true)} style={{
                padding:"12px", background:"transparent",
                border:`2px dashed ${T.border}`, color:T.text3,
                borderRadius:13, cursor:"pointer", fontFamily:"inherit",
                fontSize:13, fontWeight:600, transition:"all .2s",
              }}>
                + Add project
              </button>
            )}
          </div>
        )}

        {/* ── ENDORSEMENTS tab ── */}
        {profileTab === "endorsements" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {loading
              ? Array.from({ length:2 }).map((_,i) => (
                  <div key={i} style={{ padding:16, borderRadius:13, border:`1px solid ${T.border}`, display:"flex", gap:14 }}>
                    <Sk w="38px" h={38} r={10} />
                    <div style={{ flex:1 }}>
                      <Sk w="50%" h={13} mb={8} />
                      <Sk w="100%" h={12} mb={4} />
                      <Sk w="80%"  h={12} />
                    </div>
                  </div>
                ))
              : ENDORSEMENTS.map((e,i) => (
                <div key={i} style={{ padding:16, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)", borderRadius:13, border:`1px solid ${T.border}`, display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div style={{ width:38, height:38, borderRadius:10, flexShrink:0, background: dark ? "rgba(124,58,237,.15)" : "rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, color:"#a78bfa", fontWeight:700 }}>
                    {e.skill[0]}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6, flexWrap:"wrap" }}>
                      <span style={{ fontSize:11, color:T.text3 }}>endorsed you for</span>
                      <span style={{ fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:99, background:T.skillHaveBg, border:`1px solid ${T.skillHaveBorder}`, color:T.skillHaveText }}>{e.skill}</span>
                    </div>
                    <p style={{ fontSize:12, color:T.text2, fontStyle:"italic", lineHeight:1.55 }}>"{e.note}"</p>
                  </div>
                </div>
              ))
            }
            <div style={{ textAlign:"center", padding:"20px", color:T.text3, fontSize:12 }}>
              Connect with more builders to get skill endorsements
            </div>
          </div>
        )}

        {/* ── ACTIVITY tab ── */}
        {profileTab === "activity" && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {loading
              ? Array.from({ length:4 }).map((_,i) => (
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 13px", borderRadius:11, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)" }}>
                    <Sk w="32px" h={32} r={9} />
                    <Sk w="60%" h={13} />
                    <Sk w="40px" h={11} />
                  </div>
                ))
              : ACTIVITY_FEED.map((a,i) => (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 13px", borderRadius:11, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)" }}>
                  <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background:`hsla(${a.hue},70%,60%,${dark?.1:.08})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{a.icon}</div>
                  <span style={{ fontSize:12, color:T.text2, flex:1 }}>
                    {a.a} <span style={{ color:T.text, fontWeight:600 }}>{a.t}</span>
                  </span>
                  <span style={{ fontSize:10, color:T.text3 }}>{a.time}</span>
                </div>
              ))
            }
          </div>
        )}

        {/* ── CONNECTIONS tab ── */}
        {profileTab === "connections" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {loading
              ? Array.from({ length:4 }).map((_,i) => (
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 14px", borderRadius:13, border:`1px solid ${T.border}`, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)" }}>
                    <Sk w="36px" h={36} r={10} />
                    <div style={{ flex:1 }}><Sk w="70%" h={13} mb={6} /><Sk w="50%" h={11} /></div>
                  </div>
                ))
              : connections.length === 0
                ? <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"32px 0", color:T.text3, fontSize:13 }}>No connections yet. Start matching to connect with builders!</div>
                : connections.map((conn,i) => {
                    const otherId = conn.to_user_id ?? conn.from_user_id;
                    const hue = (String(otherId).split("").reduce((a,c) => a + c.charCodeAt(0), 0)) % 360;
                    const initials2 = `U${i+1}`;
                    return (
                      <div key={conn.id ?? i} style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 14px", borderRadius:13, border:`1px solid ${T.border}`, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)" }}>
                        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:`hsla(${hue},60%,60%,${dark?.15:.1})`, border:`1px solid hsla(${hue},60%,60%,.3)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:`hsl(${hue},55%,${dark?75:45}%)` }}>{initials2}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:T.text }}>User #{String(otherId).slice(0,8)}</div>
                          <div style={{ fontSize:10, fontWeight:600, marginTop:2, color:`hsl(${hue},55%,${dark?70:45}%)` }}>{conn.status}</div>
                        </div>
                        <button onClick={() => setDashPage?.("messages")} style={{
                          padding:"5px 10px", background:"transparent", border:`1px solid ${T.border}`,
                          color:T.text2, borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                          fontSize:11, fontWeight:600, flexShrink:0,
                        }}>Chat</button>
                      </div>
                    );
                  })
            }
          </div>
        )}
      </div>
    </div>
  );
}