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
9. **Format: Remotion** (`remotion/studio/`, since 14 Nov). One evolving visual world per video, events timed to individual words, word-by-word captions, an SFX on every visual event, music bed. The HTML kit is only the fallback. *(provisional, from evidence 4. 22 Nov: 6 Remotion videos ≥72 h, neither confirmed nor reverted, see evidence 8; kept as the production format, re-read 29 Nov)*
10. **Hook type:** at most 2 `counterintuitive_claim` hooks per week. Prefer hooks that show the result happening or the everyday thing going wrong (`impossible_result`, `everyday_mystery`, `scale_analogy`). Never changes an approved script; applies to new proposals. *(evidence 7, 22 Nov)*

## Evidence
1. Instagram snapshot, 10–11 Nov 2026, 5 Reels: "255 + 1 = 0" got 1,254 views (11.8x the median of the other four), 10.2 s average watch vs about 6 s, and a 41.6% 3-second skip rate vs about 48%. One clear winner; the cause is unproven (topic, hook and timing all differed).
2. Cross-platform, one early video: TikTok 600 views vs Instagram 48 and YouTube 18. Platforms can differ hugely for the same file. n=1.

3. **Signal (user-reported, 11 Nov, one pair, early):** "The internet ran out of addresses" (posted 11:39) became the account's best retention so far; "The 2038 clock bug" (posted 18:00) had near-zero retention in its first hour. Differences: present, relatable stakes vs a far-future date; one big number in frame 1 vs a full timestamp to read; a certain claim vs a hedged one ("some computers"). Exact numbers to be added from the user's screenshots.

4. **Remotion vs HTML kit, 14 Nov, n=1 pair, ~3 h after posting (both ~11:00, different topics):** Instagram: Remotion "Windows CON" 536 views / 359 reach, 13.3 s avg (42%), 5 likes, 2 saves vs kit "Excel 1900" 153 / 116, 15.5 s (47%), 0 likes, 1 share. TikTok: Remotion 312 views, 8.5 s (27%) vs kit 702 views, 10.7 s (32%). YouTube: no data yet. Reach clearly up on Instagram; retention not better on either platform; topic differs, so format isn't proven as the cause.

5. **Weekly review 15 Nov (Buffer metrics, only 2 videos ≥72 h; n=1 per arm, signal only).** "2038 clock bug" vs "Internet ran out of addresses", per 1,000 views: YouTube likes 23.7 vs 16.7 (1,139 / 1,021 views); Instagram likes 22.4 vs 6.3, saves 14.9 vs 6.3, shares 7.5 vs 6.3 (134 / 158 views, so 1–3 actions each); TikTok likes 17.1 vs 27.5 (759 / 1,344 views). Buffer average watch time: Instagram 6.4 s vs 13.0 s, TikTok 11.0 s vs 14.5 s. So ipv4 held viewers longer on both platforms that report it (fits evidence 3), but likes per view did not follow: 2038 led on YouTube (1.4x) and Instagram (3.5x, on 3 likes), ipv4 on TikTok (1.6x). Beat-sheet flags: password-hash (flagged: no number in beats 1–3, 4.9 s over target) has the week's lowest average watch so far (Instagram 3.9 s, TikTok 5.8 s), but at ~20 h; recheck at 72 h. Comments were 0 on all six posts. Does not move H7 to evidence.

6. **E5 closed, 22 Nov (Buffer, all ≥72 h except fpga Instagram, republished 20 Nov).** `follow_cta` n=4 (bullet-tunneling, password-hash, cpu-second, fpga; Instagram n=3) vs `implication` n=3 (ai-tokens, terabyte-931, loading-bars). Median likes per 1,000 views: YouTube 13.0 vs 9.2 (1.4x), Instagram 12.1 vs 8.1 (1.5x), TikTok 7.4 vs 14.6 (implication 2.0x). Comments ≈0 in both arms (cpu-second YouTube 3, password-hash YouTube 1). Instagram shares/saves are 0–4 actions per video. Buffer returns no `follows` for these posts, so H5's main metric is unmeasurable. Average watch: Instagram 8.6 vs 8.2 s, TikTok 8.4 vs 11.7 s. Directions conflict across platforms, so no evidence; H5 not supported. `follow_cta` dropped.
7. **Hook type, 22 Nov (unplanned grouping, ≥72 h).** `counterintuitive_claim` (ipv4, ai-tokens, password-hash, fpga; n=4, Instagram n=3) vs all other hook types (y2k38, bullet-tunneling, terabyte-931, cpu-second, loading-bars; n=5). Median likes per 1,000: Instagram 6.3 vs 16.6 (2.6x), TikTok 6.7 vs 15.4 (2.3x), YouTube 12.9 vs 10.5 (counterintuitive 1.2x ahead). Average watch: Instagram 6.3 vs 8.6 s, TikTok 7.3 vs 11.7 s (1.6x). Instagram median views 124 vs 361. Meets our bar (≥3 per group, ≥1.5x on 2 of 3 platforms), but the grouping was chosen after looking and topics differ, so rule 10 is a cap, not a ban.
8. **Remotion vs kit (H8), 22 Nov, ≥72 h.** Kit n=5 (y2k38, ipv4, bullet-tunneling, ai-tokens, excel-1900) vs Remotion n=6 (windows-con, password-hash, terabyte-931, cpu-second, loading-bars, fpga; Instagram n=5). Median likes per 1,000: YouTube 13.2 vs 9.6 (Remotion 1.4x), Instagram 11.0 vs 8.1 (1.4x), TikTok 7.5 vs 17.1 (kit 2.3x). Instagram median views 361 vs 157 (2.3x); YouTube and TikTok views about equal. Average watch lower for Remotion: Instagram 8.6 vs 12.9 s, TikTok 8.9 vs 11.2 s. Remotion videos are all later, so account age is a confound. Not evidence either way; H8 (more likes without losing watch time) is not supported so far.
9. **Beat-sheet flags, 22 Nov.** password-hash (flagged: no number in beats 1–3, 4.9 s over) is the lowest at ≥72 h (Instagram 3.8 s avg watch, 0 likes; TikTok 5.9 s). terabyte-931 carried similar flags (no number in beat 1, a 5.5 s beat, 34.5 s) and is the best (Instagram 16.2 s, 16.9 likes/1k; TikTok 16.1 s). Almost every Remotion video gets the same flags, so they don't separate winners from losers yet.
10. **Too early (<72 h at the 22 Nov snapshot):** frame-pacing, ai-image-numbers (first E6 question ending, 0 comments so far), random-seed, deleted-files, fpga Instagram. Early E7 signal only: TikTok views for the 01:00 posts are 204–319 at 30–54 h vs ~700–780 for 18:00 posts at similar ages; Instagram and YouTube mixed. Data notes: random-seed TikTok shows 0 views at 19 h; deleted-files YouTube went out at 10:28 Amsterdam, not 01:00.

