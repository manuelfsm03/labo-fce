/* Módulo 1 · Eje Y truncado. El alumno mueve dónde arranca el eje y ve cómo cambia la historia.
   Lie factor (Tufte) = efecto mostrado / efecto en los datos = B / (B − y0), con B la barra más baja comparada. */
Labo.registrar('eje-y', function (raiz, p) {
  var L = Labo, C = L.C, datos = p.datos, a = p.comparar[0], b = p.comparar[1];
  var A = datos.find(function (d) { return d.region === a; }).valor;
  var B = datos.find(function (d) { return d.region === b; }).valor;
  var minimo = Math.min.apply(null, datos.map(function (d) { return d.valor; }));
  var maximo = Math.max.apply(null, datos.map(function (d) { return d.valor; }));

  var controles = L.el('div', { 'class': 'demo-controles' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(lienzo); raiz.appendChild(lectura);

  var chip = L.el('span', { 'class': 'estado' });
  var vGrafico = L.el('span', { 'class': 'v' }), vDatos = L.el('span', { 'class': 'v' }), vLie = L.el('span', { 'class': 'v grande' });
  lectura.appendChild(L.el('div', { 'class': 'lectura-chip' }, [chip]));
  lectura.appendChild(L.el('div', { 'class': 'kpis' }, [
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'En el dibujo' }), vGrafico]),
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'En los datos' }), vDatos]),
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Lie factor' }), vLie])
  ]));

  var y0 = p.y0 != null ? p.y0 : 0;
  var tope = Math.floor((minimo - 0.05) * 20) / 20;
  var ctl = L.rango(controles, {
    rotulo: 'El eje Y arranca en', min: 0, max: tope, paso: 0.05, valor: y0,
    formato: function (v) { return L.pct(v, 2); },
    alCambiar: function (v) { y0 = v; redibujar(); }
  });
  L.boton(controles, 'Llevar a cero', function () { ctl.fijar(0); }, 'sec');

  var ancho = 640;
  function dibujar(w) {
    ancho = w;
    var n = datos.length, ml = 52, mr = 10;
    var banda = (w - ml - mr) / n;
    var inset = Math.max(2, (banda * 0.8 - 26) / 2);
    var grafico = L.plot({
      width: w, height: Math.max(260, Math.min(380, w * 0.5)),
      marginLeft: ml, marginRight: mr, marginBottom: 34,
      x: { domain: datos.map(function (d) { return d.region; }), label: null, padding: 0.2, tickSize: 0 },
      y: { domain: [y0, maximo + (maximo - y0) * 0.12], label: 'Variación mensual del IPC', labelAnchor: 'top', labelArrow: 'none', tickFormat: function (v) { return L.num(v, y0 > 0 ? 2 : 1) + '%'; }, ticks: 5, grid: true },
      marks: [
        Plot.barY(datos, {
          x: 'region', y1: function () { return y0; }, y2: 'valor', insetLeft: inset, insetRight: inset, ry2: 4,
          fill: function (d) { return p.comparar.indexOf(d.region) >= 0 ? C.azul : C.gris; },
          title: function (d) { return d.region + ': ' + L.pct(d.valor, 1); }, tip: true
        }),
        Plot.text(datos, { x: 'region', y: 'valor', dy: -9, text: function (d) { return L.pct(d.valor, 1); }, fill: C.tinta, fontWeight: 600 }),
        Plot.ruleY([y0], { stroke: C.eje })
      ]
    });
    lienzo.textContent = '';
    lienzo.appendChild(grafico);
  }
  function redibujar() {
    dibujar(ancho);
    var veces = (A - y0) / (B - y0), lie = B / (B - y0);
    vGrafico.textContent = a + ' se ve ×' + L.num(veces, 1) + ' más alta que ' + b;
    vDatos.textContent = L.pct(A, 1) + ' contra ' + L.pct(B, 1) + ': ×' + L.num(A / B, 2);
    vLie.textContent = L.num(lie, lie < 10 ? 1 : 0);
    if (y0 > 0) { L.estado(chip, 'trampa', 'Trampa: el eje arranca en ' + L.pct(y0, 2)); }
    else { L.estado(chip, 'honesto', 'Honesto: las barras arrancan en cero'); }
    raiz.setAttribute('data-lie', lie.toFixed(3));
  }
  L.responsivo(lienzo, function (w) { ancho = w; redibujar(); });
  L.tabla(raiz, datos, [{ titulo: 'Región', valor: 'region' }, { titulo: 'Variación mensual del IPC (' + p.mes + ')', valor: function (d) { return L.pct(d.valor, 1); }, num: true }]);
});
