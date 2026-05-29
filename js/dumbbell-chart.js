const DUMBBELL_COLORS = {
  male:   "#009E73",
  female: "#CC79A7"
};

const AGE_ORDER = ["75+", "65-74", "40-64", "26-39", "17-25", "8-16", "0-7"];

const drawDumbbellChart = (mainData) => {

  let currentYear   = 2021;
  let currentFilter = "all";

  const margin = { top: 24, right: 24, bottom: 48, left: 72 };
  const totalHeight = 420;

  const container = d3.select("#chart-03-container");
  const totalWidth = container.node().getBoundingClientRect().width || 700;
  const W = totalWidth - margin.left - margin.right;
  const H = totalHeight - margin.top - margin.bottom;

  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
    .attr("width", "100%")
    .style("display", "block");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear().range([0, W]);
  const yScale = d3.scaleBand().domain(AGE_ORDER).range([0, H]).padding(0.4);

  const xAxisG = g.append("g").attr("transform", `translate(0,${H})`);
  const yAxisG = g.append("g");

  const styleAxis = sel => {
    sel.select(".domain").attr("stroke", "rgba(255,255,255,0.12)");
    sel.selectAll(".tick line").attr("stroke", "rgba(255,255,255,0.12)");
    sel.selectAll(".tick text").attr("fill", "rgba(255,255,255,0.45)").style("font-size", "11px").style("font-family", "'JetBrains Mono', monospace");
  };

  g.append("text") // y axis text
    .attr("x", W / 2).attr("y", H + 40)
    .attr("text-anchor", "middle")
    .attr("fill", "rgba(255,255,255,0.3)").style("font-size", "11px")
    .text("Hospitalisations");

  g.append("text") // x axis text
    .attr("transform", "rotate(-90)")
    .attr("x", -(H / 2)).attr("y", -60)
    .attr("text-anchor", "middle")
    .attr("fill", "rgba(255,255,255,0.3)").style("font-size", "11px")
    .text("Age Group");

  const gridG    = g.append("g").attr("class", "grid-lines");
  const linesG   = g.append("g");
  const dotsG    = g.append("g");

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip").style("display", "none").style("position", "fixed");

  function getData() {
    return AGE_ORDER.map(age => {
      const filtered = mainData.filter(d =>
        d.year === currentYear &&
        d.age === age &&
        (currentFilter === "all" || d.user === "Motorcyclist") &&
        (d.sex === "Male" || d.sex === "Female")
      );

      const male   = d3.sum(filtered.filter(d => d.sex === "Male"),   d => d.hospitalisations);
      const female = d3.sum(filtered.filter(d => d.sex === "Female"), d => d.hospitalisations);

      return { age, male, female };
    });
  }

  function update() {
    const data = getData();

    xScale.domain([0, d3.max(data, d => Math.max(d.male, d.female)) * 1.12]);

    xAxisG.transition().duration(400)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.format(",d")));
    yAxisG.transition().duration(400)
      .call(d3.axisLeft(yScale));
    styleAxis(xAxisG); styleAxis(yAxisG);

    gridG.selectAll("line").data(xScale.ticks(6)).join("line") // horizontal line for chart
      .attr("x1", d => xScale(d)).attr("x2", d => xScale(d))
      .attr("y1", 0).attr("y2", H)
      .attr("stroke", "rgba(255,255,255,0.05)").attr("stroke-width", 1);

    // ── connecting lines (GenAi was used for this) ──
    linesG.selectAll("line.db-line").data(data, d => d.age).join(
      enter => enter.append("line").attr("class", "db-line")
        .attr("y1", d => yScale(d.age) + yScale.bandwidth() / 2)
        .attr("y2", d => yScale(d.age) + yScale.bandwidth() / 2),
      update => update,
      exit => exit.remove()
    )
    .transition().duration(400)
      .attr("x1", d => xScale(Math.min(d.male, d.female)))
      .attr("x2", d => xScale(Math.max(d.male, d.female)))
      .attr("y1", d => yScale(d.age) + yScale.bandwidth() / 2)
      .attr("y2", d => yScale(d.age) + yScale.bandwidth() / 2)
      .attr("stroke", "rgba(255,255,255,0.15)")
      .attr("stroke-width", 2);

    // ── male dots (GenAI helped create this) ──
    dotsG.selectAll("circle.db-male").data(data, d => d.age).join(
      enter => enter.append("circle").attr("class", "db-male")
        .attr("r", 7).attr("cy", d => yScale(d.age) + yScale.bandwidth() / 2),
      update => update,
      exit => exit.remove()
    )
    .on("mouseover", (event, d) => {
      tooltip.style("display", "block")
        .style("left", (event.clientX + 14) + "px").style("top", (event.clientY - 30) + "px")
        .html(`<strong style="color:${DUMBBELL_COLORS.male}">Male</strong> · ${d.age}<br>${d.male.toLocaleString()} hospitalisations`);
    })
    .on("mouseleave", () => tooltip.style("display", "none"))
    .transition().duration(400)
      .attr("cx", d => xScale(d.male))
      .attr("cy", d => yScale(d.age) + yScale.bandwidth() / 2)
      .attr("fill", DUMBBELL_COLORS.male)
      .attr("stroke", "#111").attr("stroke-width", 1.5);

    // ── female dots ──
    dotsG.selectAll("circle.db-female").data(data, d => d.age).join(
      enter => enter.append("circle").attr("class", "db-female")
        .attr("r", 7).attr("cy", d => yScale(d.age) + yScale.bandwidth() / 2),
      update => update,
      exit => exit.remove()
    )
    .on("mouseover", (event, d) => {
      tooltip.style("display", "block")
        .style("left", (event.clientX + 14) + "px").style("top", (event.clientY - 30) + "px")
        .html(`<strong style="color:${DUMBBELL_COLORS.female}">Female</strong> · ${d.age}<br>${d.female.toLocaleString()} hospitalisations`);
    })
    .on("mouseleave", () => tooltip.style("display", "none"))
    .transition().duration(400)
      .attr("cx", d => xScale(d.female))
      .attr("cy", d => yScale(d.age) + yScale.bandwidth() / 2)
      .attr("fill", DUMBBELL_COLORS.female)
      .attr("stroke", "#111").attr("stroke-width", 1.5);
  }

  // ── event listeners ──
  document.addEventListener("yearChange", e => {
    currentYear = e.detail.year;
    update();
  });

  document.querySelectorAll(".db-filter-btn").forEach(btn => {
    btn.addEventListener("click", function() { // checks is a button is selected
      document.querySelectorAll(".db-filter-btn").forEach(b => b.classList.remove("active")); // unactivates button
      this.classList.add("active"); // activates button
      currentFilter = this.dataset.filter;
      update();
    });
  });

  update();
};