// Tiny PostHog client — no SDK, no autocapture, no session recording.
// Sends a handful of named events to PostHog's capture API and silently no-ops
// when VITE_PUBLIC_POSTHOG_KEY is missing, in Studio, or when the visitor has
// Do Not Track / Global Privacy Control enabled.
//
// Never pass passwords, cookies, Studio payloads, poem bodies, or personal data
// as properties. Values are clipped to short strings/numbers/booleans below.

const KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const HOST = (import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com").replace(/\/+$/, "");
const ID_KEY = "rw_aid";

function optedOut() {
  if (typeof window === "undefined") return true;
  const nav = window.navigator || {};
  return nav.doNotTrack === "1" || window.doNotTrack === "1" || nav.globalPrivacyControl === true;
}

export const analyticsEnabled = () => !!KEY && !optedOut() && !window.location.pathname.startsWith("/studio");

let sessionId = null;
function distinctId() {
  try {
    let id = localStorage.getItem(ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ID_KEY, id);
    }
    return id;
  } catch {
    sessionId ||= crypto.randomUUID();
    return sessionId;
  }
}

function clean(props) {
  const out = {};
  for (const [k, v] of Object.entries(props || {})) {
    if (typeof v === "string") out[k] = v.slice(0, 120);
    else if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    else if (typeof v === "boolean") out[k] = v;
  }
  return out;
}

export function track(event, props) {
  if (!analyticsEnabled()) return;
  const { origin, pathname } = window.location;
  let referrer = "";
  try {
    referrer = document.referrer ? new URL(document.referrer).host : "";
  } catch {
    /* ignore */
  }
  const body = JSON.stringify({
    api_key: KEY,
    event,
    distinct_id: distinctId(),
    timestamp: new Date().toISOString(),
    properties: {
      ...clean(props),
      $current_url: origin + pathname, // no query string or hash
      $pathname: pathname,
      $referring_domain: referrer,
      $lib: "ramarwilson-web",
      $process_person_profile: false, // anonymous events only
    },
  });
  try {
    // text/plain keeps this a CORS "simple" request (no preflight); keepalive
    // lets it finish when the click opens a new tab or leaves the page.
    fetch(`${HOST}/i/v0/e/`, { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
  } catch {
    /* never let analytics break the page */
  }
}

// Convenience: onClick={trackClick("resume_opened", { location: "nav" })}
export const trackClick = (event, props) => () => track(event, props);
