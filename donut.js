d3.csv("data.csv").then((data) => {
    function updateText() {
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

        const textContainer = d3.select("#donut");

        textContainer.selectAll("*").remove();

        textContainer.append("text")
            .attr("x", 10)
            .attr("y", 20)
            .attr("fill", "#fff")
            .style("font-size", "16px")
            .style("font-family", '"Fira Mono", monospace')
            .text(`2023: ${percent2023.toFixed(2)}%`);

        textContainer.append("text")
            .attr("x", 10)
            .attr("y", 40)
            .attr("fill", "#fff")
            .style("font-size", "16px")
            .style("font-family", '"Fira Mono", monospace')
            .text(`2024: ${percent2024.toFixed(2)}%`);
    }

    document.querySelectorAll("#filters input").forEach(input => {
        input.addEventListener("change", updateText);
    });

    updateText();
});