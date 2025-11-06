// Forum.jsx (full-page, professional, avatar alignment fixed)
import React, { useEffect, useRef, useState } from "react";
import "./Forum.css";

const USE_MOCK = true;
const API_BASE = "http://localhost:5000";
function nowISO() { return new Date().toISOString(); }
function uid(prefix='m'){ return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; }

export default function Forum() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [profile, setProfile] = useState(null);
  const listRef = useRef(null);
  const fileRef = useRef(null);
  const composerRef = useRef(null);
  const wrapRef = useRef(null);

  // Load seed messages
  useEffect(() => {
    if (USE_MOCK) {
      const saved = JSON.parse(localStorage.getItem("forum_messages_v1") || "null");
      if (saved && Array.isArray(saved)) setMessages(saved);
      else {
        const seed = [
          { _id: uid(), text: "Welcome to the full-page forum demo.", user: { id: "sys", name: "System" }, createdAt: nowISO() },
          { _id: uid(), text: "Your messages appear on the right. Others are on the left.", user: { id: "sys2", name: "Moderator" }, createdAt: nowISO() }
        ];
        setMessages(seed);
        localStorage.setItem("forum_messages_v1", JSON.stringify(seed));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // scroll when messages change
  useEffect(() => { scrollToBottom(); }, [messages]);

  // measure composer height with ResizeObserver and expose as CSS var on wrapRef
  useEffect(() => {
    if (!composerRef.current || !wrapRef.current) return;
    const el = composerRef.current;
    const wrap = wrapRef.current;
    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight || 72;
      wrap.style.setProperty("--composer-height", `${h}px`);
    });
    ro.observe(el);
    // initial set
    wrap.style.setProperty("--composer-height", `${el.offsetHeight || 72}px`);
    return () => ro.disconnect();
  }, []);

  function scrollToBottom(){
    const el = listRef.current;
    if (el) setTimeout(() => el.scrollTop = el.scrollHeight, 50);
  }

  function onFileChange(e){
    const list = Array.from(e.target.files).slice(0,4).map(f => Object.assign(f, { preview: URL.createObjectURL(f) }));
    // cleanup previous previews
    files.forEach(f => f && f.preview && URL.revokeObjectURL(f.preview));
    setFiles(list);
  }

  function handleSend(e){
    if (e) e.preventDefault();
    if (!text.trim() && files.length === 0) return;
    const optimistic = {
      _id: uid("tmp"),
      text: text.trim(),
      attachments: files.map(f => ({ url: f.preview || URL.createObjectURL(f), filename: f.name, mime: f.type })),
      user: { id: "me", name: "You" },
      createdAt: nowISO(),
      optimistic: true
    };
    setMessages(prev => [...prev, optimistic]);
    setText("");
    if (fileRef.current) fileRef.current.value = "";
    setFiles([]);
    scrollToBottom();
    if (USE_MOCK) {
      setTimeout(() => {
        setMessages(prev => {
          const fixed = prev.map(m => (m._id === optimistic._id ? ({ ...optimistic, optimistic:false }) : m));
          localStorage.setItem("forum_messages_v1", JSON.stringify(fixed));
          return fixed;
        });
      }, 300);
      return;
    }
    // Real API path omitted (same as previous)
  }

  function handleDelete(id){
    if (!window.confirm("Delete this message?")) return;
    setMessages(prev => {
      const next = prev.filter(m => m._id !== id);
      localStorage.setItem("forum_messages_v1", JSON.stringify(next));
      return next;
    });
  }

  function handleEdit(id){
    const cur = messages.find(m => m._id === id);
    if (!cur) return;
    const newText = window.prompt("Edit message:", cur.text);
    if (newText == null) return;
    setMessages(prev => {
      const next = prev.map(m => m._id === id ? { ...m, text: newText, edited: true } : m);
      localStorage.setItem("forum_messages_v1", JSON.stringify(next));
      return next;
    });
  }

  function viewProfile(user){
    if (!user || !user.id) { window.alert("No profile"); return; }
    setProfile({ name: user.name || "Unknown", email: user.id === "me" ? "you@local" : `${user.name?.toLowerCase()||'user'}@example.com`, mobile: "N/A" });
  }

  return (
    <div className="forum-page fullpage">
      <div className="forum-header" role="banner">Forum</div>

      <div className="forum-content">
        <div className="forum-list-wrap" ref={wrapRef} role="region" aria-label="Forum messages">
          <div ref={listRef} className="forum-list" aria-live="polite">
            {messages.length === 0 && <div className="empty-msg">No messages yet — start chatting!</div>}
            {messages.map((m, i) => {
              const isMe = m.user?.id === 'me';
              return (
                <div className={`message-row ${isMe ? 'me' : ''}`} key={m._id || i}>
                  {/* avatar left for others, right for me — CSS ordering handles placement */}
                  <div className="avatar" onClick={() => viewProfile(m.user)} title={m.user?.name || "User"} role="button" tabIndex={0}>
                    { (m.user && m.user.name) ? m.user.name.slice(0,1).toUpperCase() : "U" }
                  </div>

                  <div className="message-col">
                    <div className="msg-meta">
                      <div className="meta-name" style={{color: isMe ? '#fff' : undefined}}>{m.user?.name || "Unknown"}</div>
                      <div className="meta-time">{new Date(m.createdAt).toLocaleTimeString()}</div>
                      {m.edited && <div className="meta-edited">• edited</div>}
                    </div>

                    <div className={i % 2 === 1 ? "message-bubble short" : "message-bubble"}>
                      <div style={{whiteSpace:"pre-wrap"}}>{m.text}</div>

                      {m.attachments && m.attachments.length > 0 && (
                        <div className="attach-preview">
                          {m.attachments.map((a, idx) => (
                            a.mime && a.mime.startsWith && a.mime.startsWith("image") ? (
                              <img key={idx} src={a.url} alt={a.filename || "img"} />
                            ) : (
                              <a key={idx} href={a.url} target="_blank" rel="noreferrer" className="attach-link">{a.filename}</a>
                            )
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="msg-actions">
                      {m.user?.id === "me" && (
                        <>
                          <button className="text-btn" onClick={() => handleEdit(m._id)}>Edit</button>
                          <button className="text-btn" onClick={() => handleDelete(m._id)}>Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* composer pinned but wrap provides padding so it won't cover list */}
          <form ref={composerRef} className="composer" onSubmit={handleSend}>
            <label className="attach-label" title="Attach images">
              <img src="/plus.svg" alt="plus" className="plus-icon" />
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFileChange} style={{display:'none'}} />
            </label>

            <input
              className="composer-input"
              placeholder="Write a message..."
              value={text}
              onChange={(e)=>setText(e.target.value)}
              aria-label="Message text"
            />

            <button className="icon-btn" type="submit" aria-label="Send">
              <img src="/send.svg" alt="send" className="send-icon"/>
            </button>
          </form>
        </div>
      </div>

      {profile && (
        <div className="profile-modal" role="dialog" aria-modal="true" aria-label="Profile">
          <div style={{fontWeight:800, marginBottom:6}}>{profile.name}</div>
          <div style={{fontSize:13, opacity:0.9}}>{profile.email}</div>
          <div style={{fontSize:13, opacity:0.9}}>{profile.mobile}</div>
          <div style={{marginTop:8}}><button onClick={()=>setProfile(null)} style={{padding:'6px 8px'}}>Close</button></div>
        </div>
      )}
    </div>
  );
}
