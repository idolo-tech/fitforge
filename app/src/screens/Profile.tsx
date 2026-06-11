/* FitForge — Profil & Corps (données réelles, saisies par l'utilisateur) */
import React from 'react';
import { FFIcon } from '../components/icons';
import { Segmented, Sparkline } from '../components/ui';
import { useStore, addBodyWeight, addMeasurement, measurementViews } from '../data/store';

export interface Profile { name: string; weight: number; height: number; goal: string; }

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} role="switch" aria-checked={value} className="pressable" style={{
      width: 46, height: 27, borderRadius: 999, padding: 3, flexShrink: 0,
      background: value ? 'rgba(0,240,255,0.2)' : 'var(--bg-2)',
      border: `1px solid ${value ? 'var(--accent)' : 'var(--line)'}`,
      transition: 'all var(--dur-fast) ease',
    }}>
      <span style={{
        display: 'block', width: 19, height: 19, borderRadius: '50%',
        background: value ? 'var(--accent)' : 'var(--txt-2)',
        transform: value ? 'translateX(19px)' : 'translateX(0)',
        transition: 'transform var(--dur-fast) ease',
        boxShadow: value ? '0 0 calc(10px * var(--glow)) rgba(0,240,255,0.5)' : 'none',
      }}></span>
    </button>
  );
}

