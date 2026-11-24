import { afterEach, describe, expect, it, vi } from "vitest";
import { api, subscribeActivity } from "../lib/api";
import type { Activity } from "../lib/types";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  subscribeActivity(() => {})();
});

describe("API transport", () => {
  it("starts an all-account scan with an empty request body", async () => {
    const fetchRequest = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ id: "all-accounts", status: "RUNNING" }),
          { status: 202 },
        ),
      );
    vi.stubGlobal("fetch", fetchRequest);
    await api.startScan();
    expect(fetchRequest).toHaveBeenCalledWith(
      "http://localhost:8000/api/scans",
      expect.objectContaining({ method: "POST", body: "{}" }),
    );
  });
  it("loads scan history and the registered checks from their endpoints", async () => {
    const fetchRequest = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(new Response("[]", { status: 200 })),
      );
    vi.stubGlobal("fetch", fetchRequest);
    expect(await api.listScans()).toEqual([]);
    expect(await api.getChecks()).toEqual([]);
    expect(fetchRequest.mock.calls.map((call) => call[0])).toEqual([
      "http://localhost:8000/api/scans",
      "http://localhost:8000/api/checks",
    ]);
  });
  it("posts selected accounts and returns only the server response", async () => {
    const response = { id: "server-created-scan", status: "RUNNING" };
    const fetchRequest = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(response), { status: 202 }),
      );
    vi.stubGlobal("fetch", fetchRequest);
    expect(await api.startScan(["123456789012"])).toEqual(response);
    expect(fetchRequest).toHaveBeenCalledWith(
      "http://localhost:8000/api/scans",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ account_ids: ["123456789012"] }),
      }),
    );
  });
  it("propagates server errors and records their actual status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "Not Found" }), {
          status: 404,
        }),
      ),
    );
    const activity: Activity[] = [];
    subscribeActivity((item) => activity.push(item));
    await expect(api.startScan(["123456789012"])).rejects.toThrow("Not Found");
    expect(activity.at(-1)).toMatchObject({ status: 404, error: "Not Found" });
  });
  it("propagates a network failure without returning substitute results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(api.getScan("scan-id")).rejects.toThrow("Failed to fetch");
  });
});

it("uses same-origin requests when the Docker build sets an empty API base", async () => {
  vi.resetModules();
  vi.stubEnv("VITE_API_BASE_URL", "");
  const fetchRequest = vi.fn().mockResolvedValue(new Response("[]", { status: 200 }));
  vi.stubGlobal("fetch", fetchRequest);
  const { api: proxiedApi } = await import("../lib/api");
  await proxiedApi.listScans();
  expect(fetchRequest).toHaveBeenCalledWith("/api/scans", expect.objectContaining({method:"GET"}));
});
