import React, { useCallback, useEffect, useState } from "react";
import { C, btn, card, confirmDelete, dangerBtn, fresh, ghostBtn, h2, hint, input, label, listHead, row, smallBtn, statusStyle } from "./shared";

const EMPTY = { slug: null, type: "role", role: "", org: "", loc: "", period: "", note: "", points: "", order: "" };
const slugOf = (pathname) => String(pathname || "").replace(/^experience\//, "").replace(/\.json$/, "");

export default function ExperiencePanel({ request }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState(null);
  const [listError, setListError] = useState("");
  const [deleting, setDeleting] = useState(null); // slug being deleted

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const load = useCallback(async () => {
    try {
      const d = await request(fresh("/api/experience"));
      setEntries((d.experience || []).slice().sort((a, b) => (b.order || 0) - (a.order || 0)));
      setListError("");
    } catch (err) {
      setListError(`Could not load entries: ${err.message}`);
    }
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  async function publish() {
    if (saving) return;
    if (!form.org.trim()) return setStatus("Failed: organization is required.");
    setSaving(true);
    setStatus("Saving…");
    try {
      const { slug, ...rest } = form;
      await request("/api/experience-upload", { method: "POST", body: slug ? { slug, ...rest } : rest });
      setStatus(`${slug ? "Updated" : "Added"} “${form.role || form.org}”. It’ll appear on the site within a minute.`);
      setForm(EMPTY);
      load();
    } catch (err) {
      setStatus(`Failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  function edit(e) {
    setForm({
      slug: slugOf(e.slug),
      type: e.type === "community" ? "community" : "role",
      role: e.role || "",
      org: e.org || "",
      loc: e.loc || "",
      period: e.period || "",
      note: e.note || "",
      points: (e.points || []).join("\n"),
      order: e.order ?? "",
    });
    setStatus("");
    window.scrollTo({ top: document.getElementById("studio-exp")?.offsetTop ?? 0, behavior: "smooth" });
  }

  async function remove(e) {
    const name = e.role ? `${e.role} · ${e.org}` : e.org;
    if (deleting || !confirmDelete("the experience entry", name, e.slug)) return;
    setDeleting(e.slug);
    try {
      await request("/api/experience-upload", { method: "DELETE", body: { slug: slugOf(e.slug) } });
      setStatus(`Deleted “${name}”.`);
      if (form.slug === slugOf(e.slug)) setForm(EMPTY);
      await load();
    } catch (err) {
      setStatus(`Failed: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section style={card} id="studio-exp" aria-labelledby="studio-exp-h">
      <h2 id="studio-exp-h" style={h2}>
        {form.slug ? <>Edit experience <span style={{ color: C.muted, fontWeight: 400 }}>· {form.slug}</span></> : "Add experience"}
      </h2>
      <p style={hint}>
        A role or a community/membership. Higher <em>order</em> shows first (leave blank to add near the top).
      </p>
      <label style={label} htmlFor="exp-type">Type</label>
      <select id="exp-type" style={input} value={form.type} onChange={set("type")}>
        <option value="role">Role / job</option>
        <option value="community">Community / membership</option>
      </select>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 16 }}>
        <div style={{ flex: "1 1 200px" }}>
          <label style={label} htmlFor="exp-org">Organization</label>
          <input id="exp-org" style={input} value={form.org} onChange={set("org")} placeholder="Medidata Solutions" maxLength={120} />
        </div>
        {form.type === "role" && (
          <div style={{ flex: "1 1 200px" }}>
            <label style={label} htmlFor="exp-role">Role / title</label>
            <input id="exp-role" style={input} value={form.role} onChange={set("role")} placeholder="Software Engineer Intern" maxLength={160} />
          </div>
        )}
      </div>
      {form.type === "role" && (
        <>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 16 }}>
            <div style={{ flex: "1 1 160px" }}>
              <label style={label} htmlFor="exp-loc">Location</label>
              <input id="exp-loc" style={input} value={form.loc} onChange={set("loc")} placeholder="New York City" maxLength={120} />
            </div>
            <div style={{ flex: "1 1 160px" }}>
              <label style={label} htmlFor="exp-period">Period</label>
              <input id="exp-period" style={input} value={form.period} onChange={set("period")} placeholder="Summer 2025" maxLength={80} />
            </div>
          </div>
          <label style={{ ...label, marginTop: 16 }} htmlFor="exp-points">Bullets (one per line)</label>
          <textarea
            id="exp-points"
            style={{ ...input, minHeight: 110, resize: "vertical", lineHeight: 1.5 }}
            value={form.points}
            onChange={set("points")}
            placeholder={"Built internal tools in React.\nWrote API documentation."}
          />
        </>
      )}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end", marginTop: 16 }}>
        <div style={{ flex: "0 1 130px" }}>
          <label style={label} htmlFor="exp-order">Order (optional)</label>
          <input id="exp-order" style={input} value={form.order} onChange={set("order")} placeholder="90" inputMode="numeric" />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <button style={{ ...btn, opacity: saving ? 0.6 : 1 }} onClick={publish} disabled={saving}>
          {saving ? "Saving…" : form.slug ? "Save changes" : "Add experience"}
        </button>
        {form.slug && (
          <button style={ghostBtn} onClick={() => { setForm(EMPTY); setStatus(""); }}>Cancel edit</button>
        )}
      </div>
      {status && <p role="status" style={statusStyle(status)}>{status}</p>}

      <span style={listHead}>Studio-added entries{entries ? ` · ${entries.length}` : ""}</span>
      <p style={{ ...hint, margin: "0 0 6px" }}>Entries seeded in <code>src/content/site.js</code> aren’t listed here; a Studio entry with the same org + role overrides one.</p>
      {listError && <p style={statusStyle(listError)}>{listError}</p>}
      {!entries && !listError && <p style={{ color: C.muted, fontSize: 13 }}>Loading…</p>}
      {entries && entries.length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>None yet.</p>}
      {entries && entries.map((e) => (
        <div key={e.slug} style={row}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{e.role ? `${e.role} · ` : ""}<span style={{ color: C.gold }}>{e.org}</span></div>
            <div style={{ fontFamily: C.mono, fontSize: 10.5, letterSpacing: ".06em", color: C.muted, marginTop: 3, textTransform: "uppercase" }}>
              {e.type === "community" ? "Community" : "Role"}{e.period ? ` · ${e.period}` : ""} · order {e.order ?? "—"}
            </div>
          </div>
          <button style={smallBtn} onClick={() => edit(e)} aria-label={`Edit ${e.role || e.org}`}>Edit</button>
          <button
            style={{ ...dangerBtn, opacity: deleting === e.slug ? 0.5 : 1 }}
            onClick={() => remove(e)}
            disabled={!!deleting}
            aria-label={`Delete ${e.role || e.org}`}
          >
            {deleting === e.slug ? "Deleting…" : "Delete"}
          </button>
        </div>
      ))}
    </section>
  );
}
