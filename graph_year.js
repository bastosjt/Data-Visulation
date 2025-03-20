const graphYearWidth = 1000;
const graphYearHeight = 200;

const svgGraphYear = d3.select("#graph_year")
    .attr("width", graphYearWidth)
    .attr("height", graphYearHeight);

// Charger le fichier CSV
d3.csv("data.csv").then((data) => {

    // Initialiser le graphique
    function updateGraph() {
        const selectedType = document.querySelector("#filters input:checked")?.value;

        // Filtrer les données en fonction du type sélectionné
        const filteredData = selectedType 
            ? data.filter(d => d.Type === selectedType && d.Year === "2023") 
            : data.filter(d => d.Year === "2023");

        // Regrouper les données par mois
        const attackMonths = d3.rollup(
            filteredData,
            v => d3.sum(v, d => +d.Attacks),
            d => d.Month
        );

        const attackMonthsArray = Array.from(attackMonths, ([Month, Attacks]) => ({ Month, Attacks }))
            .sort((a, b) => d3.ascending(a.Month, b.Month)); // Trier les mois de Janvier à Décembre

        // Échelles
        const xScale = d3.scaleBand()
            .domain(attackMonthsArray.map(d => d.Month))
            .range([0, graphYearWidth])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(attackMonthsArray, d => d.Attacks)])
            .nice()
            .range([graphYearHeight, 0]);

        // Créer une ligne pour relier les points
        const line = d3.line()
            .x(d => xScale(d.Month) + xScale.bandwidth() / 2) // Placer les points au centre des bandes
            .y(d => yScale(d.Attacks));

        // Mettre à jour la ligne du graphique
        svgGraphYear.selectAll(".line")
            .data([attackMonthsArray])
            .join(
                enter => enter.append("path")
                    .attr("class", "line")
                    .attr("d", line)
                    .attr("fill", "none")
                    .attr("stroke", "orange")
                    .attr("stroke-width", 2),
        
                update => update
                    .transition()
                    .duration(800)
                    .ease(d3.easeCubicOut)
                    .attr("d", line),
        
                exit => exit.remove()
            );

        // Mettre à jour les points
        svgGraphYear.selectAll(".dot")
            .data(attackMonthsArray)
            .join(
                enter => enter.append("circle")
                    .attr("class", "dot")
                    .attr("cx", d => xScale(d.Month) + xScale.bandwidth() / 2)
                    .attr("cy", d => yScale(d.Attacks))
                    .attr("r", 5)
                    .attr("fill", "orange"),
        
                update => update
                    .transition()
                    .duration(800)
                    .ease(d3.easeCubicOut)
                    .attr("cx", d => xScale(d.Month) + xScale.bandwidth() / 2)
                    .attr("cy", d => yScale(d.Attacks)),
        
                exit => exit.remove()
            );

        // Ajouter les axes
        svgGraphYear.selectAll(".x-axis").remove();
        svgGraphYear.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${graphYearHeight})`)
            .call(d3.axisBottom(xScale));

        svgGraphYear.selectAll(".y-axis").remove();
        svgGraphYear.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale));
    }

    // Ajouter un événement de changement pour mettre à jour le graphique lorsque l'utilisateur change le type d'attaque
    document.querySelectorAll("#filters input").forEach(input => {
        input.addEventListener("change", updateGraph);
    });

    // Initialiser le graphique avec les données par défaut
    updateGraph();
});
