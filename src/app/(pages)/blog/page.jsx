"use client"
import { useState } from "react";
import Link from "next/link";

const Logo = () => (
  <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  },
  {
    id: 2, featured: false,
    tag: "Community", tagHue: 158,
    title: "From a cold DM to a shipped startup: Meera & Rohan's story",
    excerpt: "They matched on a Tuesday. By Saturday they had a GitHub repo. Three weeks later, Notara had 2,400 users. Here's how they did it.",
    author: "Priya Iyer", authorRole: "Community Lead", authorInitials: "PI", authorHue: 158,
    date: "May 15, 2026", readTime: "5 min read",
  },
  {
    id: 3, featured: false,
    tag: "Engineering", tagHue: 38,
    title: "Building a real-time matching system at scale with Rust",
    excerpt: "When we hit 1k users, our matching pipeline buckled. We rewrote it in Rust. Here's what we learned about concurrency, latency, and the joy of zero-cost abstractions.",
    author: "Rahul Verma", authorRole: "Lead Engineer", authorInitials: "RV", authorHue: 38,
    date: "May 8, 2026", readTime: "12 min read",
  },
  {
    id: 4, featured: false,
    tag: "Design", tagHue: 340,
    title: "Designing for developers: why we threw out our first UI",
    excerpt: "Developer tools have a design problem. They're either over-engineered dashboards or barebones CLIs. We tried to find a third path — and failed once before getting it right.",
    author: "Arjun Das", authorRole: "Head of Design", authorInitials: "AD", authorHue: 340,
    date: "Apr 29, 2026", readTime: "7 min read",
  },
  {
    id: 5, featured: false,
    tag: "Growth", tagHue: 200,
    title: "0 to 12,000 waitlist in 60 days: the honest post-mortem",
    excerpt: "No paid ads. No influencer deals. Just a landing page, a clear value prop, and one viral Twitter thread. Here's everything that worked — and what nearly tanked it.",
    author: "Sanya Mehta", authorRole: "Head of Growth", authorInitials: "SM", authorHue: 200,
    date: "Apr 18, 2026", readTime: "9 min read",
  },
  {
    id: 6, featured: false,
    tag: "Culture", tagHue: 290,
    title: "Why we ship in public — and why you should too",
    excerpt: "Every changelog, every blunder, every milestone: we post it. Here's the case for building transparently, and how it's made CodeBuddy a better product.",
    author: "Vikram Anand", authorRole: "CEO", authorInitials: "VA", authorHue: 290,
    date: "Apr 5, 2026", readTime: "6 min read",
  },
];

const TAGS = ["All", "Product", "Engineering", "Design", "Community", "Growth", "Culture"];

