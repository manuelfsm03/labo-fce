/* Módulo 12 · Tortas. Dos repartos (inventados) con los datos dados vuelta: en torta casi no se nota, en barras sí.
   Opciones: categorias, columna (nombre de la categoría en la tabla). */
Labo.registrar('tortas', function (raiz, p) {
  var L = Labo, C = L.C, cats = p.categorias, encuestas = p.datos;
  var colores = [C.azul, C.dorado, C.verde, C.ciruela, C.ladrillo];
  var controles = L.el('div', { 'class': 'demo-controles' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo tortas-lienzo' });
  var leyenda = L.el('div', { 'class': 'leyenda' });
  raiz.appendChild(controles); raiz.appendChild(leyenda); raiz.appendChild(lienzo);
  cats.forEach(function (c, i) {
    leyenda.appendChild(L.el('span', { 'class': 'ley-item' }, [L.el('i', { style: 'background:' + colores[i] }), c]));
  });
  var modo = 'torta', numeros = false;
  L.opciones(controles, {
    rotulo: 'Ver como', valor: modo,
    items: [{ valor: 'torta', texto: 'Tortas' }, { valor: 'barras', texto: 'Barras' }],
    alCambiar: function (v) { modo = v; dibujar(); }
  });
  L.opciones(controles, {
    rotulo: 'Porcentajes', valor: false,
    items: [{ valor: false, texto: 'Sin escribir' }, { valor: true, texto: 'Escritos' }],
    alCambiar: function (v) { numeros = v; dibujar(); }
  });

  var NS = 'http://www.w3.org/2000/svg';
  function torta(valores, titulo, tam) {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + tam + ' ' + (tam + 30));
    svg.setAttribute('width', tam); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Torta ' + titulo);
    var g = d3.select(svg).append('g').attr('transform', 'translate(' + tam / 2 + ',' + (tam / 2 + 26) + ')');
    var arcos = d3.pie().sort(null)(valores);
    var r = tam / 2 - 6, arco = d3.arc().innerRadius(0).outerRadius(r), etiqueta = d3.arc().innerRadius(r * 0.62).outerRadius(r * 0.62);
    g.selectAll('path').data(arcos).join('path').attr('d', arco).attr('fill', function (d, i) { return colores[i]; })
      .attr('stroke', C.papel).attr('stroke-width', 2)
      .append('title').text(function (d, i) { return cats[i] + ': ' + d.data + '%'; });
    if (numeros) {
      g.selectAll('text').data(arcos).join('text').attr('transform', function (d) { return 'translate(' + etiqueta.centroid(d) + ')'; })
        .attr('text-anchor', 'middle').attr('dy', '.35em').attr('fill', '#fff').attr('font-weight', 600).attr('font-size', 13)
        .text(function (d) { return d.data + '%'; });
    }
    d3.select(svg).append('text').attr('x', 0).attr('y', 15).attr('font-weight', 600).attr('font-size', 14).attr('fill', C.tinta).text(titulo);
    return svg;
  }
  // Margen izquierdo según el rótulo más largo (unos 7 px por letra)
  var ml = Math.min(150, 14 + 7 * d3.max(cats, function (c) { return c.length; }));
  function barras(valores, titulo, w) {
    var filas = valores.map(function (v, i) { return { cat: cats[i], v: v, i: i }; });
    return L.plot({
      width: w, height: 230, marginLeft: ml, marginRight: 36, marginTop: 30,
      x: { domain: [0, 30], label: null, grid: true, ticks: 4, tickFormat: function (v) { return v + '%'; } },
      y: { domain: cats, label: null, tickSize: 0 },
      marks: [
        Plot.text([titulo], { frameAnchor: 'top-left', dx: 4 - ml, dy: -24, fontWeight: 600, fontSize: 14, fill: C.tinta }),
        Plot.barX(filas, { y: 'cat', x: 'v', fill: function (d) { return colores[d.i]; }, insetTop: 4, insetBottom: 4, rx2: 4, title: function (d) { return d.cat + ': ' + d.v + '%'; }, tip: true }),
        Plot.text(filas, { y: 'cat', x: 'v', text: function (d) { return numeros ? d.v + '%' : ''; }, dx: 6, textAnchor: 'start', fill: C.tinta, fontWeight: 600 }),
        Plot.ruleX([0], { stroke: C.eje })
      ]
    });
  }
  var ancho = 640;
  function dibujar() {
    lienzo.textContent = '';
    var dos = ancho > 560, w = dos ? Math.floor((ancho - 24) / 2) : ancho;
    encuestas.forEach(function (e) {
      var celda = L.el('div', { 'class': 'torta-celda' });
      celda.appendChild(modo === 'torta' ? torta(e.valores, e.titulo, Math.min(260, w)) : barras(e.valores, e.titulo, w));
      lienzo.appendChild(celda);
    });
    lienzo.style.gridTemplateColumns = dos ? '1fr 1fr' : '1fr';
    raiz.setAttribute('data-modo', modo);
  }
  L.responsivo(lienzo, function (w) { ancho = w; dibujar(); });
  L.tabla(raiz, cats.map(function (c, i) { return { c: c, a: encuestas[0].valores[i], b: encuestas[1].valores[i] }; }), [
    { titulo: p.columna || 'Categoría', valor: 'c' },
    { titulo: encuestas[0].titulo, valor: function (d) { return d.a + '%'; }, num: true },
    { titulo: encuestas[1].titulo, valor: function (d) { return d.b + '%'; }, num: true }
  ]);
});
