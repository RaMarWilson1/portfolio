import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, C, ghostBtn, label } from "./studio/shared";
import StudioLogin from "./studio/StudioLogin";
import PhotoPanel from "./studio/PhotoPanel";
import PoemPanel from "./studio/PoemPanel";
import SeriesPanel from "./studio/SeriesPanel";
import ExperiencePanel from "./studio/ExperiencePanel";

// Private admin page: photos, poems and experience, straight to Vercel Blob.
// Access is a server-validated session (HttpOnly cookie) — the dashboard only
// renders after /api/studio-session confirms it. Not linked anywhere.

export default function Studio() {
  const [auth, setAuth] = useState("checking"); // checking | locked | unlocked
  const [notice, setNotice] = useState("");

  const verifySession = useCallback(async () => {
    try {
      const d = await apiFetch("/api/studio-session");
      setAuth(d.authenticated ? "unlocked" : "locked");
      return !!d.authenticated;
    } catch {
      setAuth("locked");
      return false;
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // Every panel request goes through here so an expired session re-locks the Studio.
  const request = useCallback(async (path, opts) => {
    try {
      return await apiFetch(path, opts);
    } catch (err) {
      if (err.status === 401) {
        setNotice("Your session expired — sign in again.");
        setAuth("locked");
      }
      throw err;
    }
  }, []);

  async function logout() {
    try {
      await apiFetch("/api/studio-logout", { method: "POST" });
    } catch {
      /* the cookie is gone or never existed; lock either way */
    }
    setNotice("Signed out.");
    setAuth("locked");
  }

  return (
    <div style={{ minHeight: "100vh", background: C.night, color: C.ink, fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "clamp(40px,8vh,90px) clamp(20px,5vw,40px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
          <h1 style={{ fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-.02em", margin: 0 }}>Studio</h1>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link to="/" style={{ ...label, marginBottom: 0, color: C.gold, textDecoration: "none" }}>← Back to site</Link>
            {auth === "unlocked" && (
              <button style={{ ...ghostBtn, padding: "8px 12px", fontSize: 11 }} onClick={logout}>Sign out</button>
            )}
          </div>
        </div>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, marginTop: 4, marginBottom: 30 }}>
          Add photos, poems and experience from anywhere. They upload straight to storage and show up on the site on their own — no code, no deploy.
        </p>

        {auth === "checking" && <p style={{ color: C.muted, fontSize: 13 }}>Checking session…</p>}

        {auth === "locked" && (
          <StudioLogin
            key={notice}
            notice={notice}
            onSuccess={() => {
              setNotice("");
              setAuth("unlocked");
            }}
          />
        )}

        {auth === "unlocked" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <PhotoPanel request={request} verifySession={verifySession} />
            <PoemPanel request={request} />
            <SeriesPanel request={request} />
            <ExperiencePanel request={request} />
          </div>
        )}
      </div>
    </div>
  );
}
