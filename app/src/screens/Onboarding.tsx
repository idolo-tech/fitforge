/* FitForge — Splash + Onboarding (3 étapes) + loading "forge" */
import React from 'react';
import { FFIcon } from '../components/icons';
import { NeonButton } from '../components/ui';
import * as FF from '../data/program';

// ---------- logo : F géométrique forgé, animé en stroke ----------
export function ForgeLogo({ size = 96, animate = true }: { size?: number; animate?: boolean }) {
  const common = {
    fill: 'none', stroke: 'var(--accent)', strokeWidth: 5,
    strokeLinecap: 'square' as const,
    strokeDasharray: 400, strokeDashoffset: animate ? 400 : 0,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" style={{ filter: 'drop-shadow(0 0 calc(14px * var(--glow)) rgba(0,240,255,0.5))' }}>
      <polygon points="48,6 88,28 88,68 48,90 8,68 8,28" {...common}
        style={animate ? { animation: 'ff-draw calc(1.1s * var(--speed)) ease-out forwards' } : undefined} />
      <path d="M36 66 V32 H62 M36 48 H56" {...common} strokeDasharray="120" strokeDashoffset={animate ? 120 : 0}
        style={animate ? { animation: 'ff-draw calc(0.8s * var(--speed)) calc(0.7s * var(--speed)) ease-out forwards' } : undefined} />
    </svg>
  );
}

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = React.useState(false);
  React.useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 2400);
    const t2 = setTimeout(onDone, 3100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div onClick={onDone} style={{ position: 'absolute', inset: 0, background: 'var(--bg-0)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, zIndex: 100 }}>
      <ForgeLogo size={110} />
      <div style={{ textAlign: 'center' }}>
        <div className="ff-display" style={{ fontSize: 30, fontWeight: 700, letterSpacing: '0.06em', animation: 'ff-fade-in calc(0.6s * var(--speed)) calc(1.2s * var(--speed)) both' }}>
          FIT<span style={{ color: 'var(--accent)' }}>FORGE</span>
        </div>
        <div style={{ fontSize: 14, color: 'var(--txt-1)', marginTop: 8, letterSpacing: '0.22em', textTransform: 'uppercase', animation: 'ff-fade-in calc(0.6s * var(--speed)) calc(1.7s * var(--speed)) both' }}>
          Forge your body.
        </div>
      </div>
      {/* iris wipe */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%', width: 20, height: 20, borderRadius: '50%',
        background: 'var(--bg-0)', transform: leaving ? 'translate(-50%,-50%) scale(160)' : 'translate(-50%,-50%) scale(0)',
        transition: 'transform calc(0.7s * var(--speed)) cubic-bezier(0.7,0,0.84,0)', pointerEvents: 'none',
        boxShadow: leaving ? '0 0 60px rgba(0,240,255,0.3)' : 'none',
      }}></div>
    </div>
  );
}

