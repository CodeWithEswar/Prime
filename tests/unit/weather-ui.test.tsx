import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  WeatherProvider,
  useWeatherPreferences,
} from "@/features/weather/weather-provider";
import { WeatherHeaderIndicator } from "@/features/weather/components/weather-header-indicator";
import { LocationSelector } from "@/features/weather/components/location-selector";
import { cityFixture, weatherFixture } from "../fixtures/weather";
import { normalizeForecast } from "@/lib/weather/normalize";
const clients: QueryClient[] = [];
function Probe() {
  const p = useWeatherPreferences();
  return (
    <>
      <output data-testid="preferences">
        {JSON.stringify({ location: p.location, unit: p.unit })}
      </output>
      <button onClick={() => p.setCity(cityFixture)}>Select city</button>
      <button onClick={() => void p.locateDevice()}>Locate</button>
      <button onClick={() => p.setUnit("fahrenheit")}>Fahrenheit</button>
      {p.geoError && <p role="alert">{p.geoError}</p>}
    </>
  );
}
function wrapper(userId = "user-a") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clients.push(client);
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <TooltipProvider>
          <WeatherProvider userId={userId}>{children}</WeatherProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  };
}
beforeEach(() => localStorage.clear());
afterEach(() => {
  clients.splice(0).forEach((c) => c.clear());
  vi.unstubAllGlobals();
});
describe("weather preferences and UI", () => {
  it("shows a resolved device city without persisting the device location", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({
            coords: { latitude: 14.447856, longitude: 79.987654 },
          } as GeolocationPosition),
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              place: {
                name: "Nellore",
                admin1: "Andhra Pradesh",
                country: "India",
                countryCode: "IN",
              },
            })
          )
      )
    );
    render(<Probe />, { wrapper: wrapper() });
    fireEvent.click(screen.getByText("Locate"));
    await waitFor(() =>
      expect(screen.getByTestId("preferences")).toHaveTextContent('"name":"Nellore"')
    );
    expect(
      JSON.parse(localStorage.getItem("prime:weather:v1:user-a")!).location
    ).toBeNull();
  });
  it("a late device place lookup cannot replace a manually selected city", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({
            coords: { latitude: 51.51, longitude: -0.13 },
          } as GeolocationPosition),
      },
    });
    let finish!: (response: Response) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            finish = resolve;
          })
      )
    );
    render(<Probe />, { wrapper: wrapper() });
    fireEvent.click(screen.getByText("Locate"));
    await waitFor(() =>
      expect(screen.getByTestId("preferences")).toHaveTextContent("Current location")
    );
    fireEvent.click(screen.getByText("Select city"));
    finish(
      new Response(
        JSON.stringify({
          place: {
            name: "London",
            admin1: "England",
            country: "United Kingdom",
            countryCode: "GB",
          },
        })
      )
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByTestId("preferences")).toHaveTextContent('"mode":"city"');
    expect(screen.getByTestId("preferences")).toHaveTextContent("Nellore");
  });
  it("does not request geolocation or invent header conditions on first use", () => {
    const geo = vi.fn();
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition: geo },
    });
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    render(
      <>
        <Probe />
        <WeatherHeaderIndicator />
      </>,
      { wrapper: wrapper() }
    );
    expect(
      screen.getByRole("link", { name: "Open Weather. Choose a location." })
    ).toHaveAttribute("href", "/weather");
    expect(geo).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("persists a selected city and units for this account on this device", () => {
    const first = render(<Probe />, { wrapper: wrapper() });
    fireEvent.click(screen.getByText("Select city"));
    fireEvent.click(screen.getByText("Fahrenheit"));
    const saved = JSON.parse(localStorage.getItem("prime:weather:v1:user-a")!);
    expect(saved).toMatchObject({
      unit: "fahrenheit",
      location: { id: cityFixture.id, mode: "city" },
    });
    first.unmount();
    const restored = render(<Probe />, { wrapper: wrapper() });
    expect(screen.getByTestId("preferences")).toHaveTextContent("Nellore");
    restored.unmount();
    render(<Probe />, { wrapper: wrapper("user-b") });
    expect(screen.getByTestId("preferences")).toHaveTextContent('"location":null');
  });
  it("keeps device coordinates in memory and out of persistent settings", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({
            coords: { latitude: 14.447856, longitude: 79.987654 },
          } as GeolocationPosition),
      },
    });
    render(<Probe />, { wrapper: wrapper() });
    fireEvent.click(screen.getByText("Locate"));
    await waitFor(() =>
      expect(screen.getByTestId("preferences")).toHaveTextContent("Current location")
    );
    const raw = localStorage.getItem("prime:weather:v1:user-a")!;
    expect(JSON.parse(raw).location).toBeNull();
    expect(raw).not.toContain("14.44");
    expect(raw).not.toContain("79.98");
  });
  it("shows actual header data from the shared gateway", async () => {
    localStorage.setItem(
      "prime:weather:v1:user-a",
      JSON.stringify({ unit: "celsius", location: cityFixture })
    );
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify(
              normalizeForecast(
                weatherFixture(),
                cityFixture.latitude,
                cityFixture.longitude
              )
            )
          )
      )
    );
    render(<WeatherHeaderIndicator />, { wrapper: wrapper() });
    expect(
      await screen.findByRole("link", { name: /Nellore, 26°C, Light rain/ })
    ).toHaveAttribute("href", "/weather");
  });
  it("debounces city search and supports keyboard selection", async () => {
    const changed = vi.fn(),
      fetch = vi.fn(
        async () => new Response(JSON.stringify({ locations: [cityFixture] }))
      );
    vi.stubGlobal("fetch", fetch);
    render(
      <>
        <Probe />
        <LocationSelector open onOpenChange={changed} />
      </>,
      { wrapper: wrapper() }
    );
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "N" } });
    await new Promise((r) => setTimeout(r, 350));
    expect(fetch).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "Nel" } });
    fireEvent.change(input, { target: { value: "Nellore" } });
    expect(await screen.findByRole("option", { name: /Nellore/ })).toBeVisible();
    expect(fetch).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(changed).toHaveBeenCalledWith(false);
    expect(
      JSON.parse(localStorage.getItem("prime:weather:v1:user-a")!).location.name
    ).toBe("Nellore");
  });
  it("keeps city search available after permission is denied", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (_success: PositionCallback, error: PositionErrorCallback) =>
          error({ code: 1 } as GeolocationPositionError),
      },
    });
    render(<LocationSelector open onOpenChange={() => {}} />, { wrapper: wrapper() });
    fireEvent.click(screen.getByRole("button", { name: "Use my location" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("denied");
    expect(screen.getByRole("combobox")).toBeEnabled();
  });
});
