// Variables pour la carte
const mapWidth = 700, mapHeight = 500;
const svgMap = d3.select("#map")
    .attr("width", mapWidth)
    .attr("height", mapHeight);

const projection = d3.geoNaturalEarth1()
    .scale(125)
    .translate([mapWidth / 2, mapHeight / 2]);

const path = d3.geoPath().projection(projection);

// Charger les données GeoJSON et CSV
Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("data.csv")
]).then(([world, data]) => {

    // Générer dynamiquement les filtres radio
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

    // Fonction pour appliquer les styles au radio bouton sélectionné
    function applyCheckedStyle() {
        const checkedLabel = document.querySelector("#filters input:checked");
        if (checkedLabel) {
            const label = checkedLabel.parentElement;
            label.style.backgroundColor = "#007BFF";
            label.style.color = "#FFFFFF";
            label.style.border = "2px solid #FFFFFF";
        }
    }

    // Fonction de mise à jour de la carte
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

        const maxAttacks = d3.max(Array.from(attackData.values()));
        const colorScale = d3.scaleLinear()
            .domain([0, maxAttacks || 1])
            .range(["white", "red"]);

        svgMap.selectAll("path")
            .data(world.features)
            .join("path")
            .attr("d", path)
            .attr("stroke", "black")
            .transition()
            .attrTween("fill", function(d) {
                const currentColor = d3.select(this).attr("fill") || "white";
                const targetColor = attackData.has(d.properties.name) ? colorScale(attackData.get(d.properties.name)) : "white";
                return d3.interpolate(currentColor, targetColor);
        });
    }

    // Mettre à jour la carte au changement du radio button
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

    // Appliquer le style au premier radio bouton coché (si existe)
    applyCheckedStyle();

    // Initialiser la carte
    updateMap();
});