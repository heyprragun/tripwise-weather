const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const pickerEl = document.getElementById("locationPicker");
const locationOptionsEl = document.getElementById("locationOptions");
const formError = document.getElementById("formError");

let pendingDates = null;
let selectedLocation = null;

const today = new Date();
today.setHours(0,0,0,0);
const toISO = d => d.toISOString().slice(0,10);
const maxDate = new Date(today);
maxDate.setDate(maxDate.getDate() + 14);

startDate.min = toISO(today);
startDate.max = toISO(maxDate);
endDate.min = toISO(today);
endDate.max = toISO(maxDate);
startDate.value = toISO(today);

function setEndMin() {
  endDate.min = startDate.value || toISO(today);
  if (endDate.value && endDate.value < endDate.min) endDate.value = endDate.min;
}
startDate.addEventListener("change", setEndMin);
setEndMin();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideFormError();
  resultsEl.classList.add("hidden");

  const city = cityInput.value.trim();
  const start = startDate.value;
  const end = endDate.value;

  if (!city) return showFormError("Please enter a destination.");
  if (!start || !end) return showFormError("Please choose both travel dates.");
  if (end < start) return showFormError("Your end date must be on or after the start date.");

  const startD = new Date(start + "T00:00:00");
  const endD = new Date(end + "T00:00:00");
  const days = Math.round((endD - startD) / 86400000) + 1;
  if (days > 14) return showFormError("TripWise supports trips of up to 14 days.");
  if (startD < today || endD > maxDate) return showFormError("Choose dates from today through the next 14 days.");

  pendingDates = {start, end};
  await findLocations(city);
});

document.getElementById("closePicker").addEventListener("click", () => pickerEl.classList.add("hidden"));
document.getElementById("newSearch").addEventListener("click", () => {
  resultsEl.classList.add("hidden");
  window.scrollTo({top:0, behavior:"smooth"});
  cityInput.focus();
});

async function findLocations(city) {
  setStatus("loading", "Finding your destination…");
  try {
    const url = new URL(GEO_URL);
    url.searchParams.set("name", city);
    url.searchParams.set("count", "5");
    url.searchParams.set("language", "en");
    const res = await fetch(url);
    if (!res.ok) throw new Error("Geocoding service failed.");
    const data = await res.json();
    const places = data.results || [];
    if (!places.length) {
      clearStatus();
      return showFormError(`We couldn't find “${city}”. Try adding a country, like “Paris, France”.`);
    }
    if (places.length === 1) {
      pickerEl.classList.add("hidden");
      return loadForecast(places[0], pendingDates);
    }
    clearStatus();
    renderLocationPicker(places);
  } catch (err) {
    setStatus("error", "We couldn't reach the location service. Please try again in a moment.");
  }
}

function renderLocationPicker(places) {
  pickerEl.classList.remove("hidden");
  locationOptionsEl.innerHTML = places.map((p, i) => {
    const admin = [p.admin1, p.admin2].filter(Boolean).join(", ");
    return `
      <button class="location-option" data-index="${i}" type="button">
        <span>
          <span class="location-main">${escapeHTML(p.name)}</span>
          <span class="location-sub">${escapeHTML([admin, p.country].filter(Boolean).join(", "))}</span>
        </span>
        <span class="location-arrow">→</span>
      </button>`;
  }).join("");
  [...locationOptionsEl.querySelectorAll(".location-option")].forEach(btn => {
    btn.addEventListener("click", () => {
      const place = places[Number(btn.dataset.index)];
      pickerEl.classList.add("hidden");
      loadForecast(place, pendingDates);
    });
  });
}

async function loadForecast(place, dates) {
  selectedLocation = place;
  setStatus("loading", "Reading the forecast and turning it into trip advice…");
  try {
    const url = new URL(FORECAST_URL);
    url.searchParams.set("latitude", place.latitude);
    url.searchParams.set("longitude", place.longitude);
    url.searchParams.set("daily", [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "uv_index_max",
      "wind_speed_10m_max",
      "sunrise",
      "sunset"
    ].join(","));
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("start_date", dates.start);
    url.searchParams.set("end_date", dates.end);

    const res = await fetch(url);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.reason || "Forecast service failed.");
    }
    const data = await res.json();
    if (!data.daily || !data.daily.time?.length) throw new Error("No forecast was returned for those dates.");

    renderResults(place, dates, data);
    clearStatus();
    resultsEl.classList.remove("hidden");
    resultsEl.scrollIntoView({behavior:"smooth", block:"start"});
  } catch (err) {
    setStatus("error", "The forecast couldn't be loaded right now. Please check the dates and try again.");
  }
}

