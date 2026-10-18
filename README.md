# labo-fce

Clases del **Laboratorio de Métodos Cuantitativos** (FCE-UBA).

## Cómo mentir con datos (y cómo darte cuenta)

Una clase de 2 horas sobre cómo se manipulan los números para que cuenten lo que uno quiere, y cómo darse cuenta cuando nos lo hacen a nosotros. Está en [`mentir-con-datos/`](mentir-con-datos/).

Sigue el camino de un número: primero lo que se **elige** (datos), después lo que se **calcula** (estadística) y al final lo que se **ve** (gráficos). Casi todos los ejemplos son de gestión, con una pyme inventada que cruza toda la clase (**Dulce Dato**, una fábrica de alfajores), y algunos son de economía, con datos argentinos reales.

- **Para los alumnos:** el link **https://manuelfsm03.github.io/labo-fce/mentir-con-datos/** (publicada en GitHub Pages). También sirve el archivo `mentir-con-datos/mentir-con-datos.html`, que funciona sin internet: se abre con doble clic.
- **Para proyectar:** el mismo archivo, con el botón **🎤 Modo charla** (abajo a la derecha). La clase se convierte en algo más de 100 diapositivas que se ajustan a la pantalla (sin las recetas de Python, que quedan en la página para estudiar), y cada una trae todo lo de ese momento: el gráfico junto con la pregunta sobre ese gráfico, el interactivo junto con su consigna.
  - Se avanza con ← → o con un control remoto (RePág/AvPág). En las preguntas, → primero destapa la respuesta y después pasa a la siguiente diapositiva.
  - Esc vuelve a la página en el mismo lugar, y lo que se tocó en los interactivos queda.
  - Se puede abrir directo en ese modo agregando `?modo=charla` al final de la dirección, o en una diapositiva puntual con `?modo=charla&diapo=24`.
- **Los gráficos:** cada interactivo se descarga como PNG o con sus datos en CSV, y al final hay un índice con todos.

### Publicación

La página se publica con GitHub Pages desde este mismo repo. La rama `gh-pages` tiene solo las páginas ya armadas; el código fuente vive en `main`. Para actualizarla, renderizar la clase y correr `./publicar.sh`: copia la página y la imagen para compartir el link, y pushea `gh-pages`.

### Cronograma docente

| Bloque | Min | Qué pasa |
|---|---|---|
| Prólogo | 8 | Dos titulares con el mismo dato. Tabla de Anscombe → "¿cómo se imaginan los gráficos?" → se destapa el cuarteto y alguien pasa a arrastrar un punto |
| Acto I · Datos (1–4) | 27 | Se presenta Dulce Dato. Definiciones: los clientes de la pyme, la EPH y ⭐ el INDEC intervenido (6) · muestras: el alfajor de pistacho y los aviones de Wald (7) · cherry picking: los noticieros del prólogo y el juego en equipos (5) · ley de Goodhart: el video, el bono por cliente nuevo y ⭐ la meta de dinero del Reino Unido en 1980 (9) |
| Acto II · Estadística (5–9) | 32 | Promedio y los sueldos de la pyme (5) · porcentajes: la deserción escolar, la píldora, −50% y +50%, y ⭐ nominal vs real (8) · tasa base y la máquina que acierta el 99% (6) · Simpson y el premio al mejor vendedor (5) · correlaciones espurias (8) |
| Acto III · Gráficos (10–15) | 28 | Eje Y truncado (6) · acumulados (4) · tortas, también en 3D (6) · pictogramas (4) · mapas (4) · ⭐ doble eje y escala log (4) |
| Epílogo | 18 | El encandilamiento de los números y el checklist (3) · **Sé el villano** en grupos (15) |

Suman unos 113 minutos sin pausa: quedan unos minutos de margen para preguntas dentro de las 2 horas. **Si hace falta una pausa o falta tiempo**, los ⭐ son extras de economía y se pueden saltear (unos 10 minutos; la página los deja para leer después). **Para preparar:** que tengan Colab a mano para el ejercicio final.

### Cómo se arma la página

Hecha con [Quarto](https://quarto.org) (Python + Jupyter). Los gráficos interactivos son JavaScript propio con Observable Plot y d3 embebidos, para que el HTML ande sin conexión. La estética es la del [taller de IA](https://datso653.github.io/taller-ia/) (papel con grano, partículas, serif condensada, amarillo y celeste, animaciones) y los gráficos siguen la estructura de los de [El Atlas](https://dschteingart.github.io/el-atlas-charts/) (título que cuenta el hallazgo, bajada, fuente y firma, descargas, franjas por gobierno).

```bash
python -m venv .venv && .venv/bin/pip install -r requirements.txt
cd mentir-con-datos
../.venv/bin/python datos/bajar_datos.py     # opcional: actualiza las series (datos.gob.ar)
QUARTO_PYTHON=../.venv/bin/python ../.venv/bin/quarto render index.qmd
```

| Archivo | Qué es |
|---|---|
| `mentir-con-datos/index.qmd` | La clase |
| `mentir-con-datos/labo.py`, `labo.mplstyle`, `tema.scss` | Paleta, estilo de los gráficos de matplotlib y tema de la página |
| `mentir-con-datos/assets/` | Componentes de charla (`charla.*`), estética (`estetica.js`, `fondo.js`), interactivos (`demos/`), Anscombe, tipografías y librerías embebidas |
| `mentir-con-datos/datos/` | Series en CSV, el script que las baja y `FUENTES.md` |
| `mentir-con-datos/fuentes/` | Fichas y transcripciones de los videos que inspiraron la clase |
| `mentir-con-datos/PLAN.md` | El plan de la clase, como se acordó |
