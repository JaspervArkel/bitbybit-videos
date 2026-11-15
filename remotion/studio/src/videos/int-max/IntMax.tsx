import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { C, FPS, ramp, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import { CHAPTERS, ChapterCards, LE, LS, T, TopBar, WideBackground, at, chEnd, chStart } from "./parts";
import { Bits, Intro, Jet, Views } from "./chaptersA";
import { Close, Craft, Share, Y2038a, Y2038b } from "./chaptersB";

// Long-form video 2: "The Number That Keeps Breaking Computers" (16:9, 1920x1080).
// Storyboards are at the top of chaptersA.tsx / chaptersB.tsx. Facts + sources: videos/long-02-int-max/sources.md
export const INT_MAX_FRAMES = T.TOTAL_FRAMES;
const A = (p: string) => staticFile(`videos/int-max/${p}`);

type Cue = [number, string, number];
const ticks = (from: number, n: number, step: number, vol = 0.6): Cue[] => [...Array(n)].map((_, i) => [from + i * step, "tick", vol] as Cue);
const SFX: Cue[] = [
  // 0 cold open
  [0, "impact", 0.5], ...ticks(0.35, 14, 0.12, 0.5), [LS(1), "stamp", 0.7],
  [LS(1) + 0.13 * (LE(1) - LS(1)), "pop", 0.6], [LS(1) + 0.47 * (LE(1) - LS(1)), "pop", 0.6], [LS(1) + 0.78 * (LE(1) - LS(1)), "pop", 0.6],
  [LS(2) - 0.2, "whoosh", 0.5], [LS(2), "pop", 0.8], [LS(3), "pop", 0.8], [LS(4), "pop", 0.8], [LS(5), "pop", 0.8],
  [at(6, "somebody") - 0.1, "whoosh", 0.4], [at(6, "we'll"), "impact", 0.8],
  // 1 bits
  [LS(7) + 0.3, "click", 0.8], [at(7, "bits"), "click", 0.8], [at(7, "tiny"), "click", 0.8], [at(7, "zero"), "click", 0.8], [at(7, "one"), "click", 0.8],
  [at(8, "32") - 0.1, "whoosh", 0.5], ...ticks(at(8, "32"), 12, 0.05, 0.5),
  [at(9, "4.3") - 0.2, "riser", 0.35], [at(9, "4.3") + 0.7, "pop", 0.7],
  [at(10, "negative"), "pop", 0.6], [at(10, "one"), "zap", 0.6],
  [at(11, "31"), "pop", 0.6], [at(11, "set"), "riser", 0.4], ...ticks(at(11, "set"), 16, (at(11, "2") - 0.25 - at(11, "set")) / 16, 0.6), [at(11, "2") - 0.2, "chime", 0.7],
  [at(12, "odometer"), "pop", 0.7], [at(13, "one"), "pop", 0.7], [at(13, "rolls"), "printer", 0.5],
  [at(14, "flips"), "error", 0.5], [at(14, "flips"), "impact", 0.9], [at(15, "most"), "pop", 0.6],
  [at(16, "integer"), "stamp", 1], [at(16, "integer"), "impact", 0.6],
  // 2 views
  [chStart(2), "whoosh", 0.5], [chStart(2) + 0.1, "pop", 0.6], [at(18, "view") - 0.1, "pop", 0.6], [at(18, "closing"), "pop", 0.6], ...ticks(at(18, "closing") + 0.2, 10, 0.16, 0.4),
  [LS(19), "whoosh", 0.4], [LS(19) + 0.05, "pop", 0.7], [LS(19) + 0.45, "click", 0.6], [at(20, "32-bit"), "pop", 0.6],
  [at(21, "broke"), "impact", 0.8], [at(22, "easter"), "stamp", 1], [at(22, "easter") + 0.05, "chime", 0.6],
  [at(23, "64") - 0.05, "zap", 0.7], [at(23, "64"), "whoosh", 0.5], ...ticks(at(24, "nine") - 0.2, 12, 0.08, 0.6), [at(24, "nine") + 0.8, "pop", 0.6],
  [at(25, "someone"), "pop", 0.7], [at(25, "watching"), "chime", 0.8],
  // 3 jet
  [chStart(3), "whoosh", 0.5], [chStart(3) + 0.1, "pop", 0.6], [LS(27) - 0.1, "whoosh", 0.6], [at(27, "787"), "pop", 0.6],
  [at(28, "control"), "pop", 0.6], [at(28, "control") + 0.08, "pop", 0.5], [at(28, "control") + 0.16, "pop", 0.5], [at(28, "control") + 0.24, "pop", 0.5], [at(28, "counter"), "zap", 0.6],
  [at(29, "248"), "riser", 0.5], ...ticks(at(29, "248"), 14, (at(29, "overflows") - at(29, "248")) / 14, 0.6), [at(29, "overflows"), "error", 0.5],
  [at(30, "failsafe"), "impact", 0.8], [at(31, "overflow"), "stamp", 0.7], [at(31, "overflow") + 0.09, "stamp", 0.6], [at(31, "overflow") + 0.18, "stamp", 0.6],
  [at(31, "lose"), "error", 0.6], [at(31, "lose"), "impact", 0.9],
  [LS(32) - 0.15, "whoosh", 0.5], [at(32, "FAA"), "pop", 0.7], [at(32, "never"), "click", 0.6],
  [at(33, "hundredths"), "pop", 0.6], [at(33, "signed"), "pop", 0.6], [at(33, "248"), "impact", 0.7], [at(33, "248"), "chime", 0.6],
  [LS(34), "whoosh", 0.4], [at(34, "off"), "click", 1], [at(34, "off") + 0.03, "enter", 0.7], [at(34, "on"), "click", 1], [at(34, "on") + 0.03, "zap", 0.6], [at(34, "before"), "pop", 0.6],
  [at(35, "testing"), "chime", 0.9], [at(35, "air"), "whoosh", 0.6],
  // 4 spacecraft
  [chStart(4), "whoosh", 0.5], [chStart(4) + 0.1, "pop", 0.6], [LS(37), "pop", 0.5], [at(37, "2005"), "pop", 0.5], [at(37, "fired"), "zap", 0.7], [at(37, "comet"), "impact", 0.9],
  [LS(38), "pop", 0.6], ...ticks(LS(38) + 0.3, 6, 0.3, 0.5), [at(38, "august"), "pop", 0.6], [at(38, "silent"), "error", 0.5], [at(38, "silent"), "impact", 0.6],
  [LS(39) - 0.15, "whoosh", 0.5], [at(39, "never") - 0.2, "pop", 0.6], [at(39, "potential"), "click", 0.7],
  [LS(40) - 0.1, "whoosh", 0.4], [at(40, "count"), "riser", 0.5], ...ticks(at(40, "count"), 24, (at(41, "4.29") - at(40, "count")) / 24, 0.5),
  [at(41, "4.29"), "impact", 0.8], [at(41, "11th"), "stamp", 0.9],
  [LS(42) - 0.1, "pop", 0.6], [LS(42) + 0.25, "pop", 0.6], [at(42, "contact"), "pop", 0.7],
  [LS(43) - 0.15, "whoosh", 0.5], [at(43, "rebooting"), "error", 0.4], [at(43, "rebooting") + 0.55, "error", 0.3], [at(43, "rebooting") + 1.1, "error", 0.3], [at(43, "orientation"), "vortex", 0.5], [at(43, "antennas"), "pop", 0.6],
  [at(44, "mission"), "impact", 0.6],
  // 5 share
  [chStart(5), "whoosh", 0.5], [chStart(5) + 0.1, "pop", 0.6], [LS(46), "riser", 0.4], ...ticks(LS(46), 14, 0.2, 0.4), [at(46, "420,000"), "chime", 0.6],
  [at(47, "stored") - 0.1, "pop", 0.6], [at(47, "32-bit"), "pop", 0.6], [at(47, "four"), "click", 0.8],
  [at(48, "429,496") - 0.1, "zap", 0.6], [at(48, "429,496"), "impact", 0.8],
  [at(49, "stopped"), "error", 0.5], [at(49, "stopped"), "stamp", 0.6], [at(49, "upgraded"), "chime", 0.9],
  // 6 2038
  [chStart(6), "whoosh", 0.5], [at(50, "big"), "impact", 1], [at(50, "big"), "stamp", 0.8],
  [LS(51) - 0.2, "whoosh", 0.5], [LS(51), "pop", 0.6], [at(51, "seconds"), "pop", 0.6], ...ticks(at(51, "seconds") + 0.3, 12, 1, 0.7),
  [at(52, "unix"), "pop", 0.7], ...ticks(at(52, "32-bit"), 10, 0.045, 0.5), [at(53, "limit"), "impact", 0.6],
  [LS(54) - 0.2, "whoosh", 0.4], [at(54, "that"), "riser", 0.6], ...ticks(at(54, "that"), 20, (at(54, "19th") - at(54, "that")) / 20, 0.5), [at(54, "19th"), "stamp", 0.9], [at(54, "seven"), "pop", 0.6],
  ...ticks(at(54, "seven") + 0.4, 3, 1, 0.8),
  [at(55, "flips"), "error", 0.6], [at(55, "flips"), "impact", 1], [at(55, "flips") + 0.1, "rewind", 0.5], [at(55, "december"), "stamp", 0.7],
  [at(56, "year"), "stamp", 1], [at(56, "year"), "impact", 0.6],
  [at(57, "64") - 0.05, "zap", 0.7], ...ticks(at(57, "64"), 10, 0.04, 0.5), [at(57, "64") + 0.4, "chime", 0.8],
  [LS(58) - 0.2, "whoosh", 0.5], [at(58, "292"), "impact", 0.7], [at(58, "292") + 0.1, "riser", 0.4], [at(58, "billion"), "pop", 0.6],
  [LS(59) - 0.15, "whoosh", 0.4], [at(59, "phones"), "pop", 0.7], [at(59, "phones") + 0.25, "chime", 0.5], [at(59, "laptops"), "pop", 0.7], [at(59, "laptops") + 0.25, "chime", 0.5], [at(59, "already"), "pop", 0.6],
  [LS(60) - 0.15, "whoosh", 0.4], [at(60, "older"), "pop", 0.7], [at(60, "embedded"), "pop", 0.7], [at(60, "machines"), "pop", 0.7], [at(60, "hard"), "stamp", 0.8],
  [LS(61) - 0.15, "whoosh", 0.4], [LS(61), "riser", 0.4], [at(61, "eleven"), "impact", 0.8], [at(61, "years"), "pop", 0.6],
  // 7 pattern
  [chStart(7), "whoosh", 0.5], ...[0, 1, 2, 3, 4].map((i) => [chStart(7) + 0.15 + i * 0.22, "pop", 0.7] as Cue),
  [LS(63) - 0.15, "whoosh", 0.4], [at(63, "picked"), "pop", 0.6], [at(63, "size"), "click", 1], [at(63, "impossibly"), "chime", 0.7],
  [LS(64) - 0.15, "whoosh", 0.4], [at(64, "two"), "pop", 0.8], [at(64, "eight"), "pop", 0.8], [at(64, "share"), "pop", 0.8],
  [LS(65) - 0.15, "whoosh", 0.4], [at(65, "world"), "riser", 0.6], [at(65, "it") + 0.25, "impact", 0.9],
  [LS(66) - 0.15, "whoosh", 0.4], [at(66, "we'll"), "pop", 0.8], [at(66, "eventually"), "riser", 0.6], ...ticks(at(66, "eventually"), 12, (at(66, "does") - at(66, "eventually")) / 12, 0.5),
  [at(66, "does"), "pop", 0.7], [LE(66) + 0.2, "chime", 0.8], [LE(66) + 0.55, "error", 0.5], [LE(66) + 0.55, "impact", 1],
  // chapter cards
  ...CHAPTERS.slice(1).flatMap((c) => [[LS(c.line) - 1.1, "whoosh", 0.5], [LS(c.line) - 1.05, "stamp", 0.5]] as Cue[]),
];

export const IntMax: React.FC = () => {
  const t = useT();
  const space = ramp(t, chStart(4) - 0.5, 0.8) * (1 - ramp(t, chEnd(4) - 0.2, 0.8));
  const skip = [0, 1];
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <WideBackground space={space} />
      <Intro />
      <Bits />
      <Views />
      <Jet />
      <Craft />
      <Share />
      <Y2038a />
      <Y2038b />
      <Close />
      <ChapterCards />
      <Captions lines={T.LINES} skip={skip} maxChars={40} top={920} size={56} side={160} />
      <TopBar />
      <Audio src={A("narration.wav")} />
      <Audio src={A("music.wav")} volume={(f) => interpolate(f, [0, 15, T.TOTAL_FRAMES - 45, T.TOTAL_FRAMES], [0, 0.09, 0.09, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {SFX.map(([s, name, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s * FPS))} durationInFrames={Math.round(1.6 * FPS)} layout="none">
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol * 0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
