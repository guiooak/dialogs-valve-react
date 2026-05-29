import React from "react";
import { Link } from "react-router-dom";
import { useDialogsValve } from "@dialogs-valve/react";
import UrlInspector from "../components/UrlInspector/UrlInspector";

const SubRoutePage: React.FC = () => {
  const { openDialog, isOpen } = useDialogsValve()!;

  return (
    <div className="showcase">
      <main className="showcase-inner showcase-main">
        <section className="section">
          <div className="section-meta">
            <span className="section-number">↩</span>
            <h2 className="section-title">You are on a sub-route</h2>
          </div>
          <p className="section-desc">
            This page is mounted at <code>/sub-route</code> (under the demo's
            router <code>basename</code>). Open the drawer, then close it and
            watch the Live URL: the dialog query is added and removed, but the
            path stays on <code>/sub-route</code> the whole time — no bounce
            back to the origin (<code>/</code>), and the <code>basename</code>{" "}
            is never duplicated.
          </p>

          <div className="url-inspector-sticky">
            <UrlInspector />
          </div>

          <div className="demo-card">
            <p className="demo-card-hint">
              Open the drawer, then close it. The URL returns to{" "}
              <code>/sub-route</code>, not <code>/</code>.
            </p>
            <div className="demo-actions">
              <button
                className="btn btn-primary"
                onClick={() => openDialog("cross-route-drawer")}
              >
                Open drawer here
              </button>
              <Link to="/" className="btn btn-ghost">
                ← Back to home
              </Link>
            </div>
            <div className="demo-state-row">
              <span
                className={`demo-dot ${isOpen("cross-route-drawer") ? "demo-dot-on" : ""}`}
              />
              <span className="demo-state-label">cross-route-drawer</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SubRoutePage;
