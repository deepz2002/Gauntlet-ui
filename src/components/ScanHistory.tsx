import { useEffect, useState } from "react";
import {
  ChevronDown,
  CircleAlert,
  History,
  RefreshCw,
  ScanLine,
} from "lucide-react";
import { api } from "../lib/api";
import type { Scan } from "../lib/types";

export default function ScanHistory({
  onOpen,
}: {
  onOpen: (id: string) => void;
}) {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    async function load() {
      try {
        const rows = await api.listScans(controller.signal);
        if (stopped) return;
        setScans(rows);
        setError("");
        if (rows.some((row) => row.status === "RUNNING"))
          timer = setTimeout(load, 1500);
      } catch (err) {
        if (stopped) return;
        setError(
          err instanceof Error ? err.message : "Cannot reach the backend.",
        );
        timer = setTimeout(load, 3000);
      } finally {
        if (!stopped) setLoading(false);
      }
    }
    void load();
    return () => {
      stopped = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [refresh]);
  return (
    <details className="panel history-panel" aria-label="Scan history">
      <summary className="history-summary">
        <span>
          <History size={18} /> Scan history
        </span>
        <ChevronDown size={17} className="history-chevron" />
      </summary>
      <div className="panel-heading">
        <div>
          <p className="history-description">
            Saved scans from your database. Open a scan to view its findings.
          </p>
        </div>
        <button
          className="button secondary"
          onClick={() => setRefresh((value) => value + 1)}
          disabled={loading}
        >
          <RefreshCw size={14} /> Refresh history
        </button>
      </div>
      {error && (
        <div className="history-error" role="alert">
          <CircleAlert size={16} />
          <span>
            Unable to refresh scan history: {error}
            {scans.length ? ". Last loaded results are shown." : ""} Retrying
            automatically.
          </span>
        </div>
      )}
      {loading ? (
        <div
          className="history-loading"
          role="status"
          aria-label="Loading scan history"
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-9 mb-5" />
          ))}
        </div>
      ) : !scans.length ? (
        <div className="table-empty">
          <ScanLine size={25} />
          <h3>{error ? "Scan history is unavailable" : "No scans yet"}</h3>
          <p>
            {error
              ? "Check the API connection, then refresh history."
              : "Run your first security scan above."}
          </p>
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Scan</th>
                <th>Status</th>
                <th>Started</th>
                <th>Duration</th>
                <th>Accounts</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => (
                <tr key={scan.id}>
                  <td>
                    <button
                      className="scan-link"
                      onClick={() => onOpen(scan.id)}
                      aria-label={`Open scan ${scan.id}`}
                    >
                      {scan.id}
                    </button>
                  </td>
                  <td>
                    <span
                      className={`badge scan-status-${scan.status.toLowerCase()}`}
                    >
                      {scan.status === "RUNNING"
                        ? "Running"
                        : scan.status === "COMPLETED"
                          ? "Completed"
                          : "Failed"}
                    </span>
                  </td>
                  <td>{new Date(scan.started_at).toLocaleString()}</td>
                  <td>
                    {(
                      (Date.parse(
                        scan.finished_at || new Date().toISOString(),
                      ) -
                        Date.parse(scan.started_at)) /
                      1000
                    ).toFixed(1)}
                    s
                  </td>
                  <td>{scan.account_ids.length}</td>
                  <td>
                    {scan.score === null
                      ? "N/A"
                      : `${scan.score.toFixed(1)} / 100`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </details>
  );
}
