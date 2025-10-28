// Forum.jsx — place in frontend/website/pages/Forum.jsx
import React, { useEffect, useRef, useState } from "react";
import "./Forum.css";

/*
  Frontend-only forum page.
  - Mock mode stores messages in localStorage and previews attachments client-side.
  - To integrate with backend later: set USE_MOCK = false and set API_BASE.
*/

const USE_MOCK = true;               // ← set false to call real API
const API_BASE = "http://localhost:5000"; // used when USE_MOCK=false

function nowISO() { return new Date().toISOString(); }
function uid(prefix='m'){ return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; }

export default function Forum() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]); // File objects
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const listRef = useRef(null);
  const token = localStorage.getItem("token"); // if later backend uses auth

  // load messages on mount
  useEffect(() => {
    if (USE_MOCK) {
      const saved = JSON.parse(localStorage.getItem("forum_messages_v1") || "null");
      if (saved && Array.isArray(saved)) {
        setMessages(saved);
      } else {
        // seed demo messages
        const seed = [
          { _id: uid(), text: "Welcome to the forum — this is a mock demo.", user: { id: "sys", name: "System" }, createdAt: nowISO() },
          { _id: uid(), text: "You can send text, attach images, edit & delete your messages.", user: { id: "sys", name: "System" }, createdAt: nowISO() }
        ];
        setMessages(seed);
        localStorage.setItem("forum_messages_v1", JSON.stringify(seed));
      }
    } else {
      fetchMessages();
      // optional polling: setInterval(fetchMessages, 8000)
    }
    // ensure scroll
    setTimeout(scrollToBottom, 120);
  }, []);

  // helper to scroll
  function scrollToBottom(){
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }

  // fetch messages from real API
  async function fetchMessages(){
    try {
      const res = await fetch(`${API_BASE}/api/forum/messages`, {
        headers: { "Content-Type":"application/json", Authorization: token ? `Bearer ${token}` : "" }
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data);
      setTimeout(scrollToBottom, 80);
    } catch (err) {
      console.error("fetchMessages error", err);
    }
  }

  // handle file selection: store File objects, create previews
  function onFileChange(e){
    const list = Array.from(e.target.files).slice(0,4);
    setFiles(list);
  }

  // send / post message: mock or real
  async function handleSend(e){
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;

    const optimistic = {
      _id: uid("tmp"),
      text: text.trim(),
      attachments: files.map(f => ({ url: URL.createObjectURL(f), filename: f.name, mime: f.type })),
      user: { id: "me", name: "You" },
      createdAt: nowISO(),
      optimistic: true
    };

    // optimistic UI
    setMessages(prev => [...prev, optimistic]);
    setText(""); setFiles([]);
    scrollToBottom();

    if (USE_MOCK) {
      // save to localStorage
      setTimeout(() => {
        setMessages(prev => {
          const fixed = prev.map(m => (m._id === optimistic._id ? ({ ...optimistic, optimistic:false }) : m));
          localStorage.setItem("forum_messages_v1", JSON.stringify(fixed));
          return fixed;
        });
      }, 400); // tiny delay for UX
      return;
    }

    // real API path: send FormData with file(s)
    const form = new FormData();
    form.append("text", optimistic.text);
    files.forEach(f => form.append("attachments", f));

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/forum/messages`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: form
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Send failed");
      }
      const saved = await res.json();
      setMessages(prev => prev.map(m => m._id === optimistic._id ? saved : m));
      scrollToBottom();
    } catch (err) {
      console.error(err);
      // rollback optimistic
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      alert("Failed to send message (network)");
    } finally {
      setLoading(false);
    }
  }

  // Delete message (only own messages in mock)
  function handleDelete(id){
    if (!confirm("Delete this message?")) return;
    if (USE_MOCK) {
      setMessages(prev => {
        const next = prev.filter(m => m._id !== id);
        localStorage.setItem("forum_messages_v1", JSON.stringify(next));
        return next;
      });
      return;
    }
    // real backend: call DELETE
    fetch(`${API_BASE}/api/forum/messages/${id}`, { method: "DELETE", headers: { Authorization: token ? `Bearer ${token}` : "" } })
      .then(r => {
        if (!r.ok) throw new Error("delete failed");
        setMessages(prev => prev.filter(m => m._id !== id));
      }).catch(err => { console.error(err); alert("Delete failed"); });
  }

  // Edit (prompt UI for simplicity)
  async function handleEdit(id){
    const cur = messages.find(m => m._id === id);
    if (!cur) return;
    const newText = prompt("Edit message:", cur.text);
    if (newText == null) return;
    if (USE_MOCK) {
      setMessages(prev => {
        const next = prev.map(m => m._id === id ? { ...m, text: newText, edited: true } : m);
        localStorage.setItem("forum_messages_v1", JSON.stringify(next));
        return next;
      });
      return;
    }
    // real backend PUT
    try {
      const res = await fetch(`${API_BASE}/api/forum/messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type":"application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ text: newText })
      });
      if (!res.ok) throw new Error("edit failed");
      const updated = await res.json();
      setMessages(prev => prev.map(m => m._id === id ? updated : m));
    } catch (err) {
      console.error(err);
      alert("Edit failed");
    }
  }

  // view profile (mocked)
  function viewProfile(user){
    if (!user || !user.id) { alert("No profile info"); return; }
    if (USE_MOCK) {
      // show basic mock profile
      setProfile({ name: user.name || "Unknown", email: (user.id==="me"?"you@local":"user@example.com"), mobile: "N/A" });
      return;
    }
    // real backend: fetch profile endpoint
    fetch(`${API_BASE}/api/users/${user.id}`, { headers: { Authorization: token ? `Bearer ${token}` : "" } })
      .then(r => r.json())
      .then(d => setProfile(d))
      .catch(err => { console.error(err); alert("Profile fetch failed"); });
  }

  return (
    <div className="forum-page">
      <div className="forum-header">Forum</div>

      <div className="forum-content">
        <div className="forum-list-wrap">
          <div ref={listRef} className="forum-list" aria-live="polite">
            {messages.length === 0 && <div style={{textAlign:"center",opacity:0.5,marginTop:60}}>No messages yet — start chatting!</div>}
            {messages.map((m, i) => (
              <div className="message-row" key={m._id || i}>
                <div className="avatar" onClick={() => viewProfile(m.user)} title={m.user?.name || "User"}>
                  { (m.user && m.user.name) ? m.user.name.slice(0,1).toUpperCase() : "U" }
                </div>

                <div>
                  <div className="msg-meta">
                    <div style={{fontWeight:700}}>{m.user?.name || "Unknown"}</div>
                    <div>{new Date(m.createdAt).toLocaleTimeString()}</div>
                    {m.edited && <div style={{opacity:0.7}}>• edited</div>}
                  </div>

                  <div className={i % 2 === 1 ? "message-bubble short" : "message-bubble"}>
                    <div>{m.text}</div>

                    {m.attachments && m.attachments.length > 0 && (
                      <div className="attach-preview">
                        {m.attachments.map((a, idx) => (
                          a.mime && a.mime.startsWith && a.mime.startsWith("image") ? (
                            <img key={idx} src={a.url} alt={a.filename || "img"} />
                          ) : (
                            <a key={idx} href={a.url} target="_blank" rel="noreferrer" style={{ padding:8, background:"#eee", color:"#000", borderRadius:6 }}>{a.filename}</a>
                          )
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="msg-actions">
                    {/* Mock rule: allow edit/delete for messages by "me" */}
                    {m.user?.id === "me" && (
                      <>
                        <button style={{background:'transparent',border:'none',color:'#fff',cursor:'pointer'}} onClick={() => handleEdit(m._id)}>Edit</button>
                        <button style={{background:'transparent',border:'none',color:'#fff',cursor:'pointer'}} onClick={() => handleDelete(m._id)}>Delete</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form className="composer" onSubmit={handleSend}>
            <label style={{display:'inline-flex',alignItems:'center',gap:8,cursor:'pointer'}}>
              <img src="/plus.svg" alt="plus" className="plus-icon"/>
              <input type="file" accept="image/*" multiple onChange={onFileChange} style={{display:'none'}} />
            </label>

            <input className="composer-input" placeholder="Write a message..." value={text} onChange={(e)=>setText(e.target.value)} />

            <button className="icon-btn" type="submit" disabled={loading}>
              <img src="/send.svg" alt="send" className="send-icon"/>
            </button>
          </form>
        </div>
      </div>

      {profile && (
        <div className="profile-modal" role="dialog">
          <div style={{fontWeight:800, marginBottom:6}}>{profile.name}</div>
          <div style={{fontSize:13, opacity:0.8}}>{profile.email}</div>
          <div style={{fontSize:13, opacity:0.8}}>{profile.mobile}</div>
          <div style={{marginTop:8}}>
            <button onClick={()=>setProfile(null)} style={{padding:'6px 8px'}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
