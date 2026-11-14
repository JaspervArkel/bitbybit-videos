import React, { useMemo } from "react";
import { C, Line, SANS, Word, lerp, pop, ramp, useT } from "./ui";

// TikTok-style chunks: ≤ ~18 chars, break after punctuation. Line 0 is covered by the on-screen headline.
type Chunk = { words: Word[]; s: number; e: number };
const buildChunks = (LINES: Line[], skip: number[], maxChars: number) => {
const chunks: Chunk[] = [];
LINES.forEach((ln, li) => {
  if (skip.includes(li)) return;
  let cur: Word[] = [];
  const flush = () => { if (cur.length) chunks.push({ words: cur, s: cur[0].s, e: 0 }); cur = []; };
  ln.words.forEach((w) => {
    const len = cur.reduce((a, x) => a + x.w.length + 1, 0);
    if (cur.length && len + w.w.length > maxChars) flush();
    cur.push(w);
    if (/[,.?:!]$/.test(w.w)) flush();
  });
  flush();
});
chunks.forEach((c, i) => {
  const next = chunks[i + 1];
  const lineEnd = LINES.find((l) => l.words.includes(c.words[c.words.length - 1]))!.e;
  c.e = next && next.s - lineEnd < 0.05 ? next.s : Math.min(next ? next.s : 99, lineEnd + 0.3);
});
return chunks;
};

const color = (st: string) => (st === "g" ? C.green : st === "o" ? C.orange : C.white);

/** Word-by-word captions. skip = line indexes covered by on-screen text (e.g. the hook headline). */
export const Captions: React.FC<{ lines: Line[]; skip?: number[]; maxChars?: number; top?: number }> = ({ lines, skip = [0], maxChars = 18, top = 1410 }) => {
  const t = useT();
  const chunks = useMemo(() => buildChunks(lines, skip, maxChars), [lines, skip, maxChars]);
  const c = chunks.find((x) => t >= x.s - 0.04 && t < x.e);
  if (!c) return null;
  const out = ramp(t, c.e - 0.08, 0.08);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexWrap: "wrap", justifyContent: "center", alignContent: "flex-start", gap: "4px 22px", opacity: 1 - out }}>
      {c.words.map((w, i) => {
        const k = pop(t, w.s - 0.04, 13, 260);
        const nextS = c.words[i + 1]?.s ?? c.e;
        const active = t >= w.s && t < nextS;
        return (
          <span key={i} style={{
            fontFamily: SANS, fontWeight: 900, fontSize: 84, lineHeight: 1.1, letterSpacing: -1,
            color: w.st ? color(w.st) : active ? C.white : "rgba(245,241,232,.92)",
            opacity: k > 0 ? Math.min(1, k * 1.5) : 0.0,
            scale: `${lerp(0.75, 1, k) * (active ? 1.06 : 1)}`,
            translate: `0px ${(1 - k) * 18}px`,
            display: "inline-block",
            WebkitTextStroke: "10px rgba(6,10,24,.9)", paintOrder: "stroke fill",
            textShadow: active && w.st ? `0 0 30px ${color(w.st)}88` : "0 6px 0 rgba(0,0,0,.25)",
          }}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};
