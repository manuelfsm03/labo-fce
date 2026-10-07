"""Genera fuentes/fichas/*.md: metadatos, conceptos con minuto y módulo, gráficos y transcripción."""
import json, sys
from pathlib import Path

TRANS, SALIDA = Path(sys.argv[1]), Path(sys.argv[2])
SALIDA.mkdir(parents=True, exist_ok=True)

FUENTES = [
 dict(slug="fiorino_p1_eje_y", titulo="Parte 1: Ojo con el eje Y que puede exagerar diferencias insignificantes", autor="Santi Fiorino (@santifiorino.py)",
      url="https://www.instagram.com/reel/C-YxMXXPmRq/", fecha="7 de agosto de 2024", idioma="castellano",
      conceptos=[("00:04", "Eje Y truncado en barras: pobreza de Nigeria, Chad y Etiopía con el eje de 60 a 62. Al llevarlo a 0, son casi iguales.", "10"),
                 ("00:37", "El mismo truco en líneas: pobreza 2014-2022 con el eje de 59 a 63.", "10"),
                 ("01:00", "Versión más burda: gráfico de Apple (CPU Performance vs Power) sin números en el eje.", "10"),
                 ("01:13", "Consejo: hacer zoom solo si las diferencias que se agrandan importan de verdad.", "10")],
      graficos="Barras verde/azul/rojo con banderas y eje 60–62; animación del eje hasta 0. Líneas Nigeria (verde) y Etiopía (rojo) 2014–2022. Captura de la presentación de Apple sin escala.",
      notas="Whisper transcribe «eje I» por «eje Y» y «enganioso» por «engañoso»."),
 dict(slug="fiorino_p2_acumulados", titulo="Parte 2: Cuidado con los gráficos de totales/acumulaciones", autor="Santi Fiorino (@santifiorino.py)",
      url="https://www.instagram.com/reel/C-jCdPRvOqJ/", fecha="11 de agosto de 2024", idioma="castellano",
      conceptos=[("00:04", "Casos totales de COVID en Argentina en febrero de 2022: de 8,5 a casi 9 millones (+400 mil), con el eje de 8,2 a 9,0.", "11"),
                 ("00:25", "Un total acumulado solo puede subir o quedarse quieto.", "11"),
                 ("00:42", "Casos por día en el mismo mes: bajaron de ~40.000 a ~3.000.", "11"),
                 ("01:00", "Consejo: mirar a qué velocidad sube (por día), no el total.", "11")],
      graficos="Área roja de casos totales (eje truncado) y barras rojas de casos diarios en bajada.", notas=""),
 dict(slug="fiorino_p3_correlaciones", titulo="Parte 3: Ojo con las correlaciones", autor="Santi Fiorino (@santifiorino.py)",
      url="https://www.instagram.com/reel/C-v5hBXvOKB/", fecha="16 de agosto de 2024", idioma="castellano",
      conceptos=[("00:04", "Ventas de helado y ataques de tiburones a lo largo del año en EE.UU.", "9"),
                 ("00:24", "Correlación no implica causalidad; tercera variable: el calor del verano.", "9"),
                 ("01:00", "Casualidad pura: ejemplos de Tyler Vigen — contaminación en Gainesville y goles de Messi (r = 0,972); divorcios en el Reino Unido y películas de Disney (r = 0,925); yogur helado y crímenes violentos (r = 0,947); energía solar en Argentina y búsquedas de MrBeast (r = 0,989).", "9")],
      graficos="Dos líneas (helados en rojo, tiburones en azul) con la franja del verano. Capturas de cuatro gráficos de Vigen con doble eje.",
      notas="Whisper transcribe «vuelos de Messi» por «goles de Messi»."),
 dict(slug="fiorino_p4_tortas", titulo="Parte 4: Los gráficos de tortas (casi) nunca son buena idea", autor="Santi Fiorino (@santifiorino.py)",
      url="https://www.instagram.com/reel/C_Jvc83vC8B/", fecha="26 de agosto de 2024", idioma="castellano",
      conceptos=[("00:07", "«La torta guárdensela para el postre».", "12"),
                 ("00:13", "Los mismos datos (17, 18, 20, 22, 23) en barras y en torta: en la torta las porciones parecen iguales.", "12"),
                 ("00:29", "Con los datos dados vuelta, las barras muestran el cambio y la torta casi no.", "12"),
                 ("00:54", "Tortas con demasiadas porciones.", "12"),
                 ("01:08", "Sirven con 2 o 3 porciones y los porcentajes escritos.", "12")],
      graficos="Pares barras/torta en verde, azul, rojo, violeta y naranja; ejemplos de tortas con decenas de porciones.", notas=""),
 dict(slug="fiorino_p5_superficie", titulo="Parte 5: Más superficie no implica más gente", autor="Santi Fiorino (@santifiorino.py)",
      url="https://www.instagram.com/reel/C_ePCJ9vmMa/", fecha="3 de septiembre de 2024", idioma="castellano",
      conceptos=[("00:04", "Mapa electoral hipotético de EE.UU.: casi todo azul (Harris), pero los 5 estados más poblados en rojo (Trump).", "14"),
                 ("00:31", "Rojo: ~170 millones de personas; azul: ~164 millones. El 80% del mapa es azul y el 51% de la gente está en rojo.", "14"),
                 ("00:51", "Alternativas: intensidad por población, regiones más chicas (condados), hexágonos, círculos proporcionales.", "14")],
      graficos="Mapa de estados rojo/azul; tabla de población de Wikipedia; mapa con intensidad por población; mapa por condados.",
      notas="Whisper transcribe «17 millones» y «16 millones»: son ~170 y ~164 millones. «Camala» es Kamala Harris."),
 dict(slug="fiorino_p6_tortas_3d", titulo="Parte 6: Los gráficos de torta en 3D no sirven PARA NADA", autor="Santi Fiorino (@santifiorino.py)",
      url="https://www.instagram.com/reel/DEIZf4ppEGE/", fecha="28 de diciembre de 2024", idioma="castellano",
      conceptos=[("00:04", "Las tortas son casi siempre una mala idea; peor todavía, las tortas en 3D (responde a un comentario).", "12"),
                 ("00:20", "Torta 3D: la porción violeta parece la más grande, la roja un poco más chica y la verde y la azul casi iguales.", "12"),
                 ("00:30", "Los mismos datos en 2D: violeta y roja iguales (42% cada una) y la azul (11%) el doble que la verde (5%).", "12"),
                 ("00:42", "La cámara implícita del 3D: lo que está más cerca se ve más grande y lo que está lejos, más chico.", "12"),
                 ("01:04", "La cámara distorsiona justo lo que importa: el tamaño de las porciones.", "12")],
      graficos="Torta 3D de cuatro porciones (violeta, roja, verde y azul) sin números, y debajo la misma torta en 2D con 42%, 42%, 11% y 5%. Un ícono de cámara marca desde dónde mira el 3D.",
      notas=""),
 dict(slug="fiorino_p7_pictogramas", titulo="Parte 7, Pictogramas: Escalar una figura aumenta su área cuadráticamente", autor="Santi Fiorino (@santifiorino.py)",
      url="https://www.instagram.com/reel/DZgHjHzRt3K/", fecha="12 de junio de 2026", idioma="castellano",
      conceptos=[("00:14", "Empleados de una empresa: 10 en 2020, 30 en 2026 (×3).", "13"),
                 ("00:23", "Con «personitas» agrandadas, la diferencia se ve mucho más grande.", "13"),
                 ("00:40", "Pictograma de la altura promedio de mujeres por país (con eje truncado): la de India queda diminuta.", "13"),
                 ("00:53", "Barras: el área es proporcional al dato. Figuras: ×2 de alto → ×4 de área; ×3 → ×9.", "13"),
                 ("01:59", "Solución: apilar personitas en vez de agrandarlas.", "13")],
      graficos="Barras celestes con «×3»; personitas violetas escaladas; cuadrados y triángulos con su área subdividida; personitas apiladas.", notas=""),
 dict(slug="fiorino_p8_cherry_picking", titulo="Parte 8: Cherry Picking", autor="Santi Fiorino (@santifiorino.py)",
      url="https://www.instagram.com/reel/DZ8crWBxjtK/", fecha="23 de junio de 2026", idioma="castellano",
      conceptos=[("00:04", "Gráfico de un noticiero (TN) de la inflación mensual de mayo de 2025 a marzo de 2026, con el eje desde 1,5.", "10 y 3"),
                 ("00:25", "El eje horizontal: 11 meses, ¿por qué no 12?", "3"),
                 ("00:50", "Agregando los meses anteriores la subida desaparece; desde el comienzo del gobierno, la historia es la opuesta.", "3"),
                 ("01:06", "Definición de cherry picking.", "3"),
                 ("01:24", "Todos los gráficos son correctos; consultar varias fuentes y la fuente de los datos.", "3")],
      graficos="Captura del gráfico verde del noticiero; versiones propias con ventanas cada vez más largas; panel con cuatro ventanas.",
      notas="Whisper transcribe «hacer sumín» por «hacer zoom»."),
 dict(slug="zachstar_lie_with_statistics", titulo="This is How Easy It Is to Lie With Statistics", autor="Zach Star",
      url="https://www.youtube.com/watch?v=bVG2OQp6jEQ", fecha="4 de febrero de 2019", idioma="inglés",
      conceptos=[("00:00", "Target y la predicción de embarazos: el poder de la estadística (contexto, no se usa).", "—"),
                 ("02:22", "Caso Collins (Los Ángeles, 1964): «1 en 12 millones», multiplicando probabilidades como si fueran independientes.", "7"),
                 ("03:56", "Sally Clark: «1 en 73 millones».", "7"),
                 ("04:44", "«El 80% de los dentistas recomienda Colgate» (Reino Unido, 2007): respuesta múltiple.", "12"),
                 ("05:54", "Porcentaje vs puntos: deserción de 5% a 10% (+5 puntos o +100%); de 1 a 2 en un millón.", "6"),
                 ("07:27", "Píldora de tercera generación, Reino Unido 1995: «duplica el riesgo» de trombosis (1 → 2 cada 7.000).", "6"),
                 ("08:36", "Correlación o causalidad: piojos, molinos de viento, TV violenta, helados y golpes de calor, CO2 y obesidad, fumar y notas.", "9"),
                 ("10:56", "Berkeley 1973: 44% de hombres y 35% de mujeres admitidos; por departamento se invierte (Simpson).", "8"),
                 ("13:39", "Falacia del fiscal: P(A|B) no es P(B|A) (el perro y las cuatro patas).", "7"),
                 ("16:48", "Ejes truncados reales: Fox News (impuestos de Bush), CNN (Terri Schiavo), Casa Blanca (graduación 2015), Drake.", "10")],
      graficos="No se extrajeron cuadros: todo lo que usa la clase está en el audio y se recreó con datos propios.", notas=""),
 dict(slug="unsolicited_how_to_lie", titulo="How to Lie With Statistics (and get away with it)", autor="Unsolicited advice",
      url="https://www.youtube.com/watch?v=f4yZJVdJCG4", fecha="4 de junio de 2024", idioma="inglés",
      conceptos=[("02:04", "Definiciones tramposas: «el 90% de los perros tiene tendencias violentas». Pobreza y otras palabras con definiciones distintas.", "1"),
                 ("04:48", "Inferencias raras: altura declarada de los varones de EE.UU. (pico en 6 pies, CDC). Cocker spaniels en adiestramiento para generalizar a todos.", "1 y 2"),
                 ("07:47", "Muestras: tamaño (15 hombres → «66%»), Huff («un tercio de las universitarias se casa con un profesor»: eran 3), muestras de estudiantes, la experiencia personal como muestra.", "2"),
                 ("12:01", "El «Average Joe» y los 1,96 hijos; media, mediana y moda (5, 5, 15, 20 y 500 mil libras); la dispersión importa.", "5"),
                 ("16:17", "Tasa base: pareja vs desconocido, más muertes en choques que hace 100 años, detector de asesinos al 99%, Kahneman (bibliotecario o granjero), tiburones vs escaleras.", "7"),
                 ("19:26", "Proporciones: «se duplicaron las muertes por tiburón» (de 5 a 10), márgenes de 0,5% a 1%, cáncer +10% vs pececitos +300%, categorías a medida.", "6"),
                 ("23:03", "Correlación y causalidad: tercera causa (riqueza), causalidad al revés, Tyler Vigen, post hoc (Hume y la independencia de EE.UU.).", "9"),
                 ("26:59", "Atribución: culpar al gobierno en 2009; error fundamental de atribución.", "9"),
                 ("29:30", "El encandilamiento de los números: ni creyentes ciegos ni cínicos.", "epílogo")],
      graficos="No se extrajeron cuadros: el contenido usado está en el audio y en los capítulos de la descripción.",
      notas="Fuentes que cita el autor: Darrell Huff, *How to Lie with Statistics*, y Stephen K. Campbell, *Flaws and Fallacies in Statistical Thinking*. Los cortes de capítulo de la descripción coinciden con la transcripción."),
]

