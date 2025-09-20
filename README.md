# React Chat Widget (IIFE) – Beginner’s User Guide

This project is a minimal, production-friendly starter for building a floating chat widget in React that can be embedded on any website using a single `<script>` tag. The bundle is an IIFE (Immediately Invoked Function Expression) that includes React, so host sites don’t need to install React.

---

## What you’ll learn
- What an IIFE bundle is and why we use it for embeddable widgets
- How this project is structured and how it works
- How to build and test locally
- How to embed the widget on any external site
- How to customize and extend this project to create additional widgets

---

## Technology overview
- React + ReactDOM (included in the bundle): You write UI as a React component; the final JS includes React itself.
- esbuild: Fast bundler that outputs a single minified file for distribution.
- Global API: The bundle exposes a `window.ChatWidget` object with a `mount(options)` function so any website can mount it.

Why IIFE?
- An IIFE bundle runs immediately in the browser and attaches your API to `window`.
- This avoids module loaders and ensures the script works via a plain `<script src>…` tag on any site.

---

## Project structure
```
.
├─ src/
│  ├─ ChatWidget.jsx      # React UI for the widget
│  └─ index.js            # Mount logic and global exposure (window.ChatWidget)
├─ dist/
│  └─ chat-widget.js      # Built distributable bundle (generated)
├─ esbuild.config.js      # Build configuration (IIFE bundle)
├─ examples/
│  └─ external-host.html  # Example of embedding on a 3rd‑party page
└─ package.json
```

Key files to skim:
- `src/ChatWidget.jsx` – UI, behavior, and basic theming
- `src/index.js` – Creates/attaches `window.ChatWidget.mount()`
- `esbuild.config.js` – esbuild entry and output settings

---

## Prerequisites
- Node.js 18+ and npm
- (Optional) Python 3 for a quick local static server

---

## Getting started
1) Install dependencies
```bash
npm install
```

2) Build the widget (outputs `dist/chat-widget.js`)
```bash
npm run build
```

3) Run the included external example locally
- Start a static server from the repo root (choose one):
```bash
# Recommended (Python built‑in)
python3 -m http.server 8080
```
- Open the example page:
```
http://localhost:8080/examples/external-host.html
```

You should see a chat FAB in the bottom‑right; click to open the panel and send a message.

---

## Embedding on any website
Paste the following on the host site (after you host `chat-widget.js` on your CDN or server):
```html
<script src="https://cdn.example.com/chat-widget.js"></script>
<script>
  ChatWidget.mount({
    id: "user-12345",
    theme: { accent: "#ff5722", bg: "#fff8f0" },
    onSendMessage: async (text, { id }) => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, message: text })
      });
      const data = await res.json();
      return data.reply; // Text to show as the bot response
    }
  });
</script>
```

Options:
- `id` – Any session/user identifier for your backend.
- `theme` – `{ accent: string, bg: string }` for quick color customization.
- `onSendMessage(text, { id })` – Async function that returns the bot’s response text.

---

## How the code works (high level)
- `src/index.js` attaches a `mount` function to `window.ChatWidget`. When called, it ensures an element exists (or creates one) and renders the React component into it using `createRoot`.
- `src/ChatWidget.jsx` renders:
  - A floating action button (FAB)
  - A chat panel when open
  - Simple message list and input
  - Calls `onSendMessage` and appends the response as a "bot" message

Implementation detail: We rely on our own `window.ChatWidget = { mount }` assignment in `src/index.js`. The esbuild config intentionally doesn’t set `globalName` to avoid overriding this object in the generated IIFE.

---

## Customize the UI
- Colors: Update `theme` props or inline styles in `ChatWidget.jsx`.
- Layout: Tweak the container sizes (width/height) and border radius/box‑shadow.
- CSS instead of inline styles: Move styles to a CSS file and inject a `<style>` tag or build with a CSS loader if you prefer.
- Behavior: Add typing indicators, loading states, retries, or message roles (system, tool, etc.).

Example: add a short delay to simulate typing
```js
await new Promise(r => setTimeout(r, 400));
return `Echo: ${text}`;
```

---

