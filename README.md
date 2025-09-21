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
└─ package.json
```

Key files to skim:
- `src/ChatWidget.jsx` – Minimal UI (title, short description, one input, and a button), basic theming
- `src/index.js` – Creates/attaches `window.ChatWidget.mount()`
- `esbuild.config.js` – esbuild entry and output settings

---

## Prerequisites
- Node.js 18+ and npm

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

3) Test the widget locally
```bash
npm run test:widget
```
This builds the widget and starts a local server. Then open http://localhost:8080/test-local.html to test multiple widget configurations.

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
- `src/ChatWidget.jsx` renders a minimal widget:
  - A title and short description
  - A single text input and a Submit button
  - (Optional) calls `onSendMessage(text, { id })` for host-defined handling

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

### Quick testing
- **Test widget**: `npm run test:widget` (builds + serves, then visit test page)
- **Build and serve**: `npm run dev` (builds + serves on http://localhost:8080)
- **Just serve**: `npm run serve` (serves existing build)

### Available test pages
- **Comprehensive test**: http://localhost:8080/test-local.html (multiple widget configurations)
- **Simple example**: http://localhost:8080/site/host_website/index.html (basic demo)

### Development commands
- **Build**: `npm run build`
- **Lint**: `npm run lint`

---

## Deploying the bundle
1) Build locally: `npm run build`
2) Upload `dist/chat-widget.js` to your CDN or static host
3) Embed the `<script src>` URL on your target site(s)


---

## Releases and versioning (CI‑powered)
This repo includes a GitHub Actions workflow that automatically builds the widget and attaches the distributable file to a GitHub Release whenever you push a git tag that starts with `v` (e.g., `v0.1.0`).

Why tags? Using version tags keeps a clear history of what was shipped and lets your team/CDN reference an immutable artifact.

Recommended flow (for each release):
1) Make changes and verify locally
```bash
npm install
npm run build
```
2) Create a version tag and push it
```bash
git tag -a v0.1.0 -m "v0.1.0"
git push origin v0.1.0
```
3) What happens next
- GitHub Actions runs automatically:
  - installs deps, builds the project
  - attaches `dist/chat-widget.js` to the GitHub Release for the tag
- You can find the Release and the attached asset at: GitHub → Releases

Tips for future releases:
- Use Semantic Versioning (`vMAJOR.MINOR.PATCH`) and increment as appropriate
- Consider Conventional Commits to auto‑generate changelogs later
- If you need to re‑cut a tag:
  - delete local and remote tags, then recreate
  ```bash
  git tag -d v0.1.0
  git push origin :refs/tags/v0.1.0
  git tag -a v0.1.0 -m "v0.1.0"
  git push origin v0.1.0
  ```



## GitHub Pages deployment (latest builds) — why and how
GitHub Pages gives you a public URL that always reflects the latest build from `main`. This is perfect for demos, QA, and quick shareable links. It complements Releases (which are versioned and immutable).

Why use both?
- Pages = “latest” (auto-updates on push to `main`)
- Releases = “versioned & immutable” (built on tag `vX.Y.Z` and attached as an asset)

What is published to Pages
- `dist/chat-widget.js` (the embeddable bundle)
- `index.html` (minimal demo generated by the workflow)

When it runs
- On push to `main`
- On manual trigger (Workflow Dispatch)

One‑time setup
- GitHub → Repository Settings → Pages → Source: GitHub Actions (enable)

Public URLs
- See “Direct URLs to the built bundle (dist)” below for Pages links

Recommended development flow
1) Develop locally: `npm run build`
2) Push to `main`: Pages publishes the latest bundle & demo for easy sharing
3) Ready to ship: tag a version (e.g., `v0.2.0`) → Release workflow builds and attaches `dist/chat-widget.js` to the GitHub Release (immutable URL)
4) Optional: upload the release artifact to your CDN for production serving

Notes
- Prefer Release (versioned) URLs for production embeds; use Pages for previews and QA.
- If you need cache control, a dedicated CDN is recommended for production.

### Direct URLs to the built bundle (dist)
- Local (development):
  - http://localhost:8080/dist/chat-widget.js
- GitHub Release asset (example for v0.1.0):
  - https://github.com/caretapps-developer/ms-chat-widget-iffe/releases/download/v0.1.0/chat-widget.js
- Pattern for future versions:
  - https://github.com/caretapps-developer/ms-chat-widget-iffe/releases/download/vX.Y.Z/chat-widget.js
- GitHub Pages (latest on main):
  - https://caretapps-developer.github.io/ms-chat-widget-iffe/dist/chat-widget.js


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
