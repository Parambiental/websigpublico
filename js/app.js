// app.js
// Archivo principal para inicializar mapa y conectar módulos

import { initMapLayers } from './mapLayers.js';
import { saveProject, loadProject } from './storage.js';
import { exportGeoJSON, exportShapefile, exportPDF } from './export.js';
import { toggleControls, setupUI } from './ui.js';

let map, drawnItems, drawControl, drawControlVisible = true;

function initMap() {
  map = L.map('map', { zoomControl: false }).setView([-25.3, -57.6], 10);
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  initMapLayers(map);

  drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  drawControl = new L.Control.Draw({
    edit: { featureGroup: drawnItems },
    draw: {
      polygon: true,
      polyline: true,
      rectangle: true,
      circle: false,
      marker: true
    }
  });
  map.addControl(drawControl);

  map.on(L.Draw.Event.CREATED, e => {
    drawnItems.addLayer(e.layer);
  });
}

function setupEventListeners() {
  document.getElementById('loadProject').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    loadProject(file, (err, json) => {
      if (err) {
        alert('Error al cargar proyecto: ' + err);
        return;
      }
      drawnItems.clearLayers();
      L.geoJSON(json).eachLayer(layer => {
        drawnItems.addLayer(layer);
      });
      alert('Proyecto cargado correctamente');
    });
    e.target.value = '';
  });

  document.getElementById('saveProjectBtn').addEventListener('click', () => {
    const geojson = drawnItems.toGeoJSON();
    saveProject(geojson);
  });

  document.getElementById('exportGeoJSONBtn').addEventListener('click', () => {
    const geojson = drawnItems.toGeoJSON();
    exportGeoJSON(geojson);
  });

  document.getElementById('exportShpBtn').addEventListener('click', () => {
    const geojson = drawnItems.toGeoJSON();
    exportShapefile(geojson);
  });

  document.getElementById('exportPDFBtn').addEventListener('click', () => {
    exportPDF(document.getElementById('map'));
  });

  document.getElementById('toggleControlsBtn').addEventListener('click', toggleControls);
  document.getElementById('toggleDrawBtn').addEventListener('click', () => {
    if (drawControlVisible) {
      map.removeControl(drawControl);
    } else {
      map.addControl(drawControl);
    }
    drawControlVisible = !drawControlVisible;
  });
}

export function startApp() {
  document.getElementById('intro').style.display = 'none';
  document.getElementById('menuBtn').style.display = 'block';
  document.getElementById('toolsBtn').style.display = 'block';

  initMap();
  setupUI();
  setupEventListeners();
}

// Para usar desde HTML
window.startApp = startApp;
window.toggleControls = toggleControls;
