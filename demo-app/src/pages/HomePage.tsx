import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PermissionsContext } from "../App";
import {
  DialogsValveProvider,
  useDialogsValve,
} from "../dialogs-valve-registry";
import UrlInspector from "../components/UrlInspector/UrlInspector";
import SectionLayout from "../components/SectionLayout/SectionLayout";
import CodeBlock from "../components/CodeBlock/CodeBlock";
import "./HomePage.css";

// ─── Top-level page: owns the provider ───────────────────────────────────────

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useContext(PermissionsContext)!;

  return (
    <DialogsValveProvider
      onNavigate={navigate}
      getPathname={() => location.pathname}
      permissions={{ isAdmin }}
    >
      <HomePageContent />
    </DialogsValveProvider>
  );
};

// ─── Inner content: has access to the hook ───────────────────────────────────

const HomePageContent: React.FC = () => (
  <div className="showcase">
    <HeroSection />
    <div className="url-inspector-sticky">
      <div className="showcase-inner">
        <UrlInspector />
      </div>
    </div>
    <main className="showcase-inner showcase-main">
      <BasicUsageSection />
      <OverlapSection />
      <ReplacementSection />
      <PropsSection />
      <PermissionsSection />
      <InstallSection />
    </main>
    <footer className="showcase-footer">
      <div className="showcase-inner">
        <p>
          <strong>@dialogs-valve/react</strong> — MIT License —{" "}
          <a
            href="https://github.com/guilhermecarvalho/dialogs-valve-react"
            target="_blank"
            rel="noreferrer"
            className="footer-link"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  </div>
);

// ─── Hero ─────────────────────────────────────────────────────────────────────

const HeroSection: React.FC = () => (
  <header className="hero">
    <div className="hero-glow" aria-hidden="true" />
    <div className="showcase-inner hero-inner">
      <div className="hero-badges">
        <span className="badge badge-primary">v0.1</span>
        <span className="badge badge-muted">MIT</span>
        <span className="badge badge-muted">TypeScript</span>
      </div>
      <h1 className="hero-title">
        <a href="/" className="hero-title-link">
          <span className="hero-name">@dialogs-valve</span>
          <span className="hero-slash">/react</span>
        </a>
      </h1>
      <p className="hero-tagline">
        URL-driven dialog management for React.
        <br />
        Deep-linkable, router-agnostic, type-safe.
      </p>
      <div className="hero-chips">
        {[
          "URL-Driven State",
          "Router-Agnostic",
          "Overlap Support",
          "Permission Guards",
          "Type-Safe API",
          "Animated Exits",
        ].map((f) => (
          <span key={f} className="hero-chip">
            {f}
          </span>
        ))}
      </div>
      <div className="hero-cta">
        <a href="#basic-usage" className="btn btn-primary btn-lg">
          See it in action
        </a>
        <a href="#installation" className="btn btn-secondary btn-lg">
          Quick Start
        </a>
      </div>
    </div>
  </header>
);

// ─── Section 1: Basic Usage ───────────────────────────────────────────────────

const BasicUsageSection: React.FC = () => {
  const { openDialog, closeAllDialogs, isOpen } = useDialogsValve()!;
  const anyOpen = isOpen("hello-modal") || isOpen("info-drawer");

  const code = `import { useDialogsValve } from './dialogs-valve-registry';

const { openDialog, closeDialog, closeAllDialogs, isOpen } =
  useDialogsValve()!;

// Open dialogs by key
openDialog('hello-modal');
openDialog('info-drawer');

// Close a specific one
closeDialog('hello-modal');

// Close everything
closeAllDialogs();

// Check state
const isModalOpen = isOpen('hello-modal'); // boolean`;

  return (
    <SectionLayout
      id="basic-usage"
      label="01"
      title="Basic Usage"
      description="Open, close, and check dialogs from anywhere inside the provider — modal, drawer, sheet, whatever your component looks like."
      demo={
        <div className="demo-card">
          <p className="demo-card-hint">
            Try opening both, then closing all at once.
          </p>
          <div className="demo-actions">
            <button
              className="btn btn-primary"
              onClick={() => openDialog("hello-modal")}
            >
              Open Modal
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => openDialog("info-drawer")}
            >
              Open Drawer
            </button>
            <button
              className="btn btn-ghost"
              onClick={closeAllDialogs}
              disabled={!anyOpen}
            >
              Close All
            </button>
          </div>
          <div className="demo-state-row">
            <span
              className={`demo-dot ${isOpen("hello-modal") ? "demo-dot-on" : ""}`}
            />
            <span className="demo-state-label">hello-modal</span>
            <span
              className={`demo-dot ${isOpen("info-drawer") ? "demo-dot-on" : ""}`}
            />
            <span className="demo-state-label">info-drawer</span>
          </div>
        </div>
      }
      code={<CodeBlock code={code} filename="usage.tsx" />}
    />
  );
};

