# Visualisation Design Book
**Overlooked on the Road: A Decade of Motorcycle Hospitalisations in Australia**

Team: dv03_t07 · Quoc Tri Nguyen [105544639] · Lucas Jurgec [105923018]
Tutorial: Monday 2:30 · 2026 Semester 1

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Data](#2-data)
3. [Visualisation Design](#3-visualisation-design)
4. [Iteration and Validation](#4-iteration-and-validation)
5. [Conclusion and Future Improvements](#5-conclusion-and-future-improvements)

---

## 1 Introduction

### 1.1 Background and Motivation

Road traffic injuries represent one of Australia's most persistent public health burdens, with tens of thousands of people hospitalised each year following road crashes. While road safety campaigns have historically concentrated on drink driving and seatbelt compliance, the hospitalisation data tells a more nuanced story — one in which motorcyclists have been quietly accumulating a growing share of the burden.

Between 2011 and 2021, motorcyclist hospitalisations grew from 7,565 to 8,883, a rise of approximately 17%, while car occupant injuries remained comparatively flat. Despite accounting for roughly 22% of all road traffic hospitalisations nationally, motorcyclists represent a small fraction of registered road users, suggesting a disproportionate level of risk not yet reflected in policy attention or public awareness campaigns.

The target audience is road safety policymakers and state transport departments — users responsible for allocating road safety investment, designing targeted interventions, and evaluating existing programs. They require accurate, evidence-based analysis of injury trends across demographics and geographies.

Key tasks users will perform:
- Tracking motorcycle hospitalisation trends nationally over 2011–2021
- Identifying which age groups and sexes are most represented among hospitalised motorcyclists
- Comparing motorcycle injury rates against other road user types
- Exploring geographic patterns across states and remoteness categories

### 1.2 Visualisation Purpose

This visualisation aims to answer:
1. Are motorcycle hospitalisations increasing over time relative to other road user types?
2. Which age groups account for the highest number of motorcycle hospitalisations, and does this challenge common assumptions?
3. How does the sex distribution of hospitalised motorcyclists change over time?
4. Which states and remoteness categories carry the highest motorcycle injury burden?
5. How does the motorcycle hospitalisation rate compare to cars when adjusted for registered vehicle counts?

The age group finding in particular — that the 40–64 cohort accounts for nearly double the hospitalisations of the 17–25 cohort — challenges the prevailing assumption that motorcycle injuries are primarily a young person's problem, with direct implications for how safety messaging is framed.

---

## 2 Data

### 2.1 Data Source and Governance

**Primary dataset:** Bureau of Infrastructure and Transport Research Economics (BITRE) — Hospitalised Injuries from Road Crashes
https://www.bitre.gov.au/publications/ongoing/hospitalised-injury

| File | Records | Key Attributes | Coverage |
|---|---|---|---|
| National hospitalised injuries | 117,919 rows | Year, road user, age, sex, remoteness, hospitalisations, bed days | 2011–2021 |
| State and territory injuries | ~1,372 rows | Year, state/territory, hospitalisations | 2011–2021 |
| First Nations injuries | ~353 rows | Year, First Nations status, remoteness, hospitalisations | 2011–2021 |

**Supplementary dataset:** ABS Motor Vehicle Census — registered vehicle counts by type and year, used for per-10,000 hospitalisation rate calculations.
Source: https://www.abs.gov.au

**Data collection process:** Hospital separations data sourced from the AIHW National Hospital Morbidity Database, coded using ICD-10-AM. Analysis focuses on road vehicle traffic accidents (category a) as defined in the data dictionary.

**Data quality — methodological breaks:** Two series breaks exist. Victoria changed its case inclusion criteria in July 2012, reducing national counts by an estimated 5.6%. NSW applied an equivalent change from June 2017. These breaks will be annotated directly on trend charts to avoid misinterpretation.

Raw hospitalisation counts are not population-adjusted. Direct comparison of state-level counts without accounting for population differences can be misleading, particularly for NT and ACT. This limitation is noted in the visualisation narrative.

**Privacy and ethics:** The dataset contains de-identified aggregate counts only. No individual patient records are included. Published under Australian Government authorship with full attribution to AIHW and ABS.

### 2.2 Data Processing and Analysis

> *[KNIME workflow screenshot to be inserted here]*

The KNIME workflow consists of two parallel pipelines — one for the national dataset and one for the state dataset — with two additional exploratory branches producing charts used in section 2.3.

**National pipeline:**
1. **Excel Reader** — reads Hospitalised_Injuries_Publication source file (117,919 rows)
2. **Column Filter** — removes Month, Cause of injury, Counterparty, Count of cases, Bed days, Died_cases, Died_bed_days. Retains: Calendar year, ABS remoteness area, Age group, Sex, Road user, Hospitalisations
3. **Row Filter** — removes records where Road user is "Not applicable" or "Other or unknown", and records where remoteness area is missing (117,919 → 76,420 rows)
4. **Rule Engine** — consolidates road user sub-types:
   - Car driver / Car passenger / Car unknown position → `Car`
   - Heavy transport driver / passenger / unknown → `Heavy transport vehicle`
   - Pick-up truck or van occupant / Bus occupant → `Other`
   - Motorcyclist, Pedal cyclist, Pedestrian → unchanged
5. **GroupBy** — aggregates Hospitalisations by Calendar year, ABS remoteness area, Age group, Sex, Road user (→ 2,462 rows)
6. **CSV Writer** — outputs `main.csv`

**State pipeline:**
1. **Excel Reader** — reads State_And_Territory source file (1,372 rows)
2. **Column Filter** — retains: Year, monthly period, road user, hospitalisation count, state
3. **Column Renamer** — renames to: Year, Monthly period, Road user, Hospitalisations, State
4. **Row Filter** — removes embedded header row (→ 1,371 rows)
5. **Row Filter** — filters to Road user = "Motorcyclist" only (→ 176 rows)
6. **String to Number** — converts Hospitalisations to Double for aggregation
7. **GroupBy** — groups by Year and State, summing across two six-monthly periods (→ 88 rows)
8. **CSV Writer** — outputs `state.csv`

**Key attributes:**

| Attribute | Data Type | Notes |
|---|---|---|
| Calendar year | Ordinal | 2011–2021 |
| Road user | Nominal | Car, Motorcyclist, Pedal cyclist, Pedestrian, Heavy transport vehicle, Other |
| Age group | Ordinal | 0-7, 8-16, 17-25, 26-39, 40-64, 65-74, 75+ |
| Sex | Nominal | Male, Female |
| ABS remoteness area | Ordinal | Major Cities, Regional, Remote |
| Hospitalisations | Ratio | Count of hospital separations |

### 2.3 Data Exploration

> *[Summary statistics and KNIME screenshots to be inserted here]*

Initial observations from exploratory analysis:
- Motorcyclist hospitalisations grew consistently from 7,565 (2011) to 8,883 (2021) — a 17% increase
- The **40–64 age group** accounts for the largest share of motorcycle hospitalisations, nearly doubling the 17–25 cohort — the central finding of the project
- Approximately 90% of hospitalised motorcyclists are male across all years
- Motorcycle share of all road traffic hospitalisations remained stable at ~22–23% throughout the decade
- State-level counts are dominated by NSW, QLD, and VIC, consistent with population distribution

**Challenges encountered:** The VIC 2012 and NSW 2017 series breaks create a visible step change in national totals requiring annotation. Registered vehicle count data is not included in the BITRE dataset and was sourced separately from ABS for rate normalisation.

---

## 3 Visualisation Design

### 3.1 Visual Design Principles

The visual design follows a dark-mode editorial aesthetic. The rationale prioritises signal over decoration: a near-black background (#111111) eliminates chart junk, off-white text (#f0f0f0) maintains readability, and a single amber accent colour (#e07a2a) is reserved exclusively for interactive elements, highlights, and key findings. Any coloured element carries semantic meaning.

Typography uses **Inter** (sans-serif) for interface text and **JetBrains Mono** for axis labels, data values, and callout figures. Monospace on numerical data creates visual alignment and signals precision to the policy audience.

The colour palette for multi-category charts uses the **Okabe-Ito palette**, validated as colourblind-safe under deuteranopia and protanopia simulations. Red and green are not used in combination.

Design principles applied throughout:
- All axes labelled with units explicitly stated
- Tooltips on all interactive elements showing exact values
- The 40–64 age group finding is annotated directly within the chart
- Caveat note permanently displayed alongside state-level counts

### 3.2 Chart Design and Visual Encoding

The design consolidates the original seven planned graphs into **two interactive charts**. A dimension picker replaces the need for separate charts per breakdown — one chart with a dropdown is more analytically powerful and easier to maintain.

**Chart 1 — National Hospitalisation Trend (Multi-line Chart)**

Encodes hospitalisation counts on the y-axis against calendar year on the x-axis, with one line per category of the selected dimension. A dropdown allows switching between four breakdowns: Road User Type, Age Group, Sex, and Remoteness. Redrawing uses animated D3 transitions (500ms) to maintain user orientation.

For the Road User comparison, counts are normalised to a **per-10,000 registered vehicles rate** using ABS data. Raw counts are misleading — the difference partly reflects fleet size, not pure risk.

| Channel | Variable |
|---|---|
| x position | Year (2011–2021, linear scale) |
| y position | Hospitalisations or rate per 10,000 |
| Colour hue | Category (road user / age group / sex / remoteness) |
| Line weight | Motorcyclist at 3px vs 2px for others |

**Chart 2 — State Choropleth**

State-level counts encoded as colour saturation on an Australia base map using ABS ASGS GeoJSON boundaries. Sequential single-hue scale (near-black → amber). A diverging scale was considered and rejected — no meaningful policy midpoint exists. State labels rendered at centroid positions.

**Potential future direction — Zoomable Sunburst**

A zoomable sunburst has been prototyped as a potential alternative to Chart 1. The inner ring represents road user types; the outer ring represents age groups within each. Clicking an inner segment zooms into that road user's age breakdown — a literal chart-in-chart interaction. A year slider animates the whole structure. This prototype has been built and tested against the real dataset but is not yet confirmed for the final submission. It will be evaluated in the iteration phase against the current two-chart approach based on readability and usability feedback.

### 3.3 Interaction Design

Interactions follow three principles: direct manipulation, progressive disclosure, and cross-chart coordination.

**Shared year slider**
A sticky slider at the top of the visualisation page is shared between both charts. Dragging fires a `yearChange` CustomEvent that each chart listens for independently — neither chart holds a reference to the other.

```js
// dispatcher
document.dispatchEvent(new CustomEvent("yearChange", { detail: { year: +slider.value } }));

// each chart listens independently
document.addEventListener("yearChange", e => update(e.detail.year));
```

Chart 1 clips lines to data up to the selected year. Chart 2 updates choropleth fill colours.

**Dimension picker (Chart 1)**
Dropdown redraws Chart 1 with a new aggregation. D3 enter/update/exit joins ensure categories common to consecutive dimensions persist visually.

**Absolute / % Share toggle (Chart 1)**
Switches the y-axis between raw counts and percentage share of total for that year — separating genuine growth from proportional change.

**Choropleth click → CustomEvent**
Clicking a state fires a `stateClick` CustomEvent carrying the state code. Currently annotates Chart 1 with the state name; in the final version will filter Chart 1 to state-level data where available.

**Tooltips**
All charts show tooltips on mousemove: category name, year, exact count. Positioned using `event.clientX/Y` with fixed offset to prevent viewport overflow.

### 3.4 Website Design

Three-page static HTML structure:

| Page | Purpose |
|---|---|
| index.html | Landing — headline finding, key statistics, narrative |
| visualisation.html | Both charts with shared controls |
| about.html | Team, data sources, tools |

Navigation is a sticky top bar with backdrop blur. Active page state shown via accent-coloured text.

Layout uses CSS Grid: fixed 240px metadata column (title, description, controls, legend) + flexible `1fr` chart column. Keeps reading experience separate from visual without crowding controls into the chart canvas.

Responsive: two-column grid collapses below 900px. Chart SVGs use `viewBox` + `width: 100%` to scale without JavaScript.

### 3.5 Coding Plan

**File structure**
```
index.html
visualisation.html
about.html
css/
  main.css              design tokens, layout, shared components
js/
  load-data.js          Promise.all loader, calls chart functions
  line-chart.js         Chart 1 draw and update logic
  choropleth.js         Chart 2 draw and update logic
data/
  main.csv              national data, 2,462 rows
  state.csv             state motorcycle counts, 88 rows
  RegisteredVehicles.csv  ABS vehicle census for rate normalisation
  states.geojson        ABS state boundaries
```

**Shared constants** (defined once, referenced throughout):
- `COLORS` — category colour assignments (Okabe-Ito palette)
- `DIMENSION_FIELD` — dropdown value → CSV field name mapping
- `EXCLUDE` — categories filtered from display (intersex/indeterminate)

**Chart function signatures:**
- `drawLineChart(main, registered)` — called once on load
- `drawChoropleth(stateData, geo)` — called once on load
- Both update internally via `yearChange` / `stateClick` CustomEvent listeners

**D3 techniques used:**
- `d3.rollup` — multi-level aggregation
- `d3.geoMercator` + `fitSize` — choropleth projection
- `d3.scaleSequential` — choropleth colour encoding
- `d3.transition` with enter/update/exit joins — animated dimension switching

---

## 4 Iteration and Validation

*Draft — to be completed Week 12.*

This section will document design changes made between Week 11 and Week 12 in response to peer feedback and tutor review. Areas under active consideration include: whether to adopt the zoomable sunburst prototype as the primary chart, whether the per-10,000 normalisation toggle should be more prominent, and whether the state choropleth provides sufficient standalone value or should be merged with the remoteness breakdown.

---

## 5 Conclusion and Future Improvements

*Draft — to be completed Week 12.*

This section will evaluate how effectively the final visualisation addresses the user tasks defined in Section 1.2, summarise key design decisions, and identify improvements given additional development time — including potential First Nations data integration and a fully responsive mobile layout.
