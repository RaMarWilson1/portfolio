// api/photos.js
// Vercel serverless function — fetches photos from Vercel Blob
/* eslint-env node */

export default async function handler(req, res) {
  const { BLOB_READ_WRITE_TOKEN } = process.env; // eslint-disable-line no-undef

  if (!BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: "Missing BLOB_READ_WRITE_TOKEN environment variable" });
  }

  try {
    const response = await fetch(
      "https://blob.vercel-storage.com?prefix=photography/&limit=100",
      {
        headers: {
          Authorization: `Bearer ${BLOB_READ_WRITE_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();

    const photos = data.blobs
      .filter((blob) => blob.pathname !== "photography/")
      .map((blob) => {
        const filename = blob.pathname.split("/").pop();
        const nameWithoutExt = filename.replace(/\.[^.]+$/, "").replace(/_/g, " ");

        const parts = nameWithoutExt.split(" ");
        const category = parts.length > 1 ? parts[0] : "misc";
        const title = parts.length > 1 ? parts.slice(1).join(" ") : nameWithoutExt;

        // Use Vercel image optimization for thumbnails — auto WebP, resized
        const encodedUrl = encodeURIComponent(blob.url);
        const thumb = `/_vercel/image?url=${encodedUrl}&w=400&q=70`;
        const src   = `/_vercel/image?url=${encodedUrl}&w=1200&q=85`;

        return {
          id: blob.pathname,
          src,
          thumb,
          category,
          title,
          location: "",
        };
      });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    return res.status(200).json({ photos });
  } catch (err) {
    console.error("Vercel Blob fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch photos" });
  }
}