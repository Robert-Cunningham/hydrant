/*
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const mdx = await import("@mdx-js/rollup")
  return {
    plugins: [react(), mdx.default()],
  }
})
*/

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig(async () => {
  const mdx = await import("@mdx-js/rollup")
  return {
    optimizeDeps: {
      include: ["react/jsx-runtime"],
    },
    plugins: [react(), mdx.default({ remarkPlugins: [] })],
  }
})
