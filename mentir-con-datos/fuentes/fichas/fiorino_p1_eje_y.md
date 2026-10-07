# Parte 1: Ojo con el eje Y que puede exagerar diferencias insignificantes

- **Autor:** Santi Fiorino (@santifiorino.py)
- **Link:** https://www.instagram.com/reel/C-YxMXXPmRq/
- **Publicado:** 7 de agosto de 2024
- **Duración:** 1:25 · **idioma:** castellano
- **Transcripción:** faster-whisper `medium` (int8, CPU), con marcas de tiempo. Puede tener errores de palabras sueltas.

## Conceptos y módulo de la clase

| Minuto | Concepto | Módulo |
|---|---|---|
| 00:04 | Eje Y truncado en barras: pobreza de Nigeria, Chad y Etiopía con el eje de 60 a 62. Al llevarlo a 0, son casi iguales. | 10 |
| 00:37 | El mismo truco en líneas: pobreza 2014-2022 con el eje de 59 a 63. | 10 |
| 01:00 | Versión más burda: gráfico de Apple (CPU Performance vs Power) sin números en el eje. | 10 |
| 01:13 | Consejo: hacer zoom solo si las diferencias que se agrandan importan de verdad. | 10 |

## Qué muestra en pantalla

Barras verde/azul/rojo con banderas y eje 60–62; animación del eje hasta 0. Líneas Nigeria (verde) y Etiopía (rojo) 2014–2022. Captura de la presentación de Apple sin escala.

## Notas

Whisper transcribe «eje I» por «eje Y» y «enganioso» por «engañoso».

## Transcripción

[00:00] Los datos no mienten, pero se puede mentir con los datos.  
[00:04] Por ejemplo, veamos la pobreza de estos tres países africanos.  
[00:08] En este gráfico se ve claramente que Nigeria tiene un nivel de pobreza altísimo.  
[00:13] En particular, muchísimo más alto que el de Chad,  
[00:16] que a su vez tiene un nivel de pobreza bastante más alto que el de Etiopía.  
[00:21] Pero no sé si notaron que el eje I empieza en 60, lo cual es raro.  
[00:26] Veamos qué pasa si llevamos este número a 0.  
[00:29] Como pueden ver, la diferencia no era tan grande como parecía.  
[00:33] La pobreza en estos tres países es prácticamente la misma.  
[00:37] Este truco no solo sirve para gráficos de barra,  
[00:40] sino que también se puede aplicar a gráficos de líneas.  
[00:43] Por ejemplo, acá parece que la pobreza de Nigeria en 10 años aumentó un montón  
[00:49] y que la pobreza de Etiopía disminuyó mucho.  
[00:52] Pero otra vez, el eje I empieza en 59.  
[00:55] Y si hacemos que empiece en 0, la diferencia real es muy chica.  
[01:00] Y se puede hacer todavía más burdo como este gráfico,  
[01:03] sacado de una conferencia de Apple, en el cual directamente no hay ninguna referencia en el eje I.  
[01:09] En este caso, gráfico no te dice absolutamente nada.  
[01:13] Así que ojo con eso cuando vean un gráfico y cuando ustedes tengan que hacer uno,  
[01:17] háganle zoom solo si esos pequeños cambios que se enfatizan cuando le hacen zoom  
[01:22] son realmente importantes. Si no, es enganioso.  