/* mini-saisie numérique + bouton */
function AddValue({ placeholder, unit, onAdd }: { placeholder: string; unit: string; onAdd: (v: number) => void }) {
  const [v, setV] = React.useState('');
  const submit = () => {
    const n = parseFloat(v.replace(',', '.'));
    if (!isNaN(n) && n > 0) { onAdd(+n.toFixed(1)); setV(''); }
  };
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input value={v} onChange={(e) => setV(e.target.value)} inputMode="decimal" placeholder={placeholder}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        style={{ width: 92, background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '9px 12px', fontSize: 14, color: 'var(--txt-0)', outline: 'none', fontFamily: 'var(--font-mono)' }} />
      <span style={{ fontSize: 12, color: 'var(--txt-2)' }}>{unit}</span>
      <button className="pressable ff-label" onClick={submit} style={{ marginLeft: 'auto', padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(0,240,255,0.35)', color: 'var(--accent)', fontSize: 11 }}>
        Enregistrer
      </button>
    </div>
  );
}

export function ProfileScreen({ profile, onReplayOnboarding, desktop = false }: { profile: Profile; onReplayOnboarding: () => void; desktop?: boolean }) {
  const data = useStore();
  const name = profile.name;
  const [selZone, setSelZone] = React.useState('shoulders');
  const [units, setUnits] = React.useState('kg / cm');
  const [focusMode, setFocusMode] = React.useState(false);
  const [notifs, setNotifs] = React.useState(true);

  const measures = measurementViews(data);
  const zone = measures.find((m) => m.key === selZone)!;
  const bw = data.bodyWeight;
  const currentWeight = bw.length ? bw[bw.length - 1].value : profile.weight;
  const weightDelta = bw.length >= 2 ? +(bw[bw.length - 1].value - bw[0].value).toFixed(1) : null;

  const ANGLES = ['Face', 'Profil G', 'Profil D', 'Dos'];

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingBottom: desktop ? 0 : 110 }}>
     <div className={desktop ? 'ff-fluid ff-stagger' : 'ff-stagger'} style={desktop ? { padding: '14px 32px 48px' } : undefined}>
      <header style={{ padding: desktop ? '6px 0 0' : '26px 20px 0', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="ff-display" style={{ width: 62, height: 62, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-2)', border: '1px solid var(--line)', fontSize: 20, fontWeight: 700, color: 'var(--accent)', boxShadow: '0 0 calc(20px * var(--glow)) rgba(0,240,255,0.18)' }}>
          {name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="ff-display" style={{ fontSize: 24, fontWeight: 700 }}>{name}</h1>
          <p style={{ fontSize: 12.5, color: 'var(--txt-1)', marginTop: 3 }}>{profile.goal} · {currentWeight} kg · {profile.height} cm</p>
        </div>
      </header>

      {/* photos de progression */}
      <section style={{ margin: desktop ? '24px 0 0' : '24px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className="ff-label">Photos de progression</span>
          <button className="pressable" aria-label="Prendre une photo" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, border: '1px solid var(--line)', color: 'var(--accent)', fontSize: 11.5, fontWeight: 600 }}>
            <FFIcon name="camera" size={14} /> Capturer
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {ANGLES.map((a) => (
            <div key={a} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div className="ff-placeholder" style={{ aspectRatio: '3/4', borderRadius: 10, border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FFIcon name="camera" size={16} color="var(--txt-2)" />
              </div>
              <span className="ff-label" style={{ fontSize: 9, textAlign: 'center' }}>{a}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--txt-2)', marginTop: 8 }}>Capture 4 angles aujourd’hui, puis compare au fil des semaines.</p>
      </section>

     <div style={desktop ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14, marginTop: 14, alignItems: 'start' } : undefined}>
      {/* mensurations */}
      <section className="ff-card" style={{ margin: desktop ? 0 : '20px 20px 0', padding: 18 }}>
        <div className="ff-label" style={{ marginBottom: 14 }}>Mensurations · cm</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {measures.map((m) => (
            <button key={m.key} className="pressable" onClick={() => setSelZone(m.key)} style={{
              padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              border: `1px solid ${selZone === m.key ? 'var(--accent)' : 'var(--line)'}`,
              background: selZone === m.key ? 'rgba(0,240,255,0.08)' : 'transparent',
              color: selZone === m.key ? 'var(--accent)' : 'var(--txt-1)',
            }}>{m.zone}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 14, minHeight: 56 }}>
          <div>
            <div className="ff-mono" style={{ fontSize: 34, fontWeight: 700 }}>{zone.current != null ? zone.current : '—'}<span style={{ fontSize: 14, color: 'var(--txt-1)' }}> cm</span></div>
            {zone.delta != null && (
              <div style={{ fontSize: 11.5, color: zone.delta >= 0 ? 'var(--accent-3)' : 'var(--accent-2)', marginTop: 4 }} className="ff-mono">
                {zone.delta >= 0 ? '▲' : '▼'} {Math.abs(zone.delta)} cm depuis le début
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            {zone.values.length >= 2 && <Sparkline points={zone.values} width={150} height={48} color={zone.key === 'waist' ? '#FF3D71' : '#00F0FF'} />}
          </div>
        </div>
        <AddValue placeholder={`${zone.zone}…`} unit="cm" onAdd={(v) => addMeasurement(zone.key, v)} />
      </section>

      {/* poids corporel */}
      <section className="ff-card" style={{ margin: desktop ? 0 : '14px 20px 0', padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 14 }}>
          <div>
            <div className="ff-label">Poids corporel</div>
            <div className="ff-mono" style={{ fontSize: 34, fontWeight: 700, marginTop: 6 }}>{currentWeight}<span style={{ fontSize: 14, color: 'var(--txt-1)' }}> kg</span></div>
            {weightDelta != null && (
              <div style={{ fontSize: 11.5, color: weightDelta >= 0 ? 'var(--accent-3)' : 'var(--accent-2)', marginTop: 4 }} className="ff-mono">
                {weightDelta >= 0 ? '▲' : '▼'} {Math.abs(weightDelta)} kg depuis le début
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            {bw.length >= 2 && <Sparkline points={bw.map((b) => b.value)} width={150} height={48} color="#39FF14" />}
          </div>
        </div>
        <AddValue placeholder="Poids…" unit="kg" onAdd={(v) => addBodyWeight(v)} />
      </section>
     </div>

      {/* paramètres */}
      <section className="ff-card" style={{ margin: desktop ? '14px 0 0' : '14px 20px 0', padding: '6px 18px' }}>
        {[
          { label: 'Unités', control: <Segmented options={['kg / cm', 'lbs / in']} value={units} onChange={setUnits} style={{ width: 170 }} /> },
          { label: 'Rappels (séance, protéines, sommeil)', control: <Toggle value={notifs} onChange={setNotifs} /> },
          { label: 'Mode sans distraction', control: <Toggle value={focusMode} onChange={setFocusMode} /> },
        ].map((row) => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontSize: 13.5, color: 'var(--txt-0)' }}>{row.label}</span>
            {row.control}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0' }}>
          <span style={{ fontSize: 13.5 }}>Exporter mes données</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {['JSON', 'CSV', 'PDF'].map((f) => (
              <button key={f} className="pressable ff-mono" style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 10.5, color: 'var(--txt-1)' }}>{f}</button>
            ))}
          </div>
        </div>
      </section>

      <div style={{ margin: desktop ? '18px 0 0' : '18px 20px 0', maxWidth: desktop ? 360 : undefined }}>
        <button className="pressable" onClick={onReplayOnboarding} style={{ width: '100%', padding: '15px', borderRadius: 14, border: '1px solid var(--line)', color: 'var(--txt-1)', fontSize: 13.5, fontWeight: 600, background: 'var(--bg-1)' }}>
          ↻ Revoir le splash & l’onboarding
        </button>
      </div>
     </div>
    </div>
  );
}
