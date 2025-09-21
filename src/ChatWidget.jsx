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
          className="flex h-full w-full flex-col rounded-lg border bg-card text-card-foreground shadow-xl"
          style={{ backgroundColor: theme.bg || undefined }}
        >
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <span className="font-medium text-gray-900">Chat</span>
            <button
              onClick={() => (onRequestClose ? onRequestClose() : setOpen(false))}
              className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <span
                  className={`inline-block rounded-lg px-3 py-2 text-sm ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                  style={m.role === "user"
                    ? { backgroundColor: theme.accent || "#0b84ff" }
                    : undefined}
                >
                  {m.text}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t p-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") send(); }}
              placeholder="Type..."
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              onClick={send}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
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
          className="fixed bottom-5 right-5 z-[2147483000] inline-flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white shadow-xl"
          style={theme.accent ? { backgroundColor: theme.accent } : undefined}
          aria-label="Open chat"
        >
          💬
        </button>
      )}
    </>
  );
}
