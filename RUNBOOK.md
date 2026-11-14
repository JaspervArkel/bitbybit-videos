# Daily run: one Bit by Bit Short

Each run makes **one** video: the `backlog.json` entry whose `date` is today (Europe/Amsterdam).
It renders the video, pushes it here, and schedules it in Buffer at the entry's `post_time`
(see "Posting schedule" in learnings.md) on YouTube, Instagram and TikTok. Brand rules, pillars and the QA gate live in the
"Bit by Bit — Operating Playbook" doc; this file is the procedure.

## 0. Pick today's entry
- Today's entry must have status `approved` (build it) or `rendered` (skip to step 4).
- If there is no entry for today, an entry is `posted` already, or anything is ambiguous: do nothing and report.

## 1. Setup (fresh cloud session)
```
pip install --break-system-packages -q kokoro-onnx soundfile tiktoken scipy
mkdir -p tts && cd tts
curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
cd ../remotion/studio && npm ci
```
Narration voice: **am_puck**, full-precision model, speed 1.0. Never switch voices.

**Format (since 14 Nov 2026): every video is built in Remotion** (`remotion/studio/`, read its README first).
The old HTML kit (`kit/build.py`) is now only used to make the narration script, and as the **fallback**:
if the Remotion build or its QA fails twice, build with the kit as before (kit spec rules below), post that,
and say so in the report. Never miss a posting day because of Remotion.

## 2. Write the spec: `videos/NN-slug/video.json` (narration + captions source)
- **First read `learnings.md`.** Apply every rule under "Rules in force", and the current experiment's instructions for this entry (e.g. its `ending`). The learnings file wins over older guidance below if they conflict, but never over the approved script's facts.
- Split the approved script into captions of one spoken phrase each (4 to 12 words). Keep the wording exactly; don't add claims.
- Add `say` wherever numbers, years, units or symbols need a spoken form ("twenty thirty-eight", "thirty-two-bit", "one point eight six two terabytes").
- Mark key words: `*green*` for normal emphasis, `!orange!` for broken/surprising. These colors carry into the Remotion captions.
- If the entry has a `check`, do it first and use the verified result.
- (Kit `scenes` are only needed for the fallback; use `videos/01-y2k38/video.json` as the example.)

## 3. Build in Remotion and QA
Narration and timing (slug = backlog slug, Comp = slug in PascalCase, e.g. `password-hash` → `PasswordHash`):
```
S=remotion/studio; P=$S/public/videos/<slug>; V=$S/src/videos/<slug>; mkdir -p $P $V out/DATE-slug
python3 kit/build.py videos/NN-slug/video.json out/DATE-slug/x.mp4 --script-only
KOKORO_DIR=tts python3 kit/narrate.py out/DATE-slug/x.script.txt $P/narration.wav
python3 remotion/tools/spec_to_lines.py videos/NN-slug/video.json remotion/tools/<slug>.lines.json
python3 remotion/tools/word_timing.py $P/narration.wav $P/narration.timing.json remotion/tools/<slug>.lines.json $V/words.json
python3 remotion/tools/sound.py /tmp/snd <narration seconds + 2> && cp /tmp/snd/music.wav $P/
```
Check `word_timing.py`'s printout: every word has a start time and none is shorter than ~0.08 s.

Then write `src/videos/<slug>/<Comp>.tsx`, starting from a copy of `src/videos/password-hash/PasswordHash.tsx`:
1. **Storyboard first** (a comment at the top of the file): for each script line, the one object on screen and
   what it does on which word. One world that evolves, not a slideshow. Build new components when the topic
   needs them (a game character, a CPU, a chat window…); add generally useful ones to `src/lib/ui.tsx`.
2. Hook: `Headline`-style title (≤8 words, the key word big in orange mono) + the hook visual, both complete at frame 0.
3. Every scene inside `<Scene a b>`; events timed with `W(line, word)`; SFX cue list at the bottom.
4. Endings follow the current experiment (`follow_cta`: end card with the follow button + tomorrow's topic;
   `implication`: end on the takeaway visual; `comment_prompt`: the question big on screen).
5. Register the composition in `src/Root.tsx`.

