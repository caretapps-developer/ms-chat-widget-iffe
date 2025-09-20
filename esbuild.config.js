const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["src/index.js"],
  bundle: true,
  outfile: "dist/chat-widget.js",
  format: "iife",
  minify: true,
  define: { "process.env.NODE_ENV": '"production"' },
  loader: { ".js": "jsx", ".jsx": "jsx" },
}).catch(() => process.exit(1));
