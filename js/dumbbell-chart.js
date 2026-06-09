const DUMBBELL_COLORS = {
  male:   "#009E73", // sets male colour
  female: "#CC79A7" // sets female colour
};

const AGE_ORDER = ["75+", "65-74", "40-64", "26-39", "17-25", "8-16", "0-7"]; // age group order

const drawDumbbellChart = (mainData) => {

  let currentYear   = 2021; // tracks the selected year
  let currentFilter = "all"; // tracks the selected filter

  const margin = { top: 24, right: 24, bottom: 48, left: 72 }; // chart margins
  const totalHeight = 420; // svg height

  const container = d3.select("#chart-03-container"); // selects container element
  const totalWidth = container.node().getBoundingClientRect().width || 700; // gets container width
  const W = totalWidth - margin.left - margin.right; // calculates drawable width
  const H = totalHeight - margin.top - margin.bottom; // calculates drawable height

  const svg = container.append("svg") // creates svg in container
    .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`) // sets the viewbox
    .attr("width", "100%")
    .style("display", "block"); // removes inline spacing

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`); // shifts element

  const xScale = d3.scaleLinear().range([0, W]); // scale for hospitalisations, x
  const yScale = d3.scaleBand().domain(AGE_ORDER).range([0, H]).padding(0.4); // scale for age groups, y

  const xAxisG = g.append("g").attr("transform", `translate(0,${H})`); // sets x axis
  const yAxisG = g.append("g"); // sets y axis

  const styleAxis = sel => { // styling for axes
    sel.select(".domain").attr("stroke", "rgba(255,255,255,0.12)"); // axis line
    sel.selectAll(".tick line").attr("stroke", "rgba(255,255,255,0.12)"); // ticks on axis
    sel.selectAll(".tick text").attr("fill", "rgba(255,255,255,0.45)").style("font-size", "12px").style("font-family", "var(--font-mono)"); // tick labels
  };

  g.append("text") // x axis text
    .attr("x", W / 2).attr("y", H + 40) // centres text below x axis
    .attr("text-anchor", "middle") // anchors text
    .attr("fill", "rgba(255,255,255,0.3)").style("font-size", "12px").style("font-family", "var(--font-sans)") // text styling
    .text("Hospitalisations"); // actual text

  g.append("text") // y axis text
    .attr("transform", "rotate(-90)") // rotates text
    .attr("x", -(H / 2)).attr("y", -60) // centers text left of y axis
    .attr("text-anchor", "middle") // anchors text
    .attr("fill", "rgba(255,255,255,0.3)").style("font-size", "12px").style("font-family", "var(--font-sans)") // text styling
    .text("Age Group"); // actual text

  const gridG    = g.append("g").attr("class", "grid-lines"); // for vertical lines
  const linesG   = g.append("g"); // lines that connect dumbbell
  const dotsG    = g.append("g"); // male and female dots

  const tooltip = d3.select("body").append("div") // adds tooltip
    .attr("class", "tooltip").style("display", "none").style("position", "fixed"); // hides by default and follows cursor

  function getData() { // builds array
    return AGE_ORDER.map(age => { // maps over each age group
      const filtered = mainData.filter(d => 
        d.year === currentYear && // filters to selected year
        d.age === age && // filters to current age group
        (currentFilter === "all" || d.user === "Motorcyclist") && // filters by road user type
        (d.sex === "Male" || d.sex === "Female") // gets gender records
      );

      const male   = d3.sum(filtered.filter(d => d.sex === "Male"),   d => d.hospitalisations); // sums male hospitalisations for age group
      const female = d3.sum(filtered.filter(d => d.sex === "Female"), d => d.hospitalisations); // sums female hospitalisations for age group

      return { age, male, female }; // returns one object per age group
    });
  }

  function update() { // function runs when year or road user changes and when page first loads
    const data = getData(); // gets current data

    xScale.domain([0, d3.max(data, d => Math.max(d.male, d.female)) * 1.12]); // sets the x domain

    xAxisG.transition().duration(400) // transition length
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.format(",d"))); // redraws x axis ticks
    yAxisG.transition().duration(400) // transition length
      .call(d3.axisLeft(yScale)); // redraws y axis
    styleAxis(xAxisG); styleAxis(yAxisG); // applies tyling for both axes

    gridG.selectAll("line").data(xScale.ticks(6)).join("line") // vertical lines for chart
      .attr("x1", d => xScale(d)).attr("x2", d => xScale(d)) // positions grid lins
      .attr("y1", 0).attr("y2", H) // grid lines last full chart length
      .attr("stroke", "rgba(255,255,255,0.05)").attr("stroke-width", 1); // grid styling

    // ── connecting lines (GenAi was used for this - Prompt: How can i draw two connecting lines on a dummbell chart for two x positions - Used for lines 93-106) ──
    linesG.selectAll("line.db-line").data(data, d => d.age).join( // connects line by age group
      enter => enter.append("line").attr("class", "db-line") // creates lines
        .attr("y1", d => yScale(d.age) + yScale.bandwidth() / 2) // positions lines at center of dots
        .attr("y2", d => yScale(d.age) + yScale.bandwidth() / 2), // 
      update => update, // keeps existing lines
      exit => exit.remove() // removes line for exiting data
    )
    .transition().duration(400) // transtion length
      .attr("x1", d => xScale(Math.min(d.male, d.female))) // starts line at lower value
      .attr("x2", d => xScale(Math.max(d.male, d.female))) // ends line at higher value
      .attr("y1", d => yScale(d.age) + yScale.bandwidth() / 2) // centers line vertically
      .attr("y2", d => yScale(d.age) + yScale.bandwidth() / 2)
      .attr("stroke", "rgba(255,255,255,0.15)") // line colour
      .attr("stroke-width", 2); // line width

    // ── male dots (GenAI helped create this - Prompt: How do i draw circles for a dummbell chart with a mouseover tooltip - Used for lines 109-125) ──
    dotsG.selectAll("circle.db-male").data(data, d => d.age).join( // binds male dots by age group
      enter => enter.append("circle").attr("class", "db-male") // appends new dots
        .attr("r", 7).attr("cy", d => yScale(d.age) + yScale.bandwidth() / 2), // sets dot radius position and vertical position
      update => update, // keep existing dots
      exit => exit.remove() // removes dots for exiting data
    )
    .on("mouseover", (event, d) => { // when mouse hovers
      tooltip.style("display", "block") // show tooltip
        .style("left", (event.clientX + 14) + "px").style("top", (event.clientY - 30) + "px") // positions tooltip
        .html(`<strong style="color:${DUMBBELL_COLORS.male}">Male</strong> · ${d.age}<br>${d.male.toLocaleString()} hospitalisations`); // tooltip content
    })
    .on("mouseleave", () => tooltip.style("display", "none")) // when mouse leaves
    .transition().duration(400) // transition length
      .attr("cx", d => xScale(d.male)) // positions dot on x axis
      .attr("cy", d => yScale(d.age) + yScale.bandwidth() / 2) // positions dot on y axis
      .attr("fill", DUMBBELL_COLORS.male) // fills dot colour
      .attr("stroke", "#111").attr("stroke-width", 1.5); // dot outline

    // ── female dots (just the same code for the male dots slightly changed for female values now ) ──
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
  document.addEventListener("yearChange", e => { // listens for year change
    currentYear = e.detail.year; // sets new year value
    update(); // tells update to run
  });

  document.querySelectorAll(".db-filter-btn").forEach(btn => {
    btn.addEventListener("click", function() { // checks is a button is selected
      document.querySelectorAll(".db-filter-btn").forEach(b => b.classList.remove("active")); // unactivates button
      this.classList.add("active"); // activates button
      currentFilter = this.dataset.filter; // updates filter
      update(); // tells update to run
    });
  });

  update(); // runs initial update to draw chart when a user first loads page
};