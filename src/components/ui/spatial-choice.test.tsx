import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SpatialChoice } from "./spatial-choice";

afterEach(cleanup);
describe("controlled spatial selection", () => {
  it("hover never commits a selection", () => {
    const change = vi.fn();
    render(<SpatialChoice value="online" label="Presence" onChange={change} options={[{ value: "online", label: "Online" }, { value: "offline", label: "Offline" }]} />);
    fireEvent.pointerEnter(screen.getByRole("button", { name: "Offline" }));
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Offline" }));
    expect(change).toHaveBeenCalledWith("offline");
  });
  it("disabled choices cannot invoke a status update", () => {
    const change = vi.fn();
    render(<SpatialChoice value="online" label="Presence" onChange={change} disabled options={[{ value: "online", label: "Online" }, { value: "offline", label: "Offline" }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Offline" }));
    expect(change).not.toHaveBeenCalled();
  });
});