import { map, drawControl, drawControlVisible } from './app.js';

export function toggleControls() {
  const panel = document.getElementById("controls");
  panel.style.display = panel.style.display === "none" ? "flex" : "none";
}

export function toggleDrawToolbar() {
  if (drawControlVisible) {
    map.removeControl(drawControl);
  } else {
    map.addControl(drawControl);
  }
  drawControlVisible = !drawControlVisible;
}

export function startApp() {
  document.getElementById("intro").style.display = "none";
  document.getElementById("menuBtn").style.display = "block";
  document.getElementById("toolsBtn").style.display = "block";
}
