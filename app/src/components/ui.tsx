/* FitForge — composants partagés */
import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { FFIcon } from './icons';
import { weeks, fmtISO, TODAY } from '../data/program';
import { useStore } from '../data/store';

// ---------- bouton néon principal ----------
interface NeonButtonProps {
  children: ReactNode;
  onClick?: () => void;
  color?: string;
  textColor?: string;
  pulse?: boolean;
  style?: CSSProperties;
  disabled?: boolean;
}
export function NeonButton({ children, onClick, color = 'var(--accent)', textColor = '#000', pulse = false, style, disabled }: NeonButtonProps) {
  return (
    <button
      className="pressable ff-display"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', height: 56, borderRadius: 14,
        background: disabled ? 'var(--bg-2)' : color,
        color: disabled ? 'var(--txt-2)' : textColor,
        fontSize: 17, fontWeight: 700, letterSpacing: '0.08em',
        boxShadow: disabled ? 'none' : `0 0 calc(28px * var(--glow)) ${color}33, 0 0 calc(8px * var(--glow)) ${color}55`,
        animation: pulse && !disabled ? 'ff-pulse-soft calc(3s * var(--speed)) ease-in-out infinite' : 'none',
        ...style,
      }}
    >{children}</button>
  );
}

// ---------- badge ----------
interface FFBadgeProps {
  children: ReactNode;
  color?: string;
  bg?: string;
  style?: CSSProperties;
}
export function FFBadge({ children, color = 'var(--txt-1)', bg = 'var(--bg-2)', style }: FFBadgeProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999, background: bg, color,
      fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', whiteSpace: 'nowrap', ...style,
    }}>{children}</span>
  );
}

// ---------- progress ring SVG ----------
interface ProgressRingProps {
  progress: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}