## Building additional widgets from this starter
This project is a great base for similar embeddable widgets (support, feedback, announcement, NPS, etc.). You have two common approaches:

1) Single bundle exposing multiple globals (simplest to start)
- Create new components, e.g., `src/SupportWidget.jsx`.
- Update `src/index.js` to export multiple mount functions:
```js
window.ChatWidget = { mount: mountChatWidget };
window.SupportWidget = { mount: mountSupportWidget };
```
- Build once to produce a single `dist/chat-widget.js` that contains both. Host pages can choose which global to call.

2) Multiple bundles (clean separation per widget)
- Change `esbuild.config.js` to build multiple entry points:
```js
esbuild.build({
  entryPoints: {
    "chat-widget": "src/index.js",           // exports ChatWidget
    "support-widget": "src/support-index.js" // exports SupportWidget
  },
  outdir: "dist",
  bundle: true,
  format: "iife",
  minify: true,
});
```
- This yields `dist/chat-widget.js` and `dist/support-widget.js`. Each can attach its own `window.*` global (e.g., `window.SupportWidget`).

Tips for new widgets:
- Keep each widget’s UI in its own React component file.
- Keep each widget’s mount logic in its own `*-index.js` so globals don’t collide.
- Keep shared logic (utilities, theming) in a `src/shared/` folder to avoid duplication.

---

## Testing locally and linting
- Build: `npm run build`
- Open example: `examples/external-host.html` via a static server (see above)
- Lint: `npm run lint`

---

## Deploying the bundle
1) Build locally: `npm run build`
2) Upload `dist/chat-widget.js` to your CDN or static host
3) Embed the `<script src>` URL on your target site(s)

---

## Troubleshooting
- `ChatWidget is undefined` on host site:
  - Ensure the `<script src="…/chat-widget.js"></script>` is loading (check Network tab)
  - Ensure your script tag is before you call `ChatWidget.mount(...)`
  - Confirm you are using the updated build (rebundle after code changes)
- CORS/Network errors in `onSendMessage`:
  - Your API must be reachable from the host site and allow the host’s origin
- Nothing appears on the page:
  - Check for JavaScript errors in the console
  - Verify the FAB’s z-index doesn’t get hidden by site CSS

---

## Next steps & ideas
- Add a dark theme
- Add a typing indicator and disable the Send button while awaiting a response
- Add storage (e.g., localStorage) to persist chat state per session
- Add telemetry hooks (open/close, send, response) for analytics
- Extract a small theming system and publish preset themes


### Project next steps (recommended roadmap)
- Automate builds and releases (CI/CD)
  - Add a GitHub Actions workflow that on tag push (e.g., v*) runs `npm ci && npm run build` and uploads `dist/chat-widget.js` as a release asset
  - Optionally publish the bundle to GitHub Pages or your CDN on release
- Versioning & changelog
  - Adopt Conventional Commits and generate a CHANGELOG on each release
  - Use annotated git tags (e.g., v0.1.0) to trigger releases
- Multiple widgets from one repo
  - Add a second widget (e.g., SupportWidget) and either expose a second global or create a separate entry in esbuild (multi-entry build)
  - Keep shared utilities in `src/shared/` to reduce duplication
- UX improvements
  - Dark theme toggle, typing indicator, loading/disabled state on send, error/retry handling
  - Optional localStorage persistence of recent messages per session
- Hardening & security
  - Provide SRI hash instructions for the `<script>` tag
  - Document CSP requirements (e.g., allow your CDN host; consider `unsafe-inline` only if you inject inline styles)
  - Namespace globals to avoid collisions (keep using `window.ChatWidget`)
- Docs
  - Create a docs/ folder with short guides: embedding, theming, extending, releasing
  - Include copy-paste snippets for common frameworks (Next.js/React, plain HTML, Shopify, etc.)
- Testing
  - Add unit tests (e.g., Testing Library + Jest/Vitest) for open/close, send flow, and theme rendering
- Distribution options
  - Keep IIFE as the main CDN artifact; optionally add UMD/ESM builds if you want npm distribution for app bundlers

Happy building! 🎉
