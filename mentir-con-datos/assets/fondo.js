/* Fondo en movimiento, como el del taller de IA: puntitos de colores que flotan detrás de la página.
   Discretos en modo lectura, más presentes en modo charla. Se apaga con "reducir movimiento" y cuando
   la pestaña no se ve (requestAnimationFrame se frena solo). */
(function () {
  if (!document.createElement('canvas').getContext) { return; }
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }
  var cv = document.createElement('canvas');
  cv.id = 'fondo-particulas';
  cv.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(cv, document.body.firstChild);
  var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, puntos = [];
  // tinta, verde bosque, celeste y dulce de leche, con transparencia
  var COLORES = ['rgba(26,26,26,.16)', 'rgba(26,26,26,.10)', 'rgba(59,107,56,.45)', 'rgba(59,107,56,.28)',
                 'rgba(156,207,230,.70)', 'rgba(217,160,91,.50)', 'rgba(26,26,26,.07)'];
  function charla() { return document.body.classList.contains('charla'); }
  function iniciar() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    var n = Math.round(Math.max(24, Math.min(90, (W * H) / (charla() ? 15000 : 26000))));
    puntos = [];
    for (var i = 0; i < n; i++) {
      puntos.push({
        x: Math.random() * W, y: Math.random() * H, r: 1.4 + Math.random() * (charla() ? 3.8 : 2.8),
        vx: (Math.random() - .5) * .42, vy: (Math.random() - .5) * .42,
        c: COLORES[Math.floor(Math.random() * COLORES.length)]
      });
    }
  }
  var ultimoScroll = window.scrollY;
  function cuadro() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // Un poco de paralaje: al bajar la página, los puntos suben apenas
    var dy = (window.scrollY - ultimoScroll) * .08;
    ultimoScroll = window.scrollY;
    for (var i = 0; i < puntos.length; i++) {
      var p = puntos[i];
      p.x += p.vx; p.y += p.vy - dy * (p.r / 4);
      if (p.x < -p.r) { p.x = W + p.r; } else if (p.x > W + p.r) { p.x = -p.r; }
      if (p.y < -p.r) { p.y = H + p.r; } else if (p.y > H + p.r) { p.y = -p.r; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = p.c; ctx.fill();
    }
    requestAnimationFrame(cuadro);
  }
  iniciar();
  requestAnimationFrame(cuadro);
  var t = null;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(iniciar, 150); });
  document.addEventListener('labo:modo', iniciar);
})();
