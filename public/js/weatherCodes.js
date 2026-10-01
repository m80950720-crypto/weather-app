
const WEATHER_GROUPS = {
  clear: { glow: "var(--glow-clear)" },
  cloudy: { glow: "var(--glow-cloudy)" },
  fog: { glow: "var(--glow-fog)" },
  drizzle: { glow: "var(--glow-rain)" },
  rain: { glow: "var(--glow-rain)" },
  snow: { glow: "var(--glow-snow)" },
  storm: { glow: "var(--glow-storm)" },
};

const WMO_CODES = {
  0: { label: "Clear sky", group: "clear" },
  1: { label: "Mainly clear", group: "clear" },
  2: { label: "Partly cloudy", group: "cloudy" },
  3: { label: "Overcast", group: "cloudy" },
  45: { label: "Fog", group: "fog" },
  48: { label: "Depositing rime fog", group: "fog" },
  51: { label: "Light drizzle", group: "drizzle" },
  53: { label: "Moderate drizzle", group: "drizzle" },
  55: { label: "Dense drizzle", group: "drizzle" },
  56: { label: "Light freezing drizzle", group: "drizzle" },
  57: { label: "Dense freezing drizzle", group: "drizzle" },
  61: { label: "Slight rain", group: "rain" },
  63: { label: "Moderate rain", group: "rain" },
  65: { label: "Heavy rain", group: "rain" },
  66: { label: "Light freezing rain", group: "rain" },
  67: { label: "Heavy freezing rain", group: "rain" },
  71: { label: "Slight snow fall", group: "snow" },
  73: { label: "Moderate snow fall", group: "snow" },
  75: { label: "Heavy snow fall", group: "snow" },
  77: { label: "Snow grains", group: "snow" },
  80: { label: "Slight rain showers", group: "rain" },
  81: { label: "Moderate rain showers", group: "rain" },
  82: { label: "Violent rain showers", group: "rain" },
  85: { label: "Slight snow showers", group: "snow" },
  86: { label: "Heavy snow showers", group: "snow" },
  95: { label: "Thunderstorm", group: "storm" },
  96: { label: "Thunderstorm, slight hail", group: "storm" },
  99: { label: "Thunderstorm, heavy hail", group: "storm" },
};

function getWeatherInfo(code, isDay = 1) {
  const entry = WMO_CODES[code] || { label: "Unknown", group: "cloudy" };
  return {
    ...entry,
    isDay: !!isDay,
    glow: WEATHER_GROUPS[entry.group].glow,
    icon: weatherIcon(entry.group, !!isDay),
  };
}


function weatherIcon(group, isDay) {
  const icons = {
    clear: isDay
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
           <circle cx="12" cy="12" r="4.2"/>
           <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/>
         </svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
           <path d="M20 14.2a8 8 0 1 1-9.3-9.1 6.3 6.3 0 0 0 9.3 9.1Z"/>
         </svg>`,
    cloudy: isDay
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
           <circle cx="7.5" cy="9.5" r="3" opacity="0.6"/>
           <path d="M7 18.5h10.5a3.75 3.75 0 0 0 .4-7.48A5.5 5.5 0 0 0 7.6 12.1 4 4 0 0 0 7 18.5Z"/>
         </svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
           <path d="M15.8 7.3a5.4 5.4 0 0 0-8.9 5.2A6.3 6.3 0 1 0 15.8 7.3Z" opacity="0.6"/>
           <path d="M7 18.5h10.5a3.75 3.75 0 0 0 .4-7.48A5.5 5.5 0 0 0 7.6 12.1 4 4 0 0 0 7 18.5Z"/>
         </svg>`,
    fog: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
            <path d="M6 9.5h8M4 13h16M6 16.5h8M4 20h16" opacity="0.9"/>
            <circle cx="16.5" cy="7.5" r="2.4" opacity="0.5"/>
          </svg>`,
    drizzle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 14.2h10.5a3.6 3.6 0 0 0 .3-7.19A5.3 5.3 0 0 0 7.6 7.8 3.9 3.9 0 0 0 7 14.2Z"/>
                <path d="M9 17.5l-.8 1.8M13 17.5l-.8 1.8M17 17.5l-.8 1.8" opacity="0.85"/>
              </svg>`,
    rain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
             <path d="M6.5 13.6h11A3.75 3.75 0 0 0 17.9 6a5.6 5.6 0 0 0-10.4 1.5A4.1 4.1 0 0 0 6.5 13.6Z"/>
             <path d="M8 16.8L6.6 19.6M12.3 16.8l-1.4 2.8M16.6 16.8l-1.4 2.8"/>
           </svg>`,
    snow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
             <path d="M6.5 12.6h11A3.75 3.75 0 0 0 17.9 5a5.6 5.6 0 0 0-10.4 1.5A4.1 4.1 0 0 0 6.5 12.6Z"/>
             <path d="M8.5 17v4M7 18.3l3 1.4M10 18.3l-3 1.4M12 17v4M10.5 18.3l3 1.4M13.5 18.3l-3 1.4M15.5 17v4M14 18.3l3 1.4M17 18.3l-3 1.4"/>
           </svg>`,
    storm: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6.5 11.6h10.5A3.6 3.6 0 0 0 17.3 4a5.3 5.3 0 0 0-9.9 1.6A3.9 3.9 0 0 0 6.5 11.6Z"/>
              <path d="M13 14.5l-3 4h2.6l-1.6 3.6 4.4-5h-2.6l.2-2.6Z" fill="currentColor" stroke="none"/>
            </svg>`,
  };
  return icons[group] || icons.cloudy;
}


function degToCompass(deg) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}
