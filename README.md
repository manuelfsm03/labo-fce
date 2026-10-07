# labo-fce

Clases del **Laboratorio de Métodos Cuantitativos** (FCE-UBA).

## Cómo mentir con datos (y cómo darte cuenta)

Una clase de unas 3 horas sobre cómo se manipulan los números para que cuenten lo que uno quiere, y cómo darse cuenta cuando nos lo hacen a nosotros. Está en [`mentir-con-datos/`](mentir-con-datos/).

Sigue el camino de un número: primero lo que se **elige** (datos), después lo que se **calcula** (estadística) y al final lo que se **ve** (gráficos). Casi todos los ejemplos son de gestión, con una pyme inventada que cruza toda la clase (**Dulce Dato**, una fábrica de alfajores), y algunos son de economía, con datos argentinos reales.

- **Para los alumnos:** `mentir-con-datos/mentir-con-datos.html`. Es un solo archivo que funciona sin internet: se abre con doble clic.
- **Para proyectar:** el mismo archivo, con el botón **🎤 Modo charla** (abajo a la derecha). La clase se convierte en unas 130 diapositivas que se ajustan a la pantalla, y cada una trae todo lo de ese momento: el gráfico junto con la pregunta sobre ese gráfico, el interactivo junto con su consigna.
  - Se avanza con ← → o con un control remoto (RePág/AvPág). En las preguntas, → primero destapa la respuesta y después pasa a la siguiente diapositiva.
  - Esc vuelve a la página en el mismo lugar, y lo que se tocó en los interactivos queda.
  - Se puede abrir directo en ese modo agregando `?modo=charla` al final de la dirección, o en una diapositiva puntual con `?modo=charla&diapo=24`.
- **Los gráficos:** cada interactivo se descarga como PNG o con sus datos en CSV, y al final hay un índice con todos.

### Cronograma docente

| Bloque | Min | Qué pasa |
|---|---|---|
| Prólogo | 12 | Dos titulares con el mismo dato. Tabla de Anscombe → "¿cómo se imaginan los gráficos?" → se destapa el cuarteto y alguien pasa a arrastrar un punto |
| Acto I · Datos (1–4) | 32 | Se presenta Dulce Dato. Definiciones y los clientes de la pyme (8) · muestras, el alfajor de pistacho y los aviones de Wald (8) · cherry picking en equipos (8) · p-hacking con monedas y el botón de la tienda online (8) |
| Acto II · Estadística (5–9) | 45 | Promedio y los sueldos de la pyme (7) · porcentajes: la deserción escolar, la píldora, margen y markup, y ⭐ nominal vs real (10) · tasa base y la máquina que acierta el 99% (8) · Simpson y el premio al mejor vendedor (8) · correlaciones espurias (12) |
| Pausa | 10 | |
| Acto III · Gráficos (10–15) | 40 | Eje Y truncado (8) · acumulados (6) · tortas, también en 3D (5) · pictogramas (6) · mapas (7) · ⭐ doble eje y escala log (8) |
| Epílogo | 33 | El encandilamiento de los números (5) · checklist (3) · **Sé el villano** en grupos (20) · cierre (5) |

**Si falta tiempo**, los ⭐ son extras de economía y se pueden saltear (la página los deja para leer después). **Para preparar:** que traigan una moneda (o usen el celular) para el módulo 4, y que tengan Colab a mano para el ejercicio final.

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
