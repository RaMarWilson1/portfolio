// api/photos.js
// Vercel serverless function — fetches photos from Vercel Blob
/* eslint-env node */

export default async function handler(req, res) {
  const { BLOB_READ_WRITE_TOKEN } = process.env; // eslint-disable-line no-undef

  if (!BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: "Missing BLOB_READ_WRITE_TOKEN environment variable" });
  }

  try {
    // List all blobs with the photography/ prefix
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

    // Filter out folder-level entries and map to photo objects
    const photos = data.blobs
      .filter((blob) => blob.pathname !== "photography/")
      .map((blob) => {
        const filename = blob.pathname.split("/").pop();
        const nameWithoutExt = filename.replace(/\.[^.]+$/, "").replace(/_/g, " ");

        // Parse category and title from filename convention: category_title.jpg
        // e.g. "cars_mustang-season.jpg" → category: cars, title: mustang season
        const parts = nameWithoutExt.split("_");
        const category = parts.length > 1 ? parts[0] : "misc";
        const title = parts.length > 1 ? parts.slice(1).join(" ") : nameWithoutExt;

        return {
          id: blob.pathname,
          src: blob.url,
          thumb: blob.url,
          category,
          title,
          location: "",
        };
      });

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    return res.status(200).json({ photos });
  } catch (err) {
    console.error("Vercel Blob fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch photos" });
  }
}