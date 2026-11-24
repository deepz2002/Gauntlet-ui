import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity as ActivityIcon,
  Braces,
  Check,
  CircleAlert,
  Cloud,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { Brand } from "./components/Brand";
import Home from "./components/Home";
import ScanLauncher from "./components/ScanLauncher";
import Results from "./components/Results";
import ApiDrawer from "./components/ApiDrawer";
import ScanHistory from "./components/ScanHistory";
import CheckCatalog from "./components/CheckCatalog";
import { useCheckCatalog } from "./hooks/useCheckCatalog";
import { ResultsSkeleton } from "./components/Skeleton";
import { api, subscribeActivity } from "./lib/api";
import { emptyFilters } from "./lib/types";
import type { Activity, Filters, FindingsPage, Scan } from "./lib/types";
export default function App() {
  const [route, setRoute] = useState(
    () => window.location.hash.slice(1) || "/",
  );
  const routeId = route.startsWith("/scans/") ? route.slice(7) : null;
  const view = route === "/" ? "home" : "workspace";
  const catalog = useCheckCatalog(view === "workspace");
  const [opening, setOpening] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailRetry, setDetailRetry] = useState(0);
  function navigate(path: string) {
    window.location.hash = path;
    window.scrollTo({ top: 0 });
  }
  useEffect(() => {
    const changed = () => setRoute(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  const [drawer, setDrawer] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [scan, setScan] = useState<Scan | null>(null);
  const activeScanId = scan?.id;
  const scanStatus = scan?.status;
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [findings, setFindings] = useState<FindingsPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [findingsError, setFindingsError] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(
    () =>
      subscribeActivity((item) =>
        setActivities((previous) => {
          const found = previous.some((p) => p.id === item.id);
          return found
            ? previous.map((p) => (p.id === item.id ? item : p))
            : [item, ...previous].slice(0, 60);
        }),
      ),
    [],
  );
  const closeDrawer = useCallback(() => setDrawer(false), []);
  useEffect(() => {
    setScan(null);
    setFindings(null);
    setFilters(emptyFilters);
    setPage(1);
    setError("");
    setDetailError("");
    if (!routeId) {
      setOpening(false);
      return;
    }
    const controller = new AbortController();
    let stopped = false;
    setOpening(true);
    api
      .getScan(routeId, controller.signal)
      .then((result) => {
        if (!stopped) setScan(result);
      })
      .catch((err) => {
        if (!stopped)
          setDetailError(
            err instanceof Error ? err.message : "Unable to open scan",
          );
      })
      .finally(() => {
        if (!stopped) setOpening(false);
      });
    return () => {
      stopped = true;
      controller.abort();
    };
  }, [routeId, detailRetry]);

  useEffect(() => {
    if (scanStatus !== "RUNNING" || !activeScanId) return;
    const controller = new AbortController();
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const next = await api.getScan(activeScanId!, controller.signal);
        if (stopped) return;
        setScan(next);
        setError("");
        if (next.status === "RUNNING") timer = setTimeout(poll, 1500);
      } catch (err) {
        if (stopped) return;
        setError(
          err instanceof Error
            ? err.message
            : "The API is unavailable. Retrying…",
        );
        timer = setTimeout(poll, 2500);
      }
    }
    timer = setTimeout(poll, 1200);
    return () => {
      stopped = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [activeScanId, scanStatus]);
  useEffect(() => {
    if (scanStatus !== "COMPLETED" || !activeScanId) return;
    const controller = new AbortController();
    let stopped = false;
    setLoading(true);
    setFindingsError("");
    api
      .getFindings(activeScanId, filters, page, controller.signal)
      .then((data) => {
        if (!stopped) setFindings(data);
      })
      .catch((err) => {
        if (!stopped)
          setFindingsError(
            err instanceof Error ? err.message : "Unable to load findings",
          );
      })
      .finally(() => {
        if (!stopped) setLoading(false);
      });
    return () => {
      stopped = true;
      controller.abort();
    };
  }, [activeScanId, scanStatus, filters, page, retry]);
  async function runScan() {
    if (starting) return;
    setStarting(true);
    setError("");
    setFindings(null);
    setFilters(emptyFilters);
    setPage(1);
    try {
      const result = await api.startScan();
      if (mounted.current) navigate(`/scans/${result.id}`);
    } catch (err) {
      if (mounted.current)
        setError(
          err instanceof Error
            ? err.message
            : "Cannot reach the backend. Check that it is running on port 8000.",
        );
    } finally {
      if (mounted.current) setStarting(false);
    }
  }
  function changeFilter(key: keyof Filters, value: string) {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setPage(1);
  }
  const running = scan?.status === "RUNNING";
  return (
    <div className={`app-shell ${drawer ? "drawer-is-open" : ""}`}>
      <div className="main-shell">
        <header className="site-header">
          <button
            className="brand-button"
            aria-label="Mini Gauntlet home"
            onClick={() => navigate("/")}
          >
            <Brand />
          </button>
          <nav aria-label="Main navigation">
            {view === "workspace" && (
              <span className="nav-workspace">
                <span className="nav-divider" />
                Workspace
              </span>
            )}
            <span className="header-caption">
              <ShieldCheck size={14} /> Cloud security, made clear
            </span>
            <button
              className={`api-toggle ${drawer ? "active" : ""}`}
              aria-label="API activity"
              aria-expanded={drawer}
              onClick={() => setDrawer(!drawer)}
            >
              <Braces size={16} />
              <span>API activity</span>
              {activities.length > 0 && <span className="activity-dot" />}
            </button>
          </nav>
        </header>
        {view === "home" ? (
          <Home
            onStart={() => {
              navigate("/scans");
            }}
          />
        ) : (
          <main className="workspace-main">
            <div className="workspace-topline">
              <span>
                <Cloud size={15} /> Cloud workspace <span>/</span> Security scan
              </span>
            </div>
            {routeId && (
              <button
                className="button secondary history-back"
                onClick={() => navigate("/scans")}
              >
                All scans
              </button>
            )}
            {error && (
              <div role="alert" className="error-banner">
                <CircleAlert size={18} />
                <div>
                  <strong>
                    {running
                      ? "Connection interrupted"
                      : "Unable to start scan"}
                  </strong>
                  <p>
                    {error}
                    {running ? " · Reconnecting automatically." : ""}
                  </p>
                </div>
              </div>
            )}
            {routeId && (opening || (!scan && !detailError)) ? (
              <ResultsSkeleton />
            ) : routeId && detailError ? (
              <div className="panel table-empty" role="alert">
                <CircleAlert size={25} />
                <h2>Couldn’t open this scan</h2>
                <p>{detailError}</p>
                <button
                  className="button secondary"
                  onClick={() => setDetailRetry((value) => value + 1)}
                >
                  Retry scan
                </button>
              </div>
            ) : !routeId || !scan || scan.status === "FAILED" ? (
              <>
                {scan?.status === "FAILED" && (
                  <div className="error-banner" role="alert">
                    <CircleAlert size={18} />
                    <div>
                      <strong>The scan could not finish</strong>
                      <p>
                        {scan.error_message ||
                          "An unexpected error stopped this scan. Start a new scan to try again."}
                      </p>
                    </div>
                  </div>
                )}
                <ScanLauncher onRun={runScan} busy={starting} />
                <ScanHistory onOpen={(id) => navigate(`/scans/${id}`)} />
                <CheckCatalog
                  checks={catalog.checks}
                  loading={catalog.loading}
                  error={catalog.error}
                  onRetry={catalog.retry}
                />
              </>
            ) : running ? (
              <section className="scanning-section">
                <div className="section-kicker">YOUR SCAN IS IN PROGRESS</div>
                <div className="scan-progress-icon">
                  <ScanLine size={30} />
                </div>
                <h1>Looking a little closer.</h1>
                <p>
                  Checking your cloud inventory for security gaps.
                  <br />
                  Your results will appear as soon as the scan finishes.
                </p>
                <div className="scan-progress">
                  <span />
                </div>
                <span className="scan-stage">
                  <ActivityIcon size={14} /> Evaluating{" "}
                  {scan.account_ids.length} cloud accounts
                </span>
                <ResultsSkeleton />
              </section>
            ) : (
              <Results
                scan={scan}
                findings={findings}
                loading={loading || (!findings && !findingsError)}
                filters={filters}
                onFilter={changeFilter}
                page={page}
                onPage={setPage}
                onReset={() => {
                  navigate("/scans");
                }}
                findingsError={findingsError}
                onRetry={() => setRetry((r) => r + 1)}
              />
            )}
          </main>
        )}
        <footer className="site-footer">
          <span>
            <ShieldCheck size={14} /> A small scan. A stronger cloud.
          </span>
          <span>
            Mini Gauntlet <span className="footer-separator">/</span> Built for
            peace of mind <Check size={13} />
          </span>
        </footer>
      </div>
      <ApiDrawer
        open={drawer}
        onClose={closeDrawer}
        activities={activities}
        onClear={() => setActivities([])}
      />
    </div>
  );
}
