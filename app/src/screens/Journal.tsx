/* FitForge — Journal (historique & analytics) */
import React from 'react';
import { FFIcon } from '../components/icons';
import { FFBadge, Segmented, ConsistencyHeatmap } from '../components/ui';
import * as FF from '../data/program';
import type { WeeklyVolume, LiftSeries, Day, SessionRecord } from '../data/types';

function VolumeBarChart({ data }: { data: WeeklyVolume[] }) {
  const max = Math.max(...data.map((d) => d.volume), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, height: 110 }}>
      {data.map((d) => (
        <div key={d.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{
            width: '100%', maxWidth: 22, borderRadius: 5,
            height: `${Math.max(3, (d.volume / max) * 100)}%`,
            background: d.volume ? 'linear-gradient(180deg, var(--accent), rgba(0,240,255,0.35))' : 'var(--bg-2)',
            boxShadow: d.volume ? '0 0 calc(10px * var(--glow)) rgba(0,240,255,0.2)' : 'none',
            transition: 'height var(--dur-slow) cubic-bezier(0.22,1,0.36,1)',
          }}></div>
          <span className="ff-mono" style={{ fontSize: 9, color: 'var(--txt-2)' }}>S{d.week}</span>
        </div>
      ))}
    </div>
  );
}

function LiftChart({ series, active }: { series: LiftSeries[]; active: Set<string> }) {
  const W = 320, H = 130;
  const visible = series.filter((s) => active.has(s.id) && s.points.length >= 2);
  const allVals = visible.flatMap((s) => s.points.map((p) => p.value));
  if (!allVals.length) return <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-2)', fontSize: 12 }}>Sélectionne un exercice</div>;
  const min = Math.min(...allVals) - 2, max = Math.max(...allVals) + 2;
  const maxWeek = 4;
  const px = (w: number) => 10 + ((w - 1) / (maxWeek - 1)) * (W - 20);
  const py = (v: number) => H - 18 - ((v - min) / (max - min)) * (H - 34);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#161616" strokeWidth="1" />)}
      {visible.map((s) => {
        // une valeur par semaine (la meilleure)
        const byWeek: Record<number, number> = {};
        s.points.forEach((p) => { byWeek[p.week] = Math.max(byWeek[p.week] || 0, p.value); });
        const pts = Object.entries(byWeek).map(([w, v]) => ({ w: +w, v }));
        const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${px(p.w).toFixed(1)},${py(p.v).toFixed(1)}`).join(' ');
        return (
          <g key={s.id}>
            <path d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p) => <circle key={p.w} cx={px(p.w)} cy={py(p.v)} r="3" fill="var(--bg-0)" stroke={s.color} strokeWidth="1.6" />)}
          </g>
        );
      })}
      {[1, 2, 3, 4].map((w) => <text key={w} x={px(w)} y={H - 4} textAnchor="middle" fill="#4A4A4A" fontSize="9" fontFamily="JetBrains Mono">S{w}</text>)}
    </svg>
  );
}

export function JournalScreen({ desktop = false }: { desktop?: boolean }) {
  const { weeklyVolume, liftSeries, weeks, history } = FF;
  const [period, setPeriod] = React.useState('Mois');
  const [active, setActive] = React.useState<Set<string>>(new Set(['dev-incline', 'squat-guide']));
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const periodWeeks = period === 'Semaine' ? 1 : period === 'Mois' ? 4 : period === '3 Mois' ? 12 : 12;
  const volData = weeklyVolume.slice(0, Math.max(4, Math.min(periodWeeks, 12)));

  const sessions: { day: Day; s: SessionRecord }[] = [];
  weeks.forEach((w) => w.days.forEach((d) => {
    const s = history[d.iso];
    if (s && s.status === 'completed') sessions.push({ day: d, s });
  }));
  sessions.reverse();

  const toggleLift = (id: string) => setActive((a) => { const s = new Set(a); s.has(id) ? s.delete(id) : s.add(id); return s; });

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingBottom: desktop ? 0 : 110 }}>
     <div className={desktop ? 'ff-fluid' : undefined} style={desktop ? { padding: '8px 32px 48px' } : undefined}>
      <header style={{ padding: desktop ? '18px 0 14px' : '26px 20px 14px' }}>
        <h1 className="ff-display" style={{ fontSize: 28, fontWeight: 700 }}>Journal</h1>
      </header>
      <div style={{ padding: desktop ? 0 : '0 20px', maxWidth: desktop ? 460 : undefined }}>
        <Segmented options={['Semaine', 'Mois', '3 Mois', 'Tout']} value={period} onChange={setPeriod} />
      </div>

     <div style={desktop ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14, marginTop: 16, alignItems: 'start' } : undefined}>
      <section className="ff-card" style={{ margin: desktop ? 0 : '16px 20px 0', padding: 18 }}>
        <div className="ff-label" style={{ marginBottom: 14 }}>Volume hebdomadaire · kg</div>
        <VolumeBarChart data={volData} />
      </section>

      <section className="ff-card" style={{ margin: desktop ? 0 : '14px 20px 0', padding: 18 }}>
        <div className="ff-label" style={{ marginBottom: 12 }}>Lifts clés · charge max</div>
        <LiftChart series={liftSeries} active={active} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {liftSeries.map((s) => (
            <button key={s.id} className="pressable" onClick={() => toggleLift(s.id)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999,
              border: `1px solid ${active.has(s.id) ? s.color : 'var(--line)'}`,
              background: active.has(s.id) ? `${s.color}14` : 'transparent',
              color: active.has(s.id) ? 'var(--txt-0)' : 'var(--txt-2)', fontSize: 11.5, fontWeight: 600,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color }}></span>
              {s.name}
            </button>
          ))}
        </div>
      </section>

      <section className="ff-card" style={{ margin: desktop ? 0 : '14px 20px 0', padding: 18 }}>
        <div className="ff-label" style={{ marginBottom: 14 }}>Consistance · 12 semaines</div>
        <ConsistencyHeatmap cell={15} gap={4} />
        <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 11, color: 'var(--txt-1)' }}>
          <span><span style={{ color: 'var(--accent-3)' }}>■</span> complétée</span>
          <span><span style={{ color: 'var(--accent-2)' }}>■</span> manquée</span>
          <span><span style={{ color: 'var(--accent)' }}>■</span> aujourd’hui</span>
        </div>
      </section>
     </div>

      <section style={{ margin: desktop ? '24px 0 0' : '22px 20px 0' }}>
        <div className="ff-label" style={{ marginBottom: 12 }}>Séances passées</div>
        <div style={desktop ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 10, alignItems: 'start' } : { display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sessions.map(({ day, s }) => {
            const isExp = expanded === day.iso;
            return (
              <div key={day.iso} className="ff-card">
                <button className="pressable" onClick={() => setExpanded(isExp ? null : day.iso)} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600 }}>{day.name}</div>
                    <div className="ff-mono" style={{ fontSize: 11, color: 'var(--txt-2)', marginTop: 3, textTransform: 'capitalize' }}>{FF.fmtLong(day.date)} · {s.duration} min</div>
                  </div>
                  {(s.volume ?? 0) > 0 && <span className="ff-mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{((s.volume ?? 0) / 1000).toFixed(1)} t</span>}
                  <FFIcon name="chevronD" size={14} color="var(--txt-2)" style={{ transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast)' }} />
                </button>
                {isExp && (
                  <div className="anim-fade-in" style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {(s.exercises ?? []).slice(0, 5).map((ex) => (
                      <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                        <span style={{ fontSize: 12.5, color: 'var(--txt-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</span>
                        <span className="ff-mono" style={{ fontSize: 11.5, color: 'var(--txt-0)', flexShrink: 0 }}>
                          {ex.sets.map((st) => st.weight ? `${st.weight}×${st.reps}` : st.reps).slice(0, 4).join(' · ')}
                        </span>
                      </div>
                    ))}
                    {s.prs && s.prs.length > 0 && (
                      <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {s.prs.slice(0, 3).map((pr, i) => (
                          <FFBadge key={i} color="var(--accent-3)" bg="rgba(57,255,20,0.08)">PR · {pr.exercise} {pr.next} kg</FFBadge>
                        ))}
                      </div>
                    )}
                    <button className="pressable ff-label" style={{ alignSelf: 'flex-start', marginTop: 6, padding: '8px 13px', borderRadius: 10, border: '1px solid var(--line)', color: 'var(--accent)', fontSize: 10.5 }}>
                      ↻ Refaire cette séance
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
     </div>
    </div>
  );
}