export default function Blog() {
  const [dark, setDark] = useState(true);
  const [activeTag, setActiveTag] = useState("All");

  const T = dark ? {
    bg: "#07070f", bg2: "#0d0d1a",
    border: "rgba(255,255,255,0.06)", border2: "rgba(255,255,255,0.11)",
    text: "#e4e4f0", text2: "#8888aa", text3: "#44445a",
    card: "rgba(255,255,255,0.025)", cardHover: "rgba(255,255,255,0.04)",
    navBg: "rgba(7,7,15,0.92)",
    shadow: "0 24px 64px rgba(0,0,0,0.55)",
    surfaceA: "rgba(124,58,237,0.06)", surfaceBorder: "rgba(124,58,237,0.15)",
  } : {
    bg: "#f4f4f8", bg2: "#ffffff",
    border: "rgba(0,0,0,0.07)", border2: "rgba(0,0,0,0.13)",
    text: "#18182c", text2: "#555570", text3: "#9090b0",
    card: "#ffffff", cardHover: "#f7f7fc",
    navBg: "rgba(244,244,248,0.95)",
    shadow: "0 20px 60px rgba(0,0,0,0.1)",
    surfaceA: "rgba(124,58,237,0.05)", surfaceBorder: "rgba(124,58,237,0.15)",
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)"};border-radius:99px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    .fade-up{animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both}
    .btn-primary{background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:11px 24px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 6px 24px rgba(124,58,237,0.28)}
    .btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(124,58,237,0.42)}
    .btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.text2};padding:9px 18px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s}
    .btn-ghost:hover{border-color:${T.border2};color:${T.text}}
    .btn-icon{background:transparent;border:1px solid ${T.border};color:${T.text3};padding:8px;border-radius:10px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center}
    .btn-icon:hover{border-color:${T.border2};color:${T.text}}
    .landing-nav{background:${T.navBg};backdrop-filter:blur(28px);border-bottom:1px solid ${T.border}}
    .post-card{background:${T.card};border:1px solid ${T.border};border-radius:18px;padding:24px;transition:all 0.28s;cursor:pointer}
    .post-card:hover{background:${T.cardHover};border-color:${T.border2};transform:translateY(-3px);box-shadow:${T.shadow}}
    .tag-pill{padding:5px 13px;border-radius:99px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid ${T.border};background:transparent;color:${T.text3};transition:all 0.15s;font-family:inherit;letter-spacing:0.3px}
    .tag-pill:hover{border-color:rgba(124,58,237,0.35);color:${T.text};background:rgba(124,58,237,0.08)}
    .tag-pill.active{background:rgba(124,58,237,0.15);border-color:rgba(124,58,237,0.4);color:#a78bfa}
    .newsletter-input{background:${T.card};border:1px solid ${T.border};color:${T.text};padding:11px 16px;border-radius:11px;font-family:inherit;font-size:13px;outline:none;transition:border-color 0.2s;width:100%}
    .newsletter-input:focus{border-color:rgba(124,58,237,0.4)}
    .newsletter-input::placeholder{color:${T.text3}}
    @media(max-width:768px){
      .posts-grid{grid-template-columns:1fr!important}
      .featured-grid{grid-template-columns:1fr!important}
    }
    @media(max-width:480px){.nav-ghost{display:none}}
  `;

  const filtered = activeTag === "All" ? POSTS : POSTS.filter(p => p.tag === activeTag);
  const featured = POSTS[0];
  const rest = filtered.filter(p => !p.featured || activeTag !== "All");

  const AuthorChip = ({ p, size = 32 }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: size, height: size, borderRadius: 9, background: hsla(p.authorHue, 70, 60, dark ? 0.14 : 0.1), border: `1.5px solid ${hsla(p.authorHue, 70, 60, 0.28)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: hsl(p.authorHue), flexShrink: 0, fontFamily: "'Instrument Serif',serif" }}>
        {p.authorInitials}
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{p.author}</div>
        <div style={{ fontSize: 10, color: T.text3 }}>{p.authorRole}</div>
      </div>
    </div>
  );

  const TagBadge = ({ tag, hue }) => (
    <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: hsla(hue, 70, 60, dark ? 0.12 : 0.09), border: `1px solid ${hsla(hue, 70, 60, 0.28)}`, color: hsl(hue) }}>
      {tag}
    </span>
  );

  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{css}</style>

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-18%", left: "-8%", width: 650, height: 650, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.11)" : "hsla(259,70%,60%,0.055)"} 0%,transparent 65%)` }} />
        {dark && <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.018 }} xmlns="http://www.w3.org/2000/svg"><defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#g)" /></svg>}
      </div>

      {/* Nav */}
      <nav className="landing-nav" style={{ position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(16px,5vw,32px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Logo />
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: T.text, letterSpacing: "-0.3px" }}>CodeBuddy</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── HERO ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "clamp(52px,10vw,90px) clamp(16px,5vw,32px) 36px", textAlign: "center" }}>
          <div className="fade-up">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 99, padding: "4px 13px", marginBottom: 20 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.8px", textTransform: "uppercase" }}>The CodeBuddy Blog</span>
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(32px,8vw,56px)", fontWeight: 400, lineHeight: 1.06, letterSpacing: "-1.8px", color: T.text, marginBottom: 16 }}>
              Stories, engineering,<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>and the craft of shipping.</span>
            </h1>
            <p style={{ fontSize: "clamp(13px,3vw,15px)", color: T.text2, lineHeight: 1.68, maxWidth: 480, margin: "0 auto" }}>
              Behind-the-scenes posts from the team building CodeBuddy — product decisions, engineering challenges, and builder stories.
            </p>
          </div>
        </section>

        {/* ── FEATURED POST ── */}
        {activeTag === "All" && (
          <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) 32px" }}>
            <div className="fade-up" style={{ background: dark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.04)", border: `1px solid rgba(124,58,237,0.18)`, borderRadius: 22, padding: "clamp(28px,5vw,44px)", cursor: "pointer", transition: "all 0.28s", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = T.shadow; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,50%,0.07)" : "hsla(259,70%,60%,0.05)"} 0%,transparent 65%)`, pointerEvents: "none" }} />
              <div className="featured-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center", position: "relative" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                    <TagBadge tag={featured.tag} hue={featured.tagHue} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.5px", textTransform: "uppercase", background: T.surfaceA, border: `1px solid ${T.surfaceBorder}`, borderRadius: 99, padding: "3px 10px" }}>Featured</span>
                  </div>
                  <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(22px,4vw,34px)", fontWeight: 400, color: T.text, letterSpacing: "-0.8px", lineHeight: 1.14, marginBottom: 14 }}>{featured.title}</h2>
                  <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.72, marginBottom: 22 }}>{featured.excerpt}</p>
                  <button className="btn-primary" style={{ padding: "10px 22px", fontSize: 13 }}>Read post →</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <AuthorChip p={featured} size={44} />
                  <div style={{ height: 1, background: T.border }} />
                  <div style={{ display: "flex", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Published</div>
                      <div style={{ fontSize: 13, color: T.text2 }}>{featured.date}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Read time</div>
                      <div style={{ fontSize: 13, color: T.text2 }}>{featured.readTime}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── FILTER TAGS ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) 28px" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TAGS.map(tag => (
              <button key={tag} className={`tag-pill${activeTag === tag ? " active" : ""}`} onClick={() => setActiveTag(tag)}>{tag}</button>
            ))}
          </div>
        </section>

        {/* ── POSTS GRID ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(50px,10vw,80px)" }}>
          <div className="posts-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {(activeTag === "All" ? POSTS.slice(1) : filtered).map((p, i) => (
              <div key={p.id} className="post-card fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <TagBadge tag={p.tag} hue={p.tagHue} />
                  <span style={{ fontSize: 11, color: T.text3 }}>{p.readTime}</span>
                </div>
                <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(16px,3vw,20px)", fontWeight: 400, color: T.text, letterSpacing: "-0.4px", lineHeight: 1.25, marginBottom: 10 }}>{p.title}</h3>
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

        {/* ── NEWSLETTER ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 clamp(16px,5vw,32px) clamp(60px,12vw,100px)" }}>
          <div style={{ background: dark ? "rgba(124,58,237,0.07)" : "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 22, padding: "clamp(32px,6vw,52px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 260, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,50%,0.07)" : "hsla(259,70%,60%,0.05)"} 0%,transparent 65%)`, pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>📬</div>
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(22px,5vw,36px)", color: T.text, letterSpacing: "-0.8px", lineHeight: 1.1, marginBottom: 10 }}>
                New posts, straight to<br /><span style={{ fontStyle: "italic", color: "#a78bfa" }}>your inbox.</span>
              </h2>
              <p style={{ fontSize: 13, color: T.text2, marginBottom: 28, maxWidth: 340, margin: "0 auto 28px" }}>
                No spam. No marketing fluff. Just honest engineering and product writing, twice a month.
              </p>
              <div style={{ display: "flex", gap: 10, maxWidth: 400, margin: "0 auto", flexWrap: "wrap" }}>
                <input className="newsletter-input" type="email" placeholder="you@awesome.dev" style={{ flex: 1, minWidth: 200 }} />
                <button className="btn-primary" style={{ whiteSpace: "nowrap" }}>Subscribe →</button>
              </div>
              <p style={{ marginTop: 14, fontSize: 11, color: T.text3 }}>Join 1,400+ developers already subscribed.</p>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: `1px solid ${T.border}`, padding: "clamp(28px,5vw,44px) clamp(16px,5vw,32px)", maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <Logo />
              <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 16, color: T.text }}>CodeBuddy</span>
            </Link>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {["About", "Careers", "Press", "Privacy", "Terms"].map(l => (
                <Link key={l} href={`/${l.toLowerCase()}`} style={{ fontSize: 13, color: T.text3, textDecoration: "none" }}>{l}</Link>
              ))}
            </div>
            <span style={{ fontSize: 12, color: T.text3 }}>© 2026 CodeBuddy · Made with ♥ in India</span>
          </div>
        </footer>
      </div>
    </div>
  );
}