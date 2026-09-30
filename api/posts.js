// api/posts.js
// Vercel serverless function — fetches published posts from Beehiiv.
//
// Date/ordering model (shared by the homepage and /newsletter):
//   publishedAt  — ISO time Beehiiv actually published the issue
//   displayedAt  — ISO time readers see (Beehiiv's displayed_date override, else publishedAt)
//   date         — displayedAt formatted for humans
//   issueNumber  — 1 = first issue; derived from the ordered collection
// Posts are returned newest → oldest.
//
// Failure modes (missing credentials, Beehiiv timeout/outage, malformed data)
// return a generic JSON error; the pages fall back to static issues. Details go
// to the server log only.
import { allowRead } from "./_studio-auth.js";

const LIMIT = 10;
const TIMEOUT_MS = 8000;

const toIso = (unix) => (Number.isFinite(unix) && unix > 0 ? new Date(unix * 1000).toISOString() : null);

export default async function handler(req, res) {
  if (!allowRead(req, res)) return;
  const { BEEHIIV_API_KEY, BEEHIIV_PUB_ID } = process.env;

  if (!BEEHIIV_API_KEY || !BEEHIIV_PUB_ID) {
    console.error("posts: missing Beehiiv environment variables");
    return res.status(503).json({ error: "Newsletter is unavailable right now." });
  }

  try {
    const params = new URLSearchParams({
      status: "confirmed",
      limit: String(LIMIT),
      order_by: "publish_date",
      direction: "desc",
    });
    const response = await fetch(`https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/posts?${params}`, {
      headers: {
        Authorization: `Bearer ${BEEHIIV_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error("posts: Beehiiv responded", response.status, (await response.text()).slice(0, 300));
      return res.status(502).json({ error: "Newsletter is unavailable right now." });
    }

    let data;
    try {
      data = await response.json();
    } catch {
      console.error("posts: Beehiiv returned non-JSON");
      return res.status(502).json({ error: "Newsletter is unavailable right now." });
    }
    if (!data || !Array.isArray(data.data)) {
      console.error("posts: unexpected Beehiiv payload shape");
      return res.status(502).json({ error: "Newsletter is unavailable right now." });
    }
    // Drop anything that can't be shown or linked.
    const raw = data.data.filter(
      (p) => p && typeof p.title === "string" && p.title && typeof p.web_url === "string" && /^https:\/\//.test(p.web_url)
    );

    const sorted = raw
      .map((post) => {
        const publishTs = Number(post.publish_date) || 0;
        const displayTs = Number(post.displayed_date) || publishTs;
        return { post, publishTs, displayTs };
      })
      // Defensive local sort (the API is already asked for newest-first).
      .sort((a, b) => b.displayTs - a.displayTs || b.publishTs - a.publishTs || String(a.post.id).localeCompare(String(b.post.id)));

    const total = Math.max(Number(data.total_results) || 0, sorted.length);

    const posts = sorted.map(({ post, publishTs, displayTs }, i) => ({
      id: post.id,
      title: post.title,
      subtitle: post.subtitle ?? "",
      date: displayTs
        ? new Date(displayTs * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
        : "",
      publishedAt: toIso(publishTs),
      displayedAt: toIso(displayTs),
      issueNumber: total - i,
      url: post.web_url,
      thumbnail: post.thumbnail_url ?? null,
      previewText: post.preview_text ?? "",
    }));

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    return res.status(200).json({ posts, total });
  } catch (err) {
    const timedOut = err?.name === "TimeoutError" || err?.name === "AbortError";
    console.error(timedOut ? `posts: Beehiiv timed out after ${TIMEOUT_MS}ms` : `posts: fetch failed: ${err?.message || err}`);
    return res.status(timedOut ? 504 : 502).json({ error: "Newsletter is unavailable right now." });
  }
}
