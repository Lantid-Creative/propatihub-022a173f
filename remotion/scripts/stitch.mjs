import { execSync } from "child_process";
import fs from "fs";

const compositionId = process.argv[2] || "landscape";
const outputPath = process.argv[3] || `/mnt/documents/propatihub-${compositionId}.mp4`;
const chunkDir = "/tmp";

// Find all chunks for this composition
const chunks = fs.readdirSync(chunkDir)
  .filter(f => f.startsWith(`${compositionId}_`) && f.endsWith('.mp4'))
  .sort((a, b) => {
    const numA = parseInt(a.split('_')[1]);
    const numB = parseInt(b.split('_')[1]);
    return numA - numB;
  })
  .map(f => `${chunkDir}/${f}`);

if (chunks.length === 0) {
  console.error("No chunks found!");
  process.exit(1);
}

if (chunks.length === 1) {
  fs.copyFileSync(chunks[0], outputPath);
} else {
  const concatFile = `/tmp/concat_${compositionId}.txt`;
  fs.writeFileSync(concatFile, chunks.map(c => `file '${c}'`).join('\n'));
  execSync(`ffmpeg -y -f concat -safe 0 -i ${concatFile} -c copy "${outputPath}"`);
}

console.log(`Stitched ${chunks.length} chunks → ${outputPath}`);
console.log(`Size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(1)} MB`);
