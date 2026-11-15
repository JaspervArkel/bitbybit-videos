import React from "react";
import { C, INOUT, MONO, SANS, lerp, pop, ramp, shake, useT } from "../../lib/ui";
import { At, BitRow, Check, ClockIcon, CraftIcon, INT_MAX, LS, Panel, Pill, PlaneIcon, PlayIcon, Sc, Stamp, T, Txt, WID, at, bitRowW, chEnd, chStart, fmt } from "./parts";

const lin = (x: number) => x;

/* STORYBOARD (chapters 0-3). One object per line, events on words.
 0 cold open : the number itself, spinning then locking; 4 story cards pop under it; "we'll never count that high".
 1 bits      : switches -> 32-cell row -> sign bit -> 31 ones = INT_MAX -> odometer rolls -> row flips negative -> OVERFLOW stamp.
 2 view count: generic video player + running view counter + limit gauge; the post; "broke" rumour; EASTER EGG stamp; 64-bit swap.
 3 the jet   : plane; 4 control units with counters; day counter to 248; failsafe; AC lost; the maths; power off/on; caught in testing. */

// ============ 0. COLD OPEN ============
const GROUPS = ["2", "147", "483", "647"];
const GLABEL = ["billion", "million", "thousand", ""];
export const StoryCard: React.FC<{ icon: React.ReactNode; title: string; sub: string; active?: boolean; w?: number; h?: number }> = ({ icon, title, sub, active, w = 400, h = 320 }) => (
  <Panel w={w} h={h} color={active ? C.green : C.line} glow={active ? 0.35 : 0}>
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <div style={{ height: 130, display: "flex", alignItems: "center" }}>{icon}</div>
      <Txt size={38}>{title}</Txt>
      <Txt size={30} mono color={C.orange}>{sub}</Txt>
    </div>
  </Panel>
);
export const CARDS = (t: number) => [
  { icon: <PlayIcon size={130} />, title: "A view counter", sub: "2014" },
  { icon: <PlaneIcon size={74} />, title: "A passenger jet", sub: "2015" },
  { icon: <CraftIcon size={130} />, title: "A NASA spacecraft", sub: "2013" },
  { icon: <ClockIcon size={124} t={t} />, title: "The clocks", sub: "2038" },
];

export const Intro: React.FC = () => {
  const t = useT();
  const lock = LS(1), l1 = LS(1), d1 = T1();
  const up = ramp(t, LS(2) - 0.25, 0.6, INOUT);
  const head = 1 - ramp(t, LS(2) - 0.3, 0.3);
  // counts up the last few thousand and lands exactly on the limit at `lock` (never shows a value above it)
  const shown = String(INT_MAX - Math.round(3600 * Math.pow(1 - ramp(t, 0, lock, lin), 2.2)));
  let di = 0;
  const gAt = [0, 0.13, 0.47, 0.78].map((x) => l1 + x * d1);
  const cardTimes = [LS(2), LS(3), LS(4), LS(5)];
  const cardsOut = ramp(t, at(6, "somebody") - 0.1, 0.35);
  const beat = 1 + 0.012 * Math.sin(t * 5);
  return (
    <Sc a={0} b={chEnd(0)} enter={false}>
      <At x={960} y={205} style={{ opacity: head, translate: `-50% ${-50 - (1 - head) * 30}%` }}>
        <Txt size={78} weight={900}>This number keeps <span style={{ color: C.orange }}>breaking</span> computers</Txt>
      </At>
      <div style={{ position: "absolute", left: 0, right: 0, top: lerp(385, 150, up), display: "flex", justifyContent: "center", scale: `${lerp(1, 0.62, up) * beat}` }}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          {GROUPS.map((g, gi) => {
            const hot = t >= gAt[gi] && t < l1 + d1 + 0.2;
            const k = pop(t, gAt[gi], 9, 220);
            const lab = pop(t, gAt[gi] + 0.05, 12) * (1 - ramp(t, LS(2) - 0.4, 0.3));
            return (
              <React.Fragment key={gi}>
                {gi > 0 && <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 176, color: C.dim, lineHeight: 1.1 }}>,</span>}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 176, lineHeight: 1.1, color: C.orange, textShadow: `0 0 ${50 + (hot ? 40 : 0)}px rgba(251,146,60,.6)`, scale: `${1 + (hot ? 0.07 * (1 - Math.min(1, k)) + 0.0 : 0)}`, translate: `0px ${hot ? -10 * Math.max(0, 1 - Math.abs(k - 0.6) * 2.5) : 0}px` }}>
                    {g.split("").map((ch) => {
                      const idx = di++;
                      return <span key={idx}>{shown[idx] ?? ch}</span>;
                    })}
                  </div>
                  <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: C.white, opacity: lab, translate: `0px ${(1 - lab) * -16}px`, height: 50 }}>{GLABEL[gi]}</div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      {CARDS(t).map((c, i) => {
        const k = pop(t, cardTimes[i], 12) * (1 - cardsOut);
        const active = t >= cardTimes[i] && (i === 3 ? t < LS(6) : t < cardTimes[i + 1]);
        return (
          <At key={i} x={960 + (i - 1.5) * 436} y={lerp(640, 720, cardsOut)} k={k}>
            <StoryCard {...c} active={active} />
          </At>
        );
      })}
      <At x={960} y={610} at={at(6, "somebody")} out={at(6, "we'll") - 0.15}>
        <Txt size={56} color={C.dim}>somebody thought…</Txt>
      </At>
      <At x={960} y={610} at={at(6, "we'll")} rot={-2}>
        <Pill color={C.orange} size={84}>“we'll never count that high”</Pill>
      </At>
    </Sc>
  );
};
function T1() { return T.LE(1) - T.LS(1); }

