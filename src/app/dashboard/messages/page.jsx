"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LogOut, Search, Smile, Paperclip, Mic, Send, MoreVertical, Pencil, Trash2,
  Reply as ReplyIcon, Copy, Pin, PinOff, Check, CheckCheck, Clock, AlertTriangle,
  X, ArrowLeft, ChevronDown, Image as ImageIcon, FileText, MessageSquare, User,
  BellOff, Bell, Ban, Flag, Volume2, VolumeX, Download, Square, WifiOff, RotateCcw,
} from "lucide-react";

/* ============================================================
   SETUP
   1. Run schema.sql in your Supabase project (SQL Editor).
   2. Set env vars (Next.js: .env.local):
        NEXT_PUBLIC_SUPABASE_URL=...
        NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   3. Enable Realtime on "messages" table in Supabase Dashboard.
   4. Drop <MessagesTab /> into your app and pass:
        currentUser   -> { id, name, hue, skillsHave, skillsNeed, ... }
        convos        -> array of conversation objects (may include
                          unread_count: number, muted: boolean)
        setConvos     -> setState for convos
        activeConvo   -> currently selected convo (or null)
        setActiveConvo-> setState for activeConvo
        dark          -> boolean
        T             -> theme object (optional)

   FRONTEND FEATURES IN THIS FILE (no server changes required to see
   them work locally): reply-to, edit/delete (optimistic), attachments
   + image lightbox, voice notes (MediaRecorder), rich text (bold /
   italic / inline code / auto-links), date dividers, delivery ticks +
   retry-on-fail, unread badges, mute toggle, sound toggle, offline
   banner, "new messages" jump pill, per-conversation draft memory,
   keyboard shortcuts.

   TODO(server) markers throughout call out the schema / storage /
   endpoint work needed to persist these beyond the current session:
     - messages: add columns `attachments jsonb`, `reply_to jsonb`,
       `edited boolean default false`, `deleted boolean default false`
     - a Storage bucket (e.g. "chat-uploads") + upload helper to
       replace the local blob: URLs used for attachments/voice notes
     - a `conversation_members` (or similar) table to persist
       `muted` / `unread_count` instead of the in-memory state below
     - block/report endpoints for the header menu actions
   ============================================================ */

const EMOJI_REACTIONS = ["👍", "❤️", "🔥", "👀", "🚀"];
const LIMITS = { MESSAGE_MAX: 2000, MAX_ATTACHMENTS: 6 };
const TYPING_THROTTLE_MS = 1500;

function validateMessage(text, attachmentCount = 0) {
  const trimmed = (text || "").trim();
  if (!trimmed && !attachmentCount) return "Message can't be empty";
  if (trimmed.length > LIMITS.MESSAGE_MAX)
    return `Message is too long (max ${LIMITS.MESSAGE_MAX} characters)`;
  return "";
}

/* ── Icon sizing helper — every icon uses this, never a hardcoded size ── */
const iconSize = (min, max, vw = 3.2) => ({
  width: `clamp(${min}px, ${vw}vw, ${max}px)`,
  height: `clamp(${min}px, ${vw}vw, ${max}px)`,
  flexShrink: 0,
});

const RADIUS = { control: 8, pill: 6, card: 10, modal: 14 };
const ACCENT = "#7c3aed";
const ACCENT_LIGHT = "#a855f7";

const DEFAULT_THEME_LIGHT = {
  text: "#16161d", text2: "#4a4a57", text3: "#8a8a98",
  border: "rgba(0,0,0,0.12)", input: "#fff", inputBorder: "rgba(0,0,0,0.14)",
  msgMe: ACCENT, msgThem: "#fff",
  skillHaveBg: "rgba(34,197,94,0.08)", skillHaveBorder: "rgba(34,197,94,0.25)", skillHaveText: "#16a34a",
  skillNeedBg: "rgba(124,58,237,0.08)", skillNeedBorder: "rgba(124,58,237,0.25)", skillNeedText: ACCENT,
  surfaceBg: "#f9f9fb", cardHover: "#fcfcfd", danger: "#ef4444",
};
const DEFAULT_THEME_DARK = {
  ...DEFAULT_THEME_LIGHT,
  text: "#f2f2f7", text2: "#b6b6c3", text3: "#74747f",
  border: "rgba(255,255,255,0.12)", input: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.14)",
  msgThem: "rgba(255,255,255,0.06)",
  surfaceBg: "rgba(255,255,255,0.02)", cardHover: "rgba(255,255,255,0.035)", danger: "#f87171",
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

/* ── Small presentational helpers ─────────────────────────────────────── */
function Avatar({ u, size = 38, radius = RADIUS.card, dark }) {
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
      fontSize: size * 0.36, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
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
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
      color: T.text3, marginBottom: 6, fontFamily: "'JetBrains Mono',monospace",
    }}>
      {children}
    </div>
  );
}

function IconBtn({ Icon, onClick, active, danger, dark, T, label, size = 14, title, disabled }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={title || label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 30, height: 30, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        background: active ? (dark ? "rgba(124,58,237,0.16)" : "rgba(124,58,237,0.09)") : "transparent",
        border: `1px solid ${active ? "rgba(124,58,237,0.35)" : T.border}`,
        color: disabled ? T.text3 : danger ? T.danger : active ? "#a78bfa" : T.text2,
        borderRadius: RADIUS.control, cursor: disabled ? "not-allowed" : "pointer",
        filter: hover && !disabled ? "brightness(1.15)" : "none",
        opacity: disabled ? 0.5 : 1,
        transition: "filter 0.15s ease, background 0.15s ease, border-color 0.15s ease",
      }}
    >
      <Icon style={iconSize(size, size + 2, 2.4)} />
    </button>
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

/* ── Hooks ──────────────────────────────────────────────────────────── */
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return w;
}

function useAutoResize(ref, value) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [value, ref]);
}

function useOnlineStatus() {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return online;
}

/* ── Tiny pure-frontend notification beep (no audio asset needed) ────── */
function playTone(freq = 880, duration = 0.08) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    osc.onended = () => ctx.close();
  } catch { /* audio not available, fail silently */ }
}

