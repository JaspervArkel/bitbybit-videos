import React from "react";
import { C, INOUT, MONO, SANS, lerp, pop, ramp, shake, useT } from "../../lib/ui";
import { At, BitRow, ChartIcon, Check, ChipIcon, ClockIcon, CraftIcon, INT_MAX, LE, LS, LaptopIcon, Panel, PhoneIcon, Pill, PlaneIcon, PlayIcon, Sc, Stamp, T, Txt, at, bitRowW, chEnd, chStart, fmt, toBits } from "./parts";
import { StoryCard } from "./chaptersA";

const lin = (x: number) => x;
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const p2 = (n: number) => String(n).padStart(2, "0");
const dateOf = (ms: number) => {
  const d = new Date(ms);
  return { day: `${d.getUTCDate()} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`, time: `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())}` };
};

/* STORYBOARD (chapters 4-7)
 4 spacecraft: craft + comet impact; Earth link goes silent; NASA line; tenths-of-a-second counter races to 2^32 = 11 Aug 2013; timeline; tumbling craft.
 5 share     : rising price chart; price stored as 32-bit with 4 decimals; ceiling line at $429,496.7295; feed paused -> upgraded.
 6 2038      : "2038" slam; clock + Unix seconds counter + its 32 bits; race to the limit; flip to 1901; 64-bit row; 292 billion years; who is safe / at risk; 83.6% used.
 7 pattern   : the five stories; pick a size; three "impossible" numbers; the world grows into the limit; final overflow + brand. */

// ============ 4. THE LOST SPACECRAFT ============
const Earth: React.FC<{ r?: number }> = ({ r = 130 }) => (
  <svg width={r * 2} height={r * 2} viewBox="0 0 100 100" style={{ overflow: "visible", filter: "drop-shadow(0 0 22px rgba(74,222,128,.5))" }}>
    <circle cx={50} cy={50} r={46} fill="#12305A" stroke={C.green} strokeWidth={4} />
    <path d="M22 34 Q34 22 46 30 Q50 42 38 48 Q28 52 22 34 Z M54 52 Q70 46 76 60 Q72 76 60 74 Q50 66 54 52 Z M30 62 Q38 60 40 70 Q34 78 28 70 Z" fill={C.green} opacity={0.75} />
  </svg>
);

