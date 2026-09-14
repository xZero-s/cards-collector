// convert.mjs  — launch with: node convert.mjs
import sharp from "sharp";
import { readdir, mkdir } from "fs/promises";
import path from "path";

const SRC = "./foil";
const DEST = "./foil/converted";

await mkdir(DEST, { recursive: true });

const files = (await readdir(SRC)).filter((f) => f.endsWith(".png"));

for (const file of files) {
  const isNormal = file.toLowerCase().includes("normal");
  const out = path.join(DEST, file.replace(".png", ".webp"));

  await sharp(path.join(SRC, file))
    .resize(1024, 1024)
    .webp({ quality: isNormal ? 95 : 85 })
    .toFile(out);

  console.log("Conversion completed!", out);
}