/* ── Text rendering: auto-link URLs, then bold / italic / inline code ── */
function linkify(text, keyPrefix = "l") {
  const urlRegex = /((https?:\/\/|www\.)[^\s<]+)/gi;
  const parts = [];
  let lastIndex = 0, match, key = 0;
  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const url = match[0];
    const href = url.startsWith("www.") ? `https://${url}` : url;
    parts.push(
      <a key={`${keyPrefix}-${key++}`} href={href} target="_blank" rel="noopener noreferrer"
        style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 2 }}>
        {url}
      </a>
    );
    lastIndex = match.index + url.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function renderRich(text) {
  if (!text) return null;
  const tokens = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let lastIndex = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) tokens.push({ type: "text", value: text.slice(lastIndex, match.index) });
    if (match[2] !== undefined) tokens.push({ type: "bold", value: match[2] });
    else if (match[3] !== undefined) tokens.push({ type: "italic", value: match[3] });
    else if (match[4] !== undefined) tokens.push({ type: "code", value: match[4] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) tokens.push({ type: "text", value: text.slice(lastIndex) });
  return tokens.map((t, i) => {
    if (t.type === "bold") return <strong key={i}>{linkify(t.value, `b${i}`)}</strong>;
    if (t.type === "italic") return <em key={i}>{linkify(t.value, `i${i}`)}</em>;
    if (t.type === "code")
      return (
        <code key={i} style={{
          background: "rgba(127,127,127,0.2)", padding: "1px 5px", borderRadius: 4,
          fontFamily: "'JetBrains Mono',monospace", fontSize: "0.9em",
        }}>
          {t.value}
        </code>
      );
    return <span key={i}>{linkify(t.value, `t${i}`)}</span>;
  });
}

