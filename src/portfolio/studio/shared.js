// Shared styles + fetch helper for the private Studio.

export const C = {
  night: "#070A18",
  panel: "#111935",
  gold: "#F2B85C",
  coral: "#F2765C",
  ink: "#EEF1FA",
  muted: "#A6AFCE",
  line: "rgba(255,255,255,.13)",
  mono: 'ui-monospace,"SF Mono",Menlo,"Courier New",monospace',
};
export const label = { fontFamily: C.mono, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 7 };
export const input = { width: "100%", padding: "11px 13px", borderRadius: 10, border: `1px solid ${C.line}`, background: "rgba(255,255,255,.03)", color: C.ink, fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
export const btn = { fontFamily: C.mono, textTransform: "uppercase", letterSpacing: ".1em", fontSize: 12, fontWeight: 600, padding: "12px 18px", borderRadius: 10, border: 0, cursor: "pointer", background: `linear-gradient(120deg,${C.gold},${C.coral})`, color: C.night };
export const ghostBtn = { ...btn, background: "transparent", color: C.gold, border: `1px solid ${C.gold}` };
export const smallBtn = { fontFamily: C.mono, textTransform: "uppercase", letterSpacing: ".08em", fontSize: 10.5, padding: "6px 10px", borderRadius: 7, cursor: "pointer", background: "transparent", color: C.gold, border: `1px solid ${C.line}` };
export const dangerBtn = { ...smallBtn, color: C.coral };
export const card = { border: `1px solid ${C.line}`, borderRadius: 16, background: C.panel, padding: "clamp(20px,3vw,30px)" };
export const h2 = { fontSize: 20, fontWeight: 700, margin: "0 0 4px" };
export const hint = { color: C.muted, fontSize: 13, margin: "0 0 18px", lineHeight: 1.5 };
export const listHead = { ...label, marginTop: 28, paddingTop: 20, borderTop: `1px solid ${C.line}` };
export const row = { display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: `1px solid ${C.line}` };

export const statusStyle = (msg) => ({
  color: /^(Failed|Could not|Error)/.test(msg) ? C.coral : C.gold,
  fontSize: 13,
  marginTop: 14,
  lineHeight: 1.5,
});

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Same-origin JSON request; the HttpOnly session cookie rides along automatically.
export async function apiFetch(path, { method = "GET", body } = {}) {
  const r = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try {
    data = await r.json();
  } catch {
    /* empty body */
  }
  if (!r.ok) throw new ApiError(r.status, data.error || `Request failed (${r.status})`);
  return data;
}

// Public read APIs are CDN-cached; the Studio wants what's there right now.
export const fresh = (path) => `${path}${path.includes("?") ? "&" : "?"}fresh=${Date.now()}`;

export const fmtDate = (iso) => {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? "—" : new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// Every destructive action goes through one explicit, specific confirmation.
export const confirmDelete = (kind, name, path) =>
  window.confirm(`Delete ${kind} “${name}”?\n\n${path}\n\nThis permanently removes it from the site and can’t be undone.`);
