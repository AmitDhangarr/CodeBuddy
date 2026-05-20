// ── Shared Data & Utilities ──────────────────────────────────────────────────

export const SKILLS_ALL = [
  "React", "Next.js", "TypeScript", "Node.js", "Python", "Rust", "Go",
  "UI/UX Design", "Figma", "GraphQL", "PostgreSQL", "MongoDB", "Redis",
  "DevOps", "AWS", "Docker", "Machine Learning", "Web3", "Flutter", "Swift",
  "Tailwind CSS", "Vue.js", "Svelte", "Three.js", "Solidity", "Kotlin",
  "Unity", "Supabase", "Firebase", "Prisma",
];

export const MOCK_USERS = [
  { id: 1, name: "Aanya Sharma", handle: "aanya.dev", role: "Full Stack Engineer", avatar: "AS", hue: 259, bio: "I build SaaS tools that people actually want to use. Obsessed with DX, clean APIs, and shipping fast.", skills_have: ["React", "Next.js", "Node.js", "PostgreSQL"], skillsNeed: ["UI/UX Design", "Figma", "Machine Learning"], lookingFor: "Collaborator", location: "Bangalore, IN", github: "aanya-dev", projects: 3, followers: 128, online: true, joined: "Jan 2024" },
  { id: 2, name: "Rohan Mehra", handle: "rohan.ui", role: "Design Engineer", avatar: "RM", hue: 340, bio: "Designer who writes production code. Built 2 design systems used by 10k+ devs.", skillsHave: ["UI/UX Design", "Figma", "React", "Tailwind CSS"], skillsNeed: ["Node.js", "PostgreSQL", "DevOps"], lookingFor: "Collaborator", location: "Mumbai, IN", github: "rohan-designs", projects: 5, followers: 342, online: true, joined: "Mar 2024" },
  { id: 3, name: "Priya Nair", handle: "priya.ml", role: "ML Engineer", avatar: "PN", hue: 158, bio: "Turning research papers into products. My AI tools have been used in production at 3 startups.", skillsHave: ["Machine Learning", "Python", "AWS", "Docker"], skillsNeed: ["React", "TypeScript", "Next.js"], lookingFor: "Mentor", location: "Hyderabad, IN", github: "priya-ml", projects: 7, followers: 201, online: false, joined: "Feb 2024" },
  { id: 4, name: "Dev Kapoor", handle: "dev.sys", role: "Systems Engineer", avatar: "DK", hue: 38, bio: "Distributed systems, high throughput APIs, and the occasional Rust rant.", skillsHave: ["Rust", "Go", "Docker", "Redis", "AWS"], skillsNeed: ["React", "UI/UX Design", "TypeScript"], lookingFor: "Collaborator", location: "Delhi, IN", github: "dev-systems", projects: 4, followers: 97, online: false, joined: "Apr 2024" },
  { id: 5, name: "Sara Chen", handle: "sara.web3", role: "Web3 Developer", avatar: "SC", hue: 271, bio: "Building the decentralized future, one smart contract at a time. Open to mentoring frontend devs.", skillsHave: ["Web3", "TypeScript", "React", "Solidity"], skillsNeed: ["DevOps", "AWS", "Machine Learning"], lookingFor: "Mentee", location: "Remote", github: "sara-web3", projects: 9, followers: 456, online: true, joined: "Dec 2023" },
  { id: 6, name: "Karan Patel", handle: "karan.mob", role: "Mobile Developer", avatar: "KP", hue: 316, bio: "5 apps, 50k+ downloads. Flutter specialist who crafts delightful mobile experiences.", skillsHave: ["Flutter", "Swift", "Firebase", "Dart"], skillsNeed: ["Machine Learning", "Node.js", "GraphQL"], lookingFor: "Collaborator", location: "Pune, IN", github: "karan-mobile", projects: 6, followers: 183, online: false, joined: "May 2024" },
];

export const INITIAL_CONVERSATIONS = [
  {
    id: 1, user: MOCK_USERS[1],
    messages: [
      { id: 1, from: "them", text: "Hey! Saw your PM tool on GitHub — the real-time sync is smooth. How did you handle conflict resolution?", time: "10:32" },
      { id: 2, from: "me", text: "Thanks! Used operational transforms with Supabase Realtime. Took a while but worth it.", time: "10:34" },
      { id: 3, from: "them", text: "Would you be open to a collab? I need backend for my design system.", time: "10:35" },
      { id: 4, from: "me", text: "Absolutely! I've been looking for a design partner. Your component library is exactly what I need.", time: "10:37" },
      { id: 5, from: "them", text: "Perfect. Call this weekend? I'll drop a Figma link.", time: "10:38" },
    ]
  },
  {
    id: 2, user: MOCK_USERS[0],
    messages: [
      { id: 1, from: "them", text: "Hi! Loved your portfolio. The animations are super clean 🔥", time: "Yesterday" },
      { id: 2, from: "me", text: "Thank you! I spent way too long on those transitions haha", time: "Yesterday" },
      { id: 3, from: "them", text: "Can we collab on something? I have a SaaS idea that needs a frontend person.", time: "2h ago" },
    ]
  },
  {
    id: 3, user: MOCK_USERS[2],
    messages: [
      { id: 1, from: "them", text: "Hey, I saw you need ML skills. I'm looking for a React dev to help me build a UI for my model.", time: "3h ago" },
      { id: 2, from: "me", text: "That's perfect actually! I've been wanting to learn more about ML integrations.", time: "2h ago" },
    ]
  },
];

