/* Módulo 5 · El promedio. Los 24 sueldos de la pyme, uno por barra: lo que se paga la dueña tira la media para arriba
   y la mediana casi ni se mueve. La barra de la dueña se corta arriba para que se vea el resto. */
Labo.registrar('promedio', function (raiz, p) {
  var L = Labo, C = L.C, gente = p.datos.slice(), duenia = p.duenia;
  var original = gente.find(function (d) { return d.quien === duenia; }).sueldo;
  var sueldoDuenia = original, incluir = true, TOPE = 5.4e6;
  var controles = L.el('div', { 'class': 'demo-controles' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(lienzo); raiz.appendChild(lectura);
  function m(v) { return '$' + L.num(v / 1e6, 2) + ' M'; }
  function millones(v) { return '$' + L.num(v / 1e6, 2) + ' millones'; }
  L.rango(controles, { rotulo: 'Lo que se paga la dueña por mes', min: 1.5e6, max: 40e6, paso: 0.5e6, valor: sueldoDuenia, formato: m, alCambiar: function (v) { sueldoDuenia = v; dibujar(); } });
  L.opciones(controles, {
    rotulo: 'Contar a la dueña', valor: true,
    items: [{ valor: true, texto: 'Sí' }, { valor: false, texto: 'No' }],
    alCambiar: function (v) { incluir = v; dibujar(); }
  });
  var vMedia = L.el('span', { 'class': 'v grande' }), vMediana = L.el('span', { 'class': 'v grande' }), vDebajo = L.el('span', { 'class': 'v grande' });
  lectura.appendChild(L.el('div', { 'class': 'kpis' }, [
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Promedio (media)' }), vMedia]),
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Mediana' }), vMediana]),
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Cobran menos que el promedio' }), vDebajo])
  ]));
  var ancho = 640;
  function dibujar() {
    var filas = gente.map(function (d) { return { quien: d.quien, sueldo: d.quien === duenia ? sueldoDuenia : d.sueldo, duenia: d.quien === duenia }; })
      .filter(function (d) { return incluir || !d.duenia; })
      .sort(function (a, b) { return a.sueldo - b.sueldo; });
    var media = d3.mean(filas, function (d) { return d.sueldo; }), mediana = d3.median(filas, function (d) { return d.sueldo; });
    var debajo = filas.filter(function (d) { return d.sueldo < media; }).length;
    var cortadas = filas.filter(function (d) { return d.sueldo > TOPE; });
    var g = L.plot({
      width: ancho, height: 280, marginLeft: 44, marginRight: 12, marginTop: 30, marginBottom: 26,
      x: { domain: filas.map(function (d) { return d.quien; }), axis: null, padding: 0.18 },
      y: { domain: [0, TOPE], label: 'Sueldo por mes (millones de pesos)', labelAnchor: 'top', labelArrow: 'none', grid: true, ticks: [0, 1e6, 2e6, 3e6, 4e6, 5e6], tickFormat: function (v) { return L.num(v / 1e6, 0); } },
      marks: [
        Plot.barY(filas, { x: 'quien', y: function (d) { return Math.min(d.sueldo, TOPE); }, fill: function (d) { return d.duenia ? C.dorado : C.gris; }, ry2: 3, title: function (d) { return d.quien + ': ' + millones(d.sueldo); }, tip: true }),
        Plot.text(cortadas, { x: 'quien', y: TOPE, text: function (d) { return '↑ ' + m(d.sueldo); }, dy: -10, textAnchor: 'end', dx: 8, fill: C.tinta, fontWeight: 600 }),
        Plot.ruleY([media], { stroke: C.ladrillo, strokeWidth: 2 }),
        Plot.ruleY([mediana], { stroke: C.azul, strokeWidth: 2 }),
        // La mediana se rotula a la izquierda y la media más al centro, para que no se pisen cuando están cerca
        Plot.text([media], { x: function () { return filas[Math.round(filas.length * 0.42)].quien; }, y: function (d) { return d; }, dy: -8, textAnchor: 'start', text: function () { return 'media ' + m(media); }, fill: C.ladrillo, fontWeight: 600, stroke: C.papel, strokeWidth: 3, paintOrder: 'stroke' }),
        Plot.text([mediana], { y: function (d) { return d; }, frameAnchor: 'left', dx: 4, dy: -8, textAnchor: 'start', text: function () { return 'mediana ' + m(mediana); }, fill: C.azul, fontWeight: 600, stroke: C.papel, strokeWidth: 3, paintOrder: 'stroke' }),
        Plot.ruleY([0], { stroke: C.eje })
      ]
    });
    lienzo.textContent = '';
    lienzo.appendChild(g);
    vMedia.textContent = millones(media);
    vMediana.textContent = millones(mediana);
    vDebajo.textContent = debajo + ' de ' + filas.length;
    raiz.setAttribute('data-media', media.toFixed(0));
    raiz.setAttribute('data-mediana', mediana.toFixed(0));
    raiz.setAttribute('data-debajo', debajo);
  }
  L.responsivo(lienzo, function (w) { ancho = w; dibujar(); });
  L.tabla(raiz, gente, [{ titulo: 'Quién', valor: 'quien' }, { titulo: 'Sueldo por mes (millones de pesos)', valor: function (d) { return L.num(d.sueldo / 1e6, 2); }, num: true }]);
});
