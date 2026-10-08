#!/usr/bin/env bash
# Publica la clase en GitHub Pages desde este mismo repo: la rama gh-pages tiene solo las páginas ya armadas.
# Queda en https://manuelfsm03.github.io/labo-fce/mentir-con-datos/
# Uso: ./publicar.sh   (después de renderizar; PIE="..." agrega un párrafo al mensaje del commit)
set -euo pipefail
cd "$(dirname "$0")"
dir=$(mktemp -d)
if git ls-remote --exit-code --heads origin gh-pages >/dev/null; then
  git fetch -q origin gh-pages
  git worktree add -q --detach "$dir" origin/gh-pages
else
  git worktree add -q --detach "$dir"
  git -C "$dir" checkout -q --orphan gh-pages
  git -C "$dir" rm -rqf .
fi
mkdir -p "$dir/mentir-con-datos"
cp mentir-con-datos/mentir-con-datos.html "$dir/mentir-con-datos/index.html"
cp mentir-con-datos/tarjeta.jpg "$dir/mentir-con-datos/tarjeta.jpg"
touch "$dir/.nojekyll"
# La raíz lleva a la clase (cuando haya más clases, acá va la lista)
cat > "$dir/index.html" <<'HTML'
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Laboratorio de Métodos Cuantitativos · FCE-UBA</title>
<meta http-equiv="refresh" content="0; url=mentir-con-datos/">
<link rel="canonical" href="https://manuelfsm03.github.io/labo-fce/mentir-con-datos/">
</head>
<body>
<p><a href="mentir-con-datos/">Cómo mentir con datos (y cómo darte cuenta)</a></p>
</body>
</html>
HTML
git -C "$dir" add -A
if git -C "$dir" diff --cached --quiet; then
  echo "La versión publicada ya está al día."
else
  git -C "$dir" commit -q -m "Publicación de la clase (main $(git rev-parse --short HEAD))" ${PIE:+-m "$PIE"}
  git -C "$dir" push -q origin HEAD:gh-pages
  echo "Publicada: https://manuelfsm03.github.io/labo-fce/mentir-con-datos/"
fi
git worktree remove --force "$dir"
