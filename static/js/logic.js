const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const queryUrlPlates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
d3.json(queryUrl).then(function (data) {
  d3.json(queryUrlPlates).then(function(plates){ 
    createFeatures(data.features, plates.features);
  });
});

function createFeatures(earthquakeData, platesData) {

  function getRadius(mag){
    return mag * 2
  }
  
  function getColor(feature){
    let depth = feature.geometry.coordinates[2];
    let color = "#f23071";
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

  function boundaries(platesData) {
    allPlates = []
    for (let i = 0; i < platesData.length; i++) {
      let plate = platesData[i];
      let coordFlip = [];
      coordinates = plate.geometry.coordinates;
      for (j = 0; j < coordinates.length; j++) {
        coordFlip.push([coordinates[j][1], coordinates[j][0]]);
      }
      allPlates.push(
        L.polyline(coordFlip)
      )
    }
    return L.layerGroup(allPlates);
  };

  const earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer : pointToLayer,
    onEachFeature: onEachFeature
  });

  const plate = boundaries(platesData);

  createMap(earthquakes, plate);
}
function createMap(earthquakes, plate) {
  const darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {

        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
      
  });

  const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });


    const grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
    });

  const baseMaps = {
    "Dark Map": darkMap,
    "Street Map": street,
    "Topographic Map": topo,
    "Greyscale Map": grayscaleMap
  };

  const overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": plate
  };
  
  // USC Coordinates
  const myMap = L.map("map", {
    center: [34.0224, -118.2851],
    zoom: 4,
    layers: [street, earthquakes, plate]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  const legend = L.control({ position: "bottomright" });

  legend.onAdd = function (map) {
    const div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<b>Depth</b><br>";
    div.innerHTML += '<i style="background: #f23071"></i><span>&lt;10</span><br>';
    div.innerHTML += '<i style="background: #def03a"></i><span>10-30</span><br>';
    div.innerHTML += '<i style="background: #3af067"></i><span>30-50</span><br>';
    div.innerHTML += '<i style="background: #6eabf5"></i><span>50-70</span><br>';
    div.innerHTML += '<i style="background: #ae1fde"></i><span>70-90</span><br>';
    div.innerHTML += '<i style="background: #990668"></i><span>&gt;90</span><br>';
    return div;
  };

  legend.addTo(myMap);
}