export const Craft: React.FC = () => {
  const t = useT();
  const a = chStart(4), b = chEnd(4);
  const B = LS(39) - 0.15, Cc = LS(43) - 0.15;
  const toB = ramp(t, B, 0.6, INOUT), toC = ramp(t, Cc, 0.6, INOUT);
  const cx = lerp(lerp(1150, 1640, toB), 1000, toC), cy = lerp(lerp(420, 250, toB), 420, toC) + Math.sin(t * 1.1) * 12;
  const cs = lerp(lerp(1, 0.55, toB), 1.1, toC);
  const tumbleAt = at(43, "orientation");
  const rot = t < tumbleAt ? Math.sin(t * 0.8) * 3 : 3 + (t - tumbleAt) * 46;
  const gone = ramp(t, LS(44), 2.2, lin);
  const fireA = at(37, "fired"), hit = at(37, "comet");
  const shot = ramp(t, fireA, hit - fireA, lin);
  const silent = at(38, "silent");
  const cA = at(40, "count"), cB = at(41, "4.29");
  const v = Math.round(4294967296 * ramp(t, cA, cB - cA, (x) => x * x * (3 - 2 * x)));
  const d = dateOf(Date.UTC(2000, 0, 1) + v * 100);
  const lockAt = at(41, "11th");
  const hitLimit = t >= cB;
  const rebootAt = at(43, "rebooting");
  const reboots = t < rebootAt ? 0 : 1 + Math.floor((t - rebootAt) / 0.55);
  return (
    <Sc a={a} b={b}>
      {/* comet (line 37) */}
      <At x={1600} y={300} at={LS(37)} out={LS(38) - 0.2}>
        <svg width={420} height={220} viewBox="0 0 210 110" style={{ overflow: "visible" }}>
          <path d="M60 55 L205 20 L205 90 Z" fill="url(#tail)" />
          <defs><linearGradient id="tail" x1="0" x2="1"><stop offset="0" stopColor="rgba(245,241,232,.7)" /><stop offset="1" stopColor="rgba(245,241,232,0)" /></linearGradient></defs>
          <circle cx={56} cy={55} r={30} fill="#8A8F9C" stroke={C.white} strokeWidth={4} />
          <circle cx={56} cy={55} r={30 + 90 * ramp(t, hit, 0.5)} fill="none" stroke={C.orange} strokeWidth={8} opacity={t >= hit ? 1 - ramp(t, hit, 0.6) : 0} />
        </svg>
      </At>
      {shot > 0 && shot < 1 && <div style={{ position: "absolute", left: lerp(1230, 1490, shot) - 9, top: lerp(410, 300, shot) - 9, width: 18, height: 18, borderRadius: 9, background: C.orange, boxShadow: `0 0 20px ${C.orange}` }} />}
      <At x={1150} y={610} at={at(37, "2005")} out={LS(38) - 0.2}>
        <Pill size={40}>Deep Impact · launched 2005</Pill>
      </At>
      {/* Earth + radio link (line 38) */}
      <At x={270} y={640} at={LS(38)} out={B}>
        <Earth />
      </At>
      {t >= LS(38) + 0.2 && t < B && [...Array(7)].map((_, i) => {
        const u = ((t * 0.45 + i / 7) % 1);
        const alive = t < silent ? 1 : Math.max(0, 1 - (t - silent) * 3);
        return <div key={i} style={{ position: "absolute", left: lerp(1040, 400, u) - 8, top: lerp(450, 610, u) - 8, width: 16, height: 16, borderRadius: 8, background: C.green, opacity: alive * (0.3 + 0.7 * Math.sin(u * Math.PI)), boxShadow: `0 0 14px ${C.green}` }} />;
      })}
      <At x={330} y={220} at={at(38, "august")} out={B}>
        <Pill color={C.green} size={44} fill>AUGUST 2013</Pill>
      </At>
      <At x={720} y={530} at={silent} out={B} rot={-4}>
        <Pill color={C.orange} size={64}>NO SIGNAL</Pill>
      </At>
      {/* craft */}
      <div style={{ position: "absolute", left: cx + gone * 500, top: cy - gone * 160, translate: "-50% -50%", scale: `${cs * pop(t, a + 0.1, 12) * (1 - gone * 0.5)}`, rotate: `${rot}deg`, opacity: 1 - gone }}>
        {t >= Cc && <div style={{ position: "absolute", left: "50%", top: "50%", width: 760, height: 70, marginTop: -35, transformOrigin: "0 50%", rotate: "160deg", background: "linear-gradient(90deg, rgba(74,222,128,.55), rgba(74,222,128,0))", clipPath: "polygon(0 40%, 100% 0, 100% 100%, 0 60%)", opacity: ramp(t, Cc + 0.3, 0.4) }} />}
        <CraftIcon size={240} color={t >= rebootAt ? C.orange : C.green} />
      </div>
      {/* NASA line (39) */}
      <At x={800} y={560} at={at(39, "never") - 0.2} out={LS(40) - 0.15}>
        <Panel w={1080} h={300}>
          <div style={{ position: "absolute", left: 44, top: 30, fontFamily: MONO, fontWeight: 800, fontSize: 32, color: C.green }}>NASA · September 2013</div>
          <div style={{ position: "absolute", left: 44, top: 90, fontFamily: SANS, fontWeight: 700, fontSize: 36, color: C.dim }}>exact cause: not known. But analysis found</div>
          <div style={{ position: "absolute", left: 44, right: 44, top: 150, fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: 50, lineHeight: 1.15, color: C.white, whiteSpace: "normal", opacity: ramp(t, at(39, "potential"), 0.3) }}>“a potential problem with computer <span style={{ color: C.orange }}>time tagging</span>”</div>
        </Panel>
      </At>
      {/* the counter (40-41) */}
      <At x={800} y={330} at={cA - 0.15} out={Cc}>
        <Txt size={38} color={C.dim}>tenths of a second since 1 January 2000</Txt>
      </At>
      <At x={800 + shake(t, cB, 18, 0.45)} y={440} at={cA - 0.1} out={Cc}>
        <Txt size={128} mono color={hitLimit ? C.orange : C.white} glow={hitLimit}>{fmt(v)}</Txt>
      </At>
      <At x={800} y={545} at={cA} out={Cc}>
        <div style={{ width: 980, height: 26, borderRadius: 13, background: "rgba(245,241,232,.1)", overflow: "hidden", border: `3px solid ${hitLimit ? C.orange : "rgba(245,241,232,.25)"}` }}>
          <div style={{ width: `${(v / 4294967296) * 100}%`, height: "100%", background: hitLimit ? C.orange : C.green }} />
        </div>
      </At>
      <At x={800 + shake(t, lockAt, 14, 0.4)} y={640} at={cA + 0.1} out={Cc}>
        <Txt size={84} mono color={t >= lockAt ? C.orange : C.green}>{d.day}<span style={{ fontSize: 52, color: C.dim }}> · {d.time} UTC</span></Txt>
      </At>
      {/* timeline (42) */}
      {[["8 Aug", "last contact", C.white, LS(42) - 0.1], ["11 Aug", "counter hits the limit", C.orange, LS(42) + 0.25], ["11 – 14 Aug", "contact lost", C.orange, at(42, "contact")]].map(([d1, d2, col, when], i) => (
        <At key={i} x={380 + i * 430} y={790} at={when as number} out={Cc}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 26, height: 26, borderRadius: 13, background: col as string, boxShadow: `0 0 20px ${col}` }} />
            <Txt size={44} mono color={col as string}>{d1 as string}</Txt>
            <Txt size={32} color={C.dim}>{d2 as string}</Txt>
          </div>
        </At>
      ))}
      {/* phase C: reboot loop, tumbling, lost */}
      <At x={300} y={690} at={Cc + 0.2} out={LS(44) + 1.2}>
        <Earth r={110} />
      </At>
      <At x={1000} y={170} at={rebootAt} out={LS(44)}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 80, color: C.orange, rotate: `${(t - rebootAt) * 420}deg`, lineHeight: 1 }}>↻</div>
          <Txt size={52} mono color={C.orange}>reboot #{reboots}</Txt>
        </div>
      </At>
      <At x={1480} y={640} at={at(43, "antennas")} out={LS(44)}>
        <Pill color={C.orange} size={44}>antenna off Earth</Pill>
      </At>
      <At x={960} y={760} at={at(44, "mission")}>
        <Pill color={C.white} size={56}>mission ended · September 2013</Pill>
      </At>
    </Sc>
  );
};

