"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hsl, hsla, calculateMatchScore, Avatar, Lbl } from "../../shared";
import ProjectPage from "../../../../components/projectpage";
import {
  MapPin, Star, MessageSquare, Handshake, Ban, AlertTriangle,
  ArrowLeft, ArrowRight, Sparkles, Clock,
} from "lucide-react";

const iconSize = (min, max, vw = 3) => ({
  width: `clamp(${min}px, ${vw}vw, ${max}px)`,
  height: `clamp(${min}px, ${vw}vw, ${max}px)`,
  flexShrink: 0,
});

function nameInitials(name = "") {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]?.[0]?.toUpperCase() ?? "?";
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase() || "?";
}

// Endorsement rows can come back with `skill` as a plain string, or as a
// joined/nested object (e.g. `{ name: "React" }`). Normalize to a display
// string instead of letting React print "[object Object]".
function skillLabel(skill) {
  if (skill == null) return "";
  if (typeof skill === "string") return skill;
  if (typeof skill === "object") {
    return skill.name ?? skill.skill ?? skill.title ?? skill.label ?? "";
  }
  return String(skill);
}

function buildStreak(projects = [], connectionCount = 0) {
  const safeCount = Number(connectionCount) || 0;
  const base = (safeCount % 4) + 1;
  return Array.from({ length: 35 }, (_, i) => {
    const projectBoost = (projects ?? []).filter((_, pi) => (pi * 7 + base) % 35 === i).length;
    return { day: i, count: Math.min(4, ((i * base + projectBoost * 2) % 5)) };
  });
}

function buildWeekStreak(projects = [], connectionCount = 0) {
  const safeCount = Number(connectionCount) || 0;
  const base = (safeCount % 4) + 1;
  return ["M","T","W","T","F","S","S"].map((label, i) => ({
    label,
    count: Math.min(4, ((i * base + (projects ?? []).length) % 5)),
  }));
}

// Project mapping — ProfileTab's framework: trust the row shape coming back
// from the API, apply simple `??` fallbacks, and don't null-guard the row
// itself (the caller is expected to hand us real project objects).
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
  if (typeof loc === "string") return loc || "Remote";
  if (Array.isArray(loc)) {
    const first = loc[0];
    if (!first) return "Remote";
    return [first?.city, first?.state].filter(Boolean).join(", ") || "Remote";
  }
  if (typeof loc === "object") {
    const { city, state, country } = loc;
    return [city, state ?? country].filter(Boolean).join(", ") || "Remote";
  }
  return "Remote";
}

function normalizeConnectionStatus(raw) {
  if (raw === "connected") return "accepted";
  if (raw === "none" || raw == null) return null;
  return raw;
}

async function callStartConversation(partnerId) {
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_b_id: partnerId }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Could not start chat");
  }
  return json.data;
}

async function callSendConnectionRequest(userId) {
  const res = await fetch("/api/connection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Could not send request");
  }
  return json;
}

async function callConnectionResponse(receiverId, status) {
  const res = await fetch("/api/connection/response", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ receiverId, status }),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error || "Request failed");
  }
  return json;
}

