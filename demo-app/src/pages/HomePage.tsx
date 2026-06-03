import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PermissionsContext } from "../App";
import { DialogsValveProvider, useDialogsValve } from "@dialogs-valve/react";
import CustomKeyDrawer from "../dialogs/custom-param-key/CustomKeyDrawer";
import UrlInspector from "../components/UrlInspector/UrlInspector";
import SectionLayout from "../components/SectionLayout/SectionLayout";
import CodeBlock from "../components/CodeBlock/CodeBlock";
import "./HomePage.css";

const HomePage: React.FC = () => (
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
      <CrossRouteSection />
      <QueryParamsSection />
      <CustomParamKeySection />
      <InstallSection />
    </main>
    <footer className="showcase-footer">
      <div className="showcase-inner">
        <p>
          <strong>@dialogs-valve/react</strong> — MIT License —{" "}
          <a
            href="https://github.com/guiooak/dialogs-valve-react"
            target="_blank"
            rel="noreferrer"
            className="footer-link"
          >
            GitHub
          </a>{" "}
          —{" "}
          <a
            href="https://www.npmjs.com/package/@dialogs-valve/react"
            target="_blank"
            rel="noreferrer"
            className="footer-link"
          >
            npm
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
        <span className="badge badge-primary">v0.2</span>
        <span className="badge badge-muted">MIT</span>
        <span className="badge badge-muted">TypeScript</span>
      </div>
      <h1 className="hero-title">
        <a href={location.pathname} className="hero-title-link">
          <span className="hero-at">@</span>
          <span className="hero-scope">dialogs-valve</span>
          <span className="hero-slash">/</span>
          <span className="hero-pkg">react</span>
        </a>
      </h1>
      <p className="hero-headline">URL-driven dialog management for React.</p>
      <p className="hero-tagline">
        Deep-linkable, router-agnostic, type-safe. Open any dialog from any page
        — no route registration, the current page stays underneath.
      </p>
      <div className="hero-chips">
        {[
          "URL-Driven State",
          "Router-Agnostic",
          "Type-Safe API",
          "Overlap Support",
          "Permission Guards",
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
  const anyOpen =
    isOpen("hello-modal") || isOpen("info-drawer") || isOpen("tip-rollover");

  const code = `import { useDialogsValve } from '@dialogs-valve/react';

const { openDialog, closeDialog, closeAllDialogs, isOpen } =
  useDialogsValve()!;

// Open dialogs by key (stacking is the default)
openDialog('hello-modal');
openDialog('info-drawer');
openDialog('tip-rollover');

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
      description="Open, close, and check dialogs from anywhere inside the provider — modal, drawer, rollover, whatever your component looks like."
      demo={
        <div className="demo-card">
          <p className="demo-card-hint">
            Try opening each one, then closing all at once.
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
              className="btn btn-secondary"
              onClick={() => openDialog("tip-rollover")}
            >
              Open Rollover
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
            <span
              className={`demo-dot ${isOpen("tip-rollover") ? "demo-dot-on" : ""}`}
            />
            <span className="demo-state-label">tip-rollover</span>
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

// From within Drawer A, open B on top —
// stacking is the default behavior:
openDialog('overlap-drawer-b');

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
          Opening a dialog stacks it on top of any currently open dialogs by
          default. Each one adds its own key to the URL — close one and the rest
          stay open.
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
      description={
        <>
          Pass serializable data (string, number, boolean) through URL query
          params. The library extracts and spreads them onto your dialog
          component automatically.
        </>
      }
      demo={
        <div className="demo-card">
          <p className="demo-card-hint">
            Click a user to open their profile — the data travels through the
            URL.
          </p>
          <div className="demo-callout">
            <span className="demo-callout-tag">Tip</span>
            <span>
              Declare props beyond <code>open</code> / <code>onClose</code> as
              optional — a dialog can be deep-linked without them present.
            </span>
          </div>
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
  'access-denied': { Component: AccessDeniedModal },
} satisfies DialogMap<string, { isAdmin: boolean }>;

// Pass permissions + onUnauthorized to the provider:
<DialogsValveProvider
  onNavigate={navigate}
  permissions={{ isAdmin }}
  onUnauthorized={() => {
    // Open a custom modal instead of a silent console.warn
    navigate(buildDialogUrl('access-denied', { overlap: false }));
  }}
>
  <App />
</DialogsValveProvider>`;

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

// ─── Section 6: Cross-Route Navigation ───────────────────────────────────────

const CrossRouteSection: React.FC = () => {
  const code = `// On /sub-route, open a dialog the usual way:
openDialog('cross-route-drawer');
// URL → /sub-route?dialog=cross-route-drawer

// Close it:
closeDialog('cross-route-drawer');
// URL → /sub-route   (path kept, query cleared)

// The builders return relative URLs (?dialog=…),
// so the router resolves them against the current
// location — the pathname and any basename are
// preserved automatically. onNavigate={navigate}
// works as-is; no consumer-side workaround needed.`;

  return (
    <SectionLayout
      id="cross-route"
      label="06"
      title="Cross-Route Navigation"
      description={
        <>
          Opening and closing dialogs keeps you on whatever route you're on. The
          builders return <strong>relative</strong> URLs, so the router keeps
          the current pathname (and this demo's <code>basename</code>) on its
          own — closing a dialog never bounces you back to the origin (
          <code>/</code>).
        </>
      }
      demo={
        <div className="demo-card">
          <p className="demo-card-hint">
            Visit a real sub-route, open a dialog there, and confirm closing it
            keeps you on the sub-route.
          </p>
          <div className="demo-actions">
            <Link to="/sub-route" className="btn btn-primary">
              Go to /sub-route →
            </Link>
          </div>
          <div className="demo-url-preview">
            <span className="demo-url-label">URL transition on close</span>
            <div className="demo-url-transition">
              <code>/sub-route?dialog=cross-route-drawer</code>
              <span className="demo-arrow">→</span>
              <code>/sub-route</code>
            </div>
          </div>
        </div>
      }
      code={<CodeBlock code={code} filename="cross-route.tsx" />}
    />
  );
};

// ─── Section 7: Preserving Query Params ──────────────────────────────────────

const QueryParamsSection: React.FC = () => {
  const { openDialog, closeDialog, isOpen } = useDialogsValve()!;
  const navigate = useNavigate();
  const open = isOpen("query-params-drawer");

  const code = `// The URL already has unrelated params:
// ?ref=newsletter&sort=desc

openDialog('query-params-drawer');
// → ?ref=newsletter&sort=desc&dialog=query-params-drawer

closeDialog('query-params-drawer');
// → ?ref=newsletter&sort=desc

// The library only adds/removes its own dialog
// keys (and <key>.<prop> values). Any params it
// doesn't own are never touched.`;

  return (
    <SectionLayout
      id="query-params"
      label="07"
      title="Preserving Query Params"
      description={
        <>
          Dialog state lives alongside whatever else is in your query string.
          Opening or closing a dialog only touches its own keys — tracking
          params, filters, and sort orders you put in the URL stay exactly where
          they are.
        </>
      }
      demo={
        <div className="demo-card">
          <p className="demo-card-hint">
            Seed some unrelated params, then open and close the dialog. Watch{" "}
            <code>ref</code> and <code>sort</code> survive the whole time.
          </p>
          <div className="demo-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate("?ref=newsletter&sort=desc")}
            >
              Seed ?ref&amp;sort
            </button>
            <button
              className="btn btn-primary"
              onClick={() => openDialog("query-params-drawer")}
            >
              Open dialog
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => closeDialog("query-params-drawer")}
              disabled={!open}
            >
              Close dialog
            </button>
          </div>
          <UrlInspector />
        </div>
      }
      code={<CodeBlock code={code} filename="query-params.tsx" />}
    />
  );
};

// ─── Section 8: Custom Param Key ─────────────────────────────────────────────

const customKeyDialogs = { "feature-drawer": { Component: CustomKeyDrawer } };

const CustomParamKeySection: React.FC = () => {
  const navigate = useNavigate();

  const code = `// Configure a custom query param key for all dialogs:
<DialogsValveProvider
  dialogs={dialogs}
  onNavigate={navigate}
  config={{ dialogParamKey: "drawer" }}
>
  ...
</DialogsValveProvider>

// Inside the tree, use hook-bound builders —
// they automatically use the configured key:
const { openDialog, buildDialogUrl } = useDialogsValve()!;

openDialog('feature-drawer');
// URL: ?drawer=feature-drawer

// Safe for <Link> patterns too:
const url = buildDialogUrl('feature-drawer');
// → "?drawer=feature-drawer"`;

  return (
    <SectionLayout
      id="custom-param-key"
      label="08"
      title="Custom Param Key"
      description={
        <>
          Change the URL query param key from the default <code>"dialog"</code>{" "}
          to anything you like — useful when avoiding collisions with existing
          params or matching your team's naming convention. Use the hook-bound{" "}
          <code>buildDialogUrl</code> inside the tree so the key is always
          correct.
        </>
      }
      demo={
        <DialogsValveProvider
          dialogs={customKeyDialogs}
          onNavigate={navigate}
          config={{ dialogParamKey: "drawer" }}
        >
          <CustomParamKeyDemo />
        </DialogsValveProvider>
      }
      code={<CodeBlock code={code} filename="App.tsx" />}
    />
  );
};

const CustomParamKeyDemo: React.FC = () => {
  const { openDialog, buildDialogUrl } = useDialogsValve<string>()!;

  return (
    <div className="demo-card">
      <p className="demo-card-hint">
        Open the drawer and watch the URL Inspector — the param key is{" "}
        <code>drawer</code>, not <code>dialog</code>.
      </p>
      <div className="demo-actions">
        <button
          className="btn btn-primary"
          onClick={() => openDialog("feature-drawer")}
        >
          Open Feature Drawer
        </button>
      </div>
      <div className="demo-url-preview">
        <span className="demo-url-label">Expected URL shape</span>
        <code>?drawer=feature-drawer</code>
      </div>
      <div className="demo-callout">
        <span className="demo-callout-tag">Tip</span>
        <span>
          The URL was built by the hook-bound{" "}
          <code>buildDialogUrl("feature-drawer")</code> →{" "}
          <code>{buildDialogUrl("feature-drawer")}</code>
        </span>
      </div>
    </div>
  );
};

// ─── Section 9: Installation ──────────────────────────────────────────────────

const InstallSection: React.FC = () => {
  const installCode = `npm install @dialogs-valve/react
# or
yarn add @dialogs-valve/react`;

  const registryCode = `// dialogs-valve-registry.tsx
import type { DialogMap } from '@dialogs-valve/react';
import { SettingsDrawer } from './dialogs/SettingsDrawer';

export const dialogs = {
  'settings': { Component: SettingsDrawer },
} as const satisfies DialogMap;

// Register your dialogs once — all hooks/helpers are auto-typed
declare module '@dialogs-valve/react' {
  interface DialogsValveRegistry {
    dialogs: typeof dialogs;
  }
}`;

  const providerCode = `// App.tsx
import { useNavigate } from 'react-router-dom';
import { DialogsValveProvider } from '@dialogs-valve/react';
import { dialogs } from './dialogs-valve-registry';

function App() {
  const navigate = useNavigate();
  return (
    <DialogsValveProvider dialogs={dialogs} onNavigate={navigate}>
      <YourApp />
    </DialogsValveProvider>
  );
}`;

  const usageCode = `// Anywhere inside the provider:
import { useDialogsValve } from '@dialogs-valve/react';

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
        <span className="section-number">09</span>
        <h2 className="section-title">Quick Start</h2>
      </div>
      <p className="section-desc">
        Get up and running in four steps. Define your dialogs, register them
        once with a <code>declare module</code> block, and import everything
        directly from the library — fully typed, no boilerplate at call sites.
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
