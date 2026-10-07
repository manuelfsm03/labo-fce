/* Módulo 4 · Pictogramas. Si el dato crece ×k, una barra crece ×k, pero un ícono escalado crece ×k² en área.
   La solución honesta: apilar íconos iguales (como hacía el Isotype de Neurath). */
Labo.registrar('pictogramas', function (raiz, p) {
  var L = Labo, C = L.C, k = p.k || 2;
  var controles = L.el('div', { 'class': 'demo-controles' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(lienzo); raiz.appendChild(lectura);
  var ctl = L.rango(controles, { rotulo: 'El dato creció', min: 1, max: 3, paso: 0.01, valor: k, formato: function (v) { return '×' + L.num(v, 2); }, alCambiar: function (v) { k = v; dibujar(); } });
  L.boton(controles, 'Dato real: soja (×' + L.num(p.k, 2) + ')', function () { ctl.fijar(p.k); }, 'sec');
  var vBarra = L.el('span', { 'class': 'v grande' }), vIcono = L.el('span', { 'class': 'v grande' }), vPila = L.el('span', { 'class': 'v grande' });
  lectura.appendChild(L.el('div', { 'class': 'kpis' }, [
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Barra: el ojo lee' }), vBarra]),
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Bolsa agrandada: el ojo lee' }), vIcono]),
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Bolsas apiladas: el ojo lee' }), vPila])
  ]));

  // Bolsa de 40×48 (cuerpo + cuello atado + granos)
  function bolsa(g, x, y, s, recorte) {
    var b = g.append('g').attr('transform', 'translate(' + x + ',' + y + ') scale(' + s + ')');
    if (recorte != null && recorte < 1) {
      // El clipPath se interpreta en el sistema de coordenadas local de la bolsa (sin escalar)
      var id = 'rc' + Math.random().toString(36).slice(2, 8);
      b.append('clipPath').attr('id', id).append('rect').attr('x', 0).attr('y', 48 * (1 - recorte)).attr('width', 40).attr('height', 48 * recorte);
      b.attr('clip-path', 'url(#' + id + ')');
    }
    b.append('path').attr('d', 'M9,15 C4,21 2,31 4,40 C6,46 13,48 20,48 C27,48 34,46 36,40 C38,31 36,21 31,15 Z').attr('fill', C.dorado);
    b.append('path').attr('d', 'M13,6 L27,6 L31,15 L9,15 Z').attr('fill', '#9C6F17');
    b.append('rect').attr('x', 10).attr('y', 12.5).attr('width', 20).attr('height', 3).attr('rx', 1.5).attr('fill', '#6E4F10');
    [[15, 30], [24, 27], [20, 37]].forEach(function (c) { b.append('ellipse').attr('cx', c[0]).attr('cy', c[1]).attr('rx', 2.6).attr('ry', 2).attr('fill', '#F3E3B8'); });
  }
  var ancho = 640;
  function dibujar() {
    var w = ancho, col = w / 3, base = Math.min(52, col / 5.2), alto = base * 3 + 70;
    var svg = d3.create('svg').attr('viewBox', '0 0 ' + w + ' ' + alto).attr('width', w).attr('role', 'img')
      .attr('aria-label', 'Tres formas de dibujar un crecimiento de ×' + L.num(k, 2));
    var piso = alto - 34;
    ['Barras', 'Bolsa agrandada', 'Bolsas apiladas'].forEach(function (t, i) {
      var x0 = i * col + 10;
      svg.append('text').attr('x', x0).attr('y', 16).attr('font-weight', 600).attr('font-size', 13.5).attr('fill', C.tinta).text(t);
      svg.append('line').attr('x1', x0).attr('x2', x0 + col - 24).attr('y1', piso).attr('y2', piso).attr('stroke', C.eje);
      svg.append('text').attr('x', x0 + col * 0.2).attr('y', piso + 18).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', C.tinta2).text('antes');
      svg.append('text').attr('x', x0 + col * 0.6).attr('y', piso + 18).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', C.tinta2).text('después');
      var g = svg.append('g');
      var s1 = base / 48, xa = x0 + col * 0.2 - 20 * s1, xb = x0 + col * 0.6;
      if (i === 0) {
        var bw = Math.min(26, col * 0.16);
        g.append('rect').attr('x', x0 + col * 0.2 - bw / 2).attr('y', piso - base).attr('width', bw).attr('height', base).attr('fill', C.azul).attr('rx', 3);
        g.append('rect').attr('x', xb - bw / 2).attr('y', piso - base * k).attr('width', bw).attr('height', base * k).attr('fill', C.azul).attr('rx', 3);
      } else if (i === 1) {
        bolsa(g, xa, piso - base, s1);
        bolsa(g, xb - 20 * s1 * k, piso - base * k, s1 * k);
      } else {
        bolsa(g, xa, piso - base, s1);
        var enteras = Math.floor(k + 1e-9), resto = k - enteras;
        for (var j = 0; j < enteras; j++) { bolsa(g, xb - 20 * s1, piso - base * (j + 1), s1); }
        if (resto > 0.02) { bolsa(g, xb - 20 * s1, piso - base * (enteras + 1), s1, resto); }
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
