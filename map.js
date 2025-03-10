const mapWidth = 700, mapHeight = 475;
const legendWidth = 250, legendHeight = 10;

const svgMap = d3.select("#map")
    .attr("width", mapWidth)
    .attr("height", mapHeight);

const svgLegend = d3.select("#legend")
    .attr("width", legendWidth)
    .attr("height", legendHeight + 30);

const projection = d3.geoNaturalEarth1()
    .scale(125)
    .translate([mapWidth / 2, mapHeight / 2]);

const path = d3.geoPath().projection(projection);

Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("data.csv")
]).then(([world, data]) => {

    const attackTypes = Array.from(new Set(data.map(d => d.Type)));
    const filtersDiv = document.getElementById("filters");

    attackTypes.forEach((type, index) => {
        const label = document.createElement("label");
        label.innerHTML = `
            <input type="radio" name="attackType" value="${type}" ${index === 0 ? 'checked' : ''}> 
            ${type}
        `;
        label.classList.add("radio-label");
        filtersDiv.appendChild(label);
    });

    function applyCheckedStyle() {
        const checkedLabel = document.querySelector("#filters input:checked");
        if (checkedLabel) {
            const label = checkedLabel.parentElement;
            label.style.backgroundColor = "#007BFF";
            label.style.color = "#FFFFFF";
            label.style.border = "2px solid #007BFF";
        }
    }

    function updateMap() {
        const selectedType = document.querySelector("#filters input:checked")?.value;

        if (!selectedType) {
            svgMap.selectAll("*").remove();
            return;
        }

        const filteredData = data.filter(d => d.Type === selectedType);

        const attackData = d3.rollup(
            filteredData,
            v => d3.sum(v, d => +d.Attacks),
            d => d.Country
        );

        const maxAttacks = d3.max(Array.from(attackData.values())) || 1;
        const colorScale = d3.scaleLinear()
            .domain([0, maxAttacks])
            .range(["rgba(255, 255, 255)", "rgba(216, 38, 0)"]);

        svgMap.selectAll("path")
            .data(world.features)
            .join("path")
            .attr("d", path)
            .attr("stroke", "rgb(67, 75, 101)")
            .transition()
            .duration(250)
            .ease(d3.easeCubicInOut)
            .attrTween("fill", function(d) {
                const currentColor = d3.select(this).attr("fill") || "white";
                const targetColor = attackData.has(d.properties.name) ? colorScale(attackData.get(d.properties.name)) : "rgba(67, 75, 101, 0.25)";
                return d3.interpolate(currentColor, targetColor);
            });

        updateLegend(maxAttacks);
    }

    function updateLegend(maxAttacks) {
        svgLegend.selectAll("*").remove();
    
        const reducedLegendWidth = legendWidth - 50;
    
        const defs = svgLegend.append("defs");
        const linearGradient = defs.append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");
    
        linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "rgba(255, 255, 255)");
    
        linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "rgba(216, 38, 0)");
    
            svgLegend.append("rect")
            .attr("x", 15)
            .attr("y", 0)
            .attr("width", reducedLegendWidth - 35)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient)")
            .style("rx", 5)
            .style("ry", 5);
        
        svgLegend.append("text")
            .attr("x", 0)
            .attr("y", legendHeight)
            .attr("fill", "#fff")
            .style("font-size", "12px")
            .style("text-anchor", "start")
            .style("font-family", '"Fira Mono", monospace')
            .style("fill", "#ffffff95")
            .text("0");
    
        svgLegend.append("text")
            .attr("x", reducedLegendWidth)
            .attr("y", legendHeight)
            .attr("fill", "#fff")
            .style("font-size", "12px")
            .style("text-anchor", "end")
            .style("font-family", '"Fira Mono", monospace')
            .style("fill", "#ffffff95")
            .text(maxAttacks);
    }    

    document.querySelectorAll("#filters input").forEach(input => {
        input.addEventListener("change", function() {
            document.querySelectorAll("#filters label").forEach(label => {
                label.style.backgroundColor = "";
                label.style.color = "#007BFF";
                label.style.border = "2px solid #007BFF";
            });

            const label = this.parentElement;
            label.style.backgroundColor = "#007BFF";
            label.style.color = "#FFFFFF";

            updateMap();
        });
    });

    applyCheckedStyle();
    updateMap();
});