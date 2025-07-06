// public/geojsonLayersConfig.js

/**
 * @typedef {Object} GeoJSONLayerConfig
 * @property {string} name - Nombre de la capa para mostrar en el control.
 * @property {string} url - URL del archivo GeoJSON.
 * @property {Object} style - Objeto de estilo para la capa Leaflet.
 * @property {function(object, L.LatLng): L.Layer} [pointToLayer] - Función opcional para personalizar la creación de marcadores de puntos.
 * @property {function(object, L.Layer): void} [onEachFeature] - Función opcional para añadir popups u otros eventos a cada feature.
 * @property {boolean} [cluster=false] - Indica si la capa debe usar clustering de marcadores.
 */

/**
 * Array de configuraciones para capas GeoJSON.
 * @type {GeoJSONLayerConfig[]}
 */
const geojsonLayersConfig = [
  {
    name: "Locales de Salud (2012)",
    url: "http://www.ine.gov.py/microdatos/register/CARTOGRAFIA%20LOCALES%202012/GEOJSON/LOCALES_DE_SALUD_DGEEC2012.geojson",
    style: { color: "#e41a1c", weight: 2, opacity: 0.7, fillColor: "#e41a1c", fillOpacity: 0.4 }, // Rojo
    // Aquí puedes añadir onEachFeature o pointToLayer si son específicos de esta capa
  },
  {
    name: "Locales Policiales (2012)",
    url: "http://www.ine.gov.py/microdatos/register/CARTOGRAFIA%20LOCALES%202012/GEOJSON/LOCALES_POLICIALES_DGEEC2012.geojson",
    style: { color: "#377eb8", weight: 2, opacity: 0.7, fillColor: "#377eb8", fillOpacity: 0.4 }, // Azul
  },
  {
    name: "Locales Educativos (2012)",
    url: "http://www.ine.gov.py/microdatos/register/CARTOGRAFIA%20LOCALES%202012/GEOJSON/LOCALES_EDUCATIVOS_DGEEC2012.geojson",
    style: { color: "#4daf4a", weight: 2, opacity: 0.7, fillColor: "#4daf4a", fillOpacity: 0.4 }, // Verde
  },
  {
    name: "Vías de Paraguay (2022)",
    url: "Vias_Paraguay_INE_2022.geojson", // Asegúrate de que este archivo esté en la carpeta 'public' de tu servidor
    style: { color: "#ff7f00", weight: 2, opacity: 0.8 }, // Naranja
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
      return undefined; // Retorna undefined si no es un punto, Leaflet lo ignorará
    },
    onEachFeature: function (feature, layer) {
      if (feature.properties) {
        let popupContent = "<table style='width:100%; border-collapse: collapse;'>";
        for (let prop in feature.properties) {
          // Filtra propiedades comunes que no suelen ser informativas para el usuario
          if (!["OBJECTID", "Shape_Leng", "Shape_Area", "id"].includes(prop)) {
            popupContent += `<tr><th style='text-align: left; padding: 4px; border-bottom: 1px solid #ddd;'>${prop}:</th><td style='text-align: right; padding: 4px; border-bottom: 1px solid #ddd;'>${feature.properties[prop]}</td></tr>`;
          }
        }
        popupContent += "</table>";
        layer.bindPopup(popupContent);
      }
    }
    // Si quisieras que las vías tengan clustering, añade: cluster: true
  }
];

// Exporta la configuración para que pueda ser importada en otro archivo JS
// Utiliza sintaxis de módulo ES6 si tu entorno lo soporta, o CommonJS si es un backend Node.js.
// Para el frontend, lo más común es simplemente exponerla globalmente o usar módulos ES6.
// Para este caso, dado que es un archivo que se carga en el navegador junto con <script type="module">
// o simplemente es cargado antes que el script principal, podemos exponerlo así:
window.geojsonLayersConfig = geojsonLayersConfig;
