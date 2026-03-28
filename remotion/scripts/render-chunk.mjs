import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compositionId = process.argv[2] || "landscape";
const startFrame = parseInt(process.argv[3]) || 0;
const endFrame = parseInt(process.argv[4]) || 100;
const outputPath = process.argv[5] || "/tmp/chunk.mp4";

const bundleCachePath = "/tmp/remotion-bundle-url.txt";

let bundled;
if (fs.existsSync(bundleCachePath)) {
  bundled = fs.readFileSync(bundleCachePath, "utf8").trim();
  // Verify bundle dir still exists
  const bundleDir = bundled.replace("file://", "");
  if (!fs.existsSync(bundleDir)) {
    fs.unlinkSync(bundleCachePath);
    bundled = null;
  }
}

if (!bundled) {
  console.log("Bundling...");
  bundled = await bundle({
    entryPoint: path.resolve(__dirname, "../src/index.ts"),
    webpackOverride: (config) => config,
  });
  fs.writeFileSync(bundleCachePath, bundled);
  console.log(`Bundle: ${bundled}`);
} else {
  console.log(`Reusing bundle: ${bundled}`);
}

const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: {
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({
  serveUrl: bundled,
  id: compositionId,
  puppeteerInstance: browser,
});

console.log(`Rendering ${compositionId} frames ${startFrame}-${endFrame} → ${outputPath}`);

await renderMedia({
  composition,
  serveUrl: bundled,
  codec: "h264",
  outputLocation: outputPath,
  puppeteerInstance: browser,
  muted: true,
  concurrency: 2,
  frameRange: [startFrame, endFrame],
});

await browser.close({ silent: false });
console.log(`Done: ${outputPath}`);
