import type { SecurityCheck } from "../lib/types";
import { providerNames } from "../lib/types";
export default function CheckCatalog({
  checks,
  loading,
  error,
  onRetry,
}: {
  checks: SecurityCheck[];
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  return (
    <details className="panel catalog-panel">
      <summary>
        Security check catalog{" "}
        <span>
          {loading ? "Loading…" : `${checks.length} registered checks`}
        </span>
      </summary>
      {loading ? (
        <div className="history-loading" role="status">
          <div className="skeleton h-9" />
          <span className="sr-only">Loading check catalog</span>
        </div>
      ) : error ? (
        <div className="history-error" role="alert">
          <span>Unable to load checks: {error}</span>
          <button className="button secondary" onClick={onRetry}>
            Retry catalog
          </button>
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Check ID</th>
                <th>Security rule</th>
                <th>Provider</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((check) => (
                <tr key={check.check_id}>
                  <td>
                    <code>{check.check_id}</code>
                  </td>
                  <td>{check.title}</td>
                  <td>{providerNames[check.provider]}</td>
                  <td>
                    <span
                      className={`severity-label severity-${check.severity.toLowerCase()}`}
                    >
                      {check.severity.toLowerCase()}
                    </span>
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
