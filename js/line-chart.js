// code of drawing the line chart
// this chart has an x-axis of year and y-axis of Hospitalisations
// will display the total number of motorcycle hospitalisation in a single year

const svgline = d3.select("#line-chart")
    .append("svg")
        .style("border", "1px solid black");

const drawLineChart = (main, registered) => {
    const margin = { top: 40, right: 170, bottom:25, left: 40 }; // just basic constants for the size of the chart, can be changed later
    const width = 1000;
    const height = 500;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // get total hospitalisations per year

    const motorcycleByYear = d3.rollups( // used getting the total number of motorcycle hospitalisations per year
        main.filter(d => d.user === "Motorcyclist"), // filter for only motorcyclist
        v => d3.sum(v, d => d.hospitalisations), // add up hospitalisations
        d => d.year
    ).map(([year, hosp]) => ({ year, hosp }))
        .sort((a, b) => a.year - b.year); // sort so years are lowest to highest

    const otherHospByYear = d3.rollups(
        main.filter(d => ["Car", "Heavy transport vehicle", "Other"].includes(d.user)),
        v => d3.sum(v, d => d.hospitalisations),
        d => d.year
    ).map(([year, hosp]) => ({ year, hosp }))
        .sort((a, b) => a.year - b.year);

    // get registered vehicles

    const regMotoByYear = new Map(
        registered
            .filter(d => d.type === "Motorcycles")
            .map(d => [d.rYear, d.aus])
    );

    const regTotalByYear = new Map(
        registered
            .filter(d => d.type === "Total")
            .map(d => [d.rYear, d.aus])
    );

    // calculate per 10,000

    const motoRate = motorcycleByYear
        .filter(d => regMotoByYear.has(d.year))
        .map(d => ({
            year: d.year,
            rate: (d.hosp / regMotoByYear.get(d.year)) * 10000
        }))
        .sort((a, b) => a.year - b.year);

    const otherRate = otherHospByYear
        .filter(d => regTotalByYear.has(d.year) && regMotoByYear.has(d.year))
        .map(d => ({
            year: d.year,
            rate: (d.hosp / (regTotalByYear.get(d.year) - regMotoByYear.get(d.year))) * 10000
        }))
        .sort((a, b) => a.year - b.year);

    const allYears = motoRate.map(d => d.year);

    const xScale = d3.scaleLinear() // scale for x axis
        .domain(d3.extent(motorcycleByYear, d => d.year))
        .range([0, innerWidth])

    const yScaleLeft = d3.scaleLinear()
        .domain([0, d3.max(motoRate, d => d.rate) * 1.1]) // motorcycle rate, higher
        .range([innerHeight, 0]);

    const yScaleRight = d3.scaleLinear()
        .domain([0, d3.max(otherRate, d => d.rate) * 1.1]) // non-motorcycle rate, lower
        .range([innerHeight, 0]);

    const bottomAxis = d3.axisBottom(xScale) // scale for bottom axis
        .tickFormat(d3.format("d"));

    const leftAxis = d3.axisLeft(yScaleLeft); // scale for left axis

    svgline.attr("viewBox", `0 0 ${width} ${height}`) // sets the coordinates and size
        .attr("width", width)
        .attr("height", height);

    const innerChart = svgline
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)

    innerChart // sets where the bottom axis will be 
        .append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(bottomAxis)

    innerChart // sets where the left axis will be
        .append("g")
        .call(leftAxis)

    const motoLine = d3.line() // assigns the points
        .x(d => xScale(d.year))
        .y(d => yScaleLeft(d.rate));

    const otherLine = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScaleLeft(d.rate));

    innerChart
        .append("path")
        .attr("d", motoLine(motoRate))
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2);

    innerChart
        .append("path")
        .attr("d", otherLine(otherRate))
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2);
}