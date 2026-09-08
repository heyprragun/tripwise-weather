# TripWise — Submission Note

## 1. Product intent

TripWise is designed for a general leisure or city-break traveller who wants to decide whether outdoor plans are sensible and what to pack. The product deliberately turns a dense weather forecast into a small number of confident, useful decisions.

The experience is organised around three questions:

1. **Can I enjoy this day outside?**
2. **What should I prepare for?**
3. **What should I do next?**

The first two are answered by the forecast cards and packing list. The third is supported by the bonus insights and the TripMate companion.

## 2. Signals and reasoning

I do not treat every API field as equally important. The main decision signals are:

- **Rain probability and precipitation amount:** the strongest disruption signal for outdoor plans.
- **Maximum temperature:** identifies heat that may require cooler-hour planning.
- **Minimum temperature:** identifies cold mornings and evenings.
- **UV index:** changes sun-protection advice even when temperatures are comfortable.
- **Maximum wind speed:** identifies exposed or uncomfortable conditions.
- **Weather code:** provides supporting context for precipitation classification.

The interface leads with a sentence rather than a table. The numbers are still shown as supporting evidence, but the traveller does not have to interpret them alone.

## 3. Verdict thresholds and priority

The rules are deterministic and intentionally easy to explain.

**Plan around it** is used for:

- rain probability of at least 70% or precipitation of at least 10 mm;
- very hot conditions at 38°C or above;
- strong wind at 40 km/h or above;
- severe weather combinations, such as rain combined with heat or strong wind.

**Watch** is used for:

- rain probability of at least 45% or precipitation of at least 5 mm;
- hot conditions at 33°C or above when UV is also high;
- minimum temperature at 5°C or below;
- cooler conditions at 12°C or below overnight.

**Good** is used when no stronger warning is triggered. UV of 6 or above can add a sun-protection reminder without turning an otherwise good day into a bad one.

When several conditions occur together, the most disruptive condition wins. Each day still receives one clear verdict and one plain-language explanation.

## 4. Packing logic

TripWise creates one list for the complete selected date range and deduplicates it. This avoids repeating the same item for every rainy or cool day.

Typical recommendations include:

- waterproof rainwear or a compact umbrella;
- breathable or quick-dry clothing for warm and wet combinations;
- sunscreen, sunglasses and a cap when UV or heat is elevated;
- a warm layer or light jacket for cool mornings and evenings;
- wind-resistant layers for stronger winds;
- water-resistant footwear when heavier rainfall is expected.

The list can now be copied directly, making the output useful while packing rather than only informative inside the page.

## 5. TripMate companion

TripMate is a small browser-only planning companion. It uses the selected destination and forecast already present in the page to answer basic questions about:

- what to pack;
- whether conditions are suitable for outdoor plans;
- where to start looking for markets, shopping streets or malls;
- simple food and itinerary ideas.

It intentionally does not claim to know live shops, restaurants, opening hours or current venue availability. Shopping suggestions are generic planning guidance, and the interface says so. This keeps the feature useful without adding a backend, API key or misleading location data.

A future connected version could add a trusted places provider after the core decision experience is validated.

## 6. Interaction and accessibility improvements

The updated interface adds:

- staggered result-card entrance animations;
- a lightweight typing state for TripMate responses;
- hover and focus states for interactive controls;
- a responsive assistant panel that works on mobile and desktop;
- keyboard-visible focus styling;
- a `prefers-reduced-motion` mode;
- responsive wrapping for long verdicts, badges, legends and methodology text.

The animation system is deliberately restrained: it reinforces hierarchy and state changes without competing with the weather advice.

## 7. Deliberate omission and next steps

Hourly forecast data is intentionally out of scope for this MVP. Daily signals are enough to answer the core trip-level question without turning the page into a dashboard.

The next useful iterations would be:

1. add hourly analysis for advice such as “plan outdoor time before 11am”;
2. add an activity selector for sightseeing, beach days, hikes or events;
3. add forecast-change indicators between searches;
4. connect TripMate to a trusted places source for verified local recommendations;
5. add richer weather iconography after usability testing.

## 8. Feature summary

Beyond the core daily verdict, the current submission includes:

- **Best outdoor day:** ranks selected days using the same weather signals;
- **Dominant weather pattern:** explains whether rain, heat, wind or stable conditions define the trip;
- **Trip confidence:** describes how consistent the selected days are;
- **TripMate:** provides lightweight, contextual planning help;
- **Copyable packing list:** turns the generated advice into an immediately usable checklist.