// ─── Section 2: Overlapping Dialogs ──────────────────────────────────────────

const OverlapSection: React.FC = () => {
  const { openDialog } = useDialogsValve()!;

  const code = `// Open Drawer A
openDialog('overlap-drawer-a');

// From within Drawer A, open B on top:
openDialog('overlap-drawer-b', { overlap: true });

// URL becomes:
// ?dialog=overlap-drawer-a&dialog=overlap-drawer-b

// Each dialog only removes itself when closed —
// the other stays open.`;

  return (
    <SectionLayout
      id="overlap"
      label="02"
      title="Overlapping Dialogs"
      description={
        <>
          Open multiple dialogs simultaneously with <code>overlap: true</code>.
          Each one adds its own key to the URL — close one and the rest stay
          open.
        </>
      }
      demo={
        <div className="demo-card">
          <p className="demo-card-hint">
            Open Drawer A, then use the button inside it to stack Drawer B on
            top. Watch the URL Inspector.
          </p>
          <div className="demo-actions">
            <button
              className="btn btn-primary"
              onClick={() => openDialog("overlap-drawer-a")}
            >
              Open Drawer A
            </button>
          </div>
          <div className="demo-url-preview">
            <span className="demo-url-label">Expected URL shape</span>
            <code>?dialog=overlap-drawer-a&amp;dialog=overlap-drawer-b</code>
          </div>
        </div>
      }
      code={<CodeBlock code={code} filename="overlap.tsx" />}
    />
  );
};

// ─── Section 3: Dialog Replacement ───────────────────────────────────────────

const ReplacementSection: React.FC = () => {
  const { openDialog } = useDialogsValve()!;

  const code = `// overlap: false replaces all currently open dialogs
openDialog('replacement-b', { overlap: false });

// URL: ?dialog=replacement-a
//   → ?dialog=replacement-b
//
// Only one dialog key in the URL at a time.
// Useful for wizard-style flows or exclusive panels.`;

  return (
    <SectionLayout
      id="replacement"
      label="03"
      title="Dialog Replacement"
      description={
        <>
          Pass <code>overlap: false</code> to replace all current dialogs
          instead of stacking. Useful for wizard steps, exclusive panels, or
          navigation flows.
        </>
      }
      demo={
        <div className="demo-card">
          <p className="demo-card-hint">
            Open Drawer A, then use the button inside to replace it with Drawer
            B — no stacking.
          </p>
          <div className="demo-actions">
            <button
              className="btn btn-primary"
              onClick={() => openDialog("replacement-a")}
            >
              Open Drawer A
            </button>
          </div>
          <div className="demo-url-preview">
            <span className="demo-url-label">URL transition</span>
            <div className="demo-url-transition">
              <code>?dialog=replacement-a</code>
              <span className="demo-arrow">→</span>
              <code>?dialog=replacement-b</code>
            </div>
          </div>
        </div>
      }
      code={<CodeBlock code={code} filename="replacement.tsx" />}
    />
  );
};

// ─── Section 4: Props via URL ─────────────────────────────────────────────────

const USERS = [
  { name: "Alice", role: "Admin", userId: "001" },
  { name: "Bob", role: "Viewer", userId: "002" },
  { name: "Carol", role: "Editor", userId: "003" },
];

const PropsSection: React.FC = () => {
  const { openDialog } = useDialogsValve()!;

  const code = `// Pass any string | number | boolean as URL props
openDialog('user-profile', {
  props: {
    name: 'Alice',
    role: 'Admin',
    userId: '001',
  },
});

// The dialog component receives them as React props:
type UserProfileDrawerProps = {
  open: boolean;
  onClose: () => void;
  name?: string;    // serialized in URL
  role?: string;    // serialized in URL
  userId?: string;  // serialized in URL
};`;

  return (
    <SectionLayout
      id="props"
      label="04"
      title="Props via URL"
      description="Pass serializable data (string, number, boolean) through URL query params. The library extracts and spreads them onto your dialog component automatically."
      demo={
        <div className="demo-card">
          <p className="demo-card-hint">
            Click a user to open their profile — the data travels through the
            URL.
          </p>
          <div className="profile-cards">
            {USERS.map((u) => (
              <button
                key={u.userId}
                className="profile-card"
                onClick={() =>
                  openDialog("user-profile", {
                    props: { name: u.name, role: u.role, userId: u.userId },
                  })
                }
              >
                <div className="profile-card-avatar">{u.name.charAt(0)}</div>
                <div className="profile-card-name">{u.name}</div>
                <div className="profile-card-role">{u.role}</div>
              </button>
            ))}
          </div>
        </div>
      }
      code={<CodeBlock code={code} filename="props.tsx" />}
    />
  );
};

// ─── Section 5: Permission Guards ────────────────────────────────────────────

