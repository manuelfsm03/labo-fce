/* Componentes de charla. Convierte los bloques marcados en el .qmd en momentos de interacción:
   .gancho, .pregunta, .adivina, .desafio, .charlalo, .antidoto, .receta, #checklist y el modo charla.
   Sin JavaScript todo queda legible (las respuestas se ven); con JavaScript se esconden hasta revelar. */
(function () {
  document.documentElement.classList.add('js');

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) { for (var k in attrs) { if (k === 'text') { n.textContent = attrs[k]; } else { n.setAttribute(k, attrs[k]); } } }
    (children || []).forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function kicker(bloque, ico, texto) {
    bloque.insertBefore(el('div', { 'class': 'bloque-kicker' }, [el('span', { 'class': 'ico', 'aria-hidden': 'true', text: ico }), texto]), bloque.firstChild);
  }
  function fmt(v, formato, dec) {
    var d = dec == null ? 2 : dec;
    var s;
    if (formato === '%') { s = (v).toFixed(d).replace('.', ',') + '%'; }
    else if (formato === 'x') { s = '×' + v.toFixed(d).replace('.', ','); }
    else if (formato === '$') { s = '$' + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
    else { s = v.toFixed(d).replace('.', ','); }
    return s;
  }
  function decimales(paso) { var p = String(paso); return p.indexOf('.') < 0 ? 0 : p.length - p.indexOf('.') - 1; }

  // Reloj para consignas con tiempo (data-minutos)
  function reloj(bloque) {
    var min = parseFloat(bloque.getAttribute('data-minutos'));
    if (!min) { return; }
    var b = el('button', { type: 'button', 'class': 'reloj', 'aria-live': 'polite', text: '⏱ ' + min + ' min' });
    var kick = bloque.querySelector('.bloque-kicker');
    kick.appendChild(b);
    var t = null;
    b.addEventListener('click', function () {
      if (t) { clearInterval(t); t = null; b.className = 'reloj'; b.textContent = '⏱ ' + min + ' min'; return; }
      var fin = Date.now() + min * 60000;
      b.className = 'reloj corriendo';
      t = setInterval(function () {
        var r = Math.max(0, Math.round((fin - Date.now()) / 1000));
        b.textContent = '⏱ ' + Math.floor(r / 60) + ':' + String(r % 60).padStart(2, '0');
        if (r === 0) { clearInterval(t); t = null; b.className = 'reloj listo'; b.textContent = '¡Tiempo!'; }
      }, 250);
    });
  }

  // Botón "Revelar" que destapa la .respuesta
  function revelador(bloque, alRevelar) {
    var resp = bloque.querySelector(':scope > .respuesta');
    if (!resp) { return null; }
    resp.classList.add('oculta');
    resp.setAttribute('aria-hidden', 'true');
    var b = el('button', { type: 'button', 'class': 'btn-charla', 'aria-expanded': 'false', text: '👀 Revelar' });
    b.addEventListener('click', function () {
      var abrir = resp.classList.contains('oculta');
      resp.classList.toggle('oculta', !abrir);
      resp.setAttribute('aria-hidden', String(!abrir));
      bloque.classList.toggle('revelado', abrir);
      b.setAttribute('aria-expanded', String(abrir));
      b.textContent = abrir ? '🙈 Esconder' : '👀 Revelar';
      if (abrir && alRevelar) { alRevelar(); }
    });
    var acciones = el('div', { 'class': 'acciones' }, [b]);
    bloque.insertBefore(acciones, resp);
    return acciones;
  }

  document.querySelectorAll('.gancho').forEach(function (b) { kicker(b, '🎣', b.getAttribute('data-kicker') || 'Para arrancar'); });

  document.querySelectorAll('.pregunta').forEach(function (b) {
    kicker(b, '🙋', b.getAttribute('data-kicker') || 'Pregunta al aula');
    var lista = b.querySelector(':scope > ul, :scope > ol');
    var correcta = parseInt(b.getAttribute('data-correcta'), 10);
    if (lista) {
      var ops = el('div', { 'class': 'opciones', role: 'group', 'aria-label': 'Opciones' });
      Array.prototype.forEach.call(lista.children, function (li, i) {
        var bt = el('button', { type: 'button', 'aria-pressed': 'false' }, [el('span', { 'class': 'letra', 'aria-hidden': 'true', text: 'ABCDEFG'.charAt(i) })]);
        while (li.firstChild) { bt.appendChild(li.firstChild); }
        if (i + 1 === correcta) { bt.classList.add('correcta'); }
        bt.addEventListener('click', function () {
          ops.querySelectorAll('button').forEach(function (o) { o.setAttribute('aria-pressed', String(o === bt && o.getAttribute('aria-pressed') !== 'true')); });
        });
        ops.appendChild(bt);
      });
      lista.replaceWith(ops);
    }
    revelador(b);
  });

  document.querySelectorAll('.adivina').forEach(function (b) {
    kicker(b, '🎯', b.getAttribute('data-kicker') || 'Adiviná el número');
    var min = parseFloat(b.getAttribute('data-min')), max = parseFloat(b.getAttribute('data-max'));
    var paso = parseFloat(b.getAttribute('data-paso') || '1');
    var dec = decimales(b.getAttribute('data-paso') || '1');
    var resp = parseFloat(b.getAttribute('data-respuesta'));
    var formato = b.getAttribute('data-formato') || '';
    var ini = b.hasAttribute('data-inicial') ? parseFloat(b.getAttribute('data-inicial')) : (min + max) / 2;
    var id = 'adv-' + Math.random().toString(36).slice(2, 8);
    var input = el('input', { type: 'range', id: id, min: min, max: max, step: paso, value: ini, 'aria-label': 'Tu estimación' });
    var out = el('output', { 'for': id, text: fmt(ini, formato, dec) });
    var ver = el('span', { 'class': 'veredicto', 'aria-live': 'polite' });
    input.addEventListener('input', function () { out.textContent = fmt(+input.value, formato, dec); ver.textContent = ''; });
    var est = el('div', { 'class': 'estimacion' }, [el('label', { 'for': id, text: 'Tu estimación' }), input, out]);
    var acciones = revelador(b, function () {
      var v = +input.value, err = Math.abs(v - resp), rango = Math.abs(max - min) || 1;
      var msg = err / rango < 0.03 ? '¡Clavado! ' : (err / rango < 0.12 ? 'Cerca. ' : 'Lejos. ');
      ver.textContent = msg + 'Dijiste ' + fmt(v, formato, dec) + '; era ' + fmt(resp, formato, dec) + '.';
    });
    if (acciones) { b.insertBefore(est, acciones); acciones.appendChild(ver); } else { b.appendChild(est); }
  });

  document.querySelectorAll('.desafio').forEach(function (b) { kicker(b, '⏱️', b.getAttribute('data-kicker') || 'Desafío'); reloj(b); });
  document.querySelectorAll('.charlalo').forEach(function (b) { kicker(b, '💬', b.getAttribute('data-kicker') || 'Charlalo con quien tengas al lado'); reloj(b); });
  document.querySelectorAll('.antidoto').forEach(function (b) { kicker(b, '🕵️', 'Antídoto' + (b.getAttribute('data-truco') ? ' · ' + b.getAttribute('data-truco') : '')); });

  // Recetas: se pliegan en modo charla, se abren para leer
  var recetas = [];
  document.querySelectorAll('.receta').forEach(function (r) {
    var d = el('details', { 'class': 'receta-plegada', open: '' }, [el('summary', { text: r.getAttribute('data-titulo') || '🧪 La receta en Python' })]);
    var cuerpo = el('div', { 'class': 'receta-cuerpo' });
    r.parentNode.insertBefore(d, r);
    cuerpo.appendChild(r);
    d.appendChild(cuerpo);
    recetas.push(d);
  });

  // Checklist del epílogo: junta todos los antídotos con link a su módulo
  var check = document.getElementById('checklist');
  if (check) {
    var ol = el('ol');
    document.querySelectorAll('.antidoto').forEach(function (a, i) {
      var sec = a.closest('section[id]');
      var truco = a.getAttribute('data-truco') || ('Truco ' + (i + 1));
      var preg = a.getAttribute('data-pregunta') || '';
      var cb = el('input', { type: 'checkbox', id: 'chk-' + i });
      var etiqueta = el('label', { 'for': 'chk-' + i });
      var tr = el('span', { 'class': 'truco' }, [sec ? el('a', { href: '#' + sec.id, text: truco }) : truco]);
      etiqueta.appendChild(tr);
      etiqueta.appendChild(el('br'));
      etiqueta.appendChild(el('span', { 'class': 'pregunta-check', text: preg }));
      var li = el('li', null, [cb, etiqueta]);
      cb.addEventListener('change', function () { li.classList.toggle('hecho', cb.checked); });
      ol.appendChild(li);
    });
    check.appendChild(ol);
  }

  // Modo charla (proyector) / modo lectura
  var KEY = 'labo-modo';
  var btn = el('button', { type: 'button', 'class': 'modo-toggle' });
  function aplicar(modo) {
    var charla = modo === 'charla';
    document.body.classList.toggle('charla', charla);
    btn.textContent = charla ? '📖 Modo lectura' : '🎤 Modo charla';
    btn.setAttribute('aria-pressed', String(charla));
    recetas.forEach(function (d) { d.open = !charla; });
    try { localStorage.setItem(KEY, modo); } catch (e) { /* sin almacenamiento: no pasa nada */ }
    window.dispatchEvent(new Event('resize'));
    document.dispatchEvent(new Event('labo:modo'));
    if (charla) { setTimeout(actualizarBarra, 50); }
  }
  btn.addEventListener('click', function () { aplicar(document.body.classList.contains('charla') ? 'lectura' : 'charla'); });
  document.body.appendChild(btn);

  // ---------- Modo charla como un deck: de parada en parada con ← → (como las diapositivas del taller) ----------
  var PARADAS = '#title-block-header, .acto-banda, main section.level2 > h2, .gancho, .pregunta, .adivina, .desafio, .charlalo, ' +
    '.antidoto, figure.fig-atlas, .demo:not(.fig-atlas .demo), .banda, .pyme, .rio, #checklist, #indice-graficos';
  var barra = el('div', { 'class': 'charla-barra', role: 'navigation', 'aria-label': 'Avanzar por la clase' });
  var cbTitulo = el('span', { 'class': 'cb-titulo' });
  var cbCuenta = el('span', { 'class': 'cb-cuenta' });
  var cbAnt = el('button', { type: 'button', 'aria-label': 'Parada anterior', text: '←' });
  var cbSig = el('button', { type: 'button', 'aria-label': 'Parada siguiente', text: '→' });
  [cbTitulo, cbCuenta, cbAnt, cbSig].forEach(function (n) { barra.appendChild(n); });
  var progreso = el('div', { 'class': 'charla-progreso', 'aria-hidden': 'true' });
  document.body.appendChild(barra); document.body.appendChild(progreso);
  function paradas() {
    return Array.prototype.filter.call(document.querySelectorAll(PARADAS), function (n) { return n.offsetParent !== null || n.getClientRects().length; });
  }
  // La parada actual es la que quedó más cerca del borde de arriba (entre las que ya llegaron al tercio superior)
  function actual(lista) {
    var linea = window.innerHeight * 0.35, idx = 0, mejor = Infinity;
    lista.forEach(function (n, i) {
      var top = n.getBoundingClientRect().top;
      if (top <= linea && Math.abs(top - 24) <= mejor) { mejor = Math.abs(top - 24); idx = i; }
    });
    return idx;
  }
  function ir(delta) {
    var lista = paradas(), i = actual(lista), j = Math.max(0, Math.min(lista.length - 1, i + delta));
    // Si la parada actual todavía no llegó arriba, "siguiente" primero la acomoda
    if (delta > 0 && lista[i].getBoundingClientRect().top > 40) { j = i; }
    lista[j].classList.add('parada-activa');
    lista[j].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function actualizarBarra() {
    if (!document.body.classList.contains('charla')) { return; }
    var lista = paradas(); if (!lista.length) { return; }
    var i = actual(lista), modulo = null;
    document.querySelectorAll('main section.level2 > h2').forEach(function (h) { if (h.getBoundingClientRect().top <= window.innerHeight * 0.35) { modulo = h; } });
    var donde = modulo ? (modulo.getAttribute('data-modulo') ? 'Módulo ' + modulo.getAttribute('data-modulo') + ' · ' : '') + (modulo.getAttribute('data-titulo') || modulo.textContent) : 'Prólogo';
    cbTitulo.innerHTML = '';
    cbTitulo.appendChild(el('b', { text: 'Cómo mentir con datos' }));
    cbTitulo.appendChild(document.createTextNode(' · Labo FCE-UBA · ' + donde));
    cbCuenta.textContent = (i + 1) + ' / ' + lista.length;
    progreso.style.width = (100 * (i + 1) / lista.length) + '%';
  }
  cbAnt.addEventListener('click', function () { ir(-1); });
  cbSig.addEventListener('click', function () { ir(1); });
  document.addEventListener('keydown', function (e) {
    if (!document.body.classList.contains('charla') || e.altKey || e.ctrlKey || e.metaKey) { return; }
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) { return; }
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); ir(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); ir(-1); }
  });
  var esperando = false;
  window.addEventListener('scroll', function () {
    if (esperando) { return; }
    esperando = true;
    requestAnimationFrame(function () { esperando = false; actualizarBarra(); });
  }, { passive: true });
  var inicial = 'lectura';
  try { if (new URLSearchParams(location.search).get('modo') === 'charla') { inicial = 'charla'; } else if (localStorage.getItem(KEY) === 'charla') { inicial = 'charla'; } } catch (e) { /* idem */ }
  aplicar(inicial);
})();
