# Plan: clase "Cómo mentir con datos (y cómo darte cuenta)" — Laboratorio de Métodos Cuantitativos, FCE-UBA

## Contexto

Manuel quiere una clase nueva del Labo (la materia es en Python; hoy las clases son .ipynb) con un hilo conductor:
mentir con datos, estadística y gráficos. La idea es mostrar cómo se manipulan los números para que cuenten lo que
uno quiere, y cómo darse cuenta cuando nos lo hacen a nosotros. El material base son 2 videos de YouTube, 7 reels de
Santi Fiorino, el cuarteto de Anscombe de su home y Spurious Correlations de Tyler Vigen.

**Definido con Manuel:**
- La clase dura unas 3 horas, con todos los módulos en vivo y un ejercicio final.
- **Orden:** datos → cálculos/estadística → gráficos. La clase sigue el camino de un número, desde que nace hasta que
  llega al titular.
- **Ejemplos:** algunos económicos, con datos argentinos reales, y muchos **de gestión**, como si se tratara de una
  pyme. La pyme de la clase es **Dulce Dato**, una fábrica de alfajores inventada que aparece en casi todos los módulos:
  a veces le mienten a Marta, la dueña, y a veces miente ella.
- El ejemplo de la **deserción escolar de Zach Star** (de 5% a 10%: ¿subió 5% o 100%?) va sí o sí en la página.
- El entregable es **un HTML autocontenido para darles a los chicos**. Todavía no se publica nada.
- El código fuente va a un **repo privado nuevo, `manuelfsm03/labo-fce`**.
- Los videos los bajo yo.
- **Tono de charla**: cada módulo abre con un gancho y tiene momentos de interacción con el aula.
- **Las fuentes no se muestran en los módulos.** Van todas, junto con otros materiales, a una sección final de
  **Recursos**.

## 1. Videos: los bajo y transcribo yo (rutas probadas desde acá)

| Fuente | Ruta de descarga probada |
|---|---|
| 7 reels de Fiorino (P1–P5, P7, P8) | `uuinstagram.com/reel/<code>/` → `og:video` → MP4 en el CDN de Instagram. Respondió 7 de 7 |
| Zach Star, *This is How Easy It Is to Lie With Statistics* (18:55) | Wayback `web.archive.org/web/2oe_/http://wayback-fakeurl.archive.org/yt/bVG2OQp6jEQ` (65 MB). Respaldo: loader.to |
| Unsolicited advice, *How to Lie With Statistics…* (32:46) | Wayback, igual (331 MB). Respaldo: loader.to. Capítulos: definiciones 02:04 · inferencias raras 04:48 · muestras 07:47 · el promedio 12:01 · tasa base 16:17 · proporciones 19:26 · correlación 23:03 · atribución 26:59 · el encandilamiento de los números 29:30 |

**Proceso:**
1. Bajo los videos al scratchpad. Nunca se commitean: uno pesa más de 100 MB y además son contenido ajeno.
2. Saco el audio con ffmpeg y lo transcribo con `faster-whisper` `medium` (`es` para los reels, `en` para YouTube), con
   marcas de tiempo. Corre en segundo plano.
3. Extraigo cuadros clave: cambio de escena + 1 cada 2 s en los reels y 1 cada 10 s en YouTube. Los armo en hojas de
   contacto para revisarlos visualmente.
4. Escribo una ficha por fuente en `fuentes/fichas/<slug>.md` con transcripción con tiempos, conceptos con su minuto y
   módulo, qué muestra cada gráfico e ideas para recrear. `fuentes/README.md` deja los comandos para volver a bajar
   todo.
5. Con las fichas armo el mapa concepto → módulo. Te lo paso en el chat y sigo sin esperar.

## 2. Formato: Quarto para la página, interactivos en JS propio

**Quarto** (`.qmd`, motor Jupyter/Python) renderizado a **un solo HTML con `embed-resources: true`**:
- El código Python (pandas + matplotlib) se ejecuta al renderizar, así que la salida que se ve es la real.
- La prosa se escribe en Markdown.
- Trae índice, *callouts*, *tabsets* "tramposo | honesto", *code annotations* para la línea de la trampa, botón de
  copiar y notas al pie.

**Interactivos sin el OJS de Quarto.** El runtime baja Plot, Inputs y d3 de jsDelivr al abrir la página, así que sin
internet falla.
- Los demos van en **JS propio + Observable Plot 0.6.17 y d3 7.9.0 embebidos** (unos 490 KB), con controles `<input>`
  nativos y datos que Python pasa como JSON incrustado.
