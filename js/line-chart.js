// ─── COLOUR PALETTE (Okabe-Ito, colourblind-safe on dark bg) ──────────────────
const COLORS = {
  // Road user
  "Motorcyclist":              "#D55E00",
  "Car":                       "#56B4E9",
  "Pedestrian":                "#009E73",
  "Pedal cyclist":             "#F0E442",
  "Heavy transport vehicle":   "#CC79A7",
  "Other":                     "#999999",
  // Age group
  "0-7":   "#56B4E9",
  "8-16":  "#009E73",
  "17-25": "#F0E442",
  "26-39": "#E69F00",
  "40-64": "#D55E00",
  "65-74": "#CC79A7",
  "75+":   "#0072B2",
  // Sex
  "Male":   "#009E73",
  "Female": "#CC79A7",
  // Remoteness
  "Major Cities": "#56B4E9",
  "Regional":     "#E69F00",
  "Remote":       "#D55E00"
};

const DIMENSION_FIELD = {
  "Road User Type": "user",
  "Age Group":      "age",
  "Sex":            "sex",
  "Remoteness":     "remoteness"
};

// categories to exclude
const EXCLUDE = new Set(["Intersex or indeterminate or missing", "intersex or indeterminate or missing"]);

// ─── MAIN DRAW FUNCTION ────────────────────────────────────────────────────────
const drawLineChart = (main, registered) => {
  const margin = { top: 24, right: 24, bottom: 48, left: 62 };
  const totalHeight = 420;

  const container = d3.select("#chart-01-container");
  const totalWidth = container.node().getBoundingClientRect().width || 700;
  const W = totalWidth - margin.left - margin.right;
  const H = totalHeight - margin.top - margin.bottom;

  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
    .attr("width", "100%")
    .style("display", "block");

  // clip path so lines don't overflow past selected year
  svg.append("defs").append("clipPath")
    .attr("id", "lc-clip")
    .append("rect")
    .attr("x", 0).attr("y", -margin.top)
    .attr("width", W + 1).attr("height", totalHeight);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // ── scales ──
  const xScale = d3.scaleLinear().domain([2011, 2021]).range([0, W]);
  const yScale = d3.scaleLinear().range([H, 0]);

  // ── axes ──
  const xAxisG = g.append("g").attr("transform", `translate(0,${H})`);
  const yAxisG = g.append("g");

  const styleAxis = sel => {
    sel.select(".domain").attr("stroke", "rgba(255,255,255,0.12)");
    sel.selectAll(".tick line").attr("stroke", "rgba(255,255,255,0.12)");
    sel.selectAll(".tick text").attr("fill", "rgba(255,255,255,0.45)").style("font-size", "12px").style("font-family", "var(--font-mono)");
  };

  // ── axis labels ──
  g.append("text").attr("class", "axis-label")
    .attr("x", W / 2).attr("y", H + 40)
    .attr("text-anchor", "middle")
    .attr("fill", "rgba(255,255,255,0.3)").style("font-size", "12px").style("font-family", "var(--font-sans)")
    .text("Year");

  const yLabel = g.append("text").attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -(H / 2)).attr("y", -50)
    .attr("text-anchor", "middle")
    .attr("fill", "rgba(255,255,255,0.3)").style("font-size", "12px").style("font-family", "var(--font-sans)");

  // ── grid lines group ──
  const gridG = g.append("g").attr("class", "grid-lines").lower();

  // ── line / dot layers (clipped) ──
  const linesG = g.append("g").attr("clip-path", "url(#lc-clip)");
  const dotsG  = g.append("g").attr("clip-path", "url(#lc-clip)");

  // ── tooltip ──
  const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("display", "none").style("position", "fixed");

  // ── state filter label ──
  const stateLabel = g.append("text").attr("class", "state-filter-label")
    .attr("x", W).attr("y", -8).attr("text-anchor", "end")
    .attr("fill", "#e07a2a").style("font-size", "12px")
    .style("font-family", "var(--font-mono)")
    .text("");

  let currentDim  = "Road User Type";
  let currentYear = 2021;
  let currentMode = "absolute";
  let stateFilter = null;

  // ─── aggregate data for chosen dimension ──────────────────────────────────
  function aggregate(dim) {
    const field = DIMENSION_FIELD[dim];
    const rows = [];
    d3.rollup(
      main,
      v => d3.sum(v, d => d.hospitalisations),
      d => d[field],
      d => d.year
    ).forEach((yearMap, cat) => {
      if (EXCLUDE.has(cat)) return;
      yearMap.forEach((hosp, year) => rows.push({ cat, year, hosp }));
    });
    return rows;
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  function update() {
    const data = aggregate(currentDim);
    const cats = [...new Set(data.map(d => d.cat))];

    // totals per year for % mode
    const totals = d3.rollup(data, v => d3.sum(v, d => d.hosp), d => d.year);

    const getValue = d => currentMode === "percent"
      ? (d.hosp / (totals.get(d.year) || 1)) * 100
      : d.hosp;

    const allValues = data.map(getValue);
    yScale.domain([0, d3.max(allValues) * 1.12]);

    // axes
    xAxisG.transition().duration(400)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(11));
    yAxisG.transition().duration(400)
      .call(d3.axisLeft(yScale).ticks(6).tickFormat(v => currentMode === "percent" ? `${v.toFixed(0)}%` : d3.format(",")(v)));
    styleAxis(xAxisG); styleAxis(yAxisG);

    yLabel.text(currentMode === "percent" ? "% Share of Hospitalisations" : "Hospitalisations");

    // grid
    gridG.selectAll("line").data(yScale.ticks(6)).join("line")
      .attr("x1", 0).attr("x2", W)
      .attr("y1", d => yScale(d)).attr("y2", d => yScale(d))
      .attr("stroke", "rgba(255,255,255,0.05)").attr("stroke-width", 1);

    const lineGen = d3.line().x(d => xScale(d.year)).y(d => yScale(getValue(d))).curve(d3.curveMonotoneX);

    // ── lines ──
    linesG.selectAll("path.lc-line").data(cats, d => d).join(
      enter => enter.append("path").attr("class", "lc-line")
        .attr("fill", "none").attr("stroke-linejoin", "round").attr("stroke-linecap", "round"),
      update => update,
      exit => exit.transition().duration(300).style("opacity", 0).remove()
    ).transition().duration(500)
      .attr("stroke", d => COLORS[d] || "#888")
      .attr("stroke-width", d => currentDim === "Road User Type" && d === "Motorcyclist" ? 3 : 2)
      .style("opacity", 1)
      .attr("d", cat => {
        const pts = data.filter(d => d.cat === cat && d.year <= currentYear).sort((a,b) => a.year - b.year);
        return lineGen(pts);
      });

    // ── end dots ──
    dotsG.selectAll("circle.lc-dot").data(
      cats.flatMap(cat =>
        data.filter(d => d.cat === cat && d.year <= currentYear)
      ), d => `${d.cat}-${d.year}`
    ).join(
      enter => enter.append("circle").attr("class", "lc-dot").attr("r", 3).attr("stroke", "#111").attr("stroke-width", 2),
      update => update,
      exit => exit.remove()
    )
    .on("mouseover", (event, d) => {
      const val = getValue(d);
      tooltip.style("display", "block")
        .style("left", (event.clientX + 14) + "px").style("top", (event.clientY - 30) + "px")
        .html(`<strong style="color:${COLORS[d.cat] || '#aaa'}">${d.cat}</strong><br>${d.year} &nbsp; ${currentMode === "percent" ? val.toFixed(1) + "%" : val.toLocaleString() + " hospitalisations"}`);
    })
    .on("mouseleave", () => tooltip.style("display", "none"))
    .transition().duration(400)
      .attr("r", d => d.year === currentYear ? 5 : 3)
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(getValue(d)))
      .attr("fill", d => COLORS[d.cat] || "#888");

    // ── legend ──
    const legendEl = document.getElementById("chart-01-legend");
    if (legendEl) {
      legendEl.innerHTML = cats.map(cat => `
        <div class="legend-item">
          <div class="legend-swatch" style="background:${COLORS[cat] || '#888'}"></div>
          <span>${cat}</span>
        </div>`).join("");
    }
  }

  // ─── EVENT WIRING ─────────────────────────────────────────────────────────
  document.getElementById("dimensionPicker").addEventListener("change", function() {
    currentDim = this.value;
    stateFilter = null;
    stateLabel.text("");
    update();
  });

  document.querySelectorAll(".lc-mode-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".lc-mode-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      currentMode = this.dataset.mode;
      update();
    });
  });

  document.addEventListener("yearChange", e => {
    currentYear = e.detail.year;
    update();
  });

  // TODO: cross-chart filter not yet implemented
  // main.csv has no State column so clicking the choropleth cannot filter this chart
  // plan: overlay selected state's motorcycle trend from state.csv as a dashed line
  document.addEventListener("stateClick", e => {
    stateFilter = e.detail.state;
    stateLabel.text(stateFilter ? `State: ${stateFilter} (filter not yet implemented)` : "");
  });

  update();
};
