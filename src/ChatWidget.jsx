import React, { useState } from "react";

export default function ChatWidget({ id, theme = {}, onSendMessage, defaultOpen = false, inOverlay = false, onRequestClose }) {
  const [open, setOpen] = useState(defaultOpen);
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
        <div
          className="cw-root"
          style={{ backgroundColor: theme.bg || undefined }}
        >
          <div className="cw-header">
            <span className="cw-title">Chat</span>
            <button
              onClick={() => (onRequestClose ? onRequestClose() : setOpen(false))}
              className="cw-close"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="cw-messages">
            {messages.map(m => (
              <div key={m.id} className={`cw-row ${m.role === "user" ? "right" : "left"}`}>
                <span
                  className={`cw-bubble ${m.role === "user" ? "user" : "bot"}`}
                  style={m.role === "user" && theme.accent ? { backgroundColor: theme.accent, color: "#fff" } : undefined}
                >
                  {m.text}
                </span>
              </div>
            ))}
          </div>
          <div className="cw-inputbar">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") send(); }}
              placeholder="Type..."
              className="cw-input"
            />
            <button
              onClick={send}
              className="cw-send"
              style={theme.accent ? { backgroundColor: theme.accent } : undefined}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* FAB (hidden inside overlay mode) */}
      {!inOverlay && (
        <button
          onClick={() => setOpen(o => !o)}
          className="cw-fab"
          style={theme.accent ? { backgroundColor: theme.accent } : undefined}
          aria-label="Open chat"
        >
          💬
        </button>
      )}
    </>
  );
}
