d3.csv("data.csv").then((data) => {
    
    function updateChartPie() {
        const selectedType = document.querySelector("#filters input:checked")?.value;

        const filteredData = selectedType 
            ? data.filter(d => d.Type === selectedType) 
            : data;

        // Calculer les attaques par APT Group et trier en ordre décroissant
        const aptGroupData = d3.rollup(
            filteredData,
            v => d3.sum(v, d => +d.Attacks),
            d => d["APT Group"]
        );

        let attackList = Array.from(aptGroupData, ([APTGroup, Attacks]) => ({ APTGroup, Attacks }));

        // Trier par nombre d'attaques décroissant
        attackList.sort((a, b) => b.Attacks - a.Attacks);

        // Sélectionner et vider les éléments
        document.querySelector("#chartpie_text").innerHTML = '';

        if (attackList.length === 0) {
            d3.select("#chartpie").html("Aucune attaque pour ce type.");
            return;
        }

        // Définition des dimensions du camembert
        const width = 200;
        const height = 200;
        const radius = Math.min(width, height) / 2;

        // Sélection ou création du SVG
        let svg = d3.select("#chartpie svg");
        if (svg.empty()) {
            svg = d3.select("#chartpie")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", `translate(${width / 2}, ${height / 2})`);
        } else {
            svg = svg.select("g");
        }

        // Liste des couleurs fixes
        const colorList = [
            "#ff7500", "#db683c", "#cd643d", "#ba5c40", "#a75642",
            "#914f43", "#7b4845", "#6a4147", "#593c49", "#48364a", "#392e60"
        ];        

        // Création du camembert
        const pie = d3.pie().value(d => d.Attacks);
        const arcs = pie(attackList);

        const arc = d3.arc().innerRadius(0).outerRadius(radius);

        // Liaison des données
        const paths = svg.selectAll("path")
            .data(arcs);

        // Animation des arcs existants
        paths.transition()
            .duration(1000)
            .attrTween("d", function(d) {
                const interpolate = d3.interpolate(this._current || d, d);
                this._current = interpolate(1);
                return function(t) { return arc(interpolate(t)); };
            });

        // Ajout des nouvelles parts du camembert
        paths.enter()
            .append("path")
            .attr("fill", (d, i) => colorList[i] || "#ff7500")
            .attr("stroke", "rgb(67, 75, 101)")
            .style("stroke-width", "2px")
            .each(function(d) { this._current = d; }) // Sauvegarde de l'état initial
            .transition().duration(1000)
            .attrTween("d", function(d) {
                const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return function(t) { return arc(interpolate(t)); };
            });

        // Suppression des anciennes parts si besoin
        paths.exit().remove();

        // Ajouter les labels avec animation
        const labels = svg.selectAll("text")
            .data(arcs);

        // Animation des labels existants
        labels.transition()
            .duration(1000)
            .attr("transform", d => `translate(${arc.centroid(d)[0] * 1.4}, ${arc.centroid(d)[1] * 1.5})`)
            .style("opacity", 1)
            .text(d => d.data.Attacks);

        // Ajouter de nouveaux labels avec animation
        labels.enter()
            .append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .style("font-family", '"Fira Mono", monospace')
            .style("fill", "#ffffff95")
            .style("opacity", 0)
            .attr("transform", d => `translate(${arc.centroid(d)[0] * 1.4}, ${arc.centroid(d)[1] * 1.5})`)
            .text(d => d.data.Attacks)
            .transition()
            .duration(1000)
            .style("opacity", 1);

        labels.exit().remove();

        // Mise à jour de la légende : 
        const svgText = d3.select("#chartpie_text")
            .attr("width", 300)
            .attr("height", attackList.length * 20 + 30);

        const legend = svgText.selectAll("g")
            .data(arcs);

        // Ajout de la légende sans animation
        const legendEnter = legend.enter()
            .append("g")
            .attr("transform", (d, i) => `translate(10, ${i * 20 + 10})`);

        // Ajout des carrés de couleur sans animation
        legendEnter.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", (d, i) => colorList[i] || "#ff7500")
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("stroke", "rgb(67, 75, 101)");

        // Ajout du texte sans animation
        legendEnter.append("text")
            .attr("x", 15)
            .attr("y", 7)
            .text(d => `${d.data.APTGroup}: ${d.data.Attacks} attaques`)
            .style("font-size", "12px")
            .style("font-family", '"Fira Mono", monospace')
            .style("fill", "#ffffff95")
            .attr("alignment-baseline", "middle");

        // Suppression des anciennes entrées
        legend.exit().remove();
    }

    // Écoute des filtres pour mettre à jour le camembert
    document.querySelectorAll("#filters input").forEach(input => {
        input.addEventListener("change", updateChartPie);
    });

    updateChartPie();
});