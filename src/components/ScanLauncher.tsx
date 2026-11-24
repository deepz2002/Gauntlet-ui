import { ScanLine, ShieldCheck } from "lucide-react";
export default function ScanLauncher({
  onRun,
  busy,
}: {
  onRun: () => void;
  busy: boolean;
}) {
  return (
    <section className="selection-section">
      <div className="section-kicker">YOUR SCAN WORKSPACE</div>
      <div className="section-heading">
        <div>
          <h1>Your clouds. One security scan.</h1>
          <p>
            Scan every account in your inventory across AWS, Azure and Google
            Cloud.
          </p>
        </div>
        <span className="inventory-tag">
          <span className="status-dot" /> All cloud accounts
        </span>
      </div>
      <div className="run-panel">
        <div className="run-icon">
          <ShieldCheck size={24} />
        </div>
        <div className="run-copy">
          <h2>Ready when you are.</h2>
          <p>
            All inventory accounts are included automatically. No provider
            selection needed.
          </p>
        </div>
        <button className="button primary" onClick={onRun} disabled={busy}>
          <ScanLine size={17} />
          {busy ? "Starting scan…" : "Run security scan"}
        </button>
      </div>
      <p className="selection-hint">
        Read-only inventory checks. Your cloud resources stay untouched.
      </p>
    </section>
  );
}