// ============ 5. THE SHARE PRICE ============
const CEIL = 429496.7295;
const priceAt = (u: number) => 300000 + 121000 * u + 9000 * Math.sin(u * 19) * (1 - u) + 5000 * Math.sin(u * 47) * (1 - u * 0.8);
export const Share: React.FC = () => {
  const t = useT();
  const a = chStart(5), b = chEnd(5);
  const PW = 860, PH = 430, lo = 290000, hi = 445000;
  const prog = ramp(t, LS(46) - 0.2, at(46, "420,000") + 0.3 - LS(46), lin);
  const creep = ramp(t, LS(48), at(49, "stopped") - LS(48), lin);
  const price = (u: number) => (u <= 1 ? priceAt(u) : lerp(421000, 429200, u - 1));
  const U = prog + creep;
  const N = 90;
  const xy = (u: number) => [(u / 2) * PW, PH - ((price(u) - lo) / (hi - lo)) * PH];
  const pts = [...Array(N + 1)].map((_, i) => (i / N) * U).map((u) => xy(u).join(",")).join(" ");
  const [hx, hy] = xy(U);
  const cur = price(U);
  const ceilY = PH - ((CEIL - lo) / (hi - lo)) * PH;
  const ceilK = ramp(t, at(48, "429,496") - 0.1, 0.5);
  const paused = t >= at(49, "stopped");
  const upg = pop(t, at(49, "upgraded"), 10);
  const f = Math.floor(t * 30);
  const stored = Math.round(cur * 10000);
  return (
    <Sc a={a} b={b}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 128, height: 54, overflow: "hidden", opacity: 0.55 * ramp(t, a, 0.4) }}>
        <div style={{ position: "absolute", whiteSpace: "nowrap", fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.green, translate: `${-((t * 120) % 225.6)}px 0px` }}>
          {[...Array(12)].map((_, i) => <span key={i} style={{ marginRight: 60 }}>BRK.A <span style={{ color: i % 3 === 2 ? C.orange : C.green }}>▲</span></span>)}
        </div>
      </div>
      <At x={560} y={540} at={a + 0.1}>
        <Panel w={960} h={640}>
          <div style={{ position: "absolute", left: 44, top: 26, fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.dim }}>one Class A share · May 2021 <span style={{ fontSize: 24 }}>(illustrative chart)</span></div>
          <div style={{ position: "absolute", left: 44, top: 66, fontFamily: MONO, fontWeight: 800, fontSize: 84, color: paused ? C.orange : C.white, opacity: paused && upg < 0.5 && f % 16 > 10 ? 0.4 : 1 }}>{paused && upg < 0.5 ? "$ ––––––" : `$${fmt(cur)}`}</div>
          <svg width={PW} height={PH} style={{ position: "absolute", left: 50, top: 180, overflow: "visible" }}>
            {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={0} x2={PW} y1={PH * g} y2={PH * g} stroke="rgba(245,241,232,.08)" strokeWidth={3} />)}
            <polyline points={pts} fill="none" stroke={C.green} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${C.green})` }} />
            <circle cx={hx} cy={hy} r={12 + 3 * Math.sin(t * 8)} fill={C.white} />
            <line x1={0} x2={PW * ceilK} y1={ceilY} y2={ceilY} stroke={C.orange} strokeWidth={6} strokeDasharray="18 12" />
            {ceilK > 0.9 && <text x={8} y={ceilY - 14} fontFamily={MONO} fontWeight={800} fontSize={30} fill={C.orange}>32-bit ceiling</text>}
          </svg>
        </Panel>
      </At>
      {/* how the price is stored (47) */}
      <At x={1460} y={270} at={at(47, "stored") - 0.1} out={LS(49) - 0.15}>
        <Txt size={38} color={C.dim}>the price feed stores</Txt>
        <Txt size={64} mono>${fmt(Math.floor(cur))}<span style={{ color: C.orange, opacity: ramp(t, at(47, "four"), 0.2) }}>.0000</span></Txt>
      </At>
      <At x={1460} y={420} at={at(47, "32-bit")} out={LS(49) - 0.15}>
        <Txt size={34} color={C.dim}>as one 32-bit number</Txt>
        <Txt size={64} mono color={C.green}>{fmt(stored)}</Txt>
      </At>
      {t >= at(47, "32-bit") && t < LS(49) && (
        <div style={{ opacity: ramp(t, at(47, "32-bit"), 0.3) * (1 - ramp(t, LS(49) - 0.3, 0.25)) }}>
          <BitRow bits={toBits(stored)} x={1460 - bitRowW(32, 22, 3) / 2} y={505} cell={22} gap={3} dimZero />
        </div>
      )}
      <At x={1460} y={680} at={at(48, "429,496")} out={LS(49) - 0.15}>
        <Txt size={34} color={C.dim}>highest price that fits</Txt>
        <Txt size={92} mono color={C.orange} glow>$429,496.7295</Txt>
      </At>
      {/* 49 */}
      <At x={1460} y={420} at={at(49, "stopped")} style={{ opacity: upg > 0.5 ? 0.35 : 1 }}>
        <Pill color={C.orange} size={56}>price feed paused</Pill>
      </At>
      <At x={1460} y={600} at={at(49, "upgraded")}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Check k={upg} size={90} />
          <Txt size={60} color={C.green}>software upgraded</Txt>
        </div>
      </At>
    </Sc>
  );
};

// ============ 6. 19 JANUARY 2038 ============
const NOW = 1794700800; // 15 Nov 2026 00:00 UTC
export const Y2038a: React.FC = () => {
  const t = useT();
  const a = chStart(6), b = LS(58) - 0.2;
  const slam = at(50, "big");
  const toTag = ramp(t, LS(51) - 0.25, 0.5, INOUT);
  const raceA = at(54, "that"), raceB = at(54, "19th");
  const flipAt = at(55, "flips"), fixAt = at(57, "64");
  const race = ramp(t, raceA, raceB - raceA, INOUT);
  let v: number;
  if (t < raceA) v = NOW + Math.floor(t - LS(51));
  else if (t < flipAt) v = Math.round(lerp(NOW + Math.floor(raceA - LS(51)), INT_MAX, race));
  else if (t < fixAt) v = -INT_MAX - 1 + Math.floor(t - flipAt);
  else v = INT_MAX + 1 + Math.floor(t - fixAt);
  const neg = t >= flipAt && t < fixAt, fixed = t >= fixAt;
  const d = dateOf(v * 1000);
  const sh = shake(t, flipAt, 24, 0.55);
  const clockOut = ramp(t, LS(54) - 0.3, 0.3);
  const cardK = pop(t, LS(54) - 0.1, 12);
  const rw = bitRowW(32, 28, 4);
  const col = neg ? C.orange : fixed ? C.green : C.white;
  const lowBits = fixed ? toBits(v - 4294967296 * Math.floor(v / 4294967296)) : toBits(v);
  return (
    <Sc a={a} b={b}>
      <div style={{ position: "absolute", left: lerp(960, 200, toTag), top: lerp(470, 190, toTag), translate: "-50% -50%", scale: `${lerp(lerp(2.6, 1, ramp(t, slam, 0.18)), 0.3, toTag)}`, opacity: ramp(t, slam, 0.1), fontFamily: MONO, fontWeight: 800, fontSize: 330, color: C.orange, textShadow: "0 0 80px rgba(251,146,60,.6)", lineHeight: 1 }}>2038</div>
      {/* clock (51-53) */}
      <At x={380} y={540} at={LS(51)} style={{ opacity: 1 - clockOut }}>
        <ClockIcon size={380} t={t - LS(51)} />
      </At>
      {/* date card (54-57) */}
      <At x={360 + sh} y={540} k={cardK}>
        <Panel w={580} h={380} color={neg ? C.orange : fixed ? C.green : C.line} glow={neg || fixed ? 0.3 : 0}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 78, borderRadius: "26px 26px 0 0", background: neg ? C.orange : C.green, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 32, color: C.navy, letterSpacing: 2 }}>THE COMPUTER THINKS IT'S</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 112, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 74, color: col }}>{d.day}</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 236, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 64, color: neg ? C.orange : C.dim }}>{d.time} <span style={{ fontSize: 40 }}>UTC</span></div>
        </Panel>
      </At>
      {/* counter + bits */}
      <At x={1260} y={250} at={at(52, "unix")}>
        <Pill color={C.green} size={44} fill>UNIX TIME</Pill>
      </At>
      <At x={1260} y={345} at={at(51, "seconds") - 0.1}>
        <Txt size={38} color={C.dim}>seconds since 1 January 1970</Txt>
      </At>
      <At x={1260 + sh} y={450} at={at(51, "seconds")}>
        <Txt size={108} mono color={col} glow={neg}>{fmt(v)}</Txt>
      </At>
      {t >= at(52, "32-bit") - 0.1 && (
        <div style={{ translate: `${sh}px 0px` }}>
          {fixed && <BitRow bits={"0".repeat(32)} x={1260 - rw / 2} y={545} cell={28} gap={4} sign={0} appear={(i) => pop(t, fixAt + i * 0.012, 13)} />}
          <BitRow bits={lowBits} x={1260 - rw / 2} y={fixed ? 590 : 560} cell={28} gap={4} sign={fixed ? 0 : 1} appear={(i) => pop(t, at(52, "32-bit") + i * 0.014, 13)} />
        </div>
      )}
      <At x={1260} y={fixed ? 700 : 680} at={at(52, "32-bit") + 0.5}>
        <Txt size={34} mono color={fixed ? C.green : C.dim}>{fixed ? "64 bits" : "signed 32-bit"}</Txt>
      </At>
      <At x={1260} y={780} at={at(53, "limit")} out={at(56, "year") - 0.15}>
        <Pill color={C.orange} size={48}>limit: {fmt(INT_MAX)}</Pill>
      </At>
      <At x={1260} y={790} at={fixAt + 0.4}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Check k={pop(t, fixAt + 0.4, 10)} size={64} />
          <Txt size={48} color={C.green}>time keeps counting</Txt>
        </div>
      </At>
      <Stamp x={960} y={810} at={at(56, "year")} size={76} out={LS(57) - 0.15}>THE YEAR 2038 PROBLEM</Stamp>
    </Sc>
  );
};

export const Y2038b: React.FC = () => {
  const t = useT();
  const a = LS(58) - 0.2, b = chEnd(6);
  const o59 = LS(59) - 0.15, o60 = LS(60) - 0.15, o61 = LS(61) - 0.15;
  const bar = ramp(t, at(58, "292"), 0.9);
  const used = (NOW / INT_MAX) * 100;
  const risk: [string, number][] = [["older devices", at(60, "older")], ["embedded systems", at(60, "embedded")], ["built to run for decades", at(60, "machines")]];
  return (
    <Sc a={a} b={b}>
      {/* 58 */}
      <At x={960} y={300} at={at(58, "292")} out={o59}>
        <Txt size={150} mono color={C.green} glow>292 billion years</Txt>
      </At>
      <At x={960} y={520} at={at(58, "292") + 0.1} out={o59}>
        <div style={{ width: 1500 }}>
          <Txt size={34} color={C.dim} style={{ textAlign: "left", marginBottom: 8 }}>a 64-bit clock, counting seconds</Txt>
          <div style={{ width: 1500 * bar, height: 50, borderRadius: 14, background: C.green, boxShadow: "0 0 40px rgba(74,222,128,.4)" }} />
        </div>
      </At>
      <At x={960} y={680} at={at(58, "billion")} out={o59}>
        <div style={{ width: 1500 }}>
          <Txt size={34} color={C.dim} style={{ textAlign: "left", marginBottom: 8 }}>the age of the universe: 13.8 billion years</Txt>
          <div style={{ width: (1500 * 13.8) / 292, height: 50, borderRadius: 14, background: C.orange }} />
        </div>
      </At>
      {/* 59 */}
      <At x={620} y={430} at={at(59, "phones")} out={o60}>
        <div style={{ position: "relative" }}><PhoneIcon size={340} /><div style={{ position: "absolute", right: -40, bottom: -10 }}><Check k={pop(t, at(59, "phones") + 0.25, 10)} size={90} /></div></div>
      </At>
      <At x={1280} y={430} at={at(59, "laptops")} out={o60}>
        <div style={{ position: "relative" }}><LaptopIcon size={320} /><div style={{ position: "absolute", right: -30, bottom: -10 }}><Check k={pop(t, at(59, "laptops") + 0.25, 10)} size={90} /></div></div>
      </At>
      <At x={960} y={760} at={at(59, "already")} out={o60}>
        <Pill color={C.green} size={52}>already on 64-bit time</Pill>
      </At>
      {/* 60 */}
      {risk.map(([name, when], i) => (
        <At key={i} x={420 + i * 540} y={400} at={when} out={o61}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
            <div style={{ rotate: `${Math.sin(t * 2 + i) * 3}deg` }}><ChipIcon size={230} color={C.orange} /></div>
            <Txt size={42}>{name}</Txt>
          </div>
        </At>
      ))}
      <At x={960} y={760} at={at(60, "hard")} out={o61}>
        <Pill color={C.orange} size={60}>hard to update</Pill>
      </At>
      {/* 61 */}
      <At x={960} y={300} at={at(61, "eleven")}>
        <Txt size={170} mono color={C.green} glow>≈ 11 years</Txt>
      </At>
      <At x={960} y={540} at={LS(61)}>
        <div style={{ width: 1500 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontWeight: 800, fontSize: 36, color: C.dim, marginBottom: 10 }}><span>1970</span><span style={{ color: C.orange }}>19 Jan 2038</span></div>
          <div style={{ height: 56, borderRadius: 16, background: "rgba(245,241,232,.1)", border: "4px solid rgba(245,241,232,.3)", overflow: "hidden" }}>
            <div style={{ width: `${used * ramp(t, LS(61), 1.2)}%`, height: "100%", background: C.orange }} />
          </div>
        </div>
      </At>
      <At x={960} y={700} at={at(61, "years")}>
        <Txt size={48}>{used.toFixed(1)}% of the 32-bit clock is already used <span style={{ color: C.dim }}>(November 2026)</span></Txt>
      </At>
    </Sc>
  );
};

// ============ 7. THE PATTERN ============
export const Close: React.FC = () => {
  const t = useT();
  const a = chStart(7);
  const o63 = LS(63) - 0.15, o64 = LS(64) - 0.15, o65 = LS(65) - 0.15, o66 = LS(66) - 0.15;
  const cards = [
    { icon: <PlayIcon size={110} />, title: "view counter", sub: "2014" },
    { icon: <PlaneIcon size={62} />, title: "jet generators", sub: "2015" },
    { icon: <CraftIcon size={110} />, title: "spacecraft", sub: "2013" },
    { icon: <ChartIcon size={104} />, title: "share price", sub: "2021" },
    { icon: <ClockIcon size={104} t={t} />, title: "the clocks", sub: "2038" },
  ];
  const sizes = ["8-bit", "16-bit", "32-bit", "64-bit"];
  const pick = at(63, "size");
  const grow = ramp(t, at(65, "world"), at(65, "it") + 0.25 - at(65, "world"), (x) => x * x);
  const hitAt = at(65, "it") + 0.25;
  const cnA = at(66, "eventually"), cnB = at(66, "does");
  const flipAt = LE(66) + 0.55;
  const count = Math.round(INT_MAX * ramp(t, cnA, cnB - cnA, (x) => 1 - Math.pow(1 - x, 3)));
  const flipped = t >= flipAt;
  return (
    <Sc a={a} b={T.END + 1} exit={false}>
      {cards.map((c, i) => (
        <At key={i} x={960 + (i - 2) * 350} y={470} at={a + 0.15 + i * 0.22} out={o63}>
          <StoryCard {...c} w={320} h={300} />
        </At>
      ))}
      {/* 63 */}
      {sizes.map((s, i) => {
        const sel = i === 2 && t >= pick;
        return (
          <At key={s} x={420 + i * 360} y={330} at={at(63, "picked") + i * 0.07} out={o64}>
            <Pill color={sel ? C.green : C.white} size={58} fill={sel} style={{ scale: `${sel ? 1 + 0.2 * (1 - Math.min(1, pop(t, pick, 9))) + 0.08 : 1}` }}>{s}</Pill>
          </At>
        );
      })}
      <At x={960} y={590} at={at(63, "impossibly")} out={o64}>
        <Txt size={40} color={C.dim}>room for</Txt>
        <Txt size={140} mono color={C.green} glow>{fmt(INT_MAX)}</Txt>
      </At>
      {/* 64 */}
      {[["2 billion views", at(64, "two")], ["8 months without a reboot", at(64, "eight")], ["a $400,000 share", at(64, "share")]].map(([s, when], i) => (
        <At key={i} x={960} y={280 + i * 190} at={when as number} out={o65} rot={[-2, 1.5, -1][i]}>
          <Pill color={[C.green, C.white, C.orange][i]} size={76}>{s as string}</Pill>
        </At>
      ))}
      {/* 65 */}
      <At x={960} y={470} at={LS(65)} out={o66}>
        <div style={{ width: 1500, position: "relative" }}>
          <div style={{ position: "absolute", right: -6, top: -120, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <Txt size={52} mono color={C.orange}>{fmt(INT_MAX)}</Txt>
            <Txt size={30} color={C.dim}>the limit never moved</Txt>
          </div>
          <div style={{ position: "absolute", right: 0, top: -20, width: 8, height: 130, background: C.orange, borderRadius: 4, boxShadow: `0 0 30px ${C.orange}` }} />
          <div style={{ height: 90, borderRadius: 22, background: "rgba(245,241,232,.08)", border: "4px solid rgba(245,241,232,.25)", overflow: "hidden" }}>
            <div style={{ width: `${lerp(6, 100, grow)}%`, height: "100%", background: t >= hitAt ? C.orange : C.green, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 24, fontFamily: SANS, fontWeight: 900, fontSize: 44, color: C.navy, whiteSpace: "nowrap", boxSizing: "border-box" }}>{grow > 0.12 ? "the world" : ""}</div>
          </div>
        </div>
      </At>
      {/* 66 */}
      <At x={960} y={250} at={at(66, "we'll")} rot={-2}>
        <Pill color={C.orange} size={70}>“we'll never count that high”</Pill>
      </At>
      <At x={960 + shake(t, flipAt, 24, 0.5)} y={500} at={cnA}>
        <Txt size={170} mono color={flipped ? C.orange : C.green} glow>{flipped ? fmt(-INT_MAX - 1) : fmt(count)}</Txt>
      </At>
      <At x={960} y={740} at={LE(66) + 0.2}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 84, color: C.green, letterSpacing: 6, textShadow: "0 0 50px rgba(74,222,128,.5)" }}>bit by bit</div>
          <Txt size={36} color={C.dim}>understand technology, one bit at a time</Txt>
        </div>
      </At>
    </Sc>
  );
};
