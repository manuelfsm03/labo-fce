/* Módulo 6a · Doble eje. Salarios y dólar en un gráfico con dos ejes Y: moviendo el eje derecho, el alumno
   decide quién "gana". La versión honesta pone las dos series en base 100 sobre un solo eje. */
Labo.registrar('doble-eje', function (raiz, p) {
  var L = Labo, C = L.C;
  var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var datos = p.datos.map(function (d) { return { fecha: new Date(d.fecha + 'T00:00:00'), salarios: d.salarios, dolar: d.dolar }; });
  function mes(f) { return meses[f.getMonth()] + ' ' + String(f.getFullYear()).slice(2); }
  var sMin = d3.min(datos, function (d) { return d.salarios; }), sMax = d3.max(datos, function (d) { return d.salarios; });
  var dMin = d3.min(datos, function (d) { return d.dolar; }), dMax = d3.max(datos, function (d) { return d.dolar; });
  var izq = [sMin * 0.9, sMax * 1.04];
  var der = [Math.floor(dMin * 0.9 / 50) * 50, Math.ceil(dMax * 1.05 / 50) * 50];
  var modo = 'doble', base = 0;

  var controles = L.el('div', { 'class': 'demo-controles' });
  var extra = L.el('div', { 'class': 'demo-controles' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(extra); raiz.appendChild(lienzo); raiz.appendChild(lectura);
  L.opciones(controles, {
    rotulo: 'Gráfico', valor: modo,
    items: [{ valor: 'doble', texto: 'Dos ejes' }, { valor: 'base100', texto: 'Base 100, un eje' }],
    alCambiar: function (v) { modo = v; armarExtra(); redibujar(); }
  });
  var leyenda = L.el('div', { 'class': 'leyenda' }, [
    L.el('span', { 'class': 'ley-item' }, [L.el('i', { 'class': 'linea', style: 'background:' + C.azul }), 'Salarios registrados (índice)']),
    L.el('span', { 'class': 'ley-item' }, [L.el('i', { 'class': 'linea', style: 'background:' + C.dorado }), 'Dólar oficial ($)'])
  ]);
  raiz.insertBefore(leyenda, lienzo);
  var chip = L.el('span', { 'class': 'estado' }), conclusion = L.el('span', { 'class': 'v' });
  lectura.appendChild(chip);
  lectura.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Lo que parece' }), conclusion]));

  var piso = Math.max(0, Math.floor(dMin * 0.2 / 50) * 50), techo = Math.ceil(dMax * 2.2 / 100) * 100;
  function armarExtra() {
    extra.textContent = '';
    if (modo === 'doble') {
      var cMin = L.rango(extra, { rotulo: 'Eje del dólar: desde', min: piso, max: Math.floor(dMin), paso: 10, valor: der[0], formato: function (v) { return '$' + L.num(v, 0); }, alCambiar: function (v) { der[0] = v; redibujar(); } });
      var cMax = L.rango(extra, { rotulo: 'hasta', min: Math.ceil(dMax), max: techo, paso: 10, valor: der[1], formato: function (v) { return '$' + L.num(v, 0); }, alCambiar: function (v) { der[1] = v; redibujar(); } });
      var pres = L.el('div', { 'class': 'control seg' });
      extra.appendChild(pres);
      L.boton(pres, 'Que ganen los salarios', function () { cMin.fijar(piso); cMax.fijar(techo); }, 'sec');
      L.boton(pres, 'Que gane el dólar', function () { cMin.fijar(Math.floor(dMin / 10) * 10); cMax.fijar(Math.ceil(dMax / 10) * 10); }, 'sec');
    } else {
      L.rango(extra, { rotulo: 'Mes base (= 100)', min: 0, max: datos.length - 2, paso: 1, valor: base, formato: function (i) { return mes(datos[i].fecha); }, alCambiar: function (v) { base = v; redibujar(); } });
    }
  }
  armarExtra();

  var ancho = 640;
  function dibujar(w) {
    ancho = w;
    var g;
    var fin = datos[datos.length - 1];
    if (modo === 'doble') {
      var t = function (v) { return izq[0] + (v - der[0]) / (der[1] - der[0]) * (izq[1] - izq[0]); };
      var inv = function (y) { return der[0] + (y - izq[0]) / (izq[1] - izq[0]) * (der[1] - der[0]); };
      g = L.plot({
        width: w, height: Math.max(260, Math.min(360, w * 0.5)), marginLeft: 50, marginRight: 64, marginBottom: 32,
        x: { label: null, tickFormat: mes, ticks: 6 },
        y: { domain: izq, axis: null },
        marks: [
          Plot.gridY({ stroke: C.grilla, strokeOpacity: 1 }),
          Plot.axisY({ anchor: 'left', label: 'Salarios (índice)', labelAnchor: 'top', labelArrow: 'none', color: C.azul, tickFormat: function (v) { return L.num(v, 0); } }),
          Plot.axisY(d3.ticks(der[0], der[1], 5).map(t), { anchor: 'right', label: 'Dólar ($)', labelAnchor: 'top', labelArrow: 'none', color: C.dorado, tickFormat: function (v) { return '$' + L.num(inv(v), 0); } }),
          Plot.lineY(datos, { x: 'fecha', y: 'salarios', stroke: C.azul, strokeWidth: 2.2 }),
          Plot.lineY(datos, { x: 'fecha', y: function (d) { return t(d.dolar); }, stroke: C.dorado, strokeWidth: 2.2 }),
          Plot.tip(datos, Plot.pointerX({ x: 'fecha', y: 'salarios', title: function (d) { return mes(d.fecha) + ' · salarios ' + L.num(d.salarios, 0) + ' · dólar $' + L.num(d.dolar, 0); } }))
        ]
      });
      var arriba = fin.salarios > t(fin.dolar);
      L.estado(chip, 'trampa', 'Dos ejes: el cruce lo decide quien arma el gráfico');
      conclusion.textContent = arriba ? '«Los salarios le ganan al dólar»' : '«El dólar le gana a los salarios»';
      raiz.setAttribute('data-gana', arriba ? 'salarios' : 'dolar');
    } else {
      var b = datos[base];
      var serie = datos.slice(base).map(function (d) { return { fecha: d.fecha, salarios: 100 * d.salarios / b.salarios, dolar: 100 * d.dolar / b.dolar }; });
      var f = serie[serie.length - 1];
      g = L.plot({
        width: w, height: Math.max(260, Math.min(360, w * 0.5)), marginLeft: 50, marginRight: 110, marginBottom: 32,
        x: { label: null, tickFormat: mes, ticks: 6 },
        y: { label: 'Índice (' + mes(b.fecha) + ' = 100)', labelAnchor: 'top', labelArrow: 'none', grid: true, tickFormat: function (v) { return L.num(v, 0); } },
        marks: [
          Plot.ruleY([100], { stroke: C.eje }),
          Plot.lineY(serie, { x: 'fecha', y: 'salarios', stroke: C.azul, strokeWidth: 2.2 }),
          Plot.lineY(serie, { x: 'fecha', y: 'dolar', stroke: C.dorado, strokeWidth: 2.2 }),
          Plot.text([f], { x: 'fecha', y: 'salarios', text: function (d) { return 'Salarios ' + L.num(d.salarios, 0); }, dx: 6, textAnchor: 'start', fill: C.tinta, fontWeight: 600 }),
          Plot.text([f], { x: 'fecha', y: 'dolar', text: function (d) { return 'Dólar ' + L.num(d.dolar, 0); }, dx: 6, textAnchor: 'start', fill: C.tinta, fontWeight: 600 }),
          Plot.tip(serie, Plot.pointerX({ x: 'fecha', y: 'salarios', title: function (d) { return mes(d.fecha) + ' · salarios ' + L.num(d.salarios, 0) + ' · dólar ' + L.num(d.dolar, 0); } }))
        ]
      });
      var gana = f.salarios > f.dolar;
      L.estado(chip, 'honesto', 'Un solo eje, las dos series desde el mismo punto');
      conclusion.textContent = 'Desde ' + mes(b.fecha) + ': salarios ' + (f.salarios >= 100 ? '+' : '') + L.num(f.salarios - 100, 0) + '%, dólar ' + (f.dolar >= 100 ? '+' : '') + L.num(f.dolar - 100, 0) + '%. ' + (gana ? 'Ganan los salarios.' : 'Gana el dólar.');
      raiz.setAttribute('data-gana', gana ? 'salarios' : 'dolar');
    }
    lienzo.textContent = '';
    lienzo.appendChild(g);
  }
  function redibujar() { dibujar(ancho); }
  L.responsivo(lienzo, function (w) { ancho = w; redibujar(); });
  L.tabla(raiz, datos, [
    { titulo: 'Mes', valor: function (d) { return mes(d.fecha); } },
    { titulo: 'Índice de salarios registrados', valor: function (d) { return L.num(d.salarios, 1); }, num: true },
    { titulo: 'Dólar oficial (promedio, $)', valor: function (d) { return L.num(d.dolar, 1); }, num: true }
  ]);
});
