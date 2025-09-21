import React, { useState } from "react";

// Minimal starter widget: title, description, single input and a button
export default function ChatWidget({ id, theme = {}, onSendMessage, defaultOpen = false, inOverlay = false, onRequestClose }) {
  const [open, setOpen] = useState(defaultOpen);
  const [input, setInput] = useState("");

  async function submit() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    // Back-compat: if a callback was provided, call it
    if (onSendMessage) {
      try { await onSendMessage(text, { id }); } catch {}
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
            <span className="cw-title">Inline Chat Widget</span>
            {onRequestClose && (
              <button
                onClick={onRequestClose}
                className="cw-close"
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ padding: 16 }}>
            <p style={{ margin: "8px 0 16px", color: "#4b5563" }}>
              This widget is embedded inline in the page. Perfect for embedding in specific sections!
            </p>
            <div className="cw-inputbar" style={{ borderTop: "none", padding: 0 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") submit(); }}
                placeholder="Type something"
                className="cw-input"
              />
              <button
                onClick={submit}
                className="cw-send"
                style={theme.accent ? { backgroundColor: theme.accent } : undefined}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button for inline mode when not always open */}
      {!inOverlay && !defaultOpen && (
        <button
          onClick={() => setOpen(o => !o)}
          className="cw-fab"
          style={theme.accent ? { backgroundColor: theme.accent } : undefined}
          aria-label={open ? "Close widget" : "Open widget"}
        >
          {open ? "✕" : "💬"}
        </button>
      )}
    </>
  );
}
