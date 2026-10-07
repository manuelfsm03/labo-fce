/* Módulo 8 · Paradoja de Simpson. Dos grupos (a y b) comparados en varias categorías: en el total gana uno,
   categoría por categoría gana el otro. Datos: [{cat, a_n, a_si, b_n, b_si}], con n intentos y si éxitos.
   Opciones: nombres [a, b], textos {medida, intentos, exitos, categoria, total, porcat} con {a} {b} {ta} {tb} {k} {n}. */
Labo.registrar('simpson', function (raiz, p) {
  var L = Labo, C = L.C, cats = p.datos, A = p.nombres[0], B = p.nombres[1], T = p.textos;
  var modo = 'total';
  var controles = L.el('div', { 'class': 'demo-controles' });
  var leyenda = L.el('div', { 'class': 'leyenda' }, [
    L.el('span', { 'class': 'ley-item' }, [L.el('i', { style: 'background:' + C.azul + ';border-radius:50%' }), A]),
    L.el('span', { 'class': 'ley-item' }, [L.el('i', { style: 'background:' + C.dorado + ';border-radius:50%' }), B])
  ]);
  var lienzo = L.el('div', { 'class': 'demo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(leyenda); raiz.appendChild(lienzo); raiz.appendChild(lectura);
  L.opciones(controles, {
    rotulo: 'Mirar', valor: modo,
    items: [{ valor: 'total', texto: 'Todo junto' }, { valor: 'cats', texto: 'Por ' + T.categoria.toLowerCase() }],
    alCambiar: function (v) { modo = v; dibujar(); }
  });
  var vTexto = L.el('span', { 'class': 'v' });
  lectura.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Conclusión' }), vTexto]));
  var filas = [];
  cats.forEach(function (d) {
    filas.push({ cat: d.cat, quien: A, n: d.a_n, si: d.a_si, tasa: 100 * d.a_si / d.a_n });
    filas.push({ cat: d.cat, quien: B, n: d.b_n, si: d.b_si, tasa: 100 * d.b_si / d.b_n });
  });
  var tot = [A, B].map(function (q) {
    var f = filas.filter(function (r) { return r.quien === q; });
    var n = d3.sum(f, function (r) { return r.n; }), si = d3.sum(f, function (r) { return r.si; });
    return { quien: q, n: n, si: si, tasa: 100 * si / n };
  });
  var color = function (q) { return q === A ? C.azul : C.dorado; };
  function rellenar(t, extra) {
    var r = t.replace(/\{a\}/g, A).replace(/\{b\}/g, B).replace('{ta}', L.pct(tot[0].tasa, 0)).replace('{tb}', L.pct(tot[1].tasa, 0));
    for (var k in (extra || {})) { r = r.replace('{' + k + '}', extra[k]); }
    return r;
  }
  var ml = Math.min(150, 16 + 7 * d3.max(cats, function (d) { return d.cat.length; }));
  var ancho = 640;
  function dibujar() {
    var g;
    if (modo === 'total') {
      g = L.plot({
        width: ancho, height: 180, marginLeft: Math.max(80, ml), marginRight: 60, marginBottom: 44,
        x: { domain: [0, 100], label: T.medida, labelAnchor: 'center', labelArrow: 'none', grid: true, tickFormat: function (v) { return v + '%'; } },
        y: { label: null, domain: [A, B], tickSize: 0 },
        marks: [
          Plot.barX(tot, { y: 'quien', x: 'tasa', fill: function (d) { return color(d.quien); }, insetTop: 12, insetBottom: 12, rx2: 4, title: function (d) { return d.quien + ': ' + L.num(d.si, 0) + ' ' + T.exitos + ' de ' + L.num(d.n, 0) + ' ' + T.intentos; }, tip: true }),
          Plot.text(tot, { y: 'quien', x: 'tasa', text: function (d) { return L.pct(d.tasa, 0); }, dx: 8, textAnchor: 'start', fontWeight: 600, fill: C.tinta }),
          Plot.ruleX([0], { stroke: C.eje })
        ]
      });
      vTexto.textContent = rellenar(T.total);
    } else {
      var maxN = d3.max(filas, function (r) { return r.n; });
      g = L.plot({
        width: ancho, height: 80 + 70 * cats.length, marginLeft: ml, marginRight: 30, marginBottom: 44,
        x: { domain: [0, 100], label: T.medida, labelAnchor: 'center', labelArrow: 'none', grid: true, tickFormat: function (v) { return v + '%'; } },
        y: { label: null, domain: cats.map(function (d) { return d.cat; }), tickSize: 0 },
        r: { domain: [0, maxN], range: [0, 16] },
        marks: [
          Plot.link(cats, { x1: function (d) { return 100 * d.a_si / d.a_n; }, x2: function (d) { return 100 * d.b_si / d.b_n; }, y1: 'cat', y2: 'cat', stroke: C.eje, strokeWidth: 2 }),
          Plot.dot(filas, { x: 'tasa', y: 'cat', r: 'n', fill: function (d) { return color(d.quien); }, fillOpacity: 0.9, stroke: C.papel, strokeWidth: 1.5, title: function (d) { return d.cat + ' · ' + d.quien + ': ' + L.pct(d.tasa, 0) + ' (' + L.num(d.si, 0) + ' ' + T.exitos + ' de ' + L.num(d.n, 0) + ' ' + T.intentos + ')'; }, tip: true })
        ]
      });
      var ganaB = cats.filter(function (d) { return d.b_si / d.b_n >= d.a_si / d.a_n; }).length;
      vTexto.textContent = rellenar(T.porcat, { k: ganaB, n: cats.length });
    }
    lienzo.textContent = '';
    lienzo.appendChild(g);
    raiz.setAttribute('data-modo', modo);
  }
  L.responsivo(lienzo, function (w) { ancho = w; dibujar(); });
  L.tabla(raiz, cats, [
    { titulo: T.categoria, valor: 'cat' },
    { titulo: A + ': ' + T.exitos + ' / ' + T.intentos, valor: function (d) { return d.a_si + ' / ' + d.a_n + ' (' + L.pct(100 * d.a_si / d.a_n, 0) + ')'; }, num: true },
    { titulo: B + ': ' + T.exitos + ' / ' + T.intentos, valor: function (d) { return d.b_si + ' / ' + d.b_n + ' (' + L.pct(100 * d.b_si / d.b_n, 0) + ')'; }, num: true }
  ]);
});
