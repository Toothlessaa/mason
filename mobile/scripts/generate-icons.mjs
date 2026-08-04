import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "..", "logo1.jpg");
const OUT = path.join(ROOT, "assets");
const NAVY = { r: 2, g: 7, b: 18 };
const SAFE = 680;

mkdirSync(OUT, { recursive: true });
const toFile = (name) => path.join(OUT, name);

const src = await sharp(SRC);

await src.clone().resize(1024, 1024, { fit: "cover" }).png().toFile(toFile("icon.png"));

const foreground = await src
  .clone()
  .resize(SAFE, SAFE, { fit: "cover" })
  .png()
  .toBuffer();
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { ...NAVY, alpha: 0 } } })
  .composite([{ input: foreground, left: (1024 - SAFE) / 2, top: (1024 - SAFE) / 2 }])
  .png()
  .toFile(toFile("android-icon-foreground.png"));

await sharp({ create: { width: 1024, height: 1024, channels: 4, background: NAVY } })
  .png()
  .toFile(toFile("android-icon-background.png"));

const luminance = await src
  .clone()
  .resize(1024, 1024, { fit: "cover" })
  .grayscale()
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const mono = Buffer.alloc(luminance.info.width * luminance.info.height * 4);
for (let i = 0; i < luminance.info.width * luminance.info.height; i++) {
  const value = luminance.data[i * 4];
  mono[i * 4] = 255;
  mono[i * 4 + 1] = 255;
  mono[i * 4 + 2] = 255;
  mono[i * 4 + 3] = value;
}
const rawOptions = {
  raw: { width: luminance.info.width, height: luminance.info.height, channels: 4 },
};
await sharp(mono, rawOptions).png().toFile(toFile("android-icon-monochrome.png"));
await sharp(mono, rawOptions).resize(96, 96).png().toFile(toFile("notification-icon.png"));

await src.clone().resize(64, 64, { fit: "cover" }).png().toFile(toFile("favicon.png"));

console.log("Icons written to", OUT);