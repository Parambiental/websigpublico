// mapLayers.js
// Configuración de capas base y controles de capas para Leaflet

export function initMapLayers(map) {
  // Capa base OpenStreetMap
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  });

  osm.addTo(map);

  // Ejemplo capa ortofotos (reemplazar URL por servicio real)
  const ortofotos = L.tileLayer('https://{s}.tileserver.com/ortofoto/{z}/{x}/{y}.png', {
    attribution: '© Ortofotos'
  });

  // Capa curvas de nivel ejemplo
  const curvasNivel = L.tileLayer('https://{s}.tileserver.com/curvas/{z}/{x}/{y}.png', {
    attribution: '© Curvas de Nivel'
  });

  // Control de capas para mostrar/ocultar
  const baseLayers = {
    'OpenStreetMap': osm,
    'Ortofotos': ortofotos,
    'Curvas de Nivel': curvasNivel
  };

  L.control.layers(baseLayers).addTo(map);
}
