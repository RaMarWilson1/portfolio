// api/studio-session.js
// Tells the Studio UI whether the current browser holds a valid session.
import { getSession, noStore } from "./_studio-auth.js";

export default function handler(req, res) {
  noStore(res);
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const session = getSession(req);
  if (!session) return res.status(200).json({ authenticated: false });
  return res.status(200).json({ authenticated: true, expiresAt: new Date(session.exp * 1000).toISOString() });
}
