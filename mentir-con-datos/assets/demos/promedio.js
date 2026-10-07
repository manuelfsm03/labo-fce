/* Módulo 7 · El promedio. Un aula de 40 personas y, de golpe, entra alguien que gana millones:
   la media sale volando, la mediana ni se mueve. */
Labo.registrar('promedio', function (raiz, p) {
  var L = Labo, C = L.C, base = p.datos.slice(), messi = p.messi;
  var dentro = false;
  var controles = L.el('div', { 'class': 'demo-controles' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(lienzo); raiz.appendChild(lectura);
  L.opciones(controles, {
    rotulo: 'En el aula', valor: false,
    items: [{ valor: false, texto: 'Solo el curso' }, { valor: true, texto: '⚽ Entra Messi' }],
    alCambiar: function (v) { dentro = v; dibujar(); }
  });
  var vMedia = L.el('span', { 'class': 'v grande' }), vMediana = L.el('span', { 'class': 'v grande' }), vN = L.el('span', { 'class': 'v' });
  lectura.appendChild(L.el('div', { 'class': 'kpis' }, [
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Promedio (media)' }), vMedia]),
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Mediana' }), vMediana]),
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Personas' }), vN])
  ]));
  function usd(v) { return 'US$ ' + L.num(v, 0); }
  var ancho = 640;
  function dibujar() {
    var gente = base.map(function (v, i) { return { v: v, quien: 'Estudiante ' + (i + 1) }; });
    if (dentro) { gente.push({ v: messi, quien: 'Messi', estrella: true }); }
    var media = d3.mean(gente, function (d) { return d.v; }), mediana = d3.median(gente, function (d) { return d.v; });
    var g = L.plot({
      width: ancho, height: 210, marginLeft: 20, marginRight: 24, marginBottom: 36, marginTop: 34,
      x: { type: 'log', domain: [100, 3e7], label: 'Ingreso mensual (US$, escala logarítmica)', labelAnchor: 'center', labelArrow: 'none', tickFormat: function (v) { return v >= 1e6 ? L.num(v / 1e6, 0) + ' M' : L.num(v, 0); }, ticks: [100, 1000, 1e4, 1e5, 1e6, 1e7] },
      y: { axis: null },
      marks: [
        Plot.ruleX([mediana], { stroke: C.azul, strokeWidth: 2 }),
        Plot.ruleX([media], { stroke: C.dorado, strokeWidth: 2 }),
        Plot.text([mediana], { x: function (d) { return d; }, frameAnchor: 'top', dy: -22, text: function () { return 'mediana'; }, fill: C.tinta, fontWeight: 600 }),
        Plot.text([media], { x: function (d) { return d; }, frameAnchor: 'top', dy: -8, text: function () { return 'media'; }, fill: C.tinta, fontWeight: 600 }),
        Plot.dot(gente, Plot.dodgeY('middle', { x: 'v', r: function (d) { return d.estrella ? 9 : 5; }, fill: function (d) { return d.estrella ? C.dorado : C.gris; }, stroke: C.papel, strokeWidth: 1.5, title: function (d) { return d.quien + ': ' + usd(d.v); }, tip: true }))
      ]
    });
    lienzo.textContent = '';
    lienzo.appendChild(g);
    vMedia.textContent = usd(media);
    vMediana.textContent = usd(mediana);
    vN.textContent = gente.length + (dentro ? ' (con Messi)' : '');
    raiz.setAttribute('data-media', media.toFixed(0));
    raiz.setAttribute('data-mediana', mediana.toFixed(0));
  }
  L.responsivo(lienzo, function (w) { ancho = w; dibujar(); });
});
