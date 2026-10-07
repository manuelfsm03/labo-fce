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
  }
  btn.addEventListener('click', function () { aplicar(document.body.classList.contains('charla') ? 'lectura' : 'charla'); });
  document.body.appendChild(btn);
  var inicial = 'lectura';
  try { if (new URLSearchParams(location.search).get('modo') === 'charla') { inicial = 'charla'; } else if (localStorage.getItem(KEY) === 'charla') { inicial = 'charla'; } } catch (e) { /* idem */ }
  aplicar(inicial);
})();
