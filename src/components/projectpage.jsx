"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Folder, Star, GitFork, Handshake, Calendar, Github, AlertTriangle, X, Check,
  ArrowLeft, ExternalLink, GitCommitHorizontal,
} from "lucide-react";

const iconSize = (min, max, vw = 3.2) => ({
  width: `clamp(${min}px, ${vw}vw, ${max}px)`,
  height: `clamp(${min}px, ${vw}vw, ${max}px)`,
  flexShrink: 0,
});

const RADIUS = { control: 8, pill: 6, card: 10, modal: 14 };
const ACCENT = "#7c3aed";

const hsla = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

const STATUS_COLOR = {
  Active: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.28)", text: "#4ade80" },
  Building: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.28)", text: "#fbbf24" },
  Archived: { bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.28)", text: "#94a3b8" },
  Live: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.28)", text: "#4ade80" },
};
const stateStyle = (s) => STATUS_COLOR[s] ?? STATUS_COLOR.Building;

function parseGitHubRepo(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("github.com")) return null;
    const parts = u.pathname.replace(/^\//, "").replace(/\.git$/, "").split("/");
    if (parts.length >= 2) return { owner: parts[0], repo: parts[1] };
  } catch { }
  return null;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

function initialsOf(name = "") {
  return name.trim().split(/\s+/).filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

const MOCK_ENDORSEMENTS = [
  { name: "Rohan Mehra", handle: "rohanm", hue: 340, skill: "React", note: "Excellent architecture choices, very clean separation of concerns." },
  { name: "Sara Chen", handle: "sarachen", hue: 271, skill: "LangChain", note: "One of the most thoughtful AI integrations I've seen in a side project." },
  { name: "Dev Kapoor", handle: "devk", hue: 38, skill: "TypeScript", note: "The typing here is clever — really inspired my own work." },
];

export default function ProjectPage({
  projectId,
  onBack,
  T,
  dark,
  currentUser,
  isConnected = true,
  isOwnProject = false,
}) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  const [endorsements, setEndorsements] = useState(MOCK_ENDORSEMENTS);
  const [showEndorseModal, setShowEndorseModal] = useState(false);
  const [endorseSkill, setEndorseSkill] = useState("");
  const [endorseNote, setEndorseNote] = useState("");
  const [endorsing, setEndorsing] = useState(false);
  const [endorseError, setEndorseError] = useState(null);

  const [commits, setCommits] = useState([]);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [commitsError, setCommitsError] = useState(null);


  console.log(projectId)
  
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/projects/${projectId}`);
        const json = await res.json();

        if (!json.success || !json.project) {
          throw new Error(json.message ?? "Project not found");
        }
        setProject(json.project);

      } catch (err) {
        try {
          const res = await fetch("/api/profile");
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

  useEffect(() => {
    async function loadEndorsements() {
      try {
        const res = await fetch(`/api/endorsements`);
        const json = await res.json();
        if (json.success && Array.isArray(json.endorsements)) {
          setEndorsements(json.endorsements);
        }
      } catch { }
    }
    loadEndorsements();
  }, [projectId]);

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
        headers: { Accept: "application/vnd.github.v3+json" },
      });

      if (res.status === 404) throw new Error("Repository not found or is private.");
      if (res.status === 403) throw new Error("GitHub API rate limit hit. Try again in a minute.");
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

      const data = await res.json();
      setCommits(Array.isArray(data) ? data : []);
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

  const p = project;
  const sc = p ? stateStyle(p.state ?? p.status) : stateStyle("Building");
  const skillOptions = p ? (p.skills_used ?? p.tags ?? []) : [];

  const alreadyEndorsedSkills = endorsements
    .filter(e => e.handle === (currentUser?.handle ?? "you"))
    .map(e => e.skill);

  const canEndorse = isConnected && !isOwnProject && skillOptions.length > 0;

  function openEndorseModal() {
    setEndorseError(null);
    setEndorseNote("");
    setEndorseSkill(skillOptions.find(s => !alreadyEndorsedSkills.includes(s)) ?? skillOptions[0] ?? "");
    setShowEndorseModal(true);
  }
  function closeEndorseModal() {
    if (endorsing) return;
    setShowEndorseModal(false);
  }

  useEffect(() => {
    if (!showEndorseModal) return;
    function onKey(e) { if (e.key === "Escape") closeEndorseModal(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showEndorseModal, endorsing]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmitEndorsement() {
    if (!endorseSkill || endorsing) return;
    setEndorsing(true);
    setEndorseError(null);

    const optimistic = {
      name: currentUser?.name ?? "You",
      handle: currentUser?.handle ?? "you",
      hue: 220,
      skill: endorseSkill,
      note: endorseNote.trim(),
    };

    try {
      const res = await fetch("/api/endorse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_user_id: p?.user_id ?? p?.owner_id,
          project_id: projectId,
          skill: endorseSkill,
          note: endorseNote.trim(),
        }),
      });
      const json = await res.json();
      console.log(json);
      if (!json.success) throw new Error(json.message ?? "Failed to submit endorsement");

      setEndorsements(prev => [json.endorsement ?? optimistic, ...prev]);
      setShowEndorseModal(false);
      setActiveSection("endorsements");
    } catch (err) {
      setEndorseError(err.message ?? "Something went wrong. Try again.");
    } finally {
      setEndorsing(false);
    }
  }

  const weekStreak = p
    ? Array.from({ length: 7 }, (_, i) => {
      const seed = (p.stars ?? 0) + (p.id?.charCodeAt(i % p.id.length) ?? i);
      return { day: ["M", "T", "W", "T", "F", "S", "S"][i], count: seed % 5 };
    })
    : [];

  const Sk = ({ w = "100%", h = 14, r = RADIUS.control, mb = 0 }) => (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      marginBottom: mb,
      animation: "sk-pulse 1.6s ease-in-out infinite",
    }} />
  );

  const inp = {
    width: "100%", borderRadius: RADIUS.control, padding: "9px 12px",
    background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    border: `1px solid ${T.border}`,
    color: T.text, fontSize: 13, fontFamily: "'Inter',sans-serif",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes sk-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes pp-fade  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modal-in { from{opacity:0;transform:translateY(8px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes overlay-in { from{opacity:0} to{opacity:1} }
        .pp-card { animation: pp-fade 0.35s ease both; }
        .pp-btn:hover { opacity: .78; }
        .pp-tab-active { border-bottom: 2px solid #a78bfa !important; color: ${T.text} !important; }
        .endorse-cta { transition: filter .15s ease; }
        .endorse-cta:hover { filter: brightness(1.1); }
        .skill-chip:hover { border-color: rgba(124,58,237,.4) !important; }
      `}</style>

      <button
        onClick={onBack}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          marginBottom: 16, padding: "7px 14px",
          background: "transparent",
          border: `1px solid ${T.border}`,
          borderRadius: RADIUS.control, cursor: "pointer",
          fontFamily: "'Inter',sans-serif", fontSize: 12,
          fontWeight: 600, color: T.text2,
          transition: "opacity .2s",
        }}
        className="pp-btn"
      >
        <ArrowLeft style={iconSize(12, 13, 2)} /> Back to Profile
      </button>

      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 16px", borderRadius: RADIUS.control, marginBottom: 14,
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
          fontSize: 12, color: "#f87171",
        }}>
          <AlertTriangle style={iconSize(13, 14, 2)} /> {error}
        </div>
      )}

      <div
        className="pp-card"
        style={{
          borderRadius: RADIUS.card, marginBottom: 14, overflow: "hidden",
          border: `1px solid ${T.border}`,
          background: dark
            ? "linear-gradient(145deg,rgba(124,58,237,0.09) 0%,rgba(17,17,17,0) 60%)"
            : "linear-gradient(145deg,rgba(124,58,237,0.05) 0%,rgba(255,255,255,0) 60%)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ height: 3, background: ACCENT }} />

        <div style={{ padding: "24px 24px 20px" }}>
          {loading ? (
            <>
              <Sk w="55%" h={28} mb={10} />
              <Sk w="38%" h={13} mb={16} />
              <Sk w="100%" h={13} mb={5} />
              <Sk w="80%" h={13} />
            </>
          ) : p ? (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: RADIUS.card, flexShrink: 0,
                  background: dark ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24,
                }}>
                  {p.emoji ?? <Folder style={{ ...iconSize(22, 24, 3), color: "#a78bfa" }} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Inter',sans-serif", fontWeight: 700,
                    fontSize: 24, color: T.text, letterSpacing: "-0.6px",
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
                          cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: 12,
                        }}
                      >
                        {p.github_url.replace("https://", "")}
                      </button>
                      : "No repo linked"
                    }
                    {p.branch && <span style={{ opacity: .5 }}> · {p.branch}</span>}
                  </div>
                </div>

                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 12px", borderRadius: RADIUS.pill,
                  fontSize: 11, fontWeight: 700,
                  background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text,
                  flexShrink: 0,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.text, flexShrink: 0 }} />
                  {p.state ?? p.status ?? "Building"}
                </span>
              </div>

              {p.description && (
                <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.65, marginTop: 16, maxWidth: 560 }}>
                  {p.description}
                </p>
              )}

              <div style={{
                display: "flex", gap: 24, marginTop: 18,
                paddingTop: 16, borderTop: `1px solid ${T.border}`,
                flexWrap: "wrap", alignItems: "center",
              }}>
                {[
                  { Icon: Star, v: p.stars ?? 0, l: "Stars" },
                  { Icon: GitFork, v: p.forks ?? 0, l: "Forks" },
                  { Icon: Handshake, v: endorsements.length, l: "Endorsements" },
                  {
                    Icon: Calendar, v: p.created_at
                      ? new Date(p.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                      : "—",
                    l: "Created"
                  },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center", minWidth: 56 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 17, color: T.text }}>
                      <s.Icon style={{ ...iconSize(13, 14, 2), color: "#a78bfa" }} /> {s.v}
                    </div>
                    <div style={{ fontSize: 10, color: T.text3, marginTop: 1 }}>{s.l}</div>
                  </div>
                ))}

                {canEndorse && (
                  <button
                    onClick={openEndorseModal}
                    className="endorse-cta"
                    style={{
                      marginLeft: "auto", padding: "10px 20px",
                      background: ACCENT,
                      border: `1px solid ${ACCENT}`, borderRadius: RADIUS.control, color: "#fff",
                      cursor: "pointer", fontFamily: "'Inter',sans-serif",
                      fontSize: 12, fontWeight: 700,
                      display: "inline-flex", alignItems: "center", gap: 7,
                    }}
                  >
                    <Handshake style={iconSize(13, 14, 2)} /> Endorse
                  </button>
                )}
                {!isConnected && !isOwnProject && skillOptions.length > 0 && (
                  <span style={{ marginLeft: "auto", fontSize: 11, color: T.text3 }}>
                    Connect to endorse skills
                  </span>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {!loading && p && (
        <div className="pp-card" style={{
          borderRadius: RADIUS.card, marginBottom: 14, padding: "14px 18px",
          border: `1px solid ${T.border}`,
          background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
          animationDelay: "0.05s",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.text2, letterSpacing: "0.06em", fontFamily: "'JetBrains Mono',monospace" }}>
              THIS WEEK'S ACTIVITY
            </span>
            <span style={{ fontSize: 11, color: T.text3, fontFamily: "'JetBrains Mono',monospace" }}>
              {weekStreak.filter(d => d.count > 0).length} / 7 active days
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            {weekStreak.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: "100%", height: 32, borderRadius: RADIUS.control, overflow: "hidden",
                  background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                  display: "flex", alignItems: "flex-end",
                }}>
                  <div style={{
                    width: "100%",
                    height: `${[0, 25, 50, 75, 100][d.count]}%`,
                    background: d.count === 0 ? "transparent" : ACCENT,
                    borderRadius: RADIUS.control,
                    transition: "height 0.4s cubic-bezier(.34,1.56,.64,1)",
                    transitionDelay: `${i * 60}ms`,
                  }} />
                </div>
                <span style={{ fontSize: 9, color: T.text3, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && p && skillOptions.length > 0 && (
        <div className="pp-card" style={{
          borderRadius: RADIUS.card, marginBottom: 14, padding: "14px 18px",
          border: `1px solid ${T.border}`,
          background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
          animationDelay: "0.08s",
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.text2, letterSpacing: "0.06em", fontFamily: "'JetBrains Mono',monospace" }}>
            SKILLS USED
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {skillOptions.map(s => {
              const count = endorsements.filter(e => e.skill === s).length;
              return (
                <span key={s} style={{
                  padding: "4px 12px", borderRadius: RADIUS.pill,
                  fontSize: 11, fontWeight: 600,
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.25)",
                  color: "#c4b5fd",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}>
                  {s}
                  {count > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
                      background: "rgba(124,58,237,0.25)",
                      borderRadius: RADIUS.pill, padding: "0 6px",
                    }}>{count}</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="pp-card" style={{
        borderRadius: RADIUS.card, overflow: "hidden",
        border: `1px solid ${T.border}`,
        background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
        animationDelay: "0.1s",
      }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, overflowX: "auto" }}>
          {["overview", "endorsements", "commits"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              className={activeSection === tab ? "pp-tab-active" : ""}
              style={{
                flex: 1, padding: "13px 0",
                background: "transparent", border: "none",
                borderBottom: "2px solid transparent",
                cursor: "pointer", fontFamily: "'Inter',sans-serif",
                fontSize: 12, fontWeight: 700,
                color: activeSection === tab ? T.text : T.text3,
                textTransform: "uppercase", letterSpacing: "0.06em",
                transition: "color .2s", whiteSpace: "nowrap",
              }}
            >
              {tab}
              {tab === "endorsements" && (
                <span style={{ marginLeft: 4, fontSize: 10, opacity: .6, fontFamily: "'JetBrains Mono',monospace" }}>({endorsements.length})</span>
              )}
              {tab === "commits" && commits.length > 0 && (
                <span style={{ marginLeft: 4, fontSize: 10, opacity: .6, fontFamily: "'JetBrains Mono',monospace" }}>({commits.length})</span>
              )}
            </button>
          ))}
        </div>

        <div style={{ padding: "20px 20px 24px" }}>

          {activeSection === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {loading ? (
                <>
                  <Sk w="100%" h={13} mb={5} />
                  <Sk w="90%" h={13} mb={5} />
                  <Sk w="70%" h={13} />
                </>
              ) : p ? (
                <>
                  {[
                    { label: "Project ID", value: p.id },
                    { label: "Branch", value: p.branch ?? "main" },
                    { label: "State", value: p.state ?? p.status ?? "Building" },
                    { label: "Sort order", value: String(p.sort_order ?? p.sort ?? "—") },
                    {
                      label: "Created", value: p.created_at
                        ? new Date(p.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                        : "—"
                    },
                  ].map((row, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 8, alignItems: "flex-start",
                      paddingBottom: 12, borderBottom: `1px solid ${T.border}`,
                    }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: T.text3,
                        minWidth: 100, paddingTop: 1,
                        textTransform: "uppercase", letterSpacing: "0.06em",
                        fontFamily: "'JetBrains Mono',monospace",
                      }}>
                        {row.label}
                      </span>
                      <span style={{
                        fontSize: 12, color: T.text,
                        fontFamily: row.label === "Project ID" || row.label === "Branch" ? "'JetBrains Mono',monospace" : "'Inter',sans-serif",
                        wordBreak: "break-all",
                      }}>
                        {row.value}
                      </span>
                    </div>
                  ))}

                  {p.github_url && p.github_url !== "#" && (
                    <button
                      onClick={() => window.open(p.github_url, "_blank", "noopener,noreferrer")}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "10px 18px", borderRadius: RADIUS.control,
                        background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                        border: `1px solid ${T.border}`,
                        color: T.text, fontSize: 13, fontWeight: 600,
                        transition: "opacity .2s", alignSelf: "flex-start",
                        cursor: "pointer", fontFamily: "'Inter',sans-serif",
                      }}
                      className="pp-btn"
                    >
                      <Github style={iconSize(15, 16, 2)} /> View on GitHub
                    </button>
                  )}
                </>
              ) : null}
            </div>
          )}

          {activeSection === "endorsements" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {canEndorse && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 12, padding: "14px 16px", borderRadius: RADIUS.card,
                  background: dark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.04)",
                  border: "1px solid rgba(124,58,237,0.2)",
                }}>
                  <span style={{ fontSize: 12, color: T.text2 }}>
                    Vouch for a skill you saw in this project.
                  </span>
                  <button
                    onClick={openEndorseModal}
                    style={{
                      padding: "7px 16px", background: ACCENT,
                      border: `1px solid ${ACCENT}`, borderRadius: RADIUS.control, color: "#fff",
                      cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}
                  >
                    Endorse
                  </button>
                </div>
              )}

              {endorsements.length === 0 ? (
                <div style={{ textAlign: "center", padding: "28px 0", color: T.text3, fontSize: 13 }}>
                  No endorsements yet. Be the first!
                </div>
              ) : (
                endorsements.map((e, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 14, alignItems: "flex-start",
                    padding: "14px 16px", borderRadius: RADIUS.card,
                    background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                    border: `1px solid ${T.border}`,
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: RADIUS.card, flexShrink: 0,
                      background: hsla(e.hue, 65, 60, dark ? 0.15 : 0.1),
                      border: `1px solid ${hsla(e.hue, 65, 60, 0.3)}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
                      color: `hsl(${e.hue},55%,${dark ? 75 : 45}%)`,
                    }}>
                      {initialsOf(e.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{e.name}</span>
                        <span style={{ fontSize: 11, color: T.text3, fontFamily: "'JetBrains Mono',monospace" }}>@{e.handle}</span>
                        {e.skill && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: RADIUS.pill,
                            background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)",
                            color: "#c4b5fd", marginLeft: "auto",
                          }}>
                            {e.skill}
                          </span>
                        )}
                      </div>
                      {e.note && (
                        <p style={{ fontSize: 12, color: T.text2, fontStyle: "italic", lineHeight: 1.6, margin: 0 }}>
                          "{e.note}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeSection === "commits" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {commitsLoading && (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                    <Sk w="36px" h={36} r={RADIUS.control} />
                    <div style={{ flex: 1 }}>
                      <Sk w="70%" h={13} mb={6} />
                      <Sk w="40%" h={10} />
                    </div>
                  </div>
                ))
              )}

              {commitsError && !commitsLoading && (
                <div style={{
                  padding: "14px 16px", borderRadius: RADIUS.card, marginBottom: 12,
                  background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)",
                  fontSize: 12, color: "#f87171", display: "flex", alignItems: "center", gap: 10,
                }}>
                  <AlertTriangle style={iconSize(15, 16, 2)} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: 3 }}>{commitsError}</div>
                    {p?.github_url && p.github_url !== "#" && (
                      <div style={{ opacity: .7, display: "flex", alignItems: "center", gap: 4 }}>
                        You can still{" "}
                        <a href={`${p.github_url}/commits`} target="_blank" rel="noreferrer" style={{ color: "#a78bfa", display: "inline-flex", alignItems: "center", gap: 3 }}>
                          view commits on GitHub <ExternalLink style={iconSize(10, 11, 2)} />
                        </a>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => { setCommitsError(null); fetchCommits(p?.github_url, p?.branch); }}
                    style={{
                      padding: "5px 10px", borderRadius: RADIUS.control,
                      background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
                      color: "#f87171", cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700,
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {!commitsLoading && !commitsError && !p?.github_url && (
                <div style={{ textAlign: "center", padding: "28px 0", color: T.text3, fontSize: 13 }}>
                  No GitHub repository linked to this project.
                </div>
              )}

              {!commitsLoading && !commitsError && commits.length > 0 && (
                <>
                  {commits.map((c, i) => {
                    const sha = c.sha?.slice(0, 7) ?? "unknown";
                    const msg = c.commit?.message?.split("\n")[0] ?? "No message";
                    const author = c.commit?.author?.name ?? c.author?.login ?? "unknown";
                    const date = c.commit?.author?.date;
                    const avatarUrl = c.author?.avatar_url;
                    const profileUrl = c.author?.html_url;
                    const commitUrl = c.html_url;

                    return (
                      <div key={c.sha ?? i} style={{
                        display: "flex", gap: 12, alignItems: "center", padding: "11px 0",
                        borderBottom: i < commits.length - 1 ? `1px solid ${T.border}` : "none",
                      }}>
                        {avatarUrl ? (
                          <a href={profileUrl} target="_blank" rel="noreferrer" style={{ flexShrink: 0 }}>
                            <img src={avatarUrl} alt={author} width={36} height={36}
                              style={{ borderRadius: RADIUS.control, border: "1px solid rgba(124,58,237,0.2)", display: "block" }} />
                          </a>
                        ) : (
                          <div style={{
                            width: 36, height: 36, borderRadius: RADIUS.control, flexShrink: 0,
                            background: dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.08)",
                            border: "1px solid rgba(124,58,237,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <GitCommitHorizontal style={{ ...iconSize(15, 16, 2), color: "#a78bfa" }} />
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <a href={commitUrl} target="_blank" rel="noreferrer" title={msg} className="pp-btn"
                            style={{
                              fontSize: 13, color: T.text, fontWeight: 500, textDecoration: "none",
                              display: "block", marginBottom: 3,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                          >
                            {msg}
                          </a>
                          <div style={{ display: "flex", gap: 8, fontSize: 10, color: T.text3, flexWrap: "wrap" }}>
                            <a href={commitUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                              <code style={{
                                background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                                padding: "1px 5px", borderRadius: 4,
                                color: "#a78bfa", fontFamily: "'JetBrains Mono',monospace",
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

                  <div style={{ textAlign: "center", marginTop: 14 }}>
                    <a href={`${p.github_url}/commits/${p.branch ?? "main"}`} target="_blank" rel="noreferrer"
                      style={{ fontSize: 11, color: "#a78bfa", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      View full commit history on GitHub <ExternalLink style={iconSize(11, 12, 2)} />
                    </a>
                  </div>
                </>
              )}

              {!commitsLoading && !commitsError && commits.length === 0 && p?.github_url && (
                <div style={{ textAlign: "center", padding: "28px 0", color: T.text3, fontSize: 13 }}>
                  No commits found in this repository.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showEndorseModal && (
        <div
          onClick={closeEndorseModal}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, animation: "overlay-in .15s ease both",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 420, borderRadius: RADIUS.modal,
              background: dark ? "#161616" : "#fff",
              border: `1px solid ${T.border}`,
              animation: "modal-in .18s cubic-bezier(.34,1.56,.64,1) both",
              overflow: "hidden",
            }}
          >
            <div style={{
              padding: "16px 20px", borderBottom: `1px solid ${T.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: RADIUS.control,
                  background: "rgba(124,58,237,.15)", border: "1px solid rgba(124,58,237,.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Handshake style={{ ...iconSize(14, 15, 2), color: "#a78bfa" }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                  Endorse {p?.owner_name ?? "this builder"}
                </span>
              </div>
              <button onClick={closeEndorseModal} style={{
                background: "transparent", border: "none", color: T.text3,
                cursor: "pointer", display: "flex", padding: 0,
              }}>
                <X style={iconSize(17, 18, 2.4)} />
              </button>
            </div>

            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 12, color: T.text3, margin: 0, lineHeight: 1.5 }}>
                Based on <strong style={{ color: T.text2 }}>{p?.name}</strong>, vouch for a skill they used.
              </p>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: ".06em", display: "block", marginBottom: 6, textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace" }}>
                  Skill
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {skillOptions.map(s => {
                    const taken = alreadyEndorsedSkills.includes(s);
                    const active = endorseSkill === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={taken}
                        onClick={() => setEndorseSkill(s)}
                        className="skill-chip"
                        title={taken ? "Already endorsed" : undefined}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "6px 14px", borderRadius: RADIUS.pill, fontSize: 12, fontWeight: 600,
                          cursor: taken ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif",
                          transition: "border-color .15s ease, background .15s ease",
                          background: active ? "rgba(124,58,237,.18)" : "transparent",
                          border: `1px solid ${active ? "rgba(124,58,237,.5)" : T.border}`,
                          color: taken ? T.text3 : (active ? "#c4b5fd" : T.text2),
                          opacity: taken ? .45 : 1,
                        }}
                      >
                        {taken && <Check style={iconSize(11, 12, 2)} />}{s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: ".06em", display: "block", marginBottom: 6, textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace" }}>
                  Note <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span>
                </label>
                <textarea
                  value={endorseNote}
                  onChange={e => setEndorseNote(e.target.value.slice(0, 140))}
                  placeholder="What stood out about their work?"
                  rows={3}
                  style={{ ...inp, resize: "vertical", lineHeight: 1.55 }}
                />
                <div style={{ textAlign: "right", fontSize: 10, color: T.text3, marginTop: 4, fontFamily: "'JetBrains Mono',monospace" }}>
                  {endorseNote.length}/140
                </div>
              </div>

              {endorseError && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 12, color: "#f87171", padding: "8px 12px", borderRadius: RADIUS.control,
                  background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)",
                }}>
                  <AlertTriangle style={iconSize(13, 14, 2)} /> {endorseError}
                </div>
              )}
            </div>

            <div style={{
              padding: "14px 20px", borderTop: `1px solid ${T.border}`,
              display: "flex", gap: 8, justifyContent: "flex-end",
            }}>
              <button
                onClick={closeEndorseModal}
                disabled={endorsing}
                style={{
                  padding: "9px 18px", background: "transparent", border: `1px solid ${T.border}`,
                  color: T.text2, borderRadius: RADIUS.control, cursor: "pointer", fontFamily: "'Inter',sans-serif",
                  fontSize: 12, fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEndorsement}
                disabled={!endorseSkill || endorsing}
                style={{
                  padding: "9px 22px",
                  background: endorseSkill ? ACCENT : (dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"),
                  border: `1px solid ${endorseSkill ? ACCENT : "transparent"}`, borderRadius: RADIUS.control,
                  color: endorseSkill ? "#fff" : T.text3,
                  cursor: endorseSkill ? "pointer" : "default",
                  fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, transition: "filter .15s ease",
                }}
                onMouseEnter={(e) => { if (endorseSkill) e.currentTarget.style.filter = "brightness(1.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = ""; }}
              >
                {endorsing ? "Submitting…" : "Submit Endorsement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}