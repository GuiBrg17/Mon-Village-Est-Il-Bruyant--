var map = L.map('map').setView([46.603354, 1.888334], 6);

// Nouveau fond de carte stylé (Carto Light)
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap & Carto',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

let marker;
let circle;

function geocodeAddress() {
  const address = document.getElementById('address').value;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const lat = data[0].lat;
        const lon = data[0].lon;
        map.setView([lat, lon], 13);

        if (marker) marker.setLatLng([lat, lon]);
        else marker = L.marker([lat, lon]).addTo(map);

        const level = Math.floor(Math.random() * 3) + 1;
        let color = level === 3 ? 'red' : level === 2 ? 'orange' : 'green';
        let radius = level === 3 ? 1000 : level === 2 ? 600 : 300;

        if (circle) map.removeLayer(circle);
        circle = L.circle([lat, lon], {
          color, fillColor: color, fillOpacity: 0.4, radius
        }).addTo(map);
      } else {
        alert("Adresse introuvable.");
      }
    });
}

// Légende
const legend = L.control({ position: "bottomright" });
legend.onAdd = function (map) {
  const div = L.DomUtil.create("div", "info legend");
  div.innerHTML += "<h4>Zones de bruit</h4>";
  div.innerHTML += '<i style="background: red; width: 12px; height: 12px; display:inline-block;"></i> Fort<br>';
  div.innerHTML += '<i style="background: orange; width: 12px; height: 12px; display:inline-block;"></i> Modéré<br>';
  div.innerHTML += '<i style="background: green; width: 12px; height: 12px; display:inline-block;"></i> Léger<br>';
  return div;
};
legend.addTo(map);
