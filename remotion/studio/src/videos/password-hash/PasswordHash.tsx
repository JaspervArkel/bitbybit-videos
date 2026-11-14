import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, C, Cursor, FPS, INOUT, IN, Line, MONO, SANS, Scene, lerp, makeTiming, pop, ramp, shake, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import words from "./words.json";
import H from "./hashes.json";

const T = makeTiming(words as Line[], 1.2);
const { W, LS } = T;
export const PASSWORD_HASH_FRAMES = T.TOTAL_FRAMES;
const A = (p: string) => staticFile(`videos/password-hash/${p}`);

// ---------- small building blocks ----------
const HEXCH = "0123456789abcdef";
const scrambleChar = (seed: number) => HEXCH[Math.abs(Math.floor(Math.sin(seed * 12.9898) * 43758.5453)) % 16];

/** 64-char hash in 2 rows; chars resolve left→right while k goes 0→1, unresolved chars flicker */
const HexBlock: React.FC<{ hex: string; k: number; prev?: string; diff?: number; size?: number; y: number }> = ({ hex, k, prev, diff = 0, size = 44, y }) => {
  const t = useT();
  const f = Math.floor(t * 30);
  const rows = [hex.slice(0, 32), hex.slice(32)];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      {rows.map((r, ri) => (
        <div key={ri} style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, letterSpacing: 1, whiteSpace: "pre" }}>
          {r.split("").map((ch, i) => {
            const idx = ri * 32 + i;
            const done = idx / 64 < k;
            const changed = prev && prev[idx] !== ch;
            const col = done ? (changed && diff > 0 ? C.orange : C.green) : "rgba(245,241,232,.35)";
            return <span key={i} style={{ color: col, textShadow: done ? `0 0 14px ${col}88` : undefined }}>{done ? ch : prev && k === 0 ? prev[idx] : scrambleChar(idx * 31 + f)}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

const Machine: React.FC<{ y: number; k: number; spin: number; small?: boolean }> = ({ y, k, spin, small }) => {
  const w = small ? 420 : 560, h = small ? 170 : 230;
  const t = useT();
  const gear = (cx: number, r: number, dir: number) => (
    <g style={{ transformOrigin: `${cx}px ${h / 2}px`, rotate: `${dir * t * 360 * spin}deg` }}>
      {[...Array(8)].map((_, i) => <rect key={i} x={cx - 7} y={h / 2 - r - 10} width={14} height={20} rx={3} fill={C.green} style={{ transformOrigin: `${cx}px ${h / 2}px`, rotate: `${i * 45}deg` }} />)}
      <circle cx={cx} cy={h / 2} r={r} fill="none" stroke={C.green} strokeWidth={8} />
      <circle cx={cx} cy={h / 2} r={r * 0.3} fill={C.green} />
    </g>
  );
  return (
    <div style={{ position: "absolute", left: 540 - w / 2, top: y, width: w, height: h, opacity: Math.min(1, k * 1.5), scale: `${lerp(0.6, 1, k)}` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 36, background: "linear-gradient(180deg,#14284A,#0C1832)", border: `5px solid ${C.green}`, boxShadow: `0 0 ${50 + spin * 40}px rgba(74,222,128,${0.25 + spin * 0.2})` }} />
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        {gear(small ? 80 : 100, small ? 34 : 46, 1)}
        {gear(w - (small ? 80 : 100), small ? 34 : 46, -1)}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: small ? 54 : 72, color: C.white, letterSpacing: 6 }}>HASH</div>
      <div style={{ position: "absolute", left: w / 2 - 70, top: -14, width: 140, height: 22, borderRadius: 11, background: C.navyDeep, border: `4px solid ${C.green}` }} />
    </div>
  );
};

const Pill: React.FC<{ text: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ text, color = C.white, size = 60, style }) => (
  <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color, padding: `${size * 0.18}px ${size * 0.45}px`, borderRadius: size * 0.4, background: "rgba(10,18,38,.9)", border: `4px solid ${color === C.white ? "rgba(245,241,232,.35)" : color}`, boxShadow: `0 0 40px ${color}33`, whiteSpace: "nowrap", ...style }}>{text}</div>
);

