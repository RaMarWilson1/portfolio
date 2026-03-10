// api/photos.js
// Vercel serverless function — fetches photos from Cloudinary securely
/* eslint-env node */

export default async function handler(req, res) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env; // eslint-disable-line no-undef

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ error: "Missing Cloudinary environment variables" });
  }

  try {
    // Cloudinary Search API — finds all images in the photography folder
    const searchUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/search`;

    const body = JSON.stringify({
      expression: "folder:photography",
      with_field: ["tags", "context"],
      max_results: 100,
      sort_by: [{ created_at: "desc" }],
    });

    const credentials = btoa(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`);

    const response = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body,
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();

    // Map to clean photo objects
    const photos = data.resources.map((r) => ({
      id: r.public_id,
      src: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_800/${r.public_id}`,
      thumb: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_400/${r.public_id}`,
      category: r.tags?.[0] ?? "misc",
      title: r.context?.custom?.caption ?? r.public_id.split("/").pop().replace(/_/g, " "),
      location: r.context?.custom?.alt ?? "",
    }));

    // Cache for 60 seconds on CDN
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    return res.status(200).json({ photos });
  } catch (err) {
    console.error("Cloudinary fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch photos" });
  }
}