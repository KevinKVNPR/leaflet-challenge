const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
d3.json(queryUrl).then(function (data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  function getRadius(mag){
    return mag * 1.5
  }
  function getColor(feature){
    let depth = feature.geometry.coordinates[2];
    let color = "#ed4928";
    if      ( depth > 90) { color = "#def03a" }
    else if ( depth > 70) { color = "#3af067"}
    else if ( depth > 50) { color = "#6eabf5" }
    else if ( depth > 30) { color = "#ae1fde" }
    else if ( depth > 10) { color = "#e619a2" }
    return(color)
  }

  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}<br>Magnitude: ${(feature.properties.mag)}<br>Depth: ${(feature.geometry.coordinates[2])}</p>`);
  }

  function pointToLayer (feature, latlng) {
    return new L.CircleMarker ( latlng, 
                                { radius      : getRadius(feature.properties.mag),
                                  color       : '#555',
                                  fillColor   : getColor(feature),
                                  fillOpacity : 1,
                                  weight      : 1
                                }
                              );
  }

  const earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer : pointToLayer,
    onEachFeature: onEachFeature
  });

  createMap(earthquakes);
}

function createMap(earthquakes) {

  const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  const baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  const overlayMaps = {
    Earthquakes: earthquakes
  };
 //   USC coordinates
  const myMap = L.map("map", {
    center: [ 34.0224, -118.2851], 
    zoom: 4,
    layers: [street, earthquakes]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  const legend = L.control({ position: "bottomright" });

  legend.onAdd = function (map) {
    const div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<b>Depth</b><br>";
    div.innerHTML += '<i style="background: #ed4928"></i><span>&lt;10</span><br>';
    div.innerHTML += '<i style="background: #def03a"></i><span>10-30</span><br>';
    div.innerHTML += '<i style="background: #3af067"></i><span>30-50</span><br>';
    div.innerHTML += '<i style="background: #6eabf5"></i><span>50-70</span><br>';
    div.innerHTML += '<i style="background: #ae1fde"></i><span>70-90</span><br>';
    div.innerHTML += '<i style="background: #990668"></i><span>&gt;90</span><br>';
    return div;
  };

  legend.addTo(myMap);
}