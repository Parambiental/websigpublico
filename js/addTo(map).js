// Inicialización del mapa centrado y con zoom deseado
const map = L.map('map').setView([-25.2637, -57.5759], 13);

// Definición de capas base
const baseLayers = {
  "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }),
  "Stamen Toner": L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', { maxZoom: 20 }),
};

// Añadir capa base por defecto al mapa (OpenStreetMap)
baseLayers["OpenStreetMap"].addTo(map);

// Definición de capas overlay
const overlays = {
  "Catastro WMS": L.tileLayer.wms('https://ahocevar.com/geoserver/wms', {
    layers: 'topp:states',
    format: 'image/png',
    transparent: true
  })
};

// Control de capas
L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(map);

// Grupo para elementos dibujados y control de dibujo
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);
const drawControl = new L.Control.Draw({
  edit: { featureGroup: drawnItems }
});
map.addControl(drawControl);
map.on(L.Draw.Event.CREATED, e => {
  drawnItems.addLayer(e.layer);
});

// Otras herramientas
L.control.locate({ position: "topleft", strings: { title: "Mostrar mi ubicación" } }).addTo(map);
L.control.scale().addTo(map);
L.control.measure({ position: 'topleft' }).addTo(map);
L.Control.geocoder().addTo(map);
map.addControl(new L.Control.Fullscreen());

// Minimapa con capa base por defecto
const miniMap = new L.Control.MiniMap(baseLayers["OpenStreetMap"], { toggleDisplay: true }).addTo(map);
