#!/usr/bin/env bash
# Copia la clase ya renderizada al repo público donde se publica: manuelfsm03/mentir-con-datos (GitHub Pages, rama
# gh-pages). Queda en https://manuelfsm03.github.io/mentir-con-datos/ cuando se pushea esa rama.
# Uso: ./publicar.sh ../mentir-con-datos
set -euo pipefail
cd "$(dirname "$0")"
destino="${1:?Pasá la ruta del repo mentir-con-datos (rama gh-pages)}"
cp mentir-con-datos/mentir-con-datos.html "$destino/index.html"
cp mentir-con-datos/tarjeta.jpg "$destino/tarjeta.jpg"
touch "$destino/.nojekyll"
echo "Listo: $destino. Falta commitear y pushear la rama gh-pages."
