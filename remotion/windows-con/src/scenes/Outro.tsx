import React from "react";
import { C, END, INOUT, Keyboard, LINES, MONO, Monitor, Printer, Scene, W, lerp, pop, ramp, shake, useT } from "../ui";
import { Explorer, Headline, OK_BTN } from "./Explorer";

export const G = { a: 26.18, swap: 27.62 };

export const Outro: React.FC = () => {
  const t = useT();
  const later = W(8, 3), blocks = W(8, 6), hardware = W(8, 9), lastE = LINES[8].e;
  const count = ramp(t, G.a + 0.05, later + 0.25 - G.a, INOUT);
  const year = Math.round(lerp(1983, 2026, count));
  const p1 = 1 - ramp(t, G.swap - 0.1, 0.3); // timeline part visible
  const ex = ramp(t, G.swap, 0.45); // explorer part
  const dlg = pop(t, blocks, 10, 210);
  const ghost = ramp(t, hardware - 0.1, 0.4) * (1 - ramp(t, lastE - 0.1, 0.35));
  const head = ramp(t, lastE - 0.05, 0.4);
  const mark = ramp(t, hardware, 0.35) * (1 - ramp(t, lastE - 0.2, 0.3));
  return (
    <Scene a={G.a} b={END + 1} exit={false}>
      {p1 > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: p1, scale: `${lerp(1.1, 1, p1)}` }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 600, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 230, color: count >= 1 ? C.orange : C.white, textShadow: "0 0 60px rgba(251,146,60,.35)" }}>{year}</div>
          <div style={{ position: "absolute", left: 120, right: 120, top: 930, height: 14, borderRadius: 7, background: "rgba(245,241,232,.12)" }}>
            <div style={{ width: `${count * 100}%`, height: "100%", borderRadius: 7, background: `linear-gradient(90deg, ${C.green}, ${C.orange})`, boxShadow: "0 0 30px rgba(251,146,60,.6)" }} />
            <div style={{ position: "absolute", left: `${count * 100}%`, top: -13, width: 40, height: 40, marginLeft: -20, borderRadius: 20, background: "#fff", boxShadow: "0 0 30px #fff" }} />
          </div>
          <div style={{ position: "absolute", left: 100, right: 100, top: 980, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontWeight: 700, fontSize: 38, color: C.dim }}>
            <span>1983</span><span>2026</span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1090, display: "flex", justifyContent: "center" }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 56, color: C.navy, background: C.orange, padding: "10px 34px", borderRadius: 999, scale: `${lerp(0.3, 1, pop(t, later, 11))}`, opacity: Math.min(1, pop(t, later, 11) * 2) }}>+43 years</div>
          </div>
        </div>
      )}
      {ex > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: ex, scale: `${lerp(0.9, 1, ex)}`, filter: ex < 1 ? `blur(${(1 - ex) * 12}px)` : undefined }}>
          <Explorer name="CON" mode="err" dlg={dlg} dlgShake={shake(t, blocks, 12)} winShake={shake(t, blocks, 16)} mark={mark} cursor={{ x: OK_BTN.x - 20 + Math.sin(t * 2) * 6, y: OK_BTN.y - 10, op: ramp(t, lastE + 0.1, 0.35) }} />
          {/* ghosts of 1981 hardware, where the headline will land */}
          {ghost > 0 && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 40, opacity: ghost * 0.85, translate: `0px ${(1 - ghost) * 30}px` }}>
              <Monitor size={170} color={C.green} />
              <Keyboard size={170} color={C.green} />
              <Printer size={170} color={C.green} />
            </div>
          )}
          <Headline k={head} />
        </div>
      )}
    </Scene>
  );
};
