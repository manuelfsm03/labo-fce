/* Módulo 2 · Totales acumulados. La misma inflación de 2024 mirada como acumulado en el año o mes a mes. */
Labo.registrar('acumulado', function (raiz, p) {
  var L = Labo, C = L.C;
  var datos = p.datos.map(function (d) { return { fecha: new Date(d.fecha + 'T00:00:00'), mensual: d.mensual, acumulada: d.acumulada }; });
  var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var controles = L.el('div', { 'class': 'demo-controles' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(lienzo); raiz.appendChild(lectura);
  var modo = 'acumulada';
  L.opciones(controles, {
    rotulo: 'Mostrar', valor: modo,
    items: [{ valor: 'acumulada', texto: 'Acumulada en el año' }, { valor: 'mensual', texto: 'Mes a mes' }],
    alCambiar: function (v) { modo = v; redibujar(); }
  });
  var chip = L.el('span', { 'class': 'estado' }), titular = L.el('span', { 'class': 'v' });
  lectura.appendChild(chip);
  lectura.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'El titular que sale' }), titular]));

  var primero = datos[0], ultimo = datos[datos.length - 1], ancho = 640;
  function dibujar(w) {
    ancho = w;
    var acum = modo === 'acumulada';
    var marcas = acum ? [
      Plot.areaY(datos, { x: 'fecha', y: 'acumulada', fill: C.azul, fillOpacity: 0.1, curve: 'monotone-x' }),
      Plot.lineY(datos, { x: 'fecha', y: 'acumulada', stroke: C.azul, strokeWidth: 2, curve: 'monotone-x' }),
      Plot.dot([primero, ultimo], { x: 'fecha', y: 'acumulada', fill: C.azul, r: 4.5, stroke: C.papel, strokeWidth: 2 }),
      Plot.text([primero, ultimo], { x: 'fecha', y: 'acumulada', text: function (d) { return L.pct(d.acumulada, 1); }, dy: -12, fontWeight: 600, fill: C.tinta }),
      Plot.tip(datos, Plot.pointerX({ x: 'fecha', y: 'acumulada', title: function (d) { return meses[d.fecha.getMonth()] + ' 2024 · acumulada ' + L.pct(d.acumulada, 1) + ' · del mes ' + L.pct(d.mensual, 1); } }))
    ] : [
      Plot.barY(datos, { x: 'fecha', y: 'mensual', fill: C.azul, insetLeft: 6, insetRight: 6, ry2: 4, title: function (d) { return meses[d.fecha.getMonth()] + ' 2024 · ' + L.pct(d.mensual, 1); }, tip: true }),
      Plot.text([primero, ultimo], { x: 'fecha', y: 'mensual', text: function (d) { return L.pct(d.mensual, 1); }, dy: -10, fontWeight: 600, fill: C.tinta }),
      Plot.ruleY([0], { stroke: C.eje })
    ];
    var spec = {
      width: w, height: Math.max(260, Math.min(360, w * 0.48)), marginLeft: 48, marginBottom: 32,
      y: { label: acum ? 'Inflación acumulada en 2024' : 'Inflación del mes', labelAnchor: 'top', labelArrow: 'none', grid: true, domain: [0, acum ? 130 : 25], tickFormat: function (v) { return L.num(v, 0) + '%'; } },
      marks: marcas
    };
    if (acum) { spec.x = { label: null, tickFormat: function (d) { return meses[d.getMonth()]; }, ticks: 12 }; }
    else { spec.x = { type: 'band', label: null, tickFormat: function (d) { return meses[new Date(d).getMonth()]; }, padding: 0.15 }; }
    var g = L.plot(spec);
    lienzo.textContent = '';
    lienzo.appendChild(g);
  }
  function redibujar() {
    dibujar(ancho);
    if (modo === 'acumulada') {
      L.estado(chip, 'trampa', 'Un acumulado solo puede subir');
      titular.textContent = '«La inflación no paró de subir en todo 2024: de ' + L.pct(primero.acumulada, 1) + ' a ' + L.pct(ultimo.acumulada, 1) + '»';
    } else {
      L.estado(chip, 'honesto', 'La velocidad: cuánto subió cada mes');
      titular.textContent = '«La inflación bajó todo el año: de ' + L.pct(primero.mensual, 1) + ' en enero a ' + L.pct(ultimo.mensual, 1) + ' en diciembre»';
    }
    raiz.setAttribute('data-modo', modo);
  }
  L.responsivo(lienzo, function (w) { ancho = w; redibujar(); });
  L.tabla(raiz, datos, [
    { titulo: 'Mes', valor: function (d) { return meses[d.fecha.getMonth()] + ' 2024'; } },
    { titulo: 'Inflación del mes', valor: function (d) { return L.pct(d.mensual, 1); }, num: true },
    { titulo: 'Acumulada en el año', valor: function (d) { return L.pct(d.acumulada, 1); }, num: true }
  ]);
});