function analyseDay(d) {
  const rainP = d.precipitation_probability_max ?? 0;
  const rainMm = d.precipitation_sum ?? 0;
  const maxT = d.temperature_2m_max;
  const minT = d.temperature_2m_min;
  const uv = d.uv_index_max ?? 0;
  const wind = d.wind_speed_10m_max ?? 0;
  const code = d.weather_code;

  const severeRain = rainP >= 70 || rainMm >= 10 || [65,67,80,81,82,95,96,99].includes(code);
  const strongRain = rainP >= 45 || rainMm >= 5 || [61,63,66,71,73,75,77].includes(code);
  const heat = maxT >= 38;
  const hot = maxT >= 33;
  const cold = minT <= 5;
  const chilly = minT <= 12;
  const strongWind = wind >= 40;
  const highUV = uv >= 8;
  const moderateUV = uv >= 6;

  if (severeRain && (heat || strongWind)) {
    return {level:"poor", verdict:"Plan around the weather — rain and rough conditions could disrupt outdoor plans.", reasons:["rain","wind/heat"], icon:"☔"};
  }
  if (severeRain) {
    return {level:"poor", verdict:"Carry a raincoat and keep a flexible plan for outdoor time.", reasons:["rain"], icon:"☔"};
  }
  if (heat && highUV) {
    return {level:"poor", verdict:"Avoid being outside at the hottest part of the day; plan shade and hydration.", reasons:["heat","uv"], icon:"☀"};
  }
  if (heat) {
    return {level:"poor", verdict:"Very hot day — keep major outdoor plans to cooler hours.", reasons:["heat"], icon:"☀"};
  }
  if (strongWind) {
    return {level:"poor", verdict:"Windy conditions may make exposed outdoor plans uncomfortable.", reasons:["wind"], icon:"≋"};
  }
  if (strongRain) {
    return {level:"caution", verdict:"A mixed day — keep a rain layer handy and stay flexible outdoors.", reasons:["rain"], icon:"🌦"};
  }
  if (hot && highUV) {
    return {level:"caution", verdict:"Good for going out, but protect yourself from strong midday sun.", reasons:["heat","uv"], icon:"◐"};
  }
  if (cold) {
    return {level:"caution", verdict:"A cold day — outdoor plans are fine with a proper warm layer.", reasons:["cold"], icon:"◌"};
  }
  if (chilly) {
    return {level:"caution", verdict:"Comfortable with layers; mornings and evenings may feel cool.", reasons:["chilly"], icon:"◌"};
  }
  if (moderateUV) {
    return {level:"good", verdict:"Good day to be outdoors — just use basic sun protection.", reasons:["uv"], icon:"☀"};
  }
  return {level:"good", verdict:"Good day to be outdoors.", reasons:[], icon:"✦"};
}

function renderResults(place, dates, data) {
  const d = data.daily;
  const days = d.time.map((date, i) => ({
    date,
    weather_code:d.weather_code?.[i],
    temperature_2m_max:d.temperature_2m_max?.[i],
    temperature_2m_min:d.temperature_2m_min?.[i],
    precipitation_probability_max:d.precipitation_probability_max?.[i],
    precipitation_sum:d.precipitation_sum?.[i],
    uv_index_max:d.uv_index_max?.[i],
    wind_speed_10m_max:d.wind_speed_10m_max?.[i],
    sunrise:d.sunrise?.[i],
    sunset:d.sunset?.[i]
  })).map(x => ({...x, analysis:analyseDay(x)}));

  document.getElementById("tripTitle").textContent = [place.name, place.country].filter(Boolean).join(", ");
  document.getElementById("tripDates").textContent = `${formatLongDate(dates.start)} – ${formatLongDate(dates.end)} · ${days.length} ${days.length === 1 ? "day" : "days"}`;

  const counts = days.reduce((a,d) => { a[d.analysis.level]++; return a; }, {good:0,caution:0,poor:0});
  let overall, support, icon;
  if (counts.poor >= Math.ceil(days.length/2)) {
    overall = "This trip needs a little weather planning.";
    support = `${counts.poor} of ${days.length} days have conditions worth planning around.`;
    icon = "◐";
  } else if (counts.caution > 0) {
    overall = "Mostly workable, with a few things to watch.";
    support = `${counts.good} good ${counts.good === 1 ? "day" : "days"} and ${counts.caution} ${counts.caution === 1 ? "day" : "days"} needing a little preparation.`;
    icon = "✦";
  } else {
    overall = "Looking good for a weather-friendly trip.";
    support = `${counts.good} of ${days.length} days look straightforward for outdoor plans.`;
    icon = "☀";
  }
  document.getElementById("summaryText").textContent = overall;
  document.getElementById("summarySupport").textContent = support;
  document.getElementById("summaryIcon").textContent = icon;

  document.getElementById("forecastList").innerHTML = days.map(dayCard).join("");
  renderPacking(days);
  renderBonusInsights(days);
}