function formatDateDivider(ts) {
  const d = new Date(ts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const that = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today - that) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "long" });
  return d.toLocaleDateString([], {
    month: "short", day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function groupByDate(list) {
  const groups = [];
  let curKey = null, curArr = null;
  for (const m of list) {
    const dayKey = m.sent_at ? new Date(m.sent_at).toDateString() : "unknown";
    if (dayKey !== curKey) {
      curKey = dayKey;
      curArr = [];
      groups.push({ key: dayKey, label: m.sent_at ? formatDateDivider(m.sent_at) : "", items: curArr });
    }
    curArr.push(m);
  }
  return groups;
}

function formatBytes(n) {
  if (n === undefined || n === null) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function formatDuration(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
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
  const isOnline = useOnlineStatus();

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth < 960;

  const [mobilePanel, setMobilePanel] = useState("list"); // list | chat | profile

  const [msgInput, setMsgInput] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [reactionPickerFor, setReactionPickerFor] = useState(null);
  const [activeMenuFor, setActiveMenuFor] = useState(null);
  const [pinned, setPinned] = useState({});
  const [msgSearch, setMsgSearch] = useState("");
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState("");
  const [connError, setConnError] = useState("");

  // New: reply / edit / attachments / voice
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  // New: presence-adjacent UI state (frontend-only for now)
  const [mutedConvos, setMutedConvos] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [hasNewBelow, setHasNewBelow] = useState(false);

  const chatEndRef = useRef(null);
  const messagesScrollRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);
  const channelRef = useRef(null);
  const fileInputRef = useRef(null);
  const draftsRef = useRef({});
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordTimerRef = useRef(null);
  const discardRecordingRef = useRef(false);

  useAutoResize(textareaRef, msgInput);

  const currentConvo = convos?.find((c) => c.id === activeConvo?.id) ?? convos?.[0] ?? null;

  /* Open a convo — save/restore per-conversation draft in memory */
  const openConvo = useCallback((c) => {
    if (currentConvo) draftsRef.current[currentConvo.id] = msgInput;
    setActiveConvo(c);
    setMsgInput(draftsRef.current[c.id] || "");
    setReplyTo(null);
    setEditingId(null);
    setAttachments([]);
    setSendError("");
    if (isMobile) setMobilePanel("chat");
  }, [setActiveConvo, isMobile, currentConvo, msgInput]);

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

  /* ── Scroll to bottom / "new messages" pill ──────────────────────────
     Auto-scroll only when the user is already near the bottom, or the
     new message is their own. Otherwise surface a jump-to-bottom pill
     instead of yanking their scroll position. */
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last) return;
    const mine = last.sender_id === currentUser?.id;
    if (isNearBottom || mine) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasNewBelow(false);
    } else {
      setHasNewBelow(true);
      if (soundEnabled && !mutedConvos[currentConvo?.id]) playTone(740, 0.07);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const handleMessagesScroll = useCallback((e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setIsNearBottom(nearBottom);
    if (nearBottom) setHasNewBelow(false);
  }, []);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setHasNewBelow(false);
    setIsNearBottom(true);
  }, []);

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

  /* ── Attachments ──────────────────────────────────────────────────── */
  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const room = LIMITS.MAX_ATTACHMENTS - attachments.length;
    const next = files.slice(0, Math.max(0, room)).map((f) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: f.name, size: f.size, type: f.type,
      url: URL.createObjectURL(f), // TODO(server): upload to storage bucket, use returned URL
      kind: f.type.startsWith("image/") ? "image" : "file",
    }));
    setAttachments((prev) => [...prev, ...next]);
    e.target.value = "";
  };

  const removeAttachment = (id) => setAttachments((prev) => prev.filter((a) => a.id !== id));

  /* ── Voice notes (MediaRecorder is a browser API — no server needed
     to record; persisting the audio beyond this session needs storage) ── */
  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setSendError("Voice recording isn't supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      const chunks = [];
      discardRecordingRef.current = false;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        if (discardRecordingRef.current) { discardRecordingRef.current = false; return; }
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob); // TODO(server): upload blob to storage bucket
        setAttachments((prev) => [...prev, {
          id: `voice-${Date.now()}`, name: "Voice message", size: blob.size, type: blob.type,
          url, kind: "audio", duration: recordSeconds,
        }]);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } catch {
      setSendError("Microphone access was denied or is unavailable.");
    }
  };

  const finishRecording = () => {
    clearInterval(recordTimerRef.current);
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const cancelRecording = () => {
    discardRecordingRef.current = true;
    clearInterval(recordTimerRef.current);
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setRecordSeconds(0);
  };

  useEffect(() => () => clearInterval(recordTimerRef.current), []);

  /* ── Reply / edit ─────────────────────────────────────────────────── */
  const startReply = (m) => { setReplyTo(m); setEditingId(null); setActiveMenuFor(null); textareaRef.current?.focus(); };
  const cancelReply = () => setReplyTo(null);

  const startEdit = (m) => {
    setEditingId(m.id);
    setMsgInput(m.content || "");
    setReplyTo(null);
    setActiveMenuFor(null);
    textareaRef.current?.focus();
  };
  const cancelEdit = () => {
    setEditingId(null);
    setMsgInput(draftsRef.current[currentConvo?.id] || "");
  };

  const saveEdit = useCallback(async () => {
    const trimmed = msgInput.trim();
    if (!trimmed) { setSendError("Message can't be empty"); return; }
    setMessages((prev) => prev.map((m) => (m.id === editingId ? { ...m, content: trimmed, edited: true } : m)));
    setEditingId(null);
    setMsgInput("");
    setSendError("");
    if (!String(editingId).startsWith("optimistic-")) {
      try {
        const sb = getSupabase();
        // TODO(server): requires an `edited boolean` column on messages
        const { error } = await sb.from("messages").update({ content: trimmed, edited: true }).eq("id", editingId);
        if (error) throw error;
      } catch (err) {
        setConnError(err?.message || "Couldn't save the edit — it may not have synced.");
      }
    }
  }, [msgInput, editingId]);

  const deleteMessage = useCallback(async (m) => {
    setActiveMenuFor(null);
    if (!window.confirm("Delete this message? This can't be undone.")) return;
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, deleted: true, content: "", attachments: [] } : x)));
    if (!String(m.id).startsWith("optimistic-")) {
      try {
        const sb = getSupabase();
        // TODO(server): requires a `deleted boolean` column (soft delete) on messages
        const { error } = await sb.from("messages").update({ deleted: true, content: "" }).eq("id", m.id);
        if (error) throw error;
      } catch (err) {
        setConnError(err?.message || "Couldn't delete on the server — it may reappear on refresh.");
      }
    }
  }, []);

  const copyMessage = async (text) => {
    setActiveMenuFor(null);
    try { await navigator.clipboard.writeText(text || ""); } catch { /* clipboard unavailable */ }
  };

  /* ── Send message ─────────────────────────────────────────────────── */
  const buildOptimisticMsg = useCallback((content, atts, reply) => ({
    id: `optimistic-${Date.now()}`,
    conversation_id: currentConvo.id,
    sender_id: currentUser.id,
    content,
    attachments: atts,
    reply_to: reply ? { id: reply.id, content: reply.content, sender_id: reply.sender_id } : null,
    sent_at: new Date().toISOString(),
    read: false,
    optimistic: true,
    status: isOnline ? "sending" : "failed",
  }), [currentConvo, currentUser, isOnline]);

  const deliverMessage = useCallback(async (pending) => {
    setMessages((prev) => prev.some((m) => m.id === pending.id) ? prev : [...prev, pending]);
    if (!isOnline) {
      setMessages((prev) => prev.map((m) => (m.id === pending.id ? { ...m, status: "failed" } : m)));
      return;
    }
    setSending(true);
    try {
      const sb = getSupabase();
      // TODO(server): `attachments jsonb` and `reply_to jsonb` columns needed
      // to actually persist these fields — sending content-only for now so
      // this still works against the base schema.
      const { data, error } = await sb
        .from("messages")
        .insert({ conversation_id: pending.conversation_id, sender_id: pending.sender_id, content: pending.content })
        .select().single();
      if (error || !data) throw new Error(error?.message || "Failed to send.");
      const merged = { ...data, attachments: pending.attachments, reply_to: pending.reply_to };
      setMessages((prev) => mergeIncomingMessage(prev.filter((m) => m.id !== pending.id), merged));
      updateConvoPreview(pending.conversation_id, merged);
      if (soundEnabled) playTone(660, 0.05);
    } catch (err) {
      setMessages((prev) => prev.map((m) => (m.id === pending.id ? { ...m, status: "failed" } : m)));
      setSendError(err?.message || "Failed to send. Check the message and try again.");
    } finally {
      setSending(false);
    }
  }, [isOnline, soundEnabled, updateConvoPreview]);

  const sendMsg = useCallback(async () => {
    if (editingId) return saveEdit();
    const contentErr = validateMessage(msgInput, attachments.length);
    if (contentErr) { setSendError(contentErr); return; }
    if (!currentConvo || !currentUser?.id || sending) return;

    const content = msgInput.trim();
    const atts = attachments;
    const reply = replyTo;
    setMsgInput("");
    setAttachments([]);
    setReplyTo(null);
    setSendError("");
    draftsRef.current[currentConvo.id] = "";

    await deliverMessage(buildOptimisticMsg(content, atts, reply));
  }, [editingId, saveEdit, msgInput, attachments, currentConvo, currentUser?.id, sending, replyTo, deliverMessage, buildOptimisticMsg]);

  const retrySend = useCallback((m) => {
    setMessages((prev) => prev.filter((x) => x.id !== m.id));
    deliverMessage({ ...m, id: `optimistic-${Date.now()}`, status: "sending" });
  }, [deliverMessage]);

  /* ── Reactions ────────────────────────────────────────────────────── */
  const toggleReaction = useCallback(async (msgId, emoji) => {
    setReactionPickerFor(null);
    setActiveMenuFor(null);
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

  /* ── Keyboard shortcuts ───────────────────────────────────────────── */
  const handleComposerKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); return; }
    if (e.key === "Escape") {
      if (editingId) cancelEdit();
      else if (replyTo) cancelReply();
      return;
    }
    if (e.key === "ArrowUp" && !msgInput && !editingId) {
      const lastMine = [...messages].reverse().find((m) => m.sender_id === currentUser?.id && !m.deleted);
      if (lastMine) { e.preventDefault(); startEdit(lastMine); }
    }
  };

  useEffect(() => {
    if (!lightboxUrl) return;
    const onKey = (e) => { if (e.key === "Escape") setLightboxUrl(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxUrl]);

  /* ── Mute / header menu ───────────────────────────────────────────── */
  const toggleMute = (convoId) => {
    // TODO(server): persist mute state per member instead of local-only
    setMutedConvos((p) => ({ ...p, [convoId]: !p[convoId] }));
    setShowHeaderMenu(false);
  };

  /* ── Helpers ──────────────────────────────────────────────────────── */
  const isMe = (m) => m.sender_id === currentUser?.id;
  const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "…";
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const filteredConvos = useMemo(
    () => (convos || []).filter((c) => !searchQ || c.user.name.toLowerCase().includes(searchQ.toLowerCase())),
    [convos, searchQ]
  );
  const filteredMessages = useMemo(
    () => (messages || []).filter((m) => !msgSearch || (m.content || "").toLowerCase().includes(msgSearch.toLowerCase())),
    [messages, msgSearch]
  );
  const dateGroups = useMemo(() => groupByDate(filteredMessages), [filteredMessages]);

  const matchScore = currentConvo ? calculateMatchScore(currentUser, currentConvo.user) : 0;
  const pinnedMsgId = pinned[currentConvo?.id];
  const pinnedMsg = pinnedMsgId ? messages.find((m) => m.id === pinnedMsgId) : null;
  const isMuted = !!mutedConvos[currentConvo?.id];

  const showSidebar = !isMobile || mobilePanel === "list";
  const showChat = !isMobile || mobilePanel === "chat";
  const showProfile = !isTablet && !isMobile && currentConvo;
  const showMobileProfileBtn = isMobile && mobilePanel === "chat" && currentConvo;

  /* ── Styles ───────────────────────────────────────────────────────── */
  const s = {
    scrollbar: {
      overflowY: "auto",
      scrollbarWidth: "thin",
      scrollbarColor: `${dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)"} transparent`,
    },
    card: {
      background: dark ? "rgba(255,255,255,0.03)" : "#fff",
      border: `1px solid ${theme.border}`,
      borderRadius: RADIUS.card,
      overflow: "hidden",
    },
    input: {
      background: theme.input,
      border: `1px solid ${theme.inputBorder}`,
      color: theme.text,
      borderRadius: RADIUS.control,
      fontSize: 13,
      outline: "none",
      fontFamily: "'Inter',sans-serif",
      padding: "8px 12px",
    },
    searchInput: {
      background: theme.input,
      border: `1px solid ${theme.inputBorder}`,
      color: theme.text,
      borderRadius: RADIUS.control,
      fontSize: 12,
      outline: "none",
      fontFamily: "'Inter',sans-serif",
      padding: "8px 10px 8px 32px",
      width: "100%",
    },
    pill: {
      borderRadius: RADIUS.pill,
      fontFamily: "'JetBrains Mono',monospace",
    },
  };

  /* ── Sub-render: a single message bubble ─────────────────────────── */
  const renderMessage = (m, i) => {
    const mine = isMe(m);
    const failed = m.status === "failed";
    const sending_ = m.status === "sending";
    return (
      <div
        key={m.id}
        style={{
          display: "flex",
          justifyContent: mine ? "flex-end" : "flex-start",
          opacity: m.optimistic && !failed ? 0.7 : 1,
          transition: "opacity 0.15s ease",
          position: "relative",
          animation: `msgIn 0.2s ${Math.min(i, 12) * 0.02}s both`,
        }}
      >
        {!mine && currentConvo && (
          <div style={{ flexShrink: 0, marginRight: 6, alignSelf: "flex-end" }}>
            <Avatar u={currentConvo.user} size={24} radius={6} dark={dark} />
          </div>
        )}

        <div style={{ position: "relative", maxWidth: isMobile ? "84%" : "68%" }}>
          <div
            style={{
              padding: "9px 12px",
              borderRadius: 14,
              fontSize: 13, lineHeight: 1.55,
              background: mine ? theme.msgMe : theme.msgThem,
              color: mine ? "white" : theme.text,
              borderBottomRightRadius: mine ? 4 : 14,
              borderBottomLeftRadius: !mine ? 4 : 14,
              border: !mine ? `1px solid ${theme.border}` : "none",
              wordBreak: "break-word",
              userSelect: "text",
            }}
          >
            {m.deleted ? (
              <span style={{ fontStyle: "italic", opacity: 0.7, display: "flex", alignItems: "center", gap: 5 }}>
                <Ban style={iconSize(11, 13, 2)} /> This message was deleted
              </span>
            ) : (
              <>
                {m.reply_to && (
                  <div style={{
                    borderLeft: `3px solid ${mine ? "rgba(255,255,255,0.6)" : ACCENT}`,
                    background: mine ? "rgba(255,255,255,0.12)" : (dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.06)"),
                    borderRadius: 6, padding: "4px 8px", marginBottom: 6, fontSize: 11.5,
                    opacity: 0.9, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {m.reply_to.content || "Attachment"}
                  </div>
                )}

                {!!(m.attachments && m.attachments.length) && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: m.content ? 6 : 0 }}>
                    {m.attachments.map((a) => {
                      if (a.kind === "image") {
                        return (
                          <img
                            key={a.id} src={a.url} alt={a.name}
                            onClick={() => setLightboxUrl(a.url)}
                            style={{ maxWidth: 220, maxHeight: 220, borderRadius: RADIUS.card, cursor: "zoom-in", display: "block", border: `1px solid ${mine ? "rgba(255,255,255,0.25)" : theme.border}` }}
                          />
                        );
                      }
                      if (a.kind === "audio") {
                        return (
                          <div key={a.id} style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 200 }}>
                            <audio controls src={a.url} style={{ height: 34, width: 220 }} />
                            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", opacity: 0.75 }}>
                              {formatDuration(a.duration)}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <a
                          key={a.id} href={a.url} download={a.name}
                          style={{
                            display: "flex", alignItems: "center", gap: 6, padding: "6px 9px",
                            borderRadius: RADIUS.control, textDecoration: "none",
                            background: mine ? "rgba(255,255,255,0.14)" : (dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
                            color: "inherit", fontSize: 11.5, maxWidth: 220,
                          }}
                        >
                          <FileText style={iconSize(14, 16, 2)} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{a.name}</span>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", opacity: 0.7, flexShrink: 0 }}>{formatBytes(a.size)}</span>
                          <Download style={iconSize(12, 14, 2)} />
                        </a>
                      );
                    })}
                  </div>
                )}

                {m.content && (
                  msgSearch && m.content.toLowerCase().includes(msgSearch.toLowerCase()) ? (
                    <span dangerouslySetInnerHTML={{
                      __html: m.content.replace(
                        new RegExp(`(${escapeRegExp(msgSearch)})`, "gi"),
                        "<mark style='background:rgba(245,158,11,0.45);border-radius:3px;padding:0 2px'>$1</mark>"
                      ),
                    }} />
                  ) : renderRich(m.content)
                )}

                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, display: "flex", gap: 5, justifyContent: mine ? "flex-end" : "flex-start", alignItems: "center", fontFamily: "'JetBrains Mono',monospace" }}>
                  {m.edited && <span style={{ fontStyle: "italic" }}>edited</span>}
                  {formatTime(m.sent_at)}
                  {mine && !failed && (
                    sending_
                      ? <Clock style={iconSize(11, 12, 2)} />
                      : m.read
                        ? <CheckCheck style={{ ...iconSize(12, 13, 2), color: "#93c5fd" }} />
                        : <Check style={iconSize(12, 13, 2)} />
                  )}
                </div>
              </>
            )}
          </div>

          {failed && (
            <button
              onClick={() => retrySend(m)}
              style={{
                display: "flex", alignItems: "center", gap: 4, marginTop: 4, background: "none", border: "none",
                cursor: "pointer", color: theme.danger, fontSize: 10.5, padding: 0, fontFamily: "'Inter',sans-serif",
                marginLeft: mine ? "auto" : 0,
              }}
            >
              <AlertTriangle style={iconSize(11, 12, 2)} /> Failed to send · Retry
              <RotateCcw style={iconSize(11, 12, 2)} />
            </button>
          )}

          {!m.deleted && (
            <>
              {m.reaction && (
                <div
                  onClick={(e) => { e.stopPropagation(); toggleReaction(m.id, m.reaction); }}
                  style={{
                    position: "absolute", bottom: -10,
                    right: mine ? 0 : "auto", left: !mine ? 0 : "auto",
                    background: dark ? "#1a1a2e" : "#fff",
                    border: `1px solid ${theme.border}`, borderRadius: 99,
                    padding: "1px 6px", fontSize: 12, cursor: "pointer",
                  }}
                >
                  {m.reaction}
                </div>
              )}

              {/* Kebab menu trigger */}
              <button
                onClick={(e) => { e.stopPropagation(); setActiveMenuFor(activeMenuFor === m.id ? null : m.id); setReactionPickerFor(null); }}
                aria-label="Message actions"
                style={{
                  position: "absolute", top: 2, [mine ? "left" : "right"]: -28,
                  background: "transparent", border: "none", cursor: "pointer",
                  color: theme.text3, padding: 4, opacity: 0.6,
                }}
              >
                <MoreVertical style={iconSize(13, 15, 2)} />
              </button>

              {activeMenuFor === m.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute", top: 22, [mine ? "left" : "right"]: -8, zIndex: 50,
                    background: dark ? "#17172a" : "#fff", border: `1px solid ${theme.border}`,
                    borderRadius: RADIUS.control, padding: 4, minWidth: 152,
                    display: "flex", flexDirection: "column",
                  }}
                >
                  <div style={{ display: "flex", gap: 2, padding: "4px 4px 6px", borderBottom: `1px solid ${theme.border}`, marginBottom: 4 }}>
                    {EMOJI_REACTIONS.map((e) => (
                      <button
                        key={e} onClick={() => toggleReaction(m.id, e)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, borderRadius: 6, padding: 3 }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  <MenuRow icon={ReplyIcon} label="Reply" onClick={() => startReply(m)} theme={theme} />
                  {m.content && <MenuRow icon={Copy} label="Copy text" onClick={() => copyMessage(m.content)} theme={theme} />}
                  <MenuRow
                    icon={pinnedMsgId === m.id ? PinOff : Pin}
                    label={pinnedMsgId === m.id ? "Unpin" : "Pin message"}
                    onClick={() => { setPinned((p) => { const n = { ...p }; if (n[currentConvo.id] === m.id) delete n[currentConvo.id]; else n[currentConvo.id] = m.id; return n; }); setActiveMenuFor(null); }}
                    theme={theme}
                  />
                  {mine && <MenuRow icon={Pencil} label="Edit" onClick={() => startEdit(m)} theme={theme} />}
                  {mine && <MenuRow icon={Trash2} label="Delete" danger onClick={() => deleteMessage(m)} theme={theme} />}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div
      style={{
        fontFamily: "'Inter',sans-serif",
        display: "flex", flexDirection: "column", gap: 8,
        height: "calc(100vh - 120px)", minHeight: 420, boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes msgIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulseDot { 0%,80%,100% { transform:scale(0.6); opacity:0.4; } 40% { transform:scale(1); opacity:1; } }
        @keyframes recPulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
      `}</style>

      {!isOnline && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
          background: dark ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.07)",
          border: `1px solid rgba(245,158,11,0.25)`, borderRadius: RADIUS.control,
          fontSize: 12, color: dark ? "#fbbf24" : "#92400e", flexShrink: 0,
        }}>
          <WifiOff style={iconSize(14, 16, 2)} />
          You're offline. Messages will be marked failed until your connection returns.
        </div>
      )}

      <div style={{ display: "flex", gap: isMobile ? 0 : 12, flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>

        {/* ══════════════ SIDEBAR ══════════════ */}
        {showSidebar && (
          <div style={{ ...s.card, width: isMobile ? "100%" : 272, flexShrink: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.4px", color: theme.text, marginBottom: 10 }}>
                Messages
              </div>
              <div style={{ position: "relative" }}>
                <Search style={{ ...iconSize(13, 14, 2), position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: theme.text3, pointerEvents: "none" }} />
                <input
                  aria-label="Search conversations"
                  placeholder="Search…"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  style={s.searchInput}
                />
              </div>
            </div>

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
                const unread = !isActive ? (c.unread_count || 0) : 0;
                const muted = !!mutedConvos[c.id] || c.muted;
                return (
                  <div
                    key={c.id}
                    onClick={() => openConvo(c)}
                    style={{
                      display: "flex", alignItems: "center", gap: 11,
                      padding: "10px 12px", borderRadius: RADIUS.card, cursor: "pointer",
                      transition: "background 0.15s ease, border-color 0.15s ease",
                      background: isActive
                        ? (dark ? "rgba(124,58,237,0.14)" : "rgba(124,58,237,0.07)")
                        : "transparent",
                      border: `1px solid ${isActive ? "rgba(124,58,237,0.28)" : "transparent"}`,
                      marginBottom: 2,
                    }}
                    onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = theme.cardHover; e.currentTarget.style.borderColor = dark ? "rgba(139,92,246,0.18)" : "rgba(139,92,246,0.14)"; } }}
                    onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}
                  >
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <Avatar u={c.user} size={38} radius={10} dark={dark} />
                      <OnlineDot online={c.user.online} dark={dark} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, gap: 6, alignItems: "center" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c?.user?.name?.split(" ")?.[0] ?? "User"}
                          </span>
                          {muted && <BellOff style={{ ...iconSize(11, 12, 2), color: theme.text3, flexShrink: 0 }} />}
                        </span>
                        {lastMsg?.sent_at && (
                          <span style={{ fontSize: 10, color: theme.text3, flexShrink: 0, fontFamily: "'JetBrains Mono',monospace" }}>
                            {formatTime(lastMsg.sent_at)}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                        <div style={{ fontSize: 11, color: theme.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                          {lastMsg?.sender_id === currentUser?.id ? "You: " : ""}
                          {lastMsg?.content ?? ""}
                        </div>
                        {unread > 0 && (
                          <span style={{
                            ...s.pill, background: ACCENT, color: "#fff", fontSize: 10, fontWeight: 700,
                            padding: "1px 6px", flexShrink: 0, minWidth: 16, textAlign: "center",
                          }}>
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
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
          <div style={{ ...s.card, flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative" }}>

            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              {isMobile && (
                <button
                  onClick={goBack} aria-label="Back"
                  style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${theme.border}`, color: theme.text2, borderRadius: RADIUS.control, cursor: "pointer", flexShrink: 0 }}
                >
                  <ArrowLeft style={iconSize(14, 16, 2)} />
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
                      {partnerTyping ? "typing…" : currentConvo.user.online ? "Online" : "Away"}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0, position: "relative" }}>
                    <span style={{
                      ...s.pill, fontSize: 11, fontWeight: 700, padding: "3px 9px",
                      background: hsla(currentConvo.user.hue, 70, 60, dark ? 0.12 : 0.08),
                      border: `1px solid ${hsla(currentConvo.user.hue, 70, 60, 0.25)}`,
                      color: hsl(currentConvo.user.hue), whiteSpace: "nowrap",
                    }}>
                      {matchScore}% match
                    </span>

                    <IconBtn Icon={Search} label="Search messages" onClick={() => setShowMsgSearch((p) => !p)} active={showMsgSearch} dark={dark} T={theme} />
                    <IconBtn Icon={soundEnabled ? Volume2 : VolumeX} label="Toggle sound" onClick={() => setSoundEnabled((p) => !p)} dark={dark} T={theme} />

                    {showMobileProfileBtn && (
                      <IconBtn Icon={User} label="View profile" onClick={() => setMobilePanel("profile")} dark={dark} T={theme} />
                    )}

                    <IconBtn Icon={MoreVertical} label="More options" onClick={() => setShowHeaderMenu((p) => !p)} active={showHeaderMenu} dark={dark} T={theme} />

                    {showHeaderMenu && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute", top: 36, right: 0, zIndex: 50, minWidth: 176,
                          background: dark ? "#17172a" : "#fff", border: `1px solid ${theme.border}`,
                          borderRadius: RADIUS.control, padding: 4,
                        }}
                      >
                        <MenuRow icon={isMuted ? Bell : BellOff} label={isMuted ? "Unmute conversation" : "Mute conversation"} onClick={() => toggleMute(currentConvo.id)} theme={theme} />
                        <MenuRow icon={Ban} label="Block user" onClick={() => { setShowHeaderMenu(false); /* TODO(server): block endpoint */ }} theme={theme} />
                        <MenuRow icon={Flag} label="Report conversation" onClick={() => { setShowHeaderMenu(false); /* TODO(server): report endpoint */ }} theme={theme} />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ color: theme.text3, fontSize: 13 }}>Select a conversation</div>
              )}
            </div>

            {connError && (
              <div style={{ padding: "8px 16px", background: dark ? "rgba(248,113,113,0.08)" : "rgba(248,113,113,0.06)", borderBottom: "1px solid rgba(248,113,113,0.2)", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                <AlertTriangle style={{ ...iconSize(13, 14, 2), color: theme.danger }} />
                <span style={{ fontSize: 11, color: theme.danger, flex: 1 }}>{connError}</span>
                <button onClick={() => setConnError("")} style={{ background: "none", border: "none", color: theme.text3, cursor: "pointer", display: "flex" }}><X style={iconSize(12, 13, 2)} /></button>
              </div>
            )}

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

            {currentConvo && (
              <div style={{ padding: "6px 16px", borderBottom: `1px solid ${theme.border}`, background: theme.surfaceBg, display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: dark ? "#8070aa" : "#6b5b9e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Matched on{" "}
                  <strong style={{ color: "#a78bfa", fontFamily: "'JetBrains Mono',monospace" }}>{currentUser?.skillsHave?.[0] || "—"}</strong>
                  {" ↔ "}
                  <strong style={{ color: "#a78bfa", fontFamily: "'JetBrains Mono',monospace" }}>{currentConvo.user.skillsHave?.[0] || "—"}</strong>
                </span>
              </div>
            )}

            {pinnedMsg && (
              <div style={{ padding: "7px 16px", background: dark ? "rgba(245,158,11,0.07)" : "rgba(245,158,11,0.06)", borderBottom: "1px solid rgba(245,158,11,0.2)", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                <Pin style={{ ...iconSize(12, 13, 2), color: dark ? "#fbbf24" : "#92400e" }} />
                <span style={{ fontSize: 11, color: dark ? "#fbbf24" : "#92400e", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {pinnedMsg.content}
                </span>
                <button onClick={() => setPinned((p) => { const n = { ...p }; delete n[currentConvo.id]; return n; })} style={{ background: "none", border: "none", color: theme.text3, cursor: "pointer", display: "flex" }}>
                  <X style={iconSize(12, 13, 2)} />
                </button>
              </div>
            )}

            <div
              ref={messagesScrollRef}
              onScroll={handleMessagesScroll}
              style={{ ...s.scrollbar, flex: 1, padding: "16px 30px 8px", display: "flex", flexDirection: "column", gap: 8, position: "relative" }}
              onClick={() => { setReactionPickerFor(null); setActiveMenuFor(null); setShowHeaderMenu(false); }}
            >
              {loading && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
                  <div style={{ color: theme.text3, fontSize: 13 }}>Loading…</div>
                </div>
              )}

              {!loading && filteredMessages.length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 10 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: RADIUS.card, display: "flex", alignItems: "center", justifyContent: "center",
                    background: dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.06)", border: `1px solid ${dark ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.15)"}`,
                  }}>
                    <MessageSquare style={{ ...iconSize(22, 26, 4), color: "#a78bfa" }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>No messages yet</div>
                  <div style={{ fontSize: 12, color: theme.text3, textAlign: "center" }}>
                    {currentConvo
                      ? `Say hello to ${currentConvo.user.name.split(" ")[0]}!`
                      : "Select a conversation to start chatting"}
                  </div>
                </div>
              )}

              {!loading && dateGroups.map((group) => (
                <div key={group.key}>
                  <div style={{ display: "flex", justifyContent: "center", margin: "6px 0 12px" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase",
                      color: theme.text3, fontFamily: "'JetBrains Mono',monospace",
                      background: theme.surfaceBg, border: `1px solid ${theme.border}`,
                      padding: "3px 10px", borderRadius: RADIUS.pill,
                    }}>
                      {group.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {group.items.map((m, i) => renderMessage(m, i))}
                  </div>
                </div>
              ))}

              {partnerTyping && (
                <div style={{ display: "flex", justifyContent: "flex-start", gap: 6, alignItems: "flex-end" }}>
                  {currentConvo && <Avatar u={currentConvo.user} size={24} radius={6} dark={dark} />}
                  <div style={{ padding: "10px 14px", borderRadius: 14, borderBottomLeftRadius: 4, background: theme.msgThem, border: `1px solid ${theme.border}`, display: "flex", gap: 4, alignItems: "center" }}>
                    {[0, 0.15, 0.3].map((d, i) => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: theme.text3, animation: `pulseDot 1.2s ${d}s ease-in-out infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {hasNewBelow && (
              <button
                onClick={scrollToBottom}
                style={{
                  position: "absolute", bottom: 96, left: "50%", transform: "translateX(-50%)",
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                  background: ACCENT, color: "#fff", border: `1px solid ${ACCENT}`,
                  borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer", zIndex: 20,
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                New messages <ChevronDown style={iconSize(12, 13, 2)} />
              </button>
            )}

            {/* ── Input area ─────────────────────────────────────────── */}
            <div style={{ padding: "10px 12px", borderTop: `1px solid ${theme.border}`, flexShrink: 0, background: dark ? "rgba(255,255,255,0.01)" : theme.surfaceBg }}>

              {editingId && (
                <ContextBanner icon={Pencil} label="Editing message" onCancel={cancelEdit} theme={theme} />
              )}
              {!editingId && replyTo && (
                <ContextBanner icon={ReplyIcon} label={`Replying to: ${replyTo.content || "attachment"}`} onCancel={cancelReply} theme={theme} />
              )}

              {sendError && (
                <div style={{ fontSize: 11, color: theme.danger, padding: "6px 10px", borderRadius: RADIUS.control, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.18)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span>{sendError}</span>
                  <button onClick={() => setSendError("")} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", display: "flex" }}><X style={iconSize(11, 12, 2)} /></button>
                </div>
              )}

              {!!attachments.length && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {attachments.map((a) => (
                    <div key={a.id} style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "5px 8px",
                      borderRadius: RADIUS.control, background: theme.input, border: `1px solid ${theme.inputBorder}`, fontSize: 11,
                    }}>
                      {a.kind === "image" ? <ImageIcon style={iconSize(13, 14, 2)} /> : a.kind === "audio" ? <Mic style={iconSize(13, 14, 2)} /> : <FileText style={iconSize(13, 14, 2)} />}
                      <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: theme.text2 }}>{a.name}</span>
                      <button onClick={() => removeAttachment(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: theme.text3, display: "flex" }}>
                        <X style={iconSize(11, 12, 2)} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {isRecording ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px" }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: theme.danger, animation: "recPulse 1s ease-in-out infinite" }} />
                  <span style={{ fontSize: 13, color: theme.text2, fontFamily: "'JetBrains Mono',monospace", flex: 1 }}>
                    Recording… {formatDuration(recordSeconds)}
                  </span>
                  <IconBtn Icon={Trash2} label="Cancel recording" onClick={cancelRecording} danger dark={dark} T={theme} />
                  <IconBtn Icon={Check} label="Finish recording" onClick={finishRecording} active dark={dark} T={theme} />
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <input ref={fileInputRef} type="file" multiple hidden onChange={handleFileChange} />
                  <IconBtn Icon={Paperclip} label="Attach files" onClick={handleAttachClick} disabled={!currentConvo || attachments.length >= LIMITS.MAX_ATTACHMENTS} dark={dark} T={theme} />

                  <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                    <textarea
                      ref={textareaRef}
                      aria-label={currentConvo ? `Message ${currentConvo.user.name}` : "Message input"}
                      placeholder={currentConvo ? `Message ${currentConvo.user.name.split(" ")[0]}…` : "Select a conversation"}
                      value={msgInput}
                      maxLength={LIMITS.MESSAGE_MAX}
                      onChange={(e) => { setMsgInput(e.target.value); setSendError(""); broadcastTyping(); if (currentConvo) draftsRef.current[currentConvo.id] = e.target.value; }}
                      onKeyDown={handleComposerKeyDown}
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
                      <div style={{ position: "absolute", bottom: 4, right: 8, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: msgInput.length >= LIMITS.MESSAGE_MAX ? theme.danger : theme.text3, pointerEvents: "none" }}>
                        {msgInput.length}/{LIMITS.MESSAGE_MAX}
                      </div>
                    )}
                  </div>

                  {!msgInput.trim() && !attachments.length && !editingId ? (
                    <MicButton onClick={startRecording} disabled={!currentConvo} />
                  ) : (
                    <SendButton onClick={sendMsg} disabled={(!msgInput.trim() && !attachments.length) || !currentUser?.id || sending} sending={sending} editing={!!editingId} />
                  )}
                </div>
              )}

              <div style={{ fontSize: 10, color: theme.text3, marginTop: 5, paddingLeft: 2, fontFamily: "'Inter',sans-serif" }}>
                Enter to send · Shift+Enter for new line · Esc to cancel reply/edit
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ RIGHT PROFILE PANEL (tablet/desktop) ══════════════ */}
        {showProfile && (
          <ProfilePanel currentConvo={currentConvo} currentUser={currentUser} theme={theme} dark={dark} matchScore={matchScore} />
        )}

        {/* ══════════════ MOBILE: Full-screen profile panel ══════════════ */}
        {isMobile && mobilePanel === "profile" && currentConvo && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10, ...s.card, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "12px 14px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <button onClick={goBack} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${theme.border}`, color: theme.text2, borderRadius: RADIUS.control, cursor: "pointer" }}>
                <ArrowLeft style={iconSize(14, 16, 2)} />
              </button>
              <span style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>Profile</span>
            </div>
            <div style={{ ...s.scrollbar, flex: 1 }}>
              <ProfilePanel currentConvo={currentConvo} currentUser={currentUser} theme={theme} dark={dark} matchScore={matchScore} embedded />
            </div>
          </div>
        )}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────── */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          }}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            aria-label="Close"
            style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: RADIUS.control, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X style={iconSize(16, 18, 2)} />
          </button>
          <img
            src={lightboxUrl} alt="" onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: RADIUS.modal, display: "block" }}
          />
        </div>
      )}
    </div>
  );
}

