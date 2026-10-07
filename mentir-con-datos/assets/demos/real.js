/* Módulo 6b · Nominal vs real. El mismo salario en pesos corrientes y deflactado por el IPC. */
Labo.registrar('real', function (raiz, p) {
  var L = Labo, C = L.C;
  var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var datos = p.datos.map(function (d) { return { fecha: new Date(d.fecha + 'T00:00:00'), salarios: d.salarios, ipc: d.ipc }; });
  var b = datos[0];
  datos.forEach(function (d) { d.nominal = 100 * d.salarios / b.salarios; d.real = 100 * (d.salarios / d.ipc) / (b.salarios / b.ipc); });
  function mes(f) { return meses[f.getMonth()] + ' ' + String(f.getFullYear()).slice(2); }
  var modo = 'nominal';
  var controles = L.el('div', { 'class': 'demo-controles' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(lienzo); raiz.appendChild(lectura);
  L.opciones(controles, {
    rotulo: 'Salarios', valor: modo,
    items: [{ valor: 'nominal', texto: 'Nominales (pesos de cada mes)' }, { valor: 'real', texto: 'Reales (descontando la inflación)' }],
    alCambiar: function (v) { modo = v; dibujar(); }
  });
  var chip = L.el('span', { 'class': 'estado' }), titular = L.el('span', { 'class': 'v' });
  lectura.appendChild(chip);
  lectura.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Lo que dice el gráfico' }), titular]));
  var ancho = 640;
  function dibujar() {
    var campo = modo, fin = datos[datos.length - 1];
    var lo = d3.min(datos, function (d) { return d[campo]; });
    var g = L.plot({
      width: ancho, height: Math.max(250, Math.min(340, ancho * 0.48)), marginLeft: 46, marginRight: 70, marginBottom: 32,
      x: { label: null, tickFormat: mes, ticks: 6 },
      y: { label: 'Índice (' + mes(b.fecha) + ' = 100)', labelAnchor: 'top', labelArrow: 'none', grid: true, domain: modo === 'nominal' ? [0, 450] : [Math.floor(lo / 10) * 10 - 5, 125], tickFormat: function (v) { return L.num(v, 0); } },
      marks: [
        Plot.ruleY([100], { stroke: C.eje }),
        Plot.lineY(datos, { x: 'fecha', y: campo, stroke: modo === 'nominal' ? C.azul : C.verde, strokeWidth: 2.2 }),
        Plot.dot([fin], { x: 'fecha', y: campo, r: 4.5, fill: modo === 'nominal' ? C.azul : C.verde, stroke: C.papel, strokeWidth: 2 }),
        Plot.text([fin], { x: 'fecha', y: campo, text: function (d) { return L.num(d[campo], 0); }, dx: 8, textAnchor: 'start', fontWeight: 600, fill: C.tinta }),
        Plot.tip(datos, Plot.pointerX({ x: 'fecha', y: campo, title: function (d) { return mes(d.fecha) + ' · nominal ' + L.num(d.nominal, 0) + ' · real ' + L.num(d.real, 1); } }))
      ]
    });
    lienzo.textContent = '';
    lienzo.appendChild(g);
    var minReal = d3.least(datos, function (d) { return d.real; });
    if (modo === 'nominal') {
      L.estado(chip, 'trampa', 'En pesos de cada mes, con inflación');
      titular.textContent = '«Los salarios subieron ' + L.num(fin.nominal - 100, 0) + '% desde ' + mes(b.fecha) + '»';
    } else {
      L.estado(chip, 'honesto', 'Descontada la inflación: poder de compra');
      titular.textContent = 'En poder de compra: ' + (fin.real >= 100 ? '+' : '−') + L.num(Math.abs(fin.real - 100), 1) + '% desde ' + mes(b.fecha) + ' (llegó a caer ' + L.num(100 - minReal.real, 0) + '% en ' + mes(minReal.fecha) + ').';
    }
    raiz.setAttribute('data-modo', modo);
  }
  L.responsivo(lienzo, function (w) { ancho = w; dibujar(); });
  L.tabla(raiz, datos, [
    { titulo: 'Mes', valor: function (d) { return mes(d.fecha); } },
    { titulo: 'Salario nominal (' + mes(b.fecha) + ' = 100)', valor: function (d) { return L.num(d.nominal, 1); }, num: true },
    { titulo: 'Salario real (' + mes(b.fecha) + ' = 100)', valor: function (d) { return L.num(d.real, 1); }, num: true }
  ]);
});