export function ProgressRing({ progress, size = 220, stroke = 5, color = 'var(--accent)', track = '#1A1A1A', children }: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 calc(6px * var(--glow)) ${color === 'var(--accent)' ? 'rgba(0,240,255,0.6)' : color})` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

// ---------- sparkline ----------
interface SparklineProps {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
}
export function Sparkline({ points, width = 120, height = 36, color = 'var(--accent)', fill = true }: SparklineProps) {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;
  const px = (i: number) => (i / (points.length - 1)) * (width - 6) + 3;
  const py = (v: number) => height - 5 - ((v - min) / span) * (height - 10);
  const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {fill && <path d={`${d} L${px(points.length - 1)},${height} L${px(0)},${height} Z`} fill={color} opacity="0.08" stroke="none" />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={px(points.length - 1)} cy={py(points[points.length - 1])} r="2.6" fill={color} />
    </svg>
  );
}

// ---------- heatmap de consistance (style contributions) ----------
export function ConsistencyHeatmap({ cell = 14, gap = 4 }: { cell?: number; gap?: number }) {
  const data = useStore();
  const todayIso = fmtISO(TODAY);
  return (
    <div style={{ display: 'flex', gap }}>
      {weeks.slice(0, 12).map((w) => (
        <div key={w.number} style={{ display: 'flex', flexDirection: 'column', gap }}>
          {w.days.map((d) => {
            const s = data.sessions[d.iso];
            let bg = '#111111', glow = 'none';
            if (s) {
              const intensity = Math.min(1, (s.volume || 1500) / 5000);
              bg = `rgba(57, 255, 20, ${0.25 + intensity * 0.6})`;
            } else if (d.iso === todayIso) {
              bg = 'rgba(0, 240, 255, 0.5)'; glow = '0 0 calc(8px * var(--glow)) rgba(0,240,255,0.5)';
            } else if (d.date < TODAY) {
              bg = 'rgba(255, 61, 113, 0.18)'; // séance passée non faite
            }
            return <div key={d.iso} title={`${d.short} — ${d.iso}`}
              style={{ width: cell, height: cell, borderRadius: 3.5, background: bg, boxShadow: glow }} />;
          })}
        </div>
      ))}
    </div>
  );
}

// ---------- compteur animé ----------
export function useCountUp(target: number, duration = 1000, deps: React.DependencyList = []): number {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    let raf: number, start: number | undefined;
    const speed = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--speed')) || 1;
    const dur = duration * speed;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps.length ? deps : [target]);
  return val;
}

// ---------- confettis (particules cyan/vert) ----------
export function Confetti({ count = 36 }: { count?: number }) {
  const parts = React.useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    dur: 1.6 + Math.random() * 1.4,
    size: 4 + Math.random() * 5,
    color: ['#00F0FF', '#39FF14', '#FFFFFF'][i % 3],
    round: Math.random() > 0.5,
  })), [count]);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 50 }}>
      {parts.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', top: 0, left: `${p.left}%`,
          width: p.size, height: p.round ? p.size : p.size * 2.2,
          borderRadius: p.round ? '50%' : 2, background: p.color, opacity: 0.9,
          animation: `ff-confetti-fall calc(${p.dur}s * var(--speed)) ${p.delay}s cubic-bezier(0.3,0,0.8,1) forwards`,
        }} />
      ))}
    </div>
  );
}

// ---------- segmented control ----------
interface SegmentedProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  style?: CSSProperties;
}
export function Segmented({ options, value, onChange, style }: SegmentedProps) {
  return (
    <div style={{ display: 'flex', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 12, padding: 3, gap: 2, ...style }}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className="pressable"
          style={{
            flex: 1, padding: '8px 6px', borderRadius: 9, fontSize: 12.5, fontWeight: 600,
            fontFamily: 'var(--font-display)', letterSpacing: '0.03em',
            background: value === o ? 'var(--bg-2)' : 'transparent',
            color: value === o ? 'var(--accent)' : 'var(--txt-1)',
            boxShadow: value === o ? '0 0 calc(12px * var(--glow)) rgba(0,240,255,0.12)' : 'none',
          }}>{o}</button>
      ))}
    </div>
  );
}

// ---------- stepper +/- (poids, reps) ----------
interface StepperProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  unit?: string;
  min?: number;
  format?: (v: number) => ReactNode;
}
export function Stepper({ label, value, onChange, step = 1, unit = '', min = 0, format }: StepperProps) {
  const display = format ? format(value) : value;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
      <span className="ff-label">{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button className="pressable" onClick={() => onChange(Math.max(min, +(value - step).toFixed(1)))}
          aria-label={`Diminuer ${label}`}
          style={{ width: 44, height: 44, borderRadius: 13, background: 'var(--bg-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-1)', flexShrink: 0 }}>
          <FFIcon name="minus" size={18} />
        </button>
        <div className="ff-mono" style={{ minWidth: 64, textAlign: 'center', fontSize: 26, fontWeight: 700 }}>
          {display}<span style={{ fontSize: 12, color: 'var(--txt-1)', marginLeft: 2 }}>{unit}</span>
        </div>
        <button className="pressable" onClick={() => onChange(+(value + step).toFixed(1))}
          aria-label={`Augmenter ${label}`}
          style={{ width: 44, height: 44, borderRadius: 13, background: 'var(--bg-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
          <FFIcon name="plus" size={18} />
        </button>
      </div>
    </div>
  );
}

// ---------- sélecteur RIR ----------
export function RIRSelector({ value, onChange }: { value: number | null; onChange: (n: number) => void }) {
  const colors = ['#FF3D71', '#FF9F43', '#39FF14', '#39FF14', '#4A4A4A'];
  const labels = ['Échec', 'Très dur', 'Dur', 'Solide', 'Facile'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
      <span className="ff-label">RIR — reps en réserve</span>
      <div style={{ display: 'flex', gap: 14 }}>
        {[0, 1, 2, 3, 4].map((n) => {
          const active = value === n;
          return (
            <button key={n} className="pressable" onClick={() => onChange(n)} aria-label={`RIR ${n}`}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                border: `1.5px solid ${active ? colors[n] : 'var(--line)'}`,
                background: active ? colors[n] : 'transparent',
                color: active ? '#000' : 'var(--txt-1)',
                fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700,
                boxShadow: active ? `0 0 calc(14px * var(--glow)) ${colors[n]}66` : 'none',
                transition: 'all var(--dur-fast) ease',
              }}>{n}</button>
          );
        })}
      </div>
      <span style={{ fontSize: 11.5, color: 'var(--txt-2)', height: 14 }}>
        {value != null ? labels[value] : ''}
      </span>
    </div>
  );
}

// ---------- placeholder imagerie exercice ----------
interface ExercisePlaceholderProps {
  label: string;
  height?: number | string;
  style?: CSSProperties;
}
export function ExercisePlaceholder({ label, height = 180, style }: ExercisePlaceholderProps) {
  return (
    <div className="ff-placeholder" style={{
      height, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', ...style,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,5,5,0.2), rgba(5,5,5,0.9))' }}></div>
      <span className="ff-mono" style={{ position: 'relative', fontSize: 11, color: 'var(--txt-2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        ▦ {label}
      </span>
    </div>
  );
}

// ---------- ligne de stat compacte ----------
interface StatBlockProps {
  label: string;
  value: ReactNode;
  unit?: string;
  color?: string;
  size?: number;
}
export function StatBlock({ label, value, unit, color = 'var(--txt-0)', size = 32 }: StatBlockProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span className="ff-label">{label}</span>
      <span className="ff-mono" style={{ fontSize: size, fontWeight: 700, color, lineHeight: 1 }}>
        {value}<span style={{ fontSize: size * 0.42, color: 'var(--txt-1)', fontWeight: 500 }}>{unit ? ` ${unit}` : ''}</span>
      </span>
    </div>
  );
}