const Center: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, children, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", alignItems: "center", gap: 24, ...style }}>{children}</div>
);

const Check: React.FC<{ k: number; ok?: boolean; size?: number }> = ({ k, ok = true, size = 90 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: ok ? C.green : C.orange, color: C.navy, fontFamily: SANS, fontWeight: 900, fontSize: size * 0.62, display: "flex", alignItems: "center", justifyContent: "center", scale: `${lerp(0.2, 1, k)}`, opacity: Math.min(1, k * 2), boxShadow: `0 0 50px ${ok ? C.green : C.orange}88`, flex: "none" }}>{ok ? "✓" : "✗"}</div>
);

const Server: React.FC<{ size?: number }> = ({ size = 130 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", filter: `drop-shadow(0 0 12px ${C.green})` }}>
    {[10, 40, 70].map((y) => (
      <g key={y}>
        <rect x={10} y={y} width={80} height={24} rx={6} fill={C.navy} stroke={C.green} strokeWidth={5} />
        <circle cx={24} cy={y + 12} r={4} fill={C.green} />
        <rect x={50} y={y + 9} width={30} height={6} rx={3} fill={C.green} opacity={0.5} />
      </g>
    ))}
  </svg>
);

// ---------- scenes ----------
const Login: React.FC = () => {
  const t = useT();
  const head = 1 - ramp(t, W(1, 0) - 0.1, 0.3);
  const reveal = t >= W(2, 0) + 0.1;
  const click = W(2, 3);
  const glide = ramp(t, W(2, 0), click - W(2, 0) - 0.05, INOUT);
  const down = t > click - 0.06 && t < click + 0.1 ? 1 : 0;
  const good = pop(t, W(1, 3), 11);
  const btnFlash = ramp(t, click, 0.1) * (1 - ramp(t, click + 0.15, 0.3));
  const field = (label: string, value: React.ReactNode, y: number, extra?: React.ReactNode) => (
    <div style={{ position: "absolute", left: 50, right: 50, top: y }}>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.dim, marginBottom: 10 }}>{label}</div>
      <div style={{ height: 92, borderRadius: 20, border: `3px solid ${C.line}`, background: "rgba(245,241,232,.05)", display: "flex", alignItems: "center", padding: "0 26px", fontFamily: MONO, fontWeight: 700, fontSize: 42, color: C.white }}>
        {value}
        <div style={{ marginLeft: "auto" }}>{extra}</div>
      </div>
    </div>
  );
  return (
    <Scene a={0} b={LS(3)} enter={false}>
      <div style={{ position: "absolute", top: 196, left: 0, right: 0, textAlign: "center", opacity: head, translate: `0px ${(1 - head) * -40}px` }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 70, lineHeight: 1.08, color: C.white, letterSpacing: -1 }}>This website doesn't<br />know your</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 132, lineHeight: 1.1, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)" }}>password</div>
      </div>
      <div style={{ position: "absolute", left: 130, width: 820, top: 610, height: 640, borderRadius: 40, background: "linear-gradient(180deg, rgba(28,40,74,.97), rgba(16,25,52,.97))", border: `3px solid ${C.line}`, boxShadow: "0 40px 120px rgba(0,0,0,.55)", scale: `${lerp(1, 1.03, ramp(t, 0, 3, INOUT))}` }}>
        <div style={{ position: "absolute", left: 50, top: 40, fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.white }}>Create account</div>
        {field("Email", "alex@mail.com", 140)}
        {field("Password", reveal ? <span style={{ color: C.orange }}>{H.pw}</span> : "•••••••••••", 300,
          <svg width={46} height={46} viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" fill="none" stroke={reveal ? C.green : C.dim} strokeWidth={2} /><circle cx={12} cy={12} r={3} fill={reveal ? C.green : C.dim} /></svg>)}
        <div style={{ position: "absolute", left: 50, right: 50, top: 490, height: 100, borderRadius: 24, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 44, color: C.navy, scale: `${1 - btnFlash * 0.05}`, boxShadow: `0 0 ${20 + btnFlash * 60}px rgba(74,222,128,.6)` }}>Sign up</div>
      </div>
      {/* the server that doesn't know */}
      <div style={{ position: "absolute", left: 800, top: 640 }}>
        <Server size={100} />
        <div style={{ position: "absolute", left: -150, top: 14, fontFamily: MONO, fontWeight: 800, fontSize: 46, color: C.navy, background: C.white, padding: "2px 18px", borderRadius: 22, opacity: 1 - good, rotate: `${Math.sin(t * 5) * 4}deg` }}>???</div>
        <div style={{ position: "absolute", left: -110, top: 10 }}><Check k={good} size={80} /></div>
      </div>
      {t > W(2, 0) - 0.2 && <Cursor x={lerp(900, 560, glide)} y={lerp(1300, 1140, glide)} down={down} opacity={ramp(t, W(2, 0) - 0.2, 0.2) * (1 - ramp(t, LS(3) - 0.4, 0.3))} />}
    </Scene>
  );
};

