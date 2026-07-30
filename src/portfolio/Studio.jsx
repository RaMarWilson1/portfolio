import React, { useState } from "react";
import { Link } from "react-router-dom";
import { upload } from "@vercel/blob/client";

// Private admin page: drag-drop photos + write poems, straight to Vercel Blob.
// Gated by a password checked server-side (ADMIN_UPLOAD_SECRET). Not linked anywhere.

const C = {
  night: "#070A18",
  panel: "#111935",
  gold: "#F2B85C",
  coral: "#F2765C",
  ink: "#EEF1FA",
  muted: "#A6AFCE",
  line: "rgba(255,255,255,.13)",
  mono: 'ui-monospace,"SF Mono",Menlo,"Courier New",monospace',
};
const label = { fontFamily: C.mono, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 7 };
const input = { width: "100%", padding: "11px 13px", borderRadius: 10, border: `1px solid ${C.line}`, background: "rgba(255,255,255,.03)", color: C.ink, fontSize: 15, fontFamily: "inherit", outline: "none" };
const btn = { fontFamily: C.mono, textTransform: "uppercase", letterSpacing: ".1em", fontSize: 12, fontWeight: 600, padding: "12px 18px", borderRadius: 10, border: 0, cursor: "pointer", background: `linear-gradient(120deg,${C.gold},${C.coral})`, color: C.night };
const card = { border: `1px solid ${C.line}`, borderRadius: 16, background: C.panel, padding: "clamp(20px,3vw,30px)" };

