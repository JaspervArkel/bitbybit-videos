import React from "react";
import { C, Cable, DocIcon, INOUT, MONO, Printer, Scene, W, lerp, pop, ramp, useT } from "../ui";

export const D = { a: 14.98, b: 18.55, typeA: 15.08, typeB: 16.0 };
const CMD = "COPY LETTER.TXT PRN";
const TERM = { x: 70, y: 470, w: 940, h: 420 };
const PR = { x: 430, y: 1060, size: 220 };

export const CopyPrn: React.FC = () => {
  const t = useT();
  const names = W(5, 3), files = W(5, 5), hardware = W(5, 9);
  const n = Math.round(lerp(0, CMD.length, ramp(t, D.typeA, D.typeB - D.typeA, (x) => x)));
  const typed = CMD.slice(0, n);
  const prnK = ramp(t, names, 0.3);
  const fly = ramp(t, files + 0.08, hardware - files - 0.12, INOUT);
  const out = t > hardware + 0.12;
  // flight path: from terminal (PRN word) to printer slot
  const sx = 820, sy = 820, ex = PR.x + PR.size / 2, ey = PR.y + 70;
  const bx = lerp(sx, ex, fly) + Math.sin(fly * Math.PI) * 120;
  const by = lerp(sy, ey, fly) - Math.sin(fly * Math.PI) * 160;
  return (
    <Scene a={D.a} b={D.b}>
      {/* CRT terminal */}
      <div style={{ position: "absolute", left: TERM.x, top: TERM.y, width: TERM.w, height: TERM.h, borderRadius: 40, background: "radial-gradient(ellipse at 50% 40%, #0F2A1E, #06120D)", border: `5px solid rgba(74,222,128,.45)`, boxShadow: "0 0 90px rgba(74,222,128,.18), inset 0 0 80px rgba(0,0,0,.7)", overflow: "hidden", padding: "56px 50px" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 50, color: C.green, textShadow: "0 0 14px rgba(74,222,128,.8)", lineHeight: 1.6, whiteSpace: "pre" }}>
          <div>
            A&gt;{typed.replace(/PRN$/, "")}
            {typed.endsWith("PRN") && (
              <span style={{ position: "relative" }}>
                <span style={{ position: "absolute", inset: "-4px -10px", border: `4px solid ${C.green}`, borderRadius: 10, opacity: prnK, scale: `${lerp(1.4, 1, prnK)}`, background: "rgba(74,222,128,.15)" }} />
                PRN
              </span>
            )}
            {!out && Math.floor(t * 3) % 2 === 0 && <span style={{ display: "inline-block", width: 30, height: 52, background: C.green, verticalAlign: "-8px", marginLeft: 6 }} />}
          </div>
          {out && <div style={{ opacity: ramp(t, hardware + 0.12, 0.2) }}>{"        1 file(s) copied"}</div>}
          <div style={{ fontSize: 36, color: "rgba(74,222,128,.6)", marginTop: 26, opacity: ramp(t, names + 0.1, 0.3) }}>PRN is not a file. It's the printer.</div>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 3px, transparent 3px 6px)", pointerEvents: "none" }} />
      </div>
      {/* cable from PRN to the printer */}
      <Cable x1={sx} y1={sy - 120} x2={ex + 40} y2={PR.y + 40} p={ramp(t, names + 0.05, 0.4)} bend={0.2} />
      <div style={{ position: "absolute", left: PR.x, top: PR.y, opacity: pop(t, D.a + 0.25, 14) }}>
        <Printer size={PR.size} paper={ramp(t, hardware, 0.9)} />
      </div>
      {fly > 0 && fly < 1 && (
        <div style={{ position: "absolute", left: bx - 65, top: by - 80, scale: `${lerp(1, 0.4, fly)}`, rotate: `${fly * 25}deg` }}>
          <DocIcon />
        </div>
      )}
    </Scene>
  );
};
