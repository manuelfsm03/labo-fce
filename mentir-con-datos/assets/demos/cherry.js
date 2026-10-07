/* Módulo 12 · Cherry picking. La inflación mensual completa (INDEC) y una ventana elegible:
   arriba, como la mostraría un noticiero (solo la ventana, eje ajustado); abajo, toda la serie. */
Labo.registrar('cherry', function (raiz, p) {
  var L = Labo, C = L.C;
  var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var datos = p.datos.map(function (d, i) { return { i: i, fecha: new Date(d.fecha + 'T00:00:00'), v: d.v }; });
  function mes(f) { return meses[f.getMonth()] + ' ' + String(f.getFullYear()).slice(2); }
  function idx(s) { var f = new Date(s + 'T00:00:00').getTime(); var j = datos.findIndex(function (d) { return d.fecha.getTime() === f; }); return j < 0 ? 0 : j; }
  var desde = idx(p.inicial.desde), hasta = idx(p.inicial.hasta);
  var controles = L.el('div', { 'class': 'demo-controles columna' });
  var presets = L.el('div', { 'class': 'control seg' });
  var arriba = L.el('div', { 'class': 'demo-lienzo' });
  var abajo = L.el('div', { 'class': 'demo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(presets);
  raiz.appendChild(L.el('p', { 'class': 'demo-subtitulo', text: 'Como lo mostraría un noticiero' })); raiz.appendChild(arriba);
  raiz.appendChild(lectura);
  raiz.appendChild(L.el('p', { 'class': 'demo-subtitulo', text: 'Toda la serie (la ventana elegida, en azul)' })); raiz.appendChild(abajo);
  var cD = L.rango(controles, { rotulo: 'Desde', min: 0, max: datos.length - 2, paso: 1, valor: desde, formato: function (i) { return mes(datos[i].fecha); }, alCambiar: function (v) { desde = Math.min(v, hasta - 1); if (desde !== v) { cD.input.value = desde; } dibujar(); } });
  var cH = L.rango(controles, { rotulo: 'Hasta', min: 1, max: datos.length - 1, paso: 1, valor: hasta, formato: function (i) { return mes(datos[i].fecha); }, alCambiar: function (v) { hasta = Math.max(v, desde + 1); if (hasta !== v) { cH.input.value = hasta; } dibujar(); } });
  (p.presets || []).forEach(function (pr) {
    L.boton(presets, pr.nombre, function () { var a = idx(pr.desde), b = idx(pr.hasta); hasta = b; desde = a; cH.fijar(b); cD.fijar(a); }, 'sec');
  });
  var titular = L.el('span', { 'class': 'titular-demo' }), detalle = L.el('span', { 'class': 'v' });
  lectura.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'El titular' }), titular, detalle]));
  var ancho = 640;
  function dibujar() {
    var ventana = datos.slice(desde, hasta + 1), a = ventana[0], b = ventana[ventana.length - 1];
    var lo = d3.min(ventana, function (d) { return d.v; }), hi = d3.max(ventana, function (d) { return d.v; });
    var g1 = L.plot({
      width: ancho, height: Math.max(220, Math.min(300, ancho * 0.42)), marginLeft: 44, marginBottom: 30,
      x: { label: null, tickFormat: mes, ticks: 6 },
      y: { domain: [lo - (hi - lo) * 0.08, hi + (hi - lo) * 0.15], label: null, grid: true, tickFormat: function (v) { return L.num(v, 1) + '%'; } },
      marks: [
        Plot.areaY(ventana, { x: 'fecha', y1: lo - (hi - lo) * 0.08, y2: 'v', fill: C.azul, fillOpacity: 0.1 }),
        Plot.lineY(ventana, { x: 'fecha', y: 'v', stroke: C.azul, strokeWidth: 2.2 }),
        Plot.dot([a, b], { x: 'fecha', y: 'v', r: 4.5, fill: C.azul, stroke: C.papel, strokeWidth: 2 }),
        Plot.text([a, b], { x: 'fecha', y: 'v', text: function (d) { return L.pct(d.v, 1); }, dy: -12, fontWeight: 600, fill: C.tinta }),
        Plot.tip(ventana, Plot.pointerX({ x: 'fecha', y: 'v', title: function (d) { return mes(d.fecha) + ': ' + L.pct(d.v, 1); } }))
      ]
    });
    var g2 = L.plot({
      width: ancho, height: 170, marginLeft: 44, marginBottom: 30,
      x: { label: null, ticks: 8 },
      y: { type: 'log', domain: [0.9, 30], label: null, grid: true, ticks: [1, 3, 10, 25], tickFormat: function (v) { return L.num(v, 0) + '%'; } },
      marks: [
        Plot.rectX([0], { x1: a.fecha, x2: b.fecha, fill: C.azul, fillOpacity: 0.08 }),
        Plot.lineY(datos, { x: 'fecha', y: 'v', stroke: C.gris, strokeWidth: 1.4 }),
        Plot.lineY(ventana, { x: 'fecha', y: 'v', stroke: C.azul, strokeWidth: 2.2 })
      ]
    });
    arriba.textContent = ''; arriba.appendChild(g1);
    abajo.textContent = ''; abajo.appendChild(g2);
    var sube = b.v > a.v;
    titular.textContent = sube ? '«La inflación se disparó: pasó de ' + L.pct(a.v, 1) + ' a ' + L.pct(b.v, 1) + '»' : '«La inflación se desplomó: bajó de ' + L.pct(a.v, 1) + ' a ' + L.pct(b.v, 1) + '»';
    detalle.textContent = 'Ventana de ' + ventana.length + ' meses: de ' + mes(a.fecha) + ' a ' + mes(b.fecha) + '.';
    raiz.setAttribute('data-signo', sube ? 'sube' : 'baja');
    raiz.setAttribute('data-desde', mes(a.fecha)); raiz.setAttribute('data-hasta', mes(b.fecha));
  }
  L.responsivo(arriba, function (w) { ancho = w; dibujar(); });
});
