import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["{app,components,lib}/**/*.test.{ts,tsx}"],
    /**
     * The delivery client is built at module load and throws on missing
     * credentials, so any module that imports it needs these present.
     */
    env: {
      CONTENTSTACK_API_KEY: "blt_test_api_key",
      CONTENTSTACK_DELIVERY_TOKEN: "cs_test_delivery_token",
      CONTENTSTACK_ENVIRONMENT: "development",
      CONTENTSTACK_REGION: "EU",
    },
  },
});
