import React, { useCallback, useEffect, useState } from "react";
import { C, btn, card, confirmDelete, dangerBtn, fmtDate, fresh, ghostBtn, h2, hint, input, label, listHead, row, smallBtn, statusStyle } from "./shared";
import { PLATFORMS, formatEpisode } from "../../lib/ncv";

const EMPTY = {
  slug: null, title: "", body: "", date: "", featured: false,
  // No Clean Version (all optional)
  seriesNumber: "", readingUrl: "", readingPlatform: "", readingPublishedAt: "",
};
const toDateInput = (iso) => (iso && !Number.isNaN(Date.parse(iso)) ? new Date(iso).toISOString().slice(0, 10) : "");

export default function PoemPanel({ request }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [poems, setPoems] = useState(null);
  const [listError, setListError] = useState("");
  const [deleting, setDeleting] = useState(null); // slug being deleted

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const load = useCallback(async () => {
    try {
      const d = await request(fresh("/api/poems"));
      setPoems(d.poems || []);
      setListError("");
    } catch (err) {
      setListError(`Could not load poems: ${err.message}`);
    }
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  async function publish() {
    if (saving) return;
    if (!form.title.trim() || !form.body.trim()) return setStatus("Failed: title and body are required.");
    setSaving(true);
    setStatus("Saving…");
    try {
      const { slug, ...rest } = form;
      await request("/api/poem-upload", { method: "POST", body: slug ? { slug, ...rest } : rest });
      setStatus(`${slug ? "Updated" : "Published"} “${form.title}”. It’ll appear on /poetry within a minute.`);
      setForm(EMPTY);
      load();
    } catch (err) {
      setStatus(`Failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  function edit(p) {
    setForm({
      slug: p.slug,
      title: p.title,
      body: p.body,
      date: p.date || "",
      featured: !!p.featured,
      seriesNumber: p.seriesNumber ? String(p.seriesNumber) : "",
      readingUrl: p.readingUrl || "",
      readingPlatform: p.readingPlatform || "",
      readingPublishedAt: toDateInput(p.readingPublishedAt),
    });
    setStatus("");
    window.scrollTo({ top: document.getElementById("studio-poems")?.offsetTop ?? 0, behavior: "smooth" });
  }

  async function remove(p) {
    if (deleting || !confirmDelete("the poem", p.title, p.id)) return;
    setDeleting(p.slug);
    try {
      await request("/api/poem-upload", { method: "DELETE", body: { slug: p.slug } });
      setStatus(`Deleted “${p.title}”.`);
      if (form.slug === p.slug) setForm(EMPTY);
      await load();
    } catch (err) {
      setStatus(`Failed: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  }

  const nextEpisode = (poems || []).reduce((m, p) => Math.max(m, p.seriesNumber || 0), 0) + 1;

  return (
    <section style={card} id="studio-poems" aria-labelledby="studio-poems-h">
      <h2 id="studio-poems-h" style={{ ...h2, marginBottom: 18 }}>
        {form.slug ? <>Edit poem <span style={{ color: C.muted, fontWeight: 400 }}>· {form.slug}</span></> : "Write a poem"}
      </h2>
      <label style={label} htmlFor="poem-title">Title</label>
      <input id="poem-title" style={input} value={form.title} onChange={set("title")} placeholder="Coffee Coded Days" maxLength={200} />
      <label style={{ ...label, marginTop: 16 }} htmlFor="poem-body">Body</label>
      <textarea
        id="poem-body"
        style={{ ...input, minHeight: 220, resize: "vertical", lineHeight: 1.6, fontFamily: 'Georgia,"Times New Roman",serif' }}
        value={form.body}
        onChange={set("body")}
        placeholder={"Line breaks are kept exactly as you type them.\n\nLeave a blank line for a stanza break."}
      />
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end", marginTop: 16 }}>
        <div style={{ flex: "1 1 160px" }}>
          <label style={label} htmlFor="poem-date">Display date (optional)</label>
          <input id="poem-date" style={input} value={form.date} onChange={set("date")} placeholder="2026" maxLength={40} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 9, color: C.ink, fontSize: 14, paddingBottom: 11, cursor: "pointer" }}>
          <input type="checkbox" checked={form.featured} onChange={set("featured")} style={{ width: 17, height: 17, accentColor: C.gold }} />
          Feature this poem
        </label>
      </div>
      <fieldset style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px 16px", margin: "20px 0 0" }}>
        <legend style={{ ...label, padding: "0 6px", marginBottom: 0, color: C.gold }}>No Clean Version (optional)</legend>
        <p style={{ ...hint, margin: "0 0 12px" }}>Give the poem an episode number when it becomes a recorded reading. A video link is optional.</p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div style={{ flex: "0 1 130px" }}>
            <label style={label} htmlFor="poem-ep">Episode #</label>
            <input
              id="poem-ep"
              style={input}
              type="number"
              min={1}
              max={9999}
              step={1}
              inputMode="numeric"
              value={form.seriesNumber}
              onChange={set("seriesNumber")}
              placeholder={String(nextEpisode)}
              aria-describedby="poem-ep-hint"
            />
          </div>
          <div style={{ flex: "0 1 160px" }}>
            <label style={label} htmlFor="poem-platform">Platform</label>
            <select id="poem-platform" style={input} value={form.readingPlatform} onChange={set("readingPlatform")}>
              <option value="">Auto-detect</option>
              {Object.entries(PLATFORMS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div style={{ flex: "0 1 170px" }}>
            <label style={label} htmlFor="poem-rdate">Reading date</label>
            <input id="poem-rdate" style={input} type="date" value={form.readingPublishedAt} onChange={set("readingPublishedAt")} />
          </div>
        </div>
        <p id="poem-ep-hint" style={{ color: C.muted, fontSize: 12, margin: "8px 0 0" }}>
          {form.seriesNumber ? `Shows as NCV — ${formatEpisode(Number(form.seriesNumber) || 0)}.` : `Next free episode: ${formatEpisode(nextEpisode)}. Leave blank if this poem isn’t a reading.`}
        </p>
        <label style={{ ...label, marginTop: 14 }} htmlFor="poem-rurl">Reading / video URL</label>
        <input id="poem-rurl" style={input} type="url" value={form.readingUrl} onChange={set("readingUrl")} placeholder="https://www.instagram.com/reel/…" />
      </fieldset>

      <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <button style={{ ...btn, opacity: saving ? 0.6 : 1 }} onClick={publish} disabled={saving}>
          {saving ? "Saving…" : form.slug ? "Save changes" : "Publish poem"}
        </button>
        {form.slug && (
          <button style={ghostBtn} onClick={() => { setForm(EMPTY); setStatus(""); }}>Cancel edit</button>
        )}
      </div>
      {status && <p role="status" style={statusStyle(status)}>{status}</p>}

      <span style={listHead}>Published poems{poems ? ` · ${poems.length}` : ""}</span>
      {listError && <p style={statusStyle(listError)}>{listError}</p>}
      {!poems && !listError && <p style={{ color: C.muted, fontSize: 13 }}>Loading…</p>}
      {poems && poems.length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>No poems yet.</p>}
      {poems && poems.map((p) => (
        <div key={p.id} style={row}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.title}
              {p.seriesNumber && <span style={{ marginLeft: 8, fontFamily: C.mono, fontSize: 10, color: C.gold }}>NCV — {formatEpisode(p.seriesNumber)}</span>}
              {p.readingUrl && <span style={{ marginLeft: 6, fontFamily: C.mono, fontSize: 10, color: C.muted }}>▶ reading</span>}
              {p.featured && <span style={{ marginLeft: 8, fontFamily: C.mono, fontSize: 9.5, letterSpacing: ".1em", color: C.night, background: C.gold, padding: "2px 6px", borderRadius: 4 }}>FEATURED</span>}
            </div>
            <div style={{ fontFamily: C.mono, fontSize: 10.5, letterSpacing: ".06em", color: C.muted, marginTop: 3 }}>
              {p.date ? `Shown as ${p.date} · ` : ""}Published {fmtDate(p.publishedAt)}
            </div>
          </div>
          <button style={smallBtn} onClick={() => edit(p)} aria-label={`Edit “${p.title}”`}>Edit</button>
          <button
            style={{ ...dangerBtn, opacity: deleting === p.slug ? 0.5 : 1 }}
            onClick={() => remove(p)}
            disabled={!!deleting}
            aria-label={`Delete “${p.title}”`}
          >
            {deleting === p.slug ? "Deleting…" : "Delete"}
          </button>
        </div>
      ))}
    </section>
  );
}
