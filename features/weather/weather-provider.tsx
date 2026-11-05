"use client";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { z } from "zod";
import {
  weatherLocationSchema,
  type WeatherLocation,
  type TemperatureUnit,
} from "@/lib/weather/schema";
import { requestDeviceLocation, resolveDevicePlace } from "./geolocation";
const preferencesSchema = z.object({
  unit: z.enum(["celsius", "fahrenheit"]).default("celsius"),
  location: weatherLocationSchema
    .refine((v) => v.mode === "city")
    .nullable()
    .default(null),
});
const eventName = "prime-weather-preferences";
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(eventName, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(eventName, listener);
  };
}
interface WeatherPreferences {
  location: WeatherLocation | null;
  unit: TemperatureUnit;
  setCity: (location: WeatherLocation) => void;
  setUnit: (unit: TemperatureUnit) => void;
  clear: () => void;
  locateDevice: () => Promise<boolean>;
  locating: boolean;
  geoError: string;
}
const fallback: WeatherPreferences = {
  location: null as WeatherLocation | null,
  unit: "celsius" as TemperatureUnit,
  setCity: () => {},
  setUnit: () => {},
  clear: () => {},
  locateDevice: async () => false,
  locating: false,
  geoError: "",
};
const WeatherContext = createContext(fallback);
export function WeatherProvider({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const key = `prime:weather:v1:${userId}`;
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key) ?? "";
      } catch {
        return "";
      }
    },
    () => ""
  );
  const stored = useMemo(() => {
    try {
      return preferencesSchema.parse(JSON.parse(raw));
    } catch {
      return { unit: "celsius" as TemperatureUnit, location: null };
    }
  }, [raw]);
  const [device, setDevice] = useState<WeatherLocation | null>(null),
    [volatile, setVolatile] = useState<typeof stored | null>(null),
    [locating, setLocating] = useState(false),
    [geoError, setGeoError] = useState("");
  const preferences = volatile ?? stored;
  const lookup = useRef<AbortController | null>(null),
    selection = useRef(0);
  useEffect(
    () => () => {
      selection.current++;
      lookup.current?.abort();
    },
    []
  );
  function cancelLookup() {
    selection.current++;
    lookup.current?.abort();
  }
  function save(next: typeof stored) {
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setVolatile(null);
      window.dispatchEvent(new Event(eventName));
    } catch {
      setVolatile(next);
    }
  }
  function setCity(location: WeatherLocation) {
    const city = weatherLocationSchema.parse(location);
    if (city.mode !== "city") throw new Error("Choose a city from search results.");
    cancelLookup();
    setDevice(null);
    setGeoError("");
    save({ ...preferences, location: city });
  }
  async function locateDevice() {
    if (locating) return false;
    cancelLookup();
    const version = selection.current;
    setLocating(true);
    setGeoError("");
    try {
      const position = await requestDeviceLocation(navigator.geolocation);
      if (version !== selection.current) return true;
      save({ ...preferences, location: null });
      setDevice(position);
      const controller = new AbortController();
      lookup.current = controller;
      void resolveDevicePlace(position, controller.signal).then((place) => {
        if (place && !controller.signal.aborted && version === selection.current)
          setDevice({ ...position, ...place });
      });
      return true;
    } catch (error) {
      setGeoError(error instanceof Error ? error.message : "Search for a city instead.");
      return false;
    } finally {
      setLocating(false);
    }
  }
  return (
    <WeatherContext.Provider
      value={{
        location: device ?? preferences.location,
        unit: preferences.unit,
        setCity,
        setUnit: (unit) => save({ ...preferences, unit }),
        clear: () => {
          cancelLookup();
          setDevice(null);
          save({ ...preferences, location: null });
        },
        locateDevice,
        locating,
        geoError,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}
export const useWeatherPreferences = () => useContext(WeatherContext);
