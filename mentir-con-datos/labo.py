"""Utilidades de la clase: paleta, estilo de matplotlib, caché de datos y montaje de los interactivos.

Nada de esto lo necesitan los alumnos: las recetas que se ven en la página corren igual en Colab
con matplotlib y pandas a secas.
"""
import hashlib
import json
from pathlib import Path

import pandas as pd
from matplotlib import font_manager

AQUI = Path(__file__).parent

# Paleta categórica: azul, terracota (la de El Atlas), verde azulado, mostaza (el amarillo del taller de IA,
# oscurecido para que se lea sobre papel) y ciruela. Validada con el validador de la guía dataviz sobre el
# papel #F2EEE5: banda de luminosidad, croma, separación para daltonismo (adyacentes ≥ 10,5), piso de visión
# normal (≥ 19) y contraste ≥ 3:1. DORADO es la mostaza y LADRILLO la terracota: se conservan los nombres
# para no tocar el resto del código.
AZUL, LADRILLO, VERDE, DORADO, CIRUELA = "#2B5797", "#BE5D32", "#00897B", "#B07F00", "#8A4F9E"
SERIES = [AZUL, LADRILLO, VERDE, DORADO, CIRUELA]
GRIS = "#A8A398"                       # contexto / de-énfasis
TINTA, TINTA_2, TINTA_3 = "#1A1A1A", "#4A4A4A", "#8A8579"
PAPEL, GRILLA, EJE = "#FBF9F4", "#E7E1D3", "#C9C2B2"
TRAMPA, HONESTO = "#B23B2E", "#2F6B52"  # estados: siempre con ícono y rótulo, nunca solo color


def estilo():
    """Registra las tipografías del sitio y aplica el estilo de la clase a matplotlib."""
    for f in sorted((AQUI / "assets/fonts/ttf").glob("*.ttf")):
        font_manager.fontManager.addfont(str(f))
    import matplotlib.style
    matplotlib.style.use(AQUI / "labo.mplstyle")


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


def torta_3d_svg(valores, colores, giro=54, inclinacion=26, ancho=420, distancia=4.5, espesor=0.18, etiqueta=""):
    """Torta 3D en perspectiva como SVG (la misma cuenta que el interactivo torta-3d.js).

    La "cámara" mira la torta inclinada `inclinacion` grados desde una distancia de `distancia` radios:
    lo que queda cerca se ve más grande y además muestra su costado.
    """
    import math

    def proyectar(th, abajo):
        a = math.radians(inclinacion)
        x, z = math.cos(th), math.sin(th)
        prof = z * math.cos(a) - (espesor * math.sin(a) if abajo else 0)
        s = distancia / (distancia - prof)
        return x * s, (z * math.sin(a) + (espesor * math.cos(a) if abajo else 0)) * s

    def arco(t0, t1, abajo):
        n = max(2, math.ceil(abs(t1 - t0) / (math.pi / 90)))
        return [proyectar(t0 + (t1 - t0) * k / n, abajo) for k in range(n + 1)]

    def oscuro(c):
        r, g, b = (int(c[i:i + 2], 16) for i in (1, 3, 5))
        return "#%02x%02x%02x" % (int(r * .62), int(g * .62), int(b * .62))

    total, acum, caras = sum(valores), 0, []
    for v, c in zip(valores, colores):
        a0 = acum
        acum += 360 * v / total
        t0, t1 = math.radians(a0 + giro), math.radians(acum + giro)
        costados = []
        for vuelta in (0, 1):
            lo, hi = max(t0, vuelta * 2 * math.pi), min(t1, vuelta * 2 * math.pi + math.pi)
            if hi > lo + 1e-6:
                costados.append(arco(lo, hi, False) + arco(hi, lo, True))
        caras.append((math.sin((t0 + t1) / 2), [(0, 0)] + arco(t0, t1, False), costados, c))
    puntos = [q for _, tapa, cs, _ in caras for q in tapa + [p for k in cs for p in k]]
    x0, x1 = min(p[0] for p in puntos), max(p[0] for p in puntos)
    y0, y1 = min(p[1] for p in puntos), max(p[1] for p in puntos)
    esc = (ancho - 20) / (x1 - x0)
    alto = int((y1 - y0) * esc) + 20

    def d(pts):
        return "M" + " L".join(f"{10 + (x - x0) * esc:.1f},{10 + (y - y0) * esc:.1f}" for x, y in pts) + "Z"

    partes = [f'<svg class="torta-3d-gancho" viewBox="0 0 {ancho} {alto}" role="img" aria-label="{etiqueta}">']
    for _, _, costados, c in sorted(caras, key=lambda k: k[0]):
        partes += [f'<path d="{d(k)}" fill="{oscuro(c)}" stroke="#FBF9F4" stroke-width="1"/>' for k in costados]
    partes += [f'<path d="{d(tapa)}" fill="{c}" stroke="#FBF9F4" stroke-width="1.5"/>' for _, tapa, _, c in caras]
    partes.append("</svg>")
    return "".join(partes)
