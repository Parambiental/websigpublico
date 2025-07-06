// export.js
// Exportación a GeoJSON, Shapefile y PDF

import shpwrite from 'https://unpkg.com/shp-write@latest/shp-write.js';

export function exportGeoJSON(data) {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "datos.geojson";
  a.click();
  URL.revokeObjectURL(a.href);
}

export function exportShapefile(data) {
  try {
    shpwrite.download(data);
  } catch (error) {
    alert("Error al exportar shapefile: " + error);
  }
}

export function exportPDF(mapElement) {
  import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js').then(({ default: html2canvas }) => {
    import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js').then(({ jsPDF }) => {
      html2canvas(mapElement).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF.jsPDF({ orientation: 'landscape' });
        pdf.addImage(imgData, 'PNG', 10, 10, 280, 160);
        pdf.save("mapa.pdf");
      });
    });
  });
}
