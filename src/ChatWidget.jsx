import React, { useState } from "react";

export default function ChatWidget({ id, theme = {}, onSendMessage }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: "bot", text: `Hello! Session id: ${id || "N/A"}` }
  ]);
  const [input, setInput] = useState("");

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages(m => [...m, { id: Date.now(), role: "user", text }]);
    setInput("");
    if (onSendMessage) {
      Promise.resolve(onSendMessage(text, { id }))
        .then(reply => reply && setMessages(m => [...m, { id: Date.now(), role: "bot", text: reply }]));
    } else {
      setMessages(m => [...m, { id: Date.now(), role: "bot", text: "Echo: " + text }]);
    }
  }

  return (
    <>
      {open && (
        <div style={{
          position: "fixed", right: 20, bottom: 80,
          width: 360, height: 480,
          background: theme.bg || "#fff",
          border: "1px solid #ddd", borderRadius: 12,
          boxShadow: "0 12px 30px rgba(2,6,23,0.18)",
          zIndex: 2147483000,
          display: "flex", flexDirection: "column"
        }}>
          <div style={{ padding: 12, borderBottom: "1px solid #eee" }}>
            Chat
            <button onClick={() => setOpen(false)} style={{ float: "right" }}>✕</button>
          </div>
          <div style={{ flex: 1, padding: 12, overflowY: "auto" }}>
            {messages.map(m => (
              <div key={m.id} style={{ margin: "6px 0", textAlign: m.role === "user" ? "right" : "left" }}>
                <span style={{
                  display: "inline-block", padding: "8px 12px", borderRadius: 8,
                  background: m.role === "user" ? (theme.accent || "#0b84ff") : "#eee",
                  color: m.role === "user" ? "#fff" : "#000"
                }}>{m.text}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: 8, borderTop: "1px solid #eee", display: "flex" }}>
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") send(); }}
              placeholder="Type..."
              style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #ccc" }}
            />
            <button onClick={send} style={{
              marginLeft: 8, padding: "8px 12px", borderRadius: 8,
              border: "none", background: theme.accent || "#0b84ff", color: "#fff"
            }}>Send</button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", right: 20, bottom: 20,
          width: 56, height: 56, borderRadius: "50%",
          border: "none", background: theme.accent || "#0b84ff",
          color: "#fff", fontSize: 24, cursor: "pointer",
          zIndex: 2147483000, boxShadow: "0 12px 30px rgba(2,6,23,0.18)"
        }}
      >💬</button>
    </>
  );
}
