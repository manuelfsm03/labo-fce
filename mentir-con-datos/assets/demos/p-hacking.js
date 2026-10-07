/* Módulo 4 · p-hacking. 20 variantes que no tienen ningún efecto: aun así, con 20 tests al 5%,
   en casi dos de cada tres experimentos aparece al menos un "hallazgo" (xkcd 882).
   Opciones: colores, alfa, item (rótulo de cada variante) y titular con {color} y {p}. */
Labo.registrar('p-hacking', function (raiz, p) {
  var L = Labo, C = L.C, colores = p.colores, alfa = p.alfa || 0.05;
  var corridas = 0, conHallazgo = 0, actual = null;
  var item = p.item || 'Gomitas', plantilla = p.titular || '«¡Las gomitas {color} causan acné! (p = {p})»';
  var controles = L.el('div', { 'class': 'demo-controles' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(lienzo); raiz.appendChild(lectura);
  var titular = L.el('span', { 'class': 'titular-demo' }), vCuenta = L.el('span', { 'class': 'v' });
  lectura.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'El titular' }), titular]));
  lectura.appendChild(L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Experimentos con algún "hallazgo"' }), vCuenta]));
  function correr() {
    actual = colores.map(function (c) { return { color: c, p: Math.random() }; });
    corridas++;
    if (actual.some(function (d) { return d.p < alfa; })) { conHallazgo++; }
    dibujar();
  }
  L.boton(controles, '🧪 Hacer el experimento', correr);
  L.boton(controles, '×100', function () { for (var i = 0; i < 99; i++) { var ps = colores.map(function () { return Math.random(); }); corridas++; if (ps.some(function (x) { return x < alfa; })) { conHallazgo++; } } correr(); }, 'sec');
  var ancho = 640;
  function dibujar() {
    if (!actual) { lienzo.textContent = ''; titular.textContent = 'Todavía no se hizo ningún experimento.'; vCuenta.textContent = '—'; return; }
    var g = L.plot({
      width: ancho, height: 260, marginLeft: 44, marginBottom: 70,
      x: { domain: colores, label: null, tickRotate: -40, tickSize: 0 },
      y: { type: 'log', domain: [0.001, 1], label: 'Valor p (escala log)', labelAnchor: 'top', labelArrow: 'none', grid: true, ticks: [0.001, 0.01, 0.05, 0.1, 0.5, 1], tickFormat: function (v) { return L.num(v, v < 0.01 ? 3 : 2); } },
      marks: [
        Plot.ruleY([alfa], { stroke: C.trampa, strokeWidth: 1.5 }),
        Plot.text([alfa], { y: function (d) { return d; }, frameAnchor: 'right', dy: -8, text: function () { return 'p = 0,05'; }, fill: C.trampa, fontWeight: 600 }),
        Plot.dot(actual, { x: 'color', y: 'p', r: 6, fill: function (d) { return d.p < alfa ? C.ladrillo : C.gris; }, stroke: C.papel, strokeWidth: 1.5, title: function (d) { return item + ' ' + d.color + ': p = ' + L.num(d.p, 3); }, tip: true })
      ]
    });
    lienzo.textContent = ''; lienzo.appendChild(g);
    var sig = actual.filter(function (d) { return d.p < alfa; });
    titular.textContent = sig.length ? plantilla.replace('{color}', sig[0].color).replace('{p}', L.num(sig[0].p, 3)) : 'Nada "significativo" esta vez. Probá de nuevo.';
    vCuenta.textContent = conHallazgo + ' de ' + corridas + ' (' + L.pct(100 * conHallazgo / corridas, 0) + '). La teoría dice 64%.';
    raiz.setAttribute('data-corridas', corridas);
  }
  L.responsivo(lienzo, function (w) { ancho = w; dibujar(); });
});

/* Experimento de las monedas: con N personas tirando 10 monedas, ¿qué chance hay de que alguna saque 8 caras o más? */
Labo.registrar('monedas', function (raiz, p) {
  var L = Labo, C = L.C;
  var p8 = (45 + 10 + 1) / 1024;   // P(X ≥ 8), X ~ Binomial(10, 1/2)
  var controles = L.el('div', { 'class': 'demo-controles' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(lectura);
  var vUno = L.el('span', { 'class': 'v grande' }), vAlguno = L.el('span', { 'class': 'v grande' });
  lectura.appendChild(L.el('div', { 'class': 'kpis' }, [
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Que UNA persona saque 8 o más' }), vUno]),
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Que AL MENOS UNA del aula lo logre' }), vAlguno])
  ]));
  function pinta(n) { vUno.textContent = L.pct(100 * p8, 1); vAlguno.textContent = L.pct(100 * (1 - Math.pow(1 - p8, n)), 0); raiz.setAttribute('data-alguno', (1 - Math.pow(1 - p8, n)).toFixed(3)); }
  L.rango(controles, { rotulo: 'Personas en el aula', min: 1, max: 100, paso: 1, valor: p.n || 40, formato: function (v) { return String(v); }, alCambiar: pinta });
  pinta(p.n || 40);
});
