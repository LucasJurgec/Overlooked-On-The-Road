# Project Ideas — DV03_T07
> Road Crash Hospitalisations in Australia (BITRE 2011–2021)

---

## Consolidated Plan (fewer, more interactive charts)

Instead of 7 single-purpose charts, collapse everything into 2 charts + 1 linked detail panel. Interactivity does the work.

### Chart 1 — Interactive Trend Line (replaces G1, G2, G3, G4, G6, G7)
- **What:** National hospitalisations over 2011–2021, drawn as multiple lines
- **Dimension picker dropdown:** switch between "by Road User", "by Age Group", "by Sex", "by Remoteness" — redraws the lines each time
- **Year slider:** animates all lines across years
- **Click a data point → dumbbell expands below** showing Male vs Female split for that year (covers G4 without a separate chart)
- **Toggle button:** switch between absolute counts and % share (covers G7)

### Chart 2 — State Choropleth (replaces G5)
- **What:** Australia map, states coloured by total hospitalisations
- **Year slider:** shared with Chart 1, animates colour intensity
- **Click a state → fires `CustomEvent`** that filters Chart 1 to that state only
- GeoJSON already in repo

### Detail Panel (optional, replaces G7 / stacked view)
- Lives below Chart 1, hidden by default
- Appears on click of a line or data point
- Shows a 100% stacked bar for the selected year + dimension
- Not really a third chart — just "detail on demand"

### Why this is better for the design book
- Fewer charts = more depth per chart = stronger design argument
- Interactivity replaces redundancy — one chart with a dimension picker is more sophisticated than 7 static ones
- Cross-chart linking (choropleth → line chart) demonstrates CustomEvent pattern
- Easier to build and maintain than 7 separate JS files

---

## Narrative / Story Hook

The data flips a common assumption: **40–64 year olds are hospitalised at nearly 2× the rate of 17–25 year olds**. That is the centrepiece. The story arc could be:

> "We assume young drivers are the risk — but the data says otherwise. And where you live makes it much worse."

---

## Proposed 7 Graphs

### Graph 1 — National Trend (Line Chart)
- **What:** Total hospitalisations per year, 2011–2021, national level
- **Why:** Sets the scene. Shows overall trajectory — is it getting better or worse?
- **Chart type:** Line chart (already started in line-chart.js)
- **Interaction:** Hover tooltip showing exact count + % change from 2011
- **Extension idea:** Add a dumbbell chart *inside* the line chart — clicking a data point shows the male vs female gap for that year (as per design book note "use inner dumbbell chart inside the line chart if clicked")

### Graph 2 — Road User Type Breakdown (Stacked/Grouped Bar)
- **What:** Hospitalisations by road user type (Car, Motorcyclist, Pedal cyclist, Pedestrian, Heavy transport, Other) over time
- **Why:** Shows which user types drive the overall numbers; Motorcyclist and Car dominate
- **Chart type:** Stacked bar (yearly) OR small multiples line (one line per user type)
- **Note:** Pedestrian IS in the data — do not filter out
- **Interaction:** Click a road user category to isolate/highlight it; toggle between stacked and grouped

### Graph 3 — Age Group Breakdown (Bar or Lollipop Chart)
- **What:** Total hospitalisations by age group (aggregated across all years, or per year with slider)
- **Why:** The 40–64 finding is the strongest insight. Nearly doubles 17–25. Flips the stereotype.
- **Chart type:** Horizontal bar chart or lollipop — age groups on Y axis, count on X
- **Interaction:** Year slider to animate shifts over time; highlight 40–64 bar with annotation calling out the stereotype flip
- **Annotation idea:** Add a callout text "Common assumption: 17–25 are highest risk" with an arrow pointing to the 17–25 bar — visually contrasted against the taller 40–64 bar

### Graph 4 — Sex Breakdown (Dumbbell / Paired Bar)
- **What:** Male vs Female hospitalisations across age groups or road user types
- **Why:** Males are significantly over-represented, especially in Motorcyclist category
- **Chart type:** Dumbbell chart (one dot per sex, connected by a line) — one row per age group
- **Interaction:** Tooltip showing M/F ratio; filter by road user type

### Graph 5 — State Comparison (Choropleth or Bar)
- **What:** Hospitalisations per state, 2011–2021 (from state.csv)
- **Why:** NSW and QLD dominate in absolute counts, but smaller states have higher per-capita rates
- **Chart type:** Australia choropleth (using states.geojson already in repo) OR horizontal bar with state labels
- **Note:** Raw counts are misleading due to population size — add caveat in tooltip/annotation
- **Interaction:** Year slider; hover shows count + disclaimer about population normalisation

### Graph 6 — Remoteness (Bar or Area Chart)
- **What:** Major Cities vs Regional vs Remote hospitalisations over time (from main.csv)
- **Why:** Remote areas have disproportionately high rates relative to population
- **Chart type:** Grouped bar (by remoteness, per year) OR area chart showing share over time
- **Source:** main.csv (ABS remoteness area column)
- **Interaction:** Toggle between absolute counts and share of total

