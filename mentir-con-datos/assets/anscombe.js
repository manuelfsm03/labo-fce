/* Cuarteto de Anscombe, reajustado en vivo. Port del componente de la home de manuelfsm03.github.io:
   mismo dibujo y mismo comportamiento (autoplay I→IV, arrastrar puntos, reiniciar), con la consola en
   Python por defecto (la materia es en Python) y una pestaña con la versión en R de la home. */
(function () {
  var plot = document.getElementById('ans-plot');
  if (!plot) { return; }
  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, parent) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) { n.setAttribute(k, attrs[k]); }
    if (parent) { parent.appendChild(n); }
    return n;
  }
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var X = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5];
  var X4 = [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8];
  var Y = [
    [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68],
    [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74],
    [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73],
    [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89]
  ];
  function dataset(k) { var xs = k === 3 ? X4 : X; return xs.map(function (x, i) { return { x: x, y: Y[k][i] }; }); }
  var XMIN = 2, XMAX = 20, YMIN = 2, YMAX = 14;
  var L0 = 34, R0 = 428, T0 = 12, B0 = 302;
  function sx(x) { return L0 + (x - XMIN) / (XMAX - XMIN) * (R0 - L0); }
  function sy(y) { return B0 - (y - YMIN) / (YMAX - YMIN) * (B0 - T0); }

  [4, 8, 12, 16, 20].forEach(function (v) {
    svgEl('line', { 'class': 'ans-gridline', x1: sx(v), x2: sx(v), y1: T0, y2: B0 }, plot);
    svgEl('text', { 'class': 'ans-tick', x: sx(v), y: B0 + 18, 'text-anchor': 'middle' }, plot).textContent = v;
  });
  [4, 8, 12].forEach(function (v) {
    svgEl('line', { 'class': 'ans-gridline', x1: L0, x2: R0, y1: sy(v), y2: sy(v) }, plot);
    svgEl('text', { 'class': 'ans-tick', x: L0 - 8, y: sy(v) + 4, 'text-anchor': 'end' }, plot).textContent = v;
  });
  svgEl('line', { 'class': 'ans-axis', x1: L0, x2: R0, y1: B0, y2: B0 }, plot);
  svgEl('line', { 'class': 'ans-axis', x1: L0, x2: L0, y1: T0, y2: B0 }, plot);
  svgEl('text', { 'class': 'ans-lab', x: R0 - 4, y: B0 - 8, 'text-anchor': 'end' }, plot).textContent = 'x';
  svgEl('text', { 'class': 'ans-lab', x: L0 + 8, y: T0 + 14 }, plot).textContent = 'y';
  var clip = svgEl('clipPath', { id: 'ans-clip' }, svgEl('defs', {}, plot));
  svgEl('rect', { x: L0, y: T0, width: R0 - L0, height: B0 - T0 }, clip);
  var gRes = svgEl('g', { 'clip-path': 'url(#ans-clip)' }, plot);
  var fitLine = svgEl('line', { 'class': 'ans-fit', 'clip-path': 'url(#ans-clip)' }, plot);
  var eq = svgEl('text', { 'class': 'ans-eq', x: L0 + 26, y: T0 + 22 }, plot);
  var gPts = svgEl('g', {}, plot);

  var cur = dataset(0), active = 0, edited = false;
  var resLines = [], dots = [];
  cur.forEach(function (p, i) {
    resLines.push(svgEl('line', { 'class': 'ans-res' }, gRes));
    var g = svgEl('g', { 'data-i': i, style: 'touch-action:none' }, gPts);
    svgEl('circle', { r: 15, fill: 'transparent', style: 'cursor:grab' }, g);
    dots.push(svgEl('circle', { 'class': 'ans-pt', r: 6.5 }, g));
  });

  function fit(pts) {
    var n = pts.length, mx = 0, my = 0, sxx = 0, sxy = 0, syy = 0;
    pts.forEach(function (p) { mx += p.x / n; my += p.y / n; });
    pts.forEach(function (p) { sxx += (p.x - mx) * (p.x - mx); sxy += (p.x - mx) * (p.y - my); syy += (p.y - my) * (p.y - my); });
    var b1 = sxx > 1e-9 ? sxy / sxx : 0, r = sxx > 1e-9 && syy > 1e-9 ? sxy / Math.sqrt(sxx * syy) : 0;
    return { b0: my - b1 * mx, b1: b1, r: r, r2: r * r };
  }
  // R y pandas imprimen un vector redondeado con tantos decimales como pide su elemento "más largo"
  function minDigits(vals, digits) {
    var rounded = vals.map(function (v) { var f = Math.pow(10, digits); return Math.round(v * f) / f; });
    var d = 0;
    rounded.forEach(function (v) {
      for (var k = 0; k <= digits; k++) { var f = Math.pow(10, k); if (Math.abs(Math.round(v * f) / f - v) < 1e-9) { d = Math.max(d, k); break; } }
    });
    return rounded.map(function (v) { return v.toFixed(d); });
  }
  function pyFloat(v, digits) { var f = Math.pow(10, digits); var s = String(Math.round(v * f) / f); return s.indexOf('.') < 0 ? s + '.0' : s; }
  function sig7(v) { return String(parseFloat(v.toPrecision(7))); }
  function pad(s, w) { while (s.length < w) { s = ' ' + s; } return s; }
  function padR(s, w) { while (s.length < w) { s = s + ' '; } return s; }
  function dec(v, d) { return v.toFixed(d).replace('.', ','); }

  var consoleEl = document.getElementById('ans-console');
  var lang = 'py';
  function consolePy(f, k) {
    var P = '<span class="pr">&gt;&gt;&gt;</span> ';
    var co = minDigits([f.b0, f.b1], 3);
    if (co[0].indexOf('.') < 0) { co = co.map(function (c) { return c + '.0'; }); }
    var names = ['Intercept', 'x' + k], nw = 9, vw = Math.max(co[0].length, co[1].length);
    var lines = [];
    if (edited) { lines.push('<span class="cm"># editaste los datos a mano</span>'); }
    lines.push(P + 'm = smf.ols("y' + k + ' ~ x' + k + '", data=anscombe).fit()');
    lines.push(P + 'print(m.params.round(3))');
    lines.push('<span class="va">' + padR(names[0], nw) + '    ' + pad(co[0], vw) + '\n' + padR(names[1], nw) + '    ' + pad(co[1], vw) + '</span>');
    lines.push('dtype: float64');
    lines.push(P + 'print(round(m.rsquared, 3))');
    lines.push('<span class="va">' + pyFloat(f.r2, 3) + '</span>');
    lines.push(P + 'print(round(anscombe.x' + k + '.corr(anscombe.y' + k + '), 4))');
    lines.push('<span class="va">' + pyFloat(f.r, 4) + '</span>');
    return lines;
  }
  function consoleR(f, k) {
    var P = '<span class="pr">&gt;</span> ';
    var co = minDigits([f.b0, f.b1], 3), w = Math.max(11, co[0].length, co[1].length);
    var lines = [];
    if (edited) { lines.push('<span class="cm"># editaste los datos a mano</span>'); }
    lines.push(P + 'm &lt;- lm(y' + k + ' ~ x' + k + ', anscombe)');
    lines.push(P + 'round(coef(m), 3)');
    lines.push(pad('(Intercept)', w) + ' ' + pad('x' + k, w));
    lines.push('<span class="va">' + pad(co[0], w) + ' ' + pad(co[1], w) + '</span>');
    lines.push(P + 'round(summary(m)$r.squared, 3)');
    lines.push('<span class="va">[1] ' + minDigits([f.r2], 3)[0] + '</span>');
    lines.push(P + 'with(anscombe, cor(x' + k + ', y' + k + '))');
    lines.push('<span class="va">[1] ' + sig7(f.r) + '</span>');
    return lines;
  }
  function render() {
    var f = fit(cur);
    cur.forEach(function (p, i) {
      dots[i].setAttribute('cx', sx(p.x)); dots[i].setAttribute('cy', sy(p.y));
      dots[i].parentNode.firstChild.setAttribute('cx', sx(p.x)); dots[i].parentNode.firstChild.setAttribute('cy', sy(p.y));
      var l = resLines[i];
      l.setAttribute('x1', sx(p.x)); l.setAttribute('x2', sx(p.x));
      l.setAttribute('y1', sy(p.y)); l.setAttribute('y2', sy(f.b0 + f.b1 * p.x));
    });
    fitLine.setAttribute('x1', sx(XMIN)); fitLine.setAttribute('y1', sy(f.b0 + f.b1 * XMIN));
    fitLine.setAttribute('x2', sx(XMAX)); fitLine.setAttribute('y2', sy(f.b0 + f.b1 * XMAX));
    eq.textContent = 'ŷ = ' + dec(f.b0, 2) + (f.b1 < 0 ? ' − ' : ' + ') + dec(Math.abs(f.b1), 2) + ' x';
    svgEl('tspan', { dx: 22 }, eq).textContent = 'R² = ' + dec(f.r2, 2);
    var k = active + 1;
    consoleEl.innerHTML = (lang === 'py' ? consolePy(f, k) : consoleR(f, k)).join('\n');
    plot.setAttribute('data-r2', f.r2.toFixed(4));
  }

  var segBtns = document.querySelectorAll('#ans-sets button[data-set]');
  var resetBtn = document.getElementById('ans-reset');
  var anim = null;
  function goTo(k) {
    active = k;
    edited = false;
    resetBtn.hidden = true;
    segBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-set') === k)); });
    var from = cur.map(function (p) { return { x: p.x, y: p.y }; }), to = dataset(k);
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    if (reduceMotion) { cur = to; render(); return; }
    var t0 = null, DUR = 800;
    function step(ts) {
      if (t0 === null) { t0 = ts; }
      var t = Math.min(1, (ts - t0) / DUR), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      cur = from.map(function (p, i) { return { x: p.x + (to[i].x - p.x) * e, y: p.y + (to[i].y - p.y) * e }; });
      render();
      anim = t < 1 ? requestAnimationFrame(step) : null;
    }
    anim = requestAnimationFrame(step);
  }

  var fig = document.getElementById('anscombe');
  var auto = null, paused = false;
  function stopAuto() { if (auto) { clearInterval(auto); auto = null; } }
  function startAuto() {
    if (reduceMotion || auto) { return; }
    auto = setInterval(function () { if (!paused && !document.hidden) { goTo((active + 1) % 4); } }, 4200);
  }
  fig.addEventListener('pointerenter', function () { paused = true; });
  fig.addEventListener('pointerleave', function () { paused = false; });
  segBtns.forEach(function (b) { b.addEventListener('click', function () { stopAuto(); goTo(+b.getAttribute('data-set')); }); });
  resetBtn.addEventListener('click', function () { goTo(active); });

  document.querySelectorAll('#ans-lang button').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      lang = b.getAttribute('data-lang');
      document.querySelectorAll('#ans-lang button').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      render();
    });
  });

  var dragging = null;
  function toData(e) {
    var pt = plot.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    var p = pt.matrixTransform(plot.getScreenCTM().inverse());
    var x = XMIN + (p.x - L0) / (R0 - L0) * (XMAX - XMIN), y = YMIN + (B0 - p.y) / (B0 - T0) * (YMAX - YMIN);
    return { x: Math.min(XMAX, Math.max(XMIN, x)), y: Math.min(YMAX, Math.max(YMIN, y)) };
  }
  gPts.addEventListener('pointerdown', function (e) {
    var g = e.target.closest('g[data-i]');
    if (!g) { return; }
    e.preventDefault();
    stopAuto();
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    dragging = +g.getAttribute('data-i');
    dots[dragging].classList.add('drag');
    try { g.setPointerCapture(e.pointerId); } catch (err) { /* navegadores viejos */ }
  });
  gPts.addEventListener('pointermove', function (e) {
    if (dragging === null) { return; }
    cur[dragging] = toData(e);
    edited = true;
    resetBtn.hidden = false;
    render();
  });
  function endDrag() { if (dragging !== null) { dots[dragging].classList.remove('drag'); dragging = null; } }
  gPts.addEventListener('pointerup', endDrag);
  gPts.addEventListener('pointercancel', endDrag);
  render();

  // Velado: el gráfico se destapa cuando el aula ya se jugó una respuesta
  var velo = fig.querySelector('.ans-velo button');
  if (fig.classList.contains('velado') && velo) {
    velo.addEventListener('click', function () { fig.classList.remove('velado'); startAuto(); });
  } else {
    startAuto();
  }
})();
