Promise.all([
  d3.csv("data/main.csv", d => ({
    year:             +d["Calendar year"],
    remoteness:        d["ABS remoteness area"],
    age:               d["Age group"],
    sex:               d.Sex,
    user:              d["Road user"],
    hospitalisations: +d.Hospitalisations
  })),
  d3.csv("data/state.csv", d => ({
    year:             +d.Year,
    state:             d.State,
    mhospitalisations: +d.mHospitalisations,
    thospitalisations: +d.tHospitalisations
  })),
  d3.csv("data/RegisteredVehicles.csv", d => ({
    year: +d.Year,
    aus:  +d.AUS,
    nsw:   +d.NSW,
    vic:   +d.VIC,
    qld:   +d.QLD,
    sa:    +d.SA,
    wa:    +d.WA,
    tas:   +d.TAS,
    nt:    +d.NT,
    act:   +d.ACT,
    type:  d["Registered Vehicles"]
  })),
  d3.json("data/states.geojson")
]).then(([main, state, registered, geo]) => {
  drawLineChart(main, registered);
  drawChoropleth(state, geo);
  drawPer10kChart(state, registered);
  drawDonutCharts(state, registered);
  drawDumbbellChart(main);
}).catch(err => {
  console.error("Data load failed:", err);
  document.querySelectorAll(".chart-error").forEach(el => {
    el.textContent = "Failed to load data — open via a local server (not file://)";
    el.style.display = "block";
  });
});