function dayCard(d) {
  const date = new Date(d.date + "T00:00:00");
  const a = d.analysis;
  return `
    <article class="forecast-card">
      <div>
        <div class="day">${date.toLocaleDateString(undefined,{weekday:"short"})}</div>
        <div class="date">${date.toLocaleDateString(undefined,{day:"numeric",month:"short"})}</div>
      </div>
      <div class="details">
        <div class="verdict">${a.verdict}</div>
        <div class="metrics">
          <span class="metric">High <strong>${round(d.temperature_2m_max)}°</strong></span>
          <span class="metric">Low <strong>${round(d.temperature_2m_min)}°</strong></span>
          <span class="metric">Rain <strong>${round(d.precipitation_probability_max)}%</strong></span>
          <span class="metric">UV <strong>${round(d.uv_index_max)}</strong></span>
          <span class="metric">Wind <strong>${round(d.wind_speed_10m_max)} km/h</strong></span>
        </div>
      </div>
      <div class="badge ${a.level}">${a.level === "poor" ? "Plan around it" : a.level === "caution" ? "Watch" : "Good"}</div>
    </article>`;
}

function buildPackingList(days) {
  const items = [];
  const add = (text, tag) => items.push({text, tag});

  add("Comfortable walking shoes", "Every day");

  const rainDays = days.filter(d => d.precipitation_probability_max >= 40 || d.precipitation_sum >= 3);
  const strongRainDays = days.filter(d => d.precipitation_probability_max >= 70 || d.precipitation_sum >= 10);
  const heatDays = days.filter(d => d.temperature_2m_max >= 30);
  const hotDays = days.filter(d => d.temperature_2m_max >= 35);
  const coldDays = days.filter(d => d.temperature_2m_min <= 12);
  const chillyDays = days.filter(d => d.temperature_2m_min <= 16);
  const highUVDays = days.filter(d => d.uv_index_max >= 6);
  const veryHighUVDays = days.filter(d => d.uv_index_max >= 8);
  const windDays = days.filter(d => d.wind_speed_10m_max >= 35);
  const strongWindDays = days.filter(d => d.wind_speed_10m_max >= 45);

  if (strongRainDays.length) add("Waterproof rain jacket with hood", `${strongRainDays.length} rainy ${strongRainDays.length === 1 ? "day" : "days"}`);
  else if (rainDays.length) add("Compact umbrella or packable rain shell", `${rainDays.length} ${rainDays.length === 1 ? "rainy day" : "rainy days"}`);

  if (hotDays.length) add("Lightweight, breathable outfits", `${hotDays.length} hot ${hotDays.length === 1 ? "day" : "days"}`);
  else if (heatDays.length) add("Light daytime layers", "Warm forecast");

  if (coldDays.length) add("Warm sweater or insulated outer layer", `${coldDays.length} cool ${coldDays.length === 1 ? "day" : "days"}`);
  else if (chillyDays.length) add("Light jacket for mornings and evenings", "Cool mornings");

  if (veryHighUVDays.length) add("SPF 30+ sunscreen + sunglasses", "High UV");
  else if (highUVDays.length) add("Sunscreen + sunglasses", "Moderate-high UV");

  if (hotDays.length && highUVDays.length) add("Cap or sun hat", "Heat + UV");
  if (strongWindDays.length) add("Wind-resistant outer layer", "Strong wind");
  else if (windDays.length) add("Light windproof layer", "Breezy");

  if (days.some(d => d.temperature_2m_max >= 34 && d.precipitation_probability_max >= 50)) {
    add("Quick-dry clothes", "Warm + wet");
  }

  if (days.some(d => d.precipitation_sum >= 10)) {
    add("Waterproof shoe covers or water-resistant footwear", "Heavy rain");
  }

  if (days.some(d => d.uv_index_max >= 9)) {
    add("Reusable water bottle", "Very high UV");
  }

  // Deduplicate by item text while preserving the strongest recommendation.
  return [...new Map(items.map(item => [item.text, item])).values()];
}

