import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Home from "../components/Home";
import ScanLauncher from "../components/ScanLauncher";
import ApiDrawer from "../components/ApiDrawer";
describe("Home", () => {
  it("opens the workspace from the main call to action", async () => {
    const start = vi.fn();
    render(<Home onStart={start} />);
    await userEvent.click(screen.getByRole("button", { name: /get started/i }));
    expect(start).toHaveBeenCalledOnce();
  });
});
describe("All-cloud scan launcher", () => {
  it("runs immediately without provider selection", async () => {
    const run = vi.fn();
    render(<ScanLauncher onRun={run} busy={false} />);
    const button = screen.getByRole("button", { name: /run security scan/i });
    expect(button).toBeEnabled();
    await userEvent.click(button);
    expect(run).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole("button", { name: /amazon web services/i }),
    ).not.toBeInTheDocument();
  });
  it("prevents duplicate requests while a scan is starting", () => {
    render(<ScanLauncher onRun={vi.fn()} busy />);
    expect(
      screen.getByRole("button", { name: /starting scan/i }),
    ).toBeDisabled();
  });
});
describe("API drawer", () => {
  it("shows posted account parameters and closes", async () => {
    const close = vi.fn();
    render(
      <ApiDrawer
        open
        onClose={close}
        onClear={vi.fn()}
        activities={[
          {
            id: "1",
            method: "POST",
            path: "/api/scans",
            params: { account_ids: ["123456789012"] },
            startedAt: new Date().toISOString(),
            status: 202,
          },
        ]}
      />,
    );
    expect(screen.getByText(/123456789012/)).toBeInTheDocument();
    expect(screen.getByText("202")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: /close api activity/i }),
    );
    expect(close).toHaveBeenCalledOnce();
  });
  it("does not render when collapsed", () => {
    render(
      <ApiDrawer
        open={false}
        onClose={vi.fn()}
        onClear={vi.fn()}
        activities={[]}
      />,
    );
    expect(screen.queryByLabelText("API activity")).not.toBeInTheDocument();
  });
});
