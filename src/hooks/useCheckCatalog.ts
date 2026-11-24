import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { SecurityCheck } from "../lib/types";
export function useCheckCatalog(active: boolean) {
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    let stopped = false;
    setLoading(true);
    setError("");
    api
      .getChecks(controller.signal)
      .then((rows) => {
        if (!stopped) setChecks(rows);
      })
      .catch((err) => {
        if (!stopped) {
          setChecks([]);
          setError(err instanceof Error ? err.message : "API unavailable");
        }
      })
      .finally(() => {
        if (!stopped) setLoading(false);
      });
    return () => {
      stopped = true;
      controller.abort();
    };
  }, [active, retry]);
  return {
    checks,
    loading,
    error,
    retry: () => setRetry((value) => value + 1),
  };
}
