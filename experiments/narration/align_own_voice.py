"""Sync captions to a human narration recording (no speech-recognition model needed).

  python3 align_own_voice.py video.json recording.(m4a|wav|mp3...) out_dir

1. Cleans the take: mono 48 kHz, 80 Hz high-pass, light denoise, trims silence at both ends.
2. Finds every pause (>= 0.12 s below -38 dB).
3. Chooses the caption boundaries with dynamic programming: of all pauses, pick the
   n-1 that best split the speech into lines whose lengths match each caption's word count,
   preferring longer pauses. (Pause briefly between lines and this is exact.)
Writes out_dir/narration.wav + narration.timing.json ([{s,e,text}]) for kit/build.py."""
import sys, json, re, subprocess, pathlib
spec, rec, out = sys.argv[1], sys.argv[2], pathlib.Path(sys.argv[3]); out.mkdir(parents=True, exist_ok=True)
wav = out / 'narration.wav'
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', rec, '-ac', '1', '-ar', '48000', '-af',
  'highpass=f=80,afftdn=nf=-25,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.1,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.2,areverse,adelay=150',
  str(wav)], check=True)
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(wav)]))
log = subprocess.run(['ffmpeg', '-i', str(wav), '-af', 'silencedetect=noise=-38dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
ss = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]; se = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
sil = list(zip(ss, se + [dur] * (len(ss) - len(se))))
t0 = sil[0][1] if sil and sil[0][0] < 0.05 else 0.0
t1 = sil[-1][0] if sil and sil[-1][1] >= dur - 0.05 else dur
P = [(a, b) for a, b in sil if a > t0 + 0.3 and b < t1 - 0.3]          # interior pauses
caps = json.loads(pathlib.Path(spec).read_text())['captions']
wc = [len(re.sub(r'[*!]', '', c.get('say') or c['text']).split()) for c in caps]
n = len(caps)
if len(P) < n - 1: sys.exit(f'only {len(P)} pauses for {n} lines: please leave a short pause between lines and re-record')
speech = (t1 - t0) - sum(b - a for a, b in P) * 0.5
exp = [speech * w / sum(wc) for w in wc]
INF = float('inf')
def cost(i, s, e):  # caption i spans s..e
    return ((e - s) - exp[i]) ** 2 / max(exp[i], .5)
# dp[i][j]: captions 0..i placed, caption i ends at pause j
dp = [[INF] * len(P) for _ in range(n)]; bk = [[-1] * len(P) for _ in range(n)]
for j, (a, b) in enumerate(P): dp[0][j] = cost(0, t0, a) - 0.6 * (b - a)
for i in range(1, n - 1):
    for j, (a, b) in enumerate(P):
        for k in range(j):
            v = dp[i - 1][k] + cost(i, P[k][1], a) - 0.6 * (b - a)
            if v < dp[i][j]: dp[i][j], bk[i][j] = v, k
best = min(range(len(P)), key=lambda k: dp[n - 2][k] + cost(n - 1, P[k][1], t1))
cut = [best]
for i in range(n - 2, 0, -1): cut.append(bk[i][cut[-1]])
cut = cut[::-1]
bounds = [t0] + [x for j in cut for x in P[j]] + [t1]
timing = [{'s': round(bounds[2 * i], 3), 'e': round(bounds[2 * i + 1], 3), 'text': re.sub(r'[*!]', '', c['text'])} for i, c in enumerate(caps)]
(out / 'narration.timing.json').write_text(json.dumps(timing, indent=1))
for x, w, e in zip(timing, wc, exp): print(f"{x['s']:6.2f}-{x['e']:6.2f}  ({x['e']-x['s']:.2f}s, expected ~{e:.2f}s)  {x['text']}")
print(f'{len(P)} pauses found; file {dur:.2f}s; speech ends at {t1:.2f}s')
