"use client";
import { useState, useEffect, useCallback } from "react";

/* ─── tiny helpers (inline so component is self-contained) ──────────────── */
const hsla = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

const STATUS_COLOR = {
  Active:   { bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.28)",  text: "#4ade80" },
  Building: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.28)", text: "#fbbf24" },
  Archived: { bg: "rgba(148,163,184,0.1)",border: "rgba(148,163,184,0.28)",text: "#94a3b8" },
  Live:     { bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.28)",  text: "#4ade80" },
};
const stateStyle = (s) => STATUS_COLOR[s] ?? STATUS_COLOR.Building;

/* ─── parse owner/repo from a GitHub URL ─────────────────────────────────── */
function parseGitHubRepo(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("github.com")) return null;
    const parts = u.pathname.replace(/^\//, "").replace(/\.git$/, "").split("/");
    if (parts.length >= 2) return { owner: parts[0], repo: parts[1] };
  } catch {/* invalid URL */}
  return null;
}

/* ─── format relative time ───────────────────────────────────────────────── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30)  return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

/* ─── mock endorsers (replace with API data when available) ─────────────── */
const MOCK_ENDORSERS = [
  { name: "Rohan Mehra",  handle: "rohanm",  hue: 340, note: "Excellent architecture choices, very clean separation of concerns." },
  { name: "Sara Chen",    handle: "sarachen", hue: 271, note: "One of the most thoughtful AI integrations I've seen in a side project." },
  { name: "Dev Kapoor",   handle: "devk",     hue: 38,  note: "The LangChain usage here is clever — really inspired my own work." },
];

