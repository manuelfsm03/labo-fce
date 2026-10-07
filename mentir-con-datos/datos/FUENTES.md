# Fuentes de los datos

| Archivo | Qué es | Fuente |
|---|---|---|
| `ipc_regiones.csv` | IPC nivel general, nacional y por región, base dic 2016 = 100, mensual | INDEC, vía API de Series de Tiempo (datos.gob.ar) |
| `dolar_mensual.csv` | Dólar estadounidense, promedio mensual (pesos por dólar) | BCRA, vía datos.gob.ar (serie `175.1_DR_ESTANSE_0_0_20`) |
| `salarios.csv` | Índice de salarios, empleo registrado, base oct 2016 = 100 | INDEC, vía datos.gob.ar |
| `provincias.csv` | Población por jurisdicción, Censo 2022 (resultados definitivos) y superficie en km² | Población: INDEC, *Censo 2022. Indicadores demográficos por sexo y edad* (nov. 2023), cuadro "Población total por jurisdicción" (suma 45.892.285). Superficie: IGN, superficie continental; Tierra del Fuego sin Antártida ni islas del Atlántico Sur. El código de una letra es el de la grilla del mapa del sitio |

`bajar_datos.py` vuelve a bajar todo lo que viene de la API. `provincias.csv` se cargó a mano desde la publicación de INDEC.

Los datos de Dulce Dato (la pyme de la clase) son inventados y están escritos directamente en `index.qmd`, junto a cada ejemplo.
