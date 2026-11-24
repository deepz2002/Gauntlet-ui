import type {
  Activity,
  Filters,
  FindingsPage,
  Scan,
  SecurityCheck,
} from "./types";

const base = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "");
let onActivity: (item: Activity) => void = () => {};
export function subscribeActivity(listener: typeof onActivity) {
  onActivity = listener;
  return () => {
    onActivity = () => {};
  };
}

async function request<T>(
  method: "GET" | "POST",
  path: string,
  params?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const event: Activity = {
    id: crypto.randomUUID(),
    method,
    path,
    params,
    startedAt: new Date().toISOString(),
  };
  const start = performance.now();
  onActivity({ ...event });
  try {
    const response = await fetch(`${base}${path}`, {
      method,
      signal,
      ...(method === "POST"
        ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
          }
        : {}),
    });
    event.status = response.status;
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const message =
        typeof body?.detail === "string"
          ? body.detail
          : `Request failed (${response.status})`;
      throw new Error(message);
    }
    return (await response.json()) as T;
  } catch (error) {
    event.error =
      error instanceof Error ? error.message : "Unable to reach the API";
    throw error;
  } finally {
    event.duration = Math.round(performance.now() - start);
    onActivity({ ...event });
  }
}

export const api = {
  listScans: (signal?: AbortSignal) =>
    request<Scan[]>("GET", "/api/scans", undefined, signal),
  getChecks: (signal?: AbortSignal) =>
    request<SecurityCheck[]>("GET", "/api/checks", undefined, signal),
  startScan: (account_ids?: string[]) =>
    request<Scan>("POST", "/api/scans", account_ids ? { account_ids } : {}),
  getScan: (id: string, signal?: AbortSignal) =>
    request<Scan>(
      "GET",
      `/api/scans/${encodeURIComponent(id)}`,
      undefined,
      signal,
    ),
  getFindings: (
    id: string,
    filters: Filters,
    page: number,
    signal?: AbortSignal,
  ) => {
    const query = new URLSearchParams({ page: String(page), page_size: "8" });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    return request<FindingsPage>(
      "GET",
      `/api/scans/${encodeURIComponent(id)}/findings?${query}`,
      Object.fromEntries(query),
      signal,
    );
  },
};
