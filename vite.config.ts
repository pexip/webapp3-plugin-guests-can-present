import mkcert from "vite-plugin-mkcert";
import { defineConfig } from "vite";
import path from "path";
import fs from "fs";
import serveStatic from "serve-static";

// Change this to your target Infinity instance
const TARGET_INFINITY = "https://pexipdemo.com";

export default defineConfig({
  base: "./",
  build: {
    target: "esnext",
    rollupOptions: {
      input: ["./index.html"],
      output: {
        entryFileNames: `assets/[name].js`,
      },
    },
  },

  plugins: [
    mkcert(),
    // Serve /dev-assets as /dev during dev mode only
    {
      name: "serve-dev-assets",
      apply: "serve", // only during dev
      configureServer(server) {
        const devAssetsPath = path.resolve(__dirname, "dev-assets");
        if (fs.existsSync(devAssetsPath)) {
          server.middlewares.use(
            "/dev",
            serveStatic(devAssetsPath, {
              index: false,
            })
          );
          console.log("🟢 Serving /dev-assets at /dev");
        } else {
          console.warn(
            "⚠️  dev-assets folder not found. Skipping static serving."
          );
        }
      },
    },
  ],

  server: {
    open: "/webapp3/",
    allowedHosts: ["localhost"],
    proxy: {
      "/webapp3/branding/manifest.json": {
        target: "https://localhost:5173",
        changeOrigin: true,
        secure: false,
        rewrite: (path) =>
          path.replace(
            /^\/webapp3\/branding\/manifest\.json$/,
            "/dev/manifest.json"
          ),
      },
      "/api": {
        target: TARGET_INFINITY,
        changeOrigin: true,
        secure: false,
      },
      "/webapp3": {
        target: TARGET_INFINITY,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
