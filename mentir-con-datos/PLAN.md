# Plan: clase "Cómo mentir con datos (y cómo darte cuenta)" — Laboratorio de Métodos Cuantitativos, FCE-UBA

## Contexto

Manuel quiere una clase nueva del Labo (la materia es en Python; hoy las clases son .ipynb) con un hilo conductor:
mentir con datos, estadística y gráficos. La idea es mostrar cómo se manipulan los números para que cuenten lo que
uno quiere, y cómo darse cuenta cuando nos lo hacen a nosotros. El material base son 2 videos de YouTube, 7 reels de
Santi Fiorino, el cuarteto de Anscombe de su home y Spurious Correlations de Tyler Vigen.

**Definido con Manuel:**
- La clase dura unas 3 horas, con todos los módulos en vivo y un ejercicio final.
- Se suman ejemplos de economía argentina con datos reales.
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

**Diseño:** `tema.scss` con los tokens del sitio:

| Token | Valor |
|---|---|
| Fondo papel | `#F7F6F2` |
| Tinta | `#1B222A` |
| Dorado | `#A9832B` |
| Azul | `#2E5A6E` |
| Verde | `#2F6B52` |
| Rojo | `#B23B2E` |
| Tipografías | Source Serif 4, Inter, IBM Plex Mono |

- Un `labo.mplstyle` con la misma paleta.
- "Figura N. … *Nota/Fuente*" en cada figura.
- Antes de escribir los gráficos cargo la guía `dataviz`.

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

## 3. Organización: tres actos, "río arriba"

**Hilo:** cuanto más arriba en la cadena, más difícil de ver. La clase va de lo que se *ve* (gráficos) a lo que se
*calcula* (estadística) y a lo que se *elige* antes de calcular (datos).

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
| 0 | **Prólogo: "Los números no mienten… ¿o no?"** | Dos titulares. Después, cuatro tablas con la misma media, varianza y r: "¿cómo se imaginan el gráfico?" y se revela | Anscombe: un alumno arrastra un punto y el aula canta el R² | 12 |
| | **Acto I — Mentir con gráficos** | | | |
| 1 | Eje Y truncado | "¿Cuántas veces más alta es la barra A?" Gritan un número; la realidad es 4% | Slider del eje + *lie factor* en vivo, desafío "el más alto" | 8 |
| 2 | Acumulados | "Las ventas no paran de crecer: ¿compran acciones?" Votación | Toggle acumulado / por período: en realidad caen | 6 |
| 3 | Tortas | "¿Qué porción es más grande, B o D?" Votación. Después, una torta que suma 130% | Torta ↔ barras ordenadas | 5 |
| 4 | Pictogramas | "El PBI per cápita se duplicó. ¿Cuántas veces más grande se ve?" Adiviná | Slider de escala: área ×4 (×8 si es 3D) | 6 |
| 5 | Superficie ≠ gente | "¿Qué % de la población vive en lo pintado de verde?" Adiviná | Tu mapa de celdas: superficie vs "1 celda = N habitantes" (Censo 2022) | 7 |
| 6 | ⭐ Doble eje y log | "Correlación perfecta: ¿se convencen?" ¿El dólar se aceleró más en 2002 o en 2023? | Reescalar el 2° eje; lineal ↔ log | 8 |
| | *Pausa* | | | 10 |
| | **Acto II — Mentir con estadística** | | | |
| 7 | El promedio | "Si entra Messi al aula, ¿cuánto sube el ingreso promedio?" Adiviná | "Sumá un millonario": media vs mediana | 7 |
| 8 | Proporciones | "Reduce el riesgo a la mitad: ¿lo toman?" Votación. "La inflación bajó de 4% a 2%: ¿bajó 2% o 50%?" | Relativo ↔ absoluto. ⭐ Nominal vs real con el IPC del INDEC | 10 |
| 9 | Tasa base | "El test acierta el 99% y te da positivo: ¿qué chance hay de que estés enfermo?" Cada uno anota | 1.000 íconos con prevalencia, sensibilidad y especificidad | 8 |
| 10 | Simpson | "¿Qué hospital elegirías?" Votan antes y después de ver por grupo | Toggle agregado / por grupo | 8 |
| 11 | Correlación ≠ causalidad | "Adiviná el r" de margarina vs divorcios: 0,99. "¿Causa?" | Fabricá tu espuria: *random walks* y "buscar entre 1.000 series", competencia por el r más alto | 12 |
| | **Acto III — Mentir con datos** | | | |
| 12 | Cherry picking | Dos equipos con la misma serie: uno demuestra que mejoró y el otro que empeoró, 1 minuto cada uno | Selector de inicio y fin sobre una serie real (remuneración real / EMAE) | 8 |
| 13 | Muestras | "Encuesta de Instagram: 80% prefiere X. ¿Representa al país?" Aviones de Wald: "¿dónde los blindarían?" Votación | Selección y supervivencia | 8 |
| 14 | ⭐ Definiciones | "¿Es desocupado alguien que trabajó 1 hora la semana pasada?" Votación. ¿Cuánta inflación hubo en 2010? | Toggles de definición que mueven la tasa. IPC 2007-2015 y la emergencia estadística de 2016 | 8 |
| 15 | p-hacking | **Experimento en vivo**: cada uno tira una moneda 10 veces. ¿Alguien sacó 8 caras o más? "¡Tiene poderes!" Con 40 alumnos es casi seguro que aparezca uno | 20 tests al 5% (xkcd 882) | 8 |
| | **Epílogo — Manual de defensa personal** | "El encandilamiento de los números" (precisión falsa), checklist que junta todos los antídotos, ejercicio **"Sé el villano"** en grupos y ronda de "detectá la trampa" del otro grupo | | 33 |
| | **Recursos** | Links a los reels, los videos, Anscombe 1973, Vigen, Datasaurus, Huff, Tufte, Cairo (*How Charts Lie*), Bergstrom y West (*Calling Bullshit*), The Economist (*Mistakes, we've drawn a few*), Chequeado, Our World in Data, xkcd, datos.gob.ar e INDEC | | — |

Suma unos 175 min. Los ⭐ son extras de economía.

**Material base por módulo** (es solo para mí, no se muestra en la clase):
- Fiorino: P1→1, P2→2, P4→3, P7→4, P5→5, P3→11, P8→12.
- Unsolicited advice: 12:01→7, 19:26→8, 16:17→9, 04:48, 23:03 y 26:59→11, 07:47→13, 02:04→14, 29:30→epílogo.
- Zach Star se ubica cuando tenga la transcripción; probablemente cae en el Acto II.
- La Parte 6 de Fiorino no está en la lista; si existe y la querés, la sumo.

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
   - IPC nacional del INDEC (`148.3_INIVELNAL_DICI_M_26`), remuneración real (`310.1_*`), EMAE y tipo de cambio desde
     `apis.datos.gob.ar`.
   - Población y superficie por provincia (Censo 2022 / IGN).
   - 2 o 3 correlaciones de Vigen (CC BY 4.0).
   - Datos simulados con semilla fija para el resto.
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
