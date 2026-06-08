// ============================================================
//  countdown.js — Contador regresivo al evento
//  Lee la fecha del atributo data-fecha del .contador__grid.
//  Actualiza los spans cada segundo.
//  Cuando llega a 0 muestra un mensaje de celebración.
// ============================================================

(function () {
  'use strict';

  const grid = document.querySelector('.contador__grid');
  if (!grid) return;

  // Lee la fecha desde el HTML (formato ISO: "2025-09-19T21:00:00")
  const fechaEvento = new Date(grid.dataset.fecha);

  // Referencias a los spans de valores
  const elDias     = document.getElementById('contador-dias');
  const elHoras    = document.getElementById('contador-horas');
  const elMinutos  = document.getElementById('contador-minutos');
  const elSegundos = document.getElementById('contador-segundos');

  if (!elDias || !elHoras || !elMinutos || !elSegundos) return;

  // ── Formatea un número a siempre 2 dígitos: 3 → "03" ──────────────────
  function pad(n) {
    return String(Math.max(0, n)).padStart(2, '0');
  }

  // ── Calcula la diferencia y actualiza el DOM ───────────────────────────
  function actualizar() {
    const ahora      = new Date();
    const diferencia = fechaEvento - ahora; // milisegundos

    if (diferencia <= 0) {
      // ¡Llegó el día! Mostramos un mensaje especial
      elDias.textContent     = '00';
      elHoras.textContent    = '00';
      elMinutos.textContent  = '00';
      elSegundos.textContent = '00';

      // Podés personalizar este mensaje o manejarlo desde CSS
      grid.setAttribute('data-estado', 'celebracion');
      const titulo = document.querySelector('#contador .seccion__titulo');
      if (titulo) titulo.textContent = '¡Esta noche es la noche! 🎉';

      clearInterval(intervalo);
      return;
    }

    const dias     = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas    = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos  = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

    elDias.textContent     = pad(dias);
    elHoras.textContent    = pad(horas);
    elMinutos.textContent  = pad(minutos);
    elSegundos.textContent = pad(segundos);
  }

  // Ejecuta de inmediato para evitar el "00" inicial visible
  actualizar();

  // Luego actualiza cada segundo
  const intervalo = setInterval(actualizar, 1000);

})();