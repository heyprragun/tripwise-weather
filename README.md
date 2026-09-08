# TripWise — ShARE Tech Vertical Recruitment Task

A zero-build, single-page weather decision tool using live Open-Meteo APIs.

## What it does

- Accepts a city and travel dates up to 14 days ahead.
- Uses Open-Meteo geocoding at runtime.
- If the city name has multiple matches, shows a location picker instead of silently taking the first result.
- Fetches live daily forecast data for exactly the selected dates.
- Converts weather signals into one plain-language verdict per day.
- Generates one deduplicated, condition-driven packing list for the entire trip.
- Adds bonus trip insights: best outdoor day, dominant weather pattern and forecast consistency.
- Shows a trip-level summary.
- Handles empty, loading, error and results states.
- Responsive on phone and laptop.
- No login, no API key, no hardcoded forecast data.

## Run locally

Because this is static HTML/CSS/JS, no build step is needed.

Option 1: open `index.html` in a browser.

Option 2 (recommended):
```bash
python -m http.server 5500
```
Then open `http://localhost:5500`.

## Deploy

Upload the three files (`index.html`, `styles.css`, `app.js`) to a static host such as Vercel, Netlify, Cloudflare Pages or GitHub Pages.

No environment variables are required.

## Decision methodology

Audience: a general leisure/city-break traveller making outdoor plans.

Primary signals:
1. Rain probability + precipitation amount — strongest disruption signal.
2. Maximum temperature — catches very hot days.
3. Minimum temperature — catches cold mornings/evenings.
4. UV index — changes sun-protection advice.
5. Maximum wind speed — catches uncomfortable/exposed conditions.

Weather code is used as a supporting signal for precipitation classification.

Priority:
- Severe rain, or rain combined with heat/wind → "Plan around it".
- Very high heat → "Plan around it".
- Strong wind → "Plan around it".
- Moderate rain / cold / chilly conditions → "Watch".
- Otherwise → "Good".

The verdict intentionally does not expose every number. Numbers are supporting evidence beneath the decision.

Deliberately left out:
- Hourly forecast data. For a simple trip-planning MVP, daily signals are enough to answer "is this a decent trip day?" without making the interface noisy. A next iteration could use hourly data to make advice like "avoid 1–4pm" more precise.

## Submission note

See `SUBMISSION_NOTE.md` for the one-page methodology note.


## Bonus product features

The MVP includes three lightweight bonus features:
- **Best outdoor day:** ranks selected days on rain, heat, cold, wind and UV burden.
- **Dominant weather pattern:** explains whether rain, heat, wind or generally stable conditions define the trip.
- **Trip confidence:** describes whether selected days are consistent or highly variable.

These are intentionally explanatory rather than decorative, so each feature helps the traveller make a decision.
