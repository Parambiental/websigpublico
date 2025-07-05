document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map').setView([-25.3, -57.6], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  const drawControl = new L.Control.Draw({
    draw: { polygon: true, polyline: false, circle: false, rectangle: false, marker: false, circlemarker: false },
    edit: { featureGroup: drawnItems, remove: true }
  });
  map.addControl(drawControl);

  let currentPolygon = null;

  map.on(L.Draw.Event.CREATED, e => {
    if (currentPolygon) drawnItems.removeLayer(currentPolygon);
    currentPolygon = e.layer;
    drawnItems.addLayer(currentPolygon);
    actualizarTablaVertices(currentPolygon);
  });

  map.on('draw:edited', e => {
    e.layers.eachLayer(layer => {
      if (layer === currentPolygon) actualizarTablaVertices(layer);
    });
  });

  map.on('draw:deleted', e => {
    e.layers.eachLayer(layer => {
      if (layer === currentPolygon) {
        currentPolygon = null;
        limpiarTablaVertices();
      }
    });
  });

  function actualizarTablaVertices(layer) {
    const coords = layer.getLatLngs()[0];
    const tbody = document.querySelector('#tabla-vertices tbody');
    tbody.innerHTML = '';

    for(let i=0; i<coords.length; i++) {
      const p1 = coords[i];
      const p2 = coords[(i+1) % coords.length];
      const distancia = calcularDistancia(p1, p2).toFixed(2);
      const rumbo = calcularRumbo(p1, p2);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>P${i+1}</td>
        <td contenteditable="true">${p1.lng.toFixed(6)}</td>
        <td contenteditable="true">${p1.lat.toFixed(6)}</td>
        <td>${distancia}</td>
        <td>${rumbo}</td>
        <td><button class="eliminar-punto" data-index="${i}">Eliminar</button></td>
      `;
      tbody.appendChild(tr);
    }
  }

  function limpiarTablaVertices() {
    document.querySelector('#tabla-vertices tbody').innerHTML = '';
  }

  function calcularDistancia(p1, p2) {
    const R = 6371000; // Radio Tierra en m
    const toRad = Math.PI/180;
    const dLat = (p2.lat - p1.lat)*toRad;
    const dLon = (p2.lng - p1.lng)*toRad;
    const a = Math.sin(dLat/2)**2 + Math.cos(p1.lat*toRad)*Math.cos(p2.lat*toRad)*Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R*c;
  }

  function calcularRumbo(p1, p2) {
    const toDeg = 180/Math.PI;
    const toRad = Math.PI/180;
    let dLon = (p2.lng - p1.lng)*toRad;
    let y = Math.sin(dLon)*Math.cos(p2.lat*toRad);
    let x = Math.cos(p1.lat*toRad)*Math.sin(p2.lat*toRad) - Math.sin(p1.lat*toRad)*Math.cos(p2.lat*toRad)*Math.cos(dLon);
    let brng = Math.atan2(y, x)*toDeg;
    brng = (brng + 360) % 360;
    // Convertir a grados minutos segundos y dirección (ejemplo N45°30′E)
    const directions = ['N', 'E', 'S', 'W'];
    let d = Math.floor(brng);
    let m = Math.floor((brng - d)*60);
    return `N${d}°${m}′E`; // Simplificado para mostrar solo N y E
  }

  // Eventos botones (simplificado, podes expandir)
  document.getElementById('validar-poligono').onclick = () => {
    if (!currentPolygon) return alert('No hay polígono dibujado');
    const coords = currentPolygon.getLatLngs()[0];
    if (coords.length < 4) return alert('El polígono debe tener al menos 3 vértices cerrados');
    const first = coords[0];
    const last = coords[coords.length-1];
    if (first.equals(last)) alert('El polígono está cerrado correctamente');
    else alert('El polígono NO está cerrado. El último punto debe coincidir con el primero.');
  };

  // Agregar otros eventos: cargar CSV, exportar CSV, agregar punto, eliminar punto, limpiar todo...
});