- Las fórmulas van en MathML.
- No hay iframes, porque los embeds de YouTube e Instagram fallan si la página se abre como archivo local.

**Diseño** (definido con Manuel después de la primera versión):
- **La estética del taller de IA** ([datso653.github.io/taller-ia](https://datso653.github.io/taller-ia/)): papel crema con
  grano y partículas de colores que flotan detrás de la página, títulos en Noto Serif Display condensada, texto en
  Poppins, amarillo `#F5C900` y celeste `#A8C5DA` planos, tarjetas con borde negro, pastillas como antetítulo, franjas
  de color al empezar cada acto y entradas animadas (bloques que suben, títulos palabra por palabra). En modo charla,
  la clase se recorre como un deck: ← → de parada en parada, con un pie fijo y un contador.
- **La estructura y los gráficos de El Atlas** ([dschteingart.github.io/el-atlas-charts](https://dschteingart.github.io/el-atlas-charts/)):
  cada interactivo es un "Gráfico N" con antetítulo, título que cuenta el hallazgo, bajada en itálica (Source Serif 4),
  controles en botonera, etiquetas directas, franjas por gobierno en las series largas, fuente y firma, descargas en
  CSV y PNG, navegación ← Gráfico n / N → y un índice final con todos los gráficos. Barras que crecen y líneas que se
  dibujan al aparecer.
- Paleta de datos validada con la guía `dataviz`: azul `#2B5797`, terracota `#BE5D32`, verde azulado `#00897B`,
  mostaza `#B07F00` y ciruela `#8A4F9E`. El mismo estilo en `labo.mplstyle` (Source Sans 3).
- Se respeta "reducir movimiento": sin partículas ni animaciones.

**Anscombe:** se porta `script.js:254-413` con el CSS de `style.css:332-478, 1066-1089, 1150-1151`. Mismo look y
comportamiento, sobre la banda verde con grilla. La consola tiene pestañas Python (por defecto) y R (la de tu home).

**Componentes de charla** (JS/CSS propios; funcionan proyectados y también para estudiar en casa):
- 🙋 **Pregunta al aula**: opciones A/B/C para votar a mano alzada y un botón **Revelar** que desenfoca la respuesta.
- 🎯 **Adiviná el número**: cada uno anota su estimación y después se revela; en casa, la página dice qué tan cerca
  quedó.
- ⏱️ **Desafío**: una consigna con el demo, del tipo "¿quién logra el *lie factor* más alto?".
- 💬 **Charlalo con quien tengas al lado**: consigna corta en parejas.
- **Modo charla** (botón): letra grande, recetas de código plegadas e índice oculto, para proyectar. El modo lectura
  es para después.
- Las **🕵️ tarjetas antídoto** de cada módulo se juntan solas en el checklist del epílogo, con links de vuelta a cada
  módulo.

## 3. Organización: tres actos, el camino de un número

**Hilo:** un número nace (alguien elige qué medir, a quién y qué período), se calcula (un promedio, un porcentaje, una
correlación) y se dibuja. En cada paso se puede hacer trampa, y cuanto más cerca del origen, más difícil es verla. La
clase recorre ese camino en orden: primero lo que se *elige* (datos), después lo que se *calcula* (estadística) y al
final lo que se *ve* (gráficos).

**Cada módulo tiene seis bloques:**
1. 🎣 **Gancho**: un titular, gráfico o pregunta provocadora.
2. 🙋 **Votación o predicción del aula**, antes de revelar.
3. **El truco**: corto.
4. 🎛️ **Hacelo vos**: interactivo con desafío.
5. 🧪 **La receta**: Python tramposo vs honesto, plegada en modo charla.
6. 🕵️ **Antídoto**.

**Apertura de la clase (dentro del prólogo):** "Un gráfico, dos titulares". La misma serie aparece graficada dos veces
con titulares opuestos y se pregunta "¿cuál es verdad?". Respuesta: las dos, y ninguna. La promesa de la clase: hoy
aprenden a hacer esto y a que no se los hagan.

| # | Módulo | 🎣 Gancho + 🙋 interacción | 🎛️ Hacelo vos | Min |
|---|---|---|---|---|
| 0 | **Prólogo: "Los números no mienten… ¿o no?"** | Dos titulares opuestos con la misma inflación. Después, cuatro tablas con la misma media, varianza y r: "¿cómo se imaginan el gráfico?" y se revela | Anscombe: un alumno arrastra un punto y el aula canta el R² | 12 |
| | **Acto I — Mentir con datos** (arranca con la ficha de Dulce Dato) | | | |
| 1 | Definiciones | "Tenemos 4.800 clientes": ¿cuántos clientes tiene Dulce Dato? ¿Es desocupado quien trabajó una hora? ⭐ ¿Cuánta inflación hubo en 2010? | Toggles de definición que mueven la tasa de desocupación; receta de "clientes activos" con pandas | 8 |
| 2 | Muestras | Encuesta en el Instagram de la marca: "al 71% le encanta el alfajor de pistacho". ¿Lo lanzan? Aviones de Wald | Encuesta en Instagram vs muestra aleatoria | 8 |
| 3 | Cherry picking | El gráfico de un noticiero con la inflación de mayo de 2025 a marzo de 2026. Dos equipos con la misma serie | Selector de inicio y fin sobre la inflación mensual del INDEC | 8 |
| 4 | p-hacking | **Experimento en vivo**: cada uno tira una moneda 10 veces. ¿Alguien sacó 8 caras o más? | 20 colores del botón «Comprar» de la tienda online: tests A/B al 5% (xkcd 882) | 8 |
| | **Acto II — Mentir con estadística** | | | |
| 5 | El promedio | "En esta empresa el sueldo promedio es de 2,1 millones": ¿cuánto cobra la persona del medio? Adiviná | Los 24 sueldos de la pyme: lo que se paga la dueña mueve la media y casi no la mediana | 7 |
| 6 | Porcentajes | **La deserción escolar pasa de 5% a 10%: ¿subió 5% o 100%?** De 1 a 2 en un millón. La píldora de 1995. Las cuentas de la pyme: −50% y +50%, margen contra markup | Riesgo relativo ↔ absoluto. ⭐ Nominal vs real con el IPC del INDEC | 10 |
| 7 | Tasa base | La máquina de control de calidad que "acierta el 99%": ¿qué chance hay de que un alfajor descartado esté fallado? Adiviná. Collins y Sally Clark | 1.000 alfajores con la tasa de falla y la precisión de la máquina | 8 |
| 8 | Simpson | ¿A quién le dan el premio al mejor vendedor, a Diego o a Laura? Berkeley 1973 | Todo junto ↔ por tipo de cliente | 8 |
| 9 | Correlación ≠ causalidad | "Adiviná el r" de Messi y Gainesville. Publicidad y ventas, los exhibidores, el envoltorio nuevo | Fabricá tu espuria: *random walks* | 12 |
| | *Pausa* | | | 10 |
| | **Acto III — Mentir con gráficos** | | | |
| 10 | Eje Y truncado | Publicidad de Dulce Dato: 4,7 contra 4,4 estrellas con el eje desde 4,3 | Slider del eje + *lie factor* en vivo, desafío "el más alto" | 8 |
| 11 | Acumulados | "Ya vendimos 3,7 millones de alfajores": ¿crecieron las ventas? | Acumulado ↔ mes a mes: caen desde abril | 6 |
| 12 | Tortas | Ventas por sabor en 2025 y 2026; la encuesta "¿por qué nos elegís?" que suma 184%; la torta 3D de una agencia | Torta ↔ barras ordenadas; torta 3D que se gira e inclina | 5 |
| 13 | Pictogramas | "Casi duplicamos las ventas": ¿cuántas veces más grande se ve el alfajor? Adiviná | Slider de escala: barra, alfajor agrandado, alfajores apilados | 6 |
| 14 | Superficie ≠ gente | La distribuidora que "llega al 73% del país": ¿qué % de la gente vive ahí? Adiviná | Mapa de celdas: territorio vs gente (Censo 2022) | 7 |
| 15 | ⭐ Doble eje y log | ¿Los salarios le ganaron al dólar? ¿El dólar se disparó más en 2002 o en 2023? | Reescalar el 2° eje; lineal ↔ log | 8 |
| | **Epílogo — Manual de defensa personal** | "El encandilamiento de los números" (precisión falsa), checklist que junta todos los antídotos, ejercicio **"Sé el villano"** en grupos (ventas, sueldos y encuesta de Dulce Dato, o la inflación del INDEC) y ronda de "detectá la trampa" del otro grupo | | 33 |
| | **Recursos** | Links a los reels, los videos, Anscombe 1973, Vigen, Datasaurus, Huff, Tufte, Cairo (*How Charts Lie*), Bergstrom y West (*Calling Bullshit*), The Economist (*Mistakes, we've drawn a few*), Chequeado, Our World in Data, xkcd, datos.gob.ar e INDEC | | — |

Suma unos 172 min. Los ⭐ son extras de economía.

**Material base por módulo** (es solo para mí, no se muestra en la clase):
- Fiorino: P8→3 (y el eje del 10), P3→9, P1→10, P2→11, P4→12, P6→12 (tortas en 3D), P7→13, P5→14.
- Unsolicited advice: 02:04→1, 04:48→1 y 2, 07:47→2, 12:01→5, 19:26→6, 16:17→7, 23:03 y 26:59→9, 29:30→epílogo.
- Zach Star: 05:54 (deserción) y 07:27 (píldora)→6, 02:22, 03:56 y 13:39→7, 10:56→8, 08:36→9, 16:48→10, 04:44→12.

## 4. Implementación

**Repo:** creo `manuelfsm03/labo-fce` **privado** (`create_repository`, README inicial en `main`) y lo agrego a la
sesión con `add_repo` y acceso de push. Si la app de GitHub de Claude no tiene acceso al repo nuevo, te pido que lo
habilites. Trabajo en `ccr-83a17c47-aj2ozp` y mergeo a `main` cuando me digas. No toco `manuelfsm03.github.io` ni
`msc-becas-2027`.

```
labo-fce/
├── README.md                      # qué hay + cronograma docente (tabla de minutos)
├── requirements.txt               # quarto-cli 1.10, jupyter, pandas, numpy, matplotlib, statsmodels, requests
└── mentir-con-datos/
    ├── PLAN.md                    # este plan, asentado
    ├── _quarto.yml                # html, embed-resources, toc, code-copy, html-math-method: mathml
    ├── index.qmd                  # la clase
    ├── tema.scss · labo.mplstyle
    ├── assets/vendor/             # d3.min.js 7.9.0, plot.umd.min.js 0.6.17 (versiones fijas)
    ├── assets/anscombe.{js,css} · assets/tilemap.js · assets/charla.{js,css} (votaciones, revelar, modo charla, antídotos)
    ├── assets/demos/*.js          # uno por interactivo
    ├── datos/*.csv · datos/bajar_datos.py   # se bajan una vez; el render no depende de APIs
    ├── fuentes/fichas/*.md · fuentes/cuadros/*.jpg · fuentes/README.md
    └── mentir-con-datos.html      # ENTREGABLE
```

**Pasos**
1. Crear el repo y la estructura, guardar este plan como `PLAN.md` e instalar `quarto-cli` y el entorno con pip.
2. Lanzar en segundo plano la descarga y transcripción de los 9 videos.
3. **Esqueleto primero**: tema, mplstyle, librerías embebidas, Anscombe portado, componentes de charla y el demo del
   eje Y. Render y prueba **sin red** en Playwright, para validar la arquitectura antes del contenido.
4. Fichas y mapa concepto → módulo (te lo paso en el chat).
5. `bajar_datos.py`:
   - IPC nacional y por región del INDEC (`148.3_INIVELNAL_DICI_M_26` y las regiones), salarios registrados y tipo de
     cambio desde `apis.datos.gob.ar`.
   - Población y superficie por provincia (Censo 2022 / IGN).
   - Una correlación de Vigen (CC BY 4.0).
   - Los números de Dulce Dato son inventados y van escritos en `index.qmd`, junto a cada ejemplo.
6. Escribir los módulos en orden con la estructura de seis bloques, en tono de charla (segunda persona, preguntas al
   aula). Después, el epílogo y Recursos.
7. Render final, verificación y commit + push. Te paso `mentir-con-datos.html` como archivo (SendUserFile), sin
   publicarlo.

## 5. Verificación

- `quarto render` sin errores, desde un entorno limpio (`requirements.txt`).
- **Prueba offline**: el HTML se abre en Playwright con toda la red bloqueada. Todos los demos, el Anscombe y los
  componentes de charla tienen que andar, y la consola no puede tener errores salvo los links externos.
- Capturas en 1280 px, 390 px (celular) y en **modo charla** a 1920 px (proyector): sin scroll horizontal y legibles.
- Por script se verifica:
  - Cada demo (eje → *lie factor*; arrastre del Anscombe → consola; Simpson invierte el signo; cherry picking
    recalcula).
  - Cada **Revelar** y **Adiviná**.
  - El checklist del epílogo junta los 15 antídotos.
- Chequeos numéricos:
  - Anscombe: medias 9 y 7,50, r = 0,816 e ŷ = 3,00 + 0,50x.
  - Tasa base: el valor predictivo positivo es 50% con 1%/99%/99%.
  - Monedas: P(≥8 caras en 10) ≈ 5,5% para uno y ≈ 89% de que aparezca al menos uno entre 40.
  - Vigen: el r coincide con el publicado.
  - IPC: el último dato coincide con la API.
- Transcripciones cotejadas con los capítulos y los cuadros.
- El HTML pesa menos de 5 MB y se abre con doble clic.