for f in FUENTES:
    filas = json.loads((TRANS / f"{f['slug']}.json").read_text())
    dur = filas[-1]["end"] if filas else 0
    md = [f"# {f['titulo']}", "",
          f"- **Autor:** {f['autor']}", f"- **Link:** {f['url']}", f"- **Publicado:** {f['fecha']}",
          f"- **Duración:** {int(dur // 60)}:{int(dur % 60):02d} · **idioma:** {f['idioma']}",
          "- **Transcripción:** faster-whisper `medium` (int8, CPU), con marcas de tiempo. Puede tener errores de palabras sueltas.", "",
          "## Conceptos y módulo de la clase", "", "| Minuto | Concepto | Módulo |", "|---|---|---|"]
    md += [f"| {t} | {c.replace(chr(124), chr(92) + chr(124))} | {m} |" for t, c, m in f["conceptos"]]
    md += ["", "## Qué muestra en pantalla", "", f["graficos"], ""]
    if f["notas"]:
        md += ["## Notas", "", f["notas"], ""]
    md += ["## Transcripción", ""]
    for r in filas:
        m, s = divmod(int(r["start"]), 60)
        md.append(f"[{m:02d}:{s:02d}] {r['text']}  ")
    (SALIDA / f"{f['slug']}.md").write_text("\n".join(md) + "\n")
    print("ficha", f["slug"], len(filas), "segmentos")
