# labo-fce

Clases del **Laboratorio de Métodos Cuantitativos** (FCE-UBA).

## Cómo mentir con datos (y cómo darte cuenta)

Una clase de unas 3 horas sobre cómo se manipulan los números para que cuenten lo que uno quiere, y cómo darse cuenta cuando nos lo hacen a nosotros. Está en [`mentir-con-datos/`](mentir-con-datos/).

- **Para los alumnos:** `mentir-con-datos/mentir-con-datos.html`. Es un solo archivo que funciona sin internet: se abre con doble clic.
- **Para proyectar:** el mismo archivo, con el botón **🎤 Modo charla** (abajo a la derecha). También se puede abrir directo en ese modo agregando `?modo=charla` al final de la dirección.

### Cronograma docente

| Bloque | Min | Qué pasa |
|---|---|---|
| Prólogo | 12 | Dos titulares con el mismo dato. Tabla de Anscombe → "¿cómo se imaginan los gráficos?" → se destapa el cuarteto y alguien pasa a arrastrar un punto |
| Acto I · Gráficos (1–6) | 40 | Eje Y truncado (8) · acumulados (6) · tortas (5) · pictogramas (6) · mapas (7) · ⭐ doble eje y escala log (8) |
| Pausa | 10 | |
| Acto II · Estadística (7–11) | 45 | Promedio y Messi (7) · porcentajes, la píldora y ⭐ nominal vs real (10) · tasa base y el caso Collins (8) · Simpson en Berkeley (8) · correlaciones espurias (12) |
| Acto III · Datos (12–15) | 32 | Cherry picking en equipos (8) · muestras y los aviones de Wald (8) · ⭐ definiciones y el INDEC 2007-2015 (8) · p-hacking con monedas (8) |
| Epílogo | 33 | El encandilamiento de los números (5) · checklist (3) · **Sé el villano** en grupos (20) · cierre (5) |

**Si falta tiempo**, los ⭐ son extras de economía y se pueden saltear (la página los deja para leer después). **Para preparar:** que traigan una moneda (o usen el celular) para el módulo 15, y que tengan Colab a mano para el ejercicio final.

### Cómo se arma la página

Hecha con [Quarto](https://quarto.org) (Python + Jupyter). Los gráficos interactivos son JavaScript propio con Observable Plot y d3 embebidos, para que el HTML ande sin conexión.

```bash
python -m venv .venv && .venv/bin/pip install -r requirements.txt
cd mentir-con-datos
../.venv/bin/python datos/bajar_datos.py     # opcional: actualiza las series (datos.gob.ar)
QUARTO_PYTHON=../.venv/bin/python ../.venv/bin/quarto render index.qmd
```

| Archivo | Qué es |
|---|---|
| `mentir-con-datos/index.qmd` | La clase |
| `mentir-con-datos/labo.py`, `labo.mplstyle`, `tema.scss` | Paleta, estilo de los gráficos y tema (los del sitio manuelfsm03.github.io) |
| `mentir-con-datos/assets/` | Componentes de charla, interactivos (`demos/`), Anscombe, tipografías y librerías embebidas |
| `mentir-con-datos/datos/` | Series en CSV, el script que las baja y `FUENTES.md` |
| `mentir-con-datos/fuentes/` | Fichas y transcripciones de los videos que inspiraron la clase |
| `mentir-con-datos/PLAN.md` | El plan de la clase, como se acordó |
