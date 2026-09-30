import React, { useState } from "react";
import { OPTIMIZE, WIDTHS, isBlobPhoto, optimizedUrl } from "./images";

// Photos live in Vercel Blob as full-size originals (~5 MB each). In production
// they're served through Vercel's image optimizer (configured in vercel.json →
// "images"), which resizes and converts them to AVIF/WebP. Widths and qualities
// here must stay within that config. If the optimizer is unavailable (local dev,
// or a failed transform) the <img> falls back to the original file.

export default function BlobImage({ src, widths = [384, 640, 960], sizes, quality = 70, alt, onError, ...rest }) {
  const [failed, setFailed] = useState(false);
  const useOptimizer = OPTIMIZE && !failed && isBlobPhoto(src);
  const ws = widths.filter((w) => WIDTHS.includes(w));
  return (
    <img
      {...rest}
      alt={alt}
      src={useOptimizer ? optimizedUrl(src, ws[ws.length - 1], quality) : src}
      srcSet={useOptimizer ? ws.map((w) => `${optimizedUrl(src, w, quality)} ${w}w`).join(", ") : undefined}
      sizes={useOptimizer ? sizes : undefined}
      onError={(e) => {
        if (useOptimizer) setFailed(true);
        else onError?.(e);
      }}
    />
  );
}
