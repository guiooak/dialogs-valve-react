import { useNavigate } from "react-router-dom";
import { DialogsValveProvider } from "@dialogs-valve/react";
import { dialogs, useDialogs, type AppDialogKeys } from "../registry";
import "./HomePage.css";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DialogsValveProvider
      onNavigate={navigate}
      dialogs={dialogs}
    >
      <HomePageContent />
    </DialogsValveProvider>
  );
};

const HomePageContent: React.FC = () => {
  const dialogsValve = useDialogs();

  const opensDrawer = (index: number) => {
    dialogsValve?.openDialog(`drawer-${index}` as AppDialogKeys);
  };

  return (
    <div className="home-page">
      <h1>Drawer Demo (URL Controlled)</h1>
      <p>Click any button below to open a drawer (watch the URL!):</p>

      <div className="button-grid">
        {Array.from({ length: 12 }, (_, i) => (
          <button
            key={i}
            className="drawer-button"
            onClick={() => opensDrawer(i + 1)}
          >
            Open Drawer {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
