import Drawer from "../../components/Drawer/Drawer";

type CrossRouteDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const CrossRouteDrawer: React.FC<CrossRouteDrawerProps> = ({
  open,
  onClose,
}) => (
  <Drawer open={open} onClose={onClose} title="Opened on a sub-route">
    <div className="dialog-content">
      <p>
        This drawer was opened while you are on <code>/sub-route</code>, not the
        home page. The dialog key was appended to the current URL — the path
        stayed exactly where it was.
      </p>
      <p>
        Close it and watch the URL: the query is cleared but you remain on{" "}
        <code>/sub-route</code>. Before the fix, the close URL dropped the path
        and the router bounced you back to the origin (<code>/</code>).
      </p>
      <div className="dialog-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Close — stays on /sub-route
        </button>
      </div>
    </div>
  </Drawer>
);

export default CrossRouteDrawer;
