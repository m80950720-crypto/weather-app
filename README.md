# Weather — Pakistan Weather App

A professional, Pakistan-first weather application built with **HTML, CSS, Tailwind CSS, and Node.js (Express)**, powered by the free **[Open-Meteo](https://open-meteo.com)** API. No API key required.

## ✨ Features

- **Search any city** — live autocomplete via Open-Meteo's geocoding API, with Pakistani matches ranked first.
- **Quick-access chips** for major Pakistani cities: Lahore, Karachi, Islamabad, Bhakkar, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Sialkot, Hyderabad, Gujranwala.
- **"Use my location"** button via the browser Geolocation API.
- **Current conditions** — temperature, "feels like," condition, today's high/low, live local clock for the selected city's timezone.
- **24-hour forecast strip** and **7-day forecast** with a min/max temperature range visualization.
- **Details panel** — humidity, pressure, UV index, rain chance, a rotating wind-direction compass, and a sunrise/sunset daylight progress track.
- **°C / °F toggle**, remembers your last city (`localStorage`), auto-refreshes every 10 minutes, manual refresh button.
- Loading skeletons and friendly error states (no results / network failure) with retry.
- Fully responsive, keyboard-accessible, respects `prefers-reduced-motion`.

## 🛠 Tech Stack

| Layer     | Tech                                   |
|-----------|-----------------------------------------|
| Markup    | Semantic HTML5                          |
| Styling   | Tailwind CSS (CDN) + custom CSS (`public/css/style.css`) for the animated backdrop, compass, sun-arc, and glass panels |
| Fonts     | [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) (display) + [Inter](https://fonts.google.com/specimen/Inter) (body/data) via Google Fonts |
| Frontend JS | Vanilla JS (no framework/build step) |
| Backend   | Node.js + Express, proxying Open-Meteo's geocoding & forecast APIs |
| Data      | [Open-Meteo](https://open-meteo.com) — free, no API key |

## 📂 Project Structure

```
weather-app/
├── server.js              # Express server + /api/geocode and /api/weather proxy routes
├── package.json
├── public/
│   ├── index.html         # App shell / markup
│   ├── css/
│   │   └── style.css      # Custom design tokens, backdrop, components
│   └── js/
│       ├── cities.js      # Curated Pakistani city list (quick chips)
│       ├── weatherCodes.js# WMO weather-code → label/icon/colour mapping
│       └── app.js         # App state, fetch logic, rendering
└── README.md
```

## 🚀 Getting Started

**Requirements:** Node.js 18 or newer (for native `fetch`).

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# App runs at:
http://localhost:3000
```

For auto-restart on file changes during development:

```bash
npm run dev
```

## 🔌 API Endpoints (served by this app)

| Method | Route            | Description                                      |
|--------|------------------|---------------------------------------------------|
| GET    | `/api/geocode?q=` | Search for a place name, returns matching locations |
| GET    | `/api/weather?lat=&lon=` | Current + hourly + 7-day forecast for coordinates |
| GET    | `/api/health`     | Simple health check                              |

Both endpoints simply proxy and lightly normalize responses from Open-Meteo's free [Geocoding API](https://open-meteo.com/en/docs/geocoding-api) and [Forecast API](https://open-meteo.com/en/docs).

## 🎨 Design Notes

The interface uses a deep indigo/navy backdrop with a slow, ambient animated gradient that shifts between a warm "day" glow and a star-flecked "night" sky based on the selected location's actual day/night state. Weather conditions are expressed through a shifting accent glow (gold for clear skies, teal for rain, violet for storms, etc.) behind hand-drawn SVG icons, rather than swapping the whole theme — keeping one consistent visual identity throughout. Data is presented as a continuous hourly timeline and a row-based 7-day list rather than repeated identical cards, with a custom sunrise/sunset daylight track and a rotating wind compass as distinctive, functional details.

## 📄 License

MIT — built as a sample project for a web development course. Weather and geocoding data courtesy of [Open-Meteo.com](https://open-meteo.com) (CC BY 4.0).
