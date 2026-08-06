// api/poem-upload.js
// Password-gated poem publisher → writes a JSON file to Vercel Blob (poetry/).
/* eslint-env node */
import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { password, title, body, date, featured } = req.body || {};
  const secret = process.env.ADMIN_UPLOAD_SECRET;
  if (!secret || password !== secret) return res.status(401).json({ error: "Unauthorized" });
  if (!title || !body) return res.status(400).json({ error: "Title and body are required." });

  const slug =
    String(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "poem";

  const payload = JSON.stringify({
    title: String(title),
    body: String(body),
    date: date ? String(date) : String(new Date().getFullYear()),
    featured: !!featured,
  });

  try {
    const blob = await put(`poetry/${slug}.json`, payload, {
      access: "public",
      contentType: "application/json",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return res.status(200).json({ ok: true, url: blob.url, slug });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to save poem" });
  }
}
