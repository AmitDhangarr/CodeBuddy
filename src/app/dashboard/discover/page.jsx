"use client";
import { useState, useCallback, useEffect } from "react";
import {
  SKILLS_ALL,
  hsl, hsla,
  Avatar, Lbl,
} from "../shared";

function normalizeProfile(profile) {
  let location = "";
  if (Array.isArray(profile.locations) && profile.locations.length > 0) {
    const loc = profile.locations[0];
    const parts = [loc.city, loc.state, loc.country].filter(Boolean);
    location = parts.join(", ");
  } else if (profile.locations?.city) {
    const parts = [profile.locations.city, profile.locations.state, profile.locations.country].filter(Boolean);
    location = parts.join(", ");
  } else if (profile.location) {
    location = profile.location;
  } else if (profile.city) {
    location = [profile.city, profile.state].filter(Boolean).join(", ");
  }

  const avatar = profile.avatar
    ? profile.avatar
    : (profile.name || "")
      .split(" ")
      .map(w => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return {
    ...profile,
    avatar,
    skillsHave: Array.isArray(profile.skills_have) ? profile.skills_have : [],
    skillsNeed: Array.isArray(profile.skills_need) ? profile.skills_need : [],
    lookingFor: profile.looking_for ?? profile.lookingFor ?? null,
    location,
    projects: Array.isArray(profile.projects) ? profile.projects.length : (profile.projects ?? 0),
    hue: profile.hue ?? ((profile.name?.charCodeAt(0) ?? 0) * 37) % 360,
    online: profile.online ?? false,
    followers: profile.followers ?? 0,
    connectionStatus: profile.isConnected ? "accepted" : null,
    isFavourited: profile.isFavourited ?? false,
  };
}

export default function DiscoverTab({
  T, dark,
  currentUser,
  connected, onSeedConnected,
  liked, setLiked, onSeedLiked,
  onMessage,
}) {
  const [filterSkill, setFilterSkill] = useState("All");
  const [filterLooking, setFilterLooking] = useState("All");
  const [filterOnline, setFilterOnline] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [aiLoading, setAiLoading] = useState(null);
  const [aiText, setAiText] = useState({});
  const [quickView, setQuickView] = useState(null);
  const [view, setView] = useState("grid");
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    async function fetchProfiles() {
      try {
        setLoading(true);
        setFetchError(null);
        const res = await fetch("/api/profiles");
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const json = await res.json();
        if (json.error) throw new Error(json.error);

        const normalized = json.profiles.map(normalizeProfile);
        setProfiles(normalized);

        const initialConnected = {};
        const initialLiked = {};
        json.profiles.forEach((p) => {
          if (p.isConnected) initialConnected[p.id] = true;
          if (p.isFavourited) initialLiked[p.id] = true;
        });
        onSeedConnected?.(initialConnected);
        onSeedLiked?.(initialLiked);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, []);

  const handleConnect = async (user) => {
    const prev = user.connectionStatus;
    setProfiles(p => p.map(x => x.id === user.id ? { ...x, connectionStatus: prev ? null : "pending" } : x));

    try {
      const res = await fetch("/api/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: user.id }),
      });
      const json = await res.json();
      setProfiles(p => p.map(x => x.id === user.id ? { ...x, connectionStatus: json.action === "added" ? "pending" : null } : x));
    } catch {
      setProfiles(p => p.map(x => x.id === user.id ? { ...x, connectionStatus: prev } : x));
    }
  };

  const handleFavourite = async (user) => {
    const wasFav = user.isFavourited;
    setProfiles(p => p.map(x => x.id === user.id ? { ...x, isFavourited: !wasFav } : x));
    setLiked(p => ({ ...p, [user.id]: !wasFav }));

    try {
      const res = await fetch("/api/favourites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: user.id }),
      });
      const json = await res.json();
      const newFav = json.action === "added";
      setProfiles(p => p.map(x => x.id === user.id ? { ...x, isFavourited: newFav } : x));
      setLiked(p => ({ ...p, [user.id]: newFav }));
    } catch {
      setProfiles(p => p.map(x => x.id === user.id ? { ...x, isFavourited: wasFav } : x));
      setLiked(p => ({ ...p, [user.id]: wasFav }));
    }
  };

  const rankedUsers = profiles
    .map(u => ({ ...u, matchScore: u.matchScore ?? 0 }))
    .sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore;
      if (sortBy === "followers") return b.followers - a.followers;
      if (sortBy === "projects") return b.projects - a.projects;
      if (sortBy === "online") return (b.online ? 1 : 0) - (a.online ? 1 : 0);
      return 0;
    });

  const filtered = rankedUsers.filter(u => {
    if (filterOnline && !u.online) return false;
    const sk = filterSkill === "All" || u.skillsHave.includes(filterSkill) || u.skillsNeed.includes(filterSkill);
    const lk = filterLooking === "All" || u.lookingFor === filterLooking;
    const sq = !searchQ
      || u.name.toLowerCase().includes(searchQ.toLowerCase())
      || u.role.toLowerCase().includes(searchQ.toLowerCase())
      || u.skillsHave.some(s => s.toLowerCase().includes(searchQ.toLowerCase()));
    return sk && lk && sq;
  });

  const scoreColor = (score) => {
    if (score >= 80) return "#4ade80";
    if (score >= 60) return "#a78bfa";
    if (score >= 40) return "#f59e0b";
    return hsl(0, 60, 60);
  };

  const btn = {
    border: "none", cursor: "pointer",
    fontFamily: "'Instrument Sans',sans-serif",
    transition: "all 0.2s",
  };

  const handleAIAPI = async (prompt) => {
    const res = await fetch("/api/ai_insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    return data;
  };

  const handleAI = useCallback(async (user) => {
    if (aiLoading === user.id) return;
    setAiLoading(user.id);

    try {
      const data = await handleAIAPI(
        `Give a very short match insight for two builders.
        Me: skills=${currentUser?.skillsHave?.join(", ")}, needs=${currentUser?.skillsNeed?.join(", ")}.
        Them: name=${user.name}, skills=${user.skillsHave?.join(", ")}, needs=${user.skillsNeed?.join(", ")}, projects=${user.projects}, looking for=${user.lookingFor}.`
      );
      setAiText(p => ({ ...p, [user.id]: data.response }));
    } catch {
      setAiText(p => ({ ...p, [user.id]: "Could not load insight." }));
    } finally {
      setAiLoading(null);
    }
  }, [currentUser, aiLoading]);

  return (
    <div className="fade-up">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, gap: 14, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#7c3aed", marginBottom: 6 }}>
            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", marginRight: 7, verticalAlign: "middle" }} />
            Live Matching
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, color: T.text, letterSpacing: "-0.8px", lineHeight: 1.1 }}>Discover Builders</h1>
          <p style={{ fontSize: 13, color: T.text3, marginTop: 4 }}>{filtered.length} builders ranked by your match score</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["grid", "list"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ ...btn, padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, background: view === v ? dark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.1)" : "transparent", border: `1px solid ${view === v ? "rgba(124,58,237,0.4)" : T.border}`, color: view === v ? "#a78bfa" : T.text3 }}>
              {v === "grid" ? "⊞ Grid" : "≡ List"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 180px", minWidth: 140 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.text3, fontSize: 14, pointerEvents: "none" }}>🔍</span>
          <input placeholder="Search name, role, skill…" value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text, borderRadius: 11, fontSize: 13, outline: "none", padding: "9px 14px 9px 32px", width: "100%", fontFamily: "inherit" }} />
        </div>
        <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)} style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text2, padding: "8px 12px", borderRadius: 10, fontSize: 12, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
          <option value="All">All Skills</option>
          {SKILLS_ALL.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterLooking} onChange={e => setFilterLooking(e.target.value)} style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text2, padding: "8px 12px", borderRadius: 10, fontSize: 12, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
          <option value="All">All Roles</option>
          <option>Collaborator</option><option>Mentor</option><option>Mentee</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text2, padding: "8px 12px", borderRadius: 10, fontSize: 12, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
          <option value="match">Sort: Match %</option>
          <option value="followers">Sort: Followers</option>
          <option value="projects">Sort: Projects</option>
          <option value="online">Sort: Online First</option>
        </select>
        <button onClick={() => setFilterOnline(p => !p)} style={{ ...btn, padding: "7px 13px", borderRadius: 10, fontSize: 12, fontWeight: 600, background: filterOnline ? dark ? "rgba(34,197,94,0.12)" : "rgba(34,197,94,0.08)" : "transparent", border: `1px solid ${filterOnline ? "rgba(34,197,94,0.35)" : T.border}`, color: filterOnline ? "#4ade80" : T.text3 }}>
          ● Online only
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { v: String(filtered.length), l: "Showing" },
          { v: String(profiles.length), l: "Total builders" },
          { v: String(profiles.filter(u => u.online).length), l: "Active now" },
          { v: `${Math.round(filtered.reduce((a, u) => a + u.matchScore, 0) / Math.max(filtered.length, 1))}%`, l: "Avg match" },
        ].map((s, i) => (
          <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 18px", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, color: T.text }}>{s.v}</span>
            <span style={{ fontSize: 11, color: T.text3 }}>{s.l}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T.text3 }}>
          <div style={{ fontSize: 28, marginBottom: 14, animation: "spin 1s linear infinite", display: "inline-block" }}>✦</div>
          <div style={{ fontSize: 14, color: T.text2 }}>Finding your best matches…</div>
        </div>
      ) : fetchError ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T.text3 }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>⚠️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#f87171", marginBottom: 6 }}>Failed to load profiles</div>
          <div style={{ fontSize: 13 }}>{fetchError}</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T.text3 }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🔍</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.text2, marginBottom: 6 }}>No builders found</div>
          <div style={{ fontSize: 13 }}>Try adjusting your filters</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: view === "list" ? "1fr" : "repeat(auto-fill,minmax(300px,1fr))", gap: view === "list" ? 10 : 16, alignItems: "start" }}>
          {filtered.map((u, i) => (
            view === "list"
              ? <ListCard key={u.id} u={u} i={i} T={T} dark={dark} onConnect={handleConnect} liked={liked} setLiked={setLiked} aiText={aiText} aiLoading={aiLoading} handleAI={handleAI} onMessage={onMessage} scoreColor={scoreColor} setQuickView={setQuickView} setProfiles={setProfiles} />
              : <GridCard key={u.id} u={u} i={i} T={T} dark={dark} onConnect={handleConnect} liked={liked} setLiked={setLiked} aiText={aiText} aiLoading={aiLoading} handleAI={handleAI} onMessage={onMessage} scoreColor={scoreColor} setQuickView={setQuickView} onFavourite={handleFavourite} setProfiles={setProfiles} />
          ))}
        </div>
      )}

      {quickView && (
        <div onClick={() => setQuickView(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: dark ? "#0e0e18" : "#fff", border: `1px solid ${T.border}`, borderRadius: 22, padding: 28, width: "100%", maxWidth: 460, maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18 }}>
              <Avatar u={quickView} size={60} radius={16} T={T} dark={dark} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: "'Instrument Serif',serif" }}>{quickView.name}</div>
                <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>@{quickView.handle} · {quickView.role}</div>
                <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>📍 {quickView.location || "Location not set"}</div>
                <div style={{ fontSize: 11, color: "#22c55e", marginTop: 4 }}>{quickView.online ? "● Online now" : "● Away"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 30, color: scoreColor(quickView.matchScore), lineHeight: 1 }}>{quickView.matchScore}%</div>
                <div style={{ fontSize: 10, color: T.text3 }}>match</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.65, marginBottom: 16 }}>{quickView.bio}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 12, padding: 12 }}>
                <Lbl T={T}>Skills</Lbl>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {quickView.skillsHave.map(s => <span key={s} style={{ padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }}>{s}</span>)}
                </div>
              </div>
              <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 12, padding: 12 }}>
                <Lbl T={T}>Needs</Lbl>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {quickView.skillsNeed.map(s => <span key={s} style={{ padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText }}>{s}</span>)}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 18, marginBottom: 16, padding: "12px 0", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
              {[{ v: quickView.projects, l: "Projects" }, { v: quickView.followers, l: "Followers" }, { v: quickView.matchScore + "%", l: "Match" }].map((s, i) => (
                <div key={i} style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: T.text }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { handleConnect(quickView); setQuickView(null); }}
                style={{
                  ...btn, flex: 1, padding: "11px", borderRadius: 11, fontSize: 13, fontWeight: 700,
                  background: quickView.connectionStatus === "accepted" ? "transparent" : quickView.connectionStatus === "pending" ? "transparent" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                  border: quickView.connectionStatus === "accepted" ? "1px solid rgba(74,222,128,0.3)" : quickView.connectionStatus === "pending" ? "1px solid rgba(245,158,11,0.3)" : "none",
                  color: quickView.connectionStatus === "accepted" ? "#4ade80" : quickView.connectionStatus === "pending" ? "#f59e0b" : "white",
                  boxShadow: quickView.connectionStatus ? "none" : "0 6px 20px rgba(124,58,237,0.3)",
                  cursor: "pointer",
                }}
              >
                {quickView.connectionStatus === "accepted" ? "✓ Connected" : quickView.connectionStatus === "pending" ? "⏳ Pending" : "Connect →"}
              </button>
              <button onClick={() => { onMessage(quickView); setQuickView(null); }} style={{ ...btn, padding: "11px 18px", borderRadius: 11, background: "transparent", border: `1px solid ${T.border}`, color: T.text2, fontSize: 13, fontWeight: 600 }}>💬 Message</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GridCard({ u, i, T, dark, onConnect, liked, setLiked, aiText, aiLoading, handleAI, onMessage, scoreColor, setQuickView, onFavourite, setProfiles }) {
  const isConnected = u.connectionStatus === "accepted";
  const isPending = u.connectionStatus === "pending";
  const isFav = u.isFavourited;

  return (
    <div className="card fade-up" style={{ padding: 20, position: "relative", overflow: "hidden", animationDelay: `${i * 0.06}s`, cursor: "default", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle,${hsla(u.hue, 70, 60, dark ? 0.08 : 0.05)} 0%,transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ position: "relative" }}>
          <Avatar u={u} size={48} radius={13} T={T} dark={dark} />
          <div style={{ position: "absolute", bottom: -1, right: -1, width: 8, height: 8, borderRadius: "50%", background: u.online ? "#22c55e" : "#555570", border: `2px solid ${dark ? "#060608" : "#f5f5f9"}` }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{u.name}</div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>@{u.handle}</div>
          <div style={{ fontSize: 11, color: hsl(u.hue), fontWeight: 500, marginTop: 2 }}>{u.role}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: scoreColor(u.matchScore), lineHeight: 1 }}>{u.matchScore}%</div>
          <div style={{ fontSize: 9, color: T.text3, marginTop: 1 }}>match</div>
        </div>
      </div>
      <div style={{ height: 3, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)", borderRadius: 99, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ height: "100%", width: `${u.matchScore}%`, background: `linear-gradient(90deg,hsl(${u.hue},70%,45%),hsl(${u.hue},80%,65%))`, borderRadius: 99, transition: "width 1s" }} />
      </div>
      <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>{u.bio}</p>
      <div style={{ marginBottom: 8 }}>
        <Lbl T={T}>Has</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {u.skillsHave.map(s => <span key={s} style={{ padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }}>{s}</span>)}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <Lbl T={T}>Needs</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {u.skillsNeed.map(s => <span key={s} style={{ padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText }}>{s}</span>)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: T.text3 }}>📍 {u.location || "Location not set"}</span>
        <span style={{ fontSize: 11, color: T.text3 }}>📁 {u.projects} projects</span>
        <span style={{ fontSize: 11, color: T.text3 }}>★ {u.followers}</span>
      </div>
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: hsla(u.hue, 70, 60, dark ? 0.12 : 0.08), border: `1px solid ${hsla(u.hue, 70, 60, 0.25)}`, color: hsl(u.hue) }}>Seeking {u.lookingFor}</span>
      </div>
      {aiText[u.id] && (
        <div className="fade-in" style={{ background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 12, padding: "11px 13px", marginBottom: 12, maxHeight: 80, overflow: "hidden" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", marginBottom: 5 }}>✦ AI MATCH INSIGHT</div>
          <p style={{ fontSize: 11, color: dark ? "#b0a8d8" : "#6b5b9e", lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{aiText[u.id]}</p>
        </div>
      )}
      <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
        {isConnected ? (
          <button onClick={() => onConnect(u)} style={{ flex: 1, padding: "8px", background: "transparent", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", borderRadius: 11, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>✓ Connected</button>
        ) : isPending ? (
          <button onClick={() => onConnect(u)} style={{ flex: 1, padding: "8px", background: "transparent", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", borderRadius: 11, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>⏳ Pending</button>
        ) : (
          <button onClick={() => onConnect(u)} style={{ flex: 1, padding: "8px", background: "linear-gradient(135deg,#7c3aed,#a855f7)", border: "none", color: "white", borderRadius: 11, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, transition: "all 0.2s", boxShadow: "0 4px 14px rgba(124,58,237,0.28)" }}>Connect</button>
        )}
        <button onClick={() => onFavourite(u)} style={{ padding: "8px 10px", background: "transparent", border: `1px solid ${isFav ? "rgba(248,113,113,0.3)" : T.border}`, color: isFav ? "#f87171" : T.text3, borderRadius: 10, cursor: "pointer", fontSize: 14, transition: "all 0.2s" }}>
          {isFav ? "♥" : "♡"}
        </button>
        <button onClick={() => handleAI(u)} style={{ padding: "8px 10px", background: aiText[u.id] ? dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.08)" : "transparent", border: `1px solid ${aiText[u.id] ? "rgba(124,58,237,0.3)" : T.border}`, color: aiText[u.id] ? "#a78bfa" : T.text3, borderRadius: 10, cursor: "pointer", fontSize: 13, transition: "all 0.2s" }}>
          {aiLoading === u.id ? <span style={{ display: "inline-block", animation: "spin 0.9s linear infinite" }}>✦</span> : "✦"}
        </button>
        <button onClick={() => onMessage(u)} style={{ padding: "8px 10px", background: "transparent", border: `1px solid ${T.border}`, color: T.text3, borderRadius: 10, cursor: "pointer", fontSize: 13, transition: "all 0.2s" }}>💬</button>
        <button onClick={() => setQuickView(u)} style={{ padding: "8px 10px", background: "transparent", border: `1px solid ${T.border}`, color: T.text3, borderRadius: 10, cursor: "pointer", fontSize: 13, transition: "all 0.2s" }}>↗</button>
      </div>
    </div>
  );
}

function ListCard({ u, i, T, dark, onConnect, liked, setLiked, aiText, aiLoading, handleAI, onMessage, scoreColor, setQuickView, setProfiles }) {
  const isConnected = u.connectionStatus === "accepted";
  const isPending = u.connectionStatus === "pending";

  return (
    <div className="card fade-up" style={{ padding: "14px 18px", display: "flex", gap: 14, alignItems: "center", animationDelay: `${i * 0.04}s` }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar u={u} size={42} radius={11} T={T} dark={dark} />
        <div style={{ position: "absolute", bottom: -1, right: -1, width: 7, height: 7, borderRadius: "50%", background: u.online ? "#22c55e" : "#555570", border: `2px solid ${dark ? "#060608" : "#f5f5f9"}` }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{u.name}</span>
          <span style={{ fontSize: 11, color: hsl(u.hue), fontWeight: 600 }}>{u.role}</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: hsla(u.hue, 70, 60, dark ? 0.1 : 0.07), border: `1px solid ${hsla(u.hue, 70, 60, 0.22)}`, color: hsl(u.hue) }}>{u.lookingFor}</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {u.skillsHave.slice(0, 3).map(s => <span key={s} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }}>{s}</span>)}
          {u.skillsNeed.slice(0, 2).map(s => <span key={s} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText }}>{s}</span>)}
        </div>
        <div style={{ marginTop: 4 }}>
          <span style={{ fontSize: 11, color: T.text3 }}>📍 {u.location || "Location not set"}</span>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: scoreColor(u.matchScore), lineHeight: 1 }}>{u.matchScore}%</div>
        <div style={{ fontSize: 10, color: T.text3 }}>match</div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {isConnected ? (
          <button onClick={() => onConnect(u)} style={{ padding: "6px 14px", background: "transparent", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700 }}>✓</button>
        ) : isPending ? (
          <button onClick={() => onConnect(u)} style={{ padding: "6px 14px", background: "transparent", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700 }}>⏳</button>
        ) : (
          <button onClick={() => onConnect(u)} style={{ padding: "6px 14px", background: "linear-gradient(135deg,#7c3aed,#a855f7)", border: "none", color: "white", borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700 }}>Connect</button>
        )}
        <button onClick={() => onMessage(u)} style={{ padding: "6px 10px", background: "transparent", border: `1px solid ${T.border}`, color: T.text3, borderRadius: 9, cursor: "pointer", fontSize: 12 }}>💬</button>
        <button onClick={() => setQuickView(u)} style={{ padding: "6px 10px", background: "transparent", border: `1px solid ${T.border}`, color: T.text3, borderRadius: 9, cursor: "pointer", fontSize: 12 }}>↗</button>
      </div>
    </div>
  );
}