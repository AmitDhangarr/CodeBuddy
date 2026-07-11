"use client"
import { useState } from "react";
import Link from "next/link";
import { useThemeStore } from "../../../../store/themeprovider";
import { Mail, CheckCircle2, Heart, ArrowLeft, ArrowRight } from "lucide-react";

const iconSize = (min, max, vw = 3.2) => ({
  width: `clamp(${min}px, ${vw}vw, ${max}px)`,
  height: `clamp(${min}px, ${vw}vw, ${max}px)`,
  flexShrink: 0,
});

const Logo = () => (
  <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill="#1a0a6a" />
    <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff" />
  </svg>
);

const hsl = (h, s = 70, l = 60) => `hsl(${h},${s}%,${l}%)`;
const hsla = (h, s = 70, l = 60, a = 0.12) => `hsla(${h},${s}%,${l}%,${a})`;

const POSTS = [
  {
    id: 1, featured: true,
    tag: "Product", tagHue: 259,
    title: "How our AI matching engine works — explained simply",
    excerpt: "We get asked this all the time. Here's a plain-English breakdown of how CodeBuddy pairs developers, what signals we use, and why bidirectional skill matching changes everything.",
    author: "Nisha Kapoor", authorRole: "CTO", authorInitials: "NK", authorHue: 259,
    date: "May 22, 2026", readTime: "8 min read",
    body: [
      { type: "p", text: "Every time we tell someone CodeBuddy uses \"AI matching,\" we get the same follow-up question: what does that actually mean? Fair. \"AI\" gets slapped on everything these days. So here's the honest, unglamorous explanation of what happens between you hitting \"Find a match\" and a name showing up on your screen." },
      { type: "h2", text: "It starts with signals, not vibes" },
      { type: "p", text: "The engine doesn't read your bio and guess. It builds a structured profile from declared skills, skill proficiency self-ratings, project history, stated availability, and the kind of collaborator you say you want — technical co-founder, accountability partner, code reviewer, and so on. Each of those becomes a vector, and matching is fundamentally a similarity and complementarity search across those vectors." },
      { type: "p", text: "The key word is complementarity, not similarity. Two backend engineers who both love Postgres are not a great match for shipping a product together. A backend engineer and a designer who both want to ship a product, on the other hand, fill each other's gaps. We weight for that explicitly." },
      { type: "h2", text: "Bidirectional matching, not a one-way feed" },
      { type: "p", text: "Most \"matching\" products are really just filtered feeds — you scroll, you pick. We score compatibility in both directions before a match ever appears. If you'd want to work with someone but the signals say they're unlikely to want to work with you (wrong timezone overlap, mismatched commitment level, skill direction that doesn't close a gap for them), we don't surface it as a top match. It's a small thing that makes a large difference in response rates." },
      { type: "h2", text: "What we deliberately don't use" },
      { type: "p", text: "No resume parsing, no LinkedIn scraping, no inferred seniority from job titles. Titles lie. We ask people to self-declare skills with a confidence level, and we weight recent shipped work over claimed expertise. It's less data, but it's more honest data, and honest data matches better than a lot of data." },
      { type: "h2", text: "Where it's headed" },
      { type: "p", text: "Match Insights v2, which we're shipping this quarter, adds work-style compatibility on top of skills — async vs. synchronous preference, communication cadence, and how someone tends to handle disagreement during a project. None of this replaces a real conversation. It just means the first conversation starts from a much better place." },
    ],
  },
  {
    id: 2, featured: false,
    tag: "Community", tagHue: 158,
    title: "From a cold DM to a shipped startup: Meera & Rohan's story",
    excerpt: "They matched on a Tuesday. By Saturday they had a GitHub repo. Three weeks later, Notara had 2,400 users. Here's how they did it.",
    author: "Priya Iyer", authorRole: "Community Lead", authorInitials: "PI", authorHue: 158,
    date: "May 15, 2026", readTime: "5 min read",
    body: [
      { type: "p", text: "Meera had an idea for a tool that turned messy meeting notes into structured action items. Rohan had spent two years building backend infrastructure at a logistics startup and was bored out of his mind. Neither of them knew the other existed until CodeBuddy's matching engine put them in the same inbox." },
      { type: "h2", text: "The first message" },
      { type: "p", text: "Meera's opening DM wasn't a pitch. It was a question: \"What's something you built that you're still proud of, even if nobody used it?\" Rohan's answer — a tiny internal tool that saved his old team four hours a week — told her more about how he thought than any portfolio link could have." },
      { type: "h2", text: "Building in public, from day one" },
      { type: "p", text: "They opened a shared repo within 48 hours of their first call. No NDA, no equity conversation yet, just code. Rohan has said since that the lack of formality early on is what let them figure out if they actually worked well together before anything was at stake." },
      { type: "h2", text: "2,400 users in three weeks" },
      { type: "p", text: "Notara launched quietly on a Friday with a single tweet. By the following Friday it had crossed a thousand signups, almost entirely word of mouth inside product and engineering Slack communities. Meera credits the early traction to a tight, specific use case rather than a broad pitch — Notara did exactly one thing, and did it for exactly one type of meeting." },
      { type: "p", text: "Today the two of them are full-time on Notara, still building, still occasionally arguing about tabs versus spaces. We're rooting for them, and we'll keep posting updates on the CodeBuddy blog as they grow." },
    ],
  },
  {
    id: 3, featured: false,
    tag: "Engineering", tagHue: 38,
    title: "Building a real-time matching system at scale with Rust",
    excerpt: "When we hit 1k users, our matching pipeline buckled. We rewrote it in Rust. Here's what we learned about concurrency, latency, and the joy of zero-cost abstractions.",
    author: "Rahul Verma", authorRole: "Lead Engineer", authorInitials: "RV", authorHue: 38,
    date: "May 8, 2026", readTime: "12 min read",
    body: [
      { type: "p", text: "Our original matching service was a Python monolith using NumPy for vector similarity. It worked beautifully up to a few hundred users. At a thousand, p99 latency on a match request crept past four seconds, and our background recompute jobs started overlapping with each other. Something had to give." },
      { type: "h2", text: "Diagnosing the actual bottleneck" },
      { type: "p", text: "Before reaching for a rewrite, we profiled. The GIL was the real villain — our matching workload is embarrassingly parallel (every candidate pair can be scored independently), but Python's threading model meant we weren't getting any of that parallelism for free. Multiprocessing helped, but the IPC overhead of shipping large vector batches between processes ate most of the gain." },
      { type: "h2", text: "Why Rust, specifically" },
      { type: "p", text: "We considered Go first, since most of the team already knew it. We ultimately chose Rust for two reasons: the ndarray and rayon crates gave us near-effortless data parallelism across cores, and the borrow checker meant we could be aggressive about in-place mutation of large score matrices without the usual fear of race conditions creeping in during code review." },
      { type: "h2", text: "The architecture today" },
      { type: "p", text: "Candidate generation still happens in Postgres with a coarse pre-filter (timezone bucket, broad skill category). The Rust service takes that candidate set, computes full compatibility vectors in parallel across a thread pool sized to the host's core count, and returns a ranked list over a lightweight gRPC interface. p99 latency dropped from 4.1 seconds to 38 milliseconds." },
      { type: "h2", text: "What we'd do differently" },
      { type: "p", text: "We underestimated the cost of FFI boundary work when we briefly tried embedding Rust inside the existing Python service via PyO3 as a stopgap. It worked, but debugging across that boundary was painful enough that we're glad we committed to a full standalone service instead. If you're facing a similar bottleneck: profile first, and don't be afraid to commit to the rewrite once you know exactly what you're solving for." },
    ],
  },
  {
    id: 4, featured: false,
    tag: "Design", tagHue: 340,
    title: "Designing for developers: why we threw out our first UI",
    excerpt: "Developer tools have a design problem. They're either over-engineered dashboards or barebones CLIs. We tried to find a third path — and failed once before getting it right.",
    author: "Arjun Das", authorRole: "Head of Design", authorInitials: "AD", authorHue: 340,
    date: "Apr 29, 2026", readTime: "7 min read",
    body: [
      { type: "p", text: "Our first version of CodeBuddy looked like a SaaS dashboard template — sidebar navigation, card grids, a chart nobody asked for on the homepage. It was competent and completely forgettable. Worse, user interviews told us it felt like \"every other tool,\" which for a product about finding the right collaborator was almost an insult." },
      { type: "h2", text: "The problem with dashboard-first thinking" },
      { type: "p", text: "Dashboards are built for monitoring — checking on something that's already running. But matching is a moment, not a monitoring task. Treating it like a dashboard buried the one action that mattered (find your next match) under navigation chrome built for a product five times more complex than ours actually was." },
      { type: "h2", text: "Starting over with the content" },
      { type: "p", text: "We threw out the component library and started from the actual words a match needs to communicate: who is this person, what do they know, why might you two work well together. Everything in the current design — the skill tags, the compatibility framing, the author chips on this very blog — descends from that exercise. If a UI element didn't serve one of those three questions, it got cut." },
      { type: "h2", text: "Typography as the real interface" },
      { type: "p", text: "Once we stopped leaning on cards and charts to do the work, typography had to carry more weight. The serif display face you're reading this headline in was a deliberate choice to feel less like enterprise software and more like something a person made. Small thing, but it changed how the whole product felt within a single design review." },
      { type: "p", text: "We still keep a screenshot of that first dashboard pinned in our design channel. Mostly as a reminder that competent and right are not the same thing." },
    ],
  },
  {
    id: 5, featured: false,
    tag: "Growth", tagHue: 200,
    title: "0 to 12,000 waitlist in 60 days: the honest post-mortem",
    excerpt: "No paid ads. No influencer deals. Just a landing page, a clear value prop, and one viral Twitter thread. Here's everything that worked — and what nearly tanked it.",
    author: "Sanya Mehta", authorRole: "Head of Growth", authorInitials: "SM", authorHue: 200,
    date: "Apr 18, 2026", readTime: "9 min read",
    body: [
      { type: "p", text: "We had a $0 marketing budget and a launch date we'd already promised on Twitter, which is its own kind of pressure. Here's what actually moved the waitlist number, in the order it mattered, not the order we expected going in." },
      { type: "h2", text: "The thread that did the heavy lifting" },
      { type: "p", text: "One thread, posted at 9am on a Tuesday, describing the exact problem CodeBuddy solves using a real story from our own founding — two of us who almost didn't start the company because we couldn't find each other. It got roughly 40,000 impressions and drove about 60% of total signups over the following two weeks. Specificity beat polish; the thread had typos we never fixed." },
      { type: "h2", text: "What barely moved the needle" },
      { type: "p", text: "We spent a week building referral mechanics — invite links, position-on-waitlist gamification — expecting it to be the main driver. It accounted for less than 8% of total signups. Useful, not transformative. If we were doing it again, we'd ship a basic version in a day instead of a polished version in a week." },
      { type: "h2", text: "The near-disaster" },
      { type: "p", text: "Three weeks in, a misconfigured email step sent our waitlist confirmation email twice to roughly 1,800 people. We expected a wave of unsubscribes. Instead, several people replied asking if the second email meant something had changed about their position — turns out duplicate emails read as urgency, not as a bug, to a chunk of our audience. We don't recommend this as a strategy. We're just telling you what happened." },
      { type: "h2", text: "What we'd tell our past selves" },
      { type: "p", text: "Spend less time on growth mechanics and more time making the core story sharper. The thread worked because the problem was real and specifically told. Everything else was a multiplier on that, not a replacement for it." },
    ],
  },
  {
    id: 6, featured: false,
    tag: "Culture", tagHue: 290,
    title: "Why we ship in public — and why you should too",
    excerpt: "Every changelog, every blunder, every milestone: we post it. Here's the case for building transparently, and how it's made CodeBuddy a better product.",
    author: "Vikram Anand", authorRole: "CEO", authorInitials: "VA", authorHue: 290,
    date: "Apr 5, 2026", readTime: "6 min read",
    body: [
      { type: "p", text: "Building in public sounds like a marketing tactic until you've actually done it for a year. Then it becomes something closer to a forcing function for honesty — both with your users and with yourself." },
      { type: "h2", text: "It makes you ship smaller things" },
      { type: "p", text: "When every change is visible, you stop batching six months of work into a single mysterious release. Our changelog posts weekly, sometimes for changes as small as a button label. That habit alone has made our releases less risky, because nothing sits in a branch long enough to drift far from what users actually asked for." },
      { type: "h2", text: "It makes failure cheaper" },
      { type: "p", text: "We posted about a matching algorithm change that backfired — match quality actually dropped for two weeks before we caught it through user feedback, not our own metrics. Being public about the mistake meant we got specific, detailed bug reports instead of silent churn. Users who feel like collaborators report problems. Users who feel like customers just leave." },
      { type: "h2", text: "The discomfort is the point" },
      { type: "p", text: "There's a version of this that's just curated highlight reels, and that's not what we mean. The CodeBuddy changelog includes things we got wrong, reverted, or shipped and then quietly admitted weren't working. If transparency only shows up when things go well, it isn't transparency — it's a different kind of marketing." },
      { type: "p", text: "If you're building something and considering this, start small: post your actual roadmap, including the parts you're unsure about. The discomfort fades faster than you'd think, and what's left is a much more honest relationship with the people using what you build." },
    ],
  },
];