const HashScene: React.FC = () => {
  const t = useT();
  const a = LS(3), b = LS(6);
  const machK = pop(t, W(3, 2), 12);
  const drop1 = ramp(t, W(3, 5) - 0.25, 0.4, IN);
  const out1 = ramp(t, W(4, 4), 1.1, (x) => x);
  const changeAt = W(5, 1);
  const drop2 = ramp(t, changeAt + 0.45, 0.35, IN);
  const out2 = ramp(t, changeAt + 0.85, 0.75, (x) => x);
  const second = t >= changeAt + 0.85;
  const pw = t >= changeAt ? H.pw2 : H.pw;
  const lastK = pop(t, changeAt, 10);
  const spin = Math.max(ramp(t, W(3, 5), 0.3) * (1 - ramp(t, W(4, 7), 0.6)), ramp(t, changeAt + 0.6, 0.2) * (1 - ramp(t, changeAt + 1.6, 0.4)), 0.15);
  const oneWay = pop(t, W(4, 1), 12);
  const fixed = ramp(t, W(4, 7), 0.35);
  const comp = pop(t, W(5, 7), 10);
  const pillY = 470;
  const pillText = (
    <>{pw.slice(0, -1)}<span style={{ color: t >= changeAt ? C.orange : C.white, display: "inline-block", scale: `${1 + (1 - lastK) * (t >= changeAt ? 0.6 : 0)}` }}>{pw.slice(-1)}</span></>
  );
  const dropping = (d: number) => d > 0 && d < 1 && (
    <Center y={lerp(pillY, 700, d)} style={{ opacity: 1 - d, scale: `${lerp(1, 0.5, d)}` }}><Pill text={pillText} size={60} /></Center>
  );
  return (
    <Scene a={a} b={b}>
      <Center y={pillY}><Pill text={pillText} size={60} style={{ scale: `${pop(t, a, 12)}` }} /></Center>
      {dropping(drop1)}
      {dropping(drop2)}
      <Machine y={690} k={machK} spin={spin} />
      {/* one-way: forward arrow ok, backwards blocked */}
      <div style={{ position: "absolute", left: 40, top: 640, opacity: oneWay, scale: `${lerp(0.5, 1, oneWay)}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 70, color: C.green }}>↓</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, color: C.green }}>one way</div>
      </div>
      <div style={{ position: "absolute", right: 40, top: 640, opacity: oneWay, scale: `${lerp(0.5, 1, oneWay)}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ position: "relative", fontFamily: SANS, fontWeight: 900, fontSize: 70, color: C.orange }}>↑
          <div style={{ position: "absolute", left: -12, right: -12, top: "48%", height: 8, background: C.orange, rotate: "-35deg", borderRadius: 4 }} />
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, color: C.orange }}>no way back</div>
      </div>
      {t >= W(4, 4) && <HexBlock hex={second ? H.h2 : H.h1} prev={second ? H.h1 : undefined} k={second ? out2 : out1} diff={second ? 1 : 0} y={1000} size={42} />}
      <Center y={1130} style={{ opacity: fixed * (1 - ramp(t, changeAt - 0.2, 0.2)) }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, color: C.dim }}>always 64 characters</div>
      </Center>
      <Center y={1130} style={{ opacity: comp }}>
        <Pill text="1 letter → new hash" color={C.orange} size={40} style={{ scale: `${lerp(0.5, 1, comp)}` }} />
      </Center>
    </Scene>
  );
};