### Graph 7 — Percentage / Share Chart (Stacked Area or Normalised Bar)
- **What:** Each road user type as % of total hospitalisations per year
- **Why:** Even if total counts change, the relative share of each group tells a different story
- **Denominator:** Total national hospitalisations for that year (sum across all rows for that Calendar year)
- **Chart type:** 100% stacked area chart or normalised stacked bar
- **Interaction:** Hover to see exact % for each segment; filter by remoteness

---

## Ideas for Graphs 5 + 6 Merge

Could combine into a **faceted/small multiples** chart:
- Rows = remoteness category (Major Cities, Regional, Remote)
- Columns = states grouped by typical remoteness profile
- But this gets complicated — safer to keep separate and link them via a shared year filter

Alternatively: a **dot plot** where X = state, Y = remoteness rate, dot size = total count. Probably overkill.

**Recommendation:** Keep separate for clarity in the design book. Revisit after coding Graph 5.

---

## Interaction Design Ideas

| Interaction | Method | Chart(s) | Effect |
|---|---|---|---|
| Year filter | Slider (range input) | All | All charts animate to selected year |
| Road user filter | Legend click / checkbox | G2, G7 | Isolate one or more user types |
| Dumbbell on click | Click a line point | G1 | Expand to show M/F dumbbell for that year |
| State highlight | Click map region | G5 | Filter G6 to show remoteness for that state only |
| Tooltip | Hover | All | Show exact count, year, category label |
| Annotation toggle | Button | G3 | Show/hide the "stereotype flip" callout |
| Normalise toggle | Button | G6, G7 | Switch between absolute and % view |

---

## Cross-Chart Communication Pattern (from sample project)

Use `CustomEvent` to link charts:
```js
// Dispatcher (e.g., state choropleth)
document.dispatchEvent(new CustomEvent('stateClick', { detail: { state, year } }));

// Listener (e.g., remoteness chart)
document.addEventListener('stateClick', function(e) {
    const { state, year } = e.detail;
    updateRemotenessChart(state, year);
});
```

---

## Website Structure (multi-page, Bootstrap)

```
index.html          — Landing / intro, headline finding, navigation
visualisation.html  — All 7 charts + shared year slider
about.html          — Team info, data sources
process_book.html   — Links to design book PDF
```

---

## D3 Techniques to Use

- `Promise.all([d3.csv(...), d3.csv(...)])` — load main.csv + state.csv together
- `d3.rollup()` — aggregate hospitalisations by group (replaces manual loops)
- `d3.transition().duration(400)` — smooth updates on slider/filter change
- `d3.zoom()` — on the state choropleth
- `d3.lineRadial()` — if adding a radar chart later
- `window.innerWidth * factor` — responsive sizing (no hardcoded px)

---

## Visual Design Inspiration (Rig.ai)

Dark mode bold minimal — not white minimal. Reference: https://rig.ai

**Palette**
- Background: near-black (~`#0d0d0d` or `#111`)
- Text: off-white (`#f0f0f0`)
- Accent: one strong colour — red-orange on Rig, but for road crash data consider `#e05c2a` (orange-red feels appropriate) or a deep amber. Must be colourblind-safe.
- Borders/dividers: very subtle `rgba(255,255,255,0.08)` thin lines

**Typography**
- Display/headline: large bold sans-serif, no frills
- Section labels: ALL CAPS + letter-spacing, in a `border: 1px solid` pill badge with a small icon prefix (`×`, `✓`, `⊙`)
- Stats: massive number + tiny descriptor below (e.g. `2× higher` / `40–64 age group vs 17–25`)
- Technical/data labels: monospace font

**Layout patterns to steal**
- Section label pill above each chart: `[ ROAD USER BREAKDOWN ]`
- Big hero stat on the landing section — put the key finding front and centre
- 1px border grid dividing chart sections (no box-shadows, no cards with bg colour)
- Numbered chart sections: `01 / NATIONAL TREND`, `02 / BY AGE GROUP`

**What NOT to copy**
- The red background hero (too aggressive, not appropriate for health data)
- The terminal UI mockup (irrelevant to our project)
- Dark grid background texture (adds noise, charts need clean backgrounds)

---

## Design Principles Checklist

- [ ] Colourblind-safe palette (use ColorBrewer or Viridis — not red/green alone)
- [ ] Font size ≥ 12px for axis labels
- [ ] Tooltips on all charts
- [ ] Mobile: at minimum, charts stack vertically on small screens
- [ ] No pie charts (avoid ambiguity in comparing slices)
- [ ] Annotations on key findings (40-64 age group, remote vs city gap)
- [ ] Caveat text on state counts ("raw counts — not population-normalised")

---

## Open Questions (resolve with teammate)

- [ ] Graph 7 denominator confirmed as total national hospitalisations per year?
- [ ] Pedestrian back in Graph 2 (confirm not filtered in KNIME)?
- [ ] Merge Graphs 5 & 6 or keep separate?
- [ ] Who codes which charts for standup Week 11 vs Week 12?
- [ ] Is RegisteredVehicles.csv used anywhere? Only has Motorcycles + Total, not per-type — limits normalisation options
