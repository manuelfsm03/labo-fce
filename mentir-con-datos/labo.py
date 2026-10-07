"""Utilidades de la clase: paleta, estilo de matplotlib, caché de datos y montaje de los interactivos.

Nada de esto lo necesitan los alumnos: las recetas que se ven en la página corren igual en Colab
con matplotlib y pandas a secas.
"""
import hashlib
import json
from pathlib import Path

import matplotlib as mpl
import pandas as pd
from matplotlib import font_manager

AQUI = Path(__file__).parent

# Paleta categórica derivada de los colores del sitio. Validada con el validador de la guía dataviz
# sobre el papel #F7F6F2: banda de luminosidad, croma, separación para daltonismo (adyacentes ≥ 9,3)
# y piso de visión normal (≥ 15,9). El dorado queda en 2,9:1 de contraste, así que siempre va con
# rótulo o tabla de datos.
AZUL, DORADO, VERDE, CIRUELA, LADRILLO = "#22689A", "#BD871C", "#25855B", "#8B4486", "#BD432F"
SERIES = [AZUL, DORADO, VERDE, CIRUELA, LADRILLO]
GRIS = "#A6A69F"                       # contexto / de-énfasis
TINTA, TINTA_2, TINTA_3 = "#1B222A", "#5B6470", "#7B8088"
PAPEL, GRILLA, EJE = "#F7F6F2", "#E4E0D5", "#C9C4B6"
TRAMPA, HONESTO = "#B23B2E", "#2F6B52"  # estados: siempre con ícono y rótulo, nunca solo color


def estilo():
    """Registra las tipografías del sitio y aplica el estilo de la clase a matplotlib."""
    for f in sorted((AQUI / "assets/fonts/ttf").glob("*.ttf")):
        font_manager.fontManager.addfont(str(f))
    mpl.style.use(AQUI / "labo.mplstyle")


def coma(x, decimales=1):
    """Número con coma decimal y punto de miles, como se escribe en Argentina."""
    s = f"{x:,.{decimales}f}"
    return s.replace(",", "§").replace(".", ",").replace("§", ".")


MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]


def mes(fecha, anio=True):
    """'ago 26' / 'ago 2026' en castellano (strftime depende del locale y acá no hay es_AR)."""
    m = MESES[fecha.month - 1]
    return f"{m} {fecha.year % 100:02d}" if anio == "corto" else (f"{m} {fecha.year}" if anio else m)


def cache_api(carpeta="datos/cache"):
    """Hace que `pd.read_csv(url)` sirva las URLs de APIs públicas desde una copia local.

    Así las recetas muestran la URL real (la que los alumnos usan en Colab) y el render
    no depende de que la API esté arriba. Si falta la copia, la baja una vez.
    """
    carpeta = AQUI / carpeta
    carpeta.mkdir(parents=True, exist_ok=True)
    original = pd.read_csv
    if getattr(original, "_labo", False):
        return

    def leer(fuente, *args, **kwargs):
        if isinstance(fuente, str) and fuente.startswith(("http://", "https://")):
            local = carpeta / (hashlib.sha1(fuente.encode()).hexdigest()[:16] + ".csv")
            if not local.exists():
                import urllib.request
                pedido = urllib.request.Request(fuente, headers={"User-Agent": "Mozilla/5.0 (clase labo FCE-UBA)"})
                with urllib.request.urlopen(pedido, timeout=60) as r:
                    local.write_bytes(r.read())
            fuente = local
            kwargs.pop("storage_options", None)
        return original(fuente, *args, **kwargs)

    leer._labo = True
    pd.read_csv = leer


def demo(nombre, datos=None, **opciones):
    """Imprime el contenedor de un interactivo con sus datos como JSON. Usar con `#| output: asis`."""
    carga = json.dumps({"datos": datos, **opciones}, ensure_ascii=False, separators=(",", ":"))
    carga = carga.replace("</", "<\\/")
    print(f'<div class="demo" data-demo="{nombre}"><script type="application/json">{carga}</script></div>')


# Grilla de celdas de Argentina (una celda ≈ 90 km de lado), la misma del mapa de manuelfsm03.github.io.
# Rasterizada de los límites de departamentos de INDEC/IGN (github.com/mgaitan/departamentos_argentina).
GRILLA_AR = [
    "...........QQ", "........JJQQQI", "........JJQQQI", ".......QJJJQQIII", "......QQQQQQQDDII", "......CCQQQQDDDDIII",
    "......CCQQQVVVDDIII...N", "......CCCXXVVVDDDD....N", "......CCCXVVVVDDDDF..NN", ".....LCCCCVVVVUUUFFFF", ".....LLLLCVVVVUUUFFFF",
    "....RRLLLCVVVVUUUFFF", "....RRRLLLGGGVUUUFF", "....RRRRLGGGGGUUUHH", "....RRRRLGGGGGUUHH", "....RRRSSSGGGGUHHH",
    "....MMMMSSGGGGUHHH", ".....MMMSSGGGGUUHH", ".....MMMSSGGGUAAAA", "....MMMMSSGGAAAAAB", "....MMMMSSKKAAAAAAA",
    "....MMKKKKKKAAAAAAA", "...OMMKKKKKKAAAAAAAA", "...OOOKKKKKKAAAAAAAA", "...OOOPKKKKKAAAAAAA", "...OOOOPPKKKAAAAA",
    "...OOOPPPPPPAA", "..OOPPPPPPPPA", "..OPPPPPPP.PP", "..PPPPPPPP", "..EEEEEEEE.E", "..EEEEEEEE.E", "..EEEEEEEE",
    "..EEEEEEEE", "..EEEEEEE", "...EEEEE", "..TTTTT", "..TTTTTT", "..TTTTTTT", "..TTTTTTT", ".TTTTTTT", "TTTTTTT", "TTTTTT",
    "..TTT", "..TTTT..........WWW", ".....T.........W", "", "......W", "......WW", ".......WWW",
]


def mapa_celdas(ax, color_de, tam=1.0, hueco=0.12):
    """Dibuja el mapa de celdas en `ax`. `color_de(codigo)` devuelve el color de cada provincia."""
    from matplotlib.patches import Rectangle
    for r, fila in enumerate(GRILLA_AR):
        for c, k in enumerate(fila):
            if k != ".":
                ax.add_patch(Rectangle((c * tam, -r * tam), tam - hueco, tam - hueco, color=color_de(k), lw=0))
    ax.set_xlim(-0.5, 24.5)
    ax.set_ylim(-len(GRILLA_AR) - 0.5, 1.5)
    ax.set_aspect("equal")
    ax.axis("off")
