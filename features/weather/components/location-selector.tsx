"use client";
import { useEffect, useId, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Location01Icon,
  Navigation03Icon,
  Search01Icon,
  LoaderIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWeatherPreferences } from "../weather-provider";
import { locationOptions } from "../queries";
export function LocationSelector({
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
}) {
  const { setCity, locateDevice, locating, geoError, location, clear } =
      useWeatherPreferences(),
    id = useId();
  const [query, setQuery] = useState(""),
    [debounced, setDebounced] = useState(""),
    [active, setActive] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);
  const results = useQuery(locationOptions(debounced, open)),
    waiting = query.trim() !== debounced;
  const locations = waiting ? [] : (results.data?.locations ?? []);
  async function locate() {
    if (await locateDevice()) onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="weather-location-dialog"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          searchRef.current?.focus();
        }}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DialogTitle>Choose your weather location</DialogTitle>
        <DialogDescription>
          Search for a city, or use your location for this session. Device coordinates are
          not saved.
        </DialogDescription>
        <Button
          variant="secondary"
          onClick={() => void locate()}
          disabled={locating}
          className="w-full"
        >
          <Icon
            icon={locating ? LoaderIcon : Navigation03Icon}
            size={16}
            aria-hidden="true"
            className={locating ? "animate-spin text-red-500" : ""}
          />
          <span>{locating ? "Finding your location…" : "Use my location"}</span>
        </Button>
        {geoError && (
          <p className="weather-message" role="alert">
            {geoError}
          </p>
        )}
        <label htmlFor={`${id}-search`} className="weather-field-label">
          Search city
        </label>
        <div className="weather-search-field">
          <Icon
            icon={waiting || results.isFetching ? LoaderIcon : Search01Icon}
            size={17}
            aria-hidden="true"
            className={
              waiting || results.isFetching
                ? "animate-spin text-red-500"
                : "text-neutral-400"
            }
          />
          <input
            ref={searchRef}
            id={`${id}-search`}
            role="combobox"
            aria-autocomplete="list"
            aria-controls={`${id}-results`}
            aria-expanded={locations.length > 0}
            aria-activedescendant={
              locations[active] ? `${id}-result-${active}` : undefined
            }
            autoComplete="off"
            value={query}
            placeholder="City or city, country"
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (["ArrowDown", "ArrowUp"].includes(e.key) && locations.length) {
                e.preventDefault();
                setActive(
                  (i) =>
                    (i + (e.key === "ArrowDown" ? 1 : -1) + locations.length) %
                    locations.length
                );
              }
              if (e.key === "Enter" && locations[active]) {
                e.preventDefault();
                setCity(locations[active]);
                onOpenChange(false);
              }
            }}
          />
        </div>
        <div
          id={`${id}-results`}
          role="listbox"
          aria-label="Matching cities"
          className="weather-location-results"
        >
          {locations.map((place, i) => (
            <button
              id={`${id}-result-${i}`}
              key={place.id}
              type="button"
              role="option"
              aria-selected={active === i}
              tabIndex={-1}
              onMouseMove={() => setActive(i)}
              onClick={() => {
                setCity(place);
                onOpenChange(false);
              }}
            >
              <Icon icon={Location01Icon} size={18} aria-hidden="true" />
              <span>
                <strong>{place.name}</strong>
                <small>{[place.admin1, place.country].filter(Boolean).join(", ")}</small>
              </span>
            </button>
          ))}
        </div>
        <p className="weather-message" role="status">
          {query.trim().length < 3 ? (
            "Enter at least 3 characters."
          ) : waiting || results.isFetching ? (
            <span className="inline-flex items-center gap-1.5 text-neutral-300">
              <Icon icon={LoaderIcon} size={14} className="animate-spin text-red-500" />
              <span>Searching cities…</span>
            </span>
          ) : results.isError ? (
            "City search is unavailable. Try again."
          ) : locations.length ? (
            `${locations.length} matching locations.`
          ) : (
            "No locations found. Try a nearby city or add a country."
          )}
        </p>
        {location?.mode === "city" && (
          <button
            className="weather-text-button"
            onClick={() => {
              clear();
              onOpenChange(false);
            }}
          >
            Clear saved city
          </button>
        )}
        <p className="weather-location-note">
          Selected cities are saved on this device only. No location history is collected.
          <br />
          City search by{" "}
          <a
            href="https://open-meteo.com/en/docs/geocoding-api"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open-Meteo
          </a>{" "}
          /{" "}
          <a href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer">
            GeoNames
          </a>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
}
