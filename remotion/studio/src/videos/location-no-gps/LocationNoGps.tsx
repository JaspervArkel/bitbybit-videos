/*
 * STORYBOARD — "Your phone finds you without GPS" (pillar F; ending: implication; posts 01:00+1, E7)
 * One world: a top-down night city map (street grid, blocks, a park in the lower right, ~200 Wi-Fi routers).
 * A camera moves over the same map: from inside a phone screen (hook) → the street → the whole city database →
 * the scan and lookup → the estimate circle → the cell tower → a building with the dot inside.
 * Wi-Fi IDs shown are example BSSIDs (MAC-address format); no real network.
 * L0  "Turn off GPS, and your phone can still find you."  HOOK (frame 0 complete): "GPS off." + "still found" (orange mono)
 *      + a phone showing the map, a "GPS OFF" toggle with a crossed satellite, and a pulsing location dot (moves from frame 0).
 *      Toggle shakes on "off"; dot pops + pin bounces on "find".
 * L1  "Every Wi-Fi router broadcasts a unique ID,"  headline out; the phone frame dissolves, the map fills the stage.
 *      The hero router pops on "router"; its waves start on "broadcasts"; ID tag "a4:2b:8c:19:fe:07" on "ID".
 * L2  "even if you never connect."   all other routers pop + broadcast (stagger) on "even"; "Wi-Fi: not connected" chip
 *      at the dot on "never"; waves still wash over the dot.
 * L3  "Google and Apple have built huge maps"   camera pulls back over the city; "Google" / "Apple" text chips on their
 *      words; every router gets a green pin on "maps" ("Wi-Fi ID map" tag).
 * L4  "of where those IDs are."      camera back in; LOOKUP card (ID → pin) slides up on "IDs" with three rows.
 * L5  "Your phone scans nearby networks,"  radar ring sweeps out from the dot on "scans"; the 3 nearby routers glow on "networks".
 * L6  "looks them up,"               card rows highlight one by one on "looks", ✓ + matching pins flash on "up".
 * L7  "and estimates your position," card leaves; lines from the 3 routers to the dot; big estimate circle on "estimates";
 *      crosshair on "position".
 * L8  "often within tens of metres in a city."  circle shrinks tight; "± tens of metres" chip on "tens"; blocks glow on "city".
 * L9  "Cell towers fill in the rest, more roughly."  camera pulls back; a cell tower pops in the park on "Cell"; its rings
 *      cover the park on "fill"; a wide orange rough circle on "more roughly".
 * L10 "That's also why location works indoors,"   camera in; a building outline drops over the dot on "indoors"; the dot
 *      keeps pulsing inside, router waves still reach it.
 * L11 "where satellite signals struggle."  satellite drifts in at the top on "satellite"; dashed beams on "signals" stop
 *      at the roof with orange ✗ on "struggle". END (implication): takeaway chip "indoors: Wi-Fi ✓ · satellite ✗" holds.
 */
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, C, FPS, INOUT, Line, MONO, SANS, lerp, makeTiming, pop, ramp, shake, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import words from "./words.json";

const T = makeTiming(words as Line[], 2.2);
const { W, LS } = T;
export const LOCATION_NO_GPS_FRAMES = T.TOTAL_FRAMES;
const A = (p: string) => staticFile(`videos/location-no-gps/${p}`);
const BLUE = "#60A5FA";

