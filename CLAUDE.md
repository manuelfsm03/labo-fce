# Instrucciones del repo

Clases del Laboratorio de Métodos Cuantitativos (FCE-UBA). Cada clase va en su carpeta, con su `PLAN.md` (lo acordado) y un HTML entregable. El `README.md` tiene el cronograma docente.

## Criterios para las clases (definidos por Manuel)

- **Ejemplos:** algunos económicos, con datos argentinos reales, y muchos **de gestión**, como si se tratara de una pyme. En *Cómo mentir con datos* la pyme es Dulce Dato, una fábrica de alfajores inventada que aparece en casi todos los módulos.
- **Tono de charla:** cada módulo abre con un gancho y tiene momentos de interacción con el aula (votaciones, "adiviná el número", desafíos, consignas en parejas).
- **Fuentes:** no se muestran dentro de los módulos; van todas a una sección final de **Recursos**.
- **Formato:** página HTML autocontenida, hecha con Quarto, que funcione sin internet. El código de los ejemplos va en Python.
- **Diseño:** la filosofía visual del taller de IA (https://datso653.github.io/taller-ia/): papel con grano, partículas en movimiento, serif condensada, tarjetas con borde negro y animaciones, pero con **paleta propia** (Manuel no quiere que parezca una copia): pistacho, frutilla, chocolate y dulce de leche, como un alfajor. La estructura y el tipo de gráficos, los de El Atlas de Daniel Schteingart (https://dschteingart.github.io/el-atlas-charts/): cada gráfico con antetítulo, título que cuenta el hallazgo, bajada, fuente, firma y descargas.
- **Modo charla en diapositivas que se entienden solas:** cada diapositiva trae todo lo que hace falta para su interacción. El gráfico va junto con la pregunta sobre ese gráfico y el interactivo junto con su consigna: nunca uno en una diapositiva y el otro en la siguiente. En el `.qmd` se arman con `::: {.diapo}`. Con `.dos` van en dos columnas: la imagen a la izquierda y la interacción a la derecha. `.media` y `.ancha` hacen más ancha la columna del gráfico y `.frase` agranda los textos cortos. La portada, las franjas de acto, la tapa de cada módulo y los antídotos son diapositivas solas. Las recetas de Python no van al modo charla: quedan en la página, para estudiar.
- La paleta de datos se valida con la guía `dataviz` antes de usarla.
- Todo dato inventado se dice inventado en la misma página.

## Flujo de trabajo

- Los cambios se hacen en la rama de la sesión y, cuando están verificados, se mergean a `main` sin preguntar (definido por Manuel).
- La clase está publicada para los alumnos en https://manuelfsm03.github.io/mentir-con-datos/, desde su propio repo público, `manuelfsm03/mentir-con-datos` (rama `gh-pages`, solo la página). No va en la página personal de Manuel. Al mergear a `main` un cambio de la clase, se actualiza también la versión publicada: `./publicar.sh` y push de `gh-pages`.

## Cómo mentir con datos

- El orden es **datos → cálculos/estadística → gráficos**: el camino de un número, desde que nace hasta el titular.
- El ejemplo de la deserción escolar de Zach Star (de 5% a 10%: ¿subió 5% o 100%?) va sí o sí.
