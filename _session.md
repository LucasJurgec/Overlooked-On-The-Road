# Session Summary — for next context compact

## Project
- Unit: COS30045 Data Visualisation, 2026 S1
- Team: DV03_T07 — Quoc Tri Nguyen + teammate
- Topic: Hospitalised Injuries from Road Crashes in Australia (BITRE dataset 2011–2021)
- Repo: `2026-data-vis-project-dv03_t07` (current working dir)
- Next deadline: **Week 11 standup** (week of ~2026-05-25) — must present draft of Sections 3.1, 3.2, 3.3 + prototype sketches + coding plan

## What We Did This Session
1. Read the full `index.html` of the current project (minimal — D3 v7, line-chart.js, load-data.js, one `<div id="line-chart">`)
2. Read the entire sample high-score project at `C:\Users\nguye\Downloads\sample\COS30045---Data-Visualisation` (91/100 grade)
3. Read all 3 data CSVs: main.csv, state.csv, RegisteredVehicles.csv (full read including second half)
4. Synthesised ideas doc (_ideas.md) and this session doc (_session.md)
5. Created .gitignore ignoring both _ideas.md and _session.md
6. Decided on tech stack, chart consolidation, and visual direction

## Tech Stack Decisions
- **No React** — unit requires D3, D3 and React both fight over the DOM, adds complexity for zero marks
- **No Bootstrap** — not needed, plain CSS is fine, keeps it light and fully controllable
- **Stack:** plain HTML + vanilla JS + D3 v7 + plain CSS

## Visual Design Direction
Dark mode bold minimal — inspired by rig.ai (not white minimal)
- Background: near-black (`#111` or `#0d0d0d`)
- Text: off-white (`#f0f0f0`)
- One accent colour — red-orange or deep amber (road crash context appropriate, must be colourblind-safe)
- Section label pills: `[ NATIONAL TREND ]` style, ALL CAPS, 1px border, small icon prefix
- Big hero stat on landing: put the key finding (40-64 age group) front and centre as a large number
- 1px border grid lines dividing sections, no box-shadows
- Monospace font for data labels/axis ticks
- Charts are the only visually heavy element — everything else is restrained

**Do NOT use:** red hero background, Bootstrap grid, box-shadows, gradients

## Consolidated Chart Plan (updated from original 7)
Instead of 7 single-purpose charts, use 2 charts + 1 linked detail panel:

**Chart 1 — Interactive Trend Line** (covers G1, G2, G3, G4, G6, G7)
- Dimension picker dropdown: switch between "by Road User", "by Age Group", "by Sex", "by Remoteness"
- Year slider animates lines
- Click a data point → dumbbell expands below showing M/F split for that year
- Toggle: absolute counts ↔ % share

**Chart 2 — State Choropleth** (covers G5)
- Australia map coloured by hospitalisations
- Shared year slider
- Click state → fires CustomEvent → filters Chart 1 to that state

**Detail Panel** (optional, covers G7 / stacked view)
- Hidden by default, appears on click
- 100% stacked bar for selected year + dimension

## Sample Project Key Takeaways
Path: `C:\Users\nguye\Downloads\sample\COS30045---Data-Visualisation\HomePage\`
- 4 charts: World choropleth, bubble scatter plot, KDE density, radar chart
- All linked via a shared year `<input type="range" id="yearSlider">`
- Cross-chart comms via `document.dispatchEvent(new CustomEvent(...))`
- Each chart is a standalone function — `choropleth()`, `scatter_plot()`, `density()`, `radar_chart()`
- Responsive sizing: `window.innerWidth * 0.43` style constants in a `cfg` object
- `Promise.all([d3.csv(), d3.csv()])` for multi-file loading

## Data Files Summary

### data/main.csv — 2464 rows (fully read)
Columns: `Calendar year`, `ABS remoteness area`, `Age group`, `Sex`, `Road user`, `Hospitalisations`
- Remoteness: Major Cities, Regional, Remote
- Age groups: 0-7, 8-16, 17-25, 26-39, 40-64, 65-74, 75+
- Sex: Female, Male, intersex or indeterminate or missing (small counts, scattered)
- Road user: Car, Heavy transport vehicle, Motorcyclist, Other, Pedal cyclist, **Pedestrian** (all present, NOT filtered)
- Years: 2011–2021
- Notable: 2020 cycling spike (COVID lockdown boom visible in Pedal cyclist counts)
- Notable: Remote area data is sparse — many age/sex/user combos simply absent

### data/state.csv — 88 rows
`Year`, `State` (ACT NSW NT Qld SA Tas Vic WA), `Hospitalisations`

### data/RegisteredVehicles.csv — 22 rows
Year, per-state + AUS, type = "Motorcycles" or "Total". Missing motorcycle data for 2013 and 2018.

### Excel files (not yet parsed)
- data/hospitalisation_injury_publication_sep2023.xlsx — national BITRE
- data/state-and-territory-hospitalisation-injury-publication-2023.xlsx
- data/First-Nations-hospitalised-injuries-2023.xlsx

## Key Insight (use as story hook)
**40-64 age group has nearly 2× the hospitalisations of 17-25.** Flips the common assumption. Should be the hero stat on the landing section, not buried in a chart.

## Teammate Open Questions (unresolved)
1. Pedestrian IS in main.csv — confirm not filtered in KNIME pipeline
2. Graph 7 denominator: likely total national hospitalisations per year (not yet confirmed)
3. Graphs 5 and 6: different source files (state.csv vs main.csv) — document in Section 2.1
4. Design book "use inner dumbbell chart inside the line chart if clicked" — confirmed this is Graph 1

## Current JS Files in Project
- `js/line-chart.js` — basic line chart structure, needs styling
- `js/load-data.js` — loads RegisteredVehicles.csv; also loads states.geojson
- States GeoJSON already in repo (for choropleth)

## Design Book Structure Required
1. Intro (background, purpose, questions users answer)
2. Data (sources, governance, processing, KNIME workflow, EDA)
3. Visualisation Design (website wireframe, chart choices, interaction table)
4. Iteration & Validation (testing, usability eval)
5. Conclusion
6. References + Appendices (Gen AI declaration, usability materials)

## Interaction Pattern to Use
```js
document.dispatchEvent(new CustomEvent('stateClick', { detail: { state, year } }));
document.addEventListener('stateClick', e => updateChart(e.detail));
```

## What to Build Next
- Complete line chart (Graph 1) with dimension picker, transitions, tooltip
- Start state choropleth — GeoJSON already in repo
- Shared year slider linking both
- Draft Section 3 of design book for standup
- Decide final accent colour with teammate