export const INITIAL_NOTIFS = [
  { id: 1, text: "Aanya Sharma wants to connect", time: "2m ago", read: false, hue: 259, type: "connect" },
  { id: 2, text: "New 94% match — Rohan Mehra", time: "15m ago", read: false, hue: 340, type: "match" },
  { id: 3, text: "Priya Nair accepted your request", time: "1h ago", read: true, hue: 158, type: "accept" },
  { id: 4, text: "Rohan Mehra sent you a message", time: "3h ago", read: true, hue: 340, type: "message" },
];

export const DEFAULT_USER = {
  name: "You",
  handle: "yourhandle",
  role: "Frontend Developer",
  skillsHave: ["React", "Next.js", "TypeScript"],
  skillsNeed: ["UI/UX Design", "Machine Learning"],
  lookingFor: "Collaborator",
  bio: "Building cool stuff at the intersection of design and engineering.",
  location: "Meerut, IN",
  projects: 3,
  followers: 42,
  github: "yourhandle",
  website: "",
};

// ── Theme ────────────────────────────────────────────────────────────────────
export const DARK = {
  bg: "#060608", bg2: "#0e0e18", bg3: "#14141f",
  border: "rgba(255,255,255,0.07)", border2: "rgba(255,255,255,0.12)",
  text: "#e2e2ef", text2: "#9090b0", text3: "#555570",
  card: "rgba(255,255,255,0.025)", cardHover: "rgba(255,255,255,0.045)",
  input: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.09)",
  shadow: "0 20px 60px rgba(0,0,0,0.5)",
  msgMe: "linear-gradient(135deg,rgba(124,58,237,0.4),rgba(100,60,200,0.3))",
  msgThem: "rgba(255,255,255,0.06)",
  navBg: "rgba(6,6,8,0.9)",
  skillHaveBg: "rgba(110,224,110,0.1)", skillHaveBorder: "rgba(110,224,110,0.25)", skillHaveText: "#7de87d",
  skillNeedBg: "rgba(120,120,255,0.1)", skillNeedBorder: "rgba(120,120,255,0.25)", skillNeedText: "#9898ff",
  aiBg: "rgba(60,40,140,0.15)", aiBorder: "rgba(120,80,255,0.2)",
};

export const LIGHT = {
  bg: "#f5f5f9", bg2: "#ffffff", bg3: "#eeeef5",
  border: "rgba(0,0,0,0.08)", border2: "rgba(0,0,0,0.15)",
  text: "#1a1a2e", text2: "#555570", text3: "#9090b0",
  card: "#ffffff", cardHover: "#f8f8fc",
  input: "#ffffff", inputBorder: "rgba(0,0,0,0.12)",
  shadow: "0 20px 60px rgba(0,0,0,0.12)",
  msgMe: "linear-gradient(135deg,#7c3aed,#9333ea)",
  msgThem: "#f0f0f8",
  navBg: "rgba(245,245,249,0.95)",
  skillHaveBg: "rgba(34,197,94,0.1)", skillHaveBorder: "rgba(34,197,94,0.3)", skillHaveText: "#16a34a",
  skillNeedBg: "rgba(99,102,241,0.1)", skillNeedBorder: "rgba(99,102,241,0.3)", skillNeedText: "#4f46e5",
  aiBg: "rgba(124,58,237,0.07)", aiBorder: "rgba(124,58,237,0.2)",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
export const hsl  = (h, s = 70, l = 60) => `hsl(${h},${s}%,${l}%)`;
export const hsla = (h, s = 70, l = 60, a = 0.12) => `hsla(${h},${s}%,${l}%,${a})`;

export function calculateMatchScore(me, them) {
  if (!me || !them) return 0;

  const mySkillsNeed = Array.isArray(me.skills_need) ? me.skills_need : [];
  const mySkillsHave = Array.isArray(me.skills_have) ? me.skills_have : [];
  const theirSkillsNeed = Array.isArray(them.skills_need) ? them.skills_need : [];
  const theirSkillsHave = Array.isArray(them.skills_have) ? them.skills_have : [];

  let theyHaveWhatINeed = 0;
  for (const skill of mySkillsNeed) {
    if (theirSkillsHave.includes(skill)) theyHaveWhatINeed++;
  }

  let iHaveWhatTheyNeed = 0;
  for (const skill of theirSkillsNeed) {
    if (mySkillsHave.includes(skill)) iHaveWhatTheyNeed++;
  }

  const maxPossible = mySkillsNeed.length + theirSkillsNeed.length;
  const skillScore = maxPossible === 0 ? 0 : ((theyHaveWhatINeed + iHaveWhatTheyNeed) / maxPossible) * 90;
  const bonusScore = me.looking_for === them.looking_for ? 10 : 0;

  return Math.round(Math.min(100, skillScore + bonusScore));
}

// Shared component primitives
export const Lbl = ({ children, T }) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: T.text3, marginBottom: 7 }}>
    {children}
  </div>
);

export const Avatar = ({ u, size = 44, radius = 12, T, dark }) => (
  <div style={{
    width: size, height: size, borderRadius: radius,
    background: hsla(u.hue, 70, 60, dark ? 0.15 : 0.12),
    border: `1.5px solid ${hsla(u.hue, 70, 60, 0.3)}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.3, fontWeight: 700, color: hsl(u.hue),
    flexShrink: 0, fontFamily: "'Instrument Serif',serif",
  }}>
    {u.avatar}
  </div>
);