// ============ 1. WHY THIS NUMBER ============
const Toggle: React.FC<{ on: number }> = ({ on }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
    <div style={{ width: 170, height: 88, borderRadius: 44, background: on > 0.5 ? "rgba(74,222,128,.25)" : "rgba(245,241,232,.08)", border: `5px solid ${on > 0.5 ? C.green : "rgba(245,241,232,.3)"}`, position: "relative", boxShadow: on > 0.5 ? "0 0 40px rgba(74,222,128,.4)" : undefined }}>
      <div style={{ position: "absolute", top: 7, left: lerp(8, 92, on), width: 64, height: 64, borderRadius: 32, background: on > 0.5 ? C.green : C.white }} />
    </div>
    <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 70, color: on > 0.5 ? C.green : C.dim }}>{on > 0.5 ? "1" : "0"}</div>
  </div>
);
const Odometer: React.FC<{ roll: number }> = ({ roll }) => (
  <div style={{ display: "flex", gap: 8, padding: 14, borderRadius: 22, background: "#060B18", border: "4px solid rgba(245,241,232,.3)" }}>
    {[...Array(6)].map((_, i) => {
      const k = ramp(roll, (5 - i) * 0.08, 0.6, INOUT);
      return (
        <div key={i} style={{ width: 70, height: 96, borderRadius: 10, background: "#F5F1E8", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: -96 * (1 - k) }}>
            {["0", "9"].map((d) => <div key={d} style={{ height: 96, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 74, color: "#101B35" }}>{d}</div>)}
          </div>
        </div>
      );
    })}
  </div>
);

