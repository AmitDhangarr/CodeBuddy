"use client";
import { useState } from "react";
import { MOCK_USERS, hsl, hsla, calculateMatchScore, Avatar, Lbl } from "../shared";

const PROJECTS = [
  { n: "AI Project Management Tool", d: "Real-time PM with AI task generation, Supabase backend, and Kanban. Used by 200+ teams.", tags: ["Next.js", "Supabase", "AI"], stars: 24, forks: 8, status: "Live", url: "#", img: "🗂" },
  { n: "Developer Portfolio OS", d: "Interactive portfolio with Claude API chatbot, MDX blog, GitHub stats.", tags: ["Next.js", "Claude API", "MDX"], stars: 41, forks: 12, status: "Live", url: "#", img: "🎨" },
  { n: "SkillMatch Network", d: "AI-powered developer matching platform.", tags: ["React", "TypeScript", "Gemini"], stars: 8, forks: 2, status: "Building", url: "#", img: "🤝" },
];

const ENDORSEMENTS = [
  { from: MOCK_USERS[1], skill: "React", note: "One of the cleanest React codebases I've worked with." },
  { from: MOCK_USERS[0], skill: "TypeScript", note: "Incredibly thorough with types. Made our codebase bulletproof." },
];

const ACTIVITY = [
  { a: "Connected with", t: "Rohan Mehra", time: "2h ago", hue: 340, icon: "🤝" },
  { a: "New 89% match —", t: "Sara Chen", time: "5h ago", hue: 271, icon: "✦" },
  { a: "Sent request to", t: "Priya Nair", time: "1d ago", hue: 158, icon: "📨" },
  { a: "Updated skills:", t: "Added TypeScript", time: "2d ago", hue: 259, icon: "⚡" },
  { a: "Viewed by", t: "Dev Kapoor", time: "3d ago", hue: 38, icon: "👁" },
  { a: "Project starred by", t: "Aanya Sharma", time: "5d ago", hue: 259, icon: "★" },
];