export default function Studio() {
  const [pw, setPw] = useState(sessionStorage.getItem("studio_pw") || "");
  const [unlocked, setUnlocked] = useState(!!sessionStorage.getItem("studio_pw"));

  // photo state
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState([]);
  const [photoStatus, setPhotoStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  // poem state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [date, setDate] = useState("");
  const [featured, setFeatured] = useState(false);
  const [poemStatus, setPoemStatus] = useState("");
  const [saving, setSaving] = useState(false);

  // experience state
  const [expType, setExpType] = useState("role");
  const [expRole, setExpRole] = useState("");
  const [expOrg, setExpOrg] = useState("");
  const [expLoc, setExpLoc] = useState("");
  const [expPeriod, setExpPeriod] = useState("");
  const [expPoints, setExpPoints] = useState("");
  const [expOrder, setExpOrder] = useState("");
  const [expStatus, setExpStatus] = useState("");
  const [savingExp, setSavingExp] = useState(false);

  const unlock = () => {
    if (!pw.trim()) return;
    sessionStorage.setItem("studio_pw", pw);
    setUnlocked(true);
  };

  async function uploadPhotos() {
    if (!files.length) { setPhotoStatus("Pick at least one image."); return; }
    const cat = (category.trim().split(/\s+/)[0] || "misc").toLowerCase();
    setUploading(true);
    setPhotoStatus(`Uploading 0 / ${files.length}…`);
    let done = 0;
    for (const file of files) {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const base = file.name.replace(/\.[^.]+$/, "");
      const pathname = `photography/${cat} ${base}.${ext}`;
      try {
        await upload(pathname, file, { access: "public", handleUploadUrl: "/api/photo-upload", clientPayload: pw });
        done += 1;
        setPhotoStatus(`Uploading ${done} / ${files.length}…`);
      } catch (err) {
        setUploading(false);
        setPhotoStatus(`Failed on “${file.name}”: ${err.message}. ${err.message.includes("Unauthorized") ? "Check your password." : ""}`);
        return;
      }
    }
    setUploading(false);
    setFiles([]);
    setPhotoStatus(`Done — ${done} photo${done === 1 ? "" : "s"} uploaded. They’ll appear on the site within a minute.`);
  }

  async function publishPoem() {
    if (!title.trim() || !body.trim()) { setPoemStatus("Title and body are required."); return; }
    setSaving(true);
    setPoemStatus("Saving…");
    try {
      const r = await fetch("/api/poem-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, title, body, date, featured }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      setPoemStatus(`Published “${title}”. It’ll appear on /poetry within a minute.`);
      setTitle(""); setBody(""); setDate(""); setFeatured(false);
    } catch (err) {
      setPoemStatus(`Failed: ${err.message}${String(err.message).includes("Unauthorized") ? " — check your password." : ""}`);
    } finally {
      setSaving(false);
    }
  }

  async function publishExperience() {
    if (!expOrg.trim()) { setExpStatus("Organization is required."); return; }
    setSavingExp(true);
    setExpStatus("Saving…");
    try {
      const r = await fetch("/api/experience-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, type: expType, role: expRole, org: expOrg, loc: expLoc, period: expPeriod, points: expPoints, order: expOrder }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      setExpStatus(`Added “${expRole || expOrg}”. It’ll appear on the site within a minute.`);
      setExpRole(""); setExpOrg(""); setExpLoc(""); setExpPeriod(""); setExpPoints(""); setExpOrder("");
    } catch (err) {
      setExpStatus(`Failed: ${err.message}${String(err.message).includes("Unauthorized") ? " — check your password." : ""}`);
    } finally {
      setSavingExp(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.night, color: C.ink, fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(40px,8vh,90px) clamp(20px,5vw,40px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <h1 style={{ fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-.02em", margin: 0 }}>Studio</h1>
          <Link to="/" style={{ ...label, marginBottom: 0, color: C.gold, textDecoration: "none" }}>← Back to site</Link>
        </div>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, marginTop: 4, marginBottom: 30 }}>
          Add photos and poems from anywhere. They upload straight to storage and show up on the site on their own — no code, no deploy.
        </p>

        {!unlocked ? (
          <div style={{ ...card, maxWidth: 420 }}>
            <label style={label}>Password</label>
            <input
              style={input}
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && unlock()}
              placeholder="Enter to unlock"
              autoFocus
            />
            <button style={{ ...btn, marginTop: 14, width: "100%" }} onClick={unlock}>Unlock</button>
            <p style={{ color: C.muted, fontSize: 12, marginTop: 12, lineHeight: 1.5 }}>
              This is the same value set as <code style={{ color: C.gold }}>ADMIN_UPLOAD_SECRET</code> in your hosting settings.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* PHOTOS */}
            <div style={card}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Add photos</h2>
              <p style={{ color: C.muted, fontSize: 13, margin: "0 0 18px" }}>
                Category becomes the filter tag on the gallery (one word, e.g. <em>cars</em>, <em>street</em>, <em>nature</em>).
              </p>
              <label style={label}>Category</label>
              <input style={input} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="nature" />
              <label style={{ ...label, marginTop: 16 }}>Images</label>
              <input
                style={{ ...input, padding: 10 }}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => { setFiles(Array.from(e.target.files || [])); setPhotoStatus(""); }}
              />
              {files.length > 0 && <p style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>{files.length} file{files.length === 1 ? "" : "s"} selected</p>}
              <button style={{ ...btn, marginTop: 16, opacity: uploading ? 0.6 : 1 }} onClick={uploadPhotos} disabled={uploading}>
                {uploading ? "Uploading…" : "Upload photos"}
              </button>
              {photoStatus && <p style={{ color: photoStatus.startsWith("Failed") ? C.coral : C.gold, fontSize: 13, marginTop: 14, lineHeight: 1.5 }}>{photoStatus}</p>}
            </div>

            {/* POEMS */}
            <div style={card}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 18px" }}>Write a poem</h2>
              <label style={label}>Title</label>
              <input style={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Coffee Coded Days" />
              <label style={{ ...label, marginTop: 16 }}>Body</label>
              <textarea
                style={{ ...input, minHeight: 220, resize: "vertical", lineHeight: 1.6, fontFamily: 'Georgia,"Times New Roman",serif' }}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={"Line breaks are kept exactly as you type them.\n\nLeave a blank line for a stanza break."}
              />
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end", marginTop: 16 }}>
                <div style={{ flex: "1 1 160px" }}>
                  <label style={label}>Date (optional)</label>
                  <input style={input} value={date} onChange={(e) => setDate(e.target.value)} placeholder="2026" />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 9, color: C.ink, fontSize: 14, paddingBottom: 11, cursor: "pointer" }}>
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} style={{ width: 17, height: 17, accentColor: C.gold }} />
                  Feature this poem
                </label>
              </div>
              <button style={{ ...btn, marginTop: 18, opacity: saving ? 0.6 : 1 }} onClick={publishPoem} disabled={saving}>
                {saving ? "Saving…" : "Publish poem"}
              </button>
              {poemStatus && <p style={{ color: poemStatus.startsWith("Failed") ? C.coral : C.gold, fontSize: 13, marginTop: 14, lineHeight: 1.5 }}>{poemStatus}</p>}
            </div>

            {/* EXPERIENCE */}
            <div style={card}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Add experience</h2>
              <p style={{ color: C.muted, fontSize: 13, margin: "0 0 18px" }}>
                A role or a community/membership. Higher <em>order</em> shows first (leave blank to add near the top).
              </p>
              <label style={label}>Type</label>
              <select style={input} value={expType} onChange={(e) => setExpType(e.target.value)}>
                <option value="role">Role / job</option>
                <option value="community">Community / membership</option>
              </select>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 16 }}>
                <div style={{ flex: "1 1 200px" }}>
                  <label style={label}>Organization</label>
                  <input style={input} value={expOrg} onChange={(e) => setExpOrg(e.target.value)} placeholder="Medidata Solutions" />
                </div>
                {expType === "role" && (
                  <div style={{ flex: "1 1 200px" }}>
                    <label style={label}>Role / title</label>
                    <input style={input} value={expRole} onChange={(e) => setExpRole(e.target.value)} placeholder="Software Engineer Intern" />
                  </div>
                )}
              </div>
              {expType === "role" && (
                <>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 16 }}>
                    <div style={{ flex: "1 1 160px" }}>
                      <label style={label}>Location</label>
                      <input style={input} value={expLoc} onChange={(e) => setExpLoc(e.target.value)} placeholder="New York City" />
                    </div>
                    <div style={{ flex: "1 1 160px" }}>
                      <label style={label}>Period</label>
                      <input style={input} value={expPeriod} onChange={(e) => setExpPeriod(e.target.value)} placeholder="Summer 2025" />
                    </div>
                  </div>
                  <label style={{ ...label, marginTop: 16 }}>Bullets (one per line)</label>
                  <textarea
                    style={{ ...input, minHeight: 110, resize: "vertical", lineHeight: 1.5 }}
                    value={expPoints}
                    onChange={(e) => setExpPoints(e.target.value)}
                    placeholder={"Built internal tools in React.\nWrote API documentation."}
                  />
                </>
              )}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end", marginTop: 16 }}>
                <div style={{ flex: "0 1 130px" }}>
                  <label style={label}>Order (optional)</label>
                  <input style={input} value={expOrder} onChange={(e) => setExpOrder(e.target.value)} placeholder="90" />
                </div>
              </div>
              <button style={{ ...btn, marginTop: 18, opacity: savingExp ? 0.6 : 1 }} onClick={publishExperience} disabled={savingExp}>
                {savingExp ? "Saving…" : "Add experience"}
              </button>
              {expStatus && <p style={{ color: expStatus.startsWith("Failed") ? C.coral : C.gold, fontSize: 13, marginTop: 14, lineHeight: 1.5 }}>{expStatus}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
