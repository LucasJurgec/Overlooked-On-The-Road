const drawDonutCharts = (stateData, vehicleData) => {

  // seperates the vehicle data into motorcycle only and total
  const motoVehicles  = vehicleData.filter(d => d.type === "Motorcycles");
  const totalVehicles = vehicleData.filter(d => d.type === "Total");

  let currentYear  = 2021; // tracks the selected year
  let currentState = null; // tracks the select state

  function getStateData(state, year) { // builds array for vehcile and hospitalisations for any year and state
    const col    = STATE_TO_COL[state]; // maps the dtate name to the cloumn key
    const mVeh   = motoVehicles.find(d => d.year === year)?.[col] || 0; // registered motorcycles for state and year
    const tVeh   = totalVehicles.find(d => d.year === year)?.[col] || 0; // registered vehicles for state and year
    const row    = stateData.find(d => d.state === state && d.year === year); // match state.csv row
    const mHosp  = row?.mhospitalisations || 0; // motorcycle hospitalisations for state and year
    const tHosp  = row?.thospitalisations || 0; // total hospitalisations for state and year

    return { // returns two arrays for two donuts
      vehicles: [ // vehicle donut
        { label: "Motorcycles",     value: mVeh,        color: PER10K_COLORS.motorcycle }, // sets motorcycle value and colour
        { label: "Other vehicles",  value: tVeh - mVeh, color: PER10K_COLORS.nonMotorcycle } // sets other vehicles value and colour
      ],
      hosps: [ // hospitalisations donut
        { label: "Motorcyclists",   value: mHosp,        color: PER10K_COLORS.motorcycle }, // sets motorcycle value and colour
        { label: "Other road users",value: tHosp - mHosp, color: PER10K_COLORS.nonMotorcycle } // sets other road users value and colour
      ]
    };
  }

  function drawDonut(containerId, data, title) { // creates the donut charts
    const el = document.getElementById(containerId); // gets container elementm- GenAI was used for this - Prompt: "best way to clear a container to redraw a chart into it" - Used for lines 31-33
    if (!el) return; // exits early if container doesn't exist - GenAI was used for this
    el.innerHTML = ""; // resets the draw donut container - GenAI was used for this

    // size of donut
    const size   = 150; // total size of SVG
    const radius = size / 2; // outer radius size
    const inner  = radius * 0.6; // size of the middle hole
    const total  = d3.sum(data, d => d.value); // calculates percentage in centre

    const svg = d3.select(`#${containerId}`).append("svg") // puts the svg into the container - GenAI was used for this - Prompt: "how to create a viewbox that includes extra height for a title" - Used for lines 41-44
        .attr("viewBox", `0 0 ${size} ${size + 32}`) // gives viewbox extra height - GenAI was used for this
        .attr("width", size) // sets svg width - GenAI was used for this
        .attr("height", size + 32); // sets svg height +32px for the title - GenAI was used for this

    const g = svg.append("g").attr("transform", `translate(${radius},${radius + 16})`); // shifts donut down to make room for title

    svg.append("text") // title
      .attr("x", radius).attr("y", 13) // centres title and positions near top of svg
      .attr("text-anchor", "middle") // anchors text at centre
      .attr("fill", "rgba(255,255,255,0.5)") // text colour
      .style("font-size", "12px") // text size
      .style("font-family", "var(--font-sans)") // text font
      .style("font-weight", "600") // semi-bold weight
      .style("letter-spacing", "0.04em") // letter spacing
      .text(title); // sets the title text

    const pie = d3.pie().value(d => d.value).sort(null); // converts values into arc angles
    const arc = d3.arc().innerRadius(inner).outerRadius(radius - 2); // inner and outer radius for arc

    g.selectAll("path").data(pie(data)).join("path") // makes the donut
      .attr("d", arc) // draws the donut arc
      .attr("fill", d => d.data.color) // fills the donut
      .attr("stroke", "#111") // outline colour
      .attr("stroke-width", 1.5); // outline width

    const moto = data[0]; // sets moto as the first in the array
    const pct  = total > 0 ? ((moto.value / total) * 100).toFixed(1) : "0"; // calculated motorcycle percentage

    g.append("text") // percentage text
      .attr("text-anchor", "middle").attr("dy", "-0.1em") // centres text and moves it slightly up
      .attr("fill", PER10K_COLORS.motorcycle) // percentage text colour 
      .style("font-size", "22px") // font size
      .style("font-weight", "700") // font weight
      .style("font-family", "var(--font-mono)") // font
      .text(`${pct}%`); // displays the calculated percentage text

    g.append("text") // text inside donut
      .attr("text-anchor", "middle").attr("dy", "1.2em") // centres text and moves it slightly down
      .attr("fill", "rgba(255,255,255,0.4)") // text colour
      .style("font-size", "10px") // font size
      .style("font-family", "var(--font-sans)") // font
      .text("motorcycle share"); // actual text displayed
  }

  function update() { // function that runs when state or year change
    if (!currentState) return; // if no state selected don't run
    const data = getStateData(currentState, currentYear); // retieves the data
    drawDonut("donut-vehicle", data.vehicles, "Registered Vehicles"); // draws the first donut
    drawDonut("donut-hosp",    data.hosps,    "Hospitalisations"); // draws the second donut
  }

  // ── event listeners ──
  document.addEventListener("yearChange", e => { // listens for year change
    currentYear = e.detail.year; // sets new year value
    update(); // tells update to run
  });

  document.addEventListener("stateClick", e => { // listens for state change
    currentState = e.detail.state; // sets new state value

    if (currentState) { // if a state is selected
      document.getElementById("choropleth-default").style.display      = "none"; // hide default text
      document.getElementById("choropleth-state-detail").style.display = "block"; // show donut
      document.getElementById("selected-state-name").textContent       = currentState; // update state name text
      update(); // tells update to run
    } else { // if no state is selected
      document.getElementById("choropleth-default").style.display      = "block"; // return default text
      document.getElementById("choropleth-state-detail").style.display = "none"; // hide donuts
    }
  });
};