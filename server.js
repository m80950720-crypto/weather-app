/**
 * Weather App — Server
 * ----------------------------------------------------
 * A small Express server that:
 *   1. Serves the static frontend (HTML/CSS/JS + Tailwind via CDN).
 *   2. Proxies requests to the free Open-Meteo APIs so the API key-free
 *      geocoding + forecast calls happen server-side (cleaner separation,
 *      easier to add caching/rate limiting later, no CORS headaches).
 *
 * Open-Meteo requires no API key: https://open-meteo.com
 */

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/**
 * GET /api/geocode?q=Bhakkar
 * Looks up place names via Open-Meteo's geocoding service and ranks
 * Pakistani matches first (this app is built for Pakistan but will
 * happily resolve any place name).
 */
app.get("/api/geocode", async (req, res) => {
  const q = (req.query.q || "").trim();

  if (q.length < 2) {
    return res.status(400).json({ error: "Type at least 2 characters to search." });
  }

  try {
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(q)}&count=8&language=en&format=json`;
    const upstream = await fetch(url);

    if (!upstream.ok) {
      throw new Error(`Geocoding service responded with ${upstream.status}`);
    }

    const data = await upstream.json();
    const results = (data.results || []).map((r) => ({
      id: r.id,
      name: r.name,
      admin1: r.admin1 || "",
      country: r.country || "",
      countryCode: r.country_code || "",
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone,
    }));

    // Pakistani matches first, keeps Bhakkar-style small towns from
    // getting buried under same-named places abroad.
    results.sort((a, b) => (b.countryCode === "PK") - (a.countryCode === "PK"));

    res.json({ results });
  } catch (err) {
    console.error("[/api/geocode]", err.message);
    res.status(502).json({ error: "Couldn't reach the location service. Please try again." });
  }
});

/**
 * GET /api/weather?lat=31.52&lon=74.35
 * Fetches current conditions + hourly + 7-day forecast for a coordinate.
 */
app.get("/api/weather", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon || Number.isNaN(Number(lat)) || Number.isNaN(Number(lon))) {
    return res.status(400).json({ error: "Valid latitude and longitude are required." });
  }

  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "rain",
        "weather_code",
        "cloud_cover",
        "surface_pressure",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
      ].join(","),
      hourly: ["temperature_2m", "weather_code", "precipitation_probability", "uv_index", "is_day"].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "sunrise",
        "sunset",
        "uv_index_max",
        "precipitation_probability_max",
        "wind_speed_10m_max",
      ].join(","),
      timezone: "auto",
      forecast_days: "7",
    });

    const upstream = await fetch(`${FORECAST_URL}?${params.toString()}`);

    if (!upstream.ok) {
      throw new Error(`Forecast service responded with ${upstream.status}`);
    }

    const data = await upstream.json();
    res.json(data);
  } catch (err) {
    console.error("[/api/weather]", err.message);
    res.status(502).json({ error: "Couldn't reach the weather service. Please try again." });
  }
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Fallback to index.html for any unknown route (simple SPA-style serving)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🌤️  Weather app running at http://localhost:${PORT}`);
});