const Table: React.FC<{ rows: { user: string; salt: string; hash: string; k: number; saltK: number; hashK: number }[]; pwStrike: number; hl?: number; hashGlow?: number; x?: number }> = ({ rows, pwStrike, hashGlow = 0 }) => {
  const cols = [170, 200, 220, 330];
  const cell = (c: React.ReactNode, w: number, color = C.white, style?: React.CSSProperties) => (
    <div style={{ width: w, fontFamily: MONO, fontWeight: 800, fontSize: 34, color, padding: "0 8px", whiteSpace: "nowrap", overflow: "hidden", ...style }}>{c}</div>
  );
  return (
    <div style={{ borderRadius: 30, background: "rgba(13,22,48,.95)", border: `3px solid ${C.line}`, padding: "22px 26px", boxShadow: "0 30px 90px rgba(0,0,0,.5)" }}>
      <div style={{ display: "flex", padding: "8px 0 18px", borderBottom: `3px solid ${C.line}` }}>
        {cell("user", cols[0], C.dim)}
        {cell(<span style={{ position: "relative" }}>password<span style={{ position: "absolute", left: -4, top: "50%", height: 6, width: `${pwStrike * 110}%`, background: C.orange, borderRadius: 3 }} /></span>, cols[1], pwStrike > 0.5 ? C.orange : C.dim)}
        {cell("salt", cols[2], C.dim)}
        {cell("hash", cols[3], hashGlow > 0 ? C.green : C.dim)}
      </div>
      {rows.map((r) => (
        <div key={r.user} style={{ display: "flex", padding: "20px 0", borderBottom: `2px solid ${C.line}`, opacity: Math.min(1, r.k * 1.5), translate: `${(1 - r.k) * 60}px 0px` }}>
          {cell(r.user, cols[0])}
          {cell("—", cols[1], C.dim)}
          {cell(r.salt, cols[2], C.orange, { opacity: r.saltK, scale: `${lerp(1.6, 1, r.saltK)}` })}
          {cell(r.hash, cols[3], C.green, { opacity: r.hashK, textShadow: hashGlow ? `0 0 ${20 * hashGlow}px ${C.green}` : undefined })}
        </div>
      ))}
    </div>
  );
};

const short = (h: string) => h.slice(0, 9) + "…";

