import { useNavigate } from "react-router-dom";
import { DialogsValveProvider, useDialogsValve } from "../dialogs-valve-registry";
import "./HomePage.css";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DialogsValveProvider onNavigate={navigate}>
      <HomePageContent />
    </DialogsValveProvider>
  );
};

const HomePageContent: React.FC = () => {
  const dialogsValve = useDialogsValve();

  const opensDrawer = (index: number) => {
    // Dynamic template literal produces `string`, not a literal union.
    // This cast is an explicit escape hatch — all static call sites are fully type-safe.
    dialogsValve?.openDialog(
      `drawer-${index}` as
      | "drawer-1"
      | "drawer-2"
      | "drawer-3"
      | "drawer-4"
      | "drawer-5"
      | "drawer-6"
      | "drawer-7"
      | "drawer-8"
      | "drawer-9"
      | "drawer-10"
      | "drawer-11"
      | "drawer-12",
    );
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
