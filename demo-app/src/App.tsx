import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { DialogsValveProvider } from "./dialogs-valve-registry";

export type AppPermissionsContextValue = {
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
};

export const PermissionsContext =
  createContext<AppPermissionsContextValue | null>(null);

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  return (
    <PermissionsContext.Provider value={{ isAdmin, setIsAdmin }}>
      <DialogsValveProvider onNavigate={navigate} permissions={{ isAdmin }}>
        <HomePage />
      </DialogsValveProvider>
    </PermissionsContext.Provider>
  );
}

export default App;
