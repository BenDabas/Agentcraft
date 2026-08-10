/**
 * Generate the app icons — no image dependencies.
 *
 * The mark is the brand dot from the sidebar: an accent circle inside its
 * translucent ring, on the dark surface. Pixels are composed here and written
 * as PNG using only node:zlib, so `npm install` is never needed to build icons.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'icons');
mkdirSync(out, { recursive: true });

const BG = [14, 18, 22]; // --bg dark
const ACCENT = [225, 67, 40]; // --accent
const RING = [225, 67, 40];

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** Write an RGB PNG from a pixel callback returning [r,g,b] per coordinate. */
function png(size, pixel) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixel(x, y);
      raw[p++] = r;
      raw[p++] = g;
      raw[p++] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

/**
 * Anti-aliased by supersampling 3x3 per pixel — cheap, and it matters a lot at
 * 180px where a hard circle edge would look ragged.
 */
function mark(size) {
  const c = size / 2;
  const rDot = size * 0.17;
  const rIn = size * 0.3;
  const rOut = size * 0.39;

  return (x, y) => {
    let acc = [0, 0, 0];
    const S = 3;
    for (let sy = 0; sy < S; sy++) {
      for (let sx = 0; sx < S; sx++) {
        const px = x + (sx + 0.5) / S;
        const py = y + (sy + 0.5) / S;
        const d = Math.hypot(px - c, py - c);
        let col = BG;
        if (d <= rDot) col = ACCENT;
        else if (d >= rIn && d <= rOut) col = mix(BG, RING, 0.32);
        acc = acc.map((v, i) => v + col[i]);
      }
    }
    return acc.map((v) => Math.round(v / (S * S)));
  };
}

for (const size of [180, 192, 512]) {
  writeFileSync(join(out, `icon-${size}.png`), png(size, mark(size)));
  console.log(`icons/icon-${size}.png`);
}

// A crisp vector favicon for browsers that prefer one.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0E1216"/>
  <circle cx="32" cy="32" r="22" fill="none" stroke="#E14328" stroke-opacity=".32" stroke-width="5.5"/>
  <circle cx="32" cy="32" r="11" fill="#E14328"/>
</svg>
`;
writeFileSync(join(out, 'icon.svg'), svg);
console.log('icons/icon.svg');