/* ── Extracted sub-components ─────────────────────────────────────────── */

function MenuRow({ icon: Icon, label, onClick, danger, theme }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
        background: hover ? (danger ? "rgba(248,113,113,0.1)" : theme.surfaceBg) : "transparent",
        border: "none", padding: "7px 9px", borderRadius: 6, cursor: "pointer",
        color: danger ? theme.danger : theme.text2, fontSize: 12.5, fontFamily: "'Inter',sans-serif",
        transition: "background 0.15s ease",
      }}
    >
      <Icon style={iconSize(13, 14, 2)} />
      {label}
    </button>
  );
}

function ContextBanner({ icon: Icon, label, onCancel, theme }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", marginBottom: 8,
      background: theme.surfaceBg, border: `1px solid ${theme.border}`, borderRadius: RADIUS.control,
      fontSize: 11.5, color: theme.text2,
    }}>
      <Icon style={{ ...iconSize(13, 14, 2), color: "#a78bfa", flexShrink: 0 }} />
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      <button onClick={onCancel} style={{ background: "none", border: "none", color: theme.text3, cursor: "pointer", display: "flex", flexShrink: 0 }}>
        <X style={iconSize(12, 13, 2)} />
      </button>
    </div>
  );
}

function MicButton({ onClick, disabled }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label="Record voice message"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 42, height: 42, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        background: disabled ? "rgba(127,127,127,0.12)" : ACCENT,
        border: `1px solid ${disabled ? "transparent" : ACCENT}`,
        color: "white", borderRadius: RADIUS.control, cursor: disabled ? "not-allowed" : "pointer",
        filter: hover && !disabled ? "brightness(1.1)" : "none",
        transition: "filter 0.15s ease",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Mic style={iconSize(17, 19, 2.6)} />
    </button>
  );
}

