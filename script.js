// --- Definir capas base con variables claras ---
const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors',
});

const stamenToner = L.tileLayer(
  "https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",
  {
    maxZoom: 20,
    attribution: "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap",
  }
);

const cartoPositron = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    maxZoom: 19,
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
  }
);

const humanitarian = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  maxZoom: 20, attribution: '© OpenStreetMap HOT'
});

const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17, attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap'
});

// --- Inicializar el mapa ---
const map = L.map("map", {
  center: [-25.2637, -57.5759],
  zoom: 13,
  layers: [osm], // Capa base predeterminada
  zoomControl: false,
  fullscreenControl: true,
});

// --- Añadir controles básicos ---
L.control.zoom({ position: "bottomright" }).addTo(map);
L.control.scale({ position: "bottomleft" }).addTo(map);
L.control.locate({ position: "topleft", strings: { title: "Mi ubicación" } }).addTo(map);
L.control.measure({ position: "topleft" }).addTo(map);
L.Control.geocoder({ position: "topleft" }).addTo(map);

// --- Capa WMS (por ejemplo, Catastro) ---
const catastroWMS = L.tileLayer.wms("URL_DEL_WMS", {
  layers: "nombre_capa",
  format: "image/png",
  transparent: true,
  attribution: "Catastro Asunción",
});

// --- Agrupar puntos de interés en un clúster ---
const puntosInteres = L.markerClusterGroup();
for (let i = 0; i < 50; i++) {
  let lat = -25.2637 + (Math.random() - 0.5) * 0.1;
  let lng = -57.5759 + (Math.random() - 0.5) * 0.1;
  let marker = L.marker([lat, lng]).bindPopup(`Punto de interés #${i + 1}`);
  puntosInteres.addLayer(marker);
}

// --- Organizar capas base y overlays ---
const baseLayers = {
  "OpenStreetMap": osm,
  "Stamen Toner": stamenToner,
  "CartoDB Positron": cartoPositron,
  "Humanitario": humanitarian,
  "Topográfico": topo,
};

const overlays = {
  "Catastro WMS": catastroWMS,
  "Puntos de Interés": puntosInteres,
};

// --- Añadir control de capas ---
L.control
  .layers(baseLayers, overlays, {
    collapsed: false,
    position: "topright",
    autoZIndex: true,
  })
  .addTo(map);

// --- Añadir overlays por defecto ---
catastroWMS.addTo(map);
puntosInteres.addTo(map);

// --- Mini mapa para contexto espacial ---
const miniMap = new L.Control.MiniMap(osm, {
  toggleDisplay: true,
  minimized: false,
  position: "bottomright",
}).addTo(map);

// --- Control personalizado para volver al inicio ---
L.easyButton("fa-home", function (btn, map) {
  map.setView([-25.2637, -57.5759], 13);
}, "Volver al inicio").addTo(map);

// --- Capa de dibujo ---
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({ edit: { featureGroup: drawnItems } });
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, (e) => {
  drawnItems.addLayer(e.layer);
});

// --- Exportación de datos de dibujo ---
document.getElementById("exportButton").onclick = function () {
  const geojson = drawnItems.toGeoJSON();
  const blob = new Blob([JSON.stringify(geojson)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "drawn-data.geojson";
  a.click();
};

// --- Evento click en el mapa ---
map.on("click", (e) => {
  L.popup()
    .setLatLng(e.latlng)
    .setContent(`Coordenadas: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`)
    .openOn(map);
});


