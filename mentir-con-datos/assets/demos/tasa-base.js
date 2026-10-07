/* Módulo 9 · Tasa base. 1.000 personas, un test que "acierta el 99%" y una enfermedad rara:
   de los que dan positivo, ¿cuántos están enfermos? */
Labo.registrar('tasa-base', function (raiz, p) {
  var L = Labo, C = L.C, N = 1000;
  var prev = p.prevalencia, sens = p.sensibilidad, espe = p.especificidad;
  var controles = L.el('div', { 'class': 'demo-controles columna' });
  var cuerpo = L.el('div', { 'class': 'tb-cuerpo' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo tb-lienzo' });
  var panel = L.el('div', { 'class': 'tb-panel' });
  cuerpo.appendChild(lienzo); cuerpo.appendChild(panel);
  raiz.appendChild(controles); raiz.appendChild(cuerpo);
  L.rango(controles, { rotulo: 'Prevalencia (cuántos la tienen)', min: 0.1, max: 30, paso: 0.1, valor: prev, formato: function (v) { return L.pct(v, 1); }, alCambiar: function (v) { prev = v; dibujar(); } });
  L.rango(controles, { rotulo: 'Sensibilidad (detecta enfermos)', min: 50, max: 100, paso: 0.5, valor: sens, formato: function (v) { return L.pct(v, 1); }, alCambiar: function (v) { sens = v; dibujar(); } });
  L.rango(controles, { rotulo: 'Especificidad (descarta sanos)', min: 50, max: 100, paso: 0.5, valor: espe, formato: function (v) { return L.pct(v, 1); }, alCambiar: function (v) { espe = v; dibujar(); } });

  var grupos = [
    { id: 'vp', nombre: 'Enfermos con positivo', color: C.ladrillo },
    { id: 'fp', nombre: 'Sanos con positivo (falsa alarma)', color: C.dorado },
    { id: 'fn', nombre: 'Enfermos con negativo', color: C.ciruela },
    { id: 'vn', nombre: 'Sanos con negativo', color: C.grisClaro }
  ];
  var vProb = L.el('span', { 'class': 'v grande' }), vCuenta = L.el('span', { 'class': 'v' });
  panel.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Si te dio positivo, chance de estar enfermo' }), vProb]));
  panel.appendChild(vCuenta);
  var ley = L.el('div', { 'class': 'leyenda vertical' });
  panel.appendChild(ley);
  var ancho = 640;
  function dibujar() {
    var enfermos = Math.round(N * prev / 100), sanos = N - enfermos;
    var vp = Math.round(enfermos * sens / 100), fn = enfermos - vp;
    var fp = Math.round(sanos * (1 - espe / 100)), vn = sanos - fp;
    var cuenta = { vp: vp, fp: fp, fn: fn, vn: vn };
    var celdas = [];
    grupos.forEach(function (g) { for (var i = 0; i < cuenta[g.id]; i++) { celdas.push(g); } });
    var angosto = ancho < 560;
    cuerpo.classList.toggle('apilado', angosto);
    var cols = 40, u = Math.max(6, Math.min(12, Math.floor((angosto ? ancho : ancho * 0.55) / cols)));
    var svg = d3.create('svg').attr('viewBox', '0 0 ' + cols * u + ' ' + 25 * u).attr('width', cols * u).attr('role', 'img').attr('aria-label', 'Mil personas según el resultado del test');
    svg.selectAll('rect').data(celdas).join('rect')
      .attr('x', function (d, i) { return (i % cols) * u; }).attr('y', function (d, i) { return Math.floor(i / cols) * u; })
      .attr('width', u - 1.5).attr('height', u - 1.5).attr('rx', 1.5).attr('fill', function (d) { return d.color; })
      .append('title').text(function (d) { return d.nombre; });
    lienzo.textContent = '';
    lienzo.appendChild(svg.node());
    var pos = vp + fp, prob = pos ? 100 * vp / pos : 0;
    vProb.textContent = L.pct(prob, 0);
    vCuenta.textContent = 'De 1.000 personas: ' + pos + ' dan positivo y solo ' + vp + ' de ellas están enfermas.';
    ley.textContent = '';
    grupos.forEach(function (g) { ley.appendChild(L.el('span', { 'class': 'ley-item' }, [L.el('i', { style: 'background:' + g.color }), g.nombre + ': ' + cuenta[g.id]])); });
    raiz.setAttribute('data-prob', prob.toFixed(1));
  }
  L.responsivo(cuerpo, function (w) { ancho = w; dibujar(); });
});
