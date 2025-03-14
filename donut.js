const donutWidth = 180;
const donutHeight = 180;
const radius = Math.min(donutWidth, donutHeight) / 2;

const svgDonut = d3.select("#donut")
    .attr("width", donutWidth)
    .attr("height", donutHeight)
    .append("g")
    .attr("transform", `translate(${donutWidth / 2}, ${donutHeight / 2})`);

const arc = d3.arc()
    .innerRadius(65)
    .outerRadius(radius)
    .cornerRadius(25);

const pie = d3.pie()
    .value(d => d.value)
    .sort(null);

const color = {
    2023: "rgb(0, 88, 221)",
    2024: "rgb(200, 0, 0)"
};

d3.csv("data.csv").then((data) => {
    function updateDonut() {
        const selectedType = document.querySelector("#filters input:checked")?.value;

        const filteredData = selectedType 
            ? data.filter(d => d.Type === selectedType) 
            : data;

        const dataset_2023 = filteredData.filter(d => d.Year === "2023");
        const dataset_2024 = filteredData.filter(d => d.Year === "2024");

        const totalAttacks2023 = d3.sum(dataset_2023, d => +d.Attacks);
        const totalAttacks2024 = d3.sum(dataset_2024, d => +d.Attacks);

        const totalCombined = totalAttacks2023 + totalAttacks2024;

        const percent2023 = totalCombined > 0 ? (totalAttacks2023 / totalCombined) * 100 : 0;
        const percent2024 = totalCombined > 0 ? (totalAttacks2024 / totalCombined) * 100 : 0;

        const donutData = [];

        if (totalAttacks2023 > 0) donutData.push({ year: "2023", value: percent2023 });
        if (totalAttacks2024 > 0) donutData.push({ year: "2024", value: percent2024 });

        const arcs = svgDonut.selectAll(".arc")
            .data(pie(donutData), d => d.data.year)
            .join(
                enter => {
                    const g = enter.append("g").attr("class", "arc");
                    g.append("path")
                        .attr("fill", d => color[d.data.year])
                        .attr("stroke", "#1a1d27")
                        .attr("stroke-width", 10)
                        .attr("d", arc)
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicOut)
                        .attrTween("d", function(d) {
                            const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                            return function(t) { return arc(i(t)); };
                        });
                    return g;
                },
                update => {
                    update.select("path")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicOut)
                        .attrTween("d", function(d) {
                            const i = d3.interpolate(this._current, d);
                            this._current = i(1);
                            return function(t) { return arc(i(t)); };
                        });
                },
                exit => exit.remove()
            );

        svgDonut.selectAll(".legend").remove();

        const legend = svgDonut.selectAll(".legend")
            .data(donutData)
            .join("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(-60, ${radius + 20 + i * 20})`);

        legend.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", d => color[d.year])
            .attr("stroke", "rgb(67, 75, 101)")
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("opacity", 0)
            .transition()
            .duration(1000)
            .ease(d3.easeElasticOut)
            .attr("opacity", 1);

        legend.append("text")
            .attr("x", 20)
            .attr("y", 9)
            .attr("font-size", "12px")
            .attr("font-weight", "100")
            .style("font-family", '"Fira Mono", monospace')
            .style("fill", "#ffffff95")
            .attr("opacity", 0)
            .text(d => `${d.year} (${d.value.toFixed(2)}%)`)
            .transition()
            .duration(1000)
            .ease(d3.easeElasticOut)
            .attr("opacity", 1);
    }

    document.querySelectorAll("#filters input").forEach(input => {
        input.addEventListener("change", updateDonut);
    });

    updateDonut();
});