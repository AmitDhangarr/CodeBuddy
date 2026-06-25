"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

/* ============================================================
   SETUP
   1. Run schema.sql in your Supabase project (SQL Editor).
   2. Set env vars (Next.js: .env.local):
        NEXT_PUBLIC_SUPABASE_URL=...
        NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   3. Enable Realtime on "messages" table in Supabase Dashboard.
   4. Drop <MessagesTab /> into your app and pass:
        currentUser   -> { id, name, hue, skillsHave, skillsNeed, ... }
        convos        -> array of conversation objects
        setConvos     -> setState for convos
        activeConvo   -> currently selected convo (or null)
        setActiveConvo-> setState for activeConvo
        dark          -> boolean
        T             -> theme object (optional)
   ============================================================ */

const EMOJI_REACTIONS = ["👍", "❤️", "🔥", "👀", "🚀"];
const LIMITS = { MESSAGE_MAX: 2000 };
const TYPING_THROTTLE_MS = 1500;

function validateMessage(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) return "Message can't be empty";
  if (trimmed.length > LIMITS.MESSAGE_MAX)
    return `Message is too long (max ${LIMITS.MESSAGE_MAX} characters)`;
  return "";
}

const DEFAULT_THEME_LIGHT = {
  text: "#16161d", text2: "#4a4a57", text3: "#8a8a98",
  border: "rgba(0,0,0,0.08)", input: "#fff", inputBorder: "rgba(0,0,0,0.12)",
  msgMe: "linear-gradient(135deg,#7c3aed,#a855f7)", msgThem: "#fff",
  shadow: "0 4px 16px rgba(0,0,0,0.10)",
  skillHaveBg: "rgba(34,197,94,0.08)", skillHaveBorder: "rgba(34,197,94,0.25)", skillHaveText: "#16a34a",
  skillNeedBg: "rgba(124,58,237,0.08)", skillNeedBorder: "rgba(124,58,237,0.25)", skillNeedText: "#7c3aed",
  surfaceBg: "#f9f9fb",
};
const DEFAULT_THEME_DARK = {
  ...DEFAULT_THEME_LIGHT,
  text: "#f2f2f7", text2: "#b6b6c3", text3: "#74747f",
  border: "rgba(255,255,255,0.08)", input: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.1)",
  msgThem: "rgba(255,255,255,0.07)",
  shadow: "0 4px 16px rgba(0,0,0,0.45)",
  surfaceBg: "rgba(255,255,255,0.02)",
};

function hsl(hue, s = 70, l = 60) { return `hsl(${hue ?? 260},${s}%,${l}%)`; }
function hsla(hue, s = 70, l = 60, a = 1) { return `hsla(${hue ?? 260},${s}%,${l}%,${a})`; }

function calculateMatchScore(a, b) {
  if (!a || !b) return 0;
  const haveA = a.skillsHave || [], needB = b.skillsNeed || [];
  const haveB = b.skillsHave || [], needA = a.skillsNeed || [];
  const overlap1 = haveA.filter((s) => needB.includes(s)).length;
  const overlap2 = haveB.filter((s) => needA.includes(s)).length;
  const total = (haveA.length || 1) + (haveB.length || 1);
  const score = Math.round(((overlap1 + overlap2) / total) * 100);
  return Math.min(99, Math.max(40, score || 62));
}

function Avatar({ u, size = 38, radius = 10, dark }) {
  const initials = (u?.name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return u?.avatar_url ? (
    <img
      src={u.avatar_url} alt={u?.name || "avatar"} width={size} height={size}
      style={{ borderRadius: radius, objectFit: "cover", flexShrink: 0, display: "block" }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: hsla(u?.hue, 70, 55, dark ? 0.22 : 0.14),
      border: `1px solid ${hsla(u?.hue, 70, 55, 0.35)}`,
      color: hsl(u?.hue, 70, dark ? 75 : 40),
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, fontFamily: "inherit",
    }}>
      {initials}
    </div>
  );
}

function OnlineDot({ online, dark }) {
  return (
    <div style={{
      position: "absolute", bottom: -1, right: -1, width: 8, height: 8,
      borderRadius: "50%", background: online ? "#22c55e" : "#6b6b78",
      border: `2px solid ${dark ? "#0a0a12" : "#f5f5f9"}`,
    }} />
  );
}

