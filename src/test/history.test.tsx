import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ScanHistory from "../components/ScanHistory";
import CheckCatalog from "../components/CheckCatalog";
import { api } from "../lib/api";
import type { Scan } from "../lib/types";

afterEach(() => vi.restoreAllMocks());

describe("Persisted scan history", () => {
  it("opens a database scan without starting a new scan", async () => {
    const scan: Scan = {
      id: "persisted-scan",
      status: "COMPLETED",
      account_ids: ["123456789012"],
      started_at: "2026-10-01T00:00:00Z",
      finished_at: "2026-10-01T00:00:03Z",
      error_message: null,
      score: 61.4,
      counts: { PASS: 27, FAIL: 17, CANNOT_SCAN: 5 },
      fail_counts_by_severity: { CRITICAL: 7, HIGH: 7, MEDIUM: 2, LOW: 1 },
      account_scores: {},
    };
    vi.spyOn(api, "listScans").mockResolvedValue([scan]);
    const start = vi.spyOn(api, "startScan");
    const open = vi.fn();
    render(<ScanHistory onOpen={open} />);
    expect(screen.getByLabelText("Scan history")).not.toHaveAttribute("open");
    await userEvent.click(screen.getByText("Scan history", { exact: true }));
    await userEvent.click(
      await screen.findByRole("button", { name: "Open scan persisted-scan" }),
    );
    expect(open).toHaveBeenCalledWith("persisted-scan");
    expect(start).not.toHaveBeenCalled();
    expect(screen.getByText("61.4 / 100")).toBeInTheDocument();
    expect(screen.getByText("3.0s")).toBeInTheDocument();
  });
  it("shows an empty state when the backend has no scans", async () => {
    vi.spyOn(api, "listScans").mockResolvedValue([]);
    render(<ScanHistory onOpen={vi.fn()} />);
    await userEvent.click(screen.getByText("Scan history", { exact: true }));
    expect(await screen.findByText("No scans yet")).toBeVisible();
    await userEvent.click(screen.getByText("Scan history", { exact: true }));
    expect(screen.getByLabelText("Scan history")).not.toHaveAttribute("open");
  });
  it("shows a connection error rather than generating history", async () => {
    vi.spyOn(api, "listScans").mockRejectedValue(new Error("API offline"));
    render(<ScanHistory onOpen={vi.fn()} />);
    await userEvent.click(screen.getByText("Scan history", { exact: true }));
    expect(await screen.findByRole("alert")).toHaveTextContent("API offline");
    expect(
      screen.queryByRole("button", { name: /Open scan/ }),
    ).not.toBeInTheDocument();
  });
});
it("renders catalog entries received from the API", async () => {
  render(
    <CheckCatalog
      checks={[
        {
          check_id: "AWS-S3-01",
          title: "S3 bucket blocks public access",
          provider: "aws",
          severity: "HIGH",
          collection: "s3_buckets",
          resource_id_field: "name",
        },
      ]}
      loading={false}
      error=""
      onRetry={vi.fn()}
    />,
  );
  await userEvent.click(screen.getByText(/Security check catalog/));
  expect(screen.getByText("S3 bucket blocks public access")).toBeVisible();
});
