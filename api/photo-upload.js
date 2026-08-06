// api/photo-upload.js
// Password-gated client-upload handler for photos → Vercel Blob (photography/).
// Uses @vercel/blob client-upload so large images bypass the 4.5MB function limit.
/* eslint-env node */
import { handleUpload } from "@vercel/blob/client";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const secret = process.env.ADMIN_UPLOAD_SECRET;
        if (!secret || clientPayload !== secret) throw new Error("Unauthorized");
        if (!pathname.startsWith("photography/")) throw new Error("Invalid path");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
          addRandomSuffix: false,
          allowOverwrite: true,
          maximumSizeInBytes: 25 * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {},
    });
    return res.status(200).json(jsonResponse);
  } catch (err) {
    return res.status(400).json({ error: err.message || "Upload failed" });
  }
}