function Lbl({ children, T }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: T.text3, marginBottom: 6 }}>
      {children}
    </div>
  );
}

/* ── Supabase singleton ────────────────────────────────────────────────── */
let _sb = null, _sbErr = null;
function getSupabase() {
  if (_sbErr) throw _sbErr;
  if (!_sb) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      _sbErr = new Error("Supabase not configured: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing.");
      throw _sbErr;
    }
    try { _sb = createClient(url, key); }
    catch (e) { _sbErr = e; throw e; }
  }
  return _sb;
}

function mergeIncomingMessage(prev, incoming) {
  if (prev.some((m) => m.id === incoming.id))
    return prev.map((m) => (m.id === incoming.id ? { ...m, ...incoming } : m));
  const withoutOptimistic = prev.filter(
    (m) => !(m.optimistic && m.sender_id === incoming.sender_id && m.content === incoming.content)
  );
  return [...withoutOptimistic, incoming];
}

/* ── useWindowWidth hook ─────────────────────────────────────────────── */
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return w;
}

/* ── Auto-growing textarea hook ─────────────────────────────────────── */
function useAutoResize(ref, value) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [value, ref]);
}

/* ============================================================
   Main component
   ============================================================ */
export default function MessagesTab({
  T, dark,
  currentUser,
  convos, setConvos,
  activeConvo, setActiveConvo,
}) {
  const theme = T || (dark ? DEFAULT_THEME_DARK : DEFAULT_THEME_LIGHT);
  const windowWidth = useWindowWidth();

  // Breakpoints
  const isMobile  = windowWidth < 640;   // one panel at a time
  const isTablet  = windowWidth < 960;   // sidebar + chat, no profile
  // desktop: all three panels

  // Mobile panel state: "list" | "chat" | "profile"
  const [mobilePanel, setMobilePanel] = useState("list");

  const [msgInput, setMsgInput]           = useState("");
  const [searchQ, setSearchQ]             = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [reactionPickerFor, setReactionPickerFor] = useState(null);
  const [pinned, setPinned]               = useState({});
  const [msgSearch, setMsgSearch]         = useState("");
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const [messages, setMessages]           = useState([]);
  const [sending, setSending]             = useState(false);
  const [loading, setLoading]             = useState(false);
  const [sendError, setSendError]         = useState("");
  const [connError, setConnError]         = useState("");

  const chatEndRef       = useRef(null);
  const textareaRef      = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);
  const channelRef       = useRef(null);

  useAutoResize(textareaRef, msgInput);

  const currentConvo = convos?.find((c) => c.id === activeConvo?.id) ?? convos?.[0] ?? null;

  /* Open a convo */
  const openConvo = useCallback((c) => {
    setActiveConvo(c);
    if (isMobile) setMobilePanel("chat");
  }, [setActiveConvo, isMobile]);

  /* Go back to list on mobile */
  const goBack = useCallback(() => {
    if (mobilePanel === "profile") setMobilePanel("chat");
    else setMobilePanel("list");
  }, [mobilePanel]);

  const updateConvoPreview = useCallback((convoId, msg) => {
    if (!convoId || !msg) return;
    setConvos((prev) => prev.map((c) => (c.id === convoId ? { ...c, messages: [msg] } : c)));
  }, [setConvos]);

  /* ── Load messages ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!currentConvo?.id) return;
    let cancelled = false;
    setLoading(true);
    setConnError("");
    setMessages([]);

    (async () => {
      let sb;
      try { sb = getSupabase(); }
      catch (err) { if (!cancelled) { setConnError(err.message); setLoading(false); } return; }

      try {
        const { data, error } = await sb
          .from("messages").select("*")
          .eq("conversation_id", currentConvo.id)
          .order("sent_at", { ascending: true });
        if (cancelled) return;
        if (error) { setConnError(error.message); return; }
        if (data) {
          setMessages(data);
          const last = data[data.length - 1];
          if (last) updateConvoPreview(currentConvo.id, last);
          const unreadIds = data.filter((m) => m.sender_id !== currentUser?.id && !m.read).map((m) => m.id);
          if (unreadIds.length)
            sb.from("messages").update({ read: true }).in("id", unreadIds)
              .then(({ error: e }) => e && console.error("mark read:", e));
        }
      } catch (err) {
        if (!cancelled) setConnError(err.message || "Failed to load messages.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentConvo?.id, currentUser?.id, updateConvoPreview]);

  /* ── Realtime subscription ─────────────────────────────────────────── */
  useEffect(() => {
    if (!currentConvo?.id) return;
    let sb;
    try { sb = getSupabase(); }
    catch (err) { setConnError(err.message); return; }

    const channel = sb.channel(`conversation:${currentConvo.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${currentConvo.id}` },
        (payload) => {
          const incoming = payload.new;
          setMessages((prev) => mergeIncomingMessage(prev, incoming));
          updateConvoPreview(currentConvo.id, incoming);
          if (incoming.sender_id !== currentUser?.id)
            sb.from("messages").update({ read: true }).eq("id", incoming.id)
              .then(({ error: e }) => e && console.error("mark read:", e));
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${currentConvo.id}` },
        (payload) => setMessages((prev) => prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m))))
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload?.userId !== currentUser?.id) {
          setPartnerTyping(true);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 2000);
        }
      })
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") setConnError("");
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
          setConnError((err?.message) || "Lost live connection. Try refreshing.");
      });

    channelRef.current = channel;
    return () => {
      sb.removeChannel(channel);
      channelRef.current = null;
      clearTimeout(typingTimeoutRef.current);
      setPartnerTyping(false);
    };
  }, [currentConvo?.id, currentUser?.id, updateConvoPreview]);

  /* ── Scroll to bottom ─────────────────────────────────────────────── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  /* ── Typing broadcast ─────────────────────────────────────────────── */
  const broadcastTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingSentRef.current < TYPING_THROTTLE_MS) return;
    lastTypingSentRef.current = now;
    try {
      channelRef.current?.send({ type: "broadcast", event: "typing", payload: { userId: currentUser?.id } });
    } catch (err) {
      console.error("typing broadcast:", err);
    }
  }, [currentUser?.id]);

  /* ── Send message ─────────────────────────────────────────────────── */
  const sendMsg = useCallback(async () => {
    const contentErr = validateMessage(msgInput);
    if (contentErr) { setSendError(contentErr); return; }
    if (!currentConvo || !currentUser?.id || sending) return;

    const content = msgInput.trim();
    setMsgInput("");
    setSendError("");
    setSending(true);

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMsg = {
      id: optimisticId, conversation_id: currentConvo.id, sender_id: currentUser.id,
      content, sent_at: new Date().toISOString(), read: false, optimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const sb = getSupabase();
      const { data, error } = await sb
        .from("messages")
        .insert({ conversation_id: currentConvo.id, sender_id: currentUser.id, content })
        .select().single();
      if (error || !data) throw new Error(error?.message || "Failed to send.");
      setMessages((prev) => mergeIncomingMessage(prev.filter((m) => m.id !== optimisticId), data));
      updateConvoPreview(currentConvo.id, data);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setMsgInput(content);
      setSendError(err?.message || "Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  }, [msgInput, currentConvo, currentUser?.id, sending, updateConvoPreview]);

  /* ── Reactions ────────────────────────────────────────────────────── */
  const toggleReaction = useCallback(async (msgId, emoji) => {
    setReactionPickerFor(null);
    const target = messages.find((m) => m.id === msgId);
    if (!target) return;
    const nextReaction = target.reaction === emoji ? null : emoji;
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, reaction: nextReaction } : m)));
    if (!String(msgId).startsWith("optimistic-")) {
      try {
        const sb = getSupabase();
        const { error } = await sb.from("messages").update({ reaction: nextReaction }).eq("id", msgId);
        if (error) throw error;
      } catch {
        setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, reaction: target.reaction } : m)));
      }
    }
  }, [messages]);

  /* ── Helpers ──────────────────────────────────────────────────────── */
  const isMe = (m) => m.sender_id === currentUser?.id;
  const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "…";
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const filteredConvos = useMemo(
    () => (convos || []).filter((c) => !searchQ || c.user.name.toLowerCase().includes(searchQ.toLowerCase())),
    [convos, searchQ]
  );
  const filteredMessages = useMemo(
    () => (messages || []).filter((m) => !msgSearch || m.content.toLowerCase().includes(msgSearch.toLowerCase())),
    [messages, msgSearch]
  );

  const matchScore = currentConvo ? calculateMatchScore(currentUser, currentConvo.user) : 0;
  const pinnedMsgId = pinned[currentConvo?.id];
  const pinnedMsg   = pinnedMsgId ? messages.find((m) => m.id === pinnedMsgId) : null;

  /* ── Sidebar visibility ───────────────────────────────────────────── */
  const showSidebar  = !isMobile || mobilePanel === "list";
  const showChat     = !isMobile || mobilePanel === "chat";
  const showProfile  = !isTablet && !isMobile && currentConvo;
  const showMobileProfileBtn = isMobile && mobilePanel === "chat" && currentConvo;

  /* ── Styles ───────────────────────────────────────────────────────── */
  const s = {
    // Scrollbars
    scrollbar: {
      overflowY: "auto",
      scrollbarWidth: "thin",
      scrollbarColor: `${dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"} transparent`,
    },
    card: {
      background: dark ? "rgba(255,255,255,0.03)" : "#fff",
      border: `1px solid ${theme.border}`,
      borderRadius: 16,
      overflow: "hidden",
    },
    input: {
      background: theme.input,
      border: `1px solid ${theme.inputBorder}`,
      color: theme.text,
      borderRadius: 10,
      fontSize: 13,
      outline: "none",
      fontFamily: "inherit",
      padding: "8px 12px",
    },
    searchInput: {
      background: theme.input,
      border: `1px solid ${theme.inputBorder}`,
      color: theme.text,
      borderRadius: 10,
      fontSize: 12,
      outline: "none",
      fontFamily: "inherit",
      padding: "8px 10px 8px 32px",
      width: "100%",
    },
  };

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div style={{ display: "flex", gap: isMobile ? 0 : 12, height: "calc(100vh - 120px)", minHeight: 420, boxSizing: "border-box", position: "relative", overflow: "hidden" }}>

      {/* ══════════════ SIDEBAR ══════════════ */}
      {showSidebar && (
        <div style={{ ...s.card, width: isMobile ? "100%" : 272, flexShrink: 0, display: "flex", flexDirection: "column" }}>
          {/* Sidebar header */}
          <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 19, color: theme.text, marginBottom: 10 }}>
              Messages
            </div>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: theme.text3, fontSize: 12, pointerEvents: "none" }}>
                🔍
              </span>
              <input
                aria-label="Search conversations"
                placeholder="Search…"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                style={s.searchInput}
              />
            </div>
          </div>

          {/* Convo list */}
          <div style={{ ...s.scrollbar, flex: 1, padding: 6 }}>
            {filteredConvos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px", color: theme.text3, fontSize: 12 }}>
                No conversations found
              </div>
            ) : filteredConvos.map((c) => {
              const lastMsg = c.id === currentConvo?.id
                ? messages[messages.length - 1]
                : c.messages?.[c.messages.length - 1];
              const isActive = activeConvo?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => openConvo(c)}
                  style={{
                    display: "flex", alignItems: "center", gap: 11,
                    padding: "10px 12px", borderRadius: 12, cursor: "pointer",
                    transition: "background 0.15s",
                    background: isActive
                      ? (dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.07)")
                      : "transparent",
                    border: `1px solid ${isActive ? (dark ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.15)") : "transparent"}`,
                    marginBottom: 2,
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <Avatar u={c.user} size={38} radius={10} dark={dark} />
                    <OnlineDot online={c.user.online} dark={dark} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c?.user?.name?.split(" ")?.[0] ?? "User"}
                      </span>
                      {lastMsg?.sent_at && (
                        <span style={{ fontSize: 10, color: theme.text3, flexShrink: 0 }}>
                          {formatTime(lastMsg.sent_at)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: theme.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {lastMsg?.sender_id === currentUser?.id ? "You: " : ""}
                      {lastMsg?.content ?? ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════ CHAT PANE ══════════════ */}
      {showChat && (
        <div style={{ ...s.card, flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Chat header */}
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {/* Back button (mobile) */}
            {isMobile && (
              <button
                onClick={goBack}
                aria-label="Back"
                style={{ padding: "6px 10px", background: "transparent", border: `1px solid ${theme.border}`, color: theme.text2, borderRadius: 9, cursor: "pointer", fontSize: 14, fontFamily: "inherit", flexShrink: 0 }}
              >
                ←
              </button>
            )}

            {currentConvo ? (
              <>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <Avatar u={currentConvo.user} size={36} radius={10} dark={dark} />
                  <OnlineDot online={currentConvo.user.online} dark={dark} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentConvo.user.name}
                  </div>
                  <div style={{ fontSize: 11, color: partnerTyping ? theme.text2 : (currentConvo.user.online ? "#22c55e" : theme.text3) }}>
                    {partnerTyping ? <em>typing…</em> : currentConvo.user.online ? "● Online" : "● Away"}
                  </div>
                </div>

                {/* Header actions */}
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99,
                    background: hsla(currentConvo.user.hue, 70, 60, dark ? 0.12 : 0.08),
                    border: `1px solid ${hsla(currentConvo.user.hue, 70, 60, 0.25)}`,
                    color: hsl(currentConvo.user.hue), whiteSpace: "nowrap",
                  }}>
                    {matchScore}% match
                  </span>
                  <button
                    onClick={() => setShowMsgSearch((p) => !p)}
                    aria-label="Search messages"
                    style={{
                      padding: "6px 9px",
                      background: showMsgSearch ? (dark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.09)") : "transparent",
                      border: `1px solid ${showMsgSearch ? "rgba(124,58,237,0.35)" : theme.border}`,
                      color: showMsgSearch ? "#a78bfa" : theme.text3,
                      borderRadius: 9, cursor: "pointer", fontSize: 14,
                    }}
                  >
                    🔍
                  </button>
                  {/* Profile button on mobile */}
                  {showMobileProfileBtn && (
                    <button
                      onClick={() => setMobilePanel("profile")}
                      aria-label="View profile"
                      style={{ padding: "6px 9px", background: "transparent", border: `1px solid ${theme.border}`, color: theme.text3, borderRadius: 9, cursor: "pointer", fontSize: 14 }}
                    >
                      👤
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div style={{ color: theme.text3, fontSize: 13 }}>Select a conversation</div>
            )}
          </div>

          {/* Error banner */}
          {connError && (
            <div style={{ padding: "8px 16px", background: dark ? "rgba(248,113,113,0.08)" : "rgba(248,113,113,0.06)", borderBottom: "1px solid rgba(248,113,113,0.2)", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: "#f87171", flex: 1 }}>⚠️ {connError}</span>
              <button onClick={() => setConnError("")} style={{ background: "none", border: "none", color: theme.text3, cursor: "pointer", fontSize: 12 }}>✕</button>
            </div>
          )}

          {/* Message search bar */}
          {showMsgSearch && (
            <div style={{ padding: "8px 12px", borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
              <input
                aria-label="Search in conversation"
                placeholder="Search messages…"
                value={msgSearch}
                onChange={(e) => setMsgSearch(e.target.value)}
                autoFocus
                style={{ ...s.input, width: "100%", fontSize: 12, padding: "7px 12px" }}
              />
            </div>
          )}

          {/* Match bar */}
          {currentConvo && (
            <div style={{ padding: "6px 16px", borderBottom: `1px solid ${theme.border}`, background: theme.surfaceBg, display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 11 }}>✦</span>
              <span style={{ fontSize: 11, color: dark ? "#8070aa" : "#6b5b9e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Matched on{" "}
                <strong style={{ color: "#a78bfa" }}>{currentUser?.skillsHave?.[0] || "—"}</strong>
                {" ↔ "}
                <strong style={{ color: "#a78bfa" }}>{currentConvo.user.skillsHave?.[0] || "—"}</strong>
              </span>
            </div>
          )}

          {/* Pinned message */}
          {pinnedMsg && (
            <div style={{ padding: "7px 16px", background: dark ? "rgba(245,158,11,0.07)" : "rgba(245,158,11,0.06)", borderBottom: "1px solid rgba(245,158,11,0.2)", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 12 }}>📌</span>
              <span style={{ fontSize: 11, color: dark ? "#fbbf24" : "#92400e", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {pinnedMsg.content}
              </span>
              <button onClick={() => setPinned((p) => { const n = { ...p }; delete n[currentConvo.id]; return n; })} style={{ background: "none", border: "none", color: theme.text3, cursor: "pointer", fontSize: 12 }}>✕</button>
            </div>
          )}

          {/* Messages area */}
          <div
            style={{ ...s.scrollbar, flex: 1, padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 8 }}
            onClick={() => setReactionPickerFor(null)}
          >
            {loading && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
                <div style={{ color: theme.text3, fontSize: 13 }}>Loading…</div>
              </div>
            )}

            {!loading && filteredMessages.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 10 }}>
                <div style={{ fontSize: 38 }}>💬</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>No messages yet</div>
                <div style={{ fontSize: 12, color: theme.text3, textAlign: "center" }}>
                  {currentConvo
                    ? `Say hello to ${currentConvo.user.name.split(" ")[0]}!`
                    : "Select a conversation to start chatting"}
                </div>
              </div>
            )}

            {!loading && filteredMessages.map((m, i) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: isMe(m) ? "flex-end" : "flex-start",
                  opacity: m.optimistic ? 0.6 : 1,
                  transition: "opacity 0.2s",
                  position: "relative",
                  // Stagger fade-in for first 12 messages
                  animation: `msgIn 0.2s ${Math.min(i, 12) * 0.025}s both`,
                }}
              >
                {/* Incoming: small avatar */}
                {!isMe(m) && currentConvo && (
                  <div style={{ flexShrink: 0, marginRight: 6, alignSelf: "flex-end" }}>
                    <Avatar u={currentConvo.user} size={24} radius={6} dark={dark} />
                  </div>
                )}

                <div style={{ position: "relative", maxWidth: isMobile ? "82%" : "70%" }}>
                  <div
                    onDoubleClick={() => setReactionPickerFor(reactionPickerFor === m.id ? null : m.id)}
                    style={{
                      padding: "9px 13px",
                      borderRadius: 16,
                      fontSize: 13, lineHeight: 1.55,
                      background: isMe(m) ? theme.msgMe : theme.msgThem,
                      color: isMe(m) ? "white" : theme.text,
                      borderBottomRightRadius: isMe(m) ? 4 : 16,
                      borderBottomLeftRadius: !isMe(m) ? 4 : 16,
                      border: !isMe(m) ? `1px solid ${theme.border}` : "none",
                      cursor: "default",
                      wordBreak: "break-word",
                      userSelect: "text",
                    }}
                  >
                    {msgSearch && m.content.toLowerCase().includes(msgSearch.toLowerCase()) ? (
                      <span dangerouslySetInnerHTML={{
                        __html: m.content.replace(
                          new RegExp(`(${escapeRegExp(msgSearch)})`, "gi"),
                          "<mark style='background:rgba(245,158,11,0.45);border-radius:3px;padding:0 2px'>$1</mark>"
                        )
                      }} />
                    ) : m.content}

                    <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4, display: "flex", gap: 4, justifyContent: isMe(m) ? "flex-end" : "flex-start", alignItems: "center" }}>
                      {formatTime(m.sent_at)}
                      {isMe(m) && <span>{m.read ? "✓✓" : "✓"}</span>}
                    </div>
                  </div>

                  {/* Reaction badge */}
                  {m.reaction && (
                    <div
                      onClick={(e) => { e.stopPropagation(); toggleReaction(m.id, m.reaction); }}
                      style={{
                        position: "absolute", bottom: -10,
                        right: isMe(m) ? 0 : "auto", left: !isMe(m) ? 0 : "auto",
                        background: dark ? "#1a1a2e" : "#fff",
                        border: `1px solid ${theme.border}`, borderRadius: 99,
                        padding: "1px 6px", fontSize: 12, cursor: "pointer", boxShadow: theme.shadow,
                      }}
                    >
                      {m.reaction}
                    </div>
                  )}

                  {/* Reaction picker */}
                  {reactionPickerFor === m.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute", bottom: "calc(100% + 6px)",
                        [isMe(m) ? "right" : "left"]: 0,
                        background: dark ? "#1a1a2e" : "#fff",
                        border: `1px solid ${theme.border}`, borderRadius: 12,
                        padding: "6px 8px", display: "flex", gap: 2, zIndex: 50, boxShadow: theme.shadow,
                      }}
                    >
                      {EMOJI_REACTIONS.map((e) => (
                        <button
                          key={e}
                          onClick={() => toggleReaction(m.id, e)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 17, borderRadius: 8, padding: 4, transition: "transform 0.1s" }}
                          onMouseEnter={(ev) => { ev.currentTarget.style.transform = "scale(1.25)"; }}
                          onMouseLeave={(ev) => { ev.currentTarget.style.transform = "scale(1)"; }}
                        >
                          {e}
                        </button>
                      ))}
                      <button
                        onClick={() => setPinned((p) => ({ ...p, [currentConvo.id]: m.id }))}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, borderRadius: 8, padding: "4px 6px", color: theme.text3 }}
                        title="Pin message"
                      >
                        📌
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {partnerTyping && (
              <div style={{ display: "flex", justifyContent: "flex-start", gap: 6, alignItems: "flex-end" }}>
                {currentConvo && <Avatar u={currentConvo.user} size={24} radius={6} dark={dark} />}
                <div style={{ padding: "10px 14px", borderRadius: 16, borderBottomLeftRadius: 4, background: theme.msgThem, border: `1px solid ${theme.border}`, display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 0.15, 0.3].map((d, i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: theme.text3, animation: `pulseDot 1.2s ${d}s ease-in-out infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* ── Input area ─────────────────────────────────────────────── */}
          <div style={{ padding: "10px 12px", borderTop: `1px solid ${theme.border}`, flexShrink: 0, background: dark ? "rgba(255,255,255,0.01)" : theme.surfaceBg }}>
            {sendError && (
              <div style={{ fontSize: 11, color: "#f87171", padding: "6px 10px", borderRadius: 8, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.18)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span>{sendError}</span>
                <button onClick={() => setSendError("")} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 11, flexShrink: 0 }}>✕</button>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                <textarea
                  ref={textareaRef}
                  aria-label={currentConvo ? `Message ${currentConvo.user.name}` : "Message input"}
                  placeholder={currentConvo ? `Message ${currentConvo.user.name.split(" ")[0]}…` : "Select a conversation"}
                  value={msgInput}
                  maxLength={LIMITS.MESSAGE_MAX}
                  onChange={(e) => { setMsgInput(e.target.value); setSendError(""); broadcastTyping(); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                  disabled={!currentConvo || !currentUser?.id || sending}
                  rows={1}
                  style={{
                    ...s.input,
                    width: "100%",
                    resize: "none",
                    lineHeight: 1.5,
                    padding: "10px 12px",
                    borderColor: sendError ? "rgba(248,113,113,0.5)" : theme.inputBorder,
                    minHeight: 42,
                    maxHeight: 120,
                    overflowY: "auto",
                    display: "block",
                  }}
                />
                {msgInput.length > LIMITS.MESSAGE_MAX * 0.9 && (
                  <div style={{ position: "absolute", bottom: 4, right: 8, fontSize: 10, color: msgInput.length >= LIMITS.MESSAGE_MAX ? "#f87171" : theme.text3, pointerEvents: "none" }}>
                    {msgInput.length}/{LIMITS.MESSAGE_MAX}
                  </div>
                )}
              </div>

              <button
                onClick={sendMsg}
                disabled={!msgInput.trim() || !currentUser?.id || sending}
                aria-label="Send message"
                style={{
                  width: 42, height: 42, flexShrink: 0,
                  background: msgInput.trim() && !sending ? "linear-gradient(135deg,#7c3aed,#a855f7)" : (dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                  border: "none",
                  color: msgInput.trim() && !sending ? "white" : theme.text3,
                  borderRadius: 12, cursor: msgInput.trim() && !sending ? "pointer" : "not-allowed",
                  fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.18s",
                  boxShadow: msgInput.trim() && !sending ? "0 4px 14px rgba(124,58,237,0.25)" : "none",
                }}
                onMouseEnter={(e) => { if (msgInput.trim() && !sending) { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = ""; e.currentTarget.style.transform = ""; }}
              >
                {sending ? "…" : "↑"}
              </button>
            </div>

            <div style={{ fontSize: 10, color: theme.text3, marginTop: 5, paddingLeft: 2 }}>
              Enter to send · Shift+Enter for new line
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ RIGHT PROFILE PANEL (tablet/desktop) ══════════════ */}
      {showProfile && (
        <div style={{ ...s.card, width: 210, flexShrink: 0, display: "flex", flexDirection: "column", gap: 0, overflowY: "auto" }}>
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "inline-block", position: "relative" }}>
                <Avatar u={currentConvo.user} size={54} radius={14} dark={dark} />
                <OnlineDot online={currentConvo.user.online} dark={dark} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginTop: 10 }}>{currentConvo.user.name}</div>
              <div style={{ fontSize: 11, color: theme.text3, marginTop: 2 }}>{currentConvo.user.role}</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Instrument Serif',serif", color: hsl(currentConvo.user.hue), marginTop: 6 }}>
                {matchScore}% match
              </div>
            </div>

            <div style={{ height: 1, background: theme.border }} />

            <div>
              <Lbl T={theme}>Their Skills</Lbl>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {(currentConvo.user.skillsHave || []).map((sk) => (
                  <span key={sk} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: theme.skillHaveBg, border: `1px solid ${theme.skillHaveBorder}`, color: theme.skillHaveText }}>{sk}</span>
                ))}
              </div>
            </div>

            <div>
              <Lbl T={theme}>They Need</Lbl>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {(currentConvo.user.skillsNeed || []).map((sk) => (
                  <span key={sk} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: theme.skillNeedBg, border: `1px solid ${theme.skillNeedBorder}`, color: theme.skillNeedText }}>{sk}</span>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: theme.border }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "center" }}>
              {[["Projects", currentConvo.user.projects ?? 0], ["Followers", currentConvo.user.followers ?? 0]].map(([label, val]) => (
                <div key={label} style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 10, padding: "10px 8px" }}>
                  <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: theme.text }}>{val}</div>
                  <div style={{ fontSize: 10, color: theme.text3 }}>{label}</div>
                </div>
              ))}
            </div>

            <button style={{ background: "transparent", border: `1px solid ${theme.border}`, color: theme.text2, padding: "8px 10px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>
              View Full Profile →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ MOBILE: Full-screen profile panel ══════════════ */}
      {isMobile && mobilePanel === "profile" && currentConvo && (
        <div style={{ position: "absolute", inset: 0, zIndex: 10, ...s.card, borderRadius: 16, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <button onClick={goBack} style={{ padding: "6px 10px", background: "transparent", border: `1px solid ${theme.border}`, color: theme.text2, borderRadius: 9, cursor: "pointer", fontSize: 14 }}>←</button>
            <span style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>Profile</span>
          </div>
          <div style={{ ...s.scrollbar, flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ textAlign: "center", paddingTop: 8 }}>
              <div style={{ display: "inline-block", position: "relative" }}>
                <Avatar u={currentConvo.user} size={68} radius={18} dark={dark} />
                <OnlineDot online={currentConvo.user.online} dark={dark} />
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginTop: 12 }}>{currentConvo.user.name}</div>
              <div style={{ fontSize: 13, color: theme.text3, marginTop: 2 }}>{currentConvo.user.role}</div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Instrument Serif',serif", color: hsl(currentConvo.user.hue), marginTop: 6 }}>
                {matchScore}% match
              </div>
            </div>
            <div style={{ height: 1, background: theme.border }} />
            <div>
              <Lbl T={theme}>Their Skills</Lbl>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {(currentConvo.user.skillsHave || []).map((sk) => (
                  <span key={sk} style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: theme.skillHaveBg, border: `1px solid ${theme.skillHaveBorder}`, color: theme.skillHaveText }}>{sk}</span>
                ))}
              </div>
            </div>
            <div>
              <Lbl T={theme}>They Need</Lbl>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {(currentConvo.user.skillsNeed || []).map((sk) => (
                  <span key={sk} style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: theme.skillNeedBg, border: `1px solid ${theme.skillNeedBorder}`, color: theme.skillNeedText }}>{sk}</span>
                ))}
              </div>
            </div>
            <div style={{ height: 1, background: theme.border }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "center" }}>
              {[["Projects", currentConvo.user.projects ?? 0], ["Followers", currentConvo.user.followers ?? 0]].map(([label, val]) => (
                <div key={label} style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 12, padding: "14px 8px" }}>
                  <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: theme.text }}>{val}</div>
                  <div style={{ fontSize: 11, color: theme.text3 }}>{label}</div>
                </div>
              ))}
            </div>
            <button style={{ background: "transparent", border: `1px solid ${theme.border}`, color: theme.text2, padding: "10px 14px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>
              View Full Profile →
            </button>
          </div>
        </div>
      )}

      {/* ── Global keyframe styles ───────────────────────────────────── */}
      <style>{`
        @keyframes msgIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulseDot { 0%,80%,100% { transform:scale(0.6); opacity:0.4; } 40% { transform:scale(1); opacity:1; } }
      `}</style>
    </div>
  );
}