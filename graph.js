// Variables pour la création du graphique
const graphWidth = 600;
const graphHeight = 200;
const graphMargin = { top: 50, right: 30, bottom: 50, left: 60 };

const svgGraph = d3.select("#graph")
    .attr("width", graphWidth)
    .attr("height", graphHeight)
    .append("g")
    .attr("transform", `translate(${graphMargin.left}, ${graphMargin.top})`);

// Chargement des données CSV
d3.csv("data.csv").then((data) => {
    console.log("Données chargées :", data);
});