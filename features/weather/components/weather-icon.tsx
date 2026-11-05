import {
  CloudIcon,
  CloudLittleRainIcon,
  CloudBigRainIcon,
  CloudSnowIcon,
  CloudAngledRainZapIcon,
  CloudSlowWindIcon,
  Sun03Icon,
  Moon02Icon,
  SunCloud01Icon,
} from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
import { weatherCondition, type WeatherCondition } from "@/lib/weather/conditions";
const icons: Record<WeatherCondition, IconSvgElement> = {
  clear: Sun03Icon,
  "mostly-clear": Sun03Icon,
  "partly-cloudy": SunCloud01Icon,
  cloudy: CloudIcon,
  fog: CloudSlowWindIcon,
  drizzle: CloudLittleRainIcon,
  rain: CloudLittleRainIcon,
  "heavy-rain": CloudBigRainIcon,
  snow: CloudSnowIcon,
  thunderstorm: CloudAngledRainZapIcon,
  unknown: CloudIcon,
};
export function WeatherIcon({
  code,
  isDay = true,
  size = 24,
  labelled = false,
}: {
  code: number | null;
  isDay?: boolean;
  size?: number;
  labelled?: boolean;
}) {
  const condition = weatherCondition(code),
    icon =
      !isDay && ["clear", "mostly-clear"].includes(condition.kind)
        ? Moon02Icon
        : icons[condition.kind];
  return (
    <Icon
      icon={icon}
      size={size}
      aria-hidden={!labelled}
      {...(labelled ? { "aria-label": condition.label, role: "img" } : {})}
    />
  );
}
