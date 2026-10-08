#!/usr/bin/env bash
# Copia la clase ya renderizada al sitio de GitHub Pages: el repo manuelfsm03.github.io, carpeta labo/.
# Queda en https://manuelfsm03.github.io/labo/mentir-con-datos/ cuando se pushea el sitio (rama main).
# Uso: ./publicar.sh ../manuelfsm03.github.io
set -euo pipefail
cd "$(dirname "$0")"
sitio="${1:?Pasá la ruta del repo manuelfsm03.github.io}"
destino="$sitio/labo/mentir-con-datos"
mkdir -p "$destino"
cp mentir-con-datos/mentir-con-datos.html "$destino/index.html"
cp mentir-con-datos/tarjeta.jpg "$destino/tarjeta.jpg"
# labo/ sola lleva a la clase (cuando haya más clases, acá va la lista)
if [ ! -f "$sitio/labo/index.html" ]; then
  cat > "$sitio/labo/index.html" <<'HTML'
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Laboratorio de Métodos Cuantitativos · FCE-UBA</title>
<meta http-equiv="refresh" content="0; url=mentir-con-datos/">
<link rel="canonical" href="https://manuelfsm03.github.io/labo/mentir-con-datos/">
</head>
<body>
<p><a href="mentir-con-datos/">Cómo mentir con datos (y cómo darte cuenta)</a></p>
</body>
</html>
HTML
fi
echo "Listo: $destino. Falta commitear y pushear el sitio (rama main)."
