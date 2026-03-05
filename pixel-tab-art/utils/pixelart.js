/**
 * utils/pixelart.js
 * Seeded PRNG + deterministic pixel art generation.
 * Exposed as a global `PixelArt` object (no ES modules — compatible with
 * both content scripts and popup scripts).
 */
const PixelArt = (() => {
  // mulberry32 — fast, good quality 32-bit seeded PRNG
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // FNV-1a 32-bit hash — converts a string into a stable integer seed
  function hashString(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
  }

  /**
   * Draw pixel art onto `canvas` using `seed`.
   * @param {HTMLCanvasElement} canvas
   * @param {number} seed  — 32-bit integer
   * @param {number} [blockSize=8]  — canvas pixels per logical pixel
   */
  function generate(canvas, seed, blockSize = 8) {
    const GRID = 8;
    const SIZE = GRID * blockSize;

    canvas.width = SIZE;
    canvas.height = SIZE;

    const ctx = canvas.getContext('2d');
    const rng = mulberry32(seed);

    // --- Palette ---------------------------------------------------------
    const hue1 = Math.floor(rng() * 360);
    const hue2 = (hue1 + 50 + Math.floor(rng() * 70)) % 360;
    const sat = 55 + Math.floor(rng() * 35);
    const lit = 45 + Math.floor(rng() * 20);

    // Index 0 = transparent, 1 = primary, 2 = accent, 3 = shadow
    const palette = [
      null,
      `hsl(${hue1}, ${sat}%, ${lit}%)`,
      `hsl(${hue2}, ${sat}%, ${lit + 18}%)`,
      `hsl(${hue1}, ${sat - 10}%, ${lit - 22}%)`,
    ];

    // --- Grid (left 4 columns, mirrored right) ----------------------------
    const grid = [];
    for (let y = 0; y < GRID; y++) {
      const left = [];
      for (let x = 0; x < GRID / 2; x++) {
        const r = rng();
        if (r < 0.30) left.push(0);       // transparent
        else if (r < 0.72) left.push(1);  // primary
        else if (r < 0.90) left.push(2);  // accent
        else left.push(3);                // shadow
      }
      // Mirror: row = [left | reversed(left)]
      grid.push([...left, ...left.slice().reverse()]);
    }

    // --- Render ----------------------------------------------------------
    ctx.clearRect(0, 0, SIZE, SIZE);
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const ci = grid[y][x];
        if (ci === 0) continue;
        ctx.fillStyle = palette[ci];
        ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
      }
    }
  }

  return { mulberry32, hashString, generate };
})();
