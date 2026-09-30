import React, { useCallback, useEffect, useState } from "react";
import { C, btn, card, fresh, ghostBtn, h2, hint, input, label, smallBtn, dangerBtn, statusStyle } from "./shared";

// No Clean Version settings — stored as the reserved poetry/_series.json record.
const MAX_LINKS = 6;

export default function SeriesPanel({ request }) {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await request(fresh("/api/poems"));
      const s = d.series || {};
      setForm({
        title: s.title || "",
        subtitle: s.subtitle || "",
        description: s.description || "",
        numberingEnabled: s.numberingEnabled !== false,
        links: (s.links || []).map((l) => ({ label: l.label, url: l.url })),
      });
    } catch (err) {
      setStatus(`Could not load settings: ${err.message}`);
    }
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const setLink = (i, k) => (e) =>
    setForm((f) => ({ ...f, links: f.links.map((l, j) => (j === i ? { ...l, [k]: e.target.value } : l)) }));

  async function save() {
    if (saving) return;
    setSaving(true);
    setStatus("Saving…");
    try {
      const links = form.links.filter((l) => l.url.trim());
      const d = await request("/api/poem-upload", { method: "POST", body: { kind: "series", ...form, links } });
      setForm((f) => ({ ...f, ...d.series, links: d.series.links }));
      setStatus("Saved. /poetry picks this up within a minute.");
    } catch (err) {
      setStatus(`Failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return (
      <section style={card} aria-labelledby="studio-series-h">
        <h2 id="studio-series-h" style={h2}>No Clean Version</h2>
        <p style={{ color: C.muted, fontSize: 13 }}>{status || "Loading…"}</p>
      </section>
    );
  }

  return (
    <section style={card} aria-labelledby="studio-series-h">
      <h2 id="studio-series-h" style={h2}>No Clean Version · series settings</h2>
      <p style={hint}>How the poetry series introduces itself on /poetry and the homepage. Blank fields fall back to the defaults.</p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 220px" }}>
          <label style={label} htmlFor="series-title">Series title</label>
          <input id="series-title" style={input} value={form.title} onChange={set("title")} placeholder="No Clean Version" maxLength={60} />
        </div>
        <div style={{ flex: "1 1 220px" }}>
          <label style={label} htmlFor="series-sub">Subtitle</label>
          <input id="series-sub" style={input} value={form.subtitle} onChange={set("subtitle")} placeholder="Poetry by Ra’Mar Wilson" maxLength={120} />
        </div>
      </div>
      <label style={{ ...label, marginTop: 16 }} htmlFor="series-desc">Short description</label>
      <textarea
        id="series-desc"
        style={{ ...input, minHeight: 70, resize: "vertical", lineHeight: 1.5 }}
        value={form.description}
        onChange={set("description")}
        placeholder="Written raw. Read the same way."
        maxLength={400}
      />
      <label style={{ display: "flex", alignItems: "center", gap: 9, color: C.ink, fontSize: 14, marginTop: 14, cursor: "pointer" }}>
        <input type="checkbox" checked={form.numberingEnabled} onChange={set("numberingEnabled")} style={{ width: 17, height: 17, accentColor: C.gold }} />
        Show episode numbers (NCV — 001)
      </label>

      <span style={{ ...label, marginTop: 20 }}>Reading-series links (optional)</span>
      {form.links.map((l, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <input aria-label={`Link ${i + 1} label`} style={{ ...input, flex: "0 1 150px" }} value={l.label} onChange={setLink(i, "label")} placeholder="Instagram" maxLength={40} />
          <input aria-label={`Link ${i + 1} URL`} style={{ ...input, flex: "1 1 240px" }} value={l.url} onChange={setLink(i, "url")} placeholder="https://www.instagram.com/…" />
          <button
            style={dangerBtn}
            onClick={() => setForm((f) => ({ ...f, links: f.links.filter((_, j) => j !== i) }))}
            aria-label={`Remove link ${i + 1}`}
          >
            Remove
          </button>
        </div>
      ))}
      {form.links.length < MAX_LINKS && (
        <button style={smallBtn} onClick={() => setForm((f) => ({ ...f, links: [...f.links, { label: "", url: "" }] }))}>+ Add link</button>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
        <button style={{ ...btn, opacity: saving ? 0.6 : 1 }} onClick={save} disabled={saving}>{saving ? "Saving…" : "Save settings"}</button>
        <button style={ghostBtn} onClick={() => { setStatus(""); load(); }} disabled={saving}>Discard changes</button>
      </div>
      {status && <p role="status" style={statusStyle(status)}>{status}</p>}
    </section>
  );
}
