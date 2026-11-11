# Daily run: one Bit by Bit Short

Each run makes **one** video: the `backlog.json` entry whose `date` is today (Europe/Amsterdam).
It renders the video, pushes it here, and schedules it in Buffer for **18:00 Europe/Amsterdam**
on YouTube, Instagram and TikTok. Brand rules, pillars and the QA gate live in the
"Bit by Bit — Operating Playbook" doc; this file is the procedure.

## 0. Pick today's entry
- Today's entry must have status `approved` (build it) or `rendered` (skip to step 4).
- If there is no entry for today, an entry is `posted` already, or anything is ambiguous: do nothing and report.

## 1. Setup (fresh cloud session)
```
pip install --break-system-packages -q kokoro-onnx soundfile tiktoken
mkdir -p tts && cd tts
curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```
Narration voice: **am_puck**, full-precision model, speed 1.0. Never switch voices.

## 2. Write the spec: `videos/NN-slug/video.json`
- Split the approved script into captions of one spoken phrase each (4 to 12 words). Keep the wording exactly; don't add claims.
- Add `say` wherever numbers, years, units or symbols need a spoken form ("twenty thirty-eight", "thirty-two-bit", "one point eight six two terabytes").
- Hide caption 0 (`"hide": true`) when scene 0's title already shows the hook. Scene 0 uses `"instant": true` so frame 1 is complete.
- Build scenes from the kit components (`title`, `clock`, `bitrow`, `counter`, `tokens`, `code`, `bar`, `list`, `endcard`). Use a visual change every 1.5 to 3 s, green for normal, orange for broken or surprising, and an `endcard` last.
- Use `videos/01-y2k38/video.json` as the reference example.
- If the entry has a `check`, do it first and use the verified result.

## 3. Build and QA
```
python3 kit/build.py videos/NN-slug/video.json out/DATE-slug/x.mp4 --script-only
KOKORO_DIR=tts python3 kit/narrate.py out/DATE-slug/x.script.txt out/DATE-slug/narration.wav
python3 kit/build.py videos/NN-slug/video.json out/DATE-slug/x.mp4 --stills 0,<scene midpoints>   # look at it
python3 kit/build.py videos/NN-slug/video.json out/DATE-slug/bitbybit-slug.mp4 --voice out/DATE-slug/narration.wav
```
Name the final file `bitbybit-<slug>.mp4`. QA gate (all must pass, or stop and report):
- ffprobe: 1080x1920, h264 + aac, 25 to 42 s
- Look at the stills: frame 1 shows the complete hook; nothing clipped or overlapping; captions in place
- Captions match the narration (exact timing from narrate.py)
- Delete stray working files; keep the mp4, cover.png, srt, narration.wav and narration.timing.json

## 4. Publish the file
Commit `videos/NN-slug/` and `out/DATE-slug/`, set the entry's status to `rendered`, and push to `main`.
Video URL: `https://raw.githubusercontent.com/JaspervArkel/bitbybit-videos/main/out/DATE-slug/bitbybit-slug.mp4`
Check it returns HTTP 200 before using it.

## 5. Schedule in Buffer (organization "My organization")
Channels: YouTube `6aee4c0ce29c69a17188c931`, TikTok `6aee4bede29c69a17188c865`, Instagram `6aee4bcbe29c69a17188c749`.
For each: `create_post` with `mode: customScheduled`, `dueAt: <DATE>T18:00:00+01:00` (use +02:00 in summer time; confirm with get_account),
`schedulingType: automatic`, and the video asset with the raw URL.
- YouTube: `metadata.youtube` = {title (max ~70 chars, curiosity-driven, no clickbait), categoryId "27" (Education), privacy "public", madeForKids false}. Text = short description + 2–3 hashtags incl. #Shorts.
- Instagram: `metadata.instagram` = {type "reel", shouldShareToFeed true}. Text = hook line + one-sentence payoff + 3–5 hashtags.
- TikTok: `metadata.tiktok` = {title}. Text = hook + 3–4 hashtags.
No generic "follow for more". Avoid hashtag walls. Buffer holds at most 10 scheduled posts, so schedule only today's three.

## 6. Log
Set the entry's status to `scheduled`, add the Buffer post IDs to `posted.json`, commit and push.
Report: title, duration, video link, the three post IDs and times, plus anything that failed.

## Never
- Publish immediately (`shareNow`), or schedule anything but today's entry.
- Change a script's meaning, invent facts, or post a video that failed QA.
- Delete or edit posts that are already in Buffer.
