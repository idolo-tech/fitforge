/* FitForge — Timer de repos (3 designs) + Récap post-séance */
import React from 'react';
import type { CSSProperties } from 'react';
import { FFIcon } from '../components/icons';
import { NeonButton, ProgressRing, useCountUp, Confetti } from '../components/ui';
import type { SessionSummary } from '../data/types';

// ---------- timer de repos ----------
interface RestTimerProps {
  total: number;
  design: string;
  exerciseName: string;
  onDone: () => void;
  onSkip: () => void;
}
export function RestTimer({ total, design, exerciseName, onDone, onSkip }: RestTimerProps) {
  const [left, setLeft] = React.useState(total);
  const [max, setMax] = React.useState(total);
  React.useEffect(() => {
    const id = setInterval(() => setLeft((l) => {
      if (l <= 1) { clearInterval(id); setTimeout(onDone, 350); return 0; }
      return l - 1;
    }), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const adjust = (d: number) => { setLeft((l) => Math.max(1, l + d)); setMax((m) => Math.max(m, left + d)); };
  const p = left / max;
  const closing = left <= 5;
  const color = closing ? 'var(--accent-3)' : 'var(--accent)';
  const mm = String(Math.floor(left / 60));
  const ss = String(left % 60).padStart(2, '0');

  return (
    <div className="anim-fade-in" style={{
      position: 'absolute', inset: 0, zIndex: 40, background: 'var(--glass)', backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26,
    }} role="timer" aria-label="Repos">
      <div className="ff-label" style={{ color: 'var(--txt-1)' }}>Repos</div>

      {design === 'Ring' && (
        <ProgressRing progress={p} size={240} stroke={6} color={color}>
          <span className="ff-mono" style={{ fontSize: 64, fontWeight: 700, color: 'var(--txt-0)', animation: closing ? 'ff-glow-pulse calc(1s * var(--speed)) ease-in-out infinite' : 'none', textShadow: `0 0 calc(30px * var(--glow)) ${closing ? 'rgba(57,255,20,0.6)' : 'rgba(0,240,255,0.45)'}` }}>
            {mm}:{ss}
          </span>
          <span style={{ fontSize: 12, color: 'var(--txt-1)' }} className="ff-mono">sur {Math.floor(max / 60)}:{String(max % 60).padStart(2, '0')}</span>
        </ProgressRing>
      )}

      {design === 'Liquide' && (
        <div style={{ position: 'relative', width: 230, height: 230, borderRadius: '50%', overflow: 'hidden', border: `1.5px solid ${color}`, boxShadow: `0 0 calc(34px * var(--glow)) ${closing ? 'rgba(57,255,20,0.25)' : 'rgba(0,240,255,0.22)'}` }}>
          {/* niveau de liquide qui descend */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${p * 100}%`, transition: 'height 1s linear', background: closing ? 'rgba(57,255,20,0.16)' : 'rgba(0,240,255,0.14)' }}>
            <svg viewBox="0 0 200 14" preserveAspectRatio="none" style={{ position: 'absolute', top: -10, left: 0, width: '200%', height: 14, animation: 'ff-liquid-wave calc(2.4s * var(--speed)) linear infinite' }}>
              <path d="M0 8 Q12.5 0 25 8 T50 8 T75 8 T100 8 T125 8 T150 8 T175 8 T200 8 V14 H0 Z" fill={closing ? 'rgba(57,255,20,0.3)' : 'rgba(0,240,255,0.3)'} />
            </svg>
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span className="ff-mono" style={{ fontSize: 62, fontWeight: 700, animation: closing ? 'ff-glow-pulse calc(1s * var(--speed)) ease-in-out infinite' : 'none' }}>{mm}:{ss}</span>
            <span style={{ fontSize: 11.5, color: 'var(--txt-1)' }} className="ff-mono">repos</span>
          </div>
        </div>
      )}

      {design === 'Minimal' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: '78%' }}>
          <span className="ff-mono" style={{ fontSize: 104, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--txt-0)', textShadow: `0 0 calc(40px * var(--glow)) ${closing ? 'rgba(57,255,20,0.55)' : 'rgba(0,240,255,0.4)'}`, animation: closing ? 'ff-glow-pulse calc(1s * var(--speed)) ease-in-out infinite' : 'none' }}>
            {mm}:{ss}
          </span>
          <div style={{ width: '100%', height: 3, borderRadius: 2, background: 'var(--bg-2)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${p * 100}%`, background: color, transition: 'width 1s linear', boxShadow: `0 0 calc(10px * var(--glow)) ${color}` }}></div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="pressable ff-mono" onClick={() => adjust(-15)} style={restBtnStyle}>-15s</button>
        <button className="pressable ff-mono" onClick={() => adjust(15)} style={restBtnStyle}>+15s</button>
        <button className="pressable ff-mono" onClick={onSkip} style={{ ...restBtnStyle, color: 'var(--accent)', borderColor: 'rgba(0,240,255,0.35)' }}>Passer</button>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--txt-2)', textAlign: 'center', padding: '0 30px' }}>
        Repos recommandé : {total}s pour {exerciseName}
      </div>
    </div>
  );
}
const restBtnStyle: CSSProperties = {
  padding: '12px 20px', borderRadius: 12, border: '1px solid var(--line)',
  background: 'var(--bg-1)', color: 'var(--txt-1)', fontSize: 14, fontWeight: 600,
};

// ---------- graphique d'intensité ----------
export function IntensityChart({ samples }: { samples: number[] }) {
  const W = 320, H = 90;
  const px = (i: number) => 8 + (i / (samples.length - 1)) * (W - 16);
  const py = (v: number) => H - 12 - (v / 4) * (H - 28); // intensité 0-4
  const d = samples.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {[1, 2.4, 3.6].map((_, i) => (
        <rect key={i} x="0" y={py([3.6, 2.4, 1][i] + 0.4)} width={W} height={py([3.6, 2.4, 1][i] - 0.4) - py([3.6, 2.4, 1][i] + 0.4)} fill={['rgba(255,61,113,0.06)', 'rgba(255,159,67,0.05)', 'rgba(57,255,20,0.05)'][i]} />
      ))}
      <path d={`${d} L${px(samples.length - 1)},${H} L${px(0)},${H} Z`} fill="rgba(0,240,255,0.07)" />
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {samples.map((v, i) => <circle key={i} cx={px(i)} cy={py(v)} r="2.6" fill={v >= 3.2 ? '#FF3D71' : v >= 2 ? '#FF9F43' : '#39FF14'} />)}
    </svg>
  );
}

// ---------- récap post-séance ----------
interface SummaryScreenProps {
  session: SessionSummary;
  desktop?: boolean;
  onShare: () => void;
  onHome: () => void;
}
export function SummaryScreen({ session, desktop = false, onShare, onHome }: SummaryScreenProps) {
  const vol = useCountUp(session.volume, 1100);
  const kcal = useCountUp(session.kcal, 1100);
  return (
    <div className="anim-fade-up" style={{ position: 'absolute', inset: 0, zIndex: 45, background: 'var(--bg-0)', overflowY: 'auto' }}>
      <Confetti count={30} />
      <div style={{ padding: '40px 24px 30px', display: 'flex', flexDirection: 'column', gap: 26, width: '100%', maxWidth: desktop ? 600 : undefined, marginLeft: 'auto', marginRight: 'auto' }}>
        <header style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ margin: '0 auto', width: 58, height: 58, borderRadius: '50%', background: 'rgba(57,255,20,0.1)', border: '1.5px solid var(--accent-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 calc(26px * var(--glow)) rgba(57,255,20,0.3)' }}>
            <FFIcon name="check" size={26} color="var(--accent-3)" strokeWidth={2.4} />
          </div>
          <h1 className="ff-display" style={{ fontSize: 26, fontWeight: 700 }}>Séance forgée.</h1>
          <p style={{ fontSize: 13.5, color: 'var(--txt-1)' }}>{session.dayName}</p>
        </header>

        {/* hero stats */}
        <div style={{ textAlign: 'center' }}>
          <span className="ff-mono text-glow-cyan" style={{ fontSize: 76, fontWeight: 700, lineHeight: 1, color: 'var(--accent)' }}>
            {Math.round(vol).toLocaleString('fr-FR')}
          </span>
          <div className="ff-label" style={{ marginTop: 8 }}>kg de volume total</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: 'Durée', value: session.duration, unit: '' },
            { label: 'PRs battus', value: session.prCount, unit: '', color: session.prCount ? 'var(--accent-3)' : 'var(--txt-0)' },
            { label: 'Calories', value: Math.round(kcal), unit: 'kcal' },
          ].map((s) => (
            <div key={s.label} className="ff-card" style={{ padding: '14px 10px', textAlign: 'center' }}>
              <div className="ff-mono" style={{ fontSize: 24, fontWeight: 700, color: s.color || 'var(--txt-0)' }}>{s.value}<span style={{ fontSize: 11, color: 'var(--txt-1)' }}>{s.unit ? ` ${s.unit}` : ''}</span></div>
              <div className="ff-label" style={{ fontSize: 9.5, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <section className="ff-card" style={{ padding: 18 }}>
          <div className="ff-label" style={{ marginBottom: 12 }}>Intensité de la séance · RIR inversé</div>
          <IntensityChart samples={session.intensity} />
          <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 11, color: 'var(--txt-1)' }}>
            <span><span style={{ color: '#39FF14' }}>●</span> facile</span>
            <span><span style={{ color: '#FF9F43' }}>●</span> dur</span>
            <span><span style={{ color: '#FF3D71' }}>●</span> proche échec</span>
          </div>
        </section>

        <section className="ff-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ff-label">vs vendredi dernier</div>
          {session.comparison.map((c) => (
            <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13.5, color: 'var(--txt-1)' }}>{c.label}</span>
              <span className="ff-mono" style={{ fontSize: 14, fontWeight: 600, color: c.delta >= 0 ? 'var(--accent-3)' : 'var(--accent-2)' }}>
                {c.delta >= 0 ? '▲' : '▼'} {c.value}
              </span>
            </div>
          ))}
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <NeonButton onClick={onShare} color="var(--bg-2)" textColor="var(--txt-0)" style={{ border: '1px solid var(--line)', boxShadow: 'none' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><FFIcon name="share" size={18} /> PARTAGER MA SÉANCE</span>
          </NeonButton>
          <NeonButton onClick={onHome}>RETOUR AU DASHBOARD</NeonButton>
        </div>
      </div>
    </div>
  );
}

