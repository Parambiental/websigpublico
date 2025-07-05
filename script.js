// --- Capas base definidas con variables claras ---
const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors',
});

const stamenToner = L.tileLayer(
  "https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",
  {
    maxZoom: 20,
    attribution:
      "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap",
  }
);

// Capa base extra, ejemplo CartoDB Positron (más estética)
const cartoPositron = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
  }
);

// --- Inicializar mapa con configuración y capa base por defecto ---
const map = L.map("map", {
  center: [-25.2637, -57.5759],
  zoom: 13,
  layers: [osm], // Capa base inicial activa
  fullscreenControl: true,
  zoomControl: true,
  preferCanvas: true, // Mejor rendimiento para capas vectoriales
});

// --- Definir overlays (capas superpuestas) ---
const catastroWMS = L.tileLayer.wms("URL_DEL_WMS", {
  layers: "nombre_capa",
  format: "image/png",
  transparent: true,
  attribution: "Catastro Asunción",
});

const puntosInteres = L.markerClusterGroup();
// Ejemplo para añadir marcadores (puedes cargar datos reales)
for (let i = 0; i < 50; i++) {
  let lat = -25.2637 + (Math.random() - 0.5) * 0.1;
  let lng = -57.5759 + (Math.random() - 0.5) * 0.1;
  let marker = L.marker([lat, lng]).bindPopup(`Punto de interés #${i + 1}`);
  puntosInteres.addLayer(marker);
}

// --- Organizar capas base y overlays para el control ---
const baseLayers = {
  "OpenStreetMap": osm,
  "Stamen Toner": stamenToner,
  "CartoDB Positron": cartoPositron,
};

const overlays = {
  "Catastro WMS": catastroWMS,
  "Puntos de Interés": puntosInteres,
};

// --- Añadir control de capas con opciones optimizadas ---
L.control
  .layers(baseLayers, overlays, {
    collapsed: false,
    position: "topright",
    autoZIndex: true, // Asegura el orden correcto de capas
  })
  .addTo(map);

// --- Añadir overlays por defecto activos ---
catastroWMS.addTo(map);
puntosInteres.addTo(map);

// --- Mejorar UX: añadir control de escala ---
L.control.scale({ position: "bottomleft", imperial: false }).addTo(map);

// --- Control de ubicación para usuario ---
L.control
  .locate({
    position: "topleft",
    strings: { title: "Mostrar mi ubicación" },
    flyTo: true,
    showPopup: true,
    locateOptions: { maxZoom: 16 },
  })
  .addTo(map);

// --- Control para medir distancias y áreas ---
L.control.measure({ position: "topleft" }).addTo(map);

// --- Control de búsqueda geocodificador ---
L.Control.geocoder({ position: "topleft", placeholder: "Buscar..." }).addTo(
  map
);

// --- Control de minimapa para contexto espacial ---
const miniMap = new L.Control.MiniMap(osm, {
  toggleDisplay: true,
  minimized: false,
  position: "bottomright",
}).addTo(map);

// --- Control personalizado para volver al inicio ---
L.easyButton("fa-home", function (btn, map) {
  map.setView([-25.2637, -57.5759], 13);
}, "Volver al inicio").addTo(map);
