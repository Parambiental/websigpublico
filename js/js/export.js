import { drawnItems } from './app.js';

export function downloadGeoJSON() {
  const blob = new Blob([JSON.stringify(drawnItems.toGeoJSON())], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "capa.geojson";
  a.click();
}

export function downloadShapefile() {
  if (typeof shpwrite === 'undefined') {
    alert('shpwrite no cargado');
    return;
  }
  shpwrite.download(drawnItems.toGeoJSON());
}

export function exportToPDF() {
  html2canvas(document.getElementById("map")).then(canvas => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'landscape' });
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, 'PNG', 10, 10, 280, 160);
    pdf.save("mapa.pdf");
  });
}
