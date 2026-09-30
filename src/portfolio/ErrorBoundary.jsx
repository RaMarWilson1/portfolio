import React from "react";
import "./portfolio.css";

// Last line of defense: a runtime error shows this instead of a blank page.
// Uses plain <a> links (full page loads) so recovery doesn't depend on the router.
export default class ErrorBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error("Render error:", error, info?.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="pf-state" role="alert">
        <p className="pf-state-k">Something broke</p>
        <h1>That wasn’t supposed to happen.</h1>
        <p>Something went wrong while loading this page. Reloading usually fixes it.</p>
        <div className="pf-state-acts">
          <button type="button" className="pf-state-btn solid" onClick={() => window.location.reload()}>Reload page</button>
          <a className="pf-state-btn" href="/">Go home</a>
        </div>
      </main>
    );
  }
}
