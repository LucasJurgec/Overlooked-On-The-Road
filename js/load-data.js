Promise.all([ // promise all allows us to load multiple csv files together 
    d3.csv("data/main.csv", d => ({ // loading the main.csv file
    year: +d["Calendar year"], // inside [] because of the space for Calandar year
    remoteness: d["ABS remoteness area"],
    age: d["Age group"],
    sex: d.Sex,
    user: d["Road user"],
    Hospitalisations: +d.Hospitalisations // the + represents the data being loaded as an integer rather than string
  })),

  d3.csv("data/state.csv", d => ({ // loading the state.csv file
    stateYear: +d.Year,
    state: d.State,
    stateHospitalisations: +d.Hospitalisations
  }))
]).then(([main, state]) => { // use either main or state depending on what data the visualisation will use
    console.log(main, state); 

    // add the data visualisations in here, such as drawHistogram(main)

}).catch(error => {
    console.error("Error loading CSV files:", error); // for error handling
});
