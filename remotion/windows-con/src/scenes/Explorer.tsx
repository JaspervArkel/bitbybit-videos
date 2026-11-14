import React from "react";
import { C, FolderIcon, Cursor, MONO, SANS, lerp } from "../ui";

export const WIN = { x: 70, y: 600, w: 940, h: 380 };
export const DLG = { x: 110, y: 1010, w: 860 };
export const NAMEBOX = { cx: 540, y: 880 };
export const OK_BTN = { x: 862, y: 1222 };
export const DEVICE_WORD = { x: 690, y: 1080 }; // zoom origin

export type ExplorerProps = {
  name: string;
  mode: "sel" | "edit" | "err";
  caret?: boolean;
  dlg: number; // 0..1 (spring)
  dlgShake?: number;
  mark?: number;
  inv?: number;
  winShake?: number;
  cursor?: { x: number; y: number; down?: number; op?: number };
};

const Item: React.FC<{ x: number; y: number; label: string }> = ({ x, y, label }) => (
  <div style={{ position: "absolute", left: x - 85, top: y, width: 170, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
    <FolderIcon w={150} />
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.white, opacity: 0.85 }}>{label}</div>
  </div>
);

export const Explorer: React.FC<ExplorerProps> = ({ name, mode, caret, dlg, dlgShake = 0, mark = 0, inv = 0, winShake = 0, cursor }) => {
  const col = [227, 540, 853];
  const border = mode === "err" ? C.orange : C.green;
  return (
    <div style={{ position: "absolute", inset: 0, translate: `${winShake}px 0px` }}>
      {/* window */}
      <div style={{
        position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 34,
        background: "linear-gradient(180deg, rgba(28,40,74,.96), rgba(16,25,52,.96))", border: `3px solid ${C.line}`,
        boxShadow: "0 40px 120px rgba(0,0,0,.55)", overflow: "hidden",
      }}>
        <div style={{ height: 92, display: "flex", alignItems: "center", gap: 26, padding: "0 34px", borderBottom: `3px solid ${C.line}` }}>
          <div style={{ display: "flex", gap: 14 }}>
            {[0, 1, 2].map((i) => <div key={i} style={{ width: 22, height: 22, borderRadius: 11, background: "rgba(245,241,232,.22)" }} />)}
          </div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.dim }}>‹ ›&nbsp;&nbsp;Documents</div>
          <div style={{ marginLeft: "auto", width: 230, height: 50, borderRadius: 25, background: "rgba(245,241,232,.07)", border: `2px solid ${C.line}` }} />
        </div>
      </div>
      <Item x={col[0]} y={730} label="Photos" />
      <Item x={col[2]} y={730} label="Music" />
      {/* target folder + rename box */}
      <div style={{ position: "absolute", left: NAMEBOX.cx - 75, top: 730 }}>
        <FolderIcon w={150} glow={mode === "err" ? 0 : 0.6} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: NAMEBOX.y, display: "flex", justifyContent: "center" }}>
        <div style={{
          minWidth: 250, padding: "6px 22px", borderRadius: 14, border: `4px solid ${border}`, background: mode === "err" ? "rgba(251,146,60,.14)" : "rgba(74,222,128,.08)",
          fontFamily: mode === "sel" ? SANS : MONO, fontWeight: 800, fontSize: mode === "sel" ? 36 : 50, textAlign: "center",
          color: mode === "err" ? C.orange : C.white, boxShadow: `0 0 40px ${border}44`,
        }}>
          {mode === "sel" ? <span style={{ background: "rgba(74,222,128,.45)", padding: "0 6px", borderRadius: 6 }}>{name}</span> : name}
          {caret && <span style={{ display: "inline-block", width: 26, height: 50, marginLeft: 4, verticalAlign: "-8px", background: C.green }} />}
        </div>
      </div>
      {/* error dialog */}
      {dlg > 0.001 && (
        <div style={{
          position: "absolute", left: DLG.x, top: DLG.y, width: DLG.w, borderRadius: 34, padding: "40px 40px 34px",
          background: "linear-gradient(180deg,#232D52,#1A2344)", border: `4px solid ${C.orange}`,
          boxShadow: `0 30px 100px rgba(0,0,0,.6), 0 0 ${60 + inv * 60}px rgba(251,146,60,${0.25 + inv * 0.25})`,
          opacity: Math.min(1, dlg * 1.6), scale: `${lerp(1.25, 1, dlg)}`, translate: `${dlgShake}px ${(1 - dlg) * 40}px`,
        }}>
          <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
            <div style={{ flex: "none", width: 84, height: 84, borderRadius: 42, background: C.orange, color: C.navy, fontFamily: SANS, fontWeight: 900, fontSize: 58, display: "flex", alignItems: "center", justifyContent: "center" }}>!</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 48, lineHeight: 1.18, color: C.white }}>
              The specified{" "}
              <span style={{ position: "relative", display: "inline-block" }}>
                <span style={{ position: "absolute", left: -6, right: -6, bottom: 2, height: "46%", background: C.green, opacity: 0.55, borderRadius: 6, scale: `${mark} 1`, transformOrigin: "left center" }} />
                <span style={{ position: "relative", color: mark > 0.5 ? C.green : C.white }}>device</span>
              </span>
              <br />
              name is <span style={{ color: inv > 0.05 ? C.orange : C.white, textShadow: inv > 0.05 ? `0 0 ${24 * inv}px rgba(251,146,60,.9)` : undefined }}>invalid.</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 26 }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, color: C.navy, background: C.white, padding: "10px 46px", borderRadius: 999 }}>OK</div>
          </div>
        </div>
      )}
      {cursor && <Cursor x={cursor.x} y={cursor.y} down={cursor.down} opacity={cursor.op ?? 1} />}
    </div>
  );
};

export const Headline: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ position: "absolute", top: 196, left: 0, right: 0, textAlign: "center", opacity: k, translate: `0px ${(1 - k) * -40}px` }}>
    <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 74, lineHeight: 1.08, color: C.white, letterSpacing: -1 }}>
      Windows won't let you
      <br />
      name a folder
    </div>
    <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 150, lineHeight: 1.05, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)", letterSpacing: 6 }}>CON</div>
  </div>
);
