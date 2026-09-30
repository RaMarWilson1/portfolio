import React, { useCallback, useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import BlobImage from "../../lib/BlobImage";
import { C, btn, card, confirmDelete, dangerBtn, fresh, h2, hint, input, label, listHead, statusStyle } from "./shared";

// Must match the server's allowed pattern in api/photo-upload.js.
const cleanBase = (name) =>
  name
    .replace(/\.[^.]+$/, "")
    .replace(/[^A-Za-z0-9 _().-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "photo";

export default function PhotoPanel({ request, verifySession }) {
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState(null);
  const [listError, setListError] = useState("");
  const [deleting, setDeleting] = useState(null); // photo id being deleted

  const load = useCallback(async () => {
    try {
      const d = await request(fresh("/api/photos"));
      setPhotos(d.photos || []);
      setListError("");
    } catch (err) {
      setListError(`Could not load photos: ${err.message}`);
    }
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  async function uploadPhotos() {
    if (uploading) return;
    if (!files.length) return setStatus("Failed: pick at least one image.");
    const cat = (category.trim().split(/\s+/)[0] || "misc").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 32) || "misc";
    setUploading(true);
    setStatus(`Uploading 0 / ${files.length}…`);
    let done = 0;
    for (const file of files) {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const pathname = `photography/${cat} ${cleanBase(file.name)}.${ext}`;
      try {
        await upload(pathname, file, { access: "public", handleUploadUrl: "/api/photo-upload" });
        done += 1;
        setStatus(`Uploading ${done} / ${files.length}…`);
      } catch (err) {
        setUploading(false);
        if (!(await verifySession())) return; // session expired → Studio locks itself
        const dup = /already exists/i.test(err.message);
        setStatus(
          dup
            ? `Failed on “${file.name}”: a photo with that name already exists. Rename the file or delete the old one first.`
            : `Failed on “${file.name}”: ${err.message}`
        );
        if (done) load();
        return;
      }
    }
    setUploading(false);
    setFiles([]);
    setStatus(`Done — ${done} photo${done === 1 ? "" : "s"} uploaded. They’ll appear on the site within a minute.`);
    load();
  }

  async function remove(p) {
    const name = p.id.replace(/^photography\//, "");
    if (deleting || !confirmDelete("the photo", name, p.id)) return;
    setDeleting(p.id);
    try {
      await request("/api/photo-upload", { method: "DELETE", body: { pathname: p.id } });
      setStatus(`Deleted ${name}.`);
      await load();
    } catch (err) {
      setStatus(`Failed: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section style={card} aria-labelledby="studio-photos-h">
      <h2 id="studio-photos-h" style={h2}>Add photos</h2>
      <p style={hint}>
        Category becomes the filter tag on the gallery (one word, e.g. <em>cars</em>, <em>street</em>, <em>nature</em>).
      </p>
      <label style={label} htmlFor="photo-cat">Category</label>
      <input id="photo-cat" style={input} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="nature" />
      <label style={{ ...label, marginTop: 16 }} htmlFor="photo-files">Images</label>
      <input
        id="photo-files"
        style={{ ...input, padding: 10 }}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        onChange={(e) => { setFiles(Array.from(e.target.files || [])); setStatus(""); }}
      />
      {files.length > 0 && <p style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>{files.length} file{files.length === 1 ? "" : "s"} selected</p>}
      <button style={{ ...btn, marginTop: 16, opacity: uploading ? 0.6 : 1 }} onClick={uploadPhotos} disabled={uploading}>
        {uploading ? "Uploading…" : "Upload photos"}
      </button>
      {status && <p role="status" style={statusStyle(status)}>{status}</p>}

      <span style={listHead}>Published photos{photos ? ` · ${photos.length}` : ""}</span>
      {listError && <p style={statusStyle(listError)}>{listError}</p>}
      {!photos && !listError && <p style={{ color: C.muted, fontSize: 13 }}>Loading…</p>}
      {photos && photos.length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>No photos yet.</p>}
      {photos && photos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12 }}>
          {photos.map((p) => (
            <figure key={p.id} style={{ margin: 0, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", background: "rgba(255,255,255,.02)" }}>
              <BlobImage src={p.thumb} alt="" widths={[384]} sizes="150px" loading="lazy" decoding="async" style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
              <figcaption style={{ padding: "8px 10px 10px" }}>
                <div style={{ fontFamily: C.mono, fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: C.gold }}>{p.category}</div>
                <div title={p.id} style={{ fontSize: 12.5, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.id.replace(/^photography\//, "")}
                </div>
                <button
                  style={{ ...dangerBtn, marginTop: 8, opacity: deleting === p.id ? 0.5 : 1 }}
                  onClick={() => remove(p)}
                  disabled={!!deleting}
                  aria-label={`Delete ${p.id.replace(/^photography\//, "")}`}
                >
                  {deleting === p.id ? "Deleting…" : "Delete"}
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
