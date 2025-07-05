<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Herramienta de Relevamiento Ambiental</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css" />
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        .header {
            background-color: #2c3e50;
            color: white;
            padding: 10px 20px;
            text-align: center;
        }
        .container {
            display: flex;
            flex: 1;
            flex-direction: column;
        }
        @media (min-width: 768px) {
            .container {
                flex-direction: row;
            }
        }
        .map-container {
            flex: 2;
            position: relative;
        }
        #map {
            height: 100%;
            width: 100%;
        }
        .sidebar {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background-color: #f5f5f5;
            border-left: 1px solid #ddd;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input, textarea, select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button {
            background-color: #27ae60;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 5px;
            margin-bottom: 5px;
        }
        button:hover {
            background-color: #2ecc71;
        }
        button.delete {
            background-color: #e74c3c;
        }
        button.delete:hover {
            background-color: #c0392b;
        }
        button.secondary {
            background-color: #3498db;
        }
        button.secondary:hover {
            background-color: #2980b9;
        }
        .status-bueno { background-color: #2ecc71; }
        .status-regular { background-color: #f39c12; }
        .status-critico { background-color: #e74c3c; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #2c3e50;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        tr:hover {
            background-color: #ddd;
            cursor: pointer;
        }
        .selected-row {
            background-color: #b3d9ff !important;
        }
        .photo-preview {
            max-width: 100px;
            max-height: 100px;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Herramienta de Relevamiento Ambiental</h1>
    </div>
    <div class="container">
        <div class="map-container">
            <div id="map"></div>
        </div>
        <div class="sidebar">
            <h2>Formulario de Registro</h2>
            <form id="point-form">
                <div class="form-group">
                    <label for="site-name">Nombre del sitio:</label>
                    <input type="text" id="site-name" required>
                </div>
                <div class="form-group">
                    <label for="site-status">Estado ambiental:</label>
                    <select id="site-status" required>
                        <option value="Bueno">Bueno</option>
                        <option value="Regular">Regular</option>
                        <option value="Crítico">Crítico</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="site-notes">Observaciones:</label>
                    <textarea id="site-notes" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="site-photo">Fotos (opcional):</label>
                    <input type="file" id="site-photo" accept="image/*" multiple>
                    <div id="photo-previews"></div>
                </div>
                <button type="submit" id="save-btn">Guardar Punto</button>
                <button type="button" id="update-btn" class="secondary" style="display:none;">Actualizar</button>
                <button type="button" id="cancel-btn" class="delete" style="display:none;">Cancelar</button>
            </form>
            
            <h2>Herramientas de Dibujo</h2>
            <button id="draw-polyline">Dibujar Línea</button>
            <button id="draw-polygon">Dibujar Polígono</button>
            <button id="clear-drawings">Limpiar Dibujos</button>
            
            <h2>Puntos Registrados</h2>
            <button id="export-zip" class="secondary">Exportar a ZIP</button>
            <button id="generate-report" class="secondary">Generar Informe</button>
            <table id="points-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th>Latitud</th>
                        <th>Longitud</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    </div>

    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
    <script>
        // Variables globales
        let map;
        let drawnItems = new L.FeatureGroup();
        let pointsLayer = new L.FeatureGroup();
        let drawControl;
        let currentPolygon = null;
        let polygonPoints = [];
        let centroidMarker = null;
        let editMode = false;
        let currentEditId = null;
        let pointsData = [];
        
        // Colores según estado
        const statusColors = {
            'Bueno': '#2ecc71',
            'Regular': '#f39c12',
            'Crítico': '#e74c3c'
        };
        
        // Inicializar el mapa
        function initMap() {
            map = L.map('map').setView([-34.6037, -58.3816], 12); // Buenos Aires por defecto
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            // Capas para dibujos y puntos
            drawnItems.addTo(map);
            pointsLayer.addTo(map);
            
            // Configurar herramientas de dibujo
            const drawOptions = {
                polyline: false,
                polygon: false,
                rectangle: false,
                circle: false,
                marker: false,
                edit: {
                    featureGroup: drawnItems
                }
            };
            
            drawControl = new L.Control.Draw({
                draw: drawOptions,
                edit: {
                    featureGroup: drawnItems
                }
            });
            map.addControl(drawControl);
            
            // Eventos para dibujar
            document.getElementById('draw-polyline').addEventListener('click', function() {
                drawControl.setDrawingOptions({
                    polyline: true,
                    polygon: false
                });
                drawControl._toolbars.draw._modes.polyline.handler.enable();
            });
            
            document.getElementById('draw-polygon').addEventListener('click', function() {
                drawControl.setDrawingOptions({
                    polyline: false,
                    polygon: true
                });
                drawControl._toolbars.draw._modes.polygon.handler.enable();
                polygonPoints = [];
            });
            
            document.getElementById('clear-drawings').addEventListener('click', function() {
                drawnItems.clearLayers();
                polygonPoints = [];
                if (centroidMarker) {
                    map.removeLayer(centroidMarker);
                    centroidMarker = null;
                }
            });
            
            // Eventos del mapa para agregar puntos manualmente
            map.on('click', function(e) {
                if (!editMode) {
                    document.getElementById('site-name').value = '';
                    document.getElementById('site-status').value = 'Bueno';
                    document.getElementById('site-notes').value = '';
                    document.getElementById('photo-previews').innerHTML = '';
                    document.getElementById('site-photo').value = '';
                    
                    document.getElementById('save-btn').style.display = 'inline-block';
                    document.getElementById('update-btn').style.display = 'none';
                    document.getElementById('cancel-btn').style.display = 'none';
                    
                    currentEditId = null;
                }
            });
            
            // Eventos para dibujos completados
            map.on(L.Draw.Event.CREATED, function(e) {
                const layer = e.layer;
                drawnItems.addLayer(layer);
                
                if (e.layerType === 'polyline') {
                    const latLngs = layer.getLatLngs();
                    const lastPoint = latLngs[latLngs.length - 1];
                    
                    // Mostrar marcador en el último punto
                    const marker = L.marker([lastPoint.lat, lastPoint.lng], {
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '📍',
                            iconSize: [25, 25]
                        })
                    }).addTo(map);
                    
                    marker.bindPopup("Último punto de la línea. Puede usar este punto para registro.").openPopup();
                    
                    // Cargar coordenadas en el formulario
                    document.getElementById('site-name').value = `Punto en línea (${lastPoint.lat.toFixed(4)}, ${lastPoint.lng.toFixed(4)})`;
                }
                
                if (e.layerType === 'polygon') {
                    currentPolygon = layer;
                    const latLngs = layer.getLatLngs()[0]; // Primer anillo del polígono
                    polygonPoints = latLngs;
                    
                    // Calcular centroide
                    calculateCentroid(latLngs);
                }
            });
            
            // Evento para cerrar polígonos manualmente
            map.on('draw:drawvertex', function(e) {
                if (e.layerType === 'polygon') {
                    polygonPoints = e.layers.getLayers()[0].getLatLngs()[0];
                    
                    // Marcar primer punto si hay más de 2 puntos
                    if (polygonPoints.length > 2) {
                        const firstPoint = polygonPoints[0];
                        
                        // Eliminar marcador anterior si existe
                        if (document.querySelector('.first-point-marker')) {
                            map.removeLayer(document.querySelector('.first-point-marker')._leaflet_id);
                        }
                        
                        // Crear marcador especial para el primer punto
                        const firstMarker = L.marker([firstPoint.lat, firstPoint.lng], {
                            icon: L.divIcon({
                                className: 'first-point-marker',
                                html: '🔵',
                                iconSize: [25, 25]
                            })
                        }).addTo(map);
                        
                        firstMarker.on('click', function() {
                            if (polygonPoints.length > 2) {
                                // Cerrar el polígono
                                const polygon = L.polygon(polygonPoints, {color: '#3498db'}).addTo(drawnItems);
                                drawnItems.addLayer(polygon);
                                
                                // Calcular centroide
                                calculateCentroid(polygonPoints);
                                
                                // Eliminar el dibujo original
                                drawnItems.eachLayer(function(layer) {
                                    if (layer instanceof L.Polygon && layer !== polygon) {
                                        drawnItems.removeLayer(layer);
                                    }
                                });
                                
                                // Eliminar marcadores temporales
                                map.eachLayer(function(layer) {
                                    if (layer instanceof L.Marker && layer !== centroidMarker) {
                                        map.removeLayer(layer);
                                    }
                                });
                            }
                        });
                        
                        firstMarker.bindPopup("Haz clic aquí para cerrar el polígono").openPopup();
                    }
                }
            });
            
            // Cargar datos guardados si existen
            loadSavedData();
        }
        
        // Calcular centroide de un polígono
        function calculateCentroid(latLngs) {
            let x = 0, y = 0, z = 0;
            const totalPoints = latLngs.length;
            
            latLngs.forEach(point => {
                const lat = point.lat * Math.PI / 180;
                const lng = point.lng * Math.PI / 180;
                
                x += Math.cos(lat) * Math.cos(lng);
                y += Math.cos(lat) * Math.sin(lng);
                z += Math.sin(lat);
            });
            
            x = x / totalPoints;
            y = y / totalPoints;
            z = z / totalPoints;
            
            const centralLng = Math.atan2(y, x);
            const centralSquareRoot = Math.sqrt(x * x + y * y);
            const centralLat = Math.atan2(z, centralSquareRoot);
            
            const centroidLat = centralLat * 180 / Math.PI;
            const centroidLng = centralLng * 180 / Math.PI;
            
            // Eliminar marcador anterior si existe
            if (centroidMarker) {
                map.removeLayer(centroidMarker);
            }
            
            // Crear marcador en el centroide
            centroidMarker = L.marker([centroidLat, centroidLng], {
                icon: L.divIcon({
                    className: 'centroid-marker',
                    html: '📍',
                    iconSize: [30, 30]
                })
            }).addTo(map);
            
            centroidMarker.bindPopup("Punto centroide del polígono").openPopup();
            
            // Centrar el mapa en el centroide
            map.setView([centroidLat, centroidLng], map.getZoom());
            
            // Cargar datos en el formulario
            document.getElementById('site-name').value = `Centroide (${centroidLat.toFixed(4)}, ${centroidLng.toFixed(4)})`;
        }
        
        // Guardar un nuevo punto
        document.getElementById('point-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('site-name').value;
            const status = document.getElementById('site-status').value;
            const notes = document.getElementById('site-notes').value;
            const photoInput = document.getElementById('site-photo');
            
            // Obtener coordenadas del centro del mapa o del último clic
            const center = map.getCenter();
            const lat = center.lat;
            const lng = center.lng;
            
            // Crear objeto de datos
            const pointData = {
                id: Date.now(),
                name: name,
                status: status,
                notes: notes,
                lat: lat,
                lng: lng,
                photos: []
            };
            
            // Procesar fotos si hay alguna
            if (photoInput.files.length > 0) {
                for (let i = 0; i < photoInput.files.length; i++) {
                    const file = photoInput.files[i];
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        pointData.photos.push({
                            name: file.name,
                            data: e.target.result.split(',')[1] // Guardar solo la parte base64
                        });
                        
                        // Actualizar tabla después de procesar todas las fotos
                        if (i === photoInput.files.length - 1) {
                            if (editMode) {
                                updatePoint(pointData);
                            } else {
                                addPoint(pointData);
                            }
                        }
                    };
                    
                    reader.readAsDataURL(file);
                }
            } else {
                if (editMode) {
                    updatePoint(pointData);
                } else {
                    addPoint(pointData);
                }
            }
        });
        
        // Añadir punto al mapa y a los datos
        function addPoint(pointData) {
            // Crear marcador
            const marker = L.marker([pointData.lat, pointData.lng], {
                icon: L.divIcon({
                    className: `status-${pointData.status.toLowerCase()}`,
                    html: '📍',
                    iconSize: [25, 25]
                })
            }).addTo(pointsLayer);
            
            // Vincular datos al marcador
            marker.pointData = pointData;
            
            // Popup con información
            marker.bindPopup(`
                <b>${pointData.name}</b><br>
                <b>Estado:</b> ${pointData.status}<br>
                <b>Observaciones:</b> ${pointData.notes || 'Ninguna'}
            `);
            
            // Guardar referencia al marcador en los datos
            pointData.marker = marker;
            
            // Añadir a la lista de puntos
            pointsData.push(pointData);
            
            // Actualizar tabla
            updatePointsTable();
            
            // Limpiar formulario
            document.getElementById('point-form').reset();
            document.getElementById('photo-previews').innerHTML = '';
        }
        
        // Actualizar un punto existente
        function updatePoint(updatedData) {
            const index = pointsData.findIndex(p => p.id === currentEditId);
            if (index !== -1) {
                // Actualizar datos
                pointsData[index].name = updatedData.name;
                pointsData[index].status = updatedData.status;
                pointsData[index].notes = updatedData.notes;
                
                if (updatedData.photos.length > 0) {
                    pointsData[index].photos = updatedData.photos;
                }
                
                // Actualizar marcador
                const marker = pointsData[index].marker;
                marker.setIcon(L.divIcon({
                    className: `status-${updatedData.status.toLowerCase()}`,
                    html: '📍',
                    iconSize: [25, 25]
                }));
                
                marker.bindPopup(`
                    <b>${updatedData.name}</b><br>
                    <b>Estado:</b> ${updatedData.status}<br>
                    <b>Observaciones:</b> ${updatedData.notes || 'Ninguna'}
                `);
                
                // Actualizar tabla
                updatePointsTable();
                
                // Salir del modo edición
                exitEditMode();
            }
        }
        
        // Actualizar la tabla de puntos
        function updatePointsTable() {
            const tableBody = document.querySelector('#points-table tbody');
            tableBody.innerHTML = '';
            
            pointsData.forEach(point => {
                const row = document.createElement('tr');
                row.dataset.id = point.id;
                
                row.innerHTML = `
                    <td>${point.name}</td>
                    <td class="status-${point.status.toLowerCase()}">${point.status}</td>
                    <td>${point.lat.toFixed(4)}</td>
                    <td>${point.lng.toFixed(4)}</td>
                    <td>
                        <button class="edit-btn secondary">Editar</button>
                        <button class="delete-btn delete">Eliminar</button>
                    </td>
                `;
                
                tableBody.appendChild(row);
                
                // Evento para resaltar punto en el mapa al seleccionar fila
                row.addEventListener('click', function() {
                    // Resaltar fila
                    document.querySelectorAll('#points-table tr').forEach(r => {
                        r.classList.remove('selected-row');
                    });
                    row.classList.add('selected-row');
                    
                    // Centrar mapa en el punto
                    map.setView([point.lat, point.lng], Math.max(map.getZoom(), 15));
                    
                    // Resaltar marcador (temporalmente)
                    point.marker.setIcon(L.divIcon({
                        className: 'selected-marker',
                        html: '🔵',
                        iconSize: [30, 30]
                    }));
                    
                    // Restaurar icono después de 3 segundos
                    setTimeout(() => {
                        point.marker.setIcon(L.divIcon({
                            className: `status-${point.status.toLowerCase()}`,
                            html: '📍',
                            iconSize: [25, 25]
                        }));
                    }, 3000);
                });
                
                // Evento para botón editar
                row.querySelector('.edit-btn').addEventListener('click', function(e) {
                    e.stopPropagation();
                    enterEditMode(point);
                });
                
                // Evento para botón eliminar
                row.querySelector('.delete-btn').addEventListener('click', function(e) {
                    e.stopPropagation();
                    deletePoint(point.id);
                });
            });
            
            // Guardar datos en localStorage
            saveData();
        }
        
        // Entrar en modo edición
        function enterEditMode(point) {
            editMode = true;
            currentEditId = point.id;
            
            // Cargar datos en el formulario
            document.getElementById('site-name').value = point.name;
            document.getElementById('site-status').value = point.status;
            document.getElementById('site-notes').value = point.notes || '';
            
            // Mostrar previsualización de fotos existentes
            const photoPreviews = document.getElementById('photo-previews');
            photoPreviews.innerHTML = '';
            
            if (point.photos && point.photos.length > 0) {
                point.photos.forEach(photo => {
                    const img = document.createElement('img');
                    img.src = `data:image/jpeg;base64,${photo.data}`;
                    img.className = 'photo-preview';
                    photoPreviews.appendChild(img);
                });
            }
            
            // Cambiar botones
            document.getElementById('save-btn').style.display = 'none';
            document.getElementById('update-btn').style.display = 'inline-block';
            document.getElementById('cancel-btn').style.display = 'inline-block';
            
            // Centrar mapa en el punto
            map.setView([point.lat, point.lng], Math.max(map.getZoom(), 15));
        }
        
        // Salir del modo edición
        function exitEditMode() {
            editMode = false;
            currentEditId = null;
            
            // Limpiar formulario
            document.getElementById('point-form').reset();
            document.getElementById('photo-previews').innerHTML = '';
            
            // Restaurar botones
            document.getElementById('save-btn').style.display = 'inline-block';
            document.getElementById('update-btn').style.display = 'none';
            document.getElementById('cancel-btn').style.display = 'none';
        }
        
        // Botón cancelar edición
        document.getElementById('cancel-btn').addEventListener('click', exitEditMode);
        
        // Eliminar punto
        function deletePoint(id) {
            if (confirm('¿Estás seguro de que quieres eliminar este punto?')) {
                const index = pointsData.findIndex(p => p.id === id);
                if (index !== -1) {
                    // Eliminar marcador del mapa
                    map.removeLayer(pointsData[index].marker);
                    
                    // Eliminar de la lista
                    pointsData.splice(index, 1);
                    
                    // Actualizar tabla
                    updatePointsTable();
                }
            }
        }
        
        // Exportar a ZIP
        document.getElementById('export-zip').addEventListener('click', function() {
            if (pointsData.length === 0) {
                alert('No hay puntos para exportar');
                return;
            }
            
            const zip = new JSZip();
            const dataFolder = zip.folder("relevamiento_ambiental");
            
            // Crear CSV con los datos
            let csvContent = "Nombre,Estado,Latitud,Longitud,Observaciones,Fotos\n";
            
            pointsData.forEach((point, index) => {
                csvContent += `"${point.name}","${point.status}",${point.lat},${point.lng},"${point.notes || ''}",`;
                
                // Añadir fotos al ZIP y al CSV
                if (point.photos && point.photos.length > 0) {
                    const photoNames = point.photos.map((photo, i) => {
                        const photoName = `punto_${index}_foto_${i}.jpg`;
                        dataFolder.file(photoName, photo.data, {base64: true});
                        return photoName;
                    });
                    
                    csvContent += `"${photoNames.join(', ')}"`;
                } else {
                    csvContent += "Ninguna";
                }
                
                csvContent += "\n";
            });
            
            dataFolder.file("datos_relevamiento.csv", csvContent);
            
            // Generar informe técnico
            const reportContent = generarInformeTecnico();
            dataFolder.file("informe_tecnico.txt", reportContent);
            
            // Generar el ZIP
            zip.generateAsync({type: "blob"}).then(function(content) {
                saveAs(content, "relevamiento_ambiental.zip");
            });
        });
        
        // Generar informe técnico
        document.getElementById('generate-report').addEventListener('click', function() {
            if (pointsData.length === 0) {
                alert('No hay puntos para generar informe');
                return;
            }
            
            const reportContent = generarInformeTecnico();
            const blob = new Blob([reportContent], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "informe_relevamiento.txt");
        });
        
        function generarInformeTecnico() {
            let report = "INFORME TÉCNICO DE RELEVAMIENTO AMBIENTAL\n\n";
            report += `Fecha de generación: ${new Date().toLocaleDateString()}\n`;
            report += `Total de puntos registrados: ${pointsData.length}\n\n`;
            
            // Resumen por estado
            const resumenEstados = {
                'Bueno': 0,
                'Regular': 0,
                'Crítico': 0
            };
            
            pointsData.forEach(point => {
                resumenEstados[point.status]++;
            });
            
            report += "RESUMEN POR ESTADO AMBIENTAL:\n";
            report += `- Bueno: ${resumenEstados['Bueno']} puntos\n`;
            report += `- Regular: ${resumenEstados['Regular']} puntos\n`;
            report += `- Crítico: ${resumenEstados['Crítico']} puntos\n\n`;
            
            // Detalle de puntos
            report += "DETALLE DE PUNTOS REGISTRADOS:\n\n";
            
            pointsData.forEach((point, index) => {
                report += `PUNTO ${index + 1}:\n`;
                report += `- Nombre: ${point.name}\n`;
                report += `- Coordenadas: ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}\n`;
                report += `- Estado: ${point.status}\n`;
                report += `- Observaciones: ${point.notes || 'Ninguna'}\n`;
                report += `- Fotos: ${point.photos && point.photos.length > 0 ? point.photos.length : 'Ninguna'}\n\n`;
            });
            
            return report;
        }
        
        // Previsualizar fotos antes de subir
        document.getElementById('site-photo').addEventListener('change', function(e) {
            const previews = document.getElementById('photo-previews');
            previews.innerHTML = '';
            
            for (let i = 0; i < this.files.length; i++) {
                const file = this.files[i];
                if (!file.type.match('image.*')) continue;
                
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'photo-preview';
                    previews.appendChild(img);
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        // Guardar datos en localStorage
        function saveData() {
            const dataToSave = pointsData.map(point => {
                // No guardar el marcador en localStorage
                const {marker, ...rest} = point;
                return rest;
            });
            
            localStorage.setItem('environmentalSurveyData', JSON.stringify(dataToSave));
        }
        
        // Cargar datos guardados
        function loadSavedData() {
            const savedData = localStorage.getItem('environmentalSurveyData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                
                parsedData.forEach(pointData => {
                    // Recrear los marcadores
                    const marker = L.marker([pointData.lat, pointData.lng], {
                        icon: L.divIcon({
                            className: `status-${pointData.status.toLowerCase()}`,
                            html: '📍',
                            iconSize: [25, 25]
                        })
                    }).addTo(pointsLayer);
                    
                    marker.bindPopup(`
                        <b>${pointData.name}</b><br>
                        <b>Estado:</b> ${pointData.status}<br>
                        <b>Observaciones:</b> ${pointData.notes || 'Ninguna'}
                    `);
                    
                    // Vincular datos al marcador
                    marker.pointData = pointData;
                    pointData.marker = marker;
                    
                    pointsData.push(pointData);
                });
                
                updatePointsTable();
            }
        }
        
        // Inicializar la aplicación cuando se cargue el DOM
        document.addEventListener('DOMContentLoaded', initMap);
    </script>
</body>
</html>
