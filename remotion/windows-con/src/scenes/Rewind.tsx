import React from "react";
import { C, Chip, FolderIcon, INOUT, MONO, Scene, W, lerp, pop, ramp, useT } from "../ui";

export const B = { a: 5.39, b: 7.99, rwA: 6.12, rwB: 7.25 };

export const Rewind: React.FC = () => {
  const t = useT();
  const inK = ramp(t, B.a - 0.06, 0.45);
  const up = ramp(t, B.rwA - 0.05, 0.45, INOUT);
  const roll = ramp(t, B.rwA, B.rwB - B.rwA, INOUT);
  const year = Math.round(lerp(2026, 1981, roll));
  const rewinding = t > B.rwA && t < B.rwB + 0.05;
  const rgb = rewinding ? 6 + Math.sin(t * 60) * 3 : 0;
  const yearK = pop(t, B.rwA - 0.05, 13);
  const folders = W(2, 6);
  return (
    <Scene a={B.a} b={B.b} enter={false}>
      {/* DEVICE? continues the dive from the previous scene */}
      <div style={{ position: "absolute", left: 0, right: 0, top: lerp(760, 300, up), textAlign: "center", opacity: inK, scale: `${lerp(3.2, 1, inK) * lerp(1, 0.5, up)}` }}>
        <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 160, color: C.green, textShadow: "0 0 60px rgba(74,222,128,.6)", display: "inline-block", rotate: `${Math.sin(t * 9) * 3 * (1 - up)}deg` }}>
          DEVICE?
        </span>
      </div>
      {/* rewind HUD */}
      {rewinding && (
        <div style={{ position: "absolute", left: 90, top: 470, fontFamily: MONO, fontWeight: 800, fontSize: 44, color: C.white, opacity: Math.floor(t * 4) % 2 ? 1 : 0.35 }}>◀◀ REWIND</div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", opacity: yearK, scale: `${lerp(0.6, 1, yearK)}` }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 250, color: roll >= 1 ? C.green : C.white, textShadow: `${rgb}px 0 rgba(255,60,90,.75), ${-rgb}px 0 rgba(60,200,255,.75), 0 0 70px rgba(74,222,128,${roll >= 1 ? 0.6 : 0.15})` }}>
          {year}
        </div>
      </div>
      {/* VHS tracking bands */}
      {rewinding && [0, 1, 2].map((i) => {
        const y = ((t * 2600 + i * 700) % 2100) - 100;
        return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: 26 + i * 10, background: "rgba(245,241,232,.08)", backdropFilter: "blur(2px)", boxShadow: "0 0 30px rgba(245,241,232,.1)" }} />;
      })}
      {/* conclusion: MS-DOS 1.0, no folders */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, display: "flex", justifyContent: "center", alignItems: "center", gap: 50 }}>
        <Chip text="MS-DOS 1.0" size={54} k={pop(t, B.rwB, 12)} />
        <div style={{ opacity: pop(t, folders - 0.05, 12), scale: `${lerp(0.5, 1, pop(t, folders - 0.05, 12))}` }}>
          <FolderIcon w={170} slash={ramp(t, folders + 0.1, 0.25)} />
        </div>
      </div>
    </Scene>
  );
};
