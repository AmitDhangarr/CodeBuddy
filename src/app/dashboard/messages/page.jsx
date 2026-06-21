"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

/* ============================================================
   SETUP
   1. Run schema.sql in your Supabase project (SQL Editor).
   2. Set these two env vars (Next.js: .env.local):
        NEXT_PUBLIC_SUPABASE_URL=...
        NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   3. In Supabase Dashboard → Database → Replication, make sure
      the "messages" table has Realtime enabled (schema.sql does
      this for you via `alter publication supabase_realtime add table`).
   4. Drop <MessagesTab /> into your app and pass:
        currentUser   -> { id, name, hue, skillsHave, ... } (a row from profiles)
        convos        -> array of conversation objects (see shape below)
        setConvos     -> setState for convos
        activeConvo   -> currently selected convo (or null)
        setActiveConvo-> setState for activeConvo
        dark          -> boolean
        T             -> theme object (optional, sane defaults provided)

   convo shape expected:
   {
     id: uuid,                 // conversations.id
     user: {                   // the OTHER participant's profile
       id, name, role, hue, online, avatar_url,
       skillsHave: string[], skillsNeed: string[],
       projects: number, followers: number
     },
     messages: [lastMessageRow] // optional cached preview
   }
   ============================================================ */

const EMOJI_REACTIONS = ["👍", "❤️", "🔥", "👀", "🚀"];
const LIMITS = { MESSAGE_MAX: 2000 };
const TYPING_THROTTLE_MS = 1500; // don't broadcast "typing" on every single keystroke

function validateMessage(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) return "Message can't be empty";
  if (trimmed.length > LIMITS.MESSAGE_MAX) return `Message is too long (max ${LIMITS.MESSAGE_MAX} characters)`;
  return "";
}

/* ---------------- theme defaults (override via T prop) ---------------- */
const DEFAULT_THEME_LIGHT = {
  text: "#16161d", text2: "#4a4a57", text3: "#8a8a98",
  border: "rgba(0,0,0,0.08)", input: "#fff", inputBorder: "rgba(0,0,0,0.12)",
  msgMe: "linear-gradient(135deg,#7c3aed,#a855f7)", msgThem: "#fff",
  shadow: "0 8px 30px rgba(0,0,0,0.12)",
  skillHaveBg: "rgba(34,197,94,0.08)", skillHaveBorder: "rgba(34,197,94,0.25)", skillHaveText: "#16a34a",
  skillNeedBg: "rgba(124,58,237,0.08)", skillNeedBorder: "rgba(124,58,237,0.25)", skillNeedText: "#7c3aed",
};
const DEFAULT_THEME_DARK = {
  ...DEFAULT_THEME_LIGHT,
  text: "#f2f2f7", text2: "#b6b6c3", text3: "#74747f",
  border: "rgba(255,255,255,0.08)", input: "rgba(255,255,255,0.04)", inputBorder: "rgba(255,255,255,0.1)",
  msgThem: "rgba(255,255,255,0.06)",
  shadow: "0 8px 30px rgba(0,0,0,0.45)",
};

/* ---------------- small shared helpers ---------------- */
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
      src={u.avatar_url}
      alt={u?.name || "avatar"}
      width={size}
      height={size}
      style={{ borderRadius: radius, objectFit: "cover", flexShrink: 0, display: "block" }}
    />
  ) : (
    <div
      style={{
        width: size, height: size, borderRadius: radius, flexShrink: 0,
        background: hsla(u?.hue, 70, 55, dark ? 0.22 : 0.14),
        border: `1px solid ${hsla(u?.hue, 70, 55, 0.35)}`,
        color: hsl(u?.hue, 70, dark ? 75 : 40),
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.36, fontWeight: 700, fontFamily: "inherit",
      }}
    >
      {initials}
    </div>
  );
}

function Lbl({ children, T }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: T.text3, marginBottom: 6 }}>
      {children}
    </div>
  );
}

