const graphWidth = 600;
const graphHeight = 200;
const graphMargin = { top: 50, right: 30, bottom: 50, left: 60 };

const svgGraph = d3.select("#graph")
    .attr("width", graphWidth)
    .attr("height", graphHeight)
    .append("g")
    .attr("transform", `translate(${graphMargin.left}, ${graphMargin.top})`);

d3.csv("data.csv").then((data) => {

    const colorScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.Attacks) || 1])
        .range(["rgba(255, 255, 255)", "rgba(216, 38, 0)"]);

    function updateGraph() {
        const selectedType = document.querySelector("#filters input:checked")?.value;

        const filteredData = selectedType 
            ? data.filter(d => d.Type === selectedType) 
            : data;

        const groupedData = d3.rollup(
            filteredData,
            v => d3.sum(v, d => +d.Attacks),
            d => d.Country
        );

        const attackCountries = Array.from(groupedData, ([Country, Attacks]) => ({ Country, Attacks }))
            .sort((a, b) => b.Attacks - a.Attacks);

        const xScale = d3.scaleBand()
            .domain(attackCountries.map(d => d.Country))
            .range([0, graphWidth - graphMargin.left - graphMargin.right])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(attackCountries, d => d.Attacks)])
            .nice()
            .range([graphHeight - graphMargin.top - graphMargin.bottom, 0]);

        svgGraph.selectAll(".grid-line").remove();

        const yTicks = d3.range(0, d3.max(attackCountries, d => d.Attacks) + 1, 5);
        svgGraph.selectAll(".grid-line")
            .data(yTicks)
            .join("line")
            .attr("class", "grid-line")
            .attr("x1", 0)
            .attr("x2", graphWidth - graphMargin.left - graphMargin.right)
            .attr("y1", d => yScale(d))
            .attr("y2", d => yScale(d))
            .attr("stroke", "#ffffff95")
            .attr("dasharray", "3,3")
            .attr("opacity", 0.5)
            .lower();

        svgGraph.selectAll(".x-axis").remove();
        svgGraph.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${graphHeight - graphMargin.top - graphMargin.bottom})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-20)")
            .style("text-anchor", "end")
            .style("font-family", '"Fira Mono", monospace')
            .style("fill", "#ffffff95");
        
        svgGraph.select(".x-axis path, .x-axis line")
            .attr("stroke", "#ffffff95");
        
        svgGraph.selectAll(".x-axis .tick line")
            .attr("stroke", "#ffffff95");

        svgGraph.selectAll(".y-axis").remove();
        svgGraph.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale))
            .style("font-family", '"Fira Mono", monospace')
            .style("color", "#ffffff95")

        svgGraph.selectAll("rect")
            .data(attackCountries)
            .join(
                enter => enter.append("rect")
                    .attr("x", d => xScale(d.Country))
                    .attr("width", xScale.bandwidth())
                    .attr("y", graphHeight - graphMargin.top - graphMargin.bottom)
                    .attr("height", 0)
                    .attr("fill", d => colorScale(d.Attacks))
                    .transition()
                    .duration(800)
                    .ease(d3.easeCubicOut)
                    .attr("y", d => yScale(d.Attacks))
                    .attr("height", d => graphHeight - graphMargin.top - graphMargin.bottom - yScale(d.Attacks)),

                update => update
                    .transition()
                    .duration(800)
                    .ease(d3.easeCubicOut)
                    .attr("x", d => xScale(d.Country))
                    .attr("width", xScale.bandwidth())
                    .attr("y", d => yScale(d.Attacks))
                    .attr("height", d => graphHeight - graphMargin.top - graphMargin.bottom - yScale(d.Attacks)),

                exit => exit.remove()
            );
    }

    document.querySelectorAll("#filters input").forEach(input => {
        input.addEventListener("change", updateGraph);
    });

    updateGraph();
});