# Skills used by the daily run and the weekly review

Copied from two MIT-licensed packs so every run has them, even in a fresh cloud session:
- `instagram/`: Jake Schincariol's instagram-agent-skill (github.com/Jakeschincariol/instagram-agent-skill)
- `marketing/`: Corey Haines' marketingskills (github.com/coreyhaines31/marketingskills)

Run the scripts with `python3 -I`; they only read and write local text files.

## Order of authority
1. Approved scripts in `backlog.json`: never reworded by any tool here.
2. `learnings.md` (Rules in force, current experiment).
3. These skills. They give generic advice; when it conflicts with our own evidence, our evidence wins.
   Example: `hookscore.py` scores "The internet ran out of addresses" 30/100, yet it is our best-retaining video so far.
   Hook scores are a tie-breaker between new proposals, never a reason to reject or rewrite an approved hook.

## Where each one is used

| Step | Tool | What it does here |
|------|------|-------------------|
| Daily, step 5 (Buffer text) | `instagram/ig-human/humanize.py` | Removes em dashes, curly quotes, invisible characters and stock AI words from all three platform captions. |
| Daily, step 5 (Instagram) | `instagram/ig-caption/caption.py` | Checks what shows before "… more", hashtag placement and search terms. |
| Daily, step 3 (QA, advisory) | `instagram/ig-reel/beats.py` | Flags beats over 4 s and a hook past 3 s. Report flags; do not edit the approved script to fix them. |
| Weekly review, step 2 | `marketing/ab-testing/` | Sample-size sense check before calling a result. |
| Weekly review, step 2 | `instagram/ig-audit/SKILL.md` | Structure for the "what worked, what to stop" read. |
| Weekly review, step 4 | `instagram/ig-reel/hooks.json` + `hookscore.py` | Source of hook formulas and a score for each proposed hook. |
| Weekly review, step 4 | `instagram/ig-human/` + `marketing/copy-editing/` | Humanise and tighten proposed scripts before the user approves them. |
| Weekly review, step 4 | `marketing/content-strategy/`, `marketing/social/` | Topic and format ideas. |
| Optional, user-run | `instagram/ig-viral/swipe.py` | Ranks reels the user collected in the niche by how far they beat their account's normal views. |
