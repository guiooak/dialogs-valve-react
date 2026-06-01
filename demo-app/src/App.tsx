import { createContext, useCallback, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { buildDialogUrl, DialogsValveProvider } from "@dialogs-valve/react";
import HomePage from "./pages/HomePage";
import SubRoutePage from "./pages/SubRoutePage";
import { dialogs } from "./dialogs-valve-registry";

export type AppPermissionsContextValue = {
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
};

export const PermissionsContext =
  createContext<AppPermissionsContextValue | null>(null);

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const handleUnauthorized = useCallback(() => {
    navigate(buildDialogUrl("access-denied", { overlap: false }));
  }, [navigate]);

  return (
    <PermissionsContext.Provider value={{ isAdmin, setIsAdmin }}>
      <DialogsValveProvider
        dialogs={dialogs}
        onNavigate={navigate}
        permissions={{ isAdmin }}
        onUnauthorized={handleUnauthorized}
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
