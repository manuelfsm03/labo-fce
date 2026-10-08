/* Módulo 5 · Ley de Goodhart. Desde que el gerente cobra un bono por cliente nuevo, el número de clientes nuevos
   sube y las ventas no: la relación que había entre los dos se desarma. Datos: [{fecha, clientes, ventas}] sin bono;
   opciones: desde (mes en que empieza el bono), peso (parte del bono que depende de los clientes nuevos, 0 a 1).
   El efecto del bono es la misma cuenta que en el .qmd: crece de a poco cada mes desde que arranca. */
Labo.registrar('goodhart', function (raiz, p) {
  var L = Labo, C = L.C;
  var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  function mes(f) { return meses[f.getMonth()] + ' ' + String(f.getFullYear()).slice(2); }
  var desde = new Date(p.desde + 'T00:00:00');
  var base = p.datos.map(function (d) { return { fecha: new Date(d.fecha + 'T00:00:00'), clientes0: d.clientes, ventas0: d.ventas }; });
  var i0 = base.findIndex(function (d) { return d.fecha >= desde; });
  var peso = p.peso != null ? p.peso : 0.6;

  var controles = L.el('div', { 'class': 'demo-controles' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(lienzo); raiz.appendChild(lectura);
  L.rango(controles, {
    rotulo: 'Parte del bono del gerente que depende de los clientes nuevos', min: 0, max: 100, paso: 5, valor: Math.round(peso * 100),
    formato: function (v) { return v + '%'; }, alCambiar: function (v) { peso = v / 100; dibujar(); }
  });
  var kpis = L.el('div', { 'class': 'kpis' });
  lectura.appendChild(kpis);

  function promedio(xs) { return d3.mean(xs); }
  function correlacion(a, b) {
    var ma = d3.mean(a), mb = d3.mean(b), sab = 0, saa = 0, sbb = 0;
    a.forEach(function (x, i) { sab += (x - ma) * (b[i] - mb); saa += (x - ma) * (x - ma); sbb += (b[i] - mb) * (b[i] - mb); });
    return saa && sbb ? sab / Math.sqrt(saa * sbb) : 0;
  }
  function calcular() {
    base.forEach(function (d, i) {
      var meses = i >= i0 ? i - i0 + 1 : 0;   // meses con bono
      d.clientes = d.clientes0 + peso * 22 * meses;
      d.ventas = d.ventas0 - peso * 7 * meses;
    });
    var antes = base.slice(0, i0), despues = base.slice(i0);
    var mc = promedio(antes.map(function (d) { return d.clientes; })), mv = promedio(antes.map(function (d) { return d.ventas; }));
    base.forEach(function (d) { d.iClientes = 100 * d.clientes / mc; d.iVentas = 100 * d.ventas / mv; });
    return { antes: antes, despues: despues };
  }

  var ancho = 640;
  function dibujar() {
    var r = calcular(), fin = base[base.length - 1];
    var series = [];
    base.forEach(function (d) {
      series.push({ fecha: d.fecha, v: d.iClientes, serie: 'Clientes nuevos (lo que paga el bono)' });
      series.push({ fecha: d.fecha, v: d.iVentas, serie: 'Ventas (lo que le importa a Marta)' });
    });
    var tope = Math.max(160, Math.ceil(d3.max(base, function (d) { return d.iClientes; }) / 50) * 50 + 30);
    var g = L.plot({
      width: ancho, height: L.alto(raiz, Math.max(250, Math.min(340, ancho * 0.48))), marginLeft: 46, marginRight: 150, marginBottom: 32,
      x: { label: null, tickFormat: mes, ticks: 6 },
      y: { label: 'Índice (promedio del año sin bono = 100)', labelAnchor: 'top', labelArrow: 'none', grid: true, domain: [0, tope], tickFormat: function (v) { return L.num(v, 0); } },
      color: { domain: ['Clientes nuevos (lo que paga el bono)', 'Ventas (lo que le importa a Marta)'], range: [C.ladrillo, C.azul] },
      marks: [
        Plot.rectX([{ a: desde, b: fin.fecha }], { x1: 'a', x2: 'b', fill: '#F1ECE0' }),
        Plot.ruleX([desde], { stroke: C.tinta3, strokeDasharray: '3,3' }),
        Plot.text([desde], { x: function (d) { return d; }, frameAnchor: 'top', dx: 6, dy: 4, textAnchor: 'start', text: function () { return 'Empieza el bono por cliente nuevo'; }, fill: C.tinta2, fontSize: 11, fontWeight: 600 }),
        Plot.ruleY([100], { stroke: C.eje }),
        Plot.lineY(series, { x: 'fecha', y: 'v', stroke: 'serie', strokeWidth: 2.2 }),
        Plot.text([fin], { x: 'fecha', y: 'iClientes', text: function (d) { return 'Clientes nuevos ' + L.num(d.iClientes, 0); }, dx: 8, textAnchor: 'start', fontWeight: 700, fill: C.ladrillo }),
        Plot.text([fin], { x: 'fecha', y: 'iVentas', text: function (d) { return 'Ventas ' + L.num(d.iVentas, 0); }, dx: 8, textAnchor: 'start', fontWeight: 700, fill: C.azul }),
        Plot.tip(base, Plot.pointerX({ x: 'fecha', y: 'iClientes', title: function (d) { return mes(d.fecha) + ' · ' + L.num(d.clientes, 0) + ' clientes nuevos · ' + L.num(d.ventas, 0) + ' mil alfajores'; } }))
      ]
    });
    lienzo.textContent = '';
    lienzo.appendChild(g);

    var cA = promedio(r.antes.map(function (d) { return d.clientes; })), cD = promedio(r.despues.map(function (d) { return d.clientes; }));
    var vA = promedio(r.antes.map(function (d) { return d.ventas; })), vD = promedio(r.despues.map(function (d) { return d.ventas; }));
    var rA = correlacion(r.antes.map(function (d) { return d.clientes; }), r.antes.map(function (d) { return d.ventas; }));
    var rD = correlacion(r.despues.map(function (d) { return d.clientes; }), r.despues.map(function (d) { return d.ventas; }));
    function kpi(k, v, nota) { return L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: k }), L.el('span', { 'class': 'v grande', text: v }), L.el('span', { 'class': 'v', text: nota })]); }
    kpis.textContent = '';
    kpis.appendChild(kpi('Clientes nuevos por mes', L.num(cA, 0) + ' → ' + L.num(cD, 0), 'sin bono → con bono'));
    kpis.appendChild(kpi('Ventas por mes', L.num(vA, 0) + ' → ' + L.num(vD, 0), 'miles de alfajores (' + (vD >= vA ? '+' : '−') + L.num(Math.abs(100 * (vD / vA - 1)), 0) + '%)'));
    kpis.appendChild(kpi('Correlación clientes–ventas', L.num(rA, 2) + ' → ' + L.num(rD, 2), rD < 0.3 ? 'el termómetro dejó de andar' : 'todavía se mueven juntos'));
    raiz.setAttribute('data-peso', peso.toFixed(2));
    raiz.setAttribute('data-r-antes', rA.toFixed(2));
    raiz.setAttribute('data-r-despues', rD.toFixed(2));
    tabla.actualizar(base);
  }
  var tabla = L.tabla(raiz, base, [
    { titulo: 'Mes', valor: function (d) { return mes(d.fecha); } },
    { titulo: 'Clientes nuevos', valor: function (d) { return L.num(d.clientes, 0); }, num: true },
    { titulo: 'Ventas (miles de alfajores)', valor: function (d) { return L.num(d.ventas, 0); }, num: true }
  ]);
  L.responsivo(lienzo, function (w) { ancho = w; dibujar(); });
});
