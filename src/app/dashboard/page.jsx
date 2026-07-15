"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DARK, LIGHT,
  INITIAL_NOTIFS, DEFAULT_USER,
  hsl, hsla,
} from "./shared";

import { useThemeStore } from "../../../store/themeprovider";

import DiscoverTab      from "./discover/page";
import MessagesTab      from "./messages/page";
import ProfileTab       from "./profile/page";
import SettingsTab      from "./settings/page";
import OtherProfileTab  from "../dashboard/discover/profile/page";

import {
  Code, MessageSquare, User, Settings, Bell, Sun, Moon,
} from "lucide-react";

// Responsive icon sizing: scales fluidly between breakpoints instead of a
// fixed pixel size, matching the convention used across the rest of the app.
const iconSize = (min, max, vw = 3) => ({
  width: `clamp(${min}px, ${vw}vw, ${max}px)`,
  height: `clamp(${min}px, ${vw}vw, ${max}px)`,
  flexShrink: 0,
});

const NAV_ITEMS = [
  { id: "discover", Icon: Code,           label: "Discover" },
  { id: "messages", Icon: MessageSquare,  label: "Messages" },
  { id: "profile",  Icon: User,           label: "Profile"  },
  { id: "settings", Icon: Settings,       label: "Settings" },
];

