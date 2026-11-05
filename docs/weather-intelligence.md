# Weather Intelligence implementation

## Repository audit and reused infrastructure

The feature lives at the authenticated `/weather` route in PRIME's existing App Router dashboard shell. It reuses the Supabase server authentication helper, the shared TanStack Query client and query-key registry, existing Radix dialog primitives, Hugeicons, the reduced-motion hook, Motion, Recharts and PRIME chart primitives. Weather is available through shell navigation, command search and the compact linked header indicator. There is no additional database table, migration, planner integration or weather-specific authentication system.

The installed Next.js 16.4.3 route-handler, cache-life and CLI guides were consulted. Server caching uses the installed version's `use cache` and `cacheLife` APIs. The implementation uses the existing Cache Components configuration.

## Open-Meteo integration

The browser talks only to PRIME's same-origin weather gateway. The server uses:

- Forecast: `https://api.open-meteo.com/v1/forecast`
- Forward city search: `https://geocoding-api.open-meteo.com/v1/search`
- Optional server-only `OPEN_METEO_API_KEY` switches to Open-Meteo's customer forecast and customer geocoding hosts.

Forecast parameters use seven days, `timezone=auto`, `timeformat=unixtime`, Celsius, km/h and millimetres. The client converts temperatures without requesting another forecast. Display times use the returned IANA timezone through `Intl`, including DST changes.

Exact current variables:

```text
temperature_2m, relative_humidity_2m, apparent_temperature, precipitation,
weather_code, cloud_cover, pressure_msl, wind_speed_10m,
wind_direction_10m, wind_gusts_10m, is_day
```

Exact hourly variables:

```text
temperature_2m, apparent_temperature, precipitation_probability, precipitation,
weather_code, relative_humidity_2m, cloud_cover, wind_speed_10m,
wind_gusts_10m, visibility, dew_point_2m
```

Exact daily variables:

```text
weather_code, temperature_2m_max, temperature_2m_min, sunrise, sunset,
precipitation_probability_max, precipitation_sum, wind_speed_10m_max,
wind_gusts_10m_max
```

