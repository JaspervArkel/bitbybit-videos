"""Kokoro narration for Bit by Bit.

  python3 narrate.py video.script.txt narration.wav [--voice am_puck] [--speed 1.0] [--gap 0.32]

Reads one spoken line per caption, voices each line, joins them with short pauses,
and writes narration.wav plus narration.timing.json ([{s, e}] per line) so build.py
can sync captions exactly. Model files: kokoro-v1.0.onnx + voices-v1.0.bin
(full-precision release from github.com/thewh1teagle/kokoro-onnx), looked up in
$KOKORO_DIR, ./tts, or next to this script."""
import argparse, json, os, pathlib
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro


def find_models():
    for d in [os.environ.get('KOKORO_DIR'), 'tts', pathlib.Path(__file__).parent / 'tts', pathlib.Path.home() / 'tts']:
        if d and (pathlib.Path(d) / 'kokoro-v1.0.onnx').exists():
            d = pathlib.Path(d); return str(d / 'kokoro-v1.0.onnx'), str(d / 'voices-v1.0.bin')
    raise SystemExit('Kokoro model files not found (set KOKORO_DIR)')


def trim(x, sr, thr=0.01, pad=0.03):
    idx = np.where(np.abs(x) > thr)[0]
    if not len(idx): return x
    a, b = max(0, idx[0] - int(pad * sr)), min(len(x), idx[-1] + int(pad * sr))
    return x[a:b]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('script'); ap.add_argument('out')
    ap.add_argument('--voice', default='am_puck'); ap.add_argument('--speed', type=float, default=1.0)
    ap.add_argument('--gap', type=float, default=0.32); ap.add_argument('--lead', type=float, default=0.15)
    a = ap.parse_args()
    lines = [l.strip() for l in pathlib.Path(a.script).read_text().splitlines() if l.strip()]
    k = Kokoro(*find_models())
    parts, timing, t, sr = [], [], a.lead, 24000
    for line in lines:
        audio, sr = k.create(line, voice=a.voice, speed=a.speed, lang='en-us')
        audio = trim(np.asarray(audio, dtype=np.float32), sr)
        d = len(audio) / sr
        timing.append({'s': round(t, 3), 'e': round(t + d, 3), 'text': line})
        parts += [audio, np.zeros(int(a.gap * sr), np.float32)]; t += d + a.gap
    wav = np.concatenate([np.zeros(int(a.lead * sr), np.float32)] + parts)
    sf.write(a.out, wav, sr)
    pathlib.Path(a.out).with_suffix('.timing.json').write_text(json.dumps(timing, indent=1))
    print(f'{a.out}: {len(wav) / sr:.2f}s, {len(lines)} lines, voice {a.voice}')


if __name__ == '__main__':
    main()
