import { drawnItems } from './app.js';

export function saveProject() {
  const geojson = drawnItems.toGeoJSON();
  const project = { created: new Date().toISOString(), geojson };
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `proyecto_${new Date().toISOString().slice(0,10)}.ck`;
  a.click();
}

export function loadProjectFromFile(inputElement) {
  const file = inputElement.files[0];
  if (!file || !file.name.endsWith(".ck")) {
    alert("Por favor, cargue un archivo con extensión .ck");
    return;
  }
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const content = JSON.parse(reader.result);
      drawnItems.clearLayers();
      L.geoJSON(content.geojson).eachLayer(layer => drawnItems.addLayer(layer));
    } catch (e) {
      console.error(e);
      alert("Error al cargar el archivo .ck");
    }
  };
  reader.readAsText(file);
}