Provider references: [forecast documentation](https://open-meteo.com/en/docs), [geocoding documentation](https://open-meteo.com/en/docs/geocoding-api), [service terms](https://open-meteo.com/en/terms). The free service is intended for non-commercial use; configure the appropriate customer plan/key for commercial operation. No subscription was purchased by this implementation.

## Gateway, validation and caching

`lib/weather/` contains provider transport, normalization, schemas, scene rules, formatting, caching and gateway guards. Routes are:

| Route | Purpose |
| --- | --- |
| `/api/weather?lat=…&lon=…` | Current conditions, hourly forecast and seven daily summaries |
| `/api/weather/locations?q=…` | Validated city search |
| `/api/weather/location-name?lat=…&lon=…` | Optional coarse device-location place name |

Every endpoint checks the existing authenticated user. Zod validates coordinate bounds, decimal input, query length/characters, provider shapes and timezones. Coordinates are rounded to two decimal places before use. Parallel provider arrays are normalized into typed records once; missing readings stay null and display as unavailable, never as fabricated zeroes. Provider requests have bounded timeouts, controlled error responses and no raw provider-body or coordinate logging.

The server caches forecasts for ten minutes and city searches for an hour. A bounded per-instance rate guard allows twenty forecast requests and forty search/name requests per authenticated user per minute. This guard is not a distributed production quota across multiple instances. Browser-facing API responses are private and `no-store`; the shared server cache is keyed by coarse coordinates or normalized search text, not user identity.

## Device location and privacy

Geolocation is requested only after the user chooses **Use my location**. There is no startup permission request, background watch or location history. Permission denial, unsupported browsers and timeouts retain manual city search. The Permissions Policy allows same-origin geolocation while camera and microphone remain disabled.

Exact device coordinates are rounded immediately. Device location and its resolved name remain in memory; selecting GPS clears any saved city so a reload does not silently reuse device coordinates. Manually selected cities and temperature units persist in browser localStorage under an account-specific key. They are not written to Supabase and do not sync between devices. Storage failure falls back to memory. The provider resets with account changes.

Open-Meteo's forward search does not provide reverse lookup. A separate server-only Photon lookup resolves coarse coordinates to a city/town/village, state and country. It does not return streets, houses or provider geometry. The lookup is cached for a day, has a five-second timeout and cannot block the forecast. If it fails, the page keeps the forecast and a neutral current-location label. Abort/version guards prevent a late lookup from overwriting a newly selected city.

The default is Photon's public demo endpoint; `WEATHER_REVERSE_GEOCODER_URL` accepts an HTTPS Photon-compatible endpoint for managed hosting. Coarse coordinates are sent to Open-Meteo and Photon when the user requests device weather. Infrastructure/provider logs are outside the application-level no-history guarantee. Photon public-service availability and fair-use capacity are external dependencies. [Photon API documentation](https://github.com/komoot/photon/blob/master/docs/api-v1.md), [project and public-service guidance](https://github.com/komoot/photon), [OpenStreetMap attribution](https://www.openstreetmap.org/copyright).

## TanStack Query behavior

Central query keys identify the forecast by rounded latitude/longitude and city search by normalized text. Header and page share the same forecast cache. Forecast stale time is ten minutes, garbage collection thirty minutes, with ten-minute visible-only polling and stale refetch on window focus. One retry is allowed except for input, authentication and rate-limit errors. City search is debounced by 300ms, starts at three characters, stays cached for an hour and does not retry automatically.

Changing units does not fetch. Changing city produces a separate query, with no previous-city placeholder data. A failed background refresh retains the same city's cached readings and shows a retry/stale notice. Requests receive abort signals; late search results cannot become the selected city.

## Header and dedicated page

The header shows actual location, condition icon and temperature and links to `/weather`. It has a structural loading state and a neutral unavailable state. It hides on narrow mobile headers and compacts to icon/temperature on tablets. Its separate stylesheet and component do not import weather charts or scene media.

The page contains current location/conditions, feels-like and high/low, precipitation/humidity/wind, a deterministic near-term outlook, a keyboard-selectable 24-hour rail, two forecast charts, seven selectable daily rows, atmospheric measurements, a wind compass and selected-day sunrise/sunset. The solar progress marker appears only within a valid current-day sunrise/sunset interval; it is not an astronomical altitude calculation. Visibility and dew point are explicitly identified as nearest-hourly estimates.

There is no default dummy city or dummy forecast. First use offers location permission or city search. The layout adapts from 320px through wide desktop; horizontal forecast rails scroll inside their own panels. Temperature controls and Change location share the same height. Weather controls retain compact 32px desktop sizing and 44px coarse-pointer targets.

## Scenes and media strategy

One WMO mapping supplies condition labels, icons and scene selection. Priority is thunderstorm, snow, observed precipitation/rain, fog, strong wind, cloud, cool, clear. Strong wind means at least 40 km/h sustained or 60 km/h gusts. Cool uses feels-like/temperature at or below 12°C only after stronger observed conditions are considered; cold alone never creates snow. Provider `is_day`, cloud cover and precipitation intensity influence scene choice. Scene identity is semantic, so changing temperature alone does not restart a clip.

Ten local silent loops and posters provide clear/cloudy/rain day/night plus fog, wind, snow and heavy rain. Heavy rain and storm share rain footage without flashing lightning. Neutral footage can be reused with a night treatment. These are illustrative atmospheres, not live imagery of a city. PRIME styling applies grayscale, light blur and a black readability scrim; red remains reserved for interaction and focus.

All loops total 687,640 bytes, posters 639,422 bytes, combined 1,327,062 bytes. Only the active scene loads, with a brief crossfade overlap. Mobile, reduced-motion and reduced-data modes receive posters. Video pauses offscreen or in hidden tabs and falls back to a poster after playback errors. No Pexels media was downloaded. Full source prompts, generation mode, original output paths and per-file sizes are in [the media manifest](../public/weather/README.md).

## Recharts and accessibility

Recharts renders a temperature line and a separate precipitation-probability bar chart. Probability is never presented as rainfall volume. The precipitation chart is omitted when the next 24-hour peak is below 20%. Temperature/feels-like/rain/humidity/wind details are available through selected forecast points. The charts load dynamically only on the weather page; no bundle-size benchmark is claimed.

Icons supplement readable labels. Search uses a labeled combobox, keyboard arrows and Enter; the dialog restores focus. Hour/day selection supports keyboard use, charts provide text summaries and accessibility layers, and touch selection does not rely on hover. Decorative atmosphere/video is hidden from assistive technology. Reduced motion and reduced data avoid video, scene transitions respect motion preferences, and there is no audio or strobe effect.

## Verification

- `pnpm typecheck`: passed.
- `pnpm test`: **287 passed across 27 files**.
- Focused weather and shell unit checks: **72 passed** in the earlier focused run; covered by the full suite above.
- Focused Playwright: **18 passed**, six flows each in Chromium, Firefox and WebKit. Covered header-to-page navigation, city switching, denied and granted GPS, resolved location names, matching control heights, units without duplicate forecast fetches, keyboard selection, provider failure/retry, reduced motion and responsive widths from 320 to 1920px, plus short and zoom-equivalent viewports.
- Visual inspection: desktop and mobile screenshots confirmed monochrome blur, readable weather information and responsive panels. These checks use controlled forecast responses and a local authentication fixture, not a claim of real-provider availability or physical-device battery measurements.
- Repository `pnpm lint`: failed with three existing errors outside weather: `app/api/reminders/dispatch/route.ts:120`, `lib/email/revision-mailer.ts:163` and `tests/e2e/problem-intelligence.spec.ts:298`, all explicit `any`; the reminder route also has an unused-argument warning. These unrelated files were left unchanged.
- Focused weather lint: passed for the feature, gateway, routes, QA configuration and offline media utility.
- `PRIME_WEATHER_QA=1 pnpm build`: passed with the configured Turbopack compiler, including TypeScript and all 79 static pages. The environment flag changes only the output directory to `.next-weather-qa`; it does not switch application behavior or use the test backend.

Local check logs are in ignored `.generated/weather/`. Playwright uses isolated `.next-weather-qa` output and its own ports/backend so it does not replace the user's normal development preview.

## Deferred and practical limits

No radar, alerts, air quality, maps, weather notifications, cross-device preferences, distributed rate-limit store, planner/weather scoring or unrelated PRIME modules were added. Provider outages and reverse lookup failures remain possible and have visible fallbacks. The default Photon endpoint should be replaced with suitable hosted capacity if usage outgrows its public-service allowance. No Pexels download, production deployment or database migration was performed.
