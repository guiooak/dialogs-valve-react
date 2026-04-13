import { createContext, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";

export type AppPermissionsContextValue = {
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
};

export const PermissionsContext =
  createContext<AppPermissionsContextValue | null>(null);

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <PermissionsContext.Provider value={{ isAdmin, setIsAdmin }}>
      <BrowserRouter basename="/dialogs-valve-react">
        <HomePage />
      </BrowserRouter>
    </PermissionsContext.Provider>
  );
}

export default App;
