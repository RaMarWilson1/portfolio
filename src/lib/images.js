// Vercel image-optimizer URLs for Blob photos. Widths/qualities must stay within
// the "images" block in vercel.json.

export const WIDTHS = [384, 640, 960, 1600, 2400];
export const OPTIMIZE = import.meta.env.PROD;
export const isBlobPhoto = (src) => /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/photography\//.test(src || "");

export const optimizedUrl = (src, w, q = 70) =>
  OPTIMIZE && isBlobPhoto(src) ? `/_vercel/image?url=${encodeURIComponent(src)}&w=${w}&q=${q}` : src;