Preview stills while building (fast, ~3 s each): `cd remotion/studio && COMP=<Comp> node stills.mjs 0 3.5 8 …`
(writes `/tmp/st/*.png`; make a contact sheet with `montage` and look at it). Fix overlaps before rendering.

Render + QA (~3 min):
```
remotion/tools/render.sh <Comp> out/DATE-slug <slug> "0 <one time inside every scene> <last second>"
```
Name: `bitbybit-<slug>.mp4`. QA gate (all must pass, or fix; after 2 failed attempts use the kit fallback):
- ffprobe: 1080x1920, h264 + aac, 25 to 42 s; decode ok; loudness −15 to −13 LUFS
- Look at `out/DATE-slug/qa-sheet.png`: frame 1 shows the complete hook; nothing clipped, overlapping or off-screen;
  captions readable and never covered; every scene has its object on screen
- Captions match the narration (word timing from the real audio)
- Advisory (does not block): run `python3 -I kit/skills/instagram/ig-reel/beats.py out/DATE-slug/x.script.txt --target 30` and list its flags in the report. Never edit the approved script to fix them.
- Delete stray working files (`x.*`); keep the mp4, cover.png, and the Remotion sources

## 4. Publish the file
Commit `videos/NN-slug/`, `out/DATE-slug/`, `remotion/studio/src/videos/<slug>/`, `remotion/studio/public/videos/<slug>/`, `remotion/tools/<slug>.lines.json` and `src/Root.tsx`, set the entry's status to `rendered`, and push to `main`.
Video URL: `https://raw.githubusercontent.com/JaspervArkel/bitbybit-videos/main/out/DATE-slug/bitbybit-slug.mp4`
Check it returns HTTP 200 before using it.

## 5. Schedule in Buffer (organization "My organization")
Channels: YouTube `6aee4c0ce29c69a17188c931`, TikTok `6aee4bede29c69a17188c865`, Instagram `6aee4bcbe29c69a17188c749`.
For each: `create_post` with `mode: customScheduled` and `dueAt` from the entry's `post_time` ("18:00" = `<DATE>T18:00:00+01:00`; "01:00+1" = `<DATE+1>T01:00:00+01:00`; use +02:00 in summer time, and confirm with get_account),
`schedulingType: automatic`, and the video asset with the raw URL.
- YouTube: `metadata.youtube` = {title (max ~70 chars, curiosity-driven, no clickbait), categoryId "27" (Education), privacy "public", madeForKids false}. Text = short description + 2–3 hashtags incl. #Shorts.
- Instagram: `metadata.instagram` = {type "reel", shouldShareToFeed true, firstComment: the question if `ending` is comment_prompt, or "Tomorrow: <topic>" if follow_cta}. Text = hook line + one-sentence payoff + 3–5 hashtags. The free Buffer plan rejects `firstComment`: leave it out and put that line in the caption, before the hashtags.
- TikTok: `metadata.tiktok` = {title}. Text = hook + 3–4 hashtags.
No generic "follow for more". Avoid hashtag walls. Buffer holds at most 10 scheduled posts, so schedule only today's three.

**Before creating the posts, check the three texts** (tools in `kit/skills/`, see its README):
1. Write each platform's text to a file and run `python3 -I kit/skills/instagram/ig-human/humanize.py <file> --report`. Use the cleaned text. If it flags a structural tell, rewrite that sentence by hand without changing any fact.
2. Instagram only: `python3 -I kit/skills/instagram/ig-caption/caption.py <file> --keywords "<2 search phrases for the topic>"`. The hook line must be complete inside the visible window (≤ 125 characters, so keep the first sentence short) and include one concrete number or name. Put the search phrases in the body in plain words. Fix every WARN except ONE ASK when the entry's `ending` is `implication`: those posts have no call to action on purpose (experiment E5).
3. Never add a call to action the current experiment does not call for.

## 6. Log
Set the entry's status to `scheduled`, fill its tags (`hook_type`, `ending`, `visual`, `length_s`; see learnings.md), add the Buffer post IDs to `posted.json`, commit and push.
Report: title, duration, video link, the three post IDs and times, plus anything that failed. Also report the runway (days of approved entries left); warn if it's under 4.

## Never
- Publish immediately (`shareNow`), or schedule anything but today's entry.
- Change a script's meaning, invent facts, or post a video that failed QA.
- Delete or edit posts that are already in Buffer.