function SendButton({ onClick, disabled, sending, editing }) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const Icon = editing ? Check : Send;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={editing ? "Save edit" : "Send message"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        width: 42, height: 42, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        background: disabled ? "rgba(127,127,127,0.12)" : ACCENT,
        border: `1px solid ${disabled ? "transparent" : ACCENT}`,
        color: "white", borderRadius: RADIUS.control, cursor: disabled ? "not-allowed" : "pointer",
        filter: disabled ? "none" : active ? "brightness(0.95)" : hover ? "brightness(1.1)" : "none",
        transition: "filter 0.15s ease",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Icon style={iconSize(16, 18, 2.4)} />
    </button>
  );
}

function ProfilePanel({ currentConvo, currentUser, theme, dark, matchScore, embedded }) {
  const wrap = embedded
    ? { padding: 16, display: "flex", flexDirection: "column", gap: 14 }
    : { width: 210, flexShrink: 0, display: "flex", flexDirection: "column", gap: 0, overflowY: "auto", background: dark ? "rgba(255,255,255,0.03)" : "#fff", border: `1px solid ${theme.border}`, borderRadius: RADIUS.card };
  const inner = embedded ? {} : { padding: 16, display: "flex", flexDirection: "column", gap: 14 };
  const avatarSize = embedded ? 68 : 54;

  const body = (
    <>
      <div style={{ textAlign: "center", paddingTop: embedded ? 8 : 0 }}>
        <div style={{ display: "inline-block", position: "relative" }}>
          <Avatar u={currentConvo.user} size={avatarSize} radius={14} dark={dark} />
          <OnlineDot online={currentConvo.user.online} dark={dark} />
        </div>
        <div style={{ fontSize: embedded ? 17 : 14, fontWeight: 700, color: theme.text, marginTop: embedded ? 12 : 10 }}>{currentConvo.user.name}</div>
        <div style={{ fontSize: embedded ? 13 : 11, color: theme.text3, marginTop: 2 }}>{currentConvo.user.role}</div>
        <div style={{ fontSize: embedded ? 18 : 16, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: hsl(currentConvo.user.hue), marginTop: 6 }}>
          {matchScore}% match
        </div>
      </div>

      <div style={{ height: 1, background: theme.border }} />

      <div>
        <Lbl T={theme}>Their Skills</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {(currentConvo.user.skillsHave || []).map((sk) => (
            <span key={sk} style={{ padding: "3px 9px", borderRadius: RADIUS.pill, fontSize: 10.5, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: theme.skillHaveBg, border: `1px solid ${theme.skillHaveBorder}`, color: theme.skillHaveText }}>{sk}</span>
          ))}
        </div>
      </div>

      <div>
        <Lbl T={theme}>They Need</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {(currentConvo.user.skillsNeed || []).map((sk) => (
            <span key={sk} style={{ padding: "3px 9px", borderRadius: RADIUS.pill, fontSize: 10.5, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: theme.skillNeedBg, border: `1px solid ${theme.skillNeedBorder}`, color: theme.skillNeedText }}>{sk}</span>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: theme.border }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "center" }}>
        {[["Projects", currentConvo.user.projects ?? 0], ["Followers", currentConvo.user.followers ?? 0]].map(([label, val]) => (
          <div key={label} style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: RADIUS.card, padding: "10px 8px" }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 18, color: theme.text }}>{val}</div>
            <div style={{ fontSize: 10, color: theme.text3 }}>{label}</div>
          </div>
        ))}
      </div>

      <button style={{
        background: "transparent", border: `1px solid ${theme.border}`, color: theme.text2, padding: "8px 10px",
        borderRadius: RADIUS.control, cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600,
        transition: "filter 0.15s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        View Full Profile
      </button>
    </>
  );

  return embedded ? <div style={wrap}>{body}</div> : <div style={wrap}><div style={inner}>{body}</div></div>;
}