export default function OtherProfileTab({
  T,
  dark,
  currentUser,
  viewUserId,
  setDashPage,
  setActiveConvo,
  onViewProfile,
}) {
  const router = useRouter();

  const [profileTab,    setProfileTab]    = useState("projects");
  const [openProjectId, setOpenProjectId] = useState(null);

  const [profile,      setProfile]      = useState(null);
  const [projects,     setProjects]     = useState([]);
  const [connections,  setConnections]  = useState([]);
  const [mutuals,      setMutuals]      = useState([]);
  const [streak,       setStreak]       = useState([]);
  const [weekStreak,   setWeekStreak]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const [endorsements,        setEndorsements]        = useState([]);
  const [endorsementsLoading, setEndorsementsLoading] = useState(true);
  const [endorsementsError,   setEndorsementsError]   = useState(null);

  const [connectionStatus, setConnectionStatus] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [blocking,   setBlocking]   = useState(false);

  const [messaging, setMessaging] = useState(false);
  const [msgError,  setMsgError]  = useState(null);

  const safeT = T && typeof T === "object" ? T : {};

  useEffect(() => {
    if (!viewUserId) {
      setLoading(false);
      setError("No user ID provided.");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res  = await fetch(`/api/projects/${viewUserId}`);

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const json = await res.json();

        if (!json?.success || !json?.profile) {
          throw new Error(json?.message ?? "Failed to load profile");
        }

        if (cancelled) return;

        const p = json.profile;
        setProfile(p);
         

        const mapped = (p.projects ?? []).map(mapProject).sort((a, b) => a.sort - b.sort);
        setProjects(mapped);

        const from    = Array.isArray(p?.connections_from) ? p.connections_from : [];
        const to      = Array.isArray(p?.connections_to)   ? p.connections_to   : [];
        const accepted = [
          ...from.filter(c => c?.status === "accepted"),
          ...to.filter(c => c?.status === "accepted"),
        ];
        setConnections(accepted);
        setMutuals(Array.isArray(p?.mutual_connections) ? p.mutual_connections : []);
        setStreak(buildStreak(mapped, accepted.length));
        setWeekStreak(buildWeekStreak(mapped, accepted.length));
        setConnectionStatus(normalizeConnectionStatus(p?.connection_status ?? p?.connectionStatus));
      } catch (err) {
        if (!cancelled) setError(err?.message ?? "An unexpected error occurred.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [viewUserId]);

  useEffect(() => {
    if (!viewUserId) {
      setEndorsementsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadEndorsements() {
      try {
        setEndorsementsLoading(true);
        setEndorsementsError(null);

        const res  = await fetch(`/api/endorsements?userId=${encodeURIComponent(viewUserId)}`);
        const json = await res.json();
        if (!json?.success) throw new Error(json?.error ?? json?.message ?? "Failed to load endorsements");

        if (!cancelled) setEndorsements(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        if (!cancelled) setEndorsementsError(err?.message ?? "Failed to load endorsements");
      } finally {
        if (!cancelled) setEndorsementsLoading(false);
      }
    }

    loadEndorsements();
    return () => { cancelled = true; };
  }, [viewUserId]);

  async function retryEndorsements() {
    if (!viewUserId) return;
    try {
      setEndorsementsLoading(true);
      setEndorsementsError(null);
      const res  = await fetch(`/api/endorsements?userId=${encodeURIComponent(viewUserId)}`);
      const json = await res.json();
      if (!json?.success) throw new Error(json?.error ?? json?.message ?? "Failed to load endorsements");
      setEndorsements(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setEndorsementsError(err?.message ?? "Failed to load endorsements");
    } finally {
      setEndorsementsLoading(false);
    }
  }

  async function handleConnect() {
    if (!viewUserId || connecting) return;
    setConnecting(true);
    const prev = connectionStatus;
    setConnectionStatus("pending");
    try {
      const json = await callSendConnectionRequest(viewUserId);
      const status = json?.action === "added" || json?.success ? "pending" : prev;
      setConnectionStatus(status);
    } catch {
      setConnectionStatus(prev);
    } finally {
      setConnecting(false);
    }
  }

  async function handleCancelRequest() {
    if (!viewUserId || connecting) return;
    setConnecting(true);
    const prev = connectionStatus;
    setConnectionStatus(null);
    try {
      await callConnectionResponse(viewUserId, "declined");
    } catch {
      setConnectionStatus(prev);
    } finally {
      setConnecting(false);
    }
  }

  async function handleBlock() {
    if (!viewUserId || blocking) return;
    setBlocking(true);
    const prev = connectionStatus;
    const next = prev === "blocked" ? null : "blocked";
    setConnectionStatus(next);
    try {
      await callConnectionResponse(viewUserId, prev === "blocked" ? "unblocked" : "blocked");
    } catch {
      setConnectionStatus(prev);
    } finally {
      setBlocking(false);
    }
  }

  async function handleMessage() {
    if (!viewUserId || messaging) return;
    setMessaging(true);
    setMsgError(null);
    try {
      const conversation = await callStartConversation(viewUserId);
      if (typeof setActiveConvo === "function") setActiveConvo(conversation.id);
      if (typeof setDashPage   === "function") setDashPage("messages");
    } catch (err) {
      setMsgError(err?.message || "Could not start a chat.");
    } finally {
      setMessaging(false);
    }
  }

  function handleBack() {
    if (typeof setDashPage === "function") setDashPage("discover");
  }

  function handleViewMutual(id) {
    if (id == null) return;
    if (typeof onViewProfile === "function") {
      onViewProfile(id);
    } else {
      router.push(`/discover/profile/${id}`);
    }
  }

  if (openProjectId) {
    return (
      <ProjectPage
        projectId={openProjectId}
        onBack={() => setOpenProjectId(null)}
        T={safeT}
        dark={dark}
        currentUser={currentUser}
      />
    );
  }

  const totalConnections = connections.length;
  const totalStars       = projects.reduce((s, p) => s + (p.stars ?? 0), 0);
  const initials         = nameInitials(profile?.name ?? "");
  const matchScore       = !loading && profile && currentUser
    ? (typeof calculateMatchScore === "function" ? calculateMatchScore(currentUser, profile) : null)
    : null;

  const heatColor = (c) => {
    const n = Number(c) || 0;
    if (n === 0) return dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    if (n === 1) return dark ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.12)";
    if (n === 2) return dark ? "rgba(124,58,237,0.35)" : "rgba(124,58,237,0.25)";
    if (n === 3) return dark ? "rgba(124,58,237,0.55)" : "rgba(124,58,237,0.42)";
    return dark ? "rgba(124,58,237,0.78)" : "rgba(124,58,237,0.65)";
  };

  const currentStreak = (() => {
    let max = 0, cur = 0;
    [...streak].reverse().forEach(cell => {
      if ((cell?.count ?? 0) > 0) { cur++; max = Math.max(max, cur); }
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

  const border      = safeT.border      ?? "rgba(128,128,128,0.2)";
  const border2     = safeT.border2     ?? "rgba(128,128,128,0.3)";
  const text        = safeT.text        ?? "inherit";
  const text2       = safeT.text2       ?? "rgba(128,128,128,0.8)";
  const text3       = safeT.text3       ?? "rgba(128,128,128,0.5)";
  const skillHaveBg     = safeT.skillHaveBg     ?? "rgba(124,58,237,0.1)";
  const skillHaveBorder = safeT.skillHaveBorder ?? "rgba(124,58,237,0.25)";
  const skillHaveText   = safeT.skillHaveText   ?? "#c4b5fd";
  const skillNeedBg     = safeT.skillNeedBg     ?? "rgba(245,158,11,0.1)";
  const skillNeedBorder = safeT.skillNeedBorder ?? "rgba(245,158,11,0.25)";
  const skillNeedText   = safeT.skillNeedText   ?? "#f59e0b";

  return (
    <div className="op-container fade-up" style={{ maxWidth: 720, margin: "0 auto", fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .proj-card:hover { border-color:rgba(139,92,246,.3); cursor:pointer; }
        .proj-card { transition:border-color .15s ease; }
        .connect-btn:hover { filter:brightness(1.08); }
        .back-btn:hover { color:inherit !important; }
        .conn-card:hover { border-color:${border2} !important; }
        .conn-card { transition: border-color .15s ease; }

        @media (max-width: 640px) {
          .op-container { padding: 0 12px !important; }
          .card-flat { padding: 16px !important; border-radius: 12px !important; }

          .profile-header-row { flex-direction: column !important; gap: 14px !important; }
          .profile-avatar { width: 56px !important; height: 56px !important; font-size: 20px !important; border-radius: 12px !important; }
          .profile-name { font-size: 19px !important; }
          .profile-bio { max-width: 100% !important; }
          .profile-action-wrap { width: 100% !important; margin-top: 4px !important; flex-direction: column !important; }
          .profile-action-wrap button { width: 100% !important; padding: 10px 16px !important; }

          .stats-grid { padding-top: 16px !important; margin-top: 18px !important; }
          .stat-value { font-size: 16px !important; }
          .stat-label { font-size: 9.5px !important; }

          .skills-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
          .connections-grid { grid-template-columns: 1fr !important; }

          .tabs-row { gap: 2px !important; }
          .tabs-row button { padding: 7px 11px !important; font-size: 12px !important; }

          .week-streak-row { gap: 5px !important; height: 42px !important; }
          .heatmap-grid { gap: 3px !important; }
          .heatmap-cell { height: 12px !important; }

          .proj-card-header { gap: 6px !important; }
        }

        @media (max-width: 380px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; row-gap: 14px !important; }
          .stats-grid > div:nth-child(odd) { border-right: none !important; }
          .stats-grid > div:nth-child(1),
          .stats-grid > div:nth-child(2) { border-bottom: 1px solid ${border}; padding-bottom: 12px; }
        }
      `}</style>

      {typeof setDashPage === "function" && (
        <button
          className="back-btn"
          onClick={handleBack}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none", cursor: "pointer",
            color: text3, fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600,
            marginBottom: 14, padding: 0, transition: "color .15s",
          }}
        >
          <ArrowLeft style={iconSize(13,15)} /> Back to Discover
        </button>
      )}

      {error && (
        <div style={{
          padding:"10px 16px", borderRadius:10, marginBottom:14,
          background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)",
          fontSize:12, color:"#f87171", display:"flex", gap:8, alignItems:"center",
        }}>
          <AlertTriangle style={iconSize(13,15)} /> {error}
        </div>
      )}

      {msgError && (
        <div style={{
          padding:"10px 16px", borderRadius:10, marginBottom:14,
          background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)",
          fontSize:12, color:"#f87171", display:"flex", gap:8, alignItems:"center",
        }}>
          <AlertTriangle style={iconSize(13,15)} /> {msgError}
          <button onClick={() => setMsgError(null)} style={{
            marginLeft:"auto", fontSize:11, color:"#f87171",
            background:"transparent", border:"none", cursor:"pointer", fontFamily:"'Inter',sans-serif",
          }}>Dismiss</button>
        </div>
      )}

      <div className="card-flat" style={{ padding:24, marginBottom:16, position:"relative", overflow:"hidden" }}>
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          background: dark
            ? "linear-gradient(135deg,rgba(139,92,246,.06),transparent 60%)"
            : "linear-gradient(135deg,rgba(124,58,237,.04),transparent 60%)",
        }} />

        <div className="profile-header-row" style={{ display:"flex", gap:20, alignItems:"flex-start", position:"relative" }}>
          <div className="profile-avatar" style={{
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

          <div style={{ flex:1, minWidth:0, width:"100%" }}>
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
                  <div className="profile-name" style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:22, color:text, letterSpacing:"-0.4px" }}>
                    {profile?.name ?? "Unknown User"}
                  </div>
                  {matchScore != null && (
                    <span style={{
                      display:"inline-flex", alignItems:"center", gap:4,
                      padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:700,
                      background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.3)",
                      color:"#c4b5fd",
                    }}>
                      <Sparkles style={iconSize(11,13)} /> <span style={{ fontFamily:"'JetBrains Mono',monospace" }}>{matchScore}%</span> Match
                    </span>
                  )}
                </div>
                <div style={{ fontSize:12, color:text3, marginTop:3 }}>
                  {profile?.handle ? `@${profile.handle}` : ""}
                  {profile?.handle && profile?.role ? " · " : ""}
                  {profile?.role ?? ""}
                </div>
                <p className="profile-bio" style={{ fontSize:13, color:text2, marginTop:8, lineHeight:1.6, maxWidth:460 }}>
                  {profile?.bio ?? ""}
                </p>
                <div style={{ display:"flex", gap:7, marginTop:12, flexWrap:"wrap" }}>
                  {profile?.open_to_collaborate !== false && (
                    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600, background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.25)", color:"#4ade80" }}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background:"#4ade80", flexShrink:0 }} />
                      Open to Collaborate
                    </span>
                  )}
                  {profile?.skills_need?.[0] && (
                    <span style={{ padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600, background:"rgba(245,158,11,.1)", border:"1px solid rgba(245,158,11,.25)", color:"#f59e0b" }}>
                      Seeking {profile.skills_need[0]}
                    </span>
                  )}
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600, background:skillNeedBg, border:`1px solid ${skillNeedBorder}`, color:skillNeedText }}>
                    <MapPin style={iconSize(11,13)} /> {resolveLocation(profile?.locations)}
                  </span>
                </div>
              </>
            )}
          </div>

          {!loading && (
            <div className="profile-action-wrap" style={{ flexShrink:0, display:"flex", gap:8, flexWrap:"wrap" }}>
              {connectionStatus === "accepted" ? (
                <>
                  <button onClick={handleMessage} disabled={messaging} style={{
                    display:"inline-flex", alignItems:"center", gap:6,
                    background:"transparent", border:`1px solid ${border}`,
                    color:text2, padding:"7px 16px", borderRadius:8,
                    cursor: messaging ? "wait" : "pointer",
                    opacity: messaging ? 0.6 : 1,
                    fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:600,
                  }}>
                    <MessageSquare style={iconSize(13,15)} /> {messaging ? "Starting…" : "Message"}
                  </button>
                  <button onClick={handleBlock} disabled={blocking} style={{
                    display:"inline-flex", alignItems:"center", gap:6,
                    background:"transparent", border:"1px solid rgba(239,68,68,0.3)",
                    color:"#f87171", padding:"7px 16px", borderRadius:8,
                    cursor: blocking ? "wait" : "pointer",
                    opacity: blocking ? 0.6 : 1,
                    fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:600,
                  }}>
                    <Ban style={iconSize(13,15)} /> Block
                  </button>
                </>
              ) : connectionStatus === "blocked" ? (
                <button onClick={handleBlock} disabled={blocking} style={{
                  display:"inline-flex", alignItems:"center", gap:6,
                  background:"transparent", border:"1px solid rgba(239,68,68,0.3)",
                  color:"#f87171", padding:"7px 16px", borderRadius:8,
                  cursor: blocking ? "wait" : "pointer",
                  opacity: blocking ? 0.6 : 1,
                  fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:600,
                }}>
                  <Ban style={iconSize(13,15)} /> Unblock
                </button>
              ) : connectionStatus === "pending" ? (
                <button onClick={handleCancelRequest} disabled={connecting} style={{
                  display:"inline-flex", alignItems:"center", gap:6,
                  background:"transparent", border:`1px solid ${border}`,
                  color:text3, padding:"7px 16px", borderRadius:8,
                  cursor: connecting ? "wait" : "pointer",
                  fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:600,
                }}>
                  <Clock style={iconSize(13,15)} /> {connecting ? "Cancelling…" : "Pending"}
                </button>
              ) : (
                <button className="connect-btn" onClick={handleConnect} disabled={connecting} style={{
                  display:"inline-flex", alignItems:"center", gap:6,
                  background:"#7c3aed", border:"1px solid #7c3aed",
                  color:"#fff", padding:"7px 18px", borderRadius:8,
                  cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:700,
                  transition:"filter .15s",
                }}>
                  <Handshake style={iconSize(13,15)} /> {connecting ? "Sending…" : "Connect"}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", marginTop:22, paddingTop:18, borderTop:`1px solid ${border}` }}>
          {[
            { v: loading ? "—" : String(totalConnections), l:"Connections" },
            { v: loading ? "—" : String(projects.length),  l:"Projects" },
            { v: loading ? "—" : String(totalStars),        l:"Total Stars" },
            { v: loading ? "—" : String(mutuals.length),    l:"Mutual" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign:"center", borderRight: i < 3 ? `1px solid ${border}` : "none" }}>
              <div className="stat-value" style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:20, color:text }}>{s.v}</div>
              <div className="stat-label" style={{ fontSize:11, color:text3, marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="skills-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        <div className="card-flat" style={{ padding:16 }}>
          <Lbl T={safeT}>Skills They Have</Lbl>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:10 }}>
            {loading
              ? [80,60,70].map((w,i) => <Sk key={i} w={`${w}px`} h={24} r={6} />)
              : (Array.isArray(profile?.skills_have) ? profile.skills_have : []).map(s => (
                <span key={s} style={{ padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600, fontFamily:"'JetBrains Mono',monospace", background:skillHaveBg, border:`1px solid ${skillHaveBorder}`, color:skillHaveText }}>{s}</span>
              ))
            }
          </div>
        </div>
        <div className="card-flat" style={{ padding:16 }}>
          <Lbl T={safeT}>Skills They Need</Lbl>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:10 }}>
            {loading
              ? [65,75].map((w,i) => <Sk key={i} w={`${w}px`} h={24} r={6} />)
              : (Array.isArray(profile?.skills_need) ? profile.skills_need : []).map(s => (
                <span key={s} style={{ padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600, fontFamily:"'JetBrains Mono',monospace", background:skillNeedBg, border:`1px solid ${skillNeedBorder}`, color:skillNeedText }}>{s}</span>
              ))
            }
          </div>
        </div>
      </div>

      <div className="card-flat" style={{ padding:16, marginBottom:14 }}>
        <Lbl T={safeT}>Weekly Availability</Lbl>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
          {Object.entries(profile?.availability ?? {}).map(([day, on]) => (
            <div key={day} style={{
              padding:"6px 12px", borderRadius:8,
              border:`1px solid ${on ? "rgba(34,197,94,.35)" : border}`,
              background: on ? (dark ? "rgba(34,197,94,.1)" : "rgba(34,197,94,.08)") : "transparent",
              color: on ? "#4ade80" : text3,
              fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, textTransform:"capitalize",
            }}>
              {day.slice(0,3).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      <div className="card-flat" style={{ padding:16, marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <Lbl T={safeT}>This Week's Activity</Lbl>
          <span style={{ fontSize:11, color:text3, fontFamily:"'JetBrains Mono',monospace" }}>
            {loading ? "—" : `${weekStreak.filter(d => (d?.count ?? 0) > 0).length} / 7 active days`}
          </span>
        </div>
        <div className="week-streak-row" style={{ display:"flex", gap:8, alignItems:"flex-end", height:48 }}>
          {loading
            ? Array.from({ length:7 }).map((_,i) => (
                <div key={i} style={{ flex:1, borderRadius:6, background: dark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)", animation:"pulse 1.6s ease-in-out infinite", animationDelay:`${i*60}ms`, height:"100%" }} />
              ))
            : weekStreak.map((d, i) => (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, height:"100%" }}>
                  <div style={{ flex:1, width:"100%", background: dark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)", borderRadius:6, overflow:"hidden", display:"flex", alignItems:"flex-end" }}>
                    <div style={{
                      width:"100%",
                      height:`${[0,25,50,75,100][d?.count ?? 0] ?? 0}%`,
                      background: (d?.count ?? 0) === 0 ? "transparent" : "#7c3aed",
                      borderRadius:4,
                      transition:"height .5s cubic-bezier(.34,1.56,.64,1)",
                      transitionDelay:`${i*60}ms`,
                    }} />
                  </div>
                  <span style={{ fontSize:9, color:text3, fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>{d?.label ?? ""}</span>
                </div>
              ))
          }
        </div>
      </div>

      <div className="card-flat" style={{ padding:16, marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:8 }}>
          <Lbl T={safeT}>Activity streak (last 5 weeks)</Lbl>
          <div style={{ display:"flex", gap:14 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:18, color:"#a78bfa" }}>{loading ? "—" : currentStreak}</div>
              <div style={{ fontSize:10, color:text3 }}>day streak</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:18, color:text }}>{loading ? "—" : streak.filter(c => (c?.count ?? 0) > 0).length}</div>
              <div style={{ fontSize:10, color:text3 }}>active days</div>
            </div>
          </div>
        </div>
        <div className="heatmap-grid" style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:4 }}>
          {["M","T","W","T","F","S","S"].map((d,i) => (
            <div key={i} style={{ fontSize:9, color:text3, textAlign:"center", fontFamily:"'JetBrains Mono',monospace" }}>{d}</div>
          ))}
        </div>
        <div className="heatmap-grid" style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
          {loading
            ? Array.from({ length:35 }).map((_,i) => (
                <div key={i} className="heatmap-cell" style={{ height:14, borderRadius:3, background: dark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)", animation:"pulse 1.6s ease-in-out infinite", animationDelay:`${i*30}ms` }} />
              ))
            : streak.map((cell, i) => (
                <div key={i}
                  className="heatmap-cell"
                  title={`${cell?.count ?? 0} contribution${(cell?.count ?? 0) !== 1 ? "s" : ""}`}
                  style={{ height:14, borderRadius:3, background:heatColor(cell?.count ?? 0), cursor:"default" }}
                />
              ))
          }
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:10, justifyContent:"flex-end" }}>
          <span style={{ fontSize:10, color:text3, fontFamily:"'JetBrains Mono',monospace" }}>Less</span>
          {[0,1,2,3,4].map(c => (
            <div key={c} style={{ width:10, height:10, borderRadius:2, background:heatColor(c) }} />
          ))}
          <span style={{ fontSize:10, color:text3, fontFamily:"'JetBrains Mono',monospace" }}>More</span>
        </div>
      </div>

      <div className="card-flat" style={{ padding:20 }}>
        <div className="tabs-row" style={{ display:"flex", gap:4, marginBottom:18, borderBottom:`1px solid ${border}`, paddingBottom:12, overflowX:"auto" }}>
          {["projects","endorsements","activity","connections"].map(t => (
            <button key={t} onClick={() => setProfileTab(t)} style={{
              background: profileTab===t ? (dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)") : "none",
              border:"none", color: profileTab===t ? text : text3,
              cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:500,
              padding:"7px 15px", borderRadius:8, transition:"background .15s,color .15s",
              whiteSpace:"nowrap", textTransform:"capitalize", flexShrink:0,
            }}>
              {t}
              {t==="projects"     && !loading             && <span style={{ marginLeft:5, fontSize:10, opacity:.6, fontFamily:"'JetBrains Mono',monospace" }}>({projects.length})</span>}
              {t==="endorsements" && !endorsementsLoading  && <span style={{ marginLeft:5, fontSize:10, opacity:.6, fontFamily:"'JetBrains Mono',monospace" }}>({endorsements.length})</span>}
              {t==="connections"  && !loading             && <span style={{ marginLeft:5, fontSize:10, opacity:.6, fontFamily:"'JetBrains Mono',monospace" }}>({mutuals.length} mutual)</span>}
            </button>
          ))}
        </div>

        {profileTab === "projects" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {loading
              ? Array.from({ length:2 }).map((_,i) => (
                  <div key={i} style={{ padding:16, borderRadius:10, border:`1px solid ${border}`, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)" }}>
                    <Sk w="60%" h={16} mb={10} />
                    <Sk w="100%" h={12} mb={5} />
                    <Sk w="80%"  h={12} mb={12} />
                    <div style={{ display:"flex", gap:5 }}>
                      {[50,55,45].map((w,j) => <Sk key={j} w={`${w}px`} h={20} r={6} />)}
                    </div>
                  </div>
                ))
              : projects.length === 0
                ? (
                  <div style={{ textAlign:"center", padding:"32px 0", color:text3, fontSize:13 }}>
                    No public projects yet.
                  </div>
                )
                : projects.map((p,i) => (
                  <div key={p.id ?? i} className="proj-card" onClick={() => setOpenProjectId(p?.id)} style={{
                    padding:16,
                    background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)",
                    borderRadius:10, border:`1px solid ${border}`,
                  }}>
                    <div className="proj-card-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8, gap:8, flexWrap:"wrap" }}>
                      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                        <span style={{ fontSize:22 }}>{p.img}</span>
                        <div>
                          <div style={{ fontSize:14, fontWeight:700, color:text }}>{p.n}</div>
                          <div style={{ fontSize:11, color:text3, marginTop:1, wordBreak:"break-all" }}>
                            {p.url && p.url !== "#"
                              ? p.url.replace("https://","")
                              : `github.com/${profile?.handle}/${p.n.toLowerCase().replace(/ /g,"-")}`
                            }
                          </div>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0, flexWrap:"wrap" }}>
                        <span style={{
                          fontSize:10, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", padding:"2px 9px", borderRadius:6,
                          background: ["Live","Active"].includes(p.status) ? "rgba(34,197,94,.1)" : "rgba(245,158,11,.1)",
                          border:`1px solid ${["Live","Active"].includes(p.status) ? "rgba(34,197,94,.25)" : "rgba(245,158,11,.25)"}`,
                          color: ["Live","Active"].includes(p.status) ? "#4ade80" : "#fbbf24",
                        }}>{p.status}</span>
                        <span style={{ display:"inline-flex", alignItems:"center", gap:3, fontSize:11, color:text3 }}>
                          <Star style={iconSize(10,12)} /> <span style={{ fontFamily:"'JetBrains Mono',monospace" }}>{p.stars}</span>
                        </span>
                        <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, color:"#a78bfa", fontWeight:600 }}>
                          View <ArrowRight style={iconSize(10,12)} />
                        </span>
                      </div>
                    </div>
                    {p.d && <p style={{ fontSize:12, color:text2, lineHeight:1.55, marginBottom:10 }}>{p.d}</p>}
                    {p.tags.length > 0 && (
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                        {p.tags.map(tag => (
                          <span key={tag} style={{ padding:"2px 9px", borderRadius:6, fontSize:10, fontWeight:600, fontFamily:"'JetBrains Mono',monospace", background: dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)", color:text2 }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
            }
          </div>
        )}

        {profileTab === "endorsements" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {endorsementsLoading ? (
              Array.from({ length:2 }).map((_,i) => (
                <div key={i} style={{ padding:16, borderRadius:10, border:`1px solid ${border}`, display:"flex", gap:14 }}>
                  <Sk w="38px" h={38} r={8} />
                  <div style={{ flex:1 }}>
                    <Sk w="50%" h={13} mb={8} />
                    <Sk w="100%" h={12} mb={4} />
                    <Sk w="80%"  h={12} />
                  </div>
                </div>
              ))
            ) : endorsementsError ? (
              <div style={{
                display:"flex", alignItems:"center", gap:8, padding:"10px 16px", borderRadius:10,
                background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)",
                fontSize:12, color:"#f87171",
              }}>
                <AlertTriangle style={iconSize(13,15)} /> {endorsementsError}
                <button onClick={retryEndorsements} style={{
                  marginLeft:"auto", fontSize:11, color:"#f87171",
                  background:"transparent", border:"none", cursor:"pointer", fontFamily:"'Inter',sans-serif",
                }}>Retry</button>
              </div>
            ) : endorsements.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:text3, fontSize:13 }}>
                No endorsements yet.
              </div>
            ) : (
              endorsements.map((e, i) => {
                const label = skillLabel(e?.skill ?? e?.skill_name ?? e?.skillName);
                return (
                  <div key={e?.id ?? i} style={{ padding:16, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)", borderRadius:10, border:`1px solid ${border}`, display:"flex", gap:14, alignItems:"flex-start" }}>
                    <div style={{ width:38, height:38, borderRadius:8, flexShrink:0, background: dark ? "rgba(124,58,237,.15)" : "rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, color:"#a78bfa", fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>
                      {(label || "?")[0]}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6, flexWrap:"wrap" }}>
                        <span style={{ fontSize:11, color:text3 }}>endorsed for</span>
                        <span style={{ fontSize:11, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", padding:"2px 9px", borderRadius:6, background:skillHaveBg, border:`1px solid ${skillHaveBorder}`, color:skillHaveText }}>{label}</span>
                      </div>
                      {e?.note && (
                        <p style={{ fontSize:12, color:text2, fontStyle:"italic", lineHeight:1.55 }}>"{e.note}"</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

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
              : (Array.isArray(profile?.activity_feed) ? profile.activity_feed : []).length === 0
                ? <div style={{ textAlign:"center", padding:"20px", color:text3, fontSize:12 }}>No recent activity.</div>
                : (profile?.activity_feed ?? []).map((a, i) => {
                    const hue = Number(a?.hue) || 259;
                    const bgAlpha = dark ? 0.1 : 0.08;
                    return (
                      <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 13px", borderRadius:8, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)" }}>
                        <div style={{ width:32, height:32, borderRadius:8, flexShrink:0, background:`hsla(${hue},70%,60%,${bgAlpha})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:hsl(hue) }}>
                          {a?.icon ?? ""}
                        </div>
                        <span style={{ fontSize:12, color:text2, flex:1, minWidth:0 }}>
                          {a?.a ?? ""}{" "}
                          <span style={{ color:text, fontWeight:600 }}>{a?.t ?? ""}</span>
                        </span>
                        <span style={{ fontSize:10, color:text3, fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>{a?.time ?? ""}</span>
                      </div>
                    );
                  })
            }
          </div>
        )}

        {profileTab === "connections" && (
          <div className="connections-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {loading
              ? Array.from({ length:4 }).map((_,i) => (
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 14px", borderRadius:10, border:`1px solid ${border}`, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)" }}>
                    <Sk w="36px" h={36} r={10} />
                    <div style={{ flex:1 }}><Sk w="70%" h={13} mb={6} /><Sk w="50%" h={11} /></div>
                  </div>
                ))
              : mutuals.length === 0
                ? <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"32px 0", color:text3, fontSize:13 }}>No mutual connections.</div>
                : mutuals.map((m, i) => {
                    const idStr  = String(m?.id ?? i);
                    const hue    = idStr.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
                    const lightL = dark ? 72 : 44;
                    return (
                      <div key={m?.id ?? i} className="conn-card" style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 14px", borderRadius:10, border:`1px solid ${border}`, background: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)" }}>
                        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:`hsla(${hue},65%,60%,${dark ? 0.15 : 0.1})`, border:`1px solid hsla(${hue},65%,60%,.3)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:`hsl(${hue},55%,${lightL}%)`, fontFamily:"'JetBrains Mono',monospace" }}>
                          {nameInitials(m?.name ?? "")}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m?.name ?? "Unknown"}</div>
                          <div style={{ fontSize:10, fontWeight:600, marginTop:2, color:text3 }}>Mutual connection</div>
                        </div>
                        {m?.id != null && (
                          <button
                            onClick={() => handleViewMutual(m.id)}
                            style={{
                              padding:"5px 10px", background:"transparent",
                              border:`1px solid ${border}`, color:text2,
                              borderRadius:6, cursor:"pointer",
                              fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600, flexShrink:0,
                            }}>
                            View
                          </button>
                        )}
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