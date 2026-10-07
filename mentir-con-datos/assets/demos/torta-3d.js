/* Módulo 12 · La torta en 3D. Una "cámara" mira la torta desde arriba y en perspectiva: lo que queda cerca se ve
   más grande. Se calcula qué parte de la torta dibujada ocupa cada porción (área en pantalla) contra su dato real.
   Datos: [{nombre, valor}]. Opciones: giro (grados), inclinacion (grados), columna. */
Labo.registrar('torta-3d', function (raiz, p) {
  var L = Labo, C = L.C, datos = p.datos;
  var colores = [C.azul, C.ladrillo, C.verde, C.dorado, C.ciruela];
  var total = d3.sum(datos, function (d) { return d.valor; });
  var giro = p.giro != null ? p.giro : 0, incl = p.inclinacion || 24, modo = '3d';
  var D = 4.5, ESPESOR = 0.18;   // distancia de la cámara y espesor de la torta, en radios (igual que labo.torta_3d_svg)

  var controles = L.el('div', { 'class': 'demo-controles' });
  var cuerpo = L.el('div', { 'class': 't3d-cuerpo' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo t3d-lienzo' });
  var panel = L.el('div', { 'class': 'demo-lectura t3d-panel' });
  cuerpo.appendChild(lienzo); cuerpo.appendChild(panel);
  raiz.appendChild(controles); raiz.appendChild(cuerpo);
  L.opciones(controles, {
    rotulo: 'Ver como', valor: modo,
    items: [{ valor: '3d', texto: 'Torta 3D' }, { valor: 'plana', texto: 'Torta plana' }, { valor: 'barras', texto: 'Barras' }],
    alCambiar: function (v) { modo = v; dibujar(); }
  });
  var cGiro = L.rango(controles, { rotulo: 'Girar la torta', min: 0, max: 359, paso: 1, valor: giro, formato: function (v) { return v + '°'; }, alCambiar: function (v) { giro = v; dibujar(); } });
  L.rango(controles, { rotulo: 'Inclinación de la cámara', min: 12, max: 90, paso: 1, valor: incl, formato: function (v) { return v + '°'; }, alCambiar: function (v) { incl = v; dibujar(); } });

  var tablaKpi = L.el('div', { 'class': 'kpis' });
  panel.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Dato real → parte de la torta dibujada' })]));
  panel.appendChild(tablaKpi);

  // Porciones: ángulos de inicio y fin (en grados, antes de girar)
  var acum = 0;
  var porciones = datos.map(function (d, i) {
    var a0 = acum; acum += 360 * d.valor / total;
    return { nombre: d.nombre, valor: d.valor, a0: a0, a1: acum, color: colores[i % colores.length] };
  });

  // Proyección: el ángulo θ recorre la torta; sen θ > 0 es la mitad que mira a la cámara
  function proyectar(th, abajo, alfa) {
    var sa = Math.sin(alfa), ca = Math.cos(alfa);
    var x = Math.cos(th), z = Math.sin(th);
    var prof = z * ca - (abajo ? ESPESOR * sa : 0);       // cuánto se acerca a la cámara
    var s = D / (D - prof);
    var y = z * sa + (abajo ? ESPESOR * ca : 0);
    return [x * s, y * s];
  }
  function arco(t0, t1, abajo, alfa) {
    var pts = [], n = Math.max(2, Math.ceil(Math.abs(t1 - t0) / (Math.PI / 90)));
    for (var k = 0; k <= n; k++) { pts.push(proyectar(t0 + (t1 - t0) * k / n, abajo, alfa)); }
    return pts;
  }
  function area(pts) {
    var a = 0;
    for (var i = 0; i < pts.length; i++) { var j = (i + 1) % pts.length; a += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1]; }
    return Math.abs(a) / 2;
  }
  function oscurecer(c) { var x = d3.color(c); return x ? x.darker(0.9).formatHex() : c; }

  var ancho = 640;
  function dibujar() {
    var angosto = ancho < 600;
    cuerpo.classList.toggle('apilado', angosto);
    var w = angosto ? ancho : Math.floor(ancho * 0.58);
    lienzo.textContent = '';
    var alfa = (modo === 'plana' ? 90 : incl) * Math.PI / 180;
    var caras = porciones.map(function (q) {
      var t0 = (q.a0 + giro) * Math.PI / 180, t1 = (q.a1 + giro) * Math.PI / 180;
      var tapa = [[0, 0]].concat(arco(t0, t1, false, alfa));   // el centro de la tapa queda en el origen
      // Costado visible: la parte del borde que mira a la cámara (sen θ > 0)
      var costados = [];
      if (modo !== 'plana') {
        for (var vuelta = 0; vuelta <= 1; vuelta++) {
          var a = Math.max(t0, vuelta * 2 * Math.PI), b = Math.min(t1, vuelta * 2 * Math.PI + Math.PI);
          if (b > a + 1e-6) { costados.push(arco(a, b, false, alfa).concat(arco(b, a, true, alfa))); }
        }
      }
      var enPantalla = area(tapa) + d3.sum(costados, area);
      var frente = Math.sin((t0 + t1) / 2);
      return { q: q, tapa: tapa, costados: costados, area: enPantalla, frente: frente };
    });
    var totArea = d3.sum(caras, function (c) { return c.area; });
    caras.forEach(function (c) { c.parece = 100 * c.area / totArea; });

    if (modo === 'barras') {
      var g = L.plot({
        width: w, height: 60 + 46 * datos.length, marginLeft: 92, marginRight: 46,
        x: { domain: [0, 50], label: null, grid: true, ticks: 5, tickFormat: function (v) { return v + '%'; } },
        y: { domain: porciones.map(function (q) { return q.nombre; }), label: null, tickSize: 0 },
        marks: [
          Plot.barX(porciones, { y: 'nombre', x: 'valor', fill: function (d) { return d.color; }, insetTop: 7, insetBottom: 7, rx2: 4, title: function (d) { return d.nombre + ': ' + d.valor + '%'; }, tip: true }),
          Plot.text(porciones, { y: 'nombre', x: 'valor', text: function (d) { return d.valor + '%'; }, dx: 7, textAnchor: 'start', fontWeight: 700, fill: C.tinta }),
          Plot.ruleX([0], { stroke: C.eje })
        ]
      });
      lienzo.appendChild(g);
    } else {
      // A píxeles: el ancho de la torta ocupa el lienzo
      var todos = [];
      caras.forEach(function (c) { todos = todos.concat(c.tapa); c.costados.forEach(function (k) { todos = todos.concat(k); }); });
      var xs = todos.map(function (q) { return q[0]; }), ys = todos.map(function (q) { return q[1]; });
      var x0 = d3.min(xs), x1 = d3.max(xs), y0 = d3.min(ys), y1 = d3.max(ys);
      var esc = (w - 24) / (x1 - x0), alto = Math.ceil((y1 - y0) * esc) + 24;
      function px(q) { return [12 + (q[0] - x0) * esc, 12 + (q[1] - y0) * esc]; }
      var linea = d3.line();
      var svg = d3.create('svg').attr('viewBox', '0 0 ' + w + ' ' + alto).attr('width', w).attr('role', 'img')
        .attr('aria-label', modo === 'plana' ? 'Torta plana con las cuatro marcas' : 'Torta en 3D con las cuatro marcas, vista en perspectiva');
      // Primero los costados (de atrás hacia adelante), después las tapas
      caras.slice().sort(function (a, b) { return a.frente - b.frente; }).forEach(function (c) {
        c.costados.forEach(function (k) { svg.append('path').attr('d', linea(k.map(px)) + 'Z').attr('fill', oscurecer(c.q.color)).attr('stroke', C.papel).attr('stroke-width', 1); });
      });
      caras.forEach(function (c) {
        svg.append('path').attr('d', linea(c.tapa.map(px)) + 'Z').attr('fill', c.q.color).attr('stroke', C.papel).attr('stroke-width', 1.5)
          .append('title').text(c.q.nombre + ': ' + c.q.valor + '% (en pantalla ocupa ' + L.pct(c.parece, 0) + ')');
        if (modo === 'plana') {
          var mid = ((c.q.a0 + c.q.a1) / 2 + giro) * Math.PI / 180, pos = px(proyectar(mid, false, alfa).map(function (v) { return v * 0.62; }));
          svg.append('text').attr('x', pos[0]).attr('y', pos[1]).attr('text-anchor', 'middle').attr('dy', '.35em')
            .attr('fill', '#fff').attr('font-weight', 700).attr('font-size', 14).text(c.q.valor + '%');
        }
      });
      lienzo.appendChild(svg.node());
      lienzo.appendChild(L.el('div', { 'class': 'leyenda' }, porciones.map(function (q) { return L.el('span', { 'class': 'ley-item' }, [L.el('i', { style: 'background:' + q.color }), q.nombre]); })));
    }
    tablaKpi.textContent = '';
    caras.forEach(function (c) {
      var dif = c.parece - c.q.valor;
      tablaKpi.appendChild(L.el('div', { 'class': 'kpi' }, [
        L.el('span', { 'class': 'k', text: c.q.nombre }),
        L.el('span', { 'class': 'v grande', text: c.q.valor + '% → ' + (modo === 'barras' ? c.q.valor + '%' : L.pct(c.parece, 0)) }),
        L.el('span', { 'class': 'v', text: modo === 'barras' ? 'la barra mide lo mismo que el dato' : (Math.abs(dif) < 1.5 ? 'se ve como es' : (dif > 0 ? 'se ve ' + L.num(dif, 0) + ' puntos más grande' : 'se ve ' + L.num(-dif, 0) + ' puntos más chica')) })
      ]));
    });
    raiz.setAttribute('data-modo', modo);
    raiz.setAttribute('data-parece', caras[0].parece.toFixed(1));
    raiz.setAttribute('data-parece-ultima', caras[caras.length - 1].parece.toFixed(1));
  }
  L.responsivo(cuerpo, function (wd) { ancho = wd; dibujar(); });
  L.tabla(raiz, porciones, [{ titulo: p.columna || 'Categoría', valor: 'nombre' }, { titulo: 'Participación (%)', valor: function (d) { return d.valor + '%'; }, num: true }]);
});
