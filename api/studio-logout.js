// api/studio-logout.js
// Clears the Studio session cookie.
import { endSession, isSameOrigin, noStore } from "./_studio-auth.js";

export default function handler(req, res) {
  noStore(res);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!isSameOrigin(req)) return res.status(403).json({ error: "Forbidden" });
  endSession(req, res);
  return res.status(200).json({ authenticated: false });
}
