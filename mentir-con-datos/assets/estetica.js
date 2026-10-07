/* La estética del taller de IA aplicada a la página: portada con pastilla y formas, franjas de acto,
   pastillas con el número de módulo, títulos que entran palabra por palabra, tarjetas que suben al
   aparecer y el índice de gráficos (las tarjetas de la portada de El Atlas). */
(function () {
  var moverse = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var observar = moverse && 'IntersectionObserver' in window;
  if (observar) { document.documentElement.classList.add('anima'); }

  function el(tag, attrs, hijos) {
    var n = document.createElement(tag);
    for (var k in (attrs || {})) { if (k === 'text') { n.textContent = attrs[k]; } else if (k === 'html') { n.innerHTML = attrs[k]; } else { n.setAttribute(k, attrs[k]); } }
    (hijos || []).forEach(function (h) { if (h) { n.appendChild(typeof h === 'string' ? document.createTextNode(h) : h); } });
    return n;
  }
  // El asterisco-flor de las diapositivas del taller
  var ASTERISCO = '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round">' +
    '<path d="M50 8 C62 30 62 30 50 50 C38 30 38 30 50 8Z"/><path d="M50 92 C62 70 62 70 50 50 C38 70 38 70 50 92Z"/>' +
    '<path d="M8 50 C30 38 30 38 50 50 C30 62 30 62 8 50Z"/><path d="M92 50 C70 38 70 38 50 50 C70 62 70 62 92 50Z"/>' +
    '<path d="M20 20 C40 28 40 28 50 50 C28 40 28 40 20 20Z"/><path d="M80 80 C60 72 60 72 50 50 C72 60 72 60 80 80Z"/>' +
    '<path d="M80 20 C72 40 72 40 50 50 C60 28 60 28 80 20Z"/><path d="M20 80 C28 60 28 60 50 50 C40 72 40 72 20 80Z"/></g></svg>';

  window.LaboAsterisco = ASTERISCO;   // lo usan las tapas del modo charla

  // ---------- Portada ----------
  var titulo = document.querySelector('#title-block-header .quarto-title');
  if (titulo) {
    var tag = el('div', { 'class': 'hero-tag', html: ASTERISCO + '<span>Laboratorio de Métodos Cuantitativos · FCE-UBA</span>' });
    titulo.insertBefore(tag, titulo.firstChild);
    var formas = el('div', { 'class': 'hero-formas', 'aria-hidden': 'true' }, ['f-circulo', 'f-cuadrado', 'f-cuadradito', 'f-arco'].map(function (c) { return el('span', { 'class': c }); }));
    document.getElementById('title-block-header').appendChild(formas);
  }

  // ---------- Franjas de acto: el h1 entra a la franja que viene del .qmd ----------
  document.querySelectorAll('.acto-banda').forEach(function (banda) {
    var sec = banda.closest('section.level1');
    var h1 = sec && sec.querySelector(':scope > h1');
    var interior = banda.querySelector('.acto-interior');
    if (!h1 || !interior) { return; }
    var texto = h1.firstChild && h1.firstChild.nodeType === 3 ? h1.firstChild : null;
    if (texto && texto.textContent.indexOf(' · ') > 0) { texto.textContent = texto.textContent.split(' · ').slice(1).join(' · '); }
    var pill = interior.querySelector('.acto-pill');
    var pillP = pill ? (pill.closest('p') || pill) : null;   // Pandoc envuelve la pastilla en un <p>
    interior.insertBefore(h1, pillP ? pillP.nextSibling : interior.firstChild);
    banda.insertBefore(el('span', { 'class': 'acto-deco asterisco', 'aria-hidden': 'true', html: ASTERISCO }), banda.firstChild);
    banda.insertBefore(el('span', { 'class': 'acto-deco cuadro', 'aria-hidden': 'true' }), banda.firstChild);
  });

  // ---------- Títulos de módulo: pastilla con el número y palabras sueltas para animarlas ----------
  document.querySelectorAll('main section.level2 > h2').forEach(function (h2) {
    var t = h2.firstChild;
    if (!t || t.nodeType !== 3) { return; }
    var m = /^\s*(\d+)\s·\s(.*)$/.exec(t.textContent);
    var resto = m ? m[2] : t.textContent;
    h2.setAttribute('data-titulo', resto.trim());
    var frag = document.createDocumentFragment();
    if (m) { h2.setAttribute('data-modulo', m[1]); frag.appendChild(el('span', { 'class': 'h2-num', text: 'Módulo ' + m[1] })); }
    resto.trim().split(/\s+/).forEach(function (pal, i) {
      if (i) { frag.appendChild(document.createTextNode(' ')); }
      var w = el('span', { 'class': 'w', text: pal }); w.style.setProperty('--i', i); frag.appendChild(w);
    });
    h2.replaceChild(frag, t);
  });

  // ---------- Entradas animadas ----------
  var io = observar ? new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) { return; }
      var n = e.target;
      n.classList.add('visible');
      io.unobserve(n);
      // En el modo charla las diapositivas animan sus gráficos al aparecer (charla.js)
      if (n.matches('figure.fig-atlas') && window.Labo && !n.closest('#mazo')) { setTimeout(function () { Labo.animarEntrada(n); }, 180); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }) : null;
  function preparar(sel, clase) {
    if (!io) { return; }
    document.querySelectorAll(sel).forEach(function (n) {
      if (n.classList.contains('visible')) { return; }
      n.classList.add(clase);
      if (clase === 'escalonado') { Array.prototype.forEach.call(n.children, function (h, i) { h.style.setProperty('--i', Math.min(i, 12)); }); }
      io.observe(n);
    });
  }
  preparar('.gancho, .pregunta, .adivina, .desafio, .charlalo, .antidoto, .pyme, .rio, .uso, details.receta-plegada', 'revelable');
  preparar('main section.level2 > h2', 'h2-anim');
  preparar('.recursos', 'escalonado');

  document.addEventListener('labo:montado', function () {
    preparar('figure.fig-atlas, .demo:not(.fig-atlas .demo)', 'revelable');
    armarIndice();
    if (io) { preparar('.indice-graficos', 'escalonado'); }
  });

  // ---------- Índice de gráficos (como la portada de El Atlas) ----------
  function armarIndice() {
    var dest = document.getElementById('indice-graficos');
    if (!dest || !window.Labo) { return; }
    var grilla = el('div', { 'class': 'indice-graficos' });
    Labo.figuras().forEach(function (fig) {
      var mini = el('div', { 'class': 'ig-mini', 'aria-hidden': 'true' });
      var svg = fig.querySelector('.demo-lienzo svg, .demo svg');
      var cv = fig.querySelector('canvas');
      if (svg) { var c = svg.cloneNode(true); c.removeAttribute('width'); c.removeAttribute('height'); c.style.width = '100%'; c.style.height = 'auto'; mini.appendChild(c); }
      else if (cv) { try { mini.appendChild(el('img', { src: cv.toDataURL('image/png'), alt: '' })); } catch (e) { /* sin miniatura */ } }
      if (!mini.firstChild) { mini.appendChild(el('span', { 'class': 'ig-vacio', html: ASTERISCO + '<b>Interactivo</b>Se arma cuando lo usás' })); }
      var u = fig._ui || {};
      grilla.appendChild(el('a', { 'class': 'ig-tarjeta', href: '#' + fig.id }, [
        mini,
        el('div', { 'class': 'ig-cuerpo' }, [
          el('span', { 'class': 'ig-num', text: 'Gráfico ' + fig.getAttribute('data-n') + (u.tema ? ' · ' + u.tema : '') }),
          el('span', { 'class': 'ig-titulo', text: u.titulo || '' }),
          el('span', { 'class': 'ig-ver', text: 'Ver gráfico →' })
        ])
      ]));
    });
    dest.appendChild(grilla);
  }
})();
