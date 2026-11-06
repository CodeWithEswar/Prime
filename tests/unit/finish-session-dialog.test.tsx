import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FinishSessionDialog } from "@/features/focus/components/finish-session-dialog";

describe("FinishSessionDialog — Design System Checkbox Integration", () => {
  it("renders the design system Checkbox with label and handles state changes", () => {
    const handleConfirm = vi.fn();
    render(
      <FinishSessionDialog
        open={true}
        onOpenChange={vi.fn()}
        elapsedFormatted="10m 27s"
        taskTitle="DBMS Day 2 · Relational Model"
        onConfirmFinish={handleConfirm}
      />
    );

    // Verify checkbox is rendered through design system
    const checkbox = screen.getByRole("checkbox", {
      name: /mark task complete in daily plan/i,
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();

    // Toggle off
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    // Confirm finish
    const finishBtn = screen.getByRole("button", { name: /finish session/i });
    fireEvent.click(finishBtn);

    expect(handleConfirm).toHaveBeenCalledWith({ markComplete: false });
  });

  it("confirms with markComplete true by default when not unchecked", () => {
    const handleConfirm = vi.fn();
    render(
      <FinishSessionDialog
        open={true}
        onOpenChange={vi.fn()}
        elapsedFormatted="10m 27s"
        taskTitle="DBMS Day 2 · Relational Model"
        onConfirmFinish={handleConfirm}
      />
    );

    const finishBtn = screen.getByRole("button", { name: /finish session/i });
    fireEvent.click(finishBtn);

    expect(handleConfirm).toHaveBeenCalledWith({ markComplete: true });
  });
});
