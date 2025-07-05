# 🗺️ Diagnóstico Ambiental Participativo WebApp

Aplicación web interactiva para estudiantes y técnicos en Ciencias Ambientales, diseñada para realizar diagnósticos participativos de zonas geográficas mediante el uso de mapas, formularios dinámicos y herramientas de dibujo espacial.

---

## 🚀 Características principales

- 🌍 Mapa interactivo con Leaflet y fondo OpenStreetMap.
- 📌 Agregar puntos manuales en el mapa con datos personalizados.
- 📋 Formulario con campos editables (nombre del sitio, observaciones, estado, fotos).
- 🧾 Generación de tabla dinámica con todos los puntos cargados.
- 🎯 Resaltado de puntos al seleccionar filas en la tabla.
- ✏️ Edición y eliminación directa desde la tabla/formulario.
- 📦 Exportación de todos los datos (incluyendo imágenes) en ZIP.
- 📝 Generación de informe automático.

---

## ✏️ Herramientas de Dibujo

- ➕ Dibujo de líneas y polígonos sobre el mapa.
- 🟧 Si se traza una línea, se toma el **último punto** como referencia.
- 🔵 Se coloca un **marcador de inicio** para permitir el **cierre manual del polígono**.
- 📍 Se genera un **centroide** automáticamente al cerrar un polígono, útil como punto de análisis ambiental.

---

## ⚙️ Tecnologías utilizadas

- [Leaflet.js](https://leafletjs.com/)
- [Leaflet Draw](https://github.com/Leaflet/Leaflet.draw)
- [JSZip (opcional)](https://stuk.github.io/jszip/) para exportaciones ZIP
- HTML5, CSS3 y JavaScript puro (sin backend)

---

## 📁 Estructura del proyecto

```
📦 diagnostico-ambiental/
 ┣ 📄 index.html        ← Código completo del mapa y funcionalidades
 ┣ 📄 README.md         ← Este archivo
```

---

## ✅ Cómo usar

1. Abrí `index.html` en tu navegador web (no requiere servidor).
2. Hacé clic en el mapa para agregar puntos o usá las herramientas de dibujo.
3. Completá el formulario con los datos del sitio.
4. Guardá, editá o eliminá según sea necesario.
5. Exportá todo a un archivo ZIP o generá el informe final.

---

## 🧪 Ideal para:

- Proyectos escolares y universitarios.
- Salidas de campo participativas.
- Talleres ambientales comunitarios.
- Monitoreos de zonas verdes o humedales.

---

## 📬 Contacto / Créditos

Desarrollado por ChatGPT + [Tu nombre o institución].

Contribuciones y mejoras son bienvenidas 🛠️

# Parambiental SIG

## Cómo correr la app

1. Instalar dependencias  
   `npm install`

2. Ejecutar servidor  
   `npm start`

3. Abrir en navegador `http://localhost:3000`

## Actualizar capas

- Cambiar URLs WMS/WFS en `script.js` para apuntar a servicios actualizados.

## Dependencias

- Leaflet, Leaflet.draw, Express

