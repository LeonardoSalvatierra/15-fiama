// ============================================================
//  main.js — Inicialización general de la página
//
//  Contiene:
//  1. Botón de música flotante: se vuelve visible al hacer scroll
//     (en el hero ya está visible como parte del diseño; acá lo
//     manejamos como elemento fijo en el resto de la página)
//  2. Animaciones de entrada por scroll (Intersection Observer)
//     para que las secciones aparezcan suavemente al bajar.
//  3. Smooth scroll al anclar links internos (#seccion)
// ============================================================

(function () {
  'use strict';

  // ── 1. BOTÓN DE MÚSICA FLOTANTE ────────────────────────────────────────
  // El botón #btn-musica está posicionado fijo (CSS: position: fixed).
  // Lo mostramos siempre desde el inicio para que el usuario sepa que
  // hay música. Si preferís mostrarlo solo tras el scroll, ajustá la clase.

  const btnMusica = document.getElementById('btn-musica');
  const hero      = document.getElementById('hero');

  if (btnMusica && hero) {
    // Observamos cuándo el hero sale de la vista para destacar el botón
    const heroObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          // Si el hero ya no es visible, le agregamos clase "fuera-de-hero"
          // (usala en CSS para dar más énfasis al botón si querés)
          btnMusica.classList.toggle('music-btn--fuera-hero', !entry.isIntersecting);
        });
      },
      { threshold: 0.2 }
    );
    heroObserver.observe(hero);
  }


  // ── 2. ANIMACIONES DE ENTRADA POR SCROLL ──────────────────────────────
  // Agrega la clase "visible" a las secciones cuando entran en el viewport.
  // En CSS definís: .seccion { opacity: 0; transform: translateY(20px); transition: ... }
  //                 .seccion.visible { opacity: 1; transform: none; }

  const secciones = document.querySelectorAll(
    '.seccion, .seccion-foto-decorativa, #hero'
  );

  if ('IntersectionObserver' in window && secciones.length > 0) {
    const seccionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Una vez visible, dejamos de observarla (la animación no se repite)
            seccionObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,    // se activa cuando el 10% de la sección es visible
        rootMargin: '0px 0px -40px 0px' // pequeño margen inferior para activar un poco antes
      }
    );

    secciones.forEach(function (el) {
      seccionObserver.observe(el);
    });
  } else {
    // Fallback si el navegador no soporta IntersectionObserver
    secciones.forEach(function (el) { el.classList.add('visible'); });
  }


  // ── 3. SMOOTH SCROLL PARA LINKS INTERNOS ──────────────────────────────
  // Los navegadores modernos ya hacen scroll:smooth con CSS (scroll-behavior: smooth
  // en el <html>), pero esto es un fallback para Safari antiguo y asegura
  // que los links tipo href="#seccion" funcionen bien.

  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id      = link.getAttribute('href').slice(1);
    const destino = document.getElementById(id);
    if (!destino) return;

    e.preventDefault();
    destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

})();