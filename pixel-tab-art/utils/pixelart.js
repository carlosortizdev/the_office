/**
 * utils/pixelart.js
 * Seeded PRNG + hand-crafted critter sprite rendering.
 * Shared between content.js and popup.js via global `PixelArt`.
 */
const PixelArt = (() => {

  // ── PRNG ────────────────────────────────────────────────────────────────
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
  }

  // ── Sprite data ──────────────────────────────────────────────────────────
  // 8 rows × 8 cols, critter facing RIGHT.
  // . = transparent
  // b = body (main fur)
  // l = light (belly / inner ear)
  // d = dark marking / stripe
  // e = eye
  // n = nose
  const SPRITES = {
    cat: [
      // walk A
      [
        '........',
        '.....b.b',  // pointy ears
        '....bbbb',  // head
        'b...bebb',  // tail up (x=0) + eye
        'bb.bbbbb',  // tail base + body
        'bbbllbbb',  // body + light belly
        '.b...bb.',  // front leg (x=1) + back legs (x=5,6)
        '........',
      ],
      // walk B — legs shifted
      [
        '........',
        '.....b.b',
        '....bbbb',
        'b...bebb',
        'bb.bbbbb',
        'bbbllbbb',
        '..b.b...',
        '........',
      ],
      // scurry — low crouch, all four legs wide, tail flat
      [
        '........',
        '.....b.b',
        '....bbbb',
        '....bebn',  // open mouth
        'bbbbbbb.',  // body flattened
        'bbbllbbb',
        'b.b.b.b.',  // all four legs visible
        '........',
      ],
    ],

    dog: [
      // walk A
      [
        '.....bb.',  // floppy ear
        '....bbbb',  // head
        '.....ebb',  // eye + muzzle
        '.bbbbbbb',  // neck + body
        'bbbbbbbb',  // body
        'bbbllbbb',  // belly
        '.b...bb.',  // legs A
        '........',
      ],
      // walk B
      [
        '.....bb.',
        '....bbbb',
        '.....ebb',
        '.bbbbbbb',
        'bbbbbbbb',
        'bbbllbbb',
        '..b.b...',
        '........',
      ],
      // scurry — tail wagging (high), tongue out
      [
        '.....bb.',
        '....bbbb',
        '.....ebn',  // tongue / open mouth
        '.bbbbbbb',
        'bbbbbbbb',
        'bbbllbbb',
        'b.b.b.b.',  // all four legs
        '........',
      ],
    ],
  };

  // Horizontal flip for left-facing direction
  function flipFrame(frame) {
    return frame.map(row => row.split('').reverse().join(''));
  }

  const SPRITES_LEFT = {
    cat: SPRITES.cat.map(flipFrame),
    dog: SPRITES.dog.map(flipFrame),
  };

  // ── Critter identity derived from seed ───────────────────────────────────
  function getCritterType(seed) {
    return (seed % 2 === 0) ? 'cat' : 'dog';
  }

  function getColors(seed) {
    const rng = mulberry32(seed);
    const hue = Math.floor(rng() * 360);
    const sat = 25 + Math.floor(rng() * 35);   // lower sat = more fur-like
    const lit = 48 + Math.floor(rng() * 22);
    return {
      b: `hsl(${hue}, ${sat}%, ${lit}%)`,
      l: `hsl(${hue}, ${Math.max(8, sat - 12)}%, ${Math.min(88, lit + 22)}%)`,
      d: `hsl(${hue}, ${sat}%, ${Math.max(18, lit - 24)}%)`,
      e: '#1a1a1a',
      n: `hsl(${(hue + 180) % 360}, 45%, 38%)`,
    };
  }

  // ── Drawing ───────────────────────────────────────────────────────────────
  const BLOCK = 5;   // canvas pixels per logical pixel → 40×40 total
  const GRID  = 8;
  const SIZE  = GRID * BLOCK;

  function drawCritter(canvas, type, frameIndex, direction, colors) {
    canvas.width  = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);

    const bank   = direction === 'left' ? SPRITES_LEFT[type] : SPRITES[type];
    const frames = bank || SPRITES[type];
    const frame  = frames[frameIndex % frames.length];

    for (let y = 0; y < GRID; y++) {
      const row = frame[y] || '';
      for (let x = 0; x < GRID; x++) {
        const ch = row[x];
        if (!ch || ch === '.') continue;
        ctx.fillStyle = colors[ch] || colors.b;
        ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
      }
    }
  }

  return { mulberry32, hashString, drawCritter, getCritterType, getColors };
})();
