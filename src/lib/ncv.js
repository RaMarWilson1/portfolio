// No Clean Version — shared formatting for series episodes and readings.

export const formatEpisode = (n) => String(n).padStart(3, "0");
export const episodeLabel = (n, title = "No Clean Version") => `${title} — ${formatEpisode(n)}`;
export const episodeAria = (n, title = "No Clean Version") => `${title}, episode ${n}`;

export const PLATFORMS = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", other: "Other" };
export const platformLabel = (p) => PLATFORMS[p] || "";

// Series order (highest episode first) — deliberately separate from the general
// poem chronology (featured → newest publishedAt) that /api/poems returns.
export const byEpisodeDesc = (a, b) => b.seriesNumber - a.seriesNumber;
export const inSeries = (p) => Number.isInteger(p?.seriesNumber) && p.seriesNumber > 0;

// The installment to surface as "Latest reading": highest episode that has a
// reading link; readings without an episode number fall back to newest date.
export function latestReading(poems) {
  const withReading = poems.filter((p) => p.readingUrl);
  if (!withReading.length) return null;
  const numbered = withReading.filter(inSeries).sort(byEpisodeDesc);
  if (numbered.length) return numbered[0];
  const t = (p) => Date.parse(p.readingPublishedAt || p.publishedAt) || 0;
  return withReading.slice().sort((a, b) => t(b) - t(a))[0];
}
