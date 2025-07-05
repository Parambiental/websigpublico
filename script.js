const map = L.map("map").setView([-25.3, -57.6], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
  edit: { featureGroup: drawnItems },
  draw: {
    polyline: true,
    polygon: false,
    marker: false,
    circle: false,
    rectangle: false,
    circlemarker: false,
  },
});
map.addControl(drawControl);

function calcularCentroide(latlngs) {
  let sumaLat = 0;
  let sumaLng = 0;
  latlngs.forEach((p) => {
    sumaLat += p.lat;
    sumaLng += p.lng;
  });
  return L.latLng(sumaLat / latlngs.length, sumaLng / latlngs.length);
}

map.on(L.Draw.Event.CREATED, function (e) {
  const layer = e.layer;
  drawnItems.addLayer(layer);

  if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
    let latlngs = layer.getLatLngs();
    if (Array.isArray(latlngs[0])) latlngs = latlngs[0];

    const primero = latlngs[0];

    const marcadorInicio = L.circleMarker(primero, {
      radius: 6,
      fillColor: "#00ccff",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    })
      .addTo(map)
      .bindPopup("🔁 Haga clic aquí para cerrar el polígono")
      .openPopup();

    marcadorInicio.on("click", () => {
      latlngs.push(primero);
      const poligono = L.polygon(latlngs, {
        color: "#3388ff",
        fillOpacity: 0.3,
      }).addTo(drawnItems);
      map.removeLayer(layer);
      map.removeLayer(marcadorInicio);
      alert("Polígono cerrado manualmente.");

      const centroide = calcularCentroide(latlngs);
      L.marker(centroide)
        .addTo(drawnItems)
        .bindPopup("📍 Punto centroide del polígono")
        .openPopup();
    });
  }
});