/* ---------------- supabase client (singleton) ---------------- */
let _supabase = null;
let _supabaseInitError = null;
function getSupabase() {
  if (_supabaseInitError) throw _supabaseInitError;
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      _supabaseInitError = new Error(
        "Supabase is not configured: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are missing. Check your .env.local and restart the dev server."
      );
      throw _supabaseInitError;
    }
    try {
      _supabase = createClient(url, key);
    } catch (err) {
      _supabaseInitError = err;
      throw err;
    }
  }
  return _supabase;
}

function mergeIncomingMessage(prev, incoming) {
  if (prev.some((m) => m.id === incoming.id)) {
    return prev.map((m) => (m.id === incoming.id ? { ...m, ...incoming } : m));
  }
  const withoutOptimistic = prev.filter(
    (m) => !(m.optimistic && m.sender_id === incoming.sender_id && m.content === incoming.content)
  );
  return [...withoutOptimistic, incoming];
}

export default function MessagesTab({
  T, dark,
  currentUser,
  convos, setConvos,
  activeConvo, setActiveConvo,
}) {
  const theme = T || (dark ? DEFAULT_THEME_DARK : DEFAULT_THEME_LIGHT);

  const [msgInput, setMsgInput] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [mobileConvoOpen, setMobileConvoOpen] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [reactionPickerFor, setReactionPickerFor] = useState(null);
  const [pinned, setPinned] = useState({});
  const [msgSearch, setMsgSearch] = useState("");
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState("");
  const [connError, setConnError] = useState(""); // realtime / fatal connection errors
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);
  const channelRef = useRef(null);

  const currentConvo = convos?.find((c) => c.id === activeConvo?.id) ?? convos?.[0] ?? null;

  const updateConvoPreview = useCallback((convoId, msg) => {
    if (!convoId || !msg) return;
    setConvos((prev) => prev.map((c) => (c.id === convoId ? { ...c, messages: [msg] } : c)));
  }, [setConvos]);

  /* ── Load messages when conversation changes ───────────────────────── */
  useEffect(() => {
    if (!currentConvo?.id) return;
    let cancelled = false;
    setLoading(true);
    setConnError("");
    setMessages([]);

    (async () => {
      let sb;
      try {
        sb = getSupabase();
      } catch (err) {
        if (!cancelled) {
          setConnError(err.message || "Failed to connect to Supabase.");
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await sb
          .from("messages")
          .select("*")
          .eq("conversation_id", currentConvo.id)
          .order("sent_at", { ascending: true });

        if (cancelled) return;

        if (error) {
          setConnError(error.message || "Failed to load messages.");
        } else if (data) {
          setMessages(data);
          const last = data[data.length - 1];
          if (last) updateConvoPreview(currentConvo.id, last);

          // mark unread incoming messages as read (best-effort, don't block UI on failure)
          const unreadIds = data
            .filter((m) => m.sender_id !== currentUser?.id && !m.read)
            .map((m) => m.id);
          if (unreadIds.length) {
            sb.from("messages").update({ read: true }).in("id", unreadIds)
              .then(({ error: readErr }) => { if (readErr) console.error("Failed to mark messages read:", readErr); });
          }
        }
      } catch (err) {
        if (!cancelled) setConnError(err.message || "Failed to load messages.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [currentConvo?.id, currentUser?.id, updateConvoPreview]);

  /* ── Supabase Realtime: messages + typing presence ──────────────────── */
  useEffect(() => {
    if (!currentConvo?.id) return;

    let sb;
    try {
      sb = getSupabase();
    } catch (err) {
      setConnError(err.message || "Failed to connect to Supabase.");
      return;
    }

    const channel = sb
      .channel(`conversation:${currentConvo.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `conversation_id=eq.${currentConvo.id}`,
      }, (payload) => {
        const incoming = payload.new;
        setMessages((prev) => mergeIncomingMessage(prev, incoming));
        updateConvoPreview(currentConvo.id, incoming);
        if (incoming.sender_id !== currentUser?.id) {
          sb.from("messages").update({ read: true }).eq("id", incoming.id)
            .then(({ error }) => { if (error) console.error("Failed to mark message read:", error); });
        }
      })
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "messages",
        filter: `conversation_id=eq.${currentConvo.id}`,
      }, (payload) => {
        setMessages((prev) => prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m)));
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload?.userId !== currentUser?.id) {
          setPartnerTyping(true);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 2000);
        }
      })
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          setConnError("");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnError(
            (err && err.message) ||
            "Lost connection to live chat. Messages may not update in real time — try refreshing."
          );
        } else if (status === "CLOSED") {
          // normal on unmount/cleanup, no need to surface an error
        }
      });

    channelRef.current = channel;
    return () => {
      sb.removeChannel(channel);
      channelRef.current = null;
      clearTimeout(typingTimeoutRef.current);
      setPartnerTyping(false);
    };
  }, [currentConvo?.id, currentUser?.id, updateConvoPreview]);

  /* ── Scroll to bottom ────────────────────────────────────────────────── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  /* ── Broadcast typing (throttled, never throws) ─────────────────────── */
  const broadcastTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingSentRef.current < TYPING_THROTTLE_MS) return;
    lastTypingSentRef.current = now;
    try {
      channelRef.current?.send({
        type: "broadcast", event: "typing", payload: { userId: currentUser?.id },
      });
    } catch (err) {
      // typing indicator is best-effort — never let it affect the input
      console.error("Failed to broadcast typing:", err);
    }
  }, [currentUser?.id]);

  /* ── Send message (fully error-safe — `sending` always resets) ──────── */
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
      id: optimisticId,
      conversation_id: currentConvo.id,
      sender_id: currentUser.id,
      content,
      sent_at: new Date().toISOString(),
      read: false,
      optimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const sb = getSupabase();
      const { data, error } = await sb
        .from("messages")
        .insert({ conversation_id: currentConvo.id, sender_id: currentUser.id, content })
        .select()
        .single();

      if (error || !data) {
        throw new Error(error?.message || "Failed to send message. Please try again.");
      }

      setMessages((prev) => mergeIncomingMessage(prev.filter((m) => m.id !== optimisticId), data));
      updateConvoPreview(currentConvo.id, data);
    } catch (err) {
      // Roll back the optimistic message and restore the draft text
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setMsgInput(content);
      setSendError(err?.message || "Failed to send message. Please try again.");
    } finally {
      // CRITICAL: this must always run, or the input locks up permanently
      setSending(false);
    }
  }, [msgInput, currentConvo, currentUser?.id, sending, updateConvoPreview]);

  /* ── Reactions (persisted on the message row) ───────────────────────── */
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
      } catch (err) {
        // roll back on failure
        setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, reaction: target.reaction } : m)));
        console.error("Failed to save reaction:", err);
      }
    }
  }, [messages]);

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  const isMe = (m) => m.sender_id === currentUser?.id;

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
  const pinnedMsg = pinnedMsgId ? messages.find((m) => m.id === pinnedMsgId) : null;

  const formatTime = (ts) =>
    ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "sending…";

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className="msgs-root fade-up">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulseDot { 0%,80%,100% { transform:scale(0.6); opacity:0.4; } 40% { transform:scale(1); opacity:1; } }
        @keyframes popIn { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
        .fade-up { animation: fadeUp 0.35s ease both; }
        .msgs-root { display:flex; gap:16px; height:calc(100vh - 130px); min-height: 420px; box-sizing:border-box; }
        .msgs-root * { box-sizing:border-box; }
        .msgs-sidebar, .msgs-chat, .msgs-profile { min-width:0; }
        .convo-row:hover { background: ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)"}; }
        .react-emoji-btn:hover { transform: scale(1.25); background: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}; }
        .send-btn:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
        .mobile-back-btn { display:none; }
        .scroll-thin::-webkit-scrollbar { width:6px; height:6px; }
        .scroll-thin::-webkit-scrollbar-thumb { background:${dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}; border-radius:99px; }

        @media (max-width: 900px) {
          .msgs-profile { display:none; }
        }
        @media (max-width: 680px) {
          .msgs-root { gap:0; height: calc(100vh - 100px); }
          .msgs-sidebar {
            position:absolute; inset:0; z-index:5; width:100% !important;
            transform: translateX(0); transition: transform 0.25s ease;
          }
          .msgs-sidebar.is-hidden { transform: translateX(-100%); pointer-events:none; }
          .msgs-chat { width:100%; }
          .mobile-back-btn { display:inline-flex !important; }
        }
      `}</style>

      {/* ── Sidebar ── */}
      <div
        className={`msgs-sidebar card-flat ${mobileConvoOpen ? "is-hidden" : ""}`}
        style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}
      >
        <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: theme.text, marginBottom: 10 }}>Messages</div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: theme.text3, fontSize: 13, pointerEvents: "none" }}>
              <i className="fa-solid fa-magnifying-glass" />
            </span>
            <input
              aria-label="Search conversations"
              placeholder="Search conversations…"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              style={{ background: theme.input, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: 10, fontSize: 12, outline: "none", padding: "8px 10px 8px 30px", width: "100%", fontFamily: "inherit" }}
            />
          </div>
        </div>
        <div className="scroll-thin" style={{ overflowY: "auto", flex: 1, padding: 6 }}>
          {filteredConvos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 16px", color: theme.text3, fontSize: 12 }}>No conversations found</div>
          ) : (
            filteredConvos.map((c) => {
              const lastMsg = c.id === currentConvo?.id ? messages[messages.length - 1] : c.messages?.[c.messages.length - 1];
              const isActive = activeConvo?.id === c.id;
              return (
                <div
                  key={c.id}
                  className="convo-row"
                  onClick={() => { setActiveConvo(c); setMobileConvoOpen(true); }}
                  style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", borderRadius: 13, cursor: "pointer", transition: "all 0.2s", border: `1px solid ${isActive ? theme.border : "transparent"}`, background: isActive ? (dark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.07)") : "transparent", marginBottom: 2 }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <Avatar u={c.user} size={38} radius={10} dark={dark} />
                    <div style={{ position: "absolute", bottom: -1, right: -1, width: 7, height: 7, borderRadius: "50%", background: c.user.online ? "#22c55e" : "#555", border: `2px solid ${dark ? "#060608" : "#f5f5f9"}` }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c?.user?.name?.split(" ")?.[0] ?? "User"}
                      </span>
                      <span style={{ fontSize: 10, color: theme.text3, flexShrink: 0 }}>{lastMsg?.sent_at ? formatTime(lastMsg.sent_at) : ""}</span>
                    </div>
                    <div style={{ fontSize: 11, color: theme.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {lastMsg?.sender_id === currentUser?.id ? "You: " : ""}
                      {lastMsg?.content ?? ""}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat pane ── */}
      <div className="msgs-chat card-flat" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "13px 18px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button
            className="mobile-back-btn"
            onClick={() => setMobileConvoOpen(false)}
            style={{ padding: "6px 10px", background: "transparent", border: `1px solid ${theme.border}`, color: theme.text2, borderRadius: 9, cursor: "pointer", fontSize: 13, fontFamily: "inherit", alignItems: "center" }}
          >←</button>
          {currentConvo && (
            <>
              <div style={{ position: "relative" }}>
                <Avatar u={currentConvo.user} size={38} radius={10} dark={dark} />
                <div style={{ position: "absolute", bottom: -1, right: -1, width: 7, height: 7, borderRadius: "50%", background: currentConvo.user.online ? "#22c55e" : "#555", border: `2px solid ${dark ? "#060608" : "#f5f5f9"}` }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentConvo.user.name}</div>
                <div style={{ fontSize: 11, color: currentConvo.user.online ? "#22c55e" : theme.text3 }}>
                  {partnerTyping ? <span style={{ fontStyle: "italic" }}>typing…</span> : currentConvo.user.online ? "● Online" : "● Away"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: hsla(currentConvo.user.hue, 70, 60, dark ? 0.12 : 0.08), border: `1px solid ${hsla(currentConvo.user.hue, 70, 60, 0.25)}`, color: hsl(currentConvo.user.hue), whiteSpace: "nowrap" }}>
                  {matchScore}% match
                </span>
                <button
                  onClick={() => setShowMsgSearch((p) => !p)}
                  style={{ padding: "6px 9px", background: showMsgSearch ? (dark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.09)") : "transparent", border: `1px solid ${showMsgSearch ? "rgba(124,58,237,0.35)" : theme.border}`, color: showMsgSearch ? "#a78bfa" : theme.text3, borderRadius: 9, cursor: "pointer", fontSize: 13 }}
                >
                  <i className="fa-solid fa-magnifying-glass" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Connection / realtime error banner */}
        {connError && (
          <div className="fade-up" style={{ padding: "8px 18px", background: dark ? "rgba(248,113,113,0.08)" : "rgba(248,113,113,0.06)", borderBottom: "1px solid rgba(248,113,113,0.25)", display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12 }}>⚠️</span>
            <span style={{ fontSize: 11, color: "#f87171", flex: 1 }}>{connError}</span>
            <button onClick={() => setConnError("")} style={{ background: "none", border: "none", color: theme.text3, cursor: "pointer", fontSize: 12 }}>✕</button>
          </div>
        )}

        {/* Message search */}
        {showMsgSearch && (
          <div className="fade-up" style={{ padding: "8px 14px", borderBottom: `1px solid ${theme.border}`, background: dark ? "rgba(124,58,237,0.04)" : "rgba(124,58,237,0.03)" }}>
            <input
              aria-label="Search in conversation"
              placeholder="Search in conversation…"
              value={msgSearch}
              onChange={(e) => setMsgSearch(e.target.value)}
              autoFocus
              style={{ background: theme.input, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: 9, fontSize: 12, outline: "none", padding: "7px 12px", width: "100%", fontFamily: "inherit" }}
            />
          </div>
        )}

        {/* Match bar */}
        {currentConvo && (
          <div style={{ padding: "8px 18px", borderBottom: `1px solid ${theme.border}`, background: dark ? "rgba(124,58,237,0.03)" : "rgba(124,58,237,0.02)", display: "flex", gap: 8, alignItems: "center", overflow: "hidden" }}>
            <span style={{ fontSize: 12 }}>✦</span>
            <span style={{ fontSize: 11, color: dark ? "#8070aa" : "#6b5b9e", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Matched on <strong style={{ color: "#a78bfa" }}>{currentUser?.skillsHave?.[0] || "—"}</strong> ↔ <strong style={{ color: "#a78bfa" }}>{currentConvo.user.skillsHave?.[0] || "—"}</strong>
            </span>
          </div>
        )}

        {/* Pinned */}
        {pinnedMsg && (
          <div className="fade-up" style={{ padding: "8px 18px", background: dark ? "rgba(245,158,11,0.07)" : "rgba(245,158,11,0.06)", borderBottom: "1px solid rgba(245,158,11,0.2)", display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12 }}>📌</span>
            <span style={{ fontSize: 11, color: dark ? "#fbbf24" : "#92400e", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pinnedMsg.content}</span>
            <button onClick={() => setPinned((p) => { const n = { ...p }; delete n[currentConvo.id]; return n; })} style={{ background: "none", border: "none", color: theme.text3, cursor: "pointer", fontSize: 12 }}>✕</button>
          </div>
        )}

        {/* Messages area */}
        <div className="scroll-thin" style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 10 }} onClick={() => setReactionPickerFor(null)}>
          {loading && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
              <div style={{ color: theme.text3, fontSize: 12 }}>Loading messages…</div>
            </div>
          )}

          {!loading && filteredMessages.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 10 }}>
              <div style={{ fontSize: 36 }}>💬</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>No messages yet</div>
              <div style={{ fontSize: 12, color: theme.text3, textAlign: "center" }}>
                {currentConvo ? `Say hello to ${currentConvo?.user?.name?.split(" ")?.[0] ?? "them"}!` : "Select a conversation to start chatting"}
              </div>
            </div>
          )}

          {!loading && filteredMessages.map((m, i) => (
            <div
              key={m.id}
              className="fade-up"
              style={{ display: "flex", justifyContent: isMe(m) ? "flex-end" : "flex-start", animationDelay: `${Math.min(i, 12) * 0.025}s`, position: "relative", opacity: m.optimistic ? 0.6 : 1, transition: "opacity 0.2s" }}
            >
              <div style={{ position: "relative", maxWidth: "75%" }}>
                <div
                  style={{ padding: "10px 14px", borderRadius: 15, fontSize: 13, lineHeight: 1.5, background: isMe(m) ? theme.msgMe : theme.msgThem, color: isMe(m) ? "white" : theme.text, borderBottomRightRadius: isMe(m) ? 4 : 15, borderBottomLeftRadius: !isMe(m) ? 4 : 15, border: !isMe(m) ? `1px solid ${theme.border}` : "none", cursor: "default", wordBreak: "break-word" }}
                  onDoubleClick={() => setReactionPickerFor(reactionPickerFor === m.id ? null : m.id)}
                >
                  {msgSearch && m.content.toLowerCase().includes(msgSearch.toLowerCase()) ? (
                    <span dangerouslySetInnerHTML={{ __html: m.content.replace(new RegExp(`(${escapeRegExp(msgSearch)})`, "gi"), "<mark style='background:rgba(245,158,11,0.4);border-radius:3px;padding:0 2px'>$1</mark>") }} />
                  ) : (
                    m.content
                  )}
                  <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4, display: "flex", gap: 5, justifyContent: isMe(m) ? "flex-end" : "flex-start", alignItems: "center" }}>
                    {formatTime(m.sent_at)}
                    {isMe(m) && <span style={{ fontSize: 10 }}>{m.read ? "✓✓" : "✓"}</span>}
                  </div>
                </div>

                {m.reaction && (
                  <div
                    onClick={(e) => { e.stopPropagation(); toggleReaction(m.id, m.reaction); }}
                    style={{ animation: "popIn 0.18s ease", position: "absolute", bottom: -10, right: isMe(m) ? 0 : "auto", left: !isMe(m) ? 0 : "auto", background: dark ? "#1a1a2e" : "#fff", border: `1px solid ${theme.border}`, borderRadius: 99, padding: "2px 7px", fontSize: 12, cursor: "pointer", boxShadow: theme.shadow }}
                  >
                    {m.reaction}
                  </div>
                )}

                {reactionPickerFor === m.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ animation: "popIn 0.15s ease", position: "absolute", bottom: "100%", marginBottom: 6, [isMe(m) ? "right" : "left"]: 0, background: dark ? "#1a1a2e" : "#fff", border: `1px solid ${theme.border}`, borderRadius: 12, padding: "6px 8px", display: "flex", gap: 4, zIndex: 50, boxShadow: theme.shadow }}
                  >
                    {EMOJI_REACTIONS.map((e) => (
                      <button key={e} className="react-emoji-btn" onClick={() => toggleReaction(m.id, e)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, borderRadius: 8, padding: 4, transition: "transform 0.12s" }}>{e}</button>
                    ))}
                    <button onClick={() => setPinned((p) => ({ ...p, [currentConvo.id]: m.id }))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, borderRadius: 8, padding: "4px 6px", color: theme.text3 }} title="Pin message">📌</button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {partnerTyping && (
            <div className="fade-up" style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "10px 14px", borderRadius: 15, borderBottomLeftRadius: 4, background: theme.msgThem, border: `1px solid ${theme.border}`, display: "flex", gap: 4, alignItems: "center" }}>
                {[0, 0.15, 0.3].map((d, i) => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: theme.text3, animation: `pulseDot 1.2s ${d}s ease-in-out infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "11px 14px", borderTop: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          {sendError && (
            <div className="fade-up" style={{ fontSize: 11, color: "#f87171", padding: "6px 10px", borderRadius: 8, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span>{sendError}</span>
              <button onClick={() => setSendError("")} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 11, flexShrink: 0 }}>✕</button>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <textarea
                aria-label={currentConvo ? `Message ${currentConvo?.user?.name ?? "User"}` : "Message input"}
                placeholder={currentConvo ? `Message ${currentConvo?.user?.name?.split(" ")?.[0] ?? "User"}…` : "Select a conversation"}
                value={msgInput}
                maxLength={LIMITS.MESSAGE_MAX}
                onChange={(e) => { setMsgInput(e.target.value); setSendError(""); broadcastTyping(); }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                disabled={!currentConvo || !currentUser?.id || sending}
                rows={1}
                style={{ background: theme.input, border: `1px solid ${sendError ? "rgba(248,113,113,0.5)" : theme.inputBorder}`, color: theme.text, borderRadius: 11, fontSize: 13, outline: "none", padding: "10px 14px", width: "100%", fontFamily: "inherit", resize: "none", minHeight: 42 }}
              />
              {msgInput.length > LIMITS.MESSAGE_MAX * 0.9 && (
                <div style={{ fontSize: 10, color: msgInput.length >= LIMITS.MESSAGE_MAX ? "#f87171" : theme.text3, marginTop: 4, textAlign: "right" }}>
                  {msgInput.length}/{LIMITS.MESSAGE_MAX}
                </div>
              )}
            </div>
            <button
              className="send-btn"
              onClick={sendMsg}
              disabled={!msgInput.trim() || !currentUser?.id || sending}
              style={{ padding: "10px 16px", background: msgInput.trim() && !sending ? "linear-gradient(135deg,#7c3aed,#a855f7)" : dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: "none", color: msgInput.trim() && !sending ? "white" : theme.text3, borderRadius: 11, cursor: msgInput.trim() && !sending ? "pointer" : "not-allowed", fontFamily: "inherit", fontSize: 16, fontWeight: 700, flexShrink: 0, transition: "all 0.2s", boxShadow: msgInput.trim() && !sending ? "0 4px 14px rgba(124,58,237,0.25)" : "none" }}
            >
              {sending ? "…" : "↑"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Right mini-profile ── */}
      {currentConvo && (
        <div className="msgs-profile card-flat" style={{ width: 210, flexShrink: 0, padding: 16, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
          <div style={{ textAlign: "center" }}>
            <Avatar u={currentConvo.user} size={52} radius={14} dark={dark} />
            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginTop: 10 }}>{currentConvo.user.name}</div>
            <div style={{ fontSize: 11, color: theme.text3, marginTop: 2 }}>{currentConvo.user.role}</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Instrument Serif',serif", color: hsl(currentConvo.user.hue), marginTop: 6 }}>{matchScore}% match</div>
          </div>
          <div style={{ height: 1, background: theme.border }} />
          <div>
            <Lbl T={theme}>Their Skills</Lbl>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {(currentConvo.user.skillsHave || []).map((s) => (
                <span key={s} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: theme.skillHaveBg, border: `1px solid ${theme.skillHaveBorder}`, color: theme.skillHaveText }}>{s}</span>
              ))}
            </div>
          </div>
          <div>
            <Lbl T={theme}>They Need</Lbl>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {(currentConvo.user.skillsNeed || []).map((s) => (
                <span key={s} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: theme.skillNeedBg, border: `1px solid ${theme.skillNeedBorder}`, color: theme.skillNeedText }}>{s}</span>
              ))}
            </div>
          </div>
          <div style={{ height: 1, background: theme.border }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "center" }}>
            <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 10, padding: "10px 8px" }}>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: theme.text }}>{currentConvo.user.projects ?? 0}</div>
              <div style={{ fontSize: 10, color: theme.text3 }}>Projects</div>
            </div>
            <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 10, padding: "10px 8px" }}>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: theme.text }}>{currentConvo.user.followers ?? 0}</div>
              <div style={{ fontSize: 10, color: theme.text3 }}>Followers</div>
            </div>
          </div>
          <button style={{ background: "transparent", border: `1px solid ${theme.border}`, color: theme.text2, padding: 8, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>
            View Full Profile →
          </button>
        </div>
      )}
    </div>
  );
}