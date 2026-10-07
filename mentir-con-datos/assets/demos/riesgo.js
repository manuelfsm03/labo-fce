/* Módulo 8a · Riesgo relativo vs absoluto. El susto de la píldora (Reino Unido, 1995): "duplica el riesgo"
   era pasar de 1 a 2 casos cada 7.000 mujeres. 7.000 cuadraditos, uno o dos marcados. */
Labo.registrar('riesgo', function (raiz, p) {
  var L = Labo, C = L.C, N = p.total, antes = p.antes, despues = p.despues;
  var cual = 'vieja';
  var controles = L.el('div', { 'class': 'demo-controles' });
  var lienzo = L.el('div', { 'class': 'demo-lienzo riesgo-lienzo' });
  var lectura = L.el('div', { 'class': 'demo-lectura' });
  raiz.appendChild(controles); raiz.appendChild(lienzo); raiz.appendChild(lectura);
  L.opciones(controles, {
    rotulo: 'Píldora', valor: cual,
    items: [{ valor: 'vieja', texto: 'Vieja (2ª generación)' }, { valor: 'nueva', texto: 'Nueva (3ª generación)' }],
    alCambiar: function (v) { cual = v; dibujar(); }
  });
  var vAbs = L.el('span', { 'class': 'v grande' }), vRel = L.el('span', { 'class': 'v grande' }), vDif = L.el('span', { 'class': 'v grande' });
  lectura.appendChild(L.el('div', { 'class': 'kpis' }, [
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Riesgo absoluto' }), vAbs]),
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Riesgo relativo (nueva vs vieja)' }), vRel]),
    L.el('div', { 'class': 'kpi' }, [L.el('span', { 'class': 'k', text: 'Diferencia absoluta' }), vDif])
  ]));
  var canvas = L.el('canvas', { role: 'img', 'aria-label': 'Siete mil cuadraditos, uno por mujer; los casos de trombosis aparecen marcados' });
  lienzo.appendChild(canvas);
  // Posiciones fijas de los casos (para que el segundo aparezca sin mover el primero)
  var casos = [Math.floor(N * 0.37), Math.floor(N * 0.71)];
  var ancho = 640;
  function dibujar() {
    var cols = 100, filas = Math.ceil(N / cols), u = Math.max(4, Math.floor(ancho / cols)), dpr = window.devicePixelRatio || 1;
    canvas.width = cols * u * dpr; canvas.height = filas * u * dpr;
    canvas.style.width = cols * u + 'px'; canvas.style.height = filas * u + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = C.grisClaro;
    for (var i = 0; i < N; i++) { ctx.fillRect((i % cols) * u, Math.floor(i / cols) * u, u - 1, u - 1); }
    var k = cual === 'vieja' ? antes : despues;
    for (var j = 0; j < k; j++) {
      var x = (casos[j] % cols) * u, y = Math.floor(casos[j] / cols) * u;
      ctx.fillStyle = C.ladrillo;
      ctx.fillRect(x - 1, y - 1, u + 1, u + 1);
      ctx.strokeStyle = C.ladrillo; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x + u / 2, y + u / 2, u * 2.6, 0, 2 * Math.PI); ctx.stroke();
    }
    var r = k / N * 100;
    vAbs.textContent = k + ' en ' + L.num(N, 0) + ' (' + L.num(r, 3) + '%)';
    vRel.textContent = cual === 'vieja' ? '—' : '+' + L.num((despues / antes - 1) * 100, 0) + '%';
    vDif.textContent = cual === 'vieja' ? '—' : '+' + L.num((despues - antes) / N * 100, 3) + ' p.p.';
    raiz.setAttribute('data-casos', k);
  }
  L.responsivo(lienzo, function (w) { ancho = w; dibujar(); });
});
