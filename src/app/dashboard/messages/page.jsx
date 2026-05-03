"use client";
import { useState, useRef, useEffect } from "react";
import { hsl, hsla, calculateMatchScore, Avatar, Lbl } from "../shared";

const EMOJI_REACTIONS = ["👍", "❤️", "🔥", "👀", "🚀"];

export default function MessagesTab({
  T, dark,
  currentUser,
  convos, setConvos,
  activeConvo, setActiveConvo,
}) {
  const [msgInput, setMsgInput]           = useState("");
  const [searchQ, setSearchQ]             = useState("");
  const [mobileConvoOpen, setMobileConvoOpen] = useState(false);
  const [typing, setTyping]               = useState(false);
  const [reactions, setReactions]         = useState({});   // { msgId: emoji }
  const [reactionPickerFor, setReactionPickerFor] = useState(null);
  const [pinned, setPinned]               = useState({});   // { convoId: msgId }
  const [msgSearch, setMsgSearch]         = useState("");
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const chatEndRef = useRef(null);

  const currentConvo = convos.find(c => c.id === activeConvo?.id) || convos[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConvo?.messages?.length]);

  // Simulate partner typing
  useEffect(() => {
    if (!msgInput) { setTyping(false); return; }
    setTyping(true);
    const id = setTimeout(() => setTyping(false), 2500);
    return () => clearTimeout(id);
  }, [msgInput]);

  const sendMsg = () => {
    if (!msgInput.trim()) return;
    const newMsg = { id: Date.now(), from: "me", text: msgInput, time: "now", read: false };
    setConvos(p => p.map(c =>
      c.id === activeConvo.id ? { ...c, messages: [...c.messages, newMsg] } : c
    ));
    setActiveConvo(p => ({ ...p, messages: [...(p.messages || []), newMsg] }));
    setMsgInput("");
  };

  const filteredConvos = convos.filter(c =>
    !searchQ || c.user.name.toLowerCase().includes(searchQ.toLowerCase())
  );

  const filteredMessages = (currentConvo?.messages || []).filter(m =>
    !msgSearch || m.text.toLowerCase().includes(msgSearch.toLowerCase())
  );

  const matchScore = currentConvo ? calculateMatchScore(currentUser, currentConvo.user) : 0;

  const toggleReaction = (msgId, emoji) => {
    setReactions(p => {
      const existing = p[msgId];
      if (existing === emoji) {
        const next = { ...p }; delete next[msgId]; return next;
      }
      return { ...p, [msgId]: emoji };
    });
    setReactionPickerFor(null);
  };

  const pinnedMsgId = pinned[currentConvo?.id];
  const pinnedMsg = pinnedMsgId ? currentConvo?.messages?.find(m => m.id === pinnedMsgId) : null;

  return (
    <div className="fade-up" style={{ display: "flex", gap: 16, height: "calc(100vh - 130px)" }}>

      {/* ── Sidebar ── */}
      <div className={`card-flat ${mobileConvoOpen ? "" : "open"}`} style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: T.text, marginBottom: 10 }}>Messages</div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.text3, fontSize: 13, pointerEvents: "none" }}>🔍</span>
            <input
              placeholder="Search conversations…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={{ paddingLeft: 30, background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text, borderRadius: 10, fontSize: 12, outline: "none", padding: "8px 10px 8px 30px", width: "100%", fontFamily: "inherit" }}
            />
          </div>
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "6px" }}>
          {filteredConvos.length === 0
            ? <div style={{ textAlign: "center", padding: "30px 16px", color: T.text3, fontSize: 12 }}>No conversations found</div>
            : filteredConvos.map(c => {
              const lastMsg = c.messages[c.messages.length - 1];
              const isActive = activeConvo?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => { setActiveConvo(c); setMobileConvoOpen(true); }}
                  style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", borderRadius: 13, cursor: "pointer", transition: "all 0.2s", border: `1px solid ${isActive ? T.border : "transparent"}`, background: isActive ? dark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.07)" : "transparent", marginBottom: 2 }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <Avatar u={c.user} size={38} radius={10} T={T} dark={dark} />
                    <div style={{ position: "absolute", bottom: -1, right: -1, width: 7, height: 7, borderRadius: "50%", background: c.user.online ? "#22c55e" : "#555", border: `2px solid ${dark ? "#060608" : "#f5f5f9"}` }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.user.name.split(" ")[0]}</span>
                      <span style={{ fontSize: 10, color: T.text3 }}>{lastMsg?.time}</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {lastMsg?.from === "me" ? "You: " : ""}{lastMsg?.text}
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>

      {/* ── Chat pane ── */}
      <div className="card-flat" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Chat header */}
        <div style={{ padding: "13px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button onClick={() => setMobileConvoOpen(false)} style={{ display: "none", padding: "6px 10px", background: "transparent", border: `1px solid ${T.border}`, color: T.text2, borderRadius: 9, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>←</button>
          {currentConvo && <>
            <div style={{ position: "relative" }}>
              <Avatar u={currentConvo.user} size={38} radius={10} T={T} dark={dark} />
              <div style={{ position: "absolute", bottom: -1, right: -1, width: 7, height: 7, borderRadius: "50%", background: currentConvo.user.online ? "#22c55e" : "#555", border: `2px solid ${dark ? "#060608" : "#f5f5f9"}` }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: T.text }}>{currentConvo.user.name}</div>
              <div style={{ fontSize: 11, color: currentConvo.user.online ? "#22c55e" : T.text3 }}>
                {typing ? <span style={{ fontStyle: "italic" }}>typing…</span> : currentConvo.user.online ? "● Online" : "● Away"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              {/* Match badge */}
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: hsla(currentConvo.user.hue, 70, 60, dark ? 0.12 : 0.08), border: `1px solid ${hsla(currentConvo.user.hue, 70, 60, 0.25)}`, color: hsl(currentConvo.user.hue) }}>
                {matchScore}% match
              </span>
              {/* Message search toggle */}
              <button onClick={() => setShowMsgSearch(p => !p)} title="Search messages" style={{ padding: "6px 9px", background: showMsgSearch ? dark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.09)" : "transparent", border: `1px solid ${showMsgSearch ? "rgba(124,58,237,0.35)" : T.border}`, color: showMsgSearch ? "#a78bfa" : T.text3, borderRadius: 9, cursor: "pointer", fontSize: 13 }}>🔍</button>
            </div>
          </>}
        </div>

        {/* Message search bar */}
        {showMsgSearch && (
          <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.border}`, background: dark ? "rgba(124,58,237,0.04)" : "rgba(124,58,237,0.03)" }}>
            <input
              placeholder="Search in conversation…"
              value={msgSearch}
              onChange={e => setMsgSearch(e.target.value)}
              autoFocus
              style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text, borderRadius: 9, fontSize: 12, outline: "none", padding: "7px 12px", width: "100%", fontFamily: "inherit" }}
            />
          </div>
        )}

        {/* Match context bar */}
        {currentConvo && (
          <div style={{ padding: "8px 18px", borderBottom: `1px solid ${T.border}`, background: dark ? "rgba(124,58,237,0.03)" : "rgba(124,58,237,0.02)", display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12 }}>✦</span>
            <span style={{ fontSize: 11, color: dark ? "#8070aa" : "#6b5b9e", flex: 1 }}>
              Matched on&nbsp;
              <strong style={{ color: "#a78bfa" }}>{currentUser.skillsHave[0]}</strong>
              &nbsp;↔&nbsp;
              <strong style={{ color: "#a78bfa" }}>{currentConvo.user.skillsHave[0]}</strong>
            </span>
          </div>
        )}

        {/* Pinned message */}
        {pinnedMsg && (
          <div style={{ padding: "8px 18px", background: dark ? "rgba(245,158,11,0.07)" : "rgba(245,158,11,0.06)", borderBottom: `1px solid rgba(245,158,11,0.2)`, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12 }}>📌</span>
            <span style={{ fontSize: 11, color: dark ? "#fbbf24" : "#92400e", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pinnedMsg.text}</span>
            <button onClick={() => setPinned(p => { const n = { ...p }; delete n[currentConvo.id]; return n; })} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer", fontSize: 12 }}>✕</button>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px", display: "flex", flexDirection: "column", gap: 10 }}
          onClick={() => setReactionPickerFor(null)}>
          {filteredMessages.map((m, i) => (
            <div key={m.id} className="fade-up" style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start", animationDelay: `${i * 0.03}s`, position: "relative" }}>
              <div style={{ position: "relative", maxWidth: "75%" }}>
                {/* Reaction picker trigger */}
                <div
                  onMouseEnter={() => {}}
                  style={{ position: "relative" }}
                >
                  <div
                    style={{ padding: "10px 14px", borderRadius: 15, fontSize: 13, lineHeight: 1.5, background: m.from === "me" ? T.msgMe : T.msgThem, color: m.from === "me" ? "white" : T.text, borderBottomRightRadius: m.from === "me" ? 4 : 15, borderBottomLeftRadius: m.from === "them" ? 4 : 15, border: m.from === "them" ? `1px solid ${T.border}` : "none", cursor: "default" }}
                    onDoubleClick={() => setReactionPickerFor(reactionPickerFor === m.id ? null : m.id)}
                  >
                    {msgSearch && m.text.toLowerCase().includes(msgSearch.toLowerCase())
                      ? <span dangerouslySetInnerHTML={{ __html: m.text.replace(new RegExp(`(${msgSearch})`, "gi"), "<mark style='background:rgba(245,158,11,0.4);border-radius:3px;padding:0 2px'>$1</mark>") }} />
                      : m.text
                    }
                    <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4, textAlign: m.from === "me" ? "right" : "left", display: "flex", gap: 5, justifyContent: m.from === "me" ? "flex-end" : "flex-start", alignItems: "center" }}>
                      {m.time}
                      {m.from === "me" && <span style={{ fontSize: 10 }}>{m.read ? "✓✓" : "✓"}</span>}
                    </div>
                  </div>

                  {/* Reaction */}
                  {reactions[m.id] && (
                    <div style={{ position: "absolute", bottom: -10, right: m.from === "me" ? 0 : "auto", left: m.from === "them" ? 0 : "auto", background: dark ? "#1a1a2e" : "#fff", border: `1px solid ${T.border}`, borderRadius: 99, padding: "2px 7px", fontSize: 12, cursor: "pointer", boxShadow: T.shadow }} onClick={() => toggleReaction(m.id, reactions[m.id])}>
                      {reactions[m.id]}
                    </div>
                  )}

                  {/* Emoji picker */}
                  {reactionPickerFor === m.id && (
                    <div onClick={e => e.stopPropagation()} style={{ position: "absolute", bottom: "100%", marginBottom: 6, [m.from === "me" ? "right" : "left"]: 0, background: dark ? "#1a1a2e" : "#fff", border: `1px solid ${T.border}`, borderRadius: 12, padding: "6px 8px", display: "flex", gap: 4, zIndex: 50, boxShadow: T.shadow }}>
                      {EMOJI_REACTIONS.map(e => (
                        <button key={e} onClick={() => toggleReaction(m.id, e)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, borderRadius: 8, padding: "4px", transition: "transform 0.1s" }}>
                          {e}
                        </button>
                      ))}
                      <button onClick={() => setPinned(p => ({ ...p, [currentConvo.id]: m.id }))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, borderRadius: 8, padding: "4px 6px", color: T.text3 }} title="Pin message">📌</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "10px 14px", borderRadius: 15, borderBottomLeftRadius: 4, background: T.msgThem, border: `1px solid ${T.border}`, display: "flex", gap: 4, alignItems: "center" }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: T.text3, animation: `pulse 1.2s ${d}s ease-in-out infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "11px 14px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, flexShrink: 0, alignItems: "flex-end" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <textarea
              placeholder={currentConvo ? `Message ${currentConvo.user.name.split(" ")[0]}…` : "Select a conversation"}
              value={msgInput}
              onChange={e => setMsgInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
              rows={1}
              style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text, borderRadius: 11, fontSize: 13, outline: "none", padding: "10px 14px", width: "100%", fontFamily: "inherit", resize: "none", minHeight: 42 }}
            />
          </div>
          <button onClick={sendMsg} disabled={!msgInput.trim()} style={{ padding: "10px 16px", background: msgInput.trim() ? "linear-gradient(135deg,#7c3aed,#a855f7)" : dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: "none", color: msgInput.trim() ? "white" : T.text3, borderRadius: 11, cursor: msgInput.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", fontSize: 16, fontWeight: 700, flexShrink: 0, transition: "all 0.2s", boxShadow: msgInput.trim() ? "0 4px 14px rgba(124,58,237,0.25)" : "none" }}>↑</button>
        </div>
      </div>

      {/* ── Right mini-profile ── */}
      {currentConvo && (
        <div className="card-flat" style={{ width: 210, flexShrink: 0, padding: 16, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
          <div style={{ textAlign: "center" }}>
            <Avatar u={currentConvo.user} size={52} radius={14} T={T} dark={dark} />
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginTop: 10 }}>{currentConvo.user.name}</div>
            <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{currentConvo.user.role}</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Instrument Serif',serif", color: hsl(currentConvo.user.hue), marginTop: 6 }}>{matchScore}% match</div>
          </div>
          <div style={{ height: 1, background: T.border }} />
          <div>
            <Lbl T={T}>Their Skills</Lbl>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {currentConvo.user.skillsHave.map(s => <span key={s} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillHaveBg, border: `1px solid ${T.skillHaveBorder}`, color: T.skillHaveText }}>{s}</span>)}
            </div>
          </div>
          <div>
            <Lbl T={T}>They Need</Lbl>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {currentConvo.user.skillsNeed.map(s => <span key={s} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: T.skillNeedBg, border: `1px solid ${T.skillNeedBorder}`, color: T.skillNeedText }}>{s}</span>)}
            </div>
          </div>
          <div style={{ height: 1, background: T.border }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "center" }}>
            <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 10, padding: "10px 8px" }}>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: T.text }}>{currentConvo.user.projects}</div>
              <div style={{ fontSize: 10, color: T.text3 }}>Projects</div>
            </div>
            <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 10, padding: "10px 8px" }}>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: T.text }}>{currentConvo.user.followers}</div>
              <div style={{ fontSize: 10, color: T.text3 }}>Followers</div>
            </div>
          </div>
          <button onClick={() => setActiveConvo(currentConvo)} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.text2, padding: "8px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>
            View Full Profile →
          </button>
        </div>
      )}
    </div>
  );
}