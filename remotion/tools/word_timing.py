"""Estimate per-word timings inside each narrated line (Kokoro gives line timing only).
Weights words by syllables of their spoken form, reserves pauses after punctuation,
then snaps each boundary to the nearest energy dip (±90 ms).
usage: word_timing.py narration.wav narration.timing.json lines.json out_words.json
lines.json: [[ [display, spoken, style], ... ], ...]  style: ''|'g'|'o' """
import sys, json, re, numpy as np, soundfile as sf
wav, tim, lines_p, out = sys.argv[1:5]
a, sr = sf.read(wav); a = a if a.ndim == 1 else a.mean(1)
hop = int(sr * .01); env = np.sqrt(np.convolve(a ** 2, np.ones(hop * 3) / (hop * 3), 'same'))[::hop]
T = json.load(open(tim)); L = json.load(open(lines_p))
syl = lambda w: max(1, len(re.findall(r'[aeiouy]+', w.lower()))) + .35
res = []
for (ln, t) in zip(L, T):
    s, e = t['s'], t['e']
    pause = [(.16 if d[-1] in ',' else .24 if d[-1] in '.?:!' else 0) for d, sp, st in ln]
    pause[-1] = 0
    wts = [sum(syl(x) for x in sp.split()) for d, sp, st in ln]
    speak = (e - s) - sum(pause); unit = speak / sum(wts)
    words, cur = [], s
    for (d, sp, st), w, p in zip(ln, wts, pause):
        ws = cur; we = cur + w * unit; words.append([d, st, ws, we]); cur = we + p
    # snap starts (except first) to energy minima near predicted start
    for i in range(1, len(words)):
        c = words[i][2]; lo, hi = int((c - .07) * 100), int((c + .07) * 100)
        seg = env[max(lo, 0):hi]
        if len(seg):
            snap = (lo + int(np.argmin(seg))) / 100
            prev_len = words[i - 1][3] - words[i - 1][2]
            if snap - words[i - 1][2] >= max(.1, .6 * prev_len): words[i][2] = snap
        words[i - 1][3] = min(words[i - 1][3], words[i][2])
    res.append({'s': s, 'e': e, 'words': [{'w': d, 'st': st, 's': round(ws, 3), 'e': round(we, 3)} for d, st, ws, we in words]})
json.dump(res, open(out, 'w'), indent=1)
for r in res: print(' '.join(f"{w['w']}@{w['s']:.2f}" for w in r['words']))
