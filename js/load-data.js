Promise.all([ // promise all allows us to load multiple csv files together 
    d3.csv("data/main.csv", d => ({ // loading the main.csv file
    year: +d["Calendar year"], // inside [] because of the space for Calandar year
    remoteness: d["ABS remoteness area"],
    age: d["Age group"],
    sex: d.Sex,
    user: d["Road user"],
    hospitalisations: +d.Hospitalisations // the + represents the data being loaded as an integer rather than string
  })),

  d3.csv("data/state.csv", d => ({ // loading the state.csv file
    sYear: +d.Year,
    state: d.State,
    stateHospitalisations: +d.Hospitalisations
  })),

  d3.csv("data/RegisteredVehicles.csv", d => ({ // loading the RegisteredVehicles.csv file
    rYear: +d.Year,
    nsw: +d.NSW,
    vic: +d.VIC,
    qld: +d.QLD,
    sa: +d.SA,
    wa: +d.WA,
    tas: +d.TAS,
    nt: +d.NT,
    act: +d.ACT,
    aus: +d.AUS,
    type: d["Registered Vehicles"] // either Total or Motorcycles
  })),

  d3.json("data/states.geojson") // used to get the map of Australia with the states, used for the choropleth

]).then(([main, state, registered, geo]) => { // use either main, state, registered or geo depending on what data the visualisation will use
    console.log(main, state, registered, geo); // for checking the data is loading correctly

    // add the data visualisations in here, such as drawHistogram(main)
    drawLineChart(main, registered)

}).catch(error => {
    console.error("Error loading CSV files:", error); // for error handling
});
