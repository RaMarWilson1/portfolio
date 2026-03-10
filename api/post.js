// api/posts.js
// Vercel serverless function — fetches published posts from Beehiiv
/* eslint-env node */

export default async function handler(req, res) {
  const { BEEHIIV_API_KEY, BEEHIIV_PUB_ID } = process.env; // eslint-disable-line no-undef

  if (!BEEHIIV_API_KEY || !BEEHIIV_PUB_ID) {
    return res.status(500).json({ error: "Missing Beehiiv environment variables" });
  }

  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/posts?status=confirmed&limit=10&expand[]=free_web_content`,
      {
        headers: {
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();

    // Map to clean post objects
    const posts = data.data.map((post) => ({
      id: post.id,
      title: post.title,
      subtitle: post.subtitle ?? "",
      date: new Date(post.publish_date * 1000).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      url: post.web_url,
      thumbnail: post.thumbnail_url ?? null,
      previewText: post.preview_text ?? "",
    }));

    // Cache for 5 minutes
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    return res.status(200).json({ posts });
  } catch (err) {
    console.error("Beehiiv fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
}