const DbScene: React.FC = () => {
  const t = useT();
  const a = LS(6), b = LS(8);
  const ident = pop(t, W(7, 1), 12);
  const diff = pop(t, W(7, 4), 10);
  const saltAt = W(6, 8);
  const grains = [...Array(14)];
  return (
    <Scene a={a} b={b}>
      <Center y={470} style={{ opacity: ident, scale: `${lerp(0.6, 1, ident)}`, gap: 18 }}>
        <Pill text={<>alex: <span style={{ color: C.orange }}>{H.pw}</span></>} size={34} />
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 60, color: C.white }}>=</div>
        <Pill text={<>sam: <span style={{ color: C.orange }}>{H.pw}</span></>} size={34} />
      </Center>
      <div style={{ position: "absolute", left: 55, right: 55, top: 640 }}>
        <Table pwStrike={ramp(t, W(6, 2), 0.35)} rows={[
          { user: "alex", salt: H.saltA, hash: short(H.hA), k: pop(t, W(6, 1), 13), saltK: ramp(t, saltAt, 0.3), hashK: ramp(t, W(6, 4), 0.3) },
          { user: "sam", salt: H.saltB, hash: short(H.hB), k: pop(t, W(7, 1) + 0.15, 13), saltK: ramp(t, W(7, 1) + 0.3, 0.3), hashK: ramp(t, W(7, 3), 0.3) },
        ]} />
      </div>
      {/* salt grains */}
      {grains.map((_, i) => {
        const k = ramp(t, saltAt - 0.1 + i * 0.02, 0.6);
        if (k <= 0 || k >= 1) return null;
        const x = 560 + Math.sin(i * 2.3) * 90, y0 = 560;
        return <div key={i} style={{ position: "absolute", left: x + Math.sin(i) * 40 * k, top: lerp(y0, 860, k * k), width: 12, height: 12, borderRadius: 3, background: C.white, opacity: 1 - k, rotate: `${k * 200 + i * 30}deg` }} />;
      })}
      <Center y={1090} style={{ opacity: diff }}>
        <Pill text={<>{short(H.hA)} <span style={{ fontFamily: SANS }}>≠</span> {short(H.hB)}</>} color={C.orange} size={40} style={{ scale: `${lerp(0.5, 1, diff)}` }} />
      </Center>
    </Scene>
  );
};

const LoginCheck: React.FC = () => {
  const t = useT();
  const a = LS(8), b = LS(9);
  const typed = pop(t, W(8, 4) - 0.1, 12);
  const mach = pop(t, W(8, 5), 12);
  const outK = ramp(t, W(8, 6), 0.7, (x) => x);
  const stored = pop(t, W(8, 9) - 0.2, 12);
  const ok = pop(t, W(8, 10) + 0.15, 9);
  const f = Math.floor(t * 30);
  const computed = H.hA.slice(0, 12).split("").map((ch, i) => (i / 12 < outK ? ch : scrambleChar(i * 7 + f))).join("") + "…";
  return (
    <Scene a={a} b={b}>
      <Center y={460} style={{ opacity: typed, scale: `${lerp(0.6, 1, typed)}`, gap: 16 }}>
        <Pill text={H.pw} size={50} />
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 56, color: C.white }}>+</div>
        <Pill text={H.saltA} color={C.orange} size={50} />
      </Center>
      <Machine y={600} k={mach} spin={0.6} small />
      <div style={{ position: "absolute", left: 120, right: 120, top: 830, display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, opacity: Math.min(1, outK * 4) }}>
          <div style={{ width: 200, fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.dim }}>typed now</div>
          <Pill text={computed} color={C.green} size={44} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, opacity: stored, translate: `${(1 - stored) * 60}px 0px` }}>
          <div style={{ width: 200, fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.dim }}>stored</div>
          <Pill text={H.hA.slice(0, 12) + "…"} color={C.green} size={44} />
        </div>
      </div>
      <Center y={1130} style={{ gap: 26 }}>
        <Check k={ok} size={100} />
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 60, color: C.green, opacity: ok }}>match, you're in</div>
      </Center>
    </Scene>
  );
};

