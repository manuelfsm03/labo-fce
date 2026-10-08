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

  // Las consignas pueden traer su respuesta: se destapa después de discutir
  document.querySelectorAll('.desafio').forEach(function (b) { kicker(b, '⏱️', b.getAttribute('data-kicker') || 'Desafío'); reloj(b); revelador(b); });
  document.querySelectorAll('.charlalo').forEach(function (b) { kicker(b, '💬', b.getAttribute('data-kicker') || 'Charlalo con quien tengas al lado'); reloj(b); revelador(b); });
  document.querySelectorAll('.antidoto').forEach(function (b) { kicker(b, '🕵️', 'Antídoto' + (b.getAttribute('data-truco') ? ' · ' + b.getAttribute('data-truco') : '')); });

  // Recetas: plegables y abiertas para leer. No van al modo charla: el código queda para estudiar en la página
  document.querySelectorAll('.receta').forEach(function (r) {
    var d = el('details', { 'class': 'receta-plegada', open: '' }, [el('summary', { text: r.getAttribute('data-titulo') || '🧪 La receta en Python' })]);
    var cuerpo = el('div', { 'class': 'receta-cuerpo' });
    r.parentNode.insertBefore(d, r);
    cuerpo.appendChild(r);
    d.appendChild(cuerpo);
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

  // ---------- Modo charla: la clase en diapositivas ----------
  // Cada diapositiva tiene todo lo que hace falta para su momento: el gráfico junto con la pregunta sobre ese gráfico,
  // el interactivo junto con su consigna. En el .qmd se arman con ::: {.diapo} (con .dos, en dos columnas). También son
  // diapositivas la portada, las franjas de acto, una tapa por módulo y cada antídoto. Las recetas de Python no van.
  // Al entrar al modo charla los bloques se mudan a #mazo (dejan una marca en su lugar) y al salir vuelven, así que los
  // interactivos conservan lo que se tocó. Cada diapositiva se arma en un lienzo de 1280 px de ancho que se escala para
  // llenar la pantalla; si no entra, se achica hasta entrar entera.
  var KEY = 'labo-modo', KEY_DIAPO = 'labo-diapo', ANCHO = 1280, ANGOSTO = 760;
  var moverse = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var mazo = null, diapos = [], actual = 0, listo = false, enCharla = false, avisoInicial = 0;

  var btn = el('button', { type: 'button', 'class': 'modo-toggle', text: '🎤 Modo charla' });
  var barra = el('div', { 'class': 'charla-barra', role: 'navigation', 'aria-label': 'Diapositivas' });
  var cbTitulo = el('span', { 'class': 'cb-titulo' });
  var cbAviso = el('span', { 'class': 'cb-aviso', 'aria-live': 'polite' });
  var cbCuenta = el('span', { 'class': 'cb-cuenta' });
  var cbAnt = el('button', { type: 'button', 'aria-label': 'Diapositiva anterior', text: '←' });
  var cbSig = el('button', { type: 'button', 'aria-label': 'Diapositiva siguiente', text: '→' });
  [cbTitulo, cbAviso, cbCuenta, cbAnt, cbSig].forEach(function (n) { barra.appendChild(n); });
  var progreso = el('div', { 'class': 'charla-progreso', 'aria-hidden': 'true' });
  document.body.appendChild(barra); document.body.appendChild(progreso); document.body.appendChild(btn);

  function texto(n) { return n ? (n.getAttribute('data-titulo') || n.textContent).replace(/\s+/g, ' ').trim() : ''; }
  // "Prólogo: los números no mienten… ¿o no?" → "Los números no mienten… ¿o no?"
  function sinPrologo(t) { var s = t.replace(/^Prólogo:\s*/, ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  function partes(acto) { var p = (acto || '').split(' · '); return { pill: p[0] || '', resto: p.slice(1).join(' · ') }; }

  // Dónde está cada diapositiva: la pastilla y el nombre del módulo (o del acto)
  function ubicar(ctx) {
    var h2 = ctx.modulo;
    if (h2 && h2.getAttribute('data-modulo')) { return { pill: 'Módulo ' + h2.getAttribute('data-modulo'), nombre: texto(h2) }; }
    if (h2 && h2.parentElement && h2.parentElement.id === 'prologo') { return { pill: 'Prólogo', nombre: sinPrologo(texto(h2)) }; }
    var a = partes(ctx.acto);
    if (h2) { return { pill: a.pill || 'Epílogo', nombre: texto(h2) }; }
    return { pill: a.pill, nombre: a.resto };
  }

  function tapa(h2, ctx) {
    var n = h2.getAttribute('data-modulo');
    var textoTapa = el('div', { 'class': 'tapa-texto' });
    if (ctx.acto) { textoTapa.appendChild(el('span', { 'class': 'tapa-acto', text: ctx.acto })); }
    textoTapa.appendChild(el('span', { 'class': 'h2-num', text: n ? 'Módulo ' + n : 'Prólogo' }));
    var h = el('h2', { 'class': 'tapa-titulo' });
    (n ? texto(h2) : sinPrologo(texto(h2))).split(' ').forEach(function (p, i) {
      if (i) { h.appendChild(document.createTextNode(' ')); }
      var w = el('span', { 'class': 'w', text: p }); w.style.setProperty('--i', i); h.appendChild(w);
    });
    textoTapa.appendChild(h);
    // A la derecha, el número del módulo calado sobre un círculo pistacho (en el prólogo, el asterisco del taller)
    var marca = el('div', { 'class': 'tapa-marca', 'aria-hidden': 'true' });
    if (n) { marca.appendChild(el('span', { 'class': 'tapa-num', text: n.length < 2 ? '0' + n : n })); }
    else { var a = el('span', { 'class': 'tapa-asterisco' }); a.innerHTML = window.LaboAsterisco || ''; marca.appendChild(a); }
    return el('div', { 'class': 'tapa' }, [textoTapa, marca]);
  }

  function agregar(tipo, nodo, ctx) {
    var s = el('section', { 'class': 'diapositiva tipo-' + tipo, 'aria-roledescription': 'diapositiva' });
    var lienzo = el('div', { 'class': 'diapo-lienzo' });
    var cuerpo = el('div', { 'class': 'diapo-cuerpo' });
    var d = { s: s, lienzo: lienzo, cuerpo: cuerpo, nodo: nodo, ancla: nodo, marca: null, tipo: tipo };
    var u = ubicar(ctx);
    d.donde = tipo === 'portada' ? 'Laboratorio de Métodos Cuantitativos · FCE-UBA' : (tipo === 'acto' ? ctx.acto : [u.pill, u.nombre].filter(Boolean).join(' · '));
    if (tipo === 'tapa') { cuerpo.appendChild(tapa(nodo, ctx)); d.nodo = null; }
    else if (tipo !== 'portada' && tipo !== 'acto') {
      // Arriba de todo, el módulo; si la diapositiva arranca una sección, también su título
      var titulo = texto(ctx.titulo);
      var esElModulo = ctx.titulo && ctx.titulo === ctx.modulo;
      var conFigura = tipo === 'contenido' && (nodo.matches('.ancha') || nodo.querySelector('figure.fig-atlas'));
      var donde = el('div', { 'class': 'diapo-donde' }, [u.pill ? el('span', { 'class': 'diapo-pill', text: u.pill }) : null, el('span', { text: esElModulo ? '' : u.nombre })].filter(Boolean));
      var cab = el('header', { 'class': 'diapo-cabeza' }, [donde]);
      if (titulo && conFigura) { donde.appendChild(el('span', { 'class': 'diapo-seccion', text: titulo })); }
      else if (titulo) { cab.appendChild(el('h3', { 'class': 'diapo-titulo', text: titulo })); }
      lienzo.appendChild(cab);
    }
    if (tipo === 'acto') { ['acto-1', 'acto-2', 'acto-3', 'acto-epilogo'].forEach(function (c) { if (nodo.classList.contains(c)) { s.classList.add(c); } }); }
    lienzo.appendChild(cuerpo);
    s.appendChild(lienzo);
    mazo.appendChild(s);
    lienzo._diapo = d;
    if (ro) { ro.observe(lienzo); }
    diapos.push(d);
  }

  var ro = window.ResizeObserver ? new ResizeObserver(function (es) {
    es.forEach(function (e) { var d = e.target._diapo; if (d && enCharla && d === diapos[actual]) { encajar(d); } });
  }) : null;

  function armarMazo() {
    mazo = el('div', { id: 'mazo', role: 'region', 'aria-roledescription': 'presentación', 'aria-label': 'Cómo mentir con datos, en diapositivas' });
    document.body.appendChild(mazo);
    var ctx = { acto: '', modulo: null, titulo: null };
    var SEL = '#title-block-header, .acto-banda, main section.level2 > h2, main section.level3 > h3, .diapo, .antidoto';
    document.querySelectorAll(SEL).forEach(function (n) {
      if (n.parentElement && n.parentElement.closest('.diapo, .acto-banda, details.receta-plegada')) { return; }
      if (n.matches('h2')) {
        ctx.modulo = n; ctx.titulo = n;
        if (n.getAttribute('data-modulo') || n.parentElement.id === 'prologo') { agregar('tapa', n, ctx); ctx.titulo = null; }
        return;
      }
      if (n.matches('h3')) { ctx.titulo = n; return; }
      if (n.matches('.acto-banda')) {
        var pill = n.querySelector('.acto-pill');
        ctx.acto = pill ? texto(pill) : ''; ctx.modulo = null; ctx.titulo = null;
        agregar('acto', n, ctx);
        return;
      }
      if (n.id === 'title-block-header') { agregar('portada', n, ctx); return; }
      agregar(n.matches('.antidoto') ? 'antidoto' : 'contenido', n, ctx);
      ctx.titulo = null;
    });
  }

  // Los bloques se mudan a su diapositiva y dejan una marca; al volver a la lectura, regresan a la marca
  function mudar(d) {
    if (!d.nodo || d.marca) { return; }
    d.marca = document.createComment(' diapositiva ');
    d.nodo.parentNode.insertBefore(d.marca, d.nodo);
    d.cuerpo.appendChild(d.nodo);
  }
  function devolver(d) {
    if (!d.nodo || !d.marca) { return; }
    d.marca.parentNode.insertBefore(d.nodo, d.marca);
    d.marca.parentNode.removeChild(d.marca);
    d.marca = null;
  }

  // Escala: el lienzo mide 1280 px de ancho y se agranda o achica para ocupar la pantalla. Si el contenido es más alto
  // que la pantalla, se achica un poco más para que entre entero. En pantallas angostas (celular) no se escala: scroll.
  function encajar(d) {
    if (!d || !mazo) { return; }
    var vw = mazo.clientWidth, vh = mazo.clientHeight;
    if (!vw || !vh) { return; }
    // Celular o tableta vertical: sin escalar, al ancho de la pantalla y con scroll (charla.css, #mazo.angosto)
    var angosto = vw < ANGOSTO || (vw < 1100 && vh > vw), W = angosto ? vw : ANCHO, base = vw / W, esc = base;
    mazo.classList.toggle('angosto', angosto);
    d.lienzo.style.width = W + 'px';
    d.lienzo.style.minHeight = Math.floor(vh / base) + 'px';
    var alto = d.lienzo.offsetHeight;
    if (!angosto && alto * base > vh + 1) { esc = vh / alto; }
    d.lienzo.style.transform = 'translate(' + Math.max(0, (vw - W * esc) / 2).toFixed(1) + 'px, 0) scale(' + esc.toFixed(4) + ')';
    d.s.classList.toggle('con-scroll', angosto && alto > vh + 1);
    d.s.setAttribute('data-encaje', (esc / base).toFixed(3));
  }

  // Lo que falta revelar en la diapositiva: "→" primero revela y después avanza
  function pendiente(d) {
    return d && d.s.querySelector(':is(.pregunta, .adivina, .charlalo, .desafio):not(.revelado) > .acciones > .btn-charla, .anscombe.velado .ans-velo button');
  }

  function animar(d) {
    if (!moverse) { return; }
    d.s.classList.remove('entra');
    void d.s.offsetWidth;
    d.s.classList.add('entra');
    // Las barras crecen y las líneas se dibujan cuando el gráfico ya se redibujó al ancho de la diapositiva
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (window.Labo && Labo.animarEntrada && d === diapos[actual]) { d.s.querySelectorAll('figure.fig-atlas').forEach(function (f) { Labo.animarEntrada(f); }); }
      });
    });
  }

  function mostrar(i, sinAnimar) {
    if (!diapos.length) { return; }
    i = Math.max(0, Math.min(diapos.length - 1, i));
    var antes = diapos[actual], d = diapos[i];
    if (antes && antes !== d) { antes.s.classList.remove('activa', 'entra'); }
    actual = i;
    d.s.classList.add('activa');
    var foco = document.activeElement;
    if (foco && foco !== document.body && foco.blur && !barra.contains(foco)) { foco.blur(); }
    encajar(d);
    if (!sinAnimar) { animar(d); }
    actualizarBarra();
    try { localStorage.setItem(KEY_DIAPO, String(i)); } catch (e) { /* sin almacenamiento */ }
  }
  function avanzar() {
    var p = pendiente(diapos[actual]);
    if (p) { p.click(); actualizarBarra(); return; }
    mostrar(actual + 1);
  }
  function retroceder() { mostrar(actual - 1); }

  function actualizarBarra() {
    var d = diapos[actual];
    if (!d) { return; }
    cbTitulo.textContent = '';
    cbTitulo.appendChild(el('b', { text: 'Cómo mentir con datos' }));
    if (d.donde) { cbTitulo.appendChild(document.createTextNode(' · ' + d.donde)); }
    cbCuenta.textContent = (actual + 1) + ' / ' + diapos.length;
    progreso.style.width = (100 * (actual + 1) / diapos.length) + '%';
    var p = pendiente(d);
    cbAviso.textContent = p ? '→ revela la respuesta' : (Date.now() < avisoInicial ? '← → para moverte · Esc vuelve a la lectura' : '');
    cbAnt.disabled = actual === 0;
    cbSig.disabled = actual === diapos.length - 1 && !p;
  }

  // La diapositiva más cercana a lo que se estaba leyendo (para entrar al modo charla sin perder el lugar)
  function desdeLectura() {
    var linea = window.innerHeight * 0.35, idx = 0;
    diapos.forEach(function (d, i) { if (d.ancla.getBoundingClientRect().top <= linea) { idx = i; } });
    return idx;
  }
  // La diapositiva de un elemento de la página: la que lo contiene o, si es una sección, la primera de esa sección
  function diapoDe(n) {
    for (var i = 0; i < diapos.length; i++) {
      var d = diapos[i];
      if (d.s.contains(n) || d.ancla === n) { return i; }
      var pos = d.marca || d.ancla;
      if (n.contains && n !== document.body && n.contains(pos)) { return i; }
    }
    return -1;
  }

  function entrar(desde) {
    if (!mazo) { armarMazo(); }
    var i = desde != null ? desde : desdeLectura();
    diapos.forEach(mudar);
    document.body.classList.add('charla');
    enCharla = true;
    avisoInicial = Date.now() + 5000;
    setTimeout(actualizarBarra, 5100);
    mostrar(i);
  }
  function salir() {
    var d = diapos[actual];
    diapos.forEach(devolver);
    document.body.classList.remove('charla');
    enCharla = false;
    // Vuelve a la lectura en el lugar de la última diapositiva. Se repite cuando los gráficos ya se redibujaron
    // al ancho de la página (cambian de alto y corren lo que está abajo)
    function ubicarse() { if (!enCharla && d && d.ancla && d.ancla.scrollIntoView) { d.ancla.scrollIntoView({ block: 'start', behavior: 'instant' }); } }
    ubicarse();
    requestAnimationFrame(function () { requestAnimationFrame(ubicarse); });
    setTimeout(ubicarse, 350);
  }
  function aplicar(modo, desde) {
    var charla = modo === 'charla';
    if (charla && !enCharla) { entrar(desde); } else if (!charla && enCharla) { salir(); }
    btn.textContent = charla ? '📖 Modo lectura' : '🎤 Modo charla';
    btn.setAttribute('aria-pressed', String(charla));
    try { localStorage.setItem(KEY, modo); } catch (e) { /* sin almacenamiento: no pasa nada */ }
    window.dispatchEvent(new Event('resize'));
    document.dispatchEvent(new Event('labo:modo'));
  }
  btn.addEventListener('click', function () { if (listo) { aplicar(enCharla ? 'lectura' : 'charla'); } });
  // Cuando se destapa una respuesta la diapositiva crece: se reacomoda con una transición suave
  document.addEventListener('click', function (e) {
    if (!enCharla || !e.target.closest) { return; }
    var b = e.target.closest('#mazo .acciones .btn-charla, #mazo .ans-velo button');
    var d = diapos[actual];
    if (!b || !d) { return; }
    d.s.classList.add('reacomoda');
    clearTimeout(d.reacomodo);
    d.reacomodo = setTimeout(function () { d.s.classList.remove('reacomoda'); }, 800);
    setTimeout(actualizarBarra, 0);
  });
  cbAnt.addEventListener('click', retroceder);
  cbSig.addEventListener('click', avanzar);
  window.addEventListener('resize', function () { if (enCharla) { encajar(diapos[actual]); } });

  document.addEventListener('keydown', function (e) {
    if (!enCharla || e.altKey || e.ctrlKey || e.metaKey) { return; }
    var t = e.target, tag = t && t.tagName;
    var campo = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable);
    var boton = tag === 'BUTTON' || tag === 'A' || tag === 'SUMMARY';
    var k = e.key, accion = null;
    // El control remoto manda RePág/AvPág: siempre mueven las diapositivas, aunque haya un control con el foco
    if (k === 'PageDown') { accion = avanzar; }
    else if (k === 'PageUp') { accion = retroceder; }
    else if (!campo && (k === 'ArrowRight' || k === 'ArrowDown')) { accion = avanzar; }
    else if (!campo && (k === 'ArrowLeft' || k === 'ArrowUp')) { accion = retroceder; }
    else if (!campo && !boton && k === ' ') { accion = e.shiftKey ? retroceder : avanzar; }
    else if (!campo && k === 'Home') { accion = function () { mostrar(0); }; }
    else if (!campo && k === 'End') { accion = function () { mostrar(diapos.length - 1); }; }
    else if (k === 'Escape') { accion = function () { aplicar('lectura'); }; }
    if (!accion) { return; }
    e.preventDefault();
    accion();
  });

  // Los links internos (el checklist, el índice de gráficos) llevan a la diapositiva que corresponde
  document.addEventListener('click', function (e) {
    if (!enCharla) { return; }
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) { return; }
    var id = decodeURIComponent(a.getAttribute('href').slice(1));
    var destino = id && document.getElementById(id);
    var i = destino ? diapoDe(destino) : -1;
    if (i >= 0) { e.preventDefault(); mostrar(i); }
  });

  // Arranque: el mazo se arma cuando los interactivos ya están montados (labo:montado)
  var inicial = 'lectura', diapoInicial = null;
  try {
    var q = new URLSearchParams(location.search);
    if (q.get('modo') === 'charla' || (q.get('modo') !== 'lectura' && localStorage.getItem(KEY) === 'charla')) { inicial = 'charla'; }
    var guardada = parseInt(q.get('diapo') || '', 10);
    if (!isNaN(guardada)) { diapoInicial = guardada - 1; }
    else if (inicial === 'charla') { guardada = parseInt(localStorage.getItem(KEY_DIAPO) || '', 10); if (!isNaN(guardada)) { diapoInicial = guardada; } }
  } catch (e) { /* idem */ }
  if (inicial === 'charla') { document.documentElement.classList.add('charla-cargando'); }
  function preparar() {
    if (listo) { return; }
    listo = true;
    document.documentElement.classList.remove('charla-cargando');
    if (inicial === 'charla') { aplicar('charla', diapoInicial); }
  }
  document.addEventListener('labo:montado', function () { setTimeout(preparar, 0); });
  window.addEventListener('load', function () { setTimeout(preparar, 0); });

  // Para las pruebas y para quien quiera manejar la charla desde la consola
  window.LaboCharla = {
    aplicar: aplicar, mostrar: mostrar, avanzar: avanzar, retroceder: retroceder,
    actual: function () { return actual; }, total: function () { return diapos.length; },
    diapositivas: function () { return diapos.map(function (d) { return d.s; }); }
  };
})();
