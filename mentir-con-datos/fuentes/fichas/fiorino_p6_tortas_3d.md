# Parte 6: Los gráficos de torta en 3D no sirven PARA NADA

- **Autor:** Santi Fiorino (@santifiorino.py)
- **Link:** https://www.instagram.com/reel/DEIZf4ppEGE/
- **Publicado:** 28 de diciembre de 2024
- **Duración:** 1:17 · **idioma:** castellano
- **Transcripción:** faster-whisper `medium` (int8, CPU), con marcas de tiempo. Puede tener errores de palabras sueltas.

## Conceptos y módulo de la clase

| Minuto | Concepto | Módulo |
|---|---|---|
| 00:04 | Las tortas son casi siempre una mala idea; peor todavía, las tortas en 3D (responde a un comentario). | 12 |
| 00:20 | Torta 3D: la porción violeta parece la más grande, la roja un poco más chica y la verde y la azul casi iguales. | 12 |
| 00:30 | Los mismos datos en 2D: violeta y roja iguales (42% cada una) y la azul (11%) el doble que la verde (5%). | 12 |
| 00:42 | La cámara implícita del 3D: lo que está más cerca se ve más grande y lo que está lejos, más chico. | 12 |
| 01:04 | La cámara distorsiona justo lo que importa: el tamaño de las porciones. | 12 |

## Qué muestra en pantalla

Torta 3D de cuatro porciones (violeta, roja, verde y azul) sin números, y debajo la misma torta en 2D con 42%, 42%, 11% y 5%. Un ícono de cámara marca desde dónde mira el 3D.

## Transcripción

[00:00] Los datos no mienten, pero se puede mentir con los datos.  
[00:04] En un capítulo dije que los gráficos de torta son casi siempre una mala idea  
[00:08] y que solo sirven en casos muy particulares,  
[00:11] pero como me comentan acá, hay algo peor todavía que son los gráficos de torta en 3D.  
[00:16] Son una mierda, no sirven para nada.  
[00:19] Veamos un ejemplo.  
[00:20] En este gráfico claramente la porción violeta es la más grande,  
[00:24] después le sigue la roja que es un poquito más chica,  
[00:27] y la verde y azul son prácticamente iguales.  
[00:30] Bueno, ahora miren estos mismos datos, pero en 2D.  
[00:33] El violeta y el rojo en realidad eran iguales y el azul era el doble que el verde.  
[00:38] Ninguna conclusión que sacamos del gráfico en 3D era real.  
[00:42] Y esto pasa porque al pasar una torta en 2D a una en 3D,  
[00:45] hay una cámara implícita en el espacio tridimensional que apunta al objeto a la torta.  
[00:50] Y como pasa en la vida real, lo que está más cerca se ve más grande  
[00:54] y lo que está más lejos se ve más chico.  
[00:56] Por ejemplo, en este caso que vimos antes, la cámara estaría más o menos acá,  
[01:00] cerca del violeta y del verde, por eso esos dos se ven más grandes.  
[01:04] Entonces, lo que hace esta cámara es distorsionar el tamaño de las porciones,  
[01:08] que es justamente lo que nos interesa ver, la distribución de los datos.  
[01:12] Si se distorsionan las proporciones, el gráfico no tiene sentido y no sirve para nada.  