const Breach: React.FC = () => {
  const t = useT();
  const a = LS(9), b = LS(10);
  const st = W(9, 0);
  const tape = pop(t, st + 0.1, 10, 220);
  const hashes = ramp(t, W(9, 6), 0.3);
  const notPw = pop(t, W(9, 7), 11);
  const sh = shake(t, st + 0.1, 18, 0.5);
  return (
    <Scene a={a} b={b}>
      <div style={{ position: "absolute", left: 55, right: 55, top: 560, translate: `${sh}px ${lerp(0, -20, tape)}px`, rotate: `${lerp(0, -3, tape)}deg` }}>
        <Table pwStrike={1} hashGlow={hashes} rows={[
          { user: "alex", salt: H.saltA, hash: short(H.hA), k: 1, saltK: 1, hashK: 1 },
          { user: "sam", salt: H.saltB, hash: short(H.hB), k: 1, saltK: 1, hashK: 1 },
          { user: "maya", salt: "Tn3vB8", hash: "9e0d71c2a…", k: 1, saltK: 1, hashK: 1 },
        ]} />
        <div style={{ position: "absolute", left: -80, right: -80, top: 160, height: 96, background: `repeating-linear-gradient(-45deg, ${C.orange} 0 40px, #1a1206 40px 80px)`, rotate: "-8deg", opacity: tape * 0.95, scale: `${lerp(1.4, 1, tape)} 1`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 40px rgba(0,0,0,.5)" }}>
          <div style={{ background: C.navy, color: C.orange, fontFamily: MONO, fontWeight: 800, fontSize: 56, padding: "2px 30px", letterSpacing: 6 }}>STOLEN</div>
        </div>
      </div>
      <Center y={1130} style={{ opacity: notPw, scale: `${lerp(0.5, 1, notPw)}`, gap: 20 }}>
        <Pill text="passwords in it: 0" color={C.orange} size={48} />
      </Center>
    </Scene>
  );
};

const Guess: React.FC = () => {
  const t = useT();
  const a = LS(10), b = LS(11);
  const times = [W(10, 1), W(10, 2), W(10, 3), W(10, 5)];
  const cracked = pop(t, W(10, 5) + 0.1, 9);
  return (
    <Scene a={a} b={b}>
      <Center y={455} style={{ opacity: pop(t, a, 13), flexDirection: "column", gap: 8 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.dim }}>stolen hash for alex</div>
        <Pill text={H.hA.slice(0, 12) + "…"} color={C.green} size={44} />
      </Center>
      <div style={{ position: "absolute", left: 90, right: 90, top: 690, display: "flex", flexDirection: "column", gap: 20 }}>
        {H.guesses.map(([g, h], i) => {
          const k = pop(t, times[i], 13);
          const win = i === 3;
          return (
            <div key={g} style={{ display: "flex", alignItems: "center", gap: 20, opacity: Math.min(1, k * 1.5), translate: `${(1 - k) * 80}px 0px` }}>
              <div style={{ width: 290, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: win ? C.orange : C.white }}>{g}</div>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 40, color: C.dim }}>→</div>
              <div style={{ flex: 1, fontFamily: MONO, fontWeight: 800, fontSize: 36, color: win ? C.green : "rgba(245,241,232,.45)" }}>{h.slice(0, 10)}…</div>
              <Check k={win ? cracked : pop(t, times[i] + 0.15, 12)} ok={win} size={64} />
            </div>
          );
        })}
      </div>
      <Center y={1150} style={{ opacity: cracked }}>
        <Pill text="weak password: guessed" color={C.orange} size={44} style={{ scale: `${lerp(0.5, 1, cracked)}` }} />
      </Center>
    </Scene>
  );
};

