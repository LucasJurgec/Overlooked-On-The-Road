// code of drawing the line chart
// this chart has an x-axis of year and y-axis of Hospitalisations
// will display the total number of motorcycle hospitalisation in a single year

const svgline = d3.select("#line-chart")
    .append("svg")
        .style("border", "1px solid black");

const drawLineChart = main => {
    const margin = { top: 40, right: 170, bottom:25, left: 40 }; // just basic constants for the size of the chart, can be changed later
    const width = 1000;
    const height = 500;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const motorcycleByYear = d3.rollups( // used getting the total number of motorcycle hospitalisations per year
        main.filter(d => d.user === "Motorcyclist"), // filter for only motorcyclist
        v => d3.sum(v, d => d.hospitalisations), // add up hospitalisations
        d => d.year
    ).map(([year, hospitalisations]) => ({ year, hospitalisations }))
     .sort((a, b) => a.year - b.year); // sort so years are lowest to highest

    const xScale = d3.scaleLinear() // scale for x axis
        .domain(d3.extent(motorcycleByYear, d => d.year))
        .range([0, innerWidth])

    const yScale = d3.scaleLinear() // scale for y axis
        .domain([0, d3.max(motorcycleByYear, d => d.hospitalisations)])
        .range([innerHeight, 0]);

    const bottomAxis = d3.axisBottom(xScale) // scale for bottom axis
        .tickFormat(d3.format("d"));

    const leftAxis = d3.axisLeft(yScale); // scale for left axis

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

    const lineGenerator = d3.line() // assigns the points
        .x(d => xScale(d.year))
        .y(d => yScale(d.hospitalisations));

    innerChart // draws the line for the chart
        .append("path")
        .attr("d", lineGenerator(motorcycleByYear))
        .attr("fill", "none")
        .attr("stroke", "green");
}