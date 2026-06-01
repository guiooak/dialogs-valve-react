import { createContext, useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { DialogsValveProvider, useDialogsValve } from "@dialogs-valve/react";
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
  const [unauthorized, setUnauthorized] = useState(false);
  const navigate = useNavigate();

  return (
    <PermissionsContext.Provider value={{ isAdmin, setIsAdmin }}>
      <DialogsValveProvider
        dialogs={dialogs}
        onNavigate={navigate}
        permissions={{ isAdmin }}
        onUnauthorized={() => setUnauthorized(true)}
      >
        <AccessDeniedHandler
          trigger={unauthorized}
          onReset={() => setUnauthorized(false)}
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sub-route" element={<SubRoutePage />} />
        </Routes>
      </DialogsValveProvider>
    </PermissionsContext.Provider>
  );
}

function AccessDeniedHandler({
  trigger,
  onReset,
}: {
  trigger: boolean;
  onReset: () => void;
}) {
  const { openDialog } = useDialogsValve()!;

  useEffect(() => {
    if (!trigger) return;
    openDialog("access-denied", { overlap: false });
    onReset();
  }, [trigger, openDialog, onReset]);

  return null;
}

export default App;
