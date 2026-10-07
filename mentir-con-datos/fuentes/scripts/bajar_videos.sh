#!/usr/bin/env bash
# Baja los 9 videos fuente a $1 (directorio vacío). Reels vía uuinstagram (InstaFix), YouTube vía Wayback.
set -u
OUT="$1"; cd "$OUT" || exit 1
UA_BOT="Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)"
declare -A REELS=( [C-YxMXXPmRq]=fiorino_p1_eje_y [C-jCdPRvOqJ]=fiorino_p2_acumulados [C-v5hBXvOKB]=fiorino_p3_correlaciones \
  [C_Jvc83vC8B]=fiorino_p4_tortas [C_ePCJ9vmMa]=fiorino_p5_superficie [DZgHjHzRt3K]=fiorino_p7_pictogramas [DZ8crWBxjtK]=fiorino_p8_cherry_picking )
for code in "${!REELS[@]}"; do
  name=${REELS[$code]}
  for try in 1 2 3; do
    curl -sS -m 30 -A "$UA_BOT" -o /dev/null "https://www.uuinstagram.com/reel/$code/" || true
    curl -sS -m 180 -L -A "$UA_BOT" -o "$name.mp4" "https://www.uuinstagram.com/videos/$code/1" && \
      file "$name.mp4" | grep -qiE 'MP4|ISO Media' && { echo "OK $name $(du -h $name.mp4 | cut -f1)"; break; }
    echo "RETRY $name ($try)"; sleep $((try*3))
  done
done
declare -A YT=( [bVG2OQp6jEQ]=zachstar_lie_with_statistics [f4yZJVdJCG4]=unsolicited_how_to_lie )
for id in "${!YT[@]}"; do
  name=${YT[$id]}
  for try in 1 2 3; do
    curl -sS -m 1800 -L -A "Mozilla/5.0" -o "$name.mp4" "https://web.archive.org/web/2oe_/http://wayback-fakeurl.archive.org/yt/$id" && \
      file "$name.mp4" | grep -qiE 'MP4|ISO Media' && { echo "OK $name $(du -h $name.mp4 | cut -f1)"; break; }
    echo "RETRY $name ($try)"; sleep $((try*5))
  done
done
echo "DONE"
