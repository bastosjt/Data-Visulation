const width = 600, height = 600;
const globeProjection = d3.geoOrthographic().scale(280).translate([width / 2, height / 2]);
const globePath = d3.geoPath().projection(globeProjection);
const svg = d3.select("#globe");
const graticule = d3.geoGraticule();
const label = document.getElementById("country-label");

svg.append("path")
    .datum(graticule())
    .attr("fill", "none")
    .attr("stroke", "#414861")
    .attr("d", globePath);

d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(world => {
    svg.selectAll(".country")
        .data(world.features)
        .enter().append("path")
        .attr("class", "country")
        .attr("fill", "#242936")
        .attr("stroke", "#414861")
        .attr("d", globePath)
        .on("click", function(event, d) {
            d3.selectAll(".country").transition().duration(300).attr("fill", "#242936");
            d3.select(this).transition().duration(300).attr("fill", "#ff7700");
            showLabel(d.properties.name, event.pageX, event.pageY);
        });
});

let lastX, lastY;
let rotation = [0, 0];

svg.call(d3.drag()
    .on("start", (event) => {
        lastX = event.x;
        lastY = event.y;
    })
    .on("drag", (event) => {
        const dx = event.x - lastX;
        const dy = event.y - lastY;
        rotation[0] += dx * 0.5;
        rotation[1] -= dy * 0.5;
        globeProjection.rotate(rotation);
        svg.selectAll("path").attr("d", globePath);
        lastX = event.x;
        lastY = event.y;
    })
);

function showLabel(countryName, x, y) {
    label.style.left = `${x + 10}px`;
    label.style.top = `${y}px`;
    label.style.opacity = 1;
    label.innerHTML = "";
    let i = 0;
    function typeWriter() {
        if (i < countryName.length) {
            label.innerHTML += countryName.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }
    typeWriter();
}