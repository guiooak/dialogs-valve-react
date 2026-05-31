import { createContext, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { DialogsValveProvider } from "@dialogs-valve/react";
import HomePage from "./pages/HomePage";
import SubRoutePage from "./pages/SubRoutePage";
import { dialogs } from "./dialogs-valve-registry";

export type AppPermissionsContextValue = {
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
};

export const PermissionsContext =
  createContext<AppPermissionsContextValue | null>(null);

// This demo is served under a router basename ("/dialogs-valve-react"). The URL
// builders return an absolute path read from window.location.pathname, which
// already includes that basename — and react-router's navigate() re-prepends
// the basename. Strip it here so the two don't stack into a doubled path.
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBasename(url: string): string {
  if (!BASENAME) return url;
  return url.startsWith(BASENAME) ? url.slice(BASENAME.length) || "/" : url;
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  return (
    <PermissionsContext.Provider value={{ isAdmin, setIsAdmin }}>
      <DialogsValveProvider
        dialogs={dialogs}
        onNavigate={(url) => navigate(stripBasename(url))}
        permissions={{ isAdmin }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sub-route" element={<SubRoutePage />} />
        </Routes>
      </DialogsValveProvider>
    </PermissionsContext.Provider>
  );
}

export default App;
