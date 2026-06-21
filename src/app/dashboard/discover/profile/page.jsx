"use client"
import { useState, useEffect } from "react";
import { hsl, hsla, calculateMatchScore, Avatar, Lbl } from "../../shared";
import ProjectPage from "../../../../components/projectpage";
 
/* ─── helpers (mirrors ProfileTab) ──────────────────────────────────────── */
function nameInitials(name = "") {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
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
 
/* ══════════════════════════════════════════════════════════════════════════
   OTHER PROFILE TAB — read-only view of someone else's profile
   Same visual language as ProfileTab, but:
   - no Edit/Add controls
   - Connect / Pending / Message primary action instead of Edit
   - Match % badge
   - Mutual connections instead of full connection list
   - Endorse action (if connected) instead of add-endorsement CTA
══════════════════════════════════════════════════════════════════════════ */
export default function OtherProfileTab({
  T, dark,
  currentUser,
  viewUserId,
  setDashPage,
  setActiveConvo,
}) {
  const [profileTab,    setProfileTab]    = useState("projects");
  const [openProjectId, setOpenProjectId] = useState(null);
 
  const [profile,      setProfile]      = useState(null);
  const [projects,     setProjects]     = useState([]);
  const [connections,  setConnections]  = useState([]);
  const [mutuals,      setMutuals]      = useState([]);
  const [endorsements, setEndorsements] = useState([]);
  const [streak,       setStreak]       = useState([]);
  const [weekStreak,   setWeekStreak]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
 
  const [connectionStatus, setConnectionStatus] = useState("none"); // none | pending | connected
  const [connecting, setConnecting] = useState(false);
 
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res  = await fetch(`/api/profile/${viewUserId}`);
        const json = await res.json();
        if (!json.success || !json.profile) throw new Error(json.message ?? "Failed to load profile");
 
        const p = json.profile;
        setProfile(p);
 
        const mapped = (p.projects ?? []).map(mapProject).sort((a, b) => a.sort - b.sort);
        setProjects(mapped);
 
        const accepted = [
          ...(p.connections_from ?? []).filter(c => c.status === "accepted"),
          ...(p.connections_to   ?? []).filter(c => c.status === "accepted"),
        ];
        setConnections(accepted);
        setMutuals(p.mutual_connections ?? []);
        setEndorsements(p.endorsements ?? []);
        setStreak(buildStreak(mapped, accepted.length));
        setWeekStreak(buildWeekStreak(mapped, accepted.length));
        setConnectionStatus(p.connection_status ?? "none"); // expects backend to tell us viewer's relation
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (viewUserId) load();
  }, [viewUserId]);
 
  async function handleConnect() {
    setConnecting(true);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_user_id: viewUserId }),
      });
      const json = await res.json();
      if (json.success) setConnectionStatus("pending");
    } catch {
      /* swallow — could surface a toast */
    } finally {
      setConnecting(false);
    }
  }
 
  function handleMessage() {
    setActiveConvo?.(viewUserId);
    setDashPage?.("messages");
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
 
  const totalConnections = connections.length;
  const totalStars       = projects.reduce((s, p) => s + (p.stars ?? 0), 0);
  const initials          = nameInitials(profile?.name ?? "");
  const matchScore        = !loading && profile && currentUser
    ? calculateMatchScore(currentUser, profile)
    : null;
 
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
 
  return (
    <div className="fade-up" style={{ maxWidth: 720, margin: "0 auto" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .proj-card:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(124,58,237,.12); cursor:pointer; }
        .proj-card { transition:transform .2s, box-shadow .2s; }
        .connect-btn:hover { filter:brightness(1.08); }
        .endorse-btn:hover { border-color:rgba(124,58,237,.4) !important; }
      `}</style>
 
      {error && (
        <div style={{
          padding:"10px 16px", borderRadius:12, marginBottom:14,
          background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)",
          fontSize:12, color:"#f87171", display:"flex", gap:8, alignItems:"center",
        }}>
          ⚠ {error}
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
                <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                  <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:24, color:T.text, letterSpacing:"-0.5px" }}>
                    {profile?.name}
                  </div>
                  {matchScore != null && (
                    <span style={{
                      padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700,
                      background:"rgba(124,58,237,.12)", border:"1px solid rgba(124,58,237,.3)",
                      color:"#c4b5fd",
                    }}>
                      ✦ {matchScore}% Match
                    </span>
                  )}
                </div>
                <div style={{ fontSize:12, color:T.text3, marginTop:3 }}>
                  @{profile?.handle} · {profile?.role}
                </div>
                <p style={{ fontSize:13, color:T.text2, marginTop:8, lineHeight:1.6, maxWidth:460 }}>
                  {profile?.bio}
                </p>
                <div style={{ display:"flex", gap:7, marginTop:12, flexWrap:"wrap" }}>
                  {profile?.open_to_collaborate !== false && (
                    <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.25)", color:"#4ade80" }}>
                      ● Open to Collaborate
                    </span>
                  )}
                  {profile?.skills_need?.[0] && (
                    <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:"rgba(245,158,11,.1)", border:"1px solid rgba(245,158,11,.25)", color:"#f59e0b" }}>
                      Seeking {profile?.skills_need?.[0]}
                    </span>
                  )}
                  <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:T.skillNeedBg, border:`1px solid ${T.skillNeedBorder}`, color:T.skillNeedText }}>
                    📍 {resolveLocation(profile?.locations)}
                  </span>
                </div>
              </>
            )}
          </div>
 
          {/* ── primary action: Connect / Pending / Message ── */}
          {!loading && (
            connectionStatus === "connected" ? (
              <button onClick={handleMessage} style={{
                background:"transparent", border:`1px solid ${T.border}`,
                color:T.text2, padding:"7px 16px", borderRadius:10,
                cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:600, flexShrink:0,
              }}>💬 Message</button>
            ) : connectionStatus === "pending" ? (
              <button disabled style={{
                background:"transparent", border:`1px solid ${T.border}`,
                color:T.text3, padding:"7px 16px", borderRadius:10,
                cursor:"default", fontFamily:"inherit", fontSize:12, fontWeight:600, flexShrink:0,
              }}>Pending</button>
            ) : (
              <button className="connect-btn" onClick={handleConnect} disabled={connecting} style={{
                background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none",
                color:"#fff", padding:"7px 18px", borderRadius:10,
                cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700, flexShrink:0,
                transition:"filter .2s",
              }}>{connecting ? "Sending…" : "🤝 Connect"}</button>
            )
          )}
        </div>
 
        {/* stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", marginTop:22, paddingTop:18, borderTop:`1px solid ${T.border}` }}>
          {[
            { v: loading ? "—" : String(totalConnections), l:"Connections" },
            { v: loading ? "—" : String(projects.length),  l:"Projects" },
            { v: loading ? "—" : String(totalStars),        l:"Total Stars" },
            { v: loading ? "—" : String(mutuals.length),    l:"Mutual" },
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
          <Lbl T={T}>Skills They Have</Lbl>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:10 }}>
            {loading
              ? [80,60,70].map((w,i) => <Sk key={i} w={`${w}px`} h={24} r={99} />)
              : (profile?.skills_have ?? []).map(s => (
                <span key={s} style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:T.skillHaveBg, border:`1px solid ${T.skillHaveBorder}`, color:T.skillHaveText }}>{s}</span>
              ))
            }
          </div>
        </div>
        <div className="card-flat" style={{ padding:16 }}>
          <Lbl T={T}>Skills They Need</Lbl>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:10 }}>
            {loading
              ? [65,75].map((w,i) => <Sk key={i} w={`${w}px`} h={24} r={99} />)
              : (profile?.skills_need ?? []).map(s => (
                <span key={s} style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:T.skillNeedBg, border:`1px solid ${T.skillNeedBorder}`, color:T.skillNeedText }}>{s}</span>
              ))
            }
          </div>
        </div>
      </div>
 
      {/* ══ AVAILABILITY (read-only) ══ */}
      <div className="card-flat" style={{ padding:16, marginBottom:14 }}>
        <Lbl T={T}>Weekly Availability</Lbl>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
          {Object.entries(profile?.availability ?? {}).map(([day,on]) => (
            <div key={day} style={{
              padding:"6px 12px", borderRadius:8,
              border:`1px solid ${on ? "rgba(34,197,94,.35)" : T.border}`,
              background: on ? (dark ? "rgba(34,197,94,.1)" : "rgba(34,197,94,.08)") : "transparent",
              color: on ? "#4ade80" : T.text3,
              fontSize:11, fontWeight:700, textTransform:"capitalize",
            }}>
              {day.slice(0,3).toUpperCase()}
            </div>
          ))}
        </div>
      </div>
 
      {/* ══ WEEK STREAK BARS (read-only) ══ */}
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
 
      {/* ══ 5-WEEK HEATMAP (read-only) ══ */}
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
              {t==="connections" && !loading && <span style={{ marginLeft:5, fontSize:10, opacity:.6 }}>({mutuals.length} mutual)</span>}
            </button>
          ))}
        </div>
 
        {/* ── PROJECTS tab (no add button/form) ── */}
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
              : projects.length === 0
                ? (
                  <div style={{ textAlign:"center", padding:"32px 0", color:T.text3, fontSize:13 }}>
                    No public projects yet.
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
                              : `github.com/${profile?.handle}/${p?.n?.toLowerCase?.().replace(/ /g,"-") ?? ""}`
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
          </div>
        )}
 
        {/* ── ENDORSEMENTS tab (with Endorse action if connected) ── */}
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
              : endorsements.length === 0
                ? <div style={{ textAlign:"center", padding:"20px", color:T.text3, fontSize:12 }}>No endorsements yet.</div>
                : endorsements.map((e,i) => (
                  <div key={i} style={{ padding:16, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)", borderRadius:13, border:`1px solid ${T.border}`, display:"flex", gap:14, alignItems:"flex-start" }}>
                    <div style={{ width:38, height:38, borderRadius:10, flexShrink:0, background: dark ? "rgba(124,58,237,.15)" : "rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, color:"#a78bfa", fontWeight:700 }}>
                      {e.skill?.[0]}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6, flexWrap:"wrap" }}>
                        <span style={{ fontSize:11, color:T.text3 }}>endorsed for</span>
                        <span style={{ fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:99, background:T.skillHaveBg, border:`1px solid ${T.skillHaveBorder}`, color:T.skillHaveText }}>{e?.skill}</span>
                      </div>
                      <p style={{ fontSize:12, color:T.text2, fontStyle:"italic", lineHeight:1.55 }}>"{e?.note}"</p>
                    </div>
                  </div>
                ))
            }
            {connectionStatus === "connected" && (
              <button className="endorse-btn" style={{
                padding:"10px", background:"transparent", border:`2px dashed ${T.border}`,
                color:T.text3, borderRadius:13, cursor:"pointer", fontFamily:"inherit",
                fontSize:13, fontWeight:600, transition:"all .2s",
              }}>
                + Endorse a skill
              </button>
            )}
          </div>
        )}
 
        {/* ── ACTIVITY tab (read-only) ── */}
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
              : (profile?.activity_feed ?? []).map((a,i) => (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 13px", borderRadius:11, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)" }}>
                  <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background:`hsla(${a?.hue ?? 259},70%,60%,${dark?.1:.08})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{a?.icon}</div>
                  <span style={{ fontSize:12, color:T.text2, flex:1 }}>
                    {a?.a} <span style={{ color:T.text, fontWeight:600 }}>{a?.t}</span>
                  </span>
                  <span style={{ fontSize:10, color:T.text3 }}>{a?.time}</span>
                </div>
              ))
            }
          </div>
        )}
 
        {/* ── CONNECTIONS tab → mutuals only ── */}
        {profileTab === "connections" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {loading
              ? Array.from({ length:4 }).map((_,i) => (
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 14px", borderRadius:13, border:`1px solid ${T.border}`, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)" }}>
                    <Sk w="36px" h={36} r={10} />
                    <div style={{ flex:1 }}><Sk w="70%" h={13} mb={6} /><Sk w="50%" h={11} /></div>
                  </div>
                ))
              : mutuals.length === 0
                ? <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"32px 0", color:T.text3, fontSize:13 }}>No mutual connections.</div>
                : mutuals.map((m,i) => {
                    const hue = (String(m?.id ?? i).split("").reduce((a,c) => a + c.charCodeAt(0), 0)) % 360;
                    return (
                      <div key={m?.id ?? i} style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 14px", borderRadius:13, border:`1px solid ${T.border}`, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)" }}>
                        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:`hsla(${hue},60%,60%,${dark?.15:.1})`, border:`1px solid hsla(${hue},60%,60%,.3)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:`hsl(${hue},55%,${dark?75:45}%)` }}>
                          {nameInitials(m?.name)}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{m?.name}</div>
                          <div style={{ fontSize:10, fontWeight:600, marginTop:2, color:T.text3 }}>Mutual connection</div>
                        </div>
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