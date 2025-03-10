d3.csv("data.csv").then((data) => {
    
    function updateChartPie() {
        const selectedType = document.querySelector("#filters input:checked")?.value;

        const filteredData = selectedType 
            ? data.filter(d => d.Type === selectedType) 
            : data;

        const aptGroupData = d3.rollup(
            filteredData,
            v => d3.sum(v, d => +d.Attacks),
            d => d["APT Group"]
        );

        let attackList = Array.from(aptGroupData, ([APTGroup, Attacks]) => ({ APTGroup, Attacks }));

        attackList.sort((a, b) => b.Attacks - a.Attacks);

        document.querySelector("#chartpie_text").innerHTML = '';

        if (attackList.length === 0) {
            d3.select("#chartpie").html("Aucune attaque pour ce type.");
            return;
        }

        const width = 200;
        const height = 200;
        const radius = Math.min(width, height) / 2;

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

        const colorList = [
            "#ff7500", "#db683c", "#cd643d", "#ba5c40", "#a75642",
            "#914f43", "#7b4845", "#6a4147", "#593c49", "#48364a", "#392e60"
        ];        

        const pie = d3.pie().value(d => d.Attacks);
        const arcs = pie(attackList);

        const arc = d3.arc().innerRadius(0).outerRadius(radius);

        const paths = svg.selectAll("path")
            .data(arcs);

        paths.transition()
            .duration(1000)
            .attrTween("d", function(d) {
                const interpolate = d3.interpolate(this._current || d, d);
                this._current = interpolate(1);
                return function(t) { return arc(interpolate(t)); };
            });

        paths.enter()
            .append("path")
            .attr("fill", (d, i) => colorList[i] || "#ff7500")
            .attr("stroke", "rgb(67, 75, 101)")
            .style("stroke-width", "2px")
            .each(function(d) { this._current = d; })
            .transition().duration(1000)
            .attrTween("d", function(d) {
                const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return function(t) { return arc(interpolate(t)); };
            });

        paths.exit().remove();

        const labels = svg.selectAll("text")
            .data(arcs);

        labels.transition()
            .duration(1000)
            .attr("transform", d => `translate(${arc.centroid(d)[0] * 1.4}, ${arc.centroid(d)[1] * 1.5})`)
            .style("opacity", 1)
            .text(d => d.data.Attacks);

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
 
        const svgText = d3.select("#chartpie_text")
            .attr("width", 300)
            .attr("height", attackList.length * 20 + 30);

        const legend = svgText.selectAll("g")
            .data(arcs);

        const legendEnter = legend.enter()
            .append("g")
            .attr("transform", (d, i) => `translate(10, ${i * 20 + 10})`);

        legendEnter.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", (d, i) => colorList[i] || "#ff7500")
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("stroke", "rgb(67, 75, 101)");

        legendEnter.append("text")
            .attr("x", 15)
            .attr("y", 7)
            .text(d => `${d.data.APTGroup}: ${d.data.Attacks} attaques`)
            .style("font-size", "12px")
            .style("font-family", '"Fira Mono", monospace')
            .style("fill", "#ffffff95")
            .attr("alignment-baseline", "middle");

        legend.exit().remove();
    }

    document.querySelectorAll("#filters input").forEach(input => {
        input.addEventListener("change", updateChartPie);
    });

    updateChartPie();
});