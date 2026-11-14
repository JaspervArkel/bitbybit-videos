# Bit by Bit: learnings

Read by every daily run before writing a video, and updated every Sunday by the weekly review.
Keep it short. Mark every line as **evidence** (backed by numbers, with a date and sample size) or **hypothesis**.

## Rules in force
Every new video applies these. The weekly review adds, changes or removes rules, and only on evidence.

1. Frame 1 shows the phenomenon, complete and readable with the sound off. No title card or logo. *(playbook)*
2. Something moves in the first 0.5 s: a counter running, a clock ticking, a bullet flying. A static first frame is not allowed. *(hypothesis, from internal review on 11 Nov)*
3. The spoken hook is 10 words or fewer and states the strange result, not a question about it. *(hypothesis: 255+1=0 beat question-style openers, see evidence 1)*
4. A visual change every 1.5–3 s; never more than 3 s of a static screen. *(playbook)*
5. Aim for 25–32 s of narration. Cut words rather than speed up the voice. *(hypothesis)*
6. No generic CTAs ("follow for more"). Endings follow the current experiment below.
7. Frame 1 must be readable in under 1 second: one big number, one short phrase or one striking visual. Never open on a timestamp, a code block or more than 8 words of on-screen text. *(provisional, from evidence 3; the review confirms or removes it)*
8. Prefer present-tense, everyday stakes in the hook ("your…", "the internet…"). Avoid hedge words like "some" or "might" in the first sentence when an accurate unhedged version exists. Never trade accuracy for this. *(provisional, from evidence 3)*
9. **Format: Remotion** (`remotion/studio/`, since 14 Nov). One evolving visual world per video, events timed to individual words, word-by-word captions, an SFX on every visual event, music bed. The HTML kit is only the fallback. *(provisional, from evidence 4; the review confirms or reverts it after ≥5 Remotion videos)*

## Evidence
1. Instagram snapshot, 10–11 Nov 2026, 5 Reels: "255 + 1 = 0" got 1,254 views (11.8x the median of the other four), 10.2 s average watch vs about 6 s, and a 41.6% 3-second skip rate vs about 48%. One clear winner; the cause is unproven (topic, hook and timing all differed).
2. Cross-platform, one early video: TikTok 600 views vs Instagram 48 and YouTube 18. Platforms can differ hugely for the same file. n=1.

3. **Signal (user-reported, 11 Nov, one pair, early):** "The internet ran out of addresses" (posted 11:39) became the account's best retention so far; "The 2038 clock bug" (posted 18:00) had near-zero retention in its first hour. Differences: present, relatable stakes vs a far-future date; one big number in frame 1 vs a full timestamp to read; a certain claim vs a hedged one ("some computers"). Exact numbers to be added from the user's screenshots.

4. **Remotion vs HTML kit, 14 Nov, n=1 pair, ~3 h after posting (both ~11:00, different topics):** Instagram: Remotion "Windows CON" 536 views / 359 reach, 13.3 s avg (42%), 5 likes, 2 saves vs kit "Excel 1900" 153 / 116, 15.5 s (47%), 0 likes, 1 share. TikTok: Remotion 312 views, 8.5 s (27%) vs kit 702 views, 10.7 s (32%). YouTube: no data yet. Reach clearly up on Instagram; retention not better on either platform; topic differs, so format isn't proven as the cause.

## Working hypotheses (to test)
- H8: The Remotion format (evolving scene world, word-timed visuals, SFX) raises reach and likes per 1,000 views vs the HTML kit without hurting average % viewed. Test: all videos from 14 Nov in Remotion; compare per-platform medians against the kit videos of 11–13 Nov at 72 h. *(from evidence 4)*
- H7: Hooks about the viewer's present world, stated with certainty, beat future or hedged stakes. Frame 1 must be readable in under 1 s (one number or one short phrase, not a timestamp or a paragraph). *(from evidence 3)*
- H1: Hooks that show an impossible result on screen beat question hooks on 3 s skip rate.
- H2: Gaming and AI topics get more shares than number-system topics.
- H3: Ending with a specific, answerable question raises comments without hurting likes.
- H4: Shorter videos (25–28 s) complete more often than 32–35 s versions of similar topics.
- H5: A specific follow CTA that previews tomorrow's video raises follows per 1,000 views without lowering likes.
- H6: Posting at US evening time (01:00 Amsterdam) gets more views than 18:00 Amsterdam (US midday).

## Current experiment
**E5, 12–18 Nov: specific follow CTA (tests H5).** Only the ending changes; the approved script stays as is, plus one added spoken line.
- `ending: follow_cta` (backlog n = 2, 4, 6, 8): after the last script line, add one spoken caption, "Follow: tomorrow, <next video's topic in 3–6 words>." The next video is the next approved backlog entry; use its plain title, e.g. "Follow: tomorrow, why AI can't spell." The endcard shows the takeaway plus "Follow · tomorrow: <topic>". Captions end with the same line. If there is no next approved entry, use `implication` instead.
- `ending: implication` (n = 3, 5, 7): the endcard states the takeaway. No CTA.
- Measured on follows (if Buffer or screenshots provide them) and likes, comments and shares per 1,000 views, at 72 hours or older.

## Upcoming experiments (already scheduled in backlog tags)
- **E6, 19–25 Nov: question ending (tests H3).** `ending: comment_prompt` (n = 10, 12, 14): the endcard becomes a short, specific question the viewer can answer from their own life ("What does your drive say?"). The Instagram `firstComment` asks it too, and the captions end with it. Odd n: `implication`.
- **E7, from 19 Nov: posting time (tests H6).** Videos dated 12–18 Nov post at 18:00 Europe/Amsterdam (12:00 New York). Videos dated 19–25 Nov post at **01:00 Europe/Amsterdam the following night** (19:00 New York, 16:00 Los Angeles). Compare week against week on views at 72 h, per platform. Inconclusive after 2 weeks? Extend.

## Posting schedule
Each backlog entry's `post_time` decides when it goes out: "18:00" = 18:00 Europe/Amsterdam on its date; "01:00+1" = 01:00 Europe/Amsterdam on the day after its date. The weekly review may change future entries' `post_time` only as part of an experiment.

## Tag vocabulary (set on every backlog entry when built)
- `hook_type`: impossible_result | counterintuitive_claim | everyday_mystery | scale_analogy | story
- `ending`: implication | comment_prompt | follow_cta
- `post_time`: "18:00" | "01:00+1"
- `visual`: "remotion: <main objects>", e.g. "remotion: login form+hash machine+db table" (kit fallback: the kit components used)
- `format`: remotion | kit
- `length_s`: final duration in seconds

## Review history
*(The weekly review appends one dated line per week: what changed and why.)*
