const graphYearWidth = 1050;
const graphYearHeight = 200;

const svgGraphYear = d3.select("#graph_year")
    .attr("width", graphYearWidth)
    .attr("height", graphYearHeight)
    .append("g");

const monthsOrder = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

d3.csv("data.csv").then((data) => {

    function updateGraph() {
        const selectedType = document.querySelector("#filters input:checked")?.value;

        function getAttackData(year) {
            const filteredData = selectedType 
                ? data.filter(d => d.Type === selectedType && d.Year === year) 
                : data.filter(d => d.Year === year);

            let attackMonths = d3.rollup(
                filteredData,
                v => d3.sum(v, d => +d.Attacks),
                d => d.Month
            );

            return monthsOrder.map(month => ({
                Month: month,
                Attacks: attackMonths.get(month) || 0
            }));
        }

        const attackMonths2023 = getAttackData("2023");
        const attackMonths2024 = getAttackData("2024");

        const xScale = d3.scalePoint()
            .domain(monthsOrder)
            .range([50, graphYearWidth - 50]);

        const yMax = Math.max(
            d3.max(attackMonths2023, d => d.Attacks) || 1,
            d3.max(attackMonths2024, d => d.Attacks) || 1
        );

        const yScale = d3.scaleLinear()
            .domain([0, yMax])
            .nice()
            .range([graphYearHeight - 20, 20]);

        svgGraphYear.selectAll(".line, .dot-orange, .dot-blue").remove();

        function createLine(color, data) {
            const line = d3.line()
                .x(d => xScale(d.Month))
                .y(d => yScale(d.Attacks))
                .curve(d3.curveMonotoneX);

            svgGraphYear.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", 2)
                .attr("d", line);
        }

        createLine("#ff7500", attackMonths2023);
        createLine("#473a77", attackMonths2024);

        function createDots(color, data, className) {
            const dots = svgGraphYear.selectAll(`.${className}`)
                .data(data);

            dots.enter().append("circle")
                .attr("class", className)
                .merge(dots)
                .attr("cx", d => xScale(d.Month))
                .attr("cy", d => yScale(d.Attacks))
                .attr("r", 5)
                .attr("fill", color);

            dots.exit().remove();
        }

        createDots("#ff7500", attackMonths2023, "dot-orange");
        createDots("#473a77", attackMonths2024, "dot-blue");

        svgGraphYear.selectAll(".grid-line").remove();

        const yTicks = d3.range(0, yMax + 1, 5);

        svgGraphYear.selectAll(".grid-line")
            .data(yTicks)
            .join("line")
            .attr("class", "grid-line")
            .attr("x1", 50)
            .attr("x2", graphYearWidth - 50)
            .attr("y1", d => yScale(d))
            .attr("y2", d => yScale(d))
            .attr("stroke", "#ffffff95")
            .attr("stroke-width", 1)
            .attr("dasharray", "3,3")
            .attr("opacity", 0.5)
            .lower();

        svgGraphYear.selectAll(".x-axis").remove();
        svgGraphYear.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${graphYearHeight - 20})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-family", '"Fira Mono", monospace')
            .style("fill", "#ffffff95");

        svgGraphYear.select(".x-axis path, .x-axis line")
            .attr("stroke", "#ffffff95");

        svgGraphYear.selectAll(".x-axis .tick line")
            .attr("stroke", "#ffffff95");

        svgGraphYear.selectAll(".y-axis").remove();
        svgGraphYear.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(50, 0)")
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .style("font-family", '"Fira Mono", monospace')
            .style("fill", "#ffffff95");

        svgGraphYear.select(".y-axis path, .y-axis line")
            .attr("stroke", "#ffffff95");

        svgGraphYear.selectAll(".y-axis .tick line")
            .attr("stroke", "#ffffff95");
    }

    document.querySelectorAll("#filters input").forEach(input => {
        input.addEventListener("change", updateGraph);
    });

    updateGraph();
});