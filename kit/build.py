"""Bit by Bit video builder.

  python3 build.py video.json out.mp4 [--voice narration.wav] [--fps 30] [--preview]

video.json
  captions: [{text, say?}]          text supports *green* / !orange! markup; `say` = spoken form for TTS
  scenes:   [{type, cap:[i,j], ...}] component props; the scene spans captions i..j
  sfx:      [{cap:i, at:0.0, type}]  types: tick, ticks, pop, whoosh, hit, glitch
  tail: seconds after last caption (default 1.4)   cover: time of cover frame (default 1.2)

Without --voice, captions are timed at ~2.6 words/s (a stand-in until narration exists).
With --voice, speech segments are found with ffmpeg silencedetect and mapped onto captions.
Outputs: out.mp4, out.cover.png, out.srt, out.timeline.json, out.script.txt (TTS input)."""
import argparse, json, pathlib, re, subprocess, wave, sys
import numpy as np

KIT = pathlib.Path(__file__).resolve().parent
SR = 48000
WPS = 2.6


def words(c):
    return len(re.sub(r'[*!]', '', c.get('say') or c['text']).split())


def probe_duration(path):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]).decode())


def speech_segments(path, noise='-35dB', min_sil=0.22):
    log = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', f'silencedetect=noise={noise}:d={min_sil}', '-f', 'null', '-'], capture_output=True, text=True).stderr
    dur = probe_duration(path)
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    segs, cur = [], 0.0
    for s, e in zip(starts, ends + [dur] * (len(starts) - len(ends))):
        if s - cur > 0.08: segs.append([cur, s])
        cur = e
    if dur - cur > 0.08: segs.append([cur, dur])
    return segs, dur


def time_captions(caps, voice):
    if not voice:
        t = 0.25
        for c in caps:
            d = words(c) / WPS + 0.2
            c['s'], c['e'] = round(t, 3), round(t + d, 3); t += d + 0.12
        return t
    tj = pathlib.Path(voice).with_suffix('.timing.json')
    if tj.exists():  # exact per-line timings from narrate.py
        tm = json.loads(tj.read_text()); dur = probe_duration(voice)
        if len(tm) == len(caps):
            for c, x in zip(caps, tm): c['s'], c['e'], c['se'] = x['s'], x['e'], x['e']  # se = when speech actually ends
            for a, b in zip(caps, caps[1:]): a['e'] = b['s']
            print('caption timing: exact (narrate.py)'); return dur
    segs, dur = speech_segments(voice)
    if len(segs) == len(caps):
        for c, (s, e) in zip(caps, segs): c['s'], c['e'], c['se'] = s, e, e
        how = 'pause-matched'
    else:  # merge/split proportionally by word count across the speech span
        s0, s1 = segs[0][0], segs[-1][1]
        tot = sum(words(c) for c in caps); t = s0
        for c in caps:
            d = (s1 - s0) * words(c) / tot; c['s'], c['e'] = t, t + d; t += d
        how = f'proportional ({len(segs)} speech segments for {len(caps)} captions)'
    print('caption timing:', how)
    # captions stay up until the next one starts (no flicker during short pauses)
    for c in caps: c.setdefault('se', c['e'])
    for a, b in zip(caps, caps[1:]): a['e'] = b['s']
    return dur


def resolve(spec, voice):
    caps = spec['captions']
    end_speech = time_captions(caps, voice)
    dur = round(max(end_speech, caps[-1]['e']) + spec.get('tail', 1.4), 2)
    for i, sc in enumerate(spec['scenes']):
        if 'cap' in sc:
            a, b = sc['cap']
            sc['start'] = 0 if a == 0 else round(caps[a]['s'] - 0.12, 3)
            sc['end'] = round(caps[b + 1]['s'] - 0.12, 3) if b + 1 < len(caps) else dur
            if 'endOffset' in sc: sc['end'] = round(sc['start'] + sc['endOffset'], 3)
            if 'startOffset' in sc: sc['start'] = round(sc['start'] + sc['startOffset'], 3)
    spec['duration'] = dur
    return spec


