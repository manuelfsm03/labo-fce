# Fuentes audiovisuales de la clase

Fichas de los 10 videos que inspiraron la clase: link, conceptos con su minuto y el módulo donde se usan, qué muestran en pantalla y la transcripción completa. Este material es solo de referencia para armar y actualizar la clase; la página no muestra nada de esto, solo los linkea en **Recursos**.

| Ficha | Fuente |
|---|---|
| `fichas/fiorino_p1_eje_y.md` … `fiorino_p8_cherry_picking.md` | Serie de reels de Santi Fiorino (@santifiorino.py), partes 1 a 8 |
| `fichas/zachstar_lie_with_statistics.md` | Zach Star, *This is How Easy It Is to Lie With Statistics* (YouTube, 2019) |
| `fichas/unsolicited_how_to_lie.md` | Unsolicited advice, *How to Lie With Statistics (and get away with it)* (YouTube, 2024) |
| `cuadros/*.jpg` | Una hoja de contacto por reel (un cuadro cada 2 s) con los gráficos clave |

Los videos **no** están en el repo: pesan mucho (uno pasa los 100 MB) y son contenido ajeno.

## Cómo se armaron (para repetirlo)

Los comandos están en `scripts/`. Se corren desde fuera de la carpeta de descargas, pasándole las rutas:

```bash
mkdir -p videos transcripciones
bash scripts/bajar_videos.sh videos            # reels vía uuinstagram.com, YouTube vía Wayback Machine
python -m venv venv-whisper && venv-whisper/bin/pip install faster-whisper
venv-whisper/bin/python -I scripts/transcribir.py es transcripciones videos/fiorino_*.mp4
venv-whisper/bin/python -I scripts/transcribir.py en transcripciones videos/zachstar_*.mp4 videos/unsolicited_*.mp4
python -I scripts/fichas.py transcripciones fichas
```

- **Reels:** Instagram pide iniciar sesión para bajar el video; el proxy público `uuinstagram.com` (InstaFix) devuelve el MP4 original del CDN de Instagram.
- **YouTube:** desde servidores en la nube YouTube pide "confirmar que no sos un bot". Los dos videos están archivados en la Wayback Machine (`web.archive.org/web/2oe_/http://wayback-fakeurl.archive.org/yt/<id>`). Respaldo: loader.to.
- **Transcripción:** faster-whisper, modelo `medium` en CPU (int8). El audio se decodifica con ffmpeg porque la versión de PyAV instalada no era compatible.
- **Cuadros:** ffmpeg, un cuadro cada 2 s en los reels, armados en hojas de contacto de 6×2. En los videos de YouTube no hizo falta: lo que usa la clase está en el audio.
