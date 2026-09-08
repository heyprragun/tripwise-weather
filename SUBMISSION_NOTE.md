# TripWise — Methodology Note

## 1. Who I am advising

I designed TripWise for a **general leisure/city-break traveller** who mainly wants to know whether outdoor plans are sensible and what to pack. This keeps the decision rules useful across sightseeing, casual outdoor activities and city travel rather than optimising for a specialist group such as trekkers.

## 2. What signals I use and why

I intentionally do not treat every API field as equally important.

- **Rain probability + precipitation amount:** the strongest disruption signal. A high chance of rain or meaningful precipitation changes whether outdoor plans are comfortable.
- **Maximum temperature:** catches hot days where the user should move outdoor activities to cooler hours.
- **Minimum temperature:** catches cold mornings/evenings and drives the need for a warm layer.
- **UV index:** affects sun-protection advice even when the temperature itself is comfortable.
- **Maximum wind speed:** catches days where exposed outdoor activities may become uncomfortable.
- **Weather code:** used as supporting context for precipitation severity.

The interface shows the key numbers, but the main output is a sentence. This follows the product goal: users should not have to interpret a weather table themselves.

## 3. Thresholds and priority

The rules are deliberately simple and deterministic.

**Plan around it**
- Rain probability ≥ 70% OR precipitation ≥ 10 mm.
- Maximum temperature ≥ 38°C.
- Maximum wind ≥ 40 km/h.
- Very severe combinations, such as rain plus heat/wind, are also prioritised here.

**Watch**
- Rain probability ≥ 45% OR precipitation ≥ 5 mm.
- Maximum temperature ≥ 33°C with high UV.
- Minimum temperature ≤ 5°C.
- Minimum temperature ≤ 12°C for a cooler-day warning.

**Good**
- Conditions that do not cross the above thresholds.
- UV ≥ 6 adds a sun-protection reminder without making an otherwise good day a bad day.

When several things go wrong, the most disruptive condition wins. For example, severe rain takes priority over a minor UV warning. The user still receives exactly one clear sentence for the day.

## 4. Packing logic

The packing list is generated across the entire selected trip and then deduplicated. For example, if rain is forecast on three different days, the user gets one rain-layer item rather than three separate entries.

Typical additions include:
- waterproof rain jacket or compact umbrella when rain is meaningful,
- breathable clothes and quick-dry clothing when warmth + rain overlap,
- sunscreen and sunglasses when UV is elevated,
- cap/sun hat when heat and UV overlap,
- a warm layer or light jacket for cool mornings/evenings,
- wind-resistant layers when winds are stronger,
- water-resistant footwear when heavier rainfall is expected.

## 5. One deliberate omission

I deliberately left **hourly forecast data** out of this MVP. Hourly information can make the interface much noisier, while the core question is trip-level planning. I would add it next to improve time-specific advice such as "avoid 1–4pm" when the daily data indicates heat.

## 6. What I would build next

1. Add hourly analysis so verdicts can recommend the best time window for outdoor plans.
2. Add a simple activity selector (sightseeing, beach, hiking, event) so thresholds can adapt to the trip.
3. Add forecast-confidence / change indicators when a forecast moves significantly between searches.
4. Add richer weather icons and accessibility improvements after usability testing.


## Bonus features

I added three small decision-support features beyond the core brief:
- **Best outdoor day** ranks the selected days using the same core weather signals.
- **Dominant weather pattern** explains whether rain, heat, wind or stable conditions define the trip.
- **Trip confidence** tells the user whether conditions are consistent or vary significantly across the chosen dates.

These features were kept lightweight so the product remains a weather decision tool rather than becoming a dashboard.
