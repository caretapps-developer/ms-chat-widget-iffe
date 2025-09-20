import React from "react";
import { createRoot } from "react-dom/client";
import ChatWidget from "./ChatWidget";

function mountChatWidget(options = {}) {
  let rootEl = document.getElementById("chat-widget-root");
  if (!rootEl) {
    rootEl = document.createElement("div");
    rootEl.id = "chat-widget-root";
    document.body.appendChild(rootEl);
  }
  const root = createRoot(rootEl);
  root.render(<ChatWidget {...options} />);
  return () => root.unmount();
}

window.ChatWidget = { mount: mountChatWidget };
