"use client"
import { useState, useRef } from "react";

function Dashboard() {
  const SKILLS_ALL = ["React", "Next.js", "TypeScript", "Node.js", "Python", "Rust", "Go", "UI/UX Design", "Figma", "GraphQL", "PostgreSQL", "MongoDB", "Redis", "DevOps", "AWS", "Docker", "Machine Learning", "Web3", "Flutter", "Swift", "Tailwind CSS", "Vue.js", "Svelte", "Three.js", "Solidity", "Kotlin", "Unity"];

  const MOCK_USERS = [
    { id: 1, name: "Aanya Sharma", handle: "aanya.dev", role: "Full Stack Engineer", avatar: "AS", hue: 259, bio: "I build SaaS tools that people actually want to use. Obsessed with DX, clean APIs, and shipping fast.", skillsHave: ["React", "Next.js", "Node.js", "PostgreSQL"], skillsNeed: ["UI/UX Design", "Figma", "Machine Learning"], lookingFor: "Collaborator", location: "Bangalore, IN", github: "aanya-dev", projects: 3, followers: 128, online: true },
    { id: 2, name: "Rohan Mehra", handle: "rohan.ui", role: "Design Engineer", avatar: "RM", hue: 340, bio: "Designer who writes production code. Built 2 design systems used by 10k+ devs.", skillsHave: ["UI/UX Design", "Figma", "React", "Tailwind CSS"], skillsNeed: ["Node.js", "PostgreSQL", "DevOps"], lookingFor: "Collaborator", location: "Mumbai, IN", github: "rohan-designs", projects: 5, followers: 342, online: true },
    { id: 3, name: "Priya Nair", handle: "priya.ml", role: "ML Engineer", avatar: "PN", hue: 158, bio: "Turning research papers into products. My AI tools have been used in production at 3 startups.", skillsHave: ["Machine Learning", "Python", "AWS", "Docker"], skillsNeed: ["React", "TypeScript", "Next.js"], lookingFor: "Mentor", location: "Hyderabad, IN", github: "priya-ml", projects: 7, followers: 201, online: false },
    { id: 4, name: "Dev Kapoor", handle: "dev.sys", role: "Systems Engineer", avatar: "DK", hue: 38, bio: "Distributed systems, high throughput APIs, and the occasional Rust rant.", skillsHave: ["Rust", "Go", "Docker", "Redis", "AWS"], skillsNeed: ["React", "UI/UX Design", "TypeScript"], lookingFor: "Collaborator", location: "Delhi, IN", github: "dev-systems", projects: 4, followers: 97, online: false },
    { id: 5, name: "Sara Chen", handle: "sara.web3", role: "Web3 Developer", avatar: "SC", hue: 271, bio: "Building the decentralized future, one smart contract at a time. Open to mentoring frontend devs.", skillsHave: ["Web3", "TypeScript", "React", "Solidity"], skillsNeed: ["DevOps", "AWS", "Machine Learning"], lookingFor: "Mentee", location: "Remote", github: "sara-web3", projects: 9, followers: 456, online: true },
    { id: 6, name: "Karan Patel", handle: "karan.mob", role: "Mobile Developer", avatar: "KP", hue: 316, bio: "5 apps, 50k+ downloads. Flutter specialist who crafts delightful mobile experiences.", skillsHave: ["Flutter", "Swift", "Firebase", "Dart"], skillsNeed: ["Machine Learning", "Node.js", "GraphQL"], lookingFor: "Collaborator", location: "Pune, IN", github: "karan-mobile", projects: 6, followers: 183, online: false },
  ];

  const CONVERSATIONS = [
    { id: 1, user: MOCK_USERS[1], messages: [{ id: 1, from: "them", text: "Hey! Saw your PM tool on GitHub — the real-time sync is smooth. How did you handle conflict resolution?", time: "10:32" }, { id: 2, from: "me", text: "Thanks! Used operational transforms with Supabase Realtime. Took a while but worth it.", time: "10:34" }, { id: 3, from: "them", text: "Would you be open to a collab? I need backend for my design system.", time: "10:35" }, { id: 4, from: "me", text: "Absolutely! I've been looking for a design partner. Your component library is exactly what I need.", time: "10:37" }, { id: 5, from: "them", text: "Perfect. Call this weekend? I'll drop a Figma link.", time: "10:38" }] },
    { id: 2, user: MOCK_USERS[0], messages: [{ id: 1, from: "them", text: "Hi! Loved your portfolio. The animations are super clean 🔥", time: "Yesterday" }, { id: 2, from: "me", text: "Thank you! I spent way too long on those transitions haha", time: "Yesterday" }, { id: 3, from: "them", text: "Can we collab on something? I have a SaaS idea that needs a frontend person.", time: "2h ago" }] },
    { id: 3, user: MOCK_USERS[2], messages: [{ id: 1, from: "them", text: "Hey, I saw you need ML skills. I'm looking for a React dev to help me build a UI for my model.", time: "3h ago" }, { id: 2, from: "me", text: "That's perfect actually! I've been wanting to learn more about ML integrations.", time: "2h ago" }] },
  ];

  const NOTIFS = [
    { id: 1, text: "Aanya Sharma wants to connect", time: "2m ago", read: false, hue: 259, type: "connect" },
    { id: 2, text: "New 94% match — Rohan Mehra", time: "15m ago", read: false, hue: 340, type: "match" },
    { id: 3, text: "Priya Nair accepted your request", time: "1h ago", read: true, hue: 158, type: "accept" },
    { id: 4, text: "Rohan Mehra sent you a message", time: "3h ago", read: true, hue: 340, type: "message" },
  ];

  const [dashPage, setDashPage] = useState("discover");
  const [convos, setConvos] = useState(CONVERSATIONS);
  const [notifs, setNotifs] = useState(NOTIFS);
  const [activeConvo, setActiveConvo] = useState(CONVERSATIONS[0]);
  const [connected, setConnected] = useState({});
  const [liked, setLiked] = useState({});
  const [filterSkill, setFilterSkill] = useState("All");
  const [filterLooking, setFilterLooking] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [aiLoading, setAiLoading] = useState(null);
  const [aiText, setAiText] = useState({});
  const [msgInput, setMsgInput] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileTab, setProfileTab] = useState("projects");
  const [settingsTab, setSettingsTab] = useState("account");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileConvoOpen, setMobileConvoOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: "You", handle: "yourhandle", role: "Frontend Developer", skillsHave: ["React", "Next.js", "TypeScript"], skillsNeed: ["UI/UX Design", "Machine Learning"], lookingFor: "Collaborator", bio: "Building cool stuff.", location: "Meerut, IN", projects: 3, followers: 42 });
  const chatEndRef = useRef(null);
  const [formData, setFormData] = useState({ email: "", password: "" });

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
  };

  const [dark, setDark] = useState(true);
  const T = dark ? DARK : LIGHT;

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
    .fade-up{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both}
    .fade-in{animation:fadeIn 0.3s ease both}
    .spin{animation:spin 0.9s linear infinite;display:inline-block}
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
    .select{background:${T.input};border:1px solid ${T.inputBorder};color:${T.text2};padding:8px 12px;border-radius:10px;font-size:12px;font-family:inherit;outline:none;cursor:pointer;max-width:100%}
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
    .sidebar-item{display:flex;align-items:center;gap:11px;padding:11px 13px;border-radius:13px;cursor:pointer;transition:all 0.2s;border:1px solid transparent;width:100%;background:none;font-family:inherit}
    .sidebar-item:hover{background:${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}}
    .sidebar-item.on{background:${dark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.07)"};border-color:${T.border}}
    .match-track{height:3px;background:${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"};border-radius:99px;overflow:hidden}
    .divider{height:1px;background:${T.border};margin:18px 0}
    .toggle-switch{width:44px;height:24px;border-radius:12px;border:none;cursor:pointer;position:relative;transition:background 0.3s;flex-shrink:0}
    .toggle-thumb{width:18px;height:18px;border-radius:50%;background:white;position:absolute;top:3px;transition:left 0.25s cubic-bezier(0.34,1.56,0.64,1)}
    .mob-nav{display:none}
    .desk-nav{display:flex}

    /* ── Responsive ── */
    @media(max-width:768px){
      .desk-nav{display:none !important}
      .mob-nav{display:flex !important}
      .db-main{padding:16px 12px !important}
      .discover-header{flex-direction:column !important;align-items:flex-start !important;gap:12px !important}
      .discover-filters{flex-wrap:wrap !important;gap:6px !important;width:100% !important}
      .discover-search{width:100% !important}
      .discover-select{flex:1 !important;min-width:0 !important}
      .discover-grid{grid-template-columns:1fr !important}
      .stats-row{flex-wrap:wrap !important;gap:8px !important}
      .msg-sidebar{display:none !important}
      .msg-sidebar.open{display:flex !important;position:fixed;inset:0;z-index:300;width:100% !important;border-radius:0 !important}
      .msg-right-panel{display:none !important}
      .msg-chat-header-actions{gap:6px !important}
      .msg-layout{gap:0 !important;height:calc(100vh - 110px) !important}
      .profile-header-row{flex-direction:column !important;gap:12px !important}
      .profile-stats-grid{grid-template-columns:repeat(2,1fr) !important}
      .profile-skills-grid{grid-template-columns:1fr !important}
      .profile-tabs{overflow-x:auto !important;-webkit-overflow-scrolling:touch !important;white-space:nowrap !important}
      .settings-layout{flex-direction:column !important;gap:10px !important}
      .settings-sidebar{width:100% !important}
      .settings-sidebar-inner{display:flex !important;flex-direction:row !important;overflow-x:auto !important;padding:6px !important;gap:4px !important}
      .settings-sidebar-btn{flex-shrink:0 !important;white-space:nowrap !important}
      .notif-dropdown{width:280px !important;right:-60px !important}
      .header-logo-text{display:none !important}
      .mobile-back-btn{display:flex !important}
    }
    @media(max-width:480px){
      .card-actions{flex-wrap:wrap !important}
      .card-actions .btn-primary{flex:1 !important}
      .profile-projects-header{flex-direction:column !important;gap:6px !important}
      .connections-grid{grid-template-columns:1fr !important}
      .looking-row{flex-direction:column !important;gap:6px !important}
      .notif-dropdown{width:calc(100vw - 24px) !important;right:-30px !important}
    }
    @media(min-width:769px){
      .mobile-back-btn{display:none !important}
      .mob-bottom-nav{display:none !important}
    }
    /* Mobile bottom nav */
    .mob-bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:${T.navBg};backdrop-filter:blur(20px);border-top:1px solid ${T.border};z-index:200;padding:8px 0 12px}
    @media(max-width:768px){
      .mob-bottom-nav{display:flex !important}
      .db-main{padding-bottom:80px !important}
    }
  `;

  const upd = (k, v) => setFormData(p => ({ ...p, [k]: v }));
  const hsl = (h, s = 70, l = 60) => `hsl(${h},${s}%,${l}%)`;
  const hsla = (h, s = 70, l = 60, a = 0.12) => `hsla(${h},${s}%,${l}%,${a})`;
  const unread = notifs.filter(n => !n.read).length;
  const currentConvo = convos.find(c => c.id === activeConvo.id) || convos[0];

  function calculateMatchScore(me, them) {
    let theyHaveWhatINeed = 0;
    for (const skill of (me.skillsNeed || [])) { if ((them.skillsHave || []).includes(skill)) theyHaveWhatINeed++; }
    let iHaveWhatTheyNeed = 0;
    for (const skill of (them.skillsNeed || [])) { if ((me.skillsHave || []).includes(skill)) iHaveWhatTheyNeed++; }
    const total = theyHaveWhatINeed + iHaveWhatTheyNeed;
    const maxPossible = (me.skillsNeed?.length || 0) + (them.skillsNeed?.length || 0);
    if (maxPossible === 0) return 0;
    let score = (total / maxPossible) * 100;
    if (me.lookingFor === them.lookingFor) score += 10;
    return Math.round(Math.min(100, score));
  }

  const rankedUsers = MOCK_USERS.map(u => ({ ...u, matchScore: calculateMatchScore(currentUser, u) })).sort((a, b) => b.matchScore - a.matchScore);
  const filtered = rankedUsers.filter(u => {
    const sk = filterSkill === "All" || u.skillsHave.includes(filterSkill) || u.skillsNeed.includes(filterSkill);
    const lk = filterLooking === "All" || u.lookingFor === filterLooking;
    const sq = !searchQ || u.name.toLowerCase().includes(searchQ.toLowerCase()) || u.role.toLowerCase().includes(searchQ.toLowerCase());
    return sk && lk && sq;
  });

  const Avatar = ({ u, size = 44, radius = 12 }) => (
    <div style={{ width: size, height: size, borderRadius: radius, background: hsla(u.hue, 70, 60, dark ? 0.15 : 0.12), border: `1.5px solid ${hsla(u.hue, 70, 60, 0.3)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.3, fontWeight: 700, color: hsl(u.hue), flexShrink: 0, fontFamily: "'Instrument Serif',serif" }}>
      {u.avatar}
    </div>
  );

  const Lbl = ({ children }) => <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: T.text3, marginBottom: 7 }}>{children}</div>;

  const Field = ({ label, id, type = "text", placeholder, value, onChange, prefix }) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: T.text3 }}>@</span>}
        <input className="input" id={id} type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} style={{ paddingLeft: prefix ? "28px" : "14px" }} />
      </div>
    </div>
  );

  const sendMsg = () => {
    if (!msgInput.trim()) return;
    setConvos(p => p.map(c => c.id === activeConvo.id ? { ...c, messages: [...c.messages, { id: c.messages.length + 1, from: "me", text: msgInput, time: "now" }] } : c));
    setActiveConvo(p => ({ ...p, messages: [...(p.messages || []), { id: (p.messages?.length || 0) + 1, from: "me", text: msgInput, time: "now" }] }));
    setMsgInput("");
  };

  const handleAI = (user) => {
    setAiLoading(user.id);
    const msgs = [
      `Your ${currentUser.skillsHave[0]} expertise is exactly what ${user.name.split(" ")[0]} needs, and their ${user.skillsHave[0]} fills your top skill gap. This is a rare two-way complementary match.`,
      `${user.name.split(" ")[0]} has shipped ${user.projects} projects and brings deep ${user.skillsHave[0]} knowledge you're missing. You cover their ${user.skillsNeed[0]} gap completely.`,
      `Strong goal alignment — you're both ${user.lookingFor}s. Your complementary stacks mean you could start building immediately without major skill overlaps.`,
    ];
    setTimeout(() => { setAiText(p => ({ ...p, [user.id]: msgs[user.id % 3] })); setAiLoading(null); }, 1200);
  };

  // Theme-adaptive logo
  const LogoIcon = ({ size = 30 }) => (
    <div style={{ width: size, height: size, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill={dark ? "#1a0a3a" : "#00DC33"} />
        <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill={dark ? "#a78bfa" : "#ffffff"} />
      </svg>
    </div>
  );

  const navItems = [
    { id: "discover", icon: "🧭", label: "Discover" },
    { id: "messages", icon: "💬", label: "Messages" },
    { id: "profile", icon: "👤", label: "Profile" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{css}</style>

      {/* Ambient bg */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-15%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.08)" : "hsla(259,70%,60%,0.05)"} 0%,transparent 65%)` }} />
        <div style={{ position: "absolute", bottom: "-10%", right: 0, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(300,60%,30%,0.06)" : "hsla(300,60%,60%,0.04)"} 0%,transparent 65%)` }} />
      </div>

      {/* Desktop Topnav */}
      <header style={{ position: "sticky", top: 0, zIndex: 200, background: T.navBg, backdropFilter: "blur(24px)", borderBottom: `1px solid ${T.border}`, padding: "0 22px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
          <LogoIcon />
          <span className="header-logo-text" style={{ fontFamily: "'Instrument Serif',serif", fontSize: 16, color: T.text }}>CodeBuddy</span>
        </div>

        {/* Desktop nav */}
        <nav className="desk-nav" style={{ gap: 2 }}>
          {navItems.map(n => (
            <button key={n.id} className={`nav-btn ${dashPage === n.id ? "on" : ""}`} onClick={() => setDashPage(n.id)}>
              <span style={{ fontSize: 14 }}>{n.icon}</span> {n.label}
              {n.id === "messages" && <span style={{ background: "#7c3aed", color: "white", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 99 }}>3</span>}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <button className="btn-icon" style={{ width: 34, height: 34 }} onClick={() => setNotifOpen(p => !p)}>
              🔔
              {unread > 0 && <span style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, background: "#ef4444", borderRadius: "50%", border: `2px solid ${T.bg}` }} />}
            </button>
            {notifOpen && (
              <div className="card-flat fade-in notif-dropdown" style={{ position: "absolute", right: 0, top: 42, width: 300, zIndex: 300, overflow: "hidden" }}>
                <div style={{ padding: "13px 16px 10px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Notifications</span>
                  <button onClick={() => setNotifs(p => p.map(n => ({ ...n, read: true })))} style={{ background: "none", border: "none", cursor: "pointer", color: "#7c3aed", fontSize: 11, fontFamily: "inherit", fontWeight: 600 }}>Mark all read </button>
                </div>
                {notifs.map((n, i) => (
                  <div key={n.id} style={{ padding: "11px 16px", borderBottom: i < notifs.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 10, background: n.read ? "transparent" : dark ? "rgba(124,58,237,0.04)" : "rgba(124,58,237,0.03)" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: n.read ? T.text3 : hsl(n.hue), marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: n.read ? T.text3 : T.text, lineHeight: 1.4 }}>{n.text}</div>
                      <div style={{ fontSize: 10, color: T.text3, marginTop: 3 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn-icon" style={{ width: 34, height: 34 }} onClick={() => setDark(p => !p)}>{dark ? "☀️" : "🌙"}</button>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(168,85,247,0.2))", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#c4b5fd", cursor: "pointer" }} onClick={() => setDashPage("profile")}>
            {currentUser.name[0]}
          </div>
        </div>
      </header>

      <main className="db-main" style={{ flex: 1, maxWidth: 1060, margin: "0 auto", width: "100%", padding: "28px 20px", position: "relative", zIndex: 1 }}>

        {/* ── DISCOVER ── */}
        {dashPage === "discover" && (
          <div className="fade-up">
            <div className="discover-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#7c3aed", marginBottom: 7 }}>● Live Matching</div>
                <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, color: T.text, letterSpacing: "-0.8px", lineHeight: 1.1 }}>Discover Builders</h1>
                <p style={{ fontSize: 13, color: T.text3, marginTop: 4 }}>Ranked by your real-time match score</p>
              </div>
              <div className="discover-filters" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <div className="discover-search" style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: T.text3 }}>🔍</span>
                  <input className="input" placeholder="Search..." value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ paddingLeft: 32, width: 180 }} />
                </div>
                <select className="select discover-select" value={filterSkill} onChange={e => setFilterSkill(e.target.value)}>
                  <option value="All">All Skills</option>
                  {SKILLS_ALL.map(s => <option key={s}>{s}</option>)}
                </select>
                <select className="select discover-select" value={filterLooking} onChange={e => setFilterLooking(e.target.value)}>
                  <option value="All">All Roles</option>
                  <option>Collaborator</option><option>Mentor</option><option>Mentee</option>
                </select>
              </div>
            </div>

            <div className="stats-row" style={{ display: "flex", gap: 14, marginBottom: 24 }}>
              {[{ v: `${filtered.length}`, l: "Showing" }, { v: "3,204", l: "Total online" }, { v: `${MOCK_USERS.filter(u => u.online).length}`, l: "Active now" }].map((s, i) => (
                <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 18px", display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, color: T.text }}>{s.v}</span>
                  <span style={{ fontSize: 11, color: T.text3 }}>{s.l}</span>
                </div>
              ))}
            </div>

            <div className="discover-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
              {filtered.map((u, i) => (
                <div key={u.id} className="card fade-up" style={{ padding: 20, position: "relative", overflow: "hidden", animationDelay: `${i * 0.06}s` }}>
                  <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle,${hsla(u.hue, 70, 60, dark ? 0.08 : 0.05)} 0%,transparent 70%)`, pointerEvents: "none" }} />
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ position: "relative" }}>
                      <Avatar u={u} size={48} radius={13} />
                      <div style={{ position: "absolute", bottom: -1, right: -1, width: 8, height: 8, borderRadius: "50%", background: u.online ? "#22c55e" : "#555570", border: `2px solid ${T.bg}` }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>@{u.handle}</div>
                      <div style={{ fontSize: 11, color: hsl(u.hue), fontWeight: 500, marginTop: 2 }}>{u.role}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: hsl(u.hue), lineHeight: 1 }}>{u.matchScore}%</div>
                      <div style={{ fontSize: 9, color: T.text3, marginTop: 1 }}>match</div>
                    </div>
                  </div>
                  <div className="match-track" style={{ marginBottom: 14 }}><div style={{ height: "100%", width: `${u.matchScore}%`, background: `linear-gradient(90deg,hsl(${u.hue},70%,45%),hsl(${u.hue},80%,65%))`, borderRadius: 99, transition: "width 1s" }} /></div>
                  <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 13 }}>{u.bio}</p>
                  <div style={{ marginBottom: 9 }}><Lbl>Has</Lbl><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{u.skillsHave.map(s => <span key={s} className="pill skill-have">{s}</span>)}</div></div>
                  <div style={{ marginBottom: 13 }}><Lbl>Needs</Lbl><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{u.skillsNeed.map(s => <span key={s} className="pill skill-need">{s}</span>)}</div></div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 13, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, color: T.text3 }}>📍 {u.location}</span>
                    <span style={{ fontSize: 11, color: T.text3 }}>📁 {u.projects} projects</span>
                    <span style={{ fontSize: 11, color: T.text3 }}>⭐ {u.followers}</span>
                  </div>
                  <div style={{ marginBottom: 13 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: hsla(u.hue, 70, 60, dark ? 0.12 : 0.08), border: `1px solid ${hsla(u.hue, 70, 60, 0.25)}`, color: hsl(u.hue) }}>Seeking {u.lookingFor}</span>
                  </div>
                  {aiText[u.id] && (
                    <div className="fade-in" style={{ background: T.aiBg, border: `1px solid ${T.aiBorder}`, borderRadius: 12, padding: "11px 13px", marginBottom: 13 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", marginBottom: 5 }}>✦ AI MATCH INSIGHT</div>
                      <p style={{ fontSize: 11, color: dark ? "#b0a8d8" : "#6b5b9e", lineHeight: 1.55 }}>{aiText[u.id]}</p>
                    </div>
                  )}
                  <div className="card-actions" style={{ display: "flex", gap: 7 }}>
                    {connected[u.id]
                      ? <button className="btn-ghost" style={{ flex: 1, color: "#4ade80", borderColor: "rgba(74,222,128,0.3)" }} disabled>✓ Connected</button>
                      : <button className="btn-primary" style={{ flex: 1, padding: "8px" }} onClick={() => setConnected(p => ({ ...p, [u.id]: true }))}>Connect</button>
                    }
                    <button className="btn-icon" style={{ color: liked[u.id] ? "#f87171" : "inherit", borderColor: liked[u.id] ? "rgba(248,113,113,0.3)" : undefined }} onClick={() => setLiked(p => ({ ...p, [u.id]: !p[u.id] }))}>♥</button>
                    <button className="btn-icon" onClick={() => handleAI(u)}>{aiLoading === u.id ? <span className="spin" style={{ fontSize: 12 }}>✦</span> : "✦"}</button>
                    <button className="btn-icon" onClick={() => { const c = convos.find(c => c.user.id === u.id) || { id: convos.length + 1, user: u, messages: [{ id: 1, from: "them", text: `Hey! I saw your profile. Would love to connect! 👋`, time: "now" }] }; if (!convos.find(c => c.user.id === u.id)) setConvos(p => [c, ...p]); setActiveConvo(c); setDashPage("messages"); }}>💬</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MESSAGES ── */}
        {dashPage === "messages" && (
          <div className="fade-up msg-layout" style={{ display: "flex", gap: 16, height: "calc(100vh - 130px)" }}>
            {/* Sidebar */}
            <div className={`card-flat msg-sidebar ${mobileConvoOpen ? "" : "open"}`} style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: T.text, marginBottom: 10 }}>Messages</div>
                <input className="input" placeholder="Search..." style={{ fontSize: 12 }} />
              </div>
              <div style={{ overflowY: "auto", flex: 1, padding: "6px 6px" }}>
                {convos.map(c => (
                  <div key={c.id} className={`sidebar-item ${activeConvo.id === c.id ? "on" : ""}`} onClick={() => { setActiveConvo(c); setMobileConvoOpen(true); }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <Avatar u={c.user} size={38} radius={10} />
                      <div style={{ position: "absolute", bottom: -1, right: -1, width: 7, height: 7, borderRadius: "50%", background: c.user.online ? "#22c55e" : "#555", border: `2px solid ${T.bg}` }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.user.name.split(" ")[0]}</span>
                        <span style={{ fontSize: 10, color: T.text3 }}>{c.messages[c.messages.length - 1]?.time}</span>
                      </div>
                      <div style={{ fontSize: 11, color: T.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.messages[c.messages.length - 1]?.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat pane */}
            <div className="card-flat" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", ...(mobileConvoOpen ? {} : { display: "none" }) }}>
              <div style={{ padding: "13px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                {/* Mobile back */}
                <button className="mobile-back-btn btn-icon" onClick={() => setMobileConvoOpen(false)} style={{ display: "none", marginRight: 2 }}>←</button>
                <div style={{ position: "relative" }}>
                  <Avatar u={activeConvo.user} size={38} radius={10} />
                  <div style={{ position: "absolute", bottom: -1, right: -1, width: 7, height: 7, borderRadius: "50%", background: activeConvo.user.online ? "#22c55e" : "#555", border: `2px solid ${T.bg}` }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: T.text }}>{activeConvo.user.name}</div>
                  <div style={{ fontSize: 11, color: activeConvo.user.online ? "#22c55e" : T.text3 }}>{activeConvo.user.online ? "● Online" : "● Away"}</div>
                </div>
                <div className="msg-chat-header-actions" style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: hsla(activeConvo.user.hue, 70, 60, dark ? 0.12 : 0.08), border: `1px solid ${hsla(activeConvo.user.hue, 70, 60, 0.25)}`, color: hsl(activeConvo.user.hue) }}>{calculateMatchScore(currentUser, activeConvo.user)}%</span>
                </div>
              </div>
              <div style={{ padding: "9px 18px", borderBottom: `1px solid ${T.border}`, background: dark ? "rgba(124,58,237,0.04)" : "rgba(124,58,237,0.03)", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12 }}>✦</span>
                <span style={{ fontSize: 11, color: dark ? "#8070aa" : "#6b5b9e" }}>Matched on <strong style={{ color: "#a78bfa" }}>{currentUser.skillsHave[0]}</strong> ↔ <strong style={{ color: "#a78bfa" }}>{activeConvo.user.skillsHave[0]}</strong></span>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "18px", display: "flex", flexDirection: "column", gap: 10 }}>
                {currentConvo.messages.map((m, i) => (
                  <div key={m.id} className="fade-up" style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start", animationDelay: `${i * 0.03}s` }}>
                    <div style={{ padding: "10px 14px", borderRadius: 15, fontSize: 13, lineHeight: 1.5, maxWidth: "75%", background: m.from === "me" ? T.msgMe : T.msgThem, color: m.from === "me" ? "white" : T.text, borderBottomRightRadius: m.from === "me" ? 4 : 15, borderBottomLeftRadius: m.from === "them" ? 4 : 15, border: m.from === "them" ? `1px solid ${T.border}` : "none" }}>
                      {m.text}
                      <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4, textAlign: m.from === "me" ? "right" : "left" }}>{m.time}</div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div style={{ padding: "11px 14px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, flexShrink: 0 }}>
                <input className="input" placeholder={`Message ${activeConvo.user.name.split(" ")[0]}...`} value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} style={{ flex: 1 }} />
                <button className="btn-primary" onClick={sendMsg} style={{ padding: "9px 16px", flexShrink: 0 }}>↑</button>
              </div>
            </div>

            {/* Right mini-profile — hidden on mobile */}
            <div className="card-flat msg-right-panel" style={{ width: 210, flexShrink: 0, padding: 16, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
              <div style={{ textAlign: "center" }}>
                <Avatar u={activeConvo.user} size={52} radius={14} />
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginTop: 10 }}>{activeConvo.user.name}</div>
                <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{activeConvo.user.role}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Instrument Serif',serif", color: hsl(activeConvo.user.hue), marginTop: 6 }}>{calculateMatchScore(currentUser, activeConvo.user)}% match</div>
              </div>
              <div className="divider" style={{ margin: "0" }} />
              <div><Lbl>Their Skills</Lbl><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{activeConvo.user.skillsHave.map(s => <span key={s} className="pill skill-have" style={{ fontSize: 10 }}>{s}</span>)}</div></div>
              <div><Lbl>They Need</Lbl><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{activeConvo.user.skillsNeed.map(s => <span key={s} className="pill skill-need" style={{ fontSize: 10 }}>{s}</span>)}</div></div>
              <div className="divider" style={{ margin: "0" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "center" }}>
                <div><div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: T.text }}>{activeConvo.user.projects}</div><div style={{ fontSize: 10, color: T.text3 }}>Projects</div></div>
                <div><div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: T.text }}>{activeConvo.user.followers}</div><div style={{ fontSize: 10, color: T.text3 }}>Followers</div></div>
              </div>
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {dashPage === "profile" && (
          <div className="fade-up" style={{ maxWidth: 700, margin: "0 auto" }}>
            <div className="card-flat" style={{ padding: 22, marginBottom: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: dark ? "linear-gradient(135deg,rgba(124,58,237,0.06),transparent)" : "linear-gradient(135deg,rgba(124,58,237,0.04),transparent)", pointerEvents: "none" }} />
              <div className="profile-header-row" style={{ display: "flex", gap: 18, alignItems: "flex-start", position: "relative" }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,rgba(124,58,237,0.2),rgba(168,85,247,0.1))", border: "2px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#c4b5fd", flexShrink: 0 }}>
                  {currentUser.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: T.text }}>{currentUser.name}</div>
                  <div style={{ fontSize: 12, color: T.text3, marginTop: 3 }}>@{currentUser.handle} · {currentUser.role}</div>
                  <p style={{ fontSize: 13, color: T.text2, marginTop: 6, lineHeight: 1.5 }}>{currentUser.bio}</p>
                  <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
                    <span className="pill" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa", fontSize: 11 }}>● Open to Collaborate</span>
                    <span className="pill" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b", fontSize: 11 }}>Seeking {currentUser.skillsNeed[0]}</span>
                  </div>
                </div>
                <button className="btn-ghost" style={{ fontSize: 12, flexShrink: 0 }} onClick={() => setDashPage("settings")}>Edit</button>
              </div>
              <div className="profile-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", marginTop: 20, paddingTop: 18, borderTop: `1px solid ${T.border}` }}>
                {[{ v: "12", l: "Connections" }, { v: String(currentUser.projects), l: "Projects" }, { v: "87%", l: "Avg Match" }, { v: "248", l: "Views" }].map((s, i) => (
                  <div key={i} style={{ textAlign: "center", borderRight: i < 3 ? `1px solid ${T.border}` : "none" }}>
                    <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, color: T.text }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="profile-skills-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div className="card-flat" style={{ padding: 16 }}><Lbl>Skills I Have</Lbl><div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{currentUser.skillsHave.map(s => <span key={s} className="pill skill-have">{s}</span>)}</div></div>
              <div className="card-flat" style={{ padding: 16 }}><Lbl>Skills I Need</Lbl><div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{currentUser.skillsNeed.map(s => <span key={s} className="pill skill-need">{s}</span>)}</div></div>
            </div>

            <div className="card-flat" style={{ padding: 20 }}>
              <div className="profile-tabs" style={{ display: "flex", gap: 4, marginBottom: 18, borderBottom: `1px solid ${T.border}`, paddingBottom: 12 }}>
                {["projects", "activity", "connections"].map(t => <button key={t} className={`tab ${profileTab === t ? "on" : ""}`} onClick={() => setProfileTab(t)} style={{ textTransform: "capitalize" }}>{t}</button>)}
              </div>
              {profileTab === "projects" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[{ n: "AI Project Management Tool", d: "Real-time PM with AI task generation, Supabase backend, and Kanban.", tags: ["Next.js", "Supabase", "AI"], stars: 24, status: "Live" }, { n: "Developer Portfolio OS", d: "Interactive portfolio with Claude API chatbot, MDX blog, GitHub stats.", tags: ["Next.js", "Claude API", "MDX"], stars: 41, status: "Live" }, { n: "SkillMatch Network", d: "AI-powered developer matching platform.", tags: ["React", "TypeScript", "Gemini"], stars: 8, status: "Building" }].map((p, i) => (
                    <div key={i} style={{ padding: 16, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: 13, border: `1px solid ${T.border}` }}>
                      <div className="profile-projects-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, gap: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{p.n}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: p.status === "Live" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${p.status === "Live" ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)"}`, color: p.status === "Live" ? "#4ade80" : "#fbbf24" }}>{p.status}</span>
                          <span style={{ fontSize: 11, color: T.text3 }}>★ {p.stars}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 8 }}>{p.d}</p>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{p.tags.map(t => <span key={t} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: T.text2 }}>{t}</span>)}</div>
                    </div>
                  ))}
                </div>
              )}
              {profileTab === "activity" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[{ a: "Connected with", t: "Rohan Mehra", time: "2h ago", hue: 340 }, { a: "New 89% match —", t: "Rohan Mehra", time: "5h ago", hue: 340 }, { a: "Sent request to", t: "Priya Nair", time: "1d ago", hue: 158 }, { a: "Updated skills:", t: "Added TypeScript", time: "2d ago", hue: 259 }].map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 13px", background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: 11 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: hsl(a.hue), flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: T.text2, flex: 1 }}>{a.a} <span style={{ color: T.text, fontWeight: 500 }}>{a.t}</span></span>
                      <span style={{ fontSize: 10, color: T.text3 }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              )}
              {profileTab === "connections" && (
                <div className="connections-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {MOCK_USERS.slice(0, 4).map(u => (
                    <div key={u.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "11px 13px", background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: 12, border: `1px solid ${T.border}` }}>
                      <Avatar u={u} size={34} radius={9} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{u.name.split(" ")[0]}</div>
                        <div style={{ fontSize: 10, color: T.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.role}</div>
                      </div>
                      <button className="btn-ghost" style={{ fontSize: 10, padding: "4px 10px", flexShrink: 0 }} onClick={() => { const c = convos.find(c => c.user.id === u.id) || CONVERSATIONS[0]; setActiveConvo(c); setDashPage("messages"); }}>Chat</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {dashPage === "settings" && (
          <div className="fade-up" style={{ maxWidth: 680, margin: "0 auto" }}>
            <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, color: T.text, marginBottom: 20 }}>Settings</h1>
            <div className="settings-layout" style={{ display: "flex", gap: 16 }}>
              <div className="card-flat settings-sidebar" style={{ width: 180, flexShrink: 0, padding: 10 }}>
                <div className="settings-sidebar-inner">
                  {[{ id: "account", icon: "👤", l: "Account" }, { id: "profile", icon: "✏️", l: "Profile" }, { id: "skills", icon: "⚡", l: "Skills" }, { id: "appearance", icon: "🎨", l: "Appearance" }, { id: "notifications", icon: "🔔", l: "Notifications" }, { id: "privacy", icon: "🔒", l: "Privacy" }].map(s => (
                    <button key={s.id} className={`sidebar-item settings-sidebar-btn ${settingsTab === s.id ? "on" : ""}`} onClick={() => setSettingsTab(s.id)}>
                      <span style={{ fontSize: 15 }}>{s.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: settingsTab === s.id ? T.text : T.text3 }}>{s.l}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="card-flat fade-in" style={{ flex: 1, padding: 22 }} key={settingsTab}>
                {settingsTab === "account" && <>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 18 }}>Account</h2>
                  <Field label="Email" id="s_email" type="email" value={formData.email || "you@example.com"} onChange={v => upd("email", v)} />
                  <Field label="Password" id="s_pass" type="password" placeholder="Change password..." value="" onChange={() => { }} />
                  <div className="divider" />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
                    <div><div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Two-factor auth</div><div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>Extra layer of security</div></div>
                    <button className="toggle-switch" style={{ background: "#7c3aed" }}><div className="toggle-thumb" style={{ left: 23 }} /></button>
                  </div>
                  <div className="divider" />
                  <button className="btn-primary" style={{ padding: "10px 20px", fontSize: 13 }}>Save Changes</button>
                </>}
                {settingsTab === "profile" && <>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 18 }}>Edit Profile</h2>
                  <Field label="Full Name" id="s_name" value={currentUser.name} onChange={v => setCurrentUser(p => ({ ...p, name: v }))} />
                  <Field label="Username" id="s_handle" value={currentUser.handle} onChange={v => setCurrentUser(p => ({ ...p, handle: v }))} prefix="@" />
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Bio</label>
                    <textarea className="input" rows={3} value={currentUser.bio} onChange={e => setCurrentUser(p => ({ ...p, bio: e.target.value }))} />
                  </div>
                  <Field label="Location" id="s_loc" value={currentUser.location || ""} onChange={v => setCurrentUser(p => ({ ...p, location: v }))} />
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 8 }}>Looking for</label>
                    <div className="looking-row" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {["Collaborator", "Mentor", "Mentee"].map(l => (
                        <button key={l} onClick={() => setCurrentUser(p => ({ ...p, lookingFor: l }))} style={{ padding: "7px 16px", borderRadius: 10, border: `1px solid ${currentUser.lookingFor === l ? "rgba(124,58,237,0.5)" : T.border}`, background: currentUser.lookingFor === l ? dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.07)" : "transparent", color: currentUser.lookingFor === l ? "#a78bfa" : T.text3, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <button className="btn-primary" style={{ padding: "10px 20px", fontSize: 13 }} onClick={() => setDashPage("profile")}>Save & View Profile</button>
                </>}
                {settingsTab === "skills" && <>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>Your Skills</h2>
                  <p style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>Updating skills recalculates all match scores instantly.</p>
                  <div style={{ marginBottom: 20 }}>
                    <Lbl>Skills I Have ({currentUser.skillsHave.length}/6)</Lbl>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>{currentUser.skillsHave.map(s => <span key={s} className="pill skill-have" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }} onClick={() => setCurrentUser(p => ({ ...p, skillsHave: p.skillsHave.filter(x => x !== s) }))}>{s} <span style={{ opacity: 0.6, fontSize: 10 }}>✕</span></span>)}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{SKILLS_ALL.filter(s => !currentUser.skillsHave.includes(s)).slice(0, 12).map(s => <button key={s} className="skill-chip" onClick={() => { if (currentUser.skillsHave.length < 6) setCurrentUser(p => ({ ...p, skillsHave: [...p.skillsHave, s] })) }}>{s}</button>)}</div>
                  </div>
                  <div className="divider" />
                  <div>
                    <Lbl>Skills I Need ({currentUser.skillsNeed.length}/6)</Lbl>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>{currentUser.skillsNeed.map(s => <span key={s} className="pill skill-need" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }} onClick={() => setCurrentUser(p => ({ ...p, skillsNeed: p.skillsNeed.filter(x => x !== s) }))}>{s} <span style={{ opacity: 0.6, fontSize: 10 }}>✕</span></span>)}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{SKILLS_ALL.filter(s => !currentUser.skillsNeed.includes(s)).slice(0, 12).map(s => <button key={s} className="skill-chip" onClick={() => { if (currentUser.skillsNeed.length < 6) setCurrentUser(p => ({ ...p, skillsNeed: [...p.skillsNeed, s] })) }}>{s}</button>)}</div>
                  </div>
                </>}
                {settingsTab === "appearance" && <>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 18 }}>Appearance</h2>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
                    <div><div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Dark Mode</div><div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>Switch between themes</div></div>
                    <button className="toggle-switch" style={{ background: dark ? "#7c3aed" : T.border }} onClick={() => setDark(p => !p)}><div className="toggle-thumb" style={{ left: dark ? 23 : 3 }} /></button>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                    {[{ l: "Dark", bg: "#060608", c: "#e2e2ef" }, { l: "Light", bg: "#f5f5f9", c: "#1a1a2e" }].map(t => (
                      <div key={t.l} onClick={() => setDark(t.l === "Dark")} style={{ flex: 1, padding: 16, borderRadius: 14, background: t.bg, border: `2px solid ${(dark && t.l === "Dark") || (!dark && t.l === "Light") ? "#7c3aed" : T.border}`, cursor: "pointer", textAlign: "center" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: t.c }}>{t.l}</div>
                        <div style={{ width: 40, height: 5, borderRadius: 3, background: "#7c3aed", margin: "8px auto 0" }} />
                      </div>
                    ))}
                  </div>
                </>}
                {settingsTab === "notifications" && <>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 18 }}>Notifications</h2>
                  {[{ l: "New match found", d: "When AI finds a high-scoring match", on: true }, { l: "Connection requests", d: "When someone wants to connect", on: true }, { l: "Messages", d: "When you receive a new message", on: true }, { l: "Weekly digest", d: "Summary of your top matches", on: false }, { l: "Profile views", d: "When someone views your profile", on: false }].map((n, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: i < 4 ? `1px solid ${T.border}` : "none" }}>
                      <div><div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{n.l}</div><div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{n.d}</div></div>
                      <button className="toggle-switch" style={{ background: n.on ? "#7c3aed" : dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}><div className="toggle-thumb" style={{ left: n.on ? 23 : 3 }} /></button>
                    </div>
                  ))}
                </>}
                {settingsTab === "privacy" && <>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 18 }}>Privacy</h2>
                  {[{ l: "Public profile", d: "Anyone can see your profile", on: true }, { l: "Show online status", d: "Let others see when you're active", on: true }, { l: "Discoverable", d: "Appear in match results", on: true }, { l: "Show location", d: "Display your city on your profile", on: false }].map((n, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: i < 3 ? `1px solid ${T.border}` : "none" }}>
                      <div><div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{n.l}</div><div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{n.d}</div></div>
                      <button className="toggle-switch" style={{ background: n.on ? "#7c3aed" : dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}><div className="toggle-thumb" style={{ left: n.on ? 23 : 3 }} /></button>
                    </div>
                  ))}
                  <div className="divider" />
                  <button style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", padding: "10px 20px", borderRadius: 11, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>Sign out</button>
                </>}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="mob-bottom-nav" style={{ display: "none", justifyContent: "space-around", alignItems: "center" }}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => { setDashPage(n.id); setMobileConvoOpen(false); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "6px 16px", borderRadius: 10, transition: "all 0.2s", color: dashPage === n.id ? "#a78bfa" : T.text3 }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, fontFamily: "'Instrument Sans',sans-serif" }}>{n.label}</span>
            {dashPage === n.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#7c3aed" }} />}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Dashboard;