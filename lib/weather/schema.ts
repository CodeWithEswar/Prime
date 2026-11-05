import { z } from "zod";

export const coordinate = (limit: number) => z.number().finite().min(-limit).max(limit);
export const timezoneSchema = z
  .string()
  .max(80)
  .refine((value) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "Invalid timezone");
export const weatherLocationSchema = z.object({
  id: z.string().max(80),
  mode: z.enum(["city", "device"]),
  name: z.string().min(1).max(120),
  admin1: z.string().max(120).default(""),
  country: z.string().max(120).default(""),
  countryCode: z.string().max(3).default(""),
  latitude: coordinate(90),
  longitude: coordinate(180),
  timezone: timezoneSchema.optional(),
});
const inputCoordinate = (limit: number) =>
  z
    .string()
    .trim()
    .regex(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/)
    .transform(Number)
    .pipe(z.number().finite().min(-limit).max(limit));
export const forecastInputSchema = z.object({
  lat: inputCoordinate(90),
  lon: inputCoordinate(180),
});
export const locationSearchSchema = z
  .string()
  .trim()
  .min(3)
  .max(80)
  .regex(/^[\p{L}\p{M}\p{N} .,'’()\-]+$/u);
const value = z.number().finite().nullable().optional();
const values = z.array(z.number().finite().nullable()).max(400).optional();
export const providerForecastSchema = z.object({
  timezone: timezoneSchema,
  current: z.object({
    time: z.number().finite(),
    temperature_2m: value,
    apparent_temperature: value,
    relative_humidity_2m: value,
    precipitation: value,
    weather_code: value,
    cloud_cover: value,
    pressure_msl: value,
    wind_speed_10m: value,
    wind_direction_10m: value,
    wind_gusts_10m: value,
    is_day: z
      .union([z.literal(0), z.literal(1)])
      .nullable()
      .optional(),
  }),
  hourly: z.object({
    time: z.array(z.number().finite()).max(400),
    temperature_2m: values,
    apparent_temperature: values,
    precipitation_probability: values,
    precipitation: values,
    weather_code: values,
    relative_humidity_2m: values,
    cloud_cover: values,
    wind_speed_10m: values,
    wind_gusts_10m: values,
    visibility: values,
    dew_point_2m: values,
  }),
  daily: z.object({
    time: z.array(z.number().finite()).max(16),
    weather_code: values,
    temperature_2m_max: values,
    temperature_2m_min: values,
    sunrise: values,
    sunset: values,
    precipitation_probability_max: values,
    precipitation_sum: values,
    wind_speed_10m_max: values,
    wind_gusts_10m_max: values,
  }),
});
export const geocodingSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.number().int(),
        name: z.string().min(1).max(120),
        latitude: coordinate(90),
        longitude: coordinate(180),
        timezone: timezoneSchema.optional(),
        admin1: z.string().optional(),
        country: z.string().optional(),
        country_code: z.string().optional(),
      })
    )
    .max(20)
    .optional(),
});
export type WeatherLocation = z.infer<typeof weatherLocationSchema>;
export type ProviderForecast = z.infer<typeof providerForecastSchema>;
export type TemperatureUnit = "celsius" | "fahrenheit";
export { normalizeCoordinate } from "./coordinates";
