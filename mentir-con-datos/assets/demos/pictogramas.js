/* Módulo 13 · Pictogramas. Si el dato crece ×k, una barra crece ×k, pero un ícono escalado crece ×k² en área.
   La solución honesta: apilar íconos iguales (como hacía el Isotype de Neurath). El ícono es un alfajor. */
Labo.registrar('pictogramas', function (raiz, p) {
  var L = Labo, C = L.C, k = p.k || 2;
  var controles = L.el('div', { 'class': 'demo-controles' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(lienzo); raiz.appendChild(lectura);
  var ctl = L.rango(controles, { rotulo: 'El dato creció', min: 1, max: 3, paso: 0.01, valor: k, formato: function (v) { return '×' + L.num(v, 2); }, alCambiar: function (v) { k = v; dibujar(); } });
  L.boton(controles, (p.boton || 'Dato real') + ' (×' + L.num(p.k, 2) + ')', function () { ctl.fijar(p.k); }, 'sec');
  var vBarra = L.el('span', { 'class': 'v grande' }), vIcono = L.el('span', { 'class': 'v grande' }), vPila = L.el('span', { 'class': 'v grande' });
  lectura.appendChild(L.el('div', { 'class': 'kpis' }, [
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Barra: el ojo lee' }), vBarra]),
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Alfajor agrandado: el ojo lee' }), vIcono]),
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Alfajores apilados: el ojo lee' }), vPila])
  ]));

  // Alfajor en una caja de 40×28: el dibujo ocupa de y = 3 a y = 26 (23 de alto)
  var ARRIBA = 3, ALTO = 23;
  function alfajor(g, x, y, s, recorte) {
    var b = g.append('g').attr('transform', 'translate(' + x + ',' + y + ') scale(' + s + ')');
    if (recorte != null && recorte < 1) {
      // El clipPath se interpreta en el sistema de coordenadas local del alfajor (sin escalar): queda la parte de abajo
      var id = 'rc' + Math.random().toString(36).slice(2, 8);
      b.append('clipPath').attr('id', id).append('rect').attr('x', 0).attr('y', ARRIBA + ALTO * (1 - recorte)).attr('width', 40).attr('height', ALTO * recorte);
      b.attr('clip-path', 'url(#' + id + ')');
    }
    b.append('path').attr('d', 'M1,10 L1,19 A19,7 0 0 0 39,19 L39,10 Z').attr('fill', '#5C3A21');
    b.append('path').attr('d', 'M1,13.5 A19,7 0 0 0 39,13.5 L39,16 A19,7 0 0 1 1,16 Z').attr('fill', C.dorado);
    b.append('ellipse').attr('cx', 20).attr('cy', 10).attr('rx', 19).attr('ry', 7).attr('fill', '#7A4B2A');
    b.append('ellipse').attr('cx', 14).attr('cy', 8.2).attr('rx', 7).attr('ry', 2.2).attr('fill', '#96643C');
  }
  var ancho = 640;
  function dibujar() {
    // En pantallas angostas los tres paneles van uno debajo del otro
    var w = ancho, apilar = w < 520, col = apilar ? w : w / 3;
    var s1 = Math.min(1.3, col * 0.58 / 120);   // el alfajor agrandado ×3 tiene que entrar en su panel
    var base = ALTO * s1, altoPanel = base * 3 + 70;
    var svg = d3.create('svg').attr('viewBox', '0 0 ' + w + ' ' + altoPanel * (apilar ? 3 : 1)).attr('width', w).attr('role', 'img')
      .attr('aria-label', 'Tres formas de dibujar un crecimiento de ×' + L.num(k, 2) + ': barras, un alfajor agrandado y alfajores apilados');
    ['Barras', 'Agrandado', 'Apilados'].forEach(function (t, i) {
      var x0 = apilar ? 10 : i * col + 10, y0 = apilar ? i * altoPanel : 0, piso = y0 + altoPanel - 34;
      var xa = x0 + col * 0.17, xb = x0 + col * 0.36;
      var cb = i === 1 ? xb + 20 * s1 * k : xb + 20 * s1;
      svg.append('text').attr('x', x0).attr('y', y0 + 16).attr('font-weight', 600).attr('font-size', 13.5).attr('fill', C.tinta).text(t);
      svg.append('line').attr('x1', x0).attr('x2', x0 + col - 24).attr('y1', piso).attr('y2', piso).attr('stroke', C.eje);
      svg.append('text').attr('x', xa).attr('y', piso + 18).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', C.tinta2).text('antes');
      svg.append('text').attr('x', cb).attr('y', piso + 18).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', C.tinta2).text('después');
      var g = svg.append('g');
      if (i === 0) {
        var bw = Math.min(26, col * 0.16);
        g.append('rect').attr('x', xa - bw / 2).attr('y', piso - base).attr('width', bw).attr('height', base).attr('fill', C.azul).attr('rx', 3);
        g.append('rect').attr('x', cb - bw / 2).attr('y', piso - base * k).attr('width', bw).attr('height', base * k).attr('fill', C.azul).attr('rx', 3);
      } else if (i === 1) {
        alfajor(g, xa - 20 * s1, piso - (ARRIBA + ALTO) * s1, s1);
        alfajor(g, xb, piso - (ARRIBA + ALTO) * s1 * k, s1 * k);
      } else {
        alfajor(g, xa - 20 * s1, piso - (ARRIBA + ALTO) * s1, s1);
        var enteras = Math.floor(k + 1e-9), resto = k - enteras;
        for (var j = 0; j < enteras; j++) { alfajor(g, xb, piso - (ARRIBA + ALTO) * s1 - base * j, s1); }
        if (resto > 0.02) { alfajor(g, xb, piso - (ARRIBA + ALTO) * s1 - base * enteras, s1, resto); }
      }
    });
    lienzo.textContent = '';
    lienzo.appendChild(svg.node());
    vBarra.textContent = '×' + L.num(k, 2);
    vIcono.textContent = '×' + L.num(k * k, 2);
    vPila.textContent = '×' + L.num(k, 2);
    raiz.setAttribute('data-area', (k * k).toFixed(3));
  }
  L.responsivo(lienzo, function (w) { ancho = w; dibujar(); });
});