// ---------- wheel picker (scroll-snap) ----------
function WheelColumn<T extends string | number>({ values, value, onChange, width = 80 }: {
  values: T[]; value: T; onChange: (v: T) => void; width?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const ITEM = 40;
  React.useEffect(() => {
    const idx = values.indexOf(value);
    if (ref.current && idx >= 0) ref.current.scrollTop = idx * ITEM;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onScroll = () => {
    if (!ref.current) return;
    const idx = Math.round(ref.current.scrollTop / ITEM);
    const v = values[Math.max(0, Math.min(values.length - 1, idx))];
    if (v !== value) onChange(v);
  };
  return (
    <div style={{ position: 'relative', height: ITEM * 3, width, overflow: 'hidden' }}>
      <div ref={ref} onScroll={onScroll}
        style={{ height: '100%', overflowY: 'scroll', scrollSnapType: 'y mandatory', paddingTop: ITEM, paddingBottom: ITEM }}>
        {values.map((v) => (
          <div key={v} className="ff-mono" style={{
            height: ITEM, display: 'flex', alignItems: 'center', justifyContent: 'center',
            scrollSnapAlign: 'center', fontSize: 17,
            color: v === value ? 'var(--accent)' : 'var(--txt-2)',
            fontWeight: v === value ? 700 : 400,
            transition: 'color var(--dur-fast) ease',
          }}>{v}</div>
        ))}
      </div>
      <div style={{ position: 'absolute', top: ITEM, left: 4, right: 4, height: ITEM, border: '1px solid var(--line)', borderRadius: 10, pointerEvents: 'none', background: 'rgba(26,26,26,0.25)' }}></div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: ITEM - 6, background: 'linear-gradient(180deg, var(--bg-0), transparent)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: ITEM - 6, background: 'linear-gradient(0deg, var(--bg-0), transparent)', pointerEvents: 'none' }}></div>
    </div>
  );
}

// ---------- slider magnétique ----------
function MagneticSlider({ label, value, onChange, min, max, unit }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; unit: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="ff-label">{label}</span>
        <span className="ff-mono" style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent)' }}>
          {value}<span style={{ fontSize: 13, color: 'var(--txt-1)' }}> {unit}</span>
        </span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(+e.target.value)}
        aria-label={label}
        style={{ width: '100%', accentColor: '#00F0FF', height: 28 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--txt-2)' }} className="ff-mono">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

// ---------- onboarding ----------
export function OnboardingScreen({ onDone }: { onDone: (name: string) => void }) {
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState('');
  const [gender, setGender] = React.useState<string | null>(null);
  const [day, setDay] = React.useState<number>(14);
  const [month, setMonth] = React.useState<string>('Mars');
  const [year, setYear] = React.useState<number>(1998);
  const [weight, setWeight] = React.useState(70);
  const [height, setHeight] = React.useState(178);
  const [goal, setGoal] = React.useState('muscle');
  const [equip, setEquip] = React.useState<string[]>(['gym']);
  const [forging, setForging] = React.useState(false);

  const GOALS = [
    { id: 'muscle', label: 'Prise de muscle', desc: 'Construire de la masse', mark: '▲', color: 'var(--accent)' },
    { id: 'fatloss', label: 'Perte de gras', desc: 'Se définir, s’affûter', mark: '◆', color: 'var(--accent-2)' },
    { id: 'maintain', label: 'Maintien', desc: 'Garder la forme', mark: '●', color: 'var(--accent-3)' },
  ];
  const EQUIPMENT = [
    { id: 'gym', label: 'Salle complète' },
    { id: 'dumbbells', label: 'Haltères' },
    { id: 'bands', label: 'Élastiques' },
    { id: 'bodyweight', label: 'Poids du corps' },
  ];
  const toggleEquip = (id: string) => setEquip((e) => e.includes(id) ? e.filter((x) => x !== id) : [...e, id]);

  const canNext = step === 0 ? !!(name.trim() && gender) : step === 1 ? !!goal : equip.length > 0;

  if (forging) return <ForgeLoading onDone={() => onDone(name.trim() || 'Alex')} />;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-0)', zIndex: 90 }}>
      {/* progress */}
      <div style={{ display: 'flex', gap: 6, padding: '22px 24px 10px' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? 'var(--accent)' : 'var(--bg-2)', boxShadow: i <= step ? '0 0 calc(8px * var(--glow)) rgba(0,240,255,0.4)' : 'none', transition: 'background var(--dur-med) ease' }}></div>
        ))}
      </div>

      <div key={step} className="anim-fade-up" style={{ flex: 1, overflowY: 'auto', padding: '18px 24px 24px', display: 'flex', flexDirection: 'column', gap: 26 }}>
        {step === 0 && (
          <>
            <header>
              <div className="ff-label" style={{ color: 'var(--accent)' }}>Étape 1 / 3</div>
              <h1 className="ff-display" style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>Qui es-tu ?</h1>
            </header>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label className="ff-label" htmlFor="ob-name">Ton prénom</label>
              <input id="ob-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="Alex"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 14, padding: '16px 18px', fontSize: 18, color: 'var(--txt-0)', outline: 'none', fontFamily: 'var(--font-display)', fontWeight: 600 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="ff-label">Sexe</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[{ id: 'm', label: 'Homme', mark: '▲' }, { id: 'f', label: 'Femme', mark: '○' }].map((g) => (
                  <button key={g.id} className="pressable" onClick={() => setGender(g.id)}
                    style={{
                      padding: '24px 12px', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                      background: gender === g.id ? 'var(--bg-2)' : 'var(--bg-1)',
                      border: `1.5px solid ${gender === g.id ? 'var(--accent)' : 'var(--line)'}`,
                      boxShadow: gender === g.id ? '0 0 calc(18px * var(--glow)) rgba(0,240,255,0.15)' : 'none',
                    }}>
                    <span style={{ fontSize: 26, color: gender === g.id ? 'var(--accent)' : 'var(--txt-2)' }}>{g.mark}</span>
                    <span className="ff-display" style={{ fontSize: 15, fontWeight: 600 }}>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="ff-label">Date de naissance</span>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 16, padding: '8px 12px' }}>
                <WheelColumn values={Array.from({ length: 31 }, (_, i) => i + 1)} value={day} onChange={setDay} width={64} />
                <WheelColumn values={FF.MONTHS_FR.map((m) => m[0].toUpperCase() + m.slice(1, 4))} value={month} onChange={setMonth} width={84} />
                <WheelColumn values={Array.from({ length: 50 }, (_, i) => 2012 - i)} value={year} onChange={setYear} width={84} />
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <header>
              <div className="ff-label" style={{ color: 'var(--accent)' }}>Étape 2 / 3</div>
              <h1 className="ff-display" style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>Ton corps</h1>
            </header>
            <MagneticSlider label="Poids" value={weight} onChange={setWeight} min={40} max={150} unit="kg" />
            <MagneticSlider label="Taille" value={height} onChange={setHeight} min={140} max={210} unit="cm" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="ff-label">Ton objectif</span>
              {GOALS.map((g) => (
                <button key={g.id} className="pressable" onClick={() => setGoal(g.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', borderRadius: 16, textAlign: 'left',
                    background: goal === g.id ? 'var(--bg-2)' : 'var(--bg-1)',
                    border: `1.5px solid ${goal === g.id ? g.color : 'var(--line)'}`,
                    boxShadow: goal === g.id ? `0 0 calc(18px * var(--glow)) ${g.id === 'muscle' ? 'rgba(0,240,255,0.14)' : g.id === 'fatloss' ? 'rgba(255,61,113,0.14)' : 'rgba(57,255,20,0.14)'}` : 'none',
                  }}>
                  <span style={{ fontSize: 22, color: goal === g.id ? g.color : 'var(--txt-2)', width: 28, textAlign: 'center' }}>{g.mark}</span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span className="ff-display" style={{ fontSize: 16, fontWeight: 600 }}>{g.label}</span>
                    <span style={{ fontSize: 12.5, color: 'var(--txt-1)' }}>{g.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <header>
              <div className="ff-label" style={{ color: 'var(--accent)' }}>Étape 3 / 3</div>
              <h1 className="ff-display" style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>Ton équipement</h1>
              <p style={{ fontSize: 13.5, color: 'var(--txt-1)', marginTop: 6 }}>Plus tu en sélectionnes, plus le programme s’adapte.</p>
            </header>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {EQUIPMENT.map((e) => {
                const on = equip.includes(e.id);
                return (
                  <button key={e.id} className="pressable" onClick={() => toggleEquip(e.id)}
                    style={{
                      padding: '26px 12px', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                      background: on ? 'var(--bg-2)' : 'var(--bg-1)',
                      border: `1.5px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
                      boxShadow: on ? '0 0 calc(18px * var(--glow)) rgba(0,240,255,0.14)' : 'none',
                    }}>
                    <FFIcon name="dumbbell" size={26} color={on ? 'var(--accent)' : 'var(--txt-2)'} />
                    <span className="ff-display" style={{ fontSize: 14.5, fontWeight: 600 }}>{e.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div style={{ padding: '12px 24px calc(24px + env(safe-area-inset-bottom))', display: 'flex', gap: 12 }}>
        {step > 0 && (
          <button className="pressable" onClick={() => setStep(step - 1)} aria-label="Retour"
            style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--bg-1)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-1)' }}>
            <FFIcon name="chevronL" size={22} />
          </button>
        )}
        <NeonButton disabled={!canNext} onClick={() => step < 2 ? setStep(step + 1) : setForging(true)}>
          {step < 2 ? 'CONTINUER' : 'GÉNÉRER MON PROGRAMME'}
        </NeonButton>
      </div>
    </div>
  );
}

// ---------- loading "forge" ----------
export function ForgeLoading({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = React.useState(0);
  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1200);
    const t2 = setTimeout(() => setPhase(2), 2100);
    const t3 = setTimeout(onDone, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const msgs = ['Analyse de ton profil…', 'Forge du programme 12 semaines…', 'Prêt.'];
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-0)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, zIndex: 95 }}>
      {/* barre de métal qui devient barre de musculation */}
      <div style={{ position: 'relative', width: 220, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          height: 8, borderRadius: 4, background: 'linear-gradient(90deg, #333, #888, #333)',
          width: phase === 0 ? 90 : 200, transition: 'width calc(0.8s * var(--speed)) cubic-bezier(0.22,1,0.36,1)',
          boxShadow: phase === 0 ? '0 0 calc(24px * var(--glow)) rgba(255,120,40,0.6)' : '0 0 calc(16px * var(--glow)) rgba(0,240,255,0.35)',
        }}></div>
        {/* disques */}
        {[[-86, 36], [-72, 26], [86, 36], [72, 26]].map(([x, h], i) => (
          <div key={i} style={{
            position: 'absolute', left: `calc(50% + ${x}px)`, top: '50%',
            width: 10, height: h, borderRadius: 4, transform: 'translate(-50%,-50%)',
            background: '#1A1A1A', border: '1px solid #2A2A2A',
            opacity: phase >= 1 ? 1 : 0, transition: `opacity calc(0.4s * var(--speed)) ease ${i * 0.08}s`,
          }}></div>
        ))}
      </div>
      <div className="ff-mono" style={{ fontSize: 13, color: 'var(--txt-1)', letterSpacing: '0.08em' }} aria-live="polite">
        {msgs[phase]}
      </div>
    </div>
  );
}
