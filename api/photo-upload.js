// api/photo-upload.js
// Studio-only photo management → Vercel Blob (photography/).
//   POST    @vercel/blob client-upload handshake (large images bypass the 4.5MB
//           function limit). Tokens are only issued to a valid Studio session.
//   DELETE  { pathname }  remove a photo
import { handleUpload } from "@vercel/blob/client";
import { head, del, BlobNotFoundError } from "@vercel/blob";
import { getSession, isAllowedPath, isSameOrigin, noStore, rateLimit, requireStudio } from "./_studio-auth.js";

// "photography/<category> <name>.<ext>" — the gallery parses the category from the first word.
const UPLOAD_PATH_RE = /^photography\/[a-z0-9-]{1,32} [A-Za-z0-9 _().-]{1,120}\.(jpe?g|png|webp|heic)$/;
// Deletes also cover older files added by scripts/upload.js, so only require a single segment.
const EXISTING_PATH_RE = /^photography\/[^/\\]{1,200}$/;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function deletePhoto(req, res) {
  if (!requireStudio(req, res, { methods: ["DELETE"] })) return;
  if (!rateLimit(req, res, "delete")) return;
  const pathname = String(req.body?.pathname || "");
  if (!EXISTING_PATH_RE.test(pathname) || !isAllowedPath(pathname) || !pathname.startsWith("photography/")) {
    return res.status(400).json({ error: "Invalid photo." });
  }
  try {
    const blob = await head(pathname, { token: process.env.BLOB_READ_WRITE_TOKEN });
    await del(blob.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return res.status(200).json({ ok: true, pathname });
  } catch (err) {
    if (err instanceof BlobNotFoundError) return res.status(404).json({ error: "Photo not found." });
    console.error("photo delete error:", err?.message || err);
    return res.status(500).json({ error: "Could not delete the photo." });
  }
}

export default async function handler(req, res) {
  noStore(res);
  if (req.method === "DELETE") return deletePhoto(req, res);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Only the browser's token handshake is accepted — no upload-completed callback is
  // registered, so there is no unauthenticated webhook path into this endpoint.
  const body = req.body && typeof req.body === "object" ? req.body : null;
  if (!isSameOrigin(req)) return res.status(403).json({ error: "Forbidden" });
  if (!getSession(req)) return res.status(401).json({ error: "Unauthorized" });
  if (!rateLimit(req, res, "photoToken")) return;
  if (!body || body.type !== "blob.generate-client-token") return res.status(400).json({ error: "Bad request" });

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!UPLOAD_PATH_RE.test(pathname) || !isAllowedPath(pathname)) throw new HttpError(400, "Invalid file name or type.");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
          addRandomSuffix: false,
          allowOverwrite: false, // never silently replace an existing photo
          maximumSizeInBytes: 25 * 1024 * 1024,
        };
      },
    });
    return res.status(200).json(jsonResponse);
  } catch (err) {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    console.error("photo-upload error:", err?.message || err);
    return res.status(400).json({ error: "Upload failed." });
  }
}
