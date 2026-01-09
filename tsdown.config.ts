import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  dts: true,
  target: "es2020",
  platform: "browser",
  outDir: "lib",
});
