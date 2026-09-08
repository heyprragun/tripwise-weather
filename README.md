# TripWise

TripWise is a zero-build, single-page weather decision tool for travellers who want a clear answer to two questions: **is this a good day for my plans, and what should I pack?**

It combines live Open-Meteo data with plain-language advice, a deduplicated packing list and a small browser-only travel companion called TripMate.

## What it does

- Accepts a destination and dates from today through the next 14 days.
- Uses Open-Meteo geocoding at runtime and shows a location picker when a place name has multiple matches.
- Fetches daily weather data for the exact selected dates.
- Converts rain, temperature, UV and wind signals into one clear verdict per day: **Good**, **Watch** or **Plan around it**.
- Shows the supporting numbers beneath each daily recommendation.
- Generates one condition-driven, deduplicated packing list for the full trip.
- Lets the user copy the packing list with one click.
- Adds three decision-support insights: best outdoor day, dominant weather pattern and trip confidence.
- Includes the TripMate companion for quick questions about packing, shopping ideas, food planning, outdoor timing and simple itineraries.
- Adds subtle result, message and hover animations without making the interface noisy.
- Handles loading, empty, error, ambiguous-location and results states.
- Works responsively on laptop, tablet and mobile widths.
- Includes keyboard focus styles and a reduced-motion mode.

## TripMate companion

TripMate is intentionally lightweight and runs entirely in the browser. It does not send conversations to an AI service, require an API key or pretend to provide live venue recommendations.

It can:

- use the selected destination when suggesting shopping areas, food plans and activities;
- use the selected forecast when answering packing and outdoor-planning questions;
- show a short typing response and quick suggested questions;
- give generic, useful planning prompts such as looking for a central market, pedestrian shopping street or local food hall;
- clearly state when it needs a forecast before giving weather-specific advice.

The assistant is a good foundation for a future connected version that could use a trusted places provider for live shops, restaurants and opening hours.

## Run locally

The project is static HTML/CSS/JS and has no build step or dependency installation.

Option 1: open `index.html` directly in a browser.

Option 2 (recommended):

```bash
python -m http.server 5500
```

Then open [http://localhost:5500](http://localhost:5500).

## Deploy

Deploy the static runtime files to Vercel, Netlify, Cloudflare Pages, GitHub Pages or another static host:

- `index.html`
- `styles.css`
- `app.js`

`README.md` and `SUBMISSION_NOTE.md` are documentation only. No environment variables, login or API key are required.

## Decision methodology

TripWise is designed for a general leisure or city-break traveller making outdoor plans.

Primary signals, in priority order:

1. Rain probability and precipitation amount — the strongest disruption signal.
2. Maximum temperature — catches very hot days.
3. Minimum temperature — catches cold mornings and evenings.
4. UV index — changes sun-protection advice.
5. Maximum wind speed — catches uncomfortable or exposed conditions.

Weather code is used as supporting context for precipitation classification.

The interface intentionally leads with a sentence rather than a table of raw data. Numbers remain available as supporting evidence, but the traveller does not have to interpret them alone.

## Bonus product features

- **Best outdoor day:** ranks selected days using rain, heat, cold, wind and UV burden.
- **Dominant weather pattern:** explains whether rain, heat, wind or stable conditions define the trip.
- **Trip confidence:** indicates whether the selected days tell a consistent story or vary significantly.
- **TripMate:** adds a conversational layer for basic planning questions without introducing a backend dependency.
- **Copyable packing list:** makes the generated list immediately useful outside the app.

## Deliberate scope choice

The MVP uses daily forecast signals instead of hourly data. This keeps the interface focused on the trip-level decision. A future version could add hourly analysis to recommend specific windows such as “avoid 1–4pm” on hot days.