function renderPacking(days) {
  const items = buildPackingList(days);
  const labels = items.slice(0, 4).map(x => x.tag);
  document.getElementById("packingSummary").innerHTML =
    labels.map(x => `<span class="pack-chip">${escapeHTML(x)}</span>`).join("");

  document.getElementById("packingList").innerHTML = items.map(item =>
    `<li><span class="check">✓</span><span><strong>${escapeHTML(item.text)}</strong><small>${escapeHTML(item.tag)}</small></span></li>`
  ).join("");
}

function renderBonusInsights(days) {
  const best = [...days].sort((a,b) => {
    const score = d => {
      let s = 100;
      if (d.precipitation_probability_max >= 60) s -= 30;
      else if (d.precipitation_probability_max >= 35) s -= 15;
      if (d.temperature_2m_max >= 35) s -= 25;
      else if (d.temperature_2m_max >= 30) s -= 10;
      if (d.temperature_2m_min <= 8) s -= 10;
      if (d.wind_speed_10m_max >= 40) s -= 20;
      if (d.uv_index_max >= 9) s -= 8;
      return s;
    };
    return score(b) - score(a);
  })[0];

  const readableBest = new Date(best.date+"T00:00:00").toLocaleDateString(undefined,{weekday:"long", day:"numeric", month:"short"});
  let bestText = `${readableBest} looks like your strongest outdoor day`;
  if (best.analysis.level === "good") bestText += " — use it for your longest plans.";
  else bestText += " among the selected dates, so keep major plans flexible.";

  const hot = days.filter(d => d.temperature_2m_max >= 33).length;
  const rainy = days.filter(d => d.precipitation_probability_max >= 50 || d.precipitation_sum >= 5).length;
  const windy = days.filter(d => d.wind_speed_10m_max >= 35).length;
  let pattern = "Conditions are fairly steady across the trip.";
  if (rainy >= Math.ceil(days.length/2)) pattern = `Rain is the dominant pattern: ${rainy} of ${days.length} days need a flexible outdoor plan.`;
  else if (hot >= Math.ceil(days.length/2)) pattern = `Heat is the dominant pattern: ${hot} of ${days.length} days call for cooler-hour planning.`;
  else if (windy >= Math.ceil(days.length/2)) pattern = `Wind is the main watch-out across the trip: ${windy} of ${days.length} days are breezy or stronger.`;
  else if (rainy > 0 || hot > 0 || windy > 0) pattern = "Mostly workable conditions, with a few weather interruptions to plan around.";

  const levels = days.map(d => d.analysis.level);
  const spread = new Set(levels).size;
  const confidence = spread === 1 ? "High confidence — the days tell a consistent story." :
    spread === 2 ? "Good confidence — most days are similar, with a few exceptions." :
    "Mixed forecast — conditions vary a lot, so keep plans flexible.";

  document.getElementById("bestWindowText").textContent = bestText;
  document.getElementById("weatherPatternText").textContent = pattern;
  document.getElementById("confidenceText").textContent = confidence;
}

function formatLongDate(s) {
  return new Date(s+"T00:00:00").toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});
}
function round(n) { return Number.isFinite(n) ? Math.round(n) : "—"; }
function setStatus(type, text) {
  statusEl.className = `status ${type}`;
  statusEl.classList.remove("hidden");
  statusEl.innerHTML = type === "loading" ? `<span class="spinner"></span>${escapeHTML(text)}` : escapeHTML(text);
}
function clearStatus() { statusEl.classList.add("hidden"); }
function showFormError(text) { formError.textContent = text; formError.classList.remove("hidden"); }
function hideFormError() { formError.classList.add("hidden"); }
function escapeHTML(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
