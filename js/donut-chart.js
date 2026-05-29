const drawDonutCharts = (stateData, vehicleData) => {

  const motoVehicles  = vehicleData.filter(d => d.type === "Motorcycles");
  const totalVehicles = vehicleData.filter(d => d.type === "Total");

  let currentYear  = 2021;
  let currentState = null;

  function getStateData(state, year) {
    const col    = STATE_TO_COL[state];
    const mVeh   = motoVehicles.find(d => d.year === year)?.[col] || 0;
    const tVeh   = totalVehicles.find(d => d.year === year)?.[col] || 0;
    const row    = stateData.find(d => d.state === state && d.year === year);
    const mHosp  = row?.mhospitalisations || 0;
    const tHosp  = row?.thospitalisations || 0;

    return {
      vehicles: [
        { label: "Motorcycles",     value: mVeh,        color: PER10K_COLORS.motorcycle },
        { label: "Other vehicles",  value: tVeh - mVeh, color: PER10K_COLORS.nonMotorcycle }
      ],
      hosps: [
        { label: "Motorcyclists",   value: mHosp,        color: PER10K_COLORS.motorcycle },
        { label: "Other road users",value: tHosp - mHosp, color: PER10K_COLORS.nonMotorcycle }
      ]
    };
  }

  function drawDonut(containerId, data, title) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = "";

    const size   = 150;
    const radius = size / 2;
    const inner  = radius * 0.6;
    const total  = d3.sum(data, d => d.value);

    const svg = d3.select(`#${containerId}`).append("svg")
        .attr("viewBox", `0 0 ${size} ${size + 32}`)
        .attr("width", size)
        .attr("height", size + 32);

    const g = svg.append("g").attr("transform", `translate(${radius},${radius + 16})`);

    // title
    svg.append("text")
      .attr("x", radius).attr("y", 11)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.45)")
      .style("font-size", "9px")
      .style("font-family", "'JetBrains Mono', monospace")
      .style("text-transform", "uppercase")
      .style("letter-spacing", "0.08em")
      .text(title);

    const pie   = d3.pie().value(d => d.value).sort(null);
    const arc   = d3.arc().innerRadius(inner).outerRadius(radius - 2);

    g.selectAll("path").data(pie(data)).join("path")
      .attr("d", arc)
      .attr("fill", d => d.data.color)
      .attr("stroke", "#111")
      .attr("stroke-width", 1.5);

    // centre percentage
    const moto = data[0];
    const pct  = total > 0 ? ((moto.value / total) * 100).toFixed(1) : "0";

    g.append("text")
      .attr("text-anchor", "middle").attr("dy", "-0.1em")
      .attr("fill", PER10K_COLORS.motorcycle)
      .style("font-size", "16px")
      .style("font-weight", "700")
      .style("font-family", "'JetBrains Mono', monospace")
      .text(`${pct}%`);

    g.append("text")
      .attr("text-anchor", "middle").attr("dy", "1.1em")
      .attr("fill", "rgba(255,255,255,0.3)")
      .style("font-size", "7.5px")
      .style("font-family", "'JetBrains Mono', monospace")
      .text("motorcycle share");
  }

  function update() {
    if (!currentState) return;
    const data = getStateData(currentState, currentYear);
    drawDonut("donut-vehicle", data.vehicles, "Registered Vehicles");
    drawDonut("donut-hosp",    data.hosps,    "Hospitalisations");
  }

  // ── event listeners ──
  document.addEventListener("yearChange", e => {
    currentYear = e.detail.year;
    update();
  });

  document.addEventListener("stateClick", e => {
    currentState = e.detail.state;

    if (currentState) {
      document.getElementById("choropleth-default").style.display      = "none";
      document.getElementById("choropleth-state-detail").style.display = "block";
      document.getElementById("selected-state-name").textContent       = currentState;
      update();
    } else {
      document.getElementById("choropleth-default").style.display      = "block";
      document.getElementById("choropleth-state-detail").style.display = "none";
    }
  });

  // ── clear button ──
  document.getElementById("choropleth-reset-btn").addEventListener("click", () => {
    currentState = null;
    document.dispatchEvent(new CustomEvent("stateClick", { detail: { state: null } }));
  });

};