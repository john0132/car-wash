import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

// Component and unit tests live next to the code they cover (*.test.ts[x]).
// Kept apart from vite.config.ts so tests don't load the Rails, Inertia SSR and Tailwind plugins.
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true }, // the "@/*" alias from tsconfig.json
  test: {
    environment: "jsdom",
    setupFiles: ["app/javascript/test/setup.ts"],
    include: ["app/javascript/**/*.test.{ts,tsx}"],
    restoreMocks: true,
  },
})
