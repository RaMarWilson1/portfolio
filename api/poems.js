// api/poems.js
// Vercel serverless function — fetches poems from Vercel Blob
/* eslint-env node */

export default async function handler(req, res) {
  const { BLOB_READ_WRITE_TOKEN } = process.env; // eslint-disable-line no-undef

  if (!BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: "Missing BLOB_READ_WRITE_TOKEN environment variable" });
  }

  try {
    // List all blobs with the poetry/ prefix
    const listResponse = await fetch(
      "https://blob.vercel-storage.com?prefix=poetry/&limit=100",
      {
        headers: {
          Authorization: `Bearer ${BLOB_READ_WRITE_TOKEN}`,
        },
      }
    );

    if (!listResponse.ok) {
      const err = await listResponse.text();
      return res.status(listResponse.status).json({ error: err });
    }

    const listData = await listResponse.json();

    // Filter to only JSON files
    const jsonBlobs = listData.blobs.filter(
      (blob) => blob.pathname.endsWith(".json") && blob.pathname !== "poetry/"
    );

    // Fetch each poem JSON file
    const poems = await Promise.all(
      jsonBlobs.map(async (blob) => {
        try {
          const poemRes = await fetch(blob.url);
          const poem = await poemRes.json();
          return {
            id: blob.pathname,
            title: poem.title ?? "Untitled",
            body: poem.body ?? "",
            date: poem.date ?? "",
            featured: poem.featured ?? false,
          };
        } catch {
          return null;
        }
      })
    );

    // Filter out failed fetches, sort featured first
    const validPoems = poems
      .filter(Boolean)
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    return res.status(200).json({ poems: validPoems });
  } catch (err) {
    console.error("Poems fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch poems" });
  }
}