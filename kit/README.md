# Bit by Bit video kit

Turns a video spec (`video.json`) plus an optional narration WAV into a branded 1080x1920 MP4.

```
python3 kit/build.py videos/01-y2k38/video.json out/01-y2k38/bitbybit-2038.mp4 --voice narration.wav
python3 kit/build.py videos/01-y2k38/video.json out/x.mp4 --stills 0,2,13,26   # fast visual check
python3 kit/build.py videos/01-y2k38/video.json out/x.mp4 --script-only        # write the TTS script only
```

Requires: Python 3 with numpy + playwright (Chrome), ffmpeg, ImageMagick (stills only).

## Outputs
- `*.mp4` - final video (H.264 + AAC; loudness-normalised to -14 LUFS when a voice is supplied)
- `*.cover.png` - cover frame
- `*.srt` - captions file for platform upload
- `*.script.txt` - spoken script for TTS (uses each caption's `say` field)
- `*.timeline.json` - resolved timings, for debugging

## Spec format
- `captions`: `[{text, say?, hide?}]`. In `text`, `*word*` is green and `!word!` is orange; both can span words.
- `scenes`: `[{type, cap: [i, j], ...props}]`. A scene spans captions i to j, so scene timing follows the voice automatically.
- `sfx`: `[{cap, at, type}]` with types tick, ticks (count, every), pop, whoosh, hit, glitch. A whoosh plays at each scene change.

Components: `title`, `clock`, `bitrow`, `counter`, `tokens`, `code`, `bar`, `list`, `endcard` (see `kit.js` for props).

Without `--voice`, captions are timed at about 2.6 words/s as a stand-in. With `--voice`, speech segments are detected from pauses and mapped onto the captions. So write one caption per spoken phrase and leave a short pause between them.
