/**
 * scripts/create-icons.js
 * Generates icons/icon16.png, icon48.png, icon128.png
 * with the same pixel-art algorithm used by the extension.
 *
 * Run once:  node scripts/create-icons.js
 * No external dependencies — uses only Node built-ins (zlib, fs).
 */

const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// ── CRC32 ─────────────────────────────────────────────────────────────────
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// ── PNG builder ───────────────────────────────────────────────────────────
function chunk(type, data) {
  const tb = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcInput = Buffer.concat([tb, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([len, tb, data, crcBuf]);
}

function buildPNG(size, pixels) {
  // pixels: Uint8Array of length size*size*4 (RGBA)
  const raw = [];
  for (let y = 0; y < size; y++) {
    raw.push(0); // filter: None
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      raw.push(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]);
    }
  }
  const compressed = zlib.deflateSync(Buffer.from(raw));

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // colour type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdrData), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

// ── Pixel-art generation (mirrors utils/pixelart.js logic) ────────────────
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function generatePixels(canvasSize, seed) {
  const GRID = 8;
  const BLOCK = canvasSize / GRID;
  const pixels = new Uint8Array(canvasSize * canvasSize * 4);
  const rng = mulberry32(seed);

  const hue1 = Math.floor(rng() * 360);
  const hue2 = (hue1 + 50 + Math.floor(rng() * 70)) % 360;
  const sat = 55 + Math.floor(rng() * 35);
  const lit = 45 + Math.floor(rng() * 20);

  const palette = [
    null,
    [...hslToRgb(hue1, sat, lit), 255],
    [...hslToRgb(hue2, sat, lit + 18), 255],
    [...hslToRgb(hue1, sat - 10, lit - 22), 255],
  ];

  const grid = [];
  for (let y = 0; y < GRID; y++) {
    const left = [];
    for (let x = 0; x < GRID / 2; x++) {
      const r = rng();
      if (r < 0.30) left.push(0);
      else if (r < 0.72) left.push(1);
      else if (r < 0.90) left.push(2);
      else left.push(3);
    }
    grid.push([...left, ...left.slice().reverse()]);
  }

  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      const ci = grid[gy][gx];
      if (ci === 0) continue;
      const [r, g, b, a] = palette[ci];
      for (let py = 0; py < BLOCK; py++) {
        for (let px = 0; px < BLOCK; px++) {
          const idx = ((gy * BLOCK + py) * canvasSize + (gx * BLOCK + px)) * 4;
          pixels[idx] = r; pixels[idx + 1] = g; pixels[idx + 2] = b; pixels[idx + 3] = a;
        }
      }
    }
  }
  return pixels;
}

// ── Write icons ───────────────────────────────────────────────────────────
const ICON_SEED = 0xdeadbeef; // fixed seed so the icon is always the same
const iconsDir = path.join(__dirname, '..', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

for (const size of [16, 48, 128]) {
  const blockSize = size / 8; // must be integer; 16→2, 48→6, 128→16
  const pixels = generatePixels(size, ICON_SEED);
  const png = buildPNG(size, pixels);
  const outPath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`wrote ${outPath}`);
}

console.log('Done. Icons are in icons/');
