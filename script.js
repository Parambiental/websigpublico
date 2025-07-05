// Inicializar mapa
const map = L.map("map").setView([-25.2637, -57.5759], 13);

// Capas base
const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// Capas WMS
const catastroWMS = L.tileLayer.wms("URL_DEL_WMS", {
  layers: "nombre_capa",
  format: "image/png",
  transparent: true,
  attribution: "Catastro Asunción",
});

const overlays = {
  "Catastro WMS": catastroWMS,
};

L.control.layers({ OSM: osm }, overlays).addTo(map);