const TAGS = ["All", "Product", "Engineering", "Design", "Community", "Growth", "Culture"];

export default function Blog() {
  const { dark, toggleDark } = useThemeStore();
  const [activeTag, setActiveTag] = useState("All");
  const [activePost, setActivePost] = useState(null);

  const [subEmail, setSubEmail] = useState("");
  const [subState, setSubState] = useState("idle");
  const [subError, setSubError] = useState("");
  const [subscribedEmails, setSubscribedEmails] = useState([]);

  const T = dark ? {
    bg: "#07070f", bg2: "#0d0d1a",
    border: "rgba(255,255,255,0.09)", border2: "rgba(255,255,255,0.14)",
    text: "#e4e4f0", text2: "#8888aa", text3: "#44445a",
    card: "rgba(255,255,255,0.025)", cardHover: "rgba(255,255,255,0.04)",
    navBg: "rgba(7,7,15,0.92)",
    surfaceA: "rgba(124,58,237,0.06)", surfaceBorder: "rgba(124,58,237,0.15)",
  } : {
    bg: "#f4f4f8", bg2: "#ffffff",
    border: "rgba(0,0,0,0.09)", border2: "rgba(0,0,0,0.15)",
    text: "#18182c", text2: "#555570", text3: "#9090b0",
    card: "#ffffff", cardHover: "#f7f7fc",
    navBg: "rgba(244,244,248,0.95)",
    surfaceA: "rgba(124,58,237,0.05)", surfaceBorder: "rgba(124,58,237,0.15)",
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)"};border-radius:99px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    .fade-up{animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both}
    .btn-primary{background:#7c3aed;border:1px solid #7c3aed;color:white;padding:11px 24px;border-radius:8px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:filter 0.15s ease;display:inline-flex;align-items:center;gap:8px}
    .btn-primary:hover{filter:brightness(1.1)}
    .btn-primary:active{filter:brightness(0.95)}
    .btn-primary:disabled{opacity:0.6;cursor:not-allowed;filter:none}
    .btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:9px 18px;border-radius:8px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:border-color 0.15s ease,color 0.15s ease;display:inline-flex;align-items:center;gap:6px}
    .btn-ghost:hover{border-color:${T.border2};color:${T.text}}
    .btn-icon{background:transparent;border:1px solid ${T.border};color:${T.text3};padding:8px;border-radius:8px;cursor:pointer;transition:border-color 0.15s ease,color 0.15s ease;display:flex;align-items:center;justify-content:center}
    .btn-icon:hover{border-color:${T.border2};color:${T.text}}
    .landing-nav{background:${T.navBg};backdrop-filter:blur(28px);border-bottom:1px solid ${T.border}}
    .post-card{background:${T.card};border:1px solid ${T.border};border-radius:10px;padding:24px;transition:border-color 0.15s ease,background 0.15s ease;cursor:pointer;display:flex;flex-direction:column}
    .post-card:hover{background:${T.cardHover};border-color:rgba(139,92,246,${dark ? "0.24" : "0.2"})}
    .tag-pill{padding:5px 13px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid ${T.border};background:transparent;color:${T.text3};transition:border-color 0.15s ease,color 0.15s ease,background 0.15s ease;font-family:'JetBrains Mono',monospace;letter-spacing:0.3px}
    .tag-pill:hover{border-color:rgba(124,58,237,0.35);color:${T.text};background:rgba(124,58,237,0.08)}
    .tag-pill.active{background:rgba(124,58,237,0.15);border-color:rgba(124,58,237,0.4);color:#a78bfa}
    .newsletter-input{background:${T.card};border:1px solid ${T.border};color:${T.text};padding:11px 16px;border-radius:8px;font-family:inherit;font-size:13px;outline:none;transition:border-color 0.15s ease;width:100%}
    .newsletter-input:focus{border-color:rgba(124,58,237,0.4)}
    .newsletter-input.has-error{border-color:rgba(248,113,113,0.6)}
    .newsletter-input::placeholder{color:${T.text3}}
    .newsletter-input:disabled{opacity:0.6}
    .article-body p{font-size:16px;line-height:1.85;color:${T.text2};margin-bottom:22px}
    .article-body h2{font-family:'Inter',sans-serif;font-weight:700;font-size:clamp(22px,4vw,28px);color:${T.text};letter-spacing:-0.7px;margin:38px 0 16px}
    @media(max-width:768px){
      .posts-grid{grid-template-columns:1fr!important}
      .featured-grid{grid-template-columns:1fr!important}
    }
    @media(max-width:480px){.nav-ghost{display:none}}
  `;

  const filtered = activeTag === "All" ? POSTS : POSTS.filter(p => p.tag === activeTag);
  const featured = POSTS[0];

  const AuthorChip = ({ p, size = 32 }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: size, height: size, borderRadius: 8, background: hsla(p.authorHue, 70, 60, dark ? 0.14 : 0.1), border: `1.5px solid ${hsla(p.authorHue, 70, 60, 0.28)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: hsl(p.authorHue), flexShrink: 0, fontFamily: "'JetBrains Mono',monospace" }}>
        {p.authorInitials}
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{p.author}</div>
        <div style={{ fontSize: 10, color: T.text3 }}>{p.authorRole}</div>
      </div>
    </div>
  );

  const TagBadge = ({ tag, hue }) => (
    <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: hsla(hue, 70, 60, dark ? 0.12 : 0.09), border: `1px solid ${hsla(hue, 70, 60, 0.28)}`, color: hsl(hue), fontFamily: "'JetBrains Mono',monospace" }}>
      {tag}
    </span>
  );

  const openPost = (post) => {
    setActivePost(post);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const closePost = () => {
    setActivePost(null);
  };

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const trimmed = subEmail.trim();

    if (!trimmed) {
      setSubError("Enter your email to subscribe.");
      setSubState("idle");
      return;
    }
    if (!validateEmail(trimmed)) {
      setSubError("That email doesn't look right.");
      setSubState("idle");
      return;
    }
    if (subscribedEmails.includes(trimmed.toLowerCase())) {
      setSubError("");
      setSubState("duplicate");
      return;
    }

    setSubError("");
    setSubState("submitting");
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.06) reject(new Error("network"));
          else resolve();
        }, 1000);
      });
      setSubscribedEmails(prev => [...prev, trimmed.toLowerCase()]);
      setSubState("success");
    } catch {
      setSubState("error");
    }
  };

  const resetSub = () => {
    setSubEmail("");
    setSubError("");
    setSubState("idle");
  };

  if (activePost) {
    const p = activePost;
    const related = POSTS.filter(post => post.id !== p.id && post.tag === p.tag).slice(0, 2);
    const fallbackRelated = related.length ? related : POSTS.filter(post => post.id !== p.id).slice(0, 2);

    return (
      <div style={{ fontFamily: "'Inter',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
        <style>{css}</style>

        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-18%", left: "-8%", width: 650, height: 650, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.09)" : "hsla(259,70%,60%,0.04)"} 0%,transparent 65%)` }} />
        </div>

        <nav className="landing-nav" style={{ position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(16px,5vw,32px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Logo />
            <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 18, color: T.text, letterSpacing: "-0.4px" }}>CodeBuddy</span>
          </Link>
          <button className="btn-ghost" onClick={closePost}><ArrowLeft style={iconSize(12, 13)} /> All posts</button>
        </nav>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "clamp(40px,8vw,72px) clamp(16px,5vw,32px) 0" }}>
          <div className="fade-up">
            <button className="btn-ghost" onClick={closePost} style={{ marginBottom: 28, fontSize: 12, padding: "7px 14px" }}><ArrowLeft style={iconSize(11, 12)} /> Back to all posts</button>

            <div style={{ marginBottom: 18 }}>
              <TagBadge tag={p.tag} hue={p.tagHue} />
            </div>

            <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(28px,6vw,46px)", fontWeight: 700, letterSpacing: "-1.4px", lineHeight: 1.1, color: T.text, marginBottom: 26 }}>
              {p.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, paddingBottom: 28, marginBottom: 36, borderBottom: `1px solid ${T.border}` }}>
              <AuthorChip p={p} size={40} />
              <div style={{ display: "flex", gap: 16 }}>
                <span style={{ fontSize: 12, color: T.text3 }}>{p.date}</span>
                <span style={{ fontSize: 12, color: T.text3 }}>·</span>
                <span style={{ fontSize: 12, color: T.text3 }}>{p.readTime}</span>
              </div>
            </div>
          </div>

          <div className="article-body fade-up" style={{ animationDelay: "0.05s" }}>
            {p.body.map((block, i) =>
              block.type === "h2"
                ? <h2 key={i}>{block.text}</h2>
                : <p key={i}>{block.text}</p>
            )}
          </div>

          <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: 14, padding: "24px 0", marginTop: 20, borderTop: `1px solid ${T.border}` }}>
            <AuthorChip p={p} size={44} />
          </div>
        </div>

        <section style={{ position: "relative", zIndex: 1, maxWidth: 1060, margin: "0 auto", padding: "20px clamp(16px,5vw,32px) clamp(60px,10vw,90px)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 16, fontFamily: "'JetBrains Mono',monospace" }}>Keep reading</div>
          <div className="posts-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {fallbackRelated.map(rp => (
              <div key={rp.id} className="post-card" onClick={() => openPost(rp)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <TagBadge tag={rp.tag} hue={rp.tagHue} />
                  <span style={{ fontSize: 11, color: T.text3 }}>{rp.readTime}</span>
                </div>
                <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(16px,3vw,19px)", fontWeight: 700, color: T.text, letterSpacing: "-0.4px", lineHeight: 1.25, marginBottom: 10 }}>{rp.title}</h3>
                <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.65, marginBottom: 16 }}>{rp.excerpt}</p>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <AuthorChip p={rp} size={26} />
                  <span style={{ fontSize: 11, color: T.text3 }}>{rp.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{css}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-18%", left: "-8%", width: 650, height: 650, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.11)" : "hsla(259,70%,60%,0.055)"} 0%,transparent 65%)` }} />
        {dark && <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.018 }} xmlns="http://www.w3.org/2000/svg"><defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#g)" /></svg>}
      </div>

      <nav className="landing-nav" style={{ position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(16px,5vw,32px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Logo />
          <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 18, color: T.text, letterSpacing: "-0.4px" }}>CodeBuddy</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>

        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "clamp(52px,10vw,90px) clamp(16px,5vw,32px) 36px", textAlign: "center" }}>
          <div className="fade-up">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 6, padding: "4px 13px", marginBottom: 20 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace" }}>The CodeBuddy Blog</span>
            </div>
            <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(32px,8vw,56px)", fontWeight: 700, lineHeight: 1.06, letterSpacing: "-1.6px", color: T.text, marginBottom: 16 }}>
              Stories, engineering,<br /><span style={{ color: "#a78bfa" }}>and the craft of shipping.</span>
            </h1>
            <p style={{ fontSize: "clamp(13px,3vw,15px)", color: T.text2, lineHeight: 1.68, maxWidth: 480, margin: "0 auto" }}>
              Behind-the-scenes posts from the team building CodeBuddy — product decisions, engineering challenges, and builder stories.
            </p>
          </div>
        </section>

        {activeTag === "All" && (
          <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) 32px" }}>
            <div className="fade-up" style={{ background: dark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.04)", border: `1px solid rgba(124,58,237,0.18)`, borderRadius: 14, padding: "clamp(28px,5vw,44px)", cursor: "pointer", transition: "border-color 0.15s ease", position: "relative", overflow: "hidden" }}
              onClick={() => openPost(featured)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.32)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.18)"; }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,50%,0.07)" : "hsla(259,70%,60%,0.05)"} 0%,transparent 65%)`, pointerEvents: "none" }} />
              <div className="featured-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center", position: "relative" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                    <TagBadge tag={featured.tag} hue={featured.tagHue} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.5px", textTransform: "uppercase", background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 6, padding: "3px 10px", fontFamily: "'JetBrains Mono',monospace" }}>Featured</span>
                  </div>
                  <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(22px,4vw,34px)", fontWeight: 700, color: T.text, letterSpacing: "-1px", lineHeight: 1.14, marginBottom: 14 }}>{featured.title}</h2>
                  <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.72, marginBottom: 22 }}>{featured.excerpt}</p>
                  <button className="btn-primary" style={{ padding: "10px 22px", fontSize: 13 }} onClick={(e) => { e.stopPropagation(); openPost(featured); }}>Read post <ArrowRight style={iconSize(13, 14)} /></button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <AuthorChip p={featured} size={44} />
                  <div style={{ height: 1, background: T.border }} />
                  <div style={{ display: "flex", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Published</div>
                      <div style={{ fontSize: 13, color: T.text2, fontFamily: "'JetBrains Mono',monospace" }}>{featured.date}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Read time</div>
                      <div style={{ fontSize: 13, color: T.text2, fontFamily: "'JetBrains Mono',monospace" }}>{featured.readTime}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) 28px" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TAGS.map(tag => (
              <button key={tag} className={`tag-pill${activeTag === tag ? " active" : ""}`} onClick={() => setActiveTag(tag)}>{tag}</button>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(50px,10vw,80px)" }}>
          <div className="posts-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {(activeTag === "All" ? POSTS.slice(1) : filtered).map((p, i) => (
              <div key={p.id} className="post-card fade-up" style={{ animationDelay: `${i * 0.07}s` }} onClick={() => openPost(p)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <TagBadge tag={p.tag} hue={p.tagHue} />
                  <span style={{ fontSize: 11, color: T.text3 }}>{p.readTime}</span>
                </div>
                <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(16px,3vw,20px)", fontWeight: 700, color: T.text, letterSpacing: "-0.4px", lineHeight: 1.25, marginBottom: 10 }}>{p.title}</h3>
                <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.68, marginBottom: 18, flexGrow: 1 }}>{p.excerpt}</p>
                <div style={{ height: 1, background: T.border, marginBottom: 14 }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <AuthorChip p={p} size={28} />
                  <span style={{ fontSize: 11, color: T.text3 }}>{p.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(60px,12vw,100px)" }}>
          <div style={{ background: dark ? "rgba(124,58,237,0.07)" : "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 14, padding: "clamp(32px,6vw,52px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 260, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,50%,0.07)" : "hsla(259,70%,60%,0.05)"} 0%,transparent 65%)`, pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>

              {subState === "success" ? (
                <div style={{ padding: "8px 0" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <CheckCircle2 style={{ ...iconSize(20, 22), color: "#22c55e" }} strokeWidth={2} />
                  </div>
                  <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 700, color: T.text, letterSpacing: "-0.8px", marginBottom: 10 }}>You're subscribed</h2>
                  <p style={{ fontSize: 13, color: T.text2, marginBottom: 22, maxWidth: 340, margin: "0 auto 22px" }}>
                    We sent a confirmation to <strong style={{ color: T.text }}>{subscribedEmails[subscribedEmails.length - 1]}</strong>. New posts land in your inbox twice a month.
                  </p>
                  <button className="btn-ghost" onClick={resetSub}>Subscribe another email</button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                    <Mail style={{ ...iconSize(26, 32), color: "#a78bfa" }} strokeWidth={1.75} />
                  </div>
                  <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(22px,5vw,36px)", fontWeight: 700, color: T.text, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 10 }}>
                    New posts, straight to<br /><span style={{ color: "#a78bfa" }}>your inbox.</span>
                  </h2>
                  <p style={{ fontSize: 13, color: T.text2, marginBottom: 28, maxWidth: 340, margin: "0 auto 28px" }}>
                    No spam. No marketing fluff. Just honest engineering and product writing, twice a month.
                  </p>
                  <form onSubmit={handleSubscribe} noValidate>
                    <div style={{ display: "flex", gap: 10, maxWidth: 400, margin: "0 auto", flexWrap: "wrap", alignItems: "flex-start" }}>
                      <div style={{ flex: 1, minWidth: 200, textAlign: "left" }}>
                        <input
                          className={`newsletter-input${subError ? " has-error" : ""}`}
                          type="email"
                          placeholder="you@awesome.dev"
                          value={subEmail}
                          disabled={subState === "submitting"}
                          onChange={(e) => { setSubEmail(e.target.value); if (subError) setSubError(""); if (subState !== "idle") setSubState("idle"); }}
                        />
                        {subError && <div style={{ fontSize: 11, color: "#f87171", fontWeight: 600, marginTop: 6 }}>{subError}</div>}
                        {subState === "duplicate" && <div style={{ fontSize: 11, color: T.text2, fontWeight: 600, marginTop: 6 }}>That email's already subscribed.</div>}
                        {subState === "error" && <div style={{ fontSize: 11, color: "#f87171", fontWeight: 600, marginTop: 6 }}>Couldn't subscribe — check your connection and try again.</div>}
                      </div>
                      <button type="submit" className="btn-primary" style={{ whiteSpace: "nowrap" }} disabled={subState === "submitting"}>
                        {subState === "submitting" ? "Subscribing…" : <>Subscribe <ArrowRight style={iconSize(13, 14)} /></>}
                      </button>
                    </div>
                  </form>
                  <p style={{ marginTop: 14, fontSize: 11, color: T.text3, fontFamily: "'JetBrains Mono',monospace" }}>Join {1400 + subscribedEmails.length}+ developers already subscribed.</p>
                </>
              )}
            </div>
          </div>
        </section>

        <footer style={{ borderTop: `1px solid ${T.border}`, padding: "clamp(28px,5vw,44px) clamp(16px,5vw,32px)", maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <Logo />
              <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 16, color: T.text }}>CodeBuddy</span>
            </Link>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {["About", "Careers", "Press", "Privacy", "Terms"].map(l => (
                <Link key={l} href={`/${l.toLowerCase()}`} style={{ fontSize: 13, color: T.text3, textDecoration: "none" }}>{l}</Link>
              ))}
            </div>
            <span style={{ fontSize: 12, color: T.text3, display: "inline-flex", alignItems: "center", gap: 4 }}>© 2026 CodeBuddy · Made with <Heart style={iconSize(11, 12)} fill="#f87171" stroke="#f87171" /> in India</span>
          </div>
        </footer>
      </div>
    </div>
  );
}