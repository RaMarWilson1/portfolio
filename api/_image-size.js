// api/_image-size.js
// Reads an image's pixel dimensions from its first bytes (HTTP Range request),
// so the gallery can reserve the right aspect ratio before images load.
// Supports JPEG (incl. EXIF orientation), PNG and WebP. Returns null if unknown.

const u16 = (b, i, le) => (le ? b[i] | (b[i + 1] << 8) : (b[i] << 8) | b[i + 1]);
const u32 = (b, i, le) => (le ? (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)) >>> 0 : ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0);

function exifOrientation(b, start, end) {
  // start points at "Exif\0\0"
  const t = start + 6;
  if (t + 8 > end) return 1;
  const le = b[t] === 0x49; // "II"
  const ifd = t + u32(b, t + 4, le);
  if (ifd + 2 > end) return 1;
  const count = u16(b, ifd, le);
  for (let k = 0; k < count; k++) {
    const e = ifd + 2 + k * 12;
    if (e + 12 > end) break;
    if (u16(b, e, le) === 0x0112) return u16(b, e + 8, le);
  }
  return 1;
}

function jpegSize(b) {
  let i = 2;
  let orientation = 1;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null;
    const m = b[i + 1];
    if (m === 0xff) { i++; continue; }
    const len = u16(b, i + 2);
    if (m === 0xe1 && b[i + 4] === 0x45 && b[i + 5] === 0x78 && b[i + 6] === 0x69 && b[i + 7] === 0x66) {
      orientation = exifOrientation(b, i + 4, Math.min(b.length, i + 2 + len));
    }
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      const h = u16(b, i + 5), w = u16(b, i + 7);
      return orientation >= 5 && orientation <= 8 ? { width: h, height: w } : { width: w, height: h };
    }
    i += 2 + len;
  }
  return { needMore: true };
}

export function imageSize(buf) {
  const b = buf;
  if (b.length < 30) return null;
  if (b[0] === 0xff && b[1] === 0xd8) return jpegSize(b);
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { width: u32(b, 16), height: u32(b, 20) };
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const kind = b.toString("ascii", 12, 16);
    if (kind === "VP8X") return { width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
    if (kind === "VP8 ") return { width: u16(b, 26, true) & 0x3fff, height: u16(b, 28, true) & 0x3fff };
    if (kind === "VP8L") {
      const n = u32(b, 21, true);
      return { width: (n & 0x3fff) + 1, height: ((n >> 14) & 0x3fff) + 1 };
    }
  }
  return null;
}

async function range(url, from, to, timeout) {
  const r = await fetch(url, { headers: { Range: `bytes=${from}-${to}` }, signal: AbortSignal.timeout(timeout) });
  if (!r.ok) throw new Error(`range ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

/** { width, height } or null. Fetches 64 KB, then up to 512 KB for JPEGs with big headers. */
export async function probeImageSize(url, { timeout = 4000 } = {}) {
  let buf = await range(url, 0, 65535, timeout);
  let size = imageSize(buf);
  if (size?.needMore && buf.length >= 65536) {
    buf = Buffer.concat([buf, await range(url, 65536, 524287, timeout)]);
    size = imageSize(buf);
  }
  return size && size.width > 0 && size.height > 0 && !size.needMore ? { width: size.width, height: size.height } : null;
}