export const Bits: React.FC = () => {
  const t = useT();
  const a = chStart(1), b = chEnd(1);
  const rowAt = at(8, "32");
  const rowX = (WID - bitRowW(32)) / 2, rowY = 285;
  const swOut = ramp(t, rowAt - 0.15, 0.3);
  const fillA = at(11, "set"), fillD = at(11, "2") - 0.25 - fillA;
  const flipAt = at(14, "flips");
  const n = Math.round(31 * ramp(t, fillA, fillD, lin));
  const flipped = t >= flipAt;
  const bits = flipped ? "1" + "0".repeat(31) : "0" + "0".repeat(31 - n) + "1".repeat(n);
  const value = flipped ? -INT_MAX - 1 : Math.pow(2, n) - 1;
  const sign = t >= at(10, "one") ? 1 : 0;
  const sh = shake(t, flipAt, 22, 0.5);
  const comb = Math.round(4294967296 * ramp(t, at(9, "4.3") - 0.2, 0.9));
  const valK = pop(t, fillA - 0.1, 13);
  const roll = t < at(13, "rolls") ? 0 : (t - at(13, "rolls")) / 1.0;
  const swT = [LS(7) + 0.3, at(7, "bits"), at(7, "tiny"), at(7, "zero"), at(7, "one")];
  return (
    <Sc a={a} b={b}>
      {/* line 7: switches */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", gap: 70, opacity: 1 - swOut, scale: `${lerp(1, 0.6, swOut)}` }}>
        {swT.map((s, i) => {
          const flips = [s, s + 1.3 + i * 0.37, s + 2.9 + i * 0.21].filter((x) => t >= x).length;
          const last = [s, s + 1.3 + i * 0.37, s + 2.9 + i * 0.21].filter((x) => t >= x).pop() ?? -9;
          const target = (flips + (i % 2)) % 2;
          return <Toggle key={i} on={target ? ramp(t, last, 0.12) : 1 - ramp(t, last, 0.12)} />;
        })}
      </div>
      {/* 32 cells */}
      {t >= rowAt - 0.1 && (
        <div style={{ translate: `${sh}px 0px` }}>
          <BitRow bits={bits} x={rowX} y={rowY} sign={sign} appear={(i) => pop(t, rowAt + i * 0.018, 13)} />
        </div>
      )}
      <At x={960} y={215} at={rowAt + 0.3} out={at(10, "one") - 0.1}>
        <Txt size={46} mono color={C.green}>32 bits</Txt>
      </At>
      {/* sign + value labels */}
      <At x={rowX + 23} y={215} at={at(10, "one")} style={{ translate: "-20% -50%" }}>
        <Txt size={40} mono color={C.orange}>↓ sign: + or −</Txt>
      </At>
      <At x={rowX + 52 + (bitRowW(32) - 52) / 2} y={385} at={at(11, "31")}>
        <div style={{ width: bitRowW(32) - 60, height: 22, borderLeft: `4px solid ${C.green}`, borderRight: `4px solid ${C.green}`, borderBottom: `4px solid ${C.green}`, borderRadius: "0 0 14px 14px" }} />
      </At>
      <At x={rowX + 52 + (bitRowW(32) - 52) / 2} y={428} at={at(11, "31") + 0.1}>
        <Txt size={38} mono color={C.green}>31 bits for the value</Txt>
      </At>
      {/* line 9: combinations */}
      <At x={960} y={560} at={at(9, "4.3") - 0.2} out={LS(10) - 0.1}>
        <Txt size={120} mono color={C.green} glow>{fmt(comb)}</Txt>
        <Txt size={44} color={C.dim}>combinations</Txt>
      </At>
      {/* line 10: negatives */}
      <At x={960} y={560} at={at(10, "negative")} out={LS(11) - 0.1}>
        <Txt size={96} mono color={C.white}>−3 &nbsp;−2 &nbsp;−1 &nbsp;<span style={{ color: C.dim }}>0</span> &nbsp;1 &nbsp;2 &nbsp;3</Txt>
      </At>
      {/* value */}
      <At x={960 + (flipped ? sh : 0)} y={570} k={valK}>
        <Txt size={136} mono color={flipped ? C.orange : C.green} glow>{fmt(value)}</Txt>
      </At>
      <At x={1640} y={470} at={at(13, "one")} out={LS(16)}>
        <Pill color={C.white} size={56}>+ 1</Pill>
      </At>
      <At x={960} y={690} at={at(15, "most")} out={LS(16) - 0.1}>
        <Txt size={46} color={C.orange}>the most negative 32-bit number</Txt>
      </At>
      {/* odometer */}
      <At x={960} y={770} at={at(12, "odometer")} out={LS(14) + 0.4}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <Odometer roll={roll} />
          <Txt size={44} mono color={C.dim}>km</Txt>
        </div>
      </At>
      <Stamp x={960} y={800} at={at(16, "integer")} size={90}>INTEGER OVERFLOW</Stamp>
    </Sc>
  );
};

// ============ 2. THE VIEW COUNTER ============
export const Views: React.FC = () => {
  const t = useT();
  const a = chStart(2), b = chEnd(2);
  const s64 = at(23, "64");
  const v = t < s64
    ? lerp(2090000000, 2147300000, ramp(t, LS(17), LS(19) - LS(17), lin)) + Math.max(0, t - LS(19)) * 6100
    : lerp(2147300000 + (s64 - LS(19)) * 6100, 2152814218, ramp(t, s64, LS(26) - s64, lin));
  const is64 = t >= s64;
  const fill = is64 ? lerp(1, 0.004, ramp(t, s64, 0.7, INOUT)) : Math.min(1, v / INT_MAX);
  const near = !is64 && v / INT_MAX > 0.995;
  const msgOut = LS(25) - 0.15;
  const big = "9,223,372,036,854,775,807";
  const typed = big.slice(0, Math.round(big.length * ramp(t, at(24, "nine") - 0.2, 1.0, lin)));
  const f = Math.floor(t * 30);
  return (
    <Sc a={a} b={b}>
      {/* player */}
      <At x={470} y={400} at={a + 0.05}>
        <Panel w={700} h={410}>
          <div style={{ position: "absolute", left: 22, right: 22, top: 22, bottom: 86, borderRadius: 16, background: "#050915", overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 14, paddingBottom: 30 }}>
            {[...Array(17)].map((_, i) => <div key={i} style={{ width: 22, height: 40 + 170 * Math.abs(Math.sin(t * (4 + (i % 5)) + i * 1.7)), borderRadius: 8, background: i % 3 === 0 ? C.orange : C.green, opacity: 0.85 }} />)}
          </div>
          <div style={{ position: "absolute", left: 22, right: 22, bottom: 62, height: 8, borderRadius: 4, background: "rgba(245,241,232,.2)" }}>
            <div style={{ width: `${((t - a) * 3) % 100}%`, height: "100%", borderRadius: 4, background: C.orange }} />
          </div>
          <div style={{ position: "absolute", left: 26, bottom: 14, fontFamily: SANS, fontWeight: 700, fontSize: 30, color: C.dim }}>The most-watched video · December 2014</div>
        </Panel>
      </At>
      <At x={470} y={690} at={at(18, "view") - 0.1}>
        <Txt size={84} mono color={near ? C.orange : C.white} glow={near}>{fmt(v)}</Txt>
        <Txt size={36} color={C.dim}>views</Txt>
      </At>
      <At x={470} y={820} at={at(18, "view") + 0.2}>
        <Pill color={is64 ? C.green : C.white} size={40} style={{ scale: `${1 + 0.25 * (1 - Math.min(1, pop(t, s64, 9)))}` }}>{is64 ? "64-bit counter" : "32-bit counter"}</Pill>
      </At>
      {/* gauge */}
      <At x={1370} y={225} at={at(18, "closing")}>
        <div style={{ width: 840 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontWeight: 800, fontSize: 32, color: C.dim, marginBottom: 12 }}>
            <span>0</span>
            <span style={{ color: is64 ? C.green : C.orange }}>limit: {is64 ? (t >= at(24, "nine") - 0.2 ? typed : "64-bit") : fmt(INT_MAX)}</span>
          </div>
          <div style={{ height: 54, borderRadius: 16, background: "rgba(245,241,232,.1)", border: `4px solid ${is64 ? C.green : near ? C.orange : "rgba(245,241,232,.3)"}`, overflow: "hidden" }}>
            <div style={{ width: `${fill * 100}%`, height: "100%", background: is64 ? C.green : near && f % 10 < 5 ? "#FDBA74" : C.orange }} />
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: is64 ? C.green : C.white, marginTop: 12, textAlign: "right" }}>{is64 ? "0.00000002 % used" : `${(Math.floor((v / INT_MAX) * 1000) / 10).toFixed(1)} % used`}</div>
        </div>
      </At>
      {/* the post */}
      <At x={1370} y={560} at={LS(19)} out={msgOut}>
        <Panel w={840} h={300}>
          <div style={{ position: "absolute", left: 40, top: 28, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.green }}>YouTube · 1 December 2014</div>
          <div style={{ position: "absolute", left: 40, right: 40, top: 86, fontFamily: SANS, fontWeight: 700, fontSize: 38, lineHeight: 1.25, color: C.white, whiteSpace: "normal", opacity: ramp(t, LS(19) + 0.45, 0.3) }}>
            Never expected views beyond what a <span style={{ color: C.green }}>32-bit integer</span> can count…
          </div>
          <div style={{ position: "absolute", left: 40, right: 40, top: 204, fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: 40, color: C.orange, opacity: ramp(t, at(20, "32-bit"), 0.3) }}>“…but that was before we met PSY.”</div>
        </Panel>
      </At>
      <At x={1370} y={800} at={at(21, "broke")} out={msgOut} rot={-3} style={{ opacity: t >= at(22, "easter") ? 0.45 : 1 }}>
        <Pill color={C.orange} size={50}>headlines: it broke YouTube</Pill>
      </At>
      <Stamp x={1370} y={565} at={at(22, "easter")} color={C.green} size={104} out={msgOut}>EASTER EGG</Stamp>
      {/* someone was watching */}
      <At x={1370} y={600} at={at(25, "someone")}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <svg width={220} height={130} viewBox="0 0 110 65" style={{ overflow: "visible", filter: `drop-shadow(0 0 14px ${C.green})` }}>
            <path d="M4 32 Q55 -14 106 32 Q55 78 4 32 Z" fill={C.navy} stroke={C.green} strokeWidth={5} />
            <circle cx={55 + Math.sin(t * 2) * 10} cy={32} r={15} fill={C.green} />
          </svg>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Check k={pop(t, at(25, "watching"), 10)} size={70} />
            <Txt size={50}>fixed months before the limit</Txt>
          </div>
        </div>
      </At>
    </Sc>
  );
};