# ---------- sound design ----------
def env(n, a):
    return np.exp(-a * np.arange(n) / SR)


def sfx_clip(kind, rng):
    t = lambda d: np.arange(int(d * SR)) / SR
    if kind == 'tick':
        x = t(.06); return .22 * np.sin(2 * np.pi * 1900 * x) * env(len(x), 70)
    if kind == 'pop':
        x = t(.09); f = 500 + 4000 * x; return .28 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 40)
    if kind == 'whoosh':
        x = t(.4); n = rng.standard_normal(len(x)); k = 60; n = np.convolve(n, np.ones(k) / k, 'same')
        return .9 * n * np.sin(np.pi * x / x[-1]) ** 2
    if kind == 'hit':
        x = t(.9); return .55 * np.sin(2 * np.pi * 70 * x) * env(len(x), 5) + .15 * rng.standard_normal(len(x)) * env(len(x), 30)
    if kind == 'glitch':
        x = t(.28); sq = np.sign(np.sin(2 * np.pi * rng.choice([180, 240, 330], len(x)) * x)); gate = (rng.random(len(x) // 400 + 1) > .4).repeat(400)[:len(x)]
        return .14 * sq * gate
    raise ValueError(kind)


def build_sfx(spec, path):
    rng = np.random.default_rng(7)
    buf = np.zeros(int(spec['duration'] * SR) + SR)
    cues = []
    for c in spec.get('sfx', []):
        base = spec['captions'][c['cap']]['s'] if 'cap' in c else 0
        t0 = base + c.get('at', c.get('t', 0))
        if c['type'] == 'ticks':
            cues += [(t0 + i * c.get('every', 1.0), 'tick') for i in range(c.get('count', 3))]
        else:
            cues.append((t0, c['type']))
    if spec.get('autoWhoosh', True):
        cues += [(sc['start'], 'whoosh') for sc in spec['scenes'] if sc['start'] > 0]
    for t0, k in cues:
        clip = sfx_clip(k, rng); i = int(max(0, t0) * SR); buf[i:i + len(clip)] += clip[:len(buf) - i]
    buf = np.clip(buf, -1, 1)
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf * 32767).astype('<i2').tobytes())
    return len(cues)


# ---------- render ----------
def size(spec):
    return (1920, 1080) if spec.get('format') == 'landscape' else (1080, 1920)


def render_range(spec, seg, fps, a, b, crf):
    from playwright.sync_api import sync_playwright
    w, h = size(spec)
    enc = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(fps), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', str(crf), '-pix_fmt', 'yuv420p', str(seg)], stdin=subprocess.PIPE)
    with sync_playwright() as p:
        br = p.chromium.launch(channel='chrome'); pg = br.new_page(viewport={'width': w, 'height': h})
        pg.goto((KIT / 'stage.html').as_uri()); pg.wait_for_load_state('load')
        pg.evaluate('s => loadVideo(s)', spec); pg.wait_for_timeout(200)
        for i in range(a, b):
            pg.evaluate(f'render({i / fps})'); enc.stdin.write(pg.screenshot(type='jpeg', quality=92) if spec.get('format') == 'landscape' else pg.screenshot(type='png'))
            if (i - a) % 300 == 0: print(f'  [{a}-{b}] frame {i}', flush=True)
        br.close()
    enc.stdin.close(); enc.wait()


def _job(args):
    render_range(*args)


