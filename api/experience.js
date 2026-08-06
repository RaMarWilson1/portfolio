// api/experience.js
// Vercel serverless function — fetches experience entries from Vercel Blob (experience/).
/* eslint-env node */

export default async function handler(req, res) {
  const { BLOB_READ_WRITE_TOKEN } = process.env; // eslint-disable-line no-undef
  if (!BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: "Missing BLOB_READ_WRITE_TOKEN environment variable" });
  }

  try {
    const listResponse = await fetch(
      "https://blob.vercel-storage.com?prefix=experience/&limit=100",
      { headers: { Authorization: `Bearer ${BLOB_READ_WRITE_TOKEN}` } }
    );
    if (!listResponse.ok) {
      const err = await listResponse.text();
      return res.status(listResponse.status).json({ error: err });
    }

    const listData = await listResponse.json();
    const jsonBlobs = listData.blobs.filter(
      (blob) => blob.pathname.endsWith(".json") && blob.pathname !== "experience/"
    );

    const experience = (
      await Promise.all(
        jsonBlobs.map(async (blob) => {
          try {
            const r = await fetch(blob.url);
            const e = await r.json();
            return { ...e, slug: blob.pathname };
          } catch {
            return null;
          }
        })
      )
    ).filter(Boolean);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    return res.status(200).json({ experience });
  } catch (err) {
    console.error("Experience fetch error:", err); // eslint-disable-line no-undef
    return res.status(500).json({ error: "Failed to fetch experience" });
  }
}
