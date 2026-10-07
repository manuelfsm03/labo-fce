/* Infraestructura de los interactivos: paleta, formato, controles, tabla de datos, montaje y la "figura" al estilo
   de El Atlas (antetítulo, título, bajada, fuente, firma, descargas en CSV y PNG, navegación y animación de entrada).
   Cada demo se registra con Labo.registrar(nombre, fn) y recibe (contenedor, {datos, ...opciones}). */
window.Labo = (function () {
  // dorado = la mostaza y ladrillo = la terracota de la paleta validada (ver labo.py)
  var C = {
    azul: '#2B5797', ladrillo: '#BE5D32', verde: '#00897B', dorado: '#B07F00', ciruela: '#8A4F9E',
    gris: '#A8A398', grisClaro: '#DCD6C8', tinta: '#1A1A1A', tinta2: '#4A4A4A', tinta3: '#8A8579',
    papel: '#FBF9F4', grilla: '#ECE7D8', eje: '#C9C2B2', trampa: '#B23B2E', honesto: '#2F6B52',
    amarillo: '#F5C900', celeste: '#A8C5DA'
  };
  var registro = {};

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) { for (var k in attrs) { if (k === 'text') { n.textContent = attrs[k]; } else if (attrs[k] != null) { n.setAttribute(k, attrs[k]); } } }
    (children || []).forEach(function (c) { if (c != null) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); } });
    return n;
  }

  // Números a la argentina: coma decimal, punto de miles
  function num(x, dec) {
    if (x == null || isNaN(x)) { return '–'; }
    var d = dec == null ? 1 : dec;
    var s = Math.abs(x).toFixed(d).split('.');
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (x < 0 ? '−' : '') + s.join(',');
  }
  function pct(x, dec) { return num(x, dec) + '%'; }

  // Control deslizante con rótulo y valor visible
  function rango(parent, o) {
    var id = 'c-' + Math.random().toString(36).slice(2, 8);
    var input = el('input', { type: 'range', id: id, min: o.min, max: o.max, step: o.paso || 1, value: o.valor });
    var out = el('output', { 'for': id });
    function pinta() { out.textContent = o.formato ? o.formato(+input.value) : input.value; }
    pinta();
    input.addEventListener('input', function () { pinta(); if (o.alCambiar) { o.alCambiar(+input.value); } });
    var wrap = el('div', { 'class': 'control rango' }, [el('label', { 'for': id, text: o.rotulo }), input, out]);
    parent.appendChild(wrap);
    return { input: input, valor: function () { return +input.value; }, fijar: function (v) { input.value = v; pinta(); if (o.alCambiar) { o.alCambiar(+v); } } };
  }

  // Botonera de opciones excluyentes (toggle)
  function opciones(parent, o) {
    var grupo = el('div', { 'class': 'control seg', role: 'group', 'aria-label': o.rotulo });
    if (o.rotulo) { grupo.appendChild(el('span', { 'class': 'seg-rotulo', text: o.rotulo })); }
    var actual = o.valor;
    var botones = o.items.map(function (it) {
      var b = el('button', { type: 'button', 'aria-pressed': String(it.valor === actual), text: it.texto });
      b.addEventListener('click', function () {
        actual = it.valor;
        botones.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        if (o.alCambiar) { o.alCambiar(actual); }
      });
      grupo.appendChild(b);
      return b;
    });
    parent.appendChild(grupo);
    return { valor: function () { return actual; }, fijar: function (v) { var i = o.items.findIndex(function (it) { return it.valor === v; }); if (i >= 0) { botones[i].click(); } } };
  }

  function boton(parent, texto, fn, clase) {
    var b = el('button', { type: 'button', 'class': 'btn-charla ' + (clase || ''), text: texto });
    b.addEventListener('click', fn);
    parent.appendChild(b);
    return b;
  }

  // Chip de estado: siempre ícono + rótulo, nunca solo color
  function estado(nodo, tipo, texto) {
    nodo.className = 'estado ' + tipo;
    nodo.textContent = texto;
  }

  // "Ver los datos": la vista de tabla de cada gráfico
  function tabla(parent, filas, columnas, titulo) {
    var d = el('details', { 'class': 'ver-datos' }, [el('summary', { text: titulo || 'Ver los datos' })]);
    var t = el('table');
    var thead = el('thead', null, [el('tr', null, columnas.map(function (c) { return el('th', { text: c.titulo, 'class': c.num ? 'num' : null }); }))]);
    var tbody = el('tbody');
    t.appendChild(thead); t.appendChild(tbody);
    function pinta(rows) {
      tbody.textContent = '';
      rows.forEach(function (r) {
        tbody.appendChild(el('tr', null, columnas.map(function (c) {
          var v = typeof c.valor === 'function' ? c.valor(r) : r[c.valor];
          return el('td', { text: v, 'class': c.num ? 'num' : null });
        })));
      });
    }
    pinta(filas);
    d.appendChild(el('div', { 'class': 'tabla-scroll' }, [t]));
    parent.appendChild(d);
    // Lo mismo que muestra la tabla es lo que baja "Descargar datos (CSV)"
    var raiz = parent.closest ? (parent.closest('.demo') || parent) : parent;
    raiz._csv = { columnas: columnas, filas: filas };
    return { actualizar: function (rows) { raiz._csv.filas = rows; pinta(rows); } };
  }

  // Ancho disponible y redibujo al cambiar el tamaño (o el modo charla)
  function responsivo(contenedor, dibujar) {
    var ultimo = 0;
    function correr() {
      var w = Math.floor(contenedor.clientWidth);
      if (w > 0 && Math.abs(w - ultimo) > 4) { ultimo = w; dibujar(w); }
    }
    if (window.ResizeObserver) { new ResizeObserver(correr).observe(contenedor); }
    window.addEventListener('resize', correr);
    correr();
    return function () { ultimo = 0; correr(); };
  }

  // En las diapositivas del modo charla los gráficos van un poco más bajos, para que entren con su consigna al lado
  function alto(nodo, h) { return nodo && nodo.closest && nodo.closest('#mazo') ? Math.round(h * 0.8) : h; }

  // Valores por defecto de Observable Plot con la estética de la clase
  function estiloPlot(spec) {
    spec.style = Object.assign({ fontFamily: '"Source Sans 3", sans-serif', fontSize: '13.5px', background: 'transparent', color: C.tinta, overflow: 'visible' }, spec.style || {});
    if (spec.marginTop == null) { spec.marginTop = 24; }
    return spec;
  }
  function plot(spec) { return Plot.plot(estiloPlot(spec)); }

  // Franjas de gobiernos, como en El Atlas: fondo alternado, separadores punteados y el nombre arriba.
  // periodos: [{nombre, desde, hasta}] con fechas ISO; se recortan al rango [desde, hasta] del gráfico.
  function franjas(periodos, desde, hasta, ancho, sinFondo) {
    var d0 = +desde, d1 = +hasta, span = d1 - d0;
    var ps = (periodos || []).map(function (q, i) {
      return { nombre: q.nombre, corto: q.corto, par: i % 2 === 1, a: new Date(Math.max(+new Date(q.desde + 'T00:00:00'), d0)), b: new Date(Math.min(+new Date(q.hasta + 'T00:00:00'), d1)) };
    }).filter(function (q) { return q.b > q.a; });
    ps.forEach(function (q) { q.mitad = new Date((+q.a + +q.b) / 2); q.px = (q.b - q.a) / span * ancho; });
    return [
      Plot.rect(sinFondo ? [] : ps.filter(function (q) { return q.par; }), { x1: 'a', x2: 'b', fill: '#F1ECE0', clip: true }),
      Plot.ruleX(ps.slice(1), { x: 'a', stroke: C.eje, strokeDasharray: '2,3', clip: true }),
      // Si el nombre no entra, va la sigla (CFK, AF...); si tampoco entra, nada
      Plot.text(ps.map(function (q) { q.rotulo = q.px > q.nombre.length * 6.6 + 10 ? q.nombre : (q.corto && q.px > q.corto.length * 6.6 + 8 ? q.corto : ''); return q; })
        .filter(function (q) { return q.rotulo; }), { x: 'mitad', frameAnchor: 'top', dy: 3, text: 'rotulo', fill: C.tinta3, fontSize: 10.5, fontWeight: 600 })
    ];
  }

  function registrar(nombre, fn) { registro[nombre] = fn; }

  // ---------- Descargas (como en El Atlas: CSV con BOM para Excel y PNG de la figura tal como se ve) ----------
  function bajar(blob, nombre) {
    var a = el('a', { href: URL.createObjectURL(blob), download: nombre });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }
  function aCSV(nodo, payload) {
    var cols, filas;
    if (nodo._csv) {
      cols = nodo._csv.columnas.map(function (c) { return c.titulo; });
      filas = nodo._csv.filas.map(function (r) { return nodo._csv.columnas.map(function (c) { return typeof c.valor === 'function' ? c.valor(r) : r[c.valor]; }); });
    } else if (Array.isArray(payload.datos) && payload.datos.length && typeof payload.datos[0] === 'object') {
      cols = Object.keys(payload.datos[0]);
      filas = payload.datos.map(function (r) { return cols.map(function (k) { return r[k]; }); });
    } else { return null; }
    // Columnas que son números con formato argentino ("4,7 ★", "17%", "1.390") pasan a número con punto decimal
    function numero(v) {
      if (typeof v === 'number') { return { n: v, u: '' }; }
      var m = /^([−-]?)(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?\s*(%|★)?$/.exec(String(v == null ? '' : v).trim());
      if (!m) { return null; }
      var n = parseFloat(m[2].replace(/\./g, '') + (m[3] ? '.' + m[3] : ''));
      return { n: m[1] ? -n : n, u: m[4] || '' };
    }
    cols = cols.slice();
    cols.forEach(function (c, j) {
      var vals = filas.map(function (f) { return numero(f[j]); });
      if (vals.length && vals.every(function (x) { return x; })) {
        var u = vals[0].u;
        filas.forEach(function (f, i) { f[j] = vals[i].n; });
        var suf = u === '★' ? 'estrellas' : '%';
        if (u && cols[j].indexOf(suf) < 0) { cols[j] += ' (' + suf + ')'; }
      }
    });
    var celda = function (v) {
      if (v == null || (typeof v === 'number' && isNaN(v))) { return ''; }
      var t = String(v);
      return /[",\n;]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
    };
    return [cols].concat(filas).map(function (f) { return f.map(celda).join(','); }).join('\n') + '\n';
  }
  var CSS_FIGURA = null;
  function cssFigura() {
    if (CSS_FIGURA) { return CSS_FIGURA; }
    var familias = /Source Serif 4|Source Sans 3/;
    var claves = /fig-|\.demo|\.kpi|\.estado|\.ley|\.control|mapa-|tb-|t3d|titular-demo|nota-hist|torta|:root/;
    var partes = [];
    Array.prototype.forEach.call(document.styleSheets, function (h) {
      var reglas; try { reglas = h.cssRules; } catch (e) { return; }
      if (!reglas) { return; }
      Array.prototype.forEach.call(reglas, function (r) {
        if (r.type === 5 && familias.test(r.cssText)) { partes.push(r.cssText); }
        else if (r.selectorText && claves.test(r.selectorText)) { partes.push(r.cssText); }
      });
    });
    CSS_FIGURA = partes.join('\n');
    return CSS_FIGURA;
  }
  function aPNG(fig, nombre) {
    var ancho = Math.ceil(fig.offsetWidth || fig.getBoundingClientRect().width);   // sin la escala de las diapositivas
    var clon = fig.cloneNode(true);
    // Estilos de texto computados, en línea: así el PNG usa las mismas tipografías aunque una regla no viaje
    var PROPS = ['font-family', 'font-size', 'font-weight', 'font-style', 'font-stretch', 'line-height', 'letter-spacing', 'text-transform', 'color'];
    var orig = fig.querySelectorAll('*'), copia = clon.querySelectorAll('*');
    Array.prototype.forEach.call(orig, function (o, i) {
      var c = copia[i]; if (!c || c.namespaceURI !== o.namespaceURI) { return; }
      var cs = getComputedStyle(o);
      PROPS.forEach(function (k) { c.style.setProperty(k, cs.getPropertyValue(k)); });
    });
    // Los lienzos <canvas> no se copian al clonar: van como imagen
    var originales = fig.querySelectorAll('canvas'), copias = clon.querySelectorAll('canvas');
    Array.prototype.forEach.call(copias, function (c, i) {
      c.replaceWith(el('img', { src: originales[i].toDataURL('image/png'), style: 'width:' + originales[i].style.width + ';height:' + originales[i].style.height }));
    });
    clon.querySelectorAll('.fig-barra, .demo-controles, details.ver-datos, script').forEach(function (n) { n.remove(); });
    clon.style.margin = '0'; clon.style.width = ancho + 'px';
    // Se mide el clon ya recortado, fuera de la pantalla
    var caja = el('div', { style: 'position:absolute;left:-99999px;top:0;width:' + ancho + 'px' });
    caja.appendChild(clon); document.body.appendChild(caja);
    var alto = Math.ceil(clon.getBoundingClientRect().height);
    caja.remove();
    var html = new XMLSerializer().serializeToString(clon);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + ancho + '" height="' + alto + '">' +
      '<foreignObject x="0" y="0" width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">' +
      '<style><![CDATA[*,*::before,*::after{box-sizing:border-box}figure{margin:0}' + cssFigura().replace(/]]>/g, ']] >') + ']]></style>' + html + '</div></foreignObject></svg>';
    var img = new Image();
    img.onload = function () {
      setTimeout(function () {
        var k = 2, cv = el('canvas');
        cv.width = ancho * k; cv.height = alto * k;
        var ctx = cv.getContext('2d');
        ctx.scale(k, k); ctx.fillStyle = C.papel; ctx.fillRect(0, 0, ancho, alto);
        try {
          ctx.drawImage(img, 0, 0, ancho, alto);
          cv.toBlob(function (b) { if (b) { bajar(b, nombre + '.png'); } else { avisar(); } }, 'image/png');
        } catch (e) { avisar(); }
      }, 200);
    };
    img.onerror = avisar;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    function avisar() { window.alert('Este navegador no pudo armar el PNG. Probá con Chrome o Firefox, o sacale una captura.'); }
  }

  // ---------- Animación de entrada (como en El Atlas: barras que crecen, líneas que se dibujan) ----------
  function moverse() { return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function animarEntrada(fig) {
    if (!moverse() || !Element.prototype.animate) { return; }
    var curva = 'cubic-bezier(.3,.7,.3,1)';
    fig.querySelectorAll('.demo-lienzo svg, .demo svg').forEach(function (svg) {
      if (svg.closest('.ig-mini')) { return; }
      svg.querySelectorAll('g[aria-label="bar"]').forEach(function (g) {
        var rs = Array.prototype.slice.call(g.querySelectorAll('rect'));
        if (!rs.length) { return; }
        var bb = rs.map(function (r) { return { x: +r.getAttribute('x'), y: +r.getAttribute('y'), w: +r.getAttribute('width'), h: +r.getAttribute('height') }; });
        var anchoFijo = bb.every(function (b) { return Math.abs(b.w - bb[0].w) < 0.5; });
        // La base es el borde que más se repite (todas las barras arrancan del mismo lado)
        var cuenta = {};
        bb.forEach(function (b) { (anchoFijo ? [b.y, b.y + b.h] : [b.x, b.x + b.w]).forEach(function (v) { var k = v.toFixed(1); cuenta[k] = (cuenta[k] || 0) + 1; }); });
        var base = +Object.keys(cuenta).sort(function (a, b) { return cuenta[b] - cuenta[a]; })[0];
        rs.forEach(function (r, i) {
          var b = bb[i];
          r.style.transformBox = 'fill-box';
          r.style.transformOrigin = anchoFijo ? (Math.abs(b.y + b.h - base) < 1 ? 'center bottom' : 'center top') : (Math.abs(b.x - base) < 1 ? 'left center' : 'right center');
          r.animate([{ transform: anchoFijo ? 'scaleY(0)' : 'scaleX(0)' }, { transform: 'none' }], { duration: 750, delay: Math.min(i * 28, 500), easing: curva, fill: 'backwards' });
        });
      });
      svg.querySelectorAll('g[aria-label="line"] path').forEach(function (path) {
        var largo = path.getTotalLength ? path.getTotalLength() : 0;
        if (!largo) { return; }
        path.style.strokeDasharray = largo;
        var an = path.animate([{ strokeDashoffset: largo }, { strokeDashoffset: 0 }], { duration: 1300, easing: curva, fill: 'backwards' });
        an.onfinish = function () { path.style.strokeDasharray = ''; };
      });
      svg.querySelectorAll('g[aria-label="area"] path, g[aria-label="text"], g[aria-label="rule"]').forEach(function (n) {
        n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 450, easing: 'ease-out', fill: 'backwards' });
      });
      var puntos = svg.querySelectorAll('g[aria-label="dot"] circle');
      Array.prototype.forEach.call(puntos, function (c, i) {
        c.style.transformBox = 'fill-box'; c.style.transformOrigin = 'center';
        c.animate([{ transform: 'scale(0)' }, { transform: 'none' }], { duration: 500, delay: Math.min(i * 12, 600), easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'backwards' });
      });
      if (!svg.querySelector('g[aria-label]')) {   // gráficos hechos a mano con d3: entran juntos
        svg.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: curva });
      }
    });
    fig.querySelectorAll('canvas').forEach(function (c) { c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700 }); });
  }

  // ---------- La figura de El Atlas alrededor de cada demo ----------
  var figuras = [];
  function figura(nodo, payload, nombre) {
    var f = payload.figura;
    var fig = el('figure', { 'class': 'fig-atlas', 'data-figura': nombre });
    var kicker = el('div', { 'class': 'fig-kicker' }, [el('span', { 'class': 'fig-n' }), el('span', { 'class': 'sep', text: '·' }), el('span', { text: f.tema || '' })]);
    var cabeza = el('div', { 'class': 'fig-cabeza' }, [
      kicker,
      el('p', { 'class': 'fig-titulo', role: 'heading', 'aria-level': '4', text: f.titulo || '' }),
      f.bajada ? el('p', { 'class': 'fig-bajada', text: f.bajada }) : null,
      el('div', { 'class': 'fig-regla', 'aria-hidden': 'true' })
    ]);
    nodo.parentNode.insertBefore(fig, nodo);
    fig.appendChild(cabeza);
    fig.appendChild(nodo);
    var fuente = el('div', { 'class': 'fig-fuente' }, [el('b', { text: 'Fuente: ' }), f.fuente || '']);
    if (f.nota) { fuente.appendChild(document.createTextNode(' ' + f.nota)); }
    fig.appendChild(el('figcaption', { 'class': 'fig-pie' }, [fuente, el('div', { 'class': 'fig-firma' }, [el('span', { 'class': 'f1', text: 'El Labo' }), el('span', { 'class': 'f2', text: 'Métodos Cuantitativos · FCE-UBA' })])]));
    var barra = el('div', { 'class': 'fig-barra' });
    var descargas = el('div', { 'class': 'fig-descargas' });
    var archivo = 'grafico-' + nombre;
    var bCsv = el('button', { type: 'button', text: 'Descargar datos (CSV)' });
    bCsv.addEventListener('click', function () {
      var txt = aCSV(nodo, payload);
      if (txt) { bajar(new Blob(['﻿' + txt], { type: 'text/csv;charset=utf-8' }), archivo + '.csv'); }
    });
    var bPng = el('button', { type: 'button', text: 'Descargar PNG' });
    bPng.addEventListener('click', function () { aPNG(fig, archivo); });
    descargas.appendChild(bCsv); descargas.appendChild(bPng);
    var nav = el('nav', { 'class': 'fig-nav', 'aria-label': 'Navegar entre gráficos' });
    var ant = el('button', { type: 'button', 'aria-label': 'Gráfico anterior', text: '←' });
    var cuenta = el('span', { 'class': 'fig-cuenta' });
    var sig = el('button', { type: 'button', 'aria-label': 'Gráfico siguiente', text: '→' });
    nav.appendChild(ant); nav.appendChild(cuenta); nav.appendChild(sig);
    barra.appendChild(descargas); barra.appendChild(nav);
    barra.appendChild(el('a', { 'class': 'fig-todos', href: '#todos-los-graficos', text: 'Ver todos los gráficos →' }));
    fig.appendChild(barra);
    fig._ui = { kicker: kicker, cuenta: cuenta, ant: ant, sig: sig, csv: bCsv, titulo: f.titulo, tema: f.tema };
    fig._csvPosible = function () { return !!(nodo._csv || (Array.isArray(payload.datos) && payload.datos.length && typeof payload.datos[0] === 'object')); };
    figuras.push(fig);
  }
  function numerar() {
    var lista = Array.prototype.slice.call(document.querySelectorAll('figure.fig-atlas'));
    figuras = lista;
    lista.forEach(function (fig, i) {
      var n = i + 1, u = fig._ui;
      fig.id = fig.id || ('grafico-' + n);
      fig.setAttribute('data-n', n);
      u.kicker.querySelector('.fig-n').textContent = 'Gráfico ' + n;
      u.cuenta.textContent = 'Gráfico ' + n + ' / ' + lista.length;
      u.ant.disabled = i === 0; u.sig.disabled = i === lista.length - 1;
      u.ant.onclick = function () { lista[i - 1].scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      u.sig.onclick = function () { lista[i + 1].scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      if (!fig._csvPosible()) { u.csv.remove(); }
    });
  }

  function montar() {
    document.querySelectorAll('.demo[data-demo]').forEach(function (nodo) {
      if (nodo.getAttribute('data-montado')) { return; }
      var nombre = nodo.getAttribute('data-demo');
      var fn = registro[nombre];
      var payload = {};
      var s = nodo.querySelector('script[type="application/json"]');
      if (s) { try { payload = JSON.parse(s.textContent); } catch (e) { console.error('Datos inválidos en', nombre, e); } }
      if (!fn) { console.warn('Demo sin registrar:', nombre); return; }
      if (payload.figura) { figura(nodo, payload, nombre); }
      try { fn(nodo, payload); nodo.setAttribute('data-montado', '1'); }
      catch (e) { console.error('Falló el demo', nombre, e); nodo.appendChild(el('p', { 'class': 'demo-error', text: 'Este interactivo no pudo cargarse.' })); }
    });
    numerar();
    document.dispatchEvent(new Event('labo:montado'));
  }
  document.addEventListener('DOMContentLoaded', montar);

  return { C: C, el: el, num: num, pct: pct, rango: rango, opciones: opciones, boton: boton, estado: estado, tabla: tabla, responsivo: responsivo, alto: alto, plot: plot, franjas: franjas, registrar: registrar, montar: montar, animarEntrada: animarEntrada, figuras: function () { return figuras; } };
})();
