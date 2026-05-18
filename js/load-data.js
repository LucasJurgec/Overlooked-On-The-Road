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
    stateYear: +d.Year,
    state: d.State,
    stateHospitalisations: +d.Hospitalisations
  })),

  d3.csv("data/RegisteredVehicles.csv", d => ({ // loading the RegisteredVehicles.csv file
    Ryear: +d.Year,
    nsw: +d.NSW,
    vic: +d.VIC,
    qld: +d.QLD,
    sa: +d.SA,
    wa: +d.WA,
    tas: +d.TAS,
    nt: +d.NT,
    act: +d.ACT,
    aus: +d.AUS,
    type: d["Registered Vehicles"]
  }))
]).then(([main, state, registered]) => { // use either main, state or registered depending on what data the visualisation will use
    console.log(main, state, registered); 

    // add the data visualisations in here, such as drawHistogram(main)
    drawLineChart(main)

}).catch(error => {
    console.error("Error loading CSV files:", error); // for error handling
});