export default function ProjectPage({ projectId, onBack, T, dark, currentUser }) {
  const [project,       setProject]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [endorseText,   setEndorseText]   = useState("");
  const [endorsing,     setEndorsing]     = useState(false);
  const [endorsed,      setEndorsed]      = useState(false);
  const [endorsers,     setEndorsers]     = useState(MOCK_ENDORSERS);
  const [activeSection, setActiveSection] = useState("overview");

  /* ── commit state ── */
  const [commits,       setCommits]       = useState([]);
  const [commitsLoading,setCommitsLoading]= useState(false);
  const [commitsError,  setCommitsError]  = useState(null);

  /* ── load project ── */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res  = await fetch(`/api/projects/${projectId}`);
        const json = await res.json();

        if (!json.success || !json.project) {
          throw new Error(json.message ?? "Project not found");
        }
        setProject(json.project);

      } catch (err) {
        /* fallback: reconstruct from profile API (projects array) */
        try {
          const res  = await fetch("/api/profile");
          const json = await res.json();
          const found = (json.profile?.projects ?? []).find(p => p.id === projectId);
          if (found) setProject(found);
          else throw new Error("Project not found");
        } catch {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  /* ── fetch real GitHub commits when tab becomes active ── */
  const fetchCommits = useCallback(async (githubUrl, branch) => {
    const parsed = parseGitHubRepo(githubUrl);
    if (!parsed) {
      setCommitsError("No valid GitHub repository linked to this project.");
      return;
    }

    setCommitsLoading(true);
    setCommitsError(null);

    try {
      const { owner, repo } = parsed;
      const ref = branch && branch !== "main" && branch !== "master" ? `&sha=${branch}` : "";
      const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=15${ref}`;

      const res = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          // Add Authorization header here if you have a token:
          // Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      });

      if (res.status === 404) throw new Error("Repository not found or is private.");
      if (res.status === 403) throw new Error("GitHub API rate limit hit. Try again in a minute.");
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

      const data = await res.json();
      setCommits(data);
    } catch (err) {
      setCommitsError(err.message);
    } finally {
      setCommitsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === "commits" && project?.github_url && commits.length === 0 && !commitsLoading && !commitsError) {
      fetchCommits(project.github_url, project.branch);
    }
  }, [activeSection, project, commits.length, commitsLoading, commitsError, fetchCommits]);

  /* ── submit endorsement ── */
  async function handleEndorse() {
    if (!endorseText.trim() || endorsing || endorsed) return;
    setEndorsing(true);
    try {
      await fetch(`/api/projects/${projectId}/endorse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: endorseText.trim() }),
      });
    } catch {/* optimistic — ignore network error in demo */}

    setEndorsers(prev => [{
      name:   currentUser?.name   ?? "You",
      handle: currentUser?.handle ?? "you",
      hue:    220,
      note:   endorseText.trim(),
    }, ...prev]);
    setEndorseText("");
    setEndorsed(true);
    setEndorsing(false);
    setActiveSection("endorsements");
  }

  /* ── derived ── */
  const p = project;
  const sc = p ? stateStyle(p.state ?? p.status) : stateStyle("Building");

  /* week streak — deterministic from stars + id chars */
  const weekStreak = p
    ? Array.from({ length: 7 }, (_, i) => {
        const seed = (p.stars ?? 0) + (p.id?.charCodeAt(i % p.id.length) ?? i);
        return { day: ["M","T","W","T","F","S","S"][i], count: seed % 5 };
      })
    : [];

  /* ── skeleton ── */
  const Sk = ({ w = "100%", h = 14, r = 8, mb = 0 }) => (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      marginBottom: mb,
      animation: "sk-pulse 1.6s ease-in-out infinite",
    }} />
  );

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <style>{`
        @keyframes sk-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes pp-fade  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .pp-card { animation: pp-fade 0.35s ease both; }
        .pp-btn:hover { opacity: .78; }
        .pp-tab-active { border-bottom: 2px solid #a78bfa !important; color: ${T.text} !important; }
      `}</style>

      {/* ── back button ── */}
      <button
        onClick={onBack}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          marginBottom: 16, padding: "7px 14px",
          background: "transparent",
          border: `1px solid ${T.border}`,
          borderRadius: 10, cursor: "pointer",
          fontFamily: "inherit", fontSize: 12,
          fontWeight: 600, color: T.text2,
          transition: "opacity .2s",
        }}
        className="pp-btn"
      >
        ← Back to Profile
      </button>

      {/* ── error ── */}
      {error && (
        <div style={{
          padding: "10px 16px", borderRadius: 12, marginBottom: 14,
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
          fontSize: 12, color: "#f87171",
        }}>
          ⚠ {error}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          HERO CARD
      ══════════════════════════════════════════════════ */}
      <div
        className="pp-card"
        style={{
          borderRadius: 18, marginBottom: 14, overflow: "hidden",
          border: `1px solid ${T.border}`,
          background: dark
            ? "linear-gradient(145deg,rgba(124,58,237,0.09) 0%,rgba(17,17,17,0) 60%)"
            : "linear-gradient(145deg,rgba(124,58,237,0.05) 0%,rgba(255,255,255,0) 60%)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* colour band */}
        <div style={{
          height: 4,
          background: "linear-gradient(90deg,#7c3aed,#a855f7,#ec4899)",
        }} />

        <div style={{ padding: "24px 24px 20px" }}>
          {loading ? (
            <>
              <Sk w="55%" h={28} mb={10} />
              <Sk w="38%" h={13} mb={16} />
              <Sk w="100%" h={13} mb={5} />
              <Sk w="80%"  h={13} />
            </>
          ) : p ? (
            <>
              {/* title row */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  background: dark ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24,
                }}>
                  {p.emoji ?? <i className="fa-solid fa-folder-open"></i>}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 26, color: T.text, letterSpacing: "-0.5px",
                    lineHeight: 1.1,
                  }}>
                    {p.name ?? p.title ?? "Untitled"}
                  </div>
                  <div style={{ fontSize: 12, color: T.text3, marginTop: 4 }}>
                    {p.github_url
                      ? <button
                          onClick={() => window.open(p.github_url, "_blank", "noopener,noreferrer")}
                          style={{
                            background: "none", border: "none", padding: 0,
                            color: "#a78bfa", textDecoration: "none",
                            cursor: "pointer", fontFamily: "inherit", fontSize: 12,
                          }}
                        >
                          {p.github_url.replace("https://", "")}
                        </button>
                      : "No repo linked"
                    }
                    {p.branch && <span style={{ opacity: .5 }}> · {p.branch}</span>}
                  </div>
                </div>

                {/* state badge */}
                <span style={{
                  padding: "4px 12px", borderRadius: 99,
                  fontSize: 11, fontWeight: 700,
                  background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text,
                  flexShrink: 0,
                }}>
                  ● {p.state ?? p.status ?? "Building"}
                </span>
              </div>

              {/* description */}
              {p.description && (
                <p style={{
                  fontSize: 14, color: T.text2, lineHeight: 1.65,
                  marginTop: 16, maxWidth: 560,
                }}>
                  {p.description}
                </p>
              )}

              {/* stats row */}
              <div style={{
                display: "flex", gap: 24, marginTop: 18,
                paddingTop: 16, borderTop: `1px solid ${T.border}`,
                flexWrap: "wrap",
              }}>
                {[
                  { icon: <i className="fa-solid fa-star"></i>, v: p.stars  ?? 0,  l: "Stars" },
                  { icon: <i className="fa-solid fa-code-branch"></i>, v: p.forks  ?? 0,  l: "Forks" },
                  { icon: <i className="fa-solid fa-message"></i>, v: endorsers.length, l: "Endorsements" },
                  { icon: <i className="fa-solid fa-calendar"></i>, v: p.created_at
                      ? new Date(p.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                      : "—",
                    l: "Created" },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center", minWidth: 56 }}>
                    <div style={{
                      fontFamily: "'Instrument Serif',serif",
                      fontSize: 20, color: T.text,
                    }}>
                      {s.icon} {s.v}
                    </div>
                    <div style={{ fontSize: 10, color: T.text3, marginTop: 1 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          WEEK STREAK (this week's activity)
      ══════════════════════════════════════════════════ */}
      {!loading && p && (
        <div
          className="pp-card"
          style={{
            borderRadius: 14, marginBottom: 14, padding: "14px 18px",
            border: `1px solid ${T.border}`,
            background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
            animationDelay: "0.05s",
          }}
        >
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 10,
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.text2, letterSpacing: "0.04em" }}>
              THIS WEEK'S ACTIVITY
            </span>
            <span style={{ fontSize: 11, color: T.text3 }}>
              {weekStreak.filter(d => d.count > 0).length} / 7 active days
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            {weekStreak.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                {/* bar */}
                <div style={{
                  width: "100%", height: 32,
                  borderRadius: 6, overflow: "hidden",
                  background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                  display: "flex", alignItems: "flex-end",
                }}>
                  <div style={{
                    width: "100%",
                    height: `${[0, 25, 50, 75, 100][d.count]}%`,
                    background: d.count === 0
                      ? "transparent"
                      : "linear-gradient(180deg,#a855f7,#7c3aed)",
                    borderRadius: 4,
                    transition: "height 0.4s cubic-bezier(.34,1.56,.64,1)",
                    transitionDelay: `${i * 60}ms`,
                  }} />
                </div>
                <span style={{ fontSize: 9, color: T.text3, fontWeight: 700 }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          SKILLS USED
      ══════════════════════════════════════════════════ */}
      {!loading && p && (p.skills_used ?? p.tags ?? []).length > 0 && (
        <div
          className="pp-card"
          style={{
            borderRadius: 14, marginBottom: 14, padding: "14px 18px",
            border: `1px solid ${T.border}`,
            background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
            animationDelay: "0.08s",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: T.text2, letterSpacing: "0.04em" }}>
            SKILLS USED
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {(p.skills_used ?? p.tags ?? []).map(s => (
              <span key={s} style={{
                padding: "4px 12px", borderRadius: 99,
                fontSize: 11, fontWeight: 600,
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.25)",
                color: "#c4b5fd",
              }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB NAV — Overview | Endorsements | Commits
      ══════════════════════════════════════════════════ */}
      <div
        className="pp-card"
        style={{
          borderRadius: 16, overflow: "hidden",
          border: `1px solid ${T.border}`,
          background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
          animationDelay: "0.1s",
        }}
      >
        {/* tabs */}
        <div style={{
          display: "flex", borderBottom: `1px solid ${T.border}`,
          overflowX: "auto",
        }}>
          {["overview", "endorsements", "commits"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              className={activeSection === tab ? "pp-tab-active" : ""}
              style={{
                flex: 1, padding: "13px 0",
                background: "transparent", border: "none",
                borderBottom: "2px solid transparent",
                cursor: "pointer", fontFamily: "inherit",
                fontSize: 12, fontWeight: 700,
                color: activeSection === tab ? T.text : T.text3,
                textTransform: "uppercase", letterSpacing: "0.06em",
                transition: "color .2s",
                whiteSpace: "nowrap",
              }}
            >
              {tab}
              {tab === "endorsements" && (
                <span style={{ marginLeft: 4, fontSize: 10, opacity: .6 }}>
                  ({endorsers.length})
                </span>
              )}
              {tab === "commits" && commits.length > 0 && (
                <span style={{ marginLeft: 4, fontSize: 10, opacity: .6 }}>
                  ({commits.length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ padding: "20px 20px 24px" }}>

          {/* ── OVERVIEW ──────────────────────────────── */}
          {activeSection === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {loading ? (
                <>
                  <Sk w="100%" h={13} mb={5} />
                  <Sk w="90%"  h={13} mb={5} />
                  <Sk w="70%"  h={13} />
                </>
              ) : p ? (
                <>
                  {/* detail rows */}
                  {[
                    { label: "Project ID",   value: p.id },
                    { label: "Branch",       value: p.branch ?? "main" },
                    { label: "State",        value: p.state ?? p.status ?? "Building" },
                    { label: "Sort order",   value: String(p.sort_order ?? p.sort ?? "—") },
                    { label: "Created",      value: p.created_at
                        ? new Date(p.created_at).toLocaleString("en-IN", {
                            dateStyle: "medium", timeStyle: "short",
                          })
                        : "—"
                    },
                  ].map((row, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 8, alignItems: "flex-start",
                      paddingBottom: 12,
                      borderBottom: `1px solid ${T.border}`,
                    }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: T.text3,
                        minWidth: 100, paddingTop: 1,
                        textTransform: "uppercase", letterSpacing: "0.04em",
                      }}>
                        {row.label}
                      </span>
                      <span style={{
                        fontSize: 12, color: T.text,
                        fontFamily: row.label === "Project ID" || row.label === "Branch"
                          ? "'Courier New',monospace" : "inherit",
                        wordBreak: "break-all",
                      }}>
                        {row.value}
                      </span>
                    </div>
                  ))}

                  {/* GitHub link button — opens the real GitHub page */}
                  {p.github_url && p.github_url !== "#" && (
                    <button
                      onClick={() => window.open(p.github_url, "_blank", "noopener,noreferrer")}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "10px 18px", borderRadius: 11,
                        background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                        border: `1px solid ${T.border}`,
                        color: T.text,
                        fontSize: 13, fontWeight: 600,
                        transition: "opacity .2s",
                        alignSelf: "flex-start",
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                      className="pp-btn"
                    >
                      <span style={{ fontSize: 16 }}><i className="fa-brands fa-github"></i></span> View on GitHub
                    </button>
                  )}
                </>
              ) : null}
            </div>
          )}

          
          {activeSection === "endorsements" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* compose box */}
              {!endorsed ? (
                <div style={{
                  padding: 16, borderRadius: 13,
                  background: dark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.04)",
                  border: "1px solid rgba(124,58,237,0.2)",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", marginBottom: 10 }}>
                    ✦ Endorse this project
                  </div>
                  <textarea
                    value={endorseText}
                    onChange={e => setEndorseText(e.target.value)}
                    placeholder="Share what impressed you about this project…"
                    rows={3}
                    style={{
                      width: "100%", borderRadius: 10, padding: "10px 12px",
                      background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                      border: `1px solid ${T.border}`,
                      color: T.text, fontSize: 13, fontFamily: "inherit",
                      resize: "vertical", outline: "none",
                      lineHeight: 1.55, boxSizing: "border-box",
                    }}
                  />
                  <button
                    onClick={handleEndorse}
                    disabled={!endorseText.trim() || endorsing}
                    style={{
                      marginTop: 8, padding: "9px 20px",
                      background: endorseText.trim()
                        ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                        : dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                      border: "none", borderRadius: 10,
                      color: endorseText.trim() ? "#fff" : T.text3,
                      cursor: endorseText.trim() ? "pointer" : "default",
                      fontFamily: "inherit", fontSize: 12, fontWeight: 700,
                      transition: "all .2s",
                    }}
                  >
                    {endorsing ? "Submitting…" : "Submit Endorsement"}
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: "12px 16px", borderRadius: 11,
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  fontSize: 12, color: "#4ade80", fontWeight: 600,
                }}>
                  ✓ Your endorsement was submitted — thank you!
                </div>
              )}

              {/* endorsement list */}
              {endorsers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "28px 0", color: T.text3, fontSize: 13 }}>
                  No endorsements yet. Be the first!
                </div>
              ) : (
                endorsers.map((e, i) => {
                  const initials = e.name.split(" ").map(w => w[0]).join("").slice(0, 2);
                  return (
                    <div key={i} style={{
                      display: "flex", gap: 14, alignItems: "flex-start",
                      padding: "14px 16px", borderRadius: 13,
                      background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                      border: `1px solid ${T.border}`,
                    }}>
                      {/* avatar */}
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: hsla(e.hue, 65, 60, dark ? 0.15 : 0.1),
                        border: `1px solid ${hsla(e.hue, 65, 60, 0.3)}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700,
                        color: `hsl(${e.hue},55%,${dark ? 75 : 45}%)`,
                      }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: "flex", gap: 8, alignItems: "baseline",
                          marginBottom: 5,
                        }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                            {e.name}
                          </span>
                          <span style={{ fontSize: 11, color: T.text3 }}>@{e.handle}</span>
                        </div>
                        <p style={{
                          fontSize: 12, color: T.text2, fontStyle: "italic",
                          lineHeight: 1.6, margin: 0,
                        }}>
                          "{e.note}"
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeSection === "commits" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

              {/* loading skeletons */}
              {commitsLoading && (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 10, alignItems: "center",
                    padding: "12px 0", borderBottom: `1px solid ${T.border}`,
                  }}>
                    <Sk w="36px" h={36} r={9} />
                    <div style={{ flex: 1 }}>
                      <Sk w="70%" h={13} mb={6} />
                      <Sk w="40%" h={10} />
                    </div>
                  </div>
                ))
              )}

              {/* error state */}
              {commitsError && !commitsLoading && (
                <div style={{
                  padding: "14px 16px", borderRadius: 11, marginBottom: 12,
                  background: "rgba(239,68,68,0.07)",
                  border: "1px solid rgba(239,68,68,0.18)",
                  fontSize: 12, color: "#f87171",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 16 }}>⚠</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: 3 }}>{commitsError}</div>
                    {p?.github_url && p.github_url !== "#" && (
                      <div style={{ opacity: .7 }}>
                        You can still{" "}
                        <a
                          href={`${p.github_url}/commits`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#a78bfa" }}
                        >
                          view commits on GitHub ↗
                        </a>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setCommitsError(null);
                      fetchCommits(p?.github_url, p?.branch);
                    }}
                    style={{
                      padding: "5px 10px", borderRadius: 7,
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      color: "#f87171", cursor: "pointer",
                      fontFamily: "inherit", fontSize: 11, fontWeight: 700,
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* no GitHub URL */}
              {!commitsLoading && !commitsError && !p?.github_url && (
                <div style={{ textAlign: "center", padding: "28px 0", color: T.text3, fontSize: 13 }}>
                  No GitHub repository linked to this project.
                </div>
              )}

              {/* commit list */}
              {!commitsLoading && !commitsError && commits.length > 0 && (
                <>
                  {commits.map((c, i) => {
                    const sha   = c.sha?.slice(0, 7) ?? "unknown";
                    const msg   = c.commit?.message?.split("\n")[0] ?? "No message";
                    const author= c.commit?.author?.name ?? c.author?.login ?? "unknown";
                    const date  = c.commit?.author?.date;
                    const avatarUrl = c.author?.avatar_url;
                    const profileUrl = c.author?.html_url;
                    const commitUrl  = c.html_url;

                    return (
                      <div key={c.sha} style={{
                        display: "flex", gap: 12, alignItems: "center",
                        padding: "11px 0",
                        borderBottom: i < commits.length - 1 ? `1px solid ${T.border}` : "none",
                      }}>
                        {/* avatar or fallback icon */}
                        {avatarUrl ? (
                          <a href={profileUrl} target="_blank" rel="noreferrer"
                             style={{ flexShrink: 0 }}>
                            <img
                              src={avatarUrl}
                              alt={author}
                              width={36}
                              height={36}
                              style={{
                                borderRadius: 9,
                                border: "1px solid rgba(124,58,237,0.2)",
                                display: "block",
                              }}
                            />
                          </a>
                        ) : (
                          <div style={{
                            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                            background: dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.08)",
                            border: "1px solid rgba(124,58,237,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 14, color: "#a78bfa",
                          }}>
                            ⌥
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* commit message — links to the commit on GitHub */}
                          <a
                            href={commitUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: 13, color: T.text, fontWeight: 500,
                              textDecoration: "none",
                              display: "block", marginBottom: 3,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                            title={msg}
                            className="pp-btn"
                          >
                            {msg}
                          </a>

                          <div style={{ display: "flex", gap: 8, fontSize: 10, color: T.text3, flexWrap: "wrap" }}>
                            <a
                              href={commitUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ textDecoration: "none" }}
                            >
                              <code style={{
                                background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                                padding: "1px 5px", borderRadius: 4,
                                color: "#a78bfa", fontFamily: "'Courier New',monospace",
                              }}>
                                {sha}
                              </code>
                            </a>
                            <span>{author}</span>
                            {date && <span>{timeAgo(date)}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* footer link */}
                  <div style={{ textAlign: "center", marginTop: 14 }}>
                    <a
                      href={`${p.github_url}/commits/${p.branch ?? "main"}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 11, color: "#a78bfa", textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      View full commit history on GitHub ↗
                    </a>
                  </div>
                </>
              )}

              {/* empty repo */}
              {!commitsLoading && !commitsError && commits.length === 0 && p?.github_url && (
                <div style={{ textAlign: "center", padding: "28px 0", color: T.text3, fontSize: 13 }}>
                  No commits found in this repository.
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}