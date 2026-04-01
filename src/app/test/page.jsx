'use client'
import { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════
   SKILLMATCH — Complete App
   Pages: Landing → SignIn/SignUp → Onboarding → 
          Dashboard (Discover · Messages · Profile · Settings)
   Features: Dark/Light mode · Functional navigation ·
             Real matching algorithm · Working forms
══════════════════════════════════════════════════ */

// ── Data ─────────────────────────────────────────
const SKILLS_ALL = ["React","Next.js","TypeScript","Node.js","Python","Rust","Go","UI/UX Design","Figma","GraphQL","PostgreSQL","MongoDB","Redis","DevOps","AWS","Docker","Machine Learning","Web3","Flutter","Swift","Tailwind CSS","Vue.js","Svelte","Three.js","Solidity","Kotlin","Unity"];

const MOCK_USERS = [
  { id:1, name:"Aanya Sharma", handle:"aanya.dev", role:"Full Stack Engineer", avatar:"AS", hue:259, bio:"I build SaaS tools that people actually want to use. Obsessed with DX, clean APIs, and shipping fast.", skillsHave:["React","Next.js","Node.js","PostgreSQL"], skillsNeed:["UI/UX Design","Figma","Machine Learning"], lookingFor:"Collaborator", location:"Bangalore, IN", github:"aanya-dev", projects:3, followers:128, online:true },
  { id:2, name:"Rohan Mehra", handle:"rohan.ui", role:"Design Engineer", avatar:"RM", hue:340, bio:"Designer who writes production code. Built 2 design systems used by 10k+ devs.", skillsHave:["UI/UX Design","Figma","React","Tailwind CSS"], skillsNeed:["Node.js","PostgreSQL","DevOps"], lookingFor:"Collaborator", location:"Mumbai, IN", github:"rohan-designs", projects:5, followers:342, online:true },
  { id:3, name:"Priya Nair", handle:"priya.ml", role:"ML Engineer", avatar:"PN", hue:158, bio:"Turning research papers into products. My AI tools have been used in production at 3 startups.", skillsHave:["Machine Learning","Python","AWS","Docker"], skillsNeed:["React","TypeScript","Next.js"], lookingFor:"Mentor", location:"Hyderabad, IN", github:"priya-ml", projects:7, followers:201, online:false },
  { id:4, name:"Dev Kapoor", handle:"dev.sys", role:"Systems Engineer", avatar:"DK", hue:38, bio:"Distributed systems, high throughput APIs, and the occasional Rust rant.", skillsHave:["Rust","Go","Docker","Redis","AWS"], skillsNeed:["React","UI/UX Design","TypeScript"], lookingFor:"Collaborator", location:"Delhi, IN", github:"dev-systems", projects:4, followers:97, online:false },
  { id:5, name:"Sara Chen", handle:"sara.web3", role:"Web3 Developer", avatar:"SC", hue:271, bio:"Building the decentralized future, one smart contract at a time. Open to mentoring frontend devs.", skillsHave:["Web3","TypeScript","React","Solidity"], skillsNeed:["DevOps","AWS","Machine Learning"], lookingFor:"Mentee", location:"Remote", github:"sara-web3", projects:9, followers:456, online:true },
  { id:6, name:"Karan Patel", handle:"karan.mob", role:"Mobile Developer", avatar:"KP", hue:316, bio:"5 apps, 50k+ downloads. Flutter specialist who crafts delightful mobile experiences.", skillsHave:["Flutter","Swift","Firebase","Dart"], skillsNeed:["Machine Learning","Node.js","GraphQL"], lookingFor:"Collaborator", location:"Pune, IN", github:"karan-mobile", projects:6, followers:183, online:false },
];

const CONVERSATIONS = [
  { id:1, user: MOCK_USERS[1], messages:[
    {id:1,from:"them",text:"Hey! Saw your PM tool on GitHub — the real-time sync is smooth. How did you handle conflict resolution?",time:"10:32"},
    {id:2,from:"me",text:"Thanks! Used operational transforms with Supabase Realtime. Took a while but worth it.",time:"10:34"},
    {id:3,from:"them",text:"Would you be open to a collab? I need backend for my design system.",time:"10:35"},
    {id:4,from:"me",text:"Absolutely! I've been looking for a design partner. Your component library is exactly what I need.",time:"10:37"},
    {id:5,from:"them",text:"Perfect. Call this weekend? I'll drop a Figma link.",time:"10:38"},
  ]},
  { id:2, user: MOCK_USERS[0], messages:[
    {id:1,from:"them",text:"Hi! Loved your portfolio. The animations are super clean 🔥",time:"Yesterday"},
    {id:2,from:"me",text:"Thank you! I spent way too long on those transitions haha",time:"Yesterday"},
    {id:3,from:"them",text:"Can we collab on something? I have a SaaS idea that needs a frontend person.",time:"2h ago"},
  ]},
  { id:3, user: MOCK_USERS[2], messages:[
    {id:1,from:"them",text:"Hey, I saw you need ML skills. I'm looking for a React dev to help me build a UI for my model.",time:"3h ago"},
    {id:2,from:"me",text:"That's perfect actually! I've been wanting to learn more about ML integrations.",time:"2h ago"},
  ]},
];

const NOTIFS = [
  {id:1, text:"Aanya Sharma wants to connect", time:"2m ago", read:false, hue:259, type:"connect"},
  {id:2, text:"New 94% match — Rohan Mehra", time:"15m ago", read:false, hue:340, type:"match"},
  {id:3, text:"Priya Nair accepted your request", time:"1h ago", read:true, hue:158, type:"accept"},
  {id:4, text:"Rohan Mehra sent you a message", time:"3h ago", read:true, hue:340, type:"message"},
];

// ── Matching Algorithm ────────────────────────────
function calculateMatchScore(me, them) {
  let theyHaveWhatINeed = 0;
  for (const skill of (me.skillsNeed || [])) {
    if ((them.skillsHave || []).includes(skill)) theyHaveWhatINeed++;
  }
  let iHaveWhatTheyNeed = 0;
  for (const skill of (them.skillsNeed || [])) {
    if ((me.skillsHave || []).includes(skill)) iHaveWhatTheyNeed++;
  }
  const total = theyHaveWhatINeed + iHaveWhatTheyNeed;
  const maxPossible = (me.skillsNeed?.length || 0) + (them.skillsNeed?.length || 0);
  if (maxPossible === 0) return 0;
  let score = (total / maxPossible) * 100;
  if (me.lookingFor === them.lookingFor) score += 10;
  return Math.round(Math.min(100, score));
}

// ── Theme tokens ──────────────────────────────────
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

const hsl = (h,s=70,l=60) => `hsl(${h},${s}%,${l}%)`;
const hsla = (h,s=70,l=60,a=0.12) => `hsla(${h},${s}%,${l}%,${a})`;

// ── Main App ──────────────────────────────────────
export default function App() {
  const [view, setView] = useState("landing");
  const [dark, setDark] = useState(true);
  const T = dark ? DARK : LIGHT;

  // Auth / onboarding state
  const [authTab, setAuthTab] = useState("signin");
  const [onboardStep, setOnboardStep] = useState(0);
  const [formData, setFormData] = useState({ email:"", password:"", confirm:"", name:"", handle:"", bio:"", role:"", lookingFor:"Collaborator", skillsHave:[], skillsNeed:[] });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Dashboard state
  const [dashPage, setDashPage] = useState("discover");
  const [currentUser, setCurrentUser] = useState({ name:"You", handle:"yourhandle", role:"Frontend Developer", skillsHave:["React","Next.js","TypeScript"], skillsNeed:["UI/UX Design","Machine Learning"], lookingFor:"Collaborator", bio:"Building cool stuff.", location:"Meerut, IN", projects:3, followers:42 });
  const [connected, setConnected] = useState({});
  const [liked, setLiked] = useState({});
  const [filterSkill, setFilterSkill] = useState("All");
  const [filterLooking, setFilterLooking] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [aiLoading, setAiLoading] = useState(null);
  const [aiText, setAiText] = useState({});
  const [activeConvo, setActiveConvo] = useState(CONVERSATIONS[0]);
  const [convos, setConvos] = useState(CONVERSATIONS);
  const [msgInput, setMsgInput] = useState("");
  const [notifs, setNotifs] = useState(NOTIFS);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileTab, setProfileTab] = useState("projects");
  const [settingsTab, setSettingsTab] = useState("account");
  const [skillSearchH, setSkillSearchH] = useState("");
  const [skillSearchN, setSkillSearchN] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({behavior:"smooth"}); }, [activeConvo, convos]);

  // Matching
  const rankedUsers = MOCK_USERS.map(u => ({ ...u, matchScore: calculateMatchScore(currentUser, u) })).sort((a,b)=>b.matchScore-a.matchScore);
  const filtered = rankedUsers.filter(u => {
    const sk = filterSkill==="All" || u.skillsHave.includes(filterSkill) || u.skillsNeed.includes(filterSkill);
    const lk = filterLooking==="All" || u.lookingFor===filterLooking;
    const sq = !searchQ || u.name.toLowerCase().includes(searchQ.toLowerCase()) || u.role.toLowerCase().includes(searchQ.toLowerCase());
    return sk && lk && sq;
  });

  const upd = (k,v) => setFormData(p=>({...p,[k]:v}));
  const clrErr = k => setErrors(p=>{const n={...p};delete n[k];return n;});

  const validateAuth = () => {
    const e = {};
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email="Valid email required";
    if (formData.password.length < 8) e.password="Min 8 characters";
    if (authTab==="signup" && formData.password !== formData.confirm) e.confirm="Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAuth = () => {
    if (!validateAuth()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      if (authTab==="signup") { setView("onboard"); setOnboardStep(0); }
      else { setView("dashboard"); setDashPage("discover"); }
    }, 1000);
  };

  const handleOnboardNext = () => {
    const e = {};
    if (onboardStep===0 && !formData.name.trim()) e.name="Name required";
    if (onboardStep===0 && !formData.handle.trim()) e.handle="Handle required";
    if (onboardStep===1 && !formData.role) e.role="Select a role";
    if (onboardStep===2 && formData.skillsHave.length===0) e.skillsHave="Add at least one skill";
    if (onboardStep===3 && formData.skillsNeed.length===0) e.skillsNeed="Add at least one skill";
    setErrors(e);
    if (Object.keys(e).length>0) return;
    if (onboardStep < 4) { setOnboardStep(p=>p+1); return; }
    setSubmitting(true);
    setTimeout(() => {
      setCurrentUser(p => ({ ...p, name:formData.name, handle:formData.handle, bio:formData.bio, role:formData.role, lookingFor:formData.lookingFor, skillsHave:formData.skillsHave, skillsNeed:formData.skillsNeed }));
      setSubmitting(false);
      setView("dashboard");
      setDashPage("discover");
    }, 1000);
  };

  const toggleSkill = (key, skill) => {
    const cur = formData[key];
    if (cur.includes(skill)) upd(key, cur.filter(s=>s!==skill));
    else if (cur.length < 6) upd(key, [...cur, skill]);
  };

  const handleAI = (user) => {
    setAiLoading(user.id);
    const msgs = [
      `Your ${currentUser.skillsHave[0]} expertise is exactly what ${user.name.split(" ")[0]} needs, and their ${user.skillsHave[0]} fills your top skill gap. This is a rare two-way complementary match.`,
      `${user.name.split(" ")[0]} has shipped ${user.projects} projects and brings deep ${user.skillsHave[0]} knowledge you're missing. You cover their ${user.skillsNeed[0]} gap completely.`,
      `Strong goal alignment — you're both ${user.lookingFor}s. Your complementary stacks mean you could start building immediately without major skill overlaps.`,
    ];
    setTimeout(() => { setAiText(p=>({...p,[user.id]:msgs[user.id%3]})); setAiLoading(null); }, 1200);
  };

  const sendMsg = () => {
    if (!msgInput.trim()) return;
    setConvos(p => p.map(c => c.id===activeConvo.id ? { ...c, messages:[...c.messages,{id:c.messages.length+1,from:"me",text:msgInput,time:"now"}] } : c));
    setActiveConvo(p => ({...p, messages:[...p.messages,{id:p.messages.length+1,from:"me",text:msgInput,time:"now"}]}));
    setMsgInput("");
  };

  // ── STYLES ─────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:${dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.15)"};border-radius:99px}
    input,textarea,select{font-family:'Instrument Sans',sans-serif}
    textarea{resize:none}
    select option{background:${dark?"#1a1a2e":"#fff"}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes ticker{0%{opacity:0;transform:translateY(8px)}15%,85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-8px)}}
    .fade-up{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both}
    .fade-in{animation:fadeIn 0.3s ease both}
    .float{animation:float 4s ease-in-out infinite}
    .spin{animation:spin 0.9s linear infinite;display:inline-block}
    .ticker{animation:ticker 3s ease-in-out infinite}
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
    .input:focus{border-color:rgba(124,58,237,0.6);background:${dark?"rgba(255,255,255,0.07)":"rgba(124,58,237,0.04)"}}
    .input::placeholder{color:${T.text3}}
    .select{background:${T.input};border:1px solid ${T.inputBorder};color:${T.text2};padding:8px 12px;border-radius:10px;font-size:12px;font-family:inherit;outline:none;cursor:pointer}
    .nav-btn{background:none;border:none;color:${T.text3};cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;padding:8px 13px;border-radius:10px;display:flex;align-items:center;gap:7px;transition:all 0.2s}
    .nav-btn:hover{color:${T.text};background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)"}}
    .nav-btn.on{color:${dark?"#e0d8ff":"#7c3aed"};background:${dark?"rgba(124,58,237,0.12)":"rgba(124,58,237,0.08)"}}
    .pill{padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600}
    .skill-have{background:${T.skillHaveBg};border:1px solid ${T.skillHaveBorder};color:${T.skillHaveText}}
    .skill-need{background:${T.skillNeedBg};border:1px solid ${T.skillNeedBorder};color:${T.skillNeedText}}
    .skill-chip{padding:6px 13px;border-radius:99px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid ${T.border};background:transparent;color:${T.text3};transition:all 0.15s;font-family:inherit}
    .skill-chip:hover{border-color:rgba(124,58,237,0.4);color:${T.text};background:rgba(124,58,237,0.08)}
    .skill-chip.sel-have{background:${T.skillHaveBg};border-color:${T.skillHaveBorder};color:${T.skillHaveText}}
    .skill-chip.sel-need{background:${T.skillNeedBg};border-color:${T.skillNeedBorder};color:${T.skillNeedText}}
    .tab{background:none;border:none;color:${T.text3};cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;padding:7px 15px;border-radius:8px;transition:all 0.2s}
    .tab:hover{color:${T.text}}
    .tab.on{background:${dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)"};color:${T.text}}
    .sidebar-item{display:flex;align-items:center;gap:11px;padding:11px 13px;border-radius:13px;cursor:pointer;transition:all 0.2s;border:1px solid transparent}
    .sidebar-item:hover{background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"}}
    .sidebar-item.on{background:${dark?"rgba(255,255,255,0.06)":"rgba(124,58,237,0.07)"};border-color:${T.border}}
    .role-card{background:${T.input};border:1px solid ${T.border};border-radius:14px;padding:14px 18px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:13px}
    .role-card:hover{border-color:rgba(124,58,237,0.3)}
    .role-card.on{background:${dark?"rgba(124,58,237,0.1)":"rgba(124,58,237,0.07)"};border-color:rgba(124,58,237,0.4)}
    .look-card{background:${T.input};border:1px solid ${T.border};border-radius:14px;padding:15px;cursor:pointer;transition:all 0.2s;text-align:center}
    .look-card:hover{border-color:rgba(124,58,237,0.3)}
    .look-card.on{background:${dark?"rgba(124,58,237,0.1)":"rgba(124,58,237,0.07)"};border-color:rgba(124,58,237,0.4)}
    .social-btn{background:${T.input};border:1px solid ${T.inputBorder};color:${T.text};padding:10px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:9px;flex:1}
    .social-btn:hover{border-color:${T.border2}}
    .match-track{height:3px;background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)"};border-radius:99px;overflow:hidden}
    .divider{height:1px;background:${T.border};margin:18px 0}
    .toggle-switch{width:44px;height:24px;border-radius:12px;border:none;cursor:pointer;position:relative;transition:background 0.3s;flex-shrink:0}
    .toggle-thumb{width:18px;height:18px;border-radius:50%;background:white;position:absolute;top:3px;transition:left 0.25s cubic-bezier(0.34,1.56,0.64,1)}
  `;

  // ── Shared components ─────────────────────────
  const Lbl = ({children}) => <div style={{fontSize:11,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:T.text3,marginBottom:7}}>{children}</div>;
  const Err = ({msg}) => msg ? <div style={{fontSize:11,color:"#f87171",marginTop:5}}>⚠ {msg}</div> : null;

  const Field = ({label,id,type="text",placeholder,value,onChange,error,hint,prefix}) => (
    <div style={{marginBottom:18}}>
      <label style={{display:"block",fontSize:12,fontWeight:600,color:T.text2,marginBottom:6}}>{label}</label>
      <div style={{position:"relative"}}>
        {prefix && <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:13,color:T.text3}}>@</span>}
        <input className="input" id={id} type={type} placeholder={placeholder} value={value}
          onChange={e=>{onChange(e.target.value);if(error)clrErr(id);}}
          style={{paddingLeft:prefix?"28px":"14px",borderColor:error?"rgba(248,113,113,0.5)":undefined}}/>
      </div>
      <Err msg={error}/>
      {hint && !error && <div style={{fontSize:11,color:T.text3,marginTop:4}}>{hint}</div>}
    </div>
  );

  const Avatar = ({u,size=44,radius=12}) => (
    <div style={{width:size,height:size,borderRadius:radius,background:hsla(u.hue,70,60,dark?0.15:0.12),border:`1.5px solid ${hsla(u.hue,70,60,0.3)}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.3,fontWeight:700,color:hsl(u.hue),flexShrink:0,fontFamily:"'Instrument Serif',serif"}}>
      {u.avatar}
    </div>
  );

  const OnlineDot = ({online}) => <div style={{width:8,height:8,borderRadius:"50%",background:online?"#22c55e":"#555570",border:`2px solid ${T.bg}`,flexShrink:0}}/>;

  // ── LANDING ───────────────────────────────────
  if (view==="landing") return (
    <div style={{fontFamily:"'Instrument Sans',sans-serif",background:T.bg,color:T.text,minHeight:"100vh"}}>
      <style>{css}</style>
      <style>{`
        .feat-card{background:${T.card};border:1px solid ${T.border};border-radius:18px;padding:24px;transition:all 0.3s}
        .feat-card:hover{border-color:rgba(124,58,237,0.3);transform:translateY(-3px);box-shadow:${T.shadow}}
        .landing-nav{background:${T.navBg};backdrop-filter:blur(24px);border-bottom:1px solid ${T.border}}
      `}</style>

      {/* Ambient */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",top:"-15%",left:"-5%",width:600,height:600,borderRadius:"50%",background:`radial-gradient(circle,${dark?"hsla(259,70%,35%,0.12)":"hsla(259,70%,60%,0.06)"} 0%,transparent 65%)`}}/>
        <div style={{position:"absolute",bottom:"-10%",right:"-5%",width:500,height:500,borderRadius:"50%",background:`radial-gradient(circle,${dark?"hsla(300,60%,30%,0.08)":"hsla(300,60%,60%,0.05)"} 0%,transparent 65%)`}}/>
        {dark&&<svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.025}} xmlns="http://www.w3.org/2000/svg"><defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>}
      </div>

      {/* Nav */}
      <nav className="landing-nav" style={{position:"sticky",top:0,zIndex:100,padding:"0 32px",height:62,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#7c3aed,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(124,58,237,0.35)",fontSize:17}}>⚡</div>
          <span style={{fontFamily:"'Instrument Serif',serif",fontSize:18,color:T.text,letterSpacing:"-0.3px"}}>SkillMatch</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button className="btn-icon" onClick={()=>setDark(p=>!p)} style={{width:38,height:38}} title="Toggle theme">
            {dark?"☀️":"🌙"}
          </button>
          <button className="btn-ghost" style={{padding:"8px 18px",fontSize:13}} onClick={()=>{setAuthTab("signin");setView("auth")}}>Sign in</button>
          <button className="btn-primary" style={{padding:"8px 18px"}} onClick={()=>{setAuthTab("signup");setView("auth")}}>Get started free →</button>
        </div>
      </nav>

      <div style={{position:"relative",zIndex:1}}>
        {/* Hero */}
        <section style={{maxWidth:1060,margin:"0 auto",padding:"90px 32px 70px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:70,alignItems:"center"}}>
          <div className="fade-up">
            <div style={{display:"inline-flex",alignItems:"center",gap:8,background:dark?"rgba(124,58,237,0.12)":"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.25)",borderRadius:99,padding:"5px 14px",marginBottom:26}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 8px #22c55e"}}/>
              <span style={{fontSize:11,fontWeight:700,color:"#a78bfa",letterSpacing:"0.5px",textTransform:"uppercase"}}>3,200+ builders online</span>
            </div>
            <h1 style={{fontFamily:"'Instrument Serif',serif",fontSize:52,fontWeight:400,lineHeight:1.08,letterSpacing:"-1.5px",color:T.text,marginBottom:20}}>
              Find the builder<br/>who <span style={{fontStyle:"italic",color:"#a78bfa"}}>completes</span><br/>your stack
            </h1>
            <p style={{fontSize:15,color:T.text2,lineHeight:1.65,marginBottom:32,maxWidth:420}}>SkillMatch pairs developers using AI — matching by what you have and what you need, so you stop searching and start building.</p>
            <div style={{display:"flex",gap:10,marginBottom:32,flexWrap:"wrap"}}>
              <button className="btn-primary" style={{padding:"12px 26px",fontSize:14}} onClick={()=>{setAuthTab("signup");setView("auth")}}>Start matching free →</button>
              <button className="btn-ghost" onClick={()=>{setView("dashboard");setDashPage("discover")}}>Preview dashboard ▶</button>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{display:"flex"}}>{[259,340,158,38,271].map((h,i)=><div key={i} style={{width:28,height:28,borderRadius:8,background:hsla(h,70,60,0.2),border:`2px solid ${hsla(h,70,60,0.4)}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:hsl(h),marginLeft:i>0?-7:0}}>{"ASRPDSK"[i*2]}</div>)}</div>
              <span style={{fontSize:12,color:T.text3}}>Joined by <strong style={{color:T.text2}}>847 builders</strong> this month</span>
            </div>
          </div>

          {/* Hero card */}
          <div className="fade-up float" style={{animationDelay:"0.15s"}}>
            <div className="card-flat" style={{padding:22,boxShadow:T.shadow}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                <span style={{fontSize:11,fontWeight:700,color:"#a78bfa",letterSpacing:"1px",textTransform:"uppercase"}}>Top match today</span>
                <span style={{fontFamily:"'Instrument Serif',serif",fontSize:24,color:"#a78bfa"}}>94%</span>
              </div>
              <div style={{display:"flex",gap:13,alignItems:"center",marginBottom:14}}>
                <Avatar u={MOCK_USERS[0]} size={50} radius={14}/>
                <div><div style={{fontSize:15,fontWeight:700,color:T.text}}>Aanya Sharma</div><div style={{fontSize:12,color:hsl(259),fontWeight:500}}>Full Stack Engineer · Bangalore</div></div>
              </div>
              <div className="match-track" style={{marginBottom:14}}><div style={{height:"100%",width:"94%",background:"linear-gradient(90deg,hsl(259,70%,45%),hsl(290,70%,65%))",borderRadius:99}}/></div>
              <p style={{fontSize:12,color:T.text2,lineHeight:1.5,marginBottom:13}}>Building SaaS tools. Needs UI/UX help, and you have exactly that.</p>
              <div style={{marginBottom:10}}><Lbl>Has</Lbl><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{["React","Node.js","PostgreSQL"].map(s=><span key={s} className="pill skill-have">{s}</span>)}</div></div>
              <div style={{marginBottom:14}}><Lbl>Needs</Lbl><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{["UI/UX Design","Figma"].map(s=><span key={s} className="pill skill-need">{s}</span>)}</div></div>
              <div style={{background:T.aiBg,border:`1px solid ${T.aiBorder}`,borderRadius:12,padding:"11px 13px",marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:"#a78bfa",marginBottom:5}}>✦ AI MATCH INSIGHT</div>
                <p style={{fontSize:11,color:dark?"#b0a8d8":"#6b5b9e",lineHeight:1.5}}>Your React skills fill Aanya's frontend gap. Her backend depth covers your weakness. Rare two-way match.</p>
              </div>
              <button className="btn-primary" style={{width:"100%"}} onClick={()=>{setAuthTab("signup");setView("auth")}}>Connect →</button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 70px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
            {[{v:"3,200+",l:"Active Builders"},{v:"94%",l:"Match Accuracy"},{v:"847",l:"Projects Shipped"},{v:"40+",l:"Countries"}].map((s,i)=>(
              <div key={i} className="card-flat" style={{padding:"20px 24px",textAlign:"center"}}>
                <div style={{fontFamily:"'Instrument Serif',serif",fontSize:36,color:T.text,letterSpacing:"-1px",lineHeight:1}}>{s.v}</div>
                <div style={{fontSize:12,color:T.text3,marginTop:7}}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 90px"}}>
          <div style={{textAlign:"center",marginBottom:50}}>
            <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:40,color:T.text,letterSpacing:"-1px",lineHeight:1.1}}>Built for builders<br/><span style={{fontStyle:"italic",color:"#a78bfa"}}>who ship</span></h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {[
              {icon:"⚡",t:"AI-Powered Matching",d:"Our model surfaces builders you'll actually ship with — matched by skills, goals and work style."},
              {icon:"🎯",t:"Skill Gap Pairing",d:"We match by what you have AND what you need, creating two-way complementary partnerships."},
              {icon:"💬",t:"Real-Time Chat",d:"Chat with context — always see why you matched right above every conversation."},
              {icon:"🔮",t:"Match Insights",d:"AI explains every match in plain English so you can decide in seconds, not days."},
              {icon:"🚀",t:"Project Rooms",d:"Spin up a shared space to plan tasks and track progress without leaving the platform."},
              {icon:"🌐",t:"Global Network",d:"3,200+ builders across 40+ countries. Someone's always online and ready to build."},
            ].map((f,i)=>(
              <div key={i} className="feat-card fade-up" style={{animationDelay:`${i*0.07}s`}}>
                <div style={{fontSize:26,marginBottom:14}}>{f.icon}</div>
                <h3 style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:8}}>{f.t}</h3>
                <p style={{fontSize:12,color:T.text2,lineHeight:1.6}}>{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{maxWidth:700,margin:"0 auto",padding:"0 32px 100px",textAlign:"center"}}>
          <div style={{background:dark?"rgba(124,58,237,0.07)":"rgba(124,58,237,0.05)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:24,padding:"52px 40px"}}>
            <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:40,color:T.text,letterSpacing:"-1px",lineHeight:1.1,marginBottom:14}}>Ready to find your<br/><span style={{fontStyle:"italic",color:"#a78bfa"}}>co-builder?</span></h2>
            <p style={{fontSize:14,color:T.text2,marginBottom:30}}>Free forever for indie builders. No credit card needed.</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="btn-primary" style={{padding:"13px 28px",fontSize:14}} onClick={()=>{setAuthTab("signup");setView("auth")}}>Create your profile →</button>
              <button className="btn-ghost" onClick={()=>{setView("dashboard");setDashPage("discover")}}>Preview app</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  // ── AUTH ──────────────────────────────────────
  if (view==="auth") return (
    <div style={{fontFamily:"'Instrument Sans',sans-serif",background:T.bg,color:T.text,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <style>{css}</style>
      <div style={{position:"fixed",inset:0,pointerEvents:"none"}}><div style={{position:"absolute",top:"-20%",left:"-10%",width:600,height:600,borderRadius:"50%",background:`radial-gradient(circle,${dark?"hsla(259,70%,35%,0.1)":"hsla(259,70%,60%,0.06)"} 0%,transparent 65%)`}}/></div>

      <nav style={{padding:"0 28px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,zIndex:100,background:T.navBg,backdropFilter:"blur(20px)"}}>
        <button onClick={()=>setView("landing")} style={{display:"flex",alignItems:"center",gap:9,background:"none",border:"none",cursor:"pointer"}}>
          <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#7c3aed,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚡</div>
          <span style={{fontFamily:"'Instrument Serif',serif",fontSize:16,color:T.text}}>SkillMatch</span>
        </button>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button className="btn-icon" onClick={()=>setDark(p=>!p)} style={{width:34,height:34}}>{dark?"☀️":"🌙"}</button>
          <button onClick={()=>setView("landing")} style={{background:"none",border:"none",cursor:"pointer",color:T.text3,fontSize:13,fontFamily:"inherit"}}>← Back</button>
        </div>
      </nav>

      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px",position:"relative",zIndex:1}}>
        <div className="fade-up" style={{width:"100%",maxWidth:420}}>
          {/* Tabs */}
          <div style={{display:"flex",background:T.bg3,borderRadius:13,padding:4,marginBottom:28,border:`1px solid ${T.border}`}}>
            {["signin","signup"].map(t=>(
              <button key={t} onClick={()=>setAuthTab(t)} style={{flex:1,padding:"9px",borderRadius:10,border:"none",fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.2s",background:authTab===t?(dark?"rgba(255,255,255,0.07)":T.bg2):"transparent",color:authTab===t?T.text:T.text3,boxShadow:authTab===t?T.shadow:"none"}}>
                {t==="signin"?"Sign In":"Sign Up"}
              </button>
            ))}
          </div>

          <div className="card-flat" style={{padding:28}}>
            <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:24,color:T.text,marginBottom:6}}>
              {authTab==="signin"?"Welcome back":"Create your account"}
            </h2>
            <p style={{fontSize:12,color:T.text3,marginBottom:22}}>
              {authTab==="signin"?"Sign in to continue to SkillMatch":"Join 3,200+ builders on SkillMatch — free forever"}
            </p>

            {/* Social */}
            <div style={{display:"flex",gap:8,marginBottom:4}}>
              <button className="social-btn"><span>🐙</span> GitHub</button>
              <button className="social-btn"><span>🔵</span> Google</button>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12,margin:"16px 0"}}>
              <div className="divider" style={{flex:1,margin:0}}/>
              <span style={{fontSize:11,color:T.text3,whiteSpace:"nowrap"}}>or with email</span>
              <div className="divider" style={{flex:1,margin:0}}/>
            </div>

            <Field label="Email" id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={v=>upd("email",v)} error={errors.email}/>
            <Field label="Password" id="password" type="password" placeholder="••••••••" value={formData.password} onChange={v=>upd("password",v)} error={errors.password} hint={authTab==="signup"?"Min 8 characters":undefined}/>
            {authTab==="signup" && <Field label="Confirm Password" id="confirm" type="password" placeholder="Repeat password" value={formData.confirm} onChange={v=>upd("confirm",v)} error={errors.confirm}/>}

            {authTab==="signin" && <div style={{textAlign:"right",marginTop:-10,marginBottom:16}}><button style={{background:"none",border:"none",cursor:"pointer",color:"#7c3aed",fontSize:12,fontFamily:"inherit"}}>Forgot password?</button></div>}

            {authTab==="signup" && (
              <div style={{marginBottom:16}}>
                <label style={{display:"flex",gap:8,alignItems:"flex-start",cursor:"pointer",fontSize:12,color:T.text2}}>
                  <input type="checkbox" style={{marginTop:2,accentColor:"#7c3aed"}}/>
                  <span>I agree to the <span style={{color:"#a78bfa"}}>Terms</span> and <span style={{color:"#a78bfa"}}>Privacy Policy</span></span>
                </label>
              </div>
            )}

            <button className="btn-primary" style={{width:"100%",padding:12}} onClick={handleAuth} disabled={submitting}>
              {submitting ? <span className="spin">⌛</span> : authTab==="signin" ? "Sign in →" : "Create account →"}
            </button>
          </div>

          <div style={{textAlign:"center",marginTop:16,fontSize:12,color:T.text3}}>
            {authTab==="signin"?"Don't have an account?":"Already have one?"}
            {" "}<button onClick={()=>setAuthTab(authTab==="signin"?"signup":"signin")} style={{background:"none",border:"none",color:"#a78bfa",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600}}>
              {authTab==="signin"?"Sign up free":"Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── ONBOARDING ────────────────────────────────
  if (view==="onboard") {
    const STEPS = ["Identity","Role","Your Skills","You Need","Review"];
    return (
      <div style={{fontFamily:"'Instrument Sans',sans-serif",background:T.bg,color:T.text,minHeight:"100vh"}}>
        <style>{css}</style>
        <div style={{position:"fixed",inset:0,pointerEvents:"none"}}><div style={{position:"absolute",top:"-10%",right:0,width:500,height:500,borderRadius:"50%",background:`radial-gradient(circle,${dark?"hsla(259,70%,35%,0.1)":"hsla(259,70%,60%,0.05)"} 0%,transparent 65%)`}}/></div>

        <nav style={{padding:"0 28px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${T.border}`,background:T.navBg,backdropFilter:"blur(20px)"}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#7c3aed,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚡</div>
            <span style={{fontFamily:"'Instrument Serif',serif",fontSize:16,color:T.text}}>SkillMatch</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:12,color:T.text3}}>Step {onboardStep+1} / {STEPS.length}</span>
            <button className="btn-icon" onClick={()=>setDark(p=>!p)} style={{width:34,height:34}}>{dark?"☀️":"🌙"}</button>
          </div>
        </nav>

        {/* Progress */}
        <div style={{height:3,background:T.border}}><div style={{height:"100%",background:"linear-gradient(90deg,#7c3aed,#a855f7)",transition:"width 0.4s cubic-bezier(0.34,1.56,0.64,1)",width:`${(onboardStep/4)*100}%`}}/></div>

        <div style={{maxWidth:560,margin:"0 auto",padding:"44px 20px",position:"relative",zIndex:1}}>
          {/* Step dots */}
          <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:36}}>
            {STEPS.map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:26,height:26,borderRadius:99,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,transition:"all 0.3s",background:i<onboardStep?"linear-gradient(135deg,#7c3aed,#a855f7)":i===onboardStep?dark?"rgba(124,58,237,0.2)":"rgba(124,58,237,0.1)":T.bg3,border:i===onboardStep?"1px solid rgba(124,58,237,0.5)":`1px solid ${T.border}`,color:i<=onboardStep?"#c4a8ff":T.text3}}>
                  {i<onboardStep?"✓":i+1}
                </div>
                {i<STEPS.length-1&&<div style={{width:20,height:1,background:i<onboardStep?"rgba(124,58,237,0.5)":T.border}}/>}
              </div>
            ))}
          </div>

          <div className="fade-up" key={onboardStep}>
            {/* Step 0 */}
            {onboardStep===0&&<>
              <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:28,color:T.text,marginBottom:6}}>Set up your profile</h2>
              <p style={{fontSize:13,color:T.text3,marginBottom:28}}>Tell us who you are so we can find your best matches.</p>
              <Field label="Full name" id="name" placeholder="Aanya Sharma" value={formData.name} onChange={v=>upd("name",v)} error={errors.name}/>
              <Field label="Username" id="handle" placeholder="aanya.dev" value={formData.handle} onChange={v=>upd("handle",v)} error={errors.handle} prefix="@"/>
              <div style={{marginBottom:18}}>
                <label style={{display:"block",fontSize:12,fontWeight:600,color:T.text2,marginBottom:6}}>Short bio <span style={{color:T.text3,fontWeight:400}}>(optional)</span></label>
                <textarea className="input" rows={3} placeholder="I build SaaS tools and love clean TypeScript..." value={formData.bio} onChange={e=>upd("bio",e.target.value)}/>
              </div>
            </>}

            {/* Step 1 */}
            {onboardStep===1&&<>
              <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:28,color:T.text,marginBottom:6}}>What's your role?</h2>
              <p style={{fontSize:13,color:T.text3,marginBottom:22}}>Helps us show you the most relevant matches.</p>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                {[{v:"Frontend Developer",i:"🎨",d:"UI, components, design systems"},{v:"Backend Developer",i:"⚙️",d:"APIs, databases, infrastructure"},{v:"Full Stack Developer",i:"🔧",d:"Both frontend and backend"},{v:"Design Engineer",i:"✏️",d:"UI/UX, Figma, design systems"},{v:"ML / AI Engineer",i:"🤖",d:"Models, pipelines, data science"},{v:"Mobile Developer",i:"📱",d:"iOS, Android, Flutter"},{v:"DevOps Engineer",i:"☁️",d:"Cloud, CI/CD, infrastructure"}].map(r=>(
                  <div key={r.v} className={`role-card ${formData.role===r.v?"on":""}`} onClick={()=>{upd("role",r.v);clrErr("role")}}>
                    <span style={{fontSize:20}}>{r.i}</span>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:formData.role===r.v?"#c4a8ff":T.text}}>{r.v}</div><div style={{fontSize:11,color:T.text3,marginTop:1}}>{r.d}</div></div>
                    {formData.role===r.v&&<span style={{color:"#7c3aed",fontSize:15}}>✓</span>}
                  </div>
                ))}
              </div>
              <Err msg={errors.role}/>
              <div style={{marginTop:20}}>
                <label style={{display:"block",fontSize:12,fontWeight:600,color:T.text2,marginBottom:10}}>Looking for</label>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {[{v:"Collaborator",i:"🤝"},{v:"Mentor",i:"🎓"},{v:"Mentee",i:"🌱"}].map(l=>(
                    <div key={l.v} className={`look-card ${formData.lookingFor===l.v?"on":""}`} onClick={()=>upd("lookingFor",l.v)}>
                      <div style={{fontSize:22,marginBottom:6}}>{l.i}</div>
                      <div style={{fontSize:12,fontWeight:600,color:formData.lookingFor===l.v?"#c4a8ff":T.text}}>{l.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>}

            {/* Step 2 */}
            {onboardStep===2&&<>
              <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:28,color:T.text,marginBottom:6}}>What can you build?</h2>
              <p style={{fontSize:13,color:T.text3,marginBottom:20}}>Select up to 6 skills you're strong in.</p>
              {formData.skillsHave.length>0&&<div style={{marginBottom:16}}>
                <Lbl>Selected ({formData.skillsHave.length}/6)</Lbl>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {formData.skillsHave.map(s=><span key={s} className="pill skill-have" style={{cursor:"pointer",display:"flex",alignItems:"center",gap:5}} onClick={()=>toggleSkill("skillsHave",s)}>{s} <span style={{opacity:0.6,fontSize:10}}>✕</span></span>)}
                </div>
              </div>}
              <input className="input" placeholder="Search skills..." value={skillSearchH} onChange={e=>setSkillSearchH(e.target.value)} style={{marginBottom:12}}/>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,maxHeight:220,overflowY:"auto"}}>
                {SKILLS_ALL.filter(s=>s.toLowerCase().includes(skillSearchH.toLowerCase())).map(s=>(
                  <button key={s} className={`skill-chip ${formData.skillsHave.includes(s)?"sel-have":""}`} onClick={()=>toggleSkill("skillsHave",s)} disabled={!formData.skillsHave.includes(s)&&formData.skillsHave.length>=6}>{s}</button>
                ))}
              </div>
              <Err msg={errors.skillsHave}/>
            </>}

            {/* Step 3 */}
            {onboardStep===3&&<>
              <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:28,color:T.text,marginBottom:6}}>What do you need?</h2>
              <p style={{fontSize:13,color:T.text3,marginBottom:20}}>Select skills you're looking for in a collaborator.</p>
              {formData.skillsNeed.length>0&&<div style={{marginBottom:16}}>
                <Lbl>Selected ({formData.skillsNeed.length}/6)</Lbl>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {formData.skillsNeed.map(s=><span key={s} className="pill skill-need" style={{cursor:"pointer",display:"flex",alignItems:"center",gap:5}} onClick={()=>toggleSkill("skillsNeed",s)}>{s} <span style={{opacity:0.6,fontSize:10}}>✕</span></span>)}
                </div>
              </div>}
              <input className="input" placeholder="Search skills..." value={skillSearchN} onChange={e=>setSkillSearchN(e.target.value)} style={{marginBottom:12}}/>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,maxHeight:220,overflowY:"auto"}}>
                {SKILLS_ALL.filter(s=>s.toLowerCase().includes(skillSearchN.toLowerCase())).map(s=>(
                  <button key={s} className={`skill-chip ${formData.skillsNeed.includes(s)?"sel-need":""}`} onClick={()=>toggleSkill("skillsNeed",s)} disabled={!formData.skillsNeed.includes(s)&&formData.skillsNeed.length>=6}>{s}</button>
                ))}
              </div>
              <Err msg={errors.skillsNeed}/>
            </>}

            {/* Step 4 */}
            {onboardStep===4&&<>
              <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:28,color:T.text,marginBottom:6}}>Looking good, <span style={{fontStyle:"italic",color:"#a78bfa"}}>{formData.name||"Builder"}</span>!</h2>
              <p style={{fontSize:13,color:T.text3,marginBottom:22}}>Review your profile before we launch matching.</p>
              <div className="card-flat" style={{padding:22,marginBottom:16}}>
                <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${T.border}`}}>
                  <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,rgba(124,58,237,0.2),rgba(168,85,247,0.1))",border:"2px solid rgba(124,58,237,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#c4b5fd"}}>{(formData.name||"?")[0]}</div>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,color:T.text}}>{formData.name||"—"}</div>
                    <div style={{fontSize:12,color:"#7c3aed",marginTop:2}}>@{formData.handle||"—"}</div>
                    {formData.role&&<div style={{fontSize:11,color:T.text3,marginTop:2}}>{formData.role}</div>}
                  </div>
                  {formData.lookingFor&&<span style={{marginLeft:"auto",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:99,background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.25)",color:"#a78bfa"}}>Seeking {formData.lookingFor}</span>}
                </div>
                {formData.bio&&<p style={{fontSize:12,color:T.text2,lineHeight:1.5,marginBottom:14}}>{formData.bio}</p>}
                {formData.skillsHave.length>0&&<div style={{marginBottom:10}}><Lbl>Has</Lbl><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{formData.skillsHave.map(s=><span key={s} className="pill skill-have">{s}</span>)}</div></div>}
                {formData.skillsNeed.length>0&&<div><Lbl>Needs</Lbl><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{formData.skillsNeed.map(s=><span key={s} className="pill skill-need">{s}</span>)}</div></div>}
              </div>
              <div style={{background:T.aiBg,border:`1px solid ${T.aiBorder}`,borderRadius:12,padding:"12px 14px"}}>
                <p style={{fontSize:12,color:dark?"#b0a8d8":"#6b5b9e",lineHeight:1.6}}>✦ Once you submit, AI matching starts immediately. You'll see your first matches in seconds.</p>
              </div>
            </>}

            {/* Nav */}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:28}}>
              {onboardStep>0
                ? <button className="btn-ghost" onClick={()=>setOnboardStep(p=>p-1)}>← Back</button>
                : <div/>}
              <button className="btn-primary" onClick={handleOnboardNext} disabled={submitting}>
                {submitting?"Launching...":(onboardStep===4?"🚀 Launch profile →":"Continue →")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ─────────────────────────────────
  if (view==="dashboard") {
    const unread = notifs.filter(n=>!n.read).length;
    const currentConvo = convos.find(c=>c.id===activeConvo.id) || convos[0];

    return (
      <div style={{fontFamily:"'Instrument Sans',sans-serif",background:T.bg,color:T.text,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
        <style>{css}</style>

        {/* Ambient */}
        <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
          <div style={{position:"absolute",top:"-15%",left:"-5%",width:500,height:500,borderRadius:"50%",background:`radial-gradient(circle,${dark?"hsla(259,70%,35%,0.08)":"hsla(259,70%,60%,0.05)"} 0%,transparent 65%)`}}/>
          <div style={{position:"absolute",bottom:"-10%",right:0,width:400,height:400,borderRadius:"50%",background:`radial-gradient(circle,${dark?"hsla(300,60%,30%,0.06)":"hsla(300,60%,60%,0.04)"} 0%,transparent 65%)`}}/>
        </div>

        {/* Topnav */}
        <header style={{position:"sticky",top:0,zIndex:200,background:T.navBg,backdropFilter:"blur(24px)",borderBottom:`1px solid ${T.border}`,padding:"0 22px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <button onClick={()=>setView("landing")} style={{display:"flex",alignItems:"center",gap:9,background:"none",border:"none",cursor:"pointer"}}>
            <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#7c3aed,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚡</div>
            <span style={{fontFamily:"'Instrument Serif',serif",fontSize:16,color:T.text}}>SkillMatch</span>
          </button>

          <nav style={{display:"flex",gap:2}}>
            {[{id:"discover",icon:"🧭",label:"Discover"},{id:"messages",icon:"💬",label:"Messages"},{id:"profile",icon:"👤",label:"Profile"},{id:"settings",icon:"⚙️",label:"Settings"}].map(n=>(
              <button key={n.id} className={`nav-btn ${dashPage===n.id?"on":""}`} onClick={()=>setDashPage(n.id)}>
                <span style={{fontSize:14}}>{n.icon}</span> {n.label}
                {n.id==="messages"&&convos.some(c=>c.messages[c.messages.length-1]?.from==="them")&&<span style={{background:"#7c3aed",color:"white",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:99}}>3</span>}
              </button>
            ))}
          </nav>

          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{position:"relative"}}>
              <button className="btn-icon" style={{width:34,height:34}} onClick={()=>setNotifOpen(p=>!p)}>
                🔔
                {unread>0&&<span style={{position:"absolute",top:5,right:5,width:7,height:7,background:"#ef4444",borderRadius:"50%",border:`2px solid ${T.bg}`}}/>}
              </button>
              {notifOpen&&(
                <div className="card-flat fade-in" style={{position:"absolute",right:0,top:42,width:300,zIndex:300,overflow:"hidden"}}>
                  <div style={{padding:"13px 16px 10px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:13,fontWeight:600,color:T.text}}>Notifications</span>
                    <button onClick={()=>{setNotifs(p=>p.map(n=>({...n,read:true})));}} style={{background:"none",border:"none",cursor:"pointer",color:"#7c3aed",fontSize:11,fontFamily:"inherit",fontWeight:600}}>Mark all read</button>
                  </div>
                  {notifs.map((n,i)=>(
                    <div key={n.id} style={{padding:"11px 16px",borderBottom:i<notifs.length-1?`1px solid ${T.border}`:"none",display:"flex",gap:10,background:n.read?"transparent":dark?"rgba(124,58,237,0.04)":"rgba(124,58,237,0.03)"}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:n.read?T.text3:hsl(n.hue),marginTop:5,flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,color:n.read?T.text3:T.text,lineHeight:1.4}}>{n.text}</div>
                        <div style={{fontSize:10,color:T.text3,marginTop:3}}>{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="btn-icon" style={{width:34,height:34}} onClick={()=>setDark(p=>!p)}>{dark?"☀️":"🌙"}</button>
            <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,rgba(124,58,237,0.3),rgba(168,85,247,0.2))",border:"1px solid rgba(124,58,237,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#c4b5fd",cursor:"pointer"}} onClick={()=>setDashPage("profile")}>
              {currentUser.name[0]}
            </div>
          </div>
        </header>

        <main style={{flex:1,maxWidth:1060,margin:"0 auto",width:"100%",padding:"28px 20px",position:"relative",zIndex:1}}>

          {/* ── DISCOVER ── */}
          {dashPage==="discover"&&(
            <div className="fade-up">
              <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:14}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:"#7c3aed",marginBottom:7}}>● Live Matching</div>
                  <h1 style={{fontFamily:"'Instrument Serif',serif",fontSize:32,color:T.text,letterSpacing:"-0.8px",lineHeight:1.1}}>Discover Builders</h1>
                  <p style={{fontSize:13,color:T.text3,marginTop:4}}>Ranked by your real-time match score</p>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <div style={{position:"relative"}}>
                    <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13,color:T.text3}}>🔍</span>
                    <input className="input" placeholder="Search..." value={searchQ} onChange={e=>setSearchQ(e.target.value)} style={{paddingLeft:32,width:180}}/>
                  </div>
                  <select className="select" value={filterSkill} onChange={e=>setFilterSkill(e.target.value)}>
                    <option value="All">All Skills</option>
                    {SKILLS_ALL.map(s=><option key={s}>{s}</option>)}
                  </select>
                  <select className="select" value={filterLooking} onChange={e=>setFilterLooking(e.target.value)}>
                    <option value="All">All Roles</option>
                    <option>Collaborator</option><option>Mentor</option><option>Mentee</option>
                  </select>
                </div>
              </div>

              {/* Stats row */}
              <div style={{display:"flex",gap:14,marginBottom:24,flexWrap:"wrap"}}>
                {[{v:`${filtered.length}`,l:"Showing"},{v:"3,204",l:"Total online"},{v:`${MOCK_USERS.filter(u=>u.online).length}`,l:"Active now"}].map((s,i)=>(
                  <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"10px 18px",display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{fontFamily:"'Instrument Serif',serif",fontSize:20,color:T.text}}>{s.v}</span>
                    <span style={{fontSize:11,color:T.text3}}>{s.l}</span>
                  </div>
                ))}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
                {filtered.map((u,i)=>(
                  <div key={u.id} className={`card fade-up stagger-${Math.min(i+1,6)}`} style={{padding:20,position:"relative",overflow:"hidden",animationDelay:`${i*0.06}s`}}>
                    <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:`radial-gradient(circle,${hsla(u.hue,70,60,dark?0.08:0.05)} 0%,transparent 70%)`,pointerEvents:"none"}}/>

                    <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:14}}>
                      <div style={{position:"relative"}}>
                        <Avatar u={u} size={48} radius={13}/>
                        <OnlineDot online={u.online} style={{position:"absolute",bottom:-1,right:-1}}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:14,fontWeight:700,color:T.text}}>{u.name}</div>
                        <div style={{fontSize:11,color:T.text3,marginTop:1}}>@{u.handle}</div>
                        <div style={{fontSize:11,color:hsl(u.hue),fontWeight:500,marginTop:2}}>{u.role}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontFamily:"'Instrument Serif',serif",fontSize:22,color:hsl(u.hue),lineHeight:1}}>{u.matchScore}%</div>
                        <div style={{fontSize:9,color:T.text3,marginTop:1}}>match</div>
                      </div>
                    </div>

                    <div className="match-track" style={{marginBottom:14}}><div style={{height:"100%",width:`${u.matchScore}%`,background:`linear-gradient(90deg,hsl(${u.hue},70%,45%),hsl(${u.hue},80%,65%))`,borderRadius:99,transition:"width 1s"}}/></div>

                    <p style={{fontSize:12,color:T.text2,lineHeight:1.55,marginBottom:13}}>{u.bio}</p>

                    <div style={{marginBottom:9}}><Lbl>Has</Lbl><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{u.skillsHave.map(s=><span key={s} className="pill skill-have">{s}</span>)}</div></div>
                    <div style={{marginBottom:13}}><Lbl>Needs</Lbl><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{u.skillsNeed.map(s=><span key={s} className="pill skill-need">{s}</span>)}</div></div>

                    <div style={{display:"flex",gap:12,marginBottom:13,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,color:T.text3}}>📍 {u.location}</span>
                      <span style={{fontSize:11,color:T.text3}}>📁 {u.projects} projects</span>
                      <span style={{fontSize:11,color:T.text3}}>⭐ {u.followers}</span>
                    </div>

                    <div style={{marginBottom:13}}>
                      <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:99,background:hsla(u.hue,70,60,dark?0.12:0.08),border:`1px solid ${hsla(u.hue,70,60,0.25)}`,color:hsl(u.hue)}}>Seeking {u.lookingFor}</span>
                    </div>

                    {aiText[u.id]&&(
                      <div className="fade-in" style={{background:T.aiBg,border:`1px solid ${T.aiBorder}`,borderRadius:12,padding:"11px 13px",marginBottom:13}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#a78bfa",marginBottom:5}}>✦ AI MATCH INSIGHT</div>
                        <p style={{fontSize:11,color:dark?"#b0a8d8":"#6b5b9e",lineHeight:1.55}}>{aiText[u.id]}</p>
                      </div>
                    )}

                    <div style={{display:"flex",gap:7}}>
                      {connected[u.id]
                        ? <button className="btn-ghost" style={{flex:1,color:"#4ade80",borderColor:"rgba(74,222,128,0.3)"}} disabled>✓ Connected</button>
                        : <button className="btn-primary" style={{flex:1,padding:"8px"}} onClick={()=>setConnected(p=>({...p,[u.id]:true}))}>Connect</button>
                      }
                      <button className="btn-icon" style={{color:liked[u.id]?"#f87171":"inherit",borderColor:liked[u.id]?"rgba(248,113,113,0.3)":undefined}} onClick={()=>setLiked(p=>({...p,[u.id]:!p[u.id]}))}>♥</button>
                      <button className="btn-icon" onClick={()=>handleAI(u)} title="AI explain">{aiLoading===u.id?<span className="spin" style={{fontSize:12}}>✦</span>:"✦"}</button>
                      <button className="btn-icon" onClick={()=>{const c=convos.find(c=>c.user.id===u.id)||{id:convos.length+1,user:u,messages:[{id:1,from:"them",text:`Hey! I saw your profile. Would love to connect! 👋`,time:"now"}]};if(!convos.find(c=>c.user.id===u.id))setConvos(p=>[c,...p]);setActiveConvo(c);setDashPage("messages");}}>💬</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MESSAGES ── */}
          {dashPage==="messages"&&(
            <div className="fade-up" style={{display:"flex",gap:16,height:"calc(100vh - 130px)"}}>
              {/* Sidebar */}
              <div className="card-flat" style={{width:280,flexShrink:0,display:"flex",flexDirection:"column",overflow:"hidden"}}>
                <div style={{padding:"14px 14px 10px",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{fontFamily:"'Instrument Serif',serif",fontSize:18,color:T.text,marginBottom:10}}>Messages</div>
                  <input className="input" placeholder="Search..." style={{fontSize:12}}/>
                </div>
                <div style={{overflowY:"auto",flex:1,padding:"6px 6px"}}>
                  {convos.map(c=>(
                    <div key={c.id} className={`sidebar-item ${activeConvo.id===c.id?"on":""}`} onClick={()=>setActiveConvo(c)}>
                      <div style={{position:"relative",flexShrink:0}}>
                        <Avatar u={c.user} size={38} radius={10}/>
                        <div style={{position:"absolute",bottom:-1,right:-1,width:7,height:7,borderRadius:"50%",background:c.user.online?"#22c55e":"#555",border:`2px solid ${T.bg}`}}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                          <span style={{fontSize:13,fontWeight:600,color:T.text}}>{c.user.name.split(" ")[0]}</span>
                          <span style={{fontSize:10,color:T.text3}}>{c.messages[c.messages.length-1]?.time}</span>
                        </div>
                        <div style={{fontSize:11,color:T.text3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.messages[c.messages.length-1]?.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat */}
              <div className="card-flat" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
                {/* Chat header */}
                <div style={{padding:"13px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
                  <div style={{position:"relative"}}>
                    <Avatar u={activeConvo.user} size={38} radius={10}/>
                    <div style={{position:"absolute",bottom:-1,right:-1,width:7,height:7,borderRadius:"50%",background:activeConvo.user.online?"#22c55e":"#555",border:`2px solid ${T.bg}`}}/>
                  </div>
                  <div>
                    <div style={{fontWeight:600,fontSize:14,color:T.text}}>{activeConvo.user.name}</div>
                    <div style={{fontSize:11,color:activeConvo.user.online?"#22c55e":T.text3}}>{activeConvo.user.online?"● Online":"● Away"}</div>
                  </div>
                  <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:99,background:hsla(activeConvo.user.hue,70,60,dark?0.12:0.08),border:`1px solid ${hsla(activeConvo.user.hue,70,60,0.25)}`,color:hsl(activeConvo.user.hue)}}>{calculateMatchScore(currentUser,activeConvo.user)}% match</span>
                    <button className="btn-ghost" style={{fontSize:11,padding:"5px 12px"}} onClick={()=>setDashPage("discover")}>Profile</button>
                  </div>
                </div>

                {/* Match context */}
                <div style={{padding:"9px 18px",borderBottom:`1px solid ${T.border}`,background:dark?"rgba(124,58,237,0.04)":"rgba(124,58,237,0.03)",display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:12}}>✦</span>
                  <span style={{fontSize:11,color:dark?"#8070aa":"#6b5b9e"}}>
                    Matched because you have <strong style={{color:"#a78bfa"}}>{currentUser.skillsHave[0]}</strong> and they need it · They have <strong style={{color:"#a78bfa"}}>{activeConvo.user.skillsHave[0]}</strong> which you need
                  </span>
                </div>

                {/* Messages */}
                <div style={{flex:1,overflowY:"auto",padding:"18px 18px",display:"flex",flexDirection:"column",gap:10}}>
                  {currentConvo.messages.map((m,i)=>(
                    <div key={m.id} className="fade-up" style={{display:"flex",justifyContent:m.from==="me"?"flex-end":"flex-start",animationDelay:`${i*0.03}s`}}>
                      <div style={{padding:"10px 14px",borderRadius:15,fontSize:13,lineHeight:1.5,maxWidth:"70%",background:m.from==="me"?T.msgMe:T.msgThem,color:m.from==="me"?"white":T.text,borderBottomRightRadius:m.from==="me"?4:15,borderBottomLeftRadius:m.from==="them"?4:15,border:m.from==="them"?`1px solid ${T.border}`:"none"}}>
                        {m.text}
                        <div style={{fontSize:10,opacity:0.5,marginTop:4,textAlign:m.from==="me"?"right":"left"}}>{m.time}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef}/>
                </div>

                {/* Input */}
                <div style={{padding:"11px 14px",borderTop:`1px solid ${T.border}`,display:"flex",gap:8,flexShrink:0}}>
                  <input className="input" placeholder={`Message ${activeConvo.user.name.split(" ")[0]}...`} value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} style={{flex:1}}/>
                  <button className="btn-primary" onClick={sendMsg} style={{padding:"9px 16px"}}>Send ↑</button>
                </div>
              </div>

              {/* Right mini-profile */}
              <div className="card-flat" style={{width:210,flexShrink:0,padding:16,display:"flex",flexDirection:"column",gap:14,overflowY:"auto"}}>
                <div style={{textAlign:"center"}}>
                  <Avatar u={activeConvo.user} size={52} radius={14}/>
                  <div style={{fontSize:14,fontWeight:700,color:T.text,marginTop:10}}>{activeConvo.user.name}</div>
                  <div style={{fontSize:11,color:T.text3,marginTop:2}}>{activeConvo.user.role}</div>
                  <div style={{fontSize:14,fontWeight:700,fontFamily:"'Instrument Serif',serif",color:hsl(activeConvo.user.hue),marginTop:6}}>{calculateMatchScore(currentUser,activeConvo.user)}% match</div>
                </div>
                <div className="divider" style={{margin:"0"}}/>
                <div><Lbl>Their Skills</Lbl><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{activeConvo.user.skillsHave.map(s=><span key={s} className="pill skill-have" style={{fontSize:10}}>{s}</span>)}</div></div>
                <div><Lbl>They Need</Lbl><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{activeConvo.user.skillsNeed.map(s=><span key={s} className="pill skill-need" style={{fontSize:10}}>{s}</span>)}</div></div>
                <div className="divider" style={{margin:"0"}}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,textAlign:"center"}}>
                  <div><div style={{fontFamily:"'Instrument Serif',serif",fontSize:18,color:T.text}}>{activeConvo.user.projects}</div><div style={{fontSize:10,color:T.text3}}>Projects</div></div>
                  <div><div style={{fontFamily:"'Instrument Serif',serif",fontSize:18,color:T.text}}>{activeConvo.user.followers}</div><div style={{fontSize:10,color:T.text3}}>Followers</div></div>
                </div>
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          {dashPage==="profile"&&(
            <div className="fade-up" style={{maxWidth:700,margin:"0 auto"}}>
              <div className="card-flat" style={{padding:26,marginBottom:16,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",inset:0,background:dark?"linear-gradient(135deg,rgba(124,58,237,0.06),transparent)":"linear-gradient(135deg,rgba(124,58,237,0.04),transparent)",pointerEvents:"none"}}/>
                <div style={{display:"flex",gap:18,alignItems:"flex-start",flexWrap:"wrap",position:"relative"}}>
                  <div style={{width:68,height:68,borderRadius:18,background:"linear-gradient(135deg,rgba(124,58,237,0.2),rgba(168,85,247,0.1))",border:"2px solid rgba(124,58,237,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:700,color:"#c4b5fd",flexShrink:0}}>
                    {currentUser.name[0]}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Instrument Serif',serif",fontSize:24,color:T.text,letterSpacing:"-0.5px"}}>{currentUser.name}</div>
                    <div style={{fontSize:13,color:T.text3,marginTop:3}}>@{currentUser.handle} · {currentUser.role}</div>
                    <p style={{fontSize:13,color:T.text2,marginTop:6,lineHeight:1.5,maxWidth:480}}>{currentUser.bio}</p>
                    <div style={{display:"flex",gap:7,marginTop:10,flexWrap:"wrap"}}>
                      <span className="pill" style={{background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.25)",color:"#a78bfa",fontSize:11}}>● Open to Collaborate</span>
                      <span className="pill" style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.25)",color:"#f59e0b",fontSize:11}}>Seeking {currentUser.skillsNeed[0]}</span>
                    </div>
                  </div>
                  <button className="btn-ghost" style={{fontSize:12}} onClick={()=>setDashPage("settings")}>Edit Profile</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",marginTop:22,paddingTop:20,borderTop:`1px solid ${T.border}`}}>
                  {[{v:"12",l:"Connections"},{v:String(currentUser.projects),l:"Projects"},{v:"87%",l:"Avg Match"},{v:"248",l:"Profile Views"}].map((s,i)=>(
                    <div key={i} style={{textAlign:"center",borderRight:i<3?`1px solid ${T.border}`:"none"}}>
                      <div style={{fontFamily:"'Instrument Serif',serif",fontSize:22,color:T.text}}>{s.v}</div>
                      <div style={{fontSize:11,color:T.text3,marginTop:2}}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div className="card-flat" style={{padding:16}}>
                  <Lbl>Skills I Have</Lbl>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{currentUser.skillsHave.map(s=><span key={s} className="pill skill-have">{s}</span>)}</div>
                </div>
                <div className="card-flat" style={{padding:16}}>
                  <Lbl>Skills I Need</Lbl>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{currentUser.skillsNeed.map(s=><span key={s} className="pill skill-need">{s}</span>)}</div>
                </div>
              </div>

              <div className="card-flat" style={{padding:20}}>
                <div style={{display:"flex",gap:4,marginBottom:18,borderBottom:`1px solid ${T.border}`,paddingBottom:12}}>
                  {["projects","activity","connections"].map(t=><button key={t} className={`tab ${profileTab===t?"on":""}`} onClick={()=>setProfileTab(t)} style={{textTransform:"capitalize"}}>{t}</button>)}
                </div>

                {profileTab==="projects"&&(
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {[
                      {n:"AI Project Management Tool",d:"Real-time PM with AI task generation, Supabase backend, and Kanban.",tags:["Next.js","Supabase","AI"],stars:24,status:"Live"},
                      {n:"Developer Portfolio OS",d:"Interactive portfolio with Claude API chatbot, MDX blog, GitHub stats.",tags:["Next.js","Claude API","MDX"],stars:41,status:"Live"},
                      {n:"SkillMatch Network",d:"AI-powered developer matching platform — this very app!",tags:["React","TypeScript","Gemini"],stars:8,status:"Building"},
                    ].map((p,i)=>(
                      <div key={i} style={{padding:16,background:dark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.02)",borderRadius:13,border:`1px solid ${T.border}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                          <div style={{fontSize:13,fontWeight:600,color:T.text}}>{p.n}</div>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}>
                            <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:p.status==="Live"?"rgba(34,197,94,0.1)":"rgba(245,158,11,0.1)",border:`1px solid ${p.status==="Live"?"rgba(34,197,94,0.25)":"rgba(245,158,11,0.25)"}`,color:p.status==="Live"?"#4ade80":"#fbbf24"}}>{p.status}</span>
                            <span style={{fontSize:11,color:T.text3}}>★ {p.stars}</span>
                          </div>
                        </div>
                        <p style={{fontSize:12,color:T.text2,lineHeight:1.5,marginBottom:8}}>{p.d}</p>
                        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{p.tags.map(t=><span key={t} style={{padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:600,background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)",color:T.text2}}>{t}</span>)}</div>
                      </div>
                    ))}
                  </div>
                )}

                {profileTab==="activity"&&(
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {[
                      {a:"Connected with",t:"Rohan Mehra",time:"2h ago",hue:340},
                      {a:"New 89% match —",t:"Rohan Mehra",time:"5h ago",hue:340},
                      {a:"Sent request to",t:"Priya Nair",time:"1d ago",hue:158},
                      {a:"Updated skills:",t:"Added TypeScript",time:"2d ago",hue:259},
                      {a:"Joined",t:"SkillMatch Network",time:"1w ago",hue:271},
                    ].map((a,i)=>(
                      <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"9px 13px",background:dark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.02)",borderRadius:11}}>
                        <div style={{width:7,height:7,borderRadius:"50%",background:hsl(a.hue),flexShrink:0}}/>
                        <span style={{fontSize:12,color:T.text2,flex:1}}>{a.a} <span style={{color:T.text,fontWeight:500}}>{a.t}</span></span>
                        <span style={{fontSize:10,color:T.text3}}>{a.time}</span>
                      </div>
                    ))}
                  </div>
                )}

                {profileTab==="connections"&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {MOCK_USERS.slice(0,4).map(u=>(
                      <div key={u.id} style={{display:"flex",gap:10,alignItems:"center",padding:"11px 13px",background:dark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.02)",borderRadius:12,border:`1px solid ${T.border}`}}>
                        <Avatar u={u} size={34} radius={9}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:600,color:T.text}}>{u.name.split(" ")[0]}</div>
                          <div style={{fontSize:10,color:T.text3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.role}</div>
                        </div>
                        <button className="btn-ghost" style={{fontSize:10,padding:"4px 10px"}} onClick={()=>{const c=convos.find(c=>c.user.id===u.id)||CONVERSATIONS[0];setActiveConvo(c);setDashPage("messages");}}>Chat</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {dashPage==="settings"&&(
            <div className="fade-up" style={{maxWidth:680,margin:"0 auto"}}>
              <h1 style={{fontFamily:"'Instrument Serif',serif",fontSize:28,color:T.text,marginBottom:20}}>Settings</h1>
              <div style={{display:"flex",gap:16}}>
                {/* Settings sidebar */}
                <div className="card-flat" style={{width:180,flexShrink:0,padding:10}}>
                  {[{id:"account",icon:"👤",l:"Account"},{id:"profile",icon:"✏️",l:"Profile"},{id:"skills",icon:"⚡",l:"Skills"},{id:"appearance",icon:"🎨",l:"Appearance"},{id:"notifications",icon:"🔔",l:"Notifications"},{id:"privacy",icon:"🔒",l:"Privacy"}].map(s=>(
                    <button key={s.id} className={`sidebar-item ${settingsTab===s.id?"on":""}`} style={{width:"100%",border:"none",fontFamily:"inherit",background:"transparent"}} onClick={()=>setSettingsTab(s.id)}>
                      <span style={{fontSize:15}}>{s.icon}</span>
                      <span style={{fontSize:13,fontWeight:500,color:settingsTab===s.id?T.text:T.text3}}>{s.l}</span>
                    </button>
                  ))}
                </div>

                {/* Settings content */}
                <div className="card-flat fade-in" style={{flex:1,padding:24}} key={settingsTab}>
                  {settingsTab==="account"&&<>
                    <h2 style={{fontSize:17,fontWeight:700,color:T.text,marginBottom:18}}>Account</h2>
                    <Field label="Email" id="s_email" type="email" value={formData.email||"you@example.com"} onChange={v=>upd("email",v)}/>
                    <Field label="Password" id="s_pass" type="password" placeholder="Change password..." value="" onChange={()=>{}}/>
                    <div className="divider"/>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0"}}>
                      <div><div style={{fontSize:13,fontWeight:600,color:T.text}}>Two-factor authentication</div><div style={{fontSize:11,color:T.text3,marginTop:2}}>Add an extra layer of security</div></div>
                      <button className="toggle-switch" style={{background:"#7c3aed"}} onClick={e=>{}}>
                        <div className="toggle-thumb" style={{left:23}}/>
                      </button>
                    </div>
                    <div className="divider"/>
                    <button className="btn-primary" style={{padding:"10px 20px",fontSize:13}}>Save Changes</button>
                  </>}

                  {settingsTab==="profile"&&<>
                    <h2 style={{fontSize:17,fontWeight:700,color:T.text,marginBottom:18}}>Edit Profile</h2>
                    <Field label="Full Name" id="s_name" value={currentUser.name} onChange={v=>setCurrentUser(p=>({...p,name:v}))}/>
                    <Field label="Username" id="s_handle" value={currentUser.handle} onChange={v=>setCurrentUser(p=>({...p,handle:v}))} prefix="@"/>
                    <div style={{marginBottom:18}}>
                      <label style={{display:"block",fontSize:12,fontWeight:600,color:T.text2,marginBottom:6}}>Bio</label>
                      <textarea className="input" rows={3} value={currentUser.bio} onChange={e=>setCurrentUser(p=>({...p,bio:e.target.value}))}/>
                    </div>
                    <Field label="Location" id="s_loc" value={currentUser.location||""} onChange={v=>setCurrentUser(p=>({...p,location:v}))}/>
                    <div style={{marginBottom:18}}>
                      <label style={{display:"block",fontSize:12,fontWeight:600,color:T.text2,marginBottom:8}}>Looking for</label>
                      <div style={{display:"flex",gap:8}}>
                        {["Collaborator","Mentor","Mentee"].map(l=>(
                          <button key={l} onClick={()=>setCurrentUser(p=>({...p,lookingFor:l}))} style={{padding:"7px 16px",borderRadius:10,border:`1px solid ${currentUser.lookingFor===l?"rgba(124,58,237,0.5)":T.border}`,background:currentUser.lookingFor===l?dark?"rgba(124,58,237,0.12)":"rgba(124,58,237,0.07)":"transparent",color:currentUser.lookingFor===l?"#a78bfa":T.text3,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,transition:"all 0.2s"}}>{l}</button>
                        ))}
                      </div>
                    </div>
                    <button className="btn-primary" style={{padding:"10px 20px",fontSize:13}} onClick={()=>setDashPage("profile")}>Save & View Profile</button>
                  </>}

                  {settingsTab==="skills"&&<>
                    <h2 style={{fontSize:17,fontWeight:700,color:T.text,marginBottom:6}}>Your Skills</h2>
                    <p style={{fontSize:12,color:T.text3,marginBottom:20}}>Updating your skills recalculates all match scores instantly.</p>
                    <div style={{marginBottom:20}}>
                      <Lbl>Skills I Have ({currentUser.skillsHave.length}/6)</Lbl>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>{currentUser.skillsHave.map(s=><span key={s} className="pill skill-have" style={{cursor:"pointer",display:"flex",alignItems:"center",gap:5}} onClick={()=>setCurrentUser(p=>({...p,skillsHave:p.skillsHave.filter(x=>x!==s)}))}>{s} <span style={{opacity:0.6,fontSize:10}}>✕</span></span>)}</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{SKILLS_ALL.filter(s=>!currentUser.skillsHave.includes(s)).slice(0,12).map(s=><button key={s} className="skill-chip" onClick={()=>{if(currentUser.skillsHave.length<6)setCurrentUser(p=>({...p,skillsHave:[...p.skillsHave,s]}))}}>{s}</button>)}</div>
                    </div>
                    <div className="divider"/>
                    <div>
                      <Lbl>Skills I Need ({currentUser.skillsNeed.length}/6)</Lbl>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>{currentUser.skillsNeed.map(s=><span key={s} className="pill skill-need" style={{cursor:"pointer",display:"flex",alignItems:"center",gap:5}} onClick={()=>setCurrentUser(p=>({...p,skillsNeed:p.skillsNeed.filter(x=>x!==s)}))}>{s} <span style={{opacity:0.6,fontSize:10}}>✕</span></span>)}</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{SKILLS_ALL.filter(s=>!currentUser.skillsNeed.includes(s)).slice(0,12).map(s=><button key={s} className="skill-chip" onClick={()=>{if(currentUser.skillsNeed.length<6)setCurrentUser(p=>({...p,skillsNeed:[...p.skillsNeed,s]}))}}>{s}</button>)}</div>
                    </div>
                    <div style={{marginTop:18,padding:"12px 14px",background:T.aiBg,border:`1px solid ${T.aiBorder}`,borderRadius:12}}>
                      <p style={{fontSize:12,color:dark?"#b0a8d8":"#6b5b9e"}}>✦ Match scores on the Discover page update automatically when you change your skills.</p>
                    </div>
                  </>}

                  {settingsTab==="appearance"&&<>
                    <h2 style={{fontSize:17,fontWeight:700,color:T.text,marginBottom:18}}>Appearance</h2>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:`1px solid ${T.border}`}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:T.text}}>Dark Mode</div>
                        <div style={{fontSize:11,color:T.text3,marginTop:2}}>Switch between dark and light theme</div>
                      </div>
                      <button className="toggle-switch" style={{background:dark?"#7c3aed":T.border}} onClick={()=>setDark(p=>!p)}>
                        <div className="toggle-thumb" style={{left:dark?23:3}}/>
                      </button>
                    </div>
                    <div style={{display:"flex",gap:12,marginTop:18}}>
                      {[{l:"Dark",bg:"#060608",c:"#e2e2ef"},{l:"Light",bg:"#f5f5f9",c:"#1a1a2e"}].map(t=>(
                        <div key={t.l} onClick={()=>setDark(t.l==="Dark")} style={{flex:1,padding:16,borderRadius:14,background:t.bg,border:`2px solid ${(dark&&t.l==="Dark")||(!dark&&t.l==="Light")?"#7c3aed":T.border}`,cursor:"pointer",textAlign:"center"}}>
                          <div style={{fontSize:12,fontWeight:600,color:t.c}}>{t.l}</div>
                          <div style={{width:40,height:5,borderRadius:3,background:"#7c3aed",margin:"8px auto 0"}}/>
                        </div>
                      ))}
                    </div>
                  </>}

                  {settingsTab==="notifications"&&<>
                    <h2 style={{fontSize:17,fontWeight:700,color:T.text,marginBottom:18}}>Notifications</h2>
                    {[{l:"New match found",d:"When AI finds a high-scoring match",on:true},{l:"Connection requests",d:"When someone wants to connect",on:true},{l:"Messages",d:"When you receive a new message",on:true},{l:"Weekly digest",d:"Summary of your top matches",on:false},{l:"Profile views",d:"When someone views your profile",on:false}].map((n,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 0",borderBottom:i<4?`1px solid ${T.border}`:"none"}}>
                        <div><div style={{fontSize:13,fontWeight:500,color:T.text}}>{n.l}</div><div style={{fontSize:11,color:T.text3,marginTop:2}}>{n.d}</div></div>
                        <button className="toggle-switch" style={{background:n.on?"#7c3aed":dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}} onClick={()=>{}}>
                          <div className="toggle-thumb" style={{left:n.on?23:3}}/>
                        </button>
                      </div>
                    ))}
                  </>}

                  {settingsTab==="privacy"&&<>
                    <h2 style={{fontSize:17,fontWeight:700,color:T.text,marginBottom:18}}>Privacy</h2>
                    {[{l:"Public profile",d:"Anyone can see your profile",on:true},{l:"Show online status",d:"Let others see when you're active",on:true},{l:"Discoverable",d:"Appear in match results",on:true},{l:"Show location",d:"Display your city on your profile",on:false}].map((n,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 0",borderBottom:i<3?`1px solid ${T.border}`:"none"}}>
                        <div><div style={{fontSize:13,fontWeight:500,color:T.text}}>{n.l}</div><div style={{fontSize:11,color:T.text3,marginTop:2}}>{n.d}</div></div>
                        <button className="toggle-switch" style={{background:n.on?"#7c3aed":dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}}>
                          <div className="toggle-thumb" style={{left:n.on?23:3}}/>
                        </button>
                      </div>
                    ))}
                    <div className="divider"/>
                    <button style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",color:"#f87171",padding:"10px 20px",borderRadius:11,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600}} onClick={()=>setView("landing")}>Sign out</button>
                  </>}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }
}
