/* Infraestructura de los interactivos: paleta, formato, controles, tabla de datos y montaje.
   Cada demo se registra con Labo.registrar(nombre, fn) y recibe (contenedor, {datos, ...opciones}). */
window.Labo = (function () {
  var C = {
    azul: '#22689A', dorado: '#BD871C', verde: '#25855B', ciruela: '#8B4486', ladrillo: '#BD432F',
    gris: '#A6A69F', grisClaro: '#D3D1C8', tinta: '#1B222A', tinta2: '#5B6470', tinta3: '#7B8088',
    papel: '#F7F6F2', grilla: '#E4E0D5', eje: '#C9C4B6', trampa: '#B23B2E', honesto: '#2F6B52'
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
    return { actualizar: pinta };
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

  // Valores por defecto de Observable Plot con la estética de la clase
  function estiloPlot(spec) {
    spec.style = Object.assign({ fontFamily: 'Inter, sans-serif', fontSize: '13px', background: 'transparent', color: C.tinta, overflow: 'visible' }, spec.style || {});
    if (spec.marginTop == null) { spec.marginTop = 24; }
    return spec;
  }
  function plot(spec) { return Plot.plot(estiloPlot(spec)); }

  function registrar(nombre, fn) { registro[nombre] = fn; }
  function montar() {
    document.querySelectorAll('.demo[data-demo]').forEach(function (nodo) {
      if (nodo.getAttribute('data-montado')) { return; }
      var nombre = nodo.getAttribute('data-demo');
      var fn = registro[nombre];
      var payload = {};
      var s = nodo.querySelector('script[type="application/json"]');
      if (s) { try { payload = JSON.parse(s.textContent); } catch (e) { console.error('Datos inválidos en', nombre, e); } }
      if (!fn) { console.warn('Demo sin registrar:', nombre); return; }
      try { fn(nodo, payload); nodo.setAttribute('data-montado', '1'); }
      catch (e) { console.error('Falló el demo', nombre, e); nodo.appendChild(el('p', { 'class': 'demo-error', text: 'Este interactivo no pudo cargarse.' })); }
    });
  }
  document.addEventListener('DOMContentLoaded', montar);

  return { C: C, el: el, num: num, pct: pct, rango: rango, opciones: opciones, boton: boton, estado: estado, tabla: tabla, responsivo: responsivo, plot: plot, registrar: registrar, montar: montar };
})();
