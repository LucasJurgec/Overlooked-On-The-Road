# Overlooked on the Road 🏍️

A data visualisation project exploring motorcyclists as an overlooked road safety concern in Australia, built with D3.js. Compares motorcycle hospitalisation trends against vehicle registration data to surface the scale of the risk gap.

**🔗 Live demo: [lucasjurgec.github.io/Overlooked-On-The-Road](https://lucasjurgec.github.io/Overlooked-On-The-Road/)**

---

## Features

- **Choropleth map** — geographic distribution of motorcycle-related hospitalisations across Australia
- **Dumbbell chart** — comparison across categories/regions
- **Line chart** — motorcycle hospitalisations per 10,000 registered vehicles, over time
- **Donut chart** — percentage of registered motorcycles vs. percentage of motorcycle hospitalisations, with drill-down detail

---

## Tech Stack

| Layer | Technology |
|---|---|
| Visualisation | D3.js |
| Frontend | HTML, CSS, JavaScript |
| Data Processing | KNIME |

---

## Data & Methodology

Data, including registered vehicle datasets, was sourced and cleaned using KNIME before being visualised with D3.js.

---

## Local Setup

### Prerequisites

- A modern web browser
- (Optional) Node.js, if you'd rather serve the site via a local dev server than open the file directly

```bash
git clone https://github.com/lucasjurgec/Overlooked-On-The-Road.git
cd Overlooked-On-The-Road
```

Then either open `index.html` directly in your browser, or serve it locally:

```bash
npx serve .
```

---

## Team

- **Lucas Jurgec** — data sourcing and cleaning (KNIME), per-10,000 line chart, donut chart drill-down, and dumbbell chart D3.js visualisations
- **Tristan Nguyen** — HTML, CSS, overall site design, line chart, and choropleth

---

## Notes

Coursework project — Swinburne University of Technology.Overlooked on the Road 🏍️

Coursework project — Swinburne University of Technology.
