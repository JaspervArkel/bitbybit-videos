"""Synthesize Bit by Bit SFX + a light music bed (no external assets). usage: sound.py out_dir music_seconds"""
import sys, numpy as np, soundfile as sf, pathlib
from scipy.signal import butter, sosfilt
out = pathlib.Path(sys.argv[1]); (out / 'sfx').mkdir(parents=True, exist_ok=True); SR = 48000
rng = np.random.default_rng(7)
t_ = lambda d: np.arange(int(d * SR)) / SR
def bp(x, lo, hi, o=4): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=4): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=4): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def env(n, a, r): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)
def norm(x, db=-3): return x / (np.abs(x).max() + 1e-9) * 10 ** (db / 20)
def save(name, x, db=-3): sf.write(out / 'sfx' / f'{name}.wav', norm(x, db).astype(np.float32), SR)
noise = lambda d: rng.standard_normal(int(d * SR))
def sweep(f0, f1, d, kind='exp'):
    t = t_(d); f = f0 * (f1 / f0) ** (t / d) if kind == 'exp' else f0 + (f1 - f0) * t / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
# click
x = bp(noise(.03), 2000, 7000) * env(int(.03 * SR), .0005, .004) + .4 * np.sin(2 * np.pi * 1800 * t_(.03)) * env(int(.03 * SR), .0005, .006); save('click', x, -6)
# key (mechanical): two transients
k = bp(noise(.06), 1500, 6000) * env(int(.06 * SR), .0003, .006); k2 = np.zeros_like(k); s = int(.018 * SR); k2[s:] = .6 * k[:-s]
save('key', k + k2 + .3 * lp(noise(.06), 400) * env(int(.06 * SR), .0005, .01), -8)
e = bp(noise(.1), 300, 4000) * env(int(.1 * SR), .0005, .02) + .5 * np.sin(2 * np.pi * 140 * t_(.1)) * env(int(.1 * SR), .001, .03); save('enter', e, -5)
# error: generic two-note "bonk" (not any OS's real sound)
def tone(f, d, r=.12): t = t_(d); return (np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * 2 * f * t) + .12 * np.sin(2 * np.pi * 3 * f * t)) * env(len(t), .004, r)
er = np.concatenate([tone(659, .14, .08), tone(494, .42, .16)]); save('error', er, -4)
# impact / sub drop
d = .6; im = sweep(110, 38, d) * env(int(d * SR), .002, .22) + .5 * lp(noise(d), 900) * env(int(d * SR), .001, .04); save('impact', im, -2)
# whoosh
d = .55; t = t_(d); w = np.zeros_like(t); nz = noise(d)
for i, (lo, hi) in enumerate([(300, 900), (600, 1800), (1200, 3600), (2000, 6000)]):
    seg = bp(nz, lo, hi, 2); w += seg * np.exp(-((t / d - (i + 1) / 5) ** 2) / .02)
w *= np.sin(np.pi * t / d) ** 1.5; save('whoosh', w, -6)
# rewind (tape): pitch rising warble + noise
d = 1.1; t = t_(d); f = 180 * (12 ** (t / d)) * (1 + .04 * np.sin(2 * np.pi * 23 * t))
rw = .6 * np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) + .5 * bp(noise(d), 1500, 7000)
rw = lp(rw, 5000) * np.minimum(1, t / .08) * np.minimum(1, (d - t) / .12); save('rewind', rw, -9)
# zap (cable connects)
d = .32; z = sweep(300, 2400, d) * env(int(d * SR), .002, .12) + .3 * bp(noise(d), 3000, 9000) * env(int(d * SR), .001, .05); save('zap', z, -8)
# dot-matrix printer
d = 1.0; t = t_(d); pulses = (np.sin(2 * np.pi * 55 * t) > .6).astype(float)
pr = bp(noise(d), 800, 5000) * pulses * (1 - .4 * (np.sin(2 * np.pi * 3 * t) > 0)) * np.minimum(1, (d - t) / .05); save('printer', pr, -10)
# vortex
d = 1.4; t = t_(d); vx = lp(noise(d), 300) * np.sin(np.pi * t / d) + .5 * sweep(500, 60, d) * np.sin(np.pi * t / d) ** 2; save('vortex', vx, -7)
# pop
d = .12; po = sweep(500, 1100, d) * env(int(d * SR), .001, .03); save('pop', po, -8)
# stamp
d = .35; st = .8 * sweep(160, 60, d) * env(int(d * SR), .001, .08) + bp(noise(d), 200, 2500) * env(int(d * SR), .0005, .03); save('stamp', st, -3)
# tick
d = .03; save('tick', bp(noise(d), 3000, 9000) * env(int(d * SR), .0002, .004), -12)
# riser
d = 1.0; t = t_(d); ri = bp(noise(d), 800, 8000, 2) * (t / d) ** 2 + .3 * sweep(200, 900, d) * (t / d) ** 2; save('riser', ri, -9)
# chime (end)
d = 1.2; ch = sum(a * np.sin(2 * np.pi * f * t_(d)) for f, a in [(880, 1), (1320, .5), (1760, .25)]) * env(int(d * SR), .005, .35); save('chime', ch, -10)
# ---- music bed: 96 BPM, Am F C G, soft pad + pluck arp + soft kick/hat
dur = float(sys.argv[2]); bpm = 96; beat = 60 / bpm; n = int(dur * SR); mus = np.zeros(n)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
bar = 4 * beat
def saw(f, d): t = t_(d); return sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 7))
i = 0; tt = 0.0
while tt < dur:
    ch = chords[(i // 2) % 4]; d = min(2 * bar, dur - tt)
    if d <= .05: break
    seg = sum(saw(midi(m), d) + saw(midi(m) * 1.004, d) for m in ch) / 6
    seg = lp(seg, 1400) * np.minimum(1, t_(d) / .6) * np.minimum(1, (d - t_(d)) / .6)
    a = int(tt * SR); mus[a:a + len(seg)] += .35 * seg[:n - a]; tt += 2 * bar; i += 2
# arp
step = beat / 2; k = 0
while k * step < dur - .3:
    tt = k * step; ch = chords[int(tt // (2 * bar)) % 4]; m = ch[[0, 1, 2, 1][k % 4]] + 12
    d = .3; p = np.sin(2 * np.pi * midi(m) * t_(d)) * env(int(d * SR), .003, .07)
    a = int(tt * SR); mus[a:a + len(p)] += .12 * p[:n - a]; k += 1
# kick + hat
k = 0
while k * beat < dur - .3:
    tt = k * beat; a = int(tt * SR)
    kd = sweep(120, 45, .25) * env(int(.25 * SR), .001, .07); mus[a:a + len(kd)] += .35 * kd[:n - a]
    h = hp(noise(.05), 7000) * env(int(.05 * SR), .0005, .012); b = int((tt + beat / 2) * SR)
    if b < n: mus[b:b + len(h)] += .06 * h[:n - b]
    k += 1
fade = np.ones(n); f = int(.8 * SR); fade[-f:] = np.linspace(1, 0, f); fade[:int(.05 * SR)] = np.linspace(0, 1, int(.05 * SR))
sf.write(out / 'music.wav', norm(mus * fade, -6).astype(np.float32), SR)
print('ok')
