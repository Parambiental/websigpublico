// =============================
// Manejo de Tabs
// =============================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// =============================
// Inicialización del mapa
// =============================
let map = L.map('map').setView([-25.3, -57.6], 13);
let drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Capas base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// Herramientas de dibujo
const drawControl = new L.Control.Draw({
    draw: {
        polygon: true,
        marker: false,
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false
    },
    edit: {
        featureGroup: drawnItems
    }
});
map.addControl(drawControl);

// Almacén de vértices
let vertices = [];

// =============================
// Dibujo de polígono
// =============================
map.on(L.Draw.Event.CREATED, function (e) {
    drawnItems.clearLayers();
    const layer = e.layer;
    drawnItems.addLayer(layer);

    vertices = layer.getLatLngs()[0];
    actualizarTabla();
    actualizarVistaPDF();
});

// Botón "Dibujar polígono"
document.getElementById('draw-btn').addEventListener('click', () => {
    alert("Usá el botón del mapa para trazar el polígono.");
});

// =============================
// Cargar archivo CSV/JSON
// =============================
document.getElementById('cargar-archivo').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        let contenido = event.target.result;
        try {
            let data;
            if (file.name.endsWith('.json')) {
                data = JSON.parse(contenido);
                if (Array.isArray(data)) {
                    cargarVertices(data);
                }
            } else {
                const lines = contenido.split('\n').filter(Boolean);
                const coords = lines.map(line => {
                    const [x, y] = line.split(',').map(Number);
                    return L.latLng(y, x);
                });
                cargarVertices(coords);
            }
        } catch (err) {
            alert("Error al leer archivo: " + err.message);
        }
    };
    reader.readAsText(file);
});

// Carga manual de vértices
function cargarVertices(coordArray) {
    drawnItems.clearLayers();
    const poly = L.polygon(coordArray, { color: 'blue' });
    poly.addTo(drawnItems);
    vertices = coordArray;
    actualizarTabla();
    actualizarVistaPDF();
}

// =============================
// Usar GPS
// =============================
document.getElementById('usar-gps').addEventListener('click', () => {
    if (!navigator.geolocation) return alert("GPS no disponible.");

    navigator.geolocation.getCurrentPosition(pos => {
        const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
        map.setView(latlng, 17);
        alert(`Ubicación: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`);
    }, () => {
        alert("No se pudo acceder al GPS.");
    });
});

// =============================
// Validar cierre del polígono
// =============================
document.getElementById('validar-poligono').addEventListener('click', () => {
    if (vertices.length < 3) return alert("Dibujá al menos 3 puntos.");
    const first = vertices[0];
    const last = vertices[vertices.length - 1];
    const dist = map.distance(first, last);
    alert(dist < 1 ? "✔️ Polígono cerrado correctamente." : "❌ El polígono no está cerrado.");
});

// =============================
// Actualizar tabla de vértices
// =============================
function actualizarTabla() {
    const tbody = document.querySelector("#tabla-vertices tbody");
    tbody.innerHTML = "";

    for (let i = 0; i < vertices.length; i++) {
        const actual = vertices[i];
        const siguiente = vertices[(i + 1) % vertices.length];

        const distancia = map.distance(actual, siguiente).toFixed(2);
        const rumbo = calcularRumbo(actual, siguiente);

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>P${i + 1}</td>
            <td>${actual.lng.toFixed(6)}</td>
            <td>${actual.lat.toFixed(6)}</td>
            <td>${distancia}</td>
            <td>${rumbo}</td>
            <td><button class="eliminar-btn" onclick="eliminarVertice(${i})">🗑</button></td>
        `;
        tbody.appendChild(fila);
    }
}

// Eliminar vértice
function eliminarVertice(index) {
    vertices.splice(index, 1);
    cargarVertices(vertices);
}

// =============================
// Calcular rumbo (simplificado)
// =============================
function calcularRumbo(p1, p2) {
    const dy = p2.lat - p1.lat;
    const dx = p2.lng - p1.lng;
    const ang = Math.atan2(dy, dx) * (180 / Math.PI);
    let rumbo = ang < 0 ? 360 + ang : ang;
    const dir = rumbo < 90 ? "NE" : rumbo < 180 ? "SE" : rumbo < 270 ? "SO" : "NO";
    return `${rumbo.toFixed(1)}° ${dir}`;
}

// =============================
// Vista previa del PDF
// =============================
function actualizarVistaPDF() {
    const contenedor = document.getElementById('pdf-content');
    contenedor.innerHTML = `
        <h3>Expediente N.º ${document.getElementById('expediente').value || '---'}</h3>
        <p><b>Propietario:</b> ${document.getElementById('propietario').value || '---'}</p>
        <p><b>Profesional:</b> ${document.getElementById('profesional').value || '---'}</p>
        <p><b>Juzgado:</b> ${document.getElementById('juzgado').value || '---'}</p>
        <p><b>Ubicación:</b> ${document.getElementById('ubicacion').value || '---'}</p>
        <hr>
        <h4>Tabla Técnica</h4>
        <ul>
            ${vertices.map((v, i) =>
                `<li>P${i + 1}: (${v.lng.toFixed(6)}, ${v.lat.toFixed(6)})</li>`
            ).join("")}
        </ul>
    `;
}

// =============================
// Generar PDF con html2canvas
// =============================
document.getElementById('generar-pdf').addEventListener('click', () => {
    const pdfContainer = document.getElementById('pdf-content');

    html2canvas(pdfContainer).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF();
        pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
        pdf.save('informe_mensura.pdf');
    });
});
