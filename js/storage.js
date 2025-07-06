// storage.js
// Funciones para guardar y cargar proyectos (GeoJSON) localmente

export function saveProject(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `proyecto_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function loadProject(file, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result);
      callback(null, json);
    } catch (error) {
      callback(error);
    }
  };
  reader.readAsText(file);
}
