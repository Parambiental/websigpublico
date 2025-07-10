import { initMapLayers } from './mapLayers.js';
import { saveProject, loadProject } from './storage.js';
import { exportGeoJSON, exportShapefile, exportPDF } from './export.js';
import { toggleControls, setupUI } from './ui.js';
import { setMapInstance, setDrawItems, setDrawControl, drawControlVisible } from './mapState.js';

let map, drawnItems, drawControl;

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
      marker: true,
    },
  });

  map.addControl(drawControl);

  // Guardar referencias
  setMapInstance(map);
  setDrawItems(drawnItems);
  setDrawControl(drawControl);

  map.on(L.Draw.Event.CREATED, e => {
    drawnItems.addLayer(e.layer);
  });
}