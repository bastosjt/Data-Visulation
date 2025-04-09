const svgWidth = 180;
const svgHeight = 220;
const paddingTop = 20;

const chartHeight = 180;
const barWidth = 30;
const barSpacing = 50;

const svgBar = d3.select("#donut")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", `translate(30, ${paddingTop})`);

const color = {
    2023: "#ff7500",
    2024: "#473a77"
};

d3.csv("data.csv").then((data) => {
    function updateBarChart(selectedType = null) {
        const filteredData = selectedType 
            ? data.filter(d => d.Type === selectedType) 
            : data;

        const totalAttacks2023 = d3.sum(filteredData.filter(d => d.Year === "2023"), d => +d.Attacks);
        const totalAttacks2024 = d3.sum(filteredData.filter(d => d.Year === "2024"), d => +d.Attacks);

        const maxValue = Math.max(totalAttacks2023, totalAttacks2024) || 1;

        const yScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([chartHeight, 0]);

        const bars = svgBar.selectAll(".bar")
            .data([
                { year: "2023", value: totalAttacks2023 },
                { year: "2024", value: totalAttacks2024 }
            ]);

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => i * barSpacing + 20)
            .attr("y", chartHeight)
            .attr("width", barWidth)
            .attr("height", 0)
            .attr("fill", d => color[d.year])
            .attr("rx", 4)
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("y", d => yScale(d.value))
            .attr("height", d => chartHeight - yScale(d.value));

        bars.exit().remove();

        const labels = svgBar.selectAll(".text-label")
            .data([
                { year: "2023", value: totalAttacks2023 },
                { year: "2024", value: totalAttacks2024 }
            ]);

        labels.enter()
            .append("text")
            .attr("class", "text-label")
            .attr("x", (d, i) => i * barSpacing + barWidth / 2 + 20)
            .attr("y", d => yScale(d.value) - 5)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .style("font-family", '"Fira Mono", monospace')
            .style("fill", "#ffffff95")
            .text(d => d.value)
            .merge(labels)
            .transition()
            .duration(1000)
            .attr("y", d => yScale(d.value) - 5)
            .text(d => d.value);

        labels.exit().remove();
    }

    const legendData = [
        { year: "2023", color: color["2023"] },
        { year: "2024", color: color["2024"] }
    ];

    const legend = svgBar.selectAll(".legend")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${i * 70}, ${chartHeight + 20})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 12)
        .attr("height", 12)
        .attr("rx", 2)
        .style("fill", d => d.color);

    legend.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .attr("font-size", "12px")
        .style("font-family", '"Fira Mono", monospace')
        .style("fill", "#ffffff95")
        .text(d => d.year);

    document.querySelectorAll("#filters input").forEach(input => {
        input.addEventListener("change", () => {
            const selectedType = document.querySelector("#filters input:checked")?.value;
            updateBarChart(selectedType);
        });
    });

    document.addEventListener("attackTypeChanged", (event) => {
        const selectedType = event.detail.selectedType;
        updateBarChart(selectedType);
    });

    updateBarChart();
});