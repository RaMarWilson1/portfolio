import React, { useState } from "react";
import { apiFetch, btn, card, input, label, statusStyle } from "./shared";

export default function StudioLogin({ onSuccess, notice }) {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(notice || "");

  async function submit(e) {
    e.preventDefault();
    if (!pw || busy) return;
    setBusy(true);
    setMsg("");
    try {
      await apiFetch("/api/studio-login", { method: "POST", body: { password: pw } });
      setPw("");
      onSuccess();
    } catch (err) {
      setPw("");
      if (err.status === 429) setMsg("Failed: too many attempts. Wait a few minutes and try again.");
      else if (err.status === 401) setMsg("Failed: incorrect password.");
      else setMsg(`Failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form style={{ ...card, maxWidth: 420 }} onSubmit={submit}>
      <label style={label} htmlFor="studio-pw">Password</label>
      <input
        id="studio-pw"
        style={input}
        type="password"
        autoComplete="current-password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="Enter to unlock"
        autoFocus
      />
      <button type="submit" style={{ ...btn, marginTop: 14, width: "100%", opacity: busy ? 0.6 : 1 }} disabled={busy}>
        {busy ? "Checking…" : "Unlock"}
      </button>
      {msg && <p role="alert" style={statusStyle(msg)}>{msg}</p>}
    </form>
  );
}
