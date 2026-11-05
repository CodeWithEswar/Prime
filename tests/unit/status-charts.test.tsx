import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LatencyChart } from "@/app/status/components/latency-chart";
import { AvailabilityChart } from "@/app/status/components/availability-chart";
import type { HealthObservation, DailyRollup } from "@/workers/prime-monitor/src/types/monitoring";

describe("Status Page Charts (Developer-Grade Architecture)", () => {
  const mockObservations: HealthObservation[] = [
    {
      serviceId: "backend-db",
      scheduledAt: "2026-11-05T01:00:00Z",
      checkedAt: "2026-11-05T01:00:00Z",
      status: "up",
      responseTimeMs: 210,
      httpStatus: 200,
      errorCode: null,
    },
    {
      serviceId: "backend-db",
      scheduledAt: "2026-11-05T01:10:00Z",
      checkedAt: "2026-11-05T01:10:00Z",
      status: "up",
      responseTimeMs: 340,
      httpStatus: 200,
      errorCode: null,
    },
    {
      serviceId: "backend-db",
      scheduledAt: "2026-11-05T01:20:00Z",
      checkedAt: "2026-11-05T01:20:00Z",
      status: "up",
      responseTimeMs: 420,
      httpStatus: 200,
      errorCode: null,
    },
  ];

  const mockRollups: DailyRollup[] = [
    {
      serviceId: "backend-db",
      date: "2026-11-05",
      status: "operational",
      successfulChecks: 144,
      failedChecks: 0,
      unknownChecks: 0,
      totalChecks: 144,
      uptimePercentage: 100,
      averageLatencyMs: 220,
      p95LatencyMs: 410,
    },
  ];

  describe("LatencyChart", () => {
    it("renders telemetry metric cards and status badge", () => {
      render(<LatencyChart observations={mockObservations} />);

      expect(screen.getByText("Backend Probe Latency")).toBeInTheDocument();
      expect(screen.getByText("Nominal Performance")).toBeInTheDocument();
      expect(screen.getByText("Current")).toBeInTheDocument();
      expect(screen.getByText("Mean")).toBeInTheDocument();
      expect(screen.getByText("P95 Peak")).toBeInTheDocument();
      expect(screen.getByText("Max Peak")).toBeInTheDocument();
    });

    it("renders empty state fallback gracefully when no observations exist", () => {
      render(<LatencyChart observations={[]} />);
      expect(
        screen.getByText(/Awaiting telemetry observations/i)
      ).toBeInTheDocument();
    });

    it("allows switching between recent and full window range", () => {
      render(<LatencyChart observations={mockObservations} />);
      const fullWindowBtn = screen.getByRole("button", { name: "Full Window" });
      fireEvent.click(fullWindowBtn);
      expect(fullWindowBtn).toHaveClass("bg-neutral-800");
    });
  });

  describe("AvailabilityChart", () => {
    it("renders 14-day timeline matrix with pre-monitoring baseline without empty void", () => {
      render(<AvailabilityChart rollups={mockRollups} />);

      expect(screen.getByText(/Daily Availability & SLO/i)).toBeInTheDocument();
      expect(screen.getByText("99.9% Target Met")).toBeInTheDocument();
      expect(screen.getByText("14d Uptime")).toBeInTheDocument();
      expect(screen.getByText("SLA Target")).toBeInTheDocument();
      expect(screen.getByText("Error Budget")).toBeInTheDocument();
      expect(screen.getByText("14-Day Matrix")).toBeInTheDocument();
      expect(screen.getByText("SLO Curve")).toBeInTheDocument();
    });

    it("toggles between 14-Day Matrix and SLO Curve view modes", () => {
      render(<AvailabilityChart rollups={mockRollups} />);

      const curveBtn = screen.getByRole("button", { name: "SLO Curve" });
      fireEvent.click(curveBtn);
      expect(curveBtn).toHaveClass("bg-neutral-800");

      const matrixBtn = screen.getByRole("button", { name: "14-Day Matrix" });
      fireEvent.click(matrixBtn);
      expect(matrixBtn).toHaveClass("bg-neutral-800");
    });
  });
});

