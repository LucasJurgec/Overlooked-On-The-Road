// GeoJSON uses full state names; state.csv uses short codes (NSW, Vic, Qld, etc.)
const GEO_TO_CSV = {
  "New South Wales":            "NSW",
  "Victoria":                   "Vic",
  "Queensland":                 "Qld",
  "South Australia":            "SA",
  "Western Australia":          "WA",
  "Tasmania":                   "Tas",
  "Northern Territory":         "NT",
  "Australian Capital Territory": "ACT"
};

const drawChoropleth = (stateData, geo) => {
  const container = d3.select("#chart-02-container");
  const totalWidth  = container.node().getBoundingClientRect().width || 700;
  const totalHeight = 480;

  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
    .attr("width", "100%")
    .style("display", "block");

  // ── projection ──────────────────────────────────────────────────────────────
  const projection = d3.geoMercator()
    .fitSize([totalWidth, totalHeight - 40], geo);
  const pathGen = d3.geoPath().projection(projection);

  // ── pre-aggregate state × year → sum ────────────────────────────────────────
  const byYearState = d3.rollup(
    stateData,
    v => d3.sum(v, d => d.mhospitalisations),
    d => d.year,
    d => d.state
  );

  const maxVal = d3.max(stateData, d => d.mhospitalisations);

  const colorScale = d3.scaleSequential()
    .domain([0, maxVal])
    .interpolator(d3.interpolate("#1e1e1e", "#e07a2a"));

  // ── tooltip ──────────────────────────────────────────────────────────────────
  const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("display", "none").style("position", "fixed");

  let currentYear = 2021;
  let selectedState = null;

  function csvCode(feature) {
    return GEO_TO_CSV[feature.properties.STATE_NAME] || feature.properties.STATE_NAME;
  }

  function getHosp(code, year) {
    const ym = byYearState.get(year);
    return ym ? (ym.get(code) || 0) : 0;
  }

  // ── draw states ──────────────────────────────────────────────────────────────
  const paths = svg.append("g").selectAll("path")
    .data(geo.features)
    .join("path")
    .attr("d", pathGen)
    .attr("stroke", "rgba(255,255,255,0.15)")
    .attr("stroke-width", 0.8)
    .style("cursor", "pointer");

  // ── state name labels ────────────────────────────────────────────────────────
  svg.append("g").selectAll("text")
    .data(geo.features)
    .join("text")
    .attr("transform", d => `translate(${pathGen.centroid(d)})`)
    .attr("text-anchor", "middle").attr("dy", "0.35em")
    .attr("fill", "rgba(255,255,255,0.55)")
    .style("font-size", "12px").style("font-family", "var(--font-mono)")
    .style("pointer-events", "none")
    .text(d => csvCode(d));

  // ── colour scale legend ───────────────────────────────────────────────────────
  const legendW = 160, legendH = 10;
  const legendX = totalWidth - legendW - 16;
  const legendY = totalHeight - 32;

  const defs = svg.append("defs");
  const grad = defs.append("linearGradient").attr("id", "choro-grad")
    .attr("x1", "0%").attr("x2", "100%");
  grad.append("stop").attr("offset", "0%").attr("stop-color", "#1e1e1e");
  grad.append("stop").attr("offset", "100%").attr("stop-color", "#e07a2a");

  svg.append("rect").attr("x", legendX).attr("y", legendY)
    .attr("width", legendW).attr("height", legendH)
    .attr("fill", "url(#choro-grad)").attr("rx", 1);
  svg.append("text").attr("x", legendX).attr("y", legendY - 5)
    .attr("fill", "rgba(255,255,255,0.3)").style("font-size", "12px").style("font-family", "var(--font-mono)")
    .text("Low");
  svg.append("text").attr("x", legendX + legendW).attr("y", legendY - 5)
    .attr("text-anchor", "end")
    .attr("fill", "rgba(255,255,255,0.3)").style("font-size", "12px").style("font-family", "var(--font-mono)")
    .text("High");

  // ── interactions ──────────────────────────────────────────────────────────────
  paths
    .on("mousemove", (event, d) => {
      const code = csvCode(d);
      const hosp = getHosp(code, currentYear);
      tooltip.style("display", "block")
        .style("left", (event.clientX + 14) + "px").style("top", (event.clientY - 30) + "px")
        .html(`<strong>${d.properties.STATE_NAME}</strong><br>${currentYear}: <strong>${hosp.toLocaleString()}</strong> hospitalisations<br><small style="opacity:0.5">Raw count — not population-normalised</small>`);
    })
    .on("mouseleave", () => tooltip.style("display", "none"))
    .on("click", (event, d) => {
      const code = csvCode(d);
      selectedState = selectedState === code ? null : code;

      paths.attr("stroke", "rgba(255,255,255,0.15)").attr("stroke-width", 0.8);
      if (selectedState) {
        d3.select(event.currentTarget).attr("stroke", "#e07a2a").attr("stroke-width", 2.5);
      }

      document.dispatchEvent(new CustomEvent("stateClick", {
        detail: { state: selectedState, year: currentYear }
      }));
    });

  // ── update fill colours ───────────────────────────────────────────────────────
  function update(year) {
    currentYear = year;
    paths.transition().duration(400)
      .attr("fill", d => {
        const hosp = getHosp(csvCode(d), year);
        return hosp > 0 ? colorScale(hosp) : "#1e1e1e";
      });
  }

  update(currentYear);

  document.addEventListener("yearChange", e => update(e.detail.year));
};