export default function ProfileTab({
  T, dark,
  currentUser, setCurrentUser,
  setDashPage,
  convos, setActiveConvo,
}) {
  const [profileTab, setProfileTab] = useState("projects");
  const [availability, setAvailability] = useState({ mon: true, tue: true, wed: false, thu: true, fri: false, sat: false, sun: false });

  const connections = MOCK_USERS.slice(0, 4);
  const avgMatch = Math.round(connections.reduce((a, u) => a + calculateMatchScore(currentUser, u), 0) / connections.length);

  const heatmap = Array.from({ length: 35 }, (_, i) => ({ day: i, count: Math.floor(Math.random() * 5) }));
  const heatColor = (c) => {
    if (c === 0) return dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    if (c === 1) return dark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.1)";
    if (c === 2) return dark ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.2)";
    if (c === 3) return dark ? "rgba(124,58,237,0.5)" : "rgba(124,58,237,0.35)";
    return dark ? "rgba(124,58,237,0.75)" : "rgba(124,58,237,0.6)";
  };

  return (
    <div className="fade-up" style={{ maxWidth: 720, margin: "0 auto" }}>

      {/* ── Profile Card ── */}
      <div className="card-flat" style={{ padding: 24, marginBottom: 16, position: "relative", overflow: "hidden" }}>
        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: dark ? "linear-gradient(135deg,rgba(124,58,237,0.07),transparent 60%)" : "linear-gradient(135deg,rgba(124,58,237,0.04),transparent 60%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", position: "relative" }}>
          {/* Avatar */}
          <div style={{ width: 70, height: 70, borderRadius: 20, background: "linear-gradient(135deg,rgba(124,58,237,0.25),rgba(168,85,247,0.12))", border: "2px solid rgba(124,58,237,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#c4b5fd", flexShrink: 0, fontFamily: "'Instrument Serif',serif", boxShadow: "0 8px 24px rgba(124,58,237,0.18)" }}>
            {currentUser.name[0]}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: T.text, letterSpacing: "-0.5px" }}>{currentUser.name}</div>
            <div style={{ fontSize: 12, color: T.text3, marginTop: 3 }}>@{currentUser.handle} · {currentUser.role}</div>
            <p style={{ fontSize: 13, color: T.text2, marginTop: 8, lineHeight: 1.6, maxWidth: 460 }}>{currentUser.bio}</p>

            <div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}>● Open to Collaborate</span>
              <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b" }}>Seeking {currentUser?.skillsNeed[0]}</span>
              <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText }}>📍 {currentUser.location}</span>
            </div>
          </div>

          <button onClick={() => setDashPage("settings")} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.text2, padding: "7px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, flexShrink: 0, transition: "all 0.2s" }}>Edit →</button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", marginTop: 22, paddingTop: 18, borderTop: `1px solid ${T.border}` }}>
          {[
            { v: "12", l: "Connections" },
            { v: String(currentUser.projects), l: "Projects" },
            { v: avgMatch + "%", l: "Avg Match" },
            { v: "248", l: "Profile Views" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", borderRight: i < 3 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: T.text }}>{s.v}</div>
              <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Skills row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div className="card-flat" style={{ padding: 16 }}>
          <Lbl T={T}>Skills I Have</Lbl>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {currentUser.skillsHave.map(s => <span key={s} style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }}>{s}</span>)}
          </div>
        </div>
        <div className="card-flat" style={{ padding: 16 }}>
          <Lbl T={T}>Skills I Need</Lbl>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {currentUser?.skillsNeed.map(s => <span key={s} style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText }}>{s}</span>)}
          </div>
        </div>
      </div>

      {/* ── Availability widget ── */}
      <div className="card-flat" style={{ padding: 16, marginBottom: 14 }}>
        <Lbl T={T}>Weekly Availability</Lbl>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.entries(availability).map(([day, on]) => (
            <button key={day} onClick={() => setAvailability(p => ({ ...p, [day]: !p[day] }))} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${on ? "rgba(34,197,94,0.35)" : T.border}`, background: on ? dark ? "rgba(34,197,94,0.1)" : "rgba(34,197,94,0.08)" : "transparent", color: on ? "#4ade80" : T.text3, cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, transition: "all 0.2s", textTransform: "capitalize" }}>
              {day.slice(0, 3).toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: T.text3, marginTop: 10 }}>
          Available {Object.values(availability).filter(Boolean).length} days/week
        </div>
      </div>

      {/* ── Activity heatmap ── */}
      <div className="card-flat" style={{ padding: 16, marginBottom: 14 }}>
        <Lbl T={T}>Activity (last 5 weeks)</Lbl>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} style={{ fontSize: 9, color: T.text3, textAlign: "center", marginBottom: 2 }}>{d}</div>
          ))}
          {heatmap.map((cell, i) => (
            <div key={i} title={`${cell.count} contributions`} style={{ height: 14, borderRadius: 3, background: heatColor(cell.count), transition: "transform 0.1s", cursor: "default" }} />
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="card-flat" style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 18, borderBottom: `1px solid ${T.border}`, paddingBottom: 12, overflowX: "auto" }}>
          {["projects", "endorsements", "activity", "connections"].map(t => (
            <button key={t} onClick={() => setProfileTab(t)} style={{ background: profileTab === t ? dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" : "none", border: "none", color: profileTab === t ? T.text : T.text3, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, padding: "7px 15px", borderRadius: 8, transition: "all 0.2s", whiteSpace: "nowrap", textTransform: "capitalize" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Projects */}
        {profileTab === "projects" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PROJECTS.map((p, i) => (
              <div key={i} style={{ padding: 16, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: 13, border: `1px solid ${T.border}`, transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 22 }}>{p.img}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{p.n}</div>
                      <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>github.com/{currentUser.handle}/{p.n.toLowerCase().replace(/ /g, "-")}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: p.status === "Live" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${p.status === "Live" ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)"}`, color: p.status === "Live" ? "#4ade80" : "#fbbf24" }}>{p.status}</span>
                    <span style={{ fontSize: 11, color: T.text3 }}>★ {p.stars}</span>
                    <span style={{ fontSize: 11, color: T.text3 }}>⑂ {p.forks}</span>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 10 }}>{p.d}</p>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {p.tags.map(t => <span key={t} style={{ padding: "2px 9px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: T.text2 }}>{t}</span>)}
                </div>
              </div>
            ))}
            <button style={{ padding: "12px", background: "transparent", border: `2px dashed ${T.border}`, color: T.text3, borderRadius: 13, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}>+ Add project</button>
          </div>
        )}

        {/* Endorsements */}
        {profileTab === "endorsements" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ENDORSEMENTS.map((e, i) => (
              <div key={i} style={{ padding: 16, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: 13, border: `1px solid ${T.border}`, display: "flex", gap: 14, alignItems: "flex-start" }}>
                <Avatar u={e.from} size={38} radius={10} T={T} dark={dark} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{e.from.name.split(" ")[0]}</span>
                    <span style={{ fontSize: 11, color: T.text3 }}>endorsed you for</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }}>{e.skill}</span>
                  </div>
                  <p style={{ fontSize: 12, color: T.text2, fontStyle: "italic", lineHeight: 1.55 }}>"{e.note}"</p>
                </div>
              </div>
            ))}
            <div style={{ textAlign: "center", padding: "20px", color: T.text3, fontSize: 12 }}>
              Connect with more builders to get skill endorsements
            </div>
          </div>
        )}

        {/* Activity */}
        {profileTab === "activity" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 13px", background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: 11 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: hsla(a.hue, 70, 60, dark ? 0.1 : 0.08), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{a.icon}</div>
                <span style={{ fontSize: 12, color: T.text2, flex: 1 }}>{a.a} <span style={{ color: T.text, fontWeight: 600 }}>{a.t}</span></span>
                <span style={{ fontSize: 10, color: T.text3 }}>{a.time}</span>
              </div>
            ))}
          </div>
        )}

        {/* Connections */}
        {profileTab === "connections" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {connections.map(u => (
              <div key={u.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: 13, border: `1px solid ${T.border}` }}>
                <Avatar u={u} size={36} radius={10} T={T} dark={dark} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{u.name.split(" ")[0]}</div>
                  <div style={{ fontSize: 10, color: T.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.role}</div>
                  <div style={{ fontSize: 10, color: hsl(u.hue), fontWeight: 600, marginTop: 2 }}>{calculateMatchScore({ skillsHave: [], skillsNeed: [] }, u)}% match</div>
                </div>
                <button onClick={() => setDashPage("messages")} style={{ padding: "5px 10px", background: "transparent", border: `1px solid ${T.border}`, color: T.text2, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600, flexShrink: 0, transition: "all 0.2s" }}>Chat</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}