// ---------- city data (world units, dot at 1000,1000) ----------
const DOT = { x: 1000, y: 1000 };
const PITCH = 170, BLOCK = 134, B0 = 1018;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
type Block = { x: number; y: number; park: boolean };
const BLOCKS: Block[] = [];
for (let i = -7; i <= 6; i++) for (let j = -7; j <= 6; j++) {
  const x = B0 + i * PITCH, y = B0 + j * PITCH;
  BLOCKS.push({ x, y, park: x > 1300 && y > 1180 });
}
type Router = { x: number; y: number; id: string; near?: boolean; hero?: boolean };
const NEAR: Router[] = [
  { x: 905, y: 905, id: "a4:2b:8c:19:fe:07", near: true, hero: true },
  { x: 1100, y: 925, id: "3c:84:6a:d2:51:9b", near: true },
  { x: 945, y: 1110, id: "f0:9e:21:7c:0a:e4", near: true },
];
const ROUTERS: Router[] = [...NEAR];
BLOCKS.forEach((b, i) => {
  if (b.park) return;
  const n = rnd(i) > 0.45 ? 2 : 1;
  for (let k = 0; k < n; k++) {
    const x = b.x + 22 + rnd(i * 3 + k) * (BLOCK - 44), y = b.y + 22 + rnd(i * 7 + k + 1) * (BLOCK - 44);
    if (Math.hypot(x - DOT.x, y - DOT.y) < 230) continue;
    ROUTERS.push({ x, y, id: "" });
  }
});
const TOWER = { x: 1560, y: 1420 };
const dist = (r: Router) => Math.hypot(r.x - DOT.x, r.y - DOT.y);

// ---------- camera ----------
type Cam = { s: number; fx: number; fy: number; ay: number };
const camAt = (t: number): Cam => {
  const K: [number, number, Cam][] = [
    // [start, duration, target]
    [-1, 0, { s: 1.25, fx: 1000, fy: 1000, ay: 900 }],
    [LS(1) - 0.15, 0.7, { s: 1.0, fx: 1000, fy: 1000, ay: 880 }],
    [W(3, 0) - 0.1, 1.5, { s: 0.5, fx: 1000, fy: 1000, ay: 900 }],
    [LS(4) - 0.1, 0.7, { s: 0.95, fx: 1000, fy: 1000, ay: 720 }],
    [LS(7) - 0.1, 0.6, { s: 1.1, fx: 1000, fy: 1000, ay: 880 }],
    [LS(9) - 0.1, 0.8, { s: 0.5, fx: 1230, fy: 1180, ay: 880 }],
    [LS(10) - 0.1, 0.8, { s: 1.25, fx: 1000, fy: 990, ay: 960 }],
  ];
  let c = K[0][2];
  for (let i = 1; i < K.length; i++) {
    const [a, d, tg] = K[i];
    const k = ramp(t, a, d, INOUT);
    if (k <= 0) break;
    c = { s: lerp(c.s, tg.s, k), fx: lerp(c.fx, tg.fx, k), fy: lerp(c.fy, tg.fy, k), ay: lerp(c.ay, tg.ay, k) };
  }
  return c;
};
const toScreen = (c: Cam, x: number, y: number) => ({ x: 540 + (x - c.fx) * c.s, y: c.ay + (y - c.fy) * c.s });

