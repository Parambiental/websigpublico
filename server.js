// Definimos capas base
const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

const opentopo = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 17,
    attribution:
      'Map data: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>, ' +
      'SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
  }
);

const stamenToner = L.tileLayer(
  "https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",
  {
    maxZoom: 20,
    attribution:
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
      'under CC BY 3.0. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>',
  }
);

// Inicializamos mapa con capa base osm
const map = L.map("map", {
  center: [-25.2637, -57.5759],
  zoom: 13,
  layers: [osm],
});

// Control de capas base
const baseLayers = {
  "OpenStreetMap": osm,
  "OpenTopoMap": opentopo,
  "Stamen Toner": stamenToner,
};

L.control.layers(baseLayers).addTo(map);
