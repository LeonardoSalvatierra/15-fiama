// ============================================================
//  gallery.js — Carrusel infinito de fotos
//
//  Comportamiento:
//  - Las imágenes se muestran a la par (varias visibles a la vez)
//  - Se mueven solas lentamente de forma continua (autoplay)
//  - Las flechas adelantan/retroceden de a 1 foto con animación suave
//  - El loop es verdaderamente infinito: clona las imágenes para que
//    nunca se vea un "salto" al reiniciar
//  - El autoplay se pausa mientras el usuario interactúa con las flechas
//
//  CSS necesario en styles.css:
//  .carrusel { overflow: hidden; position: relative; }
//  .carrusel__viewport { overflow: hidden; width: 100%; }
//  .carrusel__track { display: flex; will-change: transform; }
//  .carrusel__item { flex-shrink: 0; width: 280px; height: 320px;
//                    object-fit: cover; margin: 0 8px; border-radius: 12px; }
//  .carrusel__flecha { position: absolute; top: 50%; transform: translateY(-50%);
//                      z-index: 10; cursor: pointer; }
//  .carrusel__flecha--prev { left: 8px; }
//  .carrusel__flecha--next { right: 8px; }
// ============================================================

(function () {
  'use strict';

  const track    = document.getElementById('carrusel-track');
  const btnPrev  = document.getElementById('carrusel-prev');
  const btnNext  = document.getElementById('carrusel-next');

  if (!track || !btnPrev || !btnNext) return;

  // ── Configuración ───────────────────────────────────────────────────────
  const VELOCIDAD_AUTOPLAY  = 0.6;   // px por frame (más bajo = más lento)
  const DURACION_FLECHA_MS  = 500;   // ms de la animación al presionar flecha
  const PAUSA_TRAS_FLECHA   = 2000;  // ms que se pausa el autoplay tras usar flecha
  const ANCHO_ITEM          = 296;   // px (280 ancho + 8*2 margin); ajustá si cambiás el CSS

  // ── Clonado para loop infinito ──────────────────────────────────────────
  // Duplicamos todas las imágenes al final del track.
  // Cuando el scroll llega al final del set original, reposicionamos
  // silenciosamente al inicio sin que se note.
  const itemsOriginales = Array.from(track.querySelectorAll('.carrusel__item'));
  const totalOriginales = itemsOriginales.length;

  itemsOriginales.forEach(function (img) {
    const clon = img.cloneNode(true);
    clon.setAttribute('aria-hidden', 'true'); // los clones son decorativos
    track.appendChild(clon);
  });

  const anchoSet = totalOriginales * ANCHO_ITEM; // ancho de 1 set completo

  // ── Estado ─────────────────────────────────────────────────────────────
  let posicion       = 0;          // posición actual en px
  let autoplayActivo = true;
  let rafId          = null;
  let timeoutPausa   = null;
  let enTransicion   = false;      // bloquea el doble clic en flechas

  // ── Aplica posición sin animación (para reposicionamiento silencioso) ───
  function setPosicionInstante(px) {
    posicion = px;
    track.style.transition = 'none';
    track.style.transform  = 'translateX(' + (-posicion) + 'px)';
  }

  // ── Aplica posición con animación suave ────────────────────────────────
  function setPosicionAnimada(px, duracion) {
    posicion = px;
    track.style.transition = 'transform ' + duracion + 'ms ease';
    track.style.transform  = 'translateX(' + (-posicion) + 'px)';
  }

  // ── Normaliza la posición si pasó el punto de reinicio ─────────────────
  function normalizarPosicion() {
    if (posicion >= anchoSet) {
      setPosicionInstante(posicion - anchoSet);
    } else if (posicion < 0) {
      setPosicionInstante(posicion + anchoSet);
    }
  }

  // ── Loop de autoplay (requestAnimationFrame) ───────────────────────────
  function autoplayStep() {
    if (!autoplayActivo) {
      rafId = null;
      return;
    }

    posicion += VELOCIDAD_AUTOPLAY;
    normalizarPosicion();
    track.style.transition = 'none';
    track.style.transform  = 'translateX(' + (-posicion) + 'px)';

    rafId = requestAnimationFrame(autoplayStep);
  }

  function iniciarAutoplay() {
    if (rafId) return; // ya está corriendo
    autoplayActivo = true;
    rafId = requestAnimationFrame(autoplayStep);
  }

  function detenerAutoplay() {
    autoplayActivo = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // ── Avanzar / retroceder al presionar flecha ───────────────────────────
  function moverFoto(direccion) {
    if (enTransicion) return;
    enTransicion = true;

    detenerAutoplay();
    clearTimeout(timeoutPausa);

    const destino = posicion + (ANCHO_ITEM * direccion);
    setPosicionAnimada(destino, DURACION_FLECHA_MS);

    // Después de la animación, normalizamos y desbloqueamos
    setTimeout(function () {
      normalizarPosicion();
      enTransicion = false;

      // Reanudar autoplay después de la pausa configurada
      timeoutPausa = setTimeout(iniciarAutoplay, PAUSA_TRAS_FLECHA);
    }, DURACION_FLECHA_MS + 50);
  }

  // ── Eventos de flechas ─────────────────────────────────────────────────
  btnNext.addEventListener('click', function () { moverFoto(1);  });
  btnPrev.addEventListener('click', function () { moverFoto(-1); });

  // ── Pausa el autoplay si el usuario hace hover sobre el carrusel ────────
  const carrusel = document.getElementById('carrusel');
  if (carrusel) {
    carrusel.addEventListener('mouseenter', detenerAutoplay);
    carrusel.addEventListener('mouseleave', function () {
      if (!enTransicion) iniciarAutoplay();
    });
  }

  // ── Soporte táctil básico (swipe) ──────────────────────────────────────
  let touchStartX = null;

  track.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
    detenerAutoplay();
  }, { passive: true });

  track.addEventListener('touchend', function (e) {
    if (touchStartX === null) return;
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) { // umbral de swipe: 50px
      moverFoto(delta > 0 ? 1 : -1);
    } else {
      iniciarAutoplay();
    }
    touchStartX = null;
  }, { passive: true });

  // ── Arrancar ────────────────────────────────────────────────────────────
  setPosicionInstante(0);
  iniciarAutoplay();

})();