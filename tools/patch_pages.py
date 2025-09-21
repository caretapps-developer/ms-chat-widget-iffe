from pathlib import Path

p = Path('.github/workflows/pages.yml')
s = p.read_text()
anchor = "- name: Prepare site folder\n        run: |\n"
i = s.find(anchor)
if i == -1:
    raise SystemExit("anchor not found in pages.yml")
start = i + len(anchor)
rest = s[start:]
end_marker = "\n\n      - name:"
end_rel = rest.find(end_marker)
if end_rel == -1:
    end_rel = len(rest)
new_run = (
    "          rm -rf site\n"
    "          mkdir -p site\n"
    "          cp -R dist site/dist\n"
    "          cat > site/index.html << 'EOF'\n"
    "          <!doctype html>\n"
    "          <html>\n"
    "            <head>\n"
    "              <meta charset=\"utf-8\" />\n"
    "              <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n"
    "              <title>Chat Widget Demo</title>\n"
    "              <script src=\"./dist/chat-widget.js\" defer></script>\n"
    "              <style>\n"
    "                body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 24px; }\n"
    "                .container { max-width: 720px; margin: 0 auto; }\n"
    "                .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; box-shadow: 0 8px 24px rgba(2,6,23,0.08); }\n"
    "                button { padding:8px 12px; border:0; border-radius:8px; background:#0b84ff; color:#fff; cursor:pointer; }\n"
    "              </style>\n"
    "            </head>\n"
    "            <body>\n"
    "              <div class=\"container\">\n"
    "                <h1>Chat Widget Demo</h1>\n"
    "                <p>This minimal page loads the bundle and opens the widget via the button.</p>\n"
    "                <div class=\"card\">\n"
    "                  <p><button data-cw-trigger data-cw-id=\"ext-user-42\" data-cw-accent=\"#0b84ff\" data-cw-bg=\"#ffffff\">Open widget</button></p>\n"
    "                </div>\n"
    "              </div>\n"
    "            </body>\n"
    "          </html>\n"
    "          EOF\n"
)
s2 = s[:start] + new_run + rest[end_rel:]
p.write_text(s2)
print("Patched .github/workflows/pages.yml")

