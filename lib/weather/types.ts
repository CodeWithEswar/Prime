export interface WeatherHour {
  time: number;
  temperature: number | null;
  feelsLike: number | null;
  rainProbability: number | null;
  precipitation: number | null;
  code: number | null;
  humidity: number | null;
  cloudCover: number | null;
  windSpeed: number | null;
  windGust: number | null;
  visibility: number | null;
  dewPoint: number | null;
}
export interface WeatherDay {
  time: number;
  code: number | null;
  high: number | null;
  low: number | null;
  sunrise: number | null;
  sunset: number | null;
  rainProbability: number | null;
  precipitation: number | null;
  windSpeed: number | null;
  windGust: number | null;
}
export interface WeatherForecast {
  latitude: number;
  longitude: number;
  timezone: string;
  fetchedAt: number;
  current: {
    time: number;
    temperature: number | null;
    feelsLike: number | null;
    humidity: number | null;
    precipitation: number | null;
    code: number | null;
    cloudCover: number | null;
    pressure: number | null;
    windSpeed: number | null;
    windGust: number | null;
    windDirection: number | null;
    isDay: boolean | null;
  };
  hourly: WeatherHour[];
  daily: WeatherDay[];
}
