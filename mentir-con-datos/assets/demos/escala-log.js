/* Módulo 15b · Escala lineal vs logarítmica. El dólar oficial desde 1992: en escala lineal 2002 no existe;
   en escala log, la misma distancia vertical es el mismo porcentaje y 2002 aparece como el salto más grande. */
Labo.registrar('escala-log', function (raiz, p) {
  var L = Labo, C = L.C;
  var datos = p.datos.map(function (d) { return { fecha: new Date(d.fecha + 'T00:00:00'), dolar: d.dolar }; });
  var episodios = p.episodios.map(function (e) { return { desde: new Date(e.desde + 'T00:00:00'), hasta: new Date(e.hasta + 'T00:00:00'), veces: e.veces, rotulo: e.rotulo, v0: e.v0, v1: e.v1, lado: e.lado }; });
  var escala = 'linear';
  var controles = L.el('div', { 'class': 'demo-controles' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(lienzo); raiz.appendChild(lectura);
  L.opciones(controles, {
    rotulo: 'Escala del eje Y', valor: escala,
    items: [{ valor: 'linear', texto: 'Lineal' }, { valor: 'log', texto: 'Logarítmica' }],
    alCambiar: function (v) { escala = v; redibujar(); }
  });
  var nota = L.el('span', { 'class': 'v' });
  lectura.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Qué se ve' }), nota]));
  var ancho = 640;
  function dibujar(w) {
    ancho = w;
    var log = escala === 'log';
    var g = L.plot({
      width: w, height: Math.max(280, Math.min(380, w * 0.52)), marginLeft: 56, marginBottom: 30, marginTop: 30,
      x: { label: null, ticks: 8 },
      y: {
        type: log ? 'log' : 'linear', domain: log ? [0.7, 2500] : [0, 1600], grid: true,
        label: 'Pesos por dólar' + (log ? ' (escala logarítmica)' : ''), labelAnchor: 'top', labelArrow: 'none',
        ticks: log ? [1, 10, 100, 1000] : 8, tickFormat: function (v) { return '$' + L.num(v, 0); }
      },
      marks: L.franjas(p.periodos, datos[0].fecha, datos[datos.length - 1].fecha, w - 56).concat([
        Plot.rectX(episodios, { x1: 'desde', x2: 'hasta', fill: C.dorado, fillOpacity: 0.2 }),
        Plot.lineY(datos, { x: 'fecha', y: 'dolar', stroke: C.azul, strokeWidth: 1.8 }),
        Plot.text(episodios.filter(function (e) { return e.lado !== 'izq'; }), { x: 'hasta', y: 'v1', text: function (e) { return e.rotulo + ': ×' + L.num(e.veces, 2); }, dx: 6, dy: -10, textAnchor: 'start', fontWeight: 600, fill: C.tinta }),
        Plot.text(episodios.filter(function (e) { return e.lado === 'izq'; }), { x: 'desde', y: 'v1', text: function (e) { return e.rotulo + ': ×' + L.num(e.veces, 2); }, dx: -8, dy: -4, textAnchor: 'end', fontWeight: 600, fill: C.tinta }),
        Plot.tip(datos, Plot.pointerX({ x: 'fecha', y: 'dolar', title: function (d) { return d.fecha.getFullYear() + '-' + String(d.fecha.getMonth() + 1).padStart(2, '0') + ' · $' + L.num(d.dolar, 2); } }))
      ])
    });
    lienzo.textContent = '';
    lienzo.appendChild(g);
  }
  function redibujar() {
    dibujar(ancho);
    nota.textContent = escala === 'log'
      ? 'Cada línea de la grilla es ×10: la misma suba en porcentaje mide lo mismo en cualquier año. Y ahí aparece que el salto de 2002 fue más grande que el de 2023-24.'
      : 'Todo lo anterior a 2018 parece plano. La salida de la convertibilidad (de $1 a $3,65) ni se ve.';
    raiz.setAttribute('data-escala', escala);
  }
  L.responsivo(lienzo, function (w) { ancho = w; redibujar(); });
});
