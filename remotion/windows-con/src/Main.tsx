import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, EraTag, FPS, TOTAL_FRAMES, W, ramp, useT } from "./ui";
import { Captions } from "./Captions";
import { A, Desktop } from "./scenes/Desktop";
import { B, Rewind } from "./scenes/Rewind";
import { Devices } from "./scenes/Devices";
import { CopyPrn, D } from "./scenes/CopyPrn";
import { Tree } from "./scenes/Tree";
import { F, Reserved } from "./scenes/Reserved";
import { G, Outro } from "./scenes/Outro";

// [time (s), sfx name, volume]
const SFX: [number, string, number][] = [
  [0.0, "impact", 0.5],
  [A.clickOk, "click", 0.9], [A.clickName, "click", 0.9],
  ...A.keys.map((k) => [k, "key", 1] as [number, string, number]),
  [A.enter, "enter", 0.9], [A.enter + 0.02, "impact", 0.8], [A.enter + 0.02, "error", 0.75],
  [A.zoom, "whoosh", 0.8],
  [B.rwA, "rewind", 0.7], [B.rwB, "pop", 0.7], [W(2, 6) - 0.05, "pop", 0.7], [W(2, 6) + 0.1, "stamp", 0.4],
  [8.0, "whoosh", 0.4],
  [W(3, 3), "pop", 0.8], [W(3, 8), "zap", 0.7], [W(3, 10), "zap", 0.7],
  [W(4, 0) - 0.25, "whoosh", 0.45], [W(4, 0), "pop", 0.8], [W(4, 3), "zap", 0.7], [W(4, 3) + 0.1, "printer", 0.55],
  [W(4, 4), "pop", 0.8], [W(4, 4) + 0.05, "vortex", 0.8],
  [D.a, "whoosh", 0.4],
  ...[...Array(10)].map((_, i) => [D.typeA + i * 0.092, "key", 0.55] as [number, string, number]),
  [W(5, 3), "pop", 0.6], [W(5, 5), "enter", 0.9], [W(5, 5) + 0.1, "whoosh", 0.5], [W(5, 9), "printer", 0.7],
  [18.55, "whoosh", 0.4],
  [W(6, 3), "pop", 0.6], [W(6, 3) + 0.1, "pop", 0.5], [W(6, 3) + 0.2, "pop", 0.5],
  [W(6, 5), "tick", 0.8], [W(6, 5) + 0.15, "tick", 0.8], [W(6, 5) + 0.3, "tick", 0.8],
  [W(6, 6), "pop", 0.6], [W(6, 10), "zap", 0.5], [W(6, 12), "riser", 0.6],
  [F.a, "whoosh", 0.4],
  ...[...Array(8)].map((_, i) => [F.a + 0.05 + i * 0.09, "tick", 0.7] as [number, string, number]),
  [W(7, 4), "stamp", 1], [W(7, 4), "impact", 0.8],
  [G.a, "whoosh", 0.4],
  ...[...Array(12)].map((_, i) => [G.a + 0.1 + i * 0.09, "tick", 0.6] as [number, string, number]),
  [W(8, 3), "pop", 0.7], [G.swap, "whoosh", 0.6],
  [W(8, 6), "impact", 0.8], [W(8, 6), "error", 0.75],
];

export const Main: React.FC = () => {
  const t = useT();
  const retro = ramp(t, 6.1, 0.8) * (1 - ramp(t, G.swap - 0.2, 0.6));
  return (
    <AbsoluteFill style={{ backgroundColor: "#101B35" }}>
      <Background retro={retro} />
      <Desktop />
      <Rewind />
      <Devices />
      <CopyPrn />
      <Tree />
      <Reserved />
      <Outro />
      <EraTag text="1981 · MS-DOS 1.0" at={8.05} until={18.55} />
      <EraTag text="1983 · DOS 2.0" at={W(6, 5)} until={23.89} />
      <Captions />
      <Bug />
      {/* <Grain /> */}
      <Audio src={staticFile("narration.wav")} />
      <Audio
        src={staticFile("music.wav")}
        volume={(f) => interpolate(f, [0, 10, TOTAL_FRAMES - 25, TOTAL_FRAMES], [0.0, 0.11, 0.11, 0.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
      {SFX.map(([s, name, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s * FPS))} durationInFrames={Math.round(1.6 * FPS)} layout="none">
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol * 0.55} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