// ---------- carte de partage (story 9:16) ----------
export function ShareCard({ session, onClose }: { session: SessionSummary; onClose: () => void }) {
  return (
    <div className="anim-fade-in" style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 250, aspectRatio: '9/16', background: 'linear-gradient(165deg, #0A0A0A, #050505)', border: '1px solid var(--line)', borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 0 calc(40px * var(--glow)) rgba(0,240,255,0.12)' }}>
        <div className="ff-display" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em' }}>FIT<span style={{ color: 'var(--accent)' }}>FORGE</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div className="ff-mono" style={{ fontSize: 44, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{session.volume.toLocaleString('fr-FR')}</div>
            <div className="ff-label" style={{ fontSize: 9 }}>kg soulevés</div>
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            <div><div className="ff-mono" style={{ fontSize: 20, fontWeight: 700 }}>{session.duration}</div><div className="ff-label" style={{ fontSize: 8 }}>durée</div></div>
            <div><div className="ff-mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-3)' }}>{session.prCount}</div><div className="ff-label" style={{ fontSize: 8 }}>PRs</div></div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--txt-1)' }}>{session.dayName}</div>
        </div>
        <div style={{ fontSize: 9, color: 'var(--txt-2)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Forge your body.</div>
      </div>
      <span style={{ fontSize: 12, color: 'var(--txt-1)' }}>Aperçu story 9:16 — tap pour fermer</span>
    </div>
  );
}
