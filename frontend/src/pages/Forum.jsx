import React, { useEffect, useRef, useState, useCallback } from "react";
import "./Forum.css";

const USE_MOCK = true;
const API_BASE = "http://localhost:5000";

const uid = (prefix = "m") => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
const nowISO = () => new Date().toISOString();
const timeHHMM = (iso = null) => {
  const d = iso ? new Date(iso) : new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default function Forum() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]); // { url, filename, mime, file? }
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const mediaChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const listRef = useRef(null);
  const textareaRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // load mock messages
    if (USE_MOCK) {
      const saved = JSON.parse(localStorage.getItem("forum_messages_v3") || "null");
      if (saved && Array.isArray(saved)) setMessages(saved);
      else {
        const seed = [
          { _id: uid(), text: "Welcome — forum ready.", user: { id: "sys", name: "System" }, createdAt: nowISO() },
        ];
        setMessages(seed);
        localStorage.setItem("forum_messages_v3", JSON.stringify(seed));
      }
    } else {
      // fetchMessages(); // add real fetch when needed
    }

    return () => {
      // cleanup object URLs from attachments
      attachments.forEach(a => a.url && a.url.startsWith("blob:") && URL.revokeObjectURL(a.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // autosize textarea
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const newH = Math.min(ta.scrollHeight, 220);
    ta.style.height = `${newH}px`;
  }, [text]);

  useEffect(() => {
    // scroll to bottom when messages change
    const el = listRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [messages]);

  // persist mock
  const persistMock = useCallback((next) => {
    localStorage.setItem("forum_messages_v3", JSON.stringify(next));
  }, []);

  // file picker change
  const onFileChange = useCallback((e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    const prepared = files.map(f => ({ file: f, url: URL.createObjectURL(f), filename: f.name, mime: f.type || 'application/octet-stream' }));
    // revoke previous blob urls
    attachments.forEach(a => a.url && a.url.startsWith("blob:") && URL.revokeObjectURL(a.url));
    setAttachments(prepared);
    // reset input value so same file can be chosen again
    e.target.value = "";
  }, [attachments]);

  // start recording audio
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Recording not supported in this browser");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (ev) => { if (ev.data && ev.data.size) mediaChunksRef.current.push(ev.data); };
      mr.onstop = () => {
        const blob = new Blob(mediaChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const att = { file: blob, url, filename: `recording-${Date.now()}.webm`, mime: blob.type };
        setAttachments(prev => {
          // revoke previous if blob
          prev.forEach(a => a.url && a.url.startsWith("blob:") && URL.revokeObjectURL(a.url));
          return [att, ...prev];
        });
        // stop tracks on stream
        stream.getTracks().forEach(t => t.stop());
        setRecording(false);
      };
      mr.start();
      setRecording(true);
    } catch (err) {
      console.error("Record failed", err);
      alert("Could not start recording — check microphone permissions.");
    }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
    } catch (e) {
      console.warn("stopRecording error", e);
      setRecording(false);
    }
  };

  // send (mock or real)
  const handleSend = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!text.trim() && attachments.length === 0) return;

    const optimistic = {
      _id: uid("tmp"),
      text: text.trim() || null,
      attachments: attachments.map(a => ({ url: a.url, filename: a.filename, mime: a.mime })),
      user: { id: "me", name: "You" },
      createdAt: nowISO(),
      optimistic: true
    };

    setMessages(prev => {
      const next = [...prev, optimistic];
      if (USE_MOCK) persistMock(next);
      return next;
    });

    // clear composer but keep blob urls until server ack (we keep them for downloads)
    setText("");
    setAttachments([]);

    if (USE_MOCK) {
      // in mock mode: mark optimistic as saved (no auto-reply)
      setTimeout(() => {
        setMessages(prev => {
          const updated = prev.map(m => m._id === optimistic._id ? { ...optimistic, optimistic: false } : m);
          persistMock(updated);
          return updated;
        });
      }, 600);
      return;
    }

    // real API: send formdata
    try {
      setLoading(true);
      const form = new FormData();
      if (optimistic.text) form.append("text", optimistic.text);
      attachments.forEach(a => {
        // if File or Blob exist, append; otherwise skip
        if (a.file) form.append("attachments", a.file, a.filename);
      });

      const res = await fetch(`${API_BASE}/api/forum/messages`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: form
      });
      if (!res.ok) throw new Error("send failed");
      const saved = await res.json();
      setMessages(prev => prev.map(m => m._id === optimistic._id ? saved : m));
    } catch (err) {
      console.error(err);
      // rollback optimistic
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  // edit/delete (mock)
  const handleEdit = (id) => {
    const cur = messages.find(m => m._id === id);
    if (!cur) return;
    const newText = prompt("Edit message", cur.text || "");
    if (newText == null) return;
    if (USE_MOCK) {
      const updated = messages.map(m => m._id === id ? { ...m, text: newText, edited: true } : m);
      setMessages(updated);
      persistMock(updated);
    }
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this message?")) return;
    if (USE_MOCK) {
      const next = messages.filter(m => m._id !== id);
      setMessages(next);
      persistMock(next);
    }
  };

  // view profile
  const viewProfile = (user) => {
    if (!user || !user.id) { alert("No profile"); return; }
    if (USE_MOCK) setProfile({ name: user.name || "Unknown", email: user.id === "me" ? "you@local" : "user@example.com", mobile: "N/A" });
  };

  // keyboard enter send
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // render attachment preview inside message
  const renderAttachment = (a, idx) => {
    if (!a.mime) return <a key={idx} className="attach-file" href={a.url} target="_blank" rel="noreferrer">{a.filename}</a>;
    if (a.mime.startsWith("image")) {
      return <img key={idx} src={a.url} alt={a.filename} className="attach-img" />;
    }
    if (a.mime.startsWith("audio")) {
      return <audio key={idx} controls src={a.url} className="attach-audio" />;
    }
    return <a key={idx} className="attach-file" href={a.url} target="_blank" rel="noreferrer">{a.filename}</a>;
  };

  return (
    <div className="forum-page">
      <div className="forum-header">Forum</div>

      <div className="forum-content">
        <div className="forum-list-wrap" role="application" aria-label="Forum messages">
          <div ref={listRef} className="forum-list" aria-live="polite">
            {messages.length === 0 && <div style={{ textAlign: "center", opacity: 0.6, marginTop: 40 }}>No messages yet — start chatting</div>}
            {messages.map((m, i) => {
              const isSystem = m.user?.id === "sys";
              return (
                <div key={m._id || i} className={`message-row ${m.user?.id === "me" ? "me" : ""} ${isSystem ? "system-row" : ""}`}>
                  {!isSystem && (
                    <div className="avatar" role="button" tabIndex={0} onClick={() => viewProfile(m.user)} onKeyDown={(e)=>{ if(e.key==="Enter") viewProfile(m.user); }}>
                      {m.user?.name ? m.user.name.slice(0,1).toUpperCase() : "U"}
                    </div>
                  )}

                  <div style={{ maxWidth: isSystem ? "100%" : "86%" }}>
                    {!isSystem ? (
                      <>
                        <div className="msg-meta">
                          <div style={{fontWeight:700}}>{m.user?.name || "Unknown"}</div>
                          <div>{timeHHMM(m.createdAt)}</div>
                          {m.edited && <div style={{opacity:0.7}}>• edited</div>}
                        </div>

                        <div className={`message-bubble ${m.optimistic ? "optimistic" : ""}`}>
                          {m.text && <div style={{ whiteSpace: "pre-wrap", wordBreak: "normal" }}>{m.text}</div>}
                          {m.attachments && m.attachments.length > 0 && (
                            <div className="attach-preview">
                              {m.attachments.map(renderAttachment)}
                            </div>
                          )}
                        </div>

                        <div className="msg-actions">
                          {m.user?.id === "me" && (
                            <>
                              <button className="action-btn" onClick={() => handleEdit(m._id)}>Edit</button>
                              <button className="action-btn" onClick={() => handleDelete(m._id)}>Delete</button>
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      // system message visual
                      <div className="system-message">{m.text}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* composer */}
          <form className="composer" onSubmit={(e)=>{ e.preventDefault(); handleSend(); }} aria-label="Message composer">
            <div style={{display:"flex", alignItems:"center", gap:8}}>
              <button type="button" className="icon-btn" onClick={() => fileInputRef.current?.click()} aria-label="Attach files">
                📎
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,audio/*" multiple style={{display:"none"}} onChange={onFileChange} />
              <button type="button" className={`icon-btn ${recording ? "recording" : ""}`} onClick={() => recording ? stopRecording() : startRecording()} aria-pressed={recording} aria-label="Record audio">
                {recording ? "⏹" : "🎤"}
              </button>
            </div>

            <textarea
              ref={textareaRef}
              className="composer-input"
              placeholder="Write a message..."
              value={text}
              onChange={(e)=>setText(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
            />

            <button className="icon-btn" type="submit" disabled={loading || (!text.trim() && attachments.length === 0)} aria-label="Send">
              ➤
            </button>
          </form>

        </div>
      </div>

      {attachments.length > 0 && (
        <div className="attachments-bar">
          {attachments.map((a, idx) => (
            <div key={idx} className="att-preview">
              {a.mime && a.mime.startsWith("image") ? (
                <img src={a.url} alt={a.filename} />
              ) : a.mime && a.mime.startsWith("audio") ? (
                <audio controls src={a.url} />
              ) : (
                <a href={a.url} target="_blank" rel="noreferrer">{a.filename}</a>
              )}
              <button className="remove-att" onClick={() => {
                // revoke and remove
                try{ if (a.url && a.url.startsWith("blob:")) URL.revokeObjectURL(a.url); } catch(e){}
                setAttachments(prev => prev.filter((_, i)=>i!==idx));
              }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {profile && (
        <div className="profile-modal" role="dialog" aria-modal="true">
          <div className="profile-card">
            <div style={{ fontWeight: 800 }}>{profile.name}</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{profile.email}</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{profile.mobile}</div>
            <div style={{ marginTop: 8 }}>
              <button className="btn-primary" onClick={()=>setProfile(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
