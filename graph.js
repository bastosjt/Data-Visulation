// Variables pour le graphique
const graphWidth = 600;
const graphHeight = 200;
const graphMargin = { top: 50, right: 30, bottom: 50, left: 60 };

const svgGraph = d3.select("#graph")
    .attr("width", graphWidth)
    .attr("height", graphHeight)
    .append("g")
    .attr("transform", `translate(${graphMargin.left}, ${graphMargin.top})`);

// Charger les données CSV
d3.csv("data.csv").then((data) => {

    const colorScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.Attacks) || 1])
        .range(["white", "red"]);

    // Fonction de mise à jour du graphique
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

        // Ajouter les lignes de référence tous les 5 unités
        const yTicks = d3.range(0, d3.max(attackCountries, d => d.Attacks) + 1, 5);
        svgGraph.selectAll(".grid-line")
            .data(yTicks)
            .join("line")
            .attr("class", "grid-line")
            .attr("x1", 0)
            .attr("x2", graphWidth - graphMargin.left - graphMargin.right)
            .attr("y1", d => yScale(d))
            .attr("y2", d => yScale(d))
            .attr("stroke", "gray")
            .attr("dasharray", "3,3") // Ligne pointillée
            .attr("opacity", 0.5)
            .lower();

        svgGraph.selectAll(".x-axis").remove();
        svgGraph.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${graphHeight - graphMargin.top - graphMargin.bottom})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-20)")
            .style("text-anchor", "end");

        svgGraph.selectAll(".y-axis").remove();
        svgGraph.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale));

        svgGraph.selectAll("rect")
            .data(attackCountries)
            .join(
                enter => enter.append("rect")
                    .attr("x", d => xScale(d.Country))
                    .attr("width", xScale.bandwidth())
                    .attr("y", graphHeight - graphMargin.top - graphMargin.bottom) // Démarre à partir de l'axe X
                    .attr("height", 0) // Hauteur initiale à 0
                    .attr("fill", d => colorScale(d.Attacks))
                    .transition()
                    .duration(800)
                    .ease(d3.easeCubicOut)
                    .attr("y", d => yScale(d.Attacks)) // La hauteur de la barre selon les attaques
                    .attr("height", d => graphHeight - graphMargin.top - graphMargin.bottom - yScale(d.Attacks)),

                update => update
                    .transition()
                    .duration(800)
                    .ease(d3.easeCubicOut)
                    .attr("x", d => xScale(d.Country))
                    .attr("width", xScale.bandwidth())
                    .attr("y", d => yScale(d.Attacks)) // Recalcule la position Y
                    .attr("height", d => graphHeight - graphMargin.top - graphMargin.bottom - yScale(d.Attacks)),

                exit => exit.remove()
            );

        // Ajouter les noms des pays sous les barres
        svgGraph.selectAll(".country-name")
            .data(attackCountries)
            .join("text")
            .attr("class", "country-name")
            .attr("x", d => xScale(d.Country) + xScale.bandwidth() / 2)
            .attr("y", graphHeight - graphMargin.bottom + 15) // Positionner sous l'axe X
            .attr("text-anchor", "middle")
            .text(d => d.Country);
    }

    // Mettre à jour le graphique au changement du radio button
    document.querySelectorAll("#filters input").forEach(input => {
        input.addEventListener("change", updateGraph);
    });

    // Initialiser le graphique
    updateGraph();
});