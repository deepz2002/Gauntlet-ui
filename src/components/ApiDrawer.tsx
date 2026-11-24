import { useEffect, useRef } from "react";
import {
  Braces,
  Check,
  ChevronDown,
  PanelRightClose,
  Radio,
  X,
} from "lucide-react";
import type { Activity } from "../lib/types";
export default function ApiDrawer({
  open,
  onClose,
  activities,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  activities: Activity[];
  onClear: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <aside className="api-drawer" aria-label="API activity">
      <div className="drawer-header">
        <span>
          <Braces size={19} /> API activity
        </span>
        <button
          ref={closeRef}
          className="icon-button"
          aria-label="Close API activity"
          onClick={onClose}
        >
          <PanelRightClose size={19} />
        </button>
      </div>
      <div className="drawer-intro">
        <div className="flex items-center justify-between">
          <span className="eyebrow">UNDER THE HOOD</span>
          <span className="request-count">{activities.length} requests</span>
        </div>
        <p>
          A little transparency. See the requests and parameters behind each
          action.
        </p>
      </div>
      <div className="drawer-feed">
        {!activities.length ? (
          <div className="drawer-empty">
            <Radio size={26} />
            <h3>Listening for activity</h3>
            <p>Run a scan to see requests appear here.</p>
          </div>
        ) : (
          activities.map((item) => (
            <details
              key={item.id}
              className="request-item"
              open={item.method === "POST"}
            >
              <summary>
                <div className="request-top">
                  <span className={`method ${item.method.toLowerCase()}`}>
                    {item.method}
                  </span>
                  <span
                    className={`request-status ${item.error ? "error-text" : ""}`}
                  >
                    {item.error ? (
                      <X size={12} />
                    ) : item.status ? (
                      <Check size={12} />
                    ) : (
                      <span className="tiny-spinner" />
                    )}
                    {item.status || (item.error ? "Error" : "Pending")}
                  </span>
                  <ChevronDown size={13} className="request-chevron" />
                </div>
                <span className="request-path">{item.path}</span>
                <span className="request-time">
                  {new Date(item.startedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                  {item.duration !== undefined && ` · ${item.duration} ms`}
                </span>
              </summary>
              <div className="request-body">
                <span>
                  {item.method === "POST" ? "REQUEST BODY" : "QUERY PARAMETERS"}
                </span>
                <pre>
                  {item.params
                    ? JSON.stringify(item.params, null, 2)
                    : "No parameters"}
                </pre>
                {item.error && <p className="error-text">{item.error}</p>}
              </div>
            </details>
          ))
        )}
      </div>
      <div className="drawer-footer">
        <span>
          <span className="status-dot" /> Updates automatically
        </span>
        <button onClick={onClear} disabled={!activities.length}>
          Clear log
        </button>
      </div>
    </aside>
  );
}
