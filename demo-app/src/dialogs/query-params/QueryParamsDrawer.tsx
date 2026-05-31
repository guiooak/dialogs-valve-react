import Drawer from "../../components/Drawer/Drawer";

type QueryParamsDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const QueryParamsDrawer: React.FC<QueryParamsDrawerProps> = ({
  open,
  onClose,
}) => (
  <Drawer open={open} onClose={onClose} title="Your query params are safe">
    <div className="dialog-content">
      <p>
        Before this dialog opened, the URL already carried{" "}
        <code>ref=newsletter</code> and <code>sort=desc</code>. Opening the
        dialog only <strong>appended</strong> its own key — those params are
        still there.
      </p>
      <p>
        Close it and watch the Live URL: <code>dialog=query-params-drawer</code>{" "}
        disappears, but <code>ref</code> and <code>sort</code> stay put. The
        library only ever touches its own dialog keys and props.
      </p>
      <div className="dialog-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Close — keeps ref &amp; sort
        </button>
      </div>
    </div>
  </Drawer>
);

export default QueryParamsDrawer;
