"""Baja una vez las series que usa la clase y las guarda como CSV en esta carpeta.

Uso (desde la carpeta mentir-con-datos/):  python datos/bajar_datos.py
El render de la clase lee estos CSV y no depende de que las APIs estén arriba.
Fuente principal: API de Series de Tiempo de datos.gob.ar (https://apis.datos.gob.ar/series).
"""
from pathlib import Path

import pandas as pd

AQUI = Path(__file__).parent
API = "https://apis.datos.gob.ar/series/api/series/?ids={ids}&format=csv&limit=5000{extra}"
# La API rechaza el User-Agent por defecto de Python (403): mandamos uno cualquiera.
UA = {"User-Agent": "Mozilla/5.0 (clase labo FCE-UBA)"}

# IPC Nivel General, base dic 2016 = 100, mensual (INDEC)
IPC = {
    "nacional": "148.3_INIVELNAL_DICI_M_26",
    "gba": "148.3_INIVELGBA_DICI_M_21",
    "pampeana": "148.3_INIVELANA_DICI_M_26",
    "noreste": "148.3_INIVELNEA_DICI_M_21",
    "noroeste": "148.3_INIVELNOA_DICI_M_21",
    "cuyo": "148.3_INIVELUYO_DICI_M_22",
    "patagonia": "148.3_INIVELNIA_DICI_M_27",
}
# Dólar oficial (BCRA, "Dólar estadounidense"), promedio mensual. Cubre la convertibilidad y 2002.
DOLAR = {"dolar": "175.1_DR_ESTANSE_0_0_20"}
# Índice de salarios, empleo registrado (INDEC), base oct 2016 = 100
SALARIOS = {"salarios_registrados": "149.1_TL_REGIADO_OCTU_0_16"}
# EMAE (INDEC), base 2004: serie original y desestacionalizada
EMAE = {"emae": "143.3_NO_PR_2004_A_21", "emae_desest": "143.3_NO_PR_2004_A_31"}
# Producción anual de soja en toneladas (MAGyP). El año es el de inicio de la campaña (2022 = 2022/23).
SOJA = {"soja_t": "AGRO_A_Soja_0003"}


def serie(ids: dict, extra: str = "") -> pd.DataFrame:
    url = API.format(ids=",".join(ids.values()), extra=extra)
    df = pd.read_csv(url, parse_dates=["indice_tiempo"], storage_options=UA)
    df.columns = ["fecha", *ids.keys()]
    return df


def guardar(df: pd.DataFrame, nombre: str):
    df.to_csv(AQUI / nombre, index=False)
    print(f"{nombre:28s} {df.shape}  {df.fecha.min().date()} → {df.fecha.max().date()}")


def main():
    guardar(serie(IPC), "ipc_regiones.csv")
    guardar(serie(DOLAR, "&collapse=month&collapse_aggregation=avg"), "dolar_mensual.csv")
    guardar(serie(SALARIOS), "salarios.csv")
    guardar(serie(EMAE), "emae.csv")
    guardar(serie(SOJA), "soja.csv")


if __name__ == "__main__":
    main()
