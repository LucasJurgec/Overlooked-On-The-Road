# Visualisation Design Book
**Overlooked on the Road: A Decade of Motorcycle Hospitalisations in Australia**

Team: dv03_t07 · Quoc Tri Nguyen [105544639] · Lucas Jurgec [105923018]
Tutorial: Monday 2:30 · 2026 Semester 1
Word Count: [TBD]

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 Background and Motivation
   - 1.2 Visualisation Purpose
2. [Data](#2-data)
   - 2.1 Data Source and Governance
   - 2.2 Data Processing and Analysis
   - 2.3 Data Exploration
3. [Visualisation Design](#3-visualisation-design)
   - 3.1 Website Design
   - 3.2 Visualisation Design
   - 3.3 Interaction Design
4. [Iteration and Validation](#4-iteration-and-validation)
   - 4.1 Testing and Refinements
   - 4.2 Usability Evaluation
5. [Conclusion and Future Improvements](#5-conclusion-and-future-improvements)
6. [References](#6-references)
7. [Appendices](#7-appendices)

---

## 1 Introduction

### 1.1 Background and Motivation

Road traffic injuries represent one of Australia's most persistent public health burdens, with tens of thousands of people hospitalised each year following road crashes. While road safety campaigns have historically concentrated on drink driving and seatbelt compliance, the hospitalisation data tells a more nuanced story — one in which motorcyclists have been quietly accumulating a growing share of the burden.

Between 2011 and 2021, motorcyclist hospitalisations grew from 7,565 to 8,883, a rise of approximately 17%, while car occupant injuries remained comparatively flat. Despite accounting for roughly 22% of all road traffic hospitalisations nationally, motorcyclists represent a small fraction of registered road users, suggesting a disproportionate level of risk that is not yet reflected in policy attention or public awareness campaigns.

The target audience for this visualisation is road safety policymakers and state transport departments. These users are responsible for allocating road safety investment, designing targeted interventions, and evaluating the effectiveness of existing programs. They require accurate, evidence-based analysis of injury trends across demographics and geographies to make informed decisions about where resources should be directed.

Key tasks users will perform using this visualisation include:
- Tracking motorcycle hospitalisation trends nationally over the 2011–2021 period
- Identifying which age groups and sexes are most represented among hospitalised motorcyclists
- Comparing motorcycle injury rates against other road user types
- Exploring geographic patterns across states and remoteness categories

### 1.2 Visualisation Purpose

This visualisation aims to answer the following questions:
- Are motorcycle hospitalisations increasing over time relative to other road user types?
- Which age groups account for the highest number of motorcycle hospitalisations, and does this challenge common assumptions about rider demographics?
- How does the sex distribution of hospitalised motorcyclists change over time?
- Which states and remoteness categories carry the highest motorcycle injury burden?
- How does the motorcycle hospitalisation rate compare to cars when adjusted for registered vehicle counts?

The completed visualisation benefits policymakers in the following ways. It provides a single, evidence-grounded reference for understanding where the motorcycle injury burden is concentrated, enabling more targeted campaign design and infrastructure investment. The age group finding in particular — that the 40–64 cohort accounts for 50% more hospitalisations than the 17–25 cohort — challenges the prevailing assumption that motorcycle injuries are primarily a young person's problem, which has direct implications for how safety messaging is framed and where it is placed.

---

## 2 Data

### 2.1 Data Source and Governance

**Primary dataset:** Bureau of Infrastructure and Transport Research Economics (BITRE) — Hospitalised Injuries from Road Crashes
https://www.bitre.gov.au/publications/ongoing/hospitalised-injury

The dataset comprises three files:

| File | Records | Key Attributes | Coverage |
|---|---|---|---|
| National hospitalised injuries | 117,919 rows | Year, road user, age, sex, remoteness, hospitalisations, bed days | 2011–2021 |
| State and territory injuries | ~1,372 rows | Year, state/territory, hospitalisations | 2011–2021 |
| First Nations injuries | ~353 rows | Year, First Nations status, remoteness, hospitalisations | 2011–2021 |

**Supplementary dataset:** ABS Motor Vehicle Census — registered vehicle counts by type and year, to support hospitalisation rate calculations.
Source: https://www.abs.gov.au

The dataset comprises five files:

| File | Records | Key Attributes | Coverage |
|---|---|---|---|
| 93090do001_2016 (renamed: 2016-11,15) | No raw data | Registered vehicles per state, registered motorcycles per state | 2016, 2015, 2011 |
| 93090do001_2017 (renamed: 2017-12,16) | No raw data | Registered vehicles per state, registered motorcycles per state | 2017, 2016, 2012 |
| 93090do001_2018 (renamed: 2018-13,17) | No raw data | Registered vehicles per state, registered motorcycles per state | 2018, 2017, 2013 |
| 93090do001_2019 (renamed: 2019-14,18) | No raw data | Registered vehicles per state, registered motorcycles per state | 2019, 2018, 2014 |
| 93090do001_2021 (renamed: 2021-16,20) | No raw data | Registered vehicles per state, registered motorcycles per state | 2021, 2020, 2016 |

**Data collection process:** Hospital separations data was sourced from the Australian Institute of Health and Welfare (AIHW) National Hospital Morbidity Database, coded using ICD-10-AM. Cause categories are derived from principal diagnosis and external cause codes. The analysis focuses on road vehicle traffic accidents (category a) as defined in the data dictionary.

**Data quality assessment:** Two significant methodological breaks exist in the series. Victoria changed its case inclusion criteria in July 2012, excluding admissions treated solely in Emergency Departments, reducing national counts by an estimated 5.6% from that point. New South Wales applied an equivalent change from June 2017. These breaks are documented in the data dictionary and will be annotated directly on trend charts to avoid misinterpretation.

Raw hospitalisation counts are not population-adjusted. Direct comparison of state-level counts without accounting for population differences can be misleading, particularly for smaller jurisdictions such as the Northern Territory and Australian Capital Territory. This limitation will be clearly noted in the visualisation narrative.

**Privacy and ethics:** The dataset contains de-identified aggregate counts only. No individual patient records are included. The data is published under Australian Government authorship with full attribution to AIHW and ABS.

### 2.2 Data Processing and Analysis

> *[KNIME workflow screenshots to be inserted here — two images: one for the national and state pipelines, one for the registered vehicle pipeline]*

The KNIME workflow consists of three pipelines: one for the national dataset, one for the state and territory dataset, and a third for the registered vehicles datasets.

**National pipeline:**
1. **Excel Reader** — reads the "Hospitalised_Injuries_Publication" source file (117,919 rows, all columns)
2. **Column Filter** — removes "Month", "Cause of injury", "Counterparty", "Count of cases", "Bed days", "Died_cases", and "Died_bed_days". Retains "Calendar year", "ABS remoteness area", "Age group", "Sex", "Road user", and "Hospitalisations"
3. **Row Filter** — removes records where "Road user" is "Not applicable" or "Other or unknown", and records where remoteness area is missing. Reduces dataset from 117,919 to 76,420 rows
4. **Rule Engine** — combines granular road user sub-types into simplified categories:
   - "Car driver", "Car passenger", "Car unknown position" → "Car"
   - "Heavy transport driver", "Heavy transport passenger", "Heavy transport unknown position" → "Heavy transport vehicle"
   - "Pick-up truck or van occupant", "Bus occupant" → "Other"
   - "Motorcyclist", "Pedal cyclist", "Pedestrian" → unchanged
5. **GroupBy** — aggregates "Hospitalisations" grouped by "Calendar year", "ABS remoteness area", "Age group", "Sex", and "Road user" (2,462 rows)
6. **CSV Writer** — outputs "main.csv"

**Exploratory branches (from Row Filter output):**
A separate Row Filter filters the cleaned data to Motorcyclist road user only. This feeds two branches used for exploratory analysis:
- GroupBy by "ABS remoteness area" → Bar Chart (motorcycle hospitalisations by remoteness)
- GroupBy by "Calendar year" → Line Plot (total motorcycle hospitalisations per year)

**Key attributes from main.csv:**

| Attribute | Data Type | Notes |
|---|---|---|
| Calendar year | Ordinal | 2011–2021 |
| ABS remoteness area | Nominal | Major Cities, Regional, Remote |
| Age group | Ordinal | 0-7, 8-16, 17-25, 26-39, 40-64, 65-74, 75+ |
| Sex | Nominal | Male, Female |
| Road user | Nominal | Car, Motorcyclist, Pedal cyclist, Pedestrian, Heavy transport vehicle, Other |
| Hospitalisations | Ratio | Count of hospital separations |

**State pipeline:**
1. **Excel Reader** — reads "State_And_Territory" source file (1,372 rows). The state file uses a multi-section Excel format with unnamed columns labelled "empty_B" through "empty_N"
2. **Column Filter** — retains only the relevant columns: "Hospitalisations" (year), "empty_I" (monthly period), "empty_K" (road user), "empty_L" (hospitalisation count), "empty_N" (state)
3. **Column Renamer** — renames columns to: "Year", "Monthly period", "Road user", "Hospitalisations", "State"
4. **Row Filter** — removes Row0 which contains the original header text "state or territory" (1,371 rows remain)
5. **String to Number** — converts "Hospitalisations" from String to Number (Double) to enable aggregation
6. **Row Filter** — filters to "Road user" = "Motorcyclist" only (176 rows, representing 8 states × 11 years × 2 six-monthly periods)
7. **GroupBy** — groups by "Year" and "State", summing "Hospitalisations" across the two six-monthly periods to produce annual motorcycle totals (88 rows)
8. **GroupBy** — groups by "Year" and "State", summing "Hospitalisations" across the two six-monthly periods and across all road users to produce total hospitalisations per state per year (88 rows)
9. **Joiner** — combines the motorcycle hospitalisations and total hospitalisations into the same dataset
10. **Column Renamer** — renames "Sum(Hospitalisations)" and "Hospitalisations" to "tHospitalisations" and "mHospitalisations"
11. **CSV Writer** — outputs "state.csv"

**Key attributes from state.csv:**

| Attribute | Data Type | Notes |
|---|---|---|
| Year | Ordinal | 2011–2021 |
| State | Nominal | ACT, NSW, NT, Qld, SA, Tas, Vic, WA |
| mHospitalisations | Ratio | Motorcycle hospitalisations |
| tHospitalisations | Ratio | Total hospitalisations |

**Registered Vehicle Pipeline:**
1. **Excel Reader ×5** — Five excel file readers that read the data from "2016-11,15.xls", "2017-12,16.xls", "2018-13,17.xls", "2019-14,18.xls", "2021-16,20.xls", all reading from table 1
2. **Row Filter ×5** — Five row filters applied to each .xls file to remove any rows that don't contain the specific years required from that dataset
3. **Rule-based Row Filter ×10** — Ten rule-based row filters; each dataset is inputted into two separate filters — one to retain only total registered vehicles for a specific year, one to retain only registered motorcycles for a specific year
4. **Concatenate ×2** — Two concatenate nodes combine all registered motorcycle values and all total registered vehicle values into two datasets. Each dataset contains years 2011–2021 with each state included, both consisting of 11 rows and 10 columns
5. **Column Renamer ×2** — Two column renamers rename columns from "Australian Bureau of Statistics", "empty_B"–"empty_J" to "Year", "NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT", "AUS"
6. **Sorter ×2** — Two sorters sort each dataset by year in ascending order
7. **Constant Value Column ×2** — Two constant value columns add a "Registered Vehicles" column to each dataset, populated with "Total" and "Motorcycles" respectively, so the two datasets can be distinguished after joining
8. **Concatenate** — Combines the motorcycle and total vehicle datasets into one dataset
9. **Sorter** — Sorts the year values in ascending order
10. **CSV Writer** — Outputs "RegisteredVehicles.csv"

**Key attributes from RegisteredVehicles.csv:**

| Attribute | Data Type | Notes |
|---|---|---|
| Year | Ordinal | 2011–2021 |
| NSW | Ratio | Registered vehicles for New South Wales |
| VIC | Ratio | Registered vehicles for Victoria |
| QLD | Ratio | Registered vehicles for Queensland |
| SA | Ratio | Registered vehicles for South Australia |
| WA | Ratio | Registered vehicles for Western Australia |
| TAS | Ratio | Registered vehicles for Tasmania |
| NT | Ratio | Registered vehicles for Northern Territory |
| ACT | Ratio | Registered vehicles for Australian Capital Territory |
| AUS | Ratio | Registered vehicles for Australia |
| Registered Vehicles | Nominal | Motorcycles, Total |

**Data cleaning process:**
- Removed seven unnecessary columns from the national file using Column Filter, retaining only the six attributes required for analysis
- Removed records where Road user was "Not applicable" or "Other or unknown" using Row Filter, reducing the dataset by approximately 35%
- Removed records with missing remoteness area values to ensure clean geographic analysis
- Combined granular road user sub-types into six simplified categories using the Rule Engine node
- Aggregated records to annual totals using GroupBy nodes
- Handled the multi-section Excel format of the state file by retaining only relevant columns, renaming them, and removing the embedded header row
- Converted Hospitalisations from String to Number (Double) in the state pipeline to enable numeric aggregation

Three processed files were produced:
- **main.csv** — national data with all road user types, 2,462 records
- **state.csv** — state-level motorcycle and total hospitalisation counts aggregated annually, 88 records
- **RegisteredVehicles.csv** — state-level motorcycle and total counts of registered vehicles, 22 records

### 2.3 Data Exploration

> *[Summary statistics and KNIME screenshots to be inserted here]*

**Initial observations from exploratory analysis:**
- Motorcyclist hospitalisations grew consistently from 7,565 (2011) to 8,883 (2021), a 17% increase over the decade
- The 40–64 age group accounts for the largest share of motorcycle hospitalisations, 50% higher than the 17–25 cohort — this is the central finding of the project
- Approximately 90% of hospitalised motorcyclists are male across all years
- Motorcycle share of all road traffic hospitalisations remained stable at approximately 22–23% throughout the decade, suggesting raw count growth is driven by overall traffic volume increases as much as by disproportionate risk increase
- State-level counts are dominated by NSW, QLD, and VIC, consistent with population distribution

**Challenges encountered:** The VIC 2012 and NSW 2017 series breaks create a visible step change in national totals that requires careful annotation to avoid misleading trend interpretation.

---

## 3 Visualisation Design

### 3.1 Website Design

The website is structured across three static HTML pages, with a consistent sticky navigation bar across all pages. The navigation bar uses backdrop blur and remains fixed at the top of the viewport as users scroll, ensuring page-level orientation is always accessible.

**Navigation structure:**
- index.html — landing page: headline finding, key statistics, narrative introduction
- visualisation.html — all three charts with shared interactive controls
- about.html — team information, data sources, tools used

Active page state is indicated by accent-coloured link text. The navigation order reflects the intended user journey: arrive on the landing page, move to the visualisation, then check sources if needed.

> *[Screenshot: index.html — full page view]*

The landing page opens with a bold hero section establishing the central finding, followed by three verified key statistic cards (1.5×, ~91k, ~90% male) and a two-column narrative section. The "Explore the Data →" call-to-action button directs users to the visualisation page.

> *[Screenshot: visualisation.html — showing sticky slider and Chart 01]*

The visualisation page opens with a sticky global year slider positioned below the nav bar. All three charts listen to this slider simultaneously via a shared CustomEvent. Chart 01 defaults to the Per 10,000 Vehicles view. Each chart uses a two-column CSS Grid layout: a fixed 240px controls and legend column on the left, and the flexible chart SVG on the right. This separates reading and interaction content from the visual without crowding the chart canvas.

> *[Screenshot: Chart 02 — choropleth with state clicked, showing donut drill-down]*

Clicking a state on the choropleth transitions the left sidebar from descriptive text to two donut charts showing motorcycle share of registered vehicles vs motorcycle share of hospitalisations for the selected state.

> *[Screenshot: Chart 03 — dumbbell chart]*

Chart 03 shows Male vs Female hospitalisations as paired dots per age group. Filter buttons allow switching between all road users and motorcyclists only.

**Responsiveness:** The two-column chart grid collapses to a single column below 900px viewport width. Chart SVGs use `viewBox` with `width: 100%` so they scale to container width without JavaScript.

**Storyboard:** A policy user lands on the index page and reads the headline 1.5× finding, then clicks through to the visualisation. They use the year slider to animate the per-10k line chart, then switch to the Age Group breakdown to confirm the 40–64 finding. They click a state on the choropleth to see the motorcycle over-representation via the donut drill-down, then scroll to the dumbbell chart to identify that middle-aged males are the dominant group. The full journey answers all five research questions from Section 1.2 without leaving the visualisation page.

### 3.2 Visualisation Design

The design consolidates the original seven planned graphs into three interactive charts, with a focus on cross-chart interactivity and drill-down interactions. A dimension picker on the main trend chart replaces the need for separate charts per breakdown — one chart with a dropdown is more analytically powerful and easier to maintain than seven static charts covering the same data.

**Visual design principles**

The visual design follows a dark-mode editorial aesthetic. The rationale prioritises signal over decoration: a near-black background (#111111) eliminates chart junk, off-white text (#f0f0f0) maintains readability, and a single amber accent colour (#e07a2a) is reserved exclusively for interactive elements, highlights, and key findings. Any coloured element carries semantic meaning rather than decoration.

Typography uses Inter (sans-serif) for interface text and JetBrains Mono for axis labels and data values. Monospace on numerical data creates visual alignment and signals precision to the policy audience. All axis labels are a minimum of 12px to meet accessibility guidelines.

**Accessibility**

The colour palette for multi-category charts uses the Okabe-Ito palette, validated as colourblind-safe under deuteranopia and protanopia simulations. Red and green are not used in combination. A minimum font size of 12px is enforced throughout via CSS custom properties. The male/female encoding in the dumbbell chart uses green (#009E73) and pink (#CC79A7) rather than the blue/orange used elsewhere, to avoid confusion with the motorcycle/non-motorcycle colour scheme used in Chart 1.

**Graphical integrity**

Raw hospitalisation counts are not population-adjusted. A permanent caveat note is displayed alongside state-level counts warning that raw figures are not population-normalised. The per-10,000 registered vehicles normalisation in Chart 1 is used specifically for the motorcycle vs other road users comparison to avoid the misleading impression that raw count differences reflect pure risk rather than fleet size. The VIC 2012 and NSW 2017 series breaks will be annotated directly on the trend chart to prevent misinterpretation of the step changes as genuine trends.

**Chart 1 — National Hospitalisation Trend (Multi-line Chart)**

Encodes hospitalisation counts on the y-axis against calendar year on the x-axis, with one line per category of the selected dimension. A dropdown allows switching between four breakdowns: Road User Type, Age Group, Sex, and Remoteness. Redrawing uses animated D3 transitions (500ms) to maintain user orientation between states.

A separate view normalises counts to a per-10,000 registered vehicles rate using ABS Motor Vehicle Census data, comparing motorcyclists against other road users. This normalisation is essential — raw counts are partly a function of fleet size, not pure risk difference.

Visual encoding channels:
- X position: Year (2011–2021, linear scale)
- Y position: Hospitalisations or rate per 10,000 registered vehicles
- Colour hue: Category (road user / age group / sex / remoteness), using Okabe-Ito palette
- Line weight: Motorcyclist encoded at 3px vs 2px for all other categories, to emphasise the focal road user type

**Chart 2 — State Choropleth**

State-level hospitalisation counts encoded as colour saturation on an Australia base map using ABS ASGS GeoJSON boundaries. A sequential single-hue scale (near-black to amber) encodes magnitude. A diverging scale was considered and rejected — there is no meaningful policy midpoint to diverge from. State labels are rendered at centroid positions to assist users unfamiliar with Australian state geography.

Clicking a state triggers a drill-down: the metadata column replaces the descriptive text with two donut charts showing the motorcycle share of registered vehicles vs the motorcycle share of hospitalisations for the selected state. This comparison directly illustrates the over-representation of motorcyclists in the injury burden relative to their fleet size.

**Chart 3 — Age and Sex Dumbbell Chart**

Male vs Female hospitalisations plotted as paired dots connected by a line, with one row per age group. The gap between dots shows the gender disparity within each age group. The chart can be filtered between all road users and motorcyclists only, and updates with the shared year slider.

Visual encoding channels:
- Y position: Age group (ordinal scale, 0-7 through 75+)
- X position: Hospitalisations
- Colour hue: Male (green, #009E73) vs Female (pink, #CC79A7)
- Dot size: End-of-year dot is larger (5px) vs background dots (3px) to indicate the current year

**Annotations and tooltips**

All charts display tooltips on mousemove showing the exact category name, year, and hospitalisation count. A callout box beneath Chart 1 highlights the 40–64 age group finding. The caveat note beneath Chart 2 is permanently visible and cannot be dismissed.

**Potential future direction — Zoomable Sunburst**

A zoomable sunburst chart has been prototyped as a potential alternative to Chart 1. The inner ring represents road user types and the outer ring represents age groups within each type. Clicking an inner segment zooms into that road user's age breakdown, creating a literal chart-in-chart interaction. This prototype has been built and tested against the real dataset but is not yet confirmed for the final submission.

### 3.3 Interaction Design

Interactions are designed around three principles: direct manipulation, progressive disclosure, and cross-chart coordination.

**Table of interactions:**

| Interaction | Method | Chart(s) | Expected Response |
|---|---|---|---|
| Year filter | Drag slider | All charts | Lines clip to selected year; choropleth fill updates; dumbbell re-aggregates to selected year |
| Switch dimension | Dropdown select | Chart 1 | Lines transition to new categories with 500ms D3 animation; legend updates |
| Absolute / % toggle | Button click | Chart 1 | Y-axis rescales; values shown as raw counts or percentage share of total |
| Per 10k / Breakdown toggle | Button click | Chart 1 | Switches between normalised and absolute view |
| State select | Click map region | Chart 2 → Chart 1 | State highlighted with white border; donut charts appear in sidebar; dashed state overlay appears on per-10k line chart |
| State deselect | Click same region again | Chart 2 → Chart 1 | Choropleth returns to default; donut charts hide; state overlay removed |
| Road user filter | Button click | Chart 3 | Dumbbell updates to show motorcyclists only or all road users |
| Tooltip | Hover on line / dot / state | All | Popup shows exact category, year, and hospitalisation count |

**Shared year slider**

A sticky slider fixed at the top of the visualisation page is shared across all three charts. Dragging fires a `yearChange` CustomEvent that each chart listens for independently. This decoupled architecture means no chart holds a reference to another — additional charts can subscribe to the same event without modifying existing code.

**Dimension picker (Chart 1)**

A dropdown redraws Chart 1 with a new data aggregation. D3 enter/update/exit joins ensure categories common to two consecutive dimensions persist visually rather than disappearing and reappearing.

**Absolute / % Share toggle (Chart 1)**

A two-button toggle switches the y-axis between raw hospitalisation counts and each category's percentage share of total hospitalisations for that year. This separates genuine growth from proportional change.

**Choropleth click → drill-down**

Clicking a state on Chart 2 fires a `stateClick` CustomEvent carrying the selected state code. The metadata column transitions to two donut charts showing the motorcycle share of vehicles vs hospitalisations for that state. The per-10,000 line chart simultaneously overlays a dashed state-specific trend line alongside the national line.

---

## 4 Iteration and Validation

### 4.1 Testing and Refinements

The development process of this website followed an iterative process, with design choices being changed and updated after tutor suggestions and programming constraints encountered during implementation.

**Scope Reduction**

An early draft of the website included having seven different charts covering multiple different dimensions, this was considered because it would show a larger range of different programming skills. Following feedback from the tutor, we were advised to reduce the number of charts to focus on quality over quantity. We were instructed that more meaningful charts with more meaningful interactions would score more favourably than having a large number of more simple charts. Because of this we reduced the size of the website down to having three major visualisations, with a greater focus on cross-chart interactivity and drill-down interactions.

**State Data Constraints**

Our original design for the drill-down interaction on the choropleth was for a heatmap to appear when a state was clicked, displaying a breakdown of age group and sex with hospitalisation counts specific to that state. During implementation we discovered that the state data didn't contain the specific data necessary, as it only contained the sex and gender breakdown separate from the state breakdown.

To still include the drill-down interaction we changed the heatmap to display two donut charts — one displaying the percentage of registered motorcycles in comparison to total registered vehicles, and the other displaying the percentage of motorcycle hospitalisations compared to total hospitalisations. So instead of showing an age and sex breakdown per state, the drill-down shows a comparison of the size of the motorcycle fleet to the motorcycle hospitalisation burden.

This change also allowed us to improve upon the dumbbell chart. It was originally planned to only show a sex comparison based on the year, with the y-axis showing the year and the x-axis showing hospitalisations. This was changed so that the y-axis now contains the age group, and the chart can be filtered for a specific year. This change makes the dumbbell more meaningful by displaying both an age and sex breakdown rather than just the sex breakdown originally planned.

**Donut Chart Placement**

An early design for the donut chart was that when a state was clicked the chart would overlay on top of the choropleth. During a peer review it was identified that this could become a usability problem — if a user wanted to change the state filter, every time they changed the state the donut chart would appear and would need to be dismissed before filtering again, making the interaction slower. To fix this concern the two donuts were moved to the left side of the chart, where they replace the descriptive text explaining the choropleth. With this change, fast user interaction is preserved while still offering the drill-down interaction.

**Dumbbell Chart Colouring**

The initial dumbbell chart used the same blue and orange colour identifiers as the motorcycle vs other vehicle colouring — males were marked with the same blue and females with the same orange. During a peer review it was noted that this could be confusing at first glance, as a user may mistake the blue and orange for the motorcycle and non-motorcycle representation. The colouring was changed so that males are now green (#009E73) and females are pink (#CC79A7), in order to avoid this potential confusion.

**Line Chart Dots**

The initial design for the line chart did not include data point markers and would only display the line with a single dot at the end. After tutor feedback, it was suggested we include data points on the line chart to make it easier for a user to follow when using the hover effect. Data points were added for every year, and the end data point was made larger (5px vs 3px) so it stands out more clearly as the current year.

### 4.2 Usability Evaluation

*To be completed — conduct a usability evaluation.*

---

## 5 Conclusion and Future Improvements

*Draft — to be completed Week 12.*

This section will evaluate how effectively the final visualisation addresses the user tasks defined in Section 1.2, summarise the key design decisions made throughout the project, and identify improvements that would be made given additional development time — including potential First Nations data integration and a fully responsive mobile layout.

---

## 6 References

*To be completed.*

---

## 7 Appendices

**Appendix A — Gen AI Declaration**

*To be completed.*

**Appendix B — Usability Evaluation Materials**

*To be completed.*

**Appendix C — Coding Plan**

File structure:
- `index.html`, `visualisation.html`, `about.html` — page files
- `css/main.css` — design tokens, layout, shared components
- `js/load-data.js` — Promise.all loader, calls all chart functions on completion
- `js/line-chart.js` — Chart 1 breakdown view
- `js/per10k-line-chart.js` — Chart 1 per-10,000 view
- `js/choropleth.js` — Chart 2 state map
- `js/donut-chart.js` — Chart 2 drill-down donuts
- `js/dumbbell-chart.js` — Chart 3 age and sex dumbbell
- `data/main.csv` — national data, 2,462 rows
- `data/state.csv` — state hospitalisation counts, 88 rows
- `data/RegisteredVehicles.csv` — ABS vehicle census, 22 rows
- `data/states.geojson` — ABS state boundaries
