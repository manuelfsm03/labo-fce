/* Módulo 2 · Muestras. Una población de 10.000 personas (40% a favor de algo). La encuesta de Instagram
   junta muchas respuestas pero contestan más los entusiastas; la muestra aleatoria es chica pero insesgada.
   Opciones: frase (lo que contesta la gente, «a favor» por defecto) y eje (rótulo del eje). */
Labo.registrar('muestra', function (raiz, p) {
  var L = Labo, C = L.C, N = p.poblacion, verdad = p.verdad, nAleatoria = p.n_aleatoria;
  var qFavor = p.prob_responde_favor, qContra = p.prob_responde_contra;
  var frase = p.frase || 'a favor', eje = p.eje || '% a favor en la encuesta';
  var resultados = [];
  var controles = L.el('div', { 'class': 'demo-controles' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(lienzo); raiz.appendChild(lectura);
  var vUltima = L.el('span', { 'class': 'v' });
  lectura.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Última encuesta' }), vUltima]));
  // Población fija: los primeros 40% están a favor
  var aFavor = Math.round(N * verdad);
  function instagram() {
    var si = 0, n = 0;
    for (var i = 0; i < N; i++) { var favor = i < aFavor; if (Math.random() < (favor ? qFavor : qContra)) { n++; if (favor) { si++; } } }
    return { tipo: 'Encuesta en Instagram', pct: 100 * si / n, n: n };
  }
  function aleatoria() {
    var si = 0;
    for (var i = 0; i < nAleatoria; i++) { if (Math.floor(Math.random() * N) < aFavor) { si++; } }
    return { tipo: 'Muestra aleatoria', pct: 100 * si / nAleatoria, n: nAleatoria };
  }
  function agregar(r) {
    resultados.push(r);
    vUltima.textContent = r.tipo + ': ' + L.pct(r.pct, 0) + ' ' + frase + ' (' + L.num(r.n, 0) + ' respuestas). La verdad: ' + L.pct(verdad * 100, 0) + '.';
    raiz.setAttribute('data-n', resultados.length);
    dibujar();
  }
  L.boton(controles, '📱 Encuesta en Instagram', function () { agregar(instagram()); });
  L.boton(controles, '🎲 Muestra aleatoria de ' + nAleatoria, function () { agregar(aleatoria()); });
  L.boton(controles, '×10 de cada una', function () { for (var i = 0; i < 10; i++) { resultados.push(instagram()); resultados.push(aleatoria()); } agregar(resultados.pop()); }, 'sec');
  var ancho = 640;
  function dibujar() {
    var g = L.plot({
      width: ancho, height: 190, marginLeft: 160, marginRight: 20, marginBottom: 40,
      x: { domain: [0, 100], label: eje, labelAnchor: 'center', labelArrow: 'none', grid: true, tickFormat: function (v) { return v + '%'; } },
      y: { domain: ['Encuesta en Instagram', 'Muestra aleatoria'], label: null, tickSize: 0 },
      marks: [
        Plot.ruleX([verdad * 100], { stroke: C.verde, strokeWidth: 2 }),
        Plot.text([verdad * 100], { x: function (d) { return d; }, frameAnchor: 'top', dy: -14, text: function () { return 'la verdad: ' + L.pct(verdad * 100, 0); }, fill: C.verde, fontWeight: 600 }),
        Plot.dot(resultados, { x: 'pct', y: 'tipo', r: 5, fill: function (d) { return d.tipo === 'Muestra aleatoria' ? C.azul : C.dorado; }, fillOpacity: 0.75, stroke: C.papel, title: function (d) { return d.tipo + ': ' + L.pct(d.pct, 1) + ' (' + d.n + ' respuestas)'; }, tip: true })
      ]
    });
    lienzo.textContent = ''; lienzo.appendChild(g);
  }
  L.responsivo(lienzo, function (w) { ancho = w; dibujar(); });
  vUltima.textContent = 'Todavía no se hizo ninguna encuesta.';
});