const Drive: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <div style={{ width: 230, height: 150, borderRadius: 26, border: `6px solid ${color}`, background: "rgba(10,18,38,.9)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 54, color, boxShadow: `0 0 50px ${color}44` }}>{label}</div>
);

const EndCard: React.FC = () => {
  const t = useT();
  const a = LS(11);
  const fol = pop(t, W(11, 0), 10);
  const press = t > W(11, 0) + 0.35 && t < W(11, 0) + 0.5 ? 1 : 0;
  const followed = t > W(11, 0) + 0.45;
  const tb = pop(t, W(11, 3), 12), gb = pop(t, W(11, 5), 12);
  return (
    <Scene a={a} b={T.END + 1} exit={false}>
      <Center y={480} style={{ opacity: fol, scale: `${lerp(0.5, 1, fol) * (1 - press * 0.06)}` }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 72, color: followed ? C.green : C.navy, background: followed ? "rgba(74,222,128,.12)" : C.green, border: `5px solid ${C.green}`, padding: "18px 70px", borderRadius: 999, boxShadow: "0 0 70px rgba(74,222,128,.45)" }}>{followed ? "Following ✓" : "Follow"}</div>
      </Center>
      <Cursor x={lerp(800, 640, ramp(t, a, 0.4, INOUT))} y={lerp(700, 540, ramp(t, a, 0.4, INOUT))} down={press} opacity={ramp(t, a, 0.2) * (1 - ramp(t, W(11, 1), 0.3))} />
      <Center y={720} style={{ opacity: ramp(t, W(11, 1), 0.3) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.white }}>Tomorrow:</div>
      </Center>
      <Center y={860} style={{ gap: 30 }}>
        <div style={{ opacity: tb, scale: `${lerp(0.5, 1, tb)}` }}><Drive label="1 TB" color={C.green} /></div>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 80, color: C.white, opacity: gb }}>→</div>
        <div style={{ opacity: gb, scale: `${lerp(0.5, 1, gb)}`, rotate: `${shake(t, W(11, 5), 4, 0.5)}deg` }}><Drive label="931 GB" color={C.orange} /></div>
      </Center>
      <Center y={1080} style={{ opacity: gb }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 64, color: C.orange }}>where did 69 GB go?</div>
      </Center>
    </Scene>
  );
};

// ---------- sound cues ----------
const SFX: [number, string, number][] = [
  [0, "impact", 0.5],
  [W(1, 3), "pop", 0.8],
  [W(2, 0) + 0.1, "click", 0.8], [W(2, 3), "click", 0.9], [W(2, 3) + 0.05, "enter", 0.6],
  [LS(3) - 0.15, "whoosh", 0.6], [W(3, 2), "pop", 0.6], [W(3, 5) - 0.1, "zap", 0.6], [W(3, 5) + 0.1, "riser", 0.4],
  [W(4, 1), "pop", 0.7],
  ...[...Array(10)].map((_, i) => [W(4, 4) + i * 0.11, "tick", 0.7] as [number, string, number]),
  [W(5, 1), "pop", 0.9], [W(5, 1) + 0.45, "zap", 0.6],
  ...[...Array(7)].map((_, i) => [W(5, 1) + 0.85 + i * 0.11, "tick", 0.7] as [number, string, number]),
  [W(5, 7), "impact", 0.6],
  [LS(6) - 0.15, "whoosh", 0.5], [W(6, 1), "pop", 0.6], [W(6, 2), "stamp", 0.4], [W(6, 4), "pop", 0.5], [W(6, 8) - 0.1, "riser", 0.35],
  [W(7, 1), "pop", 0.7], [W(7, 4), "impact", 0.6],
  [LS(8) - 0.15, "whoosh", 0.5], [W(8, 5), "zap", 0.5], [W(8, 9) - 0.2, "pop", 0.6], [W(8, 10) + 0.15, "chime", 0.9],
  [LS(9) - 0.1, "whoosh", 0.5], [W(9, 0) + 0.1, "stamp", 0.9], [W(9, 0) + 0.1, "impact", 0.7], [W(9, 7), "pop", 0.7],
  [LS(10) - 0.15, "whoosh", 0.5], [W(10, 1), "error", 0.25], [W(10, 2), "error", 0.25], [W(10, 3), "error", 0.25], [W(10, 5) + 0.1, "impact", 0.8],
  [LS(11) - 0.15, "whoosh", 0.5], [W(11, 0) + 0.4, "click", 0.9], [W(11, 0) + 0.45, "chime", 0.7], [W(11, 3), "pop", 0.7], [W(11, 5), "pop", 0.7], [W(11, 5) + 0.1, "impact", 0.5],
];

export const PasswordHash: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <Background retro={0.3 * ramp(t, LS(3), 0.6) * (1 - ramp(t, LS(11), 0.5))} />
      <Login />
      <HashScene />
      <DbScene />
      <LoginCheck />
      <Breach />
      <Guess />
      <EndCard />
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
};
