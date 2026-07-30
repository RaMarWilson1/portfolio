// api/experience-upload.js
// Password-gated experience publisher → writes a JSON entry to Vercel Blob (experience/).
/* eslint-env node */
import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { password, type, role, org, loc, period, note, points, order } = req.body || {};
  const secret = process.env.ADMIN_UPLOAD_SECRET;
  if (!secret || password !== secret) return res.status(401).json({ error: "Unauthorized" });
  if (!org) return res.status(400).json({ error: "Organization is required." });

  const slug =
    `${org} ${role || ""}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "entry";

  const entry = {
    type: type === "community" ? "community" : "role",
    role: role ? String(role) : "",
    org: String(org),
    loc: loc ? String(loc) : "",
    period: period ? String(period) : "",
    note: note ? String(note) : "",
    points: Array.isArray(points)
      ? points
      : points
      ? String(points).split("\n").map((s) => s.trim()).filter(Boolean)
      : [],
    order: Number(order) || 100,
  };

  try {
    const blob = await put(`experience/${slug}.json`, JSON.stringify(entry), {
      access: "public",
      contentType: "application/json",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return res.status(200).json({ ok: true, url: blob.url, slug });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to save experience" });
  }
}
