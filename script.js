window.onload = () => {
  const params = new URLSearchParams(window.location.search);
  const addr = params.get("adresse");
  if (addr) {
    document.getElementById('address').value = addr;
    geocodeAddress();
  }
};

var map = L.map('map').setView([46.603354, 1.888334], 6);

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

        const level = Math.floor(Math.random() * 5) + 1;
        let color = "green", radius = 300;
        switch (level) {
          case 1: color = "green"; radius = 300; break;
          case 2: color = "yellow"; radius = 500; break;
          case 3: color = "orange"; radius = 700; break;
          case 4: color = "red"; radius = 900; break;
          case 5: color = "#8B0000"; radius = 1100; break;
        }

        const estimation = {
          1: "~48 dB – Zone calme",
          2: "~52 dB – Bruit faible",
          3: "~57 dB – Bruit modéré",
          4: "~62 dB – Bruit élevé",
          5: "~67 dB – Très bruyant"
        };

        if (circle) map.removeLayer(circle);
        circle = L.circle([lat, lon], {
          color, fillColor: color, fillOpacity: 0.4, radius
        }).addTo(map)
          .bindPopup(`<strong>Estimation du bruit :</strong><br>${estimation[level]}`);

        setTimeout(() => {
          const circles = document.querySelectorAll('path.leaflet-interactive');
          if (circles.length > 0) {
            circles[circles.length - 1].classList.add('animate-circle');
          }
        }, 50);
      } else {
        alert("Adresse introuvable.");
      }
    });
}

function shareLink() {
  const address = document.getElementById('address').value;
  if (!address) {
    alert("Veuillez d'abord entrer une adresse.");
    return;
  }
  const url = `${window.location.origin}${window.location.pathname}?adresse=${encodeURIComponent(address)}`;
  const input = document.getElementById('shareLink');
  input.value = url;
  input.select();
  document.execCommand("copy");
  alert("Lien copié dans le presse-papier !");
}

const legend = L.control({ position: "bottomright" });
legend.onAdd = function (map) {
  const div = L.DomUtil.create("div", "info legend");
  div.innerHTML += "<h4>Estimation du bruit (dB)</h4>";
  div.innerHTML += '<i style="background: #8B0000; width: 12px; height: 12px; display:inline-block;"></i> > 65 dB (très bruyant)<br>';
  div.innerHTML += '<i style="background: red; width: 12px; height: 12px; display:inline-block;"></i> 60–65 dB (élevé)<br>';
  div.innerHTML += '<i style="background: orange; width: 12px; height: 12px; display:inline-block;"></i> 55–60 dB (modéré)<br>';
  div.innerHTML += '<i style="background: yellow; width: 12px; height: 12px; display:inline-block;"></i> 50–55 dB (faible)<br>';
  div.innerHTML += '<i style="background: green; width: 12px; height: 12px; display:inline-block;"></i> < 50 dB (calme)<br>';
  return div;
};
legend.addTo(map);

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("bruitForm");
  const success = document.getElementById("formSuccess");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(form);
      fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { 'Accept': 'application/json' }
      }).then(response => {
        if (response.ok) {
          success.style.display = "block";
          form.reset();
        } else {
          alert("Une erreur est survenue. Merci de réessayer.");
        }
      });
    });
  }
});
