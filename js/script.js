// --- Definir las capas base ---
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
});

// --- Inicializar el mapa ---
const map = L.map('map', {
  center: [-25.2637, -57.5759],  // Centra el mapa en una ubicación
  zoom: 13,  // Nivel de zoom inicial
  layers: [osm],  // Capa base predeterminada
  zoomControl: false,  // Desactiva los controles de zoom predeterminados de Leaflet
  fullscreenControl: true,  // Habilita el control de pantalla completa
});

// --- Añadir controles básicos ---
L.control.zoom({ position: 'bottomright' }).addTo(map);
L.control.scale({ position: 'bottomleft' }).addTo(map);
L.control.locate({ position: 'topleft', strings: { title: "Mi ubicación" } }).addTo(map);
L.control.measure({ position: 'topleft' }).addTo(map);
L.Control.geocoder({ position: 'topleft' }).addTo(map);

// --- Organizar capas base y overlays ---
const baseLayers = {
  "OpenStreetMap": osm,
};

const overlays = {
  "Catastro WMS": catastroWMS,
};

// --- Añadir control de capas ---
L.control
  .layers(baseLayers, overlays, {
    collapsed: false,
    position: "topright",
    autoZIndex: true,
  })
  .addTo(map);

// --- Añadir la capa WMS al mapa ---
catastroWMS.addTo(map);
