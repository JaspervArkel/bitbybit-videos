"""Convert a kit spec (videos/NN-slug/video.json captions with *green* / !orange! markup and optional `say`)
into lines.json for word_timing.py: [[ [display, spoken, style], ... ], ...]
Display words that are spoken differently ("1983" -> "nineteen eighty-three") are aligned with difflib.
usage: spec_to_lines.py video.json out_lines.json"""
import sys, json, re, difflib
spec = json.load(open(sys.argv[1]))
norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower())
out = []
for c in spec["captions"]:
    words, style, cur = [], [], ""
    for raw in c["text"].split():
        st = cur
        if raw.startswith("*"): st = cur = "g"
        if raw.startswith("!"): st = cur = "o"
        clean = raw.strip("*!")
        if raw.endswith("*") or raw.endswith("!") or re.search(r"[*!][,.?:;]?$", raw): cur = ""
        clean = re.sub(r"[*!]", "", raw)
        words.append(clean); style.append(st)
    spoken = (c.get("say") or " ".join(words)).split()
    a, b = [norm(w) for w in words], [norm(w) for w in spoken]
    toks = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_opcodes():
        if op == "equal":
            toks += [[words[i], spoken[j], style[i]] for i, j in zip(range(i1, i2), range(j1, j2))]
        elif op in ("replace", "delete") and i2 > i1:
            toks.append([" ".join(words[i1:i2]), " ".join(spoken[j1:j2]) or words[i1], next((s for s in style[i1:i2] if s), "")])
        elif op == "insert" and toks:  # extra spoken words: attach to previous token
            toks[-1][1] += " " + " ".join(spoken[j1:j2])
    out.append(toks)
json.dump(out, open(sys.argv[2], "w"), indent=0)
for l in out: print(" | ".join(f"{d}{'('+s+')' if s!=d else ''}{':'+st if st else ''}" for d, s, st in l))
