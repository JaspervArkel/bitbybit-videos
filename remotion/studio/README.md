# Bit by Bit Remotion studio

All daily videos are built here (since 14 Nov 2026). One shared library, one folder + one `<Composition>` per video.

```
src/lib/ui.tsx          brand colors/fonts, timing (makeTiming), motion helpers (ramp, pop, shake),
                        Background, Bug, Scene (zoom/blur crossfade), EraTag, Chip, Cable, Cursor,
                        FolderIcon, Monitor, Keyboard, Printer, Vortex, DocIcon
src/lib/Captions.tsx    word-by-word captions (chunks of ≤18 chars, key words green/orange)
src/videos/<slug>/      <Name>.tsx (scenes + SFX cue list), words.json, any data (e.g. hashes.json)
public/videos/<slug>/   narration.wav, narration.timing.json, music.wav
public/sfx/             shared synthesized sound effects (remotion/tools/sound.py)
src/Root.tsx            register one <Composition> per video
```

Reference videos: `src/videos/password-hash/PasswordHash.tsx` (newest pattern) and
`remotion/windows-con/` (first prototype, own project).

## Rules that made the prototype work
- **One world per video, not cards.** Every line of the script gets an object that *does* something
  (a form being filled, a machine hashing, a cable connecting, a stamp landing). Show, then caption.
- **Time events to words**, not to lines: `W(line, word)` gives the start second of a word. Things pop
  exactly when the narrator says them.
- **Frame 1 = the hook, complete**: headline (≤8 words, key word in orange mono) + the visual. Caption line 0
  is skipped (`skip={[0]}`) because the headline already says it. Something moves in the first 0.5 s.
- **Every scene change** gets a `Scene` crossfade and a `whoosh`; every pop/stamp/click its own SFX.
  Aim for one SFX every ~0.7 s on average, music bed at volume 0.11.
- **Layout**: top 120–540 headline/tags, stage 450–1330, captions start at y 1410. Nothing important below 1700.
- Use real values where the topic has them (real SHA-256 hashes, real error text), computed in Python, never invented.
- No real logos, brand UI or people. Generic windows/forms are fine.
- Don't use the grain overlay (it blotches after downscaling).

## Long-form (16:9) videos
`src/videos/int-max/` is the reference (first long-form in Remotion, 15 Nov 2026): `parts.tsx` (timing, `at(line, "word")`,
wide background, chapter cards, top progress bar, bit row, icons), `chaptersA/B.tsx` (one component per chapter), `IntMax.tsx`
(composition + SFX cues), `Thumb.tsx` (1280x720 thumbnail as a `<Still>`).
- Spec + narration: `videos/long-NN-slug/make_spec.py` → `video.json` (captions + chapter starts), then
  `remotion/tools/narrate_long.py` (adds a 1.25 s pause before each chapter, used for the chapter card).
- Captions: `<Captions maxChars={40} top={920} size={56} side={160} />`. Stage is y 120–880.
- Render takes ~25 min for 5 min at 2 cores. Re-encode the raw render with `-crf 22` so the mp4 stays under GitHub's 100 MB limit.
- To fix a few seconds, render only that range (`--frames=a-b`) and splice it into the raw render with ffmpeg `concat`.
