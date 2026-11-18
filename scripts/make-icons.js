const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const BLUE = [26, 92, 255, 255];
const WHITE = [255, 255, 255, 255];

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

function inRoundedRect(x, y, cx, cy, w, h, r) {
  const hw = w / 2, hh = h / 2;
  const dx = Math.abs(x - cx), dy = Math.abs(y - cy);
  if (dx <= hw - r || dy <= hh - r) return dx <= hw && dy <= hh;
  const ox = dx - (hw - r), oy = dy - (hh - r);
  return ox * ox + oy * oy <= r * r;
}

function inCircle(x, y, cx, cy, r) {
  const dx = x - cx, dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function inTriangle(x, y, x1, y1, x2, y2, x3, y3) {
  const d1 = (x - x2) * (y1 - y2) - (x1 - x2) * (y - y2);
  const d2 = (x - x3) * (y2 - y3) - (x2 - x3) * (y - y3);
  const d3 = (x - x1) * (y3 - y1) - (x3 - x1) * (y - y1);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

function drawIcon(size, maskable) {
  const rgba = Buffer.alloc(size * size * 4);
  const px = (x, y, c) => {
    const i = (y * size + x) * 4;
    rgba[i] = c[0]; rgba[i + 1] = c[1]; rgba[i + 2] = c[2]; rgba[i + 3] = c[3];
  };
  const r = maskable ? 0 : size * 0.215;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      px(x, y, inRoundedRect(x, y, size / 2, size / 2, size, size, r) ? BLUE : [255, 255, 255, 0]);
    }
  }
  const s = size / 512;
  const bx = 116 * s, by = 128 * s, bw = 280 * s, bh = 194 * s, br = 44 * s;
  const bcx = bx + bw / 2, bcy = by + bh / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (inRoundedRect(x, y, bcx, bcy, bw, bh, br) || inTriangle(x, y, 176 * s, 318 * s, 246 * s, 388 * s, 246 * s, 318 * s)) {
        px(x, y, WHITE);
      }
    }
  }
  for (const cx of [196, 256, 316]) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (inCircle(x, y, cx * s, 251 * s, 26 * s)) px(x, y, BLUE);
      }
    }
  }
  return encodePNG(size, size, rgba);
}

const outDir = path.join(__dirname, "..", "icons");
fs.mkdirSync(outDir, { recursive: true });
const jobs = [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["icon-maskable-512.png", 512, true],
  ["apple-touch-icon.png", 180, false]
];
for (const [name, size, maskable] of jobs) {
  fs.writeFileSync(path.join(outDir, name), drawIcon(size, maskable));
  console.log("wrote icons/" + name);
}
