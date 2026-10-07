"""Transcribe videos con faster-whisper. Uso: python -I transcribir.py <idioma> <salida_dir> <video1> [video2 ...]
El audio se decodifica con ffmpeg (f32le 16 kHz mono) para no depender de PyAV."""
import sys, json, time, pathlib, subprocess
import numpy as np
from faster_whisper import WhisperModel

lang, out_dir, *videos = sys.argv[1:]
out = pathlib.Path(out_dir); out.mkdir(parents=True, exist_ok=True)
model = WhisperModel("medium", device="cpu", compute_type="int8", cpu_threads=4)
for v in videos:
    v = pathlib.Path(v); t0 = time.time()
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(v), "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                         check=True, capture_output=True).stdout
    audio = np.frombuffer(pcm, dtype=np.float32)
    segs, info = model.transcribe(audio, language=lang, beam_size=5, vad_filter=True,
                                  condition_on_previous_text=True)
    rows = [{"start": round(s.start, 1), "end": round(s.end, 1), "text": s.text.strip()} for s in segs]
    (out / f"{v.stem}.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1))
    with open(out / f"{v.stem}.md", "w") as f:
        f.write(f"# {v.stem}\n\nDuración: {len(audio)/16000:.0f} s · idioma: {info.language}\n\n")
        for r in rows:
            m, s = divmod(int(r["start"]), 60)
            f.write(f"[{m:02d}:{s:02d}] {r['text']}\n")
    print(f"OK {v.stem} {len(audio)/16000:.0f}s audio en {time.time()-t0:.0f}s", flush=True)
print("DONE", flush=True)
