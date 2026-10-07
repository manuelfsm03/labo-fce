/* Módulo 10 · Paradoja de Simpson. Admisiones de posgrado de Berkeley, 1973 (los 6 departamentos más grandes):
   en el total los hombres entran más; departamento por departamento, las mujeres entran igual o más. */
Labo.registrar('simpson', function (raiz, p) {
  var L = Labo, C = L.C, deps = p.datos;
  var modo = 'total';
  var controles = L.el('div', { 'class': 'demo-controles' });
  var leyenda = L.el('div', { 'class': 'leyenda' }, [
    L.el('span', { 'class': 'ley-item' }, [L.el('i', { style: 'background:' + C.azul + ';border-radius:50%' }), 'Hombres']),
    L.el('span', { 'class': 'ley-item' }, [L.el('i', { style: 'background:' + C.dorado + ';border-radius:50%' }), 'Mujeres'])
  ]);
  var lienzo = L.el('div', { 'class': 'demo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(leyenda); raiz.appendChild(lienzo); raiz.appendChild(lectura);
  L.opciones(controles, {
    rotulo: 'Mirar', valor: modo,
    items: [{ valor: 'total', texto: 'Todo junto' }, { valor: 'deptos', texto: 'Por departamento' }],
    alCambiar: function (v) { modo = v; dibujar(); }
  });
  var vTexto = L.el('span', { 'class': 'v' });
  lectura.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Conclusión' }), vTexto]));
  var filas = [];
  deps.forEach(function (d) {
    filas.push({ depto: d.depto, sexo: 'Hombres', post: d.h_post, adm: d.h_adm, tasa: 100 * d.h_adm / d.h_post });
    filas.push({ depto: d.depto, sexo: 'Mujeres', post: d.m_post, adm: d.m_adm, tasa: 100 * d.m_adm / d.m_post });
  });
  var tot = ['Hombres', 'Mujeres'].map(function (s) {
    var f = filas.filter(function (r) { return r.sexo === s; });
    var post = d3.sum(f, function (r) { return r.post; }), adm = d3.sum(f, function (r) { return r.adm; });
    return { sexo: s, post: post, adm: adm, tasa: 100 * adm / post };
  });
  var color = function (s) { return s === 'Hombres' ? C.azul : C.dorado; };
  var ancho = 640;
  function dibujar() {
    var g;
    if (modo === 'total') {
      g = L.plot({
        width: ancho, height: 180, marginLeft: 80, marginRight: 60, marginBottom: 44,
        x: { domain: [0, 100], label: 'Porcentaje de admitidos', labelAnchor: 'center', labelArrow: 'none', grid: true, tickFormat: function (v) { return v + '%'; } },
        y: { label: null, domain: ['Hombres', 'Mujeres'], tickSize: 0 },
        marks: [
          Plot.barX(tot, { y: 'sexo', x: 'tasa', fill: function (d) { return color(d.sexo); }, insetTop: 12, insetBottom: 12, rx2: 4, title: function (d) { return d.sexo + ': ' + L.num(d.adm, 0) + ' admitidos de ' + L.num(d.post, 0) + ' postulantes'; }, tip: true }),
          Plot.text(tot, { y: 'sexo', x: 'tasa', text: function (d) { return L.pct(d.tasa, 0); }, dx: 8, textAnchor: 'start', fontWeight: 600, fill: C.tinta }),
          Plot.ruleX([0], { stroke: C.eje })
        ]
      });
      vTexto.textContent = 'Entran el ' + L.pct(tot[0].tasa, 0) + ' de los hombres y el ' + L.pct(tot[1].tasa, 0) + ' de las mujeres. Parece discriminación.';
    } else {
      var maxPost = d3.max(filas, function (r) { return r.post; });
      g = L.plot({
        width: ancho, height: 340, marginLeft: 110, marginRight: 30, marginBottom: 44,
        x: { domain: [0, 100], label: 'Porcentaje de admitidos', labelAnchor: 'center', labelArrow: 'none', grid: true, tickFormat: function (v) { return v + '%'; } },
        y: { label: null, domain: deps.map(function (d) { return d.depto; }), tickSize: 0, tickFormat: function (d) { return 'Departamento ' + d; } },
        r: { domain: [0, maxPost], range: [0, 16] },
        marks: [
          Plot.link(deps, { x1: function (d) { return 100 * d.h_adm / d.h_post; }, x2: function (d) { return 100 * d.m_adm / d.m_post; }, y1: 'depto', y2: 'depto', stroke: C.eje, strokeWidth: 2 }),
          Plot.dot(filas, { x: 'tasa', y: 'depto', r: 'post', fill: function (d) { return color(d.sexo); }, fillOpacity: 0.9, stroke: C.papel, strokeWidth: 1.5, title: function (d) { return 'Depto ' + d.depto + ' · ' + d.sexo + ': ' + L.pct(d.tasa, 0) + ' (' + L.num(d.post, 0) + ' postulantes)'; }, tip: true })
        ]
      });
      var ganan = deps.filter(function (d) { return d.m_adm / d.m_post >= d.h_adm / d.h_post; }).length;
      vTexto.textContent = 'En ' + ganan + ' de 6 departamentos las mujeres entran en igual o mayor proporción. El tamaño de cada punto es la cantidad de postulantes: ellas se anotaron más en los departamentos difíciles.';
    }
    lienzo.textContent = '';
    lienzo.appendChild(g);
    raiz.setAttribute('data-modo', modo);
  }
  L.responsivo(lienzo, function (w) { ancho = w; dibujar(); });
  L.tabla(raiz, deps, [
    { titulo: 'Departamento', valor: 'depto' },
    { titulo: 'Hombres: admitidos / postulantes', valor: function (d) { return d.h_adm + ' / ' + d.h_post + ' (' + L.pct(100 * d.h_adm / d.h_post, 0) + ')'; }, num: true },
    { titulo: 'Mujeres: admitidas / postulantes', valor: function (d) { return d.m_adm + ' / ' + d.m_post + ' (' + L.pct(100 * d.m_adm / d.m_post, 0) + ')'; }, num: true }
  ]);
});