## Working hypotheses (to test)
- H8 *(22 Nov: not supported so far, see evidence 8)*: The Remotion format (evolving scene world, word-timed visuals, SFX) raises reach and likes per 1,000 views vs the HTML kit without hurting average % viewed. Test: all videos from 14 Nov in Remotion; compare per-platform medians against the kit videos of 11–13 Nov at 72 h. *(from evidence 4)*
- H7: Hooks about the viewer's present world, stated with certainty, beat future or hedged stakes. Frame 1 must be readable in under 1 s (one number or one short phrase, not a timestamp or a paragraph). *(from evidence 3; 15 Nov: watch time supports it, likes per view don't yet, see evidence 5)*
- H9: Hooks that state a surprising fact (`counterintuitive_claim`) get fewer likes and shorter watch than hooks that show the result or an everyday failure. *(from evidence 7; rule 10 caps it while E6/E7 run; test as E8 once E6 closes)*
- H1: Hooks that show an impossible result on screen beat question hooks on 3 s skip rate.
- H2: Gaming and AI topics get more shares than number-system topics.
- H3: Ending with a specific, answerable question raises comments without hurting likes. *(baseline 15 Nov: 0 comments on all 6 posts ≥72 h; E6 tests it)*
- H4: Shorter videos (25–28 s) complete more often than 32–35 s versions of similar topics.
- ~~H5: A specific follow CTA that previews tomorrow's video raises follows per 1,000 views without lowering likes.~~ *(22 Nov: E5 closed, not supported; follows not measurable via Buffer; evidence 6)*
- H6: Posting at US evening time (01:00 Amsterdam) gets more views than 18:00 Amsterdam (US midday).

## Current experiment
**E6, 19–25 Nov: question ending (tests H3)**, see below. Read at the 29 Nov review; extend a week if fewer than 6 videos are ≥72 h. E7 (posting time) runs alongside.

## Closed experiments
**E5, 12–18 Nov: specific follow CTA (tests H5). CLOSED 22 Nov: no evidence, `follow_cta` dropped (evidence 6).** Only the ending changes; the approved script stays as is, plus one added spoken line.
- `ending: follow_cta` (backlog n = 2, 4, 6, 8): after the last script line, add one spoken caption, "Follow: tomorrow, <next video's topic in 3–6 words>." The next video is the next approved backlog entry; use its plain title, e.g. "Follow: tomorrow, why AI can't spell." The endcard shows the takeaway plus "Follow · tomorrow: <topic>". Captions end with the same line. If there is no next approved entry, use `implication` instead.
- `ending: implication` (n = 3, 5, 7): the endcard states the takeaway. No CTA.
- Measured on follows (if Buffer or screenshots provide them) and likes, comments and shares per 1,000 views, at 72 hours or older.
- *Status 15 Nov:* 4 of 7 videos posted, none ≥72 h at the Buffer snapshot (bullet-tunneling 68–71 h). Too early; not closed. Read on 22 Nov (needs 6+ videos ≥72 h; extend a week if fewer).

## Running and upcoming experiments (already scheduled in backlog tags)
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
- 2026-11-15: First weekly review. Only y2k38 and ipv4 were ≥72 h, so no rule changes; added evidence 5 (n=1 pair, signal only), E5 too early (read 22 Nov), H8 needs ≥5 Remotion videos at 72 h. Proposed 7 topics for 25 Nov–1 Dec (pillars A, B, C, D, E, F). No retention screenshots in analytics/ this week.
2026-11-19 scheduled frame-pacing 01:00+1 implication
2026-11-20 scheduled ai-image-numbers 01:00+1 comment_prompt
2026-11-21 scheduled deleted-files 01:00+1 implication
2026-11-22 scheduled keyboard-matrix 01:00+1 comment_prompt
2026-11-23 scheduled location-no-gps 01:00+1 implication
2026-11-24 scheduled float-point-three 01:00+1 comment_prompt
- 2026-11-22: Second weekly review. E5 closed (7 videos, no evidence; follow_cta dropped). New rule 10 (cap counterintuitive_claim hooks at 2/week) from evidence 7. Rule 9 (Remotion) kept, unconfirmed (evidence 8). E6/E7 too early. Proposed 7 topics for 2–8 Dec (pillars A, B, C, D, E, E, F, no counterintuitive hooks); last week's 7 (25 Nov–1 Dec) still await approval. No retention screenshots in analytics/.
2026-11-25 scheduled coyote-time 01:00+1 implication
2026-11-26 scheduled ai-temperature 18:00 implication
2026-11-27 scheduled microwave-wifi 18:00 implication
