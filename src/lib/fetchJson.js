// fetch() + JSON with a timeout. Throws on network errors, timeouts, non-2xx
// responses and malformed JSON, so callers can fall back with one catch.
export async function fetchJson(url, { timeout = 8000, ...init } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, { ...init, signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    if (!data || typeof data !== "object") throw new Error("Malformed response");
    return data;
  } finally {
    clearTimeout(timer);
  }
}
