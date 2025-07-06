// ui.js
// Manejo de la UI: mostrar/ocultar controles, botones, etc.

export function toggleControls() {
  const controls = document.getElementById('controls');
  if (controls.style.display === 'flex' || controls.style.display === '') {
    controls.style.display = 'none';
  } else {
    controls.style.display = 'flex';
  }
}

export function setupUI() {
  // Por ejemplo, ocultar controles al inicio
  const controls = document.getElementById('controls');
  if (controls) controls.style.display = 'none';

  // Agregar más funciones UI si necesitás
}
