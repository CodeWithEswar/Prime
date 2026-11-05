import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  TimePicker,
  parseTimeString,
  formatTimeString,
  formatDisplayTime,
} from "@/components/ui/time-picker";

describe("TimePicker Utility Functions", () => {
  it("correctly parses 24-hour time strings", () => {
    expect(parseTimeString("09:30")).toEqual({ hour: 9, minute: 30, period: "AM" });
    expect(parseTimeString("14:00")).toEqual({ hour: 2, minute: 0, period: "PM" });
    expect(parseTimeString("00:15")).toEqual({ hour: 12, minute: 15, period: "AM" });
    expect(parseTimeString("12:45")).toEqual({ hour: 12, minute: 45, period: "PM" });
    expect(parseTimeString("23:59")).toEqual({ hour: 11, minute: 59, period: "PM" });
    expect(parseTimeString(null)).toBeNull();
    expect(parseTimeString("")).toBeNull();
    expect(parseTimeString("invalid")).toBeNull();
  });

  it("correctly formats time string to 24-hour format", () => {
    expect(formatTimeString(9, 30, "AM")).toBe("09:30");
    expect(formatTimeString(2, 0, "PM")).toBe("14:00");
    expect(formatTimeString(12, 15, "AM")).toBe("00:15");
    expect(formatTimeString(12, 45, "PM")).toBe("12:45");
  });

  it("correctly formats display time with AM/PM", () => {
    expect(formatDisplayTime(9, 30, "AM")).toBe("09:30 AM");
    expect(formatDisplayTime(2, 0, "PM")).toBe("02:00 PM");
    expect(formatDisplayTime(12, 5, "AM")).toBe("12:05 AM");
  });
});

describe("TimePicker Component", () => {
  it("renders with placeholder when no value is provided", () => {
    render(<TimePicker placeholder="--:-- --" />);
    expect(screen.getByText("--:-- --")).toBeInTheDocument();
  });

  it("renders formatted display time when valid value is provided", () => {
    render(<TimePicker value="14:30" />);
    expect(screen.getByText("02:30 PM")).toBeInTheDocument();
  });

  it("opens popover on click and shows time selection columns and presets", () => {
    render(<TimePicker value="09:00" />);
    const trigger = screen.getByRole("button", { name: /09:00 AM/i });
    fireEvent.click(trigger);

    expect(screen.getByText("Select Time")).toBeInTheDocument();
    expect(screen.getByText("Morning")).toBeInTheDocument();
    expect(screen.getByText("Afternoon")).toBeInTheDocument();
    expect(screen.getByText("Evening")).toBeInTheDocument();
    expect(screen.getByText("Night")).toBeInTheDocument();
  });

  it("calls onChange when a preset is selected", () => {
    const handleChange = vi.fn();
    render(<TimePicker value="09:00" onChange={handleChange} />);
    const trigger = screen.getByRole("button", { name: /09:00 AM/i });
    fireEvent.click(trigger);

    const afternoonPreset = screen.getByRole("button", { name: /Afternoon/i });
    fireEvent.click(afternoonPreset);

    expect(handleChange).toHaveBeenCalledWith("14:00");
  });

  it("calls onChange with null when cleared", () => {
    const handleChange = vi.fn();
    render(<TimePicker value="14:30" onChange={handleChange} />);
    const clearButton = screen.getByTitle("Clear time");
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith(null);
  });
});

