import React from "react";
import { createRoot } from "react-dom/client";
import ChatWidget from "./ChatWidget";
import widgetCssText from "./widget.css";

// Global widget registry to track all mounted widgets
const widgetRegistry = new Map();
let widgetCounter = 0;

// Create an iframe-based widget (like Givebutter)
function mountInline(options = {}) {
  const { target, align = 'left', account, ...widgetOptions } = options;

  // Find target element - can be selector string or DOM element
  let targetEl;
  if (typeof target === 'string') {
    targetEl = document.querySelector(target);
  } else if (target instanceof Element) {
    targetEl = target;
  } else {
    // Default: create a new div and append to body
    targetEl = document.createElement('div');
    targetEl.id = `cw-inline-widget-${++widgetCounter}`;
    document.body.appendChild(targetEl);
  }

  if (!targetEl) {
    console.warn('ChatWidget: Target element not found');
    return null;
  }

  // Check if widget is already mounted in this target
  if (targetEl.hasAttribute('data-cw-mounted')) {
    console.warn('ChatWidget: Widget already mounted in this element');
    return null;
  }

  // Create container for the iframe (Givebutter-style)
  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.maxWidth = "420px"; // Givebutter's max width
  container.style.minHeight = "200px";
  container.style.border = "1px solid #e5e7eb";
  container.style.borderRadius = "12px";
  container.style.boxShadow = "0 4px 12px rgba(2,6,23,0.08)";
  container.style.backgroundColor = "#ffffff";
  container.style.overflow = "hidden";
  container.style.margin = "0";
  container.setAttribute("data-cw-container", "1");

  // Apply alignment (Givebutter feature)
  if (align === 'center') {
    container.style.margin = "0 auto";
  } else if (align === 'right') {
    container.style.marginLeft = "auto";
  }

  // Create iframe for isolation (like Givebutter)
  const iframe = document.createElement("iframe");
  iframe.style.width = "100%";
  iframe.style.height = "400px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "12px";
  iframe.style.backgroundColor = "#ffffff";
  iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms");
  iframe.setAttribute("data-cw-iframe", "1");

  container.appendChild(iframe);
  targetEl.appendChild(container);
  targetEl.setAttribute('data-cw-mounted', 'true');

  // Generate unique widget ID
  const widgetId = `widget-${++widgetCounter}`;

  function closeWidget() {
    try {
      targetEl.removeChild(container);
      targetEl.removeAttribute('data-cw-mounted');
      widgetRegistry.delete(widgetId);
    } catch {}
  }

  // Create iframe content with React widget
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

  // Write HTML structure to iframe
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #ffffff;
        }
        ${widgetCssText || ''}
      </style>
    </head>
    <body>
      <div id="widget-root"></div>
      <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    </body>
    </html>
  `);
  iframeDoc.close();

  // Wait for iframe to load, then render React component
  iframe.onload = () => {
    try {
      const iframeWindow = iframe.contentWindow;
      const iframeDocument = iframe.contentDocument;
      const mountPoint = iframeDocument.getElementById('widget-root');

      if (iframeWindow.React && iframeWindow.ReactDOM && mountPoint) {
        // Create React element in iframe context
        const ChatWidgetElement = iframeWindow.React.createElement(
          'div',
          {
            style: {
              padding: '20px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              backgroundColor: widgetOptions.theme?.bg || '#ffffff',
              color: '#333',
              height: '100%',
              minHeight: '360px'
            }
          },
          iframeWindow.React.createElement('h3', {
            style: {
              margin: '0 0 16px 0',
              color: widgetOptions.theme?.accent || '#0b84ff',
              fontSize: '18px'
            }
          }, 'Chat Widget'),
          iframeWindow.React.createElement('p', {
            style: { margin: '0 0 16px 0', fontSize: '14px', color: '#666' }
          }, `Hello! Widget ID: ${widgetOptions.id || 'guest'}`),
          iframeWindow.React.createElement('div', {
            style: {
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
              backgroundColor: '#f9fafb'
            }
          }, 'This is an iframe-isolated widget (like Givebutter)'),
          iframeWindow.React.createElement('button', {
            style: {
              backgroundColor: widgetOptions.theme?.accent || '#0b84ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px'
            },
            onClick: closeWidget
          }, 'Close Widget')
        );

        // Render using ReactDOM in iframe
        const root = iframeWindow.ReactDOM.createRoot(mountPoint);
        root.render(ChatWidgetElement);

        // Store root for updates
        widgetRegistry.set(widgetId, {
          container,
          targetEl,
          iframe,
          root,
          closeWidget,
          options: { target, align, account, ...widgetOptions }
        });
      }
    } catch (error) {
      console.error('ChatWidget: Failed to render in iframe:', error);
    }
  };

  // Return widget control object (like Givebutter)
  return {
    id: widgetId,
    close: closeWidget,
    update: (newOptions) => {
      const widget = widgetRegistry.get(widgetId);
      if (widget && widget.root) {
        const updatedOptions = { ...widgetOptions, ...newOptions };
        const iframeWindow = iframe.contentWindow;

        const ChatWidgetElement = iframeWindow.React.createElement(
          'div',
          {
            style: {
              padding: '20px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              backgroundColor: updatedOptions.theme?.bg || '#ffffff',
              color: '#333',
              height: '100%',
              minHeight: '360px'
            }
          },
          iframeWindow.React.createElement('h3', {
            style: {
              margin: '0 0 16px 0',
              color: updatedOptions.theme?.accent || '#0b84ff',
              fontSize: '18px'
            }
          }, 'Chat Widget'),
          iframeWindow.React.createElement('p', {
            style: { margin: '0 0 16px 0', fontSize: '14px', color: '#666' }
          }, `Hello! Widget ID: ${updatedOptions.id || 'guest'}`),
          iframeWindow.React.createElement('div', {
            style: {
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
              backgroundColor: '#f9fafb'
            }
          }, 'This is an iframe-isolated widget (like Givebutter)'),
          iframeWindow.React.createElement('button', {
            style: {
              backgroundColor: updatedOptions.theme?.accent || '#0b84ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px'
            },
            onClick: closeWidget
          }, 'Close Widget')
        );

        widget.root.render(ChatWidgetElement);
        widget.options = { target, align, account, ...updatedOptions };
      }
    }
  };
}

// Data-attribute triggers (Givebutter-style):
// <button data-cw-trigger data-cw-target="#container" data-cw-align="center" data-cw-id="..." data-cw-accent="#..." data-cw-bg="#...">
// <button data-cw-account="ACCOUNT_ID" data-cw-campaign="CAMPAIGN_ID">
function setupDataAttributeTriggers() {
  document.addEventListener("click", (e) => {
    // Check for Givebutter-style data attributes first
    const gbEl = e.target && (e.target.closest ? e.target.closest("[data-gb-account][data-gb-campaign]") : null);
    if (gbEl) {
      e.preventDefault();
      const account = gbEl.getAttribute("data-gb-account");
      const campaign = gbEl.getAttribute("data-gb-campaign");
      const target = gbEl.getAttribute("data-gb-target") || undefined;
      const align = gbEl.getAttribute("data-gb-align") || 'left';

      mountInline({
        target,
        align,
        account,
        id: campaign,
        theme: {
          accent: gbEl.getAttribute("data-gb-accent") || undefined,
          bg: gbEl.getAttribute("data-gb-bg") || undefined
        }
      });
      return;
    }

    // Check for our custom data attributes
    const cwEl = e.target && (e.target.closest ? e.target.closest("[data-cw-trigger]") : null);
    if (!cwEl) return;
    e.preventDefault();

    const id = cwEl.getAttribute("data-cw-id") || undefined;
    const accent = cwEl.getAttribute("data-cw-accent") || undefined;
    const bg = cwEl.getAttribute("data-cw-bg") || undefined;
    const target = cwEl.getAttribute("data-cw-target") || undefined;
    const align = cwEl.getAttribute("data-cw-align") || 'left';
    const account = cwEl.getAttribute("data-cw-account") || undefined;

    mountInline({ target, align, account, id, theme: { accent, bg } });
  });
}

// Custom element (Givebutter-style): <chat-widget id="WIDGET_ID" align="center" account="ACCOUNT_ID">
function setupCustomElement() {
  if (customElements.get("chat-widget")) return;

  class ChatWidgetElement extends HTMLElement {
    connectedCallback() {
      // Get Givebutter-style attributes
      const widgetId = this.getAttribute("id");
      const account = this.getAttribute("account") || undefined;
      const align = this.getAttribute("align") || 'left';
      const accent = this.getAttribute("accent") || undefined;
      const bg = this.getAttribute("bg") || undefined;
      const mode = this.getAttribute("mode") || "inline";
      const label = this.getAttribute("label") || "Chat";

      if (!widgetId) {
        console.warn('ChatWidget: Widget ID is required');
        return;
      }

      if (mode === "inline") {
        // Mount widget directly in this element (like Givebutter)
        const widget = mountInline({
          target: this,
          align,
          account,
          id: widgetId,
          theme: { accent, bg }
        });

        // Store widget reference for potential future use
        if (widget) {
          this._chatWidget = widget;
        }
      } else {
        // Replace with a clickable trigger
        const button = document.createElement("button");
        button.textContent = label;
        button.style.padding = "8px 16px";
        button.style.border = "1px solid #ccc";
        button.style.borderRadius = "6px";
        button.style.backgroundColor = accent || "#f0f0f0";
        button.style.color = "#333";
        button.style.cursor = "pointer";

        button.setAttribute("data-cw-trigger", "");
        if (widgetId) button.setAttribute("data-cw-id", widgetId);
        if (accent) button.setAttribute("data-cw-accent", accent);
        if (bg) button.setAttribute("data-cw-bg", bg);
        if (account) button.setAttribute("data-cw-account", account);
        if (align) button.setAttribute("data-cw-align", align);

        this.replaceWith(button);
      }
    }

    // Givebutter-style API methods
    close() {
      if (this._chatWidget) {
        this._chatWidget.close();
      }
    }

    update(options) {
      if (this._chatWidget) {
        this._chatWidget.update(options);
      }
    }
  }

  customElements.define("chat-widget", ChatWidgetElement);
}

function autoInit() {
  setupDataAttributeTriggers();
  setupCustomElement();
}

// Public API (Givebutter-style)
function mount(options = {}) {
  return mountInline(options);
}

// Givebutter-style widget management
function getWidget(widgetId) {
  return widgetRegistry.get(widgetId) || null;
}

function getAllWidgets() {
  return Array.from(widgetRegistry.values());
}

function closeWidget(widgetId) {
  const widget = widgetRegistry.get(widgetId);
  if (widget) {
    widget.closeWidget();
    return true;
  }
  return false;
}

function closeAllWidgets() {
  widgetRegistry.forEach(widget => widget.closeWidget());
  widgetRegistry.clear();
}

// Legacy overlay function (if you want to keep overlay option)
function mountOverlay(options = {}) {
  console.warn('ChatWidget: Overlay mode not implemented in inline version');
  return mount(options);
}

autoInit();

// Givebutter-style global API
window.ChatWidget = {
  mount,
  mountInline,
  mountOverlay,
  getWidget,
  getAllWidgets,
  closeWidget,
  closeAllWidgets,
  // Givebutter compatibility
  version: "1.0.0"
};
