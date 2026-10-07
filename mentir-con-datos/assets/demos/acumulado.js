/* Módulo 11 · Totales acumulados. La misma serie mirada como acumulado en el año o mes a mes.
   Opciones: anio, unidad (se agrega a los números) o formato 'miles', ejes {acumulada, mensual}, titulares {acumulada, mensual}
   con {a0} {a1} (primer y último acumulado) y {m0} {m1} (primer y último mes). */
Labo.registrar('acumulado', function (raiz, p) {
  var L = Labo, C = L.C;
  var datos = p.datos.map(function (d) { return { fecha: new Date(d.fecha + 'T00:00:00'), mensual: d.mensual, acumulada: d.acumulada }; });
  var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var unidad = p.unidad || '', dec = p.decimales == null ? 1 : p.decimales;
  // formato 'miles': los datos vienen en miles (480 → «480 mil», 3.700 → «3,7 millones»)
  function f(v) { return p.formato === 'miles' ? (v >= 1000 ? L.num(v / 1000, 1) + ' millones' : L.num(v, 0) + ' mil') : L.num(v, dec) + unidad; }
  var controles = L.el('div', { 'class': 'demo-controles' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(lienzo); raiz.appendChild(lectura);
  var modo = 'acumulada';
  L.opciones(controles, {
    rotulo: 'Mostrar', valor: modo,
    items: [{ valor: 'acumulada', texto: 'Acumulado en el año' }, { valor: 'mensual', texto: 'Mes a mes' }],
    alCambiar: function (v) { modo = v; redibujar(); }
  });
  var chip = L.el('span', { 'class': 'estado' }), titular = L.el('span', { 'class': 'v' });
  lectura.appendChild(chip);
  lectura.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'El titular que sale' }), titular]));

  var primero = datos[0], ultimo = datos[datos.length - 1], ancho = 640;
  var topeA = d3.max(datos, function (d) { return d.acumulada; }) * 1.15, topeM = d3.max(datos, function (d) { return d.mensual; }) * 1.2;
  function mesAnio(d) { return meses[d.fecha.getMonth()] + ' ' + p.anio; }
  function dibujar(w) {
    ancho = w;
    var acum = modo === 'acumulada';
    var marcas = acum ? [
      Plot.areaY(datos, { x: 'fecha', y: 'acumulada', fill: C.azul, fillOpacity: 0.1, curve: 'monotone-x' }),
      Plot.lineY(datos, { x: 'fecha', y: 'acumulada', stroke: C.azul, strokeWidth: 2, curve: 'monotone-x' }),
      Plot.dot([primero, ultimo], { x: 'fecha', y: 'acumulada', fill: C.azul, r: 4.5, stroke: C.papel, strokeWidth: 2 }),
      Plot.text([primero, ultimo], { x: 'fecha', y: 'acumulada', text: function (d) { return f(d.acumulada); }, dy: -12, fontWeight: 600, fill: C.tinta }),
      Plot.tip(datos, Plot.pointerX({ x: 'fecha', y: 'acumulada', title: function (d) { return mesAnio(d) + ' · acumulado ' + f(d.acumulada) + ' · del mes ' + f(d.mensual); } }))
    ] : [
      Plot.barY(datos, { x: 'fecha', y: 'mensual', fill: C.azul, insetLeft: 6, insetRight: 6, ry2: 4, title: function (d) { return mesAnio(d) + ' · ' + f(d.mensual); }, tip: true }),
      // Como en El Atlas: cada barra con su valor (si no entra, solo la primera y la última)
      w >= 480
        ? Plot.text(datos, { x: 'fecha', y: 'mensual', text: function (d) { return L.num(d.mensual, 0); }, dy: -9, fontWeight: 700, fill: C.tinta, stroke: C.papel, strokeWidth: 3, paintOrder: 'stroke' })
        : Plot.text([primero, ultimo], { x: 'fecha', y: 'mensual', text: function (d) { return f(d.mensual); }, dy: -10, fontWeight: 600, fill: C.tinta }),
      Plot.ruleY([0], { stroke: C.eje })
    ];
    var spec = {
      width: w, height: Math.max(260, Math.min(360, w * 0.48)), marginLeft: 52, marginBottom: 32,
      y: { label: acum ? p.ejes.acumulada : p.ejes.mensual, labelAnchor: 'top', labelArrow: 'none', grid: true, domain: [0, acum ? topeA : topeM], tickFormat: function (v) { return L.num(v, 0) + (unidad.trim() === '%' ? '%' : ''); } },
      marks: marcas
    };
    if (acum) { spec.x = { label: null, tickFormat: function (d) { return meses[d.getMonth()]; }, ticks: datos.length }; }
    else { spec.x = { type: 'band', label: null, tickFormat: function (d) { return meses[new Date(d).getMonth()]; }, padding: 0.15 }; }
    var g = L.plot(spec);
    lienzo.textContent = '';
    lienzo.appendChild(g);
  }
  function rellenar(t) {
    return t.replace('{a0}', f(primero.acumulada)).replace('{a1}', f(ultimo.acumulada))
      .replace('{m0}', f(primero.mensual)).replace('{m1}', f(ultimo.mensual));
  }
  function redibujar() {
    dibujar(ancho);
    if (modo === 'acumulada') {
      L.estado(chip, 'trampa', 'Un acumulado solo puede subir');
      titular.textContent = rellenar(p.titulares.acumulada);
    } else {
      L.estado(chip, 'honesto', 'La velocidad: cuánto pasó en cada mes');
      titular.textContent = rellenar(p.titulares.mensual);
    }
    raiz.setAttribute('data-modo', modo);
  }
  L.responsivo(lienzo, function (w) { ancho = w; redibujar(); });
  L.tabla(raiz, datos, [
    { titulo: 'Mes', valor: mesAnio },
    { titulo: p.ejes.mensual, valor: function (d) { return f(d.mensual); }, num: true },
    { titulo: p.ejes.acumulada, valor: function (d) { return f(d.acumulada); }, num: true }
  ]);
});
