const STATE_TO_COL = { // match state names together
  NSW: "nsw", Vic: "vic", Qld: "qld",
  SA: "sa", WA: "wa", Tas: "tas", NT: "nt", ACT: "act"
};

const PER10K_COLORS = {
    "motorcycle": "#D55E00",
    "nonMotorcycle": "#56B4E9"
};

const drawPer10kChart = (stateData, vehicleData) => {

  // ── national aggregates per year ──
  const years = [...new Set(stateData.map(d => d.year))].sort(); // create a sorted array for the years

  const motoVehicles  = vehicleData.filter(d => d.type === "Motorcycles");
  const totalVehicles = vehicleData.filter(d => d.type === "Total");

  function nationalLine() {
    return years.map(year => {
      const rows      = stateData.filter(d => d.year === year);
      const mHosp     = d3.sum(rows, d => d.mhospitalisations); 
      const tHosp     = d3.sum(rows, d => d.thospitalisations);
      const mVeh      = motoVehicles.find(d => d.year === year)?.aus; // only select years with motorcycle
      const tVeh      = totalVehicles.find(d => d.year === year)?.aus; // only select years with total
      return {
        year,
        motorcycle:    (mHosp / mVeh) * 10000, // to calculate per 10,000 motorcycle hospitalisations
        nonMotorcycle: ((tHosp - mHosp) / (tVeh - mVeh)) * 10000 // to calculate per 10,000 total vehicle hospitalisations
      };
    });
  }

  function stateLine(state) {
    const col = STATE_TO_COL[state]; // turn each state into a column
    return years.map(year => {
        const row   = stateData.find(d => d.year === year && d.state === state); // finds matching row for year and state
        const mVeh  = motoVehicles.find(d => d.year === year)?.[col]; // gets registered motorcycles
        const tVeh  = totalVehicles.find(d => d.year === year)?.[col]; // gets registered vehicles
        return {
          year,
          motorcycle:    row && mVeh ? (row.mhospitalisations / mVeh) * 10000 : null,
          nonMotorcycle: row && tVeh && mVeh ? ((row.thospitalisations - row.mhospitalisations) / (tVeh - mVeh)) * 10000 : null
        };
    });
  }

  const margin = { top: 24, right: 24, bottom: 48, left: 62 };
  const totalHeight = 420;

  const container = d3.select("#chart-per10k-container");
  const totalWidth = container.node().getBoundingClientRect().width || 700; // uses the width of the screen to scale
  const W = totalWidth - margin.left - margin.right;
  const H = totalHeight - margin.top - margin.bottom;

  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
    .attr("width", "100%")
    .style("display", "block");

  svg.append("defs").append("clipPath") // sets where the chart will draw things
    .attr("id", "per10k-clip")
    .append("rect")
    .attr("x", 0).attr("y", -margin.top)
    .attr("width", W + 1).attr("height", totalHeight);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear().domain([2011, 2021]).range([0, W]);
  const yScale = d3.scaleLinear().range([H, 0]);

  const xAxisG = g.append("g").attr("transform", `translate(0,${H})`);
  const yAxisG = g.append("g");

  const styleAxis = sel => { // to draw lines of the chart
    sel.select(".domain").attr("stroke", "rgba(255,255,255,0.12)"); // axis lines
    sel.selectAll(".tick line").attr("stroke", "rgba(255,255,255,0.12)"); // notches on x axis
    sel.selectAll(".tick text").attr("fill", "rgba(255,255,255,0.45)").style("font-size", "12px").style("font-family", "var(--font-mono)"); // tick text
  };

  g.append("text").attr("class", "axis-label") // adds the year text
    .attr("x", W / 2).attr("y", H + 40)
    .attr("text-anchor", "middle")
    .attr("fill", "rgba(255,255,255,0.3)").style("font-size", "12px").style("font-family", "var(--font-sans)")
    .text("Year");

  g.append("text").attr("class", "axis-label") // adds the hospitalisations text
    .attr("transform", "rotate(-90)")
    .attr("x", -(H / 2)).attr("y", -50)
    .attr("text-anchor", "middle")
    .attr("fill", "rgba(255,255,255,0.3)").style("font-size", "12px").style("font-family", "var(--font-sans)")
    .text("Hospitalisations per 10,000 Vehicles");

  const gridG  = g.append("g").attr("class", "grid-lines").lower();
  const linesG = g.append("g").attr("clip-path", "url(#per10k-clip)");
  const dotsG  = g.append("g").attr("clip-path", "url(#per10k-clip)");

  const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("display", "none").style("position", "fixed");

  let currentYear  = 2021;
  let currentState = null;

  function update() { // main area that draws the actual lines for the chart
    const national = nationalLine();
    const visible  = national.filter(d => d.year <= currentYear); // filter to hide years not selected

    const stateValues = currentState ? stateLine(currentState) // if state is selected 
      .filter(d => d.year <= currentYear)
      .flatMap(d => [d.motorcycle, d.nonMotorcycle].filter(v => v !== null)) : [];

    const allValues = [...visible.flatMap(d => [d.motorcycle, d.nonMotorcycle]), ...stateValues]; // creates the array for all the values
    
    yScale.domain([0, d3.max(allValues) * 1.12]); // scales the y axis

    // ── axes ──
    xAxisG.transition().duration(400)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(11)); // ticks for bottom axis
    yAxisG.transition().duration(400) // for when y axis needs to be rescaled
      .call(d3.axisLeft(yScale).ticks(6)); // ticks for left axis
    styleAxis(xAxisG); styleAxis(yAxisG); // draws the axis

    // ── grid ──
    gridG.selectAll("line").data(yScale.ticks(6)).join("line") // creates the horizontal lines
      .attr("x1", 0).attr("x2", W)
      .attr("y1", d => yScale(d)).attr("y2", d => yScale(d))
      .attr("stroke", "rgba(255,255,255,0.05)").attr("stroke-width", 1);

    const lineGen = d3.line().x(d => xScale(d.year)).curve(d3.curveMonotoneX); // line generator

    // ── national motorcycle line ──
    linesG.selectAll("path.per10k-moto").data([visible]).join("path")
      .attr("class", "per10k-moto")
      .attr("fill", "none")
      .attr("stroke", PER10K_COLORS.motorcycle)
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .transition().duration(500)
      .attr("d", lineGen.y(d => yScale(d.motorcycle)));

    // ── national non-motorcycle line ──
    linesG.selectAll("path.per10k-nonmoto").data([visible]).join("path")
      .attr("class", "per10k-nonmoto")
      .attr("fill", "none")
      .attr("stroke", PER10K_COLORS.nonMotorcycle)
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round")
      .transition().duration(500)
      .attr("d", lineGen.y(d => yScale(d.nonMotorcycle)));

    // ── state dotted overlay ──
    if (currentState) { // if a state is selected
      const stateFiltered = stateLine(currentState).filter(d => d.year <= currentYear); // filters for year
      const stateMoto    = stateFiltered.filter(d => d.motorcycle !== null); // filters for state
      const stateNonMoto = stateFiltered.filter(d => d.nonMotorcycle !== null); // filters for state

      // ── state motorcycle line ──
      linesG.selectAll("path.per10k-state").data([stateMoto]).join("path")
        .attr("class", "per10k-state")
        .attr("fill", "none")
        .attr("stroke", PER10K_COLORS.motorcycle)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "6 4")
        .attr("stroke-linecap", "round")
        .transition().duration(500)
        .attr("d", lineGen.y(d => yScale(d.motorcycle)));

      // ── state non-motorcycle line ──
      linesG.selectAll("path.per10k-state-nonmoto").data([stateNonMoto]).join("path")
        .attr("class", "per10k-state-nonmoto")
        .attr("fill", "none")
        .attr("stroke", PER10K_COLORS.nonMotorcycle)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "6 4")
        .attr("stroke-linecap", "round")
        .transition().duration(500)
        .attr("d", lineGen.y(d => yScale(d.nonMotorcycle)));

      // ── state motorcycle dots ──
      dotsG.selectAll("circle.dot-state").data(stateMoto, d => d.year).join(
        enter => enter.append("circle").attr("class", "dot-state")
          .attr("r", 3).attr("stroke", "#111").attr("stroke-width", 1.5),
        update => update,
        exit => exit.remove()
      )
      .on("mouseover", (event, d) => { // hover effect
        tooltip.style("display", "block")
          .style("left", (event.clientX + 14) + "px").style("top", (event.clientY - 30) + "px") // where hover box is displayed
          .html(`<strong style="color:${PER10K_COLORS.motorcycle}">${currentState} Motorcyclists</strong><br>${d.year} &nbsp; ${d.motorcycle.toFixed(1)} per 10,000 vehicles`); // actual hover box itself
      })
      .on("mouseleave", () => tooltip.style("display", "none"))
      .transition().duration(400) // for when year filter is changed
        .attr("r", d => d.year === currentYear ? 5 : 3)
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.motorcycle))
        .attr("fill", PER10K_COLORS.motorcycle);

      // ── state non-motorcycle dots ──
      dotsG.selectAll("circle.dot-state-nonmoto").data(stateNonMoto, d => d.year).join(
        enter => enter.append("circle").attr("class", "dot-state-nonmoto")
          .attr("r", 3).attr("stroke", "#111").attr("stroke-width", 1.5),
        update => update,
        exit => exit.remove()
      )
      .on("mouseover", (event, d) => {
        tooltip.style("display", "block")
          .style("left", (event.clientX + 14) + "px").style("top", (event.clientY - 30) + "px")
          .html(`<strong style="color:${PER10K_COLORS.nonMotorcycle}">${currentState} Other road users</strong><br>${d.year} &nbsp; ${d.nonMotorcycle.toFixed(1)} per 10,000 vehicles`);
      })
      .on("mouseleave", () => tooltip.style("display", "none"))
      .transition().duration(400)
        .attr("r", d => d.year === currentYear ? 5 : 3)
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.nonMotorcycle))
        .attr("fill", PER10K_COLORS.nonMotorcycle);

    } else {
      linesG.selectAll("path.per10k-state").remove();
      linesG.selectAll("path.per10k-state-nonmoto").remove();
      dotsG.selectAll("circle.dot-state").remove();
      dotsG.selectAll("circle.dot-state-nonmoto").remove();
    }

    // ── dots ──
    const dotTypes = [
      { key: "motorcycle",    cls: "dot-moto" },
      { key: "nonMotorcycle", cls: "dot-nonmoto" }
    ];

    dotTypes.forEach(({ key, cls }) => {
      dotsG.selectAll(`circle.${cls}`).data(visible, d => d.year).join(
        enter => enter.append("circle").attr("class", `per10k-dot ${cls}`)
          .attr("r", 3).attr("stroke", "#111").attr("stroke-width", 1.5),
        update => update,
        exit => exit.remove()
      )
      .on("mouseover", (event, d) => {
        tooltip.style("display", "block")
          .style("left", (event.clientX + 14) + "px").style("top", (event.clientY - 30) + "px")
          .html(`<strong style="color:${PER10K_COLORS[key]}">${key === "motorcycle" ? "Motorcyclists" : "Other road users"}</strong><br>${d.year} &nbsp; ${d[key].toFixed(1)} per 10,000 vehicles`);
      })
      .on("mouseleave", () => tooltip.style("display", "none"))
      .transition().duration(400)
        .attr("r", d => d.year === currentYear ? 5 : 3)
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d[key]))
        .attr("fill", PER10K_COLORS[key]);
    });
  }

  document.addEventListener("yearChange", e => { // checking if year filter is changed
    currentYear = e.detail.year;
    update();
  });

  document.addEventListener("stateClick", e => { // checking if a state is selected
    currentState = e.detail.state;
    update();
  });

  update();

  // ── legend (made with GenAI) ──
    const legendEl = document.getElementById("chart-per10k-legend");
    if (legendEl) {
      legendEl.innerHTML = `
        <div class="legend-item">
          <div class="legend-swatch" style="background:${PER10K_COLORS.motorcycle}"></div>
          <span>Motorcyclists</span>
        </div>
        <div class="legend-item">
          <div class="legend-swatch" style="background:${PER10K_COLORS.nonMotorcycle}"></div>
          <span>Other road users</span>
        </div>
        ${currentState ? `
        <div class="legend-item">
          <div class="legend-swatch" style="background:${PER10K_COLORS.motorcycle}; outline: 2px dashed ${PER10K_COLORS.motorcycle}; background:transparent"></div>
          <span>${currentState} Motorcyclists</span>
        </div>` : ""}
      `;
    }
};