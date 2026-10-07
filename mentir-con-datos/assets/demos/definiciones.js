/* Módulo 1 · Definiciones. 100 personas (números inventados con proporciones parecidas a la EPH):
   según a quién contemos como desocupado, la tasa de desocupación va de 7% a más de 20%. */
Labo.registrar('definiciones', function (raiz, p) {
  var L = Labo, C = L.C, grupos = p.grupos;
  var reglas = { pocas_horas: 'ocupado', plan: 'ocupado', desalentado: 'inactivo' };
  var controles = L.el('div', { 'class': 'demo-controles columna' });
  var cuerpo = L.el('div', { 'class': 'tb-cuerpo' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo tb-lienzo' });
  var panel = L.el('div', { 'class': 'tb-panel' });
  cuerpo.appendChild(lienzo); cuerpo.appendChild(panel);
  raiz.appendChild(controles); raiz.appendChild(cuerpo);
  function fila(rotulo, clave, opciones) {
    L.opciones(controles, { rotulo: rotulo, valor: reglas[clave], items: opciones, alCambiar: function (v) { reglas[clave] = v; dibujar(); } });
  }
  fila('Los que trabajaron solo unas horas:', 'pocas_horas', [{ valor: 'ocupado', texto: 'ocupados (INDEC)' }, { valor: 'desocupado', texto: 'desocupados' }]);
  fila('Los que cobran un plan con contraprestación:', 'plan', [{ valor: 'ocupado', texto: 'ocupados (INDEC)' }, { valor: 'desocupado', texto: 'desocupados' }]);
  fila('Los que quieren trabajar pero no buscaron:', 'desalentado', [{ valor: 'inactivo', texto: 'inactivos (INDEC)' }, { valor: 'desocupado', texto: 'desocupados' }]);
  var vTasa = L.el('span', { 'class': 'v grande' }), vDetalle = L.el('span', { 'class': 'v' });
  panel.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Tasa de desocupación' }), vTasa]));
  panel.appendChild(vDetalle);
  var ley = L.el('div', { 'class': 'leyenda vertical' }, [
    L.el('span', { 'class': 'ley-item' }, [L.el('i', { style: 'background:' + C.azul }), 'Ocupados']),
    L.el('span', { 'class': 'ley-item' }, [L.el('i', { style: 'background:' + C.ladrillo }), 'Desocupados']),
    L.el('span', { 'class': 'ley-item' }, [L.el('i', { style: 'background:' + C.grisClaro }), 'Inactivos (no cuentan)'])
  ]);
  panel.appendChild(ley);
  var colores = { ocupado: C.azul, desocupado: C.ladrillo, inactivo: C.grisClaro };
  var ancho = 640;
  function dibujar() {
    var personas = [];
    grupos.forEach(function (g) {
      var estado = g.regla ? reglas[g.regla] : g.estado;
      for (var i = 0; i < g.n; i++) { personas.push({ grupo: g.nombre, estado: estado }); }
    });
    var ocu = personas.filter(function (x) { return x.estado === 'ocupado'; }).length;
    var des = personas.filter(function (x) { return x.estado === 'desocupado'; }).length;
    var tasa = 100 * des / (ocu + des);
    var angosto = ancho < 560;
    cuerpo.classList.toggle('apilado', angosto);
    var cols = 10, u = Math.max(18, Math.min(30, Math.floor((angosto ? ancho : ancho * 0.5) / cols)));
    var svg = d3.create('svg').attr('viewBox', '0 0 ' + cols * u + ' ' + 10 * u).attr('width', cols * u).attr('role', 'img').attr('aria-label', 'Cien personas según su situación laboral');
    var g = svg.selectAll('g').data(personas).join('g').attr('transform', function (d, i) { return 'translate(' + (i % cols) * u + ',' + Math.floor(i / cols) * u + ')'; });
    g.append('circle').attr('cx', u / 2).attr('cy', u * 0.32).attr('r', u * 0.16).attr('fill', function (d) { return colores[d.estado]; });
    g.append('path').attr('d', 'M' + u * 0.22 + ',' + u * 0.86 + ' Q' + u * 0.5 + ',' + u * 0.3 + ' ' + u * 0.78 + ',' + u * 0.86 + ' Z').attr('fill', function (d) { return colores[d.estado]; });
    g.append('title').text(function (d) { return d.grupo + ' → ' + d.estado; });
    lienzo.textContent = ''; lienzo.appendChild(svg.node());
    vTasa.textContent = L.pct(tasa, 1);
    vDetalle.textContent = des + ' desocupados sobre ' + (ocu + des) + ' personas activas (ocupados + desocupados).';
    raiz.setAttribute('data-tasa', tasa.toFixed(1));
  }
  L.responsivo(cuerpo, function (w) { ancho = w; dibujar(); });
});
