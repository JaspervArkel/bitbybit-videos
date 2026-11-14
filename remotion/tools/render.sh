#!/usr/bin/env bash
# Render a Remotion composition, normalize loudness, run the technical QA checks and make a contact sheet.
# usage: remotion/tools/render.sh <CompositionId> <out_dir> <file_slug> "<still times in s, space-separated>"
set -euo pipefail
COMP=$1; OUT=$2; SLUG=$3; STILLS=${4:-"0 5 10 15 20 25 30"}
ROOT=$(cd "$(dirname "$0")/../.." && pwd); STUDIO=$ROOT/remotion/studio
BROWSER=$(ls /opt/pw-browsers/*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1 || true)
if [ -z "$BROWSER" ]; then npx --yes playwright install chromium-headless-shell >/dev/null 2>&1 || true; BROWSER=$(ls ~/.cache/ms-playwright/*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1 || true); fi
BFLAG=${BROWSER:+--browser-executable=$BROWSER}
mkdir -p "$OUT"
( cd "$STUDIO" && npx tsc --noEmit && npx remotion render "$COMP" /tmp/$COMP.raw.mp4 $BFLAG --concurrency=2 --crf=18 --log=error )
ffmpeg -v error -y -i /tmp/$COMP.raw.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k -movflags +faststart "$OUT/bitbybit-$SLUG.mp4"
F="$OUT/bitbybit-$SLUG.mp4"
ffprobe -v error -show_entries stream=codec_name,width,height:format=duration -of compact "$F"
ffmpeg -v error -i "$F" -f null - && echo "decode: ok"
ffmpeg -i "$F" -af ebur128 -f null - 2>&1 | grep -A1 "Integrated loudness" | tail -1
ffmpeg -v error -y -ss 0 -i "$F" -frames:v 1 "$OUT/bitbybit-$SLUG.cover.png"
rm -rf /tmp/qa_$COMP && mkdir -p /tmp/qa_$COMP
for t in $STILLS; do ffmpeg -v error -y -ss "$t" -i "$F" -frames:v 1 -vf scale=270:-1 /tmp/qa_$COMP/$(printf "%06.2f" "$t").png; done
montage /tmp/qa_$COMP/*.png -tile 6x -geometry +3+3 -background '#000' "$OUT/qa-sheet.png"
echo "contact sheet: $OUT/qa-sheet.png (look at it; it is not committed)"
