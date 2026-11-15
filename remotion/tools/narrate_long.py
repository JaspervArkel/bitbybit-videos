"""Kokoro narration for long-form videos: like kit/narrate.py, but with a longer pause before each chapter.
usage: KOKORO_DIR=tts python3 remotion/tools/narrate_long.py videos/long-NN/video.json out/narration.wav
Writes narration.wav + narration.timing.json ([{s, e, text}] per caption line). Voice am_puck, speed 1.0."""
import json, os, pathlib, re, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

spec = json.loads(pathlib.Path(sys.argv[1]).read_text()); out = pathlib.Path(sys.argv[2])
d = pathlib.Path(os.environ.get("KOKORO_DIR", "tts"))
k = Kokoro(str(d / "kokoro-v1.0.onnx"), str(d / "voices-v1.0.bin"))
GAP, CH_GAP, LEAD = 0.34, 1.25, 0.15
starts = {c["line"] for c in spec.get("chapters", [])}


def trim(x, sr, thr=0.01, pad=0.03):
    idx = np.where(np.abs(x) > thr)[0]
    if not len(idx): return x
    return x[max(0, idx[0] - int(pad * sr)):min(len(x), idx[-1] + int(pad * sr))]


parts, timing, t, sr = [], [], LEAD, 24000
for i, c in enumerate(spec["captions"]):
    line = re.sub(r"[*!]", "", c.get("say") or c["text"])
    if i and i in starts:
        extra = CH_GAP - GAP; parts.append(np.zeros(int(extra * sr), np.float32)); t += extra
    audio, sr = k.create(line, voice="am_puck", speed=1.0, lang="en-us")
    audio = trim(np.asarray(audio, dtype=np.float32), sr); dur = len(audio) / sr
    timing.append({"s": round(t, 3), "e": round(t + dur, 3), "text": line})
    parts += [audio, np.zeros(int(GAP * sr), np.float32)]; t += dur + GAP
wav = np.concatenate([np.zeros(int(LEAD * sr), np.float32)] + parts)
sf.write(out, wav, sr)
out.with_suffix(".timing.json").write_text(json.dumps(timing, indent=1))
print(f"{out}: {len(wav) / sr:.2f}s, {len(timing)} lines")
