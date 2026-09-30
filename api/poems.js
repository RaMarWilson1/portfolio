// api/poems.js
// Public read: { poems, series }.
//   poems  — general chronology: featured first, then newest publishedAt
//   series — No Clean Version settings (defaults when none are saved)
// Reserved metadata (poetry/_*.json) is never returned as a poem.
import { allowRead } from "./_studio-auth.js";
import { loadPoetry } from "./_poetry.js";

export default async function handler(req, res) {
  if (!allowRead(req, res)) return;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("poems: missing BLOB_READ_WRITE_TOKEN");
    return res.status(503).json({ error: "Poems are unavailable right now." });
  }

  try {
    const { poems, series } = await loadPoetry();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");
    return res.status(200).json({ poems, series });
  } catch (err) {
    console.error("poems: fetch failed:", err?.message || err);
    return res.status(502).json({ error: "Failed to fetch poems" });
  }
}
