"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DARK, LIGHT,
  INITIAL_CONVERSATIONS, INITIAL_NOTIFS, DEFAULT_USER,
  hsl, hsla,
} from "./shared";

import DiscoverTab from "./discover/page";
import MessagesTab from "./messages/page";
import ProfileTab from "./profile/page";
import SettingsTab from "./settings/page";

const NAV_ITEMS = [
  { id: "discover", icon: <i class="fa-solid fa-code"></i>, label: "Discover" },
  { id: "messages", icon: <i class="fa-regular fa-message"></i>, label: "Messages" },
  { id: "profile", icon: <i class="fa-regular fa-user"></i>, label: "Profile" },
  { id: "settings", icon: <i class="fa-solid fa-gear"></i>, label: "Settings" },
];

export default function Dashboard() {
  const router = useRouter();
  const [dark, setDark] = useState(true);
  const [dashPage, setDashPage] = useState("discover");
  const [currentUser, setCurrentUser] = useState(DEFAULT_USER);
  const [convos, setConvos] = useState(INITIAL_CONVERSATIONS);
  const [activeConvo, setActiveConvo] = useState(INITIAL_CONVERSATIONS[0]);
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [connected, setConnected] = useState({});
  const [liked, setLiked] = useState({});
  const [notifOpen, setNotifOpen] = useState(false);

  const T = dark ? DARK : LIGHT;
  const unread = notifs.filter(n => !n.read).length;


  useEffect(() => {
    const getAllProfiles = async () => {
      try {
        const res = await fetch("/api/profiles");
        const profiles = await res.json();
        console.log(profiles);
      } catch (err) {
        console.error("Failed to fetch profiles:", err);
      }
    };
    getAllProfiles();
  }, []);


  const sendConnection = async (user) => {

    try {
      const res = await fetch("/api/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: user.id,
        }),
      });
      if (!res.ok) throw new Error("Failed to send connection request");
      const data = await res.json();
      console.log("Connection sent:", data);
    } catch (err) {
      console.error("sendConnection error:", err);
    }
  };

  const handleMessage = useCallback((user) => {
    const existing = convos.find(c => c.user.id === user.id);
    if (existing) {
      setActiveConvo(existing);
    } else {
      const nc = {
        id: Date.now(),
        user,
        messages: [{ id: 1, from: "them", text: `Hey! I saw your profile and I think we'd make a great team. Want to connect? 👋`, time: "now" }],
      };
      setConvos(p => [nc, ...p]);
      setActiveConvo(nc);
    }
    setDashPage("messages");
  }, [convos]);


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

      if (json.action === "removed") {
        setConnected(prev => ({ ...prev, [user.id]: false }));
      } else {
        setConnected(prev => ({ ...prev, [user.id]: true }));
      }
    } catch (err) {
      setConnected(prev => ({ ...prev, [user.id]: wasConnected }));
    }
  }, [connected]);

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

      if (json.action === "removed") {
        setLiked(prev => ({ ...prev, [user.id]: false }));
      } else {
        setLiked(prev => ({ ...prev, [user.id]: true }));
      }
    } catch (err) {
      setLiked(prev => ({ ...prev, [user.id]: wasFav }));
    }
  }, [liked]);


  const globalCss = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)"};border-radius:99px}
    input,textarea,select{font-family:'Instrument Sans',sans-serif}
    textarea{resize:none}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    .fade-up{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both}
    .fade-in{animation:fadeIn 0.3s ease both}
    .card{background:${T.card};border:1px solid ${T.border};border-radius:18px;transition:all 0.25s}
    .card:hover{background:${T.cardHover};border-color:${T.border2};transform:translateY(-2px);box-shadow:${T.shadow}}
    .card-flat{background:${T.card};border:1px solid ${T.border};border-radius:18px}
    @media(max-width:768px){
      .db-main{padding:16px 12px !important}
      .desk-nav{display:none !important}
      .mob-bottom-nav{display:flex !important}
      .db-main{padding-bottom:80px !important}
      .msg-sidebar{display:none !important}
      .msg-right-panel{display:none !important}
    }
    @media(max-width:480px){.nav-ghost{display:none}}
    @media(min-width:769px){.mob-bottom-nav{display:none !important}}
    .mob-bottom-nav{
      display:none;
      position:fixed;bottom:0;left:0;right:0;
      backdrop-filter:blur(20px);
      border-top:1px solid ${T.border};
      z-index:200;padding:8px 0 12px;
      background:${dark ? "rgba(6,6,8,0.95)" : "rgba(245,245,249,0.97)"};
    }
  `;

  const LogoIcon = ({ size = 30 }) => (
    <div style={{ width: size, height: size, borderRadius: 8, overflow: "hidden", flexShrink: 0, display: "flex" }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill={dark ? "#1a0a6a" : "#1a0a6a"} />
        <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill={dark ? "#a78bfa" : "#ffffff"} />
      </svg>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{globalCss}</style>

      {/* Ambient bg blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-15%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(259,70%,35%,0.08)" : "hsla(259,70%,60%,0.05)"} 0%,transparent 65%)` }} />
        <div style={{ position: "absolute", bottom: "-10%", right: 0, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${dark ? "hsla(300,60%,30%,0.06)" : "hsla(300,60%,60%,0.04)"} 0%,transparent 65%)` }} />
      </div>

      {/* ── Top nav ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 200, background: dark ? "rgba(6,6,8,0.94)" : "rgba(245,245,249,0.96)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${T.border}`, padding: "0 22px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }} onClick={() => router.push("/")}>
          <LogoIcon />
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 16, color: T.text }}>CodeBuddy</span>
        </div>

        <nav className="desk-nav" style={{ display: "flex", gap: 2 }}>
          {NAV_ITEMS.map(n => (
            <button key={n.id} onClick={() => setDashPage(n.id)} style={{ background: dashPage === n.id ? dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.08)" : "none", border: "none", color: dashPage === n.id ? dark ? "#e0d8ff" : "#7c3aed" : T.text3, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, padding: "8px 13px", borderRadius: 10, display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s" }}>
              <span style={{ fontSize: 14 }}>{n.icon}</span>
              {n.label}
              {n.id === "messages" && convos.length > 0 && (
                <span style={{ background: "#7c3aed", color: "white", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 99 }}>{convos.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <button onClick={() => setNotifOpen(p => !p)} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${T.border}`, color: T.text3, borderRadius: 10, cursor: "pointer", position: "relative", transition: "all 0.2s" }}>
              <i class="fa-regular fa-bell"></i>
              {unread > 0 && <span style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, background: "#ef4444", borderRadius: "50%", border: `2px solid ${T.bg}` }} />}
            </button>

            {notifOpen && (
              <div className="card-flat fade-in" style={{ position: "absolute", right: 0, top: 42, width: 300, zIndex: 300, overflow: "hidden" }}>
                <div style={{ padding: "13px 16px 10px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Notifications</span>
                    {unread > 0 && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: "#7c3aed", color: "white" }}>{unread} new</span>}
                  </div>
                  <button onClick={() => setNotifs(p => p.map(n => ({ ...n, read: true })))} style={{ background: "none", border: "none", cursor: "pointer", color: "#7c3aed", fontSize: 11, fontFamily: "inherit", fontWeight: 600 }}>Mark all read</button>
                </div>
                {notifs.map((n, i) => (
                  <div key={n.id} style={{ padding: "11px 16px", borderBottom: i < notifs.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 10, background: n.read ? "transparent" : dark ? "rgba(124,58,237,0.04)" : "rgba(124,58,237,0.03)", cursor: "pointer" }} onClick={() => setNotifs(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: n.read ? T.text3 : hsl(n.hue), marginTop: 5, flexShrink: 0, boxShadow: n.read ? "none" : `0 0 6px ${hsl(n.hue)}` }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: n.read ? T.text3 : T.text, lineHeight: 1.4 }}>{n.text}</div>
                      <div style={{ fontSize: 10, color: T.text3, marginTop: 3 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setDark(p => !p)} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${T.border}`, color: T.text3, borderRadius: 10, cursor: "pointer", transition: "all 0.2s" }}>
            {dark ? <i class="fa-regular fa-sun"></i> : <i class="fa-regular fa-moon"></i>}
          </button>

          <div onClick={() => setDashPage("profile")} style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(168,85,247,0.2))", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#c4b5fd", cursor: "pointer" }}>
            {currentUser.name[0]}
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
        {dashPage === "settings" && (
          <SettingsTab
            T={T} dark={dark} setDark={setDark}
            currentUser={currentUser} setCurrentUser={setCurrentUser}
            setDashPage={setDashPage}
          />
        )}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="mob-bottom-nav" style={{ justifyContent: "space-around", alignItems: "center" }}>
        {NAV_ITEMS.map(n => (
          <button key={n.id} onClick={() => setDashPage(n.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "6px 16px", borderRadius: 10, color: dashPage === n.id ? "#a78bfa" : T.text3, fontFamily: "inherit", transition: "all 0.2s" }}>
            <span style={{ fontSize: 18, position: "relative" }}>
              {n.icon}
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