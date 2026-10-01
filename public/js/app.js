
(() => {
  "use strict";

  const STORAGE_KEY = "weather:last-location";
  const REFRESH_MS = 10 * 60 * 1000; // auto-refresh every 10 minutes

  const state = {
    location: null, // { name, admin1, country, latitude, longitude, timezone }
    weather: null,
    unit: "c", // 'c' | 'f'
    clockTimer: null,
    refreshTimer: null,
  };

  
  const el = {
    searchForm: document.getElementById("search-form"),
    searchInput: document.getElementById("search-input"),
    suggestions: document.getElementById("suggestions"),
    geoBtn: document.getElementById("geo-btn"),
    cityChips: document.getElementById("city-chips"),
    unitToggle: document.getElementById("unit-toggle"),
    refreshBtn: document.getElementById("refresh-btn"),

    errorBanner: document.getElementById("error-banner"),
    errorText: document.getElementById("error-text"),
    errorRetry: document.getElementById("error-retry"),

    app: document.getElementById("app"),
    skeleton: document.getElementById("skeleton"),

    placeName: document.getElementById("place-name"),
    placeMeta: document.getElementById("place-meta"),
    localTime: document.getElementById("local-time"),
    heroIcon: document.getElementById("hero-icon"),
    heroTemp: document.getElementById("hero-temp"),
    heroCondition: document.getElementById("hero-condition"),
    heroFeels: document.getElementById("hero-feels"),
    heroHighLow: document.getElementById("hero-high-low"),
    heroGlow: document.getElementById("hero-glow"),

    hourlyStrip: document.getElementById("hourly-strip"),
    dailyList: document.getElementById("daily-list"),

    detailHumidity: document.getElementById("detail-humidity"),
    detailPressure: document.getElementById("detail-pressure"),
    detailUv: document.getElementById("detail-uv"),
    detailPrecip: document.getElementById("detail-precip"),
    windArrow: document.getElementById("wind-arrow"),
    windSpeed: document.getElementById("detail-wind-speed"),
    windCompassLabel: document.getElementById("detail-wind-compass"),
    sunMarker: document.getElementById("sun-marker"),
    sunTrackFill: document.getElementById("sun-track-fill"),
    sunriseTime: document.getElementById("sunrise-time"),
    sunsetTime: document.getElementById("sunset-time"),
    sunStatus: document.getElementById("sun-status"),

    lastUpdated: document.getElementById("last-updated"),
    attribution: document.getElementById("attribution-time"),
  };

  
  function init() {
    renderCityChips();
    bindEvents();

    const saved = safeParse(localStorage.getItem(STORAGE_KEY));
    const initial = saved || PAKISTAN_CITIES[0]; // default: Lahore
    selectLocation({
      name: initial.name,
      admin1: initial.admin1 || "",
      country: initial.country || "Pakistan",
      latitude: initial.latitude,
      longitude: initial.longitude,
    });
  }

  function safeParse(json) {
    try {
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  }

  
  function bindEvents() {
    let debounceId;
    el.searchInput.addEventListener("input", () => {
      clearTimeout(debounceId);
      const q = el.searchInput.value.trim();
      if (q.length < 2) {
        hideSuggestions();
        return;
      }
      debounceId = setTimeout(() => runSearch(q), 300);
    });

    el.searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const first = el.suggestions.querySelector("[data-suggestion]");
      if (first) first.click();
    });

    document.addEventListener("click", (e) => {
      if (!el.suggestions.contains(e.target) && e.target !== el.searchInput) {
        hideSuggestions();
      }
    });

    el.geoBtn.addEventListener("click", useMyLocation);

    el.unitToggle.addEventListener("click", () => {
      state.unit = state.unit === "c" ? "f" : "c";
      el.unitToggle.textContent = state.unit === "c" ? "°C" : "°F";
      el.unitToggle.setAttribute("aria-label", `Switch to ${state.unit === "c" ? "Fahrenheit" : "Celsius"}`);
      if (state.weather) renderWeather();
    });

    el.refreshBtn.addEventListener("click", () => {
      if (state.location) fetchWeather(state.location);
    });

    el.errorRetry.addEventListener("click", () => {
      if (state.location) fetchWeather(state.location);
    });
  }

  
  function renderCityChips() {
    el.cityChips.innerHTML = "";
    PAKISTAN_CITIES.forEach((city) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = city.name;
      chip.dataset.city = city.name;
      chip.addEventListener("click", () =>
        selectLocation({ ...city, country: "Pakistan" })
      );
      el.cityChips.appendChild(chip);
    });
  }

  function markActiveChip(name) {
    [...el.cityChips.children].forEach((chip) => {
      chip.classList.toggle("chip-active", chip.dataset.city === name);
    });
  }

  
  async function runSearch(query) {
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed.");
      renderSuggestions(data.results, query);
    } catch (err) {
      renderSuggestions([], query, err.message);
    }
  }

  function renderSuggestions(results, query, errorMessage) {
    el.suggestions.innerHTML = "";

    if (errorMessage) {
      el.suggestions.innerHTML = `<li class="suggestion-empty">${escapeHtml(errorMessage)}</li>`;
      showSuggestions();
      return;
    }

    if (!results.length) {
      el.suggestions.innerHTML = `<li class="suggestion-empty">No places found for "${escapeHtml(query)}". Try another spelling.</li>`;
      showSuggestions();
      return;
    }

    results.forEach((r) => {
      const li = document.createElement("li");
      li.dataset.suggestion = "true";
      li.className = "suggestion-item";
      const region = [r.admin1, r.country].filter(Boolean).join(", ");
      li.innerHTML = `<span class="suggestion-name">${escapeHtml(r.name)}</span><span class="suggestion-region">${escapeHtml(region)}</span>`;
      li.addEventListener("click", () => {
        selectLocation(r);
        el.searchInput.value = "";
        hideSuggestions();
      });
      el.suggestions.appendChild(li);
    });

    showSuggestions();
  }

  function showSuggestions() {
    el.suggestions.classList.remove("hidden");
  }
  function hideSuggestions() {
    el.suggestions.classList.add("hidden");
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  
  function useMyLocation() {
    if (!navigator.geolocation) {
      showError("Your browser doesn't support geolocation.");
      return;
    }
    el.geoBtn.classList.add("animate-spin-slow");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        el.geoBtn.classList.remove("animate-spin-slow");
        selectLocation({
          name: "Your location",
          admin1: "",
          country: "",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        el.geoBtn.classList.remove("animate-spin-slow");
        showError("Couldn't access your location. Please allow location access or search manually.");
      },
      { timeout: 8000 }
    );
  }

 
  function selectLocation(loc) {
    state.location = loc;
    markActiveChip(loc.name);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    fetchWeather(loc);
  }

  async function fetchWeather(loc) {
    clearInterval(state.refreshTimer);
    hideError();
    setLoading(true);

    try {
      const res = await fetch(`/api/weather?lat=${loc.latitude}&lon=${loc.longitude}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't load weather data.");

      state.weather = data;
      state.location.timezone = data.timezone || state.location.timezone;
      renderWeather();
      setLoading(false);

      state.refreshTimer = setInterval(() => fetchWeather(loc), REFRESH_MS);
    } catch (err) {
      setLoading(false);
      showError(err.message || "Something went wrong while fetching weather data.");
    }
  }

  function setLoading(isLoading) {
    el.skeleton.classList.toggle("hidden", !isLoading);
    el.app.classList.toggle("opacity-40", isLoading);
    el.app.classList.toggle("pointer-events-none", isLoading);
  }

  function showError(message) {
    el.errorText.textContent = message;
    el.errorBanner.classList.remove("hidden");
  }
  function hideError() {
    el.errorBanner.classList.add("hidden");
  }

  
  function tempLabel(celsius) {
    if (celsius == null) return "—";
    const val = state.unit === "c" ? celsius : celsius * 9 / 5 + 32;
    return `${Math.round(val)}°`;
  }

  function renderWeather() {
    const { current, hourly, daily, timezone } = state.weather;
    const loc = state.location;

    
    el.placeName.textContent = loc.name;
    el.placeMeta.textContent = [loc.admin1, loc.country].filter(Boolean).join(" · ") || "Current position";
    startClock(timezone);

   
    const info = getWeatherInfo(current.weather_code, current.is_day);
    el.heroIcon.innerHTML = info.icon;
    el.heroGlow.style.setProperty("--glow-color", info.glow);
    el.heroTemp.textContent = tempLabel(current.temperature_2m);
    el.heroCondition.textContent = info.label;
    el.heroFeels.textContent = `Feels like ${tempLabel(current.apparent_temperature)}`;
    el.heroHighLow.textContent = `H:${tempLabel(daily.temperature_2m_max[0])}  L:${tempLabel(daily.temperature_2m_min[0])}`;

    document.body.dataset.isDay = current.is_day ? "day" : "night";

    

    
    renderDaily(daily);

   
    el.detailHumidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;
    el.detailPressure.textContent = `${Math.round(current.surface_pressure)} hPa`;
    el.detailUv.textContent = `${Math.round(daily.uv_index_max[0] ?? 0)}`;
    el.detailPrecip.textContent = `${Math.round(daily.precipitation_probability_max[0] ?? 0)}%`;

    el.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    el.windCompassLabel.textContent = degToCompass(current.wind_direction_10m);
    el.windArrow.style.transform = `rotate(${current.wind_direction_10m}deg)`;

    renderSunArc(daily.sunrise[0], daily.sunset[0], timezone, !!current.is_day);

    const now = new Date();
    el.lastUpdated.textContent = `Updated ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    el.attribution.textContent = now.getFullYear();
  }

  function renderHourly(hourly, timezone) {
    el.hourlyStrip.innerHTML = "";
    const nowMs = Date.now();

    // Find the index of the first hour >= now
    let startIdx = hourly.time.findIndex((t) => new Date(t).getTime() >= nowMs - 30 * 60 * 1000);
    if (startIdx < 0) startIdx = 0;

    const slice = hourly.time.slice(startIdx, startIdx + 24);

    slice.forEach((t, i) => {
      const idx = startIdx + i;
      const date = new Date(t);
      const label = i === 0 ? "Now" : date.toLocaleTimeString("en-US", { hour: "numeric", timeZone: timezone });
      const info = getWeatherInfo(hourly.weather_code[idx], hourly.is_day[idx]);
      const precip = hourly.precipitation_probability[idx] ?? 0;

      const item = document.createElement("div");
      item.className = "hour-item";
      item.innerHTML = `
        <span class="hour-time">${label}</span>
        <span class="hour-icon" style="color:${info.glow}">${info.icon}</span>
        <span class="hour-precip ${precip < 15 ? "opacity-0" : ""}">${precip}%</span>
        <span class="hour-temp">${tempLabel(hourly.temperature_2m[idx])}</span>
      `;
      el.hourlyStrip.appendChild(item);
    });
  }

  function renderDaily(daily) {
    el.dailyList.innerHTML = "";

    const globalMin = Math.min(...daily.temperature_2m_min);
    const globalMax = Math.max(...daily.temperature_2m_max);
    const span = Math.max(globalMax - globalMin, 1);

    daily.time.forEach((t, i) => {
      const date = new Date(t);
      const dayLabel = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
      const info = getWeatherInfo(daily.weather_code[i], 1);

      const dayMin = daily.temperature_2m_min[i];
      const dayMax = daily.temperature_2m_max[i];
      const leftPct = ((dayMin - globalMin) / span) * 100;
      const widthPct = ((dayMax - dayMin) / span) * 100;
      const precip = daily.precipitation_probability_max[i] ?? 0;

      const row = document.createElement("div");
      row.className = "day-row";
      row.innerHTML = `
        <span class="day-name">${dayLabel}</span>
        <span class="day-icon" style="color:${info.glow}">${info.icon}</span>
        <span class="day-condition">${info.label}</span>
        <span class="day-precip ${precip < 15 ? "opacity-0" : ""}">💧 ${precip}%</span>
        <span class="day-lo">${tempLabel(dayMin)}</span>
        <span class="day-range-track">
          <span class="day-range-fill" style="left:${leftPct}%;width:${widthPct}%"></span>
        </span>
        <span class="day-hi">${tempLabel(dayMax)}</span>
      `;
      el.dailyList.appendChild(row);
    });
  }

  function renderSunArc(sunrise, sunset, timezone, isDay) {
    const sunriseDate = new Date(sunrise);
    const sunsetDate = new Date(sunset);
    const now = new Date();

    el.sunriseTime.textContent = sunriseDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: timezone });
    el.sunsetTime.textContent = sunsetDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: timezone });

    if (!isDay) {
      el.sunMarker.style.left = now < sunriseDate ? "0%" : "100%";
      el.sunTrackFill.style.width = "0%";
      el.sunStatus.textContent = "Night";
      return;
    }

    const total = sunsetDate.getTime() - sunriseDate.getTime();
    const elapsed = now.getTime() - sunriseDate.getTime();
    const pct = Math.min(Math.max((elapsed / total) * 100, 0), 100);

    el.sunMarker.style.left = `${pct}%`;
    el.sunTrackFill.style.width = `${pct}%`;
    el.sunStatus.textContent = "Daylight";
  }

  function startClock(timezone) {
    clearInterval(state.clockTimer);
    const update = () => {
      const now = new Date();
      el.localTime.textContent = now.toLocaleString("en-US", {
        weekday: "long",
        hour: "numeric",
        minute: "2-digit",
        timeZone: timezone || undefined,
      });
    };
    update();
    state.clockTimer = setInterval(update, 30 * 1000);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
