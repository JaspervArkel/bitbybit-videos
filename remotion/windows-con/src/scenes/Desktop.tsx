import React from "react";
import { INOUT, IN, W, lerp, pop, ramp, shake, useT } from "../ui";
import { DEVICE_WORD, Explorer, Headline, NAMEBOX, OK_BTN } from "./Explorer";

// Beat timings (seconds)
export const A = { clickOk: 2.3, clickName: 2.78, keys: [2.9, 3.06, 3.22], enter: 3.44, zoom: 4.92, end: 5.45 };

export const Desktop: React.FC = () => {
  const t = useT();
  if (t > A.end) return null;
  const typedN = A.keys.filter((k) => t >= k).length;
  let name = "CON", mode: "sel" | "edit" | "err" = "err", caret = false;
  if (t >= 2.4 && t < A.clickName) { name = "New folder"; mode = "sel"; }
  else if (t >= A.clickName && t < A.enter) { name = "CON".slice(0, typedN); mode = "edit"; caret = Math.floor(t * 3) % 2 === 0 || typedN < 3; }
  const dlg = t < A.enter ? 1 - ramp(t, A.clickOk + 0.03, 0.12) : pop(t, A.enter, 10, 210);

  // cursor: rests on OK, clicks, glides to the name box, clicks, fades
  const glide = ramp(t, 2.42, 0.34, INOUT);
  const cx = lerp(OK_BTN.x - 20 + Math.sin(t * 2) * 6, NAMEBOX.cx + 120, glide);
  const cy = lerp(OK_BTN.y - 10, NAMEBOX.y + 20, glide);
  const down = Math.max(t > A.clickOk - 0.06 && t < A.clickOk + 0.08 ? 1 : 0, t > A.clickName - 0.06 && t < A.clickName + 0.08 ? 1 : 0);
  const cOp = 1 - ramp(t, 3.0, 0.25);

  // camera: slow push, then dive into the word "device"
  const push = lerp(1, 1.05, ramp(t, 0, 2.3, INOUT));
  const dive = ramp(t, A.zoom, A.end - A.zoom, IN);
  const scale = push * lerp(1, 7, dive);
  const head = 1 - ramp(t, 2.3, 0.3);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - ramp(t, A.end - 0.18, 0.18), filter: dive > 0.3 ? `blur(${(dive - 0.3) * 18}px)` : undefined }}>
      <div style={{ position: "absolute", inset: 0, scale: `${scale}`, transformOrigin: dive > 0 ? `${DEVICE_WORD.x}px ${DEVICE_WORD.y}px` : "540px 900px" }}>
        <Explorer
          name={name} mode={mode} caret={caret} dlg={dlg}
          dlgShake={shake(t, A.enter, 12) + shake(t, 0.02, 6, 0.3)}
          winShake={shake(t, A.enter, 16)}
          mark={ramp(t, W(1, 6) - 0.03, 0.35)}
          inv={pop(t, W(1, 9), 14)}
          cursor={cOp > 0 ? { x: cx, y: cy, down, op: cOp } : undefined}
        />
      </div>
      <Headline k={head} />
    </div>
  );
};