const PermissionsSection: React.FC = () => {
  const { openDialog } = useDialogsValve()!;
  const { isAdmin, setIsAdmin } = useContext(PermissionsContext)!;

  const code = `// In the registry:
export const dialogs = {
  'admin-panel': {
    Component: AdminPanelDrawer,
    canShow: (permissions) => permissions.isAdmin,
  },
} satisfies DialogMap<string, { isAdmin: boolean }>;

// Pass permissions to the provider:
<DialogsValveProvider
  onNavigate={navigate}
  permissions={{ isAdmin }}
>
  <App />
</DialogsValveProvider>

// If canShow returns false, the dialog is skipped
// and a console.warn is emitted.`;

  return (
    <SectionLayout
      id="permissions"
      label="05"
      title="Permission Guards"
      description={
        <>
          Add a <code>canShow</code> function to any registry entry. The
          provider re-evaluates it whenever <code>permissions</code> changes —
          no extra wiring needed.
        </>
      }
      demo={
        <div className="demo-card">
          <div
            className="permission-toggle"
            onClick={() => setIsAdmin(!isAdmin)}
          >
            <div className={`toggle-track ${isAdmin ? "on" : ""}`}>
              <div className="toggle-thumb" />
            </div>
            <div className="toggle-label">
              <span className="toggle-title">Admin Mode</span>
              <span className={`toggle-status ${isAdmin ? "on" : ""}`}>
                {isAdmin ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
          <div className="demo-actions">
            <button
              className="btn btn-secondary"
              onClick={() => openDialog("public-info")}
            >
              Open Public Info
            </button>
            <button
              className={`btn ${isAdmin ? "btn-primary" : "btn-ghost"}`}
              onClick={() => openDialog("admin-panel")}
              title={isAdmin ? undefined : "Enable Admin Mode first"}
            >
              Open Admin Panel
            </button>
          </div>
          {!isAdmin && (
            <p className="demo-guard-hint">
              ↑ Admin Panel is blocked by <code>canShow</code> — toggle Admin
              Mode to unlock it.
            </p>
          )}
        </div>
      }
      code={<CodeBlock code={code} filename="permissions.tsx" />}
    />
  );
};

// ─── Section 6: Installation ──────────────────────────────────────────────────

const InstallSection: React.FC = () => {
  const installCode = `npm install @dialogs-valve/react
# or
yarn add @dialogs-valve/react`;

  const registryCode = `// dialogs-valve-registry.tsx
import { createDialogsValve } from '@dialogs-valve/react';
import type { DialogMap } from '@dialogs-valve/react';
import { SettingsDrawer } from './dialogs/SettingsDrawer';

export const dialogs = {
  'settings': { Component: SettingsDrawer },
} as const satisfies DialogMap;

// createDialogsValve is the only runtime export from the library.
// Everything else comes from its return value.
export const { DialogsValveProvider, useDialogsValve } =
  createDialogsValve(dialogs);`;

  const providerCode = `// App.tsx
import { useNavigate } from 'react-router-dom';
import { DialogsValveProvider } from './dialogs-valve-registry';

function App() {
  const navigate = useNavigate();
  return (
    // Import DialogsValveProvider from YOUR registry, not the library
    <DialogsValveProvider onNavigate={navigate}>
      <YourApp />
    </DialogsValveProvider>
  );
}`;

  const usageCode = `// Anywhere inside the provider:
import { useDialogsValve } from './dialogs-valve-registry';

function SettingsButton() {
  const { openDialog } = useDialogsValve()!;
  return (
    <button onClick={() => openDialog('settings')}>
      Open Settings
    </button>
  );
}`;

  return (
    <section id="installation" className="section section-install">
      <div className="section-meta">
        <span className="section-number">06</span>
        <h2 className="section-title">Quick Start</h2>
      </div>
      <p className="section-desc">
        Get up and running in four steps. The library ships a single runtime
        export — <code>createDialogsValve</code> — which returns your fully
        typed provider, hook, and URL utilities.
      </p>
      <div className="install-steps">
        <div className="install-step">
          <div className="install-step-label">
            <span className="install-step-number">1</span>
            Install
          </div>
          <CodeBlock code={installCode} language="bash" />
        </div>
        <div className="install-step">
          <div className="install-step-label">
            <span className="install-step-number">2</span>
            Create your registry
          </div>
          <CodeBlock
            code={registryCode}
            filename="dialogs-valve-registry.tsx"
          />
        </div>
        <div className="install-step">
          <div className="install-step-label">
            <span className="install-step-number">3</span>
            Wrap with the provider
          </div>
          <CodeBlock code={providerCode} filename="App.tsx" />
        </div>
        <div className="install-step">
          <div className="install-step-label">
            <span className="install-step-number">4</span>
            Open dialogs anywhere
          </div>
          <CodeBlock code={usageCode} filename="SettingsButton.tsx" />
        </div>
      </div>
    </section>
  );
};

export default HomePage;
