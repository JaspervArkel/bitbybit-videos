import React from "react";
import { AbsoluteFill } from "remotion";
import { C, MONO, SANS } from "../../lib/ui";
import { ClockIcon, CraftIcon, PlaneIcon, PlayIcon } from "./parts";

// YouTube thumbnail (1280x720) for "The Number That Keeps Breaking Computers"
export const IntMaxThumb: React.FC = () => (
  <AbsoluteFill style={{ background: C.navy, overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: -100, backgroundImage: "linear-gradient(rgba(74,222,128,.07) 2px, transparent 2px), linear-gradient(90deg, rgba(74,222,128,.07) 2px, transparent 2px)", backgroundSize: "80px 80px" }} />
    <div style={{ position: "absolute", width: 1100, height: 1100, borderRadius: "50%", left: 90, top: -260, background: "radial-gradient(circle, rgba(251,146,60,.28), transparent 62%)" }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(3,6,16,.8) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 44, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 104, letterSpacing: -3, color: C.white }}>THIS NUMBER</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 156, letterSpacing: -4, color: C.orange, textShadow: "0 0 70px rgba(251,146,60,.75), 0 8px 0 rgba(0,0,0,.35)" }}>2,147,483,647</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 368, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 104, letterSpacing: -3, color: C.white }}>BREAKS <span style={{ color: C.green }}>COMPUTERS</span></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 536, display: "flex", justifyContent: "center", alignItems: "center", gap: 76 }}>
      <PlayIcon size={128} color={C.green} />
      <PlaneIcon size={96} color={C.green} />
      <CraftIcon size={132} color={C.green} />
      <ClockIcon size={124} color={C.green} t={4} />
    </div>
  </AbsoluteFill>
);