// ---------- small pieces ----------
const RouterIcon: React.FC<{ size: number; color: string; glow?: number }> = ({ size, color, glow = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ overflow: "visible", filter: glow ? `drop-shadow(0 0 ${10 * glow}px ${color})` : undefined }}>
    <rect x={4} y={20} width={32} height={14} rx={5} fill="#0A1226" stroke={color} strokeWidth={3.5} />
    <path d="M12 20 L9 6 M28 20 L31 6" stroke={color} strokeWidth={3.5} strokeLinecap="round" />
    <rect x={10} y={25.5} width={20} height={3} rx={1.5} fill={color} />
  </svg>
);
const Pin: React.FC<{ size: number; color?: string }> = ({ size, color = C.green }) => (
  <div style={{ width: size, height: size, borderRadius: "50% 50% 50% 0", background: color, rotate: "-45deg", boxShadow: `0 0 ${size * 0.6}px ${color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: size * 0.38, height: size * 0.38, borderRadius: "50%", background: C.navyDeep }} />
  </div>
);
const Tag: React.FC<{ children: React.ReactNode; color?: string; k: number; size?: number; style?: React.CSSProperties }> = ({ children, color = C.green, k, size = 44, style }) =>
  k <= 0.01 ? null : (
    <div style={{ position: "absolute", fontFamily: MONO, fontWeight: 800, fontSize: size, color, background: "rgba(10,18,38,.94)", border: `4px solid ${color}`, borderRadius: size * 0.4, padding: `${size * 0.12}px ${size * 0.4}px`, whiteSpace: "nowrap", boxShadow: `0 0 40px ${color}55`, opacity: Math.min(1, k * 1.5), scale: `${lerp(0.5, 1, k)}`, ...style }}>{children}</div>
  );

// ---------- the map world ----------
const MapWorld: React.FC = () => {
  const t = useT();
  const c = camAt(t);
  const heroIn = pop(t, W(1, 2), 11);
  const wavesHero = t >= W(1, 3);
  const allIn = (r: Router, i: number) => (r.hero ? heroIn : pop(t, W(2, 0) + (dist(r) / 1400) * 0.9 + (i % 5) * 0.02, 12));
  const pins = ramp(t, W(3, 6) - 0.05, 0.35) * (1 - ramp(t, LS(5), 0.4));
  const nearLit = pop(t, W(5, 4), 10) * (1 - ramp(t, LS(9), 0.4));
  const upFlash = pop(t, W(6, 2), 9, 220) * (1 - ramp(t, LS(7), 0.4));
  const est = ramp(t, W(7, 1), 0.5);
  const lines = ramp(t, LS(7), 0.4) * (1 - ramp(t, LS(9), 0.4));
  const tight = ramp(t, W(8, 2) - 0.1, 0.7, INOUT);
  const cityGlow = pop(t, W(8, 7), 12) * (1 - ramp(t, LS(9), 0.4));
  const estR = lerp(lerp(330, 300, est), 62, tight);
  const tower = pop(t, W(9, 0), 11);
  const fill = ramp(t, W(9, 2), 0.8);
  const rough = ramp(t, W(9, 6), 0.6);
  const roughOut = ramp(t, LS(10), 0.5);
  const house = pop(t, W(10, 5), 12, 200);
  const dotPop = pop(t, W(0, 8), 9, 220);
  const lit = (r: Router) => !!r.near && nearLit > 0.05;
  const open = ramp(t, LS(1) - 0.15, 0.7, INOUT);

  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: 450, height: 890, overflow: "hidden", borderRadius: 36, clipPath: `inset(${50 * (1 - open)}px ${295 * (1 - open)}px ${40 * (1 - open)}px ${295 * (1 - open)}px round ${lerp(52, 36, open)}px)` }}>
      <div style={{ position: "absolute", left: 540 - 30 - c.fx * c.s, top: c.ay - 450 - c.fy * c.s, width: 2400, height: 2400, scale: `${c.s}`, transformOrigin: "0 0" }}>
        {/* ground + blocks */}
        <div style={{ position: "absolute", left: -400, top: -400, width: 3200, height: 3200, background: "#0B1430" }} />
        {BLOCKS.map((b, i) => (
          <div key={i} style={{ position: "absolute", left: b.x, top: b.y, width: BLOCK, height: BLOCK, borderRadius: 16,
            background: b.park ? "rgba(74,222,128,.12)" : `rgba(36,52,92,${0.75 + cityGlow * 0.15})`,
            border: b.park ? "3px dashed rgba(74,222,128,.28)" : `2px solid rgba(245,241,232,${0.08 + cityGlow * 0.25})` }} />
        ))}
        {/* cell tower coverage */}
        {tower > 0.01 && (
          <>
            {[0, 1, 2].map((i) => {
              const q = ((t - W(9, 0)) / 1.6 + i / 3) % 1;
              return <div key={i} style={{ position: "absolute", left: TOWER.x, top: TOWER.y, width: 2, height: 2 }}>
                <div style={{ position: "absolute", left: -520 * q, top: -520 * q, width: 1040 * q, height: 1040 * q, borderRadius: "50%", border: `6px solid rgba(251,146,60,${0.55 * (1 - q) * Math.min(1, tower)})` }} />
              </div>;
            })}
            <div style={{ position: "absolute", left: 1290, top: 1180, width: 720, height: 720, borderRadius: 40, background: `rgba(251,146,60,${0.12 * fill})` }} />
          </>
        )}
        {/* rough cell estimate */}
        {rough > 0.01 && (
          <div style={{ position: "absolute", left: DOT.x + 40 - 560, top: DOT.y + 30 - 560, width: 1120, height: 1120, borderRadius: "50%", background: `rgba(251,146,60,${0.13 * rough * (1 - roughOut)})`, border: `8px dashed rgba(251,146,60,${0.8 * rough * (1 - roughOut)})`, scale: `${lerp(0.6, 1, rough)}` }} />
        )}
        {/* router waves + icons */}
        {ROUTERS.map((r, i) => {
          const k = allIn(r, i);
          if (k <= 0.01) return null;
          const broadcasting = r.hero ? wavesHero : k > 0.5;
          const sz = r.near ? 50 : 34;
          const col = lit(r) || (r.hero && t < LS(3)) ? C.green : "rgba(245,241,232,.75)";
          const wv = r.near ? 2 : 1;
          return (
            <div key={i} style={{ position: "absolute", left: r.x, top: r.y, width: 0, height: 0 }}>
              {broadcasting && [...Array(wv)].map((_, j) => {
                const q = ((t + rnd(i) * 1.6) / 1.6 + j / wv) % 1;
                const R = (r.near ? 230 : 110) * q;
                return <div key={j} style={{ position: "absolute", left: -R, top: -R, width: 2 * R, height: 2 * R, borderRadius: "50%", border: `${r.near ? 5 : 3}px solid ${r.near ? "rgba(74,222,128," : "rgba(245,241,232,"}${(r.near ? 0.6 : 0.25) * (1 - q)})` }} />;
              })}
              <div style={{ position: "absolute", left: -sz / 2, top: -sz / 2, scale: `${lerp(0.3, 1, k) * (1 + 0.35 * upFlash * (r.near ? 1 : 0))}` }}>
                <RouterIcon size={sz} color={col} glow={lit(r) ? 1 : 0} />
              </div>
              {pins > 0.01 && (
                <div style={{ position: "absolute", left: -15, top: -62, opacity: pins, scale: `${lerp(0.4, 1, pins)}` }}><Pin size={30} /></div>
              )}
            </div>
          );
        })}
        {/* lines from nearby routers to the dot */}
        {lines > 0.01 && (
          <svg width={2400} height={2400} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            {NEAR.map((r, i) => (
              <line key={i} x1={r.x} y1={r.y} x2={lerp(r.x, DOT.x, lines)} y2={lerp(r.y, DOT.y, lines)} stroke={C.green} strokeWidth={6} strokeDasharray="14 12" strokeDashoffset={-t * 60} strokeLinecap="round" opacity={0.9} />
            ))}
          </svg>
        )}
        {/* estimate circle */}
        {est > 0.01 && (
          <div style={{ position: "absolute", left: DOT.x - estR, top: DOT.y - estR, width: 2 * estR, height: 2 * estR, borderRadius: "50%", background: `rgba(96,165,250,${0.18 * est})`, border: `5px solid rgba(96,165,250,${0.9 * est})` }} />
        )}
        {/* building over the dot (indoors) */}
        {house > 0.01 && (
          <div style={{ position: "absolute", left: DOT.x - 150, top: DOT.y - 190 - (1 - house) * 160, width: 300, height: 320, opacity: Math.min(1, house * 1.5) }}>
            <svg width={300} height={320} viewBox="0 0 300 320" style={{ overflow: "visible" }}>
              <path d="M20 130 L150 30 L280 130" fill="none" stroke={C.white} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" />
              <rect x={45} y={125} width={210} height={180} rx={14} fill="rgba(245,241,232,.06)" stroke={C.white} strokeWidth={10} />
            </svg>
          </div>
        )}
        {/* the location dot */}
        <div style={{ position: "absolute", left: DOT.x, top: DOT.y, width: 0, height: 0 }}>
          {[0, 1].map((j) => {
            const q = ((t / 1.3) + j / 2) % 1;
            const R = 30 + 70 * q;
            return <div key={j} style={{ position: "absolute", left: -R, top: -R, width: 2 * R, height: 2 * R, borderRadius: "50%", border: `5px solid rgba(96,165,250,${0.7 * (1 - q)})` }} />;
          })}
          <div style={{ position: "absolute", left: -24, top: -24, width: 48, height: 48, borderRadius: "50%", background: BLUE, border: "7px solid #fff", boxShadow: "0 0 30px rgba(96,165,250,.9)", scale: `${1 + 0.4 * dotPop * (1 - ramp(t, W(0, 8) + 0.25, 0.3))}` }} />
          {est > 0.01 && t < LS(9) && (
            <svg width={200} height={200} viewBox="-100 -100 200 200" style={{ position: "absolute", left: -100, top: -100, overflow: "visible", opacity: pop(t, W(7, 3), 12), rotate: `${(1 - pop(t, W(7, 3), 12)) * 90}deg` }}>
              {[0, 90, 180, 270].map((a) => <line key={a} x1={0} y1={-44} x2={0} y2={-80} stroke={BLUE} strokeWidth={7} strokeLinecap="round" transform={`rotate(${a})`} />)}
            </svg>
          )}
        </div>
        {/* cell tower */}
        {tower > 0.01 && (
          <div style={{ position: "absolute", left: TOWER.x - 70, top: TOWER.y - 170, scale: `${lerp(0.3, 1, tower)}`, transformOrigin: "50% 100%" }}>
            <svg width={140} height={180} viewBox="0 0 140 180" style={{ overflow: "visible", filter: "drop-shadow(0 0 16px rgba(251,146,60,.8))" }}>
              <path d="M70 30 L30 175 M70 30 L110 175 M45 120 L95 120 M55 80 L85 80" stroke={C.orange} strokeWidth={9} strokeLinecap="round" fill="none" />
              <circle cx={70} cy={26} r={13} fill={C.orange} />
              <path d="M38 8 Q24 26 38 44 M102 8 Q116 26 102 44" stroke={C.orange} strokeWidth={7} fill="none" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- phone frame + GPS toggle (hook) ----------
const PH = { w: 430, h: 800, x: 325, y: 500 };
const PhoneFrame: React.FC = () => {
  const t = useT();
  const k = ramp(t, LS(1) - 0.15, 0.7, INOUT);
  if (k >= 1) return null;
  const op = 1 - k;
  return (
    <>
      {/* phone body */}
      <div style={{ position: "absolute", left: PH.x - 18, top: PH.y - 18, width: PH.w + 36, height: PH.h + 36, borderRadius: 70, border: "14px solid #2A3A63", boxShadow: "0 30px 80px rgba(0,0,0,.6), inset 0 0 0 3px rgba(245,241,232,.25)", opacity: op, scale: `${lerp(1, 1.5, k)}` }} />
      {/* GPS toggle card */}
      <div style={{ position: "absolute", left: PH.x + 30, top: PH.y + 34, width: PH.w - 60, height: 108, borderRadius: 30, background: "rgba(10,18,38,.95)", border: "3px solid rgba(245,241,232,.25)", display: "flex", alignItems: "center", padding: "0 24px", gap: 18, opacity: 1 - ramp(t, LS(1) - 0.2, 0.3), translate: `${shake(t, W(0, 1), 10, 0.4)}px 0px` }}>
        <svg width={56} height={56} viewBox="0 0 56 56">
          <rect x={20} y={20} width={16} height={16} rx={3} fill="none" stroke={C.dim} strokeWidth={4} transform="rotate(45 28 28)" />
          <path d="M8 18 L18 8 M38 48 L48 38" stroke={C.dim} strokeWidth={6} strokeLinecap="round" />
          <path d="M6 50 L50 6" stroke={C.orange} strokeWidth={6} strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 46, color: C.white, flex: 1 }}>GPS</div>
        <div style={{ width: 112, height: 60, borderRadius: 30, background: "#3A4466", position: "relative" }}>
          <div style={{ position: "absolute", left: 6, top: 6, width: 48, height: 48, borderRadius: 24, background: "#C9C3B5" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: PH.x + 30, top: PH.y + 154, width: PH.w - 60, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 36, color: C.orange, opacity: 1 - ramp(t, LS(1) - 0.2, 0.3) }}>OFF</div>
    </>
  );
};

const Hook: React.FC = () => {
  const t = useT();
  const k = 1 - ramp(t, LS(1) - 0.15, 0.3);
  if (k <= 0.001) return null;
  return (
    <div style={{ position: "absolute", top: 170, left: 0, right: 0, textAlign: "center", opacity: k }}>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 104, lineHeight: 1.02, color: C.white, letterSpacing: -2, translate: `${shake(t, W(0, 1), 8, 0.35)}px 0px` }}>GPS off.</div>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 130, lineHeight: 1.15, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)", scale: `${1 + 0.08 * pop(t, W(0, 8), 8) * (1 - ramp(t, W(0, 8) + 0.3, 0.3))}` }}>still found</div>
    </div>
  );
};

// ---------- screen-space overlays ----------
const Overlays: React.FC = () => {
  const t = useT();
  const c = camAt(t);
  const hero = toScreen(c, NEAR[0].x, NEAR[0].y);
  const dot = toScreen(c, DOT.x, DOT.y);
  const idK = pop(t, W(1, 6), 11) * (1 - ramp(t, LS(3), 0.3));
  const notConn = pop(t, W(2, 3), 11) * (1 - ramp(t, LS(3), 0.3));
  const goog = pop(t, W(3, 0), 11) * (1 - ramp(t, LS(4) - 0.1, 0.3));
  const appl = pop(t, W(3, 2), 11) * (1 - ramp(t, LS(4) - 0.1, 0.3));
  const mapTag = pop(t, W(3, 6), 11) * (1 - ramp(t, LS(4) - 0.1, 0.3));
  const card = pop(t, W(4, 3), 13) * (1 - ramp(t, LS(7) - 0.1, 0.35));
  const looks = t >= W(6, 0) ? Math.min(3, Math.floor((t - W(6, 0)) / 0.18) + 1) : 0;
  const ok = pop(t, W(6, 2), 10);
  const scanQ = t >= W(5, 2) && t < LS(6) ? ((t - W(5, 2)) / 0.75) % 1 : -1;
  const seen = pop(t, W(5, 4), 11) * (1 - ramp(t, LS(7), 0.3));
  const tens = pop(t, W(8, 2), 11) * (1 - ramp(t, LS(9) - 0.1, 0.3));
  const rough = pop(t, W(9, 6), 11) * (1 - ramp(t, LS(10) - 0.1, 0.3));
  const wifiChip = pop(t, W(9, 0), 11) * (1 - ramp(t, LS(10) - 0.1, 0.3));
  const indoors = pop(t, W(10, 5) + 0.2, 11) * (1 - ramp(t, LS(11) - 0.1, 0.3));
  const sat = pop(t, W(11, 1), 12);
  const beams = ramp(t, W(11, 2), 0.5);
  const blocked = pop(t, W(11, 3), 9, 220);
  const take = pop(t, W(11, 3) + 0.7, 12);
  const roof = toScreen(c, DOT.x, DOT.y - 160);
  const satP = { x: 820 + Math.sin(t * 1.2) * 10, y: 560 };
  const R = 300 * c.s * Math.max(0, scanQ);

  return (
    <>
      <Tag k={idK} style={{ left: hero.x, top: hero.y - 120, translate: "-50% 0" }} size={42}>ID a4:2b:8c:19:fe:07</Tag>
      <Tag k={notConn} color={C.orange} style={{ left: dot.x, top: dot.y + 70, translate: "-50% 0" }} size={42}>Wi-Fi: not connected ✗</Tag>
      <div style={{ position: "absolute", left: 0, right: 0, top: 490, display: "flex", justifyContent: "center", gap: 28 }}>
        {[["Google", goog], ["Apple", appl]].map(([s, k]) => (k as number) > 0.01 && (
          <div key={s as string} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64, color: C.navy, background: C.white, borderRadius: 24, padding: "8px 34px", opacity: Math.min(1, (k as number) * 1.5), scale: `${lerp(0.4, 1, k as number)}` }}>{s as string}</div>
        ))}
      </div>
      <Tag k={mapTag} style={{ left: 540, top: 1215, translate: "-50% 0" }} size={50}>map: Wi-Fi ID → place</Tag>
      {/* scan radar */}
      {scanQ >= 0 && (
        <div style={{ position: "absolute", left: dot.x - R, top: dot.y - R, width: 2 * R, height: 2 * R, borderRadius: "50%", border: `8px solid rgba(74,222,128,${0.9 * (1 - scanQ)})`, background: `rgba(74,222,128,${0.1 * (1 - scanQ)})` }} />
      )}
      <Tag k={seen} style={{ left: dot.x, top: 480, translate: "-50% 0" }} size={42}>3 networks seen</Tag>
      {/* lookup card */}
      {card > 0.01 && (
        <div style={{ position: "absolute", left: 70, top: 1000, width: 940, height: 330, borderRadius: 34, background: "rgba(10,18,38,.96)", border: "4px solid rgba(245,241,232,.3)", opacity: Math.min(1, card * 1.5), translate: `0px ${(1 - card) * 140}px`, boxShadow: "0 -20px 60px rgba(0,0,0,.5)" }}>
          <div style={{ position: "absolute", top: 20, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.dim, letterSpacing: 2 }}>LOOKUP · ID → PLACE</div>
          {NEAR.map((r, i) => {
            const hl = looks > i;
            return (
              <div key={i} style={{ position: "absolute", left: 30, right: 30, top: 80 + i * 80, height: 68, borderRadius: 18, display: "flex", alignItems: "center", gap: 22, padding: "0 22px", background: hl ? "rgba(74,222,128,.16)" : "rgba(245,241,232,.04)", border: `3px solid ${hl ? C.green : "transparent"}` }}>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: hl ? C.green : C.white, flex: 1 }}>{r.id}</div>
                <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 44, color: C.dim }}>→</div>
                <div style={{ width: 44, display: "flex", justifyContent: "center" }}><Pin size={34} /></div>
                <div style={{ width: 50, fontFamily: SANS, fontWeight: 900, fontSize: 48, color: C.green, opacity: hl ? ok : 0, scale: `${lerp(0.3, 1, ok)}` }}>✓</div>
              </div>
            );
          })}
        </div>
      )}
      <Tag k={tens} color={BLUE} style={{ left: 540, top: 1215, translate: "-50% 0" }} size={56}>± tens of metres</Tag>
      <Tag k={wifiChip} color={BLUE} style={{ left: 60, top: 480 }} size={40}>Wi-Fi: tight</Tag>
      <Tag k={rough} color={C.orange} style={{ right: 60, top: 480 }} size={40}>cell: rough</Tag>
      <Tag k={indoors} style={{ left: dot.x, top: dot.y + 160, translate: "-50% 0" }} size={46}>indoors ✓ located</Tag>
      {/* satellite + blocked beams */}
      {sat > 0.01 && (
        <>
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            {[-70, 0, 70].map((dx, i) => {
              const ex = roof.x + dx * 0.8, ey = roof.y - 10 + Math.abs(dx) * 0.6;
              return <line key={i} x1={satP.x} y1={satP.y + 40} x2={lerp(satP.x, ex, beams)} y2={lerp(satP.y + 40, ey, beams)} stroke={C.white} strokeWidth={6} strokeDasharray="10 14" strokeDashoffset={-t * 80} opacity={0.75} strokeLinecap="round" />;
            })}
            {blocked > 0.01 && [-70, 0, 70].map((dx, i) => {
              const ex = roof.x + dx * 0.8, ey = roof.y - 10 + Math.abs(dx) * 0.6;
              return <g key={i} transform={`translate(${ex},${ey}) scale(${blocked})`}>
                <path d="M-18 -18 L18 18 M18 -18 L-18 18" stroke={C.orange} strokeWidth={9} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 10px rgba(251,146,60,.9))" }} />
              </g>;
            })}
          </svg>
          <div style={{ position: "absolute", left: satP.x - 90, top: satP.y - 50, opacity: Math.min(1, sat * 1.5), scale: `${lerp(0.4, 1, sat)}`, rotate: "-20deg" }}>
            <svg width={180} height={100} viewBox="0 0 180 100">
              <rect x={0} y={30} width={60} height={40} rx={4} fill="rgba(96,165,250,.3)" stroke={BLUE} strokeWidth={5} />
              <rect x={120} y={30} width={60} height={40} rx={4} fill="rgba(96,165,250,.3)" stroke={BLUE} strokeWidth={5} />
              <rect x={66} y={22} width={48} height={56} rx={10} fill="#0A1226" stroke={C.white} strokeWidth={6} />
              <path d="M60 50 H66 M114 50 H120" stroke={C.white} strokeWidth={5} />
            </svg>
          </div>
          <Tag k={blocked * (1 - take)} color={C.orange} style={{ left: satP.x - 20, top: satP.y + 70, translate: "-50% 0" }} size={38}>signal blocked</Tag>
        </>
      )}
      <Tag k={take} style={{ left: 540, top: 1230, translate: "-50% 0" }} size={50}>indoors: Wi-Fi ✓ · satellite <span style={{ color: C.orange }}>✗</span></Tag>
    </>
  );
};

// ---------- sound cues ----------
const SFX: [number, string, number][] = [
  [0, "impact", 0.5], [0.05, "click", 0.6], [W(0, 1), "error", 0.45],
  [1.3, "tick", 0.35], [W(0, 8), "pop", 0.7], [W(0, 8) + 0.05, "chime", 0.45],
  [LS(1) - 0.15, "whoosh", 0.6], [W(1, 2), "pop", 0.6], [W(1, 3), "zap", 0.4], [W(1, 6), "click", 0.6],
  ...[...Array(5)].map((_, i) => [W(2, 0) + i * 0.18, "tick", 0.35] as [number, string, number]), [W(2, 3), "error", 0.5],
  [W(3, 0) - 0.1, "whoosh", 0.5], [W(3, 0), "pop", 0.55], [W(3, 2), "pop", 0.55], [W(3, 6), "riser", 0.4], [W(3, 6), "chime", 0.5],
  [LS(4) - 0.1, "whoosh", 0.45], [W(4, 3), "enter", 0.55],
  [W(5, 2), "zap", 0.55], [W(5, 2) + 0.75, "zap", 0.4], [W(5, 4), "chime", 0.5],
  ...[0, 1, 2].map((i) => [W(6, 0) + i * 0.18, "tick", 0.5] as [number, string, number]), [W(6, 2), "pop", 0.6],
  [LS(7) - 0.1, "whoosh", 0.45], [W(7, 1), "riser", 0.35], [W(7, 3), "click", 0.6],
  [W(8, 2), "chime", 0.55], [W(8, 7), "pop", 0.4],
  [LS(9) - 0.1, "whoosh", 0.55], [W(9, 0), "impact", 0.5], [W(9, 2), "zap", 0.35], [W(9, 6), "error", 0.45],
  [LS(10) - 0.1, "whoosh", 0.55], [W(10, 5), "stamp", 0.8], [W(10, 5) + 0.2, "chime", 0.4],
  [W(11, 1), "pop", 0.55], [W(11, 2), "zap", 0.45], [W(11, 3), "error", 0.55], [W(11, 3) + 0.7, "chime", 0.55], [W(11, 3) + 0.72, "pop", 0.5],
];

export const LocationNoGps: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Background retro={0} />
    <MapWorld />
    <PhoneFrame />
    <Hook />
    <Overlays />
    <Captions lines={T.LINES} skip={[0]} />
    <Bug />
    <Audio src={A("narration.wav")} />
    <Audio src={A("music.wav")} volume={(f) => interpolate(f, [0, 10, T.TOTAL_FRAMES - 25, T.TOTAL_FRAMES], [0, 0.11, 0.11, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    {SFX.map(([s, name, vol], i) => (
      <Sequence key={i} from={Math.max(0, Math.round(s * FPS))} durationInFrames={Math.round(1.6 * FPS)} layout="none">
        <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol * 0.55} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
