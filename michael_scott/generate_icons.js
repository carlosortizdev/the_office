// Run with: node generate_icons.js
// Generates PNG icons using canvas (requires 'canvas' npm package)
// For the Chrome extension, these are minimal placeholder icons.
// If you don't have node-canvas, the extension will still load — Chrome
// just won't show a custom icon in the toolbar.

const { createCanvas } = require('canvas');
const fs = require('fs');

function makeIcon(size, bgColor, letter, letterColor) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = letterColor;
  ctx.font = `bold ${Math.floor(size * 0.55)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, size/2, size/2);
  return canvas.toBuffer('image/png');
}

const sizes = [16, 48, 128];
sizes.forEach(s => {
  fs.writeFileSync(`icon${s}.png`, makeIcon(s, '#1a4a8a', 'M', '#ffd700'));
  console.log(`icon${s}.png created`);
});
