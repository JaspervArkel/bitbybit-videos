import React from "react";
import { C, Cable, Chip, FolderIcon, MONO, Monitor, Printer, Scene, Vortex, W, lerp, pop, ramp, useT } from "../ui";

export const E = { a: 18.55, b: 23.89 };
const ROOT = { x: 540, y: 470 };
const L1 = [{ x: 200, l: "GAMES" }, { x: 540, l: "WORK" }, { x: 880, l: "SCHOOL" }].map((o) => ({ ...o, y: 700 }));
const L2 = [
  { x: 115, l: "SAVES", p: 0 }, { x: 290, l: "MAPS", p: 0 },
  { x: 455, l: "TAXES", p: 1 }, { x: 625, l: "CV", p: 1 },
  { x: 795, l: "MATH", p: 2 }, { x: 965, l: "ART", p: 2 },
].map((o) => ({ ...o, y: 930 }));
const BADGES = ["NUL", "PRN", "CON"];
const HUB = { y: 1215 };

const Branch: React.FC<{ x1: number; y1: number; x2: number; y2: number; p: number }> = ({ x1, y1, x2, y2, p }) => {
  if (p <= 0) return null;
  const my = (y1 + y2) / 2;
  const d = `M${x1} ${y1} V${my} H${x2} V${y2}`;
  const len = Math.abs(x2 - x1) + Math.abs(y2 - y1) + 2;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1080} height={1920}>
      <path d={d} fill="none" stroke="rgba(245,241,232,.35)" strokeWidth={5} strokeDasharray={len} strokeDashoffset={len * (1 - p)} strokeLinejoin="round" />
    </svg>
  );
};

const Node: React.FC<{ x: number; y: number; w: number; label: string; k: number; badge?: string; bk: number }> = ({ x, y, w, label, k, badge, bk }) => (
  <div style={{ position: "absolute", left: x - 80, top: y, width: 160, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: Math.min(1, k * 1.5), scale: `${lerp(0.4, 1, k)}` }}>
    <div style={{ position: "relative" }}>
      <FolderIcon w={w} />
      {badge && bk > 0 && (
        <div style={{ position: "absolute", right: -26, top: -22, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.navy, background: C.orange, padding: "3px 10px", borderRadius: 10, scale: `${lerp(0.2, 1, bk)}`, opacity: Math.min(1, bk * 2), boxShadow: "0 0 24px rgba(251,146,60,.8)" }}>{badge}</div>
      )}
    </div>
    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: w > 100 ? 30 : 26, color: C.white, opacity: 0.8 }}>{label}</div>
  </div>
);

export const Tree: React.FC = () => {
  const t = useT();
  const added = W(6, 2), folders = W(6, 3), y83 = W(6, 5), theNames = W(6, 6), work = W(6, 10), every = W(6, 12);
  const all = [...L1.map((n) => ({ ...n, w: 120 })), ...L2.map((n) => ({ ...n, w: 92 }))];
  const badgeAt = (i: number) => work + i * 0.08;
  const hubK = pop(t, theNames, 13);
  return (
    <Scene a={E.a} b={E.b}>
      {/* root */}
      <div style={{ position: "absolute", left: 0, right: 0, top: ROOT.y - 50, display: "flex", justifyContent: "center" }}>
        <Chip text="C:\" size={58} k={pop(t, E.a + 0.05, 13)} />
      </div>
      {L1.map((n, i) => <Branch key={n.l} x1={ROOT.x} y1={ROOT.y + 50} x2={n.x} y2={n.y} p={ramp(t, added + i * 0.08, 0.4)} />)}
      {L2.map((n, i) => <Branch key={n.l} x1={L1[n.p].x} y1={L1[n.p].y + 130} x2={n.x} y2={n.y} p={ramp(t, y83 + i * 0.06, 0.35)} />)}
      {/* converging cables to the same devices */}
      {all.map((n, i) => (
        <Cable key={`c${i}`} x1={n.x + 40} y1={n.y + 10} x2={540} y2={HUB.y - 60} p={ramp(t, every - 0.1 + i * 0.03, 0.4)} color={C.orange} bend={0.0} pulse={false} />
      ))}
      {L1.map((n, i) => <Node key={n.l} x={n.x} y={n.y} w={120} label={n.l} k={pop(t, folders + i * 0.1, 12)} badge={BADGES[i % 3]} bk={pop(t, badgeAt(i), 12)} />)}
      {L2.map((n, i) => <Node key={n.l} x={n.x} y={n.y} w={92} label={n.l} k={pop(t, y83 + 0.15 + i * 0.07, 12)} badge={BADGES[(i + 1) % 3]} bk={pop(t, badgeAt(i + 3), 12)} />)}
      {/* device hub */}
      <div style={{ position: "absolute", left: 0, right: 0, top: HUB.y - 70, display: "flex", justifyContent: "center", alignItems: "center", gap: 34, opacity: hubK, scale: `${lerp(0.6, 1, hubK)}` }}>
        <div style={{ borderRadius: 40, border: `4px solid ${C.orange}`, background: "rgba(10,18,38,.9)", padding: "14px 34px", display: "flex", gap: 28, alignItems: "center", boxShadow: "0 0 60px rgba(251,146,60,.3)" }}>
          <Monitor size={100} color={C.orange} />
          <Printer size={100} color={C.orange} />
          <Vortex size={100} />
        </div>
      </div>
    </Scene>
  );
};
