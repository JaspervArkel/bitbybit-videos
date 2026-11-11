# Weekly review: every Sunday evening

Goal: make next week's videos more engaging, based on this week's results. Change only what the data supports.

## 1. Collect
- Every entry in `posted.json`. For each Buffer post ID: `get_post` with `includeMetrics: true`. Record views or impressions, likes, comments, shares and saves (whatever Buffer returns) and `metricsUpdatedAt`.
- Retention data (3 s skip, average watch time, % viewed) comes only from the user's screenshots, saved under `analytics/`. Use them if present; never estimate them.
- Write everything to `analytics/metrics.json`, one row per video per platform: `{date, slug, platform, age_h, views, likes, comments, shares, saves, tags…}`. Copy the tags from the backlog entry.

## 2. Analyse
- Only compare posts at least 72 h old. Younger posts are listed as "too early".
- Normalise: likes, comments, shares and saves **per 1,000 views**. Compare within each platform, never across platforms.
- Group by tag (`hook_type`, `ending`, `pillar`, `length_s` band) and by the current experiment's arms.
- Small-sample rules: fewer than 3 videos per group = "signal only". Call a difference **evidence** only if it holds on at least 2 of 3 platforms and the gap is at least 1.5x.

## 3. Update `learnings.md`
- Add new evidence lines (dated, with sample sizes). Move hypotheses to evidence, or strike them, as the data says.
- Change **Rules in force** only on evidence. Add at most 2 rule changes per week.
- Close the current experiment if it ran 6 or more videos; record the result; start the next one from the hypotheses list (one variable at a time). If inconclusive, extend it a week.
- Append one line to "Review history".

## 4. Propose next week's topics
- Write 7 new entries into `backlog.json` with `status: "proposed"`, dated after the last approved entry. Include a script (75–85 words, written to the Rules in force), sources for every factual claim, and planned tags.
- Lean into what performed (pillars, hook types), but keep at least 3 different pillars in the week, and never repeat a topic.
- Never set `approved` yourself. The user approves in chat.

## 5. Report to the user (SendUserMessage)
Under 200 words:
- Top and bottom video of the week per platform, with per-1,000-view numbers
- What the experiment showed (or "too early")
- Rule changes made
- The 7 proposed topics (title + hook), asking for approval
- Runway: how many days of approved videos are left

Commit and push all changes with the message "Weekly review YYYY-MM-DD".

## Never
- Create, edit or delete Buffer posts during the review.
- Approve topics, or change approved scripts.
- Present a single video's result as a rule.
