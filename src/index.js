import React from "react";
import { createRoot } from "react-dom/client";
import ChatWidget from "./ChatWidget";
import widgetCssText from "./widget.css";

// Create an overlay iframe and mount the widget inside for strong isolation
function openOverlay(options = {}) {
  // Reuse if already open
  let host = document.getElementById("cw-overlay-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "cw-overlay-host";
    host.style.position = "fixed";
    host.style.inset = "0"; // full-screen overlay host
    host.style.zIndex = "2147483000";
    host.style.pointerEvents = "auto"; // allow backdrop clicks to close
    document.body.appendChild(host);
  }

  // Ensure a semitransparent backdrop exists (click to close)
  let backdrop = host.querySelector('#cw-overlay-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'cw-overlay-backdrop';
    backdrop.style.position = 'absolute';
    backdrop.style.inset = '0';
    backdrop.style.background = 'rgba(0,0,0,0.5)';
    backdrop.style.pointerEvents = 'auto';
    backdrop.style.zIndex = '0';
    host.appendChild(backdrop);
  }


  // Create a container anchored bottom-right for the iframe
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.right = "16px";
  container.style.bottom = "16px";
  container.style.width = "360px";
  container.style.height = "480px";
  container.style.pointerEvents = "auto";
  container.style.zIndex = "1";
  container.setAttribute("data-cw-container", "1");

  const iframe = document.createElement("iframe");
  iframe.title = "Chat";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.style.borderRadius = "12px";
  iframe.style.boxShadow = "0 12px 30px rgba(2,6,23,0.18)";
  iframe.referrerPolicy = "no-referrer";
  iframe.setAttribute("aria-label", "Chat widget");

  container.appendChild(iframe);
  host.appendChild(container);

  function closeOverlay() {
    try { host.removeChild(container); } catch {}
    // If no containers remain, remove the host (and its backdrop)
    const remaining = host.querySelectorAll('[data-cw-container]').length;
    if (host && remaining === 0) {
      try { host.remove(); } catch {}
    }
    document.removeEventListener("keydown", onKey);
  }

  function onKey(e) {
    if (e.key === "Escape") closeOverlay();
  }
  document.addEventListener("keydown", onKey);
  if (backdrop) {
    backdrop.onclick = (e) => { e.preventDefault(); closeOverlay(); };
  }

  // Render React into the iframe once it's ready
  const onLoad = () => {
    const doc = iframe.contentDocument;
    if (!doc) return;

    // Basic doc structure
    if (!doc.head) {
      const head = doc.createElement("head");
      doc.documentElement.insertBefore(head, doc.body || null);
    }
    if (!doc.body) {
      const body = doc.createElement("body");
      doc.documentElement.appendChild(body);
    }

    // Inject compiled CSS if present
    try {
      if (typeof widgetCssText === "string" && widgetCssText.length > 0) {
        const style = doc.createElement("style");
        style.textContent = widgetCssText;
        doc.head.appendChild(style);
      }
    } catch {}

    const mountEl = doc.createElement("div");
    doc.body.appendChild(mountEl);

    const root = createRoot(mountEl);
    root.render(<ChatWidget {...options} defaultOpen={true} inOverlay={true} onRequestClose={closeOverlay} />);

    // Return unmount function
    return () => {
      try { root.unmount(); } catch {}
      closeOverlay();
    };
  };

  if (iframe.contentDocument?.readyState === "complete") {
    onLoad();
  } else {
    iframe.addEventListener("load", onLoad, { once: true });
    // Force about:blank load to fire on some browsers
    iframe.src = "about:blank";
  }
}

// Data-attribute triggers: <a data-cw-trigger data-cw-id="..." data-cw-accent="#..." data-cw-bg="#...">
function setupDataAttributeTriggers() {
  document.addEventListener("click", (e) => {
    const el = e.target && (e.target.closest ? e.target.closest("[data-cw-trigger]") : null);
    if (!el) return;
    e.preventDefault();
    const id = el.getAttribute("data-cw-id") || undefined;
    const accent = el.getAttribute("data-cw-accent") || undefined;
    const bg = el.getAttribute("data-cw-bg") || undefined;
    openOverlay({ id, theme: { accent, bg } });
  });
}

// Custom element <chat-widget id="..." accent="#..." bg="#..." label="Chat with us">
function setupCustomElement() {
  if (customElements.get("chat-widget")) return;
  class ChatWidgetElement extends HTMLElement {
    connectedCallback() {
      const id = this.getAttribute("id") || undefined;
      const accent = this.getAttribute("accent") || undefined;
      const bg = this.getAttribute("bg") || undefined;
      const label = this.getAttribute("label") || "Chat";

      // Replace the custom element with a clickable trigger preserving position
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = label;
      a.setAttribute("data-cw-trigger", "");
      if (id) a.setAttribute("data-cw-id", id);
      if (accent) a.setAttribute("data-cw-accent", accent);
      if (bg) a.setAttribute("data-cw-bg", bg);
      this.replaceWith(a);
    }
  }
  customElements.define("chat-widget", ChatWidgetElement);
}

function autoInit() {
  setupDataAttributeTriggers();
  setupCustomElement();
}

// Public API mirrors old mount name but opens overlay
function mount(options = {}) {
  openOverlay(options);
}


autoInit();

window.ChatWidget = { mount };