def render(spec, out, fps, workers=1):
    n = int(round(spec['duration'] * fps))
    crf = spec.get('crf', 18 if spec.get('format') != 'landscape' else 20)
    if workers <= 1:
        render_range(spec, out, fps, 0, n, crf)
    else:
        import multiprocessing as mp
        cuts = [round(n * k / workers) for k in range(workers + 1)]
        segs = [out.with_name(f'{out.stem}.seg{k}.mp4') for k in range(workers)]
        with mp.get_context('spawn').Pool(workers) as pool:
            pool.map(_job, [(spec, segs[k], fps, cuts[k], cuts[k + 1], crf) for k in range(workers)])
        lst = out.with_name(out.stem + '.segs.txt'); lst.write_text(''.join(f"file '{s.name}'\n" for s in segs))
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(lst), '-c', 'copy', str(out)], check=True)
        for s in segs: s.unlink()
        lst.unlink()
    from playwright.sync_api import sync_playwright
    w, h = size(spec)
    with sync_playwright() as p:
        br = p.chromium.launch(channel='chrome'); pg = br.new_page(viewport={'width': w, 'height': h})
        pg.goto((KIT / 'stage.html').as_uri()); pg.evaluate('s => loadVideo(s)', spec)
        pg.evaluate(f"render({spec.get('cover', 1.2)})")
        pg.screenshot(path=str(out.with_name(out.name.replace('.video.mp4', '.cover.png'))))
        br.close()


def stills(spec, out, times):
    from playwright.sync_api import sync_playwright
    paths = []
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome'); w, h = size(spec); pg = b.new_page(viewport={'width': w, 'height': h})
        pg.goto((KIT / 'stage.html').as_uri()); pg.evaluate('s => loadVideo(s)', spec)
        for t in times:
            pg.evaluate(f'render({t})'); f = out.parent / f'still_{t:06.2f}.png'; pg.screenshot(path=str(f)); paths.append(str(f))
        b.close()
    sheet = out.with_suffix('.stills.png')
    subprocess.run(['convert', *paths, '-resize', '270x' if size(spec)[0] < 1500 else '640x', *(['+append'] if size(spec)[0] < 1500 else ['-append']), str(sheet)], check=True)
    for f in paths: pathlib.Path(f).unlink()
    print('stills:', sheet)


def srt(caps, path):
    f = lambda t: f"{int(t // 3600):02}:{int(t % 3600 // 60):02}:{int(t % 60):02},{int(t * 1000 % 1000):03}"
    path.write_text('\n'.join(f"{i + 1}\n{f(c['s'])} --> {f(c['e'])}\n{re.sub(r'[*!]', '', c['text'])}\n" for i, c in enumerate(caps)))


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('spec'); ap.add_argument('out'); ap.add_argument('--voice'); ap.add_argument('--fps', type=int, default=30); ap.add_argument('--workers', type=int, default=1)
    ap.add_argument('--script-only', action='store_true', help='just write the TTS script')
    ap.add_argument('--stills', help='comma-separated times: render only these frames to a contact sheet (fast QA)')
    a = ap.parse_args()
    out = pathlib.Path(a.out).resolve(); out.parent.mkdir(parents=True, exist_ok=True)
    spec = json.loads(pathlib.Path(a.spec).read_text())
    out.with_suffix('.script.txt').write_text('\n'.join(re.sub(r'[*!]', '', c.get('say') or c['text']) for c in spec['captions']) + '\n')
    if a.script_only: return
    spec = resolve(spec, a.voice)
    out.with_suffix('.timeline.json').write_text(json.dumps(spec, indent=1))
    if a.stills: return stills(spec, out, [float(x) for x in a.stills.split(',')])
    srt(spec['captions'], out.with_suffix('.srt'))
    sfx = out.with_suffix('.sfx.wav'); print('sfx cues:', build_sfx(spec, sfx))
    silent = out.with_suffix('.video.mp4'); print(f"rendering {spec['duration']}s @ {a.fps}fps, {a.workers} worker(s)"); render(spec, silent, a.fps, a.workers)
    if a.voice:
        fc = '[1:a]aresample=48000,pan=mono|c0=c0[v];[2:a]volume=0.55[s];[v][s]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]'
        cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-i', str(silent), '-i', a.voice, '-i', str(sfx), '-filter_complex', fc, '-map', '0:v', '-map', '[a]']
    else:
        cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-i', str(silent), '-i', str(sfx), '-map', '0:v', '-map', '1:a']
    subprocess.run(cmd + ['-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', str(spec['duration']), '-movflags', '+faststart', str(out)], check=True)
    silent.unlink(); sfx.unlink()
    print('done:', out, probe_duration(str(out)), 's')


if __name__ == '__main__':
    main()
