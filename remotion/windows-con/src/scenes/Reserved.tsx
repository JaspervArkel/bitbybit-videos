import React from "react";
import { C, MONO, SANS, Scene, W, lerp, pop, ramp, shake, useT } from "../ui";

export const F = { a: 23.89, b: 26.18 };
export const NAMES = ["CON", "PRN", "AUX", "NUL", ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `COM${i}`), ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `LPT${i}`)];

export const Reserved: React.FC = () => {
  const t = useT();
  const reserved = W(7, 2), everywhere = W(7, 4);
  const orange = ramp(t, reserved, 0.4);
  const stamp = pop(t, everywhere, 9, 260);
  const sh = shake(t, everywhere, 14, 0.4);
  return (
    <Scene a={F.a} b={F.b}>
      <div style={{ position: "absolute", inset: 0, translate: `${sh}px ${sh * 0.5}px` }}>
        {NAMES.map((n, i) => {
          const col = i % 4, row = Math.floor(i / 4);
          const k = pop(t, F.a + 0.05 + i * 0.032, 12, 220);
          const c = orange > 0.5 && (i * 7) % 22 < orange * 22 + 2 ? C.orange : C.green;
          return (
            <div key={n} style={{
              position: "absolute", left: 85 + col * 232, top: 470 + row * 132, width: 214, height: 108, borderRadius: 24,
              border: `4px solid ${c}`, background: "rgba(10,18,38,.85)", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: MONO, fontWeight: 800, fontSize: 46, color: c, opacity: Math.min(1, k * 1.6), scale: `${lerp(0.3, 1, k)}`,
              boxShadow: `0 0 30px ${c}40`,
            }}>{n}</div>
          );
        })}
        {stamp > 0 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", justifyContent: "center", opacity: Math.min(1, stamp * 2) }}>
            <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 132, color: C.orange, border: `12px solid ${C.orange}`, borderRadius: 30, padding: "6px 40px", rotate: "-11deg", scale: `${lerp(2.4, 1, stamp)}`, background: "rgba(16,27,53,.82)", letterSpacing: 4, boxShadow: "0 0 90px rgba(251,146,60,.5)" }}>
              RESERVED
            </div>
          </div>
        )}
      </div>
    </Scene>
  );
};
