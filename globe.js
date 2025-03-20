const width = 1000, height = 600;
const globeProjection = d3.geoOrthographic().scale(280).translate([width / 2, height / 2]);
const globePath = d3.geoPath().projection(globeProjection);
const svg = d3.select("#globe");

const graticule = d3.geoGraticule();
svg.append("path")
    .datum(graticule())
    .attr("fill", "none")
    .attr("stroke", "#414861")
    .attr("d", globePath);

d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(world => {
    const countries = svg.selectAll(".country")
        .data(world.features)
        .enter().append("path")
        .attr("class", "country")
        .attr("fill", "#242936")
        .attr("stroke", "#414861")
        .attr("d", globePath)
        .on("click", function(event, d) {
            isRotating = false; 
            d3.selectAll(".country").transition().duration(300).attr("fill", "#242936");
            d3.select(this).transition().duration(300).attr("fill", "#ff7700");

            const centroid = d3.geoCentroid(d);
            d3.transition().duration(1000)
                .tween("rotate", () => {
                    const r = d3.interpolate(globeProjection.rotate(), [-centroid[0], -centroid[1]]);
                    return t => {
                        globeProjection.rotate(r(t));
                        svg.selectAll("path").attr("d", globePath);
                    };
                })
                .on("end", () => {
                    d3.transition().duration(1000).tween("zoom", () => {
                        const s = d3.interpolate(globeProjection.scale(), 400);
                        return t => {
                            globeProjection.scale(s(t));
                            svg.selectAll("path").attr("d", globePath);
                        };
                    });

                    setTimeout(() => {
                        d3.transition().duration(1000).tween("zoomOut", () => {
                            const s = d3.interpolate(globeProjection.scale(), 280);
                            return t => {
                                globeProjection.scale(s(t));
                                svg.selectAll("path").attr("d", globePath);
                            };
                        });
                        isRotating = true;
                    }, 3000);
                });
        })
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible").text(d.properties.name);
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY - 10) + "px")
                   .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });
});

let isRotating = true;
function autoRotate() {
    if (isRotating) {
        const rotation = globeProjection.rotate();
        rotation[0] += 0.15;
        globeProjection.rotate(rotation);
        svg.selectAll("path").attr("d", globePath);
    }
    requestAnimationFrame(autoRotate);
}
autoRotate();

// Tooltip pour afficher le nom du pays
const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background", "#1a1d27")
    .style("color", "cyan")
    .style("padding", "5px 10px")
    .style("border-radius", "5px")
    .style("font-family", "'Fira Mono', monospace")
    .style("font-size", "0.9rem")
    .style("visibility", "hidden")
    .style("pointer-events", "none");
