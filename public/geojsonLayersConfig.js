/**
 * @typedef {Object} GeoJSONLayerConfig
 * @property {string} name - Nombre visible de la capa.
 * @property {string} url - URL del archivo GeoJSON.
 * @property {Object} style - Estilo general para la capa (color, peso, opacidad, etc.).
 * @property {function(object, L.LatLng): L.Layer} [pointToLayer] - Personalización de puntos.
 * @property {function(object, L.Layer): void} [onEachFeature] - Función aplicada a cada entidad (popup, tooltip, etc.).
 * @property {boolean} [cluster=false] - ¿Usar agrupamiento de puntos?
 * @property {boolean} [show=true] - ¿Mostrar esta capa al cargar el mapa?
 * @property {string} [category] - Categoría temática (educación, salud, seguridad, vialidad...).
 * @property {boolean} [label=false] - ¿Mostrar etiquetas en el mapa?
 * @property {string} [iconUrl] - URL de ícono personalizado (si aplica).
 */

/** Función para generar popup dinámico */
function defaultPopup(feature) {
  if (!feature.properties) return '';
  let popup = "<table style='width:100%; border-collapse: collapse;'>";
  for (let prop in feature.properties) {
    if (!["OBJECTID", "Shape_Leng", "Shape_Area", "id"].includes(prop)) {
      popup += `<tr>
        <th style='text-align:left; padding:4px; border-bottom:1px solid #ddd;'>${prop}</th>
        <td style='text-align:right; padding:4px; border-bottom:1px solid #ddd;'>${feature.properties[prop]}</td>
      </tr>`;
    }
  }
  popup += "</table>";
  return popup;
}

/** Array de configuraciones de capas GeoJSON */
const geojsonLayersConfig = [
  {
    name: "Locales de Salud (2012)",
    url: "https://www.ine.gov.py/microdatos/register/CARTOGRAFIA%20LOCALES%202012/GEOJSON/LOCALES_DE_SALUD_DGEEC2012.geojson",
    style: { color: "#e41a1c", weight: 2, opacity: 0.7, fillColor: "#e41a1c", fillOpacity: 0.4 },
    cluster: true,
    category: "Salud",
    onEachFeature: (feature, layer) => {
      layer.bindPopup(defaultPopup(feature));
      layer.bindTooltip(feature.properties.Nombre || "Salud", { permanent: false });
    },
  },
  {
    name: "Locales Policiales (2012)",
    url: "https://www.ine.gov.py/microdatos/register/CARTOGRAFIA%20LOCALES%202012/GEOJSON/LOCALES_POLICIALES_DGEEC2012.geojson",
    style: { color: "#377eb8", weight: 2, opacity: 0.7, fillColor: "#377eb8", fillOpacity: 0.4 },
    cluster: true,
    category: "Seguridad",
    onEachFeature: (feature, layer) => {
      layer.bindPopup(defaultPopup(feature));
      layer.bindTooltip("Policía", { permanent: false });
    },
  },
  {
    name: "Locales Educativos (2012)",
    url: "https://www.ine.gov.py/microdatos/register/CARTOGRAFIA%20LOCALES%202012/GEOJSON/LOCALES_EDUCATIVOS_DGEEC2012.geojson",
    style: { color: "#4daf4a", weight: 2, opacity: 0.7, fillColor: "#4daf4a", fillOpacity: 0.4 },
    cluster: true,
    category: "Educación",
    label: true,
    onEachFeature: (feature, layer) => {
      layer.bindPopup(defaultPopup(feature));
      if (feature.properties.Nombre) {
        layer.bindTooltip(feature.properties.Nombre, { permanent: false });
      }
    },
  },
  {
    name: "Vías de Paraguay (2022)",
    url: "Vias_Paraguay_INE_2022.geojson",
    style: { color: "#ff7f00", weight: 2, opacity: 0.8 },
    category: "Vialidad",
    onEachFeature: (feature, layer) => {
      layer.bindPopup(defaultPopup(feature));
    },
    pointToLayer: function (feature, latlng) {
      if (feature.geometry.type === 'Point') {
        return L.circleMarker(latlng, {
          radius: 5,
          fillColor: "#ff7f00",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      }
    },
  }
];

// Exponer globalmente para el navegador
window.geojsonLayersConfig = geojsonLayersConfig;