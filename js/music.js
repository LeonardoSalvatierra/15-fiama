// ============================================================
//  music.js — Música de fondo de la página
//  Maneja: play, pausa, y memoria de posición (no reinicia al pausar).
//  El audio se define en el <audio id="audio-fondo"> del HTML.
//  El botón es el <button id="btn-musica">.
// ============================================================

(function () {
  'use strict';

  const audio = document.getElementById('audio-fondo');
  const btn   = document.getElementById('btn-musica');

  if (!audio || !btn) return; // Si no existen los elementos, no hace nada

  // Estado: false = pausado, true = reproduciendo
  let reproduciendo = false;

  // ── Actualiza la apariencia del botón según el estado ──────────────────
  function actualizarBoton() {
    btn.setAttribute('aria-pressed', reproduciendo ? 'true' : 'false');
    btn.setAttribute('aria-label', reproduciendo ? 'Pausar música' : 'Reproducir música');
    // Agrega/quita clase para que el CSS muestre el ícono correcto
    btn.classList.toggle('music-btn--activo', reproduciendo);
  }

  // ── Play ────────────────────────────────────────────────────────────────
  function play() {
    // .play() devuelve una Promise; manejamos el rechazo por la política
    // de autoplay de los navegadores (el usuario debe interactuar primero)
    const promesa = audio.play();
    if (promesa !== undefined) {
      promesa
        .then(() => {
          reproduciendo = true;
          actualizarBoton();
        })
        .catch(() => {
          // El navegador bloqueó el autoplay; no cambiamos el estado
          reproduciendo = false;
          actualizarBoton();
        });
    } else {
      reproduciendo = true;
      actualizarBoton();
    }
  }

  // ── Pausa (guarda posición automáticamente via el elemento <audio>) ─────
  function pausa() {
    audio.pause();
    // audio.currentTime NO se resetea al pausar, solo al llamar audio.load()
    // o setearlo manualmente. La posición queda guardada sola.
    reproduciendo = false;
    actualizarBoton();
  }

  // ── Click en el botón ───────────────────────────────────────────────────
  btn.addEventListener('click', function () {
    if (reproduciendo) {
      pausa();
    } else {
      play();
    }
  });

  // ── Sincroniza el estado si el audio termina (no debería pasar con loop,
  //    pero lo dejamos por si se saca el atributo loop) ───────────────────
  audio.addEventListener('ended', function () {
    reproduciendo = false;
    actualizarBoton();
  });

  // ── Estado inicial del botón ────────────────────────────────────────────
  actualizarBoton();

})();