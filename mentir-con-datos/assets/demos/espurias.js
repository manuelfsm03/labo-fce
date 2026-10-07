/* Módulo 11 · Correlaciones espurias de fábrica. Dos caminatas aleatorias independientes suelen tener
   correlaciones altísimas (regresión espuria, Granger y Newbold 1974). Con ruido puro, casi nunca. */
Labo.registrar('espurias', function (raiz, p) {
  var L = Labo, C = L.C, T = p.largo || 30;
  var tipo = 'caminata';
  var controles = L.el('div', { 'class': 'demo-controles' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo' });
  var hist = L.el('div', { 'class': 'demo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(lienzo); raiz.appendChild(lectura); raiz.appendChild(hist);
  L.opciones(controles, {
    rotulo: 'Series', valor: tipo,
    items: [{ valor: 'caminata', texto: 'Caminatas aleatorias' }, { valor: 'ruido', texto: 'Ruido puro' }],
    alCambiar: function (v) { tipo = v; nuevo(); }
  });
  L.boton(controles, '🎲 Otro par', function () { nuevo(); });
  L.boton(controles, '🔎 La mejor de 1.000', function () { mejor(); }, 'sec');
  var vR = L.el('span', { 'class': 'v grande' }), vNota = L.el('span', { 'class': 'v' });
  lectura.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Correlación (r)' }), vR]));
  lectura.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Qué pasó' }), vNota]));

  function normal() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function serie() { var x = [], s = 0; for (var t = 0; t < T; t++) { var e = normal(); s = tipo === 'caminata' ? s + e : e; x.push(s); } return x; }
  function corr(a, b) {
    var ma = d3.mean(a), mb = d3.mean(b), sab = 0, saa = 0, sbb = 0;
    for (var i = 0; i < a.length; i++) { sab += (a[i] - ma) * (b[i] - mb); saa += (a[i] - ma) * (a[i] - ma); sbb += (b[i] - mb) * (b[i] - mb); }
    return sab / Math.sqrt(saa * sbb);
  }
  function z(a) { var m = d3.mean(a), s = d3.deviation(a) || 1; return a.map(function (v) { return (v - m) / s; }); }
  var par = null, rs = [], ancho = 640, nota = '';
  function distribucion() { rs = []; for (var i = 0; i < 1000; i++) { rs.push(corr(serie(), serie())); } }
  function nuevo() { distribucion(); par = [serie(), serie()]; nota = 'Dos series generadas al azar, sin ninguna relación entre sí.'; dibujar(); }
  function mejor() {
    var a = serie(), mejorB = null, mejorR = 0;
    for (var i = 0; i < 1000; i++) { var b = serie(), r = corr(a, b); if (Math.abs(r) > Math.abs(mejorR)) { mejorR = r; mejorB = b; } }
    if (mejorR < 0) { mejorB = mejorB.map(function (v) { return -v; }); }
    par = [a, mejorB]; nota = 'De 1.000 series al azar, la que más se parece a la azul. Así se "encuentran" correlaciones en un mar de datos.'; dibujar();
  }
  function dibujar() {
    var za = z(par[0]), zb = z(par[1]), r = corr(par[0], par[1]);
    var filas = [];
    za.forEach(function (v, t) { filas.push({ t: t + 1, v: v, s: 'A' }); filas.push({ t: t + 1, v: zb[t], s: 'B' }); });
    var g = L.plot({
      width: ancho, height: 240, marginLeft: 36, marginBottom: 34,
      x: { label: null },
      y: { label: 'Valor estandarizado', labelAnchor: 'top', labelArrow: 'none', grid: true },
      color: { domain: ['A', 'B'], range: [C.azul, C.dorado] },
      marks: [Plot.ruleY([0], { stroke: C.eje }), Plot.lineY(filas, { x: 't', y: 'v', stroke: 's', strokeWidth: 2 })]
    });
    lienzo.textContent = ''; lienzo.appendChild(g);
    var alto = rs.filter(function (x) { return Math.abs(x) > 0.5; }).length / rs.length * 100;
    var h = L.plot({
      width: ancho, height: 160, marginLeft: 36, marginBottom: 44,
      x: { domain: [-1, 1], label: 'r de 1.000 pares independientes', labelAnchor: 'center', labelArrow: 'none', tickFormat: function (v) { return L.num(v, 1); } },
      y: { label: null, axis: null },
      marks: [
        Plot.rectY(rs, Plot.binX({ y: 'count' }, { x: function (d) { return d; }, thresholds: d3.range(-1, 1.0001, 0.1), fill: function (d) { return Math.abs(d) > 0.5 ? C.dorado : C.gris; }, insetLeft: 1, insetRight: 1 })),
        Plot.ruleX([r], { stroke: C.ladrillo, strokeWidth: 2 }),
        Plot.text([r], { x: function (d) { return d; }, frameAnchor: 'top', dy: 2, text: function () { return 'este par'; }, fill: C.tinta, fontWeight: 600 }),
        Plot.ruleY([0], { stroke: C.eje })
      ]
    });
    hist.textContent = ''; hist.appendChild(h);
    hist.appendChild(L.el('p', { 'class': 'nota-hist', text: 'En dorado, los pares con |r| > 0,5: ' + L.pct(alto, 0) + ' de los casos' + (tipo === 'caminata' ? ', aunque ninguna serie tiene que ver con la otra.' : '.') }));
    vR.textContent = L.num(r, 2);
    vNota.textContent = nota;
    raiz.setAttribute('data-r', r.toFixed(3));
    raiz.setAttribute('data-alto', alto.toFixed(1));
  }
  L.responsivo(lienzo, function (w) { ancho = w; if (!par) { nuevo(); } else { dibujar(); } });
});