// ============ 3. THE 248-DAY JET ============
const PowerSwitch: React.FC<{ on: number }> = ({ on }) => (
  <div style={{ width: 360, height: 170, borderRadius: 85, border: `8px solid ${on > 0.5 ? C.green : C.orange}`, background: on > 0.5 ? "rgba(74,222,128,.18)" : "rgba(251,146,60,.14)", position: "relative", boxShadow: `0 0 70px ${on > 0.5 ? "rgba(74,222,128,.45)" : "rgba(251,146,60,.4)"}` }}>
    <div style={{ position: "absolute", top: 13, left: lerp(14, 204, on), width: 128, height: 128, borderRadius: 64, background: on > 0.5 ? C.green : C.orange }} />
    <div style={{ position: "absolute", top: 46, left: on > 0.5 ? 50 : 196, fontFamily: MONO, fontWeight: 800, fontSize: 60, color: on > 0.5 ? C.green : C.orange }}>{on > 0.5 ? "ON" : "OFF"}</div>
  </div>
);

export const Jet: React.FC = () => {
  const t = useT();
  const a = chStart(3), b = chEnd(3);
  const phaseB = LS(32) - 0.15;
  const fly = ramp(t, LS(27) - 0.1, 1.0);
  const leave = ramp(t, at(35, "air"), 1.6, INOUT);
  const px = lerp(-420, 520, fly) + leave * 1900, py = 285 + Math.sin(t * 1.3) * 10;
  const dayA = at(29, "248"), ovf = at(29, "overflows");
  const day = t < dayA ? Math.floor(Math.max(0, t - at(28, "counter")) * 1.5) : Math.round(lerp(4, 248, ramp(t, dayA, ovf - dayA, lin)));
  const full = t >= ovf;
  const fs = [at(30, "failsafe"), at(31, "overflow"), at(31, "overflow") + 0.09, at(31, "overflow") + 0.18];
  const dark = t >= at(31, "lose") && t < phaseB ? 1 : 0;
  const f = Math.floor(t * 30);
  const offAt = at(34, "off"), onAt = at(34, "on");
  const sw = t < offAt ? 1 : t < onAt ? 1 - ramp(t, offAt, 0.14) : ramp(t, onAt, 0.14);
  return (
    <Sc a={a} b={b}>
      <At x={960} y={470} at={a + 0.1} out={LS(27) - 0.2}>
        <Pill color={C.green} size={60}>found in laboratory testing</Pill>
      </At>
      <div style={{ position: "absolute", left: px - 195, top: py - 75, rotate: `${Math.sin(t * 1.3 + 1) * 1.2}deg` }}>
        <PlaneIcon size={150} dark={dark} color={dark ? C.orange : C.green} />
      </div>
      <At x={520} y={430} at={at(27, "787")} out={at(31, "lose") - 0.2}>
        <Pill color={C.white} size={36}>787 Dreamliner · 2015</Pill>
      </At>
      <At x={520} y={430} at={at(31, "lose")} out={phaseB} style={{ opacity: f % 14 < 9 ? 1 : 0.35 }}>
        <Pill color={C.orange} size={52} fill>AC POWER: LOST</Pill>
      </At>
      {/* day counter */}
      <At x={1400} y={285} at={at(28, "counter")} out={phaseB}>
        <Panel w={640} h={210} color={full ? C.orange : C.line} glow={full ? 0.3 : 0}>
          <div style={{ position: "absolute", left: 36, top: 22, fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.dim }}>continuously powered for</div>
          <div style={{ position: "absolute", left: 36, top: 62, fontFamily: MONO, fontWeight: 800, fontSize: 116, color: full ? C.orange : C.white }}>{String(day).padStart(3, "0")}<span style={{ fontSize: 50, color: C.dim }}> days</span></div>
        </Panel>
      </At>
      {/* control units */}
      {[0, 1, 2, 3].map((i) => {
        const failed = t >= fs[i];
        const col = failed ? C.orange : C.green;
        const hot = t >= at(28, "counter");
        return (
          <At key={i} x={330 + i * 420} y={655} at={at(28, "control") + i * 0.08} out={phaseB}>
            <Panel w={380} h={270} color={failed ? C.orange : C.line} glow={failed ? 0.35 : 0} style={{ translate: `${shake(t, fs[i], 12, 0.4)}px 0px` }}>
              <div style={{ position: "absolute", left: 28, top: 22, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: C.dim }}>generator control unit</div>
              <div style={{ position: "absolute", left: 28, top: 72, fontFamily: MONO, fontWeight: 800, fontSize: failed ? 54 : 44, color: failed ? C.orange : hot ? C.green : C.dim }}>
                {failed ? "FAILSAFE" : full ? "OVERFLOW" : hot ? fmt(Math.floor((day + ((t * 3) % 1)) * 8640000 + i * 37)) : "counter"}
              </div>
              <div style={{ position: "absolute", left: 28, right: 28, top: 158, height: 30, borderRadius: 10, background: "rgba(245,241,232,.1)", overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, (day / 248) * 100)}%`, height: "100%", background: full ? C.orange : col }} />
              </div>
              <div style={{ position: "absolute", left: 28, top: 204, fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.dim }}>counter {Math.min(100, Math.round((day / 248) * 100))}% full</div>
            </Panel>
          </At>
        );
      })}
      {/* phase B: the directive, the maths, the fix */}
      <At x={1150} y={620} at={at(32, "FAA")} out={LS(33) - 0.15}>
        <Panel w={900} h={330}>
          <div style={{ position: "absolute", left: 44, top: 30, fontFamily: MONO, fontWeight: 800, fontSize: 32, color: C.green }}>FAA airworthiness directive · 2015</div>
          <div style={{ position: "absolute", left: 44, right: 44, top: 96, fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: 44, lineHeight: 1.2, color: C.white, whiteSpace: "normal" }}>“…will overflow after 248 days of continuous power”</div>
          <div style={{ position: "absolute", left: 44, top: 240, fontFamily: MONO, fontWeight: 800, fontSize: 38, color: C.orange, opacity: ramp(t, at(32, "never"), 0.3) }}>counter size: not published</div>
        </Panel>
      </At>
      <At x={1150} y={520} at={at(33, "hundredths")} out={LS(34) - 0.15}>
        <Txt size={58} mono>100 ticks per second</Txt>
      </At>
      <At x={1150} y={610} at={at(33, "signed")} out={LS(34) - 0.15}>
        <Txt size={58} mono>room for <span style={{ color: C.orange }}>{fmt(INT_MAX)}</span> ticks</Txt>
      </At>
      <At x={1150} y={745} at={at(33, "248")} out={LS(34) - 0.15}>
        <Txt size={124} mono color={C.green} glow>= 248.55 days</Txt>
      </At>
      <At x={1150} y={590} at={LS(34)} out={LS(35) - 0.1}>
        <PowerSwitch on={sw} />
      </At>
      <At x={1150} y={780} at={at(34, "before")} out={LS(35) - 0.1}>
        <Pill color={C.green} size={50}>counter: 0</Pill>
      </At>
      <At x={1060} y={620} at={at(35, "testing")}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Check k={pop(t, at(35, "testing"), 10)} size={110} />
          <Txt size={76}>caught in testing</Txt>
        </div>
      </At>
    </Sc>
  );
};

