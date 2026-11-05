import type { Metadata } from "next";
import { WeatherPage } from "@/features/weather/components/weather-page";
export const metadata: Metadata = {
  title: "Weather — PRIME",
  description: "Current conditions and forecasts for your chosen location.",
};
export default function Page() {
  return <WeatherPage />;
}
