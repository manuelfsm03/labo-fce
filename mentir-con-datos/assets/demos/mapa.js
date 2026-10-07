/* Módulo 14 · Superficie no es gente. El mapa de celdas de Argentina de la home (una celda ≈ 90 km de lado):
   el alumno pinta provincias y compara qué parte del territorio y qué parte de la población pintó. */
Labo.registrar('mapa', function (raiz, p) {
  var L = Labo, C = L.C;
  // Grilla rasterizada de los límites de INDEC/IGN (mgaitan/departamentos_argentina), la misma de manuelfsm03.github.io
  var FILAS = [
    "...........QQ", "........JJQQQI", "........JJQQQI", ".......QJJJQQIII", "......QQQQQQQDDII", "......CCQQQQDDDDIII",
    "......CCQQQVVVDDIII...N", "......CCCXXVVVDDDD....N", "......CCCXVVVVDDDDF..NN", ".....LCCCCVVVVUUUFFFF", ".....LLLLCVVVVUUUFFFF",
    "....RRLLLCVVVVUUUFFF", "....RRRLLLGGGVUUUFF", "....RRRRLGGGGGUUUHH", "....RRRRLGGGGGUUHH", "....RRRSSSGGGGUHHH",
    "....MMMMSSGGGGUHHH", ".....MMMSSGGGGUUHH", ".....MMMSSGGGUAAAA", "....MMMMSSGGAAAAAB", "....MMMMSSKKAAAAAAA",
    "....MMKKKKKKAAAAAAA", "...OMMKKKKKKAAAAAAAA", "...OOOKKKKKKAAAAAAAA", "...OOOPKKKKKAAAAAAA", "...OOOOPPKKKAAAAA",
    "...OOOPPPPPPAA", "..OOPPPPPPPPA", "..OPPPPPPP.PP", "..PPPPPPPP", "..EEEEEEEE.E", "..EEEEEEEE.E", "..EEEEEEEE",
    "..EEEEEEEE", "..EEEEEEE", "...EEEEE", "..TTTTT", "..TTTTTT", "..TTTTTTT", "..TTTTTTT", ".TTTTTTT", "TTTTTTT", "TTTTTT",
    "..TTT", "..TTTT..........WWW", ".....T.........W", "", "......W", "......WW", ".......WWW"
  ];
  var prov = {}, totPob = 0, totSup = 0;
  p.datos.forEach(function (d) { prov[d.codigo] = d; totPob += d.poblacion_2022; totSup += d.superficie_km2; });
  var pintadas = {};
  (p.inicial || []).forEach(function (c) { pintadas[c] = true; });
  var vista = 'mapa';

  var controles = L.el('div', { 'class': 'demo-controles' });
  var cuerpo = L.el('div', { 'class': 'mapa-cuerpo' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo mapa-lienzo' });
  var panel = L.el('div', { 'class': 'mapa-panel' });
  cuerpo.appendChild(lienzo); cuerpo.appendChild(panel);
  raiz.appendChild(controles); raiz.appendChild(cuerpo);
  L.opciones(controles, {
    rotulo: 'Ver', valor: vista,
    items: [{ valor: 'mapa', texto: 'Territorio' }, { valor: 'gente', texto: 'Gente' }],
    alCambiar: function (v) { vista = v; dibujar(); }
  });
  var botones = L.el('div', { 'class': 'control seg' });
  controles.appendChild(botones);
  function preset(lista) { pintadas = {}; lista.forEach(function (c) { pintadas[c] = true; }); dibujar(); }
  var porPob = Object.keys(prov).sort(function (a, b) { return prov[a].poblacion_2022 - prov[b].poblacion_2022; });
  L.boton(botones, 'Las 19 menos pobladas', function () { preset(porPob.slice(0, 19)); }, 'sec');
  L.boton(botones, 'Las 5 más pobladas', function () { preset(porPob.slice(19)); }, 'sec');
  L.boton(botones, 'Borrar', function () { preset([]); }, 'sec');

  var vSup = L.el('span', { 'class': 'v grande' }), vPob = L.el('span', { 'class': 'v grande' }), lista = L.el('p', { 'class': 'mapa-lista' });
  panel.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Del territorio pintado' }), vSup]));
  panel.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'De la gente pintada' }), vPob]));
  panel.appendChild(L.el('p', { 'class': 'mapa-ayuda', text: 'Tocá una provincia para pintarla o despintarla.' }));
  panel.appendChild(lista);

  var ancho = 640;
  function dibujar() {
    var sup = 0, pob = 0, nombres = [];
    Object.keys(pintadas).forEach(function (c) { if (pintadas[c]) { sup += prov[c].superficie_km2; pob += prov[c].poblacion_2022; nombres.push(prov[c].provincia); } });
    vSup.textContent = L.pct(100 * sup / totSup, 0);
    vPob.textContent = L.pct(100 * pob / totPob, 0);
    lista.textContent = nombres.length ? 'Pintadas: ' + nombres.join(', ') + '.' : 'No hay nada pintado.';
    raiz.setAttribute('data-sup', (100 * sup / totSup).toFixed(1));
    raiz.setAttribute('data-pob', (100 * pob / totPob).toFixed(1));
    lienzo.textContent = '';
    lienzo.appendChild(vista === 'mapa' ? dibujarMapa() : dibujarGente());
  }
  function color(c) { return pintadas[c] ? C.verde : C.grisClaro; }
  function dibujarMapa() {
    var alto = L.alto(raiz, Math.min(560, Math.max(380, ancho * 0.9))), filas = FILAS.length, celda = Math.floor(alto / filas), u = celda;
    var w = 24 * u, h = filas * u;
    var svg = d3.create('svg').attr('viewBox', '0 0 ' + w + ' ' + h).attr('width', w).attr('role', 'img').attr('aria-label', 'Mapa de celdas de Argentina por provincia');
    var grupos = {};
    FILAS.forEach(function (fila, r) {
      for (var cI = 0; cI < fila.length; cI++) {
        var k = fila.charAt(cI);
        if (k === '.' || !prov[k]) { continue; }
        if (!grupos[k]) {
          grupos[k] = svg.append('g').attr('class', 'prov').attr('data-codigo', k).attr('fill', color(k)).attr('tabindex', 0).attr('role', 'button')
            .attr('aria-pressed', String(!!pintadas[k])).attr('aria-label', prov[k].provincia);
          grupos[k].append('title').text(prov[k].provincia + ' · ' + L.num(prov[k].poblacion_2022 / 1e6, 2) + ' M de personas · ' + L.num(prov[k].superficie_km2, 0) + ' km²');
        }
        grupos[k].append('rect').attr('x', cI * u).attr('y', r * u).attr('width', u - 1).attr('height', u - 1);
      }
    });
    svg.selectAll('g.prov').on('click', function () { var k = this.getAttribute('data-codigo'); pintadas[k] = !pintadas[k]; dibujar(); })
      .on('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.dispatchEvent(new MouseEvent('click')); } });
    return svg.node();
  }
  function dibujarGente() {
    // 1 cuadradito = 100.000 personas; primero las provincias pintadas
    var orden = Object.keys(prov).sort(function (a, b) { return (pintadas[b] ? 1 : 0) - (pintadas[a] ? 1 : 0) || prov[b].poblacion_2022 - prov[a].poblacion_2022; });
    var cuadros = [];
    orden.forEach(function (k) { var n = Math.round(prov[k].poblacion_2022 / 1e5); for (var i = 0; i < n; i++) { cuadros.push(k); } });
    var cols = 20, u = Math.max(9, Math.min(15, Math.floor((Math.min(ancho, 420)) / cols)));
    var filas = Math.ceil(cuadros.length / cols), svg = d3.create('svg').attr('viewBox', '0 0 ' + cols * u + ' ' + (filas * u + 22)).attr('width', cols * u)
      .attr('role', 'img').attr('aria-label', 'Población: un cuadradito cada 100.000 personas');
    svg.append('text').attr('x', 0).attr('y', 13).attr('font-size', 12).attr('fill', C.tinta2).text('1 cuadradito = 100.000 personas');
    svg.selectAll('rect').data(cuadros).join('rect')
      .attr('x', function (d, i) { return (i % cols) * u; }).attr('y', function (d, i) { return 22 + Math.floor(i / cols) * u; })
      .attr('width', u - 2).attr('height', u - 2).attr('rx', 1.5).attr('fill', function (d) { return color(d); })
      .append('title').text(function (d) { return prov[d].provincia; });
    return svg.node();
  }
  L.responsivo(cuerpo, function (w) { ancho = w; dibujar(); });
  L.tabla(raiz, p.datos.slice().sort(function (a, b) { return b.poblacion_2022 - a.poblacion_2022; }), [
    { titulo: 'Jurisdicción', valor: 'provincia' },
    { titulo: 'Población (Censo 2022)', valor: function (d) { return L.num(d.poblacion_2022, 0); }, num: true },
    { titulo: '% de la población', valor: function (d) { return L.pct(100 * d.poblacion_2022 / totPob, 1); }, num: true },
    { titulo: 'Superficie (km²)', valor: function (d) { return L.num(d.superficie_km2, 0); }, num: true },
    { titulo: '% del territorio', valor: function (d) { return L.pct(100 * d.superficie_km2 / totSup, 1); }, num: true }
  ]);
});
