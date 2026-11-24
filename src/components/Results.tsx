import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  RotateCcw,
  Search,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { accounts, providerNames } from "../lib/types";
import type { Filters, FindingsPage, Scan } from "../lib/types";
import { ResultsSkeleton } from "./Skeleton";
import { ProviderIcon } from "./Brand";
export default function Results({
  scan,
  findings,
  loading,
  filters,
  onFilter,
  page,
  onPage,
  onReset,
  findingsError,
  onRetry,
}: {
  scan: Scan;
  findings: FindingsPage | null;
  loading: boolean;
  filters: Filters;
  onFilter: (key: keyof Filters, value: string) => void;
  page: number;
  onPage: (page: number) => void;
  onReset: () => void;
  findingsError: string;
  onRetry: () => void;
}) {
  const total = scan.counts.PASS + scan.counts.FAIL + scan.counts.CANNOT_SCAN;
  const duration = scan.finished_at
    ? Math.max(
        0,
        (Date.parse(scan.finished_at) - Date.parse(scan.started_at)) / 1000,
      ).toFixed(1)
    : null;
  return (
    <section className="results-section">
      <div className="section-kicker">
        <span className="small-step">
          <Check size={12} />
        </span>{" "}
        YOUR SECURITY POSTURE
      </div>
      <div className="section-heading">
        <div>
          <h1>A little insight. A clear next step.</h1>
          <p>
            Scan completed{" "}
            {new Date(scan.finished_at || scan.started_at).toLocaleString()} ·{" "}
            {duration}s
          </p>
        </div>
        <button className="button secondary" onClick={onReset}>
          <RotateCcw size={15} /> New scan
        </button>
      </div>
      <div className="summary-grid">
        <div className="panel score-panel">
          <div>
            <span className="metric-label">Posture score</span>
            <div className="score-number">
              {scan.score ?? "N/A"}
              {scan.score !== null && <span>/ 100</span>}
            </div>
            <p>Across selected accounts</p>
          </div>
          <div
            className="score-ring"
            style={{ "--score": `${scan.score ?? 0}%` } as React.CSSProperties}
          >
            <ShieldCheck size={25} />
          </div>
        </div>
        <Metric
          icon={<Check size={17} />}
          label="Passed checks"
          value={scan.counts.PASS}
          tone="pass"
        />
        <Metric
          icon={<TriangleAlert size={17} />}
          label="Needs attention"
          value={scan.counts.FAIL}
          tone="fail"
        />
        <Metric
          icon={<CircleAlert size={17} />}
          label="Could not scan"
          value={scan.counts.CANNOT_SCAN}
          tone="unknown"
        />
      </div>
      <div className="result-context">
        <div className="severity-overview">
          <span>Failed findings</span>
          {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((s) => (
            <span
              key={s}
              className={`severity-count severity-${s.toLowerCase()}`}
            >
              <i />
              {s.toLowerCase()} <b>{scan.fail_counts_by_severity[s] ?? 0}</b>
            </span>
          ))}
        </div>
        <span>{total} findings in total</span>
      </div>
      <div className="account-scores">
        {scan.account_ids.map((id) => {
          const account = accounts.find((a) => a.id === id);
          return (
            <div key={id} className="account-score">
              {account && <ProviderIcon provider={account.provider} />}
              <div>
                <span>{account?.name || id}</span>
                <small>{account ? providerNames[account.provider] : id}</small>
              </div>
              <strong>
                {scan.account_scores[id] ?? "N/A"}
                <small>
                  {scan.account_scores[id] !== null &&
                  scan.account_scores[id] !== undefined
                    ? " / 100"
                    : ""}
                </small>
              </strong>
            </div>
          );
        })}
      </div>
      <div className="panel findings-panel">
        <div className="panel-heading">
          <h2>
            Findings{" "}
            <span className="count-pill">{findings?.total ?? "—"}</span>
          </h2>
          <span>Prioritized by impact</span>
        </div>
        <div className="filter-bar">
          <Filter
            label="Status"
            value={filters.status}
            onChange={(v) => onFilter("status", v)}
            options={[
              ["PASS", "Passed"],
              ["FAIL", "Needs attention"],
              ["CANNOT_SCAN", "Could not scan"],
            ]}
          />
          <Filter
            label="Severity"
            value={filters.severity}
            onChange={(v) => onFilter("severity", v)}
            options={["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((s) => [
              s,
              s.charAt(0) + s.slice(1).toLowerCase(),
            ])}
          />
          <Filter
            label="Provider"
            value={filters.provider}
            onChange={(v) => onFilter("provider", v)}
            options={Object.entries(providerNames)}
          />
          <Filter
            label="Account"
            value={filters.account_id}
            onChange={(v) => onFilter("account_id", v)}
            options={scan.account_ids.map((id) => [
              id,
              accounts.find((a) => a.id === id)?.name || id,
            ])}
          />
          {Object.values(filters).some(Boolean) && (
            <button
              className="text-button"
              onClick={() => {
                (
                  ["status", "severity", "provider", "account_id"] as const
                ).forEach((k) => onFilter(k, ""));
              }}
            >
              Reset filters
            </button>
          )}
        </div>
        {loading ? (
          <div className="p-5">
            <ResultsSkeleton />
          </div>
        ) : findingsError ? (
          <div className="table-empty">
            <CircleAlert size={26} />
            <h3>Couldn’t load findings</h3>
            <p>{findingsError}</p>
            <button className="button secondary" onClick={onRetry}>
              Try again
            </button>
          </div>
        ) : !findings?.items.length ? (
          <div className="table-empty">
            <Search size={26} />
            <h3>No matching findings</h3>
            <p>Try another filter to see more of your results.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Check & resource</th>
                  <th>Severity</th>
                  <th>Account</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {findings.items.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <span className={`badge badge-${f.status.toLowerCase()}`}>
                        {f.status === "PASS" ? (
                          <Check size={12} />
                        ) : f.status === "FAIL" ? (
                          <TriangleAlert size={12} />
                        ) : (
                          <CircleAlert size={12} />
                        )}{" "}
                        {f.status === "PASS"
                          ? "Passed"
                          : f.status === "FAIL"
                            ? "Failed"
                            : "Cannot scan"}
                      </span>
                    </td>
                    <td>
                      <strong>{f.title}</strong>
                      <span className="resource-name">
                        {f.resource_id || "Account-level finding"}
                      </span>
                      <span className="check-id">
                        {f.check_id} {f.region && `· ${f.region}`}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`severity-label severity-${f.severity.toLowerCase()}`}
                      >
                        <i />
                        {f.severity.toLowerCase()}
                      </span>
                    </td>
                    <td className="account-cell">
                      {accounts.find((a) => a.id === f.account_id)?.name ||
                        f.account_id}
                      <span>{f.provider.toUpperCase()}</span>
                    </td>
                    <td className="details-cell">{f.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="pagination">
          <span>
            {findings?.total
              ? `${(page - 1) * findings.page_size + 1}–${Math.min(page * findings.page_size, findings.total)} of ${findings.total} findings`
              : "0 findings"}
          </span>
          <div>
            <button
              className="icon-button"
              aria-label="Previous page"
              disabled={page === 1 || loading}
              onClick={() => onPage(page - 1)}
            >
              <ChevronLeft size={17} />
            </button>
            <span>
              Page {page} of{" "}
              {Math.max(
                1,
                Math.ceil((findings?.total || 0) / (findings?.page_size || 8)),
              )}
            </span>
            <button
              className="icon-button"
              aria-label="Next page"
              disabled={
                loading ||
                !findings ||
                page * findings.page_size >= findings.total
              }
              onClick={() => onPage(page + 1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
      <p className="score-note">
        Posture score = passed ÷ (passed + failed). Checks that could not run
        are excluded.
      </p>
    </section>
  );
}
function Metric({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="panel metric-panel">
      <span className={`metric-icon ${tone}`}>{icon}</span>
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <label className="filter-label">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">
          All {label.toLowerCase()}
          {label === "Severity" ? " levels" : label === "Status" ? "es" : "s"}
        </option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
