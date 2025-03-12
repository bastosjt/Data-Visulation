const donutWidth = 180;
const donutHeight = 180;
const radius = Math.min(donutWidth, donutHeight) / 2;

const svgDonut = d3.select("#donut")
    .attr("width", donutWidth)
    .attr("height", donutHeight)
    .append("g")
    .attr("transform", `translate(${donutWidth / 2}, ${donutHeight / 2})`);

const arc = d3.arc()
    .innerRadius(65)  // Ajusté pour un petit donut
    .outerRadius(radius);

const pie = d3.pie()
    .value(d => d.value)
    .sort(null);

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

        const percent2023 = (totalAttacks2023 / totalCombined) * 100;
        const percent2024 = (totalAttacks2024 / totalCombined) * 100;

        const donutData = [
            { year: "2023", value: percent2023 },
            { year: "2024", value: percent2024 }
        ];

        // Mise à jour des arcs du donut
        const arcs = svgDonut.selectAll(".arc")
            .data(pie(donutData))
            .join(
                enter => {
                    const g = enter.append("g").attr("class", "arc");
                    g.append("path")
                        .attr("fill", (d, i) => i === 0 ? "rgb(0, 88, 221)" : "rgb(200, 0, 0)")
                        .attr("d", arc);
                    return g;
                },
                update => update.select("path").attr("d", arc),
                exit => exit.remove()
            );

        // Légende sous le donut
        const legend = svgDonut.selectAll(".legend")
            .data(donutData)
            .join("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(-60, ${radius + 20 + i * 20})`);

        legend.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", (d, i) => i === 0 ? "rgb(0, 88, 221)" : "rgb(200, 0, 0)");

        legend.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .attr("fill", "#fff")
            .style("font-family", '"Fira Mono", monospace')
            .style("font-size", "12px")
            .text(d => `${d.year} (${d.value.toFixed(2)}%)`);
    }

    document.querySelectorAll("#filters input").forEach(input => {
        input.addEventListener("change", updateDonut);
    });

    updateDonut();
});