export default function Dashboard() {
  const router = useRouter();
  const { dark, toggleDark } = useThemeStore();

  const [dashPage,    setDashPage]    = useState("discover");
  const [currentUser, setCurrentUser] = useState(DEFAULT_USER);  // will be overwritten with real data
  const [convos,      setConvos]      = useState([]);             // loaded from Supabase
  const [activeConvo, setActiveConvo] = useState(null);
  const [notifs,      setNotifs]      = useState(INITIAL_NOTIFS);
  const [connected,   setConnected]   = useState({});
  const [liked,       setLiked]       = useState({});
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [viewUserId,  setViewUserId]  = useState(null); // ← NEW: id of the profile currently being viewed

  const T = dark ? DARK : LIGHT;
  const unread = notifs.filter(n => !n.read).length;

  // ── 1. Load the logged-in user's profile from Supabase ──────────────────
  // This gives us currentUser.id (a real UUID) which everything else depends on
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const res = await fetch("/api/me");
        const json = await res.json();

        if (!json.error && json.data) {
          const data = json.data;
          setCurrentUser({
            ...DEFAULT_USER,
            ...data,
            skillsHave: data.skills_have ?? DEFAULT_USER.skillsHave ?? [],
            skillsNeed: data.skills_need ?? DEFAULT_USER.skillsNeed ?? [],
          });
          return;
        }

        const profileRes = await fetch("/api/profile");
        const profileJson = await profileRes.json();
        if (profileJson.success && profileJson.profile) {
          const data = profileJson.profile;
          setCurrentUser({
            ...DEFAULT_USER,
            ...data,
            skillsHave: data.skills_have ?? DEFAULT_USER.skillsHave ?? [],
            skillsNeed: data.skills_need ?? DEFAULT_USER.skillsNeed ?? [],
          });
        }
      } catch (err) {
        console.error("Failed to load current user:", err);
      }
    }

    loadCurrentUser();
  }, []);

  // ── 2. Load real conversations from Supabase once we have currentUser.id ─
  useEffect(() => {
    fetch("/api/conversations")
      .then(r => r.json())
      .then(({ data, error }) => {
        if (!error && data) {
          // Shape into the format MessagesTab expects:
          // { id, user (partner profile), messages: [lastMessage] }
          const shaped = data.map(c => ({
            id:       c.id,
            user:     {
              ...c.partner,
              skillsHave: c.partner.skills_have ?? [],
              skillsNeed: c.partner.skills_need ?? [],
              hue:        c.partner.hue ?? ((c.partner.name?.charCodeAt(0) ?? 0) * 37) % 360,
              online:     c.partner.online ?? false,
              followers:  c.partner.followers ?? 0,
              projects:   c.partner.projects ?? 0,
            },
            messages: c.lastMessage ? [c.lastMessage] : [],
          }));
          setConvos(shaped);
          // Auto-select the first conversation
          if (shaped.length > 0 && !activeConvo) {
            setActiveConvo(shaped[0]);
          }
        }
      })
      .catch(err => console.error("Failed to load conversations:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only auto-select on first load
  }, []);

  // ── 3. handleMessage — creates a real conversation in Supabase ──────────
  // Called from DiscoverTab when user clicks "Message" on a profile card
  const handleMessage = useCallback(async (user) => {
    if (!user?.id) {
      console.error("Cannot message: profile has no id");
      return;
    }

    const existing = convos.find(c => c.user.id === user.id);
    if (existing) {
      setActiveConvo(existing);
      setDashPage("messages");
      return;
    }

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_b_id: user.id }),
      });
      const { data, error } = await res.json();

      if (error || !data) {
        console.error("Failed to create conversation:", error);
        return;
      }

      // Add the new conversation to the local list
      const newConvo = {
        id:       data.id,             // ✅ real UUID from conversations table
        user:     {
          ...user,
          skillsHave: user.skills_have ?? user.skillsHave ?? [],
          skillsNeed: user.skills_need ?? user.skillsNeed ?? [],
          hue:        user.hue ?? ((user.name?.charCodeAt(0) ?? 0) * 37) % 360,
          online:     user.online ?? false,
          followers:  user.followers ?? 0,
          projects:   user.projects ?? 0,
        },
        messages: [],
      };

      setConvos(prev => [newConvo, ...prev]);
      setActiveConvo(newConvo);
    } catch (err) {
      console.error("handleMessage error:", err);
    }

    setDashPage("messages");
  }, [convos]);

  // ── Connection handler ───────────────────────────────────────────────────
  const handleConnect = useCallback(async (user) => {
    const wasConnected = connected[user.id];
    setConnected(prev => ({ ...prev, [user.id]: !wasConnected }));
    try {
      const res = await fetch("/api/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: user.id }),
      });
      const json = await res.json();
      setConnected(prev => ({ ...prev, [user.id]: json.action !== "removed" }));
    } catch {
      setConnected(prev => ({ ...prev, [user.id]: wasConnected }));
    }
  }, [connected]);

  // ── Favourite handler ────────────────────────────────────────────────────
  const handleFavourite = useCallback(async (user) => {
    const wasFav = liked[user.id];
    setLiked(prev => ({ ...prev, [user.id]: !wasFav }));
    try {
      const res = await fetch("/api/favourites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: user.id }),
      });
      const json = await res.json();
      setLiked(prev => ({ ...prev, [user.id]: json.action !== "removed" }));
    } catch {
      setLiked(prev => ({ ...prev, [user.id]: wasFav }));
    }
  }, [liked]);

  // ── View-profile handler ─────────────────────────────────────────────────
  // Called from DiscoverTab (via its confirm modal's "Learn More" button)
  // with the id of the user whose full profile should be shown. This is the
  // piece that "embeds" the id from Discover and hands it to OtherProfileTab.
  const handleViewProfile = useCallback((userId) => {
    if (!userId) return;
    setViewUserId(userId);
    setDashPage("otherprofile");
  }, []);

  const globalCss = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)"};border-radius:99px}
    input,textarea,select{font-family:'Inter',sans-serif}
    textarea{resize:none}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
    .fade-up{animation:fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both}
    .fade-in{animation:fadeIn 0.25s ease both}
    .card{background:${T.card};border:1px solid ${T.border};border-radius:10px;transition:border-color 0.15s ease,background 0.15s ease}
    .card:hover{background:${T.cardHover};border-color:${T.border2}}
    .card-flat{background:${T.card};border:1px solid ${T.border};border-radius:10px}
    .notif-backdrop{display:none}
    @media(max-width:768px){
      .db-main{padding:16px 12px !important}
      .desk-nav{display:none !important}
      .mob-bottom-nav{display:flex !important}
      .db-main{padding-bottom:80px !important}

      /* Notifications panel becomes a fixed sheet under the header instead
         of a dropdown pinned to the bell icon, so it can't overflow the
         viewport on narrow screens. */
      .notif-panel{
        position:fixed !important;
        top:66px !important;
        left:8px !important;
        right:8px !important;
        width:auto !important;
        max-height:calc(100vh - 96px) !important;
        overflow-y:auto !important;
      }
      .notif-backdrop{
        display:block !important;
      }
    }
    @media(min-width:769px){.mob-bottom-nav{display:none !important}}
    .mob-bottom-nav{
      display:none;
      position:fixed;bottom:0;left:0;right:0;
      backdrop-filter:blur(20px);
      border-top:1px solid ${T.border};
      z-index:200;padding:8px 0 12px;
      background:${dark ? "rgba(10,10,15,0.95)" : "rgba(250,250,250,0.97)"};
    }
  `;

  const LogoIcon = ({ size = 30 }) => (
    <div style={{ width: size, height: size, borderRadius: 8, overflow: "hidden", flexShrink: 0, display: "flex" }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill="#1a0a6a" />
        <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill={dark ? "#a78bfa" : "#ffffff"} />
      </svg>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{globalCss}</style>

      {/* Ambient bg blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-15%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.07)" : "hsla(259,70%,60%,0.04)"} 0%,transparent 65%)` }} />
        <div style={{ position: "absolute", bottom: "-10%", right: 0, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(280,60%,30%,0.05)" : "hsla(280,60%,60%,0.03)"} 0%,transparent 65%)` }} />
      </div>

      {/* ── Top nav ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 200, background: dark ? "rgba(10,10,15,0.92)" : "rgba(250,250,250,0.94)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}`, padding: "0 22px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }} onClick={() => router.push("/")}>
          <LogoIcon />
          <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 15, color: T.text, letterSpacing: "-0.2px" }}>CodeBuddy</span>
        </div>

        <nav className="desk-nav" style={{ display: "flex", gap: 2 }}>
          {NAV_ITEMS.map(n => (
            <button key={n.id} onClick={() => setDashPage(n.id)} style={{ background: dashPage === n.id ? dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.08)" : "none", border: "none", color: dashPage === n.id ? dark ? "#e0d8ff" : "#7c3aed" : T.text3, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, padding: "8px 13px", borderRadius: 8, display: "flex", alignItems: "center", gap: 7, transition: "background 0.15s,color 0.15s" }}>
              <n.Icon style={iconSize(14, 16)} />
              {n.label}
              {n.id === "messages" && convos.length > 0 && (
                <span style={{ background: "#7c3aed", color: "white", fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", padding: "1px 5px", borderRadius: 6 }}>{convos.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <button onClick={() => setNotifOpen(p => !p)} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${T.border}`, color: T.text3, borderRadius: 8, cursor: "pointer", position: "relative", transition: "border-color 0.15s,color 0.15s" }}>
              <Bell style={iconSize(15, 17)} />
              {unread > 0 && <span style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, background: "#ef4444", borderRadius: "50%", border: `2px solid ${T.bg}` }} />}
            </button>
            {notifOpen && (
              <>
                {/* Tap-outside-to-close backdrop — mobile only (hidden on desktop via CSS) */}
                <div
                  className="notif-backdrop"
                  onClick={() => setNotifOpen(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 290, background: "rgba(0,0,0,0.35)" }}
                />
                <div className="card-flat fade-in notif-panel" style={{ position: "absolute", right: 0, top: 42, width: 300, zIndex: 300, overflow: "hidden", background: T.card }}>
                  <div style={{ padding: "13px 16px 10px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Notifications</span>
                      {unread > 0 && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", padding: "1px 6px", borderRadius: 6, background: "#7c3aed", color: "white" }}>{unread} new</span>}
                    </div>
                    <button onClick={() => setNotifs(p => p.map(n => ({ ...n, read: true })))} style={{ background: "none", border: "none", cursor: "pointer", color: "#7c3aed", fontSize: 11, fontFamily: "inherit", fontWeight: 600 }}>Mark all read</button>
                  </div>
                  {notifs.map((n, i) => (
                    <div key={n.id} style={{ padding: "11px 16px", borderBottom: i < notifs.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 10, background: n.read ? "transparent" : dark ? "rgba(124,58,237,0.04)" : "rgba(124,58,237,0.03)", cursor: "pointer" }} onClick={() => setNotifs(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: n.read ? T.text3 : hsl(n.hue), marginTop: 5, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: n.read ? T.text3 : T.text, lineHeight: 1.4 }}>{n.text}</div>
                        <div style={{ fontSize: 10, color: T.text3, marginTop: 3, fontFamily: "'JetBrains Mono',monospace" }}>{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <button onClick={() => toggleDark(p => !p)} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${T.border}`, color: T.text3, borderRadius: 8, cursor: "pointer", transition: "border-color 0.15s,color 0.15s" }}>
            {dark ? <Sun style={iconSize(15, 17)} /> : <Moon style={iconSize(15, 17)} />}
          </button>

          <div onClick={() => setDashPage("profile")} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(124,58,237,0.14)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "#c4b5fd", cursor: "pointer" }}>
            {currentUser?.name?.[0] ?? "?"}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="db-main" style={{ flex: 1, maxWidth: 1060, margin: "0 auto", width: "100%", padding: "28px 20px", position: "relative", zIndex: 1 }}>
        {dashPage === "discover" && (
          <DiscoverTab
            T={T} dark={dark}
            currentUser={currentUser}
            connected={connected}
            onConnect={handleConnect}
            onSeedConnected={(init) => setConnected(init)}
            liked={liked} setLiked={setLiked}
            onSeedLiked={(init) => setLiked(init)}
            onMessage={handleMessage}
            onFavourite={handleFavourite}
            onViewProfile={handleViewProfile}
          />
        )}
        {dashPage === "messages" && (
          <MessagesTab
            T={T} dark={dark}
            currentUser={currentUser}
            convos={convos} setConvos={setConvos}
            activeConvo={activeConvo} setActiveConvo={setActiveConvo}
          />
        )}
        {dashPage === "profile" && (
          <ProfileTab
            T={T} dark={dark}
            currentUser={currentUser} setCurrentUser={setCurrentUser}
            setDashPage={setDashPage}
            convos={convos} setActiveConvo={setActiveConvo}
          />
        )}
        {dashPage === "otherprofile" && (
          <OtherProfileTab
            T={T} dark={dark}
            currentUser={currentUser}
            viewUserId={viewUserId}
            setDashPage={setDashPage}
            setActiveConvo={setActiveConvo}
          />
        )}
        {dashPage === "settings" && (
          <SettingsTab
            T={T} dark={dark} toggleDark={toggleDark}
            currentUser={currentUser} setCurrentUser={setCurrentUser}
            setDashPage={setDashPage}
          />
        )}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="mob-bottom-nav" style={{ justifyContent: "space-around", alignItems: "center" }}>
        {NAV_ITEMS.map(n => (
          <button key={n.id} onClick={() => setDashPage(n.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "6px 16px", borderRadius: 8, color: dashPage === n.id ? "#a78bfa" : T.text3, fontFamily: "inherit", transition: "color 0.15s" }}>
            <span style={{ position: "relative", display: "flex" }}>
              <n.Icon style={iconSize(17, 19)} />
              {n.id === "messages" && convos.length > 0 && <span style={{ position: "absolute", top: -3, right: -6, width: 8, height: 8, background: "#7c3aed", borderRadius: "50%", border: `2px solid ${T.bg}` }} />}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600 }}>{n.label}</span>
            {dashPage === n.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#7c3aed" }} />}
          </button>
        ))}
      </nav>
    </div>
  );
}