import React from "react";
import { C, Cable, Chip, INOUT, Keyboard, MONO, Monitor, Printer, Scene, Vortex, W, lerp, pop, ramp, useT } from "../ui";

export const Cc = { a: 7.99, b: 14.98 };
const CHIP_X = 250; // chip centre x
const R1 = 650, R2 = 975, R3 = 1225;

const Row: React.FC<{ y: number; text: string; sub: string; k: number; subK: number; color?: string }> = ({ y, text, sub, k, subK, color = C.green }) => (
  <div style={{ position: "absolute", left: CHIP_X - 200, width: 400, top: y - 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
    <Chip text={text} size={74} k={k} color={color} />
    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, color: C.dim, opacity: subK, translate: `0px ${(1 - subK) * 10}px` }}>{sub}</div>
  </div>
);

export const Devices: React.FC = () => {
  const t = useT();
  const con = W(3, 3), consoleW = W(3, 6), kb = W(3, 8), scr = W(3, 10);
  const prn = W(4, 0), printer = W(4, 3), nul = W(4, 4), away = W(4, 5);
  // camera: tight on row 1, then pull back to reveal the full table at "PRN"
  const pull = ramp(t, prn - 0.25, 0.6, INOUT);
  const scale = lerp(1.2, 1, pull);
  const monOn = ramp(t, scr, 0.3);
  const paper = ramp(t, printer + 0.1, 0.8);
  const vk = pop(t, nul, 12);
  const VX = 810, VY = R3;
  const letters = ["A", "b", "7", "#", "x", "?"];
  return (
    <Scene a={Cc.a} b={Cc.b}>
      <div style={{ position: "absolute", inset: 0, scale: `${scale}`, transformOrigin: `${lerp(640, 540, pull)}px ${lerp(620, 960, pull)}px` }}>
        {/* row 1: CON -> keyboard + screen */}
        <div style={{ position: "absolute", left: 700, top: 500, opacity: pop(t, Cc.a + 0.15, 14) }}><Monitor size={190} on={0.25 + 0.75 * monOn} /></div>
        <div style={{ position: "absolute", left: 700, top: 712, opacity: pop(t, Cc.a + 0.3, 14) }}><Keyboard size={200} press={ramp(t, kb, 2)} /></div>
        <Cable x1={CHIP_X + 125} y1={R1 + 8} x2={700} y2={762} p={ramp(t, kb - 0.05, 0.35)} />
        <Cable x1={CHIP_X + 125} y1={R1 - 8} x2={712} y2={580} p={ramp(t, scr - 0.05, 0.35)} />
        <Row y={R1} text="CON" sub="console" k={pop(t, con, 12)} subK={ramp(t, consoleW, 0.3)} />
        {/* row 2: PRN -> printer */}
        <div style={{ position: "absolute", left: 705, top: R2 - 120, opacity: pop(t, prn + 0.15, 14), scale: `${lerp(0.7, 1, pop(t, prn + 0.15, 14))}` }}><Printer size={190} paper={paper} /></div>
        <Cable x1={CHIP_X + 125} y1={R2} x2={712} y2={R2 + 10} p={ramp(t, printer - 0.05, 0.35)} />
        <Row y={R2} text="PRN" sub="printer" k={pop(t, prn, 12)} subK={ramp(t, printer, 0.3)} />
        {/* row 3: NUL -> nowhere */}
        <div style={{ position: "absolute", left: VX - 110, top: VY - 110, opacity: vk }}><Vortex size={220} k={lerp(0.3, 1, vk)} /></div>
        <Cable x1={CHIP_X + 125} y1={R3} x2={VX - 100} y2={VY} p={ramp(t, nul + 0.05, 0.3)} color={C.orange} />
        <Row y={R3} text="NUL" sub="nowhere" k={pop(t, nul, 12)} subK={ramp(t, away, 0.3)} color={C.orange} />
        {letters.map((ch, i) => {
          const s = away - 0.55 + i * 0.12;
          const k = ramp(t, s, 0.7);
          if (k <= 0 || k >= 1) return null;
          const ang = k * 5 + i;
          const r = (1 - k) * 330;
          const x = VX - Math.cos(ang) * r * 0.9 - (1 - k) * 120, y = VY + Math.sin(ang) * r * 0.35 - 20;
          return <div key={i} style={{ position: "absolute", left: x, top: y, fontFamily: MONO, fontWeight: 800, fontSize: 64, color: C.white, opacity: 1 - k * 0.6, scale: `${1 - k}`, rotate: `${k * 540}deg` }}>{ch}</div>;
        })}
      </div>
    </Scene>
  );
};
