// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import cloudflare from "@astrojs/cloudflare";

// Determine adapter based on environment
const getAdapter = () => {
  // Use process.env in Node.js build context (not import.meta.env which is for runtime)
  // eslint-disable-next-line no-undef
  const platform = process.env.PLATFORM || "node";

  if (platform === "cloudflare") {
    return cloudflare({
      platformProxy: {
        enabled: true,
      },
    });
  }

  return node({
    mode: "standalone",
  });
};

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 4321 },
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: getAdapter